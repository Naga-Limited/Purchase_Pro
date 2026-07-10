import { Card, CardBody, FormGroup,Input, Row, Col, Button, Label } from "reactstrap";

import React, { useEffect, useState,Fragment } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast,ShowToast } from "@helpers/appHelper";
import { apiBaseUrl,vsUrl } from "../../urlConstants";
import { useHistory, useParams } from "react-router";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useLoader } from "../../utility/hooks/useLoader";
import { CardComponent } from "../common/CardComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useSelector } from "react-redux";


let ChangeVehicleStatusDetails = () => {
  let history = useHistory();
  let { showLoader, hideLoader } = useLoader();

  const [statusData, setStatusdata] = useState([]);
  const [Vehicle_status, setVehicle_status] = useState('');
  const [CHANGE_VECHICAL_STATUS, setCHANGE_VECHICAL_STATUS] = useState('');
  const [formData, setFormaData] = useState({});
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  let { id,mode } = useParams();
  //alert(id);
  // alert(mode);

  const {
    WHInchargeRemarks,   
  }=formData;

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
  });
  
  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const getDetails = () => {
    let fdata = {
     id,
     formType:mode
     

    };
    showLoader();
    //alert("ok")
    apiPostMethod(vsUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
       // console.log(data.success);
        if (data.success) {
        //  alert(data.results.ZVA_NUMBER);
          form.setValues({
            Id:data.results.PI_REFID,
            VANumber:data.results.ZVA_NUMBER,
            Mode:mode,
            StatusName:data.results.StatusName,
            WHInchargeRemarks,
          });
          setVehicle_status(data.results.VECHICAL_STATUS)
          setCHANGE_VECHICAL_STATUS(data.results.CHANGE_VECHICAL_STATUS)
          setStatusdata([{ options: data.VehStatus }]);
          document.getElementById("VANumber").disabled=true;
          form.setFieldValue("Status", {  label: data.results.StatusName,value: data.results.VECHICAL_STATUS });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  
  const updateData = (data) => {
    setFormaData(data);
  };

  const onTextChange = (e, key) => {
    const newData = {
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    };
    updateData(newData);
  };

  const onSubmit = (id) => {

    if(WHInchargeRemarks == '' || WHInchargeRemarks == undefined){
      errorToast('Please Enter Remarks ...')
      return false
    }

    let formData = form.values;

    const postdata = {
       id:formData.Id,
       Mode:formData.Mode,
       OLD_VECHICAL_STATUS:formData.Status.value,
       WHInchargeRemarks:WHInchargeRemarks,
       VECHICAL_STATUS:Vehicle_status == '32' ? '33' : Vehicle_status == '33' ? '34' : '32',
       PlanRejectedByName:UserDetails.username,
       PlanRejectedBy:UserDetails.USERID,
     }
   
     console.log(postdata);
        let msg="Plan Change"
        confirmDialog({
        title: "Are you sure want to Approve?",
        description: msg,
      }).then((res) => {
        if (res) {
           
          showLoader();
          apiPostMethod(apiBaseUrl + "Processcancel/WHPlanChange", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            if(Vehicle_status == '32'){
              ShowToast("Approved Successfully...");
              history.push(`/WHPLANCHMAPP`);
              }else if(Vehicle_status == '33'){
                ShowToast("Approved Successfully...");
              history.push(`/WHPLANCHACCMAPP`);
              }else{
                ShowToast("Approved Successfully...");
                history.push(`/WHPLANCH`);
              }
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
        }
      })
     }

  const onSubmits = (id) => {

  if(WHInchargeRemarks == '' || WHInchargeRemarks == undefined){
    errorToast('Please Enter Remarks ...')
    return false
  }

  let formData = form.values;

  const postdata = {
      id:formData.Id,
      Mode:formData.Mode,
      OLD_VECHICAL_STATUS:formData.Status.value,
      WHInchargeRemarks:WHInchargeRemarks,
      VECHICAL_STATUS:Vehicle_status == '32' ? '33' : Vehicle_status == '33' ? '34' : '32',
      PlanRejectedByName:UserDetails.username,
      PlanRejectedBy:UserDetails.USERID,
    }
  
    console.log(postdata);
      let msg="Plan Change"
      confirmDialog({
      title: "Are you sure want to Reject?",
      description: msg,
    }).then((res) => {
      if (res) {
          
        showLoader();
        apiPostMethod(apiBaseUrl + "Processcancel/WHPlanChangeEmpty", postdata)
        .then((response) => {
          const { data } = response;
          console.log(JSON.stringify(response))
          
          if(Vehicle_status == '32'){
            ShowToast("Approved Successfully...");
            history.push(`/WHPLANCHMAPP`);
            }else if(Vehicle_status == '33'){
              ShowToast("Approved Successfully...");
            history.push(`/WHPLANCHACCMAPP`);
            }else{
              ShowToast("Approved Successfully...");
              history.push(`/WHPLANCH`);
            }
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
      }
    })
    }
  const Reject = (id) => {

        if(WHInchargeRemarks == '' || WHInchargeRemarks == undefined){
          errorToast('Please Enter Remarks ...')
          return false
        }
    
        let formData = form.values;
    
        const postdata = {
          id:formData.Id,
          Mode:formData.Mode,
          WHInchargeRemarks:WHInchargeRemarks,
          VECHICAL_STATUS:Vehicle_status == '32' ? CHANGE_VECHICAL_STATUS : '32',
        }
      
        console.log(postdata);
            let msg="Plan Change"
            confirmDialog({
            title: "Are you sure want to Reject?",
            description: msg,
          }).then((res) => {
            if (res) {
              
              showLoader();
              apiPostMethod(apiBaseUrl + "Processcancel/WHReject", postdata)
              .then((response) => {
                const { data } = response;
                console.log(JSON.stringify(response))
                
                errorToast("Rejected Successfully...");
                if(Vehicle_status != '32'){
                  history.push(`/WHPLANCHACCMAPP`);
                  }else{
                  history.push(`/WHPLANCHMAPP`);
                  }
              })
              .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
              })
              .finally((a) => {
                hideLoader();
              });
            }
          })
        }
  const Rejects = (id) => {

    if(WHInchargeRemarks == '' || WHInchargeRemarks == undefined){
      errorToast('Please Enter Remarks ...')
      return false
    }

    let formData = form.values;

    const postdata = {
      id:formData.Id,
      Mode:formData.Mode,
      WHInchargeRemarks:WHInchargeRemarks,
      VECHICAL_STATUS:Vehicle_status == '32' ? CHANGE_VECHICAL_STATUS : '32',
    }
  
    console.log(postdata);
        let msg="Plan Change"
        confirmDialog({
        title: "Are you sure want to Reject?",
        description: msg,
      }).then((res) => {
        if (res) {
          
          showLoader();
          apiPostMethod(apiBaseUrl + "Processcancel/WHRejectEmpty", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            
            errorToast("Rejected Successfully...");
            if(Vehicle_status != '32'){
            history.push(`/WHPLANCHACCMAPP`);
            }else{
            history.push(`/WHPLANCHMAPP`);
            }
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
        }
      })
    }
  return (
    <Fragment>
    <Row>
      <Col md="4" sm="12">
        <CustomTextInput label={"VA Number"} form={form} id="VANumber" type="text" dis  />
        <CustomTextInput form={form} id="Id" type="hidden"  />
        <CustomTextInput form={form} id="Mode" type="hidden"  />
      </Col>
      <Col md="4" sm="12">
      <CustomTextInput label={"Waiting at"} form={form} id="StatusName" type="text" disabled  />
      </Col>
      <Col md="4" sm="12">
      <FormGroup>
        <Label for="cityMulti">Remarks</Label>
        <Input type="text" value={WHInchargeRemarks} placeholder="Remarks" onChange={(e) => onTextChange(e, "WHInchargeRemarks")} maxLength="50"/>
      </FormGroup>
      </Col>
    </Row>
    
    <Row>
    {mode == 'SDO_SDI' && (Vehicle_status == '32' || Vehicle_status == '33') &&
    <Col >
      <Button.Ripple color="danger" type="button" onClick={(e) => Reject()}>
                Reject
      </Button.Ripple>  
    </Col>}
    { mode != 'SDO_SDI' && (Vehicle_status == '32' || Vehicle_status == '33') &&
    <Col >
      <Button.Ripple color="danger" type="button" onClick={(e) => Rejects()}>
                Reject
      </Button.Ripple>  
    </Col>}
    {mode == 'SDO_SDI' &&  
    <Col className="offset-md-6 d-md-flex justify-content-end">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Approve
      </Button.Ripple>  
    </Col>}
    {mode != 'SDO_SDI' && 
    <Col className="offset-md-6 d-md-flex justify-content-end">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmits()}>
                Approve
      </Button.Ripple>  
    </Col>}
   </Row>
   
  </Fragment>
  );
};

export default ChangeVehicleStatusDetails;
