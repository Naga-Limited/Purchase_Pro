import { Button } from "reactstrap";
import React, {useState,useEffect} from "react";

import { useHistory } from "react-router-dom";
import TruckListTable from "../common/TruckListTable";
import { statusCode } from "../../helper/appHelper";
import { useAuth } from "../../utility/hooks/useAuth";
import { CardComponent } from "../common/CardComponent";
import FilterForm from "../FilterForm";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { BASE_URL } from "../../urlConstants";
import moment from "moment"; 
const IasCompleted = () => {
  const { plantIds } = useAuth();
  const dateFormat = "DD/MM/YYYY";
  const today = moment().format(dateFormat);
  let [ otherfilter,setFilter] = useState();
  let selectedValue={start:today,end:today};
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),
   
    

  });

 
  let values = form.values;
  const filter = {
    plantIds: plantIds,
    formType: "Completed",
    includeIas: true,
    vehicleStatus: "11,12,34",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId,
     
    },
  };
  const history = useHistory();
  
  console.log("FORM");
  console.log(JSON.stringify(form));

  const actionsCol = (row) => {
    let status = Number(row.VECHICAL_STATUS);
    let { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
    if (row.SCREEN_TYPE == "IAS" && row.QA_STATUS !== "R") {
      return (
        status == statusCode.COMPLETED && (
          <>
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                let url = `/ias/view/receiving/${type.toLowerCase()}/${emtArrivalId}/IASView/${arrivalId}`;
                history.push(url);
              }}
            >
              View
            </Button.Ripple>
&nbsp;
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                window.open(BASE_URL+"/#/Slip:"+row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
              }}
            >
             Print
            </Button.Ripple>

          
          </>
        )
      );
    }
    if (row.SCREEN_TYPE == "SILOTOMILL" && row.QA_STATUS !== "R") {
      return (
        status == statusCode.COMPLETED && (
          <>
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                let url = `/silotomill/view/receiving/${type.toLowerCase()}/${emtArrivalId}/IASView/${arrivalId}`;
                history.push(url);
              }}
            >
              View
            </Button.Ripple>
&nbsp;
            <Button.Ripple
              color="primary"
              onClick={(e) => {
                window.open(BASE_URL+"/#/STMSlip:"+row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
              }}
            >
             Print
            </Button.Ripple>

          
          </>
        )
      );
    }
  };
  const onSubmit = () => {
    console.log(form.values);
   // alert("sf")
    let values = form.values;
    console.log(values);
    setFilter({
      otherfilter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        PlantIdArr: values.PlantId,
       
      },
    });
  };
  return (
    <div>
       <RefreshBlock />
       
      <CardComponent header="Search Filter">
        {/*<IASFilterForm form={form} onSubmit={onSubmit}   />*/}
        <FilterForm form={form} onSubmit={onSubmit}   />
      </CardComponent>
      <TruckListTable postData={filter} ScreenName={"IAS View"} actionCell={actionsCol} title={"Vehicle List"} hideFilter />
    </div>
  );
};

export default IasCompleted;
