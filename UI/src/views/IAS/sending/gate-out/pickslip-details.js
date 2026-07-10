import { Col } from "reactstrap";
import React, { useEffect } from "react";
import { errorToast } from "@helpers/appHelper";
import { CustomTextInput } from "../../../forms/custom-form";
import { getPickSlipDetailsForTrailer, PickSlipDropDown } from "./common";
const CalcWBvsSendingWB=(form,sendingWbNetWt)=>{
  //{ sendingWbNetWt,WBCalcWeight } = newData;
  console.log("Inpick slip Function");
  console.log(JSON.stringify(form))
  //let sendingWbNetWt=document.getElementById("sendingWbNetWt").value;
  //let sendingWbNetWt=form.values.sendingWbNetWt;
 // let WBCalcWeight=document.getElementById("WBCalcWeight").value;
  let WBCalcWeight=form.values.WBCalcWeight;
  let WBBufferPercent=document.getElementById("WBBufferPercent").value;
  let WBBufferValue= WBBufferPercent;//Client 26102021 request to change it should consider as value not percentage(%)  
let WeightDiff=sendingWbNetWt-WBCalcWeight;
//let WeightDiffPercent=(WeightDiff/sendingWbNetWt)*100;
/*if(WeightDiffPercent<0){
  WeightDiffPercent=WeightDiffPercent*-1;
}*/
if(WeightDiff<0){
  WeightDiff=WeightDiff*-1;
}
console.log(WeightDiff);
console.log(sendingWbNetWt);
console.log(WBCalcWeight);
console.log(WBBufferValue);
//if((WBBufferPercent > WeightDiffPercent) && WBCalcWeight>0){
//if(!(WeightDiff >= (-1*WBBufferValue) && WeightDiff <= (WBBufferValue))){
if((WeightDiff > WBBufferValue) && WBCalcWeight>0){ 
  errorToast("Pickslip Weight and WB Weight Difference Exceeds "+WBBufferPercent+" KG");
document.getElementById("GateOutButton").style.display="none";
}else{
  document.getElementById("GateOutButton").style.display="";
}
  
}
export let PickSlipDetails = ({ form, disabled, isTruck,ReceivingGateOut, emptyArrivalId }) => {
  let values = form.values;
  useEffect(() => {
    if (values.pickSlipNo) {
      getPickSlipDetailsForTrailer(values.pickSlipNo.value, isTruck, (res) => {
        //console.log(" RES :", res);
        if (res) {
          if(ReceivingGateOut==true){ //Condition Added -Because Gunny weight already assigned in receiving gate out
           delete res.gunnyWt;
           delete res.sendingGunnyLessNetWt;
          }
          form.setValues((val) => ({ ...val, ...res }));
          
          console.log("Start");
          console.log(JSON.stringify(res));
          CalcWBvsSendingWB(form,res.sendingWbNetWt);
        }
      },emptyArrivalId);

     
    }
  }, [values.pickSlipNo]);
  return (
    <>
      <Col md="4" sm="12">
        <PickSlipDropDown disabled={!values.plantId || disabled} plantId={values.plantId} form={form} fixedOption={values.extPickSlipNo} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery Qty"} form={form} id="pickSlipQty" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Wheat Variety"} form={form} id="wheatVariety" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Segment"} form={form} id="segment" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Sending Plant"} form={form} id="sendingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Receiving Plant"} form={form} id="receivingPlant" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Receiving Storage Location"} form={form} id="receivingStorageLocation" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Sending Storage Location"} form={form} id="sendingStorageLocation" disabled />
      </Col>
      {/* <Col md="4" sm="12">
        <CustomTextInput label={"STO PO No"} form={form} id="stoPoNo" disabled />
      </Col> */}
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery No"} form={form} id="deliveryNo" disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Delivery Date"} form={form} id="deliveryDate" disabled />
      </Col>
    </>
  );
};
