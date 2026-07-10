import React, { Fragment } from "react";
import { Row, Col, Button, Table } from "reactstrap";
import './MarketRateEntryRowForm.css'; // Import the CSS file
import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

const MarketRateEntryRowForm = ({ form, handleRemove, handleAdd }) => {
  const { marketRates } = form.values;
console.log(marketRates)
  return (
    <Fragment>
      <Table responsive className="custom-table">
        <thead >
          <tr>
            <th>Wheat Variety</th>
            <th>Rate Per Ton</th>
            <th>Mode of Transport</th>
            <th>Delivery At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {marketRates.map((f, i) => (
            f.isDeleted !== "1" && (
              <tr key={i}>
                <td style={{width:"250px"}}>
                  <CustomDropdownInput
                    url={`${apiBaseUrl}marketdata/master/getWheatVariety`}
                    form={form}
                    id={`marketRates.${i}.wheatVariety`}
                  />
                </td>
                <td>
                  <CustomTextInput
                    isNumberOnly
                    form={form}
                    id={`marketRates.${i}.ratePerTon`}
                  />
                </td>
                <td>
                  <CustomDropdownInput
                    url={`${apiBaseUrl}marketdata/master/getModeOfTransport`}
                    form={form}
                    id={`marketRates.${i}.modeOfTransfer`}
                  />
                </td>
                <td style={{width:"200px"}}>
                  <CustomDropdownInput
                    url={`${apiBaseUrl}marketdata/master/getDeliveryAt`}
                    form={form}
                    id={`marketRates.${i}.deliveryAt`}
                  />
                </td>
                <td>
                  <Button.Ripple outline color="danger" type="reset" onClick={(e) => handleRemove(e, i)}>
                    X
                  </Button.Ripple>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </Table>
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
