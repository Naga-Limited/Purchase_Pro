// CrecPaymentInfoDEPMGAPPROVE.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Col,
  Row,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { errorToast, ShowToast } from "../../helper/appHelper";
import moment from "moment";
import Uploader from "../Uploader";

const taColumns = [
  { name: "Division", selector: "division", sortable: true, minWidth: "100px" },
  { name: "Department", selector: "department", sortable: true, minWidth: "100px" },
  { name: "Payment Type", selector: "payment_to_type_name", sortable: true, minWidth: "100px" },
  { name: "Payment SubType", selector: "payment_to_subtype_name", sortable: true, minWidth: "100px" },
  { name: "Payment frequency", selector: "payment_frequency_name", sortable: true, minWidth: "100px" },
  {
    name: "Payment times",
    // selector: "no_of_courier",
    cell: (row) => {
      return (
        <>
          <div>{row.payment_rem_count + ' / ' + row.payment_times}</div>
        </>
      );
    },
    sortable: true,
    minWidth: "80px",
  },
  { name: "Plant Code", selector: "plant_code", sortable: true, minWidth: "100px" },
];

const CrecPaymentdetailsentry = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [data, setData] = useState([]); // used for inner table if you need it
  const [tableData, setTableData] = useState([]);
  const [invoicename, setinvoicename] = useState(""); // uploaded filename
  const [ImgData, setImgData] = useState({});
  const [remarks, setRemarks] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const [selectedRow, setSelectedRow] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [defaultDateRange, setDefaultDateRange] = useState({
    start: moment().startOf("month").toDate(),
    end: moment().endOf("month").toDate(),
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  // New state for invoice/amount fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [amount, setAmount] = useState("");
  const [differenceAmount, setDifferenceAmount] = useState("");

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = useFormik({
    isInitialValid: false,
    initialValues: { date: defaultDateRange, tds_code: "", tex: "" },
    validationSchema: Yup.object().shape({ rows: Yup.array().of(Yup.object().shape({})) }),
    onSubmit(values) { },
  });

  useEffect(() => {
    loadTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTableData = async () => {
    const postdata = { user_plantid: UserDetails.plantids ? UserDetails.plantids.toString() : "" };
    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/getrecpaymentrenewaldata", postdata);
      const { data } = response;
      if (data.success) {
        if ((data.results || []).length === 0) {
          errorToast("No payment details found");
          setTableData([]);
        } else setTableData(data.results);
      } else errorToast("Failed to fetch payment details");
    } catch (error) {
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  const handleApprove = (row) => {
    // open view modal and populate fields for this row
    setSelectedRow(row);
    handleViewModalOpen(row);
    setApproveModalOpen(false); // keep approve modal closed, using view modal's Submit
  };

  // Uploader state & handler
  const [attachedFiles, setAttachment] = useState({ invoice_attachment: {} });
  const handleFileChange = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };

  // --- Preview states: URL + mime type ---
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // create/revoke preview whenever the invoice_attachment file changes
  useEffect(() => {
    const file = attachedFiles.invoice_attachment;
    let url;
    if (file && file instanceof File && file.name) {
      url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewType(file.type || null);
    } else {
      setPreviewUrl(null);
      setPreviewType(null);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [attachedFiles.invoice_attachment]);

  // Submit flow: upload file (if present) then call backend with payload
  const handleApproveSubmit = async () => {
    if (!selectedConsignment) {
      errorToast("No item selected");
      return;
    }

    // Basic validations
    if (!invoiceNumber) {
      errorToast("Please enter Invoice Number");
      return;
    }
    if (!invoiceDate) {
      errorToast("Please select Invoice Date");
      return;
    }
    const method = (selectedConsignment?.amount_paid_method || "").toString().toUpperCase();
    // also block when method id === 605? you asked to disable input only — keeping original validation but still allow submit if amount present (unless FIXED)
    if (method !== "FIXED" && (amount === "" || amount === null)) {
      errorToast("Please enter Amount");
      return;
    }

    // Ensure attachment present
    const keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k] && attachedFiles[k].name);
    if (keys.length === 0) {
      errorToast("Please Attach Invoice Copy");
      return;
    }

    showLoader();

    try {
      // Upload file(s) to sapFileShare
      const postdataFile = new FormData();
      postdataFile.append("form_name", "recurringpayment");
      postdataFile.append("ponumber", "invoice_copy");
      postdataFile.append("VA_Number", "001");
      postdataFile.append("SubFolder", "Recurring_payment");
      keys.forEach((key) => postdataFile.append("file[]", attachedFiles[key]));

      const uploadResp = await apiPostMethod(sapFileShare, postdataFile, "File");
      if (!uploadResp || !uploadResp.data || !uploadResp.data.success) {
        errorToast("Invoice upload failed. Please try again.");
        hideLoader();
        return;
      }

      const invoiceCopy = uploadResp.data.files && uploadResp.data.files[0] ? uploadResp.data.files[0].updname : "";
      setinvoicename(invoiceCopy);

      // Build payload (include tds_status)
      const payload = {
        rp_id: selectedConsignment.rp_id,
        payment_rem_count: selectedConsignment.payment_rem_count,
        vendor: selectedConsignment.vendor,
        invoice_number: invoiceNumber,
        invoice_date: moment(invoiceDate).format("YYYY-MM-DD"),
        amount: parseFloat(amount) || 0,
        plant: selectedConsignment.plant_code,
        difference_amount: parseFloat(differenceAmount) || 0,
        Invoice_Copy: invoiceCopy,
        created_by: UserDetails.USERID,
      };

      // Call API
      const response = await apiPostMethod(apiBaseUrl + "RecurringPaymentController/Insertrecpaymentrenewaldata", payload);
      if (response && response.data && response.data.success) {
        ShowToast("Payment Info Submitted Successfully");
        setViewModalOpen(false);
        // refresh table or reload
        setTimeout(() => window.location.reload(), 1200);
      } else {
        errorToast((response.data && (response.data.message || response.data.error)) || "Failed to submit payment info");
      }
    } catch (err) {
      console.error(err);
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  // Update view modal logic to populate invoice/amount fields
  const handleViewModalOpen = (row) => {
    setSelectedConsignment(row || null);
    setData(row?.details || []);

    // populate invoice/amount fields from row if available
    setInvoiceNumber(row?.invoice_number || row?.invoiceNo || "");
    const invDateRaw = row?.invoice_date || row?.invoiceDate || null;
    setInvoiceDate(invDateRaw ? moment(invDateRaw).format("YYYY-MM-DD") : null);

    // Prefer the payable amount if provided (handle both possible spellings)
    const payableFromRow =
      row?.paybale_amount ?? row?.payable_amount ?? row?.amount_paid ?? row?.amount ?? row?.amount_budget ?? "";
    // Ensure it's string (so Input shows it)
    setAmount(payableFromRow !== null && payableFromRow !== undefined ? String(payableFromRow) : "");

    const amtBudget = parseFloat(row?.amount_budget) || 0;
    // numeric amount (use payableFromRow if numeric)
    const numericAmt = parseFloat(payableFromRow) || 0;
    // difference as positive whole number (absolute, rounded)
    const diffWholePositive = String(Math.abs(Math.round(numericAmt - amtBudget)));
    setDifferenceAmount(diffWholePositive);

    // set form dropdown defaults (if present in row)
    form.setFieldValue("tds_code", row?.tds_code || "");
    form.setFieldValue("tex", row?.tex || "");
    setViewModalOpen(true);

    // Clear previous attachment/preview when opening a new row
    setAttachment({ invoice_attachment: {} });
    setPreviewUrl(null);
    setPreviewType(null);
    setinvoicename("");
  };

  // recompute difference whenever amount or selectedConsignment changes
  useEffect(() => {
    const budget = parseFloat(selectedConsignment?.amount_budget) || 0;
    const numericAmount = parseFloat(amount) || 0;
    // positive whole number, no negatives
    setDifferenceAmount(String(Math.abs(Math.round(numericAmount - budget))));
  }, [amount, selectedConsignment]);

  const handleInvoiceDateChange = (e) => {
    setInvoiceDate(e.target.value);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setAmount(val);
    }
  };

  // amount is editable unless method is FIXED OR amount_paid_method_id === 605
  const isAmountEditable = () => {
    const method = (selectedConsignment?.amount_paid_method || "").toString().toUpperCase();
    const methodId = Number(selectedConsignment?.amount_paid_method_id);
    if (methodId == 605) return false;
    return method !== "FIXED";
  };

  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "50px",
    cell: (row) => (
      <>
        <Button.Ripple color="primary" onClick={() => handleViewModalOpen(row)}>
          View
        </Button.Ripple>
        &nbsp;
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Renewal Page</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent showDownload columns={columns} data={tableData} />
        </CardBody>
      </Card>

      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} centered size="xl">
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}> Payment Details</ModalHeader>
        <ModalBody>
          {/* General Info header */}
          <h4 className="text-primary">
            <u>General Info</u>
          </h4>
          <br />

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Unique Transaction ID</Label>
                <Input type="text" value={selectedConsignment?.rp_unique_trans_id || ""} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Division</Label>
                <Input type="text" value={selectedConsignment?.division || ''} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Department</Label>
                <Input type="text" value={selectedConsignment?.department || ''} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Payment Type</Label>
                <Input type="text" value={selectedConsignment?.payment_to_type_name || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Payment Sub Type</Label>
                <Input type="text" value={selectedConsignment?.payment_to_subtype_name || ""} disabled />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Payment Frequency</Label>
                <Input type="text" value={selectedConsignment?.payment_frequency_name || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Amount Method</Label>
                <Input type="text" value={selectedConsignment?.amount_paid_method || selectedConsignment?.amount_paid_method_name || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Plant Code</Label>
                <Input type="text" value={selectedConsignment?.plant_code || ""} disabled />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Amount / Budget</Label>
                <Input type="text" value={selectedConsignment?.amount_budget || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Description</Label>
                <Input type="text" value={selectedConsignment?.description || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Payment Day</Label>
                <Input type="text" value={selectedConsignment?.payment_date || ""} disabled />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Agreement Start</Label>
                <Input type="text" value={selectedConsignment?.agreement_start_date || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Agreement End</Label>
                <Input type="text" value={selectedConsignment?.agreement_end_date || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Created By</Label>
                <Input type="text" value={selectedConsignment?.FIRST_NAME || selectedConsignment?.created_by || ""} disabled />
              </FormGroup>
            </Col>
          </Row>

          {/* Vendor Details header */}
          <h4 className="text-primary mt-3">
            <u>Vendor & GL Details</u>
          </h4>
          <br />
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Vendor</Label>
                <Input type="text" value={selectedConsignment?.vendor || selectedConsignment?.vendor_name || ""} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Vendor Name</Label>
                <Input type="text" value={selectedConsignment?.vendorname || selectedConsignment?.vendorname || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Account Number</Label>
                <Input type="text" value={selectedConsignment?.account_number || selectedConsignment?.BANK_ACCOUNT || selectedConsignment?.BANK_ACC_NO || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Account IFSC Code</Label>
                <Input type="text" value={selectedConsignment?.account_ifsc_code || selectedConsignment?.IFSC_CODE || ""} disabled />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>GL Code</Label>
                <Input type="text" value={selectedConsignment?.gl_code || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Cost Centre</Label>
                <Input type="text" value={selectedConsignment?.cost_centre || ""} disabled />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>Profit Centre</Label>
                <Input type="text" value={selectedConsignment?.profit_centre || ""} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>House Bank</Label>
                <Input type="text" value={selectedConsignment?.house_bank || ""} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>House Bank Id</Label>
                <Input type="text" value={selectedConsignment?.house_bank_id || ""} disabled />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md="4" className="d-flex justify-content-start mb-0">
              <a target="_blank" href={selectedConsignment?.agreement_copy} rel="noreferrer">
                <Button outline color="success" type="button">
                  Agreement Copy
                </Button>
              </a>
            </Col>
            <Col md="4" className="d-flex justify-content-start mb-0">
              <a target="_blank" href={selectedConsignment?.mail_copy} rel="noreferrer">
                <Button outline color="success" type="button">
                  Mail Copy
                </Button>
              </a>
            </Col>
          </Row>

          {/* New Invoice / Amount fields */}
          <h4 className="text-primary mt-3">
            <u>Invoice & Amount</u>
          </h4>
          <br />
          <Row>
            <Col md="3" sm="12">
              <FormGroup>
                <Label>Invoice Number</Label>
                <Input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </FormGroup>
            </Col>

            <Col md="3" sm="12">
              <FormGroup>
                <Label>Invoice Date</Label>
                <Input type="date" value={invoiceDate || ""} onChange={handleInvoiceDateChange} />
              </FormGroup>
            </Col>

            <Col md="3" sm="12">
              <FormGroup>
                <Label>Amount</Label>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={!isAmountEditable()}
                  placeholder={!isAmountEditable() ? "Amount locked for FIXED method / method id 605" : ""}
                />
              </FormGroup>
            </Col>

            <Col md="3" sm="12">
              <FormGroup>
                <Label>Difference Amount</Label>
                <Input type="text" value={differenceAmount} disabled />
              </FormGroup>
            </Col>
          </Row>

          {/* Uploader + Preview */}
          <Row>
            <Col md="4" className="mt-2">
              <br />
              <Uploader
                setAttachment={handleFileChange}
                form={form}
                label={"Invoice Attachment"}
                title="Pdf"
                id={"invoice_attachment"}
              />
            </Col>

            {/* Preview column */}
            <Col md="8" className="mt-2">
              {previewUrl ? (
                <div className="border p-2" style={{ background: "#fff" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Attachment Preview</strong>
                    <div>
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" outline color="primary">Open in new tab</Button>
                      </a>
                      &nbsp;
                      <Button
                        size="sm"
                        outline
                        color="danger"
                        onClick={() => {
                          // clear attachment and preview
                          setAttachment((prev) => ({ ...prev, invoice_attachment: {} }));
                          setPreviewUrl(null);
                          setPreviewType(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Render PDF embed or image */}
                  {previewType && previewType.includes("pdf") ? (
                    <div style={{ height: 400 }}>
                      <iframe
                        title="invoice-preview"
                        src={previewUrl}
                        style={{ width: "100%", height: "100%", border: "none" }}
                      />
                    </div>
                  ) : previewType && previewType.startsWith("image/") ? (
                    <div style={{ textAlign: "center" }}>
                      <img src={previewUrl} alt="attachment" style={{ maxWidth: "100%", maxHeight: 400 }} />
                    </div>
                  ) : (
                    // fallback for other file types: show filename + open link
                    <div>
                      <p className="mb-1">Preview not available for this file type.</p>
                      <a href={previewUrl} target="_blank" rel="noreferrer">Open file</a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted">No attachment selected for preview.</div>
              )}
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md="12" sm="6" className="d-flex justify-content-end">
              <Button.Ripple color="primary" onClick={handleApproveSubmit}>
                Submit
              </Button.Ripple>
              &nbsp;
              <Button color="secondary" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CrecPaymentdetailsentry;
