import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Col } from "reactstrap";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";

const ALL_GROUPS_OPTION = { value: "", label: "All" };

const VendorList = () => {
  const { showLoader, hideLoader } = useLoader();
  const [vendorList, setVendorList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUPS_OPTION);

  const fetchVendorList = useCallback(() => {
    showLoader();
    apiPostMethod(apiBaseUrl + "FIPaymentController/GetVendorInfoFromSap", {})
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setVendorList(data.results || []);
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  }, [showLoader, hideLoader]);

  useEffect(() => {
    fetchVendorList();
  }, []); // eslint-disable-line

  const groupOptions = useMemo(() => {
    const uniqueGroups = [...new Set(vendorList.map((row) => row.GROUP_DESC).filter(Boolean))];
    return [ALL_GROUPS_OPTION, ...uniqueGroups.map((group) => ({ value: group, label: group }))];
  }, [vendorList]);

  const filteredVendorList = useMemo(() => {
    if (!selectedGroup || !selectedGroup.value) {
      return vendorList;
    }
    return vendorList.filter((row) => row.GROUP_DESC === selectedGroup.value);
  }, [vendorList, selectedGroup]);

  const columns = [
    { name: "Vendor Code", selector: (row) => row.LIFNR, sortable: true },
    { name: "Vendor Name", selector: (row) => row.NAME1, sortable: true },
    { name: "Group", selector: (row) => row.GROUP, sortable: true },
    { name: "Group Description", selector: (row) => row.GROUP_DESC, sortable: true },
  ];

  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Vendor List">
        <TableComponent
          columns={columns}
          data={filteredVendorList}
          filterRenderor={() => (
            <Col className="align-items-center justify-content-start" md="4" sm="12">
              <Select
                className="react-select"
                classNamePrefix="select"
                options={groupOptions}
                value={selectedGroup}
                onChange={(item) => setSelectedGroup(item)}
              />
            </Col>
          )}
        />
      </CardComponent>
    </Fragment>
  );
};

export default VendorList;
