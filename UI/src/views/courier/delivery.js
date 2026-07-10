import { useFormik } from 'formik';
import React, { Fragment, useEffect,useState } from 'react';
import {Row,Col,Button, FormGroup,  Label, CustomInput} from 'reactstrap';
import Select from 'react-select';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { CustomTextInput,Yup,CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import { useHistory, useParams } from 'react-router-dom';

function Rdeliveryeditscreen() {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
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
  apiPostMethod(apiBaseUrl + "CourierMaster/getReceiverDetailsById2", fdata)
    .then((response) => {
      const { data } = response;
      seData(data.results)

      if (data.success) {
        form.setValues({ 
          emp_name:data.results[0].emp_name,
          empnumber: data.results[0].emp_mobile_number,
          emp_emailid: data.results[0].emp_mail_id,
          division: data.results[0].division,
          dep: data.results[0].department,
          empcode: data.results[0].empolyee_code,
          entry_date: data.results[0].entry_date,
          from_person: data.results[0].courier_from,
          row:data.results,
        })
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
  });
  
} 
const [rows, setRows] = useState([]);
const [data, seData] = useState([]);
const [courierOptions, setCourierOptions] = useState([]);
const [removedRows, setRemovedRows] = useState([]); 
 const handleUpdateClick = () => {
  const formData = form.values;
  const countRemarks = (value) => {
    let count = 0;
    for (const key in radioValues) {
        if (radioValues[key] === value) {
            count++;
        }
    }
    return count;
};
   const updatedData = {
    refid,
    remarks: form.values.row.map((item, index) => ({
      ...item,
      redirectstatus: radioValues[index] || '',
    })),
    noRemarksCount: countRemarks('NO'), 
      };
      console.log(updatedData);
      showLoader();
      apiPostMethod(apiBaseUrl + "CourierMaster/courierSurrender", updatedData)
        .then((response) => {
          const { data } = response;
          if (data.success == true) {
            ShowToast(data.message);
            history.push('/COURIER_DELIVERY');
          } else {
            errorToast("Update failed. Please try again.");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after some time");
        })
        .finally(() => {
          hideLoader();
        });
    };
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
             division: data[0].emp_designation,
             dep: data[0].emp_department,
             empcode:data[0].emp_code,
           });
        })
     }
    const [formData, setFormData] = useState({ });
    const { ZPO_NUMBER, ZSUPPLIER_LOAD_DT, ZSUPPLIER_NAME, ZSUPPLIER_CODE, ZPO_LINE_ITEM, EDA,FNR_NO } = formData;
   
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
    }),
    onSubmit(values) {},
  });
  const [radioValues, setRadioValues] = useState({});
  const [allRadioSelected, setAllRadioSelected] = useState(false);

   
    useEffect(() => {
        const areAllRadioSelected = Object.values(radioValues).every(value => value !== undefined && value !== '');
        setAllRadioSelected(areAllRadioSelected);
    }, [radioValues]);

  const handleRadioChange = (index, value) => {
    setRadioValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };
  const handleBackButtonClick = () => {
    history.push('/COURIER_DELIVERY'); }
   const todayDate = new Date().toISOString().split('T')[0];
  return (
    <div>
       <CardComponent header="Delivery View Screen">
     <Fragment>
     <h5>Employee Details</h5>  
      <Row>
        <Col md="4" sm="12">
          <CustomTextInput label={"Receive Employee Name"}  id="emp_name" name="emp_name" form={form}  disabled   type="text" 
            />
      </Col>
          <Col md="4" sm="12">
          <CustomTextInput label={"Mobile Number"}  id="empnumber" name="empnumber" form={form}  disabled   type="text" 
            />
          </Col>
          <Col md="4" sm="12"> 
          <CustomTextInput label={"E-mail id"}  id="emp_emailid" name="emp_emailid" form={form}  disabled  type="email" />
          </Col>
        </Row>
        <HrLine />
        <header>
          <h5>Courier Details</h5>
        </header>
        <br></br>
         <div>
          {form.values.row?.map((item, index) => (
              <div key={item.id} className="row">
                <div className="col-md-3">
                    <CustomTextInput
                      label=" Courier Company Name"
                      form={form}
                      id={`courier_company_id_${index}`}
                      name={ `courier_company_id_${index}`}
                      type="text"
                      value={item.courier_name}
                      disabled
                    />
                </div>
                <div className="col-md-3">
                  <CustomTextInput
                      label="Receiving Date"
                      form={form}
                      id={`entry_date_${index}`}
                      name={`entry_date_${index}`}
                      type="date"
                      value={item.entry_date}
                      disabled
                  />
                  </div>
                  <div className="col-md-3">
                  <CustomTextInput
                      label="From Person"
                      form={form}
                      id={`from_person_${index}`}
                      name={`from_person_${index}`}
                      type="text"
                      value={item.courier_from}
                      disabled
                  />
                  </div>
                   <FormGroup key={index}>
          <Label>{`REMARKS`}</Label>
          <div>
            <CustomInput
              type="radio"
              id={`radio_yes_${index}`}
              name={`radio_group_${index}`}
              label="YES"
              onChange={() => handleRadioChange(index, 'YES')}
              checked={radioValues[index] === 'YES'}
            />
            <CustomInput
              type="radio"
              id={`radio_no_${index}`}
              name={`radio_group_${index}`}
              label="NO"
              onChange={() => handleRadioChange(index, 'NO')}
              checked={radioValues[index] === 'NO'}
            />
          </div>
        </FormGroup>
         </div>   
      ))} 
      </div>
          <Col sm="12">
           <FormGroup className="d-flex mb-0 justify-content-end">
             <Button.Ripple color="primary" type="submit"
               onClick={handleUpdateClick} 
               disabled={!allRadioSelected} 
             >
                Update
              </Button.Ripple>
             </FormGroup> 
          </Col> 
          <Col sm="12">
           <FormGroup className="d-flex mb-0 justify-content-start">
          <Button.Ripple color="secondary" onClick={handleBackButtonClick}>
        Back
      </Button.Ripple>
      </FormGroup>
      </Col>
    </Fragment>
    </CardComponent>
    </div>
  );
};

export default Rdeliveryeditscreen;