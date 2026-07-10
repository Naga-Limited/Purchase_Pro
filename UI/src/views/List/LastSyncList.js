import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [
  {
    name: "Cron Job",
    selector: "Job",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Date & Time",
    selector: "Date",
    sortable: true,
    minWidth: "150px",
  },
 
 
];
const LastSyncList = ({ title, url, actionRendorer,actionCell }) => {
  const history = useHistory();


  
  let columns = [];

  if (actionCell) {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth:  "300px",
      cell: actionCell,
    };
    columns = [...taColumns, actionsCol];
  } else {
    columns = [...taColumns];
  }
 

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={url} formType="GetLastSyncList" />
        </CardBody>
      </Card>
    </div>
  );
};

export default LastSyncList;
