import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { validation, Yup, CustomDropdownInput } from "../forms/custom-form";
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

const DepartmentMappingForm = ({ form, onSubmit }) => {
  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getuserinfo`} label="User" form={form} id="USER_ID" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}FIPaymentController/GetEmpDepartments`}
            label="Department"
            form={form}
            id="EMP_DEPARTMENT"
          />
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

const DepartmentMapping = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [mappingList, setMappingList] = useState([]);

  const fetchMappingList = useCallback(() => {
    apiPostMethod(apiBaseUrl + "FIPaymentController/GetDepartmentMappingList", {})
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
      EMP_DEPARTMENT: validation.required({ message: "Department should not be empty", isObject: true }),
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
      emp_department: values.EMP_DEPARTMENT.value,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FIPaymentController/SaveDepartmentMapping", postData)
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
    confirmDialog({ title, description: "Department Mapping" }).then(() => {
      apiPostMethod(apiBaseUrl + "FIPaymentController/ToggleDepartmentMappingStatus", { id, status })
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
    confirmDialog({ title: "Are you sure you want to delete this mapping?", description: "Department Mapping" }).then(() => {
      apiPostMethod(apiBaseUrl + "FIPaymentController/DeleteDepartmentMapping", { id, deleted_by: UserDetails.USERID })
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
    { name: "Department", selector: (row) => row.emp_department, sortable: true },
    {
      name: "Action",
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
      <CardComponent header="Department Mapping">
        <DepartmentMappingForm form={form} onSubmit={onSubmit} />
      </CardComponent>
      <CardComponent header="Department Mapping - List">
        <TableComponent columns={columns} data={mappingList} />
      </CardComponent>
    </Fragment>
  );
};

export default DepartmentMapping;
