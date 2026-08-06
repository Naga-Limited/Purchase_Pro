import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { Row, Col, FormGroup } from "reactstrap";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";

const recentColumns = [
    { name: "RECEIVING PLANT", selector: "reciving_plant_code", sortable: true, minWidth: "140px" },
    { name: "SALES PLANT", selector: "sales_plant_code", sortable: true, minWidth: "120px" },
    { name: "CUSTOMER", selector: "customer_name", sortable: true, minWidth: "160px" },
    { name: "SALES ORDER NO", selector: "sales_order_no", sortable: true, minWidth: "140px" },
    {
        name: "STOCK", selector: "stock", sortable: true, minWidth: "120px",
        cell: (row) => Number(row.stock || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 }),
    },
    { name: "CREATED AT", selector: "created_at", sortable: true, minWidth: "150px" },
];

const plantTotalColumns = [
    { name: "PLANT CODE", selector: "plant_code", sortable: true },
    {
        name: "TOTAL STOCK", selector: "total_stock", sortable: true,
        cell: (row) => Number(row.total_stock || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 }),
    },
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 3 });

const FiEntryStockDashboard = () => {
    const { showLoader, hideLoader } = useLoader();
    const [summary, setSummary] = useState(null);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit: () => { },
    });

    const loadDashboard = (customerCode) => {
        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/getFiEntryStockDashboard", { customerCode })
            .then(({ data }) => {
                if (data.success === 1 || data.success === true) {
                    setSummary(data.results || null);
                } else {
                    errorToast(data.message || "Failed to load FI Entry Stock Dashboard");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    useEffect(() => {
        loadDashboard(form.values.customer_code?.value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.customer_code]);

    return (
        <Fragment>
            <Row style={{ marginBottom: "16px" }}>
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
            </Row>

            <Row>
                <Col md="3" sm="6">
                    <CardComponent header="Total Inward Stock">
                        <h3 className="text-success">{formatNumber(summary?.total_inward)}</h3>
                    </CardComponent>
                </Col>
                <Col md="3" sm="6">
                    <CardComponent header="Total Outward Stock">
                        <h3 className="text-danger">{formatNumber(summary?.total_outward)}</h3>
                    </CardComponent>
                </Col>
                <Col md="3" sm="6">
                    <CardComponent header="Net Stock">
                        <h3>{formatNumber(summary?.net_stock)}</h3>
                    </CardComponent>
                </Col>
                <Col md="3" sm="6">
                    <CardComponent header="Incomplete Entries">
                        <h3 className="text-warning">{summary?.incomplete_count ?? 0}</h3>
                    </CardComponent>
                </Col>
            </Row>

            <Row>
                <Col md="6" sm="12">
                    <CardComponent header="Receiving Plant Totals">
                        <TableComponent columns={plantTotalColumns} data={summary?.receiving_plant_totals || []} />
                    </CardComponent>
                </Col>
                <Col md="6" sm="12">
                    <CardComponent header="Sales Plant Totals">
                        <TableComponent columns={plantTotalColumns} data={summary?.sales_plant_totals || []} />
                    </CardComponent>
                </Col>
            </Row>

            <Row>
                <Col md="12" sm="12">
                    <CardComponent header="Recent Entries">
                        <TableComponent columns={recentColumns} data={summary?.recent_entries || []} />
                    </CardComponent>
                </Col>
            </Row>
        </Fragment>
    );
};

export default FiEntryStockDashboard;
