import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiPostMethod, apiGetMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check } from 'react-feather'
import { useLoader } from '../../utility/hooks/useLoader'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import DefinitionsDetailsList from '../List/DefinitionsDetailsList'

const AddDefinitionsDetails = () => {

    useEffect(() => {
        getDefinitionsList()
    }, [])

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [definitionsData, setDefinitionsData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            definitions: validation.required({ message: "Please Enter Definitions", isObject: true }),
            definitionsName: validation.required({ message: "Please Enter Definitions Name", isObject: false }),
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

        const postData = {
            definitionsId: formData.definitions.value,
            definitionsName: formData.definitionsName,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addDefinitionsDetails", postData);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addDefinitionsDetails", postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    form.resetForm()
                    getDefinitionsList()
                }
                else if (data.success == false) {
                    errorToast(data.message)
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

    const getDefinitionsList = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/0/1`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/0/1`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setDefinitionsData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    console.log(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    return (
        <>
            <Card>
                <CardHeader>Create Definitions</CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getDefinitions`}
                                label={"Definitions"}
                                form={form}
                                id="definitions"
                            />
                        </Col>

                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Definition Name'} form={form} id="definitionsName" type="text" />
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

            <DefinitionsDetailsList definitionsData={definitionsData} setDefinitionsData={setDefinitionsData} getDefinitionsList={getDefinitionsList} />
        </>
    )
}

export default AddDefinitionsDetails