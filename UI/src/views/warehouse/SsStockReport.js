import React, { Fragment, useState, useEffect } from 'react'
import { Col, Button, ButtonGroup, Card, CardBody } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl } from '../../urlConstants'
import { CustomDropdownInput } from '../forms/custom-form'
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";
import { ExportToCsv } from 'export-to-csv';
import * as XLSX from 'xlsx';
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

const ssAuditTableColumns = [
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
    const headers = ssAuditTableColumns.map((c) => c.name);
    const keys = ssAuditTableColumns.map((c) => c.selector);
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
    const keys = ssAuditTableColumns.map((c) => c.selector);
    const headers = ssAuditTableColumns.map((c) => c.name);
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
    const keys = ssAuditTableColumns.map((c) => c.selector);
    const headers = ssAuditTableColumns.map((c) => c.name);
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
              <TableComponent columns={ssAuditTableColumns} data={checkList} />
            </div>
          ) : (
            <div className="text-center py-5 text-muted" style={{ minHeight: '120px' }}>
              <FileText size={40} className="mb-2" style={{ opacity: 0.5 }} />
              <p className="mb-0">No data to display. Select filters and click <strong>Show</strong> to load S&amp;S stock from SAP.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </Fragment>
  );
};

const SsStockReport = () => {
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

export default SsStockReport;
