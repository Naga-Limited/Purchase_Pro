import React, { Fragment, useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useParams } from "react-router";
import { ArrowLeft, Check } from 'react-feather';
import { useHistory } from "react-router-dom";
import Uploader from '../Uploader';
import { Yup } from '../forms/custom-form';
import { ShowToast, errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';

const D2RSalesGateOut = () => {

    const [data, setData] = useState([])
    const [sapDeliveryData, setSapDeliveryData] = useState([])

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    let { gateInOutInfoId } = useParams();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [unloadingData, setUnloadingData] = useState();

    useEffect(() => {
        getGateInInfo()
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
        }),
        onSubmit() { },
    });


    const redirect = () => {
        if(data.moduleTypeId == 40 || data.moduleTypeId == 41 || data.moduleTypeId == 42){
            history.push("/VA");
        }else{
        history.push(`/Loading/GateIn`);
        }
    }

    const updateVehicleStatus = (datas) => {

        let formData = form.values;
        if (!datas.shipmentCopy && data.moduleTypeId != 42 && data.moduleTypeId != 40) {
            errorToast("Please Attach the copy")
            return
        }
        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            shipmentCopy:datas.shipmentCopy
        }
        if(data.moduleTypeId == 40){
            fdata.invoiceCopy = data?.invoiceOrDeliveryDocumentSlip	
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    redirect();
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
    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {} });
    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };
    const upload = () => {

        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
        }


        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { shipmentCopy } = postdata;

            postdata.append("image[]", shipmentCopy);

            let UploadFile = 0;

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
                        updateVehicleStatus(fdata)
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            updateVehicleStatus(fdata)
        }
    };
    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5> {data.moduleTypeId	? 'FG Sales' :'D2RSales GateOut'}</h5></CardHeader>
                    <hr></hr>
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>VA No</Label>
                                    <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Number</Label>
                                    <Input type="text" placeholder="Enter Truck Number" value={data.vehicleNo} disabled />
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
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Enter Driver Phone No" value={data.plantName} disabled />
                                </FormGroup>
                            </Col>

                            {/* {data.weighmentInfoId ? <>
                                <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>First Weight </Label>
                                    <Input typr="text" placeholder="Enter First Weight" value={data.firstWeight} disabled />
                                </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Second Weight</Label>
                                    <Input typr="text" placeholder="Enter Second Weight" value={data.secondWeight} disabled />
                                </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input typr="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                                </FormGroup>
                                </Col> </> : null
                            } */}


                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Movement Type</Label>
                                    <Input type="text" placeholder="Enter Movement Type" value={data.movementType} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Module Type</Label>
                                    <Input type="text" placeholder="Enter Module Type" value={data.moduleType} disabled />
                                </FormGroup>
                            </Col>
                            {data.moduleTypeId != 40 &&
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
                                            title="Attachment"
                                            id={"shipmentCopy"}
                                            selectedFileName={attachedFiles.shipmentCopy.name}
                                        />
                                    </div>
                                  
                                </FormGroup>
                            </Col>}
                            <Col sm="10" md="10">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button>
                                </FormGroup>
                            </Col>
                            <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <Button color="primary" type="button" onClick={upload}>
                                        <Check size={16} /> Gate Out
                                    </Button>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        </div>
    )
}

export default D2RSalesGateOut
