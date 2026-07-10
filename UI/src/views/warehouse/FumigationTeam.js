import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle, FormGroup } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import { fromPairs, isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
import DateComponent from '../common/dateComponent';
//import warehousebagcuttingentrylist from './bagcuttingapprovalscreen';


const FumigationTeam = ({form})  => { 
  const [bagcuttingEntryformData , setbagcuttingentryfromData] = useState([]);  
  const [formDBData , setformDBData] = useState([]);
  const [lotoption,setLotoption] = useState([]);  
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);   
  const [lotidoption, setlotidoption] = useState([]);                                                                       
  const [Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);
  const [locationoption,setLocationoption] = useState([]);  
  const [warehouseoption, setWarehouseoption] = useState([]);  
  const [WhLotOptions, setWhLotOptions] = useState([]); 
  const [Rate, setRate] = useState(''); 
  const [FumigationTypes, setFumigationTypes] = useState(''); 
  const [Area, setArea] = useState(''); 
  const [Gas, setGas] = useState(''); 
  const [LocationID, setLocationID] = useState(''); 
  const [LOT_OVERALL_STOCK, setLOT_OVERALL_STOCK] = useState(''); 
  const [WhFumigation, setWhFumigation] = useState([]); 
  const [StorageLocationName, setStorageLocationName] = useState(''); 
  const [Segment, setSegment] = useState(''); 
  const [WERKS, setWERKS] = useState(''); 
  const [WH_CODE, setWH_CODE] = useState(''); 


  

    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
        getSublotlist();
    }, [id]);

    useEffect(() => {
      if(LocationID && Segment && WERKS && StorageLocationName && WH_CODE){
      showWarehousewisestocks();
      }
     }, [LocationID,Segment,WERKS,StorageLocationName,WH_CODE]);
    const getSublotlist = () => {
      let Data=form.values;
      let fdata = {
        sub_lot_id:refid,
      Screen:"FUMIGATIONENTRYLIST",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getSublotlist", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         console.log("SUCCESS");
         form.setValues({
           
          ...form.values,
        CheckList:data.results,
        VendorName:data.EditFumigation ? data.EditFumigation[0].Vendor_Name:"",
        Amount:data.EditFumigation ? data.EditFumigation[0].Amount:"",
        WithoutTaxAmount:data.EditFumigation ? data.EditFumigation[0].WithoutTaxAmount:"",
        Gst:data.EditFumigation ? data.EditFumigation[0].Gst:"",
        SAPStatus_Flag:data.EditFumigation ? data.EditFumigation[0].SAPStatus_Flag:"",
        EditFumigationId:data.EditFumigation ? data.EditFumigation[0].FumigationId:"",
         })
         setLocationID(data.results ? data.results[0].lotno : '')
         setStorageLocationName(data.results ? data.results[0].StorageLocationName : '')
         setWH_CODE(data.results ? data.results[0].WH_CODE : '')
         setWERKS(data.results ? data.results[0].WERKS : '')
         setSegment(data.results ? data.results[0].Segment : '')

       
         if(data.EditFumigation!=null){
          console.log("SUCCESS1");
         if(data.EditFumigation.length>0){
         form.setFieldValue('ReasonforDelay',{label:data.EditFumigation[0].ReasonDelayStatus,value:data.EditFumigation[0].Reason_for_Delay})
         form.setFieldValue('BagType',{label:data.EditFumigation[0].BAG_NAME,value:data.EditFumigation[0].Bag_Type})
         form.setFieldValue('FumigationType',{label:data.EditFumigation[0].Fumigation_Type,value:data.EditFumigation[0].fumigationtypeid})
         form.setFieldValue('FumigationAgency',{label:data.EditFumigation[0].FumigationAgency,value:data.EditFumigation[0].Fumigation_Agency})
         form.setFieldValue('FumigatorName',{label:data.EditFumigation[0].FIRST_NAME,value:data.EditFumigation[0].Fumigator_Name})
         form.setFieldValue('Vendor_Names',{label:data.EditFumigation[0].Name,value:data.EditFumigation[0].Vendor_Name})
         }
        }
       }
       console.log("Result Data :: "+JSON.stringify(form));
     })
     .catch((error) => {
      //  console.log(error)
       errorToast("Something went wrong, please try again after sometime");
     })
     .finally((a) => {
       hideLoader();
     });
    }; 
    const getSublotlist_OLD = () => {
      let Data=form.values;
      let fdata = {
      Screen:"FUMIGATIONENTRYLIST",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getfumigationlist", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           
          ...form.values,
        CheckList:data.results,
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
      history.push(`/warehouse/bagcuttingApproval`);
    };
    
    const onWheatvarietyChange = (e) => {
      const{value, label} = e; 
      form.setFieldValue('KeyWheatVariety', {  label: label,value: value });
      //getKeyloanDet(value, label);
      
    }
    const FillLotList = (paramPlantid) => {
    let fdata ={plantid:paramPlantid, screentype: "PhysicalstockEntry"} 
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
 
  const onTextChange = (e, PKey, CheckList, Val, index) => {
    let ctlname = ""
    for(let i=0;i<CheckList.length;i++){
      if(CheckList[i].FumigationId==PKey){
          if(Val=="ReasonforDelay"){
            CheckList[i].sReasonforDelay= e.value;
            CheckList[i].sReasonforDelaylabel= e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="BagType"){
            CheckList[i].sBagType=e.value;
            CheckList[i].sBagTypelabel=e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="vendor_id"){
            CheckList[i].Vendor_id=e.value;
            CheckList[i].Vendor_idlabel=e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="Vendor_Names"){
            CheckList[i].Vendor_Names=e.value;
            CheckList[i].Vendor_Nameslabel=e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="FumigationType"){
            CheckList[i].sFumigationType=e.value;
            CheckList[i].sFumigationTypelabel=e.label;
            ctlname = Val+"_"+i;
            // console.log(CheckList[i].sFumigationType);
          
            let fdata = {
              id: CheckList[i].sFumigationType,
            };

            apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_fumigation_typeById", fdata)
              .then((response) => {
                const { data } = response;
                if (data.success) {
                  setRate(data.results[0].Rate)
                  setFumigationTypes(data.results[0].Status)
                  var fumigation = data.results[0].Fumigation_Type.slice(- 3)
                  setArea(data.results[0].quick_gas_grm)
                  setGas(data.results[0].quick_gas_dosing)
                }
              })
              .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
              })
              .finally((a) => {
                hideLoader();
              });

          }
          if(Val=="FumigationAgency"){
            CheckList[i].sFumigationAgency=e.value;
            CheckList[i].sFumigationAgencylabel=e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="FumigatorName"){
            CheckList[i].sFumigatorName=e.value;
            CheckList[i].sFumigatorNamelabel=e.label;
            ctlname = Val+"_"+i;
          }
          if(Val=="VendorName"){
            CheckList[i].VendorName=e.target.value;
          }
          if(Val=="Amount"){
            CheckList[i].Amount=e.target.value;
          }
          
          if(Val=="FumigationList"){
            CheckList[i].aFumigatorListName=e.value;
            CheckList[i].aFumigatorListNamelabel=e.label;
            ctlname = Val+"_"+i;    
            // setWhFumigation(CheckList[i].aFumigatorListName)
            // console.log(CheckList[i].aFumigatorListName)
            let WhFumigations = CheckList[i].aFumigatorListName

            if(WhFumigations != ''){
            let postData = {
              WhFumigation:WhFumigations
            };

            apiPostMethod(apiBaseUrl + "warehouse/master/getFumigationType",postData)
            .then((res) => {
              const { data } = res;
              console.log(data)
              setWhFumigation(data.results)
            })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            })
          }
          }
          if(Val=="Columns"){
            CheckList[i].Columns=e.target.value;
          }
          if(Val=="nextfumigationdates"){
            CheckList[i].nextfumigationdates=e.target.value;
          }
        }
      }
      
    console.log(JSON.stringify(CheckList))

    
         

    form.setValues({...form.values,CheckList});
    form.setFieldValue(ctlname, {value:e.value, label:e.label});
  }
  
 
   //(Delivery Qty / Cutting Bag Size) Vs Entered No of Bags = 10% Tollerance
  const CalcBagQty = (e)=>{
    let Tmpdelivery_Qty=e.target.value;
    let TmpA_Qty=(form.values.Tmpdelivery_Qty / form.values.ngw_bag.WEIGHT)
    let TmpB_Qty=(form.values.no_of_bags-TmpA_Qty)/100;
    /* IF TmpB_Qty between <=+0.10) and  >=-0.10 then allow
    else error Not able to submit
    return;*/
    form.setValues(
    {...form.values, 
     delivery_qty: Tmpdelivery_Qty,
    });
  }

  const ActionEntry = (sub_lot_id,index,Status,Edit) => {
    let FumigtnData={}
    let Url="updateSublot";
   
    if(Edit==0){
      // if(!form.values.CheckList[index].sReasonforDelay){ errorToast("Select Reason for Delay"); return false}
      FumigtnData={
        Reason_for_Delay:form.values.CheckList[index].sReasonforDelay,
        Bag_Type:form.values.CheckList[index].sBagType,
        Fumigation_Type:form.values.CheckList[index].sFumigationType,
        Fumigation_Agency:form.values.CheckList[index].sFumigationAgency,
        Fumigator_Name:form.values.CheckList[index].sFumigatorName,
        Vendor_Name:form.values.CheckList[index].sFumigationAgency == 2 ? form.values.CheckList[index].Vendor_id : form.values.CheckList[index].VendorName,
        Stock:(LOT_OVERALL_STOCK/1000).toFixed(3),
        Rate:Rate,
        WithoutTaxAmount:FumigationTypes == 1 ? (LOT_OVERALL_STOCK*Rate/1000).toFixed(2) : FumigationTypes == 2 ? ((Gas*form.values.CheckList[index].Columns/Area)*Rate).toFixed(2) : '',
        MBRCan:(Gas*form.values.CheckList[index].Columns/Area).toFixed(0) || 0,
        Gst:FumigationTypes == 1 ? ((LOT_OVERALL_STOCK*Rate/1000)*0.18).toFixed(2) : FumigationTypes == 2 ? (((Gas*form.values.CheckList[index].Columns/Area)*Rate*0.18)).toFixed(2) : '',
        Area:form.values.CheckList[index].Columns || 0,
        Amount:FumigationTypes == 1 ? ((LOT_OVERALL_STOCK*Rate/1000)+(LOT_OVERALL_STOCK*Rate/1000)*0.18).toFixed(2) : FumigationTypes == 2 ? (((Gas*form.values.CheckList[index].Columns/Area)*Rate*0.18)+((Gas*form.values.CheckList[index].Columns/Area)*Rate)).toFixed(2) : '',
        ALP_Count:form.values.CheckList[index].ALPCount,
        Status:2
      }
    }else{
      //if(!form.values.CheckList[index].sReasonforDelay){ errorToast("Select Reason for Delay"); return false}
      FumigtnData={
        Reason_for_Delay:form.values.ReasonforDelay.value,
        Bag_Type:form.values.BagType.value,
        Fumigation_Type:form.values.FumigationType.value,
        Fumigation_Agency:form.values.FumigationAgency.value,
        Fumigator_Name:form.values.FumigatorName.value,
        Vendor_Name:form.values.FumigationAgency.value == '1' ? form.values.VendorName : form.values.Vendor_Names.value,
        Amount:form.values.Amount,
        // Dijo Changed
        // ALP_Count:form.values.CheckList[index].ALP_Count,
        ALP_Count:form.values.ALP_Count,
        // End
        Status:2
      }
      Url="Edit_UpdateFumigation"
    }

  let Data={
    fumigationstatus:2,
    lastfumigationdate:form.values.CheckList[index].nextfumigationdates
  }

  const postdata = {
    id:sub_lot_id,
    EditFumigationId:form.values.EditFumigationId ? form.values.EditFumigationId:0,
    Status,
    ScreenType:'FUMIGATIONTEAM',
    Data,
    FumigtnData
  }


  if(postdata.FumigtnData.Bag_Type == '' || postdata.FumigtnData.Bag_Type == undefined){
    errorToast("Please Select Bag Type..!");
    return false
  }else if(postdata.FumigtnData.Fumigation_Type == '' || postdata.FumigtnData.Fumigation_Type == undefined){
    errorToast("Please Select Fumigation Type..!");
    return false
  }else if(postdata.FumigtnData.Fumigation_Agency == '' || postdata.FumigtnData.Fumigation_Agency == undefined){
    errorToast("Please Select Fumigation Agency..!");
    return false
  }else if(postdata.FumigtnData.Fumigator_Name == '' || postdata.FumigtnData.Fumigator_Name == undefined){
    errorToast("Please Select Fumigator Name..!");
    return false
  }else if(postdata.FumigtnData.Fumigation_Agency == '2' && (postdata.FumigtnData.Vendor_Name == '' || postdata.FumigtnData.Vendor_Name == undefined)){
    errorToast("Please Enter Vendor Name..!");
    return false
  }else if (Edit == 0 && (postdata.Data.lastfumigationdate == ''|| postdata.Data.lastfumigationdate  == undefined)) {
    errorToast("Please Enter Fumigation Date..!");
    return false
  }else if(postdata.FumigtnData.Amount == 0){
    errorToast("Please Enter The Amount..!");
    return false
  }
  else if (LOT_OVERALL_STOCK == '' || LOT_OVERALL_STOCK == undefined) {
    errorToast("Please Check Stock QTY..!");
    return false
  }

  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/Fumigation/" + Url, postdata)
    .then((response) => {
     // return false;
    const { data } = response;
    // console.log(JSON.stringify(response))
    //return false;
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else if(UsrId==1){
      
      ShowToast("Saved Successfully...");
      history.push("/warehouse/FumigationEntryList");
      window.location.reload();
    }else{
        errorToast("Something went wrong, please try again after sometime 123");  
    }


     // getSublotlist();
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime  456");
    })
    .finally((a) => {
      hideLoader();
    });
 }
 
const ActionEntry_OLD = (sub_lot_id,index,Status) => {
    console.log(form.values.CheckList[index]);
 
  if(!form.values.CheckList[index].sReasonforDelay){ errorToast("Select Reason for Delay"); return false}
  //let Data=form.values.CheckList[index];
  let Data={
    Reason_for_Delay:form.values.CheckList[index].sReasonforDelay,
    Bag_Type:form.values.CheckList[index].sBagType,
    Fumigation_Type:form.values.CheckList[index].sFumigationType,
    Fumigation_Agency:form.values.CheckList[index].sFumigationAgency,
    Fumigator_Name:form.values.CheckList[index].sFumigatorName,
    Vendor_Name:form.values.CheckList[index].VendorName,
    Amount:form.values.CheckList[index].Amount,
    ALP_Count:form.values.CheckList[index].ALP_Count,
    Status:2
    
  }

  const postdata = {
   
    ScreenType:'UPDATEFUMIGATION',
    Data,
    id:form.values.CheckList[index].FumigationId
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/Fumigation/updatefumigation", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/FumigationTeam");
    window.location.reload();
     
      }
     // getSublotlist();
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });

}
const onWarehouseChange = (e) => {
  const {value, label} = e; 
 // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
 form.setFieldValue('warehouseid', {  label: label,value: value });
  FillPlantList(value);
}
const OnLotChange = (e) => {
  const {value, label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  
  form.setFieldValue('lotid', {  label: label,value: value });
  FillWheatVarityList(value)
 
} 
const FillWheatVarityList = (paramLotId) => {
  let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
  setWhWheetVarietyOptions([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
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
  FillLotList(value)

}

const ViewHistory = (sub_lot_id) => {
  
    history.push("/warehouse/FumigationViewHistory:"+sub_lot_id);
}
const gotoFumigationTeam= () =>{
  history.push("/warehouse/FumigationTeam");
}
const gotoDegasQC= () =>{
  history.push("/warehouse/FumigationQCTeam");
}


const showWarehousewisestocks = (e) => {

 
  let fdata = {
    Screen:"WAREHOOUSESTOCK",
    warehouseid:WH_CODE,
    plantId:WERKS,
    storagelocationid:StorageLocationName,
    lotId:LocationID,
    WheatVariety:Segment,
    };
 
showLoader();
 apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
 .then((response) => {
   const { data } = response;
   let results = data.results
  console.log(data)
  const filterData = results.filter(
    (data) =>
      // (data.LOT == 'AR01R02'
      (data.SEGMENT == Segment
  ))
  console.log(filterData)
  setLOT_OVERALL_STOCK(results[0].STOCK)
 })
 .catch((error) => {
   errorToast("No Stock Available In This Lot");
 })
 .finally((a) => {
   hideLoader();
 });
}



const statusOptions = [
  {
    options: [
      { value: "1", label: "ALP" },
      { value: "2", label: "Quick Gas" },
    ],
  },
];

const dateRestriction = DateComponent('fumigation');



return ( 
    <Fragment>
      {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
        <Row>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Warehouse Name"} form={form} id="Wh_name" type="text"  placeholder={"Warehouse Name"} value={row.WH_NAME} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Plant"} form={form} id="Plant" type="text"  placeholder={"Plant"} value={row.PLANT_NAME} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Storage Location"} form={form} id="StorageLocationName" type="text"  placeholder={"Storage Location"} value={row.StorageLocationName} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Lot No"} form={form} id="lotno" type="text"  placeholder={"Lot No"} value={row.lotno} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Wheat Variety"} form={form} id="WheatVariety" type="text"  placeholder={"Wheat Variety"} value={row.WheatVariety} disabled/>
          </Col>
          {/* <Col md="4" sm="12" >
            <CustomTextInput   label={"Stock in MTS"} form={form} id="wheatqty" type="text"  placeholder={"Stock in MTS"} value={row.wheatqty} disabled/>
          </Col> */}
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Stock in Kgs"} form={form} id="wheatqty" type="text"  placeholder={"Stock in MTS"} value={LOT_OVERALL_STOCK} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Last Fumigation Type"} form={form} id="Fumigation_Type" type="text"  placeholder={"Last Fumigation Type"} value={row.Fumigation_Status == '1' ? 'ALP' : row.Fumigation_Status == '2' ? 'Quick Gas': ''} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Last Fumigation On"} form={form} id="LastFumigatnDt" type="text"  placeholder={"Last Fumigation On"} value={row.LastFumigatnDt} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Last Degassed On"} form={form} id="LastDegasDt" type="text"  placeholder={"Last Degassed On"} value={row.LastDegasDt} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Next Due Date"} form={form} id="NextFumigatnDt" type="text"  placeholder={"Next Due Date"} value={row.NextFumigatnDt} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Lead Days"} form={form} id="FumigationLapsed" type="text"  placeholder={"Lead Days"} value={row.FumigationLapsed} disabled/>
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"Fumigation Status"} form={form} id="FumigationStatusName" type="text"  placeholder={"Fumigation Status"} value={row.FumigationStatusName} disabled/>
          </Col>
          {row.fumigationstatus!=2 &&
          <Col md="4" sm="12" >
              <CustomTextInput 
                label={"Fumigation Date"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"nextfumigationdates",index)} 
                form={form} 
                id={`nextfumigationdates_${index}`} 
                type="date" value={row.nextfumigationdates}
                min={dateRestriction.min_date}
                max={dateRestriction.max_date}
              />
          </Col>
           }
          <Col md="4" sm="12" >
            <Label>Reason For Delay</Label>
            {row.fumigationstatus!=2 &&
              <CustomDropdownInput  
                url={`${apiBaseUrl}warehouse/master/getResonForDelay`} 
                options ={warehouseoption}
                form={form} 
                id={`ReasonforDelay_${index}`} 
                onChange={(e) => onTextChange(e, row.FumigationId, form.values.CheckList, "ReasonforDelay", index)}
              />
            }                             
            {row.fumigationstatus==2 &&
              <CustomDropdownInput  
                url={`${apiBaseUrl}warehouse/master/getResonForDelay`} 
                form={form} id={`ReasonforDelay`} 
                options ={warehouseoption}/>
            }
          </Col>
          <Col md="4" sm="12" >
            <Label>Bag Type</Label>
            {row.fumigationstatus!=2 && 
              <CustomDropdownInput
                url={`${apiBaseUrl}warehouse/master/bagtype`} 
                options ={warehouseoption}   
                form={form} id={`BagType_${index}`} 
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"BagType",index)} 
              />
            }
          
            {row.fumigationstatus==2 && 
              <CustomDropdownInput  
                url={`${apiBaseUrl}warehouse/master/bagtype`} 
                form={form} id={`BagType`} 
                options ={warehouseoption}
                isDisabled = {true}
              />
            }
          </Col>
          {row.fumigationstatus !=2  && 
          <Col md="4" sm="12" >
              <CustomDropdownInput  
                form={form} id={`FumigationList_${index}`} 
                label = 'Fumigation Type'
                options ={statusOptions}
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"FumigationList",index)} 
              />
          </Col>}
          <Col md="4" sm="12" >
          {row.fumigationstatus!=2 && 
              <CustomDropdownInput 
              //  url={`${apiBaseUrl}warehouse/master/getFumigationType`} 
                form={form} id={`FumigationType_${index}`} 
                label = 'Fumigation List'
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"FumigationType",index)} 
                options ={WhFumigation}
              />
            }
                      
            {row.fumigationstatus==2 && 
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getFumigationType`} 
                form={form} id={`FumigationType`}
                label = 'Fumigation Type'
                options ={warehouseoption}  
                isDisabled 
              />
            }
          </Col>
          <Col md="4" sm="12" >
            <Label>Fumigation Agency</Label>
            {row.fumigationstatus!=2 &&  
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getFumigationTypeAgency`} 
                form={form} id={`FumigationAgency_${index}`} 
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"FumigationAgency",index)} 
                options ={warehouseoption}
              />
            }   
            
            {row.fumigationstatus==2 &&
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getFumigationTypeAgency`} 
                form={form} id={`FumigationAgency`} 
                options ={warehouseoption}   
                // isDisabled = {true}
                isDisabled = {row.fumigationstatus==2} 
              />
            }
          </Col>
          <Col md="4" sm="12" >
            <Label>Fumigator Name</Label>
            {row.fumigationstatus!=2 && 
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
                form={form} id={`FumigatorName_${index}`} 
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"FumigatorName",index)} 
                options ={warehouseoption}   
              />
            }
            {row.fumigationstatus==2 && 
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
                form={form} id={`FumigatorName`}           
                options ={warehouseoption}   
              />
            }
          </Col>
          <Col md="4" sm="12" >
            {row.fumigationstatus!=2 && form.values.CheckList[index].sFumigationAgency == 1 &&
              <CustomTextInput label={"Vendor Name"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"VendorName",index)} 
                form={form} id={`VendorName_${index}`}
                type="text" value={row.VendorName}   
              />
            }
           {row.fumigationstatus!=2 && form.values.CheckList[index].sFumigationAgency == 2 &&
            <CustomDropdownInput  
                label={"Vendor Name"} 
                url={`${apiBaseUrl}warehouse/master/getFumigationVendor`} 
                form={form} 
                id={`vendor_id_${index}`}                
                onChange={(e) => onTextChange(e,row.value,form.values.CheckList,"vendor_id",index)} 
                options={warehouseoption}
              />
            }
            {row.fumigationstatus==2 && form.values.FumigationAgency?.value == 2 &&
            <CustomDropdownInput  
                label={"Vendor Name"} 
                url={`${apiBaseUrl}warehouse/master/getFumigationVendor`} 
                form={form} 
                id={'Vendor_Names'}                
                // onChange={(e) => onTextChange(e,row.value,form.values.CheckList,"Vendor_Names",index)} 
                options={warehouseoption}
                isDisabled
              />
            }
            {row.fumigationstatus==2 &&  form.values.FumigationAgency?.value == 1 &&
              <CustomTextInput label={"Vendor Name"} placeholder={" "}  
                form={form} id={`VendorName`} 
                type="text" value={form.values.VendorName}  
                disabled 
              />
            }
          </Col>
          {FumigationTypes &&
          <Col md="4" sm="12" >
            {row.fumigationstatus!=2 &&  
              <CustomTextInput label={"Rate"} placeholder={" "}  
                id="Rate"
                form={form}
                type="text" value={Rate}
                disabled
              />
            }
            {/* {row.fumigationstatus==2 &&  
              <CustomTextInput label={"Amount"}  placeholder={" "}  
                form={form} id={`Amount`} 
                type="text" value={form.values.Amount}   
              />
            } */}
          </Col>}
          {FumigationTypes == 2 &&
          <Col md="4" sm="12" >
              <CustomTextInput label={"Area SQFT"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Columns",index)} 
                form={form} 
                id={`Columns_${index}`} 
                type="text" value={row.Columns}
                MaxLength="10"
              />
          </Col>}
          {/* {FumigationTypes == 2 &&
          <Col md="4" sm="12" >
              <CustomTextInput label={"Quick Gas"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Row",index)} 
                form={form}
                id={`Row_${index}`}
                type="text" 
                MaxLength="3"
                value={row.Row}
              />
          </Col>} */}
          <Col md="4" sm="12" >
            {row.fumigationstatus!=2 && FumigationTypes == 1 &&
              <CustomTextInput label={"Amount"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Non_Tax_Amount",index)} 
                form={form} id={`Non_Tax_Amount_${index}`} 
                type="text" value={(LOT_OVERALL_STOCK*Rate/1000).toFixed(0)}  
                disabled 
              />
            }
            {row.fumigationstatus!=2 && FumigationTypes == 2 &&
              <CustomTextInput label={"Amount"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Non_Tax_Amount",index)} 
                form={form} id={`Non_Tax_Amount_${index}`} 
                type="text" value={((row.Columns*Gas/Area)*Rate).toFixed(0)}
                disabled 
              />
            }
            
            {row.fumigationstatus==2 &&  
              <CustomTextInput label={"Amount"}  placeholder={" "}  
                form={form} id={`Non_Tax_Amount`} 
                type="text" value={form.values.WithoutTaxAmount}   
                disabled
              />
            }
          </Col>
          <Col md="4" sm="12" >
            {row.fumigationstatus!=2 && FumigationTypes == 1 &&
              <CustomTextInput label={"GST"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"GST",index)} 
                form={form} id={`GST_${index}`} 
                type="text" value={((LOT_OVERALL_STOCK*Rate/1000)*0.18).toFixed(0)}  
                disabled 
              />
            }
            {row.fumigationstatus!=2 && FumigationTypes == 2 &&
              <CustomTextInput label={"GST"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"GST",index)} 
                form={form} id={`GST_${index}`} 
                type="text" value={((row.Columns*Gas/Area)*Rate*0.18).toFixed(0)}
                disabled 
              />
            }
            
            {row.fumigationstatus==2 &&  
              <CustomTextInput label={"GST"}  placeholder={" "}  
                form={form} id={`GST`} 
                type="text" value={form.values.Gst}   
                disabled
              />
            }
          </Col>
          <Col md="4" sm="12" >
            {row.fumigationstatus!=2 && FumigationTypes == 1 &&
              <CustomTextInput label={"Total Amount"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Amount",index)} 
                form={form} id={`Amount_${index}`} 
                type="text" value={((LOT_OVERALL_STOCK*Rate/1000)+((LOT_OVERALL_STOCK*Rate/1000)*0.18)).toFixed(0)}  
                disabled 
              />
            }
            {row.fumigationstatus!=2 && FumigationTypes == 2 &&
              <CustomTextInput label={"Total Amount"} placeholder={" "}  
                onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"Amount",index)} 
                form={form} id={`Amount_${index}`} 
                type="text" value={(((row.Columns*Gas/Area)*Rate*0.18)+((row.Columns*Gas/Area)*Rate)).toFixed(0)}
                disabled 
              />
            }
            
            {row.fumigationstatus==2 &&  
              <CustomTextInput label={"Total Amount"}  placeholder={" "}  
                form={form} id={`Amount`} 
                type="text" value={form.values.Amount}   
                disabled
              />
            }
          </Col>
          <Col md="4" sm="12" >
            <CustomTextInput   label={"ALP Count"} form={form} id="ALP_Count" type="text"  placeholder={"ALP Count"} value={row.ALPCount} disabled/>
          </Col>
          <Col md="4" sm="12" >
          </Col>
          <Col sm="12" >
           <FormGroup className="d-flex justify-content-end mb-0">
            {row.fumigationstatus!=2 &&  
              <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.sub_lot_id,index,1,0);}}>Approve</Button.Ripple>}
            {row.fumigationstatus==2 && form.values.SAPStatus_Flag <= 1 &&
              <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.sub_lot_id,index,1,1);}}>Update</Button.Ripple>}
            
              <Button.Ripple color="warning" className="ml-2" type="Button" onClick={(e) => {ViewHistory(row.sub_lot_id);}}>View History</Button.Ripple>              
           </FormGroup>
          </Col>
        </Row>
        ))}
         
      <div class="d-flex justify-content-center mt-1">
      <div class="p-1 ">
    </div>
    </div>
  </Fragment>
  )
} 
const FumigationTeamData = () => { 
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
Posting_Date: validation.required({  message:"Posting Date should not be empty",isObject: false }),
va_no:validation.required({ message:"VA Number should not be empty", isObject:false }),
delivery_no:validation.required({ message:"Delivery Number should not be empty", isObject:false }),
delivery_date:validation.required({ message:"Delivery Date should not be empty", isObject:false }),
delivery_qty:validation.required({ message:"Delivery Qty should not be empty", isObject:false }),
bag_type:validation.required({ message:"Bag Type should not be empty", isObject:false }),
no_of_bags:validation.required({ message:"No Of Bags should not be empty", isObject:false }),
sending_plant:validation.required({ message:"Sending Plant should not be empty", isObject:false }),
sending_stroage_location:validation.required({ message:"Sending Stroage Location should not be empty", isObject:false }),
receiving_plant:validation.required({ message:"Receiving Plant should not be empty", isObject:false }),
receiving_stroage_location:validation.required({ message:"Receiving Stroage Location should not be empty", isObject:false }),
wheat_variety:validation.required({ message:"Wheat Variety should not be empty", isObject:false }),
bag_cuttiing_vendor:validation.required({ message:"Bag Cuttiing Vendor should not be empty", isObject:false }),
bag_cutting_charges:validation.required({ message:"Bag Cutting Charges should not be empty", isObject:false }),
tollerancepercent:validation.required({ message:"Tollerancepercent should not be empty", isObject:false }),
wm_remarks:validation.required({ message:"WM Remarks should not be empty", isObject:false }),
approvestatus:validation.required({ message:"Approval Status should not be empty", isObject:false }),

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
    let formData = form.values;
    const FrmData = { 

bagcuttingid:formData.bagcuttingid.value,
va_no:formData.va_no.value,
delivery_no:formData.delivery_no.value,
delivery_date:formData.delivery_date.value,
delivery_qty:formData.delivery_qty.value,
bag_type:formData.bag_type.value,
no_of_bags:formData.no_of_bags.value,
sending_plant:formData.sending_plant.value,
sending_stroage_location:formData.sending_stroage_location.value,
receiving_plant:formData.receiving_plant.value,
receiving_stroage_location:formData.receiving_stroage_location.value,
wheat_variety:formData.wheat_variety.value,
bag_cuttiing_vendor:formData.bag_cuttiing_vendor.value,
bag_cutting_charges:formData.bag_cutting_charges.value,
tollerancepercent:formData.tollerancepercent.value,
wm_remarks:formData.wm_remarks.value,
approvestatus:formData.approvestatus.value,
    };
    console.log(" Bag Cutting Approval :: "+JSON.stringify(FrmData));
    const postdata = {
      id:formData.bagcuttingid,
      Data:FrmData
    }
    console.log("  Bag Cutting Approval :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Bag Cutting Approval :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "Master", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
            history.push("/warehouse/bagcuttingadjustmentapprove");

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
    return(
        <Fragment>
        <CardComponent  header="Fumigation Team">
       <FumigationTeam form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default FumigationTeamData 
