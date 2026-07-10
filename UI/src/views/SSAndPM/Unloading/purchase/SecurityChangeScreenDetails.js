import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, } from "reactstrap";
import { useEffect } from "react";
import { Edit, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../../../Uploader";
import { HrLine } from "../../../common/HrLine";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ShowToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const SecurityChangeScreenDetails = ({ setShow, show, purchaseId,poNumbers,status }) => {

    useEffect(() => {
        getGateInInfo()
    }, [])

    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
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

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsersId/${purchaseId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsersId/${purchaseId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
                    getDeliveryDetails(data.results[0].gateInOutInfoId)
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

    const [attachedFiles, setAttachedFiles] = useState({});
    const [ImgData, setImgData] = useState({});

    const handleFileChange = (file, index) => {
        setAttachedFiles((prevFiles) => ({
          ...prevFiles,
          [index]: file
        }));
          // Update poData with invoiceCopy
        setPoData((prevPoData) => {
            const updated = [...prevPoData];
            updated[index] = {
            ...updated[index],
            attachments: {
                ...updated[index].attachments,
                invoiceCopy: {
                ...updated[index].attachments?.invoiceCopy,
                localFile: file
                }
            }
            };
            return updated;
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
            console.error("Unsupported file format");
            setOpenImage(null);
            setOpenPDF(null);
        }
        setShow1(true)
    };
    const [orderQuantities, setOrderQuantities] = useState({});
    const handleInputChange = (index, field, value) => {
        const updatedData = [...poData];
        updatedData[index][field] = value;
        setPoData(updatedData);
    };
    
    const gateIn = async () => {
        let postdata = new FormData();
        let invoiceCopyMap = {}; // invoiceNo => uploaded file name
      
        const invoiceFileMap = {};
        let missingInvoices = [];
        console.log(poData)
        poData.forEach((po) => {
          const invoiceNo = po.id;
          const shipmentCopy = po.attachments?.invoiceCopy?.localFile;
      
          // Only collect if it's a newly attached File object
          if (invoiceNo && shipmentCopy instanceof File) {
            invoiceFileMap[invoiceNo] = shipmentCopy;
            postdata.append("file[]", shipmentCopy);
          } else if (!po.attachments?.invoiceCopy?.uploadedName) {
            // If no uploaded file and no new one, it's missing
            missingInvoices.push(invoiceNo);
          } else {
            // File was already uploaded before (existing record)
            invoiceCopyMap[invoiceNo] = po.attachments.invoiceCopy.uploadedName;
          }
        });
      
        // If there are NO files to upload, skip uploading and go directly to save
        if (postdata.has("file[]") === false) {
          console.log("No new files to upload. Using existing uploaded names.");
          Save(invoiceCopyMap,1);
          return;
        }
      
        postdata.append("form_name", 'Payment');
        postdata.append("SubFolder", "FG_GateOut");
      
        try {
          const response = await apiPostMethod(sapFileShare, postdata, "File");
          const { data } = response;
      
          if (data.success) {
            data.files.forEach((file) => {
              const matchedInvoice = Object.entries(invoiceFileMap).find(
                ([_, localFile]) => localFile?.name === file.orgname
              );
              if (matchedInvoice) {
                const [invoiceNo] = matchedInvoice;
                invoiceCopyMap[invoiceNo] = file.updname;
              }
            });
      
            Save(invoiceCopyMap,2);
          } else {
            console.error("Upload response format invalid", data);
            errorToast("File upload failed.");
          }
        } catch (err) {
          console.error("Upload error:", err);
          errorToast("Something went wrong during upload.");
        }
      };

      const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
      
          reader.readAsDataURL(file); // This line starts the conversion
      
          reader.onload = () => resolve(reader.result); // When successful
          reader.onerror = (error) => reject(error);    // If error occurs
        });
      };
    const fileUrlToBase64 = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
    
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // get base64 only
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    const Save = async (invoiceCopyMap,status) => {
      
        let purchaseOrderData = [];
        const attachedItems = poData
        .map((po, index) => ({ po, index })) // include original index
        .filter(({ po }) => po?.attachments?.invoiceCopy?.localFile instanceof File || po?.invoiceCopy);
        for (let i = 0; i < attachedItems.length; i++) {
            const { po, index: originalIndex } = attachedItems[i]; // Get both PO and its original index
            const file = po?.attachments?.invoiceCopy?.localFile ||  po?.invoiceCopy;
            console.log(file)
            let base64File = null;
            let fileFormat = null;
            
            let filename = null;

            if (file instanceof File) {
                base64File = await fileToBase64(file);
                base64File = base64File.split(',')[1];
                const mimeType = file?.type || 'application/pdf'; // fallback
                fileFormat = '.' + mimeType.split('/')[1];
                filename = file.name;
            } else if (typeof file === 'string') {
                base64File = await fileUrlToBase64(file); // custom function to handle URL
                const extensionMatch = file.match(/\.(\w+)$/);
                fileFormat = extensionMatch ? `.${extensionMatch[1]}` : '.pdf';
                filename = file.split('/').pop(); // gets the filename from path
            }
            const obj = {
            //   ZZLINE: i + 1,
              ZZLINE: originalIndex+1, 
              ZZPO_NO: po.poNumber,
              ZZVENDOR: po.vendorCode,
              ZZINV_NO: po.invoiceNo,
              fileformat:fileFormat,
              filename : filename,
              lv_xstring: base64File // Base64-encoded file
            };
            purchaseOrderData.push(obj);
        }
       const updatedPoData = poData.map((po) => {
        const id = po.id;
        const updatedInvoiceCopy = invoiceCopyMap[id];
      
        return {
          ...po,
          invoiceCopy: updatedInvoiceCopy || po.invoiceCopy, // replace or retain existing
          attachments: undefined // explicitly remove attachments
        };
       });
        let postData = {
            poData: updatedPoData,
            purchaseId:purchaseId,
            status:2,
            purchaseOrderData:purchaseOrderData
        };
        

       // 🚨 Final Check: Show error for each missing PO individually

        showLoader();
        apiPostMethod(apiBaseUrl + "MigoAutomationController/PoChangeUpdate", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    // ShowToast(data.message);
                    // setOpen(false)
                    confirmDialog({
                        title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        window.location.reload();  // Reloads the page after the confirm dialog is closed
                    });
                } else if (data.success == false) {
                    errorToast(data.message)
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
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) {
          console.error(`Invalid date format: ${dateString}`);
          return ''; // If the date is invalid, return an empty string
        }
        return date.toISOString().split('T')[0]; // Ensure correct format: YYYY-MM-DD
    };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        return `${day}-${month}-${year}`;
      };
    return (
        <div>
            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>PO Change Details</h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={() => setShow(false)} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Card>
                <CardBody>
             
                        <div style={{
                            width: '100%',
                            overflowX: 'auto',
                            maxHeight: "1000px",
                            border: "1px solid #ddd",
                            paddingBottom: "50px" // <-- Add space after the scroll ends
                        }}>
                            <table className="table table-bordered" 
                                    style={{ width: '100%', minWidth: '1200px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                                <thead>
                                <tr>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>PO NO</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>PO Type</th>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Plant</th>
                                    <th className="bg-primary text-white" style={{ width: '25%' }}>Vendor Name</th> {/* Increased width */}
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Inv No</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Inv Date</th>
                                    <th className="bg-primary text-white" style={{ width: '30%' }}>Inv Copy</th>
                                    {/* <th className="bg-primary text-white" style={{ width: '20%' }}>COA</th> */}
                                     {/* <th className="bg-primary text-white" style={{ width: '12%' }}>Reattach Invoice</th> */}
                                    {/* <th className="bg-primary text-white" style={{ width: '12%' }}>Reattach COA</th> */}
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
                                    <td>
                                        {poDetailsData?.isDelete == 0 && poDetailsData?.migoNumber == null && poDetailsData?.status == 0
                                        ? (
                                            <Input
                                            type="text"
                                            value={poDetailsData?.invoiceNo}
                                            onChange={(e) => handleInputChange(index, 'invoiceNo', e.target.value)}
                                            />
                                        )
                                        : poDetailsData?.invoiceNo}
                                    </td>
                                    <td>
                                    {poDetailsData?.isDelete == 0 && poDetailsData?.migoNumber == null && poDetailsData?.status == 0
                                        ?
                                         <Input
                                            type="date"
                                            value={poDetailsData?.invoiceDate} // Format the date for the input
                                            max={currentDate} // Allow only current or past dates
                                            onKeyDown={handleKeyDown} // Prevent manual typing
                                            onChange={(e) => handleInputChange(index, 'invoiceDate', e.target.value)} // Update the state with the new date
                                        /> : poDetailsData?.invoiceDate }
                                    </td>
                                    <td>
                                        <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(poDetailsData?.invoiceCopy)}>View</Button.Ripple> &nbsp;
                                        {poDetailsData?.isDelete == 0 && (poDetailsData?.status != 3) &&
                                        <Uploader
                                        setAttachment={(file) => handleFileChange(file, index)}
                                        title="Reattachment"
                                        id={`invoiceCopy-${index}`}
                                        selectedFileName={attachedFiles[index]?.name}
                                        /> }
                                    </td>
                                    {/* <td> */}
                                        {/* <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(poDetailsData.coaCopy)}>View</Button.Ripple> */}
                                        {/* <Button.Ripple className='ml-1' color="warning" size="sm" type="button" onClick={() => onActionClick(poDetailsData.coaCopy)}>Reattach</Button.Ripple> */}
                                    {/* </td> */}
                                 
                                    <td>{poDetailsData?.isDelete == 1 ? 'Deleted' : (poDetailsData?.migoNumber != '' && poDetailsData?.migoNumber != null) ? 'MIGO Completed' : poDetailsData?.status > 0 ? 'Process' : 'Pending'   }</td>
                                    </tr>
                                ))}
                                </tbody>
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

                               
                            </> : null
                        }


                    </Row>
                    <Row />
                    <Row>
                        <Col md="12" sm="12" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => gateIn()} >Update</Button.Ripple>
                        </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal show={show1} size='lg' centered >
                <Modal.Header>
                <Row className="w-100">
                    <Col sm="10" md="10">
                    <FormGroup className="d-flex justify-content-start mb-0">
                        <h4>Invoice / Delivery Challan Copy</h4>
                    </FormGroup>
                    </Col>
                    <Col sm="2" md="2">
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <X color="red" onClick={closeRemarksModal} size={20} style={{ cursor: "pointer" }} />
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

export default SecurityChangeScreenDetails;
