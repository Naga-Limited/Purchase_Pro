import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, Key, X } from "react-feather";
import { useFormik } from "formik";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";

export const taColumns = [
  {
    name: "VA NUMBER",
    selector: "vaNumber",
    sortable: true,
    minWidth: "190px",
  },
  {
    name: "NATURE OF WORK",
    selector: "workNature",
    sortable: true,
    minWidth: "190px",
  },
  {
    name: "DATE",
    selector: "startDate",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "CONTRACTOR NAME",
    selector: "contractorName",
    sortable: true,
    minWidth: "190px",
  },
  {
    name: "PERSON COUNT",
    selector: "noOfPersons",
    sortable: true,
    minWidth: "160px",
  },
  {
    name: "PHONE NO",
    selector: "supervisorPhoneNo",
    sortable: true,
    minWidth: "150px",
  },
];

const ContractorDetails = ({ actionRendorer, data, workPermitId }) => {

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() { },
  });

  const actionsCol = {
    name: "ACTIONS",
    selector: "status",
    minWidth: "180px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Row>&nbsp;&nbsp;
          <Button color="primary" size="sm" type="button" onClick={() => onActionClick(row, 1)}> Gate In</Button>
          <Button color="primary" size="sm" type="button" className='ml-1' onClick={() => onActionClick(row, 0)}> Gate Out</Button>
        </Row>
      );
    },
  };

  const onActionClick = (row, isGateInOrOut) => {
    history.push(`/ContractorGateOut/${workPermitId}/${row.contractorDetailsId}/${isGateInOrOut}`);
  };

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const columns = [...taColumns, actionsCol];

  return (
    <>
      <Card>
        <CardHeader><h5>Contractor List</h5></CardHeader>
        <hr />
        <CardBody>
          <TableComponent columns={columns} data={data} />
        </CardBody>
      </Card>
    </>
  );
};

export default ContractorDetails;

