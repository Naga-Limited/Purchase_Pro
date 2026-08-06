import React, { Fragment, useState, useEffect } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import {
    Row, Col, Button, Label, FormGroup, Input, InputGroup, Card, CardHeader,
    CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Badge,
} from "reactstrap";
import { ArrowLeft, Search, Eye, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

/*
  PurchaseOrderApproval - Read-only Level 1 / Level 2 approval screen for
  Purchase Orders. Unlike PurchaseOrderChange.js, this screen never edits any
  line/condition detail — it only lists POs pending at the given level and
  lets the approver Approve (advance status) or Reject (status -> 0) the
  whole PO, keyed by PO Number (EBELN), against the sap_to_pp table.
*/

const statusColor = (status) => (
    status === "1" || status === 1 ? "primary"
        : status === "2" || status === 2 ? "warning"
        : status === "3" || status === 3 ? "success"
        : "danger"
);

const statusLabel = (status) => (
    status === "1" || status === 1 ? "MG Approve"
        : status === "2" || status === 2 ? "CMG Approve"
        : status === "3" || status === 3 ? "Completed"
        : "Rejected"
);

const LEVEL_CONFIG = {
    1: {
        title: "Purchase Order Approval - Level 1",
        listEndpoint: "CustomMillingMasterController/getPurchaseOrderListLevel1",
        approveEndpoint: "CustomMillingMasterController/ApprovePurchaseOrderLevel1",
        approveLabel: "Approve (Level 1)",
    },
    2: {
        title: "Purchase Order Approval - Level 2",
        listEndpoint: "CustomMillingMasterController/getPurchaseOrderListLevel2",
        approveEndpoint: "CustomMillingMasterController/ApprovePurchaseOrderLevel2",
        approveLabel: "Approve (Level 2)",
    },
};

const rejectEndpoint = "CustomMillingMasterController/RejectPurchaseOrder";

const PurchaseOrderApproval = ({ level }) => {
    const config = LEVEL_CONFIG[level];
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [landingData, setLandingData] = useState([]);
    const [searchPO, setSearchPO] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);

    const [lines, setLines] = useState([]);
    const [conditionTables, setConditionTables] = useState({});
    const [overAllAmount, setOverAllAmount] = useState(0);
    const [brokerName, setBrokerName] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [headerMaterialCode, setHeaderMaterialCode] = useState("");
    const [headerMaterialDes, setHeaderMaterialDes] = useState("");
    const [headerSegment, setHeaderSegment] = useState("");
    const [purchaseOrg, setPurchaseOrg] = useState("");
    const [poNumbers, setPONumber] = useState("");

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

    const resetPopupState = () => {
        setLines([]);
        setConditionTables({});
        setOverAllAmount(0);
        setBrokerName("");
        setCustomerName("");
        setHeaderMaterialCode("");
        setHeaderMaterialDes("");
        setHeaderSegment("");
        setPurchaseOrg("");
        setPONumber("");
    };

    const openModal = (row) => {
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

    const fetchPODetail = (purchaseOrderId) => {
        showLoader();
        apiPostMethod(
            apiBaseUrl +
            `CustomMillingMasterController/getPurchaseOrderInfo/${purchaseOrderId}/${UserDetails.USERID}`
        )
            .then(({ data }) => {
                if (data.success === 1) {
                    const rec = data.results[0];
                    setBrokerName(rec.brokerName || "");
                    setCustomerName(rec.customerName || "");
                    setHeaderSegment(rec.segmentCode || "");
                    setHeaderMaterialCode(rec.materialCode || "");
                    setHeaderMaterialDes(rec.materialDes || "");
                    setOverAllAmount(rec.overAllAmount || 0);
                    setPurchaseOrg(rec.purchaseOrgName || "");
                    setPONumber(rec.poNumber);

                    const fetchedLines = (rec.LineDetails || rec.lines || []).map((l, i) => ({
                        ...l,
                        Line: l.Line || (i + 1) * 10,
                        TotalAmount: l.TotalAmount || 0,
                        status: l.status === undefined || l.status === null ? 1 : l.status,
                    }));
                    setLines(fetchedLines);

                    const conds = {};
                    fetchedLines.forEach((l) => {
                        if (l.ConditionChanges && l.ConditionChanges.length) {
                            conds[l.Line] = l.ConditionChanges;
                        }
                    });
                    setConditionTables(conds);
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

    const handleApprove = () => {
        confirmDialog({
            title: `Approve PO ${selectedPO?.EBELN}?`,
            description: "Are you sure you want to approve this Purchase Order?",
        }).then((result) => {
            if (!result) return;
            showLoader();
            apiPostMethod(apiBaseUrl + config.approveEndpoint, { EBELN: selectedPO?.EBELN, UserId: UserDetails.USERID })
                .then(({ data }) => {
                    if (data.success === 1) {
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
        confirmDialog({
            title: `Reject PO ${selectedPO?.EBELN}?`,
            description: "Are you sure you want to reject this Purchase Order?",
        }).then((result) => {
            if (!result) return;
            showLoader();
            apiPostMethod(apiBaseUrl + rejectEndpoint, { EBELN: selectedPO?.EBELN, UserId: UserDetails.USERID })
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

    const filteredData = searchPO
        ? landingData.filter((r) => String(r.EBELN || "").toLowerCase().includes(searchPO.toLowerCase()))
        : landingData;

    const columns = [
        { name: "PO NUMBER", selector: "EBELN", sortable: true, minWidth: "140px",
            cell: (row) => <strong style={{ color: "#5e72e4", letterSpacing: "0.3px" }}>{row.EBELN}</strong> },
        { name: "PURCHASE ORG", selector: "PURCHASE_ORG_DESC", sortable: true, minWidth: "140px" },
        { name: "BROKER NAME", selector: "BROCKER_NAME", sortable: true, minWidth: "160px" },
        { name: "CUSTOMER NAME", selector: "customerName", sortable: true, minWidth: "160px" },
        { name: "OVERALL AMOUNT", selector: "totalAmount", sortable: true, minWidth: "150px" },
        { name: "STATUS", selector: "status", sortable: true, minWidth: "110px",
            cell: (row) => <Badge color={statusColor(row.status)}>{statusLabel(row.status)}</Badge> },
        {
            name: "ACTIONS", selector: "EBELN", minWidth: "120px",
            cell: (row) => (
                <Button.Ripple color="info" size="sm" type="button" onClick={() => openModal(row)} title="View">
                    <Eye size={13} /> View
                </Button.Ripple>
            ),
        },
    ];

    const activeLines = lines.filter((l) => l.status !== 0 && l.status !== "0");

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
                                    placeholder="Search by PO Number..."
                                    value={searchPO}
                                    onChange={(e) => setSearchPO(e.target.value)}
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

            <Modal isOpen={modalOpen} toggle={closeModal} size="xl" style={{ maxWidth: "96vw" }} scrollable>
                <ModalHeader
                    toggle={closeModal}
                    style={{ background: "#5e72e4", color: "#fff", borderBottom: "none", padding: "14px 20px" }}
                >
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                        View Purchase Order
                        {selectedPO?.EBELN && (
                            <Badge
                                color="light"
                                style={{ marginLeft: 12, color: "#5e72e4", fontSize: "0.85rem", fontWeight: 700 }}
                            >
                                {selectedPO.EBELN}
                            </Badge>
                        )}
                    </span>
                </ModalHeader>

                <ModalBody style={{ background: "#f8f9fe", padding: "20px 24px" }}>
                    <Card style={{ marginBottom: 18, border: "1px solid #e2e8f0" }}>
                        <CardHeader style={{ background: "#eef0fb", padding: "10px 16px" }}>
                            <h6 style={{ margin: 0, color: "#3d4d6a", fontWeight: 600 }}>Header Details</h6>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md="3" sm="6">
                                    <FormGroup><Label>Purchase Org</Label><Input type="text" value={purchaseOrg} disabled /></FormGroup>
                                </Col>
                                <Col md="3" sm="6">
                                    <FormGroup><Label>Broker Name</Label><Input type="text" value={brokerName} disabled /></FormGroup>
                                </Col>
                                <Col md="3" sm="6">
                                    <FormGroup><Label>Customer Name</Label><Input type="text" value={customerName} disabled /></FormGroup>
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
                                    <FormGroup><Label>Segment Code</Label><Input type="text" value={headerSegment} disabled /></FormGroup>
                                </Col>
                                <Col md="3" sm="6">
                                    <FormGroup><Label>Material Code</Label><Input type="text" value={headerMaterialCode} disabled /></FormGroup>
                                </Col>
                                <Col md="6" sm="12">
                                    <FormGroup><Label>Material Description</Label><Input type="text" value={headerMaterialDes} disabled /></FormGroup>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Card style={{ border: "1px solid #e2e8f0" }}>
                        <CardHeader style={{ background: "#eef0fb", padding: "10px 16px" }}>
                            <h6 style={{ margin: 0, color: "#3d4d6a", fontWeight: 600 }}>
                                Line Items <Badge color="primary" style={{ marginLeft: 10 }}>{activeLines.length}</Badge>
                            </h6>
                        </CardHeader>
                        <CardBody style={{ padding: "12px" }}>
                            <div style={{ width: "100%", overflowX: "auto" }}>
                                <table
                                    className="table table-bordered"
                                    style={{ width: "100%", minWidth: "1600px", textAlign: "left", tableLayout: "fixed", fontSize: "0.85rem" }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                ["8%", "Line"], ["10%", "PO Loading Date"], ["14%", "Vendor Code"],
                                                ["14%", "Vendor Name"], ["10%", "Bag Type"], ["7%", "QTY"],
                                                ["9%", "No Of Vehicles"], ["7%", "UOM"], ["7%", "Rate"],
                                                ["10%", "Total Amount"], ["11%", "Plant Name"], ["11%", "Storage Location"],
                                            ].map(([w, label]) => (
                                                <td key={label} className="bg-primary text-white text-center" width={w} style={{ padding: "8px 6px" }}>
                                                    {label}
                                                </td>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.length === 0 && (
                                            <tr>
                                                <td colSpan={12} className="text-center" style={{ color: "#aaa", padding: "24px" }}>
                                                    No line items found
                                                </td>
                                            </tr>
                                        )}
                                        {lines.map((item) => {
                                            const isDeleted = item.status === 0 || item.status === "0";
                                            const rowStyle = isDeleted
                                                ? { textDecoration: "line-through", color: "#aaa", background: "#fbeaea" }
                                                : undefined;
                                            return (
                                                <tr key={item.Line} style={rowStyle}>
                                                    <td className="text-center">
                                                        {item.Line}
                                                        {isDeleted && <Badge color="danger" style={{ marginLeft: 6 }}>Deleted</Badge>}
                                                    </td>
                                                    <td className="text-center">{item.PoLoadingDate || "—"}</td>
                                                    <td className="text-center">{item.VendorCode || "—"}</td>
                                                    <td className="text-center">{item.VendorName || "—"}</td>
                                                    <td className="text-center">{item.BagType || "—"}</td>
                                                    <td className="text-center">{item.Qty || "—"}</td>
                                                    <td className="text-center">{item.NoOfVehicles || "—"}</td>
                                                    <td className="text-center">{item.Uom || "—"}</td>
                                                    <td className="text-center">{item.Rate || 0}</td>
                                                    <td className="text-center">
                                                        {Number(item.TotalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="text-center">{item.PlantName || "—"}</td>
                                                    <td className="text-center">{item.StorageLocation || "—"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {lines.map((line) => (
                                <Row key={line.Line} style={{ marginTop: 16 }}>
                                    <Col md="8" sm="12">
                                        <table className="table table-bordered" style={{ fontSize: "0.82rem" }}>
                                            <thead>
                                                <tr>
                                                    <td colSpan={4} className="bg-primary text-white text-center" style={{ padding: "6px" }}>
                                                        Condition Changes — Line {line.Line}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    {["Condition Type", "Condition Description", "Rate", "Total Amount"].map((h) => (
                                                        <td key={h} className="bg-primary text-white text-center" style={{ padding: "6px" }}>{h}</td>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(conditionTables[line.Line] || []).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="text-center" style={{ color: "#aaa", padding: "14px" }}>
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
                                                                {condDeleted && <Badge color="danger" style={{ marginLeft: 6 }}>Deleted</Badge>}
                                                            </td>
                                                            <td className="text-center">{cond.condition_description}</td>
                                                            <td className="text-center">{cond.rate}</td>
                                                            <td className="text-center">{((cond.rate || 0) * (line.Qty || 0)).toFixed(2)}</td>
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

export default PurchaseOrderApproval;
