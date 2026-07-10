import React, { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const VersionHistory = () => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    version: "",
    details: "",
    module: "",
    status: "Pending",
    releaseDate: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Fetch all versions
  const fetchHistory = () => {
    apiPostMethod(apiBaseUrl + "ProjectHistroyController/getProjectHistory")
      .then((res) => {
        const data = res.data?.data || [];
        setHistory(Array.isArray(data) ? data : [data]);
      })
      .catch((err) => console.log("Error fetching project history:", err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Add button clicked
  const handleAdd = () => {
    setFormData({
      id: null,
      version: "",
      details: "",
      module: "",
      status: "Pending",
      releaseDate: "",
    });
    setEditingId(null);
    setShowModal(true);
  };

  // Edit
  const handleEdit = (row) => {
    setFormData({ ...row });
    setEditingId(row.id);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save / Update
  const handleSubmit = () => {
    if (!formData.version || !formData.details || !formData.module || !formData.releaseDate) {
      alert("Please fill all fields!");
      return;
    }

    const apiUrl = apiBaseUrl + "ProjectHistroyController/saveProjectHistory";

    apiPostMethod(apiUrl, formData)
      .then((res) => {
        alert(res.data?.message || "Saved successfully!");
        setShowModal(false);
        fetchHistory();
      })
      .catch((err) => console.log("Error saving:", err));
  };

  // -------------------------------
  // NEW PDF FUNCTION (pdfmake)
  // -------------------------------
  const downloadPDF = () => {
    if (!history || history.length === 0) {
      alert("No data to export!");
      return;
    }

    const tableBody = [
      ["Version", "Details", "Module", "Type", "Release Date"],
      ...history.map((row) => [
        row.version || "-",
        row.details || "-",
        row.module || "-",
        row.status || "-",
        row.releaseDateFormat || "-",
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "Project Version History", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "auto", "auto"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download("Project_History.pdf");
  };

  return (
    <div style={styles.pageWrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>📘 Project Version History</h2>
        <div>
          <button style={styles.addBtn} onClick={handleAdd}>➕ Add Version</button>
          <button style={styles.pdfBtn} onClick={downloadPDF}>⬇ Export PDF</button>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Version</th>
              <th style={styles.th}>Details</th>
              <th style={styles.th}>Module</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Release Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, index) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  <span style={styles.versionBadge}>{row.version}</span>
                </td>
                <td style={styles.td}>{row.details}</td>
                <td style={styles.td}>
                  <span style={styles.moduleTag}>{row.module}</span>
                </td>
                <td style={styles.td}>
                  <span style={row.status === "Completed" ? styles.statusCompleted : styles.statusPending}>
                    {row.status}
                  </span>
                </td>
                <td style={styles.td}>{row.releaseDateFormat}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(row)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editingId ? "Update Version" : "Add New Version"}</h3>
            <div style={styles.formRow}>
              <input type="text" name="version" placeholder="Version" value={formData.version} onChange={handleChange} style={styles.input} />
              <input type="text" name="details" placeholder="Details" value={formData.details} onChange={handleChange} style={styles.input} />
              <input type="text" name="module" placeholder="Module" value={formData.module} onChange={handleChange} style={styles.input} />
              <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} style={styles.input} />
              <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                <option value="New">New</option>
                <option value="Improvement">Improvement</option>
              </select>
            </div>

            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button style={styles.cancelBtn} onClick={handleClose}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleSubmit}>
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// INLINE STYLES (same as yours)
const styles = {
  pageWrapper: { width: "95%", margin: "20px auto", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { fontSize: "24px", fontWeight: "600", margin: 0 },
  addBtn: { background: "#28a745", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "10px" },
  pdfBtn: { background: "#007bff", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
  card: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 18px rgba(0,0,0,0.08)", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f5f7fa", padding: "12px", borderBottom: "2px solid #e2e2e2", fontWeight: 600 },
  td: { padding: "12px", borderBottom: "1px solid #e2e2e2" },
  versionBadge: { background: "#4b79ff", color: "#fff", padding: "4px 9px", borderRadius: "6px", fontSize: "13px" },
  moduleTag: { background: "#e6f0ff", color: "#1747b3", padding: "4px 8px", borderRadius: "5px", fontSize: "13px" },
  statusCompleted: { background: "#c8f7d3", color: "#0d7b15", padding: "4px 8px", borderRadius: "6px", fontWeight: 500 },
  statusPending: { background: "#ffe9c8", color: "#b85b00", padding: "4px 8px", borderRadius: "6px", fontWeight: 500 },
  editBtn: { background: "#ffc107", color: "#000", padding: "5px 10px", border: "none", borderRadius: "6px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "#fff", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "700px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  formRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" },
  input: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", flex: "1 1 150px" },
  submitBtn: { background: "#28a745", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
  cancelBtn: { background: "#dc3545", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
};

export default VersionHistory;
