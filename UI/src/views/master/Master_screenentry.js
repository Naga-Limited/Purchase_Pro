import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock";
////import Master_screenentryform from "./Master_screenentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_screenlist from "../List/Master_screenlist";
import { Master_Url } from "../../urlConstants";
const Master_screenentryform = ({ form,onSubmit }) => {
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
      ID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_screenDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ID:data.results[0].ID,
            SCREEN_NAME:data.results[0].SCREEN_NAME,
            SCREEN_DESC:data.results[0].SCREEN_DESC,
            PRIORITY:data.results[0].PRIORITY,
            //DISABLED:data.results[0].DISABLED,
          })
          form.setFieldValue("DISABLED", {  label: data.results[0].ACTIVELABEL, value: data.results[0].ACTIVE });








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
    //history.push(`/master/Master_screen`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Screen Name"} form={form} id="SCREEN_NAME" type="text"  />
          <CustomTextInput form={form} id="ID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Screen Description"} form={form} id="SCREEN_DESC" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Priority"} form={form} id="PRIORITY" type="text"  />
        </Col>
      </Row>
      <Row>
      <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getCommonActiveStatusG2`} label={"Active"} form={form} id="DISABLED" />
        </Col>

      </Row>





















      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  
     </Row>
     <Master_screenlist
        url={Master_Url}
        title={"Screen List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_screen:` + row.ID );
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


const Master_screenentry = () => {
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
      SCREEN_NAME: validation.required({ message:"Screen Name should not be empty", isObject: false }),
      SCREEN_DESC: validation.required({  message:"Screen Description should not be empty",isObject: false }),
      PRIORITY: validation.required({ message:"Priority  should not be empty", isObject: false }),
      DISABLED: validation.required({ message:"Disabled should be selected", isObject: true }),








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
     
      SCREEN_NAME:formData.SCREEN_NAME,
      SCREEN_DESC:formData.SCREEN_DESC,
      PRIORITY:formData.PRIORITY,
      DISABLED:formData.DISABLED.value,








    };
    const postdata = {
      ID:formData.ID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_screen", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("ID").value=="")
          {
            history.push("/master/Master_screen:0");
          }
          else
          {
            history.push("/master/Master_screen");
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
    history.push(`/master/Master_screen`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Screen">
        <Master_screenentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_screenentry;
