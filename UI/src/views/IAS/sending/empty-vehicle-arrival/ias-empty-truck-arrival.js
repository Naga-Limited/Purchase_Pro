import React from "react";
import IasEmptyVehicleArrival from "./ias-empty-vehicle-arrival";
import { Button } from "reactstrap";
import { statusCode } from "../../../../helper/appHelper";
import { RefreshBlock } from "../../../common/RefreshBlock";
import { BASE_URL } from "../../../../urlConstants";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const IasEmptyTruckArrival = () => {
  const PrintPDF = (id,Screentype) =>{
    console.log("Screentype:"+Screentype);
    if(Screentype=="SILOTOMILL"){
      window.open(BASE_URL+"/#/STMSlip:"+id, "", "width=900,height=650")
    }else{

      console.log("Slip ID:"+id);
      window.open(BASE_URL+"/#/Slip:"+id, "", "width=900,height=650")
    }
  }
  const actionColumn = (onUpdateStatus,onUpdateGateOut) => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "230px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        switch (status) {
          case statusCode.IN:
            return (
              
              //Mohan changed on 23-09-2022 in below line for Wait in outside onUpdateStatus(statusCode.LOADING, row.ID)
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.FirstWeight, row.ID)}>
                {"Gate In"}
              </Button.Ripple>
            );
          case statusCode.GATEOUT:
            return (
            <>
              {row.SCREEN_TYPE=="SILOTOMILL" && <Button.Ripple color="primary" onClick={(e) => onUpdateGateOut(row.ID)}>
                Gate Out
              </Button.Ripple>
              }

              {row.SCREEN_TYPE!="SILOTOMILL" && row.RejectionStatus!="R" && <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.INTRANSIT, row.ID)}>
                Gate Out
              </Button.Ripple>
              }

              {/* {row.SCREEN_TYPE!="SILOTOMILL" && row.RejectionStatus!="R" && <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.PICKSLIP, row.ID)}>
                Gate Out
              </Button.Ripple>
              } */}
               {row.SCREEN_TYPE!="SILOTOMILL" && row.RejectionStatus=="R" && <Button.Ripple color="primary" 
               onClick={(e) =>
                {
                    let msg = "This Vehicle got rejected . Are you sure you want to proceed for gateout?";
                  
                    confirmDialog({
                      title: "Are you sure?",
                      description: msg,
                    }).then((res) => {
                      if (res) {
                        onUpdateStatus(statusCode.REJECTED_GATE_OUT, row.ID)
                        
                      }
                    });
                  
                }}>
                Gate Out
              </Button.Ripple>

              
              }
              </>
            );
           case statusCode.INTRANSIT:
              return (
                <Button.Ripple color="primary" onClick={(e) => PrintPDF(row.ID, row.SCREEN_TYPE)}>
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
  <IasEmptyVehicleArrival gateInStatus={statusCode.LOADING} FirstWeight={statusCode.FirstWeight} ScreenName={"Loading - Truck"} isTruck title={"Loading - Truck"} actionColumn={actionColumn} />;
  </>
)};

export default IasEmptyTruckArrival;
