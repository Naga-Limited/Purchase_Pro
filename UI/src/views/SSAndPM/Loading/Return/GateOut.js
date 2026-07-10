import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiBaseUrl, sapFileShare, uploadUrl } from "../../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "react-feather";
import Uploader from "../../../Uploader";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShowToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useHistory } from "react-router-dom";
import { Yup } from "../../../forms/custom-form";

const GateOut = () => {

    const [data, setData] = useState([])
    const [generalData, setGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();

    const showGeneralData = () => {
        setShowDownArrow(false)
        setGeneralData(true)
    }

    const hideGeneralData = () => {
        setGeneralData(false)
        setShowDownArrow(true)
    }

    let { gateInOutInfoId } = useParams();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    getPurchaseReturnDeliveryDetails(data.results[0].gateInOutInfoId)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [purchaseReturnDeliveryData, setPurchaseReturnDeliveryData] = useState([])

    const getPurchaseReturnDeliveryDetails = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getPurchaseReturnDeliveryDetails/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getPurchaseReturnDeliveryDetails/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPurchaseReturnDeliveryData(data.results[0]);
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        updateVehicleStatus(fdata) { },
    });

    const [attachedFiles, setAttachment] = useState({ returnDocument: {}, rejectionDeclarationForm: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const redirect = () => {
        if (data.movementType == 'LOADING') {
            history.push(`/Loading/GateIn`);
        } else {
            history.push(`/VA`);
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
                    redirect();
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

    const upload = () => {

        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks ? formData.remarks : null,
            userInfoId: UserDetails.USERID,
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { returnDocument, rejectionDeclarationForm } = postdata;

            postdata.append("image[]", returnDocument);
            postdata.append("image[]", rejectionDeclarationForm);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.returnDocument && attachedFiles.returnDocument.name && attachedFiles.returnDocument.name.length ? true : false;
            UploadFile1 = attachedFiles.rejectionDeclarationForm && attachedFiles.rejectionDeclarationForm.name && attachedFiles.rejectionDeclarationForm.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.returnDocument = data.files[0] ? data.files[0].updname : "";
                        fdata.rejectionDeclarationForm = data.files[1] ? data.files[1].updname : "";
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

    const submit = (fdata) => {
        if (!fdata.returnDocument) {
            errorToast("Please Attach Return Document")
        } else if (!fdata.rejectionDeclarationForm) {
            errorToast("Please Attach Rejection Declaration Form")
        }else {
            updateVehicleStatus(fdata)
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>SS & PM - Return - Gate Out</h5></CardHeader>
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
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        {data.weighmentInfoId ? <>
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
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Remarks</Label>
                                <Input type="text" placeholder="Enter Remarks" />
                            </FormGroup>
                        </Col>

                        <Col sm="12" md="12">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Return Doc"
                                        id={"returnDocument"}
                                        selectedFileName={attachedFiles.returnDocument.name}
                                    />
                                </div>
                                {/* <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Weighment Slip"
                                        id={"rejectionDeclarationForm"}
                                        selectedFileName={attachedFiles.rejectionDeclarationForm.name}
                                    />
                                </div> */}
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Rejection Declaration Form"
                                        id={"rejectionDeclarationForm"}
                                        selectedFileName={attachedFiles.rejectionDeclarationForm.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>

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
                                    {!showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideGeneralData} className="text-primary">
                                            General Details <ChevronUp size={20} />
                                        </Button.Ripple> : null
                                    }
                                </b></Label>
                            </FormGroup>
                        </Col>
                        {generalData ? <>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Migo No</Label>
                                    <Input type="text" placeholder="Migo No" value={purchaseReturnDeliveryData.migoNo} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Vendor No</Label>
                                    <Input type="text" placeholder="Vendor No" value={purchaseReturnDeliveryData.vendorNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Vendor Name</Label>
                                    <Input type="text" placeholder="Vendor Name" value={purchaseReturnDeliveryData.vendorName} disabled />
                                </FormGroup>
                            </Col> </> : null
                        }
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
                                <Button.Ripple color="primary" type="button" onClick={upload}>
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
