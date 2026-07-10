import { Col } from "reactstrap";
import React, { useEffect } from "react";
import { CustomTextInput } from "../../../forms/custom-form";
import { getPickSlipDetailsForTrailer, PickSlipDropDown } from "./common";

export let PickSlipDetails = ({ form, disabled, isTruck }) => {
  let values = form.values;
  useEffect(() => {
    if (values.pickSlipNo) {
      getPickSlipDetailsForTrailer(values.pickSlipNo.value, isTruck, (res) => {
        if (res) {
          form.setValues((val) => ({ ...val, ...res }));
        }
      });
    }
  }, [values.pickSlipNo]);
  return (
    <>
      <Col md="4" sm="12">
        <PickSlipDropDown disabled={!values.plantId || disabled} plantId={values.plantId} form={form} fixedOption={values.extPickSlipNo} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Pickslip Qty"} form={form} id="pickSlipQty" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Wheat Variety"} form={form} id="wheatVariety" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Segment"} form={form} id="segment" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery Date"} form={form} id="deliveryDate" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Sending Plant"} form={form} id="sendingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Receiving Plant"} form={form} id="receivingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Receiving Storage Location"} form={form} id="receivingStorageLocation" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Sending Storage Location"} form={form} id="sendingStorageLocation" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"STO PO No"} form={form} id="stoPoNo" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery No"} form={form} id="deliveryNo" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery Date"} form={form} id="deliveryDate" disabled />
      </Col>
    </>
  );
};
