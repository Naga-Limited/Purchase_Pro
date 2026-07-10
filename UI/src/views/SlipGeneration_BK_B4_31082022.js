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
import { Row, Col, Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "./forms/custom-form";

import { eadUrl } from "../urlConstants";



const SlipForm = ({ form, onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  const [isReceivingGateOut, setIsReceivingGateOut] = useState(false);
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
    showLoader();
    //alert("ok")
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        //console.log(JSON.stringify(response));

        console.log("Result : ", data);
        let ReceivingGateOutInfo =(data.intrastate_gateout_info && data.intrastate_gateout_info.length > 0);
        setIsReceivingGateOut(ReceivingGateOutInfo);
        if (data.success) {
          let diffrenceweight = (ReceivingGateOutInfo && data.intrastate_gateout_info[0].GunnyLessNetWt ? parseFloat(data.intrastate_gateout_info[0].GunnyLessNetWt) : 0) - (data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt ? parseFloat(data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt) : 0);
          //diffrenceweight = data.intrastate_gateout_info[0].GunnyLessNetWt +"-"+ data.intra_state_warehouse_dispatch_info[0].GunnyLessNetWt;
          form.setValues({
            ZVA_NUMBER: data.results[0].ZVA_NUMBER,
            TRUCK_NO: data.results[0].TRUCK_NO,
            TRAILER_NO: data.results[0].TRAILER_NO,

            GateInDateTime: data.results[0].GateInDt, // Enpty Vehicle Arrival Record Insert Data & Time
            //GateOutDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].DateModified:"", //Intrastate Gateout Record DateModified
            GateOutDateTime:data.results[0].GateOutDateTime,
            
            RGateInDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].DateAdded:"",
            RGateOutDateTime: ReceivingGateOutInfo && data.intrastate_gateout_info[0]?data.intrastate_gateout_info[0].DateModified:"",


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
            sendingdatetime: data.results[0] ? data.results[0].DateModified : "",
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

            receivinglotno1bag1: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagType + "(" + data.intrastate_gateout_info[0].no_bags + ")" : "",
            receivinglotno1bag2: data.intrastate_gateout_info[0] && data.intrastate_gateout_info[0].bagtype2 ? data.intrastate_gateout_info[0].bagtype2 + "(" + data.intrastate_gateout_info[0].no_bags2 + ")" : "",
            receivinglotno1bag3: data.intrastate_gateout_info[0] && data.intrastate_gateout_info[0].bagtype3 ? data.intrastate_gateout_info[0].bagtype3 + "(" + data.intrastate_gateout_info[0].no_bags3 + ")" : "",

            rBagTypeName: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName : "",
            rBagTypeName2: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName2 : "",
            rBagTypeName3: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].BagTypeName3 : "",
            rno_bags: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags : "",
            rno_bags2: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags2 : "",
            rno_bags3: data.intrastate_gateout_info[0] ? data.intrastate_gateout_info[0].no_bags3 : "",

          })

          // console.log("test Form Values", form.values)
          console.log(JSON.stringify(form.values));
          hideLoader();
          window.print();
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();

      });
  };

  const subheadingstyle1 = { textAlign: "center", fontSize: "18px" };
  const subheadingstyle2 = { textAlign: "left", fontSize: "18px" };

  return (

    <div>
      <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000", paddingTop: "10px", paddingBottom: "5px" }} border={0} >
        <thead>
          <tr ><td style={{ padding: "0px" }} >
            <table style={{ width: "100%", border: "1px solid #000" }} border={0}>
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
            </table>
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
