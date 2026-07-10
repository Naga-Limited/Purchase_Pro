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
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown } from "react-feather";
import ReactSelect from "react-select";
import RecieptEntryScreenDetails from "./RecieptEntryScreenDetails";
import POCopyModal from "../../../POCopyModal";

export const taColumns = (openPOModal) => [
    {
        name: "S.NO",
        selector: "serialNo",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VA NO",
        selector: "vaNumber",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
       
    },
    // {
    //     name: "PO TYPE",
    //     selector: "poType",
    //     sortable: true,
    //     minWidth: "200px",
       
    // },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
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
        name: "VENDOR CODE",
        selector: "vendor",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "INVOICE NO",
        selector: "refDocNo",
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
        name: "GL",
        selector: "gl",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "GL Description",
        selector: "itemText",
        sortable: true,
        minWidth: "250px",
    },
    
    {
        name: "YEAR",
        selector: "year",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "CONDITION",
        selector: "condition",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TAX CODE",
        selector: "taxCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "AMOUNT",
        selector: "amount",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TOTAL TAX",
        selector: "totalTax",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIVE QTY",
        selector: "quantity",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO UNIT",
        selector: "poUnit",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VALUATION TYPE",
        selector: "valuationType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "CURRENCY",
        selector: "currency",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "COMPANY CODE",
        selector: "compCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "HEADER TEXT",
        selector: "head_text",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "GROSS AMOUNT",
        selector: "gross_amount",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MIRO NO",
        selector: "miroNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PLANT CODE",
        selector: "plantCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PAYMENT METHOD",
        selector: "paymentMethod",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PROFIT CENTER",
        selector: "profitCenter",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "COST CENTER",
        selector: "costCenter",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "FI DOCUMENT NO",
        selector: "fiDocument",
        sortable: true,
        minWidth: "150px",
    },
    
    {
        name: "TAX CODE",
        selector: "rcm",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "attach",
        selector: "attach",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "CREATED",
        selector: "createdAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIPT APPROVED",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },

    // {
    //     name: "REJECT REASON",
    //     selector: "rejectReason",
    //     sortable: true,
    //     minWidth: "200px",
    // },
    {
        name: "REMARKS",
        selector: "remarks",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "REJECTION",
        selector: "rejectedAt",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "STATUS",
        selector: "statusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color={(row.status == 5 || row.status == 0) ? "danger" : 'primary'} pill>
                            {row.statusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
    // {
    //     name: "DURATION",
    //     selector: "duration",
    //     sortable: false,
    //     minWidth: "170px",
    // }, 
    {
        name: "Attachments",
        selector: "invoiceCopy",
        minWidth: "900px",
        cell: (row) => {
          return (
            <Row> {/* g-1 adds spacing between cols */}
              {row.invoiceCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.invoiceCopy}>
                    <Button outline color="success" size="sm">
                      Invoice
                    </Button>
                  </a>
              )}&nbsp;
              {row.bargainNote && (
                  <a target="_blank" rel="noopener noreferrer" href={row.bargainNote}>
                    <Button outline color="success" size="sm">
                      Bargain Note
                    </Button>
                  </a>
              )}&nbsp;
              {row.deliveryChallanCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.deliveryChallanCopy}>
                    <Button outline color="success" size="sm">
                      Delivery Challan
                    </Button>
                  </a>
              )}&nbsp;
              {row.ewayBillCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.ewayBillCopy}>
                    <Button outline color="success" size="sm">
                      E-Way Bill
                    </Button>
                  </a>
              )}&nbsp;
              {row.eInvoiceCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.eInvoiceCopy}>
                    <Button outline color="success" size="sm">
                      eInvoice
                    </Button>
                  </a>
              )}&nbsp;
              {row.qcCertificateInternalCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateInternalCopy}>
                    <Button outline color="success" size="sm">
                      QC Internal
                    </Button>
                  </a>
              )}&nbsp;
              {row.qcCertificateExternalCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateExternalCopy}>
                    <Button outline color="success" size="sm">
                      QC External
                    </Button>
                  </a>
              )}&nbsp;
              {row.externalWbCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.externalWbCopy}>
                    <Button outline color="success" size="sm">
                      External WB
                    </Button>
                  </a>
              )}&nbsp;
              {row.vendorEmailCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.vendorEmailCopy}>
                    <Button outline color="success" size="sm">
                      Vendor Email
                    </Button>
                  </a>
              )}&nbsp;
              {row.projectTeamAcknowledgement && (
                  <a target="_blank" rel="noopener noreferrer" href={row.projectTeamAcknowledgement}>
                    <Button outline color="success" size="sm">
                      Project Ack
                    </Button>
                  </a>
              )}&nbsp;
              {row.creditNoteCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.creditNoteCopy}>
                    <Button outline color="success" size="sm">
                      Credit Note
                    </Button>
                  </a>
              )}
            </Row>
          );
        },
      }
          
];

const MiroEntryReportWheat = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "Invoice Copy",
        selector: "status",
        minWidth: "250px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                <a target="_blank" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
                    <Button outline color="success" type="button">
                        Invoice Copy 
                    </Button>
                </a>&nbsp;
                {row?.extraCopy &&
                <a target="_blank" href={row.extraCopy}>
                    <Button outline color="success" type="button">
                        Other Copy 
                    </Button>
                </a>}
                </Row>
            );
        },
    };

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [poNumbers, setPoNumbers] = useState('')

    const overAllDetails = (gateInOutInfoId,poNumbers) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
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
    const formData = form.values;
    const fromDate = formData.date ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0;
    const toDate = formData.date ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0;
    const fromDateMilliSecond = formData.date ? fromDate.getTime() : 0;
    const toDateMilliSecond = formData.date ? toDate.getTime() : 0;

    let userPlant = form.values.masterPlantId
    let selectedPlant = userPlant != undefined ? userPlant.map((item) => item.werks) : null
    let plantId = selectedPlant != null ? selectedPlant.join(',') : 0

    // ✅ Handle multiple module types (array of selected options)
    const selectedModuleTypes = moduleType && moduleType.length > 0 
        ? moduleType.map(item => item.value).join(',') 
        : '0';

    const miroStatus = miroStatusId !== '' ? miroStatusId : 5;

    showLoader();

    apiPostMethod(
        `${apiBaseUrl}MigoAutomationController/MiroDetailReportWheat/${fromDateMilliSecond}/${toDateMilliSecond}/${selectedModuleTypes}/${UserDetails.USERID}/${miroStatus}/${plantId}/${UserDetails.plantids}`
    )
        .then((response) => {
            const { data } = response;
            if (data.success === true) {
                setLandingData(data.results);
            } else {
                errorToast(data.message);
                setLandingData([]);
            }
        })
        .catch((error) => {
            console.error(JSON.stringify(error));
            errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => {
            hideLoader();
        });
};


    const [moduleTypeData, setModuleTypeData] = useState([])
    const [moduleType, setModuleType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState('');
    const [miroStatusData, setMiroStatusData] = useState([])
    const [miroStatusId, setMiroStatusId] = useState('');
    const [miroStatus, setMiroStatus] = useState('');

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
    }

    const selectMiroStatus = (e) => {
        const id = e.value;
        setMiroStatusId(id)
        setMiroStatus([e])
    }

    const getModuleType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setModuleTypeData(data.results)
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

    const getStatus = () => {
        console.log(apiBaseUrl + `MigoAutomationController/MiroStatus`)
        apiGetMethod(apiBaseUrl + `MigoAutomationController/MiroStatus`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMiroStatusData(data.results)
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

    useEffect(() => {
        // getPoType()
        getModuleType()
        getStatus()
        getUserPlant()
    }, [])
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

    // const columns = [...taColumns, actionsCol];

    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };

    const togglePOModal = () => setPoModalOpen(!poModalOpen);

    return (
        <div>

            <Card>
                <CardHeader><h5>MIRO REPORT</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                          <Col sm="3" md="3">
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
                                                <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Waiting Status</Label>
                                <ReactSelect
                                    options={miroStatusData}
                                    onChange={selectMiroStatus}
                                    value={miroStatus}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup className="d-flex mb-0 justify-content-end">
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
                        <TableComponent showDownload columns={taColumns(openPOModal)} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}

            <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
            />
        </div >
    );
};

export default MiroEntryReportWheat;
