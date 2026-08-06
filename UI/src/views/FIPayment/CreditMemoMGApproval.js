import React, { useState, useEffect } from 'react';
import { Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FileText, File, Eye, X, Briefcase, CreditCard, Clipboard, Check, XCircle, ArrowLeft,
} from 'react-feather';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { CardComponent } from '../common/CardComponent';
import { HrLine } from '../common/HrLine';
import { useLoader } from '../../utility/hooks/useLoader';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { ShowToast } from '../../helper/appHelper';

// approval_status: 1 = Pending Manager Approval, 2 = Approved, 10 = Rejected
const APPROVAL_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 10 };

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Backend returns a flat array (one row per line item, header fields
// repeated on every row) — collapse it into the shape this component expects.
const transformCreditMemoRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows[0];
    const lineRows = rows.filter(r => r.line_id !== null && r.line_id !== undefined);

    return {
        credit_memo_id: first.credit_memo_id,
        approval_status: Number(first.approval_status),
        request_no: first.unique_credit_memo_no,
        request_date: first.created_at ? first.created_at.split(' ')[0] : null,
        record_type: first.record_type,
        fi_doc_no: first.fi_doc_no,
        fi_doc_date: first.fi_doc_date,
        memo_no: first.memo_no,
        memo_date: first.memo_date,
        total_amount: first.total_amount,
        original_invoice_total_amount: first.original_invoice_total_amount,

        vendor_code: first.vendor_code,
        vendor_name: first.vendor_name,
        division: first.division,
        reason: first.reason,
        invoice_type: first.invoice_type_name || first.invoice_type,

        bank_ac_no: first.bank_account_no,
        bank_ifsc_code: first.bank_ifsc_code,
        house_bank_id: first.house_bank_id,
        house_bank_ac_no: first.house_bank_ac_no,
        account_no: first.account_no,
        business_area: first.business_area,

        invoice_copy_url: first.invoice_copy,
        back_paper_url: first.back_paper,

        line_items: lineRows.map((r) => ({
            id: r.line_id,
            expenses_type: r.expense_type_name || r.expenses_type,
            gl_code: r.gl_code,
            gl_description: r.gl_description,
            budget: r.budget,
            cost_center_desc: r.cost_center_name || r.cost_center_desc,
            cost_center: r.cost_center,
            tax_type: r.tax_type,
            tax_code: r.tax_code,
            tax_desc: r.tax_description,
            base_amount: r.base_amount,
            cgst_amount: r.cgst_amount,
            sgst_amount: r.sgst_amount,
            igst_amount: r.igst_amount,
            text: r.item_text,
            profit_center: r.profit_center,
            profit_center_desc: r.profit_center_description,
            amount: r.line_item_amount,
            deduction_amount: r.deduction_amount,
        })),
    };
};

// ─── Read-only "value box" used throughout ────────────────────────────────
const Field = ({ label, value, empty = 'N/A' }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: '#6c757d', marginBottom: 6,
        }}>
            {label}
        </div>
        <div style={{
            padding: '8px 12px', borderRadius: 6, background: '#f4f6f8',
            fontSize: 14, color: value ? '#343a40' : '#adb5bd',
            fontFamily: /code|no$|number/i.test(label) ? 'monospace' : undefined,
        }}>
            {value || empty}
        </div>
    </div>
);

const SectionHeader = ({ icon, title }) => (
    <div className="d-flex align-items-center mb-3">
        {React.cloneElement(icon, { size: 18, color: '#3a5fd9', style: { marginRight: 8 } })}
        <h5 className="mb-0" style={{ color: '#343a40' }}><strong>{title}</strong></h5>
    </div>
);

function CreditMemoMGApproval({ data: dataProp, requestId }) {
    const { Id } = useParams();
    const id = requestId || (Id ? Id.replace(':', '') : '');
    const { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    // ─── Fetch the record from the backend ─────────────────────────────
    const [record, setRecord]   = useState(dataProp || null);
    const [loading, setLoading] = useState(!dataProp);
    const [error, setError]     = useState('');

    const showErrorDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message || 'Something went wrong'}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: '#f50e0a',
        });
    };

    const fetchRecord = async () => {
        if (!id) { setError('No credit memo id provided'); setLoading(false); return; }
        try {
            setLoading(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoById`, { id });
            if (res?.data?.success && res.data.results?.length) {
                setRecord(transformCreditMemoRows(res.data.results));
                setError('');
            } else {
                setError(res?.data?.message || 'Unable to load credit memo');
            }
        } catch (e) {
            console.error(e);
            setError('Failed to fetch credit memo from server');
            showErrorDialog('Failed to fetch credit memo from server');
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    useEffect(() => {
        if (!dataProp) fetchRecord();
    }, [id]); // eslint-disable-line

    // ─── Approve / Reject actions ───────────────────────────────────────
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectRemarks, setRejectRemarks]     = useState('');
    const [submitting, setSubmitting]           = useState(false);

    const updateApprovalStatus = async (status, remarks) => {
        try {
            setSubmitting(true);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/UpdateApprovalStatus`, {
                id, status, remarks: remarks || null, userid: UserDetails.USERID,
            });
            if (res?.data?.success) {
                ShowToast(res.data.message || 'Updated successfully.');
                history.push('/CREDITMEMORECEIPTLIST');
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

    const handleApprove = async () => {
        const confirmed = await confirmDialog({
            title: 'Approve this credit memo?',
            confirmText: 'Approve',
            cancelText: 'Cancel',
        });
        if (confirmed) updateApprovalStatus(APPROVAL_STATUS.APPROVED);
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

    // ─── Attachment preview modal ────────────────────────────────────────
    const [previewOpen, setPreviewOpen]         = useState(false);
    const [previewUrl, setPreviewUrl]           = useState(null);
    const [previewTitle, setPreviewTitle]       = useState('');
    const [previewFileType, setPreviewFileType] = useState('');

    const openPreview = (url, title) => {
        if (!url) return;
        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
        setPreviewUrl(url);
        setPreviewTitle(title);
        setPreviewFileType(isImage ? 'image' : 'pdf');
        setPreviewOpen(true);
    };
    const closePreview = () => {
        setPreviewOpen(false); setPreviewUrl(null);
        setPreviewTitle(''); setPreviewFileType('');
    };

    const AttachButton = ({ url, label, icon }) => (
        <button
            type="button"
            onClick={() => openPreview(url, label)}
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
                <Eye size={12} /> {label === 'Back Paper' ? 'View Attach' : 'View PDF'}
            </span>
        </button>
    );

    const d = record || {};
    const lineItems = d.line_items || [];
    const isRelatedToFI = d.record_type === 'related_fi';
    const isPending = d.approval_status === APPROVAL_STATUS.PENDING;

    // Older credit memos were saved before the Base/CGST/SGST/IGST split
    // existed, so only show those columns once at least one line item has one.
    const hasTaxSplit = lineItems.some((i) =>
        [i.base_amount, i.cgst_amount, i.sgst_amount, i.igst_amount]
            .some((v) => v !== '' && v !== null && v !== undefined));

    // ─── Loading / error states ─────────────────────────────────────────
    if (loading) {
        return (
            <CardComponent header="Credit Memo Manager Approval — Audit View">
                <div style={{ padding: 48, textAlign: 'center', color: '#6c757d' }}>
                    Loading credit memo…
                </div>
            </CardComponent>
        );
    }

    if (error && !record) {
        return (
            <CardComponent header="Credit Memo Manager Approval — Audit View">
                <div style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>
                    <Button color="primary" size="sm" onClick={fetchRecord} className="mr-1">Retry</Button>
                    <Button color="light" size="sm" onClick={() => history.goBack()}
                        style={{ border: '1px solid #dee2e6' }}>
                        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Back
                    </Button>
                </div>
            </CardComponent>
        );
    }

    return (
        <div>
            <Button color="light" onClick={() => history.goBack()}
                className="mb-2"
                style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #dee2e6' }}>
                <ArrowLeft size={15} /> Back
            </Button>
            <CardComponent header="Credit Memo Manager Approval">

                {/* ── TOP SUMMARY BAR ─────────────────────────────────── */}
                <Row className="align-items-stretch">
                    <Col md="2" sm="6" xs="6"><Field label="Request No" value={d.request_no} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Request Date" value={d.request_date} /></Col>
                    <Col md="3" sm="6" xs="6"><Field label="Memo No" value={d.memo_no} /></Col>
                    <Col md="2" sm="6" xs="6"><Field label="Memo Date" value={d.memo_date} /></Col>
                    <Col md="3" sm="12">
                        <div style={{
                            background: '#3a5fd9', borderRadius: 8, padding: '10px 16px',
                            color: '#fff', height: '100%', display: 'flex',
                            flexDirection: 'column', justifyContent: 'center',
                        }}>
                            <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85 }}>
                                Total Deduction Amount
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{currency(d.total_amount)}</div>
                        </div>
                    </Col>
                </Row>

                <HrLine />

                {/* ── VENDOR/OPERATIONAL + BANK/VERIFICATION ─────────── */}
                <Row>
                    <Col md="6" sm="12">
                        <SectionHeader icon={<Briefcase />} title="Vendor & Operational Details" />
                        <Row>
                            <Col md="4" sm="6"><Field label="Vendor Code" value={d.vendor_code} /></Col>
                            <Col md="4" sm="6"><Field label="Vendor Name" value={d.vendor_name} /></Col>
                            <Col md="4" sm="6"><Field label="Division" value={d.division} /></Col>
                        </Row>
                        <Row>
                            <Col md="4" sm="6"><Field label="Invoice Type" value={d.invoice_type} /></Col>
                            <Col md="4" sm="6"><Field label="Reason" value={d.reason} /></Col>
                            <Col md="4" sm="6"><Field label="Credit Memo Type" value={isRelatedToFI ? 'Related to FI' : 'Non Related to FI'} /></Col>
                        </Row>
                        {isRelatedToFI && (
                            <Row>
                                <Col md="4" sm="6"><Field label="FI Doc No" value={d.fi_doc_no} /></Col>
                                <Col md="4" sm="6"><Field label="FI Doc Date" value={d.fi_doc_date} /></Col>
                            </Row>
                        )}
                    </Col>

                    <Col md="6" sm="12">
                        <SectionHeader icon={<CreditCard />} title="Bank & Verification" />
                        <Row>
                            <Col md="6" sm="6"><Field label="Vendor Bank A/c No" value={d.bank_ac_no} /></Col>
                            <Col md="6" sm="6"><Field label="Vendor Bank IFSC Code" value={d.bank_ifsc_code} /></Col>
                        </Row>
                        <Row>
                            <Col md="6" sm="6"><Field label="House Bank Id" value={d.house_bank_id} /></Col>
                            <Col md="6" sm="6"><Field label="House Bank AC No" value={d.house_bank_ac_no} /></Col>
                        </Row>
                        <Row>
                            <Col md="6" sm="6"><Field label="Business Area" value={d.business_area} /></Col>
                            <Col md="6" sm="6"><Field label="Total Amount" value={d.original_invoice_total_amount != null ? currency(d.original_invoice_total_amount) : null} /></Col>
                        </Row>
                        <Row className="mt-2">
                            <Col xs="12">
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <AttachButton url={d.invoice_copy_url} label="Invoice Copy" icon={<FileText />} />
                                    <AttachButton url={d.back_paper_url} label="Back Paper" icon={<File />} />
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <HrLine />

                {/* ── LINE ITEM AUDIT TABLE ───────────────────────────── */}
                <SectionHeader icon={<Clipboard />} title="Line Item Audit" />

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                {['Expense Type', 'GL Code', 'GL Description', 'Budget (Auto)',
                                  'Cost Center Desc (Auto)', 'Cost Center (Auto)', 'Tax Type (Auto)',
                                  'Tax Code (Auto)', 'Tax Code Desc (Auto)',
                                  ...(hasTaxSplit ? ['Base Amt', 'CGST', 'SGST', 'IGST'] : []),
                                  'Text', 'Profit Center (Auto)', 'Profit Center Desc (Auto)', 'Amount',
                                  ...(isRelatedToFI ? ['Deduction Amount'] : [])].map((col) => (
                                    <th key={col} style={{
                                        padding: '10px 8px',
                                        textAlign: ['Amount', 'Deduction Amount'].includes(col) ? 'right' : 'left',
                                        whiteSpace: 'nowrap', fontWeight: 700, color: '#495057',
                                        borderRight: '1px solid #e9ecef', fontSize: 11,
                                        textTransform: 'uppercase', letterSpacing: '0.03em',
                                    }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eef0f2' }}>
                                    <td style={{ padding: '10px 8px' }}>{item.expenses_type}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.gl_code}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.gl_description}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.budget != null ? currency(item.budget) : '-'}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.cost_center_desc}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.cost_center}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.tax_type}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.tax_code}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.tax_desc}</td>
                                    {hasTaxSplit && (
                                        <>
                                            <td style={{ padding: '10px 8px' }}>{item.base_amount != null ? currency(item.base_amount) : '-'}</td>
                                            <td style={{ padding: '10px 8px' }}>{item.cgst_amount != null ? currency(item.cgst_amount) : '-'}</td>
                                            <td style={{ padding: '10px 8px' }}>{item.sgst_amount != null ? currency(item.sgst_amount) : '-'}</td>
                                            <td style={{ padding: '10px 8px' }}>{item.igst_amount != null ? currency(item.igst_amount) : '-'}</td>
                                        </>
                                    )}
                                    <td style={{ padding: '10px 8px' }}>{item.text}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.profit_center}</td>
                                    <td style={{ padding: '10px 8px' }}>{item.profit_center_desc}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                                        {currency(item.amount)}
                                    </td>
                                    {isRelatedToFI && (
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                                            {currency(item.deduction_amount)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={(isRelatedToFI ? 13 : 12) + (hasTaxSplit ? 4 : 0)} style={{
                                    padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#343a40',
                                }}>
                                    Total Deduction Amount
                                </td>
                                <td style={{
                                    padding: '12px 8px', textAlign: 'right', fontWeight: 700,
                                    color: '#3a5fd9', fontSize: 15,
                                }}>
                                    {currency(lineItems.reduce((s, i) => {
                                        const ded = parseFloat(i.deduction_amount);
                                        return s + (ded || parseFloat(i.amount) || 0);
                                    }, 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* ── APPROVE / REJECT ACTIONS ─────────────────────────── */}
                {isPending && (
                    <Row className="mt-4">
                        <Col sm="12" className="d-flex justify-content-end">
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button color="danger" type="button" disabled={submitting}
                                    onClick={openRejectModal}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <XCircle size={16} /> Reject
                                </Button>
                                <Button color="success" type="button" disabled={submitting}
                                    onClick={handleApprove}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Check size={16} /> Approve
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}

            </CardComponent>

            {/* ── REJECT REMARKS MODAL ─────────────────────────────────── */}
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

            {/* ── PREVIEW MODAL ─────────────────────────────────────────── */}
            <Modal show={previewOpen} onHide={closePreview} centered size="xl">
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        {previewFileType === 'image'
                            ? <FileText size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            : <File size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />}
                        {previewTitle}
                    </Modal.Title>
                    <button type="button" className="close" onClick={closePreview}>
                        <X size={18} />
                    </button>
                </Modal.Header>
                <Modal.Body style={{ padding: 0, minHeight: 400 }}>
                    {previewUrl && previewFileType === 'image' && (
                        <div style={{
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            padding: 16, background: '#f0f0f0', minHeight: 400,
                        }}>
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
        </div>
    );
}

export default CreditMemoMGApproval;
