import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl } from '../../urlConstants';
import TableComponent from "../common/TableComponent";
import Courierlist from "../List/CourierList";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";

export const taColumns = [
  {
    name: "Unique Number",
    selector: "transcation_unique_no",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Employee Name",
    selector: "emp_name",
    sortable: true,
    minWidth: "130px",  
  },
  {
    name: "Mobile Number",
    selector: "emp_mobile_number",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Bulk Count",
    selector: "total_no_of_couriers",
    sortable: true,
    minWidth: "80px",
  },
  {
    name: "Actual / Return Count",
   // selector: "no_of_courier",
   cell: (row) => {
    return (
      <>
        <div>{row.no_of_courier+' / '+row.return_count}</div>
      </>
    );
  },
    sortable: true,
    minWidth: "80px",
  },
];

const DeliveryList = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [modal, setModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [chckid, setchckid] = useState('');
  const [receivedBySelected, setReceivedBySelected] = useState(false);
  const [email_id,setemail_id]= useState('');
  const [employeeName,setEmployeeName]=useState('');
  const [userEnteredOTP, setUserEnteredOTP] = useState('');
  const[couriercount,setcouriercount]= useState('');
  const[emp_id,setemp_id]= useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [selectedOption, setSelectedOption] = useState('inPerson');
  const [othersValue, setOthersValue] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    // Load data when component mounts
    callgetotpdata();
  }, []);

  const callgetotpdata = (row) => {
  

    apiPostMethod(apiBaseUrl + `CourierMaster/GetReceiver/${UserDetails.plantids}`)
      .then((response) => {
        const { data } = response;
        if (data.success == 1) {
        setData(data.results)
        } else {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after some time");
      });
  };
  const toggleModal = (row) => {
    console.log(row);
    setchckid(row.id);
    setMobileNumber(row.emp_mobile_number);
    setemail_id(row.emp_mail_id);
    setEmployeeName(row.emp_name);
    setcouriercount(row.no_of_courier)
    setemp_id(row.emp_id)
    setModal(!modal);
  };
  let { showLoader, hideLoader } = useLoader();

  const handleGenerateOTP = async () => {
    const formData = form.values;
    const postdata = {
      chckid: chckid,
      mobileNumber: mobileNumber,
      deliveryMethod: selectedOption,
      couriercount: couriercount,
      email_id: email_id,
      user_name: employeeName,
      received_by: formData.empname?.label,
      empnumber: formData.empnumber,
      emp_emailid:formData.emp_emailid,
     
    };
  
  apiPostMethod(apiBaseUrl + "CourierMaster/generateOTP", postdata)
        .then((response) => {
          const { data } = response;
          if (response.ok) {
          setOtp(data.OTP); 
          setModal(true);
        } else {
          console.error("Failed to generate OTP");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after some time");
      })
      .finally(() => {
        hideLoader();
      });
      setOtpGenerated(true); 
  };
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const handleVerifyOTP = async () => {
    const formData = form.values;
    const postdata = {
      refid:chckid,
      mobileNumber: mobileNumber,
      enteredOTP: userEnteredOTP,
      received_by: formData.empname?.value  ,
      deliveryMethod: selectedOption,
      emp_id:emp_id,
      remarks:formData.remarks
     
    }
    apiPostMethod(apiBaseUrl + "CourierMaster/verifyOTP", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast("OTP verified successfully");
          setModal(false);
          window.setTimeout( function() {
            window.location.reload();
          }, 2000);
        } else {
          errorToast("Invalid OTP");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
        hideLoader();
      });
  };
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
  
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const handleReceivedByChange = (value) => {
    setReceivedBySelected(!!value);
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
  
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "150px",
    cell: (row) => {
      return (
        <>
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              toggleModal(row);
            }}
          >
            {"OTP"}

         
          </Button.Ripple>&nbsp;
           <Button.Ripple
           color="primary"
           onClick={(e) => {
             history.push(`/COURIER_DELIVERY:${row.id}`);
           }}
         >
           {"View"}
           </Button.Ripple>
         
        </>
      );
    },
  };
  
  const columns = [...taColumns, actionsCol];
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Courier Delivery Report</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns}  formType="getSender" data={data} />
        </CardBody>
      </Card>
      <Modal isOpen={modal} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Verify OTP</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="employeeName">Employee Name:</Label>
            <Input
              type="text"
              id="employeeName"
              value={employeeName} 
              disabled
            />
          </FormGroup>  <FormGroup>
            <Label for="mobilenumber">Mobile Number:</Label>
            <Input
              type="text"
              id="mobilenumber"
              value={mobileNumber} 
              disabled
            />
          </FormGroup> 
          <FormGroup>
            <Label>Choose Delivery Method:</Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="deliveryMethod"
                  value="inPerson"
                  checked={selectedOption === 'inPerson'}
                  onChange={handleRadioChange}
                />
                In Person
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="deliveryMethod"
                  value="others"
                  checked={selectedOption === 'others'}
                  onChange={handleRadioChange}
                />
                Others
              </Label>
            </FormGroup>
            {selectedOption === 'others' && (
              <FormGroup>
                <Label for="otherDelivery">Received By</Label>
                <CustomDropdownInput
            url={`${apiBaseUrl}CourierMaster/GetEmployeeName/${UserDetails.plantids}`}
            form={form}
            id="empname"
            name="empname"
            value={form.values.empname}  
            onChange={(employeename) => {
              handleEmployeeNameChange(employeename);
              handleReceivedByChange(employeename)
        }}
        
      />
       <FormGroup>
            <CustomTextInput label={"Remarks"}  id="remarks" name="remarks" form={form}   type="text" />
          </FormGroup> 
              </FormGroup>
              
            )}
          </FormGroup>
         
          <FormGroup>
            <Label for="otpInput">Enter OTP:</Label>
            <Input
              type="text"
              id="otpInput"
              value={userEnteredOTP}
              onChange={(e) => setUserEnteredOTP(e.target.value)}
            />
          </FormGroup>
          
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleVerifyOTP}>
            Verify OTP  
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeliveryList;
