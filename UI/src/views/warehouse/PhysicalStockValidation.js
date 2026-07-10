import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import Uploader from "../Uploader";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import { isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import {ClearDropdown} from "./common/appHelper"

const stockvalidation = {                                    
  warehouseid: "",                                    
  locationid: "",                                     
  lotno: "",                                    
  lotid: "",                                    
  Maker: "",                                    
  CheckName: "",                                    
  stockstatus: "",                                    
  wh_name: "",                                     
  wh_code: "",                                    
  plantid: "",                                     

}

const PhysicalStockValidation = ({form, onSubmit}) => { 
  const[stockvalidationdata, Setstockvalidation] = useState({ ...stockvalidation});
  const[warehouseoption, setWarehouseoption] = useState([]);
  const[storageLocationOption,setstorageLocationOption] = useState([]);  
  let { showLoader, hideLoader } = useLoader();
  const[lotoption,setLotoption] = useState([]);
  const[locationoption,setLocationoption] = useState([]);  
  const[stockstatus,setstockstatus] = useState([]); 
  const {warehousename,locationid,wh_code,plantid,lotid,lotno,Maker,checkername} = stockvalidationdata
 
  const statusOptions = [
    {
      options: [
        { value: "1", label: "Pending" },
        { value: "2", label: "Completed" },
      /*  { value: "AD", label: "AD - Accepted with Deduction" },*/
      ],
    },
  ];
  const onWarehouseChange = (e) => {
    const {value, label} = e; 
   // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
   form.setFieldValue('warehouseid', {  label: label,value: value });
    FillPlantList(value);
    ClearDropdown("WH",form, 'locationid', 'storagelocationid', 'lotid', '');
}
useEffect(() => {
  
  showPhysicalstock();

  
}, []);

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
  //let fdata ={plantid:plant, screentype: "PhysicalstockEntry"} 
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
const onStatuschange = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Status', {  label: label,value: value });
}
const onchangeChecker = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Checker', {  label: label,value: value });
}
const OnLotChange = (e) => {
  const {value, label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  
  form.setFieldValue('lotid', {  label: label,value: value });
 // Fillwheatvarity(value)
 
}
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


const onTextChange = (e,PKey, CheckList,Val) => {
  for(let i=0;i<CheckList.length;i++){
    if(CheckList[i].Physical_Stock_Id==PKey){
        if(Val=="Verification_Remarks"){
          CheckList[i].Verification_Remarks=e.target.value;
        }
        if(Val=="Selected"){
          if(e.target.checked){
            CheckList[i].Selected=1;
          }else{
            CheckList[i].Selected=0;
          }
        }
    }
  }
  console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
}
const onActionClick = () => {
		
  let Data=form.values.CheckList;
  let Select=0;
  for(let i=0;i<Data.length;i++){
    if(Data[i].Selected==1){
      Select=1;
    }
  }
  if(Select==0){
    errorToast("Select Atleast one Entry");
    return false;
  }
   const postdata = {
    Data,
     ScreenType:'UPDATEVALIDATION',
    
   }
  
    console.log(JSON.stringify(postdata))
   showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/Physicalstocktaking/updatephysicalstock", postdata)
     .then((response) => {
     const { data } = response;
     console.log(JSON.stringify(response))
     let UsrId=data.success;
     if(UsrId==-5){
       errorToast("Duplicate Entry");
     }else{
       let RespId=data.success;
       ShowToast("Saved Successfully...");
       form.setValues({});
       //history.push("/warehouse/PhysicalStockValidation");
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
   const onStorageLocationChange=(e)=>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationid', {  label: label,value: value });
   // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value)
   ClearDropdown("SL",form, 'locationid', 'storagelocationid', 'lotid', '');
   }
const showPhysicalstock = (e) => {
  
  //setAttachment({ Image1: {}, Image2: {},Image3:{},Image4:{} });
  let FormData=form.values;
  let fdata = {warehouseid:FormData.warehouseid ? FormData.warehouseid.value:"",
    plantid:FormData.locationid ? FormData.locationid.value:"",
    lotid:FormData.lotid ? FormData.lotid.value:"",
    // Physical_Stock_date:FormData.Date ? FormData.Date :"",

    // Dijo 01
    FromDate:form.values.FromDate?form.values.FromDate:"",
    ToDate:form.values.ToDate?form.values.ToDate:"",

    Maker:FormData.Maker ? FormData.Maker.value:"",
    Checker:FormData.Checker ? FormData.Checker.value:"",
    Status:FormData.Status ? FormData.Status.value:"1", // 10-03-2022 As requested by client by default show only pendings not completed 
    screentype: "PhysicalstocEntryValidation"} 
  apiPostMethod(apiBaseUrl+'warehouse/physicalstocktaking/getphysicalstocEntryklist',fdata)
  .then((response) => {    
    const {data} = response;
    // const  value = value;
    if(data.success){
    //  document.getElementById("StockDet").innerHTML=""; 
     

//console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
     // setKeyloanDatas(data.results);

      form.setValues({
        ...form.values,
        CheckList:data.results,
        
       
      });
      //form.setFieldValue('warehouseid', {  label:  data.results[0].WH_NAME,value: data.results[0].wh_code });
      //form.setFieldValue('locationid', {  label:  data.results[0].PLANT_NAME,value: data.results[0].plantid });
      //form.setFieldValue('lotid', {  label: data.results[0].lotno,value: data.results[0].lotid });
     // console.log("Checklist");
     // console.log(form.values.CheckList);
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
          <Col md="3" sm="12" >
            <CustomDropdownInput  
              url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"}  
              form={form} 
              id="warehouseid" 
              onChange = {onWarehouseChange}   
              options ={warehouseoption}   
            />
            <span id='warehouseid_Error' style={{color: 'red'}} ></span>
          </Col>
          
          <Col md="3" sm="12"> 
            <CustomDropdownInput  
            label="Plant"
              form={form} 
              id="locationid"
              onChange={onPlantchange} 
              options={locationoption}
           />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
          </Col>
          <Col md="3" sm="12"> 
          <CustomDropdownInput  
            label="Storage Location"
              form={form} 
              id="storagelocationid"
              onChange={onStorageLocationChange} 
              options={storageLocationOption}
            />
            <span id='storagelocationid_Error' style={{color: 'red'}} ></span>
          </Col>
          <Col md="3" sm="12"> 
          <CustomDropdownInput  
            label="Lot No"
              form={form} 
              id="lotid"   
              options= {lotoption}
              onChange={OnLotChange} 
            />
            <span id='lotid_Error' style={{color: 'red'}} ></span>
          </Col>
          {/* <Col md="3" sm="12">
            <CustomTextInput label={" Audit Date"} form={form} id="Date" type="date"  />
          </Col> */}

          {/* Dijo 002 */}
          <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
             </Col>
             <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
             </Col>

        </Row>
        <Row>     
          <Col md="3" sm="12">
            <CustomDropdownInput  
              url={`${apiBaseUrl}warehouse/master/getUsers`} 
              label={"Maker"}  
              form={form} 
              id="Maker" 
              onChange = {onchangeMaker}   
            />
            <span id='Maker_Error' style={{color: 'red'}} ></span>
          </Col>
          <Col md="3" sm="12">
            <CustomDropdownInput  
              url={`${apiBaseUrl}warehouse/master/getUsers`} 
              label={"Checker"}  
              form={form} 
              id="Checker" 
              onChange = {onchangeChecker}   
            />
            <span id='Checker_Error' style={{color: 'red'}} ></span>
          </Col> 
          <Col md="3" sm="12">
            <Label>Stock Status</Label>
            <Select
              className="react-select"
              classNamePrefix="select"
              id="Status"
              onChange={onStatuschange} 
              form={form}
              options={ statusOptions }
            
            />
          </Col>
          </Row>
          <Col sm="12"> 
          <FormGroup className="d-flex justify-content-end mb-0">  
            <Button.Ripple onClick={showPhysicalstock}  color="primary"  type="Button"  >
              Show
            </Button.Ripple>
            </FormGroup>
          </Col>
        
        {/*
          <div style={{width:"70vw", overflow:"auto", fontSize:"12px"}}>
          <table class="table-sm" >
                   <thead class="bg-primary text-white" style={{fontSize:"12px",height:"50px"}}>
        */}
        <br></br><br></br>
        
        <Row>
          <Col md="12" sm="12" style={{Width:"970px", overflowX:"auto",fontSize:"12px"}}>
          
        <div > 
          <table className='table-sm'>
            <thead className='bg-primary text-white' style={{fontSize:"14px",height:"40px",textAlign:"left"}}>
               <tr>
                  <th style={{minWidth:"130px",fontWeight:"500"}}>Select</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Warehouse Name</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Lot No</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Physical Wheat Variety</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >SAP Wheat Variety</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Bag Type</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >No of Bags</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Audit Remarks</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Audit Time</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >OutBox Indicator</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Maker</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Checker</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Phy Qty in MTS</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >SAP Qty in MTS</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Diff Qty in MTS </th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Diff % </th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} >Attachment View</th>
                   <th style={{minWidth:"130px",fontWeight:"500"}} > Verification Remarks</th>
               </tr>
              </thead>
                <tbody style={{overflow:"scroll"}}>
                  {form.values.CheckList && form.values.CheckList.map((row, index) => (  
                  <tr >
                    <td>
                      {row.Status==1 &&  <input type="checkbox"
                        onChange={(e) => onTextChange(e,row.Physical_Stock_Id,form.values.CheckList,"Selected")} 
                        id={`Check_${index}`} 
                        ></input>}
                      {row.Status==2 && "Completed"}
                    </td>
                    <td>{row.WH_NAME}</td>
                    <td>{row.lotno}</td>
                    <td>{row.WheatVariety}</td>
                    <td>{row.WheatVariety}</td> {/* SAP_Qty_in_MTS */}

                    <td>{row.BAG_NAME}</td>
                    <td>{row.NoOfBag}</td>
                    
                    <td>{row.Audit_Remarks}</td>
                    <td>{row.auditTime}</td>
                    <td>{row.OutboxInd}</td>
                    <td>{row.MakerName}</td>
                    <td>{row.CheckerName}</td>

                    <td>{row.Qty_in_MTS}</td> {/*<td>{row.Phy_Qty_in_MTS}</td>*/}
                    <td>{row.Phy_Qty_in_MTS}</td> {/*<td>{row.SAP_Qty_in_MTS}</td>*/}
                    <td>{row.Diff_Qty_in_MTS}</td>
                    <td>{row.Diff_Percent}</td>
                    
                    <td>

                    {row.Image1 && <Uploader isReadOnly={true} selectedFileName={row.Image1} />}
                    {row.Image2 && <Uploader isReadOnly={true} selectedFileName={row.Image2} />}
                    {row.Image3 && <Uploader isReadOnly={true} selectedFileName={row.Image3} />}
                    {row.Image4 && <Uploader isReadOnly={true} selectedFileName={row.Image4} />}

                    </td>
                    <td><CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}} 
                          placeholder={" "}  
                          onChange={(e) => onTextChange(e,row.Physical_Stock_Id,form.values.CheckList,"Verification_Remarks")} 
                          form={form} 
                          id={`Verification_Remarks_${index}`} 
                          type="text" 
                          value={row.Verification_Remarks}
                        />
                    </td>  
                  </tr>
                ))}  
              </tbody>
            </table > 
          </div>
          </Col>
        </Row>
        <br></br><br></br>
            
            <Col sm="12">
            <FormGroup className="d-flex justify-content-end mb-0">
              <Button.Ripple color="primary" type="Button" style={{bottomMargin:"5px"}}
                onClick={(e) => onActionClick()} >Submit</Button.Ripple>
                </FormGroup>
                </Col>
    </Fragment>
  )
}

const PhysicalStockValidationdata = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
 
     /* WH_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
       Location: validation.required({  message:"Storage Location should not be empty",isObject: true }),
       LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
       Date: validation.required({ message:"Date should not be empty", isObject: true }),
       Maker: validation.required({ message:"Date should not be empty", isObject: true }),
       SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
       BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
       LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
       LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
       LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
       LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
       FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
       RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
       FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
       FA: validation.required({  message:"Fumigation Agency should not be empty",isObject: true }),
       FN: validation.required({ message:"Fumigator Name should not be empty", isObject: true }),
       VN: validation.required({  message:"Vendor Name should be numeric value",isObject: false }),
       ALPC: validation.required({ message:"ALP Count should not be empty", isObject: false }),
       AmountPer: validation.required({  message:"AmountPer should not be empty",isObject: false }),*/
     }),
    onSubmit(values) {},
  });
  const onSubmit =() => {

  }
  return (
    <Fragment>
      <CardComponent  header="Physical Stock Validation">
     <PhysicalStockValidation form={form}  onSubmit={onSubmit}  />
   </CardComponent>
    </Fragment>
  )
}



export default PhysicalStockValidationdata
