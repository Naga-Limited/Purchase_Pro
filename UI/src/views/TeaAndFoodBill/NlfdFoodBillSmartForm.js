import React, { useEffect, useState, useMemo } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { Printer } from 'react-feather';
import { useParams } from 'react-router';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import { errorToast } from '../../helper/appHelper';
import logo from '../../assets/images/logo/logo2.png';


const FoodMealsTokenPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const currentDateTime = new Date().toLocaleString();

  /* =======================
     FETCH DATA
  ======================= */
  useEffect(() => {
    apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/foodBillById/${id}`)
      .then((res) => {
        if (res.data.success && res.data.results?.length) {
          setData(res.data.results[0]);
        }
      })
      .catch(() => {
        errorToast('Failed to load token details');
      });
  }, [id]);

  /* =======================
     HTML TEMPLATE (PREVIEW + PRINT)
  ======================= */
  const htmlTemplate = useMemo(() => `
    <html>
      <head>
        <style>
          body {
            width: 80mm;
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
            font-size: 11px;
            background: #f5f5f5;
          }

          .wrapper {
            background: #fff;
            width: 72mm;
            border: 2px solid #000;
            padding: 4mm;
            position: relative;
            overflow: hidden;
            margin: auto;
          }

          .wrapper::after {
            content: "NAGA LIMITED";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 28px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.25);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
          }

          .content {
            position: relative;
            z-index: 1;
          }

          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-top: 4mm;
            padding-bottom: 6px;
            margin-bottom: 8px;
            font-weight: bold;
            position: relative;
          }

          .header img {
            position: absolute;
            left: 0.5mm;
            top: 1mm;
            width: 15mm;
          }

          .sub {
            font-size: 11px;
            display: block;
          }

          .row {
            display: flex;
            margin-top: 6px;
          }

          .label {
            width: 35%;
            font-weight: bold;
          }

          .value {
            width: 65%;
          }

          .sign {
            margin-top: 30px;
            font-weight: bold;
          }

          .sign-row {
            display: flex;
            justify-content: space-between;
          }

          @media print {
            @page { width: 80mm; margin: 0; }
            body { background: #fff; }
          }
        </style>
      </head>

      <body>
        <div class="wrapper">
          <div class="content">

            <div class="header">
              <img src="${logo}" />
              NAGA LIMITED FOODS DIVISION
              <span class="sub">FOOD TOKEN</span>
            </div>

            <div class="row">
              <div class="label">Token No:</div>
              <div class="value">${data.uniqueId ?? ''}</div>
            </div>

            <div class="row">
              <div class="label">HotelName:</div>
              <div class="value"><b>${data.Name ?? ''}</b></div>
            </div>
            
            <div class="row">
              <div class="label">Food Type:</div>
              <div class="value">${data.foodTypename ?? ''}</div>
            </div>

            <div class="row">
              <div class="label">Amount:</div>
              <div class="value">${data.amount ?? ''}</div>
            </div>

             ${
              ["LOADMAN", "PACKING"].includes(data.toWhomName)
                ? `
                <div class="row">
                  <div class="label">Contractor:</div>
                  <div class="value">${data.contractorName ?? ''}</div>
                </div>
              `
                : ''
            }

           ${
              ["LOADMAN", "PACKING"].includes(data.toWhomName)
                ? `
              <div class="row">
                <div class="label">No of Members:</div>
                <div class="value">${data.noOfLoadman ?? ''}</div>
              </div>
            `
                : ''
          }

            <div class="row">
              <div class="label">Emp Code:</div>
              <div class="value">${data.emp_code ?? ''}</div>
            </div>

            <div class="row">
              <div class="label">Name:</div>
              <div class="value">${data.emp_name ?? ''}</div>
            </div>

            <div class="row">
              <div class="label">Dept:</div>
              <div class="value">${data.emp_department ?? ''}</div>
            </div>

            <div class="row">
              <div class="label">Shift:</div>
              <div class="value">${data.shiftName ?? ''}</div>
            </div>

            <div class="row">
             <div class="label">Issued Time:</div>
             <div class="value">${currentDateTime}</div>
            </div>

            ${
              data.remark
                ? `
                <div class="row">
                  <div class="label">Remarks:</div>
                  <div class="value">${data.remark ?? ''}</div>
                </div>
              `
                : ''
            }

          </div>
        </div>
      </body>
    </html>
  `, [data]);

  /* =======================
     PRINT ACTION
  ======================= */
  const printFoodToken = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @media print {
              @page { width: 80mm; margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${htmlTemplate}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardBody>

        <Button size="sm" style={{ float: 'right' }} onClick={printFoodToken}>
          <Printer size={16} /> Print
        </Button>

        <iframe
          title="Food Token Preview"
          srcDoc={htmlTemplate}
          style={{
            width: '100%',
            height: '650px',
            border: 'none',
            marginTop: '20px',
            background: '#f5f5f5'
          }}
        />
      </CardBody>
    </Card>
  );
};

export default FoodMealsTokenPrint;