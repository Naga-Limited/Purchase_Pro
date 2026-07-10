import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, InputGroup, CardTitle } from "reactstrap";
import Select from "react-select";
import { Paperclip, X, Plus, ArrowDown, Search, Key } from "react-feather";
import { msuppUrl, mpolineUrl, sdisdUrl,uploadUrl, sdisdAUrl,SaveCaptureImage, mvessUrl, ddlSDPOUrl, masterUrl, getEdaUrl,duplicate_sdisdAUrl, apiBaseUrl,sapFileShare } from "../../urlConstants";
import { errorToast, ShowToast } from "@helpers/appHelper";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { _supplierFormData, _poData, _supplierFormDataFCI } from "../SDI/SupplierHelper";
import { roundOf } from "../../helper/appHelper";
import { DropdownControl } from "../../@core/components/dropdown";
import moment from "moment";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import { useLoader } from "../../utility/hooks/useLoader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { RefreshBlock } from "../common/RefreshBlock";
import CaptureImageSDI from "../CaptureImageSDI";
import { HrLine } from "../common/HrLine";
const FCITruck = "15";
const TruckMdl = "14";
const RackMdl = "13";
const ContrMdl = "12";
const fumigOptions = [
  {
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

const FCIEntryScreen = () => {
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  let { showLoader, hideLoader } = useLoader();
  const [poOptions, setPOdata] = useState([]);
  const [poData, setPOData] = useState({});
  const [ImgData, setImgData] = useState({});
  const [formData, setFormData] = useState({ ..._supplierFormDataFCI });
  const [vehicalDatas, setvehicalDatas] = useState([]);
  const [supplierOptions, setSupplierdata] = useState([]);
  const [poLineOptions, setPOLinedata] = useState([]);
  const [vesselOptions, setVesseldata] = useState([]);
  const [selectedLiner, setSelectedLiner] = useState();
  const [selectedLocation, setSelectedLocation] = useState();
  const [VehicleNoVerify,setVehicleNoVerify] = useState(false)
  const [selectedCostType, setSelectedCostType] = useState();
  const [freightType, setFreightType] = useState();
  const [CostDetails, setCostDetails] = useState([]);

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const deleteForm = (index) => {
    let vdata = [...vehicalDatas];
    vdata.splice(index, 1);
    setvehicalDatas(vdata);
  };

  const onFetchVessel = () => {
    apiGetMethod(mvessUrl)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setVesseldata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  useEffect(() => {
    if (!poOptions || poOptions.length === 0) {
      onFetchAllPOByUserPlant();
    }
  }, [poOptions]);

  const onFetchAllPOByUserPlant = () => {
    let fdata = {
      plantIds: UserDetails.plantids,
    };
    apiPostMethod(apiBaseUrl + "FCITruckController/getFCIPONumber", fdata)
      .then((response) => {
        const { data } = response;
        console.log(data.results[0])
        if (data.success == 1) {
          setPOdata([{ options: data.results[0] }]);
        }
        Cost_Details()
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const Cost_Details = () => {
   
    apiPostMethod(apiBaseUrl + "FCITruckController/FCI_Cost_Details")
      .then((response) => {
        const { data } = response;
        if (data.success == 1) {
          setCostDetails(data.results[0])
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onPOChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormDataFCI };
    delete sfd.ZPO_NUMBER;
    setFormData({ ...formData, ZPO_NUMBER: value, ...sfd });
    setPOData({ ..._poData });
    onFetchPOLine(value);
  };

  const onFetchPOLine = (PO_number) => {
    setSelectedLocation("");
    let fdata = { PO_NUMBER: PO_number, screenType: "SDO" };
    apiPostMethod(mpolineUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOLinedata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onLinerChange = (e) => {
    setSelectedLiner(e);
  };
  const onLineItemchange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormDataFCI };
    delete sfd.ZPO_NUMBER;
    delete sfd.ZPO_LINE_ITEM;
    setFormData({ ...formData, ZPO_LINE_ITEM: value, ...sfd });
    setPOData({ ..._poData });
    onFetchSupplier(value);
  };

  const onFetchSupplier = (lineItem) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER, lineItem: lineItem, screenType: "SDO" };
    apiPostMethod(msuppUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setSupplierdata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onSupplierChange = (e) => {
    const { label, value } = e;
    setFormData({ ...formData, ZSUPPLIER_CODE: value, ZSUPPLIER_NAME: label });
    onFetchPOdetails(value);
  };

  const onFetchPOdetails = (ZSUPPLIER_CODE) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER, ZPO_LINE_ITEM: formData.ZPO_LINE_ITEM, ZSUPPLIER_CODE: ZSUPPLIER_CODE };

    apiPostMethod(sdisdUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results.length) {
          const { results } = data;
          setPOData(results[0]);

          addTblRecord(results[0].PURCHASE_ORG, "I");
          if (results[0].PURCHASE_ORG === ContrMdl) {
            onFetchVessel();
          }
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onSupplierLoadingDate = (e) => {
    setFormData((p) => {
      let newData = { ...p, ZSUPPLIER_LOAD_DT: e.target.value, EDA: "" };
      if (newData.EDA_DAYS) {
        newData.EDA = moment(e.target.value).add(Number(newData.EDA_DAYS), "days").format("DD-MM-YYYY");
      }
      return newData;
    });
  };
  const onValidLoadingDate = (e) => {
    if (poData.PURCHASE_ORG === RackMdl && !moment(poData.POLOADINGDATE, "DD-MM-YYYY").isSameOrAfter(e.target.value)) {
      confirmDialog({
        title: "Are you sure?",
        cancelButton: false,
        confirmText: "OK",
        description: "Supplier Loading Date Exceeds PO Loading Date",
      }).then((res) => {
        if (res) {
        }
      });
    }
  };
  const onValidWBDate = (e) => {
    if (!moment(poData.POLOADINGDATE, "DD-MM-YYYY").isSameOrAfter(e.target.value)) {
      confirmDialog({
        title: "Are you sure?",
        cancelButton: false,
        confirmText: "OK",
        description: "Supplier WB date Exceeds PO Loading Date",
      }).then((res) => {
        if (res) {
        }
      });
    }
  };
  const onValidInvoiceQty = (e) => {
    if (poData.PURCHASE_ORG === RackMdl && e.target.value > 300000) {
      const inve = e.target;
      confirmDialog({
        title: "Invoice Qty(kgs)",
        cancelButton: false,
        confirmText: "OK",
        description: "Invoice Qty Exceeds 3 Lakh Kgs, Please correct the kgs",
      }).then((res) => {
        if (res) {
          inve.focus();
        }
      });
    }
  };

  const onEDAChange = (e) => {
    setFormData((p) => {
      let newData = { ...p, EDA: e.target.value };
      return newData;
    });
  };
  const onValueChange = (e, key, index) => {
    let vds = [...vehicalDatas];
    vds.forEach((fitem, v) => {
      if (index === v) {
       if(key=="ZSUPPLIER_INV_NO" || key=="vehical_no" || key=="no_of_wagon" || key=="supplier_wb_qty" || key=="seal_no"){
        let regEx = /[^a-zA-Z0-9]/gi; 
        if(key=="no_of_wagon" || key=="supplier_wb_qty" || key=="ATTI_COOLI" || key=="EXTRA_CHARGE" || key=="OFFICE_EXPENSE" || key=="WEIGHTMENT_CHARGE" || key=="GATE_EXPENSE" ||
        //  key== "ATTI_COOLI_LOAD" || key== "EXTRA_CHARGE_LOAD" || key== "OFFICE_EXPENSE_LOAD" || key== "WEIGHTMENT_CHARGE_LOAD" || key== "GATE_EXPENSE_LOAD" || 
         key == "FREIGHT_CHARGE"  ){
           regEx = /[^0-9.]/gi;
         }
         if(key=="ZSUPPLIER_INV_NO"){
          regEx = /[^a-zA-Z0-9-/]/gi; 
         }
         
          let Val=e.target ? e.target.value.toUpperCase() : e.value.toUpperCase();
           Val = Val.replace(regEx, "");
          document.getElementById(key+"_"+index).value=Val;
          fitem[key] = Val;
        }else{
          fitem[key] = e.target ? e.target.value : e.value;
        }
        
      }
    });
    console.log(vds);
    setvehicalDatas(vds);
  };

  const onVehicleNoChange = (e) =>{
    const fdata = {Vehicle_Number:vehicalDatas[e].vehical_no,PO_NUMBER : ZPO_NUMBER}
    apiPostMethod(apiBaseUrl + "FCITruckController/FCI_Tripsheet_Get", fdata)
    .then((response) => {
      const { data } = response;
        if(data.success == 0){
          errorToast(data.error);
          return false
        }else{
        const sap_data = data.results;
        let sdata = ([{ 
          tripsheetno:sap_data[0].TRIPSHEET_NO,
          vehical_no:sap_data[0].VEHICLE_NO,
          loading_point:sap_data[0].FROM_PLANT_NAME,
          COMPANYNAME:sap_data[0].COMPANYNAME,
          STREETNO:sap_data[0].STREETNO,
          STREETNAME:sap_data[0].STREETNAME,
          CITY:sap_data[0].CITY,
          STATE:sap_data[0].STATE,
          POSTCODE:sap_data[0].POSTCODE,
          REGION:sap_data[0].REGION,
          GSTNUMBER:sap_data[0].GSTNUMBER,
          tripsheetno1:sap_data[1]?.TRIPSHEET_NO == undefined ? 'null' : sap_data[1]?.TRIPSHEET_NO,
          ATTI_COOLI:vehicalDatas[e].ATTI_COOLI,
          // ATTI_COOLI_LOAD:vehicalDatas[e].ATTI_COOLI_LOAD,
          EXTRA_CHARGE:vehicalDatas[e].EXTRA_CHARGE,
          GATE_EXPENSE:vehicalDatas[e].GATE_EXPENSE,
          OFFICE_EXPENSE:vehicalDatas[e].OFFICE_EXPENSE,
          WEIGHTMENT_CHARGE:vehicalDatas[e].WEIGHTMENT_CHARGE,
          FREIGHT_CHARGE:vehicalDatas[e].FREIGHT_CHARGE,
          //info.FREIGHT_CHARGE * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)
          // PO_LOAD_COST:vehicalDatas[e].FREIGHT_CHARGE,
          // PO_FREIGHT_COST:vehicalDatas[e].FREIGHT_CHARGE,
          // EXTRA_CHARGE_LOAD:vehicalDatas[e].EXTRA_CHARGE_LOAD,
          // GATE_EXPENSE_LOAD:vehicalDatas[e].GATE_EXPENSE_LOAD,
          // OFFICE_EXPENSE_LOAD:vehicalDatas[e].OFFICE_EXPENSE_LOAD,
          // WEIGHTMENT_CHARGE_LOAD:vehicalDatas[e].WEIGHTMENT_CHARGE_LOAD,
          ZSUPPLIER_INV_DT:vehicalDatas[e].ZSUPPLIER_INV_DT,
          supplier_wb_qty:vehicalDatas[e].supplier_wb_qty,
        }]);
        if(vehicalDatas.length == 1){
        setvehicalDatas([...sdata]);
        }else{
          var details = [...vehicalDatas,...sdata]
          var detail = [...vehicalDatas,...sdata]

          const filterData = details.filter(
            (data) =>
             data.tripsheetno != ''
          )
          const vehicleDupligate = detail.filter(
            (data1) =>
            data1.tripsheetno == sdata[0].tripsheetno &&  data1.tripsheetno != ''
          )
          console.log(vehicleDupligate)
          if(vehicleDupligate.length > 1){ 
            errorToast('Vehicle No Already Added...')
            return false
          }
          setvehicalDatas(filterData);
          // setFormData([{...formData ,
          //   ZSUPPLIER_LOAD_POINT: sap_data.PLANT}])
          }
        // setvehicalDatas([{ ...vehicalDatas[e],
        // tripsheetno:sap_data.ZTRIPSHEET_NO,
        // vehical_no:sap_data.ZZVEHICLE_NO,
        // //DRIVER_NAME:sap_data.DRIVER_NAME,
        // }]);
        setVehicleNoVerify(true)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    
  }
console.log(UserDetails)
  const fileUploadAction = (id) => {
    document.getElementById(id).click();
  };
  const handleFileChange = (e, key, index) => {
    if (e.target.files && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      let { files } = e.target;
      let vds = [...vehicalDatas];
      vds.forEach((fitem, i) => {
        if (index === i) {
          fitem[key] = files[0].name;
          fitem[key + "_attach"] = files[0];
        }
      });
      setvehicalDatas(vds);
    }
  };

  const upload = () => {
   

    // Collect all files for upload
    let postdata = new FormData();
    let filesToUpload = [];

    vehicalDatas.forEach((vehicle, index) => {
        if (!vehicle.sup_inv_copy_attach) {
            errorToast(`Invoice copy attachment is required for vehicle ${index + 1}`);
            return;
        }
        if (!vehicle.sup_wb_copy_attach) {
            errorToast(`Weighbridge copy attachment is required for vehicle ${index + 1}`);
            return;
        }

        filesToUpload.push(vehicle.sup_inv_copy_attach);
        filesToUpload.push(vehicle.sup_wb_copy_attach);
    });

    if (filesToUpload.length === 0) {
        errorToast("No files found to upload.");
        return;
    }
    postdata.append("form_name", "SDI");
    postdata.append("SubFolder", "FCI");
    // Append files to FormData
    filesToUpload.forEach(file => {
        postdata.append("file[]", file);
    });

    

    // Upload files first
    apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
            const { data } = response;
            if (data.success) {
                // Map uploaded filenames back to vehicles
                console.log("Full upload response:", data.files);

                // Check each uploaded file location
                data.files.forEach((file, idx) => {
                    console.log(`File ${idx + 1} stored at:`, file.updname);
                });

                let uploadedFiles = data.files.map(f => f.updname);
                let fileIndex = 0;
                console.log(uploadedFiles);
               

                // Now proceed to main submit
                onSubmitSD(uploadedFiles);
            } else {
                errorToast("File upload failed.");
            }
        })
        .catch((error) => {
            console.error(error);
            errorToast("Something went wrong during file upload.");
        })
        .finally(() => {
            hideLoader();
        });
};


  const onSubmitSD=(uploadedFiles)=>{
  

    let allKeys = Object.keys(formData);
    let postdata = new FormData();
    postdata.append("file_from", "SDI");
    postdata.append("SubFolder", "Supplier_Dispatch_Info");
    postdata.append("VEHICLE_TYPE", poData.VEHICLETYPE);
    postdata.append("WERKS", poData.plant_id);
    postdata.append("IDNLF", poData.IDNLF);
    postdata.append("INCO1", poData.INCO1);
    postdata.append("LOAD_CHARGE", poData.Loading_cost);
    postdata.append("FREIGHT_CHARGE", poData.Freight_cost);
    postdata.append("LINER_NAME", selectedLiner ? selectedLiner.label : "");
    if (allKeys && allKeys.length) {
      allKeys.forEach((key) => {
        postdata.append([key], formData[key]);
      });
    }
    if(COST_TYPE == '' || COST_TYPE == undefined){
      errorToast("Please Check Payment For...");  
      return false
    }
    // let pvd = vehicalDatas.map((item) => {
    //   const nitem = { ...item, LINE_ITEM: formData.ZPO_LINE_ITEM };
    //   postdata.append("files[]", nitem["sup_inv_copy_attach"]);
    //   if (nitem["sup_wb_copy_attach"]) {
    //     postdata.append("files[]", nitem["sup_wb_copy_attach"]);
    //   }
    //   delete nitem.sup_inv_copy_attach;
    //   delete nitem.sup_wb_copy_attach;
    //   return nitem;
    // });
    let pvd = vehicalDatas;
    console.log(pvd)
    postdata.append("sdinfo", JSON.stringify(pvd));

    console.log(JSON.stringify(postdata));
    apiPostMethod(duplicate_sdisdAUrl, postdata, "Y")
    .then((response) => {
      
      const { data } = response;
      if (data.success==1) {
        onSubmitSD_SAVE(uploadedFiles)
      }else{
        errorToast("Duplicate Vehicle Number.."+data.VehicleNo);
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });

  }

  const onSubmitSD_SAVE = (uploadedFiles) => {
    let allKeys = Object.keys(formData);


    let postdata = new FormData();
    postdata.append("form_name", "SDI");
    postdata.append("SubFolder", "Supplier_Dispatch_Info");
    postdata.append("VEHICLE_TYPE", poData.VEHICLETYPE);
    postdata.append("WERKS", poData.plant_id);
    postdata.append("IDNLF", poData.IDNLF);
    postdata.append("INCO1", poData.INCO1);
    postdata.append("LOAD_CHARGE", poData.Loading_cost);
    postdata.append("FREIGHT_CHARGE", poData.Freight_cost);
    postdata.append("USER_ID", UserDetails.USERID);
    postdata.append("USER_NAME", UserDetails.username);
    postdata.append("INVOICE_PATH", uploadedFiles[0]);
    postdata.append("WB_PATH", uploadedFiles[1]);

    postdata.append("LINER_NAME", selectedLiner ? selectedLiner.label : "");
    if (allKeys && allKeys.length) {
      allKeys.forEach((key) => {
        postdata.append([key], formData[key]);
      });
    }
    let FileSaveUrl=uploadUrl;
    let Capture=0;
    if(vehicalDatas[0].sup_inv_Imgcopy!=null && vehicalDatas[0].sup_inv_Imgcopy!=""){
      FileSaveUrl=SaveCaptureImage;
      Capture=1;
    }
    let i=0;
    // let pvd = vehicalDatas.map((item) => {
    //   const nitem = { ...item, LINE_ITEM: formData.ZPO_LINE_ITEM };
    //   postdata.append("files[]", nitem["sup_inv_copy_attach"]);
    //   if (nitem["sup_wb_copy_attach"]) {
    //     postdata.append("files[]", nitem["sup_wb_copy_attach"]);
    //   }
    // i++;
    //   delete nitem.sup_inv_copy_attach;
    //   delete nitem.sup_wb_copy_attach;
    //   return nitem;
    // });
    let pvd = vehicalDatas
    postdata.append("sdinfo[]", JSON.stringify(pvd));
    console.log(pvd)

    showLoader();
    apiPostMethod(apiBaseUrl + "FCITruckController/FCI_Loading_Insert", postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
           
           ShowToast("Entry Submit Successfully...");  
           resetForm();
         
          } else {
            errorToast(data.files[0].orgname + " file format is not supported ");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
  };
  const resetForm = () => {
    setPOData({ ..._poData });
    setFormData({ ..._supplierFormDataFCI });
    setvehicalDatas([]);
    setPOLinedata([]);
    setSupplierdata([]);
    setSelectedLocation("");
  };

  const addTblRecord = (Purchaseorgdesc, isNew) => {
    const vhType = {
      [FCITruck]: { vehical_no: "", supplier_wb_qty: "", supplier_wb_date: "", sup_inv_copy: "", sup_wb_copy: "", sup_inv_Imgcopy: "", sup_wb_Imgcopy: "",tripsheetno:"",ATTI_COOLI:"",OFFICE_EXPENSE:"",
      // ATTI_COOLI_LOAD:"",OFFICE_EXPENSE:"",OFFICE_EXPENSE_LOAD:"",GATE_EXPENSE:"",GATE_EXPENSE_LOAD:"",EXTRA_CHARGE:"",EXTRA_CHARGE_LOAD:"",WEIGHTMENT_CHARGE_LOAD:"",
      WEIGHTMENT_CHARGE:"",ZSUPPLIER_INV_DT:"",FREIGHT_CHARGE:""},
      [ContrMdl]: { vehical_no: "", supplier_wb_qty: "", supplier_wb_date: "", seal_no: "", sup_inv_copy: "", sup_wb_copy: "", sup_inv_Imgcopy: "", sup_wb_Imgcopy: ""},
      [RackMdl]: { vehical_no: "", no_of_wagon: "", sup_inv_copy: "", sup_inv_Imgcopy: "", sup_wb_Imgcopy: "" },
    };
    const vhTA = { ...vhType[Purchaseorgdesc] };
    let vd = [];
    if (!isNew) {
      vd = [...vehicalDatas];
    }
    vd.push(vhTA);
    setvehicalDatas(vd);
  };
// console.log(formData)
// console.log(vehicalDatas)

  const renderHeader = (vehicleId) => {
    const headObj = { [FCITruck]: "Vehicle Details", [ContrMdl]: "Container Details", [RackMdl]: "Rake Details" };
    return (
      <Row className="p-0">
        <Col md="12" sm="12">
          <h5>{headObj[vehicleId]}</h5>
        </Col>
      </Row>
    );
  };
  const renderSupplierInvoiceDetails = (info, vehicleId, index) => {
    return (
      <>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
            <NumberOnlyInput
              decimalFormat={"2,2"}
              placeholder="Decimal (2,2)"
              value={info.ZSUPPLIER_INV_RATE}
              onChange={(e) => onValueChange(e, "ZSUPPLIER_INV_RATE", index)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Invoice No</Label>
            <Input
              type="text"
              value={info.ZSUPPLIER_INV_NO}
              placeholder="Invoice No"
              id={"ZSUPPLIER_INV_NO_"+index}
              onChange={(e) => onValueChange(e, "ZSUPPLIER_INV_NO", index)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Invoice Date</Label>
            <Input type="date"   max={today} value={info.ZSUPPLIER_INV_DT} onChange={(e) => onValueChange(e, "ZSUPPLIER_INV_DT", index)} />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Supplier WB qty (In Kgs)</Label>
            <NumberOnlyInput
              type="text"
              decimalFormat={"6,0"}
              maxValue={70000}
              value={info.ZSUPPLIER_INV_QTY}
              placeholder={70000}
              onChange={(e) => onValueChange(e, "ZSUPPLIER_INV_QTY", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Loading Point</Label>
            <Input
              type="text"
              id={"loading_point"+index}
              value={vehicalDatas[index].loading_point}
              // onChange={(e) => onValueChange(e, "tripsheetno", i)}
              disabled
            />
          </FormGroup>
        </Col>
        <Col md="8" sm="12">
        </Col>
        <HrLine
         header={'Freight & Loading Charges'}
         />
        <HrLine />
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Atti Cooli</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.atti_cooli}
              value={info.ATTI_COOLI}
              placeholder={500}
              onChange={(e) => onValueChange(e, "ATTI_COOLI", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>

        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Miscellaneous charges</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"6,2"}
              maxValue={CostDetails.extra_momul}
              value={info.EXTRA_CHARGE}
              placeholder={1000}
              onChange={(e) => onValueChange(e, "EXTRA_CHARGE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense(Per Ton)</Label>
            <NumberOnlyInput
              type="text"
              decimalFormat={"3,2"}
              maxValue={CostDetails.office_expense}
              // maxValue={((info.ZSUPPLIER_INV_QTY==undefined || info.ZSUPPLIER_INV_QTY== '') ? 1 : info.ZSUPPLIER_INV_QTY) * 40}
              value={info.OFFICE_EXPENSE}
              placeholder={40}
              onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
       
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              value={(info.OFFICE_EXPENSE== undefined || info.OFFICE_EXPENSE== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
              disabled
              // hidden
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Weightment Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.weighment_expense}
              value={info.WEIGHTMENT_CHARGE}
              placeholder={300}
              onChange={(e) => onValueChange(e, "WEIGHTMENT_CHARGE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Gate Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.gate_expense}
              value={info.GATE_EXPENSE}
              placeholder={200}
              onChange={(e) => onValueChange(e, "GATE_EXPENSE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Actual Loading Charge</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              value={Number(parseFloat((info.ATTI_COOLI == undefined || info.ATTI_COOLI == '') ? 0 : info.ATTI_COOLI) + parseFloat((info.OFFICE_EXPENSE== undefined || info.OFFICE_EXPENSE== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE * (info.ZSUPPLIER_INV_QTY/1000))) + parseFloat((info.EXTRA_CHARGE== undefined || info.EXTRA_CHARGE== '') ? 0 : info.EXTRA_CHARGE) + parseFloat((info.WEIGHTMENT_CHARGE== undefined || info.WEIGHTMENT_CHARGE== '') ? 0 : info.WEIGHTMENT_CHARGE) + parseFloat((info.GATE_EXPENSE== undefined || info.GATE_EXPENSE== '') ? 0 : info.GATE_EXPENSE)).toFixed(2)}
              placeholder={60000}
              disabled
              // onChange={(e) => onValueChange(e, "OVERALLCHARGES", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">PO Loading Change (Per Ton- {Loading_cost})</Label>
            <NumberOnlyInput
              type="text"
              value={ parseFloat((info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (Loading_cost * (info.ZSUPPLIER_INV_QTY/1000)))}
              placeholder={3000}
              // onChange={(e) => onValueChange(e, "FREIGHT_CHARGE", index)}
              disabled
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Actual Freight Charge (Per Ton)</Label>
            <NumberOnlyInput
              type="text"
              decimalFormat={"5,2"}
              maxValue={CostDetails.freight_cost}
              value={info.FREIGHT_CHARGE}
              placeholder={20}
              onChange={(e) => onValueChange(e, "FREIGHT_CHARGE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Freight Expense (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              value={(info.FREIGHT_CHARGE== undefined || info.FREIGHT_CHARGE== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.FREIGHT_CHARGE * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
              disabled
              // hidden
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">PO Freight Change (Per Ton- {Freight_cost})</Label>
            <NumberOnlyInput
              type="text"
              value={ parseFloat((info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (Freight_cost * (info.ZSUPPLIER_INV_QTY/1000)))}
              placeholder={3000}
              // onChange={(e) => onValueChange(e, "FREIGHT_CHARGE", index)}
              disabled
            />
          </FormGroup>
        </Col>
        {/* <Col md="8" sm="12">
        </Col> */}
        {/* {COST_TYPE == 'Loading & Freight' &&
        <> */}
        {/* <HrLine
         header={'Loading Charges'}
         />
        <HrLine />
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Atti Cooli</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.atti_cooli}
              value={info.ATTI_COOLI_LOAD}
              placeholder={500}
              onChange={(e) => onValueChange(e, "ATTI_COOLI_LOAD", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>

        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Miscellaneous charges</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"6,2"}
              maxValue={CostDetails.extra_momul}
              value={info.EXTRA_CHARGE_LOAD}
              placeholder={1000}
              onChange={(e) => onValueChange(e, "EXTRA_CHARGE_LOAD", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense(Per Ton)</Label>
            <NumberOnlyInput
              type="text"
              decimalFormat={"3,2"}
              maxValue={CostDetails.office_expense}
              // maxValue={((info.ZSUPPLIER_INV_QTY==undefined || info.ZSUPPLIER_INV_QTY== '') ? 1 : info.ZSUPPLIER_INV_QTY) * 40}
              value={info.OFFICE_EXPENSE_LOAD}
              placeholder={40}
              onChange={(e) => onValueChange(e, "OFFICE_EXPENSE_LOAD", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
       
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              value={(info.OFFICE_EXPENSE_LOAD== undefined || info.OFFICE_EXPENSE_LOAD== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE_LOAD * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
              disabled
              // hidden
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Weightment Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.weighment_expense}
              value={info.WEIGHTMENT_CHARGE_LOAD}
              placeholder={300}
              onChange={(e) => onValueChange(e, "WEIGHTMENT_CHARGE_LOAD", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Gate Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"4,2"}
              maxValue={CostDetails.gate_expense}
              value={info.GATE_EXPENSE_LOAD}
              placeholder={200}
              onChange={(e) => onValueChange(e, "GATE_EXPENSE_LOAD", index)}
              onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Total Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              value={Number(parseFloat((info.ATTI_COOLI_LOAD == undefined || info.ATTI_COOLI_LOAD == '') ? 0 : info.ATTI_COOLI_LOAD) + parseFloat((info.OFFICE_EXPENSE_LOAD== undefined || info.OFFICE_EXPENSE_LOAD== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE * (info.ZSUPPLIER_INV_QTY/1000))) + parseFloat((info.EXTRA_CHARGE_LOAD== undefined || info.EXTRA_CHARGE_LOAD== '') ? 0 : info.EXTRA_CHARGE_LOAD) + parseFloat((info.WEIGHTMENT_CHARGE_LOAD== undefined || info.WEIGHTMENT_CHARGE_LOAD== '') ? 0 : info.WEIGHTMENT_CHARGE_LOAD) + parseFloat((info.GATE_EXPENSE_LOAD== undefined || info.GATE_EXPENSE_LOAD== '') ? 0 : info.GATE_EXPENSE_LOAD)).toFixed(2)}
              placeholder={60000}
              disabled
              // onChange={(e) => onValueChange(e, "OVERALLCHARGES", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup> */}
        {/* </Col> */}
        </>
      //   }
      // </>
    );
  };
  const renderBody = (vehicleId) => {
    return (
      <Col md="12" sm="12" className="p-0 mt-2">
        {vehicalDatas &&
          vehicalDatas.length &&
          vehicalDatas.map((item, i) => {
            return (
              <div key={vehicleId + "_" + i}>
                <Row className="col-12 p-0 m-0">
                  <Col md="2" sm="12">
                    <FormGroup>
                        <Label>Vehicle No</Label>
                        <InputGroup>
                        <Input 
                        id={"vehical_no_"+i}
                        disabled={vehicalDatas[i].tripsheetno}
                        onChange={(e) => onValueChange(e, "vehical_no", i)}
                        value = {vehicalDatas[i].vehical_no}
                        maxLength={10} type="text" />
                        <Button size="sm" color="success" style={{ height: '38px', width: '40px' }} onClick={(e) => onVehicleNoChange(i)} >
                        <Search size={20} />
                        </Button>
                        </InputGroup>
                    </FormGroup>
                  </Col>  
                      <Col md="2" sm="12">
                        <FormGroup>
                          <Label for="cityMulti">TripSheet No</Label>
                          <Input
                            type="text"
                            id={"tripsheetno_"+i}
                            value={vehicalDatas[i].tripsheetno}
                            // onChange={(e) => onValueChange(e, "tripsheetno", i)}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                      <Col md="2" sm="12">
                        <FormGroup>
                          <Label>Invoice Qty (In Kgs)</Label>
                          <NumberOnlyInput
                            type="text"
                            decimalFormat={"5,0"}
                            maxLength={5}
                            placeholder="Supplier WB qty (In Kgs)"
                            id={"supplier_wb_qty_"+i} 
                            onChange={(e) => onValueChange(e, "supplier_wb_qty", i)}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="2" sm="12">
                        <FormGroup>
                          <Label>Supplier WB date</Label>
                          <Input
                            type="date"
                            max={today}
                            placeholder="Supplier WB date"
                            onChange={(e) => onValueChange(e, "supplier_wb_date", i)}
                            onBlur={onValidWBDate}
                          />
                        </FormGroup>
                      </Col>
                 {renderSupplierInvoiceDetails(item, vehicleId, i)}
                   <Col md="1" sm="12">
                    <FormGroup>
                      <Label className="d-block" for="nameMulti" title="Supplier Invoice Copy">
                        Inv Copy
                      </Label>
                      <input
                        type="file"
                        className="form-control"
                        id={`supInvcpy${i}`}
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChange(e, "sup_inv_copy", i);
                        }}
                      />
                      <Button.Ripple
                        outline
                        color="primary"
                        onClick={(e) => {
                          fileUploadAction(`supInvcpy${i}`);
                        }}
                      >
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">pdf</span>
                      </Button.Ripple>
                      <div>
                        <div className="align-middle ml-25">{item.sup_inv_copy}</div>
                      </div>
                    </FormGroup>
                  </Col> 
                  {/* {item.hasOwnProperty("sup_wb_copy") ? ( */}
                    <Col md="1" sm="12">
                      <FormGroup>
                        <Label className="d-block" for="nameMulti" title="Supplier WB Copy">
                          WB Copy
                        </Label>
                        <input
                          type="file"
                          className="form-control"
                          id={`supWbcpy${i}`}
                          hidden
                          name="upload_file"
                          accept=".pdf, image/*"
                          onChange={(e) => {
                            handleFileChange(e, "sup_wb_copy", i);
                          }}
                        />
                        <Button.Ripple
                          outline
                          color="primary"
                          onClick={(e) => {
                            fileUploadAction(`supWbcpy${i}`);
                          }}
                        >
                          <Paperclip size={14} />
                          <span className="align-middle ml-25">pdf</span>
                        </Button.Ripple>
                        <div>
                          <div className="align-middle ml-25">{item.sup_wb_copy}</div>
                        </div>
                      </FormGroup>
                     {/* <CaptureImageSDI setvehicalDatas={setvehicalDatas}   vehicalDatas={vehicalDatas} ImgKey={`sup_wb_Imgcopy`} index={i} ItemName={`sup_wb_Imgcopy${i}`}  /> */}
                      
                    </Col>
                   {/* ) 
                   : (
                    ""
                 )} */}
                  {/* <Col md="2" sm="12">

                  </Col> */}
                  <Col md="2" sm="12" className="mt-50">
                    <Button.Ripple
                      color="danger"
                      className="text-nowrap px-1 mt-75"
                      onClick={(e) => {
                        deleteForm(i);
                      }}
                      outline
                    >
                      <X size={14} className="" />
                      <span></span>
                    </Button.Ripple>
                  </Col>
                </Row>

                <Col sm={12}>
                  <hr />
                </Col>
              </div>
            );
          })}
        <Col sm="12" className="d-flex justify-content-end">
          <Button.Ripple
            className="btn-icon"
            color="primary"
            onClick={(e) => {
              addTblRecord(vehicleId);
            }}
          >
            <Plus size={14} />
            <span className="align-middle ml-25">Add</span>
          </Button.Ripple>
        </Col>
      </Col>
    );
  };
  const renderVehicals = (vehicleId) => {
    return (
      <Card>
        <CardBody>
          {renderHeader(vehicleId)}
          {renderBody(vehicleId)}
        </CardBody>
      </Card>
    );
  };

  const isFilledAll = () => {
    if (vehicalDatas.length) {
      let attch=0;
      let imgcap=0;
      const vd = vehicalDatas.filter((item) => {
        const itemValues = Object.values(item);
        let ret=false;
        Object.keys(item).forEach((key1) => {        
          if((key1=="sup_inv_copy") && item[key1]=="" && item["sup_inv_Imgcopy"]==""){
            ret=true;
          }
          else if((key1=="sup_inv_Imgcopy") && item[key1]=="" && item["sup_inv_copy"]==""){
            ret=true;
          }
          else if((key1=="sup_wb_copy" ) && item[key1]=="" && item["sup_wb_Imgcopy"]==""){
            ret=true;
          }
          else if((key1=="sup_wb_Imgcopy") && item[key1]=="" && item["sup_wb_copy"]==""){
            ret=true;
          }
          else if((item[key1]=="" || item[key1]==null)  &&  key1!="sup_wb_Imgcopy" && key1!="sup_wb_copy" && key1!="sup_inv_copy" && key1!="sup_inv_Imgcopy"){
            ret=true;
          }
        });
       return ret;
      });
      if (vd.length) {
        return true;
      }
    }
    

    const fmValues = Object.values(formData);
    console.log(formData)
    return !fmValues.every((x) => x !== null && x !== "");
  };
  const onLocationChange = (e) => {
    setSelectedLocation(e);
    setFormData((p) => ({ ...p, ZSUPPLIER_LOAD_POINT: e.label }));
    let state = e.value.split("-");

    apiPostMethod(`${getEdaUrl}?from=${state[state.length - 1].trim()}&to=${poData.plant_id}&type=${poData.VEHICLETYPE}`, {})
      .then((response) => {
        const { data } = response;
        if (data.success && data.results.length) {
          const { results } = data;
          setFormData((p) => ({ ...p, EDA_DAYS: results }));
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onCostType = (e) => {
    setSelectedCostType(e);
    setFormData((p) => ({ ...p, COST_TYPE: e.label }));
  };
  const onFreightType = (e) => {
    setFreightType(e);
    setFormData((p) => ({ ...p, FREIGHT_TYPE: e.label }));
  };
  const {
    BROCKER_NAME,
    IDNLF,
    MATNR,
    NETPR,
    PLANT_NAME,
    STORAGE_LOCATION,
    INCO_DESC,
    POLOADINGDATE,
    VEHICLETYPE,
    PO_Bag_Type,
    PURCHASE_ORG,
    Loading_cost,
    Freight_cost
  } = poData;
  const { ZPO_NUMBER, ZSUPPLIER_LOAD_DT, ZSUPPLIER_NAME, ZSUPPLIER_CODE, ZPO_LINE_ITEM, EDA,COST_TYPE,
    // FREIGHT_TYPE 
  } = formData;
  return (
    <div>
      <RefreshBlock />
      <Card>
        <CardBody>
        <CardTitle>FCI Loading </CardTitle>
          <div>
            <Row>
              <Col md="12" sm="12">
                {/* <h5>{"FCI Loading"}</h5> */}
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Number</Label>
                  <Select
                    options={poOptions}
                    id={"EBELN"}
                    className="react-select"
                    classNamePrefix="select"
                    value={{ label: ZPO_NUMBER, value: ZPO_NUMBER }}
                    onChange={(e) => onPOChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  {!ZPO_NUMBER ? (
                    <Input type="text" disabled={true} placeholder={"Select the PO Number"} />
                  ) : (
                    <Select
                      options={poLineOptions}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZPO_LINE_ITEM, value: ZPO_LINE_ITEM }}
                      onChange={(e) => onLineItemchange(e)}
                    />
                  )}
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  {!ZPO_NUMBER || !ZPO_LINE_ITEM ? (
                    <Input type="text" disabled={true} placeholder={"Select the PO Line Item"} />
                  ) : (
                    <Select
                      options={supplierOptions}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                      onChange={(e) => onSupplierChange(e)}
                    />
                  )}
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Inco Terms</Label>
                  <Input type="text" placeholder="Inco Terms" value={INCO_DESC} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Broker Name</Label>
                  <Input type="text" placeholder="Broker Name" value={BROCKER_NAME} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Wheat Variety</Label>
                  <Input type="text" placeholder="Wheat Variety" value={IDNLF} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Rate</Label>
                  <Input type="text" placeholder="PO Rate" value={roundOf(NETPR)} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Receiving Storage Location</Label>
                  <Input type="text" placeholder="Receiving Storage Location" value={STORAGE_LOCATION} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Receiving Plant</Label>
                  <Input type="text" placeholder="Recieving Plant" value={PLANT_NAME} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Bag Type</Label>
                  <Input type="text" placeholder="PO Bag Type" value={PO_Bag_Type} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Purchase PO org</Label>
                  <Input type="text" placeholder="Purchase PO org" value={VEHICLETYPE} disabled />
                </FormGroup>
              </Col>
              {PURCHASE_ORG === ContrMdl ? (
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label for="cityMulti">Liner Name</Label>
                    <DropdownControl
                      selectedValue={selectedLiner}
                      url={`${masterUrl}?formType=LinerName`}
                      onDdlChange={(e) => onLinerChange(e)}
                    />
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Loading Date</Label>
                  <Input type="text" placeholder="PO Loading Date" value={POLOADINGDATE} disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Material NO</Label>
                  <Input type="text" placeholder="Material NO" value={MATNR} disabled />
                </FormGroup>
              </Col>
              {/* <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Supplier Loading Point</Label>
                  <DropdownControl
                    isDisabled={!poData.STORAGE_LOCATION}
                    placeholder={"Supplier Loading Point"}
                    selectedValue={selectedLocation}
                    url={`${apiBaseUrl}FCITruckController/FCI_Location_Details`}
                    onDdlChange={(e) => onLocationChange(e)}
                  />
                </FormGroup>
              </Col> */}

              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Supplier Loading Date</Label>
                  <Input type="date" value={ZSUPPLIER_LOAD_DT}  max={today} onChange={onSupplierLoadingDate} onBlur={onValidLoadingDate} />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">EDA</Label>
                  <Input type="date" name="eda" value={EDA} placeholder="EDA" onChange={onEDAChange} />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Payment For (Loading & Freight)</Label>
                  <DropdownControl
                    isDisabled={!poData.STORAGE_LOCATION}
                    placeholder={"Cost Type"}
                    selectedValue={selectedCostType}
                    url={`${apiBaseUrl}FCITruckController/CostType`}
                    value={{ label: COST_TYPE, value: COST_TYPE }}
                    onChange={(e) => onCostType(e)}
                  />
                </FormGroup>
               </Col>
               {/* <Col md="4" sm="12">
                <FormGroup>
                  <Label>Payment To Freight & Loading Vendor</Label>
                  <DropdownControl
                    isDisabled={!poData.STORAGE_LOCATION}
                    placeholder={"Vendor Freight & Loading"}
                    selectedValue={freightType}
                    url={`${apiBaseUrl}FCITruckController/FreightLoading`}
                    value={{ label: FREIGHT_TYPE, value: FREIGHT_TYPE }}
                    onChange={(e) => onFreightType(e)}
                  />
                </FormGroup>
               </Col> */}
            </Row>
          </div>
        </CardBody>
      </Card>
      {PURCHASE_ORG && renderVehicals(PURCHASE_ORG)}
      <Card>
        <Col sm="12" className="my-1">
          <FormGroup className="d-flex mb-0 justify-content-end align-items-center">
            <Button.Ripple outline color="secondary" type="button" className="mr-2" onClick={(e) => resetForm()}>
              Cancel
            </Button.Ripple>
            <div className="mr-50">
              <Button.Ripple color="primary" disabled={isFilledAll()} type="button" onClick={(e) => upload()}>
                Submit
              </Button.Ripple>
            </div>
          </FormGroup>
        </Col>
      </Card>
    </div>
  );
};
export default FCIEntryScreen;
