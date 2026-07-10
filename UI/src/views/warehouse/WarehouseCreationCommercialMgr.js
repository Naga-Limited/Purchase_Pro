import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import Uploader from "../Uploader";
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
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';


const WarehouseCreationCommercialTeam = ({form,onSubmit, setTitleName,isViewOnly}) => {
    const[Bankoption,setBankoption] = useState([]);                                                                    
 
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='', sumitdisabled=true;
    if( id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
      if(id){
        onFetchStockentryById();
 
      }
    }, [id]);
    const onFetchStockentryById = () => {
      let fdata = {
        id:refid,
      };
      
      
    showLoader();
    // console.log("Request Url :: "+apiBaseUrl + "Master/getMaster_new_warehouseDetailsById", fdata);
     apiPostMethod(apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
        form.setValues({
          wh_refid:data.results[0].wh_refid,
           wh_name:data.results[0].wh_name,

           name_of_collateral:data.results[0].name_of_collateral,
name_of_bank:data.results[0].name_of_bank,
naga_pwh_insurance_no:data.results[0].naga_pwh_insurance_no,
naga_pwh_insurance_attachment:data.results[0].naga_pwh_insurance_attachment,
insurance_covered_amt:data.results[0].insurance_covered_amt,
insurance_premium_amt:data.results[0].insurance_premium_amt,
insurance_period:data.results[0].insurance_period,
insurance_company:data.results[0].insurance_company,
insurance_start_date:data.results[0].insuranceStartDt,
insurance_end_date:data.results[0].insuranceEndDt,
gst_registration:data.results[0].gst_registration,
company_name:data.results[0].company_name,
contract_agreement_attachment:data.results[0].contract_agreement_attachment,
GST_TYPE:data.results[0].gst_type,
effective_from:data.results[0].effectiveFrmDt,
effective_to:data.results[0].effectiveToDt,
           
         });
         sumitdisabled=false;
         form.setFieldValue("name_of_bank",{label:data.results[0].bankname,value:data.results[0].name_of_bank})
         form.setFieldValue("company_name",{label:data.results[0].companyName,value:data.results[0].company_name})
         
         //setTitleName(data.results[0].wh_name);
       }
       //console.log("Result Data :: "+JSON.stringify(form));
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
    //  setStockEntryfromData({ warehouseid:value, warehousename:label});
      FillPlantList(value);
 }
 
 const FillPlantList  = (warehouseid) => {
   let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
   apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
   .then((response) => {
     const { data } = response; 
     if(data.success) {
      // setLocationoption([{options:data.results}]);
     }
   })
   .catch((error) => {
     errorToast("Something went wrong, please try again after sometime");
   });
 };
 
 /**** Bank List Name ****/

 const onBankList = () => {
   FillBankList()
 
 }
 const FillBankList = () => {
   apiPostMethod(apiBaseUrl+'warehouse/master/getbankDetails') 
   .then((response) => {
     const { data } =response; 
     if(data.success) {
      setBankoption([{options:data.results}]);
     }
   })
   .catch((error) => {
     errorToast("Something went wrong please try again after sometime");
   });
 };


 const OnLotChange = (e) => {
   const {value, label} = e; 
  // setStockEntryfromData({ lotid:value, lotno:label}); 
  // Fillwheatvarity(value)
  
 } 
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
  //  setWheatvarietyoption({ WheatVarietyid:value, WheatVariety:label }); 
 
 }
 const ShowStock = (e) => {
  // let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
   apiPostMethod(apiBaseUrl+'warehouse/physicalstocktaking/getphysicalstocklist',fdata)
   .then((response) => {    
     const {data} = response;
     const  value = value;
     if(data.success){ 
       console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
 
 
         //setshowlot({ ...stockEntryformData, lotno:value}); 
         //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
            
     }
   })
   .catch((error) => {
     errorToast("Something went wrong, please try again after sometime")
   }); 
 
 }
 const onApproveReject = (e) => { 
  console.log(" Approve");
  console.log(e.target.value);
  e.preventDefault();
  let reject=0, approve=0;
  if(e.target.value && e.target.value=="APPROVE")
  {
    form.setValues({...form.values, reject:"0",approve:"1" });
    reject=0;
    approve=1;
  }
  else
  {
    form.setValues({...form.values, reject:"1",approve:"0" });
    reject=1;
    approve=0;
  }

  onSubmitApproveReject(approve, reject);

}

const onSubmitApproveReject = (approve, reject) => { 
  console.log("Before Submit " + form.values.approve + " " + form.values.reject+"X");
  
  /*if(!form.isValid)
  {
    form.setSubmitting(true);
    form.validateForm();
    return;
  }*/
  form.setSubmitting(true);
  const formData = form.values;

  const FrmData = { 
    RejectReason:formData.RejectReason,
  };
  const postdata = {
    id:formData.wh_refid,
    Data:FrmData,
    approve:approve,
    formtype:"COMMMGRAPPROVAL",
    reject:reject,
  }
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseApprove", postdata)
    .then((response) => {
      const { data } = response;
      console.log(" Response Data ::: "+JSON.stringify(response));
      
      let RespId=data.success;
      if(RespId && RespId>=1)
      {
        ShowToast("Saved Successfully...");

          history.push("/warehouse/wclcommmgr");
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
             <Row>
                 <Col md="3" sm="12">
                   <span><h6>{form.values.wh_name}</h6></span>
                   </Col>
              </Row>
              <Row>
                 <Col md="3" sm="12">
                 <CustomTextInput label={"Name of Collateral"} form={form} id="name_of_collateral" disabled disabled type="text"  /> 
                 <span id="name_of_collateral_Error" style={{color: "red"}} ></span>
                 <CustomTextInput form={form} id="wh_name" type="hidden"  />
                 <CustomTextInput form={form} id="wh_refid" type="hidden"  />
                 </Col>  

                 <Col md="3" sm="12">
                 {/* <Label>Name of the Bank</Label>
                 <Select
                    id={"name_of_bank"}
                    onChange={onBankList}
                    options ={Bankoption}     />      
                      <span id="name_of_bank_Error" style={{color: "red"}} ></span>        */}
                    
                    <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getbankDetails`} 
                    form={form} label={"Name Of The Bank"} id="name_of_bank"/>
                    </Col> 

                    <Col md="3" sm="12">
                    <CustomTextInput label={"NAGA/PWH Insurance No"} form={form} id="naga_pwh_insurance_no" disabled disabled type="text"  /> 
                    <span id="naga_pwh_insurance_no_Error" style={{color: "red"}} ></span>       
                    </Col>   

                    <Col md="3" sm="12">
                    {/* <CustomTextInput label={"NAGA/PWH Insurance"} form={form} id="naga_pwh_insurance_attachment" type="file"  /> 
                    <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple>
                    <span id="naga_pwh_insurance_attachment_Error" style={{color: "red"}} ></span>*/}
                 
                    <Uploader isReadOnly={true} label={"NAGA/PWH Insurance"} selectedFileName={form.values.naga_pwh_insurance_attachment} />
                   </Col>  


             </Row> 
             <Row>
                 <Col md="3" sm="12">
                 <CustomTextInput label={"Insurance Covered Amt"} form={form} id="insurance_covered_amt" type="Number"  />
                 <span id="insurance_covered_amt_Error" style={{color: "red"}} ></span>
                 </Col>  
               
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Insurance Premium Amt"} form={form} id="insurance_premium_amt" type="Number"  /> 
                    <span id="insurance_premium_amt_Error" style={{color: "red"}} ></span>
                    </Col>  

                    <Col md="3" sm="12">
                    {/* <Label>Insurance Period</Label>
                    <Select
                    id={"insurance_period"}
                    onChange={""} />             */}
                    <CustomTextInput label={"Insurance Period"} form={form} id="insurance_period" disabled type="text"  /> 
                       {/* <span id="insurance_period_Error" style={{color: "red"}} ></span> */}
                    </Col> 
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Insurance Company"} form={form} id="insurance_company" disabled type="text"  />
                    <span id="insurance_company_Error" style={{color: "red"}} ></span>
                    </Col>  

             </Row> 
              <Row>
                  <Col md="3" sm="12">
                  <CustomTextInput label={"Insurance Start Date"} form={form} id="insurance_start_date" disabled type="text"  /> 
                  <span id="insurance_start_date_Error" style={{color: "red"}} ></span>
                  </Col> 
                  <Col md="3" sm="12">
                  <CustomTextInput label={"Insurance End Date"} form={form} id="insurance_end_date" disabled type="text"  />
                  <span id="insurance_end_date_Error" style={{color: "red"}} ></span>
                  </Col>
              </Row>  
              <Row>
               <Col md="3" sm="12">
               <CustomTextInput label={"GST Registration"} form={form} id="gst_registration" disabled type="text"  />
               <span id="gst_registration_Error" style={{color: "red"}} ></span>
              </Col>                  
              <Col md="3" sm="12">
               {/* <Label>Company Name</Label>
               <Select
                    id={"company_name"}
                    onChange={""} />  */}
                    <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getCompanyDetails`}
                     form={form} label={"Company Name"} id="company_name"/>
                       {/* <span id="company_name_Error" style={{color: "red"}} ></span> */}
                    </Col> 
                    <Col md="3" sm="12">
                   {/* <CustomTextInput label={"Contract Agreement"} form={form} id="contract_agreement_attachment" type="file"  /> 
                    <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple>
                    <span id="contract_agreement_attachment_Error" style={{color: "red"}} ></span>*/}
                   
                    <Uploader isReadOnly={true} label={"Contract Agreement"} selectedFileName={form.values.contract_agreement_attachment} />
                  
                    </Col>  
                    
           
            </Row>  
            <Row> 
                <Col md="3" sm="12"> 
                {/* <Label>GST Type</Label>
                <Select
                    id={"GST_TYPE"}
                onChange={"gst_type"}/>           */}
                <CustomTextInput label={"GST Type"} form={form} id="GST_TYPE" disabled type="text"  /> 
                 {/* <span id="gst_type_Error" style={{color: "red"}} ></span> */}
                </Col> 
                <Col md="3" sm="12">
                    <CustomTextInput label={"Effective Form"} form={form} id="effective_from" disabled type="text"  />
                    <span id="effective_from_Error" style={{color: "red"}} ></span>
                    </Col>  
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Effective To"} form={form} id="effective_to" disabled type="text"  /> 
                    <span id="effective_to_Error" style={{color: "red"}} ></span>
                    </Col> 
                    {false && <Col md="3" sm="12">
                    <Button.Ripple color="primary"  type="Button" isDisabled={sumitdisabled} className='mt-2' onClick={(e) => onSubmit()}>Submit</Button.Ripple>
                    </Col>}
            </Row>
            {false&& <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         <Button.Ripple color="primary"  type="Button"> View Entry</Button.Ripple>
          </div>
          <div class="p-1 ">
          <Button.Ripple color="primary"  type="Button" > View Warehouse Lot</Button.Ripple>
          </div>
         </div>}
         <div class="d-flex justify-content-center mt-2">
         <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="APPROVE" type="Button">Approve</Button.Ripple>
         <CustomTextInput  form={form} id="approve" type="hidden"  /> 
         <CustomTextInput  form={form} id="reject"  type="hidden"  /> 
          </div> 
          <div class="p-1 ">
          <CustomTextInput  form={form} id="RejectReason" placeholder="Remarks" type="text"  /> 
          </div>
          <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="REJECT" type="Button">Reject</Button.Ripple>
          </div> 
            </div>

         </Fragment>
    )
}



const WarehouseCreationCommercialTeamData = ({isViewOnly}) => { 
    const history = useHistory();
    const {showLoader , hideLoader} = useLoader(); 
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const isToday = (data) => {
      return moment(data).format(dateFormat) == today;
    };
    const {titleName, setTitleName} = useState("");    
    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({
        name_of_collateral:validation.required({ message:"Name Of Collateral should not be empty", isObject:false }),
        name_of_bank: validation.required({  message:"Name Of Bank should not be empty",isObject: true }),
      //  naga_pwh_insurance_no: validation.required({ message:"Naga Pwh Insurance No should not be empty", isObject: true }),
        naga_pwh_insurance_attachment: validation.required({  message:"Naga Pwh Insurance Attachment should not be empty",isObject: false }),
        insurance_covered_amt: validation.required({  message:"Insurance Covered Amt should not be empty",isObject: false }),
        insurance_premium_amt: validation.required({  message:"Insurance Premium Amt should not be empty",isObject: false }),
        insurance_period: validation.required({ message:"Insurance Period should not be empty", isObject: false }),
        insurance_company: validation.required({ message:"Insurance Company should not be empty", isObject: false }),
        insurance_start_date: validation.required({ message:"Insurance Start Date should not be empty", isObject: false }),

        insurance_end_date: validation.required({ message:"Insurance End Date Date should not be empty", isObject: false }),
        gst_registration: validation.required({ message:"Gst Registration should not be empty", isObject: false }),
        company_name: validation.required({ message:"Company Name Date should not be empty", isObject: true }),
      //  contract_agreement_attachment: validation.required({ message:"Contract Agreement Attachment should not be empty", isObject: true }),
        GST_TYPE: validation.required({ message:"GST TYPE should not be empty", isObject: false }),
        effective_from: validation.required({ message:"Effective From should not be empty", isObject: false }),
        effective_to: validation.required({ message:"Effective To should not be empty", isObject: false }),

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

        name_of_collateral:formData.name_of_collateral,
        name_of_bank:formData.name_of_bank.value,
        naga_pwh_insurance_no:formData.naga_pwh_insurance_no,
        naga_pwh_insurance_attachment:formData.naga_pwh_insurance_attachment,
        insurance_covered_amt:formData.insurance_covered_amt,
        insurance_premium_amt:formData.insurance_premium_amt,
        insurance_period:formData.insurance_period,
        insurance_company:formData.insurance_company,
        insurance_start_date:formData.insurance_start_date,
        insurance_end_date:formData.insurance_end_date,
        gst_registration:formData.gst_registration,
        company_name:formData.company_name.value,
        contract_agreement_attachment:formData.contract_agreement_attachment,
        gst_type:formData.GST_TYPE,
        effective_from:formData.effective_from,
        effective_to:formData.effective_to,
  
      };
      console.log(" Warehouse Creation Commercial Team :: "+JSON.stringify(FrmData));
      const postdata = {
        id:formData.wh_refid,
        screentype:"WHCOMMERCIAL",
        Data:FrmData
      }
      console.log("  Warehouse Creation Commercial Team :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  Warehouse Creation Commercial Team :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseUpdate", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId=data.success;
          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
            history.push("/warehouse/wcl");
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
             <CardComponent  header={"Warehouse Creation Commercial Team"}>
           <WarehouseCreationCommercialTeam  form={form} isViewOnly={isViewOnly}  onSubmit={onSubmit} titleName={setTitleName}/>
           </CardComponent>
          </Fragment>
    )
}




export default WarehouseCreationCommercialTeamData
