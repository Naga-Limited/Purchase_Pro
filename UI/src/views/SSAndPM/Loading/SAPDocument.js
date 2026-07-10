import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiBaseUrl } from "../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card, Alert, ButtonGroup } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "react-feather";
import { ShowToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../../forms/custom-form";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { apiGetMethod } from "../../../helper/axiosHelper";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";

const SAPDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const [invoiceData, setInvoiceData] = useState([])
    const [data, setData] = useState([])
    const [response, setResponse] = useState([])
    const [gatePassDeliveryData, setGatePassDeliveryData] = useState([])
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([])

    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const pgiStatus1 = invoiceData.map((invoiceData) => invoiceData.PGI_FLAG);
    const pgiStatus2 = invoiceData.map((invoiceData) => 'C');

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    PODetailsFetch(data.results[0].loadingUnloadingInfoId)
                    const postData = { vaNumber: data.results[0].vaNumber, type: type, gateInOutInfoId: data.results[0].gateInOutInfoId, movementTypeId: data.results[0].movementTypeId, userInfoId: UserDetails.USERID }
                    showLoader()
                    console.log(apiBaseUrl + "LandingDataController/SsAndPm_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/SsAndPm_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (type == 'GET') {
                                    const toPlant = data.results[0].TO_PLANT
                                    setToPlant(toPlant)
                                    setInvoiceData(data.results)
                                    setResponse(data)
                                } else if (type == 'POST') {
                                    ShowToast(data.message);
                                    history.push('/SAPDocumentDetails')
                                }
                            }
                            else if (data.success == false) {
                                if (type == 'GET') {
                                    setResponse(data)
                                } else if (type == 'POST') {
                                    errorToast(data.message)
                                }
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                        .finally((a) => {
                            hideLoader();
                        });

                    if (type == 'GET') {
                        GatePass_DocumentVerify(data.results[0].gateInOutInfoId, data.results[0].vaNumber, 'GET')
                    } else {
                        GatePass_DocumentVerify(data.results[0].gateInOutInfoId, data.results[0].vaNumber, 'POST')
                    }
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const GatePass_DocumentVerify = (gateInOutInfoId, vaNumber, type) => {

        const gatePasspostData = { gateInOutInfoId: gateInOutInfoId, vaNumber: vaNumber, type: type }

        console.log(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", gatePasspostData);
        apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", gatePasspostData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'GET') {
                        setGatePassDeliveryData(data.results);
                    }
                    else if (type == 'POST') {
                        // ShowToast(data.message)
                        history.push('/SAPDocumentDetails')
                    }
                }
                else if (data.success == false) {
                    console.log(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const PODetailsFetch = (loadingUnloadingInfoId) => {

        console.log(apiBaseUrl + `LandingDataController/PoDetailsFetch/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `LandingDataController/PoDetailsFetch/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPurchaseOrderDetails(data.results);
                }
                else if (data.success == false) {
                    console.log(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    useEffect(() => {
        getGateInInfo('GET');
    }, []);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }

    const [toPlant, setToPlant] = useState('')

    const checkPlant = () => {

        const fromPlant = [invoiceData[0]?.FROM_PLANT];
        const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

        if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {
            apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${toPlant}`)
                .then((response) => {
                    const data = response.data;
                    if (data.success) {
                        getGateInInfo('POST')
                    }
                    if (data.success == false) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">${toPlant} - ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    errorToast("Something went wrong, please try again after sometime");
                })
        } else {
            errorToast("Plant not assigned for user, Please assign plant")
        }
    }
    const DeliveryGenerate = (type) => {
        const postData = { vaNumber: data?.vaNumber, 
            gateInOutInfoId: data?.gateInOutInfoId, movementTypeId: data?.movementTypeId, userInfoId: UserDetails.USERID ,purchaseOrderDetails:purchaseOrderDetails,vaNumber:data?.vaNumber,netWeight:data?.netWeight,loadingUnloadingInfoId:data?.loadingUnloadingInfoId,deliveryWeight: data?.deliveryWeight || data?.netWeight}
        showLoader()
        console.log(apiBaseUrl + "LandingDataController/DeliveryGenerate", postData);
        apiPostMethod(apiBaseUrl + "LandingDataController/DeliveryGenerate", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    confirmDialog({
                        title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        history.push('/SAPDocumentDetails');  // Reloads the page after the confirm dialog is closed
                    });
                     
                }else if (data.success == false) {
                   errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }
    const updateVehicleStatus = (type) => {
        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: type == 'Reject' ? 2 : 4,
            rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(type == 'Reject' ? "Rejected Successfully..." : res.message);
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
        <Fragment>
            <Card>
                <CardHeader><h5>Loading - SS,PM && RM - SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>STO PO</Label>
                                <Input type="text" placeholder="Enter STO PO" value={data?.stoPoNo} disabled />
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

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>

                        {invoiceData.map(invoiceData => (
                            <Col md="12" sm="12" key={invoiceData.LINE}>
                                <Row>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Delivery No</Label>
                                            <Input type="text" placeholder="Enter Delivery No" value={invoiceData?.DELIVERY_NO} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="2" sm="2">
                                        <FormGroup>
                                            <Label>From Plant</Label>
                                            <Input type="text" placeholder="Enter From Plant" value={invoiceData?.FROM_PLANT} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="2" sm="2">
                                        <FormGroup>
                                            <Label>To Plant</Label>
                                            <Input type="text" placeholder="Enter To Plant" value={invoiceData?.TO_PLANT} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="2" sm="2">
                                        <FormGroup>
                                            <Label>Delivery Qty</Label>
                                            <Input type="text" placeholder="Enter Total Weight" value={Number(invoiceData?.DELIVERY_QTY).toFixed(2)} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>PGI Status</Label>
                                            <Input type="text" placeholder="Enter Status" value={invoiceData?.PGI_FLAG == 'C' ? 'Completed' : invoiceData?.PGI_FLAG == 'A' ? "Waiting at PGI" : invoiceData?.PGI_FLAG} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        ))}
                        {purchaseOrderDetails != '' ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Purchase Info</u></h4><br />
                            </Col>

                            {purchaseOrderDetails?.map(gatePassDeliveryData => (
                                <Col md="12" sm="12" key={gatePassDeliveryData?.PO_NUMBER}>
                                    <Row>
                                        <Col md="12" sm="12">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-primary text-white text-center" width='10%'>PO NUMBER</th>
                                                        <th className="bg-primary text-white text-center" width='25%'>MATERIAL</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>PO QTY</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>FROM PLANT</th> 
                                                        <th className="bg-primary text-white text-center" width='10%'>TO PLANT</th> 
                                                    </tr>
                                                </thead>
                                                {gatePassDeliveryData?.LINE_ITEM.map((lineItem) => {
                                                    return (
                                                        <tbody key={lineItem.LINE_ITEM}>
                                                            <tr>
                                                                <td className='text-center'>{gatePassDeliveryData?.PO_NUMBER}</td>
                                                                <td>{lineItem?.DESCRIPTION}</td>
                                                                <td className='text-center'>{lineItem?.UOM}</td>
                                                                <td className='text-center'>{lineItem?.QUANTITY}</td>
                                                                <td className='text-center'>{gatePassDeliveryData?.FROMPLANT}</td>
                                                                <td className='text-center'>{lineItem?.PLANT}</td>
                                                            </tr>
                                                        </tbody>
                                                    )
                                                })}
                                            </table>
                                            <br />
                                        </Col>
                                    </Row>
                                </Col>))}
                        </> : null}
                        {gatePassDeliveryData != '' ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                            </Col>

                            {gatePassDeliveryData?.map(gatePassDeliveryData => (
                                <Col md="12" sm="12" key={gatePassDeliveryData?.GATEPASS_NO}>
                                    <Row>
                                        <Col md="3" sm="3">
                                            <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{gatePassDeliveryData?.GATEPASS_NO}</u></b></FormGroup>
                                        </Col>
                                        <Col md="6" sm="6">
                                            <ButtonGroup>
                                                <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>GATEPASS TYPE : </span>{gatePassDeliveryData?.GATEPASS_TYPE}</u></b></FormGroup>
                                                <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{gatePassDeliveryData?.FROM_PLANT}</u></b></FormGroup>
                                            </ButtonGroup>
                                        </Col>
                                        {gatePassDeliveryData?.VENDOR_PLANT_NAME ?
                                            <Col md="3" sm="3">
                                                <FormGroup><b><u><span className='text-primary'>VENDOR PLANT : </span>{gatePassDeliveryData?.VENDOR_PLANT_NAME}</u></b></FormGroup>
                                            </Col> : null
                                        }

                                        <Col md="12" sm="12">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                        <th className="bg-primary text-white text-center">MATERIAL</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                        <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                        {gatePassDeliveryData.SAP_LINE[0].REC_PLANT != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                        <th className="bg-primary text-white text-center" width='10%'>VALUE</th>
                                                    </tr>
                                                </thead>
                                                {gatePassDeliveryData?.SAP_LINE.map((lineItem) => {
                                                    return (
                                                        <tbody key={lineItem.LINE_ITEM}>
                                                            <tr>
                                                                <td className='text-center'>{lineItem?.LINE_ITEM}</td>
                                                                <td>{lineItem?.MATERIAL}</td>
                                                                <td className='text-center'>{lineItem?.UOM}</td>
                                                                <td className='text-center'>{lineItem?.QTY}</td>
                                                                {lineItem?.REC_PLANT != '' ? <td className='text-center'>{lineItem?.REC_PLANT}</td> : null}
                                                                <td className='text-center'>{lineItem?.VALUE}</td>
                                                            </tr>
                                                        </tbody>
                                                    )
                                                })}
                                            </table>
                                            <br />
                                        </Col>
                                    </Row>
                                </Col>))}
                        </> : null}

                        {data?.weighmentInfoId > 0 ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data?.secondWeight} disabled />
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
                                <Label>Delivery Qty Weight</Label>
                                <Input
                                type="number"
                                step="0.001" // allows up to 3 decimals
                                placeholder="Enter Net Weight"
                                value={data?.deliveryWeight ?? data?.netWeight ?? ""}  // fallback to netWeight
                                onChange={(e) => {
                                    if (UserDetails.role === "Admin" || UserDetails.role === "Manager") {
                                    setData({
                                        ...data,
                                        deliveryWeight: e.target.value, // update only deliveryWeight
                                    });
                                    }
                                }}
                                disabled={UserDetails.role !== "Admin" && UserDetails.role !== "Manager"}
                                />
                            </FormGroup>
                            </Col>


                            </> : null
                        }
                        {data?.moduleTypeId != 44 &&
                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>}

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                {data?.weighmentInfoId > 0 && data?.moduleStatusId == 3 || data?.moduleStatusId == 4 && data?.netWeight > 0 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                }

                                <div style={{ float: 'right' }}>
                                    {(data?.moduleStatusId == 3 || data?.moduleStatusId == 4) && data.moduleTypeId != 44 && (invoiceData != '' && JSON.stringify(pgiStatus1) == JSON.stringify(pgiStatus2)) ?
                                        <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple> : null
                                    }
                                    {(data?.moduleStatusId == 3 || data?.moduleStatusId == 4) && data.moduleTypeId == 44 && data?.netWeight > 0 ?
                                        <Button.Ripple color="primary" type="button" onClick={DeliveryGenerate}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple> : null
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
                                <Button.Ripple color="danger" type="button" onClick={() => updateVehicleStatus('Reject')}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Fragment >
    );
};

export default SAPDocument;
