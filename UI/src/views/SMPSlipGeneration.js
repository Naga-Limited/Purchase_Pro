import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "./forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, evaUrl } from "../urlConstants";
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

import { eadUrl, tblSTMUrl, BASE_URL } from "../urlConstants";
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
  const [imageDataFirst, setimageDataFirst] = useState([])
  const [imageDataSecond, setimageDataSecond] = useState([])
  const [Address, setAddress] = useState([])

  let { id } = useParams();
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
      formType: "QCDET",
      plantIds: [],
      startCount: 0
    };
    // Image_Data_Get
    const fdata1 = { ID: refid}
    apiPostMethod(`${apiBaseUrl}Master/Image_Data_Get`, fdata1)
      .then((response) => {
        const { data } = response;
        setimageDataFirst(response.data.image_first)
        setimageDataSecond(response.data.image_second)

    
    //showLoader();
    //alert("ok")
    apiPostMethod(tblSTMUrl, fdata)
      .then((response) => {
        const { data } = response;
        let plant_id = data.results[0].PLANT_NAME;
        if (data.success) {

          form.setValues({
            ZVA_NUMBER: data.results[0].ZVA_NUMBER,
            TRUCK_NO: data.results[0].TRUCK_NO,
            GateOutDateTime: data.results[0].GateOutDateTime,
            PickslipDateTime: data.results[0].PickslipDateTime,
            VADate: data.results[0].VADate,
            SendingPlantName: data.results[0].PLANT_NAME,
            ZSUPPLIER_INV_NO: data.results[0].ZSUPPLIER_INV_NO,

            MM2_3: data.QCData[0] ? data.QCData[0].MM23 : "",
            Kernel1000: data.QCData[0] ? data.QCData[0].Kernel1000 : "",
            Ash: data.QCData[0] ? data.QCData[0].Ash : data.QualityInfo[0].ash_quality,
            BadSmell: data.QCData[0] ? data.QCData[0].BadSmell : data.QualityInfo[0].Bad_smell,
            BlackWheat: data.QCData[0] ? data.QCData[0].BlackWheat : data.QualityInfo[0].black_wheat_quality,
            BrokenWheat: data.QCData[0] ? data.QCData[0].BrokenWheat : data.QualityInfo[0].broken_wheat_quality,
            Drygluten: data.QCData[0] ? data.QCData[0].Drygluten : data.QualityInfo[0].dry_gluten_quality,
            Dust: data.QCData[0] ? data.QCData[0].Dust : data.QualityInfo[0].dust_quality,
            FM: data.QCData[0] ? data.QCData[0].FM : "",
            FN: data.QCData[0] ? data.QCData[0].FN : data.QualityInfo[0].fn_quality,
            ForeignMatter: data.QCData[0] ? data.QCData[0].ForeignMatter : data.QualityInfo[0].foreign_matter_quality,
            HLWeight: data.QCData[0] ? data.QCData[0].HLWeight : data.QualityInfo[0].hl_quality,
            ImmatureWheat: data.QCData[0] ? data.QCData[0].ImmatureWheat : data.QualityInfo[0].immature_wheat_quality,
            Infestation: data.QCData[0] ? data.QCData[0].Infestation : data.QualityInfo[0].infestation_quality,
            InsectDamageWheat: data.QCData[0] ? data.QCData[0].InsectDamageWheat : data.QualityInfo[0].insect_damage_wheat_quality,
            KernalBunt: data.QCData[0] ? data.QCData[0].KernalBunt : data.QualityInfo[0].kernel_bunt_quality,
            MixedWheat: data.QCData[0] ? data.QCData[0].MixedWheat : data.QualityInfo[0].mixed_wheat_quality,
            Moisture: data.QCData[0] ? data.QCData[0].Moisture : data.QualityInfo[0].moisture_quality,
            MudBalls: data.QCData[0] ? data.QCData[0].MudBalls : data.QualityInfo[0].mudballs_quality,
            OFG: data.QCData[0] ? data.QCData[0].OFG : data.QualityInfo[0].ofg_quality,
            Protein: data.QCData[0] ? data.QCData[0].Protein : data.QualityInfo[0].protein_quality,
            ProteinType: data.QCData[0] ? data.QCData[0].ProteinType : data.QualityInfo[0].protein_type_quality,
            RainDamage: data.QCData[0] ? data.QCData[0].RainDamage : data.QualityInfo[0].rain_damage_quality,
            RainGrain: data.QCData[0] ? data.QCData[0].RainGrain : "",
            SV: data.QCData[0] ? data.QCData[0].SV : data.QualityInfo[0].sv_quality,
            SeiveSize: data.QCData[0] ? data.QCData[0].SeiveSize : data.QualityInfo[0].seive_size_quality,
            ShriveledWheat: data.QCData[0] ? data.QCData[0].ShriveledWheat : data.QualityInfo[0].shriveled_wheat_quality,
            SoftWheat: data.QCData[0] ? data.QCData[0].SoftWheat : data.QualityInfo[0].soft_wheat_quality,
            Wetgluten: data.QCData[0] ? data.QCData[0].Wetgluten : data.QualityInfo[0].wet_gluten_quality,
            fungus: data.QCData[0] ? data.QCData[0].fungus : data.QualityInfo[0].fungus_quality,




            WheatVariety: data.DispDetRecords[0].WheatVariety,

            StoPoNo: data.DispDetRecords[0].ZPO_NUMBER,
            SendingStorageLocationName: data.DispDetRecords[0].StorageLocation,
            DeliveryNo: data.DispDetRecords[0].DeliveryNo,
            EwayBillNo: data.DispDetRecords[0].EwayBillNo,
            Transporter: data.DispDetRecords[0].Transporter,
            DeliveryDate: data.DispDetRecords[0].DeliveryDate,
            ReceivingPlantName: data.DispDetRecords[0].ReceivingPlantName,
            PickSlipNo: data.DispDetRecords[0].PickSlipNo,
            ReceivingStorageLocationName: data.DispDetRecords[0].ReceivingStorageLocationName,
            BagType: data.DispDetRecords[0].BagType,
            WbEmptyWt: data.DispDetRecords[0] ? data.DispDetRecords[0].FirstWeight : "",
            no_bags: data.DispDetRecords[0].no_bags,
            no_bags2: data.DispDetRecords[0].no_bags2,
            no_bags3: data.DispDetRecords[0].no_bags3,
            WbLoadWt: data.DispDetRecords[0] ? data.DispDetRecords[0].SecondWeight : "",
            GunnyWt: "0",
            WbNetWt: data.DispDetRecords[0] ? data.DispDetRecords[0].NetWeight : "",
            GunnyLessNetWt: data.DispDetRecords[0] ? data.DispDetRecords[0].NetWeight : "",

            LoadingVendor: data.DispDetRecords[0].LoadingVendor,
            LastMileTransporter: data.DispDetRecords[0].LastMileTransporter,
            LoadedLotNo: data.DispDetRecords[0].LoadedLotNo,
            ReceivingBin: data.DispDetRecords[0].ReceivingBin,


            intrastate_gateout_infoCount: data.silotomillunload_gateout_info ? data.silotomillunload_gateout_info.length : 0,

            RWbTicketNumber: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].WbTicketNumber : "",
            RReceivingBin: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].ReceivingBin : "",
            RBagType: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].BagType : "",
            RWbEmptyWt: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].SecondWeight : "",
            RWbLoadWt: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].FirstWeight : "",
            RGunnyWt: "",
            RWbNetWt: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].NetWeight : "",
            RUnloadedLotNo: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].UnloadedLotNo : "",
            RUnLoadingVendor: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].UnLoadingVendor : "",
            RGunnyLessNetWt: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].NetWeight : "",
            RInsDt: data.silotomillunload_gateout_info[0] ? data.silotomillunload_gateout_info[0].InsDt : "",

            Bad_smells: (data.qmResults[0] && data.qmResults[0].UOM) ? data.qmResults[0].MIC_DESC +' ('+ data.qmResults[0].UOM + ')': "Bad_smell",
            Dusts: data.qmResults[1] ? data.qmResults[1].MIC_DESC +' ('+ data.qmResults[1].UOM + ')': "Dust",
            Seive_Sizes: data.qmResults[2] ? data.qmResults[2].MIC_DESC +' ('+ data.qmResults[2].UOM + ')': "Seive Size",
            Infestations: (data.qmResults[3] && data.qmResults[3].UOM) ? data.qmResults[3].MIC_DESC +' ('+ data.qmResults[3].UOM + ')': "Infestation",
            Proteins: data.qmResults[4] ? data.qmResults[4].MIC_DESC +' ('+ data.qmResults[4].UOM + ')': "Protein",
            Moistures: data.qmResults[5] ? data.qmResults[5].MIC_DESC +' ('+ data.qmResults[5].UOM + ')': "Moisture",
            Ashs: data.qmResults[6] ? data.qmResults[6].MIC_DESC +' ('+ data.qmResults[6].UOM + ')': "Ash",
            Wet_glutens: data.qmResults[7] ? data.qmResults[7].MIC_DESC.slice(0, -1) +' ('+ data.qmResults[7].UOM + ')': "Wet gluten",
            Dry_glutens: data.qmResults[8] ? data.qmResults[8].MIC_DESC.slice(0, -1) +' ('+ data.qmResults[8].UOM + ')': "Dry gluten",
            sv_qualitys: data.qmResults[9] ? data.qmResults[9].MIC_DESC +' ('+ data.qmResults[9].UOM + ')': "SV",
            hl_qualityS: data.qmResults[10] ? data.qmResults[10].MIC_DESC +' ('+ data.qmResults[10].UOM + ')': "HL",
            Foreign_matters: (data.qmResults[11] && data.qmResults[11].UOM) ? data.qmResults[11].MIC_DESC +' ('+ data.qmResults[11].UOM + ')': "Foreign Matter",

          })
          console.log("test 1")
          console.log(data.silotomillunload_gateout_info.length)
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

  console.log("form:" + JSON.stringify(form));
  const trstyle = { height: "40px" };
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
      <table style={{ width: "100%", height: "287mm", fontSize: "12px", border: "1px solid #000" }} border={0} >
        <thead>
          <tr><td style={{ padding: "0px" }} >

          <SmartFormHeader data={Address} />
            {/* <table style={{ width: "100%" }} border={0}>
              <tr>
                <td>
                  <img style={{ width: "150px", height: "auto" }} src={BASE_URL + "/api/upload/images/Address.png"}></img>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "24px" }}><strong>NAGA LIMITED</strong></span><br></br>
                  <span style={{ fontSize: "18px" }}><strong>FOODS DIVISION</strong></span><br></br>

                  <span style={{ fontSize: "14px" }}><strong>FSSAI Lic No 10019042005019</strong></span><br></br>
                  <span style={{ fontSize: "13px" }}>Branch/Depot:Naga Limited-Foods,No.1,Trichy Road,Dindigul - 624005<br></br>
                    Ph:0451-2411123/2410121,Mo:9944990043,7708111317,7708111321 Fax: 2410122<br></br>
                    GSTIN:33AAACN2369L1zD,PAN:AAACN2369L,CIN:U24246TN1991PLC020409, State Code:3310017<br></br></span>

                </td>
                <td style={{ textAlign: "right" }}>
                  <img style={{ width: "240px", height: "auto", marginBottom: "-23px" }} src={BASE_URL + "/api/upload/images/Logo2.png"}></img>
                </td></tr>
            </table> */}
          </td></tr>
          {/*<tr><td style={{textAlign:"center"}}><strong>Unit Address</strong></td></tr>
         <tr><td style={{textAlign:"center"}}><strong>Stock Transfer Form</strong></td></tr>*/}
        </thead>
        <tbody>
          <tr ><td><hr></hr></td></tr>
          <table style={{ width: "100%", height: "20mm", fontSize: "12px", border: "1px", paddingTop: "5px", paddingBottom: "10px",textAlign:"center" }} border={0} >
                  <tr style={trstyle}><td colSpan={6} style={subheadingstyle1}><strong>{'Stock Transfer Form'}</strong></td></tr>
                  <span style={{ fontSize: "15px",textAlign:'center'}}><strong>Sending Plant -</strong>{form.values.SendingPlantName}  </span>
                  <span style={{ fontSize: "15px",textAlign:'center'}}><strong>| Receiving Plant -</strong>{form.values.ReceivingPlantName} </span><br></br>
                  </table>
          <br /> <hr />
          <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
            <tr style={trstyle}><td style={{ width: "13%" }}><strong>VA No</strong></td> <td style={{ width: "20%" }}>{form.values.ZVA_NUMBER}</td><td style={{ width: "13%" }}><strong>Wheat Variety</strong></td><td style={{ width: "20%" }}>{form.values.WheatVariety}</td><td style={{ width: "13%" }}><strong>Sending Plant</strong></td><td style={{ width: "20%" }}>{form.values.SendingPlantName}</td></tr>
            <tr style={trstyle}><td><strong>VA Date</strong></td><td>{form.values.VADate}</td><td><strong>STO PO No</strong></td><td>{form.values.StoPoNo}</td><td><strong>Sending Str. Loc.</strong></td><td>{form.values.SendingStorageLocationName}</td></tr>
            <tr style={trstyle}><td><strong>Vehicle No</strong></td><td>{form.values.TRUCK_NO}</td><td><strong>Delivery No</strong></td><td>{form.values.DeliveryNo}</td><td><strong>Delivery Date</strong></td><td>{form.values.DeliveryDate}</td></tr>
            <tr style={trstyle}><td><strong>Rec. Plant</strong></td><td>{form.values.ReceivingPlantName}</td><td><strong>Rec. Storage Loc.</strong></td><td>{form.values.ReceivingStorageLocationName}</td><td><strong>Receiving Bin</strong></td><td>{form.values.ReceivingBin}</td></tr>

            <tr style={trstyle}><td><strong>Gate Out Date & Time</strong></td><td>{form.values.GateOutDateTime}</td><td><strong>Eway Bill No</strong></td><td>{form.values.EwayBillNo}</td></tr>
          </table>
          </td></tr>
          <tr><td ><hr></hr></td></tr>


          <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
            <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><u><strong>Quality Check</strong></u></td></tr>
            <tr style={trstyle}>
              <td style={{ width: "13%" }}><strong>{'Protein (%)'}</strong></td>
              <td style={{ width: "20%" }}>{form.values.Protein}</td>
              <td style={{ width: "13%" }}><strong>{'Moisture (%)'}</strong></td><td style={{ width: "20%" }}>{form.values.Moisture}</td>
              <td style={{ width: "13%" }}><strong>{'	Ash (%)'}</strong></td><td style={{ width: "20%" }}>{form.values.Ash}</td>
            </tr>
            <tr style={trstyle}>
              <td ><strong>{'Wet gluten (%)'}</strong></td> <td >{form.values.Wetgluten}</td>
              <td><strong>{'Dry gluten (%)'}</strong></td><td>{form.values.Drygluten}</td>
              <td><strong>{'SV (ml)'}</strong></td><td>{form.values.SV}</td>
            </tr>
            <tr style={trstyle}>
              <td ><strong>{'Infestation'}</strong></td> <td >{form.values.Infestation}</td>
              <td><strong>{'HL (kg/hl)'}</strong></td><td>{form.values.HLWeight}</td>
              <td><strong>{'Foreign Matter (%)'}</strong></td><td>{form.values.ForeignMatter}</td>
            </tr>

            <tr style={trstyle}>
              <td ><strong>{'Bad_smell'}</strong></td> <td >{form.values.BadSmell}</td>
              <td><strong>{'Dust (%)'}</strong></td><td>{form.values.Dust}</td>
              <td><strong>{'Sieve Size (mm)'}</strong></td><td>{form.values.SeiveSize}</td>
            </tr>

          </table></td></tr>


          <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
            <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><u><strong>Sending WB Details</strong></u></td></tr>
            <tr style={trstyle}><td style={{ width: "13%" }}><strong>Empty Weight (Kgs)</strong></td>
              <td style={{ width: "20%" }}>{form.values.WbEmptyWt}</td>
              <td style={{ width: "13%" }}><strong>Load Weight (Kgs)</strong></td><td style={{ width: "20%" }}>{form.values.WbLoadWt}</td>
              <td style={{ width: "13%" }}><strong>Net Weight (Kgs)</strong></td><td style={{ width: "20%" }}>{form.values.WbNetWt}</td>
            </tr>

            <tr style={trstyle}><td><strong>Printed on</strong></td><td>{form.values.GateOutDateTime}</td><td></td><td></td><td></td><td></td></tr>
            <tr style={trstyle}><td>WH Incharge Sign</td><td></td><td></td><td></td><td>Security Sign</td><td></td></tr>
          </table></td></tr>

          {form.values.intrastate_gateout_infoCount > 0 && (
            <>

              <tr style={trstyle}><td><hr></hr></td></tr>

              <tr><td style={{ padding: "5px" }}><table style={{ width: "100%" }} border={0}>
                <tr style={trstyle}><td colSpan={6} style={subheadingstyle2}><u><strong>Receiving WB Details</strong></u></td></tr>
                <tr style={trstyle}>
                  <td style={{ width: "13%" }}><strong>Empty Weight (Kgs)</strong></td><td style={{ width: "20%" }}>{form.values.RWbEmptyWt}</td>
                  <td style={{ width: "13%" }}><strong>Load Weight (Kgs)</strong></td><td style={{ width: "20%" }}>{form.values.RWbLoadWt}</td>
                  <td style={{ width: "13%" }}><strong>Net Weight (Kgs)</strong></td><td style={{ width: "20%" }}>{form.values.RWbNetWt}</td>
                </tr>
                <tr style={trstyle}><td><strong>Receiving Bin</strong></td><td>{form.values.RReceivingBin}</td></tr>

                <tr style={trstyle}><td><strong>Printed on</strong></td><td>{form.values.RInsDt}</td><td></td><td></td><td></td><td></td></tr>
              </table></td></tr>
            </>
          )}

        </tbody>
      </table>
      {/* <div className='pagebreak'></div> */}
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


const SMPSlipGeneration = () => {
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

export default SMPSlipGeneration;
