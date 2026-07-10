import React from "react";
import { Row, Col,Button } from "reactstrap";
const RefreshPage = () => {
  window.location.reload();
};
export const RefreshBlock = () => {

  return (
   <>
    <Row>
      <Col md="10" sm="12"></Col>
      <Col md="2" sm="12" >
      <Button.Ripple  color="primary" block type="button" onClick={(e) => RefreshPage()}>
            Refresh
     </Button.Ripple>
        </Col>
        </Row>
        <br></br>
   </>
  );
};
