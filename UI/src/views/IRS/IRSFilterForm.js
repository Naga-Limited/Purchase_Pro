import React, { Fragment } from "react";
import { Row, Col } from "reactstrap";

import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput } from "../forms/custom-form";
import { CancelSubmitButtons } from "../forms/custom-button";
import { DatePicker } from "../forms/custom-datetime";

const IRSFilterForm = ({ form, onSubmit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
          {/* <DatePicker form={form} id="date2" label={"Date"} /> */}
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getPlants`}
            isMulti
            label={"Plant"}
            form={form}
            id="PlantId"
          />
        </Col>
        
      </Row>
      
    </Fragment>
  );
};

export default IRSFilterForm;
