import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { mbagUrl, mpolineUrl, maUrl, msuppUrl, uploadUrl,BASE_URL,SaveCaptureImage,uploadandSaveImageUrl, ddlPOUrl, vaUrl, getUsedWt, sdivhgUrl, ddlSDPOUrl, sdisdUrl, mvessUrl, qcUrl, uaUrl, getSAPPO, apiBaseUrl } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import { roundOf, ShowToast } from "../../helper/appHelper";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import Uploader from "../Uploader";
import { useLoader } from "../../utility/hooks/useLoader";
import moment from "moment";
import CaptureImage from "../CaptureImage";
import Modal from 'react-responsive-modal';
import { useSelector } from "react-redux";
import { _poData, _supplierFormData } from "../SDI/SupplierHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const WrongEntryApproval = () => {
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
  const [ZVA_NUMBERS,setZVA_NUMBERS ] = useState('');
  const [migo_status,setmigo_status] = useState ('');
  const [ZQTY,setZQTY ] = useState('');
  const [ZVENDOR_CODE,setZVENDOR_CODE ] = useState('');
  const [WERKS,setWERKS ] = useState('');
  const [deduction_amount,setdeduction_amount ] = useState('');
  const [unload_lot,setunload_lot ] = useState('');

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

  const onPOChange = (e) => {
    const { value } = e;
    const sfd = { ..._supplierFormData };
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
      onFetchPodetailsID()
    }
  }, [poData]);

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
            setmigo_status(data.results[0].migo_status)
            setZQTY(data.results[0].ZQTY)
            setZVENDOR_CODE(data.results[0].ZVENDOR_CODE)
            setWERKS(data.results[0].WERKS)
            setdeduction_amount(data.results[0].deduction_amount)

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
          setZVA_NUMBERS(fmdatas.ZVA_NUMBER.length)
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
  const WrongWBApprovalReject = (id) => {

    const postdata = {
      id:id,
      VECHICAL_STATUS: '27',
    }
    
       
        let msg="WB Change"
        confirmDialog({
        title: "Are you sure want to Reject?",
        description: msg
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "Wrongentry/WrongWBApproval", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            if(response.data.success == 0){
              errorToast(response.data.error)
            }else{
            ShowToast("Saved Successfully...");
            history.push(`/MAP`);
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
      })
     }
  
  const WrongPOApproval = (id) => {

  const postdata = {
    id,
  }
     
      let msg="PO Change"
      confirmDialog({
      title: "Are you sure want to Reject?",
      description: msg,
    }).then((res) => {
      if (res) {
        showLoader();
        apiPostMethod(apiBaseUrl + "Wrongentry/WrongPOApproval", postdata)
        .then((response) => {
          const { data } = response;
          console.log(JSON.stringify(response))
          if (response.data.success == 0) {
            errorToast(response.data.error)
            return false
          }else{         
          ShowToast("Saved Successfully...");
          history.push(`/MAP`);
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
    })
    }
  const WrongWBApproval = (id) => {

    const postdata = {
        id:id,
        VECHICAL_STAT:'7',
        MIGOApprovalByName:UserDetails.username,
        MIGOApprovalBy:UserDetails.USERID,
        ...poDatas,
        ...formData,
        ZQTY:ZQTY,
        ZVENDOR_CODE:ZVENDOR_CODE,
        WERKS:WERKS,
        deduction_amount:deduction_amount || '',
        formType: 'I'
    }
    let remark ;
    apiPostMethod(apiBaseUrl+'Wrongentry/purchase_info_getByID',postdata) 
        .then((response) => {
            const { data } =response; 
            console.log(data)
            if(data.success) {
            remark = data.results[0].remarks
            console.log(remark)
            }
        
        let msg="WB Change"
        confirmDialog({
        title: "Are you sure want to Approve?",
        description: msg,
        }).then((res) => {
        if (res) {
            showLoader();
            apiPostMethod(apiBaseUrl + "Wrongentry/WrongWBApproval", postdata)
            .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            if(response.data.success == 0){
              errorToast(response.data.error)
            }else{
              ShowToast("Saved Successfully...");
              history.push(`/MAP`);
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
        })
        .catch((error) => {
        errorToast("Something went wrong please try again after sometime");
    
        }); 
        });
    }
    const onApprovePO = () => {
      let fdata = { formType: "A", id: poData.PI_REFID };
      showLoader();
      apiPostMethod(maUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            window.open(BASE_URL+"/#/STOSDTSlip:"+refid, "", "width=900,height=650")
            history.push(`/MAP`);
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
    CONTAINER_NO,
    VEHICLE_TYPE,
    POBAG_NAME,
    ZPO_LINE_ITEM,
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
  } = formData;  

const [last2,setlast2] = useState('');

  useEffect(() => {
    if (ZVA_NUMBER) {
      let last2 = ZVA_NUMBER.slice(-2)
      setlast2(last2)
    }
  }, [ZVA_NUMBER]);

console.log(last2);

  return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Wrong Entry Approval: {ZVA_NUMBER}
      </p>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">VA Number</Label>
                  <Input type="text" value={ZVA_NUMBER} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={PO_NUMBERS} disabled placeholder="PO Number" />
                </FormGroup>
              </Col>

              <Col md="4" sm="12">
                <FormGroup>
                  <Label>PO Line Item</Label>
                  <Select
                    isDisabled
                    className="react-select"
                    classNamePrefix="select"
                    options={poLineOptions}
                    value={{ label: PO_LINE_ITEM, value: PO_LINE_ITEM }}
                    onChange={(e) => onTextChange(e, "PO_LINE_ITEM")}
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Supplier Name</Label>
                  {/* {!ZPO_NUMBER || !ZPO_LINE_ITEM ? (
                    <Input type="text" disabled={true} value={ZVENDOR_NAME} placeholder={"Select the PO Line Item"} />
                  ) : ( */}
                    <Select
                      isDisabled
                      options={supplierOptions}
                      className="react-select"
                      classNamePrefix="select"
                      value={{ label: ZSUPPLIER_NAME, value: ZSUPPLIER_CODE }}
                      onChange={(e) => onSupplierChange(e)}
                    />
                  {/* )} */}
                </FormGroup>
              </Col>
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
                  <Label for="lastNameMulti">{`${CONTAINER_NO ? "Trailer" : "Vehicle"} Number`}</Label>
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
              {CONTAINER_NO == ''  ?
              '' : CONTAINER_NO == undefined ? '' :
              <Col md="4" sm="12">
                  <FormGroup>
                    <Label for="cityMulti">Container Number</Label>
                    <Input type="text" value={CONTAINER_NO} disabled placeholder="Container Number" />
                  </FormGroup>
              </Col>}
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Driver Number</Label>
                  <Input type="text" value={DRIVER_NO} disabled placeholder="Wheat Variety" />
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
                  <Input type="text" value={StorageLocation || STORAGE_LOCATION} disabled placeholder="Receiving Storage Location" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="cityMulti">Invoice Rate (In Kgs)</Label>
                      <NumberOnlyInput
                        decimalFormat={"2,2"}
                        disabled
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
                    disabled
                    value={invoice_no}
                    onChange={(e) => onTextChange(e, "invoice_no")}
                    placeholder="Invoice Number"
                    />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Invoice Date</Label>
                  <Input type="date" 
                  name="date"
                  max={today}                      
                  value={invoice_date ? invoice_date.split(" ")[0] : ""}
                  placeholder="Vehicle Type" 
                  disabled
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                    <Label for="cityMulti">Invoice Qty (In Kgs)</Label>
                    <NumberOnlyInput
                    roundValue
                    maxValue={70000}
                    disabled
                    value={invoice_qty}
                    onChange={(e) => onTextChange(e, "invoice_qty")}
                    placeholder="Max 70000"
                    />
                </FormGroup>
              </Col>
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
                  <Input
                    type="text"
                    value={wb_load_wt}
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
                    disabled
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
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Unloading Lot</Label>
                  <Input
                    disabled
                    type="text"
                    value={unload_lot}
                    placeholder="Number of Bags"
                  />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                    <Uploader
                      isReadOnly={!attachedFiles.supp_inv_copy.name || isReadOnly}
                    //   canEdit={!isReadOnly}
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
                    //   canEdit={!isReadOnly}
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
                    // canEdit={!isReadOnly}
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
                <Col>
                {migo_status == '2' && last2 != '-C' &&
                 <div className="mr-1">
                      <Button.Ripple color="danger" type="button" 
                    //   disabled={isFilledAll()} 
                      onClick={(e) => WrongWBApprovalReject(PI_REFID)}
                      >
                        Reject
                      </Button.Ripple>
                 </div>
                 }
                {migo_status == '1' && last2 != '-C' &&
                 <div className="mr-1">
                      <Button.Ripple color="danger" type="button" 
                    //   disabled={isFilledAll()} 
                      onClick={(e) => WrongPOApproval(PI_REFID)}
                      >
                        Reject
                      </Button.Ripple>
                 </div>
                } 
                </Col>
                <Col className="offset-md-6 d-md-flex justify-content-end" >
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/AP`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  {/* {!isReadOnly && ( */}
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" 
                    //   disabled={isFilledAll()} 
                    onClick={(e) => WrongWBApproval(PI_REFID)}
                       >
                        Approve
                      </Button.Ripple>
                    </div>
                   
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

export default WrongEntryApproval;
