import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    Label,
    Input,
    Col,
    Row,
} from "reactstrap";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

/* ================= TABLE COLUMNS ================= */
const taColumns = [
    { name: "Bulker No", selector: "bulkerNo", sortable: true },
    { name: "Empty Weight (Kgs)", selector: "bulkerEmptyWeight", sortable: true },
    { name: "Truck Capacity (Kgs)", selector: "bulkerCapacity", sortable: true },
];

const CBulkerMaster = () => {
    /* ================= STATES ================= */
    const [tableData, setTableData] = useState([]);

    // Add Form
    const [bulkerNo, setBulkerNo] = useState("");
    const [emptyWeight, setEmptyWeight] = useState("");
    const [truckCapacity, setTruckCapacity] = useState("");

    // Modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Modal form fields
    const [editBulkerNo, setEditBulkerNo] = useState("");
    const [editEmptyWeight, setEditEmptyWeight] = useState("");
    const [editTruckCapacity, setEditTruckCapacity] = useState("");

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) =>
        state?.auth ? state.auth.userData : {}
    );

     const showErrorDialog = (msg) => {
        confirmDialog({
            title: `
                <div style="font-size:14px;">
                    <strong class="text-white">
                        ${msg}
                    </strong>
                </div>
            `,
            cancelButton: false,
            confirmButton: false,
            confirmText: false,
            background: "#dc3545", // red
            size: "sm",
        });
    };
    /* ================= LOAD TABLE DATA ================= */
    useEffect(() => {
        loadTableData();
    }, []);

    const loadTableData = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Master/getBulkermasterlist"
            );

            if (res?.data?.success) {
                setTableData(res.data.results || []);
            } else {
                errorToast("Failed to fetch bulker list");
            }
        } catch {
            errorToast("Something went wrong");
        } finally {
            hideLoader();
        }
    };

    /* ================= ADD BULKER ================= */
   const handleAddSave = async () => {
    if (!bulkerNo || !emptyWeight || !truckCapacity) {
        errorToast("Please fill all fields");
        return;
    }

    showLoader();
    try {
        const postData = {
            bulkerNo,
            bulkerEmptyWeight: emptyWeight,
            bulkerCapacity: truckCapacity,
            created_by: UserDetails.USERID,
        };

        const res = await apiPostMethod(
            apiBaseUrl + "GatePro/Master/InsertBulkerdetails",
            postData
        );

        if (res?.data?.success == true) {
            ShowToast("Bulker added successfully");
            setBulkerNo("");
            setEmptyWeight("");
            setTruckCapacity("");
            loadTableData();
        } else {
                showErrorDialog(res?.data?.error || "Failed to add bulker");
            }
    } catch (err) {
        errorToast("Error while saving bulker");
    } finally {
        hideLoader();
    }
};


    /* ================= VIEW ================= */
    const handleView = (row) => {
        setSelectedRow(row);
        setEditBulkerNo(row.bulkerNo);
        setEditEmptyWeight(row.bulkerEmptyWeight);
        setEditTruckCapacity(row.bulkerCapacity);
        setViewModalOpen(true);
    };

    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        showLoader();
        try {
            const postData = {
                id: selectedRow.id,
                bulkerNo: editBulkerNo,
                bulkerEmptyWeight: editEmptyWeight,
                bulkerCapacity: editTruckCapacity,
                updated_by: UserDetails.USERID,
            };

            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Master/UpdateBulkerdetails",
                postData
            );

            if (res?.data?.success === true) {
                ShowToast("Bulker updated successfully");
                setViewModalOpen(false);
                loadTableData();
                 setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast("Failed to update bulker");
            }
        } catch {
            errorToast("Error while updating bulker");
        } finally {
            hideLoader();
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = (row) => {
        confirmDialog({
            title: "Are you sure you want to delete this Bulker?",
            description: `Bulker No: ${row.bulkerNo}`,
        }).then(async (res) => {
            if (res) {
                showLoader();
                try {
                    const postData = {
                        id: row.id,
                        updated_by: UserDetails.USERID,
                    };

                    const response = await apiPostMethod(
                        apiBaseUrl + "GatePro/Master/DeleteBulkerdetails",
                        postData
                    );

                    if (response?.data?.success === true) {
                        ShowToast("Bulker deleted successfully");
                        loadTableData();
                         setTimeout(() => window.location.reload(), 2000);
                    } else {
                        errorToast("Failed to delete bulker");
                    }
                } catch {
                    errorToast("Error while deleting bulker");
                } finally {
                    hideLoader();
                }
            }
        });
    };

    /* ================= REVERT ================= */
    const handleRevert = (row) => {
        confirmDialog({
            title: "Are you sure you want to revert this Bulker?",
            description: `Bulker No: ${row.bulkerNo}`,
        }).then(async (res) => {
            if (res) {
                showLoader();
                try {
                    const postData = {
                        id: row.id,
                        updated_by: UserDetails.USERID,
                    };

                    const response = await apiPostMethod(
                        apiBaseUrl + "GatePro/Master/RevertBulkerdetails",
                        postData
                    );

                    if (response?.data?.success === true) {
                        ShowToast("Bulker reverted successfully");
                        loadTableData();
                        setTimeout(() => window.location.reload(), 2000);
                    } else {
                        errorToast("Failed to revert bulker");
                    }
                } catch {
                    errorToast("Error while reverting bulker");
                } finally {
                    hideLoader();
                }
            }
        });
    };

    /* ================= TABLE ACTIONS ================= */
    const columns = [
        ...taColumns,
        {
            name: "Actions",
            cell: (row) => (
                <>
                    <Button
                        size="sm"
                        color="primary"
                        onClick={() => handleView(row)}
                    >
                        View
                    </Button>

                    &nbsp;

                    {row.status == 1 && (
                        <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(row)}
                        >
                            Delete
                        </Button>
                    )} &nbsp;

                    {row.status == 0 && (
                        <Button
                            size="sm"
                            color="warning"
                            onClick={() => handleRevert(row)}
                        >
                            Revert
                        </Button>
                    )}
                </>
            ),
        },
    ];

    /* ================= JSX ================= */
    return (
        <div>
            {/* ADD FORM */}
            <Card className="mb-2">
                <CardHeader>
                    <CardTitle>Add Bulker</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Bulker No</Label>
                                <Input
                                    value={bulkerNo}
                                    onChange={(e) =>
                                        setBulkerNo(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Empty Weight (Kgs)</Label>
                                <Input
                                    type="number"
                                    value={emptyWeight}
                                    onChange={(e) =>
                                        setEmptyWeight(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Truck Capacity (Kgs)</Label>
                                <Input
                                    type="number"
                                    value={truckCapacity}
                                    onChange={(e) =>
                                        setTruckCapacity(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-end">
                            <Button color="primary" onClick={handleAddSave}>
                                Add
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle>Bulker Master List</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* UPDATE MODAL */}
            <Modal
                isOpen={viewModalOpen}
                toggle={() => setViewModalOpen(false)}
                centered
                size="lg"
            >
                <ModalHeader toggle={() => setViewModalOpen(false)}>
                    Update Bulker
                </ModalHeader>

                <ModalBody>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Bulker No</Label>
                                <Input
                                    value={editBulkerNo}
                                    onChange={(e) =>
                                        setEditBulkerNo(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Empty Weight (Kgs)</Label>
                                <Input
                                    type="number"
                                    value={editEmptyWeight}
                                    onChange={(e) =>
                                        setEditEmptyWeight(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Truck Capacity (Kgs)</Label>
                                <Input
                                    type="number"
                                    value={editTruckCapacity}
                                    onChange={(e) =>
                                        setEditTruckCapacity(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end">
                            <Button color="primary" onClick={handleUpdate}>
                                Update
                            </Button>
                            &nbsp;
                            <Button
                                color="secondary"
                                onClick={() => setViewModalOpen(false)}
                            >
                                Close
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CBulkerMaster;
