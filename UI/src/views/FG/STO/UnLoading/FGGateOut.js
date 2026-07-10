import React, { Fragment, useState } from "react";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "react-feather";
import Uploader from "../Uploader";
import { apiBaseUrl, sapFileShare, uploadUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation } from "../forms/custom-form";
import { useHistory } from "react-router-dom";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const FGGateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState("")

    let { gateInOutInfoId } = useParams();

    const [result1, setResult1] = useState([])
    const [result2, setResult2] = useState([])

    const deliveryNumber1 = result1.map((result1) => result1.deliveryNumber);
    const deliveryNumber2 = result2.map((result2) => result2.DELIVERY_NO);

    const invoiceNumber1 = result1.map((result1) => result1.invoiceNumber);
    const invoiceNumber2 = result2.map((result2) => result2.INVOICE_NO);

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                    setResult1(data.invoiceInfo);

                    apiPostMethod(apiBaseUrl + `LandingDataController/FGSales_DocumentVerify`, { gateInInfoId: data.results[0].gateInOutInfoId, shipmentOrderNo: data.results[0].shipmentOrderNo, tripSheetNumber: data.results[0].tripSheetNumber, vaNumber: data.results[0].vaNumber, Type: 'Get' })
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                setResult2(data.fg_details_data[0].SAP_LINE);
                            }
                        })
                        .catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo()
    }, [])

    const submit = (fdata) => {
        if (!fdata.shipmentCopy) {
            errorToast("Please Attach Shipment Copy")
        } else {
            if (data.vehicleType === 'BULKER' || data.vehicleType === 'TRAILER') {
                if (!fdata.coaCopy) {
                    errorToast("Please Attach COA Copy")
                } else if (JSON.stringify(invoiceNumber1) === JSON.stringify(invoiceNumber2) == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Invoice Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else if (JSON.stringify(deliveryNumber1) === JSON.stringify(deliveryNumber2) == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    updateVehicleStatus(fdata)
                }
            } else {
                if (JSON.stringify(invoiceNumber1) === JSON.stringify(invoiceNumber2) == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Invoice Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else if (JSON.stringify(deliveryNumber1) === JSON.stringify(deliveryNumber2) == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Delivery Number Miss Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    updateVehicleStatus(fdata)
                }
            }
        }
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // shipmentCopy: validation.required({ message: "Please Attach", isObject: false })
        }),
        updateVehicleStatus(fdata) { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    console.log(UserDetails);

    const updateVehicleStatus = (fdata) => {

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    reload();
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

    const reload = () => {
        if (data.movementType == 'LOADING') {
            history.push(`/Loading/GateIn`);
        } else {
            history.push(`/VA`);
        }
    }

    const [remrks, setRemrks] = useState(false)
    const [generalData, setGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(true)
    const [hideDownArrow, setHideDownArrow] = useState(false)

    const [invoiceData, setInvoiceData] = useState([])

    const showGeneralData = () => {
        setRemrks(true)
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideGeneralData = () => {
        setRemrks(false)
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });

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

        console.log(fdata);

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

        if (keys.length > 0) {
            let postdata = new FormData();
            console.log(postdata);
            let { shipmentCopy, coaCopy } = postdata;

            postdata.append("image[]", shipmentCopy);
            postdata.append("image[]", coaCopy);

            let UploadFile = 0;
            let UploadFile1 = 0;

            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });

            UploadFile = attachedFiles.shipmentCopy && attachedFiles.shipmentCopy.name && attachedFiles.shipmentCopy.name.length ? true : false;
            UploadFile1 = attachedFiles.coaCopy && attachedFiles.coaCopy.name && attachedFiles.coaCopy.name.length ? true : false;

            postdata.append("form_name", data.moduleType);
            postdata.append("SubFolder", "FG_GateOut");

            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.shipmentCopy = data.files[0] ? data.files[0].updname : "";
                        fdata.coaCopy = data.files[1] ? data.files[1].updname : "";
                        submit(fdata)
                    }

                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else {
            submit(fdata)
        }
    };

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>FG - Gate Out</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        {data.colorToken ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Enter Color / Token" value={data.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>
                        {data.firstWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Empty Weight</Label>
                                    <Input type="text" placeholder="Enter Empty Weight" value={data.firstWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.secondWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Load Weight</Label>
                                    <Input type="text" placeholder="Enter Load Weight" value={data.secondWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data.netWeight ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Net Weight</Label>
                                    <Input type="text" placeholder="Enter Net Weight" value={data.netWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
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
                                        title="Shipment Copy"
                                        id={"shipmentCopy"}
                                        selectedFileName={attachedFiles.shipmentCopy.name}
                                    />
                                </div>
                                {data.vehicleType == 'BULKER' || data.vehicleType == 'TRAILER' ?    
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="COA Copy"
                                            id={"coaCopy"}
                                            selectedFileName={attachedFiles.coaCopy.name}
                                        />
                                    </div> : null
                                }
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <hr></hr>
                            <FormGroup>
                                <Label for="nameMulti"><b>Click Here :
                                    &nbsp;&nbsp;
                                    {showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={showGeneralData} className="text-primary">
                                            General Details <ChevronDown size={20} />
                                        </Button.Ripple> : null
                                    }
                                    {hideDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideGeneralData} className="text-primary">
                                            General Details <ChevronUp size={20} />
                                        </Button.Ripple> : null
                                    }
                                </b></Label>
                            </FormGroup>
                        </Col>
                    </Row>

                    {generalData ?
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={data.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Enter Truck Type" value={data.truckType} disabled />
                                </FormGroup>
                            </Col>
                            {data.shipmentOrderNo != null ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Shipment Order No</Label>
                                        <Input type="text" placeholder="Enter Shipment Order No" value={data.shipmentOrderNo} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {invoiceData.map(invoiceData => (
                                <Col md="4" sm="4" key={invoiceData.SUP_VE_REFID}>
                                    <FormGroup>
                                        <Label>Invoice No</Label>
                                        <Input type="text" placeholder="Enter Invoice No" value={invoiceData.SEAL_NO} disabled />
                                    </FormGroup>
                                </Col>
                            ))}
                        </Row> : null
                    }
                    <Row>
                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={reload}>
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
        </Fragment >
    );
};

export default FGGateOut;
