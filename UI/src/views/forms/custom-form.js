import { FormGroup, Label, Input, Button, InputGroup } from "reactstrap";
import * as Yup from "yup";
import FormFeedback from "reactstrap/lib/FormFeedback";
import { DropdownControl } from "../../@core/components/dropdown";
import { Paperclip } from "react-feather";
import { errorToast } from "../../helper/appHelper";
import { useState } from "react";
import { previewUrl } from "../../urlConstants";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import { getErrorAndValue } from "./utils";

export { Yup };

export const CustomDateRangeInput = ({ form, label, fromId, toId }) => {
  return (
    <FormGroup>
      <Label>{label || "Date"}</Label>
      <InputGroup>
        <CustomTextInput noFormGroup form={form} id={fromId || "fromDate"} type="date" />
        <CustomTextInput noFormGroup form={form} id={toId || "toDate"} type="date" />
      </InputGroup>
    </FormGroup>
  );
};

export const CustomTextInput = ({ isNumberOnly, id, label, noFormGroup, toUpper, form, placeholder,SpaceNotAllow,MinNumberVal, ...rest }) => {
 //console.log("Start-text:"+label);
 //console.log(SpaceNotAllow)
  let { getFieldProps } = form;

  const textSpaceNotAllow = (e) => {
   
    if(e.which==32){
      return false;
    }
  }
  if (!placeholder ) {
    placeholder = `Enter ${label}`;
  }
 // console.log("Form");
  //console.log(JSON.stringify(form));
  //console.log(id);
  let { touchValue, errorValue } = getErrorAndValue(id, form);
  const inputProps = getFieldProps(id);
  let controlHtml = (
    <>
      {label && <Label>{label}</Label>}
      {isNumberOnly ? (
        <NumberOnlyInput
          type="text"
          name={id}
          id={id}
          placeholder={placeholder}
          {...inputProps}
          value={inputProps.value === undefined ? "" : inputProps.value}
          onChange={(e) => {
            let val=e.target.value;
            if(Number(MinNumberVal)>0 && Number(MinNumberVal)>Number(val)){
              val=MinNumberVal;
            }
            form.setFieldValue(id, toUpper ? val.toUpperCase() :val );

          }}
          {...rest}
        />
      ) : (
        <Input
          type="text"
          name={id}
          id={id}
         
          placeholder={placeholder}
         
          {...getFieldProps(id)}
          value={inputProps.value === undefined ? "" : inputProps.value}
          onChange={(e) => {
            let val = e.target.value;
            if(SpaceNotAllow==1){
              let regEx = / /gi;
              val = val.replace(regEx, "");
            }
            if (!rest.type || rest.type === "text" && id!="SRNO") {
              let regEx = /[^a-zA-Z0-9. ]/gi;
              // let regEx = /[^a-zA-Z0-9 ]/gi;
              val = val.replace(regEx, "");

             
            }
            form.setFieldValue(id, toUpper ? val.toUpperCase() : val);
          }}
          {...rest}
        />
      )}
      {(touchValue || form.isSubmitting) && form.errors && errorValue && <FormFeedback>{errorValue}</FormFeedback>}
    </>
  );
  if (noFormGroup) return controlHtml;
  return <FormGroup>{controlHtml}</FormGroup>;
};

/*** Created by Prakash On 29-11-2021 ***/

export const CustomTextInputFumigationEntry = ({ isNumberOnly, id, label, noFormGroup, toUpper, form, placeholder,SpaceNotAllow,MinNumberVal, ...rest }) => {
  console.log("Start-text:"+label);
  console.log("1"+SpaceNotAllow);
   let form1 = form;
   let { getFieldProps } = form1;
   console.log(" 1 : 1 "+getFieldProps);
   const textSpaceNotAllow = (e) => {
    
     if(e.which==32){
       return false;
     }
   }
   if (!placeholder ) {
     placeholder = `Enter ${label}`;
   }
   console.log("Form");
   console.log("2"+JSON.stringify(form1));
   console.log("3"+id);
   let { touchValue, errorValue } = getErrorAndValue(id, form1);
   console.log("3:1"+" touchValue : "+touchValue+" errorValue : "+errorValue);
   console.log("3:3"+" field Probs : "+ JSON.stringify(getFieldProps(id)));
  // console.log("3:4"+" field Probs : "+ getFieldProps(id).length());
   console.log("3:2"+" field Probs : "+ getFieldProps(id));
   const inputProps = getFieldProps(id);
   console.log("4"+"Testing : "+inputProps);
   let controlHtml = (
     <div>
       {label && <Label>{label}</Label>}
       {console.log("4 :: 1"+"Testing")}
       {isNumberOnly ? (
         <NumberOnlyInput
           type="text"
           name={id}
           id={id}
           placeholder={placeholder}
           {...inputProps}
           value={inputProps.value === undefined ? "" : inputProps.value}
           onChange={(e) => {
             let val=e.target.value;
             if(Number(MinNumberVal)>0 && Number(MinNumberVal)>Number(val)){
               val=MinNumberVal;
             }
             {console.log("4 :: 2"+"Testing")}
             form1.setFieldValue(id, toUpper ? val.toUpperCase() :val );
           }}
           {...rest}
         />
       ) : (
         <Input
           type="text"
           name={id}
           id={id}
          
           placeholder={placeholder}
          
           {...getFieldProps(id)}
           value={inputProps.value === undefined ? "" : inputProps.value}
           onChange={(e) => {
             let val = e.target.value;
             if(SpaceNotAllow==1){
               let regEx = / /gi;
               val = val.replace(regEx, "");
             }
             {console.log("4 :: 3"+"Testing")}
             if (!rest.type || rest.type === "text") {
               //let regEx = /[^a-zA-Z0-9. ]/gi;
               let regEx = /[^a-zA-Z0-9 ]/gi;
               val = val.replace(regEx, "");
             }
             {console.log("4 :: 4"+"Testing")}
             form1.setFieldValue(id, toUpper ? val.toUpperCase() : val);
           }}
           {...rest}
         />
       )}
       {console.log("4 :: 5"+"Testing"+controlHtml)}
       {(touchValue || form1.isSubmitting) && form1.errors && errorValue && <FormFeedback>{errorValue}</FormFeedback>}
     </div>
   );
   console.log("5"+"Testing");
   if (noFormGroup) return controlHtml;
   console.log("6"+"Testing");
   return <FormGroup>{controlHtml}</FormGroup>;
 };

export const CustomDropdownInput = ({ id, url, label, onChange, form, placeholder, ...rest }) => {
  let { selectedValue, touchValue, errorValue } = getErrorAndValue(id, form);
  return (
    <FormGroup>
     {label &&  <Label>{label}</Label>}
      <DropdownControl
        onBlur={() => {
          form.setFieldTouched(id);
        }}
        selectedValue={selectedValue}
        url={url}
        onDdlChange={
          onChange
            ? onChange
            : (e) => {
                form.setFieldValue(id, e);
              }
        }
        placeholder={placeholder || label}
        {...rest}
      />
      {(touchValue || form.isSubmitting) && form.errors && errorValue && <FormFeedback>{errorValue}</FormFeedback>}
    </FormGroup>
  );
};

export const CustomUploader = ({ id, title, label, canEdit, form, isReadOnly, ...rest }) => {
  let { errors, values, setValues } = form || {};
  let selectedFileName = values && values[id] ? values[id]["name"] : "";
  let type = values && values[id] ? values[id]["type"] : "";
  title = title || "Attach";
  let [isEditing, setIsEditing] = useState();
  const fileUploadAction = () => {
    document.getElementById(id).click();
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      setValues({ ...values, [id]: e.target.files[0] });
    }
  };

  const openAttach = () => {
    //window.open(previewUrl + selectedFileName, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ selectedFileName, "_blank");
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  if (isReadOnly && !isEditing) {
    if (!selectedFileName) {
      return <></>;
    }
    return (
      <>
        <Label for="nameMulti">{label}</Label>
        <FormGroup className="m-0">
          <Button.Ripple outline color="primary" onClick={openAttach}>
            <Paperclip size={14} />
            <span className="align-middle ml-25">View</span>
          </Button.Ripple>
          {canEdit && (
            <Button.Ripple className={"ml-1"} outline color="primary" onClick={onEdit}>
              <span className="align-middle ml-25">Replace</span>
            </Button.Ripple>
          )}
        </FormGroup>
      </>
    );
  }
  return (
    <>
      <Label>{label}</Label>
      <FormGroup>
        <input type="file" className="form-control" id={id} hidden accept=".pdf" onChange={handleFileChange} />
        <Button.Ripple outline color="primary" onClick={fileUploadAction}>
          <Paperclip size={14} />
          <span className="align-middle ml-25">{title}</span>
        </Button.Ripple>
        {((!isEditing && selectedFileName) || (isEditing && type)) && (
          <div>
            <span className="align-middle ml-25">{selectedFileName}</span>
          </div>
        )}
        {form.isSubmitting && errors && errors[id] && <FormFeedback>{errors[id]}</FormFeedback>}
      </FormGroup>
    </>
  );
};

//user mail ID Creation Input
export const CustomTextInputMail = ({ isNumberOnly, id, label, noFormGroup, toUpper, form, placeholder,SpaceNotAllow,MinNumberVal, ...rest }) => {
  //console.log("Start-text:"+label);
  //console.log(SpaceNotAllow)
   let { getFieldProps } = form;
 
   const textSpaceNotAllow = (e) => {
    
     if(e.which==32){
       return false;
     }
   }
   if (!placeholder ) {
     placeholder = `Enter ${label}`;
   }
  // console.log("Form");
   //console.log(JSON.stringify(form));
   //console.log(id);
   let { touchValue, errorValue } = getErrorAndValue(id, form);
   const inputProps = getFieldProps(id);
   let controlHtml = (
     <>
       {label && <Label>{label}</Label>}
       {isNumberOnly ? (
         <NumberOnlyInput
           type="text"
           name={id}
           id={id}
           placeholder={placeholder}
           {...inputProps}
           value={inputProps.value === undefined ? "" : inputProps.value}
           onChange={(e) => {
             let val=e.target.value;
             if(Number(MinNumberVal)>0 && Number(MinNumberVal)>Number(val)){
               val=MinNumberVal;
             }
             form.setFieldValue(id, toUpper ? val.toUpperCase() :val );
 
           }}
           {...rest}
         />
       ) : (
         <Input
           type="text"
           name={id}
           id={id}
          
           placeholder={placeholder}
          
           {...getFieldProps(id)}
           value={inputProps.value === undefined ? "" : inputProps.value}
           onChange={(e) => {
             let val = e.target.value;
             if(SpaceNotAllow==1){
               let regEx = / /gi;
               val = val.replace(regEx, "");
             }
             if (!rest.type || rest.type === "text" && id!="SRNO") {
               //let regEx = /[^a-zA-Z0-9. ]/gi;
               let regEx = /[^a-zA-Z0-9@. ]/gi;
               val = val.replace(regEx, "");            
             }
             form.setFieldValue(id, toUpper ? val.toUpperCase() : val);
           }}
           {...rest}
         />
       )}
       {(touchValue || form.isSubmitting) && form.errors && errorValue && <FormFeedback>{errorValue}</FormFeedback>}
     </>
   );
   if (noFormGroup) return controlHtml;
   return <FormGroup>{controlHtml}</FormGroup>;
 };

let requiredValidation = (props) => {
  let { message, isObject } = props || {};
  if (isObject) {
    return Yup.object().required(message || "Required");
  }
  return Yup.string().required(message || "Required");
};

let containerValidation = (message) => {
  return Yup.string()
    .required(message || "Required")
    .matches(/^[A-Za-z]{4}\d{7}$/, "First 4 digit alpha next 7 digit numeric");
};

let numberValidation = ({ min, max, required, decimalAllowed, message }) => {
  if(!message) message="";
  let val = Yup.string().matches(/^[0-9]+$/, message||"Must be only digits");
  if(decimalAllowed)
  {
    val = Yup.string().matches(/^[0-9.]+$/, message||"Must be only digits");
  }
  if (required || required === undefined) {
    val = val.required(message||"Required");
  }
  if (min) {
    val = val.min(min, `${min} digits min`);
  }
  if (max) {
    val = val.max(max, `${max} digits max`);
  }
  
  return val;
};

export let validation = {
  required: requiredValidation,
  container: containerValidation,
  number: numberValidation,
  driverNumber: numberValidation({ min: 10, max: 10 }),
};
