import { Card, CardHeader, CardTitle, CardBody, Button, Col, FormGroup, Row } from "reactstrap";

import React, { useState,useRef, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl, BASE_URL } from "../../urlConstants";
import { RefreshBlock } from "../common/RefreshBlock";
import { Modal } from "react-bootstrap";
import { Printer, X } from "react-feather";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomTextInput, Yup } from "../forms/custom-form";
import DateComponent from "../common/dateComponent";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";

export const taColumns = [
  {
    name: "Vehicle No",
    selector: "VEHICAL_NO",
    sortable: true,
    minWidth: "150px",
  
  },
  {
    name: "PO Number",
    selector: "ZPO_NUMBER",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Supplier Name",
    selector: "ZSUPPLIER_NAME",
    sortable: true,
    minWidth: "250px",
  },
  {
    name: "Loading point",
    selector: "ZSUPPLIER_LOAD_POINT",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Loading date",
    selector: "ZSUPPLIER_LOAD_DT",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Plant Name",
    selector: "PLANT_NAME",
    sortable: true,
    minWidth: "230px",
  },
  {
    name: "EDA",
    selector: "EDA",
    sortable: true,
    minWidth: "150px",
  },
];

const SdiRedirectList = () => {
  const history = useHistory();

  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "350px",
    cell: (row) => {
      return (
        <>
      {UserDetails.role != 'Security' &&
        <Button.Ripple
          color="primary"
          onClick={(e) => {
            history.push(`/SDIR:${row.SUP_VE_REFID}`);
          }}
        >
          {"Edit"}
        </Button.Ripple>}&nbsp; 
        {row.purchase_info_id == 0 && UserDetails.DEPARTMENT == 'PU' &&
        <Button.Ripple
          color="primary"
          onClick={(e) => {
            history.push(`/SDIR:Delete-${row.SUP_VE_REFID}`);
          }}
        >
          {"Delete"}
        </Button.Ripple>
        }&nbsp;
        {row.VEHICAL_NO &&  
          <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(row.VEHICAL_NO)}> QR Print</Button.Ripple>
          
          // <Button.Ripple color="primary" size="sm" type="button" onClick={(e) => {
          //           window.open(BASE_URL+"/#/VEHICLEREQ:"+row.SUP_VE_REFID, "", "width=900,height=650")
          // }}>QR Print</Button.Ripple>
        }&nbsp;
        {(row.SEAL_NO != '' && UserDetails.role != 'Security' && (row.CONTAINER_PORT_RECEIVE == null || row.CONTAINER_PORT_RECEIVE == ''|| row.CONTAINER_PORT_RECEIVE == undefined) && (row.VEHICLE_TYPE == 'Container' || row.VEHICLE_TYPE == 'Cm Container')) &&
        <Button.Ripple color="primary" onClick={() => togglePortLoadingModal(row)}>
          {"Port Receive"}
        </Button.Ripple>
        }&nbsp;
      </>  
      );
    },
    
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(
        Yup.object().shape({

        })
      ),
    }),
    onSubmit(values) { },
  });

  const [show, setShow] = useState(false);
  const closeRemarksModal = () => setShow(false);
  const [qrImage, setqrImage] = useState('');
  const [qrCanvas, setQrCanvas] = useState(null);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const onActionClick = (Image) => {
      setShow(true)
      // setData();
      setqrImage(Image)
  };
  // const print = () => {
  //     // window.print()
  //     const printContent = `
  //     <html>
  //         <head>
  //         <title>Print QR Code</title>
  //         <style>
  //             body { font-family: Arial, sans-serif; padding: 20px }
  //             .header { font-size: 20px; margin-bottom: 20px; font-weight: bold; }
  //             img { width: 600px; height: 300px; text-align: center }
  //         </style>
  //         </head>
  //         <body onload="window.print(); window.close();">
  //         <div class="header">QR Print</div>
  //         <img src="http://localhost:3000/${qrImage}" alt="QR Code" />
  //         </body>
  //     </html>
  //     `;

  //     const popupWindow = window.open("", "_blank", "width=600,height=600");
  //     popupWindow.document.open();
  //     popupWindow.document.write(printContent);
  //     popupWindow.document.close();
  // }
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
          <title>QR Print (RM Purchase)</title>
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
         <div class="header">QR Print (RM Purchase)</div>
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
  const [chckid, setchckid] = useState('');
  const [showPortLoadingModal, setShowPortLoadingModal] = useState(false);
 
  const togglePortLoadingModal = (row) => {
    setShowPortLoadingModal(!showPortLoadingModal);
     setchckid(row.SUP_VE_REFID);
  };

  let { showLoader, hideLoader } = useLoader();

  const handleConfirmPortLoading = () => {
    const formData = form.values;
    const postdata = {
      chckid,
      postdate:formData.receive_date_
    }
    apiPostMethod(apiBaseUrl + "SupplierDispatch/Portreceivedate", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast("Date Added successfully");
          setShowPortLoadingModal(false);
          window.setTimeout( function() {
            window.location.reload();
          }, 2000);
        } else {
          errorToast("Not Added...");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  };
    


  const dateRestriction = DateComponent('sap')

  const columns = [...taColumns, actionsCol];
  return (
    <div>
      <RefreshBlock />
      <Card>
        <CardHeader>
          <CardTitle>{"Supplier Dispatch Redirect"}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent postData={{}} showDownload columns={columns} url={apiBaseUrl + "sdi/getsdiVehicleList"} />
        </CardBody>
      </Card>
      <Modal show={show} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>QR Print (RM Purchase)<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
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
      {/* Port Loading Modal */}
      <Modal show={showPortLoadingModal} onHide={togglePortLoadingModal} centered>
        <Modal.Header>
          <Modal.Title>Port Loading</Modal.Title>
          <X onClick={togglePortLoadingModal} style={{ cursor: "pointer" }} />
        </Modal.Header>
        <Modal.Body>
        <CustomTextInput
                    label={`Receive Date`}
                    id={`receive_date_`}
                    name={`receive_date_`}
                    form={form}
                    type="date"
                    min={dateRestriction.min_date} 
                    max={dateRestriction.max_date}
                    />
        </Modal.Body>
        <Modal.Footer>
          <Button color="secondary" onClick={togglePortLoadingModal}>
            Close
          </Button>
          <Button color="primary" onClick={handleConfirmPortLoading}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SdiRedirectList;
