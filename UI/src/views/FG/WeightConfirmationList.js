import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, X } from "react-feather";
import { Modal } from "react-bootstrap";

export const taColumns = [
    {
        name: "VEHICLE NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.plantName + ' - ' + row.werks}</span>
            </>
        },
    },
    {
        name: "STATUS",
        selector: "statusName",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.statusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];


const WeightConformationList = ({ actionRendorer }) => {

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple className='ml-1' color="primary" size="sm" type="button" onClick={() => handleClick(row)}> Approve</Button.Ripple>
                </Row>
            );
        },
    };

    let { showLoader, hideLoader } = useLoader();
    const [landingData, setLandingData] = useState([])
    const [show, setShow] = useState(false);
    const [selectedData, setSelectedData] = useState([])
    const [weighmentData, setWeighmentData] = useState([])
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const handleClick = (row) => {
        setSelectedData(row)
        getTestWeighmentInfo(row.testWeighbridgeId)
        setShow(true)
    }

    const getTestWeighbridge = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighbridge/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results);
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

    const getTestWeighmentInfo = (testWeighbridgeId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/0/${testWeighbridgeId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getTestWeighmentInfo/0/${testWeighbridgeId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.results)
                    console.log(data.results);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const onSubmit = () => {
        showLoader();

        const postData = {
            testWeighbridgeId: selectedData.testWeighbridgeId,
            moduleStatusId: 14
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Weighment/updateTestWeighbridge", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setShow(false);
                    setLandingData([])
                    getTestWeighbridge()
                    ShowToast(data.message);
                } else if (data.success == false) {
                    errorToast(data.message);
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

    useEffect(() => {
        getTestWeighbridge()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Weight Conformation List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>

            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Weighment Confirmation </h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={() => setShow(false)} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Modal.Body>
                    <Row>

                        <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Vehicle No</Label>
                                <Input placeholder="VA Number" value={selectedData.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA Number</Label>
                                <Input placeholder="VA Number" value={selectedData.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input placeholder="VA Number" value={selectedData.plantName + ' - ' + selectedData.werks} disabled />
                            </FormGroup>
                        </Col>
                        {selectedData.remarks ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input placeholder="Remarks" value={selectedData.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {selectedData.testWeighmentInfoId > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Remarks</Label></Col>

                                {weighmentData.map((weighmentData) => (<>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Rwmarks" value={weighmentData?.remarks} disabled />
                                        </FormGroup>
                                    </Col>
                                </>))}

                            </> : null
                        }

                        <Col md="12" sm="12" >
                            <label>&nbsp;</label>
                            <FormGroup className='d-flex justify-content-center'>
                                <Button color="primary" type="button" onClick={onSubmit}>
                                    <Check size={16} /> Submit
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default WeightConformationList;
