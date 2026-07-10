import { Card, Table, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { qcTestUrl, uploadUrl, qcUrl, getWheatMasterUrl,SaveCaptureImage,uploadandSaveImageUrl, sapFileShare } from "../../urlConstants";
import { QCConstant, QCFConstant } from "./constant";
import QualityCheckForm, { getQcFormPostData, surveyorDeviceType, validateQualityForm } from "./QualityCheckForm";
import { InputControl } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import Uploader from "../Uploader";
import CaptureImage from "../CaptureImage";
import NumberOnlyInput from "../../@core/components/number-input/number-input";

//import htmlComponent from "http://localhost/pp/api/CaptureImage.html";


const statusOptions = [
  {
    options: [
      { value: "A", label: "Second QC Check" },
      { value: "R", label: "R-Rejected" },
      // { value: "AD", label: "AD - Accepted with Deduction" },
    ],
  },
];
const sto_statusOptions = [
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

const QualityCheckDetails = () => {
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { id } = useParams();
  let refid = id.replace(":", "");
  const [ImgData, setImgData] = useState({});
  const [poData, setPoData] = useState({ ...QCConstant });
  const [formData, setFormaData] = useState({ ...QCFConstant });
  const [qcFormData, setqcFormData] = useState([]);
  const [attachedFiles, setAttachment] = useState({ qcwrkdoc: {},Invoice_Copy:{},WB_Copy:{} });
  const [wheatVarityOptions, setWheatVarityOptions] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState();
  const [Readonly, setReadonly] = useState(false);
  const [ZVANUMBERS, setZVANUMBERS] = useState('');
  const [Invoice_Copys, setInvoice_Copys] = useState('');
  const [WBCopys, setWBCopys] = useState('');

  const onTextChange = (e, key) => {
    console.log("Test");
    let Value=e.target ? e.target.value : e.value;
    if(key=="ZSUPPLIER_INV_QTY"){
      if(Value>70000){
        Value=70000;
      }
    }
    console.log(Value);
    if(key!="qcdeviceType" && key!="ZSUPPLIER_INV_QTY" && key!="ZSUPPLIER_INV_RATE"){
    let regEx = /[^a-zA-Z0-9]/gi; 
       
    Value = Value.replace(regEx, "");
    }
    if( key=="ZSUPPLIER_INV_QTY" || key=="ZSUPPLIER_INV_RATE"){
      let regEx = /[^0-9.]/gi; 
         
      Value = Value.replace(regEx, "");
      }
console.log(Value);
    setFormaData({
      ...formData,
      [key]:Value,
    });
  };
  const onQCDetails = () => {
    
    if(isFilledAll()){
      return false;
    }
    if(qcFormData.length==0){
      errorToast("Please Update The Quality Master..!");
      return false;
    }
    let fields = getQcFormPostData(qcFormData);
    const { qcdeviceType, others_comment, overall_result, recommended_lot, degrade, wheat_variety, surveyor_name, reference_no,ZSUPPLIER_INV_QTY,ZSUPPLIER_INV_RATE,WB_COPY,INV_COPY  } = formData;
    const { SCREEN_TYPE, VEHICLE_TYPE, ZPO_NUMBER,VECHICAL_STATUS,ZVA_NUMBER} = poData;
    // console.log()
    let {QCDocument,Invoice_CopyImg,WB_CopyImg} = ImgData;
    let fdata = {
      ...fields,
      others_comment: others_comment,
      overall_result: overall_result,
      recommended_lot: recommended_lot,
      surveyor_name: surveyor_name,
      reference_no: reference_no,
      purchase_info_id: refid,
      deviceType: qcdeviceType,
      formType: "A",
      VEHICLE_TYPE: VEHICLE_TYPE,
      degrade: degrade,
      wheat_variety: wheat_variety,
      PO_NUMBER: ZPO_NUMBER,
      VECHICAL_STATUS,
      SCREEN_TYPE,
      ZSUPPLIER_INV_QTY:ZSUPPLIER_INV_QTY||InvoiceQty,
      ZSUPPLIER_INV_RATE:ZSUPPLIER_INV_RATE||InvoiceRate
    };
    
    

    let FileSaveUrl="";
    let postdata = new FormData();
    
      console.log("SAVE")
      console.log("SCREEN_TYPE:", SCREEN_TYPE);
      // console.log(JSON.stringify(poData))

      postdata.append("image[]", QCDocument);
      postdata.append("image[]", Invoice_CopyImg);
      postdata.append("image[]", WB_CopyImg);
      FileSaveUrl=SaveCaptureImage;
     
      let UploadFile=0;
      Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
       
        
      });

      UploadFile = attachedFiles.qcwrkdoc && attachedFiles.qcwrkdoc.name && attachedFiles.qcwrkdoc.name.length ? true : false;
      postdata.append("form_name", SCREEN_TYPE);
      postdata.append("ponumber", ZPO_NUMBER);
      postdata.append("VA_Number", ZVA_NUMBER);
      postdata.append("SubFolder", "Quality_Check");
      FileSaveUrl=sapFileShare;
      if(UploadFile==true){
       
      FileSaveUrl=sapFileShare;
    
      showLoader();
     
      apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.qc_work_doc = data.files[0] ? data.files[0].updname : "";
            fdata.InvoiceCpy = data.files[1] ? data.files[1].updname: INV_COPY;
            fdata.WBCpy = data.files[2] ? data.files[2].updname : WB_COPY;
            console.log(JSON.stringify(fdata));
            //return false;

            

            apiPostMethod(qcUrl, fdata)
              .then((response) => {
                if (response.data.success) {
                  history.push(`/QC`);
                }
              })
              .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again after sometime");
              });
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
        showLoader();
        apiPostMethod(qcUrl, fdata)
              .then((response) => {
                if (response.data.success) {
                  history.push(`/QC`);
                }
              })
              .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again after sometime");
        }).finally((a) => {
          hideLoader();
        });
      }
    
  };

  useEffect(() => {
    if (!poData.ZPO_NUMBER) {
      onFetchPodetailsById();
      fetchWheatVariety();
    }
   
  }, [poData]);

  const   onFetchPodetailsById = () => {
    let fdata = {
      id: refid,
      formType: "PO",
    };
    console.log(fdata)
    apiPostMethod(qcUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log('data')
        console.log(data)
        if (data.success) {
          //setPoData({ ...poData, ...data.results[0] });
          setPoData({ ...poData, ...data.results[0],...data.SupplierSapDet[0] });
          setZVANUMBERS(data.results[0].ZVA_NUMBER.length)
          setInvoice_Copys(data.results[0].InvoiceCopy)
          setWBCopys(data.results[0].WBCopy)

          setqcFormData(data.qmResults);
          setSelectedDeviceType({label:"NIR - FOSS",value:"nir_foss"});
        /*  setFormaData({
            ...formData,
            qcdeviceType:"nir_foss",
          });*/
          setFormaData({
            ...formData,
            ...data.SupplierDispDetails[0],
            qcdeviceType:"nir_foss",
          });
          setReadonly(true);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
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
    setReadonly(false)
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
    document.getElementById("qcwrkdoc").click();
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

  const fileUploadActionWB = () => {
    document.getElementById("WB_Copy").click();
  };

  const handleFileChangeWB = (e) => {
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

  const fileUploadActionInv = () => {
    document.getElementById("Invoice_Copy").click();
  };

  const handleFileChangeInv = (e) => {
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
    showError("qcwrkdoc_Error","Invalid WB Name ",0);
    showError("Invoice_Copy_Error","Invalid WB Name ",0);
    showError("WB_Copy_Error","Invalid WB Name ",0);
    showError("qctestvalue_Error","Fill the Quality check Details..! ",0);
    showError("selectedDeviceType_Error","Invalid WB Name ",0);
    showError("recommended_lot_Error","Invalid WB Name ",0);
    showError("degrade_Error","Invalid WB Name ",0);
    showError("wheat_variety_Error","Invalid WB Name ",0);
    showError("overall_result_Error","Invalid WB Name ",0);
    showError("others_comment_Error","Invalid WB Name ",0);
    
    
    
    let isAttachedVal = attachedFiles.qcwrkdoc && attachedFiles.qcwrkdoc.name && attachedFiles.qcwrkdoc.name.length ? true : false;
    let isCaptured=ImgData && ImgData.QCDocument ? true : false;
    
    if (!isAttachedVal && !isCaptured && poData.SCREEN_TYPE=="SDO") {
      
      showError("qcwrkdoc_Error","QC Document Not Uploaded/Captured..! ",1);
      return true;
    }
    if(poData.SCREEN_TYPE=="SDO" && ZVANUMBERS != "20" ){
       isAttachedVal = attachedFiles.Invoice_Copy && attachedFiles.Invoice_Copy.name && attachedFiles.Invoice_Copy.name.length ? true : false;
       isCaptured=ImgData && ImgData.Invoice_CopyImg ? true : false;
      if (!isAttachedVal && !isCaptured) {
      
       showError("Invoice_Copy_Error","Invoice Copy Not Uploaded/Captured..! ",1);
       return true;
     }

      isAttachedVal = attachedFiles.WB_Copy && attachedFiles.WB_Copy.name && attachedFiles.WB_Copy.name.length ? true : false;
      isCaptured=ImgData && ImgData.WB_CopyImg ? true : false;
     if (!isAttachedVal && !isCaptured ) {
     
      showError("WB_Copy_Error","WB Copy Not Uploaded/Captured..! ",1);
      return true;
    }
      
    }

    const qctestvalue = validateQualityForm(qcFormData);
    if (qctestvalue.length) {
      
      showError("qctestvalue_Error","Fill the Quality check Details..! ",1);
      return true;
    }

    let fmdata = { ...formData };
      console.log("fmdata ", fmdata);
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
    
    console.log("formData.recommended_lot", formData.recommended_lot);

    if(!formData.recommended_lot) { showError("recommended_lot_Error","Enter Recommended Lot",1); }
    if(!formData.degrade) { showError("degrade_Error","Select Degrade",1); }
    if(!formData.degrade==1){if(!formData.wheat_variety) { showError("wheat_variety_Error","Select Wheat Variety",1);}}
    if(!formData.overall_result) { showError("overall_result_Error","Select Overall Result",1); }
    /*Commented 21102021 as req.by client 
    if(!formData.others_comment) { showError("others_comment_Error","Select Overall Result",1); }
    */
   

    const fmValues = Object.values(fmdata);
    
    console.log(JSON.stringify(fmValues));
    if (poData.SCREEN_TYPE === "SDI"){
      console.log("fmValues:", fmValues, "SCREEN TYPE:", poData.SCREEN_TYPE);
      return false;
    }else{
      return !fmValues.every((x) => x !== null && x !== "");
    }
  };

  

  /*const capture = React.userCallback(
()=>{
const imageSrc=webcamRef.current.getScreenshot();
},
[webcamRef]
  );*/

  console.log(JSON.stringify(attachedFiles));
  const { qcwrkdoc,Invoice_Copy,WB_Copy } = attachedFiles;
  const { ZPO_NUMBER, TRUCK_NO, DRIVER_NO, IDNLF, ZVA_NUMBER,NETPR,PURCHASE_ORG_DESC,SCREEN_TYPE,WheatSegment,InvoiceQty,InvoiceRate,InvoiceCopy,WBCopy } = poData;
  const { degrade,ZSUPPLIER_INV_QTY,ZSUPPLIER_INV_RATE,INV_COPY,WB_COPY } = formData;


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
                  <Input type="text" maxLength={10} value={TRUCK_NO} placeholder="Vehicle Number" disabled />
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
                  <Label for="wheatvariety">Segment</Label>
                  <Input type="text" value={WheatSegment} placeholder="Segment" disabled />
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
                  <Select
                    options={testOptions}
                    value={selectedDeviceType}
                    id={"deviceType"}
                    className="react-select"
                    classNamePrefix="select"
                    onChange={(e) => onDeviceChange(e)}
                  />
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
                  
                      
                  <Col md="9" sm="12">
                  <div  class="table-responsive" style={{height:"500px"}}>
                  <table class="table">
                   {/* <Table responsive >*/}
                      <thead>
                        <tr>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}} className="custom-width">Category</th>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff",zIndex:1}}>Quality</th>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}}>Min</th>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}}>Max</th>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <QualityCheckForm Readonly={Readonly} qcFormData={qcFormData} setqcFormData={setqcFormData} />
                      </tbody>
                      {/* </Table>*/}
                      </table>
                   </div>
                  </Col>
                  <Col className="pt-5" sm="12" md="4">
                    <FormGroup>
                      <Label for="nameMulti" className="d-block">
                        Recommended Lot{" "}
                      </Label>
                      <Input
                        type="text"
                        maxLength="20"
                        name="unloadlot"
                        value={formData.recommended_lot}
                        onChange={(e) => onTextChange(e, "recommended_lot")}
                        placeholder="Recommended Lot"
                      />
                    </FormGroup>
                    <span id="recommended_lot_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" sm="12" md="4">
                    <FormGroup>
                      <Label for="nameMulti">Overall Result</Label>
                      <Select
                        className="react-select"
                        classNamePrefix="select"
                        //options={poData.VEHICLE_TYPE !== "Rake" ? poData.SCREEN_TYPE=="SDO" ? sto_statusOptions : statusOptions : RakestatusOptions}
                        options={poData.VEHICLE_TYPE !== "Rake" ?  statusOptions : RakestatusOptions}
                        onChange={(e) => onTextChange(e, "overall_result")}
                      />
                    </FormGroup>
                    <span id="overall_result_Error" style={{color: "red"}} ></span>
                  </Col>
                  <Col className="pt-5" md="4" sm="12">
                    <FormGroup>
                      <Label>Degrade</Label>
                      <Select
                        className="react-select"
                        classNamePrefix="select"
                        options={degradeOptions}
                        onChange={(e) => onDegradeChange(e)}
                      />
                    </FormGroup>
                    <span id="degrade_Error" style={{color: "red"}} ></span>
                  </Col>
                  {degrade && degrade == "1" ? (
                    <Col md="4" sm="12">
                      <FormGroup>
                        <Label>Wheat Variety</Label>
                        <Select
                          className="react-select"
                          classNamePrefix="select"
                          options={wheatVarityOptions}
                          onChange={(e) => onTextChange(e, "wheat_variety")}
                        />
                      </FormGroup>
                      <span id="wheat_variety_Error" style={{color: "red"}} ></span>
                    </Col>
                  ) : (
                    ""
                  )}
                
                  <Col sm="12" md="4">
                    <FormGroup>
                      <Label for="nameMulti">QC Documents</Label>
                      <br />
                      <input
                        type="file"
                        className="form-control"
                        id="qcwrkdoc"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChange(e);
                        }}
                        
                      />
                     

                      <span id="qcwrkdoc_Error" style={{color: "red"}} ></span>
                     
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
                      <div className="align-middle ml-25">{qcwrkdoc.name}</div>
                      <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"QCDocument"} />
                    </FormGroup>
                    
                  </Col>
                  <Col md="4" sm="12">
                <FormGroup>
                  <Label for="poRate">PO Rate</Label>
                  <Input type="text" value={NETPR}  disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="VehType">Vehicle Type</Label>
                  <Input type="text" value={PURCHASE_ORG_DESC}  disabled />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="InvoiceQty">Invoice Qty (In Kgs)</Label>
                  <NumberOnlyInput
                        type="text"
                        maxLength="20"
                        decimalFormat={"6,0"}
                        name="ZSUPPLIER_INV_QTY"
                        value={ZSUPPLIER_INV_QTY||InvoiceQty}
                        disabled={SCREEN_TYPE=="SDI" || InvoiceQty}
                        onChange={(e) => onTextChange(e, "ZSUPPLIER_INV_QTY")}
                        placeholder={` Max 70000`}
                      />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="InvoiceRate">Invoice Rate (In Kgs)</Label>
                  <NumberOnlyInput
                        type="text"
                        maxLength="20"
                        decimalFormat={"2,2"}
                        name="ZSUPPLIER_INV_RATE"
                        value={ZSUPPLIER_INV_RATE||InvoiceRate}
                        disabled={SCREEN_TYPE=="SDI" || InvoiceRate}
                        onChange={(e) => onTextChange(e, "ZSUPPLIER_INV_RATE")}
                        placeholder="Decimal (2,2)"
                      />
                </FormGroup>
              </Col>

              

              <Col md="4" sm="12">
                <FormGroup>
                {ZVANUMBERS == '20' && <Uploader isReadOnly={true} label={"Invoice Copy"} selectedFileName={Invoice_Copys} />}
                {SCREEN_TYPE=="SDI" && ZVANUMBERS != '20' && <Uploader isReadOnly={true} label={"Invoice Copy"} selectedFileName={INV_COPY} />}
                {SCREEN_TYPE=="SDO" && ZVANUMBERS != '20' && <>
                <Label for="nameMulti">Invoice Copy</Label>
                      <br />
                      <input
                        type="file"
                        className="form-control"
                        id="Invoice_Copy"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChangeInv(e);
                        }}
                        
                      />
                     

                      <span id="Invoice_Copy_Error" style={{color: "red"}} ></span>
                     
                      <Button.Ripple
                        outline
                        color="primary"
                        onClick={(e) => {
                          fileUploadActionInv();
                        }}
                      >
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">Attach</span>
                      </Button.Ripple>
                      <div className="align-middle ml-25">{Invoice_Copy.name}</div>
                      <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"Invoice_CopyImg"} />
                       </>}
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                {ZVANUMBERS == '20' && <Uploader isReadOnly={true} label={"WB Copy"} selectedFileName={WBCopys} />}
                {SCREEN_TYPE=="SDI" && ZVANUMBERS != '20' && <Uploader isReadOnly={true} label={"WB Copy"} selectedFileName={WB_COPY} />}
                {SCREEN_TYPE=="SDO" && ZVANUMBERS != '20' &&  <>
                <Label for="nameMulti">WB Copy</Label>
                <br />
                      <input
                        type="file"
                        className="form-control"
                        id="WB_Copy"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChangeWB(e);
                        }}
                        
                      />
                     

                      <span id="WB_Copy_Error" style={{color: "red"}} ></span>
                     
                      <Button.Ripple
                        outline
                        color="primary"
                        onClick={(e) => {
                          fileUploadActionWB();
                        }}
                      >
                        <Paperclip size={14} />
                        <span className="align-middle ml-25">Attach</span>
                      </Button.Ripple>
                      <div className="align-middle ml-25">{WB_Copy.name}</div>
                      <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"WB_CopyImg"} />
                       </>}
                   
                </FormGroup>
              </Col>

                  
                  
                </Row>
                <Row>
                  <Col>
                    <InputControl
                      label={"Comments"}
                      type="textarea"
                      value={formData.others_comment}
                      name="comments"
                      onChange={(e) => onTextChange(e, "others_comment")}
                      rows="3"
                      placeholder="Other Comments"
                    />
                     <span id="others_comment_Error" style={{color: "red"}} ></span>
                  </Col>
                </Row>
              </>
            ) : (
              ""
            )}
            
           
            
            <Col sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple outline color="secondary" tag={Link} to={`/QC`} type="reset" className="mr-2">
                  Cancel
                </Button.Ripple>
                <div className="mr-1">
                  {/* disabled={isFilledAll()} // Removed from below button */}
                  <Button.Ripple color="primary" type="button" onClick={(e) => onQCDetails(3)}>
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

export default QualityCheckDetails;
