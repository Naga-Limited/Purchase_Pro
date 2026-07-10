import { Col } from "reactstrap";
import React, { useEffect,useState } from "react";
import { CustomTextInput } from "../../../forms/custom-form";
import { roundOf, roundOf_3 } from "../../../../helper/appHelper";
import Uploader from "../../../Uploader";

export let WeightDetails = ({ form, isReadOnly }) => {
  const [attachedFiles, setAttachment] = useState({ supp_wb_copy:{} });
  const handleFileChangeAtt = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };
  const values = form.values;
  useEffect(() => {
    if (!isReadOnly && values.wbTicketNumber) {
      let { firstWeight, secondWeight, netWeight } = values.wbTicketNumber;
      firstWeight = Number(firstWeight);
      secondWeight = Number(secondWeight);
      netWeight = Number(netWeight);
      let wbLoadWt = firstWeight > secondWeight ? firstWeight : secondWeight;
      let wbEmptyWt = firstWeight > secondWeight ? secondWeight : firstWeight;

      //todo cal gunnyWt
      form.setFieldValue("wbLoadWt", wbLoadWt);
      form.setFieldValue("wbEmptyWt", wbEmptyWt);
      form.setFieldValue("wbNetWt", netWeight);
    }
  }, [isReadOnly, values.wbTicketNumber]);
  useEffect(() => {
    if (!isReadOnly) {
      let netWt = "";
      if (values.wbLoadWt && !isNaN(values.wbLoadWt) && !isNaN(Number(values.wbEmptyWt))) {
        netWt = roundOf_3(Number(values.wbLoadWt) - Number(values.wbEmptyWt));  //Mohan 07-09-2022 Changed roundOf function to roundOf_3
      }
      if ((netWt || netWt == 0) && !isNaN(values.wbLoadWt) && !isNaN(Number(values.gunnyWt))) {
        form.setFieldValue("wbNetWt", netWt);
        form.setFieldValue("gunnyLessNetWt", roundOf_3(netWt - Number(values.gunnyWt)));//Mohan 07-09-2022 Changed roundOf function to roundOf_3
      } else {
        form.setFieldValue("wbNetWt", "");
        form.setFieldValue("gunnyLessNetWt", "");
      }
    }
  }, [values.wbLoadWt, values.gunnyWt, values.wbEmptyWt, isReadOnly]);
 // console.log("testing WB details")
 // console.log(JSON.stringify(form));
  return (
    <>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Empty Wt (In Kgs)"} form={form} id={`wbEmptyWt`} isNumberOnly disabled={form.values.wbType && form.values.wbType.value=="1" ? true:isReadOnly} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Load Wt (In Kgs)"} form={form} id={`wbLoadWt`} isNumberOnly disabled={form.values.wbType && form.values.wbType.value=="1" ? true:isReadOnly}  />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Net Wt"} form={form} id={`wbNetWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Wt"} form={form} id={`gunnyWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Less Net Wt"} form={form} id={`gunnyLessNetWt`} disabled />
      </Col>
    
    </>
  );
};
