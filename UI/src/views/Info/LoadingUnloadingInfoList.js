import { Card, CardHeader, CardBody, FormGroup, Col, Row, Button } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { Modal } from "react-bootstrap";
import { Printer, X } from "react-feather";
import { BASE_URL } from "../../urlConstants";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "truckNo",
        sortable: true,
        minWidth: "100px",       
    },
    {
        name: "CREATED AT",
        selector: "createdOn",
        sortable: true,
        minWidth: "100px",        
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "100px",        
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.plantName + ' - ' + row.werks}</span>
            </>
        },
    },
    {
        name: "STATUS",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "170px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.waitingStatus ? row.waitingStatus : 'Loading & Unloading'}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const LoadingUnloadingInfoList = ({ landingData }) => {

    const actionsCol = {
        name: "ACTIONS",
        selector: "barcodeImage",
        minWidth: "100px",
        cell: (row) => {
            return row.barcodeImage  ? (
                
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" 
                    // onClick={(e) => {
                    // window.open(BASE_URL+"/#/VEHICLEREQUEST:"+row.loadingAndUnloadingInfoId, "", "width=900,height=650")
                    // }}
                    onClick={(e)=>onActionClick(row.barcodeImage,row.moduleType,row.truckNo)}
                   >
                QR Print</Button.Ripple>
                </Row>
            ):'';
        },
    };
    const [barcodeImage, setData] = useState([])
    const [moduleType, setModuleType] = useState('')
    const [show, setShow] = useState(false);
    const [truckNo, setTruckNo] = useState('')
    const closeRemarksModal = () => setShow(false);
    const onActionClick = (row,moduleType,truckNo) => {
        setShow(true)
        setData(row);
        setModuleType(moduleType)
        setTruckNo(truckNo);
        // window.open(`/public/#/VEHICLEREQUEST/${ID}`)
        
        // window.open(`/public/#/VEHICLEREQUEST/${ID}`)
        // if(ID){
        // window.open(BASE_URL + "/#/VEHICLEREQUEST:" + ID, "", "width=900,height=650")
        // }
    };

    const columns = [...taColumns,actionsCol];
    const print = () => {
        const date = new Date();
            const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
            });
        const printContent = `
          <html>
            <head>
              <title>OR Print (${moduleType})</title>
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
              <div class="header">QR Print (${moduleType})</div>
              <div class="content">
                <p>Date: ${date}</p>
                <p>Vehicle No : ${truckNo}</p>
              </div>
              <img class="barcode" src="${barcodeImage}" alt="QR Code" />
              <div class="content">
                <p>Thanks for visiting Naga!</p>
              </div>
            </body>
          </html>
        `;
    
        const popupWindow = window.open("", "_blank", "width=600,height=600");
        popupWindow.document.open();
        popupWindow.document.write(printContent);
        popupWindow.document.close();
    };
    

     
    return (
        <div>
            <Card>
                <CardHeader><h5>Loading & Unloading List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>
            <Modal show={show} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>QR Print ({moduleType})<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12" style={{ marginLeft: "300px" }}>
                        <Printer size={16} onClick={print} color="blue" />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12" md="12" style={{ marginLeft: "100px" }}>
                            <FormGroup>
                                {/* <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" /> */}
                                <img  src={barcodeImage} alt="Barcode"></img> 
                            </FormGroup>
                        </Col>
                        
                    </Row>
                </Modal.Body>
            </Modal >
        </div>
    );
};

export default LoadingUnloadingInfoList;
