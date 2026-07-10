import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { Edit, X } from "react-feather";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { useSelector } from "react-redux";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";

export const taColumns = [
  {
    name: "Gate Code",
    selector: "gateCode",
    sortable: true,
    minWidth: "300px",
  },
  {
    name: "Gate Name",
    selector: "gateName",
    sortable: true,
    minWidth: "300px",
  },
  {
    name: "Is Weight",
    selector: "OwnWB",
    sortable: true,
    minWidth: "50px",
    cell: (row) => {
      return (
        <>
          <span className="fs-6">{row.OwnWB == 1 ? "Yes" : "No"}</span>
        </>
      );
    },
  },
];

const MasterGateList = ({ url, actionRendorer, data, getMasterGate }) => {
  const [updateGate, setUpdateGate] = useState(false);
  const closeRemarksModal = () => setUpdateGate(false);

  const [isActiveGateMaster, setIsActiveGateMaster] = useState(false);
  const closeGateCode = () => setIsActiveGateMaster(false);

  const { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector((state) =>
    state && state.auth ? state.auth.userData : {}
  );

  const actionsCol = {
    name: "Actions",
    selector: "status",
    minWidth: "100px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Row>
          &nbsp;&nbsp;
          <Button.Ripple
            color="primary"
            size="sm"
            type="button"
            onClick={() => updateGateMaster(row)}
          >
            <Edit size={16} /> Edit
          </Button.Ripple>
          &nbsp;
          {row.isActive == 1 ? (
            <Button.Ripple
              color="success"
              size="sm"
              type="button"
              onClick={() => activeGateMaster(row)}
            >
              Active
            </Button.Ripple>
          ) : (
            <Button.Ripple
              color="warning"
              size="sm"
              type="button"
              onClick={() => activeGateMaster(row)}
            >
              In Active
            </Button.Ripple>
          )}
        </Row>
      );
    },
  };

  const columns = [...taColumns, actionsCol];

  const [masterGateId, setMasterGateId] = useState("");
  const [gateName, setGateName] = useState("");
  const [owmWB, setOwmWB] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isWB, setIsWB] = useState("");
  const [isMovement, setIsMovement] = useState("");
  const [isType, setIsType] = useState("");
  const [confirmationStatus, setConfirmationStatus] = useState("");

  const updateGateMaster = (row) => {
    console.log(row);
    setUpdateGate(true);
    setIsWB(row.OwnWB);
    setMasterGateId(row.masterGateId);
    setOwmWB(row.OwnWB);
    setGateName(row.gateName);
    setIsMovement(row.isMovement);
    setIsType(row.workingProcess);
    setConfirmationStatus(row.confirmationStatus); // ✅ Added
  };

  const activeGateMaster = (row) => {
    setIsActiveGateMaster(true);
    setIsWB(row.OwnWB);
    setMasterGateId(row.masterGateId);
    setOwmWB(row.OwnWB);
    setGateName(row.gateName);
    setIsActive(row.isActive);
  };

  const onSubmit = () => {
    const FrmData = {
      masterGateId: masterGateId,
      gateName: gateName,
      OwnWB: isWB,
      isMovement: isMovement,
      isActive: isActive == 1 ? 0 : 1,
      userInfoId: UserDetails.USERID,
      workingProcess: isType,
      confirmationStatus: confirmationStatus, // ✅ Added to payload
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "/GatePro/Master/updateMasterGate", FrmData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          ShowToast(data.message);
          setUpdateGate(false);
          setIsActiveGateMaster(false);
          getMasterGate();
        } else if (data.success == false) {
          errorToast(data.message);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        errorToast("Something went wrong, please try again later");
      })
      .finally(hideLoader());
  };

  const options = [
    { value: 1, label: "Yes" },
    { value: 0, label: "No" },
  ];

  const movementOptions = [
    { value: 1, label: "Yes" },
    { value: 0, label: "No" },
  ]; 
  const ConfirmationStatus = [
    { value: 1, label: "Yes" },
    { value: 0, label: "No" },
  ];

  const Type = [
    { value: 0, label: "Old" },
    { value: 1, label: "Manual" },
    { value: 2, label: "OCR" },
  ];


  // ✅ Current value mappings
  const checkWb = [{ value: isWB, label: isWB == 1 ? "Yes" : "No" }];
  const checkType = [
    {
      value: isType,
      label: isType == 0 ? "Old" : isType == 1 ? "Manual" : "OCR",
    },
  ];
  const checkIsMovement = [
    { value: isMovement, label: isMovement == 1 ? "Yes" : "No" },
  ];
    const checkConfirmationStatus = [
        { value: confirmationStatus, label: confirmationStatus == 1 ? "Yes" : "No" },
    ];

  return (
    <div>
      <Card>
        <CardHeader>Master Gate List</CardHeader>
        <hr></hr>
        <CardBody>
          <TableComponent columns={columns} data={data} />
        </CardBody>
      </Card>

      {/* ✅ Update Modal */}
      <Modal show={updateGate} centered>
        <Modal.Header>
          <Row>
            <Col md="12" sm="12">
              <FormGroup style={{ width: 460 }}>
                <Modal.Title>
                  Update Master Gate{" "}
                  <X onClick={closeRemarksModal} style={{ float: "right" }} />
                </Modal.Title>
              </FormGroup>
            </Col>
          </Row>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="12" sm="12">
              <FormGroup>
                <Label>Master Gate</Label>
                <Input
                  type="text"
                  defaultValue={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                />
              </FormGroup>
            </Col>

            <Col md="6" sm="6">
              <Label>Is WB</Label>
              <Select
                value={checkWb}
                options={options}
                onChange={(e) => setIsWB(e.value)}
              />
            </Col>

            <Col md="6" sm="6">
              <Label>Is Movement</Label>
              <Select
                value={checkIsMovement}
                options={movementOptions}
                onChange={(e) => setIsMovement(e.value)}
              />
            </Col>

            <Col md="6" sm="6">
              <Label>Is Type</Label>
              <Select
                value={checkType}
                options={Type}
                onChange={(e) => setIsType(e.value)}
              />
            </Col>

            {/* ✅ New Confirmation Status Dropdown */}
            <Col md="6" sm="6">
              <Label>Confirmation Status</Label>
              <Select
                value={checkConfirmationStatus}
                options={ConfirmationStatus}
                onChange={(e) => setConfirmationStatus(e.value)}
              />
            </Col>

            <Col md="12" sm="12">
              <label>&nbsp;</label>
              <FormGroup className="d-flex justify-content-center mb-0">
                <Button.Ripple color="primary" type="button" onClick={onSubmit}>
                  Update
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* ✅ Active/InActive Modal */}
      <Modal show={isActiveGateMaster} centered size="sm">
        <Modal.Body>
          <Row>
            <Col md="12" sm="12">
              <X onClick={closeGateCode} style={{ float: "right" }} />
            </Col>
            <Col md="1" sm="1"></Col>
            <Col md="10" sm="10">
              <Label>
                <h6>Are You Sure You Want To Change Status?</h6>
              </Label>
            </Col>

            <Col md="4" sm="4"></Col>
            <Col md="4" sm="4">
              {isActive == 1 ? (
                <Button.Ripple color="warning" type="button" onClick={onSubmit}>
                  In Active
                </Button.Ripple>
              ) : (
                <Button.Ripple color="success" type="button" onClick={onSubmit}>
                  Active
                </Button.Ripple>
              )}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MasterGateList;
