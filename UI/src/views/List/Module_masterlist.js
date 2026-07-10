import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [


  {
    name: "Module Ref.Id",
    selector: "MODULE_REFID",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Module Id",
    selector: "MODULE_ID",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Screen Name",
    selector: "SCREEN_NAME",
    sortable: true,
    minWidth: "150px",
   
  },






















];
const Module_masterlist = ({ title, url, actionRendorer }) => {
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
          <TableComponent columns={columns} url={url} formType="GetModule_masterlist" />
        </CardBody>
      </Card>
    </div>
  );
};

export default Module_masterlist;
