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
    // {
    //     name: "MOVEMENT TYPE",
    //     selector: "movementType",
    //     sortable: true,
    //     minWidth: "180px",
    // },
    // {
    //     name: "PURPOSE",
    //     selector: "moduleType",
    //     sortable: true,
    //     minWidth: "180px",
    // },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REFERENCE NO",
        selector: "returnRefNo",
        sortable: true,
        minWidth: "190px",
        
    },
    {
        name: "Sale Invoice No",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Invoice Date",
        selector: "billingDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "First Weight",
        selector: "firstWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Second Weight",
        selector: "secondWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Net Weight",
        selector: "netWeight",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "First Weight Date",
        selector: "firstWeightDate",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "Second Weight Date",
        selector: "secondWeightDate",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "Gate In Date",
        selector: "formatted_gateInDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "Gate Out Date",
        selector: "formatted_gateOutDateStamp",
        sortable: true,
        minWidth: "180px",
    },  
    {
        name: "Duration",
        selector: "duration_time",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Remarks",
        selector: "remarks",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Status",
        selector: "statusname",
        sortable: true,
        minWidth: "100px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.statusname}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
    {
        name: "Document",
        selector: "returnDocument",
        sortable: true,
        minWidth: "100px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                         <a
                        href={row.returnDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button outline color="success" type="button">
                            View
                        </Button>
                    </a>
                    </FormGroup>
                </Col>
            );
        },
    },
    // {
    //     name: "GATE OUT DATE",
    //     selector: "gateOutDateStamp",
    //     sortable: true,
    //     minWidth: "160px",
    // },
];

const SaleReturnReport = () => {

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

    const getDeliveryReport = () => {

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

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/SaleReturnReport/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.USERID}`)
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

    const columns = [...taColumns];

    return (
        <>
            <Card>
                <CardHeader><h4>Sale Return Report</h4><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>
                        {/* <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <Select
                                    options={data}
                                    onChange={selectType}
                                    value={type}
                                />
                            </FormGroup>
                        </Col> */}

                        {/* <Col sm="4" md="4">
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
                        </Col> */}

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getDeliveryReport}
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

export default SaleReturnReport;
