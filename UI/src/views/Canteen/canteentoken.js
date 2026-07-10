import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, FormGroup, Row } from 'reactstrap';
import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';
import TableComponent from '../common/TableComponent';

// Define table columns
export const taColumns = [
    {
        name: "S.no",
        selector: "ct_id",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Unique Number",
        selector: "ct_unique_number",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Shift",
        selector: "shift",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Canteen Token Count",
        selector: "token_count",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Remarks",
        selector: "remarks",
        sortable: true,
        minWidth: "100px",
    }
];

const MyCanteenForm = () => {
    const history = useHistory();
    const { id } = useParams();
    let refid = id ? id.replace(":", "") : '';
    const { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState([]);

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Formik setup for the form submission
    const form = useFormik({
        initialValues: {
            date: currentDate, // Set current date in form
            tokenNumber: '',
            customerName: '',
            mealType: '',
            amount: '',
            canteentokencount: '',
            remarks: ''
        },
        onSubmit(values) {
            handleAddButtonClick(values);
        },
    });

    const UserDetails = useSelector((state) => state?.auth?.userData || {});

    const handleAddButtonClick = (formData) => {
        const postData = {
            date: formData.date, // Include date in submission
            canteentokencount: formData.canteentokencount,
            Shift: formData.Shift?.value,
            remarks: formData.remarks,
            created_by: UserDetails.USERID,
        };
        // Insert or Update logic
        if (!refid) {
            // Insert logic
            if (!postData.canteentokencount || !postData.Shift) {
                errorToast('Please fill out all fields');
                return;
            }
            showLoader();
            apiPostMethod(apiBaseUrl + "Canteentokeencontroller/insertCanteenToken", postData)
                .then((response) => {
                    const { data } = response;
                    if (data.success == true) {
                        ShowToast(data.message);
                        window.setTimeout( function() {
                            window.location.reload();
                          }, 2000);
                    } else {
                        errorToast(data.message || "Failed to save token");
                    }
                })
                .catch(() => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(hideLoader);
        } else {
            // Update logic
            const postdata = {
                Id: formData.Id,
                canteentokencount: formData.canteentokencount,
                Shift: formData.Shift?.value,
                remarks: formData.remarks,
                updated_by: UserDetails.USERID,
            };
            showLoader();
            apiPostMethod(apiBaseUrl + "Canteentokeencontroller/updateCanteenToken", postdata)
                .then((response) => {
                    const { data } = response;
                    if (data.success === true) {
                        ShowToast("Saved Successfully...");
                        history.push("/CanteenToken");
                    } else {
                        errorToast(data.ErrorMsg || "Unable to update record");
                    }
                })
                .finally(hideLoader);
        }
    };

    // Fetching current date's data for the table
    useEffect(() => {
        const fetchCurrentDateData = () => {
            showLoader();
            apiPostMethod(apiBaseUrl + 'Canteentokeencontroller/getcantentokendetail', { date: currentDate })
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        setData(data.results);
                    } else {
                        errorToast("Failed to load data");
                    }
                })
                .catch(() => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(hideLoader);
        };

        fetchCurrentDateData();
    }, [currentDate]);

    // Table columns including Edit action
    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "120px",
        cell: (row) => (
            <>
                <Button.Ripple
                    color="primary"
                    onClick={() => history.push(`/CanteenToken${row.ct_id}`)}
                >
                    EDIT
                </Button.Ripple>
                &nbsp;
            </>
        ),
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            {/* Form Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Canteen Token</CardTitle>
                </CardHeader>
                <CardBody>
                    <Fragment>
                        <Row>
                            <Col md="4" sm="12">
                                <CustomTextInput
                                    label={"Date"}
                                    form={form}
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={form.values.date}
                                    disabled
                                />
                            </Col>
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}Canteentokeencontroller/getshifts`}
                                        label={"Shift"}
                                        form={form}
                                        id="Shift"
                                        name="Shift"
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                                <CustomTextInput
                                    label="Canteen Token Count"
                                    form={form}
                                    id="canteentokencount"
                                    name="canteentokencount"
                                    type="text"
                                />
                            </Col>
                            <Col sm="4" md="4">
                                <CustomTextInput label="Remarks" form={form} id="remarks" name="remarks" type="text" />
                            </Col>
                        </Row>
                        <FormGroup className="d-flex justify-content-end">
                            <Button.Ripple color="primary" type="button" onClick={form.handleSubmit}>
                                Submit
                            </Button.Ripple>
                        </FormGroup>
                    </Fragment>
                </CardBody>
            </Card>

            {/* Table Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Date Canteen Tokens</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent
                        columns={columns}
                        data={data} // Current date data only
                    />
                </CardBody>
            </Card>
        </div>
    );
};

export default MyCanteenForm;
