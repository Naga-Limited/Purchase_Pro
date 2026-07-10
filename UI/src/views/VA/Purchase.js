import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardBody, CardHeader, InputGroup } from "reactstrap";
import { ArrowLeft, Check, Plus, Search, StopCircle } from "react-feather";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { apiPostMethod } from "@helpers/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import Select from 'react-select'
import { apiGetMethod } from "../../helper/axiosHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import PurchaseOrderInfo from "../Info/PurchaseOrderInfo";
import RmWaterGateIn from "../RM/Unloading/rmWater/RmWaterGateIn";
import PurchaseGateIn from "./PurchaseGateIn";
import QRCode from "react-qr-code";
import Uploader from "../Uploader";
import PurchaseOrderDetailsInfo from "../Info/PurchaseOrderDetailsInfo";
import PurchaseOrderDetailsInfoOCR from "../Info/PurchaseOrderDetailsInfoOCR";

const Purchase = ({ screen, getUnLoadingData, loadingUnloadingModuleTypeId, gateInOutInfoId, setData, setTruckNo, disabled, loadingUnloadingReset, loadingUnloadingInfoId, dieselReset }) => {

  useEffect(() => {
    getUserPlant('')
    getUserModuleAccess()
    getPoTypeAccess()
    QRCodeControl()
  }, [])

  let { showLoader, hideLoader } = useLoader();

  const [poNumber, setPoNumber] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [phoneNo, setPhoneNo] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [IsDisableForPo, setIsDisableForPo] = useState(false);
  const [truckValue, setTruckValue] = useState('');
  const [poNo, setPoNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [tripSheetData, setTripSheetData] = useState([]);
  const [gateInOutInfoData, setGateInOutInfoData] = useState([]);
  const [poDetails, setPoDetails] = useState({});
  const [poData, setPoData] = useState([]);
  const [checkVehicleNo, setCheckVehicleNo] = useState(true);
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [poType, setPoType] = useState('')
  const [plantCode, setPlantCode] = useState('')
  const [moduleType, setModuleType] = useState('')
  const [userPlant, setUserGate] = useState([])
  const [plantName, setPlantName] = useState('')
  const [poTypeData, setPoTypeData] = useState([])
  const [checkIsWeight, setCheckIsWeight] = useState([])
  const [moduleTypeId, setModuleTypeId] = useState('')
  const [isHidePurchase, setIsHidePurchase] = useState(false)
  const [userModuleAccessData, setUserModuleAccessData] = useState([]);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [barcodeData, setBarcodeData] = useState('');
  const [LoadtruckValue, setLoadtruckValue] = useState('');
  const [barcosedata, setbarcosedata] = useState('');
  const [invoiceCopy, setinvoiceCopy] = useState('');

  const getPurchaseOrder = (loadingUnloadingInfoId) => {
    console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setPoData(data.results)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getUserModuleAccess = () => {
    console.log(apiBaseUrl + `GatePro/Master/getUserModuleAccess/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getUserModuleAccess/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setUserModuleAccessData(data.results)
          console.log(data.results)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getGateInInfo = (ByHand) => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||ByHand}/0/0/0/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||ByHand}/0/0/0/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          if(data.results[0].moduleTypeId == 2 || data.results[0].moduleTypeId == 5){
            errorToast('Please Enter Correct Vehicle No')
          }else{
            setIsDisable(true)
            setGateInOutInfoData(data.results[0])
            getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
            setPoNumber(true)
            setRemarks(true)
          }          
        }
        else if (data.success == false) {
          getTripsheetDetailsForFG(ByHand)
        }
      }).catch((error) => {
        //console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

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

  const getTripsheetDetailsForFG = (ByHand) => {
    // if (checkVehicleNo) {
    showLoader();
    const vehicleNo = { Vehicle_Number: truckValue||ByHand, userInfoId: UserDetails.USERID, isMovement: 0 ,fromType : 'PURCHASE' }
    console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {

          let purchaseType = data.results[0].moduleTypeId != 14 && data.results[0].moduleTypeId != 12 && data.results[0].moduleTypeId != 15 && data.results[0].moduleTypeId != 21 && data.results[0].moduleTypeId != 25 && data.results[0].moduleTypeId != 33 && data.results[0].moduleTypeId != 34

          if ((data.results[0].loadingAndUnloadingInfoId > 0 && data.results[0].statusId == 0 && purchaseType) && (data.results[0].isGateIn == 0 || data.results[0].isGateIn == 1)&& data.results[0].moduleTypeId != 29) {
            if (data.results[0].isRedirect == 1) {
              confirmDialog({
                title: `<h5><strong class="text-white">Not made into Redirect Plant</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            } else {
              confirmDialog({
                title: `<h5><strong class="text-white">Vehicle Already In</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
          } else {
            if (data.results[0].moduleTypeId == 25 && data.results[0].isApproved == 0) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + 'Please Get Approve From Manager' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            } else if (screen != 'loadingUnloadingInfo' && !isHidePurchase && data.results[0].loadingAndUnloadingInfoId == undefined) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + 'Unauthorized Vehicle In' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
            else {
              setIsDisable(true)
              setTripSheetData(data.results[0])
              setPoNumber(true)
              setRemarks(true)
              if (data.results[0]?.TRIPSHEET_NO == undefined) {
                setPhoneNo(true)
              }
            }
          }
        }else if (data.success == false) {
          if (truckValue == '' && (ByHand == '' || ByHand == undefined)) {
            errorToast("Please Enter Vehicle No")
          }
          else if (screen != 'loadingUnloadingInfo' && !isHidePurchase) {
            confirmDialog({
              title: `<h5><strong class="text-white">` + 'Unauthorized Vehicle In' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
          }
          else {
            setIsDisable(true)
            setPoNumber(true)
            setRemarks(true)
            setPhoneNo(true)
            setTripSheetData('')
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

  const [poTypeAccessData, setPoTypeAccessData] = useState([])

  const getPoTypeAccess = () => {
    console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setPoTypeAccessData(data.results);
        } else {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getPoDetails = (type,PoNumber) => {
    showLoader();
    const poNumber = { poNumber: poNo||PoNumber, moduleTypeId: 12 }
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {

          let plant = data.data[0].PO_LINEITEM.map((item) => item.PLANT);

          const userPlant = [];
          plant.forEach((item, index) => {
            let data1 = UserDetails.plantids.filter((plant) => plant == item)
            if (data1 != '') {
              userPlant.push(data1[0])
            }
          });

          let poLineItem = data.data[0].PO_LINEITEM.filter((item) => item.PLANT == userPlant[0]);
          // let accessedPoType = poTypeAccessData.filter((item) => item.type == data.data[0].TYPE);

          if (poLineItem != '') {
            if (data.data[0].TYPE == 'ZMLF' || data.data[0].TYPE == 'ZMLU') {
              confirmDialog({
                title: `<h5><strong class="text-white">PO Type not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
              setPoDetails([])
              setPoType('')
            }
            // else if (accessedPoType == '') {
            //   confirmDialog({
            //     title: `<h5><strong class="text-white">PO Type not Assigned this Plant, Please Assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            //   })
            //   setPoDetails([])
            //   setPoType('')
            // }
            else {
              if (type == 'list') {
                setPoDetails(data.data[0])
                setPlantCode(poLineItem[0].PLANT)
                getPoType(data.data[0].TYPE ? data.data[0].TYPE : 0)
                getUserPlant(poLineItem[0].PLANT)
              } else {
                getPoDetails('list')
                setPoDetails([])
                setPoNo('')
                setPoType('')
                setInvoiceNo('')
                setIsDisableForPo(true)
                getAllPoType(data.data[0].TYPE)

                for (let i = 0; i < data.data.length; i++) {
                  const obj = {
                    poNumber: data.data[0].PO_NO,
                    invoiceNo: invoiceNo,
                    type: data.data[0].TYPE,
                    plantCode: poLineItem[0].PLANT,
                    vendorCode: data.data[0].VENDOR,
                    vendorName: data.data[0].VENDOR_NAME,
                    poName: poTypeData.name,
                    plantName: plantName,
                  }
                  purchaseOrderList.push(obj);
                }
                setPurchaseOrderList(purchaseOrderList)

                const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : poLineItem.length

                for (let i = 0; i < length; i++) {
                  const obj = {
                    poType: data.data[0].TYPE,
                    poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                    invoiceNo: invoiceNo ? invoiceNo : null,
                    line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : poLineItem[i].PO_LINEITEM,
                    material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : poLineItem[i].MATERIAL,
                    description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : data.data[0].PO_LINEITEM ? data.data[0].PO_LINEITEM[i].MATERIAL_DES : null,
                    poRate:data.data[0].PO_LINEITEM 
                      ? Number(data.data[0]?.PO_LINEITEM[i]?.RATE).toFixed(3) 
                      : Number(data.data[0]?.LINE_ITEM[i]?.RATE).toFixed(3),
                    // freightAmount:data.data[0]?.LINE_ITEM[i]?.FREIGHT ? Number(data.data[0]?.LINE_ITEM[i]?.FREIGHT).toFixed(3) : data.data[0]?.PO_LINEITEM[i]?.FREIGHT ? Number(data.data[0]?.PO_LINEITEM[i]?.FREIGHT).toFixed(3) : 0,
                    plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : poLineItem[i].PLANT,
                    quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : poLineItem[i].QUANTITY,
                    documentDate: data.data[0].PO_DATE,
                    vendorName: data.data[0].VENDOR_NAME,
                    vendorCode: data.data[0].VENDOR,
                    storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STORAGE_LOC : poLineItem[i].STORAGE_LOC,
                  }
                  purchaseOrderDetails.push(obj);
                }
                setPurchaseOrderDetails(purchaseOrderDetails);
              }
            }
          } else {
            setPoDetails([])
            setPoType('')
            confirmDialog({
              title: `<h5><strong class="text-white">${plant} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
          }

        } else {
          errorToast(data.message)
          setPoType('')
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        // errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      phoneNo: validation.number({ min: 10, max: 10 }),
      isWeight: screen == 'loadingUnloadingInfo' ? validation.required({ message: "Please Select Is Weight", isObject: true }) : ""
    }),
    onSubmit() { },
  });

  const checkInvoiceNo = () => {
    const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode);

    if (invoiceNo == "") {
      confirmDialog({
        title: `<h5><strong class="text-white">Please Enter Invoice No</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    }
    else if (plant == '') {
      confirmDialog({
        title: `<h5><strong class="text-white">Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    } else if (purchaseOrderList.length > 0) {
      const checkPoNo = purchaseOrderList.filter((poData) => poData.invoiceNo == invoiceNo && poData.poNumber == poNo);
      if (checkPoNo != '') {
        confirmDialog({
          title: `<h5><strong class="text-white">Invoice No Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
        setPoDetails([])
        setPoType([])
        setInvoiceNo('')
      } else {
        getPoDetails()
      }
    }
    else {
      getPoDetails()
    }
  }

  const submit = (moduleStatusId) => {

    if (gateInOutInfoData != '' || screen == 'FGSales' || screen == 'Diesel') {
      updateVehicleStatus(moduleStatusId)
    }else {
      if(!truckValue && form?.values?.isVehicle?.value == 1){
        errorToast('Please enter vehicle no.');
        return;
      }
      if (screen == 'loadingUnloadingInfo') {
        addLoadingUnloadingInfo('',truckValue)
      } else {
        gateIn(moduleStatusId)
      }
    }
  }
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
              setbarcosedata(gatePassDocument)
              submit(1);
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
  const addLoadingUnloadingInfo = (gatePassDocument,vehicle) => {
    console.log(form)
    // if (screen == 'loadingUnloadingInfo') {
    //   form.setSubmitting(true);
    //   form.validateForm();
    //   return;
    // }
    console.log('form')

    let formData = form.values;

    const FrmData = {
      movementTypeId: 2,
      moduleTypeId: loadingUnloadingModuleTypeId != undefined ? loadingUnloadingModuleTypeId : moduleTypeId,
      truckNo: truckValue ? truckValue : LoadtruckValue ? LoadtruckValue :vehicle ? vehicle :null,
      masterPlantId: purchaseOrderList[0].plantCode,
      remarks: formData.remarks ? formData.remarks : null,
      phoneNo: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : gateInOutInfoData != '' ? gateInOutInfoData.driverMobileNumber : formData.phoneNo,
      tripSheetNo: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : gateInOutInfoData != '' ? gateInOutInfoData.tripSheetNumber : null,
      statusId: screen == 'loadingUnloadingInfo' ? 0 : 1,
      userInfoId: UserDetails.USERID,
      isWeight: screen == 'loadingUnloadingInfo' && moduleTypeId == 15 ? 1 : formData?.isWeight?.value,
      purchaseOrderDetails: purchaseOrderDetails,
      gatePassDocument:gatePassDocument||barcosedata
    };

    if(FrmData?.phoneNo == '' || FrmData?.phoneNo == undefined){
      errorToast('Please Enter Driver Phone No');
      return;
    }
    console.log(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
    apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          getUnLoadingData()
          if (screen == 'loadingUnloadingInfo') {
            ShowToast(data.message)
            reset()
            loadingUnloadingReset()
          }
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

  const gateIn = (moduleStatusId) => {
    if (!form.isValid && phoneNo) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    let shipmentCopys;
    if (keys.length > 0 && UserDetails.GATE_ID == 19) {
      let postdata = new FormData();
            let { shipmentCopy } = postdata;

            postdata.append("image[]", shipmentCopy);

            let UploadFile = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.shipmentCopy && attachedFiles.shipmentCopy.name && attachedFiles.shipmentCopy.name.length ? true : false;
            

            postdata.append("form_name", moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                      shipmentCopys = data.files[0] ? data.files[0].updname : "";
                      GateInVehicle(moduleStatusId,shipmentCopys)
                    }
                })
    }else{
      GateInVehicle(moduleStatusId)
    }
  }
  const GateInVehicle = (moduleStatusId,shipmentCopys) =>{

    let purchaseOrderData = []

    for (let i = 0; i < purchaseOrderList.length; i++) {
      const obj = {
        ZZLINE: i + 1,
        ZZPO_NO: purchaseOrderList[i].poNumber,
        ZZVENDOR: purchaseOrderList[i].vendorCode,
        ZZINV_NO: purchaseOrderList[i].invoiceNo,
      }
      purchaseOrderData.push(obj);
    }

    const isWeight = checkIsWeight.filter((isWeight) => isWeight == 1)

    let formData = form.values;

    const postdata = {
      masterPlantId: purchaseOrderList[0]?.plantCode,
      userInfoId: UserDetails.USERID,
      movementType: "Unloading",
      moduleType: moduleType,
      vehicleNo: form?.values?.isVehicle?.value == 0 ? 'ByHand' : truckValue ? truckValue : '',
      subModuleTypeId:form?.values?.isVehicle?.value == 0 ? 5 : form?.values?.isVehicle?.value == 2 ? subModuleTypeId : '',
      driverMobileNumber: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : gateInOutInfoData != '' ? gateInOutInfoData.driverMobileNumber : formData.phoneNo,
      tripSheetNumber: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : gateInOutInfoData != '' ? gateInOutInfoData.tripSheetNumber : null,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks ? formData.remarks : null,
      isWeight: form?.values?.isVehicle?.value == 0 ? 0 : isWeight != '' ? 1 : 0,
      purchaseOrderDetails: purchaseOrderData,
      invoiceCopy:shipmentCopys,
      gate_id: UserDetails.GATE_ID,
    };
    if(postdata.vehicleNo == ''){
      errorToast('Please Check Vehicle No')
      return false
    }
    else if((postdata.invoiceCopy == '' || postdata.invoiceCopy == undefined) && UserDetails.GATE_ID == 19 && moduleTypeId == 40){
      errorToast('Please Attach Invoice Copy')
      return false
    }
    else if(moduleTypeId == 15 && UserDetails.GATE_ID == 1){
      errorToast('This purchase not applicable for direct gate in ...')
      return false
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
          confirmDialog({
            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
          }).then(() => {
            window.location.reload();  // Reloads the page after the confirm dialog is closed
           });
          reset()
          if(form?.values?.isVehicle?.value != 2){
          getUnLoadingData()
          addLoadingUnloadingInfo('',res.vehicle)
          setLoadtruckValue(res.vehicle)
          }
        }
        else if (res.success == false) {
          confirmDialog({
            title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
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

  const updateVehicleStatus = (moduleStatusId) => {

    let formData = form.values;

    const postdata = {
      gateInOutInfoId: screen == 'FGSales' || screen == 'Diesel' ? gateInOutInfoId : gateInOutInfoData.gateInOutInfoId,
      loadingUnloadingInfoId: screen == 'Diesel' ? loadingUnloadingInfoId : gateInOutInfoData.loadingUnloadingInfoId,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks,
      userInfoId: UserDetails.USERID,
      purchaseOrderDetails: screen == 'FGSales' || screen == 'Diesel' ? purchaseOrderDetails : []
    };

    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          const message = moduleStatusId == 6 ? "Waiting for In..." : "Gate In Success...";
          confirmDialog({
            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
          })
          getUnLoadingData()
          if (screen == 'FGSales') {
            setData([])
            setTruckNo('')
            disabled(false)
          }else if (screen == 'Diesel') {
            dieselReset()
          }
          reset()
        }
        else if (res.success == false) {
          confirmDialog({
            title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
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

  const reset = () => {
    setPurchaseOrderList([])
    form.resetForm("");
    setRemarks(false)
    setPoNumber(false)
    setPoDetails([])
    setTripSheetData([])
    setTruckValue("")
    setPoNo("")
    setIsDisable(false)
    setIsDisableForPo(false)
    setPurchaseOrderDetails([])
    setPlantCode('')
    setInvoiceNo('')
    setPhoneNo(false)
    setPoTypeData([])
    setPlantName('')
    setPoType('')
    setGateInOutInfoData([])
    setPoData([])
    setCheckIsWeight([])
    setinvoiceCopy('')
  }

  const getUserPlant = (plantCode) => {
    console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          hidePurchaseScreen(data.results[0].userGateId)
          setUserGate(data.results)
          const masterPlant = data.results.filter((plant) => plant.werks == plantCode);
          setPlantName(masterPlant[0]?.plantName);
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getPoType = (poType) => {
    console.log(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setPoTypeData(data.results[0])
          setModuleTypeId(data.results[0].moduleTypeId)
          setModuleType(data.results[0].moduleType)
          let userModuleTypeId = userModuleAccessData.map((item) => item.moduleTypeId)
          let checkUserModuleType = userModuleTypeId.filter((userModuleTypeId) => userModuleTypeId == data.results[0].moduleTypeId)
          if (checkUserModuleType == '') {
            confirmDialog({
              title: `<h5><strong class="text-white">Module Type not Assigned</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoDetails([])
            setPoType('')
          }
        } else {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
          setPoDetails([])
          setPoType('')
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getAllPoType = (poType) => {
    console.log(apiBaseUrl + `GatePro/Master/getPoType`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          const poTypeData = data.results.filter((plant) => plant.type == poType);
          checkIsWeight.push(poTypeData[0].isWeight)
          setCheckIsWeight(checkIsWeight)
        } else {
          errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const hidePurchaseScreen = (userGateId) => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/hidePurchaseScreen/${userGateId}`)
      .then((response) => {
        const { data } = response;
        console.log(data.isHide);
        if (data.isHide == true) {
          setIsHidePurchase(true)
        } else {
          setIsHidePurchase(false)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
  }
  const [isVehicle, setIsVehicle] = useState();
  const [subType, setSubType] = useState('');
  const [workingProcess,setWorkingProcess] = useState('');
  
  const QRCodeControl = () => {
      apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
          .then((response) => {
              const data = response.data;
              setWorkingProcess(data.workingProcess)
              if (data.success == 1) {
                if (data.gate_id == 19) {
                  setIsVehicle([
                      { value: 1, label: 'Purchase Vehicle' },
                      { value: 0, label: 'Hand Carry' },
                      { value: 2, label: 'Canteen Material' },
                      { value: 3, label: 'Multiple Gate In Purchase' }
                  ]);
                  getSubModuleType(40)
              } else {
                  setIsVehicle([
                      { value: 1, label: 'Vehicle' },
                      { value: 0, label: 'Hand Carry' },
                      { value: 3, label: 'Multiple Gate In Purchase'}
                  ]);
              }
              }
          })
          .catch((error) => {
              console.log(error)
              errorToast("Something went wrong, please try again after sometime1");
          })
  }
  const [subModuleData, setSubModuleData] = useState([])

  const getSubModuleType = (moduleTypeId) => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getSubModuleType/${moduleTypeId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setSubModuleData(data.results)
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
  const [subModuleTypeId, setSubModuleTypeId] = useState('')
  // const [moduleType, setModuleType] = useState('')
    // const [moduleTypeId, setModuleTypeId] = useState('')

  const selectSubType = (e) => {
    console.log(e)
    setSubType(e)
    let subModuleType = e.value
    setSubModuleTypeId(subModuleType)
    setModuleType(e.moduleType);
    setModuleTypeId(e.moduleTypeId)
  }
  const isWeight = [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
  // if(gateId == 19){
  //   const isVehicle = [{ value: 1, label: 'Vehicle' }, { value: 0, label: 'Hand Carry' }, { value: 2, label: 'Canteen Material' }]
  // }else{
  //   const isVehicle = [{ value: 1, label: 'Vehicle' }, { value: 0, label: 'Hand Carry' }]
  // }

  useEffect(() => {
    if(form?.values?.isVehicle?.value == 0){
    getGateInInfo('ByHand')
    }
  }, [form?.values?.isVehicle?.value == 0])

  const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });

  const handleFileChange = (file, id) => {
      setAttachment({
          ...attachedFiles,
          [id]: file,
      });
  };
  // console.log(form?.values?.isVehicle?.value)
  return (
    <>
      {screen != 'FGSales' && screen != 'Diesel' && screen != 'loadingUnloadingInfo' ?
        <CardBody>
          <Row>
          <Col sm="4" md="4">
                <FormGroup>
                  <CustomDropdownInput
                      options={isVehicle}
                      label={"Type"}
                      form={form}
                      id="isVehicle"
                      isDisabled={isDisable}
                    />
                </FormGroup>
            </Col>
            {form?.values?.isVehicle?.value == 2 &&
            <Col sm="4" md="4">
                        <FormGroup>
                          <Label>Sub Module Type</Label>
                          <Select
                            options={subModuleData}
                            onChange={selectSubType}
                            value={subType}
                          />
                        </FormGroup>
            </Col>
            }
            {(form?.values?.isVehicle?.value == 2 && moduleTypeId == 40) &&
            <Col md="4" sm="4">
              <FormGroup>
                <h5>Vehicle Number</h5>
                <InputGroup>
                  <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Vehicle Number" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
              </FormGroup>
            </Col>}
            {(form?.values?.isVehicle?.value == 1) &&
            <Col md="4" sm="4">
              <FormGroup>
                <h5>Vehicle Number</h5>
                <InputGroup>
                  <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Vehicle Number" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
              </FormGroup>
            </Col>}
            {(form?.values?.isVehicle?.value == 3) &&
            <Col md="4" sm="4">
              <FormGroup>
                <h5>Vehicle Number</h5>
                <InputGroup>
                  <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Vehicle Number" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => getGateInInfo(3)}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
              </FormGroup>
            </Col>}

            {tripSheetData.moduleTypeId == 12 || tripSheetData.moduleTypeId == 15 || tripSheetData.moduleTypeId == 21 || tripSheetData.moduleTypeId == 25 || tripSheetData.moduleTypeId == 33 || tripSheetData.moduleTypeId == 34 ? <PurchaseGateIn data={tripSheetData} getUnLoadingData={getUnLoadingData} reset={reset} /> : <>

              {tripSheetData.moduleTypeId == 14 ? <RmWaterGateIn data={tripSheetData} setData={setTripSheetData} getUnLoadingData={getUnLoadingData} setTruckValue={setTruckValue} setIsDisable={setIsDisable} setPoNumber={setPoNumber} reset={reset} /> : null}

              {tripSheetData.moduleTypeId != 14 ? <>
                <Col md="4" sm="4">
                  <FormGroup>
                    {tripSheetData?.DRIVER_PHONE_NO || gateInOutInfoData?.driverMobileNumber ? <>
                      <Label>Phone Number</Label>
                      <Input type="text" placeholder="Enter Phone Number" value={tripSheetData?.DRIVER_PHONE_NO ? tripSheetData?.DRIVER_PHONE_NO : gateInOutInfoData?.driverMobileNumber} disabled /> </> : null
                    }
                    {(phoneNo && !tripSheetData?.DRIVER_PHONE_NO)||(form?.values?.isVehicle?.value == 0) ? <>
                      <CustomTextInput label={"Phone Number"} form={form} id="phoneNo" type="text" /> </> : null
                    }
                  </FormGroup>
                </Col>

                {tripSheetData?.TRIPSHEET_NO || gateInOutInfoData?.tripSheetNumber ?
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>Tripsheet Number</Label>
                      <Input type="text" placeholder="Enter Tripsheet Number" value={tripSheetData?.TRIPSHEET_NO ? tripSheetData?.TRIPSHEET_NO : gateInOutInfoData?.tripSheetNumber} disabled />
                    </FormGroup>
                  </Col> : null
                }

                {(remarks || form?.values?.isVehicle?.value == 0) ?
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
                  <QRCode 
                  value={barcodeData} 
                  id="barcode"
                  size = '100'
                  hidden
                  />
                </Col> }
                {(workingProcess == '0' && poNumber && moduleTypeId != 40) || (poNumber && gateInOutInfoData?.isRedirect == 1 && moduleTypeId != 40) ? <PurchaseOrderInfo purchaseOrderDetails={purchaseOrderDetails} poDetails={poDetails} poType={poType} getPoDetails={getPoDetails} setPoType={setPoType} IsDisableForPo={IsDisableForPo} moduleTypeId={'purchase'} poData={poData} setPoNo={setPoNo} poNo={poNo} checkInvoiceNo={checkInvoiceNo} setInvoiceNo={setInvoiceNo} invoiceNo={invoiceNo} purchaseOrderList={purchaseOrderList} plantCode={plantCode} poTypeData={poTypeData} plantName={plantName} gateInOutInfoData={gateInOutInfoData} isVehicle={form?.values?.isVehicle?.value}/> : null}

                {(poNumber && gateInOutInfoData == '' && moduleTypeId != 40) && workingProcess == '1' ? <PurchaseOrderDetailsInfo tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo || tripSheetData?.DRIVER_PHONE_NO} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={'gate'} loadingAndUnloadingInfoId = {''} gateInOutInfoData={gateInOutInfoId} isVehicle={form?.values?.isVehicle?.value}/> : null}

                {(poNumber && gateInOutInfoData == '' && moduleTypeId != 40) && workingProcess == '2' ? <PurchaseOrderDetailsInfoOCR tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo || tripSheetData?.DRIVER_PHONE_NO} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={'gate'} loadingAndUnloadingInfoId = {''} gateInOutInfoData={gateInOutInfoId} isVehicle={form?.values?.isVehicle?.value}/> : null}

                {(UserDetails.GATE_ID == 19 && moduleTypeId == 40) &&
                <Col sm="12" md="12">
                                <label></label>
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>Attachments :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="Invoice Copy"
                                            id={"shipmentCopy"}
                                            selectedFileName={attachedFiles.shipmentCopy.name}
                                        />
                                    </div>
                                   
                </Col>}

                {purchaseOrderDetails != '' || (gateInOutInfoData != '' && gateInOutInfoData?.moduleTypeId != 38) || (moduleTypeId == 40 && truckValue && (phoneNo ||tripSheetData?.DRIVER_PHONE_NO)) ? <>
                  <Col sm="2" md="2">
                    <label>&nbsp;</label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                      <Button.Ripple outline color="primary" type="button" onClick={reset}>
                        <ArrowLeft size={16} /> Back
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                  <Col sm="10" md="10">
                    <label></label>
                    <FormGroup className="d-flex justify-content-end mb-0">
                      <div className="mr-1">
                        <Button.Ripple outline color="primary" type="button" onClick={() => submit(6)}>
                          <StopCircle size={16} /> Wait OutSide
                        </Button.Ripple>
                      </div>
                      <Button.Ripple color="primary" type="button" onClick={form?.values?.isVehicle?.value == 1 ? handleSubmit : () => submit(1)}>
                        <Check size={16} /> Gate In
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                </> : null
                }
              </> : null}
            </>}
          </Row>
        </CardBody> : screen == 'FGSales' || screen == 'Diesel' ? <>
          {workingProcess == '0' ?
          <PurchaseOrderInfo purchaseOrderDetails={purchaseOrderDetails} poDetails={poDetails} poType={poType} getPoDetails={getPoDetails} setPoType={setPoType} IsDisableForPo={IsDisableForPo} moduleTypeId={'purchase'} poData={poData} setPoNo={setPoNo} poNo={poNo} checkInvoiceNo={checkInvoiceNo} setInvoiceNo={setInvoiceNo} invoiceNo={invoiceNo} purchaseOrderList={purchaseOrderList} plantCode={plantCode} poTypeData={poTypeData} plantName={plantName} gateInOutInfoData={gateInOutInfoData} isVehicle={form?.values?.isVehicle?.value}/> : null }
          {workingProcess == '1' ? <PurchaseOrderDetailsInfo tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={screen} loadingAndUnloadingInfoId={loadingUnloadingInfoId} gateInOutInfoData={gateInOutInfoId} isVehicle={form?.values?.isVehicle?.value}/> : null}

          { workingProcess == '2' ? <PurchaseOrderDetailsInfoOCR tripSheetData={''} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={screen} loadingAndUnloadingInfoId={loadingUnloadingInfoId} gateInOutInfoData={gateInOutInfoId} isVehicle={form?.values?.isVehicle?.value}/> : null}
          {purchaseOrderDetails != '' && workingProcess == 0 ?
            <>
              <Col sm="2" md="2">
                <label>&nbsp;</label>
                <FormGroup className="d-flex justify-content-start mb-0">
                  <Button.Ripple outline color="primary" type="button" onClick={reset}>
                    <ArrowLeft size={16} /> Back
                  </Button.Ripple>
                </FormGroup>
              </Col>
              <Col sm="10" md="10">
                <label></label>
                <FormGroup className="d-flex justify-content-end mb-0">
                  <div className="mr-1">
                    <Button.Ripple outline color="primary" type="button" onClick={() => submit(6)}>
                      <StopCircle size={16} /> Wait OutSide
                    </Button.Ripple>
                  </div>
                  <Button.Ripple color="primary" type="button" onClick={() => submit(1)}>
                    <Check size={16} /> Gate In
                  </Button.Ripple>
                </FormGroup>
              </Col>
            </> : null
          }
        </> :

          <>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Truck No</Label>
                <InputGroup>
                  <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Vehicle Number" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
              </FormGroup>
            </Col>

            {tripSheetData.moduleTypeId == 14 ? <RmWaterGateIn data={tripSheetData} setData={setTripSheetData} getUnLoadingData={getUnLoadingData} setTruckValue={setTruckValue} setIsDisable={setIsDisable} setPoNumber={setPoNumber} reset={reset} /> : null}

            {tripSheetData.moduleTypeId != 14 ? <>
              <Col md="4" sm="4">
                <FormGroup>
                  {tripSheetData?.DRIVER_PHONE_NO || gateInOutInfoData?.driverMobileNumber ? <>
                    <Label>Phone Number</Label>
                    <Input type="text" placeholder="Enter Phone Number" value={tripSheetData?.DRIVER_PHONE_NO ? tripSheetData?.DRIVER_PHONE_NO : gateInOutInfoData?.driverMobileNumber} disabled /> </> : null
                  }
                  {phoneNo && !tripSheetData?.DRIVER_PHONE_NO ? <>
                    <CustomTextInput label={"Phone Number"} form={form} id="phoneNo" type="text" /> </> : null
                  }
                </FormGroup>
              </Col>

              {tripSheetData?.TRIPSHEET_NO || gateInOutInfoData?.tripSheetNumber ?
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Tripsheet Number</Label>
                    <Input type="text" placeholder="Enter Tripsheet Number" value={tripSheetData?.TRIPSHEET_NO ? tripSheetData?.TRIPSHEET_NO : gateInOutInfoData?.tripSheetNumber} disabled />
                  </FormGroup>
                </Col> : null
              }
              {remarks ?
                <Col md="4" sm="4">
                  <FormGroup>
                    <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                  </FormGroup>
                </Col> : null
              }

              {remarks && moduleType != 'Sooji Purchase' ?
                <Col sm="4" md="4">
                  <FormGroup>
                    <CustomDropdownInput
                      options={isWeight}
                      label={"Is Weight"}
                      form={form}
                      id="isWeight"
                    />
                  </FormGroup>
                </Col> : null
              }
              {truckValue &&
                <Col md="2" sm="2">
                  <QRCode 
                  value={barcodeData} 
                  id="barcode"
                  size = '100'
                  hidden
                  />
                </Col> }
              {poNumber ? <PurchaseOrderInfo purchaseOrderDetails={purchaseOrderDetails} poDetails={poDetails} poType={poType} getPoDetails={getPoDetails} setPoType={setPoType} IsDisableForPo={IsDisableForPo} moduleTypeId={'purchase'} poData={poData} setPoNo={setPoNo} poNo={poNo} checkInvoiceNo={checkInvoiceNo} setInvoiceNo={setInvoiceNo} invoiceNo={invoiceNo} purchaseOrderList={purchaseOrderList} plantCode={plantCode} poTypeData={poTypeData} plantName={plantName} gateInOutInfoData={gateInOutInfoData} screen ={screen}/> : null}

              {purchaseOrderDetails != '' || gateInOutInfoData != '' ? <>
                <Col sm="2" md="2">
                  <FormGroup className="d-flex justify-content-start mb-0 mt-2">
                    <Button.Ripple outline color="primary" type="button" onClick={reset}>
                      <ArrowLeft size={16} /> Back
                    </Button.Ripple>
                  </FormGroup>
                </Col>
                <Col sm="10" md="10">
                  <FormGroup className="d-flex justify-content-end mb-0 mt-2">
                    {screen != 'loadingUnloadingInfo' ?
                      <div className="mr-1">
                        <Button.Ripple outline color="primary" type="button" onClick={() => submit(6)}>
                          <StopCircle size={16} /> Wait OutSide
                        </Button.Ripple>
                      </div> : null
                    }
                    <Button.Ripple color="primary" type="button" onClick={handleSubmit}>
                      <Check size={16} /> {screen == 'loadingUnloadingInfo' ? 'Submit' : ' Gate In'}
                    </Button.Ripple>
                  </FormGroup>
                </Col>
              </> : null
              } </> : null}
          </>
      }
    </>
  );
};

export default Purchase;
