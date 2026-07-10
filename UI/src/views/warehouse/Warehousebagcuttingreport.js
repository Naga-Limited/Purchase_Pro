import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup, Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { ClearDropdown } from "./common/appHelper";

export const _bagcutting = {
    wh_code: "",
    wh_name: "",
    location: "",
    locationid: "",
     

}
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
  wheatvarietyid: "",
  WheatVariety: "",
  BagType: "",
  NoOfBag: "",  

 
}


const Warehousebagcuttingreport = ({form,onSubmit}) => {
  const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
  const[storageLocationOption,setstorageLocationOption] = useState([]); 
  const[locationoption,setLocationoption] = useState([]);   

  const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    
  //  Dijo 01
const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('location', '');
  }
}
//  End

const onWarehouseChange = (e) => {
  const {value, label} = e; 
  // form.setFieldValue('warehouseid', {  label: label,value: value });
  // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillStorageLocationList(value);
  
  alert("!!");
  ClearDropdown("WH");
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
    return (
        <Fragment>
           
           <div class="p-1">
            <Row>
           <Col md="3" sm="12">
             <CustomTextInput label={"From Date"} form={form} id="FormData" type="date"  />
             </Col>
             <Col md="3" sm="12">
             <CustomTextInput label={"To Date"} form={form} id="ToDate" type="date"  />
             </Col>
             <Col md="3" sm="12" >
           <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"} form={form} id={"WH_Name"}  
           onChange = {onWarehouseChange}
           />

           </Col>
           <Col md="3" sm="12">
           <CustomDropdownInput 
          //  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Storage Location"} 
           form={form}    
           id={"location"} 
          //  onChange={onStorageLocationChange} 
          options={locationoption}
           /> 
           </Col>
            
            <Col sm="12">
            <FormGroup className="d-flex justify-content-end mb-0">
         <Button.Ripple color="primary"  type="Button" >Search</Button.Ripple>
         &nbsp;&nbsp;&nbsp;
         <Button.Ripple  color="primary"  type="Button" >Excel Download</Button.Ripple>
          </FormGroup>
          </Col>
          
          </Row>
            </div>

          <br></br><br></br><br></br>
            <div style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}}>
            <table class="table-sm">
                <thead class="text-white bg-primary" style={{height:"50px",textAlign:"center",fontSize:"12px"}}>
                   <tr>
                       <th style={{minWidth:"200px",fontWeight:"500"}} >VA No...</th>
                       <th style={{minWidth:"200px",fontWeight:"500"}} >Delivery No</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Delivery Date</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Delivery Qty</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Delivery Qty</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Bag Type</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >No of Bags</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Sending Plant</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Sending Storage Location</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Receiving Plant</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Receviving Storage Location</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Wheat Variety</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Bag Cutting Vendor</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Bag Cutting Charges</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Tolerance %</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >WM Remarks</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >WM Approval Date {"&"} Time</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >Ac Remarks</th>
                        <th style={{minWidth:"200px",fontWeight:"500"}} >AC Approval Date {'&'} Time</th>
                   </tr>
                </thead >
                <tbody style={{textAlign:"center"}}>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                </tbody>
            </table>
            </div>
            
        </Fragment>
        

    )
   
}


const WarehousebagcuttingreportData = () => {
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
     
           WH_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
           location: validation.required({  message:"Storage Location should not be empty",isObject: true }),
           //LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
          // WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
           //SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
           //BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
           //LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
           //LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
           //LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
           FormData: validation.required({  message:"From Date should not be empty",isObject: false }),
           ToDate: validation.required({  message:"To Date Type should not be empty",isObject: false }),
           //FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
           //RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
           //FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
           //FA: validation.required({  message:"Fumigation Agency should not be empty",isObject: true }),
           //FN: validation.required({ message:"Fumigator Name should not be empty", isObject: true }),
           //VN: validation.required({  message:"Vendor Name should be numeric value",isObject: false }),
           //ALPC: validation.required({ message:"ALP Count should not be empty", isObject: false }),
           //AmountPer: validation.required({  message:"AmountPer should not be empty",isObject: false }),
        
         }),
        onSubmit(values) {},
      });
      const onSubmit = () => {

      }
    return (
        <Fragment>
    
      <CardComponent  header="Warehouse Bag Cutting report">
     
       < Warehousebagcuttingreport form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
    )
}

export default WarehousebagcuttingreportData


    
    

