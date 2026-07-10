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
//import Master_ngw_fumigation_statusentryForm from "./Master_ngw_fumigation_statusentryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_fumigation_statuslist from "./List/Master_ngw_fumigation_statuslist";
import { WHMaster_ListUrl } from "../../../urlConstants";
const Master_ngw_fumigation_statusentryForm = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "warehouse/master/GetMaster_ngw_fumigation_statusById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Fumigation_StatusId:data.results[0].Fumigation_StatusId,
            Fumigation_Status:data.results[0].Fumigation_Status,
            SortOrder:data.results[0].SortOrder,
          })
          // form.setFieldValue("Fumigation_Status", {  label: data.results[0].Fumigation_Status,value: data.results[0].Fumigation_Status });
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
    history.push(`/warehouse/masters/Master_ngw_fumigation_statusentry`);
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"FUMIGATION STATUS"} form={form} id="Fumigation_Status" type="text"  />
          <CustomTextInput form={form} id="Fumigation_StatusId" type="hidden"  />
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
     <Master_ngw_fumigation_statuslist
url={WHMaster_ListUrl}
        title={"FUMIGATION STATUS MASTER"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/Master_ngw_fumigation_statusentry:` + row.Fumigation_StatusId );
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
const Master_ngw_fumigation_statusentry = () => {
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
      Fumigation_Status: validation.required({ message:"Fumigation Status should not be empty", isObject: false }),
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
      Fumigation_StatusId:formData.Fumigation_StatusId,
      Fumigation_Status:formData.Fumigation_Status,
      SortOrder:formData.SortOrder,
    };
    const postdata = {
      id:formData.Fumigation_StatusId,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_fumigation_status", postdata)
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
            if(document.getElementById("Fumigation_StatusId").value=="")
            {
              history.push("/warehouse/masters/Master_ngw_fumigation_statusentry:0");
            }
            else
            {
              history.push("/warehouse/masters/Master_ngw_fumigation_statusentry");
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
      history.push(`/warehouse/masters/Master_ngw_fumigation_statusentry`);
    };
    return (
      <Fragment>
        <CardComponent header="Master Fumigation Status">
          <Master_ngw_fumigation_statusentryForm form={form}  onSubmit={onSubmit} />
        </CardComponent>
      </Fragment>
    );
  };
  export default Master_ngw_fumigation_statusentry;
  