import { Card, CardHeader, CardBody, FormGroup, Col } from "reactstrap";
import React from "react";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";

export const taColumns = [
    {
        name: "FIRST NAME",
        selector: "FIRST_NAME",
        sortable: true,
        minWidth: "120px",
    },
    {
      name: "Gate Code",
      selector: "gateCode",
      sortable: true,
      minWidth: "150px",
  },
    {
        name: "Gate Name",
        selector: "gateName",
        sortable: true,
        minWidth: "150px",
    },   
   
];

const AssignUserGateList = ({userGateInfo}) => {
  
    const columns = [...taColumns];

    return (
        <div>
            <Card>
                <CardHeader><h5>Assign User Gate List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns}  data={userGateInfo}/>
                </CardBody>
            </Card>
        </div>
    );
};

export default AssignUserGateList;