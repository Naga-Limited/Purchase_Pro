import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import CameraDetailsList from '../List/CameraDetailsList'
import { apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { useLoader } from '../../utility/hooks/useLoader'
import { Check } from 'react-feather'
import { useSelector } from 'react-redux'

const AddCameraDetails = () => {

    const { showLoader, hideLoader } = useLoader();
    const [allData, setAllData] = useState();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            masterPlantId: validation.required({ message: "Please Select Plant", isObject: true }),
            username: validation.required({ message: "Please Enter User Name", isObject: false }),
            cameraName: validation.required({ message: "Please Enter Camera Name", isObject: false }),
            password: validation.required({ message: "Please Enter Password", isObject: false }),
            apiUrl: validation.required({ message: "Please Enter Url", isObject: false }),
        }),
        onSubmit(values) { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onSubmit = () => {

        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }

        let formData = form.values;

        const postData = {
            masterPlantId: formData.masterPlantId.ID,
            cameraName: formData.cameraName,
            apiUrl: formData.apiUrl,
            username: formData.username,
            password: formData.password,
            isPrint: formData.isPrint.value,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addCameraDetails", postData);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addCameraDetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    form.resetForm();
                    getCameraDetails();
                }
                else if (data.success == false) {
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

    const getCameraDetails = () => {
        console.log(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/0`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/0`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setAllData(data.results)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getCameraDetails()
    }, [])

    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];   

    return (
        <>
            <Card>
                <CardHeader><h5>Camera Details Creation</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}marketdata/master/getPlants`}
                                label={"Plant"}
                                form={form}
                                id="masterPlantId"
                            />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Camera Name"} type="text" id="cameraName" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Url"} type="textarea" id="apiUrl" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"User Name"} type="text" id="username" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Password"} form={form} id="password" type="password" />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <CustomDropdownInput
                                options={options}
                                label={"Is Print"}
                                form={form}
                                id="isPrint"
                            />                          
                        </Col>

                        <Col sm="2" md="2">                            
                            <FormGroup className='mt-2'>
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}> <Check size={16} /> Save </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {allData ? <CameraDetailsList getCameraDetails={getCameraDetails} allData={allData} /> : null}

        </>
    )
}

export default AddCameraDetails