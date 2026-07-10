import React, { Fragment, useState } from "react";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "react-feather";
import Uploader from "../Uploader";
import { apiBaseUrl, sapFileShare, uploadUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation } from "../forms/custom-form";
import { useHistory } from "react-router-dom";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const FGGateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState("")

    let { gateInOutInfoId } = useParams();

    const [result1, setResult1] = useState([])
    const [result2, setResult2] = useState([])
    const [result3, setResult3] = useState(false)

    const [Dealyreason, setDealyreason] = useState([])
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    const [checkInvoiceMismatch, setCheckInvoiceMismatch] = useState([])

    const deliveryNumber1 = result1.map((result1) => result1.deliveryNumber);
    const deliveryNumber2 = result2.map((result2) => result2.DELIVERY_NO);

    const getGateInInfo = () => {

        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                    let shipmentData = data.invoiceInfo.filter((item) => item.isManual == 0) 
                    setResult1(shipmentData);
                    getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)

                    apiPostMethod(apiBaseUrl + `LandingDataController/FGSales_DocumentVerify`, { gateInInfoId: data.results[0].gateInOutInfoId, shipmentOrderNo: data.results[0].shipmentOrderNo, tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber, Type: 'Get' })
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                let invoiceData = [];
                                for (let i = 0; i < data.fg_details_data.length; i++) {
                                    let sapLine = data.fg_details_data[i].SAP_LINE
                                    for (let k = 0; k < sapLine.length; k++) {
                                        let sapData = sapLine[k]
                                        invoiceData.push(sapData);
                                    }
                                }
                                setResult2(invoiceData);
                                getfgdelaytimeinfo(data.gate_info[0].vehicleType)
                                setDealyreason(data.gate_info[0].delay_reason)
                                if(data.gate_info[0].moduleType == 43){
                                    materialDetailsGet(data.gate_info[0].gateInOutInfoId,invoiceData) 
                                }
                                let invoiceNumber1 = shipmentData.map((result1) => result1.invoiceNumber);
                                let invoiceNumber2 = invoiceData.map((result2) => result2.INVOICE_NO);

                                const diff1 = invoiceNumber1.filter(x => !invoiceNumber2.includes(x));
                                const diff2 = invoiceNumber2.filter(x => !invoiceNumber1.includes(x));

                                let diff = [...diff1, ...diff2]
                                setCheckInvoiceMismatch(diff)
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    // const materialDetailsGet = (gateInOutData, shipmentData) => {
    //     console.log(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`);
        
    //     apiPostMethod(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`)
    //         .then((response) => {
    //             const { data } = response;
    
    //             // Map API response to a structured format
    //             const apiDeliveryNos = data.results.map(item => ({
    //                 deliveryNo: item.deliveryNo,
    //                 lineItem: item.lineItem,
    //                 material: item.material
    //             }));
    //             const allMaterials = shipmentData.flatMap(shipment => 
    //                 shipment.MATERIAL_LINE.map(material => ({
    //                     ...material,
    //                     DELIVERY_NO: shipment.DELIVERY_NO // Add DELIVERY_NO from shipment
    //                 }))
    //             );

    //             console.log("API Delivery Nos:", apiDeliveryNos);
    //             console.log("Shipment Data:", shipmentData);
    //             console.log("allMaterials:", allMaterials);

    //                 const matchingShipments = shipmentData.filter(shipment => {
    //                 if (!shipment?.MATERIAL_LINE || shipment?.MATERIAL_LINE.length === 0) {
    //                     return false; // Skip shipments without materials
    //                 }
    
                   
    
    //                 const matchedMaterials = allMaterials.filter(material =>
    //                     apiDeliveryNos.some(apiItem =>
    //                         String(apiItem.deliveryNo).trim() === String(material.DELIVERY_NO).trim() &&
    //                         String(apiItem.lineItem).trim() === String(material.LINE_ITEM1).trim() &&
    //                         String(apiItem.material).trim() === String(material.MATERIAL).trim()
    //                     )
    //                 );

    //                 const matchedMaterials1 = apiDeliveryNos.filter(material =>
    //                     allMaterials.some(apiItem =>
    //                         String(apiItem.DELIVERY_NO).trim() === String(material.deliveryNo).trim() &&
    //                         String(apiItem.LINE_ITEM1).trim() === String(material.lineItem).trim() &&
    //                         String(apiItem.MATERIAL).trim() === String(material.material).trim()
    //                     )
    //                 );

    //                 if(matchedMaterials.length ==  allMaterials.length){
    //                     allMaterials == true
    //                 }else{
    //                     allMaterials == false
    //                 }
    //                 if(matchedMaterials1.length ==  apiDeliveryNos.length){
    //                     apiDeliveryNos == true
    //                 }else{
    //                     apiDeliveryNos == false
    //                 }
    //                 return allMaterials && apiDeliveryNos;
    //             });
    
    //             setResult3(matchingShipments);
    //         });
    // }
    const materialDetailsGet = (gateInOutData, shipmentData) => {
        console.log(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`);
        
        apiPostMethod(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`)
            .then((response) => {
                const { data } = response;
    
                // Map API response to a structured format
                const apiDeliveryNos = data.results.map(item => ({
                    deliveryNo: String(item.deliveryNo).trim(),
                    lineItem: String(item.lineItem).trim(),
                    material: String(item.material).trim()
                }));
    
                // Flatten shipmentData and include DELIVERY_NO in each material
                const allMaterials = shipmentData.flatMap(shipment => 
                    shipment.MATERIAL_LINE.map(material => ({
                        ...material,
                        DELIVERY_NO: String(shipment.DELIVERY_NO).trim(), // Add DELIVERY_NO from shipment
                        LINE_ITEM1: String(material.LINE_ITEM1).trim(),
                        MATERIAL: String(material.MATERIAL).trim()
                    }))
                );
    
                
    
                // Function to check if an apiItem exists in allMaterials
                const isApiItemInMaterials = (apiItem) =>
                    allMaterials.some(material =>
                        apiItem.deliveryNo === material.DELIVERY_NO &&
                        apiItem.lineItem === material.LINE_ITEM1 &&
                        apiItem.material === material.MATERIAL
                    );
    
                // Function to check if a material exists in apiDeliveryNos
                const isMaterialInApiItems = (material) =>
                    apiDeliveryNos.some(apiItem =>
                        apiItem.deliveryNo === material.DELIVERY_NO &&
                        apiItem.lineItem === material.LINE_ITEM1 &&
                        apiItem.material === material.MATERIAL
                    );
    
                // Check if all apiDeliveryNos exist in allMaterials
                const allApiItemsMatched = apiDeliveryNos.every(isApiItemInMaterials);
    
                // Check if all allMaterials exist in apiDeliveryNos
                const allMaterialsMatched = allMaterials.every(isMaterialInApiItems);
    
                // Determine if both arrays fully match each other
                const arraysFullyMatch = allApiItemsMatched && allMaterialsMatched;
    
                console.log("All API Items Matched:", allApiItemsMatched);
                console.log("All Materials Matched:", allMaterialsMatched);
                console.log("Arrays Fully Match:", arraysFullyMatch);
    
               
               
                setResult3(arraysFullyMatch);
            });
    };
    
    const getGatepassDeliveryInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatepassDeliveryData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo()
    }, [gateInOutInfoId])

    const findDifferences = (arr1, arr2) => {
        return arr1.filter(num => !arr2.includes(num)).concat(arr2.filter(num => !arr1.includes(num)));
    };

    const [delaytimeinfo, setdelaytimeinfo] = useState([])
    const [delaypalntcode, setdelaypalntcode] = useState([])



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
                            adjustedDelayTime,
                            gateOutMinutes // Add adjusted delay time to the object
                        };
                    });

                    let delaytime = updatedData[0].gateOutMinutes
                    let delaypalntcode = updatedData[0].plantcode

                   
                    setdelaytimeinfo(delaytime); // Set the processed data
                    setdelaypalntcode(delaypalntcode); // Set the processed data
                  
                } else {
                   
                    // errorToast("Unexpected data format received from the server.");
                }
            })
            .catch((error) => {
                // console.error("API Error:", error);
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
 


    const submit = (fdata) => {
        const differences = findDifferences(deliveryNumber1, deliveryNumber2);

       
        if ((!fdata.shipmentCopy && data?.isRedirect == null) || (!fdata.shipmentCopy && data?.isRedirect == 1 && data?.redirectMasterPlantId == null) || (!fdata.shipmentCopy && data?.redirectedGateInOutInfoId == null && data?.movementTypeId == 2)) {
            errorToast("Please Attach Shipment Copy")
        } 
        else if ((!fdata.shipmentCopy && data?.isRedirect == null) || (!fdata.shipmentCopy && data?.isRedirect == 1 && data?.redirectMasterPlantId == null) || (!fdata.shipmentCopy && data?.redirectedGateInOutInfoId == null && data?.movementTypeId == 2)) {
            errorToast("Please Attach Shipment Copy")
        } 
        
        else if ((delaypalntcode == data?.masterPlantId
        ) && (data.moduleTypeId == 1 || data.moduleTypeId == 2) && (timeDifference >= delaytimeinfo)  && (Dealyreason== "" || Dealyreason == undefined)) {
            errorToast('Please Contact Billing team for delay reason')
            return false
        }

        else {
            if ((data?.isRedirect == 1 && data?.redirectPlantName != null && data?.secondWeight == null) || data?.redirectedGateInOutInfoId > 0 || data?.shipmentOrderNo == null) {
                updateVehicleStatus(fdata)
            }else if(data?.moduleTypeId == 43 && data?.confirmationStatus == 1 && !fdata.coaCopy){
                errorToast("Please Attach Outside WB Copy")
            }
            else if (data.vehicleType === 'BULKER' || data.vehicleType === 'TRAILER') {
                if (!fdata.coaCopy) {
                    errorToast("Please Attach COA Copy")
                } else if (checkInvoiceMismatch != '') {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Invoice Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else if (differences.length > 0) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    updateVehicleStatus(fdata)
                }
            }
            else {
                if (checkInvoiceMismatch != '') {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Invoice Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else if (differences.length > 0) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }else if (result3 == false && data?.moduleTypeId == 43) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Material Not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    updateVehicleStatus(fdata)
                }
            }
        }
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
        }),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateVehicleStatus = (fdata) => {

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    if (data?.isRedirect == 1 && data?.redirectPlantName != null && data?.secondWeight == null) {
                        gateIn()
                    } else {
                        reload();
                    }
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const gateIn = () => {

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: data.movementType,
            moduleType: data.moduleType,
            vehicleNo: data.vehicleNo,
            driverMobileNumber: data.driverMobileNumber,
            masterPlantId: data.redirectMasterPlantId,
            shipmentOrderNo: data.shipmentOrderNo,
            tripSheetNumber: data.tripSheetNumber,
            truckType: data.truckType,
            truckCapacity: data.truckCapacity,
            vehicleType: data.vehicleType,
            loadingUnloadingInfoId: data.loadingUnloadingInfoId,
            isWeight: data.isWeight,
            isRedirect: data.isRedirect,
            redirectedGateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 0
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    reload()
                }
                else if (res.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const reload = () => {
        if (data.movementType == 'LOADING') {
            history.push(`/Loading/GateIn`);
        } else {
            history.push(`/VA`);
        }
    }

    const [remrks, setRemrks] = useState(false)
    const [generalData, setGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [hideDownArrow, setHideDownArrow] = useState(false)

    const [invoiceData, setInvoiceData] = useState([])

    const showGeneralData = () => {
        setRemrks(true)
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideGeneralData = () => {
        setRemrks(false)
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const upload = () => {

        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            // unloadingDetails: data?.isRedirect == 0 || data?.isRedirect == null ? unloadingData : []
        }

        console.log(fdata);

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { shipmentCopy, coaCopy } = postdata;

            postdata.append("image[]", shipmentCopy);
            postdata.append("image[]", coaCopy);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.shipmentCopy && attachedFiles.shipmentCopy.name && attachedFiles.shipmentCopy.name.length ? true : false;
            UploadFile1 = attachedFiles.coaCopy && attachedFiles.coaCopy.name && attachedFiles.coaCopy.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.shipmentCopy = data.files[0] ? data.files[0].updname : "";
                        fdata.coaCopy = data.files[1] ? data.files[1].updname : "";
                        submit(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            submit(fdata)
        }
    };

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>FG - Gate Out</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        {data.colorToken ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Enter Color / Token" value={data.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                            </FormGroup>
                        </Col>

                        {/* {data.firstWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.secondWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data.secondWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.netWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        } */}

                        {data?.isRedirect == 1 && data?.redirectPlantName != null && data?.secondWeight == null ?
                            <>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant</Label>
                                        <Input type="text" placeholder="Enter From Plant" value={data?.plantName} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.firstWeight != null ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant First Weight</Label>
                                            <Input type="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant</Label>
                                        <Input type="text" placeholder="Enter Redirect Plant" value={data?.redirectPlantName} disabled />
                                    </FormGroup>
                                </Col>
                            </> : null
                        }


                        {data?.isRedirect == null || ((data?.isRedirect == 1) && (data?.redirectMasterPlantId == null || data?.redirectMasterPlantId == 0)) || (data?.redirectedGateInOutInfoId == null && data?.movementTypeId == 2) ?
                            <Col sm="8" md="8">
                                <label></label>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>Attachments :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="Shipment Copy"
                                            id={"shipmentCopy"}
                                            selectedFileName={attachedFiles.shipmentCopy.name}
                                        />
                                    </div>
                                    {(data.vehicleType == 'BULKER' || data.vehicleType == 'TRAILER' || (data?.moduleTypeId == 43 && data?.confirmationStatus == 1)) ?
                                        <div className="mr-1">
                                            <Uploader
                                                setAttachment={handleFileChange}
                                                title= {data?.moduleTypeId == 43 ? 'Outside WB Copy': "COA Copy"}
                                                id={"coaCopy"}
                                                selectedFileName={attachedFiles.coaCopy.name}
                                            />
                                        </div> : null
                                    }
                                </FormGroup>
                            </Col> : null
                        }
                    </Row>

                    {data?.tripSheetNumber != null ?
                        <Row>
                            <Col sm="12" md="12">
                                <hr></hr>
                                <FormGroup>
                                    <Label for="nameMulti"><b>Click Here :
                                        &nbsp;&nbsp;
                                        {showDownArrow ?
                                            <Button.Ripple outline color="white" type="button" onClick={showGeneralData} className="text-primary">
                                                General Details <ChevronDown size={20} />
                                            </Button.Ripple> : null
                                        }
                                        {hideDownArrow ?
                                            <Button.Ripple outline color="white" type="button" onClick={hideGeneralData} className="text-primary">
                                                General Details <ChevronUp size={20} />
                                            </Button.Ripple> : null
                                        }
                                    </b></Label>
                                </FormGroup>
                            </Col>
                        </Row> : null
                    }

                    {generalData && data?.tripSheetNumber != null ? <>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={data.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Enter Truck Type" value={data.truckType} disabled />
                                </FormGroup>
                            </Col>
                            {data.shipmentOrderNo != null ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Shipment Order No</Label>
                                        <Input type="text" placeholder="Enter Shipment Order No" value={data.shipmentOrderNo} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {invoiceData.map(invoiceData => (
                                <Col md="4" sm="4" key={invoiceData.SUP_VE_REFID}>
                                    <FormGroup>
                                        <Label>Invoice No</Label>
                                        <Input type="text" placeholder="Enter Invoice No" value={invoiceData.SEAL_NO} disabled />
                                    </FormGroup>
                                </Col>
                            ))}
                        </Row>

                        {/* {gatepassDeliveryData != '' ?
                            <Row>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                                </Col>
                                {gatepassDeliveryData?.map(gatepassDeliveryData => (
                                    <>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Return Type</Label>
                                                <Input type="text" placeholder="Enter Return Type" value={gatepassDeliveryData.gatePassType} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Gate Pass No</Label>
                                                <Input type="text" placeholder="Enter Gate Pass No" value={gatepassDeliveryData.gatePassNo} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>From Plant</Label>
                                                <Input type="text" placeholder="Enter Plant" value={gatepassDeliveryData.fromPlantName} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="12" sm="12">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                        <th className="bg-primary text-white text-center">MATERIAL</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                        {gatepassDeliveryData.sapLine[0].toPlantName != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                    </tr>
                                                </thead>
                                                {gatepassDeliveryData?.sapLine.map((lineItem) => {
                                                    return (
                                                        <tbody key={lineItem.lineItem}>
                                                            <tr>
                                                                <td className='text-center'>{lineItem?.lineItem}</td>
                                                                <td>{lineItem?.material}</td>
                                                                <td className='text-center'>{lineItem?.uom}</td>
                                                                <td className='text-center'>{lineItem?.quantity}</td>
                                                                {lineItem?.toPlantName != '' ? <td className='text-center'>{lineItem?.toPlantName}</td> : null}
                                                            </tr>
                                                        </tbody>
                                                    )
                                                })}
                                            </table>
                                            <br />
                                        </Col>
                                    </>))}
                            </Row> : null
                        } */}
                    </> : null}

                    <Row>
                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={reload}>
                                    <ArrowLeft size={16} /> Back
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={upload}>
                                    <Check size={16} /> Gate Out
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment >
    );
};

export default FGGateOut;
