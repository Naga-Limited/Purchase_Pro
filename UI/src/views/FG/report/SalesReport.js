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
import Select from 'react-select'
import OverAllDetails from "../OverAllDetails";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "190px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-start mb-0">
                    <p className="fs-6">{row.plantName} - {row.werks} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SHIPMENT ORDER NO",
        selector: "shipmentOrderNo",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "INVOICE NUMBER",
        selector: "invoiceNumber",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "DELIVERY NUMBER",
        selector: "deliveryNumber",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "DELIVERY OTY",
        selector: "deliveryQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PGI STATUS",
        selector: "PgiCompletion",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-center mb-0">
                    <p className="fs-6">{row.PgiCompletion == 'C' ? 'Completed' : row.PgiCompletion == 'A' ? "Waiting at PGI" : row.PgiCompletion}</p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "TRIPSHEET NUMBER",
        selector: "tripSheetNumber",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "CUSTOMER CODE",
        selector: "customerCode",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "CUSTOMER NAME",
        selector: "customerName",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "BULKER ACTUAL WEIGHT",
        selector: "bulkerEmptyWeight",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "FIRST WEIGHT",
        selector: "firstWeight",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "FIRST WEIGHT DATE",
        selector: "firstWeightDate",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "SECOND WEIGHT",
        selector: "secondWeight",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "SECOND WEIGHT DATE",
        selector: "secondWeightDate",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "NET WEIGHT",
        selector: "netWeight",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "SHIPMENT DATE",
        selector: "shipmentDate",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "GATE OUT CONFIRM DATE",
        selector: "created_at",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "Institution Net Weight",
        selector: "customerNetWeight",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "Institution Difference Weight",
        selector: "customerdifference",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "DURATION",
        selector: "Duration",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
    {
        name: "Institution WB Copy",
        selector: "NagaOutsideWBCopy",
        sortable: false,
        minWidth: "150px",
        cell: (row) => (
            row?.NagaOutsideWBCopy ? (
                <FormGroup className="d-flex justify-content-start mb-0">
                    <a
                        href={row.NagaOutsideWBCopy}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button outline color="success" type="button">
                            WB Copy
                        </Button>
                    </a>
                </FormGroup>
            ) : null
        ),
    }
];


const SalesReport = () => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            fromDate: validation.required({ message: "Please Select /Color Token", isObject: false })
        }),
        getSalesReport() { },
    });


    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [selectedValue, setSelectedValue] = useState('')
    const [moduleTypeId, setModuleTypeId] = useState('');

    // ✅ New state for bulker customers
    const [bulkerCustomers, setBulkerCustomers] = useState([]);

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const getSalesReport = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let moduleType = moduleTypeId != undefined ? moduleTypeId : 0
        let userPlant = form.values.masterPlantId
        let waitingStatusId = form.values.waitingStatusId != undefined ? form.values.waitingStatusId.value : 0

        let selectedPlant = userPlant != undefined ? userPlant.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0
        let bulker_id = form.values.Bulker_id != undefined ? form.values.Bulker_id.value : 0
        let bulkerCustomerId = form.values.bulkerCustomerId != undefined ? form.values.bulkerCustomerId.value : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getSalesReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${plantId}/${waitingStatusId}/${UserDetails.USERID}/${bulker_id}/${bulkerCustomerId}`)
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

    const selectModuleType = (e) => {
        selectType(0)
        setSelectedValue(e)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results.filter((item) => item.moduleTypeId == 1 || item.moduleTypeId == 7 || item.moduleTypeId == 8))
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
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

    const wbOptions = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    // ✅ New function to fetch bulker customer details
    const getBulkerCustomers = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Report/getcustomerdetailsforbulker`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setBulkerCustomers(data.results);
                } else if (data.success == false) {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    // ✅ useEffect to watch Bulker_id changes
    useEffect(() => {
        if (form.values.Bulker_id?.value === 1) {
            getBulkerCustomers();
        } else {
            setBulkerCustomers([]);
            form.setFieldValue("bulkerCustomerId", undefined);
        }
    }, [form.values.Bulker_id]);

    useEffect(() => {
        selectModuleType()
        getUserPlant()
    }, [])

    const columns = [...taColumns];

    return (
        <>
            <Card>
                <CardHeader><h5>Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        {data != "" ?
                            <>
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <Label>Module Type</Label>
                                        <Select
                                            options={data}
                                            onChange={selectType}
                                            value={type}
                                        />
                                    </FormGroup>
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

                                <Col sm="4" md="4">
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getModuleStatus`}
                                        label={"Waithing Status"}
                                        form={form}
                                        id="waitingStatusId"
                                    />
                                </Col>

                                <Col md="4" sm="3">
                                    <CustomDropdownInput
                                        options={wbOptions}
                                        label={"Bulker"}
                                        form={form}
                                        id="Bulker_id"
                                    />
                                </Col>

                                {/* ✅ Show Bulker Customer dropdown only when Bulker = Yes */}
                                {form.values.Bulker_id?.value === 1 && (
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Bulker Customer</Label>
                                            <Select
                                                options={bulkerCustomers}
                                                onChange={(e) => form.setFieldValue("bulkerCustomerId", e)}
                                                value={form.values.bulkerCustomerId || null}
                                                placeholder="Select Bulker Customer"
                                            />
                                        </FormGroup>
                                    </Col>
                                )}

                                <Col md="2" sm="2">
                                    <div>
                                        <label>&nbsp;</label>
                                        <FormGroup>
                                            <Button color="primary" type="submit" onClick={getSalesReport} disabled={form.values.date == undefined ? true : false}>
                                                View <ArrowDown size={16} />
                                            </Button>
                                        </FormGroup>
                                    </div>
                                </Col>
                            </> : null}
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

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default SalesReport;
