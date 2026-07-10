import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import Uploader from "../Uploader";
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
import { check } from 'prettier';
import TableComponent from "../common/TableComponent";

const stockdetails = {
  warehouseid: "",
  locationid: "", 
  lotno: "",
  lotid: "",
  wheatvarietyid: "",
  Wheat_Variety_Id: "",
  Company: "",
  QtyinMTS: "",
  wh_name: "", 
  wh_code: "",
  plantid: "", 
  totalcapacity: "", 
  Fumigationreleaseqty: "", 
  Fumigationlockqty: "", 
  Degassingreleaseqty: "", 
  Degassinglockqty: "", 
  Pledgeqty: "", 
  Unpledgeqty: "", 
  Rndlockqty: "", 
  Rndreleasedqty: "", 
}

export const taColumns = [
  {
    name: "Lot No",
    selector: "lotno",
    sortable: true,
    minWidth: "120px",
    wrap: false,
  },
  {
    name: "Wheat Variety",
    selector: "WheatVariety",
    minWidth: "250px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Company",
    selector: "company_name",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Qty in MTS",
    selector: "wheatqty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
     name: "Lot Capacity",
    selector: "totalcapacity",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Utilization %",
    selector: "Utilization",
    sortable: true,
    minWidth: "25rem",
    wrap: true,
  },
  {
    name: "Fumigation Release Qty",
    selector: "Fumigationreleaseqty",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Fumigation Lock Qty",
    selector: "Fumigationlockqty",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Degassing Release Qty",
    selector: "Degassingreleaseqty",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "Degassing Lock Qty",
    selector: "Degassinglockqty",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Pledge Qty",
    selector: "Pledgeqty",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Unpledge Qty",
    selector: "Unpledgeqty",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "R&D Locked Qty",
    selector: "Rndlockqty",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "R&D Released Qty",
    selector: "Rndreleasedqty",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
];


const Warehousewisestocksdata = ({form, onSubmit}) => { 
  const[stockdetailsdata, Setstockdetails] = useState({ ...stockdetails});
  const[warehouseoption, setWarehouseoption] = useState([]);
  let { showLoader, hideLoader } = useLoader();
  const[lotoption,setLotoption] = useState([]);
  const[locationoption,setLocationoption] = useState([]);  
  const[stockstatus,setstockstatus] = useState([]);
  const[wheatvarietyidoption,setwheatvarietyidoption] = useState([]); 
  const {warehousename,locationid,wh_code,plantid,lotid,lotno,wheatvarietyid,Wheat_Variety_Id,Company,QtyinMTS,totalcapacity,Fumigationreleaseqty,Fumigationlockqty,Degassingreleaseqty,Degassinglockqty,Pledgeqty,Unpledgeqty,Rndlockqty,Rndreleasedqty} = stockdetailsdata


  const onWarehouseChange = (e) => {
    const {value, label} = e; 

   form.setFieldValue('warehouseid', {  label: label,value: value });
   // FillPlantList(value);
   FillStorageLocationFromWarehouse(value);
   ClearDropdown("WH");
}
const onPlantchange = (e) => {
  const {value,label} = e; 

  form.setFieldValue('locationid', {  label: label,value: value });
  FillLotList(value)
}
const onStorageLocationchange =(e) =>{
  const {value,label} = e; 
  form.setFieldValue('storagelocationid', {  label: label,value: value });
  FillLotList(value);
  ClearDropdown("SL");
}
const FillLotList = (Value) => {
  let fdata ={storagelocationId:Value, screentype: "Warehousewisestocks"} 
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotListFromStorageLocation',fdata) 
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

const FillLotList_old = (plant) => {
  let fdata ={plantid:plant, screentype: "Warehousewisestocks"} 
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
    const onWheatvarietyChange = (e) => {
      const{value, label} = e; 
      form.setFieldValue('KeyWheatVariety', {  label: label,value: value });
}


const OnLotChange = (e) => {
  const {value, label} = e;   
  form.setFieldValue('lotid', {  label: label,value: value });
  FillWheatVarityList(value);
  ClearDropdown("LOT");
}
const FillWheatVarityList = (paramLotId) => {
  let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    setwheatvarietyidoption([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
  };
const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"Warehousewisestocks"}
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

const onTextChange = (e,PKey, CheckList,Val) => {
  console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
}
const ExcelExport = (e)=>{
  // Select rows from table_id
  let table_id="WarehousewiseStockDetails";
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
const onActionClick = () => {

  let Data=form.values.CheckList;
  let Select=0;
  for(let i=0;i<Data.length;i++){
    if(Data[i].Selected==1){
      Select=1;
    }
  }
  if(Select==0){
    errorToast("Select Atleast one Entry");
    return false;
  }
   const postdata = {
    Data,
     ScreenType:'Stockdetails',
    
   }

    console.log(JSON.stringify(postdata))
   showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/stock/sublot", postdata)
     .then((response) => {
     const { data } = response;
     console.log(JSON.stringify(response))
     let UsrId=data.success;
     if(UsrId==-5){
       errorToast("Duplicate Entry");
     }else{
       let RespId=data.success;
       ShowToast("Saved Successfully...");
       form.setValues({});
       //history.push("/warehouse/Warehousewisestocks");
      // window.location.reload();

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
   useEffect(() => {
  
    showWarehousewisestocks();
  
    
  }, []);
const showWarehousewisestocks = (e) => {
  let Data=form.values;
  let fdata = {
  Screen:"WAREHOOUSESTOCK",
  Data
  };
showLoader();
// console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
 apiPostMethod(apiBaseUrl + "warehouse/reports/getsublotlist", fdata)
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
}

const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('storagelocationid','');
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
   
        <Row >
          <Col md="3" sm="12" >
            <CustomDropdownInput  
              url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"}  
              form={form} 
              id={"warehouseid"}
              options ={warehouseoption}   
              onChange = {onWarehouseChange}   
              
            />
            <span id='warehouseid_Error' style={{color: 'red'}} ></span>
          </Col>
          
          <Col md="3" sm="12"> 
            <CustomDropdownInput  
              label={"Storage Location"}  
              form={form} 
              id={"storagelocationid" }
              options ={locationoption}   
              onChange = {onStorageLocationchange}   
              
            />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
           </Col>
          
           {/* <Col md="3" sm="12" style={{display:"none"}}> {/**not in use * /}
           <Label>Plant</Label>
           <Select  
            form={form} id="locationid"
           onChange={onPlantchange} 
           options={locationoption}
           />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
           </Col> */}

           <Col md="3" sm="12">
              <CustomDropdownInput  
                label={"Lot No"}  
                form={form} 
                id={"lotid"}
                options ={lotoption}   
                onChange = {OnLotChange}   
              />
              <span id='lotid_Error' style={{color: 'red'}} ></span>
           </Col>

           <Col md="3" sm="12"> 
              <CustomDropdownInput  
                label={"Wheat Variety"}  
                form={form} 
                id={"wheatvarietyid"} 
                options ={wheatvarietyidoption}   
                onChange = {onWheatvarietyChange}   
                
              />
            <span id='lotid_Error' style={{color: 'red'}} ></span>
           </Col>
           </Row>
          <Row>
            <Col md="3" sm="12"> 
              <Button.Ripple onClick={showWarehousewisestocks}  color="primary"  type="Button">Show</Button.Ripple>
            </Col>
           
            <Col md="3" sm="12">
              {/* <Button.Ripple color="primary" type="Button" onClick={ExcelExport} >Excel Download</Button.Ripple>   */}
            </Col>
          </Row>

          <Row>
            <Col md="12" sm="12" style={{width:"1110px",overflowX:"scroll",fontSize:"12px"}}>
              <TableComponent showDownload columns={taColumns} data={form.values.CheckList}/>  

             {/*
<br></br>
<table class="table-sm" id="WarehousewiseStockDetails" >
<thead class="bg-primary text-white" style={{fontSize:"12px",height:"50px"}}>
<tr>

<>
<th style={{minWidth:"200px",fontWeight:"500"}} >Lot No</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Wheat Variety</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Company</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Qty in MTS</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Lot Capacity</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Utilization %</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Fumigation Release Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Fumigation Lock Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Degassing Release Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Degassing Lock Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Pledge Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >Unpledge Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >R&D Locked Qty</th>
<th style={{minWidth:"200px",fontWeight:"500"}} >R&D Released Qty</th>
</>


               </tr>

               </thead>
<tbody>
{form.values.CheckList && form.values.CheckList.map((row, index) => ( 
               <tr >

<td>{row.lotno}</td>
<td>{row.WheatVariety}</td>
<td>{row.company_name}</td>
<td>{row.wheatqty}</td>
<td>{row.totalcapacity }</td>
<td>{row.Utilization}</td>

<td>{row.Fumigationreleaseqty }</td>
<td>{row.Fumigationlockqty }</td>
<td>{row.Degassingreleaseqty }</td>
<td>{row.Degassinglockqty }</td>
<td>{row.Pledgeqty }</td>
<td>{row.Unpledgeqty }</td>
<td>{row.Rndlockqty }</td>
<td>{row.Rndreleasedqty }</td>

               </tr>
                ))}  
               </tbody>
        </table> 
*/}
        </Col>
      </Row>
    </Fragment>
  )
}


const Warehousewisestocks = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({


     }),
    onSubmit(values) {},
  });
  const onSubmit =() => {

  }
  return (
  <Fragment>
    <CardComponent  header="Warehouse Wise Stock Details">
      <Warehousewisestocksdata form={form}  onSubmit={onSubmit}  />
    </CardComponent>
  </Fragment>
  )
}

export default Warehousewisestocks