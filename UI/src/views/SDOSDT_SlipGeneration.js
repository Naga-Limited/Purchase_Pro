import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "./forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl,evaUrl } from "../urlConstants";
import { useLoader } from "../utility/hooks/useLoader";
import { addOption } from "./common/Utils";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "./forms/custom-button";
import { CardComponent } from "./common/CardComponent";
import moment from "moment"; 
////import SlipForm from "./SlipForm";
import { Row, Col,Button, Container } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "./forms/custom-form";

import { eadUrl,tblTRUCKUrl,BASE_URL } from "../urlConstants";
import { Printer } from "react-feather";
import SmartFormHeader from "./smartFormHeader";
import styled from "styled-components";

const SlipForm = ({ form,onSubmit }) => {
  const Container = styled.div`
  @media print {        
      display: none;        
  }`;

  const Container1 = styled.div`
  @media print {        
      margin-bottom: 300px;
  }`;
  const history = useHistory();
  const [imageDataFirst, setimageDataFirst] = useState([])
  const [imageDataSecond, setimageDataSecond] = useState([])
  const [Address, setAddress] = useState([])

  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      // onFetchSDIdetailsById();
      ImageData()
    }
  }, [id]);

  // Image_Data_Get
  const ImageData = () => {
  const fdata1 = { Purchase_ID: refid}
  apiPostMethod(`${apiBaseUrl}Master/Image_Data_Get`, fdata1)
    .then((response) => {
      const { data } = response;
      setimageDataFirst(response.data.image_first)
      setimageDataSecond(response.data.image_second)
      onFetchSDIdetailsById()
    })
  }
  const onFetchSDIdetailsById = () => {
    
    let fdata = {
      ID: refid,
      formType: "PRINTDET",
      plantIds:[],
      startCount:0
    };
    //showLoader();
    //alert("ok")
    apiPostMethod(tblTRUCKUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        let plant_id = data.results[0].WERKS;

        if (data.success) {
          form.setValues({
            ZVA_NUMBER:data.results[0].ZVA_NUMBER,
            TRUCK_NO:data.results[0].TRUCK_NO,
            GateOutDateTime:data.results[0].GateOutDateTime,
            CONTAINER_NO:data.results[0].CONTAINER_NO,
            ReceivingPlantName:data.results[0].PlantName,
            VADate:data.results[0].VaDate,
            StorageLocation:data.results[0].StorageLocation,
            ZPO_NUMBER:data.results[0].ZPO_NUMBER,
            ZSUPPLIER_NAME:data.results[0].ZSUPPLIER_NAME, 
            WheatVariety:data.results[0].IDNLF, 

            BROCKER_NAME:data.PODetails[0].BROCKER_NAME,
            NETPR:data.PODetails[0].NETPR, 

            Result:data.QualityInfo[0] ? data.QualityInfo[0].Result:"", 
            degrade:data.QualityInfo[0] ? data.QualityInfo[0].degrade: "", 
            deduction_amount:data.QualityInfo2[0] ? data.QualityInfo2[0].QCTotalDeductionApprovalAmount: "",
         
            //SupplierNoOfBags:data.GateoutInfo[0].deduction_amount,
            wb_ticket_no:data.GateoutInfo[0].wb_ticket_no,
            bag_type:data.GateoutInfo[0].bag_type,
            bag_type2:data.GateoutInfo[0].bag_type2,
            bag_type3:data.GateoutInfo[0].bag_type3,

            BagTypeName:data.GateoutInfo[0].BagTypeName,
            BagTypeName2:data.GateoutInfo[0].BagTypeName2,
            BagTypeName3:data.GateoutInfo[0].BagTypeName3,
            

            wb_empty_wt:data.GateoutInfo[0].wb_empty_wt,
            no_bags:data.GateoutInfo[0].no_bags,
            no_bags2:data.GateoutInfo[0].no_bags2,
            no_bags3:data.GateoutInfo[0].no_bags3,
            wb_load_wt:data.GateoutInfo[0].wb_load_wt,
            gunny_wt:data.GateoutInfo[0].gunny_wt,
            wb_net_wt:data.GateoutInfo[0].wb_net_wt,
            unload_lot:data.GateoutInfo[0].unload_lot,
            gunny_less_wt:data.GateoutInfo[0].gunny_less_wt,

            InvoiceDate:data.GateoutInfo[0].InvoiceDate,
            SupplierWBQty:data.GateoutInfo[0].supplier_wb_qty,
            TotalNoOfBags:(data.GateoutInfo[0].no_bags)+","+(data.GateoutInfo[0].no_bags2)+","+(data.GateoutInfo[0].no_bags3),
            SupplierInvoiceQty:data.SDIInfo[0] ? data.SDIInfo[0].ZSUPPLIER_INV_QTY: data.results[0].InvoiceQty,
            SupplierInvoiceNo:data.SDIInfo[0] ? data.SDIInfo[0].ZSUPPLIER_INV_NO:data.GateoutInfo[0].invoice_no,
            
            RakeNo:data.results[0].VEHICLE_TYPE=="Rake" && data.SDIInfo[0] ? data.SDIInfo[0].VEHICAL_NO : "",
            InvoiceDt: data.SDIInfo[0] ? data.SDIInfo[0].ZSUPPLIER_INV_DT : "",
            InvoiceRt: data.results[0] ? data.results[0].InvoiceRate : "",

            
            NoOFBags:data.GateoutInfo[0] ? data.GateoutInfo[0].TotalNoOfBags:"",

            WheatVarietyNo: data.QualityInfo[0] ? data.QualityInfo[0].wheat_variety:"",
            PrintOn:data.GateoutInfo[0].CurrentTime,
            GunnyWt:data.GateoutInfo[0].gunny_wt,
          
             })

             // console.log("test 1")
            // console.log(data.silotomillunload_gateout_info.length)
            
            //  window.print();
        }
        apiPostMethod(apiBaseUrl + `FCITruckController/AddressDetails/${plant_id}`)
        .then((response) => {
          setAddress(response.data.AddressDetails[0]);
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
  
  console.log("form:"+JSON.stringify(form))
  const trstyle={height:"40px"};
  const subheadingstyle1={textAlign:"center",fontSize:"18px"};
  const subheadingstyle2={textAlign:"left",fontSize:"18px"};
  const print = () => {
    window.print()
  }
  return (
   <div>
     <Container>
          <Button style={{ float: "right" }} color="white" size="sm"><Printer size={16} onClick={print} color="blue" /></Button>
      </Container>
     <table style={{width:"100%",height:"287mm",fontSize:"12px",border:"1px solid #000"}} border={0} >
       <tr><td>
     <table style={{width:"100%",fontSize:"12px"}} border={0} >
     <thead>
         <tr><td style={{padding:"0px"}} >
           
          
           {/* <table  style={{width:"100%"}} border={0}>
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
           </table> */}
         <SmartFormHeader data={Address} />
           </td></tr>
         {/*<tr><td style={{textAlign:"center"}}><strong>Unit Address</strong></td></tr>
         <tr><td style={{textAlign:"center"}}><strong>Stock Transfer Form</strong></td></tr>*/}
       </thead>
       <tbody>
        <tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
        <tr><td colSpan={6}><hr></hr></td></tr>
        <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><u><strong>Goods Received Note</strong></u></td></tr>
        <tr style={trstyle}>
          <td style={{width:"13%"}}><strong>Vehicle Arrival No - </strong></td> <td  style={{width:"20%"}}>{form.values.ZVA_NUMBER}</td>
          <td style={{width:"13%"}}><strong>Vehicle No - </strong></td> <td  style={{width:"20%"}}>{form.values.TRUCK_NO}</td>
        <td  style={{width:"13%"}}><strong>Vendor/Broker Name - </strong></td><td  style={{width:"20%"}}>{form.values.BROCKER_NAME}</td>
        
        </tr>

         <tr style={trstyle}><td  style={{width:"13%"}}><strong>Invoice Rate - </strong></td><td  style={{width:"20%"}}>{form.values.NETPR}</td><td><strong>Vehicle Arrival Date - </strong></td><td>{form.values.VADate}</td><td><strong>Supplier Name - </strong></td><td>{form.values.ZSUPPLIER_NAME}</td></tr>
         <tr style={trstyle}><td><strong>Supplier WB Qty - </strong></td><td>{form.values.SupplierWBQty}</td><td><strong>Container No - </strong></td><td>{form.values.CONTAINER_NO}</td><td><strong>Invoice Date - </strong></td><td>{form.values.InvoiceDate}</td></tr>
         <tr style={trstyle}><td><strong>No Of Bags - </strong></td><td>{form.values.NoOFBags}</td><td><strong>Rec Plant - </strong></td><td>{form.values.ReceivingPlantName}</td><td><strong>Supplier Inv Qty - </strong></td><td>{form.values.SupplierInvoiceQty}</td></tr>
         <tr style={trstyle}><td><strong>Gate out Date & Time - </strong></td><td>{form.values.GateOutDateTime}</td><td><strong>Rec.Str.Loc - </strong></td><td>{form.values. StorageLocation}</td><td><strong>Wheat Variety - </strong></td><td>{form.values.WheatVariety}</td></tr>
         <tr style={trstyle}><td><strong>PO No - </strong></td><td>{form.values.ZPO_NUMBER}</td><td><strong>PO Rate - </strong></td><td>{form.values.NETPR}</td><td><strong>Rake No</strong></td><td>{form.values.RakeNo}</td></tr>
         <tr><td><strong>Invoice No.</strong></td><td>{form.values.SupplierInvoiceNo}</td>
         <td></td><td></td>
        {/* <td><strong>Invoice Rate</strong></td><td>{form.values.InvoiceRt}</td>*/}
         </tr>
         <tr><td colSpan={6}><hr></hr></td></tr>
          </table></td></tr>

          

          <tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><u><strong>Quality Details - </strong></u></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Result - </strong></td><td style={{width:"20%"}}>{form.values.Result}</td><td style={{width:"13%"}}><strong>Degrade - </strong></td><td style={{width:"20%"}}>{form.values.degrade}</td><td style={{width:"13%"}}><strong>Wheat Variety - </strong></td><td style={{width:"20%"}}>{form.values.WheatVarietyNo}</td></tr>
          <tr style={trstyle}><td><strong>QC Deduction AMT - </strong></td><td>{form.values.deduction_amount}</td><td></td><td></td><td></td><td></td></tr>
                </table></td></tr>




{/*<tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
<tr><td colSpan={6}><hr></hr></td></tr>
<tr><td colSpan={6} ><strong>Rec Details - </strong></td></tr>
<tr><td style={{width:"13%"}}><strong>Ticket No - </strong></td><td style={{width:"20%"}}>{form.values.wb_ticket_no}</td><td style={{width:"13%"}}><strong>Bage Type - </strong></td><td style={{width:"20%"}}>{form.values.bag_type},{form.values.bag_type2},{form.values.bag_type3}</td><td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.wb_empty_wt}</td></tr>
<tr><td><strong>Ticket Date - </strong> </td><td>NA</td><td><strong>No of Bags - </strong></td><td>{form.values.TotalNoOfBags}</td><td>Load Weight</td><td>{form.values.wb_load_wt}</td></tr>
<tr><td><strong>Ticket Time - </strong></td><td>NA</td><td><strong>Gunny Weight - </strong></td><td>{form.values.GunnyWt}</td><td><strong>Net Weight - </strong></td><td>{form.values.wb_net_wt}</td></tr>
<tr><td><strong>Rec Plant Lot No - </strong></td><td>{form.values.unload_lot}</td><td><strong>GR No - </strong></td><td>NA</td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.gunny_less_wt}</td></tr>
<tr><td><strong>Unloading Vendor - </strong></td><td></td><td><strong>GR Date - </strong></td><td>NA</td><td></td><td></td></tr>
<tr><td><strong>Printed on - </strong></td><td>{form.values.PrintOn}</td><td></td><td></td><td></td><td></td></tr>
        </table></td></tr>*/}


<tr><td style={{padding:"5px"}}><table  style={{width:"100%"}} border={0}>
<tr><td colSpan={6}><hr></hr></td></tr>
          <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><u><strong>Receiving Details</strong></u></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Ticket No.</strong></td><td style={{width:"20%"}}>{form.values.wb_ticket_no>0?form.values.RWbTicketNumber:""}</td><td></td><td></td><td></td><td></td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 1</strong></td>
          <td style={{width:"20%"}}>{form.values.no_bags>0 ? form.values.BagTypeName+" ( Qty : "+form.values.no_bags+")" :""}</td>
          
          <td style={{width:"13%"}}><strong>Gunny Weight - </strong></td><td style={{width:"20%"}}>{form.values.GunnyWt}</td>
          <td style={{width:"13%"}}><strong>Empty Weight - </strong></td><td style={{width:"20%"}}>{form.values.wb_empty_wt}</td></tr>
          
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 2</strong></td><td style={{width:"20%"}}>{form.values.no_bags2>0 ? form.values.BagTypeName2+" ( Qty : "+form.values.no_bags2+")" :""}</td><td><strong>Rec. Lot No.</strong></td><td>{form.values.unload_lot}</td><td><strong>Load Weight - </strong></td><td>{form.values.wb_load_wt}</td></tr>
          <tr style={trstyle}><td style={{width:"13%"}}><strong>Bag 3</strong></td><td style={{width:"20%"}}>{form.values.no_bags3>0 ? form.values.BagTypeName3+" ( Qty : "+form.values.no_bags3+")" :""}</td><td><strong>Unloading Vendor - </strong></td><td></td><td><strong>Net Weight - </strong></td><td>{form.values.wb_net_wt}</td></tr>
      
          <tr style={trstyle}><td><strong>Printed on - </strong></td><td>{form.values.PrintOn}</td><td></td><td></td><td><strong>Gunny Less Net Weight - </strong></td><td>{form.values.gunny_less_wt}</td></tr>




     
          </table></td></tr>


         
       </tbody>
     </table>
     </td></tr>
     </table>
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


const SDOSDT_SlipGeneration = () => {
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

export default SDOSDT_SlipGeneration;
