import { Button } from "reactstrap";

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector } from "react-redux";
import TruckListTable from "../common/TruckListTable";
import { RefreshBlock } from "../common/RefreshBlock";
const QDApprover = () => {
  const history = useHistory();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const [tableFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    vehicleStatus: "22",
  });
  const actionsCol = (row) => {
    switch (row.VECHICAL_STATUS) {
      case "3":
        return (
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID)}>
            {"Approve"}
          </Button.Ripple>
        );
      case "22":
          return (
            <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID)}>
              {"Approve"}
            </Button.Ripple>
          );
      case "4":
        
      case "5":
      case "6":
        return (
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/QAView:${row.PI_REFID}/AP`);
            }}
          >
            {"View QC"}
          </Button.Ripple>
        );
      default:
        return "";
    }
  };
  const onUpdateStatus = (id) => {
    history.push(`/QD:${id}`);
  };

  return (
    <div>
      <RefreshBlock />
      <TruckListTable postData={tableFilter} actionCell={actionsCol} hideFilter ScreenName={"Quality Deduction Approval"} title={"Quality Deduction Approval"} />
    </div>
  );
};

export default QDApprover;
