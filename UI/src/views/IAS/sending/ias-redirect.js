import { FormGroup, Row, Col, Button } from "reactstrap";
import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation, CustomUploader } from "../../forms/custom-form";
import { useLoader } from "../../../utility/hooks/useLoader";
import { getPickSlipDetailsForTrailer, PickSlipDropDown, updatePickSlipDetails, uploadIfAnyFileExist } from "./gate-out/common";
import { statusCode } from "../../../helper/appHelper";

const IasRedirect = ({ arrivalId, dispatchDetails, receivingArrivalId, onUpdateComplete }) => {
  let { id: dispatchId, isTruck } = dispatchDetails;
  let { showLoader, hideLoader } = useLoader();
  let pickSlipDetail = useRef();
  const form = useFormik({
    // validateOnMount: false,
    isInitialValid: false,
    initialValues: {
      pickSlipQty: "",
      stoPoNo: "",
      receivingPlant: "",
      receivingStorageLocation: "",
    },
    validationSchema: Yup.object().shape({
      pickSlipNo: validation.required().nullable(),
      pickSlipCopy: validation.required(),
    }),
  });
  let values = form.values;

  useEffect(() => {
    if (values.pickSlipNo) {
      showLoader();
      getPickSlipDetailsForTrailer(values.pickSlipNo.value, isTruck == "1", (res) => {
        hideLoader();
        if (res) {
          pickSlipDetail.current = res;
          form.setValues({ ...form.values, ...res });
        }
      });
    }
  }, [values.pickSlipNo]);

  const redirectVehicle = (vehicleStatus) => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();

      return;
    }
    showLoader();
    let filesToUpload = ["pickSlipCopy"];
    uploadIfAnyFileExist(arrivalId, values, filesToUpload, (fileData) => {
      if (!fileData) {
        hideLoader();
      } else {
        let postData = {
          ...pickSlipDetail.current,
          vehicleArrivalId: arrivalId,
          receivingArrivalId: receivingArrivalId,
          intraStateSapId: values.pickSlipNo.value,
          pickSlipNo: values.pickSlipNo.label,
          isRedirected: 1,
          ...fileData,
        };
        if (vehicleStatus) {
          postData.vehicleStatus = vehicleStatus;
        }
        updatePickSlipDetails(dispatchId, postData, (success) => {
          hideLoader();
          if (success) {
            onUpdateComplete();
          }
        });
      }
    });
  };
  return (
    <Row>
      <Col md="12" sm="12">
        <PickSlipDropDown form={form} plantId={0} />
      </Col>
      <Col md="12" sm="12">
        <CustomTextInput label={"STO Po Number"} form={form} id="stoPoNo" disabled />
      </Col>
      <Col md="12" sm="12">
        <CustomTextInput toUpper label={"Pickslip Qty"} form={form} id="pickSlipQty" disabled />
      </Col>
      <Col md="12" sm="12">
        <CustomTextInput label={"Receiving Plant"} form={form} id="receivingPlant" disabled />
      </Col>
      <Col md="12" sm="12">
        <CustomTextInput label={"Receiving Storage Location"} form={form} id="receivingStorageLocation" disabled />
      </Col>
      <Col md="12" sm="12">
        <CustomUploader form={form} label={"Pickslip Copy"} id={"pickSlipCopy"} />
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={(e) => redirectVehicle()}>
              Redirect
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => redirectVehicle(statusCode.INTRANSIT)}>
            Redirect & Gate out
          </Button.Ripple>
        </FormGroup>
      </Col>
    </Row>
  );
};

export default IasRedirect;
