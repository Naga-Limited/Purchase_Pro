import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod } from "../../../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import moment from "moment";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown, Upload } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";

export const taColumns = [
    { name: "TRUCK/CONTAINER/RR NO", selector: "VEHICAL_NO", sortable: true },
    { name: "PLANT CODE", selector: "PLANT_ID", sortable: true },
    { name: "VEHICLE TYPE", selector: "VEHICLE_TYPE", sortable: true },
    { name: "PO NUMBER", selector: "ZPO_NUMBER", sortable: true },
    { name: "LINE", selector: "ZPO_LINE_ITEM", sortable: true },
    { name: "VENDOR CODE", selector: "ZSUPPLIER_CODE", sortable: true },
    { name: "INVOICE NO", selector: "ZSUPPLIER_INV_NO", sortable: true },
    { name: "INVOICE DATE", selector: "ZSUPPLIER_INV_DT", sortable: true },
];

const WheatPurchaseInvoiceChange = () => {
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => state?.auth ? state.auth.userData : {});
    
    const [landingData, setLandingData] = useState([]);
    const [popup, setPopup] = useState(false);
    const [popupData, setPopupData] = useState({
        gateInOutInfoId: "",
        poNumbers: "",
        invoiceNo: "",
        invoiceDate: ""
    });
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);

    const form = useFormik({
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() {}
    });

    // ======================
    // LOAD TABLE DATA
    // ======================
    const getLoadingData = () => {
        const formData = form.values;
        const fromDateMS = formData.date ? new Date(moment(formData.date.start).format("YYYY-MM-DD")).getTime() : 0;
        const toDateMS = formData.date ? new Date(moment(formData.date.end).format("YYYY-MM-DD")).getTime() : 0;

        showLoader();
        apiPostMethod(`${apiBaseUrl}MigoAutomationController/InvoiceDetailsChangeWheatPurchase/${fromDateMS}/${toDateMS}`)
            .then((res) => {
                if (res.data.success) {
                    setLandingData(res.data.results);
                } else {
                    errorToast(res.data.message);
                    setLandingData([]);
                }
            })
            .catch(() => errorToast("Something went wrong"))
            .finally(() => hideLoader());
    };

    // ======================
    // OPEN POPUP
    // ======================
    const openPopup = (row) => {
        let fileURL = row.INV_COPY;
        setPopupData({
            gateInOutInfoId: row?.SUP_VE_REFID,
            poNumbers: row.poNumbers,
            invoiceNo: row.ZSUPPLIER_INV_NO,
            invoiceDate: row.ZSUPPLIER_INV_DT
        });
        setInvoiceFile(null);
        setPreviewURL(fileURL);
        setPopup(true);
    };

    // ======================
    // FILE SELECT
    // ======================
    const handleInvoiceFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setInvoiceFile(file);
        setPreviewURL(URL.createObjectURL(file));
    };

    // ======================
    // UPLOAD FILE FUNCTION
    // ======================
    const uploadInvoice = () => {
    // Prepare fdata with necessary fields
    const fdata = {
        gateInOutInfoId: popupData.gateInOutInfoId,
        poNumbers: popupData.poNumbers,
        invoiceNo: popupData.invoiceNo,
        invoiceDate: popupData.invoiceDate,
        userInfoId: UserDetails.USERID,
        invoiceCopy: previewURL // to be set after file upload
    };

    // If a file is selected, prepare FormData for upload
    if (invoiceFile) {
        let postdata = new FormData();
        postdata.append("file[]", invoiceFile); // similar to attachedFiles loop
        postdata.append("form_name", "SDI");
        postdata.append("SubFolder", "SDI");

        showLoader();
        apiPostMethod(sapFileShare, postdata, "File")
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    // Save uploaded file path in fdata
                    fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
                    // Submit fdata to update invoice
                    submitInvoice(fdata);
                } else {
                    errorToast("File upload failed");
                }
            })
            .catch(() => errorToast("Something went wrong during file upload"))
            .finally(() => hideLoader());
    } else {
        // No file selected, submit directly
        submitInvoice(fdata);
    }
    };

// Function to call API to save invoice details
    const submitInvoice = (fdata) => {
        showLoader();
        apiPostMethod(`${apiBaseUrl}MigoAutomationController/UpdateInvoiceWheatPurchase`, fdata)
            .then((res) => {
                if (res.data.success) {
                    ShowToast("Invoice Updated Successfully!");
                    setPopup(false);
                    getLoadingData();
                } else {
                    errorToast(res.data.message);
                }
            })
            .catch(() => errorToast("Update failed"))
            .finally(() => hideLoader());
    };

    // ======================
    // ACTION COLUMN
    // ======================
    const actionsCol = {
        name: "ACTIONS",
        selector: "actions",
        minWidth: "200px",
        cell: (row) => (
            <Button color="primary" size="sm" onClick={() => openPopup(row)}>
                Invoice Correction
            </Button>
        )
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            {/* FILTER SECTION */}
            <Card>
                <CardHeader>
                    <h5>Invoice Details Change Screen</h5>
                    <RefreshBlock1 />
                </CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>
                        <Col md="2">
                            <FormGroup className="mt-2">
                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={!form.values.date}
                                    onClick={getLoadingData}
                                >
                                    View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* TABLE */}
            {landingData.length > 0 && (
                <Card>
                    <CardHeader><h5>Document Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card>
            )}

            {/* POPUP */}
            <Modal isOpen={popup} centered size="lg">
                <ModalHeader>
                    <h5>Invoice Correction</h5>
                    <Button close onClick={() => setPopup(false)}></Button>
                </ModalHeader>

                <ModalBody>
                    <Row>
                        <Col md="6">
                            <Label>Invoice No</Label>
                            <Input
                                value={popupData.invoiceNo}
                                onChange={(e) =>
                                    setPopupData({ ...popupData, invoiceNo: e.target.value })
                                }
                                type="text"
                            />
                        </Col>
                        <Col md="6">
                            <Label>Invoice Date</Label>
                            <Input
                                value={popupData.invoiceDate}
                                onChange={(e) =>
                                    setPopupData({ ...popupData, invoiceDate: e.target.value })
                                }
                                type="date"
                            />
                        </Col>
                    </Row>

                    <hr />

                    {/* FILE UPLOAD */}
                    <Row>
                        <Col md="12">
                            <Label>Upload / Change Invoice Copy</Label>
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    padding: "10px",
                                    cursor: "pointer",
                                    background: "#f8f9fa"
                                }}
                            >
                                <Upload size={20} style={{ marginRight: "10px" }} />
                                <span style={{ flex: 1 }}>
                                    {invoiceFile ? invoiceFile.name : "Choose Invoice File"}
                                </span>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleInvoiceFileChange}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        opacity: 0,
                                        cursor: "pointer"
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    {/* FILE PREVIEW */}
                    {previewURL ? (
                        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                            {previewURL.endsWith(".pdf") ? (
                                <iframe
                                    src={previewURL}
                                    style={{ width: "100%", height: "450px" }}
                                ></iframe>
                            ) : (
                                <img
                                    src={previewURL}
                                    alt="Invoice Preview"
                                    style={{ width: "100%", maxHeight: "450px", objectFit: "contain" }}
                                />
                            )}
                        </div>
                    ) : (
                        <p>No Invoice Copy Available</p>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={uploadInvoice}>Save</Button>
                    <Button color="secondary" onClick={() => setPopup(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default WheatPurchaseInvoiceChange;
