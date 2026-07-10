import React, { Fragment, useState, useEffect } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { Check } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import KeyDistributionList from "./KeyDistributionList";
import { RefreshBlock1 } from "../common/RefreshBlock1";

const KeyDistribution = () => {

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [landingData, setLandingData] = useState([]);

    const form = useFormik({
        initialValues: {
            nagaMobileNo: ""
        },
        validationSchema: Yup.object().shape({
            keyDetailsId: validation.required({ message: "Please Select Key", isObject: true }),
            receiverId: validation.required({ message: "Please Select Receiver Name", isObject: true })
        }),
        onSubmit() { }
    });

    const addKeyCollectionDetails = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            keyCollectionDetailsId: 0,
            keyDetailsId: formData.keyDetailsId.value,
            receiverId: formData.receiverId.value,
            drCollectorName: formData.receiverId.emp_name,
            mobileNo: formData.nagaMobileNo,
            giverId: null,
            userInfoId: UserDetails.USERID
        };

        if (!postdata.mobileNo) {
            errorToast("Mobile Number not available for this employee");
            return;
        }

        showLoader();

        apiPostMethod(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata)
            .then((response) => {
                const data = response.data;

                if (data.success === true) {

                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: `#51A351`
                    });

                    form.resetForm();
                    getKeyCollectionDetails();
                }
                else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => {
                hideLoader();
            });
    };

    const getKeyCollectionDetails = () => {

        apiGetMethod(apiBaseUrl + `GatePro/Master/getKeyCollectionDetails/${UserDetails.USERID}`)
            .then((response) => {

                const data = response.data;

                if (data.success === true) {
                    setLandingData(data.results);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    useEffect(() => {
        getKeyCollectionDetails();
    }, []);

    return (
        <Fragment>
            <Card>

                <CardHeader>
                    <h5>Key Distribution</h5>
                    <RefreshBlock1 />
                </CardHeader>

                <hr />
                <CardBody>
                    <Row>

                        {/* Key Name */}
                        <Col md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getkeyListbyuser/${UserDetails.GATE_ID}`}
                                    label={"Key Name"}
                                    form={form}
                                    id="keyDetailsId"
                                />
                            </FormGroup>
                        </Col>

                        {/* Employee Dropdown */}
                        <Col md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                    label={"Key Collector"}
                                    form={form}
                                    id="receiverId"
                                    onChange={(selected) => {
                                        form.setFieldValue("receiverId", selected);
                                        form.setFieldValue("nagaMobileNo", selected?.emp_mobile_number || "");
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        {/* Mobile Number */}
                        <Col md="4">
                            <FormGroup>
                                <Label>Mobile No</Label>
                                <Input
                                    type="text"
                                    value={form.values.nagaMobileNo}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        {/* Save Button */}
                        <Col md="2">
                            <FormGroup className="mt-2">
                                <Button color="primary" type="button" onClick={addKeyCollectionDetails}>
                                    <Check size={16} /> Save
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData !== "" ? (
                <KeyDistributionList
                    data={landingData}
                    setData={setLandingData}
                    getKeyCollectionDetails={getKeyCollectionDetails}
                />
            ) : null}

        </Fragment>
    );
};

export default KeyDistribution;
