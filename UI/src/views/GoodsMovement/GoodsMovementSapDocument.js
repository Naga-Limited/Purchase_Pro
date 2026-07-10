import React, { useEffect, useState } from 'react'
import { Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Check, X } from 'react-feather';
import { useFormik } from 'formik';
import { Yup } from '../forms/custom-form';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { ShowToast, errorToast } from '../../helper/appHelper';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';

const GoodsMovementSapDocument = () => {

    let { gateInOutInfoId } = useParams();
    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    useEffect(() => {
        getGateInInfo('GET')
    }, [])

    const [data, setData] = useState([])
    const [response, setResponse] = useState([])
    const [show, setShow] = useState(false);

    const [sapDeliveryData, setSapDeliveryData] = useState([])

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
                    GoodsMovement_DocumentVerify(data.results[0], type)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const GoodsMovement_DocumentVerify = (gateInOutData, type) => {
        const postData = { gateInOutInfoId: gateInOutData.gateInOutInfoId, vaNumber: gateInOutData.vaNumber, type: type ,userInfoId: UserDetails.USERID}
        console.log(apiBaseUrl + "LandingDataController/GoodsMovement_DocumentVerify", postData);
        apiPostMethod(apiBaseUrl + "LandingDataController/GoodsMovement_DocumentVerify", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'GET') {
                        setSapDeliveryData(data.results[0].LINE_ITEM)
                        setResponse(data)
                    } else if ('POST') {
                        ShowToast(data.message)
                        redirect()
                    }
                } else {
                    setResponse(data)
                }
            })
            .catch((error) => {
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

    const fromPlant = [sapDeliveryData[0]?.FROM_PLANT];
    const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

    const [toPlant, setToPlant] = useState('')

    const checkPlant = () => {
        getGateInInfo('POST')
    }

    const updateVehicleStatus = () => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 4,
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

    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }

    return (
        <>
            <Card>
                <CardHeader><h5>GoodsMovement SapDocument</h5></CardHeader>
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
                        {data?.remarks != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        <Col md="12" sm="12"><hr /></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>

                        {sapDeliveryData?.map((sapLine) => (<>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Migo Number</Label>
                                    <Input type="text" placeholder="Migo No" value={sapLine?.MIGO_NO} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Material</Label>
                                    <Input type="text" placeholder="Plant" value={sapLine?.MATERIAL} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="2" sm="2">
                                <FormGroup>
                                    <Label>Quantity</Label>
                                    <Input type="text" placeholder="Vendor No" value={sapLine?.QUANTITY} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="2" sm="2">
                                <FormGroup>
                                    <Label>Uom</Label>
                                    <Input type="text" placeholder="Vendor No" value={sapLine?.UOM} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="2" sm="2">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Vendor Name" value={sapLine?.PLANT} disabled />
                                </FormGroup>
                            </Col>
                        </>
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
                                        <Input type="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Second Weight</Label>
                                        <Input type="text" placeholder="Second Weight" value={data?.secondWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Net Weight</Label>
                                        <Input type="text" placeholder="Net Weight" value={data?.netWeight} disabled />
                                    </FormGroup>
                                </Col>
                            </> : null
                        }

                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                {/* {data.weighmentInfoId > 0 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                } */}

                                <div style={{ float: 'right' }}>
                                    {sapDeliveryData != '' && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                                        <Button color="primary" type="button" onClick={checkPlant}>
                                            <Check size={16} /> Submit
                                        </Button> : null
                                    }

                                    <Button className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody >
            </Card >
        </>
    )
}

export default GoodsMovementSapDocument