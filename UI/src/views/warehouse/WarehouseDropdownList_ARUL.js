import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { Fragment, useEffect,useState, useRef } from "react";
import { useFormik } from "formik";
import { Modal } from 'react-responsive-modal';
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { Row, Col,Button,Table,FormGroup, CustomInput, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput  } from "../forms/custom-form";
import Select from "react-select";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { extendWith } from "lodash";


export const taColumns_RndConfirmation = [
  //{/* CheckBox */
  //   name: "Select",
  //   selector: "",
  //   minWidth: "200px",
  //   wrap: true,
  // },
  
  {/* Text Box  */
    name: "Priority",
    selector: "Priority",
    sortable: true,
    minWidth: "100px",
    wrap: true,
  },
  {
    name: "Planing Month",
    selector: "PlanMonth",
    sortable: false,
    minWidth: "130px",
    wrap: true,
    
  },
  {
    name: "Wheat Variety",
    selector: "WheatvarietyName",
    sortable: true,
    minWidth: "250px",
    wrap: true,
  },
  {
    name: "Receiving Bin",
    selector: "ReceivingBinNo",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Lot No",
    selector: "lotno",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Storage Location",
    selector: "storage_location",
    sortable: true,
    minWidth: "250px",
    wrap: true,
  },
  {
    name: "Plant",
    selector: "plant_name",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Warehouse",
    selector: "wh_name",
    sortable: true,
    minWidth: "250px",
    wrap: true,
  },
  {
    name: "SAP Stock (MTS)",
    selector: "SAP_Qty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Reserved Stock(MTS)",
    selector: "Reserved_Stock",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Available Stock(MTS)",
    selector: "wheatqty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Movement Qty(MTS)",
    selector: "Movement_Qty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Diff for Mvmt Qty & SAP Qty(MTS)",
    selector: "Diff_for_Mvmt_Qty_SAP_QTY",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Expected Arrival",
    selector: "Expected_Arrival",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Purchase Plan(MTS)",
    selector: "Purchase_Plan",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Release",
    selector: "Release",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Division",
    selector: "Division",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "QC Cleared Qty (MTS)",
    selector: "QC_Cleared_Qty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "Fumi. Cleared Qty (MTS)",
    selector: "Fumi_Cleared_Qty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
    name: "DO Cleared Qty (MTS)",
    selector: "Keyloan_Cleared_Qty",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
];

export const WarehousePlanList_Edit = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const {lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid} = rest;
  let { showLoader, hideLoader } = useLoader(); 
  useEffect(() => {
      fetchPlanList();
  }, []);

  const fetchPlanList =()=>{
    let fdata = {
      ...postData
    };

    showLoader();
      apiPostMethod(url, fdata)
        .then((response) => {
          const { data } = response;
          console.log("Response Data :: "+JSON.stringify(response));
          if (data.success) {
            form.setValues({
             ...form.values,
             CheckList:data.results, CurrentMonthYear:monthyear
            })
          }
          console.log("Result Data :: "+JSON.stringify(form));
        })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });

  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({  }),
    onSubmit(values) {},
  });

  const onUpdateRelease=()=>{
    let NewData=[];
    let i=0;
    for (i=0;i<form.values.CheckList.length;i++)
    {
      if (form.values.CheckList[i].chkSelect ==true){
        NewData.push(form.values.CheckList[i]);
      }
    }
    for (i=0; i<NewData.length;i++){
      delete NewData[i]["chkSelect"];
    }
    UpdateReleaseQty(NewData);
  }

  const UpdateReleaseQty=(NewData)=>{
    const postdata = {
      screentype:"WPL_Edit",
      Data:NewData
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/UpdateReleaseQty", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId = data.success;
        if(RespId && RespId>=1){
          ShowToast("ReleaseQty Successfully Updated...");
          //history.push("/warehouse/wclqc");
        }else{
          if(data.ErrorMsg){
            errorToast(data.ErrorMsg);
          }else{
            errorToast("Unable to update record");
          } 
        }      
      })
      .catch((error) => {
        console.log(" Error Data ::: "+JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    
  }

  const onUpdateClick=()=>{
    let NewData=[];
    let i=0;
    for (i=0;i<form.values.CheckList.length;i++)
    {
      if (form.values.CheckList[i].chkSelect ==true){
        NewData.push(form.values.CheckList[i]);
      }
    }
    for (i=0; i<NewData.length;i++){
      delete NewData[i]["chkSelect"];
    }
    SaveData(NewData);
  }

    const SaveData=(NewData)=>{
      console.log(" Warehouse Weekly Plan List :: "+JSON.stringify(NewData));
      const postdata = {
        screentype:"WPL_Edit",
        Data:NewData
      }
      console.log(" Warehouse Weekly Plan List Item  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  Warehouse Weekly Plan List Item  :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/SavePlanListUpdate", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId = data.success;

          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
      
            //history.push("/warehouse/wclqc");
          }
          else
          {
            if(data.ErrorMsg)
            {
              errorToast(data.ErrorMsg);
            }
            else
            {
              errorToast("Unable to update record");
            } 
          }      
        })
        .catch((error) => {
          console.log(" Error Data ::: "+JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
      
    }
      
    const onTextChange = (e,PKey, CheckList,Val,index) => {
      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].planid==PKey){
          if(Val=="Priority"){
            CheckList[i].Priority=e.target.value;
          }
          if(Val == "chkSelect"){
            CheckList[i].chkSelect = e.target.checked;
          }
          if(Val == "Movement_Qty"){
            CheckList[i].Movement_Qty=e.target.value;
          }
          if(Val == "Release_Qty"){
            CheckList[i].Release_Qty=e.target.value;
          }

          
        }
      }
      console.log(JSON.stringify(CheckList));
      form.setValues({...form.values,CheckList});
    }

    return(
      <Fragment>
        <Row>
          <Col md="12" sm="12" style={{height:"260px",overflowY:"auto",width:"1110px",overflowX:"scroll",fontSize:"12px"}}>
            <div>
              <table id="TableID" className='table-sm'> 
                <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                  <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> */}
                  <th style={{minWidth:"150px"}}>Select</th>
                  <th style={{minWidth:"150px"}}>Priority</th>
                  <th style={{minWidth:"150px"}}>Planing Month</th>
                  <th style={{minWidth:"150px"}}>Wheat Variety</th>
                  <th style={{minWidth:"150px"}}>Receiving Bin</th>
                  <th style={{minWidth:"150px"}}>Lot No</th>
                  <th style={{minWidth:"150px"}}>Storage Location</th>
                  <th style={{minWidth:"150px"}}>Plant</th>
                  <th style={{minWidth:"150px"}}>Warehouse</th>
                  <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                  <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Expected Arrival</th>
                  <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                  <th style={{minWidth:"150px"}}>Release</th>
                  <th style={{minWidth:"150px"}}>Division</th>
                  <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Action</th>
                   
                  </tr>
                </thead>

                <tbody style={{textAlign:"center"}}>
                  {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                    <tr style={{height:"44px"}}>
                      {/* <td>{row.planid}</td> */}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}
                          type="checkbox"
                          id={`chkSelect_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.chkSelect}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",row.rowId)} 
                        />
                      </td>

                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
                          type="text"
                          id={`priority_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Priority}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Priority",row.rowId)} 
                        />
                      </td>

                      <td>{row.PlanMonth}</td>
                      <td>{row.WheatvarietyName}</td>
                      <td>{row.ReceivingBinNo}</td>
                      <td>{row.lotno}</td>
                      <td>{row.storage_location}</td>
                      <td>{row.plant_name}</td>
                      <td>{row.wh_name}</td>
                      <td>{row.SAP_Qty}</td>
                      <td>{row.Reserved_Stock}</td>
                      <td>{row.wheatqty}</td>
                      <td>{/*{row.Movement_Qty}*/}
                        <CustomTextInput style={{fontSize:"12px",height:"30px", marginBottom:"-10px"}}
                          type="text"
                          id={`Movement_Qty_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Movement_Qty}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Movement_Qty",row.rowId)} 
                        />
                      </td>
                      <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                      <td>{row.Expected_Arrival}</td>
                      <td>{row.Purchase_Plan}</td>

                      {/* <td>{row.Release}</td> */}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px", weight:"40px", marginBottom:"-10px"}}
                          type="text"
                          id={`Release_Qty_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Release_Qty}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Release_Qty",row.rowId)} 
                        />
                      
                         <Button.Ripple 
                          color="primary" 
                          type="Button" 
                          onClick={(e) => {
                            confirmDialog({
                              title: "Please confirm for UPDATE, Are you sure?",
                            }).then((res) => {
                              if (res) {
                                onUpdateRelease()
                              }
                            });
                          }}
                          >Release</Button.Ripple>
                      </td>

                      <td>{row.Division}</td>

                      
                      <td style={{color:"#ffffff",backgroundColor:`${row.QCClearedColor}`}}>{row.QC_Cleared_Qty}</td>
                      <td style={{color:"#ffffff",backgroundColor:`${row.FumigationClearedColor}`}}>{row.Fumi_Cleared_Qty}</td>
                      <td style={{color:"#ffffff",backgroundColor:`${row.KeyloanClearedColor}`}}>{row.Keyloan_Cleared_Qty}</td>
                      
                    </tr>
                  ))}  
                </tbody>
              </table>
            </div>

          </Col>
        </Row> 

        <Row>
          {screenType && screenType == "CONFIRMATION" &&
            <>
            <Col md="6" sm="12">
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for UPDATE, Are you sure?",
                }).then((res) => {
                  if (res) {
                    onUpdateClick()
                  }
                });
              }}>Update</Button.Ripple>
              &nbsp; &nbsp;
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for DELETE, Are you sure?",
                  //description: msg,
                }).then((res) => {
                  if (res) {
                   // onActionClick()
                  }
                });
              }}>Delete</Button.Ripple>
            </Col>
            </>
          }       
        </Row>
      </Fragment>
    );
};


export const WarehouseDropdownList = ({ form }) => {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  
  const [WarehoseOptions, setWarehouseOptions] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const[storageLocationOption,setstorageLocationOption] = useState([]); 
  
  const onWarehouseChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('WareHouse', {  label: label,value: value });
    FillPlantList(value); 
  };

  const FillPlantList = (WH_CODE) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onStorageLocationChange=(e)=>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationid', {  label: label,value: value });
   // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value)
  
   }
  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', {  label: label,value: value });
    
   // FillLotList(value);
   FillStorageLocationList(value)
  };
  const FillStorageLocationList=(PlantId)=>{
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
   
      setstorageLocationOption([{ options: data.results }]);
   
    //getLotInfo(paramLotId,type);
    
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
   };

  const FillLotList = (sLocId) => {
    //let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    let fdata = {  storagelocationId:sLocId,plantid: form.values.plantid.value, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhLotOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onLotChange = (e) => {
    const { value, label } = e;
    
    form.setFieldValue('LotNumber', {  label: label,value: value });

    
    FillWheatVarityList(value);
  };

  const FillWheatVarityList = (paramLotId) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhWheetVarietyOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
 
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    
    //getSublotData(label,value);
    Fill_WH_Plant_Lot_Wheatvariety(e.value, e.label);
  };
  
  const Fill_WH_Plant_Lot_Wheatvariety = (pWheatVarietyId, pWheatVarietyName) => {
    let fdata = { WheatVarietyId: pWheatVarietyId, screenType: "WEEKLYPLAN" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWH_Plant_Lot_Wheatvariety', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWarehouseOptions([{ options: data.results.warehouse }]);
          setWhPlantOptions([{ options: data.results.plant }]);
          setstorageLocationOption([{ options: data.results.slocation }]);
          setWhLotOptions([{ options: data.results.lot }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getSublotData = (lab,val) => {
    let fdata = { 
      warehouseid: form.values.WareHouse.value, 
      plantid: form.values.plantid.value, 
      lotid: form.values.LotNumber.value, 
      WheatVarietyId: val, 
      screenType: "WEEKLYPLAN",
    ValFrom:form.values.ValidFrom
   };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
         // setWhWheetVarietyOptions([{ options: data.results }]);
         form.setValues({
           ...form.values,
           ActualStock:data.results[0].wheatqty,
RandDConfirmedQty:data.results[0].Rndlockqty,
FumigationClearedQty:data.results[0].FumigationClearedQty,
KeyLoanDOQty:data.results[0].Unpledgeqty,
FumigationSkipFlag:data.results[0].FumigationSkipFlag,
RndSkipFlag:data.results[0].RndSkipFlag,
         })

         form.setFieldValue('WheatVariety', {  label: lab,value: val });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  
  return (
    <Fragment >
      <Row>
          
          <Col>
        <CustomDropdownInput
            style={{"width":"170px"}}
            options_DUMMY={WhWheatvarietyOptions}
            url={`${apiBaseUrl}warehouse/master/getWHWheatvarityList`}
            id="WheatVariety1"
            label={"Wheat Variety"}
            className="react-select"
            classNamePrefix="select"
            form={form}
            onChange={(e) => onWheatvarietyChange(e)}
          />
        <span id='WheatVariety_Error' style={{color: 'red'}} ></span>
        </Col>
        
        <Col>
        <CustomDropdownInput  
        label={"WH.Name"} form={form} id="WareHouse1"         
        onChange={onWarehouseChange}
        options={WarehoseOptions}
        />
        <span id='WareHouse_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col>
        <CustomDropdownInput
              options={WhPlantOptions}
              id="plantid1"
              label={"Plant"}
              className="react-select"
              classNamePrefix="select"
              form={form}
              onChange={(e) => onPlantChange(e)}
            />
        </Col>
        <Col>
        <CustomDropdownInput
              options={storageLocationOption}
              id="storagelocationid1"
              label={"Storage Location"}
              className="react-select"
              classNamePrefix="select"
              form={form}
              onChange={(e) => onStorageLocationChange(e)}
            />
        </Col>
        <Col>
          <CustomDropdownInput 
          options={WhLotOptions} form={form} id="LotNumber1" 
          className="react-select"
          label={"Lot Number"}
          classNamePrefix="select"
        
          onChange={(e) => onLotChange(e)}
          />
        <span id='LotNumber_Error' style={{color: 'red'}} ></span>
        </Col>
      </Row>
    </Fragment>
  );
};
  


export const Rnd_Confirmation_Plan = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  
  console.log("Weekly Plan Month => ",monthyear);
  
  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const {lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid} = rest;
  let { showLoader, hideLoader } = useLoader(); 
  
  useEffect(() => {
      fetchPlanList(monthyear);
      setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) =>{
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear() ;

    return month_Name;
  }

  const fetchPlanList =(monthyear)=>{
    let fdata = {
      MonthYear:monthyear,
      ...postData,
    };

    showLoader();
      apiPostMethod(url, fdata)
        .then((response) => {
          const { data } = response;
          console.log("Response Data :: "+JSON.stringify(response));
          if (data.success) {
            form.setValues({
             ...form.values,
             CheckList:data.results /*, CurrentMonthYear:monthyear*/
            })
          }
          console.log("Result Data :: "+JSON.stringify(form));
        })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({  }),
    onSubmit(values) {},
  });

  const onTextChange = (e,CheckList) => {
    setRejectReason(e.target.value);
    CheckList.RejectReason=e.target.value;
    console.log(JSON.stringify(CheckList));
    form.setValues({...form.values,CheckList});
  }

  const onUpdateApproval=()=>{
    let NewData=[];
    NewData.push(form.values.CheckList);
    SaveData(NewData, "RnD_Approval", "");
  }

  const onUpdateReject=()=>{
    let NewData=[];
    NewData.push(form.values.CheckList);
    SaveData(NewData, "RnD_Reject",);
  }

    const SaveData=(NewData, ScreenType, RejectReason)=>{
      console.log(" RnD Confirmation Plan List :: "+JSON.stringify(NewData));
      const postdata = {
        screentype:ScreenType,
        Data:NewData
      }
      console.log(" RnD Confirmation Plan List Item  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  RnD Confirmation Plan List Item  :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId = data.success;

          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
          }
          else
          {
            if(data.ErrorMsg)
            {
              errorToast(data.ErrorMsg);
            }
            else
            {
              errorToast("Unable to update record");
            } 
          }      
        })
        .catch((error) => {
          console.log(" Error Data ::: "+JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }
    
    return(
      <Fragment>
        <div style={{border:"2px solid #7367f0 ",padding:"2px",borderRadius:"6px",marginTop:"12px"}}>  
        <Row>
          {/* <Col md="12" sm="12" style={{height:"300px",width:"90%",fontSize:"12px"}}> */}
          <Col md="12" sm="12" style={{width:"90%",fontSize:"12px"}}>
            <br/>
            <h4> R&D Confirmation Plan : {monthName} </h4> 
            <br/>
            
            <TableComponent columns={taColumns_RndConfirmation} data={form.values.CheckList} hideSearch />

            {/*
             <table style={{height:"50px",textAlign:"center",width:"100%"}}> 
                <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                  <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> * /}
                  <th style={{minWidth:"150px"}}>Select</th>
                  <th style={{minWidth:"150px"}}>Priority</th>
                  <th style={{minWidth:"150px"}}>Planing Month</th>
                  <th style={{minWidth:"250px"}}>Wheat Variety</th>
                  <th style={{minWidth:"150px"}}>Receiving Bin</th>
                  <th style={{minWidth:"150px"}}>Lot No</th>
                  <th style={{minWidth:"150px"}}>Storage Location</th>
                  <th style={{minWidth:"150px"}}>Plant</th>
                  <th style={{minWidth:"250px"}}>Warehouse</th>
                  <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                  <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Expected Arrival</th>
                  <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                  <th style={{minWidth:"150px"}}>Release</th>
                  <th style={{minWidth:"150px"}}>Division</th>
                  <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                  {/* <th style={{minWidth:"150px"}}>Action</th> * /}
                  </tr>
                </thead>

                <tbody style={{textAlign:"center"}} >

                  {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                    <tr style={{height:"44px"}}>
                      {/* <td>{row.planid}</td>  * /}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}
                          type="checkbox"
                          id={`chkSelect_${index}`} 
                          value={row.chkSelect}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",index)} 
                        />
                      </td>

                      <td>{row.Priority}</td>
                      <td>{row.PlanMonth}</td>
                      <td>{row.WheatvarietyName}</td>
                      <td>{row.ReceivingBinNo}</td>
                      <td>{row.lotno}</td>
                      <td>{row.storage_location}</td>
                      <td>{row.plant_name}</td>
                      <td>{row.wh_name}</td>
                      <td>{row.SAP_Qty}</td>
                      <td>{row.Reserved_Stock}</td>
                      <td>{row.wheatqty}</td>
                      <td>{row.Movement_Qty}</td>
                      <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                      <td>{row.Expected_Arrival}</td>
                      <td>{row.Purchase_Plan}</td>
                      <td>{row.Release}</td>
                      <td>{row.Division}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.QCClearedColor}`}}>{row.QC_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.FumigationClearedColor}`}}>{row.Fumi_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.KeyloanClearedColor}`}}>{row.Keyloan_Cleared_Qty}</td>
                    </tr>
                  ))}  
                </tbody>
              </table>
                  */}
          </Col>
        </Row> 
        <br/>
        
        <Row>
          &nbsp; &nbsp; &nbsp;
          <Col md="3" sm="12">
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for R&D APPROVAL, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdateApproval()
                }
              });
            }}>Approval</Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for R&D REJECT, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdateReject()
                }
              });
            }}>Reject</Button.Ripple>
          </Col>
          <Col md="3" sm="12">
            <CustomTextInput /*style={{fontSize:"12px", height:"30px", weight:"10px", marginBottom:"-10px"}}*/
              type="text"
              id={`rejectreason`}
              form={form}  
              placeholder={"Reason for Reject !"}  
              value = {RejectReason}
              onChange={(e) => onTextChange(e, form.values.CheckList)} 
            />
          </Col>
        </Row>
        </div>
      </Fragment>
    );
};


export const Commercial_Confirmation_Plan = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  console.log("Commercial_Confirmation_Plan => ",monthyear);
  
  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const {lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid} = rest;
  let { showLoader, hideLoader } = useLoader(); 
  
  useEffect(() => {
      fetchPlanList(monthyear);
      setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) =>{
    /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
    */
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear() ;

    return month_Name;
  }

  const fetchPlanList =(monthyear)=>{
    let fdata = {
      MonthYear:monthyear,
      ...postData,
    };

    showLoader();
      apiPostMethod(url, fdata)
        .then((response) => {
          const { data } = response;
          console.log("Response Data :: "+JSON.stringify(response));
          if (data.success) {
            form.setValues({
             ...form.values,
             CheckList:data.results /*, CurrentMonthYear:monthyear*/
            })
          }
          console.log("Result Data :: "+JSON.stringify(form));
        })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({  }),
    onSubmit(values) {},
  });

  const onTextChange = (e,CheckList) => {
    setRejectReason(e.target.value);
    CheckList.RejectReason=e.target.value;
    console.log(JSON.stringify(CheckList));
    form.setValues({...form.values,CheckList});
  }

  const onUpdateApproval=()=>{
    let NewData=[];
    NewData.push(form.values.CheckList);
    SaveData(NewData, "RnD_Approval", "");
  }

  const onUpdateReject=()=>{
    let NewData=[];
    NewData.push(form.values.CheckList);
    SaveData(NewData, "RnD_Reject",);
  }

    const SaveData=(NewData, ScreenType, RejectReason)=>{
      console.log(" RnD Confirmation Plan List :: "+JSON.stringify(NewData));
      const postdata = {
        screentype:ScreenType,
        Data:NewData
      }
      console.log(" RnD Confirmation Plan List Item  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  RnD Confirmation Plan List Item  :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/Save_ConfirmationPlan_Status", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId = data.success;

          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
          }
          else
          {
            if(data.ErrorMsg)
            {
              errorToast(data.ErrorMsg);
            }
            else
            {
              errorToast("Unable to update record");
            } 
          }      
        })
        .catch((error) => {
          console.log(" Error Data ::: "+JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }
    
    
    return(
      <Fragment>
        <div style={{border:"2px solid #7367f0 ",padding:"2px",borderRadius:"6px",marginTop:"12px"}}>  
        <Row>
          <Col md="12" sm="12" style={{width:"90%",fontSize:"12px"}}>
            <br/>
            <h4>Commercial Confirmation Plan : {monthName} </h4> 
            <br/>
            <table style={{overflow:"scroll", height:"50px",textAlign:"center",width:"100%"}}> 
                <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                  <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> */}
                  <th style={{minWidth:"150px"}}>Select</th>
                  <th style={{minWidth:"150px"}}>Priority</th>
                  <th style={{minWidth:"150px"}}>Planing Month</th>
                  <th style={{minWidth:"250px"}}>Wheat Variety</th>
                  <th style={{minWidth:"150px"}}>Receiving Bin</th>
                  <th style={{minWidth:"150px"}}>Lot No</th>
                  <th style={{minWidth:"150px"}}>Storage Location</th>
                  <th style={{minWidth:"150px"}}>Plant</th>
                  <th style={{minWidth:"250px"}}>Warehouse</th>
                  <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                  <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Expected Arrival</th>
                  <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                  <th style={{minWidth:"150px"}}>Release</th>
                  <th style={{minWidth:"150px"}}>Division</th>
                  <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                  {/* <th style={{minWidth:"150px"}}>Action</th> */}
                  </tr>
                </thead>

                <tbody style={{textAlign:"center"}}>
                  {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                    <tr style={{height:"44px"}}>
                      {/* <td>{row.planid}</td> */}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}
                          type="checkbox"
                          id={`chkSelect_${row.index}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.chkSelect}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",row.rowId)} 
                        />  
                      </td>
                      <td>{row.Priority}</td>
                      <td>{row.PlanMonth}</td>
                      <td>{row.WheatvarietyName}</td>
                      <td>{row.ReceivingBinNo}</td>
                      <td>{row.lotno}</td>
                      <td>{row.storage_location}</td>
                      <td>{row.plant_name}</td>
                      <td>{row.wh_name}</td>
                      <td>{row.SAP_Qty}</td>
                      <td>{row.Reserved_Stock}</td>
                      <td>{row.wheatqty}</td>
                      <td>{row.Movement_Qty}</td>
                      <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                      <td>{row.Expected_Arrival}</td>
                      <td>{row.Purchase_Plan}</td>
                      <td>{row.Release}</td>
                      <td>{row.Division}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.QCClearedColor}`}}>{row.QC_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.FumigationClearedColor}`}}>{row.Fumi_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.KeyloanClearedColor}`}}>{row.Keyloan_Cleared_Qty}</td>
                    </tr>
                  ))}  
                </tbody>
              </table>
          
          </Col>
        </Row> 
        <br/>
        <Row>
            &nbsp; &nbsp; &nbsp;
            <Col md="3" sm="12">
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for Commercial APPROVAL, Are you sure?",
                }).then((res) => {
                  if (res) {
                    onUpdateApproval()
                  }
                });
              }}>Approval</Button.Ripple>
              &nbsp; &nbsp; &nbsp; &nbsp; 
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                confirmDialog({
                  title: "Please confirm for Commercial REJECT, Are you sure?",
                }).then((res) => {
                  if (res) {
                    onUpdateReject()
                  }
                });
              }}>Reject</Button.Ripple>
              </Col>
              <Col md="3" sm="12">
              <CustomTextInput 
                type="text"
                id={`rejectreason`}
                form={form}  
                placeholder={"Reason for Reject !"}  
                onChange={(e) => onTextChange(e, form.values.CheckList)} 
              />
            </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export const Plan_STOPO_DeliveryCreation_Add = ({ title, monthyear, url, actionRendorer, postData, screenType, ...rest }) => {
  
  //console.log("Plan_STOPO_DeliveryCreation_Add => ",monthyear);
  
  const history = useHistory();
  const [monthName, setmonthName] = useState();
  const [RejectReason, setRejectReason] = useState();
  const [showModal, setShowModal] = useState(false);
  const {lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid} = rest;
  const [TableData, setTableData] = useState([]);
  const [EditData, setEditData] = useState([]);
  const inputRef = useRef([0,1,2,3,4,5,6,7,8,9,10]);
  
  let { showLoader, hideLoader } = useLoader(); 

  const handleShowModal =(Editdata)=>{
    console.log(Editdata);
    form.setValues({Plan_ID:Editdata})
      setShowModal(true);
    //  console.log(showModal);
  }


const taColumns = [
    {
      name: "Select",
      selector: "",
      sortable: false,
      minWidth: "130px",
      cell: (row, index) => {
        return  (
          <CustomTextInput 
            style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
            type="checkbox" 
            form={form} 
            id={`checkbox_${index}`} 
            onChange={(e) => onChkClick(row.planid, row.plandate)} 
          />
        );
      },
    },
    {
      name: "Priority",
      selector: "Priority",
      sortable: false,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Planing Month",
      selector: "PlanMonth",
      sortable: false,
      minWidth: "130px",
      wrap: true,
      
    },
    {
      name: "Wheat Variety",
      selector: "WheatvarietyName",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Receiving Bin",
      selector: "ReceivingBinNo",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Storage Location",
      selector: "storage_location",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Plant",
      selector: "plant_name",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Warehouse",
      selector: "wh_name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "SAP Stock (MTS)",
      selector: "SAP_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Reserved Stock(MTS)",
      selector: "Reserved_Stock",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Available Stock(MTS)",
      selector: "wheatqty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Movement Qty(MTS)",
      selector: "Movement_Qty",
      sortable: true,
      minWidth: "130px",
        // cell: (row, index) => {
        //   return  (
        //       <CustomTextInput style={{fontSize:"12px",height:"30px", marginBottom:"-10px"}}
        //         type="text"
        //         id={`Movement_Qty_${row.rowId-1}`}
        //         form={form}  
        //         value={row.Movement_Qty}
        //         //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Movement_Qty",index)} 
        //       />
        //   );
        // },
    },
    {
      name: "Diff for Mvmt Qty & SAP Qty(MTS)",
      selector: "Diff_for_Mvmt_Qty_SAP_QTY",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Expected Arrival",
      selector: "Expected_Arrival",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Purchase Plan(MTS)",
      selector: "Purchase_Plan",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Release",
      selector: "Release",
      sortable: true,
      minWidth: "130px",
      // cell: (row, index) => {
      //   return (
      //     <CustomTextInput style={{fontSize:"12px",height:"30px", weight:"40px", marginBottom:"-10px"}}
      //       type="text"
      //       id={`Release_Qty_${row.rowId-1}`}
      //       form={form}  
      //       value={row.Release_Qty}
      //       //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Release_Qty",row.rowId)} 
      //     />
      //   );
      // },
    },
    {
      name: "Division",
      selector: "Division",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "QC Cleared Qty (MTS)",
      selector: "QC_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Fumi. Cleared Qty (MTS)",
      selector: "Fumi_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "DO Cleared Qty (MTS)",
      selector: "Keyloan_Cleared_Qty",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
  ];
  
  useEffect(() => {
      fetchPlanList(monthyear);
      setmonthName(getMonthName(monthyear));
  }, [monthyear, postData]);

  const getMonthName = (monthyear) =>{
    const current = new Date(monthyear);
    current.setMonth(current.getMonth());
    const month_Name = (current.toLocaleString('default', { month: 'long' })) + "-" + current.getFullYear() ;

    return month_Name;
  }

  const fetchPlanList =(monthyear)=>{
    let fdata = {
      MonthYear:monthyear,
      ...postData,
    };

    showLoader();
      apiPostMethod(url, fdata)
        .then((response) => {
          const { data } = response;
          console.log("Response Data :: "+JSON.stringify(response));
          if (data.success) {
            
            //setTableData(data.results);
            form.setValues({
             ...form.values,
             CheckList:data.results /*, CurrentMonthYear:monthyear*/
            })

            //setRefreshFlag((RefreshFlag)=>RefreshFlag+1)
          }
          console.log("Result Data :: "+JSON.stringify(form));
        })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({  }),
    onSubmit(values) {},
  });

  const onUpdateClick=()=>{
    let NewData=[];
    let i=0;
    for (i=0;i<form.values.CheckList.length;i++)
    {
      if (form.values.CheckList[i].chkSelect ==true){
        NewData.push(form.values.CheckList[i]);
      }
    }
    for (i=0; i<NewData.length;i++){
      delete NewData[i]["chkSelect"];
    }
    SaveData(NewData);
  }

    const SaveData=(NewData)=>{
      console.log(" Warehouse Weekly Plan List :: "+JSON.stringify(NewData));
      const postdata = {
        screentype:"WPL_Edit",
        Data:NewData
      }
      console.log(" Warehouse Weekly Plan List Item  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  Warehouse Weekly Plan List Item  :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/SavePlanListUpdate", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId = data.success;

          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
      
            //history.push("/warehouse/wclqc");
          }
          else
          {
            if(data.ErrorMsg)
            {
              errorToast(data.ErrorMsg);
            }
            else
            {
              errorToast("Unable to update record");
            } 
          }      
        })
        .catch((error) => {
          console.log(" Error Data ::: "+JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
      
    }

    const onGetPlanid = (id)=>{
      setEditData(...EditData,)
    }
    

    /*
    const onTextChange = (e,PKey, CheckList,Val,i) => {
      // for(let i=0;i<CheckList.length;i++){
        if(TableData[i].planid==PKey){
          if(Val=="Priority"){
            //CheckList[i].Priority=e.target.value;
            console.log(e.target.value);
            setTableData(...TableData[i],TableData[i].Priority=e.target.value)
          }
          
          if(Val == "checkbox"){
           //CheckList[i].chkSelect = e.target.checked;
            setTableData(...TableData[i],TableData[i].chkSelect=e.target.value)
          }

          if(Val == "Movement_Qty"){
           // CheckList[i].Movement_Qty=e.target.value;
            setTableData(...TableData[i],TableData[i].Movement_Qty=e.target.value)
          }
          
          if(Val == "Release_Qty"){
            //CheckList[i].Release_Qty=e.target.value;
            setTableData(...TableData[i],TableData[i].Release_Qty=e.target.value)
          }
        }
      }
      // console.log(JSON.stringify(CheckList));
      // console.log({...form.values,CheckList});

      //console.log(e);
      //form.setValues({...form.values,CheckList});
      //setTableData(TableData)
      //document.getElementById(e.target.id).focus();
      //console.log(inputRef);
      //inputRef.current[index].focus();
      
    */

      const onChkClick = (e,PKey, plandate) => {
        console.log(PKey," =>",plandate);
        console.log(e.target.checked);

        // if (e.target.checked == true){
          let editDate=[];
          editDate = [...EditData];
          if(EditData.length <= 5){
            editDate.push({
              Plan_Id:PKey,
              Plan_Dt:plandate,
            });
          // }
          console.log(editDate);
          setEditData(editDate);
        }
      }
      

      

    
    return(
      <Fragment>
        <div style={{border:"2px solid #7367f0 ",padding:"2px",borderRadius:"6px",marginTop:"1px"}}>  
        <Row>
          {/* <Col md="12" sm="12" style={{height:"300px",width:"90%",fontSize:"12px"}}> */}
          <Col md="12" sm="12" style={{width:"90%",fontSize:"12px"}}>
            <br/>
            <h4> {title} : {monthName} </h4> 
            <br/>

            <TableComponent columns={taColumns} data={form.values.CheckList} hideSearch/>

{/*
             <table style={{height:"50px",textAlign:"center",width:"100%"}}> 
                <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                  <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> * /}
                  <th style={{minWidth:"150px"}}>Select</th>
                  <th style={{minWidth:"150px"}}>Priority</th>
                  <th style={{minWidth:"150px"}}>Planing Month</th>
                  <th style={{minWidth:"250px"}}>Wheat Variety</th>
                  <th style={{minWidth:"150px"}}>Receiving Bin</th>
                  <th style={{minWidth:"150px"}}>Lot No</th>
                  <th style={{minWidth:"150px"}}>Storage Location</th>
                  <th style={{minWidth:"150px"}}>Plant</th>
                  <th style={{minWidth:"250px"}}>Warehouse</th>
                  <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                  <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Expected Arrival</th>
                  <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                  <th style={{minWidth:"150px"}}>Release</th>
                  <th style={{minWidth:"150px"}}>Division</th>
                  <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                  {/* <th style={{minWidth:"150px"}}>Action</th> * /}
                  </tr>
                </thead>

                <tbody style={{textAlign:"center"}} >

                  {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                    <tr style={{height:"44px"}}>
                      {/* <td>{row.planid}</td>  * /}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}
                          type="checkbox"
                          id={`chkSelect_${index}`} 
                          value={row.chkSelect}
                          onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",index)} 
                        />
                      </td>

                      <td>{row.Priority}</td>
                      <td>{row.PlanMonth}</td>
                      <td>{row.WheatvarietyName}</td>
                      <td>{row.ReceivingBinNo}</td>
                      <td>{row.lotno}</td>
                      <td>{row.storage_location}</td>
                      <td>{row.plant_name}</td>
                      <td>{row.wh_name}</td>
                      <td>{row.SAP_Qty}</td>
                      <td>{row.Reserved_Stock}</td>
                      <td>{row.wheatqty}</td>
                      <td>{row.Movement_Qty}</td>
                      <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                      <td>{row.Expected_Arrival}</td>
                      <td>{row.Purchase_Plan}</td>
                      <td>{row.Release}</td>
                      <td>{row.Division}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.QCClearedColor}`}}>{row.QC_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.FumigationClearedColor}`}}>{row.Fumi_Cleared_Qty}</td>
                      <td style={{borderWidth:"1px",borderStyle:'solid',color:"#ffffff",backgroundColor:`${row.KeyloanClearedColor}`}}>{row.Keyloan_Cleared_Qty}</td>
                    </tr>
                  ))}  
                </tbody>
              </table>
*/}
          </Col>
        </Row> 
        <br/>
        
        <Row>
          &nbsp; &nbsp; &nbsp;
          <Col md="3" sm="12">
            {/* <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for EDIT, Are you sure?",
              }).then((res) => {
                if (res) {
                  onUpdateClick();
                }
              });
            }}>Edit</Button.Ripple> */} 

            <Button.Ripple color="primary" type="button" onClick={() => handleShowModal(EditData)} >Edit</Button.Ripple>

            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              confirmDialog({
                title: "Please confirm for DELETE, Are you sure?",
              }).then((res) => {
                if (res) {
                  //onUpdateReject()
                }
              });
            }}>Delete</Button.Ripple>
          </Col>
        </Row>

        {/* SHOW MODLE */}
        <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <Row>
          <Col md="12" sm="12" style={{height:"260px",overflowY:"auto",width:"1110px",overflowX:"scroll",fontSize:"12px"}}>
            <div>
              <table id="TableID" className='table-sm'> 
                <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center"}}> 
                  <tr>
                  {/* <th style={{minWidth:"150px"}}>Plan Id</th> */}
                  <th style={{minWidth:"150px"}}>Select</th>
                  <th style={{minWidth:"150px"}}>Priority</th>
                  <th style={{minWidth:"150px"}}>Planing Month</th>
                  <th style={{minWidth:"150px"}}>Wheat Variety</th>
                  <th style={{minWidth:"150px"}}>Receiving Bin</th>
                  <th style={{minWidth:"150px"}}>Lot No</th>
                  <th style={{minWidth:"150px"}}>Storage Location</th>
                  <th style={{minWidth:"150px"}}>Plant</th>
                  <th style={{minWidth:"150px"}}>Warehouse</th>
                  <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                  <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                  <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Expected Arrival</th>
                  <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                  <th style={{minWidth:"150px"}}>Release</th>
                  <th style={{minWidth:"150px"}}>Division</th>
                  <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                  <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                  <th style={{minWidth:"150px"}}>Action</th>
                   
                  </tr>
                </thead>

                <tbody style={{textAlign:"center"}}>
                  {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                    <tr style={{height:"44px"}}>
                      {/* <td>{row.planid}</td> */}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}
                          type="checkbox"
                          id={`chkSelect_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.chkSelect}
                          //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"chkSelect",row.rowId)} 
                        />
                      </td>

                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px"}}
                          type="text"
                          id={`priority_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Priority}
                          //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Priority",row.rowId)} 
                        />
                      </td>

                      <td>{row.PlanMonth}</td>
                      <td>{row.WheatvarietyName}</td>
                      <td>{row.ReceivingBinNo}</td>
                      <td>{row.lotno}</td>
                      <td>{row.storage_location}</td>
                      <td>{row.plant_name}</td>
                      <td>{row.wh_name}</td>
                      <td>{row.SAP_Qty}</td>
                      <td>{row.Reserved_Stock}</td>
                      <td>{row.wheatqty}</td>
                      <td>{/*{row.Movement_Qty}*/}
                        <CustomTextInput style={{fontSize:"12px",height:"30px", marginBottom:"-10px"}}
                          type="text"
                          id={`Movement_Qty_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Movement_Qty}
                          //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Movement_Qty",row.rowId)} 
                        />
                      </td>
                      <td>{row.Diff_for_Mvmt_Qty_SAP_QTY}</td>
                      <td>{row.Expected_Arrival}</td>
                      <td>{row.Purchase_Plan}</td>

                      {/* <td>{row.Release}</td> */}
                      <td>
                        <CustomTextInput style={{fontSize:"12px",height:"30px", weight:"40px", marginBottom:"-10px"}}
                          type="text"
                          id={`Release_Qty_${row.rowId}`}
                          form={form}  
                          placeholder={" "}  
                          value={row.Release_Qty}
                          //onChange={(e) => onTextChange(e, row.planid, form.values.CheckList,"Release_Qty",row.rowId)} 
                        />
                      </td>

                      <td>{row.Division}</td>

                      
                      <td style={{color:"#ffffff",backgroundColor:`${row.QCClearedColor}`}}>{row.QC_Cleared_Qty}</td>
                      <td style={{color:"#ffffff",backgroundColor:`${row.FumigationClearedColor}`}}>{row.Fumi_Cleared_Qty}</td>
                      <td style={{color:"#ffffff",backgroundColor:`${row.KeyloanClearedColor}`}}>{row.Keyloan_Cleared_Qty}</td>
                      
                    </tr>
                  ))}  
                </tbody>
              </table>
            </div>

          </Col>
        </Row> 


          <Row>
            <Col md="12" sm="12">
              <Button.Ripple color="primary" type="button" onClick={(e) => {
                              let msg = "Please confirm for vacate";
                              confirmDialog({
                                title: "Are you sure?",
                                //description: msg,
                              }).then((res) => {
                                if (res) {
                                  //onActionClick()
              
                                }
                              });
              }}>Save</Button.Ripple>
            </Col>
          </Row>
        </Modal>
      </div>
    </Fragment>
  );
};
