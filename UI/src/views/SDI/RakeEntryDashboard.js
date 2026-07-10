import React, { Fragment, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Label, FormGroup, Input, InputGroup, InputGroupText, Table } from "reactstrap";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import TableComponent from "../common/TableComponent";
import { addOption } from "../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment";
////import RelottingEntrySummaryForm from "./RelottingEntrySummaryForm";
import { Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

import { RelottingUrl } from "../../urlConstants";
import { DatePicker } from "../forms/custom-datetime";
import { HrLine } from "../common/HrLine";
import Select from "react-select";
import { RefreshBlock } from "../common/RefreshBlock";

const RakeEntryReportyForm = ({ form, onSubmit }) => {

  const taColumns = [
    {
      name: "FNR NO",
      selector: "fnr_no",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "VEHICLE NO",
      selector: "vehicle_no",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "VA NO",
      selector: "ZVA_NUMBER",
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "GATE IN DATE & TIME",
      selector: "formatted_GateInDt",
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "GATE OUT DATE & TIME",
      selector: "formatted_GateOutDt",
      sortable: true,
      minWidth: "200px",
    },

  ];
  // const actionsCol = {
  //   name: "Waiting At",
  //   selector: "status",
  //   sortable: true,
  //   minWidth: "150px",
  //   cell: (row) => {
  //     return (
  //       <>
  //         {row.StatusName === 'Completed' &&
  //           <span className="badge rounded-pill bg-info">
  //             {row.StatusName}
  //           </span>}
  //         {row.StatusName != '' &&
  //           <span className="badge rounded-pill bg-info">
  //             {row.StatusName}
  //           </span>}
  //         {row.StatusName == '' &&
  //           <span className="badge rounded-pill bg-danger">
  //             Process Cancel
  //           </span>}
  //       </>
  //     );
  //   },
  // }

  const columns = [...taColumns,
    // actionsCol
  ];
  const history = useHistory();
  let { id } = useParams();
  let refid = '';
  if (id) {
    refid = id.replace(":", "");
  }

  let { showLoader, hideLoader } = useLoader();

  const getSublotlist = () => {
    let newDate = new Date()
    // let date = newDate.getDate()

    let Data = {
      fromdate: form.values.FromDate,
      todate: form.values.ToDate,
    }
    let fdata = {
      Data,
      formType: "1,2,3"
    };


    showLoader();
    // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
    apiPostMethod(apiBaseUrl + "RakeloadingController/RakeEntryReport", fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));

        console.log("Data :: ", data);
        let tableData = []
        tableData = data.results

        if (data.success) {
          form.setValues({

            ...form.values,
            CheckList: tableData,
          })
        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
  const [FNRNofetch, setFNRNofetch] = useState([]);

  useEffect(() => {
    onFetchFNRNO()
  }, []);

  const onFetchFNRNO = () => {
    let fdata = {};
    apiPostMethod(apiBaseUrl + "RakeloadingController/FNRNOOverAllList", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setFNRNofetch([{ options: data.results }]);
        }
      })
    // .catch((error) => {
    //   errorToast("Something went wrong, please try again after sometime");
    // });
  };
  const [formData, setFormaData] = useState({});
  const [opencount, setOpencount] = useState(false);
  const [overallcount, setoverallcount] = useState([]);

  const onFNRChange = (e) => {
    const { value } = e;
    setFormaData({ ...formData, FNR_NO: value, });
    FNRNO_Count(value)
  };

  const FNRNO_Count = (FNR_NO) => {
    let fdata = { FNR_NO };
    apiPostMethod(apiBaseUrl + "RakeloadingController/FNRNOBasedCount", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results) {
          setOpencount(data.results.plantCounts); // Store the entire object instead of just one plant
          setoverallcount(data.results.overallcount)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };



  const { FNR_NO } = formData;

  return (
    <Fragment>
      <RefreshBlock />
      <Card>
        <CardHeader>
          <CardTitle>Rake Entry Summary </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md="3" sm="12">
              <FormGroup>
                <Label>FNR Number</Label>
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={FNRNofetch}
                  value={{ label: FNR_NO, value: FNR_NO }}
                  onChange={(e) => onFNRChange(e)}
                />
              </FormGroup>
            </Col>
          </Row>
          {FNR_NO && opencount && Object.keys(opencount).length > 0 && (() => {
            const plants = Object.keys(opencount); // Get all plant names

            return (
              <Row>
                <Col sm={12} lg={12} style={{ padding: "10px" }}>
                  <div
                    style={{
                      marginTop: "1rem",
                      marginBottom: "1rem",
                      backgroundColor: "dodgerblue",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    {/* Title */}
                    <Input
                      value={`Total Rake Movement Count: ${overallcount}`}
                      style={{
                        backgroundColor: "#999966",
                        color: "white",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    />

                    {/* Plant Names Row (Column Headers) */}
                    <InputGroup style={{ marginTop: "10px" }}>
                      <InputGroupText
                        style={{
                          backgroundColor: "#999966",
                          color: "white",
                          fontWeight: "bold",
                          width: "40%",
                        }}
                      >
                        Category
                      </InputGroupText>
                      {plants.map((plant, index) => (
                        <Input
                          key={index}
                          value={plant}
                          style={{
                            color: "white",
                            backgroundColor: "#999966",
                            textAlign: "center",
                            fontWeight: "bold",
                            marginLeft: "5px",
                          }}
                        />
                      ))}
                    </InputGroup>

                    {/* Data Rows */}
                    {[
                      { label: "Rake Loading", key: "Rake_Create" },
                      { label: "Rake Edit", key: "Rake_Edit" },
                      { label: "Gate In", key: "gate_in" },
                      { label: "First Weight", key: "first_weight" },
                      { label: "Unloading", key: "unloading" },
                      { label: "Second Weight", key: "second_weight" },
                      { label: "Gate Out", key: "gate_out" },
                      { label: "Migo Completed", key: "migo_approve" },
                      { label: "Process Reject", key: "Process_Cancel", bgColor: "red" },
                    ].map((item, i) => {
                      // Calculate the total count for this row
                      const rowTotal = plants.reduce((sum, plant) => sum + (opencount[plant][item.key] || 0), 0);

                      return (
                        <InputGroup key={i} style={{ marginTop: "5px" }}>
                          {/* Left Category Column with Total Count in Brackets */}
                          <InputGroupText
                            style={{
                              backgroundColor: item.bgColor || "dodgerblue",
                              color: "white",
                              fontWeight: "bold",
                              width: "40%",
                            }}
                          >
                            {`${item.label} (${rowTotal})`} {/* Display total count in brackets */}
                          </InputGroupText>

                          {/* Right: Data for Each Plant */}
                          {plants.map((plant, index) => (
                            <Input
                              key={index}
                              value={opencount[plant][item.key] || 0}
                              style={{
                                color: "white",
                                backgroundColor: item.bgColor || "dodgerblue",
                                textAlign: "center",
                                fontWeight: "bold",
                                marginLeft: "5px",
                              }}
                            />
                          ))}
                        </InputGroup>
                      );
                    })}

                    {/* Gate-Out Vehicle Numbers Row */}
                    <div style={{ display: "flex" }}>
                      <InputGroupText
                        style={{
                          backgroundColor: "#999966",
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          width: "40%",
                        }}
                      >
                        Gate Out Vehicle Numbers
                      </InputGroupText>
                      {plants.map((plant, index) => (
                        <InputGroupText
                          key={index}
                          style={{
                            backgroundColor: "#999966",
                            color: "white",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flex: 1,
                            textAlign: "center",
                            marginLeft: "5px",
                          }}
                        >
                          {plant}
                        </InputGroupText>
                      ))}
                    </div>

                    {/* Find the max number of vehicles to align columns correctly */}
                    {(() => {
                      const maxVehicles = Math.max(
                        ...plants.map((plant) => (opencount[plant].gateouteddata || []).length)
                      );

                      return [...Array(maxVehicles)].map((_, rowIndex) => (
                        <div key={rowIndex} style={{ display: "flex", marginTop: "5px" }}>
                          <InputGroupText
                            style={{
                              backgroundColor: "#1a8cff",
                              color: "white",
                              fontWeight: "bold",
                              width: "40%",
                            }}
                          >
                            {rowIndex + 1}
                          </InputGroupText>
                          {plants.map((plant, index) => {
                            const vehicleData = opencount[plant].gateouteddata || [];
                            return (
                              <Input
                                key={index}
                                value={vehicleData[rowIndex] ? vehicleData[rowIndex].vehicle_no : ""}
                                style={{
                                  color: "white",
                                  backgroundColor: "#1a8cff",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  flex: 1,
                                  marginLeft: "5px",
                                }}

                              />
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </Col>
              </Row>
            );
          })()}
        </CardBody>
      </Card>
      <Card>
      </Card>

    </Fragment>

  );
};
const RakeEntryReport = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      divisionname: validation.required({ message: "Division Name should not be empty", isObject: false }),
      sapdivisioncode: validation.required({ message: "SAP Division Code should not be empty", isObject: false }),
    }),
    onSubmit(values) { },
  });
  const values = form.values;

  const onSubmit = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let formData = form.values;

    const FrmData = {
      divisionid: formData.divisionid,
      divisionname: formData.divisionname,
      sapdivisioncode: formData.sapdivisioncode,
    };
    const postdata = {
      id: formData.divisionid,
      Data: FrmData
    }

    console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_division", postdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId = data.success;
        if (UsrId == -5) {
          errorToast("Duplicate Entry");
        } else {
          let RespId = data.success;
          if (RespId && RespId >= 1) {
            ShowToast("Saved Successfully...");
            if (document.getElementById("divisionid").value == "") {
              history.push("/warehouse/masters/RelottingEntrySummary:0");
            }
            else {
              history.push("/Warehouse/Masters/RelottingEntrySummary");
            }
          }
          else {
            if (data.ErrorMsg) {
              errorToast(data.ErrorMsg);
            }
            else {
              errorToast("Unable to update record");
            }
          }
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }
  const history = useHistory();
  const resetForm = () => {
    history.push(`/warehouse/masters/RelottingEntrySummary`);
  };
  return (
    <Fragment>

      <RakeEntryReportyForm form={form} onSubmit={onSubmit} />

    </Fragment>
  );
};
export default RakeEntryReport;
