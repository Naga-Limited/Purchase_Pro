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
    InputGroup,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import { Search } from "react-feather";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const taColumns = [
    { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
    { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
    { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
    { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
    { name: "Payment frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
    { name: "Plant Code", selector: "plant_code", sortable: true, minWidth: "100px" },
];

const CrecPaymentInfoACCMGAPPROVE = ({ title, url, actionRenderer }) => {
    const history = useHistory();
    const [data, setData] = useState([]); // used for inner table if you need it
    const [tableData, setTableData] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectedRow, setRejectedRow] = useState(null);
    const { showLoader, hideLoader } = useLoader();
    const [selectedRow, setSelectedRow] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [defaultDateRange, setDefaultDateRange] = useState({
        start: moment().startOf("month").toDate(),
        end: moment().endOf("month").toDate(),
    });
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);

    // GL & Cost Centre states
    const [glQuery, setGlQuery] = useState("");
    const [glLocked, setGlLocked] = useState(false);
    const [costCentreOptions, setCostCentreOptions] = useState([]);

    // Plant & access
    const [plantCode, setPlantCode] = useState("");
    const [plantAllowed, setPlantAllowed] = useState(true);

    // House bank states (added)
    const [houseBankQuery, setHouseBankQuery] = useState("");
    const [houseBankResults, setHouseBankResults] = useState([]);
    const [showHouseBankResults, setShowHouseBankResults] = useState(false);
    const [houseBankLocked, setHouseBankLocked] = useState(false);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: { date: defaultDateRange, cost_centre: null, profit_centre: "", gl_code: "", house_bank_id: "", house_bank: null, account_number: "", account_ifsc: "" },
        validationSchema: Yup.object().shape({ rows: Yup.array().of(Yup.object().shape({})) }),
        onSubmit(values) { },
    });

    useEffect(() => {
        loadTableData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTableData = async () => {
        const postdata = { user_plantid: UserDetails.plantids ? UserDetails.plantids.toString() : "" };
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentinfoapprovalforaccountsapprove", postdata);
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

    // ---------- GL helpers ----------
    // Replace your existing fetchPlantFromSAP with this updated version
    const fetchPlantFromSAP = async (costCentreLabel) => {
        if (!costCentreLabel) {
            setPlantCode("");
            form.setFieldValue("masterPlantId", null);
            setPlantAllowed(true);
            return;
        }

        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}RecurringPaymentController/GetPlantfromsap`, { costcentre: costCentreLabel });
            const results = res?.data?.results || [];

            const firstWithPlant = results.find((r) => r && (r.PLANT || r.plant || r.WERKS || r.werks));
            const code = (firstWithPlant && (firstWithPlant.PLANT || firstWithPlant.plant || firstWithPlant.WERKS || firstWithPlant.werks)) || "";

            // set plantCode and masterPlantId as before
            setPlantCode(code);
            if (code) {
                form.setFieldValue("masterPlantId", { label: code, value: code, werks: code });
            } else {
                form.setFieldValue("masterPlantId", null);
            }

            // SIMPLE EXACT MATCH: compare SAP returned plant with selectedConsignment?.plant_code
            const sapPlant = String(code || "").trim();
            const rowPlant = String(selectedConsignment?.plant_code || "").trim();

            if (sapPlant && rowPlant && sapPlant !== rowPlant) {
                const msg = `Mismatch detected: SAP returned plant "${sapPlant}" but the selected record contains plant "${rowPlant}". You are not permitted to submit when these do not match.`;

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

                setPlantAllowed(false);
                return; // stop further processing
            }

            // Now check whether SAP plant is in user's allowed plants
            const rawPlantIds = UserDetails?.plantids ?? "";
            const userPlantList = Array.isArray(rawPlantIds)
                ? rawPlantIds.map(String).map((p) => p.trim())
                : String(rawPlantIds).split(",").map((p) => p.trim()).filter(Boolean);

            const normalizedCode = String(code || "").trim();

            if (normalizedCode) {
                const hasAccess = userPlantList.includes(normalizedCode);
                setPlantAllowed(hasAccess);

                if (!hasAccess) {
                    const msg = `The plant returned by SAP is "${normalizedCode}" but your allowed plants are: ${userPlantList.length ? userPlantList.join(", ") : "none"}. You are not permitted to submit for this plant.`;

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

                    // keep plantAllowed false
                    return;
                }
            } else {
                setPlantAllowed(true);
            }
        } catch (err) {
            console.error(err);
            errorToast("Failed to fetch plant for cost centre");
            setPlantCode("");
            form.setFieldValue("masterPlantId", null);
            setPlantAllowed(true);
        } finally {
            hideLoader();
        }
    };

    const handleGlSearch = async () => {
        if (glLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}RecurringPaymentController/GetGLfromsap`, { query: glQuery });
            const rawResults = res?.data?.results || [];
            const filtered = rawResults.filter((item) => item && (item.label || item.value));
            const options = filtered.map((item) => ({ label: item.label || "", value: item.value || "", raw: item }));
            setCostCentreOptions(options);

            if (options.length === 1) {
                const sel = options[0];
                form.setFieldValue("cost_centre", { label: sel.label, value: sel.value });
                form.setFieldValue("profit_centre", sel.value || "");
                setGlLocked(true);
                fetchPlantFromSAP(sel.label);
            } else {
                if (options.length === 0) {
                    errorToast("No GL / Cost centre data found");
                    setCostCentreOptions([]);
                }
            }
        } catch (err) {
            errorToast("Failed to fetch GL / Cost centre data");
            setCostCentreOptions([]);
        } finally {
            hideLoader();
        }
    };
    // ---------- end GL helpers ----------

    // ---------- House Bank helpers (copied logic) ----------
    const handleHouseBankSearch = async () => {
        if (houseBankLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}RecurringPaymentController/Gethousebankdetailsfromsap`, { query: houseBankQuery });
            const results = res?.data?.results || [];
            setHouseBankResults(results);
            setShowHouseBankResults(true);

            if (results.length === 1) {
                const sel = results[0];
                const label = sel.HOUSE_BANK || sel.bank_name || sel.name || sel.label || houseBankQuery;
                form.setFieldValue("house_bank", { label, value: sel.ACCOUNT_ID || sel.id || sel.bank_id || sel.value || sel.ACCOUNT_ID, meta: sel });
                if (sel.ACCOUNT_ID || sel.id || sel.bank_id) {
                    form.setFieldValue("house_bank_id", sel.ACCOUNT_ID || sel.id || sel.bank_id || "");
                }
                const acc = sel.BANK_ACCOUNT || sel.BANK_ACC_NO || sel.account_number;
                if (acc) form.setFieldValue("account_number", acc);
                const ifsc = sel.IFSC_CODE || sel.ifsc || sel.ifsc_code || sel.IFSC;
                if (ifsc) form.setFieldValue("account_ifsc", ifsc);
                setHouseBankQuery(label);
                setShowHouseBankResults(false);
                setHouseBankLocked(true);
            } else {
                if (results.length === 0) {
                    errorToast("No house banks found");
                    setHouseBankResults([]);
                    setShowHouseBankResults(false);
                }
            }
        } catch (err) {
            errorToast("Failed to fetch house banks");
            setHouseBankResults([]);
            setShowHouseBankResults(false);
        } finally {
            hideLoader();
        }
    };

    const selectHouseBank = (hb) => {
        const label = hb.HOUSE_BANK || hb.bank_name || hb.name || hb.label || houseBankQuery;
        form.setFieldValue("house_bank", { label, value: hb.ACCOUNT_ID || hb.id || hb.bank_id || hb.value || hb.ACCOUNT_ID, meta: hb });
        if (hb.ACCOUNT_ID || hb.id || hb.bank_id) form.setFieldValue("house_bank_id", hb.ACCOUNT_ID || hb.id || hb.bank_id || "");
        const acc = hb.BANK_ACCOUNT || hb.BANK_ACC_NO || hb.account_number;
        if (acc) form.setFieldValue("account_number", acc);
        const ifsc = hb.IFSC_CODE || hb.ifsc || hb.ifsc_code || hb.IFSC;
        if (ifsc) form.setFieldValue("account_ifsc", ifsc);
        setHouseBankQuery(label);
        setShowHouseBankResults(false);
        setHouseBankLocked(true);
    };
    // ---------- end House Bank helpers ----------

    const handleApprove = (row) => {
        setSelectedRow(row);
        setApproveModalOpen(true);
    };
    const handleReject = (row) => {
        setRejectedRow(row);
        setRejectModalOpen(true);
    };

    const handleApproveConfirmation = async (row) => {
        // --- simple required-field validation ---
        const glVal = form.values.gl_code || glQuery || row?.gl_code || null;
        const hbVal =
            (form.values.house_bank && (form.values.house_bank.value || form.values.house_bank.label)) ||
            form.values.house_bank_id ||
            houseBankQuery ||
            row?.house_bank_id ||
            row?.house_bank ||
            null;

        if (!glVal) {
            errorToast("Please enter / select GL Code before approving.");
            return;
        }

        if (!hbVal) {
            errorToast("Please enter / select House Bank before approving.");
            return;
        }

        // normalize values (plant check)
        const sapPlant = String(plantCode || "").trim();
        const rowPlant = String(row?.plant_code || selectedConsignment?.plant_code || "").trim(); // prefer row, fallback to selectedConsignment
        const rawPlantIds = UserDetails?.plantids ?? "";
        const userPlantList = Array.isArray(rawPlantIds)
            ? rawPlantIds.map(String).map((p) => p.trim())
            : String(rawPlantIds)
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);

        // helper to show the red dialog with message
        const showDeniedDialog = (msg) => {
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
        };

        // simple exact-match check between SAP plant and record plant (block if mismatch)
        if (sapPlant && rowPlant && sapPlant !== rowPlant) {
            const msg = `Mismatch detected: SAP returned plant "${sapPlant}" but the selected record contains plant "${rowPlant}". You are not permitted to submit when these do not match.`;
            showDeniedDialog(msg);
            return;
        }

        // Build postdata including GL / cost centre / profit centre / house bank details
        const postdata = {
            id: row.rp_id,
            remarks: remarks,
            approved_by: UserDetails.USERID,

            // GL / Cost centre fields -- prefer form values, then fallbacks
            gl_code: form.values.gl_code || glQuery || row?.gl_code || null,
            cost_centre: form.values.cost_centre?.label,
            profit_centre: form.values.profit_centre || row?.profit_centre || null,

            // House bank fields
            house_bank:
                (form.values.house_bank && (form.values.house_bank.value || form.values.house_bank.label)) ||
                houseBankQuery ||
                row?.house_bank ||
                null,
            house_bank_id: form.values.house_bank_id || row?.house_bank_id || null,
        };

        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentinfoapprovalAccountMG", postdata);
            const { data } = response;
            if (data.success) {
                ShowToast("Payment Info Approved Successfully");
                setApproveModalOpen(false);
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast("Failed to approve Payment Info ");
            }
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };


    const handleRejectConfirmation = async (row) => {
        const postdata = { id: row.rp_id, remarks: remarks, approved_by: UserDetails.USERID };
        if (!postdata.remarks) {
            errorToast("Please Enter Remarks");
            return;
        }
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Rejectrecpaymentinfo", postdata);
            const { data } = response;
            if (data.success == true) {
                ShowToast("Payment item rejected successfully");
                setRejectModalOpen(false);
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else errorToast("Failed to reject Payment item");
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };

    const handleViewModalOpen = (row) => {
        setSelectedConsignment(row || null);
        setData(row?.details || []);

        // optional: prefill GL and house bank inputs from row if present
        if (row) {
            // GL prefill
            if (row.gl_code) {
                setGlQuery(row.gl_code);
                form.setFieldValue("gl_code", row.gl_code);
            }
            if (row.cost_centre) {
                form.setFieldValue("cost_centre", { label: row.cost_centre, value: row.cost_centre });
                form.setFieldValue("profit_centre", row.profit_cence || row.profit_centre || "");
                // try fetch plant from sap if label available
                fetchPlantFromSAP(row.cost_centre);
            }
            // House bank prefill
            if (row.house_bank || row.house_bank_id) {
                form.setFieldValue("house_bank", { label: row.house_bank || row.house_bank_id, value: row.house_bank_id || row.house_bank });
                form.setFieldValue("house_bank_id", row.house_bank_id || row.house_bank || "");
            }
            if (row.account_number) form.setFieldValue("account_number", row.account_number);
            if (row.account_ifsc_code) form.setFieldValue("account_ifsc", row.account_ifsc_code);
        }

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

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring Payment Info Accounts Approval</CardTitle>
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
                    <h4 className="text-primary">
                        <u>General Info</u>
                    </h4>
                    <br />

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Unique Transaction ID</Label>
                                <Input type="text" value={selectedConsignment?.rp_unique_trans_id || ""} disabled />
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

                    {/* Vendor Details header */}
                    <h4 className="text-primary mt-3">
                        <u>Vendor Details</u>
                    </h4>
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
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Plant Code</Label>
                                <Input type="text" value={selectedConsignment?.plant_code || selectedConsignment?.plant_code || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <h4 className="text-primary mt-3">
                        <u>Attachment Details</u>
                    </h4>
                    <br />
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

                    {/* REPLACED GL Section: interactive inputs */}
                    <h4 className="text-primary mt-3">
                        <u>GL Details</u>
                    </h4>
                    <br />
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>GL Code</Label>
                                <InputGroup>
                                    <Input
                                        id="gl_code"
                                        name="gl_code"
                                        type="text"
                                        value={glQuery}
                                        placeholder="Type GL code"
                                        disabled={glLocked}
                                        onChange={(e) => {
                                            setGlQuery(e.target.value);
                                            if (!glLocked && form.values.gl_code) form.setFieldValue("gl_code", null);
                                        }}
                                    />
                                    <Button color="success" onClick={handleGlSearch} disabled={glLocked}>
                                        <Search size={16} />
                                    </Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Cost Centre</Label>
                                <CustomDropdownInput
                                    id="cost_centre"
                                    name="cost_centre"
                                    form={form}
                                    options={costCentreOptions}
                                    placeholder="Select Cost Centre"
                                    onChange={(selected) => {
                                        form.setFieldValue("cost_centre", selected);
                                        form.setFieldValue("profit_centre", selected?.value || "");
                                        fetchPlantFromSAP(selected?.label);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Profit Centre</Label>
                                <Input id="profit_centre" name="profit_centre" type="text" value={form.values.profit_centre} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Row with Plant Code, House Bank, House Bank Id */}
                    <Row className="mt-2">
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>
                                    Plant Code {plantAllowed === false && plantCode ? <span className="text-danger"> (access denied)</span> : null}
                                </Label>
                                <Input id="plant_code" name="plant_code" type="text" value={plantCode} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank</Label>
                                <InputGroup>
                                    <Input
                                        id="house_bank"
                                        name="house_bank"
                                        type="text"
                                        value={houseBankQuery}
                                        placeholder="Type bank name or branch"
                                        disabled={houseBankLocked}
                                        onChange={(e) => {
                                            setHouseBankQuery(e.target.value);
                                            if (!houseBankLocked && form.values.house_bank) form.setFieldValue("house_bank", null);
                                        }}
                                    />
                                    <Button color="success" onClick={handleHouseBankSearch} disabled={houseBankLocked}>
                                        <Search size={16} />
                                    </Button>
                                </InputGroup>
                                {showHouseBankResults && houseBankResults.length > 0 && !houseBankLocked && (
                                    <div className="border p-1 mt-1" style={{ maxHeight: 200, overflowY: "auto", background: "#fff" }}>
                                        {houseBankResults.map((hb, idx) => (
                                            <div key={idx} style={{ padding: "6px 8px", cursor: "pointer" }} onClick={() => selectHouseBank(hb)}>
                                                {hb.HOUSE_BANK || hb.bank_name || hb.name || hb.label} {hb.BANK_ACCOUNT ? `- ${hb.BANK_ACCOUNT}` : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank Id</Label>
                                <Input id="house_bank_id" name="house_bank_id" type="text" value={form.values.house_bank_id} disabled />
                            </FormGroup>
                        </Col>
                    </Row>



                    <Row className="mt-3">
                        <Col sm="6" className="d-flex justify-content-start">
                            <Button.Ripple color="danger" onClick={() => handleReject(selectedConsignment)}>
                                Reject
                            </Button.Ripple>
                        </Col>

                        <Col sm="6" className="d-flex justify-content-end">
                            <Button.Ripple color="primary" onClick={() => handleApprove(selectedConsignment)}>
                                Approve
                            </Button.Ripple>
                            &nbsp;
                            <Button color="secondary" onClick={() => setViewModalOpen(false)}>
                                Close
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            {/* APPROVE MODAL */}
            <Modal isOpen={approveModalOpen} toggle={() => setApproveModalOpen(!approveModalOpen)} className="modal-dialog-centered">
                <ModalHeader toggle={() => setApproveModalOpen(!approveModalOpen)}>Approve Item</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="remarks">Remarks:</Label>
                        <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => handleApproveConfirmation(selectedRow)}>
                        Confirm Approve
                    </Button>
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
                    <Button color="danger" onClick={() => handleRejectConfirmation(rejectedRow)}>
                        Confirm Reject
                    </Button>
                    <Button color="secondary" onClick={() => setRejectModalOpen(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default CrecPaymentInfoACCMGAPPROVE;
