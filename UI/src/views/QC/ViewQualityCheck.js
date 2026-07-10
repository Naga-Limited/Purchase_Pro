import { Button } from "reactstrap";

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import TabControl from "../../@core/components/tab/TabControl";
// ** Store
import { useSelector } from "react-redux";
import TruckListTable from "../common/TruckListTable";
import STMListTable from "../common/STMListTable";
import { CardComponent } from "../common/CardComponent";
//import QCFilterForm from "./QCFilterForm";
import FilterForm from "../FilterForm";

import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import STMListCompletedTable from "../common/STMListCompletedTable";

const ViewQualityCheck = ({ isViewOnly, title, returnUrl, status }) => {

  
  const history = useHistory();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  let SiloExist=UserDetails.plantids.length==0 || UserDetails.plantids.includes("1111") || UserDetails.plantids.includes("FR01") ;
  console.log("SiloExist"+SiloExist);
  const tabs = [
    {
      id: "purchase",
      title: "Purchase",
      renderTab: () => <TruckListTable postData={tableFilterPurchase} actionCell={actionsCol} title={title || "Quality Check"} ScreenName={"Quality Check"} hideFilter={isViewOnly} />,
    },
    {
      id: "sto",
      title: "STO",
      renderTab: () => <TruckListTable postData={tableFilterPurchase_ias} actionCell={actionsCol_ias} title={title || "Quality Check"} ScreenName={"Quality Check"} hideFilter={isViewOnly} />,
    },
    {
      id: "iasrake",
      title: "Rake",
      renderTab: () => <TruckListTable postData={tableFilter} actionCell={actionsCol} title={title || "Quality Check"} ScreenName={"Quality Check"} hideFilter={isViewOnly} />,
    },
    {
      id: "stm",
      title: "Silo To Mill",
      ShowTab:SiloExist,
      renderTab: () => <STMListCompletedTable postData={tableFilter1} actionCell={actionsCol_STM} title={title || "Quality Check"} ScreenName={"Quality Check"} hideFilter={isViewOnly} />,
    },
  ];
  let [ otherfilter,setFilter] = useState();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });
  let values = form.values;
  /*const [tableFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    startCount: 0,
    rake: "Yes",
    vehicleStatus: status || "2,3,4,5,6",
  });*/
  const tableFilter = {
    plantIds: UserDetails.plantids,
    formType: "Completed",
    startCount: 0,
    rake: "Yes",
    includeIas:true,
    //vehicleStatus: status || "2,3,4,5,6,21",
    vehicleStatus: status || "7,29,34",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  const tableFilterPurchase = {
    plantIds: UserDetails.plantids,
    formType: "Completed",
    startCount: 0,
    rake: "No",
    includeIas:false,
    PurchaseQC:true,
    //vehicleStatus: status || "2,3,4,5,6,21",
    vehicleStatus: status || "7,29,34",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  const tableFilterPurchase_ias = {
    plantIds: UserDetails.plantids,
    formType: "Completed",
    startCount: 0,
    SCREEN_TYPE:'IAS',
    // rake: "No",
    // includeIas:true,
    //vehicleStatus: status || "12,23,2,3,4,5,6,21,24",
    vehicleStatus: status || "11,12,34",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  const tableFilter1 = {
    plantIds: UserDetails.plantids,
    formType: "Completed",
    startCount: 0,
    rake: "Yes",
    screenType:"SILOTOMILL",
    vehicleStatus: status || "11,12,34",
    // status: status || "2",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  
  const onSubmit = () => {
    console.log(form.values);
   // alert("sf")
   
    setFilter({
      otherfilter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        PlantIdArr: values.PlantId,
       
      },
    });
  };
  const actionsCol = (row) => {
    let status = row.VECHICAL_STATUS;
    switch (status) {
      case "2":
        return !isViewOnly ? (
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID,row.SCREEN_TYPE)}>
            {"Quality Check"}
          </Button.Ripple>
        ) : (
          ""
        );
      case "3":
      case "4":
      case "5":
      case "6":
      case "0":
      case "7":
        return (
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/QAView:${row.PI_REFID}/${returnUrl || "QC"}`);
            }}
          >
            {"View QC"}
          </Button.Ripple>
          
        );
        case "21":
          return !isViewOnly ? (
            <Button.Ripple color="primary" onClick={(e) => onUpdateStatusAfterUnload(row.PI_REFID)}>
              {"Quality Check"}
            </Button.Ripple>
          ) : (
            ""
          );
      default:
        return "";
    }
  };
  const actionsCol_ias = (row) => {
    let status = row.VECHICAL_STATUS;
    switch (status) {
      case "2":
        return !isViewOnly ? (
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID,row.SCREEN_TYPE)}>
            {"Quality Check"}
          </Button.Ripple>
        ) : (
          ""
        );
      case "3":
      case "4":
      case "5":
      case "6":
      case "0":
      case "24":
      case "12":
     
        
      case "7":
        return (
          <Button.Ripple
            color="primary"
            onClick={(e) => {
             // history.push(`/QAView:${row.PI_REFID}/${returnUrl || "QC"}`);
              history.push(`/IASQC:${row.PI_REFID}`);
            }}
          >
            {"View QC"}
          </Button.Ripple>
          
        );
        case "21":
          return !isViewOnly ? (
            <Button.Ripple color="primary" onClick={(e) => onUpdateStatusAfterUnload(row.PI_REFID)}>
              {"Quality Check"}
            </Button.Ripple>
          ) : (
            ""
          );
      default:
        return "";
    }
  };

  const actionsCol_STM = (row) => {
    let status = row.VEHICLE_STATUS;
    switch (status) {
      case 2:
        return !isViewOnly ? (
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus_STM(row.ID)}>
            {"Quality Check"}
          </Button.Ripple>
        ) : (
          ""
        );
      case 3:
      case 4:
      case 5:
      case 6:
      case 0:
      case 24:
      case 12:
        case 16:
        case 15:
      case 7:
        return (
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/STM_QAView:${row.ID}/${returnUrl || "QC"}`);
            }}
          >
            {"View QC"}
          </Button.Ripple>
          
        );
      default:
        return "";
    }
  };

  const onUpdateStatus = (id,ScreenType) => {
    if(ScreenType=="IAS"){
      history.push(`/IASQC:${id}`);
    }else{
      history.push(`/QC:${id}`);
    }
    
  };
  const onUpdateStatusAfterUnload =(id) => {
    history.push(`/AfterUnloadQC:${id}`);
  }
  const onUpdateStatus_STM = (id) => {
    history.push(`/STM_QC:${id}`);
  };
  
  return (
    <div>
      <RefreshBlock />
       <CardComponent header="Search Filter">
       {/* <QCFilterForm form={form} onSubmit={onSubmit}   />*/}
        <FilterForm form={form} onSubmit={onSubmit}   />
      </CardComponent>
      <CardComponent>
          <TabControl tabList={tabs} />
        </CardComponent>

      
    </div>
  );
};

export default ViewQualityCheck;
