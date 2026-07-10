import React, { Fragment, useEffect, useState } from "react";
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
////import Master_ngw_fumigation_typeentryform from "./Master_ngw_fumigation_typeentryform";
import { Row, Col,Button, Label } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_fumigation_typelist from "./List/Master_ngw_fumigation_typelist";
import { WHMaster_ListUrl } from "../../../urlConstants";
import Select from "react-select";

const Master_ngw_fumigation_typeentryform = ({ form,onSubmit }) => {
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
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_fumigation_typeById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Fumigation_TypeId:data.results[0].Fumigation_TypeId,
            Fumigation_Type:data.results[0].Fumigation_Type,
            Rate:data.results[0].Rate,
            quick_gas_grm:data.results[0].quick_gas_grm,
            quick_gas_dosing:data.results[0].quick_gas_dosing,

          })
          form.setFieldValue("Status", {  label: data.results[0].Status == 1 ? 'ALP' : data.results[0].Status == 2 ? 'Quick Gas' : data.results[0].Status == 3 ? 'Others':'',value: data.results[0].Status });

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
    history.push(`/warehouse/masters/Master_ngw_fumigation_typeentry`);
  };
  const statusOptions = [
    {
      options: [
        { value: "1", label: "ALP" },
        { value: "2", label: "Quick Gas" },
        { value: "3", label: "Others" },
      ],
    },
  ];
  const [formData, setFormaData] = useState({});
  const { Status } = formData;

  const onTextChange = (e, key) => {
    const newData = {
      ...form,
      [key]: e.target ? e.target.value : e.value,
    };
    updateData(newData);
  };
  const updateData = (data) => {
    setFormaData(data);
  };

  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Fumigation"} form={form} id="Fumigation_Type" type="text"  />
          <CustomTextInput form={form} id="Fumigation_TypeId" type="hidden"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Rate"} form={form} id="Rate" type="text"  />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Gas GRM"} form={form} id="quick_gas_grm" type="text"  />
        </Col><Col md="4" sm="12">
          <CustomTextInput label={"Gas Dosing"} form={form} id="quick_gas_dosing" type="text"  />
        </Col>
        {/* {form.values.Status && 
        <Col md="4" sm="12">
          <CustomTextInput label={"Status"} form={form} id="Status" value={form.values.Status || form.values.Status.value} type="text"  disabled/>
        </Col>} */}
        {/* {!form.values.Status  &&  */}
        <Col md="4" sm="12">
            <Label for="nameMulti">Fumigation Type</Label>
            <CustomDropdownInput
              className="react-select"
              classNamePrefix="select"
              options={statusOptions}
              form={form}
              id="Status"
              // onChange={(e) => onTextChange(e, "Status")}
        />
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
     <Master_ngw_fumigation_typelist
url={WHMaster_ListUrl}
        title={"Fumigation Type Master"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/warehouse/masters/Master_ngw_fumigation_typeentry:` + row.Fumigation_TypeId );
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
const Master_ngw_fumigation_typeentry = () => {
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
      Fumigation_Type: validation.required({ message:"Fumigation Type should not be empty", isObject: false }),

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
      Fumigation_Type:formData.Fumigation_Type,
      Rate:formData.Rate,
      Status:formData.Status.value,
      quick_gas_grm:formData.quick_gas_grm,
      quick_gas_dosing:formData.quick_gas_dosing,
    };
    const postdata = {
      id:formData.Fumigation_TypeId,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_fumigation_type", postdata)
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
            if(document.getElementById("Fumigation_TypeId").value=="")
            {
              history.push("/warehouse/masters/Master_ngw_fumigation_typeentry:0");
            }
            else
            {
              history.push("/warehouse/masters/Master_ngw_fumigation_typeentry");
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
      history.push(`/warehouse/masters/Master_ngw_fumigation_type`);
    };
    return (
      <Fragment>
        <CardComponent header="Master Fumigation Type">
          <Master_ngw_fumigation_typeentryform form={form}  onSubmit={onSubmit} />
        </CardComponent>
      </Fragment>
    );
  };
  export default Master_ngw_fumigation_typeentry;
  