import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
import { ShowToast } from "@helpers/appHelper";
import { RefreshBlock } from "../../common/RefreshBlock";
////import Master_quality_perferredentryform from "./Master_rndlotconversionentry1form";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_rndlotconversionlist from "./List/Master_rndlotconversionlist";
import { WHMaster_ListUrl } from "../../../urlConstants";

const Master_rndlotconversionform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      onFetchSDIdetailsById();
    }
  }, [id]);
  const onFetchSDIdetailsById = () => {
    let fdata = {
      rnd_lot_parametermasterid: refid,
    };
    showLoader();
    // alert("ok")
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_rndlotconversionById", fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response ::: "+JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id:refid,
            Parameter_Name:data.results[0].parametername,
            Order_No:data.results[0].sortorderno,
          
          });

          form.setFieldValue("Parameter_Type", {  label: data.results[0].ParameterTypeName,value: data.results[0].parametertype });
          form.setFieldValue("Validation_Required", {  label: data.results[0].ValReq,value: data.results[0].validationrequired });
          form.setFieldValue("Attachment_Required", {  label: data.results[0].AttReq,value: data.results[0].attachmentrequired });
          form.setFieldValue("Attachment_Mandatory", {  label: data.results[0].AttMan,value: data.results[0].attachmentmandatory });
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  /*** Custom Data's ***/
  const resData = [{"value":"1","label":"YES"},{"value":"2","label":"No"}];

  const RefreshPage = () => {
    //history.push(`/master/Master_rndlotconversion1`);
    window.location.reload();
  };

  const checkAttReq = (e) =>
  {
    const { value, label } = e;
    console.log("chkAttachReq");
    if(value=="2")
    {
      form.setFieldValue("AttachmentMandateDisable", true);
    }
    else
    {
      form.setFieldValue("AttachmentMandateDisable", false);
    }
    form.setFieldValue("Attachment_Required",{label:label,value:value});
  }
  return (
    <Fragment>
        <Row>
         <Col md="3" sm="12">
          <CustomTextInput label={"Parameter Name"} form={form} id="Parameter_Name" type="text"  />
          <CustomTextInput  form={form} id="Id" type="hidden"  />
        </Col>
        <Col md="3" sm="12">
           <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getParameterType`}
            label={"Parameter Type"} form={form} id="Parameter_Type" />
           
        </Col>
        <Col md="3" sm="10">
          <CustomTextInput label={"Order No"} form={form} id="Order_No" type="text"  />
        </Col>
        

        <Col md="3" sm="12">
           <CustomDropdownInput label={"Validation Required"}
           url={`${apiBaseUrl}warehouse/master/get_parament_req`}
            form={form} id="Validation_Required" />
        </Col>
        

        <Col md="3" sm="12">
           <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/get_parament_req`}
            label={"Attachment Required"} form={form} id="Attachment_Required" onChange={(e) => checkAttReq(e)} />
        </Col>
        

        <Col md="3" sm="12">
           <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/get_parament_req`} 
           label={"Attachment Mandatory"} form={form} id="Attachment_Mandatory" isDisabled={form.values.AttachmentMandateDisable}/>
        </Col>

        </Row>
        
        <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  <Col md="2" sm="12">
  <Button.Ripple color="primary" block type="button" onClick={(e) => RefreshPage()}>
                Show
  </Button.Ripple>
              </Col>
     </Row>

     <Master_rndlotconversionlist
        url={WHMaster_ListUrl}
        title={""}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/rndlotconversion:` + row.rnd_lot_parametermasterid );
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
const Master_rndlotconversionentry = () => {
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

      Parameter_Name: validation.required({ message:'Parameter Name should not be empty', isObject: false }),
      Parameter_Type: validation.required({ message:'Parameter type should not be empty', isObject: true }),
      Order_No: validation.required({ message:'Order No should not be empty', isObject: false }),
      //Validation_Required: validation.required({ message:'Validation Required should not be empty', isObject: false }),
      //Attachment_Required: validation.required({ message:'Attachment Required should not be empty', isObject: false }),
     // Attachment_Mandatory: validation.required({ message:'Attachment Mandatory should not be empty', isObject: false }),

    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
    console.log("test");
    /*if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }*/
    let formData = form.values;
   // alert(JSON.stringify(formData));
    const FrmData = {
      parametername:formData.Parameter_Name,
      parametertype:formData.Parameter_Type.value,
      sortorderno:formData.Order_No,
      validationrequired:formData.Validation_Required.value,
      attachmentrequired:formData.Attachment_Required.value,
      attachmentmandatory:formData.Attachment_Mandatory.value,
    };
    const postdata = {
      rnd_lot_conversion_id:formData.Id,
      Data:FrmData
    }
    //alert(JSON.stringify(postdata)) ;
    // alert("3");
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/Master/updateMaster_rndlotconversion1", postdata)
      .then((response) => {
        // alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          history.push("/warehouse/masters/rndlotconversion");
          window.location.reload();
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
    history.push(`/master/Master_rndlotconversion1`);
  };
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="R&D Parameters Master">
        <Master_rndlotconversionform form={form}  onSubmit={onSubmit} />
      </CardComponent>
    </Fragment>
  );
};
export default Master_rndlotconversionentry;
