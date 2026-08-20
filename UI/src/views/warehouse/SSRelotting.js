import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react'
import { Col, Button, ButtonGroup, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl } from '../../urlConstants'
import { CustomDropdownInput } from '../forms/custom-form'
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";
import { DropdownControl } from "../../@core/components/dropdown";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { ExportToCsv } from 'export-to-csv';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import { Search, Trash2, Download, FileText, Printer, Package, Clock } from 'react-feather';

const stockdetails = {
  warehouseid: "",
  locationid: "",
  lotno: "",
  lotid: "",
  wheatvarietyid: "",
  Wheat_Variety_Id: "",
  Company: "",
  QtyinMTS: "",
  wh_name: "",
  wh_code: "",
  plantId: "",
  totalcapacity: "",
  Fumigationreleaseqty: "",
  Fumigationlockqty: "",
  Degassingreleaseqty: "",
  Degassinglockqty: "",
  Pledgeqty: "",
  Unpledgeqty: "",
  Rndlockqty: "",
  Rndreleasedqty: "",
}

const escapeHtmlLabel = (v) =>
  String(v ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SS_MAX_LABELS_PER_PRINT = 500;

/** Compact pipe-delimited payload so any Code128 scanner dumps every field as plain text on scan. */
const buildSsBarcodeValue = (row, entryNo, seqLabel) => {
  const parts = [
    `WH:${row?.WH_CODE ?? '-'}`,
    `PLANT:${row?.PLANT ?? '-'}`,
    `LOC:${row?.STRO_LOC ?? '-'}`,
    `BIN:${row?.BIN ?? '-'}`,
    `MAT:${row?.MATERIAL_CODE ?? '-'}`,
    `BATCH:${row?.BATCH ?? '-'}`,
    `QTY:${row?.QUANTITY ?? '-'}`,
    `ENTRY:${entryNo ?? '-'}`,
    `SL:${seqLabel ?? '-'}`,
  ];
  return parts.join('|');
};

/** Renders a Code128 barcode into a detached SVG node so it can be serialized into the print window's HTML. */
const SS_BARCODE_OPTS = {
  format: 'CODE128',
  displayValue: false,
  fontSize: 9,
  height: 48,
  width:0.4,
  margin: 2,
};

const buildSsBarcodeSvgMarkup = (value) => {
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svgEl, value, SS_BARCODE_OPTS);
  return svgEl.outerHTML;
};

const ssDataColumns = [
  { name: "S.No", width: "70px", sortable: false, cell: (row, index) => (index != null ? index + 1 : '-') },
  { name: "WH CODE", selector: "WH_CODE", sortable: true, minWidth: "100px", wrap: false },
  { name: "WH NAME", selector: "WH_NAME", minWidth: "200px", wrap: true, sortable: true },
  { name: "PLANT", selector: "PLANT", sortable: true, minWidth: "100px", wrap: true },
  { name: "STRO LOC", selector: "STRO_LOC", sortable: true, minWidth: "100px", wrap: true },
  { name: "BIN", selector: "BIN", sortable: true, minWidth: "100px", wrap: true },
  { name: "MATERIAL CODE", selector: "MATERIAL_CODE", sortable: true, minWidth: "120px", wrap: true },
  { name: "MATERIAL NAME", selector: "MATERIAL_NAME", sortable: true, minWidth: "150px", wrap: true },
  { name: "BATCH", selector: "BATCH", sortable: true, minWidth: "120px", wrap: true },
  { name: "QUANTITY", selector: "QUANTITY", sortable: true, minWidth: "120px", wrap: true },
];

const SsStockReportData = ({ form, onSubmit }) => {
  const [warehouseoption, setWarehouseoption] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [lotoption, setLotoption] = useState([]);
  const [plantoption, setPlantoption] = useState([]);
  const [locationoption, setLocationoption] = useState([]);
  const [materialoption, setMaterialoption] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRow, setPrintRow] = useState(null);
  const [printedQtyInput, setPrintedQtyInput] = useState("1");
  const [entryNo, setEntryNo] = useState("");
  const barcodePreviewRef = useRef(null);

  const openPrintModal = (row) => {
    setPrintRow(row);
    setPrintedQtyInput("1");
    setEntryNo(`SS${Date.now()}`);
    setPrintModalOpen(true);
  };

  const closePrintModal = () => {
    setPrintModalOpen(false);
    setPrintRow(null);
    setPrintedQtyInput("1");
    setEntryNo("");
  };

  useEffect(() => {
    if (!printModalOpen || !printRow || !barcodePreviewRef.current) return;
    try {
      JsBarcode(barcodePreviewRef.current, buildSsBarcodeValue(printRow, entryNo, "L1"), SS_BARCODE_OPTS);
    } catch (e) {
      console.error(e);
    }
  }, [printModalOpen, printRow, entryNo]);

  const [binModalOpen, setBinModalOpen] = useState(false);
  const [binModalRow, setBinModalRow] = useState(null);
  const [binOptions, setBinOptions] = useState([]);
  const [selectedBinOption, setSelectedBinOption] = useState(null);
  const [binQtyInput, setBinQtyInput] = useState("");
  const [relottedRows, setRelottedRows] = useState([]);

  const openBinModal = (row) => {
    setBinModalRow(row);
    setSelectedBinOption(null);
    setBinQtyInput(row?.QUANTITY != null ? String(row.QUANTITY) : "");
    setBinOptions([]);
    setBinModalOpen(true);
    apiPostMethod(apiBaseUrl + "marketdata/master/getLotsSAP", {
      warehouseid: row?.WH_CODE,
      plantId: row?.PLANT,
      storagelocationid: row?.STRO_LOC,
    })
      .then((response) => {
        const { data } = response;
        if (data.success && Array.isArray(data.results)) setBinOptions(data.results);
      })
      .catch(() => errorToast("Failed to load bins for this location"));
  };

  const closeBinModal = () => {
    setBinModalOpen(false);
    setBinModalRow(null);
    setBinOptions([]);
    setSelectedBinOption(null);
    setBinQtyInput("");
  };

  const [binSubmitting, setBinSubmitting] = useState(false);

  const submitBinSelection = () => {
    if (!binModalRow) return;
    if (!selectedBinOption) {
      errorToast("Please select a bin.");
      return;
    }
    const maxQty = parseFloat(String(binModalRow.QUANTITY).replace(/,/g, ""));
    const typedQty = parseFloat(String(binQtyInput).replace(/,/g, ""));
    if (binQtyInput === "" || Number.isNaN(typedQty)) {
      errorToast("Please enter a valid quantity.");
      return;
    }
    if (typedQty <= 0) {
      errorToast("Quantity must be greater than 0.");
      return;
    }
    if (!Number.isNaN(maxQty) && typedQty > maxQty) {
      errorToast(`Quantity cannot be greater than available quantity (${maxQty}).`);
      return;
    }

    const newBin = selectedBinOption.label ?? selectedBinOption.value;
    const uom = binModalRow.UOM ?? binModalRow.MEINS ?? "";

    setBinSubmitting(true);
    apiPostMethod(apiBaseUrl + "marketdata/master/submitRelot", {
      row: {
        wh_code: binModalRow.WH_CODE,
        wh_name: binModalRow.WH_NAME,
        material: binModalRow.MATERIAL_CODE,
        material_name: binModalRow.MATERIAL_NAME,
        plant: binModalRow.PLANT,
        stoloc: binModalRow.STRO_LOC,
        batch: binModalRow.BATCH,
        quantity: typedQty,
        uom,
        from_lot: binModalRow.BIN,
        to_lot: newBin,
      },
    })
      .then((response) => {
        const data = response?.data || {};
        const historyRow = {
          WH_CODE: binModalRow.WH_CODE,
          WH_NAME: binModalRow.WH_NAME,
          PLANT: binModalRow.PLANT,
          STRO_LOC: binModalRow.STRO_LOC,
          MATERIAL_CODE: binModalRow.MATERIAL_CODE,
          MATERIAL_NAME: binModalRow.MATERIAL_NAME,
          BATCH: binModalRow.BATCH,
          UOM: uom,
          OLD_BIN: binModalRow.BIN,
          NEW_BIN: newBin,
          QTY: typedQty,
        };
        if (data.success) {
          ShowToast(data.message || "Submitted to SAP successfully");
          setRelottedRows((prev) => [
            ...prev,
            { ...historyRow, SAP_STATUS: "SUBMITTED", SAP_MESSAGE: data.message || "", HISTORY_ID: data.id || null },
          ]);
          closeBinModal();
        } else {
          errorToast(data.message || "Failed to submit to SAP");
          setRelottedRows((prev) => [...prev, { ...historyRow, SAP_STATUS: "FAILED", SAP_MESSAGE: data.message || "" }]);
        }
        
      })
      .catch(() => errorToast("Something went wrong, please try again after sometime"))
      .finally(() => setBinSubmitting(false));
  };

  const [removingRelotIndex, setRemovingRelotIndex] = useState(-1);

  const removeRelottedRow = (row, rowIndex) => {
    confirmDialog({
      title: "Are you sure you want to remove this bin selection?",
      description: row?.SAP_STATUS === "SUBMITTED" ? "This was already submitted to SAP; the saved record will also be deleted." : undefined,
    }).then((confirmed) => {
      if (!confirmed) return;

      if (row?.SAP_STATUS === "SUBMITTED" && row?.HISTORY_ID) {
        setRemovingRelotIndex(rowIndex);
        apiPostMethod(apiBaseUrl + "marketdata/master/deleteRelot", { id: row.HISTORY_ID })
          .then((response) => {
            const data = response?.data || {};
            if (data.success) {
              ShowToast(data.message || "Removed successfully");
              setRelottedRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
            } else {
              errorToast(data.message || "Failed to remove on the backend");
            }
          })
          .catch(() => errorToast("Something went wrong, please try again after sometime"))
          .finally(() => setRemovingRelotIndex(-1));
      } else {
        setRelottedRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
      }
    });
  };

  const [submittingRelotIndex, setSubmittingRelotIndex] = useState(-1);

  const submitRelotRow = (row, rowIndex) => {
    setSubmittingRelotIndex(rowIndex);
    apiPostMethod(apiBaseUrl + "marketdata/master/submitRelot", {
      row: {
        wh_code: row.WH_CODE,
        wh_name: row.WH_NAME,
        material: row.MATERIAL_CODE,
        material_name: row.MATERIAL_NAME,
        plant: row.PLANT,
        stoloc: row.STRO_LOC,
        batch: row.BATCH,
        quantity: row.QTY,
        uom: row.UOM,
        from_lot: row.OLD_BIN,
        to_lot: row.NEW_BIN,
      },
    })
      .then((response) => {
        const data = response?.data || {};
        if (data.success) {
          ShowToast(data.message || "Submitted to SAP successfully");
          setRelottedRows((prev) =>
            prev.map((r, idx) =>
              idx === rowIndex ? { ...r, SAP_STATUS: "SUBMITTED", SAP_MESSAGE: data.message || "", HISTORY_ID: data.id || null } : r
            )
          );
        } else {
          errorToast(data.message || "Failed to submit to SAP");
          setRelottedRows((prev) =>
            prev.map((r, idx) => (idx === rowIndex ? { ...r, SAP_STATUS: "FAILED", SAP_MESSAGE: data.message || "" } : r))
          );
        }
      })
      .catch(() => errorToast("Something went wrong, please try again after sometime"))
      .finally(() => setSubmittingRelotIndex(-1));
  };

  const relotColumns = useMemo(
    () => [
      { name: "S.No", width: "70px", sortable: false, cell: (row, index) => (index != null ? index + 1 : "-") },
      { name: "WH CODE", selector: "WH_CODE", sortable: true, minWidth: "100px" },
      { name: "PLANT", selector: "PLANT", sortable: true, minWidth: "100px" },
      { name: "STRO LOC", selector: "STRO_LOC", sortable: true, minWidth: "100px" },
      { name: "MATERIAL", selector: "MATERIAL_NAME", sortable: true, minWidth: "150px", wrap: true },
      { name: "BATCH", selector: "BATCH", sortable: true, minWidth: "100px" },
      { name: "OLD BIN", selector: "OLD_BIN", sortable: true, minWidth: "100px" },
      { name: "NEW BIN", selector: "NEW_BIN", sortable: true, minWidth: "100px" },
      { name: "QTY", selector: "QTY", sortable: true, minWidth: "100px" },
      {
        name: "SAP STATUS",
        selector: "SAP_STATUS",
        sortable: false,
        minWidth: "110px",
        center: true,
        cell: (row) =>
          row.SAP_STATUS === "SUBMITTED" ? (
            <span className="badge badge-success">Submitted</span>
          ) : row.SAP_STATUS === "FAILED" ? (
            <span className="badge badge-danger" title={row.SAP_MESSAGE}>Failed</span>
          ) : (
            <span className="badge badge-secondary">Pending</span>
          ),
      },
      {
        name: "ACTIONS",
        selector: "_relotActions",
        sortable: false,
        minWidth: "180px",
        center: true,
        cell: (row, index) => (
          <div className="d-flex" style={{ gap: "0.4rem" }}>
            <Button.Ripple
              type="button"
              color="success"
              outline
              size="sm"
              disabled={row.SAP_STATUS === "SUBMITTED" || submittingRelotIndex === index}
              onClick={() => submitRelotRow(row, index)}
            >
              {submittingRelotIndex === index ? "Submitting..." : "Submit"}
            </Button.Ripple>
            <Button.Ripple
              type="button"
              color="danger"
              outline
              size="sm"
              disabled={submittingRelotIndex === index || removingRelotIndex === index}
              onClick={() => removeRelottedRow(row, index)}
            >
              {removingRelotIndex === index ? "Removing..." : <Trash2 size={14} />}
            </Button.Ripple>
          </div>
        ),
      },
    ],
    [submittingRelotIndex, removingRelotIndex]
  );

  const runPrintLabel = () => {
    if (!printRow) return;
    const maxQty = parseFloat(String(printRow.QUANTITY).replace(/,/g, ""));
    const labelCountParsed = parseInt(String(printedQtyInput).trim(), 10);
    if (!Number.isFinite(labelCountParsed) || labelCountParsed < 1) {
      errorToast("Please enter how many labels you need (at least 1).");
      return;
    }
    if (!Number.isNaN(maxQty) && labelCountParsed > maxQty) {
      errorToast(`Printed qty cannot be greater than available quantity (${maxQty}).`);
      return;
    }
    if (labelCountParsed > SS_MAX_LABELS_PER_PRINT) {
      errorToast(`You can print at most ${SS_MAX_LABELS_PER_PRINT} labels at once.`);
      return;
    }
    const labelCount = labelCountParsed;

    let labelsHtml = "";
    try {
      labelsHtml = Array.from({ length: labelCount }, (_, idx) => {
        const seqLabel = `L${idx + 1}`;
        const barcodeSvg = buildSsBarcodeSvgMarkup(buildSsBarcodeValue(printRow, entryNo, seqLabel));
        return `<div class="label-wrap">
      <div class="label-70x60">
        <table class="label-table" role="table" aria-label="S&amp;S stock label details">
          <thead>
            <tr><th colspan="2">${escapeHtmlLabel(printRow.MATERIAL_CODE)} — ${escapeHtmlLabel(printRow.MATERIAL_NAME)}</th></tr>
          </thead>
          <tbody>
            
            <tr><th>Bin</th><td>${escapeHtmlLabel(printRow.BIN)}</td></tr>
            <tr><th>Batch</th><td>${escapeHtmlLabel(printRow.BATCH)}</td></tr>
            <tr><th>Quantity</th><td>${escapeHtmlLabel(printRow.QUANTITY)}</td></tr>
            <tr><th>Entry No</th><td>${escapeHtmlLabel(entryNo)}</td></tr>
            <tr><th>Serial No</th><td>${escapeHtmlLabel(seqLabel)}</td></tr>
          </tbody>
        </table>
        <div class="label-barcode">${barcodeSvg}</div>
      </div>
    </div>`;
      }).join("");
    } catch (e) {
      console.error(e);
      errorToast("Could not generate barcode. Please try again.");
      return;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>S&amp;S Stock Label</title>
    <style>
    *{box-sizing:border-box;}
    html,body{margin:0;padding:0;}
    body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111;background:#e5e7eb;padding:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .label-wrap{margin-bottom:12px;display:flex;justify-content:center;}
    .label-70x60{width:70mm;height:60mm;max-width:70mm;max-height:60mm;margin:0 auto;background:#fff;overflow:hidden;padding-top:1mm;}
    .label-table{width:100%;border-collapse:collapse;background:#fff;font-size:6.4pt;}
    .label-table th,.label-table td{border:0.1mm solid #222;padding:0.8px 3px;text-align:left;vertical-align:middle;line-height:1.15;}
    .label-table thead th{font-weight:800;padding:2px 4px;font-size:7.6pt;color:#0b1220;}
    .label-table tbody th{width:19mm;color:#0b1220;font-weight:800;text-transform:uppercase;font-size:6.4pt;}
    .label-table tbody td{color:#0b1220;font-weight:800;font-size:6.4pt;}
    .label-barcode{margin-top:0.8mm;text-align:center;line-height:0;}
    .label-barcode svg{width:auto;max-width:100%;height:15mm;}
    @media print{
    @page{margin:0;size:70mm 60mm;}
    body{background:#fff;padding:0;}
    .label-wrap{break-inside:avoid;page-break-after:always;margin-bottom:0;}
    .label-wrap:last-child{page-break-after:auto;}
    .label-table th,.label-table td{-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#0b1220;}
    }
    </style></head><body>
    ${labelsHtml}
    </body></html>`;

    const win = window.open("", "_blank", "width=360,height=460");
    if (!win) {
      errorToast("Please allow pop-ups to print.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    closePrintModal();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  };

  const tableColumns = useMemo(
    () => [
      ...ssDataColumns,
      {
        name: "PRINT",
        selector: "_ssPrint",
        sortable: false,
        minWidth: "100px",
        center: true,
        cell: (row) => (
          <Button.Ripple type="button" color="info" outline size="sm" onClick={() => openPrintModal(row)}>
            <Printer size={14} className="mr-50" />
            Print
          </Button.Ripple>
        ),
      },
      {
        name: "Relotting Bin",
        selector: "_ssBin",
        sortable: false,
        minWidth: "120px",
        center: true,
        cell: (row) => (
          <Button.Ripple type="button" color="warning" outline size="sm" onClick={() => openBinModal(row)}>
            Select Bin
          </Button.Ripple>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    apiPostMethod(apiBaseUrl + "marketdata/master/getWarehousesByUserId", {})
      .then((response) => {
        const { data } = response;
        if (data.success && Array.isArray(data.results)) {
          setWarehouseoption(data.results);
        } else {
          console.warn("SsStockReport: no warehouses or invalid response", data);
        }
      })
      .catch((err) => {
        console.error("SsStockReport: load warehouses failed", err);
        errorToast("Failed to load warehouses");
      });
  }, []);

  const onWarehouseChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('warehouseid', { label, value });
    FillPlantList(value);
    ClearDropdown("WH");
    ClearDropdown("LOCATION");
    ClearDropdown("SL");
  };
  const onPlantchange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantId', { label, value });
    FillStorageLocationFromWarehouse(value);
    FillLotList(value);
    ClearDropdown("LOCATION");
    ClearDropdown("SL");
  };
  const onStorageLocationchange = (e) => {
    const { value, label } = e;
    form.setFieldValue('storagelocationid', { label, value });
    FillLotList(value);
    ClearDropdown("SL");
  };
  const FillLotList = (value) => {
    const v = form.values;
    const wh = v.warehouseid?.value ?? v.warehouseid;
    const plantVal = v.plantId?.value ?? v.plantId;
    const plantLabel = v.plantId?.label ?? plantVal;
    const locVal = value;
    const locLabel = value;
    
     const fdata = { warehouseid: wh, plantId: plantLabel, storagelocationid: locLabel };
    apiPostMethod(apiBaseUrl + 'marketdata/master/getLotsSAP', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) setLotoption([{ options: data.results }]);
      })
      .catch(() => errorToast("Something went wrong please try again after sometime"));
  };

  const OnLotChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('lotid', { label, value });
    ClearDropdown("LOT");
    loadMaterialOptions(value);
  };

  const loadMaterialOptions = (lotIdFromChange) => {
    const v = form.values;
    const wh = v.warehouseid?.value ?? v.warehouseid;
    const plantVal = v.plantId?.value ?? v.plantId;
    const plantLabel = v.plantId?.label ?? plantVal;
    const locVal = v.storagelocationid?.value ?? v.storagelocationid;
    const locLabel = v.storagelocationid?.label ?? locVal;
    const lot = lotIdFromChange ?? v.lotid?.value ?? v.lotid;
    if (!wh || !plantVal || !locVal || !lot) {
      setMaterialoption([]);
      return;
    }
    const fdata = { warehouseid: wh, plantId: plantLabel, storagelocationid: locLabel, lotId: lot };
    apiPostMethod(apiBaseUrl + "marketdata/master/getMaterialListSAP", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) setMaterialoption([{ options: data.results }]);
        // setMaterialoption([{ options: materials }]);
       })
      .catch(() => {
        setMaterialoption([]);
        errorToast("Failed to load materials");
      });
  };

  const FillPlantList = (warehouseid) => {
    const fdata = { WH_CODE: warehouseid, screentype: "Warehousewisestocks" };
    apiPostMethod(apiBaseUrl + 'marketdata/master/getPlantsSAP', fdata)
      .then((response) => {
                    
          setPlantoption([{ options: response.data.results }]);
      })
      .catch(() => errorToast("Something went wrong, please try again after sometime"));
  };
  const FillStorageLocationFromWarehouse = (plantId) => {
     const v = form.values;
    const wh = v.warehouseid?.value ?? v.warehouseid;
    const plantVal = v.plantId?.value ?? v.plantId;
    const plantLabel = v.plantId?.label ?? plantVal;
  
    
    const fdata = { warehouseid: wh, plantId: plantLabel}
    apiPostMethod(apiBaseUrl + 'marketdata/master/getStorageLocationsSAP', fdata)
      .then((response) => {
        if (response.data?.success) setLocationoption([{ options: response.data.results }]);
      })
      .catch(() => errorToast("Something went wrong, please try again after sometime"));
  };

  const showReport = () => {
    const v = form.values;
    const whCode = v.warehouseid?.value ?? v.warehouseid ?? '';
    const plant = v.plantId?.label ?? v.plantId?.value ?? v.plantId ?? '';
    const stroLoc = v.storagelocationid?.label ?? v.storagelocationid?.value ?? v.storagelocationid ?? '';
    const bin = v.lotid?.value ?? v.lotid?.label ?? v.lotid ?? '';
    const material = v.materialid?.value ?? v.materialid?.label ?? v.materialid ?? '';
    const fdata = { wh_code: whCode, plant, stro_loc: stroLoc, bin, material };
    showLoader();
    apiPostMethod(apiBaseUrl + "marketdata/master/getMaterialList", fdata)
      .then((response) => {
        const results = response.data?.results ?? (Array.isArray(response.data) ? response.data : []);
        form.setValues({ ...form.values, CheckList: results });
        setLastFetchedAt(new Date());
      })
      .catch(() => errorToast("Something went wrong, please try again after sometime"))
      .finally(() => hideLoader());
  };

  const ClearDropdown = (Item) => {
    if (Item === "WH") {
      form.setFieldValue('plantId', '');
      setMaterialoption([]);
      form.setFieldValue('materialid', '');
    } else if (Item === "SL") {
      form.setFieldValue('lotid', '');
      setMaterialoption([]);
      form.setFieldValue('materialid', '');
    } else if (Item === "LOCATION") {
      form.setFieldValue('storagelocationid', '');
      setMaterialoption([]);
      form.setFieldValue('materialid', '');
    }
  };

  const onMaterialChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('materialid', { label, value });
  };

  const clearFilters = () => {
    form.setValues({
      ...form.values,
      warehouseid: '',
      plantId: '',
      storagelocationid: '',
      lotid: '',
      materialid: '',
      CheckList: [],
    });
    setPlantoption([]);
    setLocationoption([]);
    setLotoption([]);
    setMaterialoption([]);
    setLastFetchedAt(null);
  };

  const getFilterSummary = () => {
    const v = form.values;
    const parts = [];
    const wh = v.warehouseid?.label ?? v.warehouseid?.value ?? v.warehouseid;
    if (wh) parts.push(`Warehouse: ${wh}`);
    const plant = v.plantId?.label ?? v.plantId?.value ?? v.plantId;
    if (plant) parts.push(`Plant: ${plant}`);
    const loc = v.storagelocationid?.label ?? v.storagelocationid?.value ?? v.storagelocationid;
    if (loc) parts.push(`Storage Location: ${loc}`);
    const lot = v.lotid?.label ?? v.lotid?.value ?? v.lotid;
    if (lot) parts.push(`Lot: ${lot}`);
    const mat = v.materialid?.label ?? v.materialid?.value ?? v.materialid;
    if (mat) parts.push(`Material: ${mat}`);
    return parts.length ? parts.join(' | ') : 'All filters';
  };

  const exportToCsv = () => {
    const list = form.values.CheckList ?? [];
    if (!list.length) {
      errorToast('No data to export. Run Show first.');
      return;
    }
    const headers = ssDataColumns.map((c) => c.name);
    const keys = ssDataColumns.map((c) => c.selector);
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      filename: `S&S_Stock_Report_${new Date().toISOString().slice(0, 10)}`,
      useTextFile: false,
      useBom: true,
      headers,
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(list.map((row, idx) => {
      const obj = {};
      keys.forEach((key, i) => { obj[headers[i]] = key != null ? (row[key] ?? '') : (idx + 1); });
      return obj;
    }));
  };

  const exportToExcel = () => {
    const list = form.values.CheckList ?? [];
    if (!list.length) {
      errorToast('No data to export. Run Show first.');
      return;
    }
    const keys = ssDataColumns.map((c) => c.selector);
    const headers = ssDataColumns.map((c) => c.name);
    const rows = [headers, ...list.map((row) => keys.map((k) => row[k] ?? ''))];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'S&S Stock Report');
    XLSX.writeFile(wb, `S&S_Stock_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPdf = () => {
    const list = form.values.CheckList ?? [];
    if (!list.length) {
      errorToast('No data to export. Run Show first.');
      return;
    }
    const keys = ssDataColumns.map((c) => c.selector);
    const headers = ssDataColumns.map((c) => c.name);
    const thead = '<tr>' + headers.map((h) => `<th style="border:1px solid #ddd;padding:6px;text-align:left">${escapeHtml(h)}</th>`).join('') + '</tr>';
    const rows = list.map((row, idx) => '<tr>' + keys.map((k, i) => `<td style="border:1px solid #ddd;padding:6px">${escapeHtml(String(k != null ? (row[k] ?? '') : (idx + 1)))}</td>`).join('') + '</tr>').join('');
    const tableHtml = '<table style="border-collapse:collapse;width:100%;font-size:12px"><thead>' + thead + '</thead><tbody>' + rows + '</tbody></table>';
    const title = 'S & S Stock Report';
    const filters = getFilterSummary();
    const printHtml = `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Verdana,sans-serif;margin:16px}h1{font-size:18px;margin-bottom:8px}.filters{margin-bottom:12px;color:#555}</style></head><body><h1>${escapeHtml(title)}</h1><p class="filters">Filters: ${escapeHtml(filters)}</p><p class="filters">Generated: ${new Date().toLocaleString()}</p>${tableHtml}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
      errorToast('Please allow pop-ups to print / save as PDF.');
      return;
    }
    win.document.write(printHtml);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  };

  function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const checkList = form.values.CheckList ?? [];
  const hasData = Array.isArray(checkList) && checkList.length > 0;
  const totalQty = hasData
    ? checkList.reduce((sum, row) => sum + (parseFloat(row.QUANTITY) || 0), 0)
    : 0;

  return (
    <Fragment>
      <Card className="mb-2" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
        <CardBody className="py-2">
          <h6 className="text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters</h6>
          <Row>
            <Col md="3" sm="12">
              <CustomDropdownInput label="Warehouse Name" form={form} id="warehouseid" options={warehouseoption} onChange={onWarehouseChange} />
              <span id='warehouseid_Error' style={{ color: 'red' }} />
            </Col>
            <Col md="3" sm="12">
              <CustomDropdownInput label="Plant" form={form} id="plantId" onChange={onPlantchange} options={plantoption} />
              <span id='locationid_Error' style={{ color: 'red' }} />
            </Col>
            <Col md="3" sm="12">
              <CustomDropdownInput label="Storage Location" form={form} id="storagelocationid" options={locationoption} onChange={onStorageLocationchange} />
              <span id='locationid_Error' style={{ color: 'red' }} />
            </Col>
            <Col md="3" sm="12">
              <CustomDropdownInput label="Lot No" form={form} id="lotid" options={lotoption} onChange={OnLotChange} />
              <span id='lotid_Error' style={{ color: 'red' }} />
            </Col>
            <Col md="3" sm="12">
              <CustomDropdownInput label="Material Name" form={form} id="materialid" options={materialoption} onChange={onMaterialChange} />
              <span id='materialid_Error' style={{ color: 'red' }} />
            </Col>
          </Row>
          <Row className="align-items-center mt-2">
            <Col md="12" sm="12" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              <ButtonGroup className="mr-2">
                <Button.Ripple onClick={showReport} color="primary" type="button" size="sm">
                  <Search size={14} className="mr-50" />
                  Show
                </Button.Ripple>&nbsp;
                <Button.Ripple onClick={clearFilters} color="secondary" type="button" size="sm">
                  <Trash2 size={14} className="mr-50" />
                  Clear
                </Button.Ripple>&nbsp;
              </ButtonGroup>
              <ButtonGroup className="ml-auto" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Button.Ripple onClick={exportToCsv} color="success" type="button" outline size="sm">
                  <Download size={14} className="mr-50" />
                  CSV
                </Button.Ripple>
                <Button.Ripple onClick={exportToExcel} color="success" type="button" outline size="sm">
                  <FileText size={14} className="mr-50" />
                  Excel
                </Button.Ripple>
                <Button.Ripple onClick={exportToPdf} color="info" type="button" outline size="sm">
                  <Printer size={14} className="mr-50" />
                  PDF
                </Button.Ripple>
              </ButtonGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {hasData && (
        <Row className="mb-2">
          <Col md="12">
            <div
              className="d-flex flex-wrap align-items-stretch"
              style={{
                gap: '0.75rem',
                backgroundColor: '#f0f4f8',
                border: '1px solid #d4dae0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  minWidth: '120px',
                }}
              >
                <FileText size={18} className="text-primary mr-2" style={{ flexShrink: 0 }} />
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Records</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{checkList.length}</div>
                </div>
              </div>
              {totalQty > 0 && (
                <div
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    minWidth: '180px',
                  }}
                >
                  <Package size={18} className="text-success mr-2" style={{ flexShrink: 0 }} />
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total quantity</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{totalQty.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              )}
              {lastFetchedAt && (
                <div
                  className="d-flex align-items-center ml-auto"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    minWidth: '200px',
                  }}
                >
                  <Clock size={18} className="text-info mr-2" style={{ flexShrink: 0 }} />
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data as of</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lastFetchedAt.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}

      <Card>
        <CardBody className="p-0">
          {hasData ? (
            <div style={{ overflowX: 'auto', fontSize: '12px' }}>
              <TableComponent columns={tableColumns} data={checkList} />
            </div>
          ) : (
            <div className="text-center py-5 text-muted" style={{ minHeight: '120px' }}>
              <FileText size={40} className="mb-2" style={{ opacity: 0.5 }} />
              <p className="mb-0">No data to display. Select filters and click <strong>Show</strong> to load S&amp;S stock from SAP.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* {relottedRows.length > 0 && (
        <Card className="mt-2">
          <CardBody className="p-0">
            <h6 className="text-muted p-2 mb-0" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bin Selections</h6>
            <div style={{ overflowX: 'auto', fontSize: '12px' }}>
              <TableComponent columns={relotColumns} data={relottedRows} />
            </div>
          </CardBody>
        </Card>
      )} */}

      <Modal isOpen={binModalOpen} toggle={closeBinModal} centered>
        <ModalHeader toggle={closeBinModal}>Select Bin</ModalHeader>
        <ModalBody>
          {binModalRow && (
            <>
              <div className="mb-3" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {[
                  ['WH Code', binModalRow.WH_CODE],
                  ['Plant', binModalRow.PLANT],
                  ['Storage Location', binModalRow.STRO_LOC],
                  ['Current Bin', binModalRow.BIN],
                  ['Material', `${binModalRow.MATERIAL_CODE ?? '—'} - ${binModalRow.MATERIAL_NAME ?? '—'}`],
                  ['Batch', binModalRow.BATCH],
                  ['Available Qty', binModalRow.QUANTITY],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="d-flex justify-content-between"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9' }}
                  >
                    <span className="text-muted" style={{ fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
                  </div>
                ))}
              </div>
              <FormGroup>
                <Label>New Bin</Label>
                <DropdownControl
                  options={binOptions}
                  selectedValue={selectedBinOption}
                  onDdlChange={(val) => setSelectedBinOption(val)}
                  placeholder="Select bin"
                />
              </FormGroup>
              <FormGroup>
                <Label for="ss-bin-qty">
                  Quantity <span className="text-muted font-weight-normal">(available {binModalRow.QUANTITY ?? '—'})</span>
                </Label>
                <Input
                  id="ss-bin-qty"
                  type="number"
                  step="any"
                  min="0"
                  value={binQtyInput}
                  onChange={(e) => setBinQtyInput(e.target.value)}
                  placeholder="e.g. 25"
                />
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={closeBinModal} disabled={binSubmitting}>
            Cancel
          </Button>
          <Button color="primary" onClick={submitBinSelection} disabled={binSubmitting}>
            {binSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={printModalOpen} toggle={closePrintModal} centered>
        <ModalHeader toggle={closePrintModal}>Print Stock Label</ModalHeader>
        <ModalBody>
          {printRow && (
            <>
              <div className="mb-3" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {[
                  ['WH Code', printRow.WH_CODE],
                  ['WH Name', printRow.WH_NAME],
                  ['Plant', printRow.PLANT],
                  ['Storage Location', printRow.STRO_LOC],
                  ['Bin', printRow.BIN],
                  ['Material', `${printRow.MATERIAL_CODE ?? '—'} - ${printRow.MATERIAL_NAME ?? '—'}`],
                  ['Batch', printRow.BATCH],
                  ['Available Qty', printRow.QUANTITY],
                  ['Entry No', entryNo],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="d-flex justify-content-between"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9' }}
                  >
                    <span className="text-muted" style={{ fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
                  </div>
                ))}
              </div>
              <FormGroup>
                <Label for="ss-print-qty">
                  Printed Qty (No. of labels){" "}
                  <span className="text-muted font-weight-normal">(available {printRow.QUANTITY ?? '—'})</span>
                </Label>
                <Input
                  id="ss-print-qty"
                  type="number"
                  step="1"
                  min="1"
                  value={printedQtyInput}
                  onChange={(e) => setPrintedQtyInput(e.target.value)}
                  placeholder="e.g. 5"
                />
                <small className="text-muted d-block mt-1">
                  Each unit printed gets its own label, numbered Serial No L1, L2, L3…
                </small>
              </FormGroup>
              <div className="text-center py-2" style={{ border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                <svg ref={barcodePreviewRef}></svg>
              </div>
              <small className="text-muted d-block mt-2">
                Scanning any printed barcode returns all label fields (WH, plant, location, bin, material, batch, entry no, serial no) as plain text.
              </small>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={closePrintModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={runPrintLabel}>
            <Printer size={14} className="mr-50" />
            Print
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

const SSRelotting = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() {},
  });
  return (
    <Fragment>
      <CardComponent header="Stock Report">
        <SsStockReportData form={form} onSubmit={() => {}} />
      </CardComponent>
    </Fragment>
  );
};

export default SSRelotting;
