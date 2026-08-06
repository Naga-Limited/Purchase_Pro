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

function CreditMemoReceiptGFAlist() {
    const history = useHistory();
    const [memoList, setMemoList] = useState([]);

    const fetchMemoList = useCallback(() => {
        apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoList`, {
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
                    setMemoList(results);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            });
    }, []);

    useEffect(() => {
        fetchMemoList();
    }, [fetchMemoList]);

    const handleView = (row) => {
        history.push(`/CREDITMEMOGFAVERIFICATION:${row.credit_memo_id}`);
    };

    const columns = [
        { name: 'Vendor Name', selector: (row) => row.vendor_name, sortable: true, minWidth: '160px' },
        { name: 'Reason', selector: (row) => row.reason, sortable: true, minWidth: '170px' },
        { name: 'Division', selector: (row) => row.division, sortable: true, minWidth: '120px' },
        {
            name: 'Amount', selector: (row) => row.amount, sortable: true, minWidth: '130px',
            cell: (row) => currency(row.amount),
        },
        {
            name: 'Memo Date', selector: (row) => row.memo_date, sortable: true, minWidth: '120px',
        },
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
        <CardComponent header="Credit Memo GFA Verification List">
            <TableComponent columns={columns} data={memoList} />
        </CardComponent>
    );
}

export default CreditMemoReceiptGFAlist;
