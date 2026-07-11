import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Row,
    FormGroup,
    Col,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
} from "reactstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ElapsedTimer } from "../../../common/ElapsedTimer";
import { useSelector } from "react-redux";
// import OverAllDetails from "../../../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown, Printer } from "react-feather";
import ReactSelect from "react-select";
import RecieptEntryScreenDetails from "./RecieptEntryScreenDetails";

let qrModulesPromise = null;
const loadQrModules = () => {
    if (!qrModulesPromise) {
        qrModulesPromise = Promise.all([
            import(/* webpackChunkName: "qr-code" */ "qr.js/lib/QRCode"),
            import(/* webpackChunkName: "qr-code" */ "qr.js/lib/ErrorCorrectLevel"),
        ]).then(([QRMod, ECMod]) => {
            const QRCodeImpl = QRMod.default ?? QRMod;
            const ErrorCorrectLevel = ECMod.default ?? ECMod;
            return { QRCodeImpl, ErrorCorrectLevel };
        });
    }
    return qrModulesPromise;
};

const formatRowDateForPrint = (row) => {
    const raw =
        row?.postingDate ||
        row?.invoiceDate ||
        row?.createdAt ||
        row?.mgApprovedAt ||
        "";
    if (!raw) return "—";
    const m = moment(raw);
    return m.isValid() ? m.format("DD-MM-YYYY HH:mm") : String(raw);
};

const escapeHtml = (v) =>
    String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

/** BIN is stored as `lotNo` on receipt lines (see receipt entry screen). */
const pickMigoBin = (row) => {
    const v =
        row?.lotNo ??
        row?.LOT_NO ??
        row?.bin ??
        row?.BIN ??
        row?.storageBin ??
        row?.STORAGE_BIN;
    return v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "—";
};

const pickMigoBatch = (row) => {
    const v = row?.batchCode ?? row?.batch_code ?? row?.BATCH;
    return v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "—";
};

/** Compact payload for label QR (print / scan). */
const MIGO_MAX_LABELS_PER_PRINT = 500;

const buildMigoQrPayload = (
    materialCode,
    materialDesc,
    poNumber,
    grnNo,
    dateStr,
    grnQtyVal,
    binVal,
    batchVal,
    entryNo,
    labelSeq = 1,
    labelTotal = 1
) => {
    const payload = {
        type: "MIGO",
        mc: String(materialCode).slice(0, 48),
        md: String(materialDesc).slice(0, 96),
        po: String(poNumber).slice(0, 24),
        grn: String(grnNo).slice(0, 24),
        qty: grnQtyVal,
        grnQty: grnQtyVal,
        dt: String(dateStr).slice(0, 32),
        bin: String(binVal ?? "—").slice(0, 32),
        batch: String(batchVal ?? "—").slice(0, 48),
        entryNo: String(entryNo ?? "—").slice(0, 24),
    };
    const total = Number(labelTotal) || 1;
    const seq = Number(labelSeq) || 1;
    if (total > 1) {
        payload.labelSeq = seq;
        payload.labelTotal = total;
    }
    return JSON.stringify(payload);
};

/** Map ecc name for smaller QR on 30×30 mm labels (L = fewer modules). */
const migoQrEcLevel = (ErrorCorrectLevel, name) => {
    const n = String(name || "Q").toUpperCase();
    if (n === "L") return ErrorCorrectLevel.L;
    if (n === "M") return ErrorCorrectLevel.M;
    if (n === "H") return ErrorCorrectLevel.H;
    return ErrorCorrectLevel.Q;
};

/** Pure SVG string; qr.js loaded on demand so the report route stays light. */
const buildMigoPrintQrSvg = async (payload, pixelSize = 56, eccName = "Q") => {
    const { QRCodeImpl, ErrorCorrectLevel } = await loadQrModules();
    const size = pixelSize;
    const qrcode = new QRCodeImpl(-1, migoQrEcLevel(ErrorCorrectLevel, eccName));
    qrcode.addData(payload);
    qrcode.make();
    const cells = qrcode.modules;
    const viewBoxSize = cells.length;
    const bgD = cells
        .map((row, rowIndex) =>
            row.map((cell, cellIndex) => (!cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "")).join(" ")
        )
        .join(" ");
    const fgD = cells
        .map((row, rowIndex) =>
            row.map((cell, cellIndex) => (cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "")).join(" ")
        )
        .join(" ");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"><path fill="#FFFFFF" d="${bgD}"/><path fill="#000000" d="${fgD}"/></svg>`;
};

const RecieptEntryReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    // const history = useHistory();

    // const actionsCol = {
    //     name: "Invoice Copy",
    //     selector: "status",
    //     minWidth: "250px",
    //     cell: (row) => {
    //         return actionRendorer ? (
    //             actionRendorer(row)
    //         ) : (
    //             <Row>&nbsp;&nbsp;
    //             <a target="_blank" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
    //                 <Button outline color="success" type="button">
    //                     Invoice Copy 
    //                 </Button>
    //             </a>&nbsp;
    //             {row?.extraAttachments &&
    //             <a target="_blank" href={row.extraAttachments}>
    //                 <Button outline color="success" type="button">
    //                     Other Copy 
    //                 </Button>
    //             </a>}
    //             </Row>
    //         );
    //     },
    // };

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [poNumbers, setPoNumbers] = useState('')

    const overAllDetails = (gateInOutInfoId,poNumbers) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
        setPoNumbers(poNumbers)

    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    // useEffect(() => {
    //     getLoadingData()
    // }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0
        let poTypes = poTypeId != '' ? poTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/ReceiptDetailReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results;
                        setLandingData(stoData);
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData([])
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const [moduleTypeData, setModuleTypeData] = useState([])
    const [moduleType, setModuleType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState('');

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
    }

    const getModuleType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setModuleTypeData(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }


    const [poTypeData, setPoTypeData] = useState([])
    const [poType, setPoType] = useState('');
    const [poTypeId, setPoTypeId] = useState('');

    const selectPoType = (e) => {
        const id = e.value;
        setPoTypeId(id)
        setPoType([e])
    }

    const getPoType = (module_type) => {
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        console.log(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
        apiGetMethod(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
                    console.log(data.results)
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        // getPoType()
        getModuleType()
    }, [])

    const [reportTaColumns, setReportTaColumns] = useState(null);
    useEffect(() => {
        let cancelled = false;
        import(
            /* webpackChunkName: "migo-report-columns" */ "./RecieptEntryReportColumns"
        )
            .then((mod) => {
                if (!cancelled) setReportTaColumns(mod.taColumns);
            })
            .catch((err) => {
                console.error(err);
                errorToast("Could not load report table layout. Refresh the page.");
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printRow, setPrintRow] = useState(null);
    const [printQtyInput, setPrintQtyInput] = useState("");
    const [labelCountInput, setLabelCountInput] = useState("1");
    const [printQrPreview, setPrintQrPreview] = useState("");
    const [printQrPreviewLoading, setPrintQrPreviewLoading] = useState(false);

    useEffect(() => {
        if (!printModalOpen || !printRow) {
            setPrintQrPreview("");
            setPrintQrPreviewLoading(false);
            return;
        }
        let cancelled = false;
        setPrintQrPreviewLoading(true);
        const qtyPreviewRaw = parseFloat(String(printQtyInput).replace(/,/g, ""));
        const qtyForQr = Number.isFinite(qtyPreviewRaw)
            ? qtyPreviewRaw
            : parseFloat(String(printRow.receivedQty).replace(/,/g, "")) || 0;
        const rawLabels = parseInt(String(labelCountInput).trim(), 10);
        const labelTotal =
            Number.isFinite(rawLabels) && rawLabels >= 1
                ? Math.min(MIGO_MAX_LABELS_PER_PRINT, rawLabels)
                : 1;
        buildMigoPrintQrSvg(
            buildMigoQrPayload(
                printRow.material ?? "—",
                printRow.materialDescription ?? "—",
                printRow.poNumber ?? "—",
                printRow.migoNumber ?? printRow.grnNo ?? printRow.GRN_NO ?? "—",
                formatRowDateForPrint(printRow),
                qtyForQr,
                pickMigoBin(printRow),
                pickMigoBatch(printRow),
                printRow.serialNo ?? printRow.id ?? "",
                1,
                labelTotal
            ),
            48
        )
            .then((svg) => {
                if (!cancelled) setPrintQrPreview(svg);
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setPrintQrPreview("");
            })
            .finally(() => {
                if (!cancelled) setPrintQrPreviewLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [printModalOpen, printRow, printQtyInput, labelCountInput]);

    const openPrintModal = useCallback((row) => {
        setPrintRow(row);
        const rq = row?.receivedQty;
        setPrintQtyInput(rq !== undefined && rq !== null && rq !== "" ? String(rq) : "");
        setLabelCountInput("1");
        setPrintModalOpen(true);
    }, []);

    const closePrintModal = () => {
        setPrintModalOpen(false);
        setPrintRow(null);
        setPrintQtyInput("");
        setLabelCountInput("1");
    };

    const runBrowserPrint = async () => {
        if (!printRow) return;
        const maxReceived = parseFloat(String(printRow.receivedQty).replace(/,/g, ""));
        const typed = parseFloat(String(printQtyInput).replace(/,/g, ""));
        if (printQtyInput === "" || Number.isNaN(typed)) {
            errorToast("Please enter a valid GRN quantity.");
            return;
        }
        if (typed < 0) {
            errorToast("GRN quantity cannot be negative.");
            return;
        }
        if (Number.isNaN(maxReceived)) {
            errorToast("Received quantity is missing, so GRN quantity cannot be validated.");
            return;
        }
        if (typed > maxReceived) {
            errorToast(`GRN quantity cannot be greater than received quantity (${maxReceived}).`);
            return;
        }

        const labelCountParsed = parseInt(String(labelCountInput).trim(), 10);
        if (!Number.isFinite(labelCountParsed) || labelCountParsed < 1) {
            errorToast("Please enter how many QR labels you need (at least 1).");
            return;
        }
        if (labelCountParsed > MIGO_MAX_LABELS_PER_PRINT) {
            errorToast(`You can print at most ${MIGO_MAX_LABELS_PER_PRINT} labels at once.`);
            return;
        }
        const labelCount = labelCountParsed;

        const materialCode = printRow.material ?? "—";
        const materialDesc = printRow.materialDescription ?? "—";
        const poNumber = printRow.poNumber ?? "—";
        const grnNo = printRow.migoNumber ?? printRow.grnNo ?? printRow.GRN_NO ?? "—";
        const dateStr = formatRowDateForPrint(printRow);
        const binVal = pickMigoBin(printRow);
        const batchVal = pickMigoBatch(printRow);
        const entryNo = printRow.serialNo ?? printRow.id ?? "";
        const stickerEntryDisplay =
            printRow.serialNo != null && printRow.serialNo !== ""
                ? String(printRow.serialNo)
                : printRow.id != null && printRow.id !== ""
                  ? String(printRow.id)
                  : "—";

        showLoader();
        let qrSvgs;
        try {
            qrSvgs = await Promise.all(
                Array.from({ length: labelCount }, (_, idx) => {
                    const seq = idx + 1;
                    const qrPayload = buildMigoQrPayload(
                        materialCode,
                        materialDesc,
                        poNumber,
                        grnNo,
                        dateStr,
                        typed,
                        binVal,
                        batchVal,
                        entryNo,
                        seq,
                        labelCount
                    );
                    return buildMigoPrintQrSvg(qrPayload, 96, "L");
                })
            );
        } catch (e) {
            console.error(e);
            errorToast("Could not prepare print. Please try again.");
            hideLoader();
            return;
        }

        const dateCompact = String(dateStr).trim().slice(0, 16);
        const descShort = String(materialDesc).replace(/\s+/g, " ").trim().slice(0, 40);

        const oneSticker = (qrSvg, seq) => {
            // const entSeq =
            //     labelCount > 1
            //         ? `L${seq}/${labelCount}`
            //        : `L${1}/${1}`;
            const entSeq =
            labelCount > 1
                    ? `L${seq}`
                    : `L${1}`;

            return `<div class="sticker-wrap">
                <div class="sticker sticker-70x60">

                    <div class="sticker-body">
                        <div style="padding-top:3mm;">
                            <table class="sticker-table boxed" role="table" aria-label="MIGO label details">
                                <thead>
                                    <tr>
                                        <th colspan="2" class="sticker-table-head">${escapeHtml(String(materialCode).slice(0, 24))} — ${escapeHtml(descShort)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><th>PO No</th><td>${escapeHtml(String(poNumber).slice(0, 12))}</td></tr>
                                    <tr><th>GRN No</th><td>${escapeHtml(String(grnNo).slice(0, 12))}</td></tr>
                                    <tr><th>GRN Date</th><td>${escapeHtml(String(dateStr).slice(0, 10))}</td></tr>
                                    <tr><th>Lot</th><td>${escapeHtml(String(binVal))}</td></tr>
                                    <tr><th>Batch</th><td>${escapeHtml(String(batchVal))}</td></tr>
                                    <tr><th>GRN Qty</th><td>${escapeHtml(String(typed).slice(0, 10))}</td></tr>
                                    <tr class="sticker-row--qty"><th>Serial No</th><td>${escapeHtml(String(entSeq).slice(0, 10))}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                </div>`;
        };

        const stickersHtml = qrSvgs.map((svg, i) => oneSticker(svg, i + 1)).join("");

            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>MIGO label 70x60mm</title>
            <style>
            *{box-sizing:border-box;}
            html,body{margin:0;padding:0;}
            body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111;background:#e5e7eb;padding:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
            .sticker-wrap{margin-bottom:12px;display:flex;justify-content:center;}
            .sticker-70x60{
            width:70mm;height:60mm;max-width:70mm;max-height:60mm;margin:0 auto;
            background:#fff;border:none;border-radius:0.5mm;overflow:hidden;
            display:flex;flex-direction:column;align-items:stretch;
            box-shadow:none;
            }
            .sticker-head{
            flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:0.6mm;
            padding:1.2mm 1.4mm 0.8mm;
            color:rgba(10, 0, 0, 0.97);
            border-bottom:none;
            }
            .sticker-head strong{
            display:block;text-align:center;font-size:9.2pt;letter-spacing:0.03em;font-weight:700;line-height:1.1;
            width:100%;
            }
            .sticker-qr{
            flex:0 0 auto;background:#fff;padding:0.45mm;border-radius:0.55mm;line-height:0;
            }
            .sticker-qr svg{display:block;width:14.5mm!important;height:14.5mm!important;}
            .sticker-body{
            flex:1 1 auto;padding:1.25mm 1.45mm 0.45mm;
            font-size:8.2pt;line-height:1.2;min-height:0;overflow:hidden;
            display:flex;flex-direction:column;gap:0.3mm;
            }
            /* boxed table styles: consistent borders and alignment */
            .sticker-table.boxed{width:100%;border-collapse:collapse;background:#fff}
            .sticker-table.boxed th,.sticker-table.boxed td{border:0.12mm solid #222;padding:3px 6px;text-align:left;font-size:8.2pt;vertical-align:middle}
            .sticker-table.boxed thead .sticker-table-head{font-weight:800;padding:6px 8px;font-size:10.2pt;background:transparent;border-bottom:none;color:#0b1220;text-align:left}
                        .sticker-table.boxed tbody th{width:28mm;color:#0b1220;font-weight:800;text-transform:uppercase;font-size:9.2pt}
                        .sticker-table.boxed tbody td{color:#0b1220;font-weight:800;font-size:9.2pt}
                        /* ensure a visible divider between the header and first tbody row */
                        .sticker-table.boxed tbody tr:first-child th,
                        .sticker-table.boxed tbody tr:first-child td {
                            border-top:0.12mm solid #222;
                        }
            .sticker-row{
            display:flex;gap:1mm;margin:0;align-items:flex-start;color:rgba(10, 0, 0, 0.97);
            }
            .sticker-row .k{
            flex:0 0 23.5mm;max-width:23.5mm;color#6b7280;font-weight:700;
            font-size:7.1pt;line-height:1.15;text-transform:uppercase;letter-spacing:0.02em;
            }
            .sticker-row .v{
            flex:1;min-width:0;font-weight:600;font-size:8pt;color:#111;
            word-break:break-word;overflow:hidden;display:-webkit-box;
            -webkit-line-clamp:1;-webkit-box-orient:vertical;
            max-height:1.35em;
            }
            .sticker-row--qty{align-items:flex-start;}
            .sticker-row--qty .k{line-height:1.2;white-space:nowrap;}
            .sticker-row--qty .v{
            font-weight:800;color:#1d4ed8;font-size:9pt;line-height:1.15;
            display:block;overflow:visible;max-height:none;
            }
            .sticker-foot{
            flex:0 0 auto;margin-top:auto;padding:0.45mm 1mm 0.55mm;
            border-top:0.12mm solid #e5e7eb;font-size:6.5pt;color:#9ca3af;text-align:center;
            }
            @media print{
            @page{margin:0;size:70mm 60mm;}
            body{background:#fff;padding:0;}
            .sticker-wrap{break-inside:avoid;page-break-after:always;margin-bottom:0;}
            .sticker-wrap:last-child{page-break-after:auto;}
            /* no outer border for print */
            .sticker-70x60{border:none;box-shadow:none;border-radius:0.4mm;}
            /* ensure table text prints correctly */
            .sticker-table.boxed th,.sticker-table.boxed td{ -webkit-print-color-adjust:exact; print-color-adjust:exact;color:#0b1220}
            .sticker-head{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
            }
            /* remove forced screen border */
            .sticker-70x60{border:none !important;}
            </style></head><body>
            ${stickersHtml}
            </body></html>`;

        const w = window.open("", "_blank", "width=360,height=420");
        if (!w) {
            errorToast("Please allow pop-ups to print");
            hideLoader();
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        hideLoader();
        closePrintModal();
        setTimeout(() => {
            try {
                w.focus();
                w.print();
            } catch (e) {
                console.error(e);
            }
        }, 200);
    };

    const columns = useMemo(() => {
        if (!reportTaColumns) return [];
        const printColumn = {
            name: "Print",
            selector: "_migoPrint",
            sortable: false,
            minWidth: "108px",
            center: true,
            cell: (row) => (
                <>
                {row?.isLotStatus == 1 && row?.status > 0 && row?.lotNo && ( 
                <Button
                    type="button"
                    className="migo-print-table-btn"
                    size="sm"
                    onClick={() => openPrintModal(row)}
                >
                    <Printer size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                    Print
                </Button>)}
                </>
            ),
        };
        const statusColumnIndex = reportTaColumns.findIndex(
            (c) => c.selector === "statusName" || (c.name && String(c.name).toUpperCase() === "STATUS")
        );
        if (statusColumnIndex === -1) {
            return [printColumn,...reportTaColumns];
        }
        return [
             printColumn,
            ...reportTaColumns.slice(0, statusColumnIndex + 1),
            ...reportTaColumns.slice(statusColumnIndex + 1),
        ];
    }, [reportTaColumns, openPrintModal]);

    return (
        <div>
            <style>
                {`
          .migo-print-table-btn {
            border: none !important;
            border-radius: 8px !important;
            padding: 0.32rem 0.7rem !important;
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            letter-spacing: 0.02em;
            color: #fff !important;
            background: linear-gradient(135deg, #5b21b6 0%, #4f46e5 42%, #2563eb 100%) !important;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
            display: inline-flex !important;
            align-items: center;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .migo-print-table-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
            color: #fff !important;
          }
          .migo-print-table-btn:focus {
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
          }
          .migo-print-modal .modal-content {
            border: none;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
          }
          .migo-print-modal .modal-header {
            background: linear-gradient(110deg, #4f46e5 0%, #3b82f6 48%, #0d9488 100%);
            color: #fff;
            border-bottom: none;
            padding: 1.1rem 1.35rem;
          }
          .migo-print-modal .modal-header .close {
            color: #fff;
            text-shadow: none;
            opacity: 0.9;
          }
          .migo-print-modal .modal-body {
            padding: 1.25rem 1.35rem 0.75rem;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 45%);
          }
          .migo-print-modal .modal-footer {
            border-top: 1px solid #e2e8f0;
            padding: 1rem 1.35rem;
            background: #f8fafc;
          }
          .migo-print-preview-card {
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #fff;
            padding: 4px 0;
            margin-bottom: 1rem;
            overflow: hidden;
          }
          .migo-print-preview-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border-bottom: 1px solid #f1f5f9;
          }
          .migo-print-preview-row:last-child {
            border-bottom: none;
          }
          .migo-print-preview-row span:first-child {
            color: #64748b;
            font-weight: 600;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            min-width: 42%;
          }
          .migo-print-preview-row span:last-child {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
          }
          .migo-print-qr-preview {
            text-align: center;
            padding: 0.85rem;
            background: #fff;
            border-radius: 10px;
            border: 1px dashed #cbd5e1;
            margin-bottom: 1rem;
          }
          .migo-print-qr-preview svg {
            width: 48px !important;
            height: 48px !important;
          }
          .migo-print-modal .btn-print-primary {
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            padding: 0.55rem 1.35rem !important;
            background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%) !important;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
            color: #fff !important;
          }
          .migo-print-modal .btn-print-primary:hover {
            color: #fff !important;
            box-shadow: 0 6px 18px rgba(37, 99, 235, 0.42);
          }
        `}
            </style>

            <Card>
                <CardHeader><h5>MIGO REPORT</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>PO Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col>
                       
                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getLoadingData}
                                    disabled={form.values.date == undefined ? true : false}
                                > View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != '' ?
                <Card >
                    <CardHeader><h5>Document Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        {!reportTaColumns ? (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                                <Spinner color="primary" className="mb-2" />
                                <span>Loading table…</span>
                            </div>
                        ) : (
                            <TableComponent showDownload columns={columns} data={landingData} />
                        )}
                    </CardBody>
                </Card> : null
            }

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}

            <Modal isOpen={printModalOpen} toggle={closePrintModal} centered className="migo-print-modal">
                <ModalHeader toggle={closePrintModal}>
                    <span className="d-block" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                        Print MIGO receipt
                    </span>
                    {/* <small className="d-block mt-1" style={{ opacity: 0.88, fontWeight: 500 }}>
                        Print layout is a 30×30 mm thermal label; full details stay in the QR code.
                    </small> */}
                </ModalHeader>
                <ModalBody>
                    {printRow && (
                        <>
                            {/* <p className="text-muted small mb-2" style={{ lineHeight: 1.45 }}>
                                Each printed sheet uses a 30×30 mm sample format: compact text plus QR (scan for
                                material, PO, GRN, dates, bin, batch, entry, and GRN quantity). GRN quantity on each
                                sticker cannot exceed received quantity. Number of QR labels sets how many unique QRs
                                you print (e.g. 50 → labels 1/50 … 50/50).
                            </p> */}
                            {/* <div className="migo-print-qr-preview" style={{ minHeight: 56 }}>
                                {printQrPreviewLoading ? (
                                    <span className="text-muted small">Loading QR…</span>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: printQrPreview }} />
                                )}
                            </div> */}
                            <div className="migo-print-preview-card">
                                <div className="migo-print-preview-row">
                                    <span>Entry number</span>
                                    <span>
                                        {printRow.serialNo != null && printRow.serialNo !== ""
                                            ? printRow.serialNo
                                            : printRow.id != null && printRow.id !== ""
                                              ? printRow.id
                                              : "—"}
                                    </span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>Number of QR labels</span>
                                    <span>
                                        {(() => {
                                            const n = parseInt(String(labelCountInput).trim(), 10);
                                            return Number.isFinite(n) && n >= 1
                                                ? Math.min(MIGO_MAX_LABELS_PER_PRINT, n)
                                                : "—";
                                        })()}
                                    </span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>Material name</span>
                                    <span>{printRow.material ?? "—"}</span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>Material description</span>
                                    <span>{printRow.materialDescription ?? "—"}</span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>PO number</span>
                                    <span>{printRow.poNumber ?? "—"}</span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>GRN number</span>
                                    <span>
                                        {printRow.migoNumber ?? printRow.grnNo ?? printRow.GRN_NO ?? "—"}
                                    </span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>GRN date</span>
                                    <span>{formatRowDateForPrint(printRow)}</span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>BIN number</span>
                                    <span>{pickMigoBin(printRow)}</span>
                                </div>
                                <div className="migo-print-preview-row">
                                    <span>Batch number</span>
                                    <span>{pickMigoBatch(printRow)}</span>
                                </div>
                            </div>
                            <FormGroup>
                                <Label for="migo-print-qty" style={{ fontWeight: 600, color: "#475569" }}>
                                    GRN quantity{" "}
                                    <span className="text-muted font-weight-normal">
                                        (max {printRow.receivedQty ?? "—"})
                                    </span>
                                </Label>
                                <Input
                                    id="migo-print-qty"
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={printQtyInput}
                                    onChange={(e) => setPrintQtyInput(e.target.value)}
                                    placeholder="e.g. 77"
                                    style={{ borderRadius: "8px", borderColor: "#cbd5e1" }}
                                />
                            </FormGroup>
                            <FormGroup className="mb-0">
                                <Label for="migo-label-count" style={{ fontWeight: 600, color: "#475569" }}>
                                    Number of QR labels
                                    <span className="text-muted font-weight-normal">
                                        {" "}
                                        (max {MIGO_MAX_LABELS_PER_PRINT})
                                    </span>
                                </Label>
                                <Input
                                    id="migo-label-count"
                                    type="number"
                                    step="1"
                                    min="1"
                                    max={MIGO_MAX_LABELS_PER_PRINT}
                                    value={labelCountInput}
                                    onChange={(e) => setLabelCountInput(e.target.value)}
                                    placeholder="e.g. 50"
                                    style={{ borderRadius: "8px", borderColor: "#cbd5e1" }}
                                />
                                <small className="text-muted d-block mt-1">
                                    Each label is printed with its own QR code. Use 1 for a single sticker.
                                </small>
                            </FormGroup>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" outline onClick={closePrintModal} style={{ borderRadius: "8px" }}>
                        Cancel
                    </Button>
                    <Button className="btn-print-primary" onClick={runBrowserPrint}>
                        <Printer size={16} style={{ marginRight: "8px", verticalAlign: "text-top" }} />
                        Print
                    </Button>
                </ModalFooter>
            </Modal>
        </div >
    );
};

export default RecieptEntryReport;
