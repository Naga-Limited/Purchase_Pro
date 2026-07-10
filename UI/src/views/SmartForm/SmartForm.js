import React from 'react'
import { Button, Card, CardBody, Col, FormGroup, Row } from 'reactstrap';
import { useEffect } from 'react';
import { useState } from 'react';
import { Printer } from 'react-feather';
import styled from "styled-components";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import SmartFormFooter from '../smartFormFooter';
import SmartFormHeader from '../smartFormHeader';
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

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    for (let i = 0; i < data.invoiceInfo.length; i++) {
                        data.invoiceInfo[i].sno = i + 1;
                    }
                    setData(data.results[0]);
                    setImageData(data.weighmentImages);
                    setInvoiceData(data.invoiceInfo)
                    getWeighmentInfo(data.results[0].gateInOutInfoId)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])

    const getWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
                    console.log(data.data)
                    let lastItem = data.data.slice(-1)[0]
                    setOverAllWeight(lastItem)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
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
                            <SmartFormHeader data={data} />
                            <table style={{ width: "100%"}} border={0} >
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>{data.moduleType}</strong></td></tr>
                                            <tr><td colSpan={6}><hr></hr></td></tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "20%" }}><strong>Vehicle Arrival No :</strong></td><td style={{ width: "15%" }}>{data.vaNumber}</td>
                                                <td style={{ width: "22%" }}><strong>Vehicle No :</strong></td><td >{data.vehicleNo}</td>
                                                <td><strong>Driver Phone No. :</strong></td><td>{data.driverMobileNumber}</td>
                                            </tr>

                                            {data.moduleTypeId == 30 ? <>
                                                <tr style={trstyle}>
                                                    <td><strong>Plant :</strong></td><td>{data.plantName}</td>
                                                    <td><strong>Sample Material :</strong></td><td>{data.sampleMaterial}</td>
                                                    <td><strong>Quantity</strong></td><td>{data.quantity}</td>
                                                </tr>

                                                <tr style={trstyle}>
                                                    <td><strong>GateIn Date & Time :</strong></td><td>{data.createdOn}</td>
                                                    <td><strong>GateOut Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                                </tr> </> :

                                                <tr style={trstyle}>
                                                    <td><strong>Plant :</strong></td><td>{data.plantName}</td>
                                                    <td><strong>GateIn Date & Time :</strong></td><td>{data.createdOn}</td>
                                                    <td><strong>GateOut Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                                </tr>
                                            }

                                            {data.moduleTypeId == 26 ? <>
                                                {invoiceData.map(invoiceData => (
                                                    <tr style={trstyle} key={invoiceData.deliveryNumber}>
                                                        <td><strong>Delivery No {invoiceData.sno} :</strong></td><td>{invoiceData.deliveryNumber}</td>
                                                    </tr>
                                                ))} </> : null
                                            }

                                            {data.firstWeight ? <tr><td colSpan={6}><hr></hr></td></tr> : null}
                                        </table>
                                        </td>
                                    </tr>

                                    {data.weighmentInfoId > 0 ? <>


                                        {data.moduleTypeId == 30 || data.moduleTypeId == 26 || data.moduleTypeId == 24 || data.moduleTypeId == 31 || data.moduleTypeId == 37 ? <>

                                            <tr>
                                                <td style={{ padding: "5px" }}>

                                                    <table style={{ width: "100%" }} border={0}>
                                                        <tr style={trstyle}>
                                                            <td colSpan={6} style={subheadingstyle2}><u><strong>Weighment Details :</strong></u></td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "13%" }}><strong>Empty Weight  :</strong></td><td style={{ width: "20%" }}>{data.firstWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "13%" }}><strong>Load Weight :</strong></td><td style={{ width: "20%" }}>{data.secondWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "13%" }}><strong>Net Weight :</strong></td><td style={{ width: "20%" }}>{data.netWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "13%" }}><strong>Empty weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "13%" }}><strong>Load weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </> : <>


                                            <table style={{ width: "50%" }}>
                                                <tr style={trstyle}>
                                                    <td colSpan={6} style={subheadingstyle2}><u><strong>Weighment Details :</strong></u></td>
                                                </tr>
                                                <br />
                                                <tr>
                                                    {data.moduleTypeId == 29 ? <td><strong><u>Document No</u></strong></td> : null}
                                                    <td><strong><u>First Weight</u></strong></td>
                                                    <td><strong><u>Second Weight</u></strong></td>
                                                    <td><strong><u>Net Weight</u></strong></td>
                                                    <td><strong><u>Remarks</u></strong></td> 
                                                    <td><strong><u>First Wt Date & Time</u></strong></td>
                                                    <td><strong><u>Second Wt Date & Time</u></strong></td>
                                                </tr>

                                                {weighmentData.map((weighmentData) => (<>
                                                    <tr style={trstyle}>
                                                        {data.moduleTypeId == 29 ? <td>{weighmentData.documentNumber}</td> : null}
                                                        <td>{weighmentData.firstWeight}</td>
                                                        <td>{weighmentData.secondWeight}</td>
                                                        <td>{weighmentData.netWeight}</td>
                                                        <td>{weighmentData.remarks}</td>
                                                        <td >{weighmentData.firstWeightDateStamp}</td>
                                                        <td >{weighmentData.secondWeightDateStamp}</td>
                                                    </tr>
                                                </>))}

                                            </table>

                                            <table style={{ width: "100%" }}>
                                                <tr style={trstyle}>
                                                    <td style={{ width: "22%" }}><strong>Over All First Weight  :</strong></td><td style={{ width: "10%" }}>{data.firstWeight}</td>
                                                    <td style={{ width: "22%" }}><strong>Over All Second Weight  :</strong></td><td style={{ width: "10%" }}>{overAllWeight.secondWeight}</td>
                                                    <td style={{ width: "22%" }}><strong>Over All Net Weight  :</strong></td><td style={{ width: "10%" }}>{data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data.firstWeight - overAllWeight?.secondWeight)}</td>
                                                </tr>
                                            </table>
                                        </>}
                                    </> : null}
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
                                    } */}
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

                            <br></br><br></br>
                            <Col md="12" sm="12" style={subheadingstyle2}><u><strong>Second Weight :</strong></u></Col>
                            <br></br><br></br>

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