import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, CustomTextInputMail, Yup, validation } from '../forms/custom-form'
import { useFormik } from 'formik';
import { apiBaseUrl } from '../../urlConstants';
import { ArrowDown, Check } from 'react-feather';
import { useLoader } from '../../utility/hooks/useLoader';
import { useSelector } from 'react-redux';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../helper/appHelper';
import ReactSelect from 'react-select';
import FoodBillList from './FoodBillList';
import { DatePicker } from '../forms/custom-datetime';
import moment from 'moment';

const FoodTeaBillCorrection = () => {

    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [departmentData, setDepartmentData] = useState([])
    const [checkDepartment, setCheckDepartment] = useState(false)
    const [departmentId, setDepartmentId] = useState([])
    const [data, setData] = useState();
    const [designationData, setDesignationData] = useState([])
    const [checkDesignation, setCheckDesignation] = useState(false)
    const [designationId, setDesignationId] = useState([])
    const [divisionData, setDivisionData] = useState([])
    const [checkDivision, setCheckDivision] = useState(false)
    const [divisionId, setDivisionId] = useState([])

    const selectDepartment = (e) => {
        console.log(e);
        setCheckDepartment(e.value == '' ? true : false)
        setDepartmentId(e)
    }

    const selectDesignation = (e) => {
        setCheckDesignation(e.value == '' ? true : false)
        setDesignationId(e)
    }

    const selectDivision = (e) => {
        setCheckDivision(e.value == '' ? true : false)
        setDivisionId(e)
    }

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

      

    const getEmployeeDetails = (status) => {
        const formData = form.values;

        let fromDateMilliSecond = 0;
        let toDateMilliSecond = 0;

        if (formData?.date?.start) {
            const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
            fromDateMilliSecond = fromDate.getTime();
        }

        if (formData?.date?.end) {
            const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));
            toDateMilliSecond = toDate.getTime();
        }
        showLoader();
        apiGetMethod(apiBaseUrl + `FoodTeaTokenController/foodBillGet/${UserDetails.USERID > 1 ? UserDetails.plantids : 0}/${status}/${fromDateMilliSecond}/${toDateMilliSecond}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)                    
                }else{
                    setData([]) 
                    errorToast(data.message);
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
    const today = new Date();
    form.setFieldValue("date", {
        start: today,
        end: today
    });
    getEmployeeDetails(1); // Load approved by default
    getDepartment()
        getDesignation()
        getDivision()
    }, []);
    return (
        <>
            <Card>
            <CardHeader>Food Bill Approval & Report</CardHeader>
                <hr></hr>
            <CardBody>
            
                <Row>
                <Col md="4" sm="4">
                        <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                </Col>
                <Col md="2" sm="2">
                        <FormGroup className='mt-2'>
                            <Button
                                color="primary"
                                type="submit"
                                onClick={() => getEmployeeDetails(2)}
                                disabled={form.values.date == undefined ? true : false}
                            > View <ArrowDown size={16} />
                            </Button>
                        </FormGroup>
                </Col>
                </Row>
           
            <FoodBillList data={data} getEmployeeDetails={getEmployeeDetails} />
            </CardBody>
            </Card>
        </>

    )
}

export default FoodTeaBillCorrection