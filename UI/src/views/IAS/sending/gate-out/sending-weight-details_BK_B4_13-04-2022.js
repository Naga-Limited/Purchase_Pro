import { Col,Row } from "reactstrap";
import React,{useState} from "react";
import { CustomTextInput,CustomDropdownInput } from "../../../forms/custom-form";
import { mbagUrl,mbgbagCuttingType,mbgCuttingVendor } from "../../../../urlConstants";
export let SendingWeightDetails = ({ form,isReceivingGateOut,isSendingSide }) => {
  
  const [Type1, setType1] = useState(false);
  const [Type2, setType2] = useState(false);
  const [Type3, setType3] = useState(false);

  const onchageBgType = (e,Key) =>{
    if(e.label=="LOOSE WHEAT" || e.label=="Loose Wheat"){
      
if(Key=="bagType"){
  setType1(true);
  form.setFieldValue("bagType",{label:e.label,value:e.value});
}
if(Key=="bagType2"){
  setType2(true);
  form.setFieldValue("bagType2",{label:e.label,value:e.value});
}
if(Key=="bagType3"){
  setType3(true);
  form.setFieldValue("bagType3",{label:e.label,value:e.value});
}
    }else{
      if(Key=="bagType"){
        
        form.setFieldValue("bagType",{label:e.label,value:e.value});
      }
      if(Key=="bagType2"){
       
        form.setFieldValue("bagType2",{label:e.label,value:e.value});
      }
      if(Key=="bagType3"){
       
        form.setFieldValue("bagType3",{label:e.label,value:e.value});
      }
    }

    
  }
  const onchangeVendor = (e,Key) => {
    if(Key=="bagCuttingVendor"){
     form.values.BagCuttingCharges=e.Charges;
      form.setFieldValue("bagCuttingVendor", {  label: e.label,value:e.value });
    }
    if(Key=="bagCuttingVendor2"){
      form.values.BagCuttingCharges2=e.Charges;
      form.setFieldValue("bagCuttingVendor2", {  label: e.label,value:e.value });
    }
    if(Key=="bagCuttingVendor3"){
      form.values.BagCuttingCharges3=e.Charges;
      form.setFieldValue("bagCuttingVendor3", {  label: e.label,value:e.value });
    }
    
  };
  return (
    <>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Empty Wt (In Kgs)"} form={form} id={`sendingWbEmptyWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Load Wt (In Kgs)"} form={form} id={`sendingWbLoadWt`} isNumberOnly disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"WB Net Wt"} form={form} id={`sendingWbNetWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Wt"} form={form} id={`gunnyWt`} disabled />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Gunny Less Net Wt"} form={form} id={`sendingGunnyLessNetWt`} disabled />
      </Col>


<Row>
      <Col md="3" sm="12">
        {isReceivingGateOut==true && <CustomTextInput label={"Bag Type(1)"} 
       form={form} id="Btype"
        disabled />}
        {isReceivingGateOut==false && <CustomDropdownInput label={"Bag Type(1)"} 
      url={`${mbagUrl}`}
      onChange={(e) => onchageBgType(e,"bagType")}
              form={form} id="bagType"  />}
      </Col>
      <Col md="2" sm="12">
      {isReceivingGateOut==false &&
        <CustomTextInput label={"Bags(1)"} form={form} id="no_bags"  />}

        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags"    />}
      </Col>
      {<Col md="3" sm="12">
       
        {isReceivingGateOut==false &&  <CustomDropdownInput label={"Bag Cutting Type(1)"} 
      url={`${mbgbagCuttingType}`}
      isDisabled={Type1==false} 
              form={form} id="bagCuttingType"  />}
      </Col>}
    
      
      {<Col md="3" sm="12">
       
       {isReceivingGateOut==false && <CustomDropdownInput label={"Bag Cutting Vendor(1)"} 
     url={`${mbgCuttingVendor}`}
     isDisabled={Type1==false} 
     onChange={(e) => onchangeVendor(e,"bagCuttingVendor")}
             form={form} id="bagCuttingVendor"  />}
     </Col>}
     {<Col md="1" sm="12">
      {isReceivingGateOut==false && 
        <CustomTextInput label={"Charges"} disabled={Type1==false} form={form} id="BagCuttingCharges"   />}
      </Col>}

      </Row>
      <Row>
      <Col md="3" sm="12">
        {console.log("isReceivingGateOut:"+isReceivingGateOut)}
        {isReceivingGateOut==true &&<CustomTextInput label={"Bag Type(2)"} 
       form={form} id="Btype2"
        disabled   />}
        {isReceivingGateOut==false && <CustomDropdownInput label={"Bag Type(2)"} 
         url={`${mbagUrl}`}
         onChange={(e) => onchageBgType(e,"bagType2")}
          form={form} id="bagType2"   />}
      </Col>
      <Col md="2" sm="12">
        {/* disabled={isSendingSide}*/}
      {isReceivingGateOut==false && <CustomTextInput label={"Bags(2)"}  form={form} id="no_bags2"  />}
        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags2"  />}
      </Col>
      {<Col md="3" sm="12">
       
       {isReceivingGateOut==false &&     <CustomDropdownInput label={"Bag Cutting Type(2)"} 
     url={`${mbgbagCuttingType}`}
     isDisabled={Type2==false}
             form={form} id="bagCuttingType2"  />}
     </Col>}
     
     {<Col md="3" sm="12">
       
       {isReceivingGateOut==false &&  <CustomDropdownInput label={"Bag Cutting Vendor(2)"} 
     url={`${mbgCuttingVendor}`}
     isDisabled={Type2==false}
     onChange={(e) => onchangeVendor(e,"bagCuttingVendor2")}
             form={form} id="bagCuttingVendor2"  />}
     </Col>}
     { <Col md="1" sm="12">
      {isReceivingGateOut==false && 
        <CustomTextInput label={"Charges"} disabled={Type2==false} form={form} id="BagCuttingCharges2"  />}
      </Col>}


</Row>
<Row>
      <Col md="3" sm="12">
        {isReceivingGateOut==true && <CustomTextInput label={"Bag Type(3)"} 
       form={form} id="Btype3"
        disabled />}

{isReceivingGateOut==false && <CustomDropdownInput label={"Bag Type(3)"}   url={`${mbagUrl}`}
  onChange={(e) => onchageBgType(e,"bagType3")}
        form={form} id="bagType3"   />}
      </Col>
      <Col md="2" sm="12">
        {isReceivingGateOut==false && <CustomTextInput label={"Bags(3)"} form={form} id="no_bags3"  />}
        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags3"  />}
      </Col>
      { <Col md="3" sm="12">
       
       {isReceivingGateOut==false &&   <CustomDropdownInput label={"Bag Cutting Type(3)"} 
     url={`${mbgbagCuttingType}`}
     isDisabled={Type3==false} 
             form={form} id="bagCuttingType3"  />}
     </Col>}
    
     
     {<Col md="3" sm="12">
       
       {isReceivingGateOut==false &&  <CustomDropdownInput label={"Bag Cutting Vendor(3)"} 
     url={`${mbgCuttingVendor}`}
     isDisabled={Type3==false} 
     onChange={(e) => onchangeVendor(e,"bagCuttingVendor3")}
             form={form} id="bagCuttingVendor3"  />}
     </Col>}
     {<Col md="1" sm="12">
      {isReceivingGateOut==false && 
        <CustomTextInput label={"Charges"}   disabled={Type3==false}  form={form} id="BagCuttingCharges3"   />}
      </Col>}
      </Row>
    </>
  );
};
