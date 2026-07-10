import React, { useState, Fragment, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Row,
  Col,
  Button,
  FormGroup,
  Card,
  CardHeader,
  CardTitle,
  CardBody
} from 'reactstrap';
import { CustomTextInput, CustomDropdownInput } from '../forms/custom-form';
import { apiPostMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from '../../helper/appHelper';
import { useLoader } from "../../utility/hooks/useLoader";
import { CardComponent } from '../common/CardComponent';
import { apiBaseUrl } from '../../urlConstants';
import { useSelector } from 'react-redux';
import TableComponent from '../common/TableComponent';
import { DatePicker } from '../forms/custom-datetime';
import moment from 'moment';

const taColumns = [
  {
    name: "Loading Date",
    selector: "loading_dates",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Expected Date of Arrival",
    selector: "edadates",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "FNR Number",
    selector: "fnr_number",
    sortable: true,
    minWidth: "100px",
  },
 {
    name: "PO Number",
    selector: "po_number",
    sortable: true,
    minWidth: "120px",
  },{
    name: "RR Number",
    selector: "rr_number",
    sortable: true,
    minWidth: "100px",
  },{
    name: "Rake Type",
    selector: "vehicleTypeName",
    sortable: true,
    minWidth: "100px",
  },{
    name: "Loading Location",
    selector: "loading_location",
    sortable: true,
    minWidth: "100px",
  },{
    name: "Loading State",
    selector: "state_name",
    sortable: true,
    minWidth: "100px",
  },{
    name: "Unloading Location",
    selector: "unloadinglocation",
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Recivied Date",
    selector: "received_date",
    sortable: true,
    minWidth: "120px",
  },
];

const LoadingDetailsForm = () => {
  const { showLoader, hideLoader } = useLoader();
  const [rows, setRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [defaultDateRange, setDefaultDateRange] = useState({
    start: moment().toDate(),
    end: moment().toDate()
  });

  const form = useFormik({
    initialValues: {
      loadingDate: '',
      rrNumber: '',
      fnrNumber: '',
      expectedArrivalDate: '',
      vehicleType: '',
      loadingLocation: '',
      loadingState: '',
      unloadingLocation: '',
      date: defaultDateRange 
    },
    validationSchema: Yup.object({
      loadingDate: Yup.string().required('Loading Date is required'),
      rrNumber: Yup.string().required('RR Number is required'),
      fnrNumber: Yup.string().required('FNR Number is required'),
      expectedArrivalDate: Yup.string().required('Expected Date of Arrival is required'),
      loadingLocation: Yup.string().required('Loading Location is required'),
    })
  });
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const handleSubmitButtonClick = () => {

    // Validation for all required fields
    const formData = form.values;

    const postData = {
      loadingDate: formData.loadingDate,
      rrNumber: formData.rrNumber,
      ponumber: formData.ponumber,
      fnrNumber: formData.fnrNumber,
      expectedArrivalDate: formData.expectedArrivalDate,
      vehicleType: formData.vehicleType.value,
      loadingLocation: formData.loadingLocation,
      loadingState: formData.loadingState.value,
      unloadingLocation: formData.unloadingLocation.value,
      created_by: UserDetails.USERID,
    };

    console.log(postData, "submitted data");
    if (postData.loadingDate == "" || postData.loadingDate == undefined) {
      errorToast('Please Select Loading date')
      return false
    } else if (postData.rrNumber == "" || postData.rrNumber == undefined) {
      errorToast('Please Enter RR Number')
      return false
    } else if (postData.ponumber == "" || postData.ponumber == undefined) {
      errorToast('Please Enter PO Number')
      return false
    } else if (postData.fnrNumber == "" || postData.fnrNumber == undefined) {
      errorToast('Please Enter FNR Number')
      return false
    } else if (postData.expectedArrivalDate == "" || postData.expectedArrivalDate == undefined) {
      errorToast('Please Select Expected Arrival Date ')
      return false
    } else if (postData.vehicleType == "" || postData.vehicleType == undefined) {
      errorToast('Please Select  Rake Type')
      return false
    } else if (postData.loadingLocation == "" || postData.loadingLocation == undefined) {
      errorToast('Please Enter the Loading Location')
      return false
    } else if (postData.loadingState == "" || postData.loadingState == undefined) {
      errorToast('Please Select Laoding State')
      return false
    } else if (postData.unloadingLocation == "" || postData.unloadingLocation == undefined) {
      errorToast('Please Select UnLaoding Location')
      return false
    }
    showLoader();
    apiPostMethod(`${apiBaseUrl}/RekeloadingentryController/submitLoadingDetails`, postData)
      .then((response) => {
        const { data } = response;
        console.log(data);
        if (data.success == true) {
          ShowToast("Details submitted successfully");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (data.success == 0) {
          errorToast(data.error)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong. Please try again later.");
        console.error(error);
      })
      .finally(() => hideLoader());
  };
  const handleFilter = () => {
    loadTableData();
  };

  useEffect(() => {
    loadTableData();
  }, []); 

  const loadTableData = async () => {
    console.log("load table data")
    const formData = form.values;
    const fromDate = moment(formData.date.start).format("YYYY-MM-DD");
    const toDate = moment(formData.date.end).format("YYYY-MM-DD");
    const postdata = {
      fromDate,
      toDate,
    };

    showLoader();
    try {
      const response = await apiPostMethod(apiBaseUrl + "RekeloadingentryController/getrakeentrydetails", postdata);
      const { data } = response;

      if (data.success) {
        if (data.results.length === 0) {
          // errorToast("No Rake Entry found");
          setTableData([]);
        } else {
          setTableData(data.results);
        } // Assuming 'results' contains the array of payment details
      } else {
        errorToast("Failed to retrive Rake Entry details");
      }
    } catch (error) {
      errorToast("Something went wrong, please try again after some time");
    } finally {
      hideLoader();
    }
  };

  const handleReject = (row) => {
    
    console.log("Rejected entry:", row);
  
    // Example: Show a confirmation modal
    // if (window.confirm(`Are you sure you want to reject entry with ID ${row.id}?`)) {
      showLoader();
      const postData = {
        id: row.id, // Unique ID of the entry to reject
        updated_by: UserDetails.USERID,
      };
  
      apiPostMethod(`${apiBaseUrl}/RekeloadingentryController/rejectEntry`, postData)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            ShowToast("Entry rejected successfully");
            setTimeout(() => {
              window.location.reload();
            }, 2000); 
          } else {
            errorToast("Failed to reject the entry");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong. Please try again later.");
          console.error(error);
        })
        .finally(() => hideLoader());
    // }
  };
  
  const handleReceived = (row) => {
    
      showLoader();
      const postData = {
        id: row.id, // Unique ID of the entry to reject
        updated_by: UserDetails.USERID,
      };
  
      apiPostMethod(`${apiBaseUrl}/RekeloadingentryController/recivieddateupdate`, postData)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            ShowToast("Recivie Date Updated Successfully");
            setTimeout(() => {
              window.location.reload();
            }, 2000); 
          } else {
            errorToast("Failed to Updated the entry");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong. Please try again later.");
          console.error(error);
        })
        .finally(() => hideLoader());
    // }
  };

  const actionsCol = {
    name: "Actions",
    selector: "Actions",
    minWidth: "250px",
    cell: (row) => {
      return (
        <>
         
         {row.received_date === null ? (
           <Button.Ripple color="primary" 
          onClick={() => handleReceived(row)} 
          >
            Received
          </Button.Ripple>
          ) : null}&nbsp;
          { row.is_today == 1 ? (
          <Button.Ripple
            color="danger"
            onClick={() => handleReject(row)}
          >
            Reject
          </Button.Ripple>
        ) : null}&nbsp; 
        </>
      );
    },
  };
  
  

  const columns = [...taColumns, actionsCol];

  return (
    <Fragment>
      <CardComponent header="Rake Loading Details Entry">
        <form>
          <Row>
            <Col md="4">
              <CustomTextInput
                label="Loading Date"
                id="loadingDate"
                name="loadingDate"
                type="date"
                form={form}
                max={new Date().toISOString().slice(0, 10)}
              />
            </Col>
            <Col md="4">
              <CustomTextInput
                label="RR Number"
                id="rrNumber"
                name="rrNumber"
                type="text"
                form={form}
              />
            </Col>
            <Col md="4">
              <CustomTextInput
                label="FNR Number"
                id="fnrNumber"
                name="fnrNumber"
                type="text"
                form={form}
              />
            </Col>
          </Row>

          <Row>

          <Col md="4">
              <CustomTextInput
                label="PO Number"
                id="ponumber"
                name="ponumber"
                type="text"
                form={form}
              />
            </Col>
            <Col md="4">
              <CustomTextInput
                label="Expected Date of Arrival"
                id="expectedArrivalDate"
                name="expectedArrivalDate"
                type="date"
                form={form}
                min={new Date().toISOString().split("T")[0]}
              />
            </Col>
            <Col md="4">
              <CustomDropdownInput
                url={`${apiBaseUrl}RekeloadingentryController/getraketypelist`}
                label="Rake Type"
                id="vehicleType"
                name="vehicleType"
                form={form}
              />
            </Col>
            
          </Row>

          <Row>
          <Col md="4">
              <CustomTextInput
                label="Loading Location"
                id="loadingLocation"
                name="loadingLocation"
                type="text"
                form={form}
              />
            </Col>
            <Col md="4">
            
              <CustomDropdownInput
                url={`${apiBaseUrl}RekeloadingentryController/getstatelist`}
                label="Loading State"
                id="loadingState"
                name="loadingState"
                form={form}
              />
            </Col>
            <Col md="4">
            <CustomDropdownInput
                url={`${apiBaseUrl}RekeloadingentryController/getunloadingloclist`}
                label="Unloading Location"
                id="unloadingLocation"
                name="unloadingLocation"
                form={form}
              />
            </Col>
          </Row>

          <Row>
            <Col sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" type="button" onClick={handleSubmitButtonClick}>
                  Submit
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </form>
        <br></br>
        <br></br>
      </CardComponent>
    

<Card>
<CardHeader>
  <CardTitle>Rake Loading Details Report</CardTitle>
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
</Fragment>
  );
};

export default LoadingDetailsForm;
