import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { errorToast } from '@helpers/appHelper';
import { CardComponent } from '../common/CardComponent';
import TableComponent from '../common/TableComponent';

// approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
// (waiting on Store Acknowledge), 4 = Store Acknowledged (this screen —
// waiting on GFA Verification), 5 = GFA Verified (Completed), 10 = Rejected.
const APPROVAL_STATUS_FILTER = 4;

const statusLabelByApprovalStatus = {
    4: 'GFA VERIFICATION',
};

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDuration = (days) => {
    const n = Number(days) || 0;
    return `${n} Day${n === 1 ? '' : 's'}`;
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

function InvoiceReceiptGFAlist() {
    const history = useHistory();
    const [invoiceList, setInvoiceList] = useState([]);

    const fetchInvoiceList = useCallback(() => {
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetFIPaymentList`, {
            startCount: 0, pageSize: 100000, approvalStatus: APPROVAL_STATUS_FILTER,
        })
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    const results = (data.results || []).map((r) => ({
                        ...r,
                        status_label: statusLabelByApprovalStatus[r.approval_status] || 'PENDING',
                        duration_label: formatDuration(r.duration_days),
                    }));
                    setInvoiceList(results);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            });
    }, []);

    useEffect(() => {
        fetchInvoiceList();
    }, [fetchInvoiceList]);

    const handleView = (row) => {
        history.push(`/GFAVERIFICATION:${row.payment_id}`);
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
        {
            name: 'Waiting At', selector: (row) => row.status_label, sortable: true, minWidth: '180px',
            cell: (row) => <StatusBadge status={row.status_label} />,
        },
        { name: 'Duration', selector: (row) => row.duration_label, minWidth: '100px' },
        { name: 'Overall Duration', selector: (row) => row.duration_label, minWidth: '150px' },
        {
            name: 'Action',
            minWidth: '110px',
            cell: (row) => (
                <Button.Ripple color="primary" size="sm" onClick={() => handleView(row)}>
                    VIEW
                </Button.Ripple>
            ),
        },
    ];

    return (
        <CardComponent header="Invoice GFA Verification List">
            <TableComponent columns={columns} data={invoiceList} />
        </CardComponent>
    );
}

export default InvoiceReceiptGFAlist;
