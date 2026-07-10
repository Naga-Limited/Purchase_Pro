import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label,  Row } from 'reactstrap'
import { CustomDropdownInput, Yup } from '../../../forms/custom-form'
import { apiBaseUrl } from '../../../../urlConstants'
import { useFormik } from 'formik'
import { apiPostMethod } from '../../../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../../../helper/appHelper'
import { ArrowLeft, Check, X } from 'react-feather'
import { useLoader } from '../../../../utility/hooks/useLoader'
import { useSelector } from 'react-redux'
import { Modal } from 'react-bootstrap'

const RmReturnSapDocument = () => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    let { showLoader, hideLoader } = useLoader();

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rejectReason: ""
        }),
        reject() { },
    });

    const [data, setData] = useState(false)

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/1}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
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
            <Fragment>
                <Card>
                    <CardHeader><h5>Rm Return SapDocument</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>VA No</Label>
                                    <Input type="text" placeholder="Enter VaNo" value={data?.vaNumber} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Return Ref No</Label>
                                    <Input type="text" placeholder="Enter Return Ref No" value={data?.returnRefNo} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="12">
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}marketdata/master/getPlants`}
                                    isMulti
                                    label={"Sale Invoice No"}
                                    form={form}
                                    id="Plant"
                                />
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck No </Label>
                                    <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Customer Name</Label>
                                    <Input type="text" placeholder="Enter Customer Name" value={data?.customerName} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Driver Phone  No</Label>
                                    <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="12">
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}marketdata/master/getPlants`}
                                    isMulti
                                    label={"Sales Return Order No"}
                                    form={form}
                                    id="Plant"
                                />
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data?.firstWeight} />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data?.secondWeight} />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} />
                                </FormGroup>
                            </Col>

                            <Col sm="12" md="12"></Col>

                            <Col sm="2" md="2">
                                <label>&nbsp;</label>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>

                            <Col sm="10" md="10">
                                <label>&nbsp;</label>
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <div className="mr-1">
                                        <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple>
                                    </div>
                                    <Button.Ripple outline color="primary" type="button">
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
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
                                    <Button.Ripple color="danger" type="button" onClick={updateVehicleStatus}>
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

export default RmReturnSapDocument