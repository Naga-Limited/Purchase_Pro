import React, { Fragment, useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useParams } from "react-router";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'react-feather';
import { useHistory } from "react-router-dom";
import Uploader from '../Uploader';
import { CustomTextInput, Yup } from '../forms/custom-form';
import { ShowToast, errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';

const RAndDSampleGateOut = () => {

  const [data, setData] = useState([])
  const [sapDeliveryData, setSapDeliveryData] = useState([])

  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { gateInOutInfoId } = useParams();

  const [generalData, setGeneralData] = useState(false)
  const [showDownArrow, setShowDownArrow] = useState(true)
  const [hideDownArrow, setHideDownArrow] = useState(false)

  const showshowGeneralData = () => {
    setShowDownArrow(false)
    setHideDownArrow(true)
    setGeneralData(true)
  }

  const hideshowGeneralData = () => {
    setGeneralData(false)
    setShowDownArrow(true)
    setHideDownArrow(false)
  }

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          console.log(data.results[0]);
          setData(data.results[0])
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [unloadingData, setUnloadingData] = useState();

  useEffect(() => {
    getGateInInfo()
  }, [])

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
    }),
    onSubmit() { },
  });


  const redirect = () => {
    history.push(`/VA`);
  }

  const updateVehicleStatus = () => {

    let formData = form.values;

    const fdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 5,
      remarks: formData.remarks,
      userInfoId: UserDetails.USERID,
      gatePassNo: sapDeliveryData[0]?.gatePassNo,
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
          redirect();
        }
        else if (res.success == false) {
          errorToast(res.message)
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>R&D Sales - Gate Out</h5></CardHeader>
        <hr></hr>
        <CardBody>
          <Row>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Truck No</Label>
                <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>VA No</Label>
                <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
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
                <Label>Plant</Label>
                <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
              </FormGroup>
            </Col>
            <Col sm="12" md="12">
              <hr></hr>
              <FormGroup>
                <Label for="nameMulti"><b>Click Here :
                  &nbsp;&nbsp;
                  {showDownArrow ?
                    <Button.Ripple outline color="white" type="button" onClick={showshowGeneralData} className="text-primary">
                      General Details <ChevronDown size={20} />
                    </Button.Ripple> : null
                  }
                  {hideDownArrow ?
                    <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                      General Details <ChevronUp size={20} />
                    </Button.Ripple> : null
                  }
                </b></Label>
              </FormGroup>
            </Col>
          </Row>

          {generalData ?
            <Row>
              {data.firstWeight ?
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Empty Weight</Label>
                    <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                  </FormGroup>
                </Col> : null
              }
              {data.secondWeight ?
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Load Weight</Label>
                    <Input type="text" placeholder="Enter Load Weight" value={data.secondWeight} disabled />
                  </FormGroup>
                </Col> : null
              }
              {data.netWeight ?
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Net Weight</Label>
                    <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                  </FormGroup>
                </Col> : null
              }
            </Row> : null
          }
          <Row>
            <Col sm="10" md="10">
              <label>&nbsp;</label>
              <FormGroup className="d-flex justify-content-start mb-0">
                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                  <ArrowLeft size={16} /> Back
                </Button.Ripple>
              </FormGroup>
            </Col>
            <Col sm="2" md="2">
              <label>&nbsp;</label>
              <FormGroup className="d-flex justify-content-end mb-0">
                <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                  <Check size={16} /> Gate Out
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment >
  )
}

export default RAndDSampleGateOut