import React, { Fragment, useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useParams } from "react-router";
import { ArrowLeft, Check } from 'react-feather';
import { useHistory } from "react-router-dom";
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { apiPostMethod } from '../../../helper/axiosHelper';
import { apiBaseUrl } from '../../../urlConstants';
import { useLoader } from '../../../utility/hooks/useLoader';
import { Yup } from '../../forms/custom-form';

const CivilTruckGateOut = () => {

    const [data, setData] = useState([])
    const [sapDeliveryData, setSapDeliveryData] = useState([])

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    let { gateInOutInfoId } = useParams();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
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

    useEffect(() => {
        getGateInInfo()
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });


    const redirect = () => {
        history.push(`/VA`);
    }

    const updateVehicleStatus = () => {

        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            gatePassNo: sapDeliveryData[0]?.gatePassNo,
        }
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
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>Civil Truck GateOut</h5></CardHeader>
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
                                    <Label>Truck Number</Label>
                                    <Input type="text" placeholder="Enter Truck Number" value={data.vehicleNo} disabled />
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
                                    <Input type="text" placeholder="Enter Driver Phone No" value={data.plantName} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Movement Type</Label>
                                    <Input type="text" placeholder="Enter Movement Type" value={data.movementType} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Module Type</Label>
                                    <Input type="text" placeholder="Enter Module Type" value={data.moduleType} disabled />
                                </FormGroup>
                            </Col>
                            {data.weighmentInfoId > 0 ? <>

                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Remarks</Label></Col>

                                {weighmentData.map((weighmentData) => (<>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
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

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All First Weight</Label>
                                        <Input typr="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Second Weight</Label>
                                        <Input typr="text" placeholder="Enter Second Weight" value={overAllWeight.secondWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Net Weight</Label>
                                        <Input typr="text" placeholder="Enter Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                                    </FormGroup>
                                </Col>

                            </> : null
                            }
                            <Col sm="10" md="10">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button>
                                </FormGroup>
                            </Col>
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <Button color="primary" type="button" onClick={updateVehicleStatus}>
                                        <Check size={16} /> Gate Out
                                    </Button>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        </div>
    )
}

export default CivilTruckGateOut