import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, CustomTextInputMail, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { useLoader } from '../../utility/hooks/useLoader'
import { Check } from 'react-feather'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import UnmanWBDetailsList from '../List/UnmanWBDetailsList'

const AddUnmanWBMaster = () => {

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
            systemNo: formData.systemNo,
            printerName: formData.printerName,
            portName: formData.portName,
            plantCode: formData.plantCode,
            status: formData.isActive.value,
            userInfoId: UserDetails.USERID,
            weighbridgeName: formData.weighbridgeName,
            userId: formData.userId,
        };

        showLoader();
        console.log(apiBaseUrl + "AutoMailMaster/insertUnmanWBMaster", postData);
        apiPostMethod(apiBaseUrl + "AutoMailMaster/insertUnmanWBMaster", postData)
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
        console.log(apiBaseUrl + `AutoMailMaster/getUnmanWBMasterDetails`);
        apiPostMethod(apiBaseUrl + `AutoMailMaster/getUnmanWBMasterDetails`)
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
                <CardHeader><h5>Unman WB Master</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"system No"} type="text" id="systemNo" form={form} />
                            </FormGroup>
                        </Col>
                         <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Weighbridge Name"} type="text" id="weighbridgeName" form={form} />
                            </FormGroup>
                        </Col>
                         <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"User ID"} type="text" id="userId" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Port Name"} type="text" id="portName" form={form} />
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
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInputMail label={"Printer Name"} type="textarea" id="printerName" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Plant ID"} type="textarea" id="plantCode" form={form} />
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">                            
                            <FormGroup className='mt-2'>
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}> <Check size={16} /> Save </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {allData ? <UnmanWBDetailsList getCameraDetails={getCameraDetails} allData={allData} /> : null}

        </>
    )
}

export default AddUnmanWBMaster