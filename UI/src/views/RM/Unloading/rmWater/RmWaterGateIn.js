import React, { Fragment, useState } from 'react'
import { Check, Search, StopCircle, X } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { apiBaseUrl } from '../../../../urlConstants';
import confirmDialog from '../../../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../../../helper/appHelper';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { Yup } from '../../../forms/custom-form';
import { currentDate } from '../../../common/dateComponent';
import { useEffect } from 'react';

const RmWaterGateIn = ({ data, setData, getUnLoadingData, setTruckValue, setIsDisable, setPoNumber, reset }) => {

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

  const [poData, setPoData] = useState([])

  const getPurchaseOrder = () => {
    console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${data.loadingAndUnloadingInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${data.loadingAndUnloadingInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setPoData(data.results)
          console.log(data.results)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const gateIn = (moduleStatusId) => {

    const formData = form.values

    const postdata = {
      userInfoId: UserDetails.USERID,
      movementType: "Unloading",
      moduleType: data.moduleType,
      vehicleNo: data.truckNo,
      driverMobileNumber: data.phoneNo,
      masterPlantId: data.masterPlantId,
      moduleStatusId: moduleStatusId,
      remarks: formData.remarks,
      loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
      tripSheetNumber: data.tripSheetNo
    };

    if (data.toDate == currentDate()) {
      confirmDialog({
        title: `<h5>Today Last Date of This Vehicle<h5>`,
      }).then((res) => {
        if (res) {
          showLoader();
          console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
          apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
              const res = response.data;
              if (res.success == true) {
                setData('')
                setTruckValue('')
                getUnLoadingData()
                setPoNumber(false)
                setIsDisable(false)
                reset()
                const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                confirmDialog({
                  title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                })
                form.resetForm()
              }
              else if (res.success == false) {
                confirmDialog({
                  title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
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
      })
    }
    else {
      showLoader();
      console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
      apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
        .then((response) => {
          const res = response.data;
          if (res.success == true) {
            setData('')
            setTruckValue('')
            getUnLoadingData()
            setPoNumber(false)
            setIsDisable(false)
            reset()
            const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
            confirmDialog({
              title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
            })
            form.resetForm()
          }
          else if (res.success == false) {
            confirmDialog({
              title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
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
  }

  useEffect(() => {
    getPurchaseOrder()
  }, [])

  return (
    <>
      <Col md="4" sm="4">
        <FormGroup>
          <Label>Movement Type</Label>
          <Input type="text" placeholder="Movement Type" value={data?.moduleType} disabled />
        </FormGroup>
      </Col>
      <Col md="4" sm="4">
        <FormGroup>
          <Label>Driver Phone No</Label>
          <Input type="text" placeholder="Driver Phone No" value={data?.phoneNo} disabled />
        </FormGroup>
      </Col>
      <Col md="4" sm="4">
        <FormGroup>
          <Label>Plant</Label>
          <Input type="text" placeholder="Plant" value={data?.plantName} disabled />
        </FormGroup>
      </Col>
      <Col md="4" sm="4">
        <FormGroup>
          <Label>Remarks</Label>
          <Input type="text" placeholder="Enter Remarks" />
        </FormGroup>
      </Col>

      {poData != '' ? <>
        <Col md="12" sm="12"><hr></hr></Col>

        <Col md="12" sm="12">
          <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
        </Col>
        {poData?.map((poData) => (<>
          <Col md="4" sm="4">
            <FormGroup>
              <Label>PO Number</Label>
              <Input type="text" placeholder="PO Number" value={poData?.poNumber} disabled />
            </FormGroup>
          </Col>
          <Col md="4" sm="4">
            <FormGroup>
              <Label>PO Type</Label>
              <Input type="text" placeholder="PO Type" value={poData?.name} disabled />
            </FormGroup>
          </Col>
          <Col md="4" sm="4">
            <FormGroup>
              <Label>Vendor Name </Label>
              <Input type="text" placeholder="Vendor Name" value={poData?.vendorName} disabled />
            </FormGroup>
          </Col> </>
        ))} </> : null
      }
      <Col md="12" sm="12">
        <label></label>
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
              <StopCircle size={16} /> Wait Outside
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
            <Check size={16} /> Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </>
  )
}

export default RmWaterGateIn