import { Button, Row, Col } from "reactstrap";

import React, { useState,Fragment } from "react";
import { useHistory } from "react-router-dom";
import WeeklyPlanListTable from "./common/WeeklyPlanListTable";

import { CardComponent } from "../common/CardComponent";

import { useFormik } from "formik";
import { validation, Yup,CustomDropdownInput } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import {  previewUrl,BASE_URL,apiBaseUrl } from "../../urlConstants";
import { RefreshBlock } from "../common/RefreshBlock";


const STOPODeliveryCreationApproval = ({ isViewOnly, title, returnUrl, status }) => {
  const history = useHistory();
  let [ otherfilter,setFilter] = useState();
 /* const [tableFilter] = useState({
    vehicleStatus: status || "2,3,4,5,6",
  });*/
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });
  let values = form.values;
  let tableFilter = {
    vehicleStatus: status || "2,3,4,5,6",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      WeekNo: values.WeekNo,
      WheatVarietyId: values.WheatVarietyId,
     
    },
  };

  
  const onSubmit = () => {
    console.log(form.values);
   // alert("sf")
    
    setFilter({
      otherfilter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        PlantIdArr: values.PlantId,
       
      },
    });
  };
  
  const actionsCol = (row) => {
      return (
 
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                let url = `/warehouse/stopodeliverycreationapprovaledit/${row.planid}`;
                history.push(url);
              }}
            >
             Action
            </Button.Ripple>

      
      );
   
  };
  const onUpdateStatus = (id) => {
    history.push(`/AP:${id}`);
  };
  const AddNewPlan = () => {
    history.push(`/warehouse/stopodeliverycreationadd`);
  }
  const openAttach = (url) => {
    //window.open(previewUrl + url, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
  };
  return (
    <div>
        <RefreshBlock />
      <CardComponent header="Search Filter">
      <Fragment>
      <Row>
        
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}warehouse/master/getDistWeekNo`}
            isMulti
            label={"Week"}
            form={form}
            id="WeekNo"
          />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}warehouse/master/getWheatVariety`}
            isMulti
            label={"Wheat Variety"}
            form={form}
            id="WheatVarietyId"
          />
        </Col>
       
       
      
        
      </Row>
      
    </Fragment>
      </CardComponent>
      <WeeklyPlanListTable
        hideFilter={true}
        formType={"Approval"}
        postData={tableFilter}
        ScreenName={"Wheat Movement Weekly Plan Approval"}
        actionCell={actionsCol}
        title={"Wheat Movement Weekly Plan Approval"}
        actionColumnWidth={"100px"}
      />
    </div>
  );
};

export default STOPODeliveryCreationApproval;
