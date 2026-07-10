import React, { useEffect, useState, lazy, Suspense, useMemo, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  Button,
  FormGroup,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
  Spinner,
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

const getCellStyle = (isBelow, pct) => {
  if (pct === null || pct === undefined) return {};
  const onTarget = isBelow ? pct >= 85 : pct <= 15;

  return {
    backgroundColor: onTarget ? "#d1fae5" : "#fee2e2",
    color: onTarget ? "#065f46" : "#991b1b",
    fontWeight: 700,
    textAlign: "center",
    fontSize: "14px",
  };
};

const KPI_ROWS = [
  { rowIndex: 0, category: "OTD", area: "FG REGULAR", catSpan: 2, areaSpan: 2, isBelow: true },
  { rowIndex: 1, category: null, area: null, catSpan: 0, areaSpan: 0, isBelow: false },

  { rowIndex: 2, category: "BULKER", area: "IN / OUT", catSpan: 2, areaSpan: 2, isBelow: true },
  { rowIndex: 3, category: null, area: null, catSpan: 0, areaSpan: 0, isBelow: false },

  { rowIndex: 4, category: "TRAILER", area: "IN / OUT", catSpan: 2, areaSpan: 2, isBelow: true },
  { rowIndex: 5, category: null, area: null, catSpan: 0, areaSpan: 0, isBelow: false },
];

const fmtRange = (from, to) => {
  if (!from || !to) return "";
  const f = (d) => d.split("-").reverse().join("/");
  return `${f(from)} to ${f(to)}`;
};

const getRow = (rows, idx) => rows?.[idx] ?? null;

const thStyle = (bg) => ({
  backgroundColor: bg,
  color: "#fff",
  fontWeight: 700,
  fontSize: "14px",
  textAlign: "center",
  border: "1px solid #cbd5e1",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  padding: "10px 12px",
});

const subTh = {
  backgroundColor: "#e3f2fd",
  color: "#0d47a1",
  fontWeight: 700,
  fontSize: "13px",
  textAlign: "center",
  border: "1px solid #bbdefb",
  padding: "8px 10px",
  whiteSpace: "nowrap",
};

const tdBase = {
  fontSize: "14px",
  textAlign: "center",
  border: "1px solid #dbeafe",
  padding: "8px 10px",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const GateKpiDashboard = () => {
  const [dashData, setDashData] = useState(null);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    initialValues: {
      date: {
        start: moment().startOf("month").toDate(),
        end: moment().toDate(),
      },
    },
    onSubmit: () => {
      fetchDashboardData();
    },
  });

  const fetchDashboardData = () => {
    const fromDate = form.values.date?.start;
    const toDate = form.values.date?.end;

    if (!fromDate || !toDate) {
      errorToast("Please select a valid date range.");
      return;
    }

    const fromDateStr = moment(fromDate).format("YYYY-MM-DD");
    const toDateStr = moment(toDate).format("YYYY-MM-DD");
    const userId = UserDetails.GATE_ID || 0;

    showLoader();
    apiPostMethod(
      `${apiBaseUrl}GatePro/Gate/getGateKpiDashboard/${fromDateStr}/${toDateStr}/${userId}`
    )
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setDashData(data.results || null);
        } else {
          setDashData(null);
          errorToast(data.message || "No data found.");
        }
      })
      .catch(() => {
        errorToast("Unable to load dashboard data. Please try again.");
        setDashData(null);
      })
      .finally(() => {
        hideLoader();
      });
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const day = dashData?.day;
  const weeks = dashData?.weeks ?? [];
  const month = dashData?.month;

  // Vehicle list modal state
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleModalTitle, setVehicleModalTitle] = useState("");
  const hoverTimerRef = useRef(null);

  const PERIOD_COLORS = {
    kpis: "#0d47a1",
    day: "#1976d2",
    week: "#42a5f5",
    month: "#1565c0",
  };

  const buildExcelHtml = () => {
    if (!dashData) return "";

    const fromDate = form.values.date?.start;
    const toDate = form.values.date?.end;

    if (!fromDate || !toDate) return "";

    const allPeriods = [day, ...weeks, month];
    const totalColumns = 4 + allPeriods.length * 3;

    const escapeHtml = (value) => {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const cellStyle = ({
      bg = "",
      color = "#000000",
      bold = false,
      align = "center",
      vAlign = "middle",
      fontSize = "14px",
      border = "#dbeafe",
      nowrap = true,
    } = {}) =>
      [
        bg ? `background:${bg};` : "",
        bg ? `background-color:${bg};` : "",
        bg ? `mso-pattern:auto solid ${bg};` : "",
        `color:${color};`,
        `font-weight:${bold ? "700" : "400"};`,
        `text-align:${align};`,
        `vertical-align:${vAlign};`,
        `font-size:${fontSize};`,
        `border:1px solid ${border};`,
        "padding:8px 10px;",
        nowrap ? "white-space:nowrap;" : "",
      ]
        .filter(Boolean)
        .join(" ");

    const getPctCellStyle = (isBelow, pct) => {
      if (pct === null || pct === undefined) {
        return cellStyle({
          bg: "#ffffff",
          align: "center",
          vAlign: "middle",
          fontSize: "14px",
          border: "#dbeafe",
        });
      }

      const onTarget = isBelow ? pct >= 85 : pct <= 15;

      return cellStyle({
        bg: onTarget ? "#d1fae5" : "#fee2e2",
        color: onTarget ? "#065f46" : "#991b1b",
        bold: true,
        align: "center",
        vAlign: "middle",
        fontSize: "14px",
        border: "#dbeafe",
      });
    };

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Gate KPI</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="background-color:#f8fbff; margin:0; padding:20px;">
        <table
          border="1"
          cellspacing="0"
          cellpadding="0"
          style="
            border-collapse:collapse;
            font-family:Arial, sans-serif;
            width:100%;
            background-color:#ffffff;
          "
        >
          <tr>
            <td
              colspan="${totalColumns}"
              style="${cellStyle({
                bg: "#0d47a1",
                color: "#ffffff",
                bold: true,
                align: "center",
                fontSize: "24px",
                border: "#0d47a1",
              })}"
            >
              Gate KPI Dashboard
            </td>
          </tr>

          <tr>
            <td
              colspan="${totalColumns}"
              style="${cellStyle({
                bg: "#e3f2fd",
                color: "#0d47a1",
                bold: true,
                align: "left",
                fontSize: "14px",
                border: "#bbdefb",
              })}"
            >
              Date Range : ${moment(fromDate).format("DD/MM/YYYY")} to ${moment(toDate).format("DD/MM/YYYY")}
            </td>
          </tr>

          <tr>
            ${Array.from({ length: totalColumns })
              .map(
                () => `
                  <td style="${cellStyle({
                    bg: "#f8fbff",
                    border: "#f8fbff",
                  })}">
                    &nbsp;
                  </td>
                `
              )
              .join("")}
          </tr>

          <tr>
            <th
              colspan="4"
              style="${cellStyle({
                bg: "#0d47a1",
                color: "#ffffff",
                bold: true,
                fontSize: "14px",
                border: "#cbd5e1",
              })}"
            >
              KPIs
            </th>

            <th
              colspan="3"
              style="${cellStyle({
                bg: "#1976d2",
                color: "#ffffff",
                bold: true,
                fontSize: "14px",
                border: "#cbd5e1",
              })}"
            >
              ${escapeHtml(day?.label ?? `Day - ${moment(toDate).format("DD/MM/YY")}`)}
            </th>

            ${weeks
              .map(
                (week, index) => `
                  <th
                    colspan="3"
                    style="${cellStyle({
                      bg: "#42a5f5",
                      color: "#ffffff",
                      bold: true,
                      fontSize: "14px",
                      border: "#cbd5e1",
                    })}"
                  >
                    ${escapeHtml(week?.label ?? `Week - ${String(index + 1).padStart(2, "0")}`)}
                    <br/>
                    <span style="font-size:11px; font-weight:400;">
                      ${escapeHtml(fmtRange(week?.from, week?.to))}
                    </span>
                  </th>
                `
              )
              .join("")}

            <th
              colspan="3"
              style="${cellStyle({
                bg: "#1565c0",
                color: "#ffffff",
                bold: true,
                fontSize: "14px",
                border: "#cbd5e1",
              })}"
            >
              ${escapeHtml(month?.label ?? "Month")}
            </th>
          </tr>

          <tr>
            ${["CATEGORY", "AREA", "MEASURE", "BUDGET %"]
              .map(
                (h) => `
                  <th
                    style="${cellStyle({
                      bg: "#e3f2fd",
                      color: "#0d47a1",
                      bold: true,
                      fontSize: "13px",
                      border: "#bbdefb",
                    })}"
                  >
                    ${h}
                  </th>
                `
              )
              .join("")}

            ${["DAY", ...weeks.map((_, i) => `WEEK ${String(i + 1).padStart(2, "0")}`), "MONTH"]
              .map(
                () => `
                  <th style="${cellStyle({
                    bg: "#e3f2fd",
                    color: "#0d47a1",
                    bold: true,
                    fontSize: "13px",
                    border: "#bbdefb",
                  })}">BUDGET</th>
                  <th style="${cellStyle({
                    bg: "#e3f2fd",
                    color: "#0d47a1",
                    bold: true,
                    fontSize: "13px",
                    border: "#bbdefb",
                  })}">ACTUAL</th>
                  <th style="${cellStyle({
                    bg: "#e3f2fd",
                    color: "#0d47a1",
                    bold: true,
                    fontSize: "13px",
                    border: "#bbdefb",
                  })}">%</th>
                `
              )
              .join("")}
          </tr>
    `;

    KPI_ROWS.forEach((def) => {
      const dayRow = getRow(day?.rows, def.rowIndex);
      const weekRows = weeks.map((week) => getRow(week?.rows, def.rowIndex));
      const monthRow = getRow(month?.rows, def.rowIndex);
      const periods = [dayRow, ...weekRows, monthRow];

      html += `<tr>`;

      if (def.catSpan > 0) {
        html += `
          <td
            rowspan="${def.catSpan}"
            style="${cellStyle({
              bg: "#e3f2fd",
              color: "#0d47a1",
              bold: true,
              align: "left",
              fontSize: "14px",
              border: "#dbeafe",
            })}"
          >
            ${escapeHtml(def.category ?? "")}
          </td>
        `;
      }

      if (def.areaSpan > 0) {
        html += `
          <td
            rowspan="${def.areaSpan}"
            style="${cellStyle({
              bg: "#f1f8ff",
              color: "#1565c0",
              bold: true,
              align: "center",
              fontSize: "14px",
              border: "#dbeafe",
            })}"
          >
            ${escapeHtml(def.area ?? "")}
          </td>
        `;
      }

      html += `
        <td
          style="${cellStyle({
            bg: "#ffffff",
            color: "#1e293b",
            bold: true,
            align: "left",
            fontSize: "14px",
            border: "#dbeafe",
          })}"
        >
          ${escapeHtml(dayRow?.measure ?? "")}
        </td>
      `;

      html += `
        <td
          style="${cellStyle({
            bg: "#ffffff",
            color: "#475569",
            bold: true,
            align: "center",
            fontSize: "14px",
            border: "#dbeafe",
          })}"
        >
          ${dayRow?.budgetPct !== undefined && dayRow?.budgetPct !== null ? `${escapeHtml(dayRow.budgetPct)}%` : "—"}
        </td>
      `;

      periods.forEach((row) => {
        const pct = row?.pct ?? null;

        html += `
          <td
            style="${cellStyle({
              bg: "#ffffff",
              color: "#1e293b",
              align: "center",
              fontSize: "14px",
              border: "#dbeafe",
            })}"
          >
            ${escapeHtml(row?.total ?? "—")}
          </td>

          <td
            style="${cellStyle({
              bg: "#ffffff",
              color: "#1e293b",
              align: "center",
              fontSize: "14px",
              border: "#dbeafe",
            })}"
          >
            ${escapeHtml(row?.actual ?? "—")}
          </td>

          <td style="${getPctCellStyle(def.isBelow, pct)}">
            ${pct !== null && pct !== undefined ? `${escapeHtml(pct)}%` : "—"}
          </td>
        `;
      });

      html += `</tr>`;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    return html;
  };

  const excelFileName = useMemo(() => {
    const fromDate = form.values.date?.start;
    const toDate = form.values.date?.end;

    if (!fromDate || !toDate) return "Gate_KPI_Dashboard.xls";

    return `Gate_KPI_Dashboard_${moment(fromDate).format("YYYYMMDD")}_${moment(toDate).format(
      "YYYYMMDD"
    )}.xls`;
  }, [form.values.date]);

  const excelHtmlContent = useMemo(() => buildExcelHtml(), [dashData, form.values.date]);

  const handleExcelFallback = () => {
    if (!dashData) {
      errorToast("No dashboard data available to export.");
      return;
    }

    const html = buildExcelHtml();
    if (!html) {
      errorToast("Unable to prepare excel file.");
      return;
    }

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = excelFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const openVehicleList = ({ periodLabel, from, to, measure, metricType, category }) => {
    // Open modal and fetch list from API
    setVehicleModalTitle(`${measure} — ${periodLabel} (${metricType.toUpperCase()})`);
    setVehicleLoading(true);
    setVehicleList([]);
    setVehicleModalOpen(true);

    const gateId = UserDetails?.GATE_ID || 0;

    const payload = {
      fromDate: from,
      toDate: to,
      gateId,
      measure,
      metricType,
      category,
    };

    apiPostMethod(`${apiBaseUrl}GatePro/Gate/getVehicleList`, payload)
      .then((res) => {
        const d = res?.data;
        if (d && d.success) {
          setVehicleList(d.data || d.results || []);
        } else {
          setVehicleList([]);
          errorToast(d?.message || "No vehicles found for this selection.");
        }
      })
      .catch(() => {
        errorToast("Unable to load vehicle list. Please try again.");
        setVehicleList([]);
      })
      .finally(() => {
        setVehicleLoading(false);
      });
  };

  const handleCellHoverStart = (args) => {
    // start a short timer to open modal on hover (prevents accidental popups)
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => openVehicleList(args), 450);
  };

  const handleCellHoverCancel = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Export currently shown vehicle list to Excel (simple HTML table -> .xls)
  const exportVehicleListToExcel = () => {
    if (!vehicleList || vehicleList.length === 0) {
      errorToast("No vehicles to export.");
      return;
    }

    const headers = [
      "Vehicle No",
      "First Weight Date",
      "Second Weight Date",
      "Reporting Date",
      "Gate In",
      "Gate Out",
      "Weight Duration (hh:mm)",
      "Overall Duration (hh:mm)",
      "Delay Reason",
    ];

    const escape = (v) => {
      if (v === null || v === undefined) return "";
      return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    const rows = vehicleList.map((v) => {
      const weightDur = v.weight_duration_minutes != null
        ? Math.floor(v.weight_duration_minutes / 60).toString().padStart(2, "0") + ":" + String(v.weight_duration_minutes % 60).padStart(2, "0")
        : "";

      const overallDur = v.overall_duration_minutes != null
        ? Math.floor(v.overall_duration_minutes / 60).toString().padStart(2, "0") + ":" + String(v.overall_duration_minutes % 60).padStart(2, "0")
        : (v.duration_hours != null ? `${v.duration_hours} hrs` : "");

      return [
        v.vehicle_no || v.vehicleNo || v.vehicle || "",
        v.first_weight_date ? moment(v.first_weight_date).format("YYYY-MM-DD HH:mm") : "",
        v.second_weight_date ? moment(v.second_weight_date).format("YYYY-MM-DD HH:mm") : "",
        v.reporting_date ? moment(v.reporting_date).format("YYYY-MM-DD HH:mm") : "",
        v.gate_in ? moment(v.gate_in).format("YYYY-MM-DD HH:mm") : "",
        v.gate_out ? moment(v.gate_out).format("YYYY-MM-DD HH:mm") : "",
        weightDur,
        overallDur,
        v.delay_reason || "",
      ].map(escape);
    });

    let html = "<table>";
    html += "<thead><tr>" + headers.map((h) => `<th>${escape(h)}</th>`).join("") + "</tr></thead>";
    html += "<tbody>" + rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</tbody>";
    html += "</table>";

    const blob = new Blob([`<html><head><meta charset='utf-8'></head><body>${html}</body></html>`], {
      type: "application/vnd.ms-excel",
    });

    const fname = `Vehicle_List_${moment().format("YYYYMMDD_HHmmss")}.xls`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Card>
      <CardHeader style={{ backgroundColor: "#e3f2fd" }}>
        <CardTitle style={{ color: "#0d47a1", fontSize: "22px", fontWeight: 700, marginBottom: 0 }}>
          Gate KPI Dashboard
        </CardTitle>
      </CardHeader>

      <CardBody style={{ backgroundColor: "#f8fbff" }}>
        <Row>
          <Col md="4" sm="12">
            <FormGroup>
              <DatePicker form={form} id="date" isDateRange label="Date Range" />
            </FormGroup>
          </Col>

          <Col md="4" sm="12" className="d-flex align-items-center">
            <Button color="primary" onClick={form.handleSubmit} className="me-1">
              Search
            </Button>&nbsp;&nbsp;&nbsp;

            <Suspense
              fallback={
                <Button color="success" onClick={handleExcelFallback}>
                  Export Excel
                </Button>
              }
            >
              {/* {dashData ? ( */}
                <ExcelDownload
                  fileName={excelFileName}
                  htmlContent={excelHtmlContent}
                  buttonLabel="Export Excel"
                  color="success"
                  className="ms-1"
                  fallbackDownload={handleExcelFallback}
                />
             {/* ) : ( */}
                <Button color="success" onClick={handleExcelFallback}>
                  Export Excel
                </Button>
              {/* )} */}
            </Suspense>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <span style={{ fontSize: "14px", marginRight: 16 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  backgroundColor: "#d1fae5",
                  borderRadius: 2,
                  marginRight: 5,
                  verticalAlign: "middle",
                }}
              />
              On Target
            </span>
            <span style={{ fontSize: "14px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  backgroundColor: "#fee2e2",
                  borderRadius: 2,
                  marginRight: 5,
                  verticalAlign: "middle",
                }}
              />
              Off Target
            </span>
          </Col>
        </Row>

        <Row>
          <Col sm="12" className="mt-2" style={{ overflowX: "auto" }}>
            <Table
              bordered
              responsive
              style={{
                backgroundColor: "#ffffff",
                color: "#1e293b",
                minWidth: 1200,
              }}
            >
              <thead>
                <tr>
                  <th colSpan={4} style={thStyle(PERIOD_COLORS.kpis)}>
                    KPIs
                  </th>

                  <th colSpan={3} style={thStyle(PERIOD_COLORS.day)}>
                    {day?.label ?? `Day - ${moment(form.values.date?.end).format("DD/MM/YY")}`}
                  </th>

                  {weeks.map((week, index) => (
                    <th key={index} colSpan={3} style={thStyle(PERIOD_COLORS.week)}>
                      {week?.label ?? `Week - ${String(index + 1).padStart(2, "0")}`}
                      <br />
                      <span style={{ fontSize: "11px", opacity: 0.9 }}>
                        {/* {fmtRange(week?.from, week?.to)} */}
                      </span>
                    </th>
                  ))}

                  <th colSpan={3} style={thStyle(PERIOD_COLORS.month)}>
                    {month?.label ?? "Month"}
                  </th>
                </tr>

                <tr>
                  {["CATEGORY", "AREA", "MEASURE", "BUDGET %"].map((h, i) => (
                    <th key={i} style={subTh}>
                      {h}
                    </th>
                  ))}

                  {["DAY", ...weeks.map((_, i) => `WEEK ${String(i + 1).padStart(2, "0")}`), "MONTH"].flatMap((p) =>
                    ["BUDGET", "ACTUAL", "%"].map((s) => (
                      <th key={`${p}-${s}`} style={subTh}>
                        {s}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {KPI_ROWS.map((def, idx) => {
                  const dayRow = getRow(day?.rows, def.rowIndex);
                  const weekRows = weeks.map((week) => getRow(week?.rows, def.rowIndex));
                  const monthRow = getRow(month?.rows, def.rowIndex);
                  const periods = [dayRow, ...weekRows, monthRow];
                  const measure = dayRow?.measure ?? "";

                  return (
                    <tr key={def.rowIndex}>
                      {def.catSpan > 0 && (
                        <td
                          rowSpan={def.catSpan}
                          style={{
                            ...tdBase,
                            fontWeight: 800,
                            color: "#0d47a1",
                            backgroundColor: "#e3f2fd",
                            textAlign: "left",
                          }}
                        >
                          {def.category}
                        </td>
                      )}

                      {def.areaSpan > 0 && (
                        <td
                          rowSpan={def.areaSpan}
                          style={{
                            ...tdBase,
                            fontWeight: 700,
                            color: "#1565c0",
                            backgroundColor: "#f1f8ff",
                          }}
                        >
                          {def.area}
                        </td>
                      )}

                      <td style={{ ...tdBase, textAlign: "left", fontWeight: 600 }}>
                        {measure}
                      </td>

                      <td style={{ ...tdBase, color: "#475569", fontWeight: 600 }}>
                        {dayRow ? `${dayRow.budgetPct}%` : "—"}
                      </td>

                      {periods.map((row, pi) => {
                        const pct = row?.pct ?? null;

                        // data we will pass to fetch vehicle list: period from/to and measure
                        const periodObj = [day, ...weeks, month][pi] ?? {};
                        // For the 'Day' column (first period) the KPI row is computed for the end date only (to).
                        // Use the selected end date for both from/to so server filters the single day correctly.
                        const isDayColumn = pi === 0;
                        // Send plain date strings (YYYY-MM-DD) to server. Server will apply 06:00 -> next day 06:00 window.
                        const periodFrom = isDayColumn
                          ? (form.values.date?.end ? moment(form.values.date.end).format('YYYY-MM-DD') : (periodObj.from ? moment(periodObj.from).format('YYYY-MM-DD') : null))
                          : (periodObj.from ? moment(periodObj.from).format('YYYY-MM-DD') : (form.values.date?.start ? moment(form.values.date.start).format('YYYY-MM-DD') : null));
                        const periodTo = isDayColumn
                          ? (form.values.date?.end ? moment(form.values.date.end).format('YYYY-MM-DD') : (periodObj.to ? moment(periodObj.to).format('YYYY-MM-DD') : null))
                          : (periodObj.to ? moment(periodObj.to).format('YYYY-MM-DD') : (form.values.date?.end ? moment(form.values.date.end).format('YYYY-MM-DD') : null));
                        const periodLabel = periodObj.label ?? (pi === 0 ? `Day` : pi === periods.length - 1 ? `Month` : `Week ${pi}`);

                        // determine category to send: if this row's def has no category, inherit from earlier KPI rows
                        const categoryToSend = def.category ?? (KPI_ROWS.slice(0, idx + 1).reverse().find((d) => d.category) || {}).category;

                        // metricType: 'total' for total column, 'within'/'over' for actual column depending on whether the KPI is a 'below' target
                        const actualMetric = def.isBelow ? 'within' : 'over';

                        const totalProps = {
                          onMouseEnter: () => handleCellHoverStart({ periodLabel, from: periodFrom, to: periodTo, measure: dayRow?.measure ?? "", category: categoryToSend, metricType: "total" }),
                          onMouseLeave: handleCellHoverCancel,
                          onClick: () => openVehicleList({ periodLabel, from: periodFrom, to: periodTo, measure: dayRow?.measure ?? "", category: categoryToSend, metricType: "total" }),
                        };

                        const actualProps = {
                          onMouseEnter: () => handleCellHoverStart({ periodLabel, from: periodFrom, to: periodTo, measure: dayRow?.measure ?? "", category: categoryToSend, metricType: actualMetric }),
                          onMouseLeave: handleCellHoverCancel,
                          onClick: () => openVehicleList({ periodLabel, from: periodFrom, to: periodTo, measure: dayRow?.measure ?? "", category: categoryToSend, metricType: actualMetric }),
                        };

                        const pctProps = actualProps;

                        return (
                          <React.Fragment key={pi}>
                            <td {...totalProps} style={{ ...tdBase, cursor: "pointer" }}>{row?.total ?? "—"}</td>
                            <td {...actualProps} style={{ ...tdBase, cursor: "pointer" }}>{row?.actual ?? "—"}</td>
                            <td {...pctProps} style={{ ...tdBase, ...getCellStyle(def.isBelow, pct), cursor: "pointer" }}>
                              {pct !== null ? `${pct}%` : "—"}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </CardBody>
      {/* Vehicle list modal */}
      <Modal isOpen={vehicleModalOpen} toggle={() => setVehicleModalOpen(!vehicleModalOpen)} size="lg">
        <ModalHeader toggle={() => setVehicleModalOpen(!vehicleModalOpen)}>{vehicleModalTitle}</ModalHeader>
        <ModalBody>
          {vehicleLoading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : vehicleList && vehicleList.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <Table bordered responsive size="sm">
                <thead>
                  <tr>
                    <th>VA Number</th>
                    <th>Vehicle No</th>
                    <th>First Weight Date</th>
                    <th>Second Weight Date</th>
                    <th>Reporting Date</th>
                    <th>Gate In</th>
                    <th>Gate Out</th>
                    <th>Weight Duration</th>
                    <th>Overall Duration</th>
                    <th>Delay Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleList.map((v) => (
                    <tr key={v.gateInOutInfoId}>
                      <td>{v.va_number || v.VA_Number || v.vaNumber}</td>
                      <td>{v.vehicle_no || v.vehicleNo || v.vehicle}</td>
                      <td>{v.first_weight_date ? moment(v.first_weight_date).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>{v.second_weight_date ? moment(v.second_weight_date).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>{v.reporting_date ? moment(v.reporting_date).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>{v.gate_in ? moment(v.gate_in).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>{v.gate_out ? moment(v.gate_out).format("YYYY-MM-DD HH:mm") : "-"}</td>
                      <td>
                        {v.weight_duration_minutes != null
                          ? Math.floor(v.weight_duration_minutes / 60)
                              .toString()
                              .padStart(2, "0") 
                              +
                            ":" +
                            String(v.weight_duration_minutes % 60).padStart(2, "0") 
                            // +
                            // " (hh:mm)"
                          : "-"
                          }
                      </td>
                      <td>
                        {v.overall_duration_minutes != null
                          ? Math.floor(v.overall_duration_minutes / 60)
                              .toString()
                              .padStart(2, "0") +
                            ":" +
                            String(v.overall_duration_minutes % 60).padStart(2, "0") 
                            // +
                            // " (hh:mm)"
                          : v.duration_hours != null
                          ? v.duration_hours + " hrs"
                          : "-"}
                      </td>
                      <td>{v.delay_reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">No vehicles found.</div>
          )}
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={() => setVehicleModalOpen(false)}>
              Close
            </Button>
            <Button color="success" onClick={exportVehicleListToExcel}>
              Export Excel
            </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default GateKpiDashboard;