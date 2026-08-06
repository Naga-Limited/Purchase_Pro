import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, Label, Input, InputGroup } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Clipboard, CreditCard, Paperclip, FileText, File, Eye, X, Clock, Check, XCircle, ArrowLeft,
    Plus, Trash2, RefreshCw, Info,
} from 'react-feather';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { ShowToast } from '@helpers/appHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import DateComponent from '../common/dateComponent';

// approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
// (waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on GFA
// Verification — this screen), 5 = GFA Verified (Completed), 10 = Rejected
const APPROVAL_STATUS = { GFA_STAGE: 4, VERIFIED: 5, REJECTED: 10 };

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

// Backend returns a flat array (one row per line item, header fields
// repeated on every row) instead of a { ...header, line_items: [] } object.
const transformCreditMemoRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];
    const lineRows = rows.filter(r => r.line_id !== null && r.line_id !== undefined);

    return {
        credit_memo_id: first.credit_memo_id,
        approval_status: Number(first.approval_status),
        created_by: first.created_by,

        request_no: first.unique_credit_memo_no,
        request_date: first.created_at ? first.created_at.split(' ')[0] : null,
        requested_by: first.requested_by,
        record_type: first.record_type,
        fi_doc_no: first.fi_doc_no,
        fi_doc_date: first.fi_doc_date,
        reason: first.reason,

        memo_no: first.memo_no,
        memo_date: first.memo_date,
        posting_date: first.posting_date,
        total_amount: first.total_amount,
        original_invoice_total_amount: first.original_invoice_total_amount,

        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        division: first.division,
        invoice_type: first.invoice_type_name || first.invoice_type,

        account_no: first.account_no,
        business_area: first.business_area,
        bank_ac_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        tds_code: first.tds_code,
        tds_description: first.tds_description,

        invoice_copy_url: first.invoice_copy,
        back_paper_url: first.back_paper,

        created_at: first.created_at,
        mg_approved_at: first.mg_approved_at,
        stores_approved_at: first.stores_approved_at,
        gfa_posted_at: first.gfa_posted_at,
        rejected_at: first.rejected_at,
        rejection_remarks: first.rejection_remarks,

        line_items: lineRows.map((r) => ({
            id: r.line_id,
            line_id: r.line_id || null,
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

const Field = ({ label, value, bold }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4,
        }}>
            {label}
        </div>
        <div style={{ fontSize: 14, color: value ? '#2b3245' : '#adb5bd', fontWeight: bold ? 700 : 500 }}>
            {value || 'N/A'}
        </div>
    </div>
);

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

function CreditMemoGFAVerification() {
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

    // ─── GFA-editable line items (mirrors GFAVerification.js) ────────────────
    const [expensesTypeOptions, setExpensesTypeOptions] = useState([]);
    const [costCentreOptions, setCostCentreOptions]     = useState([]);
    const [taxOptions, setTaxOptions]                   = useState([]);
    const blankLineItem = () => ({
        id: Date.now() + Math.random(), line_id: null,
        expenses_type: '', gl_code: '', gl_description: '', budget: '',
        amount: '', deduction_amount: '', cost_center_desc: '', cost_center: '', tax_type: '',
        tax_code: '', tax_description: '', text: '', profit_center: '',
        profit_center_desc: '', hsn_sac: '',
    });
    const [lineItems, setLineItems] = useState([]);

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
        if (!id) { setError('No credit memo id provided'); setLoading(false); return; }
        try {
            setLoading(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoById`, { id });
            if (res?.data?.success && res.data.results?.length) {
                const transformed = transformCreditMemoRows(res.data.results);
                setRecord(transformed);
                setTdsCode(transformed?.tds_code || '');
                setTdsDescription(transformed?.tds_description || '');
                if (transformed?.posting_date) {
                    setPostingDate(transformed.posting_date.split(' ')[0].split('T')[0]);
                }
                setError('');
            } else {
                setError(res?.data?.message || 'Unable to load credit memo');
            }
        } catch (e) {
            console.error(e);
            setError('Failed to fetch credit memo from server');
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [id]); // eslint-disable-line

    useEffect(() => { fetchRecord(); }, [fetchRecord]);

    useEffect(() => {
        if (!record?.vendor_code) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetTdsFromVendor`, { vendor_code: record.vendor_code })
            .then((res) => setTdsOptions(res?.data?.results || []))
            .catch((e) => console.error(e));
    }, [record]); // eslint-disable-line

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

    // ─── Hydrate the GFA-editable line items once the record has loaded ─────
    useEffect(() => {
        if (!record) return;
        setLineItems(record.line_items && record.line_items.length ? record.line_items : [blankLineItem()]);
    }, [record]); // eslint-disable-line

    // SAP's budget master for these two divisions is keyed by Division itself
    // rather than by Cost Centre — GetBudgetFromSap's cost_ctr param must
    // carry the Division code instead of the line's actual Cost Centre code
    // whenever the invoice's Division is one of these.
    const DIVISION_AS_COST_CTR = ['NLSD', 'NLCD'];

    // ─── Line item helpers (mirrors GFAVerification.js) ──────────────────────
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

    const handleCostCentreChange = (lineId, mappingId) => {
        const selected = costCentreOptions.find((opt) => String(opt.value) === String(mappingId));
        const costCenterCode = selected ? selected.cost_centre_code : '';
        let nextItem = null;
        setLineItems((p) => p.map((i) => {
            if (i.id !== lineId) return i;
            nextItem = {
                ...i, cost_center_desc: mappingId, cost_center: costCenterCode,
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

    // A blank/unknown budget (no GL Code + Cost Centre picked yet) isn't a
    // violation — only flag rows where a real budget figure is on record.
    const isOverBudget = (item, allItems = lineItems) => {
        if (item.budget === '' || item.budget === null || item.budget === undefined) return false;
        if (!item.gl_code || !item.cost_center) return false;
        const groupTotal = allItems
            .filter((i) => i.gl_code === item.gl_code && i.cost_center === item.cost_center)
            .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        return groupTotal > (parseFloat(item.budget) || 0);
    };

    // Tax code descriptions from SAP are the only place a rate is exposed —
    // GetTaxCodesFromSap only forwards TAX_CODE/TAX_DESC, no separate rate
    // field — so CGST/SGST/IGST rates are parsed out of that free text.
    // SAP writes this two different ways: rate-follows-its-own-keyword
    // ("CGST 9% + SGST 9%") and keywords-grouped-then-rates-grouped
    // ("SGST,CGST @ 9%+9%") — pairing keywords and rates up positionally, in
    // the order each is written, handles both shapes. A lone "18%" with no
    // CGST/SGST/IGST keyword is treated as an intra-state rate and split
    // evenly. Same logic as VendorInvoiceSubmit.js / GFAVerification.js, so
    // Credit Memo GFA re-verification recalculates live off whatever Amount /
    // Tax Code the verifier edits here.
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

    const updateApprovalStatus = async (status, remarks, extra) => {
        try {
            setSubmitting(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/UpdateApprovalStatus`, {
                id, status, remarks: remarks || null, userid: UserDetails.USERID, ...extra,
            });
            if (res?.data?.success) {
                ShowToast(res.data.message || 'Updated successfully.');
                history.push('/CREDITMEMORECEIPTGFALIST');
            } else {
                showErrorDialog(res?.data?.message || 'Unable to update credit memo status');
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to update credit memo status');
        } finally {
            setSubmitting(false);
            hideLoader();
        }
    };

    const verifyAndPostToSap = async () => {
        try {
            setSubmitting(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/VerifyAndPostToSap`, {
                id, userid: UserDetails.USERID,
                tds_code: tdsCode, tds_description: tdsDescription,
                posting_date: postingDate,
            });
            if (res?.data?.success ) {
                // Backend already embeds "Document No: X" into message when SAP
                // returns one (both a fresh post's DEDUCT_DOCUMENT_NO and an
                // "already posted" response's DOCUMENT_NO) — no need to re-derive
                // it here.
                showSuccessDialog(res.data.message || 'Verified and posted to SAP successfully.');
                history.push('/CREDITMEMORECEIPTGFALIST');
            } else {
                showErrorDialog(res?.data?.message || 'Unable to post credit memo to SAP');
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to post credit memo to SAP');
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

    const handleApprove = async () => {
        if (!postingDate) {
            showErrorDialog('Posting Date is required before approving');
            return;
        }
        if (lineItems.some((item) => isOverBudget(item))) {
            showErrorDialog('One or more line items exceed the available budget for their GL Code / Cost Centre.');
            return;
        }
        const confirmed = await confirmDialog({
            title: 'Verify and post this credit memo to SAP?',
            confirmText: 'Approve',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        try {
            setSubmitting(true);
            showLoader();
            const updateRes = await apiPostMethod(`${apiBaseUrl}CreditMemoController/UpdateGFADetails`, {
                credit_memo_id: id,
                line_items: lineItems.map((item) => {
                    const { id: lineItemId, ...rest } = item;
                    const { baseAmt, cgstAmt, sgstAmt, igstAmt } = getTaxSplit(item);
                    return { ...rest, base_amount: baseAmt, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt };
                }),
            });
            if (!updateRes?.data?.success) {
                showErrorDialog(updateRes?.data?.message || 'Unable to save line item details.');
                return;
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to save line item details.');
            return;
        } finally {
            setSubmitting(false);
            hideLoader();
        }

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
        return <div style={{ padding: 48, textAlign: 'center', color: '#6c757d' }}>Loading credit memo…</div>;
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
    const isRelatedToFI = d.record_type === 'related_fi';
    const isActionable = d.approval_status === APPROVAL_STATUS.GFA_STAGE;

    const historyStages = [
        { label: 'Submitted', at: d.created_at },
        { label: 'Manager Approved', at: d.mg_approved_at },
        { label: 'Store Acknowledged', at: d.stores_approved_at },
        { label: 'GFA Verified', at: d.gfa_posted_at },
        { label: 'Rejected', at: d.rejected_at },
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
                            Verify and approve global financial authorizations for pending credit memo requests.
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
                    <Col md="2" sm="6" xs="6"><Field label="Credit Memo Type" value={isRelatedToFI ? 'Related to FI' : 'Non Related to FI'} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Reason" value={d.reason} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Division" value={d.division} /></Col>
                </Row>
                <Row>
                    <Col md="2" sm="6" xs="6"><Field label="Memo No" value={d.memo_no} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Memo Date" value={formatDate(d.memo_date)} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Total Deduction Amount" value={currency(d.total_amount)} bold /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Vendor Code" value={d.vendor_code} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Vendor Name" value={d.vendor_name} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Invoice Type" value={d.invoice_type} /></Col>
                </Row>
                {isRelatedToFI && (
                    <Row>
                        <Col md="2" sm="6" xs="6"><Field label="FI Doc No" value={d.fi_doc_no} /></Col>
                        <Col md="2" sm="6" xs="6"><Field label="FI Doc Date" value={formatDate(d.fi_doc_date)} /></Col>
                    </Row>
                )}
            </Card>

            {/* ── PAYMENT & COMPLIANCE + DOCUMENTS ────────────────────── */}
            <Row>
                <Col md="7" sm="12">
                    <Card icon={<CreditCard />} title="Payment & Compliance Info">
                        <Row>
                            <Col md="3" sm="6" xs="6"><Field label="Business Area" value={d.business_area} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Vendor Bank A/C" value={d.bank_ac_no} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Vendor Bank IFSC" value={d.bank_ifsc_code} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="Total Amount" value={d.original_invoice_total_amount != null ? currency(d.original_invoice_total_amount) : null} /></Col>
                        </Row>
                        <Row>
                            <Col md="3" sm="6" xs="6"><Field label="House Bank Id" value={d.house_bank_id} /></Col>
                            <Col md="3" sm="6" xs="6"><Field label="House Bank AC No" value={d.house_bank_ac_no} /></Col>
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
                        </Row>
                        <Row>
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
                                        min={dateRestriction.min_date} max={dateRestriction.max_date}
                                        onChange={(e) => setPostingDate(e.target.value)}
                                        onKeyDown={e => e.preventDefault()}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col md="5" sm="12">
                    <Card icon={<Paperclip />} title="Documents">
                        {[
                            { url: d.invoice_copy_url, label: 'Invoice Copy', icon: <FileText /> },
                            { url: d.back_paper_url, label: 'Back Paper', icon: <File /> },
                        ].map((doc) => (
                            <div key={doc.label} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', background: '#f8f9fa', borderRadius: 8, marginBottom: 10,
                            }}>
                                <div className="d-flex align-items-center">
                                    {React.cloneElement(doc.icon, { size: 18, color: '#22315a', style: { marginRight: 10 } })}
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2b3245' }}>{doc.label}</div>
                                        <div style={{ fontSize: 11, color: '#8a94a6' }}>{fileTypeLabel(doc.url) || 'Not attached'}</div>
                                    </div>
                                </div>
                                <Button color="primary" size="sm" disabled={!doc.url}
                                    onClick={() => window.open(doc.url, '_blank')}>
                                    <Eye size={12} style={{ marginRight: 4 }} /> View
                                </Button>
                            </div>
                        ))}
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
                            <tr style={{ borderBottom: '1px solid #e9ecef' }}>
                                {[
                                    'Expense Type', 'GL Code', 'GL Description', 'Budget', 'Amount',
                                    ...(isRelatedToFI ? ['Deduction Amount'] : []),
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
                                        <Input type="text" bsSize="sm" value={item.gl_code} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 120 }}>
                                        <Input type="text" bsSize="sm" value={item.gl_description} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 150 }}>
                                        <InputGroup size="sm">
                                            <Input type="number" bsSize="sm" value={item.budget} disabled style={{ background: '#f0f0f0' }} readOnly />
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
                                    {isRelatedToFI && (
                                        <td style={{ padding: '4px', minWidth: 90 }}>
                                            <Input type="number" bsSize="sm" step="0.01" min="0" placeholder="0.00"
                                                value={item.deduction_amount} disabled={!isActionable}
                                                onChange={(e) => updateLineItem(item.id, 'deduction_amount', e.target.value)} />
                                        </td>
                                    )}
                                    <td style={{ padding: '4px', minWidth: 170 }}>
                                        <Input type="select" bsSize="sm" value={item.cost_center_desc} disabled={!isActionable}
                                            onChange={(e) => handleCostCentreChange(item.id, e.target.value)}>
                                            <option value="">Select...</option>
                                            {costCentreOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Input>
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.cost_center} disabled style={{ background: '#f0f0f0' }} readOnly />
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
                                        <Input type="text" bsSize="sm" value={item.tax_code} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 120 }}>
                                        <Input type="text" bsSize="sm" value={item.tax_description} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="number" bsSize="sm" value={baseAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={cgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={sgstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 80 }}>
                                        <Input type="number" bsSize="sm" value={igstAmt.toFixed(2)} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.text} disabled={!isActionable}
                                            onChange={(e) => updateLineItem(item.id, 'text', e.target.value)} />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 90 }}>
                                        <Input type="text" bsSize="sm" value={item.profit_center} disabled style={{ background: '#f0f0f0' }} readOnly />
                                    </td>
                                    <td style={{ padding: '4px', minWidth: 130 }}>
                                        <Input type="text" bsSize="sm" value={item.profit_center_desc} disabled style={{ background: '#f0f0f0' }} readOnly />
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
                                <td colSpan={isRelatedToFI ? 5 : 4} style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#22315a' }}>
                                    Total Deduction Amount
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#2f6fed', fontSize: 15 }}>
                                    {currency(lineItems.reduce((s, i) => {
                                        const ded = parseFloat(i.deduction_amount);
                                        return s + (ded || parseFloat(i.amount) || 0);
                                    }, 0))}
                                </td>
                                <td colSpan={9 + 4 + (isActionable ? 1 : 0)} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* ── APPROVE / REJECT ACTIONS ────────────────────────────── */}
            {isActionable && (
                <div className="d-flex justify-content-end" style={{ gap: 8, marginTop: 8 }}>
                    <Button color="danger" disabled={submitting} onClick={openRejectModal}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <XCircle size={16} /> Reject
                    </Button>
                    <Button color="success" disabled={submitting} onClick={handleApprove}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={16} /> Approve
                    </Button>
                </div>
            )}

            {/* ── REJECT REMARKS MODAL ────────────────────────────────── */}
            <Modal show={rejectModalOpen} onHide={closeRejectModal} centered>
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        Reject Credit Memo
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
                        Reject Credit Memo
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
                                <span style={{ fontWeight: 600, color: s.at ? '#2b3245' : '#adb5bd' }}>{s.label}</span>
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

export default CreditMemoGFAVerification;
