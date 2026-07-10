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
import { ArrowLeft, Check, X } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import Uploader from "../Uploader";
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";

export const taColumns = [

    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "300px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-center mb-0">
                    <p className="fs-6">{row.moduleType + ' - Hand Carry'}</p>
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
                        <Badge color="primary" pill> {row.moduleStatusId == 4 ? 'Gate Out' : 'Gate In'}</Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const HandCarryDetails = ({ data, setData, getAllGateInOutInfo, actionRendorer }) => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [gateInOutModal, setGateInOutModal] = useState(false);
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "80px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    {row.moduleStatusId == 0 ?
                        <Button.Ripple color="primary" className='ml-1' type="button" onClick={() => openGateInOutInfoModal(row)}>Gate In</Button.Ripple> : null
                    }
                    {row.moduleStatusId == 4 ?
                        <Button.Ripple color="primary" className='ml-1' type="button" onClick={() => openGateInOutInfoModal(row)}>Gate Out</Button.Ripple> : null
                    }
                </Row>
            );
        },
    };

    const [gateInOutDetails, setGateInOutDetails] = useState([])
    const [gateInOutInfoId, setGateInOutInfoId] = useState([])
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])
    const [poData, setPoData] = useState([])

    const openGateInOutInfoModal = (row) => {
        setGateInOutModal(true)
        setGateInOutDetails(row)
        setGateInOutInfoId(row.gateInOutInfoId)
        getGatepassDeliveryInfo(row.gateInOutInfoId)
        getPurchaseOrder(row.loadingUnloadingInfoId)
    }

    const getGatepassDeliveryInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatepassDeliveryData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const updateVehicleStatus = (fdata) => {

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message);
                    setData([])
                    setPoData([])
                    setGateInOutDetails([])
                    getAllGateInOutInfo()
                    setGateInOutModal(false)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    const submit = (fdata) => {
        if (!fdata.invoiceCopy && gateInOutDetails?.moduleTypeId == 16) {
            errorToast("Please Attach Invoice Copy")
        }
        // else if ((!fdata.gatePassDocument) && (gateInOutDetails?.moduleTypeId == 5 || gateInOutDetails?.moduleTypeId == 22)) {
        //     errorToast("Please Attach GatePass Document")
        // } 
        else {
            updateVehicleStatus(fdata)
        }
    }

    const [attachedFiles, setAttachment] = useState({ gatePassDocument: {}, invoiceCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const upload = (moduleStatusId) => {

        const fdata = {
            gateInOutInfoId: gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            userInfoId: UserDetails.USERID,
            gatePassNo: gatepassDeliveryData[0]?.gatePassNo,
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { gatePassDocument, invoiceCopy } = postdata;

            postdata.append("image[]", gatePassDocument);
            postdata.append("image[]", invoiceCopy);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.gatePassDocument && attachedFiles.gatePassDocument.name && attachedFiles.gatePassDocument.name.length ? true : false;
            UploadFile1 = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;

            postdata.append("form_name", gateInOutDetails.moduleTypeId == 22 ? 'GatePass_Receipt' : gateInOutDetails.moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.gatePassDocument = data.files[0] ? data.files[0].updname : "";
                        fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
                        submit(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            submit(fdata)
        }
    };

    const columns = [...taColumns, actionsCol];

    return (
        <>
            {data != '' ?
                <Card>
                    <CardHeader><h5>Hand Carry</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent columns={columns} data={data} />
                    </CardBody>
                </Card> : null
            }

            <Modal show={gateInOutModal} centered size="xl">
                <Row>
                    <Col md="12" sm="12">
                        <FormGroup>
                            <ModalHeader><h5>Gate In Details</h5><X onClick={() => setGateInOutModal(false)} /></ModalHeader>
                        </FormGroup>
                    </Col>
                </Row>
                <ModalBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Type</Label>
                                <Input type="text" placeholder="VA No" value={gateInOutDetails?.moduleType + ' - ' + gateInOutDetails.subModuleType} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="VA No" value={gateInOutDetails?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={gateInOutDetails?.plantName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Driver Phone No" value={gateInOutDetails?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        {gateInOutDetails.remarks != null ?
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Remarks" value={gateInOutDetails?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {(gateInOutDetails.moduleTypeId == 5 || gateInOutDetails.moduleTypeId == 22) && (gateInOutDetails.moduleStatusId == 4) ?
                            <Col sm="8" md="8">
                                <label></label>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>Attachments :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="GatePass Doc"
                                            id={"gatePassDocument"}
                                            selectedFileName={attachedFiles.gatePassDocument.name}
                                        />
                                    </div>
                                </FormGroup>
                            </Col> : null
                        }

                        {gateInOutDetails.moduleTypeId == 16 ?
                            <Col sm="8" md="8">
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
                            </Col> : null
                        }

                        {gatepassDeliveryData != '' ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
                                </Col>

                                {gatepassDeliveryData.map((data) => (<>

                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Return Type</Label>
                                            <Input type="text" placeholder="Enter Return Type" value={data.gatePassType} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Gate Pass No</Label>
                                            <Input type="text" placeholder="Enter Gate Pass No" value={data.gatePassNo} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant</Label>
                                            <Input type="text" placeholder="Enter Plant" value={data.fromPlantName} disabled />
                                        </FormGroup>
                                    </Col>

                                    <Col md="12" sm="12">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                                                    <td className="bg-primary text-white text-center">MATERIAL</td>
                                                    <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                                                    <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                                                    <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td>
                                                    <td className="bg-primary text-white text-center" width='20%'>VALUE</td>
                                                </tr>
                                            </thead>
                                            {data.sapLine.map((lineItem) => {
                                                return (
                                                    <tbody key={lineItem.lineItem}>
                                                        <tr>
                                                            <td className='text-center'>{lineItem?.lineItem}</td>
                                                            <td>{lineItem?.material}</td>
                                                            <td className='text-center'>{lineItem?.uom}</td>
                                                            <td className='text-center'>{lineItem?.quantity}</td>
                                                            <td className='text-center'>{lineItem?.toPlantName}</td>
                                                            <td className='text-center'>{lineItem?.value}</td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            })}
                                        </table>
                                        <br />
                                    </Col>
                                </>))}
                            </> : null
                        }

                        {poData != '' ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                            </Col>

                            {poData.map((poDetails) => (<>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Number</Label>
                                        <Input type="text" placeholder="PO Number" value={poDetails?.poNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Type</Label>
                                        <Input type="text" placeholder="Po Type" value={poDetails.name} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Plant</Label>
                                        <Input type="text" placeholder="PO Number" value={poDetails?.plantName} disabled />
                                    </FormGroup>
                                </Col>

                                {gateInOutDetails.moduleTypeId == 6 ? <Col md="3" sm="3"></Col> : null}

                                {gateInOutDetails.moduleTypeId != 6 ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Vendor Name</Label>
                                            <Input type="text" placeholder="Vendor Name" value={poDetails.vendorName} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                            </>))}
                        </> : null}

                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0 mt-1">
                                <Button outline color="primary" type="button" onClick={() => setGateInOutModal(false)}>
                                    <ArrowLeft size={16} /> Back
                                </Button>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2" className="d-flex justify-content-end mb-0 mt-1">
                            {gateInOutDetails.moduleStatusId == 0 ?
                                <Button color="primary" type="button" onClick={() => upload(1)}>
                                    <Check size={16} /> Gate In
                                </Button> : null
                            }
                            {gateInOutDetails.moduleStatusId == 4 ?
                                <Button color="primary" type="button" onClick={() => upload(5)}>
                                    <Check size={16} /> Gate Out
                                </Button> : null
                            }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    );
};

export default HandCarryDetails;
