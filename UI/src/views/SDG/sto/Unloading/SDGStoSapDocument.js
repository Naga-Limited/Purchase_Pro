import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { CustomDropdownInput, CustomTextInput, Yup } from '../../../forms/custom-form';
import { ArrowLeft, Check, X } from 'react-feather';
import { apiBaseUrl } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { Modal } from "react-bootstrap";
import { useParams } from "react-router";
import { useLoader } from '../../../../utility/hooks/useLoader';

const SDGStoSapDocument = () => {


  const [show, setShow] = useState(false);
  const closeRemarksModal = () => setShow(false);

  let { gateInOutInfoId } = useParams();

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();

  const [invoiceData, setInvoiceData] = useState([])
  const [data, setData] = useState([])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    reject() { },
  });

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);
          console.log(data.results[0]);
          setInvoiceData(data.invoiceInfo);
          getWeighmentInfo(data.results[0].gateInOutInfoId)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [weighmentData, setWeighmentData] = useState([])
  const [overAllWeight, setOverAllWeight] = useState('')

  const getWeighmentInfo = (gateInOutInfoId) => {
    console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setWeighmentData(data.data)
          let lastItem = data.data.slice(-1)[0]
          setOverAllWeight(lastItem)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getGateInInfo()
  }, [])

  const redirect = () => {
    history.push("/STO/SAPDocumentDetails");
  }

  const updateVehicleStatus = (type) => {

    const formData = form.values;

    const postdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: type == 'Reject' ? 2 : 4,
      rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
      userInfoId: UserDetails.USERID
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(type == 'Reject' ? "Rejected Successfully..." : res.message);
          redirect()
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



  return (
    <div>
      <Fragment>
        <Card>
          <CardHeader><h5>SDG - STO - Sap Document</h5></CardHeader>
          <hr></hr>
          <CardBody>
            <Row>
              <Col md="12" sm="12">
                <h4 className="text-primary"><u>General Info</u></h4><br />
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>VA No</Label>
                  <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Truck No</Label>
                  <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Driver Phone No</Label>
                  <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                </FormGroup>
              </Col>

              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="12" sm="12">
                <h4 className="text-primary"><u>Delivery Info</u></h4><br />
              </Col>

              {invoiceData.map((invoiceData) => (<>

                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>PO No</Label>
                    <Input typr="text" placeholder="Enter Delivery No" value={invoiceData?.poNumber} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Delivery No</Label>
                    <Input typr="text" placeholder="Enter Delivery No" value={invoiceData?.deliveryNumber} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Delivery Weight</Label>
                    <Input typr="text" placeholder="Enter Delivery Weight" value={invoiceData?.deliveryQty} disabled />
                  </FormGroup>
                </Col>
                <Col md="3" sm="3">
                  <FormGroup>
                    <Label>Rec Plant</Label>
                    <Input typr="text" placeholder="Enter Net Weight" value={invoiceData?.plantName} disabled />
                  </FormGroup>
                </Col>
              </>))}


              {data.weighmentInfoId > 0 ? <>
                <Col md="12" sm="12"><hr></hr></Col>

                <Col md="12" sm="12">
                  <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                </Col>

                <Col md="3" sm="3"><Label>Empty Weight</Label></Col>
                <Col md="3" sm="3"><Label>Load Weight</Label></Col>
                <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                <Col md="3" sm="3"><Label>Remarks</Label></Col>

                {weighmentData.map((weighmentData) => (<>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Input typr="text" placeholder="Empty Weight" value={weighmentData?.firstWeight} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Input typr="text" placeholder="Remarks" value={weighmentData?.remarks} disabled />
                    </FormGroup>
                  </Col>
                </>))}
              </> : null
              }

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Over All Empty Weight</Label>
                  <Input typr="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Over All Load Weight</Label>
                  <Input typr="text" placeholder="Enter Load Weight" value={overAllWeight.secondWeight} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Over All Net Weight</Label>
                  <Input typr="text" placeholder="Enter Net Weight" value={Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                </FormGroup>
              </Col>

              <Col md="12" sm="12">
                <br></br>
                <FormGroup>
                  {/* <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                    <X size={16} /> Reject
                  </Button.Ripple> */}


                  <div style={{ float: 'right' }}>
                    {/* <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                      <Check size={16} /> Submit
                    </Button.Ripple> */}
                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                      <ArrowLeft size={16} /> Back
                    </Button.Ripple>
                  </div>

                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Modal show={show} centered>
          <Modal.Header>
            <Row>
              <Col md="12" sm="12">
                <FormGroup style={{ width: 460 }}>
                  <Modal.Title>Reject <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                </FormGroup>
              </Col>
            </Row>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col sm="12" md="12">
                <FormGroup>
                  <CustomDropdownInput
                    url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                    label={"Reason"}
                    form={form}
                    id="rejectReason"
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="4"></Col>
              <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                <FormGroup>
                  <Button.Ripple color="danger" type="button" onClick={() => updateVehicleStatus('Reject')}>
                    <X size={16} /> Reject
                  </Button.Ripple>
                </FormGroup>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </Fragment>
    </div>
  )
}

export default SDGStoSapDocument