import React, { Fragment } from "react";
import { Row, Col,Button } from "reactstrap";

import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

const MarketRateEntryForm = ({ form }) => {
  return (
    <Fragment>
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Date"} form={form} id="date" type="date" disabled />
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getSuppliers`} label={"Supplier Name"} form={form} id="supplierName" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Supplier Category"} form={form} id="supplierCategory" disabled />
        </Col>
      </Row>
     
    </Fragment>
  );
};

export default MarketRateEntryForm;
