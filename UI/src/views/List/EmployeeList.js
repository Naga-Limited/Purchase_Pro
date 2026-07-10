import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Delete, Edit, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, CustomTextInputMail, Yup, validation } from "../forms/custom-form";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactSelect from "react-select";

export const taColumns = [
    {
        name: "Employee Code",
        selector: "emp_code",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Employee Name",
        selector: "emp_name",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Email",
        selector: "emp_mail_id",
        sortable: true,
        minWidth: "300px",
    },
    {
        name: "Mobile No",
        selector: "emp_mobile_number",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "Department",
        selector: "emp_department",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "Designation",
        selector: "emp_designation",
        sortable: true,
        minWidth: "320px",
    },
    {
        name: "Division",
        selector: "emp_division",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Plant Code",
        selector: "plant_code",
        sortable: true,
        minWidth: "150px",
    },
];

const EmployeeList = ({ url, actionRendorer, data, getEmployeeDetails }) => {
    const history = useHistory();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateEmployeeDetails(row)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                </Row>
            );
        },
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            employeeCode: validation.required({ message: "Please Enter Employee Code", isObject: false }),
            employeeName: validation.required({ message: "Please Enter Employee Name", isObject: false }),
            employeeMailId: validation.required({ message: "Please Enter E-Mail", isObject: false }),
            masterPlantId: validation.required({ message: "Please Select Plant", isObject: true }),
            employeeMobileNumber: validation.number({ min: 10, max: 10 }),
        }),
        onSubmit() { },
    });

    const [show, setShow] = useState(false);
    const [deleteEmployeeDetails, setDeleteEmployeeDetails] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const { showLoader, hideLoader } = useLoader();
    const columns = [...taColumns, actionsCol];
    const [departmentData, setDepartmentData] = useState([])
    const [checkDepartment, setCheckDepartment] = useState(false)
    const [department, setDepartment] = useState([])
    const [designationData, setDesignationData] = useState([])
    const [checkDesignation, setCheckDesignation] = useState(false)
    const [designation, setDesignation] = useState([])
    const [divisionData, setDivisionData] = useState([])
    const [checkDivision, setCheckDivision] = useState(false)
    const [division, setDivision] = useState([])

    const selectDepartment = (e) => {
        setCheckDepartment(e.value == '' ? true : false)
        setDepartment(e)
    }

    const selectDesignation = (e) => {
        setCheckDesignation(e.value == '' ? true : false)
        setDesignation(e)
    }

    const selectDivision = (e) => {
        setCheckDivision(e.value == '' ? true : false)
        setDivision(e)
    }

    const updateEmployeeDetails = (row) => {

        setShow(true)

        form.setValues({
            employeeMasterId: row.employeeMasterId,
            employeeCode: row.emp_code,
            employeeName: row.emp_name,
            employeeMailId: row.emp_mail_id,
            employeeMobileNumber: row.emp_mobile_number,
            employeeDepartment: row.emp_department,
            employeeDesignation: row.emp_designation,
            employeeDivision: row.emp_division,
            masterPlantId: { value: row.masterPlantId, label: row.plant_code },
        })

        setDepartment({ value: row.emp_department, label: row.emp_department })
        setDesignation({ value: row.emp_designation, label: row.emp_designation })
        setDivision({ value: row.emp_division, label: row.emp_division })
    };

    const onSubmit = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const FrmData = {
            employeeMasterId: formData.employeeMasterId,
            employeeCode: formData.employeeCode,
            employeeName: formData.employeeName,
            employeeMailId: formData.employeeMailId,
            employeeMobileNumber: formData.employeeMobileNumber,
            employeeDepartment: department.label,
            employeeDesignation: designation.label,
            employeeDivision: division.label,
            plantCode: formData.masterPlantId.WERKS,
            userInfoId: UserDetails.USERID
        };
        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/updateEmployeeDetails", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    setShow(false);
                    setDeleteEmployeeDetails(false);
                    getEmployeeDetails()
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(
                hideLoader()
            )
    }

    const getDepartment = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/8`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/8`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setDepartmentData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getDesignation = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/9`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/9`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setDesignationData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getDivision = () => {
        console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/10`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/10`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setDivisionData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getEmployeeDetails()
        getDepartment()
        getDesignation()
        getDivision()
    }, [])

    return (
        <div>
            <Card>
                <CardHeader>Employee List</CardHeader>
                <hr></hr>
                <CardBody>
                    <TableComponent columns={columns} data={data} showDownload/>
                </CardBody>
            </Card>

            <Modal show={show} centered size="lg">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Update Employee Details</h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={closeRemarksModal} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Modal.Body>
                    <Row>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Employee Code"} type="text" id="employeeCode" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Employee Name"} type="text" id="employeeName" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <CustomTextInputMail label={"Mail ID"} form={form} id="employeeMailId" type="text" />
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Mobile Number"} type="text" id="employeeMobileNumber" form={form} />
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Department</Label>
                                <ReactSelect
                                    options={departmentData}
                                    value={department}
                                    onChange={selectDepartment}
                                />
                                {checkDepartment ? <Label className='text-danger'>Please Select Department</Label> : null}
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Designation</Label>
                                <ReactSelect
                                    options={designationData}
                                    value={designation}
                                    onChange={selectDesignation}
                                />
                                {checkDesignation ? <Label className='text-danger'>Please Select Designation</Label> : null}
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <Label>Division</Label>
                                <ReactSelect
                                    options={divisionData}
                                    value={division}
                                    onChange={selectDivision}
                                />
                                {checkDivision ? <Label className='text-danger'>Please Select Division</Label> : null}
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Master/getMasterPlant`}
                                label={"Plant"}
                                form={form}
                                id="masterPlantId"
                            />
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup className='d-flex justify-content-center'>
                                <Button.Ripple color="primary" type="button" onClick={onSubmit}>
                                    <Edit size={16} /> Update
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EmployeeList;
