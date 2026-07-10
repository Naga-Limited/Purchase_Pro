import React, { useState, useEffect } from "react";
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

import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useSelector } from "react-redux";
import Uploader from "../Uploader";
import { HrLine } from "../common/HrLine";
import { errorToast, ShowToast } from "../../helper/appHelper";

/* ================= TABLE COLUMNS ================= */
const taColumns = [
    { name: "Division", selector: "division", sortable: true },
    { name: "Department", selector: "department", sortable: true },
    { name: "Payment Type", selector: "payment_to_type_name", sortable: true },
    { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true },
    { name: "Payment frequency", selector: "payment_frequency_name", sortable: true },
    {
        name: "Payment times",
        cell: (row) => <div>{row.payment_rem_count} / {row.payment_times}</div>,
    },
    { name: "Plant Code", selector: "plant_code", sortable: true },
];

const CrecPaymentDetailsEdit = () => {
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => state?.auth?.userData || {});

    const [tableData, setTableData] = useState([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);

    /* ================= EDITABLE DATA ================= */
    const [editData, setEditData] = useState({
        invoice_no: "",
        invoice_date: "",
        amount: "",
        difference_amount: "0",
        invoice_attachment: "", // filename from backend
    });

    /* ================= FILE STATE ================= */
    const [attachedFiles, setAttachedFiles] = useState({
        invoice_attachment: null, // File object
    });

    useEffect(() => {
        loadTableData();
    }, []);

    /* ================= LOAD TABLE ================= */
    const loadTableData = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "RecurringPaymentController/Rejectrecpaymentrenawaldetails",
                { user_plantid: UserDetails.plantids?.toString() || "" }
            );
            if (res.data.success) {
                setTableData(res.data.results || []);
            } else {
                errorToast("Failed to fetch payment details");
            }
        } catch {
            errorToast("Something went wrong");
        } finally {
            hideLoader();
        }
    };

    /* ================= OPEN MODAL ================= */
    const handleViewModalOpen = (row) => {
        setSelectedConsignment(row);

        const numericAmt = Number(row.amount || 0);
        const amtBudget = Number(row.amount_budget || 0);

        const diffWholePositive = String(
            Math.abs(Math.round(numericAmt - amtBudget))
        );

        setEditData({
            invoice_no: row.invoice_no || "",
            invoice_date: row.invoice_date || "",
            amount: row.amount || "",
            difference_amount: diffWholePositive,
            Invoice_Copy: row.invoice_attachment || "",
        });

        setAttachedFiles({ invoice_attachment: null });
        setViewModalOpen(true);
    };

    /* ================= AMOUNT ================= */
    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (!/^\d*\.?\d*$/.test(value)) return;

        const numericAmt = Number(value || 0);
        const amtBudget = Number(selectedConsignment?.amount_budget || 0);

        const diffWholePositive = String(
            Math.abs(Math.round(numericAmt - amtBudget))
        );

        setEditData((prev) => ({
            ...prev,
            amount: value,
            difference_amount: diffWholePositive,
        }));
    };

    const isAmountEditable = () =>
        !(
            selectedConsignment?.amount_paid_method === "FIXED" ||
            selectedConsignment?.amount_paid_method_id === 605
        );

    /* ================= SAFE FILE HANDLER (FIXED) ================= */
    const handleInvoiceFileChange = (e) => {
        let file = null;

        // Case 1: native input event
        if (e?.target?.files && e.target.files.length > 0) {
            file = e.target.files[0];
        }
        // Case 2: uploader passes File directly
        else if (e instanceof File) {
            file = e;
        }

        if (!file) return;

        setAttachedFiles({ invoice_attachment: file });
    };

    const openFilePreview = (file) => {
        const url = URL.createObjectURL(file);
        window.open(url, "_blank");
    };

    /* ================= SAVE ================= */
    const handleApprove = async () => {
        let invoiceAttachmentFileName = editData.invoice_attachment || "";

        /* ---- Upload invoice file to SAP ---- */
        if (attachedFiles.invoice_attachment) {
            const postdataFile = new FormData();
            postdataFile.append("form_name", "recurringpayment");
            postdataFile.append("ponumber", "invoice_copy");
            postdataFile.append("VA_Number", "001");
            postdataFile.append("SubFolder", "Recurring_payment");
            postdataFile.append("file[]", attachedFiles.invoice_attachment);

            try {
                showLoader();
                const uploadResp = await apiPostMethod(
                    sapFileShare,
                    postdataFile,
                    "File"
                );

                if (uploadResp?.data?.success) {
                    const uploaded = uploadResp.data.files?.[0] || {};
                    invoiceAttachmentFileName = uploaded.updname || "";
                } else {
                    errorToast("Invoice upload failed");
                    hideLoader();
                    return;
                }
            } catch (err) {
                console.error(err);
                errorToast("Invoice upload failed");
                hideLoader();
                return;
            } finally {
                hideLoader();
            }
        }

        /* ---- Update payment ---- */
        const postdata = {
            id: selectedConsignment.rpd_id,
            plant_code: selectedConsignment.plant_code,
            invoice_no: editData.invoice_no,
            invoice_date: editData.invoice_date,
            amount: editData.amount,
            difference_amount: editData.difference_amount,
            Invoice_Copy: invoiceAttachmentFileName,
            approved_by: UserDetails.USERID,
        };

        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "RecurringPaymentController/updaterenwaldata",
                postdata
            );
            if (res.data.success) {
                ShowToast("Payment updated successfully");
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                errorToast(res.data.message || "Update failed");
            }
        } catch {
            errorToast("Something went wrong");
        } finally {
            hideLoader();
        }
    };

    const columns = [
        ...taColumns,
        {
            name: "Actions",
            cell: (row) => (
                <Button size="sm" color="primary" onClick={() => handleViewModalOpen(row)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring Payment List</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* ================= MODAL ================= */}
            <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} size="xl" centered>
                <ModalHeader toggle={() => setViewModalOpen(false)}>
                    View Payment Details
                </ModalHeader>

                <ModalBody>
                    <h4 className="text-primary"><u>Payment Info</u></h4>
                    <br />

                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Division</Label>
                                <Input value={selectedConsignment?.division || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Department</Label>
                                <Input value={selectedConsignment?.department || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <Input
                                    value={selectedConsignment?.payment_to_type_name || ""}
                                    disabled
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <Input
                                    value={selectedConsignment?.payment_to_subtype_name || ""}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Payment Frequency</Label>
                                <Input
                                    value={selectedConsignment?.payment_frequency_name || ""}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Plant Code</Label>
                                <Input value={selectedConsignment?.plant_code || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <HrLine />

                    <h4 className="text-primary"><u>Invoice & Amount Details</u></h4>
                    <br />

                    <Row>
                        <Col md="3">
                            <FormGroup>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={editData.invoice_no}
                                    onChange={(e) =>
                                        setEditData((p) => ({ ...p, invoice_no: e.target.value }))
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Invoice Date</Label>
                                <Input
                                    type="date"
                                    value={editData.invoice_date}
                                    onChange={(e) =>
                                        setEditData((p) => ({ ...p, invoice_date: e.target.value }))
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Amount</Label>
                                <Input
                                    value={editData.amount}
                                    onChange={handleAmountChange}
                                    disabled={!isAmountEditable()}
                                    placeholder={
                                        !isAmountEditable()
                                            ? "Amount locked for FIXED method / method id 605"
                                            : ""
                                    }
                                />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Difference Amount</Label>
                                <Input value={editData.difference_amount} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* ===== Invoice Attachment (Agreement Style) ===== */}
                    <Row>
                        <Col md="6" className="mt-2">
                            <br />
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Uploader
                                    setAttachment={handleInvoiceFileChange}
                                    form={{}}
                                    label="Invoice Attachment"
                                    title="Pdf"
                                    id="invoice_attachment"
                                />

                                {attachedFiles.invoice_attachment?.name && (
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onClick={() =>
                                            openFilePreview(attachedFiles.invoice_attachment)
                                        }
                                    >
                                        Preview
                                    </Button>
                                )}

                                {!attachedFiles.invoice_attachment &&
                                    editData.invoice_attachment && (
                                        <a
                                            href={editData.invoice_attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" color="secondary">
                                                Open Invoice
                                            </Button>
                                        </a>
                                    )}
                            </div>
                        </Col>
                    </Row>

                    <HrLine />

                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end">
                            <Button color="primary" onClick={handleApprove}>
                                Save Changes
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

export default CrecPaymentDetailsEdit;
