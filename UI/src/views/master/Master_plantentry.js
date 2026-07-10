import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, Master_plantUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CardComponent } from "../common/CardComponent";
import moment from "moment";
import { Row, Col, Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Master_plantList from "../List/Master_plantlist";
import { RefreshBlock } from "../common/RefreshBlock";

const Master_plantentryform = ({ form, onSubmit }) => {
  const history = useHistory();
  const { id } = useParams();
  const refid = id && id !== ":0" ? id.replace(":", "") : "";
  const { showLoader, hideLoader } = useLoader();

  // ✅ Define static dropdown options
  const wbOptions = [
    { value: 1, label: "Yes" },
    { value: 0, label: "No" },
  ];

  const CompanyOptions = [
    { value: 1, label: "MMD" },
    { value: 2, label: "OLD Plant" },
    { value: 0, label: "NAGA" },
  ];

  useEffect(() => {
    if (id && id !== ":0") {
      onFetchSDIdetailsById();
    }
  }, [id]);

  const onFetchSDIdetailsById = () => {
    const fdata = { ID: refid };
    showLoader();

    apiPostMethod(apiBaseUrl + "Master/getMaster_plantDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results.length > 0) {
          const result = data.results[0];

          // ✅ Set form values properly
          form.setValues({
            ID: result.ID,
            WERKS: result.WERKS,
            PLANT_NAME: result.PLANT_NAME,
            OwnWB: wbOptions.find((opt) => opt.value == result.OwnWB) || "",
            isMovement: wbOptions.find((opt) => opt.value == result.isMovement) || "",
            plant_subdivision:
              CompanyOptions.find((opt) => opt.value == result.plant_subdivision) || "",
          });

          form.setFieldValue("WH_CODE", {
            label: result.WH_NAME,
            value: result.WH_CODE,
            shouldValidate: true,
          });
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again later");
      })
      .finally(() => {
        hideLoader();
      });
  };

  const RefreshPage = () => window.location.reload();

  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label="Werks" form={form} id="WERKS" type="text" />
          <CustomTextInput form={form} id="ID" type="hidden" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label="Plant Name" form={form} id="PLANT_NAME" type="text" />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput
            menuShouldScrollIntoView
            url={`${apiBaseUrl}marketdata/master/getwarehouses`}
            label="Warehouse"
            form={form}
            id="WH_CODE"
          />
        </Col>
      </Row>

      <Row>
        <Col md="4" sm="3">
          <CustomDropdownInput
            options={wbOptions}
            label="OWN_WB"
            form={form}
            id="OwnWB"
          />
        </Col>
        <Col md="4" sm="3">
          <CustomDropdownInput
            options={CompanyOptions}
            label="Company_Name"
            form={form}
            id="plant_subdivision"
          />
        </Col>
        <Col md="4" sm="3">
          <CustomDropdownInput
            options={wbOptions}
            label="IS_Movement"
            form={form}
            id="isMovement"
          />
        </Col>
      </Row>

      <Row>
        <Col md="2" sm="12">
          <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
            Submit
          </Button.Ripple>
        </Col>
      </Row>

      <Master_plantList
        url={Master_plantUrl}
        title="Plant - List"
        actionRendorer={(row) => {
          const btnText = row.isApproved ? "View" : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => history.push(`/master/Master_plant:` + row.ID)}
            >
              {btnText}
            </Button.Ripple>
          );
        }}
      />
    </Fragment>
  );
};

const Master_plantentry = () => {
  const history = useHistory();
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      WERKS: validation.required({
        message: "WERKS should not be empty",
        isObject: false,
      }),
      PLANT_NAME: validation.required({
        message: "Plant Name should not be empty",
        isObject: false,
      }),
    }),
    onSubmit(values) {},
  });

  const onSubmit = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }

    const formData = form.values;

    const FrmData = {
      WERKS: formData.WERKS,
      PLANT_NAME: formData.PLANT_NAME,
      WH_CODE: formData.WH_CODE?.value || "",
      OwnWB: formData.OwnWB?.value || "",
      isMovement: formData.isMovement?.value || "",
      plant_subdivision: formData.plant_subdivision?.value || "",
    };

    const postdata = {
      ID: formData.ID,
      Data: FrmData,
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateMaster_plant", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.success >= 1) {
          ShowToast("Saved Successfully...");
          if (!formData.ID) {
            history.push("/master/Master_plant:0");
          } else {
            history.push("/master/Master_plant");
          }
        } else {
          errorToast(data.ErrorMsg || "Unable to update record");
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again later");
      })
      .finally(() => {
        hideLoader();
      });
  };

  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Plant">
        <Master_plantentryform form={form} onSubmit={onSubmit} />
      </CardComponent>
    </Fragment>
  );
};

export default Master_plantentry;

