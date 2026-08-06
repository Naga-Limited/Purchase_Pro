import React, { Fragment, useState } from "react";
import moment from "moment";
import { useFormik } from "formik";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import {
    Row, Col, Button, FormGroup,
    Card, CardHeader, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Badge
} from "reactstrap";
import { ArrowLeft, ArrowDown, Eye } from "react-feather";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { DatePicker } from "../forms/custom-datetime";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import TableComponent from "../common/TableComponent";

/*
  PurchaseOrderReport - read-only, line-item based report over Purchase Orders.
  Each row in the grid is a single PO line item (not a PO header), sourced from
  CustomMillingMasterController/getPurchaseOrderLineReport. Clicking "View
  Conditions" opens a popup showing the Condition Changes for that specific
  line, the same condition data shown in the PurchaseOrderChange edit screen.
*/

const columns = [
    { name: "PO NUMBER", selector: "poNumber", sortable: true, minWidth: "130px" },
    { name: "LINE", selector: "Line", sortable: true, minWidth: "80px" },
    { name: "PURCHASE ORG", selector: "purchaseOrg", sortable: true, minWidth: "140px" },
    { name: "SEGMENT", selector: "segmentCode", sortable: true, minWidth: "110px" },
    { name: "BROKER CODE", selector: "brokerCode", sortable: true, minWidth: "120px" },
    { name: "BROKER NAME", selector: "brokerName", sortable: true, minWidth: "150px" },
    { name: "VENDOR CODE", selector: "VendorCode", sortable: true, minWidth: "120px" },
    { name: "VENDOR NAME", selector: "VendorName", sortable: true, minWidth: "150px" },
    { name: "CUSTOMER CODE", selector: "customerCode", sortable: true, minWidth: "120px" },
    { name: "CUSTOMER NAME", selector: "customerName", sortable: true, minWidth: "150px" },
    { name: "PO LOADING DATE", selector: "PoLoadingDate", sortable: true, minWidth: "140px" },
    { name: "BAG TYPE", selector: "BagType", sortable: true, minWidth: "110px" },
    { name: "QTY", selector: "Qty", sortable: true, minWidth: "90px" },
    { name: "NO OF VEHICLES", selector: "NoOfVehicles", sortable: true, minWidth: "130px" },
    { name: "UOM", selector: "Uom", sortable: true, minWidth: "80px" },
    { name: "RATE", selector: "Rate", sortable: true, minWidth: "90px" },
    {
        name: "TOTAL AMOUNT",
        selector: "TotalAmount",
        sortable: true,
        minWidth: "130px",
        cell: (row) => Number(row.TotalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    { name: "PLANT", selector: "PlantName", sortable: true, minWidth: "110px" },
    { name: "STORAGE LOCATION", selector: "StorageLocation", sortable: true, minWidth: "140px" },
    {
        name: "STATUS",
        selector: "statusLabel",
        sortable: true,
        minWidth: "130px",
        cell: (row) => <Badge color={row.statusColor || "secondary"}>{row.statusLabel}</Badge>,
    },
    {
        name: "CONDITIONS",
        selector: "conditionCount",
        minWidth: "110px",
        cell: (row) => <Badge color={row.ConditionChanges?.length ? "primary" : "secondary"}>{row.ConditionChanges?.length || 0}</Badge>,
    },
];

const PurchaseOrderReport = () => {

    const { showLoader, hideLoader } = useLoader();

    const [reportData, setReportData] = useState([]);
    const [searched, setSearched] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState(null);

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
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getPurchaseOrderLineReport", {
            fromDate,
            toDate,
            customerCode: form.values.customer_code?.value,
            status: form.values.status?.value,
        })
            .then(({ data }) => {
                setSearched(true);
                if (data.success === 1 || data.success === true) {
                    setReportData(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load Purchase Order Report");
                    setReportData([]);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    const openConditions = (row) => {
        setSelectedLine(row);
        setModalOpen(true);
    };

    const closeConditions = () => {
        setModalOpen(false);
        setSelectedLine(null);
    };

    const actionsCol = {
        name: "ACTIONS",
        selector: "refid",
        hideInExcel: true,
        minWidth: "160px",
        cell: (row) => (
            <Button.Ripple color="info" size="sm" type="button" onClick={() => openConditions(row)} title="View Conditions">
                <Eye size={13} /> View Conditions
            </Button.Ripple>
        ),
    };

    const gridColumns = [...columns, actionsCol];

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h5 style={{ margin: 0 }}>Custom Milling Purchase Order Report</h5>
                </CardHeader>
                <hr />
                <CardBody>
                    <Row style={{ alignItems: "flex-end", marginBottom: "16px" }}>
                        <Col md="3" sm="6">
                            <DatePicker form={form} id="date" isDateRange label="Date Range" />
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Customer</label>
                                <CustomDropdownInput
                                    url={apiBaseUrl + "CustomMillingMasterController/getPurchaseOrderCustomerList"}
                                    form={form}
                                    id="customer_code"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Status</label>
                                <CustomDropdownInput
                                    url={apiBaseUrl + "CustomMillingMasterController/getPurchaseOrderStatusList"}
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
                        <TableComponent showDownload columns={gridColumns} data={reportData} />
                    ) : (
                        <p style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                            Select a Date Range and click View to load the report
                        </p>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={modalOpen} toggle={closeConditions} size="lg" scrollable>
                <ModalHeader
                    toggle={closeConditions}
                    style={{ background: "#5e72e4", color: "#fff", borderBottom: "none", padding: "14px 20px" }}
                >
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                        Condition Changes
                        {selectedLine && (
                            <Badge color="light" style={{ marginLeft: 12, color: "#5e72e4", fontSize: "0.85rem", fontWeight: 700 }}>
                                {selectedLine.poNumber} - Line {selectedLine.Line}
                            </Badge>
                        )}
                    </span>
                </ModalHeader>
                <ModalBody style={{ background: "#f8f9fe", padding: "20px 24px" }}>
                    <table className="table table-bordered" style={{ fontSize: "0.85rem" }}>
                        <thead>
                            <tr>
                                {["Condition Type", "Condition Description", "Rate", "Total Amount"].map((h) => (
                                    <td key={h} className="bg-primary text-white text-center" style={{ padding: "8px" }}>
                                        {h}
                                    </td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!selectedLine?.ConditionChanges || selectedLine.ConditionChanges.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="text-center" style={{ color: "#aaa", padding: "18px" }}>
                                        No conditions
                                    </td>
                                </tr>
                            )}
                            {(selectedLine?.ConditionChanges || []).map((cond, ci) => (
                                <tr key={ci}>
                                    <td className="text-center">{cond.condition_type_code}</td>
                                    <td className="text-center">{cond.condition_description}</td>
                                    <td className="text-center">{cond.rate}</td>
                                    <td className="text-center">
                                        {((cond.rate || 0) * (selectedLine.Qty || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ModalBody>
                <ModalFooter style={{ background: "#f8f9fe", borderTop: "1px solid #e2e8f0" }}>
                    <Button.Ripple outline color="secondary" type="button" onClick={closeConditions}>
                        <ArrowLeft size={14} /> Close
                    </Button.Ripple>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default PurchaseOrderReport;
