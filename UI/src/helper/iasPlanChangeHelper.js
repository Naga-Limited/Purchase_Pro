import { Badge } from "reactstrap";
import { toast } from "react-toastify";
import React from "react";
import { ElapsedTimer } from "../views/common/ElapsedTimer";
export const iasPlanChangeHelper = [
  {
    value: "HIGH CUBE",
    label: "HIGH CUBE",
  },
  {
    value: "STANDARD",
    label: "STANDARD",
  },
];

export const statusCode = {
  REDIRECT_GATEOUT: 18,
  IRS_COMPELTE: 17,
  RECEIVER_GATE_IN: 16,
  INTRANSIT: 15,
  PICKSLIP: 14,
  LOADING: 13,
  COMPLETED: 12,
  REJECTED_GATE_OUT: 11,
  PORT_RECEIPT: 10,
  PORT_DISPTACH_INFO: 9,
  YARD_DISPTACH_INFO: 8,
  MIGO_COMPLETED: 7,
  GATEOUT: 5,
  UNLOAD: 4,
  QC_CHECK: 2,
  IN: 1,
};

export const status = {
  1: { title: "Waiting for IN", color: "light-primary" },
  2: { title: "QC Check", color: "light-success" },
  3: { title: "QC Deduction", color: "light-success" },
  4: { title: "Unload", color: "light-success" },
  5: { title: "Gate Out", color: "light-success" },
  6: { title: "MIGO Approval", color: "light-success" },
  7: { title: "MIGO Approval Completed", color: "light-success" },
  8: { title: "Yard/WH Dispatch", color: "light-success" },
  9: { title: "Port Dispatch", color: "light-success" },
  10: { title: "Port Receipt", color: "light-success" },
  11: { title: "Rejected Gate Out", color: "light-success" },
  12: { title: "Completed", color: "light-success" },
  13: { title: "Loading", color: "light-success" },
  14: { title: "Pickslip", color: "light-success" },
  15: { title: "Intransit", color: "light-success" },
  16: { title: "Receiver Gate In", color: "light-success" },
  17: { title: "IAS Complete", color: "light-success" },
  18: { title: "Redirect Gate Out", color: "light-success" },
  21: { title: "QC Check After Unload", color: "light-success" },
  22: { title: "Quality Deduction Approval", color: "light-success" },
  32: { title: "WH MG Reject", color: "danger" },
  33: { title: "WH Acc.MG Reject", color: "danger" },
  34: { title: "Plan Rejected", color: "danger" },
};
//4,13,14
export const ias_taColumns = [
  {
    name: "VA No",
    selector: "ZVA_NUMBER",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Document No",
    selector: "PICK_SLIP_NO",
   
    minWidth: "130px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Vehicle No",
    selector: "TRUCK_NO",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Driver No",
    selector: "DRIVER_NO",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Overall Duration",
    sortable: false,
    minWidth: "200px",
    wrap: true,
    cell: (row) => {
      return row.VECHICAL_STATUS !== 7 ? <ElapsedTimer date={row.DateAdded} date1={row.MIGOApprovalDt} /> : "";
    },
   
  },
  {
    name: "Waiting At",
    selector: "VECHICAL_STATUS",
    sortable: true,
    minWidth: "180px",
    wrap: true,
    cell: (row) => {
      const s = status[row.VECHICAL_STATUS] ? status[row.VECHICAL_STATUS] : {};
      return (
        <Badge color={s.color} pill>
          {s.title}
        </Badge>
      );
    },
  },
  {
    name: "Plant Name",
    selector: "PlantName",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Storage Location",
    selector: "StorageLocation",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "WH Remarks",
    selector: "WHInchargeRemarks",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "WH Manager Remarks",
    selector: "WHManagerRemarks",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Acc Manager Remark",
    selector: "AccManagerRemarks",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
];
export const errorToast = (msg) => {
  toast.error(msg, { position: toast.POSITION.BOTTOM_CENTER, autoClose: 3000 });
  
};

export const ShowToast = (msg) => {
  toast.success(msg, { position: toast.POSITION.TOP_RIGHT, autoClose: 2000 });
  
};
export function roundOf(val) {
  return val && !isNaN(Number(val)) ? Math.round(Number(val)) : val;
}
