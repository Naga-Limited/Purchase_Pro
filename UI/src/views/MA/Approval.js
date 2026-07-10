import { Button } from "reactstrap";

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import TruckListTable from "../common/TruckListTable";

import { CardComponent } from "../common/CardComponent";
import FilterForm from "../FilterForm";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import {  previewUrl,BASE_URL, apiBaseUrl } from "../../urlConstants";
import { RefreshBlock } from "../common/RefreshBlock";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";

const MApprover = ({ isViewOnly, title, returnUrl, status }) => {
  const history = useHistory();
  let [ otherfilter,setFilter] = useState();
  let { showLoader, hideLoader } = useLoader();

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  console.log(UserDetails.role)
 /* const [tableFilter] = useState({
    vehicleStatus: status || "2,3,4,5,6",
  });*/
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });
  let values = form.values;
  let tableFilter = {
    vehicleStatus: status || "6,27,31",
    formType:"Process",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  let fromdt =getFromDate(values.date); 
  let todt =getFromDate(values.date); 
  let tmpPlantIdArr=values.PlantId;
  let ontableFilter = {
    vehicleStatus: status || "6,27,31",
    formType:"Process",
    otherfilter: {
      from:fromdt,
      to: todt,
      PlantIdArr: tmpPlantIdArr,
     
    },
  };

  const onSubmit = () => {
    console.log(form.values);
    alert("sf")
    tableFilter=ontableFilter;
   setFilter(tableFilter);
    /*setFilter({
      otherfilter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        PlantIdArr: values.PlantId,
       
      },
    });*/
  };
  const actionsCol = (row) => {
    switch (row.VECHICAL_STATUS) {
      case "6":
        return (
          <>
        {row.VECHICAL_STATUS === "6" && row.ZVA_NUMBER.length == '18' &&(
          <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID)}>
            {"Approve"}
          </Button.Ripple>
        )}
        </>
      );
      case "4":
      case "5":
      case "7":
        return (
          <>
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                history.push(`/QAView:${row.PI_REFID}/${returnUrl || "AP"}`);
              }}
            >
              {"View QC"}
            </Button.Ripple>
            {row.VECHICAL_STATUS === "7" && (
              <Button.Ripple className="ml-2" color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID)}>
                {"View Entry"}
              </Button.Ripple>
            )}
            <Button.Ripple className="ml-2" color="primary" onClick={(e) => openAttach(row.quality_info)}>
                {"QC Doc"}

              </Button.Ripple>
              <Button.Ripple className="ml-2" color="primary" onClick={(e) => openAttach(row.supp_inv_copy)}>
                {"Invoice Copy"}
                
              </Button.Ripple>
              <Button.Ripple className="ml-2" color="primary" onClick={(e) => openAttach(row.supp_wb_copy)}>
                {"WB Copy"}
                
              </Button.Ripple>
              <Button.Ripple className="ml-2" color="primary" onClick={(e) => openAttach(row.naga_os_wb_copy)}>
                {"Naga outside WB Copy"}
                
              </Button.Ripple>

              <Button.Ripple className="ml-2" color="primary" onClick={(e) =>  
                window.open(BASE_URL+"/#/STOSDTSlip:"+row.PI_REFID, "", "width=900,height=650")
                }>
                {"Print"}
                
              </Button.Ripple>
              

          </>
        );
        case "27":

          return (
            <>
            {row.VECHICAL_STATUS === "27" && (
              <Button.Ripple color="primary" onClick={(e) => WrongEntry(row.PI_REFID)}>
              {"WB Change"}
              </Button.Ripple>
            )}
            </>
          );
          case "28":

          return (
            <>
            {row.VECHICAL_STATUS === "28" && (
              <Button.Ripple color="primary" onClick={(e) => WrongEntry(row.PI_REFID)}>
              {"PO Change"}
              </Button.Ripple>
            )}
            </>
          );
          case "31":
            return (
              <>
            {row.VECHICAL_STATUS === "31" && row.ZVA_NUMBER.length == '18' &&(
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.PI_REFID)}>
                {"Approve"}
              </Button.Ripple>
            )}
            </>
          );
        default:
        return "";
    }
  };

  const onUpdateStatus = (id) => {
    history.push(`/AP:${id}`);
  };
  const WrongEntryApporval = (id) => {
    history.push(`/WrongEntApp:${id}/AP`);
  };
  const WrongEntry = (id) => {
    history.push(`/WrongEntry:${id}/AP`);
  };
  const openAttach = (url) => {
    //window.open(previewUrl + url, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
  };
  return (
    <div>
        <RefreshBlock />
      <CardComponent header="Search Filter">
        <FilterForm form={form} onSubmit={onSubmit}   />
      </CardComponent>
      <TruckListTable
        hideFilter={isViewOnly}
        postData={tableFilter}
        ScreenName={"MIGO Approval"}
        actionCell={actionsCol}
        title={title || "MIGO Approval"}
        actitionColumnWidth={"800px"}
      />
    </div>
  );
};

export default MApprover;
