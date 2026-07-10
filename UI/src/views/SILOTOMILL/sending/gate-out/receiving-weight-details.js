import { Card, CardBody, Row, Col } from "reactstrap";
import React from "react";
import { CustomTextInput } from "../../../forms/custom-form";
import { wbOptions } from "../../../UA/GateOut";

export let ReceivingWeightDetails = ({ form, showTicket, disabled }) => {
  let isOutSide = form.values.wbType && form.values.wbType.value === "2";
  return (
    <>
      <Col md="4" sm="12">
        <CustomDropdownInput label={"WB Type"} options={wbOptions} form={form} id="wbType" isDisabled={disabled} />
      </Col>

      {isOutSide ? (
        <>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Name"} form={form} id="wbName" disabled={disabled} />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Serial Number"} form={form} id="wbSerialNumber" disabled={disabled} />
          </Col>
        </>
      ) : showTicket ? (
        <Col md="4" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}master/getTicketNo`}
            label={"Ticket No"}
            form={form}
            id="wbTicketNumber"
            isDisabled={disabled}
          />
        </Col>
      ) : (
        ""
      )}
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Empty Wt (In Kgs)"} form={form} id="wbEmptyWt" disabled={!isReceivingGateOut || !isOutSide} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput
          label={"WB Load Wt (In Kgs)"}
          form={form}
          id="wbLoadWt"
          isNumberOnly
          disabled={!isReceivingGateOut || !isOutSide}
        />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Net Wt"} form={form} id="wbNetWt" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Wt"} form={form} id="gunnyWt" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Less Net Wt"} form={form} id="gunnyLessNetWt" disabled />
      </Col>
    </>
  );
};
