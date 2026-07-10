import React, { useState } from "react";
import { Row, Col, Button, Label, FormGroup, Card, CardHeader, CardBody, Input } from "reactstrap";
import { ArrowLeft, Check } from "react-feather";
import { apiBaseUrl, uploadUrl } from "../../../urlConstants";
import { ShowToast, errorToast } from "../../../helper/appHelper";
import { apiPostMethod } from "../../../helper/axiosHelper";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../../forms/custom-form";
import { useHistory } from "react-router-dom";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";

const FGReturnGateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState("")

    let { gateInOutInfoId } = useParams();

    const [sapLine, setSapLine] = useState([])

    const pgiStatus1 = sapLine.map((invoiceData) => invoiceData.PGI_COMPLETION);
    const pgiStatus2 = sapLine.map((invoiceData) => 'C');

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    const postData = { tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber }

                    console.log(apiBaseUrl + "LandingDataController/FGReturn_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/FGReturn_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                setSapLine(data.data[0].SAP_LINE);
                            } else if (data.success == false) {
                                errorToast(data.message);
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
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
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            remarks: ""
        }),
        updateVehicleStatus() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [unloadingData, setUnloadingData] = useState([]);

    const updateVehicleStatus = () => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    reload();
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
                console.log(res);
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const reload = () => {
        if (data.movementType == 'LOADING') {
            history.push(`/Loading/GateIn`);
        } else {
            history.push(`/VA`);
        }
    }

    return (
        <Card>
            <CardHeader>FG Return - Gate Out</CardHeader>
            <hr></hr>
            <CardBody>
                <Row>
                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>General Info</u></h4><br />
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Truck No</Label>
                            <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>VA No</Label>
                            <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Return Referance No</Label>
                            <Input type="text" placeholder="Enter Return Referance No" value={data.returnRefNo} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Sale Invoice No</Label>
                            <Input type="text" placeholder="Enter Sale Invoice No" value={data.salesInvoiceNo} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Customer Name</Label>
                            <Input type="text" placeholder="Enter Customer Name" value={data.customerName} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Plant</Label>
                            <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
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
                            <Label>Sales Return Order No</Label>
                            <Input type="text" placeholder="Enter Sales Return Order No" value={data.driverMobileNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Load Weight</Label>
                            <Input type="text" placeholder="Enter Load Weight" value={data.secondWeight} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Empty Weight</Label>
                            <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Net Weight</Label>
                            <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                        </FormGroup>
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                        </FormGroup>
                    </Col>

                    <Col md="12" sm="12"><hr></hr></Col>
                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>Invoice Info</u></h4><br />
                    </Col>

                    {sapLine?.map(sapLine => (<>

                        <Col md="12" sm="12">
                            <b className="text-gray"><u>DELIVERY NO : {sapLine?.DELIVERY_NO}</u> : ( Invoice No: {sapLine?.INVOICE_NO} ) ( PGI Status : {sapLine?.PGI_COMPLETION == 'C' ? 'Completed' : sapLine?.PGI_COMPLETION == 'A' ? "Waiting at PGI" : sapLine?.PGI_COMPLETION} )</b>
                        </Col>

                        {sapLine?.ITEM.map((lineItem, i) => {
                            return (
                                <Col md="12" sm="12" key={lineItem.ITEM}>
                                    <Row>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Line</Label>
                                                <Input type="text" placeholder="Enter Line" value={lineItem?.ITEM} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Material</Label>
                                                <Input type="text" placeholder="Enter Material" value={lineItem?.MATERIAL} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Quantity</Label>
                                                <Input type="text" placeholder="Enter Quantity" value={lineItem?.QUANTITY} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Uom</Label>
                                                <Input type="text" placeholder="Enter Uom" value={lineItem?.UOM} disabled />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                            )
                        })}
                    </>))}
                </Row>
                <Row>
                    <Col sm="10" md="10">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-start mb-0">
                            <Button.Ripple outline color="primary" type="button" onClick={reload}>
                                <ArrowLeft size={16} /> Back
                            </Button.Ripple>
                        </FormGroup>
                    </Col>

                    {JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2) ?
                        <Col sm="2" md="2">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                                    <Check size={16} /> Gate Out
                                </Button.Ripple>
                            </FormGroup>
                        </Col> : null
                    }
                </Row>
            </CardBody>
        </Card>

    )
}

export default FGReturnGateOut