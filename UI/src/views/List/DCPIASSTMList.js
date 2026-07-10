import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";

import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [


  {
    name: "ID",
    selector: "id",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Delivery Type",
    selector: "control_id",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return  (
        <div>
            {row.control_id == '1'
                ? 'IAS'
                : row.control_id == '2'
                ? 'STM'
                :''
            }
          </div>
      );
    },
  },
 
  {
    name: "Status",
    selector: "status",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return  (
        <div>
            {row.status == '1'
                ? 'Active'
                : row.status == '2'
                ? 'InActive'               
                :''
            }
          </div>
      );
    },
  },
  {
    name: "Mobile Number",
    selector: "mobile_numbers",
    sortable: true,
    minWidth: "250px",
  },
  {
    name: "Activation Date",
    selector: "created_at",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Deactivation Date",
    selector: "updated_at",
    sortable: true,
    minWidth: "150px",
  },
];
const DCPIASSTMList = ({ title, url, actionRendorer }) => {
  const history = useHistory();

  // const actionsCol = {
  //   name: "Actions",
  //   selector: "status",
  //   minWidth: "150px",
  //   cell: (row) => {
  //     return actionRendorer ? (
  //       actionRendorer(row)
  //     ) : (
  //       <Button.Ripple color="primary" onClick={() => onActionClick(row.id, row.isApproved)}>
  //         {row.isApproved ? `View` : "Approve"}
  //       </Button.Ripple>
  //     );
  //   },
  // };
  const columns = [...taColumns];

  

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent showDownload columns={columns} url={url} formType="Get_Control_list_IAS_STM" />
        </CardBody>
      </Card>
    </div>
  );
};

export default DCPIASSTMList;
