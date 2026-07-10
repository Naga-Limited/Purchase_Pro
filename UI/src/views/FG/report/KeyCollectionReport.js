import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../common/TableComponent";
import { apiBaseUrl } from "../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { DatePicker } from "../../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup, validation } from "../../forms/custom-form";
import moment from "moment";
import { ArrowDown } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import OverAllDetails from "../OverAllDetails";

export const taColumns = [
    {
        name: "KEY NAME",
        selector: "keyName",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.plantName + ' - ' + row.werks}</span>
            </>
        }
    },
    {
        name: "Block Name",
        selector: "block_name",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "KEY COLLECTOR",
        selector: "receiverName",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "SUBMITTED BY",
        selector: "giverName",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "DISTRIBUTION DATE",
        selector: "distributionDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "COLLECTION DATE",
        selector: "collectedDateStamp",
        sortable: true,
        minWidth: "180px",
    },
];
const otpColumn = {
    name: "OTP",
    selector: "otp",
    sortable: true,
    minWidth: "180px",
};


const KeyCollectionReport = () => {

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getKeyCollectionReport = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let userPlant = form.values.masterPlantId

        let selectedPlant = userPlant != null ? userPlant.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getKeyCollectionReport/${fromDateMilliSecond}/${toDateMilliSecond}/${plantId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    let data1 = data.results
                    setLandingData(data1)
                }
                else if (data.success == false) {
                    setLandingData([])
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getUserPlant()
    }, [])

    const columns = [
    ...taColumns.filter(col => col.selector !== "otp"),
    ...(UserDetails.role === "Approver" || UserDetails.role === "Admin" ? [otpColumn] : [])
];

    return (
        <>
            <Card>
                <CardHeader><h5>Key Collection - Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="12">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    isMulti
                                    options={userPlant}
                                    label={"Plant"}
                                    form={form}
                                    id="masterPlantId"
                                />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button.Ripple color="primary" type="submit" onClick={getKeyCollectionReport}>
                                    View <ArrowDown size={16} />
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != "" ?
                <Card>
                    <CardHeader><h5>Report List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            {landingData == "" ? <div style={{ marginBottom: "280px" }}></div> : null}

        </>
    );
};

export default KeyCollectionReport;
