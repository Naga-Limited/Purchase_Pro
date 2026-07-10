import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { Paperclip } from "react-feather";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import { qcTestUrl, uploadUrl, keyLoanEntryUrl, getWheatMasterUrl,SaveCaptureImage } from "../../urlConstants";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

import CaptureImage from "../CaptureImage";
import { fromPairs } from "lodash";

function KeyloanPledgeEntryScreen({form,onSubmit}) {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [locationoption,setLocationoption] = useState([]);  
  const [storageLocationOption, setstorageLocationOption] = useState([]);  
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [ImgData, setImgData] = useState({});
  const [attachedFiles, setAttachment] = useState({ qcwrkdoc: {} });
  let { showLoader, hideLoader } = useLoader();
  const KeyCompanyOption = [
    {
      options: [
        { value: "NAGA", label: "NAGA"},
        { value: "MMD", label: "MMD" },
      
      ],
    },
  ];
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
  const onStorageLocationchange =(e) =>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationid', {  label: label,value: value });
    FillLotList(value)
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
  const isFilledAll = () => {
    showError('WareHouse_Error','Select WareHouse',0);
    showError('plantid_Error','Select plantid',0);
    showError('LotNumber_Error','Select LotNumber',0);
    showError('WheatVariety_Error','Select WheatVariety',0);
    showError('SAPQty_Error','Enter SAPQty',0);
    showError('SRNO_Error','Enter SRNO',0);
    showError('SRQTY_Error','Enter SRQTY',0);
    showError('RatePerMT_Error','Enter RatePerMT',0);
    showError('Percentage_Error','Enter Percentage',0);
    showError('Value90_Error','Enter Value90',0);
    showError('Company_Error','Select Company',0);
    showError('BankName_Error','Select BankName',0);
    showError('ColleratoralManager_Error','Select Collateral Manager',0);
    showError('SRValue_Error','Enter SRValue',0);	
    showError('KeyCompnay_Error','Enter Company',0);

    let formData=form.values;
    console.log(JSON.stringify(form.values));
    let ShowError=0;
    if(formData.length==0){ showError('WareHouse_Error','Enter Ware House',1); ShowError =1;  }
  if(!formData.WareHouse || !formData.WareHouse.value) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
  if(!formData.storagelocationid || !formData.storagelocationid.value) { showError('plantid_Error','Select Storage Location',1); ShowError =1; }
  if(!formData.LotNumber || !formData.LotNumber.value) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
  if(!formData.WheatVariety || !formData.WheatVariety.value) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
  if(!formData.SAPQty) { showError('SAPQty_Error','Enter SAP Qty',1);  ShowError =1; }
  if(!formData.SRNO) { showError('SRNO_Error','Enter SR NO',1);  ShowError =1; }
  if(!formData.SRQTY) { showError('SRQTY_Error','Enter SR Qty in MTS',1);  ShowError =1; }
  if(!formData.RatePerMT) { showError('RatePerMT_Error','Enter Rate Per MT',1);  ShowError =1; }
  if(!formData.SRValue) { showError('SRValue_Error','Enter SR Value in RS',1);  ShowError =1; }
  if(!formData.percentage) { showError('Percentage_Error','Enter Percentage Value in RS',1);  ShowError =1; }
  if(!formData.Value90) { showError('Value90_Error','Enter 90% Value',1);  ShowError =1; }
  if(!formData.Company || !formData.Company) { showError('Company_Error','Select Company',1); ShowError =1; }
  if(!formData.BankName || !formData.BankName.value) { showError('BankName_Error','Select Bank Name',1); ShowError =1; }
  if(!formData.ColleratoralManager || !formData.ColleratoralManager.value) { showError('ColleratoralManager_Error','Select Collateral Manager',1); ShowError =1; }
  if(!formData.KeyCompany || !formData.KeyCompany.value) { showError('KeyCompany_Error','Select Company',1);  ShowError =1; }
  if(parseFloat(formData.SRQTY)>parseFloat(formData.SAPQty)) { showError('SRQTY_Error','SR Qty Greater than SAP QTY',1);  ShowError =1; }

  if(ShowError==1){return true;}
}
  const saveKeyLoanDet = () => {
    if(isFilledAll()){
      return false;
    }

    let formData = form.values;
    console.log(JSON.stringify(formData));
       
    let {QCDocument} = ImgData;
    let fdata ={ 
      lotid: formData.LotNumber.value,
      warehouseid: formData.WareHouse.value,
      plantid: formData.plantid ? formData.plantid.value:0,
      locationid:formData.storagelocationid.value,
      lotno: formData.LotNumber.label,
      Wheat_Variety_Id: formData.Wheat_ID||formData.WheatVariety.value,
      PledgeDate: `${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`,
      SAP_Qty: formData.SAPQty,
      SR_No: formData.SRNO,
      SR_Qty_in_MTS: formData.SRQTY,
      balance_qty: formData.SRQTY,
      SR_Rate_Per_MT: formData.RatePerMT,
      SR_Value_in_Rs: formData.SRValue,
      
      /* Trans Type, Loan Status, Percentage */
      Transaction_Type: 'Pledge',
      Loan_Status: 'NO',
      Percent: formData.percentage,
      
      SR_90_Percent_Value: formData.Value90,
      Pledge_Value: formData.Value90,
      // Dijo 01 added .value after Company
      Company: formData.Company.value,
      Bank_Name: formData.BankName.label,
      KeyCompany: formData.KeyCompany.value,
      Colleratoral_Manager: formData.ColleratoralManager.value,
      BankInterest: formData.BankInterest
    };
    
    let FileSaveUrl="";
    let postdata = new FormData();
    console.log("SAVE")
 
      if(QCDocument){
      postdata.append("image[]", QCDocument);
      FileSaveUrl=SaveCaptureImage;
      }else{
        let UploadFile=0;
        Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });
      UploadFile = attachedFiles.qcwrkdoc && attachedFiles.qcwrkdoc.name && attachedFiles.qcwrkdoc.name.length ? true : false;

      //postdata.append("form_name", SCREEN_TYPE);
      //postdata.append("ponumber", ZPO_NUMBER);
     // postdata.append("VA_Number", ZVA_NUMBER);
      postdata.append("SubFolder", "KeyLoanPledge");
      FileSaveUrl=sapFileShare;
      if(UploadFile==false){
        FileSaveUrl=""
      }
    }

      showLoader();
      if(FileSaveUrl==""){
        apiPostMethod(keyLoanEntryUrl, fdata)
        .then((response) => {
          
          if (response.data.success) {
            ShowToast("Successfully updated...");
            history.push(`/warehouse/KeyloanPledgeEntryScreen`);
            // window.location.reload();
            setTimeout(() => window.location.reload(), 2000);
          } if (response.data.success==0) {
            errorToast("Duplicate Record..!");
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
            fdata.Pledge_Letter_Image = data.files[0].updname;
            apiPostMethod(keyLoanEntryUrl, fdata)
              .then((response) => {
                if (response.data.success==1) {
                  ShowToast("Successfully updated...");
                  history.push(`/warehouse/KeyloanPledgeEntryScreen`);
                  window.location.reload();
                }
                 if (response.data.success==0) {
                  errorToast("Duplicate Record..!");
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
    
  }

  const ColleratoralManagerOptions = [
    {
      options: [
        { value: "NBHC", label: "NBHC" },
        { value: "ARYA", label: "ARYA" },
        { value: "SOHANLAL", label: "SOHANLAL" },
        { value: "GO GREEN", label: "GO GREEN" },
        { value: "NCML", label: "NCML" },

      ],
    },
  ]; 
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('WareHouse', {  label: label,value: value });
    /*form.setValues({
      ...form.values,
      WareHouse: {label: label,value: value},
    });*/
    
    //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
    
    //FillPlantList(value, label); 
    //FillStorageLocationFromWarehouse(value, label);
    FillPlantList(value, label);
    ClearDropdown("WH");
  };
  
  const FillStorageLocationFromWarehouse = (warehouseid,whlabel) => {
    let fdata = {WH_CODE:warehouseid, screentype:"Warehousewisestocks"}
    //let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHstoragelocationList',fdata)
    .then((response) => {
      const { data } = response; 
      if(data.success) {
        setLocationoption([{options:data.results}]);
        form.setValues({
          ...form.values,
          ColleratoralManager :  data.results[0].name_of_collateral,
          Company: data.results[0].company_name,
          WareHouse: {label: whlabel,value: warehouseid},
        });
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
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
            // ...form.values,
            Company: data.results[0].company_name,
            // ColleratoralManager: data.results[0].name_of_collateral,
            // WareHouse: {label: WH_NAME,value: WH_CODE},
          });
          console.log("After Fetch Plant" + data.results[0].name_of_collateral) ;
          form.setFieldValue('WareHouse', {  label: WH_NAME,value: WH_CODE });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
    FillStorageLocationList(value)
    ClearDropdown("PLANT");
  };

  const onStorageLocationChange=(e)=>{
    const {value,label} = e; 
    
   // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value, label)
   ClearDropdown("SL");
  
   }
  const FillStorageLocationList=(PlantId)=>{
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
   
      setstorageLocationOption([{ options: data.results }]);
   
    //getLotInfo(paramLotId,type);
    
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
   };
  
  const FillLotList = (sLocId, LocationName) => {
    //let fdata = { storagelocationId: paramPlantid, screenType: "FUMIGATION" };
    let fdata = { storagelocationId:sLocId,plantid: form.values.plantid.value, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhLotOptions([{ options: data.results }]);
          form.setFieldValue('storagelocationid', {  label: LocationName,value: sLocId });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLotChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('LotNumber', {  label: label,value: value });
    FillWheatVarityList(value,label);
    ClearDropdown("LOT");
  };

  // const FillWheatVarityList = (paramLotId) => {
  //   let fdata = { 
  //     lotid:paramLotId,
  //     StorageLocation:form.values.storagelocationid.value,
  //     screenType: "FUMIGATION" 
  //   };

  //   apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       if (data.success) {
  //         setWhWheetVarietyOptions([{ options: data.results }]);
  //       }
  //     })
  //     .catch((error) => {
  //       errorToast("Something went wrong, please try again after sometime");
  //     });
  // };

  const onkeyCompanyChange = (e)=>{
    const { value, label } = e;
    form.setFieldValue('KeyCompany', {  label: label,value: value });
  }
  const onColleratoralChange = (e)=>{
    const { value, label } = e;
    form.setFieldValue('ColleratoralManager', {  label: label,value: value });
  }


  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    // form.setFieldValue('WheatVariety', {  label: label, value: value });
    //FillWheatVarityList(value);
    // getWheatDet(value, label);
    showWarehousewisestocksQTY(value,label)
  };
  // useEffect(() => {
  //   if (form.values.wheatvarietyid) {
  //     getWheatDet();
  //   }
  // }, [form.values.wheatvarietyid?.value]);
  const getWheatDet = (WheatVarietyId,WheatVarietyName,Stock) => {
    let fdata = {
      Segment:WheatVarietyId,
      screenType: "KEYLOAN_WHEAT_VARAITY" 
    };
    
    //let fdata={}
    apiPostMethod(apiBaseUrl+'warehouse/master/getWheatvarietyDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
        form.setValues({
           ...form.values,
            Wheat_ID:data.Det[0].Id,
            SAPQty:Stock
         })
        form.setFieldValue('WheatVariety', {  label: WheatVarietyName , value: WheatVarietyId });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };


  const { qcwrkdoc } = attachedFiles;
   
  const calcSRValue = (e) =>{
    if(isNaN(e.target.value)){return false; }
    if(e.target.value<0)
    {
      e.target.value = e.target.value-1;
    }
    let SRQTY=0, RatePerMT=0, SRValue=0, Percentage= 0, Value90=0;

    if(e.target.id=="SRQTY"){
      if(parseFloat(e.target.value)<=parseFloat(form.values.SAPQty)){
        RatePerMT = form.values.RatePerMT;
        Percentage = form.values.percentage;
        SRQTY=e.target.value;
      }else{
        errorToast("SRQTY greater than SAP QTY");
        return false;
      }
      
    }else if(e.target.id=="RatePerMT"){
      SRQTY=form.values.SRQTY;
      Percentage = form.values.percentage;
      RatePerMT = e.target.value;

    }else if(e.target.id=="percentage"){
      SRQTY=  form.values.SRQTY;
      RatePerMT=  form.values.RatePerMT;
      Percentage = e.target.value;
    }
    
    SRValue = parseFloat(RatePerMT * SRQTY).toFixed(2);
    Value90 = parseFloat( SRValue * Percentage / 100).toFixed(2);
    
    //let LoanRateCalc = e.target.value * form.values.SRQty;
    form.setValues({
      ...form.values,
      // LoanAmount:e.target.value,
      percentage:Percentage,
      SRValue:SRValue,
      Value90:Value90,
      RatePerMT:RatePerMT,
      SRQTY:SRQTY,

    })
  }

  /*
  const calcPercentageValue = (e) =>{
    if(isNaN(e.target.value)){return false; }
    if(e.target.value<0)
    {
      e.target.value=e.target.value-1;
    }
    let SRValue=0, Percentage= 0, Value90=0;

    if(e.target.id=="Percentage"){
      SRValue = form.values.SRValue;
      Percentage = e.values.Percentage;
    }
    Value90 = parseFloat( SRValue * Percentage / 100).toFixed(3);
    
    //let LoanRateCalc = e.target.value * form.values.SRQty;
    form.setValues({
      ...form.values,
      //LoanAmount:e.target.value,
      //SRValue:SRValue,
      Value90:Value90,
      //RatePerMT:RatePerMT,
      //SRQTY:SRQTY,
    })
  }
  */

    const ClearDropdown = (Item) => {
      if (Item === "WH"){
        form.setFieldValue('plantid', '');
        form.setFieldValue('storagelocationid','');
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('WheatVariety', '');
      }else if (Item === "PLANT"){
        form.setFieldValue('storagelocationid','');
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('WheatVariety', '');
      }else if (Item === "SL"){
        form.setFieldValue('LotNumber', '');
        form.setFieldValue('WheatVariety', '');
      }else if (Item === "LOT"){
        form.setFieldValue('WheatVariety', '');
      }
    }

    const FillWheatVarityList = (lotId,lotName) => {

      let fdata = {
      Screen:"WAREHOOUSESTOCK",
      warehouseid:form.values.WareHouse.value,
      plantId:form.values.plantid.label,
      storagelocationid:form.values.storagelocationid.label,
      lotId:lotName,
      };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
    .then((response) => {
      const { data } = response;
      let tableData = data.results
      let sp_work_order_array = []
      const option = []
  
      tableData.map(({ SEGMENT,WHEAT_VARIETY }) => {
        sp_work_order_array.push(SEGMENT)
        option.push({ value: SEGMENT, label: WHEAT_VARIETY })
        setWhWheetVarietyOptions(option);
        })
    })
    .catch((error) => {
      errorToast("No Stock Available In This Lot");
    })
    .finally((a) => {
      hideLoader();
    });
    }

  
    const showWarehousewisestocksQTY = (value) => {
  
      let fdata = {
      Screen:"WAREHOOUSESTOCK",
      warehouseid:form.values.WareHouse.value,
      plantId:form.values.plantid.label,
      storagelocationid:form.values.storagelocationid.label,
      lotId:form.values.LotNumber.label, 
      WheatVariety:value,
      };
    
    showLoader();
     apiPostMethod(apiBaseUrl + "warehouse/Relot/SAP_Lotwise_StockDetails", fdata)
     .then((response) => {
      const { data } = response;
      let tableData = data.results
        let filterData = tableData.filter(
          (data) => data.SEGMENT == value
        )
        // if (data.success) {
        //   form.setValues({
        //     ...form.values,
        //     SAPQty:filterData[0].STOCK
        //   })
        //   form.setFieldValue('WheatVariety', {  label: filterData[0].WHEAT_VARIETY , value: filterData[0].SEGMENT });
        // }
        getWheatDet(filterData[0].SEGMENT,filterData[0].WHEAT_VARIETY,filterData[0].STOCK);
     })
     .catch((error) => {
       errorToast("No Stock Available In This Lot");
     })
     .finally((a) => {
       hideLoader();
     });
    }
    

    return (
      <Fragment>
        <Row>
          <Col md="2" sm="12" >
            <CustomTextInput   label={"System Date"} form={form} id="Wh_name" type="text"  placeholder={date} disabled/>
          </Col>

          <Col md="2" sm="12" >
            <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"} 
              style={{"minwidth":"270px"}} 
              form={form} 
              id="WareHouse"  
              onChange={(e)=>onWarehouseChange(e)} 
            />
            <span id="WareHouse_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12" >{/**Plant not in use */}
            <CustomDropdownInput 
              label = {"Plant"}
              style={{"width":"370px"}}
              options={WhPlantOptions}
              id="plantid"
              onChange={(e) => onPlantChange(e)}
              form={form} 
            />
            <span id="plantid_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12" >
            <CustomDropdownInput 
              label ={"Storage Location"}
              style={{"width":"370px"}}
              options={storageLocationOption}
              id="storagelocationid"
              form={form} 
              onChange={(e) => onStorageLocationChange(e)}
            />
            <span id="plantid_Error" style={{color: "red"}} ></span>
         </Col>

          <Col md="2" sm="12" >
            <CustomDropdownInput 
              label = {"Lot No"}
              options={WhLotOptions} 
              form={form} 
              id="LotNumber" 
              onChange={(e) => onLotChange(e)}
            />
            <span id="LotNumber_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12" >
            <CustomDropdownInput
              label = {"Wheat Variety"}
              options={WhWheatvarietyOptions}
              id={"WheatVariety"}
              form={form} 
              onChange={(e) => onWheatvarietyChange(e)}
            />
            <span id="WheatVariety_Error" style={{color: "red"}} ></span>
          </Col> 

        </Row>
        <Row>
          <Col md="2" sm="12">
            <CustomTextInput 
              label={"SAP Qty in KG"} 
              form={form} isNumberOnly 
              maxlength={10} 
              id="SAPQty" 
            />
            <span id="SAPQty_Error" style={{color: "red"}} ></span>
          </Col>
          <Col md="2" sm="12">
            <CustomTextInput label={"SR No"} form={form} id="SRNO" type="text" />
            <span id="SRNO_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12">
            <CustomTextInput 
              label={"SR Qty in KG"} 
              maxlength={10} 
              form={form} 
              id="SRQTY" 
              type="text" 
              onChange={calcSRValue}
            />
            <span id="SRQTY_Error" style={{color: "red"}} ></span>
          </Col>
          
          <Col md="2" sm="12">
            <CustomTextInput 
              decimalFormat={"2,2"} 
              label={"Rate / MT"} 
              form={form} 
              maxlength={5} 
              id="RatePerMT" 
              type="text" 
              onChange={calcSRValue}
            />
            <span id="RatePerMT_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12">
            <CustomTextInput label={"SR Value in RS."} disabled form={form} id="SRValue" type="text" />
            <span id='SRValue_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="2" sm="12">
            <CustomTextInput 
              label={"Percentage"} 
              decimalFormat={"2,2"} 
              maxlength={5} 
              form={form} 
              id="percentage" 
              type="text" 
              onChange={calcSRValue}
            />
            <span id='Percentage_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="2" sm="12">
            <CustomTextInput label={"Percentage Value"} disabled form={form} id="Value90" type="text" />
            <span id="Value90_Error" style={{color: "red"}} ></span>
          </Col>
        </Row>

        <Row>
          <Col md="2" sm="12">
            <CustomTextInput label={"Company Bank Name"} disabled form={form} id="Company" type="text" />
            <span id='Company_Error' style={{color: 'red'}} ></span>
          </Col>
                 
          <Col md="2" sm="12">
            <CustomDropdownInput style={{"minwidth":"270px"}} url={`${apiBaseUrl}warehouse/master/getMaster_ngw_bankDetailsById`} 
              label={"Bank Name"} form={form} id="BankName"  onChange={(e) => onTextChange(e, "BankName")}/>
            <span id='BankName_Error' style={{color: 'red'}} ></span>
          </Col>
          <Col md="2" sm="12">
            <CustomTextInput label={"Bank Interest"} form={form} id="BankInterest"  type="text" isNumberOnly decimalFormat="3,2"/>
            <span id="BankInterest_Error" style={{color: "red"}} ></span>
          </Col>

          <Col md="2" sm="12">
          
                  {/*<CustomTextInput label={"Collateral Manager"} disabled form={form} 
                  id="ColleratoralManager" type="text" />*/}
            <Label>Collateral Manager</Label>
            <Select 
              options={ColleratoralManagerOptions} 
              form={form} 
              id="ColleratoralManager" 
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => onColleratoralChange(e)}
            />
            <span id='ColleratoralManager_Error' style={{color: 'red'}} ></span>
          </Col>
          <Col md="2" sm="12">
            <Label>Company</Label>
            <Select 
              options={KeyCompanyOption} 
              form={form} 
              id="KeyCompany" 
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => onkeyCompanyChange(e)}
            />
           <span id='KeyCompany_Error' style={{color: 'red'}} ></span>
          </Col> 

          <Col sm="4" md="4">
            <FormGroup>
              <Label for="nameMulti">Pledge Letter</Label>
              <br />
              <input
                type="file"
                className="form-control"
                id="qcwrkdoc"
                hidden
                name="upload_file"
                accept=".pdf, image/*"
                onChange={(e) => {handleFileChange(e);}}
              />
              <span id="qcwrkdoc_Error" style={{color: "red"}} ></span>
              <Button.Ripple
                outline
                color="primary"
                onClick={(e) => {fileUploadAction();}}
              >
                <Paperclip size={14} />
                <span className="align-middle ml-25">Pdf</span>
              </Button.Ripple>
                <div className="align-middle ml-25">{qcwrkdoc.name}</div>
                      {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"QCDocument"} />*/}
            </FormGroup>
                    
            </Col>
          </Row>
          <Col sm="12">
          <FormGroup className="d-flex justify-content-end mb-0">
          <Button.Ripple color="primary"  type="Button"  onClick={(e) => saveKeyLoanDet()} >Submit</Button.Ripple>
          &nbsp;&nbsp;&nbsp;
          <Button.Ripple color="primary"  type="Button" >Cancel</Button.Ripple>
          </FormGroup>
          </Col>
         
    </Fragment>
    )
}


const KeyloanPledgeEntryScreenData = () => {
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
    ShowToast("Successfully Updated...");
  }
  return (
    <Fragment>
    
      <CardComponent  header="Keyloan Pledge Entry Screen">
     
       <KeyloanPledgeEntryScreen form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
  )
}

export default KeyloanPledgeEntryScreenData


