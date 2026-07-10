import React, { Fragment, useState, useEffect } from 'react'
import { Col, Label, Button, FormGroup, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl,uploadUrl,SaveCaptureImage,uploadandSaveImageUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { Paperclip, X, Plus } from "react-feather";
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
import TableComponent from "../common/TableComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler'; 
import CaptureImage from "../CaptureImage";

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
      name: "Warehouse",
      selector: "WH_NAME",
      sortable: true,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "PLANT_NAME",
      minWidth: "130px",
      wrap: true,
      sortable: true,
    },
    {
      name: "Location",
      selector: "STORAGE_LOCATION",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Lot",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
       name: "Wheat Variety",
      selector: "WheatVariety",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Qty",
      selector: "wheatqty",
      sortable: true,
      minWidth: "70px",
      wrap: true,
    },
    {
      name: "Skip Qty",
      selector: "wheatqty",
      sortable: true,
      minWidth: "70px",
      wrap: true,
    },
    {
      name: "SAP Qty",
      selector: "wheatqty",
      sortable: true,
      minWidth: "70px",
      wrap: true,
    },
  ];  


const RndSkipScreen = ({form,onSubmit,ImgData,setImgData}) => { 
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
    const dateFormat = "DD-MM-YYYY";
    const today = moment().format(dateFormat);
    const [WhPlantOptions, setWhPlantOptions] = useState([]);
    const [NewData, setNewData] = useState([])
 
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();


//  Dijo 01
const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('plantid', '');
    form.setFieldValue('locationid','');
    form.setFieldValue('lotid', '');
    form.setFieldValue('wheatvarietyid', '');
  }else if (Item === "PLANT"){
    form.setFieldValue('locationid','');
    form.setFieldValue('lotid', '');
    form.setFieldValue('wheatvarietyid', '');
  }else if (Item === "SL"){
    form.setFieldValue('lotid', '');
    form.setFieldValue('wheatvarietyid', '');
  }else if (Item === "LOT"){
    form.setFieldValue('wheatvarietyid', '');
  }
}
//  End


    const entryCol = {
      name: "Remarks",
      selector: "RndSkipRemarks",
      minWidth: "150px",
      cell: (row, index) => {
        return  (
          <CustomTextInput 
            style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
            onChange={(e) => onTextChange(e,row.sub_lot_id, form.values.CheckList, "RndSkipRemarks", index)} 
            form={form} 
            id={`RndSkipRemarks_${index}`} 
            type="text" 
            value={row.RndSkipRemarks}/>
        );
      },
    }

    const actionsCol = {
      name: "View R&D",
      selector: "status",
      minWidth: "200px",
      cell: (row, index) => {
        return  (
          <div>
          {row.RnDSkipEnableFlag === "1" &&
          <Button.Ripple 
            color="primary" 
            type="Button" 
            onClick={(e) => {ActionEntry(row.sub_lot_id, index , 1);}}>Skip
          </Button.Ripple>
          }{row.RnDSkipEnableFlag === "0" && moment(row.RndSkipDate).format(dateFormat)}
        </div>
        );
      },
    };
    const columns = [...taColumns, entryCol, actionsCol];

    let { Physical_Stock_Id } = useParams();
    let refid='';
    let fdata='';
    if( Physical_Stock_Id) {
       refid = Physical_Stock_Id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
     
        getSubLotDetailsRnd();
      
    }, [Physical_Stock_Id]);
    const onFetchStockentryById = () => {
      let fdata = {
        id:refid,
      };
    //showLoader();
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
      form.setFieldValue('warehouseid', {  label: label,value: value });
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);
      ClearDropdown("WH");
 }

 const ActionEntry = (sub_lot_id,indexVal,Status) => {
  if(!form.values.CheckList[indexVal].RndSkipRemarks){ errorToast("Enter Remarks"); return false}
  
  const current = new Date();
  const RndSkipDt =`${current.getFullYear()}/${current.getMonth()+1}/${current.getDate()+7}`; ;

  let Data={
    RndSkipRemarks:form.values.CheckList[indexVal].RndSkipRemarks,
    RndSkipFlag:1,
    RndSkipDate:RndSkipDt
  }
 
  const postdata = {
    id:sub_lot_id,
    ScreenType:'RNDSKIP',
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/RndlotConversion/RndSkip", postdata)
    .then((response) => {
     // return false;
    const { data } = response;
    console.log(JSON.stringify(response))
    //return false;
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      
    window.location.reload();
     
      }
     // getSublotlist();
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
 }
 
 const handleFileChange = (e, key, index) => {
  if (e.target.files && e.target.files[0].size > 5242880) {
    errorToast("File Size is too Large. Please try again with less than 5Mb");
  } else {
    let { files } = e.target;
   /* let vds = [...form.values.CheckList];
    vds.forEach((fitem, i) => {
      if (index === i) {
        fitem[key] = files[0].name;
        fitem[key + "_attach"] = files[0];
      }
    });*/
    for(let i=0;i<form.values.CheckList.length;i++){
      if(i==index){
        form.values.CheckList[i].Param_Attach=files[0].name;
        form.values.CheckList[i].Param_Attach_attach=files[0];
        document.getElementById("ImgName_"+index).innerHTML=files[0].name;
      }
      
    }
   // setvehicalDatas(vds);
   console.log(JSON.stringify(form.values.CheckList));
  }
};
const fileUploadAction = (id) => {
  document.getElementById(id).click();
};
 /*const FillPlantList  = (warehouseid) => {
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
 };*/
 const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {
      setWhPlantOptions([{options:data.results}]);
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
   FillLotList(value)
 
 }
 const FillLotList = (plant) => {
  //let fdata ={storagelocationId:plant, screentype: "Warehousewisestocks"} 
  let fdata = { storagelocationId:plant,plantid: form.values.plantid.value, screenType: "FUMIGATION" };

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
   form.setFieldValue('lotid', {  label: label,value: value });
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 

   FillWheatVarityList(value)
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

const onTextChange = (e, PKey, CheckList,Val,index) => {
  //alert(index);
  for(let i=0;i<CheckList.length;i++){
    if(CheckList[i].rowId==index){
        if(Val=="RndSkipRemarks"){
          CheckList[i].RndSkipRemarks=e.target.value;
        }
    }
  }
  //e.target.focus();
  // console.log(e);
  // console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
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
 const getSubLotDetailsRnd = (e) => {
 // showError('warehouseid_Error','Enter WarehouseID',0);
  //showError('locationid_Error','Enter Location ',0);
  //showError('lotid_Error','Enter Lot ',0);
  //showError('wheatvarietyid_Error','Enter Wheat Variety ',0);

  /* if(!form.values.warehouseid){
    showError('warehouseid_Error','Enter WarehouseID',1);
    return false
   }
   if(!form.values.plantid){
    showError('plantid_Error','Enter Location ',1);
    return false;
   }
   if(!form.values.locationid){
    showError('locationid_Error','Enter Location ',1);
    return false;
   }
   if(!form.values.lotid){
    showError('lotid_Error','Enter Lot ',1);
    return false;
   }
   if(!form.values.wheatvarietyid){
    showError('wheatvarietyid_Error','Enter Wheat Variety ',1);
    return false;
   }*/
  let Data=form.values;
  let fdata = {
    sub_lot_id:refid,
    Screen:"RNDSKIPSCREEN",
    Data
  };
showLoader();
// console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
 apiPostMethod(apiBaseUrl + "warehouse/RndlotConversion/getSublotRndDetail", fdata)
 .then((response) => {
   const { data } = response;
   console.log("Response Data :: "+JSON.stringify(response));
   if (data.success) {
     form.setValues({
       
      ...form.values,
    CheckList:data.results,
    RndDet:data.RndDet,
    PvsRnd:data.PvsRndCount,
    PvsRndIDs:data.PvsRndID
     })
     setNewData(form.values.CheckList)
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
 const onStorageLocationChange=(e)=>{
  const {value,label} = e; 
  form.setFieldValue('locationid', {  label: label,value: value });
 // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
 FillLotList(value)
 ClearDropdown("SL");
 }
 const onPlantChange = (e) => {
  const { value, label } = e;
  form.setFieldValue('plantid', {  label: label,value: value });
  
  //FillLotList(value);
  FillStorageLocationList(value)
  ClearDropdown("PLANT");
}
const FillStorageLocationList=(PlantId)=>{
  let fdata = { PlantId, screenType: "RND" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    setLocationoption([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
 };
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
    form.setFieldValue('wheatvarietyid', {  label: label,value: value });
    setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
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
        <Col md="2" sm="12" >
          <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
            label={"Warehouse Name"}  form={form} id={"warehouseid"} 
            onChange = {onWarehouseChange}   
            options ={warehouseoption}   
          />
          <span id='warehouseid_Error' style={{color: 'red'}} ></span>
        </Col>
         
        <Col md="2" sm="12"> 
          {/* <Label>Plant</Label>
          <Select style={{"width":"370px"}}
            options={WhPlantOptions}
            id={"plantid"}
            className="react-select"
            classNamePrefix="select"
            onChange={(e) => onPlantChange(e)}
          /> */}
           <CustomDropdownInput 
            label={"Plant Id"} id={"plantid"}
            form={form}
            options={WhPlantOptions}
            onChange={(e) => onPlantChange(e)}
            />
          <span id='plantid_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="2" sm="12"> 
          {/* <Label>Storage Location</Label>
          <Select  
            form={form} id="locationid"
            onChange={onStorageLocationChange} 
            options={locationoption}
          /> */}
           <CustomDropdownInput  
            label={"Storage Location"} id={"locationid"}
            form={form} 
            onChange={onStorageLocationChange} 
            options={locationoption}
          />
          <span id='locationid_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="2" sm="12"> 
          {/* <Label>Lot No</Label>
          <Select  
            form={form} id="lotid"   
            options= {lotoption}
            onChange={OnLotChange} 
          /> */}
           <CustomDropdownInput 
          label={"Lot"} id={"lotid"}
          form={form}    
          options= {lotoption}
          onChange={OnLotChange} 
          />
          <span id='lotid_Error' style={{color: 'red'}} ></span>
        </Col>
        <Col md="2" sm="12"> 
          {/* <Label>Wheat Variety</Label>
          <Select  
            form={form} id="wheatvarietyid"   
            options= {wheatvarietyidoption}
            onChange={onWheatvarietyChange} 
          /> */}
           <CustomDropdownInput 
          label={"Wheatvariety"} id={"wheatvarietyid"}
          form={form} 
          options= {wheatvarietyidoption}
          onChange={onWheatvarietyChange} 
          />
          <span id='wheatvarietyid_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="2" sm="12" > 
          {/* <FormGroup className="d-flex justify-content-end mb-0"> */}
          <div style ={{marginTop:"25px"}}>
            <Button.Ripple color="primary" minWidth type="Button" onClick={getSubLotDetailsRnd}>Show</Button.Ripple>        
            </div>
          {/* </FormGroup> */}
        </Col>
      </Row> 
      
      <Row>
        <Col sm="12">
        {/* <TableComponent hideSearch columns={columns} data={form.values.CheckList} />   */}
        <div style={{overflow:"auto", height:"520px"}}>
        <table id="TableID" className='table-sm'> 
        <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center", zIndex:"1", position:"sticky", top:"0px"}}> 
             <tr>
             <th style={{minWidth:"150px"}}>Warehouse</th>
             <th style={{minWidth:"150px"}}>Plant</th>
             <th style={{minWidth:"150px"}}>Location</th>
             <th style={{minWidth:"150px"}}>Lot</th>
             <th style={{minWidth:"150px"}}>Wheat Variety</th>
             <th style={{minWidth:"150px"}}>Qty</th>
             <th style={{minWidth:"150px"}}>Skip Qty</th>
             <th style={{minWidth:"150px"}}>Qty</th>
             <th style={{minWidth:"150px"}}>Remarks</th>
             <th style={{minWidth:"150px"}}>Action</th>
             </tr></thead>
             <tbody style={{textAlign:"center"}}>
             {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                <tr style={{height:"44px"}}>
                  <td>{row.WH_NAME}</td>
                  <td>{row.PLANT_NAME}</td>
                  <td>{row.STORAGE_LOCATION}</td>
                  <td>{row.lotno}</td>
                  <td>{row.WheatVariety}</td>
                  <td>{row.wheatqty}</td>
                  <td>{row.wheatqty}</td>
                  <td>{row.wheatqty}</td>
                  <td><CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
                                        placeholder={" "}  
                  onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"RndSkipRemarks",index)} 
                                        form={form} id={`RndSkipRemarks_${index}`} 
                                        type="text" value={row.RndSkipRemarks}   />
                  </td>
                  <td> {row.RnDSkipEnableFlag === "1" &&
                        <Button.Ripple 
                          color="primary" 
                          type="Button" 
                          onClick={(e) => {ActionEntry(row.sub_lot_id, index , 1);}}>Skip
                        </Button.Ripple>
                        }{row.RnDSkipEnableFlag === "0" && moment(row.RndSkipDate).format(dateFormat)}
                  </td>
              </tr>
                  ))}  
            </tbody>
          </table>
        </div>

             
     
        </Col>
      </Row> 
    </Fragment>
  )
} 

const RndSkipScreenData = () => { 
    const history = useHistory();
    const {showLoader , hideLoader} = useLoader(); 
    const dateFormat = "DD-MM-YYYY";
    const today = moment().format(dateFormat);
    const [ImgData, setImgData] = useState({}); 
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
    const OnSubmit_Tab = () =>{
      let CheckList = form.values;
      let FrmData = { 
        CheckList
      /*  CheckList,
        WarehouseId:form.values.warehouseid,
        PlantId:form.values.locationid,
        LotId:form.values.lotid,
        WheatVarietyid:form.values.wheatvarietyid,*/

  
      };
     
   console.log("sample");
  
      let postdata = {
       
        Data:FrmData,
       
      }
      apiPostMethod(apiBaseUrl + "warehouse/RndlotConversion/saveendConversion", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId=data.success;
          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
   
            
              history.push("/warehouse/RndConversionEntry");
              window.location.reload();
           
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
         // hideLoader();
        });
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
    const onSubmit = () => { 
     
      let CheckList = form.values;
      let FrmData = { 
        CheckList
      /*  CheckList,
        WarehouseId:form.values.warehouseid,
        PlantId:form.values.locationid,
        LotId:form.values.lotid,
        WheatVarietyid:form.values.wheatvarietyid,*/

  
      };
     
   console.log("sample");
   
   let postdata = new FormData();
    /*let i=0;
      let pvd = form.values.CheckList.map((item) => {
        const nitem = { ...item};
        if(nitem["Param_Attach_attach"]!=""){
          FileArray.append("files[]", nitem["Param_Attach_attach"]);
        }
        
        
        i++;

      delete nitem.Param_Attach_attach;
        
      
      return nitem;
      });*/
      let ShowError=0;
      for(let i=0;i<form.values.CheckList.length;i++){
        showError('Error_'+i,'',0);
        console.log(JSON.stringify(form.values.CheckList[i]));
        console.log(form.values.CheckList[i].parametertype);
        if(form.values.CheckList[i].parametertype=="1" && form.values.CheckList[i].validationrequired=="1" && form.values.CheckList[i].ParamValue==""){
          showError('Error_'+i,'Enter the Value',1);
          ShowError=1;
        }
        if(form.values.CheckList[i].parametertype=="2" && form.values.CheckList[i].attachmentrequired=="1" && form.values.CheckList[i].attachmentmandatory=="1" && form.values.CheckList[i].Param_Attach==""){
          showError('Error_'+i,'Upload Image',1);
          ShowError=1;
        }
       
       
        
      }
      if(ShowError==1){
        return false;
      }
      let FileSaveUrl=uploadUrl;
      let AttachFile=0;
      for(let i=0;i<form.values.CheckList.length;i++){
        
        if(form.values.CheckList[i]["Param_Attach_attach"]!=""){
          postdata.append("file[]", form.values.CheckList[i]["Param_Attach_attach"]);
          delete form.values.CheckList[i]["Param_Attach_attach"];
          AttachFile=1;
        }
        
      }
      postdata.append("form_name", "RnD");
      let CaptureImg=0;
      if(ImgData.length>0){
        FileSaveUrl=SaveCaptureImage;
        CaptureImg=1;
        for(let i=0;i<ImgData.length;i++){
          postdata.append("image[]", ImgData[i]);
        }
      }
      if(AttachFile==1 && CaptureImg==1){
        FileSaveUrl=uploadandSaveImageUrl;
      }
     // postdata.append("sdinfo[]", JSON.stringify(pvd));
     // console.log("  Physical stock Entry  :: "+JSON.stringify(postdata));
      //showLoader();
     // console.log("  Physical stock Entry  :: "+apiBaseUrl + "Master", postdata);
     
     apiPostMethod(FileSaveUrl, postdata, "File")
      .then((response) => {
        const { data } = response;
        if (data.success) {
          data.files.forEach((item) => {
            /*Object.keys(attachedFiles).forEach((k) => {
              if (item.orgname === attachedFiles[k].name) {
                fdata[k] = item.updname;
              }
            });*/
for(let i=0;i<data.files.length;i++){
  let ins=0;
  for(let j=0;j<form.values.CheckList.length;j++){
    if(form.values.CheckList[j].Param_Attach!="" && form.values.CheckList[j].Attachment=="" && ins==0){
      form.values.CheckList[j].Attachment=data.files[i].updname;
      ins=1;
    }
  }
}

          });
          OnSubmit_Tab();
        }
      })
      .catch((error) => {})
      .finally((a) => {
       // hideLoader();
      });
      
  

}
return (
    <Fragment>
   
      <CardComponent  header="R&amp;D Skip Screen"> 
        
     <RndSkipScreen form={form}  onSubmit={onSubmit}  ImgData={ImgData} setImgData={setImgData}  />
    
   </CardComponent> 
   
    </Fragment>
  )
}

export default RndSkipScreenData
