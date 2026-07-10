import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../forms/custom-form'
import { apiBaseUrl } from '../../urlConstants'
import { useFormik } from 'formik'
import { apiPostMethod, apiGetMethod } from '../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { Check, Edit, X } from 'react-feather'
import { useLoader } from '../../utility/hooks/useLoader'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import TableComponent from '../common/TableComponent'
import { Modal } from 'react-bootstrap'

export const taColumns = [
    {
        name: "Definitions",
        selector: "definitions",
        sortable: true,
        minWidth: "780px",
    }
];

const AddDefinitions = ({ actionRendorer }) => {

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "190px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple className='ml-1' color="primary" size="sm" type="button" onClick={() => onActivate(row)}><Edit size={16} /> Edit</Button.Ripple>

                    {row.isActive == 1 ?
                        <Button.Ripple color="success" className='ml-1' size="sm" type="button" onClick={() => isActiveDefinitions(row)}> Active</Button.Ripple> :
                        <Button.Ripple color="warning" className='ml-1' size="sm" type="button" onClick={() => isActiveDefinitions(row)}>In Active</Button.Ripple>
                    }
                </Row>
            );
        },
    };

    const columns = [...taColumns, actionsCol];

    useEffect(() => {
        getDefinitions()
    }, [])

    const [definitions, setDefinitions] = useState([])
    const [isActive, setIsActive] = useState('')

    const [show, setShow] = useState(false);
    const [showIsActive, setShowIsActive] = useState(false);

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            definitions: validation.required({ message: "Please Enter Definitions", isObject: false }),
        }),
        onSubmit() { },
    });

    const editForm = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            definitions: validation.required({ message: "Please Enter Definitions", isObject: false }),
        }),
        onSubmit() { },
    });

    const onActivate = (row) => {
        setShow(true)
        editForm.setValues({
            definitionsId: row.definitionsId,
            definitions: row.definitions
        })
    }

    const isActiveDefinitions = (row) => {
        setShowIsActive(true)
        editForm.setValues({
            definitionsId: row.definitionsId,
            definitions: row.definitions
        })
        setIsActive(row.isActive)
    }

    const addDefinitions = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postData = {
            definitions: formData.definitions,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/Definitions", postData);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addDefinitions", postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    form.resetForm()
                    getDefinitions()
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

    const updateDefinitions = () => {

        let formData = editForm.values;

        const postData = {
            definitionsId: formData.definitionsId,
            definitions: formData.definitions,
            isActive: isActive == 1 ? 0 : 1,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/updateDefinitions", postData);
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateDefinitions", postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    form.resetForm()
                    getDefinitions()
                    setShow(false)
                    setShowIsActive(false)
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

    const getDefinitions = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitions/1`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getDefinitions/1`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setDefinitions(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
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
                <CardHeader>Definitions Creation</CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4" >
                            <FormGroup>
                                <CustomTextInput label={'Definition'} form={form} id="definitions" type="text" />
                            </FormGroup>
                        </Col>

                        <Col sm="4" md="4">
                            <FormGroup className='mt-2'>
                                <Button.Ripple color="primary" type="button" onClick={addDefinitions}> <Check size={16} /> Submit </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Definitions List</CardHeader>
                <hr></hr>
                <CardBody>
                    <TableComponent columns={columns} data={definitions} />
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Update Definitions <X onClick={() => setShow(false)} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="9" sm="9">
                            <FormGroup>
                                <CustomTextInput label={'Definition'} form={editForm} id="definitions" type="text" />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2" >
                            <FormGroup className='mt-2'>
                                <Button color="primary" type="button" onClick={updateDefinitions}>
                                    Update
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal show={showIsActive} centered size="sm">
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={() => setShowIsActive(false)} style={{ float: "right" }} /></Col>
                        <Col md="1" sm="1"></Col>
                        <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>Are you sure you want to {isActive == 1 ? 'In Active' : 'Active'}</h5></Label></Col>

                        <Col md="4" sm="4"></Col>
                        <Col md="4" sm="4">
                            <Button.Ripple color={isActive == 1 ? 'warning' : 'success'} type="button" onClick={updateDefinitions}>
                                {isActive == 1 ? 'In Active' : 'Active'}
                            </Button.Ripple>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default AddDefinitions