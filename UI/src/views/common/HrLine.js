import React from "react";
import { Col } from "reactstrap";

export const HrLine = ({ header }) => {
  return (
    <Col md="12" sm="12">
      <hr />
      {header && <h5>{header}</h5>}
    </Col>
  );
};
