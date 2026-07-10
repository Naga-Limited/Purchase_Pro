import React, { Fragment, useState } from "react";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader, CardBody, Card } from "reactstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "react-feather";
import { apiBaseUrl, sapFileShare } from "../../../../urlConstants";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { apiPostMethod } from "../../../../helper/axiosHelper";
import { useParams } from "react-router";
import { useEffect } from "react";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { CustomTextInput, Yup } from "../../../forms/custom-form";
import { useHistory } from "react-router-dom";
import Uploader from "../../../Uploader";

const STOGateOut = () => {

    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();

    const [data, setData] = useState([])
    const [invoiceData, setInvoiceData] = useState([])
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([])

    let { gateInOutInfoId } = useParams();

    const getGateInInfo = () => {

        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setData(data.results[0])
                    setInvoiceData(data.invoiceInfo)
                    getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getGatepassDeliveryInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatepassDeliveryData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getGateInInfo()
    }, [])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            remarks: ""
        }),
        updateVehicleStatus() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [unloadingData, setUnloadingData] = useState([]);

    const updateVehicleStatus = (fdata) => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            unloadingDetails: unloadingData
        }

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
                console.log(res);
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
    const [attachedFiles, setAttachment] = useState({ gatePassDocument: {} });
    const [ImgData, setImgData] = useState({});

    const showshowGeneralData = () => {
        setShowDownArrow(false)
        setHideDownArrow(true)
        setGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }
    const submit = (fdata) => {
        if (!fdata.shipmentCopy) {
          errorToast("Please Attach Document")
        } else {
          updateVehicleStatus(fdata)
        }
      }
    const upload = () => {
        let formData = form.values;
        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 5,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            unloadingDetails: unloadingData
        }

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
    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };
    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Unloading - STO - Gate Out</h5></CardHeader>
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
                                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
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
                                        title="Migo Confirmation Copy"
                                        id={"shipmentCopy"}
                                        selectedFileName={attachedFiles?.shipmentCopy?.name}
                                    />
                                </div>
                            </FormGroup>
                        </Col>
                        <Col sm="4" md="4">
                            <label></label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <div className="mr-1">
                                    <div style={{ marginBottom: "7px" }}></div>
                                    <Label><b>Delivery Document :</b></Label>
                                </div>
                                <div className="mr-1">
                                    <a target="_blank" href={data.pickSlipCopy}>
                                        <Button outline color="success" type="button">
                                            View
                                        </Button>
                                    </a>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <hr></hr>
                            <FormGroup>
                                <Label for="nameMulti"><b>Click Here :
                                    &nbsp;&nbsp;
                                    {showDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={showshowGeneralData} className="text-primary">
                                            General Details <ChevronDown size={20} />
                                        </Button.Ripple> : null
                                    }
                                    {hideDownArrow ?
                                        <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
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
                            {data.fromPlantFirstWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant Empty Weight</Label>
                                        <Input type="text" placeholder="Enter From Plant Empty Weight" value={data.fromPlantFirstWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.fromPlantSecondWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant Load Weight</Label>
                                        <Input type="text" placeholder="Enter From Plant Load Weight" value={data.fromPlantSecondWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.fromPlantNetWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant Net Weight</Label>
                                        <Input type="text" placeholder="Enter From Plant Net Weight" value={data.fromPlantNetWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.firstWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>To Plant Empty Weight</Label>
                                        <Input type="text" placeholder="Enter To Plant Empty Weight" value={data.firstWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.secondWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>To Plant Load Weight</Label>
                                        <Input type="text" placeholder="Enter To Plant Load Weight" value={data.secondWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data.netWeight ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>To Plant Net Weight</Label>
                                        <Input type="text" placeholder="Enter To Plant Net Weight" value={data.netWeight} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>STO PO No</Label>
                                    <Input type="text" placeholder="Enter STO PO No" value={data.stoPoNo} disabled />
                                </FormGroup>
                            </Col>

                            {invoiceData.length == 1 ? <>
                                {invoiceData.map(invoiceData => (
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Delivery Order No.</Label>
                                            <Input type="text" placeholder="Enter STO PO No" value={invoiceData.deliveryNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                ))} </> : null
                            }

                            {invoiceData.length > 1 ? <>

                                <Col md="12" sm="12">
                                    <label></label>
                                    <h5 className="text-primary">Delivery No :</h5>
                                </Col>

                                {invoiceData.map(invoiceData => (
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            {/* <Label>Delivery Order No.</Label> */}
                                            <Input type="text" placeholder="Enter STO PO No" value={invoiceData.deliveryNumber} disabled />
                                        </FormGroup>
                                    </Col>
                                ))} </> : null
                            }

                            {/* {gatepassDeliveryData != '' ?
                                <>
                                    <Col md="12" sm="12"><hr></hr></Col>

                                    <Col md="12" sm="12">
                                        <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                                    </Col>
                                    {gatepassDeliveryData?.map(gatepassDeliveryData => (
                                        <>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>Return Type</Label>
                                                    <Input type="text" placeholder="Enter Return Type" value={gatepassDeliveryData.gatePassType} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>Gate Pass No</Label>
                                                    <Input type="text" placeholder="Enter Gate Pass No" value={gatepassDeliveryData.gatePassNo} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>From Plant</Label>
                                                    <Input type="text" placeholder="Enter Plant" value={gatepassDeliveryData.fromPlantName} disabled />
                                                </FormGroup>
                                            </Col>

                                            <Col md="12" sm="12">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                            <th className="bg-primary text-white text-center">MATERIAL</th>
                                                            <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                            <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                            {gatepassDeliveryData.sapLine[0].toPlantName != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                        </tr>
                                                    </thead>
                                                    {gatepassDeliveryData?.sapLine.map((lineItem) => {
                                                        return (
                                                            <tbody key={lineItem.lineItem}>
                                                                <tr>
                                                                    <td className='text-center'>{lineItem?.lineItem}</td>
                                                                    <td>{lineItem?.material}</td>
                                                                    <td className='text-center'>{lineItem?.uom}</td>
                                                                    <td className='text-center'>{lineItem?.quantity}</td>
                                                                    {lineItem?.toPlantName != '' ? <td className='text-center'>{lineItem?.toPlantName}</td> : null}
                                                                </tr>
                                                            </tbody>
                                                        )
                                                    })}
                                                </table>
                                            </Col>
                                        </>
                                    ))}
                                </> : null
                            } */}
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

export default STOGateOut;
