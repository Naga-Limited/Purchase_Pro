import React, { useEffect, useState, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Label,
  Input,
  Col,
  Row,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";

import { useFormik } from "formik";
import { useSelector } from "react-redux";

import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";

import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";

import { CustomDropdownInput } from "../forms/custom-form";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const CRegisterMaster = () => {

  const { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector(
    state => state?.auth?.userData || {}
  );

  /* ================= STATE ================= */

  const [userPlant, setUserPlant] = useState([]);
  const [dataTypeOptions, setDataTypeOptions] = useState([]);
  const [deletedSubtypes, setDeletedSubtypes] = useState([]); // ✅ NEW
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editModal, setEditModal] = useState(false);

  /* ================= FORMIK ================= */

  const form = useFormik({
    initialValues: {
      register_name: "",
      no_of_subtypes: "",
      masterPlantId: null,
      department: null,
      designation: null
    },
    onSubmit: () => { }
  });

  /* ================= LOAD PLANT ================= */

  const getUserPlant = async () => {

    try {

      const res = await apiGetMethod(
        apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`
      );

      if (res.data.success)
        setUserPlant(res.data.results);

    }
    catch {

      errorToast("Failed to load plant");

    }

  };

  /* ================= LOAD DATA TYPES ================= */

  const getDataTypes = async () => {

    try {

      const res = await apiGetMethod(
        apiBaseUrl + "RegisterController/getDataTypes"
      );

      if (res.data.success)
        setDataTypeOptions(res.data.results);

    }
    catch {

      errorToast("Failed to load Data Types");

    }

  };

  /* ================= LOAD DEPARTMENT ================= */

  const getDepartment = async () => {

    try {

      const res = await apiGetMethod(
        apiBaseUrl + "RegisterController/getDepartment"
      );

      if (res.data.success)
        setDepartmentOptions(res.data.results);

    }
    catch {

      errorToast("Failed to load Department");

    }

  };

  /* ================= LOAD DESIGNATION ================= */

  const getDesignation = async () => {

    try {

      const res = await apiGetMethod(
        apiBaseUrl + "RegisterController/getDesignation"
      );

      if (res.data.success)
        setDesignationOptions(res.data.results);

    }
    catch {

      errorToast("Failed to load Designation");

    }

  };

  /* ================= LOAD TABLE ================= */

  const loadTable = async () => {

    showLoader();

    try {

      const res = await apiPostMethod(
        apiBaseUrl + "RegisterController/getRegisterList"
      );

      if (res.data.success)
        setTableData(res.data.results);

    }
    catch {

      errorToast("Failed to load table");

    }
    finally {

      hideLoader();

    }

  };

  useEffect(() => {

    if (UserDetails?.USERID) {

      getUserPlant();
      getDepartment();
      getDesignation();
      loadTable();

    }

  }, [UserDetails]);

  /* ================= HANDLE COUNT ================= */

  const handleCountChange = async (e) => {

    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    form.setFieldValue("no_of_subtypes", value);

    await getDataTypes();

    let arr = [];

    for (let i = 0; i < Number(value); i++) {

      arr.push({
        subtype: "",
        data_type: null,
        dropdown_options: ""
      });

    }

    setSubTypes(arr);

  };

  /* ================= HANDLE SUBTYPE ================= */

  const handleSubtypeChange = (index, value) => {

    const updated = [...subTypes];
    updated[index].subtype = value;
    setSubTypes(updated);

  };

  /* ================= HANDLE DATA TYPE ================= */

  const handleDataTypeChange = (index, selectedOption) => {

    const updated = [...subTypes];

    updated[index].data_type = selectedOption;

    if (selectedOption?.label !== "SELECT")
      updated[index].dropdown_options = "";

    setSubTypes(updated);

  };

  /* ================= HANDLE DROPDOWN OPTIONS ================= */

  const handleDropdownOptionsChange = (index, value) => {

    const updated = [...subTypes];

    updated[index].dropdown_options = value;

    setSubTypes(updated);

  };

  /* ================= ADD SUBTYPE ROW ================= */

  const handleAddSubtypeRow = () => {

    setSubTypes([
      ...subTypes,
      {
        subtype: "",
        data_type: null,
        dropdown_options: ""
      }
    ]);

  };

  /* ================= DELETE SUBTYPE ROW ================= */

  const handleDeleteSubtypeRow = (index) => {

    const updated = [...subTypes];
    const removedItem = updated[index];

    if (removedItem?.id) {
      setDeletedSubtypes(prev => [...prev, removedItem.id]);
    }

    updated.splice(index, 1);
    setSubTypes(updated);
  };

  /* ================= SAVE ================= */

 const handleSubmit = async () => {

  const postData = {
    register_name: form.values.register_name,
    plant_ids: form.values.masterPlantId?.werks,
    department: form.values.department?.label,
    designation: form.values.designation?.label,
    subtypes: subTypes,
    created_by: UserDetails.USERID
  };

  showLoader();

  try {
    const res = await apiPostMethod(
      apiBaseUrl + "RegisterController/insertRegister",
      postData
    );

    if (res.data.success) {
      ShowToast("Created Successfully");
      form.resetForm();
      setSubTypes([]);

      loadTable();

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } else {
      // ✅ HANDLE ERROR HERE
      errorToast(res.data.error || "Something went wrong");
    }

  } catch (err) {
    // ✅ HANDLE API FAILURE (network/server error)
    errorToast("Server error. Please try again.");
    console.error(err);
  } finally {
    hideLoader();
  }
};

  /* ================= EDIT ================= */

  const handleEdit = async (row) => {

    await getDataTypes();

    setSelectedRow(row);

    form.setFieldValue("register_name", row.register_name);

    form.setFieldValue("masterPlantId", {
      label: row.plant_code,
      value: row.plant_code,
      werks: row.plant_code
    });

    form.setFieldValue("department", {
      label: row.department || "",
      value: row.department || ""
    });

    form.setFieldValue("designation", {
      label: row.designation || "",
      value: row.designation || ""
    });

  const subtypeData = row.details.map(x => ({
  id: x.reg_det_id,
  subtype: x.register_subtype,

  // ✅ DIRECTLY CREATE OBJECT (NO DEPENDENCY ON STATE)
  data_type: {
    label: x.datatype,
    value: x.datatype
  },

  dropdown_options: x.select_array?.join(",") || ""
}));

    setSubTypes(subtypeData);

    setEditModal(true);

  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {

    let existingSubtypes = [];
    let newSubtypes = [];

    subTypes.forEach(x => {

      const obj = {
        register_subtype: x.subtype,
        datatype: x.data_type?.label,
        select_array: x.dropdown_options
          ? x.dropdown_options.split(",")
          : []
      };

      // 🔹 EXISTING
      if (x.id) {
        existingSubtypes.push({
          id: x.id,
          ...obj
        });
      }
      // 🔹 NEW
      else {
        newSubtypes.push(obj);
      }

    });

    const postData = {
      reg_id: selectedRow.register_id,
      id: selectedRow.id,
      register_name: form.values.register_name,
      plant_ids: form.values.masterPlantId?.werks,
      department: form.values.department?.label,
      designation: form.values.designation?.label,

      subtypes: existingSubtypes,     // ✅ ONLY EXISTING
      newsubtypes: newSubtypes,       // ✅ ONLY NEW

      deleted_subtypes: deletedSubtypes,
      updated_by: UserDetails.USERID
    };

    showLoader();

    try {

      const res = await apiPostMethod(
        apiBaseUrl + "RegisterController/updateRegister",
        postData
      );

      if (res.data.success) {

        ShowToast("Updated Successfully");

        setEditModal(false);
        setDeletedSubtypes([]); // reset
        loadTable();
        window.setTimeout(function () {
          window.location.reload();
        }, 2000);

      }

    } finally {
      hideLoader();
    }

  };
  /* ================= DELETE ================= */

  const handleDelete = (row) => {

    confirmDialog({
      title: "Delete?",
      description: row.register_name
    }).then(async ok => {

      if (!ok) return;

      await apiPostMethod(
        apiBaseUrl + "RegisterController/deleteRegister",
        {
          id: row.id,
          deleted_by: UserDetails.USERID
        }
      );

      loadTable();

    });

  };

  /* ================= TABLE ================= */

  const columns = [

    {
      name: "Register Name",
      selector: row => row.register_name
    },

    {
      name: "Plant Code",
      selector: row => row.plant_code
    },

    {
      name: "Actions",
      cell: row => (
        <>
          <Button size="sm" color="primary"
            onClick={() => handleEdit(row)}>
            Edit
          </Button>

          &nbsp;

          <Button size="sm" color="danger"
            onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </>
      )
    }

  ];

  /* ================= UI ================= */

  return (

    <Fragment>

      {/* ADD */}

      <Card>

        <CardHeader>
          <CardTitle>Register Master</CardTitle>
        </CardHeader>

        <CardBody>

          <Row>

            <Col md="3">
              <Label>Register Name</Label>
              <Input
                name="register_name"
                value={form.values.register_name}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="3">
              <Label>No of Subtypes</Label>
              <Input
                value={form.values.no_of_subtypes}
                onChange={handleCountChange}
              />
            </Col>

            <Col md="3">
              <CustomDropdownInput
                options={userPlant}
                label="Plant"
                form={form}
                id="masterPlantId"
              />
            </Col>

            <Col md="3">
              <CustomDropdownInput
                options={departmentOptions}
                label="Designation"
                form={form}
                id="department"
              />
            </Col>

            <Col md="3">
              <CustomDropdownInput
                options={designationOptions}
                label="Department"
                form={form}
                id="designation"
              />
            </Col>

          </Row>

          <Row className="mt-2">

            {subTypes.map((x, i) => (

              <Fragment key={i}>

                <Col md="3">
                  <Input
                    placeholder="Subtype"
                    value={x.subtype}
                    onChange={(e) =>
                      handleSubtypeChange(i, e.target.value)}
                  />
                </Col>

                <Col md="3">
                  <CustomDropdownInput
                    options={dataTypeOptions}
                    form={form}
                    id={`data_type_${i}`}
                    value={x.data_type}
                    onChange={(val) =>
                      handleDataTypeChange(i, val)}
                  />
                </Col>

                {x.data_type?.label === "SELECT" && (

                  <Col md="3">
                    <Input
                      placeholder="Options"
                      value={x.dropdown_options}
                      onChange={(e) =>
                        handleDropdownOptionsChange(i, e.target.value)}
                    />
                  </Col>

                )}

              </Fragment>

            ))}

          </Row>

          <Button color="primary" className="mt-2"
            onClick={handleSubmit}>
            Save
          </Button>

        </CardBody>

      </Card>

      {/* TABLE */}

      <Card className="mt-2">

        <CardBody>

          <TableComponent
            columns={columns}
            data={tableData}
          />

        </CardBody>

      </Card>

      {/* EDIT MODAL */}

      <Modal
        isOpen={editModal}
        toggle={() => setEditModal(false)}
        size="lg"
        centered
      >

        <ModalHeader toggle={() => setEditModal(false)}>
          Edit Register
        </ModalHeader>

        <ModalBody>

          {/* REGISTER TYPE + PLANT */}

          <Row className="mb-2">

            <Col md="4">

              <Label>Register Name</Label>

              <Input
                name="register_name"
                value={form.values.register_name}
                onChange={form.handleChange}
              />

            </Col>

            <Col md="4">

              <CustomDropdownInput
                options={userPlant}
                label="Plant"
                form={form}
                id="masterPlantId"
                value={form.values.masterPlantId}
              />

            </Col>

            <Col md="4">

              <CustomDropdownInput
                options={departmentOptions}
                label="Department"
                form={form}
                id="department"
                value={form.values.department}
              />

            </Col>

            <Col md="4">

              <CustomDropdownInput
                options={designationOptions}
                label="Designation"
                form={form}
                id="designation"
                value={form.values.designation}
              />

            </Col>

          </Row>


          {/* ADD SUBTYPE BUTTON */}

          <Button
            color="success"
            size="sm"
            onClick={handleAddSubtypeRow}
          >
            Add Subtype
          </Button>


          {/* SUBTYPE TABLE */}

          <table className="table table-bordered mt-2">

            <thead style={{ backgroundColor: "#f1f1f1" }}>
              <tr>
                <th width="25%">Subtype</th>
                <th width="25%">Data Type</th>
                <th width="35%">Dropdown Options</th>
                <th width="15%">Actions</th>
              </tr>
            </thead>

            <tbody>

              {subTypes.map((row, index) => (

                <tr key={index}>

                  {/* SUBTYPE */}

                  <td>

                    <Input
                      value={row.subtype}
                      onChange={(e) =>
                        handleSubtypeChange(index, e.target.value)}
                    />

                  </td>


                  {/* DATA TYPE */}

                  <td>

                    <CustomDropdownInput
                      options={dataTypeOptions}
                      form={form}
                      id={`edit_data_type_${index}`}
                      value={row.data_type}   // ✅ FIXED
                      onChange={(val) =>
                        handleDataTypeChange(index, val)}
                    />

                  </td>


                  {/* DROPDOWN OPTIONS */}

                  <td>
                    {row.data_type?.label === "SELECT" && (

                      <Input
                        placeholder="Option1, Option2"
                        value={row.dropdown_options}   // ✅ FIXED
                        onChange={(e) =>
                          handleDropdownOptionsChange(index, e.target.value)}
                      />

                    )}
                  </td>


                  {/* DELETE */}

                  <td>

                    <Button
                      size="sm"
                      color="danger"
                      onClick={() =>
                        handleDeleteSubtypeRow(index)}
                    >
                      Delete
                    </Button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {/* UPDATE BUTTON */}

          <Row className="mt-3">

            <Col className="text-end">

              <Button
                color="primary"
                onClick={handleUpdate}
              >
                Update
              </Button>

            </Col>

          </Row>

        </ModalBody>

      </Modal>


    </Fragment>

  );

};

export default CRegisterMaster;
