import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, InputGroup, InputGroupText } from "reactstrap";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Link, useHistory, useParams } from "react-router-dom";
import { mbagUrl, mpolineUrl, ulUrl, msuppUrl, uploadUrl, apiBaseUrl,SaveCaptureImage, unloadVendorUrl } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { roundOf,roundOf_3, ShowToast } from "../../helper/appHelper";
import { getTextElement } from "../../@core/components/custom/input-control";
import { useLoader } from "../../utility/hooks/useLoader";
import moment from "moment";

import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { CardComponent } from "../common/CardComponent";
import {Search } from "react-feather";
import { _poData, _supplierFormData, _supplierFormRake, _supplierFormRakeOnLine, _supplierFormRakeOnSupplier, _supplierFormRakePO } from "./SupplierHelper";
import { useSelector } from "react-redux";

const RakeEntryScreenEdit = () => {
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const form = useFormik({
    isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({
        unload_lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
      }),
      onSubmit(values) {},
  });

  

  const history = useHistory();
  
  let { id } = useParams();
  let refid = id.replace(":", "");
  let { showLoader, hideLoader } = useLoader();

  const [poData, setPoData] = useState({});
  const [formData, setFormaData] = useState({ no_bags: "", gunny_wt: "", bag_type: "",bag_weight:"",UnloadVendorCharge:"" });
  const [VendorData, setVendorData] = useState({ lable: "", value: ""});
  const [ImgData, setImgData] = useState({});
  const [bagTypeOptions, setBagTypedata] = useState([]);
  const [poLineOptions, setPOLinedata] = useState([]);
  const [bagweight, setBagweight] = useState(0);
  const [bagweight2, setBagweight2] = useState(0);
  const [bagweight3, setBagweight3] = useState(0);
  const [supplierOptions, setSupplierdata] = useState([]);
  const [FNRNofetch, setFNRNofetch] = useState([]);
  const [PONumberGet, setPONumberGet] = useState([]);
  const [unloadVendorOptions, setUnloadVenordata] = useState([]);
  const [VehicleNoVerify,setVehicleNoVerify] = useState(false)
  const [VEHICAL_NUMBER,setVEHICAL_NUMBER] = useState('')
  const [TRIPSHEET_NUMBER,setTRIPSHEET_NUMBER] = useState('')
  const [GunnyWT1,setGunnyWT1] = useState(0)
  const [GunnyWT2,setGunnyWT2] = useState(0)
  const [GunnyWT3,setGunnyWT3] = useState(0)
  // const [TRIPSHEET_NUMBER,setTRIPSHEET_NUMBER] = useState('')

  // Dijo 002
  const[lotoption,setlotoption] = useState([]); 


  const updateData = (data) => {
    setFormaData(data);
    
  };

  const onTextChange = (e, key) => {

    let Val=e.target ? e.target.value : e.value;
    if(key=="no_bags" || key=="no_bags2" || key=="no_bags3"){
      //Val=Val > 2000 ? Val.slice(0,-1) : Val; 
      let bg1=key=="no_bags"  ? Val :formData.no_bags && formData.no_bags!="" ? formData.no_bags :0 ;
      let bg2=key=="no_bags2"  ? Val :formData.no_bags2 && formData.no_bags2!="" ? formData.no_bags2 :0 ;
      let bg3=key=="no_bags3"  ? Val :formData.no_bags3 && formData.no_bags3!="" ? formData.no_bags3 :0 ;

    let Total=parseFloat(bg1)+parseFloat(bg2)+parseFloat(bg3);
    console.log("Total:"+Total);
         Val=Total > 900 ? Val.slice(0,-1) : Val;
   
      
    }
    if(key=="invoice_bag_count"){
      Val=Val > 900 ? Val.slice(0,-1) : Val; 
    }
    const newData = {
      ...formData,
      //[key]: e.target ? e.target.value : e.value,
      [key]: Val,
    };
    updateData(newData);
  };

const onUnloadVendorChange = (e) => {
  const {value, label} = e; 
  setFormaData({ ...formData, LOADING_VENDOR_CODE: value, LOADING_VENDOR_NAME: label });
} 


  useEffect(() => {
    if (!poData || Object.keys(poData).length === 0) {
      RakeEntryByID()
      onFetchFNRNO()
      onFetchBagTypes();
      setFetchUnloadVenordata();
    }
  }, [poData]);

  const RakeEntryByID = () => {
    const fdata = {id:refid}
    apiPostMethod(apiBaseUrl + "RakeloadingController/RakeEntryByID", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let results = data.results[0]
          setFormaData({ ...formData,
          FNR_NO:results.fnr_no,
          Vehicle_Number:results.vehicle_no,
          TRIPSHEET_NO:results.tripsheet_no,
          DRIVER_NO:results.driver_no,
          DRIVER_NAME:results.driver_name,
          ZPO_NUMBER:results.po_number,
          PO_LINE_ITEM:results.po_line_item,
          ZSUPPLIER_CODE:results.supplier_code,
          ZSUPPLIER_NAME:results.supplier_name,
          LOADING_VENDOR_CODE:results.loading_vendor_id,
          LOADING_VENDOR_NAME:results.Name,
          bag_type:results.receive_bag1,
          bag_type2:results.receive_bag2,
          bag_type3:results.receive_bag3,
          BAG_NAME:results.BAG_NAME,
          BAG_NAME2:results.BAG_NAME2,
          BAG_NAME3:results.BAG_NAME3,
          no_bags:results.no_bags1,
          no_bags2:results.no_bags2,
          no_bags3:results.no_bags3,
          GunnyWeight1:results.gunny_wt1,
          GunnyWeight2:results.gunny_wt2,
          GunnyWeight3:results.gunny_wt3,
          gunny_wt:results.total_gunny_wt,
          bag_weight:results.bag_weight,
          bag_weight2:results.bag_weight2,
          bag_weight3:results.bag_weight3,
          totalBags:results.total_bags,
        });
        setPoData({ ...poData,
          Loading_cost:results.loading_charge,
          BROCKER_CODE:results.brocker_code,
          BROCKER_NAME:results.brocker_name,
          IDNLF:results.wheat_variety,
          PURCHASE_ORG_DESC:results.vehicle_type,
          WERKS:results.plant_id,
          LGORT:results.storage_location_id,
          PLANT_NAME:results.PLANT_NAME,
          STORAGE_LOCATION:results.STORAGE_LOCATION,
        })
        setTRIPSHEET_NUMBER(results.tripsheet_no);
        setVEHICAL_NUMBER(results.vehicle_no);
        onFetchPOLine(results.po_number,results.fnr_no)
        setVehicleNoVerify(true)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchBagTypes = () => {
    apiGetMethod(mbagUrl)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setBagTypedata([{ options: data.results}]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const setFetchUnloadVenordata = () => {

    apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/getVendorDetailsLoading")
       .then((response) => {
         const { data } = response;
         console.log('demo');
         console.log(data);
         if (data.success) {
           setUnloadVenordata([{ options: data.results }]);
         }
       })
       .catch((error) => {
         errorToast("Something went wrong, please try again after sometime");
       });
   };

  


  const onBagTypeChange = (e) => {
    const { weight } = e;
    setBagweight(e.weight);
    const { no_bags } = formData;
    const gw = calgunnyweight(weight, no_bags);
    const dp = { bag_type: e.value, bag_weight:weight, BAG_NAME: e.label };
    if (gw) {
      //dp.gunny_wt = roundOf(gw);
      dp.GunnyWeight1 = roundOf_3(gw);
    
    }

    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0  && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
   
      Totalwt=parseFloat(Totalwt)+parseFloat(gw);
  
    if(GunnyWeight2 && GunnyWeight2>0 && addB2==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight2);
    }
    if(GunnyWeight3 && GunnyWeight3>0 && addB3==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight3);
    }
    dp.gunny_wt = roundOf_3(Totalwt);
  
    updateData({
      ...formData,
      ...dp,
    });
    
  };
  const onBagTypeChange2 = (e) => {
    const { weight } = e;
    setBagweight2(e.weight);
    const { no_bags2 } = formData;
    const gw = calgunnyweight(weight, no_bags2);
    const dp = { bag_type2: e.value,bag_weight2:weight, BAG_NAME2: e.label };
    if (gw) {
      //dp.gunny_wt = roundOf(gw);
      dp.GunnyWeight2 = roundOf_3(gw);
    
    }
    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
    if(GunnyWeight1 && GunnyWeight1>0){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight1);
    }
  if(isNaN(gw)) {gw=0;}
      Totalwt=parseFloat(Totalwt)+parseFloat(gw);
   
    if(GunnyWeight3 && GunnyWeight3>0 && addB3==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight3);
    }
    
    dp.gunny_wt = roundOf_3(Totalwt);
  
    updateData({
      ...formData,
      ...dp,
    });
  
  };
  const onBagTypeChange3 = (e) => {
    const { weight } = e;
    setBagweight3(e.weight);
    const { no_bags3 } = formData;
    const gw = calgunnyweight(weight, no_bags3);
    const dp = { bag_type3: e.value, bag_weight3:weight,BAG_NAME3: e.label };
    if (gw) {
      //dp.gunny_wt = roundOf(gw);
      dp.GunnyWeight3 = roundOf_3(gw);
    
    }
    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
    if(GunnyWeight1 && GunnyWeight1>0){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight1);
    }
    if(GunnyWeight2 && GunnyWeight2>0 && addB2==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight2);
    }
    
    Totalwt=parseFloat(Totalwt)+parseFloat(gw);
  
    
    dp.gunny_wt = roundOf_3(Totalwt);
    
    updateData({
      ...formData,
      ...dp,
    });
    
  };

  const AddRemove = (col,Fn) =>{
    const { addB2,addB3,bag_type,bag_type2,no_bags,no_bags2,no_bags3,GunnyWeight3,GunnyWeight2 }=formData;
    let aB2=addB2;
    let aB3=addB3;
    showError("BagsType_Error","",0);
    showError("no_bags_Error","",0);
    showError("BagsType2_Error","",0);
    showError("no_bags2_Error","",0);
    //console.log(aB2)
    //console.log(aB3)
  //  alert("test");
  const dp = {};
    if(col==2 && Fn=="A" && document.getElementById("Add2")){
      if(!bag_type) {  showError("BagsType_Error","Select Bag Type(1)",1); return false; }
      if(!no_bags) {  showError("no_bags_Error","Select No Of Bags(1)",1); return false; }
      document.getElementById("Add2").style.display="none";
      aB2=1;
    }
    if(col==3 && Fn=="A" && document.getElementById("Add3")){
      if(!bag_type2) {  showError("BagsType2_Error","Select Bag Type(2)",1); return false; }
      if(!no_bags2) {  showError("no_bags2_Error","Select No Of Bags(2)",1); return false; }

      document.getElementById("Remove2").style.display="none";
      document.getElementById("Add3").style.display="none";
      aB3=1;
    }
    if(col==-2 && Fn=="R"  && document.getElementById("Add2")){
      document.getElementById("Add2").style.display="";
      dp.no_bags2=0;
      dp.GunnyWeight2=0;
      aB2=0;
    }
    if(col==-3 && Fn=="R"  && document.getElementById("Add3")){
      document.getElementById("Remove2").style.display="";
      document.getElementById("Add3").style.display="";
      dp.no_bags3=0;
      dp.GunnyWeight3=0;
      aB3=0;
    }
  
    dp.addB2 = aB2;
    dp.addB3 = aB3;


    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && aB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && aB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
   
   
    if(GunnyWeight1 && GunnyWeight1>0){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight1);
    }
   
    if(GunnyWeight2 && GunnyWeight2>0 && aB2==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight2);
    }
    if(GunnyWeight3 && GunnyWeight3>0 && aB3==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight3);
    }
    dp.gunny_wt = roundOf_3(Totalwt);
   

    updateData({
      ...formData,
      ...dp,
    });
  }
 

  const onBagNoChange = (e) => {
    const { value } = e.target;
    const dp = { no_bags: value };
    // setGunnyWT1(no_bags+bag_type);
    const gw = calgunnyweight(bagweight, value);
    
    if (gw) {
      dp.GunnyWeight1 = roundOf_3(gw);
    }
    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
   
    Totalwt=parseFloat(Totalwt)+parseFloat(gw);
   
    if(GunnyWeight2 && GunnyWeight2>0 && addB2==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight2);
    }
    if(GunnyWeight3 && GunnyWeight3>0 && addB3==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight3);
    }
    dp.gunny_wt = roundOf_3(Totalwt);
    
    updateData({
      ...formData,
      ...dp,
    });
  
  };

  const onBagNoChange2 = (e) => {
    const { value } = e.target;
    const dp = { no_bags2: value };
    const gw = calgunnyweight(bagweight2, value);
   
    if (gw) {
      dp.GunnyWeight2 = roundOf_3(gw);
    }
    let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
    if(GunnyWeight1 && GunnyWeight1>0){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight1);
    }
   
      Totalwt=parseFloat(Totalwt)+parseFloat(gw);
   
    if(GunnyWeight3 && GunnyWeight3>0 && addB3==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight3);
    }
    dp.gunny_wt = roundOf_3(Totalwt);
   
    updateData({
      ...formData,
      ...dp,
    });
   
  };

  const onBagNoChange3 = (e) => {
    const { value } = e.target;
    const dp = { no_bags3: value };
    const gw = calgunnyweight(bagweight3, value);
//alert(gw);
    if (gw) {
      dp.GunnyWeight3 = roundOf_3(gw);
    }
   
     let totBags=0;
    if(no_bags && no_bags>0){
      totBags=parseFloat(totBags)+parseFloat(no_bags);
    }
    if(no_bags2 && no_bags2>0 && addB2==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags2);
    }
    if(no_bags3 && no_bags3>0 && addB3==1){
      totBags=parseFloat(totBags)+parseFloat(no_bags3);
    }
    dp.totalBags = totBags;
    let Totalwt=0
    if(GunnyWeight1 && GunnyWeight1>0){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight1);
    }
    if(GunnyWeight2 && GunnyWeight2>0 && addB2==1){
      Totalwt=parseFloat(Totalwt)+parseFloat(GunnyWeight2);
    }
  
      Totalwt=parseFloat(Totalwt)+parseFloat(gw);
    
    dp.gunny_wt = roundOf_3(Totalwt);
    
    updateData({
      ...formData,
      ...dp,
    });
 
  };
  

  const calgunnyweight = (bagwt, nobag) => {
    if (bagwt && nobag) {
      return (Number(bagwt) * Number(nobag)).toFixed(3);
    }
    return "";
  };
  
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log(Id);
    document.getElementById(Id).innerHTML=Msg;
    }
  }
  }
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const onVehicleNoChange = (e) =>{
    const fdata = {Vehicle_Number:formData.Vehicle_Number,FNR_NO:formData.FNR_NO,plantIds: UserDetails.plantids.toString()}
    apiPostMethod(`${apiBaseUrl}RakeloadingController/SAP_Rake_Tripsheet_Get`, fdata)
    .then((response) => {
      const { data } = response;
        if(data.success == 0){
          errorToast(data.error);
          return false
        }
        let json_obj = data.results[0]
        if(json_obj == undefined || json_obj == ""){
          errorToast("Please Enter Correct Vehicle No ...")
          return false
        }else{
        const sap_data = data.results[0];
        setFormaData({ ...formData,
        TRIPSHEET_NO:sap_data.TRIPSHEET_NO,
        DRIVER_NO:sap_data.DRIVER_PH_NO,
        DRIVER_NAME:sap_data.DRIVER_NAME,
        });
        setVehicleNoVerify(true)
        }


        if (data.success) {
          form.resetForm();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    
  }

  const onFetchFNRNO = (PO_number, screentype) => {
    let fdata = { PO_NUMBER: PO_number, screenType: screentype };
    apiPostMethod(apiBaseUrl + "RakeloadingController/FNRNOGet", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            setFNRNofetch([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
//   useEffect(() => {
//     if (formData.FNR_NO !=undefined) {
//         onFetchPONO()
//     }
//   }, [formData.FNR_NO !=undefined]);

  const onFNRChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormRake };
    delete sfd.FNR_NO;
    setFormaData({ ...formData, FNR_NO: value, ...sfd });
    setPoData({ ..._poData });
    onFetchPONO(value);
    setVehicleNoVerify(false)
  };

  const onPOChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormRakePO };
    delete sfd.ZPO_NUMBER;
    setFormaData({ ...formData, ZPO_NUMBER: value, ...sfd });
    setPoData({ ..._poData });
    onFetchPOLine(value,formData.FNR_NO);
  };
  const onPOLINEChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormRakeOnLine };
    delete sfd.PO_LINE_ITEM;
    setFormaData({ ...formData, PO_LINE_ITEM: value, ...sfd });
    setPoData({ ..._poData });
    onFetchSupplier(value);
  };


  const onSupplierChange = (e) => {
    const { label, value } = e;
    setFormaData({ ...formData, ZSUPPLIER_CODE: value, ZSUPPLIER_NAME: label });
    onFetchSupplierByID(value)
  };

  const onFetchPONO = (FNR_NO) => {
    let fdata = { FNR_NO: FNR_NO };
    apiPostMethod(apiBaseUrl + "RakeloadingController/PONumberGet", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            setPONumberGet([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchPOLine = (PO_NUMBER,FNR_NUMBER) => {
    let fdata = { PO_NUMBER: PO_NUMBER , FNR_NO:FNR_NUMBER || formData.FNR_NO};
    apiPostMethod(apiBaseUrl + "RakeloadingController/POLineItem", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            setPOLinedata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onFetchSupplier = (PO_LINE_ITEM) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER,PO_LINE_ITEM : PO_LINE_ITEM  };
    apiPostMethod(apiBaseUrl + "RakeloadingController/SupplierList", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            setSupplierdata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchSupplierByID = (ZSUPPLIER_CODE) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER,PO_LINE_ITEM : formData.PO_LINE_ITEM ,ZSUPPLIER_CODE:ZSUPPLIER_CODE  };
    apiPostMethod(apiBaseUrl + "RakeloadingController/SupplierListByID", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            const { results } = data;
            setPoData(results[0]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const Submit = () => {
    let old_vehicle_no;

    if(formData.Vehicle_Number != VEHICAL_NUMBER){
       old_vehicle_no = 0
    }

    const postData = {
      id:refid,
      fnr_no: formData.FNR_NO,
      po_no: formData.ZPO_NUMBER,
      vehicle_no: formData.Vehicle_Number,
      tripsheet_no: formData.TRIPSHEET_NO,
      driver_no: formData.DRIVER_NO,
      driver_name: formData.DRIVER_NAME,
      po_line_item: formData.PO_LINE_ITEM,
      supplier_code: formData.ZSUPPLIER_CODE,
      supplier_name: formData.ZSUPPLIER_NAME,
      brocker_code: poData.BROCKER_CODE,
      brocker_name: poData.BROCKER_NAME,
      plant: poData.WERKS,
      vehicle_type: poData.PURCHASE_ORG_DESC,
      storage_location: poData.LGORT,
      wheat_variety: poData.IDNLF,
      loading_vendor: formData.LOADING_VENDOR_CODE,
      loading_cost: poData.Loading_cost,
      recieve_bag1: formData.bag_type,
      recieve_bag2: formData.bag_type2,
      recieve_bag3: formData.bag_type3,
      no_bags1: formData.no_bags,
      no_bags2: formData.no_bags2,
      no_bags3: formData.no_bags3,
      gunny_wt1: formData.GunnyWeight1,
      gunny_wt2: formData.GunnyWeight2,
      gunny_wt3: formData.GunnyWeight3,
      total_bags: (Number(formData.no_bags)+Number(formData.no_bags2)+Number(formData.no_bags3)).toFixed(0),
      total_gunny_wt: formData.gunny_wt,
      old_vehicle_no:old_vehicle_no
    };
    
    if(postData.fnr_no == "" || postData.fnr_no == undefined){
        errorToast('Please Select FNR No...')
        return false
    }else if(postData.po_no == "" || postData.po_no == undefined){
        errorToast('Please Select PO No...')
        return false
    }else if(postData.po_line_item == "" || postData.po_line_item == undefined){
        errorToast('Please Select PO Line Item...')
        return false
    }else if(postData.supplier_code == "" || postData.supplier_code == undefined){
        errorToast('Please Select Supplier Name...')
        return false
    }else if(postData.vehicle_no == "" || postData.vehicle_no == undefined){
        errorToast('Please Enter Vehicle Number...')
        return false
    }
    else if(postData.loading_vendor == "" || postData.loading_vendor == undefined){
        errorToast('Please Select Loading Vendor...')
        return false
    }else if(postData.loading_cost == "" || postData.loading_cost == undefined){
        errorToast('Please Enter Loading cost...')
        return false
    }else if(postData.gunny_wt1 == "" || postData.gunny_wt1 == undefined){
        errorToast('Please Enter gunny weight 1...')
        return false
    }else if(postData.recieve_bag2 != "" && postData.recieve_bag2 != undefined && postData.gunny_wt2 == undefined){
        errorToast('Please Enter gunny weight 2...')
        return false
    }else if(postData.recieve_bag3 != "" && postData.recieve_bag3 != undefined && postData.gunny_wt3 == undefined){
        errorToast('Please Enter gunny weight 3...')
        return false
    }else if(postData.tripsheet_no == "" || postData.tripsheet_no == undefined){
        errorToast('Please Enter Tripsheet No...')
        return false
    }else if(!/^[\d]{10}/.test(postData.driver_no) || postData.driver_no == undefined){
        errorToast('Please Enter Driver Number...')
        return false
    }else if(postData.loading_vendor == "" || postData.loading_vendor == undefined){
        errorToast('Please Select Loading Vendor Name...')
        return false
    }else if(postData.loading_cost == "" || postData.loading_cost == undefined){
        errorToast('Please Enter Loading Cost...')
        return false
    }else if(postData.driver_name == "" || postData.driver_name == undefined){
        errorToast('Please Enter Driver Name...')
        return false
    }
    // else if(postData.vehicle_no != VEHICAL_NUMBER){
    //   if(postData.tripsheet_no == TRIPSHEET_NUMBER)
    //   errorToast('Inavalid Tripsheet & Vehicle No...')
    //   return false
    // }
    showLoader();
    apiPostMethod(apiBaseUrl + "RakeloadingController/Rake_Loading_Update", postData)
      .then((response) => {
        const { data } = response;
        if(data.success == 1) {
        ShowToast("Save Successfully...");
        history.push("/RAKEENTRYEDIT");
        }else if (data.success == 0){
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const {
    IDNLF,
    STORAGE_LOCATION,
    BROCKER_NAME,
    PURCHASE_ORG_DESC,
    WERKS,
    LGORT,
    BROCKER_CODE,
    Loading_cost,
    PLANT_NAME,
  } = poData;
  const { addB3,addB2,totalBags,GunnyWeight1,GunnyWeight2,GunnyWeight3,no_bags,no_bags2,no_bags3,bag_weight,bag_weight2,bag_weight3, gunny_wt, ZSUPPLIER_CODE, ZSUPPLIER_NAME, TRUCK_NO, PO_LINE_ITEM, unload_lot,Vehicle_Number ,FNR_NO,ZPO_NUMBER,DRIVER_NO,DRIVER_NAME,TRIPSHEET_NO,LOADING_VENDOR_CODE,LOADING_VENDOR_NAME,BAG_NAME,BAG_NAME2,BAG_NAME3,bag_type,bag_type2,bag_type3} = formData;



  useEffect(() => {
    if (no_bags) {
        setFormaData ({
          ...formData,
          GunnyWeight1 : (Number(no_bags)+Number(bag_weight)).toFixed(3),
        })
    }
  }, [no_bags]);

  useEffect(() => {
    if (no_bags2) {
        setFormaData ({
          ...formData,
          GunnyWeight2 : (Number(no_bags2)+Number(bag_weight2)).toFixed(3),
        })
    }
  }, [no_bags2]);

  useEffect(() => {
    if (no_bags3) {
        setFormaData ({
          ...formData,
          GunnyWeight3 : (Number(no_bags3)+Number(bag_weight3)).toFixed(3),
        })
    }
  }, [no_bags3]);

  useEffect(() => {
    if (totalBags) {
        setFormaData ({
          ...formData,
          totalBags : (Number(no_bags)+Number(no_bags2)+Number(no_bags3)).toFixed(0),
        })
    }
  }, [totalBags]);

  useEffect(() => {
    if (gunny_wt) {
        setFormaData ({
          ...formData,
          gunny_wt : (Number(GunnyWeight1)+Number(GunnyWeight2)+Number(GunnyWeight3)).toFixed(3),
        })
    }
  }, [gunny_wt]);

  return (
    <div>
      <Card>
        <CardBody>
        <CardComponent  header="Rake Loading">
          <div>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>FNR Number</Label>
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={FNRNofetch}
                    value={{ label: FNR_NO, value: FNR_NO }}
                    onChange={(e) => onFNRChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                    <Label for="Vehicle_Number">Vehicle Number</Label>
                    <InputGroup>
                    <Input
                        type="text"
                        name="Vehicle_Number"
                        value={Vehicle_Number}
                        id="Vehicle_Number"
                        disabled={VehicleNoVerify}
                        onChange={(Vehicle_Number) => onTextChange(Vehicle_Number, "Vehicle_Number")}
                        placeholder="Vehicle Number"
                        maxLength="10"
                    />
                    <InputGroupText className="p-0">
                                    <Button size="sm" color="success" 
                                    style={{ height:'38px',width:'60px' }}
                                    onClick={(e) => onVehicleNoChange(e)}
                                    disabled={VehicleNoVerify}
                                    >
                                        {/* ✔️ */}
                                        <Search size={25} style={{marginLeft:'10px' }} className="mr-1" />
                                        {/* <i className="fa fa-check px-1"></i> */}
                                    </Button>
                    </InputGroupText>
                    </InputGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">TripSheet Number</Label>
                  <Input type="text" value={TRIPSHEET_NO} disabled onChange={(e) => onTextChange(e, "TRIPSHEET_NO")} maxLength={10} placeholder="TripSheet Number" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Driver Number</Label>
                  <Input type="text" value={DRIVER_NO}  onChange={(e) => onTextChange(e, "DRIVER_NO")} maxLength={10} placeholder="Driver Number" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Driver Name</Label>
                  <Input type="text" value={DRIVER_NAME}  onChange={(e) => onTextChange(e, "DRIVER_NAME")} maxLength={40} placeholder="Driver Name"/>
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Number</Label>
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={PONumberGet}
                    value={{ label: ZPO_NUMBER, value: ZPO_NUMBER }}
                    onChange={(e) => onPOChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                    value={{ label: PO_LINE_ITEM, value: PO_LINE_ITEM }}
                    onChange={(e) => onPOLINEChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={supplierOptions}
                    value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                    onChange={(e) => onSupplierChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Broker Name</Label>
                  <Input type="text" value={BROCKER_NAME || BROCKER_CODE} disabled onChange={(e) => onTextChange(e, "BROCKER_NAME")} maxLength={10} placeholder="Broker Name" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Wheat Variety</Label>
                  <Input type="text" value={IDNLF} disabled onChange={(e) => onTextChange(e, "IDNLF")} maxLength={10} placeholder="Wheat Variety" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Vehicle Type</Label>
                  <Input type="text" value={PURCHASE_ORG_DESC} disabled onChange={(e) => onTextChange(e, "PURCHASE_ORG_DESC")} maxLength={10} placeholder="Vehicle Type" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Plant Description</Label>
                  <Input type="text" value={PLANT_NAME||WERKS} disabled onChange={(e) => onTextChange(e, "WERKS")} maxLength={10} placeholder="Plant Description" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Storage Loacation</Label>
                  <Input type="text" value={STORAGE_LOCATION||LGORT} disabled onChange={(e) => onTextChange(e, "LGORT")} maxLength={10} placeholder="Storage Loacation" />
                </FormGroup>
                <span id="TRUCK_NO_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Loading Vendor Name</Label>
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={unloadVendorOptions}
                    value={{ label: LOADING_VENDOR_NAME, value: LOADING_VENDOR_CODE }}
                    onChange={(e) => onUnloadVendorChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
              <Label for="cityMulti">Loading Charge</Label>
                  <Input
                    type="text"
                    value={Loading_cost}
                    id="Loading_cost"
                    onChange={(e) => onTextChange(e, "Loading_cost")}
                    placeholder="Charge"
                    disabled
                  />
              </Col>
            </Row>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Received Bag Type(1)</Label>
                  <Select className="react-select"  classNamePrefix="select" 
                  options={bagTypeOptions}  id="BagsType" 
                  onChange={(e) =>onBagTypeChange(e)}
                  value={{ label: BAG_NAME, value: bag_type }}
                   />

                <span id="BagsType_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>
              
              <Col md="2" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(1)</Label>
                  <Input
                    type="number"
                    value={no_bags}
                    id="no_bags"
                    onChange={(e) => onTextChange(e, "no_bags")}
                    onBlur={(e) => onBagNoChange(e)}
                    placeholder="Nos"
                  />
                  <Input
                    type="text"
                    value={bag_weight}
                    id="bag_weight"
                    style={{display:  'none' }}
                    placeholder="Weight"
                    
                  />
                </FormGroup>
                <span id="no_bags_Error" style={{color: "red"}} ></span>
              </Col>
             
              {getTextElement("Gunny Weight 1", GunnyWeight1)}
              {
              <Col md="2" sm="12">
                <br></br>
                  <Button.Ripple color="primary" id="Add2" type="button" onClick={() =>AddRemove(2,"A")}>
                      Add
                    </Button.Ripple>
              </Col>}

                    {(addB2==1 ||(no_bags2 != undefined && no_bags2 !=0)) &&<Col md="4" sm="12">
                <FormGroup>
                  <Label>Received Bag Type(2)</Label>
                  <Select className="react-select"  classNamePrefix="select" 
                  options={bagTypeOptions}  id="BagsType2" 
                  onChange={(e) => onBagTypeChange2(e)}
                  value={{ label: BAG_NAME2, value: bag_type2 }}
                   />

                <span id="BagsType2_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>}
              {(addB2==1 || (no_bags2 != undefined && no_bags2 != 0)) && <Col md="2" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(2)</Label>
                  <Input
                    type="number"
                    value={no_bags2}
                    id="no_bags2"
                    onChange={(e) => onTextChange(e, "no_bags2")}
                    onBlur={(e) => onBagNoChange2(e)}
                    placeholder="Nos"
                  />
                   <Input
                    type="text"
                    value={bag_weight2}
                    id="bag_weight2"
                    style={{display:  'none' }}
                    placeholder="Weight"
                    
                  />
                  <span id="no_bags2_Error" style={{color: "red"}} ></span>
                  <span id="BagWeights_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>}
              
              {(addB2==1 || (no_bags2 != undefined && no_bags2 !=0)) && getTextElement("Gunny Weight 2", GunnyWeight2)}
             
              {addB2==1 &&<Col md="2" sm="12">
              <br></br>
                {/*  onClick={(e) => OnUnloadingDetails()} */}
               <Button.Ripple color="danger" id="Remove2" type="button" onClick={() =>AddRemove(-2,"R")}>
                      Remove
                    </Button.Ripple>
                    <Button.Ripple color="primary" id="Add3" className="ml-1" type="button" onClick={() =>AddRemove(3,"A")} >
                      Add
                    </Button.Ripple>
               </Col>}

                    
              {(addB3==1 ||(no_bags3 != undefined && no_bags3 !=0)) && <Col md="4" sm="12">
                <FormGroup>
                  <Label>Received Bag Type(3)</Label>
                  <Select className="react-select"  classNamePrefix="select" 
                  options={bagTypeOptions}  id="BagsType3" 
                  onChange={(e) => onBagTypeChange3(e)}
                  value={{ label: BAG_NAME3, value: bag_type3 }}
                   />

                <span id="BagsType3_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>}
              {(addB3==1 || (no_bags3 != undefined && no_bags3 !=0))&&  <Col md="2" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(3)</Label>
                  <Input
                    type="number"
                    value={no_bags3}
                    id="no_bags3"
                    onChange={(e) => onTextChange(e, "no_bags3")}
                    onBlur={(e) => onBagNoChange3(e)}
                    placeholder="Nos"
                  />
                  <Input
                    type="text"
                    value={bag_weight3}
                    id="bag_weight3"
                    style={{display:  'none' }}
                    placeholder="Weight"
                    
                  />
                  <span id="no_bags3_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>}
              
              {(addB3==1 || (no_bags3 != undefined && no_bags3 !=0)) && getTextElement("Gunny Weight 3", GunnyWeight3)}
              {addB3==1 &&<Col md="2" sm="12">
              <Button.Ripple color="danger" type="button" id="Remove3" onClick={() =>AddRemove(-3,"R")}>
                      Remove
                    </Button.Ripple>
                    </Col>}
              <Col md="4" sm="12">
              </Col>
              {getTextElement("Total Bags",(Number(no_bags)+Number(no_bags2)+Number(no_bags3)).toFixed(0),"2")}
              {getTextElement("Gunny Weight (In Kgs)", gunny_wt)}
              <span id="gunny_wt_Error" style={{color: "red"}} ></span>
             
              <Col sm="12" className="mt-2">
                <FormGroup className="d-flex mb-0 justify-content-end">
                 
                  <Button.Ripple outline color="secondary" tag={Link} to={`/RAKEENTRYEDIT`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  <div className="mr-1">
                    {/*disabled={isFilledAll()} */}
                    <Button.Ripple color="primary" type="button"  onClick={(e) => Submit()}>
                      Submit
                    </Button.Ripple>
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </div>
         </CardComponent>
        </CardBody>
      </Card>
     
    </div>
  );
};
export default RakeEntryScreenEdit;
