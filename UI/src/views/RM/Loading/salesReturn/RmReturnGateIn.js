import React, { Fragment } from 'react'
import { Check, Search, StopCircle } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import confirmDialog from '../../../../@core/components/confirm/confirmDialog';
import { apiBaseUrl } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { errorToast } from '../../../../helper/appHelper';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { useFormik } from 'formik';
import { Yup } from '../../../forms/custom-form';
import { useSelector } from 'react-redux';

const RmReturnGateIn = ({ data }) => {

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            movementType: "Unloading",
            moduleType: data.moduleType,
            vehicleNo: data.truckNo,
            driverMobileNumber: data.phoneNo,
            masterPlantId: data.masterPlantId,
            moduleStatusId: moduleStatusId,
            remarks: formData.remarks,
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            tripSheetNumber: data.tripSheetNo
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    const message = moduleStatusId == 6 ? "Waiting for In..." : res.message;
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    form.resetForm()
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
    return (
        <div>
            <Row>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Return Ref No</Label>
                        <Input type="text" placeholder="Enter Return Ref No" value={data.returnRefNo} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Sale Invoice No</Label>
                        <Input type="text" placeholder="Enter Sale Invoice No" value={data.salesInvoiceNo} disabled />
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Customer Name</Label>
                        <Input type="text" placeholder="Enter Customer Name" value={data.personName} disabled/>
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Plant</Label>
                        <Input type="text" placeholder="Enter Plant" value={data.plantName} disabled/>
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Driver Phone No</Label>
                        <Input type="text" placeholder="Enter Driver Phone No" value={data.phoneNo}/>
                    </FormGroup>
                </Col>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Remarks</Label>
                        <Input type="text" placeholder="Enter Remarks"/>
                    </FormGroup>
                </Col>
                <Col sm="12">
                <br></br>
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <div className="mr-1">
                            <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                                <StopCircle size={16} className="mr-1"/>
                                Wait Outside
                            </Button.Ripple>
                        </div>
                        <Button.Ripple color="primary" type="button"  onClick={() => gateIn(1)}>
                            <Check size={16}/>
                            Gate In
                        </Button.Ripple>
                    </FormGroup>
                </Col>
            </Row>
        </div>
    )
}

export default RmReturnGateIn