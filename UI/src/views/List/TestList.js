import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Delete, Edit, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomTextInput, Yup } from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";

export const taColumns = [
    {
        name: "Name",
        selector: "name",
        sortable: true,
        minWidth: "650px",
    },
];

const TestList = ({ url, actionRendorer, data, gettest }) => {
    const history = useHistory();

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateRejectReason(row.masterRejectReasonId, row.rejectReason)}  ><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    {row.isActive == 1 ? <Button.Ripple color="success" size="sm" type="button" onClick={() => deleteRejectReason(row.masterRejectReasonId, row.rejectReason, row.isActive)}> Active</Button.Ripple> :
                        <Button.Ripple color="warning" size="sm" type="button" onClick={() => deleteRejectReason(row.masterRejectReasonId, row.rejectReason, row.isActive)}>  In Active</Button.Ripple>}&nbsp;
                </Row>
            );
        },
    };

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const [deleteReason, setDeleteReason] = useState(false);
    const closeRejectReason = () => setDeleteReason(false);

    const [isActive, setisActive] = useState()

    const { showLoader, hideLoader } = useLoader();

    const columns = [...taColumns, actionsCol];

    const [masterRejectReasonId, setMasterRejectReasonId] = useState('')
    const [rejectReason, setRejectReason] = useState('')

    const updateRejectReason = (id, rejectReason, isActive) => {
        setShow(true)
        setMasterRejectReasonId(id)
        setRejectReason(rejectReason)
    };

    const deleteRejectReason = (id, rejectReason, isActive) => {
        setDeleteReason(true)
        setMasterRejectReasonId(id)
        setRejectReason(rejectReason)
        setisActive(isActive)
    };

    const onSubmit = () => {
        const FrmData = {
            rejectReason: rejectReason,
            masterRejectReasonId: masterRejectReasonId,
            isActive: isActive == 1 ? 0 : 1,
            modifiedBy: 2
        };

        console.log(JSON.stringify(FrmData))
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateMasterRejectReason", FrmData)
            .then((response) => {
                const { data } = response;

                if (data.success >= 1) {
                    ShowToast("Saved Successfully...");
                    setShow(false);
                    setDeleteReason(false);
                
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


    const rejectReasonValue = (e) => {
        console.log(e.target.value);
        setRejectReason(e.target.value);
    }


    return (
        <div>
            <Card>
                <CardHeader>Test List</CardHeader>
                <hr></hr>
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Update Reject Reason <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="8" sm="8">
                            <FormGroup>
                                <Label>Reject Reason</Label>
                                <Input type="text" defaultValue={rejectReason} onChange={rejectReasonValue} />
                            </FormGroup>
                        </Col>


                        <Col md="4" sm="4" >
                            <label>&nbsp;</label>
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}>
                                    Update
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal show={deleteReason} centered size="sm">
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={closeRejectReason} style={{ float: "right" }} /></Col>
                        <Col md="1" sm="1"></Col>
                        {isActive == 1 ?
                            <Col md="10" sm="10"><Label><h5>Are you sure you want to In Active ?</h5></Label></Col> :
                            <Col md="10" sm="10"><Label><h5>Are you sure you want to Active ?</h5></Label></Col>
                        }

                        <Col md="4" sm="4"></Col>
                        <Col md="4" sm="4">
                            {isActive == 1 ?
                                <Button.Ripple color="warning" type="button" onClick={onSubmit}>
                                    In Active
                                </Button.Ripple> :
                                <Button.Ripple color="success" type="button" onClick={onSubmit}>
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

export default TestList;
