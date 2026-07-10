import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
////import Master_ngw_bankentryForm from "./Master_ngw_bankentryForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_banklist from "./list/Master_ngw_banklist";
import { WHMaster_ListUrl } from "../../../urlConstants";
import { DatePicker } from "../../forms/custom-datetime";
const RelottingEntryForm = ({ form, onSubmit }) => {
  
  const handleViewHistory = (data) => {

  }

  return (
    <Fragment>
      <Row>
        <Col md="3" sm="12">
          {/* <DatePicker form={form} id="date" isDateRange label={"Date Range"} /> */}
          {/* <DatePicker form={form} id="date2" label={"Date"} /> */}
          {/* <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Date"} form={form} id="wh_refid" /> */}
          <DatePicker form={form} id="date" label={"Date"} />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Wheat Variety"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
         <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Material Code"} form={form} id="wh_refid" />
        </Col>
      </Row>
      <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"From Warehouse Name"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"From Lot"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"From Plant"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"From Storage Location"} form={form} id="wh_refid" />
        </Col>
        </Row>
      <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"To Warehouse Name"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"To Lot"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"To Plant"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"To Storage Location"} form={form} id="wh_refid" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Bag Type"} form={form} id="wh_refid" />
        </Col>
         <Col md="3" sm="12">
         <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"No of Bags"} form={form} id="wh_refid" />
         </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"From Lot Qty in MTS"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"To Lot Qty in MTS"} form={form} id="wh_refid" />
        </Col>
        </Row>
      <Row>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Relotting Vendor"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Relotting Charges"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Relotting Reason"} form={form} id="wh_refid" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
      {/* <CustomTextInput label={"Weighment Slip"} form={form} id="weighmentslip" type="text" />
     <CustomUploader isReadOnly={isViewOnly || isEdit} form={formik} label={"Weighment Slip"} id={"weighmentslip"} />
     <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"weighmentslip1"} /> */}
        <CustomDropdownInput url={`${apiBaseUrl}marketdata/master/getwarehouses`} label={"Warehouse Name"} form={form} id="wh_refid" />
        </Col>
        </Row>
        <Row>
        <Col md="3" sm="12">
         <Button.Ripple outline type="Button" className="mr-2 mt-2" onClick={(e) => handleViewHistory(e)}>
          View History
          </Button.Ripple>
        </Col>
        <Col md="3" sm="12">
      <CancelSubmitButtons
        form={form}
        onCancel={() => {
          form.resetForm();
          onSubmit();
        }}
        onSubmit={onSubmit}
        cancelText={"Clear"}
      />
        </Col>
        </Row>
    </Fragment>
  );
};

const RelottingData = () => {
  return (
    <Fragment>
      <CardComponent header="Relotting Entry">
        <RelottingEntryForm form="Data" />
      </CardComponent>
    </Fragment>
  ); 
};


export default RelottingData;