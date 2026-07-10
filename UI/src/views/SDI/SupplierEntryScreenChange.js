import {
  Card, CardHeader, CardBody, Button, Row, FormGroup, Col,
  Label, Modal, ModalHeader, ModalBody, ModalFooter, Input,
  InputGroup
} from "reactstrap";
import React, { useEffect, useState } from "react";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast, status } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { X, Edit2, Save, Search, CheckCircle, Delete } from "react-feather";
import Uploader from "../Uploader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { min } from "moment";

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
        {editMode && (
          <Uploader
            title={'ReAttach'}
            setAttachment={handleFileChange}
            id={newKey}
            selectedFileName={attachedFile?.name || ""}
          />
        )}
      </FormGroup>
    </Col>
  );
};

const SupplierEntryScreenChange = () => {
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
      status: record.status || ""
    };
    
    setOriginalRecord({ ...recordData });
    setSelectedRecord(recordData);
    setEditMode(false);
    setPoValidated(false); // Reset on open
    setButtonDisable(true); // Reset button
    setShowDetailsModal(true);
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

  // Fetch PO details and populate fields
  const getPoDetails = async () => {
    if (!selectedRecord.poNumber.trim()) {
      errorToast("Please enter PO Number");
      return;
    }

    try {
      showLoader();
      const reqBody = { 
        poNumber: selectedRecord.poNumber, 
        userId: UserDetails.USERID,
        role: UserDetails.role,

      };

      const response = await apiPostMethod(
        apiBaseUrl + "SupplierDispatch/getSDIPoDetails", 
        reqBody
      );

      const { data } = response;
      
      if (data.success === true && Array.isArray(data.data) && data.data.length) {
        const po = data.data[0];
        
        // Validate Purchase Mode
        if (po.PURCHASE_GROUP_DESCRIPTION !== selectedRecord.purchaseMode) {
          errorToast("Invalid PO Number for the selected Purchase Mode");
          setPoValidated(false);
          setButtonDisable(true);
          return;
        }
        if (po.VENDOR_CODE !== selectedRecord.brokerCode) {
          if(po.SUPPLIER_CODE !== selectedRecord.supplierCode){
            errorToast("Invalid PO Number for the selected Vendor");
            setPoValidated(false);
            setButtonDisable(true);
            return;
          }
        }
        // Update selectedRecord with PO details
        setSelectedRecord(prev => ({
          ...prev,
          purchaseMode: po.PURCHASE_GROUP_DESCRIPTION || prev.purchaseMode,
          supplierName: prev.supplierName,
          brokerName: prev.brokerName,
          contractNo: prev.contractNo,
          noOfTrucks: po.NUMBER_OF_VEHICLES || prev.noOfTrucks,
          brokerCode: po.VENDOR_CODE || prev.brokerCode,
          supplierCode: po.SUPPLIER_CODE || prev.supplierCode,
          poQty: po.VENDOR_QUANTITY || prev.poQty,
          loadingDueDate: po.PO_LOADING_DATE || prev.loadingDueDate
        }));
        
        // On success - disable PO field and enable save button
        setPoValidated(true);
        setButtonDisable(false);
        setPurchaseOrderDetails(data.data);
        ShowToast("PO validated successfully");
      } else {
        errorToast(data.message || "PO not found");
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

  // 1. Upload attachments first
  const uploadAttachments = async (filesObj) => {
    const postData = new FormData();
    postData.append("form_name", "SDI");
    postData.append("SubFolder", "SupplierDispatch");

    if (filesObj.invoiceCopy)   postData.append('file[]', filesObj.invoiceCopy);
    if (filesObj.wbCopy)        postData.append('file[]', filesObj.wbCopy);
    if (filesObj.ewayBillCopy)  postData.append('file[]', filesObj.ewayBillCopy);
    if (filesObj.rrCopy)        postData.append('file[]', filesObj.rrCopy);

    try {
      showLoader();
      const response = await apiPostMethod(sapFileShare, postData, "File");
      const { data } = response;
      
      if (!data.success || !data.files) {
        errorToast(data.message || "Attachment upload failed");
        return null;
      }

      const uploadedPaths = {};
      const fileOrder = ['invoiceCopy', 'wbCopy', 'ewayBillCopy', 'rrCopy'];
      
      data.files.forEach((uploadedFile, index) => {
        const fieldType = fileOrder[index];
        if (filesObj[fieldType]) {
          uploadedPaths[fieldType] = uploadedFile.updname;
        }
      });

      return uploadedPaths;
    } catch {
      errorToast("Attachment upload failed");
      return null;
    } finally {
      hideLoader();
    }
  };

  // 2. Update supplier details with uploaded paths (only changed fields)
  const updateSupplierDetails = async (uploadedPaths) => {
    const payload = {};

    const changedFields = getChangedFields();
    Object.entries(changedFields).forEach(([key, value]) => {
      if (!key.startsWith('new')) {
        payload[key] = value;
      }
    });

    payload.poNumber = selectedRecord.poNumber;
    payload.invoiceNo = selectedRecord.invoiceNo;
    payload.userId = UserDetails.USERID;
    payload.id = selectedRecord.id;
    if (uploadedPaths?.invoiceCopy)   payload.invoiceCopy = uploadedPaths.invoiceCopy;
    if (uploadedPaths?.wbCopy)        payload.wbCopy = uploadedPaths.wbCopy;
    if (uploadedPaths?.ewayBillCopy)  payload.ewayBillCopy = uploadedPaths.ewayBillCopy;
    if (uploadedPaths?.rrCopy)        payload.rrCopy = uploadedPaths.rrCopy;

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    try {
      showLoader();
      const res = await apiPostMethod(
        `${apiBaseUrl}SupplierDispatch/updateSupplierDetails`,
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
  const saveChanges = async () => {
    if (!selectedRecord.invoiceNo.trim()) {
      errorToast("Invoice No is required");
      return;
    }

    const filesToUpload = {
      invoiceCopy: selectedRecord.newInvoiceCopy,
      wbCopy: selectedRecord.newWbCopy,
      ewayBillCopy: selectedRecord.newEwayBillCopy,
      rrCopy: selectedRecord.newRrCopy
    };

    const hasFiles = Object.values(filesToUpload).some(file => file !== null);

    if (hasFiles) {
      const uploadedPaths = await uploadAttachments(filesToUpload);
      if (uploadedPaths === null) return;
      await updateSupplierDetails(uploadedPaths);
    } else {
      await updateSupplierDetails({});
    }
  };

  const columns = [
    ...taColumns,
    {
      name: "ACTIONS",
      minWidth: "150px",
      cell: row => (
        <Button size="sm" color="primary" onClick={() => overAllDetails(row)}>
          <Edit2 size={12} /> View / Edit
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
  
  return (
    <div>
      <Card>
        <CardHeader><h5>Supplier Entry Screen Change</h5></CardHeader>
        <CardBody>
          <TableComponent showDownload columns={columns} data={landingData} />
        </CardBody>
      </Card>

      <Modal isOpen={showDetailsModal} size="xl">
        <ModalHeader toggle={() => setShowDetailsModal(false)}>
          Supplier Entry – {selectedRecord?.poNumber}
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
                      <Button
                        color={poValidated ? "success" : "primary"}
                        type="button"
                        onClick={getPoDetails}
                        disabled={!editMode}
                      >
                        <Search size={16} />
                      </Button>
                    </InputGroup>
                    {poValidated && <small style={{color: 'green', fontWeight: 'bold'}}>✓ PO Validated & Locked</small>}
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
                {selectedRecord.noOfWagan && (
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

                {/* FILES */}
                  <FileUploadField 
                    label="Invoice Copy" 
                    oldFile={selectedRecord.invoiceCopy} 
                    newKey="newInvoiceCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                {selectedRecord.purchaseMode !== 'Rake' && (
                  <FileUploadField 
                    label="WB Copy" 
                    oldFile={selectedRecord.wbCopy} 
                    newKey="newWbCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
                {selectedRecord.purchaseMode !== 'Rake' && (
                  <FileUploadField 
                    label="Eway Bill Copy" 
                    oldFile={selectedRecord.ewayBillCopy} 
                    newKey="newEwayBillCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
                {selectedRecord.purchaseMode == 'Rake' && (
                  <FileUploadField 
                    label="RR Copy" 
                    oldFile={selectedRecord.rrCopy} 
                    newKey="newRrCopy" 
                    editMode={editMode}
                    onFileChange={updateField} 
                  />
                )}
              </Row>
            </CardBody></Card>
          )}
        </ModalBody>

        <ModalFooter>
          {!editMode && selectedRecord?.status == 1 && UserDetails.role !== 'Vendor' &&(
             <Button 
              color="danger" 
              onClick={rejectTheVehicle} 
              disabled={!buttonDisable}
            >
              <Delete size={16} /> Reject
            </Button>)}
          {/* <Button color="secondary" onClick={() => setShowDetailsModal(false)}>
            <X size={16} /> Close
          </Button> */}

          {!editMode && selectedRecord?.status == 1 && UserDetails.role !== 'Vendor' &&(
            <Button color="primary" onClick={() => setEditMode(true)}>
              <Edit2 size={16} /> Edit
            </Button>
          )}
            
          {editMode && (
            <Button 
              color="success" 
              onClick={saveChanges} 
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

export default SupplierEntryScreenChange;
