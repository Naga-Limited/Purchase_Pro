import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBase, apiBaseUrl, sapFileShare, uploadUrl } from '../../urlConstants';
import TableComponent from "../common/TableComponent";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import Uploader from "../Uploader";

export const taColumns = [
  {
    name: "Unique Number",
    selector: "dr_unique_no",
    sortable: true,
    minWidth: "170px",
  },{
    name: "Reference Number",
    selector: "reference_number",
    sortable: true,
    minWidth: "30px",
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
  },{
    name: "Sending Date",
    selector: "sending_date",
    sortable: true,
    minWidth: "80px",
  },{
    name: "To Person Name",
    selector: "to_person_name",
    sortable: true,
    minWidth: "80px",
  },{
    name: "To Person Address",
    selector: "to_person_address",
    sortable: true,
    minWidth: "80px",
  },
];

const Consignmentnumber = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [chckid, setchckid] = useState('');
  const [field1, setField1] = useState('');
  const [field3, setField3] = useState('');
  const [field4, setField4] = useState('');
   const [invoicename, setinvoicename] = useState('');
  const [file, setFile] = useState(null); // Store the selected file
  const [fileError, setFileError] = useState(''); // Store file upload error
  const [clickedRows, setClickedRows] = useState([]); 
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

  useEffect(() => {
    // Load data when component mounts
    callgetotpdata();
  }, []);

  const callgetotpdata = (row) => {
  

    apiPostMethod(apiBaseUrl + `CourierMaster/getSender/${UserDetails.plantids}`)
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
    setModalOpen(!modalOpen);
    setchckid(row.dispatch_det_id);
  };

  const handleFileChange = (file, id) => {
    // Convert the file name to lowercase
    const lowerCaseFileName = file.name.toLowerCase();
    const lowerCaseFile = new File([file], lowerCaseFileName, { type: file.type });

    setFile(lowerCaseFile);
    setFileError('');
  };

  const handleSaveButtonClick = () => {
    if (fileError) {
      return;
    }

    const formData = form.values;
    const postdata = {
      chckid: chckid,
      consignmentnumber: field1,
      courier_company_id: formData.courier_company_id?.value,
      courierweight: field3,
      courieramount: field4,
    };

    // Check if all required fields are filled
    if (!formData.courier_company_id?.value || !field1 || !field3 || !field4) {
      errorToast('Please fill all the fields');
      return;
    }

    const uploadFile = async () => {
      if (!file) {
        postdata.Invoicecopy = '';
        Submit(postdata);
        return;
      }

      let uploadData = new FormData();
      uploadData.append("form_name", "Courier");
      uploadData.append("ponumber", "pod_copy");
      uploadData.append("VA_Number", "001");
      uploadData.append("SubFolder", "Courier_Dispatch");
      uploadData.append("file[]", file);

      apiPostMethod(sapFileShare, uploadData, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            const invoiceCopy = data.files[0] ? data.files[0].updname : "";
            setinvoicename(invoiceCopy);
            postdata.Invoicecopy = invoiceCopy; // Add invoiceCopy to the payload
            Submit(postdata);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    };

    const Submit = (postdata) => {
      apiPostMethod(apiBaseUrl +"CourierMaster/Insertconsignmentnumber", postdata)
        .then((response) => {
          const { data } = response;
          if (data.success === true) {
            ShowToast("Save Successfully...");
            window.setTimeout(function () {
              window.location.reload();
            }, 2000);
          } else if (data.success === false) {
            errorToast(data.error);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => {
          hideLoader();
          toggleModal();
        });
    };

    showLoader();
    uploadFile()
      .then(postdata)
      .catch(() => hideLoader());
  };

  const handleAddButtonClick = (row) => {
    toggleModal(row);
    setClickedRows([...clickedRows, row.dispatch_det_id]); // Add clicked row ID to the list
  };

  const handleDelete = (row) => {
    const postdata = {
      id: row.cr_dispatch_id
    };

    apiPostMethod(apiBaseUrl + "CourierMaster/changeStatusforsend", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success === 1) {
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

  let { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [attachedFiles, setAttachment] = useState({ invoice_attachment: {} });
  
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "220px",
    cell: (row) => {
      const tworoles = ['DTDC', 'PROFESSIONAL'];
      const Editshow = !tworoles.includes(UserDetails.role);
    
      return (
        <>
          {row.consignment_number === null ? (
          <Button.Ripple
            color="primary"
            onClick={() => handleAddButtonClick(row)}
          >
            {"ADD"}
          </Button.Ripple>
          ) : null}&nbsp;
          {Editshow && (
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                history.push(`/consignmentnumberentry:${row.dispatch_det_id}`);
              }}
            >
              {"Edit"}
            </Button.Ripple>
          )}&nbsp;
          {Editshow && (
          <Button.Ripple
            color="danger"
            onClick={(e) => {
             handleDelete(row);
            }}
          >
            {"Delete"}
          </Button.Ripple>
          )}&nbsp;
        </>
      );
    },
  };

  const columns = [...taColumns, actionsCol];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Consignment Number Entry</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns}  formType="getSender" data={data} />
        </CardBody>
      </Card>
      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Consignment Number Entry</ModalHeader>
        <ModalBody>
          <FormGroup>
            <CustomDropdownInput
              url={`${apiBaseUrl}CourierMaster/getCourierCompanyid/${UserDetails.role}`}
              label="Courier Company Name"
              form={form}
              id={`courier_company_id`}
            />
          </FormGroup>
          <FormGroup>
            <Label for="field1">Consignment Number:</Label>
            <Input
              type="text"
              id="field1"
              value={field1}
              onChange={(e) => setField1(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="field3">Courier Weight:</Label>
            <Input
              type="text"
              id="field3"
              value={field3}
              onChange={(e) => setField3(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="field4">Courier Amount:</Label>
            <NumberOnlyInput
              id="field4"
              value={field4}
              onChange={(e) => setField4(e.target.value)}
            />
          </FormGroup>
          <Col md="3" >
            <br></br>
              <Uploader
                // isReadOnly={!attachedFiles.invoice_attachment.name}
                // canEdit={!isReadOnly}
                setAttachment={handleFileChange}
                 form={form}
                label={"POD Attachment"}
                title="Pdf"
                id={"invoice_attachment"}
                selectedFileName={attachedFiles.invoice_attachment.name}
              />
             
            </Col>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveButtonClick}>Save</Button>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Consignmentnumber;
