import React from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { useEffect } from 'react';
import { useState } from 'react';
import { Printer } from 'react-feather';
import QRCode from 'react-qr-code';
import styled from "styled-components";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import SmartFormFooter from '../smartFormFooter';
import SmartFormHeader from '../smartFormHeader';
import SmartFormHeaderRake from '../smartFormHeaderRake';


const RakeDeliverySmartForm = () => {

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
    const addresses = { width: '100%' , marginTop: "18px" ,display : 'flex',marginLeft:'15px' };
    const address = { width: '50%'};
    const items = {width: '95%',marginTop:'20px',marginLeft:'15px'};
    const itemsth = {border: '1px solid #000',padding:'10px',textAlign:'left'};
    const itemstd = {border: '1px solid #000',padding:'10px',textAlign:'left'};

 
    let { RR_ID } = useParams();

    const [invoiceData, setInvoiceData] = useState([])

    const [data, setData] = useState([])
    const [Address, setAddress] = useState([])
    const [MobileNo, setMobileNo] = useState('')

    const [qrValue, setQrValue] = useState('');

    const [imageData, setImageData] = useState([])

    const firstWeight = imageData.filter((item) => item.moduleStatusId == 2);
    const secondWeight = imageData.filter((item) => item.moduleStatusId == 3);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        apiPostMethod(apiBaseUrl + `RakeloadingController/DeliveryChallanPrintFormRake/${RR_ID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    setAddress(data.AddressDetails[0]);
                    setQrValue(data.results[0]?.vehicle_no);
                    // setMobileNo(data.MobileNo)
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
                        <Button style={{ float: "right" }} color="white" size="sm">
                             <Printer size={16} onClick={print} color="blue" />
                        </Button>
                    </Container>

                       <table style={{ width: "100%", fontSize: "14px", border: "1px solid #000" }} border={0} >
                       <td>
                        {/* <SmartFormHeader data={Address} /> */}
                        <SmartFormHeaderRake data={Address} />

                        <hr></hr>
                            <table style={{ width: "100%", fontSize: "12px" }} border={0} >
                                <tbody>
                                        <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>DELIVERY CHALLAN</strong></td></tr>
                                <tr><td colSpan={6}><hr></hr></td></tr>
                              
                                    <table class="details" style={{width : '90%'}}>
                                    <tr style={{ textAlign : 'end'}}>
                                        {/* <td ><strong>Delivery Challan No:</strong> DC123456</td>  */}
                                        <td ><strong>Delivery Challan No : </strong>{data?.rr_id}</td>
                                    </tr><br></br>
                                    <tr style={{ textAlign : 'end'}}>
                                        <td style={{ paddingRight : '37px'}}><strong>Delivery Challan Date : </strong>{data?.created_at}</td>
                                    </tr>
                                    </table>
                                    <hr></hr>

                                        <div style={addresses}>
                                            <div style={address}>
                                                <h6><u><strong>FROM</strong></u></h6>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Name :</strong></td><td style={{ width: "50%" }}>{data?.companyName1}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Address 1 :</strong></td><td style={{ width: "50%" }}>{data?.address1}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Address 2 :</strong></td><td style={{ width: "50%" }}>{data?.city},{data?.state}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Pin Code :</strong></td><td style={{ width: "50%" }}>{data?.pinCode}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Gst No :</strong></td><td style={{ width: "50%" }}>{data?.gstInNumber}</td>
                                                </tr>
                                            </div>
                                            <div style={address}>
                                            <h6><u><strong>TO</strong></u></h6>
                                            <tr>
                                                    <td style={{ width: "30%" }}><strong>Name :</strong></td><td style={{ width: "50%" }}>{Address?.companyName1}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Address 1 :</strong></td><td style={{ width: "50%" }}>{Address?.address1}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Address 2 :</strong></td><td style={{ width: "50%" }}>{Address?.city},{Address?.state}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Pin Code :</strong></td><td style={{ width: "50%" }}>{Address?.pinCode}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Gst No :</strong></td><td style={{ width: "50%" }}>{Address?.gstInNumber}</td>
                                                </tr>
                                            </div>
                                        </div>
                                        <hr></hr>
                                        <table style={items}>
                                            <thead>
                                                <tr>
                                                    <th style={itemsth}>HSN code</th>
                                                    <th style={itemsth}>Description of Goods</th>
                                                    <th style={itemsth}>No.of Bags</th>
                                                    <th style={itemsth}>Quantity</th>
                                                    <th style={itemsth}>Rate</th>
                                                    <th style={itemsth}>Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={itemstd}>10019910</td>
                                                    <td style={itemstd}>Wheat</td>
                                                    <td style={itemstd}>{data.total_bags}</td>
                                                    <td style={itemstd}>{data.total_qty}</td>
                                                    <td style={itemstd}>{(data?.total_amount/data?.total_qty).toFixed(2)}</td>
                                                    <td style={itemstd}>{data?.total_amount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <hr></hr>
                                        <div style={{ width: '96%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft:'15px' }}>
                                                {/* <div style={{ fontWeight: 600, marginBottom: '10px' }}>QR Code</div> */}
                                                <QRCode value={qrValue} size={80} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div><strong>For Naga Limited</strong></div>
                                                <div style={{ marginTop: '50px' }}><strong>Authorised Signatory</strong></div>
                                            </div>
                                        </div>
                                        <hr></hr>
                                        <div style={addresses}>
                                            <div style={address}>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>E-WAY NO :</strong></td><td style={{ width: "50%" }}>{data?.eway_no}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Truck No :</strong></td><td style={{ width: "50%" }}>{data?.vehicle_no}</td>
                                                </tr>
                                               
                                            </div>
                                            <div style={address}>
                                            <tr>
                                                    <td style={{ width: "30%" }}><strong>Mobile :</strong></td><td style={{ width: "50%" }}>{data?.mmPhoneNo2}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: "30%" }}><strong>Web :</strong></td><td style={{ width: "50%" }}>{' www.Nagamills.com'}</td>
                                                </tr> 
                                            </div>
                                        </div>
                                </tbody>
                            </table>
                            <br />
                        </td>
                    </table>
                </CardBody>
            </Card>

            <Container1></Container1>

            {imageData[0]?.weighmentImagesId != null ?
                <Card>
                    <CardBody>
                        {/* <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000" }} border={0} >
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
                        </table> */}
                    </CardBody >
                </Card > : null
            }

        </div >
    );

}

export default RakeDeliverySmartForm