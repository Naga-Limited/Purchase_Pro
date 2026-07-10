import { Badge, Button } from "reactstrap";
import React from "react";

import { status } from "@helpers/appHelper";

export const getDefaultPlant = (plantids) => {
  return { plant: plantids && plantids.length === 1 ? { label: plantids[0], value: plantids[0] } : undefined };
};
export const evaColumns = [
  {
    name: "Trailer No",
    selector: "TRAILER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Container No",
    selector: "CONTAINER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Driver No",
    selector: "DRIVER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB Serial No",
    selector: "WB_SERIAL_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Status",
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
    name: "Plant Id",
    selector: "PLANT_ID",
    sortable: true,
    minWidth: "150px",
  },
];

export const actionColumn = (onUpdateStatus) => {
  const actionsCol = {
    name: "Actions",
    selector: "status",
    minWidth: "150px",
    cell: (row) => {
      return row.VEHICLE_STATUS == 1 || row.VEHICLE_STATUS == 4 ? (
        <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.VEHICLE_STATUS, row.ID)}>{`${
          row.VEHICLE_STATUS == 1 ? "Gate In" : row.VEHICLE_STATUS == 4 ? "Gate Out" : ""
        }`}</Button.Ripple>
      ) : (
        ""
      );
    },
  };
  return actionsCol;
};

export const evaWHColumns = [
  {
    name: "Vehicle No",
    selector: "TRUCK_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Driver No",
    selector: "DRIVER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB Ticket No",
    selector: "WB_TICKET_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB Name",
    selector: "WB_NAME",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Status",
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
    name: "Plant Id",
    selector: "PLANT_ID",
    sortable: true,
    minWidth: "150px",
  },
];

export const evaDpColumns = [
  {
    name: "Trailer No",
    selector: "TRAILER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Driver No",
    selector: "DRIVER_NO",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Status",
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
    name: "Plant Id",
    selector: "PLANT_ID",
    sortable: true,
    minWidth: "150px",
  },
];
