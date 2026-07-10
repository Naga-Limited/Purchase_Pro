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


let RelotPlanChange = () => {
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
  
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }

  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);


   const getDetails = () => {
    let fdata = {
      id:refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/relot/getRelotDetails", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            WareHouse:data.results[0].WH_NAME,
            plantid:data.results[0].PLANT_NAME,
            RelotStatus:data.results[0].RelotStatus == '1' ? "QC Approval":data.results[0].RelotStatus == '2' ? "Relot Entry": data.results[0].RelotStatus == '3' ? "Relot Approval":data.results[0].RelotStatus == '-1'? "QC Reject":data.results[0].RelotStatus == '5' ? "WH Incharge Reject" : data.results[0].RelotStatus == '6' ? "WH Manager Reject" : "",
          })
          }
          setVehicle_status(data.results[0].RelotStatus)
          setCHANGE_VECHICAL_STATUS(data.results[0].Change_Status)

        }
      )
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
       id:refid,
       OLD_VECHICAL_STATUS:Vehicle_status,
       WHInchargeRemarks:WHInchargeRemarks,
       VECHICAL_STATUS:Vehicle_status == '5' ? '6' : Vehicle_status == '6' ? '7' : '5',
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
          apiPostMethod(apiBaseUrl + "Processcancel/WHPlanChangeRelotting", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            if(Vehicle_status == '6'){
              ShowToast("Approved Successfully...");
              history.push(`/WHPLANCHMAPP`);
              }else if(Vehicle_status == '7'){
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


  const Rejects = (id) => {

    if(WHInchargeRemarks == '' || WHInchargeRemarks == undefined){
      errorToast('Please Enter Remarks ...')
      return false
    }

    let formData = form.values;

    const postdata = {
      id:refid,
      WHInchargeRemarks:WHInchargeRemarks,
      VECHICAL_STATUS:Vehicle_status == '6' ? '5' : CHANGE_VECHICAL_STATUS ,
    }
  
    console.log(postdata);
        let msg="Plan Change"
        confirmDialog({
        title: "Are you sure want to Reject?",
        description: msg,
      }).then((res) => {
        if (res) {
          
          showLoader();
          apiPostMethod(apiBaseUrl + "Processcancel/WHRejectRelotting", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            
            errorToast("Rejected Successfully...");
            if(Vehicle_status == '6'){
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
      <CustomTextInput label={'Ware House Name'} form={form} id='WareHouse'  disabled />
      </Col>
      <Col md="4" sm="12">
      <CustomTextInput label={'Plant Name'} form={form} id='plantid'  disabled />
      </Col>
      <Col md="4" sm="12">
      <CustomTextInput label={'Waiting At'} form={form} id='RelotStatus'  disabled />
      </Col>
      <Col md="4" sm="12">
      <FormGroup>
        <Label for="cityMulti">Remarks</Label>
        <Input type="text" value={WHInchargeRemarks} placeholder="Remarks" onChange={(e) => onTextChange(e, "WHInchargeRemarks")} maxLength="50"/>
      </FormGroup>
      </Col>
    </Row>
    
    <Row>
    {Vehicle_status > 4 &&
    <Col >
      <Button.Ripple color="danger" type="button" onClick={(e) => Rejects()}>
                Reject
      </Button.Ripple>  
    </Col>}
    <Col className="offset-md-6 d-md-flex justify-content-end">
      <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Approve
      </Button.Ripple>  
    </Col>
   </Row>
   
  </Fragment>
  );
};

export default RelotPlanChange;
