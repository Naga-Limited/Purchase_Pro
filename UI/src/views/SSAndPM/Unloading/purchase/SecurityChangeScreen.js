import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ElapsedTimer } from "../../../common/ElapsedTimer";
import { useSelector } from "react-redux";
// import OverAllDetails from "../../../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown, X } from "react-feather";
import ReactSelect from "react-select";
import SecurityChangeScreenDetails from "./SecurityChangeScreenDetails";
import PurchaseOrderDetailsInfo from "../../../Info/PurchaseOrderDetailsInfo";
import PurchaseOrderDetailsInfoOCR from "../../../Info/PurchaseOrderDetailsInfoOCR";
import { Modal, ModalBody } from "react-bootstrap";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "VA NO",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
       
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO NO",
        selector: "poNumbers",
        sortable: true,
        minWidth: "150px",
    },
    
    {
        name: "SCREEN DURATION",
        selector: "gateOutDateStamp",
        sortable: false,
        minWidth: "170px",
    },
    
];

const SecurityChangeScreen = ({ actionRendorer }) => {

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
                <Row>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1'  onClick={() => overAllDetails(row.loadingUnloadingInfoId,row.poNumbers)}>PO Correction</Button.Ripple> &nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1'  onClick={() => overAllDetails1(row.loadingUnloadingInfoId,row.poNumbers)}>PO Add</Button.Ripple>
                </Row>
            );
        },
    };

    

    const [show, setShow] = useState(false)
    const [show1, setShow1] = useState(false)

    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [poNumbers, setPoNumbers] = useState('')
    const [loadingAndUnloadingInfoId, setLoadingAndUnloadingInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId,poNumbers) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
        setPoNumbers(poNumbers)

    };
    const overAllDetails1 = (gateInOutInfoId,poNumbers) => {
        setShow1(true)
        setLoadingAndUnloadingInfoId(gateInOutInfoId)
        setPoNumbers(poNumbers)

    };
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    // useEffect(() => {
    //     getLoadingData()
    // }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0
        let poTypes = poTypeId != '' ? poTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/ReceiptDetailsChange/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}/${poTypes}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results;
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

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
        getPoType(id)
    }

    const getModuleType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setModuleTypeData(data.results)                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }


    const [poTypeData, setPoTypeData] = useState([])
    const [poType, setPoType] = useState('');
    const [poTypeId, setPoTypeId] = useState('');

    const selectPoType = (e) => {
        const id = e.value;
        setPoTypeId(id)
        setPoType([e])
    }

    const getPoType = (module_type) => {
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        console.log(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
        apiGetMethod(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
                    console.log(data.results)
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    const [workingProcess,setWorkingProcess] = useState('');
  
  const QRCodeControl = () => {
      apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
          .then((response) => {
              const data = response.data;
              setWorkingProcess(data.workingProcess)
             
          })
          .catch((error) => {
              console.log(error)
              errorToast("Something went wrong, please try again after sometime1");
          })
  }
    useEffect(() => {
        // getPoType()
        getModuleType()
        QRCodeControl()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>

            <Card>
                <CardHeader><h5>Security PO Change Screen</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>VA Number</Label>
                                <ReactSelect
                                    options={poTypeData}
                                    onChange={selectPoType}
                                    value={poType}
                                />
                            </FormGroup>
                        </Col> 
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

            {show ? <SecurityChangeScreenDetails setShow={setShow} show={show} purchaseId={gateInOutInfoId} poNumbers={poNumbers} /> : null}

            {show1 && (workingProcess == '1' || workingProcess == '2') && (
                <Modal show={show1} centered size="xl">
                    <Card>
                    <CardHeader>
                    {/* <Row className="align-items-center"> */}
                        <Col xs="10" className="text-center">
                        <h4 className="mb-0">PO Add</h4>
                        </Col>
                        <Col xs="1" className="text-end">
                        <X
                            color="red"
                            onClick={() => setShow1(false)}
                            size={20}
                            style={{ cursor: 'pointer' }}
                        />
                        </Col>
                    {/* </Row> */}
                    </CardHeader>
                    <CardBody>
                        <PurchaseOrderDetailsInfo
                        tripSheetData=""
                        truckValue=""
                        remarks=""
                        phoneNo=""
                        Type=""
                        subModuleTypeId=""
                        screen="change"
                        loadingAndUnloadingInfoId={loadingAndUnloadingInfoId}
                        gateInOutInfoData={''}
                        />
                    </CardBody>
                    </Card>
                </Modal>
            )}
             {show1 && workingProcess == '0' && (
                <Modal show={show1} centered size="xl">
                    <Card>
                    <CardHeader>
                    {/* <Row className="align-items-center"> */}
                        <Col xs="10" className="text-center">
                        <h4 className="mb-0">PO Add</h4>
                        </Col>
                        <Col xs="1" className="text-end">
                        <X
                            color="red"
                            onClick={() => setShow1(false)}
                            size={20}
                            style={{ cursor: 'pointer' }}
                        />
                        </Col>
                    {/* </Row> */}
                    </CardHeader>
                    <CardBody>
                        <PurchaseOrderDetailsInfoOCR
                        tripSheetData=""
                        truckValue=""
                        remarks=""
                        phoneNo=""
                        Type=""
                        subModuleTypeId=""
                        screen="change"
                        loadingAndUnloadingInfoId={loadingAndUnloadingInfoId}
                        gateInOutInfoData={''}
                        />
                    </CardBody>
                    </Card>
                </Modal>
            )}
            {/* {show1 && workingProcess == '2' ? <PurchaseOrderDetailsInfoOCR tripSheetData={''} truckValue={''} remarks={''} phoneNo={''} Type={''} subModuleTypeId={''} screen={'change'} loadingAndUnloadingInfoId={loadingAndUnloadingInfoId}/> : null} */}

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}
        </div >
    );
};

export default SecurityChangeScreen;
