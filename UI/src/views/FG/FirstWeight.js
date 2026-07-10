import React, { Fragment } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { apiPostMethod } from '../../helper/axiosHelper'
import { apiBaseUrl } from '../../urlConstants'
import { useLoader } from '../../utility/hooks/useLoader'
import { useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { CustomDropdownInput, CustomTextInput, Yup } from '../forms/custom-form'
import { ArrowLeft, Check } from 'react-feather'
import confirmDialog from '../../@core/components/confirm/confirmDialog'
import { useEffect } from 'react'

const FirstWeight = ({ data, setData, setIsDisabled, setTruckValue, selectedDocument, setSelectedDocument, setShowDocument }) => {

  let { showLoader, hideLoader } = useLoader();
  const [imageData, setImageData] = useState([])
  const [remarks, setRemarks] = useState('')

  const getWeighmentImages = () => {
    const postData = {
      masterPlantId: data.masterPlantId,
      vaNumber: data.vaNumber,
      movementType: data.movementType,
      weighmentInfoId: ""
    }
    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/getWeighmentImages", postData);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/getWeighmentImages", postData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          console.log(data.data.cctvCameraImages);
          setImageData(data.data.cctvCameraImages)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      // firstWeight: validation.required({ message: "Please Connect to Scale", isObject: false })
    }),
    gateIn() { },
  });

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const onSubmit = () => {
    if (data?.moduleTypeId == 23) {
      addTestWeighmentInfo()
    } else {
      addFirstWeight()
    }
  }

  const addFirstWeight = () => {

    const postdata = {
      gateInOutInfoId: data.gateInOutInfoId,
      emptyVehicleArrivalId: data.emptyVehicleArrivalId,
      purchaseInfoId: data.purchaseInfoId,
      documentNumber: selectedDocument != '' ? selectedDocument?.label : null,
      // firstWeight: form.values.firstWeight,
      firstWeight: firstWeight,
      userInfoId: UserDetails.USERID,
      remarks: form.values.remarks,
      moduleStatusId: 2,
      imageDetails: imageData
    };
    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
          form.resetForm();
          setSelectedDocument([])
          setShowDocument(false)
          setIsDisabled(false)
          setData("")
          setTruckValue("")
        } else {
          errorToast(res.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const addTestWeighmentInfo = () => {

    const postdata = {
      testWeighmentInfoId: 0,
      testWeighbridgeId: data.testWeighbridgeId,
      firstWeight: firstWeight,
      remarks: form.values.remarks,
      userInfoId: UserDetails.USERID
    };
    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/addTestWeighmentInfo", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/addTestWeighmentInfo", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          ShowToast(res.message);
          form.resetForm();
          setIsDisabled(false)
          setData("")
          setTruckValue("")
        } else {
          errorToast(res.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const reset = () => {
    setData("")
    setTruckValue("")
    setIsDisabled(false)
  }

  var port;
  class SerialLEDController {
    constructor() {
      this.encoder = new TextEncoder();
      this.decoder = new TextDecoder();
    }
    //var port;
    async init() {
      console.log(navigator);
      if ('serial' in navigator) {
        try {
          port = await navigator.serial.requestPort();
          await port.open({ baudRate: 2400, bufferSize: 500000, parity: "even", dataBits: 7 });
          this.reader = port.readable.getReader();
          this.writer = port.writable.getWriter();
          let signals = await port.getSignals();
          console.log(signals);
          getSerialMessage();
        }
        catch (err) {
          console.error('There was an error opening the serial port:', err);
        }
      }
      else {
        console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
        console.error('chrome://flags/#enable-experimental-web-platform-features');
        console.error('opera://flags/#enable-experimental-web-platform-features');
        console.error('edge://flags/#enable-experimental-web-platform-features');
      }
    }
    async write(data) {
      const dataArrayBuffer = this.encoder.encode(data);
      return await this.writer.write(dataArrayBuffer);
    }
    async read() {
      try {
        var readerData = "";
        if (this.reader) {
          //this.reader.cancel();
          this.reader.releaseLock();
          //port.close();
        }
        ////await port.open({ baudRate: 2400 , bufferSize:500000});
        this.reader = port.readable.getReader();
        //this.writer = port.writable.getWriter();
        //let signals = await port.getSignals();
        //console.log(signals);
        //while (true) {

        for (var i = 0; i < 10; i++) {
          const { value, done } = await this.reader.read();
          //			  this.reader.cancel();
          if (done == true) {
            // Allow the serial port to be closed later.
            this.reader.releaseLock();
            break;
          }

          if (value) {
            readerData += this.decoder.decode(value);
            //console.log(value);
          }
        }
        //console.log(readerData);
        //  readerData=readerData.replace("\n","");
        console.log(readerData);
        var tmparr = readerData.split("\r\n");
        //console.log(tmparr.length);
        var lastvaluearr;
        if (tmparr.length > 3) {
          lastvaluearr = tmparr[tmparr.length - 2].split(" ");
        }
        else {
          lastvaluearr = tmparr[0].split(" ");
        }

        console.log(lastvaluearr);
        lastvaluearr = lastvaluearr.filter(function (e1) {
          return e1 != null;
        });
        // console.log(lastvaluearr);
        // var lastweight = 0;
        if (lastvaluearr.length > 4) {
          // lastweight = lastvaluearr[2];
          setFirstWeight(lastvaluearr[2])
        }
        // document.getElementById("txtWeight").value = lastweight;
        // console.log(tmparr[tmparr.length - 2]);

        console.log(lastvaluearr,'value')
        // form.setValues({ ...form.values, "firstWeight": lastweight })
        // setFirstWeight(lastvaluearr)

        //port.close();
        /*while(this.reader.available() > 0) {
          t = this.reader.read();
        }*/
        if (readerData != "") {
          //return this.decoder.decode(readerData);
          return readerData;
        }
        else
          return "";
      }
      catch (err) {
        const errorMessage = `error reading data: ${err}`;
        ////console.error(errorMessage);
        return errorMessage;
      }
    }
  }

  const serialLEDController = new SerialLEDController();

  const connect = document.getElementById('connect-to-serial');
  const getSerialMessages = document.getElementById('get-serial-messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const submitButton = document.getElementById('submit-button');
  const serialMessagesContainer = document.getElementById('serial-messages-container');

  const getPort = () => {
    getWeighmentImages();
    serialLEDController.init();
    //  serialMessagesContainer.removeAttribute('disabled');
    //  messageInput.removeAttribute('disabled');
    //   submitButton.removeAttribute('disabled');
  }
  connect && connect.addEventListener('pointerdown', () => {
  });

  messageForm && messageForm.addEventListener('submit', event => {
    event.preventDefault();
    serialLEDController.write(event.target.firstElementChild.value);
    getSerialMessage();
  });

  getSerialMessages && getSerialMessages.addEventListener('pointerdown', async () => {
    getSerialMessage();
  });
  let a = 0;
  async function getSerialMessage() {
    await serialLEDController.read();
    ////serialMessagesContainer.innerText += await serialLEDController.read() + '\n';
    if (a == 0) {
      setInterval(function () { getSerialMessage(); }, 1000);
      a = 1;
    }
  }

  const [firstWeight, setFirstWeight] = useState("")

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setFirstWeight(newValue)
  };

  const checkWeightValue = () => {
    if (firstWeight == "" || firstWeight == undefined) {
      confirmDialog({
        title: `<h5><strong class="text-white">Please Connect to Scale</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    }
    //  else if (!isNaN(form.values.firstWeight) && form.values.firstWeight <= data.vehicleMinWeight) {
    //   errorToast("Please Check Vehicle Weight");
    // } 
    else {
      // addFirstWeight()
      onSubmit()
    }
  }

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>First Weight</h5></CardHeader>
        <hr />
        <CardBody>
          <Row>
            <Col md="3" sm="3">
              <FormGroup>
                <Label >VA No</Label>
                <Input placeholder="VA No" value={data.vaNumber} disabled />
              </FormGroup>
            </Col>

            <Col md="3" sm="3">
              <FormGroup>
                <Label >Truck No</Label>
                <Input placeholder="Truck No" value={data.vehicleNo} disabled />
              </FormGroup>
            </Col>

            <Col md="3" sm="3">
              <FormGroup>
                <Label >Movement Type</Label>
                <Input value={data.movementType} placeholder="Movement Type" disabled />
              </FormGroup>
            </Col>

            <Col md="2" sm="2">
              <div>
                <label>&nbsp;</label>
                <FormGroup style={{ m: 1, width: 150 }}>
                  <Button.Ripple color="primary" type="submit" onClick={getPort}>
                    Connect to Scale
                  </Button.Ripple>
                </FormGroup>
              </div>
            </Col>

            {(data?.confirmationStatus	== 1) &&
            <Col md="3" sm="3">
              <FormGroup>
                <Label>First Weight</Label>
                <Input
                  type="number"
                  placeholder="First Weight"
                  value={firstWeight ? firstWeight : null}
                  // onChange={data.moduleTypeId == 44 ? handleInputChange : ''} 
                  // disabled={data.moduleTypeId != 44}
                  // onChange={handleInputChange} 
                  onChange={data?.weighmentControl == 1 ? handleInputChange : undefined}
                    disabled={data?.weighmentControl != 1}
                  // disabled
                />
              </FormGroup>
            </Col>}
            { (data?.confirmationStatus	== 0) &&
            <Col md="3" sm="3">
              <FormGroup>
                <Label>First Weight</Label>
                <Input
                  type="number"
                  placeholder="First Weight"
                  value={firstWeight ? firstWeight : null}
                  // onChange={handleInputChange} 
                  // disabled
                  //  onChange={data.moduleTypeId == 44 ? handleInputChange : ''} 
                  //  disabled={data.moduleTypeId != 44}
                  onChange={data?.weighmentControl == 1 ? handleInputChange : undefined}
                    disabled={data?.weighmentControl != 1}
                  />
              </FormGroup>
            </Col>}
            <Col md="3" sm="3">
              <FormGroup>
                <Label >Remarks</Label>
                <Input onChange={(e) => setRemarks(e.target.value)} value={remarks} placeholder="Enter Remarks" />
              </FormGroup>
            </Col>
          </Row>

          <Col md="12" sm="12" >
            <Row>
              {imageData.map(imageData => (
                <Col md="3" sm="12" key={imageData.imageUrl}>
                  <div>
                    <img src={imageData.imageUrl} alt="" style={{ m: 1, width: 130 }} />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Row>
            <Col md="10" sm="10">
              <br />
              <FormGroup className="d-flex justify-content-start mb-0">
                <Button.Ripple outline color="primary" type="button" onClick={reset}><ArrowLeft size={16} /> Back</Button.Ripple>
              </FormGroup>
            </Col>

            <Col md="2" sm="2">
              <br />
              <FormGroup className="d-flex justify-content-end mb-0">
                <Button.Ripple color="primary" type="button" onClick={checkWeightValue}><Check size={16} /> Submit</Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default FirstWeight