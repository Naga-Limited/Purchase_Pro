import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { Plus, Search, X } from 'react-feather';
import { Button, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { errorToast } from '../../helper/appHelper';
import { apiBaseUrl } from '../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { useSelector } from 'react-redux';
import BarcodeScanner from '../common/BarcodeScanner';

const PurchaseOrderInfo = ({ purchaseOrderList, purchaseOrderDetails, poDetails, getPoDetails, setPoType, poType, moduleTypeId, setPoNo, poNo, checkInvoiceNo, setInvoiceNo, invoiceNo, IsDisableForPo, plantCode, poTypeData, plantName, gateInOutInfoData, poData, isDisable, subModuleTypeId ,screen}) => {

    const rmPurchaseDetails = purchaseOrderDetails[0]

    const [isInvoice, setIsInvoice] = useState(false)
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    const isShowInvoice = () => {
        if (moduleTypeId == 11 || moduleTypeId == 'purchase' || subModuleTypeId == 5 || subModuleTypeId == 25 || moduleTypeId == 25 || moduleTypeId == 35) {
            setIsInvoice(true)
        }
    }

    const getGatepassDeliveryInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData?.gateInOutInfoId}`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData?.gateInOutInfoId}`)
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

    function handleremove(poNumber) {

        let purchaseLength = purchaseOrderDetails.length;

        setPoNo('PO Number')
        confirmDialog({
            title: `<h4>Are you sure want to Remove?<h4>`,
        }).then((res) => {
            if (res) {
                let selectedItem
                purchaseOrderList.forEach((item) => {
                    if (item['poNumber'] == poNumber) {
                        selectedItem = item
                        purchaseOrderList.splice(purchaseOrderList.indexOf(selectedItem), 1);
                    }
                });

                for (let i = 0; i < purchaseLength; i++) {
                    purchaseOrderDetails.forEach((item) => {
                        if (item['poNumber'] == poNumber) {
                            selectedItem = item

                            console.log("selectedItem", selectedItem);

                            purchaseOrderDetails.splice(purchaseOrderDetails.indexOf(selectedItem), 1);
                        }
                    });
                }
                setPoNo('')
            }
            else {
                setPoNo('')
            }
        })
    }

    useEffect(() => {
        getGatepassDeliveryInfo()
        isShowInvoice()
        QRCodeControl()
    }, [])

    const [QRControl, SetQRControl] = useState(false);
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const QRCodeControl = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == 1) {
                    SetQRControl(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const handleScan = (barcode) => {
        fetchData(barcode)
    };
    const fetchData = (barcode) => {
        console.log(`Fetching data for barcode: ${barcode}`);
        // setTruckValue(barcode)
        // checkUserGate(barcode)
        setPoNo(barcode)
        getPoDetails('list',barcode); 
        setPoType('show');
    };

    const InvoiceCheck = () => {
        const postdata = {
            invoiceNo: invoiceNo?invoiceNo:0,            
            vendorCode: poDetails.VENDOR,
            poNumber: poDetails.PO_NO,
            gateId: UserDetails.GATE_ID,
          }
        apiPostMethod(apiBaseUrl + 'GatePro/Gate/CheckVendorInvoice',postdata)
        .then((response) => {
          const data = response.data;
            if (data.success == true) {
                checkInvoiceNo()
            }else{
                confirmDialog({
                    title: `<h5><strong class="text-white">Invoice No Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                  })
                poDetails=''
                setPoType([])
                setInvoiceNo('')
            } 
           }).catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    return (
        <>
            <Col md="12" sm="12"><hr></hr></Col>

            <Col md="12" sm="12">
                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
            </Col>

            {gateInOutInfoData != '' ? <>
                {poData?.map((poDetails) => (<>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>PO NUMBER</Label>
                            <Input placeholder="Po Number" value={poDetails?.poNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>PO Type</Label>
                            <Input type="text" placeholder="Enter Invoice No" value={poDetails?.name} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>INVOICE NO</Label>
                            <Input placeholder="Invoice No" value={poDetails?.invoiceNo} disabled />
                        </FormGroup>
                    </Col>
                    < Col md="3" sm="3" >
                        <FormGroup>
                            <Label>VENDOR NAME</Label>
                            <Input placeholder="Vendor Name" value={poDetails?.vendorName} disabled />
                        </FormGroup>
                    </Col>
                </>))}

                {gatepassDeliveryData != '' ? <>
                    <Col md="12" sm="12"><hr></hr></Col>

                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                    </Col>
                    {gatepassDeliveryData?.map(gatepassDeliveryData => (<>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Return Type</Label>
                                <Input type="text" placeholder="Enter Return Type" value={gatepassDeliveryData.gatePassType} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Gate Pass No</Label>
                                <Input type="text" placeholder="Enter Gate Pass No" value={gatepassDeliveryData.gatePassNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={gatepassDeliveryData.fromPlantName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12" sm="12">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                        <th className="bg-primary text-white text-center">MATERIAL</th>
                                        <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                        <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                        {gatepassDeliveryData.sapLine[0].toPlantName != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                    </tr>
                                </thead>
                                {gatepassDeliveryData?.sapLine.map((lineItem) => {
                                    return (
                                        <tbody key={lineItem.lineItem}>
                                            <tr>
                                                <td className='text-center'>{lineItem?.lineItem}</td>
                                                <td>{lineItem?.material}</td>
                                                <td className='text-center'>{lineItem?.uom}</td>
                                                <td className='text-center'>{lineItem?.quantity}</td>
                                                {lineItem?.toPlantName != '' ? <td className='text-center'>{lineItem?.toPlantName}</td> : null}
                                            </tr>
                                        </tbody>
                                    )
                                })}
                            </table>
                        </Col>
                    </>))}
                </> : null}
            </> : null}

            {gateInOutInfoData == '' || isDisable || subModuleTypeId == 5 || subModuleTypeId == 25 || subModuleTypeId == 7 || subModuleTypeId == 13 || subModuleTypeId == 23 ? <>
                {/* {(QRControl === false || screen == 'loadingUnloadingInfo') &&
                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>PO Number</Label>
                            <InputGroup>
                                <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} disabled={(rmPurchaseDetails && moduleTypeId == 14) || (poType == 'show') ? true : false} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list'); setPoType('show') }}>
                                    <Search size={20} />
                                </Button>
                            </InputGroup>
                        </FormGroup>
                    </Col>
                } */}
                {/* {QRControl == true && screen != 'loadingUnloadingInfo' && */}
                <Col md="4" sm="4">
                            <BarcodeScanner onScan={handleScan} Label={'PO'}/>
                            {/* <QRCodeScanner /> */}
                            <InputGroup>
                            <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} disabled={(rmPurchaseDetails && moduleTypeId == 14) || (poType == 'show') ? true : false} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list'); setPoType('show') }}>
                                    <Search size={20} />
                            </Button>
                            </InputGroup>
                        </Col>
                        {/* } */}
                {poType == 'show' && isInvoice ?
                    <Col md="4" sm="4">
                        <Label>Invoice No / Delivery Challan</Label>
                        <Input type="text" placeholder="Invoice No / Delivery Challan" onChange={(e) => setInvoiceNo(e.target.value)} value={invoiceNo} />
                    </Col> : null
                }
                {poTypeData != '' && poType == 'show' && moduleTypeId != 14 ? <>
                    {[poDetails].map((poDetails) => (
                        <Col md="12" sm="12" key={poDetails?.PO_NO != undefined ? poDetails?.PO_NO : poDetails?.PO_NUMBER}>
                            <Row>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO NUMBER</Label>
                                        <Input placeholder="Po Number" value={poDetails?.PO_NO ? poDetails?.PO_NO : poDetails?.PO_NUMBER} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO TYPE</Label>
                                        <Input placeholder="Po Type" value={poDetails?.REFERENCE ? poDetails?.REFERENCE : poTypeData?.name} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>FROM PLANT</Label>
                                        <Input placeholder="Plant Name" value={poDetails?.FROMPLANT ? poDetails?.FROMPLANT : plantCode} disabled />
                                    </FormGroup>
                                </Col>
                                {poDetails?.VENDOR_NAME == '' ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>TO PLANT</Label>
                                            <Input placeholder="To Plant" value={plantCode} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {poDetails?.VENDOR_NAME != '' ?
                                    < Col md="3" sm="3" >
                                        <FormGroup>
                                            <Label>VENDOR NAME</Label>
                                            <Input placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                            </Row>
                        </Col>
                    ))} </> : null
                }

                {poTypeData != '' && poDetails != '' && poType == 'show' && moduleTypeId != 14 ? <>
                    {poDetails != "" ? <Col sm="4" md="4" style={{ marginLeft: "50px" }}></Col> : <Col sm="6" md="6"></Col>}
                    <Col sm="2" md="2">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button" onClick={(moduleTypeId == 20 || moduleTypeId == 6 || moduleTypeId == 13) ? checkInvoiceNo :InvoiceCheck}>
                                <Plus size={16} /> Add
                            </Button.Ripple>
                        </FormGroup>
                    </Col> </> : null
                }

                {IsDisableForPo && moduleTypeId != 14  ?
                    <Col md="12" sm="12">
                        <label></label>
                        <table className="table table-bordered">
                            <thead >
                                <tr>
                                    <th className="bg-primary text-white">PO Number</th>
                                    {isInvoice ? <th className="bg-primary text-white">Invoice No /<br /> Delivery Challan</th> : null}
                                    <th className="bg-primary text-white">PO Type</th>
                                    <th className="bg-primary text-white">From Plant</th>
                                    {moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 13 || moduleTypeId == 14 ? <th className="bg-primary text-white">To Plant</th> : <th className="bg-primary text-white">Vendor Name</th>}
                                    <th className="bg-primary text-white">Remove</th>
                                </tr>
                            </thead>
                            {purchaseOrderList?.map((poDetailsData) => (
                                <tbody key={poDetailsData.poNumber}>
                                    <tr>
                                        <td>{poDetailsData?.poNumber}</td>
                                        {isInvoice ? <td>{poDetailsData?.invoiceNo}</td> : null}
                                        <td>{poDetailsData?.poName}</td>
                                        <td>{poDetailsData?.plantCode}</td>
                                        {moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 13 || moduleTypeId == 14 ?
                                            <td>{poDetailsData?.toPlantCode}</td> : <td>{poDetailsData?.vendorName}</td>}
                                        <td className="text-center"><X size={16} onClick={() => handleremove(poDetailsData?.poNumber)} /></td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                    </Col> : null
                }

                {IsDisableForPo && moduleTypeId == 14 ?
                    <Col md="12" sm="12">
                        <label></label>
                        <table className="table table-bordered">
                            <thead >
                                <th className="bg-primary text-white">PO Number</th>
                                <th className="bg-primary text-white">PO Type</th>
                                <th className="bg-primary text-white">Plant</th>
                                <th className="bg-primary text-white">Vendor Name</th>
                            </thead>
                            <tbody>
                                <td>{rmPurchaseDetails?.poNumber}</td>
                                <td>{rmPurchaseDetails?.poType}</td>
                                <td>{rmPurchaseDetails?.plantCode}</td>
                                <td>{rmPurchaseDetails?.vendorName}</td>
                            </tbody>
                        </table>
                    </Col> : null
                }
            </> : null}
        </>
    )
}

export default PurchaseOrderInfo
