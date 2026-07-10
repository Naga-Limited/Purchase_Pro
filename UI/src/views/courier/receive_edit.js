import { useFormik } from 'formik';
import React, { Fragment, useEffect,useState } from 'react';
import {Row,Col,Button, FormGroup,  Label} from 'reactstrap';
import Select from 'react-select';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { CustomTextInput,Yup,CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { useLoader } from '../../utility/hooks/useLoader';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Receiveeditscreen() {
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
  apiPostMethod(apiBaseUrl + "CourierMaster/getReceiverDetailsById", fdata)
    .then((response) => {
      const { data } = response;
      console.log(JSON.stringify(response));
      seData(data.results)

      if (data.success) {
        form.setValues({ 
          empnumber: data.results[0].emp_mobile_number,
          emp_emailid: data.results[0].emp_mail_id,
          division: data.results[0].division,
          dep: data.results[0].department,
          emp_deg:data.results[0].designation,
          empcode: data.results[0].empolyee_code,
          entry_date: data.results[0].entry_date,
          from_person: data.results[0].courier_from,
          row:data.results,
        })
        apiPostMethod(apiBaseUrl +"CourierMaster/getCourierCompanyid")
        .then((response) => {
          const { data } = response; 
          console.log(data.results);
          setCourierOptions(data.results)
        }) 
        
        form.setFieldValue('empname', {  label: data.results[0].emp_name,value:  data.results[0].emp_id });
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
const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

const handleRemoveRow = (index) => {
  const updatedRows = [...form.values.row];
  const removedRow = updatedRows.splice(index, 1)[0];
  setRemovedRows((prevRows) => [...prevRows, removedRow]); 
  form.setFieldValue('row', updatedRows);
};

const handleAddRow = () => {
  setRows([...rows, {}]);
};

const handleRemoveRows = (index) => {
  const updatedRows = [...rows];
  updatedRows.pop(); 
  setRows(updatedRows);
  form.setValues({
    ...form.values,
    [`courier_company_id${updatedRows.length}`]: '', 
    [`entry_date${updatedRows.length}`]: '', 
    [`from_person${updatedRows.length}`]: '',
    [`bulk_count${updatedRows.length}`]: '',
});

};

 const handleUpdateClick = () => {
 
  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i++) {
        const courierCompanyId = form.values[`courier_company_id${i}`];
        const entryDate = form.values[`entry_date${i}`];
        const fromPerson = form.values[`from_person${i}`];

        if (!courierCompanyId || !entryDate || !fromPerson) {
            errorToast('Please fill all fields in the newly added rows.');
            return;
        }
    }
}

  const formData = form.values;
  let bulkcount=formData.bulk_count;
    const rowsData = form.values.row.map((item, index)=> ({
      courier_company_id: formData[`courier_company_id_${index}`],
      entry_date: formData[`entry_date_${index}`],
      from_person: formData[`from_person_${index}`],
      bulk_count:formData.bulk_count,
    }));
    const formdata = form.values;
    const updatedRows = formData.row.filter((row) => row.status !== 'removed');

    const insertdata = rows.map((row, index) => ({
      courier_company_id: formdata[`courier_company_id${index}`],
      entry_date: formdata[`entry_date${index}`],
      from_person: formdata[`from_person${index}`],
      bulk_count: formdata[`bulk_count${index}`],
    }));
      const updatedData = {
        refid,
        empname:form.values.empname?.value,
        empcode: form.values.empcode,
        empnumber: form.values.empnumber,
        emp_emailid: form.values.emp_emailid,
        division: form.values.division,
        dep: form.values.dep,
        emp_deg:formData.emp_deg,
        updated_by:UserDetails.USERID,
        user_plantid:UserDetails.plantids,
        rows:updatedRows ,
        row:insertdata,
        removedRows: removedRows,

      };
      console.log(updatedData);
      showLoader();
    
      apiPostMethod(apiBaseUrl + "CourierMaster/updateReceiveDetails", updatedData)
        .then((response) => {
          const { data } = response;
          if (data.success == true) {
            ShowToast(data.message);
            history.push('/COURIER_RECEIVElist');
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
            division: data[0].emp_division,
            dep: data[0].emp_department,
            empcode:data[0].emp_code,
            emp_deg:data[0].emp_designation,
           });
        })
     }
    const handleBackButtonClick = () => {
      history.push('/COURIER_RECEIVELIST'); }
  
    const [formData, setFormData] = useState({ });
    const { ZPO_NUMBER, ZSUPPLIER_LOAD_DT, ZSUPPLIER_NAME, ZSUPPLIER_CODE, ZPO_LINE_ITEM, EDA,FNR_NO } = formData;

    const onCourierChange = (selectedCourier, index,item,items,Val) => {
      console.log(selectedCourier)
      let row = form.values.row;
      for(let i=0;i<row.length;i++){
        
      if(item == row[i].id && Val =='courier_company_id' ){
             form.values.row[i].courier_company_id=selectedCourier.value
             form.values.row[i].courier_name=selectedCourier.label
      }else if(item == row[i].id && Val =='entry_date' ){

        form.values.row[i].entry_date=selectedCourier.target.value
      }else if(item == row[i].id && Val =='from_person' ){
        form.values.row[i].courier_from=selectedCourier.target.value
      }
      else if(item == row[i].id && Val =='bulk_count' ){
        form.values.row[i].bulk_count=selectedCourier.target.value
      }
      }
      form.setValues({...form.values})
    };
   
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
    }),
    onSubmit(values) {},
  });
   const todayDate = new Date().toISOString().split('T')[0];

 
  return (
    <div>
       <CardComponent header="Receive Edit Screen">
     <Fragment>
     <h5>Employee Details</h5>  
      <Row>
        <Col md="4" sm="12">
        <CustomDropdownInput
              url={`${apiBaseUrl}CourierMaster/GetEmployeeName/${UserDetails.plantids}`}
            label={"Receive Employee Name"}
            form={form}
            id="empname"
            name="empname" 
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
          <CustomTextInput label={"E-mail id"}  id="emp_emailid" name="emp_emailid" form={form}  disabled  type="email" />
          </Col>
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
          <Col md="12" sm="12">
          <br></br>
          <FormGroup className="d-flex mb-0 justify-content-end">
            <Button.Ripple color="primary" id="add" type="button" 
            onClick={handleAddRow}
             >
                Add
            </Button.Ripple>
          </FormGroup>
          </Col>
          </Row>
          <div>
          {form.values.row?.map((item, index) => (
              <div key={item.id} className="row">
                <div className="col-md-3">
                <FormGroup>
                    <Label> Courier Company Name</Label>
                    <Select
                      options={courierOptions} 
                      id={`courier_company_id_${index}`}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label:item.courier_name, value:item.courier_company_id }}
                      onChange={(selectedCourier) => onCourierChange(selectedCourier, index,item.id,item,"courier_company_id")}
                    />
                  </FormGroup>
                </div>
                <div className="col-md-3">
                  <CustomTextInput
                    label="Receiving Date"
                    form={form}
                    id={`entry_date_${index}`}
                    name={`entry_date_${index}`}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index,item.id,item,"entry_date")}
                    type="date"
                    max={todayDate}
                    value={item.entry_date}
                  />
                </div>
                <div className="col-md-3">
                  <CustomTextInput
                    label="From Person"
                    form={form}
                    id={`from_person_${index}`}
                    name={`from_person_${index}`}
                    onChange={(selectedCourier) => onCourierChange(selectedCourier, index,item.id,item,"from_person")}
                    type="text"
                    value={item.courier_from}
                  />
          </div>
          <Col md="3" sm="12">
           <CustomTextInput label={"Bulk Count"}  
           id= {`bulk_count${index}`}
           name={`bulk_count${index}`} 
           form={form}  
           type="text" 
           value={item.bulk_count}
           onChange={(selectedCourier) => onCourierChange(selectedCourier, index,item.id,item,"bulk_count")} />
          </Col>
          <Col  sm="12">
            <br></br>
            <FormGroup className="d-flex mb-0 justify-content-end">
            <Button.Ripple color="danger" onClick={() => handleRemoveRow(index)}>
              Remove
            </Button.Ripple> 
            </FormGroup>
          </Col>
        </div>
      ))} 
      </div>
        {rows.map((row, index) => (
        <div key={index} className="row">
          <div className="col-md-3" >
            <CustomDropdownInput
              url={`${apiBaseUrl}CourierMaster/getCourierCompanyid`}
              label="Courier Company Name"
              form={form}
              id={`courier_company_id${index}`}
            />
          </div>
          <div className="col-md-3">
            <CustomTextInput
              label="Receiving Date"
              form={form}
              id={`entry_date${index}`}
              type="date"
              max={todayDate}
            />
          </div>
          <div className="col-md-3">
            <CustomTextInput
              label="From Person"
              form={form}
              id={`from_person${index}`}
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
            <Button.Ripple color="danger" onClick={() => handleRemoveRows(index)}>
              Remove
            </Button.Ripple> 
            </FormGroup>
          </Col>
        </div>
      ))} 
<br></br>
      <Row>
          <Col sm="12">
           <FormGroup className="d-flex mb-0 justify-content-start">
           <Button.Ripple color="secondary" onClick={handleBackButtonClick}>
        Back
      </Button.Ripple>
      </FormGroup>
      </Col>
      <Col   sm="12">
      <FormGroup className="d-flex mb-0 justify-content-end">
             <Button.Ripple color="primary" type="submit"
               onClick={handleUpdateClick} 
             >
                Update
              </Button.Ripple>
      </FormGroup>
      </Col>
      </Row>
    </Fragment>
    </CardComponent>
    </div>
  );
};

export default Receiveeditscreen;