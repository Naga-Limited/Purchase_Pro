import { Col, Row } from "reactstrap";
import React, { useState } from "react";
import { CustomTextInput, CustomDropdownInput } from "../../../forms/custom-form";
import { mbagUrl, mbgbagCuttingType, mbgCuttingVendor } from "../../../../urlConstants";
export let SendingWeightDetails = ({ form, isReceivingGateOut, isSendingSide }) => {

  const [Type1, setType1] = useState(false);
  const [Type2, setType2] = useState(false);
  const [Type3, setType3] = useState(false);

  const onchageBgType = (e, Key) => {
    if (e.label == "LOOSE WHEAT" || e.label == "Loose Wheat") {

      if (Key == "bagType") {
        setType1(true);
        form.setFieldValue("bagType", { label: e.label, value: e.value });
      }
      if (Key == "bagType2") {
        setType2(true);
        form.setFieldValue("bagType2", { label: e.label, value: e.value });
      }
      if (Key == "bagType3") {
        setType3(true);
        form.setFieldValue("bagType3", { label: e.label, value: e.value });
      }
    } else {
      if (Key == "bagType") {

        form.setFieldValue("bagType", { label: e.label, value: e.value });
      }
      if (Key == "bagType2") {

        form.setFieldValue("bagType2", { label: e.label, value: e.value });
      }
      if (Key == "bagType3") {

        form.setFieldValue("bagType3", { label: e.label, value: e.value });
      }
    }


    //CALC WEIGHT
    console.log(JSON.stringify(form))
    let id = Key;
    let val = "";
    if (id == "bagType" || id == "bagType2" || id == "bagType3") {
      val = e.weight;
    } else {
      let Value = e.target.value;
      if (id == "no_bags" || id == "no_bags2" || id == "no_bags3") {
        let regEx = /[^0-9.]/gi;
        Value = Value.replace(regEx, "");
        //Value=Value>2000 ? Value.slice(0,-1) : Value; 
        let bg1 = id == "no_bags" ? Value : form.values.no_bags && form.values.no_bags != "" ? form.values.no_bags : 0;
        let bg2 = id == "no_bags2" ? Value : form.values.no_bags2 && form.values.no_bags2 != "" ? form.values.no_bags2 : 0;
        let bg3 = id == "no_bags3" ? Value : form.values.no_bags3 && form.values.no_bags3 != "" ? form.values.no_bags3 : 0;

        let Total = parseFloat(bg1) + parseFloat(bg2) + parseFloat(bg3);
        console.log("Total:" + Total);
        Value = Total > 900 ? Value.slice(0, -1) : Value;
      }
      val = Value;
    }

    let bgWeight1 = id == "bagType" ? val : form.values.bagType && form.values.bagType.weight ? form.values.bagType.weight : 0;
    let bgWeight2 = id == "bagType2" ? val : form.values.bagType2 && form.values.bagType2.weight ? form.values.bagType2.weight : 0;
    let bgWeight3 = id == "bagType3" ? val : form.values.bagType3 && form.values.bagType3.weight ? form.values.bagType3.weight : 0;
    let BgCount = id == "no_bags" ? val : form.values.no_bags ? form.values.no_bags : 0;
    let BgCount2 = id == "no_bags2" ? val : form.values.no_bags2 ? form.values.no_bags2 : 0;
    let BgCount3 = id == "no_bags3" ? val : form.values.no_bags3 ? form.values.no_bags3 : 0;

    console.log("bgWeight1:" + bgWeight1);
    console.log("bgWeight2:" + bgWeight2);
    console.log("bgWeight3:" + bgWeight3);
    console.log("BgCount:" + BgCount);
    console.log("BgCount2:" + BgCount2);
    console.log("BgCount3:" + BgCount3);

    let GunnyWeight = (parseFloat(bgWeight1 * BgCount) + parseFloat(bgWeight2 * BgCount2) + parseFloat(bgWeight3 * BgCount3)).toFixed(3);
    let GunneyLessNetweight = (parseFloat(form.values.sendingWbNetWt) - (GunnyWeight)).toFixed(3);//Mohan 07-09-2022 Added to fixed 3 digits

    
    if (id == "bagType") {
      //form.setValues({ ...form.values,"bagType":{value:e.value,label:e.label,weight:e.weight},"gunnyWt":GunnyWeight,"sendingGunnyLessNetWt":GunneyLessNetweight});  
      form.setFieldValue("gunnyWt", GunnyWeight);
      form.setFieldValue("sendingGunnyLessNetWt", GunneyLessNetweight);
    } else if (id == "bagType2") {
      //form.setValues({ ...form.values,"bagType2":{value:e.value,label:e.label,weight:e.weight},"gunnyWt":GunnyWeight,"sendingGunnyLessNetWt":GunneyLessNetweight});  
      form.setFieldValue("gunnyWt", GunnyWeight);
      form.setFieldValue("sendingGunnyLessNetWt", GunneyLessNetweight);
    } else if (id == "bagType3") {
      //form.setValues({ ...form.values,"bagType3":{value:e.value,label:e.label,weight:e.weight},"gunnyWt":GunnyWeight,"sendingGunnyLessNetWt":GunneyLessNetweight});  
      form.setFieldValue("gunnyWt", GunnyWeight);
      form.setFieldValue("sendingGunnyLessNetWt", GunneyLessNetweight);
    } else {
      //form.setValues({ ...form.values,[id]:val,"gunnyWt":GunnyWeight,"sendingGunnyLessNetWt":GunneyLessNetweight});  
      form.setFieldValue([id], val);
      form.setFieldValue("gunnyWt", GunnyWeight);
      form.setFieldValue("sendingGunnyLessNetWt", GunneyLessNetweight);
    }


  }

  const CalCWeight = (e, id) => {
    console.log(JSON.stringify(form))

    let val = "";
    if (id == "bagType" || id == "bagType2" || id == "bagType3") {
      val = e.weight;
    } else {
      let Value = e.target.value;
      if (id == "no_bags" || id == "no_bags2" || id == "no_bags3") {
        let regEx = /[^0-9.]/gi;
        Value = Value.replace(regEx, "");
        //Value=Value>2000 ? Value.slice(0,-1) : Value; 
        let bg1 = id == "no_bags" ? Value : form.values.no_bags && form.values.no_bags != "" ? form.values.no_bags : 0;
        let bg2 = id == "no_bags2" ? Value : form.values.no_bags2 && form.values.no_bags2 != "" ? form.values.no_bags2 : 0;
        let bg3 = id == "no_bags3" ? Value : form.values.no_bags3 && form.values.no_bags3 != "" ? form.values.no_bags3 : 0;

        let Total = parseFloat(bg1) + parseFloat(bg2) + parseFloat(bg3);
        console.log("Total:" + Total);
        Value = Total > 900 ? Value.slice(0, -1) : Value;
      }
      val = Value;
    }

    let bgWeight1 = id == "bagType" ? val : form.values.bagType && form.values.bagType.weight ? form.values.bagType.weight : 0;
    let bgWeight2 = id == "bagType2" ? val : form.values.bagType2 && form.values.bagType2.weight ? form.values.bagType2.weight : 0;
    let bgWeight3 = id == "bagType3" ? val : form.values.bagType3 && form.values.bagType3.weight ? form.values.bagType3.weight : 0;
    let BgCount = id == "no_bags" ? val : form.values.no_bags ? form.values.no_bags : 0;
    let BgCount2 = id == "no_bags2" ? val : form.values.no_bags2 ? form.values.no_bags2 : 0;
    let BgCount3 = id == "no_bags3" ? val : form.values.no_bags3 ? form.values.no_bags3 : 0;

    console.log("bgWeight1:" + bgWeight1)
    console.log("bgWeight2:" + bgWeight2)
    console.log("bgWeight3:" + bgWeight3)
    console.log("BgCount:" + BgCount)
    console.log("BgCount2:" + BgCount2)
    console.log("BgCount3:" + BgCount3)

  

    let GunnyWeight = (parseFloat(bgWeight1 * BgCount) + parseFloat(bgWeight2 * BgCount2) + parseFloat(bgWeight3 * BgCount3)).toFixed(3);
    let GunneyLessNetweight = (parseFloat(form.values.sendingWbNetWt) - (GunnyWeight)).toFixed(3);  //Mohan 07-09-2022 Added to fixed 3 digits
    if (id == "bagType") {
      form.setValues({ ...form.values, "bagType": { value: e.value, label: e.label, weight: e.weight }, "gunnyWt": GunnyWeight, "sendingGunnyLessNetWt": GunneyLessNetweight });
    } else if (id == "bagType2") {
      form.setValues({ ...form.values, "bagType2": { value: e.value, label: e.label, weight: e.weight }, "gunnyWt": GunnyWeight, "sendingGunnyLessNetWt": GunneyLessNetweight });
    } else if (id == "bagType3") {
      form.setValues({ ...form.values, "bagType3": { value: e.value, label: e.label, weight: e.weight }, "gunnyWt": GunnyWeight, "sendingGunnyLessNetWt": GunneyLessNetweight });
    } else {
      form.setValues({ ...form.values, [id]: val, "gunnyWt": GunnyWeight, "sendingGunnyLessNetWt": GunneyLessNetweight });
    }

    //alert("GunnyWeight", GunnyWeight);
  };

  const onchangeVendor = (e, Key) => {
    if (Key == "bagCuttingVendor") {
      form.values.BagCuttingCharges = e.Charges;
      form.setFieldValue("bagCuttingVendor", { label: e.label, value: e.value });
    }
    if (Key == "bagCuttingVendor2") {
      form.values.BagCuttingCharges2 = e.Charges;
      form.setFieldValue("bagCuttingVendor2", { label: e.label, value: e.value });
    }
    if (Key == "bagCuttingVendor3") {
      form.values.BagCuttingCharges3 = e.Charges;
      form.setFieldValue("bagCuttingVendor3", { label: e.label, value: e.value });
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
          {isReceivingGateOut == true && <CustomTextInput label={"Bag Type(1)"}
            form={form} id="Btype"
            disabled />}

          {isReceivingGateOut == false && /*Mohan Commented on 10092022 for showing bagname <CustomDropdownInput label={"Bag Type(1)"}
            url={`${mbagUrl}`}
            onChange={(e) => onchageBgType(e, "bagType")}
            form={form} id="bagType"
            isDisabled={true} /*={isSendingSide}* / />*/
            <CustomTextInput label={"Bag Type(1)"}
            form={form} id="Btype"
            disabled />
            }
        </Col>

        <Col md="2" sm="12">
          {isReceivingGateOut == false &&
            <CustomTextInput label={"Bags(1)"} form={form} id="no_bags"
              onChange={(e) => CalCWeight(e, "no_bags")}
              disabled /*={isSendingSide}*/ />
            /*<CustomTextInput label={"Bags(1)"}  form={form} id="no_bags"  />*/
          }

          {isReceivingGateOut == true &&
            <CustomTextInput label={"Bags(1)"} form={form} id="NBags" disabled />}
        </Col>
        {<Col md="3" sm="12">

          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Type(1)"}
            url={`${mbgbagCuttingType}`}
            /*isDisabled={Type1==false} * /
            isDisabled={true}
            form={form} id="bagCuttingType"
          />*/
          <CustomTextInput label={"Bag Cutting Type(1)"} form={form} id="bagCuttingType" disabled />
          }
        </Col>}


        {<Col md="3" sm="12">

          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Vendor(1)"}
            url={`${mbgCuttingVendor}`}
            /*isDisabled={Type1==false} * /
            isDisabled={true}
            onChange={(e) => onchangeVendor(e, "bagCuttingVendor")}
            form={form} id="bagCuttingVendor" />*/
            <CustomTextInput label={"Bag Cutting Vendor(1)"} form={form} id="bagCuttingVendor" disabled />
          }
        </Col>}
        {<Col md="1" sm="12">
          {isReceivingGateOut == false &&
            <CustomTextInput label={"Charges"} /*disabled={Type1==false}*/ disabled form={form} id="BagCuttingCharges" />}
        </Col>}

      </Row>
      <Row>
        <Col md="3" sm="12">
          {console.log("isReceivingGateOut:" + isReceivingGateOut)}
          {isReceivingGateOut == true && <CustomTextInput label={"Bag Type(2)"}
            form={form} id="Btype2"
            disabled />}
          {isReceivingGateOut == false && /*Mohan Commented on 10092022 for showing bagname <CustomDropdownInput label={"Bag Type(2)"}
            url={`${mbagUrl}`}
            onChange={(e) => onchageBgType(e, "bagType2")}
            form={form} id="bagType2" isDisabled={true} />*/
            <CustomTextInput label={"Bag Type(2)"}
            form={form} id="Btype2"
            disabled />

            }
        </Col>
        <Col md="2" sm="12">
          {/* disabled={isSendingSide}*/}
          {isReceivingGateOut == false &&
            <CustomTextInput label={"Bags(2)"}
              onChange={(e) => CalCWeight(e, "no_bags2")}
     /*disabled={isSendingSide}*/ disabled form={form} id="no_bags2" />

            /*<CustomTextInput label={"Bags(2)"}  form={form} id="no_bags2"  />*/

          }
          {isReceivingGateOut == true &&
            <CustomTextInput label={"Bags(1)"} form={form} id="NBags2" disabled />}
        </Col>
        {<Col md="3" sm="12">

          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Type(2)"}
            url={`${mbgbagCuttingType}`}
            /*isDisabled={Type2==false}* /
            isDisabled={true}
            form={form} id="bagCuttingType2" />*/
            <CustomTextInput label={"Bag Cutting Type(2)"} form={form} id="bagCuttingType2" disabled />
            }
        </Col>}

        {<Col md="3" sm="12">

          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Vendor(2)"}
            url={`${mbgCuttingVendor}`}
            /*isDisabled={Type2==false}* /
            isDisabled={true}
            onChange={(e) => onchangeVendor(e, "bagCuttingVendor2")}
            form={form} id="bagCuttingVendor2" />*/
            <CustomTextInput label={"Bag Cutting Vendor(2)"} form={form} id="bagCuttingVendor2" disabled />
            }
        </Col>}
        {<Col md="1" sm="12">
          {isReceivingGateOut == false &&
            <CustomTextInput label={"Charges"} /*disabled={Type2==false}*/ disabled form={form} id="BagCuttingCharges2" />}
        </Col>}


      </Row>
      <Row>
        <Col md="3" sm="12">
          {isReceivingGateOut == true && <CustomTextInput label={"Bag Type(3)"}
            form={form} id="Btype3"
            disabled />}

          {isReceivingGateOut == false && /*Mohan Commented on 10092022 for showing bagname <CustomDropdownInput label={"Bag Type(3)"} url={`${mbagUrl}`}
            onChange={(e) => onchageBgType(e, "bagType3")}
            form={form} id="bagType3" isDisabled={true} />*/
            <CustomTextInput label={"Bag Type(3)"}
            form={form} id="Btype3"
            disabled />

            }
        </Col>
        <Col md="2" sm="12">
          {isReceivingGateOut == false &&
            <CustomTextInput label={"Bags(3)"}
              onChange={(e) => CalCWeight(e, "no_bags3")}
       /*disabled={isSendingSide}*/ disabled form={form} id="no_bags3" />
            /*<CustomTextInput label={"Bags(3)"} form={form} id="no_bags3"  />*/
          }
          {isReceivingGateOut == true &&
            <CustomTextInput label={"Bags(1)"} form={form} id="NBags3" disabled />}
        </Col>

        {<Col md="3" sm="12">
          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Type(3)"}
            url={`${mbgbagCuttingType}`}
            /*isDisabled={Type3==false} * /
            isDisabled={true}
            form={form} id="bagCuttingType3" />*/
            <CustomTextInput label={"Bag Cutting Type(3)"} form={form} id="bagCuttingType3" disabled />
            }
        </Col>}

        {<Col md="3" sm="12">
          {isReceivingGateOut == false && /*<CustomDropdownInput label={"Bag Cutting Vendor(3)"}
            url={`${mbgCuttingVendor}`}
            /*isDisabled={Type3==false} * /
            isDisabled={true}
            onChange={(e) => onchangeVendor(e, "bagCuttingVendor3")}
            form={form} id="bagCuttingVendor3" />*/
            <CustomTextInput label={"Bag Cutting Vendor(3)"} form={form} id="bagCuttingVendor3" disabled />
            }
        </Col>}

        {<Col md="1" sm="12">
          {isReceivingGateOut == false && <CustomTextInput label={"Charges"}  /* disabled={Type3==false} */ disabled={true} form={form} id="BagCuttingCharges3" />}
        </Col>}
      </Row>
    </>
  );
};
