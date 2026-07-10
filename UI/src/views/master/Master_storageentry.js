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
////import Master_storageentryform from "./Master_storageentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_storagelist from "../List/Master_storagelist";
import { Master_Url } from "../../urlConstants";
const Master_storageentryform = ({ form,onSubmit }) => {
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
      STORAGE_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_storageDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            STORAGE_REFID:data.results[0].STORAGE_REFID,
            LGORT:data.results[0].LGORT,
            STORAGE_LOCATION:data.results[0].STORAGE_LOCATION,










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
    //history.push(`/master/Master_storage`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"LGORT"} form={form} id="LGORT" type="text"  />
          <CustomTextInput form={form} id="STORAGE_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Storage Location"} form={form} id="STORAGE_LOCATION" type="text"  />
        </Col>



      </Row>
































      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  
     </Row>
     <Master_storagelist
        url={Master_Url}
        title={"Storage Location List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_storage:` + row.STORAGE_REFID );
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


const Master_storageentry = () => {
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
      LGORT: validation.required({ message:"LGORT should not be empty", isObject: false }),
      STORAGE_LOCATION: validation.required({  message:"Storage Location should not be empty",isObject: false }),










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
     
      LGORT:formData.LGORT,
      STORAGE_LOCATION:formData.STORAGE_LOCATION,










    };
    const postdata = {
      STORAGE_REFID:formData.STORAGE_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_storage", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("STORAGE_REFID").value=="")
          {
            history.push("/master/Master_storage:0");
          }
          else
          {
            history.push("/master/Master_storage");
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
    history.push(`/master/Master_storage`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Storage Location">
        <Master_storageentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_storageentry;
