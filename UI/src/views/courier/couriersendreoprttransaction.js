import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, uploadUrl } from "../../urlConstants";
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
  {
    name: "Created date",
    selector: "created_at",
    sortable: true,
    minWidth: "80px",
  },
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
    minWidth: "120px",
  },
  {
    name: "Courier Company",
    selector: "courier_name",
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
    name: "Courier Weight(kg)",
    selector: "courier_weight",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Destination",
    selector: "destination",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "To Person Name",
    selector: "to_person_name",
    sortable: true,
    minWidth: "80px",
  },

  {
    name: "Status",
    selector: "status",
    sortable: true,
    minWidth: "150px",
    wrap: true,
    cell: (row) => {
      // const statusName = statusIdToName[row.status] || '';
      return <Badge color="primary">{row.status}</Badge>;
    },
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
    };

    console.log(postdata);

    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/getSenderdetailforreport", postdata)
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
   



 

 


  const columns = [...taColumns];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Courier-Transcation-Report</CardTitle>
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
            showDownload
            columns={columns}
            data={tableData}
          />
        </CardBody>
      </Card>
      
    </div>
  );
};

export default Consignmentpaymentintiate;
