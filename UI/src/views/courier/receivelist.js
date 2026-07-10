import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup } from "reactstrap";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import { useLoader } from '../../utility/hooks/useLoader';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { DatePicker } from "../forms/custom-datetime";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import { apiBase, apiBaseUrl } from '../../urlConstants';
import { useSelector } from "react-redux";

export const taColumns = [
  {
    name: "Unique Number",
    selector: "transcation_unique_no",
    sortable: true,
    minWidth: "130px",
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
    name: "Courier Count",
    selector: "no_of_courier",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Division",
    selector: "division",
    sortable: true,
    minWidth: "130px",
  }, 
];
const Receivelist = ({ title, url, actionRendorer }) => {
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
      user_plantid:UserDetails.plantids.toString(),
    }
  
  apiPostMethod(apiBaseUrl + "CourierMaster/getReceiverdetails", postdata)
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
  // const handleDelete = async (row) => {
  //   try {
  //     const response = await fetch(apiBaseUrl + "CourierMaster/changeStatus", {
  //       method: "POST",
  //       body: JSON.stringify({ id: row.id }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     if (response.ok) { 
  //       const updatedData = tableData.filter(item => item.id !== row.id);
  //       setTableData(updatedData);
  //     } else {
  //       console.error("Error deleting item:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };
  const handleDelete = async (row) => {
    const postdata={
      id: row.id 
    }
   apiPostMethod(apiBaseUrl +"CourierMaster/changeStatus", postdata)
       .then((response) => {
         if (response) { 
           const updatedData = tableData.filter(item => item.id != row.id);
           errorToast("Deleted Successfully")
           setTableData(updatedData);
          
         } else {
           console.error("Error deleting item:", response.statusText);
         }
       }).catch ((error) =>
       {
         errorToast("Something went wrong, please try again after some time");
       })
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
              history.push(`/COURIER_RECEIVElist:${row.id}`);
            }}
          >
            {"Edit"}
          </Button.Ripple>&nbsp; <Button.Ripple
            color="danger"
            onClick={(e) => {
              handleDelete(row);
            }}
          >
            {"Delete"}
          </Button.Ripple>&nbsp;
        </>
      );
    },
  };
  const columns = [...taColumns, actionsCol];
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
          <CardTitle>Courier Receive-Update</CardTitle>
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
          <TableComponent columns={columns} data={tableData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default Receivelist;
