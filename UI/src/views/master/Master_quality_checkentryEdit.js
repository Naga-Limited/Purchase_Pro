import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
////import Master_quality_checkentryform from "./Master_quality_checkentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_quality_checklist from "../List/Master_quality_checklist";


import { Master_Url } from "../../urlConstants";
const Master_quality_checkentryform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id && id!=":0"){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id && id!=":0") {
      onFetchSDIdetailsById();
    }
  }, [id]);
  const onFetchSDIdetailsById = () => {
    let fdata = {
      Id: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_quality_check_Wheat_ById", fdata)
      .then((response) => {
        const { data } = response;
       // console.log("data:"+JSON.stringify(data));
        if (data.success) {
          form.setValues({
            WheatVariety:data.results[0].WheatVariety,
            Id:data.results[0].Id,
            CheckList:data.CheckList,
           
          });
         
         
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  const onTextChange = (e,PKey, checkList,Val) => {
    let KeyValue=e.target.value;
    console.log(KeyValue);
    for(let i=0;i<checkList.length;i++){
      if(checkList[i].QCM_REFID==PKey){
          if(Val=="MIN_VALUE"){
            checkList[i].MIN_VALUE=KeyValue;
          }
          if(Val=="MAX_VALUE"){
            checkList[i].MAX_VALUE=KeyValue;
          }
          if(Val=="DeductionSpec"){
            checkList[i].DeductionSpec=KeyValue;
          }
          
          
      }
    }
    console.log(JSON.stringify(checkList));
    form.setValues({...form.values,checkList});
  }
  const onTextChange_OLD = (obj,e,PKey, key) => {
  //  alert(PKey)
    //console.log("1"+JSON.stringify(form));
   
    for(let i=0;i<form.values.CheckList.length;i++){
      //console.log(form.values.CheckList[i].QCM_REFID);
      if(form.values.CheckList[i].QCM_REFID==PKey){
        //console.log(PKey);
        //console.log(PKey);
        //console.log(key);
        if(key=="MINVALUE"){
        form.values.CheckList[i].MIN_VALUE=e.target.value;
        //console.log(e.target.value);
        //this.setState({[e.target.name]:e.target.value})
        
        obj.value=e.target.value;
       //return true;
        }
        if(key=="MAXVALUE"){
          form.values.CheckList[i].MAX_VALUE=e.target.value;
          //console.log("3"+JSON.stringify(form));
         // return true;
          }
      }
    }
    
  
    
   
  };
 // console.log(JSON.stringify(form));
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"IDNLF"} form={form} disabled={true} id="WheatVariety" type="text"  />
          <CustomTextInput form={form} id="Id" type="hidden"  />
        </Col>
      </Row>
      <br></br>
      <Row>
      <Col md="12" sm="12">
        <table style={{width:"100%",borderColor:"#d8d6de",fontSize:"12px"}} border={1} cellPadding={3} >
          <thead style={{backgroundColor:"#7367f0",color:"#fff"}}>
            <tr>
              <th style={{width:"10%"}}>QCM_REFID</th>
              <th style={{width:"10%"}}>MIC</th>
              <th style={{width:"15%"}}>MIC_DESC</th>
              <th style={{width:"5%"}} >UOM</th>
              <th style={{width:"20%"}}>MIN_VALUE	</th>
              <th style={{width:"20%"}}>MIN_VALUE	</th>

              <th style={{width:"20%"}}>Deduction Spec	</th>
            </tr>


          </thead>
        {form.values.CheckList && form.values.CheckList.map((row, index) => (  
              <tr data-index={index}>  
                <td>{row.QCM_REFID}</td>  
                <td>{row.MIC}</td>  
                <td>{row.MIC_DESC}</td>  
                <td>{row.UOM}</td>  
                <td> <CustomTextInput style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}} placeholder={" "}  onChange={(e) => onTextChange(e,row.QCM_REFID,form.values.CheckList,"MIN_VALUE")}  form={form} id={`MINVALUE_${index}`}  type="text" value={row.MIN_VALUE}   /></td>  
                
                <td> <CustomTextInput  style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}}  placeholder={" "} onChange={(e) => onTextChange(e,row.QCM_REFID,form.values.CheckList,"MAX_VALUE")}  form={form} id={`MAXVALUE_${index}`}  type="text" value={row.MAX_VALUE}   /></td>  
                <td> <CustomTextInput  style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}}  placeholder={" "} onChange={(e) => onTextChange(e,row.QCM_REFID,form.values.CheckList,"DeductionSpec")}  form={form} id={`DeductionSpec_${index}`}  type="text" value={row.DeductionSpec}   /></td>  
              
              </tr>  
            ))}  
            </table>
            </Col>
      </Row>
      <br></br>
       <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col></Row>
    </Fragment>
  );
};


const Master_quality_checkentryEdit = () => {
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
      MIC: validation.required({ message:"MIC should not be empty", isObject: false }),
      MIC_DESC: validation.required({  message:"MIC Description should not be empty",isObject: false }),
      UOM: validation.required({ message:"UOM should not be empty", isObject: false }),
      MIN_VALUE: validation.required({ message:"MIN Value should not be empty", isObject: false }),
      MAX_VALUE: validation.required({  message:"MAX Value should not be empty",isObject: false  }),
      nir_yes: validation.required({  message:"NIR Yes should not be empty",isObject: false  }),
      nir_no: validation.required({  message:"NIR No should not be empty",isObject: false  }),
      nir_foss: validation.required({  message:"NIR Foss should not be empty",isObject: false  }),
      surveyor: validation.required({  message:"Surveyor should not be empty",isObject: false  }),
      IDNLF: validation.required({  message:"IDNLF should not be empty",isObject: false  }),
      FIELD_MAP: validation.required({  message:"Field Map should not be empty",isObject: false  }),
      input_type: validation.required({  message:"Input Type should not be empty",isObject: false  }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
 
    /*if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }*/
    //alert("2");
   
    let formData = form.values;
   /* if (poData.LINE_ITEM === formData.LINE_ITEM.value) {
      resetForm();
      return;
    }*/
   // console.log(JSON.stringify(formData));
   // return false;
    
    const postdata = {
      Id:formData.Id,
      WheatVariety:formData.WheatVariety,
      Data:formData.CheckList

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
  
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_quality_check", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        //console.log(JSON.stringify(response))
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          history.push("/master/Master_quality_check");
         
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
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/Master_quality_check`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Quality Specification">
      <Master_quality_checkentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
    </Fragment>
  );
};

export default Master_quality_checkentryEdit;
