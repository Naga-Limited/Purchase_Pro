import React, { Fragment } from 'react'
import { ArrowLeft, Check, Search, X } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Modal, Row } from 'reactstrap'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../helper/appHelper'
import { apiPostMethod } from '../../helper/axiosHelper'
import { apiBaseUrl } from '../../urlConstants'
import { RefreshBlock1 } from '../common/RefreshBlock1'
import { useLoader } from '../../utility/hooks/useLoader'
import { useSelector } from 'react-redux'
import { CardComponent } from '../common/CardComponent'
import { FastField, useFormik } from 'formik'
import { CustomDropdownInput, CustomTextInput, Yup } from '../forms/custom-form'
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from 'react'

const SecondWeight = ({ data, setData, setIsDisabled, setTruckValue, selectedDocument, setSelectedDocument, setShowDocument, getDocumentDetails,netWeightValidation,gate_Status,shipmentWeight }) => {

  //console.log(selectedDocument?.documentWeight);

  const multipleWeightType = data?.moduleTypeId == 7 || data?.moduleTypeId == 13 || data?.moduleTypeId == 5 || data?.moduleTypeId == 12 || data?.moduleTypeId == 15 || data?.moduleTypeId == 21 || data?.moduleTypeId == 25 || data?.moduleTypeId == 33 || data?.moduleTypeId == 34 || data?.moduleTypeId == 1 || data?.moduleTypeId == 2 || data?.moduleTypeId == 29  || data?.moduleTypeId == 27 || data?.moduleTypeId == 28 || data?.moduleTypeId == 40 || data?.moduleTypeId == 39 || data?.moduleTypeId == 41 || data?.moduleTypeId == 19 ||  data?.moduleTypeId == 8 ||  data?.moduleTypeId == 43


  useEffect(() => {
    if(data?.moduleTypeId == 1 || data?.moduleTypeId == 2){
    getTripsheetDetailsForFG()
    }
  }, [data])

  const [tripsheetData, setTripSheetData] = useState([])

  const getTripsheetDetailsForFG = () => {
    const postData = { Vehicle_Number: data?.vehicleNo, userInfoId: UserDetails.USERID, isMovement: data?.isMovement,weight :  1}
    console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          if (tripsheetData[0]?.TRIPSHEET_NO != undefined) {
            setTripSheetData(data.results)
          }
        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  //Calculation
  const [values, setValues] = useState('')
  const [second, setSecond] = useState('')
  const [sum, setSum] = useState('')
  const [remarks, setRemarks] = useState('')

  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    const newValues = {
      ...values,
      [name]: value
    }
    setValues(newValues)
    calcSum(newValues)
    calcSecond(newValues)
    setSecond(value)
  }

  const calcSum = (newValues) => {
    const { second } = newValues;
    if (data.movementTypeId == 1 || data.moduleTypeId == 1) {
      const newSum = parseInt(second, 10) - parseInt((multipleWeightType) && (data.secondWeight) ? data.secondWeight : data.firstWeight, 10)
      setSum(newSum)
    } else {
      const newSum = parseInt((multipleWeightType) && (data.secondWeight) ? data.secondWeight : data.firstWeight, 10) - parseInt(second, 10)
      setSum(newSum)
    }
  }
  const calcSecond = (newValues) => {
    const { sum } = newValues;
    if (data.movementTypeId == 1 || data.moduleTypeId == 1) {
      const newSecond = parseInt(sum, 10) + parseInt((multipleWeightType) && (data.secondWeight) ? data.secondWeight : data.firstWeight, 10)
      setSecond(newSecond)
    } else {
      const newSecond = parseInt(sum, 10) - parseInt((multipleWeightType) && (data.secondWeight) ? data.secondWeight : data.firstWeight, 10)
      setSecond(newSecond)
    }
  }

  let { showLoader, hideLoader } = useLoader();
  const [imageData, setImageData] = useState([])


  const getWeighmentImages = () => {
    const postData = {
      masterPlantId: data.masterPlantId,
      vaNumber: data.vaNumber,
      movementType: data.movementType,
      weighmentInfoId: data.weighmentInfoId
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

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const checkWeight = () => {
    if (second == '') {
      confirmDialog({
        title: `<h5><strong class="text-white">Please Connect to Scale</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    } else if (!isNaN(Number(second)) && Number(second) <= data.vehicleMinWeight) {
      errorToast("Please Check Vehicle Weight");
    } else if (((data?.moduleTypeId == 1 && data?.getIsIFoodSales == 0) && data?.shipmentOrderNo == null) || (data.secondWeight != null && ((data?.moduleTypeId == 29 && selectedDocument?.value != 'D2R Sales' && selectedDocument?.value != 'GT Sales' && selectedDocument?.value != 'Export Sales') || (data?.moduleTypeId == 1 && data?.getIsIFoodSales == 1)))) {
      errorToast("Shipment Order No is Empty");
    } else if (data?.moduleTypeId == 2 && data?.stoPoNo == null) {
      errorToast("STO Po No is Empty");
    } else if ((data?.moduleTypeId == 7 || data?.moduleTypeId == 13 || data?.moduleTypeId == 5 || data?.moduleTypeId == 27 || data?.moduleTypeId == 28 || data?.moduleTypeId == 23) && (remarks == '')) {
      errorToast("Please Enter Remarks");
    }else if (data?.moduleTypeId == 44 && !form?.values?.loadingLocation) {
      errorToast("Please Select Loading Location");
    }
    else {
      if ((gate_Status == false)&& (data?.movementTypeId == 1 || data?.moduleTypeId == 1) && Number((multipleWeightType) && (data.secondWeight) ? data?.secondWeight : data?.firstWeight) >= Number(second) && data?.moduleTypeId != 23) {
        confirmDialog({
          title: `<h5><strong class="text-white">Second Weight Is Less Than First Weight</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      } else if ( gate_Status == false && data?.movementTypeId == 2 && data?.moduleTypeId != 1 && Number((multipleWeightType) && (data?.secondWeight) ? data?.secondWeight : data?.firstWeight) <= Number(second)) {
        confirmDialog({
          title: `<h5><strong class="text-white">Second Weight Is Greater Than First Weight</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      }else if ( gate_Status == true && data?.movementTypeId == 1 && (sum < netWeightValidation)) {
        confirmDialog({
          title: `<h5><strong class="text-white">Second Weight Is Less Than First Weight</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      }else if ( gate_Status == true && data?.movementTypeId == 2 && (sum < netWeightValidation)) {
        confirmDialog({
          title: `<h5><strong class="text-white">Second Weight Is Greater Than First Weight</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      } else {
        onSubmit()
      }
    }
  }

  const onSubmit = () => {
    if (data?.moduleTypeId == 23) {
      addTestWeighmentInfo()
    } else {
      addFirstWeight()
    }
  }

  const addFirstWeight = () => {

    const postdata = {
      weighmentInfoId: data?.weighmentInfoId,
      gateInOutInfoId: data?.gateInOutInfoId,
      documentNumber: selectedDocument != '' ? selectedDocument?.label : null,
      moduleType: selectedDocument != '' ? selectedDocument?.moduleType : null,
      firstWeight: (multipleWeightType) && (data?.secondWeight) ? data?.secondWeight : data?.firstWeight,
      secondWeightCheck: data?.secondWeightCheck,
      secondWeight: second,
      netWeight: sum,
      remarks: remarks || form?.values?.loadingLocation?.label,
      tripsheetNumber: data?.moduleTypeId == 29 ? '' : tripsheetData != '' && (data?.moduleTypeId == 1 || data?.moduleTypeId == 2) ? tripsheetData[0]?.TRIPSHEET_NO : '',
      shipmentOrderNo: data?.moduleTypeId == 29 ? '' : tripsheetData != '' && (data?.moduleTypeId == 1 || data?.moduleTypeId == 2) ? tripsheetData[0]?.SAP_LINE[0]?.SHIPMENTORDERNO : '',
      firstWeightBy: data.firstWeightBy,
      userInfoId: UserDetails.USERID,
      moduleStatusId: 3,
      gate_Status:gate_Status,
      imageDetails: imageData,
    };

    if (data.moduleStatusId == 9) {
      if (data.secondWeightCheck == second) {
        showLoader();
        console.log(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata)
          .then((response) => {
            const res = response.data;
            if (res.success == true) {
              ShowToast(res.message);
              setSelectedDocument([])
              setShowDocument(false)
              setTruckValue("")
              setIsDisabled(false)
              setData([])
              setRemarks('')
              // getDocumentDetails()
            }
            else if (res.success == false) {
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
      else {
        confirmDialog({
          title: `<h5>Check Weight & Second Weight Not Matched<h5>`,
          html_data: `<h6>Second Weight Check : ${data.secondWeightCheck}</h6> <h6>Second Weight : ${second}</h6> <h6>Different Weight : ${data.secondWeightCheck - second}</h6>`
        }).then((res) => {
          if (res) {
            showLoader();
            console.log(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata);
            apiPostMethod(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata)
              .then((response) => {
                const res = response.data;
                if (res.success == true) {
                  ShowToast(res.message);
                  setTruckValue("")
                  setIsDisabled(false)
                  setSelectedDocument([])
                  setShowDocument(false)
                  setData([])
                  setRemarks('')
                  // getDocumentDetails()
                }
                else if (res.success == false) {
                  errorToast(res.message)
                }
                console.log(res);
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
    } else {
      showLoader();
      console.log(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata);
      apiPostMethod(apiBaseUrl + "GatePro/Weighment/addFirstWeight", postdata)
        .then((response) => {
          const res = response.data;
          if (res.success == true) {
            ShowToast(data.secondWeight != '' ? 'Weighment Successfully' : res.message);
            setTruckValue("")
            setIsDisabled(false)
            setSelectedDocument([])
            setShowDocument(false)
            setData([])
            setRemarks('')
            // getDocumentDetails()
          }
          else if (res.success == false) {
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
  }

  const addTestWeighmentInfo = () => {

    const postdata = {
      testWeighmentInfoId: data.testWeighmentInfoId,
      testWeighbridgeId: data.testWeighbridgeId,
      firstWeight: data.firstWeight,
      secondWeight: second,
      netWeight: sum,
      remarks: remarks,
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
    setIsDisabled(false)
    setTruckValue("")
    setData("")
    setShowDocument(false)
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() {},
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

        //console.log(lastvaluearr);
        lastvaluearr = lastvaluearr.filter(function (e1) {
          return e1 != null;
        });
        //console.log(lastvaluearr);
        var lastweight = 0;
        lastweight = lastvaluearr[2];

        if (lastvaluearr.length > 4) {
          // lastweight = lastvaluearr[2];
          setSecond(lastweight)
          if (data?.movementType == 'LOADING' || data?.moduleTypeId == 1) {
            // const newSum = parseInt(lastweight, 10) - parseInt(data.firstWeight, 10)           
            // const newSum = parseInt(lastweight, 10) - parseInt(data.secondWeight ? data.secondWeight : data.firstWeight, 10)
            const newSum = parseInt(lastweight, 10) - parseInt((multipleWeightType) && (data?.secondWeight) ? data?.secondWeight : data?.firstWeight, 10)
            setSum(newSum)
          } else {
            //const newSum = parseInt(data.firstWeight, 10) - parseInt(lastweight, 10)
            // const newSum = parseInt(data.secondWeight ? data.secondWeight : data.firstWeight, 10) - parseInt(lastweight, 10)
            const newSum = parseInt((multipleWeightType) && (data?.secondWeight) ? data?.secondWeight : data?.firstWeight, 10) - parseInt(lastweight, 10)
            setSum(newSum)
          }
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

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>Second Weight</h5></CardHeader>
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
                <Input value={data.moduleTypeId == 1 ? 'LOADING' : data.movementType} placeholder="Movement Type" disabled />
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

            <Col md="3" sm="3">
              <FormGroup>
                <Label>First Weight</Label>
                <Input onChange={onChange} value={(multipleWeightType) && (data.secondWeight) ? data.secondWeight : data.firstWeight} name='first' id="first" type="number" disabled />
              </FormGroup>
            </Col>

            {(data?.confirmationStatus == 1) &&
            <Col md="3" sm="3">
              <FormGroup>
                <Label>Second Weight</Label>
                <Input 
                  // onChange={onChange} 
                  // onChange={data.moduleTypeId == 44 ? onChange : ''} 
                  // disabled={data.moduleTypeId != 44}
                  value={second}
                  min={500}
                  placeholder="Second Weight"
                  name='second' 
                  id="second" 
                  type="number" 
                  required 
                  // disabled
                  onChange={data?.weighmentControl == 1 ? onChange : undefined}
                  disabled={data?.weighmentControl != 1}
                />
              </FormGroup>
            </Col>}
            { (data?.confirmationStatus	== 0) &&
            <Col md="3" sm="3">
              <FormGroup>
                <Label>Second Weight</Label>
                <Input 
                  // onChange={onChange} 
                  // onChange={data.moduleTypeId == 44 ? onChange : ''} 
                  // disabled={data.moduleTypeId != 44}
                  value={second}
                  min={500}
                  placeholder="Second Weight"
                  name='second' 
                  id="second" 
                  type="number" 
                  required 
                  // disabled
                  onChange={data?.weighmentControl == 1 ? onChange : undefined}
                  disabled={data?.weighmentControl != 1}
                />
              </FormGroup>
            </Col>}
            <Col md="3" sm="3">
              <FormGroup>
                <Label >Net Weight</Label>
                <Input onChange={onChange} value={sum} placeholder="Net Weight" id="sum" name="sum" type="number" disabled />
              </FormGroup>
            </Col>
            {data?.moduleTypeId != 44 &&
            <Col md="3" sm="3">
              <FormGroup>
                <Label >Remarks</Label>
                <Input onChange={(e) => setRemarks(e.target.value)} value={remarks} placeholder="Enter Remarks" />
              </FormGroup>
            </Col>}
            {data?.moduleTypeId == 44 &&
               <Col sm="3" md="3">
               <FormGroup>
               <CustomDropdownInput
                   url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/${32}`}
                   label={"Loading Location"}
                   form={form}
                   id="loadingLocation"
                   name="loadingLocation"
               />
               </FormGroup>
             </Col>
            }

            {((data.moduleTypeId == 1 || data.moduleTypeId == 2) && selectedDocument?.documentWeight != undefined) || (data?.moduleTypeId == 43 && shipmentWeight && data.moduleStatusId == 2) ?
              <Col md="12" sm="12">
                <br/>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="bg-primary text-white text-center">{selectedDocument.moduleType == 'FG-Sales' || data.moduleTypeId == 43 ? "Shipment Weight" : "Delivery Weight"}</th>
                      <th className="bg-primary text-white text-center">Net Weight</th>
                      <th className="bg-primary text-white text-center">{selectedDocument.moduleType == 'FG-Sales' || data.moduleTypeId == 43 ? "Diff WB (Shipment Weight & Net weight)" : "Diff (Delivery Weight & Net weight)"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='text-center'>{Number(selectedDocument?.documentWeight || shipmentWeight).toFixed(3)}</td>
                      <td className='text-center'>{Number(sum).toFixed(3)}</td>
                      <td className='text-center'>{Number((selectedDocument?.documentWeight || shipmentWeight) - sum).toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>
              </Col> : null
            }
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
                <Button.Ripple color="primary" type="button" onClick={checkWeight}><Check size={16} /> Submit</Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default SecondWeight
