import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
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
        name: "Camera Name",
        selector: "cameraName",
        sortable: true,
        minWidth: "90px",
    },
    {
        name: "URL",
        selector: "apiUrl",
        sortable: true,
        minWidth: "560px",
    },
];

const CameraDetailsList = ({ actionRendorer, getCameraDetails, allData }) => {

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "180px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateCameraDetails(row.cctvCameraId, row.masterPlantId, row.cameraName, row.apiUrl, row.username, row.password, row.isPrint)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    {row.isActive == 1 ? <Button.Ripple color="success" size="sm" type="button" onClick={() => deleteCameraDetails(row.cctvCameraId, row.masterPlantId, row.cameraName, row.apiUrl, row.username, row.password, row.isPrint, row.isActive)}> Active</Button.Ripple> :
                        <Button.Ripple color="warning" size="sm" type="button" onClick={() => deleteCameraDetails(row.cctvCameraId, row.masterPlantId, row.cameraName, row.apiUrl, row.username, row.password, row.isPrint, row.isActive)}> In Active</Button.Ripple>} &nbsp;
                </Row>
            );
        },
    };

    const { showLoader, hideLoader } = useLoader('');
    const [data, setData] = useState();
    const [cameraName, setcameraName] = useState('');
    const [url, setUrl] = useState();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cctvCameraId, setcctvCameraId] = useState('');
    const [masterPlantId, setmasterPlantId] = useState('');
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
            cctvCameraId: cctvCameraId,
            masterPlantId: masterPlantId,
            cameraName: cameraName,
            apiUrl: url,
            username: username,
            password: password,
            isActive: isActive == 1 ? 0 : 1,
            isPrint: isPrint,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateCameraDetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setShow(false);
                    ShowToast(data.message);
                    setDeleteCamera(false)
                    getCameraDetails()
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

    const updateCameraDetails = (cctvCameraId, masterPlantId, cameraName, url, username, password, isPrint) => {
        setcameraName(cameraName);
        setUrl(url)
        setUsername(username)
        setPassword(password)
        setcctvCameraId(cctvCameraId)
        setmasterPlantId(masterPlantId)
        setShow(true)
        setIsPrint(isPrint);
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            driverPhoneNo: ""
        }),
    });

    const columns = [...taColumns, actionsCol];   

    const deleteCameraDetails = (cctvCameraId, masterPlantId, cameraName, url, username, password, isPrint, isActive) => {
        setisActive(isActive)
        setDeleteCamera(true)
        setcameraName(cameraName);
        setUrl(url)
        setUsername(username)
        setPassword(password)
        setIsPrint(isPrint)
        setcctvCameraId(cctvCameraId)
        setmasterPlantId(masterPlantId)
    };

    const [isPrint, setIsPrint] = useState('')

    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const printValue = [
        { value: isPrint, label: isPrint == 1 ? 'Yes' : 'No' }
    ];

    return (
        <div>
            <Card>
                <CardHeader><h5>Camera Details</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Col md="4" sm="12">
                        <CustomDropdownInput
                            url={`${apiBaseUrl}marketdata/master/getPlants`}
                            label={"Plant"}
                            form={form}
                            onChange={selectPlant}
                            id="Plant"
                            value={plant}
                        />
                    </Col>

                    <Modal show={show} centered>
                        <Modal.Header>
                            <Row>
                                <Col md="12" sm="12">
                                    <FormGroup style={{ width: 460 }}>
                                        <Modal.Title>Update Camera Details <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md="12" sm="12">
                                    <FormGroup>
                                        <Label>Camera Name</Label>
                                        <Input placeholder="Camera Name" value={cameraName} onChange={(e) => setcameraName(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="12" sm="12">
                                    <FormGroup>
                                        <Label>Url</Label>
                                        <Input placeholder="Url" type="textarea" value={url} onChange={(e) => setUrl(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>User Name</Label>
                                        <Input placeholder="User Name" value={username} onChange={(e) => setUsername(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>Password</Label>
                                        <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <Label>Is Print</Label>
                                    <Select
                                        value={printValue}
                                        options={options}
                                        onChange={(e) => setIsPrint(e.value)}
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

export default CameraDetailsList;
