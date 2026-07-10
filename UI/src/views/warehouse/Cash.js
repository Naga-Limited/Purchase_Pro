import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { useLoader } from '../../utility/hooks/useLoader'
import { ArrowLeft, Check } from 'react-feather'
import { useSelector } from 'react-redux'
import { useParams } from "react-router";
import { useEffect } from 'react'
import { useHistory } from "react-router-dom";

const Cash = () => {

    const { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState('');
    let { id } = useParams();
    const history = useHistory();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onSubmit = () => {
        showLoader();

        let formData = form.values;

        const FrmData = {
            loadingAndUnloadingInfoId: data.loadingAndUnloadingInfoId,
            moduleTypeId: data.moduleTypeId,
            personName: data.personName,
            phoneNo: data.phoneNo,
            remarks: formData.remarks ? formData.remarks : null,
            masterPlantId: data.masterPlantId,
            invoiceNo: data.cashInvoiceNo,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addCashInfo", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success >= 1) {
                    setData("")
                    form.resetForm()
                    ShowToast("Saved Successfully...");
                    history.push("/VA");
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const getCashInfo = () => {
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${id}/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${id}/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    console.log(data.results[0].plantName);
                    setData(data.results[0])
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getCashInfo()
    }, [])

    const redirect = () => {
        history.push("/VA");
    }

    return (
        <>
            <Card>
                <CardHeader><h5>Cash</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <Input type="text" placeholder="Module Type" value={data.moduleType} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Person Name</Label>
                                <Input type="text" placeholder="Person Name" value={data.personName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Phone No</Label>
                                <Input type="text" placeholder="Phone No" value={data.phoneNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Invoice No</Label>
                                <Input type="text" placeholder="Invoice No" value={data.cashInvoiceNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remarks"} type="text" id="remarks" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                                    <ArrowLeft size={16} /> Back
                                </Button.Ripple>
                            </FormGroup>
                        </Col>

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}> <Check size={16} /> Gate In </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <div style={{ marginBottom: "160px" }}></div>
        </>
    )
}

export default Cash