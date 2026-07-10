import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useFormik } from 'formik';
import { CustomTextInput, Yup } from '../../../forms/custom-form';
import { useSelector } from 'react-redux';
import { useParams } from "react-router";
import { apiBaseUrl, sapFileShare } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import Uploader from '../../../Uploader';
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'react-feather';
import { useHistory } from "react-router-dom";
import { useLoader } from '../../../../utility/hooks/useLoader';

const SDGStoGateOut = () => {

    const [data, setData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])
    const [generalData, setGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [hideDownArrow, setHideDownArrow] = useState(false)
    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState('')

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    let { showLoader, hideLoader } = useLoader();
    let history = useHistory();
    let { gateInOutInfoId } = useParams();

    const [unloadingData, setUnloadingData] = useState([]);

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    setInvoiceData(data.invoiceInfo)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)

                    const unloading = [];

                    for (let i = 0; i < data.invoiceInfo.length; i++) {
                        const obj = {
                            userInfoId: UserDetails.USERID,
                            movementType: 'Unloading',
                            moduleType: data.results[0].moduleType,
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

    const getWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
                    let lastItem = data.data.slice(-1)[0]
                    setOverAllWeight(lastItem)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo()
    }, [])

    const showGeneralData = () => {
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideGeneralData = () => {
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

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
            remarks: formData ? formData.remarks : null,
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
            showLoader()
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.pickSlipCopy = data.files[0] ? data.files[0].updname : "";
                        fdata.sendingWBSlip = data.files[1] ? data.files[1].updname : "";
                        updateVehicleStatus(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            updateVehicleStatus(fdata)
        }
    };

    const redirect = () => {
        history.push(`/Loading/GateIn`);
    }

    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>SDGSto - Gate Out</h5></CardHeader>
                    <hr></hr>
                    <CardBody>
                        <Row>
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
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={overAllWeight.secondWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={Number(overAllWeight.secondWeight - data.firstWeight)} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
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
                            </Col>

                            {/* {data?.OwnWB > 0 ?
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
                                                title="Weighment Slip"
                                                id={"sendingWBSlip"}
                                                selectedFileName={attachedFiles.sendingWBSlip.name}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col> : null
                            } */}

                            <Col sm="12" md="12">
                                <hr></hr>
                                <FormGroup>
                                    <Label for="nameMulti"><b>Click Here :
                                        &nbsp;&nbsp;
                                        {showDownArrow ?
                                            <Button outline color="white" type="button" onClick={showGeneralData} className="text-primary">
                                                General Details <ChevronDown size={20} />
                                            </Button> : null
                                        }
                                        {hideDownArrow ?
                                            <Button outline color="white" type="button" onClick={hideGeneralData} className="text-primary">
                                                General Details <ChevronUp size={20} />
                                            </Button> : null
                                        }
                                    </b></Label>
                                </FormGroup>
                            </Col>

                            {generalData ? <>
                                {invoiceData.map((invoiceData) => (<>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PO Number</Label>
                                            <Input typr="text" placeholder="Enter PO Number" value={invoiceData?.poNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery Number</Label>
                                            <Input typr="text" placeholder="Enter Delivery Number" value={invoiceData?.deliveryNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery Quantity</Label>
                                            <Input typr="text" placeholder="Enter Delivery Quantity" value={invoiceData?.deliveryQty} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>To Plant</Label>
                                            <Input typr="text" placeholder="Enter To Plant" value={invoiceData?.plantName} disabled />
                                        </FormGroup>
                                    </Col>
                                </>))} </> : null
                            }

                            <Col sm="10" md="10">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>

                            <Col sm="2" md="2">
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
        </div>
    )
}

export default SDGStoGateOut