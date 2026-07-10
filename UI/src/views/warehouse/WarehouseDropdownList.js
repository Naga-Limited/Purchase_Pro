import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment";
import { Row, Col, Button, Table, FormGroup, CustomInput, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Select from "react-select";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { extendWith } from "lodash";
import { Modal } from 'react-responsive-modal';
import InputTable from "./plan/InputTable.js";
import 'react-responsive-modal/styles.css';
import Swal from "sweetalert2";


export const UOM = "KG";
export const WarehousePlanList_Edit = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {

  const [showModal, setShowModal] = useState(false);
  const { lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid } = rest;
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();


  useEffect(() => {
    fetchPlanList();
  }, []);

  const fetchPlanList = () => {
    let fdata = {
      ...postData
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results, CurrentMonthYear: monthyear
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

  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onUpdateRelease = () => {
    let NewData = [];
    let i = 0;
    for (i = 0; i < form.values.CheckList.length; i++) {
      if (form.values.CheckList[i].chkSelect == true) {
        NewData.push(form.values.CheckList[i]);
      }
    }
    for (i = 0; i < NewData.length; i++) {
      delete NewData[i]["chkSelect"];
    }
    UpdateReleaseQty(NewData);
  }

  const UpdateReleaseQty = (NewData) => {
    const postdata = {
      screentype: "WPL_Edit",
      Data: NewData
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/UpdateReleaseQty", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Saved Successfully...");
        } else {
          if (data.ErrorMsg) {
            errorToast("ERROR :: " + data.ErrorMsg);
          } else {
            errorToast("Unable to update record");
          }
        }
      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });

  }

  const onUpdateClick = () => {
    let NewData = [];
    let i = 0;
    for (i = 0; i < form.values.CheckList.length; i++) {
      if (form.values.CheckList[i].chkSelect == true) {
        NewData.push(form.values.CheckList[i]);
      }
    }
    for (i = 0; i < NewData.length; i++) {
      delete NewData[i]["chkSelect"];
    }
    SaveData(NewData);
  }

  const SaveData = (NewData) => {
    const postdata = {
      screentype: "WPL_Edit",
      Data: NewData
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/SavePlanListUpdate", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Saved, Successfully... ");
          setShowModal(false);
          history.push("/warehouse/Plan_List");
        } else {
          if (data.ErrorMsg) {
            errorToast(data.ErrorMsg + ", TEST ");
          } else {
            errorToast("Unable to update record");
          }
        }
      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });

  }

  const onTextChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (CheckList[i].planid == PKey) {
        if (Val == "Priority") {
          CheckList[i].Priority = e.target.value;
        }
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
        if (Val == "Movement_Qty") {
          CheckList[i].Movement_Qty = e.target.value;
        }
        if (Val == "Release_Qty") {
          CheckList[i].Release_Qty = e.target.value;
        }


      }
    }
    console.log(JSON.stringify(CheckList));
    form.setValues({ ...form.values, CheckList });
  }

  return (
    <Fragment>
      <Row>
        <Col md="12" sm="12" style={{ height: "260px", overflowY: "auto", width: "1110px", overflowX: "scroll", fontSize: "12px" }}>
          <div>
            <table id="TableID" className='table-sm'>
              <thead className='bg-primary text-white ' style={{ height: "50px", textAlign: "center" }}>
                <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> */}
                  <th style={{ minWidth: "150px" }}>Select</th>
                  <th style={{ minWidth: "150px" }}>Priority</th>
                  <th style={{ minWidth: "150px" }}>Planing Month</th>
                  <th style={{ minWidth: "150px" }}>Wheat Variety</th>
                  <th style={{ minWidth: "150px" }}>Receiving Bin</th>
                  <th style={{ minWidth: "150px" }}>Lot No</th>
                  <th style={{ minWidth: "150px" }}>Storage Location</th>
                  <th style={{ minWidth: "150px" }}>Plant</th>
                  <th style={{ minWidth: "150px" }}>Warehouse</th>
                  <th style={{ minWidth: "150px" }}>SAP Stock (MTS)</th>
                  <th style={{ minWidth: "150px" }}>Reserved Stock(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Available Stock(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Movement Qty(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Expected Arrival</th>
                  <th style={{ minWidth: "150px" }}>Purchase Plan(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Release</th>
                  <th style={{ minWidth: "150px" }}>Division</th>
                  <th style={{ minWidth: "150px" }}>QC Cleared Qty (MTS)</th>
                  <th style={{ minWidth: "150px" }}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{ minWidth: "150px" }}>DO Cleared Qty(MTS)</th>
                  <th style={{ minWidth: "150px" }}>Action</th>

                </tr>
              </thead>

              <tbody style={{ textAlign: "center" }}>
                {form.values.CheckList && form.values.CheckList.map((row, index) => (
                  <tr style={{ height: "44px" }}>
                    {/* <td>{row.planid}</td> */}
                    <td>
                      <CustomTextInput style={{ fontSize: "12px", height: "30px", marginBottom: "10px" }}
                        type="checkbox"
                        id={`chkSelect_${row.rowId}`}
                        form={form}
                        placeholder={" "}
                        value={row.chkSelect}
                        onChange={(e) => onTextChange(e, row.planid, form.values.CheckList, "chkSelect", row.rowId)}
                      />
                    </td>

                    <td>
                      <CustomTextInput style={{ fontSize: "12px", height: "30px", marginBottom: "-10px" }}
                        type="text"
                        id={`priority_${row.rowId}`}
                        form={form}
                        placeholder={" "}
                        value={row.Priority}
                        onChange={(e) => onTextChange(e, row.planid, form.values.CheckList, "Priority", row.rowId)}
                      />
                    </td>

                    <td>{row.PlanMonth}</td>
                    <td>{row.WheatvarietyName}</td>
                    <td>{row.ReceivingBinNo}</td>
                    <td>{row.lotno}</td>
                    <td>{row.storage_location}</td>
                    <td>{row.plant_name}</td>
                    <td>{row.wh_name}</td>
                    <td>{row.SAP_Qty}</td>
                    <td>{row.Reserved_Stock}</td>
                    <td>{row.wheatqty}</td>
                    <td>{/*{row.Movement_Qty}*/}
                      <CustomTextInput style={{ fontSize: "12px", height: "30px", marginBottom: "-10px" }}
                        type="text"
                        id={`Movement_Qty_${row.rowId}`}
                        form={form}
                        placeholder={" "}
                        value={row.Movement_Qty}
                        onChange={(e) => onTextChange(e, row.planid, form.values.CheckList, "Movement_Qty", row.rowId)}
                      />
                    </td>
                    <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                    <td>{row.Expected_Arrival}</td>
                    <td>{row.Purchase_Plan}</td>

                    {/* <td>{row.Release}</td> */}
                    <td>
                      <CustomTextInput style={{ fontSize: "12px", height: "30px", weight: "40px", marginBottom: "-10px" }}
                        type="text"
                        id={`Release_Qty_${row.rowId}`}
                        form={form}
                        placeholder={" "}
                        value={row.Release_Qty}
                        onChange={(e) => onTextChange(e, row.planid, form.values.CheckList, "Release_Qty", row.rowId)}
                      />

                      <Button.Ripple
                        color="primary"
                        type="Button"
                        onClick={(e) => {
                          confirmDialog({
                            title: "Please confirm for UPDATE, Are you sure...?",
                          }).then((res) => {
                            if (res) {
                              onUpdateRelease()
                            }
                          });
                        }}
                      >Release</Button.Ripple>
                    </td>

                    <td>{row.Division}</td>


                    <td style={{ color: "#ffffff", backgroundColor: `${row.QCClearedColor}` }}>{row.QC_Cleared_Qty}</td>
                    <td style={{ color: "#ffffff", backgroundColor: `${row.FumigationClearedColor}` }}>{row.Fumi_Cleared_Qty}</td>
                    <td style={{ color: "#ffffff", backgroundColor: `${row.KeyloanClearedColor}` }}>{row.Keyloan_Cleared_Qty}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </Col>
      </Row>

      <Row>
        {screenType && screenType == "CONFIRMATION" &&
          <>
            <Col md="6" sm="12">
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for UPDATE, Are you sure?",
                }).then((res) => {
                  if (res) {
                    onUpdateClick()
                  }
                });
              }}>Update</Button.Ripple>
              &nbsp; &nbsp;
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for DELETE, Are you sure?",
                  //description: msg,
                }).then((res) => {
                  if (res) {
                    // onActionClick()
                  }
                });
              }}>Delete</Button.Ripple>
            </Col>
          </>
        }
      </Row>
    </Fragment>
  );
};


export const WarehouseDropdownList = ({ form }) => {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);

  const [WarehoseOptions, setWarehouseOptions] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [storageLocationOption, setstorageLocationOption] = useState([]);

  const onWarehouseChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('WareHouse', { label: label, value: value });
    FillPlantList(value);
  };

  const FillPlantList = (WH_CODE) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onStorageLocationChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('storagelocationid', { label: label, value: value });
    // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
    FillLotList(value)

  }
  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', { label: label, value: value });

    // FillLotList(value);
    FillStorageLocationList(value)
  };
  const FillStorageLocationList = (PlantId) => {
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getStorageLocationListFromPlant', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {

          setstorageLocationOption([{ options: data.results }]);

          //getLotInfo(paramLotId,type);

        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const FillLotList = (sLocId) => {
    //let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    let fdata = { storagelocationId: sLocId, plantid: form.values.plantid.value, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhLotOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLotChange = (e) => {
    const { value, label } = e;

    form.setFieldValue('LotNumber', { label: label, value: value });


    FillWheatVarityList(value);
  };

  const FillWheatVarityList = (paramLotId) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHWheatvarityList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhWheetVarietyOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onWheatvarietyChange = (e) => {
    const { value, label } = e;

    //getSublotData(label,value);
    Fill_WH_Plant_Lot_Wheatvariety(e.value, e.label);
  };

  const Fill_WH_Plant_Lot_Wheatvariety = (pWheatVarietyId, pWheatVarietyName) => {
    let fdata = { WheatVarietyId: pWheatVarietyId, screenType: "WEEKLYPLAN" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWH_Plant_Lot_Wheatvariety', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWarehouseOptions([{ options: data.results.warehouse }]);
          setWhPlantOptions([{ options: data.results.plant }]);
          setstorageLocationOption([{ options: data.results.slocation }]);
          setWhLotOptions([{ options: data.results.lot }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getSublotData = (lab, val) => {
    let fdata = {
      warehouseid: form.values.WareHouse.value,
      plantid: form.values.plantid.value,
      lotid: form.values.LotNumber.value,
      WheatVarietyId: val,
      screenType: "WEEKLYPLAN",
      ValFrom: form.values.ValidFrom
    };
    apiPostMethod(apiBaseUrl + 'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // setWhWheetVarietyOptions([{ options: data.results }]);
          form.setValues({
            ...form.values,
            ActualStock: data.results[0].wheatqty,
            RandDConfirmedQty: data.results[0].Rndlockqty,
            FumigationClearedQty: data.results[0].FumigationClearedQty,
            KeyLoanDOQty: data.results[0].Unpledgeqty,
            FumigationSkipFlag: data.results[0].FumigationSkipFlag,
            RndSkipFlag: data.results[0].RndSkipFlag,
          })

          form.setFieldValue('WheatVariety', { label: lab, value: val });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  return (
    <Fragment >
      <Row>

        <Col>
          <CustomDropdownInput
            style={{ "width": "170px" }}
            options_DUMMY={WhWheatvarietyOptions}
            url={`${apiBaseUrl}warehouse/master/getWHWheatvarityList`}
            id="WheatVariety1"
            label={"Wheat Variety"}
            className="react-select"
            classNamePrefix="select"
            form={form}
            onChange={(e) => onWheatvarietyChange(e)}
          />
          <span id='WheatVariety_Error' style={{ color: 'red' }} ></span>
        </Col>

        <Col>
          <CustomDropdownInput
            label={"WH.Name"} form={form} id="WareHouse1"
            onChange={onWarehouseChange}
            options={WarehoseOptions}
          />
          <span id='WareHouse_Error' style={{ color: 'red' }} ></span>
        </Col>

        <Col>
          <CustomDropdownInput
            options={WhPlantOptions}
            id="plantid1"
            label={"Plant"}
            className="react-select"
            classNamePrefix="select"
            form={form}
            onChange={(e) => onPlantChange(e)}
          />
        </Col>
        <Col>
          <CustomDropdownInput
            options={storageLocationOption}
            id="storagelocationid1"
            label={"Storage Location"}
            className="react-select"
            classNamePrefix="select"
            form={form}
            onChange={(e) => onStorageLocationChange(e)}
          />
        </Col>
        <Col>
          <CustomDropdownInput
            options={WhLotOptions} form={form} id="LotNumber1"
            className="react-select"
            label={"Lot Number"}
            classNamePrefix="select"

            onChange={(e) => onLotChange(e)}
          />
          <span id='LotNumber_Error' style={{ color: 'red' }} ></span>
        </Col>
      </Row>
    </Fragment>
  );
};



export const Rnd_Confirmation_Plan = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {

  console.log("Weekly Plan Month => ", monthyear);

  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);

  const [SelectedList, setSelectedList] = useState();

  const { lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid } = rest;

  let { showLoader, hideLoader } = useLoader();


  const taColumns_RndConfirmation = [
    {
      name: "Select",
      selector: "Status_String",
      sortable: true,
      minWidth: "150px",
      cell: (row, index) => {
        return (
            <div style={{
              backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
              width: "100%", height: "100%",  paddingTop:"15px"}}>{row.Status_String}</div>
        );
      },
    },
    {
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "100px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%" ,  paddingTop:"15px"}}>{row.Priority}</div>
      //   );
      // },
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.PlanMonth}</div>
      //   );
      // },

    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.WheatvarietyName}</div>
      //   );
      // },
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinNo",
      sortable: true,
      minWidth: "150px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.ReceivingBinNo}</div>
      //   );
      // },
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.lotno}</div>
      //   );
      // },
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.storage_location}</div>
      //   );
      // },
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.plant_name}</div>
      //   );
      // },
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.wh_name}</div>
      //   );
      // },
    },
    {
      name: "SAP Stock(" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.SAP_Qty}</div>
      //   );
      // },
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Reserved_Stock}</div>
      //   );
      // },
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "AvailabelQty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.AvailabelQty}</div>
      //   );
      // },
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Movement_Qty}</div>
      //   );
      // },
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Diff_for_Mvmt_Qty_SAP_QTY}</div>
      //   );
      // },
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Diff_for_Mvmt_Qty_SAP_QTY}</div>
      //   );
      // },
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Diff_for_Mvmt_Qty_SAP_QTY}</div>
      //   );
      // },
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Release_Qty}</div>
      //   );
      // },
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      // cell: (row, index) => {
      //   return (
      //     <div style={{
      //       backgroundColor: row.status === "2" ? row.PendingColor:row.status === "3" ? row.ApprovalColor:"#FFFFFF", 
      //       width: "100%",height: "100%",  paddingTop:"15px"}}>{row.Division}</div>
      //   );
      // },
    },
    {
      name: "Next Fumigation Date",
      selector: "Next_Fumigation_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (" + UOM + ")",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{backgroundColor: row.QCClearedColor, 
              color: "#FFFFFF",
              width: "100%", 
              height: "100%",
              textAlign: "center", 
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Fumi. Cleared Qty (" + UOM + ")",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "DO Cleared Qty (" + UOM + ")",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
  ];

  useEffect(() => {
    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) => {
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let InitValue = "";
    setRejectReason(InitValue);
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results /*, CurrentMonthYear:monthyear*/
          })
          getRejectReason(data.results);
        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onSelectChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (i === index) {
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
      }
      //console.log("NEW DATA => ",CheckList);
    }
  }

  const getRejectReason = (Data) => {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].status === "-2") {
        setRejectReason(Data[i].RejectReason);
      }
    }
  }

  const onTextChange = (e, CheckList) => {
    setRejectReason(e.target.value);
    CheckList.RejectReason = e.target.value;
    console.log(JSON.stringify(CheckList));
    form.setValues({ ...form.values, CheckList });
  }

  const onUpdatedata = (CheckList, actionType, ReasonToReject) => {

    console.log("Selected Data  => ", CheckList);

    let selectedItem = [];
    console.log("Update DATA  => ", JSON.stringify(CheckList));

    if (actionType === "RND_APPROVAL") {

      // for(let i=0;i<CheckList.length;i++){
      //   if(CheckList[i].chkSelect === true){
      //     selectedItem.push(CheckList[i]);
      //   }
      // }
      selectedItem = CheckList;

    } else if (actionType === "RND_REJECT") {

      for (let i = 0; i < CheckList.length; i++) {
        if (CheckList[i].status === "1") {
          selectedItem.push(CheckList[i]);
        }
      }
      //console.log(" AAAAAAAAAA ", CheckList );
      //selectedItem.push(CheckList);
    }
    Save_RnD_Data(selectedItem, actionType, ReasonToReject);
  }

  const Save_RnD_Data = (NewData, ScreenType, ReasonToReject) => {
    const postdata = {
      screentype: ScreenType,
      Data: NewData,
      Reason: ReasonToReject
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Saved Successfully...");
          rest.FetchData();
        } else {
          if (data.ErrorMsg) {
            errorToast("ERROR :: " + data.ErrorMsg);
          } else {
            errorToast("Unable to update record");
          }
        }
      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const onSelectedRowsChange = (selectedRowState) => {
    console.log("HAUI");
    console.log(selectedRowState);

    setSelectedList(selectedRowState.selectedRows);

    // for (i=0;i<=selectedRowState.selectedRows.length;i++){
    //   if form.values.CheckList[i].
    // }

  }

  const selectableRowDisabled = (row) => {
    // console.log("SUPER");
    // console.log(row);
    return !(row.ApprovalEnableFlag === "1" &&
      row.status === "1");
  }

  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "12px" }}>
        <Row>
          <Col>
            <br />
            <h4> R&D Confirmation Plan : {monthName} </h4>

            {/* <Button.Ripple color="primary" type="button" 
            onClick={(e) => {SelectAll(form.values.CheckList)}}>Select All</Button.Ripple> */}
          </Col>

          <Col md="12" sm="12" style={{ fontSize: "12px" }}>

            <TableComponent select
              onSelectedRowsChange={onSelectedRowsChange}
              selectableRowDisabled={selectableRowDisabled}
              columns={taColumns_RndConfirmation}
              data={form.values.CheckList}
              showDownload
              hideSearch
              //fileName={"PLAN R&D Confirmation"}
              exceltype={"PLAN"}
            />

          </Col>
        </Row>
        <br />

        <Row>
          &nbsp; &nbsp; &nbsp;
          <Col md="3" sm="12">

            <Button.Ripple color="primary" type="button"
              onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for R&D APPROVAL, Are you sure?",
                }).then((res) => {
                  if (res) {
                    onUpdatedata(SelectedList, "RND_APPROVAL")
                  }
                });
              }}>Approve</Button.Ripple>

            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for R&D REJECT, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdatedata(SelectedList, "RND_REJECT", RejectReason)
                }
              });
            }}>Reject</Button.Ripple>
          </Col>
          <Col md="3" sm="12">
            <CustomTextInput /*style={{fontSize:"12px", height:"30px", weight:"10px", marginBottom:"-10px"}}*/
              type="text"
              id={`rejectreason`}
              form={form}
              placeholder={"Reason for Reject !"}
              value={RejectReason}
              onChange={(e) => onTextChange(e, form.values.CheckList)}
            />
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};


export const Commercial_Confirmation_Plan = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  //console.log("Commercial_Confirmation_Plan => ",monthyear);

  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const [SelectedList, setSelectedList] = useState();
  const { lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid } = rest;
  let { showLoader, hideLoader } = useLoader();

  const taColumns_Commercial = [
    {
      name: "Select",
      selector: "",
      sortable: true,
      minWidth: "150px",
      cell: (row, index) => {
        return (
          <div style={{/*backgroundColor:"#f47373",color:"#FFFFFF", width:"100%", height:"100%",*/ textAlign: "left" }}>
            <div style={{backgroundColor: "#00D084"}}>{row.Status_String == "Commercial Approved" && row.Status_String}</div>
            <div style={{backgroundColor: "#FA6C3F"}}>{row.Status_String == "Commercial Pending" && row.Status_String}</div>
            {row.Status_String !== "Commercial Approved" && row.Status_String !== "Commercial Pending" &&
              <>
                {row.ApprovalEnableFlag === "1" &&
                  row.status === "2" && <></>
                  // <div style={{backgroundColor: "#FFFFFF",color: "#0ECD11",}}>{row.Status_String}</div>
                  // <input /*style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}*/
                  //   type="checkbox" id={`chkSelect_${index}`}
                  //   form={form} name={row.Status_String}
                  //   onChange={(e) => onSelectChange(e, row.planid, form.values.CheckList,"chkSelect",index)} 
                  // />
                  
                }&nbsp;&nbsp;{row.Status_String}
              </>
            }
            
          </div>
        );
      },
    },
    {
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,

    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinNo",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock (" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "AvailabelQty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Next Fumigation Date",
      selector: "Next_Fumigation_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (" + UOM + ")",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.QCClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Fumi. Cleared Qty (" + UOM + ")",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "DO Cleared Qty (" + UOM + ")",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
  ];

  useEffect(() => {
    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) => {
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let InitValue = "";
    setRejectReason(InitValue);
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results /*, CurrentMonthYear:monthyear*/
          })
          getRejectReason(data.results);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onSelectChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (i === index) {
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
      }
      //console.log("NEW DATA => ",CheckList);
    }
  }

  const getRejectReason = (Data) => {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].status === "-3") {
        setRejectReason(Data[i].RejectReason);
      }
    }
  }

  const onTextChange = (e, CheckList) => {
    setRejectReason(e.target.value);
    CheckList.RejectReason = RejectReason;
    console.log(JSON.stringify(CheckList));
    form.setValues({ ...form.values, CheckList });
  }

  const onUpdatedata = (CheckList, actionType, ReasonToReject) => {
    let selectedItem = [];
    console.log("Update DATA  => ", JSON.stringify(CheckList));

    if (actionType === "COMMERCIAL_APPROVAL") {
      // for(let i=0;i<CheckList.length;i++){
      //   if(CheckList[i].chkSelect === true){
      //     selectedItem.push(CheckList[i]);
      //   }
      // }
      selectedItem = CheckList;

    } else if (actionType === "COMMERCIAL_REJECT") {
      for (let i = 0; i < CheckList.length; i++) {
        if (CheckList[i].status === "2") {
          selectedItem.push(CheckList[i]);
        }
      }
      //console.log(" Selected Item ", selectedItem );
    }
    Save_Commercial_Data(selectedItem, actionType, ReasonToReject);
  }

  const Save_Commercial_Data = (NewData, ScreenType, ReasonToReject) => {
    const postdata = {
      screentype: ScreenType,
      Data: NewData,
      Reason: ReasonToReject
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Saved Successfully...");
          rest.FetchData();
        } else {
          if (data.ErrorMsg) {
            errorToast("ERROR :: " + data.ErrorMsg);
          } else {
            errorToast("Unable to update record");
          }
        }

      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const onSelectedRowsChange = (selectedRowState) => {
    console.log("HAUI");
    console.log(selectedRowState);
    setSelectedList(selectedRowState.selectedRows);
    // for (i=0;i<=selectedRowState.selectedRows.length;i++){
    //   if form.values.CheckList[i].
    // }

  }

  const selectableRowDisabled = (row) => {
    // console.log("SUPER");
    // console.log(row);
    return !(row.ApprovalEnableFlag === "1" && row.status === "2");
  }


  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "12px" }}>
        <Row>
          <Col md="12" sm="12" style={{ width: "90%", fontSize: "12px" }}>
            <br />
            <h4> Commercial Confirmation Plan : {monthName} </h4>
            <br />
            <TableComponent
              select
              onSelectedRowsChange={onSelectedRowsChange}
              selectableRowDisabled={selectableRowDisabled}
              columns={taColumns_Commercial}
              data={form.values.CheckList}
              hideSearch
              showDownload
              exceltype = {"PLAN"}
            />
          </Col>
        </Row>
        <br />&nbsp; &nbsp; &nbsp;
        <Row>
          <Col md="3" sm="12">
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for Commercial APPROVAL, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdatedata(SelectedList, "COMMERCIAL_APPROVAL")
                }
              });
            }}>Approve
            </Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for Commercial REJECT, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdatedata(SelectedList, "COMMERCIAL_REJECT", RejectReason)
                }
              });
            }}>Reject</Button.Ripple>
          </Col>
          <Col md="3" sm="12">
            <CustomTextInput
              type="text"
              id={`rejectreason`}
              form={form}
              placeholder={"Reason for Reject !"}
              value={RejectReason}
              onChange={(e) => onTextChange(e, form.values.CheckList)}
            />
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export const Plan_STOPO_DeliveryCreation_Add = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {

  //console.log("Plan_STOPO_DeliveryCreation_Add => ",monthyear);

  const [monthName, setmonthName] = useState();
  const [Trigger, setTrigger] = useState();
  const [showModal, setShowModal] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [SelectedData, setSelectedData] = useState([]);
  const [DeleteItem, setDeleteItem] = useState([]);
  let { showLoader, hideLoader } = useLoader();

  const taColumns = [
    {
      name: "Select",
      selector: "",
      sortable: true,
      minWidth: "150px",
      cell: (row, index) => {
        return (
          <div style={{/*backgroundColor:"#f47373",color:"#FFFFFF", width:"100%", height:"100%",*/ textAlign: "left" }}>
          <div style={{backgroundColor: "#FFFFFF",color: "#0ECD11",}}>{row.Status_String == "Commercial Approved_NOTINUSE" && row.Status_String}</div>
            {row.Status_String !== "Commercial Approved_NOTINUSE" &&
              <div style={{backgroundColor: "#FFFFFF",color: "#0ECD11"}}>
                {/*row.ApprovalEnableFlag === "1" &&*/
                  <input /*style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}*/
                    type="checkbox" id={`chkSelect_${index}`}
                    form={form} name={row.Status_String}
                    onChange={(e) => onTextChange(e, row.planid, form.values.CheckList, "chkSelect", index)}
                  />
                }&nbsp;&nbsp;{row.Status_String}
              </div>
            }
          </div>
        );
      },
    },
    {
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "130px",
      // cell: (row, index) => {
      //   return  (
      //     //<Input className="custom-control-Primary" form={form} id="Priority" type="text" value={row.Priority}/>
      //     <CustomTextInput 
      //       style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
      //       ref={(e) => (inputRef.current[index] = e)}

      //       onChange={(e) => onTextChange(e, row.planid , form.values.CheckList, "Priority", index)} 
      //       //onChange={form.handleChange}

      //       form={form} 
      //       id={index} 
      //       type="text" 
      //       value={row.Priority}
      //       />
      //   );
      // },
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,

    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinName",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock(" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "AvailabelQty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      // cell: (row, index) => {
      //   return  (
      //       <CustomTextInput style={{fontSize:"12px",height:"30px", marginBottom:"-10px"}}
      //         type="text"
      //         id={`Movement_Qty_${row.rowId-1}`}
      //         form={form}  
      //         value={row.Movement_Qty}
      //         //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Movement_Qty",index)} 
      //       />
      //   );
      // },
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      // cell: (row, index) => {
      //   return (
      //     <CustomTextInput style={{fontSize:"12px",height:"30px", weight:"40px", marginBottom:"-10px"}}
      //       type="text"
      //       id={`Release_Qty_${row.rowId-1}`}
      //       form={form}  
      //       value={row.Release_Qty}
      //       onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Release_Qty",row.rowId)} 
      //     />
      //   );
      // },
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Next Fumigation Date",
      selector: "Next_Fumigation_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty(" + UOM + ")",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      backgroundcolor: "#ff0000",

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.QCClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Fumi. Cleared Qty(" + UOM + ")",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      backgroundcolor: "#ff0000",

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "DO Cleared Qty(" + UOM + ")",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      backgroundcolor: "#ff0000",

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
  ];

  useEffect(() => {
    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData, Trigger]);

  const getMonthName = (monthyear) => {
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results /*, CurrentMonthYear:monthyear*/
          })
          setTableData(data.results);

        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onTextChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (Val == "chkSelect") {
        if (i === index) {
          CheckList[i].chkSelect = e.target.checked;
          
          // }else{
          //   CheckList[i].chkSelect = false;
        }
      }
    }
    console.log(CheckList);
    //form.setValues({...form.values,CheckList});
  }

  const getSelectedRows = (CheckList, actionPerform) => {
    let selectedItem = [];
    let DeleteDisabledFlag=false;
    console.log("New DATA 001 => ", JSON.stringify(CheckList));
    for (let i = 0; i < CheckList.length; i++) {
      
      if (CheckList[i].chkSelect === true) {
        if(CheckList[i].Status_String=="Commercial Approved" )
        {
        console.log("CheckList[i].Status_String",CheckList[i].Status_String);
        DeleteDisabledFlag=true;
        }
        selectedItem.push(CheckList[i]);

      }
    }

    if (actionPerform === "EDIT") {
     

      setSelectedData(selectedItem);
      console.log(" Selected Data ==> ", SelectedData);
      handleShowModal(true);

    } else if (actionPerform === "DELETE") {
      if(DeleteDisabledFlag)
      {
        errorToast("Approved Records cannt be deleted.");
        return;
      }
      confirmDialog({
        title: "Please confirm for DELETE, Are you sure?",
      }).then((res) => {
        console.log("DIALOG RESULT"+res);
        if (res) {
          setDeleteItem(selectedItem);
          console.log(" Selected Data For Delete ==> ", DeleteItem);
        }
      });

      //DeleteData();

    }
  }

  const resetSelectedData = (CheckList) => {
    for (let i = 0; i < CheckList.length; i++) {
      CheckList[i].chkSelect = false;
    }
  }

  const handleShowModal = (showPopUp) => {
    setShowModal((showPopUp) ? (true) : (false));
    console.log(showModal);
  }


  useEffect(() => {
    if (DeleteItem.length > 0) {
      DeleteData(DeleteItem);
    }
  }, [DeleteItem]);

  const DeleteData = (NewData) => {

    console.log("SELECT ITEM FOR DELETE =>", DeleteItem);

    const postdata = {
      screentype: "WPL_DELETE",
      Data: DeleteItem,
      DataLength: DeleteItem.length
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/DeletePlanListUpdate", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Data Deleted Successfully...");
          rest.FetchData();
        } else {
          errorToast("Unable to update record ", data.ErrorMsg);
        }

      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}>
        <Row>
          {/* <Col md="12" sm="12" style={{height:"300px",width:"90%",fontSize:"12px"}}> */}
          <Col md="12" sm="12" style={{ width: "90%", fontSize: "12px" }}>
            <br />
            <h4> {title} : {monthName} </h4>
            <TableComponent columns={taColumns} data={TableData} hideSearch showDownload exceltype = {"PLAN"} />
          </Col>
        </Row>
        <br />
        <Row>
          &nbsp; &nbsp; &nbsp;
          <Col md="3" sm="12">
            <Button.Ripple color="primary waves-effect" onClick={() => getSelectedRows(form.values.CheckList, "EDIT") /*handleShowModal(form.setValues({...form.values,CheckList}))*/}>
              Edit
            </Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button.Ripple color="primary waves-effect" type="button" onClick={(e) => {
              /*confirmDialog({
                title: "Please confirm for DELETE, Are you sure?",
              }).then((res) => {
                if (res) {*/
                  getSelectedRows(form.values.CheckList, "DELETE");
                /*}
              });*/
            }}>Delete</Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
          </Col>
        </Row>
      </div>

      {/* SHOW MODLE */}
      {SelectedData.length > 0 &&

        <Modal open={showModal} closeOnEsc showCloseIcon closeOnOverlayClick
          onClose={() => {
            setShowModal(false);
            resetSelectedData(form.values.CheckList);
          }}


          center
          classNames={{
            // overlay: 'customOverlay',
            // modal: 'customModal',

            overlayAnimationIn: 'customEnterOverlayAnimation',
            overlayAnimationOut: 'customLeaveOverlayAnimation',
            modalAnimationIn: 'customEnterModalAnimation',
            // modalAnimationOut: 'customLeaveModalAnimation',
          }}
          animationDuration={300}
        >
          <h2>Edit Selected Data</h2>
          <Row>
            <div style={{
              border: "2px solid #7367f0 ",
              padding: "5px",
              borderRadius: "10px",
              marginTop: "1px",
              overflow: "auto",
              width: "100%",
              marginLeft: "10px",
              marginRight: "10px",
            }}>
              <Col>
                <InputTable data={SelectedData} form={form} setShowModal={setShowModal} FetchData={rest.FetchData} />
              </Col>
            </div>
          </Row>

        </Modal>

      }
    </Fragment>
  );
};


export const LotInformation_Planned_Unplanned = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {

  //console.log("Weekly Plan Month => ",monthyear);

  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const [SelectedData, setSelectedData] = useState();
  const { lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid } = rest;
  let { showLoader, hideLoader } = useLoader();

  const taColumns = [
    {
      name: "Status",
      selector: "",
      sortable: true,
      minWidth: "150px",
      hideInExcel: true,
      cell: (row, index) => {
        return (
          <div style={{/*backgroundColor:"#f47373",color:"#FFFFFF", width:"100%", height:"100%",*/ textAlign: "left" }}>

            {/*MOHAN 1==2 ALWAYS FAIL ADDED SELECT CHECKBOX NOT REQUIRED IN UNPLANNED LIST */}
            {/*1==2 && row.Status_String !== "Commercial Approved" && */
              <>
                {/* {row.ApprovalEnableFlag === "1" && */}
                  <input /*style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}*/
                    type="checkbox" id={`chkSelect_${index}`}
                    form={form} name={row.Status_String}
                    onChange={(e) => onSelectChange(e, row.planid, form.values.CheckList,"chkSelect",index)} 
                  />
                {/* } */}
                &nbsp;&nbsp;{row.Status_String}
              </>
            }
            {/* {row.Status_String} */}
          </div>

        );
      },
    },
    {/* Text Box  */
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: true,
      minWidth: "130px",
      wrap: true,

    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinNo",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock (" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "AvailabelQty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (" + UOM + ")",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.QCClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Next QC Date",
      selector: "Next_QC_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Fumi. Cleared Qty (" + UOM + ")",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Next Fumi. Date",
      selector: "Next_Fumigation_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "DO Cleared Qty (" + UOM + ")",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
  ];

  useEffect(() => {
    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) => {
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let InitValue = "";
    setRejectReason(InitValue);
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results
          })
          getRejectReason(data.results);
        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onSelectChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (i === index) {
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
      }
      //console.log("NEW DATA => ",CheckList);
    }
  }

  const getRejectReason = (Data) => {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].status === "-2") {
        setRejectReason(Data[i].RejectReason);
      }
    }
  }

  const getSelectedRows = (CheckList, actionPerform) => {
    let count =0;
    let selectedItem = [];
    console.log("New DATA 001 => ", JSON.stringify(CheckList));
    for (let i = 0; i < CheckList.length; i++) {
      if (CheckList[i].chkSelect === true) {
        count++;  
        CheckList[i].chkSelect = false;
        selectedItem.push(CheckList[i]);
        if (count>=5){
          break;
        }
      }
    }

    if (actionPerform === "EDIT") {
      console.log(" Seleted DATA 123456 : ",selectedItem);
      setSelectedData(selectedItem);
      // Call New Edit Page
      history.push({
        pathname: '/warehouse/plan/Plan_LotInformationPlannedUnplannedEdit',
        state: { detail: selectedItem }
      });
      
    }
  }

  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "12px" }}>
        <Row>
          <Col md="12" sm="12" style={{ width: "90%", fontSize: "12px" }}>
            <br />
            <h4> {title} </h4>
            <br />
            <TableComponent id={rest.id} columns={taColumns} data={form.values.CheckList} showDownload hideSearch exceltype = {"PLAN"} />
          </Col>
        </Row>
        <br />
        <Row>
          &nbsp; &nbsp; &nbsp;
          <Col md="3" sm="12">
            <Button.Ripple color="primary waves-effect" onClick={() => getSelectedRows(form.values.CheckList, "EDIT")}>
              Edit 5 selected Record only
            </Button.Ripple>
          </Col>
        </Row>
        <br/>
      </div>
    </Fragment>
  );
};

export const Plan_Report_ApprovalScreen = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const { lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid } = rest;
  let { showLoader, hideLoader } = useLoader();

  const taColumns = [
    {
      name: "Status",
      selector: "",
      sortable: true,
      minWidth: "150px",
      hideInExcel: true,
      cell: (row, index) => {
        return (
          <div style={{/*backgroundColor:"#f47373",color:"#FFFFFF", width:"100%", height:"100%",*/ textAlign: "left" }}>
            {/*MOHAN 1==2 ALWAYS FAIL ADDED SELECT CHECKBOX NOT REQUIRED IN UNPLANNED LIST */}
            {1 == 2 && row.Status_String !== "Commercial Approved" &&
              <>
                {row.ApprovalEnableFlag === "1" &&
                  <input /*style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}*/
                    type="checkbox" id={`chkSelect_${index}`}
                    form={form} name={row.Status_String}
                  //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",index)} 
                  />
                }
                &nbsp;&nbsp;{row.Status_String}
              </>
            }
            {row.Status_String}

          </div>

        );
      },
    },
    {/* Text Box  */
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,

    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinNo",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock (" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "AvailabelQty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Next Fumigation Date",
      selector: "Next_Fumigation_Date",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (" + UOM + ")",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.QCClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Fumi. Cleared Qty (" + UOM + ")",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "DO Cleared Qty (" + UOM + ")",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Pending With",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      cell: (row, index) => {
        return (
          <div>
            {row.status == -2 && "Entry Team"}
            {row.status == -1 && "Entry Team"}
            {row.status == 0 && "Entry Team"}
            {row.status == 1 && "R&D Team"}
            {row.status == 2 && "Commercial Team"}
            {row.status == 3 && "Commercial"}
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: "Status_String",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
  ];

  useEffect(() => {
    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) => {
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let InitValue = "";
    setRejectReason(InitValue);
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results /*, CurrentMonthYear:monthyear*/
          })
          getRejectReason(data.results);
        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onSelectChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (i === index) {
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
      }
      //console.log("NEW DATA => ",CheckList);
    }
  }

  const getRejectReason = (Data) => {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].status === "-2") {
        setRejectReason(Data[i].RejectReason);
      }
    }
  }

  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "12px" }}>
        <Row>
          <Col md="12" sm="12" style={{ width: "90%", fontSize: "12px" }}>
            <br />
            <h4>Plan Approval Screen - Report</h4>
            <br />
            <TableComponent columns={taColumns} data={form.values.CheckList} showDownload hideSearch exceltype = {"PLAN"}/>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};


export const Plan_Testing = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {

  const [monthName, setmonthName] = useState();
  const [showModal, setShowModal] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [SelectedData, setSelectedData] = useState([]);
  const [DeleteItem, setDeleteItem] = useState([]);

  const [RejectReason, setRejectReason] = useState();

  let { showLoader, hideLoader } = useLoader();

  const taColumns = [
    {
      name: "Select",
      selector: "",
      sortable: true,
      minWidth: "150px",
      cell: (row, index) => {
        return (
          <div style={{ textAlign: "left" }}>
            {row.Status_String !== "Commercial Approved" &&
              <>
                {row.ApprovalEnableFlag === "1" &&
                  <CustomInput type="checkbox" className="custom-control-Primary"
                    id={`chkSelect_${index}`}
                    label={row.Status_String}
                    onChange={(e) => onCheckChange(e, row.planid, form.values.CheckList, "chkSelect", index)}
                  />
                }
                &nbsp;&nbsp;
                {row.ApprovalEnableFlag === "0" && row.Status_String}
              </>
            }
            {row.Status_String === "Commercial Approved" && row.Status_String}

          </div>
        );
      },
    },
    {
      name: "Priority",
      selector: "Priority",
      sortable: true,
      minWidth: "130px",
      wrap: false,
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinName",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock (" + UOM + ")",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(" + UOM + ")",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(" + UOM + ")",
      selector: "wheatqty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(" + UOM + ")",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(" + UOM + ")",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(" + UOM + ")",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (" + UOM + ")",
      selector: "",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.QCClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.QC_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "Fumi. Cleared Qty (" + UOM + ")",
      selector: "",
      sortable: true,
      minWidth: "130px",
      wrap: true,

      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.FumigationClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Fumi_Cleared_Qty}
          </div>
        );
      },

    },
    {
      name: "DO Cleared Qty (" + UOM + ")",
      selector: "",
      sortable: true,
      minWidth: "130px",
      wrap: true,
      cell: (row, index) => {
        return (
          <div
            style={{
              backgroundColor: row.KeyloanClearedColor,
              color: "#FFFFFF",
              width: "100%",
              height: "100%",
              textAlign: "center",
              paddingTop: "15%"
            }}>
            {row.Keyloan_Cleared_Qty}
          </div>
        );
      },

    },
  ];

  useEffect(() => {
    if (DeleteItem.length > 0) {
      DeleteData_FromEntryList(DeleteItem);
    }

    fetchPlanList(monthyear);
    setmonthName(getMonthName(monthyear));
  }, [monthyear, postData, DeleteItem]);

  // useEffect(() => {
  //   if (DeleteItem.length>0){
  //     DeleteData_FromEntryList(DeleteItem);
  //   }
  // }, [DeleteItem]);

  const getMonthName = (monthyear) => {
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear();

    return month_Name;
  }

  const fetchPlanList = (monthyear) => {
    let fdata = {
      MonthYear: monthyear,
      ...postData,
    };

    showLoader();
    apiPostMethod(url, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response Data :: " + JSON.stringify(response));
        if (data.success) {
          form.setValues({
            ...form.values,
            CheckList: data.results
          })
          setTableData(data.results);
        }
        console.log("Result Data :: " + JSON.stringify(form));
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });

  const onCheckChange = (e, PKey, CheckList, Val, index) => {
    for (let i = 0; i < CheckList.length; i++) {
      if (i === index) {
        if (Val == "chkSelect") {
          CheckList[i].chkSelect = e.target.checked;
        }
      }
      //console.log(CheckList);
    }
  }

  const onTextChange = (e, CheckList) => {
    setRejectReason(e.target.value);
    CheckList.RejectReason = e.target.value;
    console.log(JSON.stringify(CheckList));
    form.setValues({ ...form.values, CheckList });
  }

  const selectAction = (SelectedForm, SelectedType) => {
    // screenType === "PLAN_ENTRYLIST" && 
    //       screenType === "PLAN_RND_CONFIRMMATION" &&
    //         screenType === "PLAN_COMMERCIAL_APPROVAL" &&

    if (SelectedForm === "PLAN_ENTRYLIST") {
      if (SelectedType === 0) {
        getSelectedRows(form.values.CheckList, "ENTRY_EDIT")
      } else {
        getSelectedRows(form.values.CheckList, "ENTRY_DELETE");
      }
    } else if (SelectedForm === "PLAN_RND_CONFIRMMATION" || screenType === "PLAN_COMMERCIAL_APPROVAL") {
      if (SelectedType === 0) {
        onUpdatedata(0, form.values.CheckList, "APPROVAL")
      } else {
        onUpdatedata(1, form.values.CheckList, "REJECT", RejectReason)
      }
    }
  }

  const getSelectedRows = (CheckList, actionPerform) => {
    let selectedItem = [];
    console.log("New DATA 001 => ", JSON.stringify(CheckList));
    for (let i = 0; i < CheckList.length; i++) {
      if (CheckList[i].chkSelect === true) {
        selectedItem.push(CheckList[i]);
      }
    }

    if (actionPerform === "ENTRY_EDIT") {

      setSelectedData(selectedItem);
      console.log(" Selected Data ==> ", SelectedData);
      handleShowModal(true);

    } else if (actionPerform === "ENTRY_DELETE") {

      setDeleteItem(selectedItem);
      console.log(" Selected Data For Delete ==> ", DeleteItem);
      DeleteData_FromEntryList();

    }
  }

  const resetSelectedData = (CheckList) => {
    for (let i = 0; i < CheckList.length; i++) {
      CheckList[i].chkSelect = false;
    }

  }

  const handleShowModal = (showPopUp) => {
    setShowModal((showPopUp) ? (true) : (false));
    console.log(showModal);
  }

  const DeleteData_FromEntryList = (NewData) => {
    console.log("SELECT ITEM FOR DELETE =>", DeleteItem);

    const postdata = {
      screentype: "WPL_DELETE",
      Data: DeleteItem,
      DataLength: DeleteItem.length
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/DeletePlanListUpdate", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));
        if (data.success) {
          ShowToast("Data Deleted Successfully...");
        } else {
          errorToast("Unable to update record ", data.ErrorMsg);
        }

      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const onUpdatedata = (Selection, CheckList, actionType, ReasonToReject) => {
    let selectedItem = [];
    console.log("Update DATA  => ", JSON.stringify(CheckList));

    if (actionType === "APPROVAL") {
      for (let i = 0; i < CheckList.length; i++) {
        if (CheckList[i].chkSelect === true) {
          selectedItem.push(CheckList[i]);
        }
      }
    } else if (actionType === "REJECT") {
      for (let i = 0; i < CheckList.length; i++) {
        if (CheckList[i].status === "1") {
          selectedItem.push(CheckList[i]);
        }
      }
    }

    if (Selection === 0) {
      Save_RnD_Data(selectedItem, actionType, ReasonToReject);
    } else {
      Save_Commercial_Data(selectedItem, actionType, ReasonToReject);
    }
  }

  const Save_RnD_Data = (NewData, ScreenType, ReasonToReject) => {
    const postdata = {
      screentype: ScreenType,
      Data: NewData,
      Reason: ReasonToReject
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        if (data.success) {
          ShowToast("Saved Successfully...");
        } else {
          if (data.ErrorMsg) {
            errorToast("ERROR :: " + data.ErrorMsg);
          } else {
            errorToast("Unable to update record");
          }
        }
      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const Save_Commercial_Data = (NewData, ScreenType, ReasonToReject) => {
    const postdata = {
      screentype: ScreenType,
      Data: NewData,
      Reason: ReasonToReject
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: " + JSON.stringify(response));

        let RespId = data.success;

        if (RespId && RespId >= 1) {
          ShowToast("Saved Successfully...");
        } else {
          if (data.ErrorMsg) {
            errorToast(data.ErrorMsg);
          } else {
            errorToast("Unable to update record");
          }
        }
      })
      .catch((error) => {
        console.log(" Error Data ::: " + JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  return (
    <Fragment>
      <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}>
        <Row>
          {/* <Col md="12" sm="12" style={{height:"300px",width:"90%",fontSize:"12px"}}> */}
          <Col md="12" sm="12" style={{ width: "90%", fontSize: "12px" }}>
            <br />
            <h4> {title} : {monthName} </h4>
            <br />
            <TableComponent columns={taColumns} data={TableData} hideSearch showDownload />
          </Col>
        </Row>
        <br />

        {screenType === "PLAN_ENTRYLIST" &&
          screenType === "PLAN_RND_CONFIRMMATION" &&
          screenType === "PLAN_COMMERCIAL_APPROVAL" &&

          <Row>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Col md="3" sm="12">

              <Button.Ripple color="primary waves-effect" type="button"
                onClick={() => selectAction(screenType, 0)}>
                {screenType === "PLAN_ENTRYLIST" && "Edit"}
                {(screenType === "PLAN_RND_CONFIRMMATION" ||
                  screenType === "PLAN_COMMERCIAL_APPROVAL") &&
                  "Approval"
                }
              </Button.Ripple>

              &nbsp; &nbsp; &nbsp; &nbsp;
              <Button.Ripple color="primary waves-effect" type="button"

                onClick={(e) => {
                  confirmDialog({
                    title: "Please confirm for DELETE, Are you sure?",
                  }).then((res) => {
                    if (res) {
                      selectAction(screenType, 1);
                    }
                  });
                }}>
                {screenType === "PLAN_ENTRYLIST" && "Delete"}
                {(screenType === "PLAN_RND_CONFIRMMATION" ||
                  screenType === "PLAN_COMMERCIAL_APPROVAL") &&
                  "Reject"
                }
              </Button.Ripple>
              &nbsp; &nbsp; &nbsp; &nbsp;
            </Col>

            {(screenType === "PLAN_RND_CONFIRMMATION" ||
              screenType === "PLAN_COMMERCIAL_APPROVAL") &&
              <Col md="3" sm="12">
                <CustomTextInput /*style={{fontSize:"12px", height:"30px", weight:"10px", marginBottom:"-10px"}}*/
                  type="text"
                  id={`rejectreason`}
                  form={form}
                  placeholder={"Reason for Reject !"}
                  value={RejectReason}
                  onChange={(e) => onTextChange(e, form.values.CheckList)}
                />
              </Col>
            }

          </Row>
        }
      </div>


      {/* SHOW MODLE */}
      {screenType === "PLAN_ENTRYLIST" && SelectedData.length > 0 &&

        <Modal open={showModal} closeOnEsc showCloseIcon closeOnOverlayClick center
          onClose={() => {
            setShowModal(false);
            resetSelectedData(form.values.CheckList);
          }}

          classNames={{
            // overlay: 'customOverlay',
            // modal: 'customModal',

            overlayAnimationIn: 'customEnterOverlayAnimation',
            overlayAnimationOut: 'customLeaveOverlayAnimation',
            modalAnimationIn: 'customEnterModalAnimation',
            // modalAnimationOut: 'customLeaveModalAnimation',
          }}
          animationDuration={300}
        >

          <h2>Edit Selected Data</h2>
          <Row>
            <div style={{
              border: "2px solid #7367f0 ",
              padding: "5px",
              borderRadius: "10px",
              marginTop: "1px",
              overflow: "auto",
              width: "100%",
              marginLeft: "10px",
              marginRight: "10px",
            }}>
              <Col>
                <InputTable data={SelectedData} />
              </Col>
            </div>
          </Row>
        </Modal>
      }

    </Fragment>
  );
};