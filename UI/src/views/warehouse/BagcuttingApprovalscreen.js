import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
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


const Bagcuttingapproval = ({form})  => { 
    const[bagcuttingEntryformData , setbagcuttingentryfromData] = useState([]);  
const[formDBData , setformDBData] = useState([]);
    const[lotidoption, setlotidoption] = useState([]);                                                                       
	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);

    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
     
        onFetchbagcuttingentryById();

     
    }, [id]);
    const onFetchbagcuttingentryById = () => {
      let fdata = {
      
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/bagcutting/getbagcuttinglist", fdata)
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
    
 

 
    const onTextChange = (e,PKey, CheckList,Val) => {

      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].bagcuttingid==PKey){
            if(Val=="wm_remarks"){
              CheckList[i].wm_remarks=e.target.value;
            }
            else if(Val=="no_of_bags"){
              CheckList[i].no_of_bags=e.target.value;
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

 
 const showInventory = () => {

 
let Data={
  ...form.values
}
 
  let fdata = {
    Data,
   formType:"getbagcutting"
  };
  
  
   
    showLoader();
    
      apiPostMethod(BagcuttingUrl, fdata)
      .then((response) => {
        if (response.data.success) {
         // ShowToast("Successfully updated...");
         // history.push(`/warehouse/KeyloanPledgeloanUpdate`);
         // window.location.reload();
       //  setbagcuttingEntryfromData(response.data.results);
         console.log(JSON.stringify(response.data.results));
         console.log(JSON.stringify(bagcuttingEntryformData))
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      });
    
  
}
 const updatebagcuttingadjustmentapprove = () => {
  if(bagcuttingEntryformData.length<=0){
    errorToast("Something went wrong, Please Enter atleast one Entry");
    return false;

  }

  let fdata = {
    bagcuttingEntryformData,
   formType:"bagcuttingApproval",
  };

    showLoader();



      apiPostMethod("/warehouse/bagcutting/Savebagcuttingadjustment", fdata)
      .then((response) => {
        if (response.data.success) {
          ShowToast("Successfully updated...");
          history.push(`/warehouse/bagcuttingadjustmentapprove`);
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      }); 
}
const ActionEntry = (BagCuttingId,no_of_bags,Remarks,Status) => {
     

  let Data={approvestatus:Status,wm_remarks:Remarks, no_of_bags:no_of_bags}
  const postdata = {
    id:BagCuttingId,
    ScreenType:'BAGCUTTINGAPPROVAL',
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/bagcutting/updateBagcut", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/BagCuttingApproval");
     // window.location.reload();
     
      }
      onFetchbagcuttingentryById();
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });

}


    return ( 

<Fragment>
<div style={{Width:"970px",maxHeight:"40vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white' style={{height:"150px",fontSize:"12px",textAlign:"center"}}> 
                <tr> 
                   <th style={{minWidth:"200px",fontWeight:"500"}}>VA No</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Delivery No</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Delivery Date</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Delivery Qty</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Bag Type</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>No of Bags</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Sending Plant </th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Sending Stroage Location</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Receiving Plant </th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Receiving Stroage Location</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Bag Cuttiing Vendor</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Bag Cutting Charges</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Tolerance %</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Movement Team Remarks</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Status</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Action</th> 
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
             
            {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                        <tr>
                          

                          <td>{row.va_no}</td>
                          <td>{row.delivery_no}</td>
                          <td>{row.deliveryDt}</td>
                          <td>{row.delivery_qty}</td>
                          <td>{row.BAG_NAME}</td>
                          <td>
                          <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}} placeholder={" "}  
                   onChange={(e) => onTextChange(e,row.bagcuttingid,form.values.CheckList,"no_of_bags")} 
                    form={form} id={`no_of_bags_${index}`} 
                    type="text" value={row.no_of_bags}   />
                          </td>
                          <td>{row.SendingPlantName}</td>
                          <td>{row.SendingStoragePlantName}</td>
                          <td>{row.ReceivingPlantName}</td>
                          <td>{row.ReceivingStoragePlantName}</td>
                          <td>{row.wheat_variety}</td>
                          <td>{row.Name}</td>
                          <td>{row.bag_cutting_charges}</td>
                          <td>{row.tollerancepercent}</td>
                         
                          <td> <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}} placeholder={" "}  
                   onChange={(e) => onTextChange(e,row.bagcuttingid,form.values.CheckList,"wm_remarks")} 
                    form={form} id={`wm_remarks_${index}`} 
                    type="text" value={row.wm_remarks}   /></td>  
                          <td>{row.approvestatusName}</td> 
                          
                          <td> 
                             <div style={{display:"flex",gap:"5px"}}><Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.bagcuttingid,row.no_of_bags,row.wm_remarks,2);}}>Approve</Button.Ripple>
                                              
                            <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.bagcuttingid,row.no_of_bags,row.wm_remarks, -1);}}>Reject</Button.Ripple> 
                            </div>
                            
                            </td>                        </tr>
                        ))}  

            </tbody>
        </table>  
        </div>
        <div class="d-flex justify-content-center mt-1">
          <div class="p-1 ">
   </div>
         </div>
        </Fragment>
    )
} 
const BagcuttingadjustmentapproveData = () => { 
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
        <CardComponent  header="Warehouse Bag Cutting Approval Screen">
       <Bagcuttingapproval form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default BagcuttingadjustmentapproveData 
