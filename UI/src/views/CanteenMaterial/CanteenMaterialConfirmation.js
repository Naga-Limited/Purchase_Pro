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
        name: "SUB PURPOSE",
        selector: "subModuleType",
        sortable: true,
        minWidth: "150px",
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
                        <Badge color="primary" pill>
                            {row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const CanteenMaterialConfirmation = ({ actionRendorer }) => {

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
        if (row.moduleTypeId == 40) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        if (row.moduleTypeId == 40) {
            history.push(`/CANTEENMATERIALCONFIRMATION/${row.gateInOutInfoId}`);
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
        getSubModuleType()
    }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getCanteenConfirmationList/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                        const stoData = data.results
                        setLandingData(stoData);
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

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
        // getLoadingData()
    }

    const getSubModuleType = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getSubModuleType/${40}`)
          .then((response) => {
            const { data } = response;
            if (data.success == true) {
                setModuleTypeData(data.results)
                getLoadingData()
            }
            else if (data.success == false) {
              // errorToast(data.message)
            }
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
      }
    

    

    

    const columns = [...taColumns, actionsCol];

    return (
        <div>

            <Card>
                <CardHeader><h5>Canteen Material Confirmation List</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Movement Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col>

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

export default CanteenMaterialConfirmation;
