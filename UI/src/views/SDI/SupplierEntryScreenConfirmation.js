import {
  Card, CardHeader, CardBody, Button, Row, FormGroup, Col,
  Label, Modal, ModalHeader, ModalBody, ModalFooter, Input,
  InputGroup
} from "reactstrap";
import React, { useEffect, useState } from "react";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl, mvessUrl, sapFileShare } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast, status } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { X, Edit2, Save, Search, CheckCircle, Delete } from "react-feather";
import Uploader from "../Uploader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { min } from "moment";
import Select from "react-select";

export const taColumns = [
  { name: "Truck / Container / FNR No", selector: "truckNo", sortable: true, minWidth: "120px" },
  { name: "PO NO", selector: "poNumber", sortable: true },
  { name: "Supplier Name", selector: "supplierName", sortable: true, minWidth: "200px"},
  { name: "Vendor Name", selector: "brokerName", sortable: true, minWidth: "200px"},
  { name: "Invoice No", selector: "invoiceNo", sortable: true, minWidth: "100px", },
  { name: "Invoice Date", selector: "invoiceDateFormatted", sortable: true, minWidth: "100px", },
  { name: "Invoice Qty", selector: "invoiceQty", sortable: true, minWidth: "70px", },
  { name: "Purchase Mode", selector: "purchaseMode", sortable: true, minWidth: "70px" },
  { name: "Waiting At", selector: "statusName", sortable: true, minWidth: "170px", 
      cell: (row) => {
          return  (
            <>
            {row?.status == 1 && !row.changedAt ? <span className="badge rounded-pill bg-info">
              {'Confirmation'}
            </span> : row?.status == 1 && row.changedAt ? <span className="badge rounded-pill bg-secondary">
              {'Changed / Confirmation'}
            </span> : row.status == 0 ? <span className="badge rounded-pill bg-danger">
              {'Rejected'}
            </span> :
            <span className="badge rounded-pill bg-success">
              {'Completed'}
            </span>}
            </>
          );
       },
  },
];
const FileUploadField = ({ label, oldFile, newKey, editMode, onFileChange }) => {
  const [attachedFile, setAttachedFile] = useState(null);

  const handleFileChange = (file) => {
    setAttachedFile(file);
    onFileChange(newKey, file);
  };

  return (
    <Col md={3}>
      <FormGroup>
        <Label>{label}</Label>
        {oldFile && (
          <div className="mb-1">
            <Button
              size="sm"
              color="primary"
              onClick={() => window.open(oldFile, "_blank")}
            >
              View
            </Button>
          </div>
        )}
        {/* {editMode && (
          <Uploader
            title={'ReAttach'}
            setAttachment={handleFileChange}
            id={newKey}
            selectedFileName={attachedFile?.name || ""}
          />
        )} */}
      </FormGroup>
    </Col>
  );
};

const SupplierEntryScreenConfirmation = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector(state => state?.auth?.userData || {});

  const [landingData, setLandingData] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [originalRecord, setOriginalRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const [poValidated, setPoValidated] = useState(false); // Track PO search success
  const [buttonDisable, setButtonDisable] = useState(true);

  useEffect(() => {
    getLoadingData();
  }, []);

  const getLoadingData = async () => {
    try {
      showLoader();
      const res = await apiPostMethod(
        `${apiBaseUrl}SupplierDispatch/getSupplierDetailsInfo/1/${UserDetails.USERID}`
      );
      if (res.data.success) setLandingData(res.data.results);
      else errorToast(res.data.message);
    } catch {
      errorToast("Failed to load data");
    } finally {
      hideLoader();
    }
  };

  const overAllDetails = record => {
    
    const recordData = {
      poNumber: record.poNumber || "",
      purchaseMode: record.purchaseMode || "",
      supplierName: record.supplierName || "",
      brokerName: record.brokerName || "",
      contractNo: record.contractNo || "",
      noOfTrucks: record.noOfTrucks || "",
      loadingPoint: record.loadingPoint || "",
      linerName: record.linerName || "",
      loadingDate: record.loadingDate || "",
      invoiceQty: record.invoiceQty || "",
      invoiceDate: record.invoiceDate || "",
      invoiceNo: record.invoiceNo || "",
      invoiceRate: record.invoiceRate || "",
      expectedArrivalDt: record.expectedArrivalDt || "",
      truckNo: record.truckNo || "",
      noOfWagan: record.noOfWagan || "",
      driverNo: record.driverNo === 0 ? "" : record.driverNo || "",
      invoiceCopy: record.invoiceCopy || "",
      wbCopy: record.wbCopy || "",
      ewayBillCopy: record.ewayBillCopy || "",
      rrCopy: record.rrCopy || "",
      brokerCode: record.brokerCode || "",
      supplierCode: record.supplierCode || "",
      poQty: record.poQty || "",
      loadingDueDate: record.loadingDueDate || "",
      newInvoiceCopy: null,
      newWbCopy: null,
      newEwayBillCopy: null,
      newRrCopy: null,
      id: record.id || "",
      status: record.status || "",
    };
    
    setOriginalRecord({ ...recordData });
    setSelectedRecord(recordData);
    // setEditMode(false);
    setPoValidated(false); // Reset on open
    // setButtonDisable(true); // Reset button
    setShowDetailsModal(true);
    getPoDetails(record.poNumber, record.brokerCode ,record.supplierCode);
    onFetchVessel()
  };

 

  const updateField = (field, value) => {
    // If PO number is changed, reset validation
    if (field === "poNumber" && value !== selectedRecord.poNumber) {
      setPoValidated(false);
      setButtonDisable(true);
    }
    setSelectedRecord(prev => ({ ...prev, [field]: value }));
  };

  // Helper to get changed fields only
  const getChangedFields = () => {
    if (!originalRecord) return {};
    
    const changed = {};
    Object.keys(selectedRecord).forEach(key => {
      if (key.startsWith('new')) {
        if (selectedRecord[key] !== null) {
          changed[key] = selectedRecord[key];
        }
        return;
      }
      
      if (selectedRecord[key] !== originalRecord[key] && 
          selectedRecord[key] !== '') {
        changed[key] = selectedRecord[key];
      }
    });
    return changed;
  };

 const getPoDetails = async (poNumber, brokerCode,supplierCode) => {
  if (!poNumber.trim()) {
    errorToast("Please check PO Number");
    return;
  }
  if (!brokerCode?.trim()) {
    errorToast("Please check Vendor Code");
    return;
  }
  
  try {
    showLoader();
    const reqBody = { 
      poNumber: poNumber, 
      brokerCode: brokerCode, 
      userId: UserDetails.USERID,
      role: UserDetails.role,
      supplierCode:supplierCode
    };

    const response = await apiPostMethod(
      apiBaseUrl + "SupplierDispatch/insertSDIPoDetails", 
      reqBody
    );

    const { data } = response;
    
    if (data.success === true && Array.isArray(data.vendorInfo) && data.vendorInfo.length > 0) {
      // ✅ Use vendorInfo (matches backend)
      setPoValidated(true);
      setPurchaseOrderDetails(data.vendorInfo);  // PO lines for table
      ShowToast("PO validated successfully");
      
      // Optional: Use first record to populate header/single values
      const firstPo = data.vendorInfo;
      setPurchaseOrderDetails(firstPo); // if needed
      
    } else {
      errorToast(data.message || "PO not found");
      setPurchaseOrderDetails([]); // Clear PO lines
      setPoValidated(false);
      setButtonDisable(true);
    }
  } catch (error) {
    console.error("Error fetching PO details:", error);
    errorToast("Something went wrong, please try again");
    setPoValidated(false);
    setButtonDisable(true);
  } finally {
    hideLoader();
  }
};


  // 2. Update supplier details with uploaded paths (only changed fields)
  const updateSupplierDetails = async () => {
    const payload = {
      ...selectedRecord,
      userId: UserDetails.USERID,
      userName: UserDetails.FIRSTNAME,
      id: selectedRecord.id
    };
    if(!selectedRecord.vessalName && selectedRecord.purchaseMode === 'Container'){
        errorToast("Please select Vessel Name");
        return;
    }
    try {
      showLoader();
      const res = await apiPostMethod(
        `${apiBaseUrl}SupplierDispatch/submitSupplierDispatch`,
        payload
      );
      const data = res.data;
      if (data.success === true) {
        // ShowToast("Updated successfully");
        setOriginalRecord({ ...selectedRecord });
        setShowDetailsModal(false);
        setEditMode(false);
        getLoadingData();
        confirmDialog({
            title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
        }).then(() => {
            window.location.reload();  // Reloads the page after the confirm dialog is closed
        });
      } else {
         confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
          }).then(() => {
          });
      }
    } catch {
      errorToast("Update failed");
    } finally {
      hideLoader();
    }
  };

  // 3. Main save handler - chains both APIs
  

  const columns = [
    ...taColumns,
    {
      name: "ACTIONS",
      minWidth: "80px",
      cell: row => (
        <Button size="sm" color="primary" onClick={() => overAllDetails(row)}>
          <CheckCircle size={12} /> Confirm
        </Button>
      )
    }
  ];
  const rejectTheVehicle = async () => {
    const payload = {};

    payload.userId = UserDetails.USERID;
    payload.id = selectedRecord.id;
    payload.status = "0";
    const confirm = await confirmDialog({
    title: "Are you sure to Reject?",
    });

    if (!confirm) return;
    try {
      
      showLoader();
      const res = await apiPostMethod(
        `${apiBaseUrl}SupplierDispatch/updateSupplierRejectDetails`,
        payload
      );
      const data = res.data;
      if (data.success === true) {
        // ShowToast("Updated successfully");
        setOriginalRecord({ ...selectedRecord });
        setShowDetailsModal(false);
        setEditMode(false);
        getLoadingData();
        confirmDialog({
            title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
        }).then(() => {
            window.location.reload();  // Reloads the page after the confirm dialog is closed
        });
      } else {
         confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false, confirmText: false, confirmButton: false, background: `#dc3545`
          }).then(() => {
          });
      }
    } catch {
      errorToast("Update failed");
    } finally {
      hideLoader();
    } }
   const onLineItemchange = (e) => {
      // const { value } = e;
      const label = e.label;
      const value = e.value;
      const IDNLF = e.IDNLF;
      const MATNR = e.MATNR;
      const LGORT = e.LGORT;
      const INCO1 = e.INCO1;
      const SGT_SCAT = e.SGT_SCAT;
      const NETPR = e.NETPR;
      setSelectedRecord(prev => ({
        ...prev,
        poLineItem: label,
        plantCode: value,
        IDNLF: IDNLF,
        MATNR: MATNR,
        LGORT: LGORT,
        INCO1: INCO1,
        SGT_SCAT:SGT_SCAT,
        invoiceRate: NETPR
      }));
    setButtonDisable(false);
  };
  const onTextChange = (e) => {
      const { value } = e;
      const label = e.value;
     
      setSelectedRecord(prev => ({
        ...prev,
        vessalName: label,
        vessalId: value
      }));
    setButtonDisable(false);
  };
  const [vesselOptions, setVesseldata] = useState([]);
  const onFetchVessel = () => {
    apiGetMethod(mvessUrl)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setVesseldata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  return (
    <div>
      <Card>
        <CardHeader><h5>Supplier Entry Confirmation</h5></CardHeader>
        <CardBody>
          <TableComponent showDownload columns={columns} data={landingData} />
        </CardBody>
      </Card>

      <Modal isOpen={showDetailsModal} size="xl">
        <ModalHeader toggle={() => setShowDetailsModal(false)}>
          Supplier Entry Confirm – {selectedRecord?.poNumber}
        </ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Card><CardBody>
              <Row>
                {/* HEADER */}
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>
                      PO No {poValidated && <CheckCircle size={14} color="green" style={{display: 'inline', marginLeft: '5px'}} />}
                    </Label>
                    <InputGroup>
                      <Input 
                        disabled={!editMode || poValidated}
                        value={selectedRecord.poNumber}
                        onChange={e => updateField("poNumber", e.target.value)}
                        style={{
                          borderColor: poValidated ? '#28a745' : '',
                          backgroundColor: poValidated ? 'rgba(40, 167, 69, 0.1)' : ''
                        }}
                      />
                      
                    </InputGroup>
                    {poValidated && <small style={{color: 'green', fontWeight: 'bold'}}>✓ PO Validated & Locked</small>}
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>PO Line Item</Label>
                    <Select
                      options={purchaseOrderDetails}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: selectedRecord?.poLineItem, value: selectedRecord?.plantCode }}
                      onChange={(e) => onLineItemchange(e)}
                    />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Plant Code</Label>
                    <Input disabled value={selectedRecord?.plantCode} />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Material Code</Label>
                    <Input disabled value={selectedRecord?.MATNR + ' - ' + selectedRecord?.IDNLF} />
                  </FormGroup>
                </Col>
                 <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Storage Location</Label>
                    <Input disabled value={selectedRecord?.LGORT} />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Purchase Mode</Label>
                    <Input disabled value={selectedRecord.purchaseMode} />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Supplier Name</Label>
                    <Input disabled value={selectedRecord.supplierName} />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Label>Broker Name</Label>
                    <Input disabled value={selectedRecord.brokerName} />
                  </FormGroup>
                </Col>  
                <Col md={3}>
                  <FormGroup>
                    <Label>Contract No</Label>
                    <Input disabled value={selectedRecord.contractNo} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>No Of Trucks</Label>
                    <Input type="number" disabled value={selectedRecord.noOfTrucks} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Loading Point</Label>
                    <Input 
                      // disabled={!editMode} 
                      value={selectedRecord.loadingPoint}
                      onChange={e => updateField("loadingPoint", e.target.value)} 
                      disabled
                    />
                  </FormGroup>
                </Col>
                {selectedRecord.linerName && (
                <Col md={3}>
                  <FormGroup>
                    <Label>Liner Name</Label>
                    <Input 
                      // disabled={!editMode} 
                      value={selectedRecord.linerName}
                      onChange={e => updateField("linerName", e.target.value)}
                      disabled
                    />
                  </FormGroup>
                </Col>)}

                {/* INVOICE */}
                <Col md={3}>
                  <FormGroup>
                    <Label>Loading Date</Label>
                    <Input 
                      type="date" 
                      disabled={!editMode} 
                      value={selectedRecord.loadingDate}
                      onChange={e => updateField("loadingDate", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Invoice Qty</Label>
                    <Input 
                      type="number" 
                      disabled={!editMode} 
                      value={selectedRecord.invoiceQty}
                      onChange={e => updateField("invoiceQty", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Invoice Date</Label>
                    <Input 
                      type="date" 
                      disabled={!editMode} 
                      value={selectedRecord.invoiceDate}
                      onChange={e => updateField("invoiceDate", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Invoice No</Label>
                    <Input 
                      disabled={!editMode} 
                      value={selectedRecord.invoiceNo}
                      onChange={e => updateField("invoiceNo", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Invoice Rate</Label>
                    <Input 
                      disabled={!editMode} 
                      value={selectedRecord.invoiceRate}
                      onChange={e => updateField("invoiceRate", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                {/* LOGISTICS */}
                <Col md={3}>
                  <FormGroup>
                    <Label>Expected Arrival Date</Label>
                    <Input 
                      type="date" 
                      disabled={!editMode} 
                      value={selectedRecord.expectedArrivalDt}
                      onChange={e => updateField("expectedArrivalDt", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>
                      {selectedRecord.purchaseMode === 'Truck' ? 'Truck' : selectedRecord.purchaseMode === 'Container' ? 'Container' : 'FNR'} No
                    </Label>
                    <Input 
                      disabled={!editMode} 
                      value={selectedRecord.truckNo}
                      onChange={e => updateField("truckNo", e.target.value)} 
                    />
                  </FormGroup>
                </Col>
                {selectedRecord.noOfWagan > 0 && (
                <Col md={3}>
                  <FormGroup>
                    <Label>No Of Wagon</Label>
                    <Input 
                      disabled={!editMode} 
                      value={selectedRecord.noOfWagan}
                      onChange={e => updateField("noOfWagan", e.target.value)} 
                    />
                  </FormGroup>
                </Col>)} 
                {selectedRecord.driverNo !== "" && selectedRecord.driverNo !== "0" && (
                <Col md={3}>
                  <FormGroup>
                    <Label>Driver No</Label>
                    <Input 
                      disabled={!editMode} 
                      value={selectedRecord.driverNo}
                      onChange={e => updateField("driverNo", e.target.value)} 
                    />
                  </FormGroup>
                </Col>)}
                {selectedRecord?.purchaseMode === 'Container' && (
                <Col md="3">
                  <FormGroup>
                    <Label>Vessel Name</Label>
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      options={vesselOptions}
                      onChange={(e) => onTextChange(e, "VESSEL_NAME")}
                    />
                  </FormGroup>
                </Col>)}

                {/* FILES */}
                  <FileUploadField 
                    label="Invoice Copy" 
                    oldFile={selectedRecord.invoiceCopy} 
                    newKey="newInvoiceCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                {(selectedRecord.purchaseMode !== 'Rake' && selectedRecord.purchaseMode !== 'Cm Rake') && (
                  <FileUploadField 
                    label="WB Copy" 
                    oldFile={selectedRecord.wbCopy} 
                    newKey="newWbCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
                {(selectedRecord.purchaseMode !== 'Rake' && selectedRecord.purchaseMode !== 'Cm Rake') && (
                  <FileUploadField 
                    label="Eway Bill Copy" 
                    oldFile={selectedRecord.ewayBillCopy} 
                    newKey="newEwayBillCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
                {(selectedRecord.purchaseMode == 'Rake' || selectedRecord.purchaseMode == 'Cm Rake') && (
                  <FileUploadField 
                    label="RR Copy" 
                    oldFile={selectedRecord.rrCopy} 
                    newKey="newRrCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
              </Row>

              <table className="table mt-2">
                <thead>
                  <tr>
                    <th>PO Line Item</th>
                    <th>Plant Code</th>
                    <th>Material Code</th>
                    <th>Storage Location</th>
                    <th>Loading Charge</th>
                    <th>Unloading Charge</th>
                    {/* <th>Broker Name</th> */}
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrderDetails && purchaseOrderDetails.length > 0 ? (
                    purchaseOrderDetails.map((item, index) => (
                      <tr key={index}>
                        <td>{item.label}</td>
                        <td>{item.value}</td>
                        <td>{item.MATNR} - {item.IDNLF}</td>
                        <td>{item.LGORT}</td>
                        <td>{item.Loading_cost}</td>
                        <td>{item.Unloading_cost}</td>
                        {/* <td>{selectedRecord.brokerName}</td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No PO details found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody></Card>
          )}
        </ModalBody>

        <ModalFooter>
          {selectedRecord?.status == 1 && (
             <Button 
              color="danger" 
              onClick={rejectTheVehicle} 
              // disabled={!buttonDisable}
            >
              <Delete size={16} /> Reject
            </Button>)}
          {/* <Button color="secondary" onClick={() => setShowDetailsModal(false)}>
            <X size={16} /> Close
          </Button> */}

          {/* {!editMode && (
            <Button color="primary" onClick={() => setEditMode(true)}>
              <Edit2 size={16} /> Edit
            </Button>
          )} */}
            
          {!editMode && (
            <Button 
              color="success" 
              onClick={updateSupplierDetails}
              disabled={buttonDisable}
            >
              <Save size={16} /> Save
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SupplierEntryScreenConfirmation;
