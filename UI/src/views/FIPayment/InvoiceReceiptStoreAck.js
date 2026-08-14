import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FileText, File, X, Check, XCircle } from 'react-feather';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { errorToast, ShowToast } from '@helpers/appHelper';
import { CardComponent } from '../common/CardComponent';
import TableComponent from '../common/TableComponent';
import { useLoader } from '../../utility/hooks/useLoader';
import confirmDialog from '../../@core/components/confirm/confirmDialog';

// approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager (this
// screen — waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on
// GFA Verification), 10 = Rejected.
const APPROVAL_STATUS_FILTER = 2;
const APPROVAL_STATUS = { ACKNOWLEDGED: 4, REJECTED: 10 };

const statusLabelByApprovalStatus = {
    2: 'STORE ACKNOWLEDGE',
};

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// "Duration" = time in the current stage (since the row was last updated);
// "Overall Duration" = total elapsed time since submission. Falls back to
// created_at when updated_at is still null (never touched since creation).
const formatDurationSince = (dateStr) => {
    if (!dateStr) return '-';
    const then = new Date(dateStr.replace(' ', 'T'));
    if (Number.isNaN(then.getTime())) return '-';
    let totalMinutes = Math.max(0, Math.floor((Date.now() - then.getTime()) / 60000));
    const days = Math.floor(totalMinutes / 1440); totalMinutes %= 1440;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${days}d ${hours}h ${minutes}m`;
};

const statusStyles = {
    'MANAGER APPROVAL': { background: '#fdf3d9', color: '#a3760a' },
    'GFA VERIFICATION': { background: '#e4eefe', color: '#2f6fed' },
    'COMPLETED': { background: '#e2f6ea', color: '#1e9e5a' },
    'REJECTED': { background: '#fbe6e6', color: '#d64545' },
    'STORE ACKNOWLEDGE': { background: '#eae6fb', color: '#6c4bbf' },
};

const StatusBadge = ({ status }) => {
    const style = statusStyles[status] || { background: '#eee', color: '#495057' };
    return (
        <span style={{
            display: 'inline-block', padding: '4px 10px', borderRadius: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
            background: style.background, color: style.color, whiteSpace: 'nowrap',
        }}>
            {status}
        </span>
    );
};

function InvoiceReceiptStoreAck() {
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [invoiceList, setInvoiceList] = useState([]);
    const [submittingId, setSubmittingId] = useState(null);
    const [viewedDocs, setViewedDocs] = useState({});

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [rejectPaymentId, setRejectPaymentId] = useState(null);

    const showErrorDialog = (message) => {
        confirmDialog({
            title: `<h5><strong class="text-white">${message || 'Something went wrong'}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: '#f50e0a',
        });
    };

    // Only requests submitted by users whose Cost Centre Mapping names the
    // logged-in user as Store Reporting show up here — each store contact
    // gets their own queue instead of everyone's pending requests. User id 1
    // is exempt from this filter and sees every pending request.
    const isSuperAdmin = Number(UserDetails.USERID) === 1;
    const fetchInvoiceList = useCallback(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetFIPaymentList`, {
            startCount: 0, pageSize: 100000, approvalStatus: APPROVAL_STATUS_FILTER,
            ...(isSuperAdmin ? {} : { store_reporting_id: UserDetails.USERID }),
        })
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    const results = (data.results || []).map((r) => ({
                        ...r,
                        status_label: statusLabelByApprovalStatus[r.approval_status] || 'PENDING',
                        duration_label: formatDurationSince(r.updated_at || r.created_at),
                        overall_duration_label: formatDurationSince(r.created_at),
                    }));
                    setInvoiceList(results);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            });
    }, [UserDetails.USERID]);

    useEffect(() => {
        fetchInvoiceList();
    }, [fetchInvoiceList]);

    const updateApprovalStatus = async (id, status, remarks) => {
        try {
            setSubmittingId(id);
            showLoader();
            const res = await apiPostMethod(`${apiBaseUrl}FIPaymentController/UpdateApprovalStatus`, {
                id, status, remarks: remarks || null, userid: UserDetails.USERID,
            });
            if (res?.data?.success) {
                ShowToast(res.data.message || 'Updated successfully.');
                fetchInvoiceList();
            } else {
                showErrorDialog(res?.data?.message || 'Unable to update payment status');
            }
        } catch (e) {
            console.error(e);
            showErrorDialog('Failed to update payment status');
        } finally {
            setSubmittingId(null);
            hideLoader();
        }
    };

    const openDocument = (row, docKey, url) => {
        window.open(url, '_blank');
        setViewedDocs((prev) => ({
            ...prev,
            [row.payment_id]: { ...prev[row.payment_id], [docKey]: true },
        }));
    };

    const canActOnRow = (row) => {
        const viewed = viewedDocs[row.payment_id] || {};
        const invoiceOk = !row.invoice_copy || viewed.invoice;
        const backPaperOk = !row.back_paper || viewed.backPaper;
        return invoiceOk && backPaperOk;
    };

    const handleApprove = async (row) => {
        const confirmed = await confirmDialog({
            title: 'Acknowledge this payment?',
            confirmText: 'Book Keeping',
            cancelText: 'Cancel',
        });
        if (confirmed) updateApprovalStatus(row.payment_id, APPROVAL_STATUS.ACKNOWLEDGED);
    };

    const openRejectModal = (row) => {
        setRejectPaymentId(row.payment_id);
        setRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setRejectModalOpen(false);
        setRejectRemarks('');
        setRejectPaymentId(null);
    };

    const handleRejectSubmit = () => {
        if (!rejectRemarks.trim()) {
            showErrorDialog('Rejection remarks are required');
            return;
        }
        const id = rejectPaymentId;
        const remarks = rejectRemarks.trim();
        closeRejectModal();
        updateApprovalStatus(id, APPROVAL_STATUS.REJECTED, remarks);
    };

    const columns = [
        { name: 'Vendor Name', selector: (row) => row.vendor_name || row.emp_name, sortable: true, minWidth: '160px' },
        { name: 'Nature of Expenses', selector: (row) => row.nature_of_expenses, sortable: true, minWidth: '170px' },
        { name: 'Dept', selector: (row) => row.department, sortable: true, minWidth: '150px' },
        {
            name: 'Invoice Amount', selector: (row) => row.invoice_amount, sortable: true, minWidth: '130px',
            cell: (row) => currency(row.invoice_amount),
        },
        {
            name: 'Invoice Date', selector: (row) => row.invoice_date, sortable: true, minWidth: '120px',
        },
        { name: 'Division', selector: (row) => row.division, sortable: true, minWidth: '120px' },
        { name: 'Cost Centre', selector: (row) => row.cost_center, sortable: true, minWidth: '140px' },
        {
            name: 'Waiting At', selector: (row) => row.status_label, sortable: true, minWidth: '180px',
            cell: (row) => <StatusBadge status={row.status_label} />,
        },
        { name: 'Duration', selector: (row) => row.duration_label, minWidth: '130px' },
        { name: 'Overall Duration', selector: (row) => row.overall_duration_label, minWidth: '150px' },
        {
            name: 'Invoice Copy',
            minWidth: '130px',
            cell: (row) => (
                <Button color={viewedDocs[row.payment_id]?.invoice ? 'success' : 'light'} size="sm"
                    disabled={!row.invoice_copy}
                    onClick={() => openDocument(row, 'invoice', row.invoice_copy)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} /> View
                </Button>
            ),
        },
        {
            name: 'Back Paper Copy',
            minWidth: '150px',
            cell: (row) => (
                <Button color={viewedDocs[row.payment_id]?.backPaper ? 'success' : 'light'} size="sm"
                    disabled={!row.back_paper}
                    onClick={() => openDocument(row, 'backPaper', row.back_paper)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <File size={14} /> View
                </Button>
            ),
        },
        {
            name: 'Action',
            minWidth: '260px',
            cell: (row) => {
                const disabled = submittingId === row.payment_id || !canActOnRow(row);
                const title = canActOnRow(row) ? undefined : 'Open both Invoice Copy and Back Paper Copy before approving or rejecting';
                return (
                    <div style={{ display: 'flex', gap: 8 }} title={title}>
                        <Button.Ripple color="success" size="sm" disabled={disabled}
                            onClick={() => handleApprove(row)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={14} /> Book Keeping
                        </Button.Ripple>
                        <Button.Ripple color="danger" size="sm" disabled={disabled}
                            onClick={() => openRejectModal(row)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={14} /> Reject
                        </Button.Ripple>
                    </div>
                );
            },
        },
    ];

    return (
        <CardComponent header="Invoice Store Acknowledge List">
            <TableComponent columns={columns} data={invoiceList} />

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
                    <Button color="danger" size="sm" disabled={submittingId === rejectPaymentId} onClick={handleRejectSubmit}>
                        Reject Payment
                    </Button>
                </Modal.Footer>
            </Modal>
        </CardComponent>
    );
}

export default InvoiceReceiptStoreAck;
