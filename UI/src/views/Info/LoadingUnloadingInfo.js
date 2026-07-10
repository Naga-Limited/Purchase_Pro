import React, { Fragment, useState,useRef } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardBody, CardHeader, InputGroup } from "reactstrap";
import { ArrowLeft, Check, Plus, Search } from "react-feather";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { apiPostMethod } from "@helpers/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import Select from 'react-select'
import { apiGetMethod } from "../../helper/axiosHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import LoadingUnloadingInfoList from "./LoadingUnloadingInfoList";
import { useEffect } from "react";
import PurchaseOrderInfo from "./PurchaseOrderInfo";
import { minDate } from "../common/dateComponent";
import GatePassInfo from "./GatePassInfo";
import Purchase from "../VA/Purchase";
// import Barcode from 'react-barcode';
import axios from 'axios';
import QRCode from 'react-qr-code';
import PurchaseMaterial from "../SSAndPM/Unloading/purchase/PurchaseMaterial";
import NumberOnlyInput from "../../@core/components/number-input/number-input";

const LoadingUnloadingInfo = () => {

  const [footerHeight, setFooterHeight] = useState(true)
  let { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const [type, setType] = useState('');
  const [subType, setSubType] = useState('');
  const [poNumber, setPoNumber] = useState(false);
  const [truckNo, setTruckNo] = useState(false);
  const [plant, setPlant] = useState(false);
  const [eda, setEda] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [fromDate, setFromDate] = useState(false);
  const [toDate, setToDate] = useState(false);
  const [sampleMaterial, setSampleMaterial] = useState(false);
  const [quantity, setQuantity] = useState(false);
  const [cashInvoiceNo, setCashInvoiceNo] = useState(false);
  const [personName, setPersonName] = useState(false);
  const [moduleTypeId, setModuleTypeId] = useState("");

  const selectReset = () => {
    setPoDetails([])
    setPurchaseOrderList([])
    setTripSheetData([])
    setTruckValue("")
    setPoNo("")
    setPurchaseOrderDetails([])
    setIsDisable(false)
    setIsDisableForPo(false)
    setPoNumber(false)
    setTruckNo(false)
    setPlant(false)
    setRemarks(false)
    setEda(false)
    setFromDate(false)
    setToDate(false)
    setPersonName(false)
    setCashInvoiceNo(false)
    setPoType('')
    setPlantCode('')
    setSubModuleTypeId('')
    setSubType('')
    setIsDisableForPo(false)
    setSampleMaterial(false)
    setQuantity(false)
  }

  const selectType = (e) => {
    selectReset()
    setType([e])
    const id = e.value;
    setModuleTypeId(id)
    getSubModuleType(id)
  }

  const [subModuleTypeId, setSubModuleTypeId] = useState('')
  const [moduleType, setModuleType] = useState('')

  const selectSubType = (e) => {
    selectReset()
    setSubType(e)
    let subModuleType = e.value
    setSubModuleTypeId(subModuleType)
    setModuleType(e.moduleType);

    if (subModuleType == 5 || subModuleType == 25 || subModuleType == 6 || subModuleType == 13 || subModuleType == 23) {
      setCashInvoiceNo(true)
      setPlant(true)
      setRemarks(true)
      setPersonName(true)
      if (subModuleType == 6) {
        setIsDisableForPo(true)
      }
    } else if (subModuleType == 7) {
      setRemarks(true)
      // setIsDisableForPo(true)
    } else if (subModuleType == 9 || subModuleType == 11 || subModuleType == 15 || subModuleType == 17 || subModuleType == 22) {
      setPlant(true)
      setPersonName(true)
      setRemarks(true)
      setIsDisableForPo(true)
    } else if (subModuleType == 26 || subModuleType == 27 || subModuleType == 28 || subModuleType == 29) {
      setPlant(true)
      setRemarks(true)
      setSampleMaterial(true)
      setQuantity(true)
      setIsDisableForPo(true)
    }
  }

  const [isDisable, setIsDisable] = useState(false);
  const [IsDisableForPo, setIsDisableForPo] = useState(false);
  const [truckValue, setTruckValue] = useState('');
  const [poNo, setPoNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [tripSheetData, setTripSheetData] = useState([]);
  const [poDetails, setPoDetails] = useState([]);
  const [checkVehicleNo, setCheckVehicleNo] = useState(true);
  const [barcodeData, setBarcodeData] = useState('');
  const canvasRef = useRef(null);

  const validateTruckNo = (truckNo) => {

    setTruckValue(truckNo.replace(/[^\w\s]/gi, ""))

    // if (truckNo != "") {
    //   let ObjVal = truckNo;
    //   var panPat = /^[A-Z]{2}[\d]{2}[A-Z]{1,2}[\d]{4}$/;
    //   if (ObjVal.search(panPat) == -1) {
    //     setCheckVehicleNo(false);
    //   } else {
    //     setCheckVehicleNo(true);
    //   }
    // }
  }

  const getTripsheetDetailsForFG = () => {
    // if (checkVehicleNo) {
    showLoader();
    const vehicleNo = { Vehicle_Number: truckValue, userInfoId: UserDetails.USERID, isMovement: userPlant[0].isMovement }
    console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setIsDisable(true)
          setTripSheetData(data.results[0])
          if (moduleTypeId == 4 || moduleTypeId == 19 || moduleTypeId == 5 || moduleTypeId == 7 || moduleTypeId == 8 || moduleTypeId == 28 || moduleTypeId == 1 || moduleTypeId == 38) {
            setTruckNo(true)
            setPlant(true)
            setRemarks(true)
          } else if (moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 12 || moduleTypeId == 9 || moduleTypeId == 13 || moduleTypeId == 11 || moduleTypeId == 15 || moduleTypeId == 22 || moduleTypeId == 25 || moduleTypeId == 33 || moduleTypeId == 34 || moduleTypeId == 35 || moduleTypeId == 44) {
            setPoNumber(true)
            setTruckNo(true)
            setRemarks(true)
          } else if (moduleTypeId == 10) {
            setTruckNo(true)
            setPlant(true)
            setRemarks(true)
            setFromDate(true)
            setToDate(true)
          } else if (moduleTypeId == 14) {
            setPoNumber(true)
            setTruckNo(true)
            setFromDate(true)
            setToDate(true)
            setRemarks(true)
          } else if (moduleTypeId == 23 || moduleTypeId == 24 || moduleTypeId == 26 || moduleTypeId == 31) {
            setPlant(true)
            setPersonName(true)
            setRemarks(true)
            setIsDisableForPo(true)
          } else if (moduleTypeId == 30) {
            setPlant(true)
            setRemarks(true)
            setSampleMaterial(true)
            setQuantity(true)
            setIsDisableForPo(true)
          } else if (moduleTypeId == 29 || moduleTypeId == 27 || moduleTypeId == 37 || moduleTypeId == 40 || moduleTypeId == 41 || moduleTypeId == 42) {
            setTruckNo(true)
            setPlant(true)
            setRemarks(true)
            if(moduleTypeId != 40 && moduleTypeId != 41){
            setFromDate(true)
            setToDate(true)
            }
          }
        } else {
          if (data.success == false) {
            if (truckValue == '') {
              errorToast("Please Enter Vehicle No")
            }
            else {
              setRemarks(true)
              setIsDisable(true)
              setTripSheetData(data.results[0])
              if (moduleTypeId == 4 || moduleTypeId == 19 || moduleTypeId == 5 || moduleTypeId == 7 || moduleTypeId == 8 || moduleTypeId == 28 || moduleTypeId == 1 || moduleTypeId == 38) {
                setTruckNo(true)
                setPlant(true)
              } else if (moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 12 || moduleTypeId == 9 || moduleTypeId == 13 || moduleTypeId == 11 || moduleTypeId == 15 || moduleTypeId == 22 || moduleTypeId == 25 || moduleTypeId == 33 || moduleTypeId == 34 || moduleTypeId == 35) {
                setPoNumber(true)
                setTruckNo(true)
              } else if (moduleTypeId == 10) {
                setTruckNo(true)
                setPlant(true)
                setFromDate(true)
                setToDate(true)
              } else if (moduleTypeId == 14) {
                setPoNumber(true)
                setTruckNo(true)
                setFromDate(true)
                setToDate(true)
              } else if (moduleTypeId == 23 || moduleTypeId == 24 || moduleTypeId == 26 || moduleTypeId == 31) {
                setPlant(true)
                setPersonName(true)
                setRemarks(true)
                setIsDisableForPo(true)
                if(subModuleTypeId == 30 || subModuleTypeId == 31){
                  setFromDate(true)
                  setToDate(true)
                }
              } else if (moduleTypeId == 30) {
                setPlant(true)
                setRemarks(true)
                setSampleMaterial(true)
                setQuantity(true)
                setIsDisableForPo(true)
              } else if (moduleTypeId == 29 || moduleTypeId == 27 || moduleTypeId == 37 || moduleTypeId == 40 || moduleTypeId == 41 || moduleTypeId == 42) {
                setTruckNo(true)
                setPlant(true)
                setRemarks(true)
                if(moduleTypeId != 40 && moduleTypeId != 41){
                setFromDate(true)
                setToDate(true)
                } 
              }
            }
          }
        }
        setBarcodeData(truckValue)
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    // }
  }

  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [poType, setPoType] = useState('')
  const [plantCode, setPlantCode] = useState('')

  const getPoDetails = (type) => {
    showLoader();
    const poNumber = { poNumber: poNo, moduleTypeId: moduleTypeId, subModuleTypeId: subModuleTypeId }
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          let plantCode = moduleTypeId == 16 || moduleTypeId == 14 || moduleTypeId == 25 || moduleTypeId == 35 ||  moduleTypeId == 15 ? data.data[0].PO_LINEITEM[0].PLANT : data.data[0].FROMPLANT
          const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode)
          if (plant == '') {
            confirmDialog({
              title: `<h5><strong class="text-white"> ${plantCode} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoDetails([])
            setPoType('')
          }
          // else if ((data.data[0].REFERENCE == "Stores & Spares" && moduleTypeId != 6) || (data.data[0].REFERENCE == "Packing" && moduleTypeId != 20) || (moduleTypeId == 6 || moduleTypeId == 20) && (data.data[0].REFERENCE == '')) {
          //   confirmDialog({
          //     title: `<h5><strong class="text-white"> ${data.data[0].REFERENCE} - PO Type not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          //   })
          //   setPoDetails([])
          //   setPoType('')
          // }
          else {
            if (type == 'list') {
              getPoType(data.data[0].TYPE)
              setPoDetails(data.data[0])
              setPlantCode(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)
              getUserPlant(data.data[0].FROMPLANT)
              checkMasterPlant(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)

              if (moduleTypeId == 14) {
                setIsDisableForPo(true)
                const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length

                for (let i = 0; i < length; i++) {
                  const obj = {
                    poType: data.data[0].TYPE,
                    poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                    invoiceNo: invoiceNo ? invoiceNo : null,
                    line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                    material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                    description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : null,
                    plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                    quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                    documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                    vendorName: data.data[0].VENDOR_NAME,
                    vendorCode: data.data[0].VENDOR,
                    storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                  }
                  purchaseOrderDetails.push(obj);
                }
                setPurchaseOrderDetails(purchaseOrderDetails);
                console.log(purchaseOrderDetails);
              }
            } else {
              getPoDetails('list')
              setPoDetails([])
              setPoNo('')
              setPoType('')
              setInvoiceNo('')
              setIsDisableForPo(true)

              for (let i = 0; i < data.data.length; i++) {
                const obj = {
                  poNumber: data.data[0].PO_NUMBER || data.data[0].PO_NO,
                  invoiceNo: invoiceNo,
                  type: data.data[0].TYPE,
                  plantCode: data.data[0].FROMPLANT ? data.data[0].FROMPLANT : data.data[0].PO_LINEITEM[0].PLANT,
                  vendorName: data.data[0].VENDOR_NAME,
                  poName: poTypeData.name,
                  plantName: plantName,
                  toPlantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                }
                purchaseOrderList.push(obj);
              }
              setPurchaseOrderList(purchaseOrderList)

              const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length

              for (let i = 0; i < length; i++) {
                const obj = {
                  poType: data.data[0].TYPE,
                  poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                  invoiceNo: invoiceNo ? invoiceNo : null,
                  line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                  material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                  description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : null,
                  plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                  quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                  documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                  vendorName: data.data[0].VENDOR_NAME,
                  vendorCode: data.data[0].VENDOR,
                  storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                }
                purchaseOrderDetails.push(obj);
              }
              setPurchaseOrderDetails(purchaseOrderDetails);
            }
          }
        } else {
          errorToast(data.message)
          setPoType('')
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

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      phoneNo: tripSheetData?.DRIVER_PHONE_NO == undefined ? validation.number({ min: 10, max: 10 }) : "",
      masterPlantId: moduleTypeId != 12 && moduleTypeId != 15 && moduleTypeId != 21 && moduleTypeId != 33 && moduleTypeId != 34 && moduleTypeId != 35 && subModuleTypeId != 5 && subModuleTypeId != 25 && moduleTypeId != 14 && moduleTypeId != 25 && moduleTypeId != 6 && moduleTypeId != 13 && moduleTypeId != 20 ? validation.required({ message: "Please Select Plant", isObject: true }) : "",
      cashInvoiceNo: cashInvoiceNo && subModuleTypeId != 5 && subModuleTypeId != 25 && subModuleTypeId != 13 && moduleTypeId != 35 ? validation.required({ message: "Please Enter Invoice No", isObject: false }) : "",
      eda: eda ? validation.required({ message: "Please Enter EDA", isObject: false }) : "",
      fromDate: fromDate ? validation.required({ message: "Please Select From Date", isObject: false }) : "",
      toDate: toDate ? validation.required({ message: "Please Select To Date", isObject: false }) : "",
      personName: personName ? validation.required({ message: "Please Enter Person Name", isObject: false }) : "",
      sampleMaterial: sampleMaterial ? validation.required({ message: "Please Enter Sample Material", isObject: false }) : "",
      quantity: quantity ? validation.required({ message: "Please Enter Quantity", isObject: false }) : "",
      water_rate: moduleTypeId == 42 ? validation.number({ min: 3, max: 5 }) : "",
      vehicle_rent: moduleTypeId == 42 ? validation.number({ min: 3, max: 7 }) : "",
    }),
    onSubmit() { },
  });

  const checkInvoiceNo = () => {

    if ((invoiceNo == "") && (moduleTypeId == 11 || moduleTypeId == 12 || moduleTypeId == 15 || subModuleTypeId == 5 || subModuleTypeId == 25 || moduleTypeId == 25 || moduleTypeId == 33 || moduleTypeId == 34 || moduleTypeId == 35)) {
      confirmDialog({
        title: `<h5><strong class="text-white">Please Enter Invoice No</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    } else if (purchaseOrderList.length > 0) {
      const checkPoNo = purchaseOrderList.filter((poData) => poData.poNumber == poNo);
      if (checkPoNo != '') {
        confirmDialog({
          title: `<h5><strong class="text-white">PO Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
        setPoDetails([])
        setPoType('')
        setPoNo('')
      } else {
        getPoDetails()
      }
    }
    else {
      getPoDetails()
    }
  }

  const submit = (gatePassDocument) => {
    if (subModuleTypeId == 5 || subModuleTypeId == 25 || subModuleTypeId == 7 || subModuleTypeId == 11 || subModuleTypeId == 13 || subModuleTypeId == 15 || subModuleTypeId == 17 || subModuleTypeId == 22 || moduleTypeId == 35 || moduleTypeId == 30 || moduleTypeId == 36 || moduleTypeId == 44) {
      gateIn()
    } else if (subModuleTypeId == 9 || subModuleTypeId == 10) {
      addTestWeighbridge(gatePassDocument)
    } else {
      addLoadingUnloadingInfo(gatePassDocument)
    }
  }

  const addTestWeighbridge = (gatePassDocument) => {
    if ((!form.isValid) && (tripSheetData?.DRIVER_PHONE_NO == undefined || purchaseOrderList == '' || subModuleTypeId == 5 || subModuleTypeId == 25 || subModuleTypeId == 6)) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;

    const postdata = {
      subModuleTypeId: subModuleTypeId ? subModuleTypeId : null,
      vehicleNo: truckValue,
      remarks: formData?.remarks,
      masterPlantId: formData?.masterPlantId?.userPlantId,
      userInfoId: UserDetails.USERID,
    };

    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/addTestWeighbridge", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/addTestWeighbridge", postdata)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          getLoadingData()
          addLoadingUnloadingInfo(gatePassDocument)
        }
        else if (data.success == false) {
          errorToast(data.message);
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

  const gateIn = () => {
    if(moduleTypeId != 44){
    if ((!form.isValid) && (tripSheetData?.DRIVER_PHONE_NO == undefined || purchaseOrderList == '' || moduleTypeId == 16 || moduleTypeId == 35)) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }}

    let formData = form.values;

    const postdata = {
      vehicleNo: truckValue != '' ? truckValue : null,
      userInfoId: UserDetails.USERID,
      subModuleTypeId: subModuleTypeId ? subModuleTypeId : null,
      movementType: subModuleTypeId == 7 || subModuleTypeId == 11 || subModuleTypeId == 15 || subModuleTypeId == 22 || moduleTypeId == 36 || moduleTypeId == 44 ? "Loading" : "Unloading",
      moduleType: moduleTypeId == 44 ? 'RM-Import STO' :moduleType,
      masterPlantId: masterPlantId != '' ? masterPlantId : formData.masterPlantId.userPlantId,
      werks: formData?.masterPlantId ? formData?.masterPlantId.werks : '',
      driverMobileNumber: formData.phoneNo ? formData.phoneNo : null,
      moduleStatusId: 0,
      remarks: formData.remarks,
      purchaseOrderDetails: purchaseOrderDetails
    };

    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          // ShowToast(data.message)
          getLoadingData()
          addLoadingUnloadingInfo()
        }
        else if (data.success == false) {
          errorToast(data.message);
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

  const addLoadingUnloadingInfo = (gatePassDocument) => {
    if(moduleTypeId != 44){
    if ((!form.isValid) && (tripSheetData?.DRIVER_PHONE_NO == undefined || purchaseOrderList == '' || moduleTypeId == 16 || moduleTypeId == 35)) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }}
    let formData = form.values;

    const FrmData = {
      movementTypeId: selectedValue.value ? selectedValue.value : null,
      moduleTypeId: moduleTypeId ? moduleTypeId : null,
      subModuleTypeId: subModuleTypeId ? subModuleTypeId : null,
      truckNo: truckValue ? truckValue : null,
      masterPlantId: purchaseOrderList != '' ? purchaseOrderList[0].plantCode : moduleTypeId == 14 ? plantCode : formData.masterPlantId.werks,
      eda: formData.eda ? formData.eda : null,
      remarks: formData.remarks ? formData.remarks : null,
      fromDate: formData.fromDate ? formData.fromDate : null,
      toDate: formData.toDate ? formData.toDate : null,
      personName: formData.personName ? formData.personName : purchaseOrderList != '' ? purchaseOrderList[0].vendorName : null,
      phoneNo: formData.phoneNo ? formData.phoneNo : tripSheetData ? tripSheetData.DRIVER_PHONE_NO : null,
      tripSheetNo: tripSheetData ? tripSheetData.TRIPSHEET_NO : null,
      sampleMaterial: formData.sampleMaterial ? formData.sampleMaterial : null,
      quantity: formData.quantity ? formData.quantity : formData.invoice_cost ? formData.invoice_cost : null,
      cashInvoiceNo: subModuleTypeId == 5 || subModuleTypeId == 25 ? purchaseOrderDetails[0].invoiceNo : form.values.cashInvoiceNo ? form.values.cashInvoiceNo : null,
      statusId: 0,
      userInfoId: UserDetails.USERID,
      purchaseOrderDetails: purchaseOrderDetails,
      gatePassDocument:subModuleTypeId == 6 ?  '' : gatePassDocument,
      water_rate:formData.water_rate,
      vehicle_rent:formData.vehicle_rent,
    };
    const regex = /^[0-9]{1,5}$/; // Allows only 1 to 5 digits

    if (!regex.test(FrmData?.quantity) && subModuleTypeId == 6) {
      errorToast("Enter a valid Bill amount");
      return;
    }

    showLoader();
    console.log(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
    apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          ShowToast(data.message);
          reset()
          getLoadingData()
        }
        else if (data.success == false) {
          errorToast(data.message);
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

  const [data, setData] = useState([]);
  const [movementTypeData, setMovementTypeData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('')

  const selectMovementType = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getMovementType`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setMovementTypeData(data.results)
        }
        else if (data.success == false) {
          errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const selectModuleType = (e) => {
    selectType(0)
    setSelectedValue(e)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/${e.value}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          let moduleAccessData 
          if(UserDetails.role == 'Security' && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19)){
            moduleAccessData = data.results.filter((item) => (item.moduleTypeId == 22))
          }else if(UserDetails.role == 'Security' && (UserDetails.GATE_ID == 22)){
            moduleAccessData = data.results.filter((item) => (item.moduleTypeId == 44))
          }else{
          moduleAccessData = data.results.filter((item) => (item.moduleTypeId == 1 && item.isMovement == 1 && item.isIFoodSales == 1) || (item.moduleTypeId != 2 && item.moduleTypeId != 3 && item.moduleTypeId != 9 && item.isMovement == 0 && item.moduleTypeId != 39 && item.moduleTypeId != 40))
          }
          setData(moduleAccessData)
          console.log(moduleAccessData);
        }
        else if (data.success == false) {
          errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [subModuleData, setSubModuleData] = useState([])

  const getSubModuleType = (moduleTypeId) => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getSubModuleType/${moduleTypeId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {

          let submoduleAccessData 

          if(UserDetails.role == 'Security'){
            submoduleAccessData = data.results.filter((item) => (item.label == 'Hand Carry'))
          }else if (moduleTypeId == 22 && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19)){
            submoduleAccessData = data.results.filter((item) => (item.label != 'Hand Carry' && item.moduleTypeId == 22))
          }else {
            submoduleAccessData = data.results
          }
          setSubModuleData(submoduleAccessData)

        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const reset = () => {
    setType("")
    selectType("")
    setModuleTypeId("")
    setData("")
    setSelectedValue("")
    form.resetForm("");
    setPoDetails([])
    setTripSheetData([])
    setTruckValue("")
    setPoNo("")
    setIsDisable(false)
    setIsDisableForPo(false)
    setPurchaseOrderDetails([])
    setPlantCode('')
    setInvoiceNo('')
    setPurchaseOrderList([])
  }

  const [landingData, setLandingData] = useState([])

  const getLoadingData = () => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setLandingData(data.results.filter((item) => item.moduleTypeId != 16));
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

  const [userPlant, setUserGate] = useState([])
  const [plantName, setPlantName] = useState('')
  const [masterPlantId, setMasterPlantId] = useState('')

  const getUserPlant = (plantCode) => {
    console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setUserGate(data.results)
          const masterPlant = data.results.filter((plant) => plant.werks == plantCode);
          setPlantName(masterPlant[0]?.plantName)
          setMasterPlantId(masterPlant[0]?.userPlantId)
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [poTypeData, setPoTypeData] = useState([])

  const getPoType = (poType) => {
    console.log(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setPoTypeData(data.results[0])
        } else {
          confirmDialog({
            title: `<h5><strong class="text-white">PO Type Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
          setPoDetails([])
          setPoType('')
          setPoNo('')
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const checkMasterPlant = (plantCode) => {
    console.log(apiBaseUrl + `GatePro/Master/checkMasterPlant/${plantCode}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${plantCode}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          console.log(data.results);
        } else if ((data.success == false)) {
          confirmDialog({
            title: `<h5><strong class="text-white">${plantCode} - Plant Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
          setPoDetails([])
          setPoType('')
          setPoNo('')
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getLoadingData()
    getUserPlant('')
    selectMovementType()
  }, [])

  const handleGenerate = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const barcodeSvg = document.getElementById('barcode');
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    img.onload = () => {
      context.drawImage(img, 0, 0);
    };
    console.log(img)
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!truckValue) {
      errorToast('Please enter a value to generate the barcode.');
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const barcodeSvg = document.getElementById('barcode');
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    img.onload = () => {
      context.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      fetch(dataURL)
        .then(res => res.blob())
        .then(blob => {
          const postdata = new FormData();

          postdata.append('file[]', blob, `${barcodeData}.png`);
          postdata.append("form_name", 'Barcode');
          postdata.append("SubFolder", "Barcode");

          apiPostMethod(sapFileShare, postdata, "File")
              .then(response => {
                const { data } = response;
            if (data.success) {
              let gatePassDocument ;
              gatePassDocument = data.files[0] ? data.files[0].updname : "";
              submit(gatePassDocument);
            } else {
              errorToast('Failed to save barcode data.');
            }
          }).catch(error => {
            console.error('Error saving barcode data:', error);
            errorToast('An error occurred while saving barcode data.');
          });
        });
    };
  };
  return (
    <>
    
      <Fragment>
      {(
            (UserDetails.role == 'Security' && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19 || UserDetails.GATE_ID == 22)) ||
            (UserDetails.role != 'Security' && UserDetails.GATE_ID)
          ) && (
        <Card>
          <CardHeader><h5>Loading & Unloading Info</h5><RefreshBlock1 /></CardHeader>
          <hr />
          <CardBody>
            <Row>
           
              <Col md="12" sm="12">
                <h4 className="text-primary"><u>General Details</u></h4><br />
              </Col>
             
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Movement Type</Label>
                  <Select
                    value={selectedValue}
                    options={movementTypeData}
                    onChange={selectModuleType}
                  />
                </FormGroup>
              </Col>
              {data != "" ?
                <>
                  <Col sm="4" md="4">
                    <FormGroup>
                      <Label>Module Type</Label>
                      <Select
                        options={data}
                        onChange={selectType}
                        value={type}
                      />
                    </FormGroup>
                  </Col>

                  {moduleTypeId == 12 || moduleTypeId == 21 || moduleTypeId == 33 || moduleTypeId == 34 ? <Purchase screen={'loadingUnloadingInfo'} getUnLoadingData={getLoadingData} loadingUnloadingModuleTypeId={moduleTypeId} loadingUnloadingReset={reset} /> : <>
                 
                    
                    {moduleTypeId == 16 || moduleTypeId == 22 || moduleTypeId == 6 || moduleTypeId == 23 || moduleTypeId == 5 || moduleTypeId == 24 || moduleTypeId == 25 || moduleTypeId == 26 || moduleTypeId == 31 || moduleTypeId == 1 || moduleTypeId == 30 || moduleTypeId == 35 || moduleTypeId == 36 || moduleTypeId == 40 ?
                      <Col sm="4" md="4">
                        <FormGroup>
                          <Label>Sub Module Type</Label>
                          <Select
                            options={subModuleData}
                            onChange={selectSubType}
                            value={subType}
                          />
                        </FormGroup>
                      </Col> : null
                    }

                    {(moduleTypeId && moduleTypeId != 16 && moduleTypeId != 22 && moduleTypeId != 5 && moduleTypeId != 6 && moduleTypeId != 23 && moduleTypeId != 24 && moduleTypeId != 25 && moduleTypeId != 26 && moduleTypeId != 31 && moduleTypeId != 1 && moduleTypeId != 30 && moduleTypeId != 35 && moduleTypeId != 36) || subModuleTypeId == 2 || subModuleTypeId == 4 || subModuleTypeId == 8 || subModuleTypeId == 10 || subModuleTypeId == 12 || subModuleTypeId == 14 || subModuleTypeId == 16 || subModuleTypeId == 18 || subModuleTypeId == 19 || subModuleTypeId == 20 || subModuleTypeId == 21 || subModuleTypeId == 24 || subModuleTypeId == 30 || subModuleTypeId == 31 ?
                      <Col md="4" sm="4">
                        <FormGroup>
                          <Label>Truck No</Label>
                          <InputGroup>
                            <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Truck No" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                            <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getTripsheetDetailsForFG}>
                              <Search size={20} />
                            </Button>
                          </InputGroup>
                          {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
                        </FormGroup>
                      </Col> : null
                    }
                    {plant && subModuleTypeId != 5 && subModuleTypeId != 25 && subModuleTypeId != 13 && subModuleTypeId != 23 ?
                      <Col sm="4" md="4">
                        <FormGroup>
                          <CustomDropdownInput
                            options={userPlant}
                            label={"Plant"}
                            form={form}
                            id="masterPlantId"
                          />
                        </FormGroup>
                      </Col> : null
                    }
                    {cashInvoiceNo && subModuleTypeId != 5 && subModuleTypeId != 25 && subModuleTypeId != 13 && subModuleTypeId != 23 ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Invoice Number"} form={form} id="cashInvoiceNo" type="text" />
                      </Col> : null
                    }
                     {cashInvoiceNo ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Bill Amount"} form={form} id="invoice_cost" type="number" />
                      </Col> : null
                    }
                    {eda ?
                      <Col md="4" sm="4">
                        <FormGroup>
                          <CustomTextInput label={"EDA"} form={form} id="eda" type="text" />
                        </FormGroup>
                      </Col> : null
                    }
                    {fromDate ?
                      <Col md="4" sm="4">
                        <CustomTextInput
                          label={"From Date"}
                          form={form}
                          id="fromDate"
                          type="date"
                          min={minDate}
                          onKeyDown={(e) => {
                            e.preventDefault()
                          }}
                        />
                      </Col> : null
                    }
                    {toDate ?
                      <Col md="4" sm="4">
                        <CustomTextInput
                          label={"To Date"}
                          form={form}
                          id="toDate"
                          type="date"
                          min={minDate}
                          onKeyDown={(e) => {
                            e.preventDefault()
                          }}
                        />
                      </Col> : null
                    }
                    {personName ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Person Name"} form={form} id="personName" type="text" />
                      </Col> : null
                    }
                    {sampleMaterial ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Sample Material"} form={form} id="sampleMaterial" type="text" />
                      </Col> : null
                    }
                    {quantity ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Quantity"} form={form} id="quantity" type="number" />
                      </Col> : null
                    }
                    {moduleTypeId != 44 && 
                    <Col md="4" sm="4">
                      <FormGroup>
                        {tripSheetData?.DRIVER_PHONE_NO ? <>
                          <Label>Phone Number</Label>
                          <Input type="text" placeholder="Enter Phone Number" value={tripSheetData?.DRIVER_PHONE_NO} disabled={tripSheetData?.DRIVER_PHONE_NO} /> </> : null
                        }
                        {(tripSheetData != '' && (tripSheetData?.DRIVER_PHONE_NO == undefined || tripSheetData?.DRIVER_PHONE_NO == '')) || subModuleTypeId == 5 || subModuleTypeId == 6 || subModuleTypeId == 25 || subModuleTypeId == 1 || subModuleTypeId == 3 || subModuleTypeId == 7 || subModuleTypeId == 9 || subModuleTypeId == 11 || subModuleTypeId == 13 || subModuleTypeId == 15 || subModuleTypeId == 17 || subModuleTypeId == 22 || subModuleTypeId == 23 || subModuleTypeId == 26 || subModuleTypeId == 27 || subModuleTypeId == 28 || subModuleTypeId == 29 ?
                          <CustomTextInput label={"Phone Number"} form={form} id="phoneNo" type="text" /> : null
                        }
                      </FormGroup>
                    </Col>}

                    {tripSheetData?.TRIPSHEET_NO ?
                      <Col md="4" sm="4">
                        <FormGroup>
                          <Label>Tripsheet Number</Label>
                          <Input type="text" placeholder="Enter Tripsheet Number" value={tripSheetData?.TRIPSHEET_NO} disabled />
                        </FormGroup>
                      </Col> : null
                    }
                    {isDisable && moduleTypeId == 42 ?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Water Rate"} form={form} id="water_rate" type="number" />
                      </Col> : null
                    }
                    {isDisable &&  moduleTypeId == 42?
                      <Col md="4" sm="4">
                        <CustomTextInput label={"Vehicle Monthly Rent"} form={form} id="vehicle_rent" type="number" />
                      </Col> : null
                    }
                   
                    {(remarks || subModuleTypeId == 1 || subModuleTypeId == 3 ) && subModuleTypeId != 6 ?
                      <Col md="4" sm="4">
                        <FormGroup>
                          <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                        </FormGroup>
                      </Col> : null
                    }
                     <Col md="2" sm="2">
                     </Col>
                    {truckValue &&
                    
                    <Col md="2" sm="2">

                        {/* <Barcode
                          id="barcode"
                          value={barcodeData}
                          width={2}
                          height={50}
                          format="CODE128"
                          displayValue={false}
                          // onChange={handleGenerate}
                        /> */}
                         <QRCode 
                         value={barcodeData} 
                         id="barcode"
                         size = '100'
                         hidden
                         />
                        {/* <canvas ref={canvasRef} style={{ display: 'none' }} /> */}
                    </Col> }
                    {((isDisable) && (moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 11 || moduleTypeId == 12 || moduleTypeId == 13 || moduleTypeId == 14 || moduleTypeId == 25 || moduleTypeId == 35 || moduleTypeId == 44 )) || subModuleTypeId == 5 || subModuleTypeId == 25 || subModuleTypeId == 7 || subModuleTypeId == 13 || subModuleTypeId == 23 ? <PurchaseOrderInfo purchaseOrderDetails={purchaseOrderDetails} poDetails={poDetails} poType={poType} getPoDetails={getPoDetails} setPoType={setPoType} IsDisableForPo={IsDisableForPo} moduleTypeId={moduleTypeId} setPoNo={setPoNo} poNo={poNo} checkInvoiceNo={checkInvoiceNo} setInvoiceNo={setInvoiceNo} invoiceNo={invoiceNo} plantCode={plantCode} purchaseOrderList={purchaseOrderList} poTypeData={poTypeData} plantName={plantName} isDisable={isDisable} subModuleTypeId={subModuleTypeId} screen={'loadingUnloadingInfo'}/> : null}

                    {(isDisable && moduleTypeId == 22) || subModuleTypeId == 1 || subModuleTypeId == 3 ? <GatePassInfo isDisable={isDisable} UserDetails={UserDetails} tripSheetData={tripSheetData} truckValue={truckValue} getLoadingData={getLoadingData} moduleTypeId={moduleTypeId} selectedValue={selectedValue} reset={reset} form={form} subModuleTypeId={subModuleTypeId} /> : null}
                    {(moduleTypeId == 15 && isDisable) && <PurchaseMaterial screen={'loadingUnloadingInfo'} getUnLoadingData={getLoadingData} moduleTypeId={moduleTypeId} loadingUnloadingReset={reset} tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo} />}
               
                        
                    {(truckNo && poNumber == false) || IsDisableForPo || ((truckNo) && (moduleTypeId == 4 || moduleTypeId == 19) ) ? <>
                      <Col sm="10" md="10">
                        <FormGroup className="d-flex justify-content-start mb-0 mt-2">
                          <Button.Ripple outline color="primary" type="button" onClick={reset}>
                            <ArrowLeft size={16} /> Back
                          </Button.Ripple>
                        </FormGroup>
                      </Col>
                      <Col sm="2" md="2">
                        <FormGroup className="d-flex justify-content-end mb-0 mt-2">
                          <Button color="primary" type="button" onClick={truckValue ? handleSubmit :submit}>
                            <Check size={16} /> Save
                          </Button>
                        </FormGroup>
                      </Col></> : null
                    }
                  </>}
                </> : null
              }
            </Row>
          </CardBody>
        </Card> )}

        <LoadingUnloadingInfoList getLoadingData={getLoadingData} landingData={landingData} />

        {footerHeight ? <div style={{ marginBottom: "280px" }}></div> : null}
      </Fragment >
    </>
  );
};

export default LoadingUnloadingInfo;
