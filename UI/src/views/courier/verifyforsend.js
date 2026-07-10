import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input, FormGroup } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl } from '../../urlConstants';
import TableComponent from "../common/TableComponent";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { extendWith } from "lodash";

export const taColumns = [
  {
    name: "Unique Number",
    selector: "cr_unique_no",
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
    name: "No of Couriers",
    selector: "total_no_of_couriers",
    sortable: true,
    minWidth: "80px",
  },
];

const Consignmentnumber = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [data, setData] = useState([]);
  const [userEnteredOTP, setUserEnteredOTP] = useState('');
  const [chckid, setchckid] = useState('');
  const [modal, setModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = (row) => {
    console.log(row);
    setchckid(row.cr_dispatch_id);
    setModal(!modal);
  };
  // console.log(setchckid);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "150px",
    cell: (row) => (
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
          color="danger"
          onClick={() => {
            handleDelete(row);
          }}
        >
          {"Delete"}
        </Button.Ripple>
        &nbsp;
      </>
    ),
  };

  const columns = [...taColumns, actionsCol];
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    // Load data when component mounts
    callgetotpdata();
  }, []);

  const callgetotpdata = (row) => {
  

    apiPostMethod(apiBaseUrl +`CourierMaster/getSenderotp/${UserDetails.plantids}`)
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
  const handleVerifyOTP = async () => {
    if (!userEnteredOTP) {
      errorToast("Please enter OTP");
      return;
    }
    const formData = form.values;
    const postdata = {
      refid: chckid,
      enteredOTP: userEnteredOTP,
    }
    // console.log(postdata);return false;
    apiPostMethod(apiBaseUrl + "CourierMaster/verifyOTPforsend", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          ShowToast("OTP verified successfully");
          setModal(false);
          window.setTimeout(function () {
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
  const handleDelete = (row) => {
    const postdata = {
      id: row.cr_dispatch_id
    };

    apiPostMethod(apiBaseUrl + "CourierMaster/changeStatusforsend", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success == 1) {
          // const newData = data.filter(item => item.id !== row.cr_dispatch_id);
          errorToast("Deleted Successfully")
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after some time");
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
    onSubmit(values) { },
  });
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Verification for consignment</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns}  formType="getSender" data={data} />
        </CardBody>
      </Card>

   
      <Modal isOpen={modal} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Verify OTP</ModalHeader>
        <ModalBody>
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
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Consignmentnumber;
