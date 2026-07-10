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

const GatePassGateOut = () => {

  const [sapDeliveryData, setSapDeliveryData] = useState([]);
  const [gatePassReceiptData, setGatePassReceiptData] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    getGateInInfo('GET')
  }, [])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();
  let { gateInOutInfoId } = useParams();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() { },
  });

  const getGateInInfo = (type) => {
    console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)

          const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type }

          console.log(apiBaseUrl + "LandingDataController/GatePassReceipt_DocumentVeriyfy", postData);
          apiPostMethod(apiBaseUrl + "LandingDataController/GatePassReceipt_DocumentVeriyfy", postData)
            .then((response) => {
              const { data } = response;
              if (data.success == true) {
                if (type == 'GET') {
                  setGatePassReceiptData(data.results)
                  console.log(data.results)
                } else if (type == 'POST') {
                  ShowToast(data.message)
                  redirect()
                }
              } else if (data.success == false) {
                console.log(data.message);
              }
            })
            .catch((error) => {
              console.log(JSON.stringify(error))
              errorToast("Something went wrong, please try again after sometime");
            })

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

  const updateVehicleStatus = (fdata) => {
    showLoader();
    console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
    apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          if (gatePassReceiptData != '') {
            getGateInInfo('POST')
          } else {
            ShowToast(res.message);
            redirect()
          }
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

  const [attachedFiles, setAttachment] = useState({ pickSlipCopy: {} });
  const [ImgData, setImgData] = useState({});

  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };

  const submit = (fdata) => {
    if (!fdata.pickSlipCopy) {
      errorToast("Please Attach Receipt Copy")
    } else {
      updateVehicleStatus(fdata)
    }
  }

  const upload = () => {

    let formData = form.values;

    const fdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      moduleStatusId: 5,
      remarks: formData.remarks,
      gatePassNo: sapDeliveryData[0]?.gatePassNo,
      userInfoId: UserDetails.USERID,
    }

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

    if (keys.length > 0) {
      let postdata = new FormData();

      let { pickSlipCopy } = ImgData;

      postdata.append("image[]", pickSlipCopy);

      let UploadFile = 0;

      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });

      UploadFile = attachedFiles.pickSlipCopy && attachedFiles.pickSlipCopy.name && attachedFiles.pickSlipCopy.name.length ? true : false;

      postdata.append("form_name", data.moduleType);
      postdata.append("SubFolder", "FG_GateOut");

      apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.pickSlipCopy = data.files[0] ? data.files[0].updname : "";
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
            {/* <Col md="4" sm="4">
              <FormGroup>
                <Label>Plant</Label>
                <Input placeholder="Plant" value={data.fromPlant} disabled />
              </FormGroup>
            </Col> */}

            {/* {data.weighmentInfoId > 0 ? <>

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
            } */}

            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
              </FormGroup>
            </Col>

            <Col sm="8" md="8">
              <ButtonGroup className="justify-content-start mt-2">
                <div className="mr-1">
                  <div style={{ marginBottom: "7px" }}></div>
                  <b>Attachments :</b>
                </div>
                <div className="mr-1">
                  <Uploader
                    setAttachment={handleFileChange}
                    title="Receipt copy"
                    id={"pickSlipCopy"}
                    selectedFileName={attachedFiles.pickSlipCopy.name}
                  />
                </div>

                <div className="mr-1">
                  <div style={{ marginBottom: "7px" }}></div>
                  <b>GatePass Doc :</b>
                </div>
                <div className="mr-1">
                  <a target="_blank" href={data.gatePassDocument}>
                    <Button outline color="success" type="button">
                      View
                    </Button>
                  </a>
                </div>
              </ButtonGroup>
            </Col>
          </Row>

          {sapDeliveryData != '' ?
            <>
              <Row>
                <Col md="12" sm="12"><hr></hr></Col>

                <Col md="12" sm="12">
                  <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                </Col>
              </Row>
              {sapDeliveryData.map((gatepassDeliveryData) => (
                <Row key={gatepassDeliveryData.gatepassDeliveryInfoId}>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>Return Type</Label>
                      <Input type="text" placeholder="Enter Return Type" value={gatepassDeliveryData.gatePassType} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>Gate Pass No</Label>
                      <Input type="text" placeholder="Enter Gate Pass No" value={gatepassDeliveryData.gatePassNo} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="4">
                    <FormGroup>
                      <Label>From Plant</Label>
                      <Input type="text" placeholder="Enter Plant" value={gatepassDeliveryData.fromPlantName} disabled />
                    </FormGroup>
                  </Col>

                  <Col md="12" sm="12">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                          <th className="bg-primary text-white text-center">MATERIAL</th>
                          <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                          <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                          <th className="bg-primary text-white text-center" width='20%'>TO PLANT</th>
                          <th className="bg-primary text-white text-center" width='20%'>VALUE</th>
                        </tr>
                      </thead>
                      {gatepassDeliveryData.sapLine?.map((lineItem) => {
                        return (
                          <tbody key={lineItem.lineItem}>
                            <tr>
                              <td className='text-center'>{lineItem?.lineItem}</td>
                              <td>{lineItem?.material}</td>
                              <td className='text-center'>{lineItem?.uom}</td>
                              <td className='text-center'>{lineItem?.quantity}</td>
                              <td className='text-center'>{lineItem?.toPlantName}</td>
                              <td className='text-center'>{lineItem?.value}</td>
                            </tr>
                          </tbody>
                        )
                      })}
                    </table>
                    <br />
                  </Col>
                </Row>
              ))}   </> : null
          }

          {gatePassReceiptData != '' ?
            <>
              <Row>
                <Col md="12" sm="12"><hr></hr></Col>

                <Col md="12" sm="12">
                  <h4 className="text-primary"><u>GetePass Receipt Info</u></h4><br />
                </Col>
              </Row>
              {gatePassReceiptData?.map((gatePassReceiptData) => (
                <Row key={gatePassReceiptData.GATEPASS_NO}>
                  <Col md="3" sm="3">
                    <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{gatePassReceiptData?.GATEPASS_NO}</u></b></FormGroup>
                  </Col>
                  <Col md="6" sm="6">
                    <ButtonGroup>
                      <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>RECEIPT NO : </span>{gatePassReceiptData?.RECEIPT_NO}</u></b></FormGroup>
                      <FormGroup><b><u><span className='text-primary'>GATEPASS TYPE : </span>{gatePassReceiptData?.GATEPASS_TYPE}</u></b></FormGroup>
                    </ButtonGroup>
                  </Col>
                  <Col md="3" sm="3">
                    <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{gatePassReceiptData?.FROM_PLANT}</u></b></FormGroup>
                  </Col>

                  {gatePassReceiptData?.SAP_LINE.map((lineItem) => {
                    return (
                      <>
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
                        <Col md="3" sm="3">
                          <FormGroup>
                            <Label>QUANTITY</Label>
                            <Input typr="text" placeholder="Enter QUANTITY" value={lineItem?.QTY} disabled />
                          </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                          <FormGroup>
                            <Label>UOM</Label>
                            <Input typr="text" placeholder="Enter UOM" value={lineItem?.UOM} disabled />
                          </FormGroup>
                        </Col>
                      </>
                    )
                  })}
                </Row>
              ))}
            </> : null}

          <Row>
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
    </Fragment >
  )
}

export default GatePassGateOut