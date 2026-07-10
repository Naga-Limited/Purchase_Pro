import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
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
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
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
        name: "FIRST WEIGHT",
        selector: "firstWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SECOND WEIGHT",
        selector: "secondWeight",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "NET WEIGHT",
        selector: "netWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REMARKS",
        selector: "remarks",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "FIRST WEIGHT DATE",
        selector: "firstWeightDateStamp",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "SECOND WEIGHT DATE",
        selector: "secondWeightDateStamp",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "WAITING AT",
        selector: "statusName",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.statusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const TestWeighbridgeReport = ({ actionRendorer }) => {


    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };
    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState(0);

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const print = (row) => {
        window.open(`/public/#/TestWeighbridgeSmartForm/${row.testWeighbridgeId}`)
    }

    const getTestWeighbridgeReport = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let userPlant = form.values.masterPlantId

        let selectedPlant = userPlant != null ? userPlant.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getTestWeighbridgeReport/${fromDateMilliSecond}/${toDateMilliSecond}/${plantId}/${UserDetails.USERID}`)
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
        apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results.filter((item) => item.moduleTypeId == 2 || item.moduleTypeId == 6 || item.moduleTypeId == 13 || item.moduleTypeId == 20))

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

    useEffect(() => {
        getUserPlant()
        selectModuleType()
    }, [])

    const columns = [...taColumns, actionsCol];

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

                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    options={userPlant}
                                    label={"Plant"}
                                    form={form}
                                    id="masterPlantId"
                                    isMulti
                                />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getTestWeighbridgeReport}
                                    disabled={form.values.date == undefined ? true : false}
                                > View <ArrowDown size={16} />
                                </Button>
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

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default TestWeighbridgeReport;
