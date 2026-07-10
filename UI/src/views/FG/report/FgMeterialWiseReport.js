import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, Row, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, uploadUrl } from "../../../urlConstants";
import TableComponent from "../../common/TableComponent";
import { CardComponent } from "../../common/CardComponent";
import { useLoader } from "../../../utility/hooks/useLoader";
import { CustomDropdownInput, CustomTextInput, Yup } from "../../forms/custom-form";
import { Form, useFormik } from "formik";
import { useSelector } from "react-redux";
import { DatePicker } from "../../forms/custom-datetime";
import moment from "moment";
import Uploader from "../../Uploader";
import { apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";

export const taColumns = [
  {
    name: "VA Number",
    selector: "vaNumber",
    sortable: true,
    minWidth: "160px",
  },
  {
    name: "Vehicle Number",
    selector: "vehicleNo",
    sortable: true,
    minWidth: "140px",
  },
  {
    name: "Material Name",
    selector: "material_description",
    sortable: true,
    minWidth: "180px",
  },
  {
    name: "Material Code",
    selector: "material",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Material QTY",
    selector: "materialQty",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "UOM",
    selector: "materialUOM",
    sortable: true,
    minWidth: "50px",
  },
  {
    name: "Bag Count",
    selector: "bagCount",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Bag Type",
    selector: "bagType",
    sortable: true,
    minWidth: "140px",
  },
  {
    name: "Invoice Number",
    selector: "invoiceNo",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Delivery Number",
    selector: "deliveryNo",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Delivery QTY",
    selector: "deliveryQty",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Created At",
    selector: "formatted_created_at",
    sortable: true,
    minWidth: "120px",
  },

{
    name: "Gate In Date&Time",
    selector: "formatted_gateInDateStamp",
    sortable: true,
    minWidth: "170px",
  },
{
    name: "Gate Out Date&Time",
    selector: "formatted_gateOutDateStamp",
    sortable: true,
    minWidth: "170px",
  },
  {
    name: "Total Duration",
    selector: "duration_time",
    sortable: true,
    minWidth: "170px",
  },

  {
    name: "Material Status",
    selector: "statusname",
    sortable: true,
    minWidth: "100px",
    wrap: true,
    cell: (row) => {
    if(row.status==1)
    {
      return <Badge color="success">{row.statusname}</Badge>;
    }
    else{
      return <Badge color="danger">{row.statusname}</Badge>;
    }
  },
  },   
  {
    name: "Waiting AT",
    selector: "modulestatusname",
    sortable: true,
    minWidth: "100px",
    wrap: true,
    cell: (row) => {
      // const statusName = statusIdToName[row.status] || '';
      return <Badge color="primary">{row.modulestatusname}</Badge>;
    },
  },    
];

const CFgmaterialdetails = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  let [filter, setFilter] = useState();
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
    apiPostMethod(apiBaseUrl + "GatePro/Report/getFgmaterialdetailsforreport", postdata)
      .then((response) => {
        const { data } = response;
        if (data && data.length > 0) {
          setTableData(data);
        } else {
          errorToast("No data found");
          setTableData();
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
          <CardTitle>FG-Material-Wise-Report</CardTitle>
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
                  View
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

export default CFgmaterialdetails;
