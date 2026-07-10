import { FormGroup, Row, Col, Button } from "reactstrap";
import React, { useEffect, useState } from "react";
import { StopCircle, Check } from "react-feather";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, containerTypeMaster } from "@helpers/appHelper";
import { apiBaseUrl } from "../../../urlConstants";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../../forms/custom-form";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useAuth } from "../../../utility/hooks/useAuth";
import { PlantIdDropdown } from "../../common/PlantIdDropdown";
import { statusCode } from "../../../helper/appHelper";

const YardEmptyTruckArrivalForm = ({ onAdded, initialValues }) => {
  let { showLoader, hideLoader } = useLoader();
  let { defaultPlantId } = useAuth();
  const [screenType] = useState("EVAOY");

  useEffect(() => {
    if (initialValues) {
      form.setSubmitting(false);
      form.setValues(initialValues);
    }
  }, [initialValues]);

  const onAddTruckDetails = (status) => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }

    if (isFilledAll()) {
      return false;
    }

    let formData = form.values;

    let fdata = {
      ID: formData.id,
      TRAILER_NO: formData.trailerNo,
      CONTAINER_NO: formData.containerNo,
      CONTAINER_TYPE: formData.containerType.value,
      DRIVER_NO: formData.driverNo,
      WB_NAME: formData.wbName,
      WB_SERIAL_NO: formData.wbSerialNo,
      WB_EMPTY_WT: formData.wbEmptyWt,
      SCREEN_TYPE: screenType,
      VEHICLE_STATUS: initialValues && initialValues.vehicleStatus ? initialValues.vehicleStatus : status,
      PLANT_ID: formData.plant.value,
      PLANT_NAME: formData.plant.label,
      formType: "A",
    };
    showLoader();
    apiPostMethod(`${apiBaseUrl}EmptyVehicleArrival/addOrUpdateVehicleArrival`, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          form.resetForm();
          onAdded();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      trailerNo: "",
      containerNo: "",
      containerType: "",
      driverNo: "",
      wbName: "",
      wbSerialNo: "",
      wbEmptyWt: "",
      plant: defaultPlantId,
    },
    validationSchema: Yup.object().shape({
      trailerNo: validation.required(),
      containerNo: validation.container(),
      // containerType: validation.required(),
      driverNo: validation.number({ min: 10, max: 10 }),
      wbName: validation.required(),
      wbSerialNo: validation.required(),
      wbEmptyWt: validation.required(),
      // plant: validation.required(),
    }),
    onSubmit(values) {},
  });

  const showError = (Id, Msg, show) => {
    if (document.getElementById(Id)) {
        document.getElementById(Id).innerHTML = "";
        if (show == 1) {
            console.log("SHOW ERROR:" + Id);
            document.getElementById(Id).innerHTML = Msg;
        }
    }
  }

  const isFilledAll = () => {
    let ShowError = 0;
    let formData = form.values;
    showError('containerType_Error', 'Select Container Type', 0);
    showError('plant_Error', 'Select Plant', 0);

    if (!formData.containerType) { showError('containerType_Error', 'Select Container Type', 1); ShowError = 1;}
    if (!formData.plant) { showError('plant_Error', 'Select Plant Type', 1); ShowError = 1;}

    if (ShowError == 1) { return true; }
  }

  return (
    <Row>
      <Col md="4" sm="12">
        <CustomTextInput label={"Trailer No"} form={form} id="trailerNo" SpaceNotAllow={1} toUpper />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput toUpper label={"Container No"} form={form} id="containerNo" />
      </Col>
      <Col md="4" sm="12">
        <CustomDropdownInput options={containerTypeMaster} label={"Container Type"} form={form} id="containerType" />
        <span id='containerType_Error' style={{ color: 'red' }} ></span>
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver No"} isNumberOnly form={form} id="driverNo" />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Name"} form={form} id="wbName" />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Serial No"} form={form} id="wbSerialNo" />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput isNumberOnly label={"WB Empty Wt (In Kgs)"} form={form} id="wbEmptyWt" />
      </Col>
      <Col md="4" sm="12">
        <PlantIdDropdown form={form} id="plant" />
        <span id='plant_Error' style={{ color: 'red' }} ></span>
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            {initialValues ? (
              <Button.Ripple
                outline
                color="primary"
                type="button"
                onClick={(e) => {
                  form.resetForm();
                  onAdded(true);
                }}
                key="cancel"
              >
                Cancel
              </Button.Ripple>
            ) : (
              <Button.Ripple outline color="primary" type="button" key="waitout" onClick={(e) => onAddTruckDetails(statusCode.IN)}>
                <StopCircle size={16} className="mr-1" />
                Wait Outside
              </Button.Ripple>
            )}
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => onAddTruckDetails(statusCode.YARD_DISPTACH_INFO)}>
            <Check size={16} className="mr-1" />
            {initialValues ? "Update" : "Gate In"}
          </Button.Ripple>
        </FormGroup>
      </Col>
    </Row>
  );
};

export default YardEmptyTruckArrivalForm;
