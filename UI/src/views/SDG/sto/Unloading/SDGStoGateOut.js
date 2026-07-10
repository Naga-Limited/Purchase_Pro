import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { useFormik } from 'formik';
import { CustomTextInput, Yup } from '../../../forms/custom-form';
import { useSelector } from 'react-redux';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'react-feather';


const SDGStoGateOut = () => {

  const [data, setData] = useState([])
  const [invoiceData, setInvoiceData] = useState([])

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();
  const [generalData, setGeneralData] = useState(false)
  const [showDownArrow, setShowDownArrow] = useState(true)
  const [hideDownArrow, setHideDownArrow] = useState(false)

  const showGeneralData = () => {
    setShowDownArrow(false)
    setHideDownArrow(true)
    setGeneralData(true)
  }

  const hideGeneralData = () => {
    setGeneralData(false)
    setShowDownArrow(true)
    setHideDownArrow(false)
  }
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  let { gateInOutInfoId } = useParams();

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          setInvoiceData(data.invoiceInfo)
          getWeighmentInfo(data.results[0].gateInOutInfoId)
        }
        else if (data.success == false) {
          errorToast(data.message);
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


  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    updateVehicleStatus(fdata) { },
  });

  const updateVehicleStatus = () => {

    const formData = form.values;

    const postdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 5,
      rejectReasonId: formData.rejectReason ? formData.rejectReason.value : null,
      userInfoId: UserDetails.USERID
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
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

  const redirect = () => {
    history.push(`/VA`);
  }

  return (
    <div>
      <Fragment>
        <Card>
          <CardHeader><h5>SDG - STO Gate Out</h5></CardHeader>
          <hr></hr>
          <CardBody>
            <Row>
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

              <Col md="4" sm="4">
                <FormGroup>
                  <Label>First Weight</Label>
                  <Input typr="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Second Weight</Label>
                  <Input typr="text" placeholder="Enter Second Weight" value={overAllWeight?.secondWeight} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Net Weight</Label>
                  <Input typr="text" placeholder="Enter Second Weight" value={Number(data?.firstWeight - overAllWeight?.secondWeight)} disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="4">
                <FormGroup>
                  <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                </FormGroup>
              </Col>

              {data?.pickSlipCopy ?
                <Col sm="8" md="8">
                  <label></label>
                  <FormGroup className="d-flex justify-content-start mb-0">
                    <div className="mr-1">
                      <div style={{ marginBottom: "7px" }}></div>
                      <Label><b>View :</b></Label>
                    </div>
                    <div className="mr-1">
                      <a target="_blank" href={data?.pickSlipCopy}>
                        <Button outline color="success" type="button">
                          Pick Slip Copy
                        </Button>
                      </a>
                    </div>
                  </FormGroup>
                </Col> : null
              }

              <Col sm="12" md="12">
                <hr></hr>
                <FormGroup>
                  <Label for="nameMulti"><b>Click Here :
                    &nbsp;&nbsp;
                    {showDownArrow ?
                      <Button outline color="white" type="button" onClick={showGeneralData} className="text-primary">
                        General Details <ChevronDown size={20} />
                      </Button> : null
                    }
                    {hideDownArrow ?
                      <Button outline color="white" type="button" onClick={hideGeneralData} className="text-primary">
                        General Details <ChevronUp size={20} />
                      </Button> : null
                    }
                  </b></Label>
                </FormGroup>
              </Col>

              {generalData ? <>
                {invoiceData.map((invoiceData) => (<>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Label>PO Number</Label>
                      <Input type="text" placeholder="Enter PO Number" value={invoiceData?.poNumber} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Label>Delivery Number</Label>
                      <Input type="text" placeholder="Enter PO Number" value={invoiceData?.deliveryNumber} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Label>Sending Plant</Label>
                      <Input type="text" placeholder="Enter Sending Plant" value={data?.plantName} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup>
                      <Label>Rec Plant</Label>
                      <Input typr="text" placeholder="Enter Rec Plant" value={invoiceData?.plantName} disabled />
                    </FormGroup>
                  </Col>
                </>))} </> : null
              }

              <Col sm="10" md="10" className='mt-2'>
                <FormGroup className="d-flex justify-content-start mb-0">
                  <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                    <ArrowLeft size={16} /> Back
                  </Button.Ripple>
                </FormGroup>
              </Col>

              <Col sm="2" md="2" className='mt-2'>
                <FormGroup className="d-flex justify-content-end mb-0">
                  <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
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

export default SDGStoGateOut