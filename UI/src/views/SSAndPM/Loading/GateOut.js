import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiBaseUrl, sapFileShare, uploadUrl } from "../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "react-feather";
import Uploader from "../../Uploader";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShowToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Yup } from "../../forms/custom-form";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";

const GateOut = () => {

    const [data, setData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])

    const history = useHistory();

    let { gateInOutInfoId } = useParams();

    const [showGeneralData, setShowGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    const showshowGeneralData = () => {
        setShowDownArrow(false)
        setShowGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setShowGeneralData(false)
        setShowDownArrow(true)
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // remarks: ""
        }),
        updateVehicleStatus() { },
    });

    const [unloadingData, setUnloadingData] = useState([]);

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    setInvoiceData(data.invoiceInfo)
                    getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)

                    const unloading = [];

                    for (let i = 0; i < data.invoiceInfo.length; i++) {
                        const obj = {
                            userInfoId: UserDetails.USERID,
                            movementType: 'Unloading',
                            moduleType: data.results[0].moduleType,
                            subModuleTypeId: data.results[0].subModuleTypeId,
                            vehicleNo: data.results[0].vehicleNo,
                            vaNumber: data.results[0].vaNumber,
                            shipmentOrderNo: null,
                            driverMobileNumber: data.results[0].driverMobileNumber,
                            masterPlantId: data.invoiceInfo[i].toMasterPlantId,
                            route: data.results[0].route,
                            masterColorTokenId: data.results[0].masterColorTokenId,
                            tripSheetNumber: data.results[0].tripSheetNumber,
                            truckType: data.results[0].truckType,
                            clean: data.results[0].clean,
                            oder: data.results[0].oder,
                            tarpaulin: data.results[0].tarpaulin,
                            noOfTarpaulin: data.results[0].noOfTarpaulin,
                            platformCondition: data.results[0].platformCondition,
                            isVehicleFit: data.results[0].isVehicleFit,
                            previousLoadData: data.results[0].previousLoadData,
                            truckCapacity: data.results[0].truckCapacity,
                            vehicleType: data.results[0].vehicleType,
                            stoPoNo: data.results[0].stoPoNo,
                            deliveryOrderNumber: data.invoiceInfo[0].deliveryNumber,
                            loadingUnloadingInfoId: data.results[0].loadingUnloadingInfoId,
                            moduleStatusId: 0
                        };
                        unloading.push(obj);
                        setUnloadingData(unloading);
                        console.log(unloading);
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message);
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

    const redirect = () => {
        if (data.movementType == 'LOADING') {
            history.push(`/Loading/GateIn`);
        } else {
            history.push(`/VA`);
        }
    }

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const submit = (fdata) => {
        if (!fdata.pickSlipCopy && data?.moduleTypeId != 44) {
            errorToast("Please Attach Delivery Document")
        }else if(data?.moduleTypeId == 44 && data?.netWeight > 0) {
            updateMigo(fdata)
        } else {
            updateVehicleStatus(fdata)
        }
    }

    const updateVehicleStatus = (fdata) => {
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    history.push(`/Loading/GateIn`);
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
                console.log(res);
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }
    const updateMigo = (fdata) => {
        showLoader();
        console.log(apiBaseUrl + "LandingDataController/UpdateMigo", fdata);
        apiPostMethod(apiBaseUrl + "LandingDataController/UpdateMigo", fdata)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    confirmDialog({
                        title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        history.push(`/Loading/GateIn`);
                    });
                   
                }
                else if (data.success == false) {
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
    const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {}, sendingWBSlip: {} });

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
            remarks: formData ? formData.remarks : null,
            userInfoId: UserDetails.USERID,
            unloadingDetails: unloadingData,
            loadingUnloadingInfoId: data.loadingUnloadingInfoId,
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { pickSlipCopy, sendingWBSlip } = postdata;

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
                <CardHeader><h5>Loading - SS, PM & RM - Gate Out</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>STO PO</Label>
                                <Input type="text" placeholder="Enter STO PO" value={data?.stoPoNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>
                        {data?.weighmentInfoId > 0 ? <>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data?.secondWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                                </FormGroup>
                            </Col> </> : null
                        }
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Remarks</Label>
                                <Input type="text" placeholder="Enter Remarks" />
                            </FormGroup>
                        </Col>
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
                                        title="Delivery Doc"
                                        id={"pickSlipCopy"}
                                        selectedFileName={attachedFiles.pickSlipCopy.name}
                                    />
                                </div>
                                {/* <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Weighment Slip"
                                        id={"sendingWBSlip"}
                                        selectedFileName={attachedFiles.sendingWBSlip.name}
                                    />
                                </div> */}
                            </FormGroup>
                        </Col>

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
                                    {!showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                                            General Details <ChevronUp size={20} />
                                        </Button.Ripple> : null
                                    }
                                </b></Label>
                            </FormGroup>
                        </Col>

                        {showGeneralData ? <>
                            {invoiceData.map((invoiceData) => <>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Delivery No</Label>
                                        <Input type="text" placeholder="Enter Delivery No" value={invoiceData?.deliveryNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant</Label>
                                        <Input type="text" placeholder="Enter From Plant" value={data?.plantName} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>To Plant</Label>
                                        <Input type="text" placeholder="Enter To Plant" value={invoiceData?.plantName} disabled />
                                    </FormGroup>
                                </Col>

                                {gatepassDeliveryData != '' ?
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
                                                    <br />
                                                </Col>
                                            </>))}
                                    </> : null
                                }
                            </>)} </> : null
                        }

                        <Col sm="8" md="8"></Col>
                        <Col sm="8" md="8"></Col>

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
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
        </Fragment >
    );
};

export default GateOut;
