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
////import Module_masterentryform from "./Module_masterentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Module_masterlist from "../List/Module_masterlist";
import { Master_Url } from "../../urlConstants";
const Module_masterentryform = ({ form,onSubmit }) => {
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
      MODULE_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getModule_masterDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            MODULE_REFID:data.results[0].MODULE_REFID,
            MODULE_ID:data.results[0].MODULE_ID,
            SCREEN_NAME:data.results[0].SCREEN_NAME,










            //MODULE_REFID:data.results[0].MODULE_REFID,
           // MODULE_ID:data.results[0].MODULE_ID,
           // SCREEN_NAME:data.results[0].SCREEN_NAME,
          })
          //form.setFieldValue("MODULE_REFID", {  label: data.results[0].MODULE_REFID,value: data.results[0].MODULE_REFID });
         // form.setFieldValue("MODULE_ID", {  label: data.results[0].MODULE_ID,value: data.results[0].MODULE_ID });
         // form.setFieldValue("SCREEN_NAME", {  label: data.results[0].SCREEN_NAME,value: data.results[0].SCREEN_NAME });
         








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
    // history.push(`/master/Module_master`); 
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Module"} form={form} id="MODULE_ID" type="text"  />
          <CustomTextInput form={form} id="MODULE_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
        <CustomTextInput label={"Screen Name"} form={form} id="SCREEN_NAME" type="text"  />
        </Col>
      </Row>
      <Row>









      </Row>





















      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
 
     </Row>
     <Module_masterlist
        url={Master_Url}
        title={"Module List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Module_master:` + row.MODULE_REFID );
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


const Module_masterentry = () => {
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
     
      //MODULE_REFID: validation.required({ message:"Module Reference should not be empty", isObject: false }),
      MODULE_ID: validation.required({ message:"Module Name should not be empty", isObject: false }),
      SCREEN_NAME: validation.required({ message:"Screen Name should not be empty", isObject: false }),
      








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
     
      //MODULE_REFID:formData.MODULE_REFID,
      MODULE_ID:formData.MODULE_ID,
      SCREEN_NAME:formData.SCREEN_NAME,









    };
    const postdata = {
      MODULE_REFID:formData.MODULE_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemodule_master", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("MODULE_REFID").value=="")
          {
            history.push("/master/Module_master:0");
          }
          else
          {
            history.push("/master/Module_master");
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
    history.push(`/master/Module_master`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Module">
        <Module_masterentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Module_masterentry;
