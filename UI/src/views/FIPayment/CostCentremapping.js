import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { validation, Yup, CustomDropdownInput } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { ShowToast } from "@helpers/appHelper";
import { CardComponent } from "../common/CardComponent";
import { Row, Col, Button } from "reactstrap";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { Trash2, Edit2, X } from "react-feather";

const CostCentreMappingForm = ({ form, onSubmit, plantIds, isEditing, onCancelEdit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="User" form={form} id="USER_ID" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="Reporting Manager" form={form} id="REPORTING_MANAGER" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="Store Reporting" form={form} id="STORE_REPORTING" isMulti />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="Reporting GFA" form={form} id="REPORTING_GFA" isMulti />
        </Col>
      </Row>
      <Row>
        <Col md="6" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}FIPaymentController/GetCostCentreFromSap`}
            label="Cost Centre"
            form={form}
            id="COST_CENTRE"
            isMulti
          />
        </Col>
      </Row>
      {form.values.COST_CENTRE && form.values.COST_CENTRE.length > 0 && (
        <Row>
          <Col sm="12" style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                  {["Cost Centre", "Cost Center Desc", "Profit Centre", "Profit Centre Desc", "Business Area", "House Bank", "House Bank Id"].map((col) => (
                    <th key={col} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: "#495057", borderRight: "1px solid #e9ecef" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.values.COST_CENTRE.map((cc) => (
                  <tr key={cc.value} style={{ borderBottom: "1px solid #f1f2f4" }}>
                    <td style={{ padding: "6px 8px" }}>{cc.value}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.description}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.profit_centre}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.profit_centre_desc}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.business_area}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.house_bank_id}</td>
                    <td style={{ padding: "6px 8px" }}>{cc.house_bank_ac_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      )}
      <Row>
        <Col md="4" sm="12" className="d-flex" style={{ gap: 8 }}>
          <Button.Ripple color="primary" type="button" onClick={() => onSubmit()}>
            {isEditing ? "Update" : "Submit"}
          </Button.Ripple>
          {isEditing && (
            <Button.Ripple color="secondary" type="button" onClick={onCancelEdit}>
              <X size={16} /> Cancel Edit
            </Button.Ripple>
          )}
        </Col>
      </Row>
    </Fragment>
  );
};

// Same buttonless red confirmDialog used for errors throughout the FIPayment
// module (VendorInvoiceSubmit.js, GFAVerification.js, etc.).
const showErrorDialog = (message) => {
  confirmDialog({
    title: `<h5><strong class="text-white">${message || "Something went wrong"}</strong></h5>`,
    cancelButton: false,
    confirmText: false,
    confirmButton: false,
    background: "#f50e0a",
  });
};

const CostCentremapping = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [mappingList, setMappingList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const fetchMappingList = useCallback(() => {
    apiPostMethod(apiBaseUrl + "FIPaymentController/GetCostCentreMappingList", {})
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setMappingList(data.results || []);
        }
      })
      .catch(() => {
        showErrorDialog("Something went wrong, please try again after sometime");
      });
  }, []);

  useEffect(() => {
    fetchMappingList();
  }, [fetchMappingList]);

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      USER_ID: validation.required({ message: "User should not be empty", isObject: true }),
      COST_CENTRE: Yup.array().min(1, "Cost Centre should not be empty"),
    }),
    onSubmit() {},
  });

  const onSubmit = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    const values = form.values;
    // Store Reporting/Reporting GFA are multi-select — stored as a
    // comma-separated id list, same convention as
    // loading_unloading_payment.unload_id. Reporting Manager is single-select.
    const joinMulti = (selected) => (selected && selected.length ? selected.map((o) => o.value).join(",") : null);
    const postData = {
      id: editingId || undefined,
      mapping_group_id: editingGroupId || undefined,
      user_id: values.USER_ID.value,
      reporting_manager_id: values.REPORTING_MANAGER ? values.REPORTING_MANAGER.value : null,
      store_reporting_id: joinMulti(values.STORE_REPORTING),
      reporting_gfa_id: joinMulti(values.REPORTING_GFA),
      // One User + one set of Reporting Manager/Store Reporting/Reporting GFA
      // can span several Cost Centres — each selected option already carries
      // its own code/desc/profit centre/business area/bank info from SAP.
      cost_centres: values.COST_CENTRE.map((cc) => ({
        cost_centre_code: cc.value,
        cost_centre_desc: cc.description,
        profit_centre: cc.profit_centre,
        profit_centre_desc: cc.profit_centre_desc,
        business_area: cc.business_area,
        house_bank_id: cc.house_bank_id,
        house_bank_ac_no: cc.house_bank_ac_no,
      })),
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FIPaymentController/SaveCostCentreMapping", postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast(editingId ? "Updated Successfully..." : "Saved Successfully...");
          form.resetForm();
          setEditingId(null);
          setEditingGroupId(null);
          fetchMappingList();
        } else {
          showErrorDialog(data.message || "Unable to save record");
        }
      })
      .catch(() => {
        showErrorDialog("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  };

  // Splits a comma-separated id list and its matching GROUP_CONCAT'd name
  // list (backend orders both by the same FIND_IN_SET position, so pairing
  // by index lines them up correctly) back into react-select's [{value,
  // label}] shape for the multi-select fields.
  const splitMulti = (idsStr, namesStr) => {
    const ids = (idsStr || "").split(",").map((s) => s.trim()).filter(Boolean);
    const names = (namesStr || "").split(",").map((s) => s.trim());
    return ids.map((id, i) => ({ value: id, label: names[i] || id }));
  };

  // A row can hold several Cost Centres at once when they share one Profit
  // Centre (cost_centre_code/cost_centre_desc become comma lists in that
  // case) — expand it back into one multi-select chip per Cost Centre, each
  // carrying that row's shared Profit Centre/Business Area/Bank info, so
  // re-submitting without touching the chips re-groups back to the same row.
  const expandRow = (r) => {
    const codes = (r.cost_centre_code || "").split(",").map((s) => s.trim()).filter(Boolean);
    const descs = (r.cost_centre_desc || "").split(",").map((s) => s.trim());
    return codes.map((code, i) => ({
      value: code,
      label: code,
      description: descs[i] || "",
      profit_centre: r.profit_centre,
      profit_centre_desc: r.profit_centre_desc,
      business_area: r.business_area,
      house_bank_id: r.house_bank_id,
      house_bank_ac_no: r.house_bank_ac_no,
    }));
  };

  // Prefills the form from a list row so it can be resubmitted as an update
  // (SaveCostCentreMapping updates in place when `id` is present in postData).
  // Every row sharing this one's mapping_group_id is the same role
  // assignment's Cost Centre family — reload all of them into the
  // multi-select (not just the clicked row) so editing shows/extends the
  // whole set, reconstructed into the same shape a fresh SAP pick would have.
  const startEdit = (row) => {
    // The row being edited must stay first — SaveCostCentreMapping groups
    // postData.cost_centres by Profit Centre and writes group[0] onto
    // postData.id, so editing without touching the Cost Centre chips has to
    // stay a true no-op.
    const otherSiblings = mappingList.filter((r) => r.mapping_group_id === row.mapping_group_id && r.id !== row.id);
    const siblings = [row, ...otherSiblings];
    // Reporting Manager is single-select — a legacy row saved before this
    // change could still hold more than one id, so just take the first.
    const reportingManagerOptions = splitMulti(row.reporting_manager_id, row.REPORTING_MANAGER_NAME);
    form.setValues({
      USER_ID: row.user_id ? { value: row.user_id, label: row.USER_NAME } : null,
      REPORTING_MANAGER: reportingManagerOptions[0] || null,
      STORE_REPORTING: splitMulti(row.store_reporting_id, row.STORE_REPORTING_NAME),
      REPORTING_GFA: splitMulti(row.reporting_gfa_id, row.REPORTING_GFA_NAME),
      COST_CENTRE: siblings.flatMap(expandRow),
    });
    setEditingId(row.id);
    setEditingGroupId(row.mapping_group_id);
  };

  const cancelEdit = () => {
    form.resetForm();
    setEditingId(null);
    setEditingGroupId(null);
  };

  const toggleStatus = (id, status) => {
    let title = status === 0 ? "Are you sure to Deactivate?" : "Are you sure to Activate?";
    confirmDialog({ title, description: "Cost Centre Mapping" }).then((confirmed) => {
      if (!confirmed) return;
      apiPostMethod(apiBaseUrl + "FIPaymentController/ToggleCostCentreMappingStatus", { id, status })
        .then((response) => {
          const { data } = response;
          if (data.success) {
            ShowToast("Updated Successfully...");
            fetchMappingList();
          }
        })
        .catch(() => {
          showErrorDialog("Something went wrong, please try again after sometime");
        });
    });
  };

  const deleteMapping = (id) => {
    confirmDialog({ title: "Are you sure you want to delete this mapping?", description: "Cost Centre Mapping" }).then((confirmed) => {
      if (!confirmed) return;
      apiPostMethod(apiBaseUrl + "FIPaymentController/DeleteCostCentreMapping", { id, deleted_by: UserDetails.USERID })
        .then((response) => {
          const { data } = response;
          if (data.success) {
            ShowToast("Deleted Successfully...");
            fetchMappingList();
          }
        })
        .catch(() => {
          showErrorDialog("Something went wrong, please try again after sometime");
        });
    });
  };

  const columns = [
    { name: "User Name", selector: (row) => row.USER_NAME, sortable: true },
    { name: "Reporting Manager", selector: (row) => row.REPORTING_MANAGER_NAME, sortable: true },
    { name: "Store Reporting", selector: (row) => row.STORE_REPORTING_NAME, sortable: true },
    { name: "Reporting GFA", selector: (row) => row.REPORTING_GFA_NAME, sortable: true },
    { name: "Cost Centre", selector: (row) => row.cost_centre_code, sortable: true },
    { name: "Cost Center Desc", selector: (row) => row.cost_centre_desc, sortable: true },
    { name: "Profit Centre", selector: (row) => row.profit_centre, sortable: true },
    { name: "Profit Centre Desc", selector: (row) => row.profit_centre_desc, sortable: true },
    { name: "Business Area", selector: (row) => row.business_area, sortable: true },
    { name: "House Bank ", selector: (row) => row.house_bank_id, sortable: true },
    { name: "House Bank ID", selector: (row) => row.house_bank_ac_no, sortable: true },
    {
      name: "Action",
      minWidth: "170px",
      grow: 0,
      cell: (row) => (
        <div className="d-flex align-items-center flex-nowrap" style={{ gap: 6 }}>
          <Button.Ripple size="sm" color="info" title="Edit" onClick={() => startEdit(row)} style={{ padding: "0.4rem 0.6rem" }}>
            <Edit2 size={14} />
          </Button.Ripple>
          <Button.Ripple
            size="sm"
            color={row.RecStatus == 1 ? "success" : "danger"}
            title={row.RecStatus == 1 ? "Active — click to deactivate" : "Inactive — click to activate"}
            onClick={() => toggleStatus(row.id, row.RecStatus == 1 ? 0 : 1)}
            style={{ padding: "0.4rem 0.6rem", whiteSpace: "nowrap" }}
          >
            {row.RecStatus == 1 ? "Active" : "Inactive"}
          </Button.Ripple>
          <Button.Ripple size="sm" color="danger" title="Delete" onClick={() => deleteMapping(row.id)} style={{ padding: "0.4rem 0.6rem" }}>
            <Trash2 size={14} />
          </Button.Ripple>
        </div>
      ),
    },
  ];

  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header={editingId ? "Cost Centre Mapping - Edit" : "Cost Centre Mapping"}>
        <CostCentreMappingForm
          form={form}
          onSubmit={onSubmit}
          plantIds={UserDetails.plantids}
          isEditing={!!editingId}
          onCancelEdit={cancelEdit}
        />
      </CardComponent>
      <CardComponent header="Cost Centre Mapping - List">
        <TableComponent columns={columns} data={mappingList} />
      </CardComponent>
    </Fragment>
  );
};

export default CostCentremapping;
