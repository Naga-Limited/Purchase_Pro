import { Card, Table, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import Uploader from "../Uploader";
import { Link, useHistory } from "react-router-dom";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { qcTestUrl, uploadUrl, qcUrl, getWheatMasterUrl,qaUrl,SaveCaptureImage, sapFileShare } from "../../urlConstants";
import { QCConstant, QCFConstant } from "./constant";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import QualityCheckFormUnload, {  getFungusAndRainKey,getQcFormPostData, isFungusOrRainDamageItem, surveyorDeviceType, validateQualityForm } from "./QualityCheckFormUnload";
import { InputControl } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import CaptureImage from "../CaptureImage";
const statusOptions = [
  {
    options: [
      { value: "A", label: "A-Accepted" },
      { value: "R", label: "R-Rejected" },
      { value: "AD", label: "AD - Accepted with Deduction" },
    ],
  },
];
const RakestatusOptions = [
  {
    options: [
      { value: "A", label: "A-Accepted" },
      { value: "AD", label: "AD - Accepted with Deduction" },
    ],
  },
];

const testOptions = [
  {
    options: [
      { value: "nir_yes", label: "NIR - Yes" },
      { value: "nir_no", label: "NIR - No" },
      { value: "nir_foss", label: "NIR - FOSS" },
      { value: surveyorDeviceType, label: "Surveyor" },
    ],
  },
];
const degradeOptions = [
  {
    options: [
      { value: "1", label: "Yes" },
      { value: "2", label: "No" },
    ],
  },
];

const QualityDeductionDetailsAfterUnload = () => {
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { id } = useParams();
  
  let refid = id.replace(":", "");
  const [poData, setPoData] = useState({ ...QCConstant });
  const [formData, setFormaData] = useState({ ...QCFConstant });
  const [qcFormData, setqcFormData] = useState([]);
  const [attachedFiles, setAttachment] = useState({ qcdeddoc: {} });
  const [wheatVarityOptions, setWheatVarityOptions] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState();
  const [showLastCol, setshowLastCol] = useState(true);
  const [ImgData, setImgData] = useState({});
  const onTextChange = (e, key) => {
   /* setFormaData({
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    });*/
  };
  const onTextChange_invRate = (e, key) => {
    let Val=e.target ? e.target.value : e.value;
    if(key=="InvoiceRate"){
    let regEx = /[^0-9.]/gi;
    Val = Val.replace(regEx, "");
    }
    setFormaData({
      ...formData,
      [key]: Val,
    });
    if(key=="InvoiceRate"){
      if(Val==""){Val=0;}
      onFetchQCdetailsById(poData.InvoiceQty,Val,1);
    }
   };

  const onTextChange_InvQty = (e, key) => {
    let InvQty=e.target ? e.target.value : e.value;
    
    let regEx = /[^0-9.]/gi;
    InvQty = InvQty.replace(regEx, "");

    setPoData({
      ...poData,
      [key]: InvQty,
    });
    if(InvQty==""){InvQty=0;}
    onFetchQCdetailsById(InvQty,formData.InvoiceRate,1);
  };
  const onQCDetails = (Status) => {
/*
    if(isFilledAll()){
      return false;
    }*/
    let fields = getQcFormPostData(qcFormData);
    const { qcdeviceType, InvoiceRate, PORate, RateDifference, RateDifferenceDeduction, wheat_variety,TotalDeduction } = formData;
    const { SCREEN_TYPE, VEHICLE_TYPE, ZPO_NUMBER,ZVA_NUMBER,InvoiceQty } = poData;
   // const { TotalDeduction }=form.values;
   
    let fdata = {
      //...fields,
     
      TotalDeduction: TotalDeduction,
      purchase_info_id: refid,
    
      formType: "QCDEDUCTION",
    
     
      wheat_variety: wheat_variety,
     
      VECHICAL_STATUS:Status,
      InvoiceRate,
      InvoiceQty,
      RateDifference: RateDifference,
      RateDifferenceDeduction: RateDifferenceDeduction,
    };
    //console.log(JSON.stringify(fdata));
  ///return false;
  
  
  if((attachedFiles.qcdeddoc && attachedFiles.qcdeddoc.name) || ImgData.qcdeddocImg){
    let postdata = new FormData();
  Object.keys(attachedFiles).forEach((key) => {
    postdata.append("file[]", attachedFiles[key]);
  });
  let FileSave=sapFileShare;
  console.log("ImgData")
  console.log(JSON.stringify(ImgData));
  if(ImgData.qcdeddocImg){
    postdata.append("image[]", ImgData.qcdeddocImg);
    FileSave=SaveCaptureImage;
  }
  postdata.append("form_name", SCREEN_TYPE);
  postdata.append("ponumber", ZPO_NUMBER);
  postdata.append("VA_Number", ZVA_NUMBER);
  postdata.append("SubFolder", "QCDeduction");
 
    showLoader();
    apiPostMethod(FileSave, postdata, "File")
    .then((response) => {
      const { data } = response;
      if (data.success) {
        fdata.qc_deduction_doc = data.files[0].updname;
       // console.log(JSON.stringify(fdata));
      //  return false;
        SaveDeduction(fdata);
       
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
  }else{
    SaveDeduction(fdata);
  }
  

  };
  const  SaveDeduction = (fdata)=>{
    //console.log("SaveData")
    ///console.log(JSON.stringify(fdata));
   // return false;
    showLoader();
        apiPostMethod(qcUrl, fdata)
        .then((response) => {
          if (response.data.success) {
            history.push(`/QA`);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
      };
  useEffect(() => {
    if (!poData.ZPO_NUMBER) {
      onFetchPodetailsById();
      fetchWheatVariety();
      //onFetchQCdetailsById();
      onFetchQCdetailsById('','',0);
    }
  }, [poData]);
  const CalcTotalAmount = (NewData) =>{
    console.log(JSON.stringify(NewData));
    let tot=0;
    for(let i=0;i<NewData.length;i++){
     let  val=NewData[i].AcceptedDeductionAmount;
     if(val==""){
      val=0;
     }
      tot=parseFloat(tot)+parseFloat(val);
    }
    console.log(tot);
    tot=parseFloat(tot)+parseFloat(formData.RateDifferenceDeduction);
    setFormaData({ ...formData, TotalDeduction:tot });
  }
  const onFetchPodetailsById = () => {
    let fdata = {
      id: refid,
      formType: "PO",
    };
    apiPostMethod(qcUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPoData({ ...poData, ...data.results[0] });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onFetchQCdetailsById = (InvQty,InvRate,OnchangeVal) => {
    let fdata = {
      id: refid,
      formType: "QADeduction",
      InvoiceQty:InvQty,
      InvoiceRate:InvRate,
      OnchangeVal
      
    };
    showLoader();
    apiPostMethod(qaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const podata = data.results[0];
          podata.deduction_amount = podata.deduction_amount ? podata.deduction_amount : "0";
          setFormaData({ ...formData, ...podata });
          form.setValues({...podata});
          setqcFormData(
            data.params.map((f) => {
              let isFun = isFungusOrRainDamageItem(f.MIC_DESC);
              if (isFun) {
                const { noOfBagKey, quaraKey } = getFungusAndRainKey(f.FIELD_MAP);
                return {
                  ...f,
                  [noOfBagKey]: podata[noOfBagKey],
                  [quaraKey]: podata[quaraKey],
                };
              }
              return f;
            })
          );
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
  const fetchWheatVariety = () => {
    apiGetMethod(getWheatMasterUrl)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWheatVarityOptions(data.results);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onDeviceChange = (e) => {
    setSelectedDeviceType(e);
    onFetchQCTest(e.value);
    onTextChange(e, "qcdeviceType");
  };

  const onFetchQCTest = (val) => {
    let fdata = {
      wvcode: poData.IDNLF,
      qctest: val,
    };
    showLoader();
    apiPostMethod(qcTestUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const result = data.results;
          setqcFormData(result);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const onDegradeChange = (e) => {
    const { value } = e.target ? e.target : e;
    setFormaData({
      ...formData,
      degrade: value,
      wheat_variety: "",
    });
  };

  const fileUploadAction = () => {
    document.getElementById("qcdeddoc").click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      let _filesarr = {
        ...attachedFiles,
        [e.target.id]: e.target.files[0],
      };
      setAttachment(_filesarr);
    }
  };

  const isFilledAll_OLD = () => {
    const isAttachedVal = attachedFiles.qcwrkdoc && attachedFiles.qcwrkdoc.name && attachedFiles.qcwrkdoc.name.length ? true : false;
    if (!isAttachedVal) {
      return true;
    }
    const qctestvalue = validateQualityForm(qcFormData);
    if (qctestvalue.length) {
      return true;
    }
    let fmdata = { ...formData };
    delete fmdata.others_comment;
    if (fmdata.degrade === "2") {
      delete fmdata.wheat_variety;
    }
    if (selectedDeviceType && selectedDeviceType.value === surveyorDeviceType && (!fmdata.surveyor_name || !fmdata.surveyor_name.trim())) {
      return true;
    }
    const fmValues = Object.values(fmdata);
    return !fmValues.every((x) => x !== null && x !== "");
  };
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log("SHOW ERROR:"+Id);
    document.getElementById(Id).innerHTML=Msg;
    }
  }
  }
  const isFilledAll = () => {
   
    showError("qctestvalue_Error","Fill the Quality check Details..! ",0);
    showError("selectedDeviceType_Error","Invalid WB Name ",0);
    showError("recommended_lot_Error","Invalid WB Name ",0);
    showError("degrade_Error","Invalid WB Name ",0);
    showError("wheat_variety_Error","Invalid WB Name ",0);
    showError("overall_result_Error","Invalid WB Name ",0);
    showError("others_comment_Error","Invalid WB Name ",0);
    
    const isAttachedVal = attachedFiles.qcwrkdoc && attachedFiles.qcwrkdoc.name && attachedFiles.qcwrkdoc.name.length ? true : false;
    if (!isAttachedVal) {
      
      showError("qcwrkdoc_Error","QC Document Not Uploaded..! ",1);
      return true;
    }
    const qctestvalue = validateQualityForm(qcFormData);
    if (qctestvalue.length) {
      
      showError("qctestvalue_Error","Fill the Quality check Details..! ",1);
      return true;
    }
    let fmdata = { ...formData };
    delete fmdata.others_comment;
    if (fmdata.degrade === "2") {
      delete fmdata.wheat_variety;
    }
    if(!selectedDeviceType){
      showError("selectedDeviceType_Error","Select Device type ",1);
    }
    if (selectedDeviceType && selectedDeviceType.value === surveyorDeviceType && (!fmdata.surveyor_name || !fmdata.surveyor_name.trim())) {
      
      showError("selectedDeviceType_Error","Invalid Device type ",1);
     
      return true;
    }
    
    if(!formData.recommended_lot) { showError("recommended_lot_Error","Enter Recommended Lot",1); }
    if(!formData.degrade) { showError("degrade_Error","Select Degrade",1); }
    if(!formData.degrade==1){
    if(!formData.wheat_variety) { showError("wheat_variety_Error","Select Wheat Variety",1); }
    }
    if(!formData.overall_result) { showError("overall_result_Error","Select Overall Result",1); }
    if(!formData.others_comment) { showError("others_comment_Error","Select Overall Result",1); }
    
   

    const fmValues = Object.values(fmdata);
    console.log(JSON.stringify(fmValues));
    return !fmValues.every((x) => x !== null && x !== "");
  };

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
   
  });
console.log(JSON.stringify(formData));
  const { qcdeddoc } = attachedFiles;
  const {ZPO_NUMBER, TRUCK_NO, DRIVER_NO, IDNLF, ZVA_NUMBER ,InvoiceQty,VEHICLE_TYPE,InvoiceCopy,WBCopy } = poData;
  const { InvoiceRate,PORate,RateDifference,RateDifferenceDeduction,TotalDeduction,QCDeductionRemark,DEVICE_TYPE } = formData;
  
  const { degrade } = formData;
  return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Quality Check : {ZVA_NUMBER}
      </p>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="12" sm="12">
                <h5>Vehicle Info</h5>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={ZPO_NUMBER} placeholder="PO Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Vehicle Number</Label>
                  <Input type="text" value={TRUCK_NO}  maxlength={10} placeholder="Vehicle Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Driver Number</Label>
                  <Input type="text" value={DRIVER_NO} placeholder="Driver Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="wheatvariety">Wheat Variety</Label>
                  <Input type="text" value={IDNLF} placeholder="Wheat Variety" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Device Type</Label>
                 {/* <Select
                    options={testOptions}
                    value={selectedDeviceType}
                    id={"deviceType"}
                    className="react-select"
                    classNamePrefix="select"
                    onChange={(e) => onDeviceChange(e)}
                  />*/}
                    <Input type="text" value={DEVICE_TYPE} placeholder="Device Type" disabled />
                </FormGroup>
                <span id="selectedDeviceType_Error" style={{color: "red"}} ></span>
              </Col>
              {selectedDeviceType && selectedDeviceType.value === surveyorDeviceType && (
                <>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>Surveyor Name</Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="SurveyorName"
                        onChange={(e) => onTextChange(e, "surveyor_name")}
                        placeholder="Surveyor Name"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>Reference No (Optional)</Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="ReferenceNo"
                        onChange={(e) => onTextChange(e, "reference_no")}
                        placeholder="Reference No"
                      />
                    </FormGroup>
                  </Col>
                </>
              )}
            </Row>
            {qcFormData && qcFormData.length ? (
              <>
              <span id="qctestvalue_Error" style={{color: "red"}} ></span>
                <Row className="mt-2">
                  <Col md="12" sm="12">
                    <h5>Quality Info</h5>
                  </Col>
                  
                      
                  <Col md="12" sm="12">
                  <div  class="table-responsive" style={{height:"500px"}}>
                  <table class="table">
                   {/* <Table responsive >*/}
                      <thead>
                        <tr>
                        <th rowSpan="2" style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}}  className="custom-width">Category</th>
                        <th colSpan="4" style={{border:"1px solid #fff",textAlign:"center",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}} >QC - 1</th>
                          <th colSpan="2" style={{border:"1px solid #fff",textAlign:"center",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px",zIndex:1}} >QC - 2</th>

                         <th rowSpan="2" style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}}  >1stQC vs 2ndQC</th>
                          <th rowSpan="2" style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}} >Deduction Spec</th>
                          <th rowSpan="2" style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}} >System Processed Deduction</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "0px"}} rowSpan="2">Accepted Deduction Amt</th>
                          </tr>
                          <tr>
                         
                         <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px"}} >1st Actual</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px"}} >Min</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px"}} >Max</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px"}} >Status</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px",zIndex:1}}  >2nd Actual</th>
                          <th style={{border:"1px solid #fff",backgroundColor:"#7367f0",color:"#fff",position: "sticky",top: "39px"}} >Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <QualityCheckFormUnload showLastCol={showLastCol} CalcTotalAmount={CalcTotalAmount} qcFormData={qcFormData} isViewOnly={true} deduction={true} setqcFormData={setqcFormData} />
                      </tbody>
                    {/* </Table>*/}
                    </table>
                   </div>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                       Invoice Qty
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        
                        name="InvoiceQty"
                        value={InvoiceQty}
                        onChange={(e) => onTextChange_InvQty(e, "InvoiceQty")}
                        placeholder="Invoice Rate"
                      />
                    </FormGroup>
                    <span id="InvoiceQty_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                       Invoice Rate
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="InvoiceRate"
                       
                        value={InvoiceRate}
                        onChange={(e) => onTextChange_invRate(e, "InvoiceRate")}
                        placeholder="Invoice Rate"
                      />
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                      PO Rate
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="PORate"
                        disabled={true}
                        value={PORate}
                        onChange={(e) => onTextChange(e, "PORate")}
                        placeholder="PO Rate"
                      />
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                       RateDifference
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="RateDifference"
                        disabled={true}
                        value={RateDifference}
                        onChange={(e) => onTextChange(e, "RateDifference")}
                        placeholder="Difference"
                      />
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                       Deduction Amount
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="DeductionAmount"
                        disabled={true}
                        value={RateDifferenceDeduction}
                        onChange={(e) => onTextChange(e, "DeductionAmount")}
                        placeholder="Deduction Amount"
                      />
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="2">
                    <FormGroup>
                    <Label for="nameMulti" className="d-block">
                      Total Deduction Amount
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="TotalDeductionAmount"
                        value={TotalDeduction}
                        disabled={true}
                        onChange={(e) => onTextChange(e, "TotalDeductionAmount")}
                        placeholder="TotalDeductionAmount"
                      />

                       {/* <CustomTextInput label={"Total Deduction Amount"} 
                        form={form} id="TotalDeduction" type="text"  disabled={true}    />*/}

                      {/* onChange={(e) => onTextChange(e, "TotalDeductionAmount")}*/}
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col md="4" sm="12">
                <FormGroup>
                <Uploader isReadOnly={true} label={"Invoice  Copy"} selectedFileName={InvoiceCopy} />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                <Uploader isReadOnly={true} label={"WB Copy"} selectedFileName={WBCopy} />
                </FormGroup>
              </Col>
                 {QCDeductionRemark!=null && QCDeductionRemark!="" && <Col  md="4" sm="12">
                    <InputControl
                      label={"Remarks"}
                      type="textarea"
                      value={QCDeductionRemark}
                      name="QCDeductionRemark"
                      id="QCDeductionRemark"
                     // onChange={(e) => onTextChange(e, "QCDeductionRemark")}
                    //  onChange={(e) => onTextChange_Rem(e, "QCDeductionRemark")}
                      rows="2"
                      placeholder="Remarks"
                    />
                    
                  </Col>}
                  <Col sm="12" md="4">
                    <FormGroup>
                      <Label for="nameMulti">QC Deduction Documents</Label>
                      <br />
                      <input
                        type="file"
                        className="form-control"
                        id="qcdeddoc"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChange(e);
                        }}
                      />
                      <span id="qcdeddoc_Error" style={{color: "red"}} ></span>
                     
                      <Button.Ripple
                        outline
                        color="primary"
                        onClick={(e) => {
                          fileUploadAction();
                        }}
                      >
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">Attach</span>
                      </Button.Ripple>
                      <div className="align-middle ml-25">{qcdeddoc.name}</div>

                      <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"qcdeddocImg"} />

                    </FormGroup>
                  </Col>
                 
                </Row>
              
              </>
            ) : (
              ""
            )}
            <Col sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple outline color="secondary" tag={Link} to={`/QA`} type="reset" className="mr-2">
                  Cancel
                </Button.Ripple>
                <div className="mr-1">
                  {/* disabled={isFilledAll()} // Removed from below button */}
                  <Button.Ripple color="primary" type="button" onClick={(e) => onQCDetails(22)}>
                    Submit
                  </Button.Ripple>
                </div>
              </FormGroup>
            </Col>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default QualityDeductionDetailsAfterUnload;
