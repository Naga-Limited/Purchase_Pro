import React, { Fragment, useCallback, useEffect, useState } from "react";
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
import { Trash2 } from "react-feather";

const ExpenseTypeMappingForm = ({ form, onSubmit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="User" form={form} id="USER_ID" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}FIPaymentController/GetExpenseTypes`}
            label="Expense Type"
            form={form}
            id="EXPENSE_TYPE_ID"
          />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}FIPaymentController/GetGLCodeFromSap`}
            label="GL Code"
            form={form}
            id="GL_CODE"
            onChange={(e) => {
              form.setFieldValue("GL_CODE", e);
              form.setFieldValue("GL_DESCRIPTION", e ? e.description : "");
            }}
          />
        </Col>
        <Col md="3" sm="12">
          <CustomTextInput form={form} id="GL_DESCRIPTION" label="GL Description" disabled />
        </Col>
      </Row>
      <Row>
        <Col md="2" sm="12">
          <Button.Ripple color="primary" type="button" onClick={() => onSubmit()}>
            Submit
          </Button.Ripple>
        </Col>
      </Row>
    </Fragment>
  );
};

const Expensetypemapping = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [mappingList, setMappingList] = useState([]);

  const fetchMappingList = useCallback(() => {
    apiPostMethod(apiBaseUrl + "FIPaymentController/GetExpenseTypeMappingList", {})
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
      EXPENSE_TYPE_ID: validation.required({ message: "Expense Type should not be empty", isObject: true }),
      GL_CODE: validation.required({ message: "GL Code should not be empty", isObject: true }),
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
      user_id: values.USER_ID.value,
      expense_type_id: values.EXPENSE_TYPE_ID.value,
      gl_code: values.GL_CODE.value,
      gl_description: values.GL_DESCRIPTION,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FIPaymentController/SaveExpenseTypeMapping", postData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast("Saved Successfully...");
          form.resetForm();
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

  const toggleStatus = (id, status) => {
    let title = status === 0 ? "Are you sure to Deactivate?" : "Are you sure to Activate?";
    confirmDialog({ title, description: "Expense Type Mapping" }).then((confirmed) => {
      if (!confirmed) return;
      apiPostMethod(apiBaseUrl + "FIPaymentController/ToggleExpenseTypeMappingStatus", { id, status })
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
    confirmDialog({ title: "Are you sure you want to delete this mapping?", description: "Expense Type Mapping" }).then((confirmed) => {
      if (!confirmed) return;
      apiPostMethod(apiBaseUrl + "FIPaymentController/DeleteExpenseTypeMapping", { id, deleted_by: UserDetails.USERID })
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
    { name: "User Name", selector: (row) => row.USER_NAME, sortable: true, width: "140px", grow: 0 },
    { name: "Expense Type", selector: (row) => row.EXPENSE_TYPE_NAME, sortable: true, width: "160px", grow: 0 },
    { name: "GL Code", selector: (row) => row.gl_code, sortable: true, width: "110px", grow: 0 },
    { name: "GL Description", selector: (row) => row.gl_description, sortable: true, grow: 3 },
    {
      name: "Action",
      width: "170px",
      grow: 0,
      cell: (row) => (
        <>
          <Button.Ripple
            size="sm"
            color={row.RecStatus == 1 ? "success" : "danger"}
            onClick={() => toggleStatus(row.id, row.RecStatus == 1 ? 0 : 1)}
          >
            {row.RecStatus == 1 ? "Active" : "Deactivate"}
          </Button.Ripple>
          &nbsp;&nbsp;
          <Button.Ripple size="sm" color="danger" onClick={() => deleteMapping(row.id)}>
            <Trash2 size={16} /> Delete
          </Button.Ripple>
        </>
      ),
    },
  ];

  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Expense Type Mapping">
        <ExpenseTypeMappingForm form={form} onSubmit={onSubmit} />
      </CardComponent>
      <CardComponent header="Expense Type Mapping - List">
        <TableComponent columns={columns} data={mappingList} />
      </CardComponent>
    </Fragment>
  );
};

export default Expensetypemapping;
