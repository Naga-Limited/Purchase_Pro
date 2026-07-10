import { Card, Table, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { qcTestUrl, uploadUrl, qcUrl,tblSTMUrl, getWheatMasterUrl,BASE_URL,SaveCaptureImage, apiBaseUrl } from "../../urlConstants";
import { QCConstant, QCFConstant } from "./constant";
import QualityCheckForm, { getQcFormPostData, surveyorDeviceType, validateQualityForm } from "./QualityCheckForm";
import { InputControl } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import CaptureImage from "../CaptureImage";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { ShowToast } from "../../helper/appHelper";
import { useSelector } from "react-redux";
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

const STM_GateoutDetails = () => {
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { id } = useParams();
  let refid = id.replace(":", "");

  const [poData, setPoData] = useState({ ...QCConstant });
  const [formData, setFormaData] = useState({ ...QCFConstant });
  const [qcFormData, setqcFormData] = useState([]);
  const [attachedFiles, setAttachment] = useState({ Ewaybillcopy: {} });
  const [wheatVarityOptions, setWheatVarityOptions] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState();
  const [ImgData, setImgData] = useState({});
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));


  const onTextChange = (e, key) => {
    setPoData({
      ...poData,
      [key]: e.target ? e.target.value : e.value,
      "NetWeight":(poData.SecondWeight > 0 ? poData.SecondWeight : 0)-(poData.FirstWeight > 0 ? poData.FirstWeight: 0),
    });
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
  const fileUploadActionWB = () => {
    document.getElementById("Ewaybillcopy").click();
  };


  const onQCDetails = (id) => {

   /* if(isFilledAll()){
      return false;
    }*/
    let VehStatus="";
    
   
      VehStatus=id;
   
    let fdata = {
      ...poData,
      
     
      formType: "STMGATEOUT",
      status:VehStatus,
      
    };
  const { SCREEN_TYPE, VEHICLE_TYPE, ZPO_NUMBER,VECHICAL_STATUS,VANumber} = poData;
  let postdata = new FormData();
  console.log(JSON.stringify(fdata));

  console.log(poData.stm_DeliveryNO_ByPass_Flag);

  if(poData.stm_DeliveryNO_ByPass_Flag == 'NO'){
  if (poData.EwayBillNo == '' || poData.EwayBillNo == undefined) {
        errorToast("Please Check Eway Bill..! ",);
        return false;
  }else if(poData.DeliveryNo == '' || poData.DeliveryNo == undefined) {
        errorToast("Please Check Delivery No..! ",);
        return false;
  }
  }
  // if((formData.invoice_qty == ''|| formData.invoice_qty == '0')&&(formData.invoice_qtys == '' || formData.invoice_qtys == '0' || formData.invoice_qtys == undefined)){
  //   errorToast('Please Enter Invoice Qty ...')
  //   return false
  // }
  // let FileSaveUrl="";
  // postdata.append("form_name", SCREEN_TYPE);
  // postdata.append("ponumber", ZPO_NUMBER);
  // postdata.append("VA_Number", VANumber);
  // postdata.append("SubFolder", "GateOut");
  // if(ImgData.Ewaybillcopy_Img){
  //   FileSaveUrl=SaveCaptureImage;
  //   postdata.append("image[]", ImgData.Ewaybillcopy_Img);
  // }else{
  //   Object.keys(attachedFiles).forEach((key) => {
  //     postdata.append("file[]", attachedFiles[key]);
    
  //   });
  //   FileSaveUrl=uploadUrl;
  // }
  
  // const isAttachedVal = attachedFiles.Ewaybillcopy && attachedFiles.Ewaybillcopy.name && attachedFiles.Ewaybillcopy.name.length ? true : false;
  //   if (!isAttachedVal) {
  //     showError("Ewaybillcopy_Error","Eway Bill Not Cpatured/Uploaded..! ",1);
  //     return false;
  //   }
  //   showLoader();
    // apiPostMethod(FileSaveUrl, postdata, "File")
    // .then((response) => {
    //   const { data } = response;
    //   if (data.success) {
    //     fdata.Ewaybillcopy = data.files[0] ? data.files[0].updname : "";
        apiPostMethod(qcUrl, fdata)
        .then((response) => {
          if (response.data.success) {
            window.open(BASE_URL+"/#/STMSlip:"+poData.ID, "", "width=900,height=650")
            history.push(`/Loading/GateIn`);
          }
        })
    //     .catch((error) => {
    //       errorToast("Something went wrong, please try again after sometime");
    //     });
    //   } else {
    //     errorToast(data.files[0].orgname + " file format is not supported ");
    //   }
    // })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });

        
         
    
  };

  useEffect(() => {
  if(!poData.VANumber){
      STMDeliveryNoFetch()
      onFetchPodetailsById();
      fetchWheatVariety();
  }
   
  }, [poData]);

  const STMDeliveryNoFetch = () => {
    apiPostMethod(apiBaseUrl + `Sap/SiloToMillController/STMDeliveryNoFetch/${'SILOTOMILL'}`)
      .then((response) => {
        const { data } = response;
        if (data.success) {
        }
      })  
  };
  
  const onFetchPodetailsById = () => {
    let fdata = {
      ID: refid,
      formType: "QCDET",
      plantIds:[],
      startCount:0
    };
    apiPostMethod(tblSTMUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPoData({ ...poData, 
            ID:data.results[0].ID,
            VANumber:data.results[0].ZVA_NUMBER,
            DRIVER_NO:data.results[0].DRIVER_NO,
            TRUCK_NO:data.results[0].TRUCK_NO,
            VEHICLE_STATUS:data.results[0].VEHICLE_STATUS,
            Remarks:data.results[0].stm_QCRemarks,
            SCREEN_TYPE:data.results[0].SCREEN_TYPE,
            
           
            Plant:data.results[0].PLANT_NAME,
            IDNLF:data.DispDetRecords[0].WheatVariety,
            BulkSiloNumber:data.DispDetRecords[0].BulkSiloNo,
            StorageLocation:data.DispDetRecords[0].StorageLocation,
            DeliveryNo:data.DispDetRecords[0].DeliveryNo,
            EwayBillNo:data.DispDetRecords[0].EwayBillNo,
            SAPDeliveryStatus:data.DispDetRecords[0].SAPDeliveryStatus,
            stm_DeliveryNO_ByPass_Flag:data.pp_setting[0].stm_DeliveryNO_ByPass_Flag,
            Moisture :data.QCData[0] ? data.QCData[0].Moisture:"",

HLWeight :data.QCData[0] ? data.QCData[0].HLWeight:"",
FM :data.QCData[0] ? data.QCData[0].FM:"",
Dust :data.QCData[0] ? data.QCData[0].Dust:"",
BadSmell :data.QCData[0] ? data.QCData[0].BadSmell:"",
Infestation :data.QCData[0] ? data.QCData[0].Infestation:"",
SeiveSize :data.QCData[0] ? data.QCData[0].SeiveSize :"",
Wetgluten :data.QCData[0] ? data.QCData[0].Wetgluten:"",
Drygluten :data.QCData[0] ? data.QCData[0].Drygluten:"",
Protein :data.QCData[0] ? data.QCData[0].Protein:"",

FirstWeight :data.WeightDetails[0] ? data.WeightDetails[0].FirstWeight:"",
SecondWeight :data.WeightDetails[0] ? data.WeightDetails[0].SecondWeight:"",
NetWeight :data.WeightDetails[0] ? data.WeightDetails[0].NetWeight: "",
WeightDisplay:data.WeightDetails[0] ? true: false,

          
          });
          
        }
      })
      .catch((error) => {
        console.log(error);
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

  const onSubmit = () => {

    if (poData.RejectionStatus == '' || poData.RejectionStatus == undefined) {
      errorToast("Please Enter Reject Reason..! ",);
      return false;
    }
       const postdata = {
        id:ID,
        VEHICLE_STATUS:13,
        STMRejectedByName:UserDetails.username,
        STMRejectedBy:UserDetails.USERID,
        RejectionStatus
      }
      
       let msg="Silo To Mill Gate Out"
       confirmDialog({
        title: "Are you sure want to Reject?",
        description: msg,
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "Stmiascontrolpanel/STMGateOutReject", postdata)
         .then((response) => {
           const { data } = response;
           console.log(JSON.stringify(response))
           
           ShowToast("Reject Successfully...");
           history.push(`/Loading/GateIn`);
         })
         .catch((error) => {
           console.log(JSON.stringify(error))
           errorToast("Something went wrong, please try again after sometime");
         })
         .finally((a) => {
           hideLoader();
         });
        }
      }); 
     }

  const { Ewaybillcopy } = attachedFiles;
  const { ZPO_NUMBER,Remarks,FirstWeight,WeightDisplay,NetWeight,SecondWeight,StorageLocation,VEHICLE_STATUS, TRUCK_NO, DRIVER_NO, IDNLF, ZVA_NUMBER,VANumber,Plant,BulkSiloNumber,Moisture,HLWeight,FM,Dust,BadSmell,Infestation,SeiveSize,Wetgluten,Drygluten,Protein,EwayBillNo,DeliveryNo,SAPDeliveryStatus,stm_DeliveryNO_ByPass_Flag,ID,RejectionStatus } = poData;
  const { degrade } = formData;
  return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Gate out : {ZVA_NUMBER}
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
                  <Label for="lastNameMulti">Vehicle Number</Label>
                  <Input type="text" value={TRUCK_NO} maxlength={10} placeholder="Vehicle Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Va Number</Label>
                  <Input type="text" value={VANumber} placeholder="PO Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Plant</Label>
                  <Input type="text" value={Plant} placeholder="Plant" disabled />
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
                  <Label for="cityMulti">Storage Location</Label>
                  <Input type="text" value={StorageLocation} placeholder="Driver Number" disabled />
                </FormGroup>
              </Col>
              
              {/* <Col md="4" sm="12">
              <>
                <Label for="nameMulti">Eway bill copy</Label>
                <br />
                      <input
                        type="file"
                        className="form-control"
                        id="Ewaybillcopy"
                        hidden
                        name="upload_file"
                        accept=".pdf, image/*"
                        onChange={(e) => {
                          handleFileChangeWB(e);
                        }}
                        
                      />
                     

                      <span id="Ewaybillcopy_Error" style={{color: "red"}} ></span>
                     
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
                       <div className="align-middle ml-25">{Ewaybillcopy.name}</div>
                     
                      <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"Ewaybillcopy_Img"} />
                       </>
              </Col> */}
 
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Empty Weight</Label>
                  <Input type="text" value={FirstWeight} 
                  disabled={WeightDisplay}
                   onChange={(e) => onTextChange(e, "FirstWeight")}
                  placeholder="Empty Weight"  />
                </FormGroup>
              </Col>
 
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Load Weight</Label>
                  <Input type="text" value={SecondWeight}
                   disabled={WeightDisplay}
                   onChange={(e) => onTextChange(e, "SecondWeight")}
                  placeholder="Load Weight"  />
                </FormGroup>
              </Col>
 
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Net Weight</Label>
                  <Input type="text" value={NetWeight} 
                  onChange={(e) => onTextChange(e, "NetWeight")}
                  placeholder="Net Weight" disabled  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Eway Bill No</Label>
                  <Input type="text" value={EwayBillNo || '-'} placeholder="Eway Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Delivery No</Label>
                  <Input type="text" value={DeliveryNo || '-'} placeholder="Delivery Number" disabled />
                </FormGroup>
              </Col>
              <Col md="8" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Delivery Status</Label>
                  <Input type="text" value={SAPDeliveryStatus || '-'} placeholder="Delivery Status" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Reject Reason</Label>
                  <Input type="text" value={RejectionStatus} placeholder="Reject Reason" onChange={(e) => onTextChange(e, "RejectionStatus")}/>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-3">
            <Col>
                 <div className="mr-1">
                      <Button.Ripple color="danger" type="button" 
                      // disabled={isFilledAll()} 
                      // onClick={(e) => WrongWBApprovalReject(PI_REFID)}
                      onClick={(e) => onSubmit()}
                      >
                        Reject
                      </Button.Ripple>
                 </div>
            </Col>
            <Col className="offset-md-6 d-md-flex justify-content-end">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple outline color="secondary" tag={Link} to={`/Loading/GateIn`} type="reset" className="mr-2">
                  Cancel
                </Button.Ripple>
                {VEHICLE_STATUS==5 && <div className="mr-1">
                  {/* disabled={isFilledAll()} // Removed from below button */}
                  <Button.Ripple color="primary" type="button" onClick={(e) => onQCDetails(15)}>
                   Gate Out
                  </Button.Ripple>
                </div>}

              
              </FormGroup>
            </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default STM_GateoutDetails;
