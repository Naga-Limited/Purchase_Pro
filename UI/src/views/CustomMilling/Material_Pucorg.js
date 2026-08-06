import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  Col,
  Row,
} from "reactstrap";
import { useFormik } from "formik";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { CustomDropdownInput } from "../forms/custom-form";

/* ================= TABLE COLUMNS ================= */
const materialColumns = [
  { name: "Material Code", selector: "material_code", sortable: true },
  { name: "Material Description", selector: "material_description", sortable: true },
  { name: "Segment", selector: "segment", sortable: true },
  { name: "Purchase Org", selector: "definitionsName", sortable: true },
];

const CMaterialMaster = () => {
  const [tableData, setTableData] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector(
    (state) => (state?.auth ? state.auth.userData : {})
  );

  /* ================= FORMIK ================= */
  const form = useFormik({
    initialValues: {
      material_code: "",
      material_description: "",
      segment: "",
      purchase_org: null,
    },
    onSubmit: () => { },
  });

  /* ================= LOAD TABLE ================= */
  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    showLoader();
    try {
      const res = await apiPostMethod(
        apiBaseUrl + "CustomMillingMasterController/getMaterialMasterList"
      );
      if (res?.data?.success) {
        setTableData(res.data.results || []);
      }
    } catch {
      errorToast("Failed to load data");
    } finally {
      hideLoader();
    }
  };

  /* ================= ADD ================= */
  const handleAdd = async () => {
    const { material_code, material_description, segment, purchase_org } =
      form.values;

    if (!material_code || !material_description || !segment || !purchase_org) {
      errorToast("Please fill all fields");
      return;
    }

    showLoader();

    try {
      const postData = {
        material_code: material_code?.value || material_code,
        material_description,
        segment,
        purchase_org_id: purchase_org?.value,
        created_by: UserDetails.USERID,
      };

      const res = await apiPostMethod(
        apiBaseUrl + "CustomMillingMasterController/InsertMaterialMaster",
        postData
      );
      if(res?.data?.results?.id?.error){
        errorToast(res?.data?.results?.id?.error || "Insert failed");
      }else if (res?.data?.success == 1) {
        ShowToast("Material added successfully");
        form.resetForm();
        loadTable();
      } else {
        // 🔥 SHOW BACKEND ERROR MESSAGE
        errorToast(res?.data?.error || "Insert failed");
      }

    } catch (error) {
      errorToast(
        error?.response?.data?.error ||
        "Error while saving"
      );
    } finally {
      hideLoader();
    }
  };

  /* ================= VIEW ================= */
  const handleView = (row) => {
    setSelectedRow(row);

    form.setFieldValue("material_code", row.material_code);
    form.setFieldValue("material_description", row.material_description);
    form.setFieldValue("segment", row.segment);

    form.setFieldValue("purchase_org", {
      label: row.definitionsName,
      value: row.purchase_org_id,
    });

    setViewModalOpen(true);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    const { material_code, material_description, segment, purchase_org } =
      form.values;

    if (!material_code || !material_description || !segment || !purchase_org) {
      errorToast("Please fill all fields");
      return;
    }

    showLoader();
    try {
      const postData = {
        id: selectedRow.id,
        material_code,
        material_description,
        segment,
        purchase_org_id: purchase_org.value,
        updated_by: UserDetails.USERID,
      };

      const res = await apiPostMethod(
        apiBaseUrl + "CustomMillingMasterController/UpdateMaterialMaster",
        postData
      );

      if (res?.data?.success) {
        ShowToast("Updated successfully");
        setViewModalOpen(false);
        setTimeout(() => window.location.reload(), 2000);
        form.resetForm();
        loadTable();
      } else {
        errorToast("Update failed");
      }
    } catch {
      errorToast("Error while updating");
    } finally {
      hideLoader();
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (row) => {
    confirmDialog({
      title: "Delete this Material?",
      description: `Material Code: ${row.material_code}`,
    }).then(async (res) => {
      if (res) {
        showLoader();
        try {
          const response = await apiPostMethod(
            apiBaseUrl + "CustomMillingMasterController/DeleteMaterialMaster",
            {
              id: row.id,
              deleted_by: UserDetails.USERID,
            }
          );

          if (response?.data?.success) {
            ShowToast("Deleted successfully");
            loadTable();
          } else {
            errorToast("Delete failed");
          }
        } catch {
          errorToast("Error while deleting");
        } finally {
          hideLoader();
        }
      }
    });
  };
  /* ================= REVERT ================= */
  const handleRevert = (row) => {
    confirmDialog({
      title: "Revert this Material?",
      description: `Material Code: ${row.material_code}`,
    }).then(async (res) => {
      if (res) {
        showLoader();
        try {
          const response = await apiPostMethod(
            apiBaseUrl + "CustomMillingMasterController/RevertMaterialMaster",
            {
              id: row.id,
              reverted_by: UserDetails.USERID,
            }
          );

          if (response?.data?.success) {
            ShowToast("Reverted successfully");
            loadTable();
          } else {
            errorToast("Revert failed");
          }
        } catch {
          errorToast("Error while reverting");
        } finally {
          hideLoader();
        }
      }
    });
  };

  /* ================= TABLE ACTIONS ================= */
  const columns = [
    ...materialColumns,
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Button size="sm" color="primary" onClick={() => handleView(row)}>
            Edit
          </Button>
          &nbsp;

          {row.status == 1 && (
            <Button size="sm" color="danger" onClick={() => handleDelete(row)}>
              Delete
            </Button>
          )}

          {row.status == 0 && (
            <Button size="sm" color="warning" onClick={() => handleRevert(row)}>
              Revert
            </Button>
          )}
        </>
      ),
    },
  ];


  /* ================= JSX ================= */
  return (
    <div>
      {/* ADD FORM */}
      <Card className="mb-2">
        <CardHeader>
          <CardTitle>Add Material Master</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md="3">
              <Label>Material Code</Label>
              <Input
                name="material_code"
                value={form.values.material_code}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="3">
              <Label>Material Description</Label>
              <Input
                name="material_description"
                value={form.values.material_description}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="3">
              <Label>Segment</Label>
              <Input
                name="segment"
                value={form.values.segment}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="3">
              <CustomDropdownInput
                label="Purchase Org"
                url={`${apiBaseUrl}CustomMillingMasterController/getpurchaseorg`}
                id="purchase_org"
                name="purchase_org"
                form={form}
              />
            </Col>
          </Row>

          <Row className="mt-2">
            <Col className="d-flex justify-content-end">
              <Button color="primary" onClick={handleAdd}>
                Add
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Material Master List</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} data={tableData} />
        </CardBody>
      </Card>

      {/* UPDATE MODAL */}
      <Modal
        isOpen={viewModalOpen}
        toggle={() => setViewModalOpen(false)}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setViewModalOpen(false)}>
          Update Material Master
        </ModalHeader>

        <ModalBody>
          <Row>
            <Col md="6">
              <Label>Material Code</Label>
              <Input
                name="material_code"
                value={form.values.material_code}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="6">
              <Label>Material Description</Label>
              <Input
                name="material_description"
                value={form.values.material_description}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="6" className="mt-2">
              <Label>Segment</Label>
              <Input
                name="segment"
                value={form.values.segment}
                onChange={form.handleChange}
              />
            </Col>

            <Col md="6" className="mt-2">
              <CustomDropdownInput
                label="Purchase Org"
                url={`${apiBaseUrl}CustomMillingMasterController/getpurchaseorg`}
                id="purchase_org"
                name="purchase_org"
                form={form}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col className="d-flex justify-content-end">
              <Button color="primary" onClick={handleUpdate}>
                Update
              </Button>
              &nbsp;
              <Button color="secondary" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CMaterialMaster;
