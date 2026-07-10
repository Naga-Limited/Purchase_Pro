import React, { Fragment } from 'react'
import { Search, X } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper'
import { apiBaseUrl } from '../../urlConstants'
import { RefreshBlock1 } from '../common/RefreshBlock1'
import { useLoader } from '../../utility/hooks/useLoader'
import { useFormik } from 'formik'
import { CustomDropdownInput, Yup } from '../forms/custom-form'
import FirstWeight from './FirstWeight'
import SecondWeight from './SecondWeight'
import Weightment from './Weightment'
import { useSelector } from 'react-redux'
import { useHistory } from "react-router-dom";
import IasEmptyVehicleArrivalForm from '../IAS/sending/empty-vehicle-arrival/ias-empty-vehicle-arrival-form'
import STMWeightEntryDetails from '../STM/STMWeightEntryDetails'
import { Modal, ModalBody } from 'react-bootstrap'
import ReactSelect from 'react-select'
import { useEffect } from "react";
import BarcodeScanner from '../common/BarcodeScanner'

const FGWeightEntry = () => {

  let { showLoader, hideLoader } = useLoader();
  const [isDisabled, setIsDisabled] = useState(false)
  const [isDisabled1, setIsDisabled1] = useState(false)
  const [data, setData] = useState([])
  const [imageData, setImageData] = useState([])
  const [truckValue, setTruckValue] = useState('')
  const [shipmentValue, setShipmentValue] = useState('')
  const [secondWeight, setSecondWeight] = useState('')
  const [redirectData, setRedirectData] = useState([])
  const [showDocument, setShowDocument] = useState(false)
  const [netWeightValidation, setNetWeightValidation] = useState(false)
  const [gate_Status, setGate_Status] = useState(false)
  const [shipmentWeight, setShipmentWeight] = useState('')

  const [open, setOpen] = useState(false)
  const [QRControl, SetQRControl] = useState(false);

  const SelectTruckNo = (e) => {
    setTruckValue(e.target.value)
  }
  const selectShipmentNo = (e) => {
    setShipmentValue(e.target.value)
  }
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getGateInInfo = (documentNumber,truck_no) => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||truck_no}/1/1/0/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||truck_no}/1/1/0/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          setIsDisabled(true)
        } else if (data.success == false) {
          getEmptyVehicleArraival(documentNumber,truck_no)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getEmptyVehicleArraival = (documentNumber,truck_no) => {
    console.log(truckValue,documentNumber)
    console.log(apiBaseUrl + `GatePro/Gate/getEmptyVehicleArraival/${truckValue||truck_no}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getEmptyVehicleArraival/${truckValue||truck_no}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          console.log(data.results[0])
          setIsDisabled(true)
        }
        else if (data.success == false) {
          getPurchaseInfo(documentNumber,truck_no)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getPurchaseInfo = (documentNumber,truck_no) => {
    console.log(apiBaseUrl + `GatePro/Gate/getPurchaseInfo/${truckValue||truck_no}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Gate/getPurchaseInfo/${truckValue||truck_no}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          console.log(data.results[0]);
          setData(data.results[0])
          // history.push(`STMWeightEntryDetails/${data.results[0].EMPTY_VEHICLE_ARRIVAL_ID}/${data.results[0].PI_REFID}/Unload`);
          setIsDisabled(true)
        }
        else if (data.success == false) {
          getTestWeighbridge(documentNumber,truck_no)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getTestWeighbridge = (documentNumber,truck_no) => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/${truckValue||truck_no}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/${truckValue||truck_no}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          setIsDisabled(true)
        } else if (data.success == false) {
          getTestWeighmentInfo(documentNumber,truck_no)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getTestWeighmentInfo = (documentNumber,truck_no) => {
    showLoader();
    console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/${truckValue||truck_no}/0/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/${truckValue||truck_no}/0/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0])
          setIsDisabled(true)
        } else if (data.success == false) {
          getWeighmentInfo(documentNumber,truck_no)
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getWeighmentInfo = (documentNumber,truck_no) => {

    let documentNo = documentNumber != '' ? documentNumber : 0

    console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/${truckValue||truck_no}/0/${UserDetails.USERID}/${documentNo}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/${truckValue||truck_no}/0/${UserDetails.USERID}/${documentNo}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {

          let moduleType = data.data[0].moduleTypeId == 12 || data.data[0].moduleTypeId == 15 || (data.data[0].moduleTypeId == 33 && data.data[0].userGateId	!= 19) || data.data[0].moduleTypeId == 34 || data.data[0].moduleTypeId == 21 || data.data[0].moduleTypeId == 25 || data.data[0].moduleTypeId == 2 || data.data[0].moduleTypeId == 29 || data.data[0].moduleTypeId == 1 ||  data.data[0].moduleTypeId == 43

          if (((moduleType && showDocument == false) && data.data[0].firstWeight != null && ((data.data[0].isRedirect == 0 || data.data[0].isRedirect == null && data.data[0].waitingAt != 9) || ((data.data[0].moduleTypeId == 1 || data.data[0].moduleTypeId == 2) && data.data[0].waitingAt != 9))) || (showDocument == false && (data.data[0].moduleTypeId == 12 || data.data[0].moduleTypeId == 15 || (data.data[0].moduleTypeId == 33 && data.data[0].userGateId	!= 19) || data.data[0].moduleTypeId == 34 || data.data[0].moduleTypeId == 21) && (data.data[0].isRedirect == 0 || data.data[0].isRedirect == null || data.data[0].moduleTypeId == 43))) {
            setShowDocument(true)
            getDocumentDetails(data.data[0].gateInOutInfoId)
            setIsDisabled(true)
          }
          else if ((data.data[0].moduleStatusId == 2 || data.data[0].moduleStatusId == 9) || (moduleType) || data.data[0].moduleStatusId == 4 || data.data[0].moduleTypeId == 19 || data.data[0].moduleTypeId == 8 || data.data[0].moduleTypeId == 43 | data.data[0].moduleTypeId == 39) {
            if (moduleType || data.data[0].moduleTypeId == 19 || data.data[0].moduleTypeId == 8 || data.data[0].moduleTypeId == 43 | data.data[0].moduleTypeId == 39) { 
              if (data.data[0].secondWeight == null || data.data[0].isGateInOutInfo == 1 || data.data[0].isRedirect == 0 ||  data.data[0].moduleTypeId == 19 || data.data[0].moduleTypeId == 8 || data.data[0].moduleTypeId == 43 || data.data[0].moduleTypeId == 39) { 
                setData(data.data[0])
                setIsDisabled(true)
                setSecondWeight(data.firstWeight)
              } else {
                setData([])
                errorToast("Weighment Already Exist");
              }
            }
            else {
              setData(data.data[0])
              setIsDisabled(true)
              setSecondWeight(data.firstWeight)
            }
          }
          else if (data.data[0].moduleStatusId == 3) {
            errorToast("Second Weight Already Exist");
          }
          setNetWeightValidation(data.netWeightValidation)
          setGate_Status(data.gate_Status)
        }
        else if (data.success == false) {
          setData([])
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const getWeighmentImages = () => {
    const postData = {
      masterPlantId: data.masterPlantId,
      vaNumber: data.vaNumber,
      movementType: data.movementType
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
        setData(false)
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
  });

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
        console.log(lastvaluearr);
        var lastweight = 0;
        if (lastvaluearr.length > 2) {
          lastweight = lastvaluearr[2];
        }
        document.getElementById("txtWeight").value = lastweight;
        console.log(tmparr[tmparr.length - 2]);


        if (form.values.VEHICLE_STATUS == "23") {
          form.setValues({ ...form.values, "FirstWeight": lastweight, "FirstWeight1": lastweight })
        }
        if (form.values.VEHICLE_STATUS == "24") {
          form.setValues({ ...form.values, "SecondWeight": lastweight, "SecondWeight1": lastweight })
        }
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

  const submit = () => {

    const postdata = {
      gateInOutInfoId: redirectData.gateInOutInfoId,
      emptyVehicleArrivalId: null,
      purchaseInfoId: null,
      firstWeight: redirectData.redirectFirstWeight,
      userInfoId: UserDetails.USERID,
      moduleStatusId: 2,
      imageDetails: []
    };

    showLoader();
    console.log(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata);
    apiPostMethod(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata)
      .then((response) => {
        const res = response.data;
        if (res.success == true) {
          getGateInInfo()
          setOpen(false)
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

  const [documentDetails, setDocumentDetails] = useState([])

  const getDocumentDetails = (gateInOutInfoId) => {
    console.log(apiBaseUrl + `GatePro/Weighment/getDocumentDetails/${gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getDocumentDetails/${gateInOutInfoId}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setDocumentDetails(data.results)
        }
        else if (data.success == false) {
          errorToast('Document Number is empty')
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const [selectedDocument, setSelectedDocument] = useState([])

  const selectDocument = (e,truck_no) => {
    setSelectedDocument(e)
    getGateInInfo(e.label,truck_no)
  }

  const QRCodeControl = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
        .then((response) => {
            const data = response.data;
            if (data.success == 1) {
                SetQRControl(data.results)
            }
        })
        .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
        })
  }
  const handleScan = (barcode) => {
    fetchData(barcode)
  };
  const fetchData = (barcode) => {
      // if(truckValue){
        //  getGateInInfo(barcode)
      // }
      let document_no = ''
      setTruckValue(barcode)

      if(showDocument == true){
        selectDocument(document_no,barcode)
      }else{
        getGateInInfo(document_no,barcode)
      }
  };

  useEffect(() => {
    QRCodeControl()
  }, [])

  const getShipmentNo = () => {
    if(!shipmentValue){
      errorToast('Please Enter Shipment No')
      return
    }
    showLoader();
    console.log(apiBaseUrl + `GatePro/Weighment/getShipmentNo/${truckValue}/${shipmentValue}/${data.gateInOutInfoId}/${UserDetails.USERID}`);
    apiPostMethod(apiBaseUrl + `GatePro/Weighment/getShipmentNo/${truckValue}/${shipmentValue}/${data.gateInOutInfoId}/${UserDetails.USERID}/0`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          // setData(data.results[0])
          setShipmentWeight(data?.results[0]?.OVERALL_DELIVERY_WT)
          setIsDisabled1(true)
        }else{
          errorToast(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        setData(false)
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>Weighment</h5><RefreshBlock1 /></CardHeader>
        <hr />
        <CardBody>
          <Row>
          {QRControl == false &&
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Truck No</Label>
                <InputGroup>
                  <Input type="text" id="Vehicle_Number" placeholder="Truck No" onChange={SelectTruckNo} value={truckValue} disabled={isDisabled} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGateInInfo} disabled={isDisabled}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
              </FormGroup>
            </Col>}
            {QRControl == true &&
                        <Col md="4" sm="12">
                            <BarcodeScanner onScan={handleScan} Label={'Truck'}/>
                            {/* <QRCodeScanner /> */}
                            { truckValue &&
                            <Input type="text" disabled value={truckValue} />}
                        </Col>}
            
            {/* {data?.moduleTypeId == 43 && isDisabled && data?.firstWeight && data?.moduleStatusId == 2 ?
                <FormGroup>
                <Label>Shipment No</Label>
                <InputGroup>
                  <Input type="text" id="Shipment_No" placeholder="Shipment No" onChange={selectShipmentNo} value={shipmentValue} disabled={isDisabled1} />
                  <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getShipmentNo} disabled={isDisabled1}>
                    <Search size={20} />
                  </Button>
                </InputGroup>
                </FormGroup> : null
            } */}
            {showDocument == true ?

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Document Number</Label>
                  <ReactSelect
                    value={selectedDocument}
                    options={documentDetails}
                    onChange={selectDocument}
                  />
                </FormGroup>
              </Col> : null
            }
          </Row>
        </CardBody>
      </Card>

      {(data.moduleStatusId == 1 || data.isWeighment == 0) || ((data.moduleTypeId == 4 || data.moduleTypeId == 5 || data.moduleTypeId == 27 || data.moduleTypeId == 6 || data.moduleTypeId == 22 || data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 25 || data.moduleTypeId == 45) && ((data.movementTypeId == 1 && data.moduleStatusId == 3 && data.secondWeight == null) || ((data.movementTypeId == 2 && data.moduleStatusId == 4 && data.secondWeight == null) || (data.moduleStatusId == 3 && data.moduleTypeId == 22)))) || (data?.moduleStatusId == 3 && data.moduleTypeId == 23) ? <FirstWeight data={data} setData={setData} setIsDisabled={setIsDisabled} setTruckValue={setTruckValue} selectedDocument={selectedDocument} setSelectedDocument={setSelectedDocument} setShowDocument={setShowDocument} /> : null}

      {data.waitingAt == 9 && (data.vehicleType == 'BULKER' || data.vehicleType == 'TRAILER') ? <Weightment data={data} setData={setData} setIsDisabled={setIsDisabled} setTruckValue={setTruckValue} /> : null}

      {(data.waitingAt == 3 && (data.moduleStatusId == 2 || data.moduleStatusId == 9) && data?.moduleTypeId != 43) || ((data.movementTypeId == 1 && data.moduleStatusId == 3 && data.weighmentInfoId > 0) && (data.moduleTypeId == 7 || data.moduleTypeId == 13 || data.moduleTypeId == 5 || data.moduleTypeId == 27)) || ((data.movementTypeId == 2 && data.moduleStatusId == 4 && data.weighmentInfoId > 0) && (data.moduleTypeId == 7 || data.moduleTypeId == 13 || data.moduleTypeId == 5 || data.moduleTypeId == 28)) || (data.isGateInOutInfo == 1 && data.secondWeight != null) || (data?.testWeighmentInfoId > 0 && data.moduleStatusId == 2) || (data.moduleTypeId == 27 && data?.moduleStatusId == 4 && data.secondWeight != null) || ((data.waitingAt == 3 || data.waitingAt == 4 || data.waitingAt == 5) && data?.moduleTypeId == 43) ? <SecondWeight data={data} setData={setData} setIsDisabled={setIsDisabled} setTruckValue={setTruckValue} selectedDocument={selectedDocument} setSelectedDocument={setSelectedDocument} setShowDocument={setShowDocument}  netWeightValidation={netWeightValidation} gate_Status={gate_Status} shipmentWeight = {shipmentWeight}/> : null}

      {data.ZVA_NUMBER ? <STMWeightEntryDetails data={data} setData={setData} setTruckValue={setTruckValue} setIsDisabled={setIsDisabled} /> : null}

      {data == '' && selectedDocument.label != '' ? <div style={{ marginBottom: "350px" }}></div> : null}

      <Modal show={open} centered>
        <ModalBody>
          <Row>
            <Col sm="12" md="12">
              <Col md="12" sm="12"><Label className="d-flex justify-content-end mb-0"><X size={20} onClick={() => setOpen(false)} /></Label></Col>
            </Col>
            <Col sm="12" md="12">
              <FormGroup>
                <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>This is Redirect Vehicle, Please Select</h5></Label></Col>
              </FormGroup>
            </Col>

            <Col sm="12" md="12">
              <FormGroup className="d-flex justify-content-center mb-0">
                <div className="mr-1">
                  <Button.Ripple color="primary" type="button" onClick={getGateInInfo}>First Weight</Button.Ripple>
                </div>
                <Button.Ripple color="primary" type="button" onClick={submit}>Second Weight</Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <label>&nbsp;</label>
      </Modal>

    </Fragment>
  )
}

export default FGWeightEntry
