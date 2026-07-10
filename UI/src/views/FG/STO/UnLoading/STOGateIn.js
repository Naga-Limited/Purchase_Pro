import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Col, Button, Label, FormGroup, Input, Row } from "reactstrap";
import { Check, ChevronDown, ChevronUp, StopCircle } from "react-feather";
import { apiBaseUrl } from "../../../../urlConstants";
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { useSelector } from "react-redux";
import { useLoader } from "../../../../utility/hooks/useLoader";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const STOGateIn = ({ data, setModuleType, setSelectedValue, getUnLoadingData, Unloading_Gate_in_Vehicle }) => {

    useEffect(() => {
        getGatepassDeliveryInfo()
    }, [])

    const gateInOutInfoData = data.results[0];
    const invoiceData = data.invoiceInfo;
    const plantids = invoiceData.map((invoiceData) => invoiceData.werks);
    let { showLoader, hideLoader } = useLoader();

    const [showGeneralData, setShowGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    const showshowGeneralData = () => {
        setShowDownArrow(false)
        setShowGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setShowGeneralData(false)
        setShowDownArrow(true)
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // driverPhoneNo: ""
        }),
        gateIn() { },
    });

    const getGatepassDeliveryInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData.gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData.gateInOutInfoId}`)
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

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: gateInOutInfoData.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
        };
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : "Gate In Success...";
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    form.resetForm()
                    getUnLoadingData()
                    setModuleType("")
                    setSelectedValue("")
                    Unloading_Gate_in_Vehicle()
                }
                else if (res.success == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
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
            <Row>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Truck Type</Label>
                        <Input type="text" placeholder="Enter Truck Type" value={gateInOutInfoData.truckType} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>From Plant</Label>
                        <Input type="text" placeholder="Enter From Plant" value={gateInOutInfoData.fromPlant} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>To Plant</Label>
                        <Input type="text" placeholder="Enter From Plant" value={gateInOutInfoData.plantName} disabled />
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
                        <div className="mr-1">
                            <div style={{ marginBottom: "7px" }}></div>
                            <Label><b> Delivery Document :</b></Label>
                        </div>
                        <div className="mr-1">
                            <a target="_blank" href={gateInOutInfoData.pickSlipCopy}>
                                <Button outline color="success" type="button">
                                    View
                                </Button>
                            </a>
                        </div>

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
                            {!showDownArrow ?
                                <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                                    General Details <ChevronUp size={20} />
                                </Button.Ripple> : null
                            }
                        </b></Label>
                    </FormGroup>
                </Col>

                {showGeneralData ? <>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>TRIP Sheet No</Label>
                            <Input type="text" placeholder="Enter TRIP Sheet No" value={gateInOutInfoData.tripSheetNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Driver Phone No.</Label>
                            <Input type="text" placeholder="Enter Driver Phone No." value={gateInOutInfoData.driverMobileNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Truck Capacity</Label>
                            <Input type="text" placeholder="Enter Truck Capacity" value={gateInOutInfoData.truckCapacity} disabled />
                        </FormGroup>
                    </Col>

                    {gateInOutInfoData.fromPlantFirstWeight ?
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Empty Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Empty Weight" value={gateInOutInfoData.fromPlantFirstWeight} disabled />
                            </FormGroup>
                        </Col> : null
                    }

                    {gateInOutInfoData.fromPlantSecondWeight ?
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Load Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Load Weight" value={gateInOutInfoData.fromPlantSecondWeight} disabled />
                            </FormGroup>
                        </Col> : null
                    }

                    {gateInOutInfoData.fromPlantNetWeight ?
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant Net Weight</Label>
                                <Input type="text" placeholder="Enter From Plant Net Weight" value={gateInOutInfoData.fromPlantNetWeight} disabled />
                            </FormGroup>
                        </Col> : null
                    }

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>STO PO No</Label>
                            <Input type="text" placeholder="Enter STO PO No" value={gateInOutInfoData.stoPoNo} disabled />
                        </FormGroup>
                    </Col>

                    {invoiceData.length == 1 ? <>
                        {invoiceData.map(invoiceData => (
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Delivery Order No.</Label>
                                    <Input type="text" placeholder="Enter STO PO No" value={invoiceData.deliveryNumber} disabled />
                                </FormGroup>
                            </Col>
                        ))} </> : null
                    }

                    {invoiceData.length > 1 ? <>

                        <Col md="12" sm="12">
                            <label></label>
                            <h5 className="text-primary">Delivery No :</h5>
                        </Col>

                        {invoiceData.map(invoiceData => (
                            <Col md="4" sm="4">
                                <FormGroup>
                                    {/* <Label>Delivery Order No.</Label> */}
                                    <Input type="text" placeholder="Enter STO PO No" value={invoiceData.deliveryNumber} disabled />
                                </FormGroup>
                            </Col>
                        ))} </> : null
                    }

                    {/* {gatepassDeliveryData != '' ?
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
                                    </Col>
                                </>
                            ))}
                        </> : null
                    } */}
                    </> : null
                }

                <Col sm="12" md="12">
                    <label></label>
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <div className="mr-1">
                            <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                                <StopCircle size={16} /> Wait OutSide
                            </Button.Ripple>
                        </div>
                        <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
                            <Check size={16} /> Gate In
                        </Button.Ripple>
                    </FormGroup>
                </Col>
            </Row>
        </ >
    );
};

export default STOGateIn;