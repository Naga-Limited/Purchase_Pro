import React, { Fragment, useEffect, useState } from "react";
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
////import Master_vendorentryform from "./Master_vendorentryform";
import { Row, Col,Button, FormGroup } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_vendorlist from "../List/Master_vendorlist";
import { Master_Url } from "../../urlConstants";
import { apiGetMethod } from "../../helper/axiosHelper";
import { useSelector } from "react-redux";
const Master_vendorentryform = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "Master/getMaster_vendorDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id:data.results[0].Id,
            Code:data.results[0].Code,
            Name:data.results[0].Name,
            Category:data.results[0].Category,
            BagCuttingCharge:data.results[0].BagCuttingCharge,
            RelottingCharge:data.results[0].RelottingCharge,
            tds_code:data.results[0].tds_code,
            tds_name:data.results[0].tds_name,
          })
          form.setFieldValue("masterPlantId", {  label: data.results[0].plant_code,value: data.results[0].plant_code });
         // form.setFieldValue("Name", {  label: data.results[0].Name,value: data.results[0].Name });
         // form.setFieldValue("Category", {  label: data.results[0].Category,value: data.results[0].Category });

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
   const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
   const [userPlant, setUserGate] = useState([])
  
      const getUserPlant = () => {
          console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
          apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
              .then((response) => {
                  const data = response.data;
                  if (data.success == true) {
                      setUserGate(data.results)
                  }
              })
              .catch((error) => {
                  console.log(error)
                  errorToast("Something went wrong, please try again after sometime");
              })
      }
       useEffect(() => {
              getUserPlant()
          }, [])
  const RefreshPage = () => {
    // history.push(`/master/Master_vendor`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Code"} form={form} id="Code" type="text" />
          <CustomTextInput form={form} id="Id" type="hidden" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Name"} form={form} id="Name" type="text" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Category"} form={form} id="Category" type="text" />
        </Col>
        <Col sm="4" md="4">
          <FormGroup>
            <CustomDropdownInput
               options={userPlant} label={"Plant"} form={form} id="masterPlantId"
            />
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"BagCuttingCharge"} form={form} isNumberOnly decimalFormat={"10,2"} id="BagCuttingCharge" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"RelottingCharge"} form={form} isNumberOnly decimalFormat={"10,2"} id="RelottingCharge" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"TDS Code"} form={form} id="tds_code" type="text" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"TDS Name"} form={form} id="tds_name" type="text" />
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
     <Master_vendorlist
        url={Master_Url}
        title={"Vendor List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_vendor:` + row.Id );
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


const Master_vendorentry = () => {
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
     
      Code: validation.required({ message:"Code should not be empty", isObject: false }),
      Name: validation.required({ message:"Plant Name should not be empty", isObject: false }),
      Category: validation.required({ message:"Category should not be empty", isObject: false }),








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
     
      Code:formData.Code,
      Name:formData.Name,
      Category:formData.Category,
      BagCuttingCharge:formData.BagCuttingCharge,
      RelottingCharge:formData.RelottingCharge,
      tds_code:formData.tds_code,
      tds_name:formData.tds_name,
      plant_code:formData.masterPlantId.werks
    };
    const postdata = {
      Id:formData.Id,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_vendor", postdata)
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
            history.push("/master/Master_vendor:0");
          }
          else
          {
            history.push("/master/Master_vendor");
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
    history.push(`/master/Master_vendor`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Vendor">
        <Master_vendorentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_vendorentry;
