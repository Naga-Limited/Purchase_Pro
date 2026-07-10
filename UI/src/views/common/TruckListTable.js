import { Card, CardHeader, CardTitle, CardBody, Col, Button, Row, FormGroup } from "reactstrap";
import React, { useEffect, useState } from "react";

import { tblTRUCKUrl } from "../../urlConstants";
import TableComponent from "./TableComponent";
import { taColumns, status } from "../../helper/appHelper";
import { ias_taColumns } from "../../helper/ias_appHelper";
import Select from "react-select";
import { Modal } from "react-bootstrap";
import { Printer, X } from "react-feather";
import QRCode from "react-qr-code";

const TruckListTable = ({ title, actionCell, postData, hideFilter, actitionColumnWidth,ScreenName }) => {
 
   
  let options = [
    { value: postData.vehicleStatus, label: "Default" },
    ...[1, 2, 3, 4, 5, 6, 7, 11, 21,22,12,18,25,26,27,28,29,30,31,23,24,13,14,15].map((k) => ({ label: status[k].title, value: k })),
  ];
  const [filter, setFilter] = useState(postData);
  let [selectedValue, setSelectedValue] = useState(options[0]);
  useEffect(() => {
    setFilter(postData);
    if (postData) {
      setSelectedValue({ value: postData.vehicleStatus, label: "Default" });
    }
  }, [postData]);
  let columns = [];
  if (actionCell) {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: actitionColumnWidth || "300px",
      cell: actionCell,
    };
    
    if(ScreenName=="IAS View"){
      columns = [...ias_taColumns, actionsCol];
    }else{
      columns = [...taColumns, actionsCol];
    }
    
  } else {
    const actionsCol1 = {
      name: "Actions",
      selector: "status",
      minWidth: "120px",
      cell: (row) => (
        <>
            <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(row.TRUCK_NO)}> QR Print</Button.Ripple>
        </>
      ),
    };

    if(ScreenName=="IAS View"){
      columns = [...ias_taColumns];
    }else{
    columns = [...taColumns];
    }
  }
  const [show, setShow] = useState(false);
  const [qrImage, setqrImage] = useState('');
  const closeRemarksModal = () => setShow(false);
  const onActionClick = (Image) => {
    setShow(true)
    // setData();
    setqrImage(Image)
  };
  const print = () => {

    const date = new Date();
            const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
            });
    const qrCodeElement = document.getElementById('qrCode').innerHTML;

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Print (${'RM Purchase - '+qrImage})</title>
          <style>
          @media print {
            @page { width: 80mm; margin: 0; }
            body { width: 80mm; font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        }
        .header { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; }
        .content { font-size: 12px; line-height: 1.5; text-align: left; }
        .barcode { display: block; width: 70mm; margin: 10px auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
         <div class="header">QR Print (${'RM Purchase - '+qrImage})</div>
          <div class="content">
                <p>Date: ${date}</p>
          </div>
          <div class="qrcode">${qrCodeElement}</div>
          <div class="content">
          <p>Thanks for visiting Naga!</p>
        </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent
            postData={filter}
            columns={columns}
            url={tblTRUCKUrl}
            formType="F"
            showDownload
            ScreenName={ScreenName}
            filterRenderor={
              hideFilter
                ? undefined
                : () => {
                    return (
                      <Col className="align-items-center justify-content-start" md="4" sm="12">
                        <Select
                          className="react-select"
                          classNamePrefix="select"
                          options={options}
                          value={selectedValue}
                          onChange={(item) => {
                            setSelectedValue(item);
                            setFilter((p) => ({
                              ...p,
                              vehicleStatus: item.value,
                            }));
                          }}
                        />
                      </Col>
                    );
                  }
            }
          />
        </CardBody>
      </Card>

        {/*Model for QR Print */}

        <Modal show={show} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>QR Print ({'RM Purchase - ' + qrImage})<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12" style={{ textAlign: "end" }}>
                        <Printer size={16} onClick={print} color="blue" style={{ cursor: "pointer" }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12" md="12" style={{ textAlign: "center" }}>
                            <FormGroup>
                            <div id="qrCode">
                                <QRCode
                                 value={qrImage}
                                 size={100}
                                 level="H"
                                 includeMargin={true}
                                />
                            </div>
                            </FormGroup>
                        </Col>
                        
                    </Row>
                </Modal.Body>
      </Modal >
    </div>
  );
};

export default TruckListTable;
