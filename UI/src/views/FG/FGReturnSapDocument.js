import React from 'react'
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import NumberOnlyInput from '../../../@core/components/number-input/number-input'
import { CardComponent } from '../../common/CardComponent'
import { CustomDropdownInput, CustomTextInput, Yup } from '../../forms/custom-form'
import { apiBaseUrl } from '../../../urlConstants'
import { ShowToast, errorToast } from '../../../helper/appHelper'
import { apiPostMethod } from '../../../helper/axiosHelper'
import { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from "react-router";
import { useFormik } from 'formik'
import { ArrowLeft, Check, X } from 'react-feather'
import { useHistory } from "react-router-dom";
import { useLoader } from '../../../utility/hooks/useLoader'
import { useSelector } from 'react-redux'

const FGReturnSapDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const openRemarksModal = () => setShow(true);
    const history = useHistory();

    let { gateInOutInfoId } = useParams();
    const [data, setData] = useState([])
    const [response, setResponse] = useState(false)

    const [sapLine, setSapLine] = useState([])

    const pgiStatus1 = sapLine.map((invoiceData) => invoiceData.PGI_COMPLETION);
    const pgiStatus2 = sapLine.map((invoiceData) => 'C');

    const invoiceNo = sapLine.filter((invoiceData) => invoiceData.INVOICE_NO == '');

    console.log(invoiceNo.length);

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
                                setResponse(data)
                                setSapLine(data.data[0].SAP_LINE);
                            } else if (data.success == false) {
                                setResponse(data)
                                // errorToast(data.message);
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
            rejectReason: ""
        }),
        reject() { },
    });

    const redirect = () => {
        history.push("/STO/SAPDocumentDetails");
    }

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateVehicleStatus = () => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 4,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    redirect();
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

    return (
        <>
            <Card>
                <CardHeader><h5>SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>


                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data?.vehicleNo} disabled />
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
                                <Label>Return Reference No</Label>
                                <Input type="text" placeholder="Enter Reference No" value={data?.returnRefNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Sales Invoice No</Label>
                                <Input type="text" placeholder="Enter Sales Invoice No" value={data?.salesInvoiceNo} disabled />
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
                                <Label>Driver Mobile Number</Label>
                                <Input type="text" placeholder="Enter Driver Mobile Number" value={data?.driverMobileNumber} disabled />
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
                                <b className="text-gray" key={sapLine.LINE_ITEM}><u>DELIVERY NO : {sapLine?.DELIVERY_NO}</u> : ( Invoice No: {sapLine?.INVOICE_NO} ) ( PGI Status : {sapLine?.PGI_COMPLETION == 'C' ? 'Completed' : sapLine?.PGI_COMPLETION == 'A' ? "Waiting at PGI" : sapLine?.PGI_COMPLETION} )</b>
                            </Col>

                            {sapLine?.ITEM.map((lineItem, i) => {
                                return (
                                    <Col md="12" sm="12">
                                        <Row key={lineItem.ITEM}>
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

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Load Weight</Label>
                                <Input type="text" placeholder="Enter Load Weight" value={data?.firstWeight} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Empty Weight</Label>
                                <Input type="text" placeholder="Enter Empty Weight" value={data?.secondWeight} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Net Weight</Label>
                                <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                <div style={{ float: 'right' }}>
                                    {invoiceNo.length == 0 ? <>
                                        {data?.moduleStatusId == 3 && sapLine != '' && JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2) ?
                                            <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
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
        </>
    )
}

export default FGReturnSapDocument