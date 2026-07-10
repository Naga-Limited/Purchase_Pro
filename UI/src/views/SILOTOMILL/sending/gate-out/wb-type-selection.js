import { Col } from "reactstrap";
import React, { useEffect } from "react";
import { errorToast } from "@helpers/appHelper";
import { CustomDropdownInput, CustomTextInput } from "../../../forms/custom-form";
import { wbOptions } from "../../../UA/GateOut";
import { apiBaseUrl } from "../../../../urlConstants";

export const WB_OUTSIDE_TYPE = "2";

export const isOutSideWb = (form) => {
  return form.values.wbType && form.values.wbType.value === WB_OUTSIDE_TYPE;
};
export const getSelectedWbOption = (label) => {
  return wbOptions[0].options.filter((a) => a.label == label)[0];
};
const CalcWBvsSendingWB=()=>{
  //{ sendingWbNetWt,WBCalcWeight } = newData;
  
  let sendingWbNetWt=document.getElementById("sendingWbNetWt").value;
  let WBCalcWeight=document.getElementById("WBCalcWeight").value;
  let WBBufferPercent=document.getElementById("WBBufferPercent").value;;
let WeightDiff=sendingWbNetWt-WBCalcWeight;
let WeightDiffPercent=(WeightDiff/sendingWbNetWt)*100;
if(WeightDiffPercent<0){
  WeightDiffPercent=WeightDiffPercent*-1;
}

if(WBBufferPercent < WeightDiffPercent){
  errorToast("Pickslip Weight and WB Weight Difference Exceeds "+WBBufferPercent+" Percentage");
document.getElementById("GateOutButton").style.display="none";
}else{
  document.getElementById("GateOutButton").style.display="";
}


  
}
export let WbTypeSelection = ({ form, hideWbTicketNumber, disabled }) => {
  let isOutSide = isOutSideWb(form);
  useEffect(() => {
    if (!disabled) {
      if (isOutSide) {
        form.setFieldValue("wbLoadWt", "");
        form.setFieldValue("wbEmptyWt", "");
        form.setFieldValue("wbNetWt", "");
      } else {
        form.setFieldValue("wbName", "");
        form.setFieldValue("wbSerialNumber", "");
       // CalcWBvsSendingWB();
      }
    }
  }, [disabled, isOutSide]);

  return (
    <>
      <Col md="4" sm="12">
        <CustomDropdownInput label={"WB Type"} options={wbOptions} form={form} id="wbType" isDisabled={disabled} />
      </Col>

      {isOutSide ? (
        <>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Name"} form={form} id="wbName" disabled={disabled} />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Serial Number"} form={form} id="wbSerialNumber" disabled={disabled} />
          </Col>
        </>
      ) : !hideWbTicketNumber ? (
        <Col md="4" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}master/getTicketNo`}
            label={"Ticket No"}
            form={form}
            id="wbTicketNumber"
            isDisabled={disabled}
           // options={ticketOptions}
          />
        </Col>
      ) : (
        ""
      )}
    </>
  );
};

export let SendingWbTypeSelection = ({ form, disabled }) => {
  let isOutSide = form.values.sendingWbType && form.values.sendingWbType.value === WB_OUTSIDE_TYPE;
  useEffect(() => {
    if (!disabled && !isOutSide) {
      form.setFieldValue("sendingWbName", "");
      form.setFieldValue("sendingWbSerialNumber", "");
      //document.getElementById("WBCalcWeight").style.display="";
      CalcWBvsSendingWB();
    }else{
      //document.getElementById("WBCalcWeight").style.display="none";
      if(document.getElementById("GateOutButton")){
        document.getElementById("GateOutButton").style.display="";
      }
      
    }
  }, [disabled, isOutSide]);
  return (
    <>
      <Col md="4" sm="12">
        <CustomDropdownInput label={"WB Type"}  options={wbOptions} form={form} id="sendingWbType"  isDisabled={disabled} />
      </Col>

      {isOutSide && (
        <>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Name"} form={form} id="sendingWbName" disabled={disabled} />
          </Col>
          <Col md="4" sm="12">
            <CustomTextInput label={"WB Serial Number"} form={form} id="sendingWbSerialNumber" disabled={disabled} />
          </Col>
        </>
      )}
    </>
  );
};
