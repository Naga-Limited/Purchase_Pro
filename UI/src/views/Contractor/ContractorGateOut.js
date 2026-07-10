import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { ArrowLeft, Check } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useParams } from "react-router";
import ReactSelect from "react-select";

const ContractorGateOut = () => {

  useEffect(() => {
    getDefinitionsList()
  }, [])

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  const [contractorDetails, setContractorDetails] = useState([]);
  const [contractPersons, setContractPersons] = useState([]);
  const [contractMaterialDetails, setContractMaterialDetails] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  let { contractorDetailsId, isGateInOrOut, workPermitId } = useParams();
  let { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit() { },
  });

  const redirect = () => {
    history.goBack()
  };

  const getContractorDetails = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/${contractorDetailsId}/${UserDetails.USERID}/0`);
    apiGetMethod(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/${contractorDetailsId}/${UserDetails.USERID}/0`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setContractorDetails(data.results[0])
          let contractPersons = isGateInOrOut == 0 ? data.results[0].contractPersons.filter((data) => data.isStatusUpdated == 0) : data.results[0].contractPersons.filter((data) => data.isStatusUpdated == 1)
          setContractPersons(contractPersons)

          for (let i = 0; i < data.materialInfo.length; i++) {
            data.materialInfo[i].sno = i + 1;
          }
          setContractMaterialDetails(data.materialInfo)

          if (isGateInOrOut == 1 && contractPersons == '') {
            confirmDialog({
              title: `<h5><strong class="text-white">` + 'Contract Persons Already Gate In' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
          } else if (isGateInOrOut == 0 && contractPersons == '') {
            confirmDialog({
              title: `<h5><strong class="text-white">` + 'Contract Persons Already Gate Out' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
          }
        }
        else if (data.success == false) {
          confirmDialog({
            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getContractorDetails()
  }, [])

  const [contractPersonActivity, setContractPersonActivity] = useState([])
  const [contractPersonLength, setContractPersonLength] = useState([])

  const updateContractPersonsActivity = (cell, grade, workUpdate, dayType, reason, isGateOut, isStatusUpdated, isChecked) => {

    const newData = [];
    contractPersons.forEach((item, index) => {
      if (item['contractPersonsId'] == cell) {
        item['grade'] = grade
        item['workUpdate'] = workUpdate
        item['dayType'] = dayType
        item['reason'] = reason
        item['isGateOut'] = isGateOut
      }
      newData.push(item)
    });
    setContractPersons(newData)


    if (isChecked == true) {

      if (contractPersonLength.length == 0) {
        contractPersonLength.push(cell)
      }
      else {
        let selectedItem
        contractPersonLength.forEach((item, index) => {
          if (item == cell) {
            selectedItem = item
          }
        });
        if (selectedItem != undefined) {
          selectedItem = cell
        } else {
          contractPersonLength.push(cell)
        }
      }

      if ((contractPersonActivity.length == 0)) {
        var obj
        obj = {
          contractPersonsId: cell,
          grade: grade,
          workUpdate: workUpdate,
          dayType: dayType,
          reason: reason,
          moduleStatusId: isStatusUpdated == 1 ? 1 : 5,
          gateInBy: isGateInOrOut == 1 ? UserDetails.USERID : 0,
          approvedForGateOut: isGateInOrOut == 0 ? UserDetails.USERID : 0,
        };
        contractPersonActivity.push(obj);
      }

      else if ((contractPersonActivity.length > 0)) {
        let selectedItem
        contractPersonActivity.forEach((item, index) => {
          if (item['contractPersonsId'] == cell) {
            selectedItem = item
          }
        });
        if (selectedItem != undefined) {
          selectedItem['grade'] = grade
          selectedItem['workUpdate'] = workUpdate
          selectedItem['dayType'] = dayType
          selectedItem['reason'] = reason
        } else {
          var obj
          obj = {
            contractPersonsId: cell,
            grade: grade,
            workUpdate: workUpdate,
            dayType: dayType,
            reason: reason,
            moduleStatusId: isStatusUpdated == 1 ? 1 : 5,
            gateInBy: isGateInOrOut == 1 ? UserDetails.USERID : 0,
            approvedForGateOut: isGateInOrOut == 0 ? UserDetails.USERID : 0,
          };
          contractPersonActivity.push(obj);
        }
      }
    } else {
      let selectedItem
      contractPersonLength.splice(contractPersonLength.indexOf(cell), 1);
      contractPersonActivity.forEach((item, index) => {
        if (item['contractPersonsId'] == cell) {
          selectedItem = item
          contractPersonActivity.splice(contractPersonActivity.indexOf(selectedItem), 1);
        }
      });
    }
  }

  const onSubmit = () => {
    if (isGateInOrOut == 1) {
      addContractorDetails()
    } else {
      updateContractPersonsActivityDetails();
    }
  }

  const updateContractPersonsActivityDetails = () => {

    const postdata = {
      contractorDetailsId: contractorDetailsId,
      contractPersonActivity: contractPersonActivity,
      userInfoId: UserDetails.USERID
    };

    if (contractPersonLength.length > 0) {
      // if (contractPersonLength.length == contractPersonActivity.length) {
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateContractPersonsActivity", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateContractPersonsActivity", postdata)
          .then((response) => {
            const data = response.data;
            if (data.success == true) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + 'Gate Out Successfully' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
              })
              form.resetForm()
              redirect()
              setContractPersonActivity([])
            } else if (data.success == false) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
          })
          .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      // } else {
      //   confirmDialog({
      //     title: `<h5><strong class="text-white">` + 'Please fill all details' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      //   })
      // }

    } else {
      confirmDialog({
        title: `<h5><strong class="text-white">` + 'Please Select Contract Persons' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    }
  }

  const addContractorDetails = () => {

    const postdata = {
      contractorDetailsId: contractorDetailsId,
      contractPersonActivity: contractPersonActivity
    };

    if (contractPersonLength.length > 0) {
      if (contractPersonLength.length == contractPersonActivity.length) {
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addContractPersonsActivity", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addContractPersonsActivity", postdata)
          .then((response) => {
            const data = response.data;
            if (data.success == true) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + 'Gate In Successfully' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
              })
              form.resetForm()
              redirect()
              setContractPersonActivity([])
            }
            else if (data.success == false) {
              confirmDialog({
                title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
            }
          })
          .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      } else {
        confirmDialog({
          title: `<h5><strong class="text-white">` + 'Please fill all details' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
        })
      }

    } else {
      confirmDialog({
        title: `<h5><strong class="text-white">` + 'Please Select Contract Persons' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
      })
    }
  }

  const [grade, setGrade] = useState([])
  const [workUpdate, setWorkUpdate] = useState([])
  const [dayType, setDayType] = useState([])

  const getDefinitionsList = () => {
    console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/0`);
    apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/0`)
      .then((response) => {
        const data = response.data;
        if (data.success == true) {
          setGrade(data.results.filter((data) => data.definitionsId == 1))
          setWorkUpdate(data.results.filter((data) => data.definitionsId == 2))
          setDayType(data.results.filter((data) => data.definitionsId == 3))
        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const selectAllPersonds = () => {

    setIsSelectAll(!isSelectAll)
    const newData = [];

    if (isSelectAll) {
      // Select Particular     
      setContractPersonActivity([])
      contractPersons.forEach((item, index) => {
        if (item['contractPersonsId'] > 0) {
          item['isGateOut'] = true
        }
        newData.push(item)
      });
    }
    else {
      // All Persons    
      contractPersons.forEach((item, index) => {
        if (item['contractPersonsId'] > 0) {
          updateContractPersonsActivity(item['contractPersonsId'], 0, 0, 0, '', 1, 5, true)
          item['isGateOut'] = false
        }
        newData.push(item)
      });
    }
    setContractPersons(newData)
  }

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>Contractor - {isGateInOrOut == 0 ? 'Gate Out' : 'Gate In'}</h5><RefreshBlock1 /></CardHeader>
        <hr />
        <CardBody>
          <Row>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Va Number</Label>
                <Input type="text" placeholder="Va Number" value={contractorDetails?.vaNumber} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Nature of Work</Label>
                <Input type="text" placeholder="Nature of Work" value={contractorDetails?.workNature} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>From Date</Label>
                <Input type="text" placeholder="From Date" value={contractorDetails?.startDate} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>To Date</Label>
                <Input type="text" placeholder="To Date" value={contractorDetails?.endDate} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Total Days</Label>
                <Input type="text" placeholder="Total Days" value={contractorDetails?.totalDays} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Preffered Shift</Label>
                <Input type="text" placeholder="Preffered Shift" value={contractorDetails?.shift} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Contractor Name</Label>
                <Input type="text" placeholder="Contractor Name" value={contractorDetails?.contractorName} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Supervisor Name</Label>
                <Input type="text" placeholder="Supervisor Name" value={contractorDetails?.supervisorName} disabled />
              </FormGroup>
            </Col>
            {contractorDetails?.highGradePerson != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>High Grade Persons</Label>
                  <Input type="text" placeholder="High Grade Persons" value={contractorDetails?.highGradePerson} disabled />
                </FormGroup>
              </Col> : null
            }
            {contractorDetails?.mediumGradePrerson != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Medium Grade Prersons</Label>
                  <Input type="text" placeholder="Medium Grade Prersons" value={contractorDetails?.mediumGradePrerson} disabled />
                </FormGroup>
              </Col> : null
            }
            {contractorDetails?.lowGradePerson != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Low Grade Persons</Label>
                  <Input type="text" placeholder="Low Grade Persons" value={contractorDetails?.lowGradePerson} disabled />
                </FormGroup>
              </Col> : null
            }
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Total No of Persons</Label>
                <Input type="text" placeholder="Total No of Persons" value={contractorDetails?.noOfPersons} disabled />
              </FormGroup>
            </Col>
            <Col md="4" sm="4">
              <FormGroup>
                <Label>Supervisor Phone No</Label>
                <Input type="text" placeholder="Supervisor Phone No" value={contractorDetails?.supervisorPhoneNo} disabled />
              </FormGroup>
            </Col>
            {contractorDetails?.remarks != null ?
              <Col md="4" sm="4">
                <FormGroup>
                  <Label>Remarks</Label>
                  <Input type="text" placeholder="Remarks" value={contractorDetails?.remarks} disabled />
                </FormGroup>
              </Col> : null
            }

            {contractMaterialDetails != "" ? <>
              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="6" sm="6">
                <h4 className="text-primary"><u>Tools Info</u></h4><br />
              </Col>

              <Col md="12" sm="12">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <td className="bg-primary text-white text-center" width='10%'>S.No</td>
                      <td className="bg-primary text-white text-center">Material Name</td>
                      <td className="bg-primary text-white text-center" width='20%'>Material Count</td>
                    </tr>
                  </thead>
                  {contractMaterialDetails?.map((data) => (
                    <tbody key={data.contractMaterialDetailsId}>
                      <tr>
                        <td className='text-center'>{data.sno}</td>
                        <td className='text-center'>{data.material}</td>
                        <td className='text-center'>{data.noOfMaterial}</td>
                      </tr>
                    </tbody>
                  ))}
                </table>
                <br />
              </Col>
            </> : null}

            {contractPersons != '' ? <>
              <Col md="12" sm="12"><hr></hr></Col>

              <Col md="6" sm="6">
                <h4 className="text-primary"><u>Contract Persons</u></h4><br />
              </Col>
              {isGateInOrOut == 0 ?
                <Col md="6" sm="6">
                  <FormGroup className="d-flex justify-content-end">
                    <Button.Ripple color="primary" type="button" size='sm' onClick={selectAllPersonds}>{isSelectAll ? 'Select Prticuler' : 'All Persons'}</Button.Ripple>
                  </FormGroup>
                </Col> : null
              }

              <Col md="12" sm="12">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="bg-primary text-white text-center" style={{ width: '2%' }}>Select</th>
                      <th className="bg-primary text-white text-center">Name</th>
                      {isGateInOrOut == 0 ? <>
                        <th className="bg-primary text-white text-center" style={{ width: '20%' }}>Day</th>
                        <th className="bg-primary text-white text-center" style={{ width: '20%' }}>Grade</th>
                        <th className="bg-primary text-white text-center" style={{ width: '20%' }}>Work Update</th>
                        <th className="bg-primary text-white text-center" style={{ width: '25%' }}>Reason</th>
                      </> : null
                      }
                    </tr>
                  </thead>

                  {contractPersons?.map((data) => {
                    return (
                      <tbody key={data.contractPersonsId}>
                        <tr>
                          <td className='text-center'>
                            <FormGroup check inline>
                              <Input
                                type="checkbox"
                                checked={!data.isGateOut}
                                disabled={isSelectAll && !data.isGateOut}
                                onChange={(e) => updateContractPersonsActivity(data.contractPersonsId, data.grade, data.workUpdate, data.dayType, data.reason, data?.isGateOut == true ? false : true, data.isStatusUpdated, e.target.checked)}
                              />
                            </FormGroup>
                          </td>
                          <td className='text-center'>{data?.personName}</td>
                          {isGateInOrOut == 0 ? <>
                            <td>
                              <ReactSelect
                                isDisabled={data.isGateOut}
                                options={dayType}
                                onChange={(e) => updateContractPersonsActivity(data.contractPersonsId, data.grade, data.workUpdate, e.value, data.reason, false, data.isStatusUpdated, true)}
                              />
                            </td>
                            <td>
                              <ReactSelect
                                isDisabled={data.isGateOut}
                                options={grade}
                                onChange={(e) => updateContractPersonsActivity(data.contractPersonsId, e.value, data.workUpdate, data.dayType, data.reason, false, data.isStatusUpdated, true)}
                              />
                            </td>
                            <td>
                              <ReactSelect
                                isDisabled={data.isGateOut}
                                options={workUpdate}
                                onChange={(e) => updateContractPersonsActivity(data.contractPersonsId, data.grade, e.value, data.dayType, data.reason, false, data.isStatusUpdated, true)}
                              />
                            </td>

                            <td>
                              <Input
                                disabled={data.contractPersonsId && data.dayType == 7 ? false : true}
                                type="text"
                                placeholder="Enter Reason"
                                value={data?.reason}
                                onChange={(e) => updateContractPersonsActivity(data.contractPersonsId, data.grade, data.workUpdate, data.dayType, e.target.value, false, data.isStatusUpdated, true)}
                              />
                            </td>
                          </> : null}
                        </tr>
                      </tbody>
                    )
                  })}
                </table>
              </Col>
            </> : null
            }

            {/* {isSelectAll ? <>
              <Col md="3" sm="3">
                <CustomDropdownInput
                  options={grade}
                  label={"Grade"}
                  form={form}
                  id="grade"
                />
              </Col>
              <Col md="3" sm="3">
                <CustomDropdownInput
                  options={workUpdate}
                  label={"Work Update"}
                  form={form}
                  id="workUpdate"
                />
              </Col>
              <Col md="3" sm="3">
                <CustomDropdownInput
                  options={dayType}
                  label={"Day"}
                  form={form}
                  id="dayType"
                />
              </Col>
              <Col md="3" sm="3">
                <CustomTextInput label={"Reason"} type="text" form={form} id="reason" disabled={form.values.dayType?.value == 7 ? false : true} />
              </Col> </> : null
            } */}
          </Row>

          <Row>
            <Col sm="6" md="6">
              <FormGroup className="d-flex justify-content-start mt-1">
                <Button.Ripple outline color="primary" type="button" onClick={redirect}>
                  <ArrowLeft size={16} /> Back
                </Button.Ripple>
              </FormGroup>
            </Col>
            {contractPersons != '' ?
              <Col sm="6" md="6">
                <FormGroup className="d-flex justify-content-end mt-1">
                  <Button.Ripple color="primary" type="button" onClick={onSubmit}>
                    <Check size={16} /> {isGateInOrOut == 0 ? 'Gate Out' : 'Gate In'}
                  </Button.Ripple>
                </FormGroup>
              </Col> : null
            }
          </Row>
        </CardBody>
      </Card>
    </Fragment >
  );
};

export default ContractorGateOut;
