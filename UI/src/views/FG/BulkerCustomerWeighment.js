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
import { HrLine } from "../common/HrLine";
import { errorToast, ShowToast } from "../../helper/appHelper";
import Uploader from "../Uploader";
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

const CBulkerCoustomerWeight = () => {
    const [tableData, setTableData] = useState([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    /* Customer weights */
    const [custFirstWeight, setCustFirstWeight] = useState("");
    const [custSecondWeight, setCustSecondWeight] = useState("");
    const [custNetWeight, setCustNetWeight] = useState(0);
    const [difference, setDifference] = useState(0);

    /* Attachment */
    const [attachedFiles, setAttachedFiles] = useState({});
    const [customerWeightCopyName, setCustomerWeightCopyName] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [newNetWeight, setNewNetWeight] = useState(0);

    const { showLoader, hideLoader } = useLoader();

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        loadTableData();
    }, []);

    const loadTableData = async () => {
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Gate/getBulkervehiclelist"
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

    /* ================= FILE HANDLERS ================= */
    const handleFileChange = (file, id) => {
        setAttachedFiles((prev) => ({
            ...prev,
            [id]: file,
        }));

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewType(file.type);
        }
    };

    /* ================= CALCULATIONS ================= */
    /* ================= CUSTOMER NET WEIGHT CALCULATION ================= */
    useEffect(() => {
        const bulkerActual = Number(selectedRow?.bulkerEmptyWeight) || 0;
        const secondWeight = Number(selectedRow?.secondWeight) || 0;
        const customerNet = Number(custNetWeight) || 0;

        const calculatedNewNet = secondWeight - bulkerActual;

        setNewNetWeight(calculatedNewNet);
        setDifference(calculatedNewNet - customerNet);
    }, [custNetWeight, selectedRow]);

    /* ================= ACTIONS ================= */
    const handleView = (row) => {
        setSelectedRow(row);
        setCustFirstWeight("");
        setCustSecondWeight("");
        setCustNetWeight(0);
        setDifference(0);
        setAttachedFiles({});
        setPreviewUrl(null);
        setPreviewType(null);
        setViewModalOpen(true);
    };
    const UserDetails = useSelector((state) => state?.auth?.userData || {});

    const handleSave = async () => {
        if (!custNetWeight) {
            errorToast("Please enter Customer Net Weight");
            return;
        }

        if (!attachedFiles.customer_weight_copy) {
            errorToast("Please attach Customer Weighment Copy");
            return;
        }

        // existing file name (if already saved earlier)
        let customerWeightCopyFileName = customerWeightCopyName || "";

        /* ---- Upload customer weighment file to SAP ---- */
        if (attachedFiles.customer_weight_copy) {
            const postdataFile = new FormData();
            postdataFile.append("form_name", "gatepro");
            postdataFile.append(
                "ponumber",
                selectedRow?.invoiceNumber || "NA"
            );
            postdataFile.append(
                "VA_Number",
                selectedRow?.vaNumber || "NA"
            );
            postdataFile.append("SubFolder", "Customer_Weighment");
            postdataFile.append(
                "file[]",
                attachedFiles.customer_weight_copy
            );

            try {
                showLoader();
                const uploadResp = await apiPostMethod(
                    sapFileShare,
                    postdataFile,
                    "File"
                );

                if (uploadResp?.data?.success) {
                    const uploaded = uploadResp.data.files?.[0] || {};
                    customerWeightCopyFileName = uploaded.updname || "";
                } else {
                    errorToast("Customer weighment upload failed");
                    hideLoader();
                    return;
                }
            } catch (err) {
                console.error(err);
                errorToast("Customer weighment upload failed");
                hideLoader();
                return;
            } finally {
                hideLoader();
            }
        }

        /* ---- Save customer weight details ---- */
        const postData = {
            gateInOutInfoId: selectedRow.id,
            customerNetWeight: custNetWeight,
            difference: difference,
            NagaOutsideWBCopy: customerWeightCopyFileName,
            confirmed_by: UserDetails.USERID,
        };
        showLoader();
        try {
            const res = await apiPostMethod(
                apiBaseUrl + "GatePro/Gate/saveCustomerWeight",
                postData
            );

            if (res?.data?.success == true) {
                ShowToast("Customer weight saved successfully");
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast(res?.data?.message || "Failed to save customer weight");
            }
        } catch {
            errorToast("Failed to save customer weight");
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
                    <CardTitle>Bulker Customer Weight</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* ================= VIEW MODAL ================= */}
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
                                <Input
                                    type="number"
                                    value={custNetWeight}
                                    onChange={(e) => setCustNetWeight(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <FormGroup>
                                <Label>Difference</Label>
                                <Input value={difference} disabled />
                            </FormGroup>
                        </Col>


                        <Col md="6" className="mt-2">
                            <div style={{ display: "flex", gap: 8 }}>
                                <Uploader
                                    setAttachment={handleFileChange}
                                    label={"Customer Weighment Copy"}
                                    title="Pdf"
                                    id={"customer_weight_copy"}
                                />
                            </div>
                        </Col>
                        <Col md="8" className="mt-2">
                            {previewUrl && (
                                <div className="border p-2" style={{ background: "#fff" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <strong>Attachment Preview</strong>
                                        <div>
                                            <a href={previewUrl} target="_blank" rel="noreferrer">
                                                <Button size="sm" outline color="primary">
                                                    Open in new tab
                                                </Button>
                                            </a>
                                            &nbsp;
                                            <Button
                                                size="sm"
                                                outline
                                                color="danger"
                                                onClick={() => {
                                                    // clear attachment and preview
                                                    setAttachedFiles((prev) => ({
                                                        ...prev,
                                                        customer_weight_copy: null,
                                                    }));
                                                    setPreviewUrl(null);
                                                    setPreviewType(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Preview Content */}
                                    {previewType?.includes("pdf") ? (
                                        <iframe
                                            src={previewUrl}
                                            title="PDF Preview"
                                            width="100%"
                                            height="300px"
                                            style={{ border: "none" }}
                                        />
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ maxWidth: "100%", maxHeight: 300 }}
                                        />
                                    )}
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end">
                            <Button color="primary" onClick={handleSave}>
                                Save
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

export default CBulkerCoustomerWeight;
