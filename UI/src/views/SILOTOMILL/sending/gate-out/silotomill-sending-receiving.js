import { Card, CardBody, FormGroup,Input, Row, Col,Label, Button } from "reactstrap";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl,BASE_URL,tblSTMUrl,SilotMillPOList,silomilllineUrl,silomilllineDetUrl,SaveCaptureImage } from "../../../../urlConstants";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import Uploader from "../../../Uploader";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../../../forms/custom-form";
import { useFormik } from "formik";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { addOrUpdateGateOut,addOrUpdateSTMGateOut, getReceivingGateOutValidationSchema, outSideValidation, uploadFile, uploadIfAnyFileExist,uploadIfAnyFileExist_STM } from "./common";
import { PageHeaderText } from "../../../common/PageHeaderText";
import { statusCode } from "../../../../helper/appHelper";
import { addFileName, addOption } from "../../../common/Utils";
import { getSelectedWbOption, WbTypeSelection, SendingWbTypeSelection, isOutSideWb } from "./wb-type-selection";
import { SendingWeightDetails } from "./sending-weight-details";
import { PickSlipDetails } from "./pickslip-details";
import { HrLine } from "../../../common/HrLine";
//import { LoadingDetails } from "./loading-details";
import { WeightDetails } from "./weight-details";
import PPModal from "../../../../@core/components/ppModel";
import IasRedirect from "../ias-redirect";
import CaptureImage from "../../../CaptureImage";

let SliotoMillSendingReceiving = () => {
  let history = useHistory();
  let [isOpen, setIsOpen] = useState();
  let { showLoader, hideLoader } = useLoader();
  let [dispatchDetails, setDispatchDetails] = useState();
  const [ticketOptions, setTicketdata] = useState([]);
  const [ImgData, setImgData] = useState({});
  const [vehicleStatus, setVehicleStatus] = useState('');

  let { action, location, type, emptyArrivalId, receivingArrivalId, fromPage } = useParams();

  let isSendingSide = location === "sending";
  let isRedirect = action === "redirect";
  let isGateOut = action === "gateout";
  let isViewOnly = action === "view";
  console.log("isViewOnly:"+isViewOnly);

  let isReceivingGateOut = isGateOut && !isSendingSide;
  let isSendingRedirect = isSendingSide && isRedirect;
  let isReceivingIncharge = action == "unload" && !isSendingSide;

  let dispatchId = dispatchDetails && dispatchDetails.id;

  let isTruck = type === "truck";

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
  });
  let values = form.values;

  const onTextChange = (e, key) => {
    form.setValues({
      ...form.values,
      [key]: e.target ? e.target.value : e.value,
     // "NetWeight":(form.values.FirstWeight > 0 ? form.values.FirstWeight : 0)-(form.values.SecondWeight > 0 ? form.values.SecondWeight: 0),
    });
  };
  
  useEffect(() => {
    if (emptyArrivalId) {

      let fdata = {
        type:"Silotomill"
      };
      let fdata1 = {
        ID: emptyArrivalId,
        formType: "QCDET",
        plantIds:[],
        startCount:0
      };
      showLoader();
      Promise.all([
        apiPostMethod(`${apiBaseUrl}emptyVehicleArrival/getById?id=${emptyArrivalId}`),
        apiPostMethod(SilotMillPOList, fdata),
        apiPostMethod(tblSTMUrl, fdata1),
      ])
        .then((response) => {
         
          const [arrData, disData,STMData] = response;
          console.log("isReceivingIncharge:"+isReceivingIncharge);
         // console.log(JSON.stringify(arrData.data.success));
         // console.log("test");
        setVehicleStatus(STMData?.data?.poresults[0]?.VECHICAL_STATUS);
        console.log(JSON.stringify(STMData.data.WeightDetails));
          if (arrData.data.success && disData.data.success) {
            let res = arrData.data.results;
           
            let newVal = {
              ...form.values,
              trailerNo: res.trailerNo,
              id:res.id,
              truckNo: res.truckNo,
              plantId: res.plantId,
              driverNo: res.driverNo,
              zvaNumber: res.zvaNumber,
              WBCalcWeight: res.WBWeight,
              WBBufferPercent:res.WBBufferPercent,
              Plant:res.PLANT_NAME,
              VANumber:res.zvaNumber,
              ZPO_NUMBER:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].ZPO_NUMBER:"",
              PO_LINE_ITEM:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].PO_LINE_ITEM: "",
           
              WheatVariety:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].WheatVariety: "",
StorageLocation:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].StorageLocation: "",
ReceivingPlant:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].ReceivingPlant: "",

Ewaybillcopy:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].Ewaybillcopy: "",
//ReceivingBin:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].ReceivingBin: "",
//BulkSiloNo:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].BulkSiloNo: "",

receivingArrivalId,
emptyVehicleArrivalId:emptyArrivalId,
stmDispatchId:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].Id: "",

FirstWeight :isReceivingGateOut &&   STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].FirstWeight : STMData.data.WeightDetails[0] ? STMData.data.WeightDetails[0].FirstWeight : "",
rFirstWeight : STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].FirstWeight : "",
//SecondWeight :STMData.data.WeightDetails[0] ? STMData.data.WeightDetails[0].SecondWeight: "",
//NetWeight :STMData.data.WeightDetails[0] ? STMData.data.WeightDetails[0].NetWeight: "",
SecondWeight :isReceivingGateOut &&   STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].SecondWeight : STMData.data.WeightDetails[0] ? STMData.data.WeightDetails[0].SecondWeight : "",
rSecondWeight : STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].SecondWeight : "",
NetWeight :isReceivingGateOut &&   STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].NetWeight : STMData.data.WeightDetails[0] ? STMData.data.WeightDetails[0].NetWeight : "",
rNetWeight : STMData.data.UnloadWeightDetails[0] ? STMData.data.UnloadWeightDetails[0].NetWeight : "",

            };
           
            if (disData.data.poresults) {
             
              setPOdata([{ options:disData.data.poresults }]);
            }
            form.setFieldValue("ReceivingBin", {  label: STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].ReceivingBin: "",value:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].ReceivingBin: "" });
            form.setFieldValue("BulkSiloNo", {  label: STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].BulkSiloNo: "",value:STMData.data.DispDetRecords[0] ? STMData.data.DispDetRecords[0].BulkSiloNo: "" });
            form.setValues((val) => ({ ...val, ...newVal }));
          }
        })
        .catch((error) => {
          console.log(error);
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  }, [emptyArrivalId]);
  const onCloseModel = () => {
    setIsOpen(false);
  };
  
  useEffect(() => {
    if (values.containerNo) {
      showLoader();
      apiPostMethod(`${apiBaseUrl}portDispatch/getContainerDetailById?id=${values.containerNo.value}`)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            let res = data.results[0];
            let newData = {
              sendingWbLoadWt: res.wbLoadWt,
              sendingWbEmptyWt: res.wbEmptyWt,
              sendingWbNetWt: res.wbNetWt,
              gunnyWt: res.gunnyWt,
              sendingGunnyLessNetWt: res.gunnyLessNetWt,
              bagType: res.bagType,
           
              sealNumber: res.sealNumber,
              salesInvoiceNo: res.salesInvoiceNo,
              eWayBillCopy: addFileName(res.eWayBillCopy),
              nagaWbCopy: addFileName(res.nagaWbCopy),
              saleInvoiceCopy: addFileName(res.saleInvoiceCopy),
              
            };
            setPOdata([{ options: data.poresults }]);
            form.setValues((val) => ({ ...val, ...newData }));
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  }, [values.containerNo]);

  const SiloToMillDeliveryDetails = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let postData = {
   ...form.values
    };
    if (isReceivingIncharge) {
      postData.ReceivingBin = values.ReceivingBin.value;
      postData.vehicleStatus = statusCode.GATEOUT;
     // postData.vehicleStatus = statusCode.SecondWeight;
    }
    if (isReceivingGateOut)
    {
      postData.FirstWeight= form.values.FirstWeight;
      postData.SecondWeight= form.values.SecondWeight;
      postData.NetWeight= form.values.NetWeight;
      postData.vehicleStatus= statusCode.COMPLETED;
    }
    if(vehicleStatus == 5){
    apiPostMethod(apiBaseUrl + `Sap/SiloToMillController/STMMigoConfirmation/${receivingArrivalId}`)
         .then((response) => {
         const { data } = response;
         if(data.success == true) {
          onReceiverUpdateGateOut(postData)
         }else{
          errorToast(data.message)
         }
         })
         .catch((error) => {
           errorToast("Something went wrong, please try again after sometime");
         })
    }else{
      onReceiverUpdateGateOut(postData)
    }
  }
     

  const onReceiverUpdateGateOut = (postData) => {
    showLoader();
    let onSuccess = () => {
      hideLoader();
      history.push(getBackLink());
    };
    let PrintId="";
    if(isReceivingGateOut){
PrintId=emptyArrivalId;
    }
    addOrUpdateSTMGateOut(postData, onSuccess,PrintId);
  
  };

  function getValidationSchema() {
    let schema = {};
    if (isSendingSide) {
      schema = {
        //lastMileTransporter: validation.required(),
        freightChargesPerTon: validation.required(),
      };
      if (isTruck) {
        schema = {
          ...schema,
          loadedLotNo: validation.required(),
          //loadingVendor: validation.required(),
          loadingChargesPerTon: validation.required(),
        };
      } else {
        schema = {
          ...schema,
          trailerNo: validation.required(),
          pickSlipNo: validation.required(),
          containerNo: validation.required().nullable(),
          pickSlipCopy: validation.required(),
        };
      }
      if (dispatchDetails) {
        schema = {
          pickSlipNo: validation.required(),
        };
        if (isTruck) {
          schema = {
            ...schema,
            sendingWbType: validation.required({ isObject: true }),
            sendingWbName: outSideValidation("sendingWbType"),
            sendingWbSerialNumber: outSideValidation("sendingWbType"),
            pickSlipCopy: validation.required(),
            wbSlipCopy: validation.required(),
            ewayBillCopy: validation.required(),
          };
        } else if (isRedirect) {
          schema.pickSlipCopy = validation.required();
        }
      }
    } else if (isReceivingIncharge) {
      schema = {
        unloadedLotNo: validation.required(),
        unLoadingVendor: validation.required({ isObject: true }),
        unloadingChargePerTon: validation.required(),
      };
    } else if (isReceivingGateOut) {
      schema = getReceivingGateOutValidationSchema();
    }
    return Yup.object().shape(schema);
  }
  const updatePickSlipData = (fileData) => {
    let postData = {
      vehicleArrivalId: emptyArrivalId,
      intraStateSapId: values.pickSlipNo.value,
      pickSlipNo: values.pickSlipNo.label,
      isSendingRedirected: isSendingRedirect ? 1 : 0,
      vehicleStatus: statusCode.INTRANSIT,
      ...fileData,
    };
    if (isTruck) {
      postData = {
        ...postData,
        wbType: values.sendingWbType.label,
        wbName: values.sendingWbName,
        wbSerialNumber: values.sendingWbSerialNumber,
      };
    } else {
      postData = {
        ...postData,
        containerNo: values.containerNo.label,
        irsContainerDetailsId: values.containerNo.value,
      };
    }
    apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/updateInfo?id=${dispatchId}`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
          window.open(BASE_URL+"/#/Slip:"+emptyArrivalId, "", "width=900,height=650")
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };
  const onRejectGateOut = () =>{
   
    apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/RejectInfo/`+emptyArrivalId)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  }

  const onGateOutDetails = () => {

    if (values.ZPO_NUMBER == '' || values.ZPO_NUMBER == undefined) {
      errorToast("Please Select PO Number..! ",);
      return false;
    }else if (values.PO_LINE_ITEM == '' || values.PO_LINE_ITEM == undefined) {
      errorToast("Please Select Correct PO Number or Line Item..! ",);
      return false;
    }else if (values.BulkSiloNo.label== '' || values.BulkSiloNo.label == undefined) {
      errorToast("Please Select Bulk Silo No..! ",);
      return false;
    }else if (values.ReceivingBin.label== '' || values.ReceivingBin.label == undefined) {
      errorToast("Please Select Receiving Bin No..! ",);
      return false;
    }
    
    let UploadVaNumber=form.values ? form.values.zvaNumber: "";
    if (!form.isValid) {
     
      form.setSubmitting(true);
    
      form.validateForm();
     
      return;
    }
    let {cEwaybillcopy} = ImgData;
    showLoader();

    let postdata = new FormData();
    let Folder="IAS";
    let SubFolder="Loading_WH_Incharge";
    let FileSaveUrl="";
    if(cEwaybillcopy){
      postdata.append("image[]", cEwaybillcopy);
       Folder="IAS";
       SubFolder="Loading_WH_Incharge";
      FileSaveUrl=SaveCaptureImage;

      apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            values.Ewaybillcopy = data.files[0].updname;
            gateOutOrAddLoadingVendor(values);
          } else {
            errorToast(data.files[0].orgname + " file format is not supported ");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });

      }else{
 
    let filesToUpload = fileKeysToUpload();
  
    //let filesToUpload = fileKeysToUpload();
    let UploadArray=[
      emptyArrivalId,
      UploadVaNumber,
      Folder,
      SubFolder
    ]
    uploadIfAnyFileExist_STM(UploadArray, values, filesToUpload, (fileData) => {
      if (!fileData) {
        hideLoader();
      } else {
        if (dispatchId) {
         // updatePickSlipData(fileData); testing cmd
        } else {
         
          gateOutOrAddLoadingVendor(fileData);
        }
      }
    });
  }
  };

  const fileKeysToUpload = () => {
    let fileKeys = ["Ewaybillcopy"].filter((a) => values[a] && values[a].type);
    return fileKeys;
  };

  const gateOutOrAddLoadingVendor = (fileUrls) => {
    //alert("4")
    let postData = {
    };
    if (fileUrls) {
      postData = {
        ...postData,
        ...fileUrls,
      };
    }
   // console.log(JSON.stringify(values));
    postData = {
      ...postData,
      truckNo: values.truckNo,
      Plant: values.plantId,
      driverNo: values.driverNo,
      VANumber: values.zvaNumber,
      ZPO_NUMBER: values.ZPO_NUMBER,
      PO_LINE_ITEM: values.PO_LINE_ITEM,
      ReceivingPlant: values.ReceivingPlant,
      StorageLocation: values.StorageLocation,
      WheatVariety: values.WheatVariety,
      ReceivingBin: values.ReceivingBin.label,
      BulkSiloNo: values.BulkSiloNo.label,
      vehicleStatus:2,
      VehicleArrivalId:values.id,
     
    };
    console.log(JSON.stringify(postData));
   // return false;
    apiPostMethod(`${apiBaseUrl}SilotoMill/addInfo`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  }; 
  let isOutSide = isOutSideWb(form); // form.values.wbType && form.values.wbType.value === "2";
  let disabled = !!dispatchDetails || isReceivingIncharge || isViewOnly;

  const getBackLink = () => {
    if (fromPage) {
      return `/${fromPage}`;
    }
    if (isReceivingIncharge) return `/UL`;
    else if (isReceivingGateOut) return "/VA";
    else return "/IASRPR";
  };
  const onGateOut = () => {
   
  // alert(isSendingSide);return false;

    if (!isSendingSide) {
      SiloToMillDeliveryDetails(); //testing cmd
    }
    else {
     //alert("in gate out details")
      onGateOutDetails(); //uncomm 
    }
  };
  const addFileIfExist = (label, id) => {
    return (
      values[id] && (
        <Col md="4" sm="12">
          <CustomUploader form={form} label={label} id={id} isReadOnly={true} />
        </Col>
      )
    );
  };

  const getButtonText = () => {
    if (isRedirect) {
      return "Redirect";
    } else if (isSendingSide) {
      if (action == "Loadingsilo") {
        return "Load";
      } else if (action === "addpickslip") {
        return "Add Pickslip";
      } else if (action === "updatelot") {
        return "Update lot";
      }
      return "Gateout";
    } else {
      if (isReceivingGateOut) {
        return "Gateout";
      }
      return "Submit";
    }
  };
  const getTitle = () => {
    if (isSendingSide) {
      if (isTruck) {
        if (isRedirect) {
          return "Loading WH Incharge (Redirect)";
        }
        return "Loading WH Incharge";
      } else {
        if (isRedirect) {
          return "Loading Container Dest (Redirect)";
        }
        return "Loading Container Dest (Gateout)";
      }
    } else {
      if (isReceivingGateOut) {
        if (type === "Truck") {
          return "Gate Out Truck- IRS";
        }
        return "Gate Out Trailer- IRS";
      } else {
        return "Unloading WH Incharge";
      }
    }
    // return "Loading - WH Incharge";
  };
  const onRedirectClick = () => {
    setIsOpen(true);
  };


  const [poOptions, setPOdata] = useState([]);
  const [poLineOptions, setPOLinedata] = useState([]);
  const onPOChange = (e) => {
    const { vehicleType, mkey, value } = e;
    const sType ="silotomill";
    //console.log(JSON.stringify(form));
    form.setValues({
     ...form.values,
      ZPO_NUMBER: value,
    
    });
   // console.log(JSON.stringify(form));
    //selectedPo.current = value;
    //setVehicleType(vehicleType);
    onFetchPOLine(value, sType);
  };
  const onFetchPOLine = (pono,screentype) => {
    let fdata = { PO_NUMBER: pono, type: screentype };
    apiPostMethod(silomilllineUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOLinedata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onLineItemchange = (e) => {
    const { value } = e;
    
    
   
    onFetchLineDet(value);
  };
  const onFetchLineDet = (lineItem) => {
    //showLoader();
    const { ZPO_NUMBER } = form.values;
   
    let fdata = {
      PO_number: ZPO_NUMBER,
      lineItem: lineItem,
      type: "SILOTOMILL_LINEDET",
    };
    apiPostMethod(silomilllineDetUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const { results } = data;
         /* form.setValues({
            ...form.values,
            
           
           });*/
           form.setValues({
            ...form.values,
            PO_LINE_ITEM: lineItem,
            ReceivingPlant:results[0].ReceivingPlant,
            StorageLocation:results[0].StorageLocation,
            WheatVariety:results[0].WheatVariety,
           
           });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
     
  };

  console.log("form-1")
  console.log(JSON.stringify(form));
  return (
    <div>
      <PageHeaderText id={values.zvaNumber} title={`${getTitle()}`} />
      <Card>
        <CardBody>
          <Row>
            {/*<LoadingDetails form={form} disabled={disabled} isTruck={isTruck} />*/}
            <>
      <Col md="4" sm="12">
        
          <CustomTextInput label={"Vehicle No"} maxlength={10} form={form} id="truckNo" disabled />
       
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Plant"} form={form} id="Plant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver No"} form={form} id="driverNo" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"VA Number"} form={form} id="VANumber" disabled />
      </Col>
      {!isReceivingGateOut && <Col md="4" sm="12">
      <Label>PO Number</Label>
      <Select
              options={poOptions}
             
              className="react-select"
              classNamePrefix="select"
              isDisabled={disabled}
              value={{ label: form.values.ZPO_NUMBER, value: form.values.ZPO_NUMBER }}
              onChange={(e) => onPOChange(e)}
            />
      </Col>}
      {!isReceivingGateOut &&<Col md="4" sm="12">
      <Label>PO Line Item</Label>
      {!form.values.ZPO_NUMBER ? (
              <Input type="text" disabled={true} placeholder={"Select the PO Number"} />
            ) : (
              <Select
                className="react-select"
                classNamePrefix="select"
                options={poLineOptions}
                isDisabled={disabled}
                value={{ label: form.values.PO_LINE_ITEM, value: form.values.PO_LINE_ITEM }}
                onChange={(e) => onLineItemchange(e, "PO_LINE_ITEM")}
              />
            )}
      </Col>}
      {!isReceivingGateOut &&<Col md="4" sm="12">
        <CustomTextInput label={"Wheat Variety"} form={form} id="WheatVariety" disabled />
      </Col>}
      {!isReceivingGateOut && <Col md="4" sm="12">
        <CustomTextInput label={"Storage Location"} form={form} id="StorageLocation" disabled />
      </Col>}
      {!isReceivingGateOut && <Col md="4" sm="12">
        <CustomDropdownInput
          isDisabled={disabled}
          label={"Bulk Silo No"}
          url={`${apiBaseUrl}master/getBulkSiloNo`}
          form={form}
          
          id="BulkSiloNo"
        />
      </Col>}
      {!isReceivingGateOut && <Col md="4" sm="12">
        <CustomDropdownInput
         
          label={"Receiving Bin"}
          url={`${apiBaseUrl}master/getReceivingBin_1`}
          form={form}
          isDisabled={isViewOnly}
          id="ReceivingBin"
        /> 
      </Col>}
      {!isReceivingGateOut &&<Col md="4" sm="12">
        <CustomTextInput label={"Receiving Plant"} form={form} id="ReceivingPlant" disabled />
      </Col>}
      {console.log("check")}
      {console.log(JSON.stringify(form))}
      {isViewOnly &&
      
      <Col md="4" sm="12">
                            
  <Uploader isReadOnly={isViewOnly} label={"Eway Bill Copy"} selectedFileName={form.values.Ewaybillcopy} />

{false && <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"cEwaybillcopy"} />}
                          </Col>}
                          {(isReceivingGateOut || isViewOnly) && <HrLine header={"Sending WB Details"} />}
      {(isReceivingGateOut || isViewOnly) && 



      <Col md="4" sm="12">
                <FormGroup>
                {isReceivingGateOut && <Label for="cityMulti">Loaded Weight</Label>}
                {!isReceivingGateOut && <Label for="cityMulti">Empty Weight</Label>}
                  <Input type="text" id="FirstWeight"
                   value={form.values.FirstWeight} 
                   disabled={form.values.FirstWeight?true:false}
                   onChange={(e) => onTextChange(e, "FirstWeight")}
                   placeholder=""  />
                </FormGroup>
              </Col>}
 
              {(isReceivingGateOut || isViewOnly) &&  <Col md="4" sm="12">
                <FormGroup>
                  
                  {isReceivingGateOut && <Label for="cityMulti">Empty Weight</Label>}
                  {!isReceivingGateOut && <Label for="cityMulti">Loaded Weight</Label>}
                  <Input type="text" id="SecondWeight" value={form.values.SecondWeight}
                   onChange={(e) => onTextChange(e, "SecondWeight")}
                   disabled={form.values.SecondWeight?true:false}
                  placeholder=""  />
                </FormGroup>
              </Col>}
 
              {(isReceivingGateOut || isViewOnly) &&   <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Net Weight</Label>
                  <Input type="text" id="NetWeight" value={form.values.NetWeight}
                   onChange={(e) => onTextChange(e, "NetWeight")}
                   disabled={form.values.NetWeight?true:false}
                  placeholder="Net Weight"  />
                </FormGroup>
              </Col>}
              { isViewOnly && <HrLine header={"Receiving WB Details"} />}
             {isViewOnly && <Col md="4" sm="12">
                <FormGroup>
                <Label for="cityMulti">Loaded Weight</Label>
                  <Input type="text" id="rFirstWeight"
                   value={form.values.rFirstWeight} 
                   disabled={form.values.rFirstWeight?true:false}
                   onChange={(e) => onTextChange(e, "rFirstWeight")}
                   placeholder=""  />
                </FormGroup>
              </Col>}
             
              {isViewOnly && <Col md="4" sm="12">
                <FormGroup>
                <Label for="cityMulti">Emty Weight</Label>
                  <Input type="text" id="rSecondWeight"
                   value={form.values.rSecondWeight} 
                   disabled={form.values.rSecondWeight?true:false}
                   onChange={(e) => onTextChange(e, "rSecondWeight")}
                   placeholder=""  />
                </FormGroup>
              </Col>}
             
              {isViewOnly && <Col md="4" sm="12">
                <FormGroup>
                <Label for="cityMulti">Net Weight</Label>
                  <Input type="text" id="rNetWeight"
                   value={form.values.rNetWeight} 
                   disabled={form.values.rNetWeight?true:false}
                   onChange={(e) => onTextChange(e, "rNetWeight")}
                   placeholder=""  />
                </FormGroup>
              </Col>}
             
            
     
    </>
            
          
          </Row>
          <Row>
            <Col sm="12" className="mt-2">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <div className="mr-1">
                  
                  <Button.Ripple outline color="secondary" tag={Link} to={getBackLink()} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  {!isViewOnly && (
                    <Button.Ripple color="primary" type="button" id="GateOutButton" onClick={(e) => onGateOut()}>
                      {getButtonText()}
                    </Button.Ripple>
                  )}
                </div>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
      
    </div>
  );
};

export default SliotoMillSendingReceiving;
