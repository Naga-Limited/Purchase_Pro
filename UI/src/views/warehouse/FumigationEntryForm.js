import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

export const _FumigationFormData = {
  WH_CODE: "",
  WH_Name: "",
  plantid:"",
  plantname:"",
  lotid:"",
  lotno:"",
  wheetvarietyid:"",
  wheetvariety:"",
  SIMTS:"",
  BagType:"",
  BagTypeId:"",
  LFO:"",
  LeadDays:"",
  LDO:"",
  LFT:"",
  FS:"",
  RFD:"",
  FT:"",
  FA:"",
  FN:"",
  VN:"",
  ALPC:"",
  AmountPer:"",
};


const FumigationEntryForm = ({ form, onSubmit }) => {
  
  const [formData, setFormData] = useState({..._FumigationFormData});
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);

  const { WH_Name, WH_CODE, plantid, plantname, lotid, lotno,  wheatvarietyid, wheatvariety} = formData;
  const history = useHistory();
  let { fumigationid } = useParams();
  let refid='';
  let fdata='';
  if(fumigationid){
  refid = fumigationid.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (fumigationid) {
      onFetchSDIdetailsById();
    }
  }, [fumigationid]);
  const onFetchSDIdetailsById = () => {
    let fdata = {
      id: refid,
    };
    showLoader();

    console.log("Request Url :: "+apiBaseUrl + "Master/getFumigationEntryById", fdata);
    apiPostMethod(apiBaseUrl + "Master/getFumigationEntryById", fdata)
    .then((response) => {
      const { data } = response;
      console.log("Response Data :: "+JSON.stringify(response));
      if (data.success) {
        form.setValues({
          WH_Name:data.results[0].WH_Name,
          plantid:data.results[0].plantid,
          lotno:data.results[0].lotno,
          WheetVariety:data.results[0].WheetVariety,
          SIMTS:data.results[0].SIMTS,
          BagType:data.results[0].BagType,
          LFO:data.results[0].LFO,
          LeadDays:data.results[0].LeadDays,
          LDO:data.results[0].LDO,
          LFT:data.results[0].LFT,
          FS:data.results[0].FS,
          RFD:data.results[0].RFD,
          FT:data.results[0].FT,
          FA:data.results[0].FA,
          FN:data.results[0].FN,
          VN:data.results[0].VN,
          ALPC:data.results[0].ALPC,
          AmountPer:data.results[0].AmountPer,
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

  const RefreshPage = () => {
    history.push(`/master/FumigationEntryForm`);
  };

  const handleViewHistory = (data) => {

  }
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    // console.log(value);
    // console.log(e);
    setFormData({ ...formData, WH_CODE: value, WH_Name:label });
    
    FillPlantList(value);
  };

  const FillPlantList = (WH_CODE) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onPlantChange = (e) => {
    const { value, label } = e;
    
    setFormData({ ...formData, plantid: value, plantname:label });
    
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

  const onLotChange = (e) => {
    const { value, label } = e;
    
    setFormData({ ...formData, lotid: value, lotno:label });
    
    FillWheatVarityList(value);
  };

  const FillWheatVarityList = (paramLotId) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
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

  
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    
    setFormData({ ...formData, wheetvarietyid: value, wheetvariety:label });
    
    //FillWheatVarityList(value);
  };  
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
           <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"} form={form} id="warehouseid" 
           onChange={onWarehouseChange}
           value={{ label: WH_Name, value: WH_CODE }}
           />
           <CustomTextInput form={form} id="F_ID" type="hidden"  />
        </Col>
        <Col md="3" sm="12">
          <Label>Storage Location</Label>
          <Select
                    options={WhPlantOptions}
                    id={"plantid"}
                    className="react-select"
                    classNamePrefix="select"
                    value={{ label: plantname, value: plantid }}
                    onChange={(e) => onPlantChange(e)}
                  />
        </Col>
        <Col md="3" sm="12">
          <Label>Lot</Label>
          <Select
            options={WhLotOptions}
            id={"lotid"}
            className="react-select"
            classNamePrefix="select"
            value={{ label: lotno, value: lotid }}
            onChange={(e) => onLotChange(e)}
          />
        </Col>
      </Row>
        <Row>
        <Col md="3" sm="12">
        <Label>Wheat Variety</Label>
        <Select
            options={WhWheatvarietyOptions}
            id={"lotid"}
            className="react-select"
            classNamePrefix="select"
            value={{ label: wheatvariety, value: wheatvarietyid }}
            onChange={(e) => onWheatvarietyChange(e)}
          />
        </Col>
         <Col md="3" sm="12">
            {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Stock in MTS"} form={form} id="SIMTS" /> */}
            <CustomTextInput label={"Stock in MTS"} form={form} id="SIMTS" type="text" />
         </Col>
        <Col md="3" sm="12">
            <CustomDropdownInput url={`${apiBaseUrl}master/getBagType`} label={"Bag Type"} form={form} id="BagType" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
         {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Last Fumigated on"} form={form} id="LFO" /> */}
         <CustomTextInput label={"Last Fumigated on"} form={form} id="LFO" type="text" />
        </Col>
        <Col md="3" sm="12">
        {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Next Due Date"} form={form} id="wh_refid" /> */}
        {/* <CustomTextInput label={"Date"} form={"29/11/2021"} id="date" type="date"  /> */}
        {/* <DatePicker form={form} id="date" label={"Next Due Date"} /> */}
        <CustomTextInput label={"Next Due Date"} form={form} id="date" type="date"  />
        </Col>
        <Col md="3" sm="12">
        {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Lead Days"} form={form} id="LeadDays" /> */}
        <CustomTextInput label={"Lead Days"} form={form} id="LeadDays" type="text" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
        {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Last Degassed on"} form={form} id="LDO" /> */}
        <CustomTextInput label={"Last Degassed on"} form={form} id="LDO" type="text" />
        </Col>
        <Col md="3" sm="12">
        {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Last Fumigation Type"} form={form} id="LFT" /> */}
        <CustomTextInput label={"Last Fumigation Type"} form={form} id="LFT" type="text" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getFumigationStatus`} label={"Fumigation Status"} form={form} id="FS" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getResonForDelay`} label={"Reason for Delay"} form={form} id="RFD" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getFumigationType`} label={"Fumigation Type"} form={form} id="FT" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getwarehouseslist`} label={"Fumigation Agency"} form={form} id="FA" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getwarehouseslist`} label={"Fumigator Name"} form={form} id="FN" />
        </Col>
        <Col md="3" sm="12">
        {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouseslist`} label={"Vendor Name"} form={form} id="VN" /> */}
        <CustomTextInput label={"Vendor Name"} form={form} id="VN" type="text" />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput label={"ALP Count"} form={form} id="ALPC" type="text" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
          <CustomTextInput label={"Amount Per ?"} form={form} id="AmountPer" type="text" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
         <Button.Ripple color="primary" type="Button" className="mr-2 mt-2" onClick={(e) => handleViewHistory(e)}>
          View History
          </Button.Ripple>
        </Col>
        {/* <Col md="3" sm="12">
      <CancelSubmitButtons
        form={form}
        onCancel={() => {
          form.resetForm();
          onSubmit();
        }}
        onSubmit={onSubmit}
        cancelText={"Clear"}
      />
        </Col> */}

      <Card>
        <Col sm="12" className="my-1">
          <FormGroup className="d-flex mb-0 justify-content-end align-items-center">
           
            <Button.Ripple color="secondary" type="button" className="mr-2"
             onClick={(e) => ""}>
              Cancel
            </Button.Ripple>
         
           
            <div className="mr-50">
              <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
            </div>
          </FormGroup>
        </Col>
      </Card>

      </Row>
    </Fragment>
  );
};
const FumigationEntryFormData = () => {
 // let jsonData = {"values":{},"errors":{},"touched":{},"isSubmitting":false,"isValidating":false,"submitCount":0,"initialValues":{},"initialErrors":{},"initialTouched":{},"isValid":false,"dirty":false,"validateOnBlur":true,"validateOnChange":true,"validateOnMount":false};
 
 const { showLoader, hideLoader } = useLoader();
 const dateFormat = "YYYY-MM-DD";
 const today = moment().format(dateFormat);
 const isToday = (date) => {
   return moment(date).format(dateFormat) == today;
 };
 const form = useFormik({
   isInitialValid: false,
   initialValues: {},
   validationSchema: Yup.object().shape({

      WH_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
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
      FA: validation.required({  message:"Fumigation Agency should not be empty",isObject: true }),
      FN: validation.required({ message:"Fumigator Name should not be empty", isObject: true }),
      VN: validation.required({  message:"Vendor Name should be numeric value",isObject: false }),
      ALPC: validation.required({ message:"ALP Count should not be empty", isObject: false }),
      AmountPer: validation.required({  message:"AmountPer should not be empty",isObject: false }),
   
    }),
   onSubmit(values) {},
 });
 const values = form.values;
 // console.log(" Fumigation Data Values :: ","1:1");
 const onSubmit = () => {
   console.log(" Fumigation Data Values :: ","2:1");
   if (!form.isValid) {
     form.setSubmitting(true);
     form.validateForm();
     console.log(" Invalid Form :: ","1");
     return;
   }
   console.log(" Valid Form :: ","1");
   let formData = form.values;
   const FrmData = {
      //WH_Name:data.results[0].WH_Name,
      lotid:formData.LotNo.value,
      warehouseid:formData.WH_Name.value,
      plantid:formData.LotNo,
      locationid:formData.SLocation.value,
      lotno:formData.LotNo.label,
      FumigationNo:formData.FN,
      Fumigation_date:formData.FN,
      Last_Fumigation_Type:formData.FN,
      Last_Fumigated_date:formData.FN,
      Last_Degassed_date:formData.LDO,
      Next_Due_Date:formData.date,
      Lead_Days:formData.LeadDays,
      Fumigation_Status:formData.FS.value,
      QC_Update:formData.LotNo,
      QC_Updated_UserId:formData.LotNo,
      Fumigation_No:formData.FN,
      Reason_for_Delay:formData.RFD.value,
      Bag_Type:formData.BagType.value,
      Fumigation_Type:formData.FT,
      Fumigation_Agency:formData.FA.value,
      Fumigator_Name:formData.FN.value,
      Vendor_Name:formData.VN,
      Amount:formData.AmountPer,
      ALP_Count:formData.ALPC,
      ActionRequired:formData.LotNo,
      Reason_for_Deviation:formData.RFD.value,
   };
   console.log(" Fumigation Entry Form Values :: "+JSON.stringify(FrmData));
   const postdata = {
     id:formData.F_ID,
     Data:FrmData
   }
   console.log(" Fumigation Entry Form :: "+JSON.stringify(postdata));
   showLoader();
   console.log(" Fumigation Entry URL :: "+apiBaseUrl + "Master/updateFumigationEntry", postdata);
   apiPostMethod(apiBaseUrl + "Master/updateFumigationEntry", postdata)
     .then((response) => {
       const { data } = response;
       console.log(" Response Data ::: "+JSON.stringify(response));
       
       let RespId=data.success;
       if(RespId && RespId>=1)
       {
         ShowToast("Saved Successfully...");

         if(document.getElementById("F_ID").value=="")
         {
           history.push("/warehouse/masters/FumigationEntryForm");
         }
         else
         {
           history.push("/warehouse/masters/FumigationEntryForm");
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
 const history = useHistory();
 const resetForm = () => {
   history.push(`/master/FumigationEntryForm`);
 };
 
 return (
   <Fragment>
    
      <CardComponent  header="Fumigation Entry">
     
       <FumigationEntryForm form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
  );
};

export default FumigationEntryFormData;
