import React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "reactstrap";

export const CardComponent = ({ header, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{header}</CardTitle>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
};
