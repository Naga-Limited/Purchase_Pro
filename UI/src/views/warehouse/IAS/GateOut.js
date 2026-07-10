import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { useSelector } from "react-redux";

import { Card, CardBody, CardHeader, CardTitle } from "reactstrap";
import { Button, Row, Col  } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { BASE_URL } from "../../../urlConstants";

import { apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { statusCode } from "../../../helper/appHelper";
import { ShowToast } from "../common/appHelper";

const GateOut = () => {
    const history = useHistory();
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
       // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
      });

    let { id } = useParams();
    let refid = '';
    if (id && id != ":0") {
        refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader();
    useEffect(() => {
        if (id && id != ":0") {
            STMDeliveryNoFetch()
            LoadGateOutInfo();
        }
    }, [id]);
    const STMDeliveryNoFetch = () => {
        apiPostMethod(apiBaseUrl + `Sap/SiloToMillController/STMDeliveryNoFetch/${'EVADP'}`)
          .then((response) => {
            const { data } = response;
            if (data.success) {
            }
          })  
    };
    const LoadGateOutInfo = () => {
        let fdata = {
          VehicleArrivalId: refid,
        };
        showLoader();
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/getGateOutInfo', fdata)
          .then((response) => {
            const { data } = response;
            console.log("Data : ", data);

            console.log("SKIP FLAG :", data.results[0].ias_DeliveryNo_Bypass_Flag);

            if (data.success) {
                
              form.setValues({
                VANumber:data.results[0].ZVA_NUMBER,
                TruckNumber:data.results[0].TruckNo,
                PONumber:data.results[0].PO_Number,
                POLineItem:data.results[0].PoLineItem,
                SendingPlant:data.results[0].SendingPlant,
                SendingStorageLocation:data.results[0].SendingStorageLocation,
                ReceivingPlant:data.results[0].ReceivingPlant,
                ReceivivngStorageLocation:data.results[0].ReceivingStorageLocation,
                EmptyWeight:data.results[0].WbEmptyWt,
                loadedWeight:data.results[0].WbLoadWt,
                NetWeight:data.results[0].WbNetWt,
                GunnyWeight:data.results[0].GunnyWt,
                GunnylessWeight:data.results[0].GunnyLessNetWt,
                DeliveryNo:data.results[0].DeliveryNo,
                DeliveryStatus:data.results[0].DeliveryStatus,
                EWayBillNo:data.results[0].EwayBillNo,
                SKIPFLAG:data.results[0].ias_DeliveryNo_Bypass_Flag,
              })
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      };

    const UpdateGateStatus =(e,type)=>{
        let fdata ="";
        if (type == "GO"){
            console.log("GATE OUT STATUS"); //gate out status set into 15 INTRANSIT

            if (form.values.SKIPFLAG === "NO") {
                if (form.values.DeliveryNo === "") {
                    errorToast("Delivery No & E-Way Bill No Mandatory !!!");
                    return;
                }
                if (form.values.EWayBillNo === "") {
                    errorToast("Delivery No & E-Way Bill No Mandatory !!!");
                    return;
                }
            }

            fdata={
                EVA_ID:refid,
                Status:statusCode.INTRANSIT,
                RejectReason:"",
            }
        }else if (type == "R"){ //Status move Back to Previous Status 13 Loading Update Lot
            console.log("GATE OUT Reject", form.values.RejectReason);

            if(!form.values.RejectReason || form.values.RejectReason.trim() === ""){
                errorToast("Reason Mandatory for Reject !!!" );
                return;
            }

            fdata={
                EVA_ID:refid,
                Status:statusCode.LOADING,
                RejectReason:form.values.RejectReason,
            }

        }

        showLoader();
        apiPostMethod(apiBaseUrl + 'warehouse/IASSending/saveGateOutInfo', fdata)
          .then((response) => {
            const { data } = response;
            console.log("Data : ", data);
            if (data.success) {
                ShowToast("Updated Successfully !!!")
                setTimeout(() => history.push(`/Loading/GateIn`), 2000);
            }else{
                errorToast("Updated Failed !!!")
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
    }


    

    return (
        <div>
            <RefreshBlock />
            <Card>
                <CardHeader>
                    <CardTitle>{"Unloading WH Incharge - Gate Out"}</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"VA No"} form={form} id="VANumber" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Truck No"} form={form} id="TruckNumber" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"PO Number"} form={form} id="PONumber" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"PO Line Item"} form={form} id="POLineItem" type="text" disabled/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Sending Plant"} form={form} id="SendingPlant" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Sending Storage Location"} form={form} id="SendingStorageLocation" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Receiving Plant"} form={form} id="ReceivingPlant" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Receiving Storage Location"} form={form} id="ReceivivngStorageLocation" type="text" disabled/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Empty Weight"} form={form} id="EmptyWeight" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"loaded Weight"} form={form} id="loadedWeight" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Net Weight"} form={form} id="NetWeight" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Gunny Weight"} form={form} id="GunnyWeight" type="text" disabled/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Gunnyless Weight"} form={form} id="GunnylessWeight" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Delivery No"} form={form} id="DeliveryNo" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Delivery Status"} form={form} id="DeliveryStatus" type="text" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"EWay Bill No"} form={form} id="EWayBillNo" type="text" disabled/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="7" sm="12">
                        <CustomTextInput label={''} form={form} id="SKIPFLAG" type="hidden" disabled/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Reject Reason"} form={form} id="RejectReason" type="text"/>
                        </Col>
                        <Col md="1" sm="12">
                            <Button.Ripple color="primary" type="button" onClick={(e)=>UpdateGateStatus(e,"R")}>Reject</Button.Ripple>
                        </Col>
                        <Col md="1" sm="12">
                        <Button.Ripple color="primary" type="button" onClick={(e)=>UpdateGateStatus(e,"GO")} >Submit</Button.Ripple>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    )
};
export default GateOut;