import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup } from "reactstrap";
import { useHistory } from "react-router-dom";
import { useLoader } from '../../utility/hooks/useLoader';
import { errorToast, ShowToast } from '../../helper/appHelper';
import TableComponent from "../common/TableComponent";
import { DatePicker } from "../forms/custom-datetime";
import { apiPostMethod } from '../../helper/axiosHelper';
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import { apiBase, apiBaseUrl } from '../../urlConstants';
import Badge from "reactstrap/lib/Badge"
import { useSelector } from "react-redux";


export const taColumns = [
  {
    name: "Unique Number",
    selector: "transcation_unique_no",
    sortable: true,
    minWidth: "160px",
  },
   {
    name: "Employee Name",
    selector: "emp_name",
    sortable: true,
    minWidth: "170px",  
  },
  {
    name: "Mobile Number",
    selector: "emp_mobile_number",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Courier Company",
    selector: "courier_name",
    sortable: true,
    minWidth: "170px",
  },
  {
    name: "bulk Count",
    selector: "bulk_count",
    sortable: true,
    minWidth: "50px",
  },
  {
    name: "Employee Code",
    selector: "empolyee_code",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Division",
    selector: "division",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Department",
    selector: "department",
    sortable: true,
    minWidth: "220px",
  },
   {
    name: "From Preson",
    selector: "courier_from",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Received by",
    selector: "received_person_name",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Receiving Date",
    selector: "entry_date",
    sortable: true,
    minWidth: "130px",
  },
   
   
{
  name: "Status",
  selector: "status",
  sortable: true,
  minWidth: "130px",
  wrap: true,
  cell: (row) => {
    // const statusName = statusIdToName[row.status] || '';
    return <Badge color="primary">{row.status}</Badge>;
  },
},    
];
const Receivereportlist = ({ title, url, actionRendorer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    loadTableData(new Date(), new Date());
  }, []);
  let { showLoader, hideLoader } = useLoader();
 
  const loadTableData = async (fromDate, toDate) => {
    const postdata = {
      fromDate,
      toDate,
      user_plantid:UserDetails.plantids.toString()
    }
  
  apiPostMethod(apiBaseUrl + "CourierMaster/getReceiverdetail", postdata)
        .then((response) => {
          const { data } = response;
          setTableData(data);
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
    const fromDate = values.FromDate;
    const toDate = values.ToDate;
    loadTableData(fromDate, toDate);
  };
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "130px",
    cell: (row) => {
      return (
        <>
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/COURIER_DELIVERY:${row.id}`);
            }}
          >
            {"View"}
          </Button.Ripple>&nbsp;
        </>
      );
    },
  };
  const columns = [...taColumns, //actionsCol
];
  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      FromDate: new Date(),
      ToDate: new Date(),
    },
    validationSchema: Yup.object().shape({}),
    onSubmit(values) {},
  });
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Courier Receive -Report</CardTitle>
        </CardHeader>
        <CardComponent>
          <Row>
            <Col md="3" sm="12">
              <DatePicker label={"From Date"} form={form} id="FromDate" type="date" />
            </Col>
            <Col md="3" sm="12">
              <DatePicker label={"To Date"} form={form} id="ToDate" type="date" />
            </Col>
            <Col md="12" sm="12">
              <br></br>
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" id="add" type="button" onClick={handleFilter}>
                  Filter
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardComponent>
        <CardBody>
          <TableComponent showDownload columns={columns} data={tableData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default Receivereportlist;
