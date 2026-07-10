import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { ElapsedTimer } from "../common/ElapsedTimer";
export const taColumns = [
  {
    name: "Vessel name",
    selector: "vesselName",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Vessel No",
    selector: "vesselNo",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Vessel Dispatch Date",
    selector: "VDispatchDate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "No of Container",
    selector: "NoOfContainer",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "ETA Date",
    selector: "Eda",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Duration",
    selector: "Duration",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      /*return row.ScreenName == "Loading - Container Origin" ? row.GateIntoYardDispTime 
      
      : "" */
      console.log(JSON.stringify(row));
      let Screentime="";
      Screentime=Screentime=="" ?  <ElapsedTimer date={row.DateAdded} date1={row.Endtime} />: Screentime;
      return Screentime;
    },
  },
  {
    name: "Port Of Loading",
    selector: "portOfLoading",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Waiting At",
    selector: "VECHICAL_STATUS",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return (
        <Badge color={"light-success"} pill>
          {row.isApproved ? `Completed` : "Port Receipt"}
        </Badge>
      );
    },
  },
  {
    name: "Port of Discharge",
    selector: "portOfDischarge",
    sortable: true,
    minWidth: "150px",
  },
 
  
  
 
];
const PortDispatchList = ({ title, url, actionRendorer,ScreenName }) => {
  const history = useHistory();

  const actionsCol = {
    name: "Actions",
    selector: "status",
    minWidth: "150px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Button.Ripple color="primary" onClick={() => onActionClick(row.id, row.isApproved)}>
          {row.isApproved ? `View` : "Approve"}
        </Button.Ripple>
      );
    },
  };
  const columns = [...taColumns, actionsCol];

  const onActionClick = (id, approved) => {
    if (!approved) {
      history.push("/IASRPRApprove/" + id);
    } else {
      history.push("/IASRPRView/" + id);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} ScreenName={ScreenName} url={url} formType="GetEntriesAtPort" />
        </CardBody>
      </Card>
    </div>
  );
};

export default PortDispatchList;
