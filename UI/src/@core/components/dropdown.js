import React, { useCallback, useEffect, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import Select from "react-select";
import { errorToast } from "@helpers/appHelper";

export const DropdownControl = ({
  postData,
  url,
  options,
  dataSource,
  onBlur,
  selectedValue,
  onDdlChange,
  isDisabled,
  onDataReceived,
  ...rest
}) => {
  let [optionList, setOptionList] = useState(options || []);
  useEffect(() => {
    setOptionList(options);
  }, [options]);
  const onFetch = useCallback(
    (url, data) => {
      (dataSource ? dataSource() : apiPostMethod(url, data))
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setOptionList(onDataReceived ? onDataReceived(data.results) : data.results);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    },
    [dataSource]
  );
  useEffect(() => {
    if (!isDisabled && url) {
      onFetch(url, postData);
    }
  }, [postData, url, isDisabled]);

  let opList = optionList;
  if (rest.fixedOption) {
    if (Array.isArray(rest.fixedOption)) {
      if (rest.fixedOption.length > 0) {
        let allVal = rest.fixedOption.map((a) => a.value);
        let filtered = optionList.filter((f) => !allVal.includes(f.value));
        opList = optionList ? [...rest.fixedOption, ...filtered] : optionList;
      }
    } else {
      opList = optionList ? [rest.fixedOption, ...optionList.filter((f) => f.value != rest.fixedOption.value)] : optionList;
    }
  }

  return (
    <Select
      isDisabled={isDisabled}
      className="react-select"
      classNamePrefix="select"
      onBlur={onBlur}
      options={opList}
      value={selectedValue ? selectedValue : null}
      onChange={onDdlChange}
      {...rest}
    />
  );
};
