import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input, Badge } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Delete, Edit, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Select from 'react-select'

export const taColumns = [

    {
        name: "PLANT ID",
        selector: "plant_id",
        sortable: true,
        minWidth: "90px",
    },
    {
        name: "Division",
        selector: "division",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TO MAIL",
        selector: "to_mail",
        sortable: true,
        minWidth: "560px",
    },
    {
        name: "CC MAIL",
        selector: "cc_mail",
        sortable: true,
        minWidth: "560px",
    },
    {
        name: "BCC MAIL",
        selector: "bcc_mail",
        sortable: true,
        minWidth: "560px",
    },
    {
        name: "Status",
        selector: "status",
        sortable: true,
        minWidth: "120px",
        cell: (row) => {
            return (
                    <FormGroup className="d-flex justify-content-center mb-0">
                        {row.status == 1 &&
                        <Badge color="success" pill>
                           Active
                        </Badge>}
                        {row.status == 0 &&
                        <Badge color="danger" pill>
                           Deactivate
                        </Badge>}
                    </FormGroup>
            );
        },
    },
];

const AutoMailDetailsList = ({ actionRendorer, getCameraDetails, allData }) => {

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "90px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateCameraDetails(row.to_mail, row.cc_mail, row.bcc_mail, row.plant_id, row.status,row.id,row.division)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    
                </Row>
            );
        },
    };

    const { showLoader, hideLoader } = useLoader('');
    const [data, setData] = useState();
    const [tomail, setToMail] = useState('');
    const [ccmail, setCCMail] = useState();
    const [bccmail, setBCCmail] = useState('');
    const [plantId, setPlantId] = useState('');
    const [status, setStatus] = useState('');
    const [ID, setID] = useState('');
    const [division, setDivision] = useState('');
    const [isActive, setisActive] = useState('');
    const [plant, setPlant] = useState('');
    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const [deleteCamera, setDeleteCamera] = useState(false);
    const closeCameraDetails = () => setDeleteCamera(false);

    const selectPlant = (e) => {
        console.log(e.ID);
        setPlant([e])
        const plantId = e.ID;

        console.log(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/${plantId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/${plantId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onSubmit = () => {
        showLoader();

        const postData = {
            to_mail: tomail,
            cc_mail: ccmail,
            bcc_mail: bccmail,
            plant_id: plantId,
            status: status,
            userInfoId: UserDetails.USERID,
            division:division,
            id:ID
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "AutoMailMaster/updateMailDetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setShow(false);
                    ShowToast(data.message);
                    setDeleteCamera(false)
                    getCameraDetails()
                } else if (data.success == 0) {
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

    const updateCameraDetails = (to_mail, cc_mail, bcc_mail, plant_id, status,id,division) => {
        setToMail(to_mail);
        setCCMail(cc_mail)
        setBCCmail(bcc_mail)
        setPlantId(plant_id)
        setStatus(status)
        setID(id)
        setDivision(division)
        setShow(true)
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            driverPhoneNo: ""
        }),
    });

    const columns = [...taColumns, actionsCol];   

    // const deleteCameraDetails = (cctvCameraId, masterPlantId, cameraName, url, username, password, isPrint, isActive) => {
    //     setisActive(isActive)
    //     setDeleteCamera(true)
    //     setcameraName(cameraName);
    //     setUrl(url)
    //     setUsername(username)
    //     setPassword(password)
    //     setIsPrint(isPrint)
    //     setcctvCameraId(cctvCameraId)
    //     setmasterPlantId(masterPlantId)
    // };


    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const statusValue = [
        { value: status, label: status == 1 ? 'Yes' : 'No' }
    ];

    return (
        <div>
            <Card>
                <CardHeader><h5>Auto Mail Details</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Modal show={show} centered size = 'lg'>
                        <Modal.Header>
                            <Row>
                                <Col md="12" sm="12">
                                    <FormGroup style={{ width: 460 }}>
                                        <Modal.Title>Update Mail Details <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>To Mail</Label>
                                        <Input placeholder="Url" type="textarea" value={tomail} onChange={(e) => setToMail(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>CC Mail</Label>
                                        <Input placeholder="Url" type="textarea" value={ccmail} onChange={(e) => setCCMail(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>BCC Mail</Label>
                                        <Input placeholder="Url" type="textarea" value={bccmail} onChange={(e) => setBCCmail(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>Plant ID</Label>
                                        <Input placeholder="Url" type="textarea" value={plantId} onChange={(e) => setPlantId(e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>Division</Label>
                                        <Input placeholder="Url" type="text" value={division} onChange={(e) => setDivision(e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="6" sm="6">
                                    <Label>Is Active</Label>
                                    <Select
                                        value={statusValue}
                                        options={options}
                                        onChange={(e) => setStatus(e.value)}
                                    />
                                </Col>

                                <Col md="2" sm="2" >
                                    <label>&nbsp;</label>
                                    <FormGroup>
                                        <Button color="primary" type="button" onClick={onSubmit}>
                                            Update
                                        </Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>

                    <Modal show={deleteCamera} centered size="sm">
                        <Modal.Body>
                            <Row>
                                <Col md="12" sm="12"><X onClick={closeCameraDetails} style={{ float: "right" }} /></Col>
                                {isActive == 1 ?
                                    <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>Are you sure you want to In Active</h5></Label></Col> :
                                    <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>Are you sure you want to Active</h5></Label></Col>
                                }

                                <Col md="4" sm="4"></Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        {isActive == 1 ?
                                            <Button.Ripple color="warning" type="button" onClick={onSubmit}>
                                                In Active
                                            </Button.Ripple> :
                                            <Button.Ripple color="success" type="button" onClick={onSubmit}>
                                                Active
                                            </Button.Ripple>
                                        }
                                    </FormGroup>

                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>

                    <TableComponent columns={columns} data={plant ? data : allData} />

                </CardBody>
            </Card>
        </div>
    );
};

export default AutoMailDetailsList;
