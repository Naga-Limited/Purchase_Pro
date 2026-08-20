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
import { Search, Plus, Trash2, FileText, File, Eye, X, ArrowLeft } from 'react-feather';
import Uploader from '../Uploader';
import DateComponent from '../common/dateComponent';

// ─── Reusable search input with dropdown list (same as NonPoCreditMemoParking) ─
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
// on every row) — collapse it into one editable record.
const transformForEdit = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];
    const lineRows = rows.filter(r => r.line_id !== null && r.line_id !== undefined);

    return {
        credit_memo_id: first.credit_memo_id,
        record_type: first.record_type || 'non_related_fi',
        request_payment_id: first.request_payment_id,
        fi_doc_no: first.fi_doc_no,
        fi_doc_date: first.fi_doc_date,
        invoice_type: first.invoice_type,
        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        division: first.division,
        reason: first.reason,
        memo_no: first.memo_no,
        memo_date: first.memo_date,
        amount: first.amount,
        bank_ac_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        posting_date: first.posting_date,
        account_no: first.account_no,
        business_area: first.business_area,
        tds_code: first.tds_code,
        tds_description: first.tds_description,
        invoice_copy: first.invoice_copy,
        back_paper: first.back_paper,
        rejection_remarks: first.rejection_remarks,
        line_items: (lineRows.length ? lineRows : [{}]).map((r, i) => ({
            id: r.line_id || Date.now() + i,
            expenses_type: r.expenses_type || '',
            gl_code: r.gl_code || '',
            gl_description: r.gl_description || '',
            budget: r.budget ?? '',
            amount: r.line_item_amount ?? '',
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
    vendor_code:  Yup.string().required("Vendor Code is required"),
    division:     Yup.object().nullable().required("Division is required"),
    reason:       Yup.string().required("Reason is required"),
    memo_no:      Yup.string().required("Memo No is required"),
    memo_date:    Yup.string().required("Memo Date is required"),
    amount:       Yup.number().typeError("Amount must be a number").min(0).required("Amount is required"),
});

const VALIDATION_LABELS = {
    vendor_code: "Vendor Code", division: "Division", reason: "Reason",
    memo_no: "Memo No", memo_date: "Memo Date", amount: "Amount",
};

function CreditMemoEdit() {
    const history = useHistory();
    const { Id } = useParams();
    const creditMemoId = Id ? Id.replace(":", "") : '';

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

    const dummyForm = { values: {}, errors: {}, touched: {}, setFieldValue: () => {}, setFieldTouched: () => {} };

    // ─── Load the rejected Credit Memo to edit ────────────────────────────
    const [record, setRecord] = useState(null);
    const [loadError, setLoadError] = useState('');

    const fetchRecord = () => {
        if (!creditMemoId) { setLoadError('No credit memo id provided'); return; }
        showLoader();
        apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoById`, { id: creditMemoId })
            .then((res) => {
                if (res?.data?.success && res.data.results?.length) {
                    setRecord(transformForEdit(res.data.results));
                    setLoadError('');
                } else {
                    setLoadError(res?.data?.message || 'Unable to load credit memo');
                }
            })
            .catch(() => {
                setLoadError('Failed to fetch credit memo from server');
                showErrorDialog('Failed to fetch credit memo from server');
            })
            .finally(() => hideLoader());
    };

    useEffect(() => {
        fetchRecord();
    }, [creditMemoId]); // eslint-disable-line

    // ─── Division / Invoice Type / TDS options ──────────────────────────────
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [invoiceTypeOptions, setInvoiceTypeOptions] = useState([]);
    const [tdsOptions, setTdsOptions] = useState([]);

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
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTdsCodesFromSap`, {})
            .then(res => setTdsOptions(res?.data?.results || []));
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

    // ─── Vendor search (only used when record_type = non_related_fi) ────────
    const [vendorQuery, setVendorQuery]             = useState('');
    const [vendorResults, setVendorResults]         = useState([]);
    const [showVendorResults, setShowVendorResults] = useState(false);
    const [vendorLocked, setVendorLocked]           = useState(false);
    const [bankLocked, setBankLocked]               = useState(false);
    const [houseBankLocked, setHouseBankLocked]     = useState(false);

    // ─── Line items ───────────────────────────────────────────────────────────
    const blankLineItem = () => ({
        id: Date.now(),
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', deduction_amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([blankLineItem()]);

    // ─── File attachments ────────────────────────────────────────────────────
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

    useEffect(() => () => { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} } }, []); // eslint-disable-line

    // ─── Single editable-data object driving every header field ──────────────
    const [editableData, setEditableData] = useState({
        record_type: 'non_related_fi', request_payment_id: null,
        fi_doc_no: '', fi_doc_date: '',
        invoice_type: null, vendor_code: '', vendor_name: '', division: null,
        reason: '', memo_no: '', memo_date: '', amount: '',
        bank_ac_no: '', bank_ifsc_code: '', house_bank_id: '', house_bank_ac_no: '',
        posting_date: '', account_no: '', business_area: '',
        tds_code: '', tds_description: '',
    });

    const handleEditableChange = (field, value) =>
        setEditableData(prev => ({ ...(prev || {}), [field]: value }));

    const isRelatedToFI = editableData.record_type === 'related_fi';

    // ─── Hydrate editableData once the rejected record has loaded ────────────
    useEffect(() => {
        if (!record) return;

        setEditableData(prev => ({
            ...prev,
            record_type: record.record_type,
            request_payment_id: record.request_payment_id,
            fi_doc_no: record.fi_doc_no || '',
            fi_doc_date: record.fi_doc_date || '',
            vendor_code: record.vendor_code || '',
            vendor_name: record.vendor_name || '',
            reason: record.reason || '',
            memo_no: record.memo_no || '',
            memo_date: record.memo_date || '',
            amount: record.amount != null ? String(record.amount) : '',
            bank_ac_no: record.bank_ac_no || '',
            bank_ifsc_code: record.bank_ifsc_code || '',
            house_bank_id: record.house_bank_id || '',
            house_bank_ac_no: record.house_bank_ac_no || '',
            posting_date: record.posting_date || '',
            account_no: record.account_no || '',
            business_area: record.business_area || '',
            tds_code: record.tds_code || '',
            tds_description: record.tds_description || '',
        }));

        if (record.record_type === 'non_related_fi' && record.vendor_code) {
            setVendorQuery(record.vendor_code); setVendorLocked(true);
        }
        if (record.bank_ac_no || record.bank_ifsc_code) setBankLocked(true);
        if (record.house_bank_id || record.house_bank_ac_no) setHouseBankLocked(true);

        setLineItems(record.line_items && record.line_items.length ? record.line_items : [blankLineItem()]);
        setExistingFiles({ Invoicecopy: record.invoice_copy || '', Attachment: record.back_paper || '' });
    }, [record]); // eslint-disable-line

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

    // ─── Amount field: numeric only, max 7 integer digits, max 2 decimals ────
    const handleAmountChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const firstDot = val.indexOf('.');
        if (firstDot !== -1) {
            val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, '');
        }
        let [intPart, decPart] = val.split('.');
        intPart = intPart.slice(0, 7);
        val = decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
        handleEditableChange('amount', val);
    };

    // ─── Vendor search handlers (non_related_fi only) ─────────────────────────
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

    // ─── Line item handlers ────────────────────────────────────────────────────
    const handleExpensesTypeChange = (id, expenseTypeId) => {
        const selected = expensesTypeOptions.find(opt => String(opt.value) === String(expenseTypeId));
        setLineItems(p => p.map(i => i.id === id ? {
            ...i,
            expenses_type: expenseTypeId,
            gl_code: selected ? selected.gl_code : '',
            gl_description: selected ? selected.gl_description : '',
        } : i));
    };

    // A single mapping row can carry several comma-separated Cost Centre
    // codes (GetCostCentresByUser explodes each into its own option), so
    // multiple options can share the same mapping id — matching on id alone
    // would always resolve to whichever code was exploded first, not
    // whichever option the user actually picked. The option's array index is
    // the only thing guaranteed unique per <option>, so the select is keyed
    // on that; cost_center_desc still stores the option's real mapping id.
    const handleCostCentreChange = (id, optionIdx) => {
        const selected = costCentreOptions[Number(optionIdx)];
        setLineItems(p => p.map(i => i.id === id ? {
            ...i,
            cost_center_desc: selected ? selected.value : '',
            cost_center: selected ? selected.cost_centre_code : '',
            profit_center: selected ? selected.profit_centre : '',
            profit_center_desc: selected ? selected.profit_centre_desc : '',
        } : i));
        if (selected && !houseBankLocked) {
            handleEditableChange('house_bank_id', selected.house_bank_id || '');
            handleEditableChange('house_bank_ac_no', selected.house_bank_ac_no || '');
            setHouseBankLocked(true);
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

    const selectedTdsValue = tdsOptions.find(
        opt => opt.tds_code === editableData.tds_code && opt.description === editableData.tds_description
    )?.value || '';

    const handleTdsCodeChange = (value) => {
        const selected = tdsOptions.find(opt => opt.value === value);
        handleEditableChange('tds_code', selected ? selected.tds_code : '');
        handleEditableChange('tds_description', selected ? selected.description : '');
    };

    // ─── Submit (resubmits the rejected Credit Memo for Manager Approval) ────
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
        showLoader();
        try {
            let invoiceCopyFileName = existingFiles.Invoicecopy || '';
            let attachmentFileName  = existingFiles.Attachment || '';
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
                credit_memo_id: record.credit_memo_id,
                record_type: v.record_type,
                request_payment_id: v.request_payment_id,
                fi_doc_no: v.fi_doc_no, fi_doc_date: v.fi_doc_date,
                invoice_type: v.invoice_type?.value,
                vendor_code: v.vendor_code, vendor_name: v.vendor_name,
                division: v.division?.value,
                reason: v.reason,
                memo_no: v.memo_no, memo_date: v.memo_date, amount: v.amount,
                bank_ac_no: v.bank_ac_no, bank_ifsc_code: v.bank_ifsc_code,
                house_bank_id: v.house_bank_id, house_bank_ac_no: v.house_bank_ac_no,
                posting_date: v.posting_date, account_no: v.account_no, business_area: v.business_area,
                tds_code: v.tds_code, tds_description: v.tds_description,
                line_items: lineItems.map(({ id, ...rest }) => rest),
                Invoicecopy: invoiceCopyFileName, Attachment: attachmentFileName,
                updated_by: UserDetails.USERID,
            };
            const { data } = await apiPostMethod(apiBaseUrl + "CreditMemoController/UpdateCreditMemo", postData);
            if (data.success) {
                ShowToast(data.message || "Resubmitted Successfully...");
                setTimeout(() => history.push('/CREDITMEMORECEIPTREJECTEDLIST'), 1500);
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

    const SectionHeader = ({ icon, title }) => (
        <div className="d-flex align-items-center mb-3 mt-3">
            <span className="text-primary mr-2" style={{ fontSize: 18 }}>{icon}</span>
            <h5 className="text-primary mb-0"><strong>{title}</strong></h5>
        </div>
    );

    // ─── Loading / error states ─────────────────────────────────────────────
    if (!record && !loadError) {
        return (
            <CardComponent header="Non PO Credit Memo — Edit">
                <div style={{ padding: 48, textAlign: 'center', color: '#6c757d' }}>
                    Loading credit memo…
                </div>
            </CardComponent>
        );
    }

    if (loadError && !record) {
        return (
            <CardComponent header="Non PO Credit Memo — Edit">
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
                        <CardComponent header="Non PO Credit Memo — Edit & Resubmit">

                            {record?.rejection_remarks && (
                                <div style={{
                                    padding: '10px 14px', borderRadius: 6, background: '#fbe6e6',
                                    color: '#a3282a', marginBottom: 16, fontSize: 13,
                                }}>
                                    <strong>Rejection Remarks:</strong> {record.rejection_remarks}
                                </div>
                            )}

                            {/* ── HEADER & VENDOR INFORMATION ──────────── */}
                            <SectionHeader icon="ℹ" title="Header & Vendor Information" />

                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Credit Memo Type</Label>
                                        <Input type="text" disabled style={{ background: '#f0f0f0' }}
                                            value={isRelatedToFI ? 'Related to FI' : 'Non Related to FI'} />
                                    </FormGroup>
                                </Col>
                                {isRelatedToFI && (
                                    <>
                                        <Col md="4" sm="12">
                                            <FormGroup>
                                                <Label>FI Doc No</Label>
                                                <Input type="text" value={editableData.fi_doc_no}
                                                    disabled style={{ background: '#f0f0f0' }} />
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
                                        {isRelatedToFI ? (
                                            <Input type="text" value={editableData.vendor_code}
                                                disabled style={{ background: '#f0f0f0' }} />
                                        ) : (
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
                                        )}
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Vendor Name</Label>
                                        <Input type="text" value={editableData.vendor_name}
                                            disabled style={{ background: '#f0f0f0' }} />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Division <span className="text-danger">*</span></Label>
                                        <CustomDropdownInput
                                            options={divisionOptions}
                                            id="division" form={dummyForm} placeholder="Select..."
                                            value={editableData.division}
                                            onChange={sel => handleEditableChange('division', sel)}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="12">
                                    <FormGroup>
                                        <Label>Reason <span className="text-danger">*</span></Label>
                                        <Input type="text" value={editableData.reason}
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
                                <Col md="4" sm="12"><h6 className="text-muted">Banking Reference</h6></Col>
                                <Col md="4" sm="12"><h6 className="text-muted">Accounting Controls</h6></Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Memo No <span className="text-danger">*</span></Label>
                                        <Input type="text" value={editableData.memo_no}
                                            onChange={e => handleEditableChange('memo_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Bank A/C No</Label>
                                        <Input type="text" value={editableData.bank_ac_no}
                                            onChange={e => handleEditableChange('bank_ac_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
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
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>IFSC Code</Label>
                                        <Input type="text" value={editableData.bank_ifsc_code}
                                            onChange={e => handleEditableChange('bank_ifsc_code', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Account No</Label>
                                        <Input type="text" value={editableData.account_no}
                                            onChange={e => handleEditableChange('account_no', e.target.value)} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Amount <span className="text-danger">*</span></Label>
                                        <Input type="text" inputMode="decimal" placeholder="0.00"
                                            value={editableData.amount}
                                            onChange={handleAmountChange} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>House Bank ID</Label>
                                        <Input type="text" value={editableData.house_bank_id}
                                            onChange={e => handleEditableChange('house_bank_id', e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Business Area</Label>
                                        <Input type="text" value={editableData.business_area}
                                            onChange={e => handleEditableChange('business_area', e.target.value)} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>TDS Code</Label>
                                        <Input type="select" bsSize="sm" value={selectedTdsValue}
                                            onChange={e => handleTdsCodeChange(e.target.value)}>
                                            <option value="">Select...</option>
                                            {tdsOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Input>
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
                                              'Tax Description','Text','Profit Center',
                                              'Profit Center Description','HSN/SAC',''].map(col => (
                                                <th key={col} style={{ padding: '8px 6px', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 600, color: '#495057', borderRight: '1px solid #e9ecef' }}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map(item => (
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
                                                <td style={{ padding: '4px', minWidth: 90 }}><Input type="number" bsSize="sm" value={item.budget} disabled style={{ background: '#f0f0f0' }} onChange={e => updateLineItem(item.id,'budget',e.target.value)} /></td>
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
                                        ))}
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
                                    <Button color="primary" type="button" onClick={handleSubmit}>Resubmit</Button>
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

export default CreditMemoEdit;
