// WheatTabs.js
import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import InvoiceSubmitWheat from "./InvoiceSubmitWheat";
import InvoiceConfirmTruckContainerFCI from "./InvoiceConfirmTruckContainerFCI";

const WheatTabs = () => {
  const [type, setType] = useState(true); // true = TRUCK , false = RAKE

  return (
    <Card className="p-2">
      <Row className="m-0">

        {/* LEFT TAB */}
        <Col
          md="6"
          sm="6"
          className={
            "d-flex justify-content-center border border-primary p-0 " +
            (type ? "bg-primary" : "")
          }
          onClick={() => setType(true)}
          style={{ cursor: "pointer" }}
        >
          <Button
            color="white"
            className={type ? "text-white" : "text-primary"}
          >
            Truck / Container / FCI
          </Button>
        </Col>

        {/* RIGHT TAB */}
        <Col
          md="6"
          sm="6"
          className={
            "d-flex justify-content-center border border-primary p-0 " +
            (!type ? "bg-primary" : "")
          }
          onClick={() => setType(false)}
          style={{ cursor: "pointer" }}
        >
          <Button
            color="white"
            className={!type ? "text-white" : "text-primary"}
          >
            Rake
          </Button>
        </Col>
      </Row>

      {/* BODY */}
      <CardBody style={{ paddingTop: "20px" }}>
        {type ? (
          <InvoiceConfirmTruckContainerFCI type="TRUCK" />
        ) : (
          <InvoiceSubmitWheat type="RAKE" />
        )}
      </CardBody>
    </Card>
  );
};

export default WheatTabs;
