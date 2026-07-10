import React from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { useEffect } from 'react';
import { useState } from 'react';
import { Printer } from 'react-feather';
import styled from "styled-components";
import { useParams } from "react-router";
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import { errorToast } from '../../helper/appHelper';
import SmartFormHeader from '../smartFormHeader';
import SmartFormFooter from '../smartFormFooter';
import { useSelector } from "react-redux";

const PurchaseSmartForm = () => {

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

    const [data, setData] = useState([])
    const [imageData, setImageData] = useState([])
    const [poData, setPoData] = useState([])

    const firstWeight = imageData.filter((item) => item.moduleStatusId == 2);
    const secondWeight = imageData.filter((item) => item.moduleStatusId == 3);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data);
                    setData(data.results[0]);
                    console.log(data.results[0]);
                    setImageData(data.weighmentImages);
                    setInvoiceData(data.invoiceInfo)
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
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

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    console.log(data);

    return (
        <div>
            <Card>
                <CardBody>
                    <Container>
                        <Button style={{ float: "right" }} color="white" size="sm"><Printer size={16} onClick={print} color="blue" /></Button>
                    </Container>

                    <table style={{ width: "100%", fontSize: "12px", border: "1px solid #000" }} border={0} >
                        <td>
                            <SmartFormHeader data={data} />
                            <table style={{ width: "100%", fontSize: "12px" }} border={0} >
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>Purchase</strong></td></tr>
                                            <tr><td colSpan={6}><hr></hr></td></tr>

                                            <tr style={trstyle}>
                                                <td style={{ width: "20%" }}><strong>Vehicle Arrival No :</strong></td><td style={{ width: "15%" }}>{data.vaNumber}</td>
                                                <td style={{ width: "23%" }}><strong>Vehicle No :</strong></td><td style={{ width: "15%" }}>{data.vehicleNo}</td>
                                                <td><strong>Driver Phone No :</strong></td><td>{data.driverMobileNumber}</td>
                                            </tr>
                                            {data.moduleTypeId != 16 ?
                                                <tr style={trstyle}>
                                                    <td><strong>Rec Plant :</strong></td><td>{data.plantName}</td>
                                                    <td><strong>Migo No :</strong></td><td>{data.migoNumber}</td>
                                                    <td><strong>Migo Qty :</strong></td><td>{data.migoDate}</td>
                                                </tr> : null
                                            }

                                            {poData.map((poDetails) => (<>
                                                <tr style={trstyle}>
                                                    <td><strong>PO No :</strong></td><td>{poDetails?.poNumber}</td>
                                                    <td><strong>Vendor Name :</strong></td><td>{poDetails?.vendorName}</td>
                                                    <td><strong>Invoice No :</strong></td><td>{poDetails?.invoiceNo}</td>
                                                </tr>
                                            </>))}

                                            {data.isRedirect == 1 && data.redirectMasterPlantId == null ? <>

                                                <tr style={trstyle}>
                                                    <td><strong>From Plant :</strong></td><td>{data.fromPlant}</td>
                                                    <td><strong>Redirect Plant :</strong></td><td>{data.plantName}</td>
                                                </tr>

                                                <tr style={trstyle}>
                                                    <td><strong>Sending GateIn Date & Time :</strong></td><td>{data.fromPlantGateInDateStamp}</td>
                                                    <td><strong>Sending GateOut Date & Time :</strong></td><td>{data.fromPlantGateOutDateStamp}</td>
                                                </tr>

                                                <tr style={trstyle}>
                                                    <td><strong>Rec GateOut Date & Time  :</strong></td><td>{data.gateInDateStamp}</td>
                                                    <td><strong>Rec GateIn Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                                </tr>
                                            </> : null
                                            }

                                            {data.isRedirect == null || data.redirectMasterPlantId != null ? <>

                                                {data.redirectPlantName != null ?
                                                    <tr style={trstyle}>
                                                        <td><strong>From Plant :</strong></td><td>{data.plantName}</td>
                                                        <td><strong>Redirect Plant :</strong></td><td>{data.redirectPlantName}</td>
                                                    </tr> : null
                                                }
                                                <tr style={trstyle}>
                                                    <td><strong>GateIn Date & Time :</strong></td><td>{data.gateInDateStamp}</td>
                                                    <td><strong>GateOut Date & Time :</strong></td><td>{data.gateOutDateStamp}</td>
                                                </tr> </> : null
                                            }

                                            {invoiceData.map(invoiceData => (
                                                <tr style={trstyle} key={invoiceData.deliveryNumber}>
                                                    <td><strong>Delivery No :</strong></td><td>{invoiceData.deliveryNumber}</td>
                                                </tr>
                                            ))}

                                            {data.fromPlantFirstWeight || data.firstWeight ? <tr><td colSpan={6}><hr></hr></td></tr> : null}
                                        </table>
                                        </td>
                                    </tr>
                                    <table style={{ width: "100%" }}>
                                        <div className='row' style={{ padding: "18px" }}>
                                            {(data.weighmentInfoId > 0) && (data.isRedirect == null || data.redirectMasterPlantId != null) ?
                                                <table style={{ width: "60%" }}>
                                                    <tr style={trstyle}>
                                                        <td colSpan={6} style={subheadingstyle2}><u><strong>{data.isRedirect == 1 && data.redirectMasterPlantId == null ? 'Sending' : null} Weighment Details :</strong></u></td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "15%" }}><strong>Load Weight  :</strong></td><td style={{ width: "18%" }}>{data.firstWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Empty Weight :</strong></td><td>{data.secondWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Net Weight :</strong></td><td>{data.netWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td ><strong>Load weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Empty weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                    </tr>
                                                </table> : null
                                            }

                                            {data.isRedirect == 1 && data.redirectMasterPlantId == null ? <>
                                                <table style={{ width: "60%" }}>
                                                    <tr style={trstyle}>
                                                        <td colSpan={6} style={subheadingstyle2}><u><strong>Sending Weighment Details :</strong></u></td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td style={{ width: "15%" }}><strong>Load Weight  :</strong></td><td style={{ width: "18%" }}>{data.fromPlantFirstWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Empty Weight :</strong></td><td>{data.fromPlantSecondWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Net Weight :</strong></td><td>{data.fromPlantNetWeight}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td ><strong>Load weight Date & Time :</strong></td><td >{data.fromFirstWeightDateStamp}</td>
                                                    </tr>
                                                    <tr style={trstyle}>
                                                        <td><strong>Empty weight Date & Time :</strong></td><td >{data.fromSecondWeightDateStamp}</td>
                                                    </tr>
                                                </table>

                                                {data.firstWeight != null ?
                                                    <table style={{ width: "40%" }}>
                                                        <tr style={trstyle}>
                                                            <td colSpan={6} style={subheadingstyle2}><u><strong>Receiving Weighment Details :</strong></u></td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td style={{ width: "25%" }}><strong>Load Weight  :</strong></td><td style={{ width: "18%" }}>{data.firstWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td><strong>Empty Weight :</strong></td><td>{data.secondWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td><strong>Net Weight :</strong></td><td>{data.netWeight}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td ><strong>Load weight Date & Time :</strong></td><td >{data.firstWeightDateStamp}</td>
                                                        </tr>
                                                        <tr style={trstyle}>
                                                            <td><strong>Empty weight Date & Time :</strong></td><td >{data.secondWeightDateStamp}</td>
                                                        </tr>
                                                    </table> : null
                                                } </> : null
                                            }
                                        </div>
                                    </table>
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

export default PurchaseSmartForm