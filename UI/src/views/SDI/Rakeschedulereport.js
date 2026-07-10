import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, FormGroup, Col, Row, Label, Input, Badge } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl, BASE_URL } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast } from "../../helper/appHelper";
import moment from "moment";
import { useSelector } from "react-redux";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export const rakeColumns = [
  { name: "S/No", selector: "sl_no", sortable: true, minWidth: "20px" },
  { name: "VA Number", selector: "ZVA_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Po Number", selector: "ZPO_NUMBER", sortable: true, minWidth: "100px" },
  { name: "Supplier Name", selector: "ZSUPPLIER_NAME", sortable: true, minWidth: "150px" },
  { name: "Wheat Variety", selector: "IDNLF", sortable: true, minWidth: "150px" },
  { name: "Loading Location", selector: "ZSUPPLIER_LOAD_POINT", sortable: true, minWidth: "200px" },
  { name: "Unloading (DG / APK)", selector: "PLANT_NAME", sortable: true, minWidth: "100px" },
  { name: "FNR Number", selector: "fnr_no", sortable: true, minWidth: "80px" },
  { name: "RR Number", selector: "VEHICAL_NO", sortable: true, minWidth: "80px" },
  { name: "Loading Date", selector: "ZSUPPLIER_LOAD_DT", sortable: true, minWidth: "80px" },
  { name: "Vehicle Type", selector: "VEHICLE_TYPE", sortable: true, minWidth: "80px" },
  { name: "Arrived Date", selector: "DateAdded", sortable: true, minWidth: "100px" },
];

export const truckContainerColumns = [
  { name: "S/No", selector: "sl_no", sortable: true, minWidth: "20px" },
  { name: "VA Number", selector: "ZVA_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Po Number", selector: "ZPO_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Supplier Name", selector: "ZSUPPLIER_NAME", sortable: true, minWidth: "100px" },
  { name: "Wheat Variety", selector: "IDNLF", sortable: true, minWidth: "120px" },
  { name: "Loading Location", selector: "ZSUPPLIER_LOAD_POINT", sortable: true, minWidth: "80px" },
  { name: "Loading Vendor", selector: "loadingvendor", sortable: true, minWidth: "200px" },
  { name: "Loading Vendor Charge", selector: "LoadingCharge", sortable: true, minWidth: "80px" },
  { name: "Unload Vendor Name", selector: "UnloadVendorName", sortable: true, minWidth: "200px" },
  { name: "Unload Vendor Charge", selector: "UnloadVendorCharge", sortable: true, minWidth: "80px" },
  { name: "Unloading loc", selector: "PLANT_NAME", sortable: true, minWidth: "80px" },
  { name: "Truck No / Container No", selector: "VEHICAL_NO", sortable: true, minWidth: "80px" },
  { name: "Vehicle Type", selector: "VEHICLE_TYPE", sortable: true, minWidth: "80px" },
  { name: "Loading Date", selector: "ZSUPPLIER_LOAD_DT", sortable: true, minWidth: "80px" },
  { name: "Port Receive Date", selector: "CONTAINER_PORT_RECEIVE", sortable: true, minWidth: "80px" },
  { name: "Arrived Date", selector: "DateAdded", sortable: true, minWidth: "80px" },
  { name: "GateInDate&Time", selector: "FormattedGateInDt", sortable: true, minWidth: "200px" },
  { name: "GateIn By", selector: "GateInByName", sortable: true, minWidth: "100px" },
  { name: "FirstWeightDate&Time", selector: "FormattedFirstWeightEntryDt", sortable: true, minWidth: "200px" },
  { name: "FirstWeight By", selector: "FirstWeightEntryByName", sortable: true, minWidth: "100px" },
  { name: "UnloadWHSubmitDate&Time", selector: "FormattedUnloadWHSubmitDt", sortable: true, minWidth: "200px" },
  { name: "UnloadWHSubmit By", selector: "UnloadWHSubmitByName", sortable: true, minWidth: "120px" },
  { name: "SecondWeightDate&Time", selector: "FormattedSecondWeightEntryDt", sortable: true, minWidth: "200px" },
  { name: "SecondWeight By", selector: "SecondWeightEntryByName", sortable: true, minWidth: "100px" },
  { name: "GateOutDate&Time", selector: "FormattedGateOutDt", sortable: true, minWidth: "200px" },
  { name: "Gate Out By", selector: "GateOutByName", sortable: true, minWidth: "100px" },
  { name: "MIGOApprovalDate&Time", selector: "FormattedMIGOApprovalDt", sortable: true, minWidth: "200px" },
  { name: "MIGOApproval By", selector: "MIGOApprovalByName", sortable: true, minWidth: "100px" },
  { name: "Bag type1", selector: "bag_type", sortable: true, minWidth: "80px" },
  { name: "Bag type2", selector: "bag_type2", sortable: true, minWidth: "80px" },
  { name: "Bag type3", selector: "bag_type3", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type1", selector: "no_bags", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type2", selector: "no_bags2", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type3", selector: "no_bags3", sortable: true, minWidth: "80px" },
  { name: "FirstWeight", selector: "wb_load_wt", sortable: true, minWidth: "80px" },
  { name: "SecondWeight", selector: "wb_empty_wt", sortable: true, minWidth: "80px" },
  { name: "Net Weight", selector: "wb_net_wt", sortable: true, minWidth: "80px" },
  { name: "Gunny Weight", selector: "gunny_wt", sortable: true, minWidth: "80px" },
  { name: "MIGO Quantity", selector: "gunny_less_wt", sortable: true, minWidth: "80px" },
  {
      name: "Status",
      selector: "status",
      sortable: true,
      minWidth: "200px",
      wrap: true,
      cell: (row) => {
        // const statusName = statusIdToName[row.status] || '';
        return <Badge color="primary">{row.VechicalStatusName }</Badge>;
      },
    },    
];

const CRakesehedulereport = () => {

  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState(rakeColumns);
  const [totalCount, setTotalCount] = useState(0);

  const { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector((state) => state.auth?.userData || {});
  const [userPlant, setUserGate] = useState([]);

  const form = useFormik({
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() { }
  });

  useEffect(() => {
    getUserPlant();
  }, []);

  const getUserPlant = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success) {
          setUserGate(data.results);
        }
      })
      .catch(() => {
        errorToast("Something went wrong");
      });
  };

  const loadTableData = async () => {

    const formData = form.values;

    const fromDate = moment(formData.date?.start).format("YYYY-MM-DD");
    const toDate = moment(formData.date?.end).format("YYYY-MM-DD");

    const postdata = {
      fromDate,
      toDate,
      vehicle_type: formData.vehicle_type?.label,
      plant: formData.masterPlantId?.werks
    };

    if (!postdata.vehicle_type) {
      errorToast("Please Select Vehicle Type");
      return;
    }

    showLoader();

    apiPostMethod(apiBaseUrl + "GatePro/Report/getRakeseheduledetailsforreport", postdata)
      .then((response) => {

        const res = response.data;

        if (res && res.data && res.data.length > 0) {
          setTableData(res.data);
          setTotalCount(res.count);

          updateColumnsBasedOnVehicleType(formData.vehicle_type.value);
        } else {
          setTableData([]);
          setTotalCount(0);
          errorToast("No data found");
        }

      })
      .catch(() => {
        errorToast("Something went wrong");
      })
      .finally(() => {
        hideLoader();
      });
  };

  const updateColumnsBasedOnVehicleType = (vehicleType) => {

    if (vehicleType == "2" || vehicleType == "5") {
      setColumns(rakeColumns);
    } else {
      setColumns(truckContainerColumns);
    }

  };

  const exportToExcel = () => {

    if (!tableData.length) {
      errorToast("No data available for export");
      return;
    }

    // ✅ Calculate Total Tonnage
    const totalTonnage = tableData.reduce((sum, item) => {
      const qty = parseFloat(item.gunny_less_wt || 0);
      return sum + qty;
    }, 0);

    // ✅ Prepare Header Rows (TOP)
    const topRows = [
      { [columns[0].name]: "Total Rows", [columns[1].name]: tableData.length },
      { [columns[0].name]: "Total Tonnage (MIGO Qty)", [columns[1].name]: totalTonnage.toFixed(2) },
      {} // empty row for spacing
    ];

    // ✅ Format table data
    const formattedData = tableData.map((row) => {
      let obj = {};

      columns.forEach((col) => {
        if (col.selector) {
          obj[col.name] = row[col.selector];
        }
      });

      return obj;
    });

    // ✅ Combine TOP + DATA
    const finalData = [...topRows, ...formattedData];

    const worksheet = XLSX.utils.json_to_sheet(finalData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const fileName =
      columns === rakeColumns
        ? "Rake_Schedule_Report.xlsx"
        : "Truck_Container_Report.xlsx";

    saveAs(fileData, fileName);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle> Rake Schedule Report </CardTitle>
        </CardHeader>
        <CardComponent>
          <Row>

            <Col md="4">
              <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
            </Col>

            <Col md="4">
              <CustomDropdownInput
                url={`${apiBaseUrl}MarketData/Master/getModeOfTransport`}
                label={"Select Vehicle Type"}
                form={form}
                id="vehicle_type"
              />
            </Col>

            <Col md="3">
              <CustomDropdownInput
                options={userPlant}
                label={"Plant"}
                form={form}
                id="masterPlantId"
              />
            </Col>

            <Col md="3">
              <Label>Total Count</Label>
              <Input value={totalCount} disabled />
            </Col>

            <Col md="12">
              <FormGroup className="d-flex justify-content-end gap-1">

                <Button color="primary" onClick={loadTableData}>
                  Filter
                </Button>  &nbsp;

                <Button color="success" onClick={exportToExcel}>
                  Export Excel
                </Button>  &nbsp;

              </FormGroup>
            </Col>
          </Row>
        </CardComponent>
        <CardBody>

          <TableComponent
            showDownload={false}
            columns={columns}
            data={tableData}
          />

        </CardBody>
      </Card>
    </div>
  );
};

export default CRakesehedulereport;
