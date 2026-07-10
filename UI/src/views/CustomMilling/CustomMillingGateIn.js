import { useFormik } from 'formik';
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

const CustomMillingGateIn = ({ data, setData, setModuleTypeId, setTruckValue, setIsDisable, getLoadingData, setShow, Unloading_Gate_in_Vehicle, setSelectedValue }) => {


    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: data?.movementTypeId == 1 ? "loading" : "Unloading",
            moduleType: data.moduleType,
            vehicleNo: data.truckNo,
            driverMobileNumber: data.phoneNo,
            masterPlantId: data.masterPlantId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            vanRoute: formData?.vanRoute,
            labourCount: formData?.labourCount,
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            tripSheetNumber: data.tripSheetNo
        };

        if (data?.movementTypeId == 2 && data.moduleTypeId == 31 && data.isApproved == 2) {
            confirmDialog({
                title: `<h5><strong class="text-white">` + 'Please Get Approve From Manager' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        }else if (data.subModuleTypeId == 31 && (postdata.vanRoute == undefined || postdata.vanRoute == '')) {
            confirmDialog({
                title: `<h5><strong class="text-white">` + 'Please Enter Van Route' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        }else if (data.subModuleTypeId == 31 && (postdata.labourCount == undefined || postdata.labourCount == '')) {
            confirmDialog({
                title: `<h5><strong class="text-white">` + 'Please Enter Labour Count' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        }else {
            showLoader();
            console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
            apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
                .then((response) => {
                    const res = response.data;
                    if (res.success == true) {
                        setData([])
                        setModuleTypeId("")
                        setTruckValue("")
                        Unloading_Gate_in_Vehicle()
                        setIsDisable(false)
                        setSelectedValue('')
                        getLoadingData()
                        const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        })
                        form.resetForm()
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
    }

    return (
        <>
            {data.movementTypeId == 1 ?
                <Col md="4" sm="4" >
                    <FormGroup>
                        <Label>Type</Label>
                        <Input placeholder="Type" value={data.moduleType} disabled />
                    </FormGroup>
                </Col> : null
            }
            {data.subModuleTypeId == 30 || data.subModuleTypeId == 31 ?
                <Col md="4" sm="4" >
                    <FormGroup>
                        <Label>Sub Module Type</Label>
                        <Input placeholder="Type" value={data.subModuleType} disabled />
                    </FormGroup>
                </Col> : null
            }
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Vehicle No</Label>
                    <Input type="text" placeholder="Enter Vehicle No" value={data.truckNo} disabled />
                </FormGroup>
            </Col>
            {data.subModuleTypeId == 31?
                <Col md="4" sm="4" >
                    <FormGroup>
                        <CustomTextInput label={"Van Route"} type="text" form={form} id="vanRoute" />
                    </FormGroup>
                </Col> : null
            }
            {data.subModuleTypeId == 31?
                <Col md="4" sm="4" >
                    <FormGroup>
                        <CustomTextInput label={"Labour Count"} type="text" form={form} id="labourCount" />
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

export default CustomMillingGateIn