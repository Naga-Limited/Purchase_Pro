import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { useSelector } from "react-redux";
import OverAllDetails from "../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { DatePicker } from "../forms/custom-datetime";
import { ArrowDown } from "react-feather";
import ReactSelect from "react-select";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.moduleType == 'EVADP' ? 'IAS' : row.subModuleTypeId == 1 ? row.moduleType + ' - Hand Carry' : row.moduleType}</span>
            </>
        },
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OVERALL DURATION",
        selector: "createdOn",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.createdOn} />
        },

    },
    {
        name: "WAITING AT",
        selector: "StatusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        {row.salesInvoiceNo != null &&
                        <Badge color="success" pill>
                            {row.waitingStatus}
                        </Badge>
                        }
                        {row.salesInvoiceNo == null &&
                        <Badge color="primary" pill>
                            {row.waitingStatus}
                        </Badge>
                       }
                    </FormGroup>
                </Col>
            );
        },
    },
];

const FGSaleConfirmationList = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "220px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <>
                        {row.moduleTypeId != 14 && row.moduleTypeId != 28 && row.moduleTypeId != 30 ?
                            <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Action</Button.Ripple> : null
                        }
                    </>
                    <Button.Ripple color="primary" size="sm" type="button" className={row.moduleTypeId != 14 && row.moduleTypeId != 28 && row.moduleTypeId != 30 ? 'ml-1' : ''} onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };

    const print = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 39) {
            window.open(`/public/#/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 2) {
            window.open(`/public/#/StoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            window.open(`/public/#/SsAndPmSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            window.open(`/public/#/FgReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34) {
            window.open(`/public/#/Purchase/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 5) {
            window.open(`/public/#/GatePassSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 13) {
            window.open(`/public/#/SDGStoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 14) {
            window.open(`/public/#/RmWaterSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 28 || row.moduleTypeId == 30 || row.moduleTypeId == 31 || row.moduleTypeId == 37) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        if (row.moduleTypeId == 39) {
            history.push(`/D2RSales/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            history.push(`/FGReturnSapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            history.push(`/SSANDPM/Unloading/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34 || row.moduleTypeId == 16 || row.moduleTypeId == 35) {
            history.push(`/Purchase/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 10) {
            history.push(`/GatePass/Unloading/GatePassSapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 13) {
            history.push(`/SDG/sto/Unloading/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 22) {
            history.push(`/GatePass/Unloading/GatePassReceiptSapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 5) {
            history.push(`/GatePass/Unloading/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 1) {
            history.push(`/FG/SAPDocument/${row.gateInOutInfoId}`);
        }
    };

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        getLoadingData()
    }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getSaleConfirmationList/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results
                        setLandingData(stoData);
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData([])
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

    const [moduleTypeData, setModuleTypeData] = useState([])
    const [moduleType, setModuleType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState('');

   


    const columns = [...taColumns, actionsCol];

    return (
        <div>

            <Card>
                <CardHeader><h5>Sale Confirmation List</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        {/* <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col> */}

                        {/* {moduleTypeId != '' && moduleTypeId != 2 ?
                            <Col sm="3" md="3">
                                <FormGroup>
                                    <Label>PO Type</Label>
                                    <ReactSelect
                                        options={poTypeData}
                                        onChange={selectPoType}
                                        value={poType}
                                    />
                                </FormGroup>
                            </Col> : null
                        } */}

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getLoadingData}
                                    disabled={form.values.date == undefined ? true : false}
                                > View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != '' ?
                <Card >
                    <CardHeader><h5>Document Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}
        </div >
    );
};

export default FGSaleConfirmationList;
