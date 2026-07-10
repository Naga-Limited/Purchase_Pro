import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Row,
  Col,
  FormGroup,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Badge,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { useLoader } from '../../utility/hooks/useLoader';
import { errorToast, ShowToast } from '../../helper/appHelper';
import TableComponent from "../common/TableComponent";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import { apiBaseUrl } from '../../urlConstants';
import { useSelector } from "react-redux";
import moment from "moment";
import { Printer, X } from "react-feather";
import VehicleStatusCheck from "./VehicleStatusCheck";
import QRCode from "react-qr-code";
import { Modal } from "react-bootstrap";

export const taColumns = [
  { name: "Va Number", selector: "vaNumber", sortable: true, minWidth: "160px" },
  { name: "Created At", selector: "createdOn", sortable: true, minWidth: "130px" },
  { name: "Vehicle Number", selector: "vehicleNo", sortable: true, minWidth: "170px" },
  { name: "Movement Name", selector: "movementName", sortable: true, minWidth: "130px" },
  { name: "Module ", selector: "moduleType", sortable: true, minWidth: "130px" },
  { name: "Plant Name", selector: "PLANT_NAME", sortable: true, minWidth: "130px" },
  {
    name: "Waiting At",
    selector: "waitingAtStatusName",
    sortable: true,
    minWidth: "190px",
    wrap: true,
    cell: (row) => {
      // const statusName = statusIdToName[row.status] || '';
      return <Badge color="primary">{row.waitingAtStatusName}</Badge>;
    },
  },
];

const Rmovementchange = ({ title, url, actionRendorer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [movementType, setMovementType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [moduleStatus, setModuleStatus] = useState("");
  const [waitingStatus, setWaitingStatus] = useState("");
  const [newDropdownValue, setNewDropdownValue] = useState("");
  const [anotherDropdownValue, setAnotherDropdownValue] = useState(""); // State for new dropdown
  const [moduleTypeOptions, setModuleTypeOptions] = useState([]); // State for moduleType options
  const [additionalOptions, setAdditionalOptions] = useState([]); // State for options of the new dropdown

  const UserDetails = useSelector((state) => state.auth?.userData || {});
  const userRole = UserDetails.role;

  const editableModuleStatusIds = [23, 24, 27, 28, 31, 35, 40, 41]; // Array of moduleStatusId values that allow editing

  useEffect(() => {
    loadTableData(new Date(), new Date());
  }, []);

  const { showLoader, hideLoader } = useLoader();
  const [type, setType] = useState(true);

  const loadTableData = async (movementType) => {
    const postdata = {
      user_plantid: UserDetails.plantids.toString(),
      movementType,
    };
    apiPostMethod(apiBaseUrl + "Movementchangecontroller/getallgateinandoutdetail", postdata)
      .then((response) => {
        const { data } = response;
        setTableData(data.results);
      })
      .catch(() => errorToast("Something went wrong, please try again after some time"))
      .finally(() => hideLoader());
  };

  const fetchModuleTypeOptions = async (movementType) => {
    if (!movementType) return; // Avoid making API call if no movementType is selected

    showLoader();
    try {
      const postdata = { movementType }; // Pass the selected movementType
      const response = await apiPostMethod(
        apiBaseUrl + "Movementchangecontroller/moduletype",
        postdata
      );
      setModuleTypeOptions(response.data.results || []);
    } catch (error) {
      errorToast("Failed to fetch module types.");
    } finally {
      hideLoader();
    }
  };
  const getSubModuleType = (moduleTypeId) => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getSubModuleType/${moduleTypeId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          let submoduleAccessData 
          submoduleAccessData = data.results
          setAdditionalOptions(submoduleAccessData)

        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const handleFilter = () => {
    loadTableData(movementType?.value);
  };

  const openEditModal = (row) => {
    setSelectedRow(row);
    setVehicleNumber(row.vehicleNo || "");
    setMovementType(row.movementName || "");
    setRemarks("");
    setModuleStatus(row.moduleStatusId || "");
    setWaitingStatus(row.waitingAt || "");
    setNewDropdownValue("");
    setAnotherDropdownValue(""); // Reset the new dropdown value
    setModalOpen(true);
    fetchModuleTypeOptions(row.movementType);
    if(row.module_id == 40){
     getSubModuleType(row.module_id)
    }
  };

  const handleMovementTypeChange = (value1) => {
    setMovementType(value1);
    fetchModuleTypeOptions(value1.value); // Fetch module types when movement type changes
  };

  const JavascriptInArrayComponent = (element, ArrayData) => {
    var length = ArrayData.length;
    for (var i = 0; i < length; i++) {
      if (ArrayData[i] === element) {
        return true;
      }
    }
    return false;
  };

  const handleConfirm = async () => {
    if (!remarks) {
      errorToast("Please enter remarks.");
      return;
    }

    // if (!newDropdownValue ) {
    //   errorToast("Please select a Module Type.");
    //   return;
    // }

    const postData = {
      rowid: selectedRow?.id,
      truckno: vehicleNumber,
      vaNumber: selectedRow?.vaNumber,
      movementType: selectedRow?.movementType,
      moduleType: newDropdownValue.value || selectedRow?.module_id,
      moduleTypeName: newDropdownValue.label || selectedRow?.moduleType,
      remarks: remarks,
      waitingId: waitingStatus,
      moduleStatusId: moduleStatus,
      updated_by: UserDetails.USERID,
    };

    try {
      showLoader();
      const response = await apiPostMethod(apiBaseUrl + "Movementchangecontroller/saveMovementChange", postData);
      const data = response.data;
      if (data.InsID == true || data.InsID != 0) {
        ShowToast("Data saved successfully");
        loadTableData();
        setModalOpen(false);
      } else if (data.InsID == false) {
        errorToast(data.message, "Failed to save data.");
      }
    } catch (error) {
      errorToast("Something went wrong while saving the data.");
    } finally {
      hideLoader();
    }
  };

  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "130px",
    cell: (row) => (
      <>
        {(userRole === "Admin" ) &&
         <Button.Ripple color="primary" onClick={() => openEditModal(row)}>Edit</Button.Ripple>
        }&nbsp;
          <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(row.vehicleNo,row.moduleType)}> QR Print</Button.Ripple>
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];

  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      FromDate: new Date(),
      ToDate: new Date(),
    },
    validationSchema: Yup.object().shape({}),
    onSubmit: (values) => { },
  });
  const [show, setShow] = useState(false);
  const [qrImage, setqrImage] = useState('');
  const closeRemarksModal = () => setShow(false);

  const reject = (moduleStatusId) => {

    const formData = form.values;

    const postdata = {
        gateInOutInfoId: selectedRow?.id,
        moduleStatusId: moduleStatusId.moduleStatusId,
        rejectReasonId: 10,
        userInfoId: UserDetails.USERID
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata)
        .then((response) => {
            const data = response.data;
            if (data.success == true) {
                ShowToast(data.message)
                // redirect()
                loadTableData();
                setModalOpen(false);
            }
            else if (data.success == false) {
                errorToast(data.message)
                // redirect()
                loadTableData();
                setModalOpen(false);
            }
        })
        .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
            hideLoader();
        });
  };
  const [moduleType, setModuleType] = useState('')
  const onActionClick = (Image,moduleType) => {
    setShow(true)
    // setData();
    setModuleType(moduleType)
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
          <title>QR Print (${moduleType})</title>
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
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Movement Status Check</CardTitle>
        </CardHeader>
        <CardComponent>
        <div className="row">
          <div className="col-1"></div>
          <div className="col-10">
            <Row>
              {type ? <Col md="6" sm="6" className="d-flex justify-content-center bg-primary border border-primary" onClick={() => setType(true)}>
                <Button className='text-white' color="white">Vehicle Pending List </Button>
              </Col> : <Col md="6" sm="6" className="d-flex justify-content-center mb-0 border border-primary" onClick={() => setType(true)}>
                <Button className='text-primary' color="white">Vehicle Pending List </Button>
              </Col>}

              {!type ? <Col md="6" sm="6" className="d-flex justify-content-center bg-primary border border-primary" onClick={() => { setType(false) }}>
                <Button className='text-white' color="white">Check Vehicle Status</Button>
              </Col> : <Col md="6" sm="6" className="d-flex justify-content-center mb-0 border border-primary" onClick={() => { setType(false) }}>
                <Button className='text-primary' color="white">Check Vehicle Status</Button>
              </Col>}
            </Row>
          </div>
        </div>
        {type &&
        <>
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}Movementchangecontroller/movementtype`}
                  label={"Movement Type"}
                  form={form}
                  id="movementtype_id"
                  name="movementtype_id"
                  value={movementType}
                  onChange={handleMovementTypeChange}
                />
              </FormGroup>
            </Col>
            <Col md="12" sm="12">
              <br />
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" id="add" type="button" onClick={handleFilter}>
                  Filter
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
          </>}
        </CardComponent>
        {type &&
        <CardBody>
          <TableComponent showDownload columns={columns} data={tableData} />
        </CardBody> }
      </Card>
        {type == false &&
            <VehicleStatusCheck></VehicleStatusCheck>
        }
      {/* Modal for Edit */}
      <Modal show={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered size='xl'>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Edit Movement</ModalHeader>
        <ModalBody>
          <Row>
            {selectedRow?.module_id && (userRole === "Admin" || userRole === "WB OPERATOR" || userRole === "Manager") && (
              <Col md="3">
                <FormGroup>
                  <Label for="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Enter vehicle number"
                    disabled={selectedRow.module_id != 39}
                  />
                </FormGroup>
              </Col>
            )}
            {selectedRow?.moduleType && (
              <Col md="3">
                <FormGroup>
                  <Label for="moduleType">Module Type</Label>
                  <Input
                    id="moduleType"
                    value={selectedRow.moduleType} // Display the moduleType from selectedRow
                  disabled
                  />
                </FormGroup>
              </Col>
            )}
            
            <Col md="3">
              <FormGroup>
                <Label for="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks"
                />
              </FormGroup>
            </Col>
           
            <Col md="3">
              <FormGroup>
                <CustomDropdownInput
                  options={moduleTypeOptions}
                  label={"Module Type"}
                  form={form}
                  id="moduletype_id"
                  name="moduletype_id"
                  value={newDropdownValue}
                  onChange={(value) => setNewDropdownValue(value)}
                  isDisabled = {userRole != "Admin"}
                />
              </FormGroup>
            </Col>
            
          </Row>

          {/* Conditionally show additional dropdown when module_id is 40 */}
          {selectedRow?.module_id == 40 && (
            <Row>
              <Col md="3">
                <FormGroup>
                  <CustomDropdownInput
                    options={additionalOptions}
                    label={"Another Dropdown"}
                    form={form}
                    id="another_dropdown_id"
                    name="another_dropdown_id"
                    value={anotherDropdownValue}
                    onChange={(value) => setAnotherDropdownValue(value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          {userRole === "Admin" && (
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="moduleStatus">Module Status</Label>
                  <Input
                    id="moduleStatus"
                    value={moduleStatus}
                    onChange={(e) => setModuleStatus(e.target.value)}
                    placeholder="Enter module status"
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="waitingStatus">Waiting Status</Label>
                  <Input
                    id="waitingStatus"
                    value={waitingStatus}
                    onChange={(e) => setWaitingStatus(e.target.value)}
                    placeholder="Enter waiting status"
                  />
                </FormGroup>
              </Col>
            </Row>
          )}
        </ModalBody>

        <ModalFooter>
        <div style={{ float: 'left' }}>

         {(selectedRow?.moduleStatusId == 3 || selectedRow?.moduleStatusId == 4 ) && (userRole === "Admin" || userRole === "WB OPERATOR" || userRole === "Manager")?
              <Button.Ripple color="danger" type="button" onClick={() => reject({ moduleStatusId: 2 })}>
                  <X size={16} /> 2nd WT Reject
              </Button.Ripple> : null
          }
          {(selectedRow?.moduleStatusId == 2) && (userRole === "Admin" || userRole === "WB OPERATOR" || userRole === "Manager") ?
              <Button.Ripple className="ml-2" color="danger" type="button" onClick={() => reject({ moduleStatusId: 1 })}>
                  <X size={16} /> 1st WT Reject
              </Button.Ripple> : null
          }
          </div>
          <Button color="primary" onClick={handleConfirm}>Confirm</Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
      
      {/*Model for QR Print */}

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

export default Rmovementchange;
