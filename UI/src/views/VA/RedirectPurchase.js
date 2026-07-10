import React, { Fragment, useState } from "react";
import { BASE_URL, apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, ButtonGroup } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom"
import { ArrowLeft, Check } from "react-feather";
import { useSelector } from "react-redux";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useLoader } from "../../utility/hooks/useLoader";
import { ShowToast } from "../../helper/appHelper";
import { apiGetMethod } from "../../helper/axiosHelper";

const RedirectPurchase = () => {

    useEffect(() => {
        getUserPlant()
    }, [])


    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

    const history = useHistory();
    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();

    const [poData, setPoData] = useState([])
    const [redirectData, setRedirectData] = useState([])
    const [redirectPlant, setRedirectPlant] = useState([])
    const [data, setData] = useState([])
    const [moduleTypeId, setModuleTypeId] = useState('')

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = (type) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0])
                    getPurchaseOrder(data.results[0].loadingUnloadingInfoId)
                    getGatepassDeliveryInfo(data.results[0].fromGateInOutInfoId != '' ? data.results[0].fromGateInOutInfoId : data.results[0].gateInOutInfoId)
                    setModuleTypeId(data.results[0].moduleTypeId)

                    let moduleStatusId = data.results[0].moduleStatusId
                    let moduleTypeId = data.results[0].moduleTypeId

                    const postData = { gateInOutInfoId: data.results[0].gateInOutInfoId, vaNumber: data.results[0].vaNumber, type: type }

                    console.log(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", postData);
                    apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_DocumentVerify", postData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (type == 'GET') {
                                    // setRedirectPlant(data.results[0].SAP_LINE[0].REC_PLANT)
                                    setRedirectPlant(data.results[0].SAP_LINE[0].REC_PLANT != '' ? data.results[0].SAP_LINE[0].REC_PLANT : data.results[0].VENDOR_PLANT == '1060' ? 'CP00' : 'CP00')

                                    setRedirectData(data.results)
                                    // getMasterPlant(data.results[0].SAP_LINE[0].REC_PLANT)
                                    getMasterPlant(data.results[0].SAP_LINE[0].REC_PLANT != '' ? data.results[0].SAP_LINE[0].REC_PLANT : data.results[0].VENDOR_PLANT == '1060' ? 'CP00' : 'CP00')
                                }
                            } else if (data.success == false) {
                                if (moduleStatusId != 1 && moduleTypeId != 1) {
                                    errorToast(data.message)
                                }
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
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [gatePassDeliveryData, setGatePassDeliveryData] = useState([])

    const getGatepassDeliveryInfo = (gateInOutInfoId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatePassDeliveryData(data.results)
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
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [checkMasterPlant, setCheckMasterPlant] = useState('')

    const getMasterPlant = (redirectPlant) => {
        console.log(apiBaseUrl + `GatePro/Master/checkMasterPlant/${redirectPlant}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${redirectPlant}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setCheckMasterPlant(data.results[0].WERKS)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    setCheckMasterPlant(data.results)
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const redirectVehicle = () => {

        let formData = form.values

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            isRedirect: 1,
            redirectMasterPlantId: formData?.masterPlantId != undefined ? formData?.masterPlantId.werks : checkMasterPlant,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/redirectVehicle", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/redirectVehicle", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    if (moduleTypeId != 5) {
                        getGateInInfo('POST')
                    }
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
        getGateInInfo('GET')
    }, [])

    const redirect = () => {
        history.push("/RedirectPurchaseDetails");
    }

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getMasterPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getMasterPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    return (
        <div>
            <Card>
                <CardHeader><h5>Redirect Purchase</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>

                        {data?.shipmentOrderNo != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Shipment Order No</Label>
                                    <Input type="text" placeholder="Shipment Order No" value={data?.shipmentOrderNo} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.colorToken != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Color / Token" value={data?.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data?.truckType ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Truck Type" value={data?.truckType} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>

                        {data?.moduleTypeId == 1 || data?.moduleTypeId == 2 ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>First Weight</Label>
                                    <Input type="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.moduleStatusId == 1 || data?.moduleStatusId == 0 || data?.moduleTypeId == 1 || data?.moduleTypeId == 2 ?
                            <Col md="4" sm="12">
                                <CustomDropdownInput
                                    options={userPlant}
                                    label={"Redirect Plant"}
                                    form={form}
                                    id="masterPlantId"
                                />
                            </Col> :
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>First Weight</Label>
                                    <Input type="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                                </FormGroup>
                            </Col>}

                        {data?.moduleStatusId > 1 && data?.moduleTypeId != 1 && data?.moduleTypeId != 2 ? <>

                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Redirect Details</u></h4><br />
                            </Col>

                            {redirectData.map((redirectData) => (<>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>GatePass No</Label>
                                        <Input type="text" placeholder="Enter PO Number" value={redirectData?.GATEPASS_NO} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>GatePass Type</Label>
                                        <Input type="text" placeholder="Enter PO Number" value={redirectData?.GATEPASS_TYPE} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Redirect Plant</Label>
                                        <Input type="text" placeholder="Enter PO Number" value={redirectPlant} disabled />
                                    </FormGroup>
                                </Col> </>
                            ))} </> : null
                        }

                        {gatePassDeliveryData != '' && data?.moduleStatusId == 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
                                </Col>

                                {gatePassDeliveryData.map((data) => (
                                    <Col md="12" sm="12" key={data.gatePassNo}>
                                        <Row>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>Return Type</Label>
                                                    <Input type="text" placeholder="Enter Return Type" value={data.gatePassType} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>Gate Pass No</Label>
                                                    <Input type="text" placeholder="Enter Gate Pass No" value={data.gatePassNo} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm="4">
                                                <FormGroup>
                                                    <Label>From Plant</Label>
                                                    <Input type="text" placeholder="Enter Plant" value={data.fromPlantName} disabled />
                                                </FormGroup>
                                            </Col>

                                            <Col md="12" sm="12">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <td className="bg-primary text-white text-center" width='14%'>LINE ITEM</td>
                                                            <td className="bg-primary text-white text-center">MATERIAL</td>
                                                            <td className="bg-primary text-white text-center" width='10%'>UOM</td>
                                                            <td className="bg-primary text-white text-center" width='10%'>QTY</td>
                                                            <td className="bg-primary text-white text-center" width='20%'>TO PLANT</td>
                                                            <td className="bg-primary text-white text-center" width='20%'>VALUE</td>
                                                        </tr>
                                                    </thead>
                                                    {data.sapLine.map((lineItem) => {
                                                        return (
                                                            <tbody key={lineItem.lineItem}>
                                                                <tr>
                                                                    <td className='text-center'>{lineItem?.lineItem}</td>
                                                                    <td>{lineItem?.material}</td>
                                                                    <td className='text-center'>{lineItem?.uom}</td>
                                                                    <td className='text-center'>{lineItem?.quantity}</td>
                                                                    <td className='text-center'>{lineItem?.toPlantName}</td>
                                                                    <td className='text-center'>{lineItem?.value}</td>
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

                        {poData != '' ? <>
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                            </Col>

                            {poData.map((poDetails) => (<>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Number</Label>
                                        <Input type="text" placeholder="Enter PO Number" value={poDetails?.poNumber} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO Type</Label>
                                        <Input type="text" placeholder="Enter Invoice No" value={poDetails?.name} disabled />
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
                            </>))} </> : null
                        }

                        <Col sm="10" md="10">
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                                    <ArrowLeft size={16} /> Back
                                </Button.Ripple>
                            </FormGroup>
                        </Col>

                        {(redirectPlant != '' && data.firstWeight != null  || form?.values?.masterPlantId != undefined)?
                            <Col sm="2" md="2">
                                <label>&nbsp;</label>
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <Button.Ripple color="primary" type="button" onClick={redirectVehicle}>
                                        <Check size={16} /> Redirect
                                    </Button.Ripple>
                                </FormGroup>
                            </Col> : null
                        }
                    </Row>
                </CardBody >
            </Card >

            <div style={{ marginBottom: "100px" }}></div>
        </div >
    );
};

export default RedirectPurchase;
