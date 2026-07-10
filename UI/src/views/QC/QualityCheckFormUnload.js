import { FormGroup, Input, Progress } from "reactstrap";
import React from "react";
import Select from "react-select";
const yesnoOptions = [
  {
    options: [
      { value: "YES", label: "YES" },
      { value: "NO", label: "NO" },
    ],
  },
];
const ptOptions = [
  {
    options: [
      { value: "HP", label: "HP" },
      { value: "LP", label: "LP" },
    ],
  },
];

const QualityCheckForm = ({ qcFormData, setqcFormData, isViewOnly,CalcTotalAmount,deduction,showLastCol,QD }) => {
  const onChangeQuality = (QcVal,e, item, key, numberOnly) => {
    console.log("item"+JSON.stringify(item))
   
    let { value } = e.target || e;
    let regEx = /[^a-zA-Z0-9.]/gi; 
       
    value = value.replace(regEx, "");
    value=value.length > 5 ? value.slice(0,5) : value;
   
   
let TotalDeduction=0;
    const newData = qcFormData.map((qitem) => {
      console.log(qitem.QCM_REFID);
      console.log(item.QCM_REFID);
      if (qitem.QCM_REFID === item.QCM_REFID) {
        if (numberOnly) {
          if (Number(value) < 0) {
            value = 0;
          } else if (Number(value) > 100) {
            value = 100;
          }
        }
        let newVal = { ...item };
        console.log("key:"+key);
        if (key) {
          return { ...newVal, [key]: value };
        } else {
          let canRemoveVal = isFungusOrRainDamageItem(item.MIC_DESC);
          console.log("canRemoveVal:"+canRemoveVal);
          if (canRemoveVal) {
            const { noOfBagKey, quaraKey } = getFungusAndRainKey(item.FIELD_MAP);
            newVal = { ...item, [noOfBagKey]: null, [quaraKey]: null };
          }
        }
       
       
          //Deduction Calculation
        let DeductionAmt=0;

        if(item.FIELD_MAP=="kernel_bunt_quality"  || item.FIELD_MAP=="soft_wheat_quality" || item.FIELD_MAP=="foreign_matter_quality" || item.FIELD_MAP=="black_wheat_quality" || item.FIELD_MAP=="moisture_quality" || item.FIELD_MAP=="foreign_matter_quality" || item.FIELD_MAP=="mudballs_quality"){
          if((value-item.DeductionSpec)>0){
            let val=1;
            if(item.FIELD_MAP=="soft_wheat_quality" || item.FIELD_MAP=="mudballs_quality" || item.FIELD_MAP=="black_wheat_quality"){
              val=0.5;
            }
            console.log(item.InvoiceQty)
            console.log(item.PORate)
            
            DeductionAmt=((item.InvoiceQty*(item.PORate/1000)*(value-item.DeductionSpec))*val)/100;
          }
        }
        if(item.FIELD_MAP=="insect_damage_wheat_quality"){
          if((value-item.DeductionSpec)>0){
          let val=1;
          DeductionAmt=((item.InvoiceQty*((item.PORate/1000)-10)*(value-item.DeductionSpec))*val)/100;
          }
        }

        if(item.FIELD_MAP=="hl_quality"){
          if((value-item.DeductionSpec)<0){
            DeductionAmt=((item.InvoiceQty*(item.PORate/1000)*(value-item.DeductionSpec))*-1)/100;
          }
        }
        if(item.FIELD_MAP=="infestation_quality"){
         if(value.toUpperCase()=="YES" && item.VehType=="Container"){
          DeductionAmt=1500
         }else{
          if(value.toUpperCase()=="YES" && item.VehType=="Truck"){
            DeductionAmt=(item.InvoiceQty/1000)*25;
           }
         }
        }
        //if(item.FIELD_MAP=="broken_wheat_quality" || item.FIELD_MAP=="shriveled_wheat_quality" || item.FIELD_MAP=="immature_wheat_quality")
          if(item.FIELD_MAP=="immature_wheat_quality"){
          let GroupDeduction=GetGroupDeduction(item.FIELD_MAP,value);
          console.log(GroupDeduction);
          if(item.DeductionSpec>0){
         //   console.log(GroupDeduction-item.DeductionSpec);
          if((GroupDeduction-item.DeductionSpec)>0){
            DeductionAmt=((item.InvoiceQty*(item.PORate/1000)*(GroupDeduction-item.DeductionSpec))*0.5)/100;
           // console.log(DeductionAmt);
          }
          
        }
          
        }
       
        DeductionAmt=DeductionAmt.toFixed(0);
        let Diff=0;
        if (Number(value) >= 0) {
          Diff=(value-item.qvalue).toFixed(2);
        }else{
          console.log("value:"+value+" &qvalue:"+item.qvalue)
          if(value!=item.qvalue){
            Diff="diff";
          }
        }
        
        document.getElementById("AcceptedDeductionAmount_"+qitem.QCM_REFID).value=DeductionAmt;
        return { ...newVal, qvalue2: value, qlabel2: e.label,qcDiff:Diff,
          SystemDeductionAmt:DeductionAmt,AcceptedDeductionAmount:DeductionAmt || "" };
      }

     // TotalDeduction=TotalDeduction+qitem.SystemDeductionAmt;
      return qitem;
    });
    //console.log(JSON.stringify(newData));
   
   setqcFormData(newData);
    //setFormaData({ ...formData, ...podata });
    CalcTotalAmount(newData);
  

  };
  const onchangeAmount = (e,Id,item) =>{
   // console.log(e);
   // console.log(e.target.value);
   let regEx = /[^0-9.]/gi;
   let Val=e.target.value;
   Val = Val.replace(regEx, "");

    let DeductionAmt=Val;
    let TotalDeduction=0;
    const newData =qcFormData.map((qitem) => {
         
      if (qitem.QCM_REFID === item.QCM_REFID) {
        let newVal = { ...item };
        return { ...newVal,AcceptedDeductionAmount:DeductionAmt || "" };
      }
      return qitem;
    });
      setqcFormData(newData);
      CalcTotalAmount(newData);
      }
  const GetGroupDeduction = (Key,Value) =>{
    let Deduction=0;
    for(let i=0;i<qcFormData.length;i++){
      // if(qcFormData[i].FIELD_MAP=="broken_wheat_quality" || qcFormData[i].FIELD_MAP=="shriveled_wheat_quality" || qcFormData[i].FIELD_MAP=="immature_wheat_quality"){
      if(qcFormData[i].FIELD_MAP=="immature_wheat_quality"){
        let Addvalue=qcFormData[i].qvalue2;
       if (qcFormData[i].FIELD_MAP ===Key) {
         Addvalue=Value;
       }
       Deduction=parseFloat(Deduction)+parseFloat(Addvalue);
 
     }
    }
    
    return Deduction;
  }

 
  const getProgressIndicator = (value, min, max) => {
    if(value=="" || value==undefined){
      return false;
    }
    let val = value.toString();
    let numVal = Number(value);
    if (val && val.length && min && max) {
      if (numVal > Number(max) || numVal < Number(min)) {
        return "progress-bar-danger";
      } else return "progress-bar-success";
    } else if (val && val.length && (!min || !max)) {
      return val === "YES" || val === "HP" ? "progress-bar-danger" : "progress-bar-success";
    } else return "progress-bar";
  };

 
  return (
    <>
      {qcFormData.map((item, index) => {
        const { QCM_REFID,MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, qvalue, qlabel, FIELD_MAP, PreferredMax, PreferredMin,
          qvalue2,qlabel2,qcDiff,DeductionSpec,SystemDeductionAmt,AcceptedDeductionAmount } = item;

        const _UOM = UOM ? UOM : "";
        const isNotProteinType = MIC_DESC !== "Protein Type";
        const isYesNoType = isNotProteinType && !MAX_VALUE;
        let row = (
          <tr key={`qr_${MIC_DESC}_${FIELD_MAP}`}>
            <td>
              <span className="align-middle">{MIC_DESC}</span>
            </td>
            <td >
              {isViewOnly ? (
                <FormGroup className="m-0">
                  <span>{qvalue}</span>
                </FormGroup>
              ) : (
                <FormGroup className="m-0">
                  {MAX_VALUE ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                     
                      value={qvalue}
                      maxLength={3}
                    />
                  ) : (
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      value={{
                        label: qlabel,
                        value: qvalue,
                      }}
                      options={isNotProteinType ? yesnoOptions : ptOptions}
                     
                    />
                  )}
                </FormGroup>
              )}
            </td>
            
            <td>
              {!isYesNoType && (
                <FormGroup className="m-0">
                  <span type="number">{MIN_VALUE ? MIN_VALUE + "" + _UOM : "-"}</span>
                </FormGroup>
              )}
            </td>
            <td>
              {!isYesNoType && (
                <FormGroup className="m-0">
                  <span type="number">{MAX_VALUE ? MAX_VALUE + "" + _UOM : "-"}</span>
                </FormGroup>
              )}
            </td>

            <td >
              <Progress
                className={getProgressIndicator(qvalue, PreferredMin ? PreferredMin : MIN_VALUE, PreferredMax ? PreferredMax : MAX_VALUE)}
                value={100}
              />
            </td>
            <td>
              
                <FormGroup className="m-0">
                  {MAX_VALUE ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      onChange={(e) => onChangeQuality(qvalue2,e, item, undefined, true)}
                      value={qvalue2}
                      style={{width:"80px"}}
                      maxLength={3}
                      disabled={showLastCol || QD==1}
                    />
                  ) : (
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      value={{
                        label: qlabel2,
                        value: qvalue2,
                      }}
                      options={showLastCol || QD==1 ? "" : isNotProteinType ? yesnoOptions : ptOptions}
                      onChange={(e) => onChangeQuality(qvalue2,e, item)}
                    />
                  )}
                </FormGroup>
            
            </td>
            <td>
              <Progress
                className={getProgressIndicator(qvalue2, PreferredMin ? PreferredMin : MIN_VALUE, PreferredMax ? PreferredMax : MAX_VALUE)}
                value={100}
              />
            </td>
            <td >
            <Input
                      type="text"
                      min={0}
                      max={100}
                      style={{width:"80px"}}
                      value={qcDiff}
                      disabled={true}
                   
                      maxLength={3}
                    />
            </td>
            <td >
            <Input
                      type="number"
                      min={0}
                      max={100}
                      style={{width:"80px"}}
                      value={DeductionSpec}
                      disabled={true}
                      maxLength={3}
                    />
            </td>

            <td >
            <Input
                      type="number"
                      min={0}
                      max={100}
                      style={{width:"80px"}}
                      disabled={true}
                      value={SystemDeductionAmt}
                    
                    />
            </td>

            <td style={{display:showLastCol==true ? "":"none"}}>
            <Input
                      type="text"
                      pattern="\d*"
                      //min={0}
                      //max={100}
                      style={{width:"80px"}}
                      value={AcceptedDeductionAmount}
                 maxLength={5}
                      disabled={QD==1}
                      id={"AcceptedDeductionAmount_"+QCM_REFID}
                      onChange={(e) => onchangeAmount(e, QCM_REFID,item)}
                      
                    />
            </td>
          </tr>
        );
        if (canShowQuarantineRow(item, MIC_DESC)) {
          return (
            <>
              {row}
              {getRow(index, onChangeQuality, FIELD_MAP, item, isViewOnly)}
            </>
          );
        }
        return row;
      })}
    </>
  );
};

export default QualityCheckForm;

export function canShowQuarantineRow(item, desc) {
  return item.qvalue2 === "YES" && isFungusOrRainDamageItem(desc);
}
export function isFungusOrRainDamageItem(desc) {
  //return desc === "Fungus" || desc === "Rain Damage";
  return desc.toUpperCase() === "FUNGUS" || desc.toUpperCase() === "RAIN DAMAGE";
}
export function getFungusAndRainKey(fieldId) {
  return { noOfBagKey: fieldId + ExtraFieldConst.NoOfBags, quaraKey: fieldId + ExtraFieldConst.QUARANTINE };
}
export const ExtraFieldConst = {
  NoOfBags: "_noofbag",
  QUARANTINE: "_quarantine",
};

export const surveyorDeviceType = "surveyor";

let getRow = (index, onChangeQuality, fieldId, item, isViewOnly) => {
  const { noOfBagKey, quaraKey } = getFungusAndRainKey(fieldId);
  return (
    <tr key={`qr_${index}_1`}>
      <td style={{ borderTop: "0px" }}>No.of bags</td>
      <td width="30" style={{ borderTop: "0px" }}>
        <FormGroup className="m-0">
          {/*isViewOnly ? (
            <span>{item[noOfBagKey]}</span>
          ) : (
            
          )}{" "*/}
          <Input type="number" maxLength="3"  style={{width:"80px"}} onChange={(e) => onChangeQuality(item.qvalue2,e, item, noOfBagKey)} value={item[noOfBagKey]} />
        </FormGroup>
      </td>
      <td style={{ borderTop: "0px" }}>Quarantine Lot</td>
      <td width="30" style={{ borderTop: "0px" }}>
        <FormGroup className="m-0">
          {/*isViewOnly ? (
            <span>{item[quaraKey]}</span>
          ) : (
            
          )}{" "*/}
          <Input type="text" maxLength="20"  style={{width:"80px"}} onChange={(e) => onChangeQuality(item.qvalue2,e, item, quaraKey)} value={item[quaraKey]} />
        </FormGroup>
      </td>
      <td width="10" style={{ borderTop: "0px" }}></td>
    </tr>
  );
};

export const validateQualityForm = (qcFormData) => {
  return qcFormData.filter((item) => {
    if (!item.qvalue2) {
      return true;
    } else {
      if (canShowQuarantineRow(item, item.MIC_DESC)) {
        const { noOfBagKey, quaraKey } = getFungusAndRainKey(item.FIELD_MAP);
        return !item[noOfBagKey] || !item[quaraKey];
      }
      return false;
    }
  });
};

export const getQcFormPostData = (qcFormData) => {
  let fields = {};
  qcFormData.forEach((item) => {
    fields[item.FIELD_MAP] = item.qvalue2;
    fields[item.FIELD_MAP+"_SystemDeduction"] = item.SystemDeductionAmt;
    fields[item.FIELD_MAP+"_AcceptedDeduction"] = item.AcceptedDeductionAmount;
 
    if (canShowQuarantineRow(item, item.MIC_DESC)) {
      const { noOfBagKey, quaraKey } = getFungusAndRainKey(item.FIELD_MAP);
      fields[noOfBagKey] = item[noOfBagKey];
      fields[quaraKey] = item[quaraKey];
    }
  });
  return fields;
};
// let getRow = (index, fieldId, item) => {
//   let noOfBagKey = fieldId + ExtraFieldConst.NoOfBags;
//   let quaraKey = fieldId + ExtraFieldConst.QUARANTINE;
//   return (
//     <tr key={`qr_${index}_1`}>
//       <td style={{ borderTop: "0px" }}>No.of bags</td>
//       <td width="30" style={{ borderTop: "0px" }}>
//         <FormGroup className="m-0">
//           <span>{item[noOfBagKey]}</span>
//         </FormGroup>
//       </td>
//       <td style={{ borderTop: "0px" }}>Quarantine Lot</td>
//       <td width="30" style={{ borderTop: "0px" }}>
//         <FormGroup className="m-0">
//           <span>{item[quaraKey]}</span>
//         </FormGroup>
//       </td>
//       <td width="10" style={{ borderTop: "0px" }}></td>
//     </tr>
//   );
// };
