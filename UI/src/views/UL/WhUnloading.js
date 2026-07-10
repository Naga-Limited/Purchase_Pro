import { Button } from "reactstrap";

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import TruckListTable from "../common/TruckListTable";
import { RefreshBlock } from "../common/RefreshBlock";
import { BASE_URL } from "../../urlConstants";

const WhUnloading = () => {
  const history = useHistory();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [tableFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    // vehicleStatus: "4,5",
    vehicleStatus: "4",
    includeIas: true,
  });
  const actionsCol = (row) => {
    let { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
    return row.VECHICAL_STATUS === "4" ?  (
      <>
        <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(arrivalId, emtArrivalId, type,row.SCREEN_TYPE)}>
          {"Unload"}
        </Button.Ripple>&nbsp;
        {row.SCREEN_TYPE=='IAS' && row.QA_STATUS !== "R" && false && (
           <Button.Ripple color="primary" onClick={(e) => 
            window.open(BASE_URL+"/#/Slip:"+row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
           }>
           {"Print"}
         </Button.Ripple>
        )}
        
      </>
      
    ) : (
      <>
      {row.SCREEN_TYPE=='IAS' && row.QA_STATUS !== "R" && false && (
        <Button.Ripple color="primary" onClick={(e) => 
         window.open(BASE_URL+"/#/Slip:"+row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
        }>
        {"Print"}
      </Button.Ripple>
     )}
     </>
    );
  };
  const onUpdateStatus = (arrivalId, emtArrivalId, type,ScreenType) => {
   // console.log("ScreenType:"+ScreenType);
   //alert(ScreenType)
    if (emtArrivalId) {
      if(ScreenType=="SILOTOMILL"){
        history.push(`/silotomill/unload/receiving/${type.toLowerCase()}/${emtArrivalId}/UL/${arrivalId}`);  
      }else{
        history.push(`/ias/unload/receiving/${type.toLowerCase()}/${emtArrivalId}/UL/${arrivalId}`);
      
      }
      // history.push(`/IASUL/${type}/${emtArrivalId}/${arrivalId}`);
    } else {
      history.push(`/UL:${arrivalId}`);
    }
  };

  return (
    <div>
      <RefreshBlock />
      <TruckListTable postData={tableFilter} actionCell={actionsCol} ScreenName={"Unloading WH Incharge"} title={"Unloading WH Incharge"} />
    </div>
  );
};

export default WhUnloading;
