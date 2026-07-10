import { apiBaseUrl, uploadUrl,BASE_URL } from "../../../../urlConstants";
import { errorToast } from "@helpers/appHelper";

import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomDropdownInput, validation, Yup } from "../../../forms/custom-form";
import { addFileName } from "../../../common/Utils";
export function uploadFile(refid, file, callback) {
  let postdata = new FormData();
  postdata.append("file[]", file);
  postdata.append("form_name", "OY_PO");
  postdata.append("ponumber", "");
  postdata.append("VA_Number", refid[1]);
  apiPostMethod(uploadUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback(data.files[0].updname);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
}

function uploadAllFile(refid, files, callback) {
  let postdata = new FormData();
  files.forEach((f) => postdata.append("file[]", f));
  postdata.append("form_name", "OY_PO");
  postdata.append("ponumber", "");
  postdata.append("VA_Number", refid[1]);
  postdata.append("SubFolder", refid[3]);
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
function uploadAllFile_STM(refid, files, callback) {
  let postdata = new FormData();
  files.forEach((f) => postdata.append("file[]", f));
  postdata.append("form_name", "SILO_TO_MILL");
  postdata.append("ponumber", refid);
  postdata.append("VA_Number", refid[1]);
  postdata.append("SubFolder", refid[3]);
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
export const uploadIfAnyFileExist_STM = (id, values, keys, callback) => {
  let filesToUpload = keys; //fileKeysToUpload();
  if (filesToUpload.length > 0) {
    let fileData = filesToUpload.map((k) => values[k]);
    uploadAllFile_STM(id, fileData, (uploadedFiles) => {
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
      label={"Pickslip No"}
      url={`${apiBaseUrl}intraStateSap/getPickSlipByReceivingPlantId/${plantId}`}
      form={form}
      id="pickSlipNo"
      {...rest}
    />
  );
};

export const getPickSlipDetailsForTrailer = (pickSlipNo, isTruck, callback) => {
  apiPostMethod(`${apiBaseUrl}intraStateSap/getById?id=${pickSlipNo}`)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        let res = data.results;
        let newData = {
          wheatVariety: res.wheatVariety,
          materialNo: res.materialNo,
          receivingStorageLocation: res.receivingStorageLocation,
          sendingStorageLocation: res.sendingStorageLocation,
          sendingPlant: res.sendingPlant,
          deliveryNo: res.deliveryNo,
          pickSlipQty: res.pickSlipQty,
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
          newData.bagType = res.bagType;
         // newData.bagType2 = res.bagType2;
         // newData.bagType3 = res.bagType3;

          newData.no_bags = res.no_bags;
          newData.no_bags2 = res.no_bags2;
          newData.no_bags3 = res.no_bags3;
        }
        callback(newData);
      }
    })
    .catch((error) => {
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
    pickSlipNo: validation.required(),
    wbType: validation.required({ isObject: true }),
    wbName: outSideValidation(),
    wbSerialNumber: outSideValidation(),
    nagaOutsideWBCopy: outSideValidation(),
    wbTicketNumber: indeSideValidation(),
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
        return !value || value.value == "1";
      },
      then: Yup.string().required("Required").nullable(),
    });

export const addOrUpdateGateOut = (postData, callback) => {
 // alert(JSON.stringify(postData))
//  return false;
  apiPostMethod(`${apiBaseUrl}intraState/addOrUpdateReceivingGateOut`, postData)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        callback();
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
      callback();
    });
};

export const addOrUpdateSTMGateOut = (postData, callback,emptyArrivalId) => {
  // alert(JSON.stringify(postData))
 //  return false;
   apiPostMethod(`${apiBaseUrl}SilotoMillReceive/addOrUpdateReceivingGateOut`, postData)
     .then((response) => {
       const { data } = response;
       if (data.success) {
         callback();
         if(emptyArrivalId!=""){
          window.open(BASE_URL+"/#/STMSlip:"+emptyArrivalId, "", "width=900,height=650")
         }
         
       }
     })
     .catch((error) => {
       errorToast("Something went wrong, please try again after sometime");
       callback();
     });
 };
 