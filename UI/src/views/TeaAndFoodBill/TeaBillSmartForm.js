import React, { useEffect, useState } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useParams } from 'react-router';
import { errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import { Printer } from 'react-feather';
import logo from '../../assets/images/logo/logo2.png'; // Your logo path

const TeaBillSmartForm = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const getGateInInfo = () => {
    apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/getTeaBillById/${id}`)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setData(data.data);
        }
      })
      .catch((error) => {
        console.error(error);
        errorToast('Something went wrong, please try again later.');
      });
  };

  const print = () => window.print();

  useEffect(() => {
    getGateInInfo();
  }, [id]);

  if (!data || data.length === 0) return <div>Loading...</div>;

  const {
    bill_date,
    shift_name,
    vendor_name,
    created_at,
    gateout_at,
    in_time,
    out_time,
    tea_cost,
  } = data[0];

  const detailsList = data.map(d => ({
    item_name: d.item_name,
    qty: d.quantity
  }));

  const totalQty = detailsList.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const labelStyle = {
    display: "inline-block",
    minWidth: "130px",
    fontWeight: "bold"
  };

  return (
    <div style={{ padding: "10px", fontSize: "14px", fontFamily: "Arial", color: "#000" }}>
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print" style={{ textAlign: "end", marginTop: "20px" }}>
        <Button color="primary" onClick={print}>
          <Printer size={14} />
        </Button>
      </div>

      {/* Printable Area */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          border: "2px solid #000",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            border: "1px solid #000"
          }}
        >
          <img src={logo} alt="Company Logo" style={{ height: "80px", marginRight: "60px" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ margin: 0, fontWeight: 600, color: '#3E4A79' }}>
              NAGA LIMITED CONSUMER DIVISION
            </h3>
            <h4 style={{ margin: 0, color: '#3E4A79' }}>TEA ISSUE</h4>
          </div>
        </div>

        {/* Details Box */}
        <div style={{ border: "1px solid #000", padding: "10px"}}>
          <Row style={{ marginBottom: "10px" }}>
            <Col md="6">
                <div><span style={labelStyle}>DATE</span>: {bill_date || ""}</div>
            </Col>
            <Col md="6">
                <div><span style={labelStyle}>SHIFT</span>: {shift_name || ""}</div>
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col md="6">
                <div><span style={labelStyle}>VENDOR NAME</span>: {vendor_name || ""}</div>
            </Col>
            <Col md="6">
                <div><span style={labelStyle}>IN TIME</span>: {in_time || ""}</div>
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col md="6">
              <div><span style={labelStyle}>OUT TIME</span>: {out_time || ""}</div>
            </Col>
            <Col md="6">
              <div><span style={labelStyle}>Tea Cost</span>: {tea_cost || ""}</div>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "50px"
          }}
          border="1"
        >
          <thead>
            <tr>
              <th style={{ padding: "8px", textAlign: "center", width: "10%" }}>SI.NO</th>
              <th style={{ padding: "8px", textAlign: "left" }}>DETAILS</th>
              <th style={{ padding: "8px", textAlign: "center", width: "20%" }}>QUANTITY</th>
            </tr>
          </thead>
          <tbody>
            {detailsList.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "8px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>{item.item_name || ""}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{item.qty || ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>Total</td>
              <td style={{ padding: "8px", textAlign: "center", fontWeight: "bold" }}>{totalQty}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TeaBillSmartForm;
