import React, { Fragment, useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { ShowToast, errorToast } from '../../../helper/appHelper';
import { useFormik } from 'formik';
import { Yup } from '../../forms/custom-form';
import { useSelector } from 'react-redux';
import { useParams } from "react-router";
import { apiBaseUrl, sapFileShare } from '../../../urlConstants';
import { apiPostMethod } from '../../../helper/axiosHelper';
import Uploader from '../../Uploader';
import { ArrowLeft, Check } from 'react-feather';
import { useLoader } from '../../../utility/hooks/useLoader';
import { useHistory } from "react-router-dom";

const GatePassGateout = () => {

  const [data, setData] = useState([])
  const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])
  const [sapDeliveryData, setSapDeliveryData] = useState([])

  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { gateInOutInfoId } = useParams();

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          console.log(data.results[0]);
          setData(data.results[0])
          getGatepassDeliveryInfo(data.results[0].gateInOutInfoId, data.results[0])
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
  const [toPlant, setToPlant] = useState('');

  const getGatepassDeliveryInfo = (gateInOutInfoId, gateInOutData) => {
    console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setGatepassDeliveryData(data.results)
          setSapDeliveryData(data.results)

          let toPlant = data.results[0]?.sapLine[0].toPlantWerks
          setToPlant(toPlant);

          const unloading = [];

          for (let i = 0; i < data.results.length; i++) {

            let sapLine = data.results[i].sapLine;

            for (let i = 0; i < sapLine.length; i++) {
              const obj = {
                userInfoId: UserDetails.USERID,
                movementType: 'Unloading',
                moduleType: 'Gate pass',
                subModuleTypeId: gateInOutData.subModuleTypeId,
                vehicleNo: gateInOutData.vehicleNo,
                vaNumber: gateInOutData.vaNumber,
                driverMobileNumber: gateInOutData.driverMobileNumber,
                masterPlantId: sapLine[i].toMasterPlantId,
                route: gateInOutData.route,
                masterColorTokenId: gateInOutData.masterColorTokenId,
                tripSheetNumber: gateInOutData.tripSheetNumber,
                stoPoNo: gateInOutData.stoPoNo,
                loadingUnloadingInfoId: gateInOutData.loadingUnloadingInfoId,
                moduleStatusId: 0,
              };
              unloading.push(obj);
              setUnloadingData(unloading);
            }
          }
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

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
    history.push(`/Loading/GateIn`);
  }

  const [attachedFiles, setAttachment] = useState({ gatePassDocument: {} });
  const [ImgData, setImgData] = useState({});

  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };

  const submit = (fdata) => {
    if (!fdata.gatePassDocument) {
      errorToast("Please Attach GatePass Document")
    } else {
      updateVehicleStatus(fdata)
    }
  }

  const upload = () => {

    const unloadingDetails = unloadingData.filter((data) => data.masterPlantId > 0);

    let formData = form.values;

    const fdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 5,
      remarks: formData.remarks,
      userInfoId: UserDetails.USERID,
      gatePassNo: sapDeliveryData[0]?.gatePassNo,
      unloadingDetails: unloadingDetails,
      toPlant: toPlant
    }

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

    if (keys.length > 0) {
      let postdata = new FormData();

      let { gatePassDocument } = ImgData;

      postdata.append("image[]", gatePassDocument);

      let UploadFile = 0;

      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });

      UploadFile = attachedFiles.gatePassDocument && attachedFiles.gatePassDocument.name && attachedFiles.gatePassDocument.name.length ? true : false;

      postdata.append("form_name", "GatePass");
      postdata.append("SubFolder", "GatePass");
      showLoader();
      apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.gatePassDocument = data.files[0] ? data.files[0].updname : "";
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

  const updateVehicleStatus = (fdata) => {

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
    <div>
      <Fragment>
        <Card>
          <CardHeader><h5>GatePass - Gate Out</h5></CardHeader>
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
                  <Label>Driver Phone No</Label>
                  <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Plant</Label>
                  <Input type="text" placeholder="Enter Driver Phone No" value={data.plantName} disabled />
                </FormGroup>
              </Col>

              {/* {data.weighmentInfoId ? <>
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>First Weight </Label>
                    <Input typr="text" placeholder="Enter First Weight" value={data.firstWeight} disabled />
                  </FormGroup>
                </Col>
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Second Weight</Label>
                    <Input typr="text" placeholder="Enter Second Weight" value={data.secondWeight} disabled />
                  </FormGroup>
                </Col>
                <Col md="4" sm="4">
                  <FormGroup>
                    <Label>Net Weight</Label>
                    <Input typr="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                  </FormGroup>
                </Col> </> : null
              } */}

              <Col sm="8" md="8">
                <label></label>
                <FormGroup className="d-flex justify-content-start mb-0">
                  <div className="mr-1">
                    <div style={{ marginBottom: "7px" }}></div>
                    <Label><b>Attachments :</b></Label>
                  </div>
                  <div className="mr-1">
                    <Uploader
                      setAttachment={handleFileChange}
                      title="GatePass Doc"
                      id={"gatePassDocument"}
                      selectedFileName={attachedFiles.gatePassDocument.name}
                    />
                  </div>
                </FormGroup>
              </Col>

              {sapDeliveryData != '' ?
                <>
                  <Col md="12" sm="12"><hr></hr></Col>

                  <Col md="12" sm="12">
                    <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                  </Col>
                  {sapDeliveryData?.map(sapDeliveryData => (
                    <Col md="12" sm="12" key={sapDeliveryData.gatePassNo}>
                      <Row>
                        <Col md="4" sm="4">
                          <FormGroup>
                            <Label>Return Type</Label>
                            <Input type="text" placeholder="Enter Return Type" value={sapDeliveryData.gatePassType} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                          <FormGroup>
                            <Label>Gate Pass No</Label>
                            <Input type="text" placeholder="Enter Gate Pass No" value={sapDeliveryData.gatePassNo} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                          <FormGroup>
                            <Label>From Plant</Label>
                            <Input type="text" placeholder="Enter Plant" value={sapDeliveryData.fromPlantName} disabled />
                          </FormGroup>
                        </Col>

                        <Col md="12" sm="12">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                                <td className="bg-primary text-white text-center">MATERIAL</td>
                                <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                                <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                                {sapDeliveryData.sapLine[0].toPlantName != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                <td className="bg-primary text-white text-center" width='10%'>VALUE</td>
                              </tr>
                            </thead>
                            {sapDeliveryData?.sapLine.map((lineItem) => {
                              return (
                                <tbody key={lineItem.lineItem}>
                                  <tr>
                                    <td className='text-center'>{lineItem?.lineItem}</td>
                                    <td>{lineItem?.material}</td>
                                    <td className='text-center'>{lineItem?.uom}</td>
                                    <td className='text-center'>{lineItem?.quantity}</td>
                                    {lineItem?.toPlantName != '' ? <td className='text-center'>{lineItem?.toPlantName}</td> : null}
                                    <td className='text-center'>{lineItem?.value}</td>
                                  </tr>
                                </tbody>
                              )
                            })}
                          </table>
                          <br />
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </> : null
              }

              <Col sm="10" md="10">
                <FormGroup className="d-flex justify-content-start mb-0">
                  <Button outline color="primary" type="button" onClick={redirect}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                </FormGroup>
              </Col>
              <Col sm="2" md="2">
                <FormGroup className="d-flex justify-content-end mb-0">
                  <Button color="primary" type="button" onClick={upload}>
                    <Check size={16} /> Gate Out
                  </Button>
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Fragment>
    </div>
  )
}

export default GatePassGateout