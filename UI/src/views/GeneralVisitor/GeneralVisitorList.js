import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input, Badge } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, Key, X } from "react-feather";
import { useFormik } from "formik";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VISITOR NAME",
        selector: "generalVisitors",
        sortable: false,
        minWidth: "250px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <br />
                    <FormGroup className="mb-0">
                        {
                            row.generalVisitors && row.generalVisitors.length > 0 ? (
                                row.generalVisitors.map((item, index) => (
                                    <Badge
                                        key={index}
                                        color="primary"
                                        className="mr-1 mb-1 p-1"
                                    >
                                        {item.visitorName}
                                    </Badge>
                                ))
                            ) : (
                                <p className="fs-6">-</p>
                            )
                        }
                    </FormGroup>
                </Col>
            );
        },
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "190px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-start mb-0">
                    <p className="fs-6">{row.plantName} - {row.werks} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "PURPOSE OF MEET",
        selector: "meetingType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PHONE NO",
        selector: "visitorPhoneNo",
        sortable: true,
        minWidth: "140px",
    },
    {
        name: "PERSON COUNT",
        selector: "noOfVisitors",
        sortable: true,
        minWidth: "160px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-center mb-0">
                    <p className="fs-6">{row.noOfVisitors} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "PERSON TO MEET",
        selector: "employeeName",
        sortable: true,
        minWidth: "170px",
    },
];

const GeneralVisitorList = ({ actionRendorer, data, setData, getGeneralVisitorInfo }) => {

    let { showLoader, hideLoader } = useLoader();

    const [show, setShow] = useState(false);

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>{row.moduleStatusId == 6 ? 'Gate In' : 'Gate Out'}</Button>
                </Row>
            );
        },
    };

    const [generalVisitorData, setGeneralVisitorData] = useState([])
    const [visitorsName, setVisitorsName] = useState('')

    const onActionClick = (row) => {
        setGeneralVisitorData(row)

        let visitorName = ''
        row.generalVisitors.forEach((item, index) => {
            visitorName += '( ' + item['visitorName'] + ' ) '
        })
        setVisitorsName(visitorName)

        if (row.moduleStatusId == 6) {
            GateIn(row.generalVisitorInfoId)
        } else {
            setShow(true)
        }
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateGeneralVisitorInfo = () => {

        const postdata = {
            generalVisitorInfoId: generalVisitorData.generalVisitorId,
            moduleStatusId: 5,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateGeneralVisitorInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateGeneralVisitorInfo", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    setShow(false)
                    getGeneralVisitorInfo()
                    setData([])
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const GateIn = (generalVisitorInfoId) => {

        const postdata = {
            generalVisitorInfoId: generalVisitorInfoId,
            moduleStatusId: 1,
            userInfoId: UserDetails.USERID
        };

        confirmDialog({
            title: `<h4>Are you sure want to Gate In?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                console.log(apiBaseUrl + "GatePro/Gate/updateGeneralVisitorInfo", postdata);
                apiPostMethod(apiBaseUrl + "GatePro/Gate/updateGeneralVisitorInfo", postdata)
                    .then((response) => {
                        const res = response.data;
                        if (res.success == true) {
                            ShowToast('Gate In Successfully');
                            getGeneralVisitorInfo()
                            setData([])
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
            }
        })
            .catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>General Visiter List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal show={show} centered size="lg">
                <Row>
                    <Col md="12" sm="12">
                        <FormGroup>
                            <ModalHeader><h5>General Visiter - Gate Out</h5><X onClick={() => setShow(false)} /></ModalHeader>
                        </FormGroup>
                    </Col>
                </Row>
                <ModalBody>
                    <Row>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <Label>Visitors Name</Label>
                                <Input type="text" placeholder="Visitor Phone No." value={visitorsName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="VA No" value={generalVisitorData.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Person to Meet </Label>
                                <Input type="text" placeholder="To Meet Person" value={generalVisitorData.employeeName} disabled />
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Purpose of Meet</Label>
                                <Input type="text" placeholder="Purpose of Meet" value={generalVisitorData.meetingType} disabled />
                            </FormGroup>
                        </Col>
                        {generalVisitorData.companyName ?
                            <Col sm="6" md="6">
                                <FormGroup>
                                    <Label>Company Name</Label>
                                    <Input type="text" placeholder="Company Name" value={generalVisitorData.companyName} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {generalVisitorData.address ?
                            <Col sm="6" md="6">
                                <FormGroup>
                                    <Label>Address</Label>
                                    <Input type="text" placeholder="Visitor Name" value={generalVisitorData.address} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {generalVisitorData.collegeName ?
                            <Col sm="6" md="6">
                                <FormGroup>
                                    <Label>College Name</Label>
                                    <Input type="text" placeholder="College Name" value={generalVisitorData.collegeName} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Visitor Phone No</Label>
                                <Input type="text" placeholder="Visitor Phone No." value={generalVisitorData.visitorPhoneNo} disabled />
                            </FormGroup>
                        </Col>

                        {generalVisitorData.idProof || generalVisitorData.imagePath ?
                            <Col sm="6" md="6" className='mt-2'>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>View :</b></Label>
                                    </div>
                                    {generalVisitorData.idProof ?
                                        <div className="mr-1">
                                            <a target="_blank" href={generalVisitorData.idProof}>
                                                <Button outline color="success" type="button">
                                                    ID Proof
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                    {generalVisitorData.imagePath ?
                                        <div className="mr-1">
                                            <a target="_blank" href={generalVisitorData.imagePath}>
                                                <Button outline color="success" type="button">
                                                    Visitor Image
                                                </Button>
                                            </a>
                                        </div> : null
                                    }
                                </FormGroup>
                            </Col> : null
                        }

                        <Col sm="12" md="12">
                            <FormGroup className="d-flex justify-content-center">
                                <Button.Ripple color="primary" type="button" onClick={updateGeneralVisitorInfo}>
                                    <Check size={16} /> Gate Out
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    );
};

export default GeneralVisitorList;

