import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Col, FormGroup, Row } from 'reactstrap';
import { apiBaseUrl, CourierURL, } from '../../urlConstants';
import { useLoader } from '../../utility/hooks/useLoader';
import { CardComponent } from '../common/CardComponent';
import { HrLine } from '../common/HrLine';
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { CustomTextInput,validation,Yup } from '../forms/custom-form';
import { errorToast, ShowToast } from '../../helper/appHelper';
import CourierList from '../List/CourierList';
const MyForm = ({ onAdd }) => {
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    if(id){
    refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader();
    useEffect(() => {
      if (id) {
        onFetchCourierdetailsById();
      }
    }, [id]);
    const onFetchCourierdetailsById = () => {
      let fdata = {
        id: refid,
      }
      showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/getCourierDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id:data.results[0].id,
            courier_name:data.results[0].courier_name,
          })
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader(); 
      });
    }
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
          courier_name: validation.required({ message:"Enter  Courier Company Name", isObject: false }),
        }),
        onSubmit(values) {},
      });
      const handleAddButtonClick = () => {
       let formData = form.values;
      const postData={
        courier_name:formData.courier_name
      }
      if(postData.courier_name ==""||postData.courier_name==undefined ){
        errorToast('Please Enter Courier Company Name')
          return false
      }
      if(refid ==""){
      console.log(JSON.stringify(postData))
      showLoader();
      apiPostMethod(apiBaseUrl + "CourierMaster/InsertCourierCompany", postData)
      .then((response) => {
        const { data } = response;
        if(data.success == 1) {
          ShowToast("Save Successfully...");
           window.setTimeout( function() {
             window.location.reload();
           }, 2000);
         }
          else if (data.success == "0"){
          errorToast(data.error);
          errorToast("Unable to insert record");
         }
       })
       .catch((error) => {
         errorToast("Something went wrong, please try again after sometime");
       })
       .finally((a) => {
         hideLoader();
       });}
     else if(refid!="0"){
       const FrmData = {
        courier_name:formData.courier_name
      };
    const postdata = {
      Id: formData.Id,
      Data: FrmData,
    };
       showLoader();
       apiPostMethod(apiBaseUrl + "CourierMaster/updateCourierCompany", postdata)
         .then((response) => {
           const { data } = response;
           console.log(JSON.stringify(response))
           let RespId=data.success;
           if(RespId && RespId>=1)
           {
             ShowToast("Saved Successfully...");
              window.setTimeout( function() {
           window.location.reload();
         }, 2000);
             history.push("/COURIER_MASTER");
             
             if(document.getElementById("id").value=="")
             {
               history.push("/master/courier_master:0");
             }
             else
             {
               history.push("/master/courier_master");
             }
           }
           else
           {
             if(data.ErrorMsg)
             {
               errorToast(data.ErrorMsg);
             }
             else
             {
               errorToast("Unable to update record");
             }
           } 
         })
         .finally((a) => {
           hideLoader();
         });
       };
      }
  return (
    <CardComponent header="COURIER MASTER" >
        <Fragment>
            <Row>
                <Col md="4" sm="12">
           <CustomTextInput label={"Courier Company Name"} form={form} id="courier_name" name="courier_name"  type="text"  />
          </Col>
                <Col md="4" sm="12">
                        <br></br>
                 <FormGroup className="d-flex mb-0 justify-content-end">
                   <Button.Ripple color="primary" id="add" type="button" 
                     onClick={handleAddButtonClick}    >
                     Add
                   </Button.Ripple>
                 </FormGroup>
                </Col>   
         </Row>
         <HrLine />    
          <CourierList
        url={CourierURL}
        title={"Courier Master"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                 history.push('/COURIER_MASTER:' + row.id );
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />    
        </Fragment>
      </CardComponent>
  
  ); 
      };
export default MyForm
