import React, { Fragment, useRef, useState } from "react";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { CardComponent } from "../../common/CardComponent";
import { Row, Col, Button, Label, Input, FormGroup } from "reactstrap";
import NumberOnlyInput from "../../../@core/components/number-input/number-input";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { apiBaseUrl, tblSTMUrl } from "../../../urlConstants";
import { useHistory, useParams } from "react-router";
import { useLoader } from "../../../utility/hooks/useLoader";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";

const FGReturnWeightment = ({ vaNo, truckNo, movementType }) => {

  const [secondWeight, setSecondWeight] = useState(false)

  const selectSecondWeight = () => {
    setSecondWeight(true)
  }

  let history = useHistory();
  let { showLoader, hideLoader } = useLoader();

  const [statusData, setStatusdata] = useState([]);

  let { id, purchaseid, mode } = useParams();


  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
  });

  let values = form.values;
  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const getDetails = () => {
    let fdata = {

      ID: id,
      PurchaseInfoId: purchaseid,
      formType: "WEIGHTENTRYDET",
      plantIds: [],
      startCount: 0

    };
    showLoader();
    //alert("ok")
    apiPostMethod(tblSTMUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        // console.log(data.success);
        if (data.success) {
          //  alert(data.results.ZVA_NUMBER);
          let PO_vehcileStatus = data.results[0] ? data.results[0].VECHICAL_STATUS : data.results[0].VECHICAL_STATUS;

          console.log("vehcileStatus:" + PO_vehcileStatus);
          form.setValues({
            Id: data.results.PI_REFID,
            VANumber: data.results[0].ZVA_NUMBER,
            TRUCK_NO: data.results[0].TRUCK_NO,
            SCREEN_TYPE: data.results[0].SCREEN_TYPE,
            WERKS: data.results[0].WERKS ? data.results[0].WERKS : "",
            WeightId: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].Id : mode == 'Unload' && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].Id : "",
            Mode: mode,
            VEHICLE_STATUS: mode == 'STM' ? data.results[0].VEHICLE_STATUS : mode == 'Unload' ? PO_vehcileStatus : "",
            FirstWeight: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].FirstWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].FirstWeight : "",
            SecondWeight: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].SecondWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].SecondWeight : "",

            FirstWeight1: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].FirstWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].FirstWeight : "",
            SecondWeight1: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].SecondWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].SecondWeight : "",


          });
          setStatusdata([{ options: data.VehStatus }]);
          document.getElementById("VANumber").disabled = true;
          form.setFieldValue("Status", { label: data.results.StatusName, value: data.results.VECHICAL_STATUS });

        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();

      });
  };
  const goback = () => {
    history.push(`/STMWeightEntry`);
  }


  const onSubmit = () => {
    // alert("1");
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }


    //let formData = form.values;
    let NetWeight = 0;
    if (form.values.SecondWeight && form.values.SecondWeight > 0) {
      if (form.values.Mode == "STM") {
        NetWeight = form.values.SecondWeight - form.values.FirstWeight;
      }
      if (form.values.Mode == "Unload") {
        NetWeight = form.values.FirstWeight - form.values.SecondWeight;
      }
    }
    console.log("Weight CHECK Y" + form.values.FirstWeight + "X");
    console.log("Weight CHECK Y" + form.values.SecondWeight + "X");
    let wt1 = parseFloat(form.values.FirstWeight);

    if (form.values.VEHICLE_STATUS == "23" && form.values.hasOwnProperty("FirstWeight") && (wt1 <= 0 || isNaN(wt1))) {

      console.log("1st Weight Check");

      console.log("1st Weight Error");
      errorToast("1st Weight should be greater then Zero");
      return false;
    }

    else if (form.values.VEHICLE_STATUS == "24" && form.values.hasOwnProperty("SecondWeight")) {
      let wt2 = parseFloat(form.values.SecondWeight);
      console.log("2nd Weight Check");
      if (wt2 <= 0 || isNaN(wt2)) {
        console.log("2nd Weight Error");
        errorToast("2nd Weight should be greater then Zero");
        return false;
      }
    }

    let formData = {

      VANumber: form.values.VANumber,
      FirstWeight: form.values.FirstWeight,
      SecondWeight: form.values.SecondWeight,
      NetWeight,
      FirstWeight1: form.values.FirstWeight1,
      SecondWeight1: form.values.SecondWeight1,
    }



    const postdata = {
      Data: formData,
      WeightId: form.values.WeightId,
      Mode: form.values.Mode,
      purchaseid,
      id,
      VEHICLE_STATUS: form.values.VEHICLE_STATUS,
      SCREEN_TYPE: form.values.SCREEN_TYPE,
      WERKS: form.values.WERKS

    }
    // console.log(JSON.stringify(postdata));
    //  return false;

    let msg = "Weight Details Entry"
    confirmDialog({
      title: "Are you sure want to Update?",
      description: msg,
    }).then((res) => {
      if (res) {
        showLoader();
        apiPostMethod(apiBaseUrl + "Master/STMWeightEntry", postdata)
          .then((response) => {
            //  alert("4");
            const { data } = response;
            console.log(JSON.stringify(response))

            ShowToast("Saved Successfully...");
            history.push(`/STMWeightEntry`);
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      }
    });


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
      <CardComponent >
        <Row>
          <Col md="3" sm="3">
            <FormGroup>
              <Label for="cityMulti">VA No</Label>
              <NumberOnlyInput
                decimalFormat={"2"}
                placeholder="VA No"
                value={vaNo}
                disabled
              />
            </FormGroup>
          </Col>
          <Col md="3" sm="3">
            <FormGroup>
              <Label for="cityMulti">Truck No</Label>
              <Input
                decimalFormat={"2"}
                placeholder="Truck No"
                value={truckNo}
                disabled
              />
            </FormGroup>
          </Col>
          <Col md="3" sm="3">
            <FormGroup>
              <Label for="cityMulti">Movement Type</Label>
              <Input
                decimalFormat={"2"}
                placeholder="Movement Type"
                value={movementType}
                disabled
              />
            </FormGroup>
          </Col>
          <Col md="2" sm="2">
            <div>
              <label>&nbsp;</label>
              <FormGroup style={{ m: 1, width: 150 }}>
                <Button.Ripple color="primary" type="submit" onClick={(e) => getPort()}>
                  Connect to Scale
                </Button.Ripple>
              </FormGroup>
            </div>
          </Col>
          <Col md="3" sm="3">
            <FormGroup>
              <Label for="cityMulti">First Weight</Label>
              <Input
                decimalFormat={"2"}
                placeholder="First Weight"
                disabled
              />
            </FormGroup>
          </Col>
          {secondWeight ?
            <Col md="3" sm="3">
              <FormGroup >
                <Label for="cityMulti">Second Weight</Label>
                <Input
                  decimalFormat={"2"}
                  placeholder="Second Weight"
                  disabled
                />
              </FormGroup>
            </Col> : null}

          {secondWeight ?
            <Col md="3" sm="3">
              <FormGroup>
                <Label for="cityMulti">Net Weight</Label>
                <Input
                  decimalFormat={"2"}
                  placeholder="Net Weight"
                  disabled
                />
              </FormGroup>
            </Col> : null}



        </Row>
        <Row>
          <Col md="3" sm="12">
            <div>
              <img src="https://images.91wheels.com//assets/b_images/main/models/profile/profile1662382156.jpg?width=540" alt="" style={{ m: 1, width: 130 }} />
            </div>
          </Col>
          <Col md="3" sm="12">
            <div>
              <img src="https://shutterstock.com/image-illustration/logistics-concept-cargo-truck-transporting-260nw-780772786.jpg" alt="" style={{ m: 1, width: 130 }} />
            </div>
          </Col>
          <Col md="3" sm="12">
            <div>
              <img src="https://media.istockphoto.com/id/1338388100/photo/long-carry-lorry-truck.jpg?s=612x612&w=0&k=20&c=eKVNErE5WyIF4sKoPSp1X6eJFI1Db2JIYAJMFs0jtZk=" alt="" style={{ m: 1, width: 130 }} />
            </div>
          </Col>
          <Col md="3" sm="12">
            <div>
              <img src="https://d7o5su2yzofbl.cloudfront.net/f3a887fe-6302-4bbd-bbbd-b711a44ea6d9/conversions/041eb4fe4a8b21b15cd89643d5872370-thumb-300.webp" alt="" style={{ m: 1, width: 130 }} />
            </div>
          </Col>
          <Col sm="12" md="12"> <label></label>
            <FormGroup className="d-flex justify-content-start mb-0">
              <div className="mr-1">
                <Button.Ripple color="primary" type="button" onClick={selectSecondWeight}> Submit </Button.Ripple> </div>
              <div className="mr-1">
              </div>
              <Button.Ripple outline color="primary" type="button"> Cancel</Button.Ripple>
            </FormGroup>
          </Col>
        </Row>
      </CardComponent>
    </Fragment >
  );
};

export default FGReturnWeightment;