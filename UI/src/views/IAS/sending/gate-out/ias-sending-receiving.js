import { Card, CardBody, FormGroup, Input, Row, Col, Button, Label } from "reactstrap";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl, BASE_URL, SaveCaptureImage, uploadandSaveImageUrl,ulUrl} from "../../../../urlConstants";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../../../forms/custom-form";
import { Formik, useFormik } from "formik";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { addOrUpdateGateOut, getReceivingGateOutValidationSchema, outSideValidation, uploadFile, uploadIfAnyFileExist } from "./common";
import { PageHeaderText } from "../../../common/PageHeaderText";
import { statusCode } from "../../../../helper/appHelper";
import { addFileName, addOption } from "../../../common/Utils";
import { getSelectedWbOption, WbTypeSelection, SendingWbTypeSelection, isOutSideWb } from "./wb-type-selection";
import { SendingWeightDetails } from "./sending-weight-details";
import { BagWeightDetails } from "./bag_sending-weight-details";
import { PickSlipDetails } from "./pickslip-details";
import { HrLine } from "../../../common/HrLine";
import { LoadingDetails } from "./loading-details";
import { WeightDetails } from "./weight-details";
import PPModal from "../../../../@core/components/ppModel";
import IasRedirect from "../ias-redirect";
import CaptureImage from "../../../CaptureImage";
import { keys } from "lodash";

let IasSendingReceiving = () => {
  let history = useHistory();
  const [poLineOptions, setPOLinedata] = useState([]);
  const [poData, setPoData] = useState({});
  let [isOpen, setIsOpen] = useState();
  let { showLoader, hideLoader } = useLoader();
  let [dispatchDetails, setDispatchDetails] = useState();
  const [ticketOptions, setTicketdata] = useState([]);
  const [ImgData, setImgData] = useState({});
  const [SiloPlantID, setSilo] = useState('');
  const [RvNumbers, setRvNumber] = useState('');
  const [RecLocation, setRecevingLocation] = useState('');
  const[lotoption,setlotoption] = useState([]); 
  const [vehicleStatus, setVehicleStatus] = useState('');
  let { action, location, type, emptyArrivalId, receivingArrivalId, fromPage } = useParams();
  ///ias/${actionTxt}/sending/truck/${id}/IASSWI
  
  let isSendingSide = location === "sending";
  let isRedirect = action === "redirect";
  let isGateOut = action === "gateout";
  let isViewOnly = action === "view";

  let isReceivingGateOut = isGateOut && !isSendingSide;
  let isSendingRedirect = isSendingSide && isRedirect;
  let isReceivingIncharge = action == "unload" && !isSendingSide;

  let dispatchId = dispatchDetails && dispatchDetails.id;

  let isTruck = type === "truck";

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
  });
  let values = form.values;
  //console.log("venkat");
  useEffect(() => {
    if (emptyArrivalId) {
      showLoader();
      Promise.all([
        apiPostMethod(`${apiBaseUrl}emptyVehicleArrival/getById?id=${emptyArrivalId}`),

        apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/getByArrivalId/${emptyArrivalId}`),
      ])
        .then((response) => {
          const [arrData, disData] = response;
          console.log("disData.data", disData.data.results);          
          console.log("VehicleStatus	", disData.data.VehicleStatus);          
          setVehicleStatus(disData.data.VehicleStatus)
          if (arrData.data.success && disData.data.success) {
            let res = arrData.data.results;
            let SenderDetails = disData.data.results && disData.data.results.pickSlipDetails;
            
            // if (disData.data.RecGateOut && disData.data.RecGateOut[0]){
            //     SenderDetails =disData.data.RecGateOut && disData.data.RecGateOut[0];    
            // }         
            
            console.log("SenderDetails", SenderDetails);
            let SiloPlantID = SenderDetails['receive_plant'];
            let ReceivingLocation  = SenderDetails['receivingStorageLocation'];
            let RvNumber = res['zvaNumber'];
            setSilo (SiloPlantID);
            setRecevingLocation(ReceivingLocation);
            setRvNumber(RvNumber);
          
            

            let newVal = {
              ...form.values,
              trailerNo: res.trailerNo,
              id: res.id,
              truckNo: res.truckNo,
              plantId: res.plantId,
              driverNo: res.driverNo,
              zvaNumber: res.zvaNumber,
              WBCalcWeight: res.WBWeight,
              WBBufferPercent: res.WBBufferPercent,

              /*
              Btype: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagTypeName : "",
              Btype2: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagType2Name : "",
              Btype3: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagType3Name : "",
              NBags: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags : "",
              NBags2: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags2 : "",
              NBags3: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags3 : "",
              gunnyWt: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].GunnyWt : "",
              sendingGunnyLessNetWt: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].GunnyLessNetWt : "",
              */

              Btype: SenderDetails && SenderDetails.bagTypeName ? SenderDetails.bagTypeName : "",
              Btype2: SenderDetails && SenderDetails.bagType2Name ? SenderDetails.bagType2Name : "",
              Btype3: SenderDetails && SenderDetails.bagType3Name ? SenderDetails.bagType3Name : "",

              bagType: SenderDetails && SenderDetails.bagTypeName ? SenderDetails.bagTypeName : "",
              bagType2: SenderDetails && SenderDetails.bagType2Name ? SenderDetails.bagType2Name : "",
              bagType3: SenderDetails && SenderDetails.bagType3Name ? SenderDetails.bagType3Name : "",

              NBags: SenderDetails && SenderDetails.no_bag ? SenderDetails.no_bags : "",
              NBags2: SenderDetails && SenderDetails.no_bag2 ? SenderDetails.no_bags2 : "",
              NBags3: SenderDetails && SenderDetails.no_bag3 ? SenderDetails.no_bags3 : "",
              gunnyWt: SenderDetails && SenderDetails.gunnyWt ? SenderDetails.gunnyWt : "",
              sendingGunnyLessNetWt: SenderDetails && SenderDetails.gunnyLessNetWt ? SenderDetails.gunnyLessNetWt : "",

              bagCuttingType: SenderDetails && SenderDetails.bagCuttingTypeName ? SenderDetails.bagCuttingTypeName : "",
              bagCuttingVendor: SenderDetails && SenderDetails.bagCuttingVendorName ? SenderDetails.bagCuttingVendorName : "",
              BagCuttingCharges: SenderDetails && SenderDetails.L1_CuttingCharges ? SenderDetails.L1_CuttingCharges : "",
              
              bagCuttingType2: SenderDetails && SenderDetails.bagCuttingTypeName2 ? SenderDetails.bagCuttingTypeName2 : "",
              bagCuttingVendor2: SenderDetails && SenderDetails.bagCuttingVendorName2 ? SenderDetails.bagCuttingVendorName2 : "",
              BagCuttingCharges2: SenderDetails && SenderDetails.L1_CuttingCharges2 ? SenderDetails.L1_CuttingCharges2 : "",

              bagCuttingType3: SenderDetails && SenderDetails.bagCuttingTypeName3 ? SenderDetails.bagCuttingTypeName3 : "",
              bagCuttingVendor3: SenderDetails && SenderDetails.bagCuttingVendorName3 ? SenderDetails.bagCuttingVendorName3 : "",
              BagCuttingCharges3: SenderDetails && SenderDetails.L1_CuttingCharges3 ? SenderDetails.L1_CuttingCharges3 : "",
            };
            // console.log("ReceivingBin",{value:disData.data.results.ReceivingBin_id,label:disData.data.results.ReceivingBin_Name});

            disData.data.results !== null && form.setFieldValue("ReceivingBin",{value:disData.data.results.ReceivingBin_id,label:disData.data.results.ReceivingBin_Name});
            
            
            //if (disData.data.results)

            if (disData.data.results && action != "updatelot") {
              setDispatchDetails(disData.data.results);
              let { lastMileTransporter, loadingVendor, loadedLotNo, pickSlipNo, wbType, driverNo, containerNo, ...rest } = disData.data.results;

              let pickOp = addOption(pickSlipNo, rest.intraStateSapId);
              let contNo = addOption(containerNo, rest.irsContainerDetailsId);
              newVal = {
                ...newVal,
                ...rest,
                lastMileTransporter: addOption(lastMileTransporter),
                loadingVendor: addOption(loadingVendor),
                loadedLotNo: (loadedLotNo && loadedLotNo.value) ? addOption(loadedLotNo) : loadedLotNo,
                unloadingChargePerTon: rest.pickSlipDetails.Unloading_Charges,//added unloading Lot Charges 02-09-2022 ARUL
                unLoadingVendor: rest.pickSlipDetails.unloading_vendor,
                unLoadingVendorName: rest.pickSlipDetails.unloading_name,
                extPickSlipNo: pickOp,
                pickSlipDetails: rest.pickSlipDetails,
                pickSlipNo: pickOp,
                //sendingWbType: getSelectedWbOption(wbType),// checking
                sendingWbName: rest.wbName,
                sendingWbSerialNumber: rest.wbSerialNumber,

                pickSlipCopy: addFileName(rest.pickSlipCopy),
                wbSlipCopy: addFileName(rest.wbSlipCopy),
                ewayBillCopy: addFileName(rest.ewayBillCopy),

                // unLoadingVendor: addOption(rest.unLoadingVendor),

                containerNo: contNo,
                extContainerNo: contNo,
              };


              if (disData.data.RecGateOut && disData.data.RecGateOut[0] && !isTruck){ 
                // Added on 31-08-2022 for Container
                newVal = {
                  ...newVal,
                  ...rest,
              Btype: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagTypeName : "",
              Btype2: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagType2Name : "",
              Btype3: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].bagType3Name : "",
              NBags: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags : "",
              NBags2: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags2 : "",
              NBags3: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].no_bags3 : "",
              gunnyWt: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].GunnyWt : "",
              gunnyLessNetWt: disData.data.RecGateOut && disData.data.RecGateOut[0] ? disData.data.RecGateOut[0].GunnyLessNetWt : "",
                }
              }

              if (isRedirect) {
                newVal.pickSlipCopy = "";
              }
              console.log("Set WB");
              console.log(JSON.stringify(disData));
              if (disData.data.OwnWBID && disData.data.OwnWBID > 0) {
                newVal = {
                  ...newVal,
                  //wbType: getSelectedWbOption("OWN WB"),
                  sendingWbType: getSelectedWbOption("OWN WB"),
                }


              } else {
                newVal = {
                  ...newVal,
                  //wbType: getSelectedWbOption("OWN WB"),
                  sendingWbType: getSelectedWbOption("OUTSIDE WB"),
                }

              }

              if (disData.data.ReceivingWBID && disData.data.ReceivingWBID > 0) {
                newVal = {
                  ...newVal,
                  //wbType: getSelectedWbOption("OWN WB"),
                  wbType: getSelectedWbOption("OWN WB"),

                }
                // form.setFieldValue("sendingWbType", {  label: 'OWN WB',value:1 });

                console.log(JSON.stringify(form));
                console.log("Set receiving WB -END");
                //setTicketdata([{ options: disData.data.ReceivingTicketDetails }]);
                // setTicketdata([{ label: disData.data.ReceivingTicketDetails[0].label }]);
                form.setFieldValue("wbTicketNumber", {
                  label: disData.data.ReceivingTicketDetails[0].label,
                  value: disData.data.ReceivingTicketDetails[0].value,
                  firstWeight: disData.data.ReceivingTicketDetails[0].firstWeight,
                  netWeight: disData.data.ReceivingTicketDetails[0].netWeight,
                  secondWeight: disData.data.ReceivingTicketDetails[0].secondWeight,

                });
              } else {
                newVal = {
                  ...newVal,
                  //wbType: getSelectedWbOption("OWN WB"),
                  wbType: getSelectedWbOption("OUTSIDE WB"),
                }

              }
            }
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
  //console.log('zzzzzzzzzzzz');
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
              bagType2: res.bagType2,
              bagType3: res.bagType3,

              sealNumber: res.sealNumber,
              salesInvoiceNo: res.salesInvoiceNo,
              eWayBillCopy: addFileName(res.eWayBillCopy),
              nagaWbCopy: addFileName(res.nagaWbCopy),
              saleInvoiceCopy: addFileName(res.saleInvoiceCopy),

            };

            form.setValues((val) => ({ ...val, ...newData }));
          }
        })
        .catch((error) => {
          console.log(error);
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  }, [values.containerNo]);



  const onReceiverUpdateGateOut = () => {
   
    let postData = {
      emptyVehicleArrivalId: values.vehicleArrivalId,
      iasDispatchId: values.id,
      receivingArrivalId: receivingArrivalId,
      vehicleStatus: statusCode.COMPLETED,
    };
    if (isReceivingIncharge) {
      postData.unloadedLotNo = values.unloadedLotNo;
      postData.unLoadingVendor = values.unLoadingVendorName;
      postData.unloadingChargePerTon = values.unloadingChargePerTon;
      postData.vehicleStatus = statusCode.GATEOUT;
      postData.BagType = values.bagType.value;
      postData.BagType2 = values.bagType2 ? values.bagType2.value : "";
      postData.BagType3 = values.bagType3 ? values.bagType3.value : "";

      postData.no_bags = values.no_bags;
      postData.no_bags2 = values.no_bags2 ? values.no_bags2 : "";
      postData.no_bags3 = values.no_bags3 ? values.no_bags3 : "";

      // postData.GunnyWt = values.gunnyWt;
      // postData.GunnyLessNetWt = values.sendingGunnyLessNetWt;

/* 31-08-2022
      postData.wbEmptyWt = values.pickSlipDetails?values.pickSlipDetails.wbEmptyWt:'';
      postData.wbLoadWt = values.pickSlipDetails?values.pickSlipDetails.wbLoadWt:'';
      postData.wbNetWt = values.pickSlipDetails?values.pickSlipDetails.wbNetWt:'';
      postData.gunnyWt = values.pickSlipDetails?values.pickSlipDetails.gunnyWt:'';
      postData.gunnyLessNetWt = values.pickSlipDetails?values.pickSlipDetails.sendingGunnyLessNetWt:'';
*/
      postData.wbEmptyWt = "0";
      postData.wbLoadWt = values.wbTicketNumber?values.wbTicketNumber.firstWeight:'';
      postData.wbNetWt = "0";
      postData.gunnyWt = values.pickSlipDetails?values.pickSlipDetails.gunnyWt:'';
      postData.gunnyLessNetWt = "0";
	    
      postData.ReceivingBinId = values.ReceivingBin;

    } else if (isReceivingGateOut) {
      postData = {
        ...postData,
        bagType: values.bagType,
        wbEmptyWt: values.wbEmptyWt,
        wbLoadWt: values.wbLoadWt,
        wbNetWt: values.wbNetWt,
        gunnyWt: values.gunnyWt,
        gunnyLessNetWt: values.gunnyLessNetWt,
        WBCopy: values.WBCopy,
        wbType: values.wbType ? values.wbType.label : "",
      };
      if (isOutSide) {
        postData.wbName = values.wbName;
        postData.wbSerialNumber = values.wbSerialNumber;
        postData.nagaOutsideWBCopy = values.nagaOutsideWBCopy;
        postData.wbTicketNumber = "";
      } else {
        postData.wbName = "";
        postData.wbSerialNumber = "";
        postData.nagaOutsideWBCopy = "";
        postData.wbTicketNumber = values.wbTicketNumber ? values.wbTicketNumber.label : "";
      }
    }
  if((postData.unLoadingVendor == '' || postData.unLoadingVendor == undefined || postData.unLoadingVendor == null) &&  postData.unloadingChargePerTon > 0){
      errorToast("Please Check Unloading Vendor Name...");
      return false;
  }
console.log("postData", postData);

    showLoader();
    let onSuccess = () => {
      hideLoader();
      history.push(getBackLink());
    };
    let UploadVaNumber = form.values ? form.values.zvaNumber : "";
    let Folder = "IAS";
    let SubFolder = "Receiver_GateOut";
    let UploadArray = [];
    if (postData.nagaOutsideWBCopy || ImgData.nagaOutsideWBCopy_c) {
      SubFolder = "Naga_Outside_WB";
      UploadArray = [
        emptyArrivalId,
        UploadVaNumber,
        Folder,
        SubFolder
      ]
      if (postData.nagaOutsideWBCopy) {
        uploadFile(UploadArray, postData.nagaOutsideWBCopy, (file) => {
          if (file) {
            postData.nagaOutsideWBCopy = file;
            addOrUpdateGateOut(postData, onSuccess, emptyArrivalId);
          } else {
            hideLoader();
          }
        });
      } else {
        postData.append("image[]", ImgData.nagaOutsideWBCopy_c);
        apiPostMethod(SaveCaptureImage, postData, "File")
          .then((response) => {
            const { data } = response;
            if (data.success) {
              postData.nagaOutsideWBCopy = data.files[0].updname;
              addOrUpdateGateOut(postData, onSuccess, emptyArrivalId);
            }
          })
          .catch((error) => { })
          .finally((a) => {
            hideLoader();
          });

      }
    }
    else if (postData.WBCopy || ImgData.WBCopy_c) {
      SubFolder = "WB_Copy";
      UploadArray = [
        emptyArrivalId,
        UploadVaNumber,
        Folder,
        SubFolder
      ]
      if (postData.WBCopy) {
        uploadFile(UploadArray, postData.WBCopy, (file) => {
          if (file) {
            postData.WBCopy = file;
            addOrUpdateGateOut(postData, onSuccess, emptyArrivalId);
          } else {
            hideLoader();
          }
        });
      } else {
        postData.append("image[]", ImgData.WBCopy_c);
        apiPostMethod(SaveCaptureImage, postData, "File")
          .then((response) => {
            const { data } = response;
            if (data.success) {
              postData.WBCopy = data.files[0].updname;
              addOrUpdateGateOut(postData, onSuccess, emptyArrivalId);
            }
          })
          .catch((error) => { })
          .finally((a) => {
            hideLoader();
          });

      }
    } else {
      addOrUpdateGateOut(postData, onSuccess, emptyArrivalId);
    }
  };

  function getValidationSchema() {
    // console.log("ENTER");
    let schema = {};
    if (isSendingSide) {
      schema = {
        lastMileTransporter: validation.required({ isObject: true }),
        freightChargesPerTon: validation.required(),
      };
      if (isTruck) {
        schema = {
          ...schema,
          loadedLotNo: validation.required(),
          loadingVendor: validation.required({ isObject: true }),
          loadingChargesPerTon: validation.required(),
        };
      } else {
        schema = {
          ...schema,
          trailerNo: validation.required(),
          pickSlipNo: validation.required({isObject: true}),
          containerNo: validation.required({isObject: true}).nullable(),
          pickSlipCopy: validation.required(),
        };
      }
      if (dispatchDetails) {
        schema = {
          pickSlipNo: validation.required({ isObject: true }),
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
        ////Mohan 03082022 commented change to Receiving Bin so commented unloadedLotNo: validation.required(),
        // unLoadingVendor: validation.required({ isObject: true }),
        unloadingChargePerTon: validation.required(),
        ReceivingBin: validation.required({ isObject: true }),

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
    console.log("test");
    //
    let BagCuttingdet = {
      BgType: form.values.bagType ? form.values.bagType.value : "",
      NoofBags: form.values.no_bags,
      BgCutingType: form.values.bagCuttingType ? form.values.bagCuttingType.value : "",
      BgCutingVendor: form.values.bagCuttingVendor ? form.values.bagCuttingVendor.value : "",
      BgCutingCharges: form.values.BagCuttingCharges,

      BgType2: form.values.bagType2 ? form.values.bagType2.value : "",
      NoofBags2: form.values.no_bags2,
      BgCutingType2: form.values.bagCuttingType2 ? form.values.bagCuttingType2.value : "",
      BgCutingVendor2: form.values.bagCuttingVendor2 ? form.values.bagCuttingVendor2.value : "",
      BgCutingCharges2: form.values.BagCuttingCharges2,

      BgType3: form.values.bagType3 ? form.values.bagType3.value : "",
      NoofBags3: form.values.no_bags3,
      BgCutingType3: form.values.bagCuttingType3 ? form.values.bagCuttingType3.value : "",
      BgCutingVendor3: form.values.bagCuttingVendor3 ? form.values.bagCuttingVendor3.value : "",
      BgCutingCharges3: form.values.BagCuttingCharges3,
    }
    postData = {
      ...postData,
      BagCuttingdet
    };
    console.log(JSON.stringify(postData));
    // return false;
    apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/updateInfo?id=${dispatchId}`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
           window.open(BASE_URL + "/#/Slip:" + emptyArrivalId, "", "width=900,height=650")
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const onRejectGateOut = () => {

    apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/RejectInfo/` + emptyArrivalId)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  }

  const onGateOutDetails = () => {
    //console.log(JSON.stringify(form));

    let UploadVaNumber = form.values ? form.values.zvaNumber : "";
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    //Bag Validation-START
    let LooswheatCnt = 0;
    console.log(JSON.stringify(form.values.bagType));
    if (form.values.bagType != undefined) {
      if (form.values.bagType.value != "" && (form.values.bagType.label == "LOOSE WHEAT" || form.values.bagType.label == "Loose Wheat")) {
        LooswheatCnt++;
      }
    }
    if (form.values.bagType2 != undefined) {
      if (form.values.bagType2.value != "" && (form.values.bagType2.label == "LOOSE WHEAT" || form.values.bagType2.label == "Loose Wheat")) {
        LooswheatCnt++;
      }
    }
    if (form.values.bagType3 != undefined) {
      if (form.values.bagType3.value != "" && (form.values.bagType3.label == "LOOSE WHEAT" || form.values.bagType3.label == "Loose Wheat")) {
        LooswheatCnt++;
      }
    }
    let SelectedBgcnt = 0;
    if (form.values.bagType != undefined) {
      if (form.values.bagType.value != "") { SelectedBgcnt++ }
    }
    if (form.values.bagType2 != undefined) {
      if (form.values.bagType2.value != "") { SelectedBgcnt++ }
    }
    if (form.values.bagType3 != undefined) {
      if (form.values.bagType3.value != "") { SelectedBgcnt++ }
    }
    if (SelectedBgcnt != LooswheatCnt && LooswheatCnt > 0) {
      errorToast("Invalid Bag Type..!");
      return false;
    }


    //Bag Validation-END

    showLoader();
    let Folder = "IAS";
    let SubFolder = "Loading_WH_Incharge";
    let filesToUpload = fileKeysToUpload();
    let UploadArray = [
      emptyArrivalId,
      UploadVaNumber,
      Folder,
      SubFolder
    ]
    let { WBCopy_c, nagaOutsideWBCopy_c, ewayBillCopy_c, wbSlipCopy_c, pickSlipCopy_c } = ImgData;
    if (WBCopy_c != null || true) {
      let keys = Object.keys(filesToUpload).filter((k) => filesToUpload[k].name);
      let fdata = {};
      let postdata = new FormData();
      postdata.append("image[]", WBCopy_c);
      postdata.append("image[]", nagaOutsideWBCopy_c);
      postdata.append("image[]", ewayBillCopy_c);
      postdata.append("image[]", wbSlipCopy_c);
      postdata.append("image[]", pickSlipCopy_c);
      keys.forEach((key) => {
        postdata.append("file[]", filesToUpload[key]);
      });
      postdata.append("form_name", "IAS");
      postdata.append("ponumber", "");
      postdata.append("VA_Number", UploadVaNumber);
      postdata.append("SubFolder", "Loading_WH_Incharge");

      console.log("filesToUpload");
      console.log(JSON.stringify(filesToUpload));

      let fileData = filesToUpload.map((k) => values[k]);
      fileData.forEach((f) => postdata.append("file[]", f));


      let fileKeys_c = ["WBCopy_c", "nagaOutsideWBCopy_c", "ewayBillCopy_c", "wbSlipCopy_c", "pickSlipCopy_c"];
      let FileSaveUrl = uploadandSaveImageUrl;
      apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            filesToUpload.forEach((filesToUpload, i) => {
              fdata[filesToUpload] = data.files[i].updname ? data.files[i].updname : "";
            });
            //updateFormData(fdata);

            if (dispatchId) {
              updatePickSlipData(fdata);
            } else {
              gateOutOrAddLoadingVendor(fdata);
            }
          }
        })
        .catch((error) => {
          console.log(error);
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });

    } else {

      uploadIfAnyFileExist(UploadArray, values, filesToUpload, (fileData) => {
        if (!fileData) {
          hideLoader();
        } else {

          if (dispatchId) {
            updatePickSlipData(fileData);
          } else {
            gateOutOrAddLoadingVendor(fileData);
          }
        }
      });

    }



  };

  const fileKeysToUpload = () => {
    let fileKeys = ["pickSlipCopy", "wbSlipCopy", "ewayBillCopy", "nagaOutsideWBCopy", "WBCopy"].filter((a) => values[a] && values[a].type);
    return fileKeys;
  };

  const gateOutOrAddLoadingVendor = (fileUrls) => {
    let postData = {
      vehicleArrivalId: emptyArrivalId,
      freightChargesPerTon: values.freightChargesPerTon,
      lastMileTransporter: values.lastMileTransporter.label,
    };
    if (fileUrls) {
      postData = {
        ...postData,
        ...fileUrls,
      };
    }
    let PrintForm = 0;
    if (isTruck) {
      postData = {
        ...postData,
        truckNo: values.truckNo,
        loadedLotNo: (values.loadedLotNo && values.loadedLotNo.value) ? values.loadedLotNo.value : values.loadedLotNo,
        //loadedLotNo: values.loadedLotNo.value,
        loadingVendor: values.loadingVendor.label,
        loadingChargesPerTon: values.loadingChargesPerTon,
        vehicleStatus: statusCode.GATEOUT,
        //vehicleStatus: statusCode.SecondWeight,
        isTruck: 1,
      };
    } else {
      postData = {
        ...postData,
        containerNo: values.containerNo.label,
        irsContainerDetailsId: values.containerNo.value,
        intraStateSapId: values.pickSlipNo.value,
        pickSlipNo: values.pickSlipNo.label,
        trailerNo: values.trailerNo,
        driverNo: values.driverNo,
        isTruck: 0,
        vehicleStatus: statusCode.INTRANSIT,
      };
      PrintForm = 1;
    }
    apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/addInfo`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(getBackLink());
          if (PrintForm == 1) {
            window.open(BASE_URL + "/#/Slip:" + emptyArrivalId, "", "width=900,height=650")
          }
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };
  let isOutSide = isOutSideWb(form); // form.values.wbType && form.values.wbType.value === "2";
  let disabled = !!dispatchDetails || isReceivingIncharge;

  const getBackLink = () => {
    if (fromPage) {
      return `/${fromPage}`;
    }
    if (isReceivingIncharge) return `/UL`;
    else if (isReceivingGateOut) return "/VA";
    else return "/IASRPR";
  };

  const onGateOut = () => {

    console.log("isSendingSide : ", isSendingSide);
    if(vehicleStatus == 5 && isSendingSide == false){
      SiloToMillDeliveryDetails()
    }else if (!isSendingSide){
      onReceiverUpdateGateOut();
    } else {
      // alert("in gate out details")
      onGateOutDetails(); //uncomm 
    }
  };

  const SiloToMillDeliveryDetails = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    const postData1 = {
      wbEmptyWt: values.wbEmptyWt,
      wbNetWt: values.wbNetWt,
      gunnyLessNetWt: values.gunnyLessNetWt,
    };
   apiPostMethod(apiBaseUrl + `Sap/SiloToMillController/IASMigoUpdate/${emptyArrivalId}/${postData1.wbEmptyWt}/${postData1.wbNetWt}/${postData1.gunnyLessNetWt}`)
         .then((response) => {
         const { data } = response;
         if(data.success == true) {
          onReceiverUpdateGateOut()
         }else{
          errorToast(data.message)
         }
         })
         .catch((error) => {
           errorToast("Something went wrong, please try again after sometime");
         })
  }

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
      if (action == "gateout") {
        return "Add Pickslip";
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


useEffect(() => {
 
  if (RvNumbers !='') {
    onFetchPOLine(RvNumbers);
  }
}, [RvNumbers]);

let fdata = { RvNumbers: RvNumbers, formType:"LOT"};


const onFetchPOLine = (RvNumbers) => {
  let fdata = { RvNumbers: RvNumbers,Location: RecLocation, formType:"LOT"};
  console.log(fdata);
  console.log("Ajith");
  apiPostMethod(ulUrl, fdata)
    .then((response) => {console.log('test')
      console.log(response)
      const { data } = response;
      console.log('datas venkat')
      console.log(data)
      if (data.success) {
        setPOLinedata([{ options: data.results.lotdet }]);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};
//alert('aaaa');
  // const onFetchPodetailsById = (SiloPlantID,ReceivingLocation) => {
  //   let fdata = { SiloPlantID: SiloPlantID, ReceivingLocation: ReceivingLocation, formType: "LOT" };
  //   alert("xxxxxxxxxx");
  //   console.log("VNR");
  //   console.log(fdata);
  //   console.log("VN");
  //   //showLoader();
  //   apiPostMethod(ulUrl, fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       console.log("VNR");
  //       console.log(data);
  //       if (data.success) {
  //         const poResult = data.results[0];
  //         setPoData({ ...poData, ...poResult });
  //         //setlotoption(poResult.lotdet);
  //       }
  //     })
  // };
  //console.log(lotdet);
  
  const onRedirectClick = () => {
    setIsOpen(true);
  };
  return (
    <div>
      <PageHeaderText id={values.zvaNumber} title={`${getTitle()}`} />
      <Card>
        <CardBody>
          <Row>
            <LoadingDetails form={form} disabled={disabled} isTruck={isTruck} />
            
            {!isTruck && (
              <Col md="4" sm="12">
                <CustomDropdownInput
                  label={"Container No"}
                  url={`${apiBaseUrl}emptyVehicleArrival/getReceivedContainerList`}
                  form={form}
                  isDisabled={isReceivingIncharge || isReceivingGateOut || isViewOnly}
                  id="containerNo"
                  fixedOption={values.extContainerNo}
                />
              </Col>  
            )}

            {(dispatchDetails || !isTruck) && (
              <>
                {isReceivingIncharge && (
                  <>
                 {(SiloPlantID != "1111" && SiloPlantID != "FR01" && SiloPlantID != "8001") &&(
                  <Col md="4" sm="12">
                <FormGroup>
                  <Label>Unloading Lot</Label>
                  <Select
                    id="unloadedLotNo"
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                  />
                </FormGroup>
              </Col>
            )}

                    
                {/* <Col md="4" sm="12">
                    <CustomDropdownInput label={"Unloaded Lot No"} form={form} id="unloadedLotNo"
                       url={`${apiBaseUrl}warehouse/master/getReceivingLot?id=${SiloPlantID}`} />
                            
                    </Col> */}
                  

                  { (SiloPlantID == "1111" || SiloPlantID == "FR01" || SiloPlantID == "8001") &&(                    
                  <Col md ="4" sn="12">
                        <CustomDropdownInput label={"Receiving Bin"} form={form} id="ReceivingBin"
                                url={`${apiBaseUrl}warehouse/master/getReceivingBin`} />
                            <span id='ReceivingBin_Error' style={{ color: 'red' }} ></span>
                    </Col>
                     )}
                    {/* <Col md="4" sm="12">
                      <CustomDropdownInput
                        url={`${apiBaseUrl}master/getIntraUnLoadingVendor`}
                        label={"UnLoading Vendor"}
                        form={form}
                        id="unLoadingVendor"
                      />
                    </Col> */}
                    <Col md="4" sm="12">
                      <CustomTextInput label={"UnLoading Vendor"} form={form} id="unLoadingVendorName" disabled/>
                    </Col>

                    <Col md="4" sm="12">
                      <CustomTextInput label={"Unloading Charges Per TON"} form={form} id="unloadingChargePerTon" isNumberOnly disabled/>
                    </Col>
                  </>
                )}

                <HrLine header={"PO Details"} />
                <PickSlipDetails form={form} ReceivingGateOut={isReceivingGateOut} emptyArrivalId={emptyArrivalId} disabled={isReceivingIncharge || isReceivingGateOut || isViewOnly} isTruck={isTruck} />
                
                <HrLine header={"Sending WB Details"} />
                {isTruck && <SendingWbTypeSelection form={form} disabled={!isSendingSide || isViewOnly} />}{" "}
                <Col md="4" sm="12">
                  <CustomTextInput disabled label={"Own WB - Weight"} form={form} id="WBCalcWeight" isNumberOnly />
                  <CustomTextInput form={form} id="WBBufferPercent" isNumberOnly style={{ display: 'none' }} />
                </Col>
                <SendingWeightDetails form={form} isSendingSide={isSendingSide} isReceivingGateOut={isReceivingGateOut} />

                {isReceivingGateOut && (
                  <>
                    <HrLine header={"Receiving WB Details"} />
                    <WbTypeSelection form={form} ticketOptions={ticketOptions} />
                    <WeightDetails form={form} isReadOnly={isReceivingIncharge || isSendingRedirect} />
                    <Col md="4" sm="12">
                      <CustomUploader
                        form={form}
                        label={" WB Copy"}
                        id={"WBCopy"}
                        isReadOnly={isViewOnly || isReceivingIncharge}
                      />
                    </Col>

                    {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"WBCopy_c"} />*/}
                  </>
                )}
                {(!isReceivingGateOut || (isReceivingGateOut && isOutSide)) && (
                  <>
                    {isReceivingGateOut ? (
                      isOutSide && (
                        <>
                          <HrLine header={"Attachments"} />
                          <Col md="4" sm="12">
                            <CustomUploader
                              form={form}
                              label={"Naga Outside WB Copy"}
                              id={"nagaOutsideWBCopy"}
                              isReadOnly={isViewOnly || isReceivingIncharge}
                            />
                          </Col>
                          {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"nagaOutsideWBCopy_c"} />*/}
                        </>
                      )
                    ) : (
                      <>
                        <HrLine header={"Attachments"} />

                        {isTruck ? (
                          <>
                            <Col md="4" sm="12">
                              <CustomUploader
                                form={form}
                                label={"E way Bill Copy"}
                                id={"ewayBillCopy"}
                                isReadOnly={isViewOnly || isReceivingIncharge || (dispatchDetails && dispatchDetails.ewayBillCopy)}
                              />
                            </Col>
                            {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"ewayBillCopy_c"} />*/}
                            <Col md="4" sm="12">
                              <CustomUploader
                                form={form}
                                label={"WB Slip Copy"}
                                id={"wbSlipCopy"}
                                isReadOnly={isViewOnly || isReceivingIncharge || (dispatchDetails && dispatchDetails.wbSlipCopy)}
                              />
                            </Col>
                            {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"wbSlipCopy_c"} />*/}
                          </>
                        ) : (
                          <>
                            {addFileIfExist("Eway Copy", "eWayBillCopy")}
                            {addFileIfExist("Naga Wb Copy", "nagaWbCopy")}
                            {addFileIfExist("Sale Invoice Copy", "saleInvoiceCopy")}
                          </>
                        )}
                        <Col md="4" sm="12">
                          <CustomUploader
                            form={form}
                            label={"Pickslip Copy"}
                            id={"pickSlipCopy"}
                            isReadOnly={isReceivingIncharge || (!isRedirect && dispatchDetails && dispatchDetails.pickSlipCopy)}
                          />
                          {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"pickSlipCopy_c"} />*/}
                        </Col>
                      </>
                    )}
                  </>
                )}
                <HrLine />
              </>
            )}
          </Row>
          
          <Row>
            <Col sm="12" className="mt-2">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <div className="mr-1">
                  {!isViewOnly && isReceivingIncharge && (
                    <Button.Ripple color="primary" type="button" onClick={(e) => onRedirectClick()} className="mr-2">
                      Redirect
                    </Button.Ripple>
                  )}
                  {!isReceivingIncharge && !isReceivingGateOut && <Button.Ripple color="primary" type="button" id="RejectButton" onClick={(e) => onRejectGateOut()}>
                    Reject
                  </Button.Ripple>}
                  &nbsp; &nbsp;
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
      {isOpen && (
        <PPModal open={isOpen} closeModal={onCloseModel} title={"Redirect"} hideCancel>
          <IasRedirect
            dispatchDetails={dispatchDetails}
            arrivalId={emptyArrivalId}
            receivingArrivalId={receivingArrivalId}
            onUpdateComplete={() => {
              onCloseModel();
              history.push("/UL");
            }}
          />
        </PPModal>
      )}
    </div>
  );
};

export default IasSendingReceiving;
