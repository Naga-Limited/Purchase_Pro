import { Button, Label, FormGroup } from "reactstrap";
import React, { useState } from "react";
import { Paperclip } from "react-feather";
import { errorToast } from "@helpers/appHelper";
import { previewUrl } from "../urlConstants";
const CSVUploader = ({ setAttachment, selectedFileName, canEdit, label, id, title, isReadOnly }) => {
  let [isEditing, setIsEditing] = useState();
  const fileUploadAction = () => {
    document.getElementById(id).click();
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      setAttachment(e.target.files[0], id);
    }
  };

  const openAttach = () => {
    //window.open(previewUrl + selectedFileName, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ selectedFileName, "_blank");
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  // const onCancelEdit = () => {
  //   setIsEditing(false);
  //   setAttachment({}, id);
  // };

  if (isReadOnly && !isEditing) {
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
      <Label for="nameMulti">{label}</Label>
      <input
        type="file"
        className="form-control"
        id={id}
        hidden
        accept=".csv"
        onChange={(e) => {
          handleFileChange(e);
        }}
      />
      <Button.Ripple outline color="primary" onClick={fileUploadAction}>
        <Paperclip size={14} />
        <span className="align-middle ml-25">{title}</span>
      </Button.Ripple>
      <div>
        <span className="align-middle ml-25">{selectedFileName}</span>
      </div>
    </>
  );
};

export default CSVUploader;
