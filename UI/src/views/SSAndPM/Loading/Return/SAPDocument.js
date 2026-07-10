import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card, Alert, ButtonGroup } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import { ShowToast } from "../../../../helper/appHelper";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const SAPDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const [response, setResponse] = useState([])
    const [sapDeliveryData, setSapDeliveryData] = useState([])
    const [gatePassDeliveryData, setGatePassDeliveryData] = useState([])

    const [data, setData] = useState([])
    let { showLoader, hideLoader } = useLoader();
    let { gateInOutInfoId } = useParams();
    const history = useHistory();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    let gate_in_out_data = data.results[0];
                    if(type == 'GET'){
                        GatePass_DocumentVerify(gate_in_out_data, type)
                    }
                    const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type ,userInfoId: UserDetails.USERID}
                    console.log(apiBaseUrl + "LandingDataController/PurchaseReturn_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/PurchaseReturn_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (type == 'GET') {
                                    setSapDeliveryData(data.results)
                                    console.log(data.results)
                                    setResponse(data)
                                } else if ('POST') {
                                    if(gatePassDeliveryData != ''){
                                    GatePass_DocumentVerify(gate_in_out_data, type)
                                    }else{
                                    ShowToast(data.message)
                                    redirect()
                                    }
                                }
                            } else {
                                setResponse(data)
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
    const GatePass_DocumentVerify = (gateInOutData, type) => {

        const gatePasspostData = { gateInOutInfoId: gateInOutData.gateInOutInfoId, vaNumber: gateInOutData.vaNumber, type: type }

        apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", gatePasspostData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'GET') {
                        setGatePassDeliveryData(data.results);
                    }
                    else if (type == 'POST') {
                        ShowToast('Updated Successfully')
                        redirect()
                    }
                }
                else if (data.success == false) {
                    if (type == 'POST') {
                        // errorToast(data.message)
                        redirect()
                    }
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    const fromPlant = [sapDeliveryData[0]?.PLANT];
    const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

    const checkPlant = () => {
        if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {
            getGateInInfo('POST')
        } else {
            errorToast("Plant not assigned for user, Please assign plant")
        }
    }

    useEffect(() => {
        getGateInInfo('GET')
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const redirect = () => {
        history.push("/SAPDocumentDetails");
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
                <CardHeader><h5>SS & PM - Return - SAP Document</h5></CardHeader>
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
                        {/* <Col md="4" sm="4">
                            <FormGroup>
                                <Label>STO PO</Label>
                                <Input type="text" placeholder="Enter STO PO" value={data?.stoPoNo} disabled />
                            </FormGroup>
                        </Col> */}
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

                        <Col md="12" sm="12"><hr /></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>
                        {sapDeliveryData?.map((sapLine) => (<>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Migo No</Label>
                                    <Input type="text" placeholder="Migo No" value={sapLine?.MIGO_NO} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Plant" value={sapLine?.PLANT} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Vendor No</Label>
                                    <Input type="text" placeholder="Vendor No" value={sapLine?.VENDOR_NO} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Vendor Name</Label>
                                    <Input type="text" placeholder="Vendor Name" value={sapLine?.VENDOR_NAME} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="12" sm="12">
                                <table className="table table-bordered">
                                    <thead>
                                        <td className="bg-primary text-white text-center" width='14%'>LINE</td>
                                        <td className="bg-primary text-white text-center">MATERIAL</td>
                                        <td className="bg-primary text-white text-center" width='10%'>QUANTITY</td>
                                        <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                                    </thead>
                                    {sapLine?.LINE_ITEM.map((lineItem) => {
                                        return (
                                            <tbody key={lineItem.LINE}>
                                                <td className='text-center'>{lineItem?.LINE}</td>
                                                <td>{lineItem?.MATERIAL}</td>
                                                <td className='text-center'>{lineItem?.QUANTITY}</td>
                                                <td className='text-center'>{lineItem?.UOM}</td>
                                            </tbody>
                                        )
                                    })}
                                </table>
                                <br />
                            </Col>
                        </>
                        ))}
                         {gatePassDeliveryData != '' ?
                        <Row>
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
                        </Row> : null
                         }
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
                            </Col> </> : null
                        }

                        <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

                        <Col sm="12" md="12"></Col>

                        <Col sm="2" md="2">
                            <label>&nbsp;</label>
                            {/* <FormGroup className="d-flex justify-content-start mb-0">
                                {data?.weighmentInfoId > 0 && data?.moduleStatusId == 3 || data?.moduleStatusId == 4 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                }
                            </FormGroup> */}
                        </Col>

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                {(sapDeliveryData != '') && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                                    <div className="mr-1">
                                        <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple>
                                    </div> : null
                                }
                                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
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
                                <Button.Ripple color="danger" type="button" onClick={() => updateVehicleStatus('Reject')}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
};

export default SAPDocument;
