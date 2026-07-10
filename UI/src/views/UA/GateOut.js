import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import { useFormik } from "formik";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import { CustomDropdownInput } from "../forms/custom-form";
import { Link, useHistory } from "react-router-dom";
import { mbagUrl, mpolineUrl, uploadUrl, uaUrl, msuppUrl, mtickUrl,BASE_URL,SaveCaptureImage, apiBaseUrl } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { roundOf } from "../../helper/appHelper";
import Uploader from "../Uploader";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useLoader } from "../../utility/hooks/useLoader";
import moment from "moment";
import CaptureImage from "../CaptureImage";
export const wbOptions = [
  {
    options: [
      { value: "1", label: "OWN WB" },
      { value: "2", label: "OUTSIDE WB" },
    ],
  },
];

export const getSelectedWbOption = (label) => {
  return wbOptions[0].options.filter((a) => label)[0];
};

const CheckOut = () => {

  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  let { id } = useParams();
  let refid = id.replace(":", "");

  const [poData, setPoData] = useState({});
  const [formData, setFormaData] = useState({});

  const [ImgData, setImgData] = useState({});

  const [, setBagTypedata] = useState([]);
  const [, setPOLinedata] = useState([]);
  const [bagweight, setBagweight] = useState(0);
  const [bagweight2, setBagweight2] = useState(0);
  const [bagweight3, setBagweight3] = useState(0);
  const [attachedFiles, setAttachment] = useState({ gosic: {}, goswb: {}, gonowc: {},supp_wb_copy:{} });

  const [, setSupplierdata] = useState([]);
  const [ticketOptions, setTicketdata] = useState([]);

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
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
  
  });
  const onFetchPodetailsById = () => {
    console.log("onFetchPodetailsById");
    let fdata = { id: refid, formType: "PO" };
    showLoader();
    apiPostMethod(uaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          console.log("FETCHSUCCESS");
          const podata = data.results[0];
          const fmdata = data.fresults[0];
          const TicketDetails = data.TicketDetails;
          setBagweight(podata.WEIGHT);
          setBagweight2(podata.WEIGHT2);
          setBagweight3(podata.WEIGHT3);
        
          setPoData({ ...poData, ...podata });
          onFetchPOLine(podata.ZPO_NUMBER, podata.SCREEN_TYPE);
          onFetchSupplier(podata.ZPO_NUMBER, fmdata.PO_LINE_ITEM, podata.SCREEN_TYPE);
          
          
          if(data.OwnWBID>0){
            form.setFieldValue("WBType", {  label: "OWN WB", value: 1 });
        
   fmdata.is_own_wb="1";
   fmdata.WBTypeLabel="OWN WB";
   fmdata.WBTypeId="1";
   
   /*setTicketdata([{ label: data.TicketDetails[0].label,
  value:data.TicketDetails[0].value,
  First_Weight:data.TicketDetails[0].First_Weight,
  Net_Weight:data.TicketDetails[0].Net_Weight,
  Second_Weight:data.TicketDetails[0].Second_Weight,

  }]);*/
  
   setTicketdata([{ label: data.TicketDetails[0].label,
  value:data.TicketDetails[0].value,
  First_Weight:data.TicketDetails[0].First_Weight,
  Net_Weight:data.TicketDetails[0].Net_Weight,
  Second_Weight:data.TicketDetails[0].Second_Weight,
  }]);
  
  fmdata.wb_ticket_no=data.TicketDetails[0].value;
  fmdata.wb_load_wt=data.TicketDetails[0].First_Weight;
  fmdata.wb_empty_wt =data.TicketDetails[0].Second_Weight;
  fmdata.wb_net_wt=data.TicketDetails[0].Net_Weight;
  
  
  console.log("label: "+data.TicketDetails[0].label + "value:"+data.TicketDetails[0].value );
  console.log(ticketOptions);
  //onTicketChange
  //form.setFieldValue("lstTicketNo", { label: data.TicketDetails[0].label,value:data.TicketDetails[0].value });
  
  /*
 // onTicketChange(data.TicketDetails[0], "wb_ticket_no");//for test
let First_Weight=data.TicketDetails[0].First_Weight;
let Second_Weight=data.TicketDetails[0].Second_Weight;
let Net_Weight=data.TicketDetails[0].Net_Weight
let no_bags=data.fresults[0].no_bags;
let no_bags2=data.fresults[0].no_bags2;
let no_bags3=data.fresults[0].no_bags3;


    wb_load_wt = Number(First_Weight) > Number(Second_Weight) ? First_Weight : Second_Weight;
    wb_empty_wt = Number(First_Weight) > Number(Second_Weight) ? Second_Weight : First_Weight;
    wb_net_wt = Net_Weight;

   
    const gw = calgunnyweight(bagweight, no_bags,no_bags2,no_bags3);
    gunny_less_wt=roundOf(Number(wb_net_wt) - Number(gw));

    fmdata.wb_load_wt=wb_load_wt;
    fmdata.wb_empty_wt=wb_empty_wt;
    fmdata.wb_empty_wt=wb_empty_wt;
    fmdata.wb_ticket_no=data.TicketDetails[0].value;
    fmdata.gunny_less_wt=gunny_less_wt;*/
    /*setFormaData({
      ...formData,
      wb_load_wt,
      wb_empty_wt,
      wb_net_wt,
      [key]: value,
      gunny_less_wt: ,
    });*/

   }else{
    fmdata.is_own_wb="2";
    fmdata.WBTypeLabel="OUTSIDE WB";
    fmdata.WBTypeId="2";
   }
          setFormaData({ ...formData, ...fmdata });
          

        }
      })
      .catch((error) => {
        errorToast(error);
      })
      .finally((a) => {
        hideLoader();
      });
  };

 
  const onFetchPOLine = (PO_number, screentype) => {
    let fdata = { PO_NUMBER: PO_number, screenType: screentype };
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

  const onFetchBagTypes = () => {
    apiGetMethod(mbagUrl)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setBagTypedata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  // const onSupplierChange = (e) => {
  //   setFormaData({
  //     ...formData,
  //     ZSUPPLIER_CODE: e.value,
  //     ZSUPPLIER_NAME: e.label,
  //   });
  // };

  const onFetchSupplier = (PO_NUMBER, lineItem, screenType) => {
    let fdata = { PO_NUMBER: PO_NUMBER, lineItem: lineItem, screenType: screenType };
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
  const onGateOutValid = () => {
   
    if(isFilledAll()){
      return false;
    }
    if (Math.abs(Number(formData.gunny_less_wt) - Number(formData.invoice_qty)) > 100) {
      confirmDialog({
        title: "Are you sure?",
        description:
          "Difference between Gunny less weight and Invoice weight is more than 100kg. Are you sure you want to proceed for gateout?",
      }).then((res) => {
        if (res) {
          Sapgateoutentry();
        }
      });
    } else {
      Sapgateoutentry();
    }
  };

  const Sapgateoutentry = () => {
    const fdata1 = { ...formData,id:refid}

    apiPostMethod(apiBaseUrl + "Sap/SapgateoutentryController/index", fdata1)
      .then((response) => {
        console.log(response.data)
        if (response.data.success == 0) {
          errorToast(response.data.error)
          return false
        }else if (response.data.success == 1) {
          onGateOutDetails()
        }
    })
  };

  const onGateOutDetails = () => {

   
    
    let fdata = { ...formData, id: refid, formType: "A" };
    let FileSaveUrl="";
    if ((attachedFiles.gonowc && attachedFiles.gonowc.name) || ImgData.NagaOutsideWBCopy!=null) {
      let postdata = new FormData();
      if(ImgData.NagaOutsideWBCopy!=null){

       postdata.append("image[]", ImgData.NagaOutsideWBCopy);
      FileSaveUrl=SaveCaptureImage;

      postdata.append("form_name", poData.SCREEN_TYPE);
      postdata.append("ponumber", poData.ZPO_NUMBER);
      postdata.append("VA_Number", poData.ZVA_NUMBER);
      postdata.append("SubFolder", "Unloading");

      }else{
      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles.gonowc);
      });
      postdata.append("form_name", poData.SCREEN_TYPE);
      postdata.append("ponumber", poData.ZPO_NUMBER);
      postdata.append("VA_Number", poData.ZVA_NUMBER);
      postdata.append("SubFolder", "Unloading");
      FileSaveUrl=uploadUrl;
      }
      showLoader();
      apiPostMethod(uploadUrl, postdata, "File")
        .then((response) => {
          const { data } = response;
          if (data.success) {
            fdata.naga_os_wb_copy = data.files[0].updname;
            saveData(fdata);
          } else {
            const ferr = data.files.map((item) => item.orgname).join(",");
            errorToast(ferr + " file format is not supported ");
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      if (attachedFiles.supp_wb_copy && attachedFiles.supp_wb_copy.name) {
       // alert("to upload");
        let postdata = new FormData();
        Object.keys(attachedFiles).forEach((key) => {
          postdata.append("file[]", attachedFiles.supp_wb_copy);
        });
        postdata.append("form_name", poData.SCREEN_TYPE);
        postdata.append("ponumber", poData.ZPO_NUMBER);
        postdata.append("SubFolder", "Unloading");
        showLoader();
       // alert("postdata"+JSON.stringify(JSON.stringify(postdata)));
        apiPostMethod(uploadUrl, postdata, "File")
          .then((response) => {
            const { data } = response;
            if (data.success) {
              fdata.supp_wb_copy = data.files[0].updname;
             // alert("fdata"+JSON.stringify(fdata));
              saveData(fdata);
            } else {
              const ferr = data.files.map((item) => item.orgname).join(",");
              errorToast(ferr + " file format is not supported ");
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      }else{
      //  alert("tosave");
     saveData(fdata);
      }
    }
  };

  const saveData = (fdata) => {
    showLoader();
    apiPostMethod(uaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          //Print out Format;
          window.open(BASE_URL+"/#/STOSDTSlip:"+refid, "", "width=900,height=650")
          history.push(`/VA`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  useEffect(() => {
    if (!poData || Object.keys(poData).length === 0) {
      onFetchPodetailsById();
      onFetchBagTypes();
    }
  }, [poData]);

  useEffect(() => {
    updateGunnyWeight();
  }, [formData.bag_type, formData.no_bags, formData.wb_load_wt, formData.wb_empty_wt]);
  const updateGunnyWeight = () => {
    console.log("Calc Gunny Weight");
    console.log(bagweight);
    console.log(bagweight2);
    console.log(bagweight3);
    
    const { no_bags,no_bags2,no_bags3, wb_load_wt, wb_empty_wt } = formData;
    const gw = calgunnyweight(bagweight,bagweight2,bagweight3, no_bags,no_bags2,no_bags3);
    if (gw) {
      let db = {
        gunny_wt: gw,
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
  const updateGunnyWeight_OLD = () => {
    const { no_bags, wb_load_wt, wb_empty_wt } = formData;
    const gw = calgunnyweight(bagweight, no_bags);
    if (gw) {
      let db = {
        gunny_wt: gw,
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

  // const onBagTypeChange = (e) => {
  //   setBagweight(e.weight);
  //   const dp = { bag_type: e.value, BAG_NAME: e.label };
  //   setFormaData({
  //     ...formData,
  //     ...dp,
  //   });
  // };

  const onWBChange = (e, key) => {
    onTextChange(e, key);
    const { value } = e;
    if (value === "1") {
      onFetchTicket();
      formData.WBTypeId=1;
      formData.WBTypeLabel="OWN WB";
    }
    if (value === "2") {
     
      formData.WBTypeId=2;
      formData.WBTypeLabel="OUTSIDE WB";
    }
    setFormaData({
      ...formData,
      wb_load_wt: "",
      wb_empty_wt: "",
      wb_net_wt: "",
      wb_name: "",
      wb_serial_no: "",
      [key]: value,
      gunny_less_wt: "",
      
    });
  };
  const onTicketChange = (e, key) => {
    const { value, First_Weight, Second_Weight, Net_Weight } = e;
    console.log("inticket")
    console.log(JSON.stringify(e));
    let wb_load_wt,
      wb_empty_wt,
      wb_net_wt = "";
    let wb_ticket_no=value;
    wb_load_wt = Number(First_Weight) > Number(Second_Weight) ? First_Weight : Second_Weight;
    wb_empty_wt = Number(First_Weight) > Number(Second_Weight) ? Second_Weight : First_Weight;
    wb_net_wt = Net_Weight;

    const { no_bags,no_bags2,no_bags3 } = formData;
    const gw = calgunnyweight(bagweight, no_bags,no_bags2,no_bags3);
    setFormaData({
      ...formData,
      wb_ticket_no,
      wb_load_wt,
      wb_empty_wt,
      wb_net_wt,
      [key]: value,
      gunny_less_wt: roundOf(Number(wb_net_wt) - Number(gw)),
    });
  };


  const onFetchTicket = () => {
  
    let fdata = { id: refid, formType: "PO" };
   
    apiPostMethod(uaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          //setTicketdata([{ options: data.TicketDetails }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onFetchTicket_OLD = () => {
  
    apiGetMethod(mtickUrl,)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setTicketdata([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const calgunnyweightOLD = (bagwt, nobag) => {
    if (bagwt && nobag) {
      return (Number(bagwt) * Number(nobag)).toFixed(3);
    }
    return "";
  };
  const calgunnyweight = (bagwt,bagwt2,bagwt3, nobag,nobag2,nobag3) => {
    console.log("Calc G Weight");
    if(bagwt=="") { bagwt=0; }
    if(bagwt2=="") { bagwt2=0; }
    if(bagwt3=="") { bagwt3=0; }
    let Tot=(bagwt*nobag)+(bagwt2*nobag2)+(bagwt3*nobag3);
    Tot=Tot.toFixed(2);


   return Tot;
    
  };
  const fileUploadAction = (id) => {
    document.getElementById(id).click();
  };
  const handleFileChangeAtt = (file, id) => {
    setAttachment((p) => ({
      ...p,
      [id]: file,
    }));
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0].size > 5242880) {
      errorToast("File Size is too Large. Please try again with less than 5Mb");
    } else {
      let _filesarr = {
        ...attachedFiles,
        [e.target.id]: e.target.files[0],
      };
      setAttachment(_filesarr);
    }
  };
  const isFilledAll = () => {
    let fmdata = { ...formData };
    delete fmdata.s_supplier_wb_dt;
    delete fmdata.s_supplier_wb_qty;
    if (fmdata.is_own_wb === "1") {
      delete fmdata.wb_name;
      delete fmdata.wb_serial_no;
    } else {
      delete fmdata.wb_ticket_no;
    }
    if (poData.VEHICLE_TYPE === "Rake") {
      delete fmdata.invoice_bag_count;
      delete fmdata.invoice_date;
      delete fmdata.invoice_no;
      delete fmdata.invoice_rate;
      delete fmdata.invoice_qty;
      delete fmdata.supp_wb_copy;
      delete fmdata.supp_inv_copy;
      delete fmdata.supplier_wb_dt;
      delete fmdata.supplier_wb_qty;
    }

    const fmValues = Object.values(fmdata);
    showError("wb_load_wt_Error","Invalid WB Load Weight",0);
    showError("wb_empty_wt_Error","invalid WB Empty Weight ",0); 
    showError("gonowc_Error","Upload File Error ",0); 

    showError("is_own_wb_Error","Upload File Error ",0); 
    showError("wb_ticket_no_Error","Upload File Error ",0); 
    showError("wb_name_Error","Upload File Error ",0); 
    showError("wb_serial_no_Error","Upload File Error ",0); 
    showError("wb_load_wt_Error","Upload File Error ",0); 

    const { gonowc } = attachedFiles;
    if (fmdata.is_own_wb === "2") {
      if (!formData.wb_load_wt || formData.wb_load_wt.length < 3 || !formData.wb_empty_wt || formData.wb_empty_wt.length < 3) {
        if(!formData.wb_load_wt) { showError("wb_load_wt_Error","Invalid WB Load Weight",1); return true; }
        if(formData.wb_load_wt.length < 3) { showError("wb_load_wt_Error","Invalid WB Load Weight ",1); return true; }
        if(!formData.wb_empty_wt) { showError("wb_empty_wt_Error","Invalid WB Empty Weight ",1); return true; }
        if(formData.wb_empty_wt.length < 3) { showError("wb_empty_wt_Error","Invalid WB Empty Weight ",1); return true; }
        return true;
      } else if (!gonowc.name && ImgData.NagaOutsideWBCopy==null) {
       showError("gonowc_Error","Upload File Error ",1); 
        return true;
      }
    }
    if(!formData.is_own_wb) { showError("is_own_wb_Error","Invalid WB type ",1); return true; }
    if(formData.is_own_wb==1){
    if(!formData.wb_ticket_no) { showError("wb_ticket_no_Error","Invalid Ticket No ",1); return true; }
    }
    if(formData.is_own_wb==2){
      if(!formData.wb_name) { showError("wb_name_Error","Invalid WB Name ",1); return true; }
      if(!formData.wb_serial_no) { showError("wb_serial_no_Error","Invalid WB Name ",1); return true; }
      if(!formData.wb_load_wt) { showError("wb_load_wt_Error","Invalid WB Name ",1); return true; }
    }
console.log(JSON.stringify(fmValues));

 //   return !fmValues.every((x) => x !== null && x !== "");
  }
  const showError = (Id,Msg,show) => {
    if(document.getElementById(Id)) { 
      document.getElementById(Id).innerHTML="";
    if(show==1){
      console.log("SHOW ERROR:"+Id);
    document.getElementById(Id).innerHTML=Msg;
    }
  }
  }
  const isFilledAll_OLD = () => {
    let fmdata = { ...formData };
    delete fmdata.s_supplier_wb_dt;
    delete fmdata.s_supplier_wb_qty;
    if (fmdata.is_own_wb === "1") {
      delete fmdata.wb_name;
      delete fmdata.wb_serial_no;
    } else {
      delete fmdata.wb_ticket_no;
    }
    if (poData.VEHICLE_TYPE === "Rake") {
      delete fmdata.invoice_bag_count;
      delete fmdata.invoice_date;
      delete fmdata.invoice_no;
      delete fmdata.invoice_rate;
      delete fmdata.invoice_qty;
      delete fmdata.supp_wb_copy;
      delete fmdata.supp_inv_copy;
      delete fmdata.supplier_wb_dt;
      delete fmdata.supplier_wb_qty;
    }

    const fmValues = Object.values(fmdata);

    const { gonowc } = attachedFiles;
    if (fmdata.is_own_wb === "2") {
      if (!formData.wb_load_wt || formData.wb_load_wt.length < 3 || !formData.wb_empty_wt || formData.wb_empty_wt.length < 3) {
        return true;
      } else if (!gonowc.name) {
        return true;
      }
    }

    return !fmValues.every((x) => x !== null && x !== "");
  };
  const { gonowc } = attachedFiles;
  const { ZPO_NUMBER, ZVENDOR_NAME, IDNLF, NETPR, STORAGE_LOCATION, PLANT_NAME, MATNR, INCO_DESC, POBAG_NAME } = poData;
  const {
    PO_LINE_ITEM,
    TRUCK_NO,
    // ZSUPPLIER_CODE,
    ZSUPPLIER_NAME,
    wb_name,
    wb_serial_no,
    wb_load_wt,
    // bag_type,
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
    invoice_bag_count,
    is_own_wb,
    invoice_date,
    ZVA_NUMBER,
    WBTypeLabel,
    WBTypeId,
    wb_ticket_no
  } = formData;
console.log("formData"+JSON.stringify(formData))
  return (
    <div>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="12" sm="12">
                <h5>
                  Gate Out <span>(VA No: {ZVA_NUMBER})</span>
                </h5>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={ZPO_NUMBER} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Vehicle Number</Label>
                  <Input type="text" maxLength={10} value={TRUCK_NO} onChange={(e) => onTextChange(e, "TRUCK_NO")} placeholder="Vehicle Number" disabled/>
                </FormGroup>
              </Col>
              <Col md="4" sm="12"></Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Inco Terms</Label>
                  <Input type="text" value={INCO_DESC} disabled placeholder="Inco Terms" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Broker Name</Label>
                  <Input type="text" value={ZVENDOR_NAME} disabled placeholder="Broker Name" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Wheat Variety</Label>
                  <Input type="text" value={IDNLF} disabled placeholder="Wheat Variety" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Rate</Label>
                  <Input type="text" value={roundOf(NETPR)} disabled placeholder="PO Rate" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">Receiving Storage Location</Label>
                  <Input type="text" value={STORAGE_LOCATION} disabled placeholder="Receiving Storage Location" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Receiving Plant</Label>
                  <Input type="text" value={PLANT_NAME} disabled placeholder="Recieving Plant" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">PO Bag Type</Label>
                  <Input type="text" value={POBAG_NAME} disabled placeholder="PO Bag Type" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Material Number</Label>
                  <Input type="text" value={MATNR} disabled placeholder="Material Number" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  <Input type="text" value={PO_LINE_ITEM} disabled placeholder="Po Line Item" />

                  {/* <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                    value={{ label: PO_LINE_ITEM, value: PO_LINE_ITEM }}
                    onChange={(e) => onTextChange(e, "PO_LINE_ITEM")}
                  /> */}
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  <Input type="text" value={ZSUPPLIER_NAME} disabled placeholder="Supplier Name" />
                  {/* <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={supplierOptions}
                    value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                    onChange={(e) => onSupplierChange(e)}
                  /> */}
                </FormGroup>
              </Col>
              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Received Bag Type</Label>
                  <Input type="text" value={BAG_NAME} disabled placeholder="Received Bag Type" />
                  {/* <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME, value: bag_type }}
                    onChange={(e) => onBagTypeChange(e)}
                  /> */}
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(1)</Label>
                  <Input type="text" value={no_bags} disabled placeholder="Number of Bags" />
                  {/* <Input type="text" value={no_bags} onChange={(e) => onTextChange(e, "no_bags")} placeholder="Number of Bags" /> */}
                </FormGroup>
              </Col>


              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Bag Type(2)</Label>
                  <Input type="text" value={BAG_NAME2} disabled placeholder="Received Bag Type" />
                  {/* <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME, value: bag_type }}
                    onChange={(e) => onBagTypeChange(e)}
                  /> */}
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(2)</Label>
                  <Input type="text" value={no_bags2} disabled placeholder="Number of Bags" />
                  {/* <Input type="text" value={no_bags} onChange={(e) => onTextChange(e, "no_bags")} placeholder="Number of Bags" /> */}
                </FormGroup>
              </Col>

              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Bag Type(3)</Label>
                  <Input type="text" value={BAG_NAME3} disabled placeholder="Received Bag Type" />
                  {/* <Select
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME, value: bag_type }}
                    onChange={(e) => onBagTypeChange(e)}
                  /> */}
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(3)</Label>
                  <Input type="text" value={no_bags3} disabled placeholder="Number of Bags" />
                  {/* <Input type="text" value={no_bags} onChange={(e) => onTextChange(e, "no_bags")} placeholder="Number of Bags" /> */}
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                {<FormGroup>
                  <Label>WB Type</Label>
                 
                  <Select
                    className="react-select"
                    classNamePrefix="select"
                    //options={wbOptions}
                  value={{label:WBTypeLabel,value:WBTypeId}}
                   
                    onChange={(e) => onWBChange(e, "is_own_wb")}
                    disabled
                  />
                </FormGroup>}
                
               {/* <CustomDropdownInput  onChange={(e) => onWBChange(e, "is_own_wb")}  options={wbOptions} label={"WB Type"} form={form}   id="WBType" />
*/} <span id="is_own_wb_Error" style={{color: "red"}} ></span>
              </Col>
             
              {is_own_wb === "2" ? (
                <>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">WB Name</Label>
                      <Input type="text" value={wb_name} onChange={(e) => onTextChange(e, "wb_name")} placeholder="WB Name" />
                      <span id="wb_name_Error" style={{color: "red"}} ></span>
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">WB Serial Number</Label>
                      <Input
                        type="text"
                        value={wb_serial_no}
                        onChange={(e) => onTextChange(e, "wb_serial_no")}
                        placeholder="WB Serial Number"
                      />
                      <span id="wb_serial_no_Error" style={{color: "red"}} ></span>
                    </FormGroup>
                  </Col>
                </>
              ) : (
                ""
              )}
              {is_own_wb === "1" ? (
                <>
                <Col md="4" sm="12" style={{display:"none"}}>
                  <FormGroup>
                    <Label>Ticket No</Label>
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      options={ticketOptions}
                      onChange={(e) => onTicketChange(e, "wb_ticket_no")}
                      value={{label:wb_ticket_no,value:wb_ticket_no}}
                    
                    />
                  </FormGroup>
                  <span id="wb_ticket_no_Error" style={{color: "red"}} ></span>
                </Col>


</>
              ) : (
                ""
              )}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Load Wt (In Kgs)</Label>
                  <NumberOnlyInput
                    type="text"
                    maxLength={5}
                    value={roundOf(wb_load_wt)}
                    disabled={is_own_wb === "1" ? true : false}
                    onChange={(e) => onTextChange(e, "wb_load_wt")}
                    placeholder="WB Load Wt (In Kgs)"
                  />
                </FormGroup>
                <span id="wb_load_wt_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Empty Wt (In Kgs)</Label>
                  <NumberOnlyInput
                    maxLength={5}
                    type="text"
                    value={roundOf(wb_empty_wt)}
                    disabled={is_own_wb === "1" ? true : false}
                    onChange={(e) => onTextChange(e, "wb_empty_wt")}
                    placeholder="WB Empty wt (In Kgs)"
                  />
                </FormGroup>
                <span id="wb_empty_wt_Error" style={{color: "red"}} ></span>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">WB Net Wt (In Kgs)</Label>
                  <Input
                    type="text"
                    value={roundOf(wb_net_wt)}
                    disabled
                    onChange={(e) => onTextChange(e, "wb_net_wt")}
                    placeholder="WB Net wt (In Kgs)"
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Gunny Wt (In Kgs)</Label>
                  <Input type="text" value={roundOf(gunny_wt)} disabled placeholder="Gunny wt (In Kgs)" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Gunny Less Net Wt (In Kgs)</Label>
                  <Input type="text" value={gunny_less_wt} disabled placeholder="Gunny Less Net wt (In Kgs)" />
                </FormGroup>
              </Col>
              {poData.VEHICLE_TYPE !== "Rake" ? (
                <>
                  <Col md="4" sm="12">
                    <Label>Supplier WB Date</Label>
                    <Input
                      type="date"
                      name="date"
                      max={today}
                      value={supplier_wb_dt}
                      disabled
                      onChange={(date) => onTextChange(date, "supplier_wb_dt")}
                      placeholder="Supplier WB Date"
                    />
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Supplier WB Qty (In Kgs)</Label>
                      <NumberOnlyInput
                        maxLength={5}
                        type="text"
                        disabled
                        value={roundOf(supplier_wb_qty)}
                        onChange={(e) => onTextChange(e, "supplier_wb_qty")}
                        placeholder="Supplier WB Qty (In Kgs)"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <Input type="text" value={invoice_rate} placeholder="Invoice Rate (In Kgs)" disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <Label>Invoice Date</Label>
                    <Input
                      type="date"
                      name="date"
                      max={today}
                      value={invoice_date ? invoice_date.split(" ")[0] : ""}
                      placeholder="Invoice Date"
                      disabled
                    />
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice No</Label>
                      <Input type="text" value={invoice_no} placeholder="Invoice Number" disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                      <NumberOnlyInput maxLength={70000} type="text" value={invoice_qty} disabled placeholder="Max 70000" />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Bag Count</Label>
                      <Input type="text" value={invoice_bag_count} placeholder="Invoice Bag Count" disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <Uploader isReadOnly={true} label={"Supplier Invoice Copy"} selectedFileName={formData.supp_inv_copy} />
                  </Col>
                  <Col md="4" sm="12">
                    <Uploader isReadOnly={true} label={"Supplier WB Copy"} selectedFileName={formData.supp_wb_copy} />
                    
                    
                  </Col>
                  <Col md="4" sm="12" style={{display:"none"}}>
                  <Uploader
                  
                        setAttachment={handleFileChangeAtt}
                        label={"Supplier WB Copy"}
                        title="Attach Supplier WB Copy"
                        id={"supp_wb_copy"}
                        selectedFileName={attachedFiles.supp_wb_copy.name}
                      />

                  </Col>
                  
                </>
              ) : (
                ""
              )}
              {is_own_wb === "2" ? (
                <>
                <Col md="4" sm="12">
                  <Label for="nameMulti">Naga Outside WB Copy</Label>
                  <input
                    type="file"
                    className="form-control"
                    id="gonowc"
                    hidden
                    accept=".pdf, image/*"
                    onChange={(e) => {
                      handleFileChange(e);
                    }}
                  />
                  <span id="gonowc_Error" style={{color: "red"}} ></span>
                  <Button.Ripple
                    outline
                    color="primary"
                    onClick={(e) => {
                      fileUploadAction("gonowc");
                    }}
                  >
                    <Paperclip size={14} />
                    <span className="align-middle ml-25">Attach Naga Outside WB Copy</span>
                  </Button.Ripple>
                  <div>
                    <span className="align-middle ml-25">{gonowc.name}</span>
                  </div>
                </Col>
                 <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"NagaOutsideWBCopy"} />
                 </>
              ) : (
                ""
              )}
              <Col sm="12" className="mt-2">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/VA`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  <div className="mr-1">
                    {/*disabled={isFilledAll()} */}
                    <Button.Ripple color="primary" type="button"  onClick={(e) => onGateOutValid()}>
                      Gate Out
                    </Button.Ripple>
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CheckOut;
