import React, { Fragment } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../../helper/appHelper'
import { apiPostMethod } from '../../../helper/axiosHelper'
import { apiBaseUrl } from '../../../urlConstants'
import { useLoader } from '../../../utility/hooks/useLoader'
import { ArrowLeft, Check, Search } from 'react-feather'
import { useFormik } from 'formik'
import { Yup } from '../../forms/custom-form'
import { useSelector } from 'react-redux'

const RMWeightApproval = () => {

    let { showLoader, hideLoader } = useLoader();

    const [data, setData] = useState([])
    const [truckValue, setTruckValue] = useState("")
    const [isDisabled, setIsDisabled] = useState(false)

    const getGateInInfo = () => {
        showLoader()
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/${truckValue}/4/0/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/${truckValue}/4/0/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    setIsDisabled(true)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const reset = () => {
        setData([])
        setTruckValue("")
        setIsDisabled(false)
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        updateVehicleStatus() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateVehicleStatus = () => {
        console.log("submitted");
        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 3,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    reset()
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
        <Fragment>
            <Card>
                <CardHeader><h5>Weight Approval</h5></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <InputGroup>
                                    <Input type="text" id="Vehicle_Number" placeholder="Truck No" onChange={(e) => setTruckValue(e.target.value)} value={truckValue} disabled={isDisabled} maxLength={10} />
                                    <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                                        <Search size={20} />
                                    </Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        {data != "" ? <>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>First Weight</Label>
                                    <Input type="number" placeholder="First Weight" value={data.firstWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label >Second Weight</Label>
                                    <Input placeholder="Second Weight" value={data.secondWeight} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label >Net Weight</Label>
                                    <Input value={data.netWeight} placeholder="Net Weight" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label >Delivery Weight</Label>
                                    <Input value={data.netWeight} placeholder="Delivery Weight" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label >Diff Weight</Label>
                                    <Input value={data.secondWeight} placeholder="Diff Weight" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="10" sm="10">
                                <br />
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button.Ripple outline color="primary" type="button" onClick={reset}><ArrowLeft size={16} /> Back</Button.Ripple>
                                </FormGroup>
                            </Col>

                            <Col md="2" sm="2">
                                <br />
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}><Check size={16}/> Approve</Button.Ripple>
                                </FormGroup>
                            </Col> </> : null
                        }
                    </Row>
                </CardBody>
            </Card>
        </Fragment>


    )
}

export default RMWeightApproval