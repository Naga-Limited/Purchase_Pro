import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [
  



  {
    name: "User Name",
    selector: "LOGIN_ID",
    sortable: true,
    minWidth: "150px",
  },

  {
    name: "Privilege Name",
    selector: "PRIVILEGE_NAME",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "ACTIVE",
    selector: "ACTIVELABEL",
    sortable: true,
    minWidth: "150px",
  },






















































];
const Master_user_privilegelist = ({ title, url, actionRendorer }) => {
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
          <TableComponent columns={columns} url={url} formType="GetMaster_user_privilegelist" />
        </CardBody>
      </Card>
    </div>
  );
};

export default Master_user_privilegelist;
