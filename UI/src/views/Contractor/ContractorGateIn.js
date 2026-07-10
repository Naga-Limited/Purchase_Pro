import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, ChevronDown, ChevronUp, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import Uploader from "../Uploader";
import { useParams } from "react-router";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import ContractorDetails from "./ContractorDetails";
import { currentDate } from "../common/dateComponent";
import { useHistory } from "react-router-dom";

const ContractorGateIn = () => {

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [data, setData] = useState([]);
  const [contractorDetails, setContractorDetails] = useState([]);
  const [noOfPersons, setNoOfPersons] = useState('');
  const [noOfMaterial, setNoOfMaterial] = useState('');
  const [checkNoOfPersons, setCheckNoOfPersons] = useState(false);

  let { workPermitId } = useParams();
  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      incharge: validation.required({ message: "Please Enter Incharge", isObject: false }),
      supervisorPhoneNo: validation.number({ min: 10, max: 10 }),
    }),
    onSubmit() { },
  });

  const [attachedFiles, setAttachment] = useState({ idProof: {} });

  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };

  const getWorkPermitById = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getWorkPermit/${workPermitId}/${UserDetails.USERID}`);
    apiGetMethod(apiBaseUrl + `GatePro/Gate/getWorkPermit/${workPermitId}/${UserDetails.USERID}`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setData(data.results[0])
          form.setValues({
            contractorName: data.results[0].contractorName,
          })
        }
        else if (data.success == false) {
          errorToast(data.message)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const getContractorDetails = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/0/${UserDetails.USERID}/0`);
    apiGetMethod(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/0/${UserDetails.USERID}/0`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setContractorDetails(data.results)
          form.setValues({
            servicePoNo: data.results[0].servicePoNo,
            incharge: data.results[0].incharge,
            supervisorPhoneNo: data.results[0].supervisorPhoneNo,
            contractorName: data.results[0].contractorName,
          })
        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getWorkPermitById()
    getContractorDetails()
  }, [])

  const [contractPersonData, setContractPersonData] = useState([]);
  const [contractorPersonDetails, setContractorPersonDetails] = useState([]);

  const addInput = (noOfPersons) => {
    setCheckNoOfPersons(noOfPersons == '' ? true : false)
    setNoOfPersons(noOfPersons)
    const newData = [];

    for (let i = 0; i < noOfPersons; i++) {
      newData.push({
        contractPersonId: i + 1,
        personName: '',
      })
    }
    setContractPersonData(newData)
  }

  function addContractPersons(event, cell) {
    if (contractorPersonDetails.length == 0) {
      var obj
      obj = {
        contractPersonId: cell,
        personName: event,
        moduleStatusId: 1,
        userInfoId: UserDetails.USERID
      };
      contractorPersonDetails.push(obj);
    } else {
      let selectedItem
      contractorPersonDetails.forEach((item) => {
        if (item['contractPersonId'] == cell) {
          selectedItem = item
        }
      });
      if (selectedItem != undefined) {
        selectedItem['personName'] = event
      } else {
        var obj
        obj = {
          contractPersonId: cell,
          personName: event,
          moduleStatusId: 1,
          userInfoId: UserDetails.USERID
        };
        contractorPersonDetails.push(obj);
      }
    }
  }

  const [materialData, setMaterialData] = useState([]);
  const [materialDetails, setMaterialDetails] = useState([]);

  const addMaterialInput = (noOfMaterial) => {
    setNoOfMaterial(noOfMaterial)
    const newData = [];

    for (let i = 0; i < noOfMaterial; i++) {
      newData.push({
        contractMaterialDetailsId: i + 1,
        material: '',
        noOfMaterial: '',
      })
    }
    setMaterialData(newData)
  }

  function addMaterial(cell, event, noOfMaterial) {

    const newData = [];

    materialData.forEach((item, index) => {
      if (item['contractMaterialDetailsId'] == cell) {
        item['material'] = event
        item['noOfMaterial'] = noOfMaterial
      }
      newData.push(item)
    });
    setMaterialData(newData)

    if (materialDetails.length == 0) {
      var obj
      obj = {
        contractMaterialDetailsId: cell,
        material: event,
        noOfMaterial: noOfMaterial,
      };
      materialDetails.push(obj);
    } else {
      let selectedItem
      materialDetails.forEach((item) => {
        if (item['contractMaterialDetailsId'] == cell) {
          selectedItem = item
        }
      });
      if (selectedItem != undefined) {
        selectedItem['material'] = event
        selectedItem['noOfMaterial'] = noOfMaterial
      } else {
        var obj
        obj = {
          contractMaterialDetailsId: cell,
          material: event,
          noOfMaterial: noOfMaterial,
        };
        materialDetails.push(obj);
      }
    }
  }

  const addContractorDetails = (fdata) => {
    if (!form.isValid) {
      setCheckNoOfPersons(noOfPersons == '' && contractorDetails == '' ? true : false)
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    else if (noOfPersons == '' && contractorDetails == '') {
      setCheckNoOfPersons(true)
    }
    else {
      if (contractorPersonDetails.length == Number(noOfPersons) && materialDetails.length == Number(noOfMaterial)) {
        showLoader();
        setCheckNoOfPersons(true)
        console.log(apiBaseUrl + "GatePro/Gate/addContractorDetails", fdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addContractorDetails", fdata)
          .then((response) => {
            const data = response.data;
            if (data.success == true) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
              })
              form.resetForm()
              getContractorDetails()
              setNoOfPersons('')
              setContractorPersonDetails([])
              setMaterialDetails([])
              setMaterialData([])
              setContractPersonData([])
              addMaterialInput([])
              setCheckNoOfPersons(false)
              setAttachment({ idProof: {} })
            }
            else if (data.success == false) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      } else {
        let message = contractorPersonDetails.length != Number(noOfPersons) ? 'Please fill all Person Name' : materialDetails.length != Number(noOfMaterial) ? 'Please fill all Material Details' : ''
        confirmDialog({
          title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      }

    }
  }

  const upload = () => {

    let formData = form.values;

    const fdata = {
      workPermitId: data.workPermitId,
      servicePoNo: data.servicePoNo,
      contractorName: data.contractorName != '' ? data.contractorName : formData.contractorName,
      incharge: formData.incharge,
      noOfPersons: noOfPersons,
      supervisorPhoneNo: formData.supervisorPhoneNo,
      remarks: formData?.remarks != '' ? formData?.remarks : null,
      userInfoId: UserDetails.USERID,
      contractorPersonDetails: contractorPersonDetails,
      contractorMaterialDetails: materialDetails
    };

    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);

    if (keys.length > 0) {
      let postdata = new FormData();
      let { idProof } = postdata;

      postdata.append("image[]", idProof);

      let UploadFile = 0;

      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });

      UploadFile = attachedFiles.idProof && attachedFiles.idProof.name && attachedFiles.idProof.name.length ? true : false;

      postdata.append("form_name", 'Cash');
      postdata.append("SubFolder", "FG_GateOut");

      apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.idProof = data.files[0] ? data.files[0].updname : "";
            addContractorDetails(fdata)
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      addContractorDetails(fdata)
    }
  };

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>Contractor - Gate In</h5><RefreshBlock1 /></CardHeader>
        <hr />
        <CardBody>
          <Row>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Nature Of Work</Label>
                <Input type="text" placeholder="Nature Of Work" value={data?.workNature} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Date</Label>
                <Input type="text" placeholder="Date" value={currentDate()} disabled />
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
              <FormGroup>
                <Label>Service Po No</Label>
                <Input type="text" placeholder="Service Po No" value={data?.servicePoNo} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Contractor Name"} type="text" form={form} id="contractorName" disabled={data != '' ? true : false} />
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
              <FormGroup>
                <CustomTextInput label={"Incharge"} type="text" form={form} id="incharge" disabled={contractorDetails != '' ? true : false} />
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
              <FormGroup>
                <CustomTextInput label={"Supervisor Phone No"} type="text" form={form} id="supervisorPhoneNo" disabled={contractorDetails != '' ? true : false} />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <CustomTextInput label={"Remarks"} type="text" form={form} id="remarks" />
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
              <FormGroup>
                <Label>Total No of Persons</Label>
                <Input type="text" placeholder="No of Persons" onChange={(e) => addInput(e.target.value)} value={noOfPersons} />
                {checkNoOfPersons ? <Label className='text-danger'>Please Enter Total No of Person</Label> : null}
              </FormGroup>
            </Col>
            <Col sm="4" md="4">
              <FormGroup className="d-flex justify-content-start mt-2">
                <div className="mr-1">
                  <div style={{ marginBottom: "7px" }}></div>
                  <Label><b>Attachments :</b></Label>
                </div>
                <div className="mr-1">
                  <Uploader
                    setAttachment={handleFileChange}
                    title="ID Proof"
                    id={"idProof"}
                    selectedFileName={attachedFiles.idProof.name}
                  />
                </div>
              </FormGroup>
            </Col>
            {contractPersonData.map((data) => (
              <Col sm="4" md="4" key={data.contractPersonId}>
                <FormGroup>
                  <Label>Name</Label>
                  <Input type="text" placeholder="Enter Name" onChange={(e) => addContractPersons(e.target.value, data.contractPersonId)} />
                </FormGroup>
              </Col>
            ))}

            <Col md="12" sm="12"><hr></hr></Col>

            <Col md="12" sm="12">
              <h4 className="text-primary"><u>Tools Info</u></h4>
            </Col>

            <Col sm="4" md="4">
              <FormGroup className="mt-1">
                <Label>No of Tools</Label>
                <Input type="text" placeholder="No of Material" onChange={(e) => addMaterialInput(e.target.value)} value={noOfMaterial} />
              </FormGroup>
            </Col>
            <Col md="8" sm="8"></Col>

            {materialData != "" ? <>
              <Col md="12" sm="12">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <td className="bg-primary text-white text-center" width='10%'>S.No</td>
                      <td className="bg-primary text-white text-center">Material Name</td>
                      <td className="bg-primary text-white text-center" width='20%'>Material Count</td>
                    </tr>
                  </thead>
                  {materialData?.map((data) => (
                    <tbody key={data.contractMaterialDetailsId}>
                      <tr>
                        <td className='text-center'>{data.contractMaterialDetailsId}</td>
                        <td className='text-center'>
                          <Input type="text" placeholder="Enter Material Name" onChange={(e) => addMaterial(data.contractMaterialDetailsId, e.target.value, data.noOfMaterial)} />
                        </td>
                        <td className='text-center'>
                          <Input type="text" placeholder="0.00" onChange={(e) => addMaterial(data.contractMaterialDetailsId, data.material, e.target.value)} />
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </table>
                <br />
              </Col> </> : null
            }
          </Row>
          <Row>
            <Col sm="6" md="6">
              <FormGroup className="d-flex justify-content-start">
                <Button.Ripple outline color="primary" type="button" onClick={history.goBack}>
                  <ArrowLeft size={16} /> Back
                </Button.Ripple>
              </FormGroup>
            </Col>
            <Col sm="6" md="6">
              <FormGroup className="d-flex justify-content-end">
                <Button.Ripple color="primary" type="button" onClick={upload}>
                  <Check size={16} /> Gate In
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {contractorDetails != '' ? <ContractorDetails data={contractorDetails} workPermitId={workPermitId} /> : null}
    </Fragment >
  );
};

export default ContractorGateIn;
