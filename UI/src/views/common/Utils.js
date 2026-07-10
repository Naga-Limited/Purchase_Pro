import camelCase from "lodash/camelCase";
import moment from "moment";
export let addOption = (label, val) => {
  return label ? { label: label, value: val || label } : undefined;
};
export let getDropdownValue = (option, key) => {
  return option ? option[key || "value"] : undefined;
};
export let getFromDate = (date, format = "YYYY-MM-DD") => {
  return date && date["start"] ? moment(date["start"]).format(format) : undefined;
};
export let getToDate = (date, format = "YYYY-MM-DD") => {
  return date && date["end"] ? moment(date["end"]).format(format) : undefined;
};
export let addFileName = (name) => {
  return name ? { name: name } : undefined;
};
export let toCamelCaseObject = (data) => {
  let newObj = {};
  Object.keys(data).forEach((a) => {
    let newKey = camelCase(a);
    newObj[newKey] = data[a];
  });
  return newObj;
};

export let addColumn = (name, selector, minWidth, cell, excelCell) => {
  return {
    name: name,
    selector: selector,
    sortable: true,
    minWidth: minWidth || "150px",
    cell: cell,
    excelCell: excelCell,
  };
};
