import React, { Fragment } from 'react'
import { Check, Search, StopCircle } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../../urlConstants';
import { apiPostMethod } from '../../../helper/axiosHelper';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../../helper/appHelper';
import { CustomTextInput, Yup } from '../../forms/custom-form';
import { useLoader } from '../../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useState } from 'react';

const SSAndPmLoadingGateIn = ({ data, setData, setModuleTypeId, setTruckValue, setIsDisable, getLoadingData, setShow }) => {

    const [poData, setPoData] = useState([])

    const getPurchaseOrder = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${data.loadingAndUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${data.loadingAndUnloadingInfoId}`)
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

    useEffect(() => {
        getPurchaseOrder()
    }, [])

    let { showLoader, hideLoader } = useLoader();

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
            userInfoId: UserDetails.USERID,
            movementType: "Loading",
            moduleType: data.moduleType,
            vehicleNo: data.truckNo,
            driverMobileNumber: data.phoneNo,
            masterPlantId: data.masterPlantId,
            moduleStatusId: moduleStatusId,
            tripSheetNumber: data.tripSheetNo,
            remarks: formData.remarks,
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            stoPoNo: poData[0].poNumber
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    setData([])
                    setModuleTypeId("")
                    setTruckValue("")
                    getLoadingData()
                    setIsDisable(false)
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

    return (
        <>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Type</Label>
                    <Input type="text" placeholder="Enter Type" value={data.moduleType} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Driver Phone Number</Label>
                    <Input type="text" placeholder="Enter PhoneNo" value={data.phoneNo} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remarks"} form={form} id="remarks" />
                </FormGroup>
            </Col>

            {/* {poData != '' ? <>
                <Col md="12" sm="12"><hr></hr></Col>
                <Col md="12" sm="12">
                    <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                </Col>

                {poData?.map((poDetails) => (<>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>PO Number</Label>
                            <Input type="text" placeholder="Enter PO Number" value={poDetails?.poNumber} disabled />
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
                            <Label>Invoice No</Label>
                            <Input type="text" placeholder="Enter Invoice No" value={poDetails?.invoiceNo} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>Vendor Name</Label>
                            <Input type="text" placeholder="Enter Vendor Name" value={poDetails?.vendorName} disabled />
                        </FormGroup>
                    </Col>
                </>))} </> : null
            } */}
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
        </>
    )
}

export default SSAndPmLoadingGateIn