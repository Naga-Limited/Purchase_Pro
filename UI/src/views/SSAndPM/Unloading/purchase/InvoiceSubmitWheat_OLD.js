import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, InputGroup, } from "reactstrap";
import { useEffect } from "react";
import { Edit, Eye, Paperclip, Search, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../../../Uploader";
import { HrLine } from "../../../common/HrLine";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ShowToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { minDate } from "../../../common/dateComponent";
import Select from 'react-select';
import { DatePicker } from "../../../forms/custom-datetime";
import { useFormik } from "formik";
import { Yup } from "../../../forms/custom-form";
import moment from "moment";
import POCopyModal from "../../../POCopyModal";

const InvoiceSubmitWheat = ({ }) => {

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        GetPODetails()
    }, [])
    useEffect(() => {
        if (form?.values?.date !== undefined) {
        GetPODetails()
        }
    }, [form?.values?.date])
    // console.log(form)
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
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0
        const requestData = {
            poNumbers: selectedPoNumbers, // Send the entire array of selected PO numbers
            vendorCode:selectedVendor?.value,
            fromDate:fromDateMilliSecond,
            toDate:toDateMilliSecond
        };
        if (!requestData?.poNumbers?.length) {
            errorToast('Please select a poNumber');
            return;
        }
    
        if (!requestData?.vendorCode) {
            errorToast('Please select a Vendor Code');
            return;
        } 
        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getMiroDetailsByIdWheat`, requestData)  // Send as body, not in URL
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setPoData(data.results);
                    // Optional: If you want to handle material info or other data
                    // setMaterialInfo(data.materialDetails);
                    // getWeighmentInfo(data.results[0].gateInOutInfoId);
                    setIsDisable(true);
                    InvoiceValidation();
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                setData(false);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => {
                hideLoader();
            });
    };
  

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


    const handleFileChange = (file,id) => {
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
    const gateIn = async (ExtraAttachments) => {
        const filteredPoData = poData.filter(item => item.selected === true);

        if (!filteredPoData?.length) {
            errorToast('Please select at least one MIRO line');
            return;
        }else if (poData[0]?.refDocNo == null && (formValue.refDocNo == undefined || formValue.refDocNo == '')) {
            
            errorToast(`Please Enter invoice No`);
            return;  // Stop the process if there are missing attachments
        } 

        // Show error if there are missing invoice dates
        else if (poData[0]?.docDate == null && (formValue.docDate == undefined || formValue.docDate == '')) {
            errorToast(`Please Select invoice date`);
            return;  // Stop the process if there are missing invoice dates
        }
       

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
        console.log(keys)
        console.log(attachedFiles)

       if (keys.length == 0 && poData[0]?.invoiceCopy) {
        update('',ExtraAttachments)
       }else{
        if (keys.length == 0) {
            errorToast(`Please Attach Invoice Copy`);
            return;  // Stop the process if there are missing invoice dates
        }
        let postdata = new FormData();
        let { pickSlipCopy, sendingWBSlip } = ImgData;
        postdata.append("image[]", pickSlipCopy);

        let UploadFile = 0;
        let UploadFile1 = 0;

        Object.keys(attachedFiles).forEach((key) => {
            postdata.append("file[]", attachedFiles[key]);
        });

        UploadFile = attachedFiles.pickSlipCopy && attachedFiles.pickSlipCopy.name && attachedFiles.pickSlipCopy.name.length ? true : false;
        UploadFile1 = attachedFiles.sendingWBSlip && attachedFiles.sendingWBSlip.name && attachedFiles.sendingWBSlip.name.length ? true : false;
        postdata.append("form_name", 'Payment');
        postdata.append("SubFolder", "FG_GateOut");
        showLoader();
        try {
          const response = await apiPostMethod(sapFileShare, postdata, "File");
          const { data } = response;
          if (data.success) {
            let invoiceCopyMap = data.files[0] ? data.files[0].updname : "";
            update(invoiceCopyMap,ExtraAttachments);
          } else {
            console.error("Upload response format invalid", data);
            errorToast("File upload failed.");
          }
        } catch (err) {
          console.error("Upload error:", err);
          errorToast("Something went wrong during upload.");
        }
        finally {
          hideLoader();
        }
    }
    };
    const AddDatasPO = () => {
        let postdata = new FormData();
        let hasFiles = false;
    
        const filteredPoData = poData.filter(item => item.selected === true);

        if (!filteredPoData?.length) {
            errorToast('Please select at least one MIRO line');
            return;
        }else if (poData[0]?.refDocNo == null && (formValue.refDocNo == undefined || formValue.refDocNo == '')) {
            
            errorToast(`Please Enter invoice No`);
            return;  // Stop the process if there are missing attachments
        } 

        // Show error if there are missing invoice dates
        else if (poData[0]?.docDate == null && (formValue.docDate == undefined || formValue.docDate == '')) {
            errorToast(`Please Select invoice date`);
            return;  // Stop the process if there are missing invoice dates
        }

        const {
            bargainNote, deliveryChallanCopy, ewayBillCopy, eInvoiceCopy,
            qcCertificateInternalCopy, qcCertificateExternalCopy,
            externalWbCopy, vendorEmailCopy,
            projectTeamAcknowledgement, creditNoteCopy
        } = ImgData;
    
        const knownAttachments = {
            bargainNote,
            deliveryChallanCopy,
            ewayBillCopy,
            eInvoiceCopy,
            qcCertificateInternalCopy,
            qcCertificateExternalCopy,
            externalWbCopy,
            vendorEmailCopy,
            projectTeamAcknowledgement,
            creditNoteCopy
        };
    
        // 🧠 Map to track which field maps to which original filename
        const fieldToOriginalNameMap = {};
    
        // Append known image[] files and track their field
        Object.entries(knownAttachments).forEach(([key, file]) => {
            if (file?.name) {
                postdata.append("image[]", file);
                fieldToOriginalNameMap[file.name] = key;
                hasFiles = true;
            }
        });
    
        // Append dynamic attachedFiles if needed (you can extend this logic the same way)
        Object.keys(attachedFiles1).forEach((key) => {
            const file = attachedFiles1[key];
            if (file?.name) {
                postdata.append("file[]", file);
                fieldToOriginalNameMap[file.name] = key;  // Track this as well
                hasFiles = true;
            }
        });
    
        postdata.append("form_name", 'Receipt');
        postdata.append("SubFolder", "Payment");
    
        const proceedToSave = (uploadedFiles = []) => {
            // Create the final ExtraAttachments object
            const ExtraAttachments = {};
            uploadedFiles.forEach(({ orgname, updname }) => {
                const fieldName = fieldToOriginalNameMap[orgname];
                if (fieldName) {
                    ExtraAttachments[fieldName] = updname;
                }
            });
    
            gateIn(ExtraAttachments);  // 🔥 structured attachment map
        };
    
        if (hasFiles) {
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success && Array.isArray(data.files)) {
                        proceedToSave(data.files);  // 🧠 smart mapping
                    }
                })
                .catch(() => {
                    errorToast("Something went wrong, please try again after sometime");
                });
        } else {
            // No files — send empty object
            gateIn({});
        }
    };
    const update = (shipmentCopys,ExtraAttachments) => {
        const filteredPoData = poData.filter(item => item.selected === true);
        const totalAmount = filteredPoData.reduce((sum, item) => {
            const deduction = parseFloat(item.deductionValue) || 0;
            const amount = parseFloat(item.amount) || 0;
            const tax = parseFloat(item.totalTax) || 0;
            return sum + deduction + amount + tax;
        }, 0).toFixed(2);
       const selectedRowCount = filteredPoData?.length;
        let postData = {
            poData: filteredPoData,
            // postingDate: invoiceDate,
            totalAmount: totalAmount,
            userId: UserDetails.USERID,
            refDocNo:poData[0]?.refDocNo || formValue.refDocNo,
            docDate:poData[0]?.docDate || formValue.docDate,
            shipmentCopy:shipmentCopys || poData[0]?.invoiceCopy,
            bargainNote: ExtraAttachments.bargainNote || poData[0]?.bargainNotes || poData[0]?.bargainNote,
            deliveryChallanCopy: ExtraAttachments.deliveryChallanCopy || poData[0]?.deliveryChallanCopys || poData[0]?.deliveryChallanCopy,
            ewayBillCopy: ExtraAttachments.ewayBillCopy || poData[0]?.ewayBillCopys || poData[0]?.ewayBillCopy,
            eInvoiceCopy: ExtraAttachments.eInvoiceCopy || poData[0]?.eInvoiceCopys || poData[0]?.eInvoiceCopy,
            qcCertificateInternalCopy: ExtraAttachments.qcCertificateInternalCopy || poData[0]?.qcCertificateInternalCopys || poData[0]?.qcCertificateInternalCopy,
            qcCertificateExternalCopy: ExtraAttachments.qcCertificateExternalCopy || poData[0]?.qcCertificateExternalCopys || poData[0]?.qcCertificateExternalCopy,
            externalWbCopy: ExtraAttachments.externalWbCopy || poData[0]?.externalWbCopys || poData[0]?.externalWbCopy,
            vendorEmailCopy: ExtraAttachments.vendorEmailCopy || poData[0]?.vendorEmailCopys || poData[0]?.vendorEmailCopy,
            projectTeamAcknowledgement: ExtraAttachments.projectTeamAcknowledgement || poData[0]?.projectTeamAcknowledgements || poData[0]?.projectTeamAcknowledgement,
            creditNoteCopy: ExtraAttachments.creditNoteCopy || poData[0]?.creditNoteCopys || poData[0]?.creditNoteCopy,
        };
        
    
        // if (!postData?.postingDate) {
        //     errorToast('Please select a posting date');
        //     return;
        // }
    
        confirmDialog({
            title: 'Are you sure to Post?',
            description: `Selected Rows: ${selectedRowCount} | MIRO Total Amount: ${postData.totalAmount}`
        }).then((res) => {
            if (res) {
                showLoader(); // ✅ Start loader only when confirmed
    
                apiPostMethod(apiBaseUrl + "MigoAutomationController/MiroUpdate", postData)
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
                                setPoOptions([])
                                setVendorOptions([])
                                setPoData([])
                                setSelectedPoNumbers([])
                                setSelectedVendor([])
                                setIsDisable(false)
                                setFormValue({refDocNo: '', docDate: ''})
                                setAttachment({pickSlipCopy:{},sendingWBSlip: {}})
                                setAttachment1({ bargainNote: {},deliveryChallanCopy: {}, ewayBillCopy: {}, eInvoiceCopy: {}, qcCertificateInternalCopy: {}, qcCertificateExternalCopy: {}, creditNoteCopy: {}, vendorEmailCopy: {},projectTeamAcknowledgement: {} , externalWbCopy: {} })
                                GetPODetails()
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

      const [selectedPoNumbers, setSelectedPoNumbers] = useState([]);

      const handlePoNumberChange = (selectedOptions) => {
        setSelectedPoNumbers(selectedOptions || []);
        console.log(selectedOptions)
        getVendorList(selectedOptions)
      };

      const [poOptions, setPoOptions] = useState([]);

      const GetPODetails = () => {
        // Replace with the actual API endpoint that provides PO numbers based on userInfoId
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPoNumbersWheat/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.plantids}`)
          .then((response) => {
            if (response.data.success) {
              setPoOptions(response.data.results); // Directly set the PO numbers from backend response
            } else {
              errorToast(response.data.message);
            }
          })
          .catch((error) => {
            errorToast("Error fetching PO numbers:", error);
          });
      };
      const [vendorOptions, setVendorOptions] = useState([]);
      const [selectedVendor, setSelectedVendor] = useState(null);

        const handleVendorChange = (selectedOption) => {
            setSelectedVendor(selectedOption);
        };
      const getVendorList = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getVendorListWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setVendorOptions(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };


    const [formValue, setFormValue] = useState({ refDocNo: '', docDate: '' });

    const handleInputChange1 = (e, field) => {
    const value = e.target.value;
    setFormValue((prev) => ({
        ...prev,
        [field]: value,
    }));
    };
    const handleInputChange2 = (e, id, field) => {
        const newValue = e.target.value;
        setPoData(prevList =>
            prevList.map(item =>
                item.id === id ? { ...item, [field]: newValue } : item
            )
        );
    };
    const handleDeductionValueChange = (rowIndex, newValue) => {
        const updatedData = [...poData]; // or materialData list
        updatedData[rowIndex].deductionValue = newValue;
        setPoData(updatedData); // or appropriate state setter
    };
    const handleExtraValueChange = (rowIndex, newValue) => {
        const updatedData = [...poData]; // or materialData list
        updatedData[rowIndex].extraDeduction = newValue;
        setPoData(updatedData); // or appropriate state setter
    };
    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };
    const togglePOModal = () => setPoModalOpen(!poModalOpen);
    const print1 = (copy) => {
        window.open(copy)
    }
    const [attachedFiles1, setAttachment1] = useState({ bargainNote: {},deliveryChallanCopy: {}, ewayBillCopy: {}, eInvoiceCopy: {}, qcCertificateInternalCopy: {}, qcCertificateExternalCopy: {}, creditNoteCopy: {}, vendorEmailCopy: {},projectTeamAcknowledgement: {} , externalWbCopy: {} });
    const handleFileChange1 = (file, id) => {
        setAttachment1({
            ...attachedFiles1,
            [id]: file,
        });
    };
    return (
        <div>
            {/* <Modal show={show} centered size="xl"> */}
            <Card>
                 <CardHeader className="text-center">
                    <h4 className="m-0">Invoice Submit Store to Accounts</h4>
                </CardHeader>
                <HrLine />
                <CardBody>
                <Row>
                    <Col md="4" sm="4">
                        <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                    </Col>
                </Row>
                <br />
                 <Row>
                 <Col md="4" sm="4">
                    <FormGroup>
                        <h5>PO Number</h5>
                        <div style={{ width: '350px' }}>
                        <Select
                            isMulti
                            name="poNumbers"
                            options={poOptions}
                            classNamePrefix="select"
                            onChange={handlePoNumberChange}
                            value={selectedPoNumbers}
                            // isDisabled={isDisable}
                            placeholder="Select PO Numbers"
                            styles={{
                            control: (provided) => ({
                                ...provided,
                                height: '38px',
                                fontSize: '14px',
                            }),
                            }}
                        />
                        </div>
                    </FormGroup>
                    </Col>
                   
                    <Col md="4" sm="4">
                    <FormGroup>
                        <h5>Vendor Name</h5>
                        <InputGroup style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '250px'}}>
                            <Select
                            name="vendorName"
                            options={vendorOptions}
                            classNamePrefix="select"
                            onChange={handleVendorChange}
                            value={selectedVendor}
                            // isDisabled={isDisable}
                            placeholder="Select Vendor"
                            styles={{
                                control: (provided) => ({
                                ...provided,
                                height: '38px',
                                fontSize: '14px',
                                }),
                            }}
                            />
                        </div>

                        <Button
                            size="sm"
                            color="success"
                            style={{ height: '38px', width: '50px' }}
                            onClick={getGateInInfo}
                            // disabled={isDisable}
                        >
                            <Search size={20} />
                        </Button>
                        </InputGroup>
                     </FormGroup>
                    </Col>
                    {/* {isDisable &&
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
                    </Col>} */}
                     {/* </Row> */}
                    {isDisable && 
                    <>
                    {/* <Row>             */}
                    <Col md="4" sm="4">
                    <label>Invoice No</label>
                      <Input
                        type="text"
                        value={formValue?.refDocNo || poData[0]?.refDocNo}
                        onChange={(e) => handleInputChange1(e, 'refDocNo')}
                        placeholder="Invoice No"
                        className="form-control"
                        />
                    </Col>
                    <Col md="4" sm="4">
                    <label>Invoice Date</label>
                        <Input
                        type="date"
                        value={formValue?.docDate || poData[0]?.docDate}
                        max={currentDate}
                        onChange={(e) => handleInputChange1(e, 'docDate')}
                        onKeyDown={handleKeyDown}
                        className="form-control"
                        placeholder="Document Date"
                        />
                    </Col>
                    
                    <Col md="2" sm="2">
                    <label></label> <br />
                        {/* {poData[0]?.invoiceCopy ? ( */}
                        <Button.Ripple
                        className="ml-0"
                        color="primary"
                        size="sm"
                        type="button"
                        onClick={() => onActionClick(poData[0]?.invoiceCopy)}
                        >
                        Invoice Copy
                        </Button.Ripple>
                    </Col>
                        
                    <Col md="2" sm="2">
                    <label></label> <br />
                    {/* ) : ( */}
                        {/* <> */}
                            <Uploader
                            title={poData[0]?.invoiceCopy ? "Invoice Reattach" : "Invoice Copy"}
                            id="pickSlipCopy"
                            selectedFileName={attachedFiles.pickSlipCopy.name} // Use a global or current file
                            setAttachment={handleFileChange} // Just pass the file directly
                            />
                        {/* </> */}
                    {/* )} */}
                    </Col>
                    <Col md="4" sm="4">
                        <label>Vehicle Type</label>
                        <Input
                            type="text"
                            value={poData[0]?.VEHICLE_TYPE + ' ( ' + poData?.length + ' - Row Count) '  }
                            className="form-control"
                            placeholder="Document Date"
                            disabled
                        />
                    </Col>
                 </>}
                 </Row>     
                
                <Row>
                        <Col sm="12" md="12">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Bargain Note"
                                        id={"bargainNote"}
                                        selectedFileName={attachedFiles1.bargainNote.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Delivery Challan"
                                        id={"deliveryChallanCopy"}
                                        selectedFileName={attachedFiles1.deliveryChallanCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Eway Bill"
                                        id={"ewayBillCopy"}
                                        selectedFileName={attachedFiles1.ewayBillCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="E-Invoice"
                                        id={"eInvoiceCopy"}
                                        selectedFileName={attachedFiles1.eInvoiceCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="QC Internal"
                                        id={"qcCertificateInternalCopy"}
                                        selectedFileName={attachedFiles1.qcCertificateInternalCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="QC External"
                                        id={"qcCertificateExternalCopy"}
                                        selectedFileName={attachedFiles1.qcCertificateExternalCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Outside WB"
                                        id={"externalWbCopy"}
                                        selectedFileName={attachedFiles1.externalWbCopy.name}
                                    />
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Email Vendor"
                                        id={"vendorEmailCopy"}
                                        selectedFileName={attachedFiles1.vendorEmailCopy.name}
                                    />
                                </div>
                                
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange1}
                                        title="Credit Note"
                                        id={"creditNoteCopy"}
                                        selectedFileName={attachedFiles1.creditNoteCopy.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>
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
                               style={{ width: '100%', minWidth: '3500px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                           
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
                                    <th className="bg-primary text-white" width='20%'>GL</th>
                                    <th className="bg-primary text-white" width='30%'>Description</th>
                                    <th className="bg-primary text-white" width='12%'>Line Item</th>
                                    <th className="bg-primary text-white" width='20%'>PO NO</th>
                                    <th className="bg-primary text-white" width='20%'>REFERENCE Number</th>
                                    <th className="bg-primary text-white" width='15%'>GRN Qty</th>
                                    <th className="bg-primary text-white" width='15%'>PO UNIT</th>
                                    <th className="bg-primary text-white" width='17%'>Vendor</th>
                                    <th className="bg-primary text-white" width='25%'>Vendor Name</th>
                                    <th className="bg-primary text-white" width='15%'>Tax Code</th>
                                    <th className="bg-primary text-white" width='15%'>Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Tax Amount</th>
                                    <th className="bg-primary text-white" width='15%'>Total Amount</th>
                                    <th className="bg-primary text-white" width='20%'>Deduct Inv Qty Amt</th>
                                    <th className="bg-primary text-white" width='20%'>Extra Deduction</th>
                                    <th className="bg-primary text-white" width='15%'>Deduction Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Currency</th>
                                    <th className="bg-primary text-white" width='15%'>Company Code</th>
                                    <th className="bg-primary text-white" width='15%'>Payment Method</th>
                                    <th className="bg-primary text-white" width='20%'>FI Document</th>
                                    <th className="bg-primary text-white" width='20%'>Profit Center</th>
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
                                        <td >{materialData?.gl}</td>
                                        <td >{materialData?.itemText}</td>
                                       
                                        <td>{materialData?.poItem}</td>
                                        <td>
                                            <Button color="link" size="sm" onClick={() => openPOModal(materialData?.poNumber,'PO')} style={{ textDecoration: "underline" }}>
                                            {materialData?.poNumber}
                                            </Button>
                                        </td>
                                        <td>
                                            <Button color="link" size="sm" onClick={() => openPOModal(materialData?.migoNumber,'GRN')} style={{ textDecoration: "underline" }}>
                                            {materialData?.refNo}
                                            </Button>
                                        </td>
                                        <td >{materialData?.quantity}</td>
                                        <td>{materialData?.poUnit}</td>
                                        <td>{materialData?.vendor}</td>
                                        <td>{materialData?.vendorName}</td>
                                        <td>{materialData?.taxCode}</td>
                                        <td>{materialData?.amount}</td>
                                        <td>{materialData?.totalTax}</td>
                                        <td>{(Number(materialData?.amount || 0) + Number(materialData?.totalTax || 0)).toFixed(3)}</td>
                                        <td>
                                           
                                            <Input
                                                type="text"
                                                value={
                                                    isNaN(materialData?.deductionValue) || materialData?.deductionValue === null
                                                    ? 0
                                                    : materialData?.deductionValue
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow numbers with up to 3 decimal places
                                                    if (/^\d*\.?\d{0,3}$/.test(val)) {
                                                    handleDeductionValueChange(index, val);
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    if (!/[\d.]/.test(e.key) || (e.key === "." && e.target.value.includes("."))) {
                                                        e.preventDefault(); // Block non-numeric input except one decimal
                                                    }
                                                }}
                                                // style={{ width: '100%', border: 'none', background: 'transparent' }}
                                            />
                                        </td>
                                        <td>
                                            <Input
                                                type="text"
                                                // placeholder="Invoice Qty"
                                                value={isNaN(materialData?.extraDeduction) || materialData?.extraDeduction === null ? 0 : materialData?.extraDeduction}
                                                // onChange={(e) => handleExtraValueChange(index, parseFloat(e.target.value))}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow numbers with up to 3 decimal places
                                                    if (/^\d*\.?\d{0,3}$/.test(val)) {
                                                      handleExtraValueChange(index, val);
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    if (!/[\d.]/.test(e.key) || (e.key === "." && e.target.value.includes("."))) {
                                                        e.preventDefault(); // Block non-numeric input except one decimal
                                                    }
                                                }}
                                                // style={{ width: '100%', border: 'none', background: 'transparent' }}
                                            />
                                        </td>
                                        <td>{materialData?.deductionQty}</td>
                                        <td>{materialData?.currency}</td>
                                        <td>{materialData?.compCode}</td>
                                        <td>{materialData?.paymentMethod}</td>
                                        <td >{materialData?.fiDocument}</td>
                                        <td >{materialData?.profitCenter}</td>
                                        <td >
                                            {materialData?.extraCopy &&
                                            <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(materialData?.extraCopy)}>View</Button.Ripple>}
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
                    </Row>
                    <Row />
                    <Row>
                        <Col md="12" sm="12" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => AddDatasPO(0)} >Submit</Button.Ripple>
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
         <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
        />
        </div >
    );
};

export default InvoiceSubmitWheat;
