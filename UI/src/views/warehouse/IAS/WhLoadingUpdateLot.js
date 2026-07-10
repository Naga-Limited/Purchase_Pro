import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLoader } from "../../../utility/hooks/useLoader";

import { Card, CardBody, CardHeader, CardTitle, FormGroup } from "reactstrap";
import { Button, Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../../forms/custom-form";
import { HrLine } from "../../common/HrLine";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { BASE_URL, apiBaseUrl, uploadandSaveImageUrl, uploadUrl, sapFileShare } from "../../../urlConstants";
import { errorToast, ShowToast } from "../common/appHelper";
import { apiPostMethod } from "../../../helper/axiosHelper";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";
import { AlignCenter } from "react-feather";
import Uploader from "../../Uploader";
import { isEmpty } from "lodash";

import { statusCode } from "../common/appHelper";


const WhLoadingUpdateLot = () => {
    let { showLoader, hideLoader } = useLoader();
    const [LoadedLot1, setLoadedLot1] = useState([]);
    const [LoadedLot2, setLoadedLot2] = useState([]);
    const [LoadedLot3, setLoadedLot3] = useState([]);

    const [POLineItem1, setPOLineItem1] = useState([]);
    const [POLineItem2, setPOLineItem2] = useState([]);
    const [POLineItem3, setPOLineItem3] = useState([]);

    const [VANumber, setVANumber] = useState("");
    const [validateForm, setvalidateForm] = useState(false);
    const [isOwnWb, setisOwnWb] = useState(false);
    const [attachedFiles, setAttachment] = useState({ first_weighment_attachment: {}, second_weighment_attachment: {} });
    const [ImgData, setImgData] = useState({});
    const [SendingWerks, setSendingWerks] = useState("");
    const [showMachineType, setShowMachineType] = useState({});
    const history = useHistory();

    let { id } = useParams();
    let refid = '';
    if (id) {
        refid = id.replace(":", "");

    }

    useEffect(() => { 

        


            document.getElementById("LooseWheat311").style.display = "none";
            document.getElementById("LooseWheat111").style.display = "none";
            document.getElementById("LooseWheat112").style.display = "none";
            document.getElementById("LooseWheat113").style.display = "none";
            document.getElementById("LooseWheat211").style.display = "none";
            document.getElementById("LooseWheat212").style.display = "none";
            document.getElementById("LooseWheat213").style.display = "none";
            document.getElementById("LooseWheat311").style.display = "none";
            document.getElementById("LooseWheat312").style.display = "none";
            document.getElementById("LooseWheat313").style.display = "none";
            document.getElementById("LooseWheat121").style.display = "none";
            document.getElementById("LooseWheat122").style.display = "none";
            document.getElementById("LooseWheat123").style.display = "none";
            document.getElementById("LooseWheat221").style.display = "none";
            document.getElementById("LooseWheat222").style.display = "none";
            document.getElementById("LooseWheat223").style.display = "none";
            document.getElementById("LooseWheat321").style.display = "none";
            document.getElementById("LooseWheat322").style.display = "none";
            document.getElementById("LooseWheat323").style.display = "none";
            document.getElementById("LooseWheat131").style.display = "none";
            document.getElementById("LooseWheat132").style.display = "none";
            document.getElementById("LooseWheat133").style.display = "none";
            document.getElementById("LooseWheat231").style.display = "none";
            document.getElementById("LooseWheat232").style.display = "none";
            document.getElementById("LooseWheat233").style.display = "none";
            document.getElementById("LooseWheat331").style.display = "none";
            document.getElementById("LooseWheat332").style.display = "none";
            document.getElementById("LooseWheat333").style.display = "none";


            document.getElementById("bagtype21").style.display = "none";
            document.getElementById("bagtype31").style.display = "none";
            document.getElementById("bagtype22").style.display = "none";
            document.getElementById("bagtype32").style.display = "none";
            document.getElementById("bagtype23").style.display = "none";
            document.getElementById("bagtype33").style.display = "none";

                       // PO Line Item Hidden poNo1

           document.getElementById("poNo1").style.display = "none";
           document.getElementById("poNo2").style.display = "none";

           // Lot Item Hidden  hiddenLotNo2

           document.getElementById("hiddenLotNo2").style.display = "none";
           document.getElementById("hiddenLotNo3").style.display = "none";
           
        
        getVADet(refid); 

        console.log("statusCode :", statusCode);
    }, [refid]);

    const form = useFormik({
        initialErrors: false,
        initialValues: {},
        validationSchema: getValidationSchema(),
    });

    const initialState = {};

   
    // useEffect(() => { getSegmentDet(form.values.POLineItem); }, [form.values.POLineItem]);
    // useEffect(() => {getPlanninglotDet(form.values.LoadedLotNo);}, [form.values.LoadedLotNo]);

    useEffect(()=>{
        form.values.NetWeight = parseFloat(form.values.SecondWeight?form.values.SecondWeight:0)-parseFloat(form.values.FirstWeight?form.values.FirstWeight:0);
    },[form.values.FirstWeight, form.values.SecondWeight]);

    const handleFileChange = (file, id) => {
        setAttachment((p) => ({
            ...p,
            [id]: file,
        }));
    };

    function getValidationSchema() {
        let schema = {};
        schema = {
            lastMileTransporter: validation.required(),
            freightChargesPerTon: validation.required(),
            loadingVendor: validation.required(),
            loadingChargesPerTon: validation.required(),
        };

        // console.log("schema", schema);

        return Yup.object().shape(schema);
    }
    const onBagTypeChange = (e, bagTypeId, machineTypeId) => {
        CalcBagCount(e, bagTypeId);

        const isLooseWheat =
            e?.value == "6" ;

        setShowMachineType(prev => ({
            ...prev,
            [bagTypeId]: isLooseWheat
        }));

        // clear machine type if not loose wheat
        if (!isLooseWheat) {
            form.setFieldValue(machineTypeId, "");
        }
    };


    const getSegmentDet = (e,PO_No, Iteration) => {
        const {value, label} =e;
        let fdata ={
            PO_No:PO_No.label,
            PO_Line_Item:e.label,
        }

        console.log("e :", e.label);

        showLoader();
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getSegmentDet', fdata)
            .then((response) => {
                const { data } = response;
                console.log("SEGMENT Details :", data);
                if (data.success) {
                    if (Iteration===1){
                        form.setValues({
                            ...form.values,
                            SegmentId1: data.results[0].SEG_ID,
                            Segment1: data.results[0].Segment,
                            WheatVariety1: data.results[0].WheatVariety,
                            POLineItem1:{value: e.value, label:e,label},
                        });
                        getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, Iteration); 
                    }else if (Iteration===2){
                        form.setValues({
                            ...form.values,
                            SegmentId2: data.results[0].SEG_ID,
                            Segment2: data.results[0].Segment,
                            WheatVariety2: data.results[0].WheatVariety,
                            POLineItem2:{value: e.value, label:e,label},
                        });
                        getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, Iteration); 
                    }else if (Iteration===3){
                        form.setValues({
                            ...form.values,
                            SegmentId3: data.results[0].SEG_ID,
                            Segment3: data.results[0].Segment,
                            WheatVariety3: data.results[0].WheatVariety,
                            POLineItem3:{value: e.value, label:e,label},
                        });
                        getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, Iteration); 
                    }
                   
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }


    const getSegmentDet_1 = (PO_Line_Item) => {

        form.setFieldValue('SegmentId1','');
        form.setFieldValue('Segment1','');
        form.setFieldValue('WheatVariety1','');
        form.setFieldValue('SegmentId2','');
        form.setFieldValue('Segment2','');
        form.setFieldValue('WheatVariety2','');
        form.setFieldValue('SegmentId3','');
        form.setFieldValue('Segment3','');
        form.setFieldValue('WheatVariety3','');

        const po = { ...form.values.PONumber }
        const { value, label } = po;
        let Po_No = po.value;
        let POLineItem_List = { ...PO_Line_Item };

        Object.keys(POLineItem_List).forEach((k) => {
            let fdata = {
                PO_No: Po_No,
                PO_Line: POLineItem_List[k].value,
            }

            showLoader();
            apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getSegmentDet', fdata)
                .then((response) => {
                    const { data } = response;
                    console.log("SEGMENT Details :", data);
                    if (data.success) {
                        if (k == 0) {
                            form.setValues({
                                ...form.values,
                                SegmentId1: data.results[0].SEG_ID,
                                Segment1: data.results[0].Segment,
                                WheatVariety1: data.results[0].WheatVariety

                                // SegmentId2:'',Segment2:'',WheatVariety2:'',
                                // SegmentId3:'',Segment3:'',WheatVariety3:''
                                
                            });
                            //getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, k); 

                        } else if (k == 1) {

                            form.setValues({
                                ...form.values,
                                SegmentId2: data.results[0].SEG_ID,
                                Segment2: data.results[0].Segment,
                                WheatVariety2: data.results[0].WheatVariety
                                
                                //SegmentId3:'',Segment3:'',WheatVariety3:''
                            });
                            //getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, k);

                        } else if (k == 2) {

                            form.setValues({
                                ...form.values,
                                SegmentId3: data.results[0].SEG_ID,
                                Segment3: data.results[0].Segment,
                                WheatVariety3: data.results[0].WheatVariety
                            });
                            //getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, k);

                        }

                        
                    } else {
                        errorToast("Data Not Found !!!");
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        });

        getLotBySegment(POLineItem_List , Po_No);
    }

    const getLotBySegment_1 = (POLineItem, PONumber) => {
        // console.log("getLotBySegment 123 ", POLineItem[0].value);
        if (isEmpty(POLineItem)){return}
        let fdata = {
            POLineItem1: POLineItem[0]?POLineItem[0].value:0,
            POLineItem2: POLineItem[1]?POLineItem[1].value:0,
            POLineItem3: POLineItem[2]?POLineItem[2].value:0,
            PONumber: PONumber
        };

        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getLotBySegment', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getLotBySegment', fdata)
            .then((response) => {
                const { data } = response;
                console.log("getLotBySegment :",data.results);
                if (data.success) {
                    setLoadedLot1(data.results);
                    setLoadedLot2(data.results);
                    setLoadedLot3(data.results);
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const getLotBySegment = (SegmentId, PlantId, Iteration) => {
        // console.log("getLotBySegment", SegmentId);

        let fdata = {
            SegmentId: SegmentId,
            PlantId: PlantId
        };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getLotBySegment', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getLotBySegment', fdata)
            .then((response) => {
                const { data } = response;
                console.log("getLotBySegment :", data.results);
                if (data.success) {
                    if (Iteration == 1) {
                        setLoadedLot1(data.results);
                    } else if (Iteration == 2) {
                        setLoadedLot2(data.results);
                    } else if (Iteration == 3) {
                        setLoadedLot3(data.results);
                    }
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const getPlanninglotDet = (PlanningLot, Segment_Id, Iteration) => {
        const { value, label } = PlanningLot;
        let fdata = {
            PlanningLot_Id: PlanningLot.value,
            Wheat_Id: Segment_Id
        };

        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getPlanninglotDet', fdata)
        // apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getPlanninglotDet_1', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getPlanninglotDet', fdata)
            .then((response) => {
                const { data } = response;

                if (data.success) {
                    // if (data.results[0].planqty === null || data.results[0].planqty === 0) {
                    //     errorToast("Selected LOT not available in Movement Plan !!!");
                    //     return;
                    // }

                    if (Iteration == 1) {
                        
                        form.setValues({
                            ...form.values,
                            ReceivingBin:{value: data.results[0].BinId, label:data.results[0].BinName},

                            LoadedLotNo1: { value: PlanningLot.value, label: PlanningLot.label },
                            LotNo1: data.results[0].lotno,
                            PlanningQty1: data.results[0].planqty === null ? '0' : data.results[0].planqty,
                            SAPQty1: data.results[0].SAP_Qty,

                            SendingStorageLocation: data.results[0].sl_LGORT
                        });

                    } else if (Iteration == 2) {
                        form.setValues({
                            ...form.values,
                            LoadedLotNo2: { value: PlanningLot.value, label: PlanningLot.label },
                            LotNo2: data.results[0].lotno,
                            PlanningQty2: data.results[0].planqty === null ? '0' : data.results[0].planqty,
                            SAPQty2: data.results[0].SAP_Qty
                        });

                    } else if (Iteration == 3) {
                        form.setValues({
                            ...form.values,
                            LoadedLotNo3: { value: PlanningLot.value, label: PlanningLot.label },
                            LotNo3: data.results[0].lotno,
                            PlanningQty3: data.results[0].planqty === null ? '0' : data.results[0].planqty,
                            SAPQty3: data.results[0].SAP_Qty
                        });
                    }
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const onchangeBagCutting = (e, Vendor, Charges, Bags) => {
        const { value, label } = e;
        let CuttingCharges = e.label.split("|")[1];
        let BagsCount = form.values[Bags];
        let TotalBagChares = parseFloat(BagsCount)* parseFloat(CuttingCharges);

        // console.log("BagsCount ", BagsCount);
        // console.log("FORM ",form.values);

        form.setValues({
            ...form.values,
            [Vendor]: { label: e.label, value: e.value },
            [Charges]: TotalBagChares
            
        });
    }
    const toggleMachineType = (show, domId, formField) => {

        // 🚫 Do not show Machine Type if Sending Plant is FR01
        if (form.values.SendingPlant == "FR01" && form.values.SendingPlant == "8001") {
            var el = document.getElementById(domId);
            if (el) {
                el.style.display = "none";
            }
            form.setFieldValue(formField, "");
            return;
        }

        var el = document.getElementById(domId);
        if (el) {
            el.style.display = show ? "" : "none";
        }

        if (!show) {
            form.setFieldValue(formField, "");
        }
    };



    const CalcBagCount = (e, Column_Id,) => {

        const { value, label } = e;
        if (e.label == "Loose Wheat|0.00" || e.label == "JCB Loose Wheat|0.00") {
            if (Column_Id === "BagType1Lot1") {
                form.setFieldValue("BagType1Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat111").style.display = "";
                document.getElementById("LooseWheat112").style.display = "";
                document.getElementById("LooseWheat113").style.display = "";
            } else if (Column_Id === "BagType2Lot1") {
                form.setFieldValue("BagType2Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat211").style.display = "";
                document.getElementById("LooseWheat212").style.display = "";
                document.getElementById("LooseWheat213").style.display = "";
            } else if (Column_Id === "BagType3Lot1") {
                form.setFieldValue("BagType3Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat311").style.display = "";
                document.getElementById("LooseWheat312").style.display = "";
                document.getElementById("LooseWheat313").style.display = "";
            } else if (Column_Id === "BagType1Lot2") {
                form.setFieldValue("BagType1Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat121").style.display = "";
                document.getElementById("LooseWheat122").style.display = "";
                document.getElementById("LooseWheat123").style.display = "";
            } else if (Column_Id === "BagType2Lot2") {

                form.setFieldValue("BagType2Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat221").style.display = "";
                document.getElementById("LooseWheat222").style.display = "";
                document.getElementById("LooseWheat223").style.display = "";

            } else if (Column_Id === "BagType3Lot2") {

                form.setFieldValue("BagType3Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat321").style.display = "";
                document.getElementById("LooseWheat322").style.display = "";
                document.getElementById("LooseWheat323").style.display = "";

            } else if (Column_Id === "BagType1Lot3") {

                form.setFieldValue("BagType1Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat131").style.display = "";
                document.getElementById("LooseWheat132").style.display = "";
                document.getElementById("LooseWheat133").style.display = "";

            } else if (Column_Id === "BagType2Lot3") {

                form.setFieldValue("BagType2Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat231").style.display = "";
                document.getElementById("LooseWheat232").style.display = "";
                document.getElementById("LooseWheat233").style.display = "";

            } else if (Column_Id === "BagType3Lot3") {

                form.setFieldValue("BagType3Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat331").style.display = "";
                document.getElementById("LooseWheat332").style.display = "";
                document.getElementById("LooseWheat333").style.display = "";
            }
        } else {

            if (Column_Id === "BagType1Lot1") {

                // form.setValues({
                //     ...form.values,
                //     BagType1Lot1: { label: e.label, value: e.value },
                //     BagCuttingType1Lot1: { label: '', value: '' },
                //     BagCuttingVendor1Lot1: { label: '', value: '' },
                //     Charges1Lot1: ''
                // });

                form.setFieldValue("BagType1Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat111").style.display = "none";
                document.getElementById("LooseWheat112").style.display = "none";
                document.getElementById("LooseWheat113").style.display = "none";

            } else if (Column_Id === "BagType2Lot1") {

                // form.setValues({
                //     ...form.values,
                //     BagType2Lot1: { label: e.label, value: e.value },
                //     BagCuttingType2Lot1: { label: '', value: '' },
                //     BagCuttingVendor2Lot1: { label: '', value: '' },
                //     Charges2Lot1: ''
                // });

                form.setFieldValue("BagType2Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat211").style.display = "none";
                document.getElementById("LooseWheat212").style.display = "none";
                document.getElementById("LooseWheat213").style.display = "none";

            } else if (Column_Id === "BagType3Lot1") {

                // form.setValues({
                //     ...form.values,
                //     BagType3Lot1: { label: e.label, value: e.value },
                //     BagCuttingType3Lot1: { label: '', value: '' },
                //     BagCuttingVendor3Lot1: { label: '', value: '' },
                //     Charges3Lot1: '0'
                // });

                form.setFieldValue("BagType3Lot1", { label: e.label, value: e.value });
                document.getElementById("LooseWheat311").style.display = "none";
                document.getElementById("LooseWheat312").style.display = "none";
                document.getElementById("LooseWheat313").style.display = "none";

            } else if (Column_Id === "BagType1Lot2") {

                // form.setValues({
                //     ...form.values,
                //     BagType1Lot2: { label: e.label, value: e.value },
                //     BagCuttingType1Lot2: { label: '', value: '' },
                //     BagCuttingVendor1Lot2: { label: '', value: '' },
                //     Charges1Lot2: ''
                // });

                form.setFieldValue("BagType1Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat121").style.display = "none";
                document.getElementById("LooseWheat122").style.display = "none";
                document.getElementById("LooseWheat123").style.display = "none";

            } else if (Column_Id === "BagType2Lot2") {

                // form.setValues({
                //     ...form.values,
                //     BagType2Lot2: { label: e.label, value: e.value },
                //     BagCuttingType2Lot2: { label: '', value: '' },
                //     BagCuttingVendor2Lot2: { label: '', value: '' },
                //     Charges2Lot2: ''
                // });

                form.setFieldValue("BagType2Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat221").style.display = "none";
                document.getElementById("LooseWheat222").style.display = "none";
                document.getElementById("LooseWheat223").style.display = "none";

            } else if (Column_Id === "BagType3Lot2") {

                // form.setValues({
                //     ...form.values,
                //     BagType3Lot2: { label: e.label, value: e.value },
                //     BagCuttingType3Lot2: { label: '', value: '' },
                //     BagCuttingVendor3Lot2: { label: '', value: '' },
                //     Charges3Lot2: ''
                // });

                form.setFieldValue("BagType3Lot2", { label: e.label, value: e.value });
                document.getElementById("LooseWheat321").style.display = "none";
                document.getElementById("LooseWheat322").style.display = "none";
                document.getElementById("LooseWheat323").style.display = "none";

            } else if (Column_Id === "BagType1Lot3") {

                // form.setValues({
                //     ...form.values,
                //     BagType1Lot3: { label: e.label, value: e.value },
                //     BagCuttingType1Lot3: { label: '', value: '' },
                //     BagCuttingVendor1Lot3: { label: '', value: '' },
                //     Charges1Lot3: ''
                // });

                form.setFieldValue("BagType1Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat131").style.display = "none";
                document.getElementById("LooseWheat132").style.display = "none";
                document.getElementById("LooseWheat133").style.display = "none";

            } else if (Column_Id === "BagType2Lot3") {

                // form.setValues({
                //     ...form.values,
                //     BagType2Lot3: { label: e.label, value: e.value },
                //     BagCuttingType2Lot3: { label: '', value: '' },
                //     BagCuttingVendor2Lot3: { label: '', value: '' },
                //     Charges2Lot3: ''
                // });

                form.setFieldValue("BagType2Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat231").style.display = "none";
                document.getElementById("LooseWheat232").style.display = "none";
                document.getElementById("LooseWheat233").style.display = "none";

            } else if (Column_Id === "BagType3Lot3") {

                // form.setValues({
                //     ...form.values,
                //     BagType3Lot3: { label: e.label, value: e.value },
                //     BagCuttingType3Lot3: { label: '', value: '' },
                //     BagCuttingVendor3Lot3: { label: '', value: '' },
                //     Charges3Lot3: ''
                // });

                form.setFieldValue("BagType3Lot3", { label: e.label, value: e.value });
                document.getElementById("LooseWheat331").style.display = "none";
                document.getElementById("LooseWheat332").style.display = "none";
                document.getElementById("LooseWheat333").style.display = "none";
            }
        }

        let BagWt1 = 0;
        let BagType1Lot1 = Column_Id === "BagType1Lot1" ? e.label : form.values.BagType1Lot1 ? form.values.BagType1Lot1.label : "";
        if (BagType1Lot1) {
            BagWt1 = BagType1Lot1.split("|")[1];
            BagWt1 = BagWt1.replace('KGs', '');
        }

        let BagWt2 = 0;
        let BagType2Lot1 = Column_Id === "BagType2Lot1" ? e.label : form.values.BagType2Lot1 ? form.values.BagType2Lot1.label : "";
        if (BagType2Lot1) {
            BagWt2 = BagType2Lot1.split("|")[1];
            BagWt2 = BagWt2.replace('KGs', '');
        }

        let BagWt3 = 0;
        let BagType3Lot1 = Column_Id === "BagType3Lot1" ? e.label : form.values.BagType3Lot1 ? form.values.BagType3Lot1.label : "";
        if (BagType3Lot1) {
            BagWt3 = BagType3Lot1.split("|")[1];
            BagWt3 = BagWt3.replace('KGs', '');
        }

        let BagWt4 = 0;
        let BagType1Lot2 = Column_Id === "BagType1Lot2" ? e.label : form.values.BagType1Lot2 ? form.values.BagType1Lot2.label : "";
        if (BagType1Lot2) {
            BagWt4 = BagType1Lot2.split("|")[1];
            BagWt4 = BagWt4.replace('KGs', '');
        }

        let BagWt5 = 0;
        let BagType2Lot2 = Column_Id === "BagType2Lot2" ? e.label : form.values.BagType2Lot2 ? form.values.BagType2Lot2.label : "";
        if (BagType2Lot2) {
            BagWt5 = BagType2Lot2.split("|")[1];
            BagWt5 = BagWt5.replace('KGs', '');
        }

        let BagWt6 = 0;
        let BagType3Lot2 = Column_Id === "BagType3Lot2" ? e.label : form.values.BagType3Lot2 ? form.values.BagType3Lot2.label : "";
        if (BagType3Lot2) {
            BagWt6 = BagType3Lot2.split("|")[1];
            BagWt6 = BagWt6.replace('KGs', '');
        }

        let BagWt7 = 0;
        let BagType1Lot3 = Column_Id === "BagType1Lot3" ? e.label : form.values.BagType1Lot3 ? form.values.BagType1Lot3.label : "";
        if (BagType1Lot3) {
            BagWt7 = BagType1Lot3.split("|")[1];
            BagWt7 = BagWt7.replace('KGs', '');
        }

        let BagWt8 = 0;
        let BagType2Lot3 = Column_Id === "BagType2Lot3" ? e.label : form.values.BagType2Lot3 ? form.values.BagType2Lot3.label : "";
        if (BagType2Lot3) {
            BagWt8 = BagType2Lot3.split("|")[1];
            BagWt8 = BagWt8.replace('KGs', '');
        }

        let BagWt9 = 0;
        let BagType3Lot3 = Column_Id === "BagType3Lot3" ? e.label : form.values.BagType3Lot3 ? form.values.BagType3Lot3.label : "";
        if (BagType3Lot3) {
            BagWt9 = BagType3Lot3.split("|")[1];
            BagWt9 = BagWt9.replace('KGs', '');
        }

        //Lot 1 => 3 Bag Types
        let NoofBags1Lot1 = Column_Id === "NoofBags1Lot1" ? e.target.value?e.target.value:"0" : form.values.NoofBags1Lot1 ? form.values.NoofBags1Lot1 : 0;
        let NoofBags2Lot1 = Column_Id === "NoofBags2Lot1" ? e.target.value?e.target.value:"0" : form.values.NoofBags2Lot1 ? form.values.NoofBags2Lot1 : 0;
        let NoofBags3Lot1 = Column_Id === "NoofBags3Lot1" ? e.target.value?e.target.value:"0" : form.values.NoofBags3Lot1 ? form.values.NoofBags3Lot1 : 0;

        //Lot 2 => 3 Bag Types
        let NoofBags1Lot2 = Column_Id === "NoofBags1Lot2" ? e.target.value?e.target.value:"0" : form.values.NoofBags1Lot2 ? form.values.NoofBags1Lot2 : 0;
        let NoofBags2Lot2 = Column_Id === "NoofBags2Lot2" ? e.target.value?e.target.value:"0" : form.values.NoofBags2Lot2 ? form.values.NoofBags2Lot2 : 0;
        let NoofBags3Lot2 = Column_Id === "NoofBags3Lot2" ? e.target.value?e.target.value:"0" : form.values.NoofBags3Lot2 ? form.values.NoofBags3Lot2 : 0;

        //Lot 3 => 3 Bag Types
        let NoofBags1Lot3 = Column_Id === "NoofBags1Lot3" ? e.target.value?e.target.value:"0" : form.values.NoofBags1Lot3 ? form.values.NoofBags1Lot3 : 0;
        let NoofBags2Lot3 = Column_Id === "NoofBags2Lot3" ? e.target.value?e.target.value:"0" : form.values.NoofBags2Lot3 ? form.values.NoofBags2Lot3 : 0;
        let NoofBags3Lot3 = Column_Id === "NoofBags3Lot3" ? e.target.value?e.target.value:"0" : form.values.NoofBags3Lot3 ? form.values.NoofBags3Lot3 : 0;

        let BagCount_Lot1 = parseFloat(NoofBags1Lot1) + parseFloat(NoofBags2Lot1) + parseFloat(NoofBags3Lot1);
        let BagCount_Lot2 = parseFloat(NoofBags1Lot2) + parseFloat(NoofBags2Lot2) + parseFloat(NoofBags3Lot2);
        let BagCount_Lot3 = parseFloat(NoofBags1Lot3) + parseFloat(NoofBags2Lot3) + parseFloat(NoofBags3Lot3);

        let TotalBagCount = parseFloat(BagCount_Lot1) + parseFloat(BagCount_Lot2) + parseFloat(BagCount_Lot3);

        let GunnyWt_Lot1 = parseFloat(NoofBags1Lot1 * BagWt1) + parseFloat(NoofBags2Lot1 * BagWt2) + parseFloat(NoofBags3Lot1 * BagWt3);
        let GunnyWt_Lot2 = parseFloat(NoofBags1Lot2 * BagWt4) + parseFloat(NoofBags2Lot2 * BagWt5) + parseFloat(NoofBags3Lot2 * BagWt6);
        let GunnyWt_Lot3 = parseFloat(NoofBags1Lot3 * BagWt7) + parseFloat(NoofBags2Lot3 * BagWt8) + parseFloat(NoofBags3Lot3 * BagWt9);

        let TotalGunnyWt = parseFloat(GunnyWt_Lot1) + parseFloat(GunnyWt_Lot2) + parseFloat(GunnyWt_Lot3);
        TotalGunnyWt = TotalGunnyWt.toFixed(3);

        let NetWt = form.values.NetWeight ? form.values.NetWeight : 0;
        let GunnyLessWt = parseFloat(NetWt) - parseFloat(TotalGunnyWt);
        GunnyLessWt = GunnyLessWt.toFixed(3);

        if (Column_Id === "BagType1Lot1" || Column_Id === "BagType2Lot1" || Column_Id === "BagType3Lot1" ||
            Column_Id === "BagType1Lot2" || Column_Id === "BagType2Lot2" || Column_Id === "BagType3Lot2" ||
            Column_Id === "BagType1Lot3" || Column_Id === "BagType2Lot3" || Column_Id === "BagType3Lot3") {
            form.setValues({
                ...form.values,
                [Column_Id]: { label: e.label, value: e.value },
                NetWeight: NetWt,
                GunnylessWeight: GunnyLessWt,
                TotalBags: TotalBagCount,
                GunnyWeight: TotalGunnyWt
            });
        } else if (Column_Id === "NoofBags1Lot1" || Column_Id === "NoofBags2Lot1" || Column_Id === "NoofBags3Lot1" ||
            Column_Id === "NoofBags1Lot2" || Column_Id === "NoofBags2Lot2" || Column_Id === "NoofBags3Lot2" ||
            Column_Id === "NoofBags1Lot3" || Column_Id === "NoofBags2Lot3" || Column_Id === "NoofBags3Lot3") {
            form.setValues({
                ...form.values,
                [Column_Id]: e.target.value,
                NetWeight: NetWt,
                GunnylessWeight: GunnyLessWt,
                TotalBags: TotalBagCount,
                GunnyWeight: TotalGunnyWt
            });
        }
        
        form.values.BagCuttingVendor1Lot1 && form.setFieldValue('Charges1Lot1', NoofBags1Lot1 * form.values.BagCuttingVendor1Lot1.label.split("|")[1]);
        form.values.BagCuttingVendor2Lot1 && form.setFieldValue('Charges2Lot1', NoofBags2Lot1 * form.values.BagCuttingVendor2Lot1.label.split("|")[1]);
        form.values.BagCuttingVendor3Lot1 && form.setFieldValue('Charges3Lot1', NoofBags3Lot1 * form.values.BagCuttingVendor3Lot1.label.split("|")[1]);

        form.values.BagCuttingVendor1Lot2 && form.setFieldValue('Charges1Lot2', NoofBags1Lot2 * form.values.BagCuttingVendor1Lot2.label.split("|")[1]);
        form.values.BagCuttingVendor2Lot2 && form.setFieldValue('Charges2Lot2', NoofBags2Lot2 * form.values.BagCuttingVendor2Lot2.label.split("|")[1]);
        form.values.BagCuttingVendor3Lot2 && form.setFieldValue('Charges3Lot2', NoofBags3Lot2 * form.values.BagCuttingVendor3Lot2.label.split("|")[1]);

        form.values.BagCuttingVendor1Lot3 && form.setFieldValue('Charges1Lot3', NoofBags1Lot3 * form.values.BagCuttingVendor1Lot3.label.split("|")[1]);
        form.values.BagCuttingVendor2Lot3 && form.setFieldValue('Charges2Lot3', NoofBags2Lot3 * form.values.BagCuttingVendor2Lot3.label.split("|")[1]);
        form.values.BagCuttingVendor3Lot3 && form.setFieldValue('Charges3Lot3', NoofBags3Lot3 * form.values.BagCuttingVendor3Lot3.label.split("|")[1]);
       const isLoose =
    e.label === "Loose Wheat|0.00" 

switch (Column_Id) {

    /* LOT 1 */
    case "BagType1Lot1":
        toggleMachineType(isLoose, "MachineType111", "MachineType1Lot1");
        break;
    case "BagType2Lot1":
        toggleMachineType(isLoose, "MachineType211", "MachineType2Lot1");
        break;
    case "BagType3Lot1":
        toggleMachineType(isLoose, "MachineType311", "MachineType3Lot1");
        break;

    /* LOT 2 */
    case "BagType1Lot2":
        toggleMachineType(isLoose, "MachineType121", "MachineType1Lot2");
        break;
    case "BagType2Lot2":
        toggleMachineType(isLoose, "MachineType221", "MachineType2Lot2");
        break;
    case "BagType3Lot2":
        toggleMachineType(isLoose, "MachineType321", "MachineType3Lot2");
        break;

    /* LOT 3 */
    case "BagType1Lot3":
        toggleMachineType(isLoose, "MachineType131", "MachineType1Lot3");
        break;
    case "BagType2Lot3":
        toggleMachineType(isLoose, "MachineType231", "MachineType2Lot3");
        break;
    case "BagType3Lot3":
        toggleMachineType(isLoose, "MachineType331", "MachineType3Lot3");
        break;

    default:
        break;
}

}
    

    const getVADet = (id) => {
        console.log("getVADet", id);

        let fdata = { ID: id };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getVADetails', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getVADetails', fdata)
            .then((response) => {
                const { data } = response;
                console.log("VA Details :",data.results);
                if (data.success) {
                    form.setValues({
                        VANumber: data.results[0].ZVA_NUMBER,
                        TruckNumber: data.results[0].TRUCK_NO,
                        DriverNumber: data.results[0].DRIVER_NO
                    });
                    setVANumber("[ VA No : " + data.results[0].ZVA_NUMBER + " ]");
                    setSendingWerks(data.results[0].PLANT_ID);

                    setisOwnWb(false);
                    document.getElementById("outsideWB").style.display = "";
                    if (data.results[0].WbType === "1") {
                    setisOwnWb(true);
                        document.getElementById("outsideWB").style.display = "none";
                    }

                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const get_ias_PO_Data = (e) => {

        console.log("get_ias_PO_Data");

        const { value, label } = e;
        let fdata = { PO_Id: e.value };
        let initState = "";
        var Segment = [];
        var Segment_Id = [];

        //form.setFieldValue('PO_LineItem','');
        setPOLineItem1(initState);
        setPOLineItem2(initState);
        setPOLineItem3(initState);


        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getPODetails', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getPODetails', fdata)
            .then((response) => {
                const { data } = response;

                console.log("PO Details :",data.results);

                let i =0;
                let tmpOptions = [];
                if (data.success) {

                    for(i=0;i<data.results.length;i++){
                        tmpOptions.push({value: data.results[i].PoLineItem, label: data.results[i].PoLineItem});
                    }
                    
                    setPOLineItem1(tmpOptions);
                    setPOLineItem2(tmpOptions);
                    setPOLineItem3(tmpOptions);

                    form.setValues({
                        ...form.values,
                        SendingPlant: data.results[0].SendingPlant,
                        SendingStorageLocation: data.results[0].SendingStorageLocation,
                        ReceivingPlant: data.results[0].ReceivingPlant,
                        ReceivingStorageLocation: data.results[0].ReceivingStorageLoc,
                        FreightCharges:data.results[0].Freight_Charges,
                        LoadingCharges:data.results[0].Loading_Charges,
                        Freight_Vendor:data.results[0].Freight_Vendor
                    });
                
                    form.setFieldValue('PONumber', { value: e.value, label: e.label });
                    getVendorCode(data.results[0],e)
                    //getLoadedLot(Segment[0],Segment[1],Segment[2]);
                    if (isOwnWb){
                        getWeight(form.values.VANumber);
                    }
                // })
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    const getLoadedLot = (S1, S2, S3) => {
        let fdata = { S1, S2, S3 }

        console.log("fdata :", fdata);
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getLotNumberBySegment', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getLotNumberBySegment', fdata)
            .then((response) => {
                const { data } = response;

                console.log("Segment Details :", data.results);
                if (data.success) {
                    setLoadedLot1(data.results);
                } else {
                    errorToast("Update Failed !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const getWeight = (va_number) => {
        let fdata = { VANO: va_number }
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getWeight', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getWeight', fdata)
            .then((response) => {
                const { data } = response;
                // console.log("va_number :", va_number);
                // console.log("Weight Details :",data.results);

                if (data.success) {
                    form.setFieldValue('FirstWeight', data.results[0].FirstWeight);
                    form.setFieldValue('SecondWeight', data.results[0].SecondWeight);
                    let DiffWeight = 0;
                    DiffWeight = parseFloat(data.results[0].SecondWeight) - parseFloat(data.results[0].FirstWeight);
                    form.setFieldValue('NetWeight', DiffWeight);
                } else {
                    errorToast("Update Failed !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const Save_PO_Details = (e) => {
        let fdata = {
            PO_No: form.values.PONumber.label,

            POLineItemid: form.values.POLineItem.value,
            POLineItem: form.values.POLineItem.label,

            VANumber: form.values.VANumber,
            TruckNumber: form.values.TruckNumber,
            DriverNumber: form.values.DriverNumber,
            ReceivingBinid: form.values.ReceivingBin.value,
            ReceivingBin: form.values.ReceivingBin.label,

            LastMileTransportid: form.values.LastMileTransport.value,
            LastMileTransport: form.values.LastMileTransport.label,

            FreightCharges: form.values.FreightCharges,

            LoadingVendorid: form.values.LoadingVendor.value,
            LoadingVendor: form.values.LoadingVendor.label,

            LoadingCharges: form.values.LoadingCharges,
            Segment1: form.values.Segment1,
            WheatVariety1: form.values.WheatVariety1,
            Segment2: form.values.Segment2,
            WheatVariety2: form.values.WheatVariety2,
            Segment3: form.values.Segment3,
            WheatVariety3: form.values.WheatVariety3,

            SendingPlant: form.values.SendingPlant,
            SendingStorageLocation: form.values.SendingStorageLocation,

            ReceivingPlant: form.values.ReceivingPlant,
            ReceivingStorageLocation: form.values.ReceivingStorageLocation,

            FirstWeight: form.values.FirstWeight,
            SecondWeight: form.values.SecondWeight,
            NetWeight: form.values.NetWeight,
            GunnyWeight: form.values.GunnyWeight,
            GunnylessWeight: form.values.GunnylessWeight,

            LoadedLotNoid: form.values.LoadedLotNo ? form.values.LoadedLotNo.value : 0,
            LoadedLotNo: form.values.LoadedLotNo ? form.values.LoadedLotNo.label : "",

            BagType1Lot1id: form.values.BagType1Lot1 ? form.values.BagType1Lot1.value : 0,
            BagType1Lot1: form.values.BagType1Lot1 ? form.values.BagType1Lot1.label : "",
            NoofBags1Lot1: form.values.NoofBags1Lot1,
            BagCuttingType1Lot1id: form.values.BagCuttingType1Lot1 ? form.values.BagCuttingType1Lot1.value : 0,
            BagCuttingType1Lot1: form.values.BagCuttingType1Lot1 ? form.values.BagCuttingType1Lot1.label : "",
            BagCuttingVendor1Lot1id: form.values.BagCuttingVendor1Lot1 ? form.values.BagCuttingVendor1Lot1.value : 0,
            BagCuttingVendor1Lot1: form.values.BagCuttingVendor1Lot1 ? form.values.BagCuttingVendor1Lot1.label : "",
            Charges1Lot1: form.values.Charges1Lot1,

            BagType2Lot1id: form.values.BagType2Lot1 ? form.values.BagType2Lot1.value : 0,
            BagType2Lot1: form.values.BagType2Lot1 ? form.values.BagType2Lot1.label : "",
            NoofBags2Lot1: form.values.NoofBags2Lot1,
            BagCuttingType2Lot1id: form.values.BagCuttingType2Lot1 ? form.values.BagCuttingType2Lot1.value : 0,
            BagCuttingType2Lot1: form.values.BagCuttingType2Lot1 ? form.values.BagCuttingType2Lot1.label : "",
            BagCuttingVendor2Lot1id: form.values.BagCuttingVendor2Lot1 ? form.values.BagCuttingVendor2Lot1.value : 0,
            BagCuttingVendor2Lot1: form.values.BagCuttingVendor2Lot1 ? form.values.BagCuttingVendor2Lot1.label : "",
            Charges2Lot1: form.values.Charges2Lot1,

            BagType3Lot1id: form.values.BagType3Lot1 ? form.values.BagType3Lot1.value : 0,
            BagType3Lot1: form.values.BagType3Lot1 ? form.values.BagType3Lot1.label : "",
            NoofBags3Lot1: form.values.NoofBags3Lot1,
            BagCuttingType3Lot1id: form.values.BagCuttingType3Lot1 ? form.values.BagCuttingType3Lot1.value : 0,
            BagCuttingType3Lot1: form.values.BagCuttingType3Lot1 ? form.values.BagCuttingType3Lot1.label : "",
            BagCuttingVendor3Lot1id: form.values.BagCuttingVendor3Lot1 ? form.values.BagCuttingVendor3Lot1.value : 0,
            BagCuttingVendor3Lot1: form.values.BagCuttingVendor3Lot1 ? form.values.BagCuttingVendor3Lot1.label : "",
            Charges3Lot1: form.values.Charges3Lot1,

            BagType1Lot2id: form.values.BagType1Lot2 ? form.values.BagType1Lot2.value : 0,
            BagType1Lot2: form.values.BagType1Lot2 ? form.values.BagType1Lot2.label : "",
            NoofBags1Lot2: form.values.NoofBags1Lot2,
            BagCuttingType1Lot2id: form.values.BagCuttingType1Lot2 ? form.values.BagCuttingType1Lot2.value : 0,
            BagCuttingType1Lot2: form.values.BagCuttingType1Lot2 ? form.values.BagCuttingType1Lot2.label : "",
            BagCuttingVendor1Lot2id: form.values.BagCuttingVendor1Lot2 ? form.values.BagCuttingVendor1Lot2.value : 0,
            BagCuttingVendor1Lot2: form.values.BagCuttingVendor1Lot2 ? form.values.BagCuttingVendor1Lot2.label : "",
            Charges1Lot2: form.values.Charges1Lot2,

            BagType2Lot2id: form.values.BagType2Lot2 ? form.values.BagType2Lot2.value : 0,
            BagType2Lot2: form.values.BagType2Lot2 ? form.values.BagType2Lot2.label : "",
            NoofBags2Lot2: form.values.NoofBags2Lot2,
            BagCuttingType2Lot2id: form.values.BagCuttingType2Lot2 ? form.values.BagCuttingType2Lot2.value : 0,
            BagCuttingType2Lot2: form.values.BagCuttingType2Lot2 ? form.values.BagCuttingType2Lot2.label : "",
            BagCuttingVendor2Lot2id: form.values.BagCuttingVendor2Lot2 ? form.values.BagCuttingVendor2Lot2.value : 0,
            BagCuttingVendor2Lot2: form.values.BagCuttingVendor2Lot2 ? form.values.BagCuttingVendor2Lot2.label : "",
            Charges2Lot2: form.values.Charges2Lot2,

            BagType3Lot2id: form.values.BagType3Lot2 ? form.values.BagType3Lot2.value : 0,
            BagType3Lot2: form.values.BagType3Lot2 ? form.values.BagType3Lot2.label : "",
            NoofBags3Lot2: form.values.NoofBags3Lot2,
            BagCuttingType3Lot2id: form.values.BagCuttingType3Lot2 ? form.values.BagCuttingType3Lot2.value : 0,
            BagCuttingType3Lot2: form.values.BagCuttingType3Lot2 ? form.values.BagCuttingType3Lot2.label : "",
            BagCuttingVendor3Lot2id: form.values.BagCuttingVendor3Lot2 ? form.values.BagCuttingVendor3Lot2.value : 0,
            BagCuttingVendor3Lot2: form.values.BagCuttingVendor3Lot2 ? form.values.BagCuttingVendor3Lot2.label : "",
            Charges3Lot2: form.values.Charges3Lot2,

            BagType1Lot3id: form.values.BagType1Lot3 ? form.values.BagType1Lot3.value : 0,
            BagType1Lot3: form.values.BagType1Lot3 ? form.values.BagType1Lot3.label : "",
            NoofBags1Lot3: form.values.NoofBags1Lot3,
            BagCuttingType1Lot3id: form.values.BagCuttingType1Lot3 ? form.values.BagCuttingType1Lot3.value : 0,
            BagCuttingType1Lot3: form.values.BagCuttingType1Lot3 ? form.values.BagCuttingType1Lot3.label : "",
            BagCuttingVendor1Lot3id: form.values.BagCuttingVendor1Lot3 ? form.values.BagCuttingVendor1Lot3.value : 0,
            BagCuttingVendor1Lot3: form.values.BagCuttingVendor1Lot3 ? form.values.BagCuttingVendor1Lot3.label : "",
            Charges1Lot3: form.values.Charges1Lot3,

            BagType2Lot3id: form.values.BagType2Lot3 ? form.values.BagType2Lot3.value : 0,
            BagType2Lot3: form.values.BagType2Lot3 ? form.values.BagType2Lot3.label : "",
            NoofBags2Lot3: form.values.NoofBags2Lot3,
            BagCuttingType2Lot3id: form.values.BagCuttingType2Lot3 ? form.values.BagCuttingType2Lot3.value : 0,
            BagCuttingType2Lot3: form.values.BagCuttingType2Lot3 ? form.values.BagCuttingType2Lot3.label : "",
            BagCuttingVendor2Lot3id: form.values.BagCuttingVendor2Lot3 ? form.values.BagCuttingVendor2Lot3.value : 0,
            BagCuttingVendor2Lot3: form.values.BagCuttingVendor2Lot3 ? form.values.BagCuttingVendor2Lot3.label : "",
            Charges2Lot3: form.values.Charges2Lot3,

            BagType3Lot3id: form.values.BagType3Lot3 ? form.values.BagType3Lot3.value : 0,
            BagType3Lot3: form.values.BagType3Lot3 ? form.values.BagType3Lot3.label : "",
            NoofBags3Lot3: form.values.NoofBags3Lot3,
            BagCuttingType3Lot3id: form.values.BagCuttingType3Lot3 ? form.values.BagCuttingType3Lot3.value : 0,
            BagCuttingType3Lot3: form.values.BagCuttingType3Lot3 ? form.values.BagCuttingType3Lot3.label : "",
            BagCuttingVendor3Lot3id: form.values.BagCuttingVendor3Lot3 ? form.values.BagCuttingVendor3Lot3.value : 0,
            BagCuttingVendor3Lot3: form.values.BagCuttingVendor3Lot3 ? form.values.BagCuttingVendor3Lot3.label : "",
            Charges3Lot3: form.values.Charges3Lot3,

            TotalBags: form.values.TotalBags,

            LotNo1: form.values.LotNo1,
            PlanningQty1: form.values.PlanningQty1,
            SAPQty1: form.values.SAPQty1,
            MovementQty1: form.values.MovementQty1,

            LotNo2: form.values.LotNo2,
            PlanningQty2: form.values.PlanningQty2,
            SAPQty2: form.values.SAPQty2,
            MovementQty2: form.values.MovementQty2,

            LotNo3: form.values.LotNo3,
            PlanningQty3: form.values.PlanningQty3,
            SAPQty3: form.values.SAPQty3,
            MovementQty3: form.values.MovementQty3,

            TotalMovementQty: form.values.TotalMovementQty,
            RejectReason: form.values.RejectReason
        };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/SavePO_Submit', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/SavePO_Submit', fdata)
            .then((response) => {
                const { data } = response;

                if (data.success) {
                    ShowToast("Updated Sucessfully !!!");
                    setTimeout(() => history.push(`/IASSWI`), 2000);
                } else {
                    errorToast("Update Failed !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });

    };

    const showError = (Id, Msg, show) => {
        if (document.getElementById(Id)) {
            document.getElementById(Id).innerHTML = "";
            if (show == 1) {
                console.log("SHOW ERROR:" + Id);
                document.getElementById(Id).innerHTML = Msg;
            }
        }
    }

    const isFilledAll = () => {
        let ShowError = 0;
        let formData = form.values;
        // console.log(JSON.stringify(formData));

        showError('LastMileTransport_Error', 'Select Last Mile Transporter', 0);
        showError('FreightCharges_Error', 'Enter Freight Charges', 0);
        showError('LoadingVendor_Error', 'Create Loading Vendor', 0);
        showError('LoadingCharges_Error', 'Enter Loading Charges', 0);
        showError('PONumber_Error', 'Select PO Number', 0);
        showError('POLineItem1_Error', 'Select PO LineItem', 0);
        showError('ReceivingBin_Error', 'Select Receiving Bin', 0);

        showError('LoadedLotNo1_Error', 'Select Loaded Lot', 0);

        showError('BagType1Lot1_Error', 'Select Lot 1 BagType1', 0);
        showError('NoofBags1Lot1_Error', 'Enter Lot 1 No.oF Bags', 0);
        showError('BagCuttingType1Lot1_Error', 'Select Lot 1 Cutting Bag Type', 0);
        showError('BagCuttingVendor1Lot1_Error', 'Select Lot 1 Cutting Vendor', 0);
        showError('Charges1Lot1_Error', 'Check Lot 1 Vendor Charges', 0);

        showError('BagType2Lot1_Error', 'Select Lot 1 BagType2', 0);
        showError('NoofBags2Lot1_Error', 'Enter Lot 1 No.oF Bags', 0);
        showError('BagCuttingType2Lot1_Error', 'Select Lot 1 Cutting Bag Type', 0);
        showError('BagCuttingVendor2Lot1_Error', 'Select Lot 1 Cutting Vendor', 0);
        showError('Charges2Lot1_Error', 'Check Lot 1 Vendor Charges', 0);

        showError('BagType3Lot1_Error', 'Select Lot 1 BagType3', 0);
        showError('NoofBags3Lot1_Error', 'Enter Lot 1 No.oF Bags', 0);
        showError('BagCuttingType3Lot1_Error', 'Select Lot 1 Cutting Bag Type', 0);
        showError('BagCuttingVendor3Lot1_Error', 'Select Lot 1 Cutting Vendor', 0);
        showError('Charges3Lot1_Error', 'Check Lot 1 Vendor Charges', 0);

        showError('LoadedLotNo2_Error', 'Select Loaded Lot', 0);

        showError('BagType1Lot2_Error', 'Select Lot 2 BagType1', 0);
        showError('NoofBags1Lot2_Error', 'Enter Lot 2 No.oF Bags', 0);
        showError('BagCuttingType1Lot2_Error', 'Select Lot 2 Cutting Bag Type', 0);
        showError('BagCuttingVendor1Lot2_Error', 'Select Lot 2 Cutting Vendor', 0);
        showError('Charges1Lot2_Error', 'Check Lot 2 Vendor Charges', 0);

        showError('BagType2Lot2_Error', 'Select Lot 2 BagType2', 0);
        showError('NoofBags2Lot2_Error', 'Enter Lot 2 No.oF Bags', 0);
        showError('BagCuttingType2Lot2_Error', 'Select Lot 2 Cutting Bag Type', 0);
        showError('BagCuttingVendor2Lot2_Error', 'Select Lot 2 Cutting Vendor', 0);
        showError('Charges2Lot2_Error', 'Check Lot 2 Vendor Charges', 0);

        showError('BagType3Lot2_Error', 'Select Lot 2 BagType3', 0);
        showError('NoofBags3Lot2_Error', 'Enter Lot 2 No.oF Bags', 0);
        showError('BagCuttingType3Lot2_Error', 'Select Lot 2 Cutting Bag Type', 0);
        showError('BagCuttingVendor3Lot2_Error', 'Select Lot 2 Cutting Vendor', 0);
        showError('Charges3Lot2_Error', 'Check Lot 2 Vendor Charges', 0);

        showError('LoadedLotNo3_Error', 'Select Loaded Lot', 0);

        showError('BagType1Lot3_Error', 'Select Lot 3 BagType1', 0);
        showError('NoofBags1Lot3_Error', 'Enter Lot 3 No.oF Bags', 0);
        showError('BagCuttingType1Lot3_Error', 'Select Lot 3 Cutting Bag Type', 0);
        showError('BagCuttingVendor1Lot3_Error', 'Select Lot 3 Cutting Vandor', 0);
        showError('Charges1Lot3_Error', 'Check Lot 3 Vendor Charges', 0);

        showError('BagType2Lot3_Error', 'Select Lot 3 BagType2', 0);
        showError('NoofBags2Lot3_Error', 'Enter Lot 3 No.oF Bags', 0);
        showError('BagCuttingType2Lot3_Error', 'Select Lot 3 Cutting Bag Type', 0);
        showError('BagCuttingVendor2Lot3_Error', 'Select Lot 3 Cutting Vendor', 0);
        showError('Charges2Lot3_Error', 'Check Lot 3 Vendor Charges', 0);

        showError('BagType3Lot3_Error', 'Select Lot 3 BagType3', 0);
        showError('NoofBags3Lot3_Error', 'Enter Lot 3 No.oF Bags', 0);
        showError('BagCuttingType3Lot3_Error', 'Select Lot 3 Cutting Bag Type', 0);
        showError('BagCuttingVendor3Lot3_Error', 'Select Lot 3 Cutting Vendor', 0);
        showError('Charges3Lot3_Error', 'Check Lot 3 Vendor Charges', 0);

        showError('MovementQty1_Error', 'Enter the movement Qty For Loadedlot 1', 0);
        showError('MovementQty2_Error', 'Enter the movement Qty For Loadedlot 2', 0);
        showError('MovementQty3_Error', 'Enter the movement Qty For Loadedlot 3', 0);

        showError('TotalMovementQty_Error', 'Check Gunnyless Weight & Total Movement Qty', 0)

        /* MACHINE TYPE ERROR RESET */

        showError('MachineType1Lot1_Error', '', 0);
        showError('MachineType2Lot1_Error', '', 0);
        showError('MachineType3Lot1_Error', '', 0);

        showError('MachineType1Lot2_Error', '', 0);
        showError('MachineType2Lot2_Error', '', 0);
        showError('MachineType3Lot2_Error', '', 0);

        showError('MachineType1Lot3_Error', '', 0);
        showError('MachineType2Lot3_Error', '', 0);
        showError('MachineType3Lot3_Error', '', 0);


        if (!isOwnWb) {

            // console.log("isOwnWb", isOwnWb);

            showError('FirstWeight_Error', 'Enter First Weight', 0);
            showError('SecondWeight_Error', 'Enter Second Weight', 0);

            showError('first_weighment_attachment_Error', 'Upload First Weight Receipt', 0);
            showError('second_weighment_attachment_Error', 'Upload Second Weight Receipt', 0);

            if (/* formData.first_weighment_attachment && !formData.first_weighment_attachment && */
                !attachedFiles.first_weighment_attachment.name /* && ImgData.first_weighment_attachment == null */) {
                showError('first_weighment_attachment_Error', 'Upload First Weight Attachment', ShowError = 1);
            }
            if (/* formData.second_weighment_attachment && !formData.second_weighment_attachment && */
                !attachedFiles.second_weighment_attachment.name  /* && ImgData.second_weighment_attachment == null */) {
                showError('second_weighment_attachment_Error', 'Upload Second Weight Attachment', ShowError = 1);
            }

            if (!formData.FirstWeight) { showError('FirstWeight_Error', 'Enter First Weight', 1); ShowError = 1; }
            if (!formData.SecondWeight) { showError('SecondWeight_Error', 'Enter Second Weight', 1); ShowError = 1; }
        }

        if (!formData.FreightVendorid) { showError('LastMileTransport_Error', 'Select last Mile Transporter', 1); ShowError = 1; }
        if (!formData.FreightCharges) { showError('FreightCharges_Error', 'Enter FreightCharges', 1); ShowError = 1; }
        if (!formData.LoadingVendorid && formData.LoadingCharges > 0) { showError('LoadingVendor_Error', 'Select Loading Vendor', 1); ShowError = 1; }
        if (!formData.LoadingCharges) { showError('LoadingCharges_Error', 'Enter Loading Charges', 1); ShowError = 1; }
        if (!formData.PONumber) { showError('PONumber_Error', 'Select PO Number', 1); ShowError = 1; }
        if (!formData.POLineItem1) { showError('POLineItem1_Error', 'Select PO LineItem', 1); ShowError = 1; }
        


        //new Validation According to the Correction on 16-08-2022
        if (formData.POLineItem1) {
            if (!formData.LoadedLotNo1) {
                showError('LoadedLotNo1_Error', 'Select Loaded Lot 1', 1); ShowError = 1;
            } else {
                if (!formData.ReceivingBin || formData.ReceivingBin.value === "0" ) { showError('ReceivingBin_Error', 'Select Receiving Bin', 1); ShowError = 1; }
                console.log("formData.ReceivingBin.label", formData.ReceivingBin.label);
                if (!formData.BagType1Lot1) {
                    showError('BagType1Lot1_Error', 'Select Lot 1 BagType1', 1); ShowError = 1;
                    if (!formData.MovementQty1) { showError('MovementQty1_Error', 'Enter Lot 1 Movement Qty', 1); ShowError = 1; }
                }else{
                    if (formData.BagType1Lot1.label === "Loose Wheat|0.00") {
                        if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType1Lot1) {
                            showError('MachineType1Lot1_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags1Lot1) { showError('NoofBags1Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType1Lot1) { showError('BagCuttingType1Lot1_Error', 'Select Lot 1 BagCuttingType1', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor1Lot1) { showError('BagCuttingVendor1Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges1Lot1) { showError('Charges1Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags1Lot1) { showError('NoofBags1Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                    if (!formData.MovementQty1) { showError('MovementQty1_Error', 'Enter Lot 1 Movement Qty', 1); ShowError = 1; }
                }

                if (formData.BagType2Lot1 && formData.BagType2Lot1.label !=="") {
                    if (formData.BagType2Lot1.label === "Loose Wheat|0.00") {
                         if  (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType2Lot1) {
                            showError('MachineType2Lot1_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags2Lot1) { showError('NoofBags2Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType2Lot1) { showError('BagCuttingType2Lot1_Error', 'Select Lot 1 BagCuttingType2', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor2Lot1) { showError('BagCuttingVendor2Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges2Lot1) { showError('Charges2Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags2Lot1) { showError('NoofBags2Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                }

                if (formData.BagType3Lot1 && formData.BagType3Lot1.label !== "") {
                    if (formData.BagType3Lot1.label === "Loose Wheat|0.00") {
                         if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType3Lot1) {
                            showError('MachineType3Lot1_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags3Lot1) { showError('NoofBags3Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType3Lot1) { showError('BagCuttingType3Lot1_Error', 'Select Lot 1 BagCuttingType3', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor3Lot1) { showError('BagCuttingVendor3Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges3Lot1) { showError('Charges3Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags3Lot1) { showError('NoofBags3Lot1_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }                    
                }
            }
        }

        if (formData.POLineItem2) {
            if (formData.LoadedLotNo2 && formData.LoadedLotNo2.label !== "" ) {       
                if (!formData.BagType1Lot2) {
                    showError('BagType1Lot2_Error', 'Select Lot 2 BagType1', 1); ShowError = 1;
                    if (!formData.MovementQty2) { showError('MovementQty2_Error', 'Enter Lot 2 Movement Qty', 1); ShowError = 1; }
                }else{
                    if (formData.BagType1Lot2.label === "Loose Wheat|0.00") {
                         if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType1Lot2) {
                            showError('MachineType1Lot2_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags1Lot2) { showError('NoofBags1Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType1Lot2) { showError('BagCuttingType1Lot2_Error', 'Select Lot 1 BagCuttingType1', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor1Lot2) { showError('BagCuttingVendor1Lot2_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges1Lot2) { showError('Charges1Lot2_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags1Lot2) { showError('NoofBags1Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                    if (!formData.MovementQty2) { showError('MovementQty2_Error', 'Enter Lot 2 Movement Qty', 1); ShowError = 1; }
                }

                if (formData.BagType2Lot2 && formData.BagType2Lot2.label !=="") {
                    if (formData.BagType2Lot2.label === "Loose Wheat|0.00") {
                          if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType2Lot2) {
                            showError('MachineType2Lot2_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags2Lot2) { showError('NoofBags2Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType2Lot2) { showError('BagCuttingType2Lot2_Error', 'Select Lot 1 BagCuttingType2', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor2Lot2) { showError('BagCuttingVendor2Lot2_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges2Lot2) { showError('Charges2Lot2_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags2Lot2) { showError('NoofBags2Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                }

                if (formData.BagType3Lot2 && formData.BagType3Lot2.label !== "") {
                    if (formData.BagType3Lot2.label === "Loose Wheat|0.00") {
                          if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType3Lot2) {
                            showError('MachineType3Lot2_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags3Lot2) { showError('NoofBags3Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType3Lot2) { showError('BagCuttingType3Lot2_Error', 'Select Lot 1 BagCuttingType3', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor3Lot2) { showError('BagCuttingVendor3Lot2_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges3Lot2) { showError('Charges3Lot2_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags3Lot2) { showError('NoofBags3Lot2_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                }
            }else{
                showError('LoadedLotNo2_Error', 'Select Loaded Lot 2', 1); ShowError = 1;
            }
        }

        if (formData.POLineItem3) {
            if (formData.LoadedLotNo3 && formData.LoadedLotNo3.label !== "") {              
                if (!formData.BagType1Lot3) {
                    showError('BagType1Lot3_Error', 'Select Lot 3 BagType1', 1); ShowError = 1;
                    if (!formData.MovementQty3) { showError('MovementQty3_Error', 'Enter Lot 3 Movement Qty', 1); ShowError = 1; }
                }else{
                    if (formData.BagType1Lot3.label === "Loose Wheat|0.00") {
                          if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType1Lot3) {
                            showError('MachineType1Lot3_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags1Lot3) { showError('NoofBags1Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType1Lot3) { showError('BagCuttingType1Lot3_Error', 'Select Lot 1 BagCuttingType1', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor1Lot3) { showError('BagCuttingVendor1Lot3_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges1Lot3) { showError('Charges1Lot3_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags1Lot3) { showError('NoofBags1Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                    if (!formData.MovementQty3) { showError('MovementQty3_Error', 'Enter Lot 3 Movement Qty', 1); ShowError = 1; }
                }

                if (formData.BagType2Lot3 && formData.BagType2Lot3.label !=="") {
                    if (formData.BagType2Lot3.label === "Loose Wheat|0.00") {
                         if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType2Lot3) {
                            showError('MachineType2Lot3_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags2Lot3) { showError('NoofBags2Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType2Lot3) { showError('BagCuttingType2Lot3_Error', 'Select Lot 1 BagCuttingType2', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor2Lot3) { showError('BagCuttingVendor2Lot3_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges2Lot3) { showError('Charges2Lot3_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags2Lot3) { showError('NoofBags2Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                }

                if (formData.BagType3Lot3 && formData.BagType3Lot3.label !== "") {
                    if (formData.BagType3Lot3.label === "Loose Wheat|0.00") {
                         if (formData.SendingPlant != "FR01" && formData.SendingPlant != "8001") {
                        if (!formData.MachineType3Lot3) {
                            showError('MachineType3Lot3_Error', 'Select Machine Type', 1);
                            ShowError = 1;
                        }}
                        if (!formData.NoofBags3Lot3) { showError('NoofBags3Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                        if (!formData.BagCuttingType3Lot3) { showError('BagCuttingType3Lot3_Error', 'Select Lot 1 BagCuttingType3', 1); ShowError = 1; }
                        if (!formData.BagCuttingVendor3Lot3) { showError('BagCuttingVendor3Lot3_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                        if (!formData.Charges3Lot3) { showError('Charges3Lot3_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                    }else{
                        if (!formData.NoofBags3Lot3) { showError('NoofBags3Lot3_Error', 'Enter No.of Bags', 1); ShowError = 1;}
                    }
                }
            }else{
                showError('LoadedLotNo3_Error', 'Select Loaded Lot 3', 1); ShowError = 1;
            }
        }

        if (parseFloat(formData.GunnylessWeight) !== parseFloat(formData.TotalMovementQty)){ showError('TotalMovementQty_Error', 'Check Gunnyless Weight & Total Movement Qty', 1); ShowError = 1;}

        if (ShowError == 1) { return true; }
    }

    const IASDeliveryDetails = (e) => {
       apiPostMethod(apiBaseUrl + `Sap/SiloToMillController/IASDeliveryUpdate/${refid}`)
             .then((response) => {
             const { data } = response;
             if(data.success == true) {
                ShowToast(data.message)
                setTimeout(() => history.push(`/IASSWI`), 2000);
             }else{
              errorToast(data.message)
             }
             })
             .catch((error) => {
               errorToast("Something went wrong, please try again after sometime");
             })
    }

    const Save_PO = (e) => {
        if (isFilledAll()) {
            return false;
        }

        let fdata = {
            PO_No: form.values.PONumber.label,
            POLineItemid1: form.values.POLineItem1 ? form.values.POLineItem1.value : '',
            POLineItemName1: form.values.POLineItem1 ? form.values.POLineItem1.label : '',
            POLineItemid2: form.values.POLineItem2 ? form.values.POLineItem2.value : '',
            POLineItemName2: form.values.POLineItem2 ? form.values.POLineItem2.label : '',
            POLineItemid3: form.values.POLineItem3 ? form.values.POLineItem3.value : '',
            POLineItemName3: form.values.POLineItem3 ? form.values.POLineItem3.label : '',

            VANumber: form.values.VANumber,
            TruckNumber: form.values.TruckNumber,
            DriverNumber: form.values.DriverNumber,
            ReceivingBinid: form.values.ReceivingBin.value,
            ReceivingBin: form.values.ReceivingBin.label,

            LastMileTransportid: form.values.FreightVendorid,
            LastMileTransport: form.values.FreightVendor,

            FreightCharges: form.values.FreightCharges,

            LoadingVendorid: form.values.LoadingVendorid,
            LoadingVendor: form.values.LoadingVendor,

            LoadingCharges: form.values.LoadingCharges,

            SegmentId1: form.values.SegmentId1,
            Segment1: form.values.Segment1,
            WheatVariety1: form.values.WheatVariety1,

            SegmentId2: form.values.SegmentId2,
            Segment2: form.values.Segment2,
            WheatVariety2: form.values.WheatVariety2,

            SegmentId3: form.values.SegmentId3,
            Segment3: form.values.Segment3,
            WheatVariety3: form.values.WheatVariety3,

            SendingPlant: form.values.SendingPlant,
            SendingStorageLocation: form.values.SendingStorageLocation,

            ReceivingPlant: form.values.ReceivingPlant,
            ReceivingStorageLocation: form.values.ReceivingStorageLocation,

            FirstWeight: form.values.FirstWeight,
            SecondWeight: form.values.SecondWeight,
            NetWeight: form.values.NetWeight,
            GunnyWeight: form.values.GunnyWeight,
            GunnylessWeight: form.values.GunnylessWeight,


            LoadedLotNoid1: form.values.LoadedLotNo1 ? form.values.LoadedLotNo1.value : 0,
            LoadedLotNo1: form.values.LoadedLotNo1 ? form.values.LoadedLotNo1.label : "",

            LoadedLotNoid2: form.values.LoadedLotNo2 ? form.values.LoadedLotNo2.value : 0,
            LoadedLotNo2: form.values.LoadedLotNo2 ? form.values.LoadedLotNo2.label : "",

            LoadedLotNoid3: form.values.LoadedLotNo3 ? form.values.LoadedLotNo3.value : 0,
            LoadedLotNo3: form.values.LoadedLotNo3 ? form.values.LoadedLotNo3.label : "",

            BagType1Lot1id: form.values.BagType1Lot1 ? form.values.BagType1Lot1.value : 0,
            BagType1Lot1: form.values.BagType1Lot1 ? form.values.BagType1Lot1.label : "",
            NoofBags1Lot1: form.values.NoofBags1Lot1,
            BagCuttingType1Lot1id: form.values.BagCuttingType1Lot1 ? form.values.BagCuttingType1Lot1.value : 0,
            BagCuttingType1Lot1: form.values.BagCuttingType1Lot1 ? form.values.BagCuttingType1Lot1.label : "",
            BagCuttingVendor1Lot1id: form.values.BagCuttingVendor1Lot1 ? form.values.BagCuttingVendor1Lot1.value : 0,
            BagCuttingVendor1Lot1: form.values.BagCuttingVendor1Lot1 ? form.values.BagCuttingVendor1Lot1.label : "",
            Charges1Lot1: form.values.Charges1Lot1,

            BagType2Lot1id: form.values.BagType2Lot1 ? form.values.BagType2Lot1.value : 0,
            BagType2Lot1: form.values.BagType2Lot1 ? form.values.BagType2Lot1.label : "",
            NoofBags2Lot1: form.values.NoofBags2Lot1,
            BagCuttingType2Lot1id: form.values.BagCuttingType2Lot1 ? form.values.BagCuttingType2Lot1.value : 0,
            BagCuttingType2Lot1: form.values.BagCuttingType2Lot1 ? form.values.BagCuttingType2Lot1.label : "",
            BagCuttingVendor2Lot1id: form.values.BagCuttingVendor2Lot1 ? form.values.BagCuttingVendor2Lot1.value : 0,
            BagCuttingVendor2Lot1: form.values.BagCuttingVendor2Lot1 ? form.values.BagCuttingVendor2Lot1.label : "",
            Charges2Lot1: form.values.Charges2Lot1,

            BagType3Lot1id: form.values.BagType3Lot1 ? form.values.BagType3Lot1.value : 0,
            BagType3Lot1: form.values.BagType3Lot1 ? form.values.BagType3Lot1.label : "",
            NoofBags3Lot1: form.values.NoofBags3Lot1,
            BagCuttingType3Lot1id: form.values.BagCuttingType3Lot1 ? form.values.BagCuttingType3Lot1.value : 0,
            BagCuttingType3Lot1: form.values.BagCuttingType3Lot1 ? form.values.BagCuttingType3Lot1.label : "",
            BagCuttingVendor3Lot1id: form.values.BagCuttingVendor3Lot1 ? form.values.BagCuttingVendor3Lot1.value : 0,
            BagCuttingVendor3Lot1: form.values.BagCuttingVendor3Lot1 ? form.values.BagCuttingVendor3Lot1.label : "",
            Charges3Lot1: form.values.Charges3Lot1,

            BagType1Lot2id: form.values.BagType1Lot2 ? form.values.BagType1Lot2.value : 0,
            BagType1Lot2: form.values.BagType1Lot2 ? form.values.BagType1Lot2.label : "",
            NoofBags1Lot2: form.values.NoofBags1Lot2,
            BagCuttingType1Lot2id: form.values.BagCuttingType1Lot2 ? form.values.BagCuttingType1Lot2.value : 0,
            BagCuttingType1Lot2: form.values.BagCuttingType1Lot2 ? form.values.BagCuttingType1Lot2.label : "",
            BagCuttingVendor1Lot2id: form.values.BagCuttingVendor1Lot2 ? form.values.BagCuttingVendor1Lot2.value : 0,
            BagCuttingVendor1Lot2: form.values.BagCuttingVendor1Lot2 ? form.values.BagCuttingVendor1Lot2.label : "",
            Charges1Lot2: form.values.Charges1Lot2,

            BagType2Lot2id: form.values.BagType2Lot2 ? form.values.BagType2Lot2.value : 0,
            BagType2Lot2: form.values.BagType2Lot2 ? form.values.BagType2Lot2.label : "",
            NoofBags2Lot2: form.values.NoofBags2Lot2,
            BagCuttingType2Lot2id: form.values.BagCuttingType2Lot2 ? form.values.BagCuttingType2Lot2.value : 0,
            BagCuttingType2Lot2: form.values.BagCuttingType2Lot2 ? form.values.BagCuttingType2Lot2.label : "",
            BagCuttingVendor2Lot2id: form.values.BagCuttingVendor2Lot2 ? form.values.BagCuttingVendor2Lot2.value : 0,
            BagCuttingVendor2Lot2: form.values.BagCuttingVendor2Lot2 ? form.values.BagCuttingVendor2Lot2.label : "",
            Charges2Lot2: form.values.Charges2Lot2,

            BagType3Lot2id: form.values.BagType3Lot2 ? form.values.BagType3Lot2.value : 0,
            BagType3Lot2: form.values.BagType3Lot2 ? form.values.BagType3Lot2.label : "",
            NoofBags3Lot2: form.values.NoofBags3Lot2,
            BagCuttingType3Lot2id: form.values.BagCuttingType3Lot2 ? form.values.BagCuttingType3Lot2.value : 0,
            BagCuttingType3Lot2: form.values.BagCuttingType3Lot2 ? form.values.BagCuttingType3Lot2.label : "",
            BagCuttingVendor3Lot2id: form.values.BagCuttingVendor3Lot2 ? form.values.BagCuttingVendor3Lot2.value : 0,
            BagCuttingVendor3Lot2: form.values.BagCuttingVendor3Lot2 ? form.values.BagCuttingVendor3Lot2.label : "",
            Charges3Lot2: form.values.Charges3Lot2,

            BagType1Lot3id: form.values.BagType1Lot3 ? form.values.BagType1Lot3.value : 0,
            BagType1Lot3: form.values.BagType1Lot3 ? form.values.BagType1Lot3.label : "",
            NoofBags1Lot3: form.values.NoofBags1Lot3,
            BagCuttingType1Lot3id: form.values.BagCuttingType1Lot3 ? form.values.BagCuttingType1Lot3.value : 0,
            BagCuttingType1Lot3: form.values.BagCuttingType1Lot3 ? form.values.BagCuttingType1Lot3.label : "",
            BagCuttingVendor1Lot3id: form.values.BagCuttingVendor1Lot3 ? form.values.BagCuttingVendor1Lot3.value : 0,
            BagCuttingVendor1Lot3: form.values.BagCuttingVendor1Lot3 ? form.values.BagCuttingVendor1Lot3.label : "",
            Charges1Lot3: form.values.Charges1Lot3,

            BagType2Lot3id: form.values.BagType2Lot3 ? form.values.BagType2Lot3.value : 0,
            BagType2Lot3: form.values.BagType2Lot3 ? form.values.BagType2Lot3.label : "",
            NoofBags2Lot3: form.values.NoofBags2Lot3,
            BagCuttingType2Lot3id: form.values.BagCuttingType2Lot3 ? form.values.BagCuttingType2Lot3.value : 0,
            BagCuttingType2Lot3: form.values.BagCuttingType2Lot3 ? form.values.BagCuttingType2Lot3.label : "",
            BagCuttingVendor2Lot3id: form.values.BagCuttingVendor2Lot3 ? form.values.BagCuttingVendor2Lot3.value : 0,
            BagCuttingVendor2Lot3: form.values.BagCuttingVendor2Lot3 ? form.values.BagCuttingVendor2Lot3.label : "",
            Charges2Lot3: form.values.Charges2Lot3,

            BagType3Lot3id: form.values.BagType3Lot3 ? form.values.BagType3Lot3.value : 0,
            BagType3Lot3: form.values.BagType3Lot3 ? form.values.BagType3Lot3.label : "",
            NoofBags3Lot3: form.values.NoofBags3Lot3,
            BagCuttingType3Lot3id: form.values.BagCuttingType3Lot3 ? form.values.BagCuttingType3Lot3.value : 0,
            BagCuttingType3Lot3: form.values.BagCuttingType3Lot3 ? form.values.BagCuttingType3Lot3.label : "",
            BagCuttingVendor3Lot3id: form.values.BagCuttingVendor3Lot3 ? form.values.BagCuttingVendor3Lot3.value : 0,
            BagCuttingVendor3Lot3: form.values.BagCuttingVendor3Lot3 ? form.values.BagCuttingVendor3Lot3.label : "",
            Charges3Lot3: form.values.Charges3Lot3,

            TotalBags: form.values.TotalBags,

            LotNo1: form.values.LotNo1,
            PlanningQty1: form.values.PlanningQty1,
            SAPQty1: form.values.SAPQty1,
            MovementQty1: form.values.MovementQty1,

            LotNo2: form.values.LotNo2,
            PlanningQty2: form.values.PlanningQty2,
            SAPQty2: form.values.SAPQty2,
            MovementQty2: form.values.MovementQty2,

            LotNo3: form.values.LotNo3,
            PlanningQty3: form.values.PlanningQty3,
            SAPQty3: form.values.SAPQty3,
            MovementQty3: form.values.MovementQty3,

            TotalMovementQty: form.values.TotalMovementQty,
            RejectReason: form.values.RejectReason,
            VehicleStatus: statusCode.GATEOUT,

            MachineType1Lot1: form.values.MachineType1Lot1 ? form.values.MachineType1Lot1.label : "",
            MachineType2Lot1: form.values.MachineType2Lot1 ? form.values.MachineType2Lot1.label : "",
            MachineType3Lot1: form.values.MachineType3Lot1 ? form.values.MachineType3Lot1.label : "",

            MachineType1Lot2: form.values.MachineType1Lot2 ? form.values.MachineType1Lot2.label : "",
            MachineType2Lot2: form.values.MachineType2Lot2 ? form.values.MachineType2Lot2.label : "",
            MachineType3Lot2: form.values.MachineType3Lot2 ? form.values.MachineType3Lot2.label : "",

            MachineType1Lot3: form.values.MachineType1Lot3 ? form.values.MachineType1Lot3.label : "",
            MachineType2Lot3: form.values.MachineType2Lot3 ? form.values.MachineType2Lot3.label : "",
            MachineType3Lot3: form.values.MachineType3Lot3 ? form.values.MachineType3Lot3.label : "",
        };

        if (isOwnWb) { 
            SaveData(fdata); 
        } else {
            let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
            if (keys.length > 0) {

                let postdata = new FormData();
                let FileSaveUrl = "";
                let { first_weighment_attachment, second_weighment_attachment } = ImgData;

                FileSaveUrl = sapFileShare;    // uploadandSaveImageUrl;

                postdata.append("image[]", first_weighment_attachment);
                postdata.append("image[]", second_weighment_attachment);
                keys.forEach((key) => {
                    // console.log("attachedFiles[key] : ", attachedFiles[key]);
                    postdata.append("file[]", attachedFiles[key]);
                });
                postdata.append("form_name", "IAS");
                postdata.append("ponumber", form.values.PONumber);
                postdata.append("VA_Number", form.values.VANumber);
                postdata.append("SubFolder", "Loading_WH_Incharge");

                // console.log("postdata : ", postdata);

                showLoader();
                apiPostMethod(FileSaveUrl, postdata, "File")
                    .then((response) => {
                        // console.log("Test 001");
                        const { data } = response;
                        // console.log("Data Response :", data);
                        if (data.success) {
                            keys.forEach((key, i) => {
                                fdata[key] = data.files[i].updname;
                            });
                            SaveData(fdata);
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            }
            // console.log("After :", fdata);
        };
    }

    const SaveData=(fdata)=>{
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/SavePO_Submit', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/SavePO_Submit', fdata)
            .then((response) => {
                const { data } = response;

                if (data.success) {
                    IASDeliveryDetails()     
                } else {
                    errorToast("Update Failed !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })

            .finally((a) => {
                hideLoader();
            });


    }

    const Reject_PO = (e, RejectReason) => {
        let msg="Are you sure want to REJECT?"
        confirmDialog({
            title: "# REJECT ALERT #",
            description: msg,
            }).then((res) => {
        
                if (res) {
        
            let fdata = {
            VA_No: form.values.VANumber,
            VehicleStatus: statusCode.REJECTED_GATE_OUT ,
            RejectReason: RejectReason
        };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/SavePO_Reject', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/SavePO_Reject', fdata)
            .then((response) => {
                const { data } = response;

                if (data.success) {
                    ShowToast("Rejected Sucessfully !!!");
                } else {
                    errorToast("Rejection Failed !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
        }})
    }

    

    const CalcMovementQty = (e, Column_Id, SAP_Qty) => {

        if (parseFloat(form.values[SAP_Qty]) < parseFloat(e.target.value)){
            errorToast("Movemwnt Qty not allowed greater then SAP Qty !!!"); 
            return;
        }
    
        let MovementQty1 = Column_Id === "MovementQty1" ? e.target.value ? e.target.value : 0 : form.values.MovementQty1 ? form.values.MovementQty1 : 0;
        let MovementQty2 = Column_Id === "MovementQty2" ? e.target.value ? e.target.value : 0 : form.values.MovementQty2 ? form.values.MovementQty2 : 0;
        let MovementQty3 = Column_Id === "MovementQty3" ? e.target.value ? e.target.value : 0 : form.values.MovementQty3 ? form.values.MovementQty3 : 0;

        let TotalMovementQty = 0;
        TotalMovementQty = parseFloat(MovementQty1) + parseFloat(MovementQty2) + parseFloat(MovementQty3);

        form.setValues({
            ...form.values,
            [Column_Id]: e.target.value ? e.target.value : '',
            TotalMovementQty: TotalMovementQty
        });
        // console.log("Movement Qty ", TotalMovementQty);
    }

    const getMovemenetDetails = (e) => {
        const { value, label } = e;
        let PreLot = { ...form.values.LoadedLotNo };
        if (form.values.LoadedLotNo) {
            PreLot.push({ ...form.values.LoadedLotNo });
        }

        PreLot.push({ value: e.value, label: e.label });

        // console.log("getMovemenetDetails", e);
        //form.setFieldValue('LoadedLot',[{value:e.value, label:e.label}])
        form.setValues({
            ...form.values,
            LoadedLotNo: PreLot
        });
    }

    const fnclear = (bagtype, nobags, cuttingtype, vendor, charges) => {
        // console.log("e => ", bagtype, " ", cuttingtype, " ", vendor, " ", charges);
        form.setValues({
            ...form.values,
            [bagtype]: '',
            [nobags]: '',
            [cuttingtype]: '',
            [vendor]: '',
            [charges]: ''
        });
    }

    const ShowBagType = (e, col_id1, col_id2   ) => {
        if (document.getElementById([col_id1]).style.display === "none"){
            document.getElementById([col_id1]).style.display = '';
            return;
        }else if (document.getElementById([col_id2]).style.display === "none"){
            document.getElementById(col_id2).style.display = '';
            return;
        }
    }
        /* *** ADD PO LINE ITEM  START**** */

        const ShowPoType = (e, col_id1, col_id2   ) => {
            alert(col_id1);
            alert(col_id2)
            if (document.getElementById([col_id1]).style.display === "none"){
                document.getElementById([col_id1]).style.display = '';
                document.getElementById('hiddenLotNo2').style.display = '';
                return;
            }else if (document.getElementById([col_id2]).style.display === "none"){
                document.getElementById(col_id2).style.display = '';
                document.getElementById('hiddenLotNo3').style.display = '';
                return;
            }
        }
        /* *** ADD PO LINE ITEM  END**** */


    /* ********************************************************************************************** */
    const getVendorCode = (data1,e) => {
        apiPostMethod(apiBaseUrl+`warehouse/master/getLoadingVendorById/${(data1?.loading_vendor == '' || data1?.loading_vendor == 0 || data1?.loading_vendor == null || data1?.loading_vendor == undefined) ? 0 : data1?.loading_vendor}/${data1.Freight_Vendor ? data1.Freight_Vendor : 0}`)
        .then((response) => {
        const { data } = response;
            form.setValues({
                ...form.values,
                SendingPlant: data1.SendingPlant,
                SendingStorageLocation: data1.SendingStorageLocation,
                ReceivingPlant: data1.ReceivingPlant,
                ReceivingStorageLocation: data1.ReceivingStorageLoc,
                FreightCharges:data1.Freight_Charges,
                LoadingCharges:data1.Loading_Charges,
                LoadingVendor:data?.results[0]?.label,
                LoadingVendorid:data?.results[0]?.value,
                FreightVendor:data?.results[1]?.label,
                FreightVendorid:data?.results[1]?.value
            });
        form.setFieldValue('PONumber', { value: e.value, label: e.label });
        })
    };
    return (
        <div>
            <RefreshBlock />
            <Card>
                <CardHeader>
                    <CardTitle>{"Loading WH-Incharge - Update Lot"}</CardTitle>
                </CardHeader>

                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"VA No"} form={form} id="VANumber" type="text" disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Truck No"} form={form} id="TruckNumber" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Driver No"} form={form} id="DriverNumber" type="text" disabled />
                        </Col>
                        {/* <Col md="4" sm="12">
                            <CustomDropdownInput label={"Last Mile Transporter"} form={form} id="LastMileTransport"
                                url={`${apiBaseUrl}warehouse/master/getLastMileTransportVendor`} />
                            <span id='LastMileTransport_Error' style={{ color: 'red' }} ></span>

                        </Col> */}
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Freight Vendor"} form={form} id="FreightVendor" type="text" disabled/>
                            <span id='LastMileTransport_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Freight Charges Per Ton"} form={form} id="FreightCharges" type="text" disabled/>
                            <span id='FreightCharges_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {/* <Col md="4" sm="12">
                            <CustomDropdownInput label={"Loading Vendor"} form={form} id="LoadingVendor"
                                // url={`${apiBaseUrl}warehouse/master/getLoadingVendor`} 
                                options={LoadVendorOptions}
                                />
                            <span id='LoadingVendor_Error' style={{ color: 'red' }} ></span>
                        </Col> */}
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Loading Vendor"} form={form} id="LoadingVendor" type="text" disabled/>
                            <span id='LoadingVendor_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Loading Charges Per Ton"} form={form} id="LoadingCharges" type="text" disabled/>
                            <span id='LoadingCharges_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* <HrLine header={"PO & Vehicle Details"} /><br /> */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"PO No"} form={form} id="PONumber"
                                // url={`${apiBaseUrl}warehouse/Master/getPONumber`}
                                url={`${apiBaseUrl}warehouse/IASSending/getPONumber`}
                                postData ={{werks:SendingWerks}}
                                onChange={(e) => get_ias_PO_Data(e)} />
                            <span id='PONumber_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12">
                            <CustomTextInput placeholder={"Sending Plant"} label={"Sending Plant"} form={form} id="SendingPlant" type="text" disabled />
                        </Col>
                        <Col md="2" sm="12">
                            <CustomTextInput placeholder={"Sending Location"} label={"Sending Location"} form={form} id="SendingStorageLocation" type="text" disabled />
                        </Col>
                        <Col md="2" sm="12">
                            <CustomTextInput placeholder={"Receiving Plant"} label={"Receiving Plant"} form={form} id="ReceivingPlant" type="text" disabled />
                        </Col>
                        <Col md="2" sm="12">
                            <CustomTextInput placeholder={"Receiving Location"} label={"Receiving Location"} form={form} id="ReceivingStorageLocation" type="text" disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"First Weight"} form={form} id="FirstWeight" type="text" isNumberOnly={true} disabled={isOwnWb} />
                            <span id="FirstWeight_Error" style={{ color: "red" }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Second Weight"} form={form} id="SecondWeight" type="text" isNumberOnly={true} disabled={isOwnWb} />
                            <span id="SecondWeight_Error" style={{ color: "red" }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Net Weight"} form={form} id="NetWeight" type="text" disabled />
                        </Col>
                    </Row>

                    <Row id="outsideWB">
                        <Col md="4" sm="12"></Col>
                        <Col md="4" sm="12">
                            <Uploader
                                title={"Pdf"}
                                isReadOnly={false}
                                form={form}
                                label={"First Weighment Receipt"}
                                id={"first_weighment_attachment"}
                                setAttachment={handleFileChange}
                                selectedFileName={attachedFiles.first_weighment_attachment.name} />
                            <span id="first_weighment_attachment_Error" style={{ color: "red" }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <Uploader
                                title={"Pdf"}
                                isReadOnly={false}
                                form={form}
                                label={"Second Weighment Receipt"}
                                id={"second_weighment_attachment"}
                                setAttachment={handleFileChange}
                                selectedFileName={attachedFiles.second_weighment_attachment.name} />
                            <span id="second_weighment_attachment_Error" style={{ color: "red" }} ></span>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunny Weight"} form={form} id="GunnyWeight" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunnyless Weight"} form={form} id="GunnylessWeight" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Receiving Bin"} form={form} id="ReceivingBin"
                                url={`${apiBaseUrl}warehouse/master/getReceivingBin`} />
                            <span id='ReceivingBin_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    
                    <HrLine />
                    {/* BAG TYPE 1 - LOT 1 */}
                    <Row>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"PO LineItem 1"} form={form} id="POLineItem1" options={POLineItem1} 
                                onChange ={(e)=>(getSegmentDet(e,form.values.PONumber,1))}
                            />
                            <span id='POLineItem1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Select Lot 1"} form={form} id="LoadedLotNo1" options={LoadedLot1}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId1, 1)} />
                            <span id='LoadedLotNo1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Segment 1"} form={form} id="Segment1" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId1" type="text" hidden />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Wheat Variety 1"} form={form} id="WheatVariety1" type="text" disabled />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <Button color="primary" style={{ marginTop: 25 }} onClick ={(e)=>{ShowBagType(e, "bagtype21", "bagtype31")}} >ADD BAG</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <Button color="primary" style={{ marginTop: 25}} onClick ={(e)=>{ShowPoType(e, "poNo1", "poNo2")}} >PO LINE ITEM</Button>
                        </Col>
                    </Row>
                    
                        
                    
                    <Row > 
                        <Col md="1" sm="12" style={{ marginTop: 25 }}>
                            <Button color="primary" onClick={(e) => fnclear("BagType1Lot1",
                                "NoofBags1Lot1",
                                "BagCuttingType1Lot1",
                                "BagCuttingVendor1Lot1",
                                "Charges1Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Bag Type"} form={form} id="BagType1Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType1Lot1")} />
                            <span id='BagType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot1")} isNumberOnly/>
                            <span id='NoofBags1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant != "FR01" && form.values.SendingPlant != "8001" && (
                        <Col md="2" sm="12" id="MachineType111">
                            <CustomDropdownInput
                                label={"Machine Type"}
                                url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                form={form}
                                id="MachineType1Lot1"
                            />
                            <span id="MachineType1Lot1_Error" style={{ color: "red" }}></span>
                        </Col>)}

                        <Col md="2" sm="12" id="LooseWheat111">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        
                        <Col md="2" sm="12" id="LooseWheat112">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot1", "Charges1Lot1", "NoofBags1Lot1")} />
                            <span id='BagCuttingVendor1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        
                        <Col md="1" sm="12" id="LooseWheat113">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot1" type="text" disabled />
                            <span id='Charges1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>


                    {/* BAG TYPE 2 - LOT 1 */}
                    <Row id="bagtype21">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType2Lot1",
                                "NoofBags2Lot1",
                                "BagCuttingType2Lot1",
                                "BagCuttingVendor2Lot1",
                                "Charges2Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType2Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType2Lot1")} />
                            <span id='BagType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot1")} />
                            <span id='NoofBags2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant != "FR01" && form.values.SendingPlant != "8001" && (
                        <Col md="2" sm="12" id="MachineType211" style={{ display: "none" }}>
                            <CustomDropdownInput
                                label={""}
                                url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                form={form}
                                id="MachineType2Lot1"
                            />
                            <span id="MachineType2Lot1_Error" style={{ color: "red" }}></span>
                        </Col>)}

                        <Col md="2" sm="12" id="LooseWheat211">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat212">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot1", "Charges2Lot1","NoofBags2Lot1")} />
                            <span id='BagCuttingVendor2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat213">
                            <CustomTextInput label={""} form={form} id="Charges2Lot1" type="text" disabled />
                            <span id='Charges2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 1 */}

                    <Row id="bagtype31">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType3Lot1",
                                "NoofBags3Lot1",
                                "BagCuttingType3Lot1",
                                "BagCuttingVendor3Lot1",
                                "Charges3Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType3Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType3Lot1")} />
                            <span id='BagType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot1")} />
                            <span id='NoofBags3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant !== "FR01" && form.values.SendingPlant != "8001" && (
                        <Col md="2" sm="12" id="MachineType311" style={{ display: "none" }}>
                            <CustomDropdownInput
                                label={""}
                                url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                form={form}
                                id="MachineType3Lot1"
                            />
                            <span id="MachineType3Lot1_Error" style={{ color: "red" }}></span>
                        </Col>)}
                        <Col md="2" sm="12" id="LooseWheat311">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat312">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot1", "Charges3Lot1","NoofBags3Lot1")} />
                            <span id='BagCuttingVendor3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat313">
                            <CustomTextInput label={""} form={form} id="Charges3Lot1" type="text" disabled />
                            <span id='Charges3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    <div id="poNo1">
                    <HrLine />
                    {/* BAG TYPE 1 - LOT 2 */}
                
                    <Row>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"PO LineItem 2"} form={form} id="POLineItem2" options={POLineItem2} 
                                onChange ={(e)=>(getSegmentDet(e,form.values.PONumber,2))}
                            />
                            <span id='POLineItem_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Select Lot 2"} form={form} id="LoadedLotNo2" options={LoadedLot2}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId2, 2)} />
                            <span id='LoadedLotNo2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Segment 2"} form={form} id="Segment2" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId2" type="text" hidden />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Wheat Variety 2"} form={form} id="WheatVariety2" type="text" disabled />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                        <Button color="primary" style={{ marginTop: 25 }} onClick ={(e)=>{ShowBagType(e, "bagtype22", "bagtype32")}} >ADD BAG</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <Button color="primary" style={{ marginTop: 25}} onClick ={(e)=>{ShowPoType(e, "poNo1", "poNo2")}} >PO LINE ITEM</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="1" sm="12" style={{ marginTop: 25 }}>
                            <Button color="primary" onClick={(e) => fnclear("BagType1Lot2",
                                "NoofBags1Lot2",
                                "BagCuttingType1Lot2",
                                "BagCuttingVendor1Lot2",
                                "Charges1Lot2")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Bag Type"} form={form} id="BagType1Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType1Lot2")} />
                            <span id='BagType1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot2")} isNumberOnly/>
                            <span id='NoofBags1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant !== "FR01" && form.values.SendingPlant != "8001" && (
                        <Col md="2" sm="12" id="MachineType121" style={{ display: "none" }}>
                                <CustomDropdownInput
                                    label={"Machine Type"}
                                    url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                    form={form}
                                    id="MachineType1Lot2"
                                />
                                <span id="MachineType1Lot2_Error" style={{ color: "red" }}></span>
                            </Col>
                        )}

                        <Col md="2" sm="12" id="LooseWheat121">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                         
                        <Col md="2" sm="12" id="LooseWheat122">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot2", "Charges1Lot2","NoofBags1Lot2")} />
                            <span id='BagCuttingVendor1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat123">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot2" type="text" disabled />
                            <span id='Charges1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                </div>

                    {/* BAG TYPE 2 - LOT 2 */}
                    <Row id="bagtype22">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType2Lot2",
                                "NoofBags2Lot2",
                                "BagCuttingType2Lot2",
                                "BagCuttingVendor2Lot2",
                                "Charges2Lot2")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType2Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType2Lot2")} />
                            <span id='BagType2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot2")} />
                            <span id='NoofBags2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant !== "FR01" && form.values.SendingPlant != "8001" &&(
                        <Col md="2" sm="12" id="MachineType221" style={{ display: "none" }}>
                            <CustomDropdownInput
                                label={""}
                                url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                form={form}
                                id="MachineType2Lot2"
                            />
                            <span id="MachineType2Lot2_Error" style={{ color: "red" }}></span>
                        </Col>)}
                       
                        <Col md="2" sm="12" id="LooseWheat221">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                         
                        <Col md="2" sm="12" id="LooseWheat222">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot2", "Charges2Lot2","NoofBags2Lot2")} />
                            <span id='BagCuttingVendor2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat223">
                            <CustomTextInput label={""} form={form} id="Charges2Lot2" type="text" disabled />
                            <span id='Charges2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 2 */}
                    <Row id="bagtype32">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType3Lot2",
                                "NoofBags3Lot2",
                                "BagCuttingType3Lot2",
                                "BagCuttingVendor3Lot2",
                                "Charges3Lot2")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType3Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType3Lot2")} />
                            <span id='BagType3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot2")} />
                            <span id='NoofBags3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant !== "FR01" && form.values.SendingPlant != "8001" && (
                        <Col md="2" sm="12" id="MachineType321" style={{ display: "none" }}>
                            <CustomDropdownInput
                                label={""}
                                url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                form={form}
                                id="MachineType3Lot2"
                            />
                            <span id="MachineType3Lot2_Error" style={{ color: "red" }}></span>
                        </Col>)}
                        

                        <Col md="2" sm="12" id="LooseWheat321">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        
                        <Col md="2" sm="12" id="LooseWheat322">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot2", "Charges3Lot2","NoofBags3Lot2")} />
                            <span id='BagCuttingVendor3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat323">
                            <CustomTextInput label={""} form={form} id="Charges3Lot2" type="text" disabled />
                            <span id='Charges3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    <div id="poNo2">
                    <HrLine />
                    {/* BAG TYPE 1 - LOT 3 */}
                   
                    <Row>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"PO LineItem 3"} form={form} id="POLineItem3" options={POLineItem3} 
                                onChange ={(e)=>(getSegmentDet(e,form.values.PONumber,3))}
                            />
                            <span id='POLineItem_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Select Lot 3"} form={form} id="LoadedLotNo3" options={LoadedLot3}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId3, 3)} />
                            <span id='LoadedLotNo3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Segment 3"} form={form} id="Segment3" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId3" type="text" hidden />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Wheat Variety 3"} form={form} id="WheatVariety3" type="text" disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <Button color="primary" style={{ marginTop: 25 }} onClick ={(e)=>{ShowBagType(e, "bagtype23", "bagtype33")}} >ADD BAG</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="1" sm="12" style={{ marginTop: 25 }}>
                            <Button color="primary" onClick={(e) => fnclear("BagType1Lot3",
                                "NoofBags1Lot3",
                                "BagCuttingType1Lot3",
                                "BagCuttingVendor1Lot3",
                                "Charges1Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Bag Type"} form={form} id="BagType1Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType1Lot3")} />
                            <span id='BagType1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot3")} isNumberOnly/>
                            <span id='NoofBags1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant !== "FR01" && form.values.SendingPlant != "8001" &&(
                         <Col md="2" sm="12" id="MachineType131" style={{ display: "none" }}>
                                <CustomDropdownInput
                                    label={"Machine Type"}
                                    url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                    form={form}
                                    id="MachineType1Lot3"
                                />
                                <span id="MachineType1Lot3_Error" style={{ color: "red" }}></span>
                            </Col>)}
                        <Col md="2" sm="12" id="LooseWheat131">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                           
                        <Col md="2" sm="12" id="LooseWheat132">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot3", "Charges1Lot3","NoofBags1Lot3")} />
                            <span id='BagCuttingVendor1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat133">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot3" type="text" disabled />
                            <span id='Charges1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 2 - LOT 3 */}
                    <Row id="bagtype23">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType2Lot3",
                                "NoofBags2Lot3",
                                "BagCuttingType2Lot3",
                                "BagCuttingVendor2Lot3",
                                "Charges1Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType2Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType2Lot3")} />
                            <span id='BagType2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot3")} />
                            <span id='NoofBags2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant != "FR01" && form.values.SendingPlant != "8001" &&(
                            <Col md="2" sm="12" id="MachineType231" style={{ display: "none" }}>
                                <CustomDropdownInput
                                    label={""}
                                    url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                    form={form}
                                    id="MachineType2Lot3"
                                />
                                <span id="MachineType2Lot3_Error" style={{ color: "red" }}></span>
                            </Col>)}
                        <Col md="2" sm="12" id="LooseWheat231">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat232">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot3", "Charges2Lot3","NoofBags2Lot3")} />
                            <span id='BagCuttingVendor2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat233">
                            <CustomTextInput label={""} form={form} id="Charges2Lot3" type="text" disabled />
                            <span id='Charges2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 3 */}
                    <Row id="bagtype33">
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("BagType3Lot3",
                                "NoofBags3Lot3",
                                "BagCuttingType3Lot3",
                                "BagCuttingVendor3Lot3",
                                "Charges3Lot3")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="BagType3Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => CalcBagCount(e, "BagType3Lot3")} />
                            <span id='BagType3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot3")} />
                            <span id='NoofBags3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        {form.values.SendingPlant != "FR01" && form.values.SendingPlant != "8001" && (
                            <Col md="2" sm="12" id="MachineType331" style={{ display: "none" }}>
                                <CustomDropdownInput
                                    label={""}
                                    url={`${apiBaseUrl}warehouse/master/getmachinetype`}
                                    form={form}
                                    id="MachineType3Lot3"
                                />
                                <span id="MachineType3Lot3_Error" style={{ color: "red" }}></span>
                            </Col>)}
                            <Col md="2" sm="12" id="LooseWheat331">
                                <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot3"
                                    url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                                <span id='BagCuttingType3Lot3_Error' style={{ color: 'red' }} ></span>
                            </Col>
                        <Col md="2" sm="12" id="LooseWheat332">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot3", "Charges3Lot3","NoofBags3Lot3")} />
                            <span id='BagCuttingVendor3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12" id="LooseWheat333">
                            <CustomTextInput label={""} form={form} id="Charges3Lot3" type="text" disabled />
                            <span id='Charges3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    </div>


                    <Row>
                        <Col md="3" sm="12"></Col>
                        <Col md="2" sm="12">
                            <CustomTextInput label={"Total Bags"} form={form} id="TotalBags" type="text" disabled />
                        </Col>
                    </Row>


                    <HrLine header={"Planning Lot Details"} />

                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Lot No 1"} form={form} id="LotNo1" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Planning Qty"} form={form} id="PlanningQty1" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"SAP Qty"} form={form} id="SAPQty1" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Movement Qty in KG"} form={form} id="MovementQty1" type="text"
                                onChange={(e) => CalcMovementQty(e, "MovementQty1","SAPQty1")} />
                            <span id='MovementQty1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    <div id="hiddenLotNo2">
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Lot No 2"} form={form} id="LotNo2" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Planning Qty"} form={form} id="PlanningQty2" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"SAP Qty"} form={form} id="SAPQty2" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Movement Qty in KG"} form={form} id="MovementQty2" type="text"
                                onChange={(e) => CalcMovementQty(e, "MovementQty2","SAPQty2")} />
                            <span id='MovementQty2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    </div>
                    <div id="hiddenLotNo3">
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Lot No 3"} form={form} id="LotNo3" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Planning Qty"} form={form} id="PlanningQty3" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"SAP Qty"} form={form} id="SAPQty3" type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Movement Qty in KG"} form={form} id="MovementQty3" type="text"
                                onChange={(e) => CalcMovementQty(e, "MovementQty3","SAPQty3")} />
                            <span id='MovementQty3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    </div>

                    <Row>
                        <Col md="9" sm="12"></Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Total MovementQty"} form={form} id="TotalMovementQty" type="text" disabled />
                            <span id='TotalMovementQty_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    <HrLine />
                    <Row>
                        {/* <Col md="10" sm="12"></Col> */}
                        {/* <Col md="3" sm="12">
                            <CustomTextInput label={"Reject Reason"} form={form} id="RejectReason" type="text" />
                        </Col>
                        <Col md="7" sm="12">
                           <br />
                            <Button.Ripple color="danger" type="button" onClick={(e) => Reject_PO(e, form.values.RejectReason)} >Reject</Button.Ripple>
                        </Col> */}
                        <Col md="12" sm="12" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button" onClick={(e) => Save_PO(e)} >Submit</Button.Ripple>
                        </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    )
};
export default WhLoadingUpdateLot;
