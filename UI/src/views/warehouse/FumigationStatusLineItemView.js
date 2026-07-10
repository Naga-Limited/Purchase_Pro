import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
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
import TableComponent from "../common/TableComponent";

const physicalstock = {
    warehouseid: "", 
    slocation: "",
    wh_code: "",
    warehousename: "",                        
    locationid: "",    
    lotid: "",
    lotno: "", 
    plantid: "",
    Physical_Stock_date: "", 
    wheatvarietyid: "",
    WheatVariety: "",
    BagType: "",
    NoOfBag: "",  
  }

export const taColumns = [
  {
    name: "Fumigation No",
    selector: "FumigationNo",
    sortable: true,
    minWidth: "120px",
    wrap: false,
  },
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    minWidth: "250px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Storage Location",
    selector: "STORAGE_LOCATION",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Lot No",
    selector: "lotno",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
     name: "Wheat Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Stock in MTS",
    selector: "Stock_MTS",
    sortable: true,
    minWidth: "25rem",
    wrap: true,
  },
  {
    name: "Fumigation Type",
    selector: "FumigationTypeName",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Fumigation dose Type",
    selector: "Fumigation_Type",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Fumigated on",
    selector: "dFumigation_date",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Fumigated in Days",
    selector: "fumigationDays",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "Degassed on",
    selector: "DegassedOn",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Degassed in Days",
    selector: "DegassDays",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Fumigation Result",
    selector: "Fumigation_Status",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Reason for Delay",
    selector: "ReasonDelayStatus",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Bag Type",
    selector: "BAG_NAME",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Fumigation Agency",
    selector: "FumigationAgency",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "Fumigator Name",
    selector: "Fumigator_Name",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Vendor Name",
   selector: row =>
        row.Fumigation_Agency == 2
            ? row.Name
            : row.Vendor_Name,
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Amount Without Tax",
    selector: "WithoutTaxAmount",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },{
    name: "Tax Amount",
    selector: "Gst",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },{
    name: "Amount",
    selector: "Amount",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "ALP Count",
    selector: "ALP_Count",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
];


  const FumigationStatusLineItemView = ({form,onSubmit}) => { 
    const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
    const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
    const[locationoption,setLocationoption] = useState([]);                                                                       
    const[lotoption,setLotoption] = useState([]);                                                                       
    const[makeroption,setMakeroption] = useState([]);                                                                       
    const[checkeroption,setcheckeroption] = useState([]);                                                                         
    const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
    const[bagtype,setBagtypeoption] = useState([]);                                                                         
    const[showlot,setshowlot] = useState([]);                                                                        
    const[showwheat, setwheat] = useState([]);     
    const[wheatvarietyidoption,setwheatvarietyidoption] = useState([]);                                                                  
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    
    const actionsCol = {
      name: "Fumigation Indicator",
      selector: "Status",
      minWidth: "15rem",
      cell: (row) => {
        return  (
          <td>{(row.Status == 8)?"FORCE FUMIGATE":"REGULAR"}</td>
        );
      },
    };
    
    const columns = [...taColumns, actionsCol];
    
    
    let { Physical_Stock_Id } = useParams();
    let refid='';
    let fdata='';
    if( Physical_Stock_Id) {
       refid = Physical_Stock_Id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
     /* if(Physical_Stock_Id){
        onFetchStockentryById();
 
      }*/
      showWarehousewisestocks();
    }, []);
    const onFetchStockentryById = () => {
      let fdata = {
        id:refid,
      };
    showLoader();
    console.log("Request Url :: "+apiBaseUrl + "Master/getstockEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "Master/getstockEntrydatabyid", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           warehouseid:data.results[0].warehouseid,
           locationid:data.results[0].locationid,
           lotid:data.results[0].lotid,
           Physical_Stock_date:data.results[0].Physical_Stock_date,
           Maker:data.results[0].Maker,
           Checker:data.results[0].Checker,
           Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
           BagType:data.results[0].BagType,
           NoOfBag:data.results[0].NoOfBag,
           Qty_in_MTS:data.results[0].Qty_in_MTS,
           WheatVarietyid:data.results[0].WheatVarietyid
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
      history.push(`/master/PhysicalstockEntry`);
    };

    const handleViewHistory = (data) => {} 
 
    const onWarehouseChange = (e) => {
      const {value, label} = e; 
      form.setFieldValue('warehouseid', {  label: label,value: value });
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
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


    const onStorageLocationchange =(e) =>{
      const {value,label} = e; 
      form.setFieldValue('storagelocationid', {  label: label,value: value });
      FillLotList(value);
      ClearDropdown("SL");
    }

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
   form.setFieldValue('locationid', {  label: label,value: value });
   setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value);
   ClearDropdown("PLANT");
 
 }
 const FillLotList = (Value) => {
  //let fdata ={plantid:plant, screentype: "Warehousewisestocks"} 
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
 const OnLotChange = (e) => {
   const {value, label} = e; 
   form.setFieldValue('lotid', {  label: label,value: value });
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
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

 const showWarehousewisestocks = (e) => {
  let pSearch="";
  if(e && e.target.name=="searchtext"){
    pSearch="" + e.target.value;
    form.setValues({...form.values,searchtext:e.target.value});
  }
  else
  {
    pSearch = form.values.searchtext ? form.values.searchtext :"";
  }

  let Data=form.values;
  let fdata = {
    sub_lot_id:refid,
    searchtext:pSearch,
  Screen:"FUMIGATIONSTATUS",
  Data
  };
showLoader();
// console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
 apiPostMethod(apiBaseUrl + "warehouse/reports/getfumigationlist", fdata)
 .then((response) => {
   const { data } = response;
   console.log("Response Data :: "+JSON.stringify(response));
   if (data.success) {
     form.setValues({
       
      ...form.values,
    CheckList:data.results,
    searchtext:pSearch
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
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
    form.setFieldValue('wheatvarietyid', {  label: label,value: value });
    setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
 }

 const ClearDropdown = (Item) => {
  if (Item === "DT"){
    form.setFieldValue('warehouseid', '');
    form.setFieldValue('storagelocation', '');
    form.setFieldValue('lotno', '');
    form.setFieldValue('wheatvariety', '');
  }else if (Item === "WH"){
    form.setFieldValue('storagelocation', '');
    form.setFieldValue('lotno', '');
    form.setFieldValue('wheatvariety', '');
  }else if (Item === "SL"){
    form.setFieldValue('lotno', '');
    form.setFieldValue('wheatvariety', '');
  }else if (Item === "LOT"){
    form.setFieldValue('wheatvariety', '');
  }
}
 
 const ShowStock = (e) => {
   let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
   apiPostMethod(apiBaseUrl+'warehouse/physicalstocktaking/getphysicalstocklist',fdata)
   .then((response) => {    
     const {data} = response;
     const  value = value;
     if(data.success){ 
       console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  

         //setshowlot({ ...stockEntryformData, lotno:value}); 
         //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
            
     }
   })
   .catch((error) => {
     errorToast("Something went wrong, please try again after sometime")
   }); 
  }

  return (
  <Fragment>
    <Row > 
      <Col md="3" sm="12">  
        <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
      </Col>
      <Col md="3" sm="12">  
        <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
      </Col>
      <Col md="3" sm="12" >
        <CustomDropdownInput  
          url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
          label={"Warehouse Name"}  
          form={form} 
          id={"warehouseid"} 
          options ={warehouseoption}   
          onChange = {(e)=>onWarehouseChange(e)}   
        />
      </Col>
    </Row> 
    <Row>   
      <Col md="3" sm="12"> 
        <CustomDropdownInput  
          label={"Storage Location"}  
          form={form} 
          id={"storagelocationid"} 
          className="react-select"
          classNamePrefix="select"
          options ={locationoption}   
          onChange = {(e)=>onStorageLocationchange(e)}   
        />
        <span id='locationid_Error' style={{color: 'red'}} ></span>
      </Col>

      {/* <Col md="3" sm="12" style={{display:"none"}}> {/**Plant not in use * /}
        <Label>Storage Location</Label>
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
          className="react-select"
          classNamePrefix="select"
          options ={lotoption}   
          onChange = {(e)=>OnLotChange(e)}   
        />
        <span id='lotid_Error' style={{color: 'red'}} ></span>
      </Col>

      <Col md="3" sm="12"> 
        <CustomDropdownInput  
          label={"Wheat Variety"}  
          form={form} 
          id={"wheatvarietyid"} 
          className="react-select"
          classNamePrefix="select"
          options ={wheatvarietyidoption}   
          onChange = {(e)=>onWheatvarietyChange(e)}   
        />
        <span id='lotid_Error' style={{color: 'red'}} ></span>
      </Col>

      <Col md="3" sm="12"> 
      <div className='p-1' style={{marginTop:"10px"}}>
        <Button.Ripple onClick={showWarehousewisestocks}  color="primary"  type="Button">Show</Button.Ripple>
        {/* <Button.Ripple  style={{width:"110px"}} color="primary" type="Button" onClick={ExcelExport} >Excel Export</Button.Ripple>   */}
      </div> 
      </Col>
    </Row> 
    <Row> 
      <Col md='12' sm="12"> 
        <div className='d-flex  justify-content-end'>
        <CustomTextInput label={"Search"} onChange={showWarehousewisestocks} form={form} id="searchtext" type="search"  />
        </div>
      </Col> 
    </Row> 
    
    <Row>      
      <Col md='12' sm="12">
        <TableComponent showDownload columns={columns} data={form.values.CheckList}/>  
      {/*
        <div>
        <table id="TableID" className='table-sm' > 
            <thead className='bg-primary text-white' style={{height:"50px",fontSize:"12px",textAlign:"center"}} > 

                <tr> 
            
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation No</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Warehouse Name</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Storage Location</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Lot No</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Stock in MTS</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation Type</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigated on</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigated in Days</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Degassed on</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Degassed in Days</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation Result</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Reason for Delay</th>
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Bag Type</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation Agency</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigator Name</th>  
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Vendor Name</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Amount</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>ALP Count</th> 
                    <th style={{minWidth:"200px",fontWeight:"500"}}>Fumigation Indicator</th>
                </tr>
            </thead> 
            <tbody style={{textAlign:"center"}}>
              {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                <tr>
                   <td>{row.FumigationNo}</td> 
                   <td>{row.WH_NAME}</td> 
                   <td>{row.STORAGE_LOCATION}</td> 
                   <td>{row.lotno}</td> 
                   <td>{row.WheatVariety}</td> 
                   <td>{row.wheatqty}</td> 
                   <td>{row.Fumigation_Type}</td> 
                   <td>{row.dFumigation_date}</td> 
                   <td>{row.fumigationDays}</td> 
                   <td>{row.LastDegasDt}</td> 
                   <td>{row.DegassDays}</td> 
                   <td>{row.Fumigation_Status}</td> 
                   <td>{row.ReasonDelayStatus}</td> 
                   <td>{row.BAG_NAME}</td> 
                   <td>{row.FumigationAgency}</td> 
                   <td>{row.Fumigator_Name}</td> 
                   <td>{row.Vendor_Name}</td> 
                   <td>{row.Amount}</td> 
                   <td>{row.ALP_Count}</td> 
                   <td>{(row.Status == 8)?"FORCE FUMIGATE":"REGULAR"}</td> 

                </tr>
                  ))}  
            </tbody>
            
            
        </table>  
        </div>
        */}

      </Col>      
    </Row> 
  </Fragment>
  )
} 

const FumigationStatusLineItemViewData = () => { 
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
        warehousid:validation.required({ message:"Warehouse Name should not be empty", isObject:false }),
        locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
        lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
        Physical_Stock_date: validation.required({  message:"Date should not be empty",isObject: true }),
        Maker: validation.required({  message:"Maker should not be empty",isObject: true }),
        Checker: validation.required({  message:"Checker should not be empty",isObject: true }),
        Wheat_Variety_Id: validation.required({ message:"wheat vareity should not be empty", isObject: true }),
        BagType: validation.required({ message:"BagType should not be empty", isObject: true }),
        NoOfBag: validation.required({ message:"No of bag should not be empty", isObject: true }),
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
      let stockEntryformData = form.values;
      const FrmData = { 
        warehousid:stockEntryformData.warehousename.value,
        locationid:stockEntryformData.locationid,
        lotid:stockEntryformData.lotno.value,
        Maker:stockEntryformData.Maker, 
        Checker:stockEntryformData.Checker,
        Wheat_Variety:stockEntryformData.Wheat_Variety,
        BagType:stockEntryformData.bagtype,
  
      };
      console.log(" Physical stock Entry :: "+JSON.stringify(FrmData));
      const postdata = {
        id:stockEntryformData.F_ID,
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
   
            if(document.getElementById("F_ID").value=="")
            {
              history.push("/warehouse");
            }
            else
            {
              history.push("/warehouse");
            }
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
return (
    <Fragment>
   
      <CardComponent  header=" Fumigation Status Line Item View"> 
        
     <FumigationStatusLineItemView form={form}  onSubmit={onSubmit}  />
    
   </CardComponent> 
   
    </Fragment>
  )
}

export default FumigationStatusLineItemViewData
