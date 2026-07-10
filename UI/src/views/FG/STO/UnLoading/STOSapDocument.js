import React, { Fragment, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, Badge } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { ShowToast } from "../../../../helper/appHelper";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../../../forms/custom-form";
import Uploader from "../../../Uploader";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";
import { apiGetMethod } from "../../../../helper/axiosHelper";

const STOSapDocument = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const openRemarksModal = () => setShow(true);

    let { gateInOutInfoId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const [data, setData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rejectReason: ""
        }),
        reject() { },
    });

    const getGateInInfo = () => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    getWeighmentInfo(data.results[0].gateInOutInfoId);
                    getFromPlantWeighmentInfo(data.results[0].fromGateInOutInfoId);
                    migoButtonDisabled(data.results[0].userGateId)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const FGSto_DocumentVerify = (fdata) => {

        apiPostMethod(apiBaseUrl + "LandingDataController/FGSto_DocumentVerify", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(data.message);
                    redirect()
                    confirmDialog({
                        title: `<h5><strong class="text-white"> MIGO NO : ${res.migoNumber}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
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

    const [fromPlantWeighmentData, setfromPlantWeighmentData] = useState([])
    const [fromPlantWOverAllWeight, setfromPlantWOverAllWeight] = useState([])

    const getFromPlantWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setfromPlantWeighmentData(data.data)
                    let lastItem = data.data.slice(-1)[0]
                    setfromPlantWOverAllWeight(lastItem)
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

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])

    const getWeighmentInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
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

    useEffect(() => {
        getGateInInfo()
    }, [])

    const redirect = () => {
        history.push("/STO/SAPDocumentDetails");
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const reject = () => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 2,
            rejectReasonId: formData.rejectReason.value,
            userInfoId: UserDetails.USERID
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast("Rejected Successfully...");
                    redirect()
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
    };

    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const upload = () => {

        const fdata = { gateInOutInfoId: data.gateInOutInfoId, userInfoId: UserDetails.USERID }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { shipmentCopy } = postdata;

            postdata.append("image[]", shipmentCopy);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.shipmentCopy && attachedFiles.shipmentCopy.name && attachedFiles.shipmentCopy.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.shipmentCopy = data.files[0] ? data.files[0].updname : "";
                        FGSto_DocumentVerify(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            FGSto_DocumentVerify(fdata)
        }
    };

    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const migoButtonDisabled = (userGateId) => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/migoButtonDisabled/${userGateId}`)
            .then((response) => {
                const { data } = response;
                if (data.isButtonDisabled == true) {
                    setIsButtonDisabled(true)
                }else{
                    setIsButtonDisabled(false)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>UnLoading - Receipt SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck Type</Label>
                                <Input type="text" placeholder="Enter Truck Type" value={data.truckType} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>From Plant</Label>
                                <Input type="text" placeholder="Enter From Plant" value={data.fromPlant} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>To Plant</Label>
                                <Input type="text" placeholder="Enter To Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck Capacity</Label>
                                <Input type="text" placeholder="Enter Truck Capacity" value={data.truckCapacity} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>STO PO No</Label>
                                <Input type="text" placeholder="Enter STO PO No" value={data.stoPoNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Delivery Order No</Label>
                                <Input type="text" placeholder="Enter Delivery Order No" value={data.deliveryOrderNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col sm="8" md="8">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Attachments :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <Uploader
                                        setAttachment={handleFileChange}
                                        title="Migo Confirmation Copy"
                                        id={"shipmentCopy"}
                                        selectedFileName={attachedFiles.shipmentCopy.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>

                        {data.fromPlantFirstWeight ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                            </Col>

                            {fromPlantWeighmentData != '' ? <>

                                <Col md="12" sm="12">
                                    <h5 className="text-primary"><u>From Plant</u></h5><br />
                                </Col>

                                <Col md="3" sm="3"><Label>Document Number</Label></Col>
                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>

                                {fromPlantWeighmentData.map((weighmentData) => (<>
                                    <Col md="3" sm="3" key={weighmentData.documentNumber}>
                                        <FormGroup>
                                            <Input typr="text" placeholder="Document" value={weighmentData?.documentNumber} disabled />
                                        </FormGroup>
                                    </Col>
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
                                </>))}

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All First Weight</Label>
                                        <Input typr="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Second Weight</Label>
                                        <Input typr="text" placeholder="Enter Second Weight" value={fromPlantWOverAllWeight.secondWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Net Weight</Label>
                                        <Input typr="text" placeholder="Enter Net Weight" value={Number(data?.firstWeight - fromPlantWOverAllWeight.secondWeight).toFixed(3)} disabled />
                                    </FormGroup>
                                </Col>  </> : null
                            }

                            {weighmentData != '' ? <>

                                <Col md="12" sm="12">
                                    <br />
                                    <h5 className="text-primary"><u>To Plant</u></h5><br />
                                </Col>

                                <Col md="3" sm="3"><Label>Document Number</Label></Col>
                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>

                                {weighmentData.map((weighmentData) => (<>
                                    <Col md="3" sm="3" key={weighmentData.documentNumber}>
                                        <FormGroup>
                                            <Input typr="text" placeholder="Document" value={weighmentData?.documentNumber} disabled />
                                        </FormGroup>
                                    </Col>
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
                                </>))}

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All First Weight</Label>
                                        <Input typr="text" placeholder="Enter First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Second Weight</Label>
                                        <Input typr="text" placeholder="Enter Second Weight" value={overAllWeight.secondWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Net Weight</Label>
                                        <Input typr="text" placeholder="Enter Net Weight" value={Number(data?.firstWeight - overAllWeight.secondWeight).toFixed(3)} disabled />
                                    </FormGroup>
                                </Col>  </> : null
                            }  </> : null 
                        }                    

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                <div style={{ float: 'right' }}>
                                    {(isButtonDisabled || data?.werks == 'FF05') && data.moduleStatusId == 5 ?
                                        <Button.Ripple color="primary" type="button" onClick={upload}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple> : null
                                    }
                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                                    label={"Reason"}
                                    form={form}
                                    id="rejectReason"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={reject}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Fragment >
    );
};

export default STOSapDocument;