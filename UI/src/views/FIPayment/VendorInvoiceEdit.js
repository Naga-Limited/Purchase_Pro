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
import { Search, Plus, Trash2, FileText, File, Eye, X, ArrowLeft, RefreshCw, Info } from 'react-feather';
import Uploader from '../Uploader';

// ─── Reusable search input with dropdown list (same as VendorInvoiceSubmit) ─
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

// ─── Backend returns a flat array (one row per line item, header fields
// repeated on every row). Collapse it into one editable record, keeping the
// raw ids/text FI Payment stores (not the joined *_name display columns) so
// the form fields and dropdowns can be pre-filled for editing. ─────────────
const transformForEdit = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];
    const lineRows = rows.filter(r => r.line_id !== null && r.line_id !== undefined);

    return {
        payment_id: first.payment_id,
        payment_to: first.payment_to,
        department: first.department,
        payment_method: first.payment_method || 'direct',
        invoice_number: first.invoice_number,
        invoice_date: first.invoice_date,
        invoice_amount: first.invoice_amount,
        migo_items: (first.migo_details || []).map((m, i) => ({
            id: m.migo_detail_id || Date.now() + i,
            migo_detail_id: m.migo_detail_id || null,
            migo_no: m.migo_no || '',
            va_number: m.va_number || '',
            docs: m,
            locked: true,
        })),
        service_category: first.service_category,
        gst_registered: first.gst_registered,
        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        division: first.division,
        invoice_type: first.invoice_type,
        payment_term: first.payment_term,
        emp_code: first.emp_code,
        emp_name: first.emp_name,
        gst_vendor_code: first.gst_vendor_code,
        gst_vendor_name: first.gst_vendor_name,
        bank_ac_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        business_area: first.business_area,
        nature_of_expenses: first.nature_of_expenses,
        invoice_copy: first.invoice_copy,
        back_paper: first.back_paper,
        rejection_remarks: first.rejection_remarks,
        line_items: (lineRows.length ? lineRows : [{}]).map((r, i) => ({
            id: r.line_id || Date.now() + i,
            line_id: r.line_id || null,
            expenses_type: r.expenses_type || '',
            gl_code: r.gl_code || '',
            gl_description: r.gl_description || '',
            budget: r.budget ?? '',
            amount: r.amount ?? '',
            cost_center_desc: r.cost_center_desc || '',
            cost_center: r.cost_center || '',
            tax_type: r.tax_type || '',
            tax_code: r.tax_code || '',
            tax_description: r.tax_description || '',
            text: r.item_text || '',
            profit_center: r.profit_center || '',
            profit_center_desc: r.profit_center_description || '',
            hsn_sac: r.hsn_sac || '',
        })),
    };
};

// Required-field validation for the header, checked at Resubmit time.
const validationSchema = Yup.object().shape({
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
});

const VALIDATION_LABELS = {
    payment_to: "Payment To", invoice_number: "Invoice Number",
    invoice_date: "Invoice Date", invoice_amount: "Invoice Amount",
    nature_of_expenses: "Nature of Expenses",
};

function VendorInvoiceEdit() {
    const history = useHistory();
    const { Id } = useParams();
    const paymentId = Id ? Id.replace(":", "") : '';

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const { showLoader, hideLoader } = useLoader();

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

    // CustomDropdownInput only needs a form-shaped object to read touched/errors
    // from — the fields here are driven directly off `editableData` (value +
    // onChange passed explicitly below), so this stays an inert placeholder.
    const dummyForm = { values: {}, errors: {}, touched: {}, setFieldValue: () => {}, setFieldTouched: () => {} };

    // ─── Load the rejected request to edit ────────────────────────────────
    const [record, setRecord] = useState(null);
    const [loadError, setLoadError] = useState('');

    const fetchRecord = () => {
        if (!paymentId) { setLoadError('No request id provided'); return; }
        showLoader();
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetFIPaymentById`, { id: paymentId })
            .then((res) => {
                if (res?.data?.success && res.data.results?.length) {
                    setRecord(transformForEdit(res.data.results));
                    setLoadError('');
                } else {
                    setLoadError(res?.data?.message || 'Unable to load payment request');
                }
            })
            .catch(() => {
                setLoadError('Failed to fetch payment request from server');
                showErrorDialog('Failed to fetch payment request from server');
            })
            .finally(() => hideLoader());
    };

    useEffect(() => {
        fetchRecord();
    }, [paymentId]); // eslint-disable-line

    // ─── Department options (dropdown, sourced from user_department_mapping) ──
    const [departmentOptions, setDepartmentOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetDepartmentsByUser`, { userid: UserDetails.USERID })
            .then(res => setDepartmentOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    // ─── Division / Invoice Type / Payment Term / Service Category options ──
    // Fetched directly here (instead of via CustomDropdownInput's url= prop)
    // so the loaded record can be matched against them and pre-selected.
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [invoiceTypeOptions, setInvoiceTypeOptions] = useState([]);
    const [paymentTermOptions, setPaymentTermOptions] = useState([]);
    const [serviceCategoryOptions, setServiceCategoryOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetDivisions/${UserDetails.USERID}`, {})
            .then(res => setDivisionOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetInvoiceTypes`, {})
            .then(res => setInvoiceTypeOptions(res?.data?.results || []));
    }, []);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetPaymentTerms`, {})
            .then(res => setPaymentTermOptions(res?.data?.results || []));
    }, []);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetServiceCategories`, {})
            .then(res => setServiceCategoryOptions(res?.data?.results || []));
    }, []);

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
    const blankMigoItem = () => ({ id: Date.now() + Math.random(), migo_detail_id: null, migo_no: '', va_number: '', docs: {}, locked: false });
    const [migoItems, setMigoItems] = useState([blankMigoItem()]);

    // ─── Expenses Type options (dropdown for line items) ──────────────────────
    const [expensesTypeOptions, setExpensesTypeOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetExpenseTypesByUser`, { userid: UserDetails.USERID })
            .then(res => setExpensesTypeOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

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
            const divisionCode = (editableData.division?.value || '').toUpperCase();
            const costCtrParam = DIVISION_AS_COST_CTR.includes(divisionCode) ? editableData.division.value : costCentre;
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetBudgetFromSap`, {
                gl_code: glCode, cost_ctr: costCtrParam,
            });
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
    const [costCentreOptions, setCostCentreOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetCostCentresByUser`, { userid: UserDetails.USERID })
            .then(res => setCostCentreOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

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
            handleEditableChange('house_bank_id', selected.house_bank_id || '');
            handleEditableChange('house_bank_ac_no', selected.house_bank_ac_no || '');
            handleEditableChange('business_area', selected.business_area || '');
            setHouseBankLocked(true);
        }
        if (nextItem?.cost_center && nextItem?.gl_code) {
            fetchBudgetForLineItem(id, nextItem.gl_code, nextItem.cost_center);
        }
    };

    // ─── Tax Type options (dropdown for line items) ────────────────────────────
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
        line_id: null,
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([blankLineItem()]);

    // ─── File attachments ────────────────────────────────────────────────────
    // `existingFiles` holds the filenames already on record (shown as-is unless
    // the user attaches a replacement into `attachedFiles`).
    const [existingFiles, setExistingFiles] = useState({ Invoicecopy: '', Attachment: '' });
    const [attachedFiles, setAttachedFiles]   = useState({});
    const [previewUrl, setPreviewUrl]         = useState(null);
    const [previewTitle, setPreviewTitle]     = useState('');
    const [previewOpen, setPreviewOpen]       = useState(false);
    const [previewFileType, setPreviewFileType] = useState('');

    const handleFileChange = (file, fieldId) =>
        setAttachedFiles(prev => ({ ...prev, [fieldId]: file }));

    const openPreview = (fieldId, label) => {
        const file = attachedFiles[fieldId];
        if (file) {
            if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} }
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewTitle(label);
            setPreviewFileType(file.type.startsWith('image/') ? 'image' : 'pdf');
            setPreviewOpen(true);
            return;
        }
        const existingUrl = existingFiles[fieldId];
        if (!existingUrl) return;
        setPreviewUrl(existingUrl);
        setPreviewTitle(label);
        setPreviewFileType(/\.(png|jpe?g|gif|webp)$/i.test(existingUrl) ? 'image' : 'pdf');
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
        { value: 'po', label: 'PO Based Invoice' },
    ];

    // ─── Single editable-data object driving every header field ──────────────
    // (same pattern as RecurringPayment/EditPaymentinfo.js: one plain object
    // updated via handleEditableChange, instead of Formik-managed values.)
    const [editableData, setEditableData] = useState({
        payment_to: null, department: null, invoice_number: '',
        invoice_date: '', invoice_amount: '',
        payment_method: paymentMethodOptions[0], service_category: null,
        gst_registered: null,
        vendor_code: '', vendor_name: '',
        division: null, invoice_type: null, payment_term: null,
        emp_code: '', emp_name: '',
        gst_vendor_code: '', gst_vendor_name: '',
        bank_ac_no: '', bank_ifsc_code: '',
        nature_of_expenses: '', house_bank_id: '', house_bank_ac_no: '',
        business_area: '',
    });

    const handleEditableChange = (field, value) =>
        setEditableData(prev => ({ ...(prev || {}), [field]: value }));

    // ─── Hydrate editableData once the rejected record has loaded ────────────
    useEffect(() => {
        if (!record) return;

        const pt = paymentToOptions.find(o => o.label.toUpperCase() === String(record.payment_to || '').toUpperCase()) || null;
        const pm = paymentMethodOptions.find(o => o.value === (record.payment_method || 'direct')) || paymentMethodOptions[0];
        const gst = (record.gst_registered !== null && record.gst_registered !== undefined && record.gst_registered !== '')
            ? (gstOptions.find(o => o.value === String(record.gst_registered)) || null)
            : null;

        // department/division/invoice_type/payment_term/service_category are
        // filled in separately below, once their option lists have loaded —
        // merge (not replace) so those don't get clobbered by this effect.
        setEditableData(prev => ({
            ...prev,
            payment_to: pt,
            payment_method: pm,
            invoice_number: record.invoice_number || '',
            invoice_date: record.invoice_date || '',
            invoice_amount: record.invoice_amount != null ? String(record.invoice_amount) : '',
            gst_registered: gst,
            vendor_code: record.vendor_code || '',
            vendor_name: record.vendor_name || '',
            emp_code: record.emp_code || '',
            emp_name: record.emp_name || '',
            gst_vendor_code: record.gst_vendor_code || '',
            gst_vendor_name: record.gst_vendor_name || '',
            bank_ac_no: record.bank_ac_no || '',
            bank_ifsc_code: record.bank_ifsc_code || '',
            nature_of_expenses: record.nature_of_expenses || '',
            house_bank_id: record.house_bank_id || '',
            house_bank_ac_no: record.house_bank_ac_no || '',
            business_area: record.business_area || '',
        }));

        // Vendor Code / Emp Code stay editable-search on load (pre-filled with
        // the saved value, but not locked) so a rejected request can be
        // resubmitted against a different vendor/employee if needed.
        if (record.vendor_code) { setVendorQuery(record.vendor_code); }
        if (record.emp_code) { setEmpQuery(record.emp_code); }
        if (record.gst_vendor_code) { setGstVendorQuery(record.gst_vendor_code); setGstVendorLocked(true); }
        if (record.bank_ac_no || record.bank_ifsc_code) setBankLocked(true);
        if (record.house_bank_id || record.house_bank_ac_no) setHouseBankLocked(true);

        setLineItems(record.line_items && record.line_items.length ? record.line_items : [blankLineItem()]);
        setMigoItems(record.migo_items && record.migo_items.length ? record.migo_items : [blankMigoItem()]);
        setExistingFiles({ Invoicecopy: record.invoice_copy || '', Attachment: record.back_paper || '' });
    }, [record]); // eslint-disable-line

    // ─── Fill in the async-loaded dropdowns once their options arrive ────────
    useEffect(() => {
        if (!record || !departmentOptions.length || !record.department) return;
        const match = departmentOptions.find(o => o.label === record.department);
        if (match) handleEditableChange('department', match);
    }, [record, departmentOptions]); // eslint-disable-line

    useEffect(() => {
        if (!record || !divisionOptions.length || !record.division) return;
        const match = divisionOptions.find(o => o.value === record.division);
        if (match) handleEditableChange('division', match);
    }, [record, divisionOptions]); // eslint-disable-line

    useEffect(() => {
        if (!record || !invoiceTypeOptions.length || !record.invoice_type) return;
        const match = invoiceTypeOptions.find(o => String(o.value) === String(record.invoice_type));
        if (match) handleEditableChange('invoice_type', match);
    }, [record, invoiceTypeOptions]); // eslint-disable-line

    useEffect(() => {
        if (!record || !paymentTermOptions.length || !record.payment_term) return;
        const match = paymentTermOptions.find(o => String(o.value) === String(record.payment_term));
        if (match) handleEditableChange('payment_term', match);
    }, [record, paymentTermOptions]); // eslint-disable-line

    useEffect(() => {
        if (!record || !serviceCategoryOptions.length || !record.service_category) return;
        const match = serviceCategoryOptions.find(o => String(o.value) === String(record.service_category));
        if (match) handleEditableChange('service_category', match);
    }, [record, serviceCategoryOptions]); // eslint-disable-line

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
        handleEditableChange('invoice_amount', val);
    };

    // ─── Derived flags ────────────────────────────────────────────────────────
    const paymentToVal = editableData.payment_to?.value;
    const isVendor     = paymentToVal === '1';
    const isEmployee   = paymentToVal === '2';
    const gstVal       = editableData.gst_registered?.value;
    const isGstYes     = isEmployee && gstVal === '1';
    const paymentMethodVal = editableData.payment_method?.value;
    const isPOBased    = paymentMethodVal === 'po';
    const bankAutoFilled = vendorLocked || empLocked || gstVendorLocked;

    // ─── User-driven dropdown changes (each resets whatever it invalidates,
    // inline — only fires from an actual onChange, never during hydration) ───
    const handlePaymentToChange = (sel) => {
        setVendorQuery(''); setVendorResults([]); setShowVendorResults(false); setVendorLocked(false);
        setEmpQuery(''); setEmpResults([]); setShowEmpResults(false); setEmpLocked(false);
        setGstVendorQuery(''); setGstVendorResults([]); setShowGstVendorResults(false); setGstVendorLocked(false);
        setBankLocked(false);
        setEditableData(prev => ({
            ...prev,
            payment_to: sel,
            vendor_code: '', vendor_name: '',
            division: null, invoice_type: null, payment_term: null,
            emp_code: '', emp_name: '',
            gst_vendor_code: '', gst_vendor_name: '',
            bank_ac_no: '', bank_ifsc_code: '',
        }));
    };

    const handleGstRegisteredChange = (sel) => {
        setGstVendorQuery(''); setGstVendorResults([]); setShowGstVendorResults(false); setGstVendorLocked(false);
        setBankLocked(false);
        setEditableData(prev => ({
            ...prev,
            gst_registered: sel,
            gst_vendor_code: '', gst_vendor_name: '',
            bank_ac_no: '', bank_ifsc_code: '',
        }));
    };

    const handlePaymentMethodChange = (sel) => {
        if (sel?.value === 'po') {
            handleEditableChange('payment_method', sel);
            return;
        }
        setMigoItems([blankMigoItem()]);
        setEditableData(prev => ({ ...prev, payment_method: sel, service_category: null }));
    };

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
        handleEditableChange('vendor_code', v.VENDOR || '');
        handleEditableChange('vendor_name', v.VENDORNAME || '');
        if (!bankLocked) {
            if (v.BANK_ACC_NO) handleEditableChange('bank_ac_no', v.BANK_ACC_NO);
            if (v.IFSC_CODE)   handleEditableChange('bank_ifsc_code', v.IFSC_CODE);
            setBankLocked(true);
        }
        setShowVendorResults(false); setVendorLocked(true);
    };

    const clearVendor = () => {
        setVendorLocked(false); setVendorQuery('');
        setEditableData(prev => ({ ...prev, vendor_code: '', vendor_name: '', bank_ac_no: '', bank_ifsc_code: '' }));
        setBankLocked(false);
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
        handleEditableChange('emp_code', e.VENDOR || '');
        handleEditableChange('emp_name', e.VENDORNAME || '');
        if (!bankLocked) {
            if (e.BANK_ACC_NO) handleEditableChange('bank_ac_no', e.BANK_ACC_NO);
            if (e.IFSC_CODE)   handleEditableChange('bank_ifsc_code', e.IFSC_CODE);
            setBankLocked(true);
        }
        setShowEmpResults(false); setEmpLocked(true);
    };

    const clearEmployee = () => {
        setEmpLocked(false); setEmpQuery('');
        setEditableData(prev => ({ ...prev, emp_code: '', emp_name: '', bank_ac_no: '', bank_ifsc_code: '' }));
        setBankLocked(false);
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
        handleEditableChange('gst_vendor_code', v.VENDOR || '');
        handleEditableChange('gst_vendor_name', v.VENDORNAME || '');
        if (!bankLocked) {
            if (v.BANK_ACC_NO) handleEditableChange('bank_ac_no', v.BANK_ACC_NO);
            if (v.IFSC_CODE)   handleEditableChange('bank_ifsc_code', v.IFSC_CODE);
            setBankLocked(true);
        }
        setShowGstVendorResults(false); setGstVendorLocked(true);
    };

    const clearGstVendor = () => {
        setGstVendorLocked(false); setGstVendorQuery('');
        setEditableData(prev => ({ ...prev, gst_vendor_code: '', gst_vendor_name: '', bank_ac_no: '', bank_ifsc_code: '' }));
        setBankLocked(false);
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
    const isHsnMissing = (item) => isMaterialInvoiceType(editableData.invoice_type) && !String(item.hsn_sac || '').trim();

    const subTotal   = lineItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const taxAmount  = 0;
    const grandTotal = subTotal + taxAmount;

    // ─── Submit (resubmits the rejected request for Manager Approval) ────────
    const handleSubmit = async () => {
        try {
            await validationSchema.validate(editableData, { abortEarly: false });
        } catch (err) {
            const fields = [...new Set((err.inner && err.inner.length ? err.inner : [err]).map(e => e.path))];
            showErrorDialog(`Please Fill: ${fields.map(f => VALIDATION_LABELS[f] || f).join(", ")}`);
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
        const invoiceAmountNum = parseFloat(editableData.invoice_amount) || 0;
        if (Math.abs(grandTotal - invoiceAmountNum) > 0.01) {
            showErrorDialog(`Total line item amount (INR ${grandTotal.toFixed(2)}) does not match Invoice Amount (INR ${invoiceAmountNum.toFixed(2)}).`);
            return;
        }
        showLoader();
        try {
            let invoiceCopyFileName = existingFiles.Invoicecopy || '';
            let attachmentFileName  = existingFiles.Attachment || '';
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
            const v = editableData;
            const postData = {
                payment_id: record.payment_id,
                payment_to: v.payment_to?.label, department: v.department?.label,
                invoice_number: v.invoice_number, invoice_date: v.invoice_date,
                invoice_amount: v.invoice_amount,
                payment_method: v.payment_method?.value,
                migo_items: migoItems.filter(m => m.migo_no).map(({ id, docs, locked, ...rest }) => rest),
                service_category: v.service_category?.value,
                gst_registered: v.gst_registered?.value,
                vendor_code: v.vendor_code, vendor_name: v.vendor_name,
                division: v.division?.value, invoice_type: v.invoice_type?.value,
                payment_term: v.payment_term?.value,
                emp_code: v.emp_code, emp_name: v.emp_name,
                gst_vendor_code: v.gst_vendor_code, gst_vendor_name: v.gst_vendor_name,
                bank_ac_no: v.bank_ac_no, bank_ifsc_code: v.bank_ifsc_code,
                nature_of_expenses: v.nature_of_expenses,
                house_bank_id: v.house_bank_id, house_bank_ac_no: v.house_bank_ac_no,
                business_area: v.business_area,
                line_items: lineItems.map(({ id, ...rest }) => rest),
                Invoicecopy: invoiceCopyFileName, Attachment: attachmentFileName,
                updated_by: UserDetails.USERID,
            };
            const { data } = await apiPostMethod(apiBaseUrl + "FIPaymentController/UpdateFIPayment", postData);
            if (data.success) {
                ShowToast(data.message || "Resubmitted Successfully...");
                setTimeout(() => history.push('/INVOICERECEIPTREJECTEDLIST'), 1500);
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
        const hasNewFile = !!(file && file.name);
        const existingUrl = existingFiles[fieldId];
        const hasExistingFile = !hasNewFile && !!existingUrl;
        const hasFile = hasNewFile || hasExistingFile;
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
                {hasNewFile ? (
                    <div style={{
                        fontSize: 11, color: '#495057', background: '#e9ecef', borderRadius: 4,
                        padding: '2px 8px', marginBottom: 10, wordBreak: 'break-all',
                        lineHeight: 1.5, display: 'inline-block', maxWidth: '100%',
                    }}>
                        {file.name}
                    </div>
                ) : hasExistingFile ? (
                    <div style={{
                        fontSize: 11, color: '#495057', background: '#e9ecef', borderRadius: 4,
                        padding: '2px 8px', marginBottom: 10,
                        lineHeight: 1.5, display: 'inline-block', maxWidth: '100%',
                    }}>
                        Current file on record
                    </div>
                ) : (
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 10 }}>
                        {fieldId === 'Invoicecopy' ? 'PDF, JPG up to 10MB' : 'Additional supporting docs'}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <Uploader setAttachment={handleFileChange}
                            label={hasFile ? 'Replace' : 'Attach File'} title="Pdf" id={fieldId} />
                    </div>
                    <Button size="sm" color="primary" disabled={!hasFile}
                        onClick={() => openPreview(fieldId, label)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                 whiteSpace: 'nowrap', flexShrink: 0, opacity: hasFile ? 1 : 0.45 }}>
                        <Eye size={13} /> Preview
                    </Button>
                </div>
                {hasNewFile && (
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

    // ─── Loading / error states ─────────────────────────────────────────────
    if (!record && !loadError) {
        return (
            <CardComponent header="Vendor Invoice Submission — Edit">
                <div style={{ padding: 48, textAlign: 'center', color: '#6c757d' }}>
                    Loading payment request…
                </div>
            </CardComponent>
        );
    }

    if (loadError && !record) {
        return (
            <CardComponent header="Vendor Invoice Submission — Edit">
                <div style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ color: '#dc3545', marginBottom: 12 }}>{loadError}</div>
                    <Button color="primary" size="sm" onClick={fetchRecord} className="mr-1">Retry</Button>
                    <Button color="light" size="sm" onClick={() => history.goBack()}
                        style={{ border: '1px solid #dee2e6' }}>
                        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Back
                    </Button>
                </div>
            </CardComponent>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div>
            <Fragment>
                <Button color="light" onClick={() => history.goBack()}
                    className="mb-2"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #dee2e6' }}>
                    <ArrowLeft size={15} /> Back
                </Button>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                    {/* ══════════════════ LEFT FORM ══════════════════ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <CardComponent header="Vendor Invoice Submission — Edit & Resubmit">

                            {record?.rejection_remarks && (
                                <div style={{
                                    padding: '10px 14px', borderRadius: 6, background: '#fbe6e6',
                                    color: '#a3282a', marginBottom: 16, fontSize: 13,
                                }}>
                                    <strong>Rejection Remarks:</strong> {record.rejection_remarks}
                                </div>
                            )}

                            {/* ── BASIC INFORMATION ────────────────────── */}
                            <SectionHeader icon="ℹ" title="Basic Information" />

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Payment To <span className="text-danger">*</span></Label>
                                        <CustomDropdownInput
                                            options={paymentToOptions}
                                            form={dummyForm} id="payment_to"
                                            value={editableData.payment_to}
                                            onChange={handlePaymentToChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Payment Method</Label>
                                        <CustomDropdownInput
                                            options={paymentMethodOptions}
                                            form={dummyForm} id="payment_method"
                                            value={editableData.payment_method}
                                            onChange={handlePaymentMethodChange}
                                        />
                                    </FormGroup>
                                </Col>
                                {isEmployee && (
                                    <Col md="4" sm="12">
                                        <FormGroup>
                                            <Label>GST Registered</Label>
                                            <CustomDropdownInput
                                                options={gstOptions}
                                                form={dummyForm} id="gst_registered"
                                                placeholder="Select..."
                                                value={editableData.gst_registered}
                                                onChange={handleGstRegisteredChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                )}
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Department</Label>
                                        <CustomDropdownInput
                                            options={departmentOptions}
                                            form={dummyForm} id="department"
                                            placeholder="Select Department..."
                                            value={editableData.department}
                                            onChange={sel => handleEditableChange('department', sel)}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Number <span className="text-danger">*</span></Label>
                                        <Input id="invoice_number" name="invoice_number" type="text"
                                            placeholder="e.g. INV-2024-001" value={editableData.invoice_number}
                                            onChange={e => handleEditableChange('invoice_number', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Date <span className="text-danger">*</span></Label>
                                        <Input id="invoice_date" name="invoice_date" type="date"
                                            value={editableData.invoice_date}
                                            onChange={e => handleEditableChange('invoice_date', e.target.value)}
                                            onKeyDown={e => e.preventDefault()}
                                            max={new Date().toISOString().split("T")[0]} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Amount <span className="text-danger">*</span></Label>
                                        <Input id="invoice_amount" name="invoice_amount" type="text"
                                            inputMode="decimal" placeholder="0.00"
                                            value={editableData.invoice_amount}
                                            onChange={handleInvoiceAmountChange} />
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
                                                    options={serviceCategoryOptions}
                                                    id="service_category"
                                                    form={dummyForm} placeholder="Select..."
                                                    value={editableData.service_category}
                                                    onChange={sel => handleEditableChange('service_category', sel)}
                                                />
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
                                                <Input type="text" value={editableData.vendor_name}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled after search" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Division</Label>
                                                <CustomDropdownInput
                                                    options={divisionOptions}
                                                    id="division" form={dummyForm} placeholder="Select..."
                                                    value={editableData.division}
                                                    onChange={sel => handleEditableChange('division', sel)}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Invoice Type</Label>
                                                <CustomDropdownInput
                                                    options={invoiceTypeOptions}
                                                    id="invoice_type"
                                                    form={dummyForm} placeholder="Select..."
                                                    value={editableData.invoice_type}
                                                    onChange={sel => handleEditableChange('invoice_type', sel)}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Payment Term</Label>
                                                <CustomDropdownInput
                                                    options={paymentTermOptions}
                                                    id="payment_term"
                                                    form={dummyForm} placeholder="Select..."
                                                    value={editableData.payment_term}
                                                    onChange={sel => handleEditableChange('payment_term', sel)}
                                                />
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
                                                <Input type="text" value={editableData.emp_name}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled after search" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Division</Label>
                                                <CustomDropdownInput
                                                    options={divisionOptions}
                                                    id="division" form={dummyForm} placeholder="Select..."
                                                    value={editableData.division}
                                                    onChange={sel => handleEditableChange('division', sel)}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Invoice Type</Label>
                                                <CustomDropdownInput
                                                    options={invoiceTypeOptions}
                                                    id="invoice_type"
                                                    form={dummyForm} placeholder="Select..."
                                                    value={editableData.invoice_type}
                                                    onChange={sel => handleEditableChange('invoice_type', sel)}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Payment Term</Label>
                                                <CustomDropdownInput
                                                    options={paymentTermOptions}
                                                    id="payment_term"
                                                    form={dummyForm} placeholder="Select..."
                                                    value={editableData.payment_term}
                                                    onChange={sel => handleEditableChange('payment_term', sel)}
                                                />
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
                                                    <Input type="text" value={editableData.gst_vendor_name}
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
                                            value={editableData.bank_ac_no}
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
                                            value={editableData.bank_ifsc_code}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Nature of Expenses <span className="text-danger">*</span></Label>
                                        <Input id="nature_of_expenses" name="nature_of_expenses" type="text"
                                            placeholder="Enter expense nature"
                                            value={editableData.nature_of_expenses}
                                            onChange={e => handleEditableChange('nature_of_expenses', e.target.value)} />
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
                                            value={editableData.house_bank_id}
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
                                            value={editableData.house_bank_ac_no}
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
                                            value={editableData.business_area}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <HrLine />

                            {/* ── SUPPORTING DOCUMENTS ─────────────────── */}
                            <SectionHeader icon="📎" title="Supporting Documents" />

                            <Row>
                                <Col md="6" sm="12">
                                    <AttachCard fieldId="Invoicecopy" label="Invoicecopy"
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
                                              'Tax Description','Text','Profit Center',
                                              'Profit Center Description','HSN/SAC',''].map(col => (
                                                <th key={col} style={{ padding: '8px 6px', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 600, color: '#495057', borderRight: '1px solid #e9ecef' }}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map(item => {
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
                                    <div style={{ fontSize: 12, color: '#6c757d' }}>Tax Amount</div>
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
                                        <Button color="primary" type="button" onClick={handleSubmit}>Resubmit</Button>
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

export default VendorInvoiceEdit;
