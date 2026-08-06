import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button, FormGroup, Badge } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { ArrowDown, Eye, X } from 'react-feather';
import { HrLine } from '../common/HrLine';
import { useFormik } from 'formik';
import moment from 'moment';
import TableComponent from '../common/TableComponent';
import { apiBaseUrl } from '../../urlConstants';
import { apiPostMethod } from '@helpers/axiosHelper';
import { errorToast } from '@helpers/appHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import { Yup } from '../forms/custom-form';
import { DatePicker } from '../forms/custom-datetime';

const currency = (n) =>
    `INR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateCell = (field) => (row) => (row[field] ? moment(row[field]).format('DD-MMM-YYYY') : '-');
const dateTimeCell = (field) => (row) => (row[field] ? moment(row[field]).format('DD-MMM-YYYY HH:mm') : '-');
const recordTypeCell = (row) => (row.record_type === 'related_fi' ? 'Related to FI' : 'Non Related to FI');

// GetCreditMemoById returns one row per line item (header fields repeated) —
// same flattening convention as CreditMemoGFAVerification.js/CreditMemoEdit.js.
const extractLineItems = (rows) => {
    if (!Array.isArray(rows)) return [];
    return rows.filter((r) => r.line_id !== null && r.line_id !== undefined);
};

// Read-only "value box" for the modal's header section — same style as
// InvoiceMGApproval.js's Field component.
const Field = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4,
            }}>
                {label}
            </div>
            <div style={{ padding: '7px 10px', borderRadius: 6, background: '#f4f6f8', fontSize: 13, color: '#343a40' }}>
                {value}
            </div>
        </div>
    );
};

const baseColumns = [
    { name: 'Request No', selector: 'unique_credit_memo_no', sortable: true, minWidth: '160px' },
    { name: 'Request Date', selector: 'created_at', sortable: true, minWidth: '130px', cell: dateCell('created_at') },
    { name: 'Requested By', selector: 'requested_by', sortable: true, minWidth: '140px' },
    {
        name: 'Status',
        selector: 'approval_status_label',
        sortable: true,
        minWidth: '190px',
        cell: (row) => <Badge color="primary">{row.approval_status_label}</Badge>,
    },
    { name: 'Credit Memo Type', selector: 'record_type', sortable: true, minWidth: '160px', cell: recordTypeCell },
    { name: 'FI Doc No', selector: 'fi_doc_no', sortable: true, minWidth: '130px' },
    { name: 'FI Doc Date', selector: 'fi_doc_date', sortable: true, minWidth: '130px', cell: dateCell('fi_doc_date') },
    { name: 'Invoice Type', selector: 'invoice_type_name', sortable: true, minWidth: '130px' },
    { name: 'Vendor Code', selector: 'vendor_code', sortable: true, minWidth: '120px' },
    { name: 'Vendor Name', selector: 'vendor_name', sortable: true, minWidth: '200px' },
    { name: 'Division', selector: 'division', sortable: true, minWidth: '100px' },
    { name: 'Reason', selector: 'reason', sortable: true, minWidth: '160px' },
    { name: 'Memo No', selector: 'memo_no', sortable: true, minWidth: '130px' },
    { name: 'Memo Date', selector: 'memo_date', sortable: true, minWidth: '130px', cell: dateCell('memo_date') },
    { name: 'Posting Date', selector: 'posting_date', sortable: true, minWidth: '130px', cell: dateCell('posting_date') },
    { name: 'Amount', selector: 'amount', sortable: true, minWidth: '130px', cell: (row) => currency(row.amount) },
    { name: 'Total Deduction Amount', selector: 'total_amount', sortable: true, minWidth: '170px', cell: (row) => currency(row.total_amount) },
    { name: 'Original Invoice Amount', selector: 'original_invoice_total_amount', sortable: true, minWidth: '180px', cell: (row) => (row.original_invoice_total_amount != null ? currency(row.original_invoice_total_amount) : '-') },
    { name: 'Account No', selector: 'account_no', sortable: true, minWidth: '130px' },
    { name: 'Business Area', selector: 'business_area', sortable: true, minWidth: '120px' },
    { name: 'Bank A/C No', selector: 'bank_account_no', sortable: true, minWidth: '150px' },
    { name: 'Bank IFSC', selector: 'bank_ifsc_code', sortable: true, minWidth: '120px' },
    { name: 'House Bank Id', selector: 'house_bank_id', sortable: true, minWidth: '130px' },
    { name: 'House Bank A/C No', selector: 'house_bank_ac_no', sortable: true, minWidth: '150px' },
    { name: 'TDS Code', selector: 'tds_code', sortable: true, minWidth: '100px' },
    { name: 'TDS Description', selector: 'tds_description', sortable: true, minWidth: '160px' },
    { name: 'SAP Posting Date', selector: 'sap_posting_date', sortable: true, minWidth: '140px', cell: dateCell('sap_posting_date') },
    { name: 'SAP Document No', selector: 'sap_document_no', sortable: true, minWidth: '150px' },
    { name: 'Payment Voucher No', selector: 'payment_voucher_no', sortable: true, minWidth: '170px' },
    { name: 'UTR Number', selector: 'utr_number', sortable: true, minWidth: '150px' },
    { name: 'Manager Approved At', selector: 'mg_approved_at', sortable: true, minWidth: '170px', cell: dateTimeCell('mg_approved_at') },
    { name: 'Store Acknowledged At', selector: 'stores_approved_at', sortable: true, minWidth: '180px', cell: dateTimeCell('stores_approved_at') },
    { name: 'GFA Posted At', selector: 'gfa_posted_at', sortable: true, minWidth: '170px', cell: dateTimeCell('gfa_posted_at') },
    { name: 'Rejected At', selector: 'rejected_at', sortable: true, minWidth: '160px', cell: dateTimeCell('rejected_at') },
    { name: 'Rejection Remarks', selector: 'rejection_remarks', sortable: true, minWidth: '220px' },
];

function CreditMemoReport() {
    const { showLoader, hideLoader } = useLoader();
    const [reportData, setReportData] = useState([]);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewLineItems, setViewLineItems] = useState([]);
    const [viewHeader, setViewHeader] = useState(null);

    // The report row already carries every header field the report query
    // selects, so the modal's header section needs no extra fetch — only the
    // line items (not part of the report's own header-primary query) come
    // from GetCreditMemoById.
    const handleViewClick = async (row) => {
        setViewHeader(row);
        setViewLineItems([]);
        setViewModalOpen(true);
        setViewLoading(true);
        try {
            const res = await apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoById`, { id: row.credit_memo_id });
            const { data } = res;
            if (data?.success) {
                setViewLineItems(extractLineItems(data.results));
            } else {
                errorToast(data?.message || 'Unable to load line item details');
            }
        } catch (e) {
            errorToast('Something went wrong, please try again after sometime');
        } finally {
            setViewLoading(false);
        }
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewLineItems([]);
        setViewHeader(null);
    };

    const columns = [
        ...baseColumns,
        {
            name: 'Action',
            minWidth: '100px',
            cell: (row) => (
                <Button color="primary" size="sm" onClick={() => handleViewClick(row)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={12} /> View
                </Button>
            ),
        },
    ];

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() {},
    });

    const fetchReport = () => {
        const { date } = form.values;
        if (!date) return;

        const fromDate = moment(date.start).format('YYYY-MM-DD');
        const toDate = moment(date.end).format('YYYY-MM-DD');

        showLoader();
        apiPostMethod(`${apiBaseUrl}CreditMemoController/GetCreditMemoReport`, { fromDate, toDate })
            .then((response) => {
                const { data } = response;
                if (data?.success) {
                    setReportData(data.results || []);
                } else {
                    errorToast(data?.message || 'Unable to load Credit Memo report');
                    setReportData([]);
                }
            })
            .catch(() => {
                errorToast('Something went wrong, please try again after sometime');
            })
            .finally(() => hideLoader());
    };

    return (
        <div>
            <Card>
                <CardHeader><h5>Credit Memo Report</h5></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="6">
                            <DatePicker form={form} id="date" isDateRange label="Date Range" />
                        </Col>
                        <Col md="2" sm="6">
                            <FormGroup className="mt-2">
                                <Button color="primary" type="button" onClick={fetchReport} disabled={!form.values.date}>
                                    View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                    <TableComponent showDownload fileName="Credit_Memo_Report" sheetName="Credit Memo Report" columns={columns} data={reportData} />
                </CardBody>
            </Card>

            <Modal show={viewModalOpen} onHide={closeViewModal} centered size="xl">
                <Modal.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 600, color: '#343a40' }}>
                        Credit Memo Request — {viewHeader?.unique_credit_memo_no}
                    </Modal.Title>
                    <button type="button" className="close" onClick={closeViewModal}>
                        <X size={18} />
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {viewHeader && (
                        <>
                            <Row>
                                <Col md="2" sm="6" xs="6"><Field label="Request No" value={viewHeader.unique_credit_memo_no} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Request Date" value={dateCell('created_at')(viewHeader)} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Requested By" value={viewHeader.requested_by} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Status" value={<Badge color="primary">{viewHeader.approval_status_label}</Badge>} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Credit Memo Type" value={recordTypeCell(viewHeader)} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Division" value={viewHeader.division} /></Col>
                            </Row>
                            <Row>
                                <Col md="2" sm="6" xs="6"><Field label="Vendor Code" value={viewHeader.vendor_code} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Vendor Name" value={viewHeader.vendor_name} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Memo No" value={viewHeader.memo_no} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Memo Date" value={dateCell('memo_date')(viewHeader)} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="FI Doc No" value={viewHeader.fi_doc_no} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="FI Doc Date" value={dateCell('fi_doc_date')(viewHeader)} /></Col>
                            </Row>
                            <Row>
                                <Col md="2" sm="6" xs="6"><Field label="Amount" value={currency(viewHeader.amount)} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Total Deduction Amount" value={currency(viewHeader.total_amount)} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Business Area" value={viewHeader.business_area} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Bank A/C No" value={viewHeader.bank_account_no} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="Bank IFSC" value={viewHeader.bank_ifsc_code} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="SAP Document No" value={viewHeader.sap_document_no} /></Col>
                            </Row>
                            <Row>
                                <Col md="2" sm="6" xs="6"><Field label="Payment Voucher No" value={viewHeader.payment_voucher_no} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="UTR Number" value={viewHeader.utr_number} /></Col>
                                <Col md="2" sm="6" xs="6"><Field label="TDS Code" value={viewHeader.tds_code} /></Col>
                                <Col md="4" sm="6" xs="6"><Field label="TDS Description" value={viewHeader.tds_description} /></Col>
                            </Row>
                            <HrLine />
                        </>
                    )}
                    {viewLoading ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>Loading line items…</div>
                    ) : viewLineItems.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>No line items found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#1900ff', borderBottom: '1px solid #dee2e6' }}>
                                        {[
                                            'Expense Type', 'GL Code', 'GL Description', 'Budget', 'Amount',
                                            'Deduction Amount', 'Cost Centre', 'Tax Type', 'Tax Code', 'Tax Description',
                                            'Base Amt', 'CGST', 'SGST', 'IGST', 'Text', 'Profit Centre',
                                            'Profit Centre Desc', 'HSN/SAC',
                                        ].map((col) => (
                                            <th key={col} style={{
                                                padding: '8px 6px', textAlign: 'left', whiteSpace: 'nowrap',
                                                fontWeight: 600, color: '#ffffff', borderRight: '1px solid #e9ecef',
                                            }}>
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewLineItems.map((item) => (
                                        <tr key={item.line_id} style={{ borderBottom: '1px solid #f1f2f4' }}>
                                            <td style={{ padding: '6px' }}>{item.expense_type_name || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.gl_code || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.gl_description || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.budget != null ? currency(item.budget) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{currency(item.line_amount)}</td>
                                            <td style={{ padding: '6px' }}>{item.deduction_amount != null ? currency(item.deduction_amount) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.cost_center_name || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.tax_type || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.tax_code || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.tax_description || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.base_amount != null ? currency(item.base_amount) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.cgst_amount != null ? currency(item.cgst_amount) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.sgst_amount != null ? currency(item.sgst_amount) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.igst_amount != null ? currency(item.igst_amount) : '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.item_text || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.profit_center || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.profit_center_description || '-'}</td>
                                            <td style={{ padding: '6px' }}>{item.hsn_sac || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8f9fa' }}>
                    <Button color="secondary" size="sm" onClick={closeViewModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default CreditMemoReport;
