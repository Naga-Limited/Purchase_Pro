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
import { useFormik } from "formik";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { CustomDropdownInput } from "../forms/custom-form";

/* ================= TABLE COLUMNS ================= */
const taColumns = [
    { name: "Key Name", selector: "key_name", sortable: true },
    { name: "Gate", selector: "gate_code", sortable: true },
    { name: "Block Name", selector: "block_name", sortable: true },
];

const CGateKeyMaster = () => {
    const [tableData, setTableData] = useState([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector(
        (state) => (state?.auth ? state.auth.userData : {})
    );

    /* ================= FORMIK ================= */
    const form = useFormik({
        initialValues: {
            key_name: "",
            gate_name: null,
            block_name: "",
        },
        onSubmit: () => {},
    });

    /* ================= CONDITIONS ================= */
    const isG017 = form.values.gate_name?.GATE_CODE === "G017";
    const isOtherGate = form.values.gate_name && !isG017;

    /* ================= AUTO BLOCK LOGIC ================= */
    useEffect(() => {
    const gate = form.values.gate_name;

    if (!gate) {
        form.setFieldValue("block_name", "");
        return;
    }

    if (gate.GATE_CODE === "G017") {
        return;
    }

    // ✅ Auto-fill for other gates
    form.setFieldValue("block_name", gate.GateName || "");
}, [form.values.gate_name]);

    /* ================= LOAD TABLE ================= */
    useEffect(() => {
        let mounted = true;

        const loadTableData = async () => {
            showLoader();
            try {
                const res = await apiPostMethod(
                    apiBaseUrl + "GatePro/Master/getGateKeyList"
                );

                if (mounted && res?.data?.success) {
                    setTableData(res.data.results || []);
                }
            } catch {
                if (mounted) errorToast("Something went wrong");
            } finally {
                if (mounted) hideLoader();
            }
        };

        loadTableData();
        return () => (mounted = false);
    }, []);

    const reloadTable = async () => {
        const res = await apiPostMethod(
            apiBaseUrl + "GatePro/Master/getGateKeyList"
        );
        if (res?.data?.success) setTableData(res.data.results || []);
    };

    /* ================= ADD ================= */
    const handleAddSave = async () => {
        const { key_name, gate_name, block_name } = form.values;

        if (!key_name || !gate_name) {
            errorToast("Please fill all fields");
            return;
        }

        if (isG017 && !block_name) {
            errorToast("Please enter Block Name");
            return;
        }

        showLoader();
        try {
            const postData = {
                key_name,
                gate_id: gate_name.value,
                code: gate_name.GATE_CODE,
                block_name,
                created_by: UserDetails.USERID,
            };

            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Master/InsertGateKeydetails",
                postData
            );

            if (res?.data?.success == true) {
                ShowToast("Key added successfully");
                setTimeout(() => window.location.reload(), 2000);
                form.resetForm();
                reloadTable();
            } else {
                errorToast(res?.data?.error || "Failed to add key");
            }
        } catch {
            errorToast("Error while saving");
        } finally {
            hideLoader();
        }
    };

    /* ================= VIEW ================= */
    const handleView = (row) => {
        setSelectedRow(row);

        form.setFieldValue("key_name", row.key_name);

        // ✅ EXACT pattern like empname dropdown
        form.setFieldValue("gate_name", {
            label: row.gate_code,
            value: row.gate_id,
            GATE_CODE: row.gate_code,
            GateName: row.block_name, // map back
        });

        form.setFieldValue("block_name", row.block_name || "");

        setViewModalOpen(true);
    };

    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        const { key_name, gate_name, block_name } = form.values;

        if (!key_name || !gate_name) {
            errorToast("Please fill all fields");
            return;
        }

        if (isG017 && !block_name) {
            errorToast("Please enter Block Name");
            return;
        }

        showLoader();
        try {
            const postData = {
                id: selectedRow.id,
                key_name,
                gate_id: gate_name.value,
                code: gate_name.GATE_CODE,
                block_name,
                updated_by: UserDetails.USERID,
            };

            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Master/UpdateGateKeydetails",
                postData
            );

            if (res?.data?.success == true) {
                ShowToast("Updated successfully");
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
                reloadTable();
            } else {
                errorToast("Failed to update");
            }
        } catch {
            errorToast("Error while updating");
        } finally {
            hideLoader();
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = (row) => {
        confirmDialog({
            title: "Delete this Key?",
            description: `Key Name: ${row.key_name}`,
        }).then(async (res) => {
            if (res) {
                showLoader();
                try {
                    const response = await apiPostMethod(
                        apiBaseUrl + "GatePro/Master/DeleteGateKey",
                        {
                            id: row.id,
                            deleted_by: UserDetails.USERID,
                        }
                    );

                    if (response?.data?.success == true) {
                        ShowToast("Deleted successfully");
                        setTimeout(() => window.location.reload(), 2000);
                        reloadTable();
                    } else {
                        errorToast("Delete failed");
                    }
                } catch {
                    errorToast("Error while deleting");
                } finally {
                    hideLoader();
                }
            }
        });
    };

    /* ================= REVERT ================= */
    const handleRevert = (row) => {
        confirmDialog({
            title: "Revert this Key?",
            description: `Key Name: ${row.key_name}`,
        }).then(async (res) => {
            if (res) {
                showLoader();
                try {
                    const response = await apiPostMethod(
                        apiBaseUrl + "GatePro/Master/RevertGateKey",
                        {
                            id: row.id,
                            reverted_by: UserDetails.USERID,
                        }
                    );

                    if (response?.data?.success == true) {
                        ShowToast("Reverted successfully");
                        reloadTable();
                        setTimeout(() => window.location.reload(), 2000);
                    } else {
                        errorToast("Revert failed");
                    }
                } catch {
                    errorToast("Error while reverting");
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
                    <Button size="sm" color="primary" onClick={() => handleView(row)}>
                        View
                    </Button>
                    &nbsp;
                    {row.active_status == 1 && (
                        <Button size="sm" color="danger" onClick={() => handleDelete(row)}>
                            Delete
                        </Button>
                    )}
                    &nbsp;
                    {row.active_status == 0 && (
                        <Button size="sm" color="warning" onClick={() => handleRevert(row)}>
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
                    <CardTitle>Add Gate Key</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Key Name</Label>
                                <Input
                                    name="key_name"
                                    value={form.values.key_name}
                                    onChange={form.handleChange}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Gate Name</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getGateList/${UserDetails.GATE_ID}`}
                                    name="gate_name"
                                    id="gate_name"
                                    form={form}
                                />
                            </FormGroup>
                        </Col>

                        {(isG017 || isOtherGate) && (
                            <Col md="4">
                                <FormGroup>
                                    <Label>Block Name</Label>
                                    <Input
                                        name="block_name"
                                        value={form.values.block_name}
                                        onChange={form.handleChange}
                                        disabled={!isG017}
                                    />
                                </FormGroup>
                            </Col>
                        )}
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
                    <CardTitle>Gate Key Master List</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* UPDATE MODAL */}
            <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} centered size="lg">
                <ModalHeader toggle={() => setViewModalOpen(false)}>
                    Update Gate Key
                </ModalHeader>

                <ModalBody>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Key Name</Label>
                                <Input
                                    name="key_name"
                                    value={form.values.key_name}
                                    onChange={form.handleChange}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Gate Name</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getGateList`}
                                    name="gate_name"
                                    id="gate_name"
                                    form={form}
                                />
                            </FormGroup>
                        </Col>

                        {form.values.gate_name && (
                            <Col md="4">
                                <FormGroup>
                                    <Label>Block Name</Label>
                                    <Input
                                        name="block_name"
                                        value={form.values.block_name}
                                        onChange={form.handleChange}
                                        disabled={form.values.gate_name?.GATE_CODE !== "G017"}
                                    />
                                </FormGroup>
                            </Col>
                        )}
                    </Row>

                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end">
                            <Button color="primary" onClick={handleUpdate}>
                                Update
                            </Button>
                            &nbsp;
                            <Button color="secondary" onClick={() => setViewModalOpen(false)}>
                                Close
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CGateKeyMaster;
