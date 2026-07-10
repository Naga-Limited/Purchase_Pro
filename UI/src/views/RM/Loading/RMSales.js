import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, Yup } from '../../forms/custom-form'
import { apiBaseUrl } from '../../../urlConstants'
import { useFormik } from 'formik'
import { Check, X } from 'react-feather'
import { useState } from 'react'
import { RefreshBlock1 } from '../../common/RefreshBlock1';

const RMSales = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    return (
        <>
            <Card>
                <CardHeader><h5>RM Sales - Vehicle Inspection</h5><RefreshBlock1/></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                                label={"Truck No"}
                                form={form}
                                id="rejectReason"
                            />
                        </Col>
                        <Col md="4" sm="4" >
                            <FormGroup>
                                <Label for="cityMulti">VA No</Label>
                                <Input placeholder="Va No" disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Clean"}
                                form={form}
                                id="Clean"
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Order"}
                                form={form}
                                id="Order"
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Tarapaulin"}
                                form={form}
                                id="Tarapaulin"
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"No Of Tarapaulin"}
                                form={form}
                                id="No Of Tarapaulin"
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Platform Condition"}
                                form={form}
                                id="Platform Condition"
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Vehicle Fit For Loading"}
                                form={form}
                                id="Vehicle Fit For Loading"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label for="cityMulti">Previous Load Details</Label>
                                <Input placeholder="Previous Load Details" />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="10" sm="10">
                            <br />
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}><X size={16}/> Reject</Button.Ripple>
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <br />
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button"><Check size={16} /> Accpect</Button.Ripple>
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
                                <Button.Ripple color="danger" type="button">
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <div style={{ marginBottom: "180px" }}></div>
        </>
    )
}

export default RMSales