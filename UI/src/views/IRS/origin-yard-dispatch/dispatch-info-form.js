import { Card, CardBody, Row, Col } from "reactstrap";
import React, { useEffect } from "react";

import { masterUrl } from "../../../urlConstants";
import { roundOf } from "../../../helper/appHelper";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import moment from "moment";
export const DispatchInfoForm = (props) => {

  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  let { form } = props;

  let values = form.values;
  const fumigationOption = [
    {
      value: "Yes",
      label: "Yes",
    },
    {
      value: "No",
      label: "No",
    },
  ];
  useEffect(() => {
    let netWt = 0;
    if (values.wbLoadWt && !isNaN(values.wbLoadWt) && !isNaN(Number(values.wbEmptyWt))) {
      netWt = roundOf(Number(values.wbLoadWt) - Number(values.wbEmptyWt));
    }

    if (netWt && !isNaN(values.wbLoadWt) && !isNaN(Number(values.gunnyWt))) {
      form.setValues({ ...form.values, wbNetWt: netWt, gunnyLessNetWt: roundOf(netWt - Number(values.gunnyWt)) });
    } else {
      form.setValues({ ...form.values, gunnyLessNetWt: "", wbNetWt: "" });
    }
  }, [values.wbLoadWt, values.gunnyWt, values.wbEmptyWt]);

  return (
    <div>
      <Card>
        <CardBody>
          <Row>
            <Col md="12" sm="12">
              <h5>Yard / Warehouse Dispatch Info</h5>
            </Col>
          </Row>
          <Row>
            <Col md="4" sm="12">
              <CustomTextInput label={"Trailer NO"} form={form} id="trailerNo" disabled />
            </Col>

            <Col md="4" sm="12">
              <CustomTextInput label={"Driver No"} form={form} id="driverNo" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Container No"} form={form} id="containerNo" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Container Type"} form={form} id="containerType" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomDropdownInput label={"Port of loading"} url={`${masterUrl}?formType=PortOfLoading`} form={form} id="portOfLoading" />
            </Col>
            <Col md="4" sm="12">
              <CustomDropdownInput label={"Stuffing Vendor"} url={`${masterUrl}?formType=StuffingVendor`} form={form} id="stuffingVendor" />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Stuffing Rate/Ton"} form={form} id="stuffingRate" isNumberOnly />
            </Col>
            <Col md="4" sm="12">
              <CustomDropdownInput
                label={"Yard to Freight Vendor"}
                url={`${masterUrl}?formType=PortFrtVendor`}
                form={form}
                id="yarToPortFrtVendor"
              />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Yard to Port Rate Per Container"} form={form} id="yardToPortRate" isNumberOnly />
            </Col>
            <Col md="4" sm="12">
              <CustomDropdownInput label={"Fumigation Status"} options={fumigationOption} form={form} id="fumigation" />
            </Col>
            {values.fumigation && values.fumigation.value === "Yes" && (
              <>
                <Col md="4" sm="12">
                  <CustomDropdownInput
                    label={"Fumigation Vendor Name"}
                    url={`${masterUrl}?formType=FumigationVendor`}
                    form={form}
                    id="fumigationVendorName"
                  />
                </Col>
                <Col md="4" sm="12">
                  <CustomTextInput label={"Fumigation Rate Per Container"} isNumberOnly form={form} id="fumigationRatePerC" />
                </Col>
              </>
            )}

            <Col md="4" sm="12">
              <CustomDropdownInput label={"Liner Name"} url={`${masterUrl}?formType=LinerName`} form={form} id="linerName" />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Ocean Freight"} form={form} id="linerOceanFrt" />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"WB Name"} form={form} id="wbName" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"WB Serial No"} form={form} id="wbSerialNo" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"WB Empty Wt (In Kgs)"} form={form} id="wbEmptyWt" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"WB Load Wt (In Kgs)"} form={form} id="wbLoadWt" isNumberOnly />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"WB Net Wt (In Kgs)"} form={form} id="wbNetWt" disabled />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Gunny Less Net Wt (In Kgs)"} form={form} id="gunnyLessNetWt" disabled />
            </Col>

            <Col md="4" sm="12">
              <CustomTextInput label={"Loading Date"} max={today} type="date" form={form} id="loadingDate" />
            </Col>
            <Col md="4" sm="12">
              <CustomTextInput label={"Seal No"} form={form} id="serialNo" />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};
