import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShowToast } from "../../../../helper/appHelper";
import { useSelector } from "react-redux";
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useHistory } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const SAPDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const [data, setData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])

    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    setInvoiceData(data.invoiceInfo);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const SsAndPm_DocumentVerify = () => {
        const postData = { vaNumber: data.vaNumber, type: 'POST', gateInOutInfoId: data.gateInOutInfoId, movementTypeId: data.movementTypeId, userInfoId: UserDetails.USERID }
        apiPostMethod(apiBaseUrl + "LandingDataController/SsAndPm_DocumentVerify", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    history.push('/SAPDocumentDetails')
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }


    useEffect(() => {
        getGateInInfo();
    }, []);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const redirect = () => {
        history.push("/STO/SAPDocumentDetails");
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateVehicleStatus = (type) => {
        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: type == 'Reject' ? 2 : 4,
            rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(type == 'Reject' ? "Rejected Successfully..." : res.message);
                    redirect()
                }
                else if (res.success == false) {
                    errorToast(res.message)
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

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Unloading - SS & PM - SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>

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

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Delivery No</Label>
                                <Input type="text" placeholder="Enter Delivery No" value={data?.deliveryOrderNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant</Label>
                                <Input type="text" placeholder="Enter From Plant" value={data?.fromPlant} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant</Label>
                                <Input type="text" placeholder="Enter To Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>                       

                        {data?.weighmentInfoId > 0 ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                            </Col>

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

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                {/* {data?.weighmentInfoId > 0 && data?.moduleStatusId == 5 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                } */}

                                <div style={{ float: 'right' }}>
                                    {/* {data?.moduleStatusId == 5 ?
                                        <Button.Ripple color="primary" type="button" onClick={SsAndPm_DocumentVerify}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple> : null
                                    } */}

                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
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
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={() => updateVehicleStatus('Reject')}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Fragment >
    );
};

export default SAPDocument;
