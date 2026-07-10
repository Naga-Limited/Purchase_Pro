import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader } from "reactstrap";
import { useEffect } from "react";
import { ArrowLeft, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

const OverAllDetails = ({ setShow, show, gateInOutInfoId }) => {

    useEffect(() => {
        getGateInInfo()
    }, [])

    const [data, setData] = useState([])
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [sapLine, setSapLine] = useState([])
    const [salesReturnInfo, setSalesReturnInfo] = useState([])

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId == 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId == 3);

    const [invoiceData, setInvoiceData] = useState([])
    const [fgDetailsData, setfgDetailsData] = useState([])

    const totalDeliveryQty = (invoiceData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
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
                    setInvoiceData(data.invoiceInfo)
                    setWeighmentImages(data.weighmentImages)
                    setSalesReturnInfo(data.salesReturnInfo)
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
                    getGatepassDeliveryInfo(data.results[0].fromGateInOutInfoId > 0 ? data.results[0].fromGateInOutInfoId : data.results[0].gateInOutInfoId)

                    const postData = { tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber }

                    console.log(apiBaseUrl + "LandingDataController/FGReturn_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/FGReturn_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                setSapLine(data.data[0].SAP_LINE);
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
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

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
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
                        </>))}

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>

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

                        {data.moduleTypeId != 13 ?
                            <Col sm="1" md="1">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>Attachments:</b></Label>
                                    </div>
                                </FormGroup>
                            </Col> : null
                        }

                        {(data.pickSlipCopy) && (data.moduleTypeId == 2 || data.moduleTypeId == 6 || data.moduleTypeId == 20) ?
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
                        {data.shipmentCopy && data.moduleTypeId == 1 ?
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={data.shipmentCopy}>
                                        <Button outline color="success" type="button">
                                            Shipment Copy
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col> : null
                        }
                        {(data.returnDocument || data.rejectionDeclarationForm) && (data.moduleTypeId == 4) ?
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
                        {(data.gatePassDocument || data.receiptCopy) && (data.moduleTypeId == 5 || data.moduleTypeId == 22) ?
                            <Col sm="6" md="6">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    {data.gatePassDocument ?
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
                        {(data.invoiceCopy || data.invoiceOrDeliveryDocumentSlip) && (data.moduleTypeId == 7 || data.moduleTypeId == 8 || data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 22 || data.moduleTypeId == 16) ? <>

                            {data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 16?
                                <Col sm="4" md="4">
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <a target="_blank" href={data.invoiceOrDeliveryDocumentSlip}>
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

                        {data.moduleTypeId == 3 ? <>
                            <Col md="12" sm="12"><hr></hr></Col>
                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Invoice Info</u></h4><br />
                            </Col>

                            {sapLine?.map(sapLine => (<>

                                <Col md="12" sm="12">
                                    <b className="text-gray" key={sapLine.LINE_ITEM}><u>DELIVERY NO : {sapLine?.DELIVERY_NO}</u> : ( Invoice No: {sapLine?.INVOICE_NO} ) ( PGI Status : {sapLine?.PGI_COMPLETION == 'C' ? 'Completed' : sapLine?.PGI_COMPLETION == 'A' ? "Waiting at PGI" : sapLine?.PGI_COMPLETION} )</b>
                                </Col>

                                {sapLine?.ITEM.map((lineItem, i) => {
                                    return (
                                        <Col md="12" sm="12">
                                            <Row key={lineItem.ITEM}>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>Line</Label>
                                                        <Input type="text" placeholder="Enter Line" value={lineItem?.ITEM} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>Material</Label>
                                                        <Input type="text" placeholder="Enter Material" value={lineItem?.MATERIAL} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>Quantity</Label>
                                                        <Input type="text" placeholder="Enter Quantity" value={lineItem?.QUANTITY} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>Uom</Label>
                                                        <Input type="text" placeholder="Enter Uom" value={lineItem?.UOM} disabled />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Col>
                                    )
                                })}
                            </>))} </> : null
                        }

                        {data.moduleTypeId != 3 && invoiceData != "" ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Invoice Info</u></h4><br />
                                </Col>


                                {invoiceData.map(invoiceData => (<>

                                    <Col md="12" sm="12" key={invoiceData?.line}>
                                        <Row>
                                            <Col md="3" sm="3">
                                                <FormGroup>
                                                    <Label>Delivery No</Label>
                                                    <Input type="text" placeholder="Delivery No" value={invoiceData?.deliveryNumber} disabled />
                                                </FormGroup>
                                            </Col>

                                            {invoiceData.poNumber ?
                                                <Col md="2" sm="2">
                                                    <FormGroup>
                                                        <Label>PO Number</Label>
                                                        <Input type="text" placeholder="PO Number" value={invoiceData?.poNumber} disabled />
                                                    </FormGroup>
                                                </Col> : null
                                            }

                                            <Col md="2" sm="2">
                                                <FormGroup>
                                                    <Label>Delivery Qty</Label>
                                                    <Input type="text" placeholder="Delivery Qty In Bag" value={Number(invoiceData?.deliveryQty).toFixed(2)} disabled />
                                                </FormGroup>
                                            </Col>

                                            {invoiceData.invoiceNumber ?
                                                <Col md="2" sm="2">
                                                    <FormGroup>
                                                        <Label>Invoice No</Label>
                                                        <Input type="text" placeholder="Invoice No" value={invoiceData?.invoiceNumber} disabled />
                                                    </FormGroup>
                                                </Col> : null
                                            }

                                            {invoiceData.toStorageLocation ?
                                                <Col md="2" sm="2">
                                                    <FormGroup>
                                                        <Label>Storage Location</Label>
                                                        <Input type="text" placeholder="Storage Location" value={invoiceData?.toStorageLocation} disabled />
                                                    </FormGroup>
                                                </Col> : null
                                            }

                                            <Col md="3" sm="3">
                                                <FormGroup>
                                                    <Label>PGI Status</Label>
                                                    <Input type="text" placeholder="PGI Status" value={invoiceData?.PgiCompletion == 'C' ? 'Completed' : invoiceData?.PgiCompletion} disabled />
                                                </FormGroup>
                                            </Col>
                                        </Row>
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
                                {poDetails?.vendorCode && poDetails?.invoiceNo && data.moduleTypeId != 12 && data.moduleTypeId != 15 && data.moduleTypeId != 21 ?
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
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant First Weight</Label>
                                    <Input type="text" placeholder="Enter Redirect Plant" value={data?.fromPlantFirstWeightByRedirect} disabled />
                                </FormGroup>
                            </Col>
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
                            {data?.redirectPlantName == null ?
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
                                                <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                                                <td className="bg-primary text-white text-center">MATERIAL</td>
                                                <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                                                <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                                                <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td>
                                            </thead>
                                            {data.sapLine.map((lineItem) => {
                                                return (
                                                    <tbody key={lineItem.lineItem}>
                                                        <td className='text-center'>{lineItem?.lineItem}</td>
                                                        <td>{lineItem?.material}</td>
                                                        <td className='text-center'>{lineItem?.uom}</td>
                                                        <td className='text-center'>{lineItem?.quantity}</td>
                                                        <td className='text-center'>{lineItem?.toPlantName}</td>
                                                    </tbody>
                                                )
                                            })}
                                        </table>
                                        <br />
                                    </Col>
                                </>))}
                            </> : null
                        }

                        {data.weighmentInfoId > 0 ?

                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                {data.moduleTypeId == 7 || data.moduleTypeId == 13 ? <>

                                    <Col md="3" sm="3"><Label>Empty Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Load Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                                    <Col md="3" sm="3"><Label>Remarks</Label></Col>

                                    {weighmentData.map((weighmentData) => (<>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Empty Weight" value={weighmentData?.firstWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm="3">
                                            <FormGroup>
                                                <Input typr="text" placeholder="Remarks" value={weighmentData?.remarks} disabled />
                                            </FormGroup>
                                        </Col>
                                    </>))}

                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All Empty Weight</Label>
                                            <Input typr="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All Load Weight</Label>
                                            <Input typr="text" placeholder="Enter Load Weight" value={overAllWeight.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Over All Net Weight</Label>
                                            <Input typr="text" placeholder="Enter Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                                        </FormGroup>
                                    </Col>

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
