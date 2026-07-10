import React, { Fragment, useEffect, useState } from 'react'
import { ArrowLeft, Check, Search } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants'
import { apiPostMethod } from '../../../../helper/axiosHelper'
import { errorToast } from '../../../../helper/appHelper'

const RmReturnGateOut = () => {

  const [data, setData] = useState(false)

  const getGateInInfo = (type) => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/1}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/1`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getGateInInfo()
  })

  return (
    <div>
      <Fragment>
        <Card>
          <CardHeader><h5>Rm Return GateOut</h5></CardHeader>
          <hr />
          <CardBody>
            <Row>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Truck No</Label>
                  <InputGroup>
                    <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Truck No" />
                    <Button size="sm" color="success" style={{ height: '38px', width: '50px' }}>
                      <Search size={20} />
                    </Button>
                  </InputGroup>
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Return Ref No</Label>
                  <Input type="text" placeholder="Enter Return Ref No" value={data?.returnRefNo} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Sale Invoice No</Label>
                  <Input type="text" placeholder="Enter Sale Invoice No" value={data?.salesInvoiceNo} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Customer Name</Label>
                  <Input type="text" placeholder="Enter Customer Name" value={data?.customerName} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Plant</Label>
                  <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Driver Phone No</Label>
                  <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Sales Return Order No</Label>
                  <Input type="text" placeholder="Enter Sales Return Order No" value={data?.vaNumber} />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Load Weight</Label>
                  <Input type="text" placeholder="Enter Load Weight" value={data?.firstWeight} />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Empty Weight</Label>
                  <Input type="text" placeholder="Enter Empty Weight" value={data?.secondWeight} />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Net Weight</Label>
                  <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} />
                </FormGroup>
              </Col>

              <Col sm="10" md="10">
                <label>&nbsp;</label>
                <FormGroup className="d-flex justify-content-start mb-0">
                  <Button.Ripple outline color="primary" type="button" >
                    <ArrowLeft size={16} /> Back
                  </Button.Ripple>
                </FormGroup>
              </Col>

              <Col sm="2" md="2">
                <label>&nbsp;</label>
                <FormGroup className="d-flex justify-content-end mb-0">
                  <Button.Ripple color="primary" type="button" ocClick={getGateInInfo}>
                    <Check size={16} /> Gate Out
                  </Button.Ripple>
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Fragment>
    </div>
  )
}

export default RmReturnGateOut