import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { DatePicker } from "../../../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../../../forms/custom-form";
import moment from "moment";
import { ArrowDown, Check, Plus, X } from "react-feather";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { ElapsedTimer } from "../../../common/ElapsedTimer";
import Select from "react-select";
import { useEffect } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { getAllowedPastDate, minDate } from "../../../common/dateComponent";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import Uploader from "../../../Uploader";
import POCopyModal from "../../../POCopyModal";

export const taColumns = [
  {
    name: "TRUCK NO",
    selector: "vehicleNo",
    sortable: true,
    minWidth: "50px",
  },
  {
    name: "VA Number",
    selector: "vaNumber",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "PLANT NAME",
    selector: "plantName",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "PO Number",
    selector: "poNumber",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Gate In Date",
    selector: "gateInDate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Gate Out Date",
    selector: "gateOutDate",
    sortable: true,
    minWidth: "150px",
  },
];


const MultipleGateInSapDocument = ({ actionRendorer }) => {

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [gateInOutModal, setGateInOutModal] = useState(false);

  const actionsCol = {
    name: "ACTIONS",
    selector: "status",
    minWidth: "150px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Row>&nbsp;&nbsp;
          <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => overAllDetails(row)}>View</Button.Ripple>
        </Row>
      );
    },
  };

  // const vendor = {
  //   name: "VENDOR NAME",
  //   selector: "vendorName",
  //   minWidth: "150px",
  //   cell: (row) => {
  //     return <>
  //       <span className="fs-6">{vendorName}</span>
  //     </>
  //   },
  // };

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      vendorInvoiceNo: validation.required({ message: "Please Enter Invoice No", isObject: false }),
      invoiceDate: validation.required({ message: "Please Enter Invoice Date", isObject: false })
    }),
    onSubmit() { },
  });


  const [gateInOutDetails, setGateInOutDetails] = useState([])
  const [poData, setPoData] = useState([])
  const [poData1, setPoData1] = useState([])

  const overAllDetails = (gateInOutData) => {
    setGateInOutModal(true)
    console.log(gateInOutData)
    setGateInOutDetails(gateInOutData)
    getPurchaseOrder(gateInOutData.loadingUnloadingInfoId)
  };

  const getPurchaseOrder = (loadingUnloadingInfoId) => {
    console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setPoData(data.results)
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

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [vendorData, setVendorData] = useState([])
  const [fromDate, setFromDate] = useState([])
  const [toDate, setToDate] = useState([])

  const getVendorDetails = (fromDateMilliSecond, toDateMilliSecond) => {
    console.log(apiBaseUrl + `GatePro/Master/getVendorDetails/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.USERID}`)
    apiPostMethod(apiBaseUrl + `GatePro/Master/getVendorDetails/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setVendorData(data.results);
          setFromDate(fromDateMilliSecond)
          setToDate(toDateMilliSecond)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [selectedValue, setSelectedValue] = useState([])
  const [vendorName, setVendorName] = useState('')
  const [ebelpOptions, setEbelpOptions] = useState(null);

  const selectVendorName = (e) => {
    let vendorName = e.value
    setSelectedValue(e)
    setVendorName(vendorName)
  }
  const Add = () => {
    getGateInInfo()
  };

  const getGateInInfo = () => {
    if (!landingData || landingData.length === 0) {
      errorToast("Landing data is missing.");
      return;
    }
  
    // ✅ Filter landingData by SelectedList
    const filteredData = landingData.filter(item =>
      SelectedList.includes(item.gateInOutInfoId.toString())
    );

    if (filteredData.length === 0) {
      errorToast("No matching records found for the selected items.");
      return;
    }

    // Collect only filtered purchaseId and poNumber
    const purchaseIds = filteredData.map(item => item.purchaseId).join(",");
    const poNumbers   = [...new Set(filteredData.map(item => item.poNumber))].join(",");
    const userId      = UserDetails?.USERID;

    console.log("Filtered PurchaseIds:", purchaseIds);
    console.log("Filtered PONumbers:", poNumbers);
    
    // API URL with combined values
    const url = `${apiBaseUrl}MigoAutomationController/getPurchaseInfo/${purchaseIds}/${userId}/${poNumbers}`;
    console.log("Calling API:", url);
  
    apiPostMethod(url)
      .then((response) => {
        const { data } = response;
  
        if (data.message1) {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message1}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: `#BD362F`,
          });
        } else if (data.success === true) {
          setMaterialInfo(data.materialDetails);
          setPoData1(data.results);
  
          if (Array.isArray(data.materialDetails[0]?.PO_ITEM)) {
            const ebelpList = data.materialDetails[0].PO_ITEM.map((item) => ({
              label: item.EBELP.toString(),
              value: item.EBELP.toString(),
            }));
            setEbelpOptions(ebelpList);
            form.setFieldValue("EBELP", ebelpList[0]?.value);
          }
  
          setShow(true);
        } else {
          errorToast(data.message || "Failed to fetch purchase info");
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  

  const [landingData, setLandingData] = useState([])
  const [materialInfo, setMaterialInfo] = useState([])

  const getRmWaterDetails = () => {

    showLoader();
    console.log(apiBaseUrl + `GatePro/Gate/getMultipleGateInPurchaseDetails/${fromDate}/${toDate}/${vendorName}/${UserDetails.USERID}`)
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getMultipleGateInPurchaseDetails/${fromDate}/${toDate}/${vendorName}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setLandingData(data.results);
        }
        else if (data.success == false) {
          errorToast(data.message);
          setLandingData("")
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

  const [SelectedList, setSelectedList] = useState([]);
  const [totalNetWeight, setTotalNetWeight] = useState('');
  const [selectedRowCount, setSelectedRowCount] = useState('');
  const [gateInOutInfoId, setGateInOutInfoId] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [selectedLineItem, setSelectedLineItem] = useState(false);

  const [invoicePostingDate, setInvoicePostingDate] = useState('');

  const onSelectedRowsChange = (selectedRowState) => {

    setSelectedData(selectedRowState.selectedRows[0]);
    setInvoicePostingDate(selectedRowState.selectedCount > 0 ? selectedRowState.selectedRows[0].invoice_posting_date : "")

    const totalNetWeight = selectedRowState.selectedRows.reduce((total, currentValue) => total = total + Number(currentValue.netWeight), 0);
    setTotalNetWeight(totalNetWeight)
    setSelectedRowCount(selectedRowState.selectedCount)

    for (let i = 0; i <= selectedRowState.selectedRows.length; i++) {
      let addRmWaterDetails = [];
      let updateGateInOutInfoId = []

      let filteredData = selectedRowState.selectedRows
      if (filteredData) {
        for (let i = 0; i < filteredData.length; i++) {
          if (filteredData) {
            const obj = filteredData[i].gateInOutInfoId
            addRmWaterDetails.push(obj);
            setSelectedList(addRmWaterDetails)
            console.log(addRmWaterDetails)
            const obj1 = {
              gateInOutInfoId: filteredData[i].gateInOutInfoId
            }
            updateGateInOutInfoId.push(obj1);
            setGateInOutInfoId(updateGateInOutInfoId)
          }
        }
      }
    }
  }

  const columns = [...taColumns, actionsCol];
  const currentDate = new Date().toISOString().split("T")[0];
  const updateRmWaterDetails = () => {
    
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    const formData = form.values

    const postdata = {
      gateInOutInfoId: SelectedList,
      totalRowCount: selectedRowCount,
      vendorName: vendorName,
      totalNetWeight: totalNetWeight,
      vendorInvoiceNo: formData.vendorInvoiceNo,
      invoiceDate: formData.invoiceDate,
      moduleStatusId: 5,
      remarks: formData.remarks,
      loadingUnloadingInfoId: selectedData.loadingUnloadingInfoId,
      vehicleNo: selectedData.vehicleNo,
      vaNumber: selectedData.vaNumber,
      userInfoId: UserDetails.USERID,
      rmWaterDetails: gateInOutInfoId
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Master/addRmWaterDetails", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Master/addRmWaterDetails", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
          form.resetForm()
          setShow(false)
          setLandingData('')
          getRmWaterDetails()
          setSelectedValue('')
        }
        else if (res.success == false) {
          errorToast(res.message)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  useEffect(() => {
    const formData = form.values
    const fromDate = new Date(moment(formData.date ? formData.date.start : "").format('YYYY-MM-DD'));
    const toDate = new Date(moment(formData.date ? formData.date.end : "").format('YYYY-MM-DD'));

    const fromDateMilliSecond = fromDate.getTime()
    const toDateMilliSecond = toDate.getTime()

    if (formData.date) {
      getVendorDetails(fromDateMilliSecond, toDateMilliSecond)
    }
  }, [form.values.date])
  const [receivedQty1, setReceivedQty1] = useState('');
  const gateIn = async () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
  
   

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
   

   
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
        Save('',invoiceCopyMap);
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
  };
  const Save = (ExtraAttachments,invoiceCopy) => {

    const filteredData = landingData.filter(item =>
      SelectedList.includes(item.gateInOutInfoId.toString())
    );


    // Collect only filtered purchaseId and poNumber
    const purchaseIdsArray = filteredData.map(item => item.purchaseId);

    let postData = {
      vaNumber: poData1[0]?.vaNumber,
      vehicleNo: poData1[0]?.vehicleNo,
      purchaseId: purchaseIdsArray,
      msme: materialInfo[0]?.MSME,
      invoiceCopy: invoiceCopy,
      gateInDateStamp: poData1[0]?.gateInDateStamp,
      // gateOutDateStamp: poData1[0]?.gateOutDateStamp,
      gateInOutInfoIds: SelectedList,
      purchaseOrderDetailsList:filteredData,
      masterPlantId:materialInfo[0]?.PO_ITEM[0]?.WERKS,
      invoiceNo: form.values.vendorInvoiceNo,
      invoiceDate: form.values.invoiceDate,
      vendorCode: poData1[0]?.vendorCode,
  };
  showLoader();
  apiPostMethod(apiBaseUrl + "MigoAutomationController/updateGateInPODetails", postData)
      .then((response) => {
          const { data } = response;
          if (data.success == true) {
              confirmDialog({
                  title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`,
                  cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
              }).then(() => {
                  window.location.reload();
              });
          } else {
              confirmDialog({
                  title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`,
                  cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
              }).then(() => {
                  setShow(true);
              });
          }
      })
      .catch((error) => {
          console.log(JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
      }).finally(() => {
          hideLoader();
      });
  }
  const Save1 = (ExtraAttachments,invoiceCopy) => {
  
    
    const poIdMap = poData.reduce((acc, item) => {
        acc[item.poNumber] = item.id;
        return acc;
    }, {});
    
    let material = [];  // ✅ Declare array here
    const materialDetails = selectedLineItem;
    const ReceivedQty = receivedQty1 || totalNetWeight;
    const poQty = materialDetails?.PO_QTY || 0;
    const toleranceQty = materialDetails?.TOLERANCE_QTY || 0;
    const migoQty = materialDetails?.MIGO_QTY || 0;
    const receivedQty = receivedQty1 || totalNetWeight;
    
    const ManufacturingDate = '';
    const InvoiceQty = ReceivedQty || 0;
    const storageSelection = '';
    const LLRNO ='';
    const WeighmentNo ='';
    const ManualRecord ='';
    const BatchCode ='';
    const ExpireDate ='';
    
    const openQty = (poQty - migoQty).toFixed(3);
    const remainQty = (poQty + toleranceQty - migoQty - receivedQty).toFixed(3);
    
    const taxPercentage = Number(
        materialDetails?.SGST + materialDetails?.CGST + materialDetails?.IGST + materialDetails?.UGST +
        materialDetails?.RSGST + materialDetails?.RCGST + materialDetails?.RIGST + materialDetails?.CESS + materialDetails?.JITC
    );
    
    const calculateAmount = (rate, qty) => ((rate * qty) * taxPercentage / 100 + (rate * qty)).toFixed(3);
    const calculateSimple = (rate, qty) => (rate * qty).toFixed(3);
    
    const materialObj = {
        poNumber: materialDetails?.PO_NUM,
        vendorCode: materialDetails?.VENDOR_CODE,
        vendorName: materialDetails?.VENDOR_NAME,
        poType: materialDetails?.PO_TYPE,
        purchaseGroup: materialDetails?.PURCHASE_GRP,
        purchaseOrg: materialDetails?.PURCHASE_ORG,
        companyCode: materialDetails?.COMPANY_CODE,
        invoiceNo: form.values.vendorInvoiceNo,
        invoiceDate: formatDate(form.values.invoiceDate),
        material: materialDetails?.MATNR || "",
        materialDescription: materialDetails?.MATERIAL_NAME || "",
        receivedQty: ReceivedQty,
        openQty: openQty,
        remainQty: remainQty,
        gateInOutInfoId: poData1[0]?.gateInOutInfoId,
        purchaseIds: poData1[0]?.id,
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
        postingDate: currentDate,
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
        ManufacturingDate: ManufacturingDate,
        InvoiceQty: totalNetWeight,
        llrNo: LLRNO,
        weighmentNo: WeighmentNo,
        manualRecord: ManualRecord,
        materialRate: calculateSimple(materialDetails?.RATE, ReceivedQty),
        materialTax: ((materialDetails?.RATE * ReceivedQty) * taxPercentage / 100).toFixed(3),
        materialAmount: calculateAmount(materialDetails?.RATE - materialDetails?.DIS_RATE, ReceivedQty),
        materialFreight: calculateAmount(materialDetails?.FREIGHT_RATE, ReceivedQty),
        materialPacking: calculateAmount(materialDetails?.PACKING_RATE, ReceivedQty),
        materialLoading: calculateAmount(materialDetails?.LOADING_RATE, ReceivedQty),
        materialUnloading: calculateAmount(materialDetails?.UNLOADING_RATE, ReceivedQty),
        materialOther: calculateAmount(materialDetails?.OTHER_RATE, ReceivedQty),
        discount: calculateSimple(materialDetails?.DIS_RATE, ReceivedQty),
        discountPercentage: materialDetails?.DIS_PERCENT,
        materialIneligible: calculateSimple(materialDetails?.INELIGIBLE_RATE, ReceivedQty),
        invoiceMaterialAmount: calculateAmount(materialDetails?.RATE - materialDetails?.DIS_RATE, ReceivedQty),
        invoiceFreightAmount: calculateAmount(materialDetails?.FREIGHT_RATE, ReceivedQty),
        invoicePackingAmount: calculateAmount(materialDetails?.PACKING_RATE, ReceivedQty),
        invoiceLoadingAmount: calculateAmount(materialDetails?.LOADING_RATE, ReceivedQty),
        invoiceUnloadingAmount: calculateAmount(materialDetails?.UNLOADING_RATE, ReceivedQty),
        invoiceOtherAmount: calculateAmount(materialDetails?.OTHER_RATE, ReceivedQty),
        invoiceIneligibleAmount: calculateAmount(materialDetails?.INELIGIBLE_RATE, ReceivedQty),
        taxPercentage: taxPercentage,
        batchCode: BatchCode,
        expiryDate: ExpireDate,
    };
    
    // ✅ Simply push into materialInfo array
    material.push(materialObj);
    // let MaterialDetails = MaterialDetails [material]
    let MaterialDetails = [
      {
        materials: material,  // ⬅️ inside MaterialDetails, material is array          // You can add more properties if needed
      }
    ];
    let postData = {
        MaterialDetails: MaterialDetails,  // ✅ fully updated array
        vaNumber: poData1[0]?.vaNumber,
        vehicleNo: poData1[0]?.vehicleNo,
        isReceipt: poData1[0]?.isReceipt,
        po_type: poData1[0]?.po_type,
        purchaseId: poData1[0]?.id,
        msme: materialInfo[0]?.MSME,
        invoiceCopy: invoiceCopy,
        gateInDateStamp: poData1[0]?.gateInDateStamp,
        gateInOutInfoIds: SelectedList,
    };
    if(!selectedLineItem){
      errorToast('Please Select PO Line Item')
      return
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "MigoAutomationController/ReceiptDetailsPost", postData)
        .then((response) => {
            const { data } = response;
            if (data.success == true) {
                confirmDialog({
                    title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`,
                    cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                }).then(() => {
                    window.location.reload();
                });
            } else {
                confirmDialog({
                    title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`,
                    cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
                }).then(() => {
                    setShow(true);
                });
            }
        })
        .catch((error) => {
            console.log(JSON.stringify(error));
            errorToast("Something went wrong, please try again after sometime");
        }).finally(() => {
            hideLoader();
        });
}
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {}, sendingWBSlip: {} });
    const [ImgData, setImgData] = useState({});


    const handleFileChange = (file,id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
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
    
    const [selectedLines, setSelectedLines] = useState([]);

    const handleSelectLine = (key) => {
      setSelectedLines(prev =>
        prev.includes(key)
          ? prev.filter(k => k !== key)
          : [...prev, key]
      );
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
    const [remarks, setRemarks] = useState({});
    const handleRemarksChange = (i, j, value) => {
      setRemarks((prev) => ({ ...prev, [`${i}-${j}`]: value }));
    };

    const [storageSelections, setStorageSelections] = useState({});

    const handleMovementTypeChange = (selectedOption, index, lineIndex) => {
        const key = `${index}-${lineIndex}`;
        setStorageSelections((prev) => ({
          ...prev,
          [key]: selectedOption
        }));
    };

  return (
    <>
      <Card>
        <CardHeader><h5>Receipt Entry Screen</h5><RefreshBlock1 /></CardHeader>
        <hr />
        <CardBody>
          <Row>
            <Col md="4" sm="4">
              <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Vendor Name</Label>
                <Select
                  placeholder='Vendor Name'
                  value={selectedValue}
                  options={vendorData}
                  onChange={selectVendorName}
                />
              </FormGroup>
            </Col>
            <Col md="2" sm="2">
              <div>
                <label>&nbsp;</label>
                <FormGroup>
                  <Button.Ripple color="primary" type="submit" onClick={getRmWaterDetails}>
                    View <ArrowDown size={16} />
                  </Button.Ripple>
                </FormGroup>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {landingData != '' ?
        <Card>
          <CardHeader><h5>Receipt Entry List</h5></CardHeader>
          <hr />
          <CardBody>
            <TableComponent select
              showDownload
              onSelectedRowsChange={onSelectedRowsChange}
              columns={columns}
              data={landingData} />

            <Col md="12" sm="12">
              <FormGroup className="d-flex justify-content-center mb-0">
                <Button.Ripple color="primary" type="submit" onClick={() => Add()} disabled={!selectedRowCount}>
                  <Plus size={16} /> Add
                </Button.Ripple>
              </FormGroup>
            </Col>
          </CardBody>
        </Card> : null
      }

      <Modal show={show} centered size="xl">
        <Row>
          <Col md="12" sm="12">
            <FormGroup>
              <ModalHeader><h5>Invoice Details Add</h5><X onClick={() => setShow(false)} /></ModalHeader>
            </FormGroup>
          </Col>
        </Row>
        <ModalBody>
          <Row>
          <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="table table-bordered" 
                                    style={{ width: '100%', minWidth: '1000px', textAlign: 'left', tableLayout: 'fixed' }}> {/* Added table-layout: fixed */}
                                <thead>
                                <tr>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>Vehicle NO</th>
                                    <th className="bg-primary text-white" style={{ width: '15%' }}>PO NO</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>PO Type</th>
                                    <th className="bg-primary text-white" style={{ width: '20%' }}>Plant</th>
                                    <th className="bg-primary text-white" style={{ width: '30%' }}>Vendor Name</th> {/* Increased width */}
                        
                                    <th className="bg-primary text-white" style={{ width: '10%' }}>MSME</th>
                                  
                                </tr>
                                </thead>
                                <tbody>
                                {poData1?.map((poDetailsData, index) => (
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
                                    <td>{materialInfo[0]?.MSME}</td>
                                    
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
          </Row>
          <br></br><br></br>
          <Row>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Total Row Count</Label>
                <Input type="text" placeholder="Total Row Count" value={selectedRowCount} disabled />
              </FormGroup>
            </Col>
            
            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Vendor Invoice No"} type="text" form={form} id="vendorInvoiceNo" />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <CustomTextInput
                label={"Invoice Date"}
                form={form}
                id="invoiceDate"
                type="date"
                min={getAllowedPastDate(invoicePostingDate)}
                max={minDate}
                onKeyDown={(e) => {
                  e.preventDefault()
                }}
              />
            </Col>
            {/* <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
              </FormGroup>
            </Col> */}
            <Col md="4" sm="4">
                    <label></label> <br />
                      <Uploader
                      title="Invoice Copy"
                      id="pickSlipCopy"
                      selectedFileName={attachedFiles.pickSlipCopy.name} // Use a global or current file
                      setAttachment={handleFileChange} // Just pass the file directly
                      />
                     
            </Col>

            {/* <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Material Details</u></h4><br />
                        </Col>
                        <label></label>
                        <div  style={{
                            width: '100%',
                            overflowX: 'auto',
                            maxHeight: "500px",
                            border: "1px solid #ddd",
                            paddingBottom: "100px", // <-- Add space after the scroll ends
                            fontSize: "8pt"
                        }}>
                        <table className="table table-bordered" 
                        style={{ width: '100%', minWidth: '3000px', textAlign: 'left', tableLayout: 'fixed' }}>

                        {/* Sticky Header */}
                        {/* <thead style={{ position: "sticky",left: 0, background: "#007bff", zIndex: 1000 ,padding: 0 ,  top: 0}}>
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
                                <th className="bg-primary text-white" style={{ width: "100px" }}>UOM</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>HSN & SAC Code</th>
                                <th className="bg-primary text-white" style={{ width: "100px" }}>Rate</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Material Price</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Tax Price</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Discount</th>
                                <th className="bg-primary text-white" style={{ width: "150px" }}>Total Price</th>
                                {/* <th className="bg-primary text-white" style={{ width: "300px" }}>Vendor Name</th> */}
                                {/* <th className="bg-primary text-white" style={{ width: "120px" }}>Freight Charges</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Packing Forwarding</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Loading Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Unloading Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Other Charge</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>Ineligible Tax</th>
                                <th className="bg-primary text-white" style={{ width: "120px" }}>TAX Code</th>
                              
                            </tr>
                        </thead> */}

                        {/* Table Body */}
                        {/* <tbody> */}
                            {/* {materialInfo?.map((materialData, index) => (
                                materialData?.PO_ITEM?.map((lineItem, lineIndex) => (
                                    <tr key={`${index}-${lineIndex}`}> */}
                                        {/* Sticky First Three Columns */}
                                        {/* <td style={{ 
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
                                        {/* <td style={{ textAlign: "right" }}>{lineItem?.PO_QTY}</td>
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
                                        {/* <td style={{ textAlign: "right" }}>{(
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
                                            ).toFixed(3)}</td> */}
                                        {/* <td style={{ textAlign: "right" }}>{(lineItem?.INELIGIBLE_RATE*Number(orderQuantities[`${index}-${lineIndex}`]).toFixed(3) || 0)}{ "( " + lineItem?.INELI_PERCENT + "%" +" )"}</td> 
                                        <td style={{ textAlign: "right" }}>{lineItem?.TAXCODE}</td> */}
                                        {/* <td>{lineItem?.LGORT}</td> */}
                                         
                                    {/* </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div> */}

            <Col md="12" sm="12" className="d-flex justify-content-center mb-0">
              <FormGroup>
                <Button.Ripple color="primary" type="button" onClick={gateIn}>
                  <Check size={16} /> Submit
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
      </Modal>

      <Modal show={gateInOutModal} centered size="xl">
        <Row>
          <Col md="12" sm="12">
            <FormGroup>
              <ModalHeader><h5>Gate In Out Details</h5><X onClick={() => setGateInOutModal(false)} /></ModalHeader>
            </FormGroup>
          </Col>
        </Row>
        <ModalBody>
          <Row>
            <Col md="12" sm="12">
              <h4 className="text-primary"><u>General Info</u></h4>
            </Col>

            <Col md="4" sm="4">
              <FormGroup>
                <Label>Truck No</Label>
                <Input type="text" placeholder="Truck No" value={gateInOutDetails?.vehicleNo} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="4">
              <FormGroup>
                <Label>VA No</Label>
                <Input type="text" placeholder="VA No" value={gateInOutDetails?.vaNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Plant</Label>
                <Input type="text" placeholder="Plant" value={gateInOutDetails?.plantName} disabled />
              </FormGroup>
            </Col>
            {gateInOutDetails.shipmentOrderNo != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Shipment Order No</Label>
                  <Input type="text" placeholder="Shipment Order No" value={gateInOutDetails?.shipmentOrderNo} disabled />
                </FormGroup>
              </Col> : null
            }
            {gateInOutDetails.colorToken != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Color / Token</Label>
                  <Input type="text" placeholder="Color / Token" value={gateInOutDetails?.colorToken} disabled />
                </FormGroup>
              </Col> : null
            }
            {gateInOutDetails.tripSheetNumber ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>TRIP Sheet No</Label>
                  <Input type="text" placeholder="TRIP Sheet No" value={gateInOutDetails?.tripSheetNumber} disabled />
                </FormGroup>
              </Col> : null
            }
            {gateInOutDetails.truckType ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Truck Type</Label>
                  <Input type="text" placeholder="Truck Type" value={gateInOutDetails?.truckType} disabled />
                </FormGroup>
              </Col> : null
            }
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Driver Phone No</Label>
                <Input type="text" placeholder="Driver Phone No" value={gateInOutDetails?.driverMobileNumber} disabled />
              </FormGroup>
            </Col>
            {gateInOutDetails.rejectReasonId != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Reason</Label>
                  <Input type="text" placeholder="Reason" value={gateInOutDetails?.rejectReasonId} disabled />
                </FormGroup>
              </Col> : null
            }
            {gateInOutDetails.remarks != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Remarks</Label>
                  <Input type="text" placeholder="Remarks" value={gateInOutDetails?.remarks} disabled />
                </FormGroup>
              </Col> : null
            }

            {poData != '' ? <>
              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="12" sm="12">
                <h4 className="text-primary"><u>Purchase Order Details</u></h4>
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
                    <Input type="text" placeholder="Po Type" value={poDetails?.name} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Vendor Code</Label>
                    <Input type="text" placeholder="Vendor Code" value={poDetails?.vendorCode} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Vendor Name</Label>
                    <Input type="text" placeholder="Vendor Name" value={poDetails?.vendorName} disabled />
                  </FormGroup>
                </Col>
              </>))} </> : null
            }

            {gateInOutDetails.weighmentInfoId > 0 ?
              <>
                <Col md="12" sm="12"><hr></hr></Col>

                <Col md="12" sm="12">
                  <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4>
                </Col>

                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>First Weight</Label>
                    <Input type="text" placeholder="First Weight" value={gateInOutDetails?.firstWeight} disabled />
                  </FormGroup>
                </Col>

                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Second Weight</Label>
                    <Input type="text" placeholder="Second Weight" value={gateInOutDetails?.secondWeight} disabled />
                  </FormGroup>
                </Col>

                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Net Weight</Label>
                    <Input type="text" placeholder="Net Weight" value={gateInOutDetails?.netWeight} disabled />
                  </FormGroup>
                </Col>  </> : null
            }
          </Row>
        </ModalBody>
      </Modal>
      <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
        />
      {landingData == '' ? <div style={{ marginBottom: "280px" }}></div> : null}
    </>

  );
};

export default MultipleGateInSapDocument;
