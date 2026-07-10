import { Card, Table, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { qcTestUrl, uploadUrl, qcUrl, getWheatMasterUrl,SaveCaptureImage } from "../../urlConstants";
import { QCConstant, QCFConstant_IAS } from "./constant";
import QualityCheckForm, { getQcFormPostData, surveyorDeviceType, validateQualityForm } from "./QualityCheckForm";
import { InputControl } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
//import htmlComponent from "http://localhost/pp/api/CaptureImage.html";
import WebCam from "react-webcam";

const statusOptions = [
  {
    options: [
      { value: "A", label: "A-Accepted" },
      { value: "R", label: "R-Rejected" },
    /*  { value: "AD", label: "AD - Accepted with Deduction" },*/
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

const IASQualityCheckDetails = () => {
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { id } = useParams();
  let refid = id.replace(":", "");

  const [poData, setPoData] = useState({ ...QCConstant });
  const [formData, setFormaData] = useState({ ...QCFConstant_IAS });
  const [qcFormData, setqcFormData] = useState([]);
  const [attachedFiles, setAttachment] = useState({ qcwrkdoc: {} });
  const [wheatVarityOptions, setWheatVarityOptions] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState();
  const [showModal, setShowModal] = useState(false);
  const [Readonly, setReadonly] = useState(false);

  const handleShowModal =()=>{
    console.log(showModal);
    setShowModal(true);
    console.log(showModal);
  }

  const onTextChange = (e, key) => {
    setFormaData({
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    });
  };
  const onQCDetails = () => {

    if(isFilledAll()){
      return false;
    }
    let fields = getQcFormPostData(qcFormData);

    if(qcFormData.length == 0) {
      errorToast("Fill the Quality check Details..!");
      return false;
    }
    
    const { qcdeviceType,  Remarks } = formData;
    const { SCREEN_TYPE, VEHICLE_TYPE, ZPO_NUMBER,VECHICAL_STATUS,imageSrc,ZVA_NUMBER } = poData;
    let fdata = {
      ...fields,
      ias_Remarks: Remarks,
    
      purchase_info_id: refid, 
      formType: "IASQC",
      VEHICLE_TYPE: VEHICLE_TYPE,
      VECHICAL_STATUS
    };
   
     console.log(JSON.stringify(fdata));
    // return false;
      showLoader();
      apiPostMethod(qcUrl, fdata)
    .then((response) => {
      if (response.data.success) {
        history.push(`/QC`);
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
    if (!poData.ZVA_NUMBER) {
      onFetchPodetailsById();
      fetchWheatVariety();
    }
   
  }, [poData]);

  const onFetchPodetailsById = () => {
    let fdata = {
      id: refid,
      formType: "PO_IAS",
    };
    apiPostMethod(qcUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPoData({ ...poData, ...data.results[0] });
         
          setqcFormData(data.qmResults);
          //setSelectedDeviceType({label:"NIR - YES",value:"nir_yes"});
          setSelectedDeviceType({label:"NIR - FOSS",value:"nir_foss"});
          setFormaData({
            ...formData,
            qcdeviceType:"nir_foss",
            Remarks:data.IASQCUpdatedDetails[0] && data.IASQCUpdatedDetails[0].ias_Remarks ? data.IASQCUpdatedDetails[0].ias_Remarks : "",
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
    onFetchQCTest(e.value);
    setReadonly(false);
    onTextChange(e, "qcdeviceType");
  };

  const onFetchQCTest = (val) => {
    let fdata = {
      wvcode: poData.IDNLF,
      qctest: val,
      formType:'IAS',
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
    
    //showError("Moisture_Error","Invalid WB Name ",0);
    //showError("HL_Error","Fill the Quality check Details..! ",0);
    //showError("InsertDamageWheat_Error","Invalid WB Name ",0);
    //showError("Remarks_Error","Invalid WB Name ",0);
   
    showError("qctestvalue_Error","Fill the Quality check Details..! ",0);
   
    
    const qctestvalue = validateQualityForm(qcFormData);
    if (qctestvalue.length) {
      
      showError("qctestvalue_Error","Fill the Quality check Details..! ",1);
      return true;
    }
    let fmdata = { ...formData };
   
 
    
   // if(!formData.Moisture) { showError("Moisture_Error","Enter Moisture ",1); }
   // if(!formData.HL) { showError("HL_Error","Enter HL",1); }
   
   // if(!formData.InsertDamageWheat) { showError("InsertDamageWheat_Error","Enter InsertDamageWheat",1); }
  //  if(!formData.Remarks) { showError("Remarks_Error","Enter Remarks",1); }
  delete fmdata.Remarks;
    console.log(JSON.stringify(formData));

    const fmValues = Object.values(fmdata);
    console.log(JSON.stringify(fmValues));
    return !fmValues.every((x) => x !== null && x !== "");
  };

  const videoContraints ={
    width:1280,height:720,facingMode:"user"
  }
  const webcamRef=React.useRef(null);

  const captureImage=(()=>{
    const imageSrc=webcamRef.current.getScreenshot();

    setPoData({ ...poData, imageSrc });
  },[webcamRef]);

  /*const capture = React.userCallback(
()=>{
const imageSrc=webcamRef.current.getScreenshot();
},
[webcamRef]
  );*/

  const { qcwrkdoc } = attachedFiles;
  const { ZPO_NUMBER, TRUCK_NO, DRIVER_NO, ZVA_NUMBER,WERKS,IDNLF,WheatSegment } = poData;
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
                  <Label for="nameMulti">VA Number</Label>
                  <Input type="text" value={ZVA_NUMBER} placeholder="PO Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Vehicle Number</Label>
                  <Input type="text" maxlength={10} value={TRUCK_NO} placeholder="Vehicle Number" disabled />
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
                  <Label for="Plant">Plant</Label>
                  <Input type="text" value={WERKS} placeholder="Wheat Variety" disabled />
               
                </FormGroup>
              </Col>
            <Col md="4" sm="12">
                <FormGroup>
                  <Label for="Plant">Segment</Label>
                  <Input type="text" value={WheatSegment} placeholder="Segment" disabled />
               
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="Plant">Wheat Variety</Label>
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
                          <th  style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}}  className="custom-width">Category</th>
                          <th  style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff",zIndex:1}} >Quality</th>
                          <th  style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}} >Min</th>
                          <th style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}} >Max</th>
                          <th  style={{position: "sticky",top: "0px",backgroundColor:"#7367f0",color:"#fff"}} >Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <QualityCheckForm Readonly={Readonly} qcFormData={qcFormData} setqcFormData={setqcFormData} />
                      </tbody>
                    {/* </Table>*/}
                    </table>
                   </div>
                  </Col>
                  <Col  md="4" sm="12">
                    <InputControl
                      label={"Comments"}
                      type="textarea"
                      value={formData.Remarks}
                      name="Remarks"
                      onChange={(e) => onTextChange(e, "Remarks")}
                      rows="2"
                      placeholder="Remarks"
                    />
                     <span id="Remarks_Error" style={{color: "red"}} ></span>
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
                {poData.VECHICAL_STATUS==2 && <div className="mr-1">
                  {/* disabled={isFilledAll()} // Removed from below button */}
                  <Button.Ripple color="primary" type="button" onClick={(e) => onQCDetails(3)}>
                    Submit
                  </Button.Ripple>
                </div>}
              </FormGroup>
            </Col>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default IASQualityCheckDetails;
