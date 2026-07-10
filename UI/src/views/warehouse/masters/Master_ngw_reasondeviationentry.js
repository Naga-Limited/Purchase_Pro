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
////import Master_ngw_reasondeviationentryForm from "./Master_ngw_reasondeviationentryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_reasondeviationlist from "./List/Master_ngw_reasondeviationlist";
import { WHMaster_ListUrl } from "../../../urlConstants";
const Master_ngw_reasondeviationentryForm = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_reasondeviationById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ReasonDeviationId:data.results[0].ReasonDeviationId,
            ReasonDeviation:data.results[0].ReasonDeviation,
            SortOrder:data.results[0].SortOrder,
          })
          // form.setFieldValue("ReasonDeviation", {  label: data.results[0].ReasonDeviation,value: data.results[0].ReasonDeviation });
          // form.setFieldValue("SortOrder", {  label: data.results[0].SortOrder,value: data.results[0].SortOrder });
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
    history.push(`/warehouse/masters/Master_ngw_reasondeviationentry`);
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"REASON FOR DEVIATION"} form={form} id="ReasonDeviation" type="text"  />
          <CustomTextInput form={form} id="ReasonDeviationId" type="hidden"  />
        </Col>
      <Col md="4" sm="12">
          <CustomTextInput label={"SORT ORDER"} form={form} id="SortOrder" type="text"  />
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
     <Master_ngw_reasondeviationlist
url={WHMaster_ListUrl}
        title={"Reason for Deviation Master"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/Master_ngw_reasondeviationentry:` + row.ReasonDeviationId );
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
const Master_ngw_reasondeviationentry = () => {
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
      ReasonDeviation: validation.required({ message:"Reason for Deviation should not be empty", isObject: false }),
      SortOrder: validation.required({ message:"Sort Order should be a valid number", isObject: false }),
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
      ReasonDeviationId:formData.ReasonDeviationId,
      ReasonDeviation:formData.ReasonDeviation,
      SortOrder:formData.SortOrder,
    };
    const postdata = {
      id:formData.ReasonDeviationId,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader(); 
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_reasondeviation", postdata)
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
            if(document.getElementById("ReasonDeviationId").value=="")
            {
              history.push("/warehouse/masters/Master_ngw_reasondeviationentry:0");
            }
            else
            {
              history.push("/warehouse/masters/Master_ngw_reasondeviationentry");
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
      history.push(`/warehouse/masters/Master_ngw_reasondeviationentry`);
    };
    return (
      <Fragment>
        <CardComponent header="Master Reason for Deviation">
          <Master_ngw_reasondeviationentryForm form={form}  onSubmit={onSubmit} />
        </CardComponent>
      </Fragment>
    );
  };
  export default Master_ngw_reasondeviationentry;
  