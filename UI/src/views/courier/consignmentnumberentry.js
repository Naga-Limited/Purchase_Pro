import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { CustomTextInput, Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Uploader from '../Uploader';

function Sendeditscreen() {
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
  const history = useHistory();
  let { id } = useParams();
  let refid = '';
  if (id) {
    refid = id.replace(":", "");
  }

  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      onFetchCourierdetailsById();
    }
  }, [id]);
  const onFetchCourierdetailsById = () => {
    let fdata = {
      id: refid,
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/getSenderDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));

        if (data.success) {
          form.setValues({
            emp_name: data.results[0].emp_name,
            empnumber: data.results[0].emp_mobile_number,
            emp_emailid: data.results[0].emp_mail_id,
            division: data.results[0].emp_division,
            dep: data.results[0].emp_department,
            emp_deg: data.results[0].emp_designation,
            empcode: data.results[0].employee_code,
            entry_date: data.results[0].entry_date,
            row: data.results,

          })
        }
        form.setFieldValue('empname', { label: data.results[0].emp_name, value: data.results[0].emp_id });
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();

      });
  }
  const onCourierChange = (selectedCourier, index, item, items, Val) => {
    console.log(selectedCourier)
    let row = form.values.row;
    for (let i = 0; i < row.length; i++) {

      if (item == row[i].id && Val == 'courier_company_id') {
        form.values.row[i].courier_company_id = selectedCourier.value
        form.values.row[i].courier_name = selectedCourier.label
      } else if (item == row[i].id && Val == 'sending_date') {
        form.values.row[i].sending_date = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'To_person') {
        form.values.row[i].to_person_name = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'To_Person_Address') {
        form.values.row[i].to_person_address = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'consig_num') {
        form.values.row[i].consignment_number = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'cr_weight') {
        form.values.row[i].courier_weight = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'cr_amount') {
        form.values.row[i].courier_amount = selectedCourier.target.value
      } else if (item == row[i].id && Val == 'destination') {
        form.values.row[i].destination = selectedCourier.target.value
      }
      else if (item == row[i].id && Val == 'bulk_count') {
        form.values.row[i].bulk_count = selectedCourier.target.value
      }
    }
    form.setValues({ ...form.values })
  };
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [rows, setRows] = useState([]);
  const handleSaveButtonClick = () => {




    const formData = form.values;
    const insertdata = form.values.row.map((item, index) => ({
      consig_num: form.values[`consig_num_${index}`],
      courier_company_id: form.values[`courier_company_id_${index}`],
      cr_weight: form.values[`cr_weight_${index}`],
      cr_amount: form.values[`cr_amount_${index}`],
      destination: formData[`destination_${index}`],
      sending_date: formData[`sending_date_${index}`],
      To_person: formData[`To_person_${index}`],
      To_Person_Address: formData[`To_Person_Address_${index}`],

    }));
    const updatedRows = formData.row.filter((row) => row.status !== 'removed');
    console.log(insertdata);
    const updatedData = {
      refid,
      empname: form.values.empname?.value,
      empcode: form.values.empcode,
      empnumber: form.values.empnumber,
      emp_emailid: form.values.emp_emailid,
      division: form.values.division,
      dep: form.values.dep,
      emp_deg: formData.emp_deg,
      entry_date: formData.entry_date,
      updated_by: UserDetails.USERID,
      user_plantid: UserDetails.plantids,
      row: updatedRows,
    };
    console.log(updatedData);
    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/updatesenderdetails", updatedData)
      .then((response) => {
        const { data } = response;
        //console.log(response)
        if (data.success == true) {
          ShowToast("Save Successfully...");
          history.push('/Consignmentnumberentry');
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
        });
      })
  }
  const handleBackButtonClick = () => {
    history.push('/consignmentnumberentry');
  }

  return (

    <div>
      <Fragment>
        <CardComponent header="Sender Details - Update">
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
              <CustomTextInput label={"Mobile Number"} id="empnumber" name="empnumber" form={form} disabled type="text"
              />
            </Col>
            <Col md="4" sm="12">
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
          
          <div>
            
            {form.values.row?.map((item, index) => (

              <Row key={index}>
                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`Destination`}
                    id={`destination_${index}`}
                    name={`destination_${index}`}
                    form={form}
                    type="text"
                    value={item.destination}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "destination")}
                  />
                </Col>
                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`Sending_date`}
                    id={`sending_date_${index}`}
                    name={`sending_date_${index}`}
                    form={form}
                    type="date"
                    value={item.sending_date}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "sending_date")}
                    max={new Date().toISOString().slice(0, 10)}

                  />
                </Col>

                <Col md="3" sm="12">
                  <CustomTextInput
                    label={`To_person`}
                    id={`To_person_${index}`}
                    name={`To_person_${index}`}
                    form={form}
                    type="text"
                    value={item.to_person_name}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "To_person")}

                  />
                </Col>
                <Col md="4" sm="12">
                  <CustomTextInput
                    label={"To Person Address"}
                    type="textarea"
                    id={`To_Person_Address_${index}`}
                    name={`To_Person_Address_${index}`}
                    form={form}
                    value={item.to_person_address}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "To_Person_Address")}
                  />

                </Col>

                <Row>
                  <Col md="3" sm="12">
                    <CustomTextInput label={"Consignment Number"}
                      id={`consig_num_${index}`} name={`consig_num_${index}`} form={form} type="text" value={item.consignment_number}
                      onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "consig_num")} />

                  </Col>
                  <Col md="3" sm="12">
                    <CustomDropdownInput
                      url={`${apiBaseUrl}CourierMaster/getCourierCompanyid`}
                      label="Courier Company Name"
                      form={form}
                      id={`courier_company_id_${index}`}
                      value={{ label: item.courier_name, value: item.courier_company_id }}
                      onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "courier_company_id")}
                    />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomTextInput
                      label={"Courier weight"}
                      id={`cr_weight_${index}`}
                      name={`cr_weight_${index}`}
                      form={form}
                      type="text"
                      value={item.courier_weight}
                      onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "cr_weight")} />
                  </Col>
                  <Col md="3" sm="12">
                    <CustomTextInput
                      label={"Courier Amount"}
                      id={`cr_amount_${index}`}
                      name={`cr_amount_${index}`}
                      form={form}
                      type="text"
                      value={item.courier_amount}
                      onChange={(selectedCourier) => onCourierChange(selectedCourier, index, item.id, item, "cr_amount")} />
                  </Col>
                  <Col sm="2" md="2">
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <a target="_blank" href={item?.pod_copy_attachment}>
                                        <Button outline color="success" type="button">
                                            Invoice Copy
                                        </Button>
                                    </a>
                                </FormGroup>
                            </Col>
                    <br></br>
                </Row>
              </Row>
            ))}
          </div>
          
          <Col  sm="12">
            <FormGroup className="d-flex mb-0 justify-content-start">
              <Button.Ripple color="secondary" onClick={handleBackButtonClick}>
                Back
              </Button.Ripple>
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup className="d-flex mb-0 justify-content-end">
              <Button.Ripple color="primary" type="submit" onClick={handleSaveButtonClick}
              >
                Update
             </Button.Ripple>
            </FormGroup>
          </Col>
          <HrLine />
        </CardComponent>
      </Fragment>
    </div>
  );
}


export default Sendeditscreen;