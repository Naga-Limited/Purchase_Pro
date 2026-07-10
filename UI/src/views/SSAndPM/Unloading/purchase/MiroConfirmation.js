import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, InputGroup, } from "reactstrap";
import { useEffect } from "react";
import { Edit, Search, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../../../Uploader";
import { HrLine } from "../../../common/HrLine";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ShowToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { minDate } from "../../../common/dateComponent";

const MiroConfirmation = ({ }) => {

    // useEffect(() => {
    //     getGateInInfo()
    // }, [])

    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])
    const [isDisable, setIsDisable] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId == 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId == 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [truckValue, setTruckValue] = useState('');
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        showLoader()
        console.log(apiBaseUrl + `MigoAutomationController/getMiroDetails/${truckValue}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getMiroDetails/${truckValue}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                    // setMaterialInfo(data.materialDetails)
                    // getWeighmentInfo(data.results[0].gateInOutInfoId)
                    setIsDisable(true)
                    InvoiceValidation()
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            }).finally((a) => {
                hideLoader();
            });
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

  

 

    const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {}, sendingWBSlip: {} });
    const [ImgData, setImgData] = useState({});

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    let { showLoader, hideLoader } = useLoader();

 
   
    const [openImage, setOpenImage] = useState('');
    const [openPdf, setOpenPDF] = useState('');

    const closeRemarksModal = () => setShow1(false);
    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    const isPDF = (url) => /\.pdf$/i.test(url);

    const onActionClick = (fileUrl) => {
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
    const [invoiceDate, setInvoiceDate] = useState('');
    const handleInputChange = (value) => {
        setInvoiceDate(value);
      };
    const update = () => {
        const filteredPoData = poData.filter(item => item.selected === true);
        const totalAmount = filteredPoData.reduce((sum, item) => {
            return sum + (parseFloat(item.ITEM_AMOUNT) || 0);
        }, 0).toFixed(2);
    
        let postData = {
            poData: filteredPoData,
            postingDate: invoiceDate,
            totalAmount: totalAmount,
            userId: UserDetails.USERID
        };
    
        if (!postData?.poData?.length) {
            errorToast('Please select at least one MIRO line');
            return;
        }
    
        if (!postData?.postingDate) {
            errorToast('Please select a posting date');
            return;
        }
    
        confirmDialog({
            title: 'Are you sure to Post?',
            description: 'MIRO Total Amount - ' + postData.totalAmount
        }).then((res) => {
            if (res) {
                showLoader(); // ✅ Start loader only when confirmed
    
                apiPostMethod(apiBaseUrl + "MigoAutomationController/MiroPosting", postData)
                    .then((response) => {
                        const data = response.data;
                        if (data.success) {
                            confirmDialog({
                                title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`,
                                cancelButton: false,
                                confirmText: false,
                                confirmButton: false,
                                background: `#51A351`
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            errorToast(data.message);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally(() => {
                        hideLoader(); // ✅ Hide only after API call completes
                    });
            }
        });
    };
   
    const handleCheckboxChange = (index, isChecked) => {
        const updated = [...poData];
        updated[index].selected = isChecked;
        setPoData(updated); // or your state updater
    };
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        const updated = poData.map(item => ({ ...item, selected: checked }));
        setPoData(updated);
    };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const [date_control, setDate_control] = useState('');
      const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const days = parseInt(response?.data?.results[0]?.miro_date ?? 0);
            const today = new Date();
            const limitedDate = new Date(today);
            limitedDate.setDate(today.getDate() - days);
      
            const formattedMin = limitedDate.toISOString().split("T")[0];
            setDate_control(formattedMin); // use as min
          });
      };
    return (
        <div>
            {/* <Modal show={show} centered size="xl"> */}
            <Card>
                 <CardHeader className="text-center">
                    <h4 className="m-0">Invoice Acknowledgement - MIRO</h4>
                </CardHeader>
                <HrLine />
                <CardBody>
                 <Row>
                    <Col md="3" sm="3">
                    <FormGroup>
                        <h5>PO Number</h5>
                        <InputGroup>
                            <Input type="text" name="po_number" id="PONumber" placeholder="PO Number" 
                              onChange={(e) => setTruckValue(e.target.value.trim())} 
                              value={truckValue} 
                              disabled={isDisable} 
                              maxLength={10} />
                        <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                            <Search size={20} disabled={isDisable}/>
                        </Button>
                        </InputGroup>
                        {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
                    </FormGroup>
                    </Col>
                    {isDisable &&
                    <Col md="3" sm="3" >
                        <label>Posting Date</label>
                        <Input
                            type="date"
                            // value={poDetailsData?.invoiceDate} // Format the date for the input
                            min={date_control}
                            max={currentDate} // Allow only current or past dates
                            onKeyDown={handleKeyDown} // Prevent manual typing
                            onChange={(e) => handleInputChange( e.target.value)} // Update the state with the new date
                        />
                    </Col>}
                 </Row>     
                    <br />
                   
                   <Col md="12" sm="12">
                            <h4 className="text-primary"><u>MIRO Details</u></h4><br />
                   </Col>
                        <label></label>
                        <div 
                            style={{
                            width: '100%',
                            overflowX: 'auto',
                            maxHeight: "500px",
                            border: "1px solid #ddd",
                            paddingBottom: "50px" // <-- Add space after the scroll ends
                        }}
                        >
                        <table className="table table-bordered" 
                               style={{ width: '100%', minWidth: '2700px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                           
                            <thead >
                                <tr>
                                   <th className="bg-primary text-white" width='6%' style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={poData.length == 0}
                                    />
                                    </th>
                                    <th className="bg-primary text-white" width='15%'>GL</th>
                                    <th className="bg-primary text-white" width='30%'>Description</th>
                                    <th className="bg-primary text-white" width='12%'>Line Item</th>
                                    <th className="bg-primary text-white" width='15%'>PO NO</th>
                                    <th className="bg-primary text-white" width='15%'>Migo Number</th>
                                    <th className="bg-primary text-white" width='15%'>GRN Qty</th>
                                    <th className="bg-primary text-white" width='15%'>PO UNIT</th>
                                    <th className="bg-primary text-white" width='15%'>Vendor</th>
                                    <th className="bg-primary text-white" width='15%'>Tax Code</th>
                                    <th className="bg-primary text-white" width='15%'>Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Currency</th>
                                    <th className="bg-primary text-white" width='15%'>Company Code</th>
                                    <th className="bg-primary text-white" width='15%'>Payment Method</th>
                                    <th className="bg-primary text-white" width='15%'>FI Document</th>
                                    <th className="bg-primary text-white" width='15%'>Profit Center</th>
                                    <th className="bg-primary text-white" width='10%'>Inv Copy</th>
                                    <th className="bg-primary text-white" width='12%'>Extra Copy</th>
                                </tr>
                            </thead>
                           {poData?.map((materialData,index) => (
                                <tbody key={index}>
                                <tr key={`${index}`}>
                                        <td>
                                            <input
                                            type="checkbox"
                                            checked={materialData?.selected || false}
                                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                            />
                                        </td>
                                        <td >{materialData?.GL}</td>
                                        <td>{materialData?.DESCRIPTION}</td>
                                        <td>{materialData?.PO_ITEM	}</td>
                                        <td>{materialData?.PO_NUMBER}</td>
                                        <td>{materialData?.MIGO_NUMBER}</td>
                                        <td >{materialData?.QUANTITY}</td>
                                        <td>{materialData?.PO_UNIT}</td>
                                        <td>{materialData?.VENDOR}</td>
                                        <td>{materialData?.TAX_CODE}</td>
                                        <td>{materialData?.ITEM_AMOUNT}</td>
                                        <td>{materialData?.CURRENCY}</td>
                                        <td>{materialData?.COMP_CODE}</td>
                                        <td>{materialData?.PAYMENT_METHOD}</td>
                                        <td >{materialData?.FI_DOC}</td>
                                        <td >{materialData?.PROFIT_CENTER}</td>
                                        <td >
                                            <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(materialData?.miro_check[0]?.invoiceCopy)}>View</Button.Ripple>
                                            {/* {materialData?.miro_check[0]?.invoiceCopy} */}
                                        </td>
                                        <td >
                                            {materialData?.miro_check[0]?.extraAttachments &&
                                            <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(materialData?.miro_check[0]?.extraAttachments)}>View</Button.Ripple>}
                                        </td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                        </div>
                </CardBody>
                </Card>
                <ModalBody>
                    <Row>
                        

                    {weighmentData.length > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                {poData[0].moduleTypeId == 12 || poData[0].moduleTypeId == 15 || poData[0].moduleTypeId == 21 || poData[0].moduleTypeId == 25 || poData[0].moduleTypeId == 29 || poData[0].moduleTypeId == 33 || poData[0].moduleTypeId == 34 || poData[0].moduleTypeId == 1 || poData[0].moduleTypeId == 2  || poData[0].moduleTypeId == 38 ?
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
                                               
                                            </table>
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

                             
                            </> : null
                    }


                    </Row>
                    <Row />
                    <Row>
                        <Col md="12" sm="12" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => update(0)} >Submit</Button.Ripple>
                        </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            {/* </Modal> */}

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
         </Modal >
        </div >
    );
};

export default MiroConfirmation;
