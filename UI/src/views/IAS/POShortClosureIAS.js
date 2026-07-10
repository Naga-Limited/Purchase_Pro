import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  Row,
} from 'reactstrap';
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';
import TableComponent from '../common/TableComponent';
import moment from 'moment';
import { DatePicker } from "../forms/custom-datetime";
import confirmDialog from '../../@core/components/confirm/confirmDialog';

// Define table columns
export const taColumns = [
  {
    name: "PO Number",
    selector: "poNumber",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Plant Code",
    selector: "SendingPlant",
    sortable: true,
    minWidth: "150px",
  }
];

const POShortClosureIAS = () => {
  const history = useHistory();
  const { id } = useParams();
  let refid = id ? id.replace(":", "") : '';
  const { showLoader, hideLoader } = useLoader();
  const [data, setData] = useState([]); 
  const [flagstatus, setflagstatus] = useState([]);
  const [lastPayload, setLastPayload] = useState(null); // store last filter payload to refresh after actions

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  const UserDetails = useSelector((state) => state?.auth?.userData || {});

  // Formik setup: initialize date as object with start/end because your DatePicker uses .start/.end
  const form = useFormik({
    initialValues: {
      date: {
        start: currentDate,
        end: currentDate,
      },
      
    },
    onSubmit(values) {
      // not used; we call handleFilter directly
    },
  });

  // Initial load (original behavior: call endpoint without payload)
  useEffect(() => {
    showLoader();
    const plantIds =
    UserDetails?.plantids && UserDetails.plantids.length > 0
      ? UserDetails.plantids
      : 0;
    apiPostMethod(apiBaseUrl + `GatePro/Report/getpolistforclosureIAS/${plantIds}`)
      .then((response) => {
        const { data } = response;
        if (data && data.success) {
          setData(data.results || []);
        } else {
          setData([]);
          if (data && !data.success) errorToast(data.message || "Failed to load data");
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
        setData([]);
      })
      .finally(hideLoader);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter handler - builds postdata using form.values.date.start & .end and calls API
  const handleFilter = () => {
    try {
      const formData = form.values;

      if (!formData.date?.start || !formData.date?.end) {
        errorToast("Please select a valid date range");
        return;
      }

      const fromDate = moment(formData.date.start).format("YYYY-MM-DD");
      const toDate = moment(formData.date.end).format("YYYY-MM-DD");

      const postdata = {
        fromDate,
        toDate,
        created_by: UserDetails.USERID,
        plant_id:UserDetails?.plantids && UserDetails.plantids.length > 0
      ? UserDetails.plantids
      : 0, // send 0 if empty to match backend expectation
      };

      // save payload so action handlers can re-fetch with same filter
      setLastPayload(postdata);

      showLoader();
      apiPostMethod(apiBaseUrl + "GatePro/Report/getpolistforrevertIAS", postdata)
        .then((response) => {
          const { data } = response;
          if (data && data.success) {
            setData(data.results || []);
          } else {
            setData([]);
            errorToast(data?.message || "No records found for selected date range");
          }
        })
        .catch(() => {
          errorToast("Something went wrong, please try again later");
          setData([]);
        })
        .finally(hideLoader);
    } catch (err) {
      errorToast("Invalid date range");
    }
  };

  // Action: Short Close (uses confirmDialog) - uses exact API format you requested
  const handleShortClose = (row) => {
    const msg = `Short Close PO:-${row.poNumber}`;
    confirmDialog({
      title: "Are you sure want to Short Close?",
      description: msg,
    })
      .then((confirmed) => {
        if (!confirmed) return;

        const postdata = {
          Id: row.Id,
          closed_by: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Report/shortclosepoIAS", postdata)
          .then((response) => {
            const { data } = response;
            if ( data.success == true ) {
              ShowToast(data.message || "PO Short Closed successfully");
               setTimeout(() => window.location.reload(), 1200);
            } else {
              errorToast(data?.message || "Failed to Short Close PO");
            }
          })
          .catch(() => {
            errorToast("Something went wrong while Short Closing. Please try again later.");
          })
          .finally(hideLoader);
      })
      .catch(() => {
        // ignore confirmDialog rejection
      });
  };

  // Action: Revert (uses confirmDialog) - uses exact API format you requested
  const handleRevert = (row) => {
    if (!row || !row.Id) {
      errorToast("Invalid row selected");
      return;
    }

    const msg = `Revert PO:-${row.poNumber}`;
    confirmDialog({
      title: "Are you sure want to Revert?",
      description: msg,
    })
      .then((confirmed) => {
        if (!confirmed) return;

        const postdata = {
          Id: row.Id,
          reveted_by: UserDetails.USERID,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Report/revertpoIAS", postdata)
          .then((response) => {
            const { data } = response;
            if ( data.success == true ){
              ShowToast(data.message || "PO Reverted successfully");
               setTimeout(() => window.location.reload(), 1200);
            } else {
              errorToast(data?.message || "Failed to revert PO");
            }
          })
          .catch(() => {
            errorToast("Something went wrong while reverting. Please try again later.");
          })
          .finally(hideLoader);
      })
      .catch(() => {
        // ignore confirmDialog rejection
      });
  };

  // Table columns including ShortClose & Revert buttons
  const actionsCol = {
  name: "Actions",
  selector: "Edit",
  minWidth: "100px",
  cell: (row) => (
    <div className="d-flex">

      {/* Show ShortClose only when flag == 0 */}
      {row.flagStatus == 0 && (
        <Button.Ripple
          color="success"
          size="sm"
          onClick={() => handleShortClose(row)}
          className="me-1"
        >
          ShortClose
        </Button.Ripple>
      )}

      {/* Show Revert only when flag == 1 */}
      {row.flagStatus == 1 && (
        <Button.Ripple
          color="warning"
          size="sm"
          onClick={() => handleRevert(row)}
        >
          Revert
        </Button.Ripple>
      )}

    </div>
  ),
};


  const columns = [...taColumns, actionsCol];

  return (
    <div>
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>PO Short Closure IAS</CardTitle>
        </CardHeader>
        <CardBody>
          <Fragment>
            <Row>
              <Col md="4" sm="12">
                <DatePicker
                  form={form}
                  id="date"
                  isDateRange
                  label={"Date Range"}
                />
              </Col>
            </Row>

            <FormGroup className="d-flex justify-content-end mt-2">
              <Button.Ripple color="primary" type="button" onClick={handleFilter}>
                Filter
              </Button.Ripple>
            </FormGroup>
          </Fragment>
        </CardBody>
      </Card>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>PO Number List</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent
            columns={columns}
            data={data} // Shows filtered or initial data
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default POShortClosureIAS;
