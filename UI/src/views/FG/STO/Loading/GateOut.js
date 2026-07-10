import React, { Fragment, useState } from "react";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "react-feather";
import Uploader from "../../../Uploader";
import { apiBaseUrl, sapFileShare, uploadUrl } from "../../../../urlConstants";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { apiPostMethod } from "../../../../helper/axiosHelper";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { useHistory } from "react-router-dom";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const GateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState([])

    let { gateInOutInfoId } = useParams();

    const [result1, setResult1] = useState([])
    const [result2, setResult2] = useState([])
    const [stoDeliveryData, setStoDeliveryData] = useState([])
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])
    const [sapData, setSapData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])

    const deliveryNumber1 = stoDeliveryData?.map((result1) => result1.deliveryNumber);
    const deliveryNumber2 = result2?.map((result2) => result2.DELIVERY_NO);
    

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    setResult1(data.invoiceInfo);
                    getDeliveryDetails(data.results[0])
                    getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)

                    // let deliveryInfo = data.invoiceInfo.filter((item) => item.moduleTypeId == 2)

                    // const unloading = [];

                    // for (let i = 0; i < deliveryInfo.length; i++) {
                    //     const obj = {
                    //         userInfoId: UserDetails.USERID,
                    //         movementType: 'Unloading',
                    //         moduleType: 'FG-STO',
                    //         vehicleNo: data.results[0].vehicleNo,
                    //         vaNumber: data.results[0].vaNumber,
                    //         shipmentOrderNo: null,
                    //         driverMobileNumber: data.results[0].driverMobileNumber,
                    //         masterPlantId: data.invoiceInfo[i].toMasterPlantId,
                    //         route: data.results[0].route,
                    //         masterColorTokenId: data.results[0].masterColorTokenId,
                    //         tripSheetNumber: data.results[0].tripSheetNumber,
                    //         truckType: data.results[0].truckType,
                    //         clean: data.results[0].clean,
                    //         oder: data.results[0].oder,
                    //         tarpaulin: data.results[0].tarpaulin,
                    //         noOfTarpaulin: data.results[0].noOfTarpaulin,
                    //         platformCondition: data.results[0].platformCondition,
                    //         isVehicleFit: data.results[0].isVehicleFit,
                    //         previousLoadData: data.results[0].previousLoadData,
                    //         truckCapacity: data.results[0].truckCapacity,
                    //         vehicleType: data.results[0].vehicleType,
                    //         stoPoNo: data.results[0].stoPoNo,
                    //         deliveryOrderNumber: data.invoiceInfo[i].deliveryNumber,
                    //         moduleStatusId: 0
                    //     };
                    //     unloading.push(obj);
                    //     setUnloadingData(unloading);
                    // }

                    apiPostMethod(apiBaseUrl + `LandingDataController/FGSales_DocumentVerify`, { gateInInfoId: data.results[0].gateInOutInfoId, shipmentOrderNo: data.results[0].shipmentOrderNo, tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber, Type: 'Get' })
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                let deliveryInfo = data.fg_details_data.filter((item) => item.TYPE == 'FG-STO')
                                setResult2(deliveryInfo[0]?.SAP_LINE);
                                setSapData(data.fg_details_data[0])
                                setInvoiceData(data.fg_details_data[0].SAP_LINE);
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

    const getDeliveryDetails = (gateInOutData) => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getDeliveryDetails/${gateInOutData.gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    let deliveryInfo = data.stoDeliveryInfo;
                    setStoDeliveryData(deliveryInfo)
                    if (deliveryInfo.length > 0) {

                        const unloading = [];

                        for (let i = 0; i < deliveryInfo.length; i++) {
                            const obj = {
                                userInfoId: UserDetails.USERID,
                                movementType: 'Unloading',
                                moduleType: 'FG-STO',
                                vehicleNo: gateInOutData.vehicleNo,
                                vaNumber: gateInOutData.vaNumber,
                                shipmentOrderNo: null,
                                driverMobileNumber: gateInOutData.driverMobileNumber,
                                masterPlantId: deliveryInfo[i].toMasterPlantId,
                                route: gateInOutData.route,
                                masterColorTokenId: gateInOutData.masterColorTokenId,
                                tripSheetNumber: gateInOutData.tripSheetNumber,
                                truckType: gateInOutData.truckType,
                                clean: gateInOutData.clean,
                                oder: gateInOutData.oder,
                                tarpaulin: gateInOutData.tarpaulin,
                                noOfTarpaulin: gateInOutData.noOfTarpaulin,
                                platformCondition: gateInOutData.platformCondition,
                                isVehicleFit: gateInOutData.isVehicleFit,
                                previousLoadData: gateInOutData.previousLoadData,
                                truckCapacity: gateInOutData.truckCapacity,
                                vehicleType: gateInOutData.vehicleType,
                                stoPoNo: gateInOutData.stoPoNo,
                                deliveryOrderNumber: deliveryInfo[i].deliveryNumber,
                                moduleStatusId: 0
                            };
                            unloading.push(obj);
                            setUnloadingData(unloading);
                        }
                    } else {
                        errorToast('Delivery Details Not Found')
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

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
    }, [])

    const findDifferences = (arr1, arr2) => {
        return arr1.filter(num => !arr2.includes(num)).concat(arr2.filter(num => !arr1.includes(num)));
    };

    const submit = (fdata) => {
        const differences = findDifferences(deliveryNumber1, deliveryNumber2);

        if ((!fdata.pickSlipCopy && data?.isRedirect == null) || (!fdata.pickSlipCopy && data?.isRedirect == 1 && data?.redirectMasterPlantId == null) || (!fdata.pickSlipCopy && data?.redirectedGateInOutInfoId == null && data?.movementTypeId == 2)) {
            errorToast("Please Attach Pick Slip Copy")
        } else {
            if ((data?.isRedirect == 1 && data?.redirectPlantName != null && data?.secondWeight == null) || data?.redirectedGateInOutInfoId > 0) {
                updateVehicleStatus(fdata)
            }
            else if (data.OwnWB == 0) {
                if (!fdata.sendingWBSlip) {
                    errorToast("Please Attach Sending WB Slip")
                } else if ((data?.isRedirect == 1 && data?.redirectPlantName != null) || data?.redirectedGateInOutInfoId > 0) {
                    updateVehicleStatus(fdata)
                } else if (differences.length > 0) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    updateVehicleStatus(fdata)
                }
            }
            else {
                if ((data?.isRedirect == 1 && data?.redirectPlantName != null) || data?.redirectedGateInOutInfoId > 0) {
                    updateVehicleStatus(fdata)
                } else if (differences.length > 0) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
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
            // remarks: ""
        }),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [unloadingData, setUnloadingData] = useState([]);

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

    const showshowGeneralData = () => {
        setRemrks(true)
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setRemrks(false)
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {}, sendingWBSlip: {} });
    const [ImgData, setImgData] = useState({});

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const AddDatasPO = () => {

        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            unloadingDetails: unloadingData
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();

            let { pickSlipCopy, sendingWBSlip } = ImgData;

            postdata.append("image[]", pickSlipCopy);
            postdata.append("image[]", sendingWBSlip);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.pickSlipCopy && attachedFiles.pickSlipCopy.name && attachedFiles.pickSlipCopy.name.length ? true : false;
            UploadFile1 = attachedFiles.sendingWBSlip && attachedFiles.sendingWBSlip.name && attachedFiles.sendingWBSlip.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");
            showLoader();
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.pickSlipCopy = data.files[0] ? data.files[0].updname : "";
                        fdata.sendingWBSlip = data.files[1] ? data.files[1].updname : "";
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
                <CardHeader><h5>Loading - STO - GateOut </h5></CardHeader>
                <hr />
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
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>

                        {data.colorToken ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color</Label>
                                    <Input type="text" placeholder="Enter Color / Token" value={data.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.truckCapacity ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Capacity</Label>
                                    <Input type="text" placeholder="Enter Truck Capacity" value={data.truckCapacity} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.weighmentInfoId ?
                            <>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Empty Weight</Label>
                                        <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.secondWeight ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Load Weight</Label>
                                            <Input type="text" placeholder="Enter Load Weight" value={data.secondWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {data?.netWeight ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Net Weight</Label>
                                            <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                } </> : null
                        }
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

                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Remarks</Label>
                                <Input type="text" placeholder="Enter Remarks" />
                            </FormGroup>
                        </Col>
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
                                            title="Pick Slip Copy"
                                            id={"pickSlipCopy"}
                                            selectedFileName={attachedFiles.pickSlipCopy.name}
                                        />
                                    </div>
                                    {data.OwnWB == 0 ?
                                        <div className="mr-1">
                                            <Uploader
                                                setAttachment={handleFileChange}
                                                title="Sending WB Slip"
                                                id={"sendingWBSlip"}
                                                selectedFileName={attachedFiles.sendingWBSlip.name}
                                            />
                                        </div> : null
                                    }
                                </FormGroup>
                            </Col> : null
                        }
                        <Col sm="12" md="12">
                            <hr></hr>
                            <FormGroup>
                                <Label for="nameMulti"><b>Click Here :
                                    &nbsp;&nbsp;
                                    {showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={showshowGeneralData} className="text-primary">
                                            General Details <ChevronDown size={20} />
                                        </Button.Ripple> : null
                                    }
                                    {hideDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                                            General Details <ChevronUp size={20} />
                                        </Button.Ripple> : null
                                    }
                                </b></Label>
                            </FormGroup>
                        </Col>

                        {generalData ? <>
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
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>STO PO No</Label>
                                    <Input type="text" placeholder="Enter STO PO No" value={data.stoPoNo} disabled />
                                </FormGroup>
                            </Col>
                            {stoDeliveryData?.map(invoiceData => (
                                <>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Type</Label>
                                            <Input type="text" placeholder="Type" value={invoiceData.moduleType} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>From Plant</Label>
                                            <Input type="text" placeholder="Enter From Plant" value={data.plantName} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>To Plant</Label>
                                            <Input type="text" placeholder="Enter To Plant" value={invoiceData.plantName} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3" key={invoiceData.lineItem}>
                                        <FormGroup>
                                            <Label>Delivery No</Label>
                                            <Input type="text" placeholder="Enter Delivery No" value={invoiceData.deliveryNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                </>
                            ))}

                            {/* {gatepassDeliveryData != '' ?
                                <>
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
                                            </Col>
                                        </>
                                    ))}
                                </> : null
                            }  */}
                        </> : null
                        }
                    </Row>
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
                                <Button.Ripple color="primary" type="button" onClick={AddDatasPO}>
                                    <Check size={16} /> Gate Out
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default GateOut;