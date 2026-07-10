import React from 'react'
import { BASE_URL, apiBaseUrl } from '../urlConstants';
import { Button, Card, CardBody, Col, FormGroup, Row } from 'reactstrap';
import { useEffect } from 'react';
import { errorToast } from '../helper/appHelper';
import { apiPostMethod } from '../helper/axiosHelper';
import { useState } from 'react';
import { Printer } from 'react-feather';
import styled from "styled-components";
import { useParams } from "react-router";
import SmartFormHeader from './smartFormHeader';
import SmartFormFooter from './smartFormFooter';
import QRCode from 'react-qr-code';

const SmartForm = () => {

    const Container = styled.div`
    @media print {        
        display: none;        
    }`;

    const Container1 = styled.div`
    @media print {        
        margin-bottom: 300px;
    }`;

    const trstyle = { height: "40px" };
    const subheadingstyle1 = { textAlign: "center", fontSize: "18px" };
    const subheadingstyle2 = { textAlign: "left", fontSize: "18px" };

    let { gateInOutInfoId } = useParams();

    const [invoiceData, setInvoiceData] = useState([])

    const [data, setData] = useState([])
    const [imageData, setImageData] = useState([])

    const firstWeight = imageData.filter((item) => item.moduleStatusId == 2);
    const secondWeight = imageData.filter((item) => item.moduleStatusId == 3);

    console.log(imageData);

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data);
                    setData(data.results[0]);
                    setImageData(data.weighmentImages);
                    setInvoiceData(data.invoiceInfo)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const print = () => {
        window.print()
    }

    useEffect(() => {
        getGateInInfo()
        // print()
    }, [])

    return (
        <div>
            <Card>
                <CardBody>
                    <Container>
                        <Button style={{ float: "right" }} color="white" size="sm"><Printer size={16} onClick={print} color="blue" /></Button>
                    </Container>

                    <table style={{ width: "100%", border: "1px solid #000" }} border={0} >
                        <td>
                            <SmartFormHeader data = {data}/>
                            <table style={{ width: "100%" }} border={0} >
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>FG -SALES</strong></td></tr>
                                            <tr><td colSpan={6}><hr></hr></td></tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "20%" }}><strong>Vehicle Arrival No :</strong></td><td style={{ width: "15%" }}>{data.vaNumber}</td>
                                                <td style={{ width: "23%" }}><strong>Shipment Order No :</strong></td><td style={{ width: "15%" }}>{data.shipmentOrderNo}</td>
                                                <td><strong>Truck Type :</strong></td><td>{data.truckType}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "22%" }}><strong>Vehicle No :</strong></td><td >{data.vehicleNo}</td>
                                                <td><strong>Driver Phone No. :</strong></td><td>{data.driverMobileNumber}</td>
                                                <td><strong>Sub Type :</strong></td><td>Truck</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Transporter :</strong></td><td>-</td>
                                                <td><strong>TRIP Sheet No. :</strong></td><td>{data.tripSheetNumber}</td>
                                                <td><strong>Truck Capacity :</strong></td><td>{data.truckCapacity}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Color / Token :</strong></td><td>{data.colorToken}</td>
                                                <td><strong>Sending Plant :</strong></td><td>{data.plantName}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Sending GateIn Date & Time :</strong></td><td>{data.createdOn}</td>
                                                <td><strong>Sending GateOut Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                            </tr>


                                            {invoiceData.map(invoiceData => (
                                                <tr style={trstyle} key={invoiceData.deliveryNumber}>
                                                    <td><strong>Invoice No :</strong></td><td>{invoiceData.invoiceNumber}</td>
                                                    <td><strong>Delivery No :</strong></td><td>{invoiceData.deliveryNumber}</td>
                                                </tr>
                                            ))}
                                            {data.firstWeight ? <tr><td colSpan={6}><hr></hr></td></tr> : null}
                                        </table>
                                        </td>
                                    </tr>

                                    {data.firstWeight ?
                                        <tr>
                                            <td style={{ padding: "5px" }}>

                                                <table style={{ width: "100%" }} border={0}>
                                                    <tr style={trstyle}>
                                                        <td colSpan={6} style={subheadingstyle2}><u><strong>Sending Weighment Details :</strong></u></td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Empty Weight  :</strong></td><td style={{ width: "20%" }}>{data.bulkerEmptyWeight ? data.bulkerEmptyWeight : data.firstWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Load Weight :</strong></td><td style={{ width: "20%" }}>{data.secondWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Net Weight :</strong></td><td style={{ width: "20%" }}>{data.bulkerEmptyWeight ? data.secondWeight - data.bulkerEmptyWeight : data.netWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Delivery Weight :</strong></td><td style={{ width: "20%" }}>{data.overAllDeliveryQuantity}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Diff Weight :</strong></td><td style={{ width: "20%" }}>{Number(data.overAllDeliveryQuantity - (data.bulkerEmptyWeight ? data.secondWeight - data.bulkerEmptyWeight : data.netWeight)).toFixed(3)}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Empty weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "13%" }}><strong>Load weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr> : null
                                    }
                                    {/* {(data.barcodeImage != null && data.barcodeImage != '') &&
                                        <table>
                                        <Col md="12" sm="12" style={subheadingstyle2}><u><strong>QR Code :</strong></u></Col>
                                        <br></br>
                                                <Row>
                                                        <Col md="6" sm="6" >
                                                            <img className="ml-2" style={{ width: "200px", height: "100px" }} 
                                                            // src={data.barcodeImage} 
                                                            src={`http://localhost:3000/${data.barcodeImage}`}
                                                            hidden
                                                            />
                                                        </Col>
                                                </Row>
                                        </table>
                                    }  */}
                                    {((data.barcodeImage == null || data.barcodeImage == '') && data.vehicleNo) &&
                                      <FormGroup>
                                      <div id="qrCode">
                                          <QRCode 
                                          value={data.vehicleNo}
                                          size={100}
                                          level="H"
                                          includeMargin={true}
                                          hidden
                                          />
                                      </div>
                                      </FormGroup>  
                                    }
                                    <SmartFormFooter />
                                </tbody>
                            </table>
                        </td>
                    </table>
                </CardBody>
            </Card>

            <Container1></Container1>

            {imageData[0]?.weighmentImagesId != null ?
                <Card>
                    <CardBody>
                        <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000" }} border={0} >
                            <br></br> <br></br>
                            <Col md="12" sm="12" style={subheadingstyle2}><u><strong>First Weight :</strong></u></Col>
                            <br></br> <br></br>
                            <Row>
                                {firstWeight.map(firstWeight => (
                                    <Col md="6" sm="6" key={firstWeight.weighmentImagesId}>
                                        <img className="ml-4" style={{ width: "350px", height: "auto" }} src={firstWeight.imageUrl} />
                                    </Col>
                                ))}
                            </Row>


                            <br></br> <br></br>
                            <Col md="12" sm="12" style={subheadingstyle2}><u><strong>Second Weight :</strong></u></Col>
                            <br></br> <br></br>

                            <Row>
                                {secondWeight.map(secondWeight => (
                                    <Col md="6" sm="6" key={secondWeight.weighmentImagesId}>
                                        <img className="ml-4" style={{ width: "350px", height: "auto" }} src={secondWeight.imageUrl} />
                                    </Col>
                                ))}
                            </Row>
                        </table>
                    </CardBody >
                </Card > : null
            }

        </div >
    );

}

export default SmartForm