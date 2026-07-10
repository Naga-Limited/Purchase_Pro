import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Row, Col, Button, FormGroup,
    CardTitle, CardBody, Card, CardHeader,
} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomDropdownInput, Yup } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import TableComponent from '../common/TableComponent';
import confirmDialog from "../../@core/components/confirm/confirmDialog";

// ─── Table columns ────────────────────────────────────────────────────────────

export const accessColumns = [
    {
        name: "User ID",
        selector: "LOGIN_ID",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "Sub Groceries Type",
        selector: "groceries_name",
        sortable: true,
        minWidth: "180px",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

function SubGroceriesTypeAccess() {
    const [accessData, setAccessData] = useState([]);
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => state?.auth?.userData || {});

    useEffect(() => {
        fetchAccessList();
    }, []);

    const fetchAccessList = () => {
        apiPostMethod(apiBaseUrl + 'MarketRateCD/MrtRateController/getSubGroceriesAccessList')
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    setAccessData(data.results);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast('Something went wrong while loading access list.'));
    };

    // ─── Formik ───────────────────────────────────────────────────────────────
    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            user_id: '',
            sub_groceries_id: '',
            State: '',
            District: '',
            City: '',
        },
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    // When user_id changes, reset the second dropdown
    useEffect(() => {
        form.setFieldValue('sub_groceries_id', '');
    }, [form.values.user_id]);

    useEffect(() => {
        form.setFieldValue('District', '');
        form.setFieldValue('City', '');
    }, [form.values.State]);

    useEffect(() => {
        form.setFieldValue('City', '');
    }, [form.values.District]);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        const { user_id, sub_groceries_id } = form.values;

        if (!user_id) {
            errorToast("Please select a User ID.");
            return;
        }

        if (!sub_groceries_id) {
            errorToast("Please select a Sub Groceries Type.");
            return;
        }

        if (!form.values.State) {
            errorToast("Please select State.");
            return;
        }

        if (!form.values.District) {
            errorToast("Please select District.");
            return;
        }

        if (!form.values.City) {
            errorToast("Please select City.");
            return;
        }

        const postData = {
            user_id: form.values.user_id.value,
            sub_groceries_id: form.values.sub_groceries_id.value,
            state_id: form.values.State?.value ,
            district_id: form.values.District?.value ,
            city_id: form.values.City?.value ,
            created_by: UserDetails.USERID,
        };

        showLoader();

        apiPostMethod(
            apiBaseUrl + "MarketRateCD/MrtRateController/saveSubGroceriesAccess",
            postData
        )
            .then((response) => {
                const { data } = response;

                if (data.success == 1 || data.success == true) {

                    confirmDialog({
                        title: `<h5><strong class="text-white">Access Granted Successfully</strong></h5>`,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: "#51A351"
                    }).then(() => {
                        form.resetForm();
                        fetchAccessList();
                    });

                } else {

                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.error}</strong></h5>`,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: "#f50e0a"
                    });

                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again later.");
            })
            .finally(() => {
                hideLoader();
            });
    };
    // ─── Status toggle ────────────────────────────────────────────────────────
    const handleStatusChange = (row) => {

        const actionText = row.status == 1 ? "Inactive" : "Active";

        confirmDialog({
            title: `Are you sure want to ${actionText} this access?`,
            description: `${actionText} Sub Groceries Access`
        }).then((res) => {

            if (res) {

                const postData = {
                    access_id: row.id,
                    status: row.status,
                    updatedby: UserDetails.USERID,
                };

                showLoader();

                apiPostMethod(
                    apiBaseUrl + "MarketRateCD/MrtRateController/updateSubGroceriesAccess",
                    postData
                )
                    .then((response) => {
                        const { data } = response;

                        if (data.success == 1 || data.success == true) {

                            confirmDialog({
                                title: `<h5><strong class="text-white">${data.message || `${actionText} Successfully`}</strong></h5>`,
                                cancelButton: false,
                                confirmText: false,
                                confirmButton: false,
                                background: "#51A351"
                            }).then(() => {
                                fetchAccessList();
                            });

                        } else {

                            confirmDialog({
                                title: `<h5><strong class="text-white">${data.error || "Something went wrong"}</strong></h5>`,
                                cancelButton: false,
                                confirmText: false,
                                confirmButton: false,
                                background: "#f50e0a"
                            });

                        }
                    })
                    .catch(() => {

                        confirmDialog({
                            title: `<h5><strong class="text-white">Something went wrong, please try again later.</strong></h5>`,
                            cancelButton: false,
                            confirmText: false,
                            confirmButton: false,
                            background: "#f50e0a"
                        });

                    })
                    .finally(() => {
                        hideLoader();
                    });

            }
        });
    };

    const actionsCol = {
        name: "Actions",
        selector: "Actions",
        minWidth: "150px",
        cell: (row) => (
            <div className="d-flex gap-1">

                {row.status == 0 ? (
                    <Button.Ripple
                        color="danger"
                        size="sm"
                        onClick={() => handleStatusChange(row)}
                    >
                        Inactive
                    </Button.Ripple>
                ) : (
                    <Button.Ripple
                        color="success"
                        size="sm"
                        onClick={() => handleStatusChange(row)}
                    >
                        Active
                    </Button.Ripple>
                )}

            </div>
        ),
    };

    const columns = [...accessColumns, actionsCol];

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <Fragment>
                <CardComponent header="Sub Groceries Type Access">
                    <Row>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                label="User ID"
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getUserList`}
                                name="user_id"
                                id="user_id"
                                form={form}
                            />
                        </Col>

                        {form.values.user_id && (
                            <Col md="4" sm="12">
                                <CustomDropdownInput
                                    label="Sub Groceries Type"
                                    url={`${apiBaseUrl}MarketRateCD/MrtRateController/getSubGroceriesTypeList`}
                                    name="sub_groceries_id"
                                    id="sub_groceries_id"
                                    form={form}
                                />
                            </Col>
                        )}

                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                                label="State"
                                id="State"
                                name="State"
                                form={form}
                                onChange={(selected) => {
                                    form.setFieldValue("State", selected);
                                    form.setFieldValue("District", "");
                                    form.setFieldValue("City", "");
                                }}
                            />
                        </Col>

                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={
                                    form.values.State?.value
                                        ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${form.values.State.value}`
                                        : ""
                                }
                                label="District"
                                id="District"
                                name="District"
                                form={form}
                                isDisabled={!form.values.State?.value}
                                onChange={(selected) => {
                                    form.setFieldValue("District", selected);
                                    form.setFieldValue("City", "");
                                }}
                            />
                        </Col>

                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={
                                    form.values.District?.value
                                        ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${form.values.District.value}`
                                        : ""
                                }
                                label="City"
                                id="City"
                                name="City"
                                form={form}
                                isDisabled={!form.values.District?.value}
                                onChange={(selected) => {
                                    form.setFieldValue("City", selected);
                                }}
                            />
                        </Col>
                    </Row>

                    <Col sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end mt-2">
                            <Button.Ripple color="primary" onClick={handleSubmit}>
                                Grant Access
                            </Button.Ripple>
                        </FormGroup>
                    </Col>

                    <HrLine />
                </CardComponent>
            </Fragment>

            {/* Access list table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sub Groceries Type Access Details</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={accessData} />
                </CardBody>
            </Card>
        </div>
    );
}

export default SubGroceriesTypeAccess;