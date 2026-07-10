import React, { Fragment, useState } from "react";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "react-feather";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { useHistory } from "react-router-dom";
import { apiBaseUrl, sapFileShare } from '../../../../urlConstants';
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";
import Uploader from "../../../Uploader";
import { apiPostMethod } from "../../../../helper/axiosHelper";

const SDGSGateOut = () => {

    let { gateInOutInfoId } = useParams();
    let history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])
    const [weighmentData, setWeighmentData] = useState([])
    const [overAllSecountWeight, setOverAllSecountWeight] = useState('')

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    setInvoiceData(data.invoiceInfo)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
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
                    setOverAllSecountWeight(lastItem.secondWeight)
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

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
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { invoiceCopy } = postdata;

            postdata.append("image[]", invoiceCopy);

            let UploadFile = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;

            postdata.append("form_name", 'Scrap_Dust_Gunny_PP_Sales');
            postdata.append("SubFolder", "SDGS_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
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
        if (!fdata.invoiceCopy) {
            errorToast("Please Attach Sales Invoice Copy")
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

    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>SDGS - Gate Out</h5></CardHeader>
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

                            {data.weighmentInfoId > 0 ? <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Empty Weight</Label>
                                        <Input typr="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Load Weight</Label>
                                        <Input typr="text" placeholder="Enter Load Weight" value={overAllSecountWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Net Weight</Label>
                                        <Input typr="text" placeholder="Enter Net Weight" value={Number(overAllSecountWeight - data?.firstWeight)} disabled />
                                    </FormGroup>
                                </Col>
                            </> : null
                            }

                            {invoiceData.map((invoiceData) => (<>

                                <Col md="4" sm="4"><Label>Delivery Number</Label></Col>
                                <Col md="4" sm="4"><Label>Sale Invoice No</Label></Col>
                                <Col md="4" sm="4"><Label>Customer Name</Label></Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Input type="text" placeholder="Enter Sale Invoice No" value={invoiceData.invoiceNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Input type="text" placeholder="Enter Sale Invoice No" value={invoiceData.invoiceNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Input type="text" placeholder="Enter Customer Name" value={invoiceData.customerName} disabled />
                                    </FormGroup>
                                </Col> </>
                            ))}

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
                                            title="Sales Invoice Copy"
                                            id={"invoiceCopy"}
                                            selectedFileName={attachedFiles.invoiceCopy.name}
                                        />
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="10" md="10">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button.Ripple outline color="primary" type="button" onClick={reload}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                            <Col sm="2" md="2">
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
        </div>
    );
};

export default SDGSGateOut;
