import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { errorToast } from '@helpers/appHelper';
import { CardComponent } from '../common/CardComponent';
import TableComponent from '../common/TableComponent';

// approval_status = 10 is Rejected — this is the only status this list shows.
const REJECTED_STATUS = 10;

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBadge = () => (
    <span style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 6,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
        background: '#fbe6e6', color: '#d64545', whiteSpace: 'nowrap',
    }}>
        REJECTED
    </span>
);

function InvoiceReceiptRejectedlist() {
    const history = useHistory();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [invoiceList, setInvoiceList] = useState([]);

    const fetchInvoiceList = useCallback(() => {
        if (!UserDetails.USERID) return;
        apiPostMethod(`${apiBaseUrl}FIPaymentController/GetFIPaymentList`, {
            startCount: 0, pageSize: 100000,
            approvalStatus: REJECTED_STATUS, userid: UserDetails.USERID,
        })
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setInvoiceList(data.results || []);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            });
    }, [UserDetails.USERID]);

    useEffect(() => {
        fetchInvoiceList();
    }, [fetchInvoiceList]);

    const handleEdit = (row) => {
        history.push(`/VENDORINVOICEEDIT:${row.payment_id}`);
    };

    const columns = [
        { name: 'Vendor Name', selector: (row) => row.vendor_name, sortable: true, minWidth: '160px' },
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
            name: 'Status', minWidth: '120px',
            cell: () => <StatusBadge />,
        },
        {
            name: 'Action',
            minWidth: '110px',
            cell: (row) => (
                <Button.Ripple color="primary" size="sm" onClick={() => handleEdit(row)}>
                    EDIT
                </Button.Ripple>
            ),
        },
    ];

    return (
        <CardComponent header="Rejected Invoice List">
            <TableComponent columns={columns} data={invoiceList} />
        </CardComponent>
    );
}

export default InvoiceReceiptRejectedlist;
