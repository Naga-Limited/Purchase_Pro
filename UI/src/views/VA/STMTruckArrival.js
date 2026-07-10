import { FormGroup, Row, Col, Button, Label, Input } from "reactstrap";

import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { StopCircle, Check } from "react-feather";
// ** Store
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { vaUrl, sdivhgUrl, msuppUrl, getUsedWt, mpolineUrl, ddlPOUrl,getSTMTruckUrl,tblSTMUrl } from "../../urlConstants";
import { regexValidation } from "../../constants/validConstant";
import { VHConstant } from "./constant";
import { useLoader } from "../../utility/hooks/useLoader";
import { ShowToast } from "../../helper/appHelper";

const STMTruckArrival = ({ onAdded,results }) => {
  let { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  // const [tableFilter, setTableFilter] = useState({
  //   plantIds: UserDetails.plantids,
  //   vehicleStatus: "1,2,3,4,5,6",
  //   cfilter: "IsFromSDT = 0",
  // });
  /**
   * Table States
   */
  // const [currentPage, setCurrentPage] = useState(0);
  // const [Tbldata, setTbldata] = useState([]);
  /**
   * Form States
   */
  const [poOptions, setPOdata] = useState([]);
  const [plantDescOptions, setPlantdata] = useState([]);
  const [storageLocOptions, setStoragedata] = useState([]);
  const [formData, setFormaData] = useState({ ...VHConstant });
  const [isVehicleDrop, setVehicleDrop] = useState(false);
  const [vhOptions, setVHdata] = useState([]);
  const [supplierOptions, setSupplierdata] = useState([]);
  const [screenType, setScreenType] = useState("");
  const [VehicleType, setVehicleType] = useState("");
  const [poLineOptions, setPOLinedata] = useState([]);

  let selectedPo = useRef("");

  // const actionsCol = (row) => {
  //   return row.VECHICAL_STATUS == 1 || row.VECHICAL_STATUS == 5 ? (
  //     <Button.Ripple
  //       color="primary"
  //       onClick={(e) => {
  //         if (row.QA_STATUS === "R" && row.VECHICAL_STATUS == 5) {
  //           let msg = "This Truck got rejected by QC. Are you sure you want to proceed for gateout?";
  //           // let status = 11;
  //           if (row.PICK_SLIP_NO) {
  //             msg = `This ${row.VEHICLE_TYPE} got redirected to another plant. Are you sure you want to proceed for gateout`;
  //           }
  //           confirmDialog({
  //             title: "Are you sure?",
  //             description: msg,
  //           }).then((res) => {
  //             if (res) {
  //               onUpdateStatus(row.VECHICAL_STATUS, row.PI_REFID, row.INCO1, statusCode.REJECTED_GATE_OUT);
  //             }
  //           });
  //         } else {
  //           onUpdateStatus(row.VECHICAL_STATUS, row.PI_REFID, row.INCO1, 2);
  //         }
  //       }}
  //     >{`${row.VECHICAL_STATUS == 1 ? "Gate In" : row.VECHICAL_STATUS == 5 ? "Gate Out" : ""}`}</Button.Ripple>
  //   ) : (
  //     ""
  //   );
  // };

  const onTextChange = (e, key, validKey) => {
    const { value } = e.target ? e.target : e;
    if ((validKey && regexValidation[validKey].test(value)) || !value) {
      setFormaData({ ...formData, [key]: value });
    }
  };
  const checktext = (e) => {
    if(e.which==32){
      return false;
    }
  }

  const onTruckDdlChange = (e, key) => {
    const { value, weight } = e.target ? e.target : e;
    setFormaData({ ...formData, [key]: value, PER_TRUCK_QTY: isVehicleDrop ? Number(weight || 0) : 0 });
  };
  const onAddTruckDetails = (status) => {
    //showLoader();
    let fdata = { ...formData,TRUCK_NO:results.TRUCK_NO,VECHICAL_STATUS: status, formType: "STM_ARRIVAL", screenType: 'STM' };
    console.log(JSON.stringify(fdata));
    
    apiPostMethod(vaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // setFormaData({ ...VHConstant });
          // setSupplierdata([]);
          // setPOLinedata([]);
          // setScreenType("");
          // setVehicleType("");
          // setTableFilter((p) => ({ ...p }));
          ShowToast("Gate in Successfully...");
          window.setTimeout( function() {
            window.location.reload();
          }, 2000);
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  // const onUpdateStatus = (val, id, INCO1, status) => {
  //   if (val === "1" || status === 11) {
  //     let fdata = { id: id, status: status, formType: "U", pod: INCO1 };
  //     showLoader();
  //     apiPostMethod(vaUrl, fdata)
  //       .then((response) => {
  //         const { data } = response;
  //         if (data.success) {
  //           // setTableFilter((p) => ({ ...p }));
  //           // onFetchAllRecords();
  //         }
  //       })
  //       .catch((error) => {
  //         errorToast("Something went wrong, please try again after sometime");
  //       })
  //       .finally((a) => {
  //         hideLoader();
  //       });
  //   } else if (val === "5") {
  //     history.push(`/UP:${id}`);
  //   }
  // };

  useEffect(() => {
    onFetchPOListByPlant();
  }, []);

  const onFetchPOListByPlant = () => {
    let fdata = {
      plantIds: UserDetails.plantids,
      type:'SILOTOMILLTRUCK'
    };
    apiPostMethod(getSTMTruckUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOdata([{ options: data.STMTruckList }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });

      //Plant
      apiPostMethod(ddlPOUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPlantdata([{ options: data.poresults }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });

      //Storage
      apiPostMethod(ddlPOUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setStoragedata([{ options: data.poresults }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  
  const onPlantDescChange = (e) => {
    const { value, label } = e;
    let newData = {
      ...formData,
      PlantDescription: value,
    };
    setFormaData(newData);
  }
  const onStorageLocChange = (e) => {
    const { value, label } = e;
    let newData = {
      ...formData,
      StorageLocation: value,
    };
    setFormaData(newData);
  }
  // const onTruckChange = (e) => {
    useEffect(() => {
    // const { vehicleType, mkey, value } = e;

    if(results.TRUCK_NO){
     
    let fdata = {
      TRUCK_NO: results.TRUCK_NO,
      formType: "QCDET",
      plantIds:[],
      startCount:0
    };
    //showLoader();
    //alert("ok")
    apiPostMethod(tblSTMUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {

          setFormaData({
            ...formData,
            TRUCK_NO: results.TRUCK_NO,
            EMPTY_VEHICLE_ARRIVAL_ID:data.STM_PODataGet[0]?.VehicleArrivalId || data.results[0].ID,
            ZVA_NUMBER:data.STM_PODataGet[0]?.VANumber || data.results[0].ZVA_NUMBER,
            Plant:data.STM_PODataGet[0]?.ReceivingPlantName || data.DispDetRecords[0].ReceivingPlantName,
            WERKS:data.STM_PODataGet[0]?.ReceivingPlant || data.DispDetRecords[0].ReceivingPlant,
            DRIVER_NO:data.STM_PODataGet[0]?.driverNo || data.results[0].DRIVER_NO,
            VEHICLE_TYPE:'truck'
          });
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
    }
    }, [results.TRUCK_NO]);  //[values.pickSlipNo]
 
   
   
  // };

  const onFetchPOLine = (pono, screentype) => {
    let fdata = { PO_NUMBER: pono, screenType: screentype };
    apiPostMethod(mpolineUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOLinedata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLineItemchange = (e) => {
    const { value } = e;
    onFetchWVB(value);
  };

  const onFetchWVB = (lineItem) => {
    //showLoader();
    const { ZPO_NUMBER } = formData;
    onFetchSupplier(ZPO_NUMBER, lineItem);
    let fdata = {
      PO_number: ZPO_NUMBER,
      lineItem: lineItem,
      formType: "PO",
    };
    apiPostMethod(vaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const { results } = data;
          setFormaData({
            ...formData,
            PO_LINE_ITEM: lineItem,
            ZSUPPLIER_NAME: "",
            ZSUPPLIER_CODE: "",
            BROCKER_NAME: results.BROCKER_NAME,
            IDNLF: results.IDNLF,
            PlantDescription:results.PlantDescription,
            StorageLocation:results.StorageLocation
          });
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const onFetchSupplier = (PO_NUMBER, lineItem) => {
    let fdata = { PO_NUMBER: PO_NUMBER, lineItem: lineItem, screenType: screenType };
    apiPostMethod(msuppUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setSupplierdata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getUsedNetWt = (newFormData, poNumber, supId) => {
    let fdata = { po: poNumber, supplierId: supId };
    apiPostMethod(getUsedWt, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const { results } = data;
          let qty = Number(results.SUP_QTY);
          let uom = results.SUP_QTY_UOM;

          setFormaData({
            ...newFormData,
            SUP_QTY: uom === "TO" || uom === "TON" ? qty * 1000 : qty,
            PER_TRUCK_QTY: 0,
            NET_WT: Number(results.NET_WT || 0),
            ACTUAL_NET_WT: results.ACTUAL_NET_WT || 0,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onSupplierChange = (e) => {
    const { value, label } = e;
    let newData = {
      ...formData,
      ZSUPPLIER_CODE: value,
      ZSUPPLIER_NAME: label,
    };
    setFormaData(newData);
    getUsedNetWt(newData, selectedPo.current, value);
    if (screenType !== "SDO" && VehicleType !== "Rake") {
      setVehicleDrop(true);
      onFetchTruckdetails();
    } else {
      setVehicleDrop(false);
    }
  };

  const onFetchTruckdetails = () => {
    let fdata = {
      lineItem: formData.PO_LINE_ITEM,
      PO_NUMBER: formData.ZPO_NUMBER,
    };
    apiPostMethod(sdivhgUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setVHdata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const isFilledAll = () => {
    const { DRIVER_NO, ZVA_NUMBER } = formData;
    if (DRIVER_NO && DRIVER_NO.length != 10) {
      return true;
    }
   
   
  };

  const { ZPO_NUMBER, PO_LINE_ITEM,ZVA_NUMBER, TRUCK_NO,Plant, CONT_NO, DRIVER_NO, BROCKER_NAME, IDNLF, ZSUPPLIER_NAME,StorageLocation,PlantDescription } = formData;
  return (
    <>
      <Row>
        {/* <Col md="4" sm="12">
          <FormGroup>
            <Label>Vehicle Number</Label>
            <Select
              options={poOptions}
              className="react-select"
              classNamePrefix="select"
              maxLength={10}
              value={{ label: TRUCK_NO, value: TRUCK_NO }}
              onChange={(e) => onTruckChange(e)}
            />
          </FormGroup>
        </Col> */}
       
        <Col md="4" sm="12">
          <FormGroup>
            <Label>VA Number</Label>
            <Input type="text" value={ZVA_NUMBER} disabled={true} />
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Plant</Label>
            <Input type="text" value={Plant} disabled={true} />
          </FormGroup>
        </Col>
       

        <Col md="4" sm="12">
          <FormGroup>
            <Label>Driver Number</Label>
            <Input
              type="text"
              value={DRIVER_NO}
              disabled={!ZPO_NUMBER || !PO_LINE_ITEM ? true : false}
              maxLength={10}
              placeholder="Enter Driver Number"
              onChange={(e) => onTextChange(e, "DRIVER_NO", "PNOA")}
            />
          </FormGroup>
        </Col>
      

       
       

        <Col sm="12">
          <FormGroup className="d-flex justify-content-end mb-0">
            <div className="mr-1">
              <Button.Ripple outline color="primary" disabled={isFilledAll()} type="button" onClick={(e) => onAddTruckDetails(1)}>
                <StopCircle size={16} className="mr-1" />
                Wait Outside
              </Button.Ripple>
            </div>
            <Button.Ripple color="primary" disabled={isFilledAll()} type="button" onClick={(e) => onAddTruckDetails(4)}>
              <Check size={16} className="mr-1" />
              Gate In
            </Button.Ripple>
          </FormGroup>
        </Col>
      </Row>
      {/* <TruckListTable postData={tableFilter} actionCell={actionsCol} title={"Unloading Vehicle Details"} /> */}
    </>
  );
};

export default STMTruckArrival;
