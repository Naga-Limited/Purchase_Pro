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
////import Master_user_screenentryform from "./Master_user_screenentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_user_screenlist from "../List/Master_user_screenlist";
import { Master_Url } from "../../urlConstants";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
const Master_user_screenentryform = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "Master/getMaster_user_screenDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ID:data.results[0].ID,
            //USER_ID:data.results[0].USER_ID,
            //SCREEN_ID:data.results[0].SCREEN_ID,



          })
          form.setFieldValue("USER_ID", {  label: data.results[0].LOGIN_ID,value: data.results[0].USER_ID });
          form.setFieldValue("SCREEN_ID", {  label: data.results[0].SCREEN_NAME,value: data.results[0].SCREEN_ID });




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

  const Active = (ID,status) => {
    let fdata = {
      ID: ID,
      status:status
    };
    // showLoader();
    let title = status == 0 ? 'Are you sure to DeActivated?' : 'Are you sure to Active?'
    confirmDialog({
      title: title, 
      description: 'User Screen Access',
    }).then((res) => {
    apiPostMethod(apiBaseUrl + "AutoMailMaster/DeactivateUserScreenAccess", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          RefreshPage()
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      // .finally((a) => {
      //   hideLoader();
        
      // });
    });
  };
  const RefreshPage = () => {
    // history.push(`/master/Master_user_screen`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label={"User"} form={form} id="USER_ID" />
          <CustomTextInput  form={form} id="ID" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getscreenname_desc`} label={"Screen"} form={form} id="SCREEN_ID" />
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
     <Master_user_screenlist
        url={Master_Url}
        title={"User Screen Access - List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          let tx1 = row.RecStatus == 1 ? `Active` : "Deactivate";
          let tx2 = row.RecStatus == 1 ? `success` : "danger";
          return (
            <>
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_user_screen:` + row.ID );
              }}
            >
              {tx}
            </Button.Ripple>&nbsp;&nbsp;
            <Button.Ripple
            color={tx2}
            onClick={() => {
              Active(row.ID,row.RecStatus==1 ? 0 : 1);
            }}
          >
            {tx1}
            </Button.Ripple>
            </>
          );
        }}
      />
    </Fragment>
  );
};


const Master_user_screenentry = () => {
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
      SCREEN_ID: validation.required({ message:"Screen should not be empty", isObject: true }),

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
      SCREEN_ID:formData.SCREEN_ID.value,

    };
    const postdata = {
      ID:formData.ID,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemaster_user_screen", postdata)
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
            history.push("/master/Master_user_screen:0");
          }
          else
          {
            history.push("/master/Master_user_screen");
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
    history.push(`/master/Master_user_screen`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="User Screen Access">
        <Master_user_screenentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_user_screenentry;
