import React, { useState } from 'react'
import { Check, StopCircle } from 'react-feather'
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { CustomTextInput, Yup } from '../../forms/custom-form'
import Uploader from '../../Uploader'
import { useFormik } from 'formik'
import { useSelector } from 'react-redux'
import { useLoader } from '../../../utility/hooks/useLoader'
import { apiBaseUrl } from '../../../urlConstants'
import { apiPostMethod } from '../../../helper/axiosHelper'
import confirmDialog from '../../../@core/components/confirm/confirmDialog'
import { errorToast } from '../../../helper/appHelper'
import { useEffect } from 'react'

const GatePassGateIn = ({ data, setData, setSelectedValue, setModuleTypeId, getUnLoadingData, Unloading_Gate_in_Vehicle, setModuleType }) => {

    const gateInOutInfoData = data.results[0];

    useEffect(() => {
        getGatepassDeliveryInfo()
    }, [])

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const [gatepassDeliveryData, setGatepassDeliveryData] = useState([]);

    const getGatepassDeliveryInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData?.fromGateInOutInfoId != '' ? gateInOutInfoData?.fromGateInOutInfoId : gateInOutInfoData.gateInOutInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGatepassDeliveryInfo/${gateInOutInfoData?.fromGateInOutInfoId != '' ? gateInOutInfoData?.fromGateInOutInfoId : gateInOutInfoData.gateInOutInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatepassDeliveryData(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: gateInOutInfoData.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
        };
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : "Gate In Success...";
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    form.resetForm()
                    setData('')
                    getUnLoadingData()
                    setModuleTypeId('')
                    setSelectedValue('')
                    setModuleType('')
                    Unloading_Gate_in_Vehicle()
                }
                else if (res.success == false) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
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

    const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    return (
        <Row>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>VA No</Label>
                    <Input type="text" placeholder="Enter VA No" value={gateInOutInfoData.vaNumber} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Driver Phone Number</Label>
                    <Input type="text" placeholder="Enter PhoneNo" value={gateInOutInfoData.driverMobileNumber} disabled />
                </FormGroup>
            </Col>
            {/* <Col md="4" sm="4">
                <FormGroup>
                    <Label>Plant</Label>
                    <Input placeholder="Plant" value={gateInOutInfoData.fromPlant} disabled />
                </FormGroup>
            </Col> */}

            {gateInOutInfoData.weighmentInfoId > 0 ? <>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>From Plant First Weight</Label>
                        <Input type="text" placeholder="Enter First Weight" value={gateInOutInfoData.fromPlantFirstWeight} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>From Plant Second Weight</Label>
                        <Input type="text" placeholder="Enter Second Weight" value={gateInOutInfoData.fromPlantSecondWeight} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>From Plant Net Weight</Label>
                        <Input type="text" placeholder="Enter Net Weight" value={gateInOutInfoData.fromPlantNetWeight} disabled />
                    </FormGroup>
                </Col> </> : null
            }

            <Col md="4" sm="4">
                <FormGroup>
                    <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                </FormGroup>
            </Col>

            {gateInOutInfoData.gatePassDocument ?
                <Col sm="4" md="4">
                    <label></label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                        <div className="mr-1">
                            <div style={{ marginBottom: "7px" }}></div>
                            <Label><b>GatePass Doc :</b></Label>
                        </div>
                        <div className="mr-1">
                            <a target="_blank" href={gateInOutInfoData.gatePassDocument}>
                                <Button outline color="success" type="button">
                                    View
                                </Button>
                            </a>
                        </div>

                    </FormGroup>
                </Col> : null
            }

            {gatepassDeliveryData != '' ?
                <>
                    <Col md="12" sm="12"><hr></hr></Col>

                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
                    </Col>

                    {gatepassDeliveryData.map((data) => (
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

            <Col sm="12">
                <FormGroup className="d-flex justify-content-end mb-0">
                    <div className="mr-1">
                        <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                            <StopCircle size={16} className="mr-1" />
                            Wait Outside
                        </Button.Ripple>
                    </div>
                    <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
                        <Check size={16} className="mr-1" />
                        Gate In
                    </Button.Ripple>
                </FormGroup>
            </Col>
        </Row>
    )
}

export default GatePassGateIn