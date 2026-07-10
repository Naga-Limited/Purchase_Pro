import { FormGroup, Row, Col, Button } from "reactstrap";
import React from "react";
import { StopCircle, Check } from "react-feather";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl } from "../../../../urlConstants";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { PlantIdDropdown } from "../../../common/PlantIdDropdown";
import { useAuth } from "../../../../utility/hooks/useAuth";
import { statusCode } from "../../../../helper/appHelper";

const IasEmptyVehicleArrivalForm = ({ onAdded, gateInStatus, isTruck }) => {
  let { showLoader, hideLoader } = useLoader();
  let { defaultPlantId } = useAuth();
  const screenType = "EVADP";
  const onAdd = (status) => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;

    let fdata = {
      DRIVER_NO: formData.driverNo,
      PLANT_ID: formData.plant.value,
      PLANT_NAME: formData.plant.label,
      SCREEN_TYPE: screenType,
      VEHICLE_STATUS: status,
      formType: "A",
      isTruck: isTruck,
    };
    if (isTruck) {
      fdata.TRUCK_NO = formData.trailerNo;
    } else {
      fdata.TRAILER_NO = formData.trailerNo;
    }
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
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
  const checktext = (e) => {
    if(e.which==32){
      return false;
    }
  }
  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      trailerNo: "",
      driverNo: "",
      plant: defaultPlantId,
    },
    validationSchema: Yup.object().shape({
      trailerNo: validation.required(),
      driverNo: validation.driverNumber,
      plant: validation.required(),
    }),
    onSubmit(values) {},
  });
  return (
    <Row>
      <Col md="4" sm="12">
        <CustomTextInput maxlength={10} SpaceNotAllow={1} label={isTruck ? "Vehicle Number" : "Trailer No"} form={form} id="trailerNo" toUpper />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver No"} isNumberOnly form={form} id="driverNo" />
      </Col>
      <Col md="4" sm="12">
        <PlantIdDropdown form={form} id="plant" />
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={(e) => onAdd(statusCode.IN)}>
              <StopCircle size={16} className="mr-1" />
              Wait Outside
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => onAdd(gateInStatus)}>
            <Check size={16} className="mr-1" />
            Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </Row>
  );
};

export default IasEmptyVehicleArrivalForm;
