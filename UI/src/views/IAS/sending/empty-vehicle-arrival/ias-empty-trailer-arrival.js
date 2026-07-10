import React from "react";
import IasEmptyVehicleArrival from "./ias-empty-vehicle-arrival";
import { Button } from "reactstrap";
import { useHistory } from "react-router";
import { statusCode } from "../../../../helper/appHelper";
import { RefreshBlock } from "../../../common/RefreshBlock";
const IasEmptyTrailerArrival = () => {
  const history = useHistory();
  const actionColumn = (onUpdateStatus) => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "230px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        let id = row.ID;
        switch (status) {
          case statusCode.IN:
            return (
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.GATEOUT, id)}>
                {"Gate In"}
              </Button.Ripple>
            );
          case statusCode.GATEOUT:
          case statusCode.INTRANSIT:
            let isTrans = status === statusCode.INTRANSIT;
            return (
              <Button.Ripple
                color="primary"
                onClick={(e) => {
                  if (isTrans) {
                    //"/ias/:action/:location/:type/:emptyArrivalId/:fromPage?/:receivingArrivalId?",
                    history.push(`/ias/redirect/sending/trailer/${row.ID}/EVADP`);
                  } else {
                    history.push(`/ias/gateout/sending/trailer/${row.ID}/EVADP`);
                  }
                }}
              >
                {isTrans ? "Redirect" : "Gate Out"}
              </Button.Ripple>
            );
          default:
            return "";
        }
      },
    };
    return actionsCol;
  };
  return (
    <>
     <RefreshBlock />   
    
    <IasEmptyVehicleArrival
      gateInStatus={statusCode.GATEOUT}
      isTruck={false}
      title={"Loading - Container Dest"}
      ShowStmNon={1}
      actionColumn={actionColumn}
    />
     </>
  );
};

export default IasEmptyTrailerArrival;
