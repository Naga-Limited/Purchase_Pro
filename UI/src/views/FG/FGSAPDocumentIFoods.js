import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, Badge, ButtonGroup, InputGroup } from "reactstrap";
import { useEffect } from "react";
import { useLoader } from "../../utility/hooks/useLoader";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, Search, Trash2, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../helper/appHelper";
import { useHistory } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { apiGetMethod } from "../../helper/axiosHelper";
import ReactSelect from "react-select";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import InvoiceInfo from "./salesReturn/InvoiceInfo";
import GatePassInfo from "../Info/GatePassInfo";

const FGSAPDocumentIFoods = () => {

    useEffect(() => {
        getGateInInfo('Get')

    }, [])

    let { gateInOutInfoId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    let history = useHistory();

    const [invoiceData, setInvoiceData] = useState([])
    const [fgDetailsData, setfgDetailsData] = useState([])
    const [gatePassDeliveryData, setGatePassDeliveryData] = useState([])
    const [show, setShow] = useState({ isOpen: false, moduleStatusId: 0 });
    const [data, setData] = useState({})
    const [response, setResponse] = useState([])
    const [ssAndpmDeliveryData, setSsAndpmDeliveryData] = useState([])
    const [invoiceList, setInvoiceList] = useState([])
    const [delaytimeinfo, setdelaytimeinfo] = useState([])
    const [delaypalntcode, setdelaypalntcode] = useState([])
    const [weighmentplantid, setweighmentplantid] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])
    const [deiveryDetails, setDeliveryDetails] = useState([])
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });


    const getGateInInfo = (type) => {

        let invalidBagCount = false;
        let invalidBagType = false;

        let submittedData = [];

        if(data.moduleTypeId == 43 && type == 'POST'){
            submittedData = fgDetailsData?.map((fgData) => ({
            sapDocument: fgData?.SAP_DOCUMENT,
            sapLine: fgData?.SAP_LINE.map((sapLine) => ({
                materials: sapLine?.MATERIAL_LINE.map((materialDetails, lineIndex) => {
                    const bagCount = bagCounts[`${sapLine.DELIVERY_NO}_${lineIndex}`] || 0; // Default to 0 if empty
                    const bagType = bagTypes[`${sapLine.DELIVERY_NO}_${lineIndex}`] || ""; // Default to empty string if not selected
                    if (isNaN(bagCount) || bagCount <= 0) {
                        invalidBagCount = true;
                    }else if(bagType == ''){
                        invalidBagType = true;
                    }
        
                    return {
                        material: materialDetails.MATERIAL,
                        bagCount: bagCount,
                        bagType: bagType,
                    };
                }),
            })),
        }));
        }
        if (invalidBagCount && type == 'POST') {
            errorToast("Bag count must be greater than 0 for all items.");
            return false;
        }else if (invalidBagType && type == 'POST') {
            errorToast("Please Select Bag Type");
            return false;
        }

        apiGetMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setData(data.results[0]);
                    hideRejectButton(data.results[0].userGateId)
                    getWeighmentInfo(data.results[0].gateInOutInfoId, '')
                    getfgdelaytimeinfo(data.results[0].vehicleType)

                    for (let i = 0; i < data.invoiceInfo.length; i++) {
                        data.invoiceInfo[i].INVOICE_NO = data.invoiceInfo[i].invoiceNumber;
                        data.invoiceInfo[i].DELIVERY_NO = data.invoiceInfo[i].deliveryNumber;
                        data.invoiceInfo[i].DELIVERY_QTY = data.invoiceInfo[i].deliveryQty;
                        data.invoiceInfo[i].PGI_COMPLETION = data.invoiceInfo[i].PgiCompletion;
                    }

                    let invoiceData = data.invoiceInfo.filter((item) => item.isManual >= 0)
                    setInvoiceList(invoiceData)

                    if ((data.results[0].moduleTypeId == 1 || data.results[0].moduleTypeId == 29) && (data.results[0].tripSheetNumber == null && data.results[0].secondWeight == null)) {
                        getTripsheetDetailsForFG(data.results[0], type)

                    } else {
                        // FGSales_DocumentVerify(data.results[0], type, data.results[0].shipmentOrderNo, data.results[0].tripSheetNumber)
                        GatePass_DocumentVerify(data.results[0], type)
                        SsAndPm_DocumentVerify(data.results[0], type)
                        if(data.results[0].moduleTypeId == 43){
                            materialDetailsGet(data.results[0].gateInOutInfoId) 
                        }
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const FGSales_DocumentVerify = ( type) => {
        const formdata = form.values
       
        let submittedData = [];

        // if(data.moduleTypeId == 43 && type == 'POST'){
        //     submittedData = fgDetailsData?.map((fgData) => ({
        //     sapLine: fgData?.SAP_LINE.map((sapLine) => ({
        //         materials: sapLine?.MATERIAL_LINE.map((materialDetails, lineIndex) => {
        //             const bagCount = bagCounts[`${sapLine.DELIVERY_NO}_${lineIndex}`] || 0; // Default to 0 if empty
        //             const bagType = bagTypes[`${sapLine.DELIVERY_NO}_${lineIndex}`] || ""; // Default to empty string if not selected
        //             return {
        //                 material: materialDetails.MATERIAL,
        //                 material_description: materialDetails.MATERIAL_DESC || materialDetails.MATERIAL,
        //                 bagCount: bagCount,
        //                 materialQty:materialDetails.MATERIAL_QTY,
        //                 materialUOM:materialDetails.MATERIAL_UOM,
        //                 gateInOutInfoId:gateInOutData.gateInOutInfoId,
        //                 deliveryNo:sapLine.DELIVERY_NO,
        //                 invoiceNo:sapLine.INVOICE_NO,
        //                 pgiStatus: sapLine?.PGI_COMPLETION,
        //                 deliveryQty: Number(sapLine.DELIVERY_QTY).toFixed(3),
        //                 bagType:bagType.label,
        //                 lineItem:materialDetails.LINE_ITEM1
        //             };
        //         }),
        //     })),
        // }));
        // }

        let postData = { gateInOutInfoId: data?.gateInOutInfoId, shipmentOrderNo:shipmentValue, vaNumber: data?.vaNumber, type: type, invoiceList: invoiceData, userInfoId: UserDetails.USERID, delayreason: formdata.delayreason?.value, bagcount: formdata?.bagcount || 0 ,MaterialDetails: submittedData.length > 0 ? submittedData[0].sapLine : [],moduleTypeId:data.moduleTypeId}
        

        apiPostMethod(apiBaseUrl + "LandingDataController/FGInvoice_DocumentVerify", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'Get') {
                        const toPlant = data.fg_details_data[0].SAP_LINE[0].TO_PLANT
                        setToPlant(toPlant)
                        setResponse(data)
                        setfgDetailsData(data.fg_details_data)
                        setInvoiceData(data.fg_details_data[0].SAP_LINE)
                        // getWeighmentInfo(gateInOutData.gateInOutInfoId, data.fg_details_data[0].SAP_DOCUMENT)
                        form.setFieldValue('delayreason', {  label: data?.gate_info[0].delay_reason,value:  data.gate_info[0].delay_reason_id });
                        if (data.fg_details_data == '') {
                            getGateInInfo('Get')
                        }
                    }
                    if (type == 'POST') {
                        ShowToast(data.message);
                        redirect()
                    }
                } else if (data.success == false) {
                    setResponse(data)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const materialDetailsGet = (gateInOutData) => {
        const postData = { Vehicle_Number: gateInOutData.vehicleNo, userInfoId: UserDetails.USERID, isMovement: gateInOutData.isMovement }
        console.log(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`);
        apiPostMethod(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMaterialInfo(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
    }

    const getTripsheetDetailsForFG = (gateInOutData, type) => {
        const postData = { Vehicle_Number: gateInOutData.vehicleNo, userInfoId: UserDetails.USERID, isMovement: gateInOutData.isMovement }
        console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    // FGSales_DocumentVerify(gateInOutData, type, data.results[0].SAP_LINE[0].SHIPMENTORDERNO, data.results[0].TRIPSHEET_NO)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    // const FGSales_DocumentVerify = (gateInOutData, type, shipmentOrderNo, tripSheetNumber) => {
    //     const formdata = form.values
       
    //     let submittedData = [];

    //     if(data.moduleTypeId == 43 && type == 'POST'){
    //         submittedData = fgDetailsData?.map((fgData) => ({
    //         sapLine: fgData?.SAP_LINE.map((sapLine) => ({
    //             materials: sapLine?.MATERIAL_LINE.map((materialDetails, lineIndex) => {
    //                 const bagCount = bagCounts[`${sapLine.DELIVERY_NO}_${lineIndex}`] || 0; // Default to 0 if empty
    //                 const bagType = bagTypes[`${sapLine.DELIVERY_NO}_${lineIndex}`] || ""; // Default to empty string if not selected
    //                 return {
    //                     material: materialDetails.MATERIAL,
    //                     material_description: materialDetails.MATERIAL_DESC || materialDetails.MATERIAL,
    //                     bagCount: bagCount,
    //                     materialQty:materialDetails.MATERIAL_QTY,
    //                     materialUOM:materialDetails.MATERIAL_UOM,
    //                     gateInOutInfoId:gateInOutData.gateInOutInfoId,
    //                     deliveryNo:sapLine.DELIVERY_NO,
    //                     invoiceNo:sapLine.INVOICE_NO,
    //                     pgiStatus: sapLine?.PGI_COMPLETION,
    //                     deliveryQty: Number(sapLine.DELIVERY_QTY).toFixed(3),
    //                     bagType:bagType.label,
    //                     lineItem:materialDetails.LINE_ITEM1
    //                 };
    //             }),
    //         })),
    //     }));
    //     }

    //     let postData = { gateInInfoId: gateInOutData.gateInOutInfoId || data?.gateInOutInfoId, shipmentOrderNo: shipmentOrderNo, tripSheetNumber: tripSheetNumber, vaNumber: gateInOutData.vaNumber || data?.vaNumber, Type: type, invoiceList: invoiceList, userInfoId: UserDetails.USERID, delayreason: formdata.delayreason?.value, bagcount: formdata?.bagcount || 0 ,MaterialDetails: submittedData.length > 0 ? submittedData[0].sapLine : []}
        
    //     if ((delaypalntcode == weighmentplantid) && (data.moduleTypeId == 1 || data.moduleTypeId == 2 || data.moduleTypeId == 43) && (timeDifference >= delaytimeinfo) && (type = "POST") && (postData.delayreason == "" || postData.delayreason == undefined)) {
    //         errorToast('Please Select Delay Reason')
    //         return false
    //     }

    //     apiPostMethod(apiBaseUrl + "LandingDataController/FGSales_DocumentVerify", postData)
    //         .then((response) => {
    //             const { data } = response;
    //             if (data.success == true) {
    //                 if (type == 'Get') {
    //                     const toPlant = data.fg_details_data[0].SAP_LINE[0].TO_PLANT
    //                     setToPlant(toPlant)
    //                     setResponse(data)
    //                     setfgDetailsData(data.fg_details_data)
    //                     setInvoiceData(data.fg_details_data[0].SAP_LINE)
    //                     getWeighmentInfo(gateInOutData.gateInOutInfoId, data.fg_details_data[0].SAP_DOCUMENT)
    //                     form.setFieldValue('delayreason', {  label: data?.gate_info[0].delay_reason,value:  data.gate_info[0].delay_reason_id });
    //                     if (data.fg_details_data == '') {
    //                         getGateInInfo('Get')
    //                     }
    //                 }
    //                 if (type == 'POST') {
    //                     ShowToast(data.message);
    //                     redirect()
    //                 }
    //             } else if (data.success == false) {
    //                 setResponse(data)
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(JSON.stringify(error))
    //             errorToast("Something went wrong, please try again after sometime");
    //         })
    // }

    // const FGInvoice_DocumentVerify = (gateInOutData, type) => {
    //     const formdata = form.values

    //     let postData = { gateInOutInfoId: gateInOutInfoId, type: type, invoiceList: invoiceList, userInfoId: UserDetails.USERID, delayreason: formdata.delayreason?.value ,bagcount: formdata?.bagcount || 0}
    //     // Include delayreason if it exists in the form data
    //     if ((delaypalntcode == weighmentplantid) && (data.moduleTypeId == 1 || data.moduleTypeId == 2) && (timeDifference >= delaytimeinfo) && (type = "POST") && (postData.delayreason == "" || postData.delayreason == undefined)) {
    //         errorToast('Please Select Delay Reason')
    //         return false
    //     }

    //     apiPostMethod(apiBaseUrl + "LandingDataController/FGInvoice_DocumentVerify", postData)
    //         .then((response) => {
    //             const { data } = response;
    //             if (data.success == true) {
    //                 if (type == 'POST') {
    //                     if (fgDetailsData == "") {
    //                         ShowToast(data.message);
    //                     }
    //                     if (fgDetailsData !== '') {
    //                         FGSales_DocumentVerify(gateInOutData, 'POST', gateInOutData.shipmentOrderNo, gateInOutData.tripSheetNumber)
    //                     }
    //                     GatePass_DocumentVerify(gateInOutData, 'POST')
    //                     SsAndPm_DocumentVerify(gateInOutData, 'POST')
    //                     redirect()
    //                 }
    //             } else if (data.success == false) {
    //                 setResponse(data)
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(JSON.stringify(error))
    //             errorToast("Something went wrong, please try again after sometime");
    //         })
    // }

    const GatePass_DocumentVerify = (gateInOutData, type) => {

        const gatePasspostData = { gateInOutInfoId: gateInOutData.gateInOutInfoId, vaNumber: gateInOutData.vaNumber, type: type, userInfoId: UserDetails.USERID }

        apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", gatePasspostData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'Get') {
                        setGatePassDeliveryData(data.results);
                    }
                    else if (type == 'POST') {
                        redirect()
                    }
                }
                else if (data.success == false) {
                    if (type == 'POST') {
                        // errorToast(data.message)
                        redirect()
                    }
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const SsAndPm_DocumentVerify = (gateInOutData, type) => {

        const postData = { gateInOutInfoId: gateInOutData.gateInOutInfoId, vaNumber: gateInOutData.vaNumber, type: type, movementTypeId: gateInOutData.movementTypeId, userInfoId: UserDetails.USERID }

        apiPostMethod(apiBaseUrl + "LandingDataController/SsAndPm_DocumentVerify", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'Get') {
                        setSsAndpmDeliveryData(data.results);
                    }
                    else if (type == 'POST') {
                        redirect()
                    }
                }
                else if (data.success == false) {
                    if (type == 'POST') {
                        // errorToast(data.message)
                    }
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])
    const [fgWeighment, setFgWeighment] = useState([])

    const getWeighmentInfo = (gateInOutInfoId, documentNo) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
                    setweighmentplantid(data.data[0].masterPlantId)
                    console.log(data.data);
                    let lastItem = data.data.slice(-1)[0]
                    setOverAllWeight(lastItem)
                    let fgWeight = data.data.filter((item) => item.documentNumber == documentNo)
                    setFgWeighment(fgWeight[0])
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const redirect = () => {
        if (data?.movementTypeId == 1) {
            history.push("/SAPDocumentDetails");
        } else {
            history.push("/STO/SAPDocumentDetails");
        }
    }

    const getfgdelaytimeinfo = (vehicleType) => {
        console.log(vehicleType);
        apiPostMethod(apiBaseUrl + `GatePro/Document/getfgdelaytimeinfo/${vehicleType}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;

                if (data && data.success === 1 && Array.isArray(data.results)) {
                    const updatedData = data.results.map((item) => {
                        const gateOutMinutes = parseInt(item.gate_out_hour || 0) * 60; // Convert to minutes
                        const delayReasonTime = parseInt(item.delay_reason_time || 0); // Parse delay_reason_time
                        const adjustedDelayTime = gateOutMinutes - delayReasonTime; // Subtract gate_out_hour (minutes)
                        return {
                            ...item,
                            adjustedDelayTime, // Add adjusted delay time to the object
                        };
                    });

                    let delaytime = updatedData[0].adjustedDelayTime
                    let delaypalntcode = updatedData[0].plantcode

                    setdelaytimeinfo(delaytime); // Set the processed data
                    setdelaypalntcode(delaypalntcode); // Set the processed data
                   
                } else {
                    console.error("Unexpected data format:", data);
                    // errorToast("Unexpected data format received from the server.");
                }
            })
            .catch((error) => {
                setData(false);
                errorToast("Something went wrong, please try again after some time.");
            });
    };

    // Parse gateInDateStamp into a valid date object
    const gateInDate = new Date(data.gateInDateStamp);

    // Get the current date and time
    const currentDate = new Date();

    // Calculate the difference in minutes between the current time and gateInDate
    const timeDifference = Math.abs(Math.floor((gateInDate - currentDate) / (1000 * 60))); // Convert ms to minutes and take absolute value






    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const fromPlant = [fgDetailsData[0]?.FROM_PLANT];
    const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

    const fromPlant1 = fgDetailsData
        .flatMap(item => item.SAP_LINE?.map(line => line.FROM_PLANT_ITEM) || []) // Extract values from SAP_LINE and handle missing values
        .filter(plant => plant !== undefined); // Assumes multiple FROM_PLANTs
    const userPlantIds = UserDetails.plantids; // Array of user-assigned plant IDs

    const [toPlant, setToPlant] = useState('')

    const checkPlant = () => {
        const formdata = form.values
        const areAllFromPlantsValid = fromPlant1.every(plant => userPlantIds.includes(plant));
        if ((delaypalntcode == weighmentplantid) && (data.moduleTypeId == 1 || data.moduleTypeId == 2) && (timeDifference >= delaytimeinfo) && (formdata.delayreason?.value == "" || formdata.delayreason?.value == undefined||formdata.delayreason?.value == null)) {
            errorToast('Please Select Delay Reason')
            return false 
        }

        else if (areAllFromPlantsValid) {
            if (data.moduleTypeId == 2) {
                apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${toPlant}`)
                    .then((response) => {
                        const data = response.data;
                        if (data.success) {
                            FGSales_DocumentVerify('POST')
                        }
                        if (data.success == false) {
                            confirmDialog({
                                title: `<h5><strong class="text-white">${toPlant} - ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                            });
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    })
            } else {
                FGSales_DocumentVerify('POST')
            }
        } else {
            errorToast("Plant not assigned for user, Please assign plant")
        }
    }

    const reject = (moduleStatusId) => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            rejectReasonId: formData.rejectReason.value,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    redirect()
                }
                else if (data.success == false) {
                    errorToast(data.message)
                    redirect()
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    const [isHide, setIsHide] = useState(true)

    const hideRejectButton = (userGateId) => {
        console.log(apiBaseUrl + `GatePro/Master/hideRejectButton/${userGateId}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/hideRejectButton/${userGateId}`)
            .then((response) => {
                const { data } = response;
                if (data.isHide == true) {
                    setIsHide(data.isHide)
                } else {
                    setIsHide(data.isHide)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [shipmentValue, setShipmentValue] = useState('')
    const [isDisabled1, setIsDisabled1] = useState(false)
    const [canSubmit, setCanSubmit] = useState(false);
    const selectShipmentNo = (e) => {
        setShipmentValue(e.target.value)
      }
    const getShipmentNo = () => {
        if(!shipmentValue){
            errorToast('Please Enter Shipment No')
            return
        }
        showLoader();
        console.log(apiBaseUrl + `GatePro/Weighment/getShipmentNo/${data?.vehicleNo}/${shipmentValue}/${gateInOutInfoId}/${UserDetails.USERID}`);
        
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getShipmentNo/${data?.vehicleNo}/${shipmentValue}/${gateInOutInfoId}/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setIsDisabled1(true);
                    setDeliveryDetails(data.results);
                    
                    // FIXED: Check ALL SAP_LINE items for Invoice No
                    const allSapLines = data.results || [];
                    let allInvoices = [];
                    
                    allSapLines.forEach((sapDocument) => {
                        if (sapDocument.SAP_LINE && Array.isArray(sapDocument.SAP_LINE)) {
                            // Extract ALL invoices from ALL lines in this SAP document
                            sapDocument.SAP_LINE.forEach((sapLine) => {
                                if (sapLine.INVOICE_NO && sapLine.INVOICE_NO.trim() !== '') {
                                    allInvoices.push({
                                        ...sapLine,
                                        SAP_DOCUMENT: sapDocument.SAP_DOCUMENT, // Keep document reference
                                        DELIVERY_NO: sapLine.DELIVERY_NO || '',
                                        DELIVERY_QTY: sapLine.DELIVERY_QTY || 0,
                                        PGI_COMPLETION: sapLine.PGI_COMPLETION || ''
                                    });
                                }
                            });
                        }
                    });
                                        
                    // Update both invoice states with complete data
                    setInvoiceData(allInvoices);
                    console.log('All Invoices:', allInvoices.length);
                    console.log('All SAP Lines:', allSapLines[0].SAP_LINE?.length);
                    // Enable submit button if invoices found
                    if (allInvoices.length === allSapLines[0]?.SAP_LINE?.length) {
                        setCanSubmit(true);
                    }
                } else {
                    errorToast(data.message);
                    setCanSubmit(false); // Disable submit on error
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                setData(false);
                errorToast("Something went wrong, please try again after sometime");
                setCanSubmit(false);
            })
            .finally(() => {
                hideLoader();
            });
    }

      const [bagCounts, setBagCounts] = useState({});
      const [bagTypes, setBagTypes] = useState({});

      const handleBagCountChange = (deliveryNo, materialIndex, value) => {
            setBagCounts((prev) => ({
                ...prev,
                [`${deliveryNo}_${materialIndex}`]: value, // Unique key for each input
            }));
      };

      const handleBagTypeChange = (deliveryNo, lineIndex, selectedValue) => {
        setBagTypes(prevState => ({
            ...prevState,
            [`${deliveryNo}_${lineIndex}`]: selectedValue
        }));
    };
    const deleteInvoiceDetails = (id) => {
      
        confirmDialog({
            title: `<h4>Are you sure want to delete?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                console.log(apiBaseUrl + `LandingDataController/FGSaleMaterialDelete/${id}/${UserDetails.USERID}`)
                apiPostMethod(apiBaseUrl + `LandingDataController/FGSaleMaterialDelete/${id}/${UserDetails.USERID}`)
                    .then((response) => {
                        const { data } = response;
                        if (data.success) {
                            ShowToast('Material Deleted Successfully... ');
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);   
                        }
                    }).catch((error) => {
                        console.log(JSON.stringify(error))
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            } 
           }).catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };
    return (
        <div>
            <Card>
                <CardHeader><h5>Loading - SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>

                        {data.colorToken != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Color / Token" value={data?.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.personName != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Person Name</Label>
                                    <Input type="text" placeholder="Reason" value={data?.personName} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.rejectReason != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Reason</Label>
                                    <Input type="text" placeholder="Reason" value={data?.rejectReason} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.remarks != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.truckType ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Truck Type" value={data?.truckType} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        
                        {data.shipmentOrderNo != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Shipment Order No</Label>
                                    <Input type="text" placeholder="Shipment Order No" value={data?.shipmentOrderNo} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>
                    </Row>
                    {data?.moduleTypeId == 39 || data?.subModuleTypeId == 19 ?
                    <Row>
                    <Col md="4" sm="4">
                        <FormGroup>
                        <Label>Shipment No</Label>
                        <InputGroup>
                        <Input type="text" id="Shipment_No" placeholder="Shipment No"
                         onChange={selectShipmentNo} 
                         value={shipmentValue} disabled={isDisabled1} />
                        <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getShipmentNo}>
                            <Search size={20} />
                        </Button>
                        </InputGroup>
                        </FormGroup> 
                        </Col>
                    </Row>: null
                     }

                     {deiveryDetails != '' && (data?.moduleTypeId == 39 || data?.subModuleTypeId == 19)  ? <>
                        {deiveryDetails.map((fgData) => (
                            <Row key={fgData.SAP_DOCUMENT}>
                                <Col md="12" sm="12">
                                    <FormGroup><b><u><span className='text-primary'>TYPE : </span>{fgData?.TYPE}</u></b></FormGroup>
                                </Col>

                                <Col md="3" sm="3"><Label>Delivery No</Label></Col>
                                <Col md="3" sm="3"><Label>Invoice No</Label></Col>
                                <Col md="3" sm="3"><Label>Delivery Qty</Label></Col>
                                <Col md="3" sm="3"><Label>Shipment No</Label></Col>

                            {fgData?.SAP_LINE.map((sapLine) => (
                               sapLine?.MATERIAL_LINE?.map((materialDetails, lineIndex) => (

                                <Col md="12" sm="12" key={`${sapLine.DELIVERY_NO}_${lineIndex}`}>
                                    <Row>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Delivery No" value={sapLine?.DELIVERY_NO} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Invoice No" value={sapLine?.INVOICE_NO} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Delivery Qty" value={Number(sapLine?.DELIVERY_QTY).toFixed(3)} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Shipment No" value={sapLine?.SAP_DOCUMENT_ITEM} disabled />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                            ))))}
                        </Row>
                        ))} </> : null
                    }
                     {data.moduleTypeId == 39 || data.subModuleTypeId == 19 ? <>
                        <InvoiceInfo gateInOutData={data} setInvoiceList={setInvoiceList} invoiceList={invoiceList} isDisbled = {true} />
                    </> : null
                    }
                    {gatePassDeliveryData != '' ?
                        <Row>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                            </Col>

                            {gatePassDeliveryData?.map(gatePassDeliveryData => (
                                <Col md="12" sm="12" key={gatePassDeliveryData?.GATEPASS_NO}>
                                    <Row>
                                        <Col md="3" sm="3">
                                            <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{gatePassDeliveryData?.GATEPASS_NO}</u></b></FormGroup>
                                        </Col>
                                        <Col md="6" sm="6">
                                            <ButtonGroup>
                                                <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>GATEPASS TYPE : </span>{gatePassDeliveryData?.GATEPASS_TYPE}</u></b></FormGroup>
                                                <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{gatePassDeliveryData?.FROM_PLANT}</u></b></FormGroup>
                                            </ButtonGroup>
                                        </Col>
                                        {gatePassDeliveryData?.VENDOR_PLANT_NAME ?
                                            <Col md="3" sm="3">
                                                <FormGroup><b><u><span className='text-primary'>VENDOR PLANT : </span>{gatePassDeliveryData?.VENDOR_PLANT_NAME}</u></b></FormGroup>
                                            </Col> : null
                                        }

                                        <Col md="12" sm="12">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                        <th className="bg-primary text-white text-center">MATERIAL</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                        {gatePassDeliveryData.SAP_LINE[0].REC_PLANT != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                        <th className="bg-primary text-white text-center" width='10%'>VALUE</th>
                                                    </tr>
                                                </thead>
                                                {gatePassDeliveryData?.SAP_LINE.map((lineItem) => {
                                                    return (
                                                        <tbody key={lineItem.LINE_ITEM}>
                                                            <tr>
                                                                <td className='text-center'>{lineItem?.LINE_ITEM}</td>
                                                                <td>{lineItem?.MATERIAL}</td>
                                                                <td className='text-center'>{lineItem?.UOM}</td>
                                                                <td className='text-center'>{lineItem?.QTY}</td>
                                                                {lineItem?.REC_PLANT != '' ? <td className='text-center'>{lineItem?.REC_PLANT}</td> : null}
                                                                <td className='text-center'>{lineItem?.VALUE}</td>
                                                            </tr>
                                                        </tbody>
                                                    )
                                                })}
                                            </table>
                                            <br />
                                        </Col>
                                    </Row>
                                </Col>))}
                        </Row> : null
                    }
                   

                    {data.weighmentInfoId > 0  ? <Row>
                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                        </Col>

                        {/* <Col md="3" sm="3"><Label>Document Number</Label></Col> */}
                        <Col md="4" sm="4"><Label>First Weight</Label></Col>
                        <Col md="4" sm="4"><Label>Second Weight</Label></Col>
                        <Col md="4" sm="4"><Label>Net Weight</Label></Col>
                      

                        {weighmentData.map((weighmentData) => (
                            <Col md="12" sm="12">
                                <Row>
                                    {/* <Col md="3" sm="3" key={weighmentData.documentNumber}>
                                        <FormGroup>
                                            <Input typr="text" placeholder="Document" value={weighmentData?.documentNumber ? weighmentData?.documentNumber : 0} disabled />
                                        </FormGroup>
                                    </Col> */}
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight ? weighmentData?.secondWeight : 0} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight ? weighmentData?.netWeight : 0} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                                
                        ))}
                        
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Over All First Weight</Label>
                                <Input typr="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Over All Second Weight</Label>
                                <Input typr="text" placeholder="Second Weight" value={overAllWeight.secondWeight ? overAllWeight.secondWeight : 0} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Over All Net Weight</Label>
                                <Input typr="text" placeholder="Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight).toFixed(3)} disabled />
                            </FormGroup>
                        </Col>

                        {fgDetailsData[0]?.OVERALL_DELIVERY_WT ? <>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>{data.moduleTypeId == 1 ? "Shipment Weight" : "Delivery Weight"}</Label>
                                    <Input type="text" placeholder="Delivery Weight" value={fgDetailsData[0]?.OVERALL_DELIVERY_WT ? Number(fgDetailsData[0]?.OVERALL_DELIVERY_WT).toFixed(3) : 0} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Net Weight" value={fgWeighment?.netWeight || data?.netWeight ? Number(fgWeighment?.netWeight ? fgWeighment?.netWeight : data?.netWeight).toFixed(3) : 0} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>{data.moduleTypeId == 1 ? "Diff WB (Shipment Weight & Net weight)" : "Diff (Delivery Weight & Net weight)"}</Label>
                                    <Input type="text" placeholder="Total Weight" value={fgWeighment?.netWeight || data?.netWeight ? Number(Number(fgDetailsData[0]?.OVERALL_DELIVERY_WT) - Number(fgWeighment?.netWeight ? fgWeighment?.netWeight : data?.netWeight)).toFixed(3) : Number(fgDetailsData[0]?.OVERALL_DELIVERY_WT).toFixed(3)} disabled />
                                </FormGroup>
                            </Col> </> : null
                        }

                    </Row> : null}

                    <Row>
                        {/* {data?.shipmentOrderNo != null || data.getIsIFoodSales == 0 ?
                            <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message ? response.message : 'No Data Found'}</b></h5><br /></Alert></Col> : null
                        } */}

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                {data.weighmentInfoId > 0 ?
                                    <div style={{ float: 'left' }}>
                                        {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                            <Button.Ripple color="danger" type="button" onClick={() => setShow({ isOpen: true, moduleStatusId: 2 })}>
                                                <X size={16} /> 2nd WT Reject
                                            </Button.Ripple> : null
                                        }
                                        {/* {isHide && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                                            <Button.Ripple className="ml-2" color="danger" type="button" onClick={() => setShow({ isOpen: true, moduleStatusId: 1 })}>
                                                <X size={16} /> 1st WT Reject
                                            </Button.Ripple> : null
                                        } */}
                                    </div> : null
                                }

                                <div style={{ float: 'right' }}>
                                    {canSubmit ? <>
                                        
                                        {(data?.moduleTypeId == 39 || data?.subModuleTypeId == 19) ?
                                            <>
                                                {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                                    <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                                        <Check size={16} /> Submit
                                                    </Button.Ripple> : null
                                                }
                                            </> : null
                                        } </> : null
                                    }

                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody >
            </Card >

            <Modal show={show.isOpen} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={() => setShow({ isOpen: false, moduleStatusId: 0 })} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                                    label={"Reason"}
                                    form={form}
                                    id="rejectReason"
                                />
                            </FormGroup>
                        </Col>
                        {/* <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Document Number</Label>
                                <ReactSelect
                                    value={selectedDocument}
                                    options={documentDetails}
                                    onChange={selectDocument}
                                />
                            </FormGroup>
                        </Col> */}
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={() => reject(show.moduleStatusId)}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default FGSAPDocumentIFoods;
