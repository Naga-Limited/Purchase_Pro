import React, { Fragment, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { AlignLeft, AlignRight, Check, X } from "react-feather";
import { useFormik } from "formik";
import { useEffect } from "react";
import { apiBaseUrl } from "../../../../urlConstants";
import { CustomDropdownInput } from "../../../forms/custom-form";

const ReceiptSapDocument = () => {

    const [vaNo, setVaNo] = useState("")
    const [MobileNumber, setMobileNumber] = useState("")
    const [route, setRoute] = useState("")

    const [data, setData] = useState(false)

    const getData = () => {
        console.log(apiBaseUrl + `warehouse/master/getwarehousewithID_ID/30`);
        apiPostMethod(apiBaseUrl + `warehouse/master/getwarehousewithID_ID/30`)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setData(true)
                    setMobileNumber(data.results[0].label)
                    setVaNo(data.results[0].value)
                    setRoute(data.results[0].value)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                // hideLoader();
            });
    }

    const [plantValue, setPlantValue] = useState(''); const selectPlant = (e) => { setPlantValue([e]); }

    useEffect(() => {
        getData();
    }, []);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
        }),
        updateVehicleStatus(fdata) { },
    });

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>UnLoading - Receipt SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={route} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck Type</Label>
                                <Input type="text" placeholder="Enter Truck Type" value={vaNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant</Label>
                                <Input type="text" placeholder="Enter From Plant" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant</Label>
                                <Input type="text" placeholder="Enter To Plant" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>No of Wheels</Label>
                                <Input type="text" placeholder="Enter No of Wheels" value={MobileNumber} disabled />
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
                                <Label>Truck Capacity</Label>
                                <Input type="text" placeholder="Enter Truck Capacity" value={MobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>STO PO No</Label>
                                <Input type="text" placeholder="Enter STO PO No" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Delivery Order No</Label>
                                <Input type="text" placeholder="Enter Delivery Order No" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col sm="8" md="8">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Shipment Copy"
                                        id={"shipmentCopy"}
                                        selectedFileName={attachedFiles.shipmentCopy.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Empty Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Empty Weight" value={route} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Load Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Load Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Net Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Net Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant Empty Weight</Label>
                                <Input type="text" placeholder="Enter To Plant Empty Weight" value={route} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant Load Weight</Label>
                                <Input type="text" placeholder="Enter To Plant Load Weight" value={route} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant Net Weight</Label>
                                <Input type="text" placeholder="Enter To Plant Net Weight" value={route} disabled />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getPlants`} label={"MIGO No"} form={form} id="plant" onChange={selectPlant} value={plantValue} />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4"></Col>

                        <Col md="12" sm="12">

                            <FormGroup>

                                <Button.Ripple outline color="primary" type="button" >
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
                </CardBody>
            </Card>
        </Fragment >
    );
};

export default ReceiptSapDocument;