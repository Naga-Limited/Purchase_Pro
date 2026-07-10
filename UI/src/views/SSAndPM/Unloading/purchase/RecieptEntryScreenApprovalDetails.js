import React, { useState } from "react";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, } from "reactstrap";
import { useEffect } from "react";
import { Edit, Paperclip, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "react-bootstrap";
import Uploader from "../../../Uploader";
import { HrLine } from "../../../common/HrLine";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ShowToast } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import POCopyModal from "../../../POCopyModal";

const RecieptEntryScreenApprovalDetails = ({ setShow, show, purchaseId,poNumbers,status }) => {

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
        console.log(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsers/${purchaseId}/${UserDetails.USERID}/${status}`);
        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPurchaseInfoByUsers/${purchaseId}/${UserDetails.USERID}/${status}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
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
    const update = (status,type) => {
        let postData = {
            MaterialDetails: materialInfo,
            vaNumber:poData[0]?.vaNumber,
            vehicleNo:poData[0]?.vehicleNo,
            purchaseId:purchaseId,
            status:status,
            userId: UserDetails.USERID,
            gateId:poData[0].gateId,
            isReceipt:poData[0].isReceipt,
            po_type:poData[0].po_type,
            type:type,
            invoiceCopy:poData[0].invoiceCopy ? poData[0].invoiceCopy :  poData[0].invoiceCopys
        };
        showLoader();
        console.log(apiBaseUrl + "MigoAutomationController/ReceiptDetailsUpdate",postData);
        apiPostMethod(apiBaseUrl + "MigoAutomationController/ReceiptDetailsUpdate",postData)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    confirmDialog({
                        title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    }).then(() => {
                        window.location.reload();  // Reloads the page after the confirm dialog is closed
                    });
                } else if (data.success == false) {
                    // confirmDialog({
                    //     title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `danger`
                    // }).then(() => {
                       
                    // });
                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
                    }).then(() => {
                        });
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
    const Save = () => {
        let hasInvalidEntries = false; // Flag to check if any invalid entry exists
        const poSelectionMap = {}; // Track if a PO has any valid selection
        const missingPOs = []; // Collect missing PO numbers
         // 🔴 Create a mapping of PO number to purchaseId for quick lookup
        const poIdMap = poData.reduce((acc, item) => {
            acc[item.poNumber] = item.id; // Map PO number to purchaseId
            return acc;
        }, {});

        let submittedData = materialInfo?.map((fgData, poIndex) => {
            let poHasSelection = false; // Track if this PO has at least one valid material
    
            let materials = fgData?.PO_ITEM.map((materialDetails, lineIndex) => {
                const ReceivedQty = Number(orderQuantities[`${poIndex}-${lineIndex}`] || 0);
                const openQty = (Number(materialDetails?.PO_QTY || 0) - Number(materialDetails?.MIGO_QTY || 0)).toFixed(3);
                const remainQty = (Number(materialDetails?.PO_QTY || 0) - Number(materialDetails?.MIGO_QTY || 0) - ReceivedQty).toFixed(3);
    
                // 🚨 Validate remainQty (avoid negative received quantity)
                if (remainQty < 0) {
                    errorToast(`Error: Please Check Received Qty for The Material - ${materialDetails?.MATERIAL_NAME}`);
                    hasInvalidEntries = true;
                    return null;
                }
    
                if (ReceivedQty > 0) {
                    poHasSelection = true; // Mark PO as valid
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
                    invoiceDate: poData[0]?.invoiceDate,
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
                    storageLocation: materialDetails?.LGORT || "",
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
                    tolerance: materialDetails?.TOLARANCE || 0,
                    rcm: materialDetails?.RCM || 0,
                    userId: UserDetails.USERID
                } : null;
            }).filter(Boolean);
    
            // 🔹 Track missing POs
            if (!poHasSelection) {
                missingPOs.push(fgData?.PO_NUM);
            }
    
            return materials.length > 0 ? { materials } : null;
        }).filter(Boolean);
    
        // 🚨 Show error for missing POs
        if (missingPOs.length > 0) {
            errorToast(`Error: Please select at least one material for PO(s): ${missingPOs.join(", ")}`);
            return; // Stop execution if any PO is missing a selection
        }
        if (hasInvalidEntries) {
            return; // Prevent API call
        }

        let postData = {
            MaterialDetails: submittedData.length > 0 ? submittedData : [],
            vaNumber:poData[0]?.vaNumber,
            vehicleNo:poData[0]?.vehicleNo,
            purchaseId:purchaseId,
        };
        

       // 🚨 Final Check: Show error for each missing PO individually

        showLoader();
        apiPostMethod(apiBaseUrl + "MigoAutomationController/ReceiptDetailsPost", postData)
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
            }).finally((a) => {
                hideLoader();
            });
    }
    const print1 = (copy) => {
        window.open(copy)
    }
    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };
    const togglePOModal = () => setPoModalOpen(!poModalOpen);

        // Helper: safe parse number
        // helper to safely parse number-like values
        const toNum = (v) => {
            if (v === null || v === undefined || v === "") return 0;
            const n = Number(String(v).replace(/,/g, ""));
            return Number.isFinite(n) ? n : 0;
        };
        
        // initialize totals object (same keys you expect)
        const totals = {
            totalMaterialAmount: 0,
            totalDiscount: 0,
            totalTaxableAmount: 0,
            totalTaxAmount: 0,
            totalRCMReversal: 0,
            totalIneligibleTax: 0,
            totalFreight: 0,
            totalPacking: 0,
            totalLoading: 0,
            totalUnloading: 0,
            totalOtherCharges: 0,
            totalCess: 0,
            totalJitc: 0,
            totalAmountBeforeRCM: 0,
            netPayable: 0,
            rcmValue:0,
            totalFreightTax:0,
            totalPackingTax:0,
        };
        
        // iterate materialInfo and accumulate into totals
        (materialInfo || []).forEach((row) => {
            const receivedQty = toNum(row.receivedQty);
            const rate = toNum(row.materialCost);
        
            // Discount: prefer explicit discountAmount, else percentage
            let discountAmt = 0;
            if (row.discountAmount != null && row.discountAmount !== "") {
            discountAmt = toNum(row.discountAmount);
            } else if (row.discountPercentage != null && row.discountPercentage !== "") {
            discountAmt = (toNum(row.discountPercentage) / 100) * (rate * receivedQty);
            }
        
            const materialAmount = rate * receivedQty;
            const taxableAmount = materialAmount - discountAmt;
        
            // Tax calculation
            const taxPerc = toNum(row.taxPercentage) / 100;
            const taxAmount = taxableAmount * taxPerc;
        
            // Ineligible tax
            const ineligible = toNum(row.materialIneligible || row.ineligibleCost);
        
            // Charges
            const freightIncl = toNum(row.materialFreight);   // total with tax
            const packingIncl = toNum(row.materialPacking);
            const freight     = taxPerc > 0 ? freightIncl / (1 + taxPerc) : freightIncl;
            const freightTax  = freightIncl - freight;
            const packing     = taxPerc > 0 ? packingIncl / (1 + taxPerc) : packingIncl;
            const packingTax  = packingIncl - packing;
            const loading = toNum(row.materialLoading ?? row.materialLoading);
            const unloading = toNum(row.materialUnloading ?? row.materialUnloading);
            const other = toNum(row.materialOther ?? row.materialOther);
            const rcmValue = toNum(row.rcmValue ?? row.rcmValue);
            
            // CESS & JITC (percentage or absolute)
            const cessField = toNum(row.cess);
            const jitcField = toNum(row.jitc);
            const cessValue = cessField > 0 && cessField <= 100 ? taxableAmount * (cessField / 100) : cessField;
            const jitcValue = jitcField > 0 && jitcField <= 100 ? taxableAmount * (jitcField / 100) : jitcField;
        
            // accumulate
            totals.totalMaterialAmount += materialAmount;
            totals.totalDiscount += discountAmt;
            totals.totalTaxableAmount += taxableAmount;
            totals.totalTaxAmount += taxAmount;
            totals.totalIneligibleTax += ineligible;
            totals.totalFreight += freight;
            totals.totalPacking += packing;
            totals.totalLoading += loading;
            totals.totalUnloading += unloading;
            totals.totalOtherCharges += other;
            totals.totalCess += cessValue;
            totals.totalJitc += jitcValue;
            totals.rcmValue += rcmValue;
            totals.totalPackingTax +=packingTax;
            totals.totalFreightTax +=freightTax;
            const lineTotalBeforeRCM =
            taxableAmount +
            taxAmount +
            freight +
            packing +
            loading +
            unloading +
            other +
            ineligible +
            cessValue +
            jitcValue +
            freightTax +
            packingTax;
        
            totals.totalAmountBeforeRCM += lineTotalBeforeRCM - rcmValue;
        
          
            totals.totalRCMReversal += taxAmount;

        });
        
        // compute netPayable and round
        totals.netPayable = totals.totalAmountBeforeRCM;
        
        // round values to 2 decimals
        Object.keys(totals).forEach((k) => {
            if (typeof totals[k] === "number") {
            totals[k] = Math.round((totals[k] + Number.EPSILON) * 100) / 100;
            }
        });
        
        // now destructure from totals and build data1
        const {
            totalMaterialAmount,
            totalDiscount,
            totalTaxableAmount,
            totalTaxAmount,
            totalRCMReversal,
            totalIneligibleTax,
            totalFreight,
            totalPacking,
            totalLoading,
            totalUnloading,
            totalOtherCharges,
            totalCess,
            totalJitc,
            totalAmountBeforeRCM,
            netPayable,
            rcmValue,
            totalFreightTax,
            totalPackingTax
        } = totals;
        
        const data1 = [
            { label: "Gross Material Amount", value: totalMaterialAmount },
            { label: "Less: Total Discount", value: -totalDiscount, isNegative: true },
            { label: "Taxable Amount", value: totalTaxableAmount, isHighlight: true },
        
            { label: "Freight Charges", value: totalFreight, isCharge: true },
            { label: "Loading Charges", value: totalLoading, isCharge: true },
            { label: "Unloading Charges", value: totalUnloading, isCharge: true },
            { label: "Packing Charges", value: totalPacking, isCharge: true },
            { label: "Other Charges", value: totalOtherCharges, isCharge: true },
        
            { label: "Add: Total Tax", value: totalTaxAmount+totalFreightTax+totalPackingTax},
            { label: "RCM Reversal", value: rcmValue ? -rcmValue : 0 },
            { label: "Add: Ineligible Tax", value: totalIneligibleTax },
            { label: "CESS Value", value: totalCess },
            { label: "JITC Value", value: totalJitc },
        
            { label: "Total Amount Payable", value: netPayable, isTotal: true },
        ];
  
    return (
        <div>
            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Receipt Entry  Details</h4>
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
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>PO Details</u></h4><br />
                        </Col>
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
                             <Paperclip size={14} />
                             Invoice copy
                           </Button.Ripple>
                           </div>} */}
                           {materialInfo[0]?.bargainNote &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.bargainNote)}
                             >
                             <Paperclip size={14} />
                             Bargain Note
                           </Button.Ripple>
                           </div>} 
                           {materialInfo[0]?.deliveryChallanCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.deliveryChallanCopy)}
                             >
                             <Paperclip size={14} />
                             Delivery Challan
                           </Button.Ripple>
                           </div>} 
                           {materialInfo[0]?.ewayBillCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.ewayBillCopy)}
                             >
                             <Paperclip size={14} />
                             Eway Bill
                           </Button.Ripple>
                           </div>} 
                           {materialInfo[0]?.eInvoiceCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.eInvoiceCopy)}
                             >
                             <Paperclip size={14} />
                             E-Invoice
                           </Button.Ripple>
                           </div>} 
                          
                           {materialInfo[0]?.qcCertificateInternalCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.qcCertificateInternalCopy)}
                             >
                             <Paperclip size={14} />
                             Internal QC
                           </Button.Ripple>
                           </div>} 
                           {materialInfo[0]?.qcCertificateExternalCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.qcCertificateExternalCopy)}
                             >
                             <Paperclip size={14} />
                             External QC
                           </Button.Ripple>
                           </div>} 
                           {materialInfo[0]?.externalWbCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.externalWbCopy)}
                             >
                             <Paperclip size={14} />
                             Outside WB
                           </Button.Ripple>
                           </div>}
                           {materialInfo[0]?.vendorEmailCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.vendorEmailCopy)}
                             >
                             <Paperclip size={14} />
                             Vendor Mail
                           </Button.Ripple>
                           </div>}
                           {materialInfo[0]?.projectTeamAcknowledgement &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.projectTeamAcknowledgement)}
                             >
                             <Paperclip size={14} />
                             Project Acknowledgment
                           </Button.Ripple>
                           </div>}
                           {materialInfo[0]?.creditNoteCopy &&
                            <div className="mr-1">
                             <Button.Ripple
                             outline 
                             color="primary"
                             onClick={() => print1(materialInfo[0]?.creditNoteCopy)}
                             >
                             <Paperclip size={14} />
                             Credit Note
                           </Button.Ripple>
                           </div>}     
                           </FormGroup>  
                        </Col>
                        <label></label>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="table table-bordered" 
                                    style={{ width: '100%', minWidth: '2000px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                                <thead>
                                <tr>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>PO NO</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>PO Type</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Plant</th>
                                    <th className="bg-primary text-white" style={{ width: '30%' }}>Vendor Name</th> {/* Increased width */}
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Inv No</th>
                                    <th className="bg-primary text-white" style={{ width: '10%' }}>Inv Date</th>
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
                                    <td>{poDetailsData?.msme}</td>
                                    <td>
                                        <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(poDetailsData.invoiceCopy ? poDetailsData.invoiceCopy :  poDetailsData.invoiceCopys)}>View</Button.Ripple>
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
                <Card>
                <CardBody>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Material Details</u></h4><br />
                        </Col>
                        <label></label>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table className="table table-bordered" 
                               style={{ width: '100%', minWidth: '3500px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                            <thead >
                                <tr>
                                    <th className="bg-primary text-white" width='20%'>PO NO</th>
                                    <th className="bg-primary text-white" width='10%'>Line</th>
                                    <th className="bg-primary text-white" width='20%'>Material</th>
                                    <th className="bg-primary text-white" width='30%'>Material Desc</th>
                                    <th className="bg-primary text-white" width='15%'>Storage</th>
                                    <th className="bg-primary text-white" width='15%'>Lot No</th>
                                    <th className="bg-primary text-white" width='15%'>PO Qty</th>
                                    <th className="bg-primary text-white" width='17%'>Completed Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Open Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Tolerance Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Received Qty</th>
                                    <th className="bg-primary text-white" width='15%'>Remain Qty</th>
                                    <th className="bg-primary text-white" width='12%'>UOM</th>
                                    <th className="bg-primary text-white" width='15%'>Material Rate</th>
                                    <th className="bg-primary text-white" width='15%'>Material Amount</th>
                                    <th className="bg-primary text-white" width='15%'>TAX</th>
                                    <th className="bg-primary text-white" width='15%'>Discount</th>
                                    <th className="bg-primary text-white" width='15%'>Grass Price</th>
                                    <th className="bg-primary text-white" width='15%'>Freight Charges</th>
                                    <th className="bg-primary text-white" width='15%'>Packing Forwarding</th>
                                    <th className="bg-primary text-white" width='15%'>Loading Charge</th>
                                    <th className="bg-primary text-white" width='15%'>Unloading Charge</th>
                                    <th className="bg-primary text-white" width='15%'>Material Others</th>
                                    <th className="bg-primary text-white" width='15%'>Ineligible Tax</th>
                                    <th className="bg-primary text-white" width='15%'>RCM Value</th>
                                    <th className="bg-primary text-white" width='15%'>HSN & SAC Code</th>

                                </tr>
                            </thead>
                           {materialInfo?.map((materialData,index) => (
                                <tbody key={index}>
                                <tr key={`${index}`}>
                                        <td>{materialData?.poNumber}</td>
                                        <td>{materialData?.lineItem}</td>
                                        <td>{materialData?.material}</td>
                                        <td>{materialData?.materialDescription}</td>
                                        <td>{materialData?.storageLocation}</td>
                                        <td>{materialData?.lotNo}</td>
                                        <td>{materialData?.poQty}</td>
                                        <td >{materialData?.grnQty}</td>
                                        <td>{materialData?.openQty}</td>
                                        <td>{materialData?.tolerance}</td>
                                        <td>{materialData?.receivedQty}</td>
                                        <td>{(materialData?.remainQty-materialData?.tolerance).toFixed(2)}</td>
                                        <td>{materialData?.uom}</td>
                                        <td>{materialData?.materialCost}</td>
                                        <td>{materialData?.materialRate}</td>
                                        <td>{materialData?.materialTax}</td>
                                        <td>{materialData?.discountAmount}</td>
                                        <td>{materialData?.materialAmount}</td>
                                        <td>{materialData?.materialFreight}</td>
                                        <td>{materialData?.materialPacking}</td>
                                        <td >{materialData?.materialLoading}</td>
                                        <td >{materialData?.materialUnloading}</td>
                                        <td >{materialData?.materialOther}</td>
                                        <td >{materialData?.materialIneligible}</td>
                                        <td >{materialData?.rcmValue}</td>
                                        <td >{materialData?.hsn}</td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                        </div>
                </CardBody>
                </Card>
                <ModalBody>
               
                    <Row>
                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>Cost Details</u></h4><br />
                        <div style={{
                            marginTop: "20px",
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            background: "#f8f9fa",
                            width: "100%",
                            maxWidth: "500px"
                        }}>
                            <table style={{
                            width: "100%",
                            borderCollapse: "collapse"
                            }}>
                            <tbody>
                                {data1.map((item, index) => {
                                const value = Number(item.value) || 0;
                                const formattedValue = value.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });

                                return (
                                    <tr
                                    key={index}
                                    style={{
                                        borderBottom: index < data1.length - 1 ? "1px solid #eee" : "none",
                                        backgroundColor: item.isHighlight ? "#e8f5e9" : "transparent"
                                    }}
                                    >
                                    <td
                                        style={{
                                        padding: "10px 0",
                                        fontWeight: item.isTotal ? "bold" : "normal",
                                        color: item.isNegative ? "red" : item.isCharge ? "#007bff" : "inherit"
                                        }}
                                    >
                                        {item.label}
                                    </td>
                                    <td
                                        style={{
                                        padding: "10px 0",
                                        textAlign: "right",
                                        fontWeight: item.isTotal ? "bold" : "normal",
                                        color: item.isNegative ? "red" : "inherit"
                                        }}
                                    >
                                        ₹{formattedValue}
                                    </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                            </table>
                        </div>
                        </Col>
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
                            {(status === 1 || status === 2 || status === 3 ) && (
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple
                                    color="danger"
                                    type="button"
                                    onClick={() => update(status == 1 ? 0 : status == 2 ? 5 : status == 3 ? 2 : '','Reject')}
                                    >
                                    Reject
                                </Button.Ripple>
                            </FormGroup>
                            )}
                        </Col>

                        <Col md="6" sm="6">
                        {(status === 1) && (
                            <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={() =>
                                update(status === 1 ? 2 : status === 2 ? 3 : status === 3 ? 4 : 0,'Approve')
                                }
                            >
                                Submit
                            </Button.Ripple>
                            </FormGroup>
                            )}
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

export default RecieptEntryScreenApprovalDetails;
