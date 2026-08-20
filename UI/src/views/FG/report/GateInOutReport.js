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
import OverAllDetails from "../OverAllDetails";
import { ElapsedTimer } from "../../common/ElapsedTimer";

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
        name: "SUB PURPOSE",
        selector: "subModuleType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    // {
    //     name: "LABOUR COUNT",
    //     selector: "noOfTarpaulin",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    // {
    //     name: "VAN ROUTE",
    //     selector: "route",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    {
        name: "SHIPMENT NO",
        selector: "shipmentOrderNo",
        sortable: true,
        minWidth: "150px",
    },
    // {
    //     name: "SHIPMENT NO",
    //     selector: "shipmentOrderNo",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    {
        name: "INVOICE NO",
        selector: "invoiceNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "DELIVERY NO",
        selector: "deliveryNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STO PO NO",
        selector: "stoPoNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STO DELIVERY NO",
        selector: "stoDeliveryNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STO MIGO NO",
        selector: "stoMigoNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MIGO NUMBER",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PURCHASE RETURN MIGO",
        selector: "returnMigoNumber",
        sortable: true,
        minWidth: "150px",
    },
     {
        name: "SALE RETURN INVOICE",
        selector: "salesInvoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RETURN DELIVERY",
        selector: "returnDeliveryNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RETURN INVOICE",
        selector: "returnInvoiceNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SALES RETURN COPY",
        selector: "returnDocument",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            
            return <Col sm="12" md="12">
                <FormGroup className="d-flex justify-content-start mb-0">
                <a target="_blank" href={row?.returnDocument}>
                    {row?.returnDocument &&
                    <Button outline color="success" type="button">
                        View 
                    </Button>}
                </a>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "GATE PASS NO",
        selector: "gatepassNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MOBILE NO",
        selector: "driverMobileNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRIPSHEET NO",
        selector: "tripSheetNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRUCK TYPE",
        selector: "truckType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VEHICLE TYPE",
        selector: "vehicleType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRUCK CAPACITY",
        selector: "truckCapacity",
        sortable: true,
        minWidth: "170px",
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
        minWidth: "170px",
    },
    {
        name: "NET WEIGHT",
        selector: "netWeight",
        sortable: true,
        minWidth: "150px",
    },
    // {
    //     name: "MIGO NO",
    //     selector: "migoNumber",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    {
        name: "FIRST WEIGHT DATE",
        selector: "firstWeightDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "SECOND WEIGHT DATE",
        selector: "secondWeightDateStamp",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "WEIGHT DURATION",
        selector: "weightDuration",
        sortable: false,
        minWidth: "170px",
        // cell: (row) => {
        //     return <ElapsedTimer date={row.firstWeightDateStamp} date1={row.secondWeightDateStamp} />
        // },
    },
    {
        name: "REPORTING DATE",
        selector: "createdOn",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return (
                row.createdOn ? row.createdOn : row.gateInDateStamp
            );
        },
    },
    {
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return (
                row.gateInDateStamp ? row.gateInDateStamp : row.createdOn
            );
        },
    },
    {
        name: "GATE OUT DATE",
        selector: "gateOutDateStamp",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "OVERALL DURATION",
        selector: "Duration",
        sortable: false,
        minWidth: "170px",
        // cell: (row) => {
        //     return <ElapsedTimer date={row.gateInDateStamp || row.createdOn} date1={row.gateOutDateStamp} />
        // },
    },
    {
        name: "REMARKS",
        selector: "remarks",
        sortable: true,
        minWidth: "170px",
    },  {
        name: "Reject Reason Store ",
        selector: "securityRejectRemarks",
        sortable: true,
        minWidth: "170px",
    },  {
        name: "Reject Reason Security",
        selector: "storeInchargeRejectRemarks",
        sortable: true,
        minWidth: "170px",
    }, 
    {
        name: "Delay Reason",
        selector: "delay_reason",
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
];

const GateInOutReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const print = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 39 ) {
            window.open(`/public/#/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 2) {
            window.open(`/public/#/StoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            window.open(`/public/#/FgReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            window.open(`/public/#/SsAndPmReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 5 || row.moduleTypeId == 22) {
            window.open(`/public/#/GatePassSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 6 ) {
            window.open(`/public/#/SsAndPmSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 7) {
            window.open(`/public/#/SDGSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 8) {
            window.open(`/public/#/RMSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 16 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34 || row.moduleTypeId == 35 ) {
            window.open(`/public/#/Purchase/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 13 ) {
            window.open(`/public/#/SDGStoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 14 || row.moduleTypeId == 45) {
            window.open(`/public/#/RmWaterSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 36  || row.moduleTypeId == 26 || row.moduleTypeId == 27 || row.moduleTypeId == 29 || row.moduleTypeId == 24 || row.moduleTypeId == 28 || row.moduleTypeId == 30 || row.moduleTypeId == 31 || row.moduleTypeId == 37 || row.moduleTypeId == 40 || row.moduleTypeId == 41 || row.moduleTypeId == 38 || row.moduleTypeId == 42 || row.moduleTypeId == 44 || row.moduleTypeId == 43 || row.moduleTypeId == 20) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [selectedValue, setSelectedValue] = useState('')
    const [movementTypeData, setMovementTypeData] = useState([]);
    const [moduleTypeId, setModuleTypeId] = useState(0);

    const [refreshData, setRefreshData] = useState([]);

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const getGateInOutReport = () => {

        setLandingData([])

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let moduleType = form.values.ModuleType
        let userPlant = form.values.masterPlantId
        let waitingStatusId1 = form.values.waitingStatusId
        // let waitingStatusId = form.values.waitingStatusId != undefined ? form.values.waitingStatusId.value : 0

        let selectedPlant = userPlant != undefined ? userPlant.map((item) => item.value) : null
        let selectedModuleType = moduleType != undefined ? moduleType.map((item) => item.value) : null
        let selectedWaitingStatusId = waitingStatusId1 != undefined ? waitingStatusId1.map((item) => item.value) : null

        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0
        let moduleTypeId = selectedModuleType != null ? selectedModuleType.join(',') : 0
        let waitingStatusId = selectedWaitingStatusId != null ? selectedWaitingStatusId.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getGateInOutReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleTypeId}/${plantId}/${waitingStatusId}/${UserDetails.USERID}`)
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

    const selectMovementType = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getMovementType`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMovementTypeData(data.results)
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

    const selectModuleType = (e) => {
        selectType(0)
        setSelectedValue(e)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)
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
        selectMovementType()
        selectModuleType()
        getUserPlant()
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
                                {/* <Label>Module Type</Label> */}
                                <CustomDropdownInput
                                    isMulti
                                    options={data}
                                    label={"Module Type"}
                                    // onChange={selectType}
                                    form={form}
                                    // value={type}
                                    id="ModuleType"
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
                                isMulti
                                url={`${apiBaseUrl}GatePro/Master/getModuleStatus`}
                                label={"Waiting Status"}
                                form={form}
                                id="waitingStatusId"
                            />
                        </Col>

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getGateInOutReport}
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

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default GateInOutReport;