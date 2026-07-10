import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { useLoader } from "../../../utility/hooks/useLoader";

import { Card, CardBody, CardHeader, CardTitle } from "reactstrap";
import { Button, Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../../forms/custom-form";
import { HrLine } from "../../common/HrLine";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { apiBaseUrl,  sapFileShare,  uploadUrl } from "../../../urlConstants";
import { errorToast, ShowToast } from "../common/appHelper";
import { apiPostMethod } from "../../../helper/axiosHelper";

import Uploader from "../../Uploader";


let WhLoadingUpdateLotEdit = () => {
    let { showLoader, hideLoader } = useLoader();
    const [LoadedLot1, setLoadedLot1] = useState([]);
    const [LoadedLot2, setLoadedLot2] = useState([]);
    const [LoadedLot3, setLoadedLot3] = useState([]);
    const [POLineItemList, setPOLineItemList] = useState([]);
    const [VANumber, setVANumber] = useState("");
    const [validateForm, setvalidateForm] = useState(false);
    const [isOwnWb, setisOwnWb] = useState(false);
    const [attachedFiles, setAttachment] = useState({ first_weighment_attachment: {}, second_weighment_attachment: {} });
    const [ImgData, setImgData] = useState({});
    const [PoNoOptions, setPoNoOptions] = useState({});
    const [UnloadingLot1, setUnloadingLot1] = useState([]);
    const history = useHistory();

    // console.log("useParams :", useParams()); 

    let { ponum, vanum } = useParams();
    let refid = '';
    // vanum = "RMIASSIL2200000001";
    // ponum= "1000078954";

    if (ponum) {
        ponum = ponum.replace(":", "");
        vanum = vanum.replace(":", "");  
    }

    // console.log("ponum :", ponum);
    // console.log("vanum :", vanum);

    const form = useFormik({
        initialErrors: false,
        initialValues: {},
        validationSchema: getValidationSchema(),
    });

    const initialState = {};

    useEffect(() => { 

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

        getIASDet(ponum, vanum); 
    }, [vanum]);

    // useEffect(() => { getVADet(refid); }, []);
    useEffect(() => { if(form.values.POLineItem1 && form.values.POLineItem1.value) getSegmentDet(form.values.POLineItem1.value,0);}, [form.values.POLineItem1]);
    useEffect(() => { if(form.values.POLineItem2 && form.values.POLineItem2.value) getSegmentDet(form.values.POLineItem2.value,1);}, [form.values.POLineItem2]);
    useEffect(() => { if(form.values.POLineItem3 && form.values.POLineItem3.value) getSegmentDet(form.values.POLineItem3.value,2);}, [form.values.POLineItem3]);
    // useEffect(() => { getPlanninglotDet(form.values.LoadedLotNo);}, [form.values.LoadedLotNo]);

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

    

    


    const getSegmentDet = (PO_Line_Item, idx) => {

        // console.log("getSegmentDet", PO_Line_Item);
        // console.log("PO Number", form.values.PONumber);
        let Segment_Id = "";
        const po = { ...form.values.PONumber }
        const { value, label } = po;
         let Po_No = value;

        //let PO_Line_Item_List = { ...PO_Line_Item };
        // Object.keys(PO_Line_Item_List).forEach((k) => {
            //console.log(k ," ASDF ", PO_Line_Item_List[k].value, "PO No ", Po_No);

            let fdata = {
                PO_No: Po_No,
                PO_Line: PO_Line_Item,
            }
            showLoader();
            // apiPostMethod(apiBaseUrl + 'warehouse/Master/getSegmentDet', fdata)
            apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getSegmentDet', fdata)
                .then((response) => {
                    const { data } = response;
                    // console.log("SEGMENT Details :", data.results);
                    if (data.success) {
                        if (idx == 0) {

                            form.setValues({
                                ...form.values,
                                SegmentId1: data.results[0].SEG_ID,
                                Segment1: data.results[0].Segment,
                                WheatVariety1: data.results[0].WheatVariety
                            });
                            getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, idx); 
                        } else if (idx == 1) {

                            form.setValues({
                                ...form.values,
                                SegmentId2: data.results[0].SEG_ID,
                                Segment2: data.results[0].Segment,
                                WheatVariety2: data.results[0].WheatVariety
                            });
                            getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, idx);
                        } else if (idx == 2) {

                            form.setValues({
                                ...form.values,
                                SegmentId3: data.results[0].SEG_ID,
                                Segment3: data.results[0].Segment,
                                WheatVariety3: data.results[0].WheatVariety
                            });

                            getLotBySegment(data.results[0].SEG_ID, data.results[0].SendingPlant, idx);
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
        // });
    }

    const getLotBySegment = (SegmentId, PlantId, Iteration) => {
        // console.log("getLotBySegment", SegmentId);

        let fdata = {
            SegmentId: SegmentId,
            PlantId: PlantId,
            screentype:'REVERSALEDIT'
        };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getLotBySegment', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getLotBySegment', fdata)
            .then((response) => {
                const { data } = response;
                // console.log("getLotBySegment :",data.results);
                if (data.success) {
                    if (Iteration == 0) {
                        setLoadedLot1(data.results);
                    } else if (Iteration == 1) {
                        setLoadedLot2(data.results);
                    } else if (Iteration == 2) {
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
            Wheat_Id: Segment_Id,
            screentype:"REVERSALEDIT"
        };

        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getPlanninglotDet', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getPlanninglotDet', fdata)
            .then((response) => {
                const { data } = response;
                //console.log("getPlanninglotDet 123 :", data.success);

                //console.log("value:PlanningLot :",PlanningLot);
                if (data.success) {
                    //LotNo1 PlanningQty1 SAPQty1

                    // if (data.results.length <= 0) {
                    //     let msg = "Selected LOT not available in Movement Plan !!!"
                    //     confirmDialog({
                    //         title: "# Check Lot #",
                    //         description: msg,
                    //     }).then((res) => { });
                    // }

                    if (data.results[0].planqty === null || data.results[0].planqty === 0) {
                        errorToast("Selected LOT not available in Movement Plan !!!");
                        return;
                    }

                    if (Iteration == 1) {
                        // console.log("Testing");
                        form.setValues({
                            ...form.values,
                            LoadedLotNo1: { value: PlanningLot.value, label: PlanningLot.label },
                            LotNo1: data.results[0].lotno,
                            PlanningQty1: data.results[0].planqty === null ? '0' : data.results[0].planqty,
                            SAPQty1: data.results[0].SAP_Qty,

                            // Selected Lot First 4 Char => Sending Storage Location
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
                //errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    // const onchangeBagCutting = (e, Vendor, Charges) => {
    //     const { value, label } = e;
    //     form.setValues({
    //         ...form.values,
    //         [Vendor]: { label: e.label, value: e.value },
    //         [Charges]: e.label.split("|")[1]
    //     });
    // }

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

    const CalcBagCount = (e, Column_Id,Element_Id_1, Element_Id_2, Element_Id_3, mode="") => {
        const { value, label } = e;
        //console.log(e.name);
        if(mode=="")
        form.setFieldValue([Column_Id], { label: e.label, value: e.value });

        if (e.label){
        if (e.label == "Loose Wheat|0.00") {
            document.getElementById([Element_Id_1]).style.display = "";
            document.getElementById([Element_Id_2]).style.display = "";
            document.getElementById([Element_Id_3]).style.display = "";
        }else{
            document.getElementById([Element_Id_1]).style.display = "none";
            document.getElementById([Element_Id_2]).style.display = "none";
            document.getElementById([Element_Id_3]).style.display = "none";
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
            if(mode==""){
            form.setValues({
                ...form.values,
                [Column_Id]: { label: e.label, value: e.value },
                NetWeight: NetWt,
                GunnylessWeight: GunnyLessWt,
                TotalBags: TotalBagCount,
                GunnyWeight: TotalGunnyWt
            });
            }
        } else if (Column_Id === "NoofBags1Lot1" || Column_Id === "NoofBags2Lot1" || Column_Id === "NoofBags3Lot1" ||
            Column_Id === "NoofBags1Lot2" || Column_Id === "NoofBags2Lot2" || Column_Id === "NoofBags3Lot2" ||
            Column_Id === "NoofBags1Lot3" || Column_Id === "NoofBags2Lot3" || Column_Id === "NoofBags3Lot3") {
                if(mode==""){
            form.setValues({
                ...form.values,
                [Column_Id]: e.target.value,
                NetWeight: NetWt,
                GunnylessWeight: GunnyLessWt,
                TotalBags: TotalBagCount,
                GunnyWeight: TotalGunnyWt
            });
            }
        }
            // console.log("form.values.BagCuttingVendor1Lot1", form.values.BagCuttingVendor1Lot1);
            
            form.values.BagCuttingVendor1Lot1 && form.values.BagCuttingVendor1Lot1.label && form.setFieldValue('Charges1Lot1', NoofBags1Lot1 * form.values.BagCuttingVendor1Lot1.label.split("|")[1]);
            form.values.BagCuttingVendor2Lot1 && form.values.BagCuttingVendor2Lot1.label && form.setFieldValue('Charges2Lot1', NoofBags2Lot1 * form.values.BagCuttingVendor2Lot1.label.split("|")[1]);
            form.values.BagCuttingVendor3Lot1 && form.values.BagCuttingVendor3Lot1.label && form.setFieldValue('Charges3Lot1', NoofBags3Lot1 * form.values.BagCuttingVendor3Lot1.label.split("|")[1]);

            form.values.BagCuttingVendor1Lot2 && form.values.BagCuttingVendor1Lot2.label && form.setFieldValue('Charges1Lot2', NoofBags1Lot2 * form.values.BagCuttingVendor1Lot2.label.split("|")[1]);
            form.values.BagCuttingVendor2Lot2 && form.values.BagCuttingVendor2Lot2.label && form.setFieldValue('Charges2Lot2', NoofBags2Lot2 * form.values.BagCuttingVendor2Lot2.label.split("|")[1]);
            form.values.BagCuttingVendor3Lot2 && form.values.BagCuttingVendor3Lot2.label && form.setFieldValue('Charges3Lot2', NoofBags3Lot2 * form.values.BagCuttingVendor3Lot2.label.split("|")[1]);

            form.values.BagCuttingVendor1Lot3 && form.values.BagCuttingVendor1Lot3.label && form.setFieldValue('Charges1Lot3', NoofBags1Lot3 * form.values.BagCuttingVendor1Lot3.label.split("|")[1]);
            form.values.BagCuttingVendor2Lot3 && form.values.BagCuttingVendor2Lot3.label && form.setFieldValue('Charges2Lot3', NoofBags2Lot3 * form.values.BagCuttingVendor2Lot3.label.split("|")[1]);
            form.values.BagCuttingVendor3Lot3 && form.values.BagCuttingVendor3Lot3.label && form.setFieldValue('Charges3Lot3', NoofBags3Lot3 * form.values.BagCuttingVendor3Lot3.label.split("|")[1]);
            
        

        //return TotalBagCount;
        // console.log("TotalBagCount :", TotalBagCount);
        // console.log("TotalGunnyWt :", TotalGunnyWt);
    }

    const Rec_CalcBagCount = (e, Column_Id, Element_Id_1, Element_Id_2, Element_Id_3) => {

        const { value, label } = e;

        form.setFieldValue([Column_Id], { label: e.label, value: e.value });
        if(e.label){
        if (e.label == "Loose Wheat|0.00") {
            document.getElementById([Element_Id_1]).style.display = "";
            document.getElementById([Element_Id_2]).style.display = "";
            document.getElementById([Element_Id_3]).style.display = "";
        }else{
            document.getElementById([Element_Id_1]).style.display = "none";
            document.getElementById([Element_Id_2]).style.display = "none";
            document.getElementById([Element_Id_3]).style.display = "none";
        }
        }

        let Rec_BagWt1 = 0;
        let Rec_BagType1Lot1 = Column_Id === "Rec_BagType1Lot1" ? e.label : form.values.Rec_BagType1Lot1 ? form.values.Rec_BagType1Lot1.label : "";
        if (Rec_BagType1Lot1) {
            Rec_BagWt1 = Rec_BagType1Lot1.split("|")[1];
            Rec_BagWt1 = Rec_BagWt1.replace('KGs', '');
        }

        let Rec_BagWt2 = 0;
        let Rec_BagType2Lot1 = Column_Id === "Rec_BagType2Lot1" ? e.label : form.values.Rec_BagType2Lot1 ? form.values.Rec_BagType2Lot1.label : "";
        if (Rec_BagType2Lot1) {
            Rec_BagWt2 = Rec_BagType2Lot1.split("|")[1];
            Rec_BagWt2 = Rec_BagWt2.replace('KGs', '');
        }

        let Rec_BagWt3 = 0;
        let Rec_BagType3Lot1 = Column_Id === "Rec_BagType3Lot1" ? e.label : form.values.Rec_BagType3Lot1 ? form.values.Rec_BagType3Lot1.label : "";
        if (Rec_BagType3Lot1) {
            Rec_BagWt3 = Rec_BagType3Lot1.split("|")[1];
            Rec_BagWt3 = Rec_BagWt3.replace('KGs', '');
        }

        let Rec_BagWt4 = 0;
        let Rec_BagType1Lot2 = Column_Id === "Rec_BagType1Lot2" ? e.label : form.values.Rec_BagType1Lot2 ? form.values.Rec_BagType1Lot2.label : "";
        if (Rec_BagType1Lot2) {
            Rec_BagWt4 = Rec_BagType1Lot2.split("|")[1];
            Rec_BagWt4 = Rec_BagWt4.replace('KGs', '');
        }

        let Rec_BagWt5 = 0;
        let Rec_BagType2Lot2 = Column_Id === "Rec_BagType2Lot2" ? e.label : form.values.Rec_BagType2Lot2 ? form.values.Rec_BagType2Lot2.label : "";
        if (Rec_BagType2Lot2) {
            Rec_BagWt5 = Rec_BagType2Lot2.split("|")[1];
            Rec_BagWt5 = Rec_BagWt5.replace('KGs', '');
        }

        let Rec_BagWt6 = 0;
        let Rec_BagType3Lot2 = Column_Id === "Rec_BagType3Lot2" ? e.label : form.values.Rec_BagType3Lot2 ? form.values.Rec_BagType3Lot2.label : "";
        if (Rec_BagType3Lot2) {
            Rec_BagWt6 = Rec_BagType3Lot2.split("|")[1];
            Rec_BagWt6 = Rec_BagWt6.replace('KGs', '');
        }

        let Rec_BagWt7 = 0;
        let Rec_BagType1Lot3 = Column_Id === "Rec_BagType1Lot3" ? e.label : form.values.Rec_BagType1Lot3 ? form.values.Rec_BagType1Lot3.label : "";
        if (Rec_BagType1Lot3) {
            Rec_BagWt7 = Rec_BagType1Lot3.split("|")[1];
            Rec_BagWt7 = Rec_BagWt7.replace('KGs', '');
        }

        let Rec_BagWt8 = 0;
        let Rec_BagType2Lot3 = Column_Id === "Rec_BagType2Lot3" ? e.label : form.values.Rec_BagType2Lot3 ? form.values.Rec_BagType2Lot3.label : "";
        if (Rec_BagType2Lot3) {
            Rec_BagWt8 = Rec_BagType2Lot3.split("|")[1];
            Rec_BagWt8 = Rec_BagWt8.replace('KGs', '');
        }

        let Rec_BagWt9 = 0;
        let Rec_BagType3Lot3 = Column_Id === "Rec_BagType3Lot3" ? e.label : form.values.Rec_BagType3Lot3 ? form.values.Rec_BagType3Lot3.label : "";
        if (Rec_BagType3Lot3) {
            Rec_BagWt9 = Rec_BagType3Lot3.split("|")[1];
            Rec_BagWt9 = Rec_BagWt9.replace('KGs', '');
        }

        //return;

        //Lot 1 => 3 Bag Types
        let Rec_NoofBags1Lot1 = Column_Id === "Rec_NoofBags1Lot1" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags1Lot1 ? form.values.Rec_NoofBags1Lot1 : 0;
        let Rec_NoofBags2Lot1 = Column_Id === "Rec_NoofBags2Lot1" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags2Lot1 ? form.values.Rec_NoofBags2Lot1 : 0;
        let Rec_NoofBags3Lot1 = Column_Id === "Rec_NoofBags3Lot1" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags3Lot1 ? form.values.Rec_NoofBags3Lot1 : 0;
    
        //Lot 2 => 3 Bag Types
        let Rec_NoofBags1Lot2 = Column_Id === "Rec_NoofBags1Lot2" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags1Lot2 ? form.values.Rec_NoofBags1Lot2 : 0;
        let Rec_NoofBags2Lot2 = Column_Id === "Rec_NoofBags2Lot2" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags2Lot2 ? form.values.Rec_NoofBags2Lot2 : 0;
        let Rec_NoofBags3Lot2 = Column_Id === "Rec_NoofBags3Lot2" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags3Lot2 ? form.values.Rec_NoofBags3Lot2 : 0;
        

        //Lot 3 => 3 Bag Types
        let Rec_NoofBags1Lot3 = Column_Id === "Rec_NoofBags1Lot3" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags1Lot3 ? form.values.Rec_NoofBags1Lot3 : 0;
        let Rec_NoofBags2Lot3 = Column_Id === "Rec_NoofBags2Lot3" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags2Lot3 ? form.values.Rec_NoofBags2Lot3 : 0;
        let Rec_NoofBags3Lot3 = Column_Id === "Rec_NoofBags3Lot3" ? e.target.value?e.target.value:"0" : form.values.Rec_NoofBags3Lot3 ? form.values.Rec_NoofBags3Lot3 : 0;

        let BagCount_Lot1 = parseFloat(Rec_NoofBags1Lot1) + parseFloat(Rec_NoofBags2Lot1) + parseFloat(Rec_NoofBags3Lot1);
        let BagCount_Lot2 = parseFloat(Rec_NoofBags1Lot2) + parseFloat(Rec_NoofBags2Lot2) + parseFloat(Rec_NoofBags3Lot2);
        let BagCount_Lot3 = parseFloat(Rec_NoofBags1Lot3) + parseFloat(Rec_NoofBags2Lot3) + parseFloat(Rec_NoofBags3Lot3);

        let TotalBagCount = parseFloat(BagCount_Lot1) + parseFloat(BagCount_Lot2) + parseFloat(BagCount_Lot3);

        let GunnyWt_Lot1 = parseFloat(Rec_NoofBags1Lot1 * Rec_BagWt1) + parseFloat(Rec_NoofBags2Lot1 * Rec_BagWt2) + parseFloat(Rec_NoofBags3Lot1 * Rec_BagWt3);
        let GunnyWt_Lot2 = parseFloat(Rec_NoofBags1Lot2 * Rec_BagWt4) + parseFloat(Rec_NoofBags2Lot2 * Rec_BagWt5) + parseFloat(Rec_NoofBags3Lot2 * Rec_BagWt6);
        let GunnyWt_Lot3 = parseFloat(Rec_NoofBags1Lot3 * Rec_BagWt7) + parseFloat(Rec_NoofBags2Lot3 * Rec_BagWt8) + parseFloat(Rec_NoofBags3Lot3 * Rec_BagWt9);

        let TotalGunnyWt = parseFloat(GunnyWt_Lot1) + parseFloat(GunnyWt_Lot2) + parseFloat(GunnyWt_Lot3);
        TotalGunnyWt = TotalGunnyWt.toFixed(3);


        let NetWt = form.values.NetWeight ? form.values.NetWeight : 0;
        let GunnyLessWt = parseFloat(NetWt) - parseFloat(TotalGunnyWt);
        GunnyLessWt = GunnyLessWt.toFixed(3);

        

        if (Column_Id === "Rec_BagType1Lot1" || Column_Id === "Rec_BagType2Lot1" || Column_Id === "Rec_BagType3Lot1" ||
            Column_Id === "Rec_BagType1Lot2" || Column_Id === "Rec_BagType2Lot2" || Column_Id === "Rec_BagType3Lot2" ||
            Column_Id === "Rec_BagType1Lot3" || Column_Id === "Rec_BagType2Lot3" || Column_Id === "Rec_BagType3Lot3") {
            form.setValues({
                ...form.values,
                [Column_Id]: { label: e.label, value: e.value },
                netWt: NetWt,
                gunnylessWt: GunnyLessWt,
                gunnyWt: TotalGunnyWt
            });
        } else if (Column_Id === "Rec_NoofBags1Lot1" || Column_Id === "Rec_NoofBags2Lot1" || Column_Id === "Rec_NoofBags3Lot1" ||
            Column_Id === "Rec_NoofBags1Lot2" || Column_Id === "Rec_NoofBags2Lot2" || Column_Id === "Rec_NoofBags3Lot2" ||
            Column_Id === "Rec_NoofBags1Lot3" || Column_Id === "Rec_NoofBags2Lot3" || Column_Id === "Rec_NoofBags3Lot3") {
            form.setValues({
                ...form.values,
                [Column_Id]: e.target.value,
                netWt: NetWt,
                gunnylessWt: GunnyLessWt,
                gunnyWt: TotalGunnyWt
            });
        }
    }

    const getVADet = (id) => {
        // console.log("getVADet", id);
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
        setPOLineItemList(initState);
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getPODetails', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getPODetails', fdata)
            .then((response) => {
                const { data } = response;

                console.log("PO Details :",data.results);

                if (data.success) {
                    setPOLineItemList([data.results[0].PoLineItem ? { value: data.results[0].PoLineItem, label: data.results[0].PoLineItem } : '',
                    data.results[1].PoLineItem ? { value: data.results[1].PoLineItem, label: data.results[1].PoLineItem } : '',
                    data.results[2].PoLineItem ? { value: data.results[2].PoLineItem, label: data.results[2].PoLineItem } : '']);

                    form.setValues({
                        ...form.values,
                        SendingPlant: data.results[0].SendingPlant,
                        SendingStorageLocation: data.results[0].SendingStorageLocation,
                        ReceivingPlant: data.results[0].SendingPlant,
                        ReceivingStorageLocation: data.results[0].SendingStorageLocation,
                    });
                    form.setFieldValue('PONumber', { value: e.value, label: e.label });

                    //getLoadedLot(Segment[0],Segment[1],Segment[2]);
                    getWeight(form.values.VANumber);

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
        showError('LoadingVendor_Error', 'Select Loading Vendor', 0);
        showError('LoadingCharges_Error', 'Enter Loading Charges', 0);
        showError('PONumber_Error', 'Select PO Number', 0);
        
        showError('POLineItem1_Error', 'Select PO LineItem 1', 0);
        showError('POLineItem2_Error', 'Select PO LineItem 2', 0);
        showError('POLineItem3_Error', 'Select PO LineItem 3', 0);

        showError('ReceivingBin_Error', 'Select PO LineItem', 0);

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


        //Receiving Plant
        if (!isOwnWb) {

            // console.log("isOwnWb", isOwnWb);

            showError('FirstWeight_Error', 'Enter First Weight', 0);
            showError('SecondWeight_Error', 'Enter Second Weight', 0);

            /*showError('first_weighment_attachment_Error', 'Upload First Weight Receipt', 0);
            showError('second_weighment_attachment_Error', 'Upload Second Weight Receipt', 0);
            /*
            Mohan Commented on 07112022 attachment cann't be edited
            if (/* formData.first_weighment_attachment && !formData.first_weighment_attachment && * /
                !attachedFiles.first_weighment_attachment.name /* && ImgData.first_weighment_attachment == null * /) {
                showError('first_weighment_attachment_Error', 'Upload First Weight Attachment', ShowError = 1);
            }
            if (/* formData.second_weighment_attachment && !formData.second_weighment_attachment && * /
                !attachedFiles.second_weighment_attachment.name  /* && ImgData.second_weighment_attachment == null * /) {
                showError('second_weighment_attachment_Error', 'Upload Second Weight Attachment', ShowError = 1);
            }
            */

            if (!formData.FirstWeight) { showError('FirstWeight_Error', 'Enter First Weight', 1); ShowError = 1; }
            if (!formData.SecondWeight) { showError('SecondWeight_Error', 'Enter Second Weight', 1); ShowError = 1; }
        }

        if (!formData.LastMileTransport) { showError('LastMileTransport_Error', 'Select last Mile Transporter', 1); ShowError = 1; }
        if (!formData.FreightCharges) { showError('FreightCharges_Error', 'Enter FreightCharges', 1); ShowError = 1; }
        if (!formData.LoadingVendor) { showError('LoadingVendor_Error', 'Select Loading Vendor', 1); ShowError = 1; }
        if (!formData.LoadingCharges) { showError('LoadingCharges_Error', 'Enter Loading Charges', 1); ShowError = 1; }
        if (!formData.PONumber) { showError('PONumber_Error', 'Select PO Number', 1); ShowError = 1; }

        // if (!formData.POLineItem1) { showError('POLineItem1_Error', 'Select PO LineItem1', 1); ShowError = 1; }
        // if (!formData.POLineItem2) { showError('POLineItem2_Error', 'Select PO LineItem2', 1); ShowError = 1; }
        // if (!formData.POLineItem3) { showError('POLineItem3_Error', 'Select PO LineItem3', 1); ShowError = 1; }
        
        if (!formData.ReceivingBin) { showError('ReceivingBin_Error', 'Select Receiving Bin', 1); ShowError = 1; }

/*
PO_LineItem: "10"
PO_LineItem2: "0"
PO_LineItem3: "0"
*/

        // loaded Lot 1
        if (formData.POLineItem1) {
            // console.log("formData.POLineItem[0] ", formData.POLineItem[0]);
            if (!formData.LoadedLotNo1) {
                showError('LoadedLotNo1_Error', 'Select Loaded Lot 1', 1); ShowError = 1;
            } else {
                if (!formData.BagType1Lot1 && !formData.BagType2Lot1 && !formData.BagType3Lot1) {
                    showError('BagType1Lot1_Error', 'Select Lot 1 BagType1', 1); ShowError = 1;
                    showError('BagType2Lot1_Error', 'Select Lot 1 BagType2', 1); ShowError = 1;
                    showError('BagType3Lot1_Error', 'Select Lot 1 BagType3', 1); ShowError = 1;
                } else {
                    if (formData.BagType1Lot1) {
                        if (!formData.NoofBags1Lot1) { showError('NoofBags1Lot1_Error', 'Enter Lot 1 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType1Lot1.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType1Lot1) { showError('BagCuttingType1Lot1_Error', 'Select Lot 1 BagCuttingType1', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor1Lot1) { showError('BagCuttingVendor1Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges1Lot1) { showError('Charges1Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType2Lot1) {
                        if (!formData.NoofBags2Lot1) { showError('NoofBags2Lot1_Error', 'Enter Lot 1 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType2Lot1.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType2Lot1) { showError('BagCuttingType2Lot1_Error', 'Select Lot 1 BagCuttingType2', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor2Lot1) { showError('BagCuttingVendor2Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges2Lot1) { showError('Charges2Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType3Lot1) {
                        if (!formData.NoofBags3Lot1) { showError('NoofBags3Lot1_Error', 'Enter Lot 1 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType3Lot1.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType3Lot1) { showError('BagCuttingType3Lot1_Error', 'Select Lot 1 BagCuttingType3', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor3Lot1) { showError('BagCuttingVendor3Lot1_Error', 'Select Lot 1 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges3Lot1) { showError('Charges3Lot1_Error', 'Check Lot 1 Vendor Charges', 1); ShowError = 1; }
                        }
                    }
                }
                if (!formData.MovementQty1) { showError('MovementQty1_Error', 'Enter Lot 1 Movement Qty', 1); ShowError = 1; }
            }
        }

        // loaded Lot 2
        if (formData.POLineItem2) {
            // console.log("formData.POLineItem[1] ", formData.POLineItem[1]);
            if (!formData.LoadedLotNo2) {
                showError('LoadedLotNo2_Error', 'Select Loaded Lot 2', 1); ShowError = 1;
            } else {
                if (!formData.BagType1Lot2 && !formData.BagType2Lot2 && !formData.BagType3Lot2) {
                    showError('BagType1Lot2_Error', 'Select Lot 2 BagType1', 1); ShowError = 1;
                    showError('BagType2Lot2_Error', 'Select Lot 2 BagType2', 1); ShowError = 1;
                    showError('BagType3Lot2_Error', 'Select Lot 2 BagType3', 1); ShowError = 1;

                } else {
                    if (formData.BagType1Lot2) {
                        if (!formData.NoofBags1Lot2) { showError('NoofBags1Lot2_Error', 'Enter Lot 2 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType1Lot2.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType1Lot2) { showError('BagCuttingType1Lot2_Error', 'Select Lot 2 BagCuttingType2', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor1Lot2) { showError('BagCuttingVendor1Lot2_Error', 'Select Lot 2 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges1Lot2) { showError('Charges1Lot2_Error', 'Check Lot 2 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType2Lot2) {
                        if (!formData.NoofBags2Lot2) { showError('NoofBags2Lot2_Error', 'Enter Lot 2 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType2Lot2.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType2Lot2) { showError('BagCuttingType2Lot2_Error', 'Select Lot 2 BagCuttingType2', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor2Lot2) { showError('BagCuttingVendor2Lot2_Error', 'Select Lot 2 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges2Lot2) { showError('Charges2Lot2_Error', 'Check Lot 2 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType3Lot2) {
                        if (!formData.NoofBags3Lot2) { showError('NoofBags3Lot2_Error', 'Enter Lot 2 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType3Lot2.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType3Lot2) { showError('BagCuttingType3Lot2_Error', 'Select Lot 2 BagCuttingType3', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor3Lot2) { showError('BagCuttingVendor3Lot2_Error', 'Select Lot 2 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges3Lot2) { showError('Charges3Lot2_Error', 'Check Lot 2 Vendor Charges', 1); ShowError = 1; }
                        }
                    }
                }
                if (!formData.MovementQty2) { showError('MovementQty2_Error', 'Enter Lot 2 Movement Qty', 1); ShowError = 1; }
            }
        }


        // loaded Lot 3
        if (formData.POLineItem3) {
            // console.log("formData.POLineItem[2] ", formData.POLineItem[2]);
            if (!formData.LoadedLotNo3) {
                showError('LoadedLotNo3_Error', 'Select Loaded Lot 3', 1); ShowError = 1;
            } else {
                if (!formData.BagType1Lot2 && !formData.BagType2Lot2 && !formData.BagType3Lot2) {
                    showError('BagType1Lot3_Error', 'Select Lot 3 BagType1', 1); ShowError = 1;
                    showError('BagType2Lot3_Error', 'Select Lot 3 BagType2', 1); ShowError = 1;
                    showError('BagType3Lot3_Error', 'Select Lot 3 BagType3', 1); ShowError = 1;
                } else {
                    if (formData.BagType1Lot3) {
                        if (!formData.NoofBags1Lot3) { showError('NoofBags1Lot3_Error', 'Enter Lot 3 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType1Lot3.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType1Lot3) { showError('BagCuttingType1Lot3_Error', 'Select Lot 3 BagCuttingType2', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor1Lot3) { showError('BagCuttingVendor1Lot3_Error', 'Select Lot 3 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges1Lot3) { showError('Charges1Lot3_Error', 'Check Lot 3 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType2Lot3) {
                        if (!formData.NoofBags2Lot3) { showError('NoofBags2Lot3_Error', 'Enter Lot 3 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType2Lot3.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType2Lot3) { showError('BagCuttingType2Lot3_Error', 'Select Lot 3 BagCuttingType2', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor2Lot3) { showError('BagCuttingVendor2Lot3_Error', 'Select Lot 3 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges2Lot3) { showError('Charges2Lot2_Error', 'Check Lot 3 Vendor Charges', 1); ShowError = 1; }
                        }
                    }

                    if (formData.BagType3Lot3) {
                        if (!formData.NoofBags3Lot3) { showError('NoofBags3Lot3_Error', 'Enter Lot 3 No.oF Bags', 1); ShowError = 1; }
                        if (formData.BagType3Lot3.label === "Loose Wheat|0.00") {
                            if (!formData.BagCuttingType3Lot3) { showError('BagCuttingType3Lot3_Error', 'Select Lot 3 BagCuttingType3', 1); ShowError = 1; }
                            if (!formData.BagCuttingVendor3Lot3) { showError('BagCuttingVendor3Lot3_Error', 'Select Lot 3 Bag Cutting Vendor', 1); ShowError = 1; }
                            if (!formData.Charges3Lot3) { showError('Charges3Lot3_Error', 'Check Lot 3 Vendor Charges', 1); ShowError = 1; }
                        }
                    }
                }
                if (!formData.MovementQty3) { showError('MovementQty3_Error', 'Enter Lot 3 Movement Qty', 1); ShowError = 1; }
            }
        }
        
        if (parseFloat(formData.GunnylessWeight) !== parseFloat(formData.TotalMovementQty)){ showError('TotalMovementQty_Error', 'Check Gunnyless Weight & Total Movement Qty', 1); ShowError = 1;}
        if (ShowError == 1) { 
            errorToast("Error");
            return true; }
    }

    const Save_PO = (e) => {
        if (isFilledAll()) {
            errorToast("Error while SAVE"); 
            return false;
        }

        let fdata = {
            
            EditFlag:true,

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

            LastMileTransportid: form.values.LastMileTransport.value,
            LastMileTransport: form.values.LastMileTransport.label,

            FreightCharges: form.values.FreightCharges,

            LoadingVendorid: form.values.LoadingVendor.value,
            LoadingVendor: form.values.LoadingVendor.label,

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
            VehicleStatus: "5",


            Rec_UnloadLotid1:form.values.Rec_LoadedLotNo1.value,
            Rec_UnloadLotNo1:form.values.Rec_LoadedLotNo1.label,

            Rec_BagType1Lot1_Id:form.values.Rec_BagType1Lot1.value,
            Rec_BagType1Lot1:form.values.Rec_BagType1Lot1.label,
            Rec_NoofBags1Lot1:form.values.Rec_NoofBags1Lot1,
            Rec_BagCuttingType1Lot1_Id:form.values.Rec_BagCuttingType1Lot1?form.values.Rec_BagCuttingType1Lot1.value:'',
            Rec_BagCuttingType1Lot1:form.values.Rec_BagCuttingType1Lot1?form.values.Rec_BagCuttingType1Lot1.label:'',
            Rec_BagCuttingVendor1Lot1_Id:form.values.Rec_BagCuttingVendor1Lot1?form.values.Rec_BagCuttingVendor1Lot1.value:'',
            Rec_BagCuttingVendor1Lot1:form.values.Rec_BagCuttingVendor1Lot1?form.values.Rec_BagCuttingVendor1Lot1.label:'',
            Rec_Charges1Lot1:form.values.Rec_Charges1Lot1?form.values.Rec_Charges1Lot1:0,

            Rec_BagType2Lot1_Id:form.values.Rec_BagType2Lot1.value,
            Rec_BagType2Lot1:form.values.Rec_BagType2Lot1.label,
            Rec_NoofBags2Lot1:form.values.Rec_NoofBags2Lot1,
            Rec_BagCuttingType2Lot1_Id:form.values.Rec_BagCuttingType2Lot1?form.values.Rec_BagCuttingType2Lot1.value:'',
            Rec_BagCuttingType2Lot1:form.values.Rec_BagCuttingType2Lot1?form.values.Rec_BagCuttingType2Lot1.label:'',
            Rec_BagCuttingVendor2Lot1_Id:form.values.Rec_BagCuttingVendor2Lot1?form.values.Rec_BagCuttingVendor2Lot1.value:'',
            Rec_BagCuttingVendor2Lot1:form.values.Rec_BagCuttingVendor2Lot1?form.values.Rec_BagCuttingVendor2Lot1.label:'',
            Rec_Charges2Lot1:form.values.Rec_Charges2Lot1?form.values.Rec_Charges2Lot1:0,

            Rec_BagType3Lot1_Id:form.values.Rec_BagType3Lot1.value,
            Rec_BagType3Lot1:form.values.Rec_BagType3Lot1.label,
            Rec_NoofBags3Lot1:form.values.Rec_NoofBags3Lot1,
            Rec_BagCuttingType3Lot1_Id:form.values.Rec_BagCuttingType3Lot1?form.values.Rec_BagCuttingType3Lot1.value:'',
            Rec_BagCuttingType3Lot1:form.values.Rec_BagCuttingType3Lot1?form.values.Rec_BagCuttingType3Lot1.label:'',
            Rec_BagCuttingVendor3Lot1_Id:form.values.Rec_BagCuttingVendor3Lot1?form.values.Rec_BagCuttingVendor3Lot1.value:'',
            Rec_BagCuttingVendor3Lot1:form.values.Rec_BagCuttingVendor3Lot1?form.values.Rec_BagCuttingVendor3Lot1.label:'',
            Rec_Charges3Lot1:form.values.Rec_Charges3Lot1?form.values.Rec_Charges3Lot1:0,

            UnloadingVendor_Id:form.values.UnloadingVendor.value,
            UnloadingVendor:form.values.UnloadingVendor.label,

            UnloadingCharges:form.values.UnloadingCharges,
            loadWt:form.values.loadWt,
            emptyWt:form.values.emptyWt,
            netWt:form.values.netWt,
            gunnyWt:form.values.gunnyWt,
            gunnylessWt:form.values.gunnylessWt

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
            else{
                SaveData(fdata); 
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


    }

    const Reject_PO = (e, RejectReason) => {
        let fdata = {
            VA_No: form.values.VANumber,
            VehicleStatus: "11",
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

    const getIASDet = (PoNum, VANum) => {
        // console.log("getLotBySegment", SegmentId);

        let fdata = {
            PO_No: PoNum,
            VA_No: VANum
        };
        showLoader();
        // apiPostMethod(apiBaseUrl + 'warehouse/Master/getIASPOEditDet', fdata)
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getIASPOEditDet', fdata)
            .then((response) => {
                const { data } = response;
                
                console.log("getIASDet Results :", data);

                const { IASDet, LotDet1, LotDet2, LotDet3, PoLineItemList, PlanDet1, PlanDet2, PlanDet3, RecLot, DD_PONo } = data.results;
                // console.log("getIASDet :", PoLineItemList);
                // let {PoLineItem} = PoLineItemList;
                // console.log(PoLineItem);
                
                // console.log("PlanDet1", PlanDet1[0]);

                if (data.success) {
                    let tempArray = [];
                    if (IASDet[0].PO_LineItem){
                        tempArray.push({value:IASDet[0].PO_LineItem, label:IASDet[0].PO_LineItem})
                    }
                    if (IASDet[0].PO_LineItem2 && IASDet[0].PO_LineItem2 !=="0"){
                        tempArray.push({value:IASDet[0].PO_LineItem2, label:IASDet[0].PO_LineItem2})
                    }
                    if (IASDet[0].PO_LineItem3 && IASDet[0].PO_LineItem3 !=="0"){
                        tempArray.push({value:IASDet[0].PO_LineItem3, label:IASDet[0].PO_LineItem3})
                    }
                    
                    // console.log("PO LINE ITEM", tempArray);

                    setPoNoOptions(DD_PONo);
                    setPOLineItemList(tempArray);

                    setLoadedLot1(LotDet1);
                    setLoadedLot2(LotDet2);
                    setLoadedLot3(LotDet3);
                    
                    //lot list by plant werks
                    setUnloadingLot1(RecLot)

                    CalcBagCount({value: IASDet[0].BagType1Lot1id, label:IASDet[0].BagType}, "BagType1Lot1","LooseWheat111","LooseWheat112","LooseWheat113", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType2Lot1id, label:IASDet[0].L1_BagType2}, "BagType2Lot1","LooseWheat211","LooseWheat212","LooseWheat213", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType3Lot1id, label:IASDet[0].L1_BagType3}, "BagType3Lot1","LooseWheat311","LooseWheat312","LooseWheat313", "NOTSETVALUES");

                    CalcBagCount({value: IASDet[0].BagType1Lot2id, label:IASDet[0].L2_BagType}, "BagType1Lot2","LooseWheat121","LooseWheat122","LooseWheat123", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType2Lot2id, label:IASDet[0].L2_BagType2}, "BagType2Lot2","LooseWheat221","LooseWheat222","LooseWheat223", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType3Lot2id, label:IASDet[0].L2_BagType3}, "BagType3Lot2","LooseWheat321","LooseWheat322","LooseWheat323", "NOTSETVALUES");

                    CalcBagCount({value: IASDet[0].BagType1Lot3id, label:IASDet[0].L3_BagType}, "BagType1Lot3","LooseWheat131","LooseWheat132","LooseWheat133", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType2Lot3id, label:IASDet[0].L3_BagType2}, "BagType2Lot3","LooseWheat231","LooseWheat232","LooseWheat233", "NOTSETVALUES");
                    CalcBagCount({value: IASDet[0].BagType3Lot3id, label:IASDet[0].L3_BagType3}, "BagType3Lot3","LooseWheat331","LooseWheat332","LooseWheat333", "NOTSETVALUES");

                    let BagCount_Lot1 = parseFloat(IASDet[0].L1_NoofBags) + parseFloat(IASDet[0].L1_NoofBags2) + parseFloat(IASDet[0].L1_NoofBags3);
                    let BagCount_Lot2 = parseFloat(IASDet[0].L2_NoofBags) + parseFloat(IASDet[0].L2_NoofBags2) + parseFloat(IASDet[0].L2_NoofBags3);
                    let BagCount_Lot3 = parseFloat(IASDet[0].L3_NoofBags) + parseFloat(IASDet[0].L3_NoofBags2) + parseFloat(IASDet[0].L3_NoofBags3);
            
                    let TotalBagCount = parseFloat(BagCount_Lot1) + parseFloat(BagCount_Lot2) + parseFloat(BagCount_Lot3);
                    let TotalMovementQty = parseFloat(IASDet[0].MovementQty1?IASDet[0].MovementQty1:0) + parseFloat(IASDet[0].MovementQty2?IASDet[0].MovementQty2:0) + parseFloat(IASDet[0].MovementQty3?IASDet[0].MovementQty3:0);

                    
                    if (IASDet[0].Rec_BagTypeid && IASDet[0].Rec_BagTypeid != "") {
                        Rec_CalcBagCount({ value: IASDet[0].Rec_BagTypeid, label:IASDet[0].Rec_BagType }, "Rec_BagType1Lot1", "Rec_LooseWheat111","Rec_LooseWheat112","Rec_LooseWheat113")
                    }
                    if (IASDet[0].Rec_BagTypeid2 && IASDet[0].Rec_BagTypeid2 != "") {
                        Rec_CalcBagCount({ value: IASDet[0].Rec_BagTypeid2, label: IASDet[0].Rec_BagType2 }, "Rec_BagType2Lot1", "Rec_LooseWheat211", "Rec_LooseWheat212", "Rec_LooseWheat213")
                    }
                    if (IASDet[0].Rec_BagTypeid3 && IASDet[0].Rec_BagTypeid3 != "") {
                        Rec_CalcBagCount({ value: IASDet[0].Rec_BagTypeid3, label: IASDet[0].Rec_BagType3 }, "Rec_BagType3Lot1", "Rec_LooseWheat311", "Rec_LooseWheat312", "Rec_LooseWheat313")
                    }

                    setisOwnWb(false);
                    document.getElementById("outsideWB").style.display = "";
                    if (IASDet[0].WbType === "Own WB") {
                        setisOwnWb(true);
                        document.getElementById("outsideWB").style.display = "none";
                    }                        

                   
                    form.setValues({
                        
                        ...form.values,
                        VANumber:IASDet[0].ZVA_NUMBER,
                        TruckNumber:IASDet[0].TRUCK_NO,
                        DriverNumber:IASDet[0].DRIVER_NO,

                        LastMileTransport:{value: IASDet[0].LastMileTransporterId, label:IASDet[0].LastMileTransporter},
                        FreightCharges:IASDet[0].FreightChargesPerTon,
                        LoadingVendor:{value: IASDet[0].LoadingVendorId, label:IASDet[0].LoadingVendor},
                        LoadingCharges:IASDet[0].LoadingChargesPerTon ,
                        
                        ReceivingBin:{value: IASDet[0].ReceivingBin_id, label:IASDet[0].ReceivingBin_Name},

                        PONumber:{value: IASDet[0].PO_Number, label:IASDet[0].PO_Number},
                        
                        
                        // PoLineItem:[{value:IASDet[0].PO_LineItem, label:IASDet[0].PO_LineItem},
                        //             {value:IASDet[0].PO_LineItem2, label:IASDet[0].PO_LineItem2},
                        //             {value:IASDet[0].PO_LineItem3, label:IASDet[0].PO_LineItem3}],
                        
                        
                        //Mohan 03-10-2022 Commented duplicate ReceivingBin:{value:IASDet[0].ReceivingBin_id ,label:IASDet[0].ReceivingBin_Name},
                        Segment1:IASDet[0].Segment,
                        WheatVariety1:IASDet[0].WheatVariety,
                        Segment2:IASDet[0].Segment2,
                        WheatVariety2:IASDet[0].WheatVariety2,
                        Segment3:IASDet[0].Segment3,
                        WheatVariety3:IASDet[0].WheatVariety3,

                        ReceivingPlant:IASDet[0].ReceivingPlant,
                        ReceivingStorageLocation:IASDet[0].ReceivingStorageLocation,
                        SendingPlant:IASDet[0].SendingPlant,
                        SendingStorageLocation:IASDet[0].SendingStorageLocation,

                        FirstWeight:IASDet[0].WbEmptyWt,
                        SecondWeight:IASDet[0].WbLoadWt,
                        NetWeight:IASDet[0].WbNetWt,
                        GunnyWeight:IASDet[0].GunnyWt,
                        GunnylessWeight:IASDet[0].GunnyLessNetWt,

                        LoadedLotNo1:{value:IASDet[0].LoadedLotId, label:IASDet[0].LoadedLotNo},
                        LoadedLotNo2:{value:IASDet[0].LoadedLotId2, label:IASDet[0].LoadedLotNo2},
                        LoadedLotNo3:{value:IASDet[0].LoadedLotId3, label:IASDet[0].LoadedLotNo3},

                        BagType1Lot1:{value: IASDet[0].BagType1Lot1id, label:IASDet[0].BagType},
                        NoofBags1Lot1: IASDet[0].L1_NoofBags,
                        BagCuttingType1Lot1:{value: IASDet[0].BagCuttingType1Lot1id, label:IASDet[0].BagCuttingType1Lot1},
                        BagCuttingVendor1Lot1:{value: IASDet[0].BagCuttingVendor1Lot1id, label:IASDet[0].BagCuttingVendor1Lot1},
                        Charges1Lot1: IASDet[0].L1_CuttingCharges,

                        BagType2Lot1:{value: IASDet[0].BagType2Lot1id, label:IASDet[0].L1_BagType2},
                        NoofBags2Lot1: IASDet[0].L1_NoofBags2,
                        BagCuttingType2Lot1:{value: IASDet[0].BagCuttingType2Lot1id, label:IASDet[0].BagCuttingType2Lot1},
                        BagCuttingVendor2Lot1:{value: IASDet[0].BagCuttingVendo2Lot1id, label:IASDet[0].BagCuttingVendo2Lot1},
                        Charges2Lot1:IASDet[0].L1_CuttingCharges2,

                        BagType3Lot1:{value: IASDet[0].BagType3Lot1id, label:IASDet[0].L1_BagType3},
                        NoofBags3Lot1: IASDet[0].L1_NoofBags3,
                        BagCuttingType3Lot1:{value: IASDet[0].BagCuttingType3Lot1id, label:IASDet[0].BagCuttingType3Lot1},
                        BagCuttingVendor3Lot1:{value: IASDet[0].BagCuttingVendo3Lot1id, label:IASDet[0].BagCuttingVendo3Lot1},
                        Charges3Lot1:IASDet[0].L1_CuttingCharges3,
                        

                        BagType1Lot2:{value: IASDet[0].BagType1Lot2id, label:IASDet[0].L2_BagType},
                        NoofBags1Lot2: IASDet[0].L2_NoofBags,
                        BagCuttingType1Lot2:{value: IASDet[0].BagCuttingType1Lot2id, label:IASDet[0].BagCuttingType1Lot2},
                        BagCuttingVendor1Lot2:{value: IASDet[0].BagCuttingVendo1Lot2id, label:IASDet[0].BagCuttingVendo1Lot2},
                        Charges1Lot2:IASDet[0].L2_CuttingCharges,

                        BagType2Lot2:{value: IASDet[0].BagType2Lot2id, label:IASDet[0].L2_BagType2},
                        NoofBags2Lot2: IASDet[0].L2_NoofBags2,
                        BagCuttingType2Lot2:{value: IASDet[0].BagCuttingType2Lot2id, label:IASDet[0].BagCuttingType2Lot2},
                        BagCuttingVendor2Lot2:{value: IASDet[0].BagCuttingVendo2Lot2id, label:IASDet[0].BagCuttingVendo2Lot2},
                        Charges2Lot2:IASDet[0].L2_CuttingCharges2,

                        BagType3Lot2:{value: IASDet[0].BagType3Lot2id, label:IASDet[0].L2_BagType2},
                        NoofBags3Lot2:IASDet[0].L2_NoofBags3,
                        BagCuttingType3Lot2:{value: IASDet[0].BagCuttingType3Lot2id, label:IASDet[0].BagCuttingType3Lot2},
                        BagCuttingVendor3Lot2:{value: IASDet[0].BagCuttingVendo13Lot2id, label:IASDet[0].BagCuttingVendo13Lot2},
                        Charges3Lot2:IASDet[0].L2_CuttingCharges3,

                        BagType1Lot3:{value: IASDet[0].BagType1Lot3id, label:IASDet[0].L3_BagType},
                        NoofBags1Lot3: IASDet[0].L3_NoofBags,
                        BagCuttingType1Lot3:{value: IASDet[0].BagCuttingType1Lot3id, label:IASDet[0].BagCuttingType1Lot3},
                        BagCuttingVendor1Lot3:{value: IASDet[0].BagCuttingVendo1Lot3id, label:IASDet[0].BagCuttingVendo1Lot3},
                        Charges1Lot3:IASDet[0].L3_CuttingCharges,

                        BagType2Lot3:{value: IASDet[0].BagType2Lot3id, label:IASDet[0].L3_BagType2},
                        NoofBags2Lot3: IASDet[0].L3_NoofBags2,
                        BagCuttingType2Lot3:{value: IASDet[0].BagCuttingType2Lot3id, label:IASDet[0].BagCuttingType2Lot3},
                        BagCuttingVendor2Lot3:{value: IASDet[0].BagCuttingVendo2Lot3id, label:IASDet[0].BagCuttingVendo2Lot3},
                        Charges2Lot3:IASDet[0].L3_CuttingCharges2,

                        BagType3Lot3:{value: IASDet[0].BagType3Lot3id, label:IASDet[0].L3_BagType3},
                        NoofBags3Lot3:IASDet[0].L3_NoofBags3,
                        BagCuttingType3Lot3:{value: IASDet[0].BagCuttingType3Lot3id, label:IASDet[0].BagCuttingType3Lot3},
                        BagCuttingVendor3Lot3:{value: IASDet[0].BagCuttingVendo3Lot3id, label:IASDet[0].BagCuttingVendo3Lot3},
                        Charges3Lot3:IASDet[0].L3_CuttingCharges3,
                        TotalBags: TotalBagCount,

                        
                        LotNo1: PlanDet1[0] && PlanDet1[0].lotno?PlanDet1[0].lotno:'',
                        PlanningQty1: PlanDet1[0] && PlanDet1[0].planqty?PlanDet1[0].planqty:0,
                        SAPQty1: PlanDet1[0] && PlanDet1[0].SAP_Qty?PlanDet1[0].SAP_Qty:0,
                        MovementQty1: PlanDet1[0] && IASDet[0]?IASDet[0].MovementQty1:0,

                        LotNo2: PlanDet2[0]?PlanDet2[0].lotno:'',
                        PlanningQty2: PlanDet2[0]?PlanDet2[0].planqty:0,
                        SAPQty2: PlanDet2[0]?PlanDet2[0].SAP_Qty:0,
                        MovementQty2: IASDet[0]?IASDet[0].MovementQty2:0,

                        LotNo3: PlanDet3[0]?PlanDet3[0].lotno:'',
                        PlanningQty3: PlanDet3[0]?PlanDet3[0].planqty:0,
                        SAPQty3: PlanDet3[0]?PlanDet3[0].SAP_Qty:0,
                        MovementQty3: IASDet[0]?IASDet[0].MovementQty3:0,
                   
                        // POLineItem1: {value:IASDet[0].PO_LineItem,label:IASDet[0].PO_LineItem},
                        // POLineItem2: {value:IASDet[0].PO_LineItem2,label:IASDet[0].PO_LineItem2},
                        // POLineItem3: {value:IASDet[0].PO_LineItem3,label:IASDet[0].PO_LineItem3},
                        
                        TotalMovementQty:TotalMovementQty,
                        Rec_LoadedLotNo1:{value:IASDet[0].UnloadLotid, label: IASDet[0].UnloadLotName},
                        
                        Rec_BagType1Lot1:{value:IASDet[0].Rec_BagTypeid, label: IASDet[0].Rec_BagType},
                        Rec_NoofBags1Lot1:IASDet[0].Rec_no_bags,
                        Rec_BagType2Lot1:{value:IASDet[0].Rec_BagTypeid2, label: IASDet[0].Rec_BagType2},
                        Rec_NoofBags2Lot1:IASDet[0].Rec_no_bags2,
                        Rec_BagType3Lot1:{value:IASDet[0].Rec_BagTypeid3, label: IASDet[0].Rec_BagType3},
                        Rec_NoofBags3Lot1:IASDet[0].Rec_no_bags3,
                        
                        // UnloadingLotNo:{value:IASDet[0].UnloadedLotNo, label:IASDet[0].UnloadedLotNo},
                        UnloadingVendor:{value: IASDet[0].unloadingvendorid , label: IASDet[0].UnLoadingVendor },
                        UnloadingCharges: IASDet[0].UnloadingChargePerTon,

                        loadWt:IASDet[0].Rec_WbLoadWt,
                        emptyWt:IASDet[0].Rec_WbEmptyWt,
                        netWt:IASDet[0].Rec_WbNetWt,
                        gunnyWt:IASDet[0].Rec_GunnyWt,
                        gunnylessWt:IASDet[0].Rec_GunnyLessNetWt,
                        first_weighment_attachment:IASDet[0].WbSlipCopy,
                        second_weighment_attachment:IASDet[0].WbSlipCopy2 
                    
                    });  

                    // console.log("TEST2");
                    // console.log("Length", tempArray.length );

                    if (tempArray.length >= 1) {
                        form.setFieldValue('POLineItem1', tempArray[0]);
                    }
                    if (tempArray.length >= 2) {
                        form.setFieldValue('POLineItem2', tempArray[1]);
                    }
                    if (tempArray.length >= 3) {
                        form.setFieldValue('POLineItem3', tempArray[2]);
                    }
                    if(IASDet[0].WbSlipCopy && IASDet[0].WbSlipCopy)
                    {
                        setAttachment({first_weighment_attachment:IASDet[0].WbSlipCopy,
                        second_weighment_attachment:IASDet[0].WbSlipCopy2 });
                    }
                } else {
                    errorToast("Data Not Found !!!");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime 123");
            })
            .finally((a) => {
                hideLoader();
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

    /* ********************************************************************************************** */

    return (
        <div>
            <RefreshBlock />
            <Card>
                <CardHeader>
                    <CardTitle>{"Loading WH Incharge - Update Lot"}</CardTitle>
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
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Last Mile Transporter"} form={form} id="LastMileTransport"
                                url={`${apiBaseUrl}warehouse/master/getLastMileTransportVendor`} />
                            <span id='LastMileTransport_Error' style={{ color: 'red' }} ></span>

                        </Col>
                    </Row>

                    <Row>

                        <Col md="4" sm="12">
                            <CustomTextInput label={"Freight Charges Per Ton"} decimalFormat="10,2" isNumberOnly form={form} id="FreightCharges" type="text" />
                            <span id='FreightCharges_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Loading Vendor"} form={form} id="LoadingVendor"
                                url={`${apiBaseUrl}warehouse/master/getLoadingVendor`}
                                 />
                            <span id='LoadingVendor_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Loading Charges Per Ton"} decimalFormat="10,2" isNumberOnly form={form} id="LoadingCharges" type="text" />
                            <span id='LoadingCharges_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* <HrLine header={"PO & Vehicle Details"} /><br /> */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"PO No"} form={form} id="PONumber"
                                // url={`${apiBaseUrl}warehouse/Master/getPONumber`}
                                //url={`${apiBaseUrl}warehouse/IASSending/getPONumber`}
                                options={PoNoOptions}
                                onChange={(e) => get_ias_PO_Data(e)} />
                            <span id='PONumber_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="4" sm="12">
                            {/* <CustomDropdownInput label={"PO Line Item"} form={form} id="POLineItem" isMulti
                                options={POLineItemList} />
                            <span id='POLineItem_Error' style={{ color: 'red' }} ></span> */}
                        </Col>

                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Receiving Bin"} form={form} id="ReceivingBin"
                                url={`${apiBaseUrl}warehouse/master/getReceivingBin`} />
                            <span id='ReceivingBin_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    {/* <HrLine header={"Vendor Details"} /><br /> */}


                    {/* <HrLine header={"Segment & Wheat Variety Details"} /><br/> */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"PO LineItem 1"} form={form} id="POLineItem1" 
                                options={POLineItemList} />
                            <span id='POLineItem1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Segment 1"} form={form} id="Segment1" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId1" type="text" hidden />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Wheat Variety 1"} form={form} id="WheatVariety1" type="text" disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"PO LineItem 2"} form={form} id="POLineItem2" 
                                options={POLineItemList} />
                            <span id='POLineItem2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4  " sm="12">
                            <CustomTextInput label={"Segment 2"} form={form} id="Segment2" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId2" type="text" hidden />
                        </Col>
                        <Col md="4  " sm="12">
                            <CustomTextInput label={"Wheat Variety 2"} form={form} id="WheatVariety2" type="text" disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"PO LineItem 3"} form={form} id="POLineItem3" 
                                options={POLineItemList} />
                            <span id='POLineItem3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4  " sm="12">
                            <CustomTextInput label={"Segment 3"} form={form} id="Segment3" type="text" disabled />
                            <CustomTextInput form={form} id="SegmentId3" type="text" hidden />
                        </Col>
                        <Col md="4  " sm="12">
                            <CustomTextInput label={"Wheat Variety 3"} form={form} id="WheatVariety3" type="text" disabled />
                        </Col>
                    </Row>

                    {/* <HrLine header={"Sending & Receiving Details"} /><br/> */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Receiving Plant"} form={form} id="ReceivingPlant" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Receiving Storage Location"} form={form} id="ReceivingStorageLocation" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Sending Plant"} form={form} id="SendingPlant" type="text" disabled />
                        </Col>

                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Sending Storage Location"} form={form} id="SendingStorageLocation" type="text" disabled />
                        </Col>

                        <Col md="4" sm="12">
                            <CustomTextInput label={"First Weight"} form={form} id="FirstWeight" type="text" isNumberOnly={true} disabled={isOwnWb} />
                            <span id="FirstWeight_Error" style={{ color: "red" }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Second Weight"} form={form} id="SecondWeight" type="text" isNumberOnly={true} disabled={isOwnWb} />
                            <span id="SecondWeight_Error" style={{ color: "red" }} ></span>
                        </Col>
                    </Row>

                    <Row id="outsideWB">
                        <Col md="4" sm="12"></Col>
                        <Col md="4" sm="12">
                            <Uploader 
                            isReadOnly={true} canEdit={false} form={form}
                            title={"Pdf"}
                            id={"first_weighment_attachment"}
                            setAttachment={handleFileChange}
                            selectedFileName={form.values.first_weighment_attachment}/>
                            {/* <Uploader
                                title={"Pdf"}
                                isReadOnly={false}
                                form={form}
                                label={"First Weighment Receipt"}
                                id={"first_weighment_attachment"}
                                setAttachment={handleFileChange}
                                selectedFileName={attachedFiles.first_weighment_attachment.name} /> */}
                            <span id="first_weighment_attachment_Error" style={{ color: "red" }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <Uploader 
                            isReadOnly={true} canEdit={false} form={form}
                            title={"Pdf"}
                            id={"second_weighment_attachment"}
                            setAttachment={handleFileChange}
                            selectedFileName={form.values.second_weighment_attachment}/>
                            {/* <Uploader
                                title={"Pdf"}
                                isReadOnly={false}
                                form={form}
                                label={"Second Weighment Receipt"}
                                id={"second_weighment_attachment"}
                                setAttachment={handleFileChange}
                                selectedFileName={attachedFiles.second_weighment_attachment.name} /> */}
                            <span id="second_weighment_attachment_Error" style={{ color: "red" }} ></span>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Net Weight"} form={form} id="NetWeight" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunny Weight"} form={form} id="GunnyWeight" type="text" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunnyless Weight"} form={form} id="GunnylessWeight" type="text" disabled />
                        </Col>
                    </Row>



                    {/* BAG TYPE 1 - LOT 1 */}
                    {/* <HrLine header={"Selected Lot 1 BagType"} /><br/> */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Select Lot 1"} form={form} id="LoadedLotNo1" options={LoadedLot1}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId1, 1)} />
                            <span id='LoadedLotNo1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <Button color="primary" style={{ marginTop: 25 }} onClick ={(e)=>{ShowBagType(e, "bagtype21", "bagtype31")}} >ADD BAG</Button>
                        </Col>
                    </Row>
                    <Row>
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
                                onChange={(e) => CalcBagCount(e, "BagType1Lot1","LooseWheat111","LooseWheat112","LooseWheat113")} />
                            <span id='BagType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot1","LooseWheat111","LooseWheat112","LooseWheat113")} isNumberOnly/>
                            <span id='NoofBags1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="LooseWheat111">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat112">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot1", "Charges1Lot1", "NoofBags1Lot1")} />
                            <span id='BagCuttingVendor1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat113">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot1" type="text" disabled />
                            <span id='Charges1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 2 - LOT 1 */}
                    <Row id = "bagtype21">
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
                                onChange={(e) => CalcBagCount(e, "BagType2Lot1","LooseWheat211","LooseWheat212","LooseWheat213")} />
                            <span id='BagType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot1","LooseWheat211","LooseWheat212","LooseWheat213")} />
                            <span id='NoofBags2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="LooseWheat211">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat212">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot1", "Charges2Lot1", "NoofBags2Lot1")} />
                            <span id='BagCuttingVendor2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat213">
                            <CustomTextInput label={""} form={form} id="Charges2Lot1" type="text" disabled />
                            <span id='Charges2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 1 */}

                    <Row id = "bagtype31">
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
                                onChange={(e) => CalcBagCount(e, "BagType3Lot1","LooseWheat311","LooseWheat312","LooseWheat313")} />
                            <span id='BagType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot1" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot1","LooseWheat311","LooseWheat312","LooseWheat313")} />
                            <span id='NoofBags3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="LooseWheat311">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat312">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot1", "Charges3Lot1","NoofBags3Lot1")} />
                            <span id='BagCuttingVendor3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat313">
                            <CustomTextInput label={""} form={form} id="Charges3Lot1" type="text" disabled />
                            <span id='Charges3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* <HrLine header={"Selected Lot 2 BagType"} /><br/> */}
                    {/* BAG TYPE 1 - LOT 2 */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Select Lot 2"} form={form} id="LoadedLotNo2" options={LoadedLot2}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId2, 2)} />
                            <span id='LoadedLotNo2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <Button color="primary" style={{ marginTop: 25 }} onClick ={(e)=>{ShowBagType(e, "bagtype22", "bagtype32")}} >ADD BAG</Button>
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
                                onChange={(e) => CalcBagCount(e, "BagType1Lot2","LooseWheat121","LooseWheat122","LooseWheat123")} />
                            <span id='BagType1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot2","LooseWheat121","LooseWheat122","LooseWheat123")}  isNumberOnly/>
                            <span id='NoofBags1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="LooseWheat121">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat122">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot2", "Charges1Lot2", "NoofBags1Lot2")} />
                            <span id='BagCuttingVendor1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat123">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot2" type="text" disabled />
                            <span id='Charges1Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 2 - LOT 2 */}
                    <Row id ="bagtype22">
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
                                onChange={(e) => CalcBagCount(e, "BagType2Lot2","LooseWheat221","LooseWheat222","LooseWheat223")} />
                            <span id='BagType2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot2","LooseWheat221","LooseWheat222","LooseWheat223")} />
                            <span id='NoofBags2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat221">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat222">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot2", "Charges2Lot2","NoofBags2Lot2")} />
                            <span id='BagCuttingVendor2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat223">
                            <CustomTextInput label={""} form={form} id="Charges2Lot2" type="text" disabled />
                            <span id='Charges2Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 2 */}
                    <Row id ="bagtype32">
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
                                onChange={(e) => CalcBagCount(e, "BagType3Lot2","LooseWheat321","LooseWheat322","LooseWheat323")} />
                            <span id='BagType3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot2" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot2","LooseWheat321","LooseWheat322","LooseWheat323")} />
                            <span id='NoofBags3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat321">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot2"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat322">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot2"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot2", "Charges3Lot2", "NoofBags3Lot2")} />
                            <span id='BagCuttingVendor3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat323">
                            <CustomTextInput label={""} form={form} id="Charges3Lot2" type="text" disabled />
                            <span id='Charges3Lot2_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* <HrLine header={"Selected Lot 3 BagType"} /> */}
                    {/* BAG TYPE 1 - LOT 3 */}
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Select Lot 3"} form={form} id="LoadedLotNo3" options={LoadedLot3}
                                onChange={(e) => getPlanninglotDet(e, form.values.SegmentId3, 3)} />
                            <span id='LoadedLotNo3_Error' style={{ color: 'red' }} ></span>
                        </Col>
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
                                onChange={(e) => CalcBagCount(e, "BagType1Lot3","LooseWheat131","LooseWheat132","LooseWheat133")} />
                            <span id='BagType1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="NoofBags1Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags1Lot3","LooseWheat131","LooseWheat132","LooseWheat133")}  isNumberOnly/>
                            <span id='NoofBags1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat131">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="BagCuttingType1Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat132">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="BagCuttingVendor1Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor1Lot3", "Charges1Lot3","NoofBags1Lot3")} />
                            <span id='BagCuttingVendor1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat133">
                            <CustomTextInput label={"Charges"} form={form} id="Charges1Lot3" type="text" disabled />
                            <span id='Charges1Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 2 - LOT 3 */}
                    <Row id ="bagtype23">
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
                                onChange={(e) => CalcBagCount(e, "BagType2Lot3","LooseWheat231","LooseWheat232","LooseWheat233")} />
                            <span id='BagType2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags2Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags2Lot3","LooseWheat231","LooseWheat232","LooseWheat233")} />
                            <span id='NoofBags2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat231">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType2Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat232">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor2Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor2Lot3", "Charges2Lot3","NoofBags2Lot3")} />
                            <span id='BagCuttingVendor2Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat233">
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
                                onChange={(e) => CalcBagCount(e, "BagType3Lot3","LooseWheat331","LooseWheat332","LooseWheat333")} />
                            <span id='BagType3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="NoofBags3Lot3" type="text"
                                onChange={(e) => CalcBagCount(e, "NoofBags3Lot3","LooseWheat331","LooseWheat332","LooseWheat333")} />
                            <span id='NoofBags3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat331">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingType3Lot3"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='BagCuttingType3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="LooseWheat332">
                            <CustomDropdownInput label={""} form={form} id="BagCuttingVendor3Lot3"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "BagCuttingVendor3Lot3", "Charges3Lot3","NoofBags3Lot3")} />
                            <span id='BagCuttingVendor3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="LooseWheat333">
                            <CustomTextInput label={""} form={form} id="Charges3Lot3" type="text" disabled />
                            <span id='Charges3Lot3_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>


                    <Row>
                        <Col md="3" sm="12"></Col>
                        <Col md="2" sm="12">
                            <CustomTextInput label={"Total Bags"} form={form} id="TotalBags" type="text" disabled />
                        </Col>
                    </Row>


                    <HrLine header={"Planning Lot Details"} /><br />

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

                    <Row>
                        <Col md="9" sm="12"></Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Total MovementQty"} form={form} id="TotalMovementQty" type="text" disabled />
                            <span id='TotalMovementQty_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>


<div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                    <h3>{"Receiving Plant"}</h3>
                    
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Select Unloading Lot 1"} form={form} id="Rec_LoadedLotNo1" options={UnloadingLot1}
                                
                                /*onChange={(e) => getPlanninglotDet(e, form.values.SegmentId1, 1)}*/ />
                            <span id='Rec_LoadedLotNo1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="1" sm="12" style={{ marginTop: 25 }}>
                            <Button color="primary" onClick={(e) => fnclear("Rec_BagType1Lot1",
                                "Rec_NoofBags1Lot1",
                                "Rec_BagCuttingType1Lot1",
                                "Rec_BagCuttingVendor1Lot1",
                                "Rec_Charges1Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={"Bag Type"} form={form} id="Rec_BagType1Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_BagType1Lot1","Rec_LooseWheat111","Rec_LooseWheat112","Rec_LooseWheat113")} />
                            <span id='Rec_BagType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="1" sm="12">
                            <CustomTextInput label={"No_Bags"} form={form} id="Rec_NoofBags1Lot1" type="text"
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_NoofBags1Lot1","Rec_LooseWheat111","Rec_LooseWheat112","Rec_LooseWheat113")}  isNumberOnly/>
                            <span id='Rec_NoofBags1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="Rec_LooseWheat111">
                            <CustomDropdownInput label={"Bag Cutting Type"} form={form} id="Rec_BagCuttingType1Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='Rec_BagCuttingType1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="Rec_LooseWheat112">
                            <CustomDropdownInput label={"Bag Cutting Vendor"} form={form} id="Rec_BagCuttingVendor1Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "Rec_BagCuttingVendor1Lot1", "Rec_Charges1Lot1")} />
                            <span id='Rec_BagCuttingVendor1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="Rec_LooseWheat113">
                            <CustomTextInput label={"Charges"} form={form} id="Rec_Charges1Lot1" type="text" disabled />
                            <span id='Rec_Charges1Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 2 - LOT 1 */}
                    <Row>
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("Rec_BagType2Lot1",
                                "Rec_NoofBags2Lot1",
                                "Rec_BagCuttingType2Lot1",
                                "Rec_BagCuttingVendor2Lot1",
                                "Rec_Charges2Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagType2Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_BagType2Lot1","Rec_LooseWheat211","Rec_LooseWheat212","Rec_LooseWheat213")} />
                            <span id='Rec_BagType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="Rec_NoofBags2Lot1" type="text"
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_NoofBags2Lot1","Rec_LooseWheat211","Rec_LooseWheat212","Rec_LooseWheat213")} />
                            <span id='Rec_NoofBags2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="Rec_LooseWheat211">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagCuttingType2Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='Rec_BagCuttingType2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="Rec_LooseWheat212">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagCuttingVendor2Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "Rec_BagCuttingVendor2Lot1", "Rec_Charges2Lot1")} />
                            <span id='Rec_BagCuttingVendor2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="Rec_LooseWheat213">
                            <CustomTextInput label={""} form={form} id="Rec_Charges2Lot1" type="text" disabled />
                            <span id='Rec_Charges2Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    {/* BAG TYPE 3 - LOT 1 */}

                    <Row>
                        <Col md="1" sm="12">
                            <Button color="primary" onClick={(e) => fnclear("Rec_BagType3Lot1",
                                "Rec_NoofBags3Lot1",
                                "Rec_BagCuttingType3Lot1",
                                "Rec_BagCuttingVendor3Lot1",
                                "Rec_Charges3Lot1")}>X</Button>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagType3Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`}
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_BagType3Lot1","Rec_LooseWheat311","Rec_LooseWheat312","Rec_LooseWheat313")} />
                            <span id='Rec_BagType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="1" sm="12">
                            <CustomTextInput label={""} form={form} id="Rec_NoofBags3Lot1" type="text"
                                onChange={(e) => Rec_CalcBagCount(e, "Rec_NoofBags3Lot1","Rec_LooseWheat311","Rec_LooseWheat312","Rec_LooseWheat313")} />
                            <span id='Rec_NoofBags3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>

                        <Col md="2" sm="12" id="Rec_LooseWheat311">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagCuttingType3Lot1"
                                url={`${apiBaseUrl}warehouse/master/bagtype_new`} />
                            <span id='Rec_BagCuttingType3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="3" sm="12" id="Rec_LooseWheat312">
                            <CustomDropdownInput label={""} form={form} id="Rec_BagCuttingVendor3Lot1"
                                url={`${apiBaseUrl}warehouse/master/getVendorwithCharges`}
                                onChange={(e) => onchangeBagCutting(e, "Rec_BagCuttingVendor3Lot1", "Rec_Charges3Lot1")} />
                            <span id='Rec_BagCuttingVendor3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="2" sm="12" id="Rec_LooseWheat313">
                            <CustomTextInput label={""} form={form} id="Rec_Charges3Lot1" type="text" disabled />
                            <span id='Rec_Charges3Lot1_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>


                    <Row>
                        {/* <Col md="4" sm="12">
                            <CustomDropdownInput label={"Unloading Lot No"} form={form} id="UnloadingLotNo" hidden/>
                            <span id='UnloadingLotNo_Error' style={{ color: 'red' }} ></span>
                        </Col> */}
                        <Col md="4" sm="12">
                            <CustomDropdownInput label={"Unloading Vendor"} form={form} id="UnloadingVendor"  options={POLineItemList} />
                            <span id='UnloadingVendor_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Unloading Charges"} form={form} id="UnloadingCharges" type="text" />
                            <span id='UnloadingCharges_Error' style={{ color: 'red' }} ></span>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Load Weight"} form={form} id="loadWt" type="text" />
                            <span id='loadWt_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Empty Weight"} form={form} id="emptyWt" type="text" />
                            <span id='emptyWt_Error' style={{ color: 'red' }} ></span>
                        </Col>

                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Net Weight"} form={form} id="netWt" type="text" />
                            <span id='netWt_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunny Weight"} form={form} id="gunnyWt" type="text" />
                            <span id='gunnyWt_Error' style={{ color: 'red' }} ></span>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Gunny Less Weight"} form={form} id="gunnylessWt" type="text" />
                            <span id='gunnylessWt_Error' style={{ color: 'red' }} ></span>
                        </Col>

                    </Row>
                </div>



                    <HrLine />
                    <Row>
                        <Col md="7" sm="12"></Col>
                        <Col md="3" sm="12"></Col>
                        <Col md="1" sm="12"></Col>
                        <Col md="1" sm="12">
                            <Button.Ripple color="primary" type="button" onClick={(e) => Save_PO(e)} >Submit</Button.Ripple>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    )
};
export default WhLoadingUpdateLotEdit;
