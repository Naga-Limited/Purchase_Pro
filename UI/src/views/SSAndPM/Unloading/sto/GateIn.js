import React, { useEffect, useState } from "react";
import { Yup } from "../../../forms/custom-form";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input } from "reactstrap";
import { Check, Search, StopCircle, X } from "react-feather";
import { useFormik } from "formik";
import { apiBaseUrl } from "../../../../urlConstants";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const SSAndPMUnloadingGateIn = ({ data, setSelectedValue, setModuleTypeId, setModuleType, getUnLoadingData, Unloading_Gate_in_Vehicle }) => {

    useEffect(() => {
        getGatepassDeliveryInfo()
    }, [])

    const gateInOutInfoData = data.results[0];
    let { showLoader, hideLoader } = useLoader();
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

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
                    setSelectedValue("")
                    setModuleType("")
                    setModuleTypeId("")
                    Unloading_Gate_in_Vehicle()
                }
                else if (res.success == false) {
                    errorToast(res.message)
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

    const getGatepassDeliveryInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData.fromGateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData.fromGateInOutInfoId}`)
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

    return (
        <>
            <Row>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>STO PO</Label>
                        <Input type="text" placeholder="Enter STO PO" value={gateInOutInfoData.stoPoNo} disabled />
                    </FormGroup>
                </Col>

                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Driver Phone No</Label>
                        <Input type="text" placeholder="Enter Driver Phone No" value={gateInOutInfoData.driverMobileNumber} disabled />
                    </FormGroup>
                </Col>

                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Delivery No</Label>
                        <Input type="text" placeholder="Enter Delivery No" value={gateInOutInfoData.deliveryOrderNumber} disabled />
                    </FormGroup>
                </Col>
                {gateInOutInfoData?.fromPlantFirstWeight != null ? <>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>From Plant Empty Weight </Label>
                            <Input type="text" placeholder="Enter Empty Weight" value={gateInOutInfoData.fromPlantFirstWeight} disabled />
                        </FormGroup>
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>From Plant Load Weight</Label>
                            <Input type="text" placeholder="Enter Load Weight" value={gateInOutInfoData.fromPlantSecondWeight} disabled />
                        </FormGroup>
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>From Plant Net Weight </Label>
                            <Input type="text" placeholder="Enter Net Weight" value={gateInOutInfoData.fromPlantNetWeight} disabled />
                        </FormGroup>
                    </Col> </> : null
                }
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>From Plant</Label>
                        <Input type="text" placeholder="Enter From Plant" value={gateInOutInfoData.fromPlant} disabled />
                    </FormGroup>
                </Col>

                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>To Plant </Label>
                        <Input type="text" placeholder="Enter To Plant" value={gateInOutInfoData.plantName} disabled />
                    </FormGroup>
                </Col>

                <Col md="4" sm="4">
                    <FormGroup >
                        <Label>Remarks </Label>
                        <Input type="text" placeholder="Enter Remarks" />
                    </FormGroup>
                </Col>

                <Col sm="12" md="12">
                    <label></label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                        <div className="mr-1">
                            <div style={{ marginBottom: "7px" }}></div>
                            <Label><b>View :</b></Label>
                        </div>
                        <div className="mr-1">
                            <a target="_blank" href={gateInOutInfoData.pickSlipCopy}>
                                <Button outline color="success" type="button">
                                    Delivery Doc
                                </Button>
                            </a>
                        </div>
                        {/* <div className="mr-1">
                            <a target="_blank" href={apiBaseUrl + gateInOutInfoData.sendingWBSlip}>
                                <Button outline color="success" type="button">
                                    Weighment Slip
                                </Button>
                            </a>
                        </div> */}
                    </FormGroup>
                </Col>

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

                <Col sm="12" md="12">
                    <label>&nbsp;</label>
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
        </>
    )
}

export default SSAndPMUnloadingGateIn