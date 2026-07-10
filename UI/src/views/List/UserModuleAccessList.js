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
        name: "Module Type",
        selector: "moduleType",
        sortable: true,
        minWidth: "150px",
    },
   
];

const UserModuleAccessList = ({userModuleAccessData}) => {
  
    const columns = [...taColumns];

    return (
        <div>
            <Card>
                <CardHeader><h5>User Module Access List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={userModuleAccessData} />
                </CardBody>
            </Card>
        </div>
    );
};

export default UserModuleAccessList;