import React, { Fragment } from "react";
import { Row, Col,Button } from "reactstrap";

import { apiBaseUrl } from "../urlConstants";
import { CustomDropdownInput } from "./forms/custom-form";
import { CancelSubmitButtons } from "./forms/custom-button";
import { DatePicker } from "./forms/custom-datetime";

const FilterForm = ({ form, onSubmit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <DatePicker form={form} id="date" isDateRange label={"Date Range"} NotLoadOnchange={1} />
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
        {/*<Col md="3" sm="12">
            <Button.Ripple className="ml-2" color="primary" onClick={(e) => onSubmit()}>
                {"Show"}
              </Button.Ripple>
  </Col>*/}
       
      </Row>
      
    </Fragment>
  );
};

export default FilterForm;
