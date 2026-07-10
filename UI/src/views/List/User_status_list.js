import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const taColumns = [
  { name: "S.NO", selector: "S_NO", sortable: true, minWidth: "50px" },
  { name: "Login ID", selector: "LOGIN_ID", sortable: true, minWidth: "150px" },
  { name: "User Name", selector: "FIRST_NAME", sortable: true, minWidth: "250px" },
  { name: "Division", selector: "emp_division", sortable: true, minWidth: "150px" },
  { name: "Department", selector: "emp_department", sortable: true, minWidth: "250px" },
  { name: "Designation", selector: "emp_designation", sortable: true, minWidth: "250px" },
  { name: "User Status", selector: "ACTIVELABEL", sortable: true, minWidth: "100px" },
];

const User_status_list = ({ title, url }) => {

  const history = useHistory();

  const login_status = {
    name: "Login Status",
    selector: "LoginStatus",
    minWidth: "100px",
    sortable: true,
    cell: (row) =>
      row.LoginStatus == "1"
        ? "✔️"
        : row.LoginStatus == "0"
        ? "❌"
        : "",
  };

  const columns = [...taColumns, login_status];

  // ✅ Direct API Call For Export
const exportToExcel = async () => {

  try {

    const response = await fetch(`/public/${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formType: "GetUser_infostatuslist",
        export: true
      }),
    });

    const result = await response.json();
    const tableData = result?.results || result?.data || [];

    if (!tableData.length) {
      alert("No data available to export");
      return;
    }

    // ✅ Define ONLY required export fields here
    const filteredData = tableData.map((row, index) => ({
      "S.NO": row.S_NO,
      "Login ID": row.LOGIN_ID,
      "User Name": row.FIRST_NAME,
      "Division": row.emp_division,
      "Department": row.emp_department,
      "Designation": row.emp_designation,
      "Screen Access": row.screen_access,
      "Plant Access": row.plant_access,
      "Module Access": row.module_access,
      "Privilage Access": row.privilege_access,
      "Po Type Access": row.po_type_access,
      "Gate Name": row.gateName,
      "User Status": row.ACTIVELABEL,
      "Login Status":
        row.LoginStatus == "1"
          ? "Active"
          : row.LoginStatus == "0"
          ? "Inactive"
          : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    XLSX.writeFile(workbook, "User_Status_List.xlsx");

  } catch (error) {
    console.error("Export Error:", error);
    alert("Error while exporting");
  }
};

  return (
    <div>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle>{title}</CardTitle>
          <Button color="success" onClick={exportToExcel}>
            Export Excel
          </Button>
        </CardHeader>

        <CardBody>
          <TableComponent
            columns={columns}
            url={url}
            formType="GetUser_infostatuslist"
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default User_status_list;