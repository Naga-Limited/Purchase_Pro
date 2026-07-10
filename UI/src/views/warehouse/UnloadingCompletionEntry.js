import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
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
//import warehousebagcuttingentrylist from './bagcuttingapprovalscreen';


const UnloadingCompletion = ({form})  => { 
    const[bagcuttingEntryformData , setbagcuttingentryfromData] = useState([]);  
const[formDBData , setformDBData] = useState([]);
    const[lotidoption, setlotidoption] = useState([]);                                                                       
	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);
    const[locationoption,setLocationoption] = useState([]);  
    const[warehouseoption, setWarehouseoption] = useState([]);  
    
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
    const getSublotlist = () => {
      let Data=form.values;
      let fdata = {
      Screen:"UNLOADINGCOMPLETION",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getsublotlist", fdata)
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
    
 

 
    const onTextChange = (e,PKey, CheckList,Val,index) => {
      const {value, label} = e; 
      //form.setFieldValue({"Infestation_"index: })
      form.setFieldValue('Infestation_'+index, {  label: label,value: value });
      onchange(e,PKey, CheckList,Val,index);
     
    }
    const onchange = (e,PKey, CheckList,Val,index)=>{
      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].sub_lot_id==PKey){
            if(Val=="Infestation"){
              CheckList[i].Infestation=e.value;
            }
            
            
            
        }
      }
      console.log(JSON.stringify(CheckList));
      form.setValues({...form.values,CheckList});
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

 
      
 
const ActionEntry = (sub_lot_id, Infestation, Status, ClearFlag) => {
     
  const current = new Date();
  const date = `${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`;

    var Data={  
      CompletionStatus:Status,
      Infestation:Infestation,
      fumigationstatus:1,
      PP_to_SAP_Sync_Flag:'PENDING',
      nextfumigationdate:date,   
    }
    
  const postdata = {
    id:sub_lot_id,
    ScreenType:'UNLOADINGCOMPLETION',
    ClearFlag:ClearFlag, 
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/Fumigation/updateSublot", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully..");
      history.push("/warehouse/UnloadingCompletionEntry");
    // window.location.reload();
    setTimeout(() => window.location.reload(), 2000);
     
      }
      getSublotlist();
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
  ClearDropdown("WH");
}
const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {
      setLocationoption([{options:data.results}]);
      form.setFieldValue('plantid', {  label: "",value: "" });
      console.log(JSON.stringify(form.values))
      console.log("sdfsdf");
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  });
};
const onPlantchange = (e) => {
  const {value,label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
  
  form.setFieldValue('plantid', {  label: label,value: value });

}

    const ClearDropdown = (Item) => {
      if (Item === "WH"){
        form.setFieldValue('plantid', '');
        //form.setFieldValue('locationid','');
        //form.setFieldValue('lotid', '');
        //form.setFieldValue('wheatvarietyid', '');
      }else if (Item === "PLANT"){
        form.setFieldValue('plantid','');
        form.setFieldValue('lotid', '');
        form.setFieldValue('wheatvarietyid', '');
      }else if (Item === "SL"){
        form.setFieldValue('lotid', '');
        form.setFieldValue('wheatvarietyid', '');
      }else if (Item === "LOT"){
        form.setFieldValue('wheatvarietyid', '');
      }
    }

    return (
      <Fragment>
        <Row>
          <Col md="3" sm="12" >
            <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"}  form={form} id="warehouseid" 
              onChange = {onWarehouseChange}   
              options ={warehouseoption}   
              />
            <span id='warehouseid_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="3" sm="12"> 
            <CustomDropdownInput 
              label = {"Plant"} 
              form={form} id="plantid"
              onChange={onPlantchange} 
              options={locationoption}
              />
            <span id='plantid_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col sm="12" > 
            <FormGroup className="d-flex justify-content-end mb-0">
              <Button.Ripple color="primary"  type="Button" onClick={getSublotlist} >
                Search
              </Button.Ripple>
            </FormGroup>
          </Col>
        </Row>
        <br></br><br></br>
    
        <Row>
          <Col md="12" sm="12" valign="bottom"> 

    <div style={{Width:"970px",minHeight:"40vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center",fontSize:"12px"}}> 
                <tr> 
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Warehouse Name</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Plant</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Storage Location</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Lot No</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Stock in MTS</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Lot Capacity in MTS</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Filled Qty</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Free Qty</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Infestation</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}}>Status</th> 
                  <th style={{minWidth:"100px",fontWeight:"500"}}>Action</th> 
                  <th style={{minWidth:"110px",fontWeight:"500"}}></th> 

                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
             
              {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                        <tr>
                          <td>{row.WH_NAME}</td>
                          <td>{row.PLANT_NAME}</td>
                          <td>{row.StorageLocationName}</td>
                          <td>{row.lotno}</td>
                          <td>{row.WheatVariety}</td>
                          <td>{row.wheatqty}</td>
                          <td>{row.totalcapacity}</td>
                          <td>{row.wheatqty}</td>
                          <td>{row.wheatqty}</td>
                          <td>{row.wheatqty}</td>
                          <td>{row.Infestation!="" && 
                                <CustomTextInput 
                                  style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}} 
                                  placeholder={" "}  
                                  form={form} 
                                  disabled 
                                  id={`InfestationValue_${index}`} 
                                  type="text" 
                                  value={row.Infestation}   
                                />}

                              {row.Infestation=="" && 
                                <CustomDropdownInput  
                                  url={`${apiBaseUrl}warehouse/master/getInfestation`} 
                                  form={form} id={`Infestation_${index}`} 
                                  onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"Infestation",index)} 
                                  options ={warehouseoption}   
                                />}
                            </td> 
                            <td>
                              {(row.CompletionStatus=="0" || row.CompletionStatus=="2") && 
                                <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.sub_lot_id, row.Infestation, 1,0);}}>Fumigation Required</Button.Ripple>}
                              {/*<Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.bagcuttingid,row.wm_remarks, -1);}}>Reject</Button.Ripple>*/}
                            </td> 

                            <td>
                              {row.CompletionStatus=="2" && 
                                <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.sub_lot_id, row.Infestation, 1,1);}}>Fumigation Not Required</Button.Ripple>
                              }
                            </td> 
                          </tr>
                        ))}  
            </tbody>
        </table>  
        </div>
        </Col>
         </Row>
        <div class="d-flex justify-content-center mt-1">
          <div class="p-1 ">
   </div>
         </div>
         
        </Fragment>
    )
} 
const UnloadingCompletionData = () => { 
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
            // history.push("/warehouse/bagcuttingadjustmentapprove");
            setTimeout(() => history.push("/warehouse/bagcuttingadjustmentapprove"), 2000);

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
        <CardComponent  header="Unloading Completion Entry">
       <UnloadingCompletion form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default UnloadingCompletionData 
