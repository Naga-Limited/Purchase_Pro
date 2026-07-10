import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { useState } from "react";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { CustomTextInput, Yup } from "../forms/custom-form";
import { ArrowLeft, Check, X } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { useFormik } from "formik";
import Uploader from "../Uploader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "Invoice No",
        selector: "cashInvoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "100px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-center mb-0">
                    <p className="fs-6">{row.moduleType}</p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Screen Duration",
        selector: "createdOn",
        sortable: false,
        minWidth: "180px",
        cell: (row) => {
            return <ElapsedTimer date={row.createdOn} />
        },
    },
    {
        name: "Waiting At",
        selector: "StatusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>Waiting For In</Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const CashDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "200px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple color="primary" className='ml-1' type="button" onClick={() => openCashDetailsModal(row)}>Gate In</Button.Ripple>
                    <Button.Ripple color="danger" className='ml-1' type="button" onClick={() => updateLoadingUnloadingInfo(row)}>Reject</Button.Ripple>
                </Row>
            );
        },
    };

    const [data, setData] = useState([])
    const [cashData, setCashData] = useState([])
    const [cashDetailsData, setCashDetailsData] = useState([])
    const [cashDetailsModal, setCashDetailsModal] = useState(false)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    useEffect(() => {
        getCashInfo()
    }, [])

    const openCashDetailsModal = (row) => {
        setCashDetailsModal(true)
        setCashDetailsData(row)
        getCashInfoById(row.loadingAndUnloadingInfoId)
    }

    const getCashInfo = () => {
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setCashData(data.results.filter((item) => item.moduleTypeId == 16 && item.subModuleTypeId != 5 && item.subModuleTypeId != 25))
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

    const getCashInfoById = (loadingAndUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${loadingAndUnloadingInfoId}/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${loadingAndUnloadingInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setData(data.results[0])
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

    const updateLoadingUnloadingInfo = (data) => {

        const FrmData = {
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            invoiceNo: data.invoiceNo,
            truckNo: data.truckNo,
            masterPlantId: data.masterPlantId,
            eda: data.eda,
            remarks: data.remarks,
            fromDate: data.fromDate,
            toDate: data.toDate,
            personName: data.personName,
            phoneNo: data.phoneNo,
            tripSheetNo: data.tripSheetNo,
            isWeight: data?.isWeight?.value,
            statusId: 7,
            userInfoId: UserDetails.USERID,
        };
        confirmDialog({
            title: `<h4>Are you sure want to Reject?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                apiPostMethod(apiBaseUrl + "GatePro/Master/updateLoadingUnloadingInfo", FrmData)
                    .then((response) => {
                        const { data } = response;
                        if (data.success == true) {
                            ShowToast("Rejected Successfully");
                            setData([])
                            getCashInfo()
                            setCashDetailsModal(false)
                        }
                        else if (data.success == false) {
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
        })
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });


    const onSubmit = (fdata) => {
        apiPostMethod(apiBaseUrl + "GatePro/Master/addCashInfo", fdata)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setCashData([])
                    getCashInfo()
                    form.resetForm()
                    ShowToast(data.message);
                    setCashDetailsModal(false)
                } else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getCashInfo()
    }, [])

    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const upload = () => {

        let formData = form.values;

        const fdata = {
            loadingAndUnloadingInfoId: data.loadingAndUnloadingInfoId,
            moduleTypeId: data.moduleTypeId,
            personName: data.personName,
            phoneNo: data.phoneNo,
            remarks: formData.remarks ? formData.remarks : null,
            masterPlantId: data.masterPlantId,
            invoiceNo: data.cashInvoiceNo,
            userInfoId: UserDetails.USERID,
            invoiceAmount: data?.quantity !== undefined && data?.quantity !== null 
            ? Number(data.quantity).toFixed(0) 
            : "0",
        }

        console.log(fdata);

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            let { invoiceCopy } = postdata;

            postdata.append("image[]", invoiceCopy);

            let UploadFile = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;

            postdata.append("form_name", 'Cash');
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
                        onSubmit(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            onSubmit(fdata)
        }
    };

    const columns = [...taColumns, actionsCol];

    return (
        <>
            {cashData != '' ?
                <Card>
                    <CardHeader><h5>Cash Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent columns={columns} data={cashData} />
                    </CardBody>
                </Card> : null
            }

            <Modal show={cashDetailsModal} centered size="xl">
                <Row>
                    <Col md="12" sm="12">
                        <FormGroup>
                            <ModalHeader><h5>Cash Details</h5><X onClick={() => setCashDetailsModal(false)} /></ModalHeader>
                        </FormGroup>
                    </Col>
                </Row>
                <ModalBody>
                    <Row>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <Input type="text" placeholder="Module Type" value={cashDetailsData.moduleType} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Person Name</Label>
                                <Input type="text" placeholder="Person Name" value={cashDetailsData.personName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Phone No</Label>
                                <Input type="text" placeholder="Phone No" value={cashDetailsData.phoneNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={cashDetailsData.plantName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Invoice No</Label>
                                <Input type="text" placeholder="Invoice No" value={cashDetailsData.cashInvoiceNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Invoice Amount</Label>
                                <Input type="text" placeholder="Invoice No" 
                                 value={cashDetailsData?.quantity !== undefined && cashDetailsData?.quantity !== null 
                                    ? Number(cashDetailsData.quantity).toFixed(0) 
                                    : "0"} 
                                disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remarks"} type="text" id="remarks" form={form} />
                            </FormGroup>
                        </Col>

                        <Col sm="12" md="12">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Invoice Copy"
                                        id={"invoiceCopy"}
                                        selectedFileName={attachedFiles.invoiceCopy.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button outline color="primary" type="button" onClick={() => setCashDetailsModal(false)}>
                                    <ArrowLeft size={16} /> Back
                                </Button>
                            </FormGroup>
                        </Col>

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button color="primary" type="button" onClick={upload}> <Check size={16} /> Gate In </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    );
};

export default CashDetails;
