import React, { Fragment, useEffect, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import {
    Row, Col, Button, Label, FormGroup, Card, CardHeader, CardBody, Input,
    Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import { Check, Plus, Trash2, ArrowLeft } from "react-feather";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { useAuth } from "../../utility/hooks/useAuth";
import TableComponent from "../common/TableComponent";

const columns = (openModal) => [
    { name: "SALES PLANT", selector: "sales_plant_code", sortable: true, minWidth: "120px" },
    { name: "CUSTOMER", selector: "customer_name", sortable: true, minWidth: "160px" },
    { name: "SALES ORDER NO", selector: "sales_order_no", sortable: true, minWidth: "140px" },
    {
        name: "TOTAL STOCK", selector: "stock", sortable: true, minWidth: "120px",
        cell: (row) => Number(row.stock || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 }),
    },
    {
        name: "REMAINING QTY", selector: "remaining_qty", sortable: true, minWidth: "140px",
        cell: (row) => Number(row.remaining_qty || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 }),
    },
    {
        name: "ACTIONS", selector: "id", hideInExcel: true, minWidth: "140px",
        cell: (row) => (
            <Button.Ripple color="primary" size="sm" type="button" onClick={() => openModal(row)}>
                <Check size={13} /> Complete
            </Button.Ripple>
        ),
    },
];

const emptyAllocation = () => ({ reciving_plant_code: "", stock: "" });

const FiEntryStockCompletionEntry = () => {
    const { showLoader, hideLoader } = useLoader();
    const { userId } = useAuth();
    const [incompleteList, setIncompleteList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [allocations, setAllocations] = useState([emptyAllocation()]);
    const [plantOptions, setPlantOptions] = useState([]);

    const loadPlantOptions = () => {
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getFiEntryStockPlantList", { UserId: userId })
            .then(({ data }) => {
                if (data.success === 1 || data.success === true) {
                    setPlantOptions(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load plant list");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    const loadIncompleteList = () => {
        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getFiEntryStockIncompleteList", {})
            .then(({ data }) => {
                if (data.success === 1 || data.success === true) {
                    setIncompleteList(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load incomplete FI entry stock list");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    useEffect(() => {
        loadIncompleteList();
        loadPlantOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const openModal = (row) => {
        setSelectedEntry(row);
        setAllocations([emptyAllocation()]);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEntry(null);
        setAllocations([emptyAllocation()]);
    };

    const updateAllocation = (index, field, value) => {
        setAllocations((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
    };

    const addAllocationRow = () => setAllocations((prev) => [...prev, emptyAllocation()]);

    const removeAllocationRow = (index) => {
        setAllocations((prev) => prev.filter((_, i) => i !== index));
    };

    const allocatedTotal = allocations.reduce((sum, a) => sum + (Number(a.stock) || 0), 0);
    const remainingQty = Number(selectedEntry?.remaining_qty || 0);

    const submitCompletion = () => {
        if (allocations.some((a) => !a.reciving_plant_code || !a.stock)) {
            errorToast("Please fill in all receiving plant and stock fields");
            return;
        }
        if (allocatedTotal > remainingQty) {
            errorToast("Allocated stock cannot exceed the remaining quantity");
            return;
        }

        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/insertFiEntryStockCompletion", {
            sourceId: selectedEntry.id,
            allocations,
        })
            .then(({ data }) => {
                if (data.success === 1 || data.success === true) {
                    ShowToast("FI Entry Stock completion saved");
                    closeModal();
                    loadIncompleteList();
                } else {
                    errorToast(data.message || "Failed to save completion");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h5 style={{ margin: 0 }}>FI Entry Stock - Complete Plant Allocation</h5>
                </CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns(openModal)} data={incompleteList} />
                </CardBody>
            </Card>

            <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
                <ModalHeader toggle={closeModal}>
                    Complete Entry — Sales Order {selectedEntry?.sales_order_no}
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Sales Plant</Label><Input type="text" value={selectedEntry?.sales_plant_code ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Customer</Label><Input type="text" value={selectedEntry?.customer_name ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Remaining Qty</Label><Input type="text" value={remainingQty} disabled /></FormGroup>
                        </Col>
                    </Row>

                    <h6 className="text-primary">Receiving Plant Allocations</h6>
                    {allocations.map((allocation, index) => (
                        <Row key={index} style={{ alignItems: "flex-end" }}>
                            <Col md="5" sm="6">
                                <FormGroup>
                                    <Label>Receiving Plant Code</Label>
                                    <Input
                                        type="select"
                                        value={allocation.reciving_plant_code}
                                        onChange={(e) => updateAllocation(index, "reciving_plant_code", e.target.value)}
                                    >
                                        <option value="">Select Plant</option>
                                        {plantOptions.map((plant) => (
                                            <option key={plant.value} value={plant.value}>
                                                {plant.value} - {plant.label}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="5" sm="6">
                                <FormGroup>
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        value={allocation.stock}
                                        onChange={(e) => updateAllocation(index, "stock", e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="2" sm="12">
                                <FormGroup>
                                    <Button.Ripple
                                        color="danger"
                                        size="sm"
                                        type="button"
                                        outline
                                        disabled={allocations.length === 1}
                                        onClick={() => removeAllocationRow(index)}
                                    >
                                        <Trash2 size={13} />
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                        </Row>
                    ))}
                    <Button.Ripple color="secondary" outline size="sm" type="button" onClick={addAllocationRow}>
                        <Plus size={13} /> Add Row
                    </Button.Ripple>

                    <p style={{ marginTop: "12px" }}>
                        Allocated: <strong>{allocatedTotal}</strong> / Remaining: <strong>{remainingQty}</strong>
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button.Ripple outline color="secondary" type="button" onClick={closeModal}>
                        <ArrowLeft size={14} /> Close
                    </Button.Ripple>
                    <Button.Ripple color="primary" type="button" onClick={submitCompletion}>
                        <Check size={14} /> Save Completion
                    </Button.Ripple>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default FiEntryStockCompletionEntry;
