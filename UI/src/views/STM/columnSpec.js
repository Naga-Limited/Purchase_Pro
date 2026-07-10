import { Badge } from "reactstrap";
import React from "react";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { status } from "../../helper/appHelper";

export const evaColumns = (isTruck) => {
  let arr = [
    {
      name: "VA No",
      selector: "ZVA_NUMBER",
      sortable: true,
      minWidth: "180px",
    },
  ];
  if (isTruck === undefined) {
    arr = [
      ...arr,
      {
        name: "Vehicle No",
        selector: "TRAILER_NO",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
          return row.TRUCK_NO ? row.TRUCK_NO : row.TRAILER_NO;
        },
      },
      /*{
        name: "Vehicle Type",
        selector: "TRAILER_NO",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
          return row.TRUCK_NO ? "Truck" : "Trailer";
        },
      },*/
    ];
  } else {
    arr = [
      ...arr,
      {
        name: isTruck ? "Vehicle No" : "Trailer No",
        selector: isTruck ? "TRUCK_NO" : "TRAILER_NO",
        sortable: true,
        minWidth: "150px",
      },
    ];
  }
  return [
    ...arr,
    {
      name: "Driver No",
      selector: "DRIVER_NO",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Overall Duration",
      sortable: false,
      minWidth: "200px",
      cell: (row) => {
        return <ElapsedTimer date={row.DateAdded}  />;
      },
    },
    {
      name: "Screen Duration",
      sortable: false,
      minWidth: "150px",
      cell: (row) => {
       // return <ElapsedTimer date={row.DateAdded} />;
       let Screentime="";
Screentime=Screentime=="" ? row.ScreenName == "Loading - Truck" && row.VEHICLE_STATUS==1  ? <ElapsedTimer date={row.DateAdded} date1={row.GateInDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - Truck" && row.VEHICLE_STATUS!=1   ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Weight Entry" && row.VEHICLE_STATUS==23   ? <ElapsedTimer date={row.GateInDt} date1={row.FirstWeightEntryDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Weight Entry" && row.VEHICLE_STATUS==24 && row.SCREEN_TYPE=="EVADP"   ? <ElapsedTimer date={row.UpdateLotDt} date1={row.SecondWeightEntryDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Weight Entry" && row.VEHICLE_STATUS==24  && row.SCREEN_TYPE=="SILOTOMILL"  ? <ElapsedTimer date={row.stm_QCDt} date1={row.SecondWeightEntryDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==13  ? <ElapsedTimer date={row.GateInDt} date1={row.UpdateLotDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==14  ? <ElapsedTimer date={row.GateOutDt} date1={row.PickSlipDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==5  ? <ElapsedTimer date={row.UpdateLotDt} date1={row.GateOutDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==15  ? <ElapsedTimer date={row.PickSlipDt} date1={row.RedirectDt} />  : "" : Screentime;
Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==11  ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} />  : "" : Screentime;

return Screentime;
      },
    },
    {
      name: "Waiting At",
      selector: "VEHICLE_STATUS",
      sortable: true,
      minWidth: "150px",
      cell: (row) => {
        const s = status[row.VEHICLE_STATUS] ? status[row.VEHICLE_STATUS] : {};
        return (
          <Badge color={s.color} pill>
            {s.title}
          </Badge>
        );
      },
    },
    {
      name: "Plant Name",
      selector: "PLANT_ID",
      sortable: true,
      minWidth: "150px",
    },
  ];
};
