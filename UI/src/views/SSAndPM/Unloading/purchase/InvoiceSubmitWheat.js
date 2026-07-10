import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, InputGroup, } from "reactstrap";
import { useEffect } from "react";
import { ArrowDown, Edit, Eye, Paperclip, Search, X } from "react-feather";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const InvoiceSubmitWheat = ({ }) => {

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        // getGateInInfo()
        GetPODetails()
    }, [])
    useEffect(() => {
        if (form?.values?.date !== undefined) {
        // getGateInInfo()
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
            vendorCode:selectedVendor,
            condtion:condtion,
            fromDate:fromDateMilliSecond,
            toDate:toDateMilliSecond,
            type: 'RAKE',
        };
        if (!requestData?.poNumbers?.length) {
            errorToast('Please select a poNumber');
            return;
        }
    
        // if (!requestData?.vendorCode) {
        //     errorToast('Please select a Vendor Code');
        //     return;
        // } 
        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getMiroDetailsByIdWheat`, requestData)  // Send as body, not in URL
            .then((response) => {
                const { data } = response;
                console.log(data.success)
                if (data.success === true) {
                    setPoData(data.results);
                    // Optional: If you want to handle material info or other data
                    // setMaterialInfo(data.materialDetails);
                    // getWeighmentInfo(data.results[0].gateInOutInfoId);
                    setIsDisable(true);
                    InvoiceValidation();
                } else {
                    setPoData([])
                    errorToast(data.message + 1);
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
        }else if (filteredPoData[0]?.refDocNo == null && (formValue.refDocNo == undefined || formValue.refDocNo == '')) {
            
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
        console.log(filteredPoData)
        if (!filteredPoData.length) {
            errorToast('Please select at least one MIRO line');
            return;
        }

        // ---------- Invoice No Validation ----------
        const invoiceNosFromRows = filteredPoData
            .map(row => row.refDocNo?.trim())
            .filter(Boolean);

        const finalInvoiceNo = invoiceNosFromRows[0] || formValue.refDocNo;

        if (!finalInvoiceNo) {
            errorToast('Please enter Invoice Number');
            return;
        }

        // All selected rows must have same invoice no
        const uniqueInvoiceNos = new Set(
            filteredPoData.map(row => (row.refDocNo || finalInvoiceNo)?.trim())
        );

        if (uniqueInvoiceNos.size > 1 && filteredPoData[0].condtion == '') {
            errorToast('Selected rows contain different Invoice Numbers. Please select rows with the same Invoice No.');
            return;
        }

        // ---------- Invoice Date Validation ----------
        const invoiceDatesFromRows = filteredPoData
            .map(row => row.docDate)
            .filter(Boolean);

        const finalInvoiceDate = invoiceDatesFromRows[0] || formValue.docDate;

        if (!finalInvoiceDate) {
            errorToast('Please select Invoice Date');
            return;
        }

        // All selected rows must have same invoice date
        const uniqueInvoiceDates = new Set(
            filteredPoData.map(row => row.docDate || finalInvoiceDate)
        );

        if (uniqueInvoiceDates.size > 1 && filteredPoData[0].condtion == '') {
            errorToast('Selected rows contain different Invoice Dates. Please select rows with the same Invoice Date.');
            return;
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
        const uniqueRefNoQty = {};

        filteredPoData.forEach(item => {
            const refNo = String(item.refNo || "").trim();
            const qty = Number(item.quantity) || 0;

            // Take only one qty per refNo
            if (!(refNo in uniqueRefNoQty)) {
                uniqueRefNoQty[refNo] = qty;
            }
        });

        // Now calculate total
        const totalQty = Object.values(uniqueRefNoQty)
            .reduce((sum, qty) => sum + qty, 0)
            .toFixed(3);
       const selectedRowCount = filteredPoData?.length;
        let postData = {
            poData: filteredPoData,
            // postingDate: invoiceDate,
            selectedVendorValue : selectedVendor1?.value || '',
            selectedVendorLabel : selectedVendor1?.label || '',
            totalAmount: totalAmount,
            userId: UserDetails.USERID,
            refDocNo:filteredPoData[0]?.refDocNo || formValue.refDocNo,
            docDate:filteredPoData[0]?.docDate || formValue.docDate,
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
            status: 5, // For MIRO Posting
        };
        
        // if (!postData?.selectedVendorValue) {
        //             errorToast('Please select a Confirmed Vendor Code');
        //             return;
        // }
    
        // if (!postData?.postingDate) {
        //     errorToast('Please select a posting date');
        //     return;
        // }
    
        confirmDialog({
            title: 'Are you sure to Post?',
            description: `Selected Rows: ${selectedRowCount} | Overall GRN Qty: ${totalQty}` 
            // | MIRO Total Amount: ${postData.totalAmount}`
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
                                setCondtionOptions([])
                                setPoData([])
                                setSelectedPoNumbers([])
                                setSelectedVendor([])
                                setIsDisable(false)
                                setFormValue({refDocNo: '', docDate: ''})
                                setAttachment({pickSlipCopy:{},sendingWBSlip: {}})
                                setAttachment1({ bargainNote: {},deliveryChallanCopy: {}, ewayBillCopy: {}, eInvoiceCopy: {}, qcCertificateInternalCopy: {}, qcCertificateExternalCopy: {}, creditNoteCopy: {}, vendorEmailCopy: {},projectTeamAcknowledgement: {} , externalWbCopy: {} })
                                GetPODetails()
                                // getGateInInfo()
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
        getVendorList(selectedOptions)
        ConditonType(selectedOptions)
      };

      const [poOptions, setPoOptions] = useState([]);

      const GetPODetails = () => {
        // Replace with the actual API endpoint that provides PO numbers based on userInfoId
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPoNumbersWheat/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.plantids.length > 0 ? UserDetails.plantids : 0}/${1}`)
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
      const [vendorOptions1, setVendorOptions1] = useState([]);
      const [selectedVendor1, setSelectedVendor1] = useState(null);
      const [condtionOptions, setCondtionOptions] = useState([]);
      const [condtion, setCondtion] = useState(null);
      const handleVendorChange = (selectedOption) => {
            setSelectedVendor(selectedOption || []);
      };
       const handleVendorChange1 = (selectedOption) => {
            setSelectedVendor1(selectedOption || []);
      };
      const handleCondtionChange = (selectedOption) => {
            setCondtion(selectedOption || []);
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
                    setVendorOptions1(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };
    const ConditonType = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getCondtionWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setCondtionOptions(data.results);
                } else {
                    // errorToast(data.message);
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
    const updateValue = (index, field, value) => {
    // Make sure poData exists and has the element at index
        if (!poData || !poData[index]) return;

        const updatedPoData = [...poData];  // copy the array
        updatedPoData[index] = {
            ...updatedPoData[index],        // copy the object
            [field]: value                  // update only the field
        };
        setPoData(updatedPoData);          // update state
    };
    const [tonnageModal, setTonnageModal] = useState(false);
    const [tonnageData, setTonnageData] = useState([]);
    const calculateTonnage = () => {

        let poVendorMap = {};  // Group by PO + Vendor + VendorName + ItemText

        for (let i = 0; i < poData.length; i++) {

            const row = poData[i];

            const po = row.poNumber;
            const vendor = row.vendor;
            const vendorName = row.vendorName;
            const itemText = row.itemText;
            const qty = Number(row.quantity || 0);

            if (!po || !vendor || !vendorName || !itemText) continue;

            // Unique group key WITHOUT VA Number
            const groupKey = `${po}_${vendor}_${vendorName}_${itemText}`;

            // Create group if not exist
            if (!poVendorMap[groupKey]) {
                poVendorMap[groupKey] = {
                    poNumber: po,
                    vendor: vendor,
                    vendorName: vendorName,
                    itemText: itemText,
                    totalQty: 0
                };
            }

            // Always add qty (because VA number is removed)
            poVendorMap[groupKey].totalQty += qty;
        }

        // Convert Object → Array
        const result = Object.values(poVendorMap).map(item => ({
            poNumber: item.poNumber,
            vendor: item.vendor,
            vendorName: item.vendorName,
            itemText: item.itemText,
            tonnage: item.totalQty.toFixed(3)
        }));

        setTonnageData(result);
        setTonnageModal(true);
    };
    const exportToExcel = () => {
        console.log(poData)
        // You can export selected rows OR all rows
        const dataToExport = poData.filter(item => item.selected); 
        // If you want all rows use: const dataToExport = poData;
        const dataToExport1 = dataToExport.length == 0 ? poData : dataToExport;
    
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
            {/* <Modal show={show} centered size="xl"> */}
            <Card>
                <Row>
                <Col md="4" sm="4">
                    <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                </Col>
                 <Col md="4" sm="4">
                    <FormGroup>
                        <h5>PO Number</h5>
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
                            // control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            // }),
                            }}
                        />
                    </FormGroup>
                    </Col>
                   
                    <Col md="4" sm="4">
                    <FormGroup>
                        <h5>Vendor Name</h5>
                            <Select
                            isMulti
                            name="vendorName"
                            options={vendorOptions}
                            classNamePrefix="select"
                            onChange={handleVendorChange}
                            value={selectedVendor}
                            // isDisabled={isDisable}
                            placeholder="Select Vendor"
                            // styles={{
                            //     control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            //     }),
                            // }}
                            />

                        
                     </FormGroup>
                    </Col>
                    {/* <Col md="4" sm="4">
                    <FormGroup>
                        <h5>Condtion Type</h5>
                            <Select
                            isMulti
                            name="itemText"
                            options={condtionOptions}
                            classNamePrefix="select"
                            onChange={handleCondtionChange}
                            value={condtion}
                            // isDisabled={isDisable}
                            placeholder="Select Condtion"
                            // styles={{
                            //     control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            //     }),
                            // }}
                            />

                        
                     </FormGroup>
                    </Col> */}
                    
                    <Col md="4" sm="4">
                        <FormGroup className='mt-2'>
                            <Button.Ripple color="primary" type="submit" onClick={getGateInInfo}>
                                View <ArrowDown size={16} />
                            </Button.Ripple>
                        </FormGroup>
                    </Col>
                    {/* <Col md="4" sm="4">
                    <FormGroup>
                        <h5>confirmed Invoice Vendor</h5>
                            <Select
                            name="vendorName"
                            options={vendorOptions1}
                            classNamePrefix="select"
                            onChange={handleVendorChange1}
                            value={selectedVendor1}
                            // isDisabled={isDisable}
                            placeholder="Select Vendor"
                            // styles={{
                            //     control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            //     }),
                            // }}
                            />

                        
                     </FormGroup>
                    </Col> */}
                    {(UserDetails?.role === 'Admin' || UserDetails?.role === 'Approver' || UserDetails?.role === 'Manager') &&
                    <Col md="4" sm="4">
                        <label></label> <br />
                        <Uploader
                        title={"Invoice Reattach"}
                        id="pickSlipCopy"
                        selectedFileName={attachedFiles.pickSlipCopy.name} // Use a global or current file
                        setAttachment={handleFileChange} // Just pass the file directly
                        />
                    </Col>}
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
                                        title="QC External"
                                        id={"qcCertificateExternalCopy"}
                                        selectedFileName={attachedFiles1.qcCertificateExternalCopy.name}
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
                  <Row>
                  
                    <Col md="8" sm="8">
                        <h4 className="text-primary"><u>MIRO Details</u></h4><br />
                    </Col>
                    {poData?.length > 0 &&
                    <Col md="4" sm="4" className="d-flex justify-content-end">
                    <Button
                        color="success"
                        size="sm"
                        onClick={exportToExcel}
                        className="mb-1"
                    >
                        Export to Excel
                    </Button>
                    </Col>}
                        <label></label>
                            <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                maxHeight: "500px",
                                overflowY: "auto",
                                border: "1px solid #ddd"
                            }}
                            >
                            <table
                                className="table table-bordered"
                                style={{
                                width: "100%",
                                minWidth: "1700px",
                                tableLayout: "fixed",
                                textAlign: "left",
                                borderCollapse: "separate"
                                }}
                            >
                                <thead>
                                <tr>
                                    {/* CHECKBOX HEADER */}
                                    <th
                                    style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 3,
                                        background: "#7367f0",
                                        color: "white"
                                    }}
                                    >
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={poData.length === 0}
                                    />
                                    </th>

                                    {[
                                    { label: "GL Description", width: "200px" },
                                    // { label: "Description", width: "200px" },
                                    { label: "Vendor Name", width: "270px" },
                                    { label: "Purchase Type", width: "120px" },
                                    { label: "Invoice No", width: "150px" },
                                    { label: "Invoice Date", width: "170px" },
                                    { label: "Invoice Copy", width: "100px" },
                                    { label: "GRN Qty", width: "120px" },
                                    // { label: "Line", width: "80px" },
                                    { label: "PO NO", width: "120px" },
                                    { label: "MIGO Number", width: "120px" },
                                    // { label: "Plant Code", width: "100px" },
                                    // { label: "PO UNIT", width: "120px" },
                                    // { label: "Tax Code", width: "120px" },
                                    // { label: "Amount", width: "120px" },
                                    // { label: "Tax Amount", width: "120px" },
                                    // { label: "Total Amount", width: "150px" },
                                    // { label: "Currency", width: "120px" },
                                    // { label: "Company Code", width: "140px" },
                                    // { label: "Payment Method", width: "160px" },
                                    // { label: "FI Document", width: "160px" },
                                    // { label: "Profit Center", width: "160px" }
                                    ].map((col, i) => (
                                    <th
                                        key={i}
                                        style={{
                                        width: col.width,
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        background: "#7367f0",
                                        color: "white"
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {poData?.map((materialData, index) => (
                                    <tr key={index}>
                                    {/* CHECKBOX CELL */}
                                    <td
                                        style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle"
                                        }}
                                    >
                                        <input
                                        type="checkbox"
                                        checked={materialData?.selected || false}
                                        onChange={(e) =>
                                            handleCheckboxChange(index, e.target.checked)
                                        }
                                        />
                                    </td>

                                    <td>{materialData?.itemText}</td>
                                    {/* <td>{materialData?.itemText}</td> */}
                                    <td>
                                        {materialData?.vendor} - {materialData?.vendorName}
                                    </td>
                                    <td>{materialData?.VEHICLE_TYPE}</td>    
                                    <td>
                                        <Input
                                        type="text"
                                        value={materialData?.refDocNo || ""}
                                        onChange={(e) =>
                                            updateValue(index, "refDocNo", e.target.value)
                                        }
                                        />
                                    </td>

                                    <td>
                                        <Input
                                        type="date"
                                        value={materialData?.docDate || ""}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            updateValue(index, "docDate", e.target.value)
                                        }
                                        onKeyDown={(e) => e.preventDefault()}
                                        />
                                    </td>

                                    <td>
                                        {materialData?.invoiceCopy && (
                                        <Button.Ripple
                                            color="primary"
                                            size="sm"
                                            onClick={() =>
                                            onActionClick(materialData?.invoiceCopy)
                                            }
                                        >
                                            View
                                        </Button.Ripple>
                                        )}
                                    </td>
                                    <td>{materialData?.quantity}</td>
                                    {/* <td>{materialData?.poItem}</td> */}

                                    <td>
                                        <Button
                                        color="link"
                                        size="sm"
                                        onClick={() =>
                                            openPOModal(materialData?.poNumber, "PO")
                                        }
                                        >
                                        {materialData?.poNumber}
                                        </Button>
                                    </td>

                                    <td>
                                        <Button
                                        color="link"
                                        size="sm"
                                        onClick={() =>
                                            openPOModal(materialData?.migoNumber, "GRN")
                                        }
                                        >
                                        {materialData?.refNo}
                                        </Button>
                                    </td>

                                    
                                    {/* <td>{materialData?.plantCode}</td> */}
                                    {/*<td>{materialData?.taxCode}</td>
                                    <td>{materialData?.amount}</td>
                                    <td>{materialData?.totalTax}</td>

                                    <td>
                                        {(
                                        Number(materialData?.amount || 0) +
                                        Number(materialData?.totalTax || 0)
                                        ).toFixed(3)}
                                    </td>

                                    <td>{materialData?.currency}</td>
                                    <td>{materialData?.compCode}</td>
                                    <td>{materialData?.paymentMethod}</td>
                                    <td>{materialData?.fiDocument}</td>
                                    <td>{materialData?.profitCenter}</td> */}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>


                {/* </CardBody> */}
                </Row>
                </Card>
                <ModalBody>
                    <Row>
                    </Row>
                    <Row />
                    <Row>
                     {poData?.length > 1 &&
                     <Col md="6" sm="6" >
                            <Button.Ripple 
                                    color="success" 
                                    
                                    type="button" 
                                    onClick={calculateTonnage}
                                >
                                Vendor Tonnage
                            </Button.Ripple>
                        </Col>} 
                        {poData?.length > 1 &&
                        <Col md="6" sm="6" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => AddDatasPO(0)} >Submit</Button.Ripple>
                        </FormGroup>
                        </Col>}
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

        <Modal show={tonnageModal} centered size="lg">
            <Modal.Header>
                <Modal.Title>PO / Vendor Tonnage</Modal.Title>
                <X size={20} onClick={() => setTonnageModal(false)} style={{ cursor: "pointer" }} />
            </Modal.Header>

            <Modal.Body>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th className="bg-primary text-white">PO Number</th>
                            <th className="bg-primary text-white">Condtion Type</th>
                            <th className="bg-primary text-white">Vendor</th>
                            <th className="bg-primary text-white">Total Tonnage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tonnageData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.poNumber}</td>
                                <td>{row.itemText}</td>
                                <td>{row.vendor + ' - ' + row.vendorName}</td>
                                <td>{row.tonnage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal.Body>

            <Modal.Footer>
                <Button.Ripple color="secondary" onClick={() => setTonnageModal(false)}>
                    Close
                </Button.Ripple>
            </Modal.Footer>
        </Modal>


        </div >
    );
};

export default InvoiceSubmitWheat;
