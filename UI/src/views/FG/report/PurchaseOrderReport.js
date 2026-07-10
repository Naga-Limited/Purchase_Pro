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
import POCopyModal from "../../POCopyModal";

export const taColumns = (openPOModal) => [
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
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE DATE",
        selector: "invoiceDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE COPY",
        selector: "invoiceDate",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <FormGroup className="d-flex justify-content-start mb-0">
                <a target="_blank" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
                    <Button outline color="success" type="button">
                        View 
                    </Button>
                </a>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
            <Button color="link" size="sm" onClick={() => openPOModal(row.poNumber,'PO')} style={{ textDecoration: "underline" }}>
              {row.poNumber}
            </Button>
        )
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
        name: "VENDOR CODE",
        selector: "vendorCode",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TO PLANT",
        selector: "toPlantName",
        sortable: true,
        minWidth: "190px",
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
        name: "MIGO NUMBER",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
            <Button color="link" size="sm" onClick={() => openPOModal(row.migoNumber,'GRN')} style={{ textDecoration: "underline" }}>
              {row.migoNumber}
            </Button>
        )
    },
    {
        name: "MIGO DATE",
        selector: "migoDate",
        sortable: true,
        minWidth: "120px",
    },
    // {
    //     name: "MIGO NUMBER",
    //     selector: "migoNumber",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    {
        name: "FIRST WT",
        selector: "firstWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SECOND WT",
        selector: "secondWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "NET WT",
        selector: "netWeight",
        sortable: true,
        minWidth: "150px",
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
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "GATE OUT DATE",
        selector: "gateOutDateStamp",
        sortable: true,
        minWidth: "170px",
    },
];

const PurchaseOrderReport = () => {

    let { showLoader, hideLoader } = useLoader();
    const [landingData, setLandingData] = useState([])
    const [type, setType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState(0);
    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };

    const togglePOModal = () => setPoModalOpen(!poModalOpen);

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
        let poType = form.values.poType
        let userPlant = form.values.masterPlantId
        let waitingStatusId1 = form.values.waitingStatusId
        let selectedPlant = userPlant != undefined ? userPlant.map((item) => item.value) : null
        let selectedPoType = poType != undefined ? poType.map((item) => item.value) : null
        let selectedWaitingStatusId = waitingStatusId1 != undefined ? waitingStatusId1.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0
        let moduleType = selectedPoType != null ? selectedPoType.join(',') : 0
        let waitingStatusId = selectedWaitingStatusId != null ? selectedWaitingStatusId.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getPurchaseOrderReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${plantId}/${waitingStatusId}/${UserDetails.USERID}`)
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
            .finally(() => {
                hideLoader();
            });
    }

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
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
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
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

    return (
        <>
            <Card>
                <CardHeader><h5>Purchse Order Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    isMulti
                                    options={poTypeData}
                                    label={"PO Type"}
                                    form={form}
                                    id="poType"
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
                                label={"Waithing Status"}
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

            {landingData.length > 0 && (
                <Card>
                    <CardHeader><h5>Purchse Order Report List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={taColumns(openPOModal)} data={landingData} />
                    </CardBody>
                </Card>
            )}

            {show && <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} />}

            <div style={{ marginBottom: "270px" }}></div>

            <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
            />
        </>
    );
};

export default PurchaseOrderReport;
