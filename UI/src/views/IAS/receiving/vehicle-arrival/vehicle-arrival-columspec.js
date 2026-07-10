import { Badge } from "reactstrap";
import React from "react";
import { iasStatus } from "../../ias-utils";
import { ElapsedTimer } from "../../../common/ElapsedTimer";

export const vaColumnSpec = () => [
  {
    name: "Driver No",
    selector: "DriverNo",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Trailer No",
    selector: "TrailerNo",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Truck No",
    selector: "TruckNo",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Duration",
    sortable: false,
    minWidth: "150px",
    cell: (row) => {
      return row.VehicleStatus !== 7 ? <ElapsedTimer date={row.DateAdded} /> : "";
    },
  },
  {
    name: "Waiting At",
    selector: "VehicleStatus",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      const s = iasStatus[row.VehicleStatus] ? iasStatus[row.VehicleStatus] : {};
      return (
        <Badge color={s.color} pill>
          {s.title}
        </Badge>
      );
    },
  },
  {
    name: "Plant Id",
    selector: "PlantId",
    sortable: true,
    minWidth: "150px",
  },
];
