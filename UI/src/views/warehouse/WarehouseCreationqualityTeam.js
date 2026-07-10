import React, { Fragment, useState, useEffect } from 'react'
import { Col , Button } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, uploadUrl} from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import Uploader from "../Uploader";

const YesNoOptions = [
  {
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
];
const warehouseQCTeam = {
    warehouseid: "", 
    slocation: "",
    wh_code: "",
    warehousename: "",                        
    locationid: "",    
    lotid: "",
    lotno: "", 
    plantid: "",
    Physical_Stock_date: "", 
    Maker: "", 
    Checker: "", 
    wheatvarietyid: "",
    WheatVariety: "",
    BagType: "",
    NoOfBag: "",  
    Qty_in_MTS: "",
    Image1 : "",
    Image2: "",
    Images3: "",
    Images4: "",
    Audit_Remarks: "",
    OutBox_Indicator: "",
  }
  
  const AuditOptions = [
    {
      options: [
        { value: "Weekly", label: "Weekly" },
        { value: "15 days", label: "15 days" },
        { value: "Monthly", label: "Monthly" },
      ],
    },
  ];

const WarehouseCreationqualityTeam = ({form,onSubmit, setTitleName,isViewOnly, isEditableFlag})  => {
  if(!isViewOnly)
  {
    isViewOnly=false;
  }

    const[stockEntryformData , setStockEntryfromData] = useState({ ...warehouseQCTeam });  
    const[locationoption,setLocationoption] = useState([]);                                                                       
    const[lotoption,setLotoption] = useState([]);                                                                       


    const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        


     const[independent_gate,setindependent_gate] = useState([]);
     const [attachedFiles, setAttachment] = useState({ wh_photograph_attachment: {}, wh_photograph_attachment1: {},wh_photograph_attachment2: {}, wh_photograph_attachment3: {} });
     //setTitleName("TEST");
    const { warehouseid, warehousename,plantid,slocation ,wh_code,locationid, lotid, lotno,  Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='', sumitdisabled=false;
    
    if(isEditableFlag && (isEditableFlag==false || isEditableFlag=="false"||isEditableFlag.isEditableFlag==false))
    {
      
      sumitdisabled=true;
    }
    console.log("101 Editable, sumitdisabled",isEditableFlag, sumitdisabled) ;
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
      //form.values.wh_refid = refid;
      //form.values.wh_name = refid;
      
    showLoader();
    // console.log("Request Url :: "+apiBaseUrl + "Master/getMaster_new_warehouseDetailsById", fdata);
     apiPostMethod(apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
          wh_refid:data.results[0].wh_refid,
           wh_name:data.results[0].wh_name,
           /*locationid:data.results[0].locationid,
           lotid:data.results[0].lotid,
           Physical_Stock_date:data.results[0].Physical_Stock_date,
           Maker:data.results[0].Maker,
           Checker:data.results[0].Checker,
           Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
           BagType:data.results[0].BagType,
           NoOfBag:data.results[0].NoOfBag,
           Qty_in_MTS:data.results[0].Qty_in_MTS,
           WheatVarietyid:data.results[0].WheatVarietyid ,*/

           
           no_of_exits:data.results[0].no_of_exits,
           wall_type:data.results[0].wall_type,
           roof_type:data.results[0].roof_type,

           floor_type:data.results[0].floor_type,
           shutter_count:data.results[0].shutter_count,
           door_count:data.results[0].door_count,
           
           window_count:data.results[0].window_count,
           plinth:data.results[0].plinth,
           floor_height:data.results[0].floor_height,
           height_from_adj_land:data.results[0].height_from_adj_land,

           wh_photograph_attachment:data.results[0].wh_photograph_attachment,
           wh_photograph_attachment1:data.results[0].wh_photograph_attachment1,
           wh_photograph_attachment2:data.results[0].wh_photograph_attachment2,
           wh_photograph_attachment3:data.results[0].wh_photograph_attachment3,
           

           repair_work_remarks:data.results[0].repair_work_remarks,
           latest_audit_date:data.results[0].latest_audit_date,
           //next_audit_due_date:data.results[0].next_audit_due_date,
           
         });
         form.setFieldValue('independent_gate', {  label: data.results[0].independent_gate,value: data.results[0].independent_gate });
         form.setFieldValue('audit_type', {  label: data.results[0].audit_type,value: data.results[0].audit_type });
         /*setAttachment({           
           wh_photograph_attachment:data.results[0].wh_photograph_attachment,
          wh_photograph_attachment1:data.results[0].wh_photograph_attachment1,
          wh_photograph_attachment2:data.results[0].wh_photograph_attachment2,
          wh_photograph_attachment3:data.results[0].wh_photograph_attachment3});
          */
        // setTitleName(data.results[0].wh_name);
         sumitdisabled=false;
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
    // console.log("Request url :: "+apiBaseUrl + "Master/")
   
    const RefreshPage = () => {
      history.push(`/master/warehouseQCTeamEntry`);
    };
    const handleViewHistory = (data) => {
 
    } 
 
    const onWarehouseChange = (e) => {
      const {value, label} = e; 
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);
 }
 
 const FillPlantList  = (warehouseid) => {
   let fdata = {WH_CODE:warehouseid, screentype:"warehouseQCTeamEntry"}
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
 
 }
 const FillLotList = (lotid) => {
   let fdata ={lotid:lotid, screentype: "warehouseQCTeamEntry"} 
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
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  // Fillwheatvarity(value)
  
 } 
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
    setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
 }
 const onTextChange = (e, key) => {
  console.log(JSON.stringify(e));
form.setFieldValue(key, {  label: e.label,value: e.value });
 };

//  const ShowStock = (e) => {
//    let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
//    apiPostMethod(apiBaseUrl+'warehouse/warehouseQCTeamtaking/getwarehouseQCTeamlist',fdata)
//    .then((response) => {    
//      const {data} = response;
//      const  value = value;
//      if(data.success){ 
//        console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
 
 
//          //setshowlot({ ...stockEntryformData, lotno:value}); 
//          //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
            
//      }
//    })
//    .catch((error) => {
//      errorToast("Something went wrong, please try again after sometime")
//    }); 
 
//  }
const handleFileChange = (file, id) => {
  setAttachment((p) => ({
    ...p,
    [id]: file,
  }));
  form.setFieldValue("attachedFiles",attachedFiles);
};

const SaveQCTeamEntry = () => {

if(!form.isValid)
{
  form.setSubmitting(true);
  form.validateForm();
  return;
}
let formData = form.values;
const FrmData = { 

  independent_gate:formData.independent_gate.value,
  no_of_exits:formData.no_of_exits,
  wall_type:formData.wall_type,
  roof_type:formData.roof_type,
  floor_type:formData.floor_type,
  shutter_count:formData.shutter_count,
  door_count:formData.door_count,
  window_count:formData.window_count,
  plinth:formData.plinth,
  floor_height:formData.floor_height,
  height_from_adj_land:formData.height_from_adj_land,

  /*wh_photograph_attachment: form.values.attachedFiles.wh_photograph_attachment,
  wh_photograph_attachment1:form.values.attachedFiles.wh_photograph_attachment1,
  wh_photograph_attachment2:form.values.attachedFiles.wh_photograph_attachment2,
  wh_photograph_attachment3:form.values.attachedFiles.wh_photograph_attachment3,
  */
  
  repair_work_remarks:formData.repair_work_remarks,
  latest_audit_date:formData.latest_audit_date,
  //next_audit_due_date:formData.next_audit_due_date,
  audit_type:formData.audit_type.value,

};


let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
if (keys.length > 0) {
  let postdata = new FormData();
  let FileSaveUrl="";
  /*let {wh_photograph_attachment,wh_photograph_attachment1,wh_photograph_attachment2,wh_photograph_attachment3} = ImgData;

    postdata.append("image[]", wh_photograph_attachment);
    postdata.append("image[]", wh_photograph_attachment1);
    postdata.append("image[]", wh_photograph_attachment2);
    postdata.append("image[]", wh_photograph_attachment3);*/
   // FileSaveUrl=SaveCaptureImage;

    keys.forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
    });
    FileSaveUrl=uploadUrl;
    


    postdata.append("form_name", "Warehouse");
    postdata.append("SubFolder", "Master");
  
    showLoader();
    apiPostMethod(FileSaveUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        keys.forEach((key, i) => {
          FrmData[key] = data.files[i].updname;
        });
        SaveData(FrmData);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
}else{
SaveData(FrmData);

}

}

const SaveData=(FrmData)=>{
console.log(" Warehouse Creation Quality Item :: "+JSON.stringify(FrmData));
const postdata = {
  id:form.values.wh_refid,
  screentype:"WHQC",
  Data:FrmData
}
console.log("  Warehouse Creation Quality Item  :: "+JSON.stringify(postdata));
showLoader();
console.log("  Warehouse Creation Quality Item  :: "+apiBaseUrl + "Master", postdata);
apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseUpdate", postdata)
  .then((response) => {
    const { data } = response;
    console.log(" Response Data ::: "+JSON.stringify(response));
    
    let RespId=data.success;
    if(RespId && RespId>=1)
    {
      ShowToast("Saved Successfully...");

      // history.push("/warehouse/wclqc");

      // setTimeout(() => history.push("/warehouse/wclqc"), 3000);
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
    history.push("/warehouse/wclqc");
  });

}

/*
const isFilledAll = () => {
  
  showError('independent_gate_Error','Independent gate should not be empty',0);
  showError('no_of_exits_Error','Select plantid',0);
  showError('wall_type_Error','Select LotNumber',0);
  showError('roof_type_Error','Select WheatVariety',0);
  showError('floor_type_Error','Select ToLotNumber',0);
  showError('shutter_count_Error','Select BagType',0);
  showError('door_count_Error','Enter NoOfBags',0);

  showError('window_count_Error','Enter Window Count',0);
  showError('plinth_Error','Select Plinth',0);
  showError('floor_height_Error','Enter Floor Height',0);
  showError('height_from_adj_land_Error','Select Height from Adj.Land',0);
  
  showError('repair_work_remarks_Error','Enter Repair Work remarks',0);
  showError('latest_audit_date_Error','Enter Latest Audit date',0);
  showError('audit_type_Error','Enter Audit type',0);
  
  
  let formData=form.values;
  console.log(JSON.stringify(form.values));
  let ShowError=0;
  if(!formData.WareHouse) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
  if(!formData.plantid ) { showError('plantid_Error','Select Plant',1); ShowError =1; }
  if(!formData.LotNumber ) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
  if(!formData.WheatVariety ) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
  if(!formData.ToLotNumber ) { showError('ToLotNumber_Error','Select To Lot Number',1); ShowError =1; }
  if(!formData.BagType ) { showError('BagType_Error','Select Bag Type',1); ShowError =1; }
  if(!formData.NoOfBags) { showError('NoOfBags_Error','Enter No Of Bags',1);ShowError =1; }
  if(!formData.QtyinMTS) { showError('QtyinMTS_Error','Enter Qty in MTS',1);ShowError =1; }
  if(!formData.RelottingVendor ) { showError('RelottingVendor_Error','Select Relotting Vendor',1); ShowError =1; }
  if(!formData.RelottingCharges) { showError('RelottingCharges_Error','Enter Relotting Charges',1);ShowError =1; }
  if(!formData.RelottingReason ) { showError('RelottingReason_Error','Select Relotting Reason',1); ShowError =1; }
  
  console.log("test");
  if(!attachedFiles.WeightmentSlip.name && ImgData.WeightmentSlip_C==null && formData.QtyinMTS > 5){  
   showError("WeightmentSlip_Error","Upload Wheighment Slip",1);
   ShowError =1;
  }
  if(!attachedFiles.BeforeImage.name && ImgData.BeforeImage_C==null){  
    showError("BeforeImage_Error","Upload Before Photo",1);
    ShowError =1;
   }
   if(!attachedFiles.AfterImage.name && ImgData.AfterImage_C==null){  
    showError("AfterImage_Error","Upload After Photo",1);
    ShowError =1;
   }
  
  if(ShowError==1){return true;}
  }*/
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
    document.getElementById(Id).innerHTML="";
    if(show==1){
    console.log("SHOW ERROR:"+Id);
    document.getElementById(Id).innerHTML=Msg;
    }
    }
    }

    return (
        <Fragment> 
            <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px"}}> 
            <h6 className='text-primary' text-primary>Godown Condition Info</h6>
            <Row> 
                <Col md="2" sm="12">
                {/* <Label>Independent Gate</Label>
           <Select  
           form={form} id="independent_gate"   
           onChange={""}     />  */}
           <CustomDropdownInput 
           form={form} 
           onChange={(e) => onTextChange(e, "independent_gate")} options={YesNoOptions}
           label={"Independent Gate"} id="independent_gate" isDisabled={sumitdisabled}/>
           <span id="independent_gate_Error" style={{color: "red"}} ></span>
           <CustomTextInput form={form} id="wh_name" type="hidden"  />
                 <CustomTextInput form={form} id="wh_refid" type="hidden"  />
           </Col>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"No of Exits"} form={form} id="no_of_exits" type="Number" 
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                     />
                    <span id="no_of_exits_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Wall Type"} form={form} id="wall_type" type="text"  
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                    />
                    <span id="wall_Type_Error" style={{color: "red"}} ></span>
                    </Col>

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Roof Type"} form={form} id="roof_type" type="text"  
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                    />
                    <span id="roof_type_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Floor Type"} form={form} id="floor_type" type="text" 
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                     />
                    <span id="floor_type_Error" style={{color: "red"}} ></span>

                    </Col>
                </Row>  
        
                <Row>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Shutter Count"} form={form} id="shutter_count" type="Number"  
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                    /> 
                    <span id="shutter_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Door Count"} form={form} id="door_count" type="Number" 
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                     />  
                    <span id="door_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Window Count"} form={form} id="window_count" type="Number"  
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                    /> 
                    <span id="window_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Plinth"} form={form} id="plinth" type="text" 
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) }  />
                    <span id="plinth_Error" style={{color: "red"}} ></span>
                    
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Floor Height"} form={form} id="floor_height" type="text"  
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                    /> 
                    <span id="floor_height_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row> 
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"100px",width:"80rem",marginTop:"20px"}} >
                 <Row>  
                     <Col md="2" sm="12">
                     <CustomTextInput label={"Height From Adjacent Land"} form={form} id="height_from_adj_land" type="text"  
                     disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                     />
                     <span id="height_from_adj_land_Error" style={{color: "red"}} ></span>
                     </Col>   
                   
                   <Col md="2" sm="12" className="d-flex flex-column  justify-content-start">
                   {/*<CustomTextInput label={<p>Warehouse Photograph
                     <span className='text-danger'>*</span></p> } form={form} id="" type="file"  /> 
                   */}
                   <Uploader 
                    title={"Pdf"} 
                    isReadOnly={sumitdisabled}
                    form={form} 
                    label={"Warehouse Photograph"} 
                    id={"wh_photograph_attachment"} 
                    setAttachment={handleFileChange}
                     
                    selectedFileName={attachedFiles.wh_photograph_attachment.name} 
                    />
   {/* Mohan Commented on 05112022 selectedFileNameOLD05112022={form.values.wh_photograph_attachment} */}
   
                   {/* <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple> */}
                   <span id="wh_photograph_attachment_Error" style={{color: "red"}} ></span>
                   </Col>

                   <Col md="2" sm="12" className="d-flex flex-column  justify-content-start">
                   {/*<CustomTextInput label={<p>Attachment 1</p> } form={form} id="wh_photograph_attachment1" type="file" />*/}
                   
                   <Uploader 
                    title={"Pdf"} 
                    isReadOnly={sumitdisabled}
                    form={form} 
                    label={"Warehouse Photograph"} 
                    id={"wh_photograph_attachment1"} 
                    setAttachment={handleFileChange}
                    
                    selectedFileName={attachedFiles.wh_photograph_attachment1.name} 
                    />
{/* Mohan Commented on 05112022 selectedFileNameOLD05112022={form.values.wh_photograph_attachment1}  */}
                   {/* <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple> */}
                   </Col>
                   
                   <Col md="2" sm="12" className="d-flex flex-column  justify-content-start">
                   {/*<CustomTextInput label={<p>Attachment 2</p>} form={form} id="wh_photograph_attachment2" type="file" /> */}
                   
                   <Uploader 
                    title={"Pdf"} 
                    isReadOnly={sumitdisabled}
                    form={form} 
                    label={"Warehouse Photograph"} 
                    id={"wh_photograph_attachment2"} 
                    setAttachment={handleFileChange}
                    
                    selectedFileName={attachedFiles.wh_photograph_attachment2.name} 
                    />
{/*Mohan Commented on 05112022 selectedFileNameOLD05112022={form.values.wh_photograph_attachment2}  */}
                   {/* <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple>  */}
                   </Col>

                   <Col md="2" sm="12" className="d-flex flex-column  justify-content-start">
                   {/*<CustomTextInput label={<p>Attachment 3</p>} form={form} id="wh_photograph_attachment3" type="file" /> */}
                   <Uploader 
                    title={"Pdf"} 
                    isReadOnly={sumitdisabled}
                    form={form} 
                    label={"Warehouse Photograph"} 
                    id={"wh_photograph_attachment3"} 
                    setAttachment={handleFileChange}
                    
                    selectedFileName={attachedFiles.wh_photograph_attachment3.name} 
                    />
{/*Mohan Commented on 05112022 selectedFileNameOLD05112022={form.values.wh_photograph_attachment3}  */}
                   {/* <Button.Ripple color="primary"  type="Button" >Capture</Button.Ripple>  */}
                   </Col>
                     
                </Row>   
                </div> 
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Repair Work Info</h6> 

                <Row className="p-1">
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Remarks"} form={form} id="repair_work_remarks" type="text" 
                    disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } 
                     /> 
                    <span id="repair_work_remarks_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row> 
                </div> 
                <div style={{border:"2px solid #7367f0",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Audit Info</h6>
                <Row className="p-1">
                    <Col md="4" sm="12">
                    <CustomTextInput disabled={sumitdisabled && ((sumitdisabled==true && "true")|| (sumitdisabled==false && "false")) } label={"Latest Audit Date"} form={form} id="latest_audit_date" type="Date"  /> 
                    <span id="latest_audit_date_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="4" sm="12">
                    <CustomDropdownInput  form={form} label={"Audit Type"} 
            id="audit_type" isDisabled={sumitdisabled}
            onChange={(e) => onTextChange(e, "audit_type")} options={AuditOptions}
            /> 
            <span id="audit_type_Error" style={{color: "red"}} ></span>
                    {/*label={"Next Audit Due Date"}*/}
                    <CustomTextInput style={{display:"none"}}  form={form} id="next_audit_due_date" type="hidden"  /> 
                    <span id="next_audit_due_date_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <div className="p-2"> <Button.Ripple color="primary"  type="Button" >Audit Info</Button.Ripple></div>
                   
                </Row> 
                </div>  
            {console.log("isViewOnly Value : "+ JSON.stringify(isViewOnly))}    
         {isViewOnly=="false" && <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         {sumitdisabled==false && 
         <Button.Ripple color="primary" isDisabled={sumitdisabled} type="Button" onClick={(e) => SaveQCTeamEntry()} >
          Submit
          </Button.Ripple>
          }
          </div>
         </div>}
</div>
        </Fragment>
    )
} 
const WarehouseCreationqualityTeamData = ({isViewOnly, isEditFlag})  => { 
    if(!isViewOnly)
    {
      isViewOnly=false;
    }
    let isEditableFlag=true;
    if(isEditFlag && isEditFlag.isEditFlag)
    {
      isEditableFlag=isEditFlag.isEditFlag;
    }
    else if(isEditFlag)
    {
      isEditableFlag=isEditFlag;
    }

    console.log("VIEW,EDIT",isEditableFlag, isEditFlag);
  const history = useHistory();
  const {showLoader , hideLoader} = useLoader(); 
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  
  const {titleName, setTitleName} =useState("");
  const isToday = (data) => {
    return moment(data).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({

      independent_gate:validation.required({ message:"Independent gate should not be empty", isObject:true }),
      no_of_exits: validation.required({  message:"No Of Exits should not be empty",isObject: false }),
      wall_type: validation.required({ message:"Wall Type should not be empty", isObject: false }),
      roof_type: validation.required({  message:"Roof Type should not be empty",isObject: false }),
      floor_type: validation.required({  message:"Floor Type should not be empty",isObject: false }),
      shutter_count: validation.required({  message:"Shutter Count should not be empty",isObject: false }),
      door_count: validation.required({ message:"Door Count should not be empty", isObject: false }),
      window_count: validation.required({ message:"Window Count should not be empty", isObject: false }),
      plinth: validation.required({ message:"Plinth should not be empty", isObject: false }), 
      floor_height: validation.required({ message:"Floor Height should not be empty", isObject: false }), 
      height_from_adj_land: validation.required({ message:"height from adj land should not be empty", isObject: false }), 
    //  wh_photograph_attachment: validation.required({ message:"WH Photograph Attachment should not be empty", isObject: true }), 
    //  wh_photograph_attachment1: validation.required({ message:"WH Photograph Attachment1 should not be empty", isObject: true }), 
    //  wh_photograph_attachment2: validation.required({ message:"WH Photograph Attachment2 should not be empty", isObject: true }), 
    //  wh_photograph_attachment3: validation.required({ message:"WH Photograph Attachment3 should not be empty", isObject: true }), 
      repair_work_remarks: validation.required({ message:"Repair Work Remarks should not be empty", isObject: false }), 
      latest_audit_date: validation.required({ message:"Latest Audit Date should not be empty", isObject: false }), 
      //next_audit_due_date: validation.required({ message:"Next Audit Due Date should not be empty", isObject: false }), 
      audit_type: validation.required({ message:"Audit Type should not be empty", isObject: true }), 
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

      independent_gate:formData.independent_gate.value,
      no_of_exits:formData.no_of_exits,
      wall_type:formData.wall_type,
      roof_type:formData.roof_type,
      floor_type:formData.floor_type,
      shutter_count:formData.shutter_count,
      door_count:formData.door_count,
      window_count:formData.window_count,
      plinth:formData.plinth,
      floor_height:formData.floor_height,
      height_from_adj_land:formData.height_from_adj_land,

      /*wh_photograph_attachment: form.values.attachedFiles.wh_photograph_attachment,
      wh_photograph_attachment1:form.values.attachedFiles.wh_photograph_attachment1,
      wh_photograph_attachment2:form.values.attachedFiles.wh_photograph_attachment2,
      wh_photograph_attachment3:form.values.attachedFiles.wh_photograph_attachment3,*/
      
      repair_work_remarks:formData.repair_work_remarks,
      latest_audit_date:formData.latest_audit_date,
      //next_audit_due_date:formData.next_audit_due_date,
      audit_type:formData.audit_type.value,

    };

    /*
    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    if (keys.length > 0) {
      let postdata = new FormData();
      let FileSaveUrl="";
      /*let {wh_photograph_attachment,wh_photograph_attachment1,wh_photograph_attachment2,wh_photograph_attachment3} = ImgData;

        postdata.append("image[]", wh_photograph_attachment);
        postdata.append("image[]", wh_photograph_attachment1);
        postdata.append("image[]", wh_photograph_attachment2);
        postdata.append("image[]", wh_photograph_attachment3);* /
       // FileSaveUrl=SaveCaptureImage;
    
        keys.forEach((key) => {
          postdata.append("file[]", attachedFiles[key]);
        });
        FileSaveUrl=uploadandSaveImageUrl;
        
    

        postdata.append("form_name", "Warehouse");
        postdata.append("SubFolder", "Master");
      
        showLoader();
        apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            keys.forEach((key, i) => {
              FrmData[key] = data.files[i].updname;
            });
            SaveData(FrmData);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }else{
    SaveData(FrmData);
    
    }
*/
  }

  const SaveData=(FrmData)=>{
    console.log(" Warehouse Creation Quality Item :: "+JSON.stringify(FrmData));
    const postdata = {
      id:FrmData.wh_refid,
      screentype:"WHQC",
      Data:FrmData
    }
    console.log("  Warehouse Creation Quality Item  :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Warehouse Creation Quality Item  :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseUpdate", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
 
          history.push("/warehouse/wclqc");
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
         <CardComponent header={"Warehouse Creation Quality Team "}>
         <WarehouseCreationqualityTeam  form={form} onSubmit={onSubmit} isEditableFlag={isEditableFlag} isViewOnly="false" titleName={setTitleName} />
        </CardComponent>
        </Fragment>
    )
} 

export default WarehouseCreationqualityTeamData
