import { Button } from "reactstrap";

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector } from "react-redux";
import TruckListTable from "../common/TruckListTable";
import { RefreshBlock } from "../common/RefreshBlock";
const QCApprover = () => {
  const history = useHistory();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const [tableFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    // vehicleStatus: "2,3,4,5,6",
    vehicleStatus: "3",
  });
  const actionsCol = (row) => {
    switch (row.VECHICAL_STATUS) {
      case "3":
        return (
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID,row.SCREEN_TYPE)}>
            {"Update"}
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
  const onUpdateStatus = (id,SCREEN_TYPE) => {
    if(SCREEN_TYPE=="SDO"){
      //history.push(`/SDO_QA:${id}`); //Commented for 2 QC Required for SDO
      history.push(`/QA:${id}`);
    }else{
      history.push(`/QA:${id}`);
    }
    
  };

  return (
    <div>
      <RefreshBlock />
      <TruckListTable postData={tableFilter} actionCell={actionsCol} ScreenName={"Quality Deduction"} title={"Quality Deduction"} />
    </div>
  );
};

export default QCApprover;
