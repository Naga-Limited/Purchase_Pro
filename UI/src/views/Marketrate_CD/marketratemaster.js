import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Row, Col, Button, FormGroup,
    CardTitle, CardBody, Card, CardHeader, Modal, ModalHeader, ModalBody,
    Label,
    Input
} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import moment from 'moment';
import TableComponent from '../common/TableComponent';

export const taColumns = [
    {
        name: "Groceries Type",
        selector: "groceries_type",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "UOM",
        selector: "uom",
        sortable: true,
        minWidth: "100px",
    }
];

export const ta1Columns = [
    {
        name: "Groceries Name",
        selector: "groceries_name",
        sortable: true,
        minWidth: "100px",
    },
];

function RMrtRateEntry() {
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);
    const [selectedAddItemRow, setSelectedAddItemRow] = useState(null);
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state?.auth?.userData || {}));

    useEffect(() => {
        callgetotpdata();
    }, []);

    useEffect(() => {
        if (addItemModalOpen && selectedAddItemRow?.mr_id) {
            callgetmarketmasterdetails(selectedAddItemRow.mr_id);
        }
    }, [addItemModalOpen]);

    const callgetotpdata = () => {
        apiPostMethod(apiBaseUrl + `MarketRateCD/MrtRateController/getmarketratemasterdetails`)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    setData(data.results);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."));
    };

    const callgetmarketmasterdetails = (mr_id) => {
        apiPostMethod(apiBaseUrl + `MarketRateCD/MrtRateController/getmarketratemasteritems`, { mr_id })
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    setData1(data.results);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."));
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            entry_date: today,
            GroceriesType: null,
            State: null,
            customGroceriesItem: '',
            customGroceriesType: '',
            customUom: ''
        },
        validationSchema: Yup.object().shape({}),
        onSubmit(values) { }
    });

    const handlesubmitButtonClick = () => {
        const formData = form.values;

        const postData = {
            customGroceriesType: formData.customGroceriesType,
            customUom: formData.customUom,
            created_by: UserDetails.USERID,
        };
        if (!postData.customGroceriesType) {
            errorToast('Please Enter Groceries Type');
            return;
        }

        showLoader();
        apiPostMethod(apiBaseUrl + "MarketRateCD/MrtRateController/InsertMrtRateMasterdetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    ShowToast("Saved Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."))
            .finally(() => hideLoader());
    };

    const handleStatusChange = (row) => {
        const postData = {
            customid: row.mr_id,
            active_status: row.active_status,
            updatedby: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "MarketRateCD/MrtRateController/updateMrtRateMasterdetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    ShowToast("Updated Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."))
            .finally(() => hideLoader());
    };
    const handleStatusChangeforGroceriesItem = (row) => {
        console.log("All groceries data (data1):", data1); // ✅ Entire data1 available here
        console.log("Row clicked:", row); // ✅ The row clicked

        const postData = {
            customid: row.md_id,
            active_status: row.active_status,
            updatedby: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "MarketRateCD/MrtRateController/updateMrtRateMasterGroceriesItem", postData)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    ShowToast("Updated Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."))
            .finally(() => hideLoader());
    };


    const handleView = async (row) => {
        setModalOpen(true);
        showLoader();
        try {
            const res = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/getmarketratedetailsbyid`, {
                groceries_type: row.mr_id,
            });
            if (res.data.success) {
                setSelectedRowData(res.data.results || []);
            } else {
                errorToast("Failed to load grocery rate data");
            }
        } catch (error) {
            errorToast("Error fetching data");
        } finally {
            hideLoader();
        }
    };

    const handleSaveModalChanges = async () => {
        try {
            showLoader();
            const formData = form.values;
            const postData = {
                customGroceriesItem: formData.customGroceriesItem,
                mr_id: selectedAddItemRow?.mr_id,
                created_by: UserDetails.USERID
            };
            const response = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/saveGrocerydetails`, postData);
            if (response.data.success === 1) {
                ShowToast("Saved successfully.");
                setAddItemModalOpen(false);
                callgetotpdata();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast(response.data.error);
            }
        } catch (error) {
            errorToast("Error while saving changes.");
        } finally {
            hideLoader();
        }
    };
     const handleEdit = (row) => {
        setEditFormData({
            mr_id: row.mr_id,
            groceries_type: row.groceries_type,
            uom: row.uom
        });
        setEditModalOpen(true);
    };
     const handleEditSave = async () => {
        showLoader();
        try {
            const response = await apiPostMethod(
                `${apiBaseUrl}MarketRateCD/MrtRateController/updateMrtRateMasterdetailsbyid`,
                {
                    customid: editFormData.mr_id,
                    groceries_type: editFormData.groceries_type,
                    uom: editFormData.uom,
                    updatedby: UserDetails.USERID
                }
            );
            if (response.data.success === 1) {
                ShowToast("Updated Successfully...");
                setEditModalOpen(false);
                callgetotpdata();
            } else {
                errorToast(response.data.error);
            }
        } catch (err) {
            errorToast("Something went wrong, please try again later.");
        } finally {
            hideLoader();
        }
    };

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "300px",
        cell: (row) => (
            <div className="d-flex gap-1">
                <Button.Ripple color="primary" size="sm" onClick={() => handleEdit(row)}>
                    Edit
                </Button.Ripple>&nbsp;

                {row.active_status == 1 ? (
                    <Button.Ripple color="danger" size="sm" onClick={() => handleStatusChange(row)}>
                        Inactive
                    </Button.Ripple>
                ) : (
                    <Button.Ripple color="success" size="sm" onClick={() => handleStatusChange(row)}>
                        Activate
                    </Button.Ripple>
                )}&nbsp;

                <Button.Ripple color="warning" size="sm" onClick={() => {
                    setSelectedAddItemRow(row);
                    setAddItemModalOpen(true);
                }}>
                    Add Item
                </Button.Ripple>&nbsp;
            </div>
        ),
    };

    const actionsCol1 = {
        name: "Actions",
        selector: "Actions",
        minWidth: "200px",
        cell: (row) => (
            <div className="d-flex gap-1">
                {row.active_status == 1 ? (
                    <Button.Ripple color="danger" size="sm" onClick={() => handleStatusChangeforGroceriesItem(row)}>
                        Inactive
                    </Button.Ripple>
                ) : (
                    <Button.Ripple color="success" size="sm" onClick={() => handleStatusChangeforGroceriesItem(row)}>
                        Activate
                    </Button.Ripple>
                )}
            </div>
        ),
    };

    const columns = [...taColumns, actionsCol];
    const columns1 = [...ta1Columns, actionsCol1];

    return (
        <div>
            <Fragment>
                <CardComponent header="Market Rate Master">
                    <Row>
                        <Col md="4" sm="12">
                            <Label for="customGroceriesType">Groceries Type</Label>
                            <Input
                                id="customGroceriesType"
                                name="customGroceriesType"
                                type="text"
                                value={form.values.customGroceriesType}
                                onChange={form.handleChange}
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"UOM"} id="customUom" name="customUom" form={form} type="text" />
                        </Col>
                    </Row>
                    <Col sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end mt-2">
                            <Button.Ripple color="primary" onClick={handlesubmitButtonClick}>
                                Submit
                            </Button.Ripple>
                        </FormGroup>
                    </Col>
                    <HrLine />
                </CardComponent>
            </Fragment>
            <div>
                {/* Edit Modal */}
                <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(!editModalOpen)} centered size="md">
                    <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>Edit Groceries Type</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Groceries Type</Label>
                            <Input
                                type="text"
                                value={editFormData.groceries_type || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, groceries_type: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>UOM</Label>
                            <Input
                                type="text"
                                value={editFormData.uom || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, uom: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup className="d-flex justify-content-end">
                            <Button.Ripple color="success" onClick={handleEditSave}>
                                Save Changes
                            </Button.Ripple>
                        </FormGroup>
                    </ModalBody>
                </Modal>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Market Rate details</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal isOpen={addItemModalOpen} toggle={() => setAddItemModalOpen(!addItemModalOpen)} centered size="lg" >
                <ModalHeader toggle={() => setAddItemModalOpen(!addItemModalOpen)}>Add Groceries Item</ModalHeader>
                <ModalBody>

                    <Row>
                        <Col md="6" sm="12">
                            <Label for="customGroceriesItem">Groceries Item</Label>
                            <Input
                                id="customGroceriesItem"
                                name="customGroceriesItem"
                                type="text"
                                value={form.values.customGroceriesItem}
                                onChange={form.handleChange}
                            />
                        </Col>
                    </Row>
                    <FormGroup className="d-flex justify-content-end mt-2">
                        <Button.Ripple color="success" onClick={handleSaveModalChanges}>
                            Confirm
                        </Button.Ripple>
                    </FormGroup>
                    <Card>
                        <CardHeader>
                            <CardTitle>Groceries Item details</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <TableComponent columns={columns1} data={data1} />
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default RMrtRateEntry;
