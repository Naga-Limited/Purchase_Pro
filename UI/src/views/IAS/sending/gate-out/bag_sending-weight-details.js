import { Col } from "reactstrap";
import React from "react";
import { CustomTextInput,CustomDropdownInput } from "../../../forms/custom-form";
import { mbagUrl } from "../../../../urlConstants";
export let BagWeightDetails = ({ form,isReceivingGateOut,isSendingSide }) => {
  return (
    <>
      
      <Col md="4" sm="12">
       
       <CustomDropdownInput label={"Bag Type"} 
      url={`${mbagUrl}`}
      isDisabled={isSendingSide}
         form={form} id="bagType"  />
      </Col>
      <Col md="4" sm="12">
       
        {isReceivingGateOut==false && <CustomDropdownInput label={"Bag Type(2)"} 
         url={`${mbagUrl}`}
         isDisabled={isSendingSide}
          form={form} id="bagType2"   />}
      </Col>
      <Col md="4" sm="12">
       

{isReceivingGateOut==false && <CustomDropdownInput label={"Bag Type(3)"}   url={`${mbagUrl}`}
 isDisabled={isSendingSide}
        form={form} id="bagType3"   />}
      </Col>

      <Col md="1" sm="12">
      {isReceivingGateOut==false &&
        <CustomTextInput label={"Bags(1)"} form={form} id="no_bags"  disabled={isSendingSide} />}

        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags"    />}
      </Col>
      <Col md="1" sm="12">
      {isReceivingGateOut==false && <CustomTextInput label={"Bags(2)"}  disabled={isSendingSide} form={form} id="no_bags2"  />}
        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags2"  />}
      </Col>
      <Col md="1" sm="12">
        {isReceivingGateOut==false && <CustomTextInput label={"Bags(3)"} disabled={isSendingSide} form={form} id="no_bags3"  />}
        {isReceivingGateOut==true &&
         <CustomTextInput label={"Bags(1)"} form={form} id="NBags3"  />}
      </Col>
    </>
  );
};
