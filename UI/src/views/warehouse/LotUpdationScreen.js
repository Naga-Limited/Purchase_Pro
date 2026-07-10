import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Input, Table,Row,Col } from "reactstrap";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import * as XLSX from "xlsx";
import moment from "moment";
import { DatePicker } from "../forms/custom-datetime";
import { useSelector } from "react-redux";

const getCell = (row, keys, fallback = "") => {
  for (const k of keys) {
    if (row?.[k] !== undefined && row?.[k] !== null && row?.[k] !== "") return row[k];
  }
  return fallback;
};

const SAP_QC_BASE_CHIP = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "96px",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: 600,
  fontSize: "0.78rem",
  textAlign: "center",
  lineHeight: 1.1,
  whiteSpace: "nowrap",
};

const getSapDecision = (qcCodeRaw, sapStatusRaw) => {
  const code = String(qcCodeRaw ?? "").trim().toUpperCase();
  const status = String(sapStatusRaw ?? "").trim().toUpperCase();

  if (code === "A" || status.includes("APPROV")) return "APPROVED";
  if (code === "R" || status.includes("REJECT")) return "REJECTED";
  if (code === "P" || status.includes("PENDING")) return "PENDING";
  if (!code && !status) return "EMPTY";
  return "OTHER";
};

/** SAP result colours: A/Approved green, R/Reject red, P/Pending blue, empty yellow. */
const sapDecisionChipStyle = (decision) => {
  if (decision === "EMPTY") {
    return {
      ...SAP_QC_BASE_CHIP,
      backgroundColor: "#fff3cd",
      color: "#664d03",
      border: "1px solid #ffecb5",
    };
  }
  if (decision === "APPROVED") {
    return {
      ...SAP_QC_BASE_CHIP,
      backgroundColor: "#198754",
      color: "#ffffff",
      border: "1px solid #157347",
      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.12)",
    };
  }
  if (decision === "REJECTED") {
    return {
      ...SAP_QC_BASE_CHIP,
      backgroundColor: "#f8d7da",
      color: "#842029",
      border: "1px solid #f1aeb5",
    };
  }
  if (decision === "PENDING") {
    return {
      ...SAP_QC_BASE_CHIP,
      backgroundColor: "#0d6efd",
      color: "#ffffff",
      border: "1px solid #0a58ca",
      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.12)",
    };
  }
  return {
    ...SAP_QC_BASE_CHIP,
    backgroundColor: "#e2e3e5",
    color: "#41464b",
    border: "1px solid #d3d6d8",
  };
};

const LotUpdationScreen = () => {
  const { showLoader, hideLoader } = useLoader();
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [blockedRowKey, setBlockedRowKey] = useState("");
  const [evasiveOffsets, setEvasiveOffsets] = useState({});
  const [submittingRowKey, setSubmittingRowKey] = useState("");
  // use the shared DatePicker which expects a Formik-like `form` object
  const [formValues, setFormValues] = useState({ date: null, search: "" });
  const [formTouched, setFormTouched] = useState({});
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = {
    values: formValues,
    errors: {},
    touched: formTouched,
    isSubmitting: false,
    setFieldValue: (id, value) => {
      setFormValues((prev) => ({ ...prev, [id]: value }));
    },
    setFieldTouched: (id) => {
      setFormTouched((prev) => ({ ...prev, [id]: true }));
    },
  };

  const fetchQCLotList = (fromDate = "", toDate = "") => {
    const params = {};
    if (fromDate) params.start_date = fromDate;
    if (toDate) params.end_date = toDate;
    params.userId = UserDetails?.USERID || ""; // Include user ID in params for potential backend filtering or logging
    showLoader();
    return apiGetMethod(apiBaseUrl + "marketdata/master/getQCLotList", params)
      .then((response) => {
        const data = response?.data || {};
        if (data.success) {
          const resultRows = Array.isArray(data.results) ? data.results : [];
          setAllRows(resultRows);
          setRows(resultRows);
          return resultRows;
        } else {
          setRows([]);
          errorToast(data.message || "No data found");
          return [];
        }
      })
      .catch(() => {
        setRows([]);
        errorToast("Something went wrong, please try again after sometime");
        return [];
      })
      .finally(() => hideLoader());
  };

  // Live table search: debounce search over allRows
  React.useEffect(() => {
    const q = (formValues.search || "").trim().toLowerCase();
    const handle = setTimeout(() => {
      if (!q) {
        setRows(allRows);
        return;
      }
      const filtered = (allRows || []).filter((r) => {
        try {
          const vals = Object.keys(r || {}).map((k) => {
            const v = r[k];
            if (v === null || v === undefined) return "";
            if (typeof v === "object") return JSON.stringify(v);
            return String(v);
          });
          const rowText = vals.join(" |").toLowerCase();
          return rowText.includes(q);
        } catch (e) {
          return false;
        }
      });
      setRows(filtered);
    }, 250);
    return () => clearTimeout(handle);
  }, [formValues.search, allRows]);

  useEffect(() => {
    fetchQCLotList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load full list once on mount
  }, []);

  const onSubmitRow = (row, idx) => {
    const rowKey = String(idx);
    setSubmittingRowKey(rowKey);
    showLoader();
    apiPostMethod(apiBaseUrl + "marketdata/master/submitQCLotRow", { row })
      .then((response) => {
        const data = response?.data || {};
        if (data.success) {
          ShowToast(data.message || "Submitted Successfully");
          // preserve current date filter when reloading after submit
          const v = formValues.date;
          let s = "";
          let e = "";
          if (v) {
            if (v.start && v.end) {
              s = moment(v.start).format("YYYY-MM-DD");
              e = moment(v.end).format("YYYY-MM-DD");
            } else if (v.start) {
              s = moment(v.start).format("YYYY-MM-DD");
              e = s;
            } else if (v instanceof Date) {
              s = moment(v).format("YYYY-MM-DD");
              e = s;
            }
          }
          fetchQCLotList(s, e).then((fetchedRows) => {
            // re-apply search filter if any
            const q = (formValues.search || "").trim().toLowerCase();
            if (q && Array.isArray(fetchedRows) && fetchedRows.length) {
              const filtered = fetchedRows.filter((r) => {
                try {
                  const vals = Object.keys(r || {}).map((k) => {
                    const v = r[k];
                    if (v === null || v === undefined) return "";
                    if (typeof v === "object") return JSON.stringify(v);
                    return String(v);
                  });
                  const rowText = vals.join(" |").toLowerCase();
                  return rowText.includes(q);
                } catch (e) {
                  return false;
                }
              });
              setRows(filtered);
            } else {
              setRows(fetchedRows);
            }
          });
        } else {
          errorToast(data.message || "Failed to submit row");
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        setSubmittingRowKey("");
        hideLoader();
      });
  };

  const handleSubmitClick = (row, idx, isPending) => {
    if (isPending) {
      const k = String(idx);
      setBlockedRowKey(k);
      setTimeout(() => setBlockedRowKey(""), 450);
      errorToast("Pending QC rows are not allowed to submit");
      return;
    }
    onSubmitRow(row, idx);
  };

  const movePendingButton = (idx, isPending) => {
    if (!isPending) return;
    const x = Math.floor(Math.random() * 19) - 9; // -9..9
    const y = Math.floor(Math.random() * 19) - 9; // -9..9
    setEvasiveOffsets((prev) => ({ ...prev, [idx]: { x, y } }));
  };

  const applyDateFilter = () => {
    const v = formValues.date;
    let s = "";
    let e = "";
    if (v) {
      if (v.start && v.end) {
        s = moment(v.start).format("YYYY-MM-DD");
        e = moment(v.end).format("YYYY-MM-DD");
      } else if (v.start) {
        s = moment(v.start).format("YYYY-MM-DD");
        e = s;
      } else if (v instanceof Date) {
        s = moment(v).format("YYYY-MM-DD");
        e = s;
      }
    }
    fetchQCLotList(s, e).then((fetchedRows) => {
      const q = (formValues.search || "").trim().toLowerCase();
      if (q && Array.isArray(fetchedRows) && fetchedRows.length) {
        // Whole-row search: stringify row values and search inside
        const filtered = fetchedRows.filter((r) => {
          try {
            // Collect primitive values from the row into a single string
            const vals = Object.keys(r || {}).map((k) => {
              const v = r[k];
              if (v === null || v === undefined) return "";
              if (typeof v === "object") return JSON.stringify(v);
              return String(v);
            });
            const rowText = vals.join(" |").toLowerCase();
            return rowText.includes(q);
          } catch (e) {
            return false;
          }
        });
        setRows(filtered);
      } else {
        // if no query, keep fetched rows as-is
        setRows(fetchedRows);
      }
    });
  };

  const clearDateFilter = () => {
    setFormValues({ date: null, search: "" });
    setFormTouched({});
    // reload full list
    fetchQCLotList("", "").then((fetchedRows) => setRows(fetchedRows));
  };

  const exportToExcel = () => {
    if (!rows || rows.length === 0) {
      errorToast("No data to export");
      return;
    }

    const exportRows = rows.map((row, idx) => {
      const sapQcRaw = getCell(row, ["SAP_QC_CODE", "QC_CODE", "qc_code"], "");
      const sapStatusRaw = getCell(row, ["SAP_STATUS", "STATUS", "status"], "");
      const sapDecision = getSapDecision(sapQcRaw, sapStatusRaw);
      const lotNoDisplay = getCell(row, [
        "LOT_NO",
        "INSPECTION_LOT",
        "AVAILABLE_LOT",
        "CURRENT_LOT",
        "lotNo",
      ]);
      const poQtyDisplay = getCell(row, ["PO_QTY", "PURCHASE_QTY", "PO_QUANTITY", "poQty"], 0);
      const uomDisplay = getCell(row, ["UOM", "MEINS"]);
      return {
        Serial: idx + 1,
        "PO No": getCell(row, ["PO_NO", "PO_NUMBER", "poNumber"]),
        "GRN No": getCell(row, ["GRN_NO", "MIGO_NO", "migoNumber"]),
        Material: getCell(row, ["MATERIAL", "MATERIAL_CODE", "material"]),
        "Material Description": getCell(row, ["MATERIAL_DESC", "MATERIAL_DESCRIPTION", "MATERIAL_NAME"]),
        Plant: getCell(row, ["PLANT", "PLANT_CODE", "plantCode"]),
        "Lot No": lotNoDisplay,
        "Lot Detail": `${lotNoDisplay} - ${poQtyDisplay} - ${uomDisplay}`,
        "SAP Status": String(sapStatusRaw ?? "").trim(),
        "Receiving Qty": getCell(row, ["RECEIVING_QTY", "RECEIVED_QTY", "receivedQty"], 0),
        UOM: uomDisplay,
        "Vendor Name": getCell(row, ["VENDOR_NAME", "vendorName"]),
        "SAP Decision": sapDecision,
      };
    });

    // worksheet for data
    const wsData = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, "Data");

    // summary sheet
    const sum = summary; // { approved, rejected, pending, other }
    const filterInfo = [];
    if (formValues.date && formValues.date.start) {
      const s = moment(formValues.date.start).format("YYYY-MM-DD");
      const e = formValues.date.end ? moment(formValues.date.end).format("YYYY-MM-DD") : s;
      filterInfo.push({ Key: "Filter Start Date", Value: s });
      filterInfo.push({ Key: "Filter End Date", Value: e });
    } else {
      filterInfo.push({ Key: "Filter", Value: "All" });
    }
    filterInfo.push({ Key: "Total Rows", Value: rows.length });
    filterInfo.push({ Key: "Approved", Value: sum.approved });
    filterInfo.push({ Key: "Rejected", Value: sum.rejected });
    filterInfo.push({ Key: "Pending", Value: sum.pending });
    filterInfo.push({ Key: "Other", Value: sum.other });

    const wsSummary = XLSX.utils.json_to_sheet(filterInfo, { header: ["Key", "Value"] });
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // filename
    let suffix = "_all";
    if (formValues.date && formValues.date.start) {
      const s = moment(formValues.date.start).format("YYYYMMDD");
      const e = formValues.date.end ? moment(formValues.date.end).format("YYYYMMDD") : s;
      suffix = `_${s}${e ? `_${e}` : ""}`;
    }
    const filename = `lot_updation${suffix}.xlsx`;
    XLSX.writeFile(wb, filename);
    ShowToast("Excel exported");
  };

  const summary = rows.reduce(
    (acc, row) => {
      const decision = getSapDecision(
        getCell(row, ["SAP_QC_CODE", "QC_CODE", "qc_code"], ""),
        getCell(row, ["SAP_STATUS", "STATUS", "status"], "")
      );
      if (decision === "APPROVED") acc.approved += 1;
      else if (decision === "REJECTED") acc.rejected += 1;
      else if (decision === "PENDING") acc.pending += 1;
      else acc.other += 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0, other: 0 }
  );

  return (
    <Card
      style={{
        borderRadius: "14px",
        boxShadow: "0 16px 34px rgba(0,0,0,0.10)",
        border: "1px solid #e9ecef",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes blockedShake {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-4px, -3px); }
            40% { transform: translate(4px, 3px); }
            60% { transform: translate(-3px, 2px); }
            80% { transform: translate(3px, -2px); }
            100% { transform: translate(0, 0); }
          }
          .blocked-submit-shake {
            animation: blockedShake 0.45s ease;
          }
          .lotup-header {
            background: linear-gradient(110deg, #4f46e5 0%, #3b82f6 48%, #22c55e 100%);
            color: #fff;
          }
          .lotup-head-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.35);
            backdrop-filter: blur(2px);
          }
          .lotup-row-hover:hover {
            background: #f3f7ff !important;
            transition: background 120ms ease;
          }
          .lotup-table thead th {
            position: sticky;
            top: 0;
            z-index: 2;
            box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
      <div className="lotup-header px-1 py-1">
        <div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: "10px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "0.2px" }}>Lot Updation Screen</div>
            <div style={{ opacity: 0.92, fontSize: "12px" }}>QC decision view with row-wise submit control</div>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: "8px" }}>
            <span className="lotup-head-pill">Total: {rows.length}</span>
            <span className="lotup-head-pill">Approved: {summary.approved}</span>
            <span className="lotup-head-pill">Rejected: {summary.rejected}</span>
            <span className="lotup-head-pill">Pending: {summary.pending}</span>
          </div>
        </div>
      </div>
      <CardBody>
        {/* <div className="d-flex flex-wrap align-items-end mb-2" style={{ gap: "10px" }}> */}

          {/* <div style={{ minWidth: "320px" }}> */}
        <Row>
        <Col sm="12" md="5" className="d-flex align-items-center" style={{ gap: "10px" }}>
            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
            <Button color="primary" onClick={applyDateFilter} style={{ borderRadius: "8px", fontWeight: 600 }}>
              Apply
            </Button>
            <Button color="secondary" outline onClick={clearDateFilter} style={{ borderRadius: "8px", fontWeight: 600 }}>
              Clear
            </Button>
        </Col>
        <Col sm="12" md="7" className="d-flex align-items-center justify-content-end" style={{ gap: "10px" }}>
          <Button color="info" outline onClick={exportToExcel} style={{ borderRadius: "8px", fontWeight: 600 }}>
            Export Excel
          </Button>

          <Input
            type="text"
            value={formValues.search}
            placeholder="Search table values..."
            onChange={(e) => form.setFieldValue('search', e.target.value)}
            style={{ width: 300, borderRadius: 8, padding: '0.45rem 0.6rem' }}
          />
        </Col>
        </Row>
        {/* </div> */}

        <div
          style={{
            width: "100%",
            maxHeight: "68vh",
            overflow: "auto",
            borderRadius: "10px",
            border: "1px solid #e6eaf0",
            boxShadow: "inset 0 0 0 1px #f8f9fb",
          }}
        >
          <Table bordered size="sm" className="mb-0 lotup-table">
            <thead>
              <tr>
                <th className="bg-primary text-white">S.No</th>
                <th className="bg-primary text-white">Entry Date</th>
                <th className="bg-primary text-white">PO No</th>
                <th className="bg-primary text-white">GRN No</th>
                <th className="bg-primary text-white">Material</th>
                <th className="bg-primary text-white">Material Description</th>
                <th className="bg-primary text-white">Plant</th>
                <th className="bg-primary text-white">Lot No</th>
                {/* <th className="bg-primary text-white">Lot Detail</th> */}
                <th className="bg-primary text-white">SAP Status</th>
                <th className="bg-primary text-white">Receiving Qty</th>
                <th className="bg-primary text-white">UOM</th>
                <th className="bg-primary text-white">Vendor Name</th>
                <th className="bg-primary text-white" style={{ width: "100px" }}>
                  Submit
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center">
                    No data
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const sapQcRaw = getCell(row, ["SAP_QC_CODE", "QC_CODE", "qc_code"], "");
                  const sapQcDisplay = String(sapQcRaw ?? "").trim();
                  const sapStatusRaw = getCell(row, ["SAP_STATUS", "STATUS", "status"], "");
                  const sapStatusDisplay = String(sapStatusRaw ?? "").trim();
                  const sapDecision = getSapDecision(sapQcRaw, sapStatusRaw);
                  const lotNoDisplay = getCell(row, [
                    "LOT_NO",
                    "INSPECTION_LOT",
                    "AVAILABLE_LOT",
                    "CURRENT_LOT",
                    "lotNo",
                  ]);
                  const poQtyDisplay = getCell(row, ["PO_QTY", "PURCHASE_QTY", "PO_QUANTITY", "poQty"], 0);
                  const uomDisplay = getCell(row, ["UOM", "MEINS"]);
                  const isPending = sapDecision === "PENDING";
                  const isSubmitting = submittingRowKey === String(idx);
                  const binList = getCell(row, ["BIN_LIST", "binList"], '');
                  return (
                  <tr
                    key={idx}
                    className="lotup-row-hover"
                    style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fbfcff" }}
                  >
                    <td>{idx + 1}</td>
                    <td>{getCell(row, ["CREATED_AT", "created_at"])}</td>
                    <td>{getCell(row, ["PO_NO", "PO_NUMBER", "poNumber"])}</td>
                    <td>{getCell(row, ["GRN_NO", "MIGO_NO", "migoNumber"])}</td>
                    <td>{getCell(row, ["MATERIAL", "MATERIAL_CODE", "material"])}</td>
                    <td>{getCell(row, ["MATERIAL_DESC", "MATERIAL_DESCRIPTION", "MATERIAL_NAME"])}</td>
                    <td>{getCell(row, ["PLANT", "PLANT_CODE", "plantCode"])}</td>
                    <td>{lotNoDisplay}</td>
                    {/* <td>{binList || `${lotNoDisplay} - ${poQtyDisplay} - ${uomDisplay}`}</td> */}
                    <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                      <span style={sapDecisionChipStyle(sapDecision)}>{sapStatusDisplay}</span>
                    </td>
                    <td>{getCell(row, ["RECEIVING_QTY", "RECEIVED_QTY", "receivedQty"], 0)}</td>
                    <td>{uomDisplay}</td>
                    <td>{getCell(row, ["VENDOR_NAME", "vendorName"])}</td>
                    <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                      <Button
                        color="success"
                        size="sm"
                        onClick={() => handleSubmitClick(row, idx, isPending)}
                        onMouseEnter={() => movePendingButton(idx, isPending)}
                        className={blockedRowKey === String(idx) ? "blocked-submit-shake" : ""}
                        disabled={isPending || isSubmitting}
                        style={{
                          minWidth: "86px",
                          borderRadius: "8px",
                          fontWeight: 600,
                          opacity: isPending || isSubmitting ? 0.7 : 1,
                          cursor: isPending || isSubmitting ? "not-allowed" : "pointer",
                          transform: isPending
                            ? `translate(${evasiveOffsets[idx]?.x ?? 0}px, ${evasiveOffsets[idx]?.y ?? 0}px)`
                            : "translate(0,0)",
                          transition: "transform 120ms ease, opacity 120ms ease",
                        }}
                        title={isPending ? "Pending QC rows cannot be submitted" : ""}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default LotUpdationScreen;
