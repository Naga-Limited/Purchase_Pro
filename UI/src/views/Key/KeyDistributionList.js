import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Check, X } from "react-feather";
import { useFormik } from "formik";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { CustomDropdownInput, Yup, validation } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "KEY NAME",
        selector: "keyName",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "KEY COLLECTOR",
        selector: "receiverName",
        sortable: true,
        minWidth: "250px",
    }
];

const KeyDistributionList = ({ data, setData, getKeyCollectionDetails }) => {

    let { showLoader, hideLoader } = useLoader();

    const [show, setShow] = useState(false);
    const [otpModal, setOtpModal] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [keyDetailsData, setKeyDetailsData] = useState([]);

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            giverId: validation.required({ message: "Please Select Giver Name", isObject: true }),
        }),
        onSubmit() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return (
                <Row>
                    {row.isVerified == 0 ? (
                        <Button
                            color="warning"
                            size="sm"
                            onClick={() => onVerifyClick(row)}
                        >
                            Verify
                        </Button>
                    ) : (
                        <Button
                            color="primary"
                            size="sm"
                            onClick={() => onActionClick(row)}
                        >
                            Collect
                        </Button>
                    )}
                </Row>
            );
        },
    };

    const onVerifyClick = (row) => {
        setKeyDetailsData(row);
        setOtpModal(true);
    };

    const onActionClick = (row) => {
        setShow(true);
        setKeyDetailsData(row);
    };

    const verifyOTP = () => {

        if (!otpValue) {
            errorToast("Please enter OTP");
            return;
        }

        const postdata = {
            keyCollectionDetailsId: keyDetailsData.keyCollectionDetailsId,
            otp: otpValue
        };

        showLoader();

        apiPostMethod(apiBaseUrl + "GatePro/Master/verifyKeyOTP", postdata)
            .then((response) => {

                const data = response.data;

                if (data.success == 1) {

                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false,
                        confirmButton: false,
                        background: `#51A351`
                    });

                    setOtpModal(false);
                    setOtpValue("");
                    getKeyCollectionDetails();

                } else {
                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false,
                        confirmButton: false,
                        background: `#eb4034`
                    });
                }
            })
            .catch(() => {
                errorToast("Something went wrong");
            })
            .finally(() => {
                hideLoader();
            });
    };

    const addKeyCollectionDetails = () => {

        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }

        let formData = form.values;

        const postdata = {
            keyCollectionDetailsId: keyDetailsData.keyCollectionDetailsId,
            giverId: formData.giverId.value,
            giverName: formData.giverId.emp_name,
            userInfoId: UserDetails.USERID
        };

        showLoader();

        apiPostMethod(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata)
            .then((response) => {

                const data = response.data;

                if (data.success == true) {

                    setShow(false);
                    setData([]);
                    getKeyCollectionDetails();

                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: `#51A351`
                    });

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

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Key Distribution List</h5>
                </CardHeader>

                <hr />

                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            {/* Collect Modal */}
            <Modal show={show} centered size="sm">
                <ModalHeader>
                    <h5>Key Collection</h5>
                    <X onClick={() => setShow(false)} />
                </ModalHeader>

                <ModalBody>

                    <Row>

                        <Col md="12">
                            <FormGroup>
                                <Label>Va Number</Label>
                                <Input value={keyDetailsData.vaNumber} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup>
                                <Label>Key Name</Label>
                                <Input value={keyDetailsData.keyName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup>
                                <Label>Key Collector</Label>
                                <Input value={keyDetailsData.receiverName} disabled />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                    label={"Submitted By"}
                                    form={form}
                                    id="giverId"
                                />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup className="d-flex justify-content-center">
                                <Button color="primary" onClick={addKeyCollectionDetails}>
                                    <Check size={16} /> Save
                                </Button>
                            </FormGroup>
                        </Col>

                    </Row>

                </ModalBody>
            </Modal>

            {/* OTP Verify Modal */}
            <Modal show={otpModal} centered size="sm">

                <ModalHeader>
                    <h5>OTP Verification</h5>
                    <X onClick={() => setOtpModal(false)} />
                </ModalHeader>

                <ModalBody>

                    <Row>

                        <Col md="12">
                            <FormGroup>
                                <Label>Enter OTP</Label>
                                <Input
                                    type="text"
                                    maxLength="4"
                                    placeholder="Enter OTP"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup className="d-flex justify-content-center">
                                <Button color="success" onClick={verifyOTP}>
                                    Verify
                                </Button>
                            </FormGroup>
                        </Col>

                    </Row>

                </ModalBody>

            </Modal>
        </>
    );
};

export default KeyDistributionList;