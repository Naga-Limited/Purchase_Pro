import { Card, CardHeader, CardBody, FormGroup, Col, Button, Row, Input, Label } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useEffect } from "react";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useLoader } from "../../utility/hooks/useLoader";
import { Modal } from "react-bootstrap";
import { Check, X } from "react-feather";
import Uploader from "../Uploader";

export const taColumns = [
  {
    name: "TRUCK NO",
    selector: "vehicleNo",
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
  }
];

const WithOutGateInInfo = ({ actionRendorer }) => {

  const actionsCol = {
    name: "ACTIONS",
    selector: "status",
    minWidth: "100px",
    cell: (row) => {
      return actionRendorer ? (
        actionRendorer(row)
      ) : (
        <Row>
          <Button color="primary" size="sm" type="button" className='ml-1' onClick={() => onActivate(row)}>Approve</Button>
        </Row>
      );
    },
  };

  const [show, setShow] = useState(false);
  const [selectedData, setSelectedData] = useState([])
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  let { showLoader, hideLoader } = useLoader();
  const [gateInOutInfoData, setGateInOutInfoData] = useState([])
  const [poData, setPoData] = useState([])
  const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };
  useEffect(() => {
    getAllGateInOutInfo()
  }, [])

  const onActivate = (row) => {
    console.log(row);
    setSelectedData(row)
    setShow(true)
    getPurchaseOrder(row.loadingUnloadingInfoId, row.gateInOutInfoId)
  }

  const getPurchaseOrder = (loadingUnloadingInfoId, gateInOutInfoId) => {
    console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}/${gateInOutInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}/${gateInOutInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setPoData(data.results)
        }
        else if (data.success == false) {
          // errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getAllGateInOutInfo = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/5/${UserDetails.USERID}/0`);
    apiGetMethod(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/5/${UserDetails.USERID}/0`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setGateInOutInfoData(data.results)
        }
        else if (data.success == false) {
          console.log(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const approveVehicleStatus = () => {

    const postData = {
      loadingUnloadingInfoId: selectedData.loadingUnloadingInfoId,
      userInfoId: UserDetails.USERID,
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/approveVehicleStatus", postData)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
          setGateInOutInfoData([])
          getAllGateInOutInfo()
          setShow(false)
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
  };

  const submit = (fdata) => {
    if (!fdata.invoiceCopy ) {
        errorToast("Please Attach Invoice Copy")
    } else {
      updateVehicleStatus(fdata)
    }
  }
  const updateVehicleStatus = (fdata) => {
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
        .then((response) => {
            const res = response.data;
            if (res.success == true) {
              approveVehicleStatus()
            }
            else if (res.success == false) {
                errorToast(res.message)
            }
        })
        .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
        })
   }
  const upload = () => {

    const fdata = {
      gateInOutInfoId: selectedData.gateInOutInfoId,
      moduleStatusId: 5,
      remarks: '',
      userInfoId: UserDetails.USERID,
    }

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

    if (keys.length > 0) {
        let postdata = new FormData();
        console.log(postdata);
        let { invoiceCopy } = postdata;

        postdata.append("image[]", invoiceCopy);

        let UploadFile = 0;
        let UploadFile1 = 0;

        Object.keys(attachedFiles).forEach((key) => {
            postdata.append("file[]", attachedFiles[key]);
        });

        UploadFile = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;

        postdata.append("form_name", selectedData.moduleType);
        postdata.append("SubFolder", "FG_GateOut");
        showLoader();
        apiPostMethod(sapFileShare, postdata, "File")
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
                    submit(fdata)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    } else {
        submit(fdata)
    }
  };
  const columns = [...taColumns, actionsCol];

  return (
    <div>
      <Card>
        <CardHeader><h5>Without Gate In Info</h5></CardHeader>
        <hr />
        <CardBody>
          <TableComponent columns={columns} data={gateInOutInfoData} />
        </CardBody>
      </Card>

      <Modal show={show} centered size="xl">
        <CardHeader>
          <Row>
            <Col sm="10" md="10">
              <FormGroup className="d-flex justify-content-start mb-0">
                <h4>Without Gate In Details</h4>
              </FormGroup>
            </Col>
            <Col sm="2" md="2">
              <FormGroup className="d-flex justify-content-end mb-0">
                <X color="red" onClick={() => setShow(false)} size={20} />
              </FormGroup>
            </Col>
          </Row>
        </CardHeader>
        <Modal.Body>
          <Row>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Type</Label>
                <Input placeholder="Purpose" value={selectedData.moduleType} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Truck No</Label>
                <Input placeholder="Truck No" value={selectedData.vehicleNo} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Va Number</Label>
                <Input placeholder="Truck No" value={selectedData.vaNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Plant</Label>
                <Input placeholder="Plant Name" value={selectedData.werks + ' - ' + selectedData.plantName} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Phone No</Label>
                <Input placeholder="Phone No" value={selectedData.driverMobileNumber} disabled />
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
                                    <label></label>
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <div className="mr-1">
                                            <div style={{ marginBottom: "7px" }}></div>
                                            <Label><b>Attachments :</b></Label>
                                        </div>
                                        <div className="mr-1">
                                            <Uploader
                                                setAttachment={handleFileChange}
                                                title="Invoice Copy / Delivery Document Slip"
                                                id={"invoiceCopy"}
                                                selectedFileName={attachedFiles.invoiceCopy.name}
                                            />
                                        </div>
                                    </FormGroup>
             </Col> 
            {poData != '' ? <>
              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="12" sm="12">
                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
              </Col>

              {poData.map((poDetails) => (<>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>PO Number</Label>
                    <Input type="text" placeholder="PO Number" value={poDetails?.poNumber} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>PO Type</Label>
                    <Input type="text" placeholder="Po Type" value={poDetails.name} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Plant</Label>
                    <Input type="text" placeholder="PO Number" value={poDetails?.plantName} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Vendor Name</Label>
                    <Input type="text" placeholder="Vendor Name" value={poDetails.vendorName} disabled />
                  </FormGroup>
                </Col>
              </>))}
            </> : null}

            <Col md="12" sm="12" >
              <FormGroup className='d-flex justify-content-center'>
                <Button color="primary" type="button" onClick={upload}>
                  <Check size={16} /> Approve
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WithOutGateInInfo;
