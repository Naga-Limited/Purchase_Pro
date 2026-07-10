import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, uploadUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";

export const taColumns = [
    {
        name: "VA Number",
        selector: "VANumber",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Truck No",
        selector: "truckNo",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "PO Number",
        selector: "ZPO_NUMBER",
        sortable: true,
        minWidth: "100px",
    },{
        name: "Eway-Bill Number",
        selector: "EwayBillNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Delivery Number",
        selector: "DeliveryNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Wheat Variety",
        selector: "WheatVariety",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "Loading Plant",
        selector: "Plant",
        sortable: true,
        minWidth: "100px",
    }, 
    {
        name: "Loading BIN No",
        selector: "BulkSiloNo",
        sortable: true,
        minWidth: "100px",
    },{
        name: "Receiving Plant",
        selector: "ReceivingPlant",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading Bin",
        selector: "unloadReceivingBin",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Loading GateIN By",
        selector: "SECGateInBy",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Loading GateIN DATE",
        selector: "SECGateInDt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Loading First Weight",
        selector: "FirstWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Loading First Weight By",
        selector: "SECFirstWeightEntryByName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Loading First Weight DATE",
        selector: "SECFirstWeightEntryDt",
        sortable: true,
        minWidth: "200px",
    }, {
        name: "Loading STM Load BY",
        selector: "SECstm_LoadByName",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading STM Load DATE",
        selector: "SECstm_LoadDt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Loading STM_QC By",
        selector: "SECstm_QCByName",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading STM_QC DATE",
        selector: "SECstm_QCDt",
        sortable: true,
        minWidth: "200px",
    }, {
        name: "Loading  Second Weight",
        selector: "SecondWeight",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading  Second Weight By",
        selector: "SECSecondWeightEntryByName",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading  Second Weight DATE",
        selector: "SECSecondWeightEntryDt",
        sortable: true,
        minWidth: "200px",
    }, {
        name: "Loading  NET Weight",
        selector: "NetWeight",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading  GateOut By",
        selector: "SECGateOutByName",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Loading  GateOut DATE",
        selector: "SECGateOutDt",
        sortable: true,
        minWidth: "200px",
    }, {
        name: "Unloading GateIn By",
        selector: "RECGateInByName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading GateIn DATE",
        selector: "RECGateInDt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Unloading First Weight",
        selector: "unloadFirstWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading First Weight By",
        selector: "RECFirstWeightEntryByName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading First Weight DATE",
        selector: "RECFirstWeightEntryDt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Unloading Second Weight",
        selector: "unloadSecondWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading Second Weight By",
        selector: "RECSecondWeightEntryByName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading Second Weight DATE",
        selector: "RECSecondWeightEntryDt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Unloading NetWeight",
        selector: "unloadNetWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading GateOut By",
        selector: "RECGateOutByName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unloading GateOut DATE",
        selector: "RECGateOutDt",
        sortable: true,
        minWidth: "200px",
    },
];

const CSTMREPORT = ({ title, url, actionRenderer }) => {
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
        };

        console.log(postdata);
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Report/getSilotomilldetailsforreport", postdata)
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

    const columns = [...taColumns];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>SILO-TO-MILL-Report</CardTitle>
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

                    </Row>
                    <Col md="12" sm="12">
                        <br></br>
                        <FormGroup className="d-flex mb-0 justify-content-end">
                            <Button.Ripple
                                color="primary"
                                id="add"
                                type="button"
                                onClick={handleFilter}
                            >
                                SHOW
                            </Button.Ripple>
                        </FormGroup>
                    </Col>
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

export default CSTMREPORT;
