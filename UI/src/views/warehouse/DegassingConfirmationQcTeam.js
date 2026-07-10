import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
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
import { isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';

const Degassingvalues = { 
  warehouseid: "",
  wh_code: "",
  Wh_Name: "",
  plantid: "",
  locationid: "",
  SLocation: "",
  lotno: "", 
  wheatvariety: "", 
  wheatvarietyid: "", 
  stock_in_MTS: "",
  BagType: "", 
  Last_Fumigated_on: "", 
  Next_due_date: "",
  Lead_days: "",

  // FumigationNO: "",
  // Fumigation_date: "",
  // Last_Fumigation_Type: "", 
  // Last_Degassed_date: "",
  // Next_Due_Date: "",
  // LeadDays: "",
  // Fumigation_status: "",
  // QC_updated: "",
  // QC_updated_Userid: "",
  // Fumigation_NO: "",
  // Reason_for_Delay: "",
  // Bag_Type: "",
  // Fumigation_Type: "",
  // Fumigation_Agency: "",
  // Fumigator_Name: "",
  // Vendor_Name: "",
  // ALP_Count: "",
  // ActionRequired: "",
  // Reason_for_Devation: "",
  // Fumigation_statusid: "", 
  // Fumigation_Status: "",

}

const DegassingConfirmationQcTeam = ({form}) => { 
  const[degassing,setDegassing] = useState({ ...Degassingvalues}); 
  const[warehouse,setWarehouse] = useState([]); 
   
    
     
    return (
      <Fragment>
        
          <div class="mx-2">
          <Row>

          <Col md="3" sm="12">
         <CustomTextInput label={"Warehouse Name"} form={form} id="Wh_Name" type="text" />
        </Col>
      
     
          <Col md="3" sm="12">
         <CustomTextInput label={"Storage Location"} form={form} id="SLocation" type="text" />
        </Col>
     
          <Col md="3" sm="12">
         <CustomTextInput label={"Lot No"} form={form} id="LotNo" type="text" />
        </Col>
        </Row> 
        </div>
        <div class="mx-2">
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Wheat Variety"} form={form} id="bag" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Stock in MTS"} form={form} id="stoc" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Bag Type "} form={form} id="BagType" type="text" />
      </Col>
      </Row> 
      </div>
      <div class="mx-2">
        
    
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Last Fumigated on "} form={form} id="Last_Fumigated_on" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Next Due Date "} form={form} id="funmigation" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Lead Days"} form={form} id="lead" type="text" />
      </Col>
      </Row> 
      </div>
      <div class="mx-2">
        
    
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Last Degassed on"} form={form} id="Degassed" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Last Fumigation Type"} form={form} id="fumigation" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Fumigation Status"} form={form} id="status" type="text" />
      </Col>
      </Row> 
      </div>
      <div class="mx-2">
        
    
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Reason for Deviation"} form={form} id="reason" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Fumigation Type"} form={form} id="fumigation type" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Fumigation Agency"} form={form} id="fumigation" type="text" />
      </Col>
      </Row> 
      </div>
      <div class="mx-2">
        
    
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Fumigator Name "} form={form} id="Fumigationame" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Vendor Name"} form={form} id="vendor" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"ALP Count  "} form={form} id="Count" type="text" />
      </Col>
      </Row> 
      </div>
      <div class="mx-2">
        
    
        <Row>

        <Col md="3" sm="12">
       <CustomTextInput label={"Amount Per Lot"} form={form} id="Amount" type="text" />
      </Col>
    
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Fumigation Date & Time "} form={form} id="FumigationData" type="text" />
      </Col>
   
        <Col md="3" sm="12">
       <CustomTextInput label={"Degassing Status "} form={form} id="Degassing" type="text" />
      </Col>
      </Row> 
      </div> 
      <div class="d-flex justify-content-center">
        <div class="p-1">
    <Button.Ripple color="primary" type="Button" >
     Save
     </Button.Ripple>
     </div>
     <div class="p-1">
     <Button.Ripple color="primary"   type="Button" >
     History
     </Button.Ripple>
     </div>
     </div>
     
      </Fragment>
    )
}


const DegassingConfirmationQcTeamData = () => {
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
       Last_Fumigated_on: validation.required({  message:"Last_Fumigation on should not be empty",isObject: true }), 
       Last_Fumigated_date: validation.required({ message:"Last_Fumigation_date should not be empty",isObject:true}),

      //  LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
      //  LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
      //  LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
      //  LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
      //  FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
      //  RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
      //  FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
      
    
     }),
    onSubmit(values) {},
  });
  const onSubmit = () => {

  }
  return (
    <Fragment>
    <CardComponent  header="Degassing Confirmation Qc Team">
   <DegassingConfirmationQcTeam form={form}  onSubmit={onSubmit}  />
 </CardComponent>
  </Fragment>
  )
}




export default DegassingConfirmationQcTeamData
