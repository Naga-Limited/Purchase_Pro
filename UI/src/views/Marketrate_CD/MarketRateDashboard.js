import React, { useState } from "react";
import {
  Card, CardHeader, CardTitle, CardBody,
  Button, FormGroup, Col, Row
} from "reactstrap";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import moment from "moment";
import { DatePicker } from "../forms/custom-datetime";
import TableComponent from "../common/TableComponent";

const taColumns = [
  {
    name: "Entry Date",
    selector: row => row.month ? row.month : row.entry_date,
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Entred By",
    selector: "created_by_name",
    sortable: true,
    minWidth: "250px",
  },
  {
    name: "Groceries Name",
    selector: "groceries_name",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Groceries Rate",
    selector: row => row.avg_rate ? row.avg_rate : row.groceries_rate,
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Referance Link",
    selector: "groceries_ref_link",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "State",
    selector: "state_name",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "District",
    selector: "district_name",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "City",
    selector: "city_name",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Market Location",
    selector: "market_place",
    sortable: true,
    minWidth: "100px",
  },
];

const CMarketRateDashboard = () => {
  const [tableData, setTableData] = useState([]);
  const [dependentOptions, setDependentOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => state?.auth?.userData || {});

  const isVendor = UserDetails.role == 'Vendor';

  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      Groceriesid: null,
      subCategoryId: null,
      stateId: null,
      districtId: null,
      date: { start: null, end: null }
    },
    validationSchema: Yup.object().shape({
      Groceriesid: Yup.object().nullable().required("Required"),
    }),
    onSubmit: () => { },
  });

  const fetchDependentOptions = async (groceriesId) => {
    try {
      const res = await apiPostMethod(
        `${apiBaseUrl}MarketRateCD/MrtRateController/getSubGroceriesById`,
        { groceries_id: groceriesId, user_id: UserDetails.USERID, role: UserDetails.role }
      );
      setDependentOptions(res?.data?.results || []);
    } catch (err) {
      errorToast("Failed to load sub category list");
      setDependentOptions([]);
    }
  };

  const fetchDistricts = async (stateId) => {
    try {
      const res = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${stateId}`);
      setDistrictOptions(res?.data?.results || []);
    } catch (err) {
      errorToast("Failed to load districts");
      setDistrictOptions([]);
    }
  };

  const handleFilter = async () => {
    const formData = form.values;
    const fromDate = moment(formData.date.start).format("YYYY-MM-DD");
    const toDate = moment(formData.date.end).format("YYYY-MM-DD");
    const postdata = {
      fromDate,
      toDate,
      subCategoryId: formData.subCategoryId?.label,
      stateId: formData.stateId?.value,
      districtId: formData.districtId?.value,
      user_id: UserDetails.USERID, role: UserDetails.role
    };

    showLoader();
    try {
      const response = await apiPostMethod(
        `${apiBaseUrl}MarketRateCD/MrtRateController/getlistofsubcatogry`,
        postdata
      );

      if (Array.isArray(response?.data?.results) && response.data.results.length > 0) {
        setTableData(response.data.results);
      } else {
        setTableData([]);
        errorToast("No data found");
      }
    } catch {
      setTableData([]);
      errorToast("Something went wrong, please try again later.");
    } finally {
      hideLoader();
    }
  };

  const isMonthlyAvg = tableData?.length > 0 && tableData[0]?.month && tableData[0]?.avg_rate;
  const columns = [...taColumns];

  const chartData = isMonthlyAvg
    ? tableData.map(item => ({
      date: item.month,
      value: Number(item.avg_rate),
    }))
    : tableData.map(item => ({
      date: moment(item.entry_date, "DD/MM/YYYY").format("DD-MM-YYYY"),
      value: Number(item.groceries_rate),
    }));

  return (
    <div>
      <Card style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
        <CardHeader>
          <CardTitle>Market-Rate-Report</CardTitle>
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
              <CustomDropdownInput
                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getGroceriesCategory/${UserDetails.USERID}/${UserDetails.role}`}
                label="Groceries Category"
                id="GroceriesType"
                name="GroceriesType"
                form={form}
                onChange={(selected) => {
                  form.setFieldValue("GroceriesType", selected);
                  if (selected?.value) {
                    fetchDependentOptions(selected.value);
                  }
                }}
              />
            </Col>

            {dependentOptions.length > 0 && (
              <Col md="4" sm="12">
                <FormGroup>
                  <CustomDropdownInput
                    label="Select Sub Category"
                    name="subCategoryId"
                    id="subCategoryId"
                    form={form}
                    options={dependentOptions}
                  />
                </FormGroup>
              </Col>
            )}
          </Row>
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                  label="Select State"
                  id="stateId"
                  name="stateId"
                  form={form}
                  onChange={(selectedOption) => {
                    form.setFieldValue("stateId", selectedOption);
                    form.setFieldValue("districtId", null);
                    if (selectedOption?.value) {
                      fetchDistricts(selectedOption.value);
                    }
                  }}
                />
              </FormGroup>
            </Col>

            {districtOptions.length > 0 && (
              <Col md="4" sm="12">
                <FormGroup>
                  <CustomDropdownInput
                    label="Select District"
                    id="districtId"
                    name="districtId"
                    form={form}
                    options={districtOptions}
                  />
                </FormGroup>
              </Col>
            )}
            <Col md="12" sm="12">
              <br />
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple
                  color="primary"
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
          {/* Chart is hidden for Vendor role */}
          {!isVendor && Array.isArray(chartData) && chartData.length > 0 && form.values.subCategoryId && (
            <div style={{ height: "300px", backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1e90ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Rate"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#1e90ff"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: "#ff6347", stroke: "#fff", strokeWidth: 2 }}
                    dot={{ r: 4, fill: "#1e90ff", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <br />
          <br />
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

export default CMarketRateDashboard;