import React, { Fragment, useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useSelector } from 'react-redux';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { CustomDropdownInput, Yup } from '../../../forms/custom-form';
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { ArrowLeft, Check, X } from 'react-feather';
import { Modal } from "react-bootstrap";

const SDGSSapDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const [data, setData] = useState([])
    const [sapDeliveryData, setSapDeliveryData] = useState([])
    const [response, setResponse] = useState([])
    const [weighmentData, setWeighmentData] = useState([])
    const [overAllSecountWeight, setOverAllSecountWeight] = useState('')

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const pgiStatus1 = sapDeliveryData[0]?.LINE_ITEM.map((invoiceData) => invoiceData.PGI_FLAG);
    const pgiStatus2 = sapDeliveryData[0]?.LINE_ITEM.map((invoiceData) => 'C');
    const invoiceNo = sapDeliveryData[0]?.LINE_ITEM.filter((invoiceData) => invoiceData.INVOICE_NO == '');

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    getWeighmentInfo(data.results[0].gateInOutInfoId)

                    const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type ,userInfoId:UserDetails.USERID}

                    console.log(apiBaseUrl + "LandingDataController/ScrapSales_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/ScrapSales_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (type == 'GET') {
                                    setSapDeliveryData(data.results)
                                    setResponse(data)
                                } else if (type == 'POST') {
                                    ShowToast(data.message)
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

    const fromPlant = [sapDeliveryData[0]?.PLANT]
    const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant)

    const checkPlant = () => {
        if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {
            getGateInInfo('POST')
        } else {
            errorToast("Plant not assigned for user, Please assign plant")
        }
    }

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
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    useEffect(() => {
        getGateInInfo('GET')
    }, [])

    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }

    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5> SDGS- SAP Document</h5></CardHeader>
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
                                    <Input type="text" placeholder=" Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input typr="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                            </Col>

                            {sapDeliveryData[0]?.LINE_ITEM.map((sapLine) => (<>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Delivery No</Label>
                                        <Input typr="text" placeholder="Enter Delivery No" value={sapLine?.DELIVERY_NO} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Invoice No</Label>
                                        <Input typr="text" placeholder="Enter Delivery No" value={sapLine?.INVOICE_NO} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Delivery Weight</Label>
                                        <Input typr="text" placeholder="Enter Delivery No" value={sapLine?.DELIVERY_WT} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PGI Status</Label>
                                        <Input typr="text" placeholder="Enter Delivery No" value={sapLine?.PGI_FLAG == 'C' ? 'Completed' : sapLine?.PGI_FLAG == 'A' ? "Waiting at PGI" : sapLine?.PGI_FLAG} disabled />
                                    </FormGroup>
                                </Col>  </>
                            ))}

                            {data.weighmentInfoId > 0 ? <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="3" sm="3"><Label>Empty Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Load Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Remarks</Label></Col>

                                {weighmentData.map((weighmentData) => (<>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Empty Weight" value={weighmentData?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Remarks" value={weighmentData?.remarks} disabled />
                                        </FormGroup>
                                    </Col>
                                </>))}
                            </> : null
                            }

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Over All Empty Weight</Label>
                                    <Input typr="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Over All Load Weight</Label>
                                    <Input typr="text" placeholder="Enter Load Weight" value={overAllSecountWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Over All Net Weight</Label>
                                    <Input typr="text" placeholder="Enter Net Weight" value={Number(overAllSecountWeight - data?.firstWeight)} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                            <Col md="12" sm="12">
                                <br></br>
                                <FormGroup>

                                    {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                                        <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                            <X size={16} /> Reject
                                        </Button.Ripple> : null
                                    }

                                    <div style={{ float: 'right' }}>
                                        {invoiceNo == '' ? <>
                                            {(data?.moduleStatusId == 3 || data?.moduleStatusId == 4) && (JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2)) ?
                                                <Button.Ripple color="primary" type="button" onClick={checkPlant}>
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
            </Fragment>
        </div>
    )
}

export default SDGSSapDocument