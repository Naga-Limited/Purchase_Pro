import React, { useEffect, useState } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, FormGroup, Label, Row, Input
} from 'reactstrap';
import {
  CustomDropdownInput, CustomTextInput, CustomTextInputMail, Yup, validation
} from '../forms/custom-form';
import { useFormik } from 'formik';
import { apiBaseUrl } from '../../urlConstants';
import { Check, Upload } from 'react-feather';
import { useLoader } from '../../utility/hooks/useLoader';
import { useSelector } from 'react-redux';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import { ShowToast, errorToast } from '../../helper/appHelper';
import ReactSelect from 'react-select';
import EmployeeList from '../List/EmployeeList';
import * as XLSX from 'xlsx';

const AddEmployeeDetails = () => {
  const { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const [departmentData, setDepartmentData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [divisionData, setDivisionData] = useState([]);
  const [departmentId, setDepartmentId] = useState([]);
  const [designationId, setDesignationId] = useState([]);
  const [divisionId, setDivisionId] = useState([]);
  const [checkDepartment, setCheckDepartment] = useState(false);
  const [checkDesignation, setCheckDesignation] = useState(false);
  const [checkDivision, setCheckDivision] = useState(false);
  const [data, setData] = useState();

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

  const selectDepartment = (e) => {
    setCheckDepartment(e.value === '' ? true : false);
    setDepartmentId(e);
  };

  const selectDesignation = (e) => {
    setCheckDesignation(e.value === '' ? true : false);
    setDesignationId(e);
  };

  const selectDivision = (e) => {
    setCheckDivision(e.value === '' ? true : false);
    setDivisionId(e);
  };

  const addEmployeeDetails = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;

    const FrmData = {
      employeeCode: formData.employeeCode,
      employeeName: formData.employeeName,
      employeeMailId: formData.employeeMailId,
      employeeMobileNumber: formData.employeeMobileNumber,
      employeeDepartment: departmentId?.label,
      employeeDesignation: designationId?.label,
      employeeDivision: divisionId?.label,
      plantCode: formData.masterPlantId.WERKS,
      userInfoId: UserDetails.USERID,
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "GatePro/Master/addEmployeeDetails", FrmData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast(data.message);
          form.resetForm();
          getEmployeeDetails();
          setDepartmentId([]);
          setDesignationId([]);
          setDivisionId([]);
        } else {
          errorToast(data.message);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  };

  const getEmployeeDetails = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        if (data.success >= 1) {
          setData(data.results);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const getDepartment = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/8`)
      .then((response) => {
        const data = response.data;
        if (data.success) setDepartmentData(data.results);
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong");
      });
  };

  const getDesignation = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/9`)
      .then((response) => {
        const data = response.data;
        if (data.success) setDesignationData(data.results);
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong");
      });
  };

  const getDivision = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/10`)
      .then((response) => {
        const data = response.data;
        if (data.success) setDivisionData(data.results);
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong");
      });
  };

  useEffect(() => {
    getEmployeeDetails();
    getDepartment();
    getDesignation();
    getDivision();
  }, []);

  // 🔽 Excel Upload Handler
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
      const allowedPlantCodes = UserDetails.plantids || [];
      const isAdmin = UserDetails.USERID == 1;
  
      const employees = [];
      const errors = [];
  
      jsonData.forEach((row, index) => {
        const designationRaw = (row["Designation"] || '').toString().trim();
        const emp = {
          employeeCode: row["Employee Code"],
          employeeName: row["Employee Name"],
          employeeMailId: row["Email"] || '',
          employeeMobileNumber: row["Mobile"] || '',
          employeeDepartment: row["Department"],
          employeeDesignation: designationRaw,
          employeeDivision: row["Division"],
          plantCode: row["Plant Code"],
          emp_status: row["Status"],
          userInfoId: UserDetails.USERID,
        };
  
        const missingFields = [];
  
        if (!emp.employeeCode) missingFields.push("Employee Code");
        if (!emp.employeeName) missingFields.push("Employee Name");
        if (!emp.employeeDepartment) missingFields.push("Department");
        if (!emp.employeeDesignation) missingFields.push("Designation");
        if (!emp.employeeDivision) missingFields.push("Division");
        if (!emp.plantCode) missingFields.push("Plant Code");
        if (!emp.emp_status) missingFields.push("Status");
  
        if (missingFields.length > 0) {
          errors.push(`Row ${index + 2}: Missing ${missingFields.join(', ')}`);
          return;
        }
        if (emp.employeeDesignation.toUpperCase() !== 'DR') {
          errors.push(`Row ${index + 2}: Designation "${emp.employeeDesignation}" not allowed. Only "DR" is permitted.`);
          return;
        }
        if (!isAdmin && !allowedPlantCodes.includes(emp.plantCode)) {
          errors.push(`Row ${index + 2}: Plant Code "${emp.plantCode}" not allowed`);
          return;
        }
  
        employees.push(emp);
      });
  
      if (errors.length > 0) {
        errorToast(errors.join('\n'));
        return;
      }
  
      showLoader();
      apiPostMethod(apiBaseUrl + "FoodTeaTokenController/addEmployeeDetails", { employees })
        .then(res => {
          const { data } = res;
          if (data.success) {
            ShowToast(data.message);
            getEmployeeDetails();
          } else {
            errorToast(data.message);
          }
        })
        .catch(err => {
          console.log(err);
          errorToast("Upload failed");
        })
        .finally(() => hideLoader());
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  

  // 🔽 Download Excel Template
  const downloadExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      {
        "Employee Code": "",
        "Employee Name": "",
        "Email": "",
        "Mobile": "",
        "Department": "",
        "Designation": "",
        "Division": "",
        "Plant Code": "",
        "Status":''
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Employee_Import_Template.xlsx");
  };

  return (
    <>
      <Card>
        <CardHeader><h5>Add Employee Details</h5></CardHeader>
        <hr />
        <CardBody>
        <Row className="align-items-end">
            <Col md="4"></Col>

            <Col md="4">
                <Label className="form-label text-primary" style={{ fontWeight: 'bold' }}>Upload Excel</Label>
                <Input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleExcelUpload}
                bsSize="sm" // Large size input
                className="border-primary"
                style={{ padding: '10px', borderWidth: '2px' }}
                />
            </Col>

            <Col md="4">
                <Button.Ripple
                color="primary"
                size="sm"
                className="mt-2"
                onClick={downloadExcelTemplate}
                >
                Download Template
                </Button.Ripple>
            </Col>
            </Row>
            <br />
            <Row>
            <Col md="4"><CustomTextInput label="Employee Code" type="text" id="employeeCode" form={form} /></Col>
            <Col md="4"><CustomTextInput label="Employee Name" type="text" id="employeeName" form={form} /></Col>
            <Col md="4"><CustomTextInputMail label="Mail ID" form={form} id="employeeMailId" type="text" /></Col>
            <Col md="4"><CustomTextInput label="Mobile Number" type="text" id="employeeMobileNumber" form={form} /></Col>

            <Col md="4">
              <FormGroup>
                <Label>Department</Label>
                <ReactSelect options={departmentData} value={departmentId} onChange={selectDepartment} />
                {checkDepartment && <Label className='text-danger'>Please Select Department</Label>}
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Designation</Label>
                <ReactSelect options={designationData} value={designationId} onChange={selectDesignation} />
                {checkDesignation && <Label className='text-danger'>Please Select Designation</Label>}
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Division</Label>
                <ReactSelect options={divisionData} value={divisionId} onChange={selectDivision} />
                {checkDivision && <Label className='text-danger'>Please Select Division</Label>}
              </FormGroup>
            </Col>
            <Col md="4">
              <CustomDropdownInput url={`${apiBaseUrl}GatePro/Master/getUserPlant/${UserDetails.USERID}`} label="Plant" form={form} id="masterPlantId" />
            </Col>
            <Col md="4">
              <label>&nbsp;</label>
              <FormGroup>
                <Button.Ripple color="primary" type="button" onClick={addEmployeeDetails}><Check size={16} /> Submit</Button.Ripple>
              </FormGroup>
            </Col>
            
          </Row>

        </CardBody>
      </Card>

      <EmployeeList data={data} getEmployeeDetails={getEmployeeDetails} showDownload/>
    </>
  );
};

export default AddEmployeeDetails;
