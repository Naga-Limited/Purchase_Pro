import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useLoader } from '../../utility/hooks/useLoader'
import { useFormik } from 'formik'
import { apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import PoTypeList from '../List/PoTypeLIst'
import { batch, useSelector } from 'react-redux'
import { Check } from 'react-feather'

const PoTypeDetails = () => {

    let { showLoader, hideLoader } = useLoader();
    const [poTypeData, setPoTypeData] = useState();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            moduleTypeId: validation.required({ message: "Please Select Module Type", isObject: true }),
            type: validation.required({ message: "Please Enter Po Type", isObject: false }),
            name: validation.required({ message: "Please Enter Po Name", isObject: false }),
            isWeight: validation.required({ message: "Please Select Is Weight", isObject: true }),
            isPurchase: validation.required({ message: "Please Select Purchase Type", isObject: true }),
            isReceipt: validation.required({ message: "Please Select Receipt", isObject: true }),
            invoiceQty: validation.required({ message: "Please Select Invoice Qty", isObject: true }),
            batchCode: validation.required({ message: "Please Select Batch Code", isObject: true })
        }),
    });

    const addPoTypeDetails = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const FrmData = {
            moduleTypeId: formData.moduleTypeId.value,
            type: formData.type,
            name: formData.name,
            isWeight: formData.isWeight.value,
            userInfoId: UserDetails.USERID,
            isPurchase:formData.isPurchase.value,
            isReceipt:formData.isReceipt.value,
            invoiceQty:formData.invoiceQty.value,
            batchCode:formData.batchCode.value
        };
        
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addPoTypeDetails", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    form.resetForm()
                    getPoTypeDetails()
                } else if (data.success == false) {
                    errorToast(data.message)
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

    const getPoTypeDetails = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeDetails`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoTypeDetails`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoTypeData(data.results)
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
        getPoTypeDetails()
    }, [])


    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];
    const purchaseOptions = [
        { value: 1, label: 'Service' },
        { value: 0, label: 'Purchase' }
    ];
    return (
        <>
            <Card>
                <CardHeader><h5>Po Type Details</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getModuleType/0/${UserDetails.USERID}`}
                                label={"ModuleType"}
                                form={form}
                                id="moduleTypeId"
                            />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Po Type"} type="text" id="type" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Po Name"} type="text" id="name" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Is Weight"}
                                form={form}
                                id="isWeight"
                            />
                        </Col>

                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={purchaseOptions}
                                label={"Purchase Type"}
                                form={form}
                                id="isPurchase"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Receipt"}
                                form={form}
                                id="isReceipt"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Invoice Qty"}
                                form={form}
                                id="invoiceQty"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Batch Code"}
                                form={form}
                                id="batchCode"
                            />
                        </Col>
                        <Col sm="4" md="4">
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={addPoTypeDetails}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <PoTypeList data={poTypeData} getPoTypeDetails={getPoTypeDetails} />
        </>
    )
}

export default PoTypeDetails