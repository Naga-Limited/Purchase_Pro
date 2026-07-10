import { Card, CardBody, FormGroup,Input, Row, Col, Button } from "reactstrap";

import React, { useEffect, useState,Fragment } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast,ShowToast } from "@helpers/appHelper";
import { apiBaseUrl,vsUrl } from "../../urlConstants";
import { useHistory, useParams } from "react-router";
//import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useLoader } from "../../utility/hooks/useLoader";
//import { addOrUpdateGateOut, getReceivingGateOutValidationSchema, outSideValidation, uploadFile, uploadIfAnyFileExist } from "./common";
//import { PageHeaderText } from "../../../common/PageHeaderText";
//import { statusCode } from "../../../../helper/appHelper";
//import { addFileName, addOption } from "../../../common/Utils";
//import { getSelectedWbOption, WbTypeSelection, SendingWbTypeSelection, isOutSideWb } from "./wb-type-selection";
//import { SendingWeightDetails } from "./sending-weight-details";
//import { PickSlipDetails } from "./pickslip-details";
//import { HrLine } from "../../../common/HrLine";
import { CardComponent } from "../common/CardComponent";
//import { LoadingDetails } from "./loading-details";
//import { WeightDetails } from "./weight-details";
//import PPModal from "../../../../@core/components/ppModel";
//import IasRedirect from "../ias-redirect";

let ChangeVehicleStatusDetails = () => {
  let history = useHistory();
  let [isOpen, setIsOpen] = useState();
  let { showLoader, hideLoader } = useLoader();
  let [dispatchDetails, setDispatchDetails] = useState();

  const [statusData, setStatusdata] = useState([]);

  let { id,mode } = useParams();
  //alert(id);
  //alert(mode);

  

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
   // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
  });
  
  let values = form.values;
  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const getDetails = () => {
    let fdata = {
     id,
     formType:mode
     

    };
    showLoader();
    //alert("ok")
    apiPostMethod(vsUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
       // console.log(data.success);
        if (data.success) {
        //  alert(data.results.ZVA_NUMBER);
          form.setValues({
            Id:data.results.PI_REFID,
            VANumber:data.results.ZVA_NUMBER,
            Mode:mode,
            StatusName:data.results.StatusName
            
          });
          setStatusdata([{ options: data.VehStatus }]);
          document.getElementById("VANumber").disabled=true;
          form.setFieldValue("Status", {  label: data.results.StatusName,value: data.results.VECHICAL_STATUS });
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
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

       let Data={
        VECHICAL_STATUS:formData.Status.value
       }
       if(formData.Mode=='STM' || formData.Mode=='IAS' || formData.Mode=='IRS'){
       Data={
        VEHICLE_STATUS:formData.Status.value
       }
      }
      
       const postdata = {
        id:formData.Id,
         VANumber:formData.VANumber,
         Mode:formData.Mode,
         Status:formData.Status.value,
         Data
   
       }
     //  alert(JSON.stringify(postdata)) ;
      // alert("3");
      console.log(JSON.stringify(postdata))
      
       showLoader();
       apiPostMethod(apiBaseUrl + "Master/ChangevehicleStatus", postdata)
         .then((response) => {
         //  alert("4");
           const { data } = response;
           console.log(JSON.stringify(response))
           
           ShowToast("Saved Successfully...");
           history.push(`/ChangeVehicleStatus`);
         })
         .catch((error) => {
           console.log(JSON.stringify(error))
           errorToast("Something went wrong, please try again after sometime");
         })
         .finally((a) => {
           hideLoader();
         });
     }


  return (
    <Card>
    <CardBody>
    <Fragment>
    <Row>
      <Col md="4" sm="12">
        <CustomTextInput label={"VA Number"} form={form} id="VANumber" type="text" dis  />
        <CustomTextInput form={form} id="Id" type="hidden"  />
        <CustomTextInput form={form} id="Mode" type="hidden"  />
      </Col>
      <Col md="4" sm="12">
      <CustomTextInput label={"Waiting at"} form={form} id="StatusName" type="text" dis  />
      </Col>
      <Col md="4" sm="12">
        <CustomDropdownInput  options={statusData} label={"Status"} form={form} id="Status" />
      </Col>
   
    </Row>
    
    <Row>
    <Col md="2" sm="12">
    <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
              Submit
            </Button.Ripple>
  
</Col>

   </Row>
   
  </Fragment>
  <br /><br /><br /><br /><br /><br />
   </CardBody>
  </Card>
  );
};

export default ChangeVehicleStatusDetails;
