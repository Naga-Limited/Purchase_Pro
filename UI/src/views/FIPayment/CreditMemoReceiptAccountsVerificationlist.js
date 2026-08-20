import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { errorToast } from '@helpers/appHelper';
import { CardComponent } from '../common/CardComponent';
import TableComponent from '../common/TableComponent';

// Only ever shows approval_status 6 (Pending Accounts Verification) rows —
// requests only land here when their Cost Centre mapping flags
// accounts_verification = 'Yes'; everything else skips straight from Store
// Ack to the GFA queue.
const APPROVAL_STATUS_FILTER = 6;

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

const StatusBadge = () => (
    <span style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 6,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
        background: '#fdeed9', color: '#c1720a', whiteSpace: 'nowrap',
    }}>
        ACCOUNTS VERIFICATION
    </span>
);

function CreditMemoReceiptAccountsVerificationlist() {
    const history = useHistory();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [memoList, setMemoList] = useState([]);

    // Only requests whose Cost Centre Mapping names the logged-in user as
    // Accounts Verifier show up here — each verifier gets their own queue.
    // User id 1 is exempt from this filter and sees every pending request.
    const isSuperAdmin = Number(UserDetails.USERID) === 1;
    const fetchMemoList = useCallback(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoList`, {
            startCount: 0, pageSize: 100000, approvalStatus: APPROVAL_STATUS_FILTER,
            ...(isSuperAdmin ? {} : { reporting_accounts_id: UserDetails.USERID }),
        })
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    const results = (data.results || []).map((r) => ({
                        ...r,
                        duration_label: formatDurationSince(r.updated_at || r.created_at),
                        overall_duration_label: formatDurationSince(r.created_at),
                    }));
                    setMemoList(results);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            });
    }, [UserDetails.USERID]);

    useEffect(() => {
        fetchMemoList();
    }, [fetchMemoList]);

    const handleView = (row) => {
        history.push(`/CREDITMEMOACCOUNTSVERIFICATION:${row.credit_memo_id}`);
    };

    const columns = [
        { name: 'Vendor Name', selector: (row) => row.vendor_name, sortable: true, minWidth: '160px' },
        { name: 'Reason', selector: (row) => row.reason, sortable: true, minWidth: '170px' },
        { name: 'Division', selector: (row) => row.division, sortable: true, minWidth: '120px' },
        { name: 'Cost Centre', selector: (row) => row.cost_center, sortable: true, minWidth: '140px' },
        {
            name: 'Amount', selector: (row) => row.amount, sortable: true, minWidth: '130px',
            cell: (row) => currency(row.amount),
        },
        {
            name: 'Memo Date', selector: (row) => row.memo_date, sortable: true, minWidth: '120px',
        },
        {
            name: 'Waiting At', minWidth: '190px',
            cell: () => <StatusBadge />,
        },
        { name: 'Duration', selector: (row) => row.duration_label, minWidth: '130px' },
        { name: 'Overall Duration', selector: (row) => row.overall_duration_label, minWidth: '150px' },
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
        <CardComponent header="Accounts Verification List">
            <TableComponent columns={columns} data={memoList} />
        </CardComponent>
    );
}

export default CreditMemoReceiptAccountsVerificationlist;
