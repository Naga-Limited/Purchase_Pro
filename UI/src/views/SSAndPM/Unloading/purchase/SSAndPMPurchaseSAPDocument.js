import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useParams } from "react-router";
import { ArrowLeft, Check, X } from 'react-feather';
import { CustomDropdownInput, Yup } from '../../../forms/custom-form';
import { useSelector } from 'react-redux';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { useHistory } from "react-router-dom";
import { Modal } from 'react-bootstrap';

const SSAndPMPurchaseSAPDocument = () => {

    const [show, setShow] = useState(false)
    const closeRemarksModal = () => setShow(false);

    const [data, setData] = useState([])
    const [purchaseData, setPurchaseData] = useState([])
    const [poData, setPoData] = useState([])
    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
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

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])

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
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const Purchase_DocumentVerify = () => {
        console.log(apiBaseUrl + `LandingDataController/Purchase_DocumentVerify`);
        apiPostMethod(apiBaseUrl + `LandingDataController/Purchase_DocumentVerify`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPurchaseData(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo()
        Purchase_DocumentVerify()
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
        }),
        updateVehicleStatus(fdata) { },
    });

    const updateVehicleStatus = (type) => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: type == 'reject' ? 2 : 10,
            rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
            userInfoId: UserDetails.USERID
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    redirect()
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

    const redirect = () => {
        history.push(`/STO/SAPDocumentDetails`);
    }

    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>Purchase - SAPDocument</h5></CardHeader>
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
                            {data.invoiceCopy ?
                                <Col sm="4" md="4">
                                    <FormGroup className="d-flex justify-content-start mb-0 mt-2">
                                        <div className="mr-1">
                                            <div style={{ marginBottom: "7px" }}></div>
                                            <Label><b> Delivery Document :</b></Label>
                                        </div>
                                        <div className="mr-1">
                                            <a target="_blank" href={data.invoiceCopy}>
                                                <Button outline color="success" type="button">
                                                    View
                                                </Button>
                                            </a>
                                        </div>
                                    </FormGroup>
                                </Col> : null
                            }

                            {poData != '' ? <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                                </Col>

                                {poData.map((poDetails) => (<>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PO Number</Label>
                                            <Input type="text" placeholder="PO Number" value={poDetails?.poNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PO Type</Label>
                                            <Input type="text" placeholder="Invoice No" value={poDetails?.name} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Invoice No</Label>
                                            <Input type="text" placeholder="Invoice No" value={poDetails?.invoiceNo} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Vendor Name</Label>
                                            <Input type="text" placeholder="Vendor Name" value={poDetails?.vendorName} disabled />
                                        </FormGroup>
                                    </Col>
                                </>))} </> : null
                            }

                            {data.weighmentInfoId > 0 ? <>

                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="3" sm="3"><Label>Document Number</Label></Col>
                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>

                                {weighmentData.map((weighmentData) => (
                                    <>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Document No" value={weighmentData?.documentNumber} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="First Weight" value={weighmentData?.firstWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Second Weight" value={weighmentData?.secondWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Net Weight" value={weighmentData?.netWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                    </>
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
                                        <Input typr="text" placeholder="Second Weight" value={overAllWeight.secondWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Net Weight</Label>
                                        <Input typr="text" placeholder="Net Weight" value={Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                                    </FormGroup>
                                </Col>

                            </> : null
                            }

                            <Col md="12" sm="12">
                                <br></br>
                                <FormGroup>
                                    {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 4) && (data?.moduleTypeId == 14) ?
                                        <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                            <X size={16} /> Reject
                                        </Button.Ripple> : null
                                    }

                                    <div style={{ float: 'right' }}>
                                        {/* {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                            <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
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
                                    <Button.Ripple color="danger" type="button" onClick={() => updateVehicleStatus('reject')}>
                                        <X size={16} /> Reject
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            </Fragment>
        </div>
    )
}

export default SSAndPMPurchaseSAPDocument