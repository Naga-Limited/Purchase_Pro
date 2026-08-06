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
import Uploader from "../Uploader";

const TruckArrivalRake = ({ onAdded,results }) => {
  let { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [formData, setFormaData] = useState({ ...VHConstant });
  const [isVehicleDrop, setVehicleDrop] = useState(false);
  const [vhOptions, setVHdata] = useState([]);
  const [VehicleType, setVehicleType] = useState("");
  const [invoiceCopy, setInvoiceCopy] = useState("");


  const onTextChange = (e, key, validKey) => {
    const { value } = e.target ? e.target : e;
    if ((validKey && regexValidation[validKey].test(value)) || !value) {
      setFormaData({ ...formData, [key]: value });
    }
  };
  useEffect(() => {
    if(results.id)
    setFormaData({ ...formData,
    ZPO_NUMBER:results.po_number,
    PO_LINE_ITEM:results.po_line_item,
    DRIVER_NO:results.driver_no,
    ZSUPPLIER_CODE:results.supplier_code,
    ZSUPPLIER_NAME:results.supplier_name,
    BROCKER_NAME:results.brocker_name,
    BROCKER_CODE:results.brocker_code,
    VEHICLE_TYPE:results.vehicle_type,
    IDNLF:results.wheat_variety,
    PLANT_NAME:results.PLANT_NAME,
    STORAGE_LOCATION:results.STORAGE_LOCATION
    });
    setInvoiceCopy(results?.INV_COPY)
  }, [results.id]);

  const onTruckDdlChange = (e, key) => {
    const { value, weight } = e.target ? e.target : e;
    setFormaData({ ...formData, [key]: value, PER_TRUCK_QTY: isVehicleDrop ? Number(weight || 0) : 0 });
  };
  const onAddTruckDetails = (status) => {

    let fdata = { ZQTY: results.ZSUPPLIER_INV_QTY || 0, 
      VECHICAL_STATUS: status, 
      formType: "A", 
       screenType: 'SDI'  , 
       TRUCK_NO:results.vehicle_no, ZPO_NUMBER:formData.ZPO_NUMBER , PO_LINE_ITEM:formData.PO_LINE_ITEM , ZSUPPLIER_CODE:formData.ZSUPPLIER_CODE , CONT_NO:formData.TRAILER_NO , DRIVER_NO:formData.DRIVER_NO ,ZSUPPLIER_NAME:formData.ZSUPPLIER_NAME,IDNLF:formData.IDNLF};
   
    let sap_data = {
      tripsheet_no:results.tripsheet_no,
      vehicle_no:results.vehicle_no,
      fnr_no:results.fnr_no,
      id:results.id
    }
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
  apiPostMethod(apiBaseUrl + "RakeloadingController/Sap_Fnrno_flag", sap_data)
    .then((response) => {
      // const { data1 } = response.data;
      if (response.data.success == 0) {
        errorToast(response.data.error)
        return false
      } else if(response.data.success == 1){
        onAddTruckDetail(status)
      }
    }).catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
    
  };

  
  const onAddTruckDetail = (status) => {

    let fdata = { ZQTY: results.ZSUPPLIER_INV_QTY || 0, 
      VECHICAL_STATUS: status, 
      formType: "A", 
       screenType: 'SDI'  , 
       TRUCK_NO:results.vehicle_no, ZPO_NUMBER:formData.ZPO_NUMBER , PO_LINE_ITEM:formData.PO_LINE_ITEM , ZSUPPLIER_CODE:formData.ZSUPPLIER_CODE , CONT_NO:formData.TRAILER_NO , DRIVER_NO:formData.DRIVER_NO ,ZSUPPLIER_NAME:formData.ZSUPPLIER_NAME,IDNLF:formData.IDNLF};
   
    let sap_data = {
      tripsheet_no:results.tripsheet_no,
      vehicle_no:results.vehicle_no,
      fnr_no:results.fnr_no,
      id:results.id
    }
    showLoader();
    apiPostMethod(vaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let rake_data = data.results;
          setFormaData({ ...VHConstant });
          apiPostMethod(apiBaseUrl + "RakeloadingController/Rake_Loading_Update_Gate_in", {purchase_info_id:rake_data,id:results.id})
            .then((response) => {
              ShowToast("Gate in Successfully...");
            window.setTimeout( function() {
              window.location.reload();
            }, 2000);
              
          })
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
              <Input type="text" disabled={true} value={PO_LINE_ITEM} placeholder={"Select the PO Number"} />
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
        {invoiceCopy &&
        <Col md="4" sm="12">
          <FormGroup>
            {/* <Label>Invoice Copy</Label> */}
            <Uploader
                    isReadOnly
                    // canEdit
                    // setAttachment={handleFileChange}
                    label={"Invoice Copy"}
                    // title="Invoice Copy"
                    id={"INV_COPY"}
                    selectedFileName={invoiceCopy}
                  />
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

export default TruckArrivalRake;
