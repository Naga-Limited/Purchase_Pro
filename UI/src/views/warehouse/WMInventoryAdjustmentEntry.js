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
import { extendWith, isObject, set } from 'lodash';
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
           SAP_Qty:data.results[0].wheatqty,
           Physical_Qty:data.results[0].Physical_Qty,
           UP_Down_Qty:data.results[0].UP_Down_Qty,
           wheatqty:data.results[0].wheatqty,
           //Dijo 06 added the line
           init_lot_qty:data.results[0].init_lot_qty,
           //
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
      history.push("/warehouse/WMInventoryAdjustmentEntry");
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
  setwheatvarietyidoption([]);
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
          storagelocationname: data.results[0].storagelocationname,
          storagelocationid: data.results[0].storagelocationid,
          wh_refid: data.results[0].wh_refid,
          warehousename: data.results[0].wh_name,
          wh_code: data.results[0].wh_code,
          SAP_Qty: data.results[0].wheatqty,
          init_lot_qty: data.results[0].init_lot_qty,
          allowed_diff_in_percent: data.results[0].allowed_diff_in_percent,
          totalcapacity: data.results[0].totalcapacity,
          wheatqty: data.results[0].wheatqty,
          Physical_Qty:"",
          UP_Down_Qty:"",
          }
          );
          form.setFieldValue("lotid", {value:paramLotId, label:paramLotNo});
          form.setFieldValue("Wheat_Variety_Id", ''); 
          form.setFieldValue("MaterialCode", '');
          form.setFieldValue("SAP_Qty", '');
          form.setFieldValue("Physical_Qty", '');
          form.setFieldValue("UP_Down_Qty", '');
          form.setFieldValue("Remarks", '');
          form.setFieldValue("init_lot_qty", '');

      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};
  const onWheatvarietyChange = (e) => {
    const{value, label} = e; 

    //Dijo 03 uncommmented
    form.setFieldValue("Wheat_Variety_Id", {value:value, label:label});
    // getMaterialCode(value,label); 
    //End

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
          Physical_Qty:"",
          UP_Down_Qty:"",
          MaterialCode: data.MatCode[0].SeedVariety})
      }
      form.setFieldValue("Wheat_Variety_Id", {value:pWheatVarietyId, label:label});
      
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
        let qty1='';
        for(let i=0;i<data.Det.length;i++){
          if(data.Det[i].wheatvarietyid == pWheatVarietyId){
            qty = data.Det[i].wheatqty;
            qty1 = data.Det[i].init_lot_qty;

          }
        }
        form.setValues({
          ...form.values,
          SAP_Qty: qty, Physical_Qty:"", UP_Down_Qty:"",
          init_lot_qty: qty1, 
          wheatqty: qty,
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
showError('Remarks_Error','Enter Remarks',0);



  let ShowError=0;
  let formData=form.values;
  
  //if(!formData.SysDate) { showError('SystmDate_Error','Enter Date',1);  ShowError =1; }
if(!formData.lotid.value) { showError('lotid_Error','Select Lot No',1);  ShowError =1; }
if(!formData.Wheat_Variety_Id.value) { showError('Wheat_Variety_Id_Error','Enter Wheat Variety',1);  ShowError =1; }
if(!formData.MaterialCode) { showError('MaterialCode_Error','Enter Material Code',1);  ShowError =1; }
if(!formData.Physical_Qty) { showError('Physical_Qty_Error','Enter Physical Qty',1);  ShowError =1; }
if(parseFloat(formData.Physical_Qty)>parseFloat(formData.allowed_diff_qty)) { showError('Physical_Qty_Error','Physical Qty beyond Approval Limit',1);  ShowError =1; }
if(!formData.Remarks) { showError('Remarks_Error','Enter Remarks',1);  ShowError =1; }
if(parseFloat(formData.Physical_Qty)<0) { showError('Physical_Qty_Error','Physical Qty Should be > 0 ',1);  ShowError =1; }
if(parseFloat(formData.UP_Down_Qty)<0) { showError('UP_Down_Qty_Error','UP Down Qty Should be > 0 ',1);  ShowError =1; }


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

    //const postingDate = moment(form.values.Posting_Date).format("DD-MM-YYYY");
    vd.push({
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
      init_lot_qty:form.values.init_lot_qty,
      Diff_In_Percent:form.values.Diff_In_Percent,
      Remarks:form.values.Remarks,
    });

    let vd1 = [];
    vd1 = [...formDBData];
    vd1.push({
      //Posting_Date:moment(form.values.Posting_Date).format("DD-MM-YYYY"),
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
      //Dijo 04 changed Initial_Lot_Qty to init_lot_qty  on  Col 5
      init_lot_qty:form.values.init_lot_qty,
      Diff_In_Percent:form.values.Diff_In_Percent,
      RejectReason:form.values.Remarks,
      Screentype:"WHEAT MOVEMENT",
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
      Wheat_Variety_Id: "",
      WheatVariety: "",
      MaterialCode: "",
      SAP_Qty: "0",
      Physical_Qty:"0",
      UP_Down_Qty:"0",
      RejectReason:"",
      Diff_In_Percent:"0",
      init_lot_qty:"0",
      allowed_diff_qty:"0",
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

    console.log("SAP QTY :: ", form.values.SAP_Qty, " ", form.values.init_lot_qty, " ", form.values.totalcapacity);

    if(isNaN(e.target.value))
    {
      return false;
    }
    // let TmpPhysical_Qty = "";
    // let TmpUP_Down_Qty ="";
    // let Diff = "";
    if(e.target.value < 0)
    {
      e.target.value = e.target.value * -1;
    }

    let TmpPhysical_Qty = e.target.value;
    let TmpUP_Down_Qty = TmpPhysical_Qty- form.values.SAP_Qty;
    let Diff = TmpPhysical_Qty-form.values.init_lot_qty;

     let allowed_diff_qty=0;
      if((parseFloat(form.values.init_lot_qty)) > 0 && (parseFloat(form.values.init_lot_qty)) < (parseFloat(form.values.totalcapacity))){
        //allowed_diff_qty = parseFloat(form.values.wheatqty)+parseFloat(form.values.init_lot_qty*form.values.allowed_diff_in_percent/100);
        //Dijo 01 changed init_lot_qty to wheatqty
        allowed_diff_qty = parseFloat(form.values.wheatqty)+parseFloat(form.values.init_lot_qty*form.values.allowed_diff_in_percent/100);
      }else{
        //allowed_diff_qty = parseFloat(form.values.wheatqty)+parseFloat(form.values.totalcapacity*form.values.allowed_diff_in_percent/100);
        //Dijo 02 changed totalcapacity to wheatqty
        allowed_diff_qty = parseFloat(form.values.wheatqty)+parseFloat(form.values.totalcapacity*form.values.allowed_diff_in_percent/100);
      }
    //let Diff_In_Percent=(Diff/form.values.wheatqty*100).toFixed(2);
    let Diff_In_Percent=(Diff/form.values.init_lot_qty*100).toFixed(2);

    if(isNaN(TmpUP_Down_Qty))
      return;
        form.setValues(
          {...form.values, 
          Physical_Qty: TmpPhysical_Qty,
          UP_Down_Qty:TmpUP_Down_Qty,
          Diff_In_Percent:Diff_In_Percent,
          allowed_diff_qty:allowed_diff_qty
          });
  }

 const updateInventoryAdjustmentEntry = () => {
  if(stockEntryformData.length<=0){
    errorToast("Something went wrong, Please Enter atleast one Entry");
    return false;

  }
  let fdata = {
    formDBData,
    formType:"WMInventoryAdjustEntry",
  };
  
    showLoader();
      apiPostMethod(apiBaseUrl+"warehouse/InventoryAdjustment/SaveInventoryAdjustment", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success){
          ShowToast("Successfully updated...");
          history.push(`/warehouse/WMInventoryAdjustmentEntry`);
          setStockEntryfromData([]);
          setformDBData([]);
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
        <div style={{Width:"970px",height:"400px",fontSize:"13px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                <tr> 
                    <th style={{minWidth:"200px",fontWeight:"400",align:"Left"}}>Posting Date</th>
                    <th style={{minWidth:"200px",fontWeight:"400",align:"Left"}}>Lot No</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Plant</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Warehouse Name</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Storage Location</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Wheat Variety</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Material Code</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>SAP Qty(in KG)</th> 
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Physical Qty</th> 
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Up Qty</th>
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Initial Qty</th>
                    {/*<th style={{minWidth:"200px",fontWeight:"400"}}>Diff %</th>*/}
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Remarks</th> 
                    <th style={{minWidth:"200px",fontWeight:"400"}}>Action</th> 
                   
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
              <tr>
                <td style={{paddingBottom:"19px", verticalAlign:"Top",paddingTop:"5px"}}>
                  <DatePicker form={form} id="Posting_Date" type="date" format="YYYY/MM/DD" isDateRange={false} />
                  <span id='Posting_Date_Error' style={{color: 'red'}} ></span>
                </td>
                
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <CustomDropdownInput form={form} id="lotid" url={`${apiBaseUrl}warehouse/master/getWHLotList`} options= {lotidoption} onChange={(e)=>OnLotChange(e)} />
                  <span id='lotid_Error' style={{color: 'red'}} ></span>
                </td>
                
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <CustomTextInput type="text" disabled form={form} id="plantname"/>
                  <CustomTextInput type="hidden" form={form} id="plantid"/>
                </td>
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <CustomTextInput type="text" disabled form={form} id="warehousename"/>
                  <CustomTextInput type="hidden" form={form} id="wh_refid"/>
                  <CustomTextInput type="hidden" form={form} id="wh_code"/>
                </td>
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>{/*form.values.plantname*/}
                  <CustomTextInput type="text" disabled form={form} id="storagelocationname"/>
                  <CustomTextInput type="hidden" form={form} id="storagelocationid"/>
                </td>
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <CustomDropdownInput form={form} id="Wheat_Variety_Id"  
                  options= {Wheat_Variety_Idoption} onChange={(e)=>onWheatvarietyChange(e)} />
                  <span id='Wheat_Variety_Id_Error' style={{color: 'red'}} ></span>
                </td>
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <CustomTextInput type="text" form={form} id="MaterialCode" disabled/>
                  <span id='MaterialCode_Error' style={{color: 'red'}} ></span> 
                </td>
                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                  <CustomTextInput form={form} disabled id="SAP_Qty" type="text" />
                  <CustomTextInput form={form} disabled id="wheatqty" type="hidden" />
                </td>

                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                  <CustomTextInput form={form} id="Physical_Qty" isNumberOnly maxLength={10} 
                  onChange={(e)=>CalcQty(e)} type="text" />
                  <span id='Physical_Qty_Error' style={{color: 'red'}} ></span>
                </td>

                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                  <CustomTextInput form={form} disabled id="UP_Down_Qty" type="text" />
                  <span id='UP_Down_Qty_Error' style={{color: 'red'}} ></span>
                </td> 

                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                <CustomTextInput form={form} disabled id="init_lot_qty" type="text" />
                <CustomTextInput form={form} disabled id="Diff_In_Percent" type="hidden" />
                <CustomTextInput form={form} id="allowed_diff_in_percent" type="hidden"  />
                <CustomTextInput form={form} id="diff_compare_qty" type="hidden" />
                <CustomTextInput form={form} id="allowed_diff_qty" type="hidden" />
                <CustomTextInput form={form} id="totalcapacity" type="hidden" />
                </td> 

                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}> 
                  <CustomTextInput form={form} id="Remarks" type="text" />
                  <span id='Remarks_Error' style={{color: 'red'}} ></span>
                </td> 

                <td style={{paddingBottom:"19px", verticalAlign:"Top", paddingTop:"23px"}}>
                  <Button.Ripple color="primary" type="Button" onClick={addItem}>Add</Button.Ripple>
                </td>
              </tr>  
                      
              {stockEntryformData && stockEntryformData.length>0 &&
                stockEntryformData.map((item, index) => 
                  <tr key={index}>
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
                    <td>{item.init_lot_qty}</td> 
                    {/*<td>{item.Diff_In_Percent}</td> */}
                    <td>{item.Remarks}</td> 
                    <td><Button.Ripple color="primary" type="Button" onClick={(e) => {DeleteItem(item.lotid, item.Wheat_Variety_Id);}}>Delete</Button.Ripple></td>
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
                history.push(`/warehouse/WMInventoryAdjustmentEntryData:` + row.divisionid );
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


const WMInventoryAdjustmentEntryData = () => { 
  const history = useHistory();
  const {showLoader , hideLoader} = useLoader(); 
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (data) => {
    return moment(data).format(dateFormat) == today;
  };
  const form = useFormik({
    initialErrors: false,
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
    //Dijo 05 added this line
    init_lot_qty:formData.init_lot_qty,
    //
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
        <CardComponent  header="WM Inventory Adjustment Entry" style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"13px"}}>
       <InventoryAdjustmentEntry form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}
export default WMInventoryAdjustmentEntryData;
