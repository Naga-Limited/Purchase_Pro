import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import { Delete, Paperclip } from "react-feather";
import { apiBaseUrl, previewUrl, sdisdUrl } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { apiPostMethod } from "@helpers/axiosHelper";

import { roundOf, ShowToast } from "../../helper/appHelper";
import { useFormik } from "formik";
import { CustomDropdownInput, validation, Yup } from "../forms/custom-form";
import { getTextElement } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import { DropdownControl } from "../../@core/components/dropdown";
import { HrLine } from "../common/HrLine";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useSelector } from "react-redux";
import Uploader from "../Uploader";
const TruckMdl = "14";
const RackMdl = "13";
const ContrMdl = "12";
const FCITruckMdl = "15";

const FCIApproval = () => {
  const history = useHistory();
  let { id } = useParams();
  let refid = id.replace(":", "");
  let refid1 = id.replace("-", "");

  let DeleteId="";
  let Splrefid=refid.split("-");
  if(Splrefid.length>1){
   if(Splrefid[0]=="Delete"){
     DeleteId=Splrefid[1];
     id="";
   }
  }


  let { showLoader, hideLoader } = useLoader();

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({

      //LINE_ITEM: validation.required(),
      
    }),
    onSubmit(values) {},
  });
  const values = form.values;

  const [poData, setPOData] = useState({});
  const [vehicalDatas, setvehicalDatas] = useState([]);
  const [poLineOptions, setPOLinedata] = useState([]);
  const [selectedCostType, setSelectedCostType] = useState();
  const [CostDetails, setCostDetails] = useState([]);
  const [FRT_LOAD_POST_FLAG, setFRT_LOAD_POST_FLAG] = useState(false);
  const [LOAD_POST_FLAG, setLOAD_POST_FLAG] = useState(true);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  useEffect(() => {
    if (id) {
      onFetchSDIdetailsById();
    }
  }, [id]);
  useEffect(() => {
    if (DeleteId) {
      SDIDeleteById();
    }
  }, [DeleteId]);

 

  useEffect(() => {
    if (values.LINE_ITEM) {
      onFetchPOdetails();
    }
  }, [values.LINE_ITEM]);

  useEffect(() => {
    if (poData.PURCHASE_ORG) {
      addTblRecord();
    }
  }, [poData.PURCHASE_ORG]);

  const SDIDeleteById = ()=>{
   
    let fdata = {
      id: DeleteId,
    };
    confirmDialog({
      title: 'Are you sure to Reject?',
      description: 'FCI Loading Entry',
    }).then((res) => {
      if (res) {
    showLoader();
    apiPostMethod(apiBaseUrl + "sdi/Deletesdi", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(`/FCIENTRYAPPROVAL`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
      }})
  }
  const onFetchSDIdetailsById = () => {
    let fdata = {
      id: refid || refid1,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FCITruckController/getsdiDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let { LINE_ITEM, ...sResult } = data.results[0];
          setPOData({
            ...poData,
            ...sResult,
            LINE_ITEM,
          });
          onFetchPOLine(sResult.ZPO_NUMBER, sResult.ZSUPPLIER_CODE);
          form.setFieldValue("LINE_ITEM", { label: LINE_ITEM, value: LINE_ITEM });
          setFRT_LOAD_POST_FLAG(data.FRT_LOAD_POST_FLAG)
          setLOAD_POST_FLAG(data.LOAD_POST_FLAG)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
  // console.log(LOAD_POST_FLAG)
  // console.log(FRT_LOAD_POST_FLAG)

  const onFetchPOdetails = () => {
    let fdata = { PO_NUMBER: poData.ZPO_NUMBER, ZPO_LINE_ITEM: values.LINE_ITEM.value, ZSUPPLIER_CODE: poData.ZSUPPLIER_CODE };
    apiPostMethod(sdisdUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results.length) {
          const { results } = data;
          setPOData({ ...poData, ...results[0] });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchPOLine = (PO_number, ZSUPPLIER_CODE) => {
    let fdata = { PO_NUMBER: PO_number, ZSUPPLIER_CODE: ZSUPPLIER_CODE };
    apiPostMethod(apiBaseUrl + "sdi/getsdiPOLines", fdata)
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
  const onCostType = () => {
    apiPostMethod(apiBaseUrl + "FCITruckController/CostType")
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setSelectedCostType([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const showError = (Id, Msg, show) => {
    if (document.getElementById(Id)) {
        document.getElementById(Id).innerHTML = "";
        if (show == 1) {
            console.log("SHOW ERROR:" + Id);
            document.getElementById(Id).innerHTML = Msg;
        }
    }
  }

  const isFilledAll = () => {
    let ShowError = 0;
    let formData = form.values;
    showError('LINE_ITEM_Error', 'Select Line Item', 0);
    if (!formData.LINE_ITEM) { showError('LINE_ITEM_Error', 'Select Line Item', 1); ShowError = 1;}

    if (ShowError == 1) { return true; }
  }


  const onSubmitSD = () => {

    // if (!form.isValid) {
    //   form.setSubmitting(true);
    //   form.validateForm();
    //   return;
    // }
   
    if (isFilledAll()) {
      return false;
    }


    let formData = form.values;
    // if (poData.LINE_ITEM === formData.LINE_ITEM.value && poData.VEHICAL_NO === vehicalDatas[0].VEHICAL_NO) {
    //   resetForm();
    //   return;
    // }
    const postdata = {
      id: refid,
      lineItem: formData.LINE_ITEM.value,
      plantId: poData.plant_id,
      vehicle_id:vehicalDatas[0].VEHICAL_NO,
      storage_location:poData.STORAGE_LOCATION,
      EXTRA_CHARGE:vehicalDatas[0].EXTRA_CHARGE,
      ATTI_COOLI:vehicalDatas[0].ATTI_COOLI,
      OFFICE_EXPENSE:vehicalDatas[0].OFFICE_EXPENSE,
      WEIGHTMENT_CHARGE:vehicalDatas[0].WEIGHTMENT_CHARGE,
      GATE_EXPENSE:vehicalDatas[0].GATE_EXPENSE,
      OFFICE_EXPENSE_KG:(vehicalDatas[0].OFFICE_EXPENSE== undefined || vehicalDatas[0].OFFICE_EXPENSE== '' || vehicalDatas[0].ZSUPPLIER_INV_QTY == undefined || vehicalDatas[0].ZSUPPLIER_INV_QTY == '') ? 0 : (vehicalDatas[0].OFFICE_EXPENSE * (vehicalDatas[0].ZSUPPLIER_INV_QTY/1000)).toFixed(0),
      COST_TYPE:formData.COST_TYPE.label,
      FREIGHT_COST:vehicalDatas[0].FREIGHT_COST,
      FREIGHT_COST_KG:(vehicalDatas[0].FREIGHT_COST== undefined || vehicalDatas[0].FREIGHT_COST== '' || vehicalDatas[0].ZSUPPLIER_INV_QTY == undefined || vehicalDatas[0].ZSUPPLIER_INV_QTY == '') ? 0 : (vehicalDatas[0].FREIGHT_COST * (vehicalDatas[0].ZSUPPLIER_INV_QTY/1000)).toFixed(0),
      PO_LOAD_COST:(poData.Loading_cost*(vehicalDatas[0].ZSUPPLIER_INV_QTY/1000)),
      PO_FREIGHT_COST:(poData.Freight_cost*((vehicalDatas[0].ZSUPPLIER_INV_QTY/1000))),
      // EXTRA_CHARGE_LOAD:vehicalDatas[0].EXTRA_CHARGE_LOAD,
      // ATTI_COOLI_LOAD:vehicalDatas[0].ATTI_COOLI_LOAD,
      // OFFICE_EXPENSE_LOAD:vehicalDatas[0].OFFICE_EXPENSE_LOAD,
      // WEIGHTMENT_CHARGE_LOAD:vehicalDatas[0].WEIGHTMENT_CHARGE_LOAD,
      // GATE_EXPENSE_LOAD:vehicalDatas[0].GATE_EXPENSE_LOAD,
      // OFFICE_EXPENSE_KG_LOAD:(vehicalDatas[0].OFFICE_EXPENSE_LOAD== undefined || vehicalDatas[0].OFFICE_EXPENSE_LOAD== '' || vehicalDatas[0].ZSUPPLIER_INV_QTY == undefined || vehicalDatas[0].ZSUPPLIER_INV_QTY == '') ? 0 : (vehicalDatas[0].OFFICE_EXPENSE_LOAD * (vehicalDatas[0].ZSUPPLIER_INV_QTY/1000)).toFixed(0),
      purchase_info_id:poData.purchase_info_id,
      FCI_STATUS:vehicalDatas[0].FCI_STATUS,
      ZPO_NUMBER:poData.ZPO_NUMBER,
      USERID : UserDetails.USERID,
      USER_NAME : UserDetails.username

    };
    showLoader();
    apiPostMethod(apiBaseUrl + "FCITruckController/updatesdiPOLine", postdata)
      .then((response) => {
        const { data } = response;
        if (data.success == 1) {
          ShowToast("Updated Successfully...");  
          resetForm();
        }else if(data.success == 0){
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
  const resetForm = () => {
    history.push(`/FCIENTRYAPPROVAL`);
  };

  const openAttach = (url) => {
    //window.open(previewUrl + url, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
  };

  const addTblRecord = () => {
    const {
      PURCHASE_ORG,
      VEHICAL_NO,
      WB_QTY,
      WB_DT,
      WB_COPY,
      INV_COPY,
      SEAL_NO,
      NO_OF_WAGON,
      ZSUPPLIER_INV_RATE,
      ZSUPPLIER_INV_NO,
      ZSUPPLIER_INV_DT,
      ZSUPPLIER_INV_QTY,
      SUP_VE_REFID,
      purchase_info_id,
      TRIPSHEET_NO,
      EXTRA_CHARGE,
      OFFICE_EXPENSE,
      ATTI_COOLI,
      WEIGHTMENT_CHARGE,
      GATE_EXPENSE,
      COST_TYPE,
      FREIGHT_COST,
      VEHICLE_ARRIVED,
      // EXTRA_CHARGE_LOAD,
      // OFFICE_EXPENSE_LOAD,
      // ATTI_COOLI_LOAD,
      // WEIGHTMENT_CHARGE_LOAD,
      // GATE_EXPENSE_LOAD,
      FCI_STATUS
    } = poData;

    const basicObj = {
      VEHICAL_NO,
      INV_COPY,
      WB_COPY,
      WB_QTY,
      WB_DT,
      ZSUPPLIER_INV_RATE,
      ZSUPPLIER_INV_NO,
      ZSUPPLIER_INV_DT,
      ZSUPPLIER_INV_QTY,
      SUP_VE_REFID,
      purchase_info_id,
      TRIPSHEET_NO,
      EXTRA_CHARGE,
      OFFICE_EXPENSE,
      ATTI_COOLI,
      WEIGHTMENT_CHARGE,
      GATE_EXPENSE,
      COST_TYPE,
      FREIGHT_COST,
      VEHICLE_ARRIVED,
      FCI_STATUS
      // EXTRA_CHARGE_LOAD,
      // OFFICE_EXPENSE_LOAD,
      // ATTI_COOLI_LOAD,
      // WEIGHTMENT_CHARGE_LOAD,
      // GATE_EXPENSE_LOAD,
    };
    const vhType = {
      [FCITruckMdl]: { ...basicObj },
      [ContrMdl]: { SEAL_NO, ...basicObj },
      [RackMdl]: { VEHICAL_NO, NO_OF_WAGON, INV_COPY, WB_COPY },
    };
    const vhTA = { ...vhType[PURCHASE_ORG] };
    console.log(vhTA)
    let vd = [];
    vd.push(vhTA);
    setvehicalDatas(vd);
    onCostType()
    Cost_Details()
    form.setFieldValue("COST_TYPE", { label: COST_TYPE, value: COST_TYPE });
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

  const onValueChange = (e, key, index) => {
    let vds = [...vehicalDatas];
    vds.forEach((fitem, v) => {
      if (index === v) {
       if(key=="ZSUPPLIER_INV_NO" || key=="vehical_no" || key=="no_of_wagon" || key=="supplier_wb_qty" || key=="seal_no"){
        let regEx = /[^a-zA-Z0-9]/gi; 
        if(key=="no_of_wagon" || key=="supplier_wb_qty" || key=="ATTI_COOLI" || key=="EXTRA_CHARGE" || key=="OFFICE_EXPENSE" || key=="WEIGHTMENT_CHARGE" || key=="GATE_EXPENSE" || key == "FREIGHT_COST"){
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
  const renderHeader = (vehicleId) => {
    const headObj = { [FCITruckMdl]: "Vehicle Details", [ContrMdl]: "Container Details", [RackMdl]: "Rake Details" };
    return (
      <Row className="p-0">
        <Col md="12" sm="12">
          <h5>{headObj[vehicleId]}</h5>
        </Col>
      </Row>
    );
  };
  // const onCostType = (e) => {
  //   setSelectedCostType(e);
  //   setvehicalDatas((p) => ({ ...p, COST_TYPE: e.label }));
  //   setvehicalDatas(vehicalDatas)
  // };
  const renderSupplierInvoiceDetails = (info,index) => {
    return (
      <>
        {getTextElement("Invoice Rate (In Kgs)", info.ZSUPPLIER_INV_RATE, "2")}
        {getTextElement("Invoice No", info.ZSUPPLIER_INV_NO, "2")}
        {getTextElement("Invoice Date", info.ZSUPPLIER_INV_DT, "2")}
        {getTextElement("Supplier WB qty (In Kgs)", info.ZSUPPLIER_INV_QTY, "2")}
        <Col md="2" sm="12">
                {/* <FormGroup>
                  <Label>Cost Type</Label>
                  <DropdownControl
                    placeholder={"Cost Type"}
                    selectedValue={selectedCostType}
                    url={`${apiBaseUrl}FCITruckController/CostType`}
                    value={{ label: info.COST_TYPE, value: info.COST_TYPE }}
                    onChange={(e) => onCostType(e)}
                  />
                </FormGroup> */}
            <CustomDropdownInput options={selectedCostType} label={"Payment For"} form={form} id="COST_TYPE" isDisabled = {LOAD_POST_FLAG == false || FRT_LOAD_POST_FLAG == false}/>

        </Col>
        {/* <Col md="8" sm="12">
        </Col> */}
        {info?.INV_COPY &&
        <Col md="2" sm="12">
          <FormGroup>
            {/* <Label>Invoice Copy</Label> */}
            <Uploader
                    isReadOnly
                    // canEdit
                    // setAttachment={handleFileChange}
                    label={"Invoice Copy"}
                    // title="Invoice Copy"
                    id={"INV_COPY"}
                    selectedFileName={info?.INV_COPY}
                  />
          </FormGroup>
        </Col>}
        {info?.WB_COPY &&
        <Col md="2" sm="12">
          <FormGroup>
            {/* <Label>Invoice Copy</Label> */}
            <Uploader
                    isReadOnly
                    // canEdit
                    // setAttachment={handleFileChange}
                    label={"WB Copy"}
                    // title="Invoice Copy"
                    id={"WB_COPY"}
                    selectedFileName={info?.WB_COPY}
                  />
          </FormGroup>
        </Col>}
        <HrLine
         header={'Freight Charges'}
         />
        <HrLine />
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Atti Cooli</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              roundValue
              maxValue={CostDetails.atti_cooli}
              value={info.ATTI_COOLI}
              placeholder={500}
              onChange={(e) => onValueChange(e, 'ATTI_COOLI', index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
              disabled={LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>

        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Miscellaneous charges</Label>
            <NumberOnlyInput
              type="text"
              roundValue
              // decimalFormat={"5,0"}
              maxValue={CostDetails.extra_momul}
              value={info.EXTRA_CHARGE}
              placeholder={10000}
              onChange={(e) => onValueChange(e, "EXTRA_CHARGE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
              disabled={LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense(Per Ton)</Label>
            <NumberOnlyInput
              type="text"
              // roundValue
              decimalFormat={"3,2"}
              // maxValue={((info.ZSUPPLIER_INV_QTY==undefined || info.ZSUPPLIER_INV_QTY== '') ? 1 : info.ZSUPPLIER_INV_QTY) * 40}
              maxValue={CostDetails.office_expense}
              value={info.OFFICE_EXPENSE}
              placeholder={40}
              onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
              disabled={LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>
       
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              roundValue
              // maxValue={40}
              value={(info.OFFICE_EXPENSE== undefined || info.OFFICE_EXPENSE== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
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
              // decimalFormat={"3,0"}
              roundValue
              maxValue={CostDetails.weighment_expense}
              value={info.WEIGHTMENT_CHARGE}
              placeholder={300}
              onChange={(e) => onValueChange(e, "WEIGHTMENT_CHARGE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
              disabled={LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Gate Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"3,0"}
              maxValue={CostDetails.gate_expense}
              value={info.GATE_EXPENSE}
              placeholder={200}
              onChange={(e) => onValueChange(e, "GATE_EXPENSE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
              disabled={LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Total Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              maxValue={60000}
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
            <Label for="cityMulti">PO Loading Change (Per Ton- {poData.Loading_cost})</Label>
            <NumberOnlyInput
              type="text"
              value={ parseFloat((info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (poData.Loading_cost * (info.ZSUPPLIER_INV_QTY/1000)))}
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
              value={info.FREIGHT_COST}
              placeholder={2000}
              onChange={(e) => onValueChange(e, "FREIGHT_COST", index)}
              disabled={FRT_LOAD_POST_FLAG == false}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Actual Freight Charge (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              value={(info.FREIGHT_COST== undefined || info.FREIGHT_COST== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.FREIGHT_COST * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              onBlur={(e) => onValueChange(e)}
              disabled
              // hidden
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">PO Freight Change (Per Ton- {poData.Freight_cost})</Label>
            <NumberOnlyInput
              type="text"
              value={ parseFloat((info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (poData.Freight_cost * (info.ZSUPPLIER_INV_QTY/1000)))}
              placeholder={3000}
              // onChange={(e) => onValueChange(e, "FREIGHT_CHARGE", index)}
              disabled
            />
          </FormGroup>
        </Col>

        {/* <Col md="8" sm="12">
        </Col>
        <HrLine
         header={'Loading Charges'}
         />
        <HrLine />
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Atti Cooli</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              roundValue
              maxValue={CostDetails.atti_cooli}
              value={info.ATTI_COOLI_LOAD}
              placeholder={500}
              onChange={(e) => onValueChange(e, 'ATTI_COOLI_LOAD', index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>

        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Miscellaneous charges</Label>
            <NumberOnlyInput
              type="text"
              roundValue
              // decimalFormat={"5,0"}
              maxValue={CostDetails.extra_momul}
              value={info.EXTRA_CHARGE_LOAD}
              placeholder={10000}
              onChange={(e) => onValueChange(e, "EXTRA_CHARGE_LOAD", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense(Per Ton)</Label>
            <NumberOnlyInput
              type="text"
              // roundValue
              decimalFormat={"3,2"}
              // maxValue={((info.ZSUPPLIER_INV_QTY==undefined || info.ZSUPPLIER_INV_QTY== '') ? 1 : info.ZSUPPLIER_INV_QTY) * 40}
              maxValue={CostDetails.office_expense}
              value={info.OFFICE_EXPENSE_LOAD}
              placeholder={40}
              onChange={(e) => onValueChange(e, "OFFICE_EXPENSE_LOAD", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
       
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Office Expense (per Kg)</Label>
            <NumberOnlyInput
              type="text"
              roundValue
              // maxValue={40}
              value={(info.OFFICE_EXPENSE_LOAD== undefined || info.OFFICE_EXPENSE_LOAD== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE_LOAD * (info.ZSUPPLIER_INV_QTY/1000)).toFixed(2)}
              placeholder={40}
              // onChange={(e) => onValueChange(e, "OFFICE_EXPENSE", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
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
              // decimalFormat={"3,0"}
              roundValue
              maxValue={CostDetails.weighment_expense}
              value={info.WEIGHTMENT_CHARGE_LOAD}
              placeholder={300}
              onChange={(e) => onValueChange(e, "WEIGHTMENT_CHARGE_LOAD", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Gate Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"3,0"}
              maxValue={CostDetails.gate_expense}
              value={info.GATE_EXPENSE}
              placeholder={200}
              onChange={(e) => onValueChange(e, "GATE_EXPENSE_LOAD", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col>
        <Col md="2" sm="12">
          <FormGroup>
            <Label for="cityMulti">Total Expense</Label>
            <NumberOnlyInput
              type="text"
              // decimalFormat={"5,0"}
              maxValue={60000}
              value={Number(parseFloat((info.ATTI_COOLI_LOAD == undefined || info.ATTI_COOLI_LOAD == '') ? 0 : info.ATTI_COOLI_LOAD) + parseFloat((info.OFFICE_EXPENSE_LOAD== undefined || info.OFFICE_EXPENSE_LOAD== '' || info.ZSUPPLIER_INV_QTY == undefined || info.ZSUPPLIER_INV_QTY == '') ? 0 : (info.OFFICE_EXPENSE_LOAD * (info.ZSUPPLIER_INV_QTY/1000))) + parseFloat((info.EXTRA_CHARGE_LOAD== undefined || info.EXTRA_CHARGE_LOAD== '') ? 0 : info.EXTRA_CHARGE_LOAD) + parseFloat((info.WEIGHTMENT_CHARGE_LOAD== undefined || info.WEIGHTMENT_CHARGE_LOAD== '') ? 0 : info.WEIGHTMENT_CHARGE_LOAD) + parseFloat((info.GATE_EXPENSE_LOAD== undefined || info.GATE_EXPENSE_LOAD== '') ? 0 : info.GATE_EXPENSE_LOAD)).toFixed(2)}
              placeholder={60000}
              disabled
              // onChange={(e) => onValueChange(e, "OVERALLCHARGES", index)}
              // onBlur={(e) => onValidInvoiceQty(e)}
            />
          </FormGroup>
        </Col> */}
      </>
    );
  };
  const renderContExtraFields = () => {
    const { VESSEL_NAME, VESSEL_NO, FUMIGATION } = poData;
    return (
      <Row className="col-12 m-0 p-0">
        {getTextElement("Vessel Name", VESSEL_NAME, "3")}
        {getTextElement("Vessel Number", VESSEL_NO, "3")}
        {getTextElement("Fumigation", FUMIGATION, "3")}
      </Row>
    );
  };
  const onTextChange = (e, key,CheckList) => {

    let Val=e.target ? e.target.value : e.value;
    let check = [];
    check.push(CheckList);
    for(let i=0;i<check.length;i++){
      if(check[i].SUP_VE_REFID==key){
          if(key){
            check[i].VEHICAL_NO=Val;
          }
      }
    }
    setvehicalDatas(check)
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
                      {vehicleId === FCITruckMdl ? (
                        <Label>Vehicle No</Label>
                      ) : vehicleId === ContrMdl ? (
                        <Label>Container No</Label>
                      ) : (
                        <Label>RR No</Label>
                      )}
                      <Input type="text" value={item.VEHICAL_NO} 
                      // disabled = {item.purchase_info_id > 0}
                      onChange={(e) => onTextChange(e,item.SUP_VE_REFID,item)}
                      disabled
                       />
                    </FormGroup>
                  </Col>
                  {vehicleId === ContrMdl ? <>{getTextElement("Seal No", item.SEAL_NO, "2")}</> : ""}
                  {vehicleId === RackMdl ? <>{getTextElement("No of Wagon", item.NO_OF_WAGON, "2")}</> : ""}
                  {vehicleId === FCITruckMdl || vehicleId === ContrMdl ? (
                    <>
                      {getTextElement("TripSheet No", item.TRIPSHEET_NO,"2")}
                      {getTextElement("Invoice Qty (In Kgs)", item.WB_QTY, "2")}
                      {getTextElement("Supplier WB date", item.WB_DT, "2")}
                    </>
                  ) : (
                    ""
                  )}

                  {renderSupplierInvoiceDetails(item,i)}
                  {/* <Col md="2" sm="12">
                    <FormGroup>
                      <Label className="d-block" for="nameMulti" title="Supplier Invoice Copy">
                        Inv Copy
                      </Label>
                      <Button.Ripple outline color="primary" onClick={(e) => openAttach(item.INV_COPY)}>
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">View</span>
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                  <Col md="2" sm="12">
                    <FormGroup>
                      <Label className="d-block" for="nameMulti" title="Supplier WB Copy">
                        WB Copy
                      </Label>
                      <Button.Ripple outline color="primary" onClick={(e) => openAttach(item.WB_COPY)}>
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">View</span>
                      </Button.Ripple>
                    </FormGroup>
                  </Col> */}
                </Row>

                <Col sm={12}>
                  <hr />
                </Col>
              </div>
            );
          })}
      </Col>
    );
  };
  const renderVehicals = (vehicleId) => {
    return (
      <Card>
        <CardBody>
          {renderHeader(vehicleId)}
          {vehicleId === ContrMdl ? renderContExtraFields() : ""}
          {renderBody(vehicleId)}
        </CardBody>
      </Card>
    );
  };

  const {
    ZPO_NUMBER,
    ZSUPPLIER_NAME,
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
    LINER_NAME,
    ZSUPPLIER_LOAD_POINT,
    ZSUPPLIER_LOAD_DT,
    EDA,
    LINE_ITEM
  } = poData;
  return (
    <div>
      {PURCHASE_ORG && renderVehicals(PURCHASE_ORG)}
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="12" sm="12">
                <h5>{"Supplier Dispatch Redirect"}</h5>
              </Col>
              {getTextElement("PO Number", ZPO_NUMBER)}
              {poData.VEHICLE_ARRIVED == 0 && 
              <Col md="4" sm="12">
                <CustomDropdownInput options={poLineOptions} label={"PO Line Item"} form={form} id="LINE_ITEM" disabled/>
                <span id='LINE_ITEM_Error' style={{ color: 'red' }} ></span>
              </Col> }
              {poData.VEHICLE_ARRIVED == 1 && 
              getTextElement("PO Line Item", LINE_ITEM)
              }
              {getTextElement("Supplier Name", ZSUPPLIER_NAME)}
              {getTextElement("Inco Terms", INCO_DESC)}
              {getTextElement("Broker Name", BROCKER_NAME)}
              {getTextElement("Wheat Variety", IDNLF)}
              {getTextElement("PO Rate", roundOf(NETPR))}
              {getTextElement("Receiving Storage Location", STORAGE_LOCATION)}
              {getTextElement("Receiving Plant", PLANT_NAME)}
              {getTextElement("PO Bag Type", PO_Bag_Type)}
              {getTextElement("Purchase PO org", VEHICLETYPE)}
              {getTextElement("Liner Name", LINER_NAME)}
              {getTextElement("PO Loading Date", POLOADINGDATE)}
              {getTextElement("Material NO", MATNR)}
              {getTextElement("Supplier Loading Point", ZSUPPLIER_LOAD_POINT)}
              {getTextElement("Supplier Loading Date", ZSUPPLIER_LOAD_DT)}
              {getTextElement("EDA", EDA)}
            </Row>
          </div>
        </CardBody>
      </Card>

      <Card>
        <Col sm="12" className="my-1">
          <FormGroup className="d-flex mb-0 justify-content-end align-items-center">
            <Button.Ripple outline color="secondary" type="button" className="mr-2" onClick={(e) => resetForm()}>
              Cancel
            </Button.Ripple>
            <div className="mr-50">
              <Button.Ripple color="primary" type="button" onClick={(e) => onSubmitSD()}>
                Submit
              </Button.Ripple>
            </div>
          </FormGroup>
        </Col>
      </Card>
    </div>
  );
};
export default FCIApproval;
