import React, { useState } from 'react'
import { Button, Col, FormGroup, Input, Label } from 'reactstrap'
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { CustomTextInput, Yup, validation } from '../forms/custom-form';
import { useLoader } from '../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../urlConstants';
import { Check, StopCircle } from 'react-feather';
import { useEffect } from 'react';

const PurchaseGateIn = ({ data, getUnLoadingData, reset }) => {

    useEffect(() => {
        getPurchaseOrder(data?.loadingAndUnloadingInfoId)
    }, [])

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const [poData, setPoData] = useState([])

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message);
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
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            masterPlantId: data.werks,
            userInfoId: UserDetails.USERID,
            movementType: "Unloading",
            moduleType: data.moduleType,
            vehicleNo: data.truckNo,
            driverMobileNumber: data.phoneNo,
            tripSheetNumber: data.tripSheetNumber,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks ? formData.remarks : null,
            isWeight: data.isWeight
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
                    reset()
                    getUnLoadingData()
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
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Type</Label>
                    <Input placeholder="Po Number" value={data?.moduleType} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant Name</Label>
                    <Input type="text" placeholder="Enter Invoice No" value={data?.plantName} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Driver Phone No</Label>
                    <Input placeholder="Invoice No" value={data?.phoneNo} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                </FormGroup>
            </Col>

            <Col md="12" sm="12"><hr></hr></Col>

            <Col md="12" sm="12">
                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
            </Col>

            {poData?.map((poDetails) => (<>
                <Col md="3" sm="3">
                    <FormGroup>
                        <Label>PO NUMBER</Label>
                        <Input placeholder="Po Number" value={poDetails?.poNumber} disabled />
                    </FormGroup>
                </Col>
                <Col md="3" sm="3">
                    <FormGroup>
                        <Label>PO Type</Label>
                        <Input type="text" placeholder="Enter Invoice No" value={poDetails?.name} disabled />
                    </FormGroup>
                </Col>
                <Col md="3" sm="3">
                    <FormGroup>
                        <Label>INVOICE NO</Label>
                        <Input placeholder="Invoice No" value={poDetails?.invoiceNo} disabled />
                    </FormGroup>
                </Col>
                < Col md="3" sm="3" >
                    <FormGroup>
                        <Label>VENDOR NAME</Label>
                        <Input placeholder="Vendor Name" value={poDetails?.vendorName} disabled />
                    </FormGroup>
                </Col>
            </>))}
            <Col sm="12" md="12">
                <FormGroup className="d-flex justify-content-end mb-0 mt-2">
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
        </>
    )
}

export default PurchaseGateIn