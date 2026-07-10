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



const OtherFumigationChargesForm = ({form})  => { 
 
  const [warehouseoption, setWarehouseoption] = useState([]);  
  let { showLoader, hideLoader } = useLoader();
  const [Rate, setRate] = useState('');  
  const [TotalAmount,setTotalAmount] = useState(0);  
  const [GstAmount,setGstAmount] = useState(0);  
  const [OverallAmount,setOverallAmount] = useState(0);  
  const history = useHistory();


  const statusOptions = [
    {
      options: [
        { value: "1", label: "Kannan" },
        { value: "2", label: "Kumar" },
        { value: "3", label: "Raj" },
      ],
    },
  ];

 useEffect(() => {
  if (form.values.FumigationType != undefined) {
    onFetchFumidetailsById();
  }
}, [form.values.FumigationType]);

 const onFetchFumidetailsById = () => {
 let fdata = {
  id: form.values.FumigationType.value,
};
apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_fumigation_typeById", fdata)
  .then((response) => {
    const { data } = response;
    if (data.success) {
      setRate(data.results[0].Rate)
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  })
  .finally((a) => {
    // hideLoader();
  });
}

useEffect(() => {
  if (form.values.area != undefined) {
    Calculation();
  }
}, [form.values.area]);

const Calculation = () => {
  let total_amount = Number(Rate*form.values.area).toFixed(2)
  let GST = Number(total_amount * 0.18).toFixed(2)
  let overall_amount = (Number(total_amount) + Number(GST)).toFixed(2)
  setTotalAmount(total_amount)
  setGstAmount(GST)
  setOverallAmount(overall_amount)
 }
const ActionEntry = () => {

  if(form.values.FumigationType == '' || form.values.FumigationType == undefined){
    errorToast("Please Select Fumigation Type..!");
    return false
  }else if(form.values.warehouseid == '' || form.values.warehouseid == undefined){
    errorToast("Please Select Warehouse Name..!");
    return false
  }else if(form.values.vendor_id == '' || form.values.vendor_id == undefined){
    errorToast("Please Select Vendor Name..!");
    return false
  }

const postdata = {
  Fumigation_type:form.values.FumigationType.value,
  wharehouse_id:form.values.warehouseid.value,
  area:form.values.area,
  rate:Rate,
  total_amount:TotalAmount,
  gst_amount:GstAmount,
  overall_amount:OverallAmount,
  vendor_id:form.values.vendor_id.value,
}

if(postdata.Fumigation_type == '' || postdata.Fumigation_type == undefined){
  errorToast("Please Select Fumigation Type..!");
  return false
}else if(postdata.wharehouse_id == '' || postdata.wharehouse_id == undefined){
  errorToast("Please Select Warehouse Name..!");
  return false
}else if(postdata.vendor_id == '' || postdata.vendor_id == undefined){
  errorToast("Please Select Vendor Name..!");
  return false
}else if(postdata.area == undefined || !/^[0-9]{1,6}([.][0-9]{0,3})?$/.test(postdata.area)){
  errorToast('Please Check Area Square FT...')
  return false
}else if(OverallAmount == 0 || !/^[0-9]{1,6}([.][0-9]{1,2})?$/.test(OverallAmount)){
  errorToast('Please Check Overall Amount ...')
  return false
}

let msg = "Other Fumigation Charges"
confirmDialog({
  title: "Are you sure want to post?",
  description: msg,
}).then((res) => {
  if (res) {
showLoader();
apiPostMethod(apiBaseUrl + "warehouse/Fumigation/other_Fumigation_insert", postdata)
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
          <Col md="4" sm="12" >
            <CustomDropdownInput  
                url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
                label={"Warehouse Name"}  
                form={form} 
                id={"warehouseid"}
                options ={warehouseoption}   
              />
          </Col>
          <Col md="4" sm="12" >
            <Label>Fumigation Type</Label>
              <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getFumigationTypeOther`} 
                form={form} 
                id={"FumigationType"} 
                options ={warehouseoption}   
              />
          </Col>
          <Col md="4" sm="12" >
            <CustomDropdownInput  
                label={"Vendor Name"} 
                url={`${apiBaseUrl}warehouse/master/getFumigationVendor`} 
                form={form} 
                id={"vendor_id"}
                options={warehouseoption}
              />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Area SQFT"} form={form} id="area" type="text"  maxLength = {'10'}/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Rate"} form={form} id="rate" type="text" value={Rate}  disabled/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Total Amount"} form={form} id="total_amount" value={TotalAmount} type="text"  disabled/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"GST Amount"} form={form} id="gst_amount" type="text" value={GstAmount}  disabled/>
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"Over All Amount"} form={form} id="overall_amount" type="text" value={OverallAmount}  disabled/>
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
const OtherFumigationCharges = () => { 
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
        <CardComponent  header="Other Fumigation Charge">
       <OtherFumigationChargesForm form={form}  />
     </CardComponent>
      </Fragment>
    )

}

export default OtherFumigationCharges 
