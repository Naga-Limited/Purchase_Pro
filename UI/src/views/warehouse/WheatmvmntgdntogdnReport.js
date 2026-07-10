import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, uploadUrl } from "../../urlConstants";
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
     selector: "transcation_unique_no",
     sortable: true,
     minWidth: "160px",
   },
  {
    name: "Valid From",
    selector: "ValidFrom",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Warehouse",
    selector: "WareHouseName",
    sortable: true,
    minWidth: "160px",
  },
  {
    name: "Plant",
    selector: "PLANT_NAME",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Storage Location",
    selector: "StorageLocationName",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Lot No	",
    selector: "LotNumberName",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Wheat Variety	",
    selector: "WheatVarietyName",
    sortable: true,
    minWidth: "260px",
  },
  {
    name: "Division	",
    selector: "Division",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Actual Qty	",
    selector: "ActualStock",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Keyloan DO Qty",
    selector: "KeyLoanDOQty",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Movement Qty	",
    selector: "MovementQty",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Receiving Plant",
    selector: "toPlantName",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Receiving Storage Location	",
    selector: "toStorageLocationName",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "Receiving Lot No",
    selector: "tolotno",
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
      return <Badge color="primary">{row.StatusName}</Badge>;
    },
  },
];

const CWheatmvmntgdntogdnReport = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  let [filter, setFilter] = useState();


  const defaultStartDate = moment().subtract(7, "days").toDate();
  const defaultEndDate = moment().toDate();

  const form = useFormik({
    initialValues: {
      date: { start: defaultStartDate, end: defaultEndDate },
    },
    onSubmit: () => {},
  });

  let { showLoader, hideLoader } = useLoader();
  useEffect(()=>{
    loadTableData(new Date(),new Date())
  },[]);

  const loadTableData = async () => {
    const formData = form.values;
    const fromDate = new Date(moment(formData.date.start).format("YYYY-MM-DD"));
    const toDate = new Date(moment(formData.date.end).format("YYYY-MM-DD"));
    const postdata = {
      fromDate,
      toDate,
      Screen: "REPORT"
    };

    console.log(postdata);
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/getGodowntoGodown", postdata)
      .then((response) => {
        const { data } = response;
        //console.log(data, "returndata")
        if (data.results && data.results.length > 0) {
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
          <CardTitle>Wheat Movement Godown to Godown Report</CardTitle>
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

export default CWheatmvmntgdntogdnReport;
