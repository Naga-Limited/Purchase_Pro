import React, { useState } from 'react'
import { ArrowLeft, Check, X } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiPostMethod } from '../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../helper/appHelper';
import { apiBaseUrl } from '../../urlConstants';
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useLoader } from '../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { Yup } from '../forms/custom-form';
import confirmDialog from '../../@core/components/confirm/confirmDialog';

const Weightment = ({ data, setData, setIsDisabled, setTruckValue }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const addFirstWeight = () => {

        const postdata = {
            weighmentInfoId: data.weighmentInfoId,
            gateInOutInfoId: data.gateInOutInfoId,
            firstWeight: data.firstWeight,
            secondWeightCheck: checkWeight,
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
                    updateVehicleStatus()
                    ShowToast(data.waitingAt == 9 ? 'Second Weight Check Successfully...' : res.message);
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

    const updateVehicleStatus = () => {

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 9,
            userInfoId: UserDetails.USERID,
            weighmentInfoId: data.weighmentInfoId,
            isFirstWeightApproved: 1
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    form.resetForm();
                    setIsDisabled(false)
                    setData("")
                    setTruckValue("")
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
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // firstWeight: validation.required({ message: "Please Connect to Scale", isObject: false })
        }),
        updateVehicleStatus() { },
    });

    const redirect = () => {
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
                var lastweight = 0;
                lastweight = lastvaluearr[2]
                console.log(lastweight,'value')
                if (lastvaluearr.length > 4) {
                    // lastweight = lastvaluearr[2];
                    setCheckWeight(lastweight)
                }
                // document.getElementById("txtWeight").value = lastweight;
                // console.log(tmparr[tmparr.length - 2]);


            //    setCheckWeight(lastweight)
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

    const [checkWeight, setCheckWeight] = useState("")

    const secondWeightCheck = (e) => {
        const newValue = parseInt(e.target.value, 10);
        setCheckWeight(newValue)
    };

    const checkWeightValue = () => {
        if (checkWeight == "") {
            confirmDialog({
                title: `<h5><strong class="text-white">Please Connect to Scale</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        }
        // else if (!isNaN(checkWeight) && checkWeight <= data.vehicleM     inWeight) {
        //     errorToast("Please Check Vehicle Weight");
        // } 
        else if (Number(data.firstWeight) >= Number(checkWeight)) {
            confirmDialog({
                title: `<h5><strong class="text-white">Second Weight Is Less Then First Weight</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        } else {
            addFirstWeight()
        }
    }

    return (
        <Card>
            <CardHeader><h5>Weighbridge Check</h5></CardHeader>
            <hr></hr>
            <CardBody>
                <Row>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>VA No</Label>

                            <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>Truck No</Label>
                            <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
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
                                       
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>First Weight</Label>
                            <Input type="text" placeholder="Enter First Weight" value={data.firstWeight} disabled />
                        </FormGroup>
                    </Col>
                    <Col md="3" sm="3">
                        <FormGroup>
                            <Label>Second Weight Check</Label>
                            <Input
                                type="number"
                                placeholder="Second Weight Check"
                                value={checkWeight}
                                // onChange={secondWeightCheck} 
                                disabled
                                />
                                
                        </FormGroup>
                    </Col>                    

                    <Col md="12" sm="12">
                        <br></br>
                        <FormGroup>
                            <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                                <ArrowLeft size={16} /> Back
                            </Button.Ripple>

                            <div style={{ float: 'right' }}>
                                <Button.Ripple className="ml-2" color="primary" type="button" onClick={checkWeightValue}>
                                    <Check size={16} /> Submit
                                </Button.Ripple>
                            </div>
                        </FormGroup>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default Weightment