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
    ModalFooter,
    FormGroup,
    Label,
    Input,
    Col,
    Row,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import Uploader from "../Uploader"; // kept if you want to enable re-upload later
import DateComponent from "../common/dateComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { HrLine } from "../common/HrLine";

const taColumns = [
    { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
    { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
    { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
    { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
    { name: "Payment frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
    {
        name: "Payment times",
        // selector: "no_of_courier",
        cell: (row) => {
            return (
                <>
                    <div>{row.payment_rem_count + ' / ' + row.payment_times}</div>
                </>
            );
        },
        sortable: true,
        minWidth: "80px",
    },
    { name: "Plant Code", selector: "plant_code", sortable: true, minWidth: "100px" },
];

const CrecPaymentDetailsACCAPPROVE = ({ title, url, actionRenderer }) => {
    const history = useHistory();
    const [data, setData] = useState([]); // used for inner table if you need it
    const [tableData, setTableData] = useState([]);
    const [remarks, setRemarks] = useState("");
    const { showLoader, hideLoader } = useLoader();
    const [selectedRow, setSelectedRow] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);

    const [defaultDateRange] = useState({
        start: moment().startOf("month").toDate(),
        end: moment().endOf("month").toDate(),
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    // Add TDS and TAX and TAX_STATUS, HSN as form fields so they are editable via dropdowns
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            date: defaultDateRange,
            tds_status: { value: 1, label: "Yes" }, // DEFAULT YES
            tds_code: "",
            tax_status: { value: 1, label: "Yes" }, // NEW: tax status default Yes
            tax: "",
            tax_hsn: "", // NEW: HSN code (max 9 chars)
            posting_date_: moment().format("YYYY-MM-DD"),
        },
        validationSchema: Yup.object().shape({
            rows: Yup.array().of(Yup.object().shape({})),
        }),
        onSubmit(values) { },
    });

    useEffect(() => {
        loadTableData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTableData = async () => {
        const postdata = {
            user_plantid: UserDetails.plantids ? UserDetails.plantids.toString() : "",
        };
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentdetailsforapprovalACCmg", postdata);
            const { data } = response;
            if (data.success) {
                if ((data.results || []).length === 0) {
                    errorToast("No payment details found");
                    setTableData([]);
                } else setTableData(data.results);
            } else errorToast("Failed to fetch payment details");
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };

    const handleApprove = (row) => {
        setSelectedRow(row);
        // open small remarks modal
        setApproveModalOpen(true);
    };

    const handleReject = (row) => {
        setSelectedRow(row);
        setRejectModalOpen(true);
    };

    // Approve confirmation: include tds, tax, invoice fields, amount, difference, attachment
    const handleApproveConfirmation = async (row) => {
        const postdata = {
            rowdata: row,
            remarks: remarks,
            tax: form.values.tax?.value || form.values.tax || "",
            tds: form.values.tds_code?.value || form.values.tds_code || "",
            tds_status: form.values.tds_status.label,
            tax_status: form.values.tax_status.label, // NEW
            tax_hsn: form.values.tax_hsn || "",       // NEW
            approved_by: UserDetails.USERID,
            posting_date: form.values.posting_date_,
        };

        if (!postdata.remarks) {
            errorToast("Please Enter Remarks");
            return;
        }

        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentrenewalapprovalACCMG", postdata);
            const { data } = response;

            if (data && data.results && data.results[0]) {
                const sap = data.results[0];
                const status = parseInt(sap.STATUS);
                const msg = sap.MESSAGE || "No Message Returned";
                const docNo = sap.DOCUMENT_NO || "";

                // ---------- SUCCESS CASE (STATUS == 1) ----------
                if (status === 1|| status === 2) {
                    confirmDialog({
                        title: `
                        <h5>
                            <strong class="text-white">
                                ${msg}<br/>
                                Document No: ${docNo}
                            </strong>
                        </h5>
                    `,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: `#28a745`, // GREEN
                    });

                    setApproveModalOpen(false);
                    setViewModalOpen(false);
                    // setTimeout(() => window.location.reload(), 2000);
                }

                // ---------- ERROR CASES (STATUS == 0 or STATUS == 2) ----------
                else if (status === 0 ) {
                    confirmDialog({
                        title: `
                        <h5>
                            <strong class="text-white">
                                ${msg}
                            </strong>
                        </h5>
                    `,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: `#dc3545`, // RED
                    });
                }

                return;
            }

            errorToast("Failed to approve payment item");
        } catch (error) {
            console.error(error);
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };
    const handleRejectConfirmation = async (row) => {
        const postdata = { id: row.rpd_id, remarks: remarks, approved_by: UserDetails.USERID };
        if (!postdata.remarks) { errorToast("Please Enter Remarks"); return; }
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Rejectrecpaymentdetails", postdata);
            const { data } = response;
            if (data.success == true) {
                ShowToast("Payment  rejected successfully");
                setRejectModalOpen(false);
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else errorToast("Failed to reject Payment item");
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally { hideLoader(); }
    };

    const wbOptions = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    // helper to robustly check "is TDS status yes?"
    const isTdsStatusYes = () => {
        const v = form.values.tds_status;
        if (v === null || v === undefined) return false;
        if (typeof v === "object") return Number(v.value) === 1;
        const s = String(v).toLowerCase();
        return s === "1" || s === "yes" || s === "y" || s === "true";
    };

    // helper to check tax_status
    const isTaxStatusYes = () => {
        const v = form.values.tax_status;
        if (v === null || v === undefined) return false;
        if (typeof v === "object") return Number(v.value) === 1;
        const s = String(v).toLowerCase();
        return s === "1" || s === "yes" || s === "y" || s === "true";
    };

    // when user toggles tds_status to No, clear tds_code and tax to avoid sending stale values
    useEffect(() => {
        if (!isTdsStatusYes()) {
            form.setFieldValue("tds_code", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.tds_status]);

    // when user toggles tax_status to No, clear tax and hsn
    useEffect(() => {
        if (!isTaxStatusYes()) {
            form.setFieldValue("tax", "");
            form.setFieldValue("tax_hsn", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.tax_status]);

    const handleViewModalOpen = (row) => {
        setSelectedConsignment(row || null);
        setData(row?.details || []);

        // Prefill TDS & TAX and tax_status from row if present (try multiple keys)
        const tdsFromRow = row?.tds || row?.tds_code || row?.tdsCode || "";
        const taxFromRow = row?.tax || row?.tex || row?.tax_code || "";
        const hsnFromRow = row?.hsn_code || row?.hsn || row?.hsnCode || "";

        // Normalize tds_status from row (could be 1/0, 'Yes'/'No', true/false, or object)
        const rawTdsStatus =
            row?.tds_status ??
            row?.tdsStatus ??
            row?.tds_status_flag ??
            row?.tds_flag ??
            row?.tdsstatus ??
            null;

        let tdsStatusNormalized;
        if (rawTdsStatus !== null && rawTdsStatus !== undefined && String(rawTdsStatus).trim() !== "") {
            const s = String(rawTdsStatus).toLowerCase();
            if (s === "1" || s === "yes" || s === "y" || s === "true") {
                tdsStatusNormalized = { value: 1, label: "Yes" };
            } else {
                tdsStatusNormalized = { value: 0, label: "No" };
            }
        } else {
            // DEFAULT to YES when backend gives no tds status
            tdsStatusNormalized = { value: 1, label: "Yes" };
        }

        // Normalize tax_status from row (similar handling)
        const rawTaxStatus =
            row?.tax_status ??
            row?.taxStatus ??
            row?.tax_status_flag ??
            row?.tax_flag ??
            row?.taxstatus ??
            null;

        let taxStatusNormalized;
        if (rawTaxStatus !== null && rawTaxStatus !== undefined && String(rawTaxStatus).trim() !== "") {
            const s = String(rawTaxStatus).toLowerCase();
            if (s === "1" || s === "yes" || s === "y" || s === "true") {
                taxStatusNormalized = { value: 1, label: "Yes" };
            } else {
                taxStatusNormalized = { value: 0, label: "No" };
            }
        } else {
            // DEFAULT to YES when backend gives no tax status
            taxStatusNormalized = { value: 1, label: "Yes" };
        }

        form.setFieldValue("tds_status", tdsStatusNormalized);
        form.setFieldValue("tds_code", tdsFromRow);
        form.setFieldValue("tax_status", taxStatusNormalized); // new
        form.setFieldValue("tax", taxFromRow);
        form.setFieldValue("tax_hsn", hsnFromRow || "");
        form.setFieldValue("posting_date_", moment().format("YYYY-MM-DD"));

        setViewModalOpen(true);
    };

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "50px",
        cell: (row) => (
            <>
                <Button.Ripple color="primary" onClick={() => handleViewModalOpen(row)}>
                    View
                </Button.Ripple>
                &nbsp;
            </>
        ),
    };

    const columns = [...taColumns, actionsCol];
    const dateRestriction = DateComponent('RecPayment');

    // HSN input change with max 9 chars enforcement
    const handleHsnChange = (e) => {
        const val = e.target.value || "";
        if (val.length <= 9) {
            form.setFieldValue("tax_hsn", val);
        } else {
            form.setFieldValue("tax_hsn", val.slice(0, 9));
        }
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring Payment Entry Accounts Approval</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent showDownload columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* VIEW MODAL */}
            <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} centered size="xl">
                <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>View Payment Details</ModalHeader>
                <ModalBody>
                    {/* General Info header */}
                    <h4 className="text-primary"><u>General Info</u></h4>
                    <br />

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Unique Transaction ID</Label>
                                <Input type="text" value={selectedConsignment?.rpd_unique_trans_id || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Division</Label>
                                <Input type="text" value={selectedConsignment?.division || ''} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Department</Label>
                                <Input type="text" value={selectedConsignment?.department || ''} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <Input type="text" value={selectedConsignment?.payment_to_type_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <Input type="text" value={selectedConsignment?.payment_to_subtype_name || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Frequency</Label>
                                <Input type="text" value={selectedConsignment?.payment_frequency_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount Method</Label>
                                <Input type="text" value={selectedConsignment?.amount_paid_method || selectedConsignment?.amount_paid_method_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Plant Code</Label>
                                <Input type="text" value={selectedConsignment?.plant_code || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount / Budget</Label>
                                <Input type="text" value={selectedConsignment?.amount_budget || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Description</Label>
                                <Input type="text" value={selectedConsignment?.description || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Day</Label>
                                <Input type="text" value={selectedConsignment?.payment_date || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement Start</Label>
                                <Input type="text" value={selectedConsignment?.agreement_start_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement End</Label>
                                <Input type="text" value={selectedConsignment?.agreement_end_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Created By</Label>
                                <Input type="text" value={selectedConsignment?.FIRST_NAME || selectedConsignment?.created_by || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <HrLine />

                    {/* Vendor & GL Details */}
                    <h4 className="text-primary mt-3"><u>Vendor & GL Details</u></h4>
                    <br />
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor</Label>
                                <Input type="text" value={selectedConsignment?.vendor || selectedConsignment?.vendor_name || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor Name</Label>
                                <Input type="text" value={selectedConsignment?.vendorname || selectedConsignment?.vendorname || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account Number</Label>
                                <Input type="text" value={selectedConsignment?.account_number || selectedConsignment?.BANK_ACCOUNT || selectedConsignment?.BANK_ACC_NO || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account IFSC Code</Label>
                                <Input type="text" value={selectedConsignment?.account_ifsc_code || selectedConsignment?.IFSC_CODE || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>GL Code</Label>
                                <Input type="text" value={selectedConsignment?.gl_code || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Cost Centre</Label>
                                <Input type="text" value={selectedConsignment?.cost_centre || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Profit Centre</Label>
                                <Input type="text" value={selectedConsignment?.profit_centre || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank</Label>
                                <Input type="text" value={selectedConsignment?.house_bank || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank Id</Label>
                                <Input type="text" value={selectedConsignment?.house_bank_id || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" rel="noreferrer" href={selectedConsignment?.agreement_copy}>
                                    <Button outline color="success" type="button">
                                        Agreement Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" rel="noreferrer" href={selectedConsignment?.mail_copy}>
                                    <Button outline color="success" type="button">
                                        Mail Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                    </Row>
                    <HrLine />

                    {/* Invoice & Amount Details (ADDED) */}
                    <h4 className="text-primary mt-3"><u>Invoice & Amount Details</u></h4>
                    <br />
                    <Row>
                        <Col md="3" sm="12">
                            <CustomDropdownInput
                                options={wbOptions}
                                label={"TDS Status"}
                                form={form}
                                id="tds_status"
                                name="tds_status"
                            />
                        </Col>

                        {/* Show TDS only when TDS Status = Yes */}
                        {isTdsStatusYes() && (
                            <Col md="3" sm="12">
                                <FormGroup>
                                    <Label>TDS</Label>
                                    <CustomDropdownInput url={`${apiBaseUrl}RecurringPaymentController/TDSFetch/${selectedConsignment?.vendor}`} name="tds_code" id="tds_code" form={form} />
                                </FormGroup>
                            </Col>
                        )}

                        {/* TAX Status dropdown (NEW) */}
                        <Col md="3" sm="12">
                            <CustomDropdownInput
                                options={wbOptions}
                                label={"Tax Status"}
                                form={form}
                                id="tax_status"
                                name="tax_status"
                            />
                        </Col>

                        {/* Show TAX only when TAX Status = Yes */}
                        {isTaxStatusYes() && (
                            <Col md="3" sm="12">
                                <FormGroup>
                                    <Label>TAX</Label>
                                    <CustomDropdownInput url={`${apiBaseUrl}RecurringPaymentController/TAXFetch`} name="tax" id="tax" form={form} />
                                </FormGroup>
                            </Col>
                        )}
                    </Row>

                    <Row className="mt-2">
                        <Col md="3" sm="12">
                            <CustomTextInput
                                label={`Posting Date`}
                                id={`posting_date_`}
                                name={`posting_date_`}
                                form={form}
                                type="date"
                                min={dateRestriction.min_date}
                                max={dateRestriction.max_date}
                            />
                        </Col>

                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>HSN Code</Label>
                                {/* HSN input: max 9 characters enforced */}
                                <Input
                                    type="text"
                                    id="tax_hsn"
                                    name="tax_hsn"
                                    value={form.values.tax_hsn || ""}
                                    onChange={handleHsnChange}
                                    placeholder="Max 9 characters"
                                    maxLength={9}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-2">
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Invoice Number</Label>
                                <Input type="text" value={selectedConsignment?.invoice_no || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Invoice Date</Label>
                                <Input type="text" value={selectedConsignment?.invoice_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount</Label>
                                <Input type="text" value={selectedConsignment?.amount || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Difference Amount</Label>
                                <Input type="text" value={selectedConsignment?.difference_amount || selectedConsignment?.differenceAmount || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" rel="noreferrer" href={selectedConsignment?.invoice_attachment}>
                                    <Button outline color="success" type="button">
                                        Invoice Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col sm="6" className="d-flex justify-content-start">
                            <Button.Ripple color="danger" onClick={() => handleReject(selectedConsignment)}>Reject</Button.Ripple>
                        </Col>

                        <Col sm="6" className="d-flex justify-content-end">
                            <Button.Ripple color="primary" onClick={() => handleApprove(selectedConsignment)}>Approve</Button.Ripple>
                            &nbsp;
                            <Button color="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            {/* APPROVE MODAL (collect remarks) */}
            <Modal isOpen={approveModalOpen} toggle={() => setApproveModalOpen(!approveModalOpen)} className="modal-dialog-centered">
                <ModalHeader toggle={() => setApproveModalOpen(!approveModalOpen)}>Approve Item</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="remarks">Remarks:</Label>
                        <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => handleApproveConfirmation(selectedRow)}>Confirm Approve</Button>
                </ModalFooter>
            </Modal>

            {/* REJECT MODAL */}
            <Modal isOpen={rejectModalOpen} toggle={() => setRejectModalOpen(!rejectModalOpen)} className="modal-dialog-centered">
                <ModalHeader toggle={() => setRejectModalOpen(!rejectModalOpen)}>Rejection Remarks</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="remarks">Remarks:</Label>
                        <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => handleRejectConfirmation(selectedRow)}>Confirm Reject</Button>
                    <Button color="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default CrecPaymentDetailsACCAPPROVE;
