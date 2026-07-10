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
    name: "Created_AT",
    selector: "created_at",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Delivery Type",
    selector: "delivery_control_id",
    sortable: true,
    minWidth: "150px",
    cell: (row) => {
      return  (
        <div>
            {row.delivery_control_id == '1'
                ? 'SDT/SDO'
                : row.delivery_control_id == '2'
                ? 'IAS'
                :row.delivery_control_id == '3'
                ? 'STM'
                :row.delivery_control_id == '4'
                ? 'IRS'
                :row.delivery_control_id == '5'
                ? 'RELOTTING'
                :row.delivery_control_id == '6'
                ? 'FUMIGATION'
                :row.delivery_control_id == '7'
                ? 'GATE PRO' 
                :row.delivery_control_id == '8'
                ? 'GODWON TO GODWON' : ''
            }
          </div>
      );
    },
  },
  {
    name: "Temp Ext.Days",
    selector: "temp_extended_days",
    sortable: true,
    minWidth: "150px",
   
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
                ? 'Created'
                : row.status == '2'
                ? 'Processed'
                :row.status == '3'
                ? 'Completed'
                
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
    name: "Remarks",
    selector: "remarks",
    sortable: true,
    minWidth: "250px",
   
  },

];
const DeliveryControlList = ({ title, url, actionRendorer }) => {
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
          <TableComponent showDownload columns={columns} url={url} formType="Get_Control_list" />
        </CardBody>
      </Card>
    </div>
  );
};

export default DeliveryControlList;
