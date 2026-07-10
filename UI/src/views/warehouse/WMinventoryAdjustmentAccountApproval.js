import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,InventoryAdjusmentEntrylistUrl } from '../../urlConstants'
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
import InventoryAdjustmentEntrylist from './InventoryAdjustmentEntrylist';


const InventoryAdjustmentApproval = ({form})  => { 
    const[stockEntryformData , setStockEntryfromData] = useState([]);  
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
      if(id){
        onFetchStockentryById();

      }
    }, [id]);
    const onFetchStockentryById = () => {
      let fdata = {
        id:refid,
      };
    showLoader();
    console.log("Request Url :: "+apiBaseUrl + "warehouse/getstockEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/getstockEntrydatabyid", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           Physical_Inventory_Id:data.results[0].Physical_Inventory_Id,
           Posting_Date:data.results[0].Posting_Date,
           lotid:data.results[0].lotid,
           plantid:data.results[0].plantid,
           warehouseid:data.results[0].warehouseid,
           locationid:data.results[0].locationid,
           Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
           MaterialCode:data.results[0].MaterialCode,
           SAP_Qty:data.results[0].SAP_Qty,
           Physical_Qty:data.results[0].Physical_Qty,
           UP_Down_Qty:data.results[0].UP_Down_Qty,
        		   Status:data.results[0].Status,
     	  	    RejectReason:data.results[0].RejectReason,
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
      history.push(`/warehouse/InventoryAdjustmentApproval`);
    };
    
 

 

 
 const addItem = () => {
  let vd = [];
  vd = [...stockEntryformData];
  vd.push({
    Posting_Date:form.values.Posting_Date, 
    lotid: form.values.lotid.value, 
    lotno: form.values.lotid.label, 
    plantname: form.values.plantname,
    plantid: form.values.plantid,
    wh_refid: form.values.wh_refid,
    warehousename: form.values.warehousename,
    wh_code:form.values.wh_code,
    Wheat_Variety_Id: form.values.Wheat_Variety_Id.value,
    WheatVariety: form.values.Wheat_Variety_Id.label,
    MaterialCode: form.values.MaterialCode,
    SAP_Qty: form.values.SAP_Qty,
    Physical_Qty:form.values.Physical_Qty,
    UP_Down_Qty:form.values.UP_Down_Qty,
    Status:form.values.Status,
    RejectReason:form.values.RejectReason,
});
let vd1 = [];
  vd1 = [...stockEntryformData];
  vd1.push({
    Posting_Date:form.values.Posting_Date, 
    lotid: form.values.lotid.value, 
    lotno: form.values.lotid.label, 
    plantid: form.values.plantid,
    warehouseid: form.values.wh_refid,
    locationid:form.values.plantid,
    Wheat_Variety_Id: form.values.Wheat_Variety_Id.value,
    MaterialCode: form.values.MaterialCode,
    SAP_Qty: form.values.SAP_Qty,
    Physical_Qty:form.values.Physical_Qty,
    UP_Down_Qty:form.values.UP_Down_Qty,
    Status:form.values.Status,
    RejectReason:form.values.RejectReason,
    Screentype:"WHEAT MOVEMENT",
  });
  setformDBData(vd1);
  setStockEntryfromData(vd);

 }
   
 const CalcQty = (e)=>{
   let TmpPhysical_Qty=e.target.value;
   let TmpUP_Down_Qty=form.values.SAP_Qty-TmpPhysical_Qty;
   if(isNaN(TmpUP_Down_Qty))
    return;
  form.setValues(
    {...form.values, 
     Physical_Qty: TmpPhysical_Qty,
     UP_Down_Qty:TmpUP_Down_Qty,
    
    });

 }

 const DeleteItem = (Id,Status) => {
    
let Data={
  Id,
  Status
}
 
  let fdata = {
    Data,
   formType:"updateInventoryWMACApprove"
   
  };
   
  showLoader();
    
  apiPostMethod(InventoryAdjusmentEntrylistUrl, fdata)
  .then((response) => {
    if (response.data.success) {
      ShowToast("Successfully updated...");
     // history.push(`/warehouse/KeyloanPledgeloanUpdate`);
     // window.location.reload();
     showInventory();
    
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  }).finally((a) => {
    hideLoader();
  });
 }
 const showInventory = () => {

 
let Data={
  ...form.values
}
 
  let fdata = {
    Data,
   formType:"getInventoryACApproval",
   screentype:"WHEAT MOVEMENT"
  };
  
  
   
    showLoader();
    
      apiPostMethod(InventoryAdjusmentEntrylistUrl, fdata)
      .then((response) => {
        if (response.data.success) {
         // ShowToast("Successfully updated...");
         // history.push(`/warehouse/KeyloanPledgeloanUpdate`);
         // window.location.reload();
         setStockEntryfromData(response.data.results);
         console.log(JSON.stringify(response.data.results));
         console.log(JSON.stringify(stockEntryformData))
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      });
    
  
}
 const updateInventoryAdjustmentApprove = () => {
  if(stockEntryformData.length<=0){
    errorToast("Something went wrong, Please Enter atleast one Entry");
    return false;

  }

  let fdata = {
    stockEntryformData,
   formType:"WMACInventoryAdjustmentApproval",
  };

    showLoader();



      apiPostMethod("/warehouse/InventoryAdjustment/SaveInventoryAdjustment", fdata)
      .then((response) => {
        if (response.data.success) {
          ShowToast("Successfully updated...");
          history.push(`/warehouse/InventoryAdjustmentApproval`);
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      }); 
}

    return ( 
        <Fragment style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"13px"}}>
       
        <Row > 
            <Col md="3" sm="12">  
            <CustomTextInput label={"From Date"} form={form} id="Fromdate" type="date"  />
 
            </Col>
            <Col md="3" sm="12">  
            <CustomTextInput label={"To Date"} form={form} id="Todate" type="date"  />
 
            </Col>  
              <Col md="3" sm="12">
            <div className='p-2'>
             <Button.Ripple color="primary" type="Button" onClick={(e) => showInventory()} >Show</Button.Ripple>  
             </div> 
            </Col>
            </Row>
            <div style={{Width:"970px",minHeight:"40vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{fontSize:"12px",height:"50px",textAlign:"center"}}> 
                <tr> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Unique No.</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Posting Date</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Lot No</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Plant</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Warehouse Name</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Storage Location</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Material Code</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>SAP Qty</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Physical Qty</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Up / Down Qty</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Status</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Overall Duration</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Screen Duration</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Remarks</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Action</th> 
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
             
                      {stockEntryformData &&
                      stockEntryformData.length>0 &&
                        stockEntryformData.map(item => 
                        <tr>
                          
                          <td>{item.Physical_Inventory_Id}</td> 
                          <td>{item.PostDate}</td> 
                          <td>{item.lotno}</td> 
                          <td>{item.PlantName}</td> 
                          <td>{item.warehousename}</td> 
                          <td>{item.STORAGE_LOCATION}</td> 
                          <td>{item.WheatVariety}</td> 
                          <td>{item.MaterialCode}</td> 
                          <td>{item.SAP_Qty}</td> 
                          <td>{item.Physical_Qty}</td> 
                          <td>{item.UP_Down_Qty}</td> 
                          <td>{item.Status}</td> 
                          <td>{item.Duration}</td> 
                          <td>{item.Duration}</td> 
                          <td>{item.RejectReason}</td> 
                          <td>
                            <Button.Ripple color="primary" type="Button" style={{bottomMargin:"5px"}} onClick={(e) => {DeleteItem(item.Physical_Inventory_Id,3);}}>Approve</Button.Ripple>
                            <Button.Ripple color="primary" type="Button" onClick={(e) => {DeleteItem(item.Physical_Inventory_Id, -2);}}>Reject</Button.Ripple>
                            </td>                        </tr>
                        )
                        
                      }

            </tbody>
        </table>  
        </div>
        <div class="d-flex justify-content-center mt-1">
          <div class="p-1 ">
         {/* <Button.Ripple color="primary"  type="Button" onClick={(e) => {updateInventoryAdjustmentApprove(e)}} >
          Submit
                    </Button.Ripple>*/}
          </div>
         </div>
        </Fragment>
    )
} 
const InventoryAdjustmentApprovalData = () => { 
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

      Physical_Inventory_Id:validation.required({ message:"Unique ID should not be empty", isObject:false }),
      Posting_Date: validation.required({  message:"Posting Date should not be empty",isObject: false }),
      lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
      plantid: validation.required({  message:"Plant should not be empty",isObject: false }),
      warehouseid: validation.required({  message:"Warehouse Name should not be empty",isObject: false }),
      locationid: validation.required({  message:"Storage Location should not be empty",isObject: false }),
      Wheat_Variety_Id: validation.required({ message:"Wheat Variety should not be empty", isObject: true }),
      MaterialCode: validation.required({ message:"Material Code should not be empty", isObject: false }),
      SAP_Qty: validation.required({ message:"SAP Quantity should not be empty", isObject: false }),
	  Physical_Qty: validation.required({ message:"Physical Quantity should not be empty", isObject: false }),
	  UP_Down_Qty: validation.required({ message:"UP Down Quantity should not be empty", isObject: false }),
   Status: validation.required({ message:"Status should not be empty", isObject: false }),
	  RejectReason: validation.required({ message:"Reject Reason should not be empty", isObject: false }),

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

      Physical_Inventory_Id:formData.Physical_Inventory_Id.value,
      Posting_Date:formData.Posting_Date,
      lotid:formData.lotid.value,
      plantid:formData.plantid, 
      warehouseid:formData.warehouseid.value,
	  locationid:formData.locationid.value,
      Wheat_Variety_Id:formData.Wheat_Variety_Id,
      MaterialCode:formData.MaterialCode,
	  SAP_Qty:formData.SAP_Qty,
	  Physical_Qty:formData.Physical_Qty,
	  UP_Down_Qty:formData.UP_Down_Qty,
   Status:formData.Status,
	  RejectReason:formData.RejectReason,

    };
    console.log(" Physical stock Entry :: "+JSON.stringify(FrmData));
    const postdata = {
      id:formData.Physical_Inventory_Id,
      Data:FrmData
    }
    console.log("  Physical stock Entry  :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Physical stock Entry  :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "Master", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
            history.push("/warehouse/InventoryAdjustmentApproval");

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
        <CardComponent  header="WH Physical Inventory Adjustment Approval Screen">
       <InventoryAdjustmentApproval   form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default InventoryAdjustmentApprovalData 
