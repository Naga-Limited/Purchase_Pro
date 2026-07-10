import React, { Fragment, useEffect,useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, CustomUploader,validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl,uploadandSaveImageUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast,ShowToast  } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
////import WareHouseRenew from "./WareHouseRenew";
import { Row, Col,Button, Label, Input  } from "reactstrap";
import Master_new_warehouse_list from "./List/Master_new_warehouse_list";
import { WHMaster_ListUrl } from "../../../urlConstants";
import CaptureImage from "../../CaptureImage";
import Uploader from "../../Uploader";
import { DatePicker } from "../../forms/custom-datetime";
import Select from "react-select";

const WareHouseRenew = () => {

  const [attachedFiles, setAttachment] = useState({ wb1_stamping_certificate_attachment: {}, wb2_stamping_certificate_attachment: {},License_Copy_Attachment1: {}, License_Copy_Attachment2: {}, License_Copy_Attachment3: {} ,Statutory_Type_Attachment: {}   });

const generalinfoOptions = [
  {
    options: [
      { value: "Available", label: "Available" },
      { value: "Not Available", label: "Not Available" },
    ],
  },
];
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      onFetchwarehousecreationdetailsByid();
    }
  }, [id]);
  const handleFileChange = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };
  const onFetchwarehousecreationdetailsByid = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            wh_refid:data.results[0].wh_refid,
            wh_code:data.results[0].wh_code,
            wh_name:data.results[0].wh_name,
            whaddress:data.results[0].whaddress,
            street:data.results[0].street,
            district:data.results[0].district,
            state:data.results[0].state,
            whlat:data.results[0].whlat,
            whlong:data.results[0].whlong,
            ownertype:data.results[0].ownertype,
            owneraddress:data.results[0].owneraddress,
            ownerstreet:data.results[0].ownerstreet,
            ownerdistrict:data.results[0].ownerdistrict,
            ownerstate:data.results[0].ownerstate,
            ownerlandlineno:data.results[0].ownerlandlineno,
            ownermobileno:data.results[0].ownermobileno,
            ownermailid:data.results[0].ownermailid,
            totalcapacityinmts:data.results[0].totalcapacityinmts,
            totalcapacityinsqft:data.results[0].totalcapacityinsqft,
            outsideareacapacitymts:data.results[0].outsideareacapacitymts,
            outsideareacapacityinsqft:data.results[0].outsideareacapacityinsqft,
            contractstartdate:data.results[0].contractStartDt,
            contractenddate:data.results[0].contractEndDt,
            whcity:data.results[0].whcity,
            whpincode:data.results[0].whpincode,
            ownername:data.results[0].ownername,
            ownerpincode:data.results[0].ownerpincode,
            ownercity:data.results[0].ownercity,
            ownerfaxnumber:data.results[0].ownerfaxnumber,
            pillarinfo:data.results[0].pillarinfo,
            advancevalueaftertds:data.results[0].advancevalueaftertds,
            rentduedate:data.results[0].rentdueDt,
            name_of_collateral:data.results[0].name_of_collateral,
            name_of_bank:data.results[0].name_of_bank,
            /*naga_pwh_insurance_no:data.results[0].naga_pwh_insurance_no,
            /naga_pwh_insurance_attachment:data.results[0].naga_pwh_insurance_attachment,
            insurance_covered_amt:data.results[0].insurance_covered_amt,
            insurance_premium_amt:data.results[0].insurance_premium_amt,
            insurance_period:data.results[0].insurance_period,
            insurance_company:data.results[0].insurance_company,
            gst_registration:data.results[0].gst_registration,*/
            company_name:data.results[0].company_name,
            godown_type:data.results[0].godown_type,
            contract_agreement_attachment:data.results[0].contract_agreement_attachment,
            gst_type:data.results[0].gst_type,
            effective_from:data.results[0].effective_from,
            effective_to:data.results[0].effective_to,
            cost_centre:data.results[0].cost_centre,
            gl_account:data.results[0].gl_account,
            rentpersqft:data.results[0].rentpersqft,
            rentpermonth:data.results[0].rentpermonth,
            lockingperiodinmonths:data.results[0].lockingperiodinmonths,
            noticeperiodinmonths:data.results[0].noticeperiodinmonths,
            contracttype:data.results[0].contracttype,
            servicechargespwh:data.results[0].servicechargespwh,
            bankname:data.results[0].bankname,
            bankbranch:data.results[0].bankbranch,
            bankcity:data.results[0].bankcity,
            bankdistrict:data.results[0].bankdistrict,
            bankstate:data.results[0].bankstate,
            bankpincode:data.results[0].bankpincode,
            bankaccountno:data.results[0].bankaccountno,
            bankifsc:data.results[0].bankifsc,
            wb_count:data.results[0].wb_count,
            wb_1_name:data.results[0].wb_1_name,
            wb_2_name:data.results[0].wb_2_name,
            wb1_capacity_in_mts:data.results[0].wb1_capacity_in_mts,
            wb2_capacity_in_mts:data.results[0].wb2_capacity_in_mts,
            wb1_stamping_certificate_attachment:data.results[0].wb1_stamping_certificate_attachment,
            wb2_stamping_certificate_attachment:data.results[0].wb2_stamping_certificate_attachment,
            wb1_stamping_startdate:data.results[0].wb1_stamping_start_date,
            wb1_stamping_enddate:data.results[0].wb1_stamping_end_date,
            wb2_stamping_enddate:data.results[0].wb2_stamping_start_date,
            wb2_stamping_enddate:data.results[0].wb2_stamping_end_date,
            insurancestartdate:data.results[0].insurancestartdate,
            insuranceexpirydate:data.results[0].insuranceexpirydate,
            separate_electric_meters:data.results[0].separate_electric_meters,
            electric_plug_points_inside:data.results[0].electric_plug_points_inside,
            electric_light_points_inside:data.results[0].electric_light_points_inside,
            electric_light_points_inside:data.results[0].electric_light_points_outside,
            electric_plug_points_outside:data.results[0].electric_plug_points_outside,
            drinking_water_facility:data.results[0].drinking_water_facility,
            no_of_fire_extinguisher:data.results[0].no_of_fire_extinguisher,
            borewell_facility:data.results[0].borewell_facility,
            toilet_facility:data.results[0].toilet_facility,
            water_connection:data.results[0].water_connection,
            year_of_construction:data.results[0].year_of_construction,
            warehouse_security:data.results[0].warehouse_security,
            naga_security:data.results[0].naga_security,
            boundary_wall:data.results[0].boundary_wall,
            distance_railway_goods_shed:data.results[0].distance_railway_goods_shed,
            Distance_Mandi:data.results[0].Distance_Mandi,
            Distance_National_Highways:data.results[0].Distance_National_Highways,
            Distance_FCI_Procurement_Point:data.results[0].Distance_FCI_Procurement_Point,
            Distance_State_Highways:data.results[0].Distance_State_Highways,
            Distance_Pucca:data.results[0].Distance_Pucca,
            Statutory_Survey_Type:data.results[0].Statutory_Survey_Type,
            Statutory_Type_Attachment:data.results[0].Statutory_Type_Attachment,
            license_no_1:data.results[0].License_No_1,
            License_Copy_Attachment1:data.results[0].License_Copy_Attachment1,
            license_no_2:data.results[0].License_No_2,
            License_Copy_Attachment2:data.results[0].License_Copy_Attachment2,
            license_no_3:data.results[0].License_No_3,
            License_Copy_Attachment3:data.results[0].License_Copy_Attachment3,
            Independent_Gate:data.results[0].Independent_Gate,
            Wall_Type:data.results[0].Wall_Type,
            Shutter_Count:data.results[0].Shutter_Count,
            Plinth:data.results[0].Plinth,
            No_of_Exits:data.results[0].No_of_Exits,
            Roof_Type:data.results[0].Roof_Type,
            Door_Count:data.results[0].Door_Count,
            Floor_Height:data.results[0].Floor_Height,
            WH_Photograph_Attachment:data.results[0].WH_Photograph_Attachment,
            Floor_Type:data.results[0].Floor_Type,
            Window_Count:data.results[0].Window_Count,
            Height_From_Adj_Land:data.results[0].Height_From_Adj_Land,
            Inside_Road_Type:data.results[0].Inside_Road_Type,
            Inside_Heavy_Vehicle_Mvmt:data.results[0].Inside_Heavy_Vehicle_Mvmt,
            Inside_No_Of_Truck_In_Capacity:data.results[0].Inside_No_Of_Truck_In_Capacity,
            Repair_Work_Remarks:data.results[0].Repair_Work_Remarks,
            Latest_Audit_Date:data.results[0].Latest_Audit_Date,
            Next_Audit_Due_Date:data.results[0].Next_Audit_Due_Date,
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
  const RefreshPage = () => {
    history.push(`/warehouse/masters/WareHouseRenew:`+refid);
  };
  const getStateFromDistrict = (e,type) => {
    const { value, label } = e;
    let fdata = { DistName:label,DistId:value };
    apiPostMethod(apiBaseUrl+'warehouse/master/getStateName', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          if(type==1){
         form.setFieldValue('district', {  label:label,value: value });
          form.setFieldValue('state', {  label: data.results[0].label,value: data.results[0].value });
          }
          if(type==2){
            form.setFieldValue('ownerdistrict', {  label:label,value: value });
             form.setFieldValue('ownerstate', {  label: data.results[0].label,value: data.results[0].value });
             }
             if(type==3){
              form.setFieldValue('bankdistrict', {  label:label,value: value });
               form.setFieldValue('bankstate', {  label: data.results[0].label,value: data.results[0].value });
               }
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
const [ImgData, setImgData] = useState({});
/*const [attachedFiles, setAttachment] = useState({ 
  Statutory_Type_Attachment: {},
  wb1_stamping_certificate_attachment: {},
  wb2_stamping_certificate_attachment: {},
  License_Copy_Attachment3: {},
  License_Copy_Attachment2: {},
  License_Copy_Attachment1: {},
});*/

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
 
      //wh_code: validation.required({ message:"WH CODE should not be empty", isObject: false }),
      wh_name: validation.required({ message:"WAREHOUSE NAME should not be empty", isObject: false }),
      godown_type: validation.required({ message:"GODOWN TYPE should not be empty", isObject: false }),
      whaddress: validation.required({ message:"WAREHOUSE ADDRESS should not be empty", isObject: false }),
      street: validation.required({ message:"STREET should not be empty", isObject: false }),
      whcity: validation.required({ message:"CITY should not be empty", isObject: false }),
      whpincode: validation.required({ message:"PINCODE should not be empty", isObject: false }),
      district: validation.required({ message:"DISTRICT NAME should not be empty", isObject: true }),
      state: validation.required({ message:"STATE NAME should not be empty", isObject: true }),
      whlat: validation.required({ message:"WAREHOUSE LATITUTE should not be empty", isObject: false }),
      whlong: validation.required({ message:"WAREHOUSE LONGTITUDE should not be empty", isObject: false }),
      ownertype: validation.required({ message:"OWNER TYPE should not be empty", isObject: false }),
      ownername: validation.required({ message:"OWNER NAME should not be empty", isObject: false }),
      owneraddress: validation.required({ message:"OWNER ADDRESS should not be empty", isObject: false }),
      ownerstreet: validation.required({ message:"OWNER STREET should not be empty", isObject: false }),
      ownercity: validation.required({ message:"OWNER CITY should not be empty", isObject: false }),
      ownerpincode: validation.required({ message:"OWNER PINCODE should not be empty", isObject: false }),
      ownerdistrict: validation.required({ message:"OWNER DISTRICT NAME should not be empty", isObject: true }),
      ownerstate: validation.required({ message:"OWNER STATE NAME should not be empty", isObject: true }),
      ownermobileno: validation.required({ message:"OWNER MOBILENO should not be empty", isObject: false }),
      ownerlandlineno: validation.required({ message:"OWNER LANDLINENO should not be empty", isObject: false }),
      ownerfaxnumber: validation.required({ message:"OWNER FAXNO should not be empty", isObject: false }),
      ownermailid: validation.required({ message:"OWNER MAILID should not be empty", isObject: false }),
      totalcapacityinmts: validation.required({ message:"TOTAL CAPACITY IN MTS should not be empty", isObject: false }),
      totalcapacityinsqft: validation.required({ message:"TOTAL CAPACITY IN SQFT should not be empty", isObject: false }),
      pillarinfo: validation.required({ message:"PILLAR INFO should not be empty", isObject: false }),
      outsideareacapacitymts: validation.required({ message:"OUTSIDE AREA CAPACITY MTS should not be empty", isObject: false }),
      outsideareacapacityinsqft: validation.required({ message:"OUTSIDE AREA CAPACITY IN SQFT should not be empty", isObject: false }),
      contractstartdate: validation.required({ message:"CONTRACT START DATE should not be empty", isObject: false }),
      contractenddate: validation.required({ message:"CONTRACT END DATE should not be empty", isObject: false }),
      advancevalueaftertds: validation.required({ message:"ADVANCE VALUE AFTER TDS should not be empty", isObject: false }),
      rentpersqft: validation.required({ message:"RENT PER SQFT should not be empty", isObject: false }),
      rentpermonth: validation.required({ message:"RENT PER MONTH should not be empty", isObject: false }),
      rentduedate: validation.required({ message:"RENT DUE DATE should not be empty", isObject: false }),
      lockingperiodinmonths: validation.required({ message:"LOCKING PERIOD IN MONTHS should not be empty", isObject: false }),
      noticeperiodinmonths: validation.required({ message:"NOTICE PERIOD IN MONTHS should not be empty", isObject: false }),
      contracttype: validation.required({ message:"CONTRACT TYPE should not be empty", isObject: true }).nullable(),
      servicechargespwh: validation.required({ message:"SERVICE CHARGES PWH should not be empty", isObject: false }),
      bankname: validation.required({ message:"BANK NAME should not be empty", isObject: true }),
      bankbranch: validation.required({ message:"BANK BRANCH should not be empty", isObject: false }),
      bankcity: validation.required({ message:"BANK CITY should not be empty", isObject: false }),
      bankpincode: validation.required({ message:"BANK PINCODE should not be empty", isObject: false }),
      bankdistrict: validation.required({ message:"BANK DISTRICT should not be empty", isObject: true }),
      bankstate: validation.required({ message:"BANK STATE should not be empty", isObject: true }),
      bankaccountno: validation.required({ message:"BANK ACCOUNTNO should not be empty", isObject: false }),
      bankifsc: validation.required({ message:"BANK IFSC should not be empty", isObject: false }),

      drinking_water_facility: validation.required({ message:"DRINKING WATER FACILITY should not be empty", isObject: true }),
      borewell_facility: validation.required({ message:"BOREWELL FACILITY should not be empty", isObject: true }),
      water_connection: validation.required({ message:"WATER CONNECTION should not be empty", isObject: true }),
      toilet_facility: validation.required({ message:"TOILET FACILITY should not be empty", isObject: true }),
      warehouse_security: validation.required({ message:"WAREHOUSE SECURITY should not be empty", isObject: true }),
      naga_security: validation.required({ message:"NAGA SECURITY should not be empty", isObject: true }),
      boundary_wall: validation.required({ message:"BOUNDARY WALL should not be empty", isObject: true }),
      //ownermailid: 
      /*wb_count: validation.required({ message:"WEIGH BRIDGE COUNT should not be empty", isObject: false }),
      wb_1_name: validation.required({ message:"WEIGH BRIDGE  1 NAME should not be empty", isObject: false }),
      wb1_capacity_in_mts: validation.required({ message:"WEIGH BRIDGE 1 CAPACITY IN MTS should not be empty", isObject: false }),
      wb1_stamping_start_date: validation.required({ message:"WEIGH BRIDGE 1 STAMPING STARTDATE should not be empty", isObject: false }),
      wb1_stamping_expiry_date: validation.required({ message:"WEIGH BRIDGE 1 STAMPING ENDDATE should not be empty", isObject: false }),
      wb_2_name: validation.required({ message:"WEIGH BRIDGE  2 NAME should not be empty", isObject: false }),
      wb2_capacity_in_mts: validation.required({ message:"WEIGH BRIDGE 2 CAPACITY IN MTS should not be empty", isObject: false }),
      wb2_stamping_start_date: validation.required({ message:"WEIGH BRIDGE 2 STAMPING ENDDATE should not be empty", isObject: false }),
      wb2_stamping_expiry_date: validation.required({ message:"WEIGH BRIDGE 2 STAMPING ENDDATE should not be empty", isObject: false }),
     // wb1_stamping_certificate_attachment: validation.required({ message:"WEIGH BRIDGE 1 STAMPING CERTIFICATE ATTACHMENT should not be empty", isObject: false }),
     // wb2_stamping_certificate_attachment: validation.required({ message:"WEIGH BRIDGE 2 STAMPING CERTIFICATE ATTACHMENT should not be empty", isObject: false }),
      separate_electric_meters: validation.required({ message:"SEPARATE ELECTRIC METERS should not be empty", isObject: false }),
      electric_light_points_inside: validation.required({ message:"ELECTRIC LIGHT POINTS INSIDE should not be empty", isObject: false }),
      electric_light_points_outside: validation.required({ message:"ELECTRIC LIGHT POINTS OUTSIDE should not be empty", isObject: false }),
      electric_plug_points_inside: validation.required({ message:"ELECTRIC PLUG POINTS INSIDE should not be empty", isObject: false }),
      electric_light_points_outside: validation.required({ message:"ELECTRIC LIGHT POINTS OUTSIDE should not be empty", isObject: false }),


      no_of_fire_extinguisher: validation.required({ message:"NO OF FIRE EXTINGUISHER should not be empty", isObject: false }),
      
      year_of_construction: validation.required({ message:"YEAR OF CONSTRUCTION should not be empty", isObject: false }),
      distance_railway_goods_shed: validation.required({ message:"DISTANCE RAILWAY GOODS SHED should not be empty", isObject: false }),
      distance_national_highways: validation.required({ message:"DISTANCE NATIONAL HIGHWAYS should not be empty", isObject: false }),
      distance_state_highways: validation.required({ message:"DISTANCE STATE HIGHWAYS should not be empty", isObject: false }),
      distance_mandi: validation.required({ message:"DISTANCE MANDI should not be empty", isObject: false }),
      distance_fci_procurement_point: validation.required({ message:"DISTANCE FCI PROCUREMENT POINT should not be empty", isObject: false }),
      distance_pucca: validation.required({ message:"DISTANCE PUCCA should not be empty", isObject: false }),
      statutory_survey_type: validation.required({ message:"STATUTORY SURVEY TYPE should not be empty", isObject: false }),
      //Statutory_Type_Attachment: validation.required({ message:"STATUTORY TYPE ATTACHMENT should not be empty", isObject: false }),
      license_no_1: validation.required({ message:"LICENSE NO 1 should not be empty", isObject: false }),
      license_no_2: validation.required({ message:"LICENSE NO 2 should not be empty", isObject: false }),
      license_no_3: validation.required({ message:"LICENSE NO 3 should not be empty", isObject: false }),
      // License_Copy_Attachment1: validation.required({ message:"LICENSE COPY ATTACHMENT1 should not be empty", isObject: false }),
      // License_Copy_Attachment2: validation.required({ message:"LICENSE COPY ATTACHMENT2 should not be empty", isObject: false }),
      // License_Copy_Attachment3: validation.required({ message:"LICENSE COPY ATTACHMENT3 should not be empty", isObject: false }),
      independent_gate: validation.required({ message:"INDEPENDENT GATE should not be empty", isObject: false }),
      no_of_exits: validation.required({ message:"NO OF EXITS should not be empty", isObject: false }),
      wall_type: validation.required({ message:"WALL TYPE should not be empty", isObject: false }),
      roof_type: validation.required({ message:"ROOF TYPE should not be empty", isObject: false }),
      floor_type: validation.required({ message:"FLOOR TYPE should not be empty", isObject: false }),
      shutter_count: validation.required({ message:"SHUTTER COUNT should not be empty", isObject: false }),
      door_count: validation.required({ message:"DOOR COUNT should not be empty", isObject: false }),
      window_count: validation.required({ message:"WINDOW COUNT should not be empty", isObject: false }),
      plinth: validation.required({ message:"PLINTH should not be empty", isObject: false }),
      floor_height: validation.required({ message:"FLOOR HEIGHT should not be empty", isObject: false }),
      height_from_adj_land: validation.required({ message:"HEIGHT FROM ADJ LAND should not be empty", isObject: false }),
      // wh_photograph_attachment: validation.required({ message:"WH PHOTOGRAPH ATTACHMENT should not be empty", isObject: false }),
      inside_road_type: validation.required({ message:"INSIDE ROAD TYPE should not be empty", isObject: false }),
      inside_heavy_vehicle_mvmt: validation.required({ message:"INSIDE HEAVY VEHICLE MVMT should not be empty", isObject: false }),
      inside_no_of_truck_in_capacity: validation.required({ message:"INSIDE NO OF TRUCK IN CAPACITY should not be empty", isObject: false }),
      repair_work_remarks: validation.required({ message:"REPAIR WORK REMARKS should not be empty", isObject: false }),
      latest_audit_date: validation.required({ message:"LATEST AUDIT DATE should not be empty", isObject: false }),
      next_audit_due_date: validation.required({ message:"NEXT AUDIT DUE DATE should not be empty", isObject: false }),
      name_of_collateral: validation.required({ message:"NAME OF COLLATERAL should not be empty", isObject: false }),
      name_of_bank: validation.required({ message:"NAME OF BANK should not be empty", isObject: false }),
      naga_pwh_insurance_no: validation.required({ message:"INSURANCE NUMBER should not be empty", isObject: false }),
      // naga_pwh_insurance_attachment: validation.required({ message:"INSURANCE ATTACHMENT should not be empty", isObject: false }),
      insurance_covered_amt: validation.required({ message:"INSURANCE COVERED AMOUNT should not be empty", isObject: false }),
      insurance_premium_amt: validation.required({ message:"INSURANCE PREMIUM AMOUNT should not be empty", isObject: false }),
      insurance_period: validation.required({ message:"INSURANCE PERIOD should not be empty", isObject: false }),
      insurance_company: validation.required({ message:"INSURANCE COMPANY should not be empty", isObject: false }),
      insurance_start_date: validation.required({ message:"INSURANCE START DATE should not be empty", isObject: false }),
      insurance_end_date: validation.required({ message:"INSURANCE EXPIRY DATE should not be empty", isObject: false }),
      gst_registration: validation.required({ message:"GST REGISTRATION should not be empty", isObject: false }),
      company_name: validation.required({ message:"COMPANY NAME should not be empty", isObject: false }),
      // contract_agreement_attachment: validation.required({ message:"CONTRACT AGREEMENT ATTACHMENT should not be empty", isObject: false }),
      gst_type: validation.required({ message:"GST TYPE should not be empty", isObject: false }),
      effective_from: validation.required({ message:"EFFECTIVE FROM should not be empty", isObject: false }),
      effective_to: validation.required({ message:"EFFECTIVE TO should not be empty", isObject: false }),
      cost_centre: validation.required({ message:"COST CENTRE should not be empty", isObject: false }),
      gl_account: validation.required({ message:"GL CODE should not be empty", isObject: false }),*/
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log(Id);
    document.getElementById(Id).innerHTML=Msg;
    /*if(form.values.isValid)
      form.values.isValid=false;*/
    }
  }
  }
  const isFilledAll = (formData) => {
    console.log("FillS1");
    showError("Statutory_Type_Attachment_Error","",0);
    showError("License_Copy_Attachment1_Error","",0);
    showError("License_Copy_Attachment2_Error","",0);
    showError("License_Copy_Attachment3_Error","",0);
    showError("wb1_stamping_certificate_attachment_Error","",0);
    showError("wb2_stamping_certificate_attachment_Error","",0);
    console.log("FillS2");
    let FillFlag=true;
    //wb1_stamping_certificate_attachment: alidation.required({ message:"WEIGH BRIDGE 1 STAMPING CERTIFICATE ATTACHMENT should not be empty", isObject: false }),
    if(formData.wb1_stamping_start_date && !formData.wb1_stamping_certificate_attachment && !attachedFiles.wb1_stamping_certificate_attachment.name && ImgData.wb1_stamping_certificate_attachment1==null){  
      showError("wb1_stamping_certificate_attachment_Error","Upload WB-1 Stamping Certificate Copy",1);
      FillFlag=false;
    }
    if(formData.wb2_stamping_start_date && !formData.wb2_stamping_certificate_attachment && !attachedFiles.wb2_stamping_certificate_attachment.name && ImgData.wb2_stamping_certificate_attachment1==null){  
      showError("wb2_stamping_certificate_attachment_Error","Upload WB-2 Stamping Certificate Copy",1);
      FillFlag=false;
    }
    console.log("FillS3");
    if(!formData.Statutory_Type_Attachment && !attachedFiles.Statutory_Type_Attachment.name && ImgData.Statutory_Type_Attachment_Img==null){  
      //console.log("Statutory_Type_Attachment Error");
      showError("Statutory_Type_Attachment_Error","Statutory Type Attachment should not be blank",1);
      FillFlag=false;
    }
    if(!formData.License_Copy_Attachment1 && !attachedFiles.License_Copy_Attachment1.name && ImgData.License_Copy_Attachment1_Img==null){  
      //console.log("Statutory_Type_Attachment Error");
      showError("License_Copy_Attachment1_Error","Upload License Copy 1 Attachment",1);
      FillFlag=false;
    }

    if(!formData.License_Copy_Attachment2 && !attachedFiles.License_Copy_Attachment2.name && ImgData.License_Copy_Attachment2_Img==null){  
      //console.log("Statutory_Type_Attachment Error");
      showError("License_Copy_Attachment2_Error","Upload License Copy 2 Attachment",1);
      FillFlag=false;
    }

    if(!formData.License_Copy_Attachment3 && !attachedFiles.License_Copy_Attachment3.name && ImgData.License_Copy_Attachment3_Img==null){  
      //console.log("Statutory_Type_Attachment Error");
      showError("License_Copy_Attachment3_Error","Upload License Copy 3 Attachment",1);
      FillFlag=false;
    }
    console.log("Fill S4");
    //errorToast("END");
    return FillFlag;

  }

  const ondrinking_water_facility = (e) => {
    const {value, label} = e; 
   /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
    FillPlantList(value);*/
    form.setFieldValue('drinking_water_facility', {  label: label,value: value });
}

const onborewell_facility = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('borewell_facility', {  label: label,value: value });
}

const onwater_connection = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('water_connection', {  label: label,value: value });
}

const ontoilet_facility = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('toilet_facility', {  label: label,value: value });
}

const onwarehouse_security = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('warehouse_security', {  label: label,value: value });
}
const onnaga_security = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('naga_security', {  label: label,value: value });
}
const onboundary_wall = (e) => {
  const {value, label} = e; 
 /* setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
  FillPlantList(value);*/
  form.setFieldValue('boundary_wall', {  label: label,value: value });
}


  const onSubmit = () => {
   

    let formData = form.values;
    console.log("S1");
    if(!isFilledAll(formData))
    {
     // return false;
    }
    
 
    
    const FrmData = {
     /* id:formData.wh_refid,*/
     
      contractstartdate:formData.contractstartdate,
      contractenddate:formData.contractenddate,
      rentpersqft:formData.rentpersqft,
      rentpermonth:formData.rentpermonth,
      rentduedate:formData.rentduedate,
      lockingperiodinmonths:formData.lockingperiodinmonths,
      noticeperiodinmonths:formData.noticeperiodinmonths,
      contracttype:formData.contracttype.value,
      servicechargespwh:formData.servicechargespwh,
      approval_status:101
      
    };
    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    if (keys.length > 0) {
      let postdata = new FormData();
      let FileSaveUrl="";
      let {Statutory_Type_Attachment_Img,wb1_stamping_certificate_attachment1,wb2_stamping_certificate_attachment1,License_Copy_Attachment3_Img,License_Copy_Attachment2_Img,License_Copy_Attachment1_Img} = ImgData;

        postdata.append("image[]", wb1_stamping_certificate_attachment1);
        postdata.append("image[]", wb2_stamping_certificate_attachment1);
        postdata.append("image[]", License_Copy_Attachment1_Img);
        postdata.append("image[]", License_Copy_Attachment2_Img);
        postdata.append("image[]", License_Copy_Attachment3_Img);
        postdata.append("image[]", Statutory_Type_Attachment_Img);
       // FileSaveUrl=SaveCaptureImage;
    
        keys.forEach((key) => {
          postdata.append("file[]", attachedFiles[key]);
        });
        FileSaveUrl=uploadandSaveImageUrl;
        
    

      postdata.append("form_name", "Warehouse");
    //  postdata.append("ponumber", poData.ZPO_NUMBER);
    //  postdata.append("VA_Number", poData.zvanumber);
      postdata.append("SubFolder", "Master");
      
      showLoader();
      apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            keys.forEach((key, i) => {
              FrmData[key] = data.files[i].updname;
            });
            SaveData(FrmData);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }else{
    SaveData(FrmData);
    }
    /*const FrmDataAttachment = new FormData();
    if(formData.wb1_stamping_certificate_attachment1!=null){
      FrmDataAttachment.append("image[]", formData.wb1_stamping_certificate_attachment1);
    }
    if(formData.wb2_stamping_certificate_attachment1!=null){
      FrmDataAttachment.append("image[]", formData.wb2_stamping_certificate_attachment1);
    }
    if(formData.Statutory_Type_Attachment_Img!=null){
      FrmDataAttachment.append("image[]", formData.Statutory_Type_Attachment_Img);
    }
    if(formData.License_Copy_Attachment1_Img!=null){
      FrmDataAttachment.append("image[]", formData.License_Copy_Attachment1_Img);
    }
    if(formData.License_Copy_Attachment2_Img!=null){
      FrmDataAttachment.append("image[]", formData.License_Copy_Attachment2_Img);
    }
    if(formData.License_Copy_Attachment3_Img!=null){
      FrmDataAttachment.append("image[]", formData.License_Copy_Attachment3_Img);
    }


    if(attachedFiles.wb1_stamping_certificate_attachment!=null){
      FrmDataAttachment.append("file[]", attachedFiles.wb1_stamping_certificate_attachment);
    }
    if(attachedFiles.wb2_stamping_certificate_attachment!=null){
      FrmDataAttachment.append("file[]", attachedFiles.wb2_stamping_certificate_attachment);
    }
    if(attachedFiles.Statutory_Type_Attachment!=null){
      FrmDataAttachment.append("file[]", attachedFiles.Statutory_Type_Attachment);
    }
    if(attachedFiles.License_Copy_Attachment1!=null){
      FrmDataAttachment.append("file[]", attachedFiles.License_Copy_Attachment1);
    }
    if(attachedFiles.License_Copy_Attachment2!=null){
      FrmDataAttachment.append("file[]", attachedFiles.License_Copy_Attachment2);
    }
    if(attachedFiles.License_Copy_Attachment3!=null){
      FrmDataAttachment.append("file[]", attachedFiles.License_Copy_Attachment3);
    }*/

    
    
  }
  const onValueChange = (e, key) => {
  
        //fitem[key] = e.target ? e.target.value : e.value;
       if(key=="whaddress" || key=="owneraddress" || key=="ownermailid" ){
        let regEx = /[^a-zA-Z0-9]/gi; 
        if(key=="no_of_wagon" || key=="supplier_wb_qty"){
           regEx = /[^0-9.]/gi;
         }
         if(key=="whaddress" || key=="owneraddress"){
          regEx = /[^a-zA-Z0-9-/, ]/gi; 
         }
         if(key=="ownermailid"){
          regEx = /[^a-zA-Z0-9-@.]/gi; 
         }
       
          let Val=e.target ? e.target.value : e.value;
          // console.log(Val);
           Val = Val.replace(regEx, "");
           if(key=="ownermailid"){
            form.setValues({
             ...form.values,
             ownermailid : Val
           });
         }
           if(key=="whaddress"){
           form.setValues({
            ...form.values,
            whaddress : Val
          });
        }
        if(key=="owneraddress"){
          form.setValues({
           ...form.values,
           owneraddress : Val
         });
       }

         
        }else{
        
        }
        
     
  };

  const onTextChange = (e, key) => {
    console.log(JSON.stringify(e));
 form.setFieldValue(key, {  label: e.label,value: e.value });
   };

  const SaveData = (FrmData) => {
    let formData = form.values;
    const postdata = {
      id:formData.wh_refid,
      Data:FrmData,
    //  FormDataAttachment:attachedFiles
    }
   console.log(JSON.stringify(postdata))
   
    //showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/warehouseEntry/update_new_warehouse_entry", postdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        //return false;
        if(UsrId==-5){
          errorToast("Duplicate Entry");
        }else{
          ShowToast("Saved Successfully...");
          history.push(`/warehouse/WarehouseDashBoard`);
          window.location.reload();
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
  
  const resetForm = () => {
    history.push(`/warehouse/masters/new_warehouse`);
  };

  return (
    <Fragment>
      <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
    <Row>
      <Col md="12" color="#7367f0" sm="12"><h6 className='text-primary'>Warehouse Info:</h6></Col>
    </Row>
    <Row>
      <Col md="4" sm="12">
    <CustomTextInput label={"Warehouse Name"} form={form} id="wh_name" type="text" />
        <CustomTextInput form={form} id="id" type="hidden"  />
      </Col>
        </Row>
  
   
    </div>
    
    {/*<Tabs className="tab-wrap" selectedIndex={this.State.tabIndex} onSelect={tabIndex => this.tabChange(tabIndex)}>
          <TabList className="tab-change">
              <Tab className={this.State.tabIndex == "0" ? 'tab-select' : 'tab-unselect'}>User</Tab>
              <Tab className={this.State.tabIndex == "1" ? 'tab-select' : 'tab-unselect'}>Guest User</Tab>
          </TabList>
          <TabPanel className="r-pan">
              {tableConstruction}
              {this.State.listData && this.State.listData.length == 0 && <div className="table-responsive">
                  <h6 className="text-center">No record found</h6>
              </div>}
          </TabPanel>
          <TabPanel className="w-pan">
              {tableConstruction}
              {this.State.listData && this.State.listData.length == 0 && <div className="table-responsive">
                  <h6 className="text-center">No record found</h6>
              </div>}
          </TabPanel>
</Tabs>*/}
      
        <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
    <Row>
      <Col md="12" color="#7367f0" sm="12"><h6 className='text-primary'>Rent & Contract Info:</h6></Col>
    </Row>    
    <Row>
    <Col md="4" sm="12">
    <DatePicker form={form} id="contractstartdate" showFutureDate={true} isDateRange={false} label={"Contract Start Date"} />
        </Col>
    <Col md="4" sm="12">
    <DatePicker form={form} id="contractenddate" showFutureDate={true} isDateRange={false} label={"Contract  End Date"} />
        </Col>
    <Col md="4" sm="12">
    <CustomTextInput label={"Advance Value after TDS"} form={form} id="advancevalueaftertds" type="number"  />
        </Col>
        </Row>
    <Row>
      <Col md="4" sm="12">
    <CustomTextInput label={"Rent Per Sqft"} form={form} id="rentpersqft" type="number" />
  
      </Col>
    <Col md="4" sm="12">
    <CustomTextInput label={"Rent Per Month"} form={form} id="rentpermonth" type="number"  />
        </Col>
    <Col md="4" sm="12">
    
    <DatePicker form={form} id="rentduedate" showFutureDate={true} isDateRange={false} label={"Rent Due Date"} />
        </Col>

        </Row>
    <Row>
    <Col md="4" sm="12">
    <CustomTextInput label={"Locking Period In Months"} form={form} id="lockingperiodinmonths" type="number"  />
        </Col>
      <Col md="4" sm="12">
    <CustomTextInput label={"Notice Period In Months"} form={form} id="noticeperiodinmonths" type="number"  />
    
      </Col>
    <Col md="4" sm="12">
    
    <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getMaster_ngw_contract_typeById`} label={"Contract Type"} form={form} id="contracttype" />
        </Col>
        </Row>
        <Row>
    <Col md="4" sm="12">
    <CustomTextInput label={"Service Charges (If PWH)"} form={form} id="servicechargespwh" type="text" />
        </Col>
        </Row>
        </div>
       
  
    
    
<br></br>
    <Row>
    <Col md="2" sm="12">
    <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
              Submit
            </Button.Ripple>
  
</Col>
<Col md="2" sm="12">
<Button.Ripple color="primary" block type="button" onClick={(e) => RefreshPage()}>
              Refresh
</Button.Ripple>
            </Col>
   </Row>
   
   {/*<Master_new_warehouse_list
      url={WHMaster_ListUrl}
      title={"WAREHOUSE CREATION"}
      actionRendorer={(row) => {
        let tx = row.isApproved ? `View` : "Edit";
        return (
          <Button.Ripple
            color="primary"
            onClick={() => {
              history.push(`/warehouse/warehouse_master:` + row.id );
            }}
          >
            {tx}
          </Button.Ripple>
        );
      }}
    />*/}
  </Fragment>
    
  );
};
/*
const Master_new_warehouse_entry = () => {

  return (
    <Fragment>
      <CardComponent header="WAREHOUSE CREATION">
        <WareHouseRenew form={form} ImgData={ImgData} setImgData={setImgData} setAttachment={setAttachment} attachedFiles={attachedFiles} onSubmit={onSubmit} />
      </CardComponent>
    </Fragment>
  );
};
*/
export default WareHouseRenew;
