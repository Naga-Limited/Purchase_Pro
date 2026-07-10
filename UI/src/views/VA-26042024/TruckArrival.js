import { FormGroup, Row, Col, Button, Label, Input } from "reactstrap";

import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { StopCircle, Check } from "react-feather";
// ** Store
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { vaUrl, sdivhgUrl, msuppUrl, getUsedWt, mpolineUrl, ddlPOUrl, apiBaseUrl } from "../../urlConstants";
import { regexValidation } from "../../constants/validConstant";
import { VHConstant, VHConstants } from "./constant";
import { useLoader } from "../../utility/hooks/useLoader";
import { ShowToast } from "../../helper/appHelper";

const TruckArrival = ({ onAdded,results }) => {
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
    // if(isFilledAll()){
    //   return false;
    // }

    let fdata = { ZQTY: results.ZSUPPLIER_INV_QTY || 0, 
      VECHICAL_STATUS: status, 
      formType: "A", 
       screenType: (formData.INCO1 == 'INCO1' || formData.INCO1 == 'OW1' || formData.INCO1 == 'OW2' || formData.INCO1 == 'OY1') ? 'SDO' : 'SDI'  , 
       TRUCK_NO:formData.PURCHASE_ORG == 12 ? formData.TRAILER_NO :results.VEHICAL_NO,ZPO_NUMBER:formData.EBELN , PO_LINE_ITEM:formData.EBELP , ZSUPPLIER_CODE:formData.SUPPLIER_CODE , CONT_NO:formData.PURCHASE_ORG == 12 ? results.VEHICAL_NO : '', DRIVER_NO:formData.DRIVER_NO ,ZSUPPLIER_NAME:formData.SUPPLIER_NAME,IDNLF:formData.IDNLF};
    //alert(JSON.stringify(fdata));
  //  return false;
    if(fdata.ZPO_NUMBER == "" || fdata.ZPO_NUMBER == undefined){
      errorToast('Please Check PO No...')
      return false
    }else if(fdata.PO_LINE_ITEM == "" || fdata.PO_LINE_ITEM == undefined){
      errorToast('Please Check PO Line Item...')
      return false
    }else if(fdata.ZSUPPLIER_CODE == "" || fdata.ZSUPPLIER_CODE == undefined){
      errorToast('Please Check Supplier Code...')
      return false
    }else if(formData.PURCHASE_ORG == 12 && (fdata.CONT_NO == "" || fdata.CONT_NO == undefined)){
      errorToast('Please Check Container No...')
      return false
    }else if(!/^[\d]{10}/.test(fdata.DRIVER_NO) || fdata.DRIVER_NO == undefined){
      errorToast('Please Enter Driver Mobile No...')
      return false
    }
    showLoader();
    apiPostMethod(vaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setFormaData({ ...VHConstant });
            // setSupplierdata([]);
            // setPOLinedata([]);
            // setScreenType("");
            // setVehicleType("");
          // setTableFilter((p) => ({ ...p }));
          // onAdded();
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
    if(results.SUP_VE_REFID){
    Vehicle_Details();
    }
  }, [results.SUP_VE_REFID]);

   const Vehicle_Details = () => {
    let fdata = { SUP_VE_REFID: results.SUP_VE_REFID};
    apiPostMethod(apiBaseUrl + "RakeloadingController/Supplier_Vehicle_ByID", fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            const { results } = data;
            const { supplier_data } = data;
            console.log(supplier_data)
            setFormaData(results[0]);
            setFormaData(supplier_data[0]);

          }
        })
     };
   

  useEffect(() => {
    onFetchPOListByPlant();
  }, []);

  const onFetchPOListByPlant = () => {
    let fdata = {
      plantIds: UserDetails.plantids,
    };
    apiPostMethod(ddlPOUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOdata([{ options: data.poresults }]);
        }
      })
      .catch((error) => {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  
  console.log(formData)

  const { ZPO_NUMBER, PO_LINE_ITEM, TRUCK_NO, CONT_NO, DRIVER_NO, BROCKER_NAME, IDNLF, ZSUPPLIER_NAME,StorageLocation,PlantDescription,ZPO_LINE_ITEM,VEHICLE_TYPE,TRAILER_NO,PLANT_NAME,STORAGE_LOCATION,PURCHASE_ORG } = formData;

  return (
    <>
      <Row>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>PO Number</Label>
            <Input type="text" disabled={true} value={ZPO_NUMBER} placeholder={"Select the PO Number"} />
            <span id="ZPO_NUMBER_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>PO Line Item</Label>
              <Input type="text" disabled={true} value={ZPO_LINE_ITEM} placeholder={"Select the PO Number"} />
             <span id="PO_LINE_ITEM_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Wheat Variety</Label>
            <Input type="text" value={IDNLF} disabled={true} />
            <span id="IDNLF_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Brocker Name</Label>
            <Input type="text" value={BROCKER_NAME} disabled={true} />
            <span id="BROCKER_NAME_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Supplier Name</Label>
              <Input type="text" disabled={true} value={ZSUPPLIER_NAME} placeholder={"Select the PO Line Item"} />
            <span id="ZSUPPLIER_NAME_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>

        {isVehicleDrop && VehicleType === "Container" ? (
          <Col md="4" sm="12">
            <FormGroup>
              <Label>Container Number</Label>
              <Select
                options={vhOptions}
                className="react-select"
                classNamePrefix="select"
                disabled={!ZPO_NUMBER ? true : false}
                value={{ label: CONT_NO, value: CONT_NO }}
                onChange={(e) => onTruckDdlChange(e, "CONT_NO")}
              />
              <span id="CONT_NO_Error" style={{color: "red"}} ></span>
            </FormGroup>
          </Col>
        ) : (
          ""
        )}
        {isVehicleDrop && VehicleType !== "Container" ? (
          <Col md="4" sm="12">
            <FormGroup>
              <Label>Vehicle Number</Label>
              <Select
                options={vhOptions}
                className="react-select"
                classNamePrefix="select"
                disabled={!ZPO_NUMBER ? true : false}
                value={{ label: TRUCK_NO, value: TRUCK_NO }}
                onChange={(e) => onTruckDdlChange(e, "TRUCK_NO")}
              />
              <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
            </FormGroup>
          </Col>
        ) : (
          ""
        )}
     

        <Col md="4" sm="12">
          <FormGroup>
            <Label>Driver Number</Label>
            <Input
              type="text"
              value={DRIVER_NO}
              // disabled={!ZPO_NUMBER || !PO_LINE_ITEM ? true : false}
              maxLength={10}
              placeholder="Enter Driver Number"
              onChange={(e) => onTextChange(e, "DRIVER_NO", "NUMA")}
            />
            <span id="DRIVER_NO_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Vehicle Type</Label>
            <Input type="text" value={VEHICLE_TYPE} disabled={true} />
            <span id="VehicleType_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>

        <Col md="4" sm="12">
        <FormGroup>
            <Label>Plant Description</Label>
            <Input type="text" value={PLANT_NAME} disabled={true} />
            <span id="PlantDescription_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        <Col md="4" sm="12">
        <FormGroup>
        <Label>Storage Location</Label>
            <Input type="text" value={STORAGE_LOCATION} disabled={true} />
            <span id="StorageLocation_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>
        {PURCHASE_ORG == 12 &&
        <Col md="4" sm="12">
          <FormGroup>
            <Label>Trailer Number</Label>
            <Input
              type="text"
              value={TRAILER_NO}
              maxLength={10}
              placeholder="Enter Trailer Number"
              onChange={(e) => onTextChange(e,"TRAILER_NO","SSNA")}
              />
            <span id="DRIVER_NO_Error" style={{color: "red"}} ></span>
          </FormGroup>
        </Col>}

        <Col sm="12">
          <FormGroup className="d-flex justify-content-end mb-0">
            <div className="mr-1">
              <Button.Ripple outline color="primary" type="button" onClick={(e) => onAddTruckDetails(1)}>
                <StopCircle size={16} className="mr-1" />
                Wait Outside
              </Button.Ripple>
            </div>
            {/*disabled={isFilledAll()} */}
            <Button.Ripple color="primary" type="button" onClick={(e) => onAddTruckDetails(2)}>
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

export default TruckArrival;
