import React, { useEffect, useState, lazy, Suspense, useMemo } from "react";
import {
  Card, CardHeader, CardTitle, CardBody, Row, Col, Button,
  FormGroup, Table, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Input, Label,
} from "reactstrap";
import { useFormik } from "formik";
import { DatePicker } from "../forms/custom-datetime";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import moment from "moment";
import { useSelector } from "react-redux";

const ExcelDownload = lazy(() => import("../common/ExcelDownload"));

const thStyle = (bg) => ({
  backgroundColor: bg, color: "#fff", fontWeight: 700, fontSize: "14px",
  textAlign: "center", border: "1px solid #cbd5e1", whiteSpace: "nowrap",
  verticalAlign: "middle", padding: "10px 12px",
});
const subTh = {
  backgroundColor: "#e3f2fd", color: "#0d47a1", fontWeight: 700, fontSize: "13px",
  textAlign: "center", border: "1px solid #bbdefb", padding: "8px 10px",
  whiteSpace: "nowrap", verticalAlign: "middle",
};
const locTh = {
  backgroundColor: "#e8f5e9", color: "#1b5e20", fontWeight: 700, fontSize: "13px",
  textAlign: "center", border: "1px solid #c8e6c9", padding: "8px 10px",
  whiteSpace: "nowrap", verticalAlign: "middle",
};
const tdBase = {
  fontSize: "14px", textAlign: "center", border: "1px solid #dbeafe",
  padding: "8px 10px", whiteSpace: "nowrap", verticalAlign: "middle",
};
const PERIOD_COLORS = { header: "#0d47a1", loading: "#1976d2", unloading: "#1565c0" };
const getDiffStyle = (diff) => ({
  ...tdBase,
  backgroundColor: diff === 0 ? "#d1fae5" : "#fee2e2",
  color: diff === 0 ? "#065f46" : "#991b1b",
  fontWeight: 700,
});
const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
const cellStyle = ({ bg = "", color = "#000000", bold = false, align = "center",
  fontSize = "13px", border = "#dbeafe" } = {}) =>
  [
    bg ? `background:${bg};background-color:${bg};` : "",
    `color:${color};`, `font-weight:${bold ? "700" : "400"};`,
    `text-align:${align};`, `font-size:${fontSize};`,
    `border:1px solid ${border};`, "padding:8px 10px;",
    "white-space:nowrap;", "vertical-align:middle;",
  ].filter(Boolean).join(" ");

// Parse comma-separated ID string into a Set
const parseIds = (str) =>
  new Set((str || "").split(",").map((s) => s.trim()).filter(Boolean));

const RakeTruckComparisonDashboard = () => {
  const [dashData, setDashData]             = useState(null);
  const [viewBy, setViewBy]                 = useState("trips");
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [drillLoading, setDrillLoading]     = useState(false);
  const [drillList, setDrillList]           = useState([]);
  const [drillTitle, setDrillTitle]         = useState("");
  const [drillOnlyDiff, setDrillOnlyDiff]   = useState(false);
  const [drillContext, setDrillContext]      = useState({
    loadingTrucks: null, unloadingCount: null, tonnage: null,
  });

  const { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    initialValues: { date: { start: moment().startOf("month").toDate(), end: moment().toDate() } },
    onSubmit: () => { fetchDashboardData(); },
  });

  const fetchDashboardData = () => {
    const fromDate = form.values.date?.start;
    const toDate   = form.values.date?.end;
    if (!fromDate || !toDate) { errorToast("Please select a valid date range."); return; }
    const fromDateStr = moment(fromDate).format("YYYY-MM-DD");
    const toDateStr   = moment(toDate).format("YYYY-MM-DD");

    showLoader();
    apiPostMethod(`${apiBaseUrl}GatePro/Gate/getRakeTruckComparisonDashboard/${fromDateStr}/${toDateStr}`)
      .then(({ data }) => {
        if (data.success) {
          const apiRows   = data.results || [];
          const locations = [...new Set(apiRows.map((i) => i.plant_id))];
          const grouped   = {};

          apiRows.forEach((item) => {
            const fnr = item.fnr_no;
            if (!grouped[fnr]) {
              grouped[fnr] = {
                rakeFNR: fnr,
                loadingTrucks: Number(item.loading_count || 0),
                locationCounts: {},
                locationTonnage: {},
                totalUnloading: 0,
                totalTonnage: 0,
                // ── NEW: ID sets for accurate diff computation ──
                rakeLoadingIds:     parseIds(item.rake_loading_ids),   // all loading IDs (same for every row of this FNR)
                allUnloadedIds:     new Set(),                          // union of all location unloaded IDs
                locationUnloadedIds: {},                                // per-location unloaded ID sets
              };
            }

            grouped[fnr].locationCounts[item.plant_id]   = Number(item.unloading_count || 0);
            grouped[fnr].locationTonnage[item.plant_id]  = Number(item.Unloading_gunny_less_wt || 0);
            grouped[fnr].totalUnloading += Number(item.unloading_count || 0);
            grouped[fnr].totalTonnage   += Number(item.Unloading_gunny_less_wt || 0);

            // Accumulate unloaded IDs per location and globally
            const locUnloadedIds = parseIds(item.purchase_info_ids);
            grouped[fnr].locationUnloadedIds[item.plant_id] = locUnloadedIds;
            locUnloadedIds.forEach((id) => grouped[fnr].allUnloadedIds.add(id));
          });

          const rows = Object.values(grouped).map((row) => ({
            ...row,
            diff: row.loadingTrucks - row.totalUnloading,
            // IDs loaded but not present in ANY location's unloading — the true diff
            diffIds: [...row.rakeLoadingIds].filter((id) => !row.allUnloadedIds.has(id)),
          }));

          setDashData({ locations, rows });
        } else {
          setDashData(null);
          errorToast(data.message || "No data found.");
        }
      })
      .catch(() => { errorToast("Unable to load dashboard data. Please try again."); setDashData(null); })
      .finally(() => { hideLoader(); });
  };

  useEffect(() => { fetchDashboardData(); /* eslint-disable-next-line */ }, []);

  const rows      = dashData?.rows      ?? [];
  const locations = dashData?.locations ?? [];
  const isTonnage = viewBy === "tonnage";

  const totalLoading   = rows.reduce((s, r) => s + (r.loadingTrucks ?? 0), 0);
  const totalUnloading = rows.reduce((s, r) => s + (r.totalUnloading ?? 0), 0);
  const totalTonnage   = rows.reduce((s, r) => s + (r.totalTonnage   ?? 0), 0);
  const totalDiff      = totalLoading - totalUnloading;

  const locationTotals = {}, locationTonnages = {};
  locations.forEach((loc) => {
    locationTotals[loc]   = rows.reduce((s, r) => s + (r.locationCounts?.[loc]  ?? 0), 0);
    locationTonnages[loc] = rows.reduce((s, r) => s + (r.locationTonnage?.[loc] ?? 0), 0);
  });

  const fmtTon = (val) => {
    const n = Number(val);
    return isNaN(n) ? "0" : n % 1 === 0 ? n.toString() : n.toFixed(2);
  };

  // ── Drill-down ──────────────────────────────────────────────────────────────
  const openDrillDown = ({ rakeFNR, location, row, onlyDiff = false }) => {
    const baseTitle = location ? `${rakeFNR} — ${location} Trucks` : `${rakeFNR} — All Trucks`;
    setDrillTitle(onlyDiff ? `${baseTitle} — Difference Details` : baseTitle);
    setDrillLoading(true);
    setDrillList([]);
    setDrillModalOpen(true);
    setDrillOnlyDiff(!!onlyDiff);
    setDrillContext({
      loadingTrucks:  row?.loadingTrucks ?? null,
      unloadingCount: location ? (row?.locationCounts?.[location] ?? null) : (row?.totalUnloading ?? null),
      tonnage:        location ? (row?.locationTonnage?.[location] ?? null) : (row?.totalTonnage ?? null),
    });

    const fromDateStr = moment(form.values.date?.start).format("YYYY-MM-DD");
    const toDateStr   = moment(form.values.date?.end).format("YYYY-MM-DD");

    if (onlyDiff) {
      // ── Compute diff IDs directly from the precomputed sets — no extra API call ──
      let diffIds = [];

      if (location) {
        // Diff for a specific location: loading IDs not in that location's unloaded IDs
        const locUnloaded = row?.locationUnloadedIds?.[location] ?? new Set();
        diffIds = [...(row?.rakeLoadingIds ?? [])].filter((id) => !locUnloaded.has(id));
      } else {
        // Diff for the whole FNR: loading IDs not in ANY location's unloaded IDs
        diffIds = row?.diffIds ?? [];
      }

      if (diffIds.length === 0) {
        setDrillList([]);
        setDrillLoading(false);
        return;
      }

      // Fetch truck details for only the diff IDs
      apiPostMethod(`${apiBaseUrl}GatePro/Gate/getRakeTruckList`, {
        rakeFNR,
        location: location ?? null,
        fromDate: fromDateStr,
        toDate: toDateStr,
        rakeLoadingIds: diffIds.join(","),   // ← tell backend to return only these IDs
      })
        .then((res) => {
          const d = res?.data;
          if (d && d.success) { setDrillList(d.data || d.results || []); }
          else { setDrillList([]); errorToast(d?.message || "No difference records found."); }
        })
        .catch(() => { errorToast("Unable to load difference data. Please try again."); setDrillList([]); })
        .finally(() => setDrillLoading(false));

    } else {
      // ── Normal fetch ──
      apiPostMethod(`${apiBaseUrl}GatePro/Gate/getRakeTruckList`, {
        rakeFNR, location: location ?? null, fromDate: fromDateStr, toDate: toDateStr,
      })
        .then((res) => {
          const d = res?.data;
          if (d && d.success) { setDrillList(d.data || d.results || []); }
          else { setDrillList([]); errorToast(d?.message || "No trucks found."); }
        })
        .catch(() => { errorToast("Unable to load truck list. Please try again."); setDrillList([]); })
        .finally(() => setDrillLoading(false));
    }
  };

  const closeDrillModal = () => { setDrillModalOpen(false); setDrillOnlyDiff(false); };

  const displayedDrillList = drillList || [];

  const modalDiff       = drillContext.loadingTrucks !== null && drillContext.unloadingCount !== null
    ? drillContext.loadingTrucks - drillContext.unloadingCount : null;
  const modalDiffIsZero = modalDiff === 0;

  const buildExcelHtml = () => {
    if (!dashData || rows.length === 0) return "";
    const fromDate = form.values.date?.start;
    const toDate   = form.values.date?.end;
    if (!fromDate || !toDate) return "";
    const totalCols = isTonnage ? 3 + locations.length : 2 + locations.length + 2;
    const viewLabel = isTonnage ? "Tonnage" : "Trips";

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8" /></head>
      <body style="background-color:#f8fbff;margin:0;padding:20px;">
        <table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;width:100%;background-color:#fff;">
          <tr><td colspan="${totalCols}" style="${cellStyle({ bg: "#0d47a1", color: "#fff", bold: true, fontSize: "20px", border: "#0d47a1" })}">Rake – Number of Truck Comparison Abstract (${viewLabel})</td></tr>
          <tr><td colspan="${totalCols}" style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, align: "left", border: "#bbdefb" })}">Date Range : ${moment(fromDate).format("DD/MM/YYYY")} to ${moment(toDate).format("DD/MM/YYYY")}</td></tr>`;

    if (!isTonnage) {
      html += `
          <tr>
            <th style="${cellStyle({ bg: "#0d47a1", color: "#fff", bold: true, border: "#cbd5e1" })}">Rake FNR Number</th>
            <th style="${cellStyle({ bg: "#1976d2", color: "#fff", bold: true, border: "#cbd5e1" })}">No. of Loading Trucks</th>
            <th colspan="${locations.length + 1}" style="${cellStyle({ bg: "#1565c0", color: "#fff", bold: true, border: "#cbd5e1" })}">Number of Unloading Trucks</th>
            <th style="${cellStyle({ bg: "#0d47a1", color: "#fff", bold: true, border: "#cbd5e1" })}">Diff</th>
          </tr>
          <tr>
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
            ${locations.map((loc) => `<th style="${cellStyle({ bg: "#e8f5e9", color: "#1b5e20", bold: true, border: "#c8e6c9" })}">${escapeHtml(loc)}</th>`).join("")}
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">Total Unloading</th>
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
          </tr>`;
      html += rows.map((row, idx) => `
          <tr style="background-color:${idx % 2 === 0 ? "#ffffff" : "#f8fbff"}">
            <td style="${cellStyle({ bg: idx % 2 === 0 ? "#f1f8ff" : "#e3f2fd", color: "#0d47a1", bold: true, border: "#dbeafe" })}">${escapeHtml(row.rakeFNR)}</td>
            <td style="${cellStyle({ bold: true, border: "#dbeafe" })}">${escapeHtml(row.loadingTrucks)}</td>
            ${locations.map((loc) => `<td style="${cellStyle({ border: "#dbeafe" })}">${escapeHtml(row.locationCounts?.[loc] ?? 0)}</td>`).join("")}
            <td style="${cellStyle({ bold: true, border: "#dbeafe" })}">${escapeHtml(row.totalUnloading)}</td>
            <td style="${cellStyle({ bg: row.diff === 0 ? "#d1fae5" : "#fee2e2", color: row.diff === 0 ? "#065f46" : "#991b1b", bold: true, border: "#dbeafe" })}">${escapeHtml(row.diff)}</td>
          </tr>`).join("");
      html += `
          <tr style="border-top:2px solid #0d47a1;">
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, align: "left", border: "#bbdefb" })}">TOTAL</td>
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${totalLoading}</td>
            ${locations.map((loc) => `<td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${locationTotals[loc] ?? 0}</td>`).join("")}
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${totalUnloading}</td>
            <td style="${cellStyle({ bg: totalDiff === 0 ? "#d1fae5" : "#fee2e2", color: totalDiff === 0 ? "#065f46" : "#991b1b", bold: true, border: "#dbeafe" })}">${totalDiff}</td>
          </tr>`;
    } else {
      html += `
          <tr>
            <th style="${cellStyle({ bg: "#0d47a1", color: "#fff", bold: true, border: "#cbd5e1" })}">Rake FNR Number</th>
            <th style="${cellStyle({ bg: "#1976d2", color: "#fff", bold: true, border: "#cbd5e1" })}">No. of Loading Trucks</th>
            <th colspan="${locations.length}" style="${cellStyle({ bg: "#1565c0", color: "#fff", bold: true, border: "#cbd5e1" })}">Unloading Tonnage (Gunny Less Wt) by Location</th>
            <th style="${cellStyle({ bg: "#0d47a1", color: "#fff", bold: true, border: "#cbd5e1" })}">Total Tonnage</th>
          </tr>
          <tr>
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
            ${locations.map((loc) => `<th style="${cellStyle({ bg: "#e8f5e9", color: "#1b5e20", bold: true, border: "#c8e6c9" })}">${escapeHtml(loc)}</th>`).join("")}
            <th style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}"></th>
          </tr>`;
      html += rows.map((row, idx) => `
          <tr style="background-color:${idx % 2 === 0 ? "#ffffff" : "#f8fbff"}">
            <td style="${cellStyle({ bg: idx % 2 === 0 ? "#f1f8ff" : "#e3f2fd", color: "#0d47a1", bold: true, border: "#dbeafe" })}">${escapeHtml(row.rakeFNR)}</td>
            <td style="${cellStyle({ bold: true, border: "#dbeafe" })}">${escapeHtml(row.loadingTrucks)}</td>
            ${locations.map((loc) => `<td style="${cellStyle({ border: "#dbeafe" })}">${escapeHtml(fmtTon(row.locationTonnage?.[loc] ?? 0))}</td>`).join("")}
            <td style="${cellStyle({ bold: true, border: "#dbeafe" })}">${escapeHtml(fmtTon(row.totalTonnage))}</td>
          </tr>`).join("");
      html += `
          <tr style="border-top:2px solid #0d47a1;">
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, align: "left", border: "#bbdefb" })}">TOTAL</td>
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${totalLoading}</td>
            ${locations.map((loc) => `<td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${fmtTon(locationTonnages[loc] ?? 0)}</td>`).join("")}
            <td style="${cellStyle({ bg: "#e3f2fd", color: "#0d47a1", bold: true, border: "#bbdefb" })}">${fmtTon(totalTonnage)}</td>
          </tr>`;
    }
    html += `</table></body></html>`;
    return html;
  };

  const excelFileName = useMemo(() => {
    const fromDate = form.values.date?.start;
    const toDate   = form.values.date?.end;
    const suffix   = isTonnage ? "Tonnage" : "Trips";
    if (!fromDate || !toDate) return `Rake_Truck_Comparison_${suffix}.xls`;
    return `Rake_Truck_Comparison_${suffix}_${moment(fromDate).format("YYYYMMDD")}_${moment(toDate).format("YYYYMMDD")}.xls`;
  }, [form.values.date, viewBy]);

  const excelHtmlContent = useMemo(() => buildExcelHtml(), [dashData, form.values.date, viewBy]);

  const handleExcelFallback = () => {
    if (!dashData) { errorToast("No data available to export."); return; }
    const html = buildExcelHtml();
    if (!html) { errorToast("Unable to prepare Excel file."); return; }
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = excelFileName;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };

  const exportDrillListToExcel = () => {
    if (!displayedDrillList || displayedDrillList.length === 0) { errorToast("No trucks to export."); return; }
    const headers = ["S.No", "VA Number", "Truck No", "TripSheet", "Location", "Loading Date", "Unloading Date", "Unload Tonnage-Gunnyless"];
    const esc = (v) => v == null ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const dataRows = displayedDrillList.map((v, i) => [
      esc(v.s_no ?? i + 1), esc(v.va_number || ""), esc(v.vehicle_no || ""), esc(v.tripsheet_no || ""),
      esc(v.location || ""),
      esc(v.loading_date   ? moment(v.loading_date).format("YYYY-MM-DD HH:mm")   : ""),
      esc(v.unloading_date ? moment(v.unloading_date).format("YYYY-MM-DD HH:mm") : ""),
      esc(v.Unloading_gunny_less_wt || ""),
      esc(v.net_weight || ""),
    ]);
    let html = "<table><thead><tr>" + headers.map((h) => `<th>${esc(h)}</th>`).join("") + "</tr></thead><tbody>";
    html += dataRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
    const blob = new Blob([`<html><head><meta charset='utf-8'></head><body>${html}</body></html>`], { type: "application/vnd.ms-excel" });
    const fname = `Rake_Truck_List_${drillOnlyDiff ? "Diff_" : ""}${moment().format("YYYYMMDD_HHmmss")}.xls`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = fname;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };

  return (
    <Card>
      <CardHeader style={{ backgroundColor: "#e3f2fd" }}>
        <CardTitle style={{ color: "#0d47a1", fontSize: "22px", fontWeight: 700, marginBottom: 0 }}>
          Rake – Number of Truck Comparison Abstract
        </CardTitle>
      </CardHeader>

      <CardBody style={{ backgroundColor: "#f8fbff" }}>
        <Row>
          <Col md="4" sm="12">
            <FormGroup><DatePicker form={form} id="date" isDateRange label="Date Range" /></FormGroup>
          </Col>
          <Col md="3" sm="12">
            <FormGroup>
              <Label style={{ fontWeight: 600, color: "#0d47a1", fontSize: "13px" }}>View By</Label>
              <Input type="select" value={viewBy} onChange={(e) => setViewBy(e.target.value)}
                style={{ borderColor: "#90caf9", color: "#0d47a1", fontWeight: 600 }}>
                <option value="trips">Trips</option>
                <option value="tonnage">Tonnage</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="5" sm="12" className="d-flex align-items-center">
            <Button color="primary" onClick={form.handleSubmit} className="me-1">Search</Button>
            &nbsp;&nbsp;&nbsp;
            <Suspense fallback={<Button color="success" onClick={handleExcelFallback}>Export Excel</Button>}>
              <ExcelDownload fileName={excelFileName} htmlContent={excelHtmlContent} buttonLabel="Export Excel" color="success" className="ms-1" fallbackDownload={handleExcelFallback} />
              <Button color="success" onClick={handleExcelFallback}>Export Excel</Button>
            </Suspense>
          </Col>
        </Row>

        {!isTonnage && (
          <Row className="mb-2">
            <Col>
              <span style={{ fontSize: "14px", marginRight: 16 }}>
                <span style={{ display: "inline-block", width: 14, height: 14, backgroundColor: "#d1fae5", borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />
                Balanced (Diff = 0)
              </span>
              <span style={{ fontSize: "14px" }}>
                <span style={{ display: "inline-block", width: 14, height: 14, backgroundColor: "#fee2e2", borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />
                Discrepancy (Diff ≠ 0)
              </span>
            </Col>
          </Row>
        )}

        <Row>
          <Col sm="12" className="mt-2" style={{ overflowX: "auto" }}>
            <Table bordered responsive style={{ backgroundColor: "#ffffff", color: "#1e293b", minWidth: 900 }}>
              <thead>
                {!isTonnage ? (
                  <>
                    <tr>
                      <th style={thStyle(PERIOD_COLORS.header)}>Rake FNR Number</th>
                      <th style={thStyle(PERIOD_COLORS.loading)}>No. of Loading Trucks</th>
                      <th colSpan={locations.length + 1} style={thStyle(PERIOD_COLORS.unloading)}>Number of Unloading Trucks</th>
                      <th style={thStyle(PERIOD_COLORS.header)}>Diff</th>
                    </tr>
                    <tr>
                      <th style={subTh}></th><th style={subTh}></th>
                      {locations.map((loc) => <th key={loc} style={locTh}>{loc}</th>)}
                      <th style={subTh}>Total Unloading</th><th style={subTh}></th>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <th style={thStyle(PERIOD_COLORS.header)}>Rake FNR Number</th>
                      <th style={thStyle(PERIOD_COLORS.loading)}>No. of Loading Trucks</th>
                      <th colSpan={locations.length} style={thStyle(PERIOD_COLORS.unloading)}>Unloading Tonnage (Gunny Less Wt) by Location</th>
                      <th style={thStyle(PERIOD_COLORS.header)}>Total Tonnage</th>
                    </tr>
                    <tr>
                      <th style={subTh}></th><th style={subTh}></th>
                      {locations.map((loc) => <th key={loc} style={locTh}>{loc}</th>)}
                      <th style={subTh}></th>
                    </tr>
                  </>
                )}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={isTonnage ? locations.length + 3 : locations.length + 4}
                      style={{ ...tdBase, padding: "40px", color: "#94a3b8" }}>
                      No data found for the selected period.
                    </td>
                  </tr>
                ) : (
                  <>
                    {rows.map((row, idx) => (
                      <tr key={row.rakeFNR} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fbff" }}>
                        <td style={{ ...tdBase, fontWeight: 700, color: "#0d47a1", backgroundColor: idx % 2 === 0 ? "#f1f8ff" : "#e3f2fd" }}>
                          {row.rakeFNR}
                        </td>
                        {!isTonnage ? (
                          <>
                            <td style={{ ...tdBase, fontWeight: 700, cursor: "pointer" }}
                              onClick={() => openDrillDown({ rakeFNR: row.rakeFNR, location: null, row })}>
                              {row.loadingTrucks ?? "-"}
                            </td>
                            {locations.map((loc) => (
                              <td key={loc} style={{ ...tdBase, cursor: "pointer" }}
                                onClick={() => openDrillDown({ rakeFNR: row.rakeFNR, location: loc, row })}>
                                {row.locationCounts?.[loc] ?? "-"}
                              </td>
                            ))}
                            <td style={{ ...tdBase, fontWeight: 700 }}>{row.totalUnloading ?? "-"}</td>
                            {/* Diff cell — only clickable when diff ≠ 0 */}
                            <td
                              style={{ ...getDiffStyle(row.diff), cursor: row.diff !== 0 ? "pointer" : "default" }}
                              title={row.diff !== 0 ? `${row.diffIds?.length ?? 0} truck(s) loaded but not unloaded — click to view` : undefined}
                              onClick={() => row.diff !== 0 && openDrillDown({ rakeFNR: row.rakeFNR, location: null, row, onlyDiff: true })}>
                              {row.diff ?? "-"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ ...tdBase, fontWeight: 700, cursor: "pointer" }}
                              onClick={() => openDrillDown({ rakeFNR: row.rakeFNR, location: null, row })}>
                              {row.loadingTrucks ?? "-"}
                            </td>
                            {locations.map((loc) => (
                              <td key={loc} style={{ ...tdBase, cursor: "pointer" }}
                                onClick={() => openDrillDown({ rakeFNR: row.rakeFNR, location: loc, row })}>
                                {fmtTon(row.locationTonnage?.[loc] ?? 0)}
                              </td>
                            ))}
                            <td style={{ ...tdBase, fontWeight: 700 }}>{fmtTon(row.totalTonnage)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: "#e3f2fd", borderTop: "2px solid #0d47a1" }}>
                      <td style={{ ...tdBase, fontWeight: 800, color: "#0d47a1", textAlign: "left" }}>TOTAL</td>
                      {!isTonnage ? (
                        <>
                          <td style={{ ...tdBase, fontWeight: 800 }}>{totalLoading}</td>
                          {locations.map((loc) => <td key={loc} style={{ ...tdBase, fontWeight: 700 }}>{locationTotals[loc] ?? 0}</td>)}
                          <td style={{ ...tdBase, fontWeight: 800 }}>{totalUnloading}</td>
                          <td style={getDiffStyle(totalDiff)}>{totalDiff}</td>
                        </>
                      ) : (
                        <>
                          <td style={{ ...tdBase, fontWeight: 800 }}>{totalLoading}</td>
                          {locations.map((loc) => <td key={loc} style={{ ...tdBase, fontWeight: 700 }}>{fmtTon(locationTonnages[loc] ?? 0)}</td>)}
                          <td style={{ ...tdBase, fontWeight: 800 }}>{fmtTon(totalTonnage)}</td>
                        </>
                      )}
                    </tr>
                  </>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </CardBody>

      {/* ── Drill-down Modal ── */}
      <Modal isOpen={drillModalOpen} toggle={closeDrillModal} size="lg" centered>
        <ModalHeader toggle={closeDrillModal}>{drillTitle}</ModalHeader>
        <ModalBody>

          {/* Summary banner */}
          {!drillLoading && drillContext.loadingTrucks !== null && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16,
              padding: "10px 14px", backgroundColor: "#f1f8ff", borderRadius: 6,
              border: "1px solid #bbdefb", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, color: "#1976d2" }}>
                Loading Trucks:&nbsp;<span style={{ color: "#0d47a1" }}>{drillContext.loadingTrucks}</span>
              </span>
              <span style={{ color: "#94a3b8" }}>|</span>
              <span style={{ fontWeight: 700, color: "#1565c0" }}>
                {isTonnage ? "Unloading Tonnage" : "Unloading Trucks"}:&nbsp;
                <span style={{ color: "#0d47a1" }}>
                  {isTonnage ? fmtTon(drillContext.tonnage ?? 0) : (drillContext.unloadingCount ?? "-")}
                </span>
              </span>
              {drillOnlyDiff && (
                <>
                  <span style={{ color: "#94a3b8" }}>|</span>
                  <span style={{ fontWeight: 700, color: "#b45309", backgroundColor: "#fef3c7", borderRadius: 4, padding: "2px 8px" }}>
                    {displayedDrillList.length} unmatched loading truck{displayedDrillList.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          )}

          {drillLoading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : displayedDrillList.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <Table bordered responsive size="sm">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>VA Number</th>
                    <th>Truck No</th>
                    <th>TripSheet</th>
                    <th>Location</th>
                    <th>Loading Date</th>
                    <th>Unloading Date</th>
                    <th>Unload Tonnage-Gunnyless</th>
                    <th>Net Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDrillList.map((v, i) => (
                    <tr key={i}>
                      <td>{v.s_no ?? i + 1}</td>
                      <td>{v.va_number || "-"}</td>
                      <td>{v.vehicle_no || "-"}</td>
                      <td>{v.tripsheet_no || "-"}</td>
                      <td>{v.location || "-"}</td>
                      <td>{v.loading_date   ? moment(v.loading_date).format("YYYY-MM-DD HH:mm")   : "-"}</td>
                      <td>{v.unloading_date ? moment(v.unloading_date).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>{v.Unloading_gunny_less_wt || "-"}</td> 
                      <td>{v.net_weight || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              {drillOnlyDiff
                ? "No unmatched trucks — all loading trucks have unloading records."
                : "No trucks found."}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeDrillModal}>Close</Button>
          <Button color="success" onClick={exportDrillListToExcel}>Export Excel</Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default RakeTruckComparisonDashboard;