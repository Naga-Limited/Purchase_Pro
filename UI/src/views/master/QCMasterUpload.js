import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Row,
  Col,
} from "reactstrap";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { apiBaseUrl } from "../../urlConstants";
import { useSelector } from "react-redux";

// =================== Table Column Definitions ===================
export const taColumns = [
  { name: "MATERIAL", selector: "IDNLF", sortable: true, minWidth: "200px" },
  { name: "UOM", selector: "UOM", sortable: true, minWidth: "60px" },
  { name: "MIC", selector: "MIC", sortable: true, minWidth: "60px" },
  { name: "MIC DESC", selector: "MIC_DESC", sortable: true, minWidth: "100px" },
  { name: "MIN VALUE", selector: "MIN_VALUE", sortable: true, minWidth: "60px" },
  { name: "MAX VALUE", selector: "MAX_VALUE", sortable: true, minWidth: "60px" },
  { name: "INPUT TYPE", selector: "input_type", sortable: true, minWidth: "80px" },
  { name: "NIR YES", selector: "nir_yes", sortable: true, minWidth: "60px" },
  { name: "NIR NO", selector: "nir_no", sortable: true, minWidth: "60px" },
  { name: "NIR FOSS", selector: "nir_foss", sortable: true, minWidth: "80px" },
  { name: "SURVEYOR", selector: "surveyor", sortable: true, minWidth: "80px" },
  { name: "DEDUCTION", selector: "DeductionSpec", sortable: true, minWidth: "80px" },
  { name: "FIELD MAP", selector: "FIELD_MAP", sortable: true, minWidth: "150px" },
];

const QCMasterUpload = () => {
  const [tableDataSilo, setTableDataSilo] = useState([]);
  const [tableDataIAS, setTableDataIAS] = useState([]);
  const [activeType, setActiveType] = useState("SILO"); // "SILO" or "IAS"

  const UserDetails = useSelector((state) => state.auth?.userData || {});
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    loadTableData();
  }, []);

  // ===================== Load Existing Data =====================
  const loadTableData = async () => {
    const postdata = { user_plantid: UserDetails.plantids?.toString() };
    showLoader();
    try {
      const siloRes = await apiPostMethod(apiBaseUrl + "GatePro/Master/getSTMQCMaster", postdata);
      const iasRes = await apiPostMethod(apiBaseUrl + "GatePro/Master/getIASQCMaster", postdata);

      setTableDataSilo(siloRes.data.results || []);
      setTableDataIAS(iasRes.data.results || []);
    } catch (err) {
      console.error(err);
      errorToast("Error fetching QC master data");
    } finally {
      hideLoader();
    }
  };

  // ===================== Excel Import Common Function =====================
  const importExcel = async (file, processType) => {
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      errorToast("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheet = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: "" });

        if (!data || data.length === 0) {
          errorToast("No data found in Excel file");
          return;
        }

        // Update UI Table
        if (processType === "SILO_TO_MILL") setTableDataSilo(data);
        else setTableDataIAS(data);

        // Prepare payload for backend
        const payload = {
          userId: UserDetails.USERID,
          plantId: UserDetails.plantids?.toString(),
          processType,
          data,
        };

        // Call backend
        showLoader();
        const res = await apiPostMethod(apiBaseUrl + "GatePro/Master/importQCMaster", payload);
        hideLoader();

        if (res.data.success) {
          ShowToast(`${processType} Data Imported Successfully`);
          loadTableData();
        } else {
          errorToast(res.data.message || "Import failed");
        }
      } catch (err) {
        console.error(err);
        errorToast(`Error importing Excel for ${processType}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImportSilo = (e) => importExcel(e.target.files[0], "SILO_TO_MILL");
  const handleImportIAS = (e) => importExcel(e.target.files[0], "IAS");

// ===================== Sample Data Definitions =====================
  
  const sampleData = {
  IAS: [
    {
      MATERIAL: "MADHYAPRADESH-DHARA-GM02",
      UOM: "%",
      MIC: "IW5-MO",
      "MIC DESC": "Moisture",
      "MIN VALUE": 8,
      "MAX VALUE": 10,
      "INPUT TYPE": "T",
      "NIR YES": "Yes",
      "NIR NO": "Yes",
      "NIR FOSS": "Yes",
      SURVEYOR: "Yes",
      DEDUCTION: "",
      "FIELD MAP": "moisture_quality",
    },
    {
      MATERIAL: "MADHYAPRADESH-DHARA-GM02",
      UOM: "%",
      MIC: "IW6-HL",
      "MIC DESC": "HL",
      "MIN VALUE": 76,
      "MAX VALUE": 80,
      "INPUT TYPE": "T",
      "NIR YES": "Yes",
      "NIR NO": "Yes",
      "NIR FOSS": "Yes",
      SURVEYOR: "Yes",
      DEDUCTION: "",
      "FIELD MAP": "hl_quality",
    },
    {
      MATERIAL: "MADHYAPRADESH-DHARA-GM02",
      UOM: "%",
      MIC: "P9-IS",
      "MIC DESC": "Insect damage wheat",
      "MIN VALUE": 0.1,
      "MAX VALUE": 0.2,
      "INPUT TYPE": "T",
      "NIR YES": "Yes",
      "NIR NO": "Yes",
      "NIR FOSS": "Yes",
      SURVEYOR: "Yes",
      DEDUCTION: "",
      "FIELD MAP": "insect_damage_wheat_quality",
    },
  ],

  SILO_TO_MILL: [
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "C3-P", "MIC DESC": "Protein", "MIN VALUE": 10, "MAX VALUE": 12, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "No", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: "", "FIELD MAP": "protein_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "IW5-MO", "MIC DESC": "Moisture", "MIN VALUE": 9, "MAX VALUE": 10, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: 10, "FIELD MAP": "moisture_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "C2-AH", "MIC DESC": "Ash", "MIN VALUE": 1.5, "MAX VALUE": 2, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "No", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: 2, "FIELD MAP": "ash_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "C4-WG", "MIC DESC": "Wet gluten %", "MIN VALUE": 25, "MAX VALUE": 30, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "No", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: 24, "FIELD MAP": "wet_gluten_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "C5-DG", "MIC DESC": "Dry gluten %", "MIN VALUE": 8.5, "MAX VALUE": 10, "INPUT TYPE": "T", "NIR YES": "No", "NIR NO": "No", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: 8.5, "FIELD MAP": "dry_gluten_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "ml", MIC: "C6-SV", "MIC DESC": "SV", "MIN VALUE": 21, "MAX VALUE": 25, "INPUT TYPE": "T", "NIR YES": "No", "NIR NO": "No", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: 20, "FIELD MAP": "sv_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "IW6-HL", "MIC DESC": "HL", "MIN VALUE": 76, "MAX VALUE": 80, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: 76, "FIELD MAP": "hl_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: "P2-FM", "MIC DESC": "Foreign matter", "MIN VALUE": 0.5, "MAX VALUE": 4, "INPUT TYPE": "T", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: 4, "FIELD MAP": "foreign_matter_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "", MIC: "IW1-IS", "MIC DESC": "Infestation", "MIN VALUE": "NO", "MAX VALUE": "", "INPUT TYPE": "D", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: "", "FIELD MAP": "infestation_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "", MIC: " ", "MIC DESC": "Bad_smell", "MIN VALUE": "NO", "MAX VALUE": "", "INPUT TYPE": "D", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: "", "FIELD MAP": "bad_smell" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: " ", "MIC DESC": "Dust", "MIN VALUE": 0, "MAX VALUE": 0.1, "INPUT TYPE": "D", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "Yes", DEDUCTION: 0.1, "FIELD MAP": "dust_quality" },
    { MATERIAL: "WHEAT BLENDED PILLSBURY CHAKKI FRESH", UOM: "%", MIC: " ", "MIC DESC": "Seive Size", "MIN VALUE": 1.75, "MAX VALUE": 2.25, "INPUT TYPE": "D", "NIR YES": "Yes", "NIR NO": "Yes", "NIR FOSS": "Yes", SURVEYOR: "No", DEDUCTION: 1.75, "FIELD MAP": "seive_size_quality" },
  ],
};


// ==================== DOWNLOAD SAMPLE ====================
const downloadSample = (processType) => {
  const sampleRows = sampleData[processType];
  if (!sampleRows || sampleRows.length === 0) {
    errorToast("No sample data found!");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, processType);
  XLSX.writeFile(wb, `${processType}_QCMaster_Sample.xlsx`);
};


  // ===================== UI =====================
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>QC Master Upload</CardTitle>
        </CardHeader>

        <CardComponent>
          <Row>
            <Col
              md="6"
              className={`text-center border border-primary py-2 ${activeType === "SILO" ? "bg-primary" : ""}`}
              onClick={() => setActiveType("SILO")}
              style={{ cursor: "pointer" }}
            >
              <strong className={activeType === "SILO" ? "text-white" : "text-primary"}>
                Silo To Mill
              </strong>
            </Col>

            <Col
              md="6"
              className={`text-center border border-primary py-2 ${activeType === "IAS" ? "bg-primary" : ""}`}
              onClick={() => setActiveType("IAS")}
              style={{ cursor: "pointer" }}
            >
              <strong className={activeType === "IAS" ? "text-white" : "text-primary"}>
                IAS
              </strong>
            </Col>
          </Row>
        </CardComponent>

        {/* ========== SILO TO MILL SECTION ========== */}
        {activeType === "SILO" && (
          <CardBody>
            <div className="d-flex justify-content-end gap-2 mb-2">
              <Button color="success" size="sm" onClick={() => downloadSample("SILO_TO_MILL")}>
                📥 Download Sample
              </Button> &nbsp;&nbsp;&nbsp;

              <input
                type="file"
                accept=".xlsx,.xls"
                id="siloImport"
                style={{ display: "none" }}
                onChange={handleImportSilo}
              />
              <Button
                color="primary"
                size="sm"
                onClick={() => document.getElementById("siloImport").click()}
              >
                ⬆️ Import Master (Silo To Mill)
              </Button>
            </div>
            <TableComponent showDownload columns={taColumns} data={tableDataSilo} />
          </CardBody>
        )}

        {/* ========== IAS SECTION ========== */}
        {activeType === "IAS" && (
          <CardBody>
            <div className="d-flex justify-content-end gap-2 mb-2">
              <Button color="success" size="sm" onClick={() => downloadSample("IAS")}>
                📥 Download Sample
              </Button> &nbsp;&nbsp;&nbsp;

              <input
                type="file"
                accept=".xlsx,.xls"
                id="iasImport"
                style={{ display: "none" }}
                onChange={handleImportIAS}
              />
              <Button
                color="primary"
                size="sm"
                onClick={() => document.getElementById("iasImport").click()}
              >
                ⬆️ Import Master (IAS)
              </Button>
            </div>
            <TableComponent showDownload columns={taColumns} data={tableDataIAS} />
          </CardBody>
        )}
      </Card>
    </div>
  );
};

export default QCMasterUpload;
