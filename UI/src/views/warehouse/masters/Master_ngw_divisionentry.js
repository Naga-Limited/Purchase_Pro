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
////import Master_ngw_divisionentryForm from "./Master_ngw_divisionentryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_divisionList from "./List/Master_ngw_divisionlist";
import { WHMaster_ListUrl } from "../../../urlConstants";
const Master_ngw_divisionentryForm = ({ form,onSubmit }) => {
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
      onFetchSDIdetailsByid();
    }
  }, [id]);
  const onFetchSDIdetailsByid = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_divisionById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            divisionid:data.results[0].divisionid,
            divisionname:data.results[0].divisionname,
            sapdivisioncode:data.results[0].sapdivisioncode,
          })
          //form.setFieldValue("divisionname", {  label: data.results[0].divisionname,value: data.results[0].divisionname });
          //form.setFieldValue("sapdivisioncode", {  label: data.results[0].sapdivisioncode,value: data.results[0].sapdivisioncode });
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
    history.push(`/warehouse/masters/Master_ngw_divisionentry`);
  };
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"DIVISION NAME"} form={form} id="divisionname" type="text"  />
          <CustomTextInput form={form} id="divisionid" type="hidden"  />
        </Col>
      <Col md="4" sm="12">
          <CustomTextInput label={"SAP DIVISION CODE"} form={form} id="sapdivisioncode" type="text"  />
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
     <Master_ngw_divisionList
        url={WHMaster_ListUrl}
        title={"Division Master"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/Warehouse/Masters/Master_ngw_divisionentry:` + row.divisionid );
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
const Master_ngw_divisionentry = () => {
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
      divisionname: validation.required({ message:"Division Name should not be empty", isObject: false }),
      sapdivisioncode: validation.required({ message:"SAP Division Code should not be empty", isObject: false }),
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
      divisionid:formData.divisionid,
      divisionname:formData.divisionname,
      sapdivisioncode:formData.sapdivisioncode,
    };
    const postdata = {
      id:formData.divisionid,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_division", postdata)
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
            if(document.getElementById("divisionid").value=="")
            {
              history.push("/warehouse/masters/Master_ngw_divisionentry:0");
            }
            else
            {
              history.push("/Warehouse/Masters/Master_ngw_divisionentry");
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
      history.push(`/warehouse/masters/Master_ngw_divisionentry`);
    };
    return (
      <Fragment>
        <CardComponent header="Master Division">
          <Master_ngw_divisionentryForm form={form}  onSubmit={onSubmit} />
        </CardComponent>
      </Fragment>
    );
  };
  export default Master_ngw_divisionentry;
  