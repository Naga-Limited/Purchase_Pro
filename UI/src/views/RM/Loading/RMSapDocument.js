import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, Badge } from "reactstrap";
import { useEffect } from "react";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../../helper/appHelper";
import { useHistory } from "react-router-dom";
import { CustomDropdownInput, Yup } from "../../forms/custom-form";
import { useFormik } from "formik";

const RMSapDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    let { gateInOutInfoId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const [invoiceData, setInvoiceData] = useState([])
    const [data, setData] = useState([])
    const [response, setResponse] = useState([])

    const checkInvoiceNo = invoiceData.filter((invoiceData) => invoiceData.INVOICE_NO == '');

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const pgiStatus1 = invoiceData.map((invoiceData) => invoiceData.PGI_FLAG);
    const pgiStatus2 = invoiceData.map((invoiceData) => 'C');
    const deliveryWeight = invoiceData.reduce((total, delivery) => total = total + Number(delivery.DELIVERY_WT), 0);


    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);

                    const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type ,userInfoId:UserDetails.USERID}

                    apiPostMethod(apiBaseUrl + "LandingDataController/RmSales_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (type == 'GET') {
                                    setResponse(data)
                                    setInvoiceData(data.results[0].LINE_ITEM);
                                    console.log(data.results[0].LINE_ITEM);
                                } else if (type == 'POST') {
                                    ShowToast(data.message)
                                    redirect()
                                }
                            } else if (data.success == false) {
                                if (type == 'GET') {
                                    setResponse(data)
                                } else if (type == 'POST') {
                                    errorToast(data.message)
                                }
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo('GET')
    }, [])

    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateVehicleStatus = () => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 2,
            rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast("Rejected Successfully...");
                    closeRemarksModal()
                    redirect()
                }
                else if (res.success == false) {
                    errorToast(res.message)
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
                                <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
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
                        {data.remarks ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>

                        {invoiceData.map(invoiceData => (
                            <Col md="12" sm="12" key={invoiceData.LINE}>
                                <Row>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery No</Label>
                                            <Input type="text" placeholder="Enter Delivery No" value={invoiceData?.DELIVERY_NO} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery Qty In Bag</Label>
                                            <Input type="text" placeholder="Enter Delivery Qty" value={Number(invoiceData?.DELIVERY_WT).toFixed(2)} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Invoice No</Label>
                                            <Input type="text" placeholder="Enter Invoice No" value={invoiceData?.INVOICE_NO} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PGI Status</Label>
                                            <Input type="text" placeholder="Enter Status" value={invoiceData?.PGI_FLAG == 'C' ? 'Completed' : invoiceData?.PGI_FLAG == 'A' ? "Waiting at PGI" : invoiceData?.PGI_FLAG} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        ))}

                        {data.weighmentInfoId > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>First Weight</Label>
                                        <Input type="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                {data.secondWeightCheck ?
                                    <>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Second Weight Check</Label>
                                                <Input type="text" placeholder="Enter Second Weight Check" value={data?.secondWeightCheck} disabled />
                                            </FormGroup>
                                        </Col>
                                    </> : null
                                }
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Second Weight</Label>
                                        <Input type="text" placeholder="Enter Second Weight" value={data?.secondWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Net Weight</Label>
                                        <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Delivery Weight</Label>
                                        <Input type="text" placeholder="Enter Delivery Weight" value={deliveryWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Diff(Delivery Weight & Net weight)</Label>
                                        <Input type="text" placeholder="Enter Total Weight" value={Number(deliveryWeight - data?.netWeight).toFixed(2)} disabled />
                                    </FormGroup>
                                </Col> </> : null
                        }

                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>

                                {data?.weighmentInfoId > 0 && data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                }

                                <div style={{ float: 'right' }}>
                                    {checkInvoiceNo == '' ? <>
                                        {(data?.moduleStatusId == 3 || data?.moduleStatusId == 4) && (JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2)) ?
                                            <Button.Ripple color="primary" type="button" onClick={() => getGateInInfo('POST')}>
                                                <Check size={16} /> Submit
                                            </Button.Ripple> : null
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
                                <Button.Ripple color="danger" type="button" onClick={updateVehicleStatus}>
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

export default RMSapDocument;
