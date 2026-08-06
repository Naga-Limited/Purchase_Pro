import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { validation, Yup, CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
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
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="Store Reporting" form={form} id="STORE_REPORTING" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="Reporting GFA" form={form} id="REPORTING_GFA" />
        </Col>
      </Row>
      <Row>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}FIPaymentController/GetCostCentreFromSap`}
            label="Cost Centre"
            form={form}
            id="COST_CENTRE"
            onChange={(e) => {
              form.setFieldValue("COST_CENTRE", e);
              form.setFieldValue("COST_CENTRE_DESC", e ? e.description : "");
              form.setFieldValue("PROFIT_CENTRE", e ? e.profit_centre : "");
              form.setFieldValue("PROFIT_CENTRE_DESC", e ? e.profit_centre_desc : "");
              form.setFieldValue("BUSINESS_AREA", e ? e.business_area : "");
              form.setFieldValue("HOUSE_BANK", e ? e.house_bank_id : "");
              form.setFieldValue("HOUSE_BANK_ID", e ? e.house_bank_ac_no : "");
            }}
          />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="COST_CENTRE_DESC" label="Cost Center Desc" disabled />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="PROFIT_CENTRE" label="Profit Centre" disabled />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="PROFIT_CENTRE_DESC" label="Profit Centre Desc" disabled />
        </Col>
      </Row>
      <Row>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="BUSINESS_AREA" label="Business Area" disabled />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="HOUSE_BANK" label="House Bank" disabled />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="HOUSE_BANK_ID" label="House Bank Id" disabled />
        </Col>
      </Row>
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

const CostCentremapping = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [mappingList, setMappingList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchMappingList = useCallback(() => {
    apiPostMethod(apiBaseUrl + "FIPaymentController/GetCostCentreMappingList", {})
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setMappingList(data.results || []);
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
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
      COST_CENTRE: validation.required({ message: "Cost Centre should not be empty", isObject: true }),
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
    const postData = {
      id: editingId || undefined,
      user_id: values.USER_ID.value,
      reporting_manager_id: values.REPORTING_MANAGER ? values.REPORTING_MANAGER.value : null,
      store_reporting_id: values.STORE_REPORTING ? values.STORE_REPORTING.value : null,
      reporting_gfa_id: values.REPORTING_GFA ? values.REPORTING_GFA.value : null,
      cost_centre_code: values.COST_CENTRE.value,
      cost_centre_desc: values.COST_CENTRE_DESC,
      profit_centre: values.PROFIT_CENTRE,
      profit_centre_desc: values.PROFIT_CENTRE_DESC,
      business_area: values.BUSINESS_AREA,
      house_bank_id: values.HOUSE_BANK,
      house_bank_ac_no: values.HOUSE_BANK_ID,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FIPaymentController/SaveCostCentreMapping", postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast(editingId ? "Updated Successfully..." : "Saved Successfully...");
          form.resetForm();
          setEditingId(null);
          fetchMappingList();
        } else {
          errorToast(data.ErrorMsg || "Unable to save record");
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  };

  // Prefills the form from a list row so it can be resubmitted as an update
  // (SaveCostCentreMapping updates in place when `id` is present in postData).
  const startEdit = (row) => {
    form.setValues({
      USER_ID: row.user_id ? { value: row.user_id, label: row.USER_NAME } : null,
      REPORTING_MANAGER: row.reporting_manager_id ? { value: row.reporting_manager_id, label: row.REPORTING_MANAGER_NAME } : null,
      STORE_REPORTING: row.store_reporting_id ? { value: row.store_reporting_id, label: row.STORE_REPORTING_NAME } : null,
      REPORTING_GFA: row.reporting_gfa_id ? { value: row.reporting_gfa_id, label: row.REPORTING_GFA_NAME } : null,
      COST_CENTRE: row.cost_centre_code ? { value: row.cost_centre_code, label: row.cost_centre_code } : null,
      COST_CENTRE_DESC: row.cost_centre_desc || "",
      PROFIT_CENTRE: row.profit_centre || "",
      PROFIT_CENTRE_DESC: row.profit_centre_desc || "",
      BUSINESS_AREA: row.business_area || "",
      HOUSE_BANK: row.house_bank_id || "",
      HOUSE_BANK_ID: row.house_bank_ac_no || "",
    });
    setEditingId(row.id);
  };

  const cancelEdit = () => {
    form.resetForm();
    setEditingId(null);
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
          errorToast("Something went wrong, please try again after sometime");
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
          errorToast("Something went wrong, please try again after sometime");
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
