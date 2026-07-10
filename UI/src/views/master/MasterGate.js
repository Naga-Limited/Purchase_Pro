import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiPostMethod, apiGetMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check } from 'react-feather'
import { useLoader } from '../../utility/hooks/useLoader'
import { useEffect } from 'react'
import { useState } from 'react'
import MasterGateList from '../List/MasterGateList'
import { useSelector } from 'react-redux'

const MasterGate = () => {

    const { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            gateName: validation.required({ message: "Please Enter Gate Name", isObject: false }),
            isWB: validation.required({ message: "Please Select Is WB", isObject: true }),
            isMovement: validation.required({ message: "Please Select Is Movement", isObject: true }),
            isConfirm: validation.required({ message: "Please Select Is Confirmation Status", isObject: true }),
        }),
        onSubmit() {},
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const wbOptions = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const movementOptions = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const addMasterGate = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }

        let formData = form.values;

        const FrmData = {
            gateName: formData.gateName,
            gatecode: formData.gatecode,
            OwnWB: formData.isWB.value,
            isMovement: formData.isMovement.value,
            isConfirm: formData.isConfirm.value,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/addMasterGate", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    form.resetForm()
                    getMasterGate()
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

    const [data, setData] = useState();

    const getMasterGate = () => {
        apiGetMethod(apiBaseUrl + "GatePro/Master/getMasterGate")
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
        getMasterGate()
    }, [])

    return (
        <>
            <Card>
                <CardHeader>Add Master Gate</CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Gate Name'} form={form} id="gateName" type="text" />
                            </FormGroup>
                        </Col> 
                        <Col md="4" sm="3">
                            <CustomDropdownInput
                                options={wbOptions}
                                label={"Is WB"}
                                form={form}
                                id="isWB"
                            />
                        </Col>
                        </Row>
                        <Row>
                        <Col md="4" sm="3">
                            <CustomDropdownInput
                                options={movementOptions}
                                label={"Is Movement"}
                                form={form}
                                id="isMovement"
                            />
                        </Col> 
                        <Col md="4" sm="3">
                            <CustomDropdownInput
                                options={movementOptions}
                                label={"Confirmation Status"}
                                form={form}
                                id="isConfirm"
                            />
                        </Col>
                        </Row>
                        <Row>
                        <Col sm="12" md="12">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex mb-0 justify-content-end">
                                <Button.Ripple color="primary" type="button" onClick={addMasterGate}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                        </Row>
                    
                </CardBody>
            </Card>

            <MasterGateList data={data} getMasterGate={getMasterGate} />

        </>
    )
}

export default MasterGate