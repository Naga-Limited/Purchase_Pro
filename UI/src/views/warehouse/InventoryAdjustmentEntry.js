
import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
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


const InventoryAdjustmentEntry = ({form})  => { 
    const[stockEntryformData , setStockEntryfromData] = useState([]);  
    const[formDBData , setformDBData] = useState([]);
    const[lotidoption, setlotidoption] = useState([]);                                                                       
	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);
	                                                                     
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='';
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
    console.log("Request Url :: "+apiBaseUrl + "warehouse/xyz/getstockEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/xyz/getstockEntrydatabyid", fdata)
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
      history.push(`/warehouse/InventoryAdjustmentEntry`);
    };
    const handleViewHistory = (data) => {
 
    } 
 
  
 const OnLotChange = (e) => {
   const {value, label} = e; 
   setwheatvarietyidoption([]);
   FillWheatVarityList(value, label);
   //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  } 

 const FillWheatVarityList = (paramLotId, paramLotNo) => {
  let fdata = { lotid: paramLotId, screenType: "INVENTORY" };
  setwheatvarietyidoption([]);
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        setwheatvarietyidoption([{ options: data.results }]);
        console.log(data.results);
        form.setValues({
          ...form.values, lotid: {value:paramLotId, label:paramLotNo},
          plantname: data.results[0].plantname,
          plantid: data.results[0].plantid,
          storagelocationname: data.results[0].storagelocationname,
          storagelocationid: data.results[0].storagelocationid,
          wh_refid: data.results[0].wh_refid,
          warehousename: data.results[0].wh_name,
          wh_code: data.results[0].wh_code,
          SAP_Qty: data.results[0].SAP_Qty,});

          form.setFieldValue("lotid", {value:paramLotId, label:paramLotNo});
          form.setFieldValue("Wheat_Variety_Id", ''); 
          form.setFieldValue("MaterialCode", '');
          form.setFieldValue("SAP_Qty", '');
          form.setFieldValue("Physical_Qty", '');
          form.setFieldValue("UP_Down_Qty", '');
          form.setFieldValue("RejectReason", '');


      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};
const onWheatvarietyChange = (e) => {
  const{value, label} = e; 
 // form.setFieldValue("Wheat_Variety_Id", {value:value, label:label});
  //getMaterialCode(value,label);
  getLotInfo(form.values.lotid.value, value,label);
}

const getMaterialCode = (pWheatVarietyId,label) => {
  let fdata = {  WheatVarietyId: pWheatVarietyId, screenType: "RELOTTING" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getMaterialCode', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        form.setValues({
          ...form.values,
          MaterialCode: data.MatCode[0].SeedVariety})
      }
      form.setFieldValue("Wheat_Variety_Id", {value:pWheatVarietyId, label:label});
      //form.setFieldValue('WheatVariety', {  label: WvLabel,value: pWheatVarietyId });
    })
    .catch((error) => {
      console.log(error);
      //errorToast("Something went wrong, please try again after sometime");
  });
};

const getLotInfo = (paramLotId,pWheatVarietyId, label) => {
  let fdata = { lotid: paramLotId, WheatVarietyId: pWheatVarietyId, screenType: "RELOTTING" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getLotInformation', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        let qty='';
        for(let i=0;i<data.Det.length;i++){
          if(data.Det[i].wheatvarietyid==pWheatVarietyId){
            qty = data.Det[i].wheatqty;
          }
        }
        form.setValues({
          ...form.values,
          SAP_Qty: qty  ,
          Physical_Qty:"",
          UP_Down_Qty:"",
        MaterialCode: data.MatCode[0].SeedVariety})
        }
      form.setFieldValue("Wheat_Variety_Id", {value: pWheatVarietyId, label:label});
    })
    .catch((error) => {
      console.log(error);
      //errorToast("Something went wrong, please try again after sometime");
    });
};
 

  const isFilledAll = () => {
    showError('Posting_Date_Error_Error','Enter Inventory Posting date',0);
    showError('lotid_Error','Select Lot No',0);
    showError('Wheat_Variety_Id_Error','Select Wheat Variety',0);
    showError('MaterialCode_Error','Enter Material Code',0);
    showError('Physical_Qty_Error','Enter Physical Qty',0);

    let ShowError=0;
    let formData=form.values;
  
    //if(!formData.SysDate) { showError('SystmDate_Error','Enter Date',1);  ShowError =1; }
    if(!formData.lotid.value) { showError('lotid_Error','Select Lot No',1);  ShowError =1; }
    if(!formData.Wheat_Variety_Id.value) { showError('Wheat_Variety_Id_Error','Enter Wheat Variety',1);  ShowError =1; }
    // if(!formData.MaterialCode) { showError('MaterialCode_Error','Enter Material Code',1);  ShowError =1; }
    if(!formData.Physical_Qty) { showError('Physical_Qty_Error','Enter Physical Qty',1);  ShowError =1; }
    if(ShowError==1){return true;}
  }

const showError = (Id,Msg,show) => {
  if(document.getElementById(Id)) { 
    document.getElementById(Id).innerHTML="";
  if(show==1){
    console.log("SHOW ERROR:"+Id);
  document.getElementById(Id).innerHTML=Msg;
  }
}
}
  const addItem = () => {

    if(isFilledAll()){
      return false;
    }

    let vd = [];
    vd = [...stockEntryformData];
    
    for(let i=0;i<vd.length;i++){
      if(vd[i].lotid==form.values.lotid.value && vd[i].Wheat_Variety_Id==form.values.Wheat_Variety_Id.value){
        errorToast("Lot No and Wheat Variety Already Added");
        return 0;
      }
    }

    vd.push({
        //moment(selectedValue).format(format));
      // Posting_Date:form.values.Posting_Date,
      Posting_Date:moment(form.values.Posting_Date).format("YYYY-MM-DD"),
      dPosting_Date:moment(form.values.Posting_Date).format("DD-MM-YYYY"),
      lotid: form.values.lotid.value, 
      lotno: form.values.lotid.label, 
      plantname: form.values.plantname,
      plantid: form.values.plantid,
      storagelocationname: form.values.storagelocationname,
      storagelocationid: form.values.storagelocationid,
      wh_refid: form.values.wh_refid,
      warehousename: form.values.warehousename,
      wh_code:form.values.wh_code,
      Wheat_Variety_Id: form.values.Wheat_Variety_Id.value,
      WheatVariety: form.values.Wheat_Variety_Id.label,
      MaterialCode: form.values.MaterialCode,
      SAP_Qty: form.values.SAP_Qty,
      Physical_Qty:form.values.Physical_Qty,
      UP_Down_Qty:form.values.UP_Down_Qty,
      RejectReason:form.values.RejectReason,
    });

    let vd1 = [];
    vd1 = [...formDBData];
    vd1.push({
      Posting_Date:moment(form.values.Posting_Date).format("YYYY-MM-DD"),
      dPosting_Date:moment(form.values.Posting_Date).format("DD-MM-YYYY"),
      lotid: form.values.lotid.value, 
      lotno: form.values.lotid.label, 
      plantid: form.values.plantid,
      locationid:form.values.storagelocationid,
      warehouseid: form.values.wh_refid,
      Wheat_Variety_Id: form.values.Wheat_Variety_Id.value,
      MaterialCode: form.values.MaterialCode,
      SAP_Qty: form.values.SAP_Qty,
      Physical_Qty:form.values.Physical_Qty,
      UP_Down_Qty:form.values.UP_Down_Qty,
      RejectReason:form.values.RejectReason,
      Screentype:"ACCOUNTS",
    });
   
    
    setformDBData(vd1);
    setStockEntryfromData(vd);
    
    form.setValues({    
      Posting_Date:"", 
      lotid: "", 
      lotno: "", 
      plantname: "",
      plantid: "",
      storagelocationid:"",
      wh_refid: "",
      warehousename: "",
      wh_code:"",
      WheatVariety: "",
      MaterialCode: "",
      SAP_Qty: "",
      Physical_Qty:"",
      UP_Down_Qty:"",
      RejectReason:"",
    });
    
    form.setFieldValue('Wheat_Variety_Id','');
    setwheatvarietyidoption([]);
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
  if(isNaN(e.target.value))
  return false;

  if(e.target.value<0) 
  {
    e.target.value=e.target.value*-1;
  }
   let TmpPhysical_Qty=e.target.value;
   let TmpUP_Down_Qty=TmpPhysical_Qty-form.values.SAP_Qty;
   if(isNaN(TmpUP_Down_Qty))
    return;
  form.setValues(
    {...form.values, 
     Physical_Qty: TmpPhysical_Qty,
     UP_Down_Qty:TmpUP_Down_Qty,
    });
 }

  const updateInventoryAdjustmentEntry = () => {
    if(stockEntryformData.length<=0){
      errorToast("Something went wrong, Please Enter atleast one Entry");
      return false;
    }

    let fdata = {
      formDBData,
      formType:"InventoryAdjustEntry",
    };

    showLoader();
    
      apiPostMethod(apiBaseUrl+"warehouse/InventoryAdjustment/SaveInventoryAdjustment", fdata)
      .then((response) => {
        if (response.data.success) {
          ShowToast("Successfully updated...");
          history.push("/warehouse/InventoryAdjustmentEntry");
          setStockEntryfromData([]);
          setformDBData([]);
          //window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      }); 
}

    return ( 
        <Fragment >
        <div style={{Width:"970px",minHeight:"400px",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white' style={{height:"50px",fontSize:"12px",textAlign:"center"}}> 
                <tr> 
                   
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
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Remarks</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Action</th> 
                   
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
                <tr>
                   <td style={{paddingBottom:"19px", verticalAlign:"Top",paddingTop:"5px"}}>
                     <DatePicker form={form} 
                        id="Posting_Date" 
                        type="date" format="YYYY/MM/DD" isDateRange={false} 
                      />
                     <span id='Posting_Date_Error' style={{color: 'red'}} ></span>
                   </td>

                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                      <CustomDropdownInput form={form} id="lotid"
                        url={`${apiBaseUrl}warehouse/master/getWHLotList`} 
                        placeholder={"Select Lot"}
                        options= {lotidoption} onChange={OnLotChange} />
                      <span id='lotid_Error' style={{color: 'red'}} ></span>
                    </td>

                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                     <CustomTextInput type="text" form={form} disabled id="plantname"/>
                     <CustomTextInput type="hidden" form={form} id="plantid"/>
                    </td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                     <CustomTextInput type="text" form={form} disabled id="warehousename"/>
                     <CustomTextInput type="hidden" form={form} id="wh_refid"/>
                     <CustomTextInput type="hidden" form={form} id="wh_code"/>
                   </td>
                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                      <CustomTextInput type="text" form={form} disabled id="storagelocationname" />
                      <CustomTextInput type="hidden" form={form} id="storagelocationid"/>
                   </td>
                   
                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                     <CustomDropdownInput form={form} 
                     id="Wheat_Variety_Id"  
                     options= {Wheat_Variety_Idoption} 
                     placeholder={"Select Variety"}
                     onChange={onWheatvarietyChange} />
                     <span id='Wheat_Variety_Id_Error' style={{color: 'red'}} ></span>
                    </td>

                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                    <CustomTextInput type="text" form={form} disabled id="MaterialCode"/>
                   </td>

                    <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                      <CustomTextInput form={form} disabled id="SAP_Qty" type="text" />
                    </td>
                    
                    <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                      <CustomTextInput  id="Physical_Qty"
                        form={form}  
                        placeholder={"Enter Phy Qty"} 
                        onChange={(e)=>{CalcQty(e);}} 
                        maxLength={10} 
                        type="text" 
                      />
                      <span id='Physical_Qty_Error' style={{color: 'red'}} ></span>
                    </td>

                    <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                      <CustomTextInput form={form} disabled id="UP_Down_Qty" type="text"/>
                    </td> 

                    <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                      <CustomTextInput form={form} id="RejectReason" type="text" placeholder={"Reject Reason"} />
                    </td> 
                   
                   <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                     <Button.Ripple color="primary" type="Button" onClick={addItem}>Add</Button.Ripple>
                   </td>
                    
                    </tr>  
                      {stockEntryformData && stockEntryformData.length>0 &&
                        stockEntryformData.map((item) => 
                        <tr>
                          <td>{item.dPosting_Date}</td> 
                          <td>{item.lotno}</td> 
                          <td>{item.plantname}</td> 
                          <td>{item.warehousename}</td> 
                          <td>{item.storagelocationname}</td> 
                          <td>{item.WheatVariety}</td> 
                          <td>{item.MaterialCode}</td> 
                          <td>{item.SAP_Qty}</td> 
                          <td>{item.Physical_Qty}</td> 
                          <td>{item.UP_Down_Qty}</td> 
                          <td>{item.RejectReason}</td> 
                          <td><Button.Ripple 
                            color="primary" 
                            type="Button" 
                            onClick={(e) => {
                              DeleteItem(item.lotid, item.Wheat_Variety_Id);
                            }}>Delete</Button.Ripple>
                          </td>

                        </tr>
                        
                        )
                      }
            </tbody>
        </table>  
        </div>
       <br></br>
       <br></br>
       
     {/*<InventoryAdjustmentEntrylist
        url={InventoryAdjustmentEntrylist}
        title={""}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "view";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/InventoryAdjustmentEntryData:` + row.divisionid );
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />*/}
      
    <Col sm="12">
      <FormGroup className="d-flex justify-content-end mb-0">
        <Button.Ripple color="primary"  type="Button" onClick={(e) => {updateInventoryAdjustmentEntry(e)}} >
          Submit
        </Button.Ripple>
      </FormGroup>
    </Col>
    </Fragment>
    )
} 
const InventoryAdjustmentEntryData = () => { 
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
				
      //Physical_Inventory_Id:validation.required({ message:"Unique Id should not be empty", isObject:false }),
      Posting_Date: validation.required({  message:"Posting Date should not be empty",isObject: false }),
      lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
      //plantid: validation.required({  message:"Plant should not be empty",isObject: false }),
      //warehouseid: validation.required({  message:"Warehouse Name should not be empty",isObject: false }),
      //locationid: validation.required({  message:"Storage Location should not be empty",isObject: false }),
      //Wheat_Variety_Id: validation.required({ message:"Wheat Variety should not be empty", isObject: true }),
      MaterialCode: validation.required({ message:"Material Code should not be empty", isObject: false }),
      //SAP_Qty: validation.required({ message:"SAP Quantity should not be empty", isObject: false }),
	  Physical_Qty: validation.required({ message:"Physical Quantity should not be empty", isObject: false }),
	  //UP_Down_Qty: validation.required({ message:"UP Down Quantity should not be empty", isObject: false }),
	  //RejectReason: validation.required({ message:"Remarks should not be empty", isObject: false }),
	  
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
		  
            history.push("/warehouse/InventoryAdjustmentEntry");
          
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
        <CardComponent  header="Accounts Physical Inventory Adjustment Entry Screen" style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"13px"}}>
       <InventoryAdjustmentEntry form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default InventoryAdjustmentEntryData
