import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, Label, Input, InputGroup } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Clipboard, CreditCard, Paperclip, FileText, File, Eye, X, Clock, Check, XCircle, ArrowLeft,
    Plus, Trash2, RefreshCw, Info,
} from 'react-feather';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { ShowToast } from '@helpers/appHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import DateComponent from '../common/dateComponent';
import { CustomDropdownInput } from '../forms/custom-form';
import Uploader from '../Uploader';

// approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
// (waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on GFA
// Verification — this screen), 5 = GFA Verified (Completed), 10 = Rejected
const APPROVAL_STATUS = { GFA_STAGE: 4, VERIFIED: 5, REJECTED: 10 };

const PAYMENT_TO_LABELS = { 1: 'Vendor', 2: 'Employee' };
const GST_LABELS = { 1: 'YES', 2: 'NO' };

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// SAP displays negative amounts with a trailing minus (e.g. "9,146.00-")
// instead of a leading one — matches the SAP GUI simulation screen.
const formatSapAmount = (n) => {
    const num = Number(n) || 0;
    const abs = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num < 0 ? `${abs}-` : abs;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const formatDateTime = (dt) => {
    if (!dt) return null;
    const d = new Date(dt.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return dt;
    return `${formatDate(dt)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fileTypeLabel = (url) => {
    if (!url) return '';
    const ext = url.split('.').pop().split('?')[0];
    return ext ? ext.toUpperCase() : '';
};

// ─── Backend returns a flat array (one row per line item, header fields
// repeated on every row) instead of a { ...header, line_items: [] } object.
const transformPaymentRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];

    return {
        payment_id: first.payment_id,
        approval_status: Number(first.approval_status),

        request_no: first.unique_payment_no,
        request_date: first.created_at ? first.created_at.split(' ')[0] : null,
        requested_by: first.requested_by,
        created_by: first.created_by,
        payment_to: PAYMENT_TO_LABELS[first.payment_to] || first.payment_to,
        gst_registered: GST_LABELS[first.gst_registered] || first.gst_registered,
        gst_vendor_code: first.gst_vendor_code,
        gst_vendor_name: first.gst_vendor_name,
        department: first.department,

        invoice_no: first.invoice_number,
        invoice_date: first.invoice_date,
        total_amount: first.total_amount,

        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        division: first.division,
        invoice_type: first.invoice_type_name || first.invoice_type,
        migo_number: first.migo_number,
        service_category: first.service_category_name || first.service_category,

        payment_term: first.payment_term_name || first.payment_term,
        payment_term_id: first.payment_term,
        emp_vendor_code: first.emp_code,
        emp_name: first.emp_name,
        bank_ac_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        business_area: first.business_area,
        nature_of_expenses: first.nature_of_expenses,
        cost_center: [...new Set(rows.filter((r) => r.line_id !== null && r.line_id !== undefined).map((r) => r.cost_center).filter(Boolean))].join(', '),
        accounts_approver_name: [...new Set(rows.filter((r) => r.line_id !== null && r.line_id !== undefined).map((r) => r.accounts_approver_name).filter(Boolean))].join(', '),
        tds_code: first.tds_code,
        tds_description: first.tds_description,

        invoice_copy_url: first.invoice_copy,
        back_paper_url: first.back_paper,

        created_at: first.created_at,
        mg_approved_at: first.mg_approved_at,
        mg_approved_by_name: first.mg_approved_by_name,
        stores_approved_at: first.stores_approved_at,
        stores_approved_by_name: first.stores_approved_by_name,
        accounts_verified_at: first.accounts_verified_at,
        accounts_verified_by_name: first.accounts_verified_by_name,
        gfa_posted_at: first.gfa_posted_at,
        gfa_posted_by_name: first.gfa_posted_by_name,
        rejected_at: first.rejected_at,
        rejected_by_name: first.rejected_by_name,
        rejection_remarks: first.rejection_remarks,

        line_items: rows.filter((r) => r.line_id !== null && r.line_id !== undefined).map((r, i) => ({
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
            base_amount: r.base_amount ?? '',
            cgst_amount: r.cgst_amount ?? '',
            sgst_amount: r.sgst_amount ?? '',
            igst_amount: r.igst_amount ?? '',
            text: r.item_text || '',
            profit_center: r.profit_center || '',
            profit_center_desc: r.profit_center_description || '',
            hsn_sac: r.hsn_sac || '',
        })),
    };
};

const fieldLabelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
    textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4,
};

const Field = ({ label, value, bold }) => {
    if (!value) return null;
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={fieldLabelStyle}>
                {label}
            </div>
            <div style={{ fontSize: 14, color: '#2b3245', fontWeight: bold ? 700 : 500 }}>
                {value}
            </div>
        </div>
    );
};

const Card = ({ icon, title, extra, children }) => (
    <div style={{
        background: '#fff', border: '1px solid #e9ecef', borderRadius: 10,
        padding: '18px 20px', marginBottom: 20, height: '100%',
    }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
                {React.cloneElement(icon, { size: 16, color: '#22315a', style: { marginRight: 8 } })}
                <h6 className="mb-0" style={{ color: '#22315a', fontWeight: 700 }}>{title}</h6>
            </div>
            {extra}
        </div>
        <hr style={{ margin: '10px 0 16px' }} />
        {children}
    </div>
);

function GFAVerificationView() {
    const { Id } = useParams();
    const id = Id ? Id.replace(':', '') : '';
    const history = useHistory();
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [record, setRecord]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectRemarks, setRejectRemarks]     = useState('');

    const [tdsCode, setTdsCode]               = useState('');
    const [tdsDescription, setTdsDescription] = useState('');
    const [tdsOptions, setTdsOptions]         = useState([]);
    const [postingDate, setPostingDate]       = useState(() => new Date().toISOString().slice(0, 10));
    const dateRestriction = DateComponent('fiPayment');

    // ─── GFA-editable fields (everything except vendor/employee identity) ────
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate]     = useState('');
    const [paymentTerm, setPaymentTerm]     = useState(null);
    const [paymentTermOptions, setPaymentTermOptions]     = useState([]);
    const [expensesTypeOptions, setExpensesTypeOptions]   = useState([]);
    const [costCentreOptions, setCostCentreOptions]       = useState([]);
    const [taxOptions, setTaxOptions]                     = useState([]);

    const blankLineItem = () => ({
        id: Date.now() + Math.random(), line_id: null,
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', base_amount: '', cgst_amount: '',
        sgst_amount: '', igst_amount: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([]);

    const [existingFiles, setExistingFiles] = useState({ Invoicecopy: '', Attachment: '' });
    const [attachedFiles, setAttachedFiles]   = useState({});

    // ─── SAP posting simulation popup (Simulate button) ──────────────────────
    const [simulateModalOpen, setSimulateModalOpen] = useState(false);
    const [simulateRows, setSimulateRows]           = useState([]);
    const [simulating, setSimulating]               = useState(false);

    // CustomDropdownInput only needs a form-shaped object to read touched/errors
    // from — Payment Term is driven directly off local state (value + onChange
    // passed explicitly below), so this stays an inert placeholder.
    const dummyForm = { values: {}, errors: {}, touched: {}, setFieldValue: () => {}, setFieldTouched: () => {} };

    const showErrorDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message || 'Something went wrong'}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: '#f50e0a',
        });
    };

    // ─── Info dialog helper — same buttonless confirmDialog as errors, grey ──
    const showInfoDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: '#6c757d',
        });
    };

    const showSuccessDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message || 'Success'}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: '#28a745',
        });
    };

    const fetchRecord = useCallback(async () => {
        if (!id) { setError('No request id provided'); setLoading(false); return; }
        try {
            setLoading(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetFIPaymentById`, { id });
            if (res?.data?.success && res.data.results?.length) {
                const transformed = transformPaymentRows(res.data.results);
                setRecord(transformed);
                setTdsCode(transformed?.tds_code || '');
                setTdsDescription(transformed?.tds_description || '');
                setError('');
            } else {
                setError(res?.data?.message || 'Unable to load payment request');
            }
        } catch (e) {
            console.error(e);
            setError('Failed to fetch payment request from server');
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [id]); // eslint-disable-line

    useEffect(() => { fetchRecord(); }, [fetchRecord]);

    useEffect(() => {
        // Employee + GST Registered = YES routes payment through the GST
        // vendor instead of the employee/vendor code — TDS must be looked up
        // against that GST vendor code in that case.
        const vendorOrEmpCode = (record?.gst_registered === 'YES' && record?.gst_vendor_code)
            ? record.gst_vendor_code
            : (record?.vendor_code || record?.emp_vendor_code);
        if (!vendorOrEmpCode) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTdsFromVendor`, { vendor_code: vendorOrEmpCode })
            .then((res) => setTdsOptions(res?.data?.results || []))
            .catch((e) => console.error(e));
    }, [record]); // eslint-disable-line

    // ─── Dropdown option lists for the GFA-editable fields ───────────────────
    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetPaymentTerms`, {})
            .then((res) => setPaymentTermOptions(res?.data?.results || []));
    }, []);

    // Expense Type / Cost Centre options are scoped to the request's original
    // submitter (created_by), not the logged-in GFA verifier — the verifier is
    // editing someone else's line items, so the dropdowns must reflect the
    // submitter's own mappings.
    useEffect(() => {
        if (!record?.created_by) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetExpenseTypesByUser`, { userid: record.created_by })
            .then((res) => setExpensesTypeOptions(res?.data?.results || []));
    }, [record?.created_by]);

    useEffect(() => {
        if (!record?.created_by) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetCostCentresByUser`, { userid: record.created_by })
            .then((res) => setCostCentreOptions(res?.data?.results || []));
    }, [record?.created_by]);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTaxCodesFromSap`, {})
            .then((res) => setTaxOptions(res?.data?.results || []));
    }, []);

    // ─── Hydrate the GFA-editable fields once the record has loaded ─────────
    useEffect(() => {
        if (!record) return;
        setInvoiceNumber(record.invoice_no || '');
        setInvoiceDate(record.invoice_date || '');
        setLineItems(record.line_items && record.line_items.length ? record.line_items : [blankLineItem()]);
        setExistingFiles({ Invoicecopy: record.invoice_copy_url || '', Attachment: record.back_paper_url || '' });
    }, [record]); // eslint-disable-line

    useEffect(() => {
        if (!record || !paymentTermOptions.length || !record.payment_term_id) return;
        const match = paymentTermOptions.find((o) => String(o.value) === String(record.payment_term_id));
        if (match) setPaymentTerm(match);
    }, [record, paymentTermOptions]);

    // SAP's budget master for these two divisions is keyed by Division itself
    // rather than by Cost Centre — GetBudgetFromSap's cost_ctr param must
    // carry the Division code instead of the line's actual Cost Centre code
    // whenever the invoice's Division is one of these.
    const DIVISION_AS_COST_CTR = ['NLSD', 'NLCD'];

    // ─── Line item helpers (mirrors VendorInvoiceEdit.js) ────────────────────
    const fetchBudgetForLineItem = async (lineId, glCode, costCentre) => {
        if (!glCode || !costCentre) return;
        try {
            const divisionCode = (record?.division || '').toUpperCase();
            const costCtrParam = DIVISION_AS_COST_CTR.includes(divisionCode) ? record.division : costCentre;
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/GetBudgetFromSap`, {
                gl_code: glCode, cost_ctr: costCtrParam,
            });
            // SAP STATUS 2 means no budget master exists for this GL Code /
            // Cost Centre combination — leave the line item's budget unset
            // rather than storing SAP's placeholder 0, so isOverBudget treats
            // it the same as "budget not yet known" (no violation shown).
            if (String(res?.data?.results?.status) === '2') return;
            const raw = res?.data?.results?.budget;
            const budget = raw !== undefined && raw !== null ? parseFloat(String(raw).trim()) : NaN;
            const rawReserved = res?.data?.results?.reserved;
            const reserved = rawReserved !== undefined && rawReserved !== null ? parseFloat(String(rawReserved).trim()) : NaN;
            if (!Number.isNaN(budget)) {
                setLineItems((p) => p.map((i) => (i.id === lineId
                    ? { ...i, budget, reserved: Number.isNaN(reserved) ? 0 : reserved }
                    : i)));
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

    const handleExpensesTypeChange = (lineId, expenseTypeId) => {
        const selected = expensesTypeOptions.find((opt) => String(opt.value) === String(expenseTypeId));
        const glCode = selected ? selected.gl_code : '';
        let nextItem = null;
        setLineItems((p) => p.map((i) => {
            if (i.id !== lineId) return i;
            nextItem = { ...i, expenses_type: expenseTypeId, gl_code: glCode, gl_description: selected ? selected.gl_description : '' };
            return nextItem;
        }));
        if (nextItem?.gl_code && nextItem?.cost_center) {
            fetchBudgetForLineItem(lineId, nextItem.gl_code, nextItem.cost_center);
        }
    };

    // A single mapping row can carry several comma-separated Cost Centre
    // codes (GetCostCentresByUser explodes each into its own option), so
    // multiple options can share the same mapping id — matching on id alone
    // would always resolve to whichever code was exploded first, not
    // whichever option the user actually picked. The option's array index is
    // the only thing guaranteed unique per <option>, so the select is keyed
    // on that; cost_center_desc still stores the option's real mapping id.
    const handleCostCentreChange = (lineId, optionIdx) => {
        const selected = costCentreOptions[Number(optionIdx)];
        const costCenterCode = selected ? selected.cost_centre_code : '';
        let nextItem = null;
        setLineItems((p) => p.map((i) => {
            if (i.id !== lineId) return i;
            nextItem = {
                ...i, cost_center_desc: selected ? selected.value : '', cost_center: costCenterCode,
                profit_center: selected ? selected.profit_centre : '',
                profit_center_desc: selected ? selected.profit_centre_desc : '',
            };
            return nextItem;
        }));
        if (nextItem?.cost_center && nextItem?.gl_code) {
            fetchBudgetForLineItem(lineId, nextItem.gl_code, nextItem.cost_center);
        }
    };

    const handleTaxTypeChange = (lineId, taxCode) => {
        const selected = taxOptions.find((opt) => String(opt.value) === String(taxCode));
        setLineItems((p) => p.map((i) => (i.id === lineId ? {
            ...i, tax_type: taxCode, tax_code: selected ? selected.tax_code : '', tax_description: selected ? selected.description : '',
        } : i)));
    };

    const addLineItem    = () => setLineItems((p) => [...p, blankLineItem()]);
    const removeLineItem = (lineId) => setLineItems((p) => p.filter((i) => i.id !== lineId));
    const updateLineItem = (lineId, field, value) =>
        setLineItems((p) => p.map((i) => (i.id === lineId ? { ...i, [field]: value } : i)));

    // Tax code descriptions from SAP are the only place a rate is exposed —
    // GetTaxCodesFromSap only forwards TAX_CODE/TAX_DESC, no separate rate
    // field — so CGST/SGST/IGST rates are parsed out of that free text.
    // SAP writes this two different ways: rate-follows-its-own-keyword
    // ("CGST 9% + SGST 9%") and keywords-grouped-then-rates-grouped
    // ("SGST,CGST @ 9%+9%") — pairing keywords and rates up positionally, in
    // the order each is written, handles both shapes (a per-keyword proximity
    // match breaks on the second shape, since both keywords sit together
    // before either rate). A lone "18%" with no CGST/SGST/IGST keyword is
    // treated as an intra-state rate and split evenly. Same logic as
    // VendorInvoiceSubmit.js, so GFA re-verification recalculates live off
    // whatever Amount / Tax Code the verifier edits here, instead of just
    // echoing back whatever was saved at submission time.
    const parseTaxRates = (description) => {
        const text = (description || '').toUpperCase();
        const keywords = text.match(/CGST|SGST|IGST/g) || [];
        const rates = (text.match(/\d+(?:\.\d+)?\s*%/g) || []).map((r) => parseFloat(r));

        const rateFor = {};
        if (keywords.length && rates.length === 1) {
            keywords.forEach((kw) => { rateFor[kw] = rates[0]; });
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
            .filter((i) => i.gl_code === item.gl_code && i.cost_center === item.cost_center)
            .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        return groupTotal > (parseFloat(item.budget) || 0);
    };

    const handleFileChange = (file, fieldId) =>
        setAttachedFiles((prev) => ({ ...prev, [fieldId]: file }));

    const updateApprovalStatus = async (status, remarks, extra) => {
        try {
            setSubmitting(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/UpdateApprovalStatus`, {
                id, status, remarks: remarks || null, userid: UserDetails.USERID, ...extra,
            });
            if (res?.data?.success) {
                ShowToast(res.data.message || 'Updated successfully.');
                history.push('/INVOICERECEIPTGFALIST');
            } else {
                showErrorDialog(res?.data?.message || 'Unable to update payment status');
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to update payment status');
        } finally {
            setSubmitting(false);
            hideLoader();
        }
    };

    const verifyAndPostToSap = async () => {
        try {
            setSubmitting(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/VerifyAndPostToSap`, {
                id, userid: UserDetails.USERID,
                tds_code: tdsCode, tds_description: tdsDescription,
                posting_date: postingDate,
            });
            if (res?.data?.success) {
                const docNo = res.data.document_no;
                const message = docNo
                    ? `${res.data.message || 'Verified and posted to SAP successfully.'} Document No: ${docNo}`
                    : (res.data.message || 'Verified and posted to SAP successfully.');
                showSuccessDialog(message);
                history.push('/INVOICERECEIPTGFALIST');
            } else {
                showErrorDialog(res?.data?.message || 'Unable to post payment to SAP');
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to post payment to SAP');
        } finally {
            setSubmitting(false);
            hideLoader();
        }
    };

    const handleTdsCodeChange = (e) => {
        const val = e.target.value;
        const selected = tdsOptions.find((opt) => opt.value === val);
        setTdsCode(selected ? selected.tds_code : '');
        setTdsDescription(selected ? selected.description : '');
    };

    // TDS_CODE alone can repeat across TDS_TYPEs (e.g. 'Z1'), so the <select>
    // option value is a composite key — recover it here from the plain
    // code/description pair stored on the record for the initial selection.
    const selectedTdsValue = tdsOptions.find(
        (opt) => opt.tds_code === tdsCode && opt.description === tdsDescription
    )?.value || '';

    // Saves the current line item / header edits, then asks SAP to simulate
    // the posting (ZZFI_SIMULATE) and opens a preview popup instead of
    // posting immediately — the popup's Post button performs the actual
    // SAP post (verifyAndPostToSap), Cancel just dismisses the preview.
    const handleSimulate = async () => {
        if (!postingDate) {
            showErrorDialog('Posting Date is required before approving');
            return;
        }
        if (!invoiceNumber.trim()) {
            showErrorDialog('Invoice Number is required before approving');
            return;
        }
        if (!invoiceDate) {
            showErrorDialog('Invoice Date is required before approving');
            return;
        }
        if (lineItems.some((item) => isOverBudget(item))) {
            showErrorDialog('One or more line items exceed the available budget for their GL Code / Cost Centre.');
            return;
        }

        try {
            setSimulating(true);
            showLoader();

            let invoiceCopyFileName = existingFiles.Invoicecopy || '';
            let attachmentFileName  = existingFiles.Attachment || '';
            const keys = Object.keys(attachedFiles || {}).filter((k) => attachedFiles[k]);
            if (keys.length > 0) {
                const fd = new FormData();
                fd.append('form_name', 'fipayment'); fd.append('ponumber', 'Invoicecopy');
                fd.append('SubFolder', 'FI_Payment');
                keys.forEach((k) => fd.append('file[]', attachedFiles[k]));
                const uploadResp = await apiPostMethod(sapFileShare, fd, 'File');
                if (!uploadResp?.data?.success) {
                    showErrorDialog('File upload failed.');
                    return;
                }
                (uploadResp.data.files || []).forEach((f, i) => {
                    if (keys[i] === 'Invoicecopy') invoiceCopyFileName = f.updname || '';
                    if (keys[i] === 'Attachment')   attachmentFileName  = f.updname || '';
                });
            }

            const updateRes = await apiPostMethod(`${apiBaseUrl}FIPaymentController/UpdateGFADetails`, {
                payment_id: id,
                userid: UserDetails.USERID,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate,
                payment_term: paymentTerm?.value || null,
                Invoicecopy: invoiceCopyFileName,
                Attachment: attachmentFileName,
                line_items: lineItems.map((item) => {
                    const { id: lineItemId, ...rest } = item;
                    const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                    return { ...rest, base_amount: baseAmt, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt };
                }),
            });
            if (!updateRes?.data?.success) {
                showErrorDialog(updateRes?.data?.message || 'Unable to save payment details.');
                return;
            }
            setExistingFiles({ Invoicecopy: invoiceCopyFileName, Attachment: attachmentFileName });
            setAttachedFiles({});

            const simRes = await apiPostMethod(`${apiBaseUrl}FIPaymentController/SimulatePosting`, {
                id, tds_code: tdsCode, tds_description: tdsDescription, posting_date: postingDate,
            });
            if (!simRes?.data?.success) {
                showErrorDialog(simRes?.data?.message || 'Unable to simulate SAP posting.');
                return;
            }
            setSimulateRows(Array.isArray(simRes.data.results) ? simRes.data.results : []);
            setSimulateModalOpen(true);
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to simulate SAP posting.');
        } finally {
            setSimulating(false);
            hideLoader();
        }
    };

    const closeSimulateModal = () => setSimulateModalOpen(false);

    const handlePostFromSimulate = () => {
        setSimulateModalOpen(false);
        verifyAndPostToSap();
    };

    const openRejectModal  = () => setRejectModalOpen(true);
    const closeRejectModal = () => { setRejectModalOpen(false); setRejectRemarks(''); };

    const handleRejectSubmit = () => {
        if (!rejectRemarks.trim()) {
            showErrorDialog('Rejection remarks are required');
            return;
        }
        closeRejectModal();
        updateApprovalStatus(APPROVAL_STATUS.REJECTED, rejectRemarks.trim());
    };

    if (loading) {
        return <div style={{ padding: 48, textAlign: 'center', color: '#6c757d' }}>Loading payment request…</div>;
    }

    if (error && !record) {
        return (
            <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>
                <Button color="primary" size="sm" onClick={fetchRecord} className="mr-1">Retry</Button>
                <Button color="light" size="sm" onClick={() => history.goBack()}
                    style={{ border: '1px solid #dee2e6' }}>
                    <ArrowLeft size={14} style={{ marginRight: 4 }} /> Back
                </Button>
            </div>
        );
    }

    const d = record || {};
    const isEmployeeMode = !!d.emp_vendor_code || !!d.emp_name;
    const isGstYes = d.gst_registered === 'YES';
    const isActionable = d.approval_status === APPROVAL_STATUS.GFA_STAGE;

    const historyStages = [
        { label: 'Submitted', at: d.created_at },
        { label: 'Manager Approved', at: d.mg_approved_at, by: d.mg_approved_by_name },
        { label: 'Store Acknowledged', at: d.stores_approved_at, by: d.stores_approved_by_name },
        { label: 'Accounts Verified', at: d.accounts_verified_at, by: d.accounts_verified_by_name },
        { label: 'GFA Verified', at: d.gfa_posted_at, by: d.gfa_posted_by_name },
        { label: 'Rejected', at: d.rejected_at, by: d.rejected_by_name },
    ].filter((s) => s.label !== 'Rejected' || d.rejected_at);

    return (
        <div>
            {/* ── PAGE HEADER ──────────────────────────────────────────── */}
            <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-start">
                    <Button color="light" onClick={() => history.goBack()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #dee2e6', marginRight: 16 }}>
                        <ArrowLeft size={15} /> Back
                    </Button>
                    <div>
                        <h2 style={{ color: '#22315a', fontWeight: 800, marginBottom: 4 }}>GFA - Verification</h2>
                        <p style={{ color: '#6c757d', marginBottom: 0 }}>
                            Verify and approve global financial authorizations for pending invoice requests.
                        </p>
                    </div>
                </div>
                <Button color="light" onClick={() => setHistoryOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #dee2e6' }}>
                    <Clock size={15} /> History
                </Button>
            </div>

            {/* ── REQUEST DETAILS ─────────────────────────────────────── */}
            <Card icon={<Clipboard />} title="Request Details">
                <Row>
                    <Col md="2" sm="6" xs="6"><Field label="Request No" value={d.request_no} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Request Date" value={formatDate(d.request_date)} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Request By" value={d.requested_by} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Payment To" value={d.payment_to} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="GST" value={d.gst_registered} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Dept" value={d.department} /></Col>
                </Row>
                <Row>
                    <Col md="2" sm="6" xs="6">
                        <FormGroup className="mb-0">
                            <Label style={fieldLabelStyle}>
                                Invoice No {isActionable && <span className="text-danger">*</span>}
                            </Label>
                            <Input
                                type="text" bsSize="sm" value={invoiceNumber} disabled={!isActionable}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                    <Col md="2" sm="6" xs="6">
                        <FormGroup className="mb-0">
                            <Label style={fieldLabelStyle}>
                                Invoice Date {isActionable && <span className="text-danger">*</span>}
                            </Label>
                            <Input
                                type="date" bsSize="sm" value={invoiceDate} disabled={!isActionable}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                onKeyDown={e => e.preventDefault()}
                            />
                        </FormGroup>
                    </Col>
                    <Col md="2" sm="6" xs="6"><Field label="Invoice Amount" value={currency(d.total_amount)} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Vendor Code" value={d.vendor_code} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Vendor Name" value={d.vendor_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Division" value={d.division} /></Col>
                </Row>
                <Row>
                    <Col md="2" sm="6" xs="6"><Field label="Invoice Type" value={d.invoice_type} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="MIGO Number" value={d.migo_number} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Service Category" value={d.service_category} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Cost Centre" value={d.cost_center} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Accounts Approver" value={d.accounts_approver_name} /></Col>
                </Row>
                <Row>
                    <Col md="2" sm="6" xs="6"><Field label="Manager Approved By" value={d.mg_approved_by_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Store Acknowledged By" value={d.stores_approved_by_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Accounts Verified By" value={d.accounts_verified_by_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="GFA Posted By" value={d.gfa_posted_by_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Rejected By" value={d.rejected_by_name} /></Col>
                </Row>
            </Card>

            {/* ── PAYMENT & COMPLIANCE + DOCUMENTS ────────────────────── */}
            <Row>
                <Col md="7" sm="12">
                    <Card icon={<CreditCard />} title="Payment & Compliance Info">
                        <Row>
                            <Col md="3" sm="6" xs="6">
                                <Label style={{ ...fieldLabelStyle, display: 'block' }}>Payment Term</Label>
                                <CustomDropdownInput
                                    options={paymentTermOptions} form={dummyForm} id="payment_term"
                                    placeholder="Select..." value={paymentTerm} isDisabled={!isActionable}
                                    onChange={(sel) => setPaymentTerm(sel)}
                                />
                            </Col>
                            <Col md="3" sm="6" xs="6"><Field label="Employee Vendor Code" value={isEmployeeMode ? d.emp_vendor_code : null} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Employee Name" value={isEmployeeMode ? d.emp_name : null} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Vendor Bank A/C" value={d.bank_ac_no} /></Col>
                        </Row>
                        {isGstYes && (
                            <Row>
                                <Col md="3" sm="6" xs="6"><Field label="GST Vendor Code" value={d.gst_vendor_code} /></Col>
                                <Col md="3" sm="6" xs="6"><Field label="GST Vendor Name" value={d.gst_vendor_name} /></Col>
                            </Row>
                        )}
                        <Row>
                            <Col md="3" sm="6" xs="6"><Field label="Vendor Bank IFSC" value={d.bank_ifsc_code} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Nature of Expenses" value={d.nature_of_expenses} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="House Bank Id" value={d.house_bank_id} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="House Bank AC No" value={d.house_bank_ac_no} /></Col>
                        </Row>
                        <Row>
                            <Col md="3" sm="6" xs="6">
                                <FormGroup className="mb-0">
                                    <Label style={{
                                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                                        textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4,
                                    }}>
                                        TDS Code {isActionable && <span className="text-danger">*</span>}
                                    </Label>
                                    <Input
                                        type="select" bsSize="sm"
                                        value={selectedTdsValue} disabled={!isActionable}
                                        onChange={handleTdsCodeChange}
                                    >
                                        <option value="">Select...</option>
                                        {tdsOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="6" xs="6"><Field label="TDS Description" value={tdsDescription} /></Col>
                            <Col md="3" sm="6" xs="6">
                                <FormGroup className="mb-0">
                                    <Label style={{
                                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                                        textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4,
                                    }}>
                                        Posting Date {isActionable && <span className="text-danger">*</span>}
                                    </Label>
                                    <Input
                                        type="date" bsSize="sm"
                                        value={postingDate} disabled={!isActionable}
                                         onKeyDown={e => e.preventDefault()}
                                        min={dateRestriction.min_date} max={dateRestriction.max_date}
                                        onChange={(e) => setPostingDate(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="6" xs="6"><Field label="Business Area" value={d.business_area} /></Col>
                        </Row>
                    </Card>
                </Col>

                <Col md="5" sm="12">
                    <Card icon={<Paperclip />} title="Documents">
                        {[
                            { url: d.invoice_copy_url, label: 'Invoice Copy', icon: <FileText />, fieldId: 'Invoicecopy' },
                            { url: d.back_paper_url, label: 'Back Paper', icon: <File />, fieldId: 'Attachment' },
                        ].map((doc) => {
                            const newFile = attachedFiles[doc.fieldId];
                            return (
                                <div key={doc.label} style={{
                                    padding: '10px 12px', background: '#f8f9fa', borderRadius: 8, marginBottom: 10,
                                }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            {React.cloneElement(doc.icon, { size: 18, color: '#22315a', style: { marginRight: 10 } })}
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#2b3245' }}>{doc.label}</div>
                                                <div style={{ fontSize: 11, color: '#8a94a6' }}>
                                                    {newFile ? `New: ${newFile.name}` : (fileTypeLabel(doc.url) || 'Not attached')}
                                                </div>
                                            </div>
                                        </div>
                                        <Button color="primary" size="sm" disabled={!doc.url}
                                            onClick={() => window.open(doc.url, '_blank')}>
                                            <Eye size={12} style={{ marginRight: 4 }} /> View
                                        </Button>
                                    </div>
                                    {isActionable && (
                                        <div className="mt-2">
                                            <Uploader setAttachment={handleFileChange}
                                                label="Replace" title={doc.url ? 'Replace File' : 'Attach File'} id={doc.fieldId} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Card>
                </Col>
            </Row>

            {/* ── LINE ITEMS RECONCILIATION ───────────────────────────── */}
            <Card
                icon={<Clipboard />}
                title="Line Items Reconciliation"
                extra={(
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: '#2f6fed', background: '#e4eefe',
                            padding: '3px 10px', borderRadius: 12,
                        }}>
                            {lineItems.length} ITEMS LOADED
                        </span>
                        {isActionable && (
                            <Button color="outline-primary" size="sm" onClick={addLineItem}
                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Plus size={14} /> Add Line Item
                            </Button>
                        )}
                    </div>
                )}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                                {[
                                    'Expenses Type', 'GL Code', 'GL Description', 'Budget', 'Amount',
                                    'Cost Center Description', 'Cost Center', 'Tax Type', 'Tax Code', 'Tax Code Desc',
                                    'Base Amt', 'CGST', 'SGST', 'IGST',
                                    'Text', 'Profit Center', 'Profit Center Desc', 'HSN/SAC',
                                    ...(isActionable ? [''] : []),
                                ].map((col) => (
                                    <th key={col} style={{
                                        padding: '8px 6px', textAlign: 'left',
                                        whiteSpace: 'nowrap', fontWeight: 700, color: '#8a94a6', fontSize: 11,
                                        textTransform: 'uppercase', letterSpacing: '0.03em', borderRight: '1px solid #e9ecef',
                                    }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item) => {
                                const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                                return (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f2f4' }}>
                                    <td style={{ padding: '4px', minWidth: 140 }}>
                                        <Input type="select" bsSize="sm" value={item.expenses_type} disabled={!isActionable}
                                            onChange={(e) => handleExpensesTypeChange(item.id, e.target.value)}>
                                            <option value="">Select...</option>
                                            {expensesTypeOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Input>
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.gl_code} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 120 }}>
                                        <Input type="text" bsSize="sm" value={item.gl_description} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 150 }}>
                                        <InputGroup size="sm">
                                            <Input type="number" bsSize="sm" value={item.budget} disabled style={{ background: '#f0f0f0' }}  />
                                            <Button color="outline-secondary" size="sm"
                                                title="Re-fetch budget from SAP"
                                                disabled={!isActionable || !item.gl_code || !item.cost_center || syncingBudgetId === item.id}
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
                                            value={item.amount} invalid={isOverBudget(item)} disabled={!isActionable}
                                            onChange={(e) => updateLineItem(item.id, 'amount', e.target.value)} />
                                        {isOverBudget(item) && (
                                            <small className="text-danger" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                                                Exceeds budget
                                            </small>
                                        )}
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 170 }}>
                                        <Input type="select" bsSize="sm"
                                            value={costCentreOptions.findIndex((opt) => String(opt.value) === String(item.cost_center_desc) && opt.cost_centre_code === item.cost_center)}
                                            disabled={!isActionable}
                                            onChange={(e) => handleCostCentreChange(item.id, e.target.value)}>
                                            <option value="-1">Select...</option>
                                            {costCentreOptions.map((opt, idx) => (
                                                <option key={idx} value={idx}>{opt.label}</option>
                                            ))}
                                        </Input>
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.cost_center} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 140 }}>
                                        <Input type="select" bsSize="sm" value={item.tax_type} disabled={!isActionable}
                                            onChange={(e) => handleTaxTypeChange(item.id, e.target.value)}>
                                            <option value="">Select...</option>
                                            {taxOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Input>
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 70 }}>
                                        <Input type="text" bsSize="sm" value={item.tax_code} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 120 }}>
                                        <Input type="text" bsSize="sm" value={item.tax_description} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="number" bsSize="sm" value={baseAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={cgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={sgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={igstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.text} disabled={!isActionable}
                                            onChange={(e) => updateLineItem(item.id, 'text', e.target.value)} />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.profit_center} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 130 }}>
                                        <Input type="text" bsSize="sm" value={item.profit_center_desc} disabled style={{ background: '#f0f0f0' }}  />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.hsn_sac} disabled={!isActionable}
                                            onChange={(e) => updateLineItem(item.id, 'hsn_sac', e.target.value)} />
                                    </td>
                                    {isActionable && (
                                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                                            <Button color="danger" size="sm" style={{ padding: '2px 6px' }}
                                                onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}>
                                                <Trash2 size={13} />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#22315a' }}>
                                    Total Amount
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#2f6fed', fontSize: 15 }}>
                                    {currency(lineItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}
                                </td>
                                <td colSpan={(isActionable ? 10 : 9) + 4} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* ── APPROVE / REJECT ACTIONS ────────────────────────────── */}
            {isActionable && (
                <div className="d-flex justify-content-end" style={{ gap: 8, marginTop: 8 }}>
                    <Button color="danger" disabled={submitting || simulating} onClick={openRejectModal}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <XCircle size={16} /> Reject
                    </Button>
                    <Button color="primary" disabled={submitting || simulating} onClick={handleSimulate}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={16} /> Simulate
                    </Button>
                </div>
            )}

            {/* ── REJECT REMARKS MODAL ────────────────────────────────── */}
            <Modal show={rejectModalOpen} onHide={closeRejectModal} centered>
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        Reject Payment
                    </Modal.Title>
                    <button type="button" className="close" onClick={closeRejectModal}>
                        <X size={18} />
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <FormGroup>
                        <Label>Rejection Remarks <span className="text-danger">*</span></Label>
                        <Input
                            type="textarea" rows="4"
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            placeholder="Enter the reason for rejection"
                        />
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8f9fa' }}>
                    <Button color="secondary" size="sm" onClick={closeRejectModal}>Cancel</Button>
                    <Button color="danger" size="sm" disabled={submitting} onClick={handleRejectSubmit}>
                        Reject Payment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── SAP SIMULATION MODAL ─────────────────────────────────── */}
            <Modal show={simulateModalOpen} onHide={closeSimulateModal} centered size="lg">
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        SAP Posting Simulation
                    </Modal.Title>
                    <button type="button" className="close" onClick={closeSimulateModal}>
                        <X size={18} />
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="4" sm="6" xs="6"><Field label="Vendor Name" value={d.vendor_name} /></Col>
                        <Col md="4" sm="6" xs="6"><Field label="Posting Date" value={formatDate(postingDate)} /></Col>
                        <Col md="4" sm="6" xs="6"><Field label="Document Date" value={formatDate(invoiceDate)} /></Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="6" xs="6"><Field label="House Bank Id" value={d.house_bank_id} /></Col>
                        <Col md="4" sm="6" xs="6"><Field label="House Bank AC No" value={d.house_bank_ac_no} /></Col>
                        <Col md="4" sm="6" xs="6"><Field label="Business Area" value={d.business_area} /></Col>
                    </Row>
                    <hr style={{ margin: '4px 0 16px' }} />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#eef3fc' }}>
                                    {['Item', 'Account', 'Account Short Text', 'Amount'].map((col) => (
                                        <th key={col} style={{
                                            padding: '8px 10px', textAlign: col === 'Amount' ? 'right' : 'left',
                                            fontWeight: 700, color: '#22315a', fontSize: 11,
                                            textTransform: 'uppercase', letterSpacing: '0.03em',
                                            borderBottom: '1px solid #dbe4f3',
                                        }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {simulateRows.map((row, i) => (
                                    <tr key={i} style={{ background: i % 2 ? '#f5f8fd' : '#fff' }}>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #eef1f6' }}>{i + 1}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #eef1f6' }}>{row.VEN_GL}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #eef1f6' }}>{row.TEXT}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #eef1f6', textAlign: 'right' }}>
                                            {formatSapAmount(row.AMOUNT)}
                                        </td>
                                    </tr>
                                ))}
                                {!simulateRows.length && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#8a94a6' }}>
                                            No simulation data returned.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8f9fa', justifyContent: 'space-between' }}>
                    <Button color="secondary" size="sm" onClick={closeSimulateModal}>Cancel</Button>
                    <Button color="success" size="sm" disabled={submitting} onClick={handlePostFromSimulate}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={14} /> Post
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── HISTORY MODAL ────────────────────────────────────────── */}
            <Modal show={historyOpen} onHide={() => setHistoryOpen(false)} centered>
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        Approval History
                    </Modal.Title>
                    <button type="button" className="close" onClick={() => setHistoryOpen(false)}>
                        <X size={18} />
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {historyStages.map((s) => (
                        <div key={s.label} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 0', borderBottom: '1px solid #f1f2f4',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: s.at ? '#1e9e5a' : '#dee2e6',
                                }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: s.at ? '#2b3245' : '#adb5bd' }}>{s.label}</div>
                                    {s.at && s.by && (
                                        <div style={{ fontSize: 11, color: '#8a94a6' }}>by {s.by}</div>
                                    )}
                                </div>
                            </div>
                            <span style={{ fontSize: 12, color: '#8a94a6' }}>
                                {s.at ? formatDateTime(s.at) : 'Pending'}
                            </span>
                        </div>
                    ))}
                    {d.rejection_remarks && (
                        <div style={{ marginTop: 12, padding: 10, background: '#fbe6e6', borderRadius: 6, fontSize: 12, color: '#a33' }}>
                            <strong>Rejection Remarks:</strong> {d.rejection_remarks}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8f9fa' }}>
                    <Button color="secondary" size="sm" onClick={() => setHistoryOpen(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GFAVerificationView;
