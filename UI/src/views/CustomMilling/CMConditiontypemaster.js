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

const columnsData = [
  {
    name: "Purchase ORG",
    selector: "definitionsName",
    sortable: true,
  },
  {
    name: "Condition Type Code",
    selector: "condition_type_code",
    sortable: true,
  },
  {
    name: "Condition Description",
    selector: "condition_description",
    sortable: true,
  },
];

const CConditionTypeMaster = () => {
  const { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector(
    (state) => (state?.auth ? state.auth.userData : {})
  );

  const [tableData, setTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= LOAD TABLE ================= */

  useEffect(() => {
    reloadTable();
  }, []);

  const reloadTable = async () => {
    showLoader();

    try {
      const res = await apiPostMethod(
        apiBaseUrl +
        "CustomMillingMasterController/getConditionTypeList/30"
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

  /* ================= FORM ================= */

  const form = useFormik({
    initialValues: {
      purchase_org: "",
      condition_type_code: "",
      condition_description: "",
    },

    enableReinitialize: true,

    onSubmit: async (values) => {
      showLoader();

      try {
        const payload = {
          id: editData?.id || 0,
          purchase_org:
            values.purchase_org?.value,
          condition_type_code: values.condition_type_code,
          condition_description: values.condition_description,
          created_by: UserDetails.USERID,
        };


        const res = await apiPostMethod(
          apiBaseUrl +
          "CustomMillingMasterController/InsertUpdateConditionType",
          payload
        );
        if(res?.data?.results?.id?.error){
                errorToast(res?.data?.results?.id?.error || "Insert failed");
        }else if (res?.data?.success){
          ShowToast(
            editData
              ? "Updated Successfully"
              : "Inserted Successfully"
          );

          setModalOpen(false);
          setEditData(null);
          form.resetForm();

          reloadTable();
        } else {
          errorToast(
            res?.data?.error || "Failed to save data"
          );
        }
      } catch {
        errorToast("Error while saving");
      } finally {
        hideLoader();
      }
    },
  });

  /* ================= ADD ================= */

  const handleAdd = () => {
    setEditData(null);

    form.resetForm();

    setModalOpen(true);
  };

  /* ================= EDIT ================= */

  const handleEdit = (row) => {
    setEditData(row);

    form.setValues({
      condition_type_code: row.condition_type_code,
      condition_description: row.condition_description,
    });
    form.setFieldValue("purchase_org", {
      label: row.definitionsName,
      definitionsvalues: row.purchase_org_id,
    });


    setModalOpen(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = (row) => {
    confirmDialog({
      title: "Delete this Condition Type?",
      description: `Code: ${row.condition_type_code}`,
    }).then(async (res) => {
      if (res) {
        showLoader();

        try {
          const response = await apiPostMethod(
            apiBaseUrl +
            "CustomMillingMasterController/DeleteConditionType",
            {
              id: row.id,
              deleted_by: UserDetails.USERID,
            }
          );

          if (response?.data?.success) {
            ShowToast("Deleted Successfully");

            reloadTable();
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
      title: "Revert this Condition Type?",
      description: `Code: ${row.condition_type_code}`,
    }).then(async (res) => {
      if (res) {
        showLoader();

        try {
          const response = await apiPostMethod(
            apiBaseUrl +
            "CustomMillingMasterController/RevertConditionType",
            {
              id: row.id,
              reverted_by: UserDetails.USERID,
            }
          );

          if (response?.data?.success) {
            ShowToast("Reverted Successfully");

            reloadTable();
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

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    ...columnsData,

    {
      name: "Actions",

      cell: (row) => (
        <>
          <Button
            size="sm"
            color="primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>

          &nbsp;

          {row.status == 1 && (
            <Button
              size="sm"
              color="danger"
              onClick={() => handleDelete(row)}
            >
              Delete
            </Button>
          )}

          &nbsp;

          {row.status == 0 && (
            <Button
              size="sm"
              color="warning"
              onClick={() => handleRevert(row)}
            >
              Revert
            </Button>
          )}
        </>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div>
      <Card>
        <CardHeader className="d-flex justify-content-between">
          <CardTitle>
            Condition Type Master List
          </CardTitle>

          <Button
            color="primary"
            size="sm"
            onClick={handleAdd}
          >
            Add Condition Type
          </Button>
        </CardHeader>

        <CardBody>
          <TableComponent
            columns={columns}
            data={tableData}
          />
        </CardBody>
      </Card>

      {/* ================= MODAL ================= */}

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        centered
        size="md"
      >
        <ModalHeader
          toggle={() => setModalOpen(false)}
        >
          {editData
            ? "Edit Condition Type"
            : "Add Condition Type"}
        </ModalHeader>

        <ModalBody>
          <form onSubmit={form.handleSubmit}>
            <Row>
              {/* Purchase ORG */}

              <Col md="12">
                <CustomDropdownInput
                  label="Purchase ORG"
                  url={`${apiBaseUrl}CustomMillingMasterController/getpurchaseorg`}
                  id="purchase_org"
                  name="purchase_org"
                  form={form}
                />
              </Col>

              {/* Condition Type Code */}

              <Col md="12">
                <FormGroup>
                  <Label>
                    Condition Type Code
                  </Label>

                  <Input
                    name="condition_type_code"
                    value={
                      form.values
                        .condition_type_code
                    }
                    onChange={
                      form.handleChange
                    }
                  />
                </FormGroup>
              </Col>

              {/* Condition Description */}

              <Col md="12">
                <FormGroup>
                  <Label>
                    Condition Description
                  </Label>

                  <Input
                    name="condition_description"
                    value={
                      form.values
                        .condition_description
                    }
                    onChange={
                      form.handleChange
                    }
                  />
                </FormGroup>
              </Col>

              {/* Submit */}

              <Col
                md="12"
                className="text-end"
              >
                <Button
                  color="primary"
                  type="submit"
                >
                  {editData
                    ? "Update"
                    : "Save"}
                </Button>
              </Col>
            </Row>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CConditionTypeMaster;
