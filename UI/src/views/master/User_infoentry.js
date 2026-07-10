import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { CustomTextInputMail, validation, Yup } from "../forms/custom-form";
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
////import User_infoentryform from "./User_infoentryform";
import { Row, Col,Button, Input, Label } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import User_infolist from "../List/User_infolist";
import { Master_Url } from "../../urlConstants";
import { useState } from "react";
const User_infoentryform = ({ form,onSubmit }) => {
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
      UI_ID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getUser_infoDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            UI_ID:data.results[0].UI_ID,
            FIRST_NAME:data.results[0].FIRST_NAME,
            LOGIN_ID:data.results[0].LOGIN_ID,
            PASSWORD:data.results[0].PASSWORD,
            SI_NO:data.results[0].SI_NO,
            DESIGNATION:data.results[0].DESIGNATION,
            DEPARTMENT:data.results[0].DEPARTMENT,
            CITY:data.results[0].CITY,
            STATE:data.results[0].STATE,
            MOBILE_NUMBER:data.results[0].MOBILE_NUMBER,
            MAIL_ID:data.results[0].MAIL_ID,
            EMP_CODE:data.results[0].EMP_CODE,

            //UI_ID:data.results[0].UI_ID,
           // FIRST_NAME:data.results[0].FIRST_NAME,
           // LOGIN_ID:data.results[0].LOGIN_ID,
           // PASSWORD:data.results[0].PASSWORD,
           // SI_NO:data.results[0].SI_NO,
           // DESIGNATION:data.results[0].DESIGNATION,
           // DEPARTMENT:data.results[0].DEPARTMENT,
           // CITY:data.results[0].CITY,
           // STATE:data.results[0].STATE,
           // USER_ROLE_ID:data.results[0].USER_ROLE_ID,
           // USER_STATUS:data.results[0].USER_STATUS,


          })
         
         form.setFieldValue("USER_STATUS", {  label: data.results[0].ACTIVELABEL, value: data.results[0].USER_STATUS });
         form.setFieldValue("USER_ROLE_ID", {  label: data.results[0].ROLE_NAME, value: data.results[0].USER_ROLE_ID });
          /*let { LINE_ITEM, ...sResult } = data.results[0];
          setPOData({
            ...poData,
            ...sResult,
            LINE_ITEM,
          });
          onFetchPOLine(sResult.ZPO_NUMBER, sResult.ZSUPPLIER_CODE);
          form.setFieldValue("LINE_ITEM", { label: LINE_ITEM, value: LINE_ITEM });*/
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  const RefreshPage = () => {
    // history.push(`/master/User_info`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"First Name"} form={form} id="FIRST_NAME" type="text"  />
          <CustomTextInput form={form} id="UI_ID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"SlNo"} form={form} id="SI_NO" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getCommonActiveStatusG3`} label={"User Status"} form={form} id="USER_STATUS" />

        </Col>
      </Row>
      <Row>
        
        <Col md="4" sm="12">
          <CustomTextInput label={"User Name"} form={form} id="LOGIN_ID" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Password"} form={form} id="PASSWORD" type="password"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Designation"} form={form} id="DESIGNATION" type="text"  />
        </Col>
      </Row>
      <Row>
        
        <Col md="4" sm="12">
          <CustomTextInput label={"Department"} form={form} id="DEPARTMENT" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"City"} form={form} id="CITY" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"State"} form={form} id="STATE" type="text"  />
        </Col>
      </Row>
      <Row>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getrolename`} label={"Role Name"} form={form} id="USER_ROLE_ID" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Employee Code"} form={form} id="EMP_CODE" maxLength="5" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Mobile Number"} form={form} id="MOBILE_NUMBER" maxLength="10" type="text"  />
        </Col>
        <Col md="4" sm="12">
           {/* <Label className="form-label" for="Mail_IDs">
                  Mail ID
            </Label> */}
          <CustomTextInputMail label={"Mail ID"} form={form} id="MAIL_ID" type="text"/>
          {/* <Input type="text" id="MAIL_ID" value={Mail_IDs} form={form} placeholder="Mail ID" /> */}
        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>

     </Row>
     <User_infolist
        url={Master_Url}
        title={"User - List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/User_info:` + row.UI_ID );
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />
    </Fragment>
  );
};


const User_infoentry = () => {
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
     
      FIRST_NAME: validation.required({ message:"First Name should not be empty", isObject: false }),
      LOGIN_ID: validation.required({ message:"Login Id should not be empty", isObject: false }),
      PASSWORD: validation.required({ message:"Password should not be empty", isObject: false }),
      SI_NO: validation.required({ message:"SI.No. should not be empty", isObject: false }),
      DESIGNATION: validation.required({ message:"Designation should not be empty", isObject: false }),
      DEPARTMENT: validation.required({ message:"Department should not be empty", isObject: false }),
      CITY: validation.required({ message:"City should not be empty", isObject: false }),
      STATE: validation.required({ message:"State should not be empty", isObject: false }),
      USER_ROLE_ID: validation.required({ message:"User Role should not be empty", isObject: true }),
      USER_STATUS: validation.required({ message:"User Status should not be empty", isObject: true }),
      MOBILE_NUMBER: validation.required({ message:"User Mobile Number should not be empty", isObject: false }),
      MAIL_ID: validation.required({ message:"User Mail ID should not be empty", isObject: false }),
      EMP_CODE: validation.required({ message:"Employee code should not be empty", isObject: false }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
 // alert("1");
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    //alert("2");
   
    let formData = form.values;
   /* if (poData.LINE_ITEM === formData.LINE_ITEM.value) {
      resetForm();
      return;
    }*/
    //alert(JSON.stringify(formData));
    const FrmData = {
     
      FIRST_NAME:formData.FIRST_NAME,
      LOGIN_ID:formData.LOGIN_ID,
      PASSWORD:formData.PASSWORD,
      SI_NO:formData.SI_NO,
      DESIGNATION:formData.DESIGNATION,
      DEPARTMENT:formData.DEPARTMENT,
      CITY:formData.CITY,
      STATE:formData.STATE,
      MOBILE_NUMBER:formData.MOBILE_NUMBER,
      MAIL_ID:formData.MAIL_ID,
      USER_ROLE_ID:formData.USER_ROLE_ID.value,
      USER_STATUS:formData.USER_STATUS.value,
      EMP_CODE:formData.EMP_CODE,
    };

    if(FrmData.MOBILE_NUMBER == undefined || !/^[\d]{10}$/.test(FrmData.MOBILE_NUMBER )){
      errorToast('Please Enter Correct Mobile Number ...')
      return false
    }else if(FrmData.MAIL_ID == undefined || !/[a-z0-9]+@nagamills.com/.test(FrmData.MAIL_ID )){
      errorToast('Not valid email ( Ex: abcd@nagamills.com ) ...')
      return false
    }else if(FrmData.PASSWORD == undefined || !/^[a-zA-Z0-9]{8}/.test(FrmData.PASSWORD)){
      errorToast('Password Should be Greater than 8 Characters ...')
      return false
    }else if(FrmData.EMP_CODE == undefined || !/^[\d]{5}$/.test(FrmData.EMP_CODE )){
      errorToast('Please Enter Correct Employee Code ...')
      return false
    }
    const postdata = {
      UI_ID:formData.UI_ID,
      Data:FrmData
    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateuser_info", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("UI_ID").value=="")
          {
            history.push("/master/User_info:0");
          }
          else
          {
            history.push("/master/User_info");
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
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/User_info`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="User Creation">
        <User_infoentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default User_infoentry;
