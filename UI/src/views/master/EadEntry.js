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
////import EadEntryForm from "./EadEntryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import EadList from "../List/EadList";
import { eadUrl } from "../../urlConstants";
const EadEntryForm = ({ form,onSubmit }) => {
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
      id: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getEadDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            EadId:data.results[0].id,
            EAD:data.results[0].EAD,
            date:data.results[0].date,
            //ToLocation:data.results[0].To_Location,
           // ModeofTransport:data.results[0].Mode_Of_Transport,
          })
          form.setFieldValue("From_Location", {  label: data.results[0].From_Location,value: data.results[0].From_Location });
          form.setFieldValue("To_Location", {  label: data.results[0].To_Location,value: data.results[0].To_Location });
          form.setFieldValue("Mode_Of_Transport", {  label: data.results[0].Mode_Of_Transport,value: data.results[0].Mode_Of_Transport });
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
    history.push(`/master/ead`);
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Date"} form={form} id="date" type="date"  />
          <CustomTextInput form={form} id="EadId" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getFromLocation`} label={"From Location"} form={form} id="From_Location" />
        </Col> 
        <Col md="4" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getToLocation`} label={"To Location"} form={form} id="To_Location" />
        </Col>
      </Row>
      <Row>
      <Col md="4" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getModeOfTransport`} label={"Mode of Transport"} form={form} id="Mode_Of_Transport" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Ead"} form={form} id="EAD" type="text"  isNumberOnly decimalFormat="10,0"/>
        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  
     </Row>
     <EadList
        url={eadUrl}
        title={"EDA List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/ead:` + row.id );
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


const EadEntry = () => {
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
      date: validation.required({ message:"Date should not be empty", isObject: false }),
      From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
//  alert("1");
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    // alert("2");
   
    let formData = form.values;
   /* if (poData.LINE_ITEM === formData.LINE_ITEM.value) {
      resetForm();
      return;
    }*/
    //alert(JSON.stringify(formData));
    const FrmData = {
     
      date:formData.date,
      From_Location:formData.From_Location.label,
      To_Location:formData.To_Location.label,
      Mode_Of_Transport:formData.Mode_Of_Transport.label,
      EAD:formData.EAD,
    };
    const postdata = {
      id:formData.EadId,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateEad", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        ShowToast("Saved Successfully...");
        //history.push(`/master/ead:`+UsrId);
        history.push(`/master/ead`);
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
    history.push(`/master/ead`);
  };
 
  return (
    <Fragment>
      <RefreshBlock/>
      <CardComponent header="EDA Entry">
        <EadEntryForm form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default EadEntry;
