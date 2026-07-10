import { Card, CardBody, FormGroup, Row, Col, Button } from "reactstrap";
import { apiPostMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import { apiBaseUrl, irsUrl, masterUrl } from "../../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { getNewId } from "../../../utility/Common";
import { roundOf } from "../../../helper/appHelper";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
const bagedOrLooseOption = [
  {
    value: "Loose",
    label: "Loose",
  },
  {
    value: "Baged",
    label: "Baged",
  },
];
export const PoDetailForm = (props) => {
  let { form, index, viewOnly } = props;
  let values = form.values.poList[index];
  useEffect(() => {
    if (values.packedType) {
      if (values.noOfBags && !isNaN(values.noOfBags) && values.bagType) {
        form.setFieldValue(`poList.${index}.gunnyWt`, roundOf(values.noOfBags * Number(values.bagType.weight)));
      } else {
        form.setFieldValue(`poList.${index}.gunnyWt`, "");
      }
    }
  }, [values.noOfBags, values.packedType]);
  const renderField = (label, id, props) => {
    return (
      <Col md="4" sm="12">
        <CustomTextInput label={label} form={form} id={`poList.${index}.${id}`} disabled {...props} />
      </Col>
    );
  };
  return (
    <Row>
      {renderField("Inter Com PO No", "poNumber")}
      {renderField("PO Line Item", "poLineItem")}
      {renderField("Delivery No", "deliveryNo")}
      {renderField("Sister Concern From", "sisterConcernFromDesc")}
      {renderField("Sending Storage Location", "sendingStorageLocationDesc")}
      {renderField("Sister Concern To", "sisterConcernToDesc")}
      {renderField("Receiving Storage Location", "receivingStorageLocationDesc")}
      {renderField("Material No", "materialNo")}
      {renderField("Wheat Variety", "wheatVariety")}
      <Col md="4" sm="12">
        <CustomDropdownInput
          label={"Packed Type - Loose/Baged"}
          options={bagedOrLooseOption}
          isDisabled={viewOnly}
          form={form}
          id={`poList.${index}.packedType`}
        />
      </Col>
      <Col md="4" sm="12">
        <CustomDropdownInput
          label={"If Baged - Bag Type"}
          url={`${masterUrl}?formType=BagTypes`}
          id={`poList.${index}.bagType`}
          form={form}
        />
      </Col>
      {renderField("No Of Bags", "noOfBags", { isNumberOnly: true, disabled: viewOnly })}
      {renderField("Gunny Wt (In Kgs)", "gunnyWt")}
      <Col sm={12}>
        <hr />
      </Col>
    </Row>
  );
};

export const PoDetails = (props) => {
  let { form } = props;
  let { values } = form;
  const getNew = () => {
    return { id: getNewId() };
  };
  const [poNoOptions] = useState([]);
  const getOptions = () => {
    let pos = values.poList.filter((a) => a.interComPoNo).map((a) => a.interComPoNo.label);
    return poNoOptions.filter((a) => {
      return !pos.includes(a.label);
    });
  };
  const onRemove = (e, index) => {
    let newData = [...values.truckList];
    newData.splice(index, 1);
    form.setFieldValue("truckList", newData);
  };
  const onAdd = () => {
    let newData = [...values.truckList, getNew()];
    form.setFieldValue("truckList", newData);
  };
  useEffect(() => {
    if (values.invoiceNo) {
      apiPostMethod(`${irsUrl}`, {
        formType: "GetPoDetailsBySaleInvoiceNo",
        id: values.invoiceNo.value,
      })
        .then((response) => {
          const { data } = response;
          if (data.success) {
            form.setFieldValue(
              "poList",
              data.results.map((p) => ({ ...p, id: getNewId() }))
            );
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    } else {
      form.setFieldValue("poList", []);
    }
  }, [values.invoiceNo]);

  useEffect(() => {
    let total = values.truckList
      .map((a) => Number(a.noOfBags || 0))
      .reduce((p, c) => {
        return p + c;
      }, 0);
    form.setFieldValue("totalBags", total);
  }, [values.truckList]);
  const poOptn = getOptions();
  const isCrossing = values.selection && values.selection.value === "Crossing";
  return (
    <div>
      <Card>
        <CardBody>
          <Row>
            <Col md="12" sm="12">
              <h5>Inter Com PO Details</h5>
            </Col>
          </Row>
          <Row>
            <Col md="3" sm="12">
              <CustomDropdownInput
                label={"Sale Invoice Number"}
                url={`${masterUrl}?formType=GetSalesInvoiceNo`}
                form={form}
                id="invoiceNo"
              />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput maxLength={200} label={"Supplier Name"} form={form} id="supplierName" />
            </Col>
            <Col md="3" sm="12">
              <CustomDropdownInput
                label={"Loading Type"}
                options={[
                  {
                    label: "Crossing",
                    value: "Crossing",
                  },
                  {
                    label: "Warehouse",
                    value: "Warehouse",
                  },
                ]}
                form={form}
                id="selection"
              />
            </Col>

            <Col md="3" sm="12">
              <CustomTextInput label={"Total Bags"} form={form} id="totalBags" disabled />
            </Col>
          </Row>
          <>
            {values.selection && (
              <>
                <Row md="12" sm="12">
                  <Col>
                    <hr />
                  </Col>
                </Row>
                <>
                  {values.truckList &&
                    values.truckList.map((f, i) => {
                      return (
                        <Row key={f.id}>
                          {isCrossing ? (
                            <>
                              <Col md="3" sm="12">
                                <CustomTextInput label={"Truck No"} form={form} id={`truckList.${i}.truckNumber`} />
                              </Col>
                            </>
                          ) : (
                            <>
                              <Col md="3" sm="12">
                                <CustomDropdownInput
                                  label={"Warehouse Name"}
                                  url={`${apiBaseUrl}master/getWarehouse`}
                                  form={form}
                                  id={`truckList.${i}.warehouseName`}
                                />
                              </Col>

                              <Col md="3" sm="12">
                                <CustomTextInput label={"Lot Number"} form={form} id={`truckList.${i}.lotNumber`} />
                              </Col>
                            </>
                          )}
                          <Col md="3" sm="12">
                            <CustomTextInput label={"No of bags"} form={form} id={`truckList.${i}.noOfBags`} />
                          </Col>
                          {i > 0 && (
                            <Col md="3" sm="12">
                              <FormGroup>
                                <Button.Ripple outline color="secondary" type="reset" className="mr-2" onClick={(e) => onRemove(e, i)}>
                                  Remove
                                </Button.Ripple>
                              </FormGroup>
                            </Col>
                          )}
                        </Row>
                      );
                    })}
                </>
                <Row>
                  <Col md="12" sm="12">
                    <Button.Ripple color="primary" type="button" onClick={onAdd}>
                      {isCrossing ? "Add Truck" : "Add Lot"}
                    </Button.Ripple>
                  </Col>
                </Row>
                <Row md="12" sm="12">
                  <Col>
                    <hr />
                  </Col>
                </Row>
              </>
            )}
          </>
          {values.poList.map((f, i) => {
            return (
              <div key={f.id}>
                <PoDetailForm form={form} index={i} poOptions={poOptn} />
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
};
