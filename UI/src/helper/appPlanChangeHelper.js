import { Badge } from "reactstrap";
import { toast } from "react-toastify";
import React from "react";
import { ElapsedTimer } from "../views/common/ElapsedTimer";
export const appPlanChangeHelper = [
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
  FirstWeight:23,
  SecondWeight:24,
  Out_WB_Correction:25,
  PO_Correction:26,
  Out_WB_Correct_Approve:27,
  PO_Correct_Approval:28,
  Migo_Reject:29,
  Migo_Reject_Approval:30,
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
  23: { title: "First Weight Entry", color: "light-success" },
  24: { title: "Second Weight Entry", color: "light-success" },
  25: { title: "Outside WB Approval", color: "warning" },
  26: { title: "PO Correct Approval", color: "warning" },
  27: { title: "Outside WB Correction", color: "warning" },
  28: { title: "PO Correction", color: "warning" },
  29: { title: "Migo Reject", color: "danger" },
  30: { title: "Migo Reverse Approval", color: "warning" },
  31: { title: "Migo Reverse Reject", color: "danger" },
  32: { title: "WH MG Reject", color: "danger" },
  33: { title: "WH Acc.MG Reject", color: "danger" },
  34: { title: "Plan Rejected", color: "danger" },
};
//4,13,14
export const taColumns = [
  {
    name: "VA No",
    selector: "ZVA_NUMBER",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Document No",
    selector: "ZPO_NUMBER",
   
    minWidth: "130px",
    wrap: true,
    cell: (row) => {
      return row.SCREEN_TYPE == "IAS" ? row.PICK_SLIP_NO : row.ZPO_NUMBER;
    },
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
//   {
//     name: "Screen Duration",
//   //  selector: "QualitySubmitDtTime",
//     sortable: true,
//     minWidth: "130px",
//     wrap: true,
//     cell: (row) => {

//      // console.log(JSON.stringify(row));
// let Screentime="";
// Screentime=Screentime=="" ? row.ScreenName == "Quality Check" && row.VECHICAL_STATUS==21 ? <ElapsedTimer date={row.QualityCheckSubmitDt} date1={row.AfterUnloadQCDt} />  : "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Quality Check"  && row.SCREEN_TYPE=='SILOTOMILL'  ? <ElapsedTimer date={row.stm_LoadDt} date1={row.stm_QCDt} />  : "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Quality Check" && row.VECHICAL_STATUS==2 ? <ElapsedTimer date={row.FirstWeightEntryDt > 0 ? row.FirstWeightEntryDt : row.GateInDt } date1={row.QualityCheckSubmitDt} />  : "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Quality Check"  ? <ElapsedTimer date={row.QualityCheckSubmitDt} date1={row.AfterUnloadQCDt} />  : "" : Screentime;

// Screentime=Screentime=="" ? row.ScreenName == "IAS View"  ? <ElapsedTimer date={row.GateInDt} date1={row.UnloadWHSubmitDt} />  : "" : Screentime;

// Screentime=Screentime=="" ? row.ScreenName == "Weight Entry" && row.VECHICAL_STATUS==23 ? <ElapsedTimer date={row.GateInDt} date1={row.FirstWeightEntryDt} />  : "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Weight Entry" && row.VECHICAL_STATUS==24 ? <ElapsedTimer date={row.UnloadWHSubmitDt} date1={row.SecondWeightEntryDt} />  : "" : Screentime;

// Screentime=Screentime=="" ? row.ScreenName == "Quality Deduction" ? <ElapsedTimer date={row.QualityCheckSubmitDt} date1={row.QualityDeductionSubmitDt } />  : "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading WH Incharge" && row.SCREEN_TYPE!="SILOTOMILL" && row.SCREEN_TYPE!="IAS"  ? <ElapsedTimer date={row.QualityDeductionSubmitDt!=null ? row.QualityDeductionSubmitDt : row.QualityCheckSubmitDt} date1={row.UnloadWHSubmitDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading WH Incharge" && row.SCREEN_TYPE=="SILOTOMILL" ? <ElapsedTimer date={row.GateInDt} date1={row.UnloadWHSubmitDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading WH Incharge" && row.SCREEN_TYPE=="IAS" ? <ElapsedTimer date={row.QualityCheckSubmitDt>row.GateInDt ? row.QualityCheckSubmitDt : row.GateInDt} date1={row.UnloadWHSubmitDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading"  && row.VECHICAL_STATUS==1 ? <ElapsedTimer date={row.DateAdded} date1={row.GateInDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading"  && row.VECHICAL_STATUS==11 ? <ElapsedTimer date={row.DateAdded} date1={row.GateInDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Unloading" ? <ElapsedTimer date={row.GateInDt} date1={row.GateOutDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "25"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "26"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "27"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "28"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "30"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.VECHICAL_STATUS == "31"  ? <ElapsedTimer date={row.MigoRejectedDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "MIGO Approval"  ? <ElapsedTimer date={row.GateOutDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Change Vehicle Status"  ? <ElapsedTimer date={row.GateInDt} date1={row.MIGOApprovalDt} />: "" : Screentime;
// Screentime=Screentime=="" ? row.ScreenName == "Quality Deduction Approval"  ? <ElapsedTimer date={row.QualityDeductionSubmitDt} date1={row.QualityDeductionApproveDt} />: "" : Screentime;


//       return Screentime;
//     },
//   },

  {
    name: "Waiting At",
    selector: "VECHICAL_STATUS",
    sortable: true,
    minWidth: "180px",
    wrap: true,
    cell: (row) => {
      let s = status[row.VECHICAL_STATUS] ? status[row.VECHICAL_STATUS] : {};
      if(!row.VECHICAL_STATUS){
        s = status[row.VEHICLE_STATUS] ? status[row.VEHICLE_STATUS] : {};
      }
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
    // selector: "WHInchargeRemarks",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return row.WHInchargeRemarks == null ? '-' : row.WHInchargeRemarks;
    },
    wrap: true,
  },
  {
    name: "WH Manager Remarks",
    // selector: "WHManagerRemarks",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return row.WHManagerRemarks == null ? '-' : row.WHManagerRemarks;
    },
    wrap: true,
  },
  {
    name: "Acc Manager Remark",
    selector: "AccManagerRemarks",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return row.AccManagerRemarks == null ? '-' : row.AccManagerRemarks;
    },
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
export function roundOf_3(val) {
  if(isNaN(val)){
    val=0;
  }
  return parseFloat(val).toFixed(3);
}
