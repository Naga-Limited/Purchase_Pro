import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { number } from "prop-types";

export const taColumns = [
  





  {
    name: "User Id",
    selector: "UI_ID",
  
    sortable: true,
    minWidth: "150px",
  
  },
  {
    name: "User Name",
    selector: "LOGIN_ID",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "First Name",
    selector: "FIRST_NAME",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "SI No.",
    selector: "SI_NO",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "Designation",
    selector: "DESIGNATION",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "Department",
    selector: "DEPARTMENT",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "City",
    selector: "CITY",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "State",
    selector: "STATE",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "User Role Name",
    selector: "ROLE_NAME",
    sortable: true,
    minWidth: "150px",
   
  },
  {
    name: "User Status",
    selector: "ACTIVELABEL",
    sortable: true,
    minWidth: "150px",
   
  },





];
const User_infolist = ({ title, url, actionRendorer }) => {
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
          <TableComponent columns={columns} url={url} formType="GetUser_infolist" />
        </CardBody>
      </Card>
    </div>
  );
};

export default User_infolist;
