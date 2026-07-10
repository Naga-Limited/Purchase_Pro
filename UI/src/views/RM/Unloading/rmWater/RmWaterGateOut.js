import React, { Fragment } from 'react'
import { useState } from 'react'
import { ArrowLeft, Check } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { apiPostMethod } from '../../../../helper/axiosHelper'
import { ShowToast, errorToast } from '../../../../helper/appHelper'
import { apiBaseUrl, sapFileShare } from '../../../../urlConstants'
import { useEffect } from 'react'
import { useParams } from "react-router";
import { useSelector } from 'react-redux'
import { useLoader } from '../../../../utility/hooks/useLoader'
import { useFormik } from 'formik'
import { Yup } from '../../../forms/custom-form'
import { useHistory } from "react-router-dom";
import Uploader from '../../../Uploader'

const RmWaterGateOut = () => {

    const [data, setData] = useState([])

    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        reject() { },
    });

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [poData, setPoData] = useState([])

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const redirect = () => {
        history.push("/VA");
    }
    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

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
            userInfoId: UserDetails.USERID
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { invoiceCopy } = postdata;

            postdata.append("image[]", invoiceCopy);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");
            showLoader();
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.invoiceCopy = data.files[0] ? data.files[0].updname : "";
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
    const updateVehicleStatus = (fdata) => {

        const formData = form.values;
        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    redirect()
                }
                else if (res.success == false) {
                    errorToast(res.message)
                    redirect()
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
        getGateInInfo()
    }, [])


    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>Rm Water GateOut</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>VA No</Label>
                                    <Input type="text" placeholder="Enter VaNo" value={data?.vaNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck No</Label>
                                    <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Driver Phone No</Label>
                                    <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data?.secondWeight} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                    <label></label>
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <div className="mr-1">
                                            <div style={{ marginBottom: "7px" }}></div>
                                            <Label><b>Attachments :</b></Label>
                                        </div>
                                        <div className="mr-1">
                                            <Uploader
                                                setAttachment={handleFileChange}
                                                title="Invoice Copy / Delivery Document Slip"
                                                id={"invoiceCopy"}
                                                selectedFileName={attachedFiles.invoiceCopy.name}
                                            />
                                        </div>
                                    </FormGroup>
                            </Col>
                            {poData != '' ? <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                                </Col>

                                {poData?.map((poData) => (<>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>PO Number</Label>
                                            <Input type="text" placeholder="PO Number" value={poData?.poNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>PO Type</Label>
                                            <Input type="text" placeholder="PO Type" value={poData?.name} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Vendor Name </Label>
                                            <Input type="text" placeholder="Vendor Name" value={poData?.vendorName} disabled />
                                        </FormGroup>
                                    </Col> </>
                                ))} </> : null
                            }
                        </Row>

                        <Row>
                            <Col sm="10" md="10">
                                <label>&nbsp;</label>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                            <Col sm="2" md="2">
                                <label>&nbsp;</label>
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <Button.Ripple color="primary" type="button" onClick={upload}>
                                        <Check size={16} /> Gate Out
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        </div>
    )
}

export default RmWaterGateOut