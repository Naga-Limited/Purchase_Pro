import { Button, Col, Row } from "reactstrap";
import React from "react";

export const CancelButton = ({ text, onClick }) => {
  return (
    <Button.Ripple color="primary" type="button" onClick={onClick} className="mr-1" outline>
      {text || "Cancel"}
    </Button.Ripple>
  );
};

export const PrimaryButton = ({ text, onClick, className }) => {
  return (
    <div style={{
      paddingBottom:"21px"
    }}>
    <Button.Ripple color={"primary"} style={{width:"150px"}} type="button" onClick={onClick} className={className === undefined ? "mr-1" : ""}>
      {text || "Submit"}
    </Button.Ripple>
    </div>
  );
};

export const CancelSubmitButtons = ({ onCancel, form, onSubmit, cancelText, submitText }) => {
  const handleSubmit = (e) => {
    if (form && !form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    onSubmit(e);
  };
  return (
    <Row>
      <Col className="text-right">
        <CancelButton onClick={onCancel} text={cancelText} />
        <PrimaryButton onClick={handleSubmit} text={submitText} />
      </Col>
    </Row>
  );
};
