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

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
   
    {
        name: "PURPOSE",
        selector: "name",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT",
        selector: "werks",
        sortable: true,
        minWidth: "250px",
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
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MATERIAL NAME",
        selector: "description",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "PO DATE",
        selector: "documentDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO TYPE",
        selector: "name",
        sortable: true,
        minWidth: "190px",
    },
    
    {
        name: "TO PLANT",
        selector: "toPlantWerks",
        sortable: true,
        minWidth: "250px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-start mb-0">
                    <p className="fs-6">{row.toPlantName} - {row.toPlantWerks} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "DELIVERY QTY",
        selector: "deliveryQty",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "DELIVERY NO",
        selector: "deliverNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "MIGO NUMBER",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
    },
    
    {
        name: "FIRST WT",
        selector: "firstWeight",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "SECOND WT",
        selector: "secondWeight",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "NET WT",
        selector: "netWeight",
        sortable: true,
        minWidth: "120px",
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
        name: "SENDING GATE IN DATE",
        selector: "sendingGateIn",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "SENDING GATE OUT DATE",
        selector: "sendingGateOut",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "SENDING GATE DURATION",
        selector: "sendingGateDuration",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "FIRST WEIGHT DATE",
        selector: "firstWeightDate",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "SECOND WEIGHT DATE",
        selector: "secondWeightDate",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "WEIGHT DURATION",
        selector: "weightDuration",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "RECEIVING GATE IN DATE",
        selector: "receivingGateIn",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "RECEIVING GATE OUT DATE",
        selector: "recGateOutDateStamp",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "RECEIVING GATE DURATION",
        selector: "receivingGateDuration",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "OVERALL DURATION",
        selector: "overAllDuration",
        sortable: true,
        minWidth: "170px",
    },
   
];

const RMImportSTOReportReport = () => {

    let { showLoader, hideLoader } = useLoader();
    const [landingData, setLandingData] = useState([])
    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState(0);
    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const getPurchaseOrderReport = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        // let moduleType = moduleTypeId != undefined ? moduleTypeId : 0
        let poType = form.values.poType
        let userPlant = form.values.masterPlantId
        let waitingStatusId1 = form.values.waitingStatusId
        // let waitingStatusId = form.values.waitingStatusId != undefined ? form.values.waitingStatusId.value : 0

        let selectedPlant = userPlant != undefined ? userPlant.map((item) => item.value) : null
        let selectedPoType = poType != undefined ? poType.map((item) => item.value) : null
        let selectedWaitingStatusId = waitingStatusId1 != undefined ? waitingStatusId1.map((item) => item.value) : null

        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0
        let moduleType = selectedPoType != null ? selectedPoType.join(',') : 0
        let waitingStatusId = selectedWaitingStatusId != null ? selectedWaitingStatusId.join(',') : 0
        
        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getRMSTOReport/${fromDateMilliSecond}/${toDateMilliSecond}/${waitingStatusId}/${UserDetails.USERID}`)
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

    const [poTypeData, setPoTypeData] = useState([])

    const getPoType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
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


    useEffect(() => {
        getUserPlant()
        getPoType()
    }, [])

    const columns = [...taColumns];

    return (
        <>
            <Card>
                <CardHeader><h5>RM Import STO Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
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
                                    onClick={getPurchaseOrderReport}
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
                    <CardHeader><h5>Detail List</h5></CardHeader>
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

export default RMImportSTOReportReport;
