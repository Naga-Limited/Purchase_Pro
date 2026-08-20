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
import { useSelector } from 'react-redux';
import { Search, Plus, Trash2, FileText, File, Eye, X, RefreshCw, Info } from 'react-feather';
import Uploader from '../Uploader';
import DateComponent from '../common/dateComponent';

// ─── Reusable search input with dropdown list (same pattern used across the
// FIPayment module — kept outside the component so React doesn't remount the
// <input> on every keystroke). ──────────────────────────────────────────────
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

// Backend returns a flat array (one row per line item, header fields repeated
// on every row) for GetFIRequestWithLines — collapse it the same way
// VendorInvoiceEdit.js does for GetFIPaymentById.
const transformRequestRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];
    const lineRows = rows.filter(r => r.line_id !== null && r.line_id !== undefined);

    return {
        payment_id: first.payment_id,
        sap_document_no: first.sap_document_no,
        sap_posting_date: first.sap_posting_date,
        invoice_date: first.invoice_date,
        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        payment_to: first.payment_to,
        gst_registered: first.gst_registered,
        emp_code: first.emp_code,
        emp_name: first.emp_name,
        gst_vendor_code: first.gst_vendor_code,
        gst_vendor_name: first.gst_vendor_name,
        division: first.division,
        invoice_type: first.invoice_type,
        bank_account_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        business_area: first.business_area,
        total_amount: first.total_amount,
        invoice_copy_url: first.invoice_copy,
        back_paper_url: first.back_paper,
        line_items: (lineRows.length ? lineRows : []).map((r, i) => ({
            id: Date.now() + i,
            expenses_type: r.expenses_type || '',
            gl_code: r.gl_code || '',
            gl_description: r.gl_description || '',
            budget: r.budget ?? '',
            amount: r.amount ?? '',
            deduction_amount: r.deduction_amount ?? '',
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

const validationSchema = Yup.object().shape({
    credit_memo_type: Yup.object().nullable().required("Credit Memo Type is required"),
    request_payment_id: Yup.mixed().when('credit_memo_type', {
        is: (v) => v?.value === 'related_fi',
        then: () => Yup.mixed().required("Request No is required"),
    }),
    vendor_code:  Yup.string().required("Vendor Code is required"),
    division:     Yup.object().nullable().required("Division is required"),
    reason:       Yup.string().required("Reason is required"),
    memo_no:      Yup.string().required("Memo No is required"),
    memo_date:    Yup.string().required("Memo Date is required"),
    amount:       Yup.number().typeError("Amount must be a number").min(0).required("Amount is required"),
});

const VALIDATION_LABELS = {
    credit_memo_type: "Credit Memo Type", request_payment_id: "Request No",
    vendor_code: "Vendor Code", division: "Division", reason: "Reason",
    memo_no: "Memo No", memo_date: "Memo Date", amount: "Amount",
};

function NonPoCreditMemoParking() {
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const { showLoader, hideLoader } = useLoader();
    const dateRestriction = DateComponent('fiPayment');

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
    // from — every field here is driven directly off `editableData`.
    const dummyForm = { values: {}, errors: {}, touched: {}, setFieldValue: () => {}, setFieldTouched: () => {} };

    // ─── Credit Memo Type toggle ────────────────────────────────────────────
    const creditMemoTypeOptions = [
        { value: 'related_fi', label: 'Related to FI' },
        { value: 'non_related_fi', label: 'Non Related to FI' },
    ];

    // ─── Division / Invoice Type options ────────────────────────────────────
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [invoiceTypeOptions, setInvoiceTypeOptions] = useState([]);

    // Division is the logged-in user's own emp_division (a single value from
    // GetDivisions) — auto-filled and shown read-only, not a user choice, same
    // as VendorInvoiceSubmit.js. Only applies to a fresh (Non Related to FI)
    // entry — selectRequest overrides it with the related request's own
    // Division for "Related to FI".
    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetDivisions/${UserDetails.USERID}`, {})
            .then(res => {
                const results = res?.data?.results || [];
                setDivisionOptions(results);
                const division = results[0] || null;
                if (division) handleEditableChange('division', division);
            });
    }, [UserDetails.USERID]); // eslint-disable-line

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetInvoiceTypes`, {})
            .then(res => setInvoiceTypeOptions(res?.data?.results || []));
    }, []);

    // ─── Expenses Type / Cost Centre / Tax Type options (line items) ────────
    const [expensesTypeOptions, setExpensesTypeOptions] = useState([]);
    const [costCentreOptions, setCostCentreOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetExpenseTypesByUser`, { userid: UserDetails.USERID })
            .then(res => setExpensesTypeOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    useEffect(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetCostCentresByUser`, { userid: UserDetails.USERID })
            .then(res => setCostCentreOptions(res?.data?.results || []));
    }, [UserDetails.USERID]);

    useEffect(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTaxCodesFromSap`, {})
            .then(res => setTaxOptions(res?.data?.results || []));
    }, []);

    // ─── Single editable-data object driving every header field ─────────────
    const [editableData, setEditableData] = useState({
        credit_memo_type: null, request_payment_id: null,
        fi_doc_no: '', fi_doc_date: '',
        invoice_type: null, vendor_code: '', vendor_name: '', division: null,
        reason: '',
        memo_no: '', memo_date: '', amount: '',
        bank_ac_no: '', bank_ifsc_code: '', house_bank_id: '', house_bank_ac_no: '',
        posting_date: '', business_area: '', total_amount: '',
    });

    const handleEditableChange = (field, value) =>
        setEditableData(prev => ({ ...(prev || {}), [field]: value }));

    const creditMemoTypeVal = editableData.credit_memo_type?.value;
    const isRelatedToFI    = creditMemoTypeVal === 'related_fi';
    const isNonRelatedToFI = creditMemoTypeVal === 'non_related_fi';

    // ─── Line items ───────────────────────────────────────────────────────────
    const blankLineItem = () => ({
        id: Date.now(),
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', deduction_amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([blankLineItem()]);

    // SAP's budget master for these two divisions is keyed by Division itself
    // rather than by Cost Centre — GetBudgetFromSap's cost_ctr param must
    // carry the Division code instead of the line's actual Cost Centre code
    // whenever the invoice's Division is one of these.
    const DIVISION_AS_COST_CTR = ['NLSD', 'NLCD'];

    // Looks up the live available budget for a line item once both its GL Code
    // and Cost Centre are known — same as VendorInvoiceSubmit.js. Used for both
    // flows: Non Related to FI lines get it as soon as the user picks Expense
    // Type / Cost Centre, and Related to FI lines get it re-fetched live (rather
    // than trusting the possibly-stale budget carried down from
    // GetFIRequestWithLines) once gl_code/cost_center arrive from that API.
    // divisionOverride lets selectRequest pass the just-resolved Division
    // straight through — editableData.division is set via setState in the same
    // tick there, so the closure below would otherwise still see the old value.
    const fetchBudgetForLineItem = async (id, glCode, costCentre, divisionOverride) => {
        if (!glCode || !costCentre) return;
        try {
            const divisionVal = divisionOverride !== undefined ? divisionOverride : editableData.division?.value;
            const costCtrParam = DIVISION_AS_COST_CTR.includes((divisionVal || '').toUpperCase()) ? divisionVal : costCentre;
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

    const [houseBankLocked, setHouseBankLocked] = useState(false);

    // A single mapping row can carry several comma-separated Cost Centre
    // codes (GetCostCentresByUser explodes each into its own option), so
    // multiple options can share the same mapping id — matching on id alone
    // would always resolve to whichever code was exploded first, not
    // whichever option the user actually picked. The option's array index is
    // the only thing guaranteed unique per <option>, so the select is keyed
    // on that; cost_center_desc still stores the option's real mapping id.
    const handleCostCentreChange = (id, optionIdx) => {
        const selected = costCentreOptions[Number(optionIdx)];
        let nextItem = null;
        setLineItems(p => p.map(i => {
            if (i.id !== id) return i;
            nextItem = {
                ...i,
                cost_center_desc: selected ? selected.value : '',
                cost_center: selected ? selected.cost_centre_code : '',
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

    const handleTaxTypeChange = (id, taxCode) => {
        const selected = taxOptions.find(opt => String(opt.value) === String(taxCode));
        setLineItems(p => p.map(i => i.id === id ? {
            ...i,
            tax_type: taxCode,
            tax_code: selected ? selected.tax_code : '',
            tax_description: selected ? selected.description : '',
        } : i));
    };

    const addLineItem    = () => setLineItems(p => [...p, blankLineItem()]);
    const removeLineItem = (id) => setLineItems(p => p.filter(i => i.id !== id));
    const updateLineItem  = (id, field, value) =>
        setLineItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

    // Related to FI lines are deducted at their own deduction_amount; Non
    // Related to FI lines never collect one, so fall back to the line's full
    // amount — mirrors CreditMemoModel::VerifyAndPostToSap's DEDUCTION_AMT logic.
    const totalDeductionAmount = lineItems.reduce((s, i) => {
        const ded = parseFloat(i.deduction_amount);
        return s + (ded || parseFloat(i.amount) || 0);
    }, 0);

    // A blank/unknown budget (no GL Code + Cost Centre picked yet) isn't a
    // violation — only flag rows where a real budget figure is on record.
    const isOverBudget = (item) =>
        item.budget !== '' && item.budget !== null && item.budget !== undefined &&
        (parseFloat(item.amount) || 0) > (parseFloat(item.budget) || 0);

    // HSN/SAC is mandatory per line item only for Material invoices — Service
    // invoices have no HSN/SAC to report.
    const isMaterialInvoiceType = (invoiceType) => (invoiceType?.label || '').toUpperCase().includes('MATERIAL');
    const isHsnMissing = (item) => isMaterialInvoiceType(editableData.invoice_type) && !String(item.hsn_sac || '').trim();

    // Tax code descriptions from SAP are the only place a rate is exposed —
    // GetTaxCodesFromSap only forwards TAX_CODE/TAX_DESC, no separate rate
    // field — so CGST/SGST/IGST rates are parsed out of that free text.
    // SAP writes this two different ways: rate-follows-its-own-keyword
    // ("CGST 9% + SGST 9%") and keywords-grouped-then-rates-grouped
    // ("SGST,CGST @ 9%+9%") — pairing keywords and rates up positionally, in
    // the order each is written, handles both shapes. A lone "18%" with no
    // CGST/SGST/IGST keyword is treated as an intra-state rate and split
    // evenly. Same logic as VendorInvoiceSubmit.js.
    const parseTaxRates = (description) => {
        const text = (description || '').toUpperCase();
        const keywords = text.match(/CGST|SGST|IGST/g) || [];
        const rates = (text.match(/\d+(?:\.\d+)?\s*%/g) || []).map(r => parseFloat(r));

        const rateFor = {};
        if (keywords.length && rates.length === 1) {
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

    // ─── Credit Memo Type change: reset everything below it ────────────────
    const handleCreditMemoTypeChange = (sel) => {
        setRequestQuery(''); setRequestResults([]); setShowRequestResults(false); setRequestLocked(false);
        setVendorQuery(''); setVendorResults([]); setShowVendorResults(false); setVendorLocked(false);
        setBankLocked(false); setHouseBankLocked(false);
        setLineItems([blankLineItem()]);
        setEditableData(prev => ({
            ...prev,
            credit_memo_type: sel,
            request_payment_id: null, fi_doc_no: '', fi_doc_date: '',
            invoice_type: null, vendor_code: '', vendor_name: '', division: null,
            bank_ac_no: '', bank_ifsc_code: '', house_bank_id: '', house_bank_ac_no: '',
            business_area: '',
        }));
    };

    // ─── Request No search (Related to FI) ──────────────────────────────────
    const [requestQuery, setRequestQuery]             = useState('');
    const [requestResults, setRequestResults]         = useState([]);
    const [showRequestResults, setShowRequestResults] = useState(false);
    const [requestLocked, setRequestLocked]           = useState(false);

    const handleRequestSearch = async () => {
        if (requestLocked) return;
        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/SearchFIRequests`, { query: requestQuery });
            const results = res?.data?.results || [];
            if (results.length === 0) { showErrorDialog("No matching requests found"); return; }
            setRequestResults(results); setShowRequestResults(true);
            if (results.length === 1) selectRequest(results[0]);
        } catch { showErrorDialog("Failed to search requests"); }
        finally { hideLoader(); }
    };

    const selectRequest = async (r) => {
        setRequestQuery(r.unique_payment_no || '');
        handleEditableChange('request_payment_id', r.payment_id);
        handleEditableChange('fi_doc_no', r.sap_document_no || '');
        handleEditableChange('fi_doc_date', r.sap_posting_date || r.invoice_date || '');
        handleEditableChange('vendor_code', r.vendor_code || '');
        handleEditableChange('vendor_name', r.vendor_name || '');
        setShowRequestResults(false); setRequestLocked(true);

        try {
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/GetFIRequestWithLines`, { id: r.payment_id });
            const detail = transformRequestRows(res?.data?.results);
            if (detail) {
                // The related FI request's own vendor_code/vendor_name are blank for
                // Employee-type requests (SearchFIRequests can't see this — it doesn't
                // select payment_to/gst_registered/emp_code/emp_name/gst_vendor_code/
                // gst_vendor_name) — resolve the identifier SAP actually posted the
                // document under instead, same logic as FIPaymentModel::VerifyAndPostToSap.
                const isEmployeeRequest = String(detail.payment_to || '').toUpperCase() === 'EMPLOYEE';
                const isGstRegistered   = String(detail.gst_registered || '') === '1';
                const resolvedVendorCode = isEmployeeRequest
                    ? (isGstRegistered ? (detail.gst_vendor_code || '') : (detail.emp_code || ''))
                    : (detail.vendor_code || '');
                const resolvedVendorName = isEmployeeRequest
                    ? (isGstRegistered ? (detail.gst_vendor_name || '') : (detail.emp_name || ''))
                    : (detail.vendor_name || '');
                handleEditableChange('vendor_code', resolvedVendorCode);
                handleEditableChange('vendor_name', resolvedVendorName);

                const div = divisionOptions.find(o => o.value === detail.division) || (detail.division ? { value: detail.division, label: detail.division } : null);
                const invType = invoiceTypeOptions.find(o => String(o.value) === String(detail.invoice_type)) || null;
                handleEditableChange('division', div);
                handleEditableChange('invoice_type', invType);
                handleEditableChange('bank_ac_no', detail.bank_account_no || '');
                handleEditableChange('bank_ifsc_code', detail.bank_ifsc_code || '');
                handleEditableChange('house_bank_id', detail.house_bank_id || '');
                handleEditableChange('house_bank_ac_no', detail.house_bank_ac_no || '');
                handleEditableChange('business_area', detail.business_area || '');
                handleEditableChange('total_amount', detail.total_amount ?? '');
                if (detail.house_bank_id || detail.house_bank_ac_no) setHouseBankLocked(true);
                const loadedLines = detail.line_items.length ? detail.line_items : [blankLineItem()];
                setLineItems(loadedLines);
                setExistingInvoiceCopyUrl(detail.invoice_copy_url || '');
                setExistingBackPaperUrl(detail.back_paper_url || '');
                loadedLines.forEach(i => {
                    if (i.gl_code && i.cost_center) fetchBudgetForLineItem(i.id, i.gl_code, i.cost_center, div?.value);
                });
            }
        } catch {
            showErrorDialog("Failed to load request details");
        } finally {
            hideLoader();
        }
    };

    const clearRequest = () => {
        setRequestLocked(false); setRequestQuery('');
        setHouseBankLocked(false); setBankLocked(false);
        setLineItems([blankLineItem()]);
        setExistingInvoiceCopyUrl(''); setExistingBackPaperUrl('');
        setEditableData(prev => ({
            ...prev,
            request_payment_id: null, fi_doc_no: '', fi_doc_date: '',
            invoice_type: null, vendor_code: '', vendor_name: '', division: null,
            bank_ac_no: '', bank_ifsc_code: '', house_bank_id: '', house_bank_ac_no: '',
            business_area: '', total_amount: '',
        }));
    };

    // ─── Vendor search (Non related to FI) ───────────────────────────────────
    const [vendorQuery, setVendorQuery]             = useState('');
    const [vendorResults, setVendorResults]         = useState([]);
    const [showVendorResults, setShowVendorResults] = useState(false);
    const [vendorLocked, setVendorLocked]           = useState(false);
    const [bankLocked, setBankLocked]               = useState(false);

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

    // ─── Amount fields: numeric only, max 7 integer digits, max 2 decimals ───
    const numericHandler = (field) => (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const firstDot = val.indexOf('.');
        if (firstDot !== -1) {
            val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, '');
        }
        let [intPart, decPart] = val.split('.');
        intPart = intPart.slice(0, 7);
        val = decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
        handleEditableChange(field, val);
    };

    // ─── File attachments ────────────────────────────────────────────────────
    const [attachedFiles, setAttachedFiles]     = useState({});
    const [previewUrl, setPreviewUrl]           = useState(null);
    const [previewTitle, setPreviewTitle]       = useState('');
    const [previewOpen, setPreviewOpen]         = useState(false);
    const [previewFileType, setPreviewFileType] = useState('');

    // Invoice copy / back paper already uploaded against the selected "Related
    // to FI" request — read-only, fetched from the backend via GetFIRequestWithLines.
    const [existingInvoiceCopyUrl, setExistingInvoiceCopyUrl] = useState('');
    const [existingBackPaperUrl, setExistingBackPaperUrl]     = useState('');

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

    // Same modal, but for a URL the backend already returned (no object URL to
    // create/revoke since it isn't a local File).
    const openExistingPreview = (url, label) => {
        if (!url) return;
        if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} }
        setPreviewUrl(url);
        setPreviewTitle(label);
        setPreviewFileType(/\.(png|jpe?g|gif|webp)$/i.test(url) ? 'image' : 'pdf');
        setPreviewOpen(true);
    };

    const closePreview = () => {
        if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} }
        setPreviewUrl(null); setPreviewTitle('');
        setPreviewOpen(false); setPreviewFileType('');
    };

    useEffect(() => () => { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} } }, []); // eslint-disable-line

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        try {
            await validationSchema.validate(editableData, { abortEarly: false });
        } catch (err) {
            const fields = [...new Set((err.inner && err.inner.length ? err.inner : [err]).map(e => e.path))];
            showErrorDialog(`Please Fill: ${fields.map(f => VALIDATION_LABELS[f] || f).join(", ")}`);
            return;
        }
        if (lineItems.some(isOverBudget)) {
            showErrorDialog("One or more line items exceed the available budget for their GL Code / Cost Centre.");
            return;
        }
        if (lineItems.some(isHsnMissing)) {
            showErrorDialog("HSN/SAC Code is required for all line items when Invoice Type is Material.");
            return;
        }
        if (!attachedFiles.Invoicecopy) {
            showErrorDialog("Credit Memo attachment is required.");
            return;
        }
        showLoader();
        try {
            let invoiceCopyFileName = '', attachmentFileName = '';
            const keys = Object.keys(attachedFiles || {}).filter(k => attachedFiles[k]);
            if (keys.length > 0) {
                const fd = new FormData();
                fd.append("form_name", "creditmemo"); fd.append("ponumber", "Invoicecopy");
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
                record_type: v.credit_memo_type?.value,
                request_payment_id: v.request_payment_id,
                fi_doc_no: v.fi_doc_no, fi_doc_date: v.fi_doc_date,
                invoice_type: v.invoice_type?.value,
                vendor_code: v.vendor_code, vendor_name: v.vendor_name,
                division: v.division?.value,
                reason: v.reason,
                memo_no: v.memo_no, memo_date: v.memo_date, amount: v.amount,
                bank_ac_no: v.bank_ac_no, bank_ifsc_code: v.bank_ifsc_code,
                house_bank_id: v.house_bank_id, house_bank_ac_no: v.house_bank_ac_no,
                posting_date: v.posting_date, business_area: v.business_area,
                line_items: lineItems.map(item => {
                    const { id, ...rest } = item;
                    const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                    return { ...rest, base_amount: baseAmt, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt };
                }),
                Invoicecopy: invoiceCopyFileName, Attachment: attachmentFileName,
                created_by: UserDetails.USERID,
            };
            const { data } = await apiPostMethod(apiBaseUrl + "CreditMemoController/InsertCreditMemo", postData);
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

    const AttachCard = ({ fieldId, label, icon, borderColor, iconColor, required }) => {
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
                <div style={{ fontWeight: 600, marginBottom: 2, color: '#343a40', fontSize: 14 }}>
                    {label} {required && <span className="text-danger">*</span>}
                </div>
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

    // Read-only button for an already-uploaded file coming back from the backend
    // (invoice copy / back paper tied to the selected "Related to FI" request).
    const AttachButton = ({ url, label, icon }) => (
        <button
            type="button"
            onClick={() => openExistingPreview(url, label)}
            disabled={!url}
            style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, padding: '14px 8px', border: '1px solid #dee2e6', borderRadius: 8,
                background: url ? '#fff' : '#f8f9fa', cursor: url ? 'pointer' : 'not-allowed',
                opacity: url ? 1 : 0.6,
            }}
        >
            {React.cloneElement(icon, { size: 20, color: '#3a5fd9' })}
            <span style={{ fontSize: 12, fontWeight: 600, color: '#343a40' }}>{label}</span>
            <span style={{
                fontSize: 11, color: '#3a5fd9', display: 'flex', alignItems: 'center', gap: 4,
            }}>
                <Eye size={12} /> {url ? 'View' : 'Not available'}
            </span>
        </button>
    );

    const SectionHeader = ({ icon, title }) => (
        <div className="d-flex align-items-center mb-3 mt-3">
            <span className="text-primary mr-2" style={{ fontSize: 18 }}>{icon}</span>
            <h5 className="text-primary mb-0"><strong>{title}</strong></h5>
        </div>
    );

    const dividerColStyle = { borderLeft: '2px solid #adb5bd' };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div>
            <Fragment>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                    {/* ══════════════════ LEFT FORM ══════════════════ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <CardComponent header={
                            <div className="d-flex align-items-center justify-content-between" style={{ width: '100%' }}>
                                <span>Non PO Credit Memo Parking</span>
                                {/* {!isRelatedToFI && (
                                    <span className="badge badge-info" style={{ fontSize: 11 }}>
                                        MANUAL ENTRY REQUIRED
                                    </span>
                                )} */}
                            </div>
                        }>

                            {/* ── HEADER & VENDOR INFORMATION ──────────── */}
                            <SectionHeader icon="ℹ" title="Header & Vendor Information" />

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Credit Memo Type <span className="text-danger">*</span></Label>
                                        <CustomDropdownInput
                                            options={creditMemoTypeOptions}
                                            form={dummyForm} id="credit_memo_type"
                                            placeholder="Select..."
                                            value={editableData.credit_memo_type}
                                            onChange={handleCreditMemoTypeChange}
                                        />
                                    </FormGroup>
                                </Col>

                                {isRelatedToFI && (
                                    <>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>Request No <span className="text-danger">*</span></Label>
                                                <SearchInput
                                                    query={requestQuery} setQuery={setRequestQuery}
                                                    locked={requestLocked} onSearch={handleRequestSearch}
                                                    onClear={clearRequest} results={requestResults}
                                                    showResults={showRequestResults} onSelect={selectRequest}
                                                    placeholder="Search & Select Request..."
                                                    formatResult={r =>
                                                        `${r.unique_payment_no}${r.vendor_name ? ' — ' + r.vendor_name : ''}${r.invoice_number ? ' (' + r.invoice_number + ')' : ''}`
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>FI Doc No</Label>
                                                <Input type="text" value={editableData.fi_doc_no}
                                                    disabled style={{ background: '#f0f0f0' }}
                                                    placeholder="Auto-filled from request" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>FI Doc Date</Label>
                                                <Input type="date" value={editableData.fi_doc_date || ''}
                                                    onKeyDown={e => e.preventDefault()}
                                                    disabled style={{ background: '#f0f0f0' }} />
                                            </FormGroup>
                                        </Col>
                                    </>
                                )}
                            </Row>

                            <Row>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Vendor Code <span className="text-danger">*</span></Label>
                                        {isNonRelatedToFI ? (
                                            <SearchInput
                                                query={vendorQuery} setQuery={setVendorQuery}
                                                locked={vendorLocked} onSearch={handleVendorSearch}
                                                onClear={clearVendor} results={vendorResults}
                                                showResults={showVendorResults} onSelect={selectVendor}
                                                placeholder="Search vendor code..."
                                                formatResult={v =>
                                                    v.VENDORNAME ? `${v.VENDORNAME} (${v.VENDOR})` : v.VENDOR
                                                }
                                            />
                                        ) : (
                                            <Input type="text" value={editableData.vendor_code}
                                                disabled style={{ background: '#f0f0f0' }}
                                                placeholder="Auto-filled from request" />
                                        )}
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Vendor Name</Label>
                                        <Input type="text" value={editableData.vendor_name}
                                            disabled style={{ background: '#f0f0f0' }}
                                            placeholder="Auto-filled after search" />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Division</Label>
                                        <Input type="text" value={editableData.division?.label || ''}
                                            disabled style={{ background: '#f0f0f0' }}
                                            placeholder="Auto-filled from your profile" />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Reason <span className="text-danger">*</span></Label>
                                        <Input type="text" placeholder="e.g. Defective Goods Return"
                                            value={editableData.reason}
                                            onChange={e => handleEditableChange('reason', e.target.value)} />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Invoice Type</Label>
                                        <CustomDropdownInput
                                            options={invoiceTypeOptions}
                                            id="invoice_type" form={dummyForm} placeholder="Select..."
                                            value={editableData.invoice_type}
                                            onChange={sel => handleEditableChange('invoice_type', sel)}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <HrLine />

                            {/* ── FINANCIAL DETAILS ────────────────────── */}
                            <SectionHeader icon="💳" title="Financial Details" />

                            <Row>
                                <Col md="4" sm="12"><h6 className="text-muted">Credit Memo Details</h6></Col>
                                <Col md="4" sm="12" style={dividerColStyle}><h6 className="text-muted">Banking Reference</h6></Col>
                                <Col md="4" sm="12" style={dividerColStyle}><h6 className="text-muted">Accounting Controls</h6></Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Memo No <span className="text-danger">*</span></Label>
                                        <Input type="text" value={editableData.memo_no}
                                            onChange={e => handleEditableChange('memo_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>Bank A/C No</Label>
                                        <Input type="text" value={editableData.bank_ac_no} disabled
                                            style={{ background: '#f0f0f0' }}
                                            onChange={e => handleEditableChange('bank_ac_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>Posting Date</Label>
                                        <Input type="date" value={editableData.posting_date}
                                            onChange={e => handleEditableChange('posting_date', e.target.value)}
                                            onKeyDown={e => e.preventDefault()}
                                            min={dateRestriction.min_date} max={dateRestriction.max_date} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Memo Date <span className="text-danger">*</span></Label>
                                        <Input type="date" value={editableData.memo_date}
                                            onChange={e => handleEditableChange('memo_date', e.target.value)}
                                            onKeyDown={e => e.preventDefault()}
                                            max={new Date().toISOString().split("T")[0]} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>IFSC Code</Label>
                                        <Input type="text" value={editableData.bank_ifsc_code} disabled
                                            style={{ background: '#f0f0f0' }}
                                            onChange={e => handleEditableChange('bank_ifsc_code', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>Account No</Label>
                                        <Input type="text" value={editableData.house_bank_ac_no} disabled
                                            style={{ background: '#f0f0f0' }}
                                            onChange={e => handleEditableChange('house_bank_ac_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label> Deduction Amount <span className="text-danger">*</span></Label>
                                        <Input type="text" inputMode="decimal" placeholder="0.00"
                                            value={editableData.amount}
                                            onChange={numericHandler('amount')} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>House Bank ID</Label>
                                        <Input type="text" value={editableData.house_bank_id} disabled
                                            style={{ background: '#f0f0f0' }}
                                            onChange={e => handleEditableChange('house_bank_id', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12" style={dividerColStyle}>
                                    <FormGroup>
                                        <Label>Business Area</Label>
                                        <Input type="text" value={editableData.business_area} disabled
                                            style={{ background: '#f0f0f0' }}
                                            placeholder="Auto-filled from Cost Centre"
                                            onChange={e => handleEditableChange('business_area', e.target.value)} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Total Amount</Label>
                                        <Input type="text" value={editableData.total_amount} disabled
                                            style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <HrLine />

                            {/* ── SUPPORTING DOCUMENTS ─────────────────── */}
                            <SectionHeader icon="📎" title="Supporting Documents" />

                            <Row>
                                <Col md="6" sm="12">
                                    <AttachCard fieldId="Invoicecopy" label="Credit Memo" required
                                        icon={<FileText />} borderColor="#ced4da" iconColor="#3a5fd9" />
                                </Col>
                                <Col md="6" sm="12">
                                    <AttachCard fieldId="Attachment" label="Attachment"
                                        icon={<File />} borderColor="#3a5fd9" iconColor="#3a5fd9" />
                                </Col>
                            </Row>

                            {requestLocked && (
                                <Row className="mt-2">
                                    <Col xs="12">
                                        <h6 className="text-muted mb-2">From Original FI Request</h6>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <AttachButton url={existingInvoiceCopyUrl} label="Invoice Copy" icon={<FileText />} />
                                            <AttachButton url={existingBackPaperUrl} label="Back Paper" icon={<File />} />
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            <HrLine />

                            {/* ── LINE ITEM ALLOCATION ─────────────────── */}
                            <div className="d-flex align-items-center justify-content-between mb-3 mt-3">
                                <div className="d-flex align-items-center">
                                    <span className="text-primary mr-2" style={{ fontSize: 18 }}>▦</span>
                                    <h5 className="text-primary mb-0"><strong>Line Item Allocation</strong></h5>
                                </div>
                                <Button color="outline-primary" size="sm" onClick={addLineItem}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Plus size={14} /> Add Row
                                </Button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                            {['Expense Type','GL Code','GL Description','Budget','Amount',
                                              ...(isRelatedToFI ? ['Deduction Amount'] : []),
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
                                                    <Input type="select" bsSize="sm" value={item.expenses_type}
                                                        onChange={e => handleExpensesTypeChange(item.id, e.target.value)}>
                                                        <option value="">Select...</option>
                                                        {expensesTypeOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" value={item.gl_code} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'gl_code',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 120 }}><Input type="text" bsSize="sm" value={item.gl_description} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'gl_description',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 150 }}>
                                                    <InputGroup size="sm">
                                                        <Input type="number" bsSize="sm" value={item.budget} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'budget',e.target.value)} />
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
                                                {isRelatedToFI && (
                                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                                        <Input type="number" bsSize="sm" step="0.01" min="0" placeholder="0.00"
                                                            value={item.deduction_amount}
                                                            onChange={e => updateLineItem(item.id,'deduction_amount',e.target.value)} />
                                                    </td>
                                                )}
                                                <td style={{ padding: '4px', minWidth: 170 }}>
                                                    <Input type="select" bsSize="sm"
                                                        value={costCentreOptions.findIndex(opt => String(opt.value) === String(item.cost_center_desc) && opt.cost_centre_code === item.cost_center)}
                                                        onChange={e => handleCostCentreChange(item.id, e.target.value)}>
                                                        <option value="-1">Select...</option>
                                                        {costCentreOptions.map((opt, idx) => (
                                                            <option key={idx} value={idx}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" value={item.cost_center} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'cost_center',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 140 }}>
                                                    <Input type="select" bsSize="sm" value={item.tax_type}
                                                        onChange={e => handleTaxTypeChange(item.id, e.target.value)}>
                                                        <option value="">Select...</option>
                                                        {taxOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </Input>
                                                </td>
                                                <td style={{ padding: '4px', minWidth: 70 }}><Input type="text" bsSize="sm" value={item.tax_code} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'tax_code',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 120 }}><Input type="text" bsSize="sm" value={item.tax_description} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'tax_description',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="number" bsSize="sm" value={baseAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={cgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={sgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly /></td>
                                                <td style={{ padding: '4px', minWidth: 80 }}><Input type="number" bsSize="sm" value={igstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly /></td>
                                                <td style={{ padding: '4px', minWidth: 70 }}><Input type="text" bsSize="sm" value={item.text} onChange={e => updateLineItem(item.id,'text',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="text" bsSize="sm" value={item.profit_center} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'profit_center',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 130 }}><Input type="text" bsSize="sm" value={item.profit_center_desc} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'profit_center_desc',e.target.value)} /></td>
                                                <td style={{ padding: '4px', minWidth: 90 }}>
                                                    <Input type="text" bsSize="sm" value={item.hsn_sac}
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

                            <div className="d-flex justify-content-end mt-3">
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: '#6c757d' }}>Total Deduction Amount</div>
                                    <div style={{ fontWeight: 700, color: '#3a5fd9', fontSize: 16 }}>INR {totalDeductionAmount.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <Row className="mt-4">
                                <Col sm="12" className="d-flex justify-content-end">
                                    <Button color="primary" type="button" onClick={handleSubmit}>Submit</Button>
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

export default NonPoCreditMemoParking;
