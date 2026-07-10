import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
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

const Purchase = ({ getUnLoadingData }) => {

  useEffect(() => {
    getUserPlant('')
    getUserModuleAccess()
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

  const [userModuleAccessData, setUserModuleAccessData] = useState([]);

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

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

  const getGateInInfo = () => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue}/0/0/0/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue}/0/0/0/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setIsDisable(true)
          setGateInOutInfoData(data.results[0])
          getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
          setPoNumber(true)
          setRemarks(true)
        }
        else if (data.success == false) {
          getTripsheetDetailsForFG()
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getTripsheetDetailsForFG = () => {
    showLoader();
    const vehicleNo = { Vehicle_Number: truckValue, userInfoId: UserDetails.USERID, isMovement: userPlant[0].isMovement }
    console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, vehicleNo)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          if ((data.results[0].loadingAndUnloadingInfoId > 0 && data.results[0].statusId == 0 && data.results[0].moduleTypeId != 14) && (data.results[0].isGateIn == 0 || data.results[0].isGateIn == 1)) {
            if (data.results[0].isRedirect == 1) {
              confirmDialog({
                title: `<h5><strong class="text-white">Not made into Redirct Plant</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            } else {
              confirmDialog({
                title: `<h5><strong class="text-white">Vehicle Already In</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
          } else {
            setIsDisable(true)
            setTripSheetData(data.results[0])
            setPoNumber(true)
            setRemarks(true)
          }
        }
        else if (data.success == false) {
          if (truckValue == '') {
            errorToast("Please Enter Vehicle No")
          }
          else {
            setIsDisable(true)
            setPoNumber(true)
            setRemarks(true)
            setPhoneNo(true)
            setTripSheetData('')
          }
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

  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [poType, setPoType] = useState('')
  const [plantCode, setPlantCode] = useState('')
  const [moduleType, setModuleType] = useState('')

  const getPoDetails = (type) => {
    showLoader();
    const poNumber = { poNumber: poNo, moduleTypeId: 12 }
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {

          // let plant = data.data[0].PO_LINEITEM.map((item) => item.PLANT);
          // let userPlantCode = UserDetails.plantids.filter((item, index) => plant.indexOf(item) == index)
          // let poLineItem = data.data[0].PO_LINEITEM.filter((item) => item.PLANT == userPlantCode[0]);

          let plant = data.data[0].PO_LINEITEM.map((item) => item.PLANT);
          
          const userPlant = [];
          plant.forEach((item, index) => {
            let data1 = UserDetails.plantids.filter((plant) => plant == item)
            if (data1 != '') {
              userPlant.push(data1[0])
            }
          });
          
          let poLineItem = data.data[0].PO_LINEITEM.filter((item) => item.PLANT == userPlant[0]);

          if (poLineItem != '') {
            if (data.data[0].TYPE == 'ZMLF' || data.data[0].TYPE == 'ZMLU') {
              confirmDialog({
                title: `<h5><strong class="text-white">PO Type not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
              setPoDetails([])
              setPoType('')
            }
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
                setModuleType(data.data[0].TYPE)

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
                    description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : null,
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
                console.log(purchaseOrderDetails);
              }
            }
          } else {
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
      phoneNo: validation.number({ min: 10, max: 10 })
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
        title: `<h5><strong class="text-white">Please Check Plant Code</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    } else if (purchaseOrderList.length > 0) {
      const checkPoNo = purchaseOrderList.filter((poData) => poData.invoiceNo == invoiceNo);
      if (checkPoNo != '') {
        confirmDialog({
          title: `<h5><strong class="text-white">PO Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
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
    if (gateInOutInfoData != '') {
      updateVehicleStatus(moduleStatusId)
    }
    else {
      gateIn(moduleStatusId)
    }
  }

  const addLoadingUnloadingInfo = () => {
    if (!form.isValid && phoneNo) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;

    const FrmData = {
      movementTypeId: 2,
      moduleTypeId: moduleTypeId,
      truckNo: truckValue ? truckValue : null,
      masterPlantId: purchaseOrderList[0].plantCode,
      remarks: formData.remarks ? formData.remarks : null,
      phoneNo: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : gateInOutInfoData != '' ? gateInOutInfoData.driverMobileNumber : formData.phoneNo,
      tripSheetNo: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : gateInOutInfoData != '' ? gateInOutInfoData.tripSheetNumber : null,
      statusId: 1,
      userInfoId: UserDetails.USERID,
      purchaseOrderDetails: purchaseOrderDetails,
    };

    console.log(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
    apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          getUnLoadingData()
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
      masterPlantId: purchaseOrderList[0].plantCode,
      userInfoId: UserDetails.USERID,
      movementType: "Unloading",
      moduleType: moduleTypeId == 12 ? 'S&S Purchase' : moduleTypeId == 15 ? 'Sooji Purchase' : 'PM - Purchase',
      vehicleNo: truckValue,
      driverMobileNumber: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : gateInOutInfoData != '' ? gateInOutInfoData.driverMobileNumber : formData.phoneNo,
      tripSheetNumber: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : gateInOutInfoData != '' ? gateInOutInfoData.tripSheetNumber : null,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks ? formData.remarks : null,
      isWeight: isWeight != '' ? 1 : 0,
      purchaseOrderDetails: purchaseOrderData,
    };

    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
          confirmDialog({
            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
          })
          reset()
          getUnLoadingData()
          addLoadingUnloadingInfo()
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
      gateInOutInfoId: gateInOutInfoData.gateInOutInfoId,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks,
      userInfoId: UserDetails.USERID
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
  }

  const [userPlant, setUserGate] = useState([])
  const [plantName, setPlantName] = useState('')

  const getUserPlant = (plantCode) => {
    console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
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

  const [poTypeData, setPoTypeData] = useState([])
  const [checkIsWeight, setCheckIsWeight] = useState([])
  const [moduleTypeId, setModuleTypeId] = useState('')

  const getPoType = (poType) => {
    console.log(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
    apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setPoTypeData(data.results[0])
          setModuleTypeId(data.results[0].moduleTypeId)
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

  return (
    <>
      <CardBody>
        <Row>
          <Col md="4" sm="4">
            <FormGroup>
              <h5>Vehicle Number</h5>
              <InputGroup>
                <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Vehicle Number" onChange={(e) => setTruckValue(e.target.value)} value={truckValue} disabled={isDisable} maxLength={10} />
                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo}>
                  <Search size={20} />
                </Button>
              </InputGroup>
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

            {poNumber ? <PurchaseOrderInfo purchaseOrderDetails={purchaseOrderDetails} poDetails={poDetails} poType={poType} getPoDetails={getPoDetails} setPoType={setPoType} IsDisableForPo={IsDisableForPo} moduleTypeId={'purchase'} poData={poData} setPoNo={setPoNo} poNo={poNo} checkInvoiceNo={checkInvoiceNo} setInvoiceNo={setInvoiceNo} invoiceNo={invoiceNo} purchaseOrderList={purchaseOrderList} plantCode={plantCode} poTypeData={poTypeData} plantName={plantName} gateInOutInfoData={gateInOutInfoData} /> : null}

            {purchaseOrderDetails != '' || gateInOutInfoData != '' ? <>
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
            } </> : null}
        </Row>
      </CardBody>
    </>
  );
};

export default Purchase;