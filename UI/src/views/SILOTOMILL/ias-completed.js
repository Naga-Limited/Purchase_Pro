import { Button } from "reactstrap";
import React, {useState} from "react";

import { useHistory } from "react-router-dom";
import TruckListTable from "../common/TruckListTable";
import { statusCode } from "../../helper/appHelper";
import { useAuth } from "../../utility/hooks/useAuth";
import { CardComponent } from "../common/CardComponent";
import IASFilterForm from "./IASFilterForm";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { BASE_URL } from "../../urlConstants";
const IasCompleted = () => {
  const { plantIds } = useAuth();
 
  let [ otherfilter,setFilter] = useState();
  const filter = {
    plantIds: plantIds,
    formType: "F",
    includeIas: true,
    vehicleStatus: "12",
    otherfilter
  };
  const history = useHistory();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });
 

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
        <IASFilterForm form={form} onSubmit={onSubmit}   />
      </CardComponent>
      <TruckListTable postData={filter} actionCell={actionsCol} title={"Vehicle List"} hideFilter />
    </div>
  );
};

export default IasCompleted;
