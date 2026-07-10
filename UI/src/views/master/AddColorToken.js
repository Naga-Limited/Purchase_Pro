import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap'
import { CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiPostMethod, apiGetMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check } from 'react-feather'
import { useLoader } from '../../utility/hooks/useLoader'
import { useEffect } from 'react'
import { useState } from 'react'
import ColorTokenList from '../List/ColorTokenList'
import { useSelector } from 'react-redux'

const AddColorToken = () => {

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));


    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            colorToken: validation.required({ message: "Please Enter Color/Token", isObject: false }),
        }),
        onSubmit() { },
    });

    const onSubmit = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const FrmData = {
            colorToken: formData.colorToken,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addColorToken", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    form.resetForm()
                    getColorToken()
                } else if(data.success == false) {
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

    const [data, setData] = useState();

    const getColorToken = () => {
        apiGetMethod(apiBaseUrl + "GatePro/Master/getColorOrToken")
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
        getColorToken()
    }, [])

    return (
        <>
            <Card>
                <CardHeader>Add Color Token</CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Color/Token'} form={form} id="colorToken" type="text" />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4">
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <ColorTokenList data={data} getColorToken={getColorToken} />

        </>

    )
}

export default AddColorToken