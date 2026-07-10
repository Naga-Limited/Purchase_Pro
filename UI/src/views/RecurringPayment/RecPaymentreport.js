import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, uploadUrl } from "../../urlConstants";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import DateComponent from '../common/dateComponent';
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";


export const taColumns = [
    {
        name: "Unique Number",
        selector: "rpd_unique_trans_id",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Paymnet To Type",
        selector: "payment_to_type_name",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Payment To Sub-type",
        selector: "payment_to_subtype_name",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "Payment frequency",
        selector: "payment_frequency_name",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Method",
        selector: "amount_paid_method",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Agreement Start Date",
        selector: "agreement_start_date_formatted",
        sortable: true,
        minWidth: "130px",
    },
    {
        name: "Agreement End Date",
        selector: "agreement_end_date_formatted",
        sortable: true,
        minWidth: "130px",
    },
    {
        name: "Invoice Number",
        selector: "invoice_no",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "Invoice Date",
        selector: "invoice_date",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "TDS Status",
        selector: "tds_status",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "TAX",
        selector: "tax",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "TDS",
        selector: "tds",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "Plant",
        selector: "plant_code",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "Document Number",
        selector: "sap_doc_number",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "TAX",
        selector: "tax",
        sortable: true,
        minWidth: "80px",
    },
    {
        name: "Vendor",
        selector: "vendor",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "HSN CODE",
        selector: "hsn_code",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Account Number",
        selector: "account_number",
        sortable: true,
        minWidth: "160px",
    }, {
        name: "IFSC Code",
        selector: "account_ifsc_code",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "GL Code",
        selector: "gl_code",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "House Bank",
        selector: "house_bank",
        sortable: true,
        minWidth: "80px",
    }, {
        name: "Cost Centre",
        selector: "cost_centre",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Profit Centre",
        selector: "profit_centre",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Department MG",
        selector: "dep_mg_approved_name",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Department MG Approval",
        selector: "dep_mg_approved_at",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Account MG",
        selector: "acc_mg_approved_name",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Accounts MG Approval",
        selector: "acc_mg_approved_at",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Rejected By",
        selector: "rejected_by_name",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Rejected At",
        selector: "rejected_at",
        sortable: true,
        minWidth: "160px",
    },

    {
        name: "Status",
        selector: "status_text",
        sortable: true,
        minWidth: "150px",
        wrap: true,
        cell: (row) => {
            const color = row.status == 5 ? "danger" : "primary";
            return <Badge color={color}>{row.status_text}</Badge>;
        },
    },

    {
        name: "Invoice Copy",
        selector: "invoice_attachment",
        sortable: false,
        minWidth: "150px",
        cell: (row) => {
            if (row.status == 5) return null;  // ❌ Hide for rejected rows

            return (
                <FormGroup className="d-flex justify-content-start mb-0">
                    <a target="_blank" href={row?.invoice_attachment}>
                        <Button outline color="success" type="button">
                            Invoice Copy
                        </Button>
                    </a>
                </FormGroup>
            );
        },
    },

];

const CrecPaymentReport = ({ title, url, actionRenderer }) => {
    const history = useHistory();
    const [tableData, setTableData] = useState([]);
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rows: Yup.array().of(Yup.object().shape({})),
        }),
        onSubmit(values) { },
    });

    let { showLoader, hideLoader } = useLoader();
    const formData = form.values;

    const loadTableData = async () => {
        const formData = form.values;
        const fromDate = new Date(moment(formData.date.start).format("YYYY-MM-DD"));
        const toDate = new Date(moment(formData.date.end).format("YYYY-MM-DD"));
        const postdata = {
            fromDate,
            toDate,
            user_plantid: UserDetails.plantids.toString(),
            payment_to_type: formData.payment_to_type?.value || null,
            payment_to_sub_type: formData.payment_to_sub_type?.label || null,

        };

        console.log(postdata);

        showLoader();
        apiPostMethod(apiBaseUrl + "RecurringPaymentController/getreportdetialsforrecpayment", postdata)
            .then((response) => {
                const { data } = response;
                if (data && data.length > 0) {
                    setTableData(data);
                } else {
                    errorToast("No data found");
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after some time");
            })
            .finally(() => {
                hideLoader();
            });
    };

    const handleFilter = () => {
        const values = form.values;
        loadTableData();
    };

    const UserDetails = useSelector((state) =>
        state && state.auth ? state.auth.userData : {}
    );
    const [dependentOptions, setDependentOptions] = useState([]);
    const fetchDependentOptions = async (paymentToTypeId) => {
        try {
            const res = await apiPostMethod(
                `${apiBaseUrl}RecurringPaymentController/Getpaymenttosubtypeinfo`,
                { paymentToTypeId }
            );
            setDependentOptions(res?.data?.results || []);
        } catch (err) {
            errorToast("Failed to load sub category list");
            setDependentOptions([]);
        }
    };
    const columns = [...taColumns];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recurring-Payment-Report</CardTitle>
                </CardHeader>
                <CardComponent>
                    <Row>
                        <Col md="4" sm="12">
                            <DatePicker
                                form={form}
                                id="date"
                                isDateRange
                                label={"Date Range"}
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RecurringPaymentController/Getpaymenttotypeinfo`}
                                    id="payment_to_type"
                                    name="payment_to_type"
                                    form={form}
                                    onChange={(selected) => {
                                        form.setFieldValue("payment_to_type", selected);
                                        if (selected?.label) fetchDependentOptions(selected.label);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Payment Sub Type</Label>
                                <CustomDropdownInput
                                    name="payment_to_sub_type"
                                    id="payment_to_sub_type"
                                    form={form}
                                    options={dependentOptions}
                                    onChange={(selected) => form.setFieldValue("payment_to_sub_type", selected)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup className="d-flex mb-0 justify-content-end">
                                <Button.Ripple
                                    color="primary"
                                    id="add"
                                    type="button"
                                    onClick={handleFilter}
                                >
                                    Filter
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardComponent>
                <CardBody>
                    <TableComponent
                        showDownload
                        columns={columns}
                        data={tableData}
                    />
                </CardBody>
            </Card>

        </div>
    );
};

export default CrecPaymentReport;
