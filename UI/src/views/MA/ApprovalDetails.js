import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { mbagUrl, mpolineUrl, maUrl, msuppUrl, uploadUrl,BASE_URL,SaveCaptureImage,uploadandSaveImageUrl, apiBaseUrl, sapFileShare } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { roundOf, ShowToast } from "../../helper/appHelper";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import Uploader from "../Uploader";
import { useLoader } from "../../utility/hooks/useLoader";
import moment from "moment";
import CaptureImage from "../CaptureImage";
import Modal from 'react-responsive-modal';
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useSelector } from "react-redux";

const MApproverDetails = () => {
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
  const [poLineOptions, setPOLinedata] = useState([]);
  const [bagweight, setBagweight] = useState(0);
  const [bagweight2, setBagweight2] = useState(0);
  const [bagweight3, setBagweight3] = useState(0);
  const [supplierOptions, setSupplierdata] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));


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

  const onFetchPodetailsById = () => {
    let fdata = { id: refid, formType: "PO" };
    apiPostMethod(maUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const podata = data.results[0];
          const fmdata = data.fresults[0];
          setBagweight(podata.WEIGHT);
          setBagweight2(podata.WEIGHT2);
          setBagweight3(podata.WEIGHT3);
          setIsReadOnly(fmdata.VECHICAL_STATUS === "7");
          setFormaData({ ...formData, ...fmdata });
          setPoData({ ...poData, ...podata });
          onFetchPOLine(podata.ZPO_NUMBER, podata.SCREEN_TYPE);
          onFetchSupplier(podata.ZPO_NUMBER, fmdata.PO_LINE_ITEM, podata.SCREEN_TYPE);
        }
      })
      .catch((error) => {
        errorToast(error);
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

  const onSupplierChange = (e) => {
    setFormaData({
      ...formData,
      ZSUPPLIER_CODE: e.value,
      ZSUPPLIER_NAME: e.label,
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

  const onUpdatePo = () => {
    let fdata = { ...formData, zvanumber: refid, formType: "U", id: poData.PI_REFID , SAP_TYPE : 'Approve' };
    let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    if (keys.length > 0) {
      let postdata = new FormData();
      let FileSaveUrl=sapFileShare;
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
            SapgMigoentry(fdata);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      SapgMigoentry(fdata);
    }
  };

  const SapgMigoentry = (fdata) => {
    apiPostMethod(apiBaseUrl + "Sap/SapgateoutentryController/Migo_SAP_Push", fdata)
      .then((response) => {
        console.log(response.data)
        if (response.data.success == 0) {
          errorToast(response.data.error)
          return false
        }else if (response.data.success == 1) {
          updateFormData(fdata)
        }
    })
  };
  const updateFormData = (fdata) => {
    showLoader();
    apiPostMethod(maUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          onApprovePO();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
  const onApprovePO = () => {
    let fdata = { formType: "A", id: poData.PI_REFID };
    showLoader();
    apiPostMethod(maUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          console.log(data)
          window.open(BASE_URL+"/#/STOSDTSlip:"+refid, "", "width=900,height=650")
          history.push(`/AP`);
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

  const onBagTypeChange = (e) => {
    setBagweight(e.weight);
    const dp = { bag_type: e.value, BAG_NAME: e.label };
    setFormaData({
      ...formData,
      ...dp,
    });
  };

  const onBagTypeChange2 = (e) => {
    setBagweight2(e.weight);
    const dp = { bag_type2: e.value, BAG_NAME2: e.label };
    setFormaData({
      ...formData,
      ...dp,
    });
  };

  const onBagTypeChange3 = (e) => {
    setBagweight3(e.weight);
    const dp = { bag_type3: e.value, BAG_NAME3: e.label };
    setFormaData({
      ...formData,
      ...dp,
    });
  };

  const calgunnyweight_OLD = (bagwt, nobag) => {
    if (bagwt && nobag) {
      return (Number(bagwt) * Number(nobag)).toFixed(3);
    }
    return "";
  };
  const calgunnyweight = (bagwt,bagwt2,bagwt3, nobag,nobag2,nobag3) => {
    console.log("Calc G Weight");
    let Tot=0;
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt) * Number(nobag));
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt2) * Number(nobag2));
    Tot=parseFloat(Tot)+parseFloat(Number(bagwt3) * Number(nobag3));

   return Tot;
    
  };

  const isFilledAll = () => {
    let fmdata = { ...formData };
    delete fmdata.s_supplier_wb_dt;
    delete fmdata.s_supplier_wb_qty;
    delete fmdata.naga_os_wb_copy;
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
    delete fmdata.BAG_NAME3;
    delete fmdata.BAG_NAME2;
    delete fmdata.bag_type3;
    delete fmdata.bag_type2;

    delete fmdata.supp_inv_copy;
    delete fmdata.supp_wb_copy;
    delete fmdata.naga_os_wb_copy;

    console.log(JSON.stringify(fmdata));
    const fmValues = Object.values(fmdata);
    if (formData.supplier_wb_qty && formData.supplier_wb_qty.length < 3) {
      return true;
    } else if (formData.is_own_wb !== "1") {
      if (!formData.wb_load_wt || formData.wb_load_wt.length < 3 || !formData.wb_empty_wt || formData.wb_empty_wt.length < 3) return true;
    }

    
     console.log(JSON.stringify(fmValues));
    // if (fmValues) return !fmValues.every((x) => x !== null && x !== "");
  };
  const getwbValue = (val) => {
    const wbtype = { 1: "Own WB", 2: "Outside WB" };
    return wbtype[val];
  };

  const handleFileChange = (file, id) => {
    setAttachment({
      ...attachedFiles,
      [id]: file,
    });
  };

  const {
    PI_REFID,
    ZPO_NUMBER,
    ZVENDOR_NAME,
    IDNLF,
    NETPR,
    STORAGE_LOCATION,
    PLANT_NAME,
    MATNR,
    INCO_DESC,
    POBAG_NAME,
    CONTAINER_NO,
    VEHICLE_TYPE,
  } = poData;
  const {
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
    remarks,
  } = formData;

  //Modal pop up window 
  const [open, openModal] = useState(false)
  const onOpenModal = () => {
    openModal(!open)
  };
  const onCloseModal = () => {
    openModal(!open)
  };
  
  const onSubmit = (wrong = '') => {

    console.log(wrong)

    if(remarks == '' || remarks == undefined){
      errorToast('Please Enter the remarks ...')
      return false
    }
       const postdata = {
        PI_REFID,
        remarks,
        wrong,
        MigoRejectedByName:UserDetails.username,
        MigoRejectedBy:UserDetails.USERID,
      }
       let msg="WRONG ENTRY"
       confirmDialog({
        title: "Are you sure want to Update?",
        description: msg,
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "Wrongentry/updateVehicleposition", postdata)
         .then((response) => {
           const { data } = response;
           console.log(JSON.stringify(response))
           
           ShowToast("Saved Successfully...");
           history.push(`/AP`);
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
  

  return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Migo Approval : {ZVA_NUMBER}
      </p>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={ZPO_NUMBER} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">{`${CONTAINER_NO ? "Trailer" : "Vehicle"} Number`}</Label>
                  <Input
                    // disabled={isReadOnly}
                    disabled
                    type="text"
                    value={TRUCK_NO}
                    onChange={(e) => onTextChange(e, "TRUCK_NO")}
                    placeholder="Vehicle Number"
                    maxlength={10}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                {CONTAINER_NO ? (
                  <FormGroup>
                    <Label for="cityMulti">Container Number</Label>
                    <Input type="text" value={CONTAINER_NO} disabled placeholder="Container Number" />
                  </FormGroup>
                ) : (
                  ""
                )}
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Vehicle Type</Label>
                  <Input type="text" value={VEHICLE_TYPE} disabled placeholder="Vehicle Type" />
                </FormGroup>
              </Col>
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
                  <Select
                    // isDisabled={isReadOnly}
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                    value={{ label: PO_LINE_ITEM, value: PO_LINE_ITEM }}
                    onChange={(e) => onTextChange(e, "PO_LINE_ITEM")}
                    isDisabled
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  <Select
                    // isDisabled={isReadOnly}
                    className="react-select"
                    classNamePrefix="select"
                    options={supplierOptions}
                    value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                    onChange={(e) => onSupplierChange(e)}
                    isDisabled
                  />
                </FormGroup>
              </Col>
              <Col md="3" sm="12">
                <FormGroup>
                  <Label>Received Bag Type</Label>
                  <Select
                    isDisabled={isReadOnly}
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME, value: bag_type }}
                    onChange={(e) => onBagTypeChange(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags</Label>
                  <Input
                    disabled={isReadOnly}
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
                    isDisabled={isReadOnly}
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME2, value: bag_type2 }}
                    onChange={(e) => onBagTypeChange2(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(2)</Label>
                  <Input
                    disabled={isReadOnly}
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
                    isDisabled={isReadOnly}
                    className="react-select"
                    classNamePrefix="select"
                    options={bagTypeOptions}
                    value={{ label: BAG_NAME3, value: bag_type3 }}
                    onChange={(e) => onBagTypeChange3(e)}
                  />
                </FormGroup>
              </Col>
              <Col md="1" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Bags(3)</Label>
                  <Input
                    disabled={isReadOnly}
                    type="text"
                    value={no_bags3}
                    onChange={(e) => onTextChange(e, "no_bags3")}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>WB Type</Label>
                  <Input type="text" value={getwbValue(is_own_wb)} disabled />
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
                        // disabled={isReadOnly}
                        disabled
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">WB Serial Number</Label>
                      <Input
                        type="text"
                        // disabled={isReadOnly}
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
                  <Input
                    type="text"
                    value={wb_load_wt}
                    // disabled={is_own_wb === "1" || isReadOnly ? true : false}
                    disabled
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
                    // disabled={is_own_wb === "1" || isReadOnly ? true : false}
                    disabled
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
              {VEHICLE_TYPE !== "Rake" ? (
                <>
                  <Col md="4" sm="12">
                    <Label for="supplier_wb_dt">Supplier WB Date</Label>
                    <Input
                      type="date"
                      name="date"
                      max={today}
                      disabled={isReadOnly}
                      value={supplier_wb_dt}
                      id="supplier_wb_dt"
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
                        disabled={isReadOnly}
                        value={supplier_wb_qty}
                        onChange={(e) => onTextChange(e, "supplier_wb_qty")}
                        placeholder="Supplier WB Qty (In Kgs)"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <NumberOnlyInput
                        decimalFormat={"2,2"}
                        disabled={isReadOnly}
                        placeholder="Decimal (2,2)"
                        value={invoice_rate}
                        onChange={(e) => onTextChange(e, "invoice_rate")}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice No</Label>
                      <Input
                        type="text"
                        disabled={isReadOnly}
                        value={invoice_no}
                        onChange={(e) => onTextChange(e, "invoice_no")}
                        placeholder="Invoice Number"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                      <NumberOnlyInput
                        roundValue
                        maxValue={70000}
                        disabled={isReadOnly}
                        value={invoice_qty}
                        onChange={(e) => onTextChange(e, "invoice_qty")}
                        placeholder="Max 70000"
                      />
                    </FormGroup>
                  </Col>
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
                   <CaptureImage ImgData={ImgData} setImgData={setImgData}  ItemName={"Invoicecopy"} />
                  </Col>
                  <Col md="4" sm="12">
                    <Uploader
                      isReadOnly={!attachedFiles.supp_wb_copy.name || isReadOnly}
                      canEdit={!isReadOnly}
                      setAttachment={handleFileChange}
                      label={"WB Copy"}
                      title="Attach WB Copy"
                      id={"supp_wb_copy"}
                      selectedFileName={attachedFiles.supp_wb_copy.name ? attachedFiles.supp_wb_copy.name : supp_wb_copy}
                    />
                    <CaptureImage ImgData={ImgData} setImgData={setImgData}  ItemName={"WBCopy"} />
                  </Col>
                </>
              ) : (
                ""
              )}
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
                   {/* <CaptureImage ImgData={ImgData} setImgData={setImgData}  ItemName={"Invoicecopy"} /> */}
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
                   <CaptureImage ImgData={ImgData} setImgData={setImgData}  ItemName={"NagaOutsideWBCopy"} />
                </Col>
              ) : (
                ""
              )}
            </Row>
            <Row className="mt-3">
              <Col>
              {!isReadOnly && (
                    <div className="mr-1">
                      <Button.Ripple color="danger" type="button" onClick={onOpenModal}>
                        Wrong Entry
                      </Button.Ripple>
                        <Modal open={open} onClose={onCloseModal} center>
                          <ModalHeader style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }} >
                            MIGO Reversal
                          </ModalHeader>
                            <ModalBody>
                             <FormGroup>
                              <Label for="Remarks">Remarks</Label>
                              <Input type="text"                        
                                value={remarks}
                                maxLength="50"
                                onChange={(e) => onTextChange(e, "remarks")}                               
                                placeholder="Remarks" />
                             </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                              <Col>
                              {is_own_wb == '2' &&
                              <Button.Ripple className="m-2" color="secondary" 
                              // tag={Link} to={`/AP`}
                              onClick={(e) => onSubmit(1)}
                              >
                              Out Side WB Weight Correction
                              </Button.Ripple>}
                              <Button.Ripple color="warning" 
                              //  tag={Link} to={`/AP`}
                              onClick={(e) => onSubmit()}
                              >
                                PO Number Change
                              </Button.Ripple>
                              </Col>
                            </ModalFooter>
                        </Modal>  
                    </div>
                  )}
                </Col>
                <Col md="2" className="mt-12">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/AP`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  {!isReadOnly && (
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" disabled={isFilledAll()} onClick={(e) => onUpdatePo()}>
                        Approve
                      </Button.Ripple>
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MApproverDetails;
