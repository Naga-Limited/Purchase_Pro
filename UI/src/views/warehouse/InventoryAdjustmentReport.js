import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl,InventoryAdjusmentEntrylistUrl } from '../../urlConstants'

import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'

import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import TableComponent from "../common/TableComponent";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';

import { errorToast } from '../../helper/appHelper';

import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import {ClearDropdown} from "./common/appHelper"
import { DatePicker } from '../forms/custom-datetime';

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

const InventoryAdjustmentReport = ({form,onSubmit}) => {
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
 
    const ScreentypeOptions = [
      {
        options: [
          { value: "ACCOUNTS", label: "ACCOUNTS" },
          { value: "WHEAT MOVEMENT", label: "WHEAT MOVEMENT" },
        ],
      },
    ];
 
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    let { Physical_Stock_Id } = useParams();
    let refid='';
    let fdata='';
    if( Physical_Stock_Id) {
       refid = Physical_Stock_Id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
      if(Physical_Stock_Id){
        onFetchStockentryById();
 
      }
    }, [Physical_Stock_Id]);
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
    const handleViewHistory = (data) => {
 
    } 
 
    const onWarehouseChange = (e) => {
      const {value, label} = e; 
     // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
     // FillPlantList(value);
     form.setFieldValue('warehouseid', {  label:label,value: value });
     ClearDropdown("WH",form, '', 'storagelocationid', 'lotid', '');
 }
 const ExcelExport = (e)=>{
  // Select rows from table_id
  let table_id="InventoryAdjust";
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
   setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value)
   ClearDropdown("PLANT",form, '', 'storagelocationid', 'lotid', '');
 }
 const FillLotList = (lotid) => {
   let fdata ={lotid:lotid, screentype: "PhysicalstockEntry"} 
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
 const OnLotChange = (e) => {
   const {value, label} = e; 
  // setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  form.setFieldValue('lotid', {  label:label,value: value });
  
 } 
 const onScreentypeChange =(e) =>{
  const {value, label} = e; 
  // setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  form.setFieldValue('ScreenType', {  label:label,value: value });
 }
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
    setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
 }
 useEffect(() => {
  
  showInventory();

  
}, []);
 const showInventory = () => {

 
  let Data={
    ...form.values
  }
   
    let fdata = {
      Data,
     formType:"getInventoryReport"
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
   const taColumns = [
    {
      name: "Posting Date",
      selector: "PostDate",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Lot No.",
      selector: "lotno",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Plant",
      selector: "PlantName",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Warehouse",
      selector: "warehousename",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Storage Location",
      selector: "STORAGE_LOCATION",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Wheat Variety",
      selector: "WheatVariety",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Material Code",
      selector: "MaterialCode",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "SAP Qty",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Physical Qty",
      selector: "Physical_Qty",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Up / Down Qty",
      selector: "UP_Down_Qty",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Screen Type",
      selector: "Screentype",
      sortable: true,
      minWidth: "100px",
    },

  ];

 

    return (
     <Fragment> 
           <Row > 
            <Col md="3" sm="12">  
            <DatePicker label={"From Date"} form={form} id="Fromdate" type="date"  />
 
            </Col>
            <Col md="3" sm="12">  
            <DatePicker label={"To Date"} form={form} id="Todate" type="date"  />
 
            </Col>  
            <Col md="3" sm="12" >
           
           <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id="warehouseid" 
           onChange = {onWarehouseChange}   
           options ={warehouseoption}   
        //   value={{label:warehousename, value:warehouseid}}
          
           />
         
           </Col> 
           <Col md="3" sm="12"> 
           
           <CustomDropdownInput  
           form={form} id="lotid"   url={`${apiBaseUrl}warehouse/master/getLotNumber`}  
            options= {lotoption}
            label={"Lot No"} 
           onChange={OnLotChange} 
           //value={{label:lotno, value:lotid }}
           
           />   
           
           </Col> 
            </Row>
            <Row> 
            <Col md="3" sm="12"> 
           <Label>Screen Type</Label>
           <Select  
           form={form} id="ScreenType"   
            options= {ScreentypeOptions}
           onChange={onScreentypeChange} 
         //  value={{label:lotno, value:lotid }}
           
           />  
           </Col>
           </Row>
           <Col sm="12">
           <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple color="primary" type="Button" onClick={(e) => showInventory()} >Show</Button.Ripple>  
            &nbsp;&nbsp;&nbsp;
            {/* <Button.Ripple color="primary" type="Button" onClick={ExcelExport} >Excel Download</Button.Ripple>   */}
            </FormGroup>
            </Col>
            
            <br></br><br></br>

           <Row>
           <Col md="12" sm="12" >
           {/* <div style={{width:"1110px",height:"280px",overflowY:"auto",fontSize:"12px",overflowX:"auto"}} >* /}
        <table className='table-sm' id="InventoryAdjust"> 
            <thead className='bg-primary text-white ' style={{marginTop:"-6px",position:"sticky",height:"50px",fontSize:"12px",textAlign:"center"}}> 
                <tr> 
                  
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Posting Date</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Lot No</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Plant</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Warehouse</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Storage Location</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Material Code</th>
                   
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Physical Qty</th>  
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>SAP Qty</th> 
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Up / Down Qty</th>  
               
                    <th style={{width:"100px",minWidth:"100px",fontWeight:"500"}}>Screen Type</th> 
                   
                </tr>
            </thead> 
            <tbody style={{textAlign:"center"}} >
             
            {stockEntryformData &&
                      stockEntryformData.length>0 &&
                        stockEntryformData.map(item => 
                        <tr>
                          
                          <td style={{width:"100px",minWidth:"100px"}}>{item.PostDate}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.lotno}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.PlantName}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.warehousename}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.STORAGE_LOCATION}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.WheatVariety}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.MaterialCode}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.SAP_Qty}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.Physical_Qty}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.UP_Down_Qty}</td> 
                          <td style={{width:"100px",minWidth:"100px"}}>{item.Screentype}</td> 
                       
                        </tr>
                        )
                        
                      } 
            </tbody>
        </table>  
        {/ *</div>*/}
        <TableComponent showDownload columns={taColumns} data={stockEntryformData} />
        </Col>
        </Row>
       
        
     </Fragment>
    )
} 
const InventoryAdjustmentReportdata = () => {
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
              <CardComponent  header="Inventory Adjustment Report">
         <InventoryAdjustmentReport form={form} onSubmit={onSubmit}  />
         </CardComponent>

       </Fragment>
    )
}

export default InventoryAdjustmentReportdata



