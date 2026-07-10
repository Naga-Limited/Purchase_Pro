import React, { Fragment } from "react";
import { Row, Col, Button } from "reactstrap";

import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

const MarketRateEntryRowForm = ({ form, handleRemove, handleAdd }) => {
  const { marketRates } = form.values;

  return (
    <Fragment>
      {marketRates.map((f, i) => {
        return (
          f.isDeleted !== "1" && (
            <div key={i}>
              <div>
                <Row>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}marketdata/master/getWheatVariety`}
                      label={"Wheat Variety"}
                      form={form}
                      id={`marketRates.${i}.wheatVariety`}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}marketdata/master/getLoadingLocation`}
                      label={"Loading Location"}
                      form={form}
                      id={`marketRates.${i}.loadingDescription`}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}marketdata/master/getModeOfTransport`}
                      label={"Mode of Transport"}
                      form={form}
                      id={`marketRates.${i}.modeOfTransfer`}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}marketdata/master/getDeliveryAt`}
                      label={"Delivery At"}
                      form={form}
                      id={`marketRates.${i}.deliveryAt`}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}master/getBagType`}
                      label={"Bag Type"}
                      form={form}
                      id={`marketRates.${i}.bagName`}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomTextInput
                      isNumberOnly
                      url={`${apiBaseUrl}marketdata/master/getSuppliers`}
                      label={"Rate Per Ton"}
                      form={form}
                      id={`marketRates.${i}.ratePerTon`}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <Button.Ripple outline color="danger" type="reset" className="mr-2 mt-2" onClick={(e) => handleRemove(e, i)}>
                      X
                    </Button.Ripple>
                  </Col>
                </Row>
              </div>
              <Row md="12" sm="12">
                <Col>
                  <hr />
                </Col>
              </Row>
            </div>
          )
        );
      })}
      <Row>
        <Col md="12" sm="12" className="text-right">
          <Button.Ripple color="primary" type="button" onClick={handleAdd}>
            Add
          </Button.Ripple>
        </Col>
      </Row>
    </Fragment>
  );
};

export default MarketRateEntryRowForm;
