import React, { Fragment, useEffect,useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 

import { Row, Col,Button,Table,FormGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Select from "react-select";
import { Plan_R_and_D_Confirmationlists } from "./Plan_R_and_D_Confirmation_list";
import { ApprovalScreenlists } from "./ApprovalScreenlist";
import { MovementApprovedEntryScreenList, MovementApprovedEntryScreenLists } from "./MovementApprovedEntryScreenList";

const MovementApprovedEntryScreenData = ({ form }) => {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  //const {WH_CODE}=form.values.WH_CODE;

  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      onFetchSDIdetailsById();
    }
   else if(!form.values.MovementGroupNumber){
      getMovementGroupNumber();
    }
  }, [id]);
  const getMovementGroupNumber = () =>{
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/Master/getMovementGroupNumber", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            MovementGroupNumber:data.results[0].MovementGroupNumber,        
          })
  
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime...");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  const onFetchSDIdetailsById = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/getPlanGroupFromPlanId", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {

          let vd = [];
          let NewData={};
          vd = [...PlanDatas];
          for(let i=0;i<data.results.length;i++){
            if(data.results[i].planid!=refid || true){
              NewData={
                planid:data.results[i].planid,
                MovementGroupNumber:data.results[i].MovementGroupNumber,
                WeekNo:data.results[i].WeekNo,WeekNoName:data.results[i].WeekNoName,
                date:data.results[i].date,
                WareHouse:data.results[i].WareHouse,WareHouseName:data.results[i].WareHouseName,
                WheatVariety:data.results[i].WheatVariety,WheatVarietyName:data.results[i].WheatVarietyName,
                ActualStock:data.results[i].ActualStock,
                StorageLocationName:data.results[i].StorageLocationName,
                RandDConfirmedQty:data.results[i].RandDConfirmedQty,
                LotNumber:data.results[i].LotNumber,LotNumberName:data.results[i].LotNumberName,
                FumigationClearedQty:data.results[i].FumigationClearedQty,
                Division:data.results[i].Division,
                KeyLoanDOQty:data.results[i].KeyLoanDOQty,
                MovementQty:data.results[i].MovementQty,
                ActualMovementQty:data.results[i].ActualMovementQty,
                MixingRatio:data.results[i].MixingRatio,
                ValidFrom:data.results[i].ValidFrom,
                ValidTo:data.results[i].ValidTo,   
                RestrictMode:data.results[i].RestrictMode,
                ReceivingBin:data.results[i].ReceivingBin,
                ReceivingBinName:data.results[i].ReceivingBinName,
                RndSkipFlag:data.results[i].RndSkipFlag,
                FumigationSkipFlag:data.results[i].FumigationSkipFlag,
             
              }
              vd.push(NewData);
            }else{
              form.setValues({
                planid:data.results[i].planid,
                MovementGroupNumber:data.results[i].MovementGroupNumber,
                date:data.results[i].date,
                ActualStock:data.results[i].ActualStock,
                RandDConfirmedQty:data.results[i].RandDConfirmedQty,
                FumigationClearedQty:data.results[i].FumigationClearedQty,
                Division:data.results[i].Division,
                KeyLoanDOQty:data.results[i].KeyLoanDOQty,
                MovementQty:data.results[i].MovementQty,
                AddedMovementQty:data.results[i].MovementQty,
                ActualMovementQty:data.results[i].ActualMovementQty,
                MixingRatio:data.results[i].MixingRatio,
                ValidFrom:data.results[i].ValidFrom,
                ValidTo:data.results[i].ValidTo,
                MinNumberQty:data.results[i].MovementQty,

                fromplantid:data.results[i].fromplantid,
                WeekNoName:data.results[i].WeekNoName,
                WareHouseName:data.results[i].WareHouseName,
                PlantName:data.results[i].PLANT_NAME,
                WheatVarityName:data.results[i].WheatVarietyName,
                LotNumberName:data.results[i].LotNumberName,
                RestrictModeName:data.results[i].RestrictMode,
               
              })
              form.setFieldValue('WeekNo', {  label:data.results[i].WeekNoName,value: data.results[i].WeekNo });
              form.setFieldValue('WareHouse', {  label:data.results[i].WareHouseName,value: data.results[i].WareHouse });
              form.setFieldValue('WheatVariety', {  label:data.results[i].WheatVarietyName,value: data.results[i].WheatVariety });
              form.setFieldValue('LotNumber', {  label:data.results[i].LotNumberName,value: data.results[i].LotNumber });
              form.setFieldValue('RestrictMode', {  label:data.results[i].RestrictMode,value: data.results[i].RestrictMode });

              
            }
          }
    
       
    
        setPlanData(vd);

         
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  const addTblRecord = () => {
    
    showError('MovementGroupNumber_Error','',0);
    showError('WeekNo_Error','',0);
    showError('date_Error','',0);
    showError('WareHouse_Error','',0);
    showError('WheatVariety_Error','',0);
    showError('ActualStock_Error','',0);
    showError('RandDConfirmedQty_Error','',0);
    showError('LotNumber_Error','',0);
    showError('FumigationClearedQty_Error','',0);
    showError('Division_Error','',0);
    showError('KeyLoanDOQty_Error','',0);
    showError('MovementQty_Error','',0);
    showError('ActualMovementQty_Error','',0);
    showError('MixingRatio_Error','',0);
    showError('ValidFrom_Error','',0);
    showError('ValidTo_Error','',0);
    showError('RestrictMode_Error','',0);
    let AddedMovementQty=form.values.AddedMovementQty;
    if(form.values.MovementQty < AddedMovementQty){
      errorToast("Movement Qty Should not be less than Already added Qty..!");  
      return false;
    }

    let RetFalse=0;

    if(!form.values.MovementGroupNumber || form.values.MovementGroupNumber==''){ showError('MovementGroupNumber_Error','Enter Movement Group Number',1); RetFalse=1; }
    if(!form.values.WeekNo || form.values.WeekNo.value==''){ showError('WeekNo_Error','Select Week No',1);RetFalse=1;}
    if(!form.values.date || form.values.date==''){ showError('date_Error','Enter date',1); RetFalse=1;}
    if(!form.values.WareHouse || form.values.WareHouse.value==''){ showError('WareHouse_Error','Select WareHouse',1); RetFalse=1;}
    if(!form.values.WheatVariety || form.values.WheatVariety.value==''){ showError('WheatVariety_Error','Select Wheat Variety',1); RetFalse=1;}
    if(!form.values.ActualStock || form.values.ActualStock==''){ showError('ActualStock_Error','Enter Actual Stock',1); RetFalse=1;}
    if(!form.values.RandDConfirmedQty || form.values.RandDConfirmedQty==''){ showError('RandDConfirmedQty_Error','Enter RandD Confirmed Qty',1); RetFalse=1;}
    if(!form.values.LotNumber || form.values.LotNumber.value==''){ showError('LotNumber_Error','Select Lot Number',1);RetFalse=1;}
    if(!form.values.FumigationClearedQty || form.values.FumigationClearedQty==''){ showError('FumigationClearedQty_Error','Enter Fumigation Cleared Qty',1); RetFalse=1;}
    if(!form.values.Division || form.values.Division==''){ showError('Division_Error','Enter Division',1); RetFalse=1;}
    if(!form.values.KeyLoanDOQty || form.values.KeyLoanDOQty==''){ showError('KeyLoanDOQty_Error','Enter KeyLoan DO Qty',1); RetFalse=1;}
    if(!form.values.MovementQty || form.values.MovementQty==''){ showError('MovementQty_Error','Enter Movement Qty',1); RetFalse=1;}
    //if(!form.values.ActualMovementQty || form.values.ActualMovementQty==''){ showError('ActualMovementQty_Error','Enter Actual Movement Qty',1); RetFalse=1;}
    //if(!form.values.MixingRatio || form.values.MixingRatio==''){ showError('MixingRatio_Error','Enter Mixing Ratio',1); RetFalse=1;}
    if(!form.values.ValidFrom || form.values.ValidFrom==''){ showError('ValidFrom_Error','Enter Valid From',1); RetFalse=1;}
    if(!form.values.ValidTo || form.values.ValidTo==''){ showError('ValidTo_Error','Enter Valid To',1); RetFalse=1;}
    if(!form.values.RestrictMode || form.values.RestrictMode.value==''){ showError('RestrictMode_Error','Enter Restrict Mode',1); return false}

    if(RetFalse==1){
      return false;
    }

    

    console.log("start")
    console.log(JSON.stringify(PlanDatas));
    console.log("form");
    console.log(JSON.stringify(form));
    let Len=parseFloat(PlanDatas.length)+parseFloat(1);
    let NewData={
      planid:form.values.planid,
      MovementGroupNumber:form.values.MovementGroupNumber,
WeekNo:form.values.WeekNo.value,WeekNoName:form.values.WeekNo.label,
date:form.values.date,
WareHouse:form.values.WareHouse.value,WareHouseName:form.values.WareHouse.label,
//Plant:form.values.plantid.value,PlantName:form.values.plantid.label,
Plant:form.values.fromplantid,PlantName:form.values.PlantName,

WheatVariety:form.values.WheatVariety.value,WheatVarietyName:form.values.WheatVariety.label,
ActualStock:form.values.ActualStock,
RandDConfirmedQty:form.values.RandDConfirmedQty,
LotNumber:form.values.LotNumber.value,LotNumberName:form.values.LotNumber.label,
FumigationClearedQty:form.values.FumigationClearedQty,
Division:form.values.Division,
KeyLoanDOQty:form.values.KeyLoanDOQty,
MovementQty:form.values.MovementQty,
ActualMovementQty:form.values.ActualMovementQty ? form.values.ActualMovementQty :0,
MixingRatio:form.values.MixingRatio ? form.values.MixingRatio :0,
ValidFrom:form.values.ValidFrom,
ValidTo:form.values.ValidTo,
RestrictMode:form.values.RestrictMode.value,
    };
    let vd = [];
  
      vd = [...PlanDatas];

    vd.push(NewData);

    setPlanData(vd);
    console.log(JSON.stringify(PlanDatas));
    console.log("OK");
    form.setValues({
      ...form.values,
      planid:form.values.planid,
      MovementGroupNumber:form.values.MovementGroupNumber,
      WeekNo:'',
date:'',



ActualStock:'',
RandDConfirmedQty:'',

FumigationClearedQty:'',
Division:'',
KeyLoanDOQty:'',
//MovementQty:'',
ActualMovementQty:'',
MixingRatio:'',
ValidFrom:'',
ValidTo:'',
RestrictMode:'',

WeekNoName:'',
WareHouseName:'',
PlantName:'',
WheatVarityName:'',
LotNumberName:'',
RestrictModeName:''

    });
document.getElementById("MovementQty").disabled=true;

form.setFieldValue('WareHouse', {  label: "",value: "" });
form.setFieldValue('plantid', {  label: "",value: "" });
form.setFieldValue('LotNumber', {  label: "",value: "" });
form.setFieldValue('WheatVariety', {  label: "",value: "" });

    //setPlanData(newVal);
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
  const EditRow = (item,i) =>{

    form.setValues({
      planid:item.planid,
      MovementGroupNumber:item.MovementGroupNumber,
      date:item.date,
ActualStock:item.ActualStock,
RandDConfirmedQty:item.RandDConfirmedQty,
FumigationClearedQty:item.FumigationClearedQty,
Division:item.Division,
KeyLoanDOQty:item.KeyLoanDOQty,
MovementQty:item.MovementQty,
ActualMovementQty:item.ActualMovementQty,
MixingRatio:item.MixingRatio,
ValidFrom:item.ValidFrom,
ValidTo:item.ValidTo,

    })
    form.setFieldValue('WeekNo', {  label: item.WeekNoName,value: item.WeekNo });
    form.setFieldValue('WareHouse', {  label: item.WareHouseName,value: item.WareHouse });
    form.setFieldValue('WheatVariety', {  label: item.WheatVarietyName,value: item.WheatVariety });
    form.setFieldValue('LotNumber', {  label: item.LotNumberName,value: item.LotNumber });
    form.setFieldValue('RestrictMode', {  label: item.RestrictMode,value: item.RestrictMode });


    
    let vdata = [...PlanDatas];
    vdata.splice(i, 1);
    setPlanData(vdata);

  }
  const DeleteRow = (i) =>{
    let vdata = [...PlanDatas];
    vdata.splice(i, 1);
    setPlanData(vdata);
  }
  const AddValue = ()=>{
    if(form.values.WeekNo && form.values.WeekNo!=""){
      return true;
    }else{
      return false;
    }
  }
  const onSubmit = (ApproveStatus) => {
   
 

    const postdata = {
      PlanDatas,
      ApproveStatus,
      RejectReason:form.values.RejectReason ? form.values.RejectReason :"",
      Screen:"APPROVAL"
    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/AddUpdateSTOPODeliveryPlan", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        if(data.success){
        ShowToast("Saved Successfully...");
        //history.push(`/master/ead:`+UsrId);
        history.push(`/warehouse/STOPODeliveryCreationApproval`);
        }else{
          errorToast("Enter Atleast One Entry");  
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
  const RefreshPage = () => {
    history.push(`/master/STOPODeliveryCreationApproval`);
  };
  
  const onDateChange = (e) => {
    console.log(e.target.value);
    var dt1 = new Date(e.target.value);
    const wkno = getWeek(dt1);
    console.log("WeekNo" + wkno);
    form.values.date=e.target.value;
    form.setFieldValue('WeekNo', {  label: "W-"+wkno,value: wkno });
    console.log("WeekNo 1 " + getWeek(dt1));
    /*console.log(e);
    
    
      alert(e);
      alert(e.target.value);
      */

  };

  
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    
    form.setFieldValue('WareHouse', {  label: label,value: value });
    //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
    
    FillPlantList(value); 
  };

  const FillPlantList = (WH_CODE) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
    FillLotList(value);
  };

  const FillLotList = (paramPlantid) => {
    let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhLotOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLotChange = (e) => {
    const { value, label } = e;
    
    form.setFieldValue('LotNumber', {  label: label,value: value });

    
    FillWheatVarityList(value);
  };

  const FillWheatVarityList = (paramLotId) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhWheetVarietyOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

 
  const OnChangeMovementQty = (e) =>{

   for(let i=0;i<PlanDatas.length;i++){
    PlanDatas[i].MovementQty=e.target.value;
   }
    form.setValues({
      ...form.values,
      MovementQty:e.target.value
    })
  }
  const getActualQty =(e)=>{
    let ActualMovementQty1=(e.target.value/100)*form.values.KeyLoanDOQty;
let totalQty=ActualMovementQty1;
    for(let i=0;i<PlanDatas.length;i++){
      totalQty= parseFloat(PlanDatas[i].ActualMovementQty)+parseFloat(totalQty);
    }
    if(totalQty > form.values.MovementQty){
      errorToast("Invalid Mixing %, Actual Qty is Greater than Movement Qty");
      return false;
    }

    form.setValues({
      ...form.values,
      MixingRatio:e.target.value,
      ActualMovementQty:ActualMovementQty1
    })
  }
 
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    
   
    
    //FillWheatVarityList(value);
    getSublotData(label,value);
  };

  const getSublotData = (lab,val) => {
    let fdata = { 
      warehouseid: form.values.WareHouse.value, 
      plantid: form.values.plantid.value, 
      lotid: form.values.LotNumber.value, 
      WheatVarietyId: val, 
      screenType: "WEEKLYPLAN" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
         // setWhWheetVarietyOptions([{ options: data.results }]);
         form.setValues({
           ...form.values,
           ActualStock:data.results[0].wheatqty,
RandDConfirmedQty:data.results[0].Rndlockqty,
FumigationClearedQty:data.results[0].Fumigationlockqty,
KeyLoanDOQty:data.results[0].Unpledgeqty
         })

         form.setFieldValue('WheatVariety', {  label: lab,value: val });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const getWeek = (dt1) => {
    var onejan = new Date(dt1.getFullYear(),0,1);
    var today = new Date(dt1.getFullYear(),dt1.getMonth(),dt1.getDate());
    var dayOfYear = ((today - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
  };
  return ( 
    <Fragment >    
             {/* <Row>  
               <Col md="12" sm="6">
               <RefreshBlock />
               </Col>
      
      </Row> */}
        <Row>    
                
          <Col md="2" sm="12">
        <CustomTextInput label={"Month"}  form={form} id="month"  type="month"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col>
            <Col md="2" sm="12" > 
            <CustomDropdownInput   
           label={"Lot No"}  form={form} id="lotno" 
        //    onChange = {}
        //    options ={}   
          />
          <span id='lotno' style={{color: 'red'}} ></span>
            </Col> 
            <Col md="2" sm="12">
            <CustomDropdownInput   
           label={"Storage Location"}  form={form} id="PlantName" 
        //    onChange = {}
        //    options ={}   
          />
          <span id='PlantName' style={{color: 'red'}} ></span>
            </Col> 
            <Col md="2" sm="12">
            <CustomDropdownInput   
           label={"Plant"}  form={form} id="Plant" 
        //    onChange = {}
        //    options ={}   
          />
          <span id='Plant' style={{color: 'red'}} ></span>
            </Col>  
            <Col md="2" sm="12">
            <CustomDropdownInput   
           label={"warehouse"}  form={form} id="WareHouseName" 
        //    onChange = {onWarehouseChange}
        //    options ={warehouseoption}   
          />
          <span id='WareHouseName' style={{color: 'red'}} ></span>
            </Col>   
            </Row>  
            <Row>

           <Col md="2" sm="12">
            <CustomDropdownInput   
           label={"Wheat variety"}  form={form} id="Wheatvariety" 
        //    onChange = {}
        //    options ={}   
          />
          <span id='Wheatvariety' style={{color: 'red'}} ></span>
            </Col>  
            
            </Row>   
            <Row>
              <Col md="2" sm="12">
        <CustomTextInput label={"Current Month"}  form={form} id="month"  type="month"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col> 
          <Col md="2" sm="12">
        <CustomTextInput label={"Month"}  form={form} id="month"  type="text"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col>
          <Col md="2" sm="12">
        <CustomTextInput label={"Month"}  form={form} id="month"  type="text"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col> 
          <Col md="2" sm="12">
        <CustomTextInput label={"Month"}  form={form} id="month"  type="text"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col> 
          <Col md="2" sm="12">
        <CustomTextInput label={"All"}  form={form} id="month"  type="text"   />
          <span id='month_Error' style={{color: 'red'}} ></span> 
          </Col>
            </Row>    
            <div className="d-flex justify-content-center">
            <Button.Ripple  color="primary"   type="button" >
            Submit for Approval
          </Button.Ripple>
            </div>
       
    

               
        <div  >  
           <MovementApprovedEntryScreenLists/>   
          </div>  

    
    </Fragment>
  );
};


const MovementApprovedEntryScreen = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ message:"Date should not be empty", isObject: false }),
      /*From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),*/
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/STOPODeliveryCreationApproval`);
  };
 
  return (
    <Fragment >
       
      <CardComponent header="Movement Approved Entry" >    
       <RefreshBlock /> 
     
        {/* <div style={{overflowY:'auto',overflowX:'auto',maxWidth:'100vw',minHeight:'450px'}}> */}
        <MovementApprovedEntryScreenData form={form}  />
        {/* </div> */}
      </CardComponent>
        
    </Fragment>
  );
};

export default MovementApprovedEntryScreen;
