import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "./forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, evaUrl, BASE_URL } from "../urlConstants";
import { useLoader } from "../utility/hooks/useLoader";
import { addOption } from "./common/Utils";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "./forms/custom-button";
import { CardComponent } from "./common/CardComponent";
import moment from "moment";
////import SlipForm from "./SlipForm";
import { Row, Col, Button, Container } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "./forms/custom-form";

import { eadUrl } from "../urlConstants";
import { Printer } from "react-feather";
import SmartFormHeader from "./smartFormHeader";
import styled from "styled-components";



const SlipForm = ({ form, onSubmit }) => {

  const Container = styled.div`
  @media print {        
      display: none;        
  }`;

  const Container1 = styled.div`
  @media print {        
      margin-bottom: 300px;
  }`;

  const history = useHistory();
  let { id } = useParams();
  const [isReceivingGateOut, setIsReceivingGateOut] = useState(false);
  const [imageDataFirst, setimageDataFirst] = useState([])
  const [imageDataSecond, setimageDataSecond] = useState([])
  const [Address, setAddress] = useState([])

  const [isTruck, setIsTruck] = useState(0);
  let refid = '';

  if (id) {
    refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (id) {
      onFetchSDIdetailsById();
    }
  }, [id]);

  const onFetchSDIdetailsById = () => {

    let fdata = {
      ID: refid,
      plantIds: [],
      SCREEN_TYPE: "EVADP",
      startCount: 0,
      formType: "SLIPGENERATION"
    };
    // showLoader();
    //alert("ok")
    const fdata1 = { ID: refid}
    apiPostMethod(`${apiBaseUrl}Master/Image_Data_Get`, fdata1)
      .then((response) => {
        const { data } = response;
        setimageDataFirst(response.data.image_first)
        setimageDataSecond(response.data.image_second)
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        //console.log(JSON.stringify(response));
        let plant_id
        if(data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].IsTruck==1){
          plant_id = data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].SendingPlant : "";
        }else{
          plant_id = data.PickSlipDetails[0] ? data.PickSlipDetails[0].SendingPlantName:""
        }

        console.log("Result : ", data);
        let ReceivingGateOutInfo =(data.intrastate_gateout_info && data.intrastate_gateout_info.length > 0);
        setIsReceivingGateOut(ReceivingGateOutInfo);
        setIsTruck(data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].IsTruck:0);
        if (data.success) {
          let diffrenceweight = (ReceivingGateOutInfo && data.intrastate_gateout_info[0].GunnyLessNetWt ? parseFloat(data.intrastate_gateout_info[0].GunnyLessNetWt) : 0) - (data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt ? parseFloat(data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt) : 0);
          //diffrenceweight = data.intrastate_gateout_info[0].GunnyLessNetWt +"-"+ data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt;
          let receivingbagLot1 = "";
          receivingbagLot1=
          data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].BagType ? data.intra_state_warehouse_dispatch_info[0].BagType+" ("+data.intra_state_warehouse_dispatch_info[0].L1_NoofBags+")" : "";
          /*data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType2 ? " "+data.intra_state_warehouse_dispatch_info[0].L1_BagType2 + " ("+data.intra_state_warehouse_dispatch_info[0].L1_NoofBags2+")": ""+
          data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType3 ? " "+data.intra_state_warehouse_dispatch_info[0].L1_BagType3 +" ("+data.intra_state_warehouse_dispatch_info[0].L1_NoofBags3 +")": "";*/

          let receivingbagLot2 = "";
          receivingbagLot2=
           data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType2 ? " "+data.intra_state_warehouse_dispatch_info[0].L1_BagType2 +" ("+data.intra_state_warehouse_dispatch_info[0].L1_NoofBags2+")" : "";
           /*data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L2_BagType2 ? " " +data.intra_state_warehouse_dispatch_info[0].L2_BagType2 + " ("+data.intra_state_warehouse_dispatch_info[0].L2_NoofBags2+")": ""+
           data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L2_BagType3 ? " "+data.intra_state_warehouse_dispatch_info[0].L2_BagType3 +" ("+data.intra_state_warehouse_dispatch_info[0].L2_NoofBags3+")": "";*/
           
           let receivingbagLot3 = "";
           receivingbagLot3=
           data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType3 ? " "+data.intra_state_warehouse_dispatch_info[0].L1_BagType3 +" ("+data.intra_state_warehouse_dispatch_info[0].L1_NoofBags3+")": "";
           /*data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L3_BagType2 ? " "+data.intra_state_warehouse_dispatch_info[0].L3_BagType2 + " ("+data.intra_state_warehouse_dispatch_info[0].L3_NoofBags2+")" : ""+
           data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L3_BagType3? " "+data.intra_state_warehouse_dispatch_info[0].L3_BagType3+ " ("+data.intra_state_warehouse_dispatch_info[0].L3_NoofBags3+")": "";*/
            
            if(ReceivingGateOutInfo && data.intrastate_gateout_info[0].VehicleStatus==24)//Mohan Added on 07-09-2022 receiving out time should not show when in secound wt status
            {
              data.intrastate_gateout_info[0].ModDt="";
            }

            //Mohan Added 08-09-2022
            if(data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].IsTruck==1)
            {
          form.setValues({
            ZVA_NUMBER: data.results[0].ZVA_NUMBER,
            TRUCK_NO: data.results[0].TRUCK_NO,
            TRAILER_NO: data.results[0].TRAILER_NO,

            GateInDateTime: data.results[0].GateInDateTime, // Enpty Vehicle Arrival Record Insert Data & Time
            //GateOutDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].DateModified:"", //Intrastate Gateout Record DateModified
            GateOutDateTime:data.results[0].GateOutDateTime,
            RGateInDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].InsDt:"",
            RGateOutDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].ModDt:"",


            SGateOutDateTime: data.results[0].GATE_OUT_TM,
            
            PickslipDateTime: data.results[0].PickslipDateTime,
            VADate: data.results[0].VADate,
            CONTAINER_NO: data.results[0].CONTAINER_NO,
            SendingPlantName: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].SendingPlant : "",
            StoPoNo: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].PO_Number : "",


            Segment1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Segment : "",
            Segment2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Segment2 : "",
            Segment3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Segment3 : "",
            WheatVariety1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WheatVariety : "",
            WheatVariety2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WheatVariety2 : "",
            WheatVariety3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WheatVariety3 : "",
            PO_LineItem: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].PO_LineItem : "",
            PO_LineItem2: data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].PO_LineItem2 !== 0 ? data.intra_state_warehouse_dispatch_info[0].PO_LineItem2 : "",
            PO_LineItem3: data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].PO_LineItem3 !== 0 ? data.intra_state_warehouse_dispatch_info[0].PO_LineItem3 : "",
            SendingStorageLocationName: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].SendingStorageLocation : "",
            //intra_state_warehouse_dispatch_info:data.PickSlipDetails[0] ? data.PickSlipDetails[0].intra_state_warehouse_dispatch_info:"",

            Transporter: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Transporter : "",
            Cont_No: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ContainerNo : "",

            DeliveryNo: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].DeliveryNo : "",
            DeliveryDate: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].DeliveryDate : "",
            ReceivingPlantName: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ReceivingPlant : "",
            EWayBillNO: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].EwayBillNo : "",
            ReceivingStorageLocationName: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ReceivingStorageLocation : "",
            BagType: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].BagType1 : "",
            BagTypeName: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].BagTypeName : "",
            BagTypeName2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].BagTypeName2 : "",
            BagTypeName3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].BagTypeName3 : "",

            WbEmptyWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbEmptyWt : "",
            no_bags: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].No_Bags1 : "",
            no_bags2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].No_Bags2 : "",
            no_bags3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].No_Bags3 : "",
            WbLoadWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbLoadWt : "",
            GunnyWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].GunnyWt : "",
            WbNetWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbNetWt : "",
            GunnyLessNetWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt : "",
            WbNetWt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbNetWt : "",
            sendinggunnwt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].GunnyWt : "",
            sendingnetwt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbNetWt : "",
            sendinggunnylesswt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt : "",
            sendingemptywt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbEmptyWt : "",
            sendingloadwt: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].WbLoadWt : "",
            receivingemptywt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbEmptyWt : "",
            receivingloadwt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbLoadWt : "",
            receivingnetwt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbNetWt : "",
            receivinggunnwt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyWt : "",
            receivinggunnylesswt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyLessNetWt : "",
            diffweight: diffrenceweight,
            lotno1bag1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].BagType : "",
            lotno1bag2: data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType2 !== 0 ? data.intra_state_warehouse_dispatch_info[0].L1_BagType2 : "",
            lotno1bag3: data.intra_state_warehouse_dispatch_info[0] && data.intra_state_warehouse_dispatch_info[0].L1_BagType3 !== 0 ? data.intra_state_warehouse_dispatch_info[0].L1_BagType3 : "",
            lotno2bag1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_BagType : "",
            lotno2bag2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_BagType2 : "",
            lotno3bag3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_BagType3 : "",
            lotno3bag1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_BagType : "",
            lotno3bag2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_BagType2 : "",
            lotno3bag3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_BagType3 : "",
            lotno1bag1qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L1_NoofBags : "",
            lotno1bag2qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L1_NoofBags2 : "",
            lotno1bag3qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L1_NoofBags3 : "",
            lotno2bag1qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_NoofBags : "",
            lotno2bag2qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_NoofBags2 : "",
            lotno2bag3qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L2_NoofBags3 : "",
            lotno3bag1qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_NoofBags : "",
            lotno3bag2qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_NoofBags2 : "",
            lotno3bag3qty: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].L3_NoofBags3 : "",

            LoadingVendor: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadingVendor : "",
            LastMileTransporter: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LastMileTransporter : "",

            sendinglotno1: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo : "",
            sendinglotno2: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo2 : "",
            sendinglotno3: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo3 : "",
            ReceivingBinNo: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ReceivingBin_Name : "",
            SendingPlantLotNo: data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNoid : "",
            sendingdatetime: data.results[0] ? data.results[0].dispPrintedOn : "", //Mohan Changed on 07-09-2022 for changing printedon date format 
            intrastate_gateout_infoCount: ReceivingGateOutInfo? data.intrastate_gateout_info.length:0,

            RWbTicketNumber: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbTicketNumber : "",
            RBagType: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagType : "",
            WbEmptyWt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbEmptyWt : "",
            RWbLoadWt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbLoadWt : "",
            RGunnyWt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyWt : "",
            RWbNetWt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbNetWt : "",
            RUnloadedLotNo: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].UnloadedLotNo : "",
            RUnLoadingVendor: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].UnLoadingVendor : "",
            RGunnyLessNetWt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyLessNetWt : "",
            RInsDt: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].InsDt : "",

            /* 31082022 Receving side also need to show sending bag details both should be same 
            receivinglotno1bag1: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagType + "(" + data.intrastate_gateout_info[0].no_bags + ")" : "",
            receivinglotno1bag2: data.intrastate_gateout_info[0] && data.intrastate_gateout_info[0].bagtype2 ? data.intrastate_gateout_info[0].bagtype2 + "(" + data.intrastate_gateout_info[0].no_bags2 + ")" : "",
            receivinglotno1bag3: data.intrastate_gateout_info[0] && data.intrastate_gateout_info[0].bagtype3 ? data.intrastate_gateout_info[0].bagtype3 + "(" + data.intrastate_gateout_info[0].no_bags3 + ")" : "",
            */
            receivinglotno1bag1: receivingbagLot1,
            receivinglotno1bag2: receivingbagLot2,
            receivinglotno1bag3: receivingbagLot3,
            
            rBagTypeName: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName : "",
            rBagTypeName2: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName2 : "",
            rBagTypeName3: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName3 : "",
            rno_bags: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags : "",
            rno_bags2: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags2 : "",
            rno_bags3: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags3 : "",
            

          })
        }
        else
        {
          form.setValues({
            ZVA_NUMBER:data.results[0].ZVA_NUMBER,
            TRUCK_NO:data.results[0].TRUCK_NO,
            TRAILER_NO:data.results[0].TRAILER_NO,
            GateOutDateTime:data.results[0].GateOutDateTime,
            PickslipDateTime:data.results[0].PickslipDateTime,
            VADate:data.results[0].VADate,
            CONTAINER_NO:data.results[0].CONTAINER_NO,
            
            WheatVariety:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WheatVariety:"",
            SendingPlantName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].SendingPlantName:"",
            StoPoNo:data.PickSlipDetails[0] ? data.PickSlipDetails[0].PoNumber:"", 
            SendingStorageLocationName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].SendingStorageLocationName:"",
            DeliveryNo:data.PickSlipDetails[0] ? data.PickSlipDetails[0].DeliveryNo:"",

            Transporter:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Transporter:"",
            Cont_No:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ContainerNo:"",

            DeliveryDate:data.PickSlipDetails[0] ? data.PickSlipDetails[0].DeliveryDate:"",
            ReceivingPlantName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].ReceivingPlantName:"",
            EWayBillNO:data.PickSlipDetails[0] ? data.PickSlipDetails[0].EwayBillNo:"",
            ReceivingStorageLocationName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].ReceivingStorageLocationName:"",
            BagType:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagType1:"",
            BagTypeName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName:"",
            BagTypeName2:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName2:"",
            BagTypeName3:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName3:"",

            WbEmptyWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbEmptyWt:"",
            no_bags:data.PickSlipDetails[0] ? data.PickSlipDetails[0].No_Bags1:"",
            no_bags2:data.PickSlipDetails[0] ? data.PickSlipDetails[0].No_Bags2:"",
            no_bags3:data.PickSlipDetails[0] ? data.PickSlipDetails[0].No_Bags3:"",
            WbLoadWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbLoadWt:"",
            GunnyWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].GunnyWt:"",
            WbNetWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbNetWt:"",
            GunnyLessNetWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].GunnyLessNetWt:"",
            
            LoadingVendor:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadingVendor:"",
            LastMileTransporter:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LastMileTransporter:"",

            LoadedLotNo:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo:"",
            LoadedLotNo2:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo2:"",
            LoadedLotNo3:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo3:"",

            intrastate_gateout_infoCount:data.intrastate_gateout_info.length,
            
            RWbTicketNumber:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbTicketNumber: "",
            RBagType:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagType: "",
            RWbEmptyWt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbEmptyWt: "",
            RWbLoadWt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbLoadWt: "",
            RGunnyWt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyWt: "",
            RWbNetWt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].WbNetWt: "",
            RUnloadedLotNo:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].UnloadedLotNo: "",
            RUnLoadingVendor:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].UnLoadingVendor: "",
            RGunnyLessNetWt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].GunnyLessNetWt: "",
            RInsDt:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].InsDt: "",

            rBagTypeName:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName:"",
            rBagTypeName2:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName2:"",
            rBagTypeName3:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName3:"",
            rno_bags:data.intrastate_gateout_info[0]? data.intrastate_gateout_info[0].no_bags:"",
            rno_bags2:data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags2:"",
            rno_bags3:data.intrastate_gateout_info[0]? data.intrastate_gateout_info[0].no_bags3:"",

             })

        }


          // console.log("test Form Values", form.values)
          console.log(JSON.stringify(form.values));
          // hideLoader();
          // window.print();
        }
        apiPostMethod(apiBaseUrl + `FCITruckController/AddressDetails/${plant_id}`)
        .then((response) => {
          setAddress(response.data.AddressDetails[0]);
        })
      })
    })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();

      });
  };
  const trstyle={height:"40px"};
  const subheadingstyle1 = { textAlign: "center", fontSize: "18px" };
  const subheadingstyle2 = { textAlign: "left", fontSize: "18px" };
  const print = () => {
    window.print()
  }
  return (

    <div>
      <Container>
          <Button style={{ float: "right" }} color="white" size="sm"><Printer size={16} onClick={print} color="blue" /></Button>
      </Container>
      {isTruck==1 &&
      <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000", paddingTop: "10px", paddingBottom: "5px" }} border={0} >
        <thead>
          <tr ><td style={{ padding: "0px" }} >
          <SmartFormHeader data={Address} />
          <table style={{ width: "100%", height: "20mm", fontSize: "12px", border: "1px solid #000", paddingTop: "5px", paddingBottom: "10px",textAlign:"center" }} border={0} >
                  <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>{'Stock Transfer Form'}</strong></td></tr>
                  <span style={{ fontSize: "15px",textAlign:'center'}}><strong>Sending Plant -</strong>{form.values.SendingPlantName}  </span>
                  <span style={{ fontSize: "15px",textAlign:'center'}}><strong>| Receiving Plant -</strong>{form.values.ReceivingPlantName} </span><br></br>
           </table>
            {/* <table style={{ width: "100%", border: "1px solid #000" }} border={0}>
              <tr>
                <td >
                  <img style={{ width: "150px", height: "auto" }} src={BASE_URL + "/api/upload/images/Address.png"}></img>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "24px" }}><strong>NAGA LIMITED</strong></span><br></br>
                  <span style={{ fontSize: "18px" }}><strong>FOODS DIVISION</strong></span><br></br>

                  <span style={{ fontSize: "14px" }}><strong>FSSAI Lic No 10017042003098</strong></span><br></br>
                  <span style={{ fontSize: "13px" }}>Branch/Depot:Naga Limited-Foods,No.1,Trichy Road,Dindigul :624005<br></br>
                    Ph:0451-2411123/2410121,Mo:9944990043,7708111317,7708111321 Fax:2410122<br></br>
                    GSTIN:33AAACN2369L1zD,PAN:AAACN2369L,<br></br>CIN:U24246TN1991PLC020409,State Code:3310017<br></br></span>

                  <span style={{ fontSize: "20px" }}><strong><u>Stock Transfer Form</u></strong></span><br></br>
                  <span style={{ fontSize: "15px" }}><strong>Sending Plant -</strong>{form.values.SendingPlantName}  </span>
                  <span style={{ fontSize: "15px" }}><strong>| Receiving Plant -</strong>{form.values.ReceivingPlantName} </span><br></br>

                </td>
                <td style={{ textAlign: "right" }}>
                  <img style={{ width: "240px", height: "auto", marginBottom: "-23px" }} src={BASE_URL + "/api/upload/images/Logo2.png"}></img>
                </td></tr>
            </table> */}
          </td></tr>

        </thead>
        <tbody>
    
          <tr>
            <td style={{ padding: "0px" }}>
              <table style={{ width: "100%", height: "57mm", fontSize: "12px", border: "1px solid #000", paddingTop: "1px", paddingBottom: "5px" }} border={0} >

                <tr style={{ width: "25%" }}>
                  <td style={{ width: "20%" }}><strong>Vehicle Arrival No :</strong></td><td style={{ width: "20%" }}>{form.values.ZVA_NUMBER}</td>
                  <td style={{ width: "13%" }}><strong>STO PO No :</strong></td><td style={{ width: "20%" }}>{form.values.StoPoNo}</td>
                  <td style={{ width: "20" }}><strong>Sending Plant :</strong></td><td style={{ width: "10%" }}>{form.values.SendingPlantName}</td>
                </tr>

                <tr style={{ width: "25%" }}>
                  <td><strong>Vehicle No :</strong></td><td>{form.values.TRUCK_NO != "" && form.values.TRUCK_NO != null ? form.values.TRUCK_NO : form.values.TRAILER_NO}</td>
                  <td><strong>STO PO Line Item :</strong></td><td>{form.values.PO_LineItem}, {form.values.PO_LineItem2}, {form.values.PO_LineItem3}</td>
                  <td><strong>Sending STR. Loc. :</strong></td><td>{form.values.SendingStorageLocationName}</td>
                </tr>

                <tr style={{ width: "25%" }}>
                  <td><strong>Transporter :</strong></td><td>{form.values.LastMileTransporter}</td>
                  <td><strong>Delivery No :</strong></td><td>{form.values.DeliveryNo}</td>
                  <td><strong>Receiving Plant :</strong></td><td>{form.values.ReceivingPlantName}</td>
                </tr>

                <tr style={{ width: "25%" }}>
                  <td><strong>Loading Vendor :</strong></td><td>{form.values.LoadingVendor}</td>
                  <td><strong>Delivery Date :</strong></td><td>{form.values.DeliveryDate}</td>
                  <td><strong>Receiving Str. Loc. :</strong></td><td>{form.values.ReceivingStorageLocationName}</td>
                </tr>

                <tr style={{ width: "25%" }}>
                  <td><strong>Sending GateIn Date Time :</strong></td><td>{form.values.GateInDateTime}</td>
                  <td><strong>EWay Bill No :</strong></td><td>{form.values.EWayBillNO}</td>
                  <td><strong>Receiving Bin :</strong></td><td>{form.values.ReceivingBinNo}</td>
                </tr>

                <tr style={{ width: "25%" }}>
                  <td><strong>Sending GateOut Date Time :</strong></td><td>{form.values.GateOutDateTime}</td>
                  <td><strong>{form.values.Cont_No && "Container No :"}</strong></td><td>{form.values.Cont_No}</td>
                  <td><strong> </strong></td><td>{ }</td>
                </tr>
                {isReceivingGateOut &&
                <tr style={{ width: "25%" }}>
                  <td><strong>Receiving GateIn Date Time :</strong></td><td>{form.values.RGateInDateTime}</td>
                </tr>}
                {isReceivingGateOut &&
                <tr style={{ width: "25%" }}>
                  <td><strong>Receiving GateOut Date Time :</strong></td><td>{form.values.RGateOutDateTime}</td>
                </tr>}


              </table>
            </td></tr>


          <tr>


            <td style={{ padding: "0px" }}>
              <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "1px solid #000", paddingTop: "5px", paddingBottom: "10px" }} border={0} >

                <tr style={{ width: "23%" }}><td style={{ width: "20%" }}><strong>Sending Plant Lot No</strong></td> <td style={{ width: "13%" }}>{ }</td>
                  <td><strong></strong></td><td>{ }</td>
                  <td><strong></strong></td><td>{ }</td>
                </tr>
                {form.values.sendinglotno1 &&
                <tr /*style={{ width: "23%" }}*/>
                  <td /* style={{ width: "10%" }} */><strong>Lot No 1 :</strong></td><td style={{ width: "13%" }}>{form.values.sendinglotno1}</td>
                  <td><strong>Segment 1 :</strong></td><td style={{ width: "22%" }}>{form.values.Segment1}</td>
                  <td><strong>Wheat Variety 1 :</strong></td><td>{form.values.WheatVariety1}</td>
                </tr>}

                { form.values.sendinglotno2 &&
                <tr /*style={{ width: "22%" }}*/>
                  <td /* style={{ width: "10%" }} */><strong>Lot No 2 :</strong></td> <td style={{ width: "20%" }}>{form.values.sendinglotno2}</td>
                  <td><strong>Segment 2 :</strong></td><td style={{ width: "22%" }}>{form.values.Segment2}</td>
                  <td><strong>Wheat Variety 2 :</strong></td><td>{form.values.WheatVariety2}</td>
                </tr>}
                
                {form.values.sendinglotno3 && 
                <tr /*style={{ width: "22%" }}*/>
                  <td /*style={{ width: "10%" }} */><strong>Lot No 3 :</strong></td> <td style={{ width: "20%" }}>{form.values.sendinglotno3}</td>
                  <td><strong>Segment 3 :</strong></td><td /*style={{ width: "22%" }}*/>{form.values.Segment3}</td>
                  <td><strong>Wheat Variety 3 :</strong></td><td>{form.values.WheatVariety3}</td>
                </tr>}
              </table>
            </td></tr>

          <tr>

            <td colSpan={6} style={{ padding: "0px" }}>
              <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "5px" }} border={1} >
                <tr>
                  <td valign="top" width="50%">
                    <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "1px" }} border={0} >  <tr style={{ width: "100%" }}>
                      <td colSpan={2} style={{ width: "100%" }}><strong>Sending Bag Details : </strong></td>
                    </tr>

{form.values.sendinglotno1 &&
<tr><td style={{ width: "13%" }}><strong>Lot No 1 :</strong></td> <td style={{ width: "50%" }}>{form.values.sendinglotno1}</td></tr>}
{form.values.lotno1bag1 &&
<tr><td style={{ width: "13%" }}>Bag 1 :</td> <td style={{ width: "50%" }}>{form.values.lotno1bag1} ({form.values.lotno1bag1qty})</td></tr>}
{form.values.lotno1bag2 &&
<tr><td style={{ width: "13%" }}>Bag 2 :</td> <td style={{ width: "20%" }}>{form.values.lotno1bag2} ({form.values.lotno1bag2qty})</td></tr>}
{form.values.lotno1bag3 &&
<tr><td style={{ width: "13%" }}>Bag 3 :</td> <td style={{ width: "20%" }}>{form.values.lotno1bag3} ({form.values.lotno1bag3qty})</td></tr>}

{form.values.sendinglotno2 &&
<tr><td style={{ width: "13%" }}><strong>Lot No 2 :</strong></td> <td style={{ width: "50%" }}>{form.values.sendinglotno2}</td></tr>}
{form.values.lotno2bag1 &&
<tr><td style={{ width: "13%" }}>Bag 1 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag1} ({form.values.lotno2bag1qty})</td></tr>}
{form.values.lotno2bag2 &&
<tr><td style={{ width: "13%" }}>Bag 2 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag2} ({form.values.lotno2bag2qty})</td></tr>}
{form.values.lotno2bag3 &&
<tr><td style={{ width: "13%" }}>Bag 3 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag3} ({form.values.lotno2bag3qty})</td></tr>}

{form.values.sendinglotno3 &&
<tr><td style={{ width: "13%" }}><strong>Lot No 3 :</strong></td> <td style={{ width: "50%" }}>{form.values.sendinglotno3}</td></tr>}
{form.values.lotno3bag1 &&
<tr><td style={{ width: "13%" }}>Bag 1 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag1} ({form.values.lotno3bag1qty})</td></tr>}
{form.values.lotno3bag2 &&
<tr><td style={{ width: "13%" }}>Bag 2 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag2} ({form.values.lotno3bag2qty})</td></tr>}
{form.values.lotno3bag3 &&
<tr><td style={{ width: "13%" }}>Bag 3 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag3} ({form.values.lotno3bag3qty})</td></tr>}

                  </table>
                  </td>

                  <td valign="top" width="50%">
                    {isReceivingGateOut &&
                      <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "1px" }} border={0} >
                      <tr style={{ width: "100%" }}><td colSpan={2} style={{ width: "100%" }} ><strong>Receiving Bag Details : </strong></td></tr>
                      {form.values.ReceivingBinNo &&
                      <tr><td style={{ width: "13%" }}><strong>Bin No :</strong></td><td style={{ width: "50%" }}>{form.values.ReceivingBinNo}</td></tr>}
                      {form.values.receivinglotno1bag1 &&
                      <tr><td style={{ width: "10%" }}>Bag 1 :</td><td style={{ width: "50%" }}>{form.values.receivinglotno1bag1} </td></tr>}
                      {form.values.receivinglotno1bag2 &&
                      <tr><td style={{ width: "10%" }}>Bag 2 :</td><td style={{ width: "50%" }}>{form.values.receivinglotno1bag2} </td></tr>}
                      {form.values.receivinglotno1bag3 &&
                      <tr><td style={{ width: "10%" }}>Bag 3 :</td><td style={{ width: "50%" }}>{form.values.receivinglotno1bag3} </td></tr>}
                      <tr><td><strong>&nbsp;</strong></td></tr>

                      {
                        /* Mohan 14-09-2022 Added following as requested by client sending bag can be showed same as received */
                      /*form.values.sendinglotno2 &&
<tr><td style={{ width: "13%" }}><strong>Lot No 2 :</strong></td> <td style={{ width: "50%" }}>{form.values.sendinglotno2}</td></tr>*/}
{form.values.lotno2bag1 &&
<tr><td style={{ width: "13%" }}>Bag 1 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag1} ({form.values.lotno2bag1qty})</td></tr>}
{form.values.lotno2bag2 &&
<tr><td style={{ width: "13%" }}>Bag 2 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag2} ({form.values.lotno2bag2qty})</td></tr>}
{form.values.lotno2bag3 &&
<tr><td style={{ width: "13%" }}>Bag 3 :</td> <td style={{ width: "50%" }}>{form.values.lotno2bag3} ({form.values.lotno2bag3qty})</td></tr>}

{/*form.values.sendinglotno3 &&
<tr><td style={{ width: "13%" }}><strong>Lot No 3 :</strong></td> <td style={{ width: "50%" }}>{form.values.sendinglotno3}</td></tr>*/}
{form.values.lotno3bag1 &&
<tr><td style={{ width: "13%" }}>Bag 1 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag1} ({form.values.lotno3bag1qty})</td></tr>}
{form.values.lotno3bag2 &&
<tr><td style={{ width: "13%" }}>Bag 2 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag2} ({form.values.lotno3bag2qty})</td></tr>}
{form.values.lotno3bag3 &&
<tr><td style={{ width: "13%" }}>Bag 3 :</td> <td style={{ width: "50%" }}>{form.values.lotno3bag3} ({form.values.lotno3bag3qty})</td></tr>}

                        {/* <tr>
<td style={{width:"20%"}}>Bag 1 -</td><td style={{width:"50%"}}>{form.values.lotno2bag1} ({form.values.receivinglotno2bag1qty})</td>
</tr>
<tr>
<td style={{width:"20%"}}>Bag 2 -</td><td style={{width:"50%"}}>{form.values.lotno2bag2} ({form.values.receivinglotno2bag2qty})</td>
</tr>
<tr>
<td style={{width:"20%"}}>Bag 3 -</td><td style={{width:"50%"}}>{form.values.lotno2bag3} ({form.values.receivinglotno2bag3qty})</td>
</tr>
<tr>
<td><strong>&nbsp;</strong></td>
</tr>
<tr>
<td style={{width:"20%"}}>Bag 1 -</td><td style={{width:"50%"}}>{form.values.lotno3bag1} ({form.values.receivinglotno3bag1qty})</td>
</tr>
<tr>
<td style={{width:"20%"}}>Bag 2 -</td><td style={{width:"50%"}}>{form.values.lotno3bag2} ({form.values.receivinglotno3bag2qty})</td>
</tr>
<tr>
<td style={{width:"20%"}}>Bag 3 -</td><td style={{width:"50%"}}>{form.values.lotno3bag3} ({form.values.receivinglotno3bag3qty})</td>
</tr> */}

                      </table>
                    }
                  </td>
                </tr>
              </table>
            </td></tr>



          <tr>

            <td style={{ padding: "0px" }}>
              <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "1px" }} border={1} >
                <tr>
                  <td valign="top" width="50%">
                    <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "1px" }} border={0} >                      
                      <tr><td colSpan={2} style={{ width: "100%" }}><strong>Sending Weighment Details:</strong></td></tr>
                      <tr><td style={{ width: "25%" }}><strong>Empty Weight :</strong></td>  <td style={{ width: "25%" }}>{form.values.sendingemptywt}</td></tr>
                      <tr><td style={{ width: "25%" }}><strong>Load Weight :</strong></td> <td style={{ width: "25%" }}>{form.values.sendingloadwt}</td></tr>
                      <tr><td style={{ width: "25%" }}><strong>Net Weight :</strong></td> <td style={{ width: "25%" }}>{form.values.sendingnetwt}</td></tr>
                      <tr><td style={{ width: "25%" }}><strong>Gunny Weight :</strong></td> <td style={{ width: "25%" }}>{form.values.sendinggunnwt}</td></tr>
                      <tr><td style={{ width: "25%" }}><strong>Gunny Less Weight :</strong></td> <td style={{ width: "25%" }}>{form.values.sendinggunnylesswt}</td></tr>
                      <tr><td style={{ width: "25%" }}><strong>&nbsp;</strong></td></tr>
                    </table>
                  </td>

                  <td valign="top" width="50%">
                    {isReceivingGateOut &&
                      <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "0px solid #000", paddingTop: "1px", paddingBottom: "1px" }} border={0} >
                        <tr><td colSpan={2} style={{ width: "100%" }}><strong>Receiving Weighment Details:</strong></td></tr>
                        <tr><td style={{ width: "50%" }}><strong>Empty Weight :</strong></td><td>{form.values.receivingemptywt}</td></tr>
                        <tr><td><strong>Load Weight :</strong></td><td>{form.values.receivingloadwt}</td></tr>
                        <tr><td style={{ width: "25%" }}><strong>Net Weight :</strong></td><td>{form.values.receivingnetwt}</td></tr>
                        <tr><td style={{ width: "25%" }}><strong>Gunny Weight :</strong></td><td>{form.values.receivinggunnwt}</td></tr>
                        <tr><td style={{ width: "25%" }}><strong>Gunny Less Weight :</strong></td><td>{form.values.receivinggunnylesswt}</td></tr>
                        <tr><td style={{ width: "25%" }}><strong>Difference Weight :</strong></td><td>{form.values.diffweight}</td></tr>
                      </table>
                        } 
                  </td>
                </tr>
              </table>
            </td></tr>

          <tr>
            <td style={{ padding: "0px" }}>
              <table style={{ width: "100%", height: "37mm", fontSize: "12px", border: "1px solid #000", paddingTop: "0px", paddingBottom: "0px" }} border={0} >

                <tr style={{ width: "22%" }}><td style={{ width: "13%" }}><strong>Signature </strong></td> <td style={{ width: "20%" }}>{ }</td>
                  <td><strong></strong></td><td>{ }</td>
                  <td></td>
                  <td></td>
                </tr>

                <tr style={{ width: "22%" }}><td style={{ width: "13%" }}><strong></strong></td> <td style={{ width: "20%" }}>{ }</td>
                  <td><strong></strong></td><td>{ }</td>
                  <td></td>
                  <td></td>

                </tr>

                <tr style={{ width: "22%" }}><td style={{ width: "13%" }}><strong></strong></td> <td style={{ width: "20%" }}>{ }</td>
                  <td><strong></strong></td><td>{ }</td>
                  <td></td>
                  <td></td>

                </tr>

                <tr style={{ width: "22%" }}>
                  <td style={{ width: "20%" }}><strong>Sending Plant Supervisor</strong></td> <td style={{ width: "13%" }}>{ }</td>
                  <td><strong>Sending Plant QC </strong></td><td>{ }</td>
                  <td style={{ width: "13%" }}>Printed On :</td> <td style={{ width: "20%" }}>{form.values.sendingdatetime}</td>

                </tr>

              </table>
            </td></tr>

        </tbody>
      </table>
      }
      {
        //Mohan Added 08092022 for Other Forms(except Truck)
        isTruck!=1 && 
      
        <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000", paddingTop: "10px", paddingBottom: "10px" }} border={0} >
          <thead>
            <tr ><td style={{ padding: "0px" }} >


              <table style={{ width: "100%" }} border={0}>
                <tr>
                  <td>
                    <img style={{ width: "150px", height: "auto" }} src={BASE_URL + "/api/upload/images/Address.png"}></img>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "24px" }}><strong>NAGA LIMITED</strong></span><br></br>
                    <span style={{ fontSize: "18px" }}><strong>FOODS DIVISION</strong></span><br></br>

                    <span style={{ fontSize: "14px" }}><strong>FSSAI Lic No 10017042003098</strong></span><br></br>
                    <span style={{ fontSize: "13px" }}>Branch/Depot:Naga Limited-Foods,No.1,Trichy Road,Dindigul - 624005<br></br>
                      Ph:0451-2411123/2410121,Mo:9944990043,7708111317,7708111321 Fax: 2410122<br></br>
                      GSTIN:33AAACN2369L1zD,PAN:AAACN2369L,CIN:U24246TN1991PLC020409, State Code:3310017<br></br></span>

                  </td>
                  <td style={{ textAlign: "right" }}>
                    <img style={{ width: "240px", height: "auto", marginBottom: "-23px" }} src={BASE_URL + "/api/upload/images/Logo2.png"}></img>
                  </td></tr>
              </table>
            </td></tr>
            {/*<tr><td style={{textAlign:"center"}}><strong>Unit Address</strong></td></tr>
       <tr><td style={{textAlign:"center"}}><strong>Stock Transfer Form</strong></td></tr>*/}
          </thead>
          <tbody>
            <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
              <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong><u>Stock Transfer Form</u></strong></td></tr>

              <tr style={trstyle}><td colSpan={3} style={{ textAlign: "right", fontSize: "14px" }} ><strong>Sending Plant -</strong>{form.values.SendingPlantName} </td> <td colSpan={3} style={{ fontSize: "14px" }}  >&nbsp;&nbsp; <strong>Receiving Plant -</strong> {form.values.ReceivingPlantName}</td></tr>

              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Vehicle Arrival No - </strong></td> <td style={{ width: "20%" }}>{form.values.ZVA_NUMBER}</td>

                <td style={{ width: "15%" }}><strong>Wheat Variety - </strong></td><td style={{ width: "20%" }}>{form.values.WheatVariety}</td><td style={{ width: "13%" }}><strong>Sending Plant - </strong></td><td style={{ width: "20%" }}>{form.values.SendingPlantName}</td></tr>
              <tr style={trstyle}><td><strong>VA Date - </strong></td><td>{form.values.VADate}</td><td><strong>STO PO No - </strong></td><td>{form.values.StoPoNo}</td><td><strong>Sending Str. Loc. - </strong></td><td>{form.values.SendingStorageLocationName}</td></tr>
              <tr style={trstyle}><td><strong>Vehicle No - </strong></td><td>{form.values.TRUCK_NO != "" && form.values.TRUCK_NO != null ? form.values.TRUCK_NO : form.values.TRAILER_NO}</td><td><strong>Delivery No - </strong></td><td>{form.values.DeliveryNo}</td><td><strong>Sending Plant Lot - </strong></td><td>{form.values.LoadedLotNo}</td></tr>
              <tr style={trstyle}><td><strong>Transporter - </strong></td><td>{form.values.LastMileTransporter}</td><td><strong>Delivery Date - </strong></td><td>{form.values.DeliveryDate}</td><td><strong>Sending Plant Lot2 - </strong></td><td>{form.values.LoadedLotNo2}</td></tr>
              <tr style={trstyle}><td><strong>Loading Vendor - </strong></td><td>{form.values.LoadingVendor}</td><td><strong>EWay Bill No - </strong></td><td>{form.values.EWayBillNO}</td><td><strong>Sending Plant Lot3 - </strong></td><td>{form.values.LoadedLotNo3}</td></tr>
              <tr style={trstyle}><td><strong>Container No - </strong></td><td>{form.values.Cont_No}</td><td><strong>Gate Out Date & Time - </strong></td><td>{form.values.GateOutDateTime}</td><td><strong>Rec. Plant - </strong></td><td>{form.values.ReceivingPlantName}</td><td></td><td></td></tr>
              <tr style={trstyle}><td><strong>--</strong></td><td>{ }</td><td><strong>--</strong></td><td>{ }</td><td><strong>Rec. Str. Loc. - </strong></td><td>{form.values.ReceivingStorageLocationName}</td><td></td><td></td></tr>
              <tr style={trstyle}><td><strong>--</strong></td><td>{ }</td><td><strong>--</strong></td><td>{ }</td><td><strong>PO Date - </strong></td><td>{form.values.PickslipDateTime}</td><td></td><td></td></tr>

            </table></td></tr>
            <tr><td><hr></hr></td></tr>

            <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
              <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 1 - {form.values.LoadedLotNo}</u></strong></td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 1</strong></td>
                <td style={{ width: "20%" }}>{form.values.no_bags > 0 ? form.values.BagTypeName + " (" + form.values.no_bags + ")" : ""}</td>
                <td style={{ width: "13%" }}><strong>Gunny Weight - </strong></td><td style={{ width: "20%" }}>{form.values.GunnyWt}</td>
                <td style={{ width: "13%" }}><strong>Empty Weight - </strong></td><td style={{ width: "20%" }}>{form.values.WbEmptyWt}</td></tr>

              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 2</strong></td><td style={{ width: "20%" }}>{form.values.no_bags2 > 0 ? form.values.BagTypeName2 + " (" + form.values.no_bags2 + ")" : ""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 3</strong></td><td style={{ width: "20%" }}>{form.values.no_bags3 > 0 ? form.values.BagTypeName3 + " (" + form.values.no_bags3 + ")" : ""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
              <tr style={trstyle}><td><strong></strong></td><td>{ }</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>

              <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 2 - {form.values.LoadedLotNo2}</u></strong></td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 1</strong></td>
                <td style={{ width: "20%" }}>{form.values.no_bags > 0 ? form.values.BagTypeName + " (" + form.values.no_bags + ")" : ""}</td>
                <td style={{ width: "13%" }}><strong>Gunny Weight - </strong></td><td style={{ width: "20%" }}>{form.values.GunnyWt}</td>
                <td style={{ width: "13%" }}><strong>Empty Weight - </strong></td><td style={{ width: "20%" }}>{form.values.WbEmptyWt}</td></tr>

              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 2</strong></td><td style={{ width: "20%" }}>{form.values.no_bags2 > 0 ? form.values.BagTypeName2 + " (" + form.values.no_bags2 + ")" : ""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 3</strong></td><td style={{ width: "20%" }}>{form.values.no_bags3 > 0 ? form.values.BagTypeName3 + " (" + form.values.no_bags3 + ")" : ""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
              <tr style={trstyle}><td><strong></strong></td><td>{ }</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>

              <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 3 - {form.values.LoadedLotNo3}</u></strong></td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 1</strong></td>
                <td style={{ width: "20%" }}>{form.values.no_bags > 0 ? form.values.BagTypeName + " (" + form.values.no_bags + ")" : ""}</td>
                <td style={{ width: "13%" }}><strong>Gunny Weight - </strong></td><td style={{ width: "20%" }}>{form.values.GunnyWt}</td>
                <td style={{ width: "13%" }}><strong>Empty Weight - </strong></td><td style={{ width: "20%" }}>{form.values.WbEmptyWt}</td></tr>

              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 2</strong></td><td style={{ width: "20%" }}>{form.values.no_bags2 > 0 ? form.values.BagTypeName2 + " (" + form.values.no_bags2 + ")" : ""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
              <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 3</strong></td><td style={{ width: "20%" }}>{form.values.no_bags3 > 0 ? form.values.BagTypeName3 + " (" + form.values.no_bags3 + ")" : ""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
              <tr style={trstyle}><td><strong>Printed on - </strong></td><td>{form.values.PickslipDateTime}</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>


              <tr style={trstyle}><td>WH Incharge Sign</td><td></td><td></td><td></td><td>Security Sign</td><td></td></tr>
            </table></td></tr>



            {form.values.intrastate_gateout_infoCount > 0 && (
              <>

                <tr><td><hr></hr></td></tr>
                <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                  <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Receving Details</u></strong></td></tr>

                  <tr style={trstyle}><td style={{ width: "13%" }}><strong>Ticket No.</strong></td><td style={{ width: "20%" }}>{form.values.RWbTicketNumber > 0 ? form.values.RWbTicketNumber : ""}</td><td></td><td></td><td></td><td></td></tr>
                  <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 1</strong></td>
                    <td style={{ width: "20%" }}>{form.values.rno_bags > 0 ? form.values.rBagTypeName + " ( Qty : " + form.values.rno_bags + ")" : ""}</td><td><strong>Gunny Weight - </strong></td><td>{form.values.RGunnyWt}</td>
                    <td style={{ width: "13%" }}><strong>Empty Weight - </strong></td><td style={{ width: "20%" }}>{form.values.RWbEmptyWt}</td></tr>

                  <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 2</strong></td><td style={{ width: "20%" }}>{form.values.rno_bags2 > 0 ? form.values.rBagTypeName2 + " ( Qty : " + form.values.rno_bags2 + ")" : ""}</td><td><strong>Rec. Lot No.</strong></td><td>{form.values.RUnloadedLotNo}</td><td><strong>Load Weight - </strong></td><td>{form.values.RWbLoadWt}</td></tr>
                  <tr style={trstyle}><td style={{ width: "13%" }}><strong>Bag 3</strong></td><td style={{ width: "20%" }}>{form.values.rno_bags3 > 0 ? form.values.rBagTypeName3 + " ( Qty : " + form.values.rno_bags3 + ")" : ""}</td><td><strong>Unloading Vendor - </strong></td><td>{form.values.RUnLoadingVendor}</td><td><strong>Net Weight - </strong></td><td>{form.values.RWbNetWt}</td></tr>

                  <tr style={trstyle}><td></td><td></td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.RGunnyLessNetWt}</td></tr>

                  <tr style={trstyle}><td><strong>Printed on - </strong></td><td>{form.values.RInsDt}</td><td></td><td></td><td></td><td></td></tr>



                </table></td></tr>

              </>
            )}

          </tbody>
        </table>
      }
       {imageDataFirst[0]?.id &&
      <div>
      <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000" }} border={0} >
      <tr>
          {/* <td style={{ padding: "0px" }} > */}
                    <Col md="12" sm="12" style={subheadingstyle2}><u><strong>First Weight :</strong></u></Col>
                    <br></br>
                    <Row>
                        {imageDataFirst.map(imageData => (
                            <Col md="6"  sm="12" key={imageData.id}>
                                <img  style={{ width: "300px", height: "auto",marginLeft : '20px' }} src={imageData.image_path} />
                            </Col>
                        ))}
                   </Row>
                   <br></br>
                   <Col md="12" sm="12" style={subheadingstyle2}><u><strong>Second Weight :</strong></u></Col>
                    <br></br>
                    <Row>
                        {imageDataSecond.map(imageData => (
                            <Col md="6" sm="12" key={imageData.id}>
                                <img  style={{ width: "300px", height: "auto",marginLeft : '20px' }} src={imageData.image_path} />
                            </Col>
                        ))}
                   </Row>
          {/* </td> */}
        </tr>
      </table>
      </div>}  
    </div>

  );
};

const SlipGeneration = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},

  });
  const values = form.values;

  return (
    <Fragment>

      <CardComponent >
        <SlipForm form={form} />
      </CardComponent>

    </Fragment>
  );
};

export default SlipGeneration;
