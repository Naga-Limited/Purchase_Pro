import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { useLoader } from '../../utility/hooks/useLoader'
import { Check } from 'react-feather'
import { useSelector } from 'react-redux'
import AutoMailDetailsList from '../List/AutoMailDetailsList'
import Select from 'react-select'

const AddAutoMail = () => {

    const { showLoader, hideLoader } = useLoader();
    const [allData, setAllData] = useState();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // to_mail: validation.required({ message: "Please Enter To Mail", isObject: true }),
            // cc_mail: validation.required({ message: "Please Enter CC Mail", isObject: false }),
            // bcc_mail: validation.required({ message: "Please Enter BCC Mail", isObject: false }),
            // plant_id: validation.required({ message: "Please Enter Plant ID", isObject: false }),
            // isActive: validation.required({ message: "Please Select Activation", isObject: false }),
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
            to_mail: formData.to_mail,
            cc_mail: formData.cc_mail,
            bcc_mail: formData.bcc_mail,
            plant_id: formData.plant_id,
            isActive: formData.isActive.value,
            division: formData.division,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "AutoMailMaster/insertAutoMail", postData);
        apiPostMethod(apiBaseUrl + "AutoMailMaster/insertAutoMail", postData)
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
        console.log(apiBaseUrl + `AutoMailMaster/getMailDetails`);
        apiPostMethod(apiBaseUrl + `AutoMailMaster/getMailDetails`)
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
        getMasterGate()
    }, [])

    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];   
    const [masterGate, setMasterGate] = useState([]);  
    const [gate, setGate] = useState("");
    const [masterGateId, setMasterGateId] = useState('')

    const getMasterGate = () => {
        apiGetMethod(apiBaseUrl + "GatePro/Master/getMasterGate")
          .then((response) => {
            const { data } = response;
            if (data.success >= 1) {
              setMasterGate(data.results)
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
    const selectGate = (e) => {
        setGate([e]);
        setMasterGateId(e.value)
    }
    return (
        <>
            <Card>
                <CardHeader><h5>Add Auto Mail</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"To Mail"} type="textarea" id="to_mail" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"CC Mail"} type="textarea" id="cc_mail" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"BCC Mail"} type="textarea" id="bcc_mail" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Plant ID"} type="textarea" id="plant_id" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Division"} type="text" id="division" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Is Active"}
                                form={form}
                                id="isActive"
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

            {allData ? <AutoMailDetailsList getCameraDetails={getCameraDetails} allData={allData} /> : null}

        </>
    )
}

export default AddAutoMail