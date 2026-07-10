import { Card, CardHeader, CardBody, Button, FormGroup, Col, Row, Input, Label } from "reactstrap";
import React from "react";
import TableComponent from "../common/TableComponent";
import { Edit, X } from "react-feather";
import { useState } from "react";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomTextInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

export const taColumns = [
    {
        name: "Movement Type",
        selector: "movementType",
        sortable: true,
        minWidth: "300px",
    },
    {
        name: "Module Type",
        selector: "moduleType",
        sortable: true,
        minWidth: "300px",
    }
];

const ModuleTypeList = ({ moduleTypeData, getModuleType }) => {

    const actionsCol = {
        name: "Actions",
        sortable: true,
        minWidth: "60px",
        cell: (row) => {
            return (
                <>
                    <Button.Ripple color="primary" size="sm" className='ml-1' onClick={() => editModuleType(row)}><Edit size={16} /> Edit</Button.Ripple>

                    {row.isActive == 1 ? <Button.Ripple color="success" size="sm" className='ml-1' onClick={() => activeModuleType(row)}> Active</Button.Ripple> : <Button.Ripple color="warning" size="sm" className='ml-1' onClick={() => activeModuleType(row)}>  In Active</Button.Ripple>}
                </>
            );
        },
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
    });

    const [show, setShow] = useState(false);
    const [active, setActive] = useState(false);

    const inActive = () => setActive(false);
    const closeRemarksModal = () => setShow(false);

    const { showLoader, hideLoader } = useLoader();

    const [moduleTypeId, setModuleTypeId] = useState('')
    const [moduleType, setModuleType] = useState('')
    const [isActive, setIsActive] = useState('')

    const editModuleType = (data) => {
        setShow(true)
        setModuleTypeId(data.moduleTypeId)
        setModuleType(data.moduleType)
    };

    const activeModuleType = (data) => {
        setActive(true)
        setModuleTypeId(data.moduleTypeId)
        setModuleType(data.moduleType)
        setIsActive(data.isActive)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateModuleType = () => {

        const postData = {
            moduleTypeId: moduleTypeId,
            moduleType: moduleType,
            isActive: isActive == 1 ? 0 : 1,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateModuleType", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    setShow(false);
                    setActive(false)
                    getModuleType()
                }
                else if (data.success == false) {
                    errorToast(data.message)
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

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Module Type Creation</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={moduleTypeData} />
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>update Module Type <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="8" sm="8">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <Input
                                    value={moduleType}
                                    onChange={(e) => setModuleType(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4" >
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={updateModuleType}>
                                    Update
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal show={active} centered size="sm">
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={inActive} style={{ float: "right" }} /></Col>
                        <Col md="1" sm="1"></Col>
                        {isActive == 1 ?
                            <Col md="10" sm="10"><Label><h6>Are You Show You Want To In Active</h6></Label></Col> :
                            <Col md="10" sm="10"><Label><h6>Are You Show You Want To Active</h6></Label></Col>
                        }
                        <Col md="4" sm="4"></Col>
                        <Col md="4" sm="4">
                            {isActive == 1 ?
                                <Button.Ripple color="warning" type="button" onClick={updateModuleType}>
                                    In Active
                                </Button.Ripple> :
                                <Button.Ripple color="success" type="button" onClick={updateModuleType}>
                                    Active
                                </Button.Ripple>
                            }
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ModuleTypeList;
