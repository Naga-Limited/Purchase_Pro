import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { Paperclip } from "react-feather";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import { qcTestUrl, uploadUrl, RelottingUrl, getWheatMasterUrl,SaveCaptureImage } from "../../urlConstants";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

import CaptureImage from "../CaptureImage";

function RelottingEntryScreen({form,onSubmit}) {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  const [FromLotDatas, setFromLotDatas] = useState([]);
  const [ToLotDatas, setToLotDatas] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [ImgData, setImgData] = useState({});
  const [attachedFiles, setAttachment] = useState({ qcwrkdoc: {} });
  let { showLoader, hideLoader } = useLoader();
  const CompanyOptions = [
    {
      options: [
        { value: "Company 1", label: "Company 1" },
        { value: "Company 2", label: "Company 2" },
     
      ],
    },
  ]; 
  const fileUploadAction = () => {
    document.getElementById("qcwrkdoc").click();
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
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
  const BankOptions = [
    {
      options: [
        { value: "Bank 1", label: "Bank 1" },
        { value: "Bank 2", label: "Bank 2" },
     
      ],
    },
  ]; 
  const onTextChange = (e, key) => {
   console.log(JSON.stringify(e));
form.setFieldValue(key, {  label: e.label,value: e.value });
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

  const SaveRelottingRequest = () => {
    if(isFilledAll()){
      return false;
    }
    let formData = form.values;
    console.log(JSON.stringify(formData));
    let fdata ={  
      RelotDate: `${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`,
      fromwarehouseid:formData.WareHouse.value,
      fromplantid:formData.plantid.value,
      fromlotid:formData.LotNumber.value,
      fromlotno:formData.LotNumber.label,

      towarehouseid:formData.WareHouse.value,
      toplantid:formData.plantid.value,
      tolotid:formData.ToLotNumber.value,
      tolotno:formData.ToLotNumber.label,

      WheatVarietyId:formData.WheatVariety.value,
      QtyInMTS:formData.QtyinMTS,

      BagType:formData.BagType ? formData.BagType.value: "",
      NoOfBags:formData.NoOfBags,

      BagType2:formData.BagType2 ? formData.BagType2.value: "",
      NoOfBags2:formData.NoOfBags2,

      BagType3:formData.BagType3 ? formData.BagType3.value: "",
      NoOfBags3:formData.NoOfBags3,

      GunnylessWeight   :formData.GunnylessWeight,

      QtyInMTS:formData.QtyinMTS,
      Vehicle           :formData.Vehicle.value,
      RelottingVendorId:formData.RelottingVendor.value,
      RelottingCharges:formData.RelottingCharges,
      RelottingReasonId:formData.RelottingReason.value,
      
      FreightVendor     :formData.FreightVendor ? formData.FreightVendor.value: "",
      LoadingCharges    :formData.LoadingCharges,
      UnLoadingCharges  :formData.UnLoadingCharges,
      FreightCharges    :formData.FreightCharges,
      RejectReason: formData.RejectReason,
      RelotStatus:'1'
      
    }
    showLoader();
    apiPostMethod(RelottingUrl, fdata)
    .then((response) => {
      if (response.data.success) {
        history.push(`/warehouse/RelottingRequest`);
        window.location.reload();
      } if (response.data.success==0) {
        errorToast("Duplicate Record..!");
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    }).finally((a) => {
      hideLoader();
    });
  }
  const isFilledAll_old = () => {
    showError('WareHouse_Error','Select WareHouse',0);
showError('plantid_Error','Select plantid',0);
showError('LotNumber_Error','Select LotNumber',0);
showError('WheatVariety_Error','Select WheatVariety',0);
showError('SAPQty_Error','Enter SAPQty',0);
showError('SRNO_Error','Enter SRNO',0);
showError('SRQTY_Error','Enter SRQTY',0);
showError('RatePerMT_Error','Enter RatePerMT',0);
showError('Value90_Error','Enter Value90',0);
showError('Company_Error','Select Company',0);
showError('BankName_Error','Select BankName',0);
showError('ColleratoralManager_Error','Select Collateral Manager',0);
showError('SRValue_Error','Enter SRValue',0);	


    let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    if(formData.length==0){ showError('WareHouse_Error','Enter Ware House',1); ShowError =1;  }

if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
if(!formData.plantid || !formData.plantid.value) { showError('plantid_Error','Select Storage Location',1); ShowError =1; }
if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
if(!formData.WheatVariety || !formData.WheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
if(!formData.SAPQty) { showError('SAPQty_Error','Enter SAP Qty',1);  ShowError =1; }
if(!formData.SRNO) { showError('SRNO_Error','Enter SR NO',1);  ShowError =1; }
if(!formData.SRQTY) { showError('SRQTY_Error','Enter SR Qty in MTS',1);  ShowError =1; }
if(!formData.RatePerMT) { showError('RatePerMT_Error','Enter Rate Per MT',1);  ShowError =1; }
if(!formData.SRValue) { showError('SRValue_Error','Enter SR Value in RS',1);  ShowError =1; }
if(!formData.Value90) { showError('Value90_Error','Enter 90% Value',1);  ShowError =1; }
if(!formData.Company || !formData.Company) { showError('Company_Error','Select Company',1); ShowError =1; }
if(!formData.BankName || !formData.BankName.value) { showError('BankName_Error','Select Bank Name',1); ShowError =1; }
if(!formData.ColleratoralManager || !formData.ColleratoralManager) { showError('ColleratoralManager_Error','Select Collateral Manager',1); ShowError =1; }
if(parseFloat(formData.SRQTY)>parseFloat(formData.SAPQty))
      {
        showError('SRQTY_Error','SR Qty Greater than SAP QTY',1);  ShowError =1; 
      }
if(ShowError==1){return true;}
  }
 
  const ColleratoralManagerOptions = [
    {
      options: [
        { value: "Colletoral Manager 1", label: "Colletoral Manager 1" },
        { value: "Colletoral Manager 2", label: "Colletoral Manager 2" },
        
     
      ],
    },
  ]; 
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    /*form.setValues({
      ...form.values,
      WareHouse: {label: label,value: value},
    });*/
    // form.setFieldValue('WareHouse', {  label: label,value: value });
    //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
    
    FillPlantList(value, label); 
  };

  const FillPlantList = (WH_CODE, WH_NAME) => {
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
          //form.setFieldValue('WareHouse', {  label: WH_NAME,value: WH_CODE });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
    FillLotList(value);
  };
  const FillLotList = (paramPlantid) => {
    let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
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

  const onLotChange = (e,type) => {
    const { value, label } = e;
    if(type==1){
      form.setFieldValue('LotNumber', {  label: label,value: value });
    }
    if(type==2){
      form.setFieldValue('ToLotNumber', {  label: label,value: value });
    }
    
    FillWheatVarityList(value,type);
  };

  const FillWheatVarityList = (paramLotId,type) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // if(type==1){
          //   setWhWheetVarietyOptions([{ options: data.results }]);
          // }
          setWhWheetVarietyOptions([{ options: data.results }]);
          getLotInfo(paramLotId,type);
          
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getLotInfo = (paramLotId,type) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getLotInformation', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          if(type==1){
            setFromLotDatas( data.results);
          }else if(type==2){
            setToLotDatas( data.results);
          }
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    
    form.setFieldValue('WheatVariety', {  label: label,value: value });
    
    //FillWheatVarityList(value);
  };
  const { qcwrkdoc } = attachedFiles;
  const isFilledAll = () => {
    showError('WareHouse_Error','Select WareHouse',0);
showError('plantid_Error','Select plantid',0);
showError('LotNumber_Error','Select LotNumber',0);
showError('WheatVariety_Error','Select WheatVariety',0);
showError('ToLotNumber_Error','Select ToLotNumber',0);
showError('BagType_Error','Select BagType',0);
showError('NoOfBags_Error','Enter NoOfBags',0);
showError('QtyinMTS_Error','Enter QtyinMTS',0);
showError('RelottingVendor_Error','Select RelottingVendor',0);
showError('RelottingCharges_Error','Enter RelottingCharges',0);
showError('RelottingReason_Error','Select RelottingReason',0);
let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
if(!formData.plantid || !formData.plantid.value) { showError('plantid_Error','Select Plant',1); ShowError =1; }
if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
if(!formData.WheatVariety || !formData.WheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
if(!formData.ToLotNumber || !formData.ToLotNumber.value) { showError('ToLotNumber_Error','Select To Lot Number',1); ShowError =1; }
if(!formData.BagType || !formData.BagType.value) { showError('BagType_Error','Select Bag Type',1); ShowError =1; }
if(!formData.NoOfBags) { showError('NoOfBags_Error','Enter No Of Bags',1);  ShowError =1; }
if(!formData.QtyinMTS) { showError('QtyinMTS_Error','Enter Qty in MTS',1);  ShowError =1; }
if(!formData.RelottingVendor || !formData.RelottingVendor.value) { showError('RelottingVendor_Error','Select Relotting Vendor',1); ShowError =1; }
if(!formData.RelottingCharges) { showError('RelottingCharges_Error','Enter Relotting Charges',1);  ShowError =1; }
if(!formData.RelottingReason || !formData.RelottingReason.value) { showError('RelottingReason_Error','Select Relotting Reason',1); ShowError =1; }
if(ShowError==1){return true;}
  }
   
  const calcSRValue = (e) =>{
    if(isNaN(e.target.value)){return false; }
    if(e.target.value<0)
    {
      e.target.value=e.target.value-1;
    }
    let SRQTY=0, RatePerMT=0, SRValue=0, Value90=0;

    if(e.target.id=="SRQTY")
    {
      if(parseFloat(e.target.value)<=parseFloat(form.values.SAPQty))
      {
      RatePerMT=form.values.RatePerMT;
       SRQTY=e.target.value;
      }
      else
      {
        errorToast("SRQTY greater than SAP QTY")    ;
        return false;
      }
// form.values.SRQTY=e.target.value;
    }
    else if(e.target.id=="RatePerMT")
    {
      SRQTY=form.values.SRQTY;
       RatePerMT=e.target.value;
      //form.values.RatePerMT=e.target.value;
    }
    
    SRValue = RatePerMT*SRQTY;
    Value90 = parseFloat( RatePerMT*SRQTY*90/100).toFixed(3);
    

    let LoanRateCalc=e.target.value*form.values.SRQty;
    form.setValues({
      ...form.values,
      LoanAmount:e.target.value,
      SRValue:SRValue,
      Value90:Value90,
      RatePerMT:RatePerMT,
      SRQTY:SRQTY,

    })

  }

    return (
      <Fragment>
         
          
          <Row>
              <Col md="4" sm="12" >
              <CustomTextInput   label={"System Date"} form={form} id="Wh_name" type="text"  placeholder={date} disabled/>
             
              </Col>
              <Col md="4" sm="12" >
           <CustomDropdownInput style={{"minwidth":"270px"}} url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"} form={form} id="WareHouse"  onChange={onWarehouseChange} />
 <span id="WareHouse_Error" style={{color: "red"}} ></span>
           </Col>
           <Col md="4" sm="12" >
           
             <Label>Storage Location</Label>
           <Select style={{"width":"370px"}}
              options={WhPlantOptions}
              id={"plantid"}
              className="react-select"
              classNamePrefix="select"
              
              onChange={(e) => onPlantChange(e)}
            />
<span id="plantid_Error" style={{color: "red"}} ></span>
           </Col>
           </Row>

          <Row>
           
          <Col md="4" sm="12" >
          <label>Wheat Variety</label>
          <Select
           style={{"width":"170px"}}
           options={WhWheatvarietyOptions}
           id={"WheatVariety"}
           className="react-select"
           classNamePrefix="select"
           
           onChange={(e) => onWheatvarietyChange(e)}
         />
         <span id="WheatVariety_Error" style={{color: "red"}} ></span>
          </Col> 
          
           <Col md="4" sm="12" >
           <label>From Lot No</label>
          <Select 
          options={WhLotOptions} form={form} id="LotNumber" 
          className="react-select"
          classNamePrefix="select"
          
          onChange={(e) => onLotChange(e,'1')}
          />
          <span id="LotNumber_Error" style={{color: "red"}} ></span>
           </Col>
                     
          <Col md="4" sm="12" >
          <label>To Lot No</label>
          <Select 
          options={WhLotOptions} form={form} id="ToLotNumber" 
          className="react-select"
          classNamePrefix="select"
          
          onChange={(e) => onLotChange(e,'2')}
          />
           <span id='ToLotNumber_Error' style={{color: 'red'}} ></span>
           </Col>
          </Row>
          
          <Row>
          <Col md="4" sm="12" >
        <CustomDropdownInput style={{"minwidth":"270px"}}
         url={`${apiBaseUrl}warehouse/master/bagtype`} 
           label={"Bag Type"} form={form} id="BagType"  />
         <span id='BagType_Error' style={{color: 'red'}} ></span>
           </Col>

           <Col md="4" sm="12">
         <CustomTextInput label={"No Of Bags"} form={form} isNumberOnly
          maxlength={10} id="NoOfBags" />
         <span id='NoOfBags_Error' style={{color: 'red'}} ></span>
        </Col>
        <Col md="4" sm="12">
         <CustomTextInput label={"Qty in MTS"} form={form} isNumberOnly maxlength={10}
          id="QtyinMTS" />
        <span id='QtyinMTS_Error' style={{color: 'red'}} ></span>
        </Col>
          </Row>

          <Row>
          <Col md="4" sm="12" >
        <CustomDropdownInput style={{"minwidth":"270px"}}
         url={`${apiBaseUrl}warehouse/master/relottingvendor`} 
           label={"Relotting Vendor"} form={form} id="RelottingVendor"  />
         <span id='RelottingVendor_Error' style={{color: 'red'}} ></span>
           </Col>

           <Col md="4" sm="12">
         <CustomTextInput label={"Relotting Charges"} form={form} isNumberOnly
          maxlength={10} id="RelottingCharges" />
         
         <span id='RelottingCharges_Error' style={{color: 'red'}} ></span>

        </Col>
        <Col md="4" sm="12" >
        <CustomDropdownInput style={{"minwidth":"270px"}}
         url={`${apiBaseUrl}warehouse/master/relottingreason`} 
         label={"Relotting Reason"} form={form} id="RelottingReasonId"  />
          <span id='RelottingReason_Error' style={{color: 'red'}} ></span>
           </Col>
          </Row>
          
          <Row>
          <Col md="6" sm="12" >
          <table style={{width:"80%",border: "2px solid #7367f0 ", color:"#7367f0"}} border={1} >
          <thead><tr><th style={{textAlign:"center"}}>Current Stock From Lot</th></tr>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>

          {FromLotDatas &&
          FromLotDatas.length>0 &&
          FromLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>
          </table> </Col>
          </Row>

        <br>
        </br>
          
          <Row>
          <Col md="6" sm="12" >
          <table style={{width:"80%",border: "2px solid #7367f0 ", color:"#7367f0"}} border={1} >
          <thead><tr><th style={{textAlign:"center"}}>Current Stock To Lot</th></tr>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>
          {ToLotDatas &&
          ToLotDatas.length>0 &&
          ToLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>

          </table> </Col>
          </Row>
           <div class="d-flex justify-content-center">
             <div class="p-1">
              <Button.Ripple color="primary"  type="Button"  onClick={(e) => SaveRelottingRequest()} >
                Submit
              </Button.Ripple>
            </div>
          <div class="p-1">
            <Button.Ripple color="primary"  type="Button" >
              Cancel
            </Button.Ripple>
          </div>
         </div>
       
        
      </Fragment>
    )
}


const RelottingEntryScreenData = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
 
       Wh_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
       SLocation: validation.required({  message:"Storage Location should not be empty",isObject: true }),
       LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
       WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
       SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
       BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
       LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
       LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
       LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
       LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
       FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
       RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
       FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
      
    
     }),
    onSubmit(values) {},
  });
  const onSubmit= () => {

  }
  return (
    <Fragment>
    
      <CardComponent  header="Relotting Request">
     
       <RelottingEntryScreen form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
  )
}

export default RelottingEntryScreenData


