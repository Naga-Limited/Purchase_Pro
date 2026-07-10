import React, { useEffect, useState } from 'react'
import { apiBaseUrl } from '../../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../../helper/axiosHelper';
import { Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { ArrowLeft, Check, X } from 'react-feather';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';
import { Modal } from 'react-bootstrap';
import { CustomDropdownInput, Yup } from '../../forms/custom-form';
import { useLoader } from '../../../utility/hooks/useLoader';
import { useFormik } from 'formik';

const GatePassSapDocument = () => {

  let { gateInOutInfoId } = useParams();
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() { },
  });

  useEffect(() => {
    getGateInInfo('GET')
  }, [gateInOutInfoId])

  const [data, setData] = useState([])
  const [response, setResponse] = useState([])
  const [show, setShow] = useState(false);
  const closeRemarksModal = () => setShow(false);

  const [sapDeliveryData, setSapDeliveryData] = useState([])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getGateInInfo = (type) => {
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);
          getWeighmentInfo(data.results[0].gateInOutInfoId)
          const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type, userInfoId:UserDetails.USERID }

          console.log(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", postData);
          apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", postData)
            .then((response) => {
              const { data } = response;
              if (data.success == true) {
                if (type == 'GET') {
                  setSapDeliveryData(data.results);
                  setToPlant(data.results[0].SAP_LINE[0].REC_PLANT)
                  setResponse(data)
                }
                else if (type == 'POST') {
                  ShowToast(data.message)
                  redirect()
                }
              }
              else if (data.success == false) {
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

  const [weighmentData, setWeighmentData] = useState([])
  const [overAllWeight, setOverAllWeight] = useState([])

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
          // errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const fromPlant = [sapDeliveryData[0]?.FROM_PLANT];
  const userPlant = UserDetails.plantids.filter((userPlant) => userPlant == fromPlant);

  const [toPlant, setToPlant] = useState('')

  const checkPlant = () => {
    if (JSON.stringify(fromPlant) == JSON.stringify(userPlant)) {
      if (sapDeliveryData[0].SAP_LINE[0].REC_PLANT != '') {
        apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${toPlant}`)
          .then((response) => {
            const data = response.data;
            if (data.success) {
              getGateInInfo('POST')
            }
            if (data.success == false) {
              confirmDialog({
                title: `<h5><strong class="text-white">${toPlant} - ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              });
            }
          })
          .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
          })
      }
      else {
        getGateInInfo('POST')
      }
    } else {
      errorToast("Plant not assigned for user, Please assign plant")
    }
  }

  const reject = () => {

    const formData = form.values;

    const postdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 2,
      rejectReasonId: formData.rejectReason.value,
      userInfoId: UserDetails.USERID
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast("Rejected Successfully...");
          redirect()
        }
        else if (res.success == false) {
          errorToast(res.message)
          redirect()
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const redirect = () => {
    history.push("/SAPDocumentDetails");
  }

  return (
    <>
      <Card>
        <CardHeader><h5>Loading - SAP Document</h5></CardHeader>
        <hr></hr>
        <CardBody>
          <Row>
            <Col md="12" sm="12">
              <h4 className="text-primary"><u>General Info</u></h4><br />
            </Col>
            {data?.vehicleNo ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Truck No</Label>
                  <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                </FormGroup>
              </Col> : null
            }
            <Col md="4" sm="4">
              <FormGroup>
                <Label>VA No</Label>
                <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Driver Phone No</Label>
                <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Plant</Label>
                <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
              </FormGroup>
            </Col>
            {data.remarks != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Remarks</Label>
                  <Input type="text" placeholder="Enter Remarks" value={data?.remarks} disabled />
                </FormGroup>
              </Col> : null
            }
            {data?.tripSheetNumber ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>TRIP Sheet No</Label>
                  <Input type="text" placeholder="Enter TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                </FormGroup>
              </Col> : null
            }


            <Col md="12" sm="12"><hr></hr></Col>

            <Col md="12" sm="12">
              <h4 className="text-primary"><u>Delivery Info</u></h4><br />
            </Col>
            {sapDeliveryData?.map(sapDeliveryData => (
              <Col md="12" sm="12" key={sapDeliveryData?.GATEPASS_NO}>
                <Row>
                  <Col md="3" sm="3">
                    <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{sapDeliveryData?.GATEPASS_NO}</u></b></FormGroup>
                  </Col>
                  <Col md="6" sm="6">
                    <ButtonGroup>
                      <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>GATEPASS TYPE : </span>{sapDeliveryData?.GATEPASS_TYPE}</u></b></FormGroup>
                      <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{sapDeliveryData?.FROM_PLANT}</u></b></FormGroup>
                    </ButtonGroup>
                  </Col>
                  {sapDeliveryData?.VENDOR_PLANT_NAME ?
                    <Col md="3" sm="3">
                      <FormGroup><b><u><span className='text-primary'>VENDOR PLANT : </span>{sapDeliveryData?.VENDOR_PLANT_NAME}</u></b></FormGroup>
                    </Col> : null
                  }

                  <Col md="12" sm="12">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                          <td className="bg-primary text-white text-center">MATERIAL</td>
                          <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                          <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                          {sapDeliveryData.SAP_LINE[0].REC_PLANT != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                          <td className="bg-primary text-white text-center" width='10%'>VALUE</td>
                        </tr>
                      </thead>
                      {sapDeliveryData?.SAP_LINE.map((lineItem) => {
                        return (
                          <tbody key={lineItem.LINE_ITEM}>
                            <tr>
                              <td className='text-center'>{lineItem?.LINE_ITEM}</td>
                              <td>{lineItem?.MATERIAL}</td>
                              <td className='text-center'>{lineItem?.UOM}</td>
                              <td className='text-center'>{lineItem?.QTY}</td>
                              {lineItem?.REC_PLANT != '' ? <td className='text-center'>{lineItem?.REC_PLANT}</td> : null}
                              <td className='text-center'>{lineItem?.VALUE}</td>
                            </tr>
                          </tbody>
                        )
                      })}
                    </table>
                    <br />
                  </Col>
                </Row>
              </Col>))}

            {data.weighmentInfoId > 0 ?
              <>
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
                    <Input typr="text" placeholder="Enter Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                  </FormGroup>
                </Col>
              </> : null
            }

            <Col md="12" sm="12"><Alert color={response.success ? "success" : "danger"}><br /><h5 className="text-center"><b>* {response.message}</b></h5><br /></Alert></Col>

            <Col md="12" sm="12">
              <br></br>
              <FormGroup>
                {/* {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                  <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                    <X size={16} /> Reject
                  </Button.Ripple> : null
                } */}

                <div style={{ float: 'right' }}>
                  {(sapDeliveryData != '') && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) ?
                    <Button color="primary" type="button" onClick={checkPlant}>
                      <Check size={16} /> Submit
                    </Button> : null
                  }
                  <Button className="ml-2" outline color="primary" type="button" onClick={redirect}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                </div>
              </FormGroup>
            </Col>
          </Row>
        </CardBody >
      </Card >

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
                <Button.Ripple color="danger" type="button" onClick={reject}>
                  <X size={16} /> Reject
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default GatePassSapDocument