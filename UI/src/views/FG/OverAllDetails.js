import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader } from "reactstrap";
import { useEffect } from "react";
import { Edit, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../Uploader";
import { HrLine } from "../common/HrLine";
import { useLoader } from "../../utility/hooks/useLoader";
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const OverAllDetails = ({ setShow, show, gateInOutInfoId }) => {

    useEffect(() => {
        getGateInInfo()
    }, [])

    const [data, setData] = useState([])
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [returnDeliveryData, setReturnDeliveryData] = useState([])
    const [salesReturnInfo, setSalesReturnInfo] = useState([])

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId == 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId == 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [stoDeliveryData, setStoDeliveryData] = useState([])
    const [extraCopy, setExtraCopy] = useState([])
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                    setWeighmentImages(data.weighmentImages)
                    setSalesReturnInfo(data.salesReturnInfo)
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId, data.results[0].gateInOutInfoId)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
                    getGatepassDeliveryInfo(data.results[0].fromGateInOutInfoId > 0 ? data.results[0].fromGateInOutInfoId : data.results[0].gateInOutInfoId)
                    getReturnDeliveryDetails(data.results[0].gateInOutInfoId)
                    getDeliveryDetails(data.results[0].gateInOutInfoId)
                    getExtraAttachment(data.results[0].gateInOutInfoId)
                    materialDetailsGet(data.results[0].gateInOutInfoId)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getDeliveryDetails = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getDeliveryDetails/${gateInOutInfoId}`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getDeliveryDetails/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setSalesDeliveryData(data.salesDeliveryInfo)
                    setStoDeliveryData(data.stoDeliveryInfo)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])

    const getWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
                    let lastItem = data.data.slice(-1)[0]
                    setOverAllWeight(lastItem)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getPurchaseOrder = (loadingUnloadingInfoId, gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

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

    const getReturnDeliveryDetails = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getReturnDeliveryDetails/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getReturnDeliveryDetails/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setReturnDeliveryData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {}, sendingWBSlip: {} });
    const [ImgData, setImgData] = useState({});

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    let { showLoader, hideLoader } = useLoader();

    const AddDatasPO = () => {


        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            userInfoId: UserDetails.USERID,
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();

            let { pickSlipCopy, sendingWBSlip } = ImgData;

            postdata.append("image[]", pickSlipCopy);
          

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.pickSlipCopy && attachedFiles.pickSlipCopy.name && attachedFiles.pickSlipCopy.name.length ? true : false;
            
            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");
            confirmDialog({
                title: 'Are you sure to Add?',
                description: 'Extra Attachment',
              }).then((res) => {
            if (res) {
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.pickSlipCopy = data.files[0] ? data.files[0].updname : "";
                        submit(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
            }});   
        } else {
            errorToast("Please Add Attachments");
        }
    };
    const submit = (fdata) => {

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/ExtraAttachmentCopyInsert", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/ExtraAttachmentCopyInsert", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    window.setTimeout( function() {
                        window.location.reload();
                    }, 2000);
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }
    const getExtraAttachment = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/ExtraAttachmentCopyGet/${gateInOutInfoId}`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/ExtraAttachmentCopyGet/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setExtraCopy(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    const [materialInfo, setMaterialInfo] = useState([])
    const materialDetailsGet = (gateInOutData) => {
        const postData = { Vehicle_Number: gateInOutData.vehicleNo, userInfoId: UserDetails.USERID, isMovement: gateInOutData.isMovement }
        console.log(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`);
        apiPostMethod(apiBaseUrl + `LandingDataController/FGSaleMaterialDetailsGet/${gateInOutData}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMaterialInfo(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
    }

    return (
        <div>
            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Over All Details </h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={() => setShow(false)} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <ModalBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>

                        {data.shipmentOrderNo != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Shipment Order No</Label>
                                    <Input type="text" placeholder="Shipment Order No" value={data?.shipmentOrderNo} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.colorToken != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Color / Token" value={data?.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.truckType ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Truck Type" value={data?.truckType} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.moduleTypeId != 29 ? <>
                            {salesReturnInfo?.map((invoiceData) => (<>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Return Reference No</Label>
                                        <Input type="text" placeholder="Return Reference No" value={data?.returnRefNo} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Sales Invoice No</Label>
                                        <Input type="text" placeholder="Sales Invoice No" value={invoiceData?.invoiceNo} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Customer Name</Label>
                                        <Input type="text" placeholder="Customer Name" value={invoiceData?.customerName} disabled />
                                    </FormGroup>
                                </Col>
                            </>))} </> : null
                        }

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        {data.personName != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Person Name</Label>
                                    <Input type="text" placeholder="Reason" value={data?.personName} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.rejectReasonId != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Reason</Label>
                                    <Input type="text" placeholder="Reason" value={data?.rejectReasonId} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.remarks != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col sm="12" md="12"></Col>

                        <Col sm="1" md="1">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments:</b></Label>
                                </div>
                            </FormGroup>
                        </Col>

                        {(data.pickSlipCopy) && (data.moduleTypeId == 2 || data.moduleTypeId == 6 || data.moduleTypeId == 20 || data.moduleTypeId == 13) ?
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={data.pickSlipCopy}>
                                        <Button outline color="success" type="button">
                                            Delivery Document
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col> : null
                        }
                        {
                        data.shipmentCopy && (data.moduleTypeId == 1 || data.moduleTypeId == 29 || data.moduleTypeId == 37 || data.moduleTypeId == 43 || data.moduleTypeId == 39 || data.moduleTypeId == 40 || data.moduleTypeId == 41) ?
                        <>
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={data.shipmentCopy}>
                                        <Button outline color="success" type="button">
                                            Shipment Copy
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col>
                            {data.coaCopy &&
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={data.coaCopy}>
                                        <Button outline color="success" type="button">
                                            {data.moduleTypeId == 43 ? 'Outside WB Copy' : 'COA Copy'}
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col>}
                            </>: null
                            
                        }
                        {(data.returnDocument || data.rejectionDeclarationForm) && (data.moduleTypeId == 4 || data.moduleTypeId == 3) ?
                            <Col sm="6" md="6">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    {data.returnDocument ?
                                        <div className="mr-1">
                                            <a target="_blank" href={data.returnDocument}>
                                                <Button outline color="success" type="button">
                                                    Return Document
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                    {data.rejectionDeclarationForm ?
                                        <div className="mr-1">
                                            <a target="_blank" href={data.rejectionDeclarationForm}>
                                                <Button outline color="success" type="button">
                                                    Rejection Declaration Form
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                </FormGroup>
                            </Col> : null
                        }
                        {(data.gatePassDocument || data.handCarryGatePass || data.receiptCopy) && (data.moduleTypeId == 5 || data.moduleTypeId == 22) ?
                            <Col sm="6" md="6">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    {data.gatePassDocument ||  data.handCarryGatePass?
                                        <div className="mr-1">
                                            <a target="_blank" href={data.handCarryGatePass ? data.handCarryGatePass : data.gatePassDocument}>
                                                <Button outline color="success" type="button">
                                                    Gate Pass Document
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                    {data.receiptCopy ?
                                        <div className="mr-1">
                                            <a target="_blank" href={data.receiptCopy}>
                                                <Button outline color="success" type="button">
                                                    Receipt Copy
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                </FormGroup>
                            </Col> : null
                        }
                        {(data.invoiceCopy || data.invoiceOrDeliveryDocumentSlip || data.gatePassDocument) && (data.moduleTypeId == 7 || data.moduleTypeId == 8 || data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 25 || data.moduleTypeId == 22 || data.moduleTypeId == 16 || data.moduleTypeId == 14 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 38 || data.moduleTypeId == 40) ? <>

                            {data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 16 || data.moduleTypeId == 25 || data.moduleTypeId == 16 || data.moduleTypeId == 14 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 38 || data.moduleTypeId == 40 ?
                                <Col sm="4" md="4">
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <a target="_blank" href={ data.moduleTypeId == 38 ? data.gatePassDocument : data.invoiceOrDeliveryDocumentSlip}>
                                            <Button outline color="success" type="button">
                                                Invoice Copy / Delivery Document Slip
                                            </Button>
                                        </a>
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.moduleTypeId == 7 || data.moduleTypeId == 8 ?
                                <Col sm="2" md="2">
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <a target="_blank" href={data.invoiceCopy}>
                                            <Button outline color="success" type="button">
                                                Invoice Copy
                                            </Button>
                                        </a>
                                    </FormGroup>
                                </Col> : null
                            }
                        </> : null}
                        {extraCopy.map((extra,index) => (<>
                                <Col md="3" sm="3">
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <a target="_blank" href={extra?.attachment_copy}>
                                            <Button outline color="success" type="button">
                                                Extra Copy - {index + 1}
                                            </Button>
                                        </a>
                                    </FormGroup>
                                </Col>
                        </>))}
                        <HrLine />
                        {data?.gateOutDateStamp && (UserDetails.role == 'Security' || UserDetails.role == 'Admin') &&
                        <>
                        <Col sm="3" md="3">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b> Extra Attachments :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="Extra Attachments"
                                            id={"pickSlipCopy"}
                                            selectedFileName={attachedFiles.pickSlipCopy.name}
                                        />
                                    </div>
                                </FormGroup>
                        </Col>
                        <Col sm="3" md="3">
                        <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple color="danger" type="button" onClick={AddDatasPO}>
                                    <Edit size={16} /> Add
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        </>}
                        {data.moduleTypeId == 3 ? <>
                            <Col md="12" sm="12"><hr></hr></Col>
                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Invoice Info</u></h4><br />
                            </Col>

                            {returnDeliveryData?.map((deliveryData) => (
                                <Col md="12" sm="12">
                                    <Row>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Line Item</Label>
                                                <Input type="text" placeholder="Line Item" value={deliveryData?.lineItem} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Delivery No</Label>
                                                <Input type="text" placeholder="Delivery No" value={deliveryData?.deliveryNumber} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Invoice No</Label>
                                                <Input type="text" placeholder="Invoice No" value={deliveryData?.invoiceNumber} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>Delivery Qty</Label>
                                                <Input type="text" placeholder="Delivery Qty" value={deliveryData?.deliveryQty} disabled />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                            ))} </> : null
                        }                        

                        {data.moduleTypeId != 3 && salesDeliveryData != '' || stoDeliveryData != '' ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Invoice Info</u></h4><br />
                                </Col>

                                {salesDeliveryData != '' && data.moduleTypeId != 43?
                                    <>

                                        <Col md="12" sm="12">
                                            <FormGroup><b><u><span className='text-primary'>TYPE : </span>SALES</u></b></FormGroup>
                                        </Col>

                                        <Col md="2" sm="2"><Label>Type</Label></Col>
                                        <Col md="3" sm="3"><Label>Invoice No</Label></Col>
                                        <Col md="3" sm="3"><Label>Delivery No</Label></Col>
                                        <Col md="2" sm="2"><Label>Delivery Qty In Bag</Label></Col>
                                        <Col md="2" sm="2"><Label>PGI Status</Label></Col>

                                        {salesDeliveryData.map((deliveryData) => (
                                            <Col md="12" sm="12">
                                                <Row>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Type" value={deliveryData?.moduleType} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="3" sm="3">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Invoice No" value={deliveryData?.invoiceNumber} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="3" sm="3">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Delivery No" value={deliveryData?.deliveryNumber} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Delivery Qty In Bag" value={deliveryData?.deliveryQty} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="PGI Status" value={deliveryData?.PgiCompletion == 'C' ? 'Completed' : deliveryData?.PgiCompletion} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        ))}
                                    </> : null
                                }

                                {stoDeliveryData != '' ?
                                    <>
                                        <Col md="12" sm="12">
                                            <FormGroup><b><u><span className='text-primary'>TYPE : </span>STO</u></b></FormGroup>
                                        </Col>

                                        <Col md="2" sm="2"><Label>Type</Label></Col>
                                        <Col md="3" sm="3"><Label>PO Number</Label></Col>
                                        <Col md="3" sm="3"><Label>Delivery No</Label></Col>
                                        <Col md="2" sm="2"><Label>Delivery Qty In Bag</Label></Col>
                                        <Col md="2" sm="2"><Label>PGI Status</Label></Col>

                                        {stoDeliveryData.map((deliveryData) => (
                                            <Col md="12" sm="12">
                                                <Row>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Type" value={deliveryData?.moduleType} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="3" sm="3">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="PO Number" value={deliveryData?.poNumber} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="3" sm="3">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Delivery No" value={deliveryData?.deliveryNumber} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="Delivery Qty In Bag" value={deliveryData?.deliveryQty} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="2" sm="2">
                                                        <FormGroup>
                                                            <Input type="text" placeholder="PGI Status" value={deliveryData?.PgiCompletion == 'C' ? 'Completed' : deliveryData?.PgiCompletion} disabled />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        ))}
                                    </> : null
                                }
                                {materialInfo?.length > 0 && (
                                    <Col md="12" sm="12">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th className="bg-primary text-white text-center" width='10%'>Delivery No</th>
                                                    <th className="bg-primary text-white text-center" width='10%'>Invoice No</th>
                                                    <th className="bg-primary text-white text-center" width='10%'>Delivery Qty</th>
                                                    <th className="bg-primary text-white text-center" width='20%'>Material</th>
                                                    <th className="bg-primary text-white text-center" width='20%'>Bag Type</th>
                                                    <th className="bg-primary text-white text-center" width='10%'>Bag Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materialInfo?.map((lineItem, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">{lineItem?.deliveryNo}</td>
                                                        <td className="text-center">{lineItem?.invoiceNo}</td>
                                                        <td className="text-center">{lineItem?.deliveryQty}</td>
                                                        <td className="text-center">{lineItem?.material_description}</td>
                                                        <td className="text-center">{lineItem?.bagType}</td>
                                                        <td className="text-center">{lineItem?.bagCount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <br />
                                    </Col>
                                )}
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
                                        <Input type="text" placeholder="Po Type" value={data.moduleTypeId == 6 ? 'Stores & Spares' : poDetails.name} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.moduleTypeId == 6 || data?.moduleTypeId == 20 || data?.moduleTypeId == 13 ? <>
                                    {data?.movementTypeId == 1 ? <>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>From Plant</Label>
                                                <Input type="text" placeholder="From Plant" value={data?.werks} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3"></Col>
                                    </> : <>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>From Plant</Label>
                                                <Input type="text" placeholder="From Plant" value={data?.fromPlant} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Label>To Plant</Label>
                                                <Input type="text" placeholder="To Plant" value={data?.werks} disabled />
                                            </FormGroup>
                                        </Col> </>
                                    }
                                </> : null
                                }
                                {poDetails?.invoiceNo ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Invoice No</Label>
                                            <Input type="text" placeholder="Invoice No" value={poDetails?.invoiceNo} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {(poDetails?.vendorCode && poDetails?.invoiceNo && data.moduleTypeId != 12 && data.moduleTypeId != 15 && data.moduleTypeId != 21 && data.moduleTypeId != 25 && data.moduleTypeId != 33 && data.moduleTypeId != 34 && data.moduleTypeId != 1 && data.moduleTypeId != 16 && data.moduleTypeId != 35) || data.moduleTypeId == 14 ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Vendor Code</Label>
                                            <Input type="text" placeholder="Vendor Code" value={poDetails?.vendorCode} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {poDetails?.vendorName ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>Vendor Name</Label>
                                            <Input type="text" placeholder="Vendor Name" value={poDetails?.vendorName} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                            </>))} </> : null
                        }

                        {data?.isRedirect == 1 && data?.redirectPlantName == null ? <>
                            <Col md="12" sm="12"><hr></hr></Col>
                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Redirect Details</u></h4><br />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant</Label>
                                    <Input type="text" placeholder="Enter From Plant" value={data?.fromPlantByRedirect} disabled />
                                </FormGroup>
                            </Col>
                            {data?.fromPlantFirstWeightByRedirect != '' ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant First Weight</Label>
                                        <Input type="text" placeholder="Enter Redirect Plant" value={data?.fromPlantFirstWeightByRedirect} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Redirect Plant</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>
                        </> : null}

                        {data?.isRedirect == 1 && data?.redirectMasterPlantId > 0 ? <>
                            <Col md="12" sm="12"><hr></hr></Col>
                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Redirect Details</u></h4><br />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant</Label>
                                    <Input type="text" placeholder="Enter From Plant" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>
                            {data?.fromPlantFirstWeightByRedirect != '' ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant First Weight</Label>
                                        <Input type="text" placeholder="Enter Redirect Plant" value={data?.fromPlantFirstWeightByRedirect} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Redirect Plant</Label>
                                    <Input type="text" placeholder="Enter Redirect Plant" value={data?.redirectPlantName} disabled />
                                </FormGroup>
                            </Col>
                            {data?.redirectPlantFirstWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant First Weight</Label>
                                        <Input type="text" placeholder="Enter Empty Weight" value={data?.redirectPlantFirstWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data?.redirectPlantSecondWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant Second Weight</Label>
                                        <Input type="text" placeholder="Enter Empty Weight" value={data?.redirectPlantSecondWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data?.redirectPlantNetWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant Net Weight</Label>
                                        <Input type="text" placeholder="Enter Empty Weight" value={data?.redirectPlantNetWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                        </> : null}

                        {gatepassDeliveryData != '' ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
                                </Col>

                                {gatepassDeliveryData.map((data) => (
                                    <Col md="12" sm="12" key={data?.gatePassNo}>
                                        <Row>

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
                                        </Row>
                                    </Col>
                                ))}
                            </> : null
                        }

                        {data.weighmentInfoId > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                {data.moduleTypeId == 7 || data.moduleTypeId == 13 || data.moduleTypeId == 5 || data.moduleTypeId == 27 || data.moduleTypeId == 28 ? <>

                                    <Col md="12" sm="12">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th className="bg-primary text-white text-center">First Weight</th>
                                                    <th className="bg-primary text-white text-center">Second Weight</th>
                                                    <th className="bg-primary text-white text-center">Net Weight</th>
                                                    <th className="bg-primary text-white text-center">Remarks</th>
                                                </tr>
                                            </thead>
                                            {weighmentData.map((weighmentData) => (
                                                <tbody>
                                                    <tr>
                                                        <td className='text-center'>{weighmentData?.firstWeight}</td>
                                                        <td className='text-center'>{weighmentData?.secondWeight}</td>
                                                        <td className='text-center'>{weighmentData?.netWeight}</td>
                                                        <td className='text-center'>{weighmentData?.remarks}</td>
                                                    </tr>
                                                </tbody>
                                            ))}
                                            <tbody className="bg-primary text-white">
                                                <tr>
                                                    <td className='text-center'>Over All First Weight : {data?.firstWeight}</td>
                                                    <td colSpan={2} className='text-center'>Over All Second Weight : {overAllWeight.secondWeight}</td>
                                                    <td className='text-center'>Over All Net Weight : {data?.movementTypeId == 2 ? Number(data?.firstWeight - overAllWeight.secondWeight) : Number(overAllWeight.secondWeight - data?.firstWeight)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>

                                    {/* <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Remarks</Label></Col>

                                    {weighmentData.map((weighmentData) => (<>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input type="text" placeholder="Remarks" value={weighmentData?.remarks} disabled />
                                            </FormGroup>
                                        </Col>
                                    </>))}

                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All First Weight</Label>
                                            <Input type="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All Second Weight</Label>
                                            <Input type="text" placeholder="Enter Second Weight" value={overAllWeight.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All Net Weight</Label>
                                            <Input type="text" placeholder="Enter Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                                        </FormGroup>
                                    </Col> */}

                                </> : data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 25 || data.moduleTypeId == 29 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 1 || data.moduleTypeId == 2 ?
                                    <>
                                        <Col md="12" sm="12">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-primary text-white text-center">Document Number</th>
                                                        <th className="bg-primary text-white text-center">First Weight</th>
                                                        <th className="bg-primary text-white text-center">Second Weight</th>
                                                        <th className="bg-primary text-white text-center">Net Weight</th>
                                                    </tr>
                                                </thead>
                                                {weighmentData.map((weighmentData) => (
                                                    <tbody>
                                                        <tr>
                                                            <td className='text-center'>{weighmentData?.documentNumber}</td>
                                                            <td className='text-center'>{weighmentData?.firstWeight}</td>
                                                            <td className='text-center'>{weighmentData?.secondWeight}</td>
                                                            <td className='text-center'>{weighmentData?.netWeight}</td>
                                                        </tr>
                                                    </tbody>
                                                ))}
                                                <tbody className="bg-primary text-white">
                                                    <tr>
                                                        <td className='text-center'>Over All First Weight : {data?.firstWeight}</td>
                                                        <td colSpan={2} className='text-center'>Over All Second Weight : {overAllWeight.secondWeight}</td>
                                                        <td className='text-center'>Over All Net Weight : {data?.movementTypeId == 2 ? Number(data?.firstWeight - overAllWeight.secondWeight) : Number(overAllWeight.secondWeight - data?.firstWeight)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </Col>

                                        {/* <Col md="3" sm="3"><Label>Document Number</Label></Col>
                                        <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                        <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                        <Col md="3" sm="3"><Label>Net Weight</Label></Col>

                                        {weighmentData.map((weighmentData) => (
                                            <>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Input type="text" placeholder="Remarks" value={weighmentData?.documentNumber} disabled />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Input type="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Input type="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Input type="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                                                    </FormGroup>
                                                </Col>
                                            </>
                                        ))}

                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Over All First Weight</Label>
                                                <Input type="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Over All Second Weight</Label>
                                                <Input type="text" placeholder="Enter Second Weight" value={overAllWeight.secondWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Over All Net Weight</Label>
                                                <Input type="text" placeholder="Enter Net Weight" value={data?.movementTypeId == 2 ? Number(data?.firstWeight - overAllWeight.secondWeight) : Number(overAllWeight.secondWeight - data?.firstWeight)} disabled />
                                            </FormGroup>
                                        </Col> */}
                                    </> :
                                    <>
                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>First Weight</Label>
                                                <Input type="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Second Weight</Label>
                                                <Input type="text" placeholder="Second Weight" value={data?.secondWeight} disabled />
                                            </FormGroup>
                                        </Col>

                                        <Col md="4" sm="4">
                                            <FormGroup>
                                                <Label>Net Weight</Label>
                                                <Input type="text" placeholder="Net Weight" value={data?.netWeight} disabled />
                                            </FormGroup>
                                        </Col>

                                        {totalDeliveryQty ?
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>{data.moduleTypeId == 1 ? "Shipment Weight" : "Delivery Weight"}</Label>
                                                    <Input type="text" placeholder="Delivery Weight" value={(totalDeliveryQty).toFixed(2)} disabled />
                                                </FormGroup>
                                            </Col> : null
                                        }

                                        {totalDeliveryQty ?
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>{data.moduleTypeId == 1 ? "Diff WB(Shipment Weight & Net weight)" : "Diff(Delivery Weight & Net weight)"}</Label>
                                                    <Input type="text" placeholder="Total Weight" value={(differentWeight).toFixed(2)} disabled />
                                                </FormGroup>
                                            </Col> : null
                                        }
                                    </>
                                }

                                <Col md="12" sm="12">
                                    <h5>First Weight :</h5><br />
                                </Col>

                                {firstWeight.map(firstWeight => (
                                    <Col md="3" sm="3" key={firstWeight?.imageUrl}>
                                        <img className="ml-2" style={{ width: "150px", height: "auto" }} src={firstWeight?.imageUrl}></img>
                                    </Col>
                                ))}

                                <Col md="12" sm="12"><br></br></Col>

                                <Col md="12" sm="12">
                                    <h5>Second Weight :</h5><br />
                                </Col>

                                {secondWeight.map(secondWeight => (
                                    <Col md="3" sm="3" key={secondWeight?.imageUrl}>
                                        <img className="ml-2" style={{ width: "150px", height: "auto" }} src={secondWeight?.imageUrl}></img>
                                    </Col>
                                ))}
                            </> : null
                        }

                    </Row>
                </ModalBody>
            </Modal>
        </div >
    );
};

export default OverAllDetails;
