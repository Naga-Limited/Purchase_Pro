import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "react-feather";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { useSelector } from "react-redux";
import { ShowToast } from "../../../../helper/appHelper";

const GateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();

    const [data, setData] = useState("")
    const [invoiceData, setInvoiceData] = useState([])
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    let { gateInOutInfoId } = useParams();

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                    setInvoiceData(data.invoiceInfo)
                    getGatepassDeliveryInfo(data.results[0].fromGateInOutInfoId)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getGatepassDeliveryInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatepassDeliveryData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
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

    const updateVehicleStatus = () => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
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
        history.push(`/VA`);
    }

    const [generalData, setGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [hideDownArrow, setHideDownArrow] = useState(false)

    const showshowGeneralData = () => {
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Unloading - SS & PM - Gate Out</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
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
                                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                            </FormGroup>
                        </Col>
                        <Col sm="4" md="4">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">

                                <div>
                                    <div style={{ marginBottom: "6px" }}></div>
                                    <Label><b>View :</b></Label>
                                </div>&nbsp;&nbsp;

                                <a target="_blank" href={data?.pickSlipCopy}>
                                    <Button outline color="success" type="button">
                                        Delivery Doc
                                    </Button>
                                </a>
                                {/* <a target="_blank" href={apiBaseUrl + data?.sendingWBSlip}>
                                    <Button outline color="success" type="button" className='ml-1'>
                                        Weighment Slip
                                    </Button>
                                </a> */}
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <hr></hr>
                            <FormGroup>
                                <Label for="nameMulti"><b>Click Here :
                                    &nbsp;&nbsp;
                                    {showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={showshowGeneralData} className="text-primary">
                                            General Details <ChevronDown size={20} />
                                        </Button.Ripple> : null
                                    }
                                    {hideDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                                            General Details <ChevronUp size={20} />
                                        </Button.Ripple> : null
                                    }
                                </b></Label>
                            </FormGroup>
                        </Col>

                        {generalData ?
                            <>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Delivery No</Label>
                                        <Input type="text" placeholder="Enter Delivery No" value={data?.deliveryOrderNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant</Label>
                                        <Input type="text" placeholder="Enter From Plant" value={data?.fromPlant} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>To Plant</Label>
                                        <Input type="text" placeholder="Enter To Plant" value={data?.plantName} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.fromPlantFirstWeight != null ? <>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant Empty Weight </Label>
                                            <Input type="text" placeholder="Enter Empty Weight" value={data?.fromPlantFirstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant Load Weight</Label>
                                            <Input type="text" placeholder="Enter Load Weight" value={data?.fromPlantSecondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant Net Weight </Label>
                                            <Input type="text" placeholder="Enter Net Weight" value={data?.fromPlantNetWeight} disabled />
                                        </FormGroup>
                                    </Col> </> : null
                                }
                                {data?.weighmentInfoId > 0 ? <>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>To Plant Empty Weight</Label>
                                            <Input type="text" placeholder="Enter Delivery No" value={data?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>To Plant Load Weight</Label>
                                            <Input type="text" placeholder="Enter From Plant" value={data?.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>To Plant Net Weight</Label>
                                            <Input type="text" placeholder="Enter To Plant" value={data?.netWeight} disabled />
                                        </FormGroup>
                                    </Col> </> : null
                                }

                                {gatepassDeliveryData != '' ?
                                    <>
                                        <Col md="12" sm="12"><hr></hr></Col>

                                        <Col md="12" sm="12">
                                            <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                                        </Col>
                                        {gatepassDeliveryData?.map(gatepassDeliveryData => (
                                            <>
                                                <Col md="4" sm="4">
                                                    <FormGroup>
                                                        <Label>Return Type</Label>
                                                        <Input type="text" placeholder="Enter Return Type" value={gatepassDeliveryData.gatePassType} disabled />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4" sm="4">
                                                    <FormGroup>
                                                        <Label>Gate Pass No</Label>
                                                        <Input type="text" placeholder="Enter Gate Pass No" value={gatepassDeliveryData.gatePassNo} disabled />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4" sm="4">
                                                    <FormGroup>
                                                        <Label>From Plant</Label>
                                                        <Input type="text" placeholder="Enter Plant" value={gatepassDeliveryData.fromPlantName} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="12" sm="12">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                                <th className="bg-primary text-white text-center">MATERIAL</th>
                                                                <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                                <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                                {gatepassDeliveryData.sapLine[0].toPlantName != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                            </tr>
                                                        </thead>
                                                        {gatepassDeliveryData?.sapLine.map((lineItem) => {
                                                            return (
                                                                <tbody key={lineItem.lineItem}>
                                                                    <tr>
                                                                        <td className='text-center'>{lineItem?.lineItem}</td>
                                                                        <td>{lineItem?.material}</td>
                                                                        <td className='text-center'>{lineItem?.uom}</td>
                                                                        <td className='text-center'>{lineItem?.quantity}</td>
                                                                        {lineItem?.toPlantName != '' ? <td className='text-center'>{lineItem?.toPlantName}</td> : null}
                                                                    </tr>
                                                                </tbody>
                                                            )
                                                        })}
                                                    </table>
                                                    <br />
                                                </Col>
                                            </>))}
                                    </> : null
                                }

                            </> : null
                        }

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={reload}>
                                    <ArrowLeft size={16} /> Back
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                                    <Check size={16} /> Gate Out
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment >
    );
};

export default GateOut;
