import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Delete, Edit, Edit2, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const taColumns = [
    {
        name: "Module Type",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Po Type",
        selector: "type",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "Po Name",
        selector: "name",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Is Weight",
        selector: "isWeight",
        sortable: true,
        minWidth: "50px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.isWeight == 1 ? 'Yes' : 'No'}</span>
            </>
        },
    },
];

const PoTypeList = ({ url, actionRendorer, data, getPoTypeDetails }) => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updatePoType(row)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    {row.isActive == 1 ? <Button.Ripple color="success" size="sm" type="button" onClick={() => inActivePoType(row)}> Active</Button.Ripple> :
                        <Button.Ripple color="warning" size="sm" type="button" onClick={() => inActivePoType(row)}>  In Active</Button.Ripple>}&nbsp;
                </Row>
            );
        },
    };

    const [show, setShow] = useState(false);
    const [isActivePoType, setIsActivePoType] = useState(false);
    const { showLoader, hideLoader } = useLoader();
    const closePoType = () => setIsActivePoType(false);
    const [isActive, setisActive] = useState('')

    const updatePoType = (row) => {
        setShow(true)
        form.setValues({
            poTypeId: row.poTypeId,
            moduleTypeId: { value: row.moduleTypeId, label: row.moduleType },
            type: row.type,
            name: row.name,
            isWeight: { value: row.isWeight, label: row.isWeight == 1 ? 'Yes' : 'No' },
            isReceipt: { value: row.isReceipt, label: row.isReceipt == 1 ? 'Yes' : 'No' },
            isPurchase: { value: row.isPurchase, label: row.isPurchase == 1 ? 'Service' : 'Purchase' },
            invoiceQty: { value: row.invoiceQty, label: row.invoiceQty == 1 ? 'Yes' : 'No' },
            batchCode: { value: row.batchCode, label: row.batchCode == 1 ? 'Yes' : 'No' },
            isActive: row.isActive
        })
    };

    const inActivePoType = (row) => {
        setIsActivePoType(true)
        setisActive(row.isActive)

        form.setValues({
            poTypeId: row.poTypeId,
            moduleTypeId: { value: row.moduleTypeId, label: row.moduleType },
            type: row.type,
            name: row.name,
            isWeight: { value: row.isWeight, label: row.isWeight == 1 ? 'Yes' : 'No' },
            isActive: row.isActive == 1 ? 0 : 1
        })
    };

    const updatePoTypeDetails = () => {

        let formData = form.values

        const postData = {
            poTypeId: formData.poTypeId,
            moduleTypeId: formData.moduleTypeId.moduleTypeId ? formData.moduleTypeId.moduleTypeId : formData.moduleTypeId.value,
            type: formData.type,
            name: formData.name,
            isWeight: formData.isWeight.value,
            isActive: formData.isActive,
            userInfoId: UserDetails.USERID,
            isPurchase:formData.isPurchase.value,
            isReceipt:formData.isReceipt.value,
            invoiceQty:formData.invoiceQty.value,
            batchCode:formData.batchCode.value
        };
        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/updatePoTypeDetails", postData)
        apiPostMethod(apiBaseUrl + "GatePro/Master/updatePoTypeDetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    setShow(false);
                    setIsActivePoType(false);
                    getPoTypeDetails()
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
    });

    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const columns = [...taColumns, actionsCol];
    const purchaseOptions = [
        { value: 1, label: 'Service' },
        { value: 0, label: 'Purchase' }
    ];
    return (
        <div>
            <Card>
                <CardHeader>Po Type List</CardHeader>
                <hr></hr>
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal show={show} centered size="md">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h5>Update PO Type Details</h5>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X onClick={() => setShow(false)} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getModuleType/0/${UserDetails.USERID}`}
                                label={"ModuleType"}
                                form={form}
                                id="moduleTypeId"
                            />
                        </Col>

                        <Col md="12" sm="12">
                            <FormGroup>
                                <CustomTextInput label={"Po Type"} type="text" id="type" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12">
                            <FormGroup>
                                <CustomTextInput label={"Po Name"} type="text" id="name" form={form} />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12">
                            <CustomDropdownInput
                                options={options}
                                label={"Is Weight"}
                                form={form}
                                id="isWeight"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={purchaseOptions}
                                label={"Purchase Type"}
                                form={form}
                                id="isPurchase"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Receipt"}
                                form={form}
                                id="isReceipt"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Invoice Qty"}
                                form={form}
                                id="invoiceQty"
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <CustomDropdownInput
                                options={options}
                                label={"Batch Code"}
                                form={form}
                                id="batchCode"
                            />
                        </Col>
                        <Col md="12" sm="12" >
                            <FormGroup className="d-flex justify-content-center mb-0">
                                <Button.Ripple color="primary" type="button" onClick={updatePoTypeDetails}>
                                    <Edit size={16} /> Update
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal show={isActivePoType} centered size="sm">
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={closePoType} style={{ float: "right" }} size={20}/></Col>
                        <Col md="1" sm="1"></Col>
                        {isActive == 1 ?
                            <Col md="10" sm="10"><Label><h6>Are You Show You Want To In Active</h6></Label></Col> :
                            <Col md="10" sm="10"><Label><h6>Are You Show You Want To Active</h6></Label></Col>
                        }

                        <Col md="4" sm="4"></Col>
                        <Col md="4" sm="4">
                            {isActive == 1 ?
                                <Button.Ripple color="warning" type="button" onClick={updatePoTypeDetails}>
                                    In Active
                                </Button.Ripple> :
                                <Button.Ripple color="success" type="button" onClick={updatePoTypeDetails}>
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

export default PoTypeList;
