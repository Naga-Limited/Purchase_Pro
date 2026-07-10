import React from "react";
import { containerTypeMaster } from "../../../helper/appHelper";

export const ContainerTypeComponent = ({ form, id }) => {
  return <CustomDropdownInput options={containerTypeMaster} label={"Container Type"} form={form} id={id || "containerType"} />;
};
