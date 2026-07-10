import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { CustomDropdownInput, Yup } from '../../forms/custom-form';
import { apiBaseUrl } from '../../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { useLoader } from '../../../utility/hooks/useLoader';
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from 'react-feather';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';

const GatePassReceiptSapDocument = () => {

  const [show, setShow] = useState(false);
  const closeRemarksModal = () => setShow(false);

  let { gateInOutInfoId } = useParams();

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();

  const [sapDeliveryData, setSapDeliveryData] = useState([])
  const [data, setData] = useState([])
  const [response, setResponse] = useState([])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    reject() { },
  });

  const getGateInInfo = (type) => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);

          const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type }

          console.log(apiBaseUrl + "LandingDataController/GatePassReceipt_DocumentVeriyfy", postData);
          apiPostMethod(apiBaseUrl + "LandingDataController/GatePassReceipt_DocumentVeriyfy", postData)
            .then((response) => {
              const { data } = response;
              if (data.success == true) {
                if (type == 'GET') {
                  setSapDeliveryData(data.results)
                  setResponse(data)
                } else if (type == 'POST') {
                  ShowToast(data.message)
                  redirect()
                }

              } else if (data.success == false) {
                setResponse(data)
              }
            })
            .catch((error) => {
              console.log(JSON.stringify(error))
              errorToast("Something went wrong, please try again after sometime");
            })

        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const fromPlant = [sapDeliveryData[0]?.FROM_PLANT];
  const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

  const checkPlant = () => {
    if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {
      getGateInInfo('POST')
    } else {
      errorToast("Plant not assigned for user, Please assign plant")
    }
  }

  useEffect(() => {
    getGateInInfo('GET')
  }, [])

  const redirect = () => {
    history.push("/STO/SapDocumentDetails");
  }

  const updateVehicleStatus = () => {

    const formData = form.values;

    const postdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 2,
      rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
      userInfoId: UserDetails.USERID
    }

    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast("Rejected Successfully...");
          redirect();
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
          <CardHeader><h5>GatePass Receipt - Sap Document</h5></CardHeader>
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
                  <Label>Plant</Label>
                  <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Type</Label>
                  <Input type="text" placeholder="Enter Type" value={data.moduleType} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Driver Phone No</Label>
                  <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                </FormGroup>
              </Col>

              {sapDeliveryData != '' ?
                <>
                  <Col md="12" sm="12"><hr></hr></Col>

                  <Col md="12" sm="12">
                    <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                  </Col>
                  {sapDeliveryData?.map(sapDeliveryData => (
                    <>
                      <Col md="3" sm="3">
                        <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{sapDeliveryData?.GATEPASS_NO}</u></b></FormGroup>
                      </Col>
                      <Col md="6" sm="6">
                        <ButtonGroup>
                          <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>RECEIPT NO : </span>{sapDeliveryData?.RECEIPT_NO}</u></b></FormGroup>
                          <FormGroup><b><u><span className='text-primary'>GATEPASS TYPE : </span>{sapDeliveryData?.GATEPASS_TYPE}</u></b></FormGroup>
                        </ButtonGroup>
                      </Col>
                      <Col md="3" sm="3">
                        <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{sapDeliveryData?.FROM_PLANT}</u></b></FormGroup>
                      </Col>

                      {sapDeliveryData?.SAP_LINE.map((lineItem) => {
                        return (<>
                          <Col md="3" sm="3">
                            <FormGroup>
                              <Label>LINE ITEM</Label>
                              <Input typr="text" placeholder="Enter LINE ITEM" value={lineItem?.LINE_ITEM} disabled />
                            </FormGroup>
                          </Col>
                          <Col md="3" sm="3">
                            <FormGroup>
                              <Label>MATERIAL</Label>
                              <Input typr="text" placeholder="Enter MATERIAL" value={lineItem?.MATERIAL} disabled />
                            </FormGroup>
                          </Col>
                          <Col md="2" sm="2">
                            <FormGroup>
                              <Label>QUANTITY</Label>
                              <Input typr="text" placeholder="Enter QUANTITY" value={lineItem?.QTY} disabled />
                            </FormGroup>
                          </Col>
                          <Col md="2" sm="2">
                            <FormGroup>
                              <Label>UOM</Label>
                              <Input typr="text" placeholder="Enter UOM" value={lineItem?.UOM} disabled />
                            </FormGroup>
                          </Col>
                          <Col md="2" sm="2">
                            <FormGroup>
                              <Label>VALUE</Label>
                              <Input typr="text" placeholder="Enter UOM" value={lineItem?.VALUE} disabled />
                            </FormGroup>
                          </Col>
                        </>)
                      })}
                    </>))} </> : null
              }

              {data.weighmentInfoId > 0 ?
                <>
                  <Col md="12" sm="12"><hr></hr></Col>

                  <Col md="12" sm="12">
                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                  </Col>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>First Weight</Label>
                      <Input type="text" placeholder="Enter First Weight" value={data.firstWeight} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>Second Weight</Label>
                      <Input type="text" placeholder="Enter Second Weight" value={data.secondWeight} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>Net Weight</Label>
                      <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                    </FormGroup>
                  </Col> </> : null
              }

              <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

              <Col md="12" sm="12">
                <br></br>
                <FormGroup>
                  {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                      <X size={16} /> Reject
                    </Button.Ripple> : null
                  }

                  <div style={{ float: 'right' }}>
                    {(sapDeliveryData != '') && (data.moduleStatusId == 3 || data.moduleStatusId == 4) ?
                      <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                        <Check size={16} /> Submit
                      </Button.Ripple> : null
                    }
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
                  <Button.Ripple color="danger" type="button" onClick={updateVehicleStatus}>
                    <X size={16} /> Reject
                  </Button.Ripple>
                </FormGroup>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </Fragment >
    </div >
  )
}

export default GatePassReceiptSapDocument