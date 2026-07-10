import React from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
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

const TestWeighbridgeSmartForm = () => {

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
    const subheadingstyle3 = { textAlign: "left", fontSize: "15px" };

    let { testWeighbridgeId } = useParams();
    const [data, setData] = useState([])
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [weighmentData, setWeighmentData] = useState([])
    const [imageData, setImageData] = useState([])

    const firstWeight = imageData.filter((item) => item.moduleStatusId == 2);
    const secondWeight = imageData.filter((item) => item.moduleStatusId == 3);

    const getTestWeighbridge = () => {
        console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/0/${UserDetails.USERID}/${testWeighbridgeId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/0/${UserDetails.USERID}/${testWeighbridgeId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    getTestWeighmentInfo(data.results[0].testWeighbridgeId)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getTestWeighmentInfo = (testWeighbridgeId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/0/${testWeighbridgeId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/0/${testWeighbridgeId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.results);
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
        getTestWeighbridge()
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
                            <table style={{ width: "100%" }} border={0} >
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
                                            <tr style={trstyle}>
                                                <td><strong>Plant :</strong></td><td>{data.plantName}</td>
                                                <td><strong>Person Name :</strong></td><td>{data.personName}</td>                                                  
                                            </tr>                                                                                

                                            {data.firstWeight ? <tr><td colSpan={6}><hr></hr></td></tr> : null}
                                        </table>
                                        </td>
                                    </tr>                                   

                                    {weighmentData != '' ? <>

                                        <table style={{ width: "70%" }}>
                                            <tr style={trstyle}>
                                                <td colSpan={6} style={subheadingstyle2}><u><strong>Weighment Details :</strong></u></td>
                                            </tr>
                                            <br />
                                            <tr>
                                                <td><strong><u>First Weight</u></strong></td>
                                                <td><strong><u>First Weight Date & Time</u></strong></td>
                                                <td><strong><u>Second Weight</u></strong></td>
                                                <td><strong><u>Second Weight Date & Time</u></strong></td>
                                                <td><strong><u>Net Weight</u></strong></td>
                                                <td><strong><u>Remarks</u></strong></td>
                                            </tr>

                                            {weighmentData.map((weighmentData) => (<>
                                                <tr style={trstyle}>
                                                    <td>{weighmentData.firstWeight}</td>
                                                    <td>{weighmentData.firstWeightDateStamp}</td>
                                                    <td>{weighmentData.secondWeight}</td>
                                                    <td>{weighmentData.secondWeightDateStamp}</td>
                                                    <td>{weighmentData.netWeight}</td>
                                                    <td>{weighmentData.remarks}</td>
                                                </tr>
                                            </>))}
                                        </table> </> : null
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

export default TestWeighbridgeSmartForm