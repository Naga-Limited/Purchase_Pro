import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { Master_Url, apiBaseUrl } from '../../urlConstants'
import { Form, useFormik } from 'formik'
import { CardComponent } from '../common/CardComponent'
import NumberOnlyInput from '../../@core/components/number-input/number-input'
import Master_incolist from '../List/Master_incolist'
import { apiPostMethod, apiGetMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check } from 'react-feather'
import ModuleTypeList from '../List/ModuleTypeList'
import { useLoader } from '../../utility/hooks/useLoader'
import RejectReasonList from '../List/RejectReasonList'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const AddRejectReason = () => {

    const { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rejectReason: validation.required({ message: "Please Enter Reject Reason", isObject: false })
        }),
        onSubmit() {},
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const addMasterRejectReason = () => {
        
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const FrmData = {
            rejectReason: formData.rejectReason,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addMasterRejectReason", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    getRejectReason()
                    form.resetForm()
                }else{
                    errorToast(data.message);
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

    const [data, setData] = useState();

    const getRejectReason = () => {
        apiGetMethod(apiBaseUrl + "GatePro/Master/getMasterRejectReason")
            .then((response) => {
                const { data } = response;
                if (data.success >= 1) {
                    setData(data.results)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(
                hideLoader()
            )
    }

    useEffect(() => {
        getRejectReason()
    }, [])

    return (
        <>
            <Card>
                <CardHeader>Add Reject Reason</CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Reject Reason'} form={form} id="rejectReason" type="text" />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4">
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={addMasterRejectReason}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <RejectReasonList data={data} getRejectReason={getRejectReason} />

        </>

    )
}

export default AddRejectReason