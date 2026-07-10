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
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_port_of_dischargelist from "../List/Master_port_of_dischargelist";
import { Master_Url } from "../../urlConstants";
const Master_port_of_dischargeentryform = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "Master/getMaster_port_of_dischargeDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id:data.results[0].Id,
            Name:data.results[0].Name,
          })
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
    //history.push(`/master/Master_discharge`);
    window.location.reload();
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Port Name"} form={form} id="Name" type="text"  />
          <CustomTextInput form={form} id="Id" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
        </Col>
      </Row>
      <Row>
      <Col md="2" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
              </Button.Ripple>
    
  </Col>
  
     </Row> 
     <Master_port_of_dischargelist
        url={Master_Url}
        title={"Port of Discharge List"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/Master_discharge:` + row.Id );
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


const Master_port_of_dischargeentry = () => {
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
      Name: validation.required({  message:"Port Name should not be empty",isObject: false }),
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
     
      Name:formData.Name,

    };
    const postdata = {
      Id:formData.Id,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateMaster_port_of_discharge", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        //let UsrId=data.success;
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("Id").value=="")
          {
            history.push("/master/Master_discharge:0");
          }
          else
          {
            history.push("/master/Master_discharge");
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
    history.push(`/master/Master_discharge`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Port of Discharge">
        <Master_port_of_dischargeentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default Master_port_of_dischargeentry;
