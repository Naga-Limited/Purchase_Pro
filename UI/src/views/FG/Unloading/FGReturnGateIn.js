import React from 'react'
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { Check, StopCircle } from 'react-feather'
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { apiPostMethod } from '../../../helper/axiosHelper';
import { apiBaseUrl } from '../../../urlConstants';
import { useLoader } from '../../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { CustomTextInput, Yup } from '../../forms/custom-form';
import { useSelector } from 'react-redux';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';
import { useEffect } from 'react';
import { useState } from 'react';

const FGReturnGateIn = ({ data, setReturnRefNo, setSelectedValue, setData, setModuleType, moduleType, getUnLoadingData, Unloading_Gate_in_Vehicle }) => {
    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            remarks: ""
        }),
        gateIn() { },
    });

    const [quantityDetailsData, setQuantityDetailsData] = useState([])

    const getFgSalesReturnInfo = () => {
        console.log(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/0/${data.fgSalesReturnInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/0/${data.fgSalesReturnInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setQuantityDetailsData(data.quantityDetails);
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
            fgSalesReturnInfoId: data.fgSalesReturnInfoId,
            userInfoId: UserDetails.USERID,
            movementType: "Unloading",
            moduleType: moduleType,
            returnRefNo: data.returnRefNo,
            salesInvoiceNo: quantityDetailsData[0].invoiceNo,
            customerName: quantityDetailsData[0].customerName,
            driverMobileNumber: data.driverMobileNumber,
            vehicleNo: data.vehicleNo,
            masterPlantId: data.masterPlantId,
            remarks: formData.remerks,
            moduleStatusId: moduleStatusId,
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
                    setReturnRefNo("")
                    setSelectedValue("")
                    setData("")
                    getUnLoadingData()
                    Unloading_Gate_in_Vehicle()
                    setModuleType('')
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

    useEffect(() => {
        getFgSalesReturnInfo()
    }, [])

    return (
        <>
            <Row>
                {quantityDetailsData.map((invoiceData) => (
                    <Col md="12" sm="12">
                        <Row>
                            {data?.returnRefNo ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Return Ref No</Label>
                                        <Input placeholder="Return Ref No" value={data?.returnRefNo} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Invoice No</Label>
                                    <Input placeholder="Sale Invoice No" value={invoiceData?.invoiceNo} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Customer Name</Label>
                                    <Input placeholder="Customer Name" value={invoiceData?.customerName} disabled />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                ))}

                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Plant</Label>
                        <Input placeholder="Plant" value={data?.plantName} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Driver Mobile Number</Label>
                        <Input placeholder="Driver Mobile Number" value={data?.driverMobileNumber} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                    </FormGroup>
                </Col>

                <Col md="12" sm="12">
                    <br></br>
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
            </Row>
        </>
    )
}

export default FGReturnGateIn