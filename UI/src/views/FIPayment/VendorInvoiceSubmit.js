import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Row, Col, Button, FormGroup, Input, Label, InputGroup,
} from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { ShowToast } from '../../helper/appHelper';
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, Trash2, FileText, File, Eye, X, RefreshCw, Info } from 'react-feather';
import Uploader from '../Uploader';

// ─── Reusable search input with dropdown list ─────────────────────────────
// Defined outside FIPaymentEntry so it keeps a stable component identity
// across renders; otherwise React remounts the <input> on every keystroke
// and it loses focus after a single character.
const SearchInput = ({ query, setQuery, locked, onSearch, onClear,
                       results, showResults, onSelect, formatResult, placeholder }) => (
    <div style={{ position: 'relative' }}>
        <InputGroup>
            <Input
                type="text" placeholder={placeholder || "Search..."}
                value={query} disabled={locked}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
            />
            <Button color="success" onClick={onSearch} disabled={locked}>
                <Search size={14} />
            </Button>
        </InputGroup>
        {locked && (
            <small className="text-primary" style={{ cursor: 'pointer' }} onClick={onClear}>
                ✕ Clear
            </small>
        )}
        {showResults && results.length > 0 && !locked && (
            <div style={{
                position: 'absolute', zIndex: 1050, width: '100%',
                background: '#fff', border: '1px solid #dee2e6',
                borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxHeight: 200, overflowY: 'auto', marginTop: 2,
            }}>
                {results.map((r, i) => (
                    <div key={i}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        onClick={() => onSelect(r)}>
                        {formatResult(r)}
                    </div>
                ))}
            </div>
        )}
    </div>
);

function FIPaymentEntry() {
    const history = useHistory();
    let { Id } = useParams();
    let refid = Id ? Id.replace(":", "") : '';

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const { showLoader, hideLoader } = useLoader();

    // ─── Error dialog helper (replaces errorToast) ────────────────────────────
    const showErrorDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message || "Something went wrong"}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: "#f50e0a"
        });
    };

    // ─── Info dialog helper — same buttonless confirmDialog as errors, grey ──
    const showInfoDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: "#6c757d"
        });
    };

    // ─── Department options (dropdown, sourced from user_department_mapping) ──
    const [departmentOptions, setDepartmentOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetDepartmentsByUser`, { userid: UserDetails.USERID })
            .then(res => setDepartmentOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    // ─── Vendor search (Payment To = Vendor) ────────────────────────────────
    const [vendorQuery, setVendorQuery]               = useState('');
    const [vendorResults, setVendorResults]           = useState([]);
    const [showVendorResults, setShowVendorResults]   = useState(false);
    const [vendorLocked, setVendorLocked]             = useState(false);

    // ─── Employee search (Payment To = Employee) ─────────────────────────────
    const [empQuery, setEmpQuery]                     = useState('');
    const [empResults, setEmpResults]                 = useState([]);
    const [showEmpResults, setShowEmpResults]         = useState(false);
    const [empLocked, setEmpLocked]                   = useState(false);

    // ─── GST Vendor search (Employee + GST Registered = YES) ─────────────────
    const [gstVendorQuery, setGstVendorQuery]               = useState('');
    const [gstVendorResults, setGstVendorResults]           = useState([]);
    const [showGstVendorResults, setShowGstVendorResults]   = useState(false);
    const [gstVendorLocked, setGstVendorLocked]             = useState(false);

    // Bank A/C No / IFSC Code freeze to whichever of vendor/employee/gst-vendor
    // search populates them first — a later search must not overwrite them.
    const [bankLocked, setBankLocked] = useState(false);

    // ─── MIGO line items (each resolves its own SAP VA number + docs) ────────
    const blankMigoItem = () => ({ id: Date.now() + Math.random(), migo_no: '', va_number: '', docs: {}, locked: false });
    const [migoItems, setMigoItems] = useState([blankMigoItem()]);

    // ─── Expenses Type options (dropdown for line items) ──────────────────────
    // Sourced from expense_type_gl_mapping for the logged-in user, so each option
    // also carries the gl_code/gl_description mapped to that user + expense type.
    const [expensesTypeOptions, setExpensesTypeOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetExpenseTypesByUser`, { userid: UserDetails.USERID })
            .then(res => setExpensesTypeOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    // Division is the logged-in user's own emp_division (a single value from
    // GetDivisions) — auto-filled and shown read-only, not a user choice.
    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetDivisions/${UserDetails.USERID}`, {})
            .then(res => {
                const division = res?.data?.results?.[0] || null;
                if (division) form.setFieldValue('division', division);
            });
    }, [UserDetails.USERID]); // eslint-disable-line

    // SAP's budget master for these two divisions is keyed by Division itself
    // rather than by Cost Centre — GetBudgetFromSap's cost_ctr param must
    // carry the Division code instead of the line's actual Cost Centre code
    // whenever the invoice's Division is one of these.
    const DIVISION_AS_COST_CTR = ['NLSD', 'NLCD'];

    // Looks up the available budget for a line item once both its GL Code and
    // Cost Centre are known — fired from whichever of Expenses Type / Cost
    // Centre dropdown fills in the second of the two fields.
    const fetchBudgetForLineItem = async (id, glCode, costCentre) => {
        if (!glCode || !costCentre) return;
        try {
            const divisionCode = (form.values.division?.value || '').toUpperCase();
            const costCtrParam = DIVISION_AS_COST_CTR.includes(divisionCode) ? form.values.division.value : costCentre;
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetBudgetFromSap`, {
                gl_code: glCode, cost_ctr: costCtrParam,
            });
            console.log("Budget lookup response:", res?.data);
            // SAP STATUS 2 means no budget master exists for this GL Code /
            // Cost Centre combination — leave the line item's budget unset
            // rather than storing SAP's placeholder 0, so isOverBudget treats
            // it the same as "budget not yet known" (no violation shown).
            if (String(res?.data?.results?.status) === '2') return;
            const raw = res?.data?.results?.budget;
            // <input type="number"> silently blanks itself on anything that
            // isn't a clean number (SAP pads BUDGET with trailing spaces) —
            // parse it down to a plain number before it hits state.
            const budget = raw !== undefined && raw !== null ? parseFloat(String(raw).trim()) : NaN;
            const rawReserved = res?.data?.results?.reserved;
            const reserved = rawReserved !== undefined && rawReserved !== null ? parseFloat(String(rawReserved).trim()) : NaN;
            if (!Number.isNaN(budget)) {
                setLineItems(p => p.map(i => i.id === id
                    ? { ...i, budget, reserved: Number.isNaN(reserved) ? 0 : reserved }
                    : i));
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ─── Manual budget re-sync (SAP budget can change after the initial fetch) ─
    const [syncingBudgetId, setSyncingBudgetId] = useState(null);
    const handleSyncBudget = async (item) => {
        if (!item.gl_code || !item.cost_center) return;
        setSyncingBudgetId(item.id);
        try {
            await fetchBudgetForLineItem(item.id, item.gl_code, item.cost_center);
        } finally {
            setSyncingBudgetId(null);
        }
    };

    const handleExpensesTypeChange = (id, expenseTypeId) => {
        const selected = expensesTypeOptions.find(opt => String(opt.value) === String(expenseTypeId));
        const glCode = selected ? selected.gl_code : '';
        let nextItem = null;
        setLineItems(p => p.map(i => {
            if (i.id !== id) return i;
            nextItem = {
                ...i,
                expenses_type: expenseTypeId,
                gl_code: glCode,
                gl_description: selected ? selected.gl_description : '',
            };
            return nextItem;
        }));
        if (nextItem?.gl_code && nextItem?.cost_center) {
            fetchBudgetForLineItem(id, nextItem.gl_code, nextItem.cost_center);
        }
    };

    // ─── Cost Centre options (dropdown for line items) ─────────────────────────
    // Sourced from user_cost_centre_mapping for the logged-in user, so each option
    // also carries the profit_centre/profit_centre_desc mapped alongside it.
    const [costCentreOptions, setCostCentreOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetCostCentresByUser`, { userid: UserDetails.USERID })
            .then(res => setCostCentreOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    // House Bank Id / AC No are also carried on each cost centre option, but must
    // freeze to whichever cost centre is selected first — later line items picking
    // a different cost centre must not overwrite them.
    const [houseBankLocked, setHouseBankLocked] = useState(false);

    const handleCostCentreChange = (id, mappingId) => {
        const selected = costCentreOptions.find(opt => String(opt.value) === String(mappingId));
        const costCenterCode = selected ? selected.cost_centre_code : '';
        let nextItem = null;
        setLineItems(p => p.map(i => {
            if (i.id !== id) return i;
            nextItem = {
                ...i,
                cost_center_desc: mappingId,
                cost_center: costCenterCode,
                profit_center: selected ? selected.profit_centre : '',
                profit_center_desc: selected ? selected.profit_centre_desc : '',
            };
            return nextItem;
        }));
        if (selected && !houseBankLocked) {
            form.setFieldValue('house_bank_id', selected.house_bank_id || '');
            form.setFieldValue('house_bank_ac_no', selected.house_bank_ac_no || '');
            form.setFieldValue('business_area', selected.business_area || '');
            setHouseBankLocked(true);
        }
        if (nextItem?.cost_center && nextItem?.gl_code) {
            fetchBudgetForLineItem(id, nextItem.gl_code, nextItem.cost_center);
        }
    };

    // ─── Tax Type options (dropdown for line items) ────────────────────────────
    // Sourced from the SAP tax code master, so each option also carries the
    // tax_description mapped alongside it.
    const [taxOptions, setTaxOptions] = useState([]);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTaxCodesFromSap`, {})
            .then(res => setTaxOptions(res?.data?.results || []));
    }, []);

    const handleTaxTypeChange = (id, taxCode) => {
        const selected = taxOptions.find(opt => String(opt.value) === String(taxCode));
        setLineItems(p => p.map(i => i.id === id ? {
            ...i,
            tax_type: taxCode,
            tax_code: selected ? selected.tax_code : '',
            tax_description: selected ? selected.description : '',
        } : i));
    };

    // ─── Line items ──────────────────────────────────────────────────────────
    const blankLineItem = () => ({
        id: Date.now(),
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([blankLineItem()]);

    // ─── File attachments ────────────────────────────────────────────────────
    const [attachedFiles, setAttachedFiles]   = useState({});
    const [previewUrl, setPreviewUrl]         = useState(null);
    const [previewTitle, setPreviewTitle]     = useState('');
    const [previewOpen, setPreviewOpen]       = useState(false);
    const [previewFileType, setPreviewFileType] = useState('');

    const handleFileChange = (file, fieldId) =>
        setAttachedFiles(prev => ({ ...prev, [fieldId]: file }));

    const openPreview = (fieldId, label) => {
        const file = attachedFiles[fieldId];
        if (!file) return;
        if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} }
        setPreviewUrl(URL.createObjectURL(file));
        setPreviewTitle(label);
        setPreviewFileType(file.type.startsWith('image/') ? 'image' : 'pdf');
        setPreviewOpen(true);
    };

    const closePreview = () => {
        if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} }
        setPreviewUrl(null); setPreviewTitle('');
        setPreviewOpen(false); setPreviewFileType('');
    };

    // For docs pulled from purchase_order / gate_in_out_info — already a
    // remote URL, so no createObjectURL/revoke needed.
    const openRemotePreview = (url, label) => {
        if (!url) return;
        setPreviewUrl(url);
        setPreviewTitle(label);
        setPreviewFileType(/\.pdf($|\?)/i.test(url) ? 'pdf' : 'image');
        setPreviewOpen(true);
    };

    useEffect(() => () => { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} } }, []); // eslint-disable-line

    // ─── Static options ──────────────────────────────────────────────────────
    const paymentToOptions = [
        { value: '1', label: 'Vendor' },
        { value: '2', label: 'Employee' },
    ];
    const gstOptions = [
        { value: '1', label: 'YES' },
        { value: '2', label: 'NO' },
    ];
    const paymentMethodOptions = [
        { value: 'direct', label: 'Direct Invoice' },
        { value: 'po', label: 'Condition type based' },
    ];

    // ─── Formik ──────────────────────────────────────────────────────────────
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            // Basic
            payment_to: null, department: null, invoice_number: '',
            invoice_date: '', invoice_amount: '',
            payment_method: paymentMethodOptions[0], service_category: null,
            gst_registered: null,
            // Vendor mode
            vendor_code: '', vendor_name: '',
            division: null, invoice_type: null, payment_term: null,
            // Employee mode
            emp_code: '', emp_name: '',
            // Employee + GST Yes → extra vendor
            gst_vendor_code: '', gst_vendor_name: '',
            // Bank & Compliance (auto-filled from vendor / gst-vendor search)
            bank_ac_no: '', bank_ifsc_code: '',
            nature_of_expenses: '', house_bank_id: '', house_bank_ac_no: '',
            business_area: '',
        },
        validationSchema: Yup.object().shape({
            payment_to:         Yup.object().nullable().required("Payment To is required"),
            invoice_number:     Yup.string().required("Invoice Number is required")
                .test('not-blank', "Invoice Number cannot be blank spaces", (value) => !!value && value.trim().length > 0),
            invoice_date:       Yup.string().required("Invoice Date is required"),
            invoice_amount:     Yup.number().typeError("Amount must be a number").min(0)
                .test('max-digits', "Invoice Amount can have at most 7 digits before the decimal point",
                    (value) => value === undefined || value === null || String(value).split('.')[0].length <= 7)
                .test('max-decimals', "Invoice Amount can have at most 2 decimal places",
                    (value) => value === undefined || value === null || /^\d+(\.\d{1,2})?$/.test(String(value)))
                .required("Invoice Amount is required"),
            nature_of_expenses: Yup.string().required("Nature of Expenses is required"),
        }),
        onSubmit() {},
    });

    // ─── Invoice Amount: numeric only, max 7 integer digits, max 2 decimals ──
    const handleInvoiceAmountChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const firstDot = val.indexOf('.');
        if (firstDot !== -1) {
            val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, '');
        }
        let [intPart, decPart] = val.split('.');
        intPart = intPart.slice(0, 7);
        val = decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
        form.setFieldValue('invoice_amount', val);
    };

    // ─── Derived flags ────────────────────────────────────────────────────────
    const paymentToVal = form.values.payment_to?.value;   // '1' | '2' | undefined
    const isVendor     = paymentToVal === '1';
    const isEmployee   = paymentToVal === '2';
    const gstVal       = form.values.gst_registered?.value; // '1' | '2' | undefined
    const isGstYes     = isEmployee && gstVal === '1';
    const paymentMethodVal = form.values.payment_method?.value; // 'direct' | 'po'
    const isPOBased    = paymentMethodVal === 'po';

    // ─── Reset MIGO/Service Category when switching away from PO Based Invoice ─
    useEffect(() => {
        if (isPOBased) return;
        setMigoItems([blankMigoItem()]);
        form.setFieldValue('service_category', null);
    }, [isPOBased]); // eslint-disable-line

    // ─── Reset all detail fields when Payment To changes ─────────────────────
    useEffect(() => {
        // vendor
        setVendorQuery(''); setVendorResults([]); setShowVendorResults(false); setVendorLocked(false);
        form.setFieldValue('vendor_code', ''); form.setFieldValue('vendor_name', '');
        // division is the user's own profile value (auto-filled once) — leave it
        form.setFieldValue('invoice_type', null);
        form.setFieldValue('payment_term', null);
        // employee
        setEmpQuery(''); setEmpResults([]); setShowEmpResults(false); setEmpLocked(false);
        form.setFieldValue('emp_code', ''); form.setFieldValue('emp_name', '');
        // gst-vendor
        setGstVendorQuery(''); setGstVendorResults([]); setShowGstVendorResults(false); setGstVendorLocked(false);
        form.setFieldValue('gst_vendor_code', ''); form.setFieldValue('gst_vendor_name', '');
        // bank
        form.setFieldValue('bank_ac_no', ''); form.setFieldValue('bank_ifsc_code', ''); setBankLocked(false);
    }, [paymentToVal]); // eslint-disable-line

    // ─── Reset GST-vendor when GST dropdown changes ───────────────────────────
    useEffect(() => {
        setGstVendorQuery(''); setGstVendorResults([]); setShowGstVendorResults(false); setGstVendorLocked(false);
        form.setFieldValue('gst_vendor_code', ''); form.setFieldValue('gst_vendor_name', '');
        form.setFieldValue('bank_ac_no', ''); form.setFieldValue('bank_ifsc_code', ''); setBankLocked(false);
    }, [gstVal]); // eslint-disable-line

    // ─── Vendor search handlers ───────────────────────────────────────────────
    const handleVendorSearch = async () => {
        if (vendorLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetVendorfromsap`, { query: vendorQuery });
            const results = res?.data?.results || [];
            if (results.length === 0) { showErrorDialog("No vendors found"); return; }
            setVendorResults(results); setShowVendorResults(true);
            if (results.length === 1) selectVendor(results[0]);
        } catch { showErrorDialog("Failed to fetch vendors"); }
        finally { hideLoader(); }
    };

    const selectVendor = (v) => {
        setVendorQuery(v.VENDOR || '');
        form.setFieldValue('vendor_code', v.VENDOR || '');
        form.setFieldValue('vendor_name', v.VENDORNAME || '');
        if (!bankLocked) {
            if (v.BANK_ACC_NO) form.setFieldValue('bank_ac_no', v.BANK_ACC_NO);
            if (v.IFSC_CODE)   form.setFieldValue('bank_ifsc_code', v.IFSC_CODE);
            setBankLocked(true);
        }
        setShowVendorResults(false); setVendorLocked(true);
    };

    const clearVendor = () => {
        setVendorLocked(false); setVendorQuery('');
        ['vendor_code','vendor_name'].forEach(k => form.setFieldValue(k, ''));
        form.setFieldValue('bank_ac_no', ''); form.setFieldValue('bank_ifsc_code', ''); setBankLocked(false);
    };

    // ─── Employee search handlers ─────────────────────────────────────────────
    const handleEmpSearch = async () => {
        if (empLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetVendorfromsap`, { query: empQuery });
            const results = res?.data?.results || [];
            if (results.length === 0) { showErrorDialog("No employees found"); return; }
            setEmpResults(results); setShowEmpResults(true);
            if (results.length === 1) selectEmployee(results[0]);
        } catch { showErrorDialog("Failed to fetch employees"); }
        finally { hideLoader(); }
    };

    const selectEmployee = (e) => {
        setEmpQuery(e.VENDOR || '');
        form.setFieldValue('emp_code', e.VENDOR || '');
        form.setFieldValue('emp_name', e.VENDORNAME || '');
        if (!bankLocked) {
            if (e.BANK_ACC_NO) form.setFieldValue('bank_ac_no', e.BANK_ACC_NO);
            if (e.IFSC_CODE)   form.setFieldValue('bank_ifsc_code', e.IFSC_CODE);
            setBankLocked(true);
        }
        setShowEmpResults(false); setEmpLocked(true);
    };

    const clearEmployee = () => {
        setEmpLocked(false); setEmpQuery('');
        ['emp_code','emp_name'].forEach(k => form.setFieldValue(k, ''));
        form.setFieldValue('bank_ac_no', ''); form.setFieldValue('bank_ifsc_code', ''); setBankLocked(false);
    };

    // ─── GST-Vendor search handlers (Employee + GST Yes) ─────────────────────
    const handleGstVendorSearch = async () => {
        if (gstVendorLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetVendorfromsap`, { query: gstVendorQuery });
            const results = res?.data?.results || [];
            if (results.length === 0) { showErrorDialog("No vendors found"); return; }
            setGstVendorResults(results); setShowGstVendorResults(true);
            if (results.length === 1) selectGstVendor(results[0]);
        } catch { showErrorDialog("Failed to fetch vendors"); }
        finally { hideLoader(); }
    };

    const selectGstVendor = (v) => {
        setGstVendorQuery(v.VENDOR || '');
        form.setFieldValue('gst_vendor_code', v.VENDOR || '');
        form.setFieldValue('gst_vendor_name', v.VENDORNAME || '');
        if (!bankLocked) {
            if (v.BANK_ACC_NO) form.setFieldValue('bank_ac_no', v.BANK_ACC_NO);
            if (v.IFSC_CODE)   form.setFieldValue('bank_ifsc_code', v.IFSC_CODE);
            setBankLocked(true);
        }
        setShowGstVendorResults(false); setGstVendorLocked(true);
    };

    const clearGstVendor = () => {
        setGstVendorLocked(false); setGstVendorQuery('');
        ['gst_vendor_code','gst_vendor_name'].forEach(k => form.setFieldValue(k, ''));
        form.setFieldValue('bank_ac_no', ''); form.setFieldValue('bank_ifsc_code', ''); setBankLocked(false);
    };

    // ─── MIGO line item handlers ──────────────────────────────────────────────
    const addMigoItem    = () => setMigoItems(p => [...p, blankMigoItem()]);
    const removeMigoItem = (id) => setMigoItems(p => p.filter(i => i.id !== id));
    const updateMigoItem = (id, field, value) =>
        setMigoItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

    const fetchMigoDetails = async (id, migoNo) => {
        if (!migoNo) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetMigoDetails`, { migo_no: migoNo });
            const d = res?.data?.results || res?.data;
            if (!d?.va_number) { showErrorDialog("No VA number found for this MIGO"); return; }
            setMigoItems(p => p.map(i => i.id === id ? { ...i, va_number: d.va_number, docs: d, locked: true } : i));
        } catch { showErrorDialog("Failed to fetch MIGO details"); }
        finally { hideLoader(); }
    };

    const clearMigoItem = (id) =>
        setMigoItems(p => p.map(i => i.id === id ? { ...i, va_number: '', docs: {}, locked: false } : i));

    // ─── Line item helpers ────────────────────────────────────────────────────
    const addLineItem    = () => setLineItems(p => [...p, blankLineItem()]);
    const removeLineItem = (id) => {
        setLineItems(p => p.filter(i => i.id !== id));
    };
    const updateLineItem = (id, field, value) =>
        setLineItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

    // A blank/unknown budget (no GL Code + Cost Centre picked yet) isn't a
    // violation — only flag rows where a real budget figure is on record.
    // The fetched budget is per GL Code + Cost Centre, so two rows sharing the
    // same combo draw from the same pool — compare their combined amount
    // against it, not each row's amount in isolation (GetBudgetFromSap already
    // nets out amounts reserved by *other* submitted invoices on the backend).
    const isOverBudget = (item, allItems = lineItems) => {
        if (item.budget === '' || item.budget === null || item.budget === undefined) return false;
        if (!item.gl_code || !item.cost_center) return false;
        const groupTotal = allItems
            .filter(i => i.gl_code === item.gl_code && i.cost_center === item.cost_center)
            .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        return groupTotal > (parseFloat(item.budget) || 0);
    };

    // HSN/SAC is mandatory per line item only for Material invoices — Service
    // invoices have no HSN/SAC to report.
    const isMaterialInvoiceType = (invoiceType) => (invoiceType?.label || '').toUpperCase().includes('MATERIAL');
    const isHsnMissing = (item) => isMaterialInvoiceType(form.values.invoice_type) && !String(item.hsn_sac || '').trim();

    // Tax code descriptions from SAP are the only place a rate is exposed —
    // GetTaxCodesFromSap only forwards TAX_CODE/TAX_DESC, no separate rate
    // field — so CGST/SGST/IGST rates are parsed out of that free text.
    // SAP writes this two different ways: rate-follows-its-own-keyword
    // ("CGST 9% + SGST 9%") and keywords-grouped-then-rates-grouped
    // ("SGST,CGST @ 9%+9%") — pairing keywords and rates up positionally, in
    // the order each is written, handles both shapes (a per-keyword proximity
    // match breaks on the second shape, since both keywords sit together
    // before either rate). A lone "18%" with no CGST/SGST/IGST keyword is
    // treated as an intra-state rate and split evenly.
    const parseTaxRates = (description) => {
        const text = (description || '').toUpperCase();
        const keywords = text.match(/CGST|SGST|IGST/g) || [];
        const rates = (text.match(/\d+(?:\.\d+)?\s*%/g) || []).map(r => parseFloat(r));

        const rateFor = {};
        if (keywords.length && rates.length === 1) {
            // One combined rate shared across every keyword mentioned, e.g. "GST @18% (CGST+SGST)".
            keywords.forEach(kw => { rateFor[kw] = rates[0]; });
        } else if (keywords.length && rates.length) {
            const n = Math.min(keywords.length, rates.length);
            for (let i = 0; i < n; i++) rateFor[keywords[i]] = (rateFor[keywords[i]] || 0) + rates[i];
        }

        if (!Object.keys(rateFor).length) {
            const rate = rates[0] || 0;
            return { cgstRate: rate / 2, sgstRate: rate / 2, igstRate: 0 };
        }
        return { cgstRate: rateFor.CGST || 0, sgstRate: rateFor.SGST || 0, igstRate: rateFor.IGST || 0 };
    };

    // Amount is entered tax-inclusive — back out the base from the parsed
    // rate, round the tax components, then let Base Amt absorb the rounding
    // remainder so Base + CGST + SGST + IGST always reconciles to Amount.
    const round2 = (n) => Math.round(n * 100) / 100;
    const getTaxSplit = (item) => {
        const amt = parseFloat(item.amount) || 0;
        const { cgstRate, sgstRate, igstRate } = parseTaxRates(item.tax_description);
        const totalRate = cgstRate + sgstRate + igstRate;
        if (!amt || !totalRate) return { baseAmt: amt, cgstAmt: 0, sgstAmt: 0, igstAmt: 0 };
        const rawBase = amt / (1 + totalRate / 100);
        const cgstAmt = round2(rawBase * cgstRate / 100);
        const sgstAmt = round2(rawBase * sgstRate / 100);
        const igstAmt = round2(rawBase * igstRate / 100);
        const baseAmt = round2(amt - cgstAmt - sgstAmt - igstAmt);
        return { baseAmt, cgstAmt, sgstAmt, igstAmt };
    };

    const lineTaxSplits = lineItems.map(getTaxSplit);
    const subTotal   = lineTaxSplits.reduce((s, t) => s + t.baseAmt, 0);
    const taxAmount  = lineTaxSplits.reduce((s, t) => s + t.cgstAmt + t.sgstAmt + t.igstAmt, 0);
    const grandTotal = subTotal + taxAmount;

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const errors = await form.validateForm();
        if (Object.keys(errors).length) {
            const labels = {
                payment_to: "Payment To", invoice_number: "Invoice Number",
                invoice_date: "Invoice Date", invoice_amount: "Invoice Amount",
                nature_of_expenses: "Nature of Expenses",
            };
            showErrorDialog(`Please Fill: ${[...new Set(Object.keys(errors).map(k => labels[k] || k))].join(", ")}`);
            return;
        }
        if (lineItems.some(item => isOverBudget(item))) {
            showErrorDialog("One or more line items exceed the available budget for their GL Code / Cost Centre.");
            return;
        }
        if (lineItems.some(item => isHsnMissing(item))) {
            showErrorDialog("HSN/SAC Code is required for all line items when Invoice Type is Material.");
            return;
        }
        const invoiceAmountNum = parseFloat(form.values.invoice_amount) || 0;
        if (Math.abs(grandTotal - invoiceAmountNum) > 0.01) {
            showErrorDialog(`Total line item amount (INR ${grandTotal.toFixed(2)}) does not match Invoice Amount (INR ${invoiceAmountNum.toFixed(2)}).`);
            return;
        }
        if (!attachedFiles.Invoicecopy) {
            showErrorDialog("Please attach the Invoice Copy before submitting.");
            return;
        }
        showLoader();
        try {
            let invoiceCopyFileName = '', attachmentFileName = '';
            const keys = Object.keys(attachedFiles || {}).filter(k => attachedFiles[k]);
            if (keys.length > 0) {
                const fd = new FormData();
                fd.append("form_name", "fipayment"); fd.append("ponumber", "Invoicecopy");
                fd.append("SubFolder", "FI_Payment");
                keys.forEach(k => fd.append("file[]", attachedFiles[k]));
                const uploadResp = await apiPostMethod(sapFileShare, fd, "File");
                if (!uploadResp?.data?.success) { showErrorDialog("File upload failed."); return; }
                (uploadResp.data.files || []).forEach((f, i) => {
                    if (keys[i] === "Invoicecopy") invoiceCopyFileName = f.updname || '';
                    if (keys[i] === "Attachment")   attachmentFileName  = f.updname || '';
                });
            }
            const v = form.values;
            const postData = {
                payment_to: v.payment_to?.label, department: v.department?.label,
                invoice_number: v.invoice_number, invoice_date: v.invoice_date,
                invoice_amount: v.invoice_amount,
                payment_method: v.payment_method?.value,
                migo_items: migoItems.filter(m => m.migo_no).map(({ id, docs, locked, ...rest }) => rest),
                service_category: v.service_category?.value,
                gst_registered: v.gst_registered?.value,
                // vendor fields
                vendor_code: v.vendor_code, vendor_name: v.vendor_name,
                division: v.division?.value, invoice_type: v.invoice_type?.value,
                payment_term: v.payment_term?.value,
                // employee fields
                emp_code: v.emp_code, emp_name: v.emp_name,
                gst_vendor_code: v.gst_vendor_code, gst_vendor_name: v.gst_vendor_name,
                // bank
                bank_ac_no: v.bank_ac_no, bank_ifsc_code: v.bank_ifsc_code,
                nature_of_expenses: v.nature_of_expenses,
                house_bank_id: v.house_bank_id, house_bank_ac_no: v.house_bank_ac_no,
                business_area: v.business_area,
                line_items: lineItems.map(item => {
                    const { id, ...rest } = item;
                    const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                    return { ...rest, base_amount: baseAmt, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt };
                }),
                Invoicecopy: invoiceCopyFileName, Attachment: attachmentFileName,
                created_by: UserDetails.USERID,
            };
            const { data } = await apiPostMethod(apiBaseUrl + "FIPaymentController/InsertFIPayment", postData);
            if (data.success) {
                ShowToast(data.message || "Saved Successfully...");
                setTimeout(() => window.location.reload(), 2000);
            } else {
                showErrorDialog(data.message || "Unable to save");
            }
        } catch (e) {
            console.error(e);
            showErrorDialog("Something went wrong, please try again.");
        } finally {
            hideLoader();
        }
    };

    const AttachCard = ({ fieldId, label, icon, borderColor, iconColor }) => {
        const file = attachedFiles[fieldId];
        const hasFile = !!(file && file.name);
        return (
            <div style={{
                border: `2px dashed ${hasFile ? iconColor : borderColor}`,
                borderRadius: 8, padding: '18px 12px 14px',
                textAlign: 'center', background: '#fafafa',
                marginBottom: 12, transition: 'border-color 0.2s',
            }}>
                <div style={{ marginBottom: 6 }}>
                    {React.cloneElement(icon, { size: 32, color: hasFile ? iconColor : '#adb5bd' })}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: '#343a40', fontSize: 14 }}>{label}</div>
                {hasFile ? (
                    <div style={{
                        fontSize: 11, color: '#495057', background: '#e9ecef', borderRadius: 4,
                        padding: '2px 8px', marginBottom: 10, wordBreak: 'break-all',
                        lineHeight: 1.5, display: 'inline-block', maxWidth: '100%',
                    }}>
                        {file.name}
                    </div>
                ) : (
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 10 }}>
                        {fieldId === 'Invoicecopy' ? 'PDF, JPG up to 10MB' : 'Additional supporting docs'}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <Uploader setAttachment={handleFileChange} form={form}
                            label={hasFile ? 'Replace' : 'Attach File'} title="Pdf" id={fieldId} />
                    </div>
                    <Button size="sm" color="primary" disabled={!hasFile}
                        onClick={() => openPreview(fieldId, label)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                 whiteSpace: 'nowrap', flexShrink: 0, opacity: hasFile ? 1 : 0.45 }}>
                        <Eye size={13} /> Preview
                    </Button>
                </div>
                {hasFile && (
                    <div style={{ marginTop: 8 }}>
                        <small style={{ color: '#dc3545', cursor: 'pointer', fontSize: 11 }}
                            onClick={() => setAttachedFiles(prev => ({ ...prev, [fieldId]: null }))}>
                            <X size={11} style={{ verticalAlign: 'middle' }} /> Remove file
                        </small>
                    </div>
                )}
            </div>
        );
    };

    // ─── Shared section header ────────────────────────────────────────────────
    const SectionHeader = ({ icon, title }) => (
        <div className="d-flex align-items-center mb-3 mt-3">
            <span className="text-primary mr-2" style={{ fontSize: 18 }}>{icon}</span>
            <h5 className="text-primary mb-0"><strong>{title}</strong></h5>
        </div>
    );

    // ─── Bank lock flag (bank auto-filled from vendor, employee, OR gst-vendor) ─
    const bankAutoFilled = vendorLocked || empLocked || gstVendorLocked;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div>
            <Fragment>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                    {/* ══════════════════ LEFT FORM ══════════════════ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <CardComponent header="Vendor Invoice Submission">

                            {/* ── BASIC INFORMATION ────────────────────── */}
                            <SectionHeader icon="ℹ" title="Basic Information" />

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Payment To <span className="text-danger">*</span></Label>
                                        <CustomDropdownInput
                                            options={paymentToOptions}
                                            form={form} id="payment_to"
                                            onChange={sel => form.setFieldValue('payment_to', sel)}
                                        />
                                        {form.touched.payment_to && form.errors.payment_to && (
                                            <div className="text-danger small">{form.errors.payment_to}</div>
                                        )}
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Payment Method</Label>
                                        <CustomDropdownInput
                                            options={paymentMethodOptions}
                                            form={form} id="payment_method"
                                            onChange={sel => form.setFieldValue('payment_method', sel)}
                                        />
                                    </FormGroup>
                                </Col>
                                {isEmployee && (
                                    <Col md="4" sm="12">
                                        <FormGroup>
                                            <Label>GST Registered</Label>
                                            <CustomDropdownInput
                                                options={gstOptions}
                                                form={form} id="gst_registered"
                                                placeholder="Select..."
                                                onChange={sel => form.setFieldValue('gst_registered', sel)}
                                            />
                                        </FormGroup>
                                    </Col>
                                )}
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Department</Label>
                                        <CustomDropdownInput
                                            options={departmentOptions}
                                            form={form} id="department"
                                            placeholder="Select Department..."
                                            onChange={sel => form.setFieldValue('department', sel)}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Number <span className="text-danger">*</span></Label>
                                        <Input id="invoice_number" name="invoice_number" type="text"
                                            placeholder="e.g. INV-2024-001" value={form.values.invoice_number}
                                            onChange={form.handleChange} onBlur={form.handleBlur} />
                                        {form.touched.invoice_number && form.errors.invoice_number && (
                                            <div className="text-danger small">{form.errors.invoice_number}</div>
                                        )}
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Date <span className="text-danger">*</span></Label>
                                        <Input id="invoice_date" name="invoice_date" type="date"
                                            value={form.values.invoice_date}
                                            onChange={form.handleChange} onBlur={form.handleBlur}
                                            onKeyDown={e => e.preventDefault()}
                                            max={new Date().toISOString().split("T")[0]} />
                                        {form.touched.invoice_date && form.errors.invoice_date && (
                                            <div className="text-danger small">{form.errors.invoice_date}</div>
                                        )}
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Amount <span className="text-danger">*</span></Label>
                                        <Input id="invoice_amount" name="invoice_amount" type="text"
                                            inputMode="decimal" placeholder="0.00"
                                            value={form.values.invoice_amount}
                                            onChange={handleInvoiceAmountChange} onBlur={form.handleBlur} />
                                        {form.touched.invoice_amount && form.errors.invoice_amount && (
                                            <div className="text-danger small">{form.errors.invoice_amount}</div>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            {isPOBased && (
                                <>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Service Category</Label>
                                                <CustomDropdownInput
                                                    url={`${apiBaseUrl}FIPaymentController/GetServiceCategories`}
                                                    name="service_category" id="service_category"
                                                    form={form} placeholder="Select..." />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <Label className="mb-0">MIGO Numbers</Label>
                                        <Button color="outline-primary" size="sm" onClick={addMigoItem}
                                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Plus size={14} /> Add MIGO
                                        </Button>
                                    </div>

                                    {migoItems.map(item => {
                                        const docLinks = [
                                            ['po_invoice_copy', 'Invoice Copy'],
                                            ['po_coa_copy', 'PO COA'],
                                            ['gate_shipment_copy', 'Shipment Copy'],
                                            ['gate_coa_copy', 'Gate COA'],
                                            ['gate_pick_slip_copy', 'Pick Slip'],
                                            ['gate_sending_wb_slip', 'Sending WB Slip'],
                                        ].filter(([key]) => item.docs?.[key]);

                                        return (
                                            <Row key={item.id} className="align-items-center mb-2"
                                                style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                                                <Col md="3" sm="12">
                                                    <InputGroup>
                                                        <Input type="text" placeholder="MIGO number..."
                                                            value={item.migo_no} disabled={item.locked}
                                                            onChange={e => updateMigoItem(item.id, 'migo_no', e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter') fetchMigoDetails(item.id, item.migo_no); }} />
                                                        <Button color="success" disabled={item.locked}
                                                            onClick={() => fetchMigoDetails(item.id, item.migo_no)}>
                                                            <Search size={14} />
                                                        </Button>
                                                    </InputGroup>
                                                    {item.locked && (
                                                        <small className="text-primary" style={{ cursor: 'pointer' }}
                                                            onClick={() => clearMigoItem(item.id)}>
                                                            ✕ Clear
                                                        </small>
                                                    )}
                                                </Col>
                                                <Col md="2" sm="12">
                                                    <Input type="text" placeholder="VA Number" value={item.va_number}
                                                        disabled style={{ background: '#f0f0f0' }} />
                                                </Col>
                                                <Col md="6" sm="12">
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                                        {docLinks.map(([key, label]) => (
                                                            <span key={key} className="text-primary"
                                                                style={{ cursor: 'pointer', fontSize: 12 }}
                                                                onClick={() => openRemotePreview(item.docs[key], label)}>
                                                                <Eye size={12} style={{ verticalAlign: 'text-bottom', marginRight: 2 }} />{label}
                                                            </span>
                                                        ))}
                                                        {docLinks.length === 0 && item.locked && (
                                                            <small className="text-muted">No documents found</small>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col md="1" sm="12" className="text-center">
                                                    <Button color="danger" size="sm" style={{ padding: '2px 6px' }}
                                                        onClick={() => removeMigoItem(item.id)} disabled={migoItems.length === 1}>
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </>
                            )}

                            <HrLine />

                            {/* ── DETAILS SECTION (conditional) ────────── */}
                            <SectionHeader
                                icon="▦"
                                title={isEmployee ? 'Employee Details' : 'Vendor Details'}
                            />

                            {/* ──── VENDOR MODE ──── */}
                            {isVendor && (
                                <>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Vendor Code</Label>
                                                <SearchInput
                                                    query={vendorQuery} setQuery={setVendorQuery}
                                                    locked={vendorLocked} onSearch={handleVendorSearch}
                                                    onClear={clearVendor} results={vendorResults}
                                                    showResults={showVendorResults} onSelect={selectVendor}
                                                    placeholder="Search vendor code..."
                                                    formatResult={v =>
                                                        v.VENDORNAME
                                                            ? `${v.VENDORNAME} (${v.VENDOR})`
                                                            : v.VENDOR
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Vendor Name</Label>
                                                <Input type="text" value={form.values.vendor_name}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled after search" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Division</Label>
                                                <Input type="text" value={form.values.division?.label || ''}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled from your profile" />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Invoice Type</Label>
                                                <CustomDropdownInput
                                                    url={`${apiBaseUrl}FIPaymentController/GetInvoiceTypes`}
                                                    name="invoice_type" id="invoice_type"
                                                    form={form} placeholder="Select..." />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Payment Term</Label>
                                                <CustomDropdownInput
                                                    url={`${apiBaseUrl}FIPaymentController/GetPaymentTerms`}
                                                    name="payment_term" id="payment_term"
                                                    form={form} placeholder="Select..." />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* ──── EMPLOYEE MODE ──── */}
                            {isEmployee && (
                                <>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Employee Code</Label>
                                                <SearchInput
                                                    query={empQuery} setQuery={setEmpQuery}
                                                    locked={empLocked} onSearch={handleEmpSearch}
                                                    onClear={clearEmployee} results={empResults}
                                                    showResults={showEmpResults} onSelect={selectEmployee}
                                                    placeholder="Employee Vendor code..."
                                                    formatResult={e =>
                                                        e.VENDORNAME
                                                            ? `${e.VENDORNAME} (${e.VENDOR})`
                                                            : e.VENDOR
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Employee Name</Label>
                                                <Input type="text" value={form.values.emp_name}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled after search" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Division</Label>
                                                <Input type="text" value={form.values.division?.label || ''}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled from your profile" />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Invoice Type</Label>
                                                <CustomDropdownInput
                                                    url={`${apiBaseUrl}FIPaymentController/GetInvoiceTypes`}
                                                    name="invoice_type" id="invoice_type"
                                                    form={form} placeholder="Select..." />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Payment Term</Label>
                                                <CustomDropdownInput
                                                    url={`${apiBaseUrl}FIPaymentController/GetPaymentTerms`}
                                                    name="payment_term" id="payment_term"
                                                    form={form} placeholder="Select..." />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {/* ──── EMPLOYEE + GST = YES → show vendor search ──── */}
                                    {isGstYes && (
                                        <Row>
                                            <Col md="4" sm="12">
                                                <FormGroup>
                                                    <Label>Vendor Code</Label>
                                                    <SearchInput
                                                        query={gstVendorQuery} setQuery={setGstVendorQuery}
                                                        locked={gstVendorLocked} onSearch={handleGstVendorSearch}
                                                        onClear={clearGstVendor} results={gstVendorResults}
                                                        showResults={showGstVendorResults} onSelect={selectGstVendor}
                                                        placeholder="Search vendor code..."
                                                        formatResult={v =>
                                                            v.VENDORNAME
                                                                ? `${v.VENDORNAME} (${v.VENDOR})`
                                                                : v.VENDOR
                                                        }
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm="12">
                                                <FormGroup>
                                                    <Label>Vendor Name</Label>
                                                    <Input type="text" value={form.values.gst_vendor_name}
                                                        disabled style={{ background: '#f0f0f0' }}
                                                        placeholder="Auto-filled after search" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    )}
                                </>
                            )}

                            {/* Placeholder when no payment type selected */}
                            {!paymentToVal && (
                                <div style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#adb5bd',
                                    background: '#f8f9fa',
                                    borderRadius: 8,
                                    border: '1px dashed #dee2e6',
                                    marginBottom: 12,
                                }}>
                                    Select <strong>Payment To</strong> above to see the relevant details
                                </div>
                            )}

                            <HrLine />

                            {/* ── BANK DETAILS & COMPLIANCE ────────────── */}
                            <SectionHeader icon="🏦" title="Bank Details & Compliance" />

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>
                                            Bank A/c No
                                            {bankAutoFilled && (
                                                <span style={{ fontSize: 10, color: '#3a5fd9', marginLeft: 6 }}>
                                                    (auto-filled)
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="bank_ac_no" name="bank_ac_no" type="text"
                                            value={form.values.bank_ac_no} onChange={form.handleChange}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>
                                            Bank IFSC Code
                                            {bankAutoFilled && (
                                                <span style={{ fontSize: 10, color: '#3a5fd9', marginLeft: 6 }}>
                                                    (auto-filled)
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="bank_ifsc_code" name="bank_ifsc_code" type="text"
                                            value={form.values.bank_ifsc_code} onChange={form.handleChange}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Nature of Expenses <span className="text-danger">*</span></Label>
                                        <Input id="nature_of_expenses" name="nature_of_expenses" type="text"
                                            placeholder="Enter expense nature"
                                            value={form.values.nature_of_expenses}
                                            onChange={form.handleChange} onBlur={form.handleBlur} />
                                        {form.touched.nature_of_expenses && form.errors.nature_of_expenses && (
                                            <div className="text-danger small">{form.errors.nature_of_expenses}</div>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>
                                            House Bank Id
                                            {houseBankLocked && (
                                                <span style={{ fontSize: 10, color: '#3a5fd9', marginLeft: 6 }}>
                                                    (auto-filled)
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="house_bank_id" name="house_bank_id" type="text"
                                            value={form.values.house_bank_id}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>
                                            House Bank AC No
                                            {houseBankLocked && (
                                                <span style={{ fontSize: 10, color: '#3a5fd9', marginLeft: 6 }}>
                                                    (auto-filled)
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="house_bank_ac_no" name="house_bank_ac_no" type="text"
                                            value={form.values.house_bank_ac_no}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>
                                            Business Area
                                            {houseBankLocked && (
                                                <span style={{ fontSize: 10, color: '#3a5fd9', marginLeft: 6 }}>
                                                    (auto-filled)
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="business_area" name="business_area" type="text"
                                            value={form.values.business_area}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <HrLine />

                            {/* ── SUPPORTING DOCUMENTS ─────────────────── */}
                            <SectionHeader icon="📎" title="Supporting Documents" />

                            <Row>
                                <Col md="6" sm="12">
                                    <AttachCard fieldId="Invoicecopy" label="Invoice copy"
                                        icon={<FileText />} borderColor="#ced4da" iconColor="#3a5fd9" />
                                </Col>
                                <Col md="6" sm="12">
                                    <AttachCard fieldId="Attachment" label="Attachment"
                                        icon={<File />} borderColor="#3a5fd9" iconColor="#3a5fd9" />
                                </Col>
                            </Row>

                            <HrLine />

                            {/* ── LINE ITEM DETAILS ─────────────────────── */}
                            <div className="d-flex align-items-center justify-content-between mb-3 mt-3">
                                <div className="d-flex align-items-center">
                                    <span className="text-primary mr-2" style={{ fontSize: 18 }}>▦</span>
                                    <h5 className="text-primary mb-0"><strong>Line Item Details</strong></h5>
                                </div>
                                <Button color="outline-primary" size="sm" onClick={addLineItem}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Plus size={14} /> Add Line Item
                                </Button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                            {['Expenses Type','GL Code','GL Description','Budget','Amount',
                                              'Cost Center Desc','Cost Center','Tax Type','Tax Code',
                                              'Tax Description','Base Amt','CGST','SGST','IGST','Text','Profit Center',
                                              'Profit Center Description','HSN/SAC',''].map(col => (
                                                <th key={col} style={{ padding: '8px 6px', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 600, color: '#495057', borderRight: '1px solid #e9ecef' }}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map(item => {
                                            const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                                            return (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '4px', minWidth: 140 }}>
                                                    <Input
                                                        type="select" bsSize="sm"
                                                        value={item.expenses_type}
                                                        onChange={e => handleExpensesTypeChange(item.id, e.target.value)}
                                                    >
                                                        <option value="">Select...</option>
                                                        {expensesTypeOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" placeholder="GL-1002" value={item.gl_code} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'gl_code',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 120 }}><Input type="text" bsSize="sm" placeholder="Admin Logisti..." value={item.gl_description} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'gl_description',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 150 }}>
                                                    <InputGroup size="sm">
                                                        <Input type="number" bsSize="sm" placeholder="1,500.00" value={item.budget} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'budget',e.target.value)} />
                                                        <Button color="outline-secondary" size="sm"
                                                            title="Re-fetch budget from SAP"
                                                            disabled={!item.gl_code || !item.cost_center || syncingBudgetId === item.id}
                                                            onClick={() => handleSyncBudget(item)}>
                                                            <RefreshCw size={12} className={syncingBudgetId === item.id ? 'spinner' : ''} />
                                                        </Button>
                                                        <Button color="outline-secondary" size="sm"
                                                            title="Show amount reserved"
                                                            onClick={() => showInfoDialog(`Amount Reserved: INR ${(parseFloat(item.reserved) || 0).toFixed(2)}`)}>
                                                            <Info size={12} />
                                                        </Button>
                                                    </InputGroup>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 90 }}>
                                                    <Input type="number" bsSize="sm" step="0.01" min="0" placeholder="0.00"
                                                        value={item.amount} invalid={isOverBudget(item)}
                                                        onChange={e => updateLineItem(item.id,'amount',e.target.value)} />
                                                    {isOverBudget(item) && (
                                                        <small className="text-danger" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                                                            Exceeds budget
                                                        </small>
                                                    )}
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 170 }}>
                                                    <Input
                                                        type="select" bsSize="sm"
                                                        value={item.cost_center_desc}
                                                        onChange={e => handleCostCentreChange(item.id, e.target.value)}
                                                    >
                                                        <option value="">Select...</option>
                                                        {costCentreOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" placeholder="CC-900" value={item.cost_center} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'cost_center',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 140 }}>
                                                    <Input
                                                        type="select" bsSize="sm"
                                                        value={item.tax_type}
                                                        onChange={e => handleTaxTypeChange(item.id, e.target.value)}
                                                    >
                                                        <option value="">Select...</option>
                                                        {taxOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 70 }}><Input type="text" bsSize="sm" placeholder="V1" value={item.tax_code} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'tax_code',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 120 }}><Input type="text" bsSize="sm" placeholder="Standard 18%" value={item.tax_description} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'tax_description',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="number" bsSize="sm" value={baseAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={cgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={sgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={igstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  /></td>
                                                <td style={{ padding: '4px', minWidth: 70 }}><Input type="text" bsSize="sm" placeholder="..." value={item.text} onChange={e => updateLineItem(item.id,'text',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" placeholder="PC-Globa..." value={item.profit_center} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'profit_center',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 130 }}><Input type="text" bsSize="sm" placeholder="Global Operati..." value={item.profit_center_desc} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'profit_center_desc',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}>
                                                    <Input type="text" bsSize="sm" placeholder="HSN..." value={item.hsn_sac}
                                                        invalid={isHsnMissing(item)}
                                                        onChange={e => updateLineItem(item.id,'hsn_sac',e.target.value)} />
                                                    {isHsnMissing(item) && (
                                                        <small className="text-danger" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                                                            Required for Material
                                                        </small>
                                                    )}
                                                </td>
                                                <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                    <Button color="danger" size="sm" style={{ padding: '2px 6px' }}
                                                        onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}>
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="d-flex justify-content-end mt-3" style={{ gap: 32 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: '#6c757d' }}>Sub-Total</div>
                                    <div style={{ fontWeight: 600 }}>INR {subTotal.toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: '#6c757d' }}>Tax Total</div>
                                    <div style={{ fontWeight: 600 }}>INR {taxAmount.toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: '#6c757d' }}>Grand Total</div>
                                    <div style={{ fontWeight: 700, color: '#3a5fd9', fontSize: 16 }}>INR {grandTotal.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <Row className="mt-4">
                                <Col sm="12" className="d-flex justify-content-end">
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Button color="primary" type="button" onClick={handleSubmit}>Submit</Button>
                                    </div>
                                </Col>
                            </Row>

                            <HrLine />
                        </CardComponent>
                    </div>

                </div>

                {/* ══════════════════ PREVIEW MODAL ══════════════════ */}
                <Modal show={previewOpen} onHide={closePreview} centered size="xl">
                    <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                        <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                            {previewFileType === 'image'
                                ? <FileText size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                : <File size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />}
                            {previewTitle}
                        </Modal.Title>
                        <button type="button" className="close" onClick={closePreview}>
                            <span aria-hidden>×</span>
                        </button>
                    </Modal.Header>
                    <Modal.Body style={{ padding: 0, minHeight: 400 }}>
                        {previewUrl && previewFileType === 'image' && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, background: '#f0f0f0', minHeight: 400 }}>
                                <img src={previewUrl} alt={previewTitle}
                                    style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }} />
                            </div>
                        )}
                        {previewUrl && previewFileType === 'pdf' && (
                            <iframe title={previewTitle} src={previewUrl}
                                style={{ width: '100%', height: '78vh', border: 'none' }} />
                        )}
                        {!previewUrl && (
                            <div style={{ padding: 32, textAlign: 'center', color: '#6c757d' }}>No preview available</div>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ background: '#f8f9fa' }}>
                        <Button color="secondary" size="sm" onClick={closePreview}>Close</Button>
                    </Modal.Footer>
                </Modal>

            </Fragment>
        </div>
    );
}

export default FIPaymentEntry;