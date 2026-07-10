import React, { Fragment } from "react";
import { Row, Col } from "reactstrap";

import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput } from "../forms/custom-form";
import { CancelSubmitButtons } from "../forms/custom-button";
import { DatePicker } from "../forms/custom-datetime";

const MarketRateCaptureFilterForm = ({ form, onSubmit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
          {/* <DatePicker form={form} id="date2" label={"Date"} /> */}
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getWheatVariety`}
            label={"Wheat Variety"}
            form={form}
            id="wheatVariety"
          />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getSuppliers`} label={"Supplier Name"} form={form} id="supplierName" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getSupplierCategory`}
            label={"Supplier Category"}
            form={form}
            id="supplierCategory"
          />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getDeliveryAt`} label={"Delivery At"} form={form} id="deliveryAt" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getModeOfTransport`}
            label={"Mode of Transport"}
            form={form}
            id="modeOfTransport"
          />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getWheatVarietyState`} label={"State"} form={form} id="state" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getWheatVarietyZone`} label={"Zone"} form={form} id="zone" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getWheatVarietyCity`} label={"City"} form={form} id="city" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getWheatVarietySeed`}
            label={"Seed Variety"}
            form={form}
            id="seedVariety"
          />
        </Col>
      </Row>
      <CancelSubmitButtons
        form={form}
        onCancel={() => {
          form.resetForm();
          onSubmit();
        }}
        onSubmit={onSubmit}
        cancelText={"Clear"}
      />
    </Fragment>
  );
};

export default MarketRateCaptureFilterForm;
