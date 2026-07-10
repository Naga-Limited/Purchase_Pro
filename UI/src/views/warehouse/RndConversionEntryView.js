import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,FormGroup,Button, ButtonToggle } from 'reactstrap'
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
  

const RndLotConversionEntryView = ({form,fnBack,ImgData,setImgData}) => { 
    const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
    const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
    const[locationoption,setLocationoption] = useState([]);                                                                       
    const[lotoption,setLotoption] = useState([]);                                                                       
    const[wheatvarietyidoption,setwheatvarietyidoption] = useState([]);                                                                  
    const dateFormat = "DD-MM-YYYY";
    const today = moment().format(dateFormat);
 
    const { warehouseid, locationid} = stockEntryformData;
    const history = useHistory();
    
    let { pwarehouseid,pplantid,plotid,psublotid, pwheatvarietyid,pQaNo } = useParams();

    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
      if(psublotid){
        //onFetchStockentryById();
        showParameterDet(pwarehouseid,pplantid,plotid,psublotid,pwheatvarietyid,pQaNo);
 
      }
    }, [pwarehouseid,pplantid,plotid,psublotid,pwheatvarietyid]);
    /*
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
     
    }; */
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
   FillLotList(value)
 
 }
 const FillLotList = (plant) => {
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
 const OnLotChange = (e) => {
   const {value, label} = e; 
   form.setFieldValue('lotid', {  label: label,value: value });
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 

   FillWheatVarityList(value)
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

const onTextChange = (e,PKey, CheckList,Val) => {

  for(let i=0;i<CheckList.length;i++){
    if(CheckList[i].rnd_lot_parametermasterid==PKey){
        
        if(Val=="ParamValue"){
          CheckList[i].ParamValue=e.target.value;
          //CheckList[i].sVendorNamelabel=e.label;
        }
        
        
        
        
    }
  }
  console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
}
 const showParameterDet = (warehoseid,plantid,lotid,sublotid, wheatvarietyid,QaNo) => {
  let Data={warehouseid:{value:warehoseid},
  plantid:{value:plantid},
  lotid:{value:lotid},
  sublotid:{value:sublotid},
  QaNo:QaNo,
  wheatvarietyid:{value:wheatvarietyid}
};
  let fdata = {
    sub_lot_id:sublotid,
  Screen:"FUMIGATIONSTATUS",
  Data
  };
showLoader();
 console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
 apiPostMethod(apiBaseUrl + "warehouse/RndlotConversion/getRndDetail", fdata)
 .then((response) => {
   const { data } = response;
   console.log("Response Data :: "+JSON.stringify(response));
   if (data.success) {
     form.setValues({
       
      ...form.values,
    CheckList:data.results,
    RndDet:data.RndDet,
    PvsRnd:data.PvsRndCount,
    PvsRndIDs:data.PvsRndID,

    warehouseid:data.PvsRndID[0] ? data.PvsRndID[0].warehousename:"",
locationid:data.PvsRndID[0]?data.PvsRndID[0].plant_name:"",
lotid:data.PvsRndID[0]?data.PvsRndID[0].lotno:"",
wheatvarietyid:data.PvsRndID[0] ? data.PvsRndID[0].WheatVariety:"",
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
    //setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
 }
 
 /*const ShowStock = (e) => {
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
 
 }*/
    
    return (
        <Fragment>

        <Row > 
           

        <Col md="3" sm="12" >
          <Label>Warehouse</Label>
        <CustomTextInput  form={form} id="warehouseid"  type="text" disabled   />
        
          </Col>
         
         
      
        <Col md="3" sm="12"> 
           <Label>Plant</Label>
           <CustomTextInput  form={form} id="locationid"  type="text"  disabled  />
           </Col>
           <Col md="3" sm="12"> 
           <Label>Lot No</Label>
           <CustomTextInput  form={form} id="lotid"  type="text" disabled   />
           </Col>
           <Col md="3" sm="12"> 
           <Label>Wheat Variety</Label>
           <CustomTextInput  form={form} id="wheatvarietyid"  type="text"  disabled  />
           </Col>
              
        </Row> 
        
        
          
              
        <div style={{width:"970px",overflowX:"scroll",fontSize:"12px"}}>
        <table id="TableID" className='table-sm' style={{float:"left",width:"38%"}} > 
            <thead className='bg-primary text-white'   style={{height:"50px",textAlign:"center"}} > 

                <tr> 
                
                    <th >QA No</th> 
                    <th >Warehouse</th> 
                    <th >Plant</th> 
                    <th >Parameter</th>
                   
                   
                  

                 
                </tr>
            </thead> 
            <tbody style={{textAlign:"center"}}>
              {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                <tr style={{height:"60px"}}>
                   <td>{row.QaNo}</td> 
                   <td>{form.values.warehouseid}</td> 
                   <td>{form.values.locationid}</td>  
                   <td style={{textAlign:"left"}}>{row.parametername}</td> 
                   
                </tr>
                  ))}  
            </tbody>
         </table> 
         <table id="TableID2"  className='table-sm' style={{width:"60%"}} > 
            <thead className='bg-primary text-white' style={{height:"50px",textAlign:"center"}} > 

                <tr> 

            {form.values.PvsRndIDs && form.values.PvsRndIDs.map((row, index) => ( 
                    <th >{row.RndDt}<br></br>{row.keyloandoqty}</th> 
                  
                    ))}        
                  

                 
                </tr>
            </thead> 
            <tbody style={{textAlign:"center"}}>
              {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                <tr style={{height:"60px"}}>
                  
                   {form.values.PvsRndIDs && form.values.PvsRndIDs.map((row1, index1) => ( 
                   <>
                   
                   {form.values.RndDet && form.values.RndDet.map((row2, index2) => ( 
 <>
                   {row2.rnd_lot_conversion_id==row1.rnd_lot_conversion_id && row2.ParamId==row.rnd_lot_parametermasterid
                    && <td>
                      
                      {row2.parametertype=="2" ? row2.Attachment!="" ?<Uploader isReadOnly={true} selectedFileName={row2.Attachment} />: "" : <input type={"text"} style={{width:"100px"}} value={row2.ParamValue} disabled></input>}
                      
                    </td>}
                   {/*row2.rnd_lot_conversion_id!=row1.rnd_lot_conversion_id && row2.ParamId!=row.rnd_lot_parametermasterid && <td><input type={"text"}  disabled></input></td>*/}

                   </>
                    ))} 
</>
                    ))}  
                  
                </tr>
                  ))}  
            </tbody>
         </table>  
        </div>
     
        
        <Row>
        <Col md="6" sm="12">
          
<br></br>
<br></br>
</Col>
      <Col sm="12">
      <FormGroup className="d-flex justify-content-end mb-0">
      <Button.Ripple color="primary" type="button" onClick={(e) => fnBack()}>
                Back
              </Button.Ripple>
              </FormGroup>
  </Col>
  
     </Row>

         
            </Fragment>
    )
} 
const RndLotConversionEntryViewData = () => { 
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
      fnBack(values) {},
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
    const fnBack = () => { 
      history.push(`/warehouse/RndConvertedStockViewSummary`); 
      
  

}
return (
    <Fragment>
   
      <CardComponent  header="R&amp;D Lot Converted Stock Entry View"> 
        
     <RndLotConversionEntryView form={form}  fnBack={fnBack}  ImgData={ImgData} setImgData={setImgData}  />
    
   </CardComponent> 
   
    </Fragment>
  )
}

export default RndLotConversionEntryViewData
