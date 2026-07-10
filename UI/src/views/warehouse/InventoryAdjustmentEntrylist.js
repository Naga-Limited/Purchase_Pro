
import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
export const taColumns = [
    {
        name: "Unique ID",
        selector: "Physical_Inventory_Id",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Posting Date",
        selector: "Posting_Date",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Lot No",
        selector: "lotno",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Plant",
        selector: "plantid",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Warehouse Name",
        selector: "warehouseid",
        sortable: true,
        minWidth: "180px",
      },
      {
        name: "Storage Location",
        selector: "locationid",
        sortable: true,
        minWidth: "180px",
      },
      {
        name: "Wheat Variety",
        selector: "Wheat_Variety_Id",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Material Code",
        selector: "MaterialCode",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "SAP Qty",
        selector: "SAP_Qty",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Physical Qty",
        selector: "Physical_Qty",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Up / Down Qty",
        selector: "UP_Down_Qty",
        sortable: true,
        minWidth: "150px",
      }, 
      {
        name: "Remarks",
        selector: "RejectReason",
        sortable: true,
        minWidth: "150px",
      }, 
      
    

  // {
  //   name: "QC Update",
  //   selector: "QC_Update",
  //   sortable: true,
  //   minWidth: "150px",
  // }, 
//   {
//     name: "Action",
//     selector: "OutBox_Indicator",
//     sortable: true,
//     minWidth: "150px",
//   },
];
const InventoryAdjusmentEntrylist = ({ title, url, actionRendorer }) => {
  const history = useHistory();
   const FumigateIndicator = {
    name: "Remarks",
    selector: "Action",
    minWidth: "170px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Button.Ripple color="primary" onClick={() => onActionClick(row.id, row.isApproved)}>
          {row.isApproved ? `View` : "Approve"}
        </Button.Ripple> 
        
      );
    }, 
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
  
  const columns = [...taColumns, FumigateIndicator];
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
          <TableComponent columns={columns} url={url} formType="GetMaster_ngw_divisionlist" />
        </CardBody>
      </Card>
    </div>
  );
};
export default InventoryAdjusmentEntrylist;