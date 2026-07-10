import React, { Fragment, useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import Uploader from '../../../Uploader';
import { ArrowLeft, Check } from 'react-feather';
import { useParams } from "react-router";
import { apiBaseUrl, sapFileShare } from '../../../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../../../helper/appHelper';
import { useSelector } from 'react-redux';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { Yup } from '../../../forms/custom-form';
import { useFormik } from 'formik';
import { useHistory } from "react-router-dom";

const SSAndPMPurchaseGateOut = () => {

    const [data, setData] = useState([])
    const [poData, setPoData] = useState([])
    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([]);
    const [sapDeliveryData, setSapDeliveryData] = useState([]);
    const isCheckStatus = ((!data.firstWeight || !data.secondWeight || !data.netWeight) && poData[0]?.poTypeId == 61 );

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
                    getGatepassDeliveryInfo(data.results[0].gateInOutInfoId)
                    GatePass_DocumentVerify(data.results[0], 'GET')
                    QRCodeControl()
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const GatePass_DocumentVerify = (gateInOutData, type) => {

        const gatePasspostData = { gateInOutInfoId: gateInOutData.gateInOutInfoId, vaNumber: gateInOutData.vaNumber, type: type }

        apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", gatePasspostData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (type == 'GET') {
                        setSapDeliveryData(data.results);
                    }
                    else if (type == 'POST') {
                        redirect()
                    }
                }
                else if (data.success == false) {
                    if (type == 'POST') {
                        // errorToast(data.message)
                        redirect()
                    }
                }
            })
            .catch((error) => {
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

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const submit = (fdata) => {
        if (UserDetails.GATE_ID != 19 && workingProcess == 0 && ((!fdata.invoiceCopy && data?.isRedirect == null) || (!fdata.invoiceCopy && data?.isRedirect == 1 && data?.redirectMasterPlantId == null) || !fdata.invoiceCopy && data?.redirectMasterPlantId == 105)) {
            errorToast("Please Attach Invoice Copy")
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
        }

        if(isCheckStatus === false){
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
            if(UserDetails.GATE_ID == 19){
                fdata.invoiceCopy = data?.invoiceOrDeliveryDocumentSlip;
                submit(fdata)
               }else{
                   submit(fdata)
               }
        }
        }else{
            errorToast("Please Go Back And Enter The Weight");
        }
    };

    const updateVehicleStatus = (fdata) => {

        let gateInOutData = data;

        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    redirect()
                    GatePass_DocumentVerify(gateInOutData, 'POST')
                    if (data.redirectMasterPlantId != null && data.redirectMasterPlantId != 0 && data.secondWeight == null) {
                        gateIn()
                    }
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

    const gateIn = () => {

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: data.movementType,
            moduleType: data.moduleType,
            vehicleNo: data.vehicleNo,
            vaNumber: data.vaNumber,
            driverMobileNumber: data.driverMobileNumber,
            masterPlantId: data.redirectPlantWerks,
            tripSheetNumber: data.tripSheetNumber,
            truckType: data.truckType,
            truckCapacity: data.truckCapacity,
            vehicleType: data.vehicleType,
            loadingUnloadingInfoId: data.loadingUnloadingInfoId,
            isWeight: data.isWeight,
            isRedirect: data.isRedirect,
            moduleStatusId: 0
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
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
    }

    const redirect = () => {
        history.push(`/VA`);
    }
    const [workingProcess,setWorkingProcess] = useState('');
  
    const QRCodeControl = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                setWorkingProcess(data.workingProcess)   
            })
    }
    return (
        <div>
            <Fragment>
                <Card>
                    <CardHeader><h5>Purchase - Gate Out</h5></CardHeader>
                    <hr></hr>
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>VA No</Label>
                                    <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
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

                            {/* {data?.secondWeight ? <>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Empty Weight</Label>
                                        <Input type="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.secondWeight ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Load Weight</Label>
                                            <Input type="text" placeholder="Enter Load Weight" value={data?.secondWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {data?.netWeight ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>Net Weight</Label>
                                            <Input type="text" placeholder="Enter Net Weight" value={data?.netWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                } </> : null
                            } */}

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                                </FormGroup>
                            </Col>

                            {data?.migoNumber ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Migo No</Label>
                                        <Input type="text" placeholder="Enter Migo No" disabled />
                                    </FormGroup>
                                </Col> : null
                            }

                            <Col sm="4" md="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" />
                                </FormGroup>
                            </Col>

                            {workingProcess == 0 && (UserDetails.GATE_ID != 19 && (data?.isRedirect == null || data?.redirectMasterPlantId == 105)  || ((data?.isRedirect == 1) && (data?.redirectMasterPlantId == null || data?.redirectMasterPlantId == 0))) ?
                                <Col sm="12" md="12">
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
                                </Col> : null
                            }

                            <Col md="12" sm="12"><hr></hr></Col>
                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                            </Col>

                            {poData?.map((poDetails) => (<>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Number</Label>
                                        <Input type="text" placeholder="Enter PO Number" value={poDetails?.poNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Type</Label>
                                        <Input type="text" placeholder="Enter PO Type" value={poDetails?.name} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Invoice No</Label>
                                        <Input type="text" placeholder="Enter Invoice No" value={poDetails?.invoiceNo} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Vendor Name</Label>
                                        <Input type="text" placeholder="Enter Vendor Name" value={poDetails?.vendorName} disabled />
                                    </FormGroup>
                                </Col>
                            </>))}

                            {sapDeliveryData != '' ?
                                <>
                                    <Col md="12" sm="12"><hr></hr></Col>

                                    <Col md="12" sm="12">
                                        <h4 className="text-primary"><u>GatePass Info</u></h4><br />
                                    </Col>

                                    {sapDeliveryData?.map(sapDeliveryData => (
                                        <Col md="12" sm="12" key={sapDeliveryData?.GATEPASS_NO}>
                                            <Row>
                                                <Col md="3" sm="3">
                                                    <FormGroup><b><u><span className='text-primary'>GATEPASS NO : </span>{sapDeliveryData?.GATEPASS_NO}</u></b></FormGroup>
                                                </Col>
                                                <Col md="6" sm="6">
                                                    <ButtonGroup>
                                                        <FormGroup><b style={{ marginRight: "60px" }}><u><span className='text-primary'>GATEPASS TYPE : </span>{sapDeliveryData?.GATEPASS_TYPE}</u></b></FormGroup>
                                                        <FormGroup><b><u><span className='text-primary'>FROM PLANT : </span>{sapDeliveryData?.FROM_PLANT}</u></b></FormGroup>
                                                    </ButtonGroup>
                                                </Col>
                                                {sapDeliveryData?.VENDOR_PLANT_NAME ?
                                                    <Col md="3" sm="3">
                                                        <FormGroup><b><u><span className='text-primary'>VENDOR PLANT : </span>{sapDeliveryData?.VENDOR_PLANT_NAME}</u></b></FormGroup>
                                                    </Col> : null
                                                }

                                                <Col md="12" sm="12">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th className="bg-primary text-white text-center" width='14%'>LINE ITEM</th>
                                                                <th className="bg-primary text-white text-center">MATERIAL</th>
                                                                <th className="bg-primary text-white text-center" width='10%'>UOM</th>
                                                                <th className="bg-primary text-white text-center" width='10%'>QTY</th>
                                                                {sapDeliveryData.SAP_LINE[0].REC_PLANT != '' ? <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td> : null}
                                                                <th className="bg-primary text-white text-center" width='10%'>VALUE</th>
                                                            </tr>
                                                        </thead>
                                                        {sapDeliveryData?.SAP_LINE.map((lineItem) => {
                                                            return (
                                                                <tbody key={lineItem.LINE_ITEM}>
                                                                    <tr>
                                                                        <td className='text-center'>{lineItem?.LINE_ITEM}</td>
                                                                        <td>{lineItem?.MATERIAL}</td>
                                                                        <td className='text-center'>{lineItem?.UOM}</td>
                                                                        <td className='text-center'>{lineItem?.QTY}</td>
                                                                        {lineItem?.REC_PLANT != '' ? <td className='text-center'>{lineItem?.REC_PLANT}</td> : null}
                                                                        <td className='text-center'>{lineItem?.VALUE}</td>
                                                                    </tr>
                                                                </tbody>
                                                            )
                                                        })}
                                                    </table>
                                                    <br />
                                                </Col>
                                            </Row>
                                        </Col>))}
                                </> : null
                            }

                            {gatepassDeliveryData != '' ?
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
                                                <br />
                                            </Col>
                                        </>))}
                                </> : null
                            }

                            {data?.isRedirect == 1 && data?.redirectPlantName != null && data?.secondWeight == null ? <>
                                <Col md="12" sm="12"><hr></hr></Col>
                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Redirect Details</u></h4><br />
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>From Plant</Label>
                                        <Input type="text" placeholder="Enter From Plant" value={data?.plantName} disabled />
                                    </FormGroup>
                                </Col>
                                {data?.firstWeight != null ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>From Plant First Weight</Label>
                                            <Input type="text" placeholder="Enter Empty Weight" value={data?.firstWeight} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant</Label>
                                        <Input type="text" placeholder="Enter Redirect Plant" value={data?.redirectPlantName} disabled />
                                    </FormGroup>
                                </Col>
                            </> : null}


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

export default SSAndPMPurchaseGateOut