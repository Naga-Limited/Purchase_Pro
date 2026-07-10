
import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,WMInventoryAdjusmentEntrylistUrl } from '../../urlConstants'
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
import WMInventoryAdjustmentEntrylist from './WMInventoryAdjustmentEntrylist';


const WMInventoryAdjustmentEntry = ({form})  => { 
    const[stockEntryformData , setStockEntryfromData] = useState([]);  
const[formDBData , setformDBData] = useState([]);
    const[lotidoption, setlotidoption] = useState([]);                                                                       
"	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);"

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
           Initial_Lot_Qty:data.results[0].Initial_Lot_Qty,
           Diff_In_Percent:data.results[0].Diff_In_Percent,
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
      history.push(`/warehouse/WMInventoryAdjustmentEntry`);
    };
    const handleViewHistory = (data) => {
 
    } 
 

 const OnLotChange = (e) => {
   const {value, label} = e; 

   FillWheatVarityList(value, label);
   //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
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
    locationid:form.values.locationid,
    Wheat_Variety_Id: form.values.Wheat_Variety_Id.value,
    WheatVariety: form.values.Wheat_Variety_Id.label,
    MaterialCode: form.values.MaterialCode,
    SAP_Qty: form.values.SAP_Qty,
    Physical_Qty:form.values.Physical_Qty,
    UP_Down_Qty:form.values.UP_Down_Qty,
    Initial_Lot_Qty:form.values.Initial_Lot_Qty,
    Diff_In_Percent:form.values.Diff_In_Percent,

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
    Screentype:"ACCOUNTS",
  });
  setformDBData(vd1);
  setStockEntryfromData(vd);

 }
 const DeleteItem = (lotid, Wheat_Variety_Id) => {
  let vdata = [...stockEntryformData];
  let vdata1 = [...formDBData];
  let index=-1;
  for(let i=0;i<vdata.length;i++)
  {
    if(vdata[i].lotid == lotid && vdata[i].Wheat_Variety_Id == Wheat_Variety_Id)
    {
      index=i;
      break;
    }
  }
  if(index>-1)
  {
  vdata.splice(index, 1);
  vdata1.splice(index, 1);
  setStockEntryfromData(vdata);
  setformDBData(vdata1);
  }
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

 const updateWMInventoryAdjustmentEntry = () => {
  if(stockEntryformData.length<=0){
    errorToast("Something went wrong, Please Enter atleast one Entry");
    return false;

  }

  let fdata = {
    stockEntryformData,
   formType:"WMInventoryAdjustEntry",
  };

    showLoader();



      apiPostMethod("/warehouse/WMInventoryAdjustment/SaveWMInventoryAdjustment", fdata)
      .then((response) => {
        if (response.data.success) {
          ShowToast("Successfully updated...");
          history.push(`/warehouse/WMInventoryAdjustmentEntry`);
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
        <Fragment style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}}>
        <div style={{minWidth:"98vw",minHeight:"40vh",fontSize:"13px"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{height:"50px",fontSize:"12px",textAlign:"center"}}> 
                <tr> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Unique ID</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Posting Date</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Lot No</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Plant</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Warehouse Name</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Storage Location</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Material Code</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>SAP Qty</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Physical Qty</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Up / Down Qty</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Initial Lot Qty</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Diff%</th>

                    <th style={{minWidth:"150px",fontWeight:"500"}}>Remarks</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Action</th> 
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
                <tr>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>  <CustomTextInput type="text" form={form} id="Physical_Inventory_Id"/></td>  
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}><CustomTextInput form={form} id="Posting_Date" type="date"  /></td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}><CustomDropdownInput form={form} id="lotid" url={`${apiBaseUrl}warehouse/master/getWHLotList`} options= {lotidoption} onChange={OnLotChange} /></td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>
                     <CustomTextInput type="text" form={form} id="plantname"/>
                     <CustomTextInput type="hidden" form={form} id="plantid"/>
                    </td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>
                     <CustomTextInput type="text" form={form} id="warehousename"/>
                     <CustomTextInput type="hidden" form={form} id="wh_refid"/>
                     <CustomTextInput type="hidden" form={form} id="wh_code"/>
                   </td>
<td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} disabled id="locationid" type="text" /></td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>{form.values.plantname}</td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>
                     <Select form={form} id="Wheat_Variety_Id"  options= {Wheat_Variety_Idoption} onChange={onWheatvarietyChange} />
                     </td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>
                    <CustomTextInput type="text" form={form} id="MaterialCode"/>
                   </td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} disabled id="SAP_Qty" type="text" /></td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} id="Physical_Qty" onChange={(e)=>{CalcQty(e);}} type="text" /></td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} disabled id="UP_Down_Qty" type="text" /></td> 
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} disabled id="Initial_Lot_Qty" type="text" /></td> 
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} disabled id="Diff_In_Percent" type="text" /></td> 



                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}> <CustomTextInput form={form} id="RejectReason" type="text" /></td> 
                  <div className='d-flex justify-content-center'> 
                   <td style={{paddingBottom:"19px", verticalAlign:"Bottom"}}>
                     <Button.Ripple color="primary"  type="Button" onClick={addItem}>Add</Button.Ripple>
                   </td>
                   </div>
                    </tr>  
                      {stockEntryformData &&
                      stockEntryformData.length>0 &&
                        stockEntryformData.map(item => 
                        <tr>
                          <td></td> 
                          <td>{item.Posting_Date}</td> 
                          <td>{item.lotno}</td> 
                          <td>{item.plantid}</td> 
                          <td>{item.warehouseid}</td> 
                          <td>{item.locationid}</td> 
                          <td>{item.Wheat_Variety_Id}</td> 
                          <td>{item.MaterialCode}</td> 
                          <td>{item.SAP_Qty}</td> 
                          <td>{item.Physical_Qty}</td> 
                          <td>{item.UP_Down_Qty}</td> 
                          <td>{item.Initial_Lot_Qty}</td> 
                          <td>{item.Diff_In_Percent}</td> 

                          <td>{item.RejectReason}</td> 
                          <td><Button.Ripple color="primary" type="Button" onClick={(e) => {DeleteItem(item.lotid, item.Wheat_Variety_Id);}}>Delete</Button.Ripple></td>
                        </tr>
                        )
                        
                      }

            </tbody>
        </table>  
        </div>
        <div class="d-flex justify-content-center mt-1">
          <div class="p-1 ">
          <Button.Ripple color="primary"  type="Button" onClick={(e) => {updateWMInventoryAdjustmentEntry(e)}} >
          Submit
          </Button.Ripple>
          </div>
         </div>
        </Fragment>
    )
} 
const WMInventoryAdjustmentEntryData = () => { 
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

      Physical_Inventory_Id:validation.required({ message:"Unique Id should not be empty", isObject:false }),
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
 Initial_Lot_Qty: validation.required({ message:"Initial lot qty should not be empty", isObject: false }),
 Diff_In_Percent: validation.required({ message:"Diff in percent should not be empty", isObject: false }),

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
Initial_Lot_Qty:formDatInitial_Lot_Qty,
Diff_In_Percent:formData.Diff_In_Percent,

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
"		  "
            history.push("/warehouse/WMInventoryAdjustmentEntry");

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
        <CardComponent  header="Wheat Movement Physical Inventory Adjustment Entry Screen">
       <WMInventoryAdjustmentEntry   form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default WMInventoryAdjustmentEntryData
