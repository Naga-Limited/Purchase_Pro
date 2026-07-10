import { Button, Row, Col } from "reactstrap";

import React, { useState,Fragment } from "react";
import { useHistory } from "react-router-dom";
import SublotListTable from "./common/SublotListTable";

import { CardComponent } from "../common/CardComponent";

import { useFormik } from "formik";
import { validation, Yup,CustomDropdownInput } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import {  previewUrl,BASE_URL,apiBaseUrl } from "../../urlConstants";
import { RefreshBlock } from "../common/RefreshBlock";


const WHLotCapacity = ({ isViewOnly, title, returnUrl, status }) => {
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
      PlantIdArr: values.PlantId,
     
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
  

  const onUpdateStatus = (id) => {
    history.push(`/AP:${id}`);
  };
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
        
        <Col md="3" sm="12" >
          <CustomDropdownInput
            url={`${apiBaseUrl}warehouse/master/getPlants`}
            isMulti
            label={"Plant"}
            form={form}
            id="PlantId"
          />
        </Col>
       
      </Row>
      
    </Fragment>
      </CardComponent>
      <SublotListTable
        hideFilter={true}
        postData={tableFilter}
        ScreenName={"Warehouse Lot Capacity Master"}
        //actionCell={}
        title={"Warehouse Lot Capacity Master"}
        actitionColumnWidth={"100px"}
      />
    </div>
  );
};

export default WHLotCapacity;
