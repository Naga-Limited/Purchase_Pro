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
////import Master_quality_perferredentryform from "./Master_quality_perferredentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_quality_perferredlist from "../List/Master_quality_perferredlist";
import { Master_Url } from "../../urlConstants";
const Master_quality_perferredentryform = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "Master/getmaster_quality_perferredDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id:data.results[0].Id,
            FieldMap:data.results[0].FieldMap,
            PreferredMin:data.results[0].PreferredMin,
            PreferredMax:data.results[0].PreferredMax,
            FieldOrder:data.results[0].FieldOrder,
          })
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
    //history.push(`/master/Master_quality_perferred`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Field Map"} form={form} id="FieldMap" type="text"  />
          <CustomTextInput form={form} id="Id" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Preferred Min"} form={form} id="PreferredMin" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Preferred Max"} form={form} id="PreferredMax" type="text"  />
        </Col>
      </Row>
      <Row>
      <Col md="4" sm="12">
          <CustomTextInput label={"Field Order"} form={form} id="FieldOrder" type="text"  />
        </Col>






      </Row>

      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
 
     </Row>
     <Master_quality_perferredlist
        url={Master_Url}
        title={"Quality Preferred List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_quality_perferred:` + row.Id );
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


const Master_quality_perferredentry = () => {
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
      FieldMap: validation.required({ message:"Field Map should not be empty", isObject: false }),
      PreferredMin: validation.required({  message:"Preferred Minimum value should not be empty",isObject: false }),
      PreferredMax: validation.required({ message:"Preferred Maximum should not be empty", isObject: false }),
      FieldOrder: validation.required({ message:"Field Order should not be empty", isObject: false }),

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
     
      FieldMap:formData.FieldMap,
      PreferredMin:formData.PreferredMin,
      PreferredMax:formData.PreferredMax,
      FieldOrder:formData.FieldOrder,








    };
    const postdata = {
      Id:formData.Id,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_quality_perferred", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("Id").value=="")
          {
            history.push("/master/Master_quality_perferred:0");
          }
          else
          {
            history.push("/master/Master_quality_perferred");
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
    history.push(`/master/Master_quality_perferred`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Quality Preferred">
        <Master_quality_perferredentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_quality_perferredentry;
