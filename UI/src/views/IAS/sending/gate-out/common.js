import { apiBaseUrl, uploadUrl,BASE_URL } from "../../../../urlConstants";
import { errorToast } from "@helpers/appHelper";

import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomDropdownInput, validation, Yup } from "../../../forms/custom-form";
import { addFileName } from "../../../common/Utils";
export function uploadFile(UploadArray, file, callback) {
  let postdata = new FormData();
  postdata.append("file[]", file);
  //postdata.append("form_name", "OY_PO");
  postdata.append("form_name", UploadArray[2]);
  postdata.append("ponumber", UploadArray[0]);
  postdata.append("VA_Number", UploadArray[1]);
  postdata.append("SubFolder", UploadArray[3]);
  apiPostMethod(uploadUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback(data.files[0].updname);
      }
    })
    .catch((error) => {
      console.log(error)
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
}

function uploadAllFile_OLD(refid, files, callback) {
  let postdata = new FormData();
  files.forEach((f) => postdata.append("file[]", f));
  postdata.append("form_name", "OY_PO");
  postdata.append("ponumber", refid);
  apiPostMethod(uploadUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback(data.files);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
}
function uploadAllFile(UploadArray, files, callback) {
  
  let postdata = new FormData();
  
  files.forEach((f) => postdata.append("file[]", f));
  //postdata.append("form_name", "OY_PO");
  postdata.append("form_name", UploadArray[2]);
  postdata.append("SubFolder", UploadArray[3]);
  postdata.append("ponumber", UploadArray[0]);
  postdata.append("VA_Number", UploadArray[1]);
  //console.log(JSON.stringify(f));
  
  
  apiPostMethod(uploadUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback(data.files);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
}
export const uploadIfAnyFileExist = (id, values, keys, callback) => {
  let filesToUpload = keys; //fileKeysToUpload();
 // console.log("KEY");
 // console.log(JSON.stringify(keys))
  if (filesToUpload.length > 0) {
    let fileData = filesToUpload.map((k) => values[k]);
   
    uploadAllFile(id, fileData, (uploadedFiles) => {
      if (!uploadedFiles) {
        errorToast("Something went wrong, please try again after sometime");
        callback();
        return;
      }
      let val = {};
      filesToUpload.forEach((k, i) => {
        val[k] = uploadedFiles[i].updname;
      });
      callback(val);
    });
  } else {
    callback({});
  }
};

export const PickSlipDropDown = ({ disabled, form, plantId, ...rest }) => {
  return (
    <CustomDropdownInput
      isDisabled={disabled}
      label={"PO Number"}
      url={`${apiBaseUrl}intraStateSap/getPickSlipByReceivingPlantId/${plantId}`}
      form={form}
      id="pickSlipNo"
      {...rest}
    />
  );
};

export const getPickSlipDetailsForTrailer = (pickSlipNo, isTruck, callback, emptyArrivalId) => {

  apiPostMethod(`${apiBaseUrl}intraStateSap/getById?id=${pickSlipNo}&emptyArrivalId=${emptyArrivalId}&isTruck=${isTruck}`)
    .then((response) => {
      const { data } = response;
      console.log("data",data);

      if (data.success) {
        let res = data.results;

        let newData = {
          wheatVariety: res.wheatVariety?res.wheatVariety:'',
          materialNo: res.materialNo,
          receivingStorageLocation: res.receivingStorageLocation,
          sendingStorageLocation: res.sendingStorageLocation,
          sendingPlant: res.sendingPlant,
          deliveryNo: res.deliveryNo,
          pickSlipQty: res.pickSlipQty ,
          stoPoNo: res.stoPoNo,
          receivingPlant: res.receivingPlant,
          segment: res.segment,
          deliveryDate: res.deliveryDate,
        };
        if (isTruck) {
          newData.sendingWbEmptyWt = res.wbEmptyWt;
          newData.sendingWbLoadWt = res.wbLoadWt;
          newData.sendingWbNetWt = res.wbNetWt;
          newData.gunnyWt = res.gunnyWt;
          newData.sendingGunnyLessNetWt = res.gunnyLessNetWt;
          newData.pickSlipQty = res.GunnyLessNetWt;
          /*newData.bagType = res.bagType;
          newData.bagType2 = res.bagType2;
          newData.bagType3 = res.bagType3;*/

          newData.no_bags = res.no_bags;
          newData.no_bags2 = res.no_bags2;
          newData.no_bags3 = res.no_bags3;

         
        }
        let b1={
          label:res.bagTypeName,
          value:res.bagType
        }
        let b2={
          label:res.bagType2Name,
          value:res.bagType2
        }
        let b3={
          label:res.bagType3Name,
          value:res.bagType3
        }
          newData.bagType = b1;
          newData.bagType2 =b2;
          newData.bagType3 =b3;
          
console.log("newData");
console.log(JSON.stringify(newData));

        callback(newData);
      }
    })
    .catch((error) => {
      console.log(error);
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
};

export function getContainerDetails(containerNo, callback) {
  apiPostMethod(`${apiBaseUrl}portDispatch/getContainerDetailById?id=${containerNo}`)
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
        callback(newData);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
}

export function updatePickSlipDetails(id, postData, onSuccess) {
  apiPostMethod(`${apiBaseUrl}intraStateDispatchInfo/updateInfo?id=${id}`, postData)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        onSuccess(true);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      onSuccess();
    });
}

export const getReceivingGateOutValidationSchema = () => {
  let schema = {
    pickSlipNo: validation.required({ isObject: true }),
    wbType: validation.required({ isObject: true }),
    wbName: outSideValidation(),
    wbSerialNumber: outSideValidation(),
    nagaOutsideWBCopy: outSideValidation(),
    ////Mohan 17092022 wbTicketNumber: validation.required({ isObject: true }) /* commented and changed by Arul 03-08-2022 for wbTicketNumber validation indeSideValidation()*/,
    wbTicketNumber: indeSideValidation_TicketNo(),
    wbEmptyWt: validation.number({ max: 5 }).nullable(),
    wbLoadWt: validation.number({ max: 5 }).nullable(),
    gunnyLessNetWt: Yup.number().positive("Invalid weight"),
    wbNetWt: Yup.number().positive("Invalid weight"),
  };
  return schema;
};

export const outSideValidation = (key = "wbType") =>
  Yup.string()
    .nullable()
    .when(key, {
      is: (value) => {
        return value && value.value == "2";
      },
      then: Yup.string().required("Required").nullable(),
    });

export const indeSideValidation = (key = "wbType") =>
  Yup.string()
    .nullable()
    .when(key, {
      is: (value) => {
        console.log("VALUE", key, " : ", value, " : ", this);
        return !value || value.value == "1";
      },
      then: Yup.string().required("Required").nullable(),
    });

export const indeSideValidation_TicketNo = (key = "wbType") =>
    Yup.string()
      .nullable()
      .when(key, {
        is: (value) => {
          console.log("VALUE", key, " : ", value, " : ", this);
          return !value || value.value == "1";
        },
        then: validation.required({ isObject: true }),
      });

export const addOrUpdateGateOut = (postData, callback,emptyArrivalId) => {
 // alert(JSON.stringify(postData))
//  return false;
  apiPostMethod(`${apiBaseUrl}intraState/addOrUpdateReceivingGateOut`, postData)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback();
        window.open(BASE_URL+"/#/Slip:"+emptyArrivalId, "", "width=900,height=650")
        
      }
    })
    .catch((error) => {
      console.log(error);
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
};
