import React, { useState } from "react";
import { apiBaseUrl, BASE_URL, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, } from "reactstrap";
import { useEffect } from "react";
import { Edit, Eye, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../../../Uploader";
import { HrLine } from "../../../common/HrLine";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ShowToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import { useFormik } from "formik";
import POCopyModal from "../../../POCopyModal";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MiroSubmitDetailsApproval = ({ setShow, show, gateInOutInfoId,lines,status,miroIds,getLoadingData,weighment }) => {

    useEffect(() => {
        getWeighmentInfo(lines[0]?.gateInOutInfoId)
        InvoiceValidation()
        getGateInInfo(lines[0]?.loadingUnloadingInfoId ? lines[0]?.loadingUnloadingInfoId : 0)
        calculateTotalTonnageByUniqueMigo(lines)
    }, [])

    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
    const [show2, setShow2] = useState(false)
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [returnDeliveryData, setReturnDeliveryData] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId == 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId == 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [stoDeliveryData, setStoDeliveryData] = useState([])
    const [extraCopy, setExtraCopy] = useState([])
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)
    const [totalTonnage, setTotalTonnage ] = useState('0');

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    

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


    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

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
    const closeRemarksModal1 = () => setShow2(false);
    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    const isPDF = (url) => /\.pdf$/i.test(url);
    const print = (gateInOutInfoIds) => {
        window.open(`/public/#/OverAllSmartForm/${gateInOutInfoIds}`)
    }
    const print1 = (copy) => {
        window.open(copy)
    }
    const onActionClick = (fileUrl) => {
        if (isImage(fileUrl)) {
            setOpenImage(fileUrl); // Set image URL
            setOpenPDF(null); // Reset PDF
        } else if (isPDF(fileUrl)) {
            setOpenPDF(fileUrl); // Set PDF URL
            setOpenImage(null); // Reset Image
        } else {
            console.error("Unsupported file format");
            setOpenImage(null);
            setOpenPDF(null);
        }
        setShow1(true)
    };

    const onActionClick1 = () => {
        setShow2(true)
    };

    const [invoiceDate, setInvoiceDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [actualStatus, setActualStatus] = useState(2);
    const handleInputChange = (value,type) => {
        if(type == 'posting'){
            setInvoiceDate(value);
        }else{
            setRemarks(value)
        }
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
    const update = (status) => {
        const totalAmount = lines.reduce((sum, item) => {
            const deduction = parseFloat(item.deductionValue) || 0;
            const extraDeduction = parseFloat(item.extraDeduction) || 0;
            return sum + deduction + extraDeduction;
        }, 0).toFixed(2);
        let postData = {
            poData: lines,
            miroIds:miroIds,
            postingDate:invoiceDate,
            status:status,
            remarks:remarks,
            USERID:UserDetails.USERID,
            taxType:form?.values?.TDS?.value,
            taxCode:form?.values?.TDS?.label,
            taxRate:form?.values?.TDS?.TAX_RATE,
            totalAmount:status == 3 ? lines[0].gross_amount : status == 4 ? totalAmount : 0,
        };
        if ( (status == 3 || status == 4) && !postData?.postingDate) {
            errorToast('Please select a posting date');
            return;
        }else if((status == 3 || status == 4 || status == 0) && (!postData.remarks)){
            errorToast('Please enter a remarks');
            return;
        }
        // else if(!postData.taxType && (status == 3)){
        //     errorToast('Please select a TDS');
        //     return;
        // }
        confirmDialog({
            title: (status == 3 || status == 4 || status == 2 || status == 6) ? 'Are you sure to Post?' : 'Are you sure to Reject?',
            description: 'MIRO Total Amount - ' + ((status == 3 || status == 2 || status == 6) ? lines[0].gross_amount : status == 4 ? totalAmount : 0)
        }).then((res) => {
        if (res) {
        showLoader();
        console.log(apiBaseUrl + "MigoAutomationController/MiroUpdateSAP",postData);
        apiPostMethod(apiBaseUrl + "MigoAutomationController/MiroUpdateSAP",postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    confirmDialog({
                        title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        if(data.results == 3 || data.results == 0){
                        getLoadingData();  // Reloads the page after the confirm dialog is closed
                         setShow(false)
                        }else{
                         setShow(true)
                         setActualStatus(data.results)  
                        }
                    });
                } else if (data.success == false) {
                    errorToast(data.message)
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
    });
    }
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
          FromDate: new Date(),
          ToDate: new Date(),
        },
        validationSchema: Yup.object().shape({}),
        onSubmit: (values) => { },
    });

    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };
    const togglePOModal = () => setPoModalOpen(!poModalOpen);

    const getGateInInfo = (loadUnloadInfoId) => {
        console.log(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsersId/${loadUnloadInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsersId/${loadUnloadInfoId}/${UserDetails.USERID}`)
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
    const calculateTotalTonnageByUniqueMigo = (lines = []) => {
    const migoMap = {};

    lines.forEach(item => {
        const migo = String(item.refNo || '').trim();
        const qty = Number(item.quantity || 0);

        if (!migo) return;

        // ✅ one qty per MIGO (avoid duplicate lines)
        migoMap[migo] = Math.max(migoMap[migo] || 0, qty);
    });

    const totalTonnage = Object.values(migoMap)
        .reduce((sum, qty) => sum + qty, 0);

    setTotalTonnage(totalTonnage);
    };
    const history = useHistory();
     const exportToExcel = () => {
        // You can export selected rows OR all rows
        const dataToExport = lines.filter(item => item.selected); 
        // If you want all rows use: const dataToExport = poData;
        const dataToExport1 = dataToExport.length == 0 ? lines : dataToExport;
    
        if (!dataToExport1.length) {
            alert("No data selected for export");
            return;
        }
    
        // Format data for Excel
        const formattedData = dataToExport1.map(item => ({
            "GL Description": item.gl + " - " + item.itemText,
            "Vendor Name": item.vendor + " - " + item.vendorName,
            "Invoice No": item.refDocNo,
            "Invoice Date": item.docDate,
            "GRN Qty": item.quantity,
            "Line": item.poItem,
            "PO NO": item.poNumber,
            "MIGO Number": item.refNo,
            "Plant Code": item.plantCode,
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MIRO Details");
    
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
    
        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
    
        saveAs(fileData, "Invoice_Details.xlsx");
        };
    return (
        <div>
            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Invoice Submit Details</h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" 
                                onClick={() =>{ 
                                    setShow(false);
                                    getLoadingData();
                                }}
                                size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Card>
          
                </Card>
                <Card>
                <CardBody>
                <Row>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>MIRO Entry Lines</u></h4><br />
                        </Col>
                        {(lines[0]?.status == 2 || lines[0]?.status == 4) &&
                        <Col md="3" sm="3" >
                            <label>Posting Date</label>
                            <Input
                                type="date"
                                // value={poDetailsData?.invoiceDate} // Format the date for the input
                                min={date_control}
                                max={currentDate} // Allow only current or past dates
                                onKeyDown={handleKeyDown} // Prevent manual typing
                                onChange={(e) => handleInputChange( e.target.value,'posting')} // Update the state with the new date
                            />
                        </Col>}
                        {(lines[0]?.status == 2 || lines[0]?.status == 4) &&
                        <Col md="3" sm="3" >
                            <Label>TDS</Label>
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MigoAutomationController/TDSFetch/${lines[0]?.vendor}`}
                                form={form}
                                id="TDS"
                                name="TDS"
                                // value={storageSelections[`${index}-${lineIndex}`] || null}
                                // onChange={(val) => handleMovementTypeChange(val, index, lineIndex)}
                            />
                        </Col>}
                        {(lines[0]?.status == 5 || lines[0]?.status == 6) &&
                        <Col md="3" sm="3" >
                            <Label>Total Tonnage</Label>
                            <Input
                                type="text"
                                value={Number(totalTonnage).toFixed(3)}
                                disabled
                            />
                        </Col>}
                        {(lines[0]?.status == 5 || lines[0]?.status == 6) &&
                        <Col md="3" sm="3" >
                            <Label>Total Amount</Label>
                            <Input
                                type="text"
                                value={Number(lines[0]?.gross_amount).toFixed(2)}
                                disabled
                            />
                        </Col>}
                        <Col md="3" sm="3" >
                            <label>Remarks</label>
                            <Input
                                type="text"
                                // value={poDetailsData?.invoiceDate} // Format the date for the input
                                maxLength={100} // Allow only current or past dates
                                onChange={(e) => handleInputChange( e.target.value,'remark')} // Update the state with the new date
                            />
                        </Col>
                        {(lines[0]?.approve1Name) &&
                        <Col md="3" sm="3" >
                            <Label>Approval By (1)</Label>
                            <Input
                                type="text"
                                value={lines[0]?.approve1Name}
                                disabled
                            />
                        </Col>}
                        {(lines[0]?.approve2Name) &&
                        <Col md="3" sm="3" >
                            <Label>Approval By (2)</Label>
                            <Input
                                type="text"
                                value={lines[0]?.approve1Name}
                                disabled
                            />
                        </Col>}
                        {weighmentData.length > 0 && 
                        <Col md="1" sm="1" >
                          <br></br>
                                <Button.Ripple
                                className="ml-0"
                                color="primary"
                                size="sm"
                                type="button"
                                onClick={() => print(lines[0].gateInOutInfoId)}
                                >
                                WB Copy
                            </Button.Ripple>
                        </Col>}
                        {lines[0]?.loadingUnloadingInfoId &&
                        <Col md="2" sm="2" >
                          <br></br>
                                <Button.Ripple
                                className="ml-0"
                                color="primary"
                                size="sm"
                                type="button"
                                onClick={() => onActionClick1()}
                                >
                                Invoice Details
                            </Button.Ripple>
                        </Col> } 
                        {(lines[0]?.VEHICLE_TYPE && lines[0]?.VEHICLE_TYPE !== 'Rake' && lines[0]?.VEHICLE_TYPE !== 'RAKE') && (
                            <Col md="2" sm="2">
                                <br />
                                <Button.Ripple
                                    color="primary"
                                    className="ml-1"
                                    onClick={() => {
                                        const refId = lines[0].PI_REFID;
                                        const url = `${BASE_URL}/#/QAView:${refId}/MIROSUBMIT`;
                                        window.open(url, '_blank'); // Opens in new tab (correct URL)
                                    }}
                                    //  onClick={(e) => {
                                    //         history.push(`/QAView:${lines[0].PI_REFID}/${"MIROSUBMIT"}`);
                                    //     }}
                                >
                                    {"View QC"}
                                </Button.Ripple>
                            </Col>
                        )}
                        <Col sm="12" md="12">
                             <label /> 
                            <FormGroup className="d-flex justify-content-start mb-0">
                            <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                            </div>
                            {/* {lines[0].invoiceCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0].invoiceCopy)}
                             >
                             <Eye size={14} />
                             Invoice copy
                           </Button.Ripple>
                           </div>} */}
                           {(lines[0]?.bargainNotes || lines[0]?.bargainNote) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1( lines[0]?.bargainNote || lines[0]?.bargainNotes)}
                             >
                             <Eye size={14} />
                             Bargain Note
                           </Button.Ripple>
                           </div>} 
                           {(lines[0]?.deliveryChallanCopy || lines[0]?.deliveryChallanCopys) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1( lines[0]?.deliveryChallanCopy || lines[0]?.deliveryChallanCopys)}
                             >
                             <Eye size={14} />
                             Delivery Challan
                           </Button.Ripple>
                           </div>} 
                           {(lines[0]?.ewayBillCopys || lines[0]?.ewayBillCopy)&&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.ewayBillCopy || lines[0]?.ewayBillCopys)}
                             >
                             <Eye size={14} />
                             Eway Bill
                           </Button.Ripple>
                           </div>} 
                           {(lines[0]?.eInvoiceCopy || lines[0]?.eInvoiceCopys) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.eInvoiceCopy || lines[0]?.eInvoiceCopys)}
                             >
                             <Eye size={14} />
                             E-Invoice
                           </Button.Ripple>
                           </div>} 
                          
                           {(lines[0]?.qcCertificateInternalCopy || lines[0]?.qcCertificateInternalCopys) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.qcCertificateInternalCopy || lines[0]?.qcCertificateInternalCopys)}
                             >
                             <Eye size={14} />
                             Internal QC
                           </Button.Ripple>
                           </div>} 
                           {(lines[0]?.qcCertificateExternalCopys || lines[0]?.qcCertificateExternalCopy) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1( lines[0]?.qcCertificateExternalCopy || lines[0]?.qcCertificateExternalCopys)}
                             >
                             <Eye size={14} />
                             External QC
                           </Button.Ripple>
                           </div>} 
                           {(lines[0]?.externalWbCopy || lines[0]?.externalWbCopys) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1( lines[0]?.externalWbCopy || lines[0]?.externalWbCopys)}
                             >
                             <Eye size={14} />
                             Outside WB
                           </Button.Ripple>
                           </div>}
                           {( lines[0]?.vendorEmailCopys || lines[0]?.vendorEmailCopy) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.vendorEmailCopy || lines[0]?.vendorEmailCopys)}
                             >
                             <Eye size={14} />
                             Vendor Mail
                           </Button.Ripple>
                           </div>}
                           {(lines[0]?.projectTeamAcknowledgement || lines[0]?.projectTeamAcknowledgements) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.projectTeamAcknowledgement || lines[0]?.projectTeamAcknowledgements)}
                             >
                             <Eye size={14} />
                             Project Acknowledgment
                           </Button.Ripple>
                           </div>}
                           {(lines[0]?.creditNoteCopy || lines[0]?.creditNoteCopys) &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(lines[0]?.creditNoteCopy || lines[0]?.creditNoteCopys)}
                             >
                             <Eye size={14} />
                             Credit Note
                           </Button.Ripple>
                           </div>}     
                           </FormGroup>  
                        </Col>
                        </Row>
                        <HrLine />
                        <Row>
                            {lines?.length > 0 &&
                            <Col md="12" sm="12" className="d-flex justify-content-end">
                            <Button
                                color="success"
                                size="sm"
                                onClick={exportToExcel}
                                className="mb-1"
                            >
                                Export to Excel
                            </Button>
                            </Col>}
                        </Row>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table className="table table-bordered" 
                               style={{ width: '100%', minWidth: '2000px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                           
                            <thead >
                                <tr>
                                <th className="bg-primary text-white" width='20%'>GL</th>
                                    <th className="bg-primary text-white" width='30%'>Description</th>
                                    <th className="bg-primary text-white" width='20%'>Invoice Number</th>
                                    <th className="bg-primary text-white" width='20%'>Invoice Date</th>
                                    <th className="bg-primary text-white" width='15%'>Invoice Copy</th>
                                    <th className="bg-primary text-white" width='12%'>Line Item</th>
                                    <th className="bg-primary text-white" width='20%'>PO NO</th>
                                    {lines[0]?.attach == 1 && (
                                        <th className="bg-primary text-white" width='20%'>Migo Number</th>
                                    )}
                                    <th className="bg-primary text-white" width='15%'>GRN Qty</th>
                                    <th className="bg-primary text-white" width='15%'>PO UNIT</th>
                                    <th className="bg-primary text-white" width='17%'>Vendor</th>
                                    <th className="bg-primary text-white" width='25%'>Vendor Name</th>
                                    <th className="bg-primary text-white" width='25%'>Plant Code</th>
                                    <th className="bg-primary text-white" width='15%'>Amount</th>
                                    {/* <th className="bg-primary text-white" width='15%'>Tax Code</th>
                                    <th className="bg-primary text-white" width='15%'>Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Tax Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Total Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Deduct Inv Qty Amt</th>
                                    <th className="bg-primary text-white" width='15%'>Extra Deduct Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Deduction Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Currency</th>
                                    <th className="bg-primary text-white" width='15%'>Company Code</th>
                                    <th className="bg-primary text-white" width='15%'>Payment Method</th>
                                    <th className="bg-primary text-white" width='20%'>FI Document</th>
                                    <th className="bg-primary text-white" width='20%'>Profit Center</th>
                                    <th className="bg-primary text-white" width='12%'>Extra Copy</th> */}
                                </tr>
                            </thead>
                           {lines?.map((materialData,index) => (
                                <tbody key={index}>
                                <tr key={`${index}`}>
                                <td >{materialData?.gl}</td>
                                        <td >{materialData?.itemText}</td>
                                        <td>{materialData?.refDocNo}</td>
                                        <td> {materialData?.docDate ? new Date(materialData?.docDate).toLocaleDateString('en-GB') : ''}</td>
                                        <td >
                                              <Button.Ripple
                                                className="ml-0"
                                                color="primary"
                                                size="sm"
                                                type="button"
                                                onClick={() => onActionClick(materialData.invoiceCopy)}
                                                >
                                                View
                                              </Button.Ripple>
                                            
                                        </td>
                                        <td>{materialData?.poItem}</td>
                                        <td>
                                            <Button color="link" size="sm" onClick={() => openPOModal(materialData?.poNumber,'PO')} style={{ textDecoration: "underline" }}>
                                            {materialData?.poNumber}
                                            </Button>
                                        </td>
                                        {materialData?.attach == 1 &&
                                        <td>
                                            <Button color="link" size="sm" onClick={() => openPOModal(materialData?.migoNumber,'GRN')} style={{ textDecoration: "underline" }}>
                                            {materialData?.refNo}
                                            </Button>
                                            {/* {materialData?.refNo} */}
                                        </td>}
                                        <td >{materialData?.quantity}</td>
                                        <td>{materialData?.poUnit}</td>
                                        <td>{materialData?.vendor}</td>
                                        <td>{materialData?.vendorName}</td>
                                        <td>{materialData?.plantCode}</td>
                                        <td>{materialData?.amount}</td>
                                        {/* <td>{materialData?.taxCode}</td>
                                        <td>{materialData?.amount}</td>
                                        <td>{materialData?.totalTax}</td>
                                        <td>{(Number(materialData?.amount || 0) + Number(materialData?.totalTax || 0)).toFixed(3)}</td>
                                        <td>{materialData?.deductionValue}</td>
                                        <td>{materialData?.extraDeduction}</td>
                                        <td>{materialData?.deductionQty}</td>
                                        <td>{materialData?.currency}</td>
                                        <td>{materialData?.compCode}</td>
                                        <td>{materialData?.paymentMethod}</td>
                                        <td >{materialData?.fiDocument}</td>
                                        <td >{materialData?.profitCenter}</td>
                                        <td >
                                            {materialData?.extraCopy &&
                                            <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(materialData?.extraCopy)}>View</Button.Ripple>}
                                        </td> */}
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

                                {weighmentData[0]?.moduleTypeId == 12 || weighmentData[0]?.moduleTypeId == 15 || weighmentData[0]?.moduleTypeId == 21 || weighmentData[0]?.moduleTypeId == 25 || weighmentData[0]?.moduleTypeId == 29 || weighmentData[0]?.moduleTypeId == 33 || weighmentData[0]?.moduleTypeId == 34 || weighmentData[0]?.moduleTypeId == 1 || weighmentData[0]?.moduleTypeId == 2  || weighmentData[0]?.moduleTypeId == 38 ?
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
                                                {/* <tbody className="bg-primary text-white">
                                                    <tr>
                                                        <td className='text-center'>Over All First Weight : {data?.firstWeight}</td>
                                                        <td colSpan={2} className='text-center'>Over All Second Weight : {overAllWeight.secondWeight}</td>
                                                        <td className='text-center'>Over All Net Weight : {data?.movementTypeId == 2 ? Number(data?.firstWeight - overAllWeight.secondWeight) : Number(overAllWeight.secondWeight - data?.firstWeight)}</td>
                                                    </tr>
                                                </tbody> */}
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

                                {/* <Col md="12" sm="12">
                                    <h5>First Weight :</h5><br />
                                </Col> */}

                                {/* {firstWeight.map(firstWeight => (
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
                                ))} */}
                            </> : null
                        }


                    </Row>
                    <Row />
                    <Row className="mb-0">
                    {((lines[0]?.status == 2 || lines[0]?.status == 5 || lines[0]?.status == 6)) && (
                        <Col md="6" sm="6">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple
                                    color="danger"
                                    type="button"
                                    onClick={() => update(1)}
                                    >
                                    Reject
                                </Button.Ripple>
                            </FormGroup>
                           
                        </Col> 
                     )}
                        {/* {(lines[0]?.status == 2 && actualStatus == 2) && (
                        <Col md="6" sm="6">
                            <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={() =>
                                update(3)
                                }
                            >
                                Submit
                            </Button.Ripple>
                            </FormGroup>
                          
                       </Col>)} */}
                       {/* {(lines[0]?.status == 4 || actualStatus == 4) && (
                       <Col md="12" sm="12">
                            <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={() =>
                                update(4)
                                }
                            >
                                Deduction
                            </Button.Ripple>
                            </FormGroup>
                           
                       </Col> )} */}
                       {(lines[0]?.status == 5) && (
                        <Col md="6" sm="6">
                            <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={() =>
                                update(6)
                                }
                            >
                                Submit
                            </Button.Ripple>
                            </FormGroup>
                          
                       </Col>)}
                       {(lines[0]?.status == 6) && (
                        <Col md="6" sm="6">
                            <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={() =>
                                update(2)
                                }
                            >
                                Submit
                            </Button.Ripple>
                            </FormGroup>
                          
                       </Col>)}
                 </Row>
                </ModalBody>
            </Modal>

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
           <Modal
            show={show2}
            onHide={() => setShow2(false)}
            centered
            size="xl"
            dialogClassName="custom-modal"
            >
            <div
                className="modal-content"
                style={{
                backgroundColor: "#d1e7dd",
                color: "#000",
                borderRadius: "15px",
                textAlign: "center"
                }}
            >
                <Modal.Header style={{
                backgroundColor: "#d1e7dd"}} closeButton>
                <Modal.Title >Invoice Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table
                    className="table table-bordered text-center"
                    style={{
                        width: '100%',
                        minWidth: '1000px',
                        tableLayout: 'fixed'
                    }}
                    >
                    <thead>
                        <tr>
                        <th className="bg-primary text-white" style={{ width: '15%' }}>PO NO</th>
                        <th className="bg-primary text-white" style={{ width: '20%' }}>PO Type</th>
                        <th className="bg-primary text-white" style={{ width: '20%' }}>Plant</th>
                        <th className="bg-primary text-white" style={{ width: '20%' }}>Vendor Name</th>
                        <th className="bg-primary text-white" style={{ width: '15%' }}>Inv No</th>
                        <th className="bg-primary text-white" style={{ width: '15%' }}>Inv Date</th>
                        <th className="bg-primary text-white" style={{ width: '10%' }}>MSME</th>
                        {/* <th className="bg-primary text-white" style={{ width: '10%' }}>Inv Copy</th> */}
                        <th className="bg-primary text-white" style={{ width: '15%' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {poData?.map((poDetailsData, index) => (
                        <tr key={index}>
                            <td>{poDetailsData?.poNumber}</td>
                            <td>{poDetailsData?.poType}</td>
                            <td>{poDetailsData?.PLANT_NAME}</td>
                            <td>{poDetailsData?.vendorName}</td>
                            <td>{poDetailsData?.invoiceNo}</td>
                            <td>{poDetailsData?.invoiceDate}</td>
                            <td>{poDetailsData?.msme}</td>
                            {/* <td>
                            <Button
                                variant="primary"
                                size="sm"
                                type="button"
                                onClick={() =>
                                onActionClick(
                                    poDetailsData.invoiceCopy
                                    ? poDetailsData.invoiceCopy
                                    : poDetailsData.invoiceCopys
                                )
                                }
                            >
                                View
                            </Button>
                            </td> */}
                            <td>{poDetailsData?.isDelete == 1 ? 'Deleted' : (poDetailsData?.migoNumber != '' && poDetailsData?.migoNumber != null) ? 'MIGO Completed' : poDetailsData?.status > 0 ? 'Process' : 'Pending'   }</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </Modal.Body>
            </div>
            </Modal>
                
         <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
        />

        </div >
    );
};

export default MiroSubmitDetailsApproval;
