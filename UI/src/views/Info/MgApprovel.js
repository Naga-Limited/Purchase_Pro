import { Card, CardHeader, CardBody, FormGroup, Col, Label, Input, Row, Button } from "reactstrap";
import React, { useEffect, useState } from "react";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { Check, Edit, X } from "react-feather";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "truckNo",
        sortable: true,
        minWidth: "120px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.subModuleTypeId == 11 || row.subModuleTypeId == 13 || row.subModuleTypeId == 17 ? 'Hand Carry' : row.truckNo}</span>
            </>
        },
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            Gate In
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const MgApprovel = ({ actionRendorer }) => {

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple className='ml-1' color="primary" size="sm" type="button" onClick={() => onActivate(row)}>Approve</Button.Ripple>
                </Row>
            );
        },
    };

    const [landingData, setLandingData] = useState([])
    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const [selectedData, setSelectedData] = useState([])

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onActivate = (row) => {
        console.log(row);
        setSelectedData(row)
        setShow(true)
    }

    const getLoadingData = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results.filter((item) => (item.moduleTypeId == 24 || item.moduleTypeId == 25 || item.moduleTypeId == 31) && (item.isApproved == 0)));
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

    const approveVehicleStatus = () => {
        const postData = {
            loadingUnloadingInfoId: selectedData.loadingAndUnloadingInfoId,
            userInfoId: UserDetails.USERID,
        };
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Weighment/approveVehicleStatus", postData)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    setShow(false);
                    setLandingData([])
                    getLoadingData()
                    ShowToast(res.message);
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    useEffect(() => {
        getLoadingData()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>MG Approvel</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Truck Details<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Type</Label>
                                <Input placeholder="Purpose" value={selectedData.moduleType} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input placeholder="Truck No" value={selectedData.subModuleTypeId == 11 || selectedData.subModuleTypeId == 13 || selectedData.subModuleTypeId == 17 ? 'Hand Carry' : selectedData.truckNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input placeholder="Plant Name" value={selectedData.werks + ' - ' + selectedData.plantName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Person Name</Label>
                                <Input placeholder="Person Name" value={selectedData.personName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Phone No</Label>
                                <Input placeholder="Phone No" value={selectedData.phoneNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12" >
                            <FormGroup className='d-flex justify-content-center'>
                                <Button color="primary" type="button" onClick={approveVehicleStatus}>
                                    <Check size={16} /> Approve
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MgApprovel;
