import React, { Fragment } from 'react'
import { Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import { CardComponent } from '../../../common/CardComponent'
import { CustomDropdownInput, Yup } from '../../../forms/custom-form'
import { apiBaseUrl } from '../../../../urlConstants'
import { useFormik } from 'formik'

const ReturnInfo = () => {

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rejectReason: ""
        }),
        reject() { },
    });


    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>ReturnInfo</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>VA No</Label>
                                    <Input type="text" placeholder="Enter VaNo" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Return Ref No</Label>
                                    <Input type="text" placeholder="Enter Return Ref No" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="12">
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}marketdata/master/getPlants`}
                                    isMulti
                                    label={"Plant"}
                                    form={form}
                                    id="Plant"
                                />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck No</Label>
                                    <Input type="text" placeholder="Enter Truck No" />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Invoice No</Label>
                                    <Input type="text" placeholder="Enter Invoice No" />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Customer Name</Label>
                                    <Input type="text" placeholder="Enter Customer Name" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Material Description </Label>
                                    <Input type="text" placeholder="Enter Material Description" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Quantity </Label>
                                    <Input type="text" placeholder="Enter Quantity" disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Return Quantity</Label>
                                    <Input type="text" placeholder="Enter Return Quantity" />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Total Return Quantity </Label>
                                    <Input type="text" placeholder="Enter Total Return Quantity" disabled />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/master/getMasterRejectReason`}
                                    label={"Return Reason"}
                                    form={form}
                                    id="rejectReason"
                                />
                            </FormGroup>
                        </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" />
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        </div>
    )
}

export default ReturnInfo