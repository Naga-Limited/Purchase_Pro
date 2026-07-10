import { Col } from "reactstrap";
import React from "react";
import { CustomTextInput } from "../../../forms/custom-form";

export let SendingWeightDetails = ({ form }) => {
  return (
    <>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Empty Wt (In Kgs)"} form={form} id={`sendingWbEmptyWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Load Wt (In Kgs)"} form={form} id={`sendingWbLoadWt`} isNumberOnly disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Net Wt"} form={form} id={`sendingWbNetWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Wt"} form={form} id={`gunnyWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Less Net Wt"} form={form} id={`sendingGunnyLessNetWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Bag Type"} form={form} id="bagType" disabled />
      </Col>

      <Col md="1" sm="12">
        <CustomTextInput label={"Bags(1)"} form={form} id="no_bags" disabled />
      </Col>
      <Col md="1" sm="12">
        <CustomTextInput label={"Bags(2)"} form={form} id="no_bags2" disabled />
      </Col>
      <Col md="1" sm="12">
        <CustomTextInput label={"Bags(3)"} form={form} id="no_bags3" disabled />
      </Col>
    </>
  );
};
