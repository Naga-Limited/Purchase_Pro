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
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import { useFormik } from "formik";
import POCopyModal from "../../../POCopyModal";

const RecieptEntryScreenDetails = ({ setShow, show, purchaseId,poNumbers,getLoadingData }) => {

    useEffect(() => {
        getGateInInfo()
        InvoiceValidation()
    }, [])

    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [returnDeliveryData, setReturnDeliveryData] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])

    // Show BIN column (stored as lotNo in payload) when backend indicates lot status is enabled.
    // `isLotStatus` may come in different sections depending on the API shape,
    // so we check both `materialInfo` and `poData.results`.
    const showLotColumn = Boolean(
        (Array.isArray(materialInfo) &&
            materialInfo.some((materialData) =>
                Number(materialData?.isLotStatus) === 1 ||
                materialData?.PO_ITEM?.some((lineItem) => Number(lineItem?.isLotStatus) === 1)
            )) ||
        (Array.isArray(poData)
            ? poData.some((row) => Number(row?.isLotStatus) === 1)
            : Number(poData?.isLotStatus) === 1)
    );

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId == 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId == 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [stoDeliveryData, setStoDeliveryData] = useState([])
    const [extraCopy, setExtraCopy] = useState([])
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `MigoAutomationController/getPurchaseInfo/${purchaseId}/${UserDetails.USERID}/${poNumbers}`);
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPurchaseInfo/${purchaseId}/${UserDetails.USERID}/${poNumbers}`)
            .then((response) => {
                const { data } = response;
                if(data.message1){
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + data.message1 + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                      })
                }else if (data.success == true) {
                    setPoData(data.results)
                    setMaterialInfo(data.materialDetails)
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

    const [ImgData, setImgData] = useState({});

    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {},bargainNote: {},deliveryChallanCopy: {}, ewayBillCopy: {}, eInvoiceCopy: {}, qcCertificateInternalCopy: {}, qcCertificateExternalCopy: {}, creditNoteCopy: {}, vendorEmailCopy: {},projectTeamAcknowledgement: {} , externalWbCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    let { showLoader, hideLoader } = useLoader();

    // const AddDatasPO = () => {



    //     let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

    //     if (keys.length > 0) {
    //         let postdata = new FormData();

    //         let { bargainNote, deliveryChallanCopy,ewayBillCopy,eInvoiceCopy,qcCertificateInternalCopy,qcCertificateExternalCopy,externalWbCopy,vendorEmailCopy,projectTeamAcknowledgement,creditNoteCopy } = ImgData;

    //         postdata.append("image[]", bargainNote);
    //         postdata.append("image[]", deliveryChallanCopy);
    //         postdata.append("image[]", ewayBillCopy);
    //         postdata.append("image[]", eInvoiceCopy);
    //         postdata.append("image[]", qcCertificateInternalCopy);
    //         postdata.append("image[]", qcCertificateExternalCopy);
    //         postdata.append("image[]", externalWbCopy);
    //         postdata.append("image[]", vendorEmailCopy);
    //         postdata.append("image[]", projectTeamAcknowledgement);
    //         postdata.append("image[]", creditNoteCopy);

    //         let UploadFile = 0;
    //         let UploadFile1 = 0;
    //         Object.keys(attachedFiles).forEach((key) => {
    //             postdata.append("file[]", attachedFiles[key]);
    //         });

    //         UploadFile = attachedFiles.bargainNote && attachedFiles.bargainNote.name && attachedFiles.bargainNote.name.length ? true : false;
            
    //         postdata.append("form_name", 'Receipt');
    //         postdata.append("SubFolder", "Payment");
    //         confirmDialog({
    //             title: 'Are you sure to Add?',
    //             description: 'Extra Attachment',
    //           }).then((res) => {
    //         if (res) {
    //         apiPostMethod(sapFileShare, postdata, "File")
    //             .then((response) => {
    //                 const { data } = response;
    //                 if (data.success) {
    //                     let bargainNote = data.files[0] ? data.files[0].updname : "";
    //                     let deliveryChallanCopy = data.files[1] ? data.files[1].updname : "";
    //                     let ewayBillCopy = data.files[2] ? data.files[2].updname : "";
    //                     let eInvoiceCopy = data.files[3] ? data.files[3].updname : "";
    //                     let qcCertificateInternalCopy = data.files[4] ? data.files[4].updname : "";
    //                     let qcCertificateExternalCopy = data.files[5] ? data.files[5].updname : "";
    //                     let externalWbCopy = data.files[6] ? data.files[6].updname : "";
    //                     let vendorEmailCopy = data.files[7] ? data.files[7].updname : "";
    //                     let projectTeamAcknowledgement = data.files[8] ? data.files[8].updname : "";
    //                     let creditNoteCopy = data.files[9] ? data.files[9].updname : "";
    //                     Save(bargainNote,deliveryChallanCopy,ewayBillCopy,eInvoiceCopy,qcCertificateInternalCopy,qcCertificateExternalCopy,externalWbCopy,vendorEmailCopy,projectTeamAcknowledgement,creditNoteCopy)
    //                 }
    //             })
    //             .catch((error) => {
    //                 errorToast("Something went wrong, please try again after sometime");
    //             })
    //         }});   
    //     } else {
    //        Save('')
    //     }
    // };
    const AddDatasPO = () => {
        let postdata = new FormData();
        let hasFiles = false;
    
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
        Object.keys(attachedFiles).forEach((key) => {
            const file = attachedFiles[key];
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
    
            Save(ExtraAttachments);  // 🔥 structured attachment map
        };
    
        if (hasFiles) {
            confirmDialog({
                title: 'Are you sure to Add?',
                description: 'Extra Attachment',
            }).then((res) => {
                if (res) {
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
                }
            });
        } else {
            // No files — send empty object
            Save({});
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
    const handleInputChange = (poIndex, lineIndex, value) => {
        const regex = /^\d*\.?\d{0,3}$/;
        if (regex.test(value) || value === "") {
            setOrderQuantities((prev) => ({
                ...prev,
                [`${poIndex}-${lineIndex}`]: value, // Update state
            }));
        }
    };
    // const Save = (ExtraAttachments) => {
    //     let hasInvalidEntries = false; // Flag to check if any invalid entry exists
    //     const poSelectionMap = {}; // Track if a PO has any valid selection
    //     const missingPOs = []; // Collect missing PO numbers
    //      // 🔴 Create a mapping of PO number to purchaseId for quick lookup
    //     const poIdMap = poData.reduce((acc, item) => {
    //         acc[item.poNumber] = item.id; // Map PO number to purchaseId
    //         return acc;
    //     }, {});

    //     let submittedData = materialInfo?.map((fgData, poIndex) => {
    //         let poHasSelection = false; // Track if this PO has at least one valid material
    
    //         let materials = fgData?.PO_ITEM.map((materialDetails, lineIndex) => {
    //             const ReceivedQty = Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0);
    //             const poQty = Number(materialDetails?.PO_QTY || 0);
    //             const toleranceQty = Number(materialDetails?.TOLERANCE_QTY || 0);
    //             const migoQty = Number(materialDetails?.MIGO_QTY || 0);
    //             const receivedQty = Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0);
    //             const ManufacturingDate =receivedDates[`${poIndex}-${lineIndex}`] || '';
    //             const InvoiceQty =Number(remarks[`${poIndex}-${lineIndex}`]) || 0;
    //             const storageSelection = storageSelections[`${poIndex}-${lineIndex}`]
    //             const LLRNO =Number(llrno[`${poIndex}-${lineIndex}`]) || '';
    //             const WeighmentNo =weighmentNo[`${poIndex}-${lineIndex}`] || '';
    //             const ManualRecord =manualRecord[`${poIndex}-${lineIndex}`] || '';
    //             const BatchCode =batchCode[`${poIndex}-${lineIndex}`] || '';
    //             const ExpireDate =expiresDate[`${poIndex}-${lineIndex}`] || '';
    //             // Open quantity (PO_QTY - MIGO_QTY)
    //             const openQty = (poQty - migoQty).toFixed(3);

    //             // Remaining quantity (PO_QTY + TOLERANCE_QTY - MIGO_QTY - ReceivedQty)
    //             const remainQty = (poQty + toleranceQty - migoQty - receivedQty).toFixed(3);
    //             const materialRate = (materialDetails?.RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)).toFixed(3);
    //             const materialTax = (((materialDetails?.RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)))*(Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100)).toFixed(3);
    //             const materialAmount = (
    //                 ((materialDetails?.RATE - materialDetails?.DIS_RATE) * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                 ((materialDetails?.RATE - materialDetails?.DIS_RATE) * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //             ).toFixed(3);
    //             const materialFreight = (
    //                 (materialDetails?.FREIGHT_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                 (materialDetails?.FREIGHT_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //             ).toFixed(3);
    //             const materialPacking = (
    //                 (materialDetails?.PACKING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                 (materialDetails?.PACKING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //             ).toFixed(3);
    //             const materialLoading = (
    //                 (materialDetails?.LOADING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                 (materialDetails?.LOADING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //             ).toFixed(3);
    //             const materialUnloading = (
    //                 (materialDetails?.UNLOADING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                 (materialDetails?.UNLOADING_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //             ).toFixed(3);
    //             const materialOther = (
    //             (materialDetails?.OTHER_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //             (materialDetails?.OTHER_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))
    //              ).toFixed(3);
    //             const discount = (
    //                 (materialDetails?.DIS_RATE * Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0))).toFixed(3);
    //              let invoiceMaterialAmount = 0;
    //              let invoiceFreightAmount = 0;
    //              let invoicePackingAmount = 0;
    //              let invoiceLoadingAmount = 0;
    //              let invoiceUnloadingAmount = 0;
    //              let invoiceOtherAmount = 0;
    //              let invoiceIneligibleAmount = 0;


    //             if(ReceivedQty < InvoiceQty){
    //                 invoiceMaterialAmount = (
    //                     ((materialDetails?.RATE - materialDetails?.DIS_RATE) * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                     (materialDetails?.RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))
    //                     ).toFixed(3);
    //                 invoiceFreightAmount = (
    //                         ((materialDetails?.FREIGHT_RATE - materialDetails?.DIS_RATE) * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                         (materialDetails?.FREIGHT_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))
    //                         ).toFixed(3);    
                    
    //                 invoicePackingAmount = (
    //                     (materialDetails?.PACKING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                     (materialDetails?.PACKING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))
    //                     ).toFixed(3);
    //                 invoiceLoadingAmount = (
    //                     (materialDetails?.LOADING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                         (materialDetails?.LOADING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))).toFixed(3); 
    //                 invoiceUnloadingAmount = (
    //                     (materialDetails?.UNLOADING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                         (materialDetails?.UNLOADING_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))).toFixed(3);
    //                 invoiceOtherAmount = (
    //                     (materialDetails?.OTHER_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) + 
    //                         (materialDetails?.OTHER_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))).toFixed(3);
    //                 invoiceIneligibleAmount = (
    //                     (materialDetails?.INELIGIBLE_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0)) * (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC)/100) +
    //                         (materialDetails?.INELIGIBLE_RATE * Number(remarks[`${poIndex}-${lineIndex}`] || 0))).toFixed(3);                
    //                 }
    //             // 🚨 Validate remainQty (avoid negative received quantity)
    //             if (remainQty < 0) {
    //                 errorToast(`Error: Please Check Received Qty for The Material - ${materialDetails?.MATERIAL_NAME}`);
    //                 hasInvalidEntries = true;
    //                 return null;
    //             }
    
    //             if (ReceivedQty > 0) {
    //                 poHasSelection = true; // Mark PO as valid
    //             }
    //             const taxPercentage =  (Number(materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST+ materialDetails?.UGST + materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST+ materialDetails?.CESS+ materialDetails?.JITC));
    //             return ReceivedQty > 0 ? {
    //                 poNumber: fgData?.PO_NUM,
    //                 vendorCode: fgData?.VENDOR_CODE,
    //                 vendorName: fgData?.VENDOR_NAME,
    //                 poType: fgData?.PO_TYPE,
    //                 purchaseGroup: fgData?.PURCHASE_GRP,
    //                 purchaseOrg: fgData?.PURCHASE_ORG,
    //                 companyCode: fgData?.COMPANY_CODE,
    //                 invoiceNo: poData[0]?.invoiceNo,
    //                 invoiceDate: poData[0]?.invoiceDate || formatDate(poDetailsData?.invoiceDate),
    //                 material: materialDetails?.MATNR || "",
    //                 materialDescription: materialDetails?.MATERIAL_NAME || "",
    //                 receivedQty: ReceivedQty,
    //                 openQty: openQty,
    //                 remainQty: remainQty,
    //                 gateInOutInfoId: poData[0]?.gateInOutInfoId,
    //                 purchaseIds: poIdMap[fgData?.PO_NUM],
    //                 hsn: materialDetails?.HSN || "",
    //                 poQty: materialDetails?.PO_QTY || 0,
    //                 uom: materialDetails?.MEINS || "",
    //                 poRate: materialDetails?.NETPR || 0,
    //                 storageLocation: storageSelection?.value || materialDetails?.LGORT || "",
    //                 plantCode: materialDetails?.WERKS || "",
    //                 prNumber: materialDetails?.PR_NUM || "",
    //                 prType: materialDetails?.PR_TYPE || "",
    //                 grnQty: materialDetails?.MIGO_QTY || 0,
    //                 freightCharge: materialDetails?.FREIGHT || 0,
    //                 packingCharge: materialDetails?.PACKING || 0,
    //                 loadingCharge: materialDetails?.LOADING || 0,
    //                 unloadingCharge: materialDetails?.UNLOADING || 0,
    //                 otherCharge: materialDetails?.OTHER || 0,
    //                 ineligibleCharge: materialDetails?.INELIGIBLE    || 0,
    //                 lineItem: materialDetails?.EBELP || "",
    //                 tolerance: materialDetails?.TOLERANCE_QTY || 0,
    //                 rcm: materialDetails?.TAXCODE || 0,
    //                 packNo: materialDetails?.PACKNO || 0,
    //                 subPackNo: materialDetails?.SUBPACKNO || 0,
    //                 intRow: materialDetails?.INTROW || 0,
    //                 extRow: materialDetails?.EXTROW || 0,
    //                 userId: UserDetails.USERID,
    //                 postingDate:poDetailsData?.postingDate || currentDate,
    //                 bargainNote:ExtraAttachments.bargainNote,
    //                 deliveryChallanCopy:ExtraAttachments.deliveryChallanCopy,
    //                 ewayBillCopy:ExtraAttachments.ewayBillCopy,
    //                 eInvoiceCopy:ExtraAttachments.eInvoiceCopy,
    //                 qcCertificateInternalCopy:ExtraAttachments.qcCertificateInternalCopy,
    //                 qcCertificateExternalCopy:ExtraAttachments.qcCertificateExternalCopy,
    //                 externalWbCopy:ExtraAttachments.externalWbCopy,
    //                 vendorEmailCopy:ExtraAttachments.vendorEmailCopy,
    //                 projectTeamAcknowledgement:ExtraAttachments.projectTeamAcknowledgement,
    //                 creditNoteCopy:ExtraAttachments.creditNoteCopy,
    //                 ManufacturingDate:ManufacturingDate,
    //                 InvoiceQty:InvoiceQty || ReceivedQty,
    //                 llrNo:LLRNO,
    //                 weighmentNo:WeighmentNo,
    //                 manualRecord:ManualRecord,
    //                 materialRate:materialRate || 0,
    //                 materialTax:materialTax || 0,
    //                 materialAmount:materialAmount || 0,
    //                 materialFreight:materialFreight || 0,
    //                 materialPacking:materialPacking || 0,
    //                 materialLoading:materialLoading || 0,
    //                 materialUnloading:materialUnloading || 0,
    //                 materialOther:materialOther || 0,
    //                 invoiceFreightAmount:invoiceFreightAmount || 0,
    //                 invoiceMaterialAmount:invoiceMaterialAmount || 0,
    //                 invoicePackingAmount:invoicePackingAmount || 0,
    //                 discount:discount || 0,
    //                 discountPercentage:materialDetails?.DIS_PERCENT,
    //                 materialIneligible: (materialDetails?.INELIGIBLE_RATE * ReceivedQty).toFixed(3) || 0,
    //                 invoiceLoadingAmount:invoiceLoadingAmount,
    //                 invoiceUnloadingAmount:invoiceUnloadingAmount,
    //                 invoiceOtherAmount:invoiceOtherAmount,
    //                 invoiceIneligibleAmount:invoiceIneligibleAmount,
    //                 taxPercentage:taxPercentage,
    //                 batchCode:BatchCode,
    //                 expiryDate:ExpireDate
    //             } : null;
    //         }).filter(Boolean);
    
    //         // 🔹 Track missing POs
    //         if (!poHasSelection) {
    //             missingPOs.push(fgData?.PO_NUM);
    //         }
    
    //         return materials.length > 0 ? { materials } : null;
    //     }).filter(Boolean);
    
    //     // 🚨 Show error for missing POs
    //     if (missingPOs.length > 0) {
    //         errorToast(`Error: Please select at least one material for PO(s): ${missingPOs.join(", ")}`);
    //         return; // Stop execution if any PO is missing a selection
    //     }
    //     // if (hasInvalidEntries) {
    //     //     return; // Prevent API call
    //     // }
    //     else if(poDetailsData.postingDate == '' && currentDate == ''){
    //         errorToast(`Error: Please select posting date`);
    //         return;
    //     }else if(poDetailsData.invoiceDate == '' && !poData[0]?.invoiceDate){
    //         errorToast(`Error: Please select invoice date`);
    //         return;
    //     }
    //     let postData = {
    //         MaterialDetails: submittedData.length > 0 ? submittedData : [],
    //         vaNumber:poData[0]?.vaNumber,
    //         vehicleNo:poData[0]?.vehicleNo,
    //         isReceipt:poData[0]?.isReceipt,
    //         po_type:poData[0]?.po_type,
    //         purchaseId:purchaseId,
    //         msme:materialInfo[0]?.MSME,
    //         invoiceCopy: poData[0]?.invoiceCopy ?? poData[0]?.invoiceCopys ?? '',
    //         gateInDateStamp: poData[0]?.gateInDateStamp,
    //     };
        

    //    // 🚨 Final Check: Show error for each missing PO individually

    //     showLoader();
    //     apiPostMethod(apiBaseUrl + "MigoAutomationController/ReceiptDetailsPost", postData)
    //         .then((response) => {
    //             const { data } = response;
    //             if (data.success == true) {
    //                 // ShowToast(data.message);
    //                 // setOpen(false)
    //                 confirmDialog({
    //                     title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
    //                 }).then(() => {
    //                     setShow(false);  // Reloads the page after the confirm dialog is closed
    //                     getLoadingData()
    //                 });
    //             } else if (data.success == false) {
    //                 confirmDialog({
    //                     title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
    //                 }).then(() => {
    //                     setShow(true);
    //                 })
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(JSON.stringify(error))
    //             errorToast("Something went wrong, please try again after sometime");
    //         }).finally((a) => {
    //             hideLoader();
    //         });
    // }
    const Save = (ExtraAttachments) => {
        let hasInvalidEntries = false;
        const missingPOs = [];
    
        // Utility Functions
        function calculateSimple(rate, qty) {
            return (Number(rate || 0) * Number(qty || 0)).toFixed(3);
        }
        function calculateWithTax(rate, qty, taxPercentage) {
            const simple = rate * qty;
            return (simple + (simple * (taxPercentage / 100))).toFixed(3);
        }
        function getTaxPercentage(materialDetails) {
            return Number(
                (materialDetails?.SGST || 0) +
                (materialDetails?.CGST || 0) +
                (materialDetails?.IGST || 0) +
                (materialDetails?.UGST || 0) 
            );
        }
    
        // Create PO mapping
        const poIdMap = poData.reduce((acc, item) => {
            acc[item.poNumber] = item.id; // Map PO number to purchaseId
            return acc;
        }, {});

        let submittedData = materialInfo?.map((fgData, poIndex) => {
            let poHasSelection = false; // Track if this PO has at least one valid material
    
            let materials = fgData?.PO_ITEM.map((materialDetails, lineIndex) => {
                const ReceivedQty = Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0);
                const InvoiceQty = Number(remarks[`${poIndex}-${lineIndex}`] || 0);
                const poQty = Number(materialDetails?.PO_QTY || 0);
                const toleranceQty = Number(materialDetails?.TOLERANCE_QTY || 0);
                const migoQty = Number(materialDetails?.MIGO_QTY || 0);
                const receivedQty = ReceivedQty;
                const openQty = (poQty - migoQty).toFixed(3);
                const remainQty = (poQty + toleranceQty - migoQty - receivedQty).toFixed(3);
    
                if (remainQty < 0) {
                    errorToast(`Error: Please Check Received Qty for The Material - ${materialDetails?.MATERIAL_NAME}`);
                    hasInvalidEntries = true;
                    return null;
                }
    
                if (ReceivedQty > 0) poHasSelection = true;
    
                const ManufacturingDate = receivedDates[`${poIndex}-${lineIndex}`] || '';
                const storageSelection = storageSelections[`${poIndex}-${lineIndex}`];
                const LLRNO = llrno[`${poIndex}-${lineIndex}`] || '';
                const WeighmentNo = weighmentNo[`${poIndex}-${lineIndex}`] || '';
                const ManualRecord = manualRecord[`${poIndex}-${lineIndex}`] || '';
                const LotNo = lotNo[`${poIndex}-${lineIndex}`] || '';
                const BatchCode = batchCode[`${poIndex}-${lineIndex}`] || '';
                const ExpireDate = expiresDate[`${poIndex}-${lineIndex}`] || '';
    
                const taxPercentage = getTaxPercentage(materialDetails);
                
                if (ReceivedQty > 0 && LotNo === '' && showLotColumn) {
                    errorToast(`Error: Lot Number is required for Material - ${materialDetails?.MATERIAL_NAME}`);
                    hasInvalidEntries = true;
                    return null;
                }

                // Material Calculations
                const materialRate = calculateSimple(materialDetails?.RATE, ReceivedQty);
                const materialTax = ((materialDetails?.RATE * ReceivedQty) * (taxPercentage / 100)).toFixed(3);
                const materialAmount = calculateWithTax(materialDetails?.RATE - materialDetails?.DIS_RATE, ReceivedQty, taxPercentage);
                const discount = calculateSimple(materialDetails?.DIS_RATE, ReceivedQty);
                const materialIneligible = calculateSimple(materialDetails?.INELIGIBLE_RATE, ReceivedQty);
                const materialFreight = calculateWithTax(materialDetails?.FREIGHT_RATE, ReceivedQty, taxPercentage);
                const materialPacking = calculateWithTax(materialDetails?.PACKING_RATE, ReceivedQty, taxPercentage);
                const materialLoading = calculateWithTax(materialDetails?.LOADING_RATE, ReceivedQty, taxPercentage);
                const materialUnloading = calculateWithTax(materialDetails?.UNLOADING_RATE, ReceivedQty, taxPercentage);
                const materialOther = calculateWithTax(materialDetails?.OTHER_RATE, ReceivedQty, taxPercentage);
                const rcmValue = Number(
                    (materialDetails?.RSGST || 0) +
                    (materialDetails?.RCGST || 0) +
                    (materialDetails?.RIGST || 0) +
                    (materialDetails?.RUGST || 0) 
                );

                // Invoice Calculations
                let invoiceMaterialAmount = 0, invoiceFreightAmount = 0, invoicePackingAmount = 0;
                let invoiceLoadingAmount = 0, invoiceUnloadingAmount = 0, invoiceOtherAmount = 0, invoiceIneligibleAmount = 0;
    
                if (ReceivedQty < InvoiceQty) {
                    invoiceMaterialAmount = calculateWithTax(materialDetails?.RATE - materialDetails?.DIS_RATE, InvoiceQty, taxPercentage);
                    invoiceFreightAmount = calculateWithTax(materialDetails?.FREIGHT_RATE, InvoiceQty, taxPercentage);
                    invoicePackingAmount = calculateWithTax(materialDetails?.PACKING_RATE, InvoiceQty, taxPercentage);
                    invoiceLoadingAmount = calculateWithTax(materialDetails?.LOADING_RATE, InvoiceQty, taxPercentage);
                    invoiceUnloadingAmount = calculateWithTax(materialDetails?.UNLOADING_RATE, InvoiceQty, taxPercentage);
                    invoiceOtherAmount = calculateWithTax(materialDetails?.OTHER_RATE, InvoiceQty, taxPercentage);
                    invoiceIneligibleAmount = calculateWithTax(materialDetails?.INELIGIBLE_RATE, InvoiceQty, taxPercentage);
                }
    
                return ReceivedQty > 0 ? {
                    poNumber: fgData?.PO_NUM,
                    vendorCode: fgData?.VENDOR_CODE,
                    vendorName: fgData?.VENDOR_NAME,
                    poType: fgData?.PO_TYPE,
                    purchaseGroup: fgData?.PURCHASE_GRP,
                    purchaseOrg: fgData?.PURCHASE_ORG,
                    companyCode: fgData?.COMPANY_CODE,
                    invoiceNo: poData[0]?.invoiceNo,
                    invoiceDate: poData[0]?.invoiceDate || formatDate(poDetailsData?.invoiceDate),
                    material: materialDetails?.MATNR || "",
                    materialDescription: materialDetails?.MATERIAL_NAME || "",
                    receivedQty: ReceivedQty,
                    openQty: openQty,
                    remainQty: remainQty,
                    gateInOutInfoId: poData[0]?.gateInOutInfoId,
                    purchaseIds: poIdMap[fgData?.PO_NUM],
                    hsn: materialDetails?.HSN || "",
                    poQty: materialDetails?.PO_QTY || 0,
                    uom: materialDetails?.MEINS || "",
                    poRate: materialDetails?.NETPR || 0,
                    storageLocation: storageSelection?.value || materialDetails?.LGORT || "",
                    plantCode: materialDetails?.WERKS || "",
                    prNumber: materialDetails?.PR_NUM || "",
                    prType: materialDetails?.PR_TYPE || "",
                    grnQty: materialDetails?.MIGO_QTY || 0,
                    freightCharge: materialDetails?.FREIGHT || 0,
                    packingCharge: materialDetails?.PACKING || 0,
                    loadingCharge: materialDetails?.LOADING || 0,
                    unloadingCharge: materialDetails?.UNLOADING || 0,
                    otherCharge: materialDetails?.OTHER || 0,
                    ineligibleCharge: materialDetails?.INELIGIBLE || 0,
                    lineItem: materialDetails?.EBELP || "",
                    tolerance: materialDetails?.TOLERANCE_QTY || 0,
                    rcm: materialDetails?.TAXCODE || 0,
                    packNo: materialDetails?.PACKNO || 0,
                    subPackNo: materialDetails?.SUBPACKNO || 0,
                    intRow: materialDetails?.INTROW || 0,
                    extRow: materialDetails?.EXTROW || 0,
                    userId: UserDetails.USERID,
                    postingDate: poDetailsData?.postingDate || currentDate,
                    bargainNote: ExtraAttachments.bargainNote,
                    deliveryChallanCopy: ExtraAttachments.deliveryChallanCopy,
                    ewayBillCopy: ExtraAttachments.ewayBillCopy,
                    eInvoiceCopy: ExtraAttachments.eInvoiceCopy,
                    qcCertificateInternalCopy: ExtraAttachments.qcCertificateInternalCopy,
                    qcCertificateExternalCopy: ExtraAttachments.qcCertificateExternalCopy,
                    externalWbCopy: ExtraAttachments.externalWbCopy,
                    vendorEmailCopy: ExtraAttachments.vendorEmailCopy,
                    projectTeamAcknowledgement: ExtraAttachments.projectTeamAcknowledgement,
                    creditNoteCopy: ExtraAttachments.creditNoteCopy,
                    ManufacturingDate,
                    InvoiceQty,
                    llrNo: LLRNO,
                    weighmentNo: WeighmentNo,
                    manualRecord: ManualRecord,
                    materialRate, materialTax, materialAmount,
                    materialFreight, materialPacking, materialLoading, materialUnloading, materialOther,
                    discount, discountPercentage: materialDetails?.DIS_PERCENT,
                    materialIneligible,
                    invoiceMaterialAmount, invoiceFreightAmount, invoicePackingAmount,
                    invoiceLoadingAmount, invoiceUnloadingAmount, invoiceOtherAmount, invoiceIneligibleAmount,
                    taxPercentage, 
                    lotNo: LotNo,
                    batchCode: BatchCode, 
                    expiryDate: ExpireDate,
                    freightCost: materialDetails?.FREIGHT_RATE || 0,
                    materialCost: materialDetails?.RATE || 0,
                    packingCost: materialDetails?.PACKING_RATE || 0,
                    loadingCost: materialDetails?.LOADING_RATE || 0,
                    unloadingCost: materialDetails?.UNLOADING_RATE || 0,
                    otherCost: materialDetails?.OTHER_RATE || 0,
                    ineligibleCost: materialDetails?.INELIGIBLE_RATE || 0,
                    discountCost:materialDetails?.DIS_RATE || 0,
                    rcmValue:rcmValue == 0 ? 0 : taxPercentage,
                    cessValue:cessValue,
                    jitcValue:jitcValue,
                } : null;
            }).filter(Boolean);
    
            if (!poHasSelection) missingPOs.push(fgData?.PO_NUM);
            return materials.length > 0 ? { materials } : null;
        }).filter(Boolean);
    
        // 🚨 Show error for missing POs
        if (missingPOs.length > 0) {
            errorToast(`Error: Please select at least one material for PO(s): ${missingPOs.join(", ")}`);
            return; // Stop execution if any PO is missing a selection
        }
        if (poDetailsData.postingDate == '' && currentDate == '') {
            errorToast(`Error: Please select posting date`);
            return;
        }else if(poDetailsData.invoiceDate == '' && !poData[0]?.invoiceDate){
            errorToast(`Error: Please select invoice date`);
            return;
        }
        if (hasInvalidEntries) {
            return;
        }
        
        // derive a top-level LOT_NO: prefer PO header value, otherwise use first material LOT
        const firstMaterialLOT = (submittedData || [])
            .flatMap(s => (s.materials || []).map(m => m.LOT_NO))
            .find(Boolean) || '';

        let postData = {
            MaterialDetails: submittedData.length > 0 ? submittedData : [],
            vaNumber:poData[0]?.vaNumber,
            vehicleNo:poData[0]?.vehicleNo,
            isReceipt:poData[0]?.isReceipt,
            po_type:poData[0]?.po_type,
            purchaseId:purchaseId,
            msme:materialInfo[0]?.MSME,
            invoiceCopy: poData[0]?.invoiceCopy ?? poData[0]?.invoiceCopys ?? '',
            gateInDateStamp: poData[0]?.gateInDateStamp,
            receipt_material_info: true,
           // lotNo: poData[0]?.LOT_NO || poData[0]?.lotNo || firstMaterialLOT || '',
        };
        

       // 🚨 Final Check: Show error for each missing PO individually

        showLoader();
        apiPostMethod(apiBaseUrl + "MigoAutomationController/ReceiptDetailsPost", postData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        setShow(false);
                        getLoadingData();
                    });
                } else {
                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
                    }).then(() => {
                        setShow(true);
                    });
                }
            })
            .catch(() => {
                errorToast("Something went wrong, please try again after sometime");
            }).finally(() => hideLoader());
    }
    const [storageSelections, setStorageSelections] = useState({});

    const handleMovementTypeChange = (selectedOption, index, lineIndex) => {
        const key = `${index}-${lineIndex}`;
        setStorageSelections((prev) => ({
          ...prev,
          [key]: selectedOption
        }));
      };
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
          FromDate: new Date(),
          ToDate: new Date(),
        },
        validationSchema: Yup.object().shape({}),
        onSubmit: (values) => { },
    });
    useEffect(() => {
        if (materialInfo?.length > 0) {
          const defaults = {};
      
          materialInfo.forEach((mat, i) => {
            mat.PO_ITEM?.forEach((line, j) => {
              const key = `${i}-${j}`;
      
              if (line?.LGORT) {
                defaults[key] = {
                  value: line.LGORT,
                  label: line.LGORT  // or format like `Storage ${line.LGORT}`
                };
              }
            });
          });
      
          setStorageSelections(defaults);
        }
      }, [materialInfo]);
      const currentDate = new Date().toISOString().split("T")[0];
      const handleKeyDown = (e) => {
          // Prevent typing anything manually in the input field
          e.preventDefault();
      };
      const [poDetailsData, setPoDetailsData] = useState({
        postingDate: '',
        invoiceDate: ''
      });
      const handleInputChange1 = (value, field) => {
        setPoDetailsData(prev => ({
          ...prev,
          [field === 'posting' ? 'postingDate' : 'invoiceDate']: value
        }));
      };
      const [date_control, setDate_control] = useState({
        postingDate: '',
        invoiceDate: ''
      });
      const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const days = parseInt(response?.data?.results[0]?.migo_date ?? 0);
            const today = new Date();
            const limitedDate = new Date(today);
            limitedDate.setDate(today.getDate() - days);
      
            const formattedMin = limitedDate.toISOString().split("T")[0];
            setDate_control(formattedMin); // use as min
          });
      };
      const [remarks, setRemarks] = useState({});
      const [receivedDates, setReceivedDates] = useState({});
      const [llrno, setLlrno] = useState({});
      const [weighmentNo, setWeighmentNo] = useState({});
      const [manualRecord, setManualRecord] = useState({});
      const [lotNo, setLotNo] = useState({});
      const [batchCode, setBatchCode] = useState({});
      const [expiresDate, setExpiresDate] = useState({});
      const handleDateChange = (i, j, value) => {
        setReceivedDates((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleExpireDateChange = (i, j, value) => {
        setExpiresDate((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleRemarksChange = (i, j, value) => {
        setRemarks((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleLRChange = (i, j, value) => {
        setLlrno((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleWeighmentChange = (i, j, value) => {
        setWeighmentNo((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleManualRecord = (i, j, value) => {
        setManualRecord((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleLotNo = (i, j, value) => {
        setLotNo((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const handleBatchCode = (i, j, value) => {
        setBatchCode((prev) => ({ ...prev, [`${i}-${j}`]: value }));
      };
      const [selectedLines, setSelectedLines] = useState([]);

      const handleSelectLine = (key) => {
        setSelectedLines(prev =>
          prev.includes(key)
            ? prev.filter(k => k !== key)
            : [...prev, key]
        );
      };
      const removeSelectedLines = () => {
        const updatedMaterialInfo = materialInfo.map((material, i) => {
          const updatedItems = material.PO_ITEM.filter((_, j) => 
            selectedLines.includes(`${i}-${j}`)
          );
          return { ...material, PO_ITEM: updatedItems };
        }).filter(material => material.PO_ITEM.length > 0);
        setMaterialInfo(updatedMaterialInfo);
        setSelectedLines([]);
      };
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
    //   const { 
    //     totalMaterialAmount, 
    //     totalTaxAmount, 
    //     totalDiscount,
    //     totalIneligibleTax,
    //     totalFreight,
    //     totalLoading,
    //     totalUnloading,
    //     totalPacking,
    //     totalOtherCharges,
    //     totalAmount,
    //     taxPercentageRCM,
    //     cessValue,
    //     jitcValue, 
    //   } = materialInfo?.reduce(
    //     (totals, materialData, index) => {
    //       materialData?.PO_ITEM?.forEach((lineItem, lineIndex) => {
    //         const receivedQty = Number(orderQuantities[`${index}-${lineIndex}`] || 0);
            
    //         // 1. Material Amount (Rate × Qty)
    //         const materialAmount = lineItem?.RATE * receivedQty;
    //         totals.totalMaterialAmount += materialAmount;
      
    //         // 2. Discount Amount (Discount Rate × Qty)
    //         const discountAmount = lineItem?.DIS_RATE * receivedQty;
    //         totals.totalDiscount += discountAmount;
      
    //         // 3. Taxable Amount (Material Amount - Discount)
    //         const taxableAmount = materialAmount - discountAmount;
      
    //         // 4. Tax Amount (Taxable Amount × Tax %)
    //         const taxPercentage = (
    //           Number(lineItem?.SGST || 0) +
    //           Number(lineItem?.CGST || 0) +
    //           Number(lineItem?.IGST || 0) +
    //           Number(lineItem?.UGST || 0) 
    //         ) / 100;
    //         const taxPercentageRCM = (
    //             Number(lineItem?.RSGST || 0) +
    //             Number(lineItem?.RCGST || 0) +
    //             Number(lineItem?.RIGST || 0) +
    //             Number(lineItem?.RUGST || 0) 
    //           ) / 100;
    //         const CESSTax = (
    //             Number(lineItem?.CESS || 0)
    //           ) / 100;
    //         const JITCTax = (
    //             Number(lineItem?.JITC || 0)
    //           ) / 100;
    //         totals.taxPercentageRCM += taxPercentageRCM;
    //         const taxAmount = taxableAmount * taxPercentage;
    //         totals.totalTaxAmount += taxAmount;
      
    //         // 5. Ineligible Tax (Ineligible Rate × Qty)
    //         const ineligibleTax = lineItem?.INELIGIBLE_RATE * receivedQty;
    //         totals.totalIneligibleTax += ineligibleTax;
      
    //         // 6. Other Charges (with tax if applicable)
    //         const freightAmount = lineItem?.FREIGHT_RATE * receivedQty * (1 + taxPercentage);
    //         const packingAmount = lineItem?.PACKING_RATE * receivedQty * (1 + taxPercentage);
    //         const loadingAmount = lineItem?.LOADING_RATE * receivedQty * (1 + taxPercentage);
    //         const unloadingAmount = lineItem?.UNLOADING_RATE * receivedQty * (1 + taxPercentage);
    //         const otherAmount = lineItem?.OTHER_RATE * receivedQty * (1 + taxPercentage);
    //         const cessValue = taxableAmount *  JITCTax;
    //         const jitcValue = taxableAmount *  JITCTax;
    //         // Sum individual charges
    //         totals.totalFreight += freightAmount;
    //         totals.totalLoading += loadingAmount;
    //         totals.totalUnloading += unloadingAmount;
    //         totals.totalPacking += packingAmount;
    //         totals.totalOtherCharges += otherAmount;
    //         totals.cessValue += CESSTax;
    //         totals.jitcValue += jitcValue;
    //         // 7. Total Amount (Material - Discount + Tax + Charges + Ineligible Tax)
    //         totals.totalAmount += (
    //             taxableAmount + 
    //             taxAmount + 
    //             freightAmount + 
    //             packingAmount + 
    //             loadingAmount + 
    //             unloadingAmount + 
    //             otherAmount +
    //             jitcValue+
    //             cessValue+
    //             ineligibleTax -
    //             (taxPercentageRCM == 0 ? 0 : taxAmount)
    //         );
    //       });
    //       return totals;
    //     },
    //     { 
    //       totalMaterialAmount: 0, 
    //       totalTaxAmount: 0, 
    //       totalDiscount: 0,
    //       totalIneligibleTax: 0,
    //       totalFreight: 0,
    //       totalLoading: 0,
    //       totalUnloading: 0,
    //       totalPacking: 0,
    //       totalForwarding: 0,
    //       totalOtherCharges: 0,
    //       totalAmount: 0,
    //       taxPercentageRCM:0,
    //       jitcValue:0,
    //       cessValue:0
    //     }
    //   );
      
    //   const totalCharges = totalFreight + totalLoading + totalUnloading + 
    //                       totalPacking  + totalOtherCharges;
      
    //   const data1 = [
    //     { label: "Gross Material Amount", value: totalMaterialAmount },
    //     { label: "Less: Total Discount", value: -totalDiscount, isNegative: true },
    //     { label: "Taxable Amount", value: (totalMaterialAmount - totalDiscount), isHighlight: true },
        
    //     // Charges Section
    //     { label: "Freight Charges", value: totalFreight, isCharge: true },
    //     { label: "Loading Charges", value: totalLoading, isCharge: true },
    //     { label: "Unloading Charges", value: totalUnloading, isCharge: true },
    //     { label: "Packing Charges", value: totalPacking, isCharge: true },
    //     { label: "Other Charges", value: totalOtherCharges, isCharge: true },
    //     // { label: "Total Charges", value: totalCharges, isSubTotal: true },
        
    //     // Taxes Section
    //     { label: "Add: Total Tax", value: totalTaxAmount },
    //     { label: "RCM Reversal", value: taxPercentageRCM === 0 ? 0 : (-totalTaxAmount) },
    //     { label: "Add: Ineligible Tax", value: totalIneligibleTax },
    //     // { label: "Add: Ineligible Tax", value: totalIneligibleTax },
    //     { label: "CESS Value", value: cessValue },
    //     { label: "JITC Value", value: jitcValue },
    //     // Final Total
    //     { label: "Total Amount Payable", value: totalAmount, isTotal: true }
    //     ];
    const {
        totalMaterialAmount,
        totalTaxAmount,
        totalDiscount,
        totalIneligibleTax,
        totalFreight,
        totalLoading,
        totalUnloading,
        totalPacking,
        totalOtherCharges,
        totalAmount,
        totalRCMTax,
        cessValue,
        jitcValue,
        } = materialInfo?.reduce(
        (totals, materialData, index) => {
            materialData?.PO_ITEM?.forEach((lineItem, lineIndex) => {
            const receivedQty = Number(orderQuantities[`${index}-${lineIndex}`] || 0);
            if (receivedQty <= 0) return;

            // Base values
            const rate = Number(lineItem?.RATE || 0);
            const disRate = Number(lineItem?.DIS_RATE || 0);
            const materialAmount = rate * receivedQty;
            const discountAmount = disRate * receivedQty;
            const taxableAmount = materialAmount - discountAmount;

            // Tax percentages
            const normalTaxPct =
                (Number(lineItem?.SGST || 0) +
                Number(lineItem?.CGST || 0) +
                Number(lineItem?.IGST || 0) +
                Number(lineItem?.UGST || 0)) / 100;

            const rcmTaxPct =
                (Number(lineItem?.RSGST || 0) +
                Number(lineItem?.RCGST || 0) +
                Number(lineItem?.RIGST || 0) +
                Number(lineItem?.RUGST || 0)) / 100;

            const cessPct = Number(lineItem?.CESS || 0) / 100;
            const jitcPct = Number(lineItem?.JITC || 0) / 100;

            // Computed values
            const normalTaxAmt = taxableAmount * normalTaxPct;
            const rcmTaxAmt = taxableAmount * rcmTaxPct; // RCM taxes (not added to total)
            const cessAmt = taxableAmount * cessPct;
            const jitcAmt = taxableAmount * jitcPct;
            const ineligibleTax = (Number(lineItem?.INELIGIBLE_RATE) || 0) * receivedQty;

            // Other charges (only taxable if NOT under RCM)
            const taxableForCharges = rcmTaxPct > 0 ? 0 : normalTaxPct;
            const freight = Number(lineItem?.FREIGHT_RATE || 0) * receivedQty * (1 + taxableForCharges);
            const packing = Number(lineItem?.PACKING_RATE || 0) * receivedQty * (1 + taxableForCharges);
            const loading = Number(lineItem?.LOADING_RATE || 0) * receivedQty * (1 + taxableForCharges);
            const unloading = Number(lineItem?.UNLOADING_RATE || 0) * receivedQty * (1 + taxableForCharges);
            const other = Number(lineItem?.OTHER_RATE || 0) * receivedQty * (1 + taxableForCharges);

            // Total for this line
            const totalLine =
                taxableAmount +
                (rcmTaxPct > 0 ? 0 : normalTaxAmt) + // exclude tax if RCM applies
                freight +
                packing +
                loading +
                unloading +
                other +
                cessAmt +
                jitcAmt +
                ineligibleTax;

            // Aggregate totals
            totals.totalMaterialAmount += materialAmount;
            totals.totalDiscount += discountAmount;
            totals.totalTaxAmount += normalTaxAmt;
            totals.totalRCMTax += rcmTaxAmt;
            totals.totalIneligibleTax += ineligibleTax;
            totals.totalFreight += freight;
            totals.totalLoading += loading;
            totals.totalUnloading += unloading;
            totals.totalPacking += packing;
            totals.totalOtherCharges += other;
            totals.cessValue += cessAmt;
            totals.jitcValue += jitcAmt;
            totals.totalAmount += totalLine;
            });
            return totals;
        },
        {
            totalMaterialAmount: 0,
            totalTaxAmount: 0,
            totalRCMTax: 0,
            totalDiscount: 0,
            totalIneligibleTax: 0,
            totalFreight: 0,
            totalLoading: 0,
            totalUnloading: 0,
            totalPacking: 0,
            totalOtherCharges: 0,
            cessValue: 0,
            jitcValue: 0,
            totalAmount: 0,
        }
        );

      const totalCharges = totalFreight + totalLoading + totalUnloading + 
                          totalPacking  + totalOtherCharges;
      
      const data1 = [
        { label: "Gross Material Amount", value: totalMaterialAmount },
        { label: "Less: Total Discount", value: -totalDiscount, isNegative: true },
        { label: "Taxable Amount", value: totalMaterialAmount - totalDiscount, isHighlight: true },

        { label: "Freight Charges", value: totalFreight, isCharge: true },
        { label: "Loading Charges", value: totalLoading, isCharge: true },
        { label: "Unloading Charges", value: totalUnloading, isCharge: true },
        { label: "Packing Charges", value: totalPacking, isCharge: true },
        { label: "Other Charges", value: totalOtherCharges, isCharge: true },

        { label: "Add: Total Tax", value: totalTaxAmount },
        { label: "Less: RCM Reversal", value: -totalRCMTax, isNegative: true },
        { label: "Add: Ineligible Tax", value: totalIneligibleTax },
        { label: "CESS Value", value: cessValue },
        { label: "JITC Value", value: jitcValue },

        { label: "Total Amount Payable", value: totalAmount, isTotal: true },
        ];
        const [selectedPO, setSelectedPO] = useState(null);
        const [poModalOpen, setPoModalOpen] = useState(false);
        const [selectedType, setSelectedType] = useState(null);
        const openPOModal = (poNumber,type) => {
            setSelectedPO(poNumber);
            setSelectedType(type)
            setPoModalOpen(true);
        };

        const togglePOModal = () => setPoModalOpen(!poModalOpen);
    return (
        <div className="receipt-entry-details-compact">
            <style>{`
                .receipt-entry-details-modal-wide { max-width: min(98vw, 1680px); margin: 0.5rem auto; }
                .receipt-entry-details-compact .card-body { padding: 0.65rem 0.85rem; }
                .receipt-entry-details-compact .receipt-section-title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin-bottom: 0.35rem;
                }
                .receipt-entry-details-compact .table-compact td,
                .receipt-entry-details-compact .table-compact th {
                    padding: 0.28rem 0.4rem;
                    font-size: 0.78rem;
                    vertical-align: middle;
                }
                .receipt-entry-details-compact .table-compact thead th {
                    font-size: 0.72rem;
                    line-height: 1.2;
                }
                .receipt-entry-details-compact label { font-size: 0.8rem; margin-bottom: 0.2rem; }
                .receipt-entry-details-compact .form-control { font-size: 0.8rem; padding: 0.28rem 0.45rem; height: calc(1.4em + 0.5rem); }
            `}</style>
            <Modal show={show} centered size="xl" >
                <CardHeader className="py-2">
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h5 className="mb-0" style={{ fontSize: "1.05rem" }}>Receipt entry details</h5>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={() => setShow(false)} size={18} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Card className="mb-1">
                <CardBody>
                        <Col md="12" sm="12" className="px-0">
                            <div className="text-primary receipt-section-title"><u>PO details</u></div>
                        </Col>
                        <Row>
                        <Col md="3" sm="3">
                        <label>Posting Date</label>
                        <Input
                            type="date"
                            value={poDetailsData.postingDate || currentDate}
                            min={date_control}
                            max={currentDate}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => handleInputChange1(e.target.value, 'posting')}
                        />
                        </Col>
                        {!poData[0]?.invoiceDate &&
                        <Col md="3" sm="3">
                        <label>Invoice Date</label>
                        <Input
                            type="date"
                            value={poDetailsData.invoiceDate}
                            max={currentDate}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => handleInputChange1(e.target.value, 'invoice')}
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
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 ) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Bargain Note"
                                        id={"bargainNote"}
                                        selectedFileName={attachedFiles.bargainNote.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Delivery Challan"
                                        id={"deliveryChallanCopy"}
                                        selectedFileName={attachedFiles.deliveryChallanCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 || poData[0]?.moduleTypeId == 34) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Eway Bill"
                                        id={"ewayBillCopy"}
                                        selectedFileName={attachedFiles.ewayBillCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 || poData[0]?.moduleTypeId == 34) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="E-Invoice"
                                        id={"eInvoiceCopy"}
                                        selectedFileName={attachedFiles.eInvoiceCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="QC Certificate - Internal"
                                        id={"qcCertificateInternalCopy"}
                                        selectedFileName={attachedFiles.qcCertificateInternalCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="QC Certificate - External"
                                        id={"qcCertificateExternalCopy"}
                                        selectedFileName={attachedFiles.qcCertificateExternalCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 || poData[0]?.moduleTypeId == 34) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="External WB"
                                        id={"externalWbCopy"}
                                        selectedFileName={attachedFiles.externalWbCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 || poData[0]?.moduleTypeId == 34) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Email Vendor"
                                        id={"vendorEmailCopy"}
                                        selectedFileName={attachedFiles.vendorEmailCopy.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 34)  && 
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Proj Acknowledgement"
                                        id={"projectTeamAcknowledgement"}
                                        selectedFileName={attachedFiles.projectTeamAcknowledgement.name}
                                    />
                                </div>}
                                {(poData[0]?.moduleTypeId == 33 || poData[0]?.moduleTypeId == 21 || poData[0]?.moduleTypeId == 12 || poData[0]?.moduleTypeId == 38 || poData[0]?.moduleTypeId == 15 || poData[0]?.moduleTypeId == 41 || poData[0]?.moduleTypeId == 34) &&
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Credit Note"
                                        id={"creditNoteCopy"}
                                        selectedFileName={attachedFiles.creditNoteCopy.name}
                                    />
                                </div>}
                            </FormGroup>
                        </Col>
                        </Row>
                        <label></label>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="table table-bordered table-sm table-compact" 
                                    style={{ width: '100%', minWidth: '1600px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                                <thead>
                                <tr>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Vehicle NO</th>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>PO NO</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>PO Type</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Plant</th>
                                    <th className="bg-primary text-white" style={{ width: '30%' }}>Vendor Name</th> {/* Increased width */}
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Inv No</th>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Inv Date</th>
                                    <th className="bg-primary text-white" style={{ width: '10%' }}>MSME</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Inv Copy</th>
                                    {/* <th className="bg-primary text-white" style={{ width: '20%' }}>COA</th> */}
                                    {/* <th className="bg-primary text-white" style={{ width: '12%' }}>Reattach Invoice</th>
                                    <th className="bg-primary text-white" style={{ width: '12%' }}>Reattach COA</th> */}
                                </tr>
                                </thead>
                                <tbody>
                                {poData?.map((poDetailsData, index) => (
                                    <tr key={index}>
                                    <td>{poDetailsData?.vehicleNo}</td>
                                    <td>
                                        {/* {poDetailsData?.poNumber} */}
                                 
                                        <Button color="link" size="sm" onClick={() => openPOModal(poDetailsData?.poNumber,'PO')} style={{ textDecoration: "underline" }}>
                                        {poDetailsData?.poNumber}
                                        </Button>
        
                                    </td>
                                    <td>{poDetailsData?.poType}</td>
                                    <td>{poDetailsData?.PLANT_NAME}</td>
                                    <td>{poDetailsData?.vendorName}</td>
                                    <td>{poDetailsData?.invoiceNo}</td>
                                    <td>{poDetailsData?.invoiceDate}</td>
                                    <td>{materialInfo[0]?.MSME}</td>
                                    <td>
                                        <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(poDetailsData.invoiceCopy ? poDetailsData.invoiceCopy : poDetailsData.invoiceCopys)}>View</Button.Ripple>
                                        {/* <Button.Ripple className='ml-1' color="warning" size="sm" type="button" onClick={() => onActionClick(poDetailsData.invoiceCopy)}>Reattach</Button.Ripple> */}
                                    </td>
                                    {/* <td> */}
                                        {/* <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(poDetailsData.coaCopy)}>View</Button.Ripple> */}
                                        {/* <Button.Ripple className='ml-1' color="warning" size="sm" type="button" onClick={() => onActionClick(poDetailsData.coaCopy)}>Reattach</Button.Ripple> */}
                                    {/* </td> */}
                                    {/* <td>
                                        <button className="btn btn-sm btn-warning">Reattach</button>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-warning">Reattach</button>
                                    </td> */}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
                <Card className="mb-0">
                <CardBody>
                        <Col md="12" sm="12" >
                            <div className="text-primary "><u>Material details</u></div>
                        </Col>
                        <label></label>
                        <div  style={{
                            width: '100%',
                            overflowX: 'auto',
                            // maxHeight: "380px",
                            // border: "1px solid #ddd",
                            paddingBottom: "100px",
                            // fontSize: "7pt"
                        }}>
                        <table className="table table-bordered" 
                        style={{ width: '100%', minWidth: '3000px', textAlign: 'left', tableLayout: 'fixed' }}>

                        {/* Sticky Header */}
                        <thead style={{ position: "sticky",left: 0, background: "#007bff", zIndex: 1000 ,padding: 0 ,  top: 0}}>
                            <tr>
                            <th className="bg-primary text-white" 
                                style={{ width: "50px", position: "sticky", left: 0, zIndex: 1050, background: "#007bff"}}>
                            </th>
                            <th className="bg-primary text-white" 
                                    style={{ width: "80px", position: "sticky", left: 0, zIndex: 1050, background: "#007bff" }}>
                                    LINE
                                </th>
                                <th className="bg-primary text-white" 
                                    style={{ width: "130px", position: "sticky", left: '80px', zIndex: 1050, background: "#007bff" }}>
                                    PO NO
                                </th>
                                <th className="bg-primary text-white" 
                                    style={{ width: "120px", position: "sticky", left: "210px", zIndex: 1050, background: "#007bff" }}>
                                    {poData[0]?.po_type == 0 ? "Material" : 'Service Code'}
                                </th>
                                <th className="bg-primary text-white" 
                                    style={{ width: "200px", position: "sticky", left: "330px", zIndex: 1050, background: "#007bff" }}>
                                    {poData[0]?.po_type == 0 ? "Material Name":'Service Name'}
                                </th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>PO Qty</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>GRN Qty</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>Tolerance</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>Open Qty</th>
                                <th className="bg-primary text-white" style={{ width: "170px" }}>Received Qty</th>
                                <th className="bg-primary text-white" style={{ width: "170px" }}>Invoice Qty</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>Remaining Qty</th>
                                <th className="bg-primary text-white" style={{ width: "150px" }}>Storage</th>
                                {showLotColumn && <th className="bg-primary text-white" style={{ width: "150px" }}>Lot No</th>}
                                <th className="bg-primary text-white" style={{ width: "100px" }}>UOM</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>HSN & SAC Code</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>Rate</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Material Price</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Tax Price</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Discount</th>
                                <th className="bg-primary text-white" style={{ width: "150px" }}>Total Price</th>
                                {/* <th className="bg-primary text-white" style={{ width: "300px" }}>Vendor Name</th> */}
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Freight Charges</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Packing Forwarding</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Loading Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Unloading Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Other Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Ineligible Tax</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>TAX Code</th>
                                {((UserDetails.GATE_ID == 19 || UserDetails.GATE_ID == 17) && (poData[0]?.moduleTypeId ==21 ||poData[0]?.moduleTypeId ==33 || poData[0]?.moduleTypeId ==12))&& <th className="bg-primary text-white" style={{ width: "200px" }}>Manufacturing Date</th> }
                                {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId ==21 ||poData[0]?.moduleTypeId ==33))&&<th className="bg-primary text-white" style={{ width: "200px" }}>LR Copy No</th>}
                                {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId ==21 ||poData[0]?.moduleTypeId ==33))&&<th className="bg-primary text-white" style={{ width: "200px" }}>Weighment No</th>}
                                {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId ==21 ||poData[0]?.moduleTypeId ==33))&&<th className="bg-primary text-white" style={{ width: "200px" }}>Manual No</th>}
                                {(poData[0]?.batchCode == 1 )&&
                                <th className="bg-primary text-white" style={{ width: "200px" }}>Batch Code</th>}
                                <th className="bg-primary text-white" style={{ width: "200px" }}>Expiry Date</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {materialInfo?.map((materialData, index) => (
                                materialData?.PO_ITEM?.map((lineItem, lineIndex) => (
                                    <tr key={`${index}-${lineIndex}`}>
                                        {/* Sticky First Three Columns */}
                                        <td style={{ 
                                            position: "sticky", left: 0, background: "#fff", zIndex: 100 
                                        }}
                                         >
                                        <Input
                                            type="checkbox"
                                            checked={selectedLines.includes(`${index}-${lineIndex}`)}
                                            disabled={Number(orderQuantities[`${index}-${lineIndex}`] || 0) > 0}
                                            onChange={() => handleSelectLine(`${index}-${lineIndex}`)}
                                        />
                                        </td>
                                        <td style={{ 
                                            position: "sticky", left: '50px', background: "#fff", zIndex: 100 
                                        }}>
                                            {lineItem?.EBELP}
                                        </td>
                                        <td style={{ 
                                            position: "sticky", left: '100px', background: "#fff", zIndex: 100 
                                        }}>
                                            {materialData?.PO_NUM}
                                        </td>
                                        <td style={{ 
                                            position: "sticky", left: "250px", background: "#fff", zIndex: 100 
                                        }}>
                                            {lineItem?.MATNR}
                                        </td>
                                        <td style={{ 
                                            position: "sticky", left: "350px", background: "#fff", zIndex: 100 
                                        }}>
                                            {lineItem?.MATERIAL_NAME}
                                        </td>
                                        
                                        {/* Other Columns */}
                                        <td style={{ textAlign: "right" }}>{lineItem?.PO_QTY}</td>
                                        <td style={{ textAlign: "right" }}>{lineItem?.MIGO_QTY}</td>
                                        <td style={{ textAlign: "right" }}>{lineItem?.TOLERANCE_QTY}</td>
                                        <td style={{ textAlign: "right" }}>{(() => {
                                                const value = lineItem?.PO_QTY - lineItem?.MIGO_QTY;
                                                return value % 1 === 0 ? value : value.toFixed(3); // Show decimal only if needed
                                        })()}</td>
                                        <td style={{ width: "10%", padding: "0.5rem" }}>
                                            {(Number((lineItem?.PO_QTY+lineItem?.TOLERANCE_QTY) - lineItem?.MIGO_QTY) > 0) && (
                                                <Input 
                                                    type="text" 
                                                    placeholder="REC_QTY" 
                                                    value={orderQuantities[`${index}-${lineIndex}`] || ""} 
                                                    onChange={(e) => handleInputChange(index, lineIndex, e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (!/[\d.]/.test(e.key) || (e.key === "." && e.target.value.includes("."))) {
                                                            e.preventDefault(); // Block non-numeric input except one decimal
                                                        }
                                                    }}
                                                />
                                            )}
                                        </td>
                                       
                                        <td style={{ width: "10%", padding: "0.5rem" }}>
                                            <Input
                                                type="text"
                                                placeholder="Invoice Qty"
                                                value={remarks[`${index}-${lineIndex}`] || orderQuantities[`${index}-${lineIndex}`]}
                                                onChange={(e) => handleRemarksChange(index, lineIndex, e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (!/[\d.]/.test(e.key) || (e.key === "." && e.target.value.includes("."))) {
                                                        e.preventDefault(); // Block non-numeric input except one decimal
                                                    }
                                                }}
                                                disabled = {poData[0]?.invoiceQty == 0}
                                            />
                                        </td>
                                        <td style={{ textAlign: "right" }}>{(() => {
                                            const value = Number((lineItem?.PO_QTY + lineItem?.TOLERANCE_QTY) - lineItem?.MIGO_QTY) - Number(orderQuantities[`${index}-${lineIndex}`] || 0);
                                            return value % 1 === 0 ? value : value.toFixed(3); // Show decimal only if needed
                                        })()}</td>
                                         <td style={{ width: "10%", padding: "0.5rem" }}>
                                           <CustomDropdownInput
                                            url={`${apiBaseUrl}MigoAutomationController/StorageLocationFetch/${lineItem?.WERKS}`}
                                            form={form}
                                            id="LGORT"
                                            name="LGORT"
                                            value={storageSelections[`${index}-${lineIndex}`] || null}
                                            onChange={(val) => handleMovementTypeChange(val, index, lineIndex)}
                                            />
                                        </td>
                                        {showLotColumn && (
                                            <td style={{ width: "150px", padding: "0.5rem" }}>
                                                {(() => {
                                                    const locationId =
                                                        storageSelections[`${index}-${lineIndex}`]?.value ||
                                                        lineItem?.LGORT;
                                                    return (
                                                        <CustomDropdownInput
                                                            url={`${apiBaseUrl}MigoAutomationController/getLotDetails/${lineItem?.WERKS}/${locationId}`}
                                                            // postData={
                                                            //     Plant : lineItem?.WERKS,
                                                            //     locationId ? { LocationId: locationId } : {}
                                                            // }
                                                            form={form}
                                                            id="BIN"
                                                            name="BIN"
                                                            placeholder="BIN"
                                                            isDisabled={!locationId}
                                                            value={
                                                                lotNo[`${index}-${lineIndex}`]
                                                                    ? {
                                                                          value: lotNo[`${index}-${lineIndex}`],
                                                                          label: lotNo[`${index}-${lineIndex}`]
                                                                      }
                                                                    : null
                                                            }
                                                            onChange={(val) =>
                                                                handleLotNo(
                                                                    index,
                                                                    lineIndex,
                                                                    val?.value ?? ""
                                                                )
                                                            }
                                                        />
                                                    );
                                                })()}
                                            </td>
                                        )}
                                        <td style={{ textAlign: "right" }}>{lineItem?.MEINS}</td>
                                        <td>{lineItem?.HSN}</td>
                                        <td>{lineItem?.RATE}</td>
                                        <td style={{ textAlign: "right" }}>{(lineItem?.RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)).toFixed(3)}</td>
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) *
                                                (
                                                (Number(lineItem?.SGST || 0) +
                                                Number(lineItem?.CGST || 0) +
                                                Number(lineItem?.IGST || 0) +
                                                Number(lineItem?.UGST || 0)) / 100
                                                )
                                            ).toFixed(3)} 
                                        </td>
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.DIS_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)} { "( " + lineItem?.DIS_PERCENT + "%" +" )"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>{(
                                                ((lineItem?.RATE - lineItem?.DIS_RATE) * Number(orderQuantities[`${index}-${lineIndex}`] || 0) ) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                ((lineItem?.RATE - lineItem?.DIS_RATE) * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)}</td>
                                        {/* <td style={{ textAlign: "left" }}>{materialData?.VE NDOR_NAME}</td> */}
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.FREIGHT_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                (lineItem?.FREIGHT_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)}</td>
                                        <td style={{ textAlign: "right" }}>{
                                            (
                                                (lineItem?.PACKING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                (lineItem?.PACKING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3) 
                                        }</td>
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.LOADING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                (lineItem?.LOADING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)}</td>
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.LOADING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                (lineItem?.UNLOADING_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)}</td>
                                        <td style={{ textAlign: "right" }}>{(
                                                (lineItem?.OTHER_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0)) * (Number(lineItem?.SGST + lineItem?.CGST + lineItem?.IGST+ lineItem?.UGST )/100) + 
                                                (lineItem?.OTHER_RATE * Number(orderQuantities[`${index}-${lineIndex}`] || 0))
                                            ).toFixed(3)}</td>
                                        <td style={{ textAlign: "right" }}>{(lineItem?.INELIGIBLE_RATE*Number(orderQuantities[`${index}-${lineIndex}`]).toFixed(3) || 0)}{ "( " + lineItem?.INELI_PERCENT + "%" +" )"}</td>
                                        <td style={{ textAlign: "right" }}>{lineItem?.TAXCODE}</td>
                                        {/* <td>{lineItem?.LGORT}</td> */}
                                       
                                        {((UserDetails.GATE_ID == 19 || UserDetails.GATE_ID == 17) && (poData[0]?.moduleTypeId ==21 ||poData[0]?.moduleTypeId ==33 || poData[0]?.moduleTypeId ==12))&&
                                        <td>
                                            <Input
                                                type="date"
                                                max={new Date().toISOString().split("T")[0]} //
                                                value={receivedDates[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleDateChange(index, lineIndex, e.target.value)}
                                            />
                                        </td>}
                                       
                                        {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId == 21 ||poData[0]?.moduleTypeId ==33))&&
                                        <td>
                                            <Input
                                                type="text"
                                                placeholder="LLR No"
                                                value={llrno[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleLRChange(index, lineIndex, e.target.value)}
                                                maxLength={50}
                                            />
                                        </td>}
                                        {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId == 21 ||poData[0]?.moduleTypeId ==33))&&
                                        <td>
                                            <Input
                                                type="text"
                                                placeholder="Weighment No"
                                                value={weighmentNo[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleWeighmentChange(index, lineIndex, e.target.value)}
                                                maxLength={50}
                                            />
                                        </td>}
                                        {(UserDetails.GATE_ID == 19 && (poData[0]?.moduleTypeId == 21 ||poData[0]?.moduleTypeId ==33))&&
                                        <td>
                                            <Input
                                                type="text"
                                                placeholder="Manual Record"
                                                value={manualRecord[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleManualRecord(index, lineIndex, e.target.value)}
                                                maxLength={50}
                                            />
                                        </td>}
                                        {(poData[0]?.batchCode == 1 )&&
                                        <td>
                                            <Input
                                                type="text"
                                                placeholder="Batch Code"
                                                value={batchCode[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleBatchCode(index, lineIndex, e.target.value)}
                                                maxLength={50}
                                            />
                                        </td>}
                                       
                                        <td>
                                            <Input
                                                type="date"
                                                max={new Date().toISOString().split("T")[0]} //
                                                value={expiresDate[`${index}-${lineIndex}`] || ""}
                                                onChange={(e) => handleExpireDateChange(index, lineIndex, e.target.value)}
                                            />
                                        </td>    
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
                </CardBody>
                </Card>
                <ModalBody>
               <Row>
               <hr></hr>
               <Col md="12" sm="12">
                    <div className="text-primary receipt-section-title"><u>Cost details</u></div>
                <div style={{ 
                    marginTop: "10px",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    background: "#f8f9fa",
                    width: "100%",
                    maxWidth: "420px",
                    fontSize: "0.8rem"
                    }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}>
                        <tbody>
                        {data1.map((item, index) => (
                            <tr key={index} style={{
                            borderBottom: index < data1.length - 1 ? "1px solid #eee" : "none"
                            }}>
                            <td style={{
                                padding: "5px 0",
                                fontWeight: item.isTotal ? "bold" : "normal"
                            }}>
                                {item.label}
                            </td>
                            <td style={{
                                padding: "5px 0",
                                textAlign: "right",
                                fontWeight: item.isTotal ? "bold" : "normal"
                            }}>
                                ₹{item.value.toFixed(2)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </Col>           
               {weighmentData.length > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <div className="text-primary receipt-section-title"><u>Weighment info (kg)</u></div>
                                </Col>

                                {poData[0].moduleTypeId == 12 || poData[0].moduleTypeId == 15 || poData[0].moduleTypeId == 21 || poData[0].moduleTypeId == 25 || poData[0].moduleTypeId == 29 || poData[0].moduleTypeId == 33 || poData[0].moduleTypeId == 34 || poData[0].moduleTypeId == 1 || poData[0].moduleTypeId == 2  || poData[0].moduleTypeId == 38 ?
                                    <>
                                        <Col md="12" sm="12">
                                            <table className="table table-bordered table-sm table-compact">
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
                                                    <Input type="text" placeholder="Delivery Weight" value={(totalDeliveryQty).toFixed(3)} disabled />
                                                </FormGroup>
                                            </Col> : null
                                        }

                                        {totalDeliveryQty ?
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>{data.moduleTypeId == 1 ? "Diff WB(Shipment Weight & Net weight)" : "Diff(Delivery Weight & Net weight)"}</Label>
                                                    <Input type="text" placeholder="Total Weight" value={(differentWeight).toFixed(3)} disabled />
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
                    <Col md="6" sm="6">
                    <FormGroup className="d-flex justify-content-start mb-0">
                        <Button.Ripple color="danger" className="mt-2" onClick={removeSelectedLines}>
                             Remove Lines
                        </Button.Ripple>
                    </FormGroup>
                    </Col>
                        <Col md="6" sm="6" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => AddDatasPO()} >Submit</Button.Ripple>
                        </FormGroup>
                        </Col>
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
                                <img src={encodeURI(openImage)} alt="invoice Copy" style={{ width: "100%", maxWidth: "600px" }} />
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

export default RecieptEntryScreenDetails;
