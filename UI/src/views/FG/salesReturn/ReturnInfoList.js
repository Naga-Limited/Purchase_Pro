import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap'
import TableComponent from '../../common/TableComponent';
import { Trash2 } from 'react-feather';
import { useSelector } from 'react-redux';
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { apiBaseUrl } from '../../../urlConstants';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';
import { useLoader } from '../../../utility/hooks/useLoader';
import { apiPostMethod } from '../../../helper/axiosHelper';
import { Modal } from "react-bootstrap";
import { Printer, X } from "react-feather";
import QRCode from 'react-qr-code';

export const taColumns = [
    {
        name: "VEHICLE NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "RETURN REF NO",
        selector: "returnRefNo",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "180px",
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
];

const ReturnInfoList = ({ landingData, actionRendorer, setLandingData, getFgSalesReturnInfo }) => {


    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "200px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;
                    {UserDetails.role != 'Security' && 
                    <Button color="danger" size="sm" type="button" className='ml-1' onClick={() =>deleteFgSalesReturnInfo(row.fgSalesReturnInfoId)}><Trash2 size={16} /> Delete</Button>}&nbsp;
                    {row.vehicleNo && 
                    <Button.Ripple className='ml-1' color="primary" size="sm" type="button" onClick={() => onActionClick(row.vehicleNo)}> QR Print</Button.Ripple>}
                </Row>
            );
        },
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    const deleteFgSalesReturnInfo = (id) => {

        const postdata = {
            fgSalesReturnInfoId: id,
            userInfoId: UserDetails.USERID
        }

        confirmDialog({
            title: `<h4>Are you sure want to Delete?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                apiPostMethod(apiBaseUrl + "GatePro/Master/deleteFgSalesReturnInfo", postdata)
                    .then((response) => {
                        const res = response.data;
                        if (res.success == true) {
                            ShowToast(res.message);
                            setLandingData([])
                            getFgSalesReturnInfo()
                        }
                        else if (res.success == false) {
                            errorToast(res.message)
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            }
        })
            .catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };
    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const [qrImage, setqrImage] = useState('');

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
              <title>QR Print (Sales return)</title>
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
             <div class="header">QR Print (Sales return)</div>
              <div class="content">
                    <p>Date: ${date}</p>
                    <p>Vehicle No: ${qrImage}</p>
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
    const columns = [...taColumns, actionsCol];

    return (
        <div>
        <Card>
            <CardHeader><h5>Return Info List</h5></CardHeader>
            <hr></hr>
            <CardBody>
                <TableComponent columns={columns} data={landingData} />
            </CardBody>
        </Card>  
        <Modal show={show} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>QR Print (Sales return)<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
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
    )
}

export default ReturnInfoList
