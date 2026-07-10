import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, InputGroup } from "reactstrap";
import { Modal } from "react-bootstrap";
import { Check, ChevronDown, ChevronUp, Search, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import moment from "moment";
import WorkPermitList from "./WorkPermitList";

const WorkPermitForm = () => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [totalDays, setTotalDays] = useState('')
    const [poNo, setPoNo] = useState('');
    const [poDetails, setPoDetails] = useState('');

    const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: 12 }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoDetails(data.data[0])
                } else {
                    // errorToast(data.message)
                    setPoDetails('show')
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            workNatureId: validation.required({ message: "Please Select Nature Of Work", isObject: true }),
            prefferedShiftId: validation.required({ message: "Please Select Preffered Shift", isObject: true }),
            masterPlantId: validation.required({ message: "Please Select Location Name", isObject: true }),
            supervisorId: validation.required({ message: "Please Select Supervisor Name", isObject: true }),
            contractorName: validation.required({ message: "Please Enter Contractor Name", isObject: false }),
            noOfPerson: validation.required({ message: "Please Enter No Of Persons", isObject: false })
        }),
        onSubmit() { },
    });

    function days_between(date1, date2) {

        setStartDate(date1)
        setEndDate(date2)

        const startDate = new Date(moment(date1).format('YYYY-MM-DD'));
        const endDate = new Date(moment(date2).format('YYYY-MM-DD'));

        const ONE_DAY = 1000 * 60 * 60 * 24;
        const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
        let totalDays = Math.round(differenceMs / ONE_DAY);
        setTotalDays(totalDays);
    }

    const addWorkPermit = () => {

        if (!form.isValid) {
            if (startDate == '') {
                setStartDate('show')
            } else if (endDate == '') {
                setEndDate('show')
            }
            form.setSubmitting(true);
            form.validateForm();
            return;
        }

        let formData = form.values;
        const postdata = {
            workNatureId: formData.workNatureId.value,
            servicePoNo: poNo,
            startDate: startDate,
            endDate: endDate,
            totalDays: totalDays,
            prefferedShiftId: formData.prefferedShiftId.value,
            masterPlantId: formData.masterPlantId.value,
            contractorName: formData.contractorName,
            supervisorId: formData.supervisorId.value,
            highGradePersonId: formData?.highGradePersonId?.value,
            mediumGradePrersonId: formData?.mediumGradePrersonId?.value,
            lowGradePersonId: formData?.lowGradePersonId?.value,
            totalNoOfPersons: formData.noOfPerson,
            remarks: formData?.remarks,
            userInfoId: UserDetails.USERID
        };

        if (startDate == '' || startDate == 'show' || endDate == '' || endDate == 'show') {
            setStartDate('show')
            setEndDate('show')
        } else {
            showLoader();
            console.log(apiBaseUrl + "GatePro/Gate/addWorkPermit", postdata);
            apiPostMethod(apiBaseUrl + "GatePro/Gate/addWorkPermit", postdata)
                .then((response) => {
                    const data = response.data;
                    if (data.success == true) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        })
                        setStartDate('')
                        setEndDate('')
                        setTotalDays('')
                        setPoDetails('')
                        form.resetForm()
                    }
                    else if (data.success == false) {
                        errorToast(data.message)
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
    }
    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Work Permit Form</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/6`}
                                    label={"Nature of Work"}
                                    form={form}
                                    id="workNatureId"
                                />
                            </FormGroup>
                        </Col>

                        {form?.values.workNatureId != undefined ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>PO Number</Label>
                                    <InputGroup>
                                        <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} />
                                        <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => getPoDetails()}>
                                            <Search size={20} />
                                        </Button>
                                    </InputGroup>
                                </FormGroup>
                            </Col> : null
                        }

                        {poDetails != '' || poDetails == 'show' ? <>

                            {poDetails != 'show' ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Vendor Name</Label>
                                        <Input type="text" placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            <Col md="4" sm="4">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => days_between(e.target.value, endDate)}
                                />
                                {startDate == 'show' ? <Label className='text-danger'>Please Select Start Date</Label> : null}
                            </Col>
                            <Col md="4" sm="4">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => days_between(startDate, e.target.value)}
                                />
                                {endDate == 'show' ? <Label className='text-danger'>Please Select End Date</Label> : null}
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Total Days</Label>
                                    <Input type="text" placeholder="Total Days" value={endDate != '' ? totalDays : ''} disabled />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/7`}
                                        label={"Preffered Shift"}
                                        form={form}
                                        id="prefferedShiftId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={UserDetails.USERID == 1 ? `${apiBaseUrl}GatePro/Master/getMasterPlant` : `${apiBaseUrl}GatePro/Master/getUserPlant/${UserDetails.USERID}`}
                                        label={"Locaion Name"}
                                        form={form}
                                        id="masterPlantId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Contractor Name"} type="text" form={form} id="contractorName" />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                        label={"Supervisor Name"}
                                        form={form}
                                        id="supervisorId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                        label={"High Grade Persons"}
                                        form={form}
                                        id="highGradePersonId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                        label={"Medium Grade Prersons"}
                                        form={form}
                                        id="mediumGradePrersonId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                        label={"Low Grade Persons"}
                                        form={form}
                                        id="lowGradePersonId"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Total No of Persons"} type="text" form={form} id="noOfPerson" />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Remarks"} type="text" form={form} id="remarks" />
                                </FormGroup>
                            </Col>

                            <Col sm="12" md="12">
                                <FormGroup className="d-flex justify-content-end">
                                    <Button.Ripple color="primary" type="button" onClick={addWorkPermit}>
                                        <Check size={16} /> Submit
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                        </> : null}
                    </Row>
                </CardBody>
            </Card>
            <div style={{ marginBottom: "250px" }}></div>
        </Fragment >
    );
};

export default WorkPermitForm;
