import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../../../forms/custom-form";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardBody, CardHeader, InputGroup } from "reactstrap";
import { ArrowLeft, Check, Plus, Search, StopCircle } from "react-feather";
// import { RefreshBlock1 } from "../common/RefreshBlock1";
import { errorToast, ShowToast } from "../../../../helper/appHelper";
import { apiPostMethod } from "@helpers/axiosHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import Select from 'react-select'
import { apiGetMethod } from "../../../../helper/axiosHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import PurchaseOrderInfo from "../../../Info/PurchaseOrderInfo";
import RmWaterGateIn from "../../../RM/Unloading/rmWater/RmWaterGateIn";
import PurchaseGateIn from "../../../VA/PurchaseGateIn";
import QRCode from "react-qr-code";
import Uploader from "../../../Uploader";
import PurchaseOrderDetailsInfo from "../../../Info/PurchaseOrderDetailsInfo";
import PurchaseOrderDetailsInfoOCR from "../../../Info/PurchaseOrderDetailsInfoOCR";

const ServiceEntryScreen = ({ screen, getUnLoadingData, loadingUnloadingModuleTypeId, gateInOutInfoId, setData, setTruckNo, disabled, loadingUnloadingReset, loadingUnloadingInfoId, dieselReset }) => {

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
      apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails?.USERID}`)
          .then((response) => {
              const data = response.data;
              setWorkingProcess(data?.workingProcess)
              if (data.success == 1) { 
                  setIsVehicle([
                      { value: 1, label: 'Vehicle' },
                      { value: 0, label: 'Hand Carry' }
                  ]);
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
  const selectSubType = (e) => {
    console.log(e)
    setSubType(e)
    let subModuleType = e.value
    setSubModuleTypeId(subModuleType)
    setModuleType(e.moduleType);
    setModuleTypeId(e.moduleTypeId)
  }
 

  useEffect(() => {
    if(form?.values?.isVehicle?.value == 0){
      getGateInInfo('ByHand')
    }
  }, [form?.values?.isVehicle?.value == 0])

  const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });


 
  return (
        <Card>
        <CardBody>
        <Row>
             <Col md="12" sm="12">
                <h4 className="text-primary"><u>Service Entry Screen</u></h4><br />
            </Col>
          <Col sm="4" md="4">
                <FormGroup>
                  <CustomDropdownInput
                      options={isVehicle}
                      label={"Type"}
                      form={form}
                      id="isVehicle"
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
              </FormGroup>
            </Col>}
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
            {(poNumber && gateInOutInfoData == '' && moduleTypeId != 40) && workingProcess == '1' ? <PurchaseOrderDetailsInfo tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={'service'} loadingAndUnloadingInfoId = {''}/> : null}

            {(poNumber && gateInOutInfoData == '' && moduleTypeId != 40) && workingProcess == '2' ? <PurchaseOrderDetailsInfoOCR tripSheetData={tripSheetData} truckValue={truckValue} remarks={form.values.remarks} phoneNo={form.values.phoneNo} Type={form?.values?.isVehicle?.value} subModuleTypeId={subModuleTypeId} screen={'service'} loadingAndUnloadingInfoId = {''}/> : null}
            </Row>
            <br></br>
            <br></br>
            <br></br>
         </CardBody>
         </Card>
    )}          

export default ServiceEntryScreen;
