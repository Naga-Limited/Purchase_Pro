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
import TableComponent from "../common/TableComponent";
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


  //Added by MS.Karthick on 06-06-2022
  
export const taColumns = [
  {
    name: "VA No",
    selector: "va_no",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Delivery No",
    selector: "delivery_no",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Delivery Date",
    selector: "deliveryDt",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Delivery Qty",
    selector: "delivery_qty",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Bag Type",
    selector: "BAG_NAME",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "No of Bags",
    selector: "no_of_bags",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Sending Plant",
    selector: "SendingPlantName",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Sending Storage Location",
    selector: "SendingStoragePlantName",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Receiving Plant",
    selector: "ReceivingPlantName",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Receviving Storage Location",
    selector: "ReceivingStoragePlantName",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Wheat Variety",
    selector: "wheat_variety",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Bag Cutting Vendor",
    selector: "Name",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Bag Cutting Charges",
    selector: "bag_cutting_charges",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Tolerance %",
    selector: "tollerancepercent",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "WM Remarks",
    selector: "wm_remarks",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "WM Approval Date",
    selector: "WMAppDt",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Ac Remarks",
    selector: "ACRemarks",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "AC Approval Date",
    selector: "ACAppDt",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Status",
    selector: "approvestatusName",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
];


const Bagcuttingreport = ({form})  => { 
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
     
        onFetchbagcuttingentryById();

     
    }, [id]);
    const onFetchbagcuttingentryById = () => {
      let Data=form.values;
      let fdata = {
      Screen:"REPORT",
      Data
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
    
//  Dijo 01
const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('storagelocationid', '');
  }
}
//  End

    const onStorageLocationchange =(e) =>{
      const {value,label} = e; 
      form.setFieldValue('storagelocationid', {  label: label,value: value });
     // FillLotList(value)
    }

 
    const onTextChange = (e,PKey, CheckList,Val) => {

      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].bagcuttingid==PKey){
            if(Val=="ACRemarks"){
              CheckList[i].ACRemarks=e.target.value;
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

 
 
const ActionEntry = (BagCuttingId,Remarks,Status) => {
     

  let Data={approvestatus:Status,ACRemarks:Remarks}
  const postdata = {
    id:BagCuttingId,
    ScreenType:'BAGCUTTINGCONFIRMATION',
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

const ExcelExport = (e)=>{
  // Select rows from table_id
  let table_id="TableID";
  let separator = ','
  var rows = document.querySelectorAll('table#' + table_id + ' tr');
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll('td, th');
      for (var j = 0; j < cols.length; j++) {
          // Clean innertext to remove multiple spaces and jumpline (break csv)
          var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
          // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
          data = data.replace(/"/g, '""');
          // Push escaped string
          row.push('"' + data + '"');
      }
      csv.push(row.join(separator));
  }
  var csv_string = csv.join('\n');
  // Download it
  var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
  var link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
const onWarehouseChange = (e) => {
  const {value, label} = e; 
 // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
 form.setFieldValue('warehouseid', {  label: label,value: value });
  //FillPlantList(value);
  FillStorageLocationFromWarehouse(value);
  ClearDropdown("WH");
}
const FillStorageLocationFromWarehouse = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"Warehousewisestocks"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHstoragelocationList',fdata)
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
 

}

    return ( 

<Fragment>
<Row>
           <Col md="3" sm="12">
             <CustomTextInput label={"From Date"} form={form} id="FromDate" type="date"  />
             </Col>
             <Col md="3" sm="12">
             <CustomTextInput label={"To Date"} form={form} id="ToDate" type="date"  />
             </Col>
             <Col md="3" sm="12" >
           
           <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id={"warehouseid"} 
           onChange = {onWarehouseChange}   
           options ={warehouseoption}   
           
          
           />
          <span id='warehouseid_Error' style={{color: 'red'}} ></span>

           </Col>
           <Col md="3" sm="12"> 
           {/* <Label>Storage Location</Label>
           <Select  
            form={form} id="storagelocationid"
            onChange={onStorageLocationchange} 
           options={locationoption}        
           /> */}
           <CustomDropdownInput 
          //  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Storage Location"} 
           form={form}    
           id={"storagelocationid"} 
           onChange={onStorageLocationchange} 
          options={locationoption}
           /> 
           
            <span id='storagelocationid_Error' style={{color: 'red'}} ></span>

           </Col>
           {/* <Col md="3" sm="12" style={{display:"none"}}> {/* plant not in use 
           <Label>Storage Location</Label>
           <Select  
            form={form} id="locationid"
           onChange={onPlantchange} 
           options={locationoption}
        

           />
           
            <span id='locationid_Error' style={{color: 'red'}} ></span>

           </Col> */}
            </Row>

            <Col sm="12">
            <FormGroup className="d-flex justify-content-end mb-0">
         <Button.Ripple color="primary"  type="Button" onClick={onFetchbagcuttingentryById} >Search</Button.Ripple>
         &nbsp;&nbsp;&nbsp;
        {/* <Button.Ripple color="primary" type="Button" onClick={ExcelExport} >Excel Export</Button.Ripple>   */}
        </FormGroup>
        </Col>
        <br></br><br></br>  
        <Row>   
        <Col md="12" sm="12">
{/*<div style={{Width:"970px",minHeight:"40vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm' id="TableID"> 
            <thead className='bg-primary text-white ' style={{height:"50px",fontSize:"12px",textAlign:"center"}}> 
                <tr> 
                   <th style={{minWidth:"150px",fontWeight:"500"}}>VA No</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Delivery No</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Delivery Date</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Delivery Qty</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Bag Type</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>No of Bags</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Sending Plant </th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Sending Stroage Location</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Receiving Plant </th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Receiving Stroage Location</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Bag Cuttiing Vendor</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Bag Cutting Charges</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Tolerance %</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>WM Remarks </th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>WM Approval Date & Time</th> 
                    
                    <th style={{minWidth:"150px",fontWeight:"500"}}>AC Remarks</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>AC Approval Date & Time</th> 
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Status</th> 
                    
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
                          <td>{row.no_of_bags}</td>
                          <td>{row.SendingPlantName}</td>
                          <td>{row.SendingStoragePlantName}</td>
                          <td>{row.ReceivingPlantName}</td>
                          <td>{row.ReceivingStoragePlantName}</td>
                          <td>{row.wheat_variety}</td>
                          <td>{row.Name}</td>
                          <td>{row.bag_cutting_charges}</td>
                          <td>{row.tollerancepercent}</td>

                          <td>{row.wm_remarks}</td>
                          <td>{row.WMAppDt}</td>
                         
                          <td> {row.ACRemarks} </td>  
                          <td>{row.ACAppDt}</td>
                          <td>{row.approvestatusName}</td>
                             </tr>
                        ))}  

            </tbody>
        </table>  
        </div>
        <div class="d-flex justify-content-center mt-1">
          <div class="p-1 ">
   </div>
            </div>*/}
            <TableComponent showDownload columns={taColumns} data={form.values.CheckList} />
            </Col>
            </Row>
        </Fragment>
    )
} 
const BagcuttingaReportData = () => { 
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
        <CardComponent  header="Warehouse Bag Cutting Report Screen">
       <Bagcuttingreport form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default BagcuttingaReportData 
