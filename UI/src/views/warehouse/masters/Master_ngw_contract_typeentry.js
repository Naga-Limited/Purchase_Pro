import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
////import Master_ngw_contract_typeentryform from "./Master_ngw_contract_typeentryform";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_contract_typelist from "./List/Master_ngw_contract_typelist";
import { WHMaster_ListUrl } from "../../../urlConstants";
const Master_ngw_contract_typeentryform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  console.log("test");
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
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_contract_typeById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            contracttypeid:data.results[0].contracttypeid,
            contracttype:data.results[0].contracttype,

          })
         //form.setFieldValue("contracttype", {  label: data.results[0].contracttype,value: data.results[0].contracttype });









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
    history.push(`/warehouse/masters/Master_ngw_contract_typeentry`);
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"CONTRACT TYPE"} form={form} id="contracttype" type="text"  />
          <CustomTextInput form={form} id="contracttypeid" type="hidden"  />
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
                Refresh
  </Button.Ripple>
              </Col>
     </Row>
     <Master_ngw_contract_typelist
        url={WHMaster_ListUrl}
        title={"Contract Type Master"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/Master_ngw_contract_typeentry:` + row.contracttypeid );
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
const Master_ngw_contract_typeentry = () => {
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
      contracttype: validation.required({ message:"Contract Type should not be empty", isObject: false }),

    }),
    onSubmit(values) {},
  });
  const values = form.values;

  const onSubmit = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
   let formData=form.values;

   const FrmData = {
      contracttype:formData.contracttype,


    };
    const postdata = {
      id:formData.contracttypeid,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_contract_type", postdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        if(UsrId==-5){
          errorToast("Duplicate Entry");
        }else{
          let RespId=data.success;
          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
            if(document.getElementById("contracttypeid").value=="")
            {
              history.push("/warehouse/masters/Master_ngw_contract_typeentry:0");
            }
            else
            {
              history.push("/warehouse/masters/Master_ngw_contract_typeentry");
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
      history.push(`/warehouse/masters/Master_ngw_contract_type`);
    };
    return (
      <Fragment>
        <CardComponent header="Master Contract Type">
          <Master_ngw_contract_typeentryform form={form}  onSubmit={onSubmit} />
        </CardComponent>
      </Fragment>
    );
  };
  export default Master_ngw_contract_typeentry;
  