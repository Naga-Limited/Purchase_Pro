import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../../../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
export const taColumns = [
  {
    name: "Parameter Name",
    selector: "parametername",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "	Parameter Type",
    selector: "ParameterType",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Order No",
    selector: "sortorderno",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Validation Required (Y/N)",
    selector: "ValReq",
    sortable: true,
    minWidth: "150px",
  },
   {
    name: "Attachment Required (Y/N)",
    selector: "AttReq",
    sortable: true,
    minWidth: "150px",
  },
   {
    name: "Attachment Mandatory (Y/N)",
    selector: "AttMan",
    sortable: true,
    minWidth: "150px",
  },
];
const Master_rndlotconversionlist = ({ title, url, actionRendorer }) => {
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
          {row.isApproved ? `View` : "LIST"}
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
          <TableComponent columns={columns} url={url} formType="GetMaster_rndlotconversionlist" />
        </CardBody>
      </Card>
    </div>
  );
};
export default Master_rndlotconversionlist;
