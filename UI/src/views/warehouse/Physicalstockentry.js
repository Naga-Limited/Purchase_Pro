import React, { Fragment, useState, useEffect } from 'react'
import { Col , Table, FormGroup, Label,Button, ButtonToggle,CustomInput } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl,SaveCaptureImage,uploadUrl,PhysicalStockUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
//import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import Uploader from "../Uploader";
import CaptureImage from "../CaptureImage";
import { isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
//import { ToggleLeft } from 'react-feather';
import {ClearDropdown} from "./common/appHelper"


const physicalstock = {
  warehouseid: "", 
  slocation: "",
  wh_code: "",
  warehousename: "",                        
  locationid: "",    
  lotid: "",
  lotno: "", 
  plantid: "",
  Physical_Stock_date: "", 
  Maker: "", 
  Checker: "", 
  wheatvarietyid: "",
  WheatVariety: "",
  BagType: "",
  NoOfBag: "",  
  Qty_in_MTS: "",
  Image1 : "",
  Image2: "",
  Images3: "",
  Images4: "",
  Audit_Remarks: "",
  OutBox_Indicator: "",
  BagType: {label:"", value:""},
}





 const Physicalstockentry = ({form, onSubmit}) => {
   const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
   const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
   const[locationoption,setLocationoption] = useState([]);                                                                       
   const[lotoption,setLotoption] = useState([]);                                                                       
   const[makeroption,setMakeroption] = useState([]);                                                                       
   const[checkeroption,setcheckeroption] = useState([]);                                                                         
   const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
   const[bagtype,setBagtypeoption] = useState([]);                                                                         
   const[showlot,setshowlot] = useState([]);                                                                        
   const[showwheat, setwheat] = useState([]);                                                                      
   const [KeyloanDatas, setKeyloanDatas] = useState([]);
   const [ImgData, setImgData] = useState({});
   const[storageLocationOption,setstorageLocationOption] = useState([]);  
   const [attachedFiles, setAttachment] = useState({ Image1: {}, Image2: {},Image3:{},Image4:{} });
   const dateFormat = "DD-MM-YYYY";
   const today = moment().format(dateFormat);

   const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
   const history = useHistory();
   let { Physical_Stock_Id } = useParams();
   let refid='';
   let fdata='';
   if( Physical_Stock_Id) {
      refid = Physical_Stock_Id.replace(":", "");
   }
   let { showLoader, hideLoader } = useLoader(); 
   useEffect(() => {
     if(Physical_Stock_Id){
       onFetchStockentryById();

     }
   }, [Physical_Stock_Id]);
   const onFetchStockentryById = () => {
     let fdata = {
       id:refid,
     };
   showLoader();
   console.log("Request Url :: "+apiBaseUrl + "Master/getstockEntrydatabyid", fdata);
    apiPostMethod(apiBaseUrl + "Master/getstockEntrydatabyid", fdata)
    .then((response) => {
      const { data } = response;
      console.log("Response Data :: "+JSON.stringify(response));
      if (data.success) {
        form.setValues({
          warehouseid:data.results[0].warehouseid,
          locationid:data.results[0].locationid,
          lotid:data.results[0].lotid,
          Physical_Stock_date:data.results[0].Physical_Stock_date,
          Maker:data.results[0].Maker,
          Checker:data.results[0].Checker,
          Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
          BagType:data.results[0].BagType,
          NoOfBag:data.results[0].NoOfBag,
          Qty_in_MTS:data.results[0].Qty_in_MTS,
          wheatqty:data.results[0].wheatqty,
          SAP_Qty:data.results[0].SAP_Qty,
      
          WheatVarietyid:data.results[0].WheatVarietyid
        })
      }
      console.log("Result Data :: "+JSON.stringify(form));
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
   }; 
   console.log("Request url :: "+apiBaseUrl + "Master/")
  
   const RefreshPage = () => {
     history.push(`/master/PhysicalstockEntry`);
   };
   const handleViewHistory = (data) => {

   } 

   const onWarehouseChange = (e) => {
     const {value, label} = e; 
    // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
    form.setFieldValue('warehouseid', {  label: label,value: value });
     FillPlantList(value);
     ClearDropdown("WH",form, 'locationid', 'storagelocationid', 'lotid', '');
}
const handleFileChange = (file, id) => {
  setAttachment((p) => ({
    ...p,
    [id]: file,
  }));
};
const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {
      setLocationoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  });
};

const onPlantchange = (e) => {
  const {value,label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
  
  form.setFieldValue('locationid', {  label: label,value: value });
  //FillLotList(value)
  FillStorageLocationList(value)
  ClearDropdown("PLANT",form, 'locationid', 'storagelocationid', 'lotid', '');

}
const FillStorageLocationList=(PlantId)=>{
  let fdata = { PlantId, screenType: "RND" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    setstorageLocationOption([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
 };
const FillLotList = (sLocId) => {
//  let fdata ={plantid:plant, screentype: "PhysicalstockEntry"} 
  let fdata = { storagelocationId:sLocId,plantid: form.values.locationid.value, screenType: "FUMIGATION" };

  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList',fdata) 
  .then((response) => {
    const { data } =response; 
    if(data.success) {
      setLotoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong please try again after sometime");
  });
};
const onchangeMaker = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Maker', {  label: label,value: value });
}
const SetOutboxIndicator =(e)=>{
  //console.log(document.getElementById("OutboxIndicator").checked);
  console.log(e.target.checked);
  if(e.target.checked){
    form.setValues({...form.values,OutboxIndicator:1})
  }else{
    form.setValues({...form.values,OutboxIndicator:0})
  }
  //console.log(e.target.value);
}
const onchangeChecker = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Checker', {  label: label,value: value });
}
const OnLotChange = (e) => {
  const {value, label} = e; 
  setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  
  form.setFieldValue('lotid', {  label: label,value: value });
 // Fillwheatvarity(value)
 
} 
const onWheatvarietyChange = (e) => {
   const{value, label} = e; 
   setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 

}
/* let a   
 const Details = () => {
     return `${apiBaseUrl}Warehous/physicalstocktaking/getphysicalstocklist`  
}
a = Details
console.log(a) */


// const  Fillwheatvarity = (lotid) => {
//   let fdata ={lotid:lotid, screentype: "PhysicalstockEntry"} 
//   apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarietyList',fdata) 
//   .then((response) => {
//     const { data } =response; 
//     if(data.success) {
//       setWheatvarietyoption([{options:data.results}]);
//     }
//   })
//   .catch((error) => {
//     errorToast("Something went wrong please try again after sometime");
//   });
// }; 
// const onWheatvarietyChange = (e) => {
//   const {value, label} = e; 
//   setStockEntryfromData({ ...stockEntryformData, wheatvarietyid:value , wheatvarietys:label});
// }


/*
const FillwheatList = () => {   
  let fdata = {lotid:lotid, screentype: "PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl +'warehouse',fdata)
  .then((response) => {
    const { data} = response; 
    if(data.success){
      setLotoption([{option:data.results}])
    }
 })
 .catch((error) => {
   errorToast("Something went wrong, please try again after sometime")
 }); 

};  
/*

const onMakerchange = (e) => {
  const {value,label}  = e 
  setMakeroption({ ...stockEntryformData, Maker:value, Maker:label})
  FillMakerList(value);
}
const FillMakerList = (Maker) => {
  let fdata = {Maker:Maker, screentype: "PhysicalStockEntry"} 
  apiPostMethod(apiBaseUrl +'warehouse',fdata) 
  .then((response) => {
    const {data} = response;
    if(data.success){
      setMakeroption([{option:data.results}])
    }
  })
  .catch((error) =>{
    errorToast("Something went wrong, please try again after sometime")
  });

};
const onCheckerchange = (e) => {
  const {value,label}  = e 
  setcheckeroption({ ...stockEntryformData, Checker:value, Checker:label})
  FillCheckerList(value);
}
const FillCheckerList = (Maker) => {
  let fdata = {Maker:Maker, screentype: "PhysicalStockEntry"} 
  apiPostMethod(apiBaseUrl +'warehouse',fdata) 
  .then((response) => {
    const {data} = response;
    if(data.success){
      setcheckeroption([{option:data.results}])
    }
  })
  .catch((error) =>{
    errorToast("Something went wrong, please try again after sometime")
  }) ;

}; 
const onWheatvarietyChange = (e) => {
  const{value,label} = e 
  setWheatvarietyoption({ ...stockEntryformData, Wheat_Variety_Id:value , wheatvariety:label})
  FillWheatList(value);
} 
const FillWheatList = (Wheat_Variety_Id) => {
  let fdata = {Wheat_Variety_Id:Wheat_Variety_Id, screentype: "PhysicalstockEntry"}
  apiPostMethod(apiBaseUrl + 'warehouse',fdata) 
  .then((response) => {
    const {data} =response; 
    if(data.success){
       setWheatvarietyoption([{option:data.results}])
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  });
}; 

const onbagtypechange = (e) => {
  const{value,label} = e 
  setBagtypeoption({ ...stockEntryformData, bagtype:value, wheatvariety:label}) 
  FillbagList(value);
}
const FillbagList = (bagtype) => {
  let fdata = {bagtype:bagtype, screentype: "PhysicalstocEntry"} 
  apiPostMethod(apiBaseUrl+'warehouse',fdata)
  .then((response) => {
    const {data} = response;
    if(data.success){
      setBagtypeoption([{option:data.results}])
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  }); 
}
*/  
const onChangelist = (e,i,Data,Key) => {
  console.log(JSON.stringify(form.values));
  const { value, label } = e;
  for(let j=0;j < Data.length;j++){
    if(j==i){
      if(Key=="BagType"){  Data[j].BagType=value; }
      if(Key=="NoOfBags"){  Data[j].NoOfBags=value; }
      if(Key=="QtyinMTS"){  Data[j].QtyinMTS=KeyloanDatas[j].QtyinMTS+e.target.value; }
      if(Key=="AuditRemarks"){  Data[j].AuditRemarks=value; }
     
    }
  }
  setKeyloanDatas(Data);

 //console.log(JSON.stringify(Data));
};
const onTextChange = (e,PKey, checkList,Val) => {
 // let KeyValue=e.target.value;
  //console.log(KeyValue);
  for(let i=0;i<checkList.length;i++){
    if(checkList[i].sub_lot_id==PKey){
        if(Val=="QtyinMTS"){
          checkList[i].QtyinMTS=e.target.value;
        }
        if(Val=="AuditRemarks"){
          checkList[i].AuditRemarks=e.target.value;
        }
        if(Val=="NoOfBags"){
          checkList[i].NoOfBags=e.target.value;
        }
        if(Val=="BagType"){
          checkList[i].BagType={value:e.value, label:e.label};
        }
        
    }
  }
  console.log(JSON.stringify(checkList));
  console.log(JSON.stringify(form.values));
  form.setValues({CheckList:checkList});
  console.log(JSON.stringify(form.values));
}
const isFilledAll = () => {
  showError('Physical_Stock_date_Error','Enter Physical_Stock_date',0);
showError('Maker_Error','Select Maker',0);
showError('Checker_Error','Select Checker',0);
showError('BagType_Error','Select BagType',0);
showError('NoOfBags_Error','Enter NoOfBags',0);
showError('QtyinMTS_Error','Enter QtyinMTS',0);
showError('AuditRemarks_Error','Enter AuditRemarks',0);
showError('OutboxIndicator_Error','Enter OutboxIndicator',0);
let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    //if(!formData.Physical_Stock_date) { showError('Physical_Stock_date_Error','Enter Date',1);  ShowError =1; }
if(!formData.Maker || !formData.Maker.value) { showError('Maker_Error','Select Maker',1); ShowError =1; }
if(!formData.Checker || !formData.Checker.value) { showError('Checker_Error','Select Checker',1); ShowError =1; }
if(!formData.BagType || !formData.BagType.value) { showError('BagType_Error','Select Bag Type',1); ShowError =1; }
if(!formData.NoOfBags) { showError('NoOfBags_Error','Enter No Of Bags',1);  ShowError =1; }
if(!formData.QtyinMTS) { showError('QtyinMTS_Error','Enter QTY in MTS',1);  ShowError =1; }
if(!formData.AuditRemarks) { showError('AuditRemarks_Error','Enter Audit Remarks',1);  ShowError =1; }
//if(!formData.OutboxIndicator) { showError('OutboxIndicator_Error','Enter Relotting Reason',1);  ShowError =1; }
if(ShowError==1){return true;}
}
const SaveSublot = () =>{
  if(isFilledAll()){
    return false;
  }
  console.log(JSON.stringify(form.values));
  let {Image1_C,Image2_C,Image3_C,Image4_C,Image5_C} = ImgData;
  let postdata = new FormData();
  let FileSaveUrl="";
  if(Image1_C!=null && Image2_C!=null && Image3_C!=null && Image4_C!=null && Image5_C!=null){
    
    postdata.append("image[]", Image1_C);
    postdata.append("image[]", Image2_C);
    postdata.append("image[]", Image3_C);
    postdata.append("image[]", Image4_C);
  
    FileSaveUrl=SaveCaptureImage;

    postdata.append("form_name", "PhysicalStock");
    //postdata.append("ponumber", refid);
    //postdata.append("VA_Number", ZVA_NUMBER);
    postdata.append("SubFolder", "PhysicalStock");

  }else{
    
    Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
    });
    let UploadFile1 = attachedFiles.Image1 && attachedFiles.Image1.name && attachedFiles.Image1.name.length ? true : false;
    let UploadFile2 = attachedFiles.Image2 && attachedFiles.Image2.name && attachedFiles.Image2.name.length ? true : false;
    let UploadFile3 = attachedFiles.Image3 && attachedFiles.Image3.name && attachedFiles.Image3.name.length ? true : false;
    let UploadFile4 = attachedFiles.Image4 && attachedFiles.Image4.name && attachedFiles.Image4.name.length ? true : false;
    postdata.append("form_name", "PhysicalStock");
   
    postdata.append("SubFolder", "PhysicalStock");
    FileSaveUrl=uploadUrl;
    if(UploadFile1==false && UploadFile2==false &&  UploadFile3==false  &&  UploadFile4==false){
      FileSaveUrl=""
    }
  }
 // console.log(FileSaveUrl);
//  console.log("test");
 // return false;
 
 let fdata = { 


  };
  showLoader();
  
  if(FileSaveUrl==""){
    onActionClick(fdata);
  }else{
    apiPostMethod(FileSaveUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        data.files.forEach((item) => {
          Object.keys(attachedFiles).forEach((k) => {
            if (item.orgname === attachedFiles[k].name) {
              fdata[k] = item.updname;
            }
          });
        });
        onActionClick(fdata);
      }
    })
    .catch((error) => {})
    .finally((a) => {
      hideLoader();
    });
  }
  
}

const onStorageLocationChange=(e)=>{
  const {value,label} = e; 
  form.setFieldValue('storagelocationid', {  label: label,value: value });
 // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
 FillLotList(value)
 ClearDropdown("SL",form, 'locationid', 'storagelocationid', 'lotid', '');
}

const onActionClick = (Data) => {
		
  
  //let DiffQty=(form.values.wheatqty)-(form.values.SAP_Qty); //11-05-2022
  
  // let Diff_Perct = (DiffQty/100)*form.values.SAP_Qty;
  // Arul (Sap Qty/100 = X), (Diff Qty / X = Diff Percentage)

  let DiffQty = (form.values.QtyinMTS) - (form.values.wheatqty);
  let Diff_Perct = (DiffQty / form.values.wheatqty) * 100;

  // console.log("Diff ::".form.values.SAP_Qty);
  // console.log("Diff ::".DiffQty);
  // console.log("Per ::".Diff_Perct);

  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const postdata = {
   
  //  ScreenType:'SAVEPHYSICALSTOCK',
    Image1:Data.Image1 ? Data.Image1 :"",
    Image2:Data.Image2 ? Data.Image2 :"",
    Image3:Data.Image3 ? Data.Image3 :"",
    Image4:Data.Image4 ? Data.Image4 :"",
   
    lotid:form.values.slotid,
    warehouseid:form.values.swarehouseid,
    plantid:form.values.splantid,
    locationid:form.values.sStorageLocationId,
    lotno:form.values.lotno,
    Wheat_Variety_Id:form.values.Wheat_Variety_Id,
    BagType:form.values.BagType.value,
    NoOfBag:form.values.NoOfBags,
    BagType1:form.values.BagType1 ? form.values.BagType1.value:"",
    NoOfBag1:form.values.NoOfBags1 ? form.values.NoOfBags1:0,
    Qty_in_MTS:form.values.QtyinMTS,
    Audit_Remarks:form.values.AuditRemarks,
    Status:1,
    Maker:form.values.Maker.value,
    Checker:form.values.Checker.value,
    //Physical_Stock_date:form.values.Physical_Stock_date,
    Physical_Stock_date:today,
    OutBox_Indicator:form.values.OutboxIndicator,
    Phy_Qty_in_MTS:form.values.wheatqty,
    SAP_Qty_in_MTS:form.values.SAP_Qty,
    Diff_Qty_in_MTS:DiffQty,
    Diff_Percent:Diff_Perct
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(PhysicalStockUrl , postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId < 0){
      errorToast("Something went wrong, please try again after sometime");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      // ShowStock();
      setTimeout(() => ShowStock(), 2000);
     // history.push("/warehouse/RelottingEntry");
     // window.location.reload();
     
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
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log("SHOW ERROR:"+Id);
    document.getElementById(Id).innerHTML=Msg;
    }
  }
  }
  const isfillallshow = () =>{
   // form.setValues({...form.values,CheckList:[]})
    showError('warehouseid_Error','Select warehouseid',0);
showError('locationid_Error','Select locationid',0);
showError('lotid_Error','Select lotid',0);

let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    if(!formData.warehouseid || !formData.warehouseid.value) { showError('warehouseid_Error','Select Ware House',1); ShowError =1; }
if(!formData.locationid || !formData.locationid.value) { showError('locationid_Error','Select Plant',1); ShowError =1; }
if(!formData.lotid || !formData.lotid.value) { showError('lotid_Error','Select From Lot No',1); ShowError =1; }

if(!formData.storagelocationid || !formData.storagelocationid.value) { showError('storagelocationid_Error','Select Storage Location',1); ShowError =1; }

if(ShowError==1){return true;}

  }

  const onCalcGunny = (e,Key) =>{
    console.log("test");
    let BagType=Key=="BagType" ? e.label : form.values.BagType ? form.values.BagType.label:"";
    let BagTypeWeight=0
    if(form.values.BagType){
    BagTypeWeight=BagType.split("|")[1];
    BagTypeWeight=BagTypeWeight.replace('KGs','');
    }

    let BagType1=Key=="BagType1" ? e.label : form.values.BagType1 ? form.values.BagType1.label:"";
    let BagTypeWeight2=0
    if(form.values.BagType1){
    BagTypeWeight2=BagType1.split("|")[1];
    BagTypeWeight2=BagTypeWeight2.replace('KGs','');
    }


    let NoOfBags=Key=="NoOfBags" ? e.target.value : form.values.NoOfBags ? form.values.NoOfBags :0;
    let NoOfBags1=Key=="NoOfBags1" ? e.target.value :form.values.NoOfBags1 ? form.values.NoOfBags1 :0;
    


    let QtyinMTS= (parseFloat(BagTypeWeight*NoOfBags) + parseFloat(BagTypeWeight2*NoOfBags1) )
    QtyinMTS=QtyinMTS.toFixed(2);
    form.setValues({
      ...form.values,
      QtyinMTS,
      NoOfBags,
      NoOfBags1,
     
    });
    if(Key=="BagType"){
      form.setFieldValue('BagType', {  label: e.label,value: e.value });
    }
    if(Key=="BagType1"){
      form.setFieldValue('BagType1', {  label: e.label,value: e.value });
    }
    if(Key=="BagType3"){
      form.setFieldValue('BagType3', {  label: e.label,value: e.value });
    }
  }
const ShowStock = (e) => {
  if(isfillallshow()){
    return false;
  }
  setAttachment({ Image1: {}, Image2: {},Image3:{},Image4:{} });
  let fdata = {warehouseid:form.values.warehouseid.value,locationid:form.values.locationid.value,
    storagelocationid:form.values.storagelocationid.value,
    lotid:form.values.lotid.value, screentype: "PhysicalstocEntry"} 
    
  apiPostMethod(apiBaseUrl+'warehouse/Physicalstocktaking/getphysicalstocklist',fdata)
 
  .then((response) => {    
    const {data} = response;
    const  value = value;
    if(data.success){
    //  document.getElementById("StockDet").innerHTML=""; 
     
if(data.results.length == 0){

 form.setFieldValue('warehouseid', {  label:  "",value:""});
 form.setFieldValue('locationid', {  label: "",value: "" });
 form.setFieldValue('lotid', {  label: "",value: "" });
 form.setFieldValue('storagelocationid', {  label: "",value: "" });
 
 form.setValues({});
 window.location.reload();
 ShowToast("Completed Successfully...");
  return false;
}

console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
     // setKeyloanDatas(data.results);

      form.setValues({
        
        CheckList:data.results,
        slotid:data.results[0].lotid,
        Wheat_Variety_Id:data.results[0].wheatvarietyid,
        swarehouseid:data.results[0].warehouseid,
        splantid:data.results[0].plantid,
        sStorageLocationId:data.results[0].StorageLocationId,
        lotno:data.results[0].lotno,
        wheatqty:data.results[0].wheatqty,
        SAP_Qty:data.results[0].SAP_Qty,
      });
      form.setFieldValue('warehouseid', {  label:  data.results[0].WH_NAME,value: data.results[0].wh_code });
      form.setFieldValue('locationid', {  label:  data.results[0].PLANT_NAME,value: data.results[0].plantid });
      form.setFieldValue('lotid', {  label: data.results[0].lotno,value: data.results[0].lotid });
      form.setFieldValue('storagelocationid', {  label: data.results[0].StorageLocationName,value: data.results[0].StorageLocationId });
      
      console.log("Checklist");
      console.log(form.values.CheckList);
      /*
      let CheckList={}
      for(let i=0;i<data.results.length;i++)
      {
        CheckList[i]={lotid:data.results[i].lotid,wheatvarietyid:data.results[i].wheatvarietyid , BagType:{lable:"",value:""}};
      }
      form.setValues({CheckList});*/
        //setshowlot({ ...stockEntryformData, lotno:value}); 
        //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
           
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  }); 

}

    return (
     <Fragment>
         <Row >
         <Col md="3" sm="12">
           <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id="warehouseid" 
           onChange = {onWarehouseChange}
           options ={warehouseoption}   
          />
          <span id='warehouseid_Error' style={{color: 'red'}} ></span>
           </Col>
           <Col md="3" sm="12"> 
           
           <CustomDropdownInput  
           label="Plant"
            form={form} id="locationid"
           onChange={onPlantchange} 
           options={locationoption}
         />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
 </Col>

 <Col md="3" sm="12"> 
           <CustomDropdownInput  
           label="Storage Location"
            form={form} id="storagelocationid"
            onChange={onStorageLocationChange} 
            options={storageLocationOption}
         />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
 </Col>
           <Col md="3" sm="12"> 
           
           <CustomDropdownInput  
           label="Lot No"
           form={form} id="lotid"   
            options= {lotoption}
           onChange={OnLotChange} 
           />
            <span id='lotid_Error' style={{color: 'red'}} ></span>
           </Col>
           <Col sm="12"> 
           <FormGroup className="d-flex justify-content-end mb-0">
         <Button.Ripple color="primary"   type="Button" onClick={ShowStock}>Show</Button.Ripple> 
        </FormGroup>
        </Col>
         </Row>
         <Row>
         <Col md="3" sm="12">
             <CustomTextInput label={"Date"} form={form} value={today} disabled id="Physical_Stock_date" 
             type="text"  />
             <span id='Physical_Stock_date_Error' style={{color: 'red'}} ></span>
             </Col>   
        <Col md="3" sm="12">
          <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
           label={"Maker"}  form={form} id="Maker" 
           onChange = {onchangeMaker}   
           />
          <span id='Maker_Error' style={{color: 'red'}} ></span>
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
           label={"Checker"}  form={form} id="Checker" 
           onChange = {onchangeChecker}   
           />
          <span id='Checker_Error' style={{color: 'red'}} ></span>
        </Col>           
        <Col md="3" sm="12">
           <CustomTextInput label={"Search"} form={form} id="0" type="search" />
           </Col>
         </Row>

        <div style={{Width:"970px",height:"400px",fontSize:"13px",overflowX:"auto"}} >
          <table className='table-sm'> 
                   <thead class="bg-primary text-white" style={{height:"50px",fontSize1:"12px"}}>
                    <tr>
                       <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Lot No</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Bag Type</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>No of Bags</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Bag Type2</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>No of Bags2</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Qty in MTS</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Photo 1</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Photo 2</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Photo 3</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Photo 4</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Audit Remarks</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>OutBox Indicator</th>
                        <th style={{backgroundColor:"#7367f0",minWidth:"200px",fontWeight:"500"}}>Save</th>
                    </tr>

                    </thead>
                     <tbody  style={{textAlign:"left"}} id='StockDet'>
                    {form.values.CheckList && form.values.CheckList.map((row, index) => (  
              <tr data-index={index}> 
                <td  style={{marginBottom:"100px"}}>{row.lotno}</td>  
                <td   style={{marginBottom:"100px"}}>{row.WheatVariety}</td>  
                {index>0 &&  <td colSpan={7}></td>}
               
                {index==0 && 
                <td  style={{marginBottom:"100px"}}><CustomDropdownInput style={{minWidth:"200px"}}
         url={`${apiBaseUrl}warehouse/master/bagtype_noloosewheat_wheatweight`} 
          form={form} id={`BagType`}  type="text" onChange={(e) => onCalcGunny(e,'BagType')}    />
       
       <span id='BagType_Error' style={{color: 'red'}} ></span>

         </td>}
         {index==0 && <td  style={{marginBottom:"100px"}}> 
                
     
                <CustomTextInput  form={form} id={`NoOfBags`}  type="text" onChange={(e) => onCalcGunny(e,'NoOfBags')}   />
                <span id='NoOfBags_Error' style={{color: 'red'}} ></span>

          </td>}

          {index==0 && 
                <td  style={{marginBottom:"100px"}}><CustomDropdownInput style={{minWidth:"200px"}}
         url={`${apiBaseUrl}warehouse/master/bagtype_noloosewheat_wheatweight`} 
          form={form} id={`BagType1`}  type="text" onChange={(e) => onCalcGunny(e,'BagType1')}   />
       
       <span id='BagType1_Error' style={{color: 'red'}} ></span>

         </td>}
         {index==0 && <td  style={{marginBottom:"100px"}}> 
                
     
                <CustomTextInput  form={form} id={`NoOfBags1`}  type="text" onChange={(e) => onCalcGunny(e,'NoOfBags1')}    />
                <span id='NoOfBags1_Error' style={{color: 'red'}} ></span>

          </td>}

{index==0 && 
           <td  style={{marginBottom:"100px"}}> <CustomTextInput 
            placeholder={" "}   form={form} id={`QtyinMTS`}  type="text"   />
              <span id='QtyinMTS_Error' style={{color: 'red'}} ></span>
  
          </td>}
                 {index==0 &&  <td valign='middle' style={{textAlign:"left"}} >
                   
                  <Uploader
                        setAttachment={handleFileChange}
                        label={"1:"}
                        title="Pdf"
                        id={"Image1"}
                        selectedFileName={attachedFiles.Image1.name}
                      />
                      {/*<CaptureImage showCam={true} ImgData={ImgData} setImgData={setImgData} ItemName={"Image1_C"} />*/}
                      </td>}
                      {index==0 &&  <td valign='middle' style={{textAlign:"left"}} >
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"2:"}
                        title="Pdf"
                        id={"Image2"}
                        selectedFileName={attachedFiles.Image2.name}
                      />
                      {/*<CaptureImage showCam={true} ImgData={ImgData} setImgData={setImgData} ItemName={"Image2_C"} />*/}
                      </td>}
                      {index==0 &&  <td valign='middle' style={{textAlign:"left"}} >
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"3:"}
                        title="Pdf"
                        id={"Image3"}
                        selectedFileName={attachedFiles.Image3.name}
                      />
                      {/*<CaptureImage showCam={true} ImgData={ImgData} setImgData={setImgData} ItemName={"Image3_C"} />*/}
                      </td>}
                      {index==0 &&  <td valign='middle' style={{textAlign:"left"}} >
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"4:"}
                        title="Pdf"
                        id={"Image4"}
                        selectedFileName={attachedFiles.Image4.name}
                      />
                      {/*<CaptureImage showCam={true} ImgData={ImgData} setImgData={setImgData} ItemName={"Image4_C"} />*/}
                     
                   </td>}
                  {index==0 &&  <td style={{marginBottom:"100px"}} > 
          <CustomTextInput 
            placeholder={" "}  
          
             form={form} id={`AuditRemarks`}  type="text"    />
              <span id='AuditRemarks_Error' style={{color: 'red'}} ></span>
              <CustomTextInput placeholder={" "}  
             form={form} id={`wheatqty`} value={row.wheatqty} type="hidden"/>
              <CustomTextInput placeholder={" "}  value={row.SAP_Qty}
             form={form} id={`SAP_Qty`}  type="hidden"/>
             </td>}
             
                {index==0 &&  
                  <td style={{marginBottom:"100px"}}> 
                    <CustomInput type="checkbox" 
                      onChange={SetOutboxIndicator}  
                      form={form}  
                      className="custom-control-Primary" 
                      id="OutboxIndicator" 
                      label="" 
                    />
                  </td>
                }

                {index==0 &&  
                  <td style={{marginBottom:"100px"}}>
                    <Button.Ripple
                      color="primary"
                      className="text-nowrap px-1 mt-75"
                      onClick={(e) => {
                        SaveSublot();
                      }}
                    >  
                      <span>SAVE</span>
                    </Button.Ripple>
                  </td>
                }
              </tr> 
             ))}  
                    </tbody>
             </table> 
             </div>
     </Fragment>
    )
} 



const Physicalstockentryformdata = () => {

  const history = useHistory();
  const {showLoader , hideLoader} = useLoader(); 
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (data) => {
    return moment(data).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      //warehousid:validation.required({ message:"Warehouse Name should not be empty", isObject:false }),
     // locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
     // lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
      //Physical_Stock_date: validation.required({  message:"Date should not be empty",isObject: true }),
     // Maker: validation.required({  message:"Maker should not be empty",isObject: true }),
     // Checker: validation.required({  message:"Checker should not be empty",isObject: true }),
     // Wheat_Variety_Id: validation.required({ message:"wheat vareity should not be empty", isObject: true }),
      //BagType: validation.required({ message:"BagType should not be empty", isObject: true }),
     // NoOfBag: validation.required({ message:"No of bag should not be empty", isObject: true }),
     }),
    onSubmit(values) {},
  }); 
  const Values = form.values;
  const onSubmit = () => { 
    if(!form.isValid)
    {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let stockEntryformData = form.values;
    const FrmData = { 
      warehousid:stockEntryformData.warehousename.value,
      locationid:stockEntryformData.locationid,
      lotid:stockEntryformData.lotno.value,
      Maker:stockEntryformData.Maker, 
      Checker:stockEntryformData.Checker,
      Wheat_Variety:stockEntryformData.Wheat_Variety,
      BagType:stockEntryformData.bagtype,

    };
    console.log(" Physical stock Entry :: "+JSON.stringify(FrmData));
    const postdata = {
      id:stockEntryformData.F_ID,
      Data:FrmData
    }
    console.log("  Physical stock Entry  :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Physical stock Entry  :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "Master", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
 
          if(document.getElementById("F_ID").value=="")
          {
            history.push("/warehouse");
          }
          else
          {
            history.push("/warehouse");
          }
        }
        else
        {
          if(data.ErrorMsg)
          {
            errorToast(data.ErrorMsg);
          }
          else
          {
            errorToast("Unable to update record");
          } 
        }      
      })
      .catch((error) => {
        console.log(" Error Data ::: "+JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });


  }
  return (
    <Fragment>
      <CardComponent  header="Physical Stock Entry">
     < Physicalstockentry form={form}  onSubmit={onSubmit}  />
   </CardComponent>
    </Fragment>
  )
}


export default Physicalstockentryformdata

