import { FormGroup, Input, Label, Col } from "reactstrap";
import React from "react";

export const InputControl = ({ label, type, toUpper, regEx, onChange, ...rest }) => {
  type = type || "text";
  regEx = regEx || /[^a-zA-Z0-9. /()]/gi;
  const onTextChange = (e) => {
    let txt = e.target.value;
    txt = txt.replace(regEx, "");
    if (toUpper) {
      txt = txt.toUpperCase();
    }
    onChange({
      target: {
        value: txt,
      },
    });
  };
  return (
    <FormGroup>
      <Label>{label}</Label>
      <Input type={type} onChange={onTextChange} {...rest} />
    </FormGroup>
  );
};

export const VehicleNoInputControl = ({ ...rest }) => {
  return <InputControl regEx={/^[A-Za-z]{4}\d{6}/g} {...rest} />;
};

export const getTextElement = (lblText, value, mdCls) => {
  const mdClas = mdCls || "4";
  return (
    <Col md={mdClas} sm="12">
      <FormGroup>
        <Label>{lblText}</Label>
        <Input type="text" value={value} disabled placeholder={lblText} />
      </FormGroup>
    </Col>
  );
};
