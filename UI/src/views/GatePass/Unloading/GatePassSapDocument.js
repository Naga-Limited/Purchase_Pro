import React, { useEffect, useState } from 'react'
import { apiBaseUrl } from '../../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../../helper/axiosHelper';
import { Alert, Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { ArrowLeft, Check, X } from 'react-feather';
import confirmDialog from '../../../@core/components/confirm/confirmDialog';

const GatePassSapDocument = () => {

  let { gateInOutInfoId } = useParams();
  const history = useHistory();

  useEffect(() => {
    getGateInInfo()
  }, [])

  const [data, setData] = useState([])

  const [sapDeliveryData, setSapDeliveryData] = useState([])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);
          getGatepassDeliveryInfo(data.results[0].fromGateInOutInfoId ? data.results[0].fromGateInOutInfoId : data.results[0].gateInOutInfoId);
          getWeighmentInfo(data.results[0].gateInOutInfoId)
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

  const [gatepassDeliveryData, setGatepassDeliveryData] = useState([]);

  const getGatepassDeliveryInfo = (gateInOutInfoId) => {
    console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setGatepassDeliveryData(data.results)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const redirect = () => {
    history.push("/STO/SAPDocumentDetails");
  }

  return (
    <Card>
      <CardHeader><h5>GatePass - SAP Document</h5></CardHeader>
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


          {gatepassDeliveryData != '' ?
            <>
              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="12" sm="12">
                <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
              </Col>

              {gatepassDeliveryData.map((data) => (<>

                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Return Type</Label>
                    <Input type="text" placeholder="Enter Return Type" value={data.gatePassType} disabled />
                  </FormGroup>
                </Col>
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Gate Pass No</Label>
                    <Input type="text" placeholder="Enter Gate Pass No" value={data.gatePassNo} disabled />
                  </FormGroup>
                </Col>
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>From Plant</Label>
                    <Input type="text" placeholder="Enter Plant" value={data.fromPlantName} disabled />
                  </FormGroup>
                </Col>

                <Col md="12" sm="12">
                  <table className="table table-bordered">
                    <thead>
                      <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                      <td className="bg-primary text-white text-center">MATERIAL</td>
                      <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                      <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                      <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td>
                    </thead>
                    {data.sapLine.map((lineItem) => {
                      return (
                        <tbody key={lineItem.lineItem}>
                          <td className='text-center'>{lineItem?.lineItem}</td>
                          <td>{lineItem?.material}</td>
                          <td className='text-center'>{lineItem?.uom}</td>
                          <td className='text-center'>{lineItem?.quantity}</td>
                          <td className='text-center'>{lineItem?.toPlantName}</td>
                        </tbody>
                      )
                    })}
                  </table>
                  <br />
                </Col>
              </>))}
            </> : null
          }

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
          <Col md="12" sm="12">
            <FormGroup className="d-flex justify-content-end mb-0 mt-1">
              <Button outline color="primary" type="button" onClick={redirect}>
                <ArrowLeft size={16} /> Back
              </Button>
            </FormGroup>
          </Col>
        </Row>
      </CardBody >
    </Card >
  )
}

export default GatePassSapDocument