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
import { apiBaseUrl, BASE_URL } from '../../urlConstants';
import SmartFormFooter from '../smartFormFooter';
import SmartFormHeader from '../smartFormHeader';
import QRCode from 'react-qr-code';

const VehicleRequestPrint = () => {

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

    let { LoadUnloadID } = useParams();
    if(LoadUnloadID){
        LoadUnloadID = LoadUnloadID.replace(":", "");
    }
    const [invoiceData, setInvoiceData] = useState([])

    const [data, setData] = useState([])
    const [Address, setAddress] = useState([])

    const [imageData, setImageData] = useState([])

    const firstWeight = imageData.filter((item) => item.moduleStatusId == 2);
    const secondWeight = imageData.filter((item) => item.moduleStatusId == 3);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Master/LoadUnloadInfoDetailsById/${LoadUnloadID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/LoadUnloadInfoDetailsById/${LoadUnloadID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    setAddress(data.address[0]);
                    // print()
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])

  
    const print = () => {
        window.print()
        // window.open()

    }

    useEffect(() => {
        if(LoadUnloadID){
        getGateInInfo()
        }
        // print()
    }, [LoadUnloadID])

    return (
        <div>
            <Card>
                <CardBody>
                    <Container>
                        <Button style={{ float: "right" }} color="white" size="sm"><Printer size={16} onClick={print} color="blue" /></Button>
                    </Container>

                    <table style={{ width: "100%", fontSize: "12px", border: "1px solid #000" }} border={0} >
                        <td>
                            <SmartFormHeader data={Address} />
                            <table style={{ width: "100%", fontSize: "12px" }} border={0} >
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>{'Vehicle Request (' + data.moduleType + ')'}</strong></td></tr>
                                            <tr><td colSpan={6}><hr></hr></td></tr>

                                            <tr style={trstyle}>
                                                <td><strong>movementType :</strong></td><td>{data.movementType}</td>
                                                <td style={{ width: "20%" }}><strong>Sub Movement Type :</strong></td><td style={{ width: "15%" }}>{data.subModuleType ? data.subModuleType : 'Vehicle'}</td>
                                                <td style={{ width: "22%" }}><strong>Vehicle No :</strong></td><td >{data.truckNo}</td>
                                            </tr>

                                           

                                                <tr style={trstyle}>
                                                    <td><strong>Name & Phone No. :</strong></td><td>{data.personName && data.phoneNo ? data.personName + ' - ' + data.phoneNo : data.personName ? data.personName : data.phoneNo}</td>
                                                    <td><strong>Plant :</strong></td><td>{data.plantName}</td>
                                                    <td><strong>Vehicle Request Date :</strong></td><td>{data.createdOn}</td>
                                                </tr>
                                        </table>
                                        </td>
                                    </tr>
                                    <td style={{ padding: "5px" }}>
                                        <table style={{ width: "100%" }} border={0}>
                                            <tr><td colSpan={6}><hr></hr></td></tr>
                                            <br></br>
                                            <tr style={{ height: "40px" }}>
                                                <td style={{ width: "70%" }}><strong>Supervisor sign</strong></td>
                                                {data.truckNo &&
                                                <td style={{ width: "30%" }}>
                                                <FormGroup>
                                                <div id="qrCode">
                                                    <QRCode 
                                                    value={data.truckNo}
                                                    size={100}
                                                    level="H"
                                                    includeMargin={true}
                                                    />
                                                </div>
                                                </FormGroup>
                                                </td>}
                                            </tr>
                                        </table>
                                    </td>
                                </tbody>
                            </table>
                        </td>
                    </table>
                </CardBody>
            </Card>

            <Container1></Container1>

           

        </div >
    );

}

export default VehicleRequestPrint