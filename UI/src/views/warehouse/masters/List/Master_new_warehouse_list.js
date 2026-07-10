import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../../../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
export const taColumns = [
  {
    name: "WH REFID",
    selector: "wh_refid",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WH CODE",
    selector: "wh_code",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WAREHOUSE NAME",
    selector: "warehousename",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "DISTRICT NAME",
    selector: "district",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "CONTRACT START DATE",
    selector: "contractstartdate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "CONTRACT END DATE",
    selector: "contractenddate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "INSURANCE START DATE",
    selector: "insurancestartdate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "INSURANCE EXPIRY DATE",
    selector: "insuranceexpirydate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB1 STAMPING STARTDATE",
    selector: "wb1_stamping_start_date",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB1 STAMPING ENDDATE",
    selector: "wb1_stamping_enddate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB2 STAMPING STARTDATE",
    selector: "wb2_stamping_startdate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WB2 STAMPING ENDDATE",
    selector: "wb2_stamping_enddate",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "CONTRACT ELAPSE DAYS",
    selector: "",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "INSURANCE ELAPSE DAYS",
    selector: "",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "STAMPING ELAPSE DAYS",
    selector: "",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "WAREHOUSE STATUS",
    selector: "",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "QC STATUS",
    selector: "",
    sortable: true,
    minWidth: "150px",
  },
];
const Master_new_warehouse_list = ({ title, url, actionRendorer }) => {
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
  const onActionClick = (wh_refid, approved) => {
    if (!approved) {
      history.push("/IASRPRApprove/" + wh_refid);
    } else {
      history.push("/IASRPRView/" + wh_refid);
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={url} formType="GetMaster_new_warehouse_list" />
        </CardBody>
      </Card>
    </div>
  );
};
export default Master_new_warehouse_list;
