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
////import Master_plantentryform from "./Master_plantentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_vessellist from "../List/Master_vessellist";
import { Master_Url } from "../../urlConstants";
const Master_vesselentryform = ({ form,onSubmit }) => {
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
      VESSEL_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_vesselDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            VESSEL_REFID:data.results[0].VESSEL_REFID,
            VESSEL_NAME:data.results[0].VESSEL_NAME,
            VESSES_STATUS:data.results[0].VESSES_STATUS,










            //VESSEL_REFID:data.results[0].VESSEL_REFID,
           // VESSEL_NAME:data.results[0].VESSEL_NAME,
           // VESSES_STATUS:data.results[0].VESSES_STATUS,
          })
          //form.setFieldValue("VESSEL_REFID", {  label: data.results[0].VESSEL_REFID,value: data.results[0].VESSEL_REFID });
         // form.setFieldValue("VESSEL_NAME", {  label: data.results[0].VESSEL_NAME,value: data.results[0].VESSEL_NAME });
          form.setFieldValue("VESSES_STATUS", {  label: data.results[0].ACTIVELABEL, value: data.results[0].ACTIVE });
         








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
    // history.push(`/master/Master_vessel`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Vessel"} form={form} id="VESSEL_NAME" type="text"  />
          <CustomTextInput form={form} id="VESSEL_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getCommonActiveStatusG2`} label={"Vessel Status"} form={form} id="VESSES_STATUS" />
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
     <Master_vessellist
        url={Master_Url}
        title={"Vessel - List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_vessel:` + row.VESSEL_REFID );
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


const Master_vesselentry = () => {
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
     
      VESSEL_NAME: validation.required({ message:"Vessel Name should not be empty", isObject: false }),
      VESSEL_NAME: validation.required({ message:"Plant Name should not be empty", isObject: false }),
      VESSES_STATUS: validation.required({ message:"Status should not be empty", isObject: true }),








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
     
      VESSEL_NAME:formData.VESSEL_NAME,
      VESSEL_NAME:formData.VESSEL_NAME,
      VESSES_STATUS:formData.VESSES_STATUS.value,









    };
    const postdata = {
      VESSEL_REFID:formData.VESSEL_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_vessel", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("VESSEL_REFID").value=="")
          {
            history.push("/master/Master_vessel:0");
          }
          else
          {
            history.push("/master/Master_vessel");
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
    history.push(`/master/Master_vessel`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Vessel">
        <Master_vesselentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_vesselentry;
