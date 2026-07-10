import React, { useState, Fragment, useEffect } from "react";
import { useFormik } from "formik";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import { CustomTextInput } from "../forms/custom-form";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { useSelector } from "react-redux";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
  {
    name: "Payment To Type",
    selector: "payment_to_type",
    sortable: true,
    minWidth: "100px",
  },
];

const PaymentTypeMaster = () => {
  const { showLoader, hideLoader } = useLoader();

  const [tableData, setTableData] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null); // full row object
  const [editPaymentToType, setEditPaymentToType] = useState("");
  // editSubtypesObjs: array of objects { id: <string|null>, name: <string> }
  const [editSubtypesObjs, setEditSubtypesObjs] = useState([]);
  // track deleted subtype ids to send to backend
  const [deletedSubtypeIds, setDeletedSubtypeIds] = useState([]);
  const UserDetails = useSelector((state) => state?.auth?.userData || {});

  useEffect(() => {
    loadTableData();
  }, []);

  const loadTableData = () => {
    showLoader();
    apiPostMethod(apiBaseUrl + "RecurringPaymentController/Getpaymenttotype", {})
      .then((response) => {
        const { data } = response;

        if (data.success === 1) {
          setTableData(data.results || []); // data.results as your API returns
        } else {
          errorToast(data.ErrorMsg || "Unable to load data");
        }
      })
      .catch(() => {
        errorToast("Unable to fetch table data");
      })
      .finally(() => hideLoader());
  };

  // ------------------------------------------
  //  Edit modal handlers (now with ids)
  // ------------------------------------------
  const openEditModal = (row) => {
    setEditingRow(row || null);
    setEditPaymentToType(row?.payment_to_type || "");

    // prepare objects { id, name } from API fields
    const subs = [];
    const names = Array.isArray(row?.payment_to_subtypes) ? row.payment_to_subtypes : [];
    const ids = Array.isArray(row?.subtype_ids) ? row.subtype_ids : [];

    // align ids & names by index (API guaranteed matching order)
    for (let i = 0; i < Math.max(names.length, ids.length); i++) {
      const name = names[i] ?? "";
      const id = ids[i] ?? null;
      subs.push({ id: id !== null ? String(id) : null, name });
    }

    setEditSubtypesObjs(subs);
    setDeletedSubtypeIds([]);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingRow(null);
    setEditPaymentToType("");
    setEditSubtypesObjs([]);
    setDeletedSubtypeIds([]);
  };

  const changeSubtypeName = (index, value) => {
    const arr = [...editSubtypesObjs];
    arr[index] = { ...arr[index], name: value };
    setEditSubtypesObjs(arr);
  };

  const addSubtype = () => {
    setEditSubtypesObjs((s) => [...s, { id: null, name: "" }]);
  };

  const removeSubtype = (index) => {
    const arr = [...editSubtypesObjs];
    const removed = arr.splice(index, 1)[0];
    setEditSubtypesObjs(arr);

    // if removed had an id, track it for deletion
    if (removed && removed.id) {
      setDeletedSubtypeIds((d) => [...d, removed.id]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editPaymentToType) {
      errorToast("Payment To Type cannot be empty");
      return;
    }

    // Build payload:
    // subtypes: [{ id: '2'|'3'|null, name: 'EB BILL' }, ...]
    // deleted_subtype_ids: ['5','7'] if any removed existing ones
    const postdata = {
      payment_to_type: editPaymentToType,
      original_payment_to_type: editingRow?.payment_to_type, // helpful if type was editable
      subtypes: editSubtypesObjs.map((s) => ({ id: s.id, name: s.name })),
      deleted_subtype_ids: deletedSubtypeIds,
      modified_by: UserDetails.USERID,
    };

    showLoader();
    try {
      const resp = await apiPostMethod(
        apiBaseUrl + "RecurringPaymentController/Updatepaymenttotype",
        postdata
      );
      const { data } = resp;
      if (data?.success === 1) {
        ShowToast("Updated successfully");
        closeEditModal();
        loadTableData();
      } else {
        errorToast(data?.ErrorMsg || "Unable to update record");
      }
    } catch (err) {
      console.error(err);
      errorToast("Error while updating record");
    } finally {
      hideLoader();
    }
  };
  const form = useFormik({
    initialValues: {
      paymentToType: "",
      noOfSubtypes: 0,
      subtypes: [],
    },
    onSubmit(values) {
      handleSubmit(values);
    },
  });

  const adjustSubtypes = (count) => {
    const current = Array.isArray(form.values.subtypes) ? [...form.values.subtypes] : [];
    const desired = parseInt(count, 10) || 0;

    if (desired < 0) return;

    if (current.length < desired) {
      while (current.length < desired) current.push("");
    } else if (current.length > desired) {
      current.length = desired;
    }

    form.setFieldValue("subtypes", current);
    form.setFieldValue("noOfSubtypes", desired);
  };

  const handleNoOfSubtypesChange = (e) => {
    let num = e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
    if (num > 10) {
      num = 10;
      errorToast("You can only add up to 10 subtypes");
    }
    adjustSubtypes(num);
  };

  const handleSubtypeChange = (index, value) => {
    const arr = [...form.values.subtypes];
    arr[index] = value;
    form.setFieldValue("subtypes", arr);
  };

  const handleSubmit = async (values) => {
    if (!values.paymentToType) {
      errorToast("Please enter Payment To Type");
      return;
    }

    const postdata = {
      paymentToType: values.paymentToType,
      noOfSubtypes: values.noOfSubtypes,
      subtypes: values.subtypes,
      created_by: UserDetails.USERID,
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "RecurringPaymentController/Insertpaymenttotype", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success === 1) {
          ShowToast("Saved Successfully...");
          loadTableData();
          form.resetForm();
        } else {
          errorToast(data.error || "Unable to Insert record");
        }
      })
      .finally(hideLoader);
  };
  const handleDeactivate = (row) => {
  // Build the payload you'll send if user confirms
  const postData = {
    payment_to_type: row.payment_to_type,
    subtype_ids: Array.isArray(row.subtype_ids) ? row.subtype_ids : [],
    modified_by: UserDetails.USERID,
  };

  confirmDialog({
    title: `Deactivate "${row.payment_to_type}"?`,
    description: "Are you sure you want to deactivate this payment type?",
  }).then((res) => {
    if (!res) return; // user cancelled

    showLoader(); // start loader only after confirmation
    apiPostMethod(apiBaseUrl + "RecurringPaymentController/Deactivatepaymenttotype", postData)
      .then((response) => {
        const data = response.data;
        if (data && data.success === 1) {
          // show a green success confirm dialog like your MIRO example
          confirmDialog({
            title: `<h5><strong class="text-white"> ${data.message || "Deactivated successfully"}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: `#51A351`,
          }).then(() => {
            // refresh table and any other cleanup
            loadTableData();
          });
        } else {
          errorToast(data?.ErrorMsg || data?.message || "Unable to deactivate record");
        }
      })
      .catch((err) => {
        console.error("Deactivate error:", err);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader(); // hide loader after API completes
      });
  });
};


  // actions column to render Edit / Deactivate buttons (keeps your Button.Ripple style)
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "120px",
    cell: (row) => (
      <>
        <Button.Ripple color="primary" onClick={() => openEditModal(row)}>
          EDIT
        </Button.Ripple>
        &nbsp;
        <Button.Ripple color="danger" onClick={() => handleDeactivate(row)}>
          DEACTIVATE
        </Button.Ripple>
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Type Master</CardTitle>
        </CardHeader>
        <CardBody>
          <Fragment>
            <Row>
              <Col sm="4" md="4">
                <CustomTextInput
                  label="Payment To Type"
                  form={form}
                  id="paymentToType"
                  name="paymentToType"
                  type="text"
                />
              </Col>

              <Col sm="4" md="4">
                <FormGroup>
                  <label>No. of Subtypes</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    className="form-control"
                    value={form.values.noOfSubtypes}
                    onChange={handleNoOfSubtypesChange}
                    onBlur={() => adjustSubtypes(form.values.noOfSubtypes)}
                  />
                </FormGroup>
              </Col>

              {Array.from({ length: form.values.noOfSubtypes || 0 }).map((_, idx) => (
                <Col sm="4" md="4" key={`subtype-${idx}`}>
                  <CustomTextInput
                    label={`Subtype ${idx + 1}`}
                    form={form}
                    id={`subtypes.${idx}`}
                    name={`subtypes.${idx}`}
                    type="text"
                    value={form.values.subtypes?.[idx] || ""}
                    onChange={(e) => handleSubtypeChange(idx, e.target.value)}
                  />
                </Col>
              ))}
            </Row>

            <FormGroup className="d-flex justify-content-end">
              <Button.Ripple color="primary" type="button" onClick={form.handleSubmit}>
                Submit
              </Button.Ripple>
            </FormGroup>
          </Fragment>
        </CardBody>
      </Card>

      {/* ----------------- TABLE ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Type List</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent data={tableData} columns={columns} />
        </CardBody>
      </Card>

      {/* ----------------- EDIT MODAL ------------------ */}
      <Modal isOpen={editModalOpen} toggle={closeEditModal} size="lg">
        <ModalHeader toggle={closeEditModal}>Edit Payment Type</ModalHeader>
        <ModalBody>
          <FormGroup>
            <label>Payment To Type</label>
            <Input
              value={editPaymentToType}
              onChange={(e) => setEditPaymentToType(e.target.value)}
              placeholder="Payment To Type"
            />
          </FormGroup>

          <div style={{ marginTop: 12 }}>
            <label>Subtypes</label>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th>Subtype (id)</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {editSubtypesObjs.map((subObj, i) => (
                  <tr key={`edit-sub-${i}`}>
                    <td>{i + 1}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Input
                          value={subObj.name}
                          onChange={(e) => changeSubtypeName(i, e.target.value)}
                          placeholder={`Subtype ${i + 1}`}
                        />
                      </div>
                    </td>
                    <td>
                      <Button size="sm" color="danger" onClick={() => removeSubtype(i)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}

                {editSubtypesObjs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No subtypes yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Button size="sm" color="primary" onClick={addSubtype}>
              + Add Subtype
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSaveEdit}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PaymentTypeMaster;
