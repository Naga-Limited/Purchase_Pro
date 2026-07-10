import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [
  





  {
    name: "Vessel Ref.Id",
    selector: "VESSEL_REFID",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Vessel Name",
    selector: "VESSEL_NAME",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Vessel Status",
    selector: "ACTIVELABEL",
    sortable: true,
    minWidth: "150px",
   
  },















































];
const Master_vessellist = ({ title, url, actionRendorer }) => {
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
          <TableComponent columns={columns} url={url} formType="GetMaster_vessellist" />
        </CardBody>
      </Card>
    </div>
  );
};

export default Master_vessellist;
