import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import Uploader from "../Uploader";

const taColumns = [
  {
    name: "Unique Number",
    selector: "courier_payment_no",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Vendor Name",
    selector: "vendor_name",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Total Amount",
    selector: "total_value",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Invoice Amount",
    selector: "invoice_value",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Clubbed Rowcount",
    selector: "total_row_count",
    sortable: true,
    minWidth: "80px",
  },
];
export const taColumnsforview = [
  {
    name: "Unique Number",
    selector: "dr_unique_no",
    sortable: true,
    minWidth: "170px",
  },
  {
    name: "Employee Name",
    selector: "emp_name",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Mobile Number",
    selector: "emp_mobile_number",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Consignment Number",
    selector: "consignment_number",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Courier Weight",
    selector: "courier_weight",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Courier Amount",
    selector: "courier_amount",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "CGST Amount",
    selector: "cgst",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "SGST Amount",
    selector: "sgst",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Courier Amount with GST",
    selector: "courier_amount_with_gst",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Sending Date",
    selector: "sending_date",
    sortable: true,
    minWidth: "80px",
  },
];

const ConsignmentPaymentInitiate = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectedRow, setRejectedRow] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const [selectedRow, setSelectedRow] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [defaultDateRange, setDefaultDateRange] = useState({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  const UserDetails = useSelector((state) => state && state.auth ? state.auth.userData : {});

  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      date: defaultDateRange // Set initial values for date range picker
    },
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(Yup.object().shape({})),
    }),
    onSubmit(values) { },
  });

  useEffect(() => {
    // Load data when component mounts
    loadTableData();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const loadTableData = async () => {
    const formData = form.values;
    console.log(formData,'formdata')
    const fromDate = moment(formData.date.start).format("YYYY-MM-DD");
    const toDate = moment(formData.date.end).format("YYYY-MM-DD");
    const postdata = {
      fromDate,
      toDate,
      user_plantid: UserDetails.plantids.toString(),
    };

    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "CourierMaster/getpaymentdetails", postdata);
      const { data } = response;

      if (data.success) {
        if (data.results.length === 0) {
          errorToast("No payment details found");
          setTableData([]);
        } else {
          setTableData(data.results);
        } // Assuming 'results' contains the array of payment details
      } else {
        errorToast("Failed to fetch payment details");
      }
    } catch (error) {
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  const handleFilter = () => {
    loadTableData();
  };

  const handleViewModalOpen = async (row) => {
    const clubbedRowIdsString = JSON.parse(row.clubbed_row_ids).join(",");
    let fdata = {
      id: clubbedRowIdsString,
    };
    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "CourierMaster/getSenderpaymentDetailsById", fdata);
      const { data } = response;
      if (data.success) {
        setData(data.results);
        setSelectedConsignment(row); // Set the selected consignment row
        setViewModalOpen(true); // Open the view modal
      } else {
        errorToast("Failed to fetch consignment details");
      }
    } catch (error) {
      errorToast("Something went wrong, please try again after sometime");
    } finally {
      hideLoader();
    }
  };

  const handleApprove = (row) => {
    setSelectedRow(row);
    setApproveModalOpen(true);
  };

  const handleReject = (row) => {
    setRejectedRow(row);
    setRejectModalOpen(true);
  };

  const handleApproveConfirmation = async (row) => {
    const postdata = {
      id: row.payment_id,
      role: UserDetails.role,
      remarks: remarks,
      approved_by: UserDetails.USERID,
    };

    if (!postdata.remarks) {
      errorToast("Please Enter Remarks");
      return;
    }

    showLoader();

    try {
      const response = await apiPostMethod(apiBaseUrl + "CourierMaster/approveCourierItem", postdata);
      const { data } = response;

      if (data.success) {
        ShowToast("Courier item approved successfully");
        setApproveModalOpen(false);
        setViewModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        errorToast("Failed to approve courier item");
      }
    } catch (error) {
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  const handleRejectConfirmation = async (row) => {
    const postdata = {
      id: row.payment_id,
      selectedrows_id: row.clubbed_row_ids,
      role: UserDetails.role,
      remarks: remarks
    };

    if (!postdata.remarks) {
      errorToast("Please Enter Remarks");
      return;
    }

    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "CourierMaster/rejectCourierItem", postdata);
      const { data } = response;

      if (data.success) {
        ShowToast("Courier item rejected successfully");
        setRejectModalOpen(false);
        setViewModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        errorToast("Failed to reject courier item");
      }
    } catch (error) {
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "50px",
    cell: (row) => (
      <>
        <Button.Ripple
          color="primary"
          onClick={(e) => {
            handleViewModalOpen(row);
          }}
        >
          {"View"}
        </Button.Ripple>&nbsp;
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];
  const columnsforview = [...taColumnsforview];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Approval</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md="4" sm="12">
              <DatePicker
                form={form}
                id="date"
                isDateRange
                label={"Date Range"}
              />
            </Col>
            <Col md="12" sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple
                  color="primary"
                  id="add"
                  type="button"
                  onClick={handleFilter}
                >
                  Filter
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
          <br />
          <TableComponent
            showDownload
            columns={columns}
            data={tableData}
          />
        </CardBody>
      </Card>
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} centered size='xl' >
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>View Courier Details</ModalHeader>
        <ModalBody>
        <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="courierName">Vendor Name:</Label>
                <Input type="text" id="courierName" value={selectedConsignment?.vendor_name || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="courierPaymentNo">Courier Payment No:</Label>
                <Input type="text" id="courierPaymentNo" value={selectedConsignment?.courier_payment_no || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="totalRowCount">Total Row Count:</Label>
                <Input type="text" id="totalRowCount" value={selectedConsignment?.total_row_count || ''} disabled />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="totalValue">Total Value:</Label>
                <Input type="text" id="totalValue" value={selectedConsignment?.total_value || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="invoiceValue">Invoice Value:</Label>
                <Input type="text" id="invoiceValue" value={selectedConsignment?.invoice_value || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="invoiceNumber">Invoice Number:</Label>
                <Input type="text" id="invoiceNumber" value={selectedConsignment?.invoice_number || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label for="invoiceNumber">Invoice DATE:</Label>
                <Input type="text" id="invoiceNumber" value={selectedConsignment?.invoice_date || ''} disabled />
              </FormGroup>
            </Col>
            </Row>
            <Row>
            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={selectedConsignment?.invoice_attachment}>
                                        <Button outline color="success" type="button">
                                            Invoice Copy
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col>
           
          </Row>
          
          <TableComponent
            showDownload
            columns={columnsforview}
            data={data}
          />
          <Row>
          <Col md="2" sm="12">
          <FormGroup className="d-flex mb-0 justify-content-start">
            <Button.Ripple
              color="danger"
              onClick={() => handleReject(selectedConsignment)}
            >
              Reject
            </Button.Ripple>
          </FormGroup>
          </Col>
          <Col md="10" sm="12">
          <FormGroup className="d-flex mb-0 justify-content-end">
            <Button.Ripple
              color="primary"
              onClick={() => handleApprove(selectedConsignment)}
            >
              Approve
            </Button.Ripple>
            <Button color="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>
         
          </FormGroup>
          </Col>
          
          </Row>

        </ModalBody>
        
         
      
      </Modal>
      <Modal isOpen={approveModalOpen} toggle={() => setApproveModalOpen(!approveModalOpen)} className="modal-dialog-centered">
        <ModalHeader toggle={() => setApproveModalOpen(!approveModalOpen)}>Approve Courier Item</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="remarks">Remarks:</Label>
            <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleApproveConfirmation(selectedRow)}>Confirm Approve</Button>
          <Button color="secondary" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={rejectModalOpen} toggle={() => setRejectModalOpen(!rejectModalOpen)} className="modal-dialog-centered">
        <ModalHeader toggle={() => setRejectModalOpen(!rejectModalOpen)}>Rejection Remarks</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="remarks">Remarks:</Label>
            <Input type="text" name="remarks" id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => handleRejectConfirmation(rejectedRow)}>Confirm Reject</Button>
          <Button color="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ConsignmentPaymentInitiate;
