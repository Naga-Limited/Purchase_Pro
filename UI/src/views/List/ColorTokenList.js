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
        name: "Color Token",
        selector: "colorToken",
        sortable: true,
        minWidth: "650px",
    },
];

const ColorTokenList = ({ url, actionRendorer, data, getColorToken }) => {
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
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateColorToken(row.masterColorTokenId, row.colorToken, row.isActive)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    { row.isActive == 1 ? <Button.Ripple color="success" size="sm" type="button" onClick={() => isActiveColorToken(row.masterColorTokenId, row.colorToken, row.isActive)}> Active</Button.Ripple> :
                     <Button.Ripple color="warning" size="sm" type="button" onClick={() => isActiveColorToken(row.masterColorTokenId, row.colorToken, row.isActive)}>  In Active</Button.Ripple>}&nbsp;
                </Row>
            );
        },
    };

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const [deleteColorToken, setdeleteColorToken] = useState(false);
    const closeColorToken = () => setdeleteColorToken(false);
    
    const [isActive, setisActive] = useState()

    const { showLoader, hideLoader } = useLoader();

    const columns = [...taColumns, actionsCol];

    const [masterColorTokenId, setmasterColorTokenId] = useState('')
    const [colorToken, setcolorToken] = useState('')

    const updateColorToken = (updateColorToken, colorToken, isActive) => {
        setShow(true)
        setmasterColorTokenId(updateColorToken)
        setcolorToken(colorToken)
    };

    const isActiveColorToken = (id, colorToken, isActive) => {
        setdeleteColorToken(true)
        setmasterColorTokenId(id)
        setcolorToken(colorToken)
        setisActive(isActive)
    };

    const onSubmit = () => {
        const FrmData = {
            masterColorTokenId: masterColorTokenId,
            colorToken: colorToken,            
            isActive: isActive == 1 ? 0 : 1,
            userInfoId: 2
        };

        console.log(JSON.stringify(FrmData))
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateColorToken", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    setShow(false);
                    setdeleteColorToken(false);
                    getColorToken()
                } 
                else if (data.success == false){
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

    const colorTokenValue = (e) => {
        console.log(e.target.value);
        setcolorToken(e.target.value);
    }


    return (
        <div>
            <Card>
                <CardHeader>Corlor Token List</CardHeader>
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
                                <Modal.Title>Update Color Token <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="8" sm="8">
                            <FormGroup>
                                <Label>Color Token</Label>
                                <Input type="text" defaultValue={colorToken} onChange={colorTokenValue} />
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

            <Modal show={deleteColorToken} centered size="sm">
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={closeColorToken} style={{ float: "right" }} /></Col>
                        <Col md="1" sm="1"></Col>
                        <Col md="10" sm="10"><Label><h6>Are You Show You Want To Delete</h6></Label></Col>

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

export default ColorTokenList;
