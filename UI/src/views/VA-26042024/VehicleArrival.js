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
import { vaUrl, BASE_URL, apiBaseUrl } from "../../urlConstants";
import TruckListTable from "../common/TruckListTable";
import VehicleArrivalForm from "../IAS/receiving/vehicle-arrival/vehicle-arrival-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { statusCode } from "../../helper/appHelper";
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
          let vehicle_info = [...data.silo_to_mill, ...data.sdi, ...data.rake, ...data.re_direct, ...data.gate_in_out_info, ...data.fg_sales_return_info, ...data.loading_unloading_info]
          // console.log(vehicle_info)
          // setVehicleNofetch([{ options: vehicle_info }]);
          const map = new Map()
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
    const vehicleNo = selectedOption.label
    const id = selectedOption.value


    console.log(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/${vehicleNo}`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getFgSalesReturnInfo/${vehicleNo}`)
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
      console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/${vehicleNo}/0/${UserDetails.USERID}`);
      apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/${vehicleNo}/0/${UserDetails.USERID}`)
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
      console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${id}/${UserDetails.USERID}`);
      apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${id}/${UserDetails.USERID}`)
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
            Vehicle_Number_data_fetch(selectedOption.value, selectedOption.label);
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
              <Col md="4" sm="12">
                <FormGroup>
                  <h5>Vehicle Number</h5>
                  <Select
                    value={selectedValue}
                    onChange={(e) => handleChange(e)}
                    // options={optionsData}
                    options={VehicleNofetch}
                  />
                  <span id="ZPO_NUMBER_Error" style={{ color: "red" }} ></span>
                </FormGroup>
              </Col>
              {(VEHICLE_TYPE || vehicle_type || SCREEN_TYPE || moduleType || returnRefNo) &&
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>Movement Type</Label>
                    <Input type="text" disabled={true} value={VEHICLE_TYPE === 'Truck' ? 'Purchase' : VEHICLE_TYPE === 'Container' ? 'Purchase' : VEHICLE_TYPE === 'Rake' ? 'Purchase' : vehicle_type === 'Rake' ? 'Purchase' : SCREEN_TYPE == "EVADP" ? 'IAS' : moduleType != '' ? moduleType : SCREEN_TYPE} placeholder="Movement Type" />
                    <span id="ZPO_NUMBER_Error" style={{ color: "red" }} ></span>
                  </FormGroup>
                </Col>}
            </Row>
            {/* <TabControl tabList={tabs} /> */}
            {SCREEN_TYPE === "EVADP" ? <VehicleArrivalForm results={Results} /> : null}
            {VECHICAL_STATUS == 35 ? <TruckArrivalRedirct results={Results} /> : null}
            {(VECHICAL_STATUS == '' || VECHICAL_STATUS == undefined) && (VEHICLE_TYPE === "Truck" || VEHICLE_TYPE === "Container" || VEHICLE_TYPE === "TRUCK" || VEHICLE_TYPE === "CONTAINER") ? <TruckArrival results={Results} /> : null}
            {SCREEN_TYPE === "SILOTOMILL" ? <STMTruckArrival results={Results} /> : null}
            {(vehicle_type === "Rake" || vehicle_type === "RAKE") ? <TruckArrivalRake results={Results} /> : null}
            {moduleType == 'FG-STO' ? <STOGateIn data={stoData} setModuleType={setModuleType} setSelectedValue={setSelectedValue} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {returnRefNo != '' ? <FGReturnGateIn data={data} setReturnRefNo={setReturnRefNo} setSelectedValue={setSelectedValue} setData={setData} setModuleType={setModuleType} moduleType={moduleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} /> : null}
            {moduleTypeId == 6 || moduleTypeId == 20 ? <SSAndPMUnloadingGateIn data={stoData} setReturnRefNo={setReturnRefNo} setSelectedValue={setSelectedValue} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setModuleType={setModuleType} /> : null}
            {moduleTypeId == 5 ? <GatePassGateIn data={stoData} setSelectedValue={setSelectedValue} setData={setData} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle} setModuleType={setModuleType} /> : null}
            {moduleTypeId == 13 ? <SDGStoGateIn data={stoData} setData={setStoData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} setModuleTypeId={setModuleTypeId} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle}/> : null}
            {moduleType == 'Gate pass - Receipt' ? <GatePassReceiptGateIn data={data} setData={setData} setSelectedValue={setSelectedValue} setModuleType={setModuleType} getUnLoadingData={getUnLoadingData} Unloading_Gate_in_Vehicle={Unloading_Gate_in_Vehicle}/> : null}
          </CardBody> : <Purchase getUnLoadingData={getUnLoadingData} />

        }
      </Card>

      {unloadingData != '' ? <TruckDetails loadingData={unloadingData} getLoadingData={getUnLoadingData} /> : null}

      <CashDetails />

      <HandCarryDetails />

      {unloadingData == '' ? <div style={{ marginBottom: "250px" }}></div> : null}
    </div>
  );
};

export default VehicleArrival;
