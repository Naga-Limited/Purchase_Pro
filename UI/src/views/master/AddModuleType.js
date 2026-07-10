import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check } from 'react-feather'
import ModuleTypeList from '../List/ModuleTypeList'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { RefreshBlock1 } from '../common/RefreshBlock1'
import Select from 'react-select'
import { useLoader } from '../../utility/hooks/useLoader'

const AddModuleType = () => {

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            movementType: validation.required({ message: "Please Select Movement Type", isObject: true }),
            moduleType: validation.required({ message: "Please Enter Module Type", isObject: false })
        }),
        onSubmit() {},
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const addModuleType = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            movementTypeId: formData.movementType.value,
            moduleType: formData.moduleType,
            userInfoId: UserDetails.USERID, 
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addModuleType", postdata)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    getModuleType()
                    form.resetForm()
                }
                else if (data.success == false) {
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

    const [moduleTypeData, setModuleTypeData] = useState([])

    const getModuleType = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setModuleTypeData(data.results)
                }else if(data.success == false){
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getModuleType()
    }, [])

    return (
        <>
            <Card>
                <CardHeader><h5>Module Type Creation</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getMovementType`}
                                label={"Movement Type"}
                                form={form}
                                id="movementType"
                            />                           
                        </Col>

                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Module Type'} form={form} id="moduleType" type="text" />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4">
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={addModuleType}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <ModuleTypeList moduleTypeData={moduleTypeData} getModuleType={getModuleType} />

        </>

    )
}

export default AddModuleType