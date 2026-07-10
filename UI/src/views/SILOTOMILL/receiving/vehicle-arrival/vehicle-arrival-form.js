import { FormGroup, Row, Col, Button } from "reactstrap";
import React, { useEffect } from "react";
import { StopCircle, Check } from "react-feather";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl } from "../../../../urlConstants";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";

const VehicleArrivalForm = ({ onAdded }) => {
  let { showLoader, hideLoader } = useLoader();
  const onAddTruckDetails = (status) => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;
    let fdata = {
      PICK_SLIP_NO: formData.pickSlipNo.label,
      EMPTY_VEHICLE_ARRIVAL_ID: formData.pickSlipNo.value,
      ZVA_NUMBER: formData.pickSlipNo.zvaNumber,
      WERKS: formData.receivingPlant,
      TRUCK_NO: formData.trailerNo,
      VEHICLE_TYPE: "Trailer",
      DRIVER_NO: formData.driverNo,
      VECHICAL_STATUS: status,
      SCREEN_TYPE: "IAS",
    };
    if (formData.isTruck == 1) {
      fdata.TRUCK_NO = formData.truckNo;
      fdata.VEHICLE_TYPE = "Truck";
    }
    showLoader();
    apiPostMethod(`${apiBaseUrl}VehicleArrival/addIasVehicle`, fdata)
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
      pickSlipNo: "",
      truckNo: "",
      trailerNo: "",
      containerNo: "",
      driverNo: "",
      sendingPlant: "",
      receivingPlant: "",
    },
    validationSchema: Yup.object().shape({
      pickSlipNo: validation.required({ isObject: true }),
    }),
    onSubmit(values) {},
  });
  let values = form.values;
  useEffect(() => {
    if (values.pickSlipNo) {
      showLoader();
      apiPostMethod(`${apiBaseUrl}IntraStateDispatchInfo/getByArrivalId/${values.pickSlipNo.value}`)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            let res = data.results;
            form.setValues({
              ...values,
              isTruck: res.isTruck,
              sendingPlant: res.pickSlipDetails.sendingPlant,
              receivingPlant: res.pickSlipDetails.receivingPlant,
              truckNo: res.truckNo,
              trailerNo: res.trailerNo,
              containerNo: res.containerNo,
              driverNo: res.driverNo,
            });
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
    }
  }, [values.pickSlipNo]);
  return (
    <Row>
      <Col md="4" sm="12">
        <CustomDropdownInput
          url={`${apiBaseUrl}IntraStateDispatchInfo/getDisptachedPickslipNoByUser`}
          label={"Pick Slip Number"}
          form={form}
          id="pickSlipNo"
        />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Receiving Plant Id"} form={form} id="receivingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Sending Plant Id"} form={form} id="sendingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        {values.isTruck == 1 ? (
          <CustomTextInput label={"Vehicle No"} maxlength={10} form={form} id="truckNo" disabled SpaceNotAllow={1}  />
        ) : (
          <CustomTextInput label={"Trailer No"} form={form} id="trailerNo" disabled SpaceNotAllow={1}  />
        )}
      </Col>
      {values.containerNo && (
        <Col md="4" sm="12">
          <CustomTextInput toUpper label={"Container No"} form={form} id="containerNo" disabled />
        </Col>
      )}
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver No"} isNumberOnly form={form} id="driverNo" disabled />
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={(e) => onAddTruckDetails(1)}>
              <StopCircle size={16} className="mr-1" />
              Wait Outside
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => onAddTruckDetails(4)}>
            <Check size={16} className="mr-1" />
            Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </Row>
  );
};

export default VehicleArrivalForm;
