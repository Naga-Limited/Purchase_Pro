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
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown, X } from "react-feather";
import ReactSelect from "react-select";
import RecieptEntryScreenDetails from "./RecieptEntryScreenDetails";
import RecieptEntryScreenApprovalDetails from "./RecieptEntryScreenApprovalDetails";
import MiroSubmitDetails from "./MiroSubmitDetails";
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
        minWidth: "250px",
    },
    {
        name: "GL NAME",
        selector: "glName",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "INVOICE NO",
        selector: "refDocNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "INVOICE DATE",
        selector: "docDate",
        sortable: true,
        minWidth: "120px",
    }, 
    {
        name: "AMOUNT",
        selector: "amount",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "TAX AMOUNT",
        selector: "totalTax",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "TOTAL AMOUNT",
        selector: "totalAmount",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "PLANT CODE",
        selector: "plantCode",
        sortable: true,
        minWidth: "100px",
    },
    
];

const InvoiceSubmitReject = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const actionsCol1 = {
        name: "INVOICE COPY",
        selector: "invoiceCopy",
        minWidth: "100px",
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
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
               
                    <Button.Ripple color="danger" size="sm" type="button" className='ml-1'  onClick={() => overAllDetails(row.id,row.status)}>Reject</Button.Ripple>
                   
                </Row>
            );
        },
    };

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [status, setStatus] = useState('')
    const [miroIds, setMiroIds] = useState('')
    const overAllDetails = (Id,status) => {
        setShow(true)  
        setMiroIds(Id)
        setStatus(status)
    };
    const [openImage, setOpenImage] = useState('');
    const [openPdf, setOpenPDF] = useState('');
    const [show1, setShow1] = useState(false)
    const closeRemarksModal = () => setShow1(false);
    const closeRemarksModal1 = () => setShow(false);

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
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getRejectDetailsList/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}`)
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

    const [moduleTypeId, setModuleTypeId] = useState('');
    const columns = [...taColumns,actionsCol1, actionsCol];

    const approveOrRejectVehicle = () => {
        const formData = form.values;

        const postdata = {
            id: miroIds,
            status: status == 1 ? 0 : 3,
            rejectReason: formData.rejectReason,
            userInfoId: UserDetails.USERID
        }
        if(!postdata.rejectReason){
            errorToast('Please Enter Reject Reason ...')
            return
        }
        showLoader();
        console.log(apiBaseUrl + "MigoAutomationController/RejectMiroEntry", postdata);
        apiPostMethod(apiBaseUrl + "MigoAutomationController/RejectMiroEntry", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    setShow(false)
                    getLoadingData()
                    form.resetForm()
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    return (
        <div>
                <Card >
                    <CardHeader><h5>INVOICE CONFIRMATION REJECT</h5></CardHeader>
                    <hr />
                    
                    <CardBody>
                        <Row>
                            <Col md="3" sm="3">
                                <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
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
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> 
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

                <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Invoice Submit Reject Reason<X onClick={closeRemarksModal1} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        
                        <Col sm="12" md="12">
                            <FormGroup>
                            <CustomTextInput
                                Label={'Reject Reason'}
                                placeholder="Reject Reason"
                                form={form} 
                                id={'rejectReason'} 
                                // inputMode="numeric"
                                // onChange={(e) => {
                                //     const value = e.target.value;
                                //     if (/^\d*$/.test(value)) {
                                //     form.setFieldValue('deduction_amount', value);
                                //     }
                                // }}
                            />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={approveOrRejectVehicle}>
                                    Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal >
        </div >

 
    );
};

export default InvoiceSubmitReject;
