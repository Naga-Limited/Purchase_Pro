import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, sapFileShare, uploadUrl } from "../../urlConstants";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import DateComponent from '../common/dateComponent';
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { getFromDate, getToDate } from "../common/Utils";
import moment from "moment";
import Uploader from "../Uploader";

export const taColumns = [
  {
    name: "Unique Number",
    selector: "dr_unique_no",
    sortable: true,
    minWidth: "160px",
  },
  {
    name: "Sending date",
    selector: "sending_date",
    sortable: true,
    minWidth: "80px",
  },
  // {
  //   name: "Created date",
  //   selector: "created_at",
  //   sortable: true,
  //   minWidth: "80px",
  // },
  {
    name: "Employee Name",
    selector: "emp_name",
    sortable: true,
    minWidth: "100px",
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
    name: "Courier Amount",
    selector: "courier_amount",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "CGST Amount",
    selector: "cgst_amount",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "SGST Amount",
    selector: "sgst_amount",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Courier Amount with GST",
    selector: "total_amount",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Courier Weight(kg)",
    selector: "courier_weight",
    sortable: true,
    minWidth: "80px",
  },
];

const Consignmentpaymentintiate = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  let [filter, setFilter] = useState();
  const [invoiceNumber, setInvoiceNumber] = useState(''); // New state for invoice number
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoicename, setinvoicename] = useState(''); // New state for invoice date
  const [ImgData, setImgData] = useState({});
  const [sapPostingDate, setSapPostingDate] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10)); // Initialize with today's date

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(Yup.object().shape({})),
    }),
    onSubmit(values) { },
  });

  let { showLoader, hideLoader } = useLoader();
  const formData = form.values;

  const loadTableData = async () => {
    const formData = form.values;
    const fromDate = new Date(moment(formData.date.start).format("YYYY-MM-DD"));
    const toDate = new Date(moment(formData.date.end).format("YYYY-MM-DD"));
    const postdata = {
      fromDate,
      toDate,
      user_plantid: UserDetails.plantids.toString(),
      courier_company_id: formData.courier_company_id?.value,
      user_plant: formData.plantcode?.value,

    };

    console.log(postdata);

    if (
      postdata.courier_company_id == "" ||
      postdata.courier_company_id == undefined
    ) {
      errorToast("Please Select Vendor Name");
      return false;
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/getSenderdetail", postdata)
      .then((response) => {
        const { data } = response;
        if (data && data.length > 0) {
          setTableData(data);
        } else {
          errorToast("No data found");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after some time");
      })
      .finally(() => {
        hideLoader();
      });
  };

  const handleFilter = () => {
    const values = form.values;
    loadTableData();
  };

  const UserDetails = useSelector((state) =>
    state && state.auth ? state.auth.userData : {}
  );
  // console.log(UserDetails);
  const [SelectedList, setSelectedList] = useState();
  const onSelectedRowsChange = (selectedRowState) => {
    for (let i = 0; i <= selectedRowState.selectedRows.length; i++) {
      setSelectedList(selectedRowState.selectedRows);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [modalDetails, setModalDetails] = useState({
    vendorName: '',
    vendorid: '',
    TotalAmount: 0,
    GSTAmount: 0,
    invoiceAmount: 0, // Initialize invoiceAmount to 0
    selectedItem: [], 
    selectedcgst: [], 
    selectedsgst: [], 
    selectedtotalamount: [],
  });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleConfirm = () => {
    const differenceAmount = modalDetails.TotalAmount - modalDetails.invoiceAmount;

    console.log(attachedFiles);

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    console.log(keys);

    const dispaydata = {
      vendorName: modalDetails.vendorName,
      courier_vendor_id: form.values.courier_vendor_id?.value,
      TotalAmount: modalDetails.TotalAmount,
      GSTAmount: modalDetails.GSTAmount,
      total_amount: modalDetails.invoiceAmount,
      difference_amount: differenceAmount.toFixed(2),
      selectedrows_id: modalDetails.selectedItem,
      selectedrows_cgst: modalDetails.selectedcgst,
      selectedrows_sgst: modalDetails.selectedsgst,
      selectedrows_total: modalDetails.selectedtotalamount,
      remarks: remarks,
      created_by: UserDetails.USERID,
      user_plant: formData.plantcode?.value,
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      sapPostingDate: sapPostingDate, 
    };
    console.log(dispaydata);
    // Perform validation checks if needed
    if (dispaydata.total_amount === "" || dispaydata.total_amount === undefined) {
      errorToast("Please Enter the Invoice amount");
      return false;
    } else if (dispaydata.invoiceNumber === "" || dispaydata.invoiceNumber === undefined) {
      errorToast("Please Enter the Invoice Number");
      return false;
    }

    // Check if any file is attached
    if (keys.length > 0) {
      let FileSaveUrl = "";
      let postdata = new FormData();
      let { Invoicecopy } = ImgData;

      postdata.append("form_name", "Courier");
      postdata.append("ponumber", "invoice_copy");
      postdata.append("VA_Number", "001");
      postdata.append("SubFolder", "Courier_Dispatch");

      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });
      postdata.append("ponumber", "invoice_copy");
      showLoader();
      console.log(uploadUrl, postdata);
      apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            const invoiceCopy = data.files[0] ? data.files[0].updname : "";
            setinvoicename(invoiceCopy);
            dispaydata.Invoicecopy = invoiceCopy; // Add invoiceCopy to the payload
            Submit(dispaydata);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime zzzzz");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      errorToast("Please Attach Invoice Copy");
    }

    const Submit = (postdata) => {
      apiPostMethod(apiBaseUrl + "CourierMaster/InsertDispatchpaymentinfo", postdata)
        .then((response) => {
          const { data } = response;
          console.log(response);
          if (data.success === true) {
            ShowToast("Save Successfully...");
            window.setTimeout(function () {
              window.location.reload();
            }, 2000);
          } else if (data.success === false) {
            errorToast(data.error);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => {
          hideLoader();
          toggleModal();
        });
    };
  };

  const handleDifferenceAmount = () => {
    const difference = modalDetails.TotalAmount - modalDetails.invoiceAmount;
    return isNaN(difference) ? 0 : difference;
  };

  const getSelectedRows = (tableData, actionPerform, index) => {
    if (!SelectedList || SelectedList.length === 0) {
      errorToast("Please select a row...");
      return false;
    }

    let selectedItem = [];
    let selectedcgst = [];
    let selectedsgst = [];
    let selectedtotalamount = [];
    let TotalAmount = 0;
    let GSTAmount = 0;
    let vendorName = '';
    let vendorid = '';
    let data = [];

    SelectedList.forEach((item, index) => {
      selectedItem.push(item.dispatch_det_id);
      selectedcgst.push(item.cgst_amount);
      selectedsgst.push(item.sgst_amount);
      selectedtotalamount.push(item.total_amount);
      TotalAmount += Number(item.total_amount);
      GSTAmount += Number(item.courier_amount) * 0.18;

      data.push({
        LINE_ITEM: index + 1,
        Fumigation_Type: item.consignment_number,
        TotalAmount: item.total_amount,
        warehouseid: item.dispatch_det_id,
        VENDOR_ID: item.courier_company_id,
        VENDOR_NAME: item.courier_name,
      });

      if (index === 0) {
        vendorName = item.courier_name;
        vendorid = item.courier_company_id;
      }
    });

    const details = {
      vendorName,
      selectedItem,
      selectedcgst,
      selectedsgst,
      selectedtotalamount,
      vendorid,
      TotalAmount: TotalAmount.toFixed(2),
      GSTAmount: GSTAmount.toFixed(2),
    };

    setModalDetails(details);
    console.log(modalDetails,'modalDetails')
    setRemarks(''); // Reset remarks
    toggleModal();
  };
  const [attachedFiles, setAttachment] = useState({ invoice_attachment: {} });
  const handleFileChange = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };
  const {
    invoice_attachment,
  } = formData;

  const dateRestriction = DateComponent('invoice')
  const calculateMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 5);
    return today.toISOString().split('T')[0]; // Format as yyyy-mm-dd
  };

  const minDate = calculateMinDate();


  const columns = [...taColumns];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardComponent>
          <Row>
            <Col md="4" sm="12">
              <DatePicker
                form={form}
                id="date"
                isDateRange
                label={"Date Range"}
              />
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}CourierMaster/getCourierCompanyid`}
                  label={"Select Vendor"}
                  form={form}
                  id="courier_company_id"
                  name="courier_company_id"
                />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}CourierMaster/getplantcode/${UserDetails.plantids}`}
                  label={"Select Plant"}
                  form={form}
                  id="plantcode"
                  name="plantcode"
                />
              </FormGroup>
            </Col>
            <Col md="12" sm="12">
              <br></br>
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
        </CardComponent>
        <CardBody>
          <TableComponent
            select
            showDownload
            columns={columns}
            data={tableData}
            onSelectedRowsChange={onSelectedRowsChange}
          />
        </CardBody>
        <Row>
          <Col md="3" sm="12">
            <Button.Ripple
              color="primary waves-effect"
              onClick={() => getSelectedRows(tableData, "EDIT", 0)}
            >
              MOVE TO PAYMENT
            </Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
          </Col>
        </Row>
      </Card>
      <Modal
        isOpen={isModalOpen}
        toggle={toggleModal}
        centered size='xl'
      >
        <ModalHeader toggle={toggleModal}>Confirm Details</ModalHeader>
        <ModalBody>
          <Row>
            <Col md="3">
              <FormGroup>
                <Label for="vendorName">Vendor Name</Label>
                <Input
                  type="text"
                  id="vendorName"
                  value={modalDetails?.vendorName}
                  disabled
                />
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label for="selectedEntries">Selected Entries for Payment</Label>
                <Input
                  type="text"
                  id="selectedEntries"
                  value={SelectedList ? SelectedList.length : 0}
                  disabled
                /></FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label for="TotalAmount">Total Amount</Label>
                <Input
                  type="text"
                  id="TotalAmount"
                  value={modalDetails?.TotalAmount}
                  disabled
                />
              </FormGroup>
            </Col>
            <Col md="3" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}CourierMaster/getVENDOR/${UserDetails.plantids}`}
                  label={"Select Vendor"}
                  form={form}
                  id="courier_vendor_id"
                  name="courier_vendor_id"
                />
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label for="GSTAmount"> Gst add amount</Label>
                <Input
                  type="text"
                  id="GSTAmount"
                  value={modalDetails?.GSTAmount}
                  disabled
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="3">
           
                <FormGroup>
                <Label for="invoiceAmount">Invoice Amount</Label>
                <Input
                  type="number"
                  id="invoiceAmount"
                  placeholder="Enter invoice amount"
                  value={modalDetails?.invoiceAmount}
                  onChange={(e) =>
                    setModalDetails({
                      ...modalDetails,
                      invoiceAmount: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md="3">
            <FormGroup>
                <Label for="difference_amount">Difference Amount</Label>
                <Input
                  type="text"
                  id="difference_amount"
                  value={handleDifferenceAmount()}
                  disabled
                />
              </FormGroup>
            </Col>


            <Col md="3">
              <FormGroup>
                <Label for="invoiceNumber">Invoice Number</Label>
                <Input
                  type="text"
                  id="invoiceNumber"
                  placeholder="Enter invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </FormGroup>
            </Col>
           
           
            <Col md="3" >
              <FormGroup>
                <Label for="entryDate">Invoice Date</Label>
                <Input
                  type="date"
                  id="entryDate"
                  name="entryDate"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </FormGroup>
            </Col>
            <Col md="3" >
            <br></br>
              <Uploader
                // isReadOnly={!attachedFiles.invoice_attachment.name}
                // canEdit={!isReadOnly}
                setAttachment={handleFileChange}
                 form={form}
                label={"Invoice Attachment"}
                title="Pdf"
                id={"invoice_attachment"}
                selectedFileName={attachedFiles.invoice_attachment.name}
              />
             
            </Col>
            <Col md="3">
              <FormGroup>
                <Label for="remarks">Remarks</Label>
                <Input
                  type="text"
                  id="remarks"
                  placeholder="Enter remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </FormGroup>
            </Col>
           
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Consignmentpaymentintiate;
