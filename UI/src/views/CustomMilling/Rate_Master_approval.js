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
  Badge 
} from "reactstrap";

import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { CheckSquare, Layers, List } from "react-feather";

const styles = {
  cardHeader: {
    background: "#7367f0",
    color: "#ffffff",
    borderRadius: "0.375rem 0.375rem 0 0",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    
  },
  cardTitle: {
    color: "#ffffff",
    marginBottom: 0,
  },
  subHeader: {
    background: "#e8f1fb",
    color: "#1b4f8c",
    fontWeight: 600,
    padding: "0.6rem 1rem",
    borderRadius: "0.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    borderLeft: "4px solid #1b4f8c",
  },
};

/* ================= TABLE COLUMNS ================= */
const columnsData = [
  { name: "Valid From Date", selector: "vaild_from", sortable: true },
  { name: "Valid To Date", selector: "vaild_to", sortable: true },
  { name: "Purchase ORG", selector: "definitionsName", sortable: true },
  { name: "Material Code", selector: "material_code", sortable: true },
  { name: "Material Description", selector: "material_description", sortable: true },
  { name: "Segment", selector: "segment", sortable: true },
  {
  name: "Status",
  selector: "statusName",
  cell: row => (
    <Badge
      color={
        row.status == 2 ? "success": row.status == 1 ? "primary": row.status == 0 ? "danger": "secondary"
      }
    >
      {row.statusName}
    </Badge>
  )
}

];

const CRateMasterApproval = () => {

  const [tableData, setTableData] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  const { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector(
    (state) => (state?.auth ? state.auth.userData : {})
  );

  const isApprover =
    UserDetails.role === "Approver" || UserDetails.role === "Admin";

  /* ================= LOAD TABLE ================= */
  useEffect(() => {
    reloadTable();
  }, []);

  const reloadTable = async () => {
    showLoader();
    try {
      const res = await apiPostMethod(
        apiBaseUrl + "CustomMillingMasterController/getratemasterdetailsList"
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

  /* ================= VIEW ================= */
  const handleView = (row) => {
    setViewData(JSON.parse(JSON.stringify(row))); // deep copy
    setViewModal(true);
  };

  /* ================= UPDATE RATE ================= */
  const handleRateChange = (index, value) => {

    const updatedDetails = [...viewData.details];
    updatedDetails[index].rate = value;

    setViewData({
      ...viewData,
      details: updatedDetails
    });
  };

  /* ================= APPROVE ================= */
  const handleApprove = () => {

    confirmDialog({
      title: "Approve this Rate Master?",
      description: "Are you sure you want to approve?"
    }).then(async (result) => {

      if (!result) return;

      showLoader();

      try {
        const response = await apiPostMethod(
          apiBaseUrl + "CustomMillingMasterController/ApproveRateMaster",
          {
            id: viewData.rm_id,
            status:viewData.status,
            valid_to: viewData.vaild_to,
            details: viewData.details,
            approved_by: UserDetails.USERID
          }
        );

        if (response?.data?.success) {
          ShowToast("Approved Successfully");
          setViewModal(false);
          reloadTable();
        } else {
          errorToast(response?.data?.error || "Approval failed");
        }

      } catch {
        errorToast("Error while approving");
      } finally {
        hideLoader();
      }
    });
  };

  /* ================= REJECT ================= */
  const handleReject = () => {

    confirmDialog({
      title: "Reject this Rate Master?",
      description: "Are you sure you want to reject?"
    }).then(async (result) => {

      if (!result) return;

      showLoader();

      try {
        const response = await apiPostMethod(
          apiBaseUrl + "CustomMillingMasterController/RejectRateMaster",
          {
            id: viewData.rm_id,
            rejected_by: UserDetails.USERID
          }
        );

        if (response?.data?.success) {
          ShowToast("Rejected Successfully");
          setViewModal(false);
          reloadTable();
        } else {
          errorToast(response?.data?.error || "Reject failed");
        }

      } catch {
        errorToast("Error while rejecting");
      } finally {
        hideLoader();
      }
    });
  };

  /* ================= TABLE ACTIONS ================= */
  const columns = [
    ...columnsData,
    {
      name: "Actions",
      cell: (row) => (
        <Button
          size="sm"
          color="info"
          onClick={() => handleView(row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>

      {/* ================= TABLE ================= */}
      <div style={styles.cardHeader}>
              <CheckSquare size={35} style={{paddingLeft: "0.7rem"}}/>
              <h2 style={{ ...styles.cardTitle, fontSize: "1.35rem" ,paddingBottom: "0.7rem" ,paddingTop: "0.7rem"}}>Custom Milling Rate Approval List</h2>
          </div>
      <Card>
        {/* <CardHeader style={styles.cardHeader}>
         
        </CardHeader> */}
         
        <CardBody>
           
          {/* <br /> */}
          <TableComponent columns={columns} data={tableData} />
        </CardBody>
      </Card>

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={viewModal}
        toggle={() => setViewModal(false)}
        size="xl"
      >
        <ModalHeader toggle={() => setViewModal(false)}>
          Rate Master Details
        </ModalHeader>

        <ModalBody>

          {viewData && (
            <>

              <Row>

                <Col md="4">
                  <Label>Valid From</Label>
                  <Input value={viewData.vaild_from} disabled />
                </Col>

                <Col md="4">
                  <Label>Valid To</Label>
                  <Input
                    type="date"
                    value={viewData.vaild_to}
                    disabled={!isApprover}
                    onChange={(e) =>
                      setViewData({
                        ...viewData,
                        vaild_to: e.target.value
                      })
                    }
                  />
                </Col>

                <Col md="4">
                  <Label>Purchase ORG</Label>
                  <Input value={viewData.definitionsName} disabled />
                </Col>

                {/* <Col md="4">
                  <Label>Material Code</Label>
                  <Input value={viewData.material_code} disabled />
                </Col>

                <Col md="4">
                  <Label>Material Description</Label>
                  <Input value={viewData.material_description} disabled />
                </Col> */}

                <Col md="4">
                  <Label>Segment</Label>
                  <Input value={viewData.segment} disabled />
                </Col>

              </Row>

              <hr />

              {viewData.details?.filter(item => item.condition_type_code === "MATE").length > 0 && (
                <>
                  <div style={styles.subHeader}>
                    <Layers size={16} />
                    <span>Material Rate Details</span>
                  </div>

                  <table className="table table-bordered">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="bg-primary">Material Code</th>
                        <th className="bg-primary">Material Description</th>
                        <th  className="bg-primary">Condition Code</th>
                        <th className="bg-primary">Description</th>
                        <th className="bg-primary">Rate (TON)</th>
                      </tr>
                    </thead>

                    <tbody>
                      {viewData.details.map((item, index) => (
                        item.condition_type_code === "MATE" && (
                          <tr key={index}>
                            <td>{viewData.material_code}</td>
                            <td>{viewData.material_description}</td>
                            <td>{item.condition_type_code}</td>
                            <td>{item.condition_description}</td>

                            <td>
                              <Input
                                type="number"
                                value={item.rate}
                                disabled={!isApprover || viewData.status == 2 || viewData.status == 0}
                                onChange={(e) =>
                                  handleRateChange(index, e.target.value)
                                }
                              />
                            </td>

                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {viewData.details?.filter(item => item.condition_type_code !== "MATE").length > 0 && (
                <>
                  {/* <h5>Condition Details</h5> */}
                  <div style={styles.subHeader}>
                    <List size={16} />
                    <span>Condition Details</span>
                  </div>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th className="bg-primary text-white">Condition Code</th>
                        <th className="bg-primary text-white">Description</th>
                        <th className="bg-primary text-white">Rate (TON)</th>
                      </tr>
                    </thead>

                    <tbody>
                      {viewData.details.map((item, index) => (
                        item.condition_type_code !== "MATE" && (
                          <tr key={index}>
                            <td>{item.condition_type_code}</td>
                            <td>{item.condition_description}</td>

                            <td>
                              <Input
                                type="number"
                                value={item.rate}
                                disabled={!isApprover || viewData.status == 2 || viewData.status == 0}
                                onChange={(e) =>
                                  handleRateChange(index, e.target.value)
                                }
                              />
                            </td>

                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <hr />

              {/* BUTTON ALIGNMENT */}
              {isApprover && viewData.status != 0 && (
                <Row>

                  <Col md="6" className="text-start">
                      {viewData.status == 1 && (
                          <Button
                              color="danger"
                              onClick={handleReject}
                          >
                              Reject
                          </Button>
                      )}
                  </Col>
                  <Col md="6" className="d-flex justify-content-end">
                    <Button
                      color="success"
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                  </Col>

                </Row>
              )}

            </>
          )}

        </ModalBody>

      </Modal>

    </div>
  );
};

export default CRateMasterApproval;
