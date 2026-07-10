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
  plantId: "", 
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
    name: "WAREHOUSE CODE",
    selector: "WAREHOUSE_CODE",
    sortable: true,
    minWidth: "120px",
    wrap: false,
  },
  {
    name: "WAREHOUSE NAME",
    selector: "WAREHOUSE_NAME",
    minWidth: "250px",
    wrap: true,
    sortable: true,
  },
  {
    name: "PLANT",
    selector: "PLANT",
    sortable: true,
    minWidth: "120px",
    wrap: true,
  },
  {
    name: "STOAGE LOCATION",
    selector: "STOAGE_LOCATION",
    sortable: true,
    minWidth: "120px",
    wrap: true,
  },
  {
     name: "LOT",
    selector: "LOT",
    sortable: true,
    minWidth: "120px",
    wrap: true,
  },
  {
    name: "MATERIAL",
    selector: "MATERIAL",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "SEGMENT",
    selector: "SEGMENT",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "STOCK",
    selector: "STOCK",
    sortable: true,
    minWidth: "100px",
    wrap: true,
  },
  {
    name: "WHEAT VARIETY",
    selector: "WHEAT_VARIETY",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "MAXIMUM CAPACITY",
    selector: "MAXIMUM_CAPACITY",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "TOTAL CAPACITY",
    selector: "TOTAL_CAPACITY",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "LOT OVERALL STOCK",
    selector: "LOT_OVERALL_STOCK",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "LOT FREE SPACE",
    selector: "LOT_FREE_SPACE",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "LOTWISE WHEAT UTILIZATION",
    selector: "LOTWISE_WHEAT_UTILIZATION",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "LOTWISE OVERALL UTILIZATION",
    selector: "LOTWISE_OVERALL_UTILIZATION",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "LOTWISE OVERALL UNUTILIZATION",
    selector: "LOTWISE_OVERALL_UNUTILIZATION",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
];


  const Warehousewisestocksdata = ({form, onSubmit}) => { 
  const[stockdetailsdata, Setstockdetails] = useState({ ...stockdetails});
  const[warehouseoption, setWarehouseoption] = useState([]);
  let { showLoader, hideLoader } = useLoader();
  const[lotoption,setLotoption] = useState([]);
  const[plantoption,setPlantoption] = useState([]);
  const[locationoption,setLocationoption] = useState([]);  
  const[stockstatus,setstockstatus] = useState([]);
  const[wheatvarietyidoption,setwheatvarietyidoption] = useState([]); 
  const {warehousename,locationid,wh_code,plantId,lotid,lotno,wheatvarietyid,Wheat_Variety_Id,Company,QtyinMTS,totalcapacity,Fumigationreleaseqty,Fumigationlockqty,Degassingreleaseqty,Degassinglockqty,Pledgeqty,Unpledgeqty,Rndlockqty,Rndreleasedqty} = stockdetailsdata
  const [counter, setCounter] = useState(0);



  const onWarehouseChange = (e) => {
    const {value, label} = e; 
   form.setFieldValue('warehouseid', {  label: label,value: value });
   FillPlantList(value);
   ClearDropdown("WH");
   ClearDropdown("LOCATION");
   ClearDropdown("SL");
}
const onPlantchange = (e) => {
  const {value,label} = e; 
  form.setFieldValue('plantId', {  label: label,value: value });
  FillStorageLocationFromWarehouse(value);
  FillLotList(value);
  ClearDropdown("LOCATION");
  ClearDropdown("SL");
}
const onStorageLocationchange =(e) =>{
  const {value,label} = e; 
  form.setFieldValue('storagelocationid', {  label: label,value: value });
  FillLotList(value);
  ClearDropdown("SL");
}
const FillLotList = (value) => {
  let fdata ={LocationId:value, screentype: "Warehousewisestocks"} 
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotBasedSL',fdata) 
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

const OnLotChange = (e) => {
  const {value, label} = e;   
  form.setFieldValue('lotid', {  label: label,value: value });
  ClearDropdown("LOT");
}
const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"Warehousewisestocks"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {
      setPlantoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  });
};
const FillStorageLocationFromWarehouse = (plantId) => {
  console.log(plantId);
  console.log('ssss');
  let fdata = {plantId:plantId, screentype:"Warehousewisestocks"}
  //alert(fdata);
  console.log('aaa');
  console.log(fdata);
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHstoragelocationBasedPlant',fdata)
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
  //  useEffect(() => {
  
  //   showWarehousewisestocks();
  
    
  // }, []);
const showWarehousewisestocks = (e) => {
  setCounter(counter +1);

  let Data=form.values;
  let fdata = {
  Screen:"WAREHOOUSESTOCK",
  Data
  };
  // if(counter==1)
  // {
  //   alert("Please Select Warehouse Name");
  // }if(counter==2)
  // {
  //   alert("One Time sonna Puriyatha");
  // }if(counter==3)
  // {
  //   alert("O****th Evalo Time Sollurathu");
  // }
showLoader();
 apiPostMethod(apiBaseUrl + "warehouse/reports/getWhReport", fdata)
 .then((response) => {
   const { data } = response;
  //  if (data.success) {

     form.setValues({
      
      ...form.values,
    CheckList:response.data,
     })
     
  //  }
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
    form.setFieldValue('plantId', '');
    // form.setFieldValue('storagelocationid','');
    // form.setFieldValue('lotid', '');
  }else if (Item === "SL"){
    form.setFieldValue('lotid', '');
  }else if (Item === "LOCATION"){
    form.setFieldValue('storagelocationid', '');
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
          
          label={"Plant"}
            form={form}
             id={"plantId"}
           onChange={onPlantchange} 
           options={plantoption}
           />
            <span id='locationid_Error' style={{color: 'red'}} ></span>
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

           {/* <Col md="3" sm="12"> 
              <CustomDropdownInput  
                label={"Wheat Variety"}  
                form={form} 
                id={"wheatvarietyid"} 
                options ={wheatvarietyidoption}   
                onChange = {onWheatvarietyChange}   
                
              />
            <span id='lotid_Error' style={{color: 'red'}} ></span>
           </Col> */}

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