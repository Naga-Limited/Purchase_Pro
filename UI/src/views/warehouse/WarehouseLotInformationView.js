import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle,FormGroup } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl,SaveCaptureImage,uploadUrl,SERVER_URL } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { Paperclip } from "react-feather";
import CaptureImage from "../CaptureImage";
import CSVUploader from "../CSVUploader";
import {  LotCreationUrl } from "../../urlConstants";
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
import { ToggleLeft,X } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
import {ExportToCsv} from 'export-to-csv';
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
const WarehouseLotInformationView = ({form,onSubmit}) => {
  const [ItemDetListData, setItemDetListData] = useState([]);  
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
    const [ImgData, setImgData] = useState({});
    const [attachedFiles, setAttachment] = useState({ warehouselayout: {},BulkQC:{} });
    const showError = (Id,Msg,show) => {
      if(document.getElementById(Id)) { 
        document.getElementById(Id).innerHTML="";
      if(show==1){
        console.log("SHOW ERROR:"+Id);
      document.getElementById(Id).innerHTML=Msg;
      }
    }
    }
      
    const UpdateFile = (FilePath) => {
      let postdata={
        LotCreationFilePath:FilePath
      }
      showLoader();
      apiPostMethod(apiBaseUrl + "warehouse/master/lotCreationBulkUpload", postdata)
        .then((response) => {
          const { data } = response;
          if(data.success==0){
            errorToast("Invalid Warehouse");
            return false;
          }
          console.log(JSON.stringify(response));
          window.location.reload();
          
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }
  const UploadcsvFile = () => {
 
   
  // return false;
    let postdata = new FormData();
    Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
    });
    showLoader();
    apiPostMethod(uploadUrl, postdata, "File")
      .then((response) => {
        const { data } = response;
        if (data.success) {
         /* data.files.forEach((item) => {
            Object.keys(attachedFiles).forEach((k) => {
              if (item.orgname === attachedFiles[k].name) {
                fdata[k] = item.updname;
              }
            });
          });*/
          let FileName=SERVER_URL+"/api/"+data.files[0].updname_OLDSERVER;
          UpdateFile(FileName);

        }
      })
      .catch((error) => {})
      .finally((a) => {
        hideLoader();
      });
  };

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0].size > 5242880) {
        errorToast("File Size is too Large. Please try again with less than 5Mb");
      } else {
        let _filesarr = {
          ...attachedFiles,
          [e.target.id]: e.target.files[0],
        };
        setAttachment(_filesarr);
      }
    };
    const fileUploadAction = () => {
      document.getElementById("warehouselayout").click();
    };
    const isFilledAll = () => {
      showError('WareHouse_Error','Select WareHouse',0);
      showError('Storage_Location_Error','Enter Storage_Location',0);
      showError('Lot_Number_Error','Enter Lot_Number',0);
      showError('Total_Capacity_Error','Enter Total Capacity',0);
      
      showError('Max_Capacity_Error','Enter Max_Capacity',0);
      showError('Length_Error','Enter Length',0);
      showError('Breadth_Error','Enter Breadth',0);
      showError('Height_Error','Enter Height',0);
      showError('Total_sqft_Error','Enter Total_sqft',0);
      

      let ShowError=0;
      let formData=form.values;
      if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
      if(!formData.Storage_Location) { showError('Storage_Location_Error','Enter Storage Location',1);  ShowError =1; }
      if(!formData.Lot_Number) { showError('Lot_Number_Error','Enter Lot Number',1);  ShowError =1; }
      if(!formData.Total_Capacity) { showError('Total_Capacity_Error','Enter Total Capacity',1);  ShowError =1; }
      
      if(!formData.Max_Capacity) { showError('Max_Capacity_Error','Enter Max Capacity',1);  ShowError =1; }
      if(!formData.Length) { showError('Length_Error','Enter Length',1);  ShowError =1; }
      if(!formData.Breadth) { showError('Breadth_Error','Enter Breadth',1);  ShowError =1; }
      if(!formData.Height) { showError('Height_Error','Enter Height',1);  ShowError =1; }
      if(!formData.Total_sqft) { showError('Total_sqft_Error','Enter Total Sqft',1);  ShowError =1; }
      
if(ShowError==1){return true;}
    }
    const exportSample = () =>{
   
   
      var arr=[{}];
      const options={
        fieldSeperator:',',
        quoteStrings:"",
        decimalSeparator:".",
        showLabels:true,
        showTitle:false,
      
        filename:"LotCreation",
        useTextFile:false,
        useNom:true,
        userKeysAsHeaders:false,
        headers:['Warehouse','Storage Location','Lot Number','Total Capacity','Max Capacity','Length','Breadth','Height']
      }
      const csvExporter= new ExportToCsv(options);
      csvExporter.generateCsv(arr);
   
     }
    const onAdd = () => {
      console.log("add");
      if(isFilledAll()){
        return false;
      }

      let vd = [];
      vd = [...ItemDetListData];
      vd.push(form.values);
      setItemDetListData(vd);
      
    
      form.setValues({
       
        Storage_Location:"",
        Lot_Number:"",
        Total_Capacity:"",
        Max_Capacity:"",
        Length:"",
        Breadth:"",
        Height:"",
        Total_sqft:"",
        
         
        
       })
       form.setFieldValue('WareHouse', {  label: "",value: "" });
     
    };                                                                     
 
 
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
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
    console.log("Request Url :: "+apiBaseUrl + "Master/getstockEntrydatabyid", fdata);
     //apiPostMethod(apiBaseUrl + "Master/getstockEntrydatabyid", fdata)
     apiPostMethod(apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseLotDetById", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         setItemDetListData(data.results);
         /*form.setValues({
           wh_refid:data.results[0].wh_refid,
           wh_code:data.results[0].wh_code,
           wh_name:data.results[0].wh_name,
           whaddress:data.results[0].whaddress,
           street:data.results[0].street,
           district:data.results[0].district,
           whpincode:data.results[0].whpincode,
             
           plantid:data.results[0].plantid,
           plantname:data.results[0].plantname,
           locationid:data.results[0].locationid,
           locationname:data.results[0].locationname,

           lotno:data.results[0].lotno,
           maxcapacity:data.results[0].maxcapacity,
           totalcapacity:data.results[0].totalcapacity,
           length:data.results[0].length,
           breadth:data.results[0].breadth,
           height:data.results[0].height,
           totalsqft:data.results[0].totalsqft,

         })*/
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
     /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);*/
      form.setFieldValue('WareHouse', {  label: label,value: value });
 }
 const onSave = () => {
  let {QCDocument} = ImgData;
  if(ItemDetListData.length<=0){
    errorToast("Something went wrong, Please Enter atleast one Entry");
    return false;

  }
 
  let FileSaveUrl="";
  let postdata = new FormData();
 
  let fdata = {
   ItemDetListData,
   formType:"SaveLotInformation"
  };
  
  if(QCDocument){
    postdata.append("image[]", QCDocument);
    FileSaveUrl=SaveCaptureImage;
    }else{
      let UploadFile=0;
    Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
     
      
    });
    UploadFile = attachedFiles.warehouselayout && attachedFiles.warehouselayout.name && attachedFiles.warehouselayout.name.length ? true : false;
    postdata.append("form_name", "Lot");
  //  postdata.append("ponumber", ZPO_NUMBER);
    //postdata.append("VA_Number", ZVA_NUMBER);
    postdata.append("SubFolder", "");
    FileSaveUrl=uploadUrl;
    if(UploadFile==false){
      FileSaveUrl=""
    }
  }
   
    showLoader();

    if(FileSaveUrl==""){
      apiPostMethod(LotCreationUrl, fdata)
      .then((response) => {
        if (response.data.success) {
          history.push(`/warehouse/WarehouseLotInformationView`);
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      });
    }else{
    apiPostMethod(FileSaveUrl, postdata, "File")
      .then((response) => {
        const { data } = response;
        if (data.success) {
          fdata.warehouselayout = data.files[0].updname;
          apiPostMethod(LotCreationUrl, fdata)
      .then((response) => {
        if (response.data.success) {
          history.push(`/warehouse/WarehouseLotInformationView`);
          window.location.reload();
        }
      })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            });
        } else {
          errorToast(data.files[0].orgname + " file format is not supported ");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    }
    
     /* apiPostMethod(LotCreationUrl, fdata)
      .then((response) => {
        if (response.data.success) {
          history.push(`/warehouse/WarehouseLotInformationView`);
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      });*/
 }
 const csvhandleFileChange = (file, id) => {
  setAttachment((p) => ({
    ...p,
    [id]: file,
  }));
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

const deleteForm = (index) => {
  let vdata = [...ItemDetListData];
  vdata.splice(index, 1);
  setItemDetListData(vdata);
};

const Calctotal = (e,field) =>{
  // console.log(e.target.value);
   if(isNaN(e.target.value)){return false; }
   let lenght=0,breadth=0,height=0;
   if(field=="l") { lenght=e.target.value; } else {lenght=form.values.Length ? form.values.Length : 0}
   if(field=="b") { breadth=e.target.value; } else {breadth=form.values.Breadth ? form.values.Breadth : 0}
   if(field=="h") { height=e.target.value; } else {height=form.values.Height ? form.values.Height : 0}

   let TotalSqft=lenght*breadth*height;
   if(field=="l") {
   form.setValues({
     ...form.values,
     Length:e.target.value,
     Total_sqft:TotalSqft
   })
  }
  if(field=="b") {
    form.setValues({
      ...form.values,
      Breadth:e.target.value,
      Total_sqft:TotalSqft
    })
   }
   if(field=="h") {
    form.setValues({
      ...form.values,
      Height:e.target.value,
      Total_sqft:TotalSqft
    })
   }
   //console.log(JSON.stringify(form.values));
 }
 const onPlantchange = (e) => {
   const {value,label} = e; 
   setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value)
 
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
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  // Fillwheatvarity(value)
  
 } 
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
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

 const onApproveReject = (e) => { 
  history.push(`/warehouse/WarehouseCreationCommercialTeam:`+refid);
}

const onSubmitApproveReject = (approve, reject) => { 
  console.log("Before Submit " + form.values.approve + " " + form.values.reject+"X");
  
  /*if(!form.isValid)
  {
    form.setSubmitting(true);
    form.validateForm();
    return;
  }*/
  form.setSubmitting(true);
  const formData = form.values;

  const FrmData = { 
    RejectReason:formData.RejectReason,
  };
  const postdata = {
    id:refid,
    Data:FrmData,
    approve:approve,
    formtype:"LOTINFOGRAPPROVAL",
    reject:reject,
  }
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseApprove", postdata)
    .then((response) => {
      const { data } = response;
      console.log(" Response Data ::: "+JSON.stringify(response));
      
      let RespId=data.success;
      if(RespId && RespId>=1)
      {
        ShowToast("Saved Successfully...");

          history.push("/warehouse/wclwmmgr");
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

 let isViewonly=false;
 const { warehouselayout } = attachedFiles;
    return (
      
       <Fragment>  
             <div style={{height:"auto",width:"100%",overflowX:"auto"}}>
         {/* <div> */}
        <div class="d-flex justify-content-between pb-1">
            
        
        <div style={{overflow:"auto",  fontSize:"13px", textAlign:"left"}} >
          <table class="table-sm" border={0} style={{overflowX:"auto", width:"100px"}}>
            <thead class="bg-primary text-white">
              <tr>
                <th style={{minWidth:"130px"}}>Warehouse Name</th>
                <th style={{minWidth:"100px"}}>Storage Location</th>
                <th style={{minWidth:"100px"}}>Lot Number</th>
                <th style={{minWidth:"100px"}}>Total Capacity</th>
                <th style={{minWidth:"100px"}}>Max Capacity</th>
                <th style={{minWidth:"100px"}}>Length</th>
                <th style={{minWidth:"100px"}}>Breadth</th>
                <th style={{minWidth:"100px"}}>Height</th>
                <th style={{minWidth:"100px"}}>Area</th>
                <th style={{minWidth:"100px"}}>Row</th>
                <th style={{minWidth:"100px"}}>Column</th>
                <th style={{minWidth:"100px"}}>Action</th>
              </tr>
            </thead>
    <tbody>
      {
/*<tr>
<td style={{width:"200px"}}><CustomDropdownInput  url={`${apiBaseUrl}warehouse/master/getwarehousewithID`} 
          label={""} form={form} id="WareHouse"  onChange={onWarehouseChange} />
           <span id='WareHouse_Error' style={{color: 'red'}} ></span>
           </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Storage_Location" type="text"  />
 <span id='Storage_Location_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Lot_Number" type="text"  />
 <span id='Lot_Number_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Total_Capacity" isNumberOnly />
 <span id='Total_Capacity_Error' style={{color: 'red'}} ></span></td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Max_Capacity" isNumberOnly/>
 <span id='Max_Capacity_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Length" isNumberOnly onChange={(e) => Calctotal(e,'l')}  />
 <span id='Length_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Breadth" isNumberOnly onChange={(e) => Calctotal(e,'b')}  />
 <span id='Breadth_Error' style={{color: 'red'}} ></span>

 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Height" isNumberOnly onChange={(e) => Calctotal(e,'h')} />
 <span id='Height_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{width:"200px"}}><CustomTextInput label={""} form={form} id="Total_sqft" placeholder="L x H x B" disabled type="text"  />
 <span id='Total_sqft_Error' style={{color: 'red'}} ></span>
 </td>
 <td style={{paddingBottom:"30px", verticalAlign: "bottom"}}><Button.Ripple color="primary"   type="Button" onClick={onAdd} >Add</Button.Ripple></td>
                          </tr>*/
}
         

              {ItemDetListData && ItemDetListData.length>0 && ItemDetListData.map((item, i) => {
                return(
              <tr>  
                <td>{item.wh_name}</td>
                <td>{item.locationname}</td> 
                <td>{item.lotno}</td> 
                <td>{item.totalcapacity}</td> 

                <td>{item.maxcapacity}</td> 
                <td>{item.length}</td> 
                <td>{item.breadth}</td> 
                <td>{item.height}</td> 
                <td>{item.totalsqft}</td> 
                <td>{item.sRow}</td> 
                <td>{item.sColumn}</td> 

                <td><Button.Ripple
                      color="danger"
                      className="text-nowrap px-1 mt-75"
                      onClick={(e) => {
                        deleteForm(i);
                      }}
                      outline
                    >
                      <X size={14} className="" />
                      <span></span>
                    </Button.Ripple></td>
              
              </tr> 
             );
            })}
                   </tbody>
                   </table>
                   </div>
                   </div>
                 
          <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="BACK" type="Button">Reject</Button.Ripple>
          </div> 
          
           </div>  
          {/* <div class="d-flex flex-row justify-content-start p-2 ">
         
           <Col sm="12" md="4">
                    <FormGroup>
                      <Label for="nameMulti">Warehouse Layout</Label>
                      <br />
                      <input
                        type="file"
                        className="form-control"
                        id="warehouselayout"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChange(e);
                        }}
                        
                      />
                     

                      <span id="qcwrkdoc_Error" style={{color: "red"}} ></span>
                     
                      <Button.Ripple
                        outline
                        color="primary"
                        onClick={(e) => {
                          fileUploadAction();
                        }}
                      >
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">Attach</span>
                      </Button.Ripple>
                      <div className="align-middle ml-25">{warehouselayout.name}</div>
                      <div style={{"float":"left","marginTop":"5px"}}>
                      <CaptureImage  ImgData={ImgData} setImgData={setImgData} ItemName={"QCDocument"} />
                      </div>
                    </FormGroup>
                    
                  </Col>
                  
         
           <div className='mx-2'>
          <Button.Ripple color="primary"  type="Button"onClick={(e) => onSave()}  >
            Submit
          </Button.Ripple> 
          
          </div> 
          <div className='mx-2'>
          <Row>
      <Col md="12" sm="12"></Col>
      <Col md="4" sm="12">
      <Button.Ripple color="primary" block type="button" onClick={() => exportSample()}>
               Download Sample
     </Button.Ripple>
        </Col>
        
     <Col md="4" sm="12">
     <CSVUploader
                        setAttachment={csvhandleFileChange}
                        label={""}
                      title={"Select CSV"}
                        id={"BulkQC"}
                        style={{float:"right"}}
                        selectedFileName={attachedFiles.BulkQC.name}
                      />
        </Col>
        <Col md="4" sm="12">
      <Button.Ripple color="primary" block type="button" onClick={() => UploadcsvFile()}>
                Upload
     </Button.Ripple>
     </Col>
        </Row>
          
          </div>
                      </div>*/}
           
       </Fragment>
    )
}


const WarehouseLotInformationViewData = () => { 
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
   
              history.push("/warehouse/WarehouseLotInformationView");
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
        <CardComponent  header="Warehouse Lot Information">
     <WarehouseLotInformationView  form={form}  onSubmit={onSubmit}  />
   </CardComponent>

    </Fragment>
    )
}

export default WarehouseLotInformationViewData
