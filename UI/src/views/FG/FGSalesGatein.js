import React from 'react'
import { Check, StopCircle } from 'react-feather'
import { Button, Col, FormGroup, Input, Label } from 'reactstrap'
import { CustomTextInput, Yup } from '../forms/custom-form';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '../../helper/axiosHelper';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { ShowToast, errorToast } from '../../helper/appHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import Purchase from '../VA/Purchase';

const FGSalesGatein = ({ data, setData, setModuleTypeId, setTruckValue, setIsDisable, getLoadingData, setShow, setGateInOutInfoData }) => {

    console.log(data);

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onSubmit = (moduleStatusId) => {
            gateIn(moduleStatusId) 
    }

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: "loading",
            moduleType: data.moduleType,
            vehicleNo: data.truckNo,
            driverMobileNumber: formData.phoneNo || data.driverMobileNumber || "",
            masterPlantId: data.masterPlantId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            tripSheetNumber:data.tripSheetNumber || "",
            shipmentOrderNo:data.shipmentOrderNo || "",
            truckType:data.truckType || "",
        };
        if(postdata.moduleType != 'RM-Import STO'){
        if (!postdata.driverMobileNumber || !/^\d{10}$/.test(postdata.driverMobileNumber)) {
            confirmDialog({
                title: `<h5><strong class="text-white">Please Enter a Valid 10-Digit Driver Mobile No</strong></h5>`,
                cancelButton: false,
                confirmText: false,
                confirmButton: false,
                background: `#BD362F`
            });
            return;
        }
        }
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    reset();
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

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
        }

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    reset();
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

    const reset = () => {
        setData([])
        setModuleTypeId("")
        setTruckValue("")
        setIsDisable(false)
        getLoadingData()
        form.resetForm()
        setShow(false)
        setGateInOutInfoData([])
    }

    return (
        <>
            <Col md="4" sm="4" >
                <FormGroup>
                    <Label>Type</Label>
                    <Input placeholder="Type" value={data.moduleType} disabled />
                </FormGroup>
            </Col>
            {data?.driverMobileNumber && 
            <Col md="4" sm="4">
                <FormGroup>
                <CustomTextInput label={"Driver Phone No"} type="text" form={form}  id="phoneNo" value={data.driverMobileNumber} disabled/>
                </FormGroup>
            </Col>}
            {!data?.driverMobileNumber &&
            <Col md="4" sm="4">
                <FormGroup>
                <CustomTextInput label={"Driver Phone No"} type="text" form={form}  id="phoneNo" />
                </FormGroup>
            </Col>}
            {data?.tripSheetNumber && 
            <Col md="4" sm="4">
                <FormGroup>
                <CustomTextInput label={"Tripsheet No"} type="text" id="tripSheetNumber" value={data.tripSheetNumber} disabled form={form}/>
                </FormGroup>
            </Col>}
            {data?.truckType	&& 
            <Col md="4" sm="4">
                <FormGroup>
                <CustomTextInput label={"Vehicle Type"} type="text" id="vehicleType" value={data.truckType} disabled form={form}/>
                </FormGroup>
            </Col>}
            {data?.shipmentOrderNo && 
            <Col md="4" sm="4">
                <FormGroup>
                <CustomTextInput label={"Shipment Order No"} type="text" id="shipmentOrderNo" value={data.shipmentOrderNo} disabled form={form}/>
                </FormGroup>
            </Col>}
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input placeholder="Plant" value={data.plantName + ' - ' + data.werks} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                </FormGroup>
            </Col>

            

            {data?.firstWeight == null && data?.secondWeight == null ?
                <Col sm="12">
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <div className="mr-1">
                            <Button.Ripple outline color="primary" type="button" onClick={() => onSubmit(6)}>
                                <StopCircle size={16} className="mr-1" />
                                Wait Outside
                            </Button.Ripple>
                        </div>
                        <Button.Ripple color="primary" type="button" onClick={() => onSubmit(1)}>
                            <Check size={16} className="mr-1" />
                            Gate In
                        </Button.Ripple>
                    </FormGroup>
                </Col> : null
            }
        </>
    )
}

export default FGSalesGatein
