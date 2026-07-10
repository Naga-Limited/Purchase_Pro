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
////import Master_roleentryform from "./Master_roleentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_rolelist from "../List/Master_rolelist";
import { Master_Url } from "../../urlConstants";
const Master_roleentryform = ({ form,onSubmit }) => {
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
      RM_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_roleDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            RM_REFID:data.results[0].RM_REFID,
            ROLE_NAME:data.results[0].ROLE_NAME,
            //ROLE_STATUS:data.results[0].ROLE_STATUS,
          })
          form.setFieldValue("ROLE_STATUS", {  label: data.results[0].ACTIVELABEL, value: data.results[0].ROLE_STATUS });          
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
    //history.push(`/master/Master_role`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Role Name"} form={form} id="ROLE_NAME" type="text"  />
          <CustomTextInput form={form} id="RM_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
        
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getCommonActiveStatusG1`} label={"Role Status"} form={form} id="ROLE_STATUS" />
        </Col>
      </Row>

      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
 
     </Row>
     <Master_rolelist
        url={Master_Url}
        title={"User Role List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_role:` + row.RM_REFID );
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


const Master_roleentry = () => {
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
      
      ROLE_NAME: validation.required({  message:"Role Name should not be empty",isObject: false }),
      ROLE_STATUS: validation.required({ message:"Role Status should not be empty", isObject: true }),





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
     
      
      ROLE_NAME:formData.ROLE_NAME,
      ROLE_STATUS:formData.ROLE_STATUS.value,



    };
    const postdata = {
      RM_REFID:formData.RM_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_role", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("RM_REFID").value=="")
          {
            history.push("/master/Master_role:0");
          }
          else
          {
            history.push("/master/Master_role");
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
    history.push(`/master/Master_role`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="User Role">
        <Master_roleentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_roleentry;
