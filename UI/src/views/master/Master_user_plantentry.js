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
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_user_plantlist from "../List/Master_user_plantlist";
import { Master_Url } from "../../urlConstants";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
const Master_user_plantentryform = ({ form,onSubmit }) => {
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
      ID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getMaster_userplantDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ID:data.results[0].ID,
            


          })
          form.setFieldValue("PLANT_ID", {  label: data.results[0].PLANT_NAME,   value: data.results[0].PLANT_ID });
          form.setFieldValue("USER_ID", {  label: data.results[0].LOGIN_ID,   value: data.results[0].USER_ID });
         
          form.setFieldTouched("USER_ID");
          form.setFieldTouched("PRIVILEGE_ID");







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
    //history.push(`/master/Master_user_plant`);
    window.location.reload();
  };
  
  const Reject = (id,RecStatus) => {

    const postdata = {
      id,
      RecStatus,
    }
    
        let title;
        if(RecStatus == '0'){
         title = "Are you sure want to Inactive?"
        }else{
          title = "Are you sure want to Active?"
        }
         
        let msg="User Plant Access"
        confirmDialog({
        title: title,
        description: msg,
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "Master/user_plant_inactive", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            
            errorToast("Rejected Successfully...");
            RefreshPage()
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
        }
      }); 
      }

  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label={"User"} form={form} id="USER_ID" />
          <CustomTextInput  form={form} id="ID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getmasterplantvalueId`} label={"Plant Name"} form={form} id="PLANT_ID" />
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
     <Master_user_plantlist
        url={Master_Url}
        title={"User Plant Access - List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          
          return (
            <>
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_user_plant:` + row.ID );
              }}
            >
              {tx}
            </Button.Ripple>
            {row.RecStatus == 1 &&
            <Button.Ripple
              color="danger"
              className="ml-2"
              onClick={() => {
                Reject(row.ID,'0');
              }}
            >
              {"InActive"}
            </Button.Ripple>}
            {row.RecStatus == 0 &&
            <Button.Ripple
              color="warning"
              className="ml-2"
              onClick={() => {
                Reject(row.ID,'1');
              }}
            >
              {"Activate"}
            </Button.Ripple>}
            </>
          );
        }}
      />
    </Fragment>
  );
};


const Master_user_plantentry = () => {
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
     
      USER_ID: validation.required({ message:"User should not be empty", isObject: true }),
      PLANT_ID: validation.required({ message:"Plant Name should not be empty", isObject: true }),


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
     
      USER_ID:formData.USER_ID.value,
      PLANT_ID:formData.PLANT_ID.value,

    };
    const postdata = {
      ID:formData.ID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_user_plant", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("ID").value=="")
          {
            history.push("/master/Master_user_plant:0");
          }
          else
          {
            history.push("/master/Master_user_plant");
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
    history.push(`/master/Master_user_plant`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="User Plant Access">
        <Master_user_plantentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_user_plantentry;
