import {
  Card, CardHeader, CardBody, Button, Row, Col,
  FormGroup, Label, Input, Badge
} from "reactstrap";
import React, { useState, useEffect } from "react";
import TableComponent from "../common/TableComponent";
import { Edit, Printer, X, Circle } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

/* ================= TABLE COLUMNS ================= */

export const taColumns = [
  { name: "Token No", selector: "uniqueId", minWidth: "160px" },
  { name: "Employee Code", selector: "emp_code", minWidth: "130px" },
  { name: "Employee Name", selector: "emp_name", minWidth: "180px" },
  { name: "Hotel Name", selector: "Name", minWidth: "180px" }, 
  { name: "Contract Name", selector: "contractorName", minWidth: "180px" },
  { name: "Department", selector: "emp_department", minWidth: "220px" },
  { name: "Designation", selector: "emp_designation", minWidth: "220px" }, 
  { name: "CostCentre", selector: "emp_costcentre", minWidth: "220px" },
  { name: "Shift", selector: "shiftName", minWidth: "120px" },
  { name: "Shift Time", selector: "shiftTime", minWidth: "130px" },
  { name: "In Time", selector: "inTime", minWidth: "120px" },
  { name: "Out Time", selector: "outTime", minWidth: "120px" },
  { name: "Bill Date", selector: "billDate", minWidth: "120px" },
  { name: "Issued By", selector: "FIRST_NAME", minWidth: "140px" },
  { name: "Amount", selector: "amount", minWidth: "120px" },
  { name: "Food Type", selector: "foodTypename", minWidth: "120px" },
  { name: "Remarks", selector: "remark", minWidth: "120px" },
  {
    name: "Status",
    selector: "statusName",
    cell: row => (
      <Badge color={row.status == 2 ? "success" : row.status == 1 ? "primary" : "danger"}>
        {row.statusName}
      </Badge>
    )
  }
];

/* ================= COMPONENT ================= */

const FoodBillList = ({ data }) => {
  const UserDetails = useSelector(state => state?.auth?.userData || {});
  const { showLoader, hideLoader } = useLoader();
  const [show, setShow] = useState(false);

  /* 🔥 EXISTING STATES */
  const [foodDefinitionValue, setFoodDefinitionValue] = useState('');
  const [noOfLoadman, setNoOfLoadman] = useState('');
  const [baseAmount, setBaseAmount] = useState(0);
  const [employeeDesignation, setEmployeeDesignation] = useState('');

  const [cpToWhom, setCpToWhom] = useState(null);
  const isCPPlant = UserDetails.plantids?.includes("CP00");
  const isCPGuest = isCPPlant && cpToWhom?.label === "GUEST";

  /* ✅ NEW STATE */
  const [selectedRows, setSelectedRows] = useState([]);

  const form = useFormik({ initialValues: {} });

  /* ================= ACTION COLUMN ================= */

  const columns = [
    {
      name: "Actions",
      minWidth: "220px",
      cell: row => (
        <>
          {/* APPROVE */}
          {row.status == 1 &&
            (UserDetails.role === "Approver" || UserDetails.role === "Admin") && (
              <Button size="sm" color="primary" onClick={() => openModal(row)}>
                <Edit size={14} /> Approve
              </Button>
            )}

          {/* PRINT – CP00 */}
          {row.status > 0 && row.plantCode == "CP00" && (
            <Button
              size="sm"
              color="primary"
              className="ml-1"
              onClick={() => window.open(`/public/#/foodSmartForm/${row.id}`)}
            >
              <Printer size={14} /> Print
            </Button>
          )}

          {/* PRINT – NON CP00 (FM01 etc.) */}
          {row.status > 0 && row.plantCode != "CP00" && (
            <Button
              size="sm"
              color="primary"
              className="ml-1"
              onClick={() => window.open(`/public/#/NLFDfoodSmartForm/${row.id}`)}
            >
              <Printer size={14} /> Print
            </Button>
          )}
        </>
      )
    },
     ...taColumns,
  ];


  /* ================= ROW SELECTION ================= */

  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  /* ================= BULK APPROVE ================= */

  const approveSelectedRows = () => {
  if (!selectedRows.length) {
    errorToast("Please select at least one record");
    return;
  }

  const validRows = selectedRows.filter(row => row.status == 1);

  if (!validRows.length) {
    errorToast("No eligible records selected");
    return;
  }

  const ids = validRows.map(row => row.id);

  // ✅ TOTAL ROW COUNT
  const totalRows = validRows.length;

  // ✅ TOTAL AMOUNT
  const totalAmount = validRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );


  let msg =
    `Total Tokens Selected: ${totalRows}\n` +`|\n`+
    `Total Amount: ₹ ${totalAmount.toFixed(2)}`;

  confirmDialog({
    title: "Are you sure want to approve?",
    description: msg
  }).then(result => {
    if (!result) return;

    const payload = {
      ids,
      userInfoId: UserDetails.USERID,
      status: 2
    };

    showLoader();
    apiPostMethod(
      apiBaseUrl + "FoodTeaTokenController/bulkApproveFoodBill",
      payload
    )
      .then(res => {
        confirmDialog({
          title: res.data.message,
          cancelButton: false,
          confirmButton: false,
          background: res.data.success ? "#51A351" : "#f50e0a"
        }).then(() => window.location.reload());
      })
      .catch(() => errorToast("Something went wrong"))
      .finally(hideLoader);
  });
};



  /* ================= OPEN MODAL ================= */

  const openModal = row => {
    setShow(true);

    setFoodDefinitionValue(row.foodType || '');
    setNoOfLoadman(row.noOfLoadman || '');
    setBaseAmount(Number(row.shiftamount || 0));
    setEmployeeDesignation(row.employeeDesignation || '');
    setContractorName(row.contractorName || '')
    if (row.plantCode == "CP00") {
  setCpToWhom(
    row.toWhom
      ? { value: row.toWhom, label: row.toWhomName }
      : null
  );
}

    form.setValues({
      id: row.id,
      uniqueId: row.uniqueId,
      billDate: formatDate(row.billDate),
      emp_department: row.emp_department,
      emp_costcentre: row.emp_costcentre,
      shiftTime: row.shiftTime,
      inTime: row.inTime,
      outTime: row.outTime,
      amount: row.amount,
      remark: row.remark,
      FIRST_NAME: row.FIRST_NAME,
      
      

      vendorId: { value: row.vendorId, label: row.Name },
      shiftId: { value: row.shiftId, label: row.shiftName },
      employeeId: { value: row.employeeId, label: `${row.emp_name}-${row.emp_code}` },

      foodtype: row.foodType
        ? { value: row.foodType, label: row.foodTypename }
        : null,

      towhom: row.toWhom
        ? { value: row.toWhom, label: row.toWhomName }
        : null,
    });
  };
  

  /* ================= MANAGER OVERRIDE ================= */

  const isAmountEditable =
  ["FM01", "FR01"].some(p => UserDetails.plantids?.includes(p)) &&
  employeeDesignation?.toLowerCase().includes("manager");
    const [contractorName, setContractorName] = useState('');

  /* ================= AUTO CALC ================= */

 useEffect(() => {
  if (isAmountEditable) return;

  // ✅ CP00 Guest logic
  if (isCPGuest) {
    form.setFieldValue("amount", baseAmount * (Number(noOfLoadman) || 0));
    return;
  }

  // ✅ Existing logic
  if (["LOADMAN", "PACKING"].includes(form.values?.towhom?.label)) {
    form.setFieldValue("amount", baseAmount * (Number(noOfLoadman) || 0));
  } else {
    form.setFieldValue("amount", baseAmount);
    setNoOfLoadman('');
  }
}, [form.values?.towhom, noOfLoadman, baseAmount, isAmountEditable, isCPGuest]);

  /* ================= SUBMIT (SINGLE APPROVE) ================= */

  const submitApproval = status => {
    const v = form.values;

    if (!v.outTime) {
      errorToast("Please select Out Time");
      return;
    }

    const payload = {
      id: v.id,
      status,
      userInfoId: UserDetails.USERID,
      vendorId: v.vendorId.value,
      shiftId: v.shiftId.value,
      employeeId: v.employeeId.value,
      inTime: v.inTime,
      outTime: v.outTime,
      shiftTime: v.shiftTime,
      amount: v.amount,
      remark: v.remark,
      billDate: v.billDate,
      foodType: v.foodtype?.definitionsvalues,
      foodTypename: v.foodtype?.label,
      toWhom: isCPPlant ? cpToWhom?.value : v.towhom?.value,
      toWhomname: isCPPlant ? cpToWhom?.label : v.towhom?.label,

      noOfLoadman: isCPGuest
        ? Number(noOfLoadman || 0)
        : ["LOADMAN", "PACKING"].includes(v.towhom?.label)
          ? Number(noOfLoadman || 0)
          : 0,

      contractorName:
        ["LOADMAN", "PACKING"].includes(v.towhom?.label)
          ? contractorName
          : "",

      noOfLoadman:
        ["LOADMAN", "PACKING"].includes(v.towhom?.label)
          ? Number(noOfLoadman || 0)
          : 0
};


    showLoader();
    apiPostMethod(apiBaseUrl + "FoodTeaTokenController/updateFoodBill", payload)
      .then(res => {
        confirmDialog({
          title: `<h5 class="text-white">${res.data.message}</h5>`,
          cancelButton: false,
          confirmButton: false,
          background: res.data.success ? "#51A351" : "#f50e0a"
        }).then(() => window.location.reload());
      })
      .catch(() => errorToast("Something went wrong"))
      .finally(hideLoader);
  };

  const formatDate = d => {
    if (!d) return "";
    const [dd, mm, yy] = d.split("-");
    return `${yy}-${mm}-${dd}`;
  };

  /* ================= RENDER ================= */

  return (
    <>
      <TableComponent
        select
        showDownload
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        columns={columns}
        data={data}
      />

      {/* ✅ APPROVE BUTTON AFTER TABLE */}
      {(UserDetails.role === "Approver" || UserDetails.role === "Admin") &&
        selectedRows.some(row => row.status == 1) && (
          <Row className="mt-2">
            <Col md="12" className="text-right">
              <Button color="primary" onClick={approveSelectedRows}>
                <Edit size={14} /> Approve
              </Button>
            </Col>
          </Row>
        )}

      {/* ================= MODAL BODY (FULL) ================= */}

      <Modal show={show} centered size="lg">
        <CardHeader>
          <Row>
            <Col md="10"><h4>Approve Food Token</h4></Col>
            <Col md="2" className="text-right">
              <X color="red" onClick={() => setShow(false)} />
            </Col>
          </Row>
        </CardHeader>

        <Modal.Body>
          <Row>
            <Col md="6"><CustomTextInput label="Date" type="date" id="billDate" form={form} /></Col>
            <Col md="6"><CustomTextInput label="Token No" id="uniqueId" form={form} disabled /></Col>

            <Col md="6">
              <CustomDropdownInput
                url={`${apiBaseUrl}FoodTeaTokenController/getVendor/FOOD`}
                label="Hotel Name"
                form={form}
                id="vendorId"
              />
            </Col>

            <Col md="6">
              <CustomDropdownInput
                url={`${apiBaseUrl}FoodTeaTokenController/GetEmployeeName/${UserDetails.plantids}`}
                label="Employee Name"
                form={form}
                id="employeeId"
              />
            </Col>

            <Col md="6"><CustomTextInput label="Department" id="emp_department" form={form} disabled /></Col>
            <Col md="6"><CustomTextInput label="Cost Centre" id="emp_costcentre" form={form} disabled /></Col>

          {["FM01", "FR01"].some(p => UserDetails.plantids?.includes(p)) && (
              <>
                <Col md="6">
                  <CustomDropdownInput
                    url={`${apiBaseUrl}FoodTeaTokenController/gettypeforfood`}
                    label="Food Type"
                    form={form}
                    id="foodtype"
                    onChange={(selected) => {
                      form.setFieldValue("foodtype", selected);
                      setFoodDefinitionValue(selected?.definitionsvalues);
                    }}
                  />
                </Col>

                <Col md="6">
                  <CustomDropdownInput
                    url={`${apiBaseUrl}FoodTeaTokenController/gettowhomlist`}
                    label="To Whom"
                    form={form}
                    id="towhom"
                  />
                </Col>

                {["LOADMAN", "PACKING"].includes(form.values?.towhom?.label) && (
                  <Col md="6">
                    <FormGroup>
                      <Label>No of Members</Label>
                      <Input
                        type="number"
                        value={noOfLoadman}
                        onChange={(e) => setNoOfLoadman(Number(e.target.value || 0))}
                      />
                    </FormGroup>
                  </Col>
                )}
              </>
            )}
            {["LOADMAN", "PACKING"].includes(form.values?.towhom?.label) && (
              <Col md="6">
                <FormGroup>
                  <Label>Contractor Name</Label>
                  <Input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="Enter contractor name"
                  />
                </FormGroup>
              </Col>
            )}
            {isCPPlant && (
              <Col md="6">
                <CustomDropdownInput
                  url={`${apiBaseUrl}FoodTeaTokenController/gettowhomlistforcp`}
                  label="To Whom (CP00)"
                  form={form}
                  id="cpToWhom"
                  value={cpToWhom}
                  onChange={(selected) => {
                    setCpToWhom(selected);
                    setNoOfLoadman(0); // reset
                  }}
                />
              </Col>
            )}{isCPGuest && (
              <Col md="6">
                <FormGroup>
                  <Label>No of Members</Label>
                  <Input
                    type="number"
                    value={noOfLoadman}
                    onChange={(e) => {
                      setNoOfLoadman(Number(e.target.value || 0));
                    }}
                  />
                </FormGroup>
              </Col>
            )}

             <Col md="6">
             <CustomDropdownInput
              url={`${apiBaseUrl}FoodTeaTokenController/getShift/${UserDetails.plantids}/${foodDefinitionValue}`}
              label="Shift"
              form={form}
              id="shiftId"
              onChange={(selected) => {
                form.setFieldValue("shiftId", selected);

                // 🔥 Update shift time
                form.setFieldValue("shiftTime", selected?.shiftInTime || "");

                // 🔥 Update base amount from API
                const amount = Number(selected?.amount || 0);
                setBaseAmount(amount);

                // 🔥 Direct amount update
                if (["LOADMAN", "PACKING"].includes(form.values?.towhom?.label)) {
                  form.setFieldValue("amount", amount * (Number(noOfLoadman) || 0));
                } else {
                  form.setFieldValue("amount", amount);
                }
              }}
            />
            </Col>

            <Col md="6"><CustomTextInput label="Shift Time" id="shiftTime" form={form} disabled /></Col>
            <Col md="6"><CustomTextInput label="In Time" type="time" id="inTime" form={form} /></Col>
            <Col md="6"><CustomTextInput label="Out Time" type="time" id="outTime" form={form} /></Col>

            <Col md="6">
              <FormGroup>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.values.amount || ""}
                  disabled={!isAmountEditable}
                  onChange={(e) => {
                    if (isAmountEditable) {
                      form.setFieldValue("amount", Number(e.target.value || 0));
                    }
                  }}
                />
              </FormGroup>
            </Col>

            <Col md="6"><CustomTextInput label="Issued By" id="FIRST_NAME" form={form} disabled /></Col>
            <Col md="12"><CustomTextInput label="Remarks" id="remark" form={form} /></Col>

            <Col md="2">
              <Button color="danger" onClick={() => submitApproval(0)}>
                <Circle size={14} /> Reject
              </Button>
            </Col>

            <Col md="10" className="text-right">
              <Button color="primary" onClick={() => submitApproval(2)}>
                <Edit size={14} /> Approve
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FoodBillList;
