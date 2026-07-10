import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../../../forms/custom-form";
import { Col, Button, Label, FormGroup, Input } from "reactstrap";
import { Check, ChevronDown, ChevronUp, StopCircle, X } from "react-feather";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { apiGetMethod } from "../../../../helper/axiosHelper";

const STOLoadingGateIn = ({ data, setData, setTruckValue, setShipmentOrderNo, getLoadingData, setIsDisable, setShow }) => {

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
        gateIn() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const plantId = UserDetails.plantids.filter((plant) => plant == 'FM01');

    const [plantName, setPlantName] = useState("")

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
    
    const gateIn = (moduleStatusId) => {
        if (!form.isValid && plantId != '' && data.VEHICLE_TYPE == 'TRUCK') {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: "Loading",
            moduleType: "FG-STO",
            vehicleNo: data.VEHICLE_NO,
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
                    setShipmentOrderNo('0')
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

    useEffect(() => {
        getUserPlant()
    }, [])

    return (
        <Fragment>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Driver Phone No"} form={form} value={data.DRIVER_PHONE_NO} id="driverPhoneNo" type="text" disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input type="text" placeholder="Enter Plant" value={plantId[0] == 'FM01' ? "NLFD_Mill" : plantName} disabled />
                </FormGroup>
            </Col>

            {plantId != '' && data.VEHICLE_TYPE == 'TRUCK' ?
                <Col sm="4" md="4">
                    <FormGroup>
                        <CustomDropdownInput
                            url={`${apiBaseUrl}GatePro/master/getColorOrToken`}
                            label={"Color / Token"}
                            form={form}
                            id="colorToken"
                        />
                    </FormGroup>
                </Col> : null
            }

            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
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

            {showGeneralData ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>TRIP Sheet No</Label>
                        <Input type="text" placeholder="Enter TRIP Sheet No" value={data.TRIPSHEET_NO} disabled />
                    </FormGroup>
                </Col> : null
            }
            {showGeneralData ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Truck Type</Label>
                        <Input type="text" placeholder="Enter Truck Type" value={data.TRUCKTYPE} disabled />
                    </FormGroup>
                </Col> : null
            }
            {showGeneralData ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Truck Capacity</Label>
                        <Input type="text" placeholder="Enter Truck Capacity" value={data.TRUCKCAPACITY} disabled />
                    </FormGroup>
                </Col> : null
            }
            {showGeneralData ?
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Vehicle Type</Label>
                        <Input type="text" placeholder="Enter Truck Capacity" value={data.VEHICLE_TYPE} disabled />
                    </FormGroup>
                </Col> : null
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
        </Fragment >
    );
};

export default STOLoadingGateIn;
