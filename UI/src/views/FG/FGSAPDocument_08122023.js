import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, Badge } from "reactstrap";
import { useEffect } from "react";
import { useLoader } from "../../utility/hooks/useLoader";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../helper/appHelper";
import { useHistory } from "react-router-dom";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import confirmDialog from '../../@core/components/confirm/confirmDialog'
import { apiGetMethod } from "../../helper/axiosHelper";

const FGSAPDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    let { gateInOutInfoId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const [message, setMessage] = useState();

    const [invoiceData, setInvoiceData] = useState([])
    const [fgDetailsData, setfgDetailsData] = useState([])

    const [data, setData] = useState([])
    const [response, setResponse] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const pgiStatus1 = invoiceData.map((invoiceData) => invoiceData.PGI_COMPLETION);
    const pgiStatus2 = invoiceData.map((invoiceData) => 'C');
    const invoiceNo2 = invoiceData.filter((invoiceData) => invoiceData.INVOICE_NO != '');

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    const postData = { gateInInfoId: data.results[0].gateInOutInfoId, shipmentOrderNo: data.results[0].shipmentOrderNo, tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber, Type: type }

                    console.log(apiBaseUrl + "/LandingDataController/FGSales_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "/LandingDataController/FGSales_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                setResponse(data)
                                if (type == 'POST') {
                                    ShowToast(data.message);
                                    history.push('/SAPDocumentDetails')
                                } else if (type == 'Get') {
                                    setfgDetailsData(data.fg_details_data[0]);
                                    setInvoiceData(data.fg_details_data[0].SAP_LINE);
                                    setMessage(data.message)
                                }
                            } else if (data.success == false) {
                                if (type == 'POST') {
                                    errorToast(data.message)
                                    redirect()
                                }
                                setResponse(data)
                                setMessage(data.message)
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [masterPlantData, setMasterPlantData] = useState([])

    const getPlants = () => {
        console.log(apiBaseUrl + `MarketData/Master/getPlants`);
        apiGetMethod(apiBaseUrl + `MarketData/Master/getPlants`)
            .then((response) => {
                const data = response.data;
                console.log(data);
                if (data.success >= 1) {
                    setMasterPlantData(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo('Get')
        getPlants()
    }, [])

    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const masterPlant = masterPlantData.map((plant) => plant.WERKS);
    const toPlantId = invoiceData.map((plant) => plant.TO_PLANT);
    const masterPlantId = masterPlant.filter((plant) => plant == toPlantId);

    const fromPlant = [fgDetailsData?.FROM_PLANT];
    const userPlant = UserDetails?.plantids.filter((userPlant) => userPlant == fromPlant);

    console.log(JSON.stringify(fromPlant) == JSON.stringify(userPlant));

    const checkPlant = () => {

        if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {            
            if (data.moduleTypeId == 2) {                
                if (JSON.stringify(toPlantId) == JSON.stringify(masterPlantId)) {
                    getGateInInfo('POST')
                }
                else {
                    confirmDialog({
                        title: `<h5><strong class="text-white">${toPlantId} - Plant Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
            }
            else{
                getGateInInfo('POST')
            }
        } else {
            errorToast("Plant not assigned for user, Please assign plant")
        }
    }

    const reject = () => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 2,
            rejectReasonId: formData.rejectReason.value,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast("Rejected Successfully...");
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

    return (
        <div>
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

                        {data.colorToken != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Enter Color / Token" value={data?.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.rejectReason != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Reason</Label>
                                    <Input type="text" placeholder="Enter Reason" value={data?.rejectReason} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.remarks != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.truckType ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Enter Truck Type" value={data?.truckType} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.shipmentOrderNo != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Shipment Order No</Label>
                                    <Input type="text" placeholder="Enter Shipment Order No" value={data?.shipmentOrderNo} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>

                        {invoiceData.map(invoiceData => (
                            <Col md="12" sm="12" key={invoiceData.LINE_ITEM}>
                                <Row>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery No</Label>
                                            <Input type="text" placeholder="Enter Delivery No" value={invoiceData?.DELIVERY_NO} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery Qty In Bag</Label>
                                            <Input type="text" placeholder="Enter Delivery Qty" value={Number(invoiceData?.DELIVERY_QTY).toFixed(3)} disabled />
                                        </FormGroup>
                                    </Col>

                                    {fgDetailsData.TYPE == "FG-STO" ?
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Delivery Weight</Label>
                                                <Input type="text" placeholder="Enter Delivery Weight" value={Number(invoiceData?.DELIVERY_WT).toFixed(3)} disabled />
                                            </FormGroup>
                                        </Col> : null
                                    }

                                    {invoiceData.INVOICE_NO != "" ?
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Invoice No</Label>
                                                <Input type="text" placeholder="Enter Invoice No" value={invoiceData?.INVOICE_NO} disabled />
                                            </FormGroup>
                                        </Col> : null
                                    }
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PGI Status</Label>
                                            <Input type="text" placeholder="Enter Status" value={invoiceData?.PGI_COMPLETION == 'C' ? 'Completed' : invoiceData?.PGI_COMPLETION == 'A' ? "Waiting at PGI" : invoiceData?.PGI_COMPLETION} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
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
                                        <Input type="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                {data.secondWeightCheck ?
                                    <>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Second Weight Check</Label>
                                                <Input type="text" placeholder="Enter Second Weight Check" value={data?.secondWeightCheck} disabled />
                                            </FormGroup>
                                        </Col>
                                    </> : null
                                }
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Second Weight</Label>
                                        <Input type="text" placeholder="Enter Second Weight" value={data?.secondWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Net Weight</Label>
                                        <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>{data.moduleTypeId == 1 ? "Shipment Weight" : "Delivery Weight"}</Label>
                                        <Input type="text" placeholder="Enter Delivery Weight" value={fgDetailsData?.OVERALL_DELIVERY_WT ? Number(fgDetailsData?.OVERALL_DELIVERY_WT).toFixed(3) : 0} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>{data.moduleTypeId == 1 ? "Diff WB(Shipment Weight & Net weight)" : "Diff(Delivery Weight & Net weight)"}</Label>
                                        <Input type="text" placeholder="Enter Total Weight" value={fgDetailsData?.OVERALL_DELIVERY_WT ? Number(fgDetailsData?.OVERALL_DELIVERY_WT - data.netWeight).toFixed(3) : 0} disabled />
                                    </FormGroup>
                                </Col> </> : null
                        }

                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>

                                {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                }

                                <div style={{ float: 'right' }}>
                                    {invoiceData != "" ? <>
                                        {(data?.moduleTypeId == 2 || data?.loadingUnloadingInfoId > 0) && (JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2)) ?
                                            <>
                                                {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                                    <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                                        <Check size={16} /> Submit
                                                    </Button.Ripple> : null
                                                }
                                            </> : null
                                        }
                                        {data?.moduleTypeId == 1 && invoiceData.length == invoiceNo2.length ?
                                            <>
                                                {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                                    <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                                        <Check size={16} /> Submit
                                                    </Button.Ripple> : null
                                                }
                                            </> : null
                                        } </> : null
                                    }

                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody >
            </Card >

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
                                <Button.Ripple color="danger" type="button" onClick={reject}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default FGSAPDocument;
