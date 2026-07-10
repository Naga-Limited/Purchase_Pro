import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Row,
    Col,
    Button
} from "reactstrap";

import { useSelector } from "react-redux";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import { DatePicker } from "../forms/custom-datetime";
import moment from "moment";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup } from "../forms/custom-form";

const CRegisterReport = () => {

    const { showLoader, hideLoader } = useLoader();

    const UserDetails = useSelector(
        state => state?.auth?.userData || {}
    );

    const [userPlant, setUserPlant] = useState([]);
    const [registerOptions, setRegisterOptions] = useState([]);
    const [registerMasterData, setRegisterMasterData] = useState([]);
    const [subtypeOptions, setSubtypeOptions] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    /* ================= FORMIK ================= */

    const form = useFormik({
        isInitialValid: false,

        initialValues: {
            date: {
                start: "",
                end: ""
            },
            masterPlantId: null,
            register: null,
            subtype: null
        },

        validationSchema: Yup.object().shape({
            rows: Yup.array().of(Yup.object().shape({}))
        }),

        onSubmit(values) { }
    });

    /* ================= LOAD USER PLANT ================= */

    useEffect(() => {

        const loadPlants = async () => {

            try {

                const res = await apiGetMethod(
                    apiBaseUrl +
                    `GatePro/Master/getUserPlant/${UserDetails.USERID}`
                );

                if (res.data.success) {
                    setUserPlant(res.data.results);
                }

            } catch {
                errorToast("Failed to load plant");
            }

        };

        if (UserDetails?.USERID) {
            loadPlants();
        }

    }, [UserDetails]);

    /* ================= LOAD REGISTER ================= */

    useEffect(() => {

        const loadRegisters = async () => {

            try {

                const res = await apiGetMethod(
                    apiBaseUrl + "RegisterController/getRegisterList"
                );

                if (res.data.success) {

                    setRegisterMasterData(res.data.results);

                    const formatted = res.data.results.map(r => ({
                        label: r.register_name,
                        value: r.register_id
                    }));

                    setRegisterOptions(formatted);
                }

            } catch {
                errorToast("Failed to load registers");
            }

        };

        loadRegisters();

    }, []);

    /* ================= FILTER ================= */

    const handleFilter = async () => {

        const formData = form.values;

        const fromDate = formData?.date?.start
            ? moment(formData.date.start).format("YYYY-MM-DD")
            : null;

        const toDate = formData?.date?.end
            ? moment(formData.date.end).format("YYYY-MM-DD")
            : null;

        const postData = {
            plant_code: formData.masterPlantId?.werks || null,
            register_id: formData.register?.value || null,
            subtype_id: formData.subtype?.value || null,
            fromDate,
            toDate
        };

         if(postData.register_id ==""||postData.register_id==undefined ){
              errorToast('Please Select Register Name');
                return false
            }
        showLoader();

        try {

            const res = await apiPostMethod(
                apiBaseUrl +
                "RegisterController/getRegisterReport",
                postData
            );

            if (
                res.data.success &&
                res.data.results.length > 0
            ) {

                const rawData = res.data.results;

                /* ================= GROUP DATA ================= */

                const groupedData = {};

                rawData.forEach(item => {

                    const key =
                        `${item.register_id}_${item.plant_code}_${item.created_at}_${item.created_by}`;

                    if (!groupedData[key]) {

                        groupedData[key] = {
                            register_name: item.register_name,
                            plant_code: item.plant_code,
                            created_by_name: item.created_by_name,
                            created_at: item.created_at
                        };

                    }

                    // DYNAMIC SUBTYPE COLUMN
                    groupedData[key][item.register_subtype] = item.value;

                });

                const finalData = Object.values(groupedData);

                /* ================= DYNAMIC COLUMNS ================= */

                const subtypeColumns = [
                    ...new Set(
                        rawData.map(
                            item => item.register_subtype
                        )
                    )
                ];

                const dynamicColumns = [

                    {
                        name: "Register",
                        selector: row => row.register_name,
                        sortable: true
                    },

                    {
                        name: "Plant",
                        selector: row => row.plant_code,
                        sortable: true
                    },

                    // DYNAMIC SUBTYPE COLUMNS

                    ...subtypeColumns.map(subtype => ({
                        name: subtype,
                        selector: row => row[subtype] || "-",
                        sortable: true
                    })),

                    {
                        name: "Created By",
                        selector: row => row.created_by_name,
                        sortable: true
                    },

                    {
                        name: "Created Date",
                        selector: row => row.created_at,
                        sortable: true
                    }

                ];

                setColumns(dynamicColumns);

                setTableData(finalData);

            } else {

                setTableData([]);
                setColumns([]);

                errorToast("No data found");

            }

        } catch {

            errorToast("Failed to load report");

        } finally {

            hideLoader();

        }

    };

    /* ================= UI ================= */

    return (

        <Card>

            <CardHeader>

                <CardTitle>
                    Register Report
                </CardTitle>

            </CardHeader>

            <CardBody>

                {/* ================= FILTERS ================= */}

                <Row>

                    {/* DATE */}

                    <Col md="3" sm="12">

                        <DatePicker
                            form={form}
                            id="date"
                            isDateRange
                            label={"Date Range"}
                        />

                    </Col>

                    {/* REGISTER */}

                    <Col md="3" sm="12">

                        <CustomDropdownInput
                            options={registerOptions}
                            label="Register"
                            form={form}
                            id="register"
                        />

                    </Col>

                    {/* PLANT */}

                    <Col md="3" sm="12">

                        <CustomDropdownInput
                            options={userPlant}
                            label="Plant"
                            form={form}
                            id="masterPlantId"
                        />

                    </Col>


                    

                </Row>

                {/* ================= BUTTON ================= */}

                <Row className="mt-2">

                    <Col className="text-end">

                        <Button
                            color="primary"
                            onClick={handleFilter}
                        >
                            Filter
                        </Button>

                    </Col>

                </Row>

                {/* ================= TABLE ================= */}

                <div className="mt-2">

                    <TableComponent
                        showDownload
                        columns={columns}
                        data={tableData}
                    />

                </div>

            </CardBody>

        </Card>

    );

};

export default CRegisterReport;