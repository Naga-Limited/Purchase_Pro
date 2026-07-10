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
////import Master_from_locationEntryForm from "./Master_from_locationEntryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_from_locationlist from "../List/Master_from_locationlist";
import { Master_from_locationUrl } from "../../urlConstants";
const Master_from_locationentryform = ({ form,onSubmit }) => {
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
      id: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_from_locationdetailsbyId", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            id:data.results[0].id,
            city:data.results[0].city,
            state:data.results[0].state,
            description:data.results[0].description,



            //city:data.results[0].city,
           // state:data.results[0].state,
          })
          /*form.setFieldValue("city", {  label: data.results[0].city,value: data.results[0].city });

          form.setFieldValue("state", {  label: data.results[0].state,value: data.results[0].state });
          form.setFieldValue("descrption", {  label: data.results[0].descrption,value: data.results[0].descrption });
          */
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
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"City"} form={form} id="city" type="text"  />
          <CustomTextInput form={form} id="id" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"State"} form={form} id="state" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Description"} form={form} id="description" type="text"  />
        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  
     </Row>
     <Master_from_locationlist
        url={Master_from_locationUrl}
        title={"Loading Location"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/master_location:` + row.id );
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


const Master_from_locationentry = () => {
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
      city: validation.required({  message:"City Name should not be empty",isObject: false }),
      state: validation.required({  message:"State Name should not be empty",isObject: false }),
      description: validation.required({  message:"Description should not be empty",isObject: false }),
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




    //alert(JSON.stringify(formData));
    const FrmData = {
      city:formData.city,
      state:formData.state,
      description:formData.description,
      Master_from_location:formData.Master_from_location,
    };
    const postdata = {
      id:formData.id,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateMaster_from_location", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("id").value=="")
          {
            history.push(`/master/master_location:0`);
          }
          else
          {
            history.push(`/master/master_location`);
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
        //let UsrId=data.success;

       
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
    history.push(`/master/master_location`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Loading Location">
        <Master_from_locationentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_from_locationentry;
