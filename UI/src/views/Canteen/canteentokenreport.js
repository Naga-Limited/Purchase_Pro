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
        name: "S.no",
        selector: "ct_id",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unique Number",
        selector: "ct_unique_number",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Shift",
        selector: "definitionsName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Canteen Token Count",
        selector: "token_count",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Remarks",
        selector: "remarks",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Date",
        selector: "created_at",
        sortable: true,
        minWidth: "100px",
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
    };

    console.log(postdata);

    showLoader();
    apiPostMethod(apiBaseUrl + "Canteentokeencontroller/getcantentokendetailforreport", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success==1) {
          setTableData(data.results);
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
          <CardTitle>Canteen-Token-Report</CardTitle>
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
