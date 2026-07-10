import { FormGroup, Input, Progress } from "reactstrap";
import React from "react";
import Select from "react-select";
const yesnoOptions = [
  {
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
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
const SeiveSizeOption = [
  {
    options: [
      { value: "2.75", label: "2.75" },
      { value: "2.25", label: "2.25" },
      { value: "1.75", label: "1.75" },
    ],
  },
];

const QualityCheckForm_STM = ({ qcFormData, setqcFormData, isViewOnly,Readonly }) => {
  const onChangeQuality = (e, item, key, numberOnly) => {
    let { value } = e.target || e;
    let regEx = /[^a-zA-Z0-9.]/gi; 
     value = value.replace(regEx, "");
     console.log("testing");
     console.log(value.length);
    
    value=value.length > 5 ? value.slice(0,5) : value;
    console.log(value);

    const newData = qcFormData.map((qitem) => {
      if (qitem.QCM_REFID === item.QCM_REFID) {
        if (numberOnly) {
          if (Number(value) < 0) {
            value = 0;
          } else if (Number(value) > 100) {
            value = 100;
          }
        }
        let newVal = { ...item };
        if (key) {
          return { ...newVal, [key]: value };
        } else {
          let canRemoveVal = isFungusOrRainDamageItem(item.MIC_DESC);
          if (canRemoveVal) {
            const { noOfBagKey, quaraKey } = getFungusAndRainKey(item.FIELD_MAP);
            newVal = { ...item, [noOfBagKey]: null, [quaraKey]: null };
          }
        }
        return { ...newVal, qvalue: value, qlabel: e.label || "" };
      }
      return qitem;
    });
    setqcFormData(newData);
  };

  const getProgressIndicator = (value, min, max) => {
    if(value==null || value==undefined){
      return false;
    }
    let val = value.toString();
    let numVal = Number(value);
    if (val && val.length && min && max) {
      if (numVal > Number(max) || numVal < Number(min)) {
        return "progress-bar-danger";
      } else return "progress-bar-success";
    } else if (val && val.length && (!min || !max)) {
      return val === "yes" || val === "HP" ? "progress-bar-danger" : "progress-bar-success";
    } else return "progress-bar";
  };

  return (
    <>
      {qcFormData.map((item, index) => {
        const { MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, qvalue, qlabel, FIELD_MAP, PreferredMax, PreferredMin } = item;

        const _UOM = UOM ? UOM : "";
        const isNotProteinType = MIC_DESC !== "Protein Type";
        const isYesNoType = isNotProteinType && !MAX_VALUE;
        let row = (
          <tr key={`qr_${MIC_DESC}_${FIELD_MAP}`}>
            <td>
              <span className="align-middle">{MIC_DESC}</span>
            </td>
            <td width="30">
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
                      onChange={(e) => onChangeQuality(e, item, undefined, true)}
                      value={qvalue}
                      maxLength={3}
                   
                      disabled={Readonly}
                    />
                  ) : (
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      value={{
                        label: qlabel,
                        value: qvalue,
                      }}
                     
                     // options={isNotProteinType ? yesnoOptions : ptOptions}
                     //options={Readonly ? "" : isNotProteinType ? yesnoOptions : ptOptions}
                     options={Readonly ? "" : isNotProteinType ? MIC_DESC=="Seive Size" ? SeiveSizeOption : yesnoOptions :  ptOptions}
                      onChange={(e) => onChangeQuality(e, item)}
                    />
                  )}
                </FormGroup>
              )}
            </td>
            <td width="30">
              {!isYesNoType && (
                <FormGroup className="m-0">
                  <span type="number">{MIN_VALUE ? MIN_VALUE + "" + _UOM : "-"}</span>
                </FormGroup>
              )}
            </td>
            <td width="30">
              {!isYesNoType && (
                <FormGroup className="m-0">
                  <span type="number">{MAX_VALUE ? MAX_VALUE + "" + _UOM : "-"}</span>
                </FormGroup>
              )}
            </td>

            <td width="10">
              <Progress
                className={getProgressIndicator(qvalue, PreferredMin ? PreferredMin : MIN_VALUE, PreferredMax ? PreferredMax : MAX_VALUE)}
                value={100}
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

export default QualityCheckForm_STM;

export function canShowQuarantineRow(item, desc) {
  return item.qvalue === "yes" && isFungusOrRainDamageItem(desc);
}
export function isFungusOrRainDamageItem(desc) {
  return desc === "Fungus" || desc === "Rain Damage";
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
          {isViewOnly ? (
            <span>{item[noOfBagKey]}</span>
          ) : (
            <Input type="number" maxLength="3" onChange={(e) => onChangeQuality(e, item, noOfBagKey)} value={item[noOfBagKey]} />
          )}{" "}
        </FormGroup>
      </td>
      <td style={{ borderTop: "0px" }}>Quarantine Lot</td>
      <td width="30" style={{ borderTop: "0px" }}>
        <FormGroup className="m-0">
          {isViewOnly ? (
            <span>{item[quaraKey]}</span>
          ) : (
            <Input type="text" maxLength="20" onChange={(e) => onChangeQuality(e, item, quaraKey)} value={item[quaraKey]} />
          )}{" "}
        </FormGroup>
      </td>
      <td width="10" style={{ borderTop: "0px" }}></td>
    </tr>
  );
};

export const validateQualityForm = (qcFormData) => {
  return qcFormData.filter((item) => {
    if (!item.qvalue) {
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
    fields[item.FIELD_MAP] = item.qvalue;
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
