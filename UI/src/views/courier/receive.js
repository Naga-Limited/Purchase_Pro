import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {Row,Col,Button, FormGroup, InputGroupText, Input, InputGroup, Label} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { CustomTextInput,Yup,CustomDropdownInput, validation } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import Receivelist from './receivelist';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';



function Receivescreen() {
  const history = useHistory();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
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
          courier_company_id: Yup.string().required("Courier Company Name is required"),
          entry_date: Yup.string().required("Receiving Date is required"),
          from_person: Yup.string().required("From Person is required"),
        })
      ),
    }),
    onSubmit(values) {},
  });
  const [rows, setRows] = useState([]);
  const handleAddRow = () => {
    setRows([...rows, {}]);
  };
  const handleRemoveRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.pop(); 
    setRows(updatedRows);
    form.setValues({
      ...form.values,
      [`courier_company_id_${index}`]: undefined,
      [`entry_date_${index}`]: undefined,
      [`from_person_${index}`]: undefined,
      [`bulk_count${index}`]: undefined,
    });
  };
   let { showLoader, hideLoader } = useLoader();
  const handlesubmitButtonClick = () => {
    const isAnyRowEmpty = rows.some((row, index) => {
      const courierCompanyId = form.values[`courier_company_id_${index}`];
      const entryDate = form.values[`entry_date_${index}`];
      const fromPerson = form.values[`from_person_${index}`];
      return !courierCompanyId || !entryDate || !fromPerson;
    });
    if (isAnyRowEmpty) {
      errorToast('Please fill all fields in the added rows');
      return;
    }
    const formData = form.values;
    const rowsData = rows.map((row, index) => ({
      courier_company_id: formData[`courier_company_id_${index}`],
      entry_date: formData[`entry_date_${index}`],
      from_person: formData[`from_person_${index}`],
      bulk_count:formData[`bulk_count${index}`],
    }));
    const postData = {
      employeename: formData.empname,
      empnumber: formData.empnumber,
      emp_emailid: formData.emp_emailid,
      empdiv: formData.division,
      empdep: formData.dep,
      empcode: formData.empcode,
      emp_deg:formData.emp_deg,
      courier_company_id:formData.courier_company_id?.value,
      entry_date: formData.entry_date,
      from_person: formData.from_person,
      bulk_count:formData.bulk_count,
      created_by:UserDetails.USERID,
      rows: rowsData,
    }
     console.log(postData)
    if(postData.employeename ==""||postData.employeename==undefined ){
      errorToast('Please Enter Receiver Employee Name')
        return false
    }else if(postData.courier_company_id ==""||postData.courier_company_id==undefined ){
      errorToast('Please Select Courier Company Name')
        return false
    }else if(postData.entry_date ==""||postData.entry_date==undefined ){
      errorToast('Please Enter Receving Date')
        return false
    }else if(postData.from_person ==""||postData.from_person==undefined){
      errorToast('Please Enter FromPerson Name')
      return false
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/InsertReceiveDetail", postData)
    .then((response) => {
      const { data } = response;
      console.log(response)
      if(data.success == true) {
        ShowToast("Save Successfully...");
         window.setTimeout( function() {
           window.location.reload();
         }, 2000);
       }else if (data.success == 0){
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
            emp_emailid:  data[0].emp_mail_id,
            division: data[0].emp_division,
            dep: data[0].emp_department,
            empcode:data[0].emp_code,
            emp_deg:data[0].emp_designation,
          });
       })
    }
    return(
        
    <div>
     <Fragment>
       <CardComponent header="Receive Screen">
     <h5>Employee Details</h5>  
        <Row>
        <Col md="4" sm="12">
        <CustomDropdownInput
            url={`${apiBaseUrl}CourierMaster/GetEmployeeName/${UserDetails.plantids}`}
            label={"Receive Employee Name"}
            form={form}
            id="empname"
            name="empname"
            value={form.values.empname}  
            onChange={(employeename) => {
              handleEmployeeNameChange(employeename);
        }}
      />
      </Col>
          <Col md="4" sm="12">
          <CustomTextInput label={"Mobile Number"}  id="empnumber" name="empnumber" form={form}  disabled   type="text" 
            />
          </Col>
          <Col md="4" sm="12"> 
          <CustomTextInput label={"E-mail id"}  id="emp_emailid" name="emp_emailid" form={form}  disabled  type="email" /></Col>
        </Row>
        <Row>
          <Col md="3" sm="12">
            <CustomTextInput label={"Division"}  id="division" name="division" form={form} disabled  type="text" />
          </Col>
          <Col  md="3" sm="12">
            <CustomTextInput label={"Department"}  id="dep" name="dep" form={form} disabled type="text" />
          </Col>
          <Col md="3" sm="12"> 
            <CustomTextInput label={"Employee Code"}  id="empcode" name="empcode" form={form}  disabled type="text" />
          </Col>
          <Col md="3" sm="12"> 
            <CustomTextInput label={"Designation"}  id="emp_deg" name="emp_deg" form={form}  disabled type="text" />
          </Col>
        </Row>
        <HrLine />
        <header>
          <h5>Courier Details</h5>
        </header>
        <br></br>
        <Row>
          <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}CourierMaster/getCourierCompanyid`} label={"Courier Company Name"} form={form} id="courier_company_id" name="courier_company_id" />
          </Col>
          <Col md="3" sm="12">
           <CustomTextInput label={"Receving Date"} form={form} id="entry_date" name="entry_date"  type="date"   //value={todayDate}
             max={new Date().toISOString().slice(0, 10)}   />
          </Col>
          <Col md="3" sm="12">
           <CustomTextInput label={"From Person Name"}  id="from_person" name="from_person" form={form}  type="text" />
          </Col>
           <Col md="3" sm="12">
           <CustomTextInput label={"Bulk Count"}  id="bulk_count" name="bulk_count" form={form}  type="text" />
          </Col>
          <br />
          <Col sm="12">
          <FormGroup className="d-flex mb-0 justify-content-end">
              {(form.values.courier_company_id &&
                form.values.entry_date &&
                form.values.from_person &&
                rows.length === 0) && (
                  <Button.Ripple
                    color="primary"
                    id="add"
                    type="button"
                    onClick={handleAddRow}
                  >
                    Add
                  </Button.Ripple>
                )}
           </FormGroup>
        </Col>
        </Row>
           <div>
                  {rows.map((row, index) => (
          <div key={index} className="row">
            <div className="col-md-3">
              <CustomDropdownInput
                url={`${apiBaseUrl}CourierMaster/getCourierCompanyid`}
                label="Courier Company Name"
                form={form}
                id={`courier_company_id_${index}`}
              />
            </div>
            <div className="col-md-3">
              <CustomTextInput
                label="Receiving Date"
                form={form}
                id={`entry_date_${index}`}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                />
            </div>
            <div className="col-md-3">
              <CustomTextInput
                label="From Person"
                form={form}
                id={`from_person_${index}`}
                type="text"
              />
            </div>
            <Col md="3" sm="12">
           <CustomTextInput label={"Bulk Count"}  
           id= {`bulk_count${index}`}
           name={`bulk_count${index}`} 
           form={form}  
           type="text" 
          />
          </Col>
            <Col  sm="12">
              <br></br>
              <FormGroup className="d-flex mb-0 justify-content-end">
                {index === rows.length - 1 &&  (
                  <Button.Ripple
                    color="danger"
                    onClick={() => handleRemoveRow(rows.length - 1)}
                  >
                    Remove
                  </Button.Ripple>
                )}
              </FormGroup>
            </Col>
          </div>
        ))}
        <br></br>
        {(form.values.courier_company_id &&
                form.values.entry_date &&
                form.values.from_person &&
                 rows.length > 0 )&& 
       (
          <FormGroup className="d-flex mb-0 justify-content-end">
            <Button.Ripple
              color="primary"
              type="button"
              onClick={handleAddRow}
              disabled={Object.values(form.errors).some((error) => !!error)}
            >
              Add
            </Button.Ripple>
          </FormGroup>
        )}
      </div>
     <br></br>
     <br></br>
          <br></br> 
         <Col sm="12">
           <FormGroup className="d-flex mb-0 justify-content-end">
             <Button.Ripple color="primary" type="submit"  onClick={handlesubmitButtonClick} >
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


export default Receivescreen;
                                                                                              