import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle, FormGroup } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from '../../@core/components/confirm/confirmDialog'



const PPDetailEdit = ({form})  => { 
 
  const [warehouseoption, setWarehouseoption] = useState([]);  
  let { showLoader, hideLoader } = useLoader();
  const [ppData, setPPData] = useState({});

  const history = useHistory();

 useEffect(() => {
    onFetchFumidetailsById();
}, []);

 const onFetchFumidetailsById = () => {

apiPostMethod(apiBaseUrl + "FCITruckController/FCI_Cost_Details")
.then((response) => {
    const { data } = response;
    if (data.success) {
          form.setValues({
            mobile_numbers:data.results[0].mobile_numbers,
            session_time_out:data.results[0].session_time_out,
            WB_BufferPercentage:data.results[0].WB_BufferPercentage,
            rake_fnr_no_date:data.results[0].rake_fnr_no_date,
            invoice_posting_date:data.results[0].invoice_posting_date,
            sap_posting_date:data.results[0].sap_posting_date,
            load_unload_cost_percentage:data.results[0].load_unload_cost_percentage,
            vehicleMinWeight:data.results[0].vehicleMinWeight,
            atti_cooli:data.results[0].atti_cooli,
            extra_momul:data.results[0].extra_momul,
            office_expense:data.results[0].office_expense,
            weighment_expense:data.results[0].weighment_expense,
            gate_expense:data.results[0].gate_expense,
            freight_cost:data.results[0].freight_cost,
            vehicleNoValidation:data.results[0].vehicleNoValidation,
            migoDaysControl:data.results[0].migoDaysControl,
            net_weight_validation:data.results[0].net_weight_validation,
            courier_sending_date:data.results[0].courier_sending_date
          })
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  })
  .finally((a) => {
    // hideLoader();
  });
}
const ActionEntry = () => {

const postdata = {
    mobile_numbers:form.values.mobile_numbers,
    session_time_out:form.values.session_time_out,
    WB_BufferPercentage:form.values.WB_BufferPercentage,
    rake_fnr_no_date:form.values.rake_fnr_no_date,
    invoice_posting_date:form.values.invoice_posting_date,
    sap_posting_date:form.values.sap_posting_date,
    load_unload_cost_percentage:form.values.load_unload_cost_percentage,
    vehicleMinWeight:form.values.vehicleMinWeight,
    atti_cooli:form.values.atti_cooli,
    extra_momul:form.values.extra_momul,
    office_expense:form.values.office_expense,
    weighment_expense:form.values.weighment_expense,
    gate_expense:form.values.gate_expense,
    freight_cost:form.values.freight_cost,
    vehicleNoValidation:form.values.vehicleNoValidation,
    migoDaysControl:form.values.migoDaysControl,
    net_weight_validation:form.values.net_weight_validation,
    courier_sending_date:form.values.courier_sending_date,
}

let msg = "PP Setting Control"
confirmDialog({
  title: "Are you sure want to Change?",
  description: msg,
}).then((res) => {
  if (res) {
showLoader();
apiPostMethod(apiBaseUrl + "FCITruckController/PP_Setting_Update", postdata)
  .then((response) => {
  const { data } = response;
  console.log(JSON.stringify(response))
  let UsrId=data.success;
   if(UsrId==1){
    window.location.reload();
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
}
)}
  return ( 
    <Fragment>
        <Row>
         
         
          <Col md="4" sm="12">
            <CustomTextInput label={"Mobile Number For IAS/STM"} form={form} id="mobile_numbers" type="text"  maxLength = {'10'}/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Session Time Out"} form={form} id="session_time_out" type="text"   />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Buffer Percentage"} form={form} id="WB_BufferPercentage" type="text"  />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Rake FNR Limit"} form={form} id="rake_fnr_no_date" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"LoadUnload Inv Payment Post Limit"} form={form} id="invoice_posting_date" type="text"  />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"LoadUnload SAP Payment Post Limit"} form={form} id="sap_posting_date" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Load Unload Cost Percentage"} form={form} id="load_unload_cost_percentage" type="text"  />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Vehicle Minimum Weight"} form={form} id="vehicleMinWeight" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Net Weight Validation"} form={form} id="net_weight_validation" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Migo Control Days"} form={form} id="migoDaysControl" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Courier Sending Date"} form={form} id="courier_sending_date" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Vehicle No Validation"} form={form} id="vehicleNoValidation" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Atti Cooli"} form={form} id="atti_cooli" type="text" />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Extra Charge"} form={form} id="extra_momul" type="text"/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Office Expense (Ton)"} form={form} id="office_expense" type="text"/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Weighment Charge"} form={form} id="weighment_expense" type="text"/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Gate Expense"} form={form} id="gate_expense" type="text"/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Freight Expense"} form={form} id="freight_cost" type="text"/>
          </Col>
          <Col sm="12" >
           <FormGroup className="d-flex justify-content-end mb-0">
              <Button.Ripple color="primary" type="Button" onClick={(e) => ActionEntry()}>Submit</Button.Ripple>            
           </FormGroup>
          </Col>
        </Row>  
      <div class="d-flex justify-content-center mt-1">
      <div class="p-1 ">
    </div>
    </div>
  </Fragment>
  )
} 
const PPDetailEditForm = () => { 
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

     }),
    onSubmit(values) {},
  }); 
  const Values = form.values;

  return(
    <Fragment>
     <CardComponent  header="PP Control Change">
       <PPDetailEdit form={form}  />
     </CardComponent>
    </Fragment>
  )

}

export default PPDetailEditForm 
