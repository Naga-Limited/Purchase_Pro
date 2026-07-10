import React from "react";
import IasEmptyVehicleArrival from "./ias-empty-vehicle-arrival";
import { Button } from "reactstrap";
import { statusCode } from "../../../../helper/appHelper";
import { RefreshBlock } from "../../../common/RefreshBlock";
import { BASE_URL } from "../../../../urlConstants";
const IasEmptyTruckArrival = () => {
  const PrintPDF = (id,Screentype) =>{
    console.log("Screentype:"+Screentype);
    if(Screentype=="SILOTOMILL"){
      window.open(BASE_URL+"/#/STMSlip:"+id, "", "width=900,height=650")
    }else{
    window.open(BASE_URL+"/#/Slip:"+id, "", "width=900,height=650")
    }
  }
  const actionColumn = (onUpdateStatus) => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "230px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        switch (status) {
          case statusCode.IN:
            return (
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.LOADING, row.ID)}>
                {"Gate In"}
              </Button.Ripple>
            );
          case statusCode.GATEOUT:
            return (
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.PICKSLIP, row.ID)}>
                Gate Out
              </Button.Ripple>
            );
           case statusCode.INTRANSIT:
              return (
                <Button.Ripple color="primary" onClick={(e) => PrintPDF(row.ID,row.SCREEN_TYPE)}>
                Print
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
  <IasEmptyVehicleArrival gateInStatus={statusCode.LOADING} ScreenName={"Loading - Truck"} isTruck title={"Loading - Truck"} actionColumn={actionColumn} />;
  </>
)};

export default IasEmptyTruckArrival;
