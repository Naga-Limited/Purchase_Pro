import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
    Row,
    Col,
    Button,
    FormGroup,
    Input,
    Label,
    InputGroup,
} from 'reactstrap';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiGetMethod, apiPostMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Search } from 'react-feather';
import { Modal } from 'react-bootstrap';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import Uploader from '../Uploader';

function CrecPaymentInfo() {
    const history = useHistory();
    let { Id } = useParams();
    let refid = '';
    if (Id) refid = Id.replace(":", "");
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    // dependent options
    const [dependentOptions, setDependentOptions] = useState([]);
    // department options (dependent on division)
    const [departmentOptions, setDepartmentOptions] = useState([]);

    // --- states for search inputs & results ---
    const [vendorQuery, setVendorQuery] = useState('');
    const [vendorResults, setVendorResults] = useState([]);
    const [showVendorResults, setShowVendorResults] = useState(false);
    const [vendorLocked, setVendorLocked] = useState(false);

    // Day-picker state for Payment Date
    const [showDayPicker, setShowDayPicker] = useState(false);
    const dayPickerRef = useRef(null);

    // Insides modal state
    const [showInsides, setShowInsides] = useState(false);
    const [insidesData, setInsidesData] = useState({
        paymentToTypeLabel: '',
        paymentSubTypeLabel: '',
        agreementStart: '',
        agreementEnd: '',
        paymentFrequencyLabel: '',
        frequencyInterval: null,
        monthsSpan: 0,
        paymentTimes: 0,
        amountBudget: 0,
        amountPerPayment: 0,
    });


    // File upload state (for Agreement Copy & Mail Copy)
    const [attachedFiles, setAttachedFiles] = useState({});

    const handleFileChange = (file, fieldId) => {
        // fieldId will be "agreement_copy" or "mail_copy" based on Uploader id
        setAttachedFiles(prev => ({
            ...prev,
            [fieldId]: file
        }));
    };

    // --- PDF preview state & helpers ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const openFilePreview = (file, title = 'Preview') => {
        if (!file) return;
        // revoke previous if any
        if (previewUrl) {
            try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPreviewTitle(title);
        setPreviewOpen(true);
    };

    const closeFilePreview = () => {
        if (previewUrl) {
            try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
        }
        setPreviewUrl(null);
        setPreviewTitle('');
        setPreviewOpen(false);
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            division: null,
            department: null,
            payment_to_type: null,
            payment_to_sub_type: null,
            payment_frequency: null,
            amount_paid_method: null,
            amount_budget: '',
            description: '',
            agreement_start_date: '',
            agreement_end_date: '',
            payment_date: '', // day-only string
            vendor: null,
            vendor_name: '',
            account_number: '',
            account_ifsc: '',
            masterPlantId: null,
            hsn_code: '',
        },
        validationSchema: Yup.object().shape({
            division: Yup.object().nullable().required("Division is required"),
            department: Yup.object().nullable().required("Department is required"),
            payment_to_type: Yup.object().nullable().required("Payment To Type is required"),
            payment_frequency: Yup.object().nullable().required("Payment Frequency is required"),
            amount_paid_method: Yup.object().nullable().required("Amount to be paid method is required"),
            amount_budget: Yup.number()
                .typeError("Amount must be a number")
                .min(0, "Amount cannot be negative")
                .required("Amount / budget is required"),
            agreement_start_date: Yup.string().nullable(),
            agreement_end_date: Yup.string().nullable(),
            payment_date: Yup.string()
                .nullable()
                .matches(/^([1-9]|[12][0-9]|3[01])$/, "Select a valid day (1-31)"),
        }),
        onSubmit(values) { },
    });

    // Close day picker when clicking outside
    useEffect(() => {
        getUserPlant()
        const handleClickOutside = (event) => {
            if (dayPickerRef.current && !dayPickerRef.current.contains(event.target)) {
                setShowDayPicker(false);
            }
        };
        if (showDayPicker) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDayPicker]);

    const fetchDependentOptions = async (paymentToTypeId) => {
        try {
            const res = await apiPostMethod(
                `${apiBaseUrl}RecurringPaymentController/Getpaymenttosubtypeinfo`,
                { paymentToTypeId }
            );
            setDependentOptions(res?.data?.results || []);
        } catch (err) {
            errorToast("Failed to load sub category list");
            setDependentOptions([]);
        }
    };

    // fetch departments for a division
    const fetchDepartmentsByDivision = async (divisionValue) => {
        try {
            if (!divisionValue) {
                setDepartmentOptions([]);
                return;
            }
            // divisionValue can be object {label,value} or primitive id
            const id = divisionValue?.value ?? divisionValue;
            // Use GET as earlier; if API expects label change accordingly
            const res = await apiGetMethod(`${apiBaseUrl}RecurringPaymentController/Getdepartment/${id}`);
            const results = res?.data?.results || [];
            setDepartmentOptions(results);
        } catch (err) {
            console.error("Failed to load departments", err);
            setDepartmentOptions([]);
            // optionally show toast: errorToast("Failed to load departments");
        }
    };

    // --- search handlers ---
    const handleVendorSearch = async () => {
        if (vendorLocked) return;

        try {
            showLoader();
            const res = await apiPostMethod(
                `${apiBaseUrl}RecurringPaymentController/GetVendorfromsap`,
                { query: vendorQuery }
            );

            const results = res?.data?.results || [];
            setVendorResults(results);
            setShowVendorResults(true);

            // AUTO SELECT when only one vendor found
            if (results.length === 1) {
                const v = results[0];

                const vendorCode = v.VENDOR || "";
                const vendorName = v.VENDORNAME || "";

                // ✅ Vendor CODE in input
                setVendorQuery(vendorCode);

                // ✅ Vendor NAME in separate field
                form.setFieldValue("vendor_name", vendorName);

                // keep full vendor object if needed later
                form.setFieldValue("vendor", {
                    value: vendorCode,
                    label: vendorName,
                    meta: v,
                });

                // account number
                if (v.BANK_ACC_NO) {
                    form.setFieldValue("account_number", v.BANK_ACC_NO);
                }

                // IFSC
                if (v.IFSC_CODE) {
                    form.setFieldValue("account_ifsc", v.IFSC_CODE);
                }

                setShowVendorResults(false);
                setVendorLocked(true);
            } else if (results.length === 0) {
                errorToast("No vendors found");
                setShowVendorResults(false);
            }
        } catch (err) {
            errorToast("Failed to fetch vendors");
            setShowVendorResults(false);
        } finally {
            hideLoader();
        }
    };



    const selectVendor = (v) => {
        const vendorCode = v.VENDOR || "";
        const vendorName = v.VENDORNAME || "";

        // Vendor input → CODE
        setVendorQuery(vendorCode);

        // Vendor name field → NAME
        form.setFieldValue("vendor_name", vendorName);

        // store vendor object
        form.setFieldValue("vendor", {
            value: vendorCode,
            label: vendorName,
            meta: v,
        });

        if (v.BANK_ACC_NO) {
            form.setFieldValue("account_number", v.BANK_ACC_NO);
        }

        if (v.IFSC_CODE) {
            form.setFieldValue("account_ifsc", v.IFSC_CODE);
        }

        setShowVendorResults(false);
        setVendorLocked(true);
    };



    // ---------- main submit (with file upload) ----------
    const handlesubmitButtonClick = async () => {
        // Validate the whole form first
        const errors = await form.validateForm();
        if (Object.keys(errors).length) {
            const fieldLabels = {
                division: "Division",
                department: "Department",
                payment_to_type: "Payment To Type",
                payment_frequency: "Payment Frequency",
                amount_paid_method: "Amount Method",
                amount_budget: "Amount / Budget",
                agreement_start_date: "Agreement Start Date",
                agreement_end_date: "Agreement End Date",
                payment_date: "Payment Day",
                vendor: "Vendor",
                account_number: "Account Number",
                account_ifsc: "Account IFSC",
                masterPlantId: "Plant",
                hsn_code: "HSN Code",
            };

            const missingFields = Object.keys(errors).map((k) => fieldLabels[k] || k);
            const errMsg = `Please Fill: ${[...new Set(missingFields)].join(", ")}`;
            errorToast(errMsg);
            return;
        }

        showLoader();
        try {
            // reuse the computeInsides() to get paymentTimes and amountPerPayment
            let computed = null;
            try {
                computed = computeInsides(); // returns null and shows toast if cannot compute
            } catch (e) {
                computed = null;
            }

            const paymentTimesToSend =
                (computed && typeof computed.paymentTimes === "number") ? computed.paymentTimes : 0;

            const amountPerPaymentToSend =
                (computed && typeof computed.amountPerPayment !== "undefined") ? Number(computed.amountPerPayment) : 0;

            // ---- File upload (Agreement Copy & Mail Copy) ----
            let agreementCopyFileName = "";
            let mailCopyFileName = "";

            const keys = Object.keys(attachedFiles || {}).filter(k => attachedFiles[k]);
            if (keys.length > 0) {
                const postdataFile = new FormData();
                postdataFile.append("form_name", "recurringpayment");
                postdataFile.append("ponumber", "invoice_copy");
                postdataFile.append("VA_Number", "001");
                postdataFile.append("SubFolder", "Recurring_payment");
                keys.forEach((key) => postdataFile.append("file[]", attachedFiles[key]));

                const uploadResp = await apiPostMethod(sapFileShare, postdataFile, "File");
                if (!uploadResp || !uploadResp.data || !uploadResp.data.success) {
                    errorToast("File upload failed. Please try again.");
                    return;
                }

                const uploadedFiles = uploadResp.data.files || [];
                keys.forEach((key, index) => {
                    const uploaded = uploadedFiles[index];
                    if (!uploaded) return;
                    const updname = uploaded.updname || "";

                    if (key === "agreement_copy") {
                        agreementCopyFileName = updname;
                    } else if (key === "mail_copy") {
                        mailCopyFileName = updname;
                    }
                });
            }

            const v = form.values;
            const postData = {
                division_name: v.division?.label || null,
                department_name: v.department?.label || null,
                payment_to_type: v.payment_to_type?.value || null,
                payment_to_type_name: v.payment_to_type?.label || null,
                payment_to_sub_type: v.payment_to_sub_type?.value || null,
                payment_to_sub_type_name: v.payment_to_sub_type?.label || null,
                payment_frequency: v.payment_frequency?.value || null,
                payment_frequency_value: v.payment_frequency?.definitionsvalues || null,
                payment_frequency_name: v.payment_frequency?.label || null,
                amount_paid_method_id: v.amount_paid_method?.value || null,
                amount_paid_method: v.amount_paid_method?.label || null,
                amount_budget: v.amount_budget,

                description: v.description,
                agreement_start_date: v.agreement_start_date,
                agreement_end_date: v.agreement_end_date,
                payment_date: v.payment_date,
                vendor: v.vendor?.value || null,
                vendorname: v.vendor_name || null,
                account_ifsc: v.account_ifsc || null,
                account_number: v.account_number || null,
                hsn_code: v.hsn_code || null,
                payment_times: paymentTimesToSend,
                // NEW: send computed amount per payment
                amount_per_payment: amountPerPaymentToSend,
                // file names from upload
                Attachment: agreementCopyFileName,
                vendorEmailCopy: mailCopyFileName,
                plant_werks: v.masterPlantId?.werks,

                created_by: UserDetails.USERID,
            };
            console.log(postData);

            if (!refid) {
                const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Insertrecpaymentinfo", postData);
                const { data } = response;
                if (data.success === true) {
                    ShowToast(data.message || "Save Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    errorToast(data.message || "Unable to save");
                }
            } else {
                // If you later add update logic, handle here
            }
        } catch (e) {
            console.error(e);
            errorToast("Something went wrong, please try again after sometime");
        } finally {
            hideLoader();
        }
    };

    // Day picker component
    const DayPicker = ({ selectedDay, onSelect }) => {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
            <div
                ref={dayPickerRef}
                style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    borderRadius: 6,
                    width: "100%",
                    background: "#fff",
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                    {days.map((day) => {
                        const isSelected = Number(selectedDay) === day;
                        return (
                            <div
                                key={day}
                                onClick={() => onSelect(day)}
                                style={{
                                    padding: "6px 4px",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    borderRadius: 4,
                                    background: isSelected ? "#7374f0" : "#f1f1f1",
                                    color: isSelected ? "#fff" : "#000",
                                    userSelect: "none",
                                }}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleDaySelect = (dayNumber) => {
        form.setFieldValue('payment_date', String(dayNumber));
        setShowDayPicker(false);
    };

    const selectedDayFromForm = (() => {
        const d = form.values.payment_date;
        if (!d) return null;
        const n = Number(d);
        return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
    })();

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    // ---------- Insides modal logic ----------
    const computeInsides = () => {
        const v = form.values;

        if (!v.agreement_start_date || !v.agreement_end_date || !v.payment_frequency) {
            errorToast("Provide Agreement Start & End dates and Payment Frequency to compute schedule.");
            return null;
        }

        const start = moment(v.agreement_start_date, "YYYY-MM-DD");
        const end = moment(v.agreement_end_date, "YYYY-MM-DD");

        if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
            errorToast("Invalid agreement dates. Ensure end date is after start date.");
            return null;
        }

        const label = (v.payment_frequency?.label || "").toUpperCase();
        const interval = Number(v.payment_frequency?.definitionsvalues);

        let paymentTimes = 0;
        let durationSpan = 0;

        /* ===================== 7 DAYS ONCE ===================== */
        if (label === "7 DAYS ONCE") {
            const totalDays = end.diff(start, "days") + 1;

            paymentTimes = Math.floor(totalDays / 7);
            if (paymentTimes <= 0 && totalDays >= 7) paymentTimes = 1;

            durationSpan = totalDays;
        }

        /* ===================== FORTNIGHT ===================== */
        else if (label === "FORTNIGHT") {
            let count = 0;
            let cursor = start.clone().startOf("day");

            while (cursor.isSameOrBefore(end)) {
                const day = cursor.date();
                const isFeb = cursor.month() === 1; // Feb = 1 (0-indexed)
                const lastDayOfMonth = cursor.clone().endOf("month").date();

                // 15th OR 30th OR Feb last day
                if (
                    day === 15 ||
                    day === 30 ||
                    (isFeb && day === lastDayOfMonth)
                ) {
                    count++;
                }

                cursor.add(1, "day");
            }

            paymentTimes = count;
            durationSpan = end.diff(start, "days") + 1;
        }

        /* ===================== MONTH BASED ===================== */
        else {
            if (!interval || isNaN(interval)) {
                errorToast("Payment frequency interval not available.");
                return null;
            }

            const totalMonths = end.diff(start, "months") + 1;
            paymentTimes = Math.max(1, Math.ceil(totalMonths / interval));
            durationSpan = totalMonths;
        }

        const amountBudget = Number(v.amount_budget) || 0;
        const amountPerPayment =
            paymentTimes > 0 ? amountBudget / paymentTimes : 0;

        return {
            paymentToTypeLabel: v.payment_to_type?.label || "",
            paymentSubTypeLabel: v.payment_to_sub_type?.label || "",
            agreementStart: v.agreement_start_date,
            agreementEnd: v.agreement_end_date,
            paymentFrequencyLabel: v.payment_frequency?.label || "",
            frequencyInterval: interval,
            monthsSpan: durationSpan,
            paymentTimes,
            amountBudget,
            amountPerPayment,
        };
    };


    const handleInsidesClick = () => {
        const computed = computeInsides();
        if (!computed) return;
        setInsidesData(computed);
        setShowInsides(true);
    };

    const closeInsides = () => {
        setShowInsides(false);
    };

    // If division value changes (for example when loading existing data), fetch departments
    useEffect(() => {
        if (form.values.division) {
            fetchDepartmentsByDivision(form.values.division);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.division]);
    const isDayBasedFrequency = (() => {
        const label = form.values.payment_frequency?.label || "";
        return (
            label.toUpperCase().includes("DAY") ||
            label.toUpperCase().includes("DAYS") ||
            label.toUpperCase().includes("FORTNIGHT")
        );
    })();
    useEffect(() => {
        if (isDayBasedFrequency) {
            // clear payment day if day-based frequency selected
            form.setFieldValue("payment_date", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.payment_frequency]);


    // ---------- end Insides logic ----------

    return (
        <div>
            <Fragment>
                <CardComponent header="Recurring Payment Info">

                    {/* PO Details (General Info) */}
                    <h4 className="text-primary"><u>General Info</u></h4><br />

                    {/* Row 1 - 3 fields */}
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Division</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RecurringPaymentController/Getdivision/${UserDetails.plantids}`}
                                    name="division"
                                    id="division"
                                    form={form}
                                    onChange={(selected) => {
                                        // set division field
                                        form.setFieldValue("division", selected);

                                        // clear department when division changes
                                        form.setFieldValue("department", null);
                                        setDepartmentOptions([]);

                                        // fetch departments for selected division
                                        if (selected) fetchDepartmentsByDivision(selected);
                                    }}
                                />
                            </FormGroup>
                        </Col><Col md="4" sm="12">
                            <FormGroup>
                                <Label>Department</Label>
                                <CustomDropdownInput
                                    options={departmentOptions}
                                    name="department"
                                    id="department"
                                    form={form}
                                    onChange={(selected) => form.setFieldValue("department", selected)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RecurringPaymentController/Getpaymenttotypeinfo`}
                                    id="payment_to_type"
                                    name="payment_to_type"
                                    form={form}
                                    onChange={(selected) => {
                                        form.setFieldValue("payment_to_type", selected);
                                        if (selected?.label) fetchDependentOptions(selected.label);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <CustomDropdownInput
                                    name="payment_to_sub_type"
                                    id="payment_to_sub_type"
                                    form={form}
                                    options={dependentOptions}
                                    onChange={(selected) => form.setFieldValue("payment_to_sub_type", selected)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Frequency</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RecurringPaymentController/Getpaymentfrequencytypes`}
                                    name="payment_frequency"
                                    id="payment_frequency"
                                    form={form}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Row 2 */}
                    <Row className="mt-2">
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount Method</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RecurringPaymentController/Getamounttopaidtypes`}
                                    name="amount_paid_method"
                                    id="amount_paid_method"
                                    form={form}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount / budget</Label>
                                <Input
                                    id="amount_budget"
                                    name="amount_budget"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.values.amount_budget}
                                    onChange={(e) => form.setFieldValue("amount_budget", e.target.value)}
                                    onBlur={form.handleBlur}
                                />
                                {form.touched.amount_budget && form.errors.amount_budget ? (
                                    <div className="text-danger small">{form.errors.amount_budget}</div>
                                ) : null}
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    value={form.values.description}
                                    onChange={(e) => form.setFieldValue("description", e.target.value)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Row 3 - Agreement Start, Agreement End, Payment Day */}
                    <Row className="mt-2">
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement Start Date</Label>
                                <Input
                                    id="agreement_start_date"
                                    name="agreement_start_date"
                                    type="date"
                                    value={form.values.agreement_start_date}
                                    onChange={(e) => form.setFieldValue("agreement_start_date", e.target.value)}
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement End Date</Label>
                                <Input
                                    id="agreement_end_date"
                                    name="agreement_end_date"
                                    type="date"
                                    value={form.values.agreement_end_date}
                                    onChange={(e) => form.setFieldValue("agreement_end_date", e.target.value)}
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                            </FormGroup>
                        </Col>

                        {!isDayBasedFrequency && (
                            <Col md="4" sm="12" style={{ position: "relative" }}>
                                <FormGroup>
                                    <Label>Payment Day</Label>
                                    <Input
                                        id="payment_date"
                                        name="payment_date"
                                        type="text"
                                        readOnly
                                        value={form.values.payment_date || ""}
                                        placeholder="Select day (1-31)"
                                        onClick={() => setShowDayPicker(!showDayPicker)}
                                        style={{ cursor: "pointer", background: "#fff" }}
                                    />

                                    {showDayPicker && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: "100%",
                                                marginTop: 6,
                                                width: "100%",
                                                zIndex: 2000,
                                            }}
                                        >
                                            <DayPicker
                                                selectedDay={selectedDayFromForm}
                                                onSelect={handleDaySelect}
                                            />
                                        </div>
                                    )}
                                </FormGroup>
                            </Col>
                        )}

                    </Row>

                    <HrLine />

                    {/* Vendor Details */}
                    <h4 className="text-primary mt-3"><u>Vendor Details</u></h4><br />
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor</Label>
                                <InputGroup>
                                    <Input
                                        id="vendor"
                                        name="vendor"
                                        type="text"
                                        value={vendorQuery}
                                        placeholder="Type vendor name or code"
                                        disabled={vendorLocked}
                                        onChange={(e) => {
                                            setVendorQuery(e.target.value);
                                            if (!vendorLocked && form.values.vendor) form.setFieldValue('vendor', null);
                                        }}
                                    />
                                    <Button color="success" onClick={handleVendorSearch} disabled={vendorLocked}>
                                        <Search size={16} />
                                    </Button>
                                </InputGroup>
                                {showVendorResults && vendorResults.length > 0 && !vendorLocked && (
                                    <div className="border p-1 mt-1" style={{ maxHeight: 200, overflowY: "auto", background: "#fff" }}>
                                        {vendorResults.map((v, idx) => (
                                            <div key={idx} style={{ padding: "6px 8px", cursor: "pointer" }} onClick={() => selectVendor(v)}>
                                                {/* show friendly label */}
                                                {(v.VENDORNAME || v.vendor_name || v.name) ? `${(v.VENDORNAME || v.vendor_name || v.name)} (${v.VENDOR || ''})` : (v.VENDOR || v.vendor || v.label)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor Name</Label>
                                <Input id="vendor_name" name="vendor_name" type="text" value={form.values.vendor_name} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account Number</Label>
                                <Input id="account_number" name="account_number" type="text" value={form.values.account_number} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row >
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account IFSC Code</Label>
                                <Input id="account_ifsc" name="account_ifsc" type="text" value={form.values.account_ifsc} disabled />
                            </FormGroup>
                        </Col>


                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    options={userPlant}
                                    label={"Plant"}
                                    form={form}
                                    id="masterPlantId"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <HrLine />
                    <h4 className="text-primary mt-3"><u>Attachment Details</u></h4><br />
                    {/* Uploaders for Agreement Copy & Mail Copy (preview button next to uploader) */}
                    <Row>
                        <Col md="6" className="mt-2">
                            <br />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Uploader
                                    setAttachment={handleFileChange}
                                    form={form}
                                    label={"Agreement Copy"}
                                    title="Pdf"
                                    id={"agreement_copy"}
                                />

                                {attachedFiles.agreement_copy && attachedFiles.agreement_copy.name && (
                                    <Button size="sm" color="primary" onClick={() => openFilePreview(attachedFiles.agreement_copy, 'Agreement Copy Preview')}>
                                        Preview
                                    </Button>
                                )}
                            </div>
                        </Col>
                        <Col md="6" className="mt-2">
                            <br />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Uploader
                                    setAttachment={handleFileChange}
                                    form={form}
                                    label={"Mail Copy"}
                                    title="Pdf"
                                    id={"mail_copy"}
                                />

                                {attachedFiles.mail_copy && attachedFiles.mail_copy.name && (
                                    <Button size="sm" color="primary" onClick={() => openFilePreview(attachedFiles.mail_copy, 'Mail Copy Preview')}>
                                        Preview
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col sm="12" className="d-flex justify-content-end">
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button.Ripple color="secondary" type="button" onClick={handleInsidesClick}>Preview</Button.Ripple>
                                <Button.Ripple color="primary" type="button" onClick={handlesubmitButtonClick}>Submit</Button.Ripple>
                            </div>
                        </Col>
                    </Row>

                    <HrLine />
                </CardComponent>
            </Fragment>

            {/* Insides Modal */}
            <Modal show={showInsides} centered size="xl" onHide={closeInsides}>
                <Modal.Header>
                    <Modal.Title>Payment Schedule Details</Modal.Title>
                    <button type="button" className="close" onClick={closeInsides}><span aria-hidden>×</span></button>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="6">
                            <FormGroup>
                                <Label>Payment To Type</Label>
                                <Input type="text" value={insidesData.paymentToTypeLabel} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <Input type="text" value={insidesData.paymentSubTypeLabel} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Agreement Start Date</Label>
                                <Input type="text" value={insidesData.agreementStart} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Agreement End Date</Label>
                                <Input type="text" value={insidesData.agreementEnd} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Payment Frequency</Label>
                                <Input type="text" value={`${insidesData.paymentFrequencyLabel}`} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Payment Duration (months span)</Label>
                                <Input type="text" value={insidesData.monthsSpan} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Payment Times</Label>
                                <Input type="text" value={insidesData.paymentTimes} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup>
                                <Label>Amount (Total)</Label>
                                <Input type="text" value={insidesData.amountBudget} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup>
                                <Label>Amount Per Payment</Label>
                                <Input type="text" value={Number(insidesData.amountPerPayment).toFixed(2)} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-2">
                        <Col md="12" className="d-flex justify-content-end">
                            <Button color="secondary" onClick={closeInsides}>Close</Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            {/* PDF Preview Modal */}
            <Modal show={previewOpen} onHide={closeFilePreview} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{previewTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ minHeight: 400, padding: 0 }}>
                    {previewUrl ? (
                        <iframe
                            title={previewTitle}
                            src={previewUrl}
                            style={{ width: '100%', height: '75vh', border: 'none' }}
                        />
                    ) : (
                        <div style={{ padding: 16 }}>No preview available</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button color="secondary" onClick={closeFilePreview}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default CrecPaymentInfo;
