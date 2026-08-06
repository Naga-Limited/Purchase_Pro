import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Badge,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import {
  Circle,
  Edit,
  PieChart,
  Printer,
  Trash2,
  X,
} from "react-feather";
import { Modal } from "react-bootstrap";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import axios from "axios";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { CustomDropdownInput } from "../forms/custom-form";
import Uploader from "../Uploader";

export const taColumns = [
  { name: 'Rake No', selector: 'rakeUniqueNo', sortable: true, minWidth: '100px' },
  { name: 'FNR NO', selector: 'fnrNumber', sortable: true, minWidth: '150px' },
  { name: 'NO OF TRUCKS', selector: 'numberOfTrucks', sortable: true, minWidth: '50px' },
  { name: 'NO OF WAGON', selector: 'noOfWagonReceived', sortable: true, minWidth: '50px' },
  { name: 'RAKE TYPE', selector: 'rakeType', sortable: true, minWidth: '50px' },
  {
    name: 'Status',
    selector: 'statusName',
    sortable: true,
    minWidth: '150px',
    cell: row => (
      <Col sm={12} md={12}>
        <FormGroup className="d-flex justify-content-center mb-0">
          {row.status == 0 ? (
            <Badge color="danger" pill>{row.statusName}</Badge>
          ) : (
            <Badge color="success" pill>{row.statusName}</Badge>
          )}
        </FormGroup>
      </Col>
    )
  }
];

// Expanded columns for full report details
// Add these to fullReportColumns in your main component file
export const fullReportColumns = [
  ...taColumns, // Existing basic columns
  { name: 'RR NO', selector: 'rrNumber', sortable: true, minWidth: '150px' },
  { name: 'Placement Time', selector: 'placementTime', sortable: true, minWidth: '140px' },
  { name: 'Placement Platform', selector: 'placementPlatform', sortable: true, minWidth: '120px' },
  { name: 'Free Time Till', selector: 'freeTimeTill', sortable: true, minWidth: '110px' },
  { name: 'Completion Time', selector: 'completionTime', sortable: true, minWidth: '140px' },
  { name: 'Total DC Hours', selector: 'totalDcHours', sortable: true, minWidth: '110px' },
  { name: 'Total Wharfage', selector: 'totalWharfage', sortable: true, minWidth: '110px' },
  { name: 'Bags Unloaded Platform', selector: 'bagsUnloadPlatForm', sortable: true, minWidth: '150px' },
  { name: 'Remarks', selector: 'remarks', sortable: true, minWidth: '120px' },
  {
    name: 'Tarpaulin Placed',
    selector: 'tarpaulinPlaced',
    sortable: true,
    minWidth: '140px',
    cell: row => (
      <Badge color={row.tarpaulinPlaced === 'YES' ? 'success' : row.tarpaulinPlaced === 'NO' ? 'danger' : 'secondary'}>
        {row.tarpaulinPlaced || 'N/A'}
      </Badge>
    )
  },
  {
    name: 'Tarpaulin Placed Remarks',
    selector: 'tarpaulinPlacedRemarks',
    sortable: true,
    minWidth: '160px',
    cell: row => row.tarpaulinPlacedRemarks || 'N/A'
  },
  {
    name: 'Tarpaulin Covered',
    selector: 'tarpaulinCovered',
    sortable: true,
    minWidth: '130px',
    cell: row => (
      <Badge color={row.tarpaulinCovered === 'YES' ? 'success' : row.tarpaulinCovered === 'NO' ? 'danger' : 'secondary'}>
        {row.tarpaulinCovered || 'N/A'}
      </Badge>
    )
  },
  {
    name: 'Tarpaulin Covered Remarks',
    selector: 'tarpaulinCoveredRemarks',
    sortable: true,
    minWidth: '170px',
    cell: row => row.tarpaulinCoveredRemarks || 'N/A'
  },
  { name: 'No. of Loadman', selector: 'noOfLoadman', sortable: true, minWidth: '110px' },
  { name: 'Arrival Time', selector: 'arrivalTime', sortable: true, minWidth: '120px' },
  { name: 'Loading Start Time', selector: 'loadingStartingTime', sortable: true, minWidth: '140px' },
  { name: 'Spillage Cleaning Ladies', selector: 'spillageCleaningLadies', sortable: true, minWidth: '150px' },
  { name: 'Empty Box Time', selector: 'emptyBoxOpenTime', sortable: true, minWidth: '120px' },
  { name: 'Sweeping Time', selector: 'sweepingTime', sortable: true, minWidth: '110px' },
  { name: 'No. of Spillage Trucks', selector: 'noOfSpillageTrucks', sortable: true, minWidth: '140px' },
  { name: 'Bags Each Wagon', selector: 'bagsInEachWagon', sortable: true, minWidth: '120px' },
  { name: 'Empty Gunny Used', selector: 'noOfEmptyGunnyUsed', sortable: true, minWidth: '120px' },
  { name: 'Surveyor Names', selector: 'surveyorNames', sortable: true, minWidth: '160px' },
  { name: 'Reject Reason', selector: 'rejectReason', sortable: true, minWidth: '120px' },
  { name: 'CreatedAt', selector: 'createdAt', sortable: true, minWidth: '150px' },
  { name: 'Approved1', selector: 'approvedAt1', sortable: true, minWidth: '150px' },
  { name: 'Approved2', selector: 'approvedAt2', sortable: true, minWidth: '150px' },
];

const RakeUnloadingChange = ({ url, actionRendorer, data, getEmployeeDetails ,hide}) => {
  const history = useHistory();
  const UserDetails = useSelector((state) =>
    state && state.auth ? state.auth.userData : {}
  );

  const { showLoader, hideLoader } = useLoader();
  const [show, setShow] = useState(false);
  const closeRemarksModal = () => setShow(false);

  const [errors, setErrors] = useState({});
  const [freeTimeOptions, setFreeTimeOptions] = useState([]);
  const [freeTimeLoading, setFreeTimeLoading] = useState(false);
  const [freeTimeError, setFreeTimeError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      rrNumber: "",
      rakeUniqueNo: "",
      fnrNumber: "",
      placementTime: "",
      placementPlatform: "",
      freeTimeTill: "",
      completionTime: "",
      rakeType: "",
      definitions_list_id: "", // The ID from the API
      noOfWagonReceived: "",
      noOfMissingWagon: "",
      wagonNumber: "",
      totalDcHours: "",
      totalWharfage: "",
      remarks: "",
      tarpaulinPlaced: "",
      tarpaulinCovered: "",
      tarpaulinPlacedRemarks: "",
      tarpaulinCoveredRemarks: "",
      noOfLoadman: "",
      arrivalTime: "",
      loadingStartingTime: "",
      unloadingLocation: "",
      numberOfTrucks: "",
      nagaOwn: "",
      goodshed: "",
      total: "",
      bagsInEachWagon: "",
      spillageCleaningLadies: "",
      noOfSpillageTrucks: "",
      noOfEmptyGunnyUsed: "",
      surveyorNames: "",
      rrCopy: "",
      id: "",
      fnrNumberDetails:"",
      sweepingTime:"",
      emptyBoxOpenTime:"",
      bagsUnloadPlatForm:"",
    //   newRrCopy:""
    },
    onSubmit() {},
  });

  const columns = [
    {
      name: "Actions",
      selector: "",
      minWidth: "250px",
      cell: (row) => {
        return actionRendorer ? (
          actionRendorer(row)
        ) : (
          <Row>&nbsp;&nbsp;
            {row.status == 1 &&
              ((hide == true && (UserDetails.role == "Manager" )) || (UserDetails.role == "Admin")) && (
                <Button.Ripple
                  color="primary"
                  size="sm"
                  type="button"
                  onClick={() => updateEmployeeDetails(row)}
                >
                  <Edit size={16} /> Approval 1
                </Button.Ripple>
              )}
            {row.status == 2 &&
              ((hide == true && (UserDetails.role == "Senior Manager" )) || (UserDetails.role == "Admin")) && (
                <Button.Ripple
                  color="primary"
                  size="sm"
                  type="button"
                  onClick={() => updateEmployeeDetails(row)}
                >
                  <Edit size={16} /> Approval 2
                </Button.Ripple>
              )}
            {row.status == 3 && (
              <Button.Ripple
                color="primary"
                size="sm"
                type="button"
                className="ml-1"
                onClick={() => print(row)}
              >
                <Printer size={16} className="mr-0" /> Print
              </Button.Ripple>
            )}
            {row.status > 0 && (
              <Button.Ripple
                color="primary"
                size="sm"
                type="button"
                className="ml-1"
                onClick={() => Vehicle_Details(row,'LIST')}
              >
                <PieChart size={16} className="mr-0" /> Vehicle List
              </Button.Ripple>
            )}
          </Row>
        );
      },
    },
    {
        name: "RR COPY",
        selector: "rrCopy",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            
            return <Col sm="12" md="12">
                <FormGroup className="d-flex justify-content-start mb-0">
                <a target="_blank" href={row?.rrCopy}>
                    {row?.rrCopy &&
                    <Button outline color="success" type="button">
                        View 
                    </Button>}
                </a>
                </FormGroup>
            </Col>
        },
    },
    ...(hide ? taColumns : fullReportColumns)
  ];

  const print = (row) => {
    window.open(`/public/#/SurveyorPrintForm/${row.id}`); // SERVER
  };

  const Vehicle_Details = async (row, mode) => {
    try {
      const res = await apiPostMethod(
        `${apiBaseUrl}RakeloadingController/RakeVehicleDetails/${row.fnrNumber}`
      );

      const data = res?.data;

      if (!data) {
        errorToast('No vehicle details found.');
        return;
      }

      if (mode === 'LIST') {
        const printWindow = window.open('', '_blank', 'width=794,height=1123,scrollbars=no');
        
        const vehicles = data.results || data.vehicles || data || [];
        const header = `FNR ${row.fnrNumber || ''}`;
        const enterprise = data.enterprise || 'SURVEYOR VEHICLE DETAILS';
        
        let tableRows = '';
        vehicles.forEach((vehicle, index) => {
          const truckNo = vehicle.vehicle_no || '';
          const outTime = vehicle.created_at || '';
          const wheatVariety = vehicle.wheat_variety || '';
          const bagType = vehicle.receive_bag1 || '';
          const bags = vehicle.no_bags1 || vehicle.bags || '';
          const location = vehicle.plant_id || '';
          const vaNumber = vehicle.vaNumber || '';
          const tarpaulin = vehicle.tarpaulinPlaced || 'Y';
          
          tableRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${truckNo}</td>
            <td>${outTime}</td>
            <td>${wheatVariety}</td>
            <td>${bagType}</td>
            <td>${bags}</td>
            <td>${location}</td>
            <td>${vaNumber}</td>
            <td>${tarpaulin}</td>
          </tr>`;
        });

        printWindow.document.write(`
          <html>
            <head>
              <title>Vehicle Details Print - ${row.fnrNumber}</title>
              <style>
                @page {
                  size: A4;
                  margin: 10mm;
                }
                @media print {
                  body { 
                    margin: 0; 
                    font-family: 'Courier New', monospace; 
                    font-size: 10px; 
                    width: 210mm;
                    height: 297mm;
                  }
                  .header { background: #f5f5f5 !important; color: #333 !important; }
                  .print-controls { display: none !important; }
                  table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 5px; 
                    border: 2px solid #000; 
                    font-size: 9px;
                    table-layout: fixed;
                  }
                  th { 
                    border: 2px solid #000; 
                    padding: 6px 2px; 
                    height: 35px;
                    text-align: center; 
                    word-wrap: break-word;
                    background: #d1d5db !important; 
                    color: #1f2937 !important; 
                    font-weight: bold;
                    font-size: 9px;
                  }
                  td { 
                    border: 1px solid #333; 
                    padding: 4px 2px; 
                    height: 32px;
                    text-align: center; 
                    word-wrap: break-word;
                    font-size: 9px;
                  }
                }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 10px; 
                  margin: 10px; 
                  width: 190mm;
                  max-width: 190mm;
                  box-sizing: border-box;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 5px; 
                  border: 2px solid #333;
                  table-layout: fixed;
                }
                th, td {
                  width: 11.1%; /* Exactly 9 equal columns = 100% */
                  border: 1px solid #333; 
                  padding: 4px 2px; 
                  text-align: center; 
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  white-space: normal;
                  vertical-align: middle;
                }
                th { 
                  height: 40px;
                  background: #d1d5db; 
                  color: #1f2937; 
                  font-weight: bold;
                  font-size: 10px;
                }
                td { 
                  height: 35px;
                  font-size: 9.5px;
                }
                tr { min-height: 35px; }
                .header { 
                  background: #f5f5f5; 
                  color: #333; 
                  padding: 12px; 
                  border-radius: 6px 6px 0 0; 
                  margin-bottom: 8px; 
                  border: 2px solid #e5e7eb;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .title { 
                  font-size: 15px; 
                  font-weight: bold; 
                  margin: 2px 0; 
                  word-wrap: break-word;
                  line-height: 1.2;
                }
                .enterprise { 
                  font-size: 11px; 
                  opacity: 0.95; 
                  word-wrap: break-word;
                }
                .print-footer { margin-top: 15px; font-size: 9px; text-align: center; color: #666; }
                .print-controls { text-align: center; margin-bottom: 12px; }
                button { 
                  background: #dc3545; 
                  color: white; 
                  border: none; 
                  padding: 10px 18px; 
                  margin: 0 8px; 
                  border-radius: 5px; 
                  cursor: pointer; 
                  font-size: 13px;
                  font-weight: bold;
                }
                button:hover { background: #c82333; }
                button.print-btn { background: #007bff; }
                button.print-btn:hover { background: #0056b3; }
              </style>
            </head>
            <body onload="setTimeout(() => { 
              window.print(); 
              setTimeout(() => window.close(), 1500); 
            }, 500);">
              <div class="header">
                <div class="title">${header}</div>
                <div class="enterprise">${enterprise}</div>
              </div>
              
              <div class="print-controls">
                <button class="print-btn" onclick="window.print(); setTimeout(() => window.close(), 1000);">🖨️ PRINT</button>
                <button onclick="window.close()">❌ CLOSE</button>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>TRUCK NUMBER</th>
                    <th>OUT TIME</th>
                    <th>WHEAT VARIETY</th>
                    <th>BAG TYPE</th>
                    <th>NO OF BAGS</th>
                    <th>UNLOADING LOCATION</th>
                    <th>VA NUMBER</th>
                    <th>TARPAULIN COVERED Y/N</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows || '<tr><td colspan="9" style="text-align:center; padding:25px; background:#f8f9fa;">No Vehicles Found</td></tr>'}
                </tbody>
              </table>
              
              <div class="print-footer">
                Print Date: ${new Date().toLocaleString()} | Page 1 of 1
              </div>
            </body>
          </html>
        `);
        // printWindow.document.close();
        // return;
      }

      if (mode === 'PDF') {
        const pdfUrl = data.pdfUrl || data.filePath || data.url;
        if (pdfUrl) {
          window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        } else {
          errorToast('PDF not available.');
        }
      }
    } catch (err) {
      console.error(err);
      errorToast('Failed to load vehicle details.');
    }
  };
  const updateEmployeeDetails = (row) => {
    setShow(true);
    
    // Debug log to check types
    console.log("=== SELECTION DEBUG ===");
    console.log("Row definitions_list_id:", row.definitions_list_id, "Type:", typeof row.definitions_list_id);
    console.log("=======================");

    form.setValues({
      rrNumber: row.rrNumber,
      rakeUniqueNo: row.rakeUniqueNo,
      fnrNumber: row.fnrNumber,
      placementTime: row.placementTime,
      placementPlatform: row.placementPlatform,
      freeTimeTill: row.freeTimeTill,
      completionTime: row.completionTime,
      rakeType: row.rakeType,
      // Ensure this matches the type of opt.value (likely Number)
      definitions_list_id: row.definitions_list_id || row.id || "",
      noOfWagonReceived: row.noOfWagonReceived,
      noOfMissingWagon: row.noOfMissingWagon || "",
      wagonNumber: row.wagonNumber || "",
      totalDcHours: row.totalDcHours,
      totalWharfage: row.totalWharfage,
      remarks: row.remarks || "",
      tarpaulinPlaced: row.tarpaulinPlaced,
      tarpaulinCovered: row.tarpaulinCovered,
      tarpaulinPlacedRemarks: row.tarpaulinPlacedRemarks || "",
      tarpaulinCoveredRemarks: row.tarpaulinCoveredRemarks || "",
      noOfLoadman: row.noOfLoadman,
      arrivalTime: row.arrivalTime,
      loadingStartingTime: row.loadingStartingTime,
      unloadingLocation: row.unloadingLocation,
      numberOfTrucks: row.numberOfTrucks,
      nagaOwn: row.nagaOwn,
      goodshed: row.goodshed,
      total: row.total,
      bagsInEachWagon: row.bagsInEachWagon,
      spillageCleaningLadies: row.spillageCleaningLadies,
      noOfSpillageTrucks: row.noOfSpillageTrucks,
      noOfEmptyGunnyUsed: row.noOfEmptyGunnyUsed,
      surveyorNames: row.surveyorNames,
      rrCopy: row.rrCopy,
      id: row.id,
      definitions_list_id : row.definitions_list_id
        ? { value: row.definitions_list_id, label: row.rakeType }
        : null,
      fnrNumberDetails : row.fnrNumber
        ? { value: row.fnrNumber, label: row.fnrNumber }
        : null,
      rejectReason:row.rejectReason,
      sweepingTime:row.sweepingTime,
      emptyBoxOpenTime:row.emptyBoxOpenTime,
      bagsUnloadPlatForm:row.bagsUnloadPlatForm,
      surveyorScreenDate:row.surveyorScreenDate,
      currentStatus:row.status,
    });
  };

  const update = (path, value) => {
    console.log(path,'path')
    console.log(value,'value')
    if (typeof path === "string" && path.includes(".")) {
      const [parent, child] = path.split(".");
      form.setValues((s) => ({
        ...s,
        [parent]: { ...s[parent], [child]: value },
      }));
      return;
    }
    form.setValues((s) => ({ ...s, [path]: value }));
    if (errors[path]) {
      setErrors((e) => ({ ...e, [path]: "" }));
    }
  };

  // Load Free Time options
  useEffect(() => {
    let mounted = true;
    const fetchFreeTimes = async () => {
      setFreeTimeLoading(true);
      setFreeTimeError(null);
      try {
        const res = await apiPostMethod(`${apiBaseUrl}GatePro/Master/getDefinitionsList/31`);

        let raw = [];
        if (res?.data?.results) {
          raw = res.data.results;
        } else if (res?.data?.data) {
          raw = res.data.data;
        } else if (Array.isArray(res.data)) {
          raw = res.data;
        } else if (res.data && typeof res.data === "object") {
          raw = Object.values(res.data).filter((v) => typeof v !== "string");
        }

        if (!mounted) return;

        const normalized = raw.map((item) => {
          if (typeof item === "string") {
            return {
              label: item,
              value: item,
              definition_values: item,
            };
          }

          const label =
            item.label ||
            item.name ||
            item.definition ||
            item.text ||
            item.title ||
            String(item);

          // ✅ CORRECTED: Do NOT wrap in String(). Keep original type (Number if API returns Number)
          const value =
            item.value !== undefined
              ? item.value
              : item.id !== undefined
              ? item.id
              : item.definition_values !== undefined
              ? item.definition_values
              : label;

          const definition_values =
            item.definition_values !== undefined
              ? item.definition_values
              : item.free_time !== undefined
              ? item.free_time
              : item.hours !== undefined
              ? item.hours
              : "0";

          return { label, value, definition_values, original: item };
        });

        console.log("=== FREE TIME OPTIONS (NORMALIZED) ===");
        console.log("Count:", normalized.length);
        if (normalized.length > 0) {
          console.log("First 3:", normalized.slice(0, 3));
          console.log("First option value:", normalized[0].value, "Type:", typeof normalized[0].value);
        }
        console.log("======================================");

        setFreeTimeOptions(normalized);
      } catch (err) {
        if (!mounted) return;
        console.error("Error fetching Free Time options", err);
        setFreeTimeError("Failed to load Rake Type options");
      } finally {
        if (mounted) setFreeTimeLoading(false);
      }
    };

    fetchFreeTimes();
    return () => {
      mounted = false;
    };
  }, []);

  // DC HOURS CALCULATION
  useEffect(() => {
    const f = form.values || {};
    if (f.placementTime && f.completionTime) {
      const start = new Date(f.placementTime);
      const end = new Date(f.completionTime);
      const diffMs = end - start;
      const totalHours = diffMs / (1000 * 60 * 60);
      const freeTime = parseFloat(f.freeTimeTill) || 0;
      const dcHours = totalHours - freeTime;

      let dcTime = "00:00";
      if (dcHours > 0) {
        const hours = Math.floor(dcHours);
        const minutes = Math.round((dcHours - hours) * 60);
        dcTime =
          String(hours).padStart(2, "0") +
          ":" +
          String(minutes).padStart(2, "0");
      }

      form.setValues((prev) => ({
        ...prev,
        totalDcHours: dcTime,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.values?.placementTime,
    form.values?.completionTime,
    form.values?.freeTimeTill,
  ]);

  const validate = () => {
    const newErrors = {};
    const f = form.values || {};

    if (!f.rrNumber?.trim()) newErrors.rrNumber = "RR Number is required.";
    if (!f.rakeUniqueNo?.trim()) newErrors.rakeUniqueNo = "Rake Unique Number is required.";
    if (!f.rakeType) newErrors.rakeType = "Rake Type is required.";
    if (!f.placementTime)
      newErrors.placementTime = "Placement Date & Time is required.";
    if (!f.completionTime)
      newErrors.completionTime = "Completion Date & Time is required.";

    if (f.placementTime && f.completionTime) {
      const start = new Date(f.placementTime);
      const end = new Date(f.completionTime);
      if (end < start) {
        newErrors.completionTime =
          "Completion time must be after placement time.";
      }
    }

    if (!f.noOfWagonReceived) {
      newErrors.noOfWagonReceived = "No. of Wagon Received is required.";
    }

    if (f.noOfMissingWagon) {
      const missing = Number(f.noOfMissingWagon);
      if (!Number.isInteger(missing) || missing < 0) {
        newErrors.noOfMissingWagon = "Must be a non‑negative integer.";
      }
      if (missing > 0 && !f.wagonNumber?.trim()) {
        newErrors.wagonNumber =
          "Missing wagon numbers required when missing count > 0.";
      }
    }

    if (!f.placementPlatform) {
      newErrors.placementPlatform = "Placement Platform is required.";
    } 
    // else {
    //   const n = Number(f.placementPlatform);
    //   if (!Number.isInteger(n) || n < 0 || n > 2) {
    //     newErrors.placementPlatform = "Must be an integer between 0 and 2.";
    //   }
    // }

    if (!f.freeTimeTill && f.rakeType) {
      newErrors.freeTimeTill =
        "Free time not configured for selected Rake Type.";
    }

    // if (f.totalWharfage && isNaN(Number(f.totalWharfage))) {
    //   newErrors.totalWharfage = "Total Wharfage must be a number.";
    // }

    if (!f.tarpaulinPlaced) {
      newErrors.tarpaulinPlaced =
        "Select YES/NO for Tarpaulin Placed.";
    } else if (
      f.tarpaulinPlaced === "NO" &&
      !f.tarpaulinPlacedRemarks?.trim()
    ) {
      newErrors.tarpaulinPlacedRemarks =
        "Remarks required when Tarpaulin Placed is NO.";
    }

    if (!f.tarpaulinCovered) {
      newErrors.tarpaulinCovered =
        "Select YES/NO for Tarpaulin Covered.";
    } else if (
      f.tarpaulinCovered === "NO" &&
      !f.tarpaulinCoveredRemarks?.trim()
    ) {
      newErrors.tarpaulinCoveredRemarks =
        "Remarks required when Tarpaulin Covered is NO.";
    }

    if (!f.noOfLoadman) {
      newErrors.noOfLoadman = "No. of Loadman Present is required.";
    } else {
      const n = Number(f.noOfLoadman);
      if (!Number.isInteger(n) || n < 0) {
        newErrors.noOfLoadman = "Must be a non‑negative integer.";
      }
    }

    if (!f.arrivalTime) {
      newErrors.arrivalTime = "Arrival Date & Time is required.";
    }
    if (!f.sweepingTime) {
      newErrors.sweepingTime = "Sweeping Date & Time is required.";
    }
    if (!f.emptyBoxOpenTime) {
      newErrors.emptyBoxOpenTime = "Empty Box Open Date & Time is required.";
    }
    if (!f.loadingStartingTime) {
      newErrors.loadingStartingTime =
        "Loading Starting Date & Time is required.";
    } else if (f.arrivalTime && f.loadingStartingTime) {
      const arr = new Date(f.arrivalTime);
      const load = new Date(f.loadingStartingTime);
      if (load < arr) {
        newErrors.loadingStartingTime =
          "Loading starting time must be after arrival time.";
      }
    }

    if (f.spillageCleaningLadies && isNaN(Number(f.spillageCleaningLadies))) {
      newErrors.spillageCleaningLadies = "Must be a number.";
    }
    if (f.noOfSpillageTrucks && isNaN(Number(f.noOfSpillageTrucks))) {
      newErrors.noOfSpillageTrucks = "Must be a number.";
    }
    if (f.noOfEmptyGunnyUsed && isNaN(Number(f.noOfEmptyGunnyUsed))) {
      newErrors.noOfEmptyGunnyUsed = "Must be a number.";
    }
    // if (f.bagsInEachWagon && isNaN(Number(f.bagsInEachWagon))) {
    //   newErrors.bagsInEachWagon = "Bags in each wagon must be a number.";
    // }

    if (!f.surveyorNames?.trim()) {
      newErrors.surveyorNames =
        "Surveyor Names & Responsibility is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (newStatus,newRrCopy) => {
    // status: 1 = Approve/Submit, 0 = Reject
    const isValid = validate();
    if (!isValid) {
      errorToast(
        "Form has validation errors. Please correct them before submitting."
      );
      return;
    }
    
    const formData = form.values;
    if(newStatus == 0 && !formData.rejectReason){
        errorToast( "Please Enter Reject Reason.");
      return;
    }
    const FrmData = {
      id: formData.id,
      user_id: UserDetails.USERID,
      rrNumber: formData.rrNumber,
      rakeUniqueNo: formData.rakeUniqueNo,
      fnrNumber: formData.fnrNumber,
      placementTime: formData.placementTime,
      placementPlatform: formData.placementPlatform,
      freeTimeTill: formData.freeTimeTill,
      completionTime: formData.completionTime,
      rakeType: formData.rakeType,
      definitions_list_id: formData.definitions_list_id,
      noOfWagonReceived: formData.noOfWagonReceived,
      noOfMissingWagon: formData.noOfMissingWagon || "0",
      wagonNumber: formData.wagonNumber || "",
      totalDcHours: formData.totalDcHours,
      totalWharfage: formData.totalWharfage,
      remarks: formData.remarks || "",
      tarpaulinPlaced: formData.tarpaulinPlaced,
      tarpaulinCovered: formData.tarpaulinCovered,
      tarpaulinPlacedRemarks: formData.tarpaulinPlacedRemarks || "",
      tarpaulinCoveredRemarks: formData.tarpaulinCoveredRemarks || "",
      noOfLoadman: formData.noOfLoadman,
      arrivalTime: formData.arrivalTime,
      loadingStartingTime: formData.loadingStartingTime,
      unloadingLocation: formData.unloadingLocation,
      numberOfTrucks: formData.numberOfTrucks,
      nagaOwn: formData.nagaOwn,
      goodshed: formData.goodshed,
      total: formData.total,
      bagsInEachWagon: formData.bagsInEachWagon,
      spillageCleaningLadies: formData.spillageCleaningLadies,
      noOfSpillageTrucks: formData.noOfSpillageTrucks,
      noOfEmptyGunnyUsed: formData.noOfEmptyGunnyUsed,
      surveyorNames: formData.surveyorNames,
      rrCopy:newRrCopy || formData.rrCopy,
      status:newStatus,
      rejectReason:formData.rejectReason,
      sweepingTime:formData.sweepingTime,
      emptyBoxOpenTime:formData.emptyBoxOpenTime,
      bagsUnloadPlatForm:formData.bagsUnloadPlatForm,
    };

    showLoader();

    apiPostMethod(
      apiBaseUrl + "RakeloadingController/Rake_Unloading_Surveyor_Update",
      FrmData
    )
      .then((response) => {
        const { data } = response;
        if (data && data.success === true) {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: newStatus > 1 ? "#51A351" : "#f50e0a",
          }).then(() => {
            window.location.reload();
          });
        } else if (data && data.success === false) {
          confirmDialog({
            title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
            cancelButton: false,
            confirmText: false,
            confirmButton: false,
            background: "#f50e0a",
          });
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime.");
      })
      .finally(() => {
        hideLoader();
      });
  };
  const handleRakeTypeChange = (e) => {
  const value = e.target.value;

  const selected = freeTimeOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  console.log("Selected:", selected);

  update("definitions_list_id", value);
  update("rakeType", selected?.label || "");
  update("freeTimeTill", selected?.definition_values || "");
  };
  const FileUploadField = ({ label, oldFile, newKey, editMode, onFileChange }) => {
  const [attachedFile, setAttachedFile] = useState(null);

  const handleFileChange = (file) => {
    setAttachedFile(file);
    onFileChange(newKey, file);
  };
  
  return (
    <Col sm="4" md="4">
      <FormGroup>
        <Label>{label}</Label>
        {/* <br/> */}
        {oldFile && (
          <div className="mb-1">
            <Button
              size="sm"
              color="primary"
              onClick={() => window.open(oldFile, "_blank")}
            >
              View
            </Button>
          </div>
        )}
        {editMode && (
          <Uploader
            title={'ReAttach'}
            setAttachment={handleFileChange}
            id={newKey}
            selectedFileName={attachedFile?.name || ""}
          />
        )}
      </FormGroup>
    </Col>
  );
  };
  const updateField = (field, value) => {
    
    // setSelectedRecord(prev => ({ ...prev, [field]: value }));
     form.setValues((prev) => ({
        ...prev,
        'newRrCopy': value,
      }));
  };
  const saveChanges = async (status) => {
      const filesToUpload = {
        rrCopy: form.values.newRrCopy
      };
      
      const hasFiles = Object.values(filesToUpload).some(file => file !== null);
      console.log(filesToUpload)
      if (hasFiles && filesToUpload.rrCopy) {
        const uploadedPaths = await uploadAttachments(filesToUpload);
        if (uploadedPaths === null) return;
        await onSubmit(status,uploadedPaths.rrCopy);
      } else {
        await onSubmit(status);
      }
    };
     // 1. Upload attachments first
      const uploadAttachments = async (filesObj) => {
        const postData = new FormData();
        postData.append("form_name", "SDI");
        postData.append("SubFolder", "SupplierDispatch");
    
        if (filesObj.rrCopy)        postData.append('file[]', filesObj.rrCopy);
    
        try {
          showLoader();
          const response = await apiPostMethod(sapFileShare, postData, "File");
          const { data } = response;
          
          if (!data.success || !data.files) {
            errorToast(data.message || "Attachment upload failed");
            return null;
          }
    
          const uploadedPaths = {};
          const fileOrder = ['rrCopy'];
          
          data.files.forEach((uploadedFile, index) => {
            const fieldType = fileOrder[index];
            if (filesObj[fieldType]) {
              uploadedPaths[fieldType] = uploadedFile.updname;
            }
          });
    
          return uploadedPaths;
        } catch {
          errorToast("Attachment upload failed");
          return null;
        } finally {
          hideLoader();
        }
      };
  const now = new Date();  
  const minDate = new Date();
  minDate.setDate(now.getDate() - (form.values?.surveyorScreenDate || 3));
  const formatDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  };
  return (
    <div>
      <TableComponent showDownload columns={columns} data={data} />

      <Modal show={show} centered size="xl">
        <CardHeader>
          <Row>
            <Col sm="10" md="10">
              <FormGroup className="d-flex justify-content-start mb-0">
                <h4>Rake Surveyor Unloading Changes</h4>
              </FormGroup>
            </Col>
            <Col sm="2" md="2">
              <FormGroup className="d-flex justify-content-end mb-0">
                <X color="red" onClick={closeRemarksModal} size={20} />
              </FormGroup>
            </Col>
          </Row>
        </CardHeader>
        <Modal.Body>
          <Row>
            <Col sm="12">
              <div className="subtitle-side mb-2">
                <u>
                  <strong className="title-underline text-primary">
                    RAKE DETAILS
                  </strong>
                </u>
              </div>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                    url={`${apiBaseUrl}RakeloadingController/RakeFNRNO`}
                    label="FNR NO"
                    form={form}
                    id="fnrNumberDetails"
                    onChange={(selected) => {
                        form.setFieldValue("fnrNumberDetails", selected);
                        form.setFieldValue("fnrNumber", selected.value);
                        form.setFieldValue("unloadingLocation",  selected.plant_ids || "");
                        form.setFieldValue("numberOfTrucks", selected.total_count || "");
                        form.setFieldValue("nagaOwn", selected.Own_Count);
                        form.setFieldValue("goodshed", selected.Hire_Count);
                        form.setFieldValue("total",Number(selected.Own_Count) +  Number(selected.Hire_Count));
                        form.setFieldValue("completionTime", selected.last_created);
                        form.setFieldValue("rrCopy", selected.rrCopy ?? form.values.rrCopy);
                        form.setFieldValue("noOfWagonReceived", selected.noOfWagan ? selected.noOfWagan : form.values.noOfWagonReceived);
                    }}
                />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Rake No</Label>
                <Input
                  type="text"
                  value={form.values?.rakeUniqueNo}
                  onChange={(e) => update("rakeUniqueNo", e.target.value)}
                  invalid={!!errors.rakeUniqueNo}
                />
                {errors.rakeUniqueNo && (
                  <div className="text-danger small mt-1">
                    {errors.rakeUniqueNo}
                  </div>
                )}
              </FormGroup>
            </Col>        
            <Col md="4" sm="12">
              <FormGroup>
                <Label>RR NUMBER</Label>
                <Input
                  type="text"
                  value={form.values?.rrNumber}
                  onChange={(e) => update("rrNumber", e.target.value)}
                  invalid={!!errors.rrNumber}
                />
                {errors.rrNumber && (
                  <div className="text-danger small mt-1">
                    {errors.rrNumber}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
            <FormGroup>
                {/* <Label>RAKE TYPE</Label> */}

                <CustomDropdownInput
                    url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/31`}
                    label="RAKE TYPE"
                    form={form}
                    id="definitions_list_id"
                    onChange={(selected) => {
                        form.setFieldValue("definitions_list_id", selected);
                        form.setFieldValue("rakeType", selected.label);
                        form.setFieldValue("freeTimeTill", selected?.definition_values || "");
                    }}
                />

                {freeTimeError && (
                <div className="text-danger small mt-1">{freeTimeError}</div>
                )}

                {errors.rakeType && (
                <div className="text-danger small mt-1">{errors.rakeType}</div>
                )}
            </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>NO OF WAGON RECEIVED</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.noOfWagonReceived}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length <= 2) {
                      update("noOfWagonReceived", value);
                    }
                  }}
                  invalid={!!errors.noOfWagonReceived}
                />
                {errors.noOfWagonReceived && (
                  <div className="text-danger small mt-1">
                    {errors.noOfWagonReceived}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>NO OF MISSING WAGON</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.noOfMissingWagon}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length <= 2) {
                      update("noOfMissingWagon", value);
                    }
                  }}
                  invalid={!!errors.noOfMissingWagon}
                />
                {errors.noOfMissingWagon && (
                  <div className="text-danger small mt-1">
                    {errors.noOfMissingWagon}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>MISSING WAGON NUMBERS</Label>
                <Input
                  type="text"
                  value={form.values?.wagonNumber}
                  onChange={(e) => update("wagonNumber", e.target.value)}
                  invalid={!!errors.wagonNumber}
                />
                {errors.wagonNumber && (
                  <div className="text-danger small mt-1">
                    {errors.wagonNumber}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>PLACEMENT DATE & TIME</Label>
                <Input
                  type="datetime-local"
                  value={form.values?.placementTime}
                  onChange={(e) => update("placementTime", e.target.value)}
                  min={formatDateTime(minDate)}   // 2 days back allowed
                  max={formatDateTime(now)}       // future not allowed
                  invalid={!!errors.placementTime}
                />
                {errors.placementTime && (
                  <div className="text-danger small mt-1">
                    {errors.placementTime}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>PLACEMENT PLATFORM</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.placementPlatform}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length <= 1) {
                      update("placementPlatform", value);
                    }
                  }}
                  invalid={!!errors.placementPlatform}
                />
                {errors.placementPlatform && (
                  <div className="text-danger small mt-1">
                    {errors.placementPlatform}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>FREE TIME TILL (Hrs)</Label>
                <Input
                  type="text"
                  value={form.values?.freeTimeTill}
                  disabled
                  invalid={!!errors.freeTimeTill}
                />
                {errors.freeTimeTill && (
                  <div className="text-danger small mt-1">
                    {errors.freeTimeTill}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>COMPLETION DATE & TIME</Label>
                <Input
                  type="datetime-local"
                  value={form.values?.completionTime}
                  onChange={(e) => update("completionTime", e.target.value)}
                  min={formatDateTime(minDate)}   // 2 days back allowed
                  max={formatDateTime(now)}       // future not allowed
                  invalid={!!errors.completionTime}
                />
                {errors.completionTime && (
                  <div className="text-danger small mt-1">
                    {errors.completionTime}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>TOTAL DC HOURS IF ANY</Label>
                <Input
                  type="text"
                  value={form.values?.totalDcHours}
                  disabled
                />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>TOTAL WHARFAGE IF ANY</Label>
                <Input
                  type="text"
                  value={form.values?.totalWharfage}
                  onChange={(e) => update("totalWharfage", e.target.value)}
                  invalid={!!errors.totalWharfage}
                />
                {errors.totalWharfage && (
                  <div className="text-danger small mt-1">
                    {errors.totalWharfage}
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
                <FormGroup>
                <Label>BAGS UNLOADED AT PLATFORM</Label>
                <Input
                    type="text"
                    value={form.values?.bagsUnloadPlatForm || ''}
                    onChange={(e) => update("bagsUnloadPlatForm", e.target.value)}
                    invalid={!!errors.bagsUnloadPlatForm}
                />
                {errors.bagsUnloadPlatForm && (
                    <div className="text-danger small mt-1">{errors.bagsUnloadPlatForm}</div>
                )}
                </FormGroup>
            </Col>
            <Col md="4" sm="12">
                <FormGroup>
                <Label>REMARKS</Label>
                <Input
                    type="text"
                    value={form.values?.remarks}
                    onChange={(e) => update("remarks", e.target.value)}
                    invalid={!!errors.totalWharfage}
                />
                {errors.remarks && (
                    <div className="text-danger small mt-1">{errors.remarks}</div>
                )}
                </FormGroup>
            </Col>      
            <Col md="4" sm="12">
              <FormGroup>
                <Label>
                  TARPAULIN PLACED AT EVERY WAGON BEFORE UNLOADING (YES/NO)
                </Label>
                <Input
                  type="select"
                  value={form.values?.tarpaulinPlaced || ""}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const upperValue = rawValue.toUpperCase();
                    update("tarpaulinPlaced", upperValue);
                    if (upperValue === "YES") {
                      update("tarpaulinPlacedRemarks", "");
                      setErrors((prev) => ({ ...prev, tarpaulinPlacedRemarks: "" }));
                    }
                  }}
                  invalid={!!errors.tarpaulinPlaced}
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </Input>
                {errors.tarpaulinPlaced && (
                  <div className="text-danger small mt-1">
                    {errors.tarpaulinPlaced}
                  </div>
                )}
              </FormGroup>
            </Col>

            {form.values?.tarpaulinPlaced === "NO" && (
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>TARPAULIN PLACED REMARKS</Label>
                  <Input
                    type="text"
                    value={form.values?.tarpaulinPlacedRemarks}
                    onChange={(e) =>
                      update("tarpaulinPlacedRemarks", e.target.value)
                    }
                    invalid={!!errors.tarpaulinPlacedRemarks}
                  />
                  {errors.tarpaulinPlacedRemarks && (
                    <div className="text-danger small mt-1">
                      {errors.tarpaulinPlacedRemarks}
                    </div>
                  )}
                </FormGroup>
              </Col>
            )}

            <Col md="4" sm="12">
              <FormGroup>
                <Label>TARPAULIN COVERED AT ALL TRUCK (YES/NO)</Label>
                <Input
                  type="select"
                  value={form.values?.tarpaulinCovered || ""}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const upperValue = rawValue.toUpperCase();
                    update("tarpaulinCovered", upperValue);
                    if (upperValue === "YES") {
                      update("tarpaulinCoveredRemarks", "");
                      setErrors((prev) => ({ ...prev, tarpaulinCoveredRemarks: "" }));
                    }
                  }}
                  invalid={!!errors.tarpaulinCovered}
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </Input>
                {errors.tarpaulinCovered && (
                  <div className="text-danger small mt-1">
                    {errors.tarpaulinCovered}
                  </div>
                )}
              </FormGroup>
            </Col>

            {form.values?.tarpaulinCovered === "NO" && (
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>TARPAULIN COVERED REMARKS</Label>
                  <Input
                    type="text"
                    value={form.values?.tarpaulinCoveredRemarks}
                    onChange={(e) =>
                      update("tarpaulinCoveredRemarks", e.target.value)
                    }
                    invalid={!!errors.tarpaulinCoveredRemarks}
                  />
                  {errors.tarpaulinCoveredRemarks && (
                    <div className="text-danger small mt-1">
                      {errors.tarpaulinCoveredRemarks}
                    </div>
                  )}
                </FormGroup>
              </Col>
            )}
          </Row>

          <Row>
            <Col sm="12">
              <div className="subtitle-side mb-2">
                <u>
                  <strong className="title-underline text-primary">
                    LOADMAN
                  </strong>
                </u>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>NO OF LOADMAN PRESENT</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.noOfLoadman}
                  onChange={(e) => update("noOfLoadman", e.target.value)}
                  invalid={!!errors.noOfLoadman}
                />
                {errors.noOfLoadman && (
                  <div className="text-danger small mt-1">
                    {errors.noOfLoadman}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>ARRIVAL DATE & TIME</Label>
                <Input
                  type="datetime-local"
                  value={form.values?.arrivalTime}
                  min={formatDateTime(minDate)}   // 2 days back allowed
                  max={formatDateTime(now)}       // future not allowed
                  onChange={(e) => update("arrivalTime", e.target.value)}
                  invalid={!!errors.arrivalTime}
                />
                {errors.arrivalTime && (
                  <div className="text-danger small mt-1">
                    {errors.arrivalTime}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>LOADING STARTING DATE & TIME</Label>
                <Input
                  type="datetime-local"
                  value={form.values?.loadingStartingTime}
                  min={formatDateTime(minDate)}   // 2 days back allowed
                  max={formatDateTime(now)}       // future not allowed
                  onChange={(e) => update("loadingStartingTime", e.target.value)}
                  invalid={!!errors.loadingStartingTime}
                />
                {errors.loadingStartingTime && (
                  <div className="text-danger small mt-1">
                    {errors.loadingStartingTime}
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>NO OF SPILLAGE CLEANING LADIES</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.spillageCleaningLadies}
                  onChange={(e) =>
                    update("spillageCleaningLadies", e.target.value)
                  }
                  invalid={!!errors.spillageCleaningLadies}
                />
                {errors.spillageCleaningLadies && (
                  <div className="text-danger small mt-1">
                    {errors.spillageCleaningLadies}
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
                <FormGroup>
                <Label>EMPTY BOX DATE & TIME</Label>
                <Input
                    type="datetime-local"
                    value={form.values?.emptyBoxOpenTime}
                    onChange={(e) => update("emptyBoxOpenTime", e.target.value)}
                //   max={new Date().toISOString().slice(0, 16)}
                    min={formatDateTime(minDate)}   // 2 days back allowed
                    max={formatDateTime(now)}       // future not allowed
                    invalid={!!errors.emptyBoxOpenTime}
                />
                {errors.emptyBoxOpenTime && (
                    <div className="text-danger small mt-1">{errors.emptyBoxOpenTime}</div>
                )}
                </FormGroup>
            </Col>
            <Col md="4" sm="12">
                <FormGroup>
                <Label>SWEEPING DATE & TIME</Label>
                <Input
                    type="datetime-local"
                    value={form.values?.sweepingTime}
                    onChange={(e) => update("sweepingTime", e.target.value)}
                //   max={new Date().toISOString().slice(0, 16)}
                     min={formatDateTime(minDate)}   // 2 days back allowed
                     max={formatDateTime(now)}       // future not allowed
                    invalid={!!errors.sweepingTime}
                />
                {errors.sweepingTime && (
                    <div className="text-danger small mt-1">{errors.sweepingTime}</div>
                )}
                </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col sm="12">
              <div className="subtitle-side mb-2">
                <u>
                  <strong className="title-underline text-primary">
                    TRUCK DETAILS
                  </strong>
                </u>
              </div>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>NAGA TRUCK</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.nagaOwn}
                  disabled
                />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>GOODSHED TRUCK</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.goodshed}
                  disabled
                />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>TOTAL NO OF TRUCK</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.total}
                  disabled
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col sm="12">
              <div className="subtitle-side mb-2">
                <u>
                  <strong className="title-underline text-primary">
                    UNLOADING LOCATION DETAILS
                  </strong>
                </u>
              </div>
            </Col>
            <Col md="8" sm="12">
              <table
                className="table table-sm table-bordered"
                style={{ fontSize: "12px", width: "80%" }}
              >
                <thead className="table-primary">
                  <tr>
                    <th style={{ padding: "4px" , textAlign: "center"}}>Unloading Location</th>
                    <th style={{ padding: "4px" , textAlign: "center"}}>Total Trucks - {form.values?.numberOfTrucks}</th>
                  </tr>
                </thead>
                <tbody>
                  {form.values?.unloadingLocation &&
                    JSON.parse(form.values.unloadingLocation).map(
                      (row, i) => (
                        <tr key={i}>
                          <td style={{ padding: "4px" , textAlign: "center" }}>{row.PLANT_ID}</td>
                          <td
                            style={{
                              padding: "4px",
                              textAlign: "center",
                            }}
                          >
                            {row.TOTAL_VEHICLE}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </Col>
          </Row>

          <br />

          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>NO OF SPILLAGE TRUCKS</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.noOfSpillageTrucks}
                  onChange={(e) =>
                    update("noOfSpillageTrucks", e.target.value)
                  }
                  invalid={!!errors.noOfSpillageTrucks}
                />
                {errors.noOfSpillageTrucks && (
                  <div className="text-danger small mt-1">
                    {errors.noOfSpillageTrucks}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>BAGS IN EACH WAGON (SPILLAGE)</Label>
                <Input
                  type="text"
                  value={form.values?.bagsInEachWagon}
                  onChange={(e) => update("bagsInEachWagon", e.target.value)}
                  invalid={!!errors.bagsInEachWagon}
                />
                {errors.bagsInEachWagon && (
                  <div className="text-danger small mt-1">
                    {errors.bagsInEachWagon}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>
                  NO OF EMPTY GUNNY USED FOR SPILLAGE COLLECTION
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.values?.noOfEmptyGunnyUsed}
                  onChange={(e) =>
                    update("noOfEmptyGunnyUsed", e.target.value)
                  }
                  invalid={!!errors.noOfEmptyGunnyUsed}
                />
                {errors.noOfEmptyGunnyUsed && (
                  <div className="text-danger small mt-1">
                    {errors.noOfEmptyGunnyUsed}
                  </div>
                )}
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>SURVEYOR NAMES & RESPONSIBILITY</Label>
                <Input
                  type="text"
                  value={form.values?.surveyorNames}
                  onChange={(e) => update("surveyorNames", e.target.value)}
                  invalid={!!errors.surveyorNames}
                />
                {errors.surveyorNames && (
                  <div className="text-danger small mt-1">
                    {errors.surveyorNames}
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Reject Reason</Label>
                <Input
                  type="text"
                  value={form.values?.rejectReason}
                  onChange={(e) => update("rejectReason", e.target.value)}
                  invalid={!!errors.rejectReason}
                />
                {errors.rejectReason && (
                  <div className="text-danger small mt-1">
                    {errors.rejectReason}
                  </div>
                )}
              </FormGroup>
            </Col>

            {/* <Col sm="2" md="2">
              <Label></Label>
              <FormGroup className="d-flex justify-content-start mb-0">
                <a target="_blank" href={form.values?.rrCopy} rel="noreferrer">
                  {form.values?.rrCopy && (
                    <Button outline color="success" type="button">
                      RR Copy
                    </Button>
                  )}
                </a>
              </FormGroup>
            </Col> */}
                  <FileUploadField 
                    label="RR Copy" 
                    oldFile={form.values?.rrCopy} 
                    newKey="newRrCopy" 
                    editMode={true}
                    onFileChange={updateField} 
                  />
          </Row>

          {/* Footer: Reject (left) and Submit (right) */}
          <Row>
            <Col sm="12" className="mt-3">
              <FormGroup className="d-flex justify-content-between mb-0">
                <div>
                  <Button.Ripple
                    color="danger"
                    type="button"
                    onClick={() => onSubmit(0)}
                  >
                    <Trash2 size={16} className="mr-1" /> Reject
                  </Button.Ripple>
                </div>
                {form.values.currentStatus == 1 && (
                <div>
                  <Button.Ripple
                    color="success"
                    type="button"
                    onClick={() => saveChanges(2)}
                  >
                    <Circle size={16} className="mr-1" /> Approval 1
                  </Button.Ripple>
                </div>)}
                {form.values.currentStatus == 2 && (
                <div>
                  <Button.Ripple
                    color="success"
                    type="button"
                    onClick={() => saveChanges(3)}
                  >
                    <Circle size={16} className="mr-1" /> Approval 2
                  </Button.Ripple>
                </div>)}
              </FormGroup>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RakeUnloadingChange;
