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
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { HrLine } from "../common/HrLine";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";

/* ================= TABLE COLUMNS ================= */
const taColumns = [
    { name: "Truck No", selector: "vehicleNo", sortable: true },
    { name: "Dispatch Plant", selector: "PLANT_NAME", sortable: true },
    { name: "Vendor", selector: "customerName", sortable: true, minWidth: "250px", },
    { name: "Invoice Number", selector: "invoiceNumber", sortable: true },
    {
        name: "Gate Out Date",
        sortable: true,
        cell: (row) =>
            row.gateOutDateStamp
                ? new Date(row.gateOutDateStamp).toISOString().slice(0, 10)
                : "-"
    }
];

const BulkerCustomerWeighmentApproval = () => {
    const [tableData, setTableData] = useState([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [newNetWeight, setNewNetWeight] = useState(0);
    const [difference, setDifference] = useState(0);
    const [differenceInvoice, setDifferenceInvoice] = useState(0);
    const { showLoader, hideLoader } = useLoader();

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        loadTableData();
    }, []);

    const loadTableData = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Gate/getBulkerCustomerWeightApprovalList"
            );
            if (res?.data?.success) {
                setTableData(res.data.results || []);
            } else {
                errorToast("Failed to fetch bulker vehicle list");
            }
        } catch {
            errorToast("Something went wrong");
        } finally {
            hideLoader();
        }
    };

    /* ================= CALCULATIONS ================= */
    useEffect(() => {
        const bulkerActual = Number(selectedRow?.bulkerEmptyWeight) || 0;
        const secondWeight = Number(selectedRow?.secondWeight) || 0;
        const customerNet = Number(selectedRow?.customerNetWeight) || 0;
        const deliveryQty = Number(selectedRow?.deliveryQty) || 0;

        const calculatedNewNet = secondWeight - bulkerActual;

        setNewNetWeight(calculatedNewNet);
        setDifference(selectedRow?.difference ?? calculatedNewNet - customerNet);
        setDifferenceInvoice(selectedRow?.customerInvoicedifference ?? selectedRow?.customerInvoicedifference - customerNet);
    }, [selectedRow]);

    /* ================= ACTIONS ================= */
    const handleView = (row) => {
        setSelectedRow(row);
        setViewModalOpen(true);
    };
    const UserDetails = useSelector((state) => state?.auth?.userData || {});
    
    const handleApprove = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Gate/approveBulkerCustomerWeight",
                { gateInOutInfoId: selectedRow.id,confirmed_by: UserDetails.USERID, }
            );
            if (res?.data?.success) {
                ShowToast("Approved successfully");
                setViewModalOpen(false);
                loadTableData();
            } else {
                errorToast(res?.data?.message || "Failed to approve");
            }
        } catch {
            errorToast("Failed to approve");
        } finally {
            hideLoader();
        }
    };

    const handleReject = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Gate/rejectBulkerCustomerWeight",
                { gateInOutInfoId: selectedRow.id }
            );
            if (res?.data?.success) {
                ShowToast("Rejected successfully");
                setViewModalOpen(false);
                loadTableData();
            } else {
                errorToast(res?.data?.message || "Failed to reject");
            }
        } catch {
            errorToast("Failed to reject");
        } finally {
            hideLoader();
        }
    };

    const columns = [
        ...taColumns,
        {
            name: "Actions",
            cell: (row) => (
                <Button size="sm" color="primary" onClick={() => handleView(row)}>
                    View
                </Button>
            ),
        },
    ];

    /* ================= JSX ================= */
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Bulker Customer Weight Approval</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* ================= VIEW MODAL (READ ONLY) ================= */}
            <Modal
                isOpen={viewModalOpen}
                toggle={() => setViewModalOpen(false)}
                size="xl"
                centered
            >
                <ModalHeader toggle={() => setViewModalOpen(false)}>
                    Bulker Vehicle Details
                </ModalHeader>

                <ModalBody>
                    <h4 className="text-primary">
                        <u>General Info</u>
                    </h4>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>VA Number</Label>
                                <Input value={selectedRow?.vaNumber || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input value={selectedRow?.vehicleNo || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Driver Mobile</Label>
                                <Input value={selectedRow?.driverMobileNumber || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input value={selectedRow?.PLANT_NAME || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Trip Sheet No</Label>
                                <Input value={selectedRow?.tripSheetNumber || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>Truck Type</Label>
                                <Input value={selectedRow?.truckType || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <HrLine />

                    {/* ---------- DELIVERY INFO ---------- */}
                    <h4 className="text-primary">
                        <u>Delivery Info</u>
                    </h4>
                    <h5 className="text-primary">
                        <u>{selectedRow?.moduleType}</u>
                    </h5>
                    <Row>
                        <Col md="3">
                            <FormGroup>
                                <Label>Delivery Number</Label>
                                <Input value={selectedRow?.deliveryNumber || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Invoice Number</Label>
                                <Input value={selectedRow?.invoiceNumber || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Invoice Qty</Label>
                                <Input value={selectedRow?.deliveryQty || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <HrLine />

                    {/* ---------- WEIGHMENT INFO ---------- */}
                    <h4 className="text-primary">
                        <u>Weighment Info</u>
                    </h4>
                    <Row>
                        <Col md="3">
                            <FormGroup>
                                <Label>Document No</Label>
                                <Input value={selectedRow?.documentNumber || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3">
                            <FormGroup>
                                <Label>Bulker Actual Weight</Label>
                                <Input value={selectedRow?.bulkerEmptyWeight || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>First Weight</Label>
                                <Input value={selectedRow?.firstWeight || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Second Weight</Label>
                                <Input value={selectedRow?.secondWeight || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3">
                            <FormGroup>
                                <Label> Net Weight</Label>
                                <Input value={newNetWeight} disabled />
                            </FormGroup>
                        </Col>

                    </Row>

                    <HrLine />
                    <h4 className="text-primary mt-3">
                        <u>Customer Point Details</u>
                    </h4>
                    <Row>
                        <Col md="3">
                            <FormGroup>
                                <Label>Customer Net Weight</Label>
                                <Input value={selectedRow?.customerNetWeight || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Weight Difference</Label>
                                <Input value={difference} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3">
                            <FormGroup>
                                <Label>Invoice Qty Difference</Label>
                                <Input value={differenceInvoice} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="6" className="mt-2">
                            {selectedRow?.NagaOutsideWBCopy ? (
                                <div className="border p-2" style={{ background: "#fff" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <strong>Customer Weighment Copy</strong>
                                        <a
                                            href={selectedRow.NagaOutsideWBCopy}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Button size="sm" outline color="primary">
                                                Open in new tab
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted">No attachment available</span>
                            )}
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col className="d-flex justify-content-between">
                            <Button color="danger" onClick={handleReject}>
                                Reject
                            </Button>
                            <div>
                                <Button color="success" onClick={handleApprove}>
                                    Approve
                                </Button>
                                &nbsp;
                                <Button
                                    color="secondary"
                                    onClick={() => setViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default BulkerCustomerWeighmentApproval;
