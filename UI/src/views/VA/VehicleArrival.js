import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button, FormGroup, Row, Col, Label, Input, ButtonGroup, Progress } from "reactstrap";
import { useLoader } from "../../utility/hooks/useLoader";
import TabControl from "../../@core/components/tab/TabControl";
import TruckArrival from "./TruckArrival";
import STMTruckArrival from "./STMTruckArrival";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { vaUrl, BASE_URL, apiBaseUrl, evaUrl } from "../../urlConstants";
import TruckListTable from "../common/TruckListTable";
import VehicleArrivalForm from "../IAS/receiving/vehicle-arrival/vehicle-arrival-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { ShowToast, statusCode } from "../../helper/appHelper";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { FormattedNumberParts } from "react-intl";
import Select from "react-select";
import { HrLine } from "../common/HrLine";
import TruckArrivalRake from "./TruckArrivalRake";
import TruckArrivalRedirct from "./TruckArrivalRedirct";
import STOGateIn from "../FG/STO/UnLoading/STOGateIn";
import FGReturnGateIn from "../FG/Unloading/FGReturnGateIn";
import TruckDetails from "../FG/TruckDetails";
import CashDetails from "../FG/CashDetails";
import RmReturnGateIn from "../RM/Loading/salesReturn/RmReturnGateIn";
import RmWaterGateIn from "../RM/Unloading/rmWater/RmWaterGateIn";
import SSAndPMPurchaseGateIn from "../SSAndPM/Unloading/purchase/SSAndPMPurchaseGateIn";
import SSAndPMUnloadingGateIn from "../SSAndPM/Unloading/sto/GateIn";
import Purchase from "./Purchase";
import GatePassGateIn from "../GatePass/Unloading/GatePassGateIn";
import SDGStoGateIn from "../SDG/sto/Unloading/SDGStoGateIn";
import GatePassReceiptGateIn from "../GatePass/Unloading/GatePassReceiptGateIn";
import HandCarryDetails from "../FG/HandCarryDetails";
import { apiGetMethod } from "../../helper/axiosHelper";
import CivilTruckGateIn from "../SewageAndCivilTruck/Unloading/CivilTruckGateIn";
import RAndDSampleGateIn from "../R&DSample/RAndDSampleGateIn";
import CustomMillingGateIn from "../CustomMilling/CustomMillingGateIn";
import D2RSalesGateIn from "../D2RSales/D2RSalesGateIn";
import BarcodeScanner from "../common/BarcodeScanner";
import { upperCase } from "lodash";

const VehicleArrival = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  const [poOptions, setPOdata] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState("");
  const [VehicleNofetch, setVehicleNofetch] = useState([]);
  const [SCREEN_TYPE, setSCREEN_TYPE] = useState("");
  const [VEHICLE_TYPE, setVEHICLE_TYPE] = useState("");
  const [vehicle_type, setvehicle_type] = useState("");
  const [VECHICAL_STATUS, setVECHICAL_STATUS] = useState("");

  const [Results, setResults] = useState("");

  const Unloading_Gate_in_Vehicle = () => {
    const fdata = { plantIds: UserDetails.plantids.toString() }
    // const fdata = { plantIds: "" }
    apiPostMethod(apiBaseUrl + "RakeloadingController/Unloading_Gate_in_Vehicle", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let vehicle_info = [...data.silo_to_mill, ...data.sdi, ...data.rake, ...data.re_direct, ...data.fg_sales_return_info, ...data.loading_unloading_info, ...data.gate_in_out_info]
          console.log(vehicle_info)
          // setVehicleNofetch([{ options: vehicle_info }]);

          const map = new Map();
          let values = vehicle_info
          values.forEach(v => map.set(v.label, v)) // having value is always unique
          values = [...map.values()];
          setVehicleNofetch(([{ options: values }]))
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  }



  useEffect(() => {
    Unloading_Gate_in_Vehicle()
    getAllGateInOutInfo()
    QRCodeControl()
  }, []);

  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    includeIas: true,
    // vehicleStatus: "1,2,3,4,5,6,23,24,19,22",
    vehicleStatus: "5",
    cfilter: "IsFromSDT = 0",
  });

  let SiloExist = UserDetails.plantids.length == 0 || UserDetails.plantids.includes("1010") || UserDetails.plantids.includes("FM01");

  console.log("SiloExist" + SiloExist);

  const onUpdateStatus = (val, id, INCO1, status, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM) => {
    //if (val === statusCode.IN || status === statusCode.REJECTED_GATE_OUT)
    if (val === statusCode.IN || status === statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN || status === statusCode.REJECTED_GATE_OUT) {
      let fdata = { id: id, status: status, formType: "U", pod: INCO1, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM };
      showLoader();
      apiPostMethod(vaUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setFilter((p) => ({ ...p }));
          }
        })
        .catch((error) => {
          console.log(error);
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else if (val === statusCode.GATEOUT) {
      history.push(`/UP:${id}`);
    }
  };
  // const onUpdateIrsStatus = (val, row) => {
  //   let { ID: id, PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
  //   if (val == statusCode.IN) {
  //     let fdata = { ID: id, VEHICLE_STATUS: 4, formType: "U" };
  //     showLoader();
  //     apiPostMethod(evaUrl, fdata)
  //       .then((response) => {
  //         const { data } = response;
  //         if (data.success) {
  //           refreshTable();
  //         }
  //       })
  //       .catch((error) => {
  //         errorToast("Something went wrong, please try again after sometime");
  //       })
  //       .finally(() => hideLoader());
  //   } else if (val == statusCode.GATEOUT) {
  //     // history.push(`/IASRGO/${type}/${emtArrivalId}/${arrivalId}`);
  //     history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
  //   }
  // };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };
  const tabs = [
    {
      id: "ias",
      title: "IAS PO Number",
      renderTab: () => <VehicleArrivalForm onAdded={refreshTable} />,
    },
    {
      id: "sto",
      title: "PO Number",
      renderTab: () => <TruckArrival onAdded={refreshTable} />,
    },
    {
      id: "stm",
      title: "Silo to Mill",
      ShowTab: SiloExist,
      renderTab: () => <STMTruckArrival onAdded={refreshTable} />,
    },
  ];
  const actionsCol = (row) => {
    let status = Number(row.VECHICAL_STATUS);
    if ((row.SCREEN_TYPE == "IAS" || row.SCREEN_TYPE == "SILOTOMILL") && row.QA_STATUS !== "R") {
      if (status == statusCode.IN) {
        return (
          <>
            <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(status, row.PI_REFID, row.INCO1, statusCode.UNLOAD)}>
              Gate In
            </Button.Ripple> &nbsp;
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                window.open(BASE_URL + "/#/Slip:" + row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
              }}
            >
              Print
            </Button.Ripple>
          </>


        );
      } else if (status == statusCode.GATEOUT) {
        return (
          <>
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                let { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;

                if (row.SCREEN_TYPE == "SILOTOMILL") {
                  history.push(`/silotomill/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                } else {
                  history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                }
              }}
            >
              Gate Out
            </Button.Ripple> &nbsp;
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                window.open(BASE_URL + "/#/Slip:" + row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
              }}
            >
              Print
            </Button.Ripple></>



        );
      }

    } else {
      return (
        (status == statusCode.IN || status == statusCode.GATEOUT) && (
          <>
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                if (row.QA_STATUS === "R" && status == statusCode.GATEOUT) {
                  let msg = "This Vehicle got rejected by QC. Are you sure you want to proceed for gateout?";
                  if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                    msg = `This ${row.VEHICLE_TYPE} got redirected to another plant. Are you sure you want to proceed for gateout`;
                  }
                  confirmDialog({
                    title: "Are you sure?",
                    description: msg,
                  }).then((res) => {
                    if (res) {
                      if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                        onUpdateStatus(status, row.PI_REFID, row.INCO1, statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN, row.REDIRECT_LGORT, row.REDIRECT_WERKS, row.REDIRECT_PO_LINE_ITEM);
                      } else {
                        onUpdateStatus(status, row.PI_REFID, row.INCO1, statusCode.REJECTED_GATE_OUT);
                      }
                      //

                    }
                  });
                } else {
                  onUpdateStatus(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK);
                }
              }}
            >{`${status == statusCode.IN ? "Gate In" : status == statusCode.GATEOUT ? "Gate Out" : ""}`}</Button.Ripple>
            &nbsp;
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                history.push(`/QAView:${row.PI_REFID}/VA`);
              }}
            >
              {"View QC"}
            </Button.Ripple>
          </>
        )
      );
    }
  };

  const [moduleType, setModuleType] = useState('');
  const [moduleTypeId, setModuleTypeId] = useState('');
  const [returnRefNo, setReturnRefNo] = useState('');
  const [data, setData] = useState('');
  const [stoData, setStoData] = useState('');

  function handleChange(selectedOption) {
    // console.log("644654564564564564  : ", selectedOption.value);
    console.log(selectedOption)
    setSelectedValue(selectedOption);
    const vehicleNo = selectedOption?.label
    const id = selectedOption?.value
    const vehicleNo1 = selectedOption[0]?.label
    const id1 = selectedOption[0]?.value

    console.log(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/${vehicleNo || vehicleNo1}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/${vehicleNo || vehicleNo1}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setData(data.results[0]);
          setReturnRefNo(data.results[0].returnRefNo);
          setModuleType(data.results[0].moduleType)
          setVECHICAL_STATUS(0)
          setSCREEN_TYPE('')
          setvehicle_type('')
          setModuleTypeId('')
          setVEHICLE_TYPE('')
        }
        else if (data.success == false) {
          getLoadingAndUnloadingInfo(vehicleNo);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })

    const getLoadingAndUnloadingInfo = () => {
      console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/${vehicleNo || vehicleNo1}/0/${UserDetails.USERID}`);
      apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/${vehicleNo || vehicleNo1}/0/${UserDetails.USERID}`)
        .then((response) => {
          const { data } = response;
          if (data.success == true) {
            setData(data.results[0]);
            setModuleType(data.results[0].moduleType);
            setReturnRefNo('')
            setVECHICAL_STATUS(0)
            setSCREEN_TYPE('')
            setvehicle_type('')
            setVEHICLE_TYPE('')
            setModuleTypeId('')
          }
          else if (data.success == false) {
            getGateInInfo(id);
          }
        }).catch((error) => {
          console.log(JSON.stringify(error))
          errorToast("Something went wrong, please try again after sometime");
        })
    }

    const getGateInInfo = () => {
      setModuleTypeId('')
      console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${vehicleNo || vehicleNo1}/0/0/${id||id1}/${UserDetails.USERID}`);
      apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${vehicleNo || vehicleNo1}/0/0/${id||id1}/${UserDetails.USERID}`)
        .then((response) => {
          const { data } = response;
          if (data.success == true) {
            setStoData(data);
            setModuleTypeId(data.results[0].moduleTypeId);
            setModuleType(data.results[0].moduleType);
            setReturnRefNo('')
            setVECHICAL_STATUS(0)
            setSCREEN_TYPE('')
            setvehicle_type('')
            setVEHICLE_TYPE('')
          }
          else if (data.success == false) {
            Vehicle_Number_data_fetch(selectedOption.value||id1, selectedOption.label||vehicleNo1);
          }
        }).catch((error) => {
          console.log(JSON.stringify(error))
          errorToast("Something went wrong, please try again after sometime");
        })
    }
  }

  const Vehicle_Number_data_fetch = (value, label) => {
    let fdata = { id: value, vehicle_no: label };
    apiPostMethod(apiBaseUrl + "RakeloadingController/Vehicle_No_ByID", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setModuleType('')
          setReturnRefNo('')
          setModuleTypeId('')
          setVECHICAL_STATUS(data.results[0]?.VECHICAL_STATUS)
          setSCREEN_TYPE(data.results[0]?.SCREEN_TYPE)
          setSCREEN_TYPE(data.results[0]?.SCREEN_TYPE)
          setVEHICLE_TYPE(data.results[0]?.VEHICLE_TYPE)
          setvehicle_type(data.results[0]?.vehicle_type)
          setResults(data.results[0])
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const [unloadingData, setUnLoadingData] = useState('')
  const werks = UserDetails.plantids.join(",");

  const getUnLoadingData = () => {

    const postData = { werks: werks, userGateId: UserDetails.USERID }

    console.log(apiBaseUrl + `LandingDataController/UnloadingData`, postData);
    apiPostMethod(apiBaseUrl + `LandingDataController/UnloadingData`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success == 1) {
          let truck_data = [...data.gate_pro, ...data.purchase];
          console.log(truck_data);
          setUnLoadingData(truck_data);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  useEffect(() => {
    getUnLoadingData()
  }, [])

  const [type, setType] = useState(true);

  const [handCarryData, setHandCarryData] = useState([])

  const getAllGateInOutInfo = () => {
    console.log(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/0/${UserDetails.USERID}/1`);
    apiGetMethod(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/0/${UserDetails.USERID}/1`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setHandCarryData(data.results.filter((item) => item.movementTypeId == 2))
        }
        else if (data.success == false) {
          console.log(data.message);
        }
      }).catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }
  const [QRControl, SetQRControl] = useState(false);
  const [QRControl1, SetQRControl1] = useState(false);
  const [QRControl2, SetQRControl2] = useState(false);

  const [truckValue, setTruckValue] = useState('');

  const QRCodeControl = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
        .then((response) => {
            const data = response.data;
            if (data.success == 1) {
                SetQRControl(data.results)
                SetQRControl1(data.gatein)
                SetQRControl2(data.gateout)
            }
        })
        .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime");
        })
  }
  const handleScan = (barcode) => {
    fetchData(barcode)
};
const fetchData = (barcode) => {
    console.log(`Fetching data for barcode: ${barcode}`);
    setTruckValue(barcode)
    const values = VehicleNofetch[0].options;
    const values1 = unloadingData;

    const otherKey = values.filter(
      opt => opt.label === barcode
    );
    const otherKey1 = values1.filter(
      opt => opt.TRUCK_NO === barcode
    );
      
    if(otherKey1.length > 0){
        entryShow(otherKey1[0])
    }else if(otherKey.length > 0){
      handleChange(otherKey)
    }else{
      errorToast('Please Check Vehicle No...')
    }
};
const entryShow = (row) => {
  let status = Number(row.VECHICAL_STATUS)
  console.log(row.VEHICLE_STATUS)

          if(row.StatusName == "Gate In" && row.VEHICLE_STATUS == 6){
              WaitingGateIn(row.ID)
          }else if(row.StatusName == "Gate Out" && row.VEHICLE_STATUS == 4 ){
               onActionClick(row)
          }else if(row.SCREEN_TYPE == "SILOTOMILL" && row.VEHICLE_STATUS == 5){ 
               onUpdateGateOut(row.ID)
          }else if(row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus != "R" && row.VEHICLE_STATUS == 5 ){
              onUpdateStatu(statusCode.GATEOUT, row.ID)
          }else if(row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus == "R" ){
           
                      let msg = "This Vehicle got rejected. Are you sure you want to proceed for gateout?";
                      confirmDialog({
                          title: "Are you sure?",
                          description: msg,
                      }).then((res) => {
                          if (res) {
                            onUpdateStatu(statusCode.REJECTED_GATE_OUT, row.ID);
                          }
                      });          
          }else if(status == 5 && (row.SCREEN_TYPE == "SILOTOMILL" || row.SCREEN_TYPE == "IAS")){
              const { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
              if (row.SCREEN_TYPE == "SILOTOMILL") {
                  history.push(`/silotomill/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
              } else {
                  history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
              }
          }else if(status == 1 && (row.SCREEN_TYPE == "SDI" || row.SCREEN_TYPE == "SDO")){
            confirmDialog({
              title: "Are you sure want to Gate In?",
            }).then((res) => {
              if (res) {
                onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.UNLOAD)
              }
            })
          }else if(row.VEHICLE_STATUS == 1 && (row.SCREEN_TYPE == "EVADP" || row.SCREEN_TYPE == "SILOTOMILL") && status != 1){
              onUpdateStatusLoadWaitin(row.VEHICLE_STATUS, row.ID)      
          }else if(status == 1 && (row.SCREEN_TYPE == "IAS" || row.SCREEN_TYPE == "SILOTOMILL")){
              onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK)   
          }else if(status == 5 && (row.SCREEN_TYPE == "SDI" || row.SCREEN_TYPE == "SDO")){
                          if (row.QA_STATUS == "R" && status == statusCode.GATEOUT) {
                              let msg = "This Vehicle got rejected by QC. Are you sure you want to proceed for gateout?";
                              if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                                  msg = `This ${row.VEHICLE_TYPE} got redirected to another plant. Are you sure you want to proceed for gateout?`;
                              }
                              confirmDialog({
                                  title: "Are you sure?",
                                  description: msg,
                              }).then((res) => {
                                  if (res) {
                                      if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                                          onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN, row.REDIRECT_LGORT, row.REDIRECT_WERKS, row.REDIRECT_PO_LINE_ITEM);
                                      } else {
                                          onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REJECTED_GATE_OUT);
                                      }
                                  }
                              });
                          } else {
                              onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK);
                          }
                      }
};
const WaitingGateIn = (id) => {

  const postdata = {
      gateInOutInfoId: id,
      moduleStatusId: 1,
      userInfoId: UserDetails.USERID
  }

  confirmDialog({
      title: `<h4>Are you sure want to Gate In?<h4>`,
  }).then((res) => {
      if (res) {
          showLoader();
          console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
          apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
              .then((response) => {
                  const res = response.data;
                  if (res.success == true) {
                      ShowToast(res.message);
                      // getLoadingData()
                  }
                  else if (res.success == false) {
                      errorToast(res.message)
                  }
                  console.log(res);
              })
              .catch((error) => {
                  console.log(error)
                  errorToast("Something went wrong, please try again after sometime");
              })
              .finally((a) => {
                  hideLoader();
              });
      }
  })
      .catch((error) => {
          errorToast("Something went wrong please try again after sometime");

      });
};
const onActionClick = (row) => {
console.log(row)
      if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
          history.push(`/FGReturn/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 2 && row.movementType == 1) {
          history.push(`/STO/Loading/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 2 && row.movementType == 2) {
          history.push(`/STO/Unloading/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 1 || row.moduleTypeId == 29 || row.moduleTypeId == 43) {

          apiPostMethod(apiBaseUrl + `GatePro/Gate/getDeliveryDetails/${row.ID}`)
              .then((response) => {
                  const { data } = response;
                  if (data.success == true) {
                      let stoData = data.stoDeliveryInfo;
                      if (stoData.length > 0) {
                          history.push(`/STO/Loading/GateOut/${row.ID}`);
                      } else {
                          history.push(`/FG/GateOut/${row.ID}`);
                      }
                  }
                  else if (data.success == false) {
                      history.push(`/FG/GateOut/${row.ID}`);
                  }
              }).catch((error) => {
                  console.log(JSON.stringify(error))
                  errorToast("Something went wrong, please try again after sometime");
              })

      } else if ((row.movementType == 1) && (row.moduleTypeId == 6 || row.moduleTypeId == 20 || row.moduleTypeId == 44)) {
          history.push(`/SSANDPM/GateOut/${row.ID}`);
      } else if ((row.movementType == 2) && (row.moduleTypeId == 6 || row.moduleTypeId == 20)) {
          history.push(`/SSANDPM/Unloading/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
          history.push(`/SSANDPM/loading/return/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 8) {
          history.push(`/RMSales/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 14 || row.moduleTypeId == 45) {
          history.push(`/RMWater/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 7) {
          history.push(`/SDGSales/GateOut/${row.ID}`);
      } else if (row.movementType == 1 && row.moduleTypeId == 13) {
          history.push(`/SDG/sto/GateOut/${row.ID}`);
      } else if (row.movementType == 2 && row.moduleTypeId == 13) {
          history.push(`/SDG/sto/unloading/GateOut/${row.ID}`);
      } else if (row.movementType == 1 && row.moduleTypeId == 5) {
          history.push(`/GatePass/Loading/Gateout/${row.ID}`);
      } else if (row.movementType == 2 && row.moduleTypeId == 5) {
          history.push(`/GatePass/Unloading/Gateout/${row.ID}`);
      } else if (row.moduleTypeId == 22) {
          history.push(`/GatePass/Unloading/GatePassReceiptGateOut/${row.ID}`);
      } else if (row.moduleTypeId == 10) {
          history.push(`/GatePass/Unloading/GatePassGateOut/${row.ID}`);
      } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34) {
          history.push(`/purchase/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 24 || row.moduleTypeId == 31) {
          history.push(`/CustomMilling/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 26) {
          history.push(`/GoodsMovement/GoodsMovementGateOut/${row.ID}`);
      } else if (row.moduleTypeId == 27) {
          history.push(`/SewageAndCivil/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 28) {
          history.push(`/CivilTruck/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 37 || row.moduleTypeId == 39 || row.moduleTypeId == 40 || row.moduleTypeId == 41 || row.moduleTypeId == 42) {
        history.push(`/D2RSales/GateOut/${row.ID}`);
      } else if (row.moduleTypeId == 30) {
          history.push(`/R&DSample/GateOut/${row.ID}`);
      }else if (row.moduleTypeId == 38) {
          history.push(`/Diesel/GateOut/${row.ID}`);
      }
  };
const onUpdateStatu = (status, id) => {
  console.log("onUpdateStatus", status, id);
  if (statusCode.GATEOUT == status) {
      history.push(`/warehouse/IAS/GateOut:` + id);
  }
  else {
      let fdata = { ID: id, VEHICLE_STATUS: statusCode.INTRANSIT, formType: "U" };
      showLoader();
      apiPostMethod(evaUrl, fdata)
          .then((response) => {
              const { data } = response;
              if (data.success) {

              }
          })
          .catch(() => {
              errorToast("Something went wrong, please try again after sometime");
          })
          .finally(() => hideLoader());
  }
};
const onUpdateStatusUnLoad = (val, id, INCO1, status, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM) => {
  //if (val === statusCode.IN || status === statusCode.REJECTED_GATE_OUT)
  if (val === statusCode.IN || status === statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN || status === statusCode.REJECTED_GATE_OUT) {
      let fdata = { id: id, status: status, formType: "U", pod: INCO1, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM };
      showLoader();
      apiPostMethod(vaUrl, fdata)
          .then((response) => {
              const { data } = response;
              if (data.success) {
                  // setFilter((p) => ({ ...p }));
                  window.location.reload();
              }
          })
          .catch((error) => {
              console.log(error);
              errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
              hideLoader();
          });
  } else if (val === statusCode.GATEOUT) {
      history.push(`/UP:${id}`);
  }
};
const onUpdateGateOut = (id) => {
  history.push(`/STM_Gateout:${id}/EVADPTruck`);
};

const onUpdateStatusLoadWaitin = (status, id) => {
 
  let fdata = { ID: id, VEHICLE_STATUS: status, formType: "U" };
  showLoader();
  apiPostMethod(evaUrl, fdata)
    .then((response) => {
      const { data } = response;
      if (data.success) {
          window.location.reload();
      }
    })
    .catch(() => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally(() => hideLoader());
}
const getMovementType = () => {

  // All vehicle types that mean Purchase
  const purchaseTypes = [
    "Truck",
    "FCI Truck",
    "Container",
    "Rake",
    "Cm Rake",
    "Cm Truck",
    "Cm Container"
  ];

  if (purchaseTypes.includes(VEHICLE_TYPE)) return "Purchase";
  if (purchaseTypes.includes(vehicle_type)) return "Purchase";
  if (purchaseTypes.includes(VECHICAL_STATUS)) return "Purchase";

  if (SCREEN_TYPE === "EVADP") return "IAS";

  if (moduleType && moduleType !== "") return moduleType;

  return SCREEN_TYPE || "";
};
console.log("VEHICLE_TYPE", VEHICLE_TYPE)
  return (
    <div>
      <Card>
        <CardHeader><h5>Unloading</h5><RefreshBlock1 /></CardHeader>
        <hr />
        <div className="row">
          <div className="col-1"></div>
          <div className="col-10">
            <Row>
              {type ? <Col md="6" sm="6" className="d-flex justify-content-center bg-primary border border-primary" onClick={() => setType(true)}>
                <Button className='text-white' color="white">STO / Return / Wheat Purchase / Gate Pass </Button>
              </Col> : <Col md="6" sm="6" className="d-flex justify-content-center mb-0 border border-primary" onClick={() => setType(true)}>
                <Button className='text-primary' color="white">STO / Return / Wheat Purchase / Gate Pass </Button>
              </Col>}

              {!type ? <Col md="6" sm="6" className="d-flex justify-content-center bg-primary border border-primary" onClick={() => { setType(false) }}>
                <Button className='text-white' color="white">Purchase</Button>
              </Col> : <Col md="6" sm="6" className="d-flex justify-content-center mb-0 border border-primary" onClick={() => { setType(false) }}>
                <Button className='text-primary' color="white">Purchase</Button>
              </Col>}
            </Row>
          </div>
        </div>

        {type ?
          <CardBody>
            <Row>
            {QRControl1 == false &&
              <Col md="4" sm="12">
                <FormGroup>
                  <h5>Vehicle Number</h5>
                  <Select
                    value={selectedValue}
                    onChange={(e) => handleChange(e)}
                    // options={optionsData}
                    options={VehicleNofetch}
                    // isDisabled
                  />
                  <span id="ZPO_NUMBER_Error" style={{ color: "red" }} ></span>
                </FormGroup>
              </Col>}
              {(QRControl1 == true || QRControl2 == true) &&
                        <Col md="4" sm="4">
                            <BarcodeScanner onScan={handleScan} Label={'Vehicle'} QRControl = {QRControl1}/>
                            {/* <QRCodeScanner /> */}
                            { truckValue &&
                            <Input type="text" disabled value={truckValue} hidden = {QRControl1 == false}/>
                            } 
              </Col>}
              {(VEHICLE_TYPE || vehicle_type || SCREEN_TYPE || moduleType || returnRefNo) &&
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>Movement Type</Label>
                    <Input type="text" disabled={true} 
                    // value={VEHICLE_TYPE === 'Truck' ? 'Purchase' : VEHICLE_TYPE === 'FCI Truck' ? 'Purchase' : VEHICLE_TYPE === 'Container' ? 'Purchase' : VEHICLE_TYPE === 'Rake' ? 'Purchase' : vehicle_type === 'Rake' ? 'Purchase' : vehicle_type === 'CM Rake' ? 'Purchase' : VECHICAL_STATUS === 'Cm Truck' ? 'Purchase' : VECHICAL_STATUS === 'Cm Container' ? 'Purchase' : SCREEN_TYPE == "EVADP" ? 'IAS' : moduleType != '' ? moduleType : SCREEN_TYPE}
                    value={getMovementType()}
                    placeholder="Movement Type" />
                    <span id="ZPO_NUMBER_Error" style={{ color: "red" }} ></span>
                  </FormGroup>
                </Col>}
            </Row>
            {/* <TabControl tabList={tabs} /> */}
            {SCREEN_TYPE === "EVADP" ? <VehicleArrivalForm results={Results} /> : null}
            {VECHICAL_STATUS == 35 ? <TruckArrivalRedirct results={Results} /> : null}
            {(VECHICAL_STATUS == '' || VECHICAL_STATUS == undefined) && (VEHICLE_TYPE === "Truck" || VEHICLE_TYPE === "Container" || VEHICLE_TYPE === "TRUCK" || VEHICLE_TYPE === "CONTAINER" || VEHICLE_TYPE === "FCI Truck" || VEHICLE_TYPE === "Cm Truck" || VEHICLE_TYPE === "Cm Container") ? <TruckArrival results={Results} /> : null}
            {SCREEN_TYPE === "SILOTOMILL" ? <STMTruckArrival results={Results} /> : null}
            {(vehicle_type === "Rake" || vehicle_type === "RAKE" || vehicle_type === "Cm Rake") ? <TruckArrivalRake results={Results} /> : null}
            {moduleType == 'FG-STO' ? <STOGateIn data={stoData} setModuleType={setModuleType} setSelectedValue={setSelectedValue} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {returnRefNo != '' ? <FGReturnGateIn data={data} setReturnRefNo={setReturnRefNo} setSelectedValue={setSelectedValue} setData={setData} setModuleType={setModuleType} moduleType={moduleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleTypeId == 6 || moduleTypeId == 20 ? <SSAndPMUnloadingGateIn data={stoData} setReturnRefNo={setReturnRefNo} setSelectedValue={setSelectedValue} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setModuleType={setModuleType} /> : null}
            {moduleTypeId == 5 ? <GatePassGateIn data={stoData} setSelectedValue={setSelectedValue} setData={setData} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setModuleType={setModuleType} /> : null}
            {moduleTypeId == 13 ? <SDGStoGateIn data={stoData} setData={setStoData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleType == 'Gate pass - Receipt' ? <GatePassReceiptGateIn data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleType == 'Civil Truck' ? <CivilTruckGateIn data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleType == 'R&D Sample' ? <RAndDSampleGateIn data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleType == 'Unloading - Without Ref' ? <Row><CustomMillingGateIn  data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleTypeId={setModuleType} getLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setTruckValue={setSelectedValue} setIsDisable={setSelectedValue} setShow={setSelectedValue}/></Row> : null}
            {moduleType == 'D2R Sales Return' || moduleType == 'Canteen Material' || moduleType == 'Trail Material' || moduleType == 'Water Tanker' ? <Row><D2RSalesGateIn data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleTypeId={setModuleType} getLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setTruckValue={setSelectedValue} setIsDisable={setSelectedValue} setShow={setVehicleNofetch} /></Row> : null}
          </CardBody> : <Purchase getUnLoadingData={getUnLoadingData} />
        }
      </Card>

      {unloadingData != '' ? <TruckDetails loadingData={unloadingData} getLoadingData={getUnLoadingData} /> : null}

      <CashDetails />

      <HandCarryDetails data={handCarryData} setData={setHandCarryData} getAllGateInOutInfo={getAllGateInOutInfo} />

      {unloadingData == '' && handCarryData == '' ? <div style={{ marginBottom: "250px" }}></div> : null}
    </div>
  );
};

export default VehicleArrival;
