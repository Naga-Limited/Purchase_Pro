import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useLoader } from '../../utility/hooks/useLoader';
import { errorToast, ShowToast } from '../../helper/appHelper';
import TableComponent from "../common/TableComponent";
import { DatePicker } from "../forms/custom-datetime";
import { apiPostMethod } from '../../helper/axiosHelper';
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import { apiBaseUrl } from '../../urlConstants';
import { useSelector } from "react-redux";

export const taColumns = [
    {
        name: "S.no",
        selector: "ct_id",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Unique Number",
        selector: "ct_unique_number",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Shift",
        selector: "definitionsName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Canteen Token Count",
        selector: "token_count",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Remarks",
        selector: "remarks",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Date",
        selector: "created_at",
        sortable: true,
        minWidth: "100px",
    },
];

const Receivereportlist = ({ title, url, actionRendorer }) => {
    const [tableData, setTableData] = useState([]);
    const { showLoader, hideLoader } = useLoader();
    const [modalOpenApprove, setModalOpenApprove] = useState(false);
    const [modalOpenReject, setModalOpenReject] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [remarks, setRemarks] = useState("");

    // Function to handle clicking the approve button
    const handleApproveClick = (row) => {
        setSelectedRow(row);
        setModalOpenApprove(true);
    };

    // Function to handle clicking the reject button
    const handleRejectClick = (row) => {
        setSelectedRow(row);
        setModalOpenReject(true);
    };

    // Function to load table data
    const loadTableData = async (fromDate, shift) => {
        showLoader();
        const postData = {
            fromDate,
            shift
        };
    
        try {
            const response = await apiPostMethod(apiBaseUrl + "Canteentokeencontroller/getcantentokendetailbydata", postData);
            const { data } = response;
            if (data.success === 1) {
                if (data.results.length === 0) {
                    errorToast("No data found for the selected criteria.");
                } else {
                    setTableData(data.results);
                }
            } else {
                errorToast("Failed to load data, please try again.");
            }
        } catch (error) {
            errorToast("Something went wrong, please try again later");
        } finally {
            hideLoader();
        }
    };

    // Handle Filter button click
    const handleFilter = () => {
        const values = form.values;
        const fromDate = values.FromDate;
        const shift = values.Shift?.value;

        loadTableData(fromDate, shift);
    };

    // Handle Approve action
    const handleApprove = async () => {
        const postData = {
            id: selectedRow.ct_id,  
            remarks: form.values.ApproveRemarks, 
            approved_by: UserDetails.USERID
                
        };
        if(postData.remarks ==""||postData.remarks==undefined ){
            errorToast('Please Enter Remarks');
            return;
        }

        try {
            const response = await apiPostMethod(apiBaseUrl + "Canteentokeencontroller/updatestatus", postData);

            if (response.data.success === 1) {
                ShowToast("Entry was  Approved");
                loadTableData(); // Refresh the table after approval
            } else {
                errorToast("Failed to update status, please try again");
            }
        } catch (error) {
            errorToast("Something went wrong while approving, please try again later");
        } finally {
            setModalOpenApprove(false); // Close the approve modal
            setRemarks(""); // Clear the remarks field
        }
    };

    // Handle Reject action
    const handleReject = async () => {
        const postData = {
            id: selectedRow.ct_id,  
            remarks: form.values.RejectRemarks, 
            rejected_by: UserDetails.USERID
        };
        if(postData.remarks ==""||postData.remarks==undefined ){
            errorToast('Please Enter Remarks');
            return;
        }

        try {
            const response = await apiPostMethod(apiBaseUrl + "Canteentokeencontroller/updaterejectstatus", postData);

            if (response.data.success === 1) {
                ShowToast("Status updated to Rejected");
                loadTableData(); // Refresh the table after rejection
            } else {
                errorToast("Failed to update status, please try again");
            }
        } catch (error) {
            errorToast("Something went wrong while rejecting, please try again later");
        } finally {
            setModalOpenReject(false); // Close the reject modal
            setRemarks(""); // Clear the remarks field
        }
    };

    // Redux: Get user details
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    // Formik form setup
    const form = useFormik({
        initialValues: {
            FromDate: new Date().toISOString().split('T')[0], // Default to current date
            Shift: '', // Default Shift
        },
        validationSchema: Yup.object().shape({
            FromDate: Yup.date().required('From Date is required'),
        }),
        onSubmit: (values) => {
            handleFilter(); // Trigger filter on form submit
        },
    });

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "200px",
        cell: (row) => (
            <>
                <Button.Ripple color="primary" onClick={() => handleApproveClick(row)}>
                    Approve
                </Button.Ripple>
                &nbsp;
                <Button.Ripple color="danger" onClick={() => handleRejectClick(row)}>
                    Reject
                </Button.Ripple>
            </>
        ),
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Canteen Token Report</CardTitle>
                </CardHeader>
                <CardComponent>
                    <Row>
                        <Col md="3" sm="12">
                            <DatePicker label={"From Date"} form={form} id="FromDate" type="date" />
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
                        <Col md="12" sm="12">
                            <br />
                            <FormGroup className="d-flex mb-0 justify-content-end">
                                <Button.Ripple color="primary" id="filter" type="button" onClick={handleFilter}>
                                    Filter
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardComponent>
                <CardBody>
                    <TableComponent showDownload columns={columns} data={tableData} />
                </CardBody>
            </Card>

            {/* Approve Modal */}
            <Modal isOpen={modalOpenApprove} toggle={() => setModalOpenApprove(false)}>
                <ModalHeader toggle={() => setModalOpenApprove(false)}>Approve</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <CustomTextInput
                            label="Remarks"
                            form={form}
                            id="ApproveRemarks"
                            name="ApproveRemarks"
                            type="text"
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleApprove}>Approve</Button>
                    <Button color="secondary" onClick={() => setModalOpenApprove(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={modalOpenReject} toggle={() => setModalOpenReject(false)}>
                <ModalHeader toggle={() => setModalOpenReject(false)}>Reject</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <CustomTextInput
                            label="Remarks"
                            form={form}
                            id="RejectRemarks"
                            name="RejectRemarks"
                            type="text"
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={handleReject}>Reject</Button>
                    <Button color="secondary" onClick={() => setModalOpenReject(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Receivereportlist;
