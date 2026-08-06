import React, { Fragment, useState, useEffect } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import {
    Row, Col, Button, Label, FormGroup, Input, InputGroup,
    InputGroupAddon, Card, CardHeader, CardBody, Modal, ModalHeader,
    ModalBody, ModalFooter, Badge
} from "reactstrap";
import { ArrowLeft, Check, Search, Edit2, Eye, X, Plus, RotateCcw } from "react-feather";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { ShowToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { DatePicker } from "../forms/custom-datetime";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import moment from "moment";

/*
  PurchaseOrderEdit - Landing screen that lists Purchase Orders by PO Number.
  Clicking "View" on any row opens a modal popup showing the full line details
  for that PO (same fields as PurchaseOrderMaterials). Clicking "Edit" opens
  the same popup in edit mode, allowing field changes, adding new lines, and
  re-submission.

  Soft-delete convention: both line items and condition rows are NEVER spliced
  out of state when "removed" in the UI. Instead their `status` is flipped to 0,
  hidden from the grid, but still included in the submit payload so the backend
  can flip sap_to_pp.status / custom_milling_po_condtion.status to 0 rather than
  hard-deleting the row.
*/

// ─── Landing table column definitions ────────────────────────────────────────
const poColumns = [
    {
        name: "PO NUMBER",
        selector: "EBELN",
        sortable: true,
        minWidth: "140px",
        cell: (row) => (
            <strong style={{ color: "#5e72e4", letterSpacing: "0.3px" }}>
                {row.EBELN}
            </strong>
        ),
    },
    {
        name: "PURCHASE ORG",
        selector: "PURCHASE_ORG_DESC",
        sortable: true,
        minWidth: "140px",
    },
    {
        name: "BROKER NAME",
        selector: "BROCKER_NAME",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "CUSTOMER NAME",
        selector: "customerName",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "OVERALL AMOUNT",
        selector: "totalAmount",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STATUS",
        selector: "status",
        sortable: true,
        minWidth: "110px",
        cell: (row) => {
            const color = row.status === "1" ? "primary"
                : row.status === "2" ? "warning"
                : row.status === "3" ? "success"
                : row.status === "0" ? "danger" : "success";
            return <Badge color={color}>{row.status === "1" ? "MG Approve"
                : row.status === "2" ? "CMG Approve"
                : row.status === "3" ? "Completed"
                : "Deleted"}</Badge>;
        },
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const PurchaseOrderEdit = () => {

    const history = useHistory();
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    // ── Landing state ──
    const [landingData, setLandingData] = useState([]);

    // ── Date range filter (createdAt) — filtering happens on the backend ──
    const filterForm = useFormik({
        initialValues: { dateRange: undefined },
        onSubmit: () => { },
    });

    // ── Popup state ──
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("view");   // "view" | "edit"
    const [selectedPO, setSelectedPO] = useState(null);  // full PO record

    // ── Edit/view inner state (mirrors PurchaseOrderMaterials) ──
    const [brokerName, setBrokerName] = useState("");
    const [brokerLocked, setBrokerLocked] = useState(false);
    const [customerCode, setCustomerCode] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerLocked, setCustomerLocked] = useState(false);
    const [segmentOptions, setSegmentOptions] = useState([]);
    const [lines, setLines] = useState([]);
    const [conditionTables, setConditionTables] = useState({});
    const [overAllAmount, setOverAllAmount] = useState(0);
    const [headerMaterialCode, setHeaderMaterialCode] = useState("");
    const [headerMaterialDes, setHeaderMaterialDes] = useState("");
    const [headerSegment, setHeaderSegment] = useState("");
    const [headerUom, setHeaderUom] = useState("");
    const [headerRate, setHeaderRate] = useState(0);
    const [purchaseOrg, setPurchaseOrg] = useState(0);
    const [purchaseOrgId, setPurchaseOrgId] = useState(""); // raw id, needed to drive segment lookup + Add Row gating
    const [poNumbers, setPONumber] = useState(""); // raw i
    const [rmId,setRMID] = useState('')
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit: () => { },
    });

    // ── Action columns injected into TableComponent ──
    const actionsCol = {
        name: "ACTIONS",
        selector: "poNumber",
        minWidth: "180px",
        cell: (row) => (
            <Row style={{ gap: "6px", flexWrap: "nowrap" }}>
                <Button.Ripple
                    color="info"
                    size="sm"
                    type="button"
                    onClick={() => openModal(row, "view")}
                    title="View Lines"
                >
                    <Eye size={13} /> View
                </Button.Ripple>
                <Button.Ripple
                    color="primary"
                    size="sm"
                    type="button"
                    onClick={() => openModal(row, "edit")}
                    title="Edit PO"
                >
                    <Edit2 size={13} /> Edit
                </Button.Ripple>
            </Row>
        ),
    };

    const columns = [...poColumns, actionsCol];

    // ─── 1. Fetch PO landing list ─────────────────────────────────────────────
    // Re-fetches whenever the date range filter changes; the backend returns
    // the latest 50 POs (by createdAt) when no range is selected, or every PO
    // created within the selected range.
    useEffect(() => {
        getLandingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterForm.values.dateRange]);

    const getLandingData = () => {
        const dateRange = filterForm.values.dateRange;
        showLoader();
        apiPostMethod(
            apiBaseUrl + `CustomMillingMasterController/getPurchaseOrderList/${UserDetails.USERID}`,
            {
                fromDate: dateRange?.start ? moment(dateRange.start).format("YYYY-MM-DD") : null,
                toDate: dateRange?.end ? moment(dateRange.end).format("YYYY-MM-DD") : null,
            }
        )
            .then(({ data }) => {
                if (data.success === 1) {
                    setLandingData(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load Purchase Orders");
                    setLandingData([]);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    // ─── 2. Open modal: load PO detail ───────────────────────────────────────
    const openModal = (row, mode) => {
        setModalMode(mode);
        setSelectedPO(row);
        resetPopupState();
        fetchPODetail(row.purchaseOrderId || row.EBELN);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPO(null);
        resetPopupState();
    };

    const resetPopupState = () => {
        setBrokerName("");
        setBrokerLocked(false);
        setCustomerCode("");
        setCustomerName("");
        setCustomerLocked(false);
        setSegmentOptions([]);
        setLines([]);
        setConditionTables({});
        setOverAllAmount(0);
        setHeaderMaterialCode("");
        setHeaderMaterialDes("");
        setHeaderSegment("");
        setHeaderUom("");
        setHeaderRate(0);
        setPurchaseOrg(0);
        setPurchaseOrgId("");
        form.resetForm();
    };

    // ─── 3. Fetch PO detail for popup ────────────────────────────────────────
    const fetchPODetail = (purchaseOrderId) => {
        showLoader();
        apiPostMethod(
            apiBaseUrl +
            `CustomMillingMasterController/getPurchaseOrderInfo/${purchaseOrderId}/${UserDetails.USERID}`
        )
            .then(({ data }) => {
                if (data.success === 1) {
                    const rec = data.results[0];
                    // Populate header fields
                    setBrokerName(rec.brokerName || "");
                    setBrokerLocked(!!rec.brokerName);
                    setCustomerCode(rec.customerCode || "");
                    setCustomerName(rec.customerName || "");
                    setCustomerLocked(!!rec.customerName);
                    setHeaderSegment(rec.segmentCode || "");
                    setHeaderMaterialCode(rec.materialCode || "");
                    setHeaderMaterialDes(rec.materialDes || "");
                    setHeaderUom(rec.uom || "");
                    setHeaderRate(rec.rate || 0);
                    setOverAllAmount(rec.overAllAmount || 0);
                    setPurchaseOrg(rec.purchaseOrgName);
                    setPurchaseOrgId(rec.purchaseOrg || rec.purchaseOrgId || "");
                    setPONumber(rec.poNumber)
                    setRMID(rec.rm_id)
                    // Populate formik for purchase_org, broker_code
                    form.setFieldValue("broker_code", rec.brokerCode || "");
                    form.setFieldValue("purchase_org", rec.purchaseOrg
                        ? { value: rec.purchaseOrg, label: rec.purchaseOrgName || rec.purchaseOrg }
                        : undefined);

                    // Populate line items. Tag every fetched line with status:1 (active)
                    // unless the backend already sent one, so the soft-delete flag is
                    // always present in state from the start.
                    const fetchedLines = (rec.LineDetails || rec.lines || []).map((l, i) => ({
                        ...l,
                        Line: l.Line || (i + 1) * 10,
                        TotalAmount: l.TotalAmount || 0,
                        status: l.status === undefined || l.status === null ? 1 : l.status,
                    }));
                    setLines(fetchedLines);

                    // Populate condition tables
                    const conds = {};
                    fetchedLines.forEach((l) => {
                        if (l.ConditionChanges && l.ConditionChanges.length) {
                            conds[l.Line] = l.ConditionChanges.map((c) => ({
                                ...c,
                                status: c.status === undefined || c.status === null ? 1 : c.status,
                            }));
                        }
                    });
                    setConditionTables(conds);

                    // Restore plant/storage per-row selections
                    fetchedLines.forEach((l, idx) => {
                        if (l.PlantName) {
                            form.setFieldValue(`plant_${idx}`, {
                                value: l.PlantId || l.PlantName,
                                label: l.PlantName,
                            });
                        }
                        if (l.StorageLocation) {
                            form.setFieldValue(`storage_${idx}`, {
                                value: l.StorageId || l.StorageLocation,
                                label: l.StorageLocation,
                            });
                        }
                        if (l.BagType) {
                            form.setFieldValue(`bagType_${idx}`, {
                                value: l.BagTypeId || l.BagType,
                                label: l.BagType,
                            });
                        }
                    });
                } else {
                    errorToast(data.message || "Failed to load PO details");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    // ─── 4. Segment options - load once the popup has a purchase org (from PO detail) ──
    useEffect(() => {
        const orgId = form?.values?.purchase_org?.value || purchaseOrgId;
        if (orgId) {
            apiPostMethod(
                apiBaseUrl + `CustomMillingMasterController/getSegmentDetails/${orgId}`
            )
                .then(({ data }) => {
                    if (data.success == 1) setSegmentOptions(data.results || []);
                })
                .catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.values?.purchase_org?.value, purchaseOrgId]);

    // ─── 5. Overall amount recalculation ─────────────────────────────────────
    // Line rows AND condition rows marked status === 0 (removed) are soft-deleted,
    // not spliced out of their arrays, so they're excluded from the total but
    // still sent to the backend on submit.
    const recalculateOverAllAmount = (currentLines, currentConditions) => {
        const lineTotal = currentLines
            .filter((l) => l.status !== 0 && l.status !== "0")
            .reduce((sum, l) => sum + parseFloat(l.TotalAmount || 0), 0);

        const conditionTotal = Object.entries(currentConditions).reduce(
            (sum, [lineNo, conditions]) => {
                const line = currentLines.find((l) => String(l.Line) === String(lineNo));
                if (!line || line.status === 0 || line.status === "0") return sum;
                const qty = parseFloat(line?.Qty || 0);
                return (
                    sum +
                    (conditions || [])
                        .filter((c) => c.status !== 0 && c.status !== "0")
                        .reduce((s, c) => s + parseFloat(c.rate || 0) * qty, 0)
                );
            },
            0
        );
        setOverAllAmount((lineTotal + conditionTotal).toFixed(2));
    };

    // ─── 6. Line CRUD helpers (edit mode only) ───────────────────────────────

    // Add a new blank row, pre-filled from the header Segment selection, with the
    // next SAP-style line number (10, 20, 30...), and immediately fetch its
    // Condition Changes — same behavior as PurchaseOrderMaterials.addNewRow.
    // New rows are tagged status: 1 (active) so the soft-delete flag is always
    // present in the payload, even for freshly-added lines.
    const addNewRow = () => {
        const nextLineNo = lines.length === 0 ? 10 : Math.max(...lines.map((l) => Number(l.Line))) + 10;
        const newLine = {
            Line: nextLineNo,
            SegmentCode: headerSegment || "",
            MaterialCode: headerMaterialCode || "",
            MaterialDes: headerMaterialDes || "",
            PoLoadingDate: "",
            VendorCode: "", VendorName: "",
            Qty: "", NoOfVehicles: "", Uom: headerUom || "", Rate: headerRate || "", TotalAmount: 0,
            status: 1,
        };
        const newLines = [...lines, newLine];
        setLines(newLines);
        getConditionChanges(nextLineNo, newLines);
    };

    // Condition Changes for a given line, fetched by Segment value, same as the
    // source screen's getConditionChanges. Freshly fetched rows are tagged
    // status: 1 (active) so the backend payload always carries a status flag.
    const getConditionChanges = (lineNo, currentLines) => {
        const lineItem = (currentLines || lines).find((l) => l.Line === lineNo);
        const segmentValue = lineItem?.SegmentCode || headerSegment || "";
        const segmentId = currentLines[0]?.ConditionChanges[0]?.line_no || "";
        console.log(lineItem)
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getConditionChanges/${segmentValue}/${rmId}`)
            .then(({ data }) => {
                if (data.success == 1) {
                    const taggedResults = (data.results || []).map((c) => ({
                        ...c,
                        status: c.status === undefined || c.status === null ? 1 : c.status,
                    }));
                    const newConditionTables = { ...conditionTables, [lineNo]: taggedResults };
                    setConditionTables(newConditionTables);
                    recalculateOverAllAmount(currentLines || lines, newConditionTables);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    const updateLine = (index, field, value) => {
        const newLines = [...lines];
        const item = { ...newLines[index], [field]: value };
        item.TotalAmount =
            item.Rate == "" || item.Rate == undefined || item.Qty == "" || item.Qty == undefined
                ? 0
                : Number(item.Rate * item.Qty).toFixed(2);
        newLines[index] = item;
        setLines(newLines);
        recalculateOverAllAmount(newLines, conditionTables);
    };

    // Soft-delete: flip status to 0 instead of removing the row from state, so the
    // backend receives the full line array with the removed row marked inactive
    // (mirrors the condition-row Remove behavior above). The row is hidden from
    // the grid via the `status !== 0` filter in the render below.
    const removeLine = (index) => {
        const newLines = lines.map((l, i) =>
            i === index ? { ...l, status: 0 } : l
        );
        setLines(newLines);
        recalculateOverAllAmount(newLines, conditionTables);
    };

    // Revoke a soft-deleted line: flip status back to 1 so it re-enters the
    // active totals and payload, undoing a Remove done earlier in this session.
    const revokeLine = (index) => {
        const newLines = lines.map((l, i) =>
            i === index ? { ...l, status: 1 } : l
        );
        setLines(newLines);
        recalculateOverAllAmount(newLines, conditionTables);
    };

    const searchVendor = (index) => {
        const vendorCode = lines[index].VendorCode;
        if (!vendorCode) { errorToast("Please enter Vendor Code"); return; }
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getVendor/${vendorCode}`)
            .then(({ data }) => {
                if (data.success === 1 && data.results?.[0]) {
                    const newLines = [...lines];
                    newLines[index] = {
                        ...newLines[index],
                        VendorName: data.results[0].VENDORNAME || "",
                        vendorLocked: true,
                    };
                    setLines(newLines);
                } else {
                    errorToast("Vendor not found");
                }
            })
            .catch(console.error);
    };

    // Validate every active (non soft-deleted) line before submit. Returns the
    // first error message found, or "" if all active lines are valid.
    const validateLines = (activeLines) => {
        for (const l of activeLines) {
            const index = lines.indexOf(l);
            const plant = form.values[`plant_${index}`];
            const storage = form.values[`storage_${index}`];
            const bagType = form.values[`bagType_${index}`];

            if (!l.PoLoadingDate) return `Line ${l.Line}: PO Loading Date is required`;
            if (l.VendorCode && !l.VendorName) return `Line ${l.Line}: Vendor Name is required (search the Vendor Code)`;
            if (!bagType?.value) return `Line ${l.Line}: Bag Type is required`;
            if (!l.Qty || Number(l.Qty) <= 0) return `Line ${l.Line}: Qty must be greater than 0`;
            if (!l.NoOfVehicles || Number(l.NoOfVehicles) <= 0) return `Line ${l.Line}: No Of Vehicles must be greater than 0`;
            if (!plant?.value) return `Line ${l.Line}: Plant Name is required`;
            if (!storage?.value) return `Line ${l.Line}: Storage Location is required`;
        }
        return "";
    };

    // ─── 7. Submit updated PO ────────────────────────────────────────────────
    const submitEdit = () => {
        const activeLines = lines.filter((l) => l.status !== 0 && l.status !== "0");
        if (activeLines.length === 0) {
            confirmDialog({
                title: `<h5><strong class="text-white">Please Add at least one Line</strong></h5>`,
                cancelButton: false, confirmText: false, confirmButton: false, background: "#BD362F",
            });
            return;
        }

        const lineError = validateLines(activeLines);
        if (lineError) {
            errorToast(lineError);
            return;
        }

        const formData = form.values;
        const FrmData = {
            purchaseOrderId: poNumbers,
            UserId: UserDetails.USERID,
            purchase_org: purchaseOrgId || purchaseOrg,
            broker_code: formData?.broker_code,
            broker_name: brokerName,
            customer_code: customerCode,
            customer_name: customerName,
            // Send EVERY line, including status:0 (removed) ones, so the backend
            // can flip sap_to_pp.status to 0 for removed rows instead of deleting them.
            // Lines with no Vendor Code are dropped entirely rather than sent blank.
            LineDetails: lines
                .map((l, index) => {
                    const plant = form.values[`plant_${index}`];
                    const storage = form.values[`storage_${index}`];
                    const bagType = form.values[`bagType_${index}`];
                    return {
                        ...l,
                        PlantName: plant?.label,
                        StorageLocation: storage?.label,
                        BagType: bagType?.value,
                        ConditionChanges: conditionTables[l.Line] || [],
                        status: l.status === undefined || l.status === null ? 1 : l.status,
                    };
                })
                .filter((l) => l.VendorCode),
            OverAllAmount: overAllAmount,
        };

        showLoader();
        apiPostMethod(
            apiBaseUrl + "CustomMillingMasterController/UpdatePurchaseOrderDetails",
            FrmData
        )
            .then(({ data }) => {
                if (data.success === 1) {
                    ShowToast(data.message || "PO updated successfully");
                    closeModal();
                    getLandingData();
                } else {
                    errorToast(data.error);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    const isView = modalMode === "view";

    // Date filtering/sorting/limiting is done by the backend (see getLandingData);
    // landingData is rendered as-is.
    const dateRange = filterForm.values.dateRange;

    // Lines visible in the grid: hide anything soft-deleted (status 0)
    const visibleLines = lines.filter((l) => l.status !== 0 && l.status !== "0");

    // ─── JSX ─────────────────────────────────────────────────────────────────
    return (
        <Fragment>
            {/* ── Landing Card ── */}
            <Card>
                <CardHeader>
                    <Row style={{ width: "100%", alignItems: "center" }}>
                        <Col>
                            <h5 style={{ margin: 0 }}>Purchase Order List</h5>
                        </Col>
                        <Col md="3" sm="6">
                            <DatePicker
                                form={filterForm}
                                id="dateRange"
                                label=""
                                placeholder="Filter by Date Range"
                                isDateRange
                            />
                        </Col>
                        {dateRange?.start && (
                            <Col md="auto" sm="6">
                                <Button.Ripple
                                    color="secondary"
                                    outline
                                    size="sm"
                                    type="button"
                                    onClick={() => filterForm.setFieldValue("dateRange", undefined)}
                                    title="Clear date filter"
                                >
                                    <X size={14} /> Clear
                                </Button.Ripple>
                            </Col>
                        )}
                    </Row>
                </CardHeader>
                <hr />
                <CardBody>
                    <TableComponent
                        showDownload
                        columns={columns}
                        data={landingData}
                    />
                </CardBody>
            </Card>

            {/* ── Detail Popup Modal ── */}
            <Modal
                isOpen={modalOpen}
                toggle={closeModal}
                size="xl"
                style={{ maxWidth: "96vw" }}
                scrollable
            >
                <ModalHeader
                    toggle={closeModal}
                    style={{
                        background: "#5e72e4",
                        color: "#fff",
                        borderBottom: "none",
                        padding: "14px 20px",
                    }}
                >
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                        {isView ? "View" : "Edit"} Purchase Order
                        {selectedPO?.EBELN && (
                            <Badge
                                color="light"
                                style={{
                                    marginLeft: 12,
                                    color: "#5e72e4",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                }}
                            >
                                {selectedPO.EBELN}
                            </Badge>
                        )}
                    </span>
                </ModalHeader>

                <ModalBody style={{ background: "#f8f9fe", padding: "20px 24px" }}>

                    {/* ── Header Section ── */}
                    <Card style={{ marginBottom: 18, border: "1px solid #e2e8f0" }}>
                        <CardHeader style={{ background: "#eef0fb", padding: "10px 16px" }}>
                            <h6 style={{ margin: 0, color: "#3d4d6a", fontWeight: 600 }}>
                                Header Details
                            </h6>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Purchase Org</Label>
                                        <Input
                                            type="text"
                                            value={purchaseOrg}
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Broker Code</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                placeholder="Enter Broker Code"
                                                name="broker_code"
                                                value={form.values.broker_code || ""}
                                                onChange={form.handleChange}
                                                disabled={isView || brokerLocked}
                                            />
                                            {!isView && (
                                                <InputGroupAddon addonType="append">
                                                    <Button.Ripple
                                                        color="primary"
                                                        type="button"
                                                        disabled={brokerLocked}
                                                        onClick={() => {
                                                            const code = form.values.broker_code;
                                                            if (!code) { errorToast("Please enter Broker Code"); return; }
                                                            apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getVendor/${code}`)
                                                                .then(({ data }) => {
                                                                    if (data.success === true && data.results?.[0]) {
                                                                        setBrokerName(data.results[0].VENDORNAME || "");
                                                                        setBrokerLocked(true);
                                                                    } else {
                                                                        errorToast("Broker not found");
                                                                    }
                                                                })
                                                                .catch(console.error);
                                                        }}
                                                    >
                                                        <Search size={14} />
                                                    </Button.Ripple>
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Broker Name</Label>
                                        <Input type="text" value={brokerName} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Overall Amount</Label>
                                        <Input
                                            type="text"
                                            value={`${Number(overAllAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Segment Code</Label>
                                        <Input type="text" value={headerSegment} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Material Code</Label>
                                        <Input type="text" value={headerMaterialCode} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Material Description</Label>
                                        <Input type="text" value={headerMaterialDes} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Customer Code</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                placeholder="Customer Code"
                                                value={customerCode}
                                                disabled={isView}
                                                onChange={(e) => setCustomerCode(e.target.value)}
                                            />
                                            {!isView && (
                                                <InputGroupAddon addonType="append">
                                                    <Button.Ripple
                                                        color="primary"
                                                        type="button"
                                                        // disabled={customerLocked}
                                                        onClick={() => {
                                                            if (!customerCode) { errorToast("Please enter Customer Code"); return; }
                                                            apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getCustomerCode/${customerCode}`)
                                                                .then(({ data }) => {
                                                                    if (data.success === 1 && data.results?.[0]) {
                                                                        setCustomerName(data.results[0].NAME_1 || "");
                                                                        setCustomerLocked(true);
                                                                    } else {
                                                                        errorToast("Customer not found");
                                                                    }
                                                                })
                                                                .catch(console.error);
                                                        }}
                                                    >
                                                        <Search size={14} />
                                                    </Button.Ripple>
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="6">
                                    <FormGroup>
                                        <Label>Customer Name</Label>
                                        <Input type="text" value={customerName} disabled />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* ── Line Items Grid ── */}
                    <Card style={{ border: "1px solid #e2e8f0" }}>
                        <CardHeader style={{ background: "#eef0fb", padding: "10px 16px" }}>
                            <Row style={{ width: "100%", alignItems: "center", margin: 0 }}>
                                <Col style={{ padding: 0 }}>
                                    <h6 style={{ margin: 0, color: "#3d4d6a", fontWeight: 600 }}>
                                        Line Items
                                        <Badge color="primary" style={{ marginLeft: 10 }}>
                                            {visibleLines.length}
                                        </Badge>
                                    </h6>
                                </Col>
                                {!isView && (
                                    <Col style={{ padding: 0, textAlign: "right" }}>
                                        <Button.Ripple
                                            outline
                                            color="primary"
                                            size="sm"
                                            type="button"
                                            onClick={addNewRow}
                                            title={
                                                !headerSegment
                                                    ? "Header Segment is required before adding a row"
                                                    : "Add Row"
                                            }
                                        >
                                            <Plus size={14} /> Add Row
                                        </Button.Ripple>
                                    </Col>
                                )}
                            </Row>
                        </CardHeader>
                        <CardBody style={{ padding: "12px" }}>
                            <div style={{ width: "100%", overflowX: "auto" }}>
                                <table
                                    className="table table-bordered"
                                    style={{
                                        width: "100%",
                                        minWidth: "2200px",
                                        textAlign: "left",
                                        tableLayout: "fixed",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                ["8%", "Line"],
                                                ["10%", "PO Loading Date"],
                                                ["14%", "Vendor Code"],
                                                ["14%", "Vendor Name"],
                                                ["10%", "Bag Type"],
                                                ["7%", "QTY"],
                                                ["9%", "No Of Vehicles"],
                                                ["7%", "UOM"],
                                                ["7%", "Rate"],
                                                ["10%", "Total Amount"],
                                                ["11%", "Plant Name"],
                                                ["11%", "Storage Location"],
                                                ...(!isView ? [["7%", "Action"]] : []),
                                            ].map(([w, label]) => (
                                                <td
                                                    key={label}
                                                    className="bg-primary text-white text-center"
                                                    width={w}
                                                    style={{ padding: "8px 6px" }}
                                                >
                                                    {label}
                                                </td>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={isView ? 12 : 13}
                                                    className="text-center"
                                                    style={{ color: "#aaa", padding: "24px" }}
                                                >
                                                    No line items found
                                                </td>
                                            </tr>
                                        )}
                                        {lines.map((item, index) => {
                                            const isDeleted = item.status === 0 || item.status === "0";
                                            const rowStyle = isDeleted
                                                ? { textDecoration: "line-through", color: "#aaa", background: "#fbeaea" }
                                                : undefined;
                                            return (
                                            <tr key={item.Line} style={rowStyle}>
                                                <td className="text-center">
                                                    {item.Line}
                                                    {isDeleted && (
                                                        <Badge color="danger" style={{ marginLeft: 6 }}>
                                                            Deleted
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.PoLoadingDate || "—"
                                                    ) : (
                                                        <Input
                                                            type="date"
                                                            value={item.PoLoadingDate || ""}
                                                            onChange={(e) =>
                                                                updateLine(index, "PoLoadingDate", e.target.value)
                                                            }
                                                            style={{ minWidth: 0 }}
                                                        />
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.VendorCode || "—"
                                                    ) : (
                                                        <InputGroup>
                                                            <Input
                                                                type="text"
                                                                placeholder="Vendor Code"
                                                                value={item.VendorCode || ""}
                                                                disabled={item.vendorLocked}
                                                                onChange={(e) =>
                                                                    updateLine(index, "VendorCode", e.target.value)
                                                                }
                                                            />
                                                            <InputGroupAddon addonType="append">
                                                                <Button.Ripple
                                                                    color="primary"
                                                                    size="sm"
                                                                    type="button"
                                                                    disabled={item.vendorLocked}
                                                                    onClick={() => searchVendor(index)}
                                                                >
                                                                    <Search size={12} />
                                                                </Button.Ripple>
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                    )}
                                                </td>

                                                <td className="text-center">{item.VendorName || "—"}</td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.BagType || "—"
                                                    ) : (
                                                        <CustomDropdownInput
                                                            url={
                                                                apiBaseUrl +
                                                                "CustomMillingMasterController/getBagType"
                                                            }
                                                            form={form}
                                                            id={`bagType_${index}`}
                                                        />
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.Qty || "—"
                                                    ) : (
                                                        <Input
                                                            type="text"
                                                            placeholder="Qty"
                                                            value={item.Qty || ""}
                                                            onChange={(e) =>
                                                                updateLine(index, "Qty", e.target.value)
                                                            }
                                                        />
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.NoOfVehicles || "—"
                                                    ) : (
                                                        <Input
                                                            type="text"
                                                            placeholder="No Of Vehicles"
                                                            value={item.NoOfVehicles || ""}
                                                            onChange={(e) =>
                                                                updateLine(index, "NoOfVehicles", e.target.value)
                                                            }
                                                        />
                                                    )}
                                                </td>

                                                <td className="text-center">{item.Uom || "—"}</td>
                                                <td className="text-center">{item.Rate || 0}</td>
                                                <td className="text-center">
                                                    {Number(item.TotalAmount || 0).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.PlantName || "—"
                                                    ) : (
                                                        <CustomDropdownInput
                                                            url={
                                                                apiBaseUrl +
                                                                `CustomMillingMasterController/getPlantName/${UserDetails.USERID}`
                                                            }
                                                            form={form}
                                                            id={`plant_${index}`}
                                                        />
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {isView || isDeleted ? (
                                                        item.StorageLocation || "—"
                                                    ) : form.values[`plant_${index}`]?.value ? (
                                                        <CustomDropdownInput
                                                            url={
                                                                apiBaseUrl +
                                                                `CustomMillingMasterController/getStorageLocation/${form.values[`plant_${index}`]?.value}`
                                                            }
                                                            form={form}
                                                            id={`storage_${index}`}
                                                        />
                                                    ) : (
                                                        <span style={{ color: "#aaa", fontSize: "0.8rem" }}>
                                                            Select Plant first
                                                        </span>
                                                    )}
                                                </td>

                                                {!isView && (
                                                    <td className="text-center">
                                                        {isDeleted ? (
                                                            <Button.Ripple
                                                                color="success"
                                                                size="sm"
                                                                type="button"
                                                                title="Revoke Change"
                                                                onClick={() => revokeLine(index)}
                                                            >
                                                                <RotateCcw size={13} />
                                                            </Button.Ripple>
                                                        ) : (
                                                            <Button.Ripple
                                                                color="danger"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => removeLine(index)}
                                                            >
                                                                <X size={13} />
                                                            </Button.Ripple>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Condition Changes ── */}
                            {lines.map((line) => (
                                <Row key={line.Line} style={{ marginTop: 16 }}>
                                    <Col md="8" sm="12">
                                        <table className="table table-bordered" style={{ fontSize: "0.82rem" }}>
                                            <thead>
                                                <tr>
                                                    <td
                                                        colSpan={isView ? 4 : 5}
                                                        className="bg-primary text-white text-center"
                                                        style={{ padding: "6px" }}
                                                    >
                                                        Condition Changes — Line {line.Line}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    {["Condition Type", "Condition Description", "Rate", "Total Amount"].map(
                                                        (h) => (
                                                            <td
                                                                key={h}
                                                                className="bg-primary text-white text-center"
                                                                style={{ padding: "6px" }}
                                                            >
                                                                {h}
                                                            </td>
                                                        )
                                                    )}
                                                    {!isView && (
                                                        <td
                                                            className="bg-primary text-white text-center"
                                                            style={{ padding: "6px" }}
                                                        >
                                                            Action
                                                        </td>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(conditionTables[line.Line] || []).length === 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={isView ? 4 : 5}
                                                            className="text-center"
                                                            style={{ color: "#aaa", padding: "14px" }}
                                                        >
                                                            No conditions
                                                        </td>
                                                    </tr>
                                                )}
                                                {(conditionTables[line.Line] || []).map((cond, ci) => {
                                                    const condDeleted = cond.status === 0 || cond.status === "0";
                                                    const condRowStyle = condDeleted
                                                        ? { textDecoration: "line-through", color: "#aaa", background: "#fbeaea" }
                                                        : undefined;
                                                    return (
                                                        <tr key={ci} style={condRowStyle}>
                                                            <td className="text-center">
                                                                {cond.condition_type_code}
                                                                {condDeleted && (
                                                                    <Badge color="danger" style={{ marginLeft: 6 }}>
                                                                        Deleted
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="text-center">{cond.condition_description}</td>
                                                            <td className="text-center">{cond.rate}</td>
                                                            <td className="text-center">
                                                                {((cond.rate || 0) * (line.Qty || 0)).toFixed(2)}
                                                            </td>
                                                            {!isView && (
                                                                <td className="text-center">
                                                                    {condDeleted ? (
                                                                        <Button.Ripple
                                                                            color="success"
                                                                            size="sm"
                                                                            type="button"
                                                                            title="Revoke Change"
                                                                            onClick={() => {
                                                                                // Revoke: flip status back to 1, undoing
                                                                                // a Remove done earlier in this session.
                                                                                const updatedRows = conditionTables[
                                                                                    line.Line
                                                                                ].map((c, i) =>
                                                                                    i === ci ? { ...c, status: 1 } : c
                                                                                );
                                                                                const newConds = {
                                                                                    ...conditionTables,
                                                                                    [line.Line]: updatedRows,
                                                                                };
                                                                                setConditionTables(newConds);
                                                                                recalculateOverAllAmount(lines, newConds);
                                                                            }}
                                                                        >
                                                                            <RotateCcw size={13} />
                                                                        </Button.Ripple>
                                                                    ) : (
                                                                        <Button.Ripple
                                                                            color="danger"
                                                                            size="sm"
                                                                            type="button"
                                                                            onClick={() => {
                                                                                // Soft-delete: flip status to 0 instead of
                                                                                // removing the row, so the backend receives
                                                                                // the full condition array with the removed
                                                                                // row marked inactive.
                                                                                const updatedRows = conditionTables[
                                                                                    line.Line
                                                                                ].map((c, i) =>
                                                                                    i === ci ? { ...c, status: 0 } : c
                                                                                );
                                                                                const newConds = {
                                                                                    ...conditionTables,
                                                                                    [line.Line]: updatedRows,
                                                                                };
                                                                                setConditionTables(newConds);
                                                                                recalculateOverAllAmount(lines, newConds);
                                                                            }}
                                                                        >
                                                                            Remove
                                                                        </Button.Ripple>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            ))}
                        </CardBody>
                    </Card>
                </ModalBody>

                <ModalFooter style={{ background: "#f8f9fe", borderTop: "1px solid #e2e8f0" }}>
                    <Button.Ripple outline color="secondary" type="button" onClick={closeModal}>
                        <ArrowLeft size={14} /> Close
                    </Button.Ripple>
                    {!isView && (
                        <Button.Ripple color="primary" type="button" onClick={submitEdit}>
                            <Check size={14} /> Update PO
                        </Button.Ripple>
                    )}
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default PurchaseOrderEdit;