import React from "react";
import { apiBaseUrl } from "../../urlConstants";
import { CustomDropdownInput } from "../forms/custom-form";

export const PlantIdDropdown = ({ form, id, label }) => {
  return <CustomDropdownInput label={label || "Plant Id"} url={`${apiBaseUrl}user/getUserPlants`} form={form} id={id} />;
};
export const PlantIdDropdown_SILO = ({ form, id, label }) => {
  return <CustomDropdownInput label={label || "Plant Id"} url={`${apiBaseUrl}user/getUserPlants_SILO`} form={form} id={id} />;
};
