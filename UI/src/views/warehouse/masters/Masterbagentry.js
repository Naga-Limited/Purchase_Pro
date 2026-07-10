import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import {  ShowToast } from "@helpers/appHelper";
import { RefreshBlock } from "../../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
//import { CancelSubmitButtons } from "../../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
////import master_bagEntryForm from "./master_bag";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_baglist from "./List/master_baglist";
import { WHMaster_ListUrl } from "../../../urlConstants";
const Master_bagform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id && id!=":0"){
    refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id && id!=":0") {
      onFetchSDIdetailsByBAG_REFID();
    }
  }, [id]);
  const onFetchSDIdetailsByBAG_REFID = () => {
    let fdata = {
      BAG_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "warehouse/Master/getMasterBagDetailsByRefId", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            BAG_REFID:data.results[0].BAG_REFID,
            BAG_NAME:data.results[0].BAG_NAME,
            BAG_CODE:data.results[0].BAG_CODE,
            UOM:data.results[0].uom,
            WEIGHT:data.results[0].WEIGHT,
            WheatWeight:data.results[0].WheatWeight,
            BAGCODE:data.results[0].BAG_CODE,

            FumigationValidity:data.results[0].FumigationValidity,
            FumigationDays:data.results[0].FumigationDays,
            DegassingDays:data.results[0].DegassingDays,
            //BAGNAME:data.results[0].BAG_NAME,
           // UOM:data.results[0].UOM,
          })
          /*form.setFieldValue("BAGNAME", {  label: data.results[0].BAG_NAME,value: data.results[0].BAG_NAME });
          form.setFieldValue("BAGCODE", {  label: data.results[0].BAG_CODE,value: data.results[0].BAG_CODE });
          form.setFieldValue("UOM", {  label: data.results[0].UOM,value: data.results[0].UOM });
          */
          //history.push(`/master/master_bag`);
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
    //history.push(`/master/master_bag`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Bag Code"} form={form} id="BAG_CODE" type="text"  />
          <CustomTextInput form={form} id="BAG_REFID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">         
          <CustomTextInput label={"Bag Name"} form={form} id="BAG_NAME" type="text"  />
        </Col>
        <Col md="4" sm="12">
        <CustomTextInput label={"Unit Of Measurement"} form={form} id="UOM" type="text"  />
        </Col>
      </Row>
      <Row>
      <Col md="4" sm="12">
      <CustomTextInput label={"Weight"} form={form} isNumberOnly decimalFormat="10,3" id="WEIGHT" type="text"  />

        </Col>
      
        
        <Col md="4" sm="12">
        <CustomTextInput label={"Fumigation Validity"} form={form} isNumberOnly 
       id="FumigationValidity" type="text"  />
 
        </Col>
        <Col md="4" sm="12">
        <CustomTextInput label={"Fumigation Days"} form={form} isNumberOnly 
       id="FumigationDays" type="text"  />
 
        </Col>
      </Row>
      <Row>
      <Col md="4" sm="12">
        <CustomTextInput label={"Degassing Days"} form={form} isNumberOnly 
       id="DegassingDays" type="text"  />
 
        </Col>
        <Col md="4" sm="12">
      <CustomTextInput label={"Wheat Weight"} form={form} isNumberOnly decimalFormat="10,3" id="WheatWeight"
       type="text"  />

        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
      </Col>
  
     </Row>
     <Master_baglist
        url={WHMaster_ListUrl}
        title={"Received Bag List"}
        actionRendorer={(row) => {
          let tx = "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/bag:` + row.BAG_REFID );
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


const Master_bagentry = () => {
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
    
     BAG_CODE: validation.required({ message:"Bag code should not be empty", isObject: false }),
      BAG_NAME: validation.required({  message:"Bag Name should not be empty",isObject: false }),
      UOM: validation.required({ message:"UOM should not be empty", isObject: false }),
      WEIGHT: validation.number({  message:"uld be numeric value",isObject: false, decimalAllowed:true }),
      WheatWeight:validation.number({  message:"Wheat Weight be numeric value",isObject: false, decimalAllowed:true }),
      FumigationValidity: validation.number({  message:"Fumigation Validity be numeric value",isObject: false, decimalAllowed:false }),
      FumigationDays: validation.number({  message:"Fumigation Days be numeric value",isObject: false, decimalAllowed:false }),
      DegassingDays: validation.number({  message:"Degassing Days be numeric value",isObject: false, decimalAllowed:false }),
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
      BAG_CODE:formData.BAG_CODE,
      BAG_NAME:formData.BAG_NAME,
      UOM:formData.UOM,
      WEIGHT:formData.WEIGHT,
      WheatWeight:formData.WheatWeight,
      FumigationValidity:formData.FumigationValidity,
      FumigationDays:formData.FumigationDays,
      DegassingDays:formData.DegassingDays,
    };
    const postdata = {
      id:formData.BAG_REFID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/Master/updatemaster_bag1", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");

          if(document.getElementById("BAG_REFID").value=="")
          {
            history.push("/warehouse/masters/bag:0");
          }
          else
          {
            history.push("/warehouse/masters/bag");
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
    history.push(`/warehouse/master/master_bag`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Received Bag Type">
        <Master_bagform form={form}  onSubmit={onSubmit} />
      </CardComponent> 
      
    </Fragment>
  );
};

export default Master_bagentry;
