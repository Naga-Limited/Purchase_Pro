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


const ForceFumigationTeam = ({form})  => { 
    const[bagcuttingEntryformData , setbagcuttingentryfromData] = useState([]);  
const[formDBData , setformDBData] = useState([]);
  const[lotoption,setLotoption] = useState([]);  
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);   
    const[lotidoption, setlotidoption] = useState([]);                                                                       
	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);
    const[locationoption,setLocationoption] = useState([]);  
    const[warehouseoption, setWarehouseoption] = useState([]);  
    const [WhLotOptions, setWhLotOptions] = useState([]); 

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
        sub_lot_id:refid,
      Screen:"FUMIGATIONENTRYLIST",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/fumigation/getsublotlist", fdata)
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
    const getSublotlist_OLD = () => {
      let Data=form.values;
      let fdata = {
      Screen:"FUMIGATIONENTRYLIST",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/fumigation/getfumigationlist", fdata)
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
 
    const onTextChange = (e,PKey, CheckList,Val) => {

      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].FumigationId==PKey){
           
            
           
            if(Val=="ReasonforDeviation"){
              CheckList[i].ReasonforDeviation=e.target.value;
              //CheckList[i].sVendorNamelabel=e.label;
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

 const ActionEntry = (sub_lot_id,ReasonforDeviation,Status) => {
  //if(!form.values.CheckList[index].sReasonforDelay){ errorToast("Select Reason for Delay"); return false}
  let FumigtnData={
    Reason_for_Delay:'',
    Bag_Type:'',
    Fumigation_Type:'',
    Fumigation_Agency:'',
    Fumigator_Name:'',
    Vendor_Name:'',
    Amount:'',
    ALP_Count:'',
    Reason_for_Deviation:ReasonforDeviation,
    Status:2
    
  }
  let Data={
    fumigationstatus:1,
    PP_to_SAP_Sync_Flag:'PENDING',
  }
  const postdata = {
    id:sub_lot_id,
    Status,
    ScreenType:'FORCEFUMIGATIONTEAM',
    Data,
    FumigtnData
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/fumigation/updateSublot", postdata)
    .then((response) => {
     // return false;
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/FumigationEntryList");
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
    Vendor_Name:form.values.CheckList[index].sVendorName,
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
  apiPostMethod(apiBaseUrl + "warehouse/fumigation/updatefumigation", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/ForceFumigationTeam");
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
const gotoForceFumigationTeam= () =>{
  history.push("/warehouse/ForceFumigationTeam");
}
const gotoDegasQC= () =>{
  history.push("/warehouse/FumigationQCTeam");
}

    return ( 

<Fragment>

   
<div style={{Width:"970px",minHeight:"40vh",fontSize:"13px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                <tr> 
                   <th style={{minWidth:"150px"}}>Warehouse Name</th>
                    <th style={{minWidth:"150px"}}>Storage Location</th>
                    <th style={{minWidth:"150px"}}>Lot No</th>
                    <th style={{minWidth:"150px"}}>Wheat Variety</th>
                    <th style={{minWidth:"150px"}}>Stock in MTS</th>
                    <th style={{minWidth:"150px"}}>Bag</th>
                    <th style={{minWidth:"150px"}}>Last Fumigation On</th>
                    <th style={{minWidth:"150px"}}>Last Degassed On</th>
                    <th style={{minWidth:"150px"}}>Next Due Date</th>

                    <th style={{minWidth:"150px"}}>Lead Days</th>
                    <th style={{minWidth:"150px"}}>Fumigation Status</th>
                  
                    <th style={{minWidth:"150px"}}>Reason for Deviation</th> 
                    <th style={{minWidth:"150px"}}>Action</th> 
                   
                    
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
             
            {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                        <tr key={index}>
                            <td>{row.WH_NAME}</td>
                          <td>{row.PLANT_NAME}</td>
                          <td>{row.lotno}</td>
                          <td>{row.WheatVariety}</td>
                          <td>{row.wheatqty}</td>
                         
                          <td>{row.BAG_NAME}</td>
                          <td>{row.LastFumigatnDt}</td>
                          <td>{row.LastDegasDt}</td>
                         
                          <td> {row.NextFumigatnDt}</td>
                      <td>{row.FumigationLapsed}</td>
                      <td>{row.FumigationStatusName}</td>
                    
                         
                         
                          
                          
                         <td> <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}} placeholder={" "}  
                   onChange={(e) => onTextChange(e,row.FumigationId,form.values.CheckList,"ReasonforDeviation",index)} 
                    form={form} id={`ReasonforDeviation_${index}`} 
                    type="text" value={row.ReasonforDeviation}   /></td> 
                        
                     
                    <td>
                          <Button.Ripple color="primary" type="Button" onClick={(e) => {ActionEntry(row.sub_lot_id,row.ReasonforDeviation,1);}}>Force Fumigate</Button.Ripple>
                            </td> 


                             </tr>
                        ))}  

            </tbody>
        </table>  
        </div>
        <div className="d-flex justify-content-center mt-1">
          <div className="p-1 ">
   </div>
         </div>
        </Fragment>
    )
} 
const ForceFumigationTeamData = () => { 
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
       <ForceFumigationTeam form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default ForceFumigationTeamData 
