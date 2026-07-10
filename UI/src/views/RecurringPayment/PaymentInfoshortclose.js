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
    FormGroup,
    Label,
    Input,
    Col,
    Row
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import { HrLine } from "../common/HrLine";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

/* ================= TABLE COLUMNS ================= */
const taColumns = [
    { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
    { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
    { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
    { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
    { name: "Payment Frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
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

const CrecPaymentInfoDEPMGAPPROVE = () => {
    const history = useHistory();
    const { showLoader, hideLoader } = useLoader();

    const [tableData, setTableData] = useState([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);
    const [remarks, setRemarks] = useState("");

    const UserDetails = useSelector(
        (state) => state?.auth?.userData || {}
    );

    const form = useFormik({
        initialValues: {},
        onSubmit() { }
    });

    useEffect(() => {
        loadTableData();
    }, []);

    /* ================= LOAD TABLE DATA ================= */
    const loadTableData = async () => {
        const postdata = {
            user_plantid: UserDetails?.plantids?.toString() || ""
        };
        showLoader();
        try {
            const response = await apiPostMethod(
                apiBaseUrl + "RecurringPaymentController/recpaymentinfo",
                postdata
            );
            if (response.data.success) {
                setTableData(response.data.results || []);
            } else {
                errorToast("Failed to fetch payment details");
            }
        } catch (err) {
            errorToast("Something went wrong");
        } finally {
            hideLoader();
        }
    };

    /* ================= VIEW ================= */
    const handleViewModalOpen = (row) => {
        setSelectedConsignment(row);
        setViewModalOpen(true);
    };

    const handleShortClose = async (row) => {
        if (!row) return;

        const msg = `Short Close:- ${row.payment_to_type_name} for Plant ${row.plant_code}`;

        confirmDialog({
            title: "Are you sure want to Short Close?",
            description: msg,
        }).then(async (confirmed) => {
            if (!confirmed) return;

            const postdata = {
                rp_id: row.rp_id,
                short_close_by: UserDetails.USERID,
            };

            showLoader();
            try {
                const response = await apiPostMethod(
                    apiBaseUrl + "RecurringPaymentController/shortCloseRecPayment",
                    postdata
                );

                if (response.data.success) {
                    ShowToast("Payment successfully Short Closed");
                    setViewModalOpen(false);
                    loadTableData(); // refresh table
                } else {
                    errorToast(response.data.message || "Short Close failed");
                }
            } catch (error) {
                errorToast("Something went wrong while short closing");
            } finally {
                hideLoader();
            }
        });
    };


    /* ================= ACTION COLUMN ================= */
    const actionsCol = {
        name: "Actions",
        minWidth: "80px",
        cell: (row) => (
            <Button.Ripple
                color="primary"
                size="sm"
                onClick={() => handleViewModalOpen(row)}
            >
                View
            </Button.Ripple>
        ),
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring Payment Info List</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* ================= VIEW MODAL ================= */}
            <Modal
                isOpen={viewModalOpen}
                toggle={() => setViewModalOpen(!viewModalOpen)}
                centered
                size="xl"
            >
                <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>
                    View Payment Details
                </ModalHeader>

                <ModalBody>
                    <h4 className="text-primary">
                        <u>General Info</u>
                    </h4>
                    <br />

                    <Row>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Unique Transaction ID</Label>
                                <Input type="text" value={selectedConsignment?.rp_unique_trans_id || ""} disabled />
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

                    {/* Vendor Details header */}
                    <h4 className="text-primary mt-3">
                        <u>Vendor & GL Details</u>
                    </h4>
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
                        <Col md="4" className="d-flex justify-content-start mb-0">
                            <a target="_blank" href={selectedConsignment?.agreement_copy} rel="noreferrer">
                                <Button outline color="success" type="button">
                                    Agreement Copy
                                </Button>
                            </a>
                        </Col>
                        <Col md="4" className="d-flex justify-content-start mb-0">
                            <a target="_blank" href={selectedConsignment?.mail_copy} rel="noreferrer">
                                <Button outline color="success" type="button">
                                    Mail Copy
                                </Button>
                            </a>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col sm="12" className="d-flex justify-content-end">
                            <Button.Ripple
                                color="danger"
                                onClick={() => handleShortClose(selectedConsignment)}
                            >
                                Short Close
                            </Button.Ripple>
                            &nbsp;
                            <Button
                                color="secondary"
                                onClick={() => setViewModalOpen(false)}
                            >
                                Close
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CrecPaymentInfoDEPMGAPPROVE;
