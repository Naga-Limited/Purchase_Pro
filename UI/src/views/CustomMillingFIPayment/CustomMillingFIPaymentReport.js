import React, { Fragment, useState } from "react";
import moment from "moment";
import { useFormik } from "formik";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import {
    Row, Col, Button, Label, FormGroup, Card, CardHeader, CardBody, Badge,
    Modal, ModalHeader, ModalBody, ModalFooter, Input,
} from "reactstrap";
import { ArrowDown, ArrowLeft, Eye } from "react-feather";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { DatePicker } from "../forms/custom-datetime";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import TableComponent from "../common/TableComponent";

/*
  CustomMillingFIPaymentReport - read-only report over Custom Milling FI
  Payment entries, showing each entry's current approval status
  (Level 1/2/3 pending, Completed, Rejected), sourced from
  CustomMillingMasterController/getCustomMillingFiReport.
*/

const columns = [
    { name: "FI ENTRY NO", selector: "fi_entry_no", sortable: true, minWidth: "150px" },
    { name: "PROCESS TYPE", selector: "process_type", sortable: true, minWidth: "120px" },
    { name: "PO NUMBERS", selector: "po_numbers", sortable: true, minWidth: "150px" },
    { name: "VENDOR NAME", selector: "vendor_name", sortable: true, minWidth: "160px" },
    { name: "CONDITION TYPE", selector: "condition_type_code", sortable: true, minWidth: "150px",
        cell: (row) => row.condition_description
            ? `${row.condition_type_code} - ${row.condition_description}`
            : (row.condition_type_code || "—") },
    { name: "VENDOR INVOICE NO", selector: "vendor_invoice_no", sortable: true, minWidth: "150px" },
    { name: "INVOICE DATE", selector: "invoice_date", sortable: true, minWidth: "130px" },
    { name: "OVERALL TONNAGE", selector: "overall_tonnage", sortable: true, minWidth: "140px" },
    { name: "RATE", selector: "rate", sortable: true, minWidth: "90px" },
    {
        name: "TOTAL VALUE", selector: "total_value", sortable: true, minWidth: "130px",
        cell: (row) => Number(row.total_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    {
        name: "INVOICE VALUE", selector: "invoice_value", sortable: true, minWidth: "130px",
        cell: (row) => Number(row.invoice_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    {
        name: "DIFFERENCE", selector: "difference", sortable: true, minWidth: "120px",
        cell: (row) => Number(row.difference || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    { name: "TDS", selector: "tds_name", sortable: true, minWidth: "110px" },
    { name: "GL", selector: "gl", sortable: true, minWidth: "110px" },
    { name: "COST CENTER", selector: "cost_center", sortable: true, minWidth: "120px" },
    { name: "POSTING DATE", selector: "posting_date", sortable: true, minWidth: "120px" },
    { name: "DOCUMENT NO", selector: "sap_posting_document_no", sortable: true, minWidth: "120px" },
    {
        name: "STATUS", selector: "statusLabel", sortable: true, minWidth: "140px",
        cell: (row) => <Badge color={row.statusColor || "secondary"}>{row.statusLabel}</Badge>,
    },
    { name: "CREATED AT", selector: "created_at", sortable: true, minWidth: "140px" },
];

const vehicleColumns = [
    { label: "Truck No", width: "120px" },
    { label: "VA Number", width: "120px" },
    { label: "PO Number", width: "120px" },
    { label: "Plant", width: "80px" },
    { label: "Invoice No", width: "100px" },
    { label: "Qty In Ton", width: "80px" },
    { label: "Rate", width: "80px" },
    { label: "Amount", width: "80px" },
];

const PROCESS_TYPE_OPTIONS = [
    { value: "TRUCK", label: "TRUCK" },
    { value: "RAKE", label: "RAKE" },
];

const CustomMillingFIPaymentReport = () => {
    const { showLoader, hideLoader } = useLoader();

    const [reportData, setReportData] = useState([]);
    const [searched, setSearched] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

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
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEntry(null);
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit: () => { },
    });

    const getReportData = () => {
        const dateRange = form.values.date;
        if (!dateRange?.start || !dateRange?.end) {
            errorToast("Please select a Date Range");
            return;
        }
        const fromDate = moment(dateRange.start).format("YYYY-MM-DD");
        const toDate = moment(dateRange.end).format("YYYY-MM-DD");

        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getCustomMillingFiReport", {
            fromDate,
            toDate,
            processType: form.values.process_type?.value,
            status: form.values.status?.value,
        })
            .then(({ data }) => {
                setSearched(true);
                if (data.success === 1 || data.success === true) {
                    setReportData(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load FI Payment Report");
                    setReportData([]);
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
                    <h5 style={{ margin: 0 }}>Custom Milling FI Payment Report</h5>
                </CardHeader>
                <hr />
                <CardBody>
                    <Row style={{ alignItems: "flex-end", marginBottom: "16px" }}>
                        <Col md="3" sm="6">
                            <DatePicker form={form} id="date" isDateRange label="Date Range" />
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Process Type</label>
                                <CustomDropdownInput options={PROCESS_TYPE_OPTIONS} form={form} id="process_type" />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Status</label>
                                <CustomDropdownInput
                                    url={apiBaseUrl + "CustomMillingMasterController/getCustomMillingFiStatusList"}
                                    form={form}
                                    id="status"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="2" sm="6">
                            <FormGroup>
                                <Button
                                    color="primary"
                                    type="button"
                                    onClick={getReportData}
                                    disabled={form.values.date == undefined}
                                >
                                    View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                    {searched ? (
                        <TableComponent
                            showDownload
                            columns={[
                                ...columns,
                                {
                                    name: "ACTIONS", selector: "fi_entry_no", hideInExcel: true, minWidth: "140px",
                                    cell: (row) => (
                                        <Button.Ripple color="info" size="sm" type="button" onClick={() => openModal(row)} title="View Details">
                                            <Eye size={13} /> View
                                        </Button.Ripple>
                                    ),
                                },
                            ]}
                            data={reportData}
                        />
                    ) : (
                        <p style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                            Select a Date Range and click View to load the report
                        </p>
                    )}
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
                            <FormGroup><Label>Vendor Invoice No</Label><Input type="text" value={selectedEntry?.vendor_invoice_no ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Invoice Date</Label><Input type="text" value={selectedEntry?.invoice_date ?? ""} disabled /></FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup><Label>Remarks</Label><Input type="text" value={selectedEntry?.remarks ?? ""} disabled /></FormGroup>
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
                                            {vehicleColumns.map((col, i) => (
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
                </ModalBody>

                <ModalFooter style={{ background: "#f8f9fe", borderTop: "1px solid #e2e8f0" }}>
                    <Button.Ripple outline color="secondary" type="button" onClick={closeModal}>
                        <ArrowLeft size={14} /> Close
                    </Button.Ripple>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default CustomMillingFIPaymentReport;
