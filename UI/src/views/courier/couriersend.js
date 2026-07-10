import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, InputGroupText, Input, InputGroup, Label } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput, validation } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import Receivelist from './receivelist';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { InputControl } from '../../@core/components/custom/input-control';
import DateComponent from '../common/dateComponent';




function Sendscreen() {
  const history = useHistory();
  const dateFormat = "YYYY-MM-DD";


  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(
        Yup.object().shape({

        })
      ),
    }),
    onSubmit(values) { },
  });
  const [formData, setFormaData] = useState();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    handleAddRow();
  }, []);
  const handleAddRow = () => {
    setRows([...rows, {}]);
  };
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);


  // const { qcdeviceType,  To_Person_Address } = formData;
  const onTextChange = (e, key) => {
    setFormaData({
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    });
  };
  const handleRemoveRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.pop();
    setRows(updatedRows);
    form.setValues({
      ...form.values,
      [`destination_${index}`]: undefined,
      [`sending_date_${index}`]: undefined,
      [`To_person_${index}`]: undefined,
      [`To_Person_Address_${index}`]: undefined,
    });
  };
  const today = moment().format(dateFormat);

  let { showLoader, hideLoader } = useLoader();
  const handlesubmitButtonClick = () => {
    const isAnyRowEmpty = rows.some((row, index) => {
      const destination = form.values[`destination_${index}`];
      const sending_date = form.values[`sending_date_${index}`];
      const To_person = form.values[`To_person_${index}`];
      const To_Person_Address = form.values[`To_Person_Address_${index}`];

      return !destination || !sending_date || !To_person || !To_Person_Address;
    });
    if (isAnyRowEmpty) {
      errorToast('Please fill all fields in the  rows');
      return;
    }
    const formData = form.values;

    const rowsData = rows.map((row, index) => ({
      destination: formData[`destination_${index}`],
      sending_date: formData[`sending_date_${index}`],
      To_person: formData[`To_person_${index}`],
      To_Person_Address: formData[`To_Person_Address_${index}`],
    }));
    //console.log(rowsData);
    const postData = {
      employeename: formData.empname?.value,
      empnumber: formData.empnumber,
      emp_emailid: formData.emp_emailid,
      empdiv: formData.division,
      empdep: formData.dep,
      empcode: formData.empcode,
      emp_deg: formData.emp_deg,
      created_by: UserDetails.USERID,
      rows: rowsData,
      rowCount: rows.length,
      plant_code: formData.empplantcode,
    }
    // console.log(postData)
    // return false;
    if (postData.employeename == "" || postData.employeename == undefined) {
      errorToast('Please Enter Receiver Employee Name')
      return false


    }
    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/InsertSendDetail", postData)
      .then((response) => {
        const { data } = response;
        console.log(data)
        if (data.success == true) {
          ShowToast("Save Successfully...");
          window.setTimeout(function () {
            window.location.reload();
          }, 2000);
        } else if (data.success == false) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }
  const handleEmployeeNameChange = async (employeename) => {
    const postData = {
      employeename: employeename,

    };
    apiPostMethod(apiBaseUrl + "CourierMaster/getEmployeeDetails", postData)
      .then((response) => {
        const { data } = response;
        form.setValues({
          ...form.values,
          empname: employeename,
          empnumber: data[0].emp_mobile_number,
          emp_emailid: data[0].emp_mail_id,
          division: data[0].emp_division,
          dep: data[0].emp_department,
          empcode: data[0].emp_code,
          emp_deg: data[0].emp_designation,
          empplantcode: data[0].plant_code
        });
      })
  }
  const dateRestriction = DateComponent('courier')
  return (

    <div>
      <Fragment>
        <CardComponent header="Send Screen">
          <h5>Employee Details</h5>
          <Row>
            <Col md="3" sm="12">
              <CustomDropdownInput
                url={`${apiBaseUrl}CourierMaster/GetEmployeeName/${UserDetails.plantids}`}
                label={"Sender Employee Name"}
                form={form}
                id="empname"
                name="empname"
                value={form.values.empname}
                onChange={(employeename) => {
                  handleEmployeeNameChange(employeename);
                }}
              />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput label={"Mobile Number"} id="empnumber" name="empnumber" form={form} disabled type="text"
              />
            </Col><Col md="3" sm="12">
              <CustomTextInput label={"Plant Code"} id="empplantcode" name="empplantcode" form={form} disabled type="text"
              />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput label={"E-mail id"} id="emp_emailid" name="emp_emailid" form={form} disabled type="email" /></Col>
          </Row>
          <Row>
            <Col md="3" sm="12">
              <CustomTextInput label={"Division"} id="division" name="division" form={form} disabled type="text" />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput label={"Department"} id="dep" name="dep" form={form} disabled type="text" />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput label={"Employee Code"} id="empcode" name="empcode" form={form} disabled type="text" />
            </Col>
            <Col md="3" sm="12">
              <CustomTextInput label={"Designation"} id="emp_deg" name="emp_deg" form={form} disabled type="text" />
            </Col>
          </Row>
          <HrLine />
          <header>
            <h5>Courier Details</h5>
          </header>
          <br></br>
          <Row>
            {rows.map((row, index) => (
              <Row key={index}>
                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`Destination`}
                    id={`destination_${index}`}
                    name={`destination_${index}`}
                    form={form}
                    type="text"
                  />
                </Col>
                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`Sending_date`}
                    id={`sending_date_${index}`}
                    name={`sending_date_${index}`}
                    form={form}
                    type="date"
                    min={dateRestriction.min_date} 
                    max={dateRestriction.max_date}
                    />
                </Col>

                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`To_person`}
                    id={`To_person_${index}`}
                    name={`To_person_${index}`}
                    form={form}
                    type="text"
                  />
                </Col>
                <Col md="4" sm="12">
                  <CustomTextInput
                    label={"To Person Address"}
                    type="textarea"
                    id={`To_Person_Address_${index}`}
                    name={`To_Person_Address_${index}`}
                    form={form}
                  />
                </Col>
                <FormGroup className="d-flex justify-content-end align-items-end">
                  <Col md="4" sm="12">
                    {index === rows.length - 1 && (
                      <Button.Ripple
                        color="primary"
                        type="button"
                        onClick={handleAddRow}
                        disabled={Object.values(form.errors).some((error) => !!error)}
                      >
                        Add
                      </Button.Ripple>
                    )}
                  </Col>
                  <Col md="4" sm="12">
                    {index === rows.length - 1 && (
                      <Button.Ripple
                        color="danger"
                        onClick={() => handleRemoveRow(rows.length - 1)}
                      >
                        Remove
                      </Button.Ripple>
                    )}
                  </Col>
                </FormGroup>
              </Row>

            ))}
          </Row>
          <Row>
          </Row>
          <br></br>
          <Col sm="12">
            <FormGroup className="d-flex mb-0 justify-content-end">
              <Button.Ripple color="primary" type="submit" onClick={handlesubmitButtonClick} >
                Submit
              </Button.Ripple>
            </FormGroup>
          </Col>
          <HrLine />
        </CardComponent>
      </Fragment>
    </div>
  );
}


export default Sendscreen;
