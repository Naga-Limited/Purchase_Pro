import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Label,
    Input,
    Col,
    Row,
} from "reactstrap";

import { useHistory } from "react-router-dom";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import Uploader from "../Uploader"; // kept if you want to enable re-upload later
import { HrLine } from "../common/HrLine";

const taColumns = [
    { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
    { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
    { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
    { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
    { name: "Payment frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
    {
        name: "Payment times",
        // selector: "no_of_courier",
        cell: (row) => {
            return (
                <>
                    <div>{row.payment_rem_count + ' / ' + row.payment_times}</div>
                </>
            );
        },
        sortable: true,
        minWidth: "80px",
    },
    { name: "Plant Code", selector: "plant_code", sortable: true, minWidth: "100px" },
];

const CrecPaymentDetailsDEPMGAPPROVE = ({ title, url, actionRenderer }) => {
    const history = useHistory();
    const [data, setData] = useState([]); // used for inner table if you need it
    const [tableData, setTableData] = useState([]);
    const [remarks, setRemarks] = useState("");
    const { showLoader, hideLoader } = useLoader();
    const [selectedRow, setSelectedRow] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);

    const [defaultDateRange] = useState({
        start: moment().startOf("month").toDate(),
        end: moment().endOf("month").toDate(),
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    // Add TDS and TAX as form fields so they are editable via dropdowns
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            date: defaultDateRange,
            tds_code: "",
            tax: "",
        },
        validationSchema: Yup.object().shape({
            rows: Yup.array().of(Yup.object().shape({})),
        }),
        onSubmit(values) { },
    });

    useEffect(() => {
        loadTableData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTableData = async () => {
        const postdata = {
            user_plantid: UserDetails.plantids ? UserDetails.plantids.toString() : "",
        };
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentdetailsforapproval", postdata);
            const { data } = response;
            if (data.success) {
                if ((data.results || []).length === 0) {
                    errorToast("No payment details found");
                    setTableData([]);
                } else setTableData(data.results);
            } else errorToast("Failed to fetch payment details");
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };

    const handleApprove = (row) => {
        setSelectedRow(row);
        // open small remarks modal
        setApproveModalOpen(true);
    };

    const handleReject = (row) => {
        setSelectedRow(row);
        setRejectModalOpen(true);
    };

    // Approve confirmation: include tds, tax, invoice fields, amount, difference, attachment
    const handleApproveConfirmation = async (row) => {
        const postdata = {
            id: row.rpd_id,
            remarks: remarks,
            approved_by: UserDetails.USERID,
        };

        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/recpaymentrenewalapprovaldepartmentMG", postdata);
            const { data } = response;
            if (data && data.success) {
                ShowToast("Payment Was Approved Successfully");
                setApproveModalOpen(false);
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast((data && data.message) || "Failed to approve payment item");
            }
        } catch (error) {
            console.error(error);
            errorToast("Something went wrong, please try again after some time");
        } finally {
            hideLoader();
        }
    };

    const handleRejectConfirmation = async (row) => {
        const postdata = { id: row.rpd_id, remarks: remarks, approved_by: UserDetails.USERID };
        if (!postdata.remarks) { errorToast("Please Enter Remarks"); return; }
        showLoader();
        try {
            const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Rejectrecpaymentdetails", postdata);
            const { data } = response;
            if (data.success == true) {
                ShowToast("Payment  rejected successfully");
                setRejectModalOpen(false);
                setViewModalOpen(false);
                setTimeout(() => window.location.reload(), 2000);
            } else errorToast("Failed to reject Payment item");
        } catch (error) {
            errorToast("Something went wrong, please try again after some time");
        } finally { hideLoader(); }
    };

    const handleViewModalOpen = (row) => {
        setSelectedConsignment(row || null);
        setData(row?.details || []);
        setViewModalOpen(true);
    };

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "50px",
        cell: (row) => (
            <>
                <Button.Ripple color="primary" onClick={() => handleViewModalOpen(row)}>
                    View
                </Button.Ripple>
                &nbsp;
            </>
        ),
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring Payment Entry Department MG Approval</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent showDownload columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* VIEW MODAL */}
            <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} centered size="xl">
                <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>View Payment Details</ModalHeader>
                <ModalBody>
                    {/* General Info header */}
                    <h4 className="text-primary"><u>General Info</u></h4>
                    <br />

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Unique Transaction ID</Label>
                                <Input type="text" value={selectedConsignment?.rpd_unique_trans_id || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Division</Label>
                                <Input type="text" value={selectedConsignment?.division || ''} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Department</Label>
                                <Input type="text" value={selectedConsignment?.department || ''} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <Input type="text" value={selectedConsignment?.payment_to_type_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <Input type="text" value={selectedConsignment?.payment_to_subtype_name || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Frequency</Label>
                                <Input type="text" value={selectedConsignment?.payment_frequency_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount Method</Label>
                                <Input type="text" value={selectedConsignment?.amount_paid_method || selectedConsignment?.amount_paid_method_name || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Plant Code</Label>
                                <Input type="text" value={selectedConsignment?.plant_code || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount / Budget</Label>
                                <Input type="text" value={selectedConsignment?.amount_budget || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Description</Label>
                                <Input type="text" value={selectedConsignment?.description || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Day</Label>
                                <Input type="text" value={selectedConsignment?.payment_date || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement Start</Label>
                                <Input type="text" value={selectedConsignment?.agreement_start_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Agreement End</Label>
                                <Input type="text" value={selectedConsignment?.agreement_end_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Created By</Label>
                                <Input type="text" value={selectedConsignment?.FIRST_NAME || selectedConsignment?.created_by || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <HrLine />
                    <h4 className="text-primary mt-3"><u>Vendor & GL Details</u></h4>
                    <br />
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor</Label>
                                <Input type="text" value={selectedConsignment?.vendor || selectedConsignment?.vendor_name || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Vendor Name</Label>
                                <Input type="text" value={selectedConsignment?.vendorname || selectedConsignment?.vendorname || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account Number</Label>
                                <Input type="text" value={selectedConsignment?.account_number || selectedConsignment?.BANK_ACCOUNT || selectedConsignment?.BANK_ACC_NO || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Account IFSC Code</Label>
                                <Input type="text" value={selectedConsignment?.account_ifsc_code || selectedConsignment?.IFSC_CODE || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>GL Code</Label>
                                <Input type="text" value={selectedConsignment?.gl_code || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Cost Centre</Label>
                                <Input type="text" value={selectedConsignment?.cost_centre || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Profit Centre</Label>
                                <Input type="text" value={selectedConsignment?.profit_centre || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank</Label>
                                <Input type="text" value={selectedConsignment?.house_bank || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>House Bank Id</Label>
                                <Input type="text" value={selectedConsignment?.house_bank_id || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" href={selectedConsignment?.agreement_copy}>
                                    <Button outline color="success" type="button">
                                        Agreement Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" href={selectedConsignment?.mail_copy}>
                                    <Button outline color="success" type="button">
                                        Mail Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                    </Row>
                    <HrLine />

                    <h4 className="text-primary mt-3"><u>Invoice & Amount Details</u></h4>
                    <br />
                    {/* Invoice & Amount Details (ADDED) */}
                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Invoice Number</Label>
                                <Input type="text" value={selectedConsignment?.invoice_no || ""} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Invoice Date</Label>
                                <Input type="text" value={selectedConsignment?.invoice_date || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Amount</Label>
                                <Input type="text" value={selectedConsignment?.amount || ""} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Difference Amount</Label>
                                <Input type="text" value={selectedConsignment?.difference_amount || selectedConsignment?.differenceAmount || ""} disabled />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <a target="_blank" href={selectedConsignment?.invoice_attachment}>
                                    <Button outline color="success" type="button">
                                        Invoice Copy
                                    </Button>
                                </a>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col sm="6" className="d-flex justify-content-start">
                            <Button.Ripple color="danger" onClick={() => handleReject(selectedConsignment)}>Reject</Button.Ripple>
                        </Col>

                        <Col sm="6" className="d-flex justify-content-end">
                            <Button.Ripple color="primary" onClick={() => handleApprove(selectedConsignment)}>Approve</Button.Ripple>
                            &nbsp;
                            <Button color="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            {/* APPROVE MODAL (collect remarks) */}
            <Modal isOpen={approveModalOpen} toggle={() => setApproveModalOpen(!approveModalOpen)} className="modal-dialog-centered">
                <ModalHeader toggle={() => setApproveModalOpen(!approveModalOpen)}>Approve Item</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="remarks">Remarks:</Label>
                        <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => handleApproveConfirmation(selectedRow)}>Confirm Approve</Button>
                </ModalFooter>
            </Modal>

            {/* REJECT MODAL */}
            <Modal isOpen={rejectModalOpen} toggle={() => setRejectModalOpen(!rejectModalOpen)} className="modal-dialog-centered">
                <ModalHeader toggle={() => setRejectModalOpen(!rejectModalOpen)}>Rejection Remarks</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="remarks">Remarks:</Label>
                        <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => handleRejectConfirmation(selectedRow)}>Confirm Reject</Button>
                    <Button color="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default CrecPaymentDetailsDEPMGAPPROVE;
