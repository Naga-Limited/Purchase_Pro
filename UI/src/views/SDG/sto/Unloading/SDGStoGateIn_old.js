import React, { useState } from 'react'
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants';
import confirmDialog from '../../../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../../../helper/appHelper';
import { CustomTextInput, Yup } from '../../../forms/custom-form';
import { Check, StopCircle } from 'react-feather';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import Uploader from '../../../Uploader';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { useEffect } from 'react';

const SDGStoGateIn = ({ data, setData, setSelectedValue, setModuleType, setModuleTypeId, getUnLoadingData, Unloading_Gate_in_Vehicle }) => {

  const gateInOutData = data.results[0]

  useEffect(() => {
    getWeighmentInfo(gateInOutData.fromGateInOutInfoId)
  }, [gateInOutData])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  let { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
    }),

    gateIn() { },
  });

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

  const gateIn = (moduleStatusId) => {

    let formData = form.values;

    const postdata = {
      gateInOutInfoId: gateInOutData.gateInOutInfoId,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks,
      userInfoId: UserDetails.USERID,
    };
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          const message = moduleStatusId == 6 ? "Waiting for In..." : "Gate In Success...";
          confirmDialog({
            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
          })
          form.resetForm()
          getUnLoadingData()
          setSelectedValue('')
          setModuleType('')
          setModuleTypeId('')
          Unloading_Gate_in_Vehicle()
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
    <Row>
      <Col md="4" sm="4">
        <FormGroup>
          <Label>Truck No</Label>
          <Input type="text" placeholder="Enter Truck No" value={gateInOutData?.vehicleNo} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>Driver Phone Number</Label>
          <Input type="text" placeholder="Enter PhoneNo" value={gateInOutData?.driverMobileNumber} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label for="cityMulti">Plant</Label>
          <Input placeholder="Plant" value={gateInOutData?.plantName} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>From Plant Empty Weight</Label>
          <Input type="text" placeholder="Enter From Plant Empty Weight" value={overAllWeight?.firstWeight} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>From Plant Load Weight</Label>
          <Input type="text" placeholder="Enter From Plant Load Weight" value={overAllWeight?.secondWeight} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>From Plant Net Weight</Label>
          <Input type="text" placeholder="Enter From Plant Net Weight" value={overAllWeight?.netWeight} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>Sending Plant</Label>
          <Input type="text" placeholder="Enter Sending Plant" value={gateInOutData?.fromPlant} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>STO PO</Label>
          <Input typr="text" placeholder="Enter STO PO" value={gateInOutData?.stoPoNo} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <Label>Delivery No</Label>
          <Input typr="text" placeholder="Enter Delivery No" value={gateInOutData?.deliveryOrderNumber} disabled />
        </FormGroup>
      </Col>

      <Col md="4" sm="4">
        <FormGroup>
          <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
        </FormGroup>
      </Col>

      {gateInOutData.sendingWBSlip ?
        <Col sm="8" md="8">
          <label></label>
          <FormGroup className="d-flex justify-content-start mb-0">
            <div className="mr-1">
              <div style={{ marginBottom: "7px" }}></div>
              <Label><b>View :</b></Label>
            </div>
            <div className="mr-1">
              <a target="_blank" href={gateInOutData.sendingWBSlip}>
                <Button outline color="success" type="button">
                  Weighment Slip
                </Button>
              </a>
            </div>
          </FormGroup>
        </Col> : null
      }
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
              <StopCircle size={16} className="mr-1" />
              Wait Outside
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
            <Check size={16} className="mr-1" />
            Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </Row>
  )
}

export default SDGStoGateIn