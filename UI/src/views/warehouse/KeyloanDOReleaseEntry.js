import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, SaveCaptureImage, vaUrl,uploadUrl, sapFileShare } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import {  keyLoanEntryUrl } from "../../urlConstants";
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { DarkToast, errorToast } from '../../helper/appHelper';
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
//import { ToggleLeft } from 'react-feather';
import Uploader from "../Uploader";

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
  Maker: "", 
  Checker: "", 
  wheatvarietyid: "",
 
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

 const  KeyloanDOReleaseEntry = ({form, onSubmit}) => {
   const [stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
   const [warehouseoption, setWarehouseoption] = useState([]);                                                                       
   const [locationoption,setLocationoption] = useState([]);                                                                       
   const [lotoption,setLotoption] = useState([]);                                                                       
   const [makeroption,setMakeroption] = useState([]);                                                                       
   const [checkeroption,setcheckeroption] = useState([]);                                                                         
   const [wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
   const [bagtype,setBagtypeoption] = useState([]);   
   const [WhPlantOptions, setWhPlantOptions] = useState([]);                                                                      
   const [showlot,setshowlot] = useState([]);                                                                        
   const [showwheat, setwheat] = useState([]); 
   const [WhLotOptions, setWhLotOptions] = useState([]);      
   const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);                                                               
   const [ImgData, setImgData] = useState({});
   const [attachedFiles, setAttachment] = useState({ release_letter_image: {}, bank_statement: {} });
   const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid} = stockEntryformData;
 
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
   const handleFileChange = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };
   const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
    FillStorageLocationList(value);
    ClearDropdown("PLANT");
    //FillStorageLocationFromWarehouse(value);
  };

  const onWarehouseChange_OLD = (e) => {
     const {value, label} = e; 
     setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
     FillPlantList(value);
}

const onWarehouseChange = (e) => {
  const { value, label } = e;
  
  form.setFieldValue('WareHouse', {  label: label, value: value });
  //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
  FillPlantList(value, label); 
  ClearDropdown("WH");
  //FillStorageLocationFromWarehouse(value);
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
const onLotChange = (e) => {
  const { value, label } = e;
  
  form.setFieldValue('LotNumber', {  label: label,value: value });

  FillWheatVarityList(value);
  ClearDropdown("LOT");
};

const FillStorageLocationList=(PlantId)=>{
  let fdata = { PlantId, screenType: "RND" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    //setstorageLocationOption([{ options: data.results }]);
    setLocationoption([{ options: data.results }]);

    //getLotInfo(paramLotId,type);
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
 };

const FillWheatVarityList = (paramLotId) => {
  let fdata = { lotid: paramLotId, screenType: "FUMIGATION",
  whId:form.values.WareHouse.value,
  plantid:form.values.plantid ? form.values.plantid.value:0,
  storagelocationid:form.values.storagelocationid.value
};
  apiPostMethod(apiBaseUrl+'warehouse/master/getKeyloanHWheatvarityList', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        setWhWheetVarietyOptions([{ options: data.results }]);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};

const FillPlantList  = (WH_CODE, WH_NAME) => {
  let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          console.log("Plant") ;
          setWhPlantOptions([{ options: data.results }]);
          form.setValues({
            ...form.values,
            ColleratoralManager :  data.results[0].name_of_collateral,
            Company: data.results[0].company_name,
            WareHouse: {label: WH_NAME,value: WH_CODE},
          });

          console.log("After Fetch Plant"+data.results[0].name_of_collateral) ;
          form.setFieldValue('WareHouse', {  label: WH_NAME,value: WH_CODE });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

const FillLotList = (paramPlantid) => {
  let fdata = { storagelocationId: paramPlantid, screenType: "FUMIGATION" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotListFromStorageLocation', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        setWhLotOptions([{ options: data.results }]);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};
const FillLotList_old = (paramPlantid) => {
  console.log(JSON.stringify(form.values));
  let fdata = { plantid: paramPlantid, screenType: "FUMIGATION",WHId:form.values.WareHouse.value };
  apiPostMethod(apiBaseUrl+'warehouse/master/getKeyLoanLotList', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {                                     
        setWhLotOptions([{ options: data.results }]);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};

const onWheatvarietyChange = (e) => {
  const{value, label} = e; 
  form.setFieldValue('KeyWheatVariety', {  label: label,value: value });
  getKeyloanDet(value, label);
  
}
const getKeyloanDet = (WheatVarietyId, WheatVarietyName) => {

  let fdata = { lotid: form.values.LotNumber.value,WheatVarietyId,
     screenType: "FUMIGATION",
     whId:form.values.WareHouse.value,
     plantid:form.values.plantid ? form.values.plantid.value: "",
     storagelocationid:form.values.storagelocationid.value
     };
     
  apiPostMethod(apiBaseUrl+'warehouse/Keyloan/getKeyloanData', fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        form.setValues({
          ...form.values,
          SysDate:date,
          SR_NO:data.results[0].SR_No,
          SR_Qty:data.results[0].balance_qty,
          Rate_mt:data.results[0].SR_Rate_Per_MT,

          // New Line Added Arul # 16.04.2022
          SR_Value:data.results[0].SR_Value_in_Rs,
          
          lotid:data.results[0].lotid,
          PledgeDate:data.results[0].PledgeDate,
          Company:data.results[0].Company,
          Bank_Name:data.results[0].Bank_Name,
          ColleratoralManager:data.results[0].Colleratoral_Manager,
   });
         form.setFieldValue('KeyWheatVariety', {  label: WheatVarietyName,value: WheatVarietyId });
         console.log(JSON.stringify(form.values));
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
};

const showError = (Id,Msg,show) => {
  if(document.getElementById(Id)) { 
    document.getElementById(Id).innerHTML="";
  if(show==1){
    console.log("SHOW ERROR:"+Id);
  document.getElementById(Id).innerHTML=Msg;
  }
}
}

const isFilledAll = () => {
  showError('WareHouse_Error','Select WareHouse',0);
 // showError('plantid_Error','Select plantid',0);
  showError('LotNumber_Error','Select LotNumber',0);
  showError('WheatVariety_Error','Select WheatVariety',0);
  showError('ReleaseQty_Error','Enter ReleaseQty',0);

  showError('release_letter_image_Error','Enter release_letter_image',0);
showError('bank_statement_Error','Enter bank_statement',0);




  let ShowError=0;
  let formData=form.values;
  //if(!formData.SysDate) { showError('SystmDate_Error','Enter Date',1);  ShowError =1; }
  if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Warehouse Name',1); ShowError =1; }
  if(!formData.storagelocationid || !formData.storagelocationid.value) { showError('storagelocationid_Error','Select Storage Location',1); ShowError =1; }
  if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot No',1); ShowError =1; }
  if(!formData.KeyWheatVariety || !formData.KeyWheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
  if(!formData.ReleaseQty) { showError('ReleaseQty_Error','Enter Release Qty',1);  ShowError =1; }
  
  
  if(!attachedFiles.release_letter_image.name && ImgData.ReleaseLetter_C==null){  
     
      
    showError('release_letter_image_Error','Select Release Letter Image',1);
   
    ShowError =1;
    
  }
  if( !attachedFiles.bank_statement.name && ImgData.BankStatement_C==null){  
     
      
    showError('bank_statement_Error','Select Bank Statement',1);
    ShowError =1;
    
  }
if(ShowError==1){return true;}
}

 
const DORelease = () => {
  if(isFilledAll()){
    return false;
  }


 let FormDatas=form.values;
  let fdata = {
    pledgereleasedate   :FormDatas.SysDate,
    warehouseid         :FormDatas.WareHouse.value,
    plantid             :FormDatas.plantid ? FormDatas.plantid.value : 0, /*plantid:FormDatas.plantid ? FormDatas.plantid.value : 0,*/
    locationid          :FormDatas.storagelocationid ? FormDatas.storagelocationid.value: "",
    lotno               :FormDatas.LotNumber.value,
    wheat_variety_id    :FormDatas.KeyWheatVariety.value,
    sr_no               :FormDatas.SR_NO,
    sr_qty              :FormDatas.SR_Qty,
    release_qty         :FormDatas.ReleaseQty,
    balance_qty         :FormDatas.Balance_Qty,
    sr_rate_mt          :FormDatas.Rate_mt,
    do_value            :FormDatas.Do_value,
    do_90_percent_value :FormDatas.value90,
    company             :FormDatas.Company,
    bank_name           :FormDatas.Bank_Name,
    colleratoral_manager:FormDatas.ColleratoralManager,
    lotid               :FormDatas.lotid,
    pledgedate          :FormDatas.PledgeDate,

   
    pledgereleasedate:`${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`,
    formType:"keyloanDORelease"
  };
  
  
   
  let {ReleaseLetter_C,BankStatement_C} = ImgData;


    
  let postdata = new FormData();
  let FileSaveUrl="";
  if(ReleaseLetter_C!=null && BankStatement_C!=null){
    
    postdata.append("image[]", ReleaseLetter_C);
    postdata.append("image[]", BankStatement_C);
    FileSaveUrl=SaveCaptureImage;

    postdata.append("form_name", 'KeyLoan');
   // postdata.append("ponumber", refid);
   // postdata.append("VA_Number", ZVA_NUMBER);
    postdata.append("SubFolder", "KeyLoanDORelease");

  }else{

    

    Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
    });
   
   postdata.append("form_name", 'KeyLoan');
   /// postdata.append("ponumber", refid);
   // postdata.append("VA_Number", ZVA_NUMBER);
    postdata.append("SubFolder", "KeyLoanDORelease");
    FileSaveUrl=sapFileShare;
  }
 // console.log(FileSaveUrl);
//  console.log("test");
 // return false;
  
  showLoader();
  apiPostMethod(FileSaveUrl, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        data.files.forEach((item) => {
          Object.keys(attachedFiles).forEach((k) => {
            if (item.orgname === attachedFiles[k].name) {
              fdata[k] = item.updname;
            }
          });
        });
        onSubmitDO(fdata);
      }
    })
    .catch((error) => {})
    .finally((a) => {
      hideLoader();
    });
    
  
};
const onStorageLocationchange =(e) =>{
  const {value,label} = e; 
  form.setFieldValue('storagelocationid', {  label: label,value: value });
  FillLotList(value);
  ClearDropdown("SL");

}

const onSubmitDO = (fdata) => {
  showLoader();
  apiPostMethod(keyLoanEntryUrl, fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
        ShowToast("Successfully Updated...");
        history.push(`/warehouse/KeyloanDOReleaseEntry`);
      // window.location.reload();
      setTimeout(() => window.location.reload(), 2000);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
};

const CalcBalanceQty = (e) =>{
  // console.log(e.target.value);
   if(isNaN(e.target.value)){return false; }
   let BalanceQty=form.values.SR_Qty-e.target.value;
   let Do_value=form.values.Rate_mt*e.target.value;
   let value90=Do_value*90/100;
   if(isNaN(Do_value)) {Do_value=0; value90=10;}
   if(BalanceQty<0){
    errorToast("Invalid Entry");
    return false; }
   form.setValues({
     ...form.values,
     ReleaseQty:e.target.value,
     Balance_Qty:BalanceQty,
     Do_value:Do_value,
     value90:value90
   })
   //console.log(JSON.stringify(form.values));
 }

const ResetForm = () =>
{
  form.resetForm();
}
const current = new Date();
const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

    const ClearDropdown = (Item) => {
      if (Item === "WH"){
        form.setFieldValue('plantid', '');
        form.setFieldValue('storagelocationid','');
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "PLANT"){
        form.setFieldValue('storagelocationid','');
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "SL"){
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "LOT"){
        form.setFieldValue('KeyWheatVariety', '');
      }
    }

    return (
     <Fragment>

        <Row>
            <Col md="3" sm="12" >
              <CustomTextInput  form={form} id="SysDate" label={"System Date"} type="text"  placeholder={date} disabled/>
            </Col> 

            <Col md="3" sm="12">
              <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getKeyLoanwarehouses`} 
                form={form} 
                label={"Warehouse Name"} 
                id="WareHouse" 
                options={warehouseoption} 
                onChange={onWarehouseChange} 
              />
             <span id='WareHouse_Error' style={{color: 'red'}} ></span>
            </Col> 

            <Col md="3" sm="12" >{/**Plant not in use */}
              <CustomDropdownInput 
                style={{"width":"370px"}}
                label = {"Plant"}
                form={form} 
                id="plantid"
                onChange={onPlantChange}
                options={WhPlantOptions}
              />
              <span id="plantid_Error" style={{color: "red"}} ></span>
            </Col>

            <Col md="3" sm="12"> 
            <CustomDropdownInput  
              label ={"Storage Location"}
              form={form} 
              id="storagelocationid"
              onChange={onStorageLocationchange} 
              options={locationoption}
           />
             <span id='storagelocationid_Error' style={{color: 'red'}} ></span>
          </Col>  
        </Row> 

        <Row>
          <Col md="3" sm="12"> 
            <CustomDropdownInput 
              label ={"Lot No"}
              options={WhLotOptions} 
              form={form} 
              id="LotNumber" 
              className="react-select"
              classNamePrefix="select"          
              onChange={(e) => onLotChange(e)}
            />
           <span id='LotNumber_Error' style={{color: 'red'}} ></span>
          </Col>
          
          <Col md="3" sm="12">
            <CustomDropdownInput
              label ={"Wheat Variety"}
              options={WhWheatvarietyOptions} 
              form={form} 
              id="KeyWheatVariety" 
              onChange={(e) => onWheatvarietyChange(e)}
              />
              <span id='WheatVariety_Error' style={{color: 'red'}} ></span>
          </Col> 
        
          <Col md="3" sm="12" >
              <CustomTextInput  form={form} id="SR_NO"  label={"SR No"} type="text"  placeholder={""} disabled/>
            </Col> 

            <Col md="3" sm="12" >
              <CustomTextInput  form={form} id="SR_Value"  label={"SR Value"} type="text"  placeholder={"SR Value"} disabled/>
            </Col>  
          </Row>

          <Row>
            <Col md="3" sm="12" >
              <CustomTextInput  form={form} id="SR_Qty"  label={"SR Qty"} type="text"  placeholder={""} disabled/>
            </Col>

            <Col md="3" sm="12" >
            <CustomTextInput  form={form} id="ReleaseQty"  label={"Release Qty"} onChange={(e) => CalcBalanceQty(e)} type="text"/>
            <span id='ReleaseQty_Error' style={{color: 'red'}} ></span>
            </Col>  
            
            <Col md="3" sm="12">
            <CustomTextInput  form={form} id="Balance_Qty"  label={"Balance Qty"} type="text" disabled/>
            </Col> 

            <Col md="3" sm="12">
            <CustomTextInput  form={form} id="Rate_mt"  label={"Rate/MT"} type="text" disabled/>
            </Col> 
          </Row> 
          <Row>
            <Col md="3" sm="12">
              <CustomTextInput  form={form} id="Do_value" disabled label={"Do Value"} type="text" />
            </Col> 
            
            <Col md="3" sm="12">
              <CustomTextInput  form={form} id="value90" disabled label={"90% value"} type="text" />
            </Col>

            <Col md="3" sm="12">
              <CustomTextInput  form={form} id="Company"  label={"Company Bank Name"} type="text" disabled/>
            </Col>

            <Col md="3" sm="12">
              <CustomTextInput  form={form} id="Bank_Name"  label={"Bank Name"} type="text" disabled/>
            </Col> 
          </Row>

          <Row>
            <Col md="3" sm="12">
              <CustomTextInput  form={form} id="ColleratoralManager"  label={"Collateral Manager"} type="text" disabled /> 
            </Col> 
                
            <Col md="2" sm="12">
            <>
                  <Uploader
                    setAttachment={handleFileChange}
                    label={"Release Letter"}
                    title="Pdf"
                    id={"release_letter_image"}
                    selectedFileName={attachedFiles.release_letter_image.name}
                  />
                  {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"ReleaseLetter_C"} />*/}
                  <span id='release_letter_image_Error' style={{color: 'red'}} ></span>

                    </>
            </Col> 
            <Col md="2" sm="12">
            <>
                  <Uploader
                    setAttachment={handleFileChange}
                    label={"Bank Statement"}
                    title="Pdf"
                    id={"bank_statement"}
                    selectedFileName={attachedFiles.bank_statement.name}
                  />
                    {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"BankStatement_C"} />*/}
                    <span id='bank_statement_Error' style={{color: 'red'}} ></span>

                  </>
            </Col>
          </Row> 

              <Col sm="12">
              <FormGroup className="d-flex justify-content-end mb-0">
              <Button.Ripple color="primary"  type="Button"  onClick={(e) => DORelease()}  >Approve</Button.Ripple>
              &nbsp;&nbsp;&nbsp;
              <Button.Ripple color="primary" onClick={ResetForm} type="Button" >Cancel</Button.Ripple>
              </FormGroup>
              </Col>
     </Fragment>
    )
} 

const  KeyloanDOReleaseEntrydata = () => {
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
      <CardComponent  header="Keyloan DO Release Entry">
     <KeyloanDOReleaseEntry  form={form}  onSubmit={onSubmit}  />
   </CardComponent>
    </Fragment>
  )
}


export default  KeyloanDOReleaseEntrydata

