import React, { Fragment } from 'react'
import { Check, Search, StopCircle } from 'react-feather'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { apiBaseUrl } from '../../../../urlConstants';
import { apiPostMethod } from '../../../../helper/axiosHelper';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { Yup } from '../../../forms/custom-form';
import confirmDialog from '../../../../@core/components/confirm/confirmDialog';
import { errorToast } from '../../../../helper/appHelper';
import { useLoader } from '../../../../utility/hooks/useLoader';

const SSAndPMPurchaseGateIn = ({ data, setData, setSelectedValue, setModuleType, getUnLoadingData }) => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    let { showLoader, hideLoader } = useLoader();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

    console.log(data);

    const gateIn = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            // userInfoId: UserDetails.USERID,
            // movementType: "Unloading",
            // moduleType: data.moduleType,
            // vehicleNo: data.truckNo,
            // driverMobileNumber: data.phoneNo,
            // masterPlantId: data.masterPlantId,
            // moduleStatusId: moduleStatusId,
            // remarks: formData.remarks,
            // loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            // tripSheetNumber: data.tripSheetNo
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    setSelectedValue('')
                    setData('')
                    setModuleType('')
                    getUnLoadingData()
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
        <>
        <Row>
            <Col md="4" sm="4">
                <FormGroup >
                    <Label>Driver Phone No </Label>
                    <Input type="text" placeholder="Enter Driver Phone No" value={data?.phoneNo} disabled />
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
                    <Label>PO Number</Label>
                    <Input type="text" placeholder="Enter PO Number" value={data?.truckNo} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Vendor Name</Label>
                    <Input type="text" placeholder="Enter Vendor Name" value={data?.personName} disabled />
                </FormGroup>
            </Col>
            <Col md="4" sm="4">
                <FormGroup >
                    <Label>Remarks </Label>
                    <Input type="text" placeholder="Enter Remarks" />
                </FormGroup>
            </Col>
            <Col sm="12" md="12">
                <label>&nbsp;</label>
                <FormGroup className="d-flex justify-content-end mb-0">
                    <div className="mr-1">
                        <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                            <StopCircle size={16} /> Wait OutSide
                        </Button.Ripple>
                    </div>
                    <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
                        <Check size={16} /> Gate In
                    </Button.Ripple>
                </FormGroup>
            </Col>
            </Row>
        </>
    )
}

export default SSAndPMPurchaseGateIn