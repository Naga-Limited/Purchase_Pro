import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { mbagUrl, mpolineUrl, maUrl, msuppUrl, uploadUrl,BASE_URL,SaveCaptureImage,uploadandSaveImageUrl, ddlPOUrl, vaUrl, getUsedWt, sdivhgUrl, ddlSDPOUrl, sdisdUrl, mvessUrl, qcUrl, uaUrl, getSAPPO, apiBaseUrl, ulUrl, sapFileShare } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { roundOf, ShowToast } from "../../helper/appHelper";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import Uploader from "../Uploader";
import { useLoader } from "../../utility/hooks/useLoader";
import moment from "moment";
import CaptureImage from "../CaptureImage";
import Modal from 'react-responsive-modal';
import { useSelector } from "react-redux";
import { _poData, _supplierFormData, _supplierFormDatas } from "../SDI/SupplierHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { CustomDropdownInput } from "../forms/custom-form";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";

const WrongEntry = () => {
  const [poData, setPoData] = useState({});
  const dateFormat = "YYYY-MM-DD";
  const [ImgData, setImgData] = useState({});
  const today = moment().format(dateFormat);
  let { showLoader, hideLoader } = useLoader();
  const [formData, setFormaData] = useState({});
  const [attachedFiles, setAttachment] = useState({ supp_inv_copy: {}, supp_wb_copy: {}, naga_os_wb_copy: {} });
  const history = useHistory();
  let { id } = useParams();
  let refid = id.replace(":", "");
  const [bagTypeOptions, setBagTypedata] = useState([]);
  const [poLineOption, setPOLinedata] = useState([]);
  const [FNR_NOS, setFNR_NOS] = useState([]);
  const [TRIPSHEET_NO, setTRIPSHEET_NO] = useState('');
  const [poLineOptions, setPOLinedatas] = useState([]);
  const [bagweight, setBagweight] = useState(0);
  const [bagweight2, setBagweight2] = useState(0);
  const [bagweight3, setBagweight3] = useState(0);
  const [supplierOptions, setSupplierdata] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [poDatas, setPOData] = useState({});
  const [poOptions, setPOdata] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState();
  const [vehicalDatas, setvehicalDatas] = useState([]);
  const [vesselOptions, setVesseldata] = useState([]);
  const [PO_NUMBERS, setPO_NUMBERS] = useState('');
  const [invoice_date,setinvoice_date ] = useState('');
  const [Wb_load_wt,setWb_load_wt ] = useState('');
  const [Wb_empty_wt,setWb_empty_wt ] = useState('');
  const [SCREEN_TYPES,setSCREEN_TYPE ] = useState('');
  const [invoice_bag_count,setInvoice_bag_count ] = useState('');
  const [VehicleType,setVehicleType ] = useState('');
  const [ZQTY,setZQTY ] = useState('');
  const [unload_lots,setunload_lot ] = useState('');
  const [ZVENDOR_CODE,setZVENDOR_CODE ] = useState('');
  const [WERKS,setWERKS ] = useState('');
  const [ZVA_NUMBERS,setZVA_NUMBERS ] = useState('');
  const [UnloadVendorCharge,setUnloadVendorCharge ] = useState('');
  const [UnloadVendorName,setUnloadVendorName ] = useState('');
  const [CONTAINER_NOS,setCONTAINER_NOS ] = useState('');
  const [LGORT,setLGORT ] = useState('');
  const[lotoption,setlotoption] = useState([]); 
  const[toplantid,settoplantid] = useState(''); 
  const[tolocationid,settolocationid] = useState(''); 
  
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const form = useFormik({
    isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({
        unload_lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
      }),
      onSubmit(values) {},
  });

  const updateData = (data) => {
    setFormaData(data);
  };

  const onTextChange = (e, key) => {
    const newData = {
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    };
    updateData(newData);
  };

  const onPOChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormDatas };
    delete sfd.ZPO_NUMBER;
    setFormaData({ ...formData, ZPO_NUMBER: value, ...sfd });
    setPOData({ ..._poData });
    onFetchPOLine(value);
  };

  const onFetchPOLine = (PO_number) => {
    setSelectedLocation("");
    let fdata = { PO_NUMBER: PO_number, screenType: "SDO" };
    apiPostMethod(mpolineUrl, fdata)
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
  const onFetchFNRNO = (PO_number,PO_LINE) => {
    setSelectedLocation("");
    let fdata = { PO_NUMBER: PO_number, PO_LINE: PO_LINE };
    apiPostMethod(apiBaseUrl+'RakeloadingController/FNRNOCHANGE',fdata) 
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setFNR_NOS([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onFetchPOLines = (PO_number) => {
    setSelectedLocation("");
    let fdata = { PO_NUMBER: PO_number, screenType: "SDO" };
    apiPostMethod(mpolineUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setPOLinedatas([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  useEffect(() => {
    if (!poOptions || poOptions.length === 0) {
      onFetchAllPOByUserPlant();
    }
  }, [poOptions]);

  const onFetchAllPOByUserPlant = () => {
    let fdata = {
      plantIds: UserDetails.plantids,
    };
    apiPostMethod(getSAPPO, fdata)
      .then((response) => {
        const { data } = response;
        console.log(data)
        if (data.success) {
          setPOdata([{ options: data.poresults }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLineItemchange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormData };
    delete sfd.ZPO_NUMBER;
    delete sfd.ZPO_LINE_ITEM;
    setFormaData({ ...formData, ZPO_LINE_ITEM: value, ...sfd });
    setPOData({ ..._poData });
    onFetchSupplier(value);
    onFetchFNRNO(ZPO_NUMBER,value)
  };
  const onFNRNOCHANGE= (e) => {
    const { value } = e;
    // delete sfd.ZPO_NUMBER;
    // delete sfd.ZPO_LINE_ITEM;
    setFormaData({ ...formData, FNR_NO: value });
    TripsheetNoChange(value)
  };

  const TripsheetNoChange = (FNR_NO) => {
    setSelectedLocation("");
    let fdata = { FNR_NO: FNR_NO, Vehicle_Number: formData.TRUCK_NO };
    apiPostMethod(apiBaseUrl+'RakeloadingController/SAP_Rake_Tripsheet_Get',fdata) 
      .then((response) => {
        const { data } = response;
        const sap_data = data.results[0];
        
        if (sap_data == undefined) {
          errorToast('Please Confirm the Tripsheet no')
        }else {
          setTRIPSHEET_NO(sap_data.TRIPSHEET_NO);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchSupplier = (lineItem) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER, lineItem: lineItem, screenType: "SDO" };
    apiPostMethod(msuppUrl, fdata)
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



  const onSupplierChange = (e) => {
    const { label, value } = e;
    setFormaData({ ...formData, ZSUPPLIER_CODE: value, ZSUPPLIER_NAME: label });
    onFetchPOdetails(value);
  };

  const onFetchPOdetails = (ZSUPPLIER_CODE) => {
    let fdata = { PO_NUMBER: formData.ZPO_NUMBER, ZPO_LINE_ITEM: formData.ZPO_LINE_ITEM, ZSUPPLIER_CODE: ZSUPPLIER_CODE };

    apiPostMethod(sdisdUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results.length) {
          const { results } = data;
          setPOData(results[0]);
          settoplantid(results[0].toplantid)
          settolocationid(results[0].tolocationid)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  useEffect(() => {
    if (!poDatas || Object.keys(poDatas).length === 0) {
      onFetchPodetailsById();
      onFetchPodetailsByIdInvoice();
      onFetchPodetailsID();
      // onFetchPodetailslot();
    }
  }, [poData]);
  // console.log(toplantid,tolocationid)
  useEffect(() => {
  // const onFetchPodetailslot= () => {
    if(toplantid != '' && tolocationid != ''){
    let fdata = {toplantid:toplantid,tolocationid:tolocationid,formType: "POS" };
    showLoader();
    apiPostMethod(ulUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const poResult = data.results[0];
          setlotoption(poResult.lotdet);
        }
      })
      .catch((error) => {
        errorToast(error);
      })
      .finally((a) => {
        hideLoader();
      });
    }
  // };
}, [toplantid,tolocationid]);
  const onFetchPodetailsById = () => {
    let fdata = { id: refid, formType: "PO" };
    apiPostMethod(maUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(data);
        if (data.success) {
          const podata = data.results[0];
          const fmdata = data.fresults[0];
          setBagweight(podata.WEIGHT);
          setBagweight2(podata.WEIGHT2);
          setBagweight3(podata.WEIGHT3);
          setPO_NUMBERS(podata.ZPO_NUMBER)
          setIsReadOnly(fmdata.VECHICAL_STATUS === "7");
          setFormaData({ ...formData, ...fmdata });
          setPOData({ ...poDatas, ...podata });
          onFetchPOLines(podata.ZPO_NUMBER, podata.SCREEN_TYPE);
          onFetchSupplier(podata.ZPO_NUMBER, fmdata.PO_LINE_ITEM, podata.SCREEN_TYPE);
          setSCREEN_TYPE(podata.SCREEN_TYPE);
          setUnloadVendorCharge(fmdata.UnloadVendorCharge);
          setUnloadVendorName(fmdata.UnloadVendorName);
        }
      })
      .catch((error) => {
        errorToast(error);
      });
  };

  const onFetchPodetailsByIdInvoice = () => {
    let fdata = {
      id: refid,
      formType: "PO",
    };
    apiPostMethod(uaUrl, fdata)
      .then((response) => {
        const { data } = response;
        console.log(data)
        if (data.success) {
          const fmdatas = data.fresults[0];
          setinvoice_date(fmdatas.invoice_date);
          setWb_empty_wt(fmdatas.wb_empty_wt);
          setWb_load_wt(fmdatas.wb_load_wt);
          setInvoice_bag_count(fmdatas.invoice_bag_count);
          setVehicleType(data.results[0].VEHICLE_TYPE);
          setZVA_NUMBERS(fmdatas.ZVA_NUMBER)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getwbValue = (val) => {
    const wbtype = { 1: "Own WB", 2: "Outside WB" };
    return wbtype[val];
  };
  
  useEffect(() => {
    updateGunnyWeight();
  }, [formData.bag_type,formData.bag_type2,formData.bag_type3, formData.no_bags,formData.no_bags2,formData.no_bags3, formData.wb_load_wt, formData.wb_empty_wt]);
  
  const updateGunnyWeight = () => {
    const { no_bags,no_bags2,no_bags3, wb_load_wt, wb_empty_wt } = formData;
    const gw = calgunnyweight(bagweight,bagweight2,bagweight3, no_bags,no_bags2,no_bags3);
    if (gw) {
      let db = {
        gunny_wt: gw.toFixed(2),
      };
      if (wb_load_wt && wb_empty_wt) {
        const wb_net_wt = Number(wb_load_wt) - Number(wb_empty_wt);
        if (wb_net_wt) {
          db.wb_net_wt = wb_net_wt;
          db.gunny_less_wt = wb_net_wt - gw;
        }
      }
      setFormaData({
        ...formData,
        ...db,
      });
    }
  };

  

  const calgunnyweight = (bagwt,bagwt2,bagwt3, nobag,nobag2,nobag3) => {
    console.log("Calc G Weight");
    let Tot=0;
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt) * Number(nobag));
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt2) * Number(nobag2));
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt3) * Number(nobag3));

   return Tot;
    
  };
  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };



  const onFetchPodetailsID = () => {
    let str = id;
    str = str.substring(1);
    const postdata = {
      id:str,
    }
  apiPostMethod(apiBaseUrl+'Wrongentry/purchase_info_getByID',postdata) 
        .then((response) => {
          const { data } =response; 
          if(data.success) {
            setZQTY(data.results[0].ZQTY)
            setZVENDOR_CODE(data.results[0].ZVENDOR_CODE)
            setWERKS(data.results[0].WERKS)
            setCONTAINER_NOS(data.results[0].CONTAINER_NO)
            setLGORT(data.results[0].LGORT)
          }
    })
    apiPostMethod(apiBaseUrl+'Wrongentry/gateout_info_getByID',postdata) 
    .then((response) => {
      const { data } =response; 
      console.log(data)
      if(data.success) {
        setunload_lot(data.results[0] != null ? data.results[0].unload_lot : '')
      }
   })
  }
 
  
  const onUpdatePo = () => {
    let fdata = {  wb_load_wt:formData.wb_load_wt,wb_empty_wt:formData.wb_empty_wt,wb_net_wt:formData.wb_net_wt,gunny_less_wt:formData.gunny_less_wt,naga_os_wb_copy:formData.naga_os_wb_copy,supp_inv_copy:formData.supp_inv_copy,supp_wb_copy:formData.supp_wb_copy,wb_load_wt_old:Wb_load_wt,wb_empty_wt_old:Wb_empty_wt, zvanumber: refid, formType: "U", id: poData.PI_REFID };
    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    if (keys.length > 0) {
      let postdata = new FormData();
      let FileSaveUrl=uploadandSaveImageUrl;
      let {Invoicecopy,WBCopy,NagaOutsideWBCopy} = ImgData;
      
 
        postdata.append("image[]", Invoicecopy);
        postdata.append("image[]", WBCopy);
        postdata.append("image[]", NagaOutsideWBCopy);
       
     
        keys.forEach((key) => {
          postdata.append("file[]", attachedFiles[key]);
        });
      
        
   
        postdata.append("form_name", "MA");
        postdata.append("ponumber", poData.ZPO_NUMBER);
        postdata.append("VA_Number", poData.zvanumber);
        postdata.append("SubFolder", "QCApproval");
      
      showLoader();
      apiPostMethod(FileSaveUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            keys.forEach((key, i) => {
              fdata[key] = data.files[i].updname;
            });
            updateFormData(fdata);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      updateFormData(fdata);
    }
  };
  const updateFormData = (fdata) => {
    let msg="WRONG ENTRY"
    confirmDialog({
      title: "Are you sure want to Update?",
      description: msg,
    }).then((res) => {
      if (res) {
        showLoader();
      apiPostMethod(apiBaseUrl + "Wrongentry/WB_Entry_Reversal", fdata)
      .then((response) => {
          console.log(JSON.stringify(response))
           ShowToast("Saved Successfully...");
           history.push(`/WAP`);
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    }
  }); 
  };
  // const onApprovePO = () => {
  //   let fdata = { formType: "A", id: poData.PI_REFID };
  //   showLoader();
  //   apiPostMethod(maUrl, fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       if (data.success) {
  //         window.open(BASE_URL+"/#/STOSDTSlip:"+refid, "", "width=900,height=650")
  //         history.push(`/AP`);
  //       }
  //     })
  //     .catch((error) => {
  //       errorToast("Something went wrong, please try again after sometime");
  //     })
  //     .finally((a) => {
  //       hideLoader();
  //     });
  // };
  const OnLotChange = (e) => {
    const {value, label} = e; 
    const newData = {
      ...formData,
      //[key]: e.target ? e.target.value : e.value,
      unload_lot:value,
      lstunload_lot:{  label: label,value: value },
    };
    updateData(newData);
    // form.setFieldValue('unload_lot', {  label: label,value: value });
    // setStockEntryfromData({ ...stockEntryformData, unload_lotid:value, lotno:label}); 
  
    // FillWheatVarityList(value)
  } 
  

  const AddDatasPO = () => {

  if(VECHICAL_STATUS == '28'){

    let Types = poDatas.VEHICLETYPE ? poDatas.VEHICLETYPE.toUpperCase() : poDatas.VEHICLE_TYPE.toUpperCase();
    let Types1 = VehicleType.toUpperCase();
    
    if(formData.ZPO_NUMBER == '' || formData.ZPO_NUMBER == undefined){
      errorToast('Please Select the PO Number ...')
      return false
    }else if(formData.ZSUPPLIER_NAME == '' || formData.ZSUPPLIER_NAME == undefined){
      errorToast('Please Select the Supplier Name ...')
      return false
    }else if(Types != Types1){
      errorToast('Please Select The Correct PO Number ...')
      return false
    }else if(formData.invoice_dates == '' || formData.invoice_dates == undefined){
      errorToast('Please Select the Invoice date ...')
      return false
    }else if(formData.invoice_no == '' || formData.invoice_no == '0'){
      errorToast('Please Enter Invoice Number ...')
      return false
    }else if(formData.invoice_qty == ''){
      errorToast('Please Enter Invoice Qty ...')
      return false
    }else if(formData.invoice_rate == '' || formData.invoice_rate == '0'){
      errorToast('Please Enter Invoice Rate ...')
      return false
    }else if(formData.unload_lot == '' || formData.unload_lot == undefined){
      errorToast('Please select Unloading Details ...')
      return false
    }else if((poDatas.VEHICLETYPE == 'Rake' || poDatas.VEHICLE_TYPE == 'Rake') && (formData.FNR_NO == '' || formData.FNR_NO == undefined)){
      errorToast('Please select FNR Details ...')
      return false
    }else if((poDatas.VEHICLETYPE == 'Rake' || poDatas.VEHICLE_TYPE == 'Rake') && (formData.FNR_NO == '' || formData.FNR_NO == undefined)){
      errorToast('Please select FNR Details ...')
      return false
    }else if((poDatas.VEHICLETYPE == 'Rake' || poDatas.VEHICLE_TYPE == 'Rake') && TRIPSHEET_NO == ''){
      errorToast('Please select FNR Details ...')
      return false
    }
  }
  if(VECHICAL_STATUS == '27'){

    let load = Number(formData.wb_load_wt)
    let empty = Number(formData.wb_empty_wt)

    
    if((invoice_date == '' || invoice_date == undefined) && (formData.invoice_dates == undefined || formData.invoice_dates == '')){
      errorToast('Please Select the Invoice date ...')
      return false
    }else if((formData.invoice_no == '' || formData.invoice_no == '0')&&(formData.invoice_nos == '' || formData.invoice_nos == '0' || formData.invoice_nos == undefined)){
      errorToast('Please Enter Invoice Number ...')
      return false
    }else if((formData.invoice_qty == ''|| formData.invoice_qty == '0')&&(formData.invoice_qtys == '' || formData.invoice_qtys == '0' || formData.invoice_qtys == undefined)){
      errorToast('Please Enter Invoice Qty ...')
      return false
    }else if((formData.invoice_rate == '' || formData.invoice_rate == '0')&&(formData.invoice_rates == '' || formData.invoice_rates == '0' || formData.invoice_rates == undefined) ){
      errorToast('Please Enter Invoice Rate ...')
      return false
    }else if((empty == '') || (Number(empty < '1000'))){
      errorToast('Please Enter Correct Empty Weight ...')
      return false
    }else if((load == '') || (Number(load < '1000'))){
      errorToast('Please Enter Correct Load Weight...')
      return false
    }else if(Number(empty >= load)){
      errorToast('Please Check Weight Details...')
      return false
    }
  }
  let current_date = new Date();

    let fdata = {  ...formData, zvanumber: refid, formType: "U", ...poDatas,SCREEN_TYPE:SCREEN_TYPES,invoice_date:formData.invoice_dates || invoice_date,invoice_bag_count:invoice_bag_count,ZVA_NUM : IncrementType(last2),ZQTY:ZQTY,unload_lot:formData.unload_lot||unload_lots,ZVENDOR_CODE:ZVENDOR_CODE,WERKS:WERKS,MIGOApprovalByName:UserDetails.username,MIGOApprovalDt:current_date,MIGOApprovalBy:UserDetails.USERID,UnloadVendorCharge:UnloadVendorCharge,UnloadVendorName:UnloadVendorName,invoice_rate:invoice_rates||formData.invoice_rate,invoice_no:invoice_nos||formData.invoice_no,invoice_qty:invoice_qtys||formData.invoice_qty,CONTAINER_NO:CONTAINER_NOS,LGORT:LGORT,FNR_NO:formData.FNR_NO,TRIPSHEET_NO:TRIPSHEET_NO
  };
    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    if (keys.length > 0) {
      let FileSaveUrl="";
        let postdata = new FormData();
    
      let {Invoicecopy,WBCopy,NagaOutsideWBCopy} = ImgData;
      
 
        postdata.append("image[]", Invoicecopy);
        postdata.append("image[]", WBCopy);
        postdata.append("image[]", NagaOutsideWBCopy);
     
    
      
      // FileSaveUrl=SaveCaptureImage;
     
      let UploadFile=0;
      let UploadFile1=0;
      let UploadFile2=0;

      Object.keys(attachedFiles).forEach((key) => {
      postdata.append("file[]", attachedFiles[key]);
      });

      UploadFile = attachedFiles.Invoicecopy && attachedFiles.Invoicecopy.name && attachedFiles.Invoicecopy.name.length ? true : false;
      UploadFile1 = attachedFiles.WBCopy && attachedFiles.WBCopy.name && attachedFiles.WBCopy.name.length ? true : false;
      UploadFile2 = attachedFiles.NagaOutsideWBCopy && attachedFiles.NagaOutsideWBCopy.name && attachedFiles.NagaOutsideWBCopy.name.length ? true : false;

      postdata.append("form_name", SCREEN_TYPES);
      postdata.append("ponumber", ZPO_NUMBER);
      postdata.append("VA_Number", ZVA_NUMBER + '-A');
      postdata.append("SubFolder", "Supplier_Dispatch_Info");
      // FileSaveUrl=uploadUrl;
      // FileSaveUrl=uploadandSaveImageUrl;

        // postdata.append("form_name", "MA");
        // postdata.append("ponumber", poData.ZPO_NUMBER);
        // postdata.append("VA_Number", ZVA_NUMBER + '-A');
        // postdata.append("SubFolder", "QCApproval");
      
      showLoader();
      apiPostMethod(sapFileShare, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.Invoicecopy = data.files[0] ? data.files[0].updname : "";
            fdata.WBCopy = data.files[1] ? data.files[1].updname : "";
            fdata.NagaOutsideWBCopy = data.files[2] ? data.files[2].updname : "";
            updateFormDatas(fdata);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      updateFormDatas(fdata);
    }
  };
  const updateFormDatas = (fdata) => {
    let msg="MIGO REVERSE ENTRY"
    confirmDialog({
      title: "Are you sure want to Add?",
      description: msg,
    }).then((res) => {
      if (res) {
        showLoader();
      apiPostMethod(apiBaseUrl + "Wrongentry/PO_Entry_Reversal", fdata)
      .then((response) => {
        console.log(JSON.stringify(response))
        WrongWBApproval(id)
          console.log(JSON.stringify(response))
          //  ShowToast("Saved Successfully...");
          //  history.push(`/AP`);
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    }
  }); 
  };
  
  const WrongWBApproval = (id) => {

    let str = id;
    str = str.substring(1);

    const postdata = {
      id:str,
      VECHICAL_STATUS:'29',
    }
          apiPostMethod(apiBaseUrl + "Wrongentry/WrongWBApproval", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            ShowToast("Saved Successfully...");
            if(VECHICAL_STATUS == '27'){
            history.push(`/AP`);
            }else{
              history.push(`/WAP`);
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

  // const onApprovePO = () => {
  //   let fdata = { formType: "A", id: poData.PI_REFID };
  //   showLoader();
  //   apiPostMethod(maUrl, fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       if (data.success) {
  //         window.open(BASE_URL+"/#/STOSDTSlip:"+refid, "", "width=900,height=650")
  //         history.push(`/AP`);
  //       }
  //     })
  //     .catch((error) => {
  //       errorToast("Something went wrong, please try again after sometime");
  //     })
  //     .finally((a) => {
  //       hideLoader();
  //     });
  // };
  const {
    PI_REFID,
    BROCKER_NAME,
    IDNLF,
    MATNR,
    NETPR,
    PLANT_NAME,
    STORAGE_LOCATION,
    INCO_DESC,
    POLOADINGDATE,
    VEHICLETYPE,
    PO_Bag_Type,
    PURCHASE_ORG,
    ZVENDOR_NAME,
    VEHICLE_TYPE,
    POBAG_NAME,
    // ZPO_LINE_ITEM,
    
  } = poDatas;
  
  const {
    ZPO_NUMBER,
    PO_LINE_ITEM,
    TRUCK_NO,
    ZSUPPLIER_CODE,
    ZSUPPLIER_NAME,
    ZVA_NUMBER,
    wb_name,
    wb_serial_no,
    wb_load_wt,
    bag_type,
    bag_type2,
    bag_type3,
    BAG_NAME,
    BAG_NAME2,
    BAG_NAME3,
    no_bags,
    no_bags2,
    no_bags3,
    wb_empty_wt,
    wb_net_wt,
    gunny_wt,
    gunny_less_wt,
    supplier_wb_dt,
    supplier_wb_qty,
    invoice_rate,
    invoice_no,
    invoice_qty,
    supp_inv_copy,
    supp_wb_copy,
    naga_os_wb_copy,
    is_own_wb,
    wb_ticket_no,
    DRIVER_NO,
    BROCKER_NAMES,
    IDNLFS,
    StorageLocation,
    PlantDescription,
    ZSUPPLIER_CODES,
    ZSUPPLIER_NAMES,
    VECHICAL_STATUS,
    invoice_dates,
    ZPO_LINE_ITEM,
    invoice_nos,
    invoice_qtys,
    invoice_rates,
    unload_lot,
    FNR_NO
  } = formData;  

  let last2 = ZVA_NUMBERS.slice(-2);

  const IncrementType = (id) => {
  if(id == '-A'){
    var str = ZVA_NUMBERS
    str = str.toString();
    str = str.slice(0, -2);
    return str+'-B'
  }else if(id == '-B'){
    var str = ZVA_NUMBERS
    str = str.toString();
    str = str.slice(0, -2);
    return str+'-C'
  }else if(id == '-C'){
    var str = ZVA_NUMBERS
    str = str.toString();
    str = str.slice(0, -2);
    return str+'-D'
  }else{
    return ZVA_NUMBERS+'-A'
  }
}

return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Wrong Entry : {ZVA_NUMBER}
      </p>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">VA Number</Label>
                  <Input type="text" value={IncrementType(last2)} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>
              {VECHICAL_STATUS == '27' &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={PO_NUMBERS} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label>PO Number</Label>
                    <Select
                      options={poOptions}
                      id={"EBELN"}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZPO_NUMBER, value: ZPO_NUMBER }}
                      onChange={(e) => onPOChange(e)}
                    />
                    <span id="ZPO_NUMBER_Error" style={{color: "red"}} ></span>
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  {!ZPO_NUMBER ? (
                    <Input type="text" disabled={true} placeholder={"Select the PO Number"} />
                  ) : (
                    <Select
                      options={poLineOption}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZPO_LINE_ITEM, value: ZPO_LINE_ITEM }}
                      onChange={(e) => onLineItemchange(e)}
                    />
                  )}
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '27' &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  <Select
                    isDisabled={VECHICAL_STATUS == '27'}
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                    value={{ label: PO_LINE_ITEM, value: PO_LINE_ITEM }}
                    onChange={(e) => onTextChange(e, "PO_LINE_ITEM")}
                  />
                </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  {/* {!ZPO_NUMBER || !ZPO_LINE_ITEM ? (
                    <Input type="text" disabled={true} value={ZVENDOR_NAME} placeholder={"Select the PO Line Item"} />
                  ) : ( */}
                    <Select
                      isDisabled={VECHICAL_STATUS == '27'}
                      options={supplierOptions}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                      onChange={(e) => onSupplierChange(e)}
                    />
                  {/* )} */}
                </FormGroup>
              </Col>
              {VECHICAL_STATUS == '28' && (VEHICLE_TYPE == 'Rake' || VEHICLETYPE == 'Rake') &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>FNR NO</Label>
                  {!ZPO_NUMBER ? (
                    <Input type="text" disabled={true} placeholder={"Select FNR NO"} />
                  ) : (
                    <Select
                      options={FNR_NOS}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: FNR_NO, value: FNR_NO }}
                      onChange={(e) => onFNRNOCHANGE(e)}
                    />
                  )}
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' && (VEHICLE_TYPE == 'Rake' || VEHICLETYPE == 'Rake') &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>TRIPSHEET NO</Label>
                    <Input type="text" value={TRIPSHEET_NO} disabled={true} placeholder={"Tripsheet No"} />
                </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Broker Name</Label>
                  <Input type="text" value={ BROCKER_NAME || ZVENDOR_NAME} disabled placeholder="Broker Name" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Wheat Variety</Label>
                  <Input type="text" value={IDNLFS || IDNLF} disabled placeholder="Wheat Variety" />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup> 
                  <Label for="lastNameMulti">{`${CONTAINER_NOS ? "Trailer" : "Vehicle"} Number`}</Label>
                  <Input
                    disabled
                    type="text"
                    value={TRUCK_NO}
                    onChange={(e) => onTextChange(e, "TRUCK_NO")}
                    placeholder="Vehicle Number"
                    maxlength={10}
                  />
                </FormGroup>
              </Col>
              {CONTAINER_NOS == ''  ?
              '' : CONTAINER_NOS == undefined ? '' :
              <Col md="4" sm="12">
                  <FormGroup>
                    <Label for="cityMulti">Container Number</Label>
                    <Input type="text" value={CONTAINER_NOS} disabled placeholder="Container Number" />
                  </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Driver Number</Label>
                  <Input type="text" value={DRIVER_NO} disabled placeholder="Driver No" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Vehicle Type</Label>
                  <Input type="text" value={VEHICLETYPE || VEHICLE_TYPE} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Plant Description</Label>
                  <Input type="text" value={PLANT_NAME} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Purchase PO ORG</Label>
                  <Input type="text" value={VEHICLETYPE == 'Truck' ? '14' : VEHICLETYPE == 'Container' ? '12' : VEHICLE_TYPE == 'Truck' ? '14' : VEHICLE_TYPE == 'Container' ? '12' :'13'} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>
              {POLOADINGDATE != undefined &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Loading Date</Label>
                  <Input type="text" value={POLOADINGDATE} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>}
              {(POLOADINGDATE == undefined && supplier_wb_dt != null) &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Loading Date</Label>
                  <Input type="text" value={supplier_wb_dt} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Material Number</Label>
                  <Input type="text" value={MATNR} disabled placeholder="Material Number" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Storage Location</Label>
                  <Input type="text" value={STORAGE_LOCATION} disabled placeholder="Receiving Storage Location" />
                </FormGroup>
              </Col>
            {VECHICAL_STATUS == '27' && invoice_rate != '0' &&
              <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <NumberOnlyInput
                        decimalFormat={"2,2"}
                        placeholder="Decimal (2,2)"
                        value={invoice_rate}
                        disabled
                      />
                    </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '27' && invoice_rate == '0' &&
              <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <NumberOnlyInput
                        decimalFormat={"2,2"}
                        placeholder="Decimal (2,2)"
                        value={invoice_rates}
                        onChange={(e) => onTextChange(e, "invoice_rates")}
                      />
                    </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' && 
              <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <NumberOnlyInput
                        decimalFormat={"2,2"}
                        placeholder="Decimal (2,2)"
                        value={invoice_rate}
                        onChange={(e) => onTextChange(e, "invoice_rate")}
                      />
                    </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '27' && invoice_no != null &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice No</Label>
                    <Input
                    type="text"
                    disabled
                    value={invoice_no}
                    placeholder="Invoice Number"
                    />
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '27' && invoice_no == null &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice No</Label>
                    <Input
                    type="text"
                    value={invoice_nos}
                    onChange={(e) => onTextChange(e, "invoice_nos")}
                    placeholder="Invoice Number"
                    />
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice No</Label>
                    <Input
                    type="text"
                    disabled={VECHICAL_STATUS == '27' && invoice_no != null }
                    value={invoice_no}
                    onChange={(e) => onTextChange(e, "invoice_no")}
                    placeholder="Invoice Number"
                    />
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '27' && invoice_rate != '0'  &&
              <Col md="4" sm="12">
                {/* <FormGroup> */}
                  <Label for="invoice_date">Invoice Date</Label>
                  <Input type="date" 
                  name="date"
                  max={today}                      
                  value={invoice_date ? invoice_date.split(" ")[0] : ""}
                  placeholder="Vehicle Type" 
                  // disabled={invoice_date == ''}
                  disabled
                  id="invoice_date"
                  />
                {/* </FormGroup> */}
              </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                    <Label for="invoice_dates">Invoice Date</Label>
                    <Input
                      type="date"
                      name="date"
                      max={today}
                      value={invoice_dates}
                      id="invoice_dates"
                      onChange={(date) => onTextChange(date, "invoice_dates")}
                      placeholder="Supplier WB Date"
                    />
                </Col>}
                {( VECHICAL_STATUS == '27' && invoice_rate == '0') &&
              <Col md="4" sm="12">
                    <Label for="invoice_dates">Invoice Date</Label>
                    <Input
                      type="date"
                      name="date"
                      max={today}
                      value={invoice_dates}
                      id="invoice_dates"
                      onChange={(date) => onTextChange(date, "invoice_dates")}
                      placeholder="Supplier WB Date"
                    />
                </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                    <NumberOnlyInput
                    roundValue
                    maxValue={70000}
                    disabled={VECHICAL_STATUS == '27' && invoice_qty != '0'}
                    value={invoice_qty}
                    onChange={(e) => onTextChange(e, "invoice_qty")}
                    placeholder="Max 70000"
                    />
                </FormGroup>
              </Col>}
              {(VECHICAL_STATUS == '27' && invoice_qty != '0') &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                    <NumberOnlyInput
                    roundValue
                    maxValue={70000}
                    value={invoice_qty}
                    disabled
                    />
                </FormGroup>
              </Col>}
              {(VECHICAL_STATUS == '27' && invoice_qty == '0') &&
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                    <NumberOnlyInput
                    roundValue
                    maxValue={70000}
                    value={invoice_qtys}
                    onChange={(e) => onTextChange(e, "invoice_qtys")}
                    placeholder="Max 70000"
                    />
                </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Bag Type</Label>
                  <Input type="text" value={PO_Bag_Type || POBAG_NAME} disabled placeholder="PO Bag Type" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>WB Type</Label>
                  <Input type="text" 
                  value={getwbValue(is_own_wb)}
                   disabled
                   />
                </FormGroup>
              </Col>
              {is_own_wb === "2" ? (
                <>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">WB Name</Label>
                      <Input
                        type="text"
                        value={wb_name}
                        onChange={(e) => onTextChange(e, "wb_name")}
                        placeholder="WB Name"
                        disabled
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">WB Serial Number</Label>
                      <Input
                        type="text"
                        disabled
                        value={wb_serial_no}
                        onChange={(e) => onTextChange(e, "wb_serial_no")}
                        placeholder="WB Serial Number"
                      />
                    </FormGroup>
                  </Col>
                </>
              ) : (
                ""
              )}
              {is_own_wb === "1" ? (
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>Ticket No</Label>
                    <Input type="text" value={wb_ticket_no} disabled />
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Load Wt (In Kgs)</Label>
                  <NumberOnlyInput
                    type="text"
                    value={wb_load_wt}
                    maxLength={8}
                    disabled={VECHICAL_STATUS == '28'}
                    onChange={(e) => onTextChange(e, "wb_load_wt")}
                    placeholder="WB Load Wt (In Kgs)"
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Empty Wt (In Kgs)</Label>
                  <NumberOnlyInput
                    maxLength={5}
                    type="text"
                    value={wb_empty_wt}
                    disabled={VECHICAL_STATUS == '28'}
                    // disabled={is_own_wb === "1" || isReadOnly ? true : false}
                    onChange={(e) => onTextChange(e, "wb_empty_wt")}
                    placeholder="WB Empty wt (In Kgs)"
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Net Wt (In Kgs)</Label>
                  <Input type="text" value={wb_net_wt} disabled placeholder="WB Net wt (In Kgs)" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Gunny Wt (In Kgs)</Label>
                  <Input type="text" value={gunny_wt} disabled placeholder="Gunny wt (In Kgs)" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Gunny Less Net Wt (In Kgs)</Label>
                  <Input type="text" value={gunny_less_wt} disabled placeholder="Gunny Less Net wt (In Kgs)" />
                </FormGroup>
              </Col>
              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Received Bag Type</Label>
                  <Select
                    isDisabled
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME, value: bag_type }}
                    // onChange={(e) => onBagTypeChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags</Label>
                  <Input
                    disabled
                    type="text"
                    value={no_bags}
                    onChange={(e) => onTextChange(e, "no_bags")}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>

              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Received Bag Type(2)</Label>
                  <Select
                    isDisabled
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME2, value: bag_type2 }}
                    // onChange={(e) => onBagTypeChange2(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(2)</Label>
                  <Input
                    disabled
                    type="text"
                    value={no_bags2}
                    onChange={(e) => onTextChange(e, "no_bags2")}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>

              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Received Bag Type(3)</Label>
                  <Select
                    isDisabled
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME3, value: bag_type3 }}
                    // onChange={(e) => onBagTypeChange3(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(3)</Label>
                  <Input
                    disabled
                    type="text"
                    value={no_bags3}
                    onChange={(e) => onTextChange(e, "no_bags3")}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>
              {VECHICAL_STATUS == '27' &&
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Unloading Lot</Label>
                  <Input
                    disabled
                    type="text"
                    value={unload_lots}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>}
              {VECHICAL_STATUS == '28' &&
              <Col md="4" sm="12">
                <Label for="cityMulti">Unloading Lot</Label>
                <Input type="hidden" id="unload_lot" value={unload_lot} onChange={(e) => onTextChange(e, "unload_lot")} placeholder="Unload Lot" />
                <CustomDropdownInput
                form={form} 
                id="lstunload_lot" 
                value={formData.lotoption}
                options= {lotoption} 
                onChange={(e) => OnLotChange(e)} />
                <span id="unload_lot_Error" style={{color: "red"}} ></span>
              </Col>}
              <Col md="4" sm="12">
                    <Uploader
                      isReadOnly={!attachedFiles.supp_inv_copy.name || isReadOnly}
                      canEdit={!isReadOnly}
                      setAttachment={handleFileChange}
                      label={"Invoice copy"}
                      title="Attach Invoice copy"
                      id={"supp_inv_copy"}
                      selectedFileName={attachedFiles.supp_inv_copy.name ? attachedFiles.supp_inv_copy.name : supp_inv_copy}
                    />
                  </Col>
                  <Col md="4" sm="12">
                    <Uploader
                      isReadOnly={!attachedFiles.supp_wb_copy.name || isReadOnly}
                      canEdit={!isReadOnly}
                      setAttachment={handleFileChange}
                      label={"Supplier WB Copy"}
                      title="Attach WB Copy"
                      id={"supp_wb_copy"}
                      selectedFileName={attachedFiles.supp_wb_copy.name ? attachedFiles.supp_wb_copy.name : supp_wb_copy}
                    />
                  </Col> 
                  {is_own_wb === "2" ? (
                <Col md="4" sm="12">
                  <Uploader
                    isReadOnly={!attachedFiles.naga_os_wb_copy.name || isReadOnly}
                    canEdit={!isReadOnly}
                    setAttachment={handleFileChange}
                    label={"Naga Outside WB Copy"}
                    title="AttachNaga Outside WB Copy"
                    id={"naga_os_wb_copy"}
                    selectedFileName={attachedFiles.naga_os_wb_copy.name ? attachedFiles.naga_os_wb_copy.name : naga_os_wb_copy}
                  />
                </Col>
              ) : (
                ""
              )}
            </Row>
            <Row className="mt-3">
             
                <Col className="offset-md-6 d-md-flex justify-content-end" >
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/WAP`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  {/* {!isReadOnly && ( */}
                  {VECHICAL_STATUS == '27' && last2 != '-C' &&
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" 
                    //   disabled={isFilledAll()} 
                      // onClick={(e) => onUpdatePo()}
                      onClick={(e) => AddDatasPO()}
                      >
                        Approve
                      </Button.Ripple>
                  </div>}
                  {VECHICAL_STATUS == '28' && last2 != '-C' &&
                  <div className="mr-1">
                    <Button.Ripple color="primary" type="button" 
                  //   disabled={isFilledAll()} 
                    onClick={(e) => AddDatasPO()}
                    >
                      Approve
                    </Button.Ripple>
                    </div>}
                  {/* )} */}
                </FormGroup>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default WrongEntry;
