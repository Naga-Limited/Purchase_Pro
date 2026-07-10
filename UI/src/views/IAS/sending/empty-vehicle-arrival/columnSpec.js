import { Badge } from "reactstrap";
import React from "react";
import { ElapsedTimer } from "../../../common/ElapsedTimer";
import { status } from "../../../../helper/appHelper";

export const evaColumns = (isTruck) => {
  let arr = [
    {
      name: "VA No",
      selector: "ZVA_NUMBER",
      sortable: true,
      minWidth: "250px",
    },
  ];
  if (isTruck === undefined) {
    arr = [
      ...arr,
      {
        name: "Vehicle No",
        selector: "TRUCK_NO",
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
      selector:"OverallDuration",
      sortable: false,
      minWidth: "200px",
      cell: (row) => {
        return <ElapsedTimer date={row.DateAdded} />;
      },
    },
    {
      name: "Screen Duration",
      selector:"ScreenDuration",
      sortable: false,
      minWidth: "150px",
      cell:(row) =>{
        return <ElapsedTimer date={row.DateModified} />;
      }
      // cell: (row) => {
      //   // return <ElapsedTimer date={row.DateAdded} />;
      //   let Screentime = "";
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - Truck" && row.VEHICLE_STATUS == 1 ? <ElapsedTimer date={row.DateAdded} date1={row.GateInDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - Truck" && row.VEHICLE_STATUS == 5 ? <ElapsedTimer date={row.SecondWeightEntryDt > 0 ? row.SecondWeightEntryDt : row.UpdateLotDt} date1={row.GateOutDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - Truck" && row.VEHICLE_STATUS != 1 ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - WH Incharge" && (row.VEHICLE_STATUS == 13 || row.VEHICLE_STATUS == 5) && row.SCREEN_TYPE != "SILOTOMILL" ? <ElapsedTimer date={row.FirstWeightEntryDt} date1={row.UpdateLotDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - WH Incharge" && row.SCREEN_TYPE == "SILOTOMILL" ? <ElapsedTimer date={row.GateInDt} date1={row.stm_LoadDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - WH Incharge" && (row.VEHICLE_STATUS == 14 || row.VEHICLE_STATUS == 15 || row.VEHICLE_STATUS == 16 || row.VEHICLE_STATUS == 12) && row.SCREEN_TYPE != "SILOTOMILL" ? <ElapsedTimer date={row.GateOutDt} date1={row.PickSlipDt} /> : "" : Screentime;
      //   Screentime = Screentime == "" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS == 11 && row.SCREEN_TYPE != "SILOTOMILL" ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} /> : "" : Screentime;
      //   //Screentime=Screentime=="" ? row.ScreenName == "Loading - WH Incharge" && row.VEHICLE_STATUS==12  ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} />  : "" : Screentime;

      //   return Screentime;
      // },
    },
    {
      name: "Waiting At",
      selector: "StatusName",
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
