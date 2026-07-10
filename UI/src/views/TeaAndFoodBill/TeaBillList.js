import {
  CardHeader,
  Button,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Badge,
  Table
} from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Edit, Printer, X, Circle } from "react-feather";
import { Modal } from "react-bootstrap";
import {
  CustomDropdownInput,
  CustomTextInput,
} from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import * as XLSX from "xlsx";

export const taColumns = [
  {
    name: "Token No",
    selector: "unique_id",
    sortable: true,
    minWidth: "180px",
  },
  {
    name: "Issue Date",
    selector: "bill_date",
    sortable: true,
    minWidth: "180px",
  },
  {
    name: "Vendor Name",
    selector: "vendor_name",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Shift",
    selector: "shift_name",
    sortable: true,
    minWidth: "200px",
  },
  // {
  //     name: "Department",
  //     selector: "department",
  //     sortable: true,
  //     minWidth: "150px",
  // },
  {
    name: "Total Count",
    selector: "total_qty",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Cost",
    selector: "tea_cost",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Amount",
    selector: "amount",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "In Time",
    selector: "in_time",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Out Time",
    selector: "out_time",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Created Date & Time",
    selector: "createdDate",
    sortable: true,
    minWidth: "180px",
  },
  // {
  //   name: "Gate Out Date & Time",
  //   selector: "gateOutDate",
  //   sortable: true,
  //   minWidth: "180px",
  // },
  {
    name: "Approved Date & Time",
    selector: "gateOutDate",
    sortable: true,
    minWidth: "180px",
  },
  {
    name: "Issued By",
    selector: "issuedBy",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Status",
    selector: "statusName",
    sortable: true,
    minWidth: "150px",
    cell: (row) => (
      <Col sm="12">
        <FormGroup className="d-flex justify-content-center mb-0">
          {row.status === '0' && <Badge color="danger" pill>{row.statusName}</Badge>}
          {row.status === '1' && <Badge color="primary" pill>{row.statusName}</Badge>}
          {row.status === '2' && <Badge color="success" pill>{row.statusName}</Badge>}
        </FormGroup>
      </Col>
    ),
  },
];

const TeaBillList = ({ data, actionRendorer }) => {
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [quantities, setQuantities] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => state?.auth?.userData || {});

  const form = useFormik({
    initialValues: {
      uniqueId: "",
      createdDate: "",
      remark: "",
      id: "",
      vendorId: null,
      shiftId: null,
      shiftTime: "",
      amount: "",
      employeeId: null,
      detailsList: []
    },
    onSubmit: () => {}
  });

  const columns = [
    
    {
      name: "Actions",
      selector: "status",
      minWidth: "250px",
      cell: (row) => (
        <Row>
          &nbsp;&nbsp;
          {row.status == 1 && (UserDetails.role == 'Approver' || UserDetails.role == 'Admin') &&(
            <Button.Ripple color="primary" size="sm" onClick={() => updateEmployeeDetails(row)}>
              <Edit size={16} /> Approve
            </Button.Ripple>
          )}
          {/* {row.status == 2 && (UserDetails.role == 'Approver' || UserDetails.role == 'Admin') && (
            <Button.Ripple color="primary" size="sm" onClick={() => updateEmployeeDetails(row)}>
              <Edit size={16} /> Approve
            </Button.Ripple>
          )} */}
          {row.status == 2 && (
            <Button.Ripple color="primary" size="sm" onClick={() => print(row)}>
              <Printer size={16} className="mr-1" /> Print
            </Button.Ripple>
          )}
        </Row>
      ),
    },
    ...taColumns,
  ];

  const updateEmployeeDetails = (row) => {
    setShow(true);
    form.setValues({
      uniqueId: row.unique_id,
      createdDate: row.createdDate,
      remark: row.remark || "",
      id: row.id,
      vendorId: { value: row.vendor_id, label: row.vendor_name },
      shiftId: { value: row.shift_id, label: row.shift_name },
      shiftTime: row.shiftTime || "",
      amount: row.amount || "",
      employeeId: { value: row.employee_id, label: row.FIRST_NAME },
      detailsList: row.quantities || [],
      status:row.status,
      in_time:row.in_time,
      out_time:row.out_time,
      tea_cost:row.tea_cost,
      bill_date	:toInputDateFormat(row.bill_date),
    });
    setQuantities((row.quantities || []).map(q => q.qty || 0));
  };

  const onSubmit = (status) => {
   
    const postData = {
      userInfoId: UserDetails.USERID,
      remark: form.values.remark,
      vendorId: form.values.vendorId?.value,
      shiftId: form.values.shiftId?.value,
      vendorName: form.values.vendorId?.label,
      shiftName: form.values.shiftId?.label,
      status,
      id: form.values.id,
      quantities : form.values.detailsList,
      total_qty:total,
      in_time:form.values.in_time,
      out_time:form.values.out_time,
      tea_cost:form.values.tea_cost,
      bill_date:form.values.bill_date,
    };

    showLoader();

    apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/updateTeaBill`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: `#51A351`,
          }).then(() => window.location.reload());
        } else {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: `#f50e0a`,
          });
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        errorToast("Something went wrong, please try again later.");
      })
      .finally(() => hideLoader());
  };

  const handleShiftChange = (selectedShift) => {
    if (!selectedShift) return;
    form.setFieldValue("shiftId", selectedShift);
    form.setFieldValue("shiftTime", selectedShift.shiftInTime || "");
    form.setFieldValue("tea_cost", selectedShift.tea_amount || "");
  };

  // const handleQuantityChange = (index, value) => {
  //   const updated = [...quantities];
  //   updated[index] = value;
  //   setQuantities(updated);
  // };
  const handleQuantityChange = (index, value) => {
      const updatedList = [...form.values.detailsList];
      updatedList[index].qty = Number(value);
      form.setFieldValue("detailsList", updatedList);
  };
  const total = form.values.detailsList.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const print = (row) => {
    window.open(`/public/#/TeaBillSmartForm/${row.id}`);
  };

  const closeRemarksModal = () => setShow(false);
;



const makeHeaderRows = (allDates) => {
// Row 1: "Sl No", "Plant", then each date spans 4 columns, then "Total" spans 6 columns
const row1 = ["Sl No", "Plant"];
allDates.forEach(date => {
  row1.push(date, null, null, null); // Date cell spanning 4 columns
});
row1.push("Total", null, null, null, null, null); // Total cell spanning 6 columns

// Row 2: empty for Sl No, Plant, then shifts, then total column titles
const row2 = ["", ""];
allDates.forEach(() => {
  row2.push("G", "01st", "02st", "03rd");
});
row2.push("G", "01st", "02st", "03rd", "Total", "Cost");

return [row1, row2];
};

const exportTeaBillDetailedSummary = () => {
const departmentMap = new Map();

// Aggregate quantities by department, date, and shift
data.forEach((entry) => {
  const date = entry.bill_date;
  const deptItems = entry.quantities;

  deptItems.forEach((item) => {
    const dept = item.item_name || "Unknown";
    // Adjust shift field according to your data structure
    const shift = item.shift || entry.shift_name || "Unknown";
    const qty = Number(item.qty || 0);
    const rate = Number(entry.tea_cost || 0);

    if (!departmentMap.has(dept)) departmentMap.set(dept, {});
    const deptData = departmentMap.get(dept);

    if (!deptData[date]) deptData[date] = {};
    if (!deptData[date][shift]) deptData[date][shift] = { qty: 0 };

    deptData[date][shift].qty += qty;
    deptData["tea_cost"] = rate; // fixed rate per department
  });
});

const allDates = [...new Set(data.map(d => d.bill_date))].sort();

const [headerRow1, headerRow2] = makeHeaderRows(allDates);

const rows = [];
let sl = 1;

for (const [dept, records] of departmentMap.entries()) {
  const row = [sl++, dept];
  let gTotal = 0, s1Total = 0, s2Total = 0, s3Total = 0;

  allDates.forEach(date => {
    const dayData = records[date] || {};

    // Replace shift names as per your actual data keys
    const g = (dayData["GENTRAL SHIFT"]?.qty) || 0;
    const s1 = (dayData["1ST SHIFT"]?.qty) || 0;
    const s2 = (dayData["2ND SHIFT"]?.qty) || 0;
    const s3 = (dayData["3RD SHIFT"]?.qty) || 0;

    gTotal += g;
    s1Total += s1;
    s2Total += s2;
    s3Total += s3;

    row.push(g, s1, s2, s3);
  });

  const grandTotal = gTotal + s1Total + s2Total + s3Total;
  const rate = records["tea_cost"] || 0;
  const cost = grandTotal * rate;

  row.push(gTotal, s1Total, s2Total, s3Total, grandTotal, cost);
  rows.push(row);
}

const sheetData = [headerRow1, headerRow2, ...rows];

const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

// Setup merges for first header row (dates + total)
const merges = [];
let col = 2; // after "Sl No" and "Plant"

allDates.forEach(() => {
  merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 3 } }); // Each date spans 4 columns
  col += 4;
});

// "Total" spanning 6 columns: G, 01st, 02st, 03rd, Total, Cost
merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 5 } });

worksheet['!merges'] = merges;

// Set column widths (adjust as needed)
worksheet['!cols'] = [
  { wch: 6 },   // Sl No
  { wch: 18 },  // Plant
  ...Array(sheetData[0].length - 2).fill({ wch: 10 }) // shifts and totals
];

// Center align all cells, bold only headers (first two rows)
const totalRows = sheetData.length;
const totalCols = sheetData[0].length;

for(let r=0; r<totalRows; r++) {
  for(let c=0; c<totalCols; c++) {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = worksheet[cellRef];
    if(cell) {
      cell.s = {
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        font: r < 2 ? { bold: true } : { bold: false }
      };
    }
  }
}
console.log(worksheet['A1'].s);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Tea Bill Summary");

XLSX.writeFile(workbook, "TeaBill_Summary.xlsx", { cellStyles: true });
}




// Usage in react component:
// <button onClick={() => exportTeaBillDetailedSummary(data)}>Export Excel</button>


// Call from your component with your "data"
 const handleKeyDown = (e) => {
  // Prevent typing anything manually in the input field
  e.preventDefault();
 }; 
  
 const toInputDateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "";
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};
   return (
  <div>
    {/* ✅ NEW Button */}
    <div className="mb-2 text-right">
      <Button color="success" size="sm" onClick={exportTeaBillDetailedSummary}>
        Export Department Summary
      </Button>
    </div>

    <TableComponent showDownload columns={columns} data={data} />

    <Modal show={show} centered size="lg">
      <CardHeader>
        <Row>
          <Col sm="10"><h4>Approve Tea Bill</h4></Col>
          <Col sm="2" className="text-right">
            <X color="red" onClick={closeRemarksModal} size={20} />
          </Col>
        </Row>
      </CardHeader>
      <Modal.Body>
        <Row>
        <Col md="6" sm="6">
                          <FormGroup>
                          <CustomTextInput
                              label={"Date"}
                              type="date"
                              id="bill_date"
                              form={form}
                              min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                              max={new Date().toISOString().split("T")[0]}
                              onKeyDown={handleKeyDown}
                              />
                          </FormGroup>
          </Col>
          <Col md="6"><CustomTextInput label="Gate Date Time" type="text" id="createdDate" form={form} disabled /></Col>
          <Col md="6"><CustomTextInput label="Token No" type="text" id="uniqueId" form={form} disabled /></Col>
          <Col md="6">
            <CustomDropdownInput url={`${apiBaseUrl}FoodTeaTokenController/getVendor/TEA`} label="Hotel Name" form={form} id="vendorId" />
          </Col>
          <Col md="6">
            <CustomDropdownInput url={`${apiBaseUrl}FoodTeaTokenController/getShift`} label="Shift" form={form} id="shiftId" onChange={handleShiftChange} />
          </Col>
          <Col md="6"><CustomTextInput label="In Time" type="time" id="in_time" form={form} /></Col>
          <Col md="6"><CustomTextInput label="Out Time" type="time" id="out_time" form={form} /></Col>
          <Col md="6"><CustomTextInput label="Tea Cost" type="text" id="tea_cost" form={form} disabled /></Col>
          <Col md="6">
            <FormGroup>
              <Label>Remarks</Label>
              <Input type="text" value={form.values.remark || ""} onChange={(e) => form.setFieldValue("remark", e.target.value)} />
            </FormGroup>
          </Col>

          <Table bordered>
            <thead className="text-center">
              <tr><th>Sl.No</th><th>Details</th><th>Quantity</th></tr>
            </thead>
            <tbody>
              {form.values.detailsList.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{item.item_name}</td>
                  <td><Input type="number" value={item.qty || ""} onChange={(e) => handleQuantityChange(idx, e.target.value)} min="0" /></td>
                </tr>
              ))}
              <tr><td colSpan="2" className="text-right"><strong>Total</strong></td><td><Input type="number" value={total} disabled /></td></tr>
            </tbody>
          </Table>

          <Col md="3">
            <Button.Ripple color="danger" onClick={() => onSubmit(0)}>
              <Circle size={16} /> Reject
            </Button.Ripple>
          </Col>
          <Col md="9" className="text-right">
            <Button.Ripple color="primary" onClick={() => onSubmit(2)}>
              <Edit size={16} /> Approve
            </Button.Ripple>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  </div>
);
};

export default TeaBillList;
