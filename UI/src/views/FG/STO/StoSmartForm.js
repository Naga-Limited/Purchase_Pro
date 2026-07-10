import React from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { useEffect } from 'react';
import { useState } from 'react';
import { Printer } from 'react-feather';
import styled from "styled-components";
import { useParams } from "react-router";
import { apiBaseUrl } from '../../../urlConstants';
import { apiPostMethod } from '../../../helper/axiosHelper';
import { errorToast } from '../../../helper/appHelper';
import SmartFormHeader from '../../smartFormHeader';
import SmartFormFooter from '../../smartFormFooter';
import { useSelector } from "react-redux";

const StoSmartForm = () => {

    const Container = styled.div`
    @media print {        
        display: none;        
    }`;

    const Container1 = styled.div`
    @media print {        
        margin-bottom: 300px;
    }`;

    const trstyle = { height: "35px" };
    const subheadingstyle1 = { textAlign: "center", fontSize: "18px" };
    const subheadingstyle2 = { textAlign: "left", fontSize: "18px" };

    let { gateInOutInfoId } = useParams();

    const [invoiceData, setInvoiceData] = useState([])

    console.log(invoiceData);

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
                    getLoadingWeighmentInfo(data.results[0].fromGateInOutInfoId)
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

    const [loadingWeighmentData, setLoadingWeighmentData] = useState([])
    const [loadingOverAllWeight, setloadingOverAllWeight] = useState([])

    const getLoadingWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLoadingWeighmentData(data.data)
                    console.log(data.data)
                    let lastItem = data.data.slice(-1)[0]
                    setloadingOverAllWeight(lastItem)
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

                    <table style={{ width: "100%",  border: "1px solid #000" }} border={0} >
                        <td>
                            <SmartFormHeader data={data} />
                            <table style={{ width: "100%"}} border={0} >
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>FG -STO</strong></td></tr>
                                            <tr><td colSpan={6}><hr></hr></td></tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "20%" }}><strong>Vehicle Arrival No :</strong></td><td style={{ width: "15%" }}>{data.vaNumber}</td>
                                                <td style={{ width: "23%" }}><strong>PO No :</strong></td><td style={{ width: "15%" }}>{data.stoPoNo}</td>
                                                <td><strong>Vehicle No :</strong></td><td>{data.vehicleNo}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "22%" }}><strong>Driver Phone No :</strong></td><td >{data.driverMobileNumber}</td>
                                                <td><strong>TRIP Sheet No :</strong></td><td>{data.tripSheetNumber}</td>
                                                {data.colorToken != null ? <><td><strong>Color / Token :</strong></td><td>{data.colorToken}</td></> : null}
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Sending Plant :</strong></td><td>{data.werks}</td>
                                                <td><strong>Truck Capacity :</strong></td><td>{data.truckCapacity}</td>
                                                <td><strong>Rec Plant:</strong></td><td>{data.plantName}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Migo No :</strong></td><td>{data.migoNumber}</td>
                                                <td><strong>Migo Date:</strong></td><td>{data.migoDate}</td>
                                                <td><strong>Migo Qty :</strong></td><td>{Number(data.overAllDeliveryQuantity).toFixed(2)}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Truck Type :</strong></td><td>{data.truckType}</td>
                                                <td><strong>Vehicle Type :</strong></td><td>{data.vehicleType}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Sending GateIn Date & Time :</strong></td><td>{data.gateInDateStamp}</td>
                                                <td><strong>Sending GateOut Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                            </tr>

                                            <tr style={trstyle}>
                                                <td><strong>Rec GateOut Date & Time  :</strong></td><td></td>
                                                <td><strong>Rec GateIn Date & Time :</strong></td><td></td>
                                            </tr>

                                            {invoiceData.map(invoiceData => (
                                                <tr style={trstyle} key={invoiceData.deliveryNumber}>
                                                    <td><strong>Delivery No {invoiceData.sno} :</strong></td><td>{invoiceData.deliveryNumber}</td>
                                                </tr>
                                            ))}

                                            {data.fromPlantFirstWeight || data.firstWeight ? <tr><td colSpan={6}><hr></hr></td></tr> : null}
                                        </table>
                                        </td>
                                    </tr>

                                    {data?.weighmentInfoId > 0 ? <>
                                        <table style={{ width: "100%" }}>
                                            <div className='row' style={{ padding: "18px" }}>
                                                {data.movementTypeId == 1 ?
                                                    <table style={{ width: "55%" }}>
                                                        <tr style={trstyle}>
                                                            <td colSpan={6} style={subheadingstyle2}><u><strong>Weighment Details :</strong></u></td>
                                                        </tr>
                                                        <br />
                                                        <tr>
                                                            <td><strong><u>Document No</u></strong></td>
                                                            <td><strong><u>First Weight</u></strong></td>
                                                            <td><strong><u>Second Weight</u></strong></td>
                                                            <td><strong><u>Net Weight</u></strong></td>
                                                            <td><strong><u>Date & Time</u></strong></td>
                                                        </tr>

                                                        {weighmentData.map((weighmentData) => (<>
                                                            <tr style={trstyle}>
                                                                <td >{weighmentData.documentNumber}</td>
                                                                <td >{weighmentData.firstWeight}</td>
                                                                <td >{weighmentData.secondWeight}</td>
                                                                <td >{weighmentData.netWeight}</td>
                                                                <td >{weighmentData.secondWeightDateStamp ? weighmentData.secondWeightDateStamp : weighmentData.firstWeightDateStamp}</td>
                                                            </tr>
                                                        </>))}

                                                    </table> : null
                                                }

                                                {data.movementTypeId == 2 ? <>

                                                    {data?.fromPlantFirstWeight != null ? <>
                                                        <table style={{ width: "70%" }}>
                                                            <tr style={trstyle}>
                                                                <td colSpan={6} style={subheadingstyle2}><u><strong>Sending Weighment Details :</strong></u></td>
                                                            </tr>
                                                            <br />
                                                            <tr>
                                                                <td><strong><u>Document No</u></strong></td>
                                                                <td><strong><u>First Weight</u></strong></td>
                                                                <td><strong><u>Second Weight</u></strong></td>
                                                                <td><strong><u>Net Weight</u></strong></td>
                                                                <td><strong><u>Date & Time</u></strong></td>
                                                            </tr>

                                                            {loadingWeighmentData.map((weighmentData) => (<>
                                                                <tr style={trstyle}>
                                                                    <td >{weighmentData.documentNumber}</td>
                                                                    <td >{weighmentData.firstWeight}</td>
                                                                    <td >{weighmentData.secondWeight}</td>
                                                                    <td >{weighmentData.netWeight}</td>
                                                                    <td >{weighmentData.secondWeightDateStamp ? weighmentData.secondWeightDateStamp : weighmentData.firstWeightDateStamp}</td>
                                                                </tr>                                                               
                                                            </>))}
                                                            <br/>

                                                        </table> </> : null
                                                    }                                                 

                                                    <table style={{ width: "70%" }}>
                                                        <tr style={trstyle}>
                                                            <td colSpan={6} style={subheadingstyle2}><u><strong>Receiving Weighment Details :</strong></u></td>
                                                        </tr>
                                                        <br />
                                                        <tr>
                                                            <td><strong><u>Document No</u></strong></td>
                                                            <td><strong><u>First Weight</u></strong></td>
                                                            <td><strong><u>Second Weight</u></strong></td>
                                                            <td><strong><u>Net Weight</u></strong></td>
                                                            <td><strong><u>Date & Time</u></strong></td>
                                                        </tr>

                                                        {weighmentData.map((weighmentData) => (<>
                                                            <tr style={trstyle}>
                                                                <td >{weighmentData.documentNumber}</td>
                                                                <td >{weighmentData.firstWeight}</td>
                                                                <td >{weighmentData.secondWeight}</td>
                                                                <td >{weighmentData.netWeight}</td>
                                                                <td >{weighmentData.secondWeightDateStamp ? weighmentData.secondWeightDateStamp : weighmentData.firstWeightDateStamp}</td>
                                                            </tr>
                                                        </>))}

                                                    </table> </> : null
                                                }
                                            </div>

                                            {(data.movementTypeId == 1) ?
                                                <table style={{ width: "100%" }}>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "22%" }}><strong>Over All First Weight  :</strong></td><td style={{ width: "10%" }}>{data.firstWeight}</td>
                                                        <td style={{ width: "22%" }}><strong>Over All Second Weight  :</strong></td><td style={{ width: "10%" }}>{overAllWeight.secondWeight}</td>
                                                        <td style={{ width: "22%" }}><strong>Over All Net Weight  :</strong></td><td style={{ width: "10%" }}>{Number(overAllWeight.secondWeight - data?.firstWeight)}</td>
                                                    </tr>
                                                </table> : null
                                            }

                                            {data.movementTypeId == 2 ? <>
                                                {data?.fromPlantFirstWeight != null ?
                                                    <table style={{ width: "100%" }}>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "20%" }}><strong>Sending Over All First Weight  :</strong></td><td style={{ width: "10%" }}>{data.fromPlantFirstWeight}</td>
                                                            <td style={{ width: "20%" }}><strong>Sending Over All Second Weight  :</strong></td><td style={{ width: "10%" }}>{loadingOverAllWeight.secondWeight}</td>
                                                            <td style={{ width: "20%" }}><strong>Sending Over All Net Weight  :</strong></td><td style={{ width: "10%" }}>{Number(loadingOverAllWeight.secondWeight - data?.fromPlantFirstWeight)}</td>
                                                        </tr>
                                                    </table> : null
                                                }

                                                <table style={{ width: "100%" }}>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "22%" }}><strong>Receiving Over All First Weight  :</strong></td><td style={{ width: "10%" }}>{data.firstWeight}</td>
                                                        <td style={{ width: "23%" }}><strong>Receiving Over All Second Weight  :</strong></td><td style={{ width: "10%" }}>{overAllWeight.secondWeight}</td>
                                                        <td style={{ width: "22%" }}><strong>Receiving Over All Net Weight  :</strong></td><td style={{ width: "10%" }}>{Number(data?.firstWeight - overAllWeight.secondWeight)}</td>
                                                    </tr>
                                                </table> </> : null
                                            }

                                        </table> </> :
                                        <>
                                            <table style={{ width: "100%" }}>
                                                <div className='row' style={{ padding: "18px" }}>
                                                    {data.fromPlantFirstWeight || data.firstWeight ?
                                                        <table style={{ width: "60%" }}>
                                                            <tr style={trstyle}>
                                                                <td colSpan={6} style={subheadingstyle2}><u><strong>Sending Weighment Details :</strong></u></td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td style={{ width: "15%" }}><strong>First Weight  :</strong></td><td style={{ width: "18%" }}>{data.fromPlantFirstWeight ? data.fromPlantFirstWeight : data.firstWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Second Weight :</strong></td><td>{data.fromPlantSecondWeight ? data.fromPlantSecondWeight : data.secondWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Net Weight :</strong></td><td>{data.fromPlantNetWeight ? data.fromPlantNetWeight : data.netWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td ><strong>Empty weight Date & Time :</strong></td><td >{data.fromFirstWeightDateStamp != null ? data.fromFirstWeightDateStamp : data.firstWeightDateStamp}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Load weight Date & Time :</strong></td><td >{data.fromSecondWeightDateStamp != null ? data.fromSecondWeightDateStamp : data.secondWeightDateStamp}</td>
                                                            </tr>
                                                        </table> : null
                                                    }

                                                    {data.secondWeight != null && data.fromPlantFirstWeight != "" ?
                                                        <table style={{ width: "40%" }}>
                                                            <tr style={trstyle}>
                                                                <td colSpan={6} style={subheadingstyle2}><u><strong>Receiving Weighment Details :</strong></u></td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td style={{ width: "25%" }}><strong>First Weight  :</strong></td><td style={{ width: "18%" }}>{data.firstWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Second Weight :</strong></td><td>{data.secondWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Net Weight :</strong></td><td>{data.netWeight}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td ><strong>Empty weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                            </tr>
                                                            <tr style={trstyle}>
                                                                <td><strong>Load weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                            </tr>
                                                        </table> : null
                                                    }
                                                </div>
                                            </table>
                                        </>
                                    }


                                    {/* <table style={{ width: "100%" }}>
                                        <div className='row' style={{ padding: "18px" }}>
                                            {data.fromPlantFirstWeight || data.firstWeight ?
                                                <table style={{ width: "60%" }}>
                                                    <tr style={trstyle}>
                                                        <td colSpan={6} style={subheadingstyle2}><u><strong>Sending Weighment Details :</strong></u></td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "15%" }}><strong>Empty Weight  :</strong></td><td style={{ width: "18%" }}>{data.fromPlantFirstWeight ? data.fromPlantFirstWeight : data.firstWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Load Weight :</strong></td><td>{data.fromPlantSecondWeight ? data.fromPlantSecondWeight : data.secondWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Net Weight :</strong></td><td>{data.fromPlantNetWeight ? data.fromPlantNetWeight : data.netWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td ><strong>Empty weight Date & Time :</strong></td><td >{data.fromFirstWeightDateStamp != null ? data.fromFirstWeightDateStamp : data.firstWeightDateStamp}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Load weight Date & Time :</strong></td><td >{data.fromSecondWeightDateStamp != null ? data.fromSecondWeightDateStamp : data.secondWeightDateStamp}</td>
                                                    </tr>
                                                </table> : null
                                            }

                                            {data.secondWeight != null && data.fromPlantFirstWeight != "" ?
                                                <table style={{ width: "40%" }}>
                                                    <tr style={trstyle}>
                                                        <td colSpan={6} style={subheadingstyle2}><u><strong>Receiving Weighment Details :</strong></u></td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "25%" }}><strong>Empty Weight  :</strong></td><td style={{ width: "18%" }}>{data.firstWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Load Weight :</strong></td><td>{data.secondWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Net Weight :</strong></td><td>{data.netWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td ><strong>Empty weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Load weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                    </tr>
                                                </table> : null
                                            }
                                        </div>
                                    </table> */}
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
                                </tbody>
                                <SmartFormFooter />
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

export default StoSmartForm