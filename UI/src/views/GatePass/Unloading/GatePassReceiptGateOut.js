import React, { Fragment, useState } from 'react'
import { ArrowLeft, Check } from 'react-feather'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { CustomTextInput, Yup } from '../../forms/custom-form'
import { useFormik } from 'formik'
import { useSelector } from 'react-redux'
import { useLoader } from '../../../utility/hooks/useLoader'
import { apiBaseUrl, sapFileShare } from '../../../urlConstants'
import { apiPostMethod } from '../../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../../helper/appHelper'
import { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Uploader from '../../Uploader'

const GatePassReceiptGateOut = () => {

  const [sapDeliveryData, setSapDeliveryData] = useState([]);
  const [data, setData] = useState([])

  useEffect(() => {
    getGateInInfo()
  }, [])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();
  let { gateInOutInfoId } = useParams();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    gateIn() { },
  });

  const getGateInInfo = () => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)
        }
        else if (data.success == false) {
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getGatepassDeliveryInfo = (gateInOutInfoId) => {
    console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setSapDeliveryData(data.results)
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
  const submit = (fdata) => {
    if (!fdata.gatePassDocument) {
      errorToast("Please Attach GatePass Document")
    } else {
      updateVehicleStatus(fdata)
    }
  }
  const updateVehicleStatus = (fdata) => {
    let formData = form.values;

    // const fdata = {
    //   gateInOutInfoId: data.gateInOutInfoId,
    //   moduleStatusId: 5,
    //   remarks: formData.remarks,
    //   gatePassNo: sapDeliveryData[0].gatePassNo,
    //   userInfoId: UserDetails.USERID,
    // }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
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
  const [attachedFiles, setAttachment] = useState({ gatePassDocument: {} });
  const [ImgData, setImgData] = useState({});

  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };
  const upload = () => {


    let formData = form.values;

    const fdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 5,
      remarks: formData.remarks,
      gatePassNo: sapDeliveryData[0].gatePassNo,
      userInfoId: UserDetails.USERID,
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
      postdata.append("SubFolder", "GatePassReceipt");

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
  return (
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
                <Label>Driver Phone Number</Label>
                <Input type="text" placeholder="Enter PhoneNo" value={data.driverMobileNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Plant</Label>
                <Input placeholder="Plant" value={data.plantName} disabled />
              </FormGroup>
            </Col>
            
            {data.weighmentInfoId > 0 ? <>
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
            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
              </FormGroup>
            </Col>
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
                      title="GatePass Receipt Doc"
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
                  <>
                    <Col md="3" sm="3">
                      <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{sapDeliveryData?.gatePassNo}</u></b></FormGroup>
                    </Col>
                    <Col md="6" sm="6">
                      <ButtonGroup>
                        <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>RECEIPT NO : </span>{sapDeliveryData?.receiptNumber}</u></b></FormGroup>
                        <FormGroup><b><u><span className='text-primary'>GATEPASS TYPE : </span>{sapDeliveryData?.gatePassType}</u></b></FormGroup>
                      </ButtonGroup>
                    </Col>
                    <Col md="3" sm="3">
                      <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{sapDeliveryData?.fromPlantName}</u></b></FormGroup>
                    </Col>

                    {sapDeliveryData?.sapLine.map((lineItem) => {
                      return (<>
                        <Col md="3" sm="3">
                          <FormGroup>
                            <Label>LINE ITEM</Label>
                            <Input typr="text" placeholder="Enter LINE ITEM" value={lineItem?.lineItem} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                          <FormGroup>
                            <Label>MATERIAL</Label>
                            <Input typr="text" placeholder="Enter MATERIAL" value={lineItem?.material} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="2" sm="2">
                          <FormGroup>
                            <Label>QUANTITY</Label>
                            <Input typr="text" placeholder="Enter QUANTITY" value={lineItem?.quantity} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="2" sm="2">
                          <FormGroup>
                            <Label>UOM</Label>
                            <Input typr="text" placeholder="Enter UOM" value={lineItem?.uom} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="2" sm="2">
                          <FormGroup>
                            <Label>VALUE</Label>
                            <Input typr="text" placeholder="Enter UOM" value={lineItem?.value} disabled />
                          </FormGroup>
                        </Col>
                      </>)
                    })}
                  </>))} </> : null
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
  )
}

export default GatePassReceiptGateOut