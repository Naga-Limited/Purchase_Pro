import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { Fragment, useEffect,useState } from "react";
import { useFormik } from "formik";
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
////import STOPODeliveryCreationEditForm from "./STOPODeliveryCreationEditForm";
import { Row, Col,Button,Table,FormGroup, CustomInput } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput  } from "../forms/custom-form";
import Select from "react-select";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
  
//   {
//     name: "Select All",
//     selector: "select",
//     sortable: true,
//     minWidth: "150px",      
     
//   },
  {
    name: "Priority",
    selector: "PlanMonth",
    sortable: true,
    minWidth: "250px", 
     
  },
  {
    name: "Planing Month",
    selector: "WheatvarietyName",
    sortable: true,
    minWidth: "240px", 
    
  },
  {
    name: "Wheat Variety",
    selector: "",
    sortable: true,
    minWidth: "240px", 
 
  }, 
]; 
 
  export const taColumns1 = [
  {
    name: "Lot No",
    selector: "",
    sortable: true,
    minWidth: "240px", 
   
    
  },
  {
    name: "Storage Location",
    selector: "",
    sortable: true,
    minWidth: "240px", 
    
  },
  {
    name: "Plant",
    selector: "Plant",
    sortable: true,
    minWidth: "240px", 
   
  },
  {
    name: "WareHouse",
    selector: "",
    sortable: true,
    minWidth: "240px", 
     
    
  },
  {
    name: "SAP Stock (MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px", 
     
  }, 
];
 
export const taColumns2 = [
  {
    name: " Available Stock(MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px", 
   
    
  },
  {
    name: " Movement Qty(MTS) ",
    selector: " ",
    sortable: true,
    minWidth: "240px", 
    
    
  },
  {
    name: "Diff for Mvmt Qty & SAP Qty(MTS)",
    selector: "",
    sortable: true,
    minWidth: "260px", 
  
    
  }, 
]; 
export const taColumns3 = [
  {
    name: "Expected Arrival",
    selector: "",
    sortable: true,
    minWidth: "240px", 
    
    
  },
  {
    name: "Purchase Plan(MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px", 
     
  }, 
  {
    name: "Release",
    selector: "",
    sortable: true,
    minWidth: "240px", 
    
    
  },

  {
    name: "Division",
    selector: "",
    sortable: true,
    minWidth: "240px", 
    
    
  },
  {
    name: "QC Cleared Qty(MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px", 
    
  },  

  {
    name: "Fumi Cleared Qty(MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px", 
   
  },  

  {
    name: " DO Cleared Qty(MTS)",
    selector: "",
    sortable: true,
    minWidth: "240px",
    
  },
];


export const MovementApprovedEntryScreenLists = ({ title, url, actionRendorer, postData, screenType, ...rest }) => {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const {lotid, lotno, plantid, locationid, WheatVarietyId, wh_code, wh_refid} = rest;
  let { showLoader, hideLoader } = useLoader(); 
  const handleShowModal =(WarehouseId)=>{
    //  console.log(showModal);
    form.setValues({VacatewareHouseId:WarehouseId})
      setShowModal(true);
    //  console.log(showModal);
    }

    const checkboxSelectCol = {
        name: "Select All",
        selector: "select",
        minWidth: "150px",
        cell: (row) => {
          return  (
            <CustomInput type="checkbox" className="custom-control-Primary" id="chkSelect" label="" />
          );
        },
      }; 
    const ReceivingBins = {
      name: "Receiving Bin",
      selector: "ReceivingBin",
      minWidth: "200px",
      cell: (row) => {
        return  (
            <CustomDropdownInput   
            form={form} id="Receiving Bin" 
//    onChange = {}
//    options ={}   
/>
        );
      },
    }; 
    const ReservedStockMTS = {
        name: "Reserved Stock(MTS)",
        selector: "MTS",
        minWidth: "200px",
        cell: (row) => {
          return  (
            <CustomInput type="text"  id="MTS"  disabled/>
          );
        },
      };
    
  
     

    
    
  
    

    //const columns = [checkboxSelectCol,...taColumns, actionsCol,qualityCol,CommericalCol,ButtonslCol,RenewCol];
    // const columns = [checkboxSelectCol, WeekNoCol, ...taColumns, actionsCol]; 
    const columns = [checkboxSelectCol,  ...taColumns,ReceivingBins , ...taColumns1,ReservedStockMTS ,...taColumns2,...taColumns3];
    const onActionClick = () => {
      let id=form.values.VacatewareHouseId;
      //console.log(id);
      //return false;
      const FrmData = { 
        currentmonth:form.values.currentmonth,
        lotid,
        lotno,
        locationid,
        plantid,
        WheatVarietyId,
        wh_refid,
        wh_code,
      };

      let fdata={id,Data:FrmData};
      showLoader();
          
      apiPostMethod(apiBaseUrl + "warehouse/master/warehoseplanlist", fdata)
        .then((response) => {
          if (response.data.success) {
            ShowToast("Successfully updated...");
            history.push("/warehouse/WarehouseDashBoard");
            window.location.reload();
          }
        })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    };

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({  }),
      onSubmit(values) {},
    });  


    const onSubmit = (ApproveStatus) => {


        const postdata = {
          PlanDatas,
          ApproveStatus,
          RejectReason:form.values.RejectReason ? form.values.RejectReason :"",
          Screen:"APPROVAL"
        }
    } 
    const AddValue = ()=>{
        if(form.values.WeekNo && form.values.WeekNo!=""){
          return true;
        }else{
          return false;
        }
      } 
      const PlanDatas  = ()=>{
        
      }
    return (
      <div >     
           
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardBody>
            <TableComponent columns={columns} postData={postData} url={url} formType="LotInformationPlannedUnplannedList" {...rest}/>
          </CardBody>
        </Card>  
       
        

        {/* <Row>
          {screenType && screenType == "CONFIRMATION" &&
          <>
          <Col md="12" sm="12">
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              let msg = "Please confirm for vacate";
              confirmDialog({
                title: "Are you sure?",
              }).then((res) => {
                if (res) {
                  onActionClick()
                }
              });
            }}>Edit</Button.Ripple>
  
          </Col>
          <Col md="12" sm="12">
            <Button.Ripple color="primary" type="button" onClick={(e) => {
              let msg = "Please confirm for vacate";
              confirmDialog({
                title: "Are you sure?",
                //description: msg,
              }).then((res) => {
                if (res) {
                  onActionClick()
                }
              });
            }}>Delete</Button.Ripple>
          </Col>
          </>
          }       
        </Row> */}
    </div>  

    
    
  );
};


export const MovementApprovedEntryScreenList  = ({ form }) => {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  
  const [WarehoseOptions, setWarehouseOptions] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const[storageLocationOption,setstorageLocationOption] = useState([]); 
  
//   const onWarehouseChange = (e) => {
//     const { value, label } = e;
//     form.setFieldValue('WareHouse', {  label: label,value: value });
//     FillPlantList(value); 
//   };

//   const FillPlantList = (WH_CODE) => {
//     let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
//     apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
//       .then((response) => {
//         const { data } = response;
//         if (data.success) {
//           setWhPlantOptions([{ options: data.results }]);
//         }
//       })
//       .catch((error) => {
//         errorToast("Something went wrong, please try again after sometime");
//       });
//   };
//   const onStorageLocationChange=(e)=>{
//     const {value,label} = e; 
//     form.setFieldValue('storagelocationid', {  label: label,value: value });
//    // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
//    FillLotList(value)
  
//    }
//   const onPlantChange = (e) => {
//     const { value, label } = e;
//     form.setFieldValue('plantid', {  label: label,value: value });
    
//    // FillLotList(value);
//    FillStorageLocationList(value)
//   };
//   const FillStorageLocationList=(PlantId)=>{
//     let fdata = { PlantId, screenType: "RND" };
//     apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
//     .then((response) => {
//     const { data } = response;
//     if (data.success) {
   
//       setstorageLocationOption([{ options: data.results }]);
   
//     //getLotInfo(paramLotId,type);
    
//     }
//     })
//     .catch((error) => {
//     errorToast("Something went wrong, please try again after sometime");
//     });
//    };

//   const FillLotList = (sLocId) => {
//     //let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
//     let fdata = {  storagelocationId:sLocId,plantid: form.values.plantid.value, screenType: "FUMIGATION" };
//     apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
//       .then((response) => {
//         const { data } = response;
//         if (data.success) {
//           setWhLotOptions([{ options: data.results }]);
//         }
//       })
//       .catch((error) => {
//         errorToast("Something went wrong, please try again after sometime");
//       });
//   };

//   const onLotChange = (e) => {
//     const { value, label } = e;
    
//     form.setFieldValue('LotNumber', {  label: label,value: value });

    
//     FillWheatVarityList(value);
//   };

//   const FillWheatVarityList = (paramLotId) => {
//     let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
//     apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
//       .then((response) => {
//         const { data } = response;
//         if (data.success) {
//           setWhWheetVarietyOptions([{ options: data.results }]);
//         }
//       })
//       .catch((error) => {
//         errorToast("Something went wrong, please try again after sometime");
//       });
//   };
 
//   const onWheatvarietyChange = (e) => {
//     const { value, label } = e;
    
//     //getSublotData(label,value);
//     Fill_WH_Plant_Lot_Wheatvariety(e.value, e.label);
//   };
  
//   const Fill_WH_Plant_Lot_Wheatvariety = (pWheatVarietyId, pWheatVarietyName) => {
//     let fdata = { WheatVarietyId: pWheatVarietyId, screenType: "WEEKLYPLAN" };
//     apiPostMethod(apiBaseUrl+'warehouse/master/getWH_Plant_Lot_Wheatvariety', fdata)
//       .then((response) => {
//         const { data } = response;
//         if (data.success) {
//           setWarehouseOptions([{ options: data.results.warehouse }]);
//           setWhPlantOptions([{ options: data.results.plant }]);
//           setstorageLocationOption([{ options: data.results.slocation }]);
//           setWhLotOptions([{ options: data.results.lot }]);
//         }
//       })
//       .catch((error) => {
//         errorToast("Something went wrong, please try again after sometime");
//       });
//   };

//   const getSublotData = (lab,val) => {
//     let fdata = { 
//       warehouseid: form.values.WareHouse.value, 
//       plantid: form.values.plantid.value, 
//       lotid: form.values.LotNumber.value, 
//       WheatVarietyId: val, 
//       screenType: "WEEKLYPLAN",
//     ValFrom:form.values.ValidFrom
//    };
//     apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
//       .then((response) => {
//         const { data } = response;
//         if (data.success) {
//          // setWhWheetVarietyOptions([{ options: data.results }]);
//          form.setValues({
//            ...form.values,
//            ActualStock:data.results[0].wheatqty,
// RandDConfirmedQty:data.results[0].Rndlockqty,
// FumigationClearedQty:data.results[0].FumigationClearedQty,
// KeyLoanDOQty:data.results[0].Unpledgeqty,
// FumigationSkipFlag:data.results[0].FumigationSkipFlag,
// RndSkipFlag:data.results[0].RndSkipFlag,
//          })

//          form.setFieldValue('WheatVariety', {  label: lab,value: val });
//         }
//       })
//       .catch((error) => {
//         errorToast("Something went wrong, please try again after sometime");
//       });
//    };
  
//   return (
//     <Fragment >
//       <Row>
          
//           <Col>
//         <CustomDropdownInput
//             style={{"width":"170px"}}
//             options_DUMMY={WhWheatvarietyOptions}
//             url={`${apiBaseUrl}warehouse/master/getWHWheatvarityList`}
//             id="WheatVariety1"
//             label={"Wheat Variety"}
//             className="react-select"
//             classNamePrefix="select"
//             form={form}
//             onChange={(e) => onWheatvarietyChange(e)}
//           />
//         <span id='WheatVariety_Error' style={{color: 'red'}} ></span>
//         </Col>
        
//         <Col>
//         <CustomDropdownInput  
//         label={"WH.Name"} form={form} id="WareHouse1"         
//         onChange={onWarehouseChange}
//         options={WarehoseOptions}
//         />
//         <span id='WareHouse_Error' style={{color: 'red'}} ></span>
//         </Col>

//         <Col>
//         <CustomDropdownInput
//               options={WhPlantOptions}
//               id="plantid1"
//               label={"Plant"}
//               className="react-select"
//               classNamePrefix="select"
//               form={form}
//               onChange={(e) => onPlantChange(e)}
//             />
//         </Col>
//         <Col>
//         <CustomDropdownInput
//               options={storageLocationOption}
//               id="storagelocationid1"
//               label={"Storage Location"}
//               className="react-select"
//               classNamePrefix="select"
//               form={form}
//               onChange={(e) => onStorageLocationChange(e)}
//             />
//         </Col>
//         <Col>
//           <CustomDropdownInput 
//           options={WhLotOptions} form={form} id="LotNumber1" 
//           className="react-select"
//           label={"Lot Number"}
//           classNamePrefix="select"
        
//           onChange={(e) => onLotChange(e)}
//           />
//         <span id='LotNumber_Error' style={{color: 'red'}} ></span>
//          </Col>
//        </Row>
// //    </Fragment>  
//     );
 };
  

