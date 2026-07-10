import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React, {Fragment} from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

import { WHMaster_ListUrl } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";
export const taColumns = [
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "City",
    selector: "whcity",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "State",
    selector: "state",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Warehouse Type",
    selector: "godown_type",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Overall Duration",
    selector: "OverallDuration",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Screen Duration",
    selector: "ScreenDuration",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Waiting At",
    selector: "approval_status_name",
    sortable: true,
    minWidth: "150px",
  },
];
const WarehouseCreationQCList = () => {
  
  let title="Warehouse Creation - Quality Manager List";
  console.log(title);
  let url=WHMaster_ListUrl;
  let actionRendorer=(row) => {

    let tx = "View";

          if(row.approval_status==-1)
          {
            tx="Rejected";
          }
          else if(row.approval_status=='3' || row.approval_status=='103' )
          {
            tx="Approve";
          }
          

      return (
      <Button.Ripple
        color="primary"
        onClick={() => {
          if(row.approval_status==-1)
          {
            errorToast("Rejected Warehouse Record");
          }
          else if(row.approval_status=='3' || row.approval_status=='103')
          {
          history.push(`/warehouse/wclqcmgrapprove:` + row.wh_refid );
          }

        }}
      >
        {tx}
      </Button.Ripple>
    );
  };
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
          {row.isApproved ? `View2` : "Approve"}
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

      <Fragment>
      <div>
      <Card>
        <CardHeader>
          
		  <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={url} formType="WarehouseCreationQCMgrList" />
        </CardBody>
      </Card>
    </div>
    </Fragment>
  );
};

export default WarehouseCreationQCList;
