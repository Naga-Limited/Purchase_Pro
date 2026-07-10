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
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_incolist from "../List/Master_incolist";
import { Master_Url } from "../../urlConstants";
const Master_incoentryform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  // alert(useParams());
  // alert(id);
  let refid='';
  if(id && id!=":0"){
    // alert(id);
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id && id!=":0") {
      onFetchSDIdetailsByINCO_REFID();
    }
  }, [id]);
  const onFetchSDIdetailsByINCO_REFID = () => {
    let fdata = {
      INCO_REFID: refid,
    };
    showLoader();
    // alert("ok")
    // alert(id);
    apiPostMethod(apiBaseUrl + "Master/getINCO_DetailsByRefId", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            INCO_REFID:data.results[0].INCO_REFID,
            INCO_TERMS:data.results[0].INCO_TERMS,
            INCO_DESC:data.results[0].INCO_DESC,
          })
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
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
        <CustomTextInput label={"INCO Terms"} form={form} id="INCO_TERMS" type="text"  />
          <CustomTextInput form={form} id="INCO_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
        <CustomTextInput label={"INCO Description"} form={form} id="INCO_DESC" type="text"  />
        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
 
     </Row>
     <Master_incolist
        url={Master_Url}
        title={"Inco Terms List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_inco:` + row.INCO_REFID );
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


const Master_incoentry = () => {
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
      //LINE_ITEM: validation.required(),
      INCO_TERMS: validation.required({ message:"INCO Terms should not be empty", isObject: false }),
      INCO_DESC: validation.required({ message:"INCO Description should not be empty", isObject: false }),

    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
  // alert("1X" );
  // alert(form.isValid);
  // alert("1Y" );
    if (!form.isValid) {
      // alert("1a");
      form.setSubmitting(true);
      // alert("1b");
      form.validateForm();
      // alert("1c");
      return;
    }
    // alert("2");
   
    let formData = form.values;
   /* if (poData.LINE_ITEM === formData.LINE_ITEM.value) {
      resetForm();
      return;
    }*/
    // alert(JSON.stringify(formData));
    const FrmData = {
      INCO_TERMS:formData.INCO_TERMS,
      INCO_DESC:formData.INCO_DESC,
    };
    const postdata = {
      INCO_REFID:formData.INCO_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_inco", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("INCO_REFID").value=="")
          {
            history.push(`/master/Master_inco:0`);
          }
          else
          {
            history.push(`/master/Master_inco`);
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
    history.push(`/master/Master_inco`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Inco Terms">
        <Master_incoentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_incoentry;
