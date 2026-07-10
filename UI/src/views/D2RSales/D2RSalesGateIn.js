import React from 'react'
import { Button, Col, FormGroup, Input, Label } from 'reactstrap'
import { CustomTextInput, Yup } from '../forms/custom-form';
import { Check, StopCircle } from 'react-feather';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '../../helper/axiosHelper';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import { useLoader } from '../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { currentDate } from '../common/dateComponent';


const D2RSalesGateIn = ({ data, setData, setModuleTypeId, setTruckValue, setIsDisable, getLoadingData, setShow }) => {

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const gateIn = (moduleStatusId) => {

        const formData = form.values

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: data.movementTypeId == 1 ? "loading" : "Unloading",
            moduleType: data.moduleType,
            subModuleTypeId: data.subModuleTypeId,
            vehicleNo: data.truckNo,
            driverMobileNumber: data.phoneNo,
            masterPlantId: data.masterPlantId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            tripSheetNumber: data.tripSheetNo
        };

        if (data.toDate == currentDate()) {
            confirmDialog({
                title: `<h5>Today Last Date of This Vehicle<h5>`,
            }).then((res) => {
                if (res) {
                    showLoader();
                    console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
                    apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
                        .then((response) => {
                            const res = response.data;
                            if (res.success == true) {
                                setData([])
                                setModuleTypeId("")
                                setTruckValue("")
                                setIsDisable(false)
                                getLoadingData()
                                const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                                confirmDialog({
                                    title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                                })
                                form.resetForm()
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
            })
        }
        else {
            showLoader();
            console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
            apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
                .then((response) => {
                    const res = response.data;
                    if (res.success == true) {
                        setData([])
                        setModuleTypeId("")
                        setTruckValue("")
                        setIsDisable(false)
                        getLoadingData()
                        const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        })
                        form.resetForm()
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
    }

    // const gateIn = (moduleStatusId) => {

    //     let formData = form.values;

    //     const postdata = {
    //         userInfoId: UserDetails.USERID,
    //         movementType: "loading",
    //         moduleType: data.moduleType,
    //         vehicleNo: data.truckNo,
    //         driverMobileNumber: data.phoneNo,
    //         masterPlantId: data.masterPlantId,
    //         moduleStatusId: moduleStatusId,
    //         remarks: formData.remarks,
    //         loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
    //         tripSheetNumber: data.tripSheetNo
    //     };

    //     showLoader();
    //     console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
    //     apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
    //         .then((response) => {
    //             const res = response.data;
    //             if (res.success == true) {
    //                 setData([])
    //                 setModuleTypeId("")
    //                 setTruckValue("")
    //                 setIsDisable(false)
    //                 getLoadingData()
    //                 const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
    //                 confirmDialog({
    //                     title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
    //                 })
    //                 form.resetForm()
    //                 setShow(false)
    //             }
    //             else if (res.success == false) {
    //                 confirmDialog({
    //                     title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
    //                 })
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error)
    //             errorToast("Something went wrong, please try again after sometime");
    //         })
    //         .finally((a) => {
    //             hideLoader();
    //         });
    // }

    return (
        <>
            <Col md="4" sm="4" >
                <FormGroup>
                    <Label>Type</Label>
                    <Input placeholder="Type" value={data.moduleType} disabled />
                </FormGroup>
            </Col>
            {data?.subModuleType ?
                <Col md="4" sm="4" >
                    <FormGroup>
                        <Label>Sub Type</Label>
                        <Input placeholder="Type" value={data.subModuleType} disabled />
                    </FormGroup>
                </Col> : null
            }           
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Driver Phone Number</Label>
                    <Input type="text" placeholder="Enter PhoneNo" value={data.phoneNo} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input placeholder="Plant" value={data.plantName} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                </FormGroup>
            </Col>
            <Col sm="12">
                <FormGroup className="d-flex justify-content-end mb-0">
                    <div className="mr-1">
                        <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                            <StopCircle size={16} className="mr-1" />
                            Wait Outside
                        </Button.Ripple>
                    </div>
                    <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
                        <Check size={16} className="mr-1" />
                        Gate In
                    </Button.Ripple>
                </FormGroup>
            </Col>
        </>
    )
}

export default D2RSalesGateIn