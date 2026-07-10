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
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { Link } from "react-router-dom";


const FumigationEntrylistScreen = ({form}) => {

  const[fumigationlist, setFumigation] = useState({ ...FumigationEntrylistScreenData });
  const[warehouseoption, setWarehouseoption] = useState([]);
  const[WhPlantOptions, setWhPlantOptions] = useState([]);
  const[WhWheatvarietyOptions,setwheatvarietyidoption] = useState([]);
  const[WhLotOptions, setWhLotOptions] = useState([]);

//Drop down validation start new
const onWarehouseChange = (e) => {
  const { value, label } = e;
  FillPlantList(value, label); 
  };
  const FillPlantList = (WH_CODE, WH_NAME) => {
  let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
  console.log("Plant") ;
  setWhPlantOptions([{ options: data.results }]);
  form.setValues({
  ...form.values,
  ColleratoralManager : data.results[0].name_of_collateral,
  Company: data.results[0].company_name,
  WareHouse: {label: WH_NAME,value: WH_CODE},
  });
  console.log("After Fetch Plant"+data.results[0].name_of_collateral) ;
  //form.setFieldValue('WareHouse', { label: WH_NAME,value: WH_CODE });
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
  };
  const onPlantChange = (e) => {
  const { value, label } = e;
  form.setFieldValue('plantid', { label: label,value: value });
  
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
  
  form.setFieldValue('LotNumber', { label: label,value: value });

FillWheatVarityList(value, label);
 } 

 const FillWheatVarityList = (paramLotId, paramLotNo) => {
let fdata = { lotid: paramLotId, screenType: "INVENTORY" };
apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
.then((response) => {
 const { data } = response;
if (data.success) {
 setwheatvarietyidoption([{ options: data.results }]);
 console.log(data.results);
 form.setValues(
 {...form.values, lotid: {value:paramLotId, label:paramLotNo},
 plantname: data.results[0].plantname,
 plantid: data.results[0].plantid,
 wh_refid: data.results[0].wh_refid,
 warehousename: data.results[0].wh_name,
 wh_code: data.results[0].wh_code,
 SAP_Qty: data.results[0].SAP_Qty,
 init_lot_qty: data.results[0].init_lot_qty,
 
 }
 );
 form.setFieldValue("lotid", {value:paramLotId, label:paramLotNo});
 }
 })
 .catch((error) => {
 errorToast("Something went wrong, please try again after sometime");
 });
};

const onWheatvarietyChange = (e) => {
 const{value, label} = e; 
 form.setFieldValue("Wheat_Variety_Id", {value:value, label:label});
 //setStockEntryfromData({ ...stockEntryformData, Wheat_Variety_Id:value, WheatVariety:label }); 

}

//Dropdown validation new end  
 
  return (   
     <Fragment>   
         <div class="d-flex justify-content-end">
        <div class="mx-1">
        <Link to="/fumigation">
    <Button.Ripple color="primary"  type="Button" >
     Fumigation
     </Button.Ripple>
     </Link>
     </div>
     <div class="mx-1">
       <Link to ="/DegassingConfirmationQc">
     <Button.Ripple color="primary"   type="Button" >
     Degassing QC
     </Button.Ripple>
     </Link>
     </div>
     </div>
         <div class="p-1">
         
         <Row >
         <Col md="3" sm="12" >
        <CustomDropdownInput style={{"minwidth":"270px"}} 
         url={`${apiBaseUrl}marketdata/master/getwarehouses`}
         label={"Warehouse Name"} form={form} id="WareHouse" 
        onChange={onWarehouseChange} />
        <span id="WareHouse_Error" style={{color: "red"}} ></span>
        </Col>

        <Col md="3" sm="12" >
        <Label>Storage Location</Label>
        <Select style={{"width":"370px"}}
        options={WhPlantOptions}
        id={"plantid"}
        className="react-select"
        classNamePrefix="select"
        onChange={(e) => onPlantChange(e)}
        />
        <span id="plantid_Error" style={{color: "red"}} ></span>
        </Col>

        <Col md="3" sm="12" >
        <label>Lot No</label>
        <Select 
        options={WhLotOptions} form={form} id="LotNumber" 
        className="react-select"
        classNamePrefix="select"
        onChange={(e) => onLotChange(e)}
        />
        <span id="LotNumber_Error" style={{color: "red"}} ></span>
        </Col>

        <Col md="3" sm="12" >
        <label>Wheat Variety</label>
        <Select
        style={{"width":"170px"}}
        options={WhWheatvarietyOptions}
        id={"WheatVariety"}
        className="react-select"
        classNamePrefix="select"
        onChange={(e) => onWheatvarietyChange(e)}
        />
        <span id="WheatVariety_Error" style={{color: "red"}} ></span>
        </Col> 
        </Row>

        <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/masters/getFumigationStatus`} 
        label={"Fumigation Status"} form={form} id="Fumigation_Status" 
        />
        </Col>

         <div class="m-2  ">
         <Button.Ripple color="primary"  type="Button" >
          Show
          </Button.Ripple>
          </div>
          
         </Row>

         </div> 
         <div style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}}>
         <table >
             <thead class= "bg-primary text-white"  style={{height:"50px",textAlign:"center",fontSize:"12px"}} >
                 <tr>
                     <th  style={{minWidth:"200px",fontWeight:"500"}}>Warehouse Name</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Storage Location</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Lot No</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Stock in MTS</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Last Fumigation Type</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Last Fumigated on</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Last Degassed on</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Next Due Date</th>
                     <th style={{minWidth:"200px",fontWeight:"500",textAlign:"center"}}>Lead Days</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation Status</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>QC Update</th>
                     <th style={{minWidth:"200px",fontWeight:"500"}}>Action</th>

                 </tr>
             </thead>
             <tbody style={{height:"50px",textAlign:"center"}}>
                 <tr>
                     <td>Warehouse1</td>
                     <td>Storage Location</td>
                     <td>A1</td>
                     <td>Wheat1</td>
                     <td>From SAP API</td>
                     <td>ALP</td>
                     <td>From Database</td>
                     <td>From Database</td>
                     <td><CustomTextInput form={form} id="date" type="date"  /></td>
                     <td>-30</td>
                     <td>Fumigation Lapsed</td>
                     <td><Button.Ripple color="primary" type="Button" >Force Fumigate</Button.Ripple></td>
                     <td><Button.Ripple  color="primary" > Fumigate</Button.Ripple></td>
                 </tr>
             </tbody>
         </table> 
         </div>
         </Fragment>

  
  )
}


const FumigationEntrylistScreenData = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
 
       warehousename: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
       locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
       LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
       WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
    
       BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
   
     }),
    onSubmit(values) {},
  });
  const onSubmit = () => {

  }
  return ( 
    <Fragment>
    <CardComponent  header="Fumigation Entry List Screen">
   <FumigationEntrylistScreen form={form}  onSubmit={onSubmit}  />
 </CardComponent>
  </Fragment>
    
  );
};

export default FumigationEntrylistScreenData