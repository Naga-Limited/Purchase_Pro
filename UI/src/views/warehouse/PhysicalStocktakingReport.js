import React, { Fragment, useState, useEffect } from 'react'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { Col ,FormGroup, Label,Button, CardBody } from 'reactstrap'
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
import { ClearDropdown } from './common/appHelper';
import TableComponent from "../common/TableComponent";

export const taColumns2 = [
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Wheat Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "300px",
    wrap: true,
  },
  {
    name: "Phy Qty in MTS",
    selector: "Phy_Qty_in_MTSsum",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "SAP Qty in MTS",
    selector: "SAP_Qty_in_MTSsum",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Diff Qty in MTS",
    selector: "Diff_Qty_in_MTSsum",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Wheat Variety Variance Count",
    selector: "",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
];

export const taColumns = [
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Lot No",
    selector: "lotno",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Physical Wheat Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "300px",
    wrap: true,
  },
  {
    name: "SAP Wheat Variety",
    selector: "Phy_Qty_in_MTS",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Bag Type",
    selector: "BAG_NAME",
    sortable: true,
    minWidth: "300px",
    wrap: true,
  },
  {
    name: "No of Bags",
    selector: "NoOfBag",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Audit Remarks",
    selector: "Audit_Remarks",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Audit Time",
    selector: "auditTime",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "OutBox Indicator",
    selector: "OutboxInd",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Maker",
    selector: "MakerName",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Checker",
    selector: "CheckerName",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Phy Qty in MTS",
    selector: "Qty_in_MTS",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "SAP Qty in MTS",
    selector: "Phy_Qty_in_MTS",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Diff Qty in MTS",
    selector: "Diff_Qty_in_MTS",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Diff %",
    selector: "Diff_Percent",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Verification Remarks",
    selector: "Verification_Remarks",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
];

const actionsCol = {
  name: "Attachment View",
  selector: "status",
  minWidth: "350px",
  cell: (row) => {
    return  (
    //   <Button.Ripple 
    //     color="primary" 
    //     type="Button" 
    //     onClick={(e) => {ActionEntry(row.sub_lot_id, row.index , 1);}}>Skip
    //   </Button.Ripple>
    <div>
      <table>
        <tr>
    <td>{row.Image1 && <Uploader isReadOnly={true} selectedFileName={row.Image1} />}</td>
    <td>{row.Image2 && <Uploader isReadOnly={true} selectedFileName={row.Image2} />}</td>
    <td>{row.Image3 && <Uploader isReadOnly={true} selectedFileName={row.Image3} />}</td>
    <td>{row.Image4 && <Uploader isReadOnly={true} selectedFileName={row.Image4} />}</td>
    </tr>
    </table>
    </div>
    );
  },
};



const columns1 = [...taColumns, actionsCol];

const stockvalidation = {                                    
  warehouseid: "",                                    
  locationid: "",                                     
  lotno: "",                                    
  lotid: "",                                    
  Maker: "",                                    
  CheckName: "",                                    
  stockstatus: "",                                    
  wh_name: "",                                     
  wh_code: "",                                    
  plantid: "",                                     

}

const PhysicalStocktakingReport = ({form, onSubmit}) => { 
  const[stockvalidationdata, Setstockvalidation] = useState({ ...stockvalidation});
  const[warehouseoption, setWarehouseoption] = useState([]);
  let { showLoader, hideLoader } = useLoader();
  const[lotoption,setLotoption] = useState([]);
  const[locationoption,setLocationoption] = useState([]);  
  const[stockstatus,setstockstatus] = useState([]); 
  const {warehousename,locationid,wh_code,plantid,lotid,lotno,Maker,checkername} = stockvalidationdata
  
  const statusOptions = [
    {
      options: [
        { value: "1", label: "Pending" },
        { value: "2", label: "Completed" },
      /*  { value: "AD", label: "AD - Accepted with Deduction" },*/
      ],
    },
  ];
  const ReportTypeOptions = [
    {
      options: [
        { value: "1", label: "Lot"},
        { value: "2", label: "Warehouse"},
      /*  { value: "AD", label: "AD - Accepted with Deduction" },*/
      ],
    },
  ];

  const onWarehouseChange = (e) => {
    const {value, label} = e; 
   // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
   form.setFieldValue('warehouseid', {  label: label,value: value });
   // FillPlantList(value);
   FillStorageLocationFromWarehouse(value);
   ClearDropdown("WH",form, '', 'storagelocationid', 'lotid', '');
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
const onPlantchange = (e) => {
  const {value,label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
  
  form.setFieldValue('locationid', {  label: label,value: value });
  FillLotList(value)
  ClearDropdown("PLANT",form, '', 'storagelocationid', 'lotid', '');
}
const FillLotList = (Value) => {
  //let fdata ={plantid:plant, screentype: "PhysicalstockEntry"} 
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
const onchangeMaker = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Maker', {  label: label,value: value });
}
const onchangeChecker = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Checker', {  label: label,value: value });
}
const onStatuschange = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('Status', {  label: label,value: value });
}
const onReportTypechange = (e)=>{
  const {value, label} = e; 
  form.setFieldValue('ReportType', {  label: label,value: value });
}
const OnLotChange = (e) => {
  const {value, label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  
  form.setFieldValue('lotid', {  label: label,value: value });
 // Fillwheatvarity(value)
 
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
const onTextChange = (e,PKey, CheckList,Val) => {

  for(let i=0;i<CheckList.length;i++){
    if(CheckList[i].Physical_Stock_Id==PKey){
        if(Val=="Verification_Remarks"){
          CheckList[i].Verification_Remarks=e.target.value;
        }
        if(Val=="Selected"){
          if(e.target.checked){
            CheckList[i].Selected=1;
          }else{
            CheckList[i].Selected=0;
          }
         
        }
        
        
    }
  }
  console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
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
     ScreenType:'UPDATEVALIDATION',
    
   }
  
    console.log(JSON.stringify(postdata))
   showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/Physicalstocktaking/updatephysicalstock", postdata)
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
       //history.push("/warehouse/PhysicalStocktakingReport");
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
   const onStorageLocationchange =(e) =>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationid', {  label: label,value: value });
    FillLotList(value)
  }


  const ExcelExport = (e)=>{
    // Select rows from table_id
    let table_id="PhysicalStocktakingReport";
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

const showPhysicalstock = (e) => {
  let SrchVal=e?e.target.value:"";
  //setAttachment({ Image1: {}, Image2: {},Image3:{},Image4:{} });
  console.log(JSON.stringify(form.values));
  
 
  let FormData=form.values;
  let Rtype=FormData.ReportType ? FormData.ReportType.value:1;
  let fdata = {warehouseid:FormData.warehouseid ? FormData.warehouseid.value:"",
    plantid:FormData.locationid ? FormData.locationid.value:"",
    lotid:FormData.lotid ? FormData.lotid.value:"",
    Physical_Stock_date:FormData.Date ? FormData.Date :"",
    Maker:FormData.Maker ? FormData.Maker.value:"",
    Checker:FormData.Checker ? FormData.Checker.value:"",
    Status:FormData.Status ? FormData.Status.value:"",
    ReportType:Rtype,
    screentype: "PhysicalstocEntryValidation",
  Search:SrchVal,
  FromDate:FormData.FromDate ? FormData.FromDate:"",
  ToDate:FormData.ToDate ? FormData.ToDate:"",
} 
  apiPostMethod(apiBaseUrl+'warehouse/Physicalstocktaking/getphysicalstocEntryklist',fdata)
  .then((response) => {    
    const {data} = response;
    // const  value = value;
    if(data.success){
    //  document.getElementById("StockDet").innerHTML=""; 
     

//console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
     // setKeyloanDatas(data.results);

      form.setValues({
        ...form.values,
        CheckList:data.results,
        Search:SrchVal,
        ReportType:form.values.ReportType && form.values.ReportType.value ? form.values.ReportType:{"ReportType":{label:"Lot",value:"1"}},
      });
      //form.setFieldValue({"ReportType"})
      /*Mohan commented on 27-09-2022
      if(form.values==1){
      form.setFieldValue('ReportType', {  label: "Lot",value: "1" });
      }
      else if(form.values==2){
      form.setFieldValue('ReportType', {  label: "Warehouse",value: "2" });
      }
      */
      //form.setFieldValue('warehouseid', {  label:  data.results[0].WH_NAME,value: data.results[0].wh_code });
      //form.setFieldValue('locationid', {  label:  data.results[0].PLANT_NAME,value: data.results[0].plantid });
      //form.setFieldValue('lotid', {  label: data.results[0].lotno,value: data.results[0].lotid });
     // console.log("Checklist");
     // console.log(form.values.CheckList);
      /*
      let CheckList={}
      for(let i=0;i<data.results.length;i++)
      {
        CheckList[i]={lotid:data.results[i].lotid,wheatvarietyid:data.results[i].wheatvarietyid , BagType:{lable:"",value:""}};
      }
      form.setValues({CheckList});*/
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
         <Col md="3" sm="12" >
           
           <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id="warehouseid" 
           onChange = {onWarehouseChange}   
           options ={warehouseoption}   
           
          
           />
          <span id='warehouseid_Error' style={{color: 'red'}} ></span>

           </Col>
           <Col md="3" sm="12"> 
           <CustomDropdownInput   
           label={"Storage Location"}
            form={form} id="storagelocationid"
           //onChange={onPlantchange} 
           onChange={onStorageLocationchange} 
           options={locationoption}
        

           />
            <span id='locationid_Error' style={{color: 'red'}} ></span>

           </Col>
           <Col md="3" sm="12" style={{display:"none"}}> {/**Plant not in use */}
           
           <CustomDropdownInput  
           label="Storage Location"
            form={form} id="locationid"
           onChange={onPlantchange} 
           options={locationoption}
        

           />
            <span id='locationid_Error' style={{color: 'red'}} ></span>

           </Col>
           <Col md="3" sm="12"> 
           
           <CustomDropdownInput  
           label="Lot No"
           form={form} id="lotid"   
            options= {lotoption}
           onChange={OnLotChange} 
         
           
           />
            <span id='lotid_Error' style={{color: 'red'}} ></span>

           </Col>
           <Col md="3" sm="12">
             <CustomTextInput label={" Audit Date"} form={form} id="Date" type="date"  />
             </Col>
         </Row>

        <Row>    
          <Col md="3" sm="12">
            <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
              label={"Maker"}  form={form} id="Maker" 
              onChange = {onchangeMaker}   
            />
            <span id='Maker_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="3" sm="12">
            <CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getUsers`} 
              label={"Checker"}  form={form} id="Checker" 
              onChange = {onchangeChecker}   
            />
            <span id='Checker_Error' style={{color: 'red'}} ></span>
          </Col> 

          <Col md="3" sm="12">
            <Label>Stock Status</Label>
            <CustomDropdownInput
              className="react-select"
              classNamePrefix="select"
              id="Status"
              form={form}
              onChange={onStatuschange} 
              options={ statusOptions }
            />
          </Col>
          <Col md="3" sm="12">
            <Label>Report Type</Label>
            <CustomDropdownInput
              className="react-select"
              classNamePrefix="select"
              id="ReportType"
              form={form}
              onChange={onReportTypechange} 
              options={ReportTypeOptions}
            />
          </Col>
        </Row>

        <Row>
          <Col md="3" sm="12">
            <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
            <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
          </Col>

          <Col sm="12"> 
          <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple onClick={showPhysicalstock} color="primary" type="Button">Show</Button.Ripple>
            &nbsp;&nbsp;&nbsp;
            {/* <Button.Ripple onClick={ExcelExport} color="primary" type="Button">Excel Export</Button.Ripple> */}
          </FormGroup>
          </Col>

        </Row>
        
          {form.values.ReportType && (form.values.ReportType.value==2 || form.values.ReportType.value==1 ) && 
           <>
          <Row> 
           <Col md='12' sm="12"> 
           <div className='d-flex  justify-content-end'>
           <CustomTextInput label={"Search"} form={form} id="Search"
            onChange={(e) => showPhysicalstock(e)}
           type="search"  />
           </div>
           </Col> 
          </Row> 
          
           <br></br>
           
          {form.values.ReportType && form.values.ReportType.value==1 && 
            <Row> 
              <Col md='12' sm="12">
                <TableComponent showDownload hideSearch columns={columns1} data={form.values.CheckList}/> 
              </Col>
            </Row>
          } 
          {form.values.ReportType && form.values.ReportType.value==2 && 
            <Row> 
              <Col md='12' sm="12">
                <TableComponent showDownload hideSearch columns={taColumns2} data={form.values.CheckList}/> 
              </Col>
            </Row>
          } 
           {/* <div style={{Width:"970px",minHeight:"60vh",fontSize:"12px",overflowX:"auto"}} >
            <table className="sticky" class="table-sm" id="PhysicalStocktakingReport"  >
              <thead class="bg-primary text-white" style={{position:"sticky", height:"50px",fontSize:"12px"}}>

              {form.values.ReportType && form.values.ReportType.value==2 && 
                <>
                <tr>
                  <th style={{minWidth:"200px",fontWeight:"500"}} >Warehouse Name</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}} > Wheat Variety</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}} >Phy Qty in MTS SAP Qty in </th>
                  <th style={{minWidth:"200px",fontWeight:"500"}} >SAP Qty in MTS</th>
                  <th style={{minWidth:"200px",fontWeight:"500"}} >Diff Qty in MTS </th>
                  <th style={{minWidth:"200px",fontWeight:"500"}} >Wheat Variety Variance Count </th>
                </tr>
                </>
               }
                 
               {form.values.ReportType && form.values.ReportType.value==1 && 
               <>
               <tr>
               <th style={{minWidth:"200px",fontWeight:"500"}} >Warehouse Name</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Lot No</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Physical Wheat Variety</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >SAP Wheat Variety</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Bag Type</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >No of Bags</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Audit Remarks</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Audit Time</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >OutBox Indicator</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Maker</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Checker</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Phy Qty in MTS</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >SAP Qty in MTS</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Diff Qty in MTS </th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Diff % </th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} >Attachment View</th>
                   <th style={{minWidth:"200px",fontWeight:"500"}} > Verification Remarks</th>
                   </tr>
                   </>}
               
               
                </thead>
                <tbody style={{textAlign:"left"}}>
                    {form.values.ReportType && form.values.ReportType.value==2 && form.values.CheckList && form.values.CheckList.map((row, index) => (  
                    <tr >
                      <td>{row.WH_NAME}</td>
                      <td>{row.WheatVariety}</td>
                      <td>{row.Phy_Qty_in_MTSsum}</td>
                      <td>{row.SAP_Qty_in_MTSsum}</td>
                      <td>{row.Diff_Qty_in_MTSsum}</td>
                      <td></td>
                    </tr>
                  ))}  
                {form.values.ReportType && form.values.ReportType.value==1 && form.values.CheckList && form.values.CheckList.map((row, index) => (  
                  <tr > 
                    <td>{row.WH_NAME}</td>
                    <td>{row.lotno}</td>
                    <td>{row.WheatVariety}</td>
                    <td>{row.SAP_Qty_in_MTS}</td>
                    <td>{row.BAG_NAME}</td>
                    <td>{row.NoOfBag}</td>
                    <td>{row.Audit_Remarks}</td>
                    <td>{row.auditTime}</td>
                    <td>{row.OutboxInd}</td>
                    <td>{row.MakerName}</td>
                    <td>{row.CheckerName}</td>
                    <td>{row.Phy_Qty_in_MTS}</td>
                    <td>{row.SAP_Qty_in_MTS}</td>
                    <td>{row.Diff_Qty_in_MTS}</td>
                    <td>{row.Diff_Percent}</td>
                    <td>

                   {row.Image1 && <Uploader isReadOnly={true} selectedFileName={row.Image1} />}
                   {row.Image2 && <Uploader isReadOnly={true} selectedFileName={row.Image2} />}
                   {row.Image3 && <Uploader isReadOnly={true} selectedFileName={row.Image3} />}
                   {row.Image4 && <Uploader isReadOnly={true} selectedFileName={row.Image4} />}

                   </td>
                   <td> {row.Verification_Remarks}</td>  
                
               </tr>
                ))}  
               </tbody>
        </table> 
        </div> */}
        
        {/*</div>*/}
         </>
        }
       
        </Fragment>
    )
}

const PhysicalStocktakingReportData = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {"ReportType":{label:"Lot",value:"1"}},
    validationSchema: Yup.object().shape({
 
     /* WH_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
       Location: validation.required({  message:"Storage Location should not be empty",isObject: true }),
       LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
       Date: validation.required({ message:"Date should not be empty", isObject: true }),
       Maker: validation.required({ message:"Date should not be empty", isObject: true }),
       SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
       BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
       LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
       LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
       LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
       LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
       FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
       RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
       FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
       FA: validation.required({  message:"Fumigation Agency should not be empty",isObject: true }),
       FN: validation.required({ message:"Fumigator Name should not be empty", isObject: true }),
       VN: validation.required({  message:"Vendor Name should be numeric value",isObject: false }),
       ALPC: validation.required({ message:"ALP Count should not be empty", isObject: false }),
       AmountPer: validation.required({  message:"AmountPer should not be empty",isObject: false }),*/
     }),
    onSubmit(values) {},
  });
  const onSubmit =() => {

  }
  return (
    <Fragment>
      <CardComponent  header="Physical Stock Taking - Report">
     <PhysicalStocktakingReport form={form}  onSubmit={onSubmit}  />
   </CardComponent>
    </Fragment>
  )
}



export default PhysicalStocktakingReportData
