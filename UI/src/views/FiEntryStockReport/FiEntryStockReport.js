import React, { Fragment, useState } from "react";
import moment from "moment";
import { useFormik } from "formik";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Card, CardHeader, CardBody, FormGroup } from "reactstrap";
import { ArrowDown } from "react-feather";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { DatePicker } from "../forms/custom-datetime";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import TableComponent from "../common/TableComponent";

const STATUS_OPTIONS = [
    { value: "1", label: "Open" },
    { value: "2", label: "Completed" },
];

const columns = [
    { name: "RECEIVING PLANT", selector: "reciving_plant_code", sortable: true, minWidth: "140px" },
    { name: "SALES PLANT", selector: "sales_plant_code", sortable: true, minWidth: "120px" },
    { name: "CUSTOMER CODE", selector: "customer_code", sortable: true, minWidth: "130px" },
    { name: "CUSTOMER NAME", selector: "customer_name", sortable: true, minWidth: "160px" },
    { name: "SALES ORDER NO", selector: "sales_order_no", sortable: true, minWidth: "140px" },
    { name: "SALES RETURN ORDER NO", selector: "sales_return_order_no", sortable: true, minWidth: "140px" },
    {
        name: "STOCK", selector: "stock", sortable: true, minWidth: "120px",
        cell: (row) => Number(row.stock || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 }),
    },
    {
        name: "STATUS", selector: "status", sortable: true, minWidth: "110px",
        cell: (row) => (Number(row.status) === 2 ? "Completed" : "Open"),
    },
    { name: "CREATED AT", selector: "created_at", sortable: true, minWidth: "150px" },
];

const FiEntryStockReport = () => {
    const { showLoader, hideLoader } = useLoader();
    const [reportData, setReportData] = useState([]);
    const [searched, setSearched] = useState(false);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit: () => { },
    });

    const getReportData = () => {
        const dateRange = form.values.date;
        if (!dateRange?.start || !dateRange?.end) {
            errorToast("Please select a Date Range");
            return;
        }
        const fromDate = moment(dateRange.start).format("YYYY-MM-DD");
        const toDate = moment(dateRange.end).format("YYYY-MM-DD");

        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getFiEntryStockReport", {
            fromDate,
            toDate,
            customerCode: form.values.customer_code?.value,
            plantCode: form.values.plant_code,
            status: form.values.status?.value,
        })
            .then(({ data }) => {
                setSearched(true);
                if (data.success === 1 || data.success === true) {
                    setReportData(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load FI Entry Stock Report");
                    setReportData([]);
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h5 style={{ margin: 0 }}>FI Entry Stock Report</h5>
                </CardHeader>
                <hr />
                <CardBody>
                    <Row style={{ alignItems: "flex-end", marginBottom: "16px" }}>
                        <Col md="3" sm="6">
                            <DatePicker form={form} id="date" isDateRange label="Date Range" />
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Customer Code</label>
                                <CustomDropdownInput
                                    url={apiBaseUrl + "CustomMillingMasterController/getFiEntryStockCustomerList"}
                                    form={form}
                                    id="customer_code"
                                />
                            </FormGroup>
                        </Col>
                        {/* <Col md="2" sm="6">
                            <FormGroup>
                                <label>Plant Code</label>
                                <CustomTextInput form={form} id="plant_code" />
                            </FormGroup>
                        </Col> */}
                        <Col md="3" sm="6">
                            <FormGroup>
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    value={form.values.status?.value || ""}
                                    onChange={(e) => {
                                        const option = STATUS_OPTIONS.find((o) => o.value === e.target.value);
                                        form.setFieldValue("status", option || null);
                                    }}
                                >
                                    <option value="">All</option>
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </FormGroup>
                        </Col>
                        <Col md="2" sm="6">
                            <FormGroup>
                                <Button
                                    color="primary"
                                    type="button"
                                    onClick={getReportData}
                                    disabled={form.values.date == undefined}
                                >
                                    View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                    {searched ? (
                        <TableComponent showDownload columns={columns} data={reportData} />
                    ) : (
                        <p style={{ textAlign: "center", color: "#aaa", padding: "24px" }}>
                            Select a Date Range and click View to load the report
                        </p>
                    )}
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default FiEntryStockReport;
