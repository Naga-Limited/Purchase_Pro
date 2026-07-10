import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "./forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl,evaUrl,BASE_URL } from "../urlConstants";
import { useLoader } from "../utility/hooks/useLoader";
import { addOption } from "./common/Utils";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "./forms/custom-button";
import { CardComponent } from "./common/CardComponent";
import moment from "moment"; 
////import SlipForm from "./SlipForm";
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "./forms/custom-form";

import { eadUrl } from "../urlConstants";



const SlipForm = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
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
      plantIds:[],
      SCREEN_TYPE:"EVADP",
      startCount:0,
      formType:"SLIPGENERATION"
    };
    showLoader();
    //alert("ok")
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        //console.log(JSON.stringify(response));
        
        console.log("Result : ", data.results);

        if (data.success) {
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
             console.log("test 1")
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
  
  console.log("form:"+JSON.stringify(form))
  const trstyle={height:"40px"};
  const subheadingstyle1={textAlign:"center",fontSize:"18px"};
  const subheadingstyle2={textAlign:"left",fontSize:"18px"};

  return (
   <div>
     <table style={{width:"100%",height:"287mm",fontSize:"12px",border:"1px solid #000",paddingTop:"10px",paddingBottom:"10px"}} border={0} >
       <thead>
         <tr ><td style={{padding:"0px"}} >
           
          
           <table  style={{width:"100%"}} border={0}>
             <tr>
               <td> 
           <img style={{width:"150px",height:"auto"}} src={BASE_URL+"/api/upload/images/Address.png"}></img>
           </td>
           <td style={{textAlign:"center"}}>
<span style={{fontSize:"24px"}}><strong>NAGA LIMITED</strong></span><br></br>
<span style={{fontSize:"18px"}}><strong>FOODS DIVISION</strong></span><br></br>

<span style={{fontSize:"14px"}}><strong>FSSAI Lic No 10017042003098</strong></span><br></br>
<span style={{fontSize:"13px"}}>Branch/Depot:Naga Limited-Foods,No.1,Trichy Road,Dindigul - 624005<br></br>
Ph:0451-2411123/2410121,Mo:9944990043,7708111317,7708111321 Fax: 2410122<br></br>
GSTIN:33AAACN2369L1zD,PAN:AAACN2369L,CIN:U24246TN1991PLC020409, State Code:3310017<br></br></span>

           </td>
           <td style={{textAlign:"right"}}> 
           <img style={{width:"240px",height:"auto",marginBottom:"-23px"}} src={BASE_URL+"/api/upload/images/Logo2.png"}></img>
           </td></tr>
           </table>
           </td></tr>
         {/*<tr><td style={{textAlign:"center"}}><strong>Unit Address</strong></td></tr>
         <tr><td style={{textAlign:"center"}}><strong>Stock Transfer Form</strong></td></tr>*/}
       </thead>
       <tbody>
        <tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
        <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong><u>Stock Transfer Form</u></strong></td></tr>

        <tr style={trstyle}><td colSpan={3} style={{textAlign:"right",fontSize:"14px"}} ><strong>Sending Plant -</strong>{form.values.SendingPlantName} </td> <td colSpan={3} style={{fontSize:"14px"}}  >&nbsp;&nbsp; <strong>Receiving Plant -</strong> {form.values.ReceivingPlantName}</td></tr>
        
        <tr style={trstyle}><td style={{width:"13%"}}><strong>Vehicle Arrival No - </strong></td> <td  style={{width:"20%"}}>{form.values.ZVA_NUMBER}</td>

        <td  style={{width:"15%"}}><strong>Wheat Variety - </strong></td><td  style={{width:"20%"}}>{form.values.WheatVariety}</td><td  style={{width:"13%"}}><strong>Sending Plant - </strong></td><td  style={{width:"20%"}}>{form.values.SendingPlantName}</td></tr>
         <tr style={trstyle}><td><strong>VA Date - </strong></td><td>{form.values.VADate}</td><td><strong>STO PO No - </strong></td><td>{form.values.StoPoNo}</td><td><strong>Sending Str. Loc. - </strong></td><td>{form.values.SendingStorageLocationName}</td></tr>
         <tr style={trstyle}><td><strong>Vehicle No - </strong></td><td>{form.values.TRUCK_NO!="" && form.values.TRUCK_NO!=null ? form.values.TRUCK_NO: form.values.TRAILER_NO}</td><td><strong>Delivery No - </strong></td><td>{form.values.DeliveryNo}</td><td><strong>Sending Plant Lot - </strong></td><td>{form.values.LoadedLotNo}</td></tr>
         <tr style={trstyle}><td><strong>Transporter - </strong></td><td>{form.values.LastMileTransporter}</td><td><strong>Delivery Date - </strong></td><td>{form.values.DeliveryDate}</td><td><strong>Sending Plant Lot2 - </strong></td><td>{form.values.LoadedLotNo2}</td></tr>
         <tr style={trstyle}><td><strong>Loading Vendor - </strong></td><td>{form.values. LoadingVendor}</td><td><strong>EWay Bill No - </strong></td><td>{form.values.EWayBillNO}</td><td><strong>Sending Plant Lot3 - </strong></td><td>{form.values.LoadedLotNo3}</td></tr>
         <tr style={trstyle}><td><strong>Container No - </strong></td><td>{form.values.Cont_No}</td><td><strong>Gate Out Date & Time - </strong></td><td>{form.values.GateOutDateTime}</td><td><strong>Rec. Plant - </strong></td><td>{form.values.ReceivingPlantName}</td><td></td><td></td></tr>
         <tr style={trstyle}><td><strong>--</strong></td><td>{}</td><td><strong>--</strong></td><td>{}</td><td><strong>Rec. Str. Loc. - </strong></td><td>{form.values.ReceivingStorageLocationName}</td><td></td><td></td></tr>
         <tr style={trstyle}><td><strong>--</strong></td><td>{}</td><td><strong>--</strong></td><td>{}</td><td><strong>PO Date - </strong></td><td>{form.values.PickslipDateTime}</td><td></td><td></td></tr>
         
          </table></td></tr>
          <tr><td><hr></hr></td></tr>

          <tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 1 - {form.values.LoadedLotNo}</u></strong></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 1</strong></td>
          <td style={{width:"20%"}}>{form.values.no_bags>0 ? form.values.BagTypeName+" ("+form.values.no_bags+")" :""}</td>
          <td style={{width:"13%"}}><strong>Gunny Weight - </strong></td><td style={{width:"20%"}}>{form.values.GunnyWt}</td>
          <td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.WbEmptyWt}</td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 2</strong></td><td style={{width:"20%"}}>{form.values.no_bags2>0 ? form.values.BagTypeName2+" ("+form.values.no_bags2+")" :""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 3</strong></td><td style={{width:"20%"}}>{form.values.no_bags3>0 ? form.values.BagTypeName3+" ("+form.values.no_bags3+")" :""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
          <tr style={trstyle}><td><strong></strong></td><td>{}</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>

          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 2 - {form.values.LoadedLotNo2}</u></strong></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 1</strong></td>
          <td style={{width:"20%"}}>{form.values.no_bags>0 ? form.values.BagTypeName+" ("+form.values.no_bags+")" :""}</td>
          <td style={{width:"13%"}}><strong>Gunny Weight - </strong></td><td style={{width:"20%"}}>{form.values.GunnyWt}</td>
          <td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.WbEmptyWt}</td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 2</strong></td><td style={{width:"20%"}}>{form.values.no_bags2>0 ? form.values.BagTypeName2+" ("+form.values.no_bags2+")" :""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 3</strong></td><td style={{width:"20%"}}>{form.values.no_bags3>0 ? form.values.BagTypeName3+" ("+form.values.no_bags3+")" :""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
          <tr style={trstyle}><td><strong></strong></td><td>{}</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>

          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Weightment Details 3 - {form.values.LoadedLotNo3}</u></strong></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 1</strong></td>
          <td style={{width:"20%"}}>{form.values.no_bags>0 ? form.values.BagTypeName+" ("+form.values.no_bags+")" :""}</td>
          <td style={{width:"13%"}}><strong>Gunny Weight - </strong></td><td style={{width:"20%"}}>{form.values.GunnyWt}</td>
          <td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.WbEmptyWt}</td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 2</strong></td><td style={{width:"20%"}}>{form.values.no_bags2>0 ? form.values.BagTypeName2+" ("+form.values.no_bags2+")" :""}</td><td></td><td></td><td><strong>Load Weight - </strong></td><td>{form.values.WbLoadWt}</td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 3</strong></td><td style={{width:"20%"}}>{form.values.no_bags3>0 ? form.values.BagTypeName3+" ("+form.values.no_bags3+")" :""}</td><td></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.WbNetWt}</td></tr>
          <tr style={trstyle}><td><strong>Printed on - </strong></td><td>{form.values.PickslipDateTime}</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.GunnyLessNetWt}</td></tr>
          
          
          <tr style={trstyle}><td>WH Incharge Sign</td><td></td><td></td><td></td><td>Security Sign</td><td></td></tr>
          </table></td></tr>



  {form.values.intrastate_gateout_infoCount > 0 && (
    <>

<tr><td><hr></hr></td></tr>
<tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><strong><u>Receving Details</u></strong></td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Ticket No.</strong></td><td style={{width:"20%"}}>{form.values.RWbTicketNumber>0?form.values.RWbTicketNumber:""}</td><td></td><td></td><td></td><td></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 1</strong></td>
          <td style={{width:"20%"}}>{form.values.rno_bags>0 ? form.values.rBagTypeName+" ( Qty : "+form.values.rno_bags+")" :""}</td><td><strong>Gunny Weight - </strong></td><td>{form.values.RGunnyWt}</td>
          <td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.RWbEmptyWt}</td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 2</strong></td><td style={{width:"20%"}}>{form.values.rno_bags2>0 ? form.values.rBagTypeName2+" ( Qty : "+form.values.rno_bags2+")" :""}</td><td><strong>Rec. Lot No.</strong></td><td>{form.values.RUnloadedLotNo}</td><td><strong>Load Weight - </strong></td><td>{form.values.RWbLoadWt}</td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 3</strong></td><td style={{width:"20%"}}>{form.values.rno_bags3>0 ? form.values.rBagTypeName3+" ( Qty : "+form.values.rno_bags3+")" :""}</td><td><strong>Unloading Vendor - </strong></td><td>{form.values.RUnLoadingVendor}</td><td><strong>Net Weight - </strong></td><td>{form.values.RWbNetWt}</td></tr>
      
          <tr style={trstyle}><td></td><td></td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.RGunnyLessNetWt}</td></tr>

<tr style={trstyle}><td><strong>Printed on - </strong></td><td>{form.values.RInsDt}</td><td></td><td></td><td></td><td></td></tr>


     
          </table></td></tr>

</>
) }
         
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



/*
if (data.success) {
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
            StoPoNo:data.PickSlipDetails[0] ? data.PickSlipDetails[0].StoPoNo:"", 
            SendingStorageLocationName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].SendingStorageLocationName:"",
            DeliveryNo:data.PickSlipDetails[0] ? data.PickSlipDetails[0].DeliveryNo:"",
            Transporter:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].Transporter:"",
            Cont_No:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].ContainerNo:"",

            DeliveryDate:data.PickSlipDetails[0] ? data.PickSlipDetails[0].DeliveryDate:"",
            ReceivingPlantName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].ReceivingPlantName:"",
            PickSlipNo:data.PickSlipDetails[0] ? data.PickSlipDetails[0].PickSlipNo:"",
            ReceivingStorageLocationName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].ReceivingStorageLocationName:"",
            BagType:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagType:"",
            BagTypeName:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName:"",
            BagTypeName2:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName2:"",
            BagTypeName3:data.PickSlipDetails[0] ? data.PickSlipDetails[0].BagTypeName3:"",

            WbEmptyWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbEmptyWt:"",
            no_bags:data.PickSlipDetails[0] ? data.PickSlipDetails[0].no_bags:"",
            no_bags2:data.PickSlipDetails[0] ? data.PickSlipDetails[0].no_bags2:"",
            no_bags3:data.PickSlipDetails[0] ? data.PickSlipDetails[0].no_bags3:"",
            WbLoadWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbLoadWt:"",
            GunnyWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].GunnyWt:"",
            WbNetWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].WbNetWt:"",
            GunnyLessNetWt:data.PickSlipDetails[0] ? data.PickSlipDetails[0].GunnyLessNetWt:"",
            
            LoadingVendor:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadingVendor:"",
            LastMileTransporter:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LastMileTransporter:"",
            LoadedLotNo:data.intra_state_warehouse_dispatch_info[0] ? data.intra_state_warehouse_dispatch_info[0].LoadedLotNo:"",

            
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
             console.log("test 1")
             console.log(JSON.stringify(form.values));
             hideLoader();
             window.print();
        }
*/
