import { Card, CardBody, FormGroup, Input, Row, Col, Button, CustomInput, CardHeader } from "reactstrap";

import React, { useEffect, useState,Fragment } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast,ShowToast } from "@helpers/appHelper";
import { apiBaseUrl,tblSTMUrl } from "../../urlConstants";
import { useHistory, useParams } from "react-router";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
//import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { useLoader } from "../../utility/hooks/useLoader";
//import { addOrUpdateGateOut, getReceivingGateOutValidationSchema, outSideValidation, uploadFile, uploadIfAnyFileExist } from "./common";
//import { PageHeaderText } from "../../../common/PageHeaderText";
//import { statusCode } from "../../../../helper/appHelper";
//import { addFileName, addOption } from "../../../common/Utils";
//import { getSelectedWbOption, WbTypeSelection, SendingWbTypeSelection, isOutSideWb } from "./wb-type-selection";
//import { SendingWeightDetails } from "./sending-weight-details";
//import { PickSlipDetails } from "./pickslip-details";
//import { HrLine } from "../../../common/HrLine";
import { CardComponent } from "../common/CardComponent";
import { date } from "yup";
import { ArrowLeft, Check } from "react-feather";
//import { LoadingDetails } from "./loading-details";
//import { WeightDetails } from "./weight-details";
//import PPModal from "../../../../@core/components/ppModel";
//import IasRedirect from "../ias-redirect";

let STMWeightEntryDetails = ({ data, setData, setTruckValue, setIsDisabled }) => {
  let history = useHistory();
  let [isOpen, setIsOpen] = useState();
  let { showLoader, hideLoader } = useLoader();
  let [dispatchDetails, setDispatchDetails] = useState();
  const [imageData, setImageData] = useState([])

  const [statusData, setStatusdata] = useState([]);

  const id = data?.ID ? data?.ID : data?.EMPTY_VEHICLE_ARRIVAL_ID
  const purchaseid = data?.PI_REFID ? data?.PI_REFID : 0
  const mode = data?.EMPTY_VEHICLE_ARRIVAL_ID ? 'Unload' : data?.EMPTY_VEHICLE_ARRIVAL_ID === null  ? 'Unload' : 'STM'
  const vehicleStatusId = data?.VEHICLE_STATUS


console.log(data)
  // let { id, purchaseid, mode } = useParams();
  //alert(id);
  //alert(mode);

  

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
   // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
  });
  
  let values = form.values;
  useEffect(() => {
    if (id||purchaseid) {
      getDetails();
    }
  }, [id||purchaseid]);

  useEffect(() => {
    const calculateNetWeight = () => {
      let NetWeight = 0;
      const firstWeight =form.values.FirstWeight1;
      const secondWeight =form.values.SecondWeight1;
      if (form.values.SecondWeight1 && secondWeight > 0) {
        if (form.values.Mode === "STM") {
          NetWeight = secondWeight - firstWeight;
        } else if (form.values.Mode === "Unload") {
          NetWeight = firstWeight - secondWeight;
        }
      }
      form.setFieldValue("netweight1", NetWeight);
    };

    calculateNetWeight();
  }, [form.values.FirstWeight1, form.values.SecondWeight1]);
  

  const getDetails = () => {
    let fdata = {
  
     ID:id,
     PurchaseInfoId:purchaseid,
     formType: "WEIGHTENTRYDET",
     plantIds:[],
     startCount:0

    };

    console.log(fdata);

    showLoader();
    //alert("ok")
    apiPostMethod(tblSTMUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
       // console.log(data.success);
        if (data.success) {
        //  alert(data.results.ZVA_NUMBER);
let PO_vehcileStatus=data.results[0] ? data.results[0].VECHICAL_STATUS : data.results[0].VECHICAL_STATUS;

console.log("vehcileStatus:"+PO_vehcileStatus);
          form.setValues({
            Id: data.results.PI_REFID,
            VANumber: data.results[0].ZVA_NUMBER,
            TRUCK_NO: data.results[0].TRUCK_NO,
            SCREEN_TYPE: data.results[0].SCREEN_TYPE,
            WERKS: data.results[0].WERKS ? data.results[0].WERKS : "",
            PLANT_ID:data.results[0].PLANT_ID,
            WeightId: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].Id : mode == 'Unload' && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].Id : "",
            Mode: mode,
            VEHICLE_STATUS: mode == 'STM' ? data.results[0].VEHICLE_STATUS : mode == 'Unload' ? PO_vehcileStatus : "",
            FirstWeight: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].FirstWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].FirstWeight : "",
            SecondWeight: mode == 'STM' && data.WeightDetails[0] ? data.WeightDetails[0].SecondWeight : mode == "Unload" && data.UnloadWeightDetails[0] ? data.UnloadWeightDetails[0].SecondWeight : "",

            FirstWeight1:mode=='STM' && data.WeightDetails[0] ? data.WeightDetails[0].FirstWeight:mode=="Unload" &&  data.UnloadWeightDetails[0]?data.UnloadWeightDetails[0].FirstWeight:"",
            SecondWeight1:mode=='STM' && data.WeightDetails[0] ? data.WeightDetails[0].SecondWeight:mode=="Unload" &&  data.UnloadWeightDetails[0]?data.UnloadWeightDetails[0].SecondWeight:"",
            Wheat_Varitry1: data?.results[0]?.SCREEN_TYPE === "IAS" ? data?.wheat[0]?.WheatVariety || "" : data?.results[0]?.IDNLF || ""|| data?.DispDetRecords[0]?.WheatVariety||"", 
            Unloading_Lot1: data?.results[0]?.SCREEN_TYPE === "IAS" ? data?.wheat[0]?.ReceivingBin_Name || "" : data?.wheat[0]?.unload_lot || ""||data?.DispDetRecords[0]?.ReceivingBin||"",
            
          });
          setStatusdata([{ options: data.VehStatus }]);
          document.getElementById("VANumber").disabled=true;
          form.setFieldValue("Status", {  label: data.results.StatusName,value: data.results.VECHICAL_STATUS });
          
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
  const goback = () => {
    setData("")
    setTruckValue("")
    setIsDisabled(false)
  }


  const onSubmit = () => {
    // alert("1");
       if (!form.isValid) {
         form.setSubmitting(true);
         form.validateForm();
         return;
       }
      
      
       //let formData = form.values;
       let NetWeight=0;
       if(form.values.SecondWeight && form.values.SecondWeight>0){
         if(form.values.Mode=="STM"){
        NetWeight=form.values.SecondWeight-form.values.FirstWeight;
         }
         if(form.values.Mode=="Unload"){
          NetWeight=form.values.FirstWeight-form.values.SecondWeight;
           }
       }
       console.log("Weight CHECK Y" + form.values.FirstWeight+"X");
       console.log("Weight CHECK Y" + form.values.SecondWeight+"X");
       let wt1 = parseFloat(form.values.FirstWeight);

      if(form.values.VEHICLE_STATUS=="23" && form.values.hasOwnProperty("FirstWeight") && (wt1<1000 || isNaN(wt1)) )
       {
        
         console.log("1st Weight Check" );
         
          console.log("1st Weight Error" );
          errorToast("1st Weight should be greater then 1000");
          return false;
       }

      else if(form.values.VEHICLE_STATUS=="24" && form.values.hasOwnProperty("SecondWeight"))
      {
        let wt2 = parseFloat(form.values.SecondWeight);
        console.log("2nd Weight Check" );
        if(wt2<1000 || isNaN(wt2))
        {
       console.log("2nd Weight Error" );
        errorToast("2nd Weight should be greater then 1000");
        return false;
        }
        if(wt2<wt1 && id>0 && purchaseid == 0)
        {
        errorToast("Please Check Weight Details...");
        return false;
        }
      }

     let formData ={
    
      VANumber:form.values.VANumber,
      FirstWeight:form.values.FirstWeight,
      SecondWeight:form.values.SecondWeight,
      NetWeight,
      FirstWeight1:form.values.FirstWeight1,
      SecondWeight1:form.values.SecondWeight1,
     }

     let ImageData ={
      empty_vehicle_arrailval_id:id,
      purchaseid:purchaseid,
      weight_type:form.values.VEHICLE_STATUS == "23" ? '1' : '2',
      weight_image_path:imageData,
     }
      
       const postdata = {
        Data:formData,
        WeightId:form.values.WeightId,
        Mode:form.values.Mode,
        purchaseid,
        id,
        VEHICLE_STATUS:form.values.VEHICLE_STATUS,
        SCREEN_TYPE:form.values.SCREEN_TYPE,
        WERKS:form.values.WERKS,
        ImageData:ImageData
       }
      // console.log(JSON.stringify(postdata));
    //  return false;
     
       let msg="Weight Details Entry"
       confirmDialog({
        title: "Are you sure want to Update?",
        description: msg,
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "Master/STMWeightEntry", postdata)
         .then((response) => {
         //  alert("4");
           const { data } = response;
           console.log(JSON.stringify(response))
           ShowToast("Saved Successfully...");
           form.resetForm();
           setIsDisabled(false)
           setData("")
           setTruckValue("")
          //  window.setTimeout( function() {
          //   window.location.reload();
          // }, 2000);
          //  history.push(`/STMWeightEntry`);
         })
         .catch((error) => {
           console.log(JSON.stringify(error))
           errorToast("Something went wrong, please try again after sometime");
         })
         .finally((a) => {
           hideLoader();
         });
        }
      }); 
     }
     
     var port;
     class SerialLEDController {
         constructor() {
             this.encoder = new TextEncoder();
             this.decoder = new TextDecoder();
         }
       //var port;
         async init() {
           console.log(navigator);
             if ('serial' in navigator) {
                 try {
                     port = await navigator.serial.requestPort();
                     await port.open({ baudRate: 2400 , bufferSize:500000, parity:"even",dataBits:7});
                     this.reader = port.readable.getReader();
                     this.writer = port.writable.getWriter();
                     let signals = await port.getSignals();
                     console.log(signals,'signals');
                     console.log(this.reader,'reader');
                     console.log(this.writer,'writer');
                     getSerialMessage();
                 }
                 catch (err) {
                     console.error('There was an error opening the serial port:', err);
                 }
             }
             else {
                 console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
                 console.error('chrome://flags/#enable-experimental-web-platform-features');
                 console.error('opera://flags/#enable-experimental-web-platform-features');
                 console.error('edge://flags/#enable-experimental-web-platform-features');
             }
         }
         async write(data) {
             const dataArrayBuffer = this.encoder.encode(data);
             return await this.writer.write(dataArrayBuffer);
         }
         async read() {
             try {
           var readerData ="";
           if(this.reader)
           {
             //this.reader.cancel();
             this.reader.releaseLock();
             //port.close();
           }
                     ////await port.open({ baudRate: 2400 , bufferSize:500000});
                     this.reader = port.readable.getReader();
                     //this.writer = port.writable.getWriter();
                     //let signals = await port.getSignals();
                     //console.log(signals);
           //while (true) {
             
             for(var i=0;i<10;i++)
             {
             const { value, done } = await this.reader.read();
     //			  this.reader.cancel();
             if (done==true) {
             // Allow the serial port to be closed later.
             this.reader.releaseLock();
             break;
             }
             
             if (value) {
               readerData+=this.decoder.decode(value);
             //console.log(value);
             }
           }
           //console.log(readerData);
          //  readerData=readerData.replace("\n","");
           console.log(readerData);
           var tmparr = readerData.split("\r\n");
           //console.log(tmparr.length);
           var lastvaluearr ;
           if(tmparr.length>3)
           {
            lastvaluearr = tmparr[tmparr.length-2].split(" ");
           }
           else
           {
            lastvaluearr = tmparr[0].split(" ");
           }

           console.log(lastvaluearr);
           lastvaluearr=lastvaluearr.filter(function (e1){
return e1 != null;
           });
           console.log(lastvaluearr);
           var lastweight=0;
           if(lastvaluearr.length>4)
           {
            lastweight=lastvaluearr[2];
           }
           document.getElementById("txtWeight").value=lastweight;
           console.log(tmparr[tmparr.length-2]);


           if(form.values.VEHICLE_STATUS=="23" && lastvaluearr.length > 4){
            form.setValues({...form.values,"FirstWeight":lastweight,"FirstWeight1":lastweight})
           }
           if(form.values.VEHICLE_STATUS=="24" && lastvaluearr.length > 4){
            form.setValues({...form.values,"SecondWeight":lastweight,"SecondWeight1":lastweight})
            }
                 //port.close();
             /*while(this.reader.available() > 0) {
               t = this.reader.read();
             }*/
           if(readerData!="")
                 {
             //return this.decoder.decode(readerData);
             return readerData;
           }
           else
           return "";
             }
             catch (err) {
                 const errorMessage = `error reading data: ${err}`;
                 ////console.error(errorMessage);
                 return errorMessage;
             }
         }
     }
   
   
     
  
     const serialLEDController = new SerialLEDController();
   
     const connect = document.getElementById('connect-to-serial');
   
     const getSerialMessages = document.getElementById('get-serial-messages');
     const messageForm = document.getElementById('message-form');
     const messageInput = document.getElementById('message-input');
     const submitButton = document.getElementById('submit-button');
     const serialMessagesContainer = document.getElementById('serial-messages-container');


     const getPort =() =>{
      
      serialLEDController.init();
  
    //  serialMessagesContainer.removeAttribute('disabled');
    //  messageInput.removeAttribute('disabled');
   //   submitButton.removeAttribute('disabled');
     }
     connect && connect.addEventListener('pointerdown', () => {
      
     
     });
     
     
   
     messageForm && messageForm.addEventListener('submit', event => {
       event.preventDefault();
       serialLEDController.write(event.target.firstElementChild.value);
       getSerialMessage();
     });
   
     getSerialMessages && getSerialMessages.addEventListener('pointerdown', async () => {
       getSerialMessage();
     });
   let a=0;
     async function getSerialMessage() {
   await serialLEDController.read();
       ////serialMessagesContainer.innerText += await serialLEDController.read() + '\n';
     if(a==0)
     {
     setInterval(function(){ getSerialMessage(); }, 1000);
     a=1;
     }
     }
   

     //Image fetch
     const getWeighmentImages = () => {
      getPort()
      const postData = {
        masterPlantId: form.values.PLANT_ID || form.values.WERKS,
        vaNumber: form.values.VANumber,
        movementType: 'Weighment',
        VEHICLE_STATUS:form.values.VEHICLE_STATUS
        // Weight: form.values.VEHICLE_STATUS == "23" ? 'FIRST' : 'SECOND'
      }
      // showLoader();
      apiPostMethod(apiBaseUrl + "Master/getWeighmentImages", postData)
        .then((response) => {
          const { data } = response;
          if (data.success == true) {
            console.log(data.data.cctvCameraImages);
            setImageData(data.data.cctvCameraImages)
          }
        })
    }
    const SiloToMillDeliveryDetails = () => {
      // alert("1");
         if (!form.isValid) {
           form.setSubmitting(true);
           form.validateForm();
           return;
         }
        
        
         //let formData = form.values;
         let NetWeight=0;
         if(form.values.SecondWeight && form.values.SecondWeight>0){
           if(form.values.Mode=="STM"){
          NetWeight=form.values.SecondWeight-form.values.FirstWeight;
           }
           if(form.values.Mode=="Unload"){
            NetWeight=form.values.FirstWeight-form.values.SecondWeight;
             }
         }
         console.log("Weight CHECK Y" + form.values.FirstWeight+"X");
         console.log("Weight CHECK Y" + form.values.SecondWeight+"X");
         let wt1 = parseFloat(form.values.FirstWeight);
  
        if(form.values.VEHICLE_STATUS=="23" && form.values.hasOwnProperty("FirstWeight") && (wt1<1000 || isNaN(wt1)) )
         {
          
           console.log("1st Weight Check" );
           
            console.log("1st Weight Error" );
            errorToast("1st Weight should be greater then 1000");
            return false;
         }
  
        else if(form.values.VEHICLE_STATUS=="24" && form.values.hasOwnProperty("SecondWeight"))
        {
          let wt2 = parseFloat(form.values.SecondWeight);
          console.log("2nd Weight Check" );
          if(wt2<1000 || isNaN(wt2))
          {
         console.log("2nd Weight Error" );
          errorToast("2nd Weight should be greater then 1000");
          return false;
          }
          if(wt2<wt1 && id>0 && purchaseid == 0)
          {
          errorToast("Please Check Weight Details...");
          return false;
          }
          if(NetWeight<0){
            errorToast("Please Check Weight Details...");
            return false;
          }
        }
  
       let formData ={
      
        VANumber:form.values.VANumber,
        FirstWeight:form.values.FirstWeight,
        SecondWeight:form.values.SecondWeight,
        NetWeight,
        FirstWeight1:form.values.FirstWeight1,
        SecondWeight1:form.values.SecondWeight1,
       }
  
       let ImageData ={
        empty_vehicle_arrailval_id:id,
        purchaseid:purchaseid,
        weight_type:form.values.VEHICLE_STATUS == "23" ? '1' : '2',
        weight_image_path:imageData,
       }
        
         const postdata = {
          Data:formData,
          WeightId:form.values.WeightId,
          Mode:form.values.Mode,
          purchaseid,
          id,
          VEHICLE_STATUS:form.values.VEHICLE_STATUS,
          SCREEN_TYPE:form.values.SCREEN_TYPE,
          WERKS:form.values.WERKS,
          ImageData:ImageData
         }
        // console.log(JSON.stringify(postdata));
      //  return false;
       
         let msg="Weight Details Entry"
         confirmDialog({
          title: "Are you sure want to Update?",
          description: msg,
        }).then((res) => {
          if (res) {
            showLoader();
            apiPostMethod(apiBaseUrl + "Sap/SiloToMillController/STMDelivery", postdata)
           .then((response) => {
             const { data } = response;
             console.log(data)
           if(data.success == true) {
            onSubmit1(postdata)
           }else{
            errorToast(data.message)
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
        }); 
       }
       const onSubmit1 = (postdata) => {
              showLoader();
              apiPostMethod(apiBaseUrl + "Master/STMWeightEntry", postdata)
             .then((response) => {
               const { data } = response;
               console.log(JSON.stringify(response))
               ShowToast("Saved Successfully...");
               form.resetForm();
               setIsDisabled(false)
               setData("")
               setTruckValue("")
             })
             .catch((error) => {
               console.log(JSON.stringify(error))
               errorToast("Something went wrong, please try again after sometime");
             })
             .finally((a) => {
               hideLoader();
             }); 
          };
          
  return (
    <Card>
      <CardHeader><h5>{vehicleStatusId == 23 ? "First Weight" : "Second Weight"}</h5></CardHeader>
      <hr />
      <CardBody>
        <Fragment>
          <Row>
            <Col md="4" sm="12">
              <CustomTextInput label={"VA Number"} form={form} id="VANumber" type="text" />
              {/* <CustomTextInput label={"VA Number"} form={form} id="VANumber" type="password" style={{ display: "none" }} /> */}
              {/* <input type="password" name="VANumber" id="VANumber" style={{display:"none"}}/> */}
              <CustomTextInput form={form} id="WeightId" type="hidden" />
            </Col>

            <Col md="4" sm="12">
              <CustomTextInput label={"Vehicle No"} form={form} id="TRUCK_NO" disabled type="text" />

            </Col>

            <Col md="2" sm="2">
              <div>
                <label>&nbsp;</label>
                <FormGroup style={{ m: 1, width: 150 }}>
                  <Button.Ripple color="primary" id="connect-to-serial" type="button" onClick={(e) => getWeighmentImages()}>
                    Connect to Scale
                  </Button.Ripple>
                </FormGroup>
              </div>
            </Col>

            {
  /*          <Button.Ripple color="primary" id="get-serial-messages"  type="button" >
            Get Weight
            </Button.Ripple>*/
          }
   
  
    <form id="message-form">
        <input style={{display:"none"}} type="text" id="message-input" disabled="true"></input>
        <button style={{display:"none"}} type="submit" id="submit-button" disabled="true">Send</button>
        <br></br><input type="hidden" id="txtWeight"  style={{fontSize:"24px"}}></input>
      </form>
      <div id="serial-messages-container"></div>
     
      {(form.values.VEHICLE_STATUS=="23" || form.values.VEHICLE_STATUS=="24") && <Col md="4" sm="12">
        <CustomTextInput label={"First Weight"} form={form} id="FirstWeight1" disabled={true} type="text"  />  
        

      </Col>}
      {form.values.VEHICLE_STATUS=="24" &&  <Col md="4" sm="12">
        <CustomTextInput label={"Second Weight"} form={form} id="SecondWeight1" disabled={true}  type="text"   />
        

      </Col>}
      {form.values.VEHICLE_STATUS=="24" &&  <Col md="4" sm="12">
        <CustomTextInput label={"Net Weight"} form={form} id="netweight1" disabled={true}  type="text"   />
        

      </Col>} {form.values.VEHICLE_STATUS=="24" && form.values.Wheat_Varitry1 && <Col md="4" sm="12">
        <CustomTextInput label={"Wheat Varitry"} form={form} id="Wheat_Varitry1" disabled={true}  type="text"   />
        

      </Col>} {form.values.VEHICLE_STATUS=="24" &&  form.values.Unloading_Lot1 && <Col md="4" sm="12">
        <CustomTextInput label={"Unloading Lot/ReceivingBin"} form={form} id="Unloading_Lot1" disabled={true}  type="text"   />
        

      </Col>}
      <Col md="12" sm="12" >
            <Row>
              {imageData.map(imageData => (
                <Col md="3" sm="12" key={imageData.imageUrl}>
                  <div>
                    <img src={imageData.imageUrl} alt="" style={{ m: 1, width: 130 }} />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
    </Row>
    <br />
    <Row>
      <Col md="11" sm="12">
      <Button.Ripple outline color="secondary" onClick={(e) => goback()} type="reset" className="mr-2">
                          Cancel
                        </Button.Ripple>
              <input type="password" name="FirstWeight" id="FirstWeight" style={{display:"none"}} />
              <input type="password" name="SecondWeight" id="SecondWeight" style={{display:"none"}} />
      </Col>
      <Col md="1" sm="12">
      <Button.Ripple color="primary" type="button" onClick={(e) => (form?.values?.SCREEN_TYPE == 'SILOTOMILL' && mode == 'STM' && form?.values?.VEHICLE_STATUS == "24") ? SiloToMillDeliveryDetails() : onSubmit()}>
                Submit
              </Button.Ripple>
    
      </Col>
   </Row>
   
  </Fragment>
  </CardBody>
  </Card>

  
  );
};

export default STMWeightEntryDetails;
