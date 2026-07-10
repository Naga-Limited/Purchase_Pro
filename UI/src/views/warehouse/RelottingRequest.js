import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { Paperclip } from "react-feather";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import { qcTestUrl, uploadUrl, RelottingUrl, getWheatMasterUrl,SaveCaptureImage } from "../../urlConstants";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup, Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

import CaptureImage from "../CaptureImage";
import { useSelector } from "react-redux";



function RelottingEntryScreen({form,onSubmit}) {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  const [FromLotDatas, setFromLotDatas] = useState([]);
  const [ToLotDatas, setToLotDatas] = useState([]);
  const[warehouseoption, setWarehouseoption] = useState([]);  
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [ImgData, setImgData] = useState({});
  const [attachedFiles, setAttachment] = useState({ qcwrkdoc: {} });
  const [storageLocationOption, setstorageLocationOption] = useState([]);   
  let { showLoader, hideLoader } = useLoader();
  const [WhareHouseCode, setWhareHouseCode] = useState('');   
  const [Segment, setSegment] = useState('');   

  /* User details */
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

//Created by MS.Karthick on 09-05-2022

const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('plantid', '');
    form.setFieldValue('storagelocationid','');
    form.setFieldValue('LotNumber', '');
    form.setFieldValue('WheatVariety', ' ');
    form.setFieldValue('ToLotNumber', ' ');
  }else if (Item === "PLANT"){
    form.setFieldValue('storagelocationid','');
    form.setFieldValue('LotNumber', '');
    form.setFieldValue('WheatVariety', '');
    form.setFieldValue('ToLotNumber', '');
  }else if (Item === "SL"){
    form.setFieldValue('LotNumber', '');
    form.setFieldValue('WheatVariety', '');
    form.setFieldValue('ToLotNumber', '');
  }else if (Item === "LOT"){
    form.setFieldValue('WheatVariety', '');
    form.setFieldValue('ToLotNumber', '');
      }
}
  const VehicleOption = [
    {
      options: [
        { value: "1", label: "With Vehicle"},
        { value: "2", label: "Without Vehicle" },
      
      ],
    },
  ];

  let { id } = useParams();
  let RelotId='';
  if(id){
    RelotId = id.replace(":", "");
  } 
  useEffect(() => {
    if (id && id!=":0") {
      getRelotDet();
    }
  }, [id]);
  const getRelotDet = () => {
    let fdata = {
      id: RelotId,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/relot/getRelotDetails", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
         // setWhPlantOptions([{ options: data.PlantList }]);
         // setWhLotOptions([{ options: data.LotList }]);
         // setWhWheetVarietyOptions([{ options: data.WheatList }]);

          form.setValues({
            WareHouse:data.results[0].WH_NAME,
            WareHouseID:data.results[0].fromwarehouseid,
            PlantCode:data.results[0].WERKS,
            Segment:data.results[0].Segment,
            plantid:data.results[0].PLANT_NAME,
            storagelocationid:data.results[0].FromLocationName,
            LotNumber:data.results[0].fromlotno,
            WheatVariety:data.results[0].WheatvarietyName,
            ToLotNumber:data.results[0].tolotno,
            QtyinMTS:data.results[0].QtyInMTS,
            QtyinMTS1:data.results[0].SAP_Qty,
            NoOfBags:data.results[0].NoOfBags,
            NoOfBags2:data.results[0].NoOfBags2,
            NoOfBags3:data.results[0].NoOfBags3,
            GunnylessWeight:data.results[0].GunnylessWeight,
            MaterialCode:data.results[0].MaterialCode,
            LoadingCharges:data.results[0].LoadingCharges,
            UnLoadingCharges:data.results[0].UnLoadingCharges,
            FreightCharges:data.results[0].FreightCharges,
            RelottingCharges:data.results[0].RelottingCharges,
            RejectReason:data.results[0].RejectReason
          })

          console.log(WhPlantOptions);
            /*
            form.setFieldValue('WareHouse', {  label: data.results[0].WH_NAME,value: data.results[0].fromwarehouseid });
            form.setFieldValue('plantid', {  label: data.results[0].PLANT_NAME,value: data.results[0].fromplantid });
            form.setFieldValue('LotNumber', {  label: data.results[0].fromlotno,value: data.results[0].fromlotid });
            form.setFieldValue('WheatVariety', {  label: data.results[0].WheatvarietyName,value: data.results[0].WheatVarietyId });
            form.setFieldValue('ToLotNumber', {  label: data.results[0].tolotno,value: data.results[0].tolotid });
            form.setFieldValue('BagType', {  label: data.results[0].BAG_NAME,value: data.results[0].BagType });
            */
            
            form.setFieldValue('BagType', {  label: data.results[0].BAG_NAME + "|"+data.results[0].GunnyWeight,   value: data.results[0].BagType });
            if(data.results[0].BAG_NAME2)
            form.setFieldValue('BagType2', {  label: data.results[0].BAG_NAME2 + "|"+data.results[0].GunnyWeight2, value: data.results[0].BagType2 });
            if(data.results[0].BAG_NAME3)
            form.setFieldValue('BagType3', {  label: data.results[0].BAG_NAME3 + "|"+data.results[0].GunnyWeight3, value: data.results[0].BagType3 });
            form.setFieldValue('Vehicle', data.results[0].Vehicle == "1"?{ label: "With Vehicle", value: "1"}:{label: "Without Vehicle", value: "2"});
            form.setFieldValue('RelottingVendor', {  label:data.results[0].Name,  value: data.results[0].RelottingVendorId });
            form.setFieldValue('RelottingReason', {  label: data.results[0].Relotreason,  value: data.results[0].RelottingReasonId });
            form.setFieldValue('FreightVendor', {  label: data.results[0].FreightVendorName,  value: data.results[0].FreightVendor });
          
            setFromLotDatas(data.FromLotInfo);
            setToLotDatas(data.ToLotInfo);
            if(data.results[0].Vehicle==1){
              document.getElementById("WithoutVehicle").style.display="none";
              document.getElementById("WithVehicle").style.display="";
            }
            if(data.results[0].Vehicle==2){
              document.getElementById("WithoutVehicle").style.display="";
              document.getElementById("WithVehicle").style.display="none";
            }
        
          }
        }
      )
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })

      .finally((a) => {
        hideLoader();
      });
  };
  const onVehcileChange = (e)=>{
    const { value, label } = e;
    if(e.value==1){
      document.getElementById("WithoutVehicle").style.display="none";
      document.getElementById("WithVehicle").style.display="";
    }
    if(e.value==2){
      document.getElementById("WithoutVehicle").style.display="";
      document.getElementById("WithVehicle").style.display="none";
    }
    form.setFieldValue('Vehicle', {  label: label,value: value });
  }
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      let _filesarr = {
        ...attachedFiles,
        [e.target.id]: e.target.files[0],
      };
      setAttachment(_filesarr);
    }
  };
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
  const BankOptions = [
    {
      options: [
        { value: "Bank 1", label: "Bank 1" },
        { value: "Bank 2", label: "Bank 2" },
     
      ],
    },
  ]; 
  const onTextChange = (e, key) => {
  console.log(JSON.stringify(e));
  form.setFieldValue(key, {  label: e.label,value: e.value });
  };
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log("SHOW ERROR:"+Id);
    document.getElementById(Id).innerHTML=Msg;
    }
  }
  }

  const UpdateRelotting = (RelotId) =>{
    let formData = form.values;
    let Data ={

      BagType:formData.BagType ? formData.BagType.value: 0,
      NoOfBags:formData.NoOfBags,

      BagType2:formData.BagType2 ? formData.BagType2.value: 0,
      NoOfBags2:formData.NoOfBags2,

      BagType3:formData.BagType3 ? formData.BagType3.value: 0,
      NoOfBags3:formData.NoOfBags3,

      GunnylessWeight   :formData.GunnylessWeight,

      QtyInMTS:formData.QtyinMTS,
      Vehicle           :formData.Vehicle.value,
      RelottingVendorId:formData.RelottingVendor.value,
      RelottingCharges:formData.RelottingCharges,
      RelottingReasonId:formData.RelottingReason.value,
      
      FreightVendor     :formData.FreightVendor ? formData.FreightVendor.value: 0,
      LoadingCharges    :formData.LoadingCharges,
      UnLoadingCharges  :formData.UnLoadingCharges,
      FreightCharges    :formData.FreightCharges,
      RejectReason: formData.RejectReason,
      RelotStatus:'1'

    }
  const postdata = {
    id:RelotId,
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/relot/updateRelot", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/RelottingEntry");
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

  /* new Code inset Arul # 14.04.2022
  const onCheckSAPQty = (e, QtyinMTS, QtyinMTS1) =>{
    console.log("For Checking SAP Qty and Qtyin MTS");
    if (QtyInMTS <= QtyinMTS1){
      form.setFieldValue('QtyinMTS', {  label: e.QtyinMTS  , value: e.QtyinMTS.value });
    }else{
      showError('QtyinMTS_Error','Check SAP QTY',0);	
    }
  }
  */

  const onCheckSAPQty = (e)=>{
    console.log("Checking SAP Qty Start");
    // if(isNaN(e.target.value)){return false; }

    let tempQty = e.target.value;
    if (parseFloat(tempQty) > parseFloat(form.values.QtyinMTS1)){
      console.log("** Checking SAP Qty Working **");
      errorToast("Qty in MTS shouldn't graterthan SAP");
      return false;
    }else{
      form.setValues({
        ...form.values,
        QtyinMTS:tempQty,
        GunnylessWeight:0,
        NoOfBags:0,
        NoOfBags2:0,
        NoOfBags3:0,
      })
      form.setFieldValue('BagType', '');
      form.setFieldValue('BagType2', '');
      form.setFieldValue('BagType3', '');

    }
    console.log("Checking SAP Qty End");
  };

  const onCalcGunny = (e,Key) =>{
    console.log("test");

    let BagType=Key=="BagType" ? e.label : form.values.BagType ? form.values.BagType.label:"";
    let BagTypeWeight=0;
    // if((Key=="BagType" || Key=="NoOfBags") && form.values.BagType){
      if(form.values.BagType){
    BagTypeWeight=BagType.split("|")[1];
    BagTypeWeight=BagTypeWeight.replace('KGs','');
    }

    let BagType2=Key=="BagType2" ? e.label : form.values.BagType2 ? form.values.BagType2.label:"";
    let BagTypeWeight2=0;
    // if((Key=="BagType2"  || Key=="NoOfBags2")&& form.values.BagType2){
    if(form.values.BagType2){
    BagTypeWeight2=BagType2.split("|")[1];
    BagTypeWeight2=BagTypeWeight2.replace('KGs','');
    }

    let BagType3=Key=="BagType3" ? e.label : form.values.BagType3 ? form.values.BagType3.label:"";
    let BagTypeWeight3=0;
    if(form.values.BagType3){
    BagTypeWeight3=BagType3.split("|")[1];
    BagTypeWeight3=BagTypeWeight3.replace('KGs','');
    }
    
    let NoOfBags=Key=="NoOfBags" ? e.target.value : form.values.NoOfBags ? form.values.NoOfBags :0;
    let NoOfBags2=Key=="NoOfBags2" ? e.target.value :form.values.NoOfBags2 ? form.values.NoOfBags2 :0;
    let NoOfBags3=Key=="NoOfBags3" ? e.target.value :form.values.NoOfBags3 ? form.values.NoOfBags3 :0 ;

    let Qty=form.values.QtyinMTS ? form.values.QtyinMTS :0
    let GunnylessWeight= parseFloat(Qty) + (parseFloat(BagTypeWeight * NoOfBags) + parseFloat(BagTypeWeight2 * NoOfBags2) + parseFloat(BagTypeWeight3 * NoOfBags3));
    GunnylessWeight=GunnylessWeight.toFixed(3);

    if(Key=="NoOfBags"||Key=="NoOfBags2"||Key=="NoOfBags3" ){
      form.setValues({
        ...form.values,
        GunnylessWeight,
        [Key]:e.target.value,
        //NoOfBags2,
        //NoOfBags3,
      });
    }else{
      form.setValues({
        ...form.values,
        GunnylessWeight,
      });
    }

    if(Key=="BagType"){
      form.setFieldValue('BagType', {  label: e.label,value: e.value });
    }
    if(Key=="BagType2"){
      form.setFieldValue('BagType2', {  label: e.label,value: e.value });
    }
    if(Key=="BagType3"){
      form.setFieldValue('BagType3', {  label: e.label,value: e.value });
    }
  }

  const SaveRelottingRequest = () => {
    if(isFilledAll()){
      return false;
    }

    let formData = form.values;
    console.log(JSON.stringify(formData));
    let fdata ={  
      RelotDate: `${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`,
      fromwarehouseid :formData.WareHouse.value,
      fromplantid     :formData.plantid.value,
      fromlocationid  :formData.storagelocationid.value,
      fromlotid       :formData.LotNumber.value,
      fromlotno       :formData.LotNumber.label,
      MaterialCode    :formData.MaterialCode,
      towarehouseid   :formData.WareHouse.value,
      toplantid       :formData.plantid.value,
      tolocationid    :formData.storagelocationid.value,
      tolotid         :formData.ToLotNumber.value,
      tolotno         :formData.ToLotNumber.label,
      WheatVarietyId  :formData.WheatVariety1 || formData.WheatVariety.value,

      QtyInMTS          :formData.QtyinMTS,

      BagType:formData.BagType ? formData.BagType.value: "",
      NoOfBags        :formData.NoOfBags,

      BagType2:formData.BagType2 ? formData.BagType2.value: "",
      NoOfBags2:formData.NoOfBags2,

      BagType3:formData.BagType3 ? formData.BagType3.value: "",
      NoOfBags3:formData.NoOfBags3,

      Vehicle           :formData.Vehicle.value,

      RelottingVendorId :formData.RelottingVendor.value,
      RelottingCharges  :formData.RelottingCharges,
      RelottingReasonId :formData.RelottingReason.value,
      
      FreightVendor     :formData.FreightVendor ? formData.FreightVendor.value: "",
      LoadingCharges    :formData.LoadingCharges,
      UnLoadingCharges  :formData.UnLoadingCharges,
      FreightCharges    :formData.FreightCharges,

      GunnylessWeight   :formData.GunnylessWeight,
      RejectReason      :form.RejectReason,
      RelotStatus:'1'
    }

    showLoader();
    apiPostMethod(RelottingUrl, fdata)
    .then((response) => {
      if (response.data.success) {
        ShowToast("Successfully updated...");
        history.push(`/warehouse/RelottingRequest`);
        window.location.reload();
      } 
      else if (response.data.error== "Clear Old Entries") {
        errorToast("Clear Old Entries..!");
      } 
      else if (response.data.success==0) {
        errorToast("Duplicate Record..!");
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    }).finally((a) => {
      hideLoader();
    });
  }
  const isFilledAll_old = () => {
    showError('WareHouse_Error','Select WareHouse',0);
    showError('plantid_Error','Select plantid',0);
    showError('LotNumber_Error','Select LotNumber',0);
    showError('WheatVariety_Error','Select WheatVariety',0);
    showError('SAPQty_Error','Enter SAPQty',0);
    showError('SRNO_Error','Enter SRNO',0);
    showError('SRQTY_Error','Enter SRQTY',0);
    showError('RatePerMT_Error','Enter RatePerMT',0);
    showError('Value90_Error','Enter Value90',0);
    showError('Company_Error','Select Company',0);
    showError('BankName_Error','Select BankName',0);
    showError('ColleratoralManager_Error','Select Collateral Manager',0);
    showError('SRValue_Error','Enter SRValue',0);	
    showError('QtyinMTS_Error','Enter SRValue',0);	


    let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    if(formData.length==0){ showError('WareHouse_Error','Enter Ware House',1); ShowError =1;  }
    if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
    if(!formData.plantid || !formData.plantid.value) { showError('plantid_Error','Select Storage Location',1); ShowError =1; }
    if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
    if(!formData.WheatVariety || !formData.WheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
    if(!formData.SAPQty) { showError('SAPQty_Error','Enter SAP Qty',1);  ShowError =1; }
    if(!formData.SRNO) { showError('SRNO_Error','Enter SR NO',1);  ShowError =1; }
    if(!formData.SRQTY) { showError('SRQTY_Error','Enter SR Qty in MTS',1);  ShowError =1; }
    if(!formData.RatePerMT) { showError('RatePerMT_Error','Enter Rate Per MT',1);  ShowError =1; }
    if(!formData.SRValue) { showError('SRValue_Error','Enter SR Value in RS',1);  ShowError =1; }
    if(!formData.Value90) { showError('Value90_Error','Enter 90% Value',1);  ShowError =1; }
    if(!formData.Company || !formData.Company) { showError('Company_Error','Select Company',1); ShowError =1; }
    if(!formData.BankName || !formData.BankName.value) { showError('BankName_Error','Select Bank Name',1); ShowError =1; }
    if(!formData.ColleratoralManager || !formData.ColleratoralManager) { showError('ColleratoralManager_Error','Select Collateral Manager',1); ShowError =1; }
    
    if(parseFloat(formData.QtyinMTS)>parseFloat(formData.QtyinMTS1)){ 
        showError('QtyinMTS_Error','QTY in MTS Greater than SAP QTY',1);  ShowError =1; 
      }

    if(parseFloat(formData.SRQTY)>parseFloat(formData.SAPQty)){
        showError('SRQTY_Error','SR Qty Greater than SAP QTY',1);  ShowError =1; 
      }
    if(ShowError==1){return true;}
  }
 
  const ColleratoralManagerOptions = [
    {
      options: [
        { value: "Colletoral Manager 1", label: "Colletoral Manager 1" },
        { value: "Colletoral Manager 2", label: "Colletoral Manager 2" },
        
     
      ],
    },
  ]; 
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    /*form.setValues({
      ...form.values,
      WareHouse: {label: label,value: value},
    });*/

    form.setFieldValue('WareHouse', {  label: label,value: value });

    //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
    setWhareHouseCode(value)
    
    FillPlantList(value, label); 
    ClearDropdown("WH");   //ms
  };

  const FillPlantList = (WH_CODE, WH_NAME) => {
    console.log(UserDetails.plantids);
    const fruits = UserDetails.plantids;
    let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" ,plantIds:fruits.toString()};
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          console.log("Plant") ;
          setWhPlantOptions([{ options: data.results }]);
          //commanded by Dijo on 09-05-2022
          // form.setValues({
          //   ...form.values,
          //   ColleratoralManager :  data.results[0].name_of_collateral,
          //   Company: data.results[0].company_name,
          //   WareHouse: {label: WH_NAME,value: WH_CODE},
          // });
          console.log("After Fetch Plant"+data.results[0].name_of_collateral) ;
          form.setFieldValue('WareHouse', {  label: WH_NAME, value: WH_CODE });
        }
      })
      .catch((error) => {
        errorToast("This Warehouse is not Applicable For Your User ID...");
      });
  };
  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
    
    //FillLotList(value);
    FillStorageLocationList(value);
    ClearDropdown("PLANT");
  };

  
  const onStorageLocationChange=(e)=>{
    const { value, label } = e; 
    form.setFieldValue('storagelocationid', {  label: label, value: value });
   // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label}) 
    FillLotList(value, label); 
    ClearDropdown("SL");
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

  const FillLotList = (sLocId, StorageLocation) => {
    let fdata = { storagelocationId: sLocId, plantid:form.values.plantid.value, screenType: "FUMIGATION" };

    apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          
          setWhLotOptions([{ options: data.results }]);
          form.setFieldValue('storagelocationid', {  label: StorageLocation, value: sLocId });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
    };


  const onLotChange = (e,type) => {
    const { value, label } = e;
    if(type==1){
      form.setFieldValue('LotNumber', {  label: label,value: value }); 
      // FillWheatVarityList(value,type);  
      ClearDropdown("LOT");
    }
    if(type==2){
      form.setFieldValue('ToLotNumber', {  label: label,value: value });
      // FillWheatVarityList(value,type);  
    }
  };

  // const FillWheatVarityList = (paramLotId,type) => {
  
    
  //   let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
  //   apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       if (data.success) {
  //         if(type==1){
  //           setWhWheetVarietyOptions([{ options: data.results }]);
  //         }
  //         getLotInfo(paramLotId,type, form.values.WheatVarietyId);

  //         /*if(type==1)
  //         {
  //           getLotInfo(paramLotId,1,form.values.WheatVarietyId);
  //         }
  //         if(type==2)
  //         {
  //           getLotInfo(paramLotId,2,form.values.WheatVarietyId);
  //         }*/
          
  //       }
  //     })
  //     .catch((error) => {
  //       errorToast("Something went wrong, please try again after sometime");
  //     });
  // };
  
  const getLotInfo = (paramLotId, type, pWheatVarietyId, WvLabel) => {

    let fdata = { lotid: paramLotId, SEGMENT: pWheatVarietyId, screenType: "RELOTTING" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getLotInformation', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let qty='';
          
          if(type==1){
            setFromLotDatas(data.Det);
            for(let i=0;i<data.Det.length;i++){
              if(data.Det[i].wheatvarietyid==pWheatVarietyId){
                qty = data.Det[i].wheatqty;
              }
            }
            form.setValues({
              ...form.values,
              MaterialCode: data.MatCode[0].SeedVariety,
              WheatVariety1: data.MatCode[0].Id,
              QtyinMTS:qty,
              QtyinMTS1:qty
            })
            form.setFieldValue('WheatVariety', {  label: WvLabel,value: pWheatVarietyId });
            
          }else if(type==2){
            setToLotDatas(data.Det);
          }
        }
        
      })
      .catch((error) => {
        console.log(error);
        //errorToast("Something went wrong, please try again after sometime");
      });
  };

  
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    
    //form.setFieldValue('WheatVariety', {  label: label,value: value });
    if(form.values.LotNumber)
    {
      getLotInfo(form.values.LotNumber.value,1,value,label);
    }

    if(form.values.ToLotNumber)
    {
      getLotInfo(form.values.ToLotNumber.value, 2, value, label); 
    }
   

    //FillWheatVarityList(value);
  };

  const { qcwrkdoc } = attachedFiles;
  const isFilledAll = () => {
    showError('WareHouse_Error','Select WareHouse',0);
    showError('plantid_Error','Select plantid',0);
    showError('LotNumber_Error','Select LotNumber',0);
    showError('WheatVariety_Error','Select WheatVariety',0);
    showError('ToLotNumber_Error','Select ToLotNumber',0);
    showError('BagType_Error','Select BagType',0);
    showError('NoOfBags_Error','Enter NoOfBags',0);
    showError('QtyinMTS_Error','Enter QtyinMTS',0);
    showError('QtyinMTS1_Error','Enter QtyinMTS1',0);
    showError('RelottingVendor_Error','Select RelottingVendor',0);
    showError('RelottingCharges_Error','Enter RelottingCharges',0);
    showError('RelottingReason_Error','Select RelottingReason',0);
    showError('Vehicle_Error','Select Vehcile',0);

    let formData = form.values;
    console.log(JSON.stringify(form.values));
    let ShowError = 0;

    if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
    if(!formData.plantid || !formData.plantid.value) { showError('plantid_Error','Select Plant',1); ShowError =1; }
    if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
    
    if(!formData.WheatVariety  || !formData.WheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
    
    if(!formData.ToLotNumber || !formData.ToLotNumber.value) { showError('ToLotNumber_Error','Select To Lot Number',1); ShowError =1; }
    if(!formData.BagType || !formData.BagType.value) { showError('BagType_Error','Select Bag Type',1); ShowError =1; }
    if(!formData.NoOfBags) { showError('NoOfBags_Error','Enter No Of Bags',1);  ShowError =1; }
    if(!formData.QtyinMTS) { showError('QtyinMTS_Error','Enter Qty in MTS',1);  ShowError =1; }
    if(!formData.RelottingVendor || !formData.RelottingVendor.value) { showError('RelottingVendor_Error','Select Relotting Vendor',1); ShowError =1; }
    if(!formData.RelottingReason || !formData.RelottingReason.value) { showError('RelottingReason_Error','Select Relotting Reason',1); ShowError =1; }
    // if(formData.LotNumber && formData.ToLotNumber && formData.LotNumber.value == formData.ToLotNumber.value) { showError('RelottingReason_Error','From Lot and To Lot should not be same',1); ShowError =1; }
    if(!formData.Vehicle || !formData.Vehicle.value) { showError('Vehicle_Error','Select Vehicle',1); ShowError =1; }
    
    if(formData.Vehicle.value==1){
      if(!formData.FreightVendor || !formData.FreightVendor.value) { showError('FreightVendor_Error','Select Freight Vendor',1);  ShowError =1; }
      if(!formData.LoadingCharges) { showError('LoadingCharges_Error','Enter Loading Charges',1);  ShowError =1; }
      if(!formData.UnLoadingCharges) { showError('UnLoadingCharges_Error','Enter UnLoading Charges',1);  ShowError =1; }
      if(!formData.FreightCharges) { showError('FreightCharges_Error','Enter Freight Charges',1);  ShowError =1; }
    }
    if(formData.Vehicle.value==2){
      console.log("Stoper 001");
      if(!formData.RelottingCharges) { showError('RelottingCharges_Error','Enter Relotting Charges',1);  ShowError =1; }
    }

    if(parseFloat(formData.QtyinMTS) > parseFloat(formData.QtyinMTS1)){ 
      showError('QtyinMTS_Error','QTY_MTS Greater than SAP_QTY',1);  ShowError =1; 
    }
    

    if(ShowError==1){return true;}
  }

  const onchangeVendor = (e) => {
    form.setValues({
      ...form.values,
      RelottingCharges:e.RelottingCharge
    })
    form.setFieldValue("RelottingVendor",{label:e.label,value:e.value});
  }
  const calcSRValue = (e) =>{
    if(isNaN(e.target.value)){return false; }
    if(e.target.value<0){
      e.target.value=e.target.value-1;
    }
    let SRQTY=0, RatePerMT=0, SRValue=0, Value90=0;

    if(e.target.id=="SRQTY"){
      if(parseFloat(e.target.value)<=parseFloat(form.values.SAPQty)){
        RatePerMT=form.values.RatePerMT;
        SRQTY=e.target.value;
      }else
      {
        errorToast("SRQTY greater than SAP QTY")    ;
        return false;
      }
      // form.values.SRQTY=e.target.value;
    }
    else if(e.target.id=="RatePerMT")
    {
      SRQTY=form.values.SRQTY;
       RatePerMT=e.target.value;
      //form.values.RatePerMT=e.target.value;
    }
    
    SRValue = RatePerMT*SRQTY;
    Value90 = parseFloat( RatePerMT*SRQTY*90/100).toFixed(3);
    

    let LoanRateCalc=e.target.value*form.values.SRQty;
    form.setValues({
      ...form.values,
      LoanAmount:e.target.value,
      SRValue:SRValue,
      Value90:Value90,
      RatePerMT:RatePerMT,
      SRQTY:SRQTY,

    })

  }


  const CalcelClick = () => {
    history.push("/warehouse/RelottingQcValidation");
  }

  useEffect(() => {
    if (WhareHouseCode != '' && form.values.plantid != '' && form.values.storagelocationid != '' && form.values.LotNumber != '') {
      showWarehousewisestocks();
    }
  }, [WhareHouseCode,form.values.plantid?.label,form.values.storagelocationid?.label,form.values.LotNumber?.label]);


  const showWarehousewisestocks = (e) => {

    let fdata = {
    Screen:"WAREHOOUSESTOCK",
    warehouseid:WhareHouseCode,
    plantId:form.values.plantid.label,
    storagelocationid:form.values.storagelocationid.label,
    lotId:form.values.LotNumber.label,
    };
  showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
   .then((response) => {
     const { data } = response;
     let tableData = data.results
     let sp_work_order_array = []
     const option = []

     tableData.map(({ SEGMENT,WHEAT_VARIETY }) => {
      sp_work_order_array.push(SEGMENT)
      option.push({ value: SEGMENT, label: WHEAT_VARIETY })
      setWhWheetVarietyOptions(option);
      })
   })
   .catch((error) => {
     errorToast("No Stock Available In This Lot");
   })
   .finally((a) => {
     hideLoader();
   });
  }

  useEffect(() => {
    if (form.values.WheatVariety) {
      showWarehousewisestocksQTY();
    }
  }, [form.values.WheatVariety?.value]);

  const showWarehousewisestocksQTY = (e) => {

    let fdata = {
    Screen:"WAREHOOUSESTOCK",
    warehouseid:WhareHouseCode,
    plantId:form.values.plantid.label,
    storagelocationid:form.values.storagelocationid.label,
    lotId:form.values.LotNumber.label,
    WheatVariety:form.values.WheatVariety.value,
    };

    // console.log(form.values.WheatVariety.value)

  showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
   .then((response) => {
    const { data } = response;
    let tableData = data.results
      let filterData = tableData.filter(
        (data) => data.SEGMENT == form.values.WheatVariety.value
      )
      // console.log(filterData)
    form.setValues({
      ...form.values,
      QtyinMTS:filterData[0].STOCK,
      QtyinMTS1:filterData[0].STOCK
    })
   })
   .catch((error) => {
     errorToast("No Stock Available In This Lot");
   })
   .finally((a) => {
     hideLoader();
   });
  }
  
  useEffect(() => {
    if (form.values.Segment) {
      showWarehousewisestocksQTYEdit();
    }
  }, [form.values.Segment]);

  const showWarehousewisestocksQTYEdit = (e) => {

    let fdata = {
    Screen:"WAREHOOUSESTOCK",
    warehouseid:form.values.WareHouseID,
    plantId:form.values.PlantCode,
    storagelocationid:form.values.storagelocationid,
    lotId:form.values.LotNumber,
    WheatVariety:form.values.Segment,
    };

    // console.log(form.values.WheatVariety.value)

  showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
   .then((response) => {
    const { data } = response;
    let tableData = data.results
      let filterData = tableData.filter(
        (data) => data.SEGMENT == form.values.Segment
      )
      // console.log(filterData)
    form.setValues({
      ...form.values,
      // QtyinMTS:filterData[0].STOCK,
      QtyinMTS1:filterData[0].STOCK
    })
   })
   .catch((error) => {
     errorToast("No Stock Available In This Lot");
   })
   .finally((a) => {
     hideLoader();
   });
  }

  
    return (
      <Fragment>
        <Row>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"System Date"} form={form} id="Wh_name" type="text"  placeholder={date} disabled/>
          </Col>
          <Col md="4" sm="12" >
            {RelotId && <CustomTextInput label={'Ware House'} form={form} id='WareHouse'  disabled />}
            {!RelotId && <CustomDropdownInput style={{"minwidth":"270px"}} 
                            url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
                            label={"Warehouse Name"} 
                            id={"WareHouse"}
                            form={form} 
                            option={warehouseoption}
                            onChange={onWarehouseChange} 
                          />}
                          <span id='warehouseid_Error' style={{color: 'red'}} ></span>
                          </Col>

          <Col md="4" sm="12" >
            {RelotId && <CustomTextInput label={'Plant'} form={form} id='plantid'  disabled />}
            {!RelotId && <><Label>Plant</Label>
              <CustomDropdownInput style={{"width":"370px"}}
              form={form} 
              // label={"Plant"}
                options={WhPlantOptions}
                id={"plantid"}
                className="react-select"
                classNamePrefix="select"
                
                onChange={(e) => onPlantChange(e)}
                /></>}
            <span id="plantid_Error" style={{color: "red"}} ></span>
          </Col>
        </Row>

        <Row>
          <Col md="4" sm="12"> 
            {RelotId && <CustomTextInput label={'Storage Location'} form={form} id='storagelocationid'  disabled />}
            {!RelotId && <><Label>Storage Location</Label>
              <CustomDropdownInput style={{"width":"370px"}}
                      options= {storageLocationOption}
                      form={form}
                      id="storagelocationid"
                      className="react-select"
                      classNamePrefix="select"

                      onChange ={(e)=> onStorageLocationChange(e)}
                      // onChange={onStorageLocationChange}
              /></>} 
              <span id='locationid_Error' style={{color: 'red'}} ></span>
          </Col>
          
          <Col md="4" sm="12" >
           {RelotId && <CustomTextInput label={'From Lot No'} form={form} id='LotNumber'  disabled />}
           {!RelotId && <> <label>From Lot No</label>
            <CustomDropdownInput options={WhLotOptions} 
                    form={form} 
                    id="LotNumber" 
                    className="react-select"
                    classNamePrefix="select"
                    onChange={(e) => onLotChange(e,'1')}
            />
            <span id="LotNumber_Error" style={{color: "red"}} ></span></>}
          </Col>
          
          <Col md="4" sm="12" >
            {RelotId && <CustomTextInput label={'Wheat Variety'} form={form} id='WheatVariety'  disabled />}
            {!RelotId && <> <label>Wheat Variety</label>
              <CustomDropdownInput
                    style={{"width":"170px"}}
                    form={form}
                    options={WhWheatvarietyOptions}
                    id={"WheatVariety"}
                    className="react-select"
                    classNamePrefix="select"
                    onChange={(e) => onWheatvarietyChange(e)}
              />
            <span id="WheatVariety_Error" style={{color: "red"}} ></span></>}
          </Col> 
        </Row>
          
        <Row>
          <Col md="4" sm="12" >
            <CustomTextInput label={'Material Code'} form={form} id='MaterialCode'  disabled />
          </Col>  
          <Col md="4" sm="12" >
            {RelotId && <CustomTextInput label={'To Lot Number'} form={form} id='ToLotNumber'  disabled />}
            {!RelotId && <> <label>To Lot No</label>
            <CustomDropdownInput 
              options={WhLotOptions} 
              form={form} id="ToLotNumber" 
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => onLotChange(e,'2')}
            />
            <span id='ToLotNumber_Error' style={{color: 'red'}} ></span></>}
          </Col>
          <Col md="2" sm="12">
            <CustomTextInput label={"SAP Qty"} form={form} isNumberOnly maxlength={10} id="QtyinMTS1" disabled/>
            <span id='QtyinMTS1_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="2" sm="12">
            <CustomTextInput 
              label={"Qty in KG"} 
              form={form} 
              isNumberOnly 
              maxlength={10} 
              id="QtyinMTS"
              onChange = {onCheckSAPQty}
            />
            <span id='QtyinMTS_Error' style={{color: 'red'}} ></span>
          </Col>
        </Row>

        <div style={{border: "2px solid #7367f0 ", padding:"5px"}}>
        
        <Row><Col md="3" sm="12" >Bag Type</Col></Row>
        <Row>
          <Col md="3" sm="12" >
            <CustomDropdownInput style={{"minwidth":"270px"}}
              url={`${apiBaseUrl}warehouse/master/bagtype_new`} 
              label={"Bag Type"} 
              form={form} 
              id="BagType"   
              onChange={(e) => onCalcGunny(e,'BagType')}  />
            <span id='BagType_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="3" sm="12">
            <CustomTextInput label={"No Of Bags"} 
              form={form} isNumberOnly
              maxlength={10} 
              id="NoOfBags" 
              onChange={(e) => onCalcGunny(e,'NoOfBags')}  />
            <span id='NoOfBags_Error' style={{color: 'red'}} ></span>
          </Col> 
        </Row>

        <Row>
          <Col md="3" sm="12" >
            <CustomDropdownInput style={{"minwidth":"270px"}}
              url={`${apiBaseUrl}warehouse/master/bagtype_new`} 
              label={"Bag Type(2)"} 
              form={form} 
              id="BagType2" 
              onChange={(e) => onCalcGunny(e,'BagType2')}  
            />
          </Col>
          <Col md="3" sm="12">
            <CustomTextInput label={"No Of Bags(2)"} 
              form={form} isNumberOnly
              maxlength={10} 
              id="NoOfBags2" 
              onChange={(e) => onCalcGunny(e,'NoOfBags2')}  
            />
          </Col>
        </Row>

        <Row>
          <Col md="3" sm="12" >
            <CustomDropdownInput  style={{"minwidth":"270px"}}
              url={`${apiBaseUrl}warehouse/master/bagtype_new`} 
              label={"Bag Type(3)"} 
              form={form} 
              id="BagType3" 
              onChange={(e) => onCalcGunny(e,'BagType3')} 
            />
          </Col>
          <Col md="3" sm="12">
            <CustomTextInput 
              label={"No Of Bags(3)"} 
              form={form} isNumberOnly
              maxlength={10} 
              id="NoOfBags3" 
              onChange={(e) => onCalcGunny(e,'NoOfBags3')}  
            />
          </Col>

          <Col md="3" sm="12">
            <CustomTextInput label={"Net Weight in kgs"} form={form} isNumberOnly
            maxlength={10} id="GunnylessWeight" disabled/>              {/* Disabled */}
          </Col>
        </Row>
      </div>
          
      <Row>
        <Col md="4" sm="12" >
          <label>Vehicle </label>
            <CustomDropdownInput style={{"minwidth":"270px"}}
              options={VehicleOption} 
              form={form} 
              id="Vehicle" 
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => onVehcileChange(e)}
            />
          <span id='Vehicle_Error' style={{color: 'red'}} ></span>
        </Col>
      </Row>
      <Row>
        <Col md="4" sm="12" >
          <CustomDropdownInput style={{"minwidth":"270px"}}
            url={`${apiBaseUrl}warehouse/master/relottingreason`} 
            label={"Relotting Reason"} form={form} id="RelottingReason"  
          />
          <span id='RelottingReason_Error' style={{color: 'red'}} ></span>
        </Col>
        
        <Col md="4" sm="12" >
          <CustomDropdownInput style={{"minwidth":"270px"}}
            url={`${apiBaseUrl}warehouse/master/relottingvendor`} 
            label={"Relotting Vendor"} form={form} id="RelottingVendor" 
            onChange={(e) => onchangeVendor(e)}
          />
          <span id='RelottingVendor_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="4" sm="12" id="WithoutVehicle">
          <CustomTextInput label={"Relotting Charges"} form={form} isNumberOnly
            maxlength={10} id="RelottingCharges" 
          />
          <span id='RelottingCharges_Error' style={{color: 'red'}} ></span>
        </Col>
      </Row>

      <Row id="WithVehicle">
        <Col md="2" sm="12">
          <CustomTextInput label={"Loading Charges"} form={form} isNumberOnly
            maxlength={10} id="LoadingCharges" 
          />
          <span id='LoadingCharges_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="2" sm="12">
          <CustomTextInput label={"UnLoading Charges"} form={form} isNumberOnly
            maxlength={10} id="UnLoadingCharges" 
          />
          <span id='UnLoadingCharges_Error' style={{color: 'red'}} ></span>

        </Col>
        <Col md="4" sm="12" >
          <CustomDropdownInput style={{"minwidth":"270px"}}
            url={`${apiBaseUrl}warehouse/master/relottingvendor`} 
            label={"Freight Vendor"} 
            form={form} 
            id="FreightVendor" 
           
          />
         <span id='FreightVendor_Error' style={{color: 'red'}} ></span>
           </Col>
        <Col md="4" sm="12">
         <CustomTextInput label={"Freight Charges"} form={form} isNumberOnly
          maxlength={10} id="FreightCharges" />
         
         <span id='FreightCharges_Error' style={{color: 'red'}} ></span>

        </Col>
           </Row>
          <Row>
            
          <Col md="12" sm="12" >
            <table  style={{width:"80%",color:"#fff", backgroundColor:"#7367f0"}}>
            <thead>  <tr><th colSpan={2} style={{textAlign:"center"}}>Current Stock </th></tr> </thead>
            <tr><td>
           
          <table  border={1}  style={{width:"100%",border: "2px solid #fff ",color:"#fff", backgroundColor:"#7367f0"}}>
          <thead>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>

          {FromLotDatas &&
          FromLotDatas.length>0 &&
          FromLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>
          </table> 
          </td>
          <td>
          <table  border={1}  style={{width:"100%",border: "2px solid #fff ",color:"#fff", backgroundColor:"#7367f0"}}>
          <thead>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>
          {ToLotDatas &&
          ToLotDatas.length>0 &&
          ToLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>

          </table> 
          </td></tr>
          </table>
          </Col>
          </Row>
        
        
          <Row>
            <Col sm="12">
              <CustomTextInput label={"Reject Reason"} form={form} id="RejectReason" />
            </Col>

            <Col sm="12">
            <FormGroup className="d-flex justify-content-end mb-0">
              {!RelotId &&  <Button.Ripple color="primary"  type="Button"  onClick={(e) => SaveRelottingRequest()} >
                              Submit
                            </Button.Ripple>}
            &nbsp;&nbsp;&nbsp; 
                           {RelotId &&   <Button.Ripple color="primary"  type="Button"  onClick={(e) => UpdateRelotting(RelotId)} >
                            Submit
                          </Button.Ripple>}
            &nbsp;&nbsp;&nbsp; 
              {RelotId &&   <Button.Ripple color="primary"  type="Button" onClick={(e) => CalcelClick(RelotId)}>
                            Cancel
                          </Button.Ripple>}
            </FormGroup>
            </Col>
      </Row>
      </Fragment>
    )
}


const RelottingEntryScreenData = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
 
       Wh_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
       SLocation: validation.required({  message:"Storage Location should not be empty",isObject: true }),
       LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
       WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
       SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
       BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
       LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
       LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
       LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
       LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
       FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
       RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
       FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
      
    
     }),
    onSubmit(values) {},
  });
  const onSubmit= () => {

  }
  return (
    <Fragment>
    
      <CardComponent  header="Relotting Request">
     
       <RelottingEntryScreen form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
  )
}

export default RelottingEntryScreenData