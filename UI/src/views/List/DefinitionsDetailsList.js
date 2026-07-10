import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { Edit, X } from "react-feather";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../forms/custom-form";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useFormik } from "formik";
import { useEffect } from "react";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { useLoader } from "../../utility/hooks/useLoader";
import { Modal } from "react-bootstrap";


export const taColumns = [
    {
        name: "Definitions",
        selector: "definitions",
        sortable: true,
        minWidth: "380px",
    },
    {
        name: "Definition Name",
        selector: "definitionsName",
        sortable: true,
        minWidth: "380px",
    },
];

const DefinitionsDetailsList = ({ actionRendorer, definitionsData, setDefinitionsData, getDefinitionsList }) => {

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
                        <Button.Ripple color="success" className='ml-1' size="sm" type="button" onClick={() => isActiveDefinitionsDetails(row)}> Active</Button.Ripple> :
                        <Button.Ripple color="warning" className='ml-1' size="sm" type="button" onClick={() => isActiveDefinitionsDetails(row)}>In Active</Button.Ripple>
                    }
                </Row>
            );
        },
    };

    useEffect(() => {
        getDefinitions()
    }, [])

    const [definitionsId, setDefinitionsId] = useState([])
    const [selectedDefinitionsData, setSelectedDefinitionsData] = useState([])

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

    const onActivate = (row) => {
        console.log(row);
        setShow(true)
        form.setValues({
            definitionsListId: row.definitionsListId,
            definitionsId: row.definitionsId,
            definitionsName: row.definitionsName,
            definitions_value: row.definitionsvalues ?? 0, 
        })
    }

    const isActiveDefinitionsDetails = (row) => {
        setShowIsActive(true)
        form.setValues({
            definitionsListId: row.definitionsListId,
            definitionsId: row.definitionsId,
            definitionsName: row.definitionsName,
            definitions_value: row.definitionsvalues ?? 0, 
        })
        setIsActive(row.isActive)
    }

    const getDefinitions = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitions`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getDefinitions`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setDefinitions(data.results)
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

    const selectDefinitions = (e) => {
        setDefinitionsId([e])

        console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/${e.value}/1`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/${e.value}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setSelectedDefinitionsData(data.results)
                    getDefinitionsList()
                    setDefinitionsData([])
                    setDefinitionsId('')
                    getDefinitions()
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

    const updateDefinitionsDetails = () => {

        let formData = form.values;

        const postData = {
            definitionsListId: formData.definitionsListId,
            definitionsId: formData.definitionsId,
            definitionsName: formData.definitionsName,
            definitionsValue: formData.definitions_value,
            isActive: isActive == 1 ? 0 : 1,
            userInfoId: UserDetails.USERID,
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/updateDefinitionsDetails", postData);
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateDefinitionsDetails", postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    form.resetForm()
                    getDefinitionsList()
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

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Definitions List</h5></CardHeader>
                <hr />
                <CardBody>
                    <Col md="4" sm="12">
                        <Label>Select Definitions</Label>
                        <ReactSelect
                            options={definitions}
                            onChange={selectDefinitions}
                        />
                    </Col>
                    <TableComponent columns={columns} data={selectedDefinitionsData != '' ? selectedDefinitionsData : definitionsData} />
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Update Definitions Details <X onClick={() => setShow(false)} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="9" sm="9">
                            <FormGroup>
                                <CustomTextInput label={'Definition Name'} form={form} id="definitionsName" type="text" />
                            </FormGroup>
                        </Col>
                        <Col md="9" sm="9">
                            <FormGroup>
                                <CustomTextInput label={'Definition Value'} form={form} id="definitions_value" type="text" />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2" >
                            <FormGroup className='mt-2'>
                                <Button color="primary" type="button" onClick={updateDefinitionsDetails}>
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
                            <Button.Ripple color={isActive == 1 ? 'warning' : 'success'} type="button" onClick={updateDefinitionsDetails}>
                                {isActive == 1 ? 'In Active' : 'Active'}
                            </Button.Ripple>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DefinitionsDetailsList;
