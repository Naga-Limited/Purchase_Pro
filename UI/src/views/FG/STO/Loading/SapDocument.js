import React, { Fragment, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { useEffect } from "react";
import { apiBaseUrl } from "../../../../urlConstants";

const SapDocument = () => {

    const [vaNo, setVaNo] = useState("")
    const [MobileNumber, setMobileNumber] = useState("")
    const [route, setRoute] = useState("")

    const [invoiceData, setInvoiceData] = useState([])

    const getData = () => {
        console.log(apiBaseUrl + `Master/GetTruckInfo/TN57AS1234`);
        apiPostMethod(apiBaseUrl + `Master/GetTruckInfo/TN57AS1234`)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setMobileNumber(data.results[0].route)
                    setVaNo(data.results[0].tripSheetNo)
                    setRoute(data.results[0].truckType)
                    setInvoiceData(data.invoice)
                    console.log(data.invoice);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                // hideLoader();
            });
    }

    useEffect(() => {
        getData();
    }, []);

    const addInvoice = () => {
        setInvoiceData([...invoiceData, { SUP_VE_REFID: invoiceData.length + 1 }])
    }

    const removeInvoice = (id) => {
        const invoice = invoiceData.filter((invoice) => invoice.SUP_VE_REFID != id)
        setInvoiceData(invoice)
    }

    return (
        <Fragment>
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
                                <Input type="text" placeholder="Enter Truck No" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={vaNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Route</Label>
                                <Input type="text" placeholder="Enter Route" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Color / Token</Label>
                                <Input type="text" placeholder="Enter Color / Token" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Reason</Label>
                                <Input type="text" placeholder="Enter Reason" value={vaNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Remarks</Label>
                                <Input type="text" placeholder="Enter Remarks" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>TRIP Sheet No</Label>
                                <Input type="text" placeholder="Enter TRIP Sheet No" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck Type</Label>
                                <Input type="text" placeholder="Enter Truck Type" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Shipment Order No</Label>
                                <Input type="text" placeholder="Enter Shipment Order No" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Invoice Info</u>
                                {/* <div style={{ float: "right" }}>
                                    <Button.Ripple color="primary" type="button" onClick={addInvoice}>
                                        <Plus size={16} /> Add
                                    </Button.Ripple>
                                </div> */}
                            </h4><br />
                        </Col>

                        {invoiceData.map(invoiceData => (
                            <Col md="12" sm="12" key={invoiceData.SUP_VE_REFID}>
                                <Row>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Delivery No</Label>
                                            <Input type="text" placeholder="Enter Delivery No" defaultValue={invoiceData.SEAL_NO} disabled={invoiceData.SEAL_NO} />
                                        </FormGroup>
                                    </Col>

                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Delivery Qty</Label>
                                            <Input type="text" placeholder="Enter Delivery Qty" defaultValue={invoiceData.ZSUPPLIER_INV_QTY} disabled={invoiceData.ZSUPPLIER_INV_QTY} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Invoice No</Label>
                                            <Input type="text" placeholder="Enter Invoice No" defaultValue={invoiceData.ZSUPPLIER_INV_NO} disabled={invoiceData.ZSUPPLIER_INV_NO} />
                                        </FormGroup>
                                    </Col>
                                    {/* <Col md="1" sm="1">
                                        <label>&nbsp;</label>
                                        <FormGroup>
                                            <Button.Ripple color="danger" type="button" size="sm" onClick={() => removeInvoice(invoiceData.SUP_VE_REFID)}>
                                                <Trash2 size={16} />
                                            </Button.Ripple>
                                        </FormGroup>
                                    </Col> */}
                                </Row>
                            </Col>
                        ))}

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Weightments</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Delivery Weight</Label>
                                <Input type="text" placeholder="Enter Delivery Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>First Weight</Label>
                                <Input type="text" placeholder="Enter First Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Second Weight</Label>
                                <Input type="text" placeholder="Enter Second Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Net Weight</Label>
                                <Input type="text" placeholder="Enter Net Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Diff(Delivery & Net weight)</Label>
                                <Input type="text" placeholder="Enter Total Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12">

                            <FormGroup>

                                <Button.Ripple outline color="primary" type="button">
                                    Cancel
                                </Button.Ripple>

                                <div style={{ float: 'right' }}>
                                    <Button.Ripple color="danger" type="button">
                                        Reject
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody >
            </Card >
        </Fragment >
    );
};

export default SapDocument;
