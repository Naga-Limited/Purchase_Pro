import React from "react";
import { FormGroup, Row, Col, Button } from "reactstrap";
import { useHistory } from "react-router";

import { irsUrl } from "../../../urlConstants";
import PortDispatchList from "../PortDispatchList";

const WarehouseDispatchPage = () => {
  const history = useHistory();
  return (
    <>
      {/* <Button.Ripple
        color="primary"
        type="button"
        onClick={(e) => {
          history.push("/whdispatch");
        }}
      >
        Dispatch
      </Button.Ripple> */}
      <Row>
        <Col sm="12" className="mt-2">
          <FormGroup className="d-flex mb-0 justify-content-end">
            <div className="mr-1">
              <Button.Ripple
                color="primary"
                type="button"
                onClick={(e) => {
                  history.push("/IASWHDI");
                }}
              >
                Dispatch
              </Button.Ripple>
            </div>
          </FormGroup>
        </Col>
      </Row>
      <PortDispatchList
        url={irsUrl}
        ScreenName="Port Dispatch"
        title={"Port Dispatch"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/IASPDI${tx}/` + row.id + "/IASPDI");
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />
    </>
  );
};

export default WarehouseDispatchPage;
