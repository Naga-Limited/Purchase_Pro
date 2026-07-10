import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [
  {
    name: "Date",
    selector: "date",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "From Location",
    selector: "From_Location",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "To Location",
    selector: "To_Location",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Mode of Transport",
    selector: "Mode_Of_Transport",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "EAD",
    selector: "EAD",
    sortable: true,
    minWidth: "150px",
    accessor: d=>Number(d.EAD),
    sortMethod: (a,b)=> Number(a)-Number(b),
  },
];
const EadList = ({ title, url, actionRendorer }) => {
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
    alert(approved)
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
          <TableComponent columns={columns} url={url} formType="GetEadList" />
        </CardBody>
      </Card>
    </div>
  );
};

export default EadList;
