import axios from "axios";
import { BASE_URL } from "../urlConstants";

/**
 * Makes single axios call to the service.
 * @param {String} url - The service url.
 * @param {Object} params - The parameters required to send for the service.
 * @returns {Array<Object>} - The response from the url.
 */
export const apiRequest = (url, params) => {
  const options = {
    url,
    method: "post",
    ...params,
  };
  //store.dispatch(resetSession());
  return axios(options);
};
function Upper(obj) {

 // console.log(JSON.stringify(obj));
  const KeyNotchange = ["Image1","Image2","Image3","Image4","AfterImage","BeforeImage","WeightmentSlip",
  "LotCreationFilePath","warehouselayout",

  /* Warehouse Approval Screen Attachment Fields */
  "Statutory_Type_Attachment","wb1_stamping_certificate_attachment",
  "wb2_stamping_certificate_attachment","license_copy_attachment1","license_copy_attachment2",
  "license_copy_attachment3",
  
  "release_letter_image","bank_statement","Pledge_Letter_Image","Ewaybillcopy",
  "qc_deduction_doc","naga_os_wb_copy","wbSlipCopy","pickSlipCopy","ewayBillCopy","customDocumentCopy",
  "saleInvoiceCopy","nagaWbCopy","eWayBillCopy","qc_work_doc","gonowc","supp_wb_copy","supp_inv_copy",
  "formType","ScreenName","password","user_name","QCFilePath","Invoicecopy","WBCopy","NagaOutsideWBCopy","Invoice_Copy","WB_Copy",
  "ParamAttach","ParamAttach0","ParamAttach1","ParamAttach2","ParamAttach3","ParamAttach4","ParamAttach5","ParamAttach6",
  "ParamAttach7","ParamAttach8","ParamAttach9","ParamAttach10","ParamAttach11","ParamAttach12","ParamAttach13",
  "ParamAttach14","ParamAttach15","ParamAttach16","ParamAttach17","ParamAttach18","ParamAttach19","ParamAttach20",
  "ParamAttach21","ParamAttach22","ParamAttach23","ParamAttach24","ParamAttach25","ParamAttach26","ParamAttach27",
  "ParamAttach28","ParamAttach29","ParamAttach30","ParamAttach31","ParamAttach32","ParamAttach33","ParamAttach34",
  "ParamAttach35","ParamAttach36","ParamAttach37","ParamAttach38","ParamAttach39",
	"wh_photograph_attachment","wh_photograph_attachment1","wh_photograph_attachment2","wh_photograph_attachment3",
  "Attachment","file","verify_pwd","PASSWORD","MAIL_ID","vehicle_type","moduleType","generalVisitorDetails","idProof",

  "first_weighment_attachment","second_weighment_attachment","imageUrl","shipmentCopy","coaCopy","sendingWBSlip","invoiceCopy","returnDocument","rejectionDeclarationForm","gatePassDocument","cameraName","apiUrl","username","to_mail","cc_mail","bcc_mail","lv_xstring","fileformat","filename","extraAttachments", "bargainNote","deliveryChallanCopy","ewayBillCopy","eInvoiceCopy",
  "qcCertificateInternalCopy","qcCertificateExternalCopy","externalWbCopy","vendorEmailCopy","projectTeamAcknowledgement",
  "creditNoteCopy","bargainNotes","deliveryChallanCopys","ewayBillCopys","eInvoiceCopys",
  "qcCertificateInternalCopys","qcCertificateExternalCopys","externalWbCopys","vendorEmailCopys","projectTeamAcknowledgements",
  "creditNoteCopys","imagePath","industrialVisitDetails","MIC DESC","FIELD MAP","MATERIAL","NIR YES","NIR NO","NIR FOSS","FIELD MAP","SURVEYOR","agreement_copy","mail_copy","invoice_attachment","rrCopy","purchaseMode","wbCopy","ewayCopy","version","details","module","purchaseOrg"
  ];
  /* IAS Frist Weight & Second Weight Attachment => "first_weighment_attachment","second_weighment_attachment", */

  /* "wb1_stamping_certificate_attachment","wb2_stamping_certificate_attachment", Statutory_Type_Attachment,

   */

  /*const KeyNotchange = ["AfterImage","BeforeImage","WeightmentSlip","LotCreationFilePath","warehouselayout",
  "Statutory_Type_Attachment",
  "wb1_stamping_certificate_attachment","wb2_stamping_certificate_attachment",
  "License_Copy_Attachment1","License_Copy_Attachment2","license_copy_attachment3",
  "release_letter_image","bank_statement","Pledge_Letter_Image","Ewaybillcopy","qc_deduction_doc",
  "naga_os_wb_copy","wbSlipCopy","pickSlipCopy","ewayBillCopy","customDocumentCopy","saleInvoiceCopy","nagaWbCopy","eWayBillCopy","qc_work_doc","gonowc","supp_wb_copy","supp_inv_copy","formType", "ScreenName","password","user_name","QCFilePath"];
  */

  for (var prop in obj) {
  if (typeof obj[prop] === 'string') {
    if(!KeyNotchange.includes(prop)){ 
      obj[prop] = obj[prop].toUpperCase();
    }
  }

  if (typeof obj[prop] === 'object') {
    Upper(obj[prop]);
    }
  }
  return obj;
}

export const apiPostMethod = (url, params, isFile) => {
  //params=params.toUpperCase();
  /*if(params){
    console.log("1-"+JSON.stringify(params));
  let ToCaps=(JSON.stringify(params)).toUpperCase();
  params=JSON.parse(ToCaps);
  console.log("2-"+JSON.stringify(params));
  }*/
  //const tokenString = localStorage.getItem('userData');
  // console.log("test API 1");

  const tokenString="";
  if(params){
    params=Upper(params); //added to convert the data to uppercase
  }

  const config = {
    headers: { "Content-Type": "multipart/form-data", "Access-Control-Max-Age": 86400, 
    'Authorization': `bearer ${tokenString}` },
  };

  if (isFile) {
    return axios.post(BASE_URL + url, params, config);
  } else {
    return axios.post(BASE_URL + url, { ...params });
  }
};


export const apiGetMethod = (url, params) => {
  return axios.get(BASE_URL + url, { params: { ...params } });
};

/**
 * Makes multiple axios call to the service.
 * @param {String} urls - The service urls to be sent.
 * @returns {Array<Object>} - The response from the url.
 */
export const batchCall = (urls) => {
  //store.dispatch(resetSession());
  return axios.all(urls);
};
