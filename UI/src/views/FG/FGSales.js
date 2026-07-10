import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input } from "reactstrap";
import { Modal } from "react-bootstrap";
import { Check, ChevronDown, ChevronUp, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import Purchase from "../VA/Purchase";

const FGSales = ({ data, setData, setTruckValue, setShipmentOrderNo, getLoadingData, setIsDisable, setShow }) => {

    useEffect(() => {
        getRedirectGateInInfo()
    }, [data])


    let { showLoader, hideLoader } = useLoader();

    const [showGeneralData, setShowGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)

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
            colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const plantId = UserDetails.plantids.filter((plant) => plant == 'FM01');
    const [plantName, setPlantName] = useState("")
    const [redirectGateInData, setRedirectGateInData] = useState([])

    const getRedirectGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${data?.redirectedGateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${data?.redirectedGateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setRedirectGateInData(data.results[0])
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    console.log(res);
                    setPlantName(res.results[0].plantName)
                }
                else if (res.success == false) {
                    // errorToast(res.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const onSubmit = (moduleStatusId) => {
        if (data?.gateInOutInfoId > 0) {
            updateVehicleStatus(moduleStatusId)
        } else {
            gateIn(moduleStatusId)
        }
    }

    const gateIn = (moduleStatusId) => {
        if (!form.isValid && plantId != '' && data.VEHICLE_TYPE == 'TRUCK') {
            form.setSubmitting(true);
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: "Loading",
            moduleType: "FG-Sales",
            vehicleNo: data.VEHICLE_NO,
            shipmentOrderNo: data.SAP_LINE[0].SHIPMENTORDERNO,
            driverMobileNumber: data.DRIVER_PHONE_NO,
            route: data.ROUTE,
            masterColorTokenId: formData.colorToken == null ? null : formData.colorToken.value,
            tripSheetNumber: data.TRIPSHEET_NO,
            truckType: data.TRUCKTYPE,
            clean: data.CLEAN,
            oder: data.ODER,
            tarpaulin: data.TARPAULIN,
            noOfTarpaulin: data.NOOFTARPAULIN,
            platformCondition: data.PLATFORM,
            isVehicleFit: data.VEHICLEFITFORLOADING,
            previousLoadData: data.PREVIOUSLOADDETAILS,
            truckCapacity: data.TRUCKCAPACITY,
            vehicleType: data.VEHICLE_TYPE,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    form.resetForm()
                    setTruckValue("")
                    setShipmentOrderNo('')
                    getLoadingData()
                    data.TRIPSHEET_NO = undefined;
                    setIsDisable(false)
                    setShow(false)
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

    const updateVehicleStatus = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : "Gate In Success...";
                    if(data?.moduleTypeId == 44){
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        }).then(() => {
                            window.location.reload();  // Reloads the page after the confirm dialog is closed
                        });
                    }else{
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })}
                    form.resetForm()
                    setTruckValue("")
                    setShipmentOrderNo('')
                    getLoadingData()
                    data.TRIPSHEET_NO = undefined;
                    setIsDisable(false)
                    setShow(false)
                    setData([])
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

    useEffect(() => {
        getUserPlant()
    }, [])

    return (
        <Fragment>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Driver Phone No"} isNumberOnly form={form} id="driverNo" value={data?.driverMobileNumber ? data?.driverMobileNumber : data.DRIVER_PHONE_NO} disabled />
                </FormGroup>
            </Col>

            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input type="text" placeholder="Enter Plant" value={data?.plantName ? data?.plantName : plantId[0] == 'FM01' ? "NLFD_Mill" : plantName} disabled />
                </FormGroup>
            </Col>

            {data.isRedirect == 1 && redirectGateInData != '' ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Redirect From Plant</Label>
                        <Input type="text" placeholder="Enter Plant" value={redirectGateInData?.plantName} disabled />
                    </FormGroup>
                </Col> : null
            }

            {data.isRedirect == 1 && data.redirectPlantName != null ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Redirect From Plant</Label>
                        <Input type="texvt" placeholder="Enter Plant" value={data?.redirectPlantName} disabled />
                    </FormGroup>
                </Col> : null
            }

            {data?.gateInOutInfoId == undefined && plantId != '' && data.VEHICLE_TYPE == 'TRUCK' ?
                <Col sm="4" md="4">
                    <FormGroup>
                        <CustomDropdownInput
                            url={`${apiBaseUrl}GatePro/Master/getColorOrToken`}
                            label={"Color / Token"}
                            form={form}
                            id="colorToken"
                        />
                    </FormGroup>
                </Col> : null
            }

            {data?.gateInOutInfoId == undefined || data?.redirectModuleTypeId == 2 || data?.redirectModuleTypeId == 0 ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                    </FormGroup>
                </Col> : null
            }

            {data?.gateInOutInfoId == undefined || data?.redirectModuleTypeId == 2 || data?.redirectModuleTypeId == 0 ?
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
                </Col> : null
            }

            {showGeneralData || (data?.gateInOutInfoId != undefined && data?.redirectModuleTypeId == 1) ? <>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>TRIP Sheet No</Label>
                        <Input type="text" placeholder="Enter TRIP Sheet No" value={data?.tripSheetNumber ? data.tripSheetNumber : data.TRIPSHEET_NO} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Truck Type</Label>
                        <Input type="text" placeholder="Enter Truck Type" value={data?.truckType ? data.truckType : data.TRUCKTYPE} disabled />
                    </FormGroup>
                </Col>

                {data?.TRIPSHEET_NO || data?.shipmentOrderNo ?
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Shipment Order No</Label>
                            <Input type="text" placeholder="Enter Shipment Order No" disabled value={data?.shipmentOrderNo ? data?.shipmentOrderNo : data?.SAP_LINE[0]?.SHIPMENTORDERNO} />
                        </FormGroup>
                    </Col> : null
                }
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Truck Capacity</Label>
                        <Input type="text" placeholder="Enter Truck Capacity" value={data?.truckCapacity ? data.truckCapacity : data.TRUCKCAPACITY} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Vehicle Type</Label>
                        <Input type="text" placeholder="Enter Truck Capacity" value={data?.vehicleType ? data.vehicleType : data.VEHICLE_TYPE} disabled />
                    </FormGroup>
                </Col> </> : null
            }

            {data?.gateInOutInfoId != undefined && data?.redirectModuleTypeId == 1 ? <Purchase screen={'FGSales'} gateInOutInfoId={data?.gateInOutInfoId} getUnLoadingData={getLoadingData} setData={setData} setTruckNo={setTruckValue} disabled={setIsDisable} /> : null}

            {data?.gateInOutInfoId == undefined || data?.redirectModuleTypeId == 2 || data?.redirectModuleTypeId == 0 ?
                <Col sm="12" md="12">
                    <label></label>
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <div className="mr-1">
                            <Button.Ripple outline color="primary" type="button" onClick={() => onSubmit(6)}>
                                <StopCircle size={16} /> Wait OutSide
                            </Button.Ripple>
                        </div>
                        <Button.Ripple color="primary" type="button" onClick={() => onSubmit(1)}>
                            <Check size={16} /> Gate In
                        </Button.Ripple>
                    </FormGroup>
                </Col> : null
            }
        </Fragment >
    );
};

export default FGSales;
