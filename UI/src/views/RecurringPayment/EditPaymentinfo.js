// (the entire file — updated computeInsides included)
import React, { Fragment, useEffect, useRef, useState } from "react";
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
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod, apiGetMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import moment from "moment";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { HrLine } from "../common/HrLine";
import { Search } from "react-feather";
import Uploader from "../Uploader";

const taColumns = [
  { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
  { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
  { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
  { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
  { name: "Payment frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
  { name: "Plant Code", selector: "plant_code", sortable: true, minWidth: "100px" },
];

const CrecPaymentEdit = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  const [editableData, setEditableData] = useState(null);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [dependentOptions, setDependentOptions] = useState([]);

  const [userPlant, setUserPlant] = useState([]);

  const [vendorQuery, setVendorQuery] = useState("");
  const [vendorResults, setVendorResults] = useState([]);
  const [showVendorResults, setShowVendorResults] = useState(false);
  const [vendorLocked, setVendorLocked] = useState(false);

  const [attachedFiles, setAttachedFiles] = useState({});

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [showDayPicker, setShowDayPicker] = useState(false);
  const dayPickerRef = useRef(null);

  const [insidesData, setInsidesData] = useState({
    paymentToTypeLabel: "",
    paymentSubTypeLabel: "",
    agreementStart: "",
    agreementEnd: "",
    paymentFrequencyLabel: "",
    frequencyInterval: null,
    monthsSpan: 0,
    paymentTimes: 0,
    amountBudget: 0,
    amountPerPayment: 0,
  });

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  // formik placeholder (we use it because CustomDropdownInput expects form)
  const form = useFormik({
    isInitialValid: false,
    initialValues: { date: { start: moment().startOf("month").toDate(), end: moment().endOf("month").toDate() } },
    validationSchema: Yup.object().shape({}),
    onSubmit() {},
  });

  useEffect(() => {
    loadTableData();
    getUserPlant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTableData = async () => {
    const postdata = { user_plantid: UserDetails.plantids ? UserDetails.plantids.toString() : "" };
    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentinforejectdata", postdata);
      const { data } = response;
      if (data.success) {
        setTableData(data.results || []);
      } else {
        errorToast("Failed to fetch payment details");
      }
    } catch (err) {
      console.error(err);
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  // fetch user plant options
  const getUserPlant = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success === true) {
          const opts = (data.results || []).map((r) => {
            const value = r.value ?? r.plant_code ?? r.plant_id ?? r.id ?? r.WERKS ?? r;
            const label = r.label ?? r.plant_name ?? r.plant_desc ?? r.name ?? String(value);
            return { label, value: value, raw: r };
          });
          setUserPlant(opts);
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  // ---------- helper functions (dropdown deps & vendor search & uploads) ----------
  const fetchDepartmentsByDivision = async (divisionValue) => {
    try {
      if (!divisionValue) {
        setDepartmentOptions([]);
        return;
      }
      const id = divisionValue?.value ?? divisionValue;
      const res = await apiGetMethod(`${apiBaseUrl}RecurringPaymentController/Getdepartment/${id}`);
      const results = res?.data?.results || [];
      const opts = results.map((r) => {
        const val = r.value ?? r.department ?? r.department_code ?? r.id ?? r;
        const label = r.label ?? r.department_name ?? r.department ?? String(val);
        return { label, value: val, raw: r };
      });
      setDepartmentOptions(opts);
    } catch (err) {
      console.error("Failed to load departments", err);
      setDepartmentOptions([]);
    }
  };

  // Fetch subtypes AND optionally auto-select a subtype value after loading
  const fetchDependentOptions = async (paymentToTypeId, autoSelectValue = null) => {
    try {
      const id = paymentToTypeId?.label ?? paymentToTypeId;
      const res = await apiPostMethod(`${apiBaseUrl}RecurringPaymentController/Getpaymenttosubtypeinfo`, { paymentToTypeId: id });
      const results = res?.data?.results || [];
      const opts = results.map((r) => {
        const val = r.payment_to_subtype_id ?? r.value ?? r.id ?? r;
        const label = r.payment_to_subtype_name ?? r.label ?? String(val);
        return { label, value: val, raw: r };
      });

      setDependentOptions(opts);

      if (autoSelectValue != null) {
        const want = (autoSelectValue && typeof autoSelectValue === "object") ? (autoSelectValue.value ?? autoSelectValue.label) : autoSelectValue;
        const match = opts.find((o) => String(o.value) === String(want));
        if (match) {
          try { form.setFieldValue("payment_to_sub_type", match); } catch (e) {}
          setEditableData((prev) => ({ ...(prev || {}), payment_to_sub_type: match, payment_to_subtype_name: match.label }));
        }
      }

      return opts;
    } catch (err) {
      console.error("Failed to load sub category list", err);
      errorToast("Failed to load sub category list");
      setDependentOptions([]);
      return [];
    }
  };

  const handleVendorSearch = async () => {
    if (vendorLocked) return;
    try {
      showLoader();
      const res = await apiPostMethod(`${apiBaseUrl}RecurringPaymentController/GetVendorfromsap`, { query: vendorQuery });
      const results = res?.data?.results || [];
      setVendorResults(results);
      setShowVendorResults(true);

      if (results.length === 1) {
        const sel = results[0];
        const label = sel.VENDORNAME || sel.VENDOR_NAME || sel.vendor_name || sel.name || sel.label || sel.VENDOR || "";
        const value = sel.VENDOR || sel.vendor_id || sel.id || sel.vendor || "";
        const accFromVendor = sel.BANK_ACC_NO || sel.BANKACC_NO || sel.BANK_ACCOUNT || sel.account_number || sel.BANK_ACCOUNT_NUMBER || null;
        const ifscFromVendor = sel.IFSCCODE || sel.IFSC_CODE || sel.ifsc || sel.ifsc_code || sel.IFSC || null;

        setEditableData((prev) => ({
          ...(prev || {}),
          vendor: { label, value },
          vendor_name: label,
          account_number: accFromVendor ?? prev?.account_number,
          account_ifsc: ifscFromVendor ?? prev?.account_ifsc,
        }));

        if (form && typeof form.setFieldValue === "function") {
          form.setFieldValue("vendor", { label, value });
        }

        setVendorQuery(label);
        setShowVendorResults(false);
        setVendorLocked(true);
      } else {
        if (results.length === 0) {
          errorToast("No vendors found");
          setVendorResults([]);
          setShowVendorResults(false);
        }
      }
    } catch (err) {
      errorToast("Failed to fetch vendors");
      setVendorResults([]);
      setShowVendorResults(false);
    } finally {
      hideLoader();
    }
  };

  const selectVendor = (v) => {
    const label = v.VENDORNAME || v.VENDOR_NAME || v.vendor_name || v.name || v.label || v.VENDOR || "";
    const value = v.VENDOR || v.vendor_id || v.id || v.vendor || "";
    const acc = v.BANK_ACC_NO || v.BANKACC_NO || v.BANK_ACCOUNT || v.account_number || null;
    const ifsc = v.IFSCCODE || v.IFSC_CODE || v.ifsc || v.ifsc_code || v.IFSC || null;

    setEditableData((prev) => ({
      ...(prev || {}),
      vendor: { label, value },
      vendor_name: label,
      account_number: acc ?? prev?.account_number,
      account_ifsc: ifsc ?? prev?.account_ifsc,
    }));

    if (form && typeof form.setFieldValue === "function") form.setFieldValue("vendor", { label, value });

    setVendorQuery(label);
    setShowVendorResults(false);
    setVendorLocked(true);
  };

  const handleFileChange = (file, fieldId) => {
    setAttachedFiles((prev) => ({ ...prev, [fieldId]: file }));
  };

  const openFilePreview = (file, title = "Preview") => {
    if (!file) return;
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  const closeFilePreview = () => {
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setPreviewUrl(null);
    setPreviewTitle("");
    setPreviewOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dayPickerRef.current && !dayPickerRef.current.contains(event.target)) {
        setShowDayPicker(false);
      }
    };
    if (showDayPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDayPicker]);

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
    setEditableData((prev) => ({ ...(prev || {}), payment_date: String(dayNumber) }));
    setShowDayPicker(false);
  };

  const selectedDayFromEditable = (() => {
    const d = editableData?.payment_date;
    if (!d) return null;
    const n = Number(d);
    return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
  })();

  // ---------- UPDATED computeInsides ----------
  // ---------- UPDATED computeInsides (your requested logic) ----------
const computeInsides = (v) => {
    const data = v || editableData || {};

    const amountBudget = Number(data.amount_budget ?? 0);

    if (!data.agreement_start_date || !data.agreement_end_date || !data.payment_frequency) {
        return {
            paymentToTypeLabel: data.payment_to_type_name || "",
            paymentSubTypeLabel: data.payment_to_subtype_name || "",
            agreementStart: data.agreement_start_date || "",
            agreementEnd: data.agreement_end_date || "",
            paymentFrequencyLabel: data.payment_frequency_name || "",
            frequencyInterval: 0,
            monthsSpan: 0,
            paymentTimes: 0,
            amountBudget,
            amountPerPayment: 0,
        };
    }

    // 🔥 REAL interval = definitionsvalues (NOT value)
    let interval = 1;
    const pf = data.payment_frequency;

    if (pf && typeof pf === "object") {
        interval = Number(pf.definitionsvalues || pf.definitionsValues || 1);
    } else {
        // fallback when data is raw integer
        const pfObj = dependentOptions.find(o => String(o.value) === String(data.payment_frequency));
        interval = Number(pfObj?.definitionsvalues || 1);
    }

    const start = moment(data.agreement_start_date, "YYYY-MM-DD");
    const end = moment(data.agreement_end_date, "YYYY-MM-DD");

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
        return {
            paymentToTypeLabel: data.payment_to_type_name || "",
            paymentSubTypeLabel: data.payment_to_subtype_name || "",
            agreementStart: data.agreement_start_date,
            agreementEnd: data.agreement_end_date,
            paymentFrequencyLabel: data.payment_frequency_name,
            frequencyInterval: interval,
            monthsSpan: 0,
            paymentTimes: 0,
            amountBudget,
            amountPerPayment: 0,
        };
    }

    const monthsSpan = end.diff(start, "months") + 1;

    const paymentTimes = Math.max(1, Math.ceil(monthsSpan / interval));

    const amountPerPayment = Number((amountBudget / paymentTimes).toFixed(2));

    return {
        paymentToTypeLabel: data.payment_to_type_name || "",
        paymentSubTypeLabel: data.payment_to_subtype_name || "",
        agreementStart: data.agreement_start_date,
        agreementEnd: data.agreement_end_date,
        paymentFrequencyLabel: data.payment_frequency_name,
        frequencyInterval: interval,
        monthsSpan,
        paymentTimes,
        amountBudget,
        amountPerPayment,
    };
};



  // update insidesData whenever editableData changes
  useEffect(() => {
    const v = computeInsides(editableData);
    setInsidesData(v);
  }, [editableData]);

  // safe getters for handleSaveChanges
  const safeVal = (obj, fallback = "") => {
    if (obj === undefined || obj === null) return fallback;
    if (typeof obj === "object") return obj.value ?? obj.label ?? fallback;
    return obj;
  };
  const safeLabel = (obj, fallback = "") => {
    if (obj === undefined || obj === null) return fallback;
    if (typeof obj === "object") return obj.label ?? String(obj.value ?? fallback);
    return String(obj);
  };

  const handleSaveChanges = async () => {
    if (!editableData) return;

    const payload = {
      rp_id: editableData.rp_id ?? editableData.rpid ?? editableData.rpId ?? "",
      division: safeVal(editableData.division, ""),
      department: safeVal(editableData.department, ""),
      payment_to_type: safeVal(editableData.payment_to_type, ""),
      payment_to_type_name: safeLabel(editableData.payment_to_type, ""),
      payment_to_sub_type: safeVal(editableData.payment_to_sub_type, ""),
      payment_to_subtype_name: safeLabel(editableData.payment_to_sub_type, ""),
      payment_frequency: safeVal(editableData.payment_frequency, ""),
      payment_frequency_name: safeLabel(editableData.payment_frequency, ""),
      amount_paid_method: safeVal(editableData.amount_paid_method, ""),
      amount_paid_method_name: safeLabel(editableData.amount_paid_method, ""),
      amount_budget: editableData.amount_budget ?? editableData.amountbudget ?? "",
      description: editableData.description ?? "",
      agreement_start_date: editableData.agreement_start_date ?? editableData.agreementstartdate ?? "",
      agreement_end_date: editableData.agreement_end_date ?? editableData.agreementenddate ?? "",
      payment_date: editableData.payment_date ?? editableData.paymentdate ?? "",
      vendor: safeVal(editableData.vendor, ""),
      vendor_name:editableData?.vendor_name ?? "",
      account_number: editableData.account_number ?? editableData.accountnumber ?? "",
      account_ifsc: editableData.account_ifsc ?? editableData.accountifsccode ?? editableData.account_ifsc_code ?? "",
      masterPlantId: (() => {
        const mp = editableData.masterPlantId;
        if (!mp) return "";
        if (typeof mp === "object") return  mp.raw?.werks ?? mp.raw?.plant_code ?? mp.label ?? "";
        return mp;
      })(),
      updated_by: UserDetails?.USERID ?? "",
      // computed schedule values
      payment_times: insidesData.paymentTimes,
      amount_per_payment: insidesData.amountPerPayment,
      months_span: insidesData.monthsSpan,
      payment_frequency_interval: insidesData.frequencyInterval,
    };

    // file upload handling
    let agreementCopyFileName = editableData?.agreement_copy ?? "";
    let mailCopyFileName = editableData?.mail_copy ?? "";

    const keys = Object.keys(attachedFiles || {}).filter((k) => attachedFiles[k]);
    if (keys.length > 0) {
      const postdataFile = new FormData();
      postdataFile.append("form_name", "recurringpayment");
      postdataFile.append("ponumber", "invoice_copy");
      postdataFile.append("VA_Number", "001");
      postdataFile.append("SubFolder", "Recurring_payment");
      keys.forEach((key) => postdataFile.append("file[]", attachedFiles[key]));
      try {
        showLoader();
        const uploadResp = await apiPostMethod(sapFileShare, postdataFile, "File");
        if (uploadResp && uploadResp.data && uploadResp.data.success) {
          const uploadedFiles = uploadResp.data.files || [];
          keys.forEach((key, index) => {
            const uploaded = uploadedFiles[index] || {};
            const updname = uploaded.updname || "";
            if (key === "agreement_copy") agreementCopyFileName = updname;
            if (key === "mail_copy") mailCopyFileName = updname;
          });
        } else {
          errorToast("File upload failed. Please try again.");
          hideLoader();
          return;
        }
      } catch (err) {
        console.error(err);
        errorToast("File upload failed. Please try again.");
        hideLoader();
        return;
      } finally {
        hideLoader();
      }
    }

    payload.Attachment = agreementCopyFileName;
    payload.vendorEmailCopy = mailCopyFileName;

    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Updaterecpaymentinfo", payload);
      const { data } = response;
      if ( data.success==1) {
        ShowToast("Payment info updated successfully");
        setViewModalOpen(false);
          setTimeout(() => window.location.reload(), 2000);
      } else {
        errorToast(data?.message || "Failed to update payment info");
      }
    } catch (err) {
      console.error(err);
      errorToast("Something went wrong while saving. Please try again.");
    } finally {
      hideLoader();
    }
  };

  // helper to set provisional dropdown objects into state (keeps formik in sync)
  const setEditableField = (name, obj) => {
    try {
      if (form && typeof form.setFieldValue === "function") form.setFieldValue(name, obj);
    } catch (e) {}
    setEditableData((prev) => ({ ...(prev || {}), [name]: obj }));
  };

  // When opening view modal, prepare editableData and prefill form dropdowns
  const handleViewModalOpen = (row) => {
    if (!row) {
      setSelectedConsignment(null);
      getUserPlant();
      setEditableData(null);
      setVendorQuery("");
      setVendorLocked(false);
      setVendorResults([]);
      setShowVendorResults(false);
      setAttachedFiles({});
      setViewModalOpen(true);
      return;
    }

    setSelectedConsignment(row);

    const normalized = { ...row };

    // Division
    if (row.division !== undefined && row.division !== null) {
      const val = row.division;
      const label = row.division_name || row.divisionLabel || String(val);
      normalized.division = { label, value: val };
      try { form.setFieldValue("division", { label, value: val }); } catch (e) {}
      fetchDepartmentsByDivision(val);
    }

    // Department
    if (row.department !== undefined && row.department !== null) {
      const val = row.department;
      const label = row.department;
      normalized.department = { label, value: val };
      try { form.setFieldValue("department", { label, value: val }); } catch (e) {}
    }

    // Payment Type + auto load subtypes and auto-select subtype if present
    if (row.payment_to_type_id || row.payment_to_type_name || row.payment_to_type) {
      const value = row.payment_to_type_id || row.payment_to_type;
      const label = row.payment_to_type_name || row.payment_to_type || String(value);
      normalized.payment_to_type = { label, value };
      try { form.setFieldValue("payment_to_type", { label, value }); } catch (e) {}

      const subTypeValueFromRow = row.payment_to_subtype_id ?? row.payment_to_sub_type ?? null;

      // fetch dependent options and auto-select subtype when options are loaded
      fetchDependentOptions(value, subTypeValueFromRow);
    }

    // If API provided subtype info, set provisional now
    if (row.payment_to_subtype_id || row.payment_to_subtype_name || row.payment_to_sub_type) {
      const value = row.payment_to_subtype_id || row.payment_to_sub_type;
      const label = row.payment_to_subtype_name || row.payment_to_subtype || String(value);
      const provisional = { label, value };
      normalized.payment_to_sub_type = provisional;
      try { form.setFieldValue("payment_to_sub_type", provisional); } catch (e) {}
    }

    // Payment Frequency
    if (row.payment_frequency !== undefined || row.payment_frequency_name !== undefined) {
      const value = row.payment_frequency;
      const label = row.payment_frequency_name || String(value);
      normalized.payment_frequency = { label, value };
      try { form.setFieldValue("payment_frequency", { label, value }); } catch (e) {}
      normalized.payment_frequency_value = row.payment_frequency;
    }

    // Amount Paid Method
    if (row.amount_paid_method_id || row.amount_paid_method) {
      const value = row.amount_paid_method_id || row.amount_paid_method;
      const label = row.amount_paid_method || row.amount_paid_method_name || String(value);
      normalized.amount_paid_method = { label, value };
      try { form.setFieldValue("amount_paid_method", { label, value }); } catch (e) {}
    }

    // Plant
    if (row.plant_code !== undefined && row.plant_code !== null) {
      const value = row.plant_code;
      const label = row.plant_code;
      normalized.masterPlantId = { label, value };
      try { form.setFieldValue("masterPlantId", { label, value }); } catch (e) {}
    }

    // Vendor: prefill but keep unlocked by default
    if (row.vendor !== undefined && row.vendor !== null) {
      const value = row.vendor;
      const label = row.vendor_name || row.vendorName || row.VENDORNAME || String(value);
      normalized.vendor = { label, value };
      try { form.setFieldValue("vendor", { label, value }); } catch (e) {}
      setVendorQuery(label);
      setVendorLocked(false);
    } else {
      setVendorQuery("");
      setVendorLocked(false);
    }

    // raw fields
    normalized.account_number = row.account_number ?? "";
    normalized.account_ifsc = row.account_ifsc_code ?? row.account_ifsc ?? "";
    normalized.agreement_copy = row.agreement_copy ?? "";
    normalized.mail_copy = row.mail_copy ?? "";
    normalized.agreement_start_date = row.agreement_start_date ?? "";
    normalized.agreement_end_date = row.agreement_end_date ?? "";
    normalized.payment_date = row.payment_date ?? "";
    normalized.amount_budget = row.amount_budget ?? "";
    normalized.description = row.description ?? "";
    normalized.rp_id = row.rp_id ?? "";

    setEditableData(normalized);
    setVendorResults([]);
    setShowVendorResults(false);
    setAttachedFiles({});
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
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];

  const handleEditableChange = (field, value) => setEditableData((prev) => ({ ...(prev || {}), [field]: value }));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payment List</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent showDownload columns={columns} data={tableData} />
        </CardBody>
      </Card>

      {/* VIEW / EDIT MODAL */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} centered size="xl">
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>View Payment Details</ModalHeader>
        <ModalBody>
          <Fragment>
            <CardTitle tag="h4" className="text-primary">
              <u>General Info</u>
            </CardTitle>
            <br />

            {/* Row 1 */}
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Division</Label>
                  <CustomDropdownInput
                    url={`${apiBaseUrl}RecurringPaymentController/Getdivision/${UserDetails.plantids}`}
                    name="division"
                    id="division"
                    onChange={(selected) => {
                      handleEditableChange("division", selected);
                      handleEditableChange("department", null);
                      setDepartmentOptions([]);
                      if (selected) fetchDepartmentsByDivision(selected);
                    }}
                    value={editableData?.division}
                    defaultValue={editableData?.division}
                    form={form}
                  />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Department</Label>
                  <CustomDropdownInput
                    options={departmentOptions}
                    name="department"
                    id="department"
                    onChange={(selected) => handleEditableChange("department", selected)}
                    value={editableData?.department}
                    defaultValue={editableData?.department}
                    form={form}
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
                    onChange={(selected) => {
                      handleEditableChange("payment_to_type", selected);
                      handleEditableChange("payment_to_type_name", selected?.label || selected);
                      // when user selects new payment type, fetch subtypes (no auto-select)
                      if (selected) fetchDependentOptions(selected.label ?? selected);
                    }}
                    value={editableData?.payment_to_type}
                    defaultValue={editableData?.payment_to_type}
                    form={form}
                  />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Payment Sub Type</Label>
                  <CustomDropdownInput
                    name="payment_to_sub_type"
                    id="payment_to_sub_type"
                    options={dependentOptions}
                    onChange={(selected) => {
                      handleEditableChange("payment_to_sub_type", selected);
                      handleEditableChange("payment_to_subtype_name", selected?.label || selected);
                    }}
                    value={editableData?.payment_to_sub_type}
                    defaultValue={editableData?.payment_to_sub_type}
                    form={form}
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
                    onChange={(selected) => {
                      handleEditableChange("payment_frequency", selected);
                      handleEditableChange("payment_frequency_name", selected?.label || selected);
                      handleEditableChange("payment_frequency_value", selected?.definitionsvalues || selected?.value);
                    }}
                    value={editableData?.payment_frequency}
                    defaultValue={editableData?.payment_frequency}
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
                    onChange={(selected) => {
                      handleEditableChange("amount_paid_method", selected);
                      handleEditableChange("amount_paid_method_name", selected?.label || selected);
                    }}
                    value={editableData?.amount_paid_method}
                    defaultValue={editableData?.amount_paid_method}
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
                    value={editableData?.amount_budget ?? editableData?.amountbudget ?? ""}
                    onChange={(e) => handleEditableChange("amount_budget", e.target.value)}
                  />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    value={editableData?.description ?? ""}
                    onChange={(e) => handleEditableChange("description", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Row 3 */}
            <Row className="mt-2">
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Agreement Start Date</Label>
                  <Input
                    id="agreement_start_date"
                    name="agreement_start_date"
                    type="date"
                    value={editableData?.agreement_start_date ?? editableData?.agreementstartdate ?? ""}
                    onChange={(e) => handleEditableChange("agreement_start_date", e.target.value)}
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
                    value={editableData?.agreement_end_date ?? editableData?.agreementenddate ?? ""}
                    onChange={(e) => handleEditableChange("agreement_end_date", e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </FormGroup>
              </Col>

              <Col md="4" sm="12" style={{ position: "relative" }}>
                <FormGroup>
                  <Label>Payment Day</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="text"
                    readOnly
                    value={editableData?.payment_date ?? editableData?.paymentdate ?? ""}
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
                      <DayPicker selectedDay={selectedDayFromEditable} onSelect={handleDaySelect} />
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <HrLine />

            {/* Vendor Details */}
            <h4 className="text-primary mt-3">
              <u>Vendor Details</u>
            </h4>
            <br />
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
                        if (!vendorLocked) handleEditableChange("vendor", null);
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
                          {(v.VENDORNAME || v.vendor_name || v.name) ? `${(v.VENDORNAME || v.vendor_name || v.name)} (${v.VENDOR || ""})` : (v.VENDOR || v.vendor || v.label)}
                        </div>
                      ))}
                    </div>
                  )}
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Vendor Name</Label>
                  <Input id="vendor_name" name="vendor_name" type="text" value={editableData?.vendor_name ?? ""} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Account Number</Label>
                  <Input id="account_number" name="account_number" type="text" value={editableData?.account_number ?? ""} disabled />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Account IFSC Code</Label>
                  <Input id="account_ifsc" name="account_ifsc" type="text" value={editableData?.account_ifsc ?? editableData?.account_ifsc_code ?? ""} disabled />
                </FormGroup>
              </Col>

              <Col sm="4" md="4">
                <FormGroup>
                  <CustomDropdownInput
                    options={userPlant}
                    label={"Plant"}
                    id="masterPlantId"
                    name="masterPlantId"
                    onChange={(selected) => handleEditableChange("masterPlantId", selected)}
                    value={editableData?.masterPlantId}
                    defaultValue={editableData?.masterPlantId}
                    form={form}
                  />
                </FormGroup>
              </Col>
            </Row>

            <HrLine />
            <h4 className="text-primary mt-3">
              <u>Attachment Details</u>
            </h4>
            <br />

            <Row>
              <Col md="6" className="mt-2">
                <br />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Uploader setAttachment={handleFileChange} form={form} label={"Agreement Copy"} title="Pdf" id={"agreement_copy"} />
                  {attachedFiles.agreement_copy && attachedFiles.agreement_copy.name && (
                    <Button size="sm" color="primary" onClick={() => openFilePreview(attachedFiles.agreement_copy, "Agreement Copy Preview")}>
                      Preview
                    </Button>
                  )}
                  {!attachedFiles.agreement_copy && editableData?.agreement_copy && (
                    <a target="_blank" rel="noopener noreferrer" href={editableData.agreement_copy}>
                      <Button size="sm" color="secondary">Open Agreement</Button>
                    </a>
                  )}
                </div>
              </Col>

              <Col md="6" className="mt-2">
                <br />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Uploader setAttachment={handleFileChange} form={form} label={"Mail Copy"} title="Pdf" id={"mail_copy"} />
                  {attachedFiles.mail_copy && attachedFiles.mail_copy.name && (
                    <Button size="sm" color="primary" onClick={() => openFilePreview(attachedFiles.mail_copy, "Mail Copy Preview")}>
                      Preview
                    </Button>
                  )}
                  {!attachedFiles.mail_copy && editableData?.mail_copy && (
                    <a target="_blank" rel="noopener noreferrer" href={editableData.mail_copy}>
                      <Button size="sm" color="secondary">Open Mail Copy</Button>
                    </a>
                  )}
                </div>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col sm="12" className="d-flex justify-content-end">
                <div style={{ display: "flex", gap: 8 }}>
                  <Button.Ripple color="primary" type="button" onClick={handleSaveChanges}>
                    Save Changes
                  </Button.Ripple>
                </div>
              </Col>
            </Row>

            <HrLine />
          </Fragment>

          {/* PDF Preview Modal */}
          {previewOpen && (
            <div style={{ marginTop: 12 }}>
              <div style={{ minHeight: 400 }}>
                {previewUrl ? <iframe title={previewTitle} src={previewUrl} style={{ width: "100%", height: "60vh", border: "none" }} /> : <div>No preview available</div>}
              </div>
              <div className="mt-2 d-flex justify-content-end">
                <Button color="secondary" onClick={closeFilePreview}>
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CrecPaymentEdit;
