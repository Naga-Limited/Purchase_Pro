import React, { Fragment, useState, useEffect } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import {
    Row, Col, Button, Card, CardHeader, Label, FormGroup,
    CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Badge, InputGroup, Input,
} from "reactstrap";
import { ArrowLeft, Eye, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import DateComponent from "../common/dateComponent";

/*
  CustomMillingFIPaymentApproval - Read-only Level 1 / Level 2 / Level 3
  approval screen for Custom Milling FI Payments. Lists pending entries at
  the given level and lets the approver Approve (advance status) or Reject
  (status -> 0) the whole entry, keyed by fi_entry_no, against the
  custom_milling_fi_entry table.
*/

const statusColor = (status) => (
    status === "1" || status === 1 ? "primary"
        : status === "2" || status === 2 ? "warning"
        : status === "3" || status === 3 ? "info"
        : status === "4" || status === 4 ? "success"
        : "danger"
);

const statusLabel = (status) => (
    status === "1" || status === 1 ? "Level 1 Pending"
        : status === "2" || status === 2 ? "Level 2 Pending"
        : status === "3" || status === 3 ? "Level 3 Pending"
        : status === "4" || status === 4 ? "Completed"
        : "Rejected"
);

const LEVEL_CONFIG = {
    1: {
        title: "Custom Milling FI Payment Approval - Level 1",
        listEndpoint: "CustomMillingMasterController/getCustomMillingFiListLevel1",
        approveEndpoint: "CustomMillingMasterController/ApproveCustomMillingFiLevel1",
        approveLabel: "Approve (Level 1)",
    },
    2: {
        title: "Custom Milling FI Payment Approval - Level 2",
        listEndpoint: "CustomMillingMasterController/getCustomMillingFiListLevel2",
        approveEndpoint: "CustomMillingMasterController/ApproveCustomMillingFiLevel2",
        approveLabel: "Approve (Level 2)",
    },
    3: {
        title: "Custom Milling FI Payment Approval - Level 3",
        listEndpoint: "CustomMillingMasterController/getCustomMillingFiListLevel3",
        approveEndpoint: "CustomMillingMasterController/ApproveCustomMillingFiLevel3",
        approveLabel: "Approve (Level 3)",
    },
};

const rejectEndpoint = "CustomMillingMasterController/RejectCustomMillingFi";

const CustomMillingFIPaymentApproval = ({ level }) => {
    const config = LEVEL_CONFIG[level];
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [landingData, setLandingData] = useState([]);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [editableInvoiceNo, setEditableInvoiceNo] = useState("");
    const [editableInvoiceDate, setEditableInvoiceDate] = useState("");
    const [postingDate, setPostingDate] = useState("");
    const [remarks, setRemarks] = useState("");

    const postingDateRestriction = DateComponent("sap");

    useEffect(() => {
        getLandingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getLandingData = () => {
        showLoader();
        apiPostMethod(apiBaseUrl + config.listEndpoint)
            .then(({ data }) => {
                if (data.success === 1) {
                    setLandingData(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load FI Payments");
                    setLandingData([]);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    const openModal = (row) => {
        let vehicleDetails = row.vehicle_details;
        if (typeof vehicleDetails === "string") {
            try {
                vehicleDetails = JSON.parse(vehicleDetails);
            } catch (e) {
                vehicleDetails = [];
            }
        }
        setSelectedEntry({ ...row, vehicle_details: vehicleDetails || [] });
        setRejectReason("");
        setEditableInvoiceNo(row.vendor_invoice_no || "");
        setEditableInvoiceDate(row.invoice_date || "");
        setPostingDate(row.posting_date || new Date().toISOString().slice(0, 10));
        setRemarks(row.remarks || "");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEntry(null);
        setRejectReason("");
        setPostingDate("");
        setRemarks("");
    };

    const handleApprove = () => {
        if (level === 2 && !remarks.trim()) {
            errorToast("Remarks is mandatory");
            return;
        }
        confirmDialog({
            title: `Approve FI Entry ${selectedEntry?.fi_entry_no}?`,
            description: "Are you sure you want to approve this FI Payment?",
        }).then((result) => {
            if (!result) return;
            const payload = {
                fi_entry_no: selectedEntry?.fi_entry_no,
                UserId: UserDetails.USERID,
            };
            if (level === 2) {
                payload.vendor_invoice_no = editableInvoiceNo;
                payload.invoice_date = editableInvoiceDate;
                payload.posting_date = postingDate;
                payload.remarks = remarks.trim();
            }
            showLoader();
            apiPostMethod(apiBaseUrl + config.approveEndpoint, payload)
                .then(({ data }) => {
                    if (data.success === 1 && level === 3 && data.results.document_no) {
                        confirmDialog({
                            title: `<h5><strong class="text-white"> ${'Approved Successfully The Document No is ' + data.results.document_no}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        }).then(() => {
                        closeModal();
                        getLandingData();
                    });
                    }else if (data.success === 1) {
                        ShowToast("Approved Successfully");
                        closeModal();
                        getLandingData();
                    } else {
                        errorToast(data.error || "Approval failed");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(() => hideLoader());
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            errorToast("Reject reason is mandatory");
            return;
        }
        confirmDialog({
            title: `Reject FI Entry ${selectedEntry?.fi_entry_no}?`,
            description: "Are you sure you want to reject this FI Payment?",
        }).then((result) => {
            if (!result) return;
            showLoader();
            apiPostMethod(apiBaseUrl + rejectEndpoint, {
                fi_entry_no: selectedEntry?.fi_entry_no,
                UserId: UserDetails.USERID,
                level,
                reject_reason: rejectReason.trim(),
            })
                .then(({ data }) => {
                    if (data.success === 1) {
                        ShowToast("Rejected Successfully");
                        closeModal();
                        getLandingData();
                    } else {
                        errorToast(data.error || "Reject failed");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(() => hideLoader());
        });
    };

    const filteredData = search
        ? landingData.filter((r) => String(r.fi_entry_no || "").toLowerCase().includes(search.toLowerCase()))
        : landingData;

    const columns = [
        { name: "FI ENTRY NO", selector: "fi_entry_no", sortable: true, minWidth: "150px",
            cell: (row) => <strong style={{ color: "#5e72e4", letterSpacing: "0.3px" }}>{row.fi_entry_no}</strong> },
        { name: "PROCESS TYPE", selector: "process_type", sortable: true, minWidth: "120px" },
        { name: "PO NUMBERS", selector: "po_numbers", sortable: true, minWidth: "150px" },
        { name: "VENDOR NAME", selector: "vendor_name", sortable: true, minWidth: "160px" },
        { name: "CONDITION TYPE", selector: "condition_type_code", sortable: true, minWidth: "150px",
            cell: (row) => row.condition_description
                ? `${row.condition_type_code} - ${row.condition_description}`
                : (row.condition_type_code || "—") },
        { name: "VENDOR INVOICE NO", selector: "vendor_invoice_no", sortable: true, minWidth: "150px" },
        { name: "INVOICE DATE", selector: "invoice_date", sortable: true, minWidth: "130px" },
        {
            name: "TOTAL VALUE", selector: "total_value", sortable: true, minWidth: "130px",
            cell: (row) => Number(row.total_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        },
        {
            name: "INVOICE VALUE", selector: "invoice_value", sortable: true, minWidth: "130px",
            cell: (row) => Number(row.invoice_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        },
        { name: "STATUS", selector: "status", sortable: true, minWidth: "130px",
            cell: (row) => <Badge color={statusColor(row.status)}>{statusLabel(row.status)}</Badge> },
        {
            name: "ACTIONS", selector: "fi_entry_no", minWidth: "120px",
            cell: (row) => (
                <Button.Ripple color="info" size="sm" type="button" onClick={() => openModal(row)} title="View">
                    <Eye size={13} /> View
                </Button.Ripple>
            ),
        },
    ];

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <Row style={{ width: "100%", alignItems: "center" }}>
                        <Col><h5 style={{ margin: 0 }}>{config.title}</h5></Col>
                        <Col md="3" sm="6">
                            <InputGroup size="sm">
                                <Input
                                    type="text"
                                    placeholder="Search by FI Entry No..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <hr />
                <CardBody>
                    <TableComponent showDownload columns={columns} data={filteredData} />
                </CardBody>
            </Card>

            <Modal isOpen={modalOpen} toggle={closeModal} size="lg" style={{ maxWidth: "90vw" }} scrollable>
                <ModalHeader
                    toggle={closeModal}
                    style={{ background: "#5e72e4", color: "#fff", borderBottom: "none", padding: "14px 20px" }}
                >
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                        View FI Payment
                        {selectedEntry?.fi_entry_no && (
                            <Badge
                                color="light"
                                style={{ marginLeft: 12, color: "#5e72e4", fontSize: "0.85rem", fontWeight: 700 }}
                            >
                                {selectedEntry.fi_entry_no}
                            </Badge>
                        )}
                    </span>
                </ModalHeader>

                <ModalBody style={{ background: "#f8f9fe", padding: "20px 24px" }}>
                    <Row>
                        <Col md="12" sm="12">
                            <h5 className="text-primary"><u>General Details</u></h5>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Total Tonnage</Label><Input type="text" value={selectedEntry?.overall_tonnage ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Rate</Label><Input type="text" value={selectedEntry?.rate ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Total Value</Label><Input type="text" value={selectedEntry?.total_value ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Invoice Value</Label><Input type="text" value={selectedEntry?.invoice_value ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Difference</Label><Input type="text" value={selectedEntry?.difference ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Confirm Vendor Name</Label><Input type="text" value={selectedEntry?.vendor_name ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>TDS</Label><Input type="text" value={selectedEntry?.tds_name ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>GL</Label><Input type="text" value={selectedEntry?.gl ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Cost Center</Label><Input type="text" value={selectedEntry?.cost_center ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Condition Type</Label>
                                <Input
                                    type="text"
                                    value={selectedEntry?.condition_description
                                        ? `${selectedEntry.condition_type_code} - ${selectedEntry.condition_description}`
                                        : (selectedEntry?.condition_type_code ?? "")}
                                    disabled
                                />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor Invoice No</Label>
                                {level === 2 ? (
                                    <Input type="text" value={editableInvoiceNo} onChange={(e) => setEditableInvoiceNo(e.target.value)} />
                                ) : (
                                    <Input type="text" value={selectedEntry?.vendor_invoice_no ?? ""} disabled />
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Invoice Date</Label>
                                {level === 2 ? (
                                    <Input
                                        type="date"
                                        value={editableInvoiceDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setEditableInvoiceDate(e.target.value)}
                                    />
                                ) : (
                                    <Input type="text" value={selectedEntry?.invoice_date ?? ""} disabled />
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Posting Date</Label>
                                {level === 2 ? (
                                    <Input
                                        type="date"
                                        value={postingDate}
                                        min={postingDateRestriction.min_date}
                                        max={postingDateRestriction.max_date}
                                        onChange={(e) => setPostingDate(e.target.value)}
                                    />
                                ) : (
                                    <Input type="text" value={selectedEntry?.posting_date ?? ""} disabled />
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Remarks {level === 2 && <span className="text-danger">*</span>}</Label>
                                {level === 2 ? (
                                    <Input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                ) : (
                                    <Input type="text" value={selectedEntry?.remarks ?? ""} disabled />
                                )}
                            </FormGroup>
                        </Col>
                        {selectedEntry?.invoice_attachment && (
                            <Col md="4" sm="12">
                                <FormGroup>
                                    <Label>Invoice Attachment</Label><br />
                                    <a href={selectedEntry.invoice_attachment} target="_blank" rel="noopener noreferrer">View Attachment</a>
                                </FormGroup>
                            </Col>
                        )}
                    </Row>

                    <Row>
                        <Col md="12" sm="12">
                            <h5 className="text-primary"><u>Vehicle Details</u></h5>
                            <br />
                            <div style={{ width: "100%", overflowX: "auto", border: "1px solid #ddd" }}>
                                <table
                                    className="table table-bordered"
                                    style={{ width: "100%", minWidth: "900px", tableLayout: "fixed", textAlign: "left", borderCollapse: "separate" }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                { label: "Truck No", width: "120px" },
                                                { label: "VA Number", width: "120px" },
                                                { label: "PO Number", width: "120px" },
                                                { label: "Plant", width: "80px" },
                                                { label: "Invoice No", width: "100px" },
                                                { label: "Qty In Ton", width: "80px" },
                                                { label: "Rate", width: "80px" },
                                                { label: "Amount", width: "80px" },
                                            ].map((col, i) => (
                                                <th key={i} style={{ width: col.width, background: "#7367f0", color: "white" }}>
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedEntry?.vehicle_details?.length ? selectedEntry.vehicle_details : [null]).map((line, i) => (
                                            <tr key={i}>
                                                <td>{line?.TRUCK_NO}</td>
                                                <td>{line?.VA_NUMBER}</td>
                                                <td>{line?.PO_NUMBER}</td>
                                                <td>{line?.PLANT}</td>
                                                <td>{line?.INVOICE_NO}</td>
                                                <td>{line?.QTY}</td>
                                                <td>{line?.RATE}</td>
                                                <td>{line?.AMOUNT}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Reject Reason <span className="text-danger">*</span></Label>
                                <Input
                                    type="textarea"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Required only when rejecting this FI Payment"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>

                <ModalFooter
                    style={{
                        background: "#f8f9fe",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div>
                        <Button.Ripple color="danger" type="button" onClick={handleReject}>
                            <X size={14} /> Reject
                        </Button.Ripple>
                    </div>
                    <div>
                        <Button.Ripple outline color="secondary" type="button" onClick={closeModal} style={{ marginRight: 8 }}>
                            <ArrowLeft size={14} /> Close
                        </Button.Ripple>
                        <Button.Ripple color="success" type="button" onClick={handleApprove}>
                            <Check size={14} /> {config.approveLabel}
                        </Button.Ripple>
                    </div>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default CustomMillingFIPaymentApproval;
