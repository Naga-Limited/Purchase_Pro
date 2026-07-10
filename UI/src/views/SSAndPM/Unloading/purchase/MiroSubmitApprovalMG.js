import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
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
import RecieptEntryScreenDetails from "./RecieptEntryScreenDetails";
import RecieptEntryScreenApprovalDetails from "./RecieptEntryScreenApprovalDetails";
import MiroSubmitDetailsApproval from "./MiroSubmitDetailsApproval";
import { Modal, ModalBody } from "react-bootstrap";

export const taColumns = [
    // {
    //     name: "MIRO ID",
    //     selector: "miroId",
    //     sortable: true,
    //     minWidth: "170px",
    // },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "300px",
    },
    {
        name: "INVOICE NO",
        selector: "refDocNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "INVOICE DATE",
        selector: "docDate",
        sortable: true,
        minWidth: "100px",
    }, 
    {
        name: "PO NO",
        selector: "poNumber",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "TOTAL AMOUNT",
        selector: "gross_amount",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "PLANT CODE",
        selector: "plantCode",
        sortable: true,
        minWidth: "150px",
    },
    
];

const MiroSubmitApprovalMG = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const actionsCol1 = {
        name: "INVOICE COPY",
        selector: "invoiceCopy",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
               
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1'  onClick={() => onActionClick1(row.invoiceCopy)}>Invoice</Button.Ripple>
                   
                </Row>
            );
        },
    };

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "220px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
               
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1'  onClick={() => overAllDetails(row.lines,row.miro_entry,row.ids)}>View</Button.Ripple>
                   
                </Row>
            );
        },
    };

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [lines, setLines] = useState('')
    const [miroIds, setMiroIds] = useState('')
    const overAllDetails = (lines,gateInOutInfoId,Ids) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
        setLines(lines)
        setMiroIds(Ids)
    };
    const [openImage, setOpenImage] = useState('');
    const [openPdf, setOpenPDF] = useState('');
    const [show1, setShow1] = useState(false)
    const closeRemarksModal = () => setShow1(false);
    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    const isPDF = (url) => /\.pdf$/i.test(url);
    const onActionClick1 = (fileUrl) => {
        if (isImage(fileUrl)) {
            setOpenImage(fileUrl); // Set image URL
            setOpenPDF(null); // Reset PDF
        } else if (isPDF(fileUrl)) {
            setOpenPDF(fileUrl); // Set PDF URL
            setOpenImage(null); // Reset Image
        } else {
            setOpenImage(null);
            setOpenPDF(null);
        }
        setShow1(true)
    };
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])
    const [selectedRows, setSelectedRows] = useState([]);

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
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getMiroApprovalDetailsList/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}/${5}/${UserDetails.plantids}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results;
                        setLandingData(stoData);
                            setSelectedRows([]);
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

    const [moduleTypeId, setModuleTypeId] = useState('');

    const onSelectedRowsChange = (selectedRowState) => {
        setSelectedRows(selectedRowState.selectedRows || []);
    };

    const handleSubmitSelected = () => {
        if (!selectedRows.length) {
            errorToast('Please select at least one invoice to submit');
            return;
        }
        const rowsWithLines = selectedRows.filter((row) => Array.isArray(row.lines) && row.lines.length > 0);
        if (!rowsWithLines.length) {
            errorToast('Selected invoice does not contain line details');
            return;
        }
        const batchLines = rowsWithLines.flatMap((row) => row.lines);
        const batchMiroIds = rowsWithLines.map((row) => row.ids).join(',');
        const totalAmount = batchLines.reduce((sum, item) => sum + Number(item.gross_amount || 0), 0);
        const postData = {
            poData: batchLines,
            miroIds: batchMiroIds,
            status: 6,
            remarks: 'Submitted from list',
            USERID: UserDetails.USERID,
            totalAmount: totalAmount.toFixed(2)
        };

        confirmDialog({
            title: 'Confirm Submit',
            description: `Submit ${rowsWithLines.length} selected invoice(s)?`
        }).then((res) => {
            if (!res) return;
            showLoader();
            apiPostMethod(apiBaseUrl + "MigoAutomationController/MiroUpdateSAP", postData)
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        ShowToast('Submit successful');
                        setSelectedRows([]);
                        getLoadingData();
                    } else {
                        errorToast(data.message || 'Submit failed');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    errorToast('Something went wrong, please try again after sometime');
                })
                .finally(() => {
                    hideLoader();
                });
        });
    };

   
    const columns = [...taColumns,actionsCol1, actionsCol];
    return (
        <div>
                <Card >
                    <CardHeader><h5>INVOICE SUBMIT APPROVAL - 1</h5></CardHeader>
                    <hr />
                    
                    <CardBody>
                        <Row>
                            <Col md="3" sm="3">
                                <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                            </Col>
                            <Col md="7" sm="7">
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
                            <Col md="2" sm="2">
                                <FormGroup className='mt-2'>
                                    <Button
                                        color="success"
                                        type="button"
                                        onClick={handleSubmitSelected}
                                        disabled={!selectedRows.length}
                                    >
                                        Submit
                                    </Button>
                                </FormGroup>
                            </Col>
                            <Col md="2" sm="2" className="d-flex align-items-center">
                                {selectedRows.length > 0 && (
                                    <div className="text-muted">
                                        {selectedRows.length} selected
                                    </div>
                                )}
                            </Col>
                        </Row>
                        <TableComponent
                            select
                            onSelectedRowsChange={onSelectedRowsChange}
                            showDownload
                            columns={columns}
                            data={landingData}
                        />
                    </CardBody>
                </Card> 
            {show ? <MiroSubmitDetailsApproval setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} lines={lines} status={2} miroIds={miroIds} getLoadingData={getLoadingData} weighment={false} /> : null}

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}

            <Modal show={show1} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title> <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    {/* <Row>
                        <Col sm="12" md="12" style={{ textAlign: "end" }}>
                        <Printer size={16} onClick={print} color="blue" style={{ cursor: "pointer" }} />
                        </Col>
                    </Row> */}
                    <Row>
                            {/* Show Image if available */}
                        {openImage && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <img src={encodeURI(openImage)} alt="Invoice Copy" style={{ width: "100%", maxWidth: "600px" }} />
                            </Col>
                        )}

                        {/* Show PDF if available */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <iframe src={encodeURI(openPdf)} title="PDF Preview" style={{ width: "100%", height: "600px", border: "none" }} />
                            </Col>
                        )}

                        {/* Alternative Link if PDF is blocked */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center", marginTop: "10px" }}>
                                <a href={encodeURI(openPdf)} target="_blank" rel="noopener noreferrer">Open PDF in New Tab</a>
                            </Col>
                        )} 
                    </Row>
                </Modal.Body>
                </Modal>
        </div >

 
    );
};

export default MiroSubmitApprovalMG;
