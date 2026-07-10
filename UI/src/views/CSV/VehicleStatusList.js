import React, { useState } from "react";
import { evaUrl } from "../../urlConstants";
import { useAuth } from "../../utility/hooks/useAuth";
import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";
import TruckListTable from "../common/TruckListTable";
import { evaColumns } from "../IAS/sending/empty-vehicle-arrival/columnSpec";

const VehicleStatusList = () => {
  let { plantIds } = useAuth();
  const [filter] = useState({
    plantIds: plantIds,
    formType: "F",
    includeIas: true,
    vehicleStatus: "1,2,3,4,5,6",
    cfilter: "IsFromSDT = 0",
  });

  const getSendingFilter = (isTruck) => {
    return {
      plantIds: plantIds,
      formType: "F",
      SCREEN_TYPE: "EVADP",
      isTruck: isTruck,
      status: "16,15,14,13,5,1",
    };
  };
  return (
    <div>
      <TruckListTable postData={filter} title={"Receiving Vehicle List"} />

      <CardComponent header="Sending Vehicle List">
        <TableComponent postData={getSendingFilter()} columns={[...evaColumns()]} url={evaUrl} formType="F" />
      </CardComponent>
    </div>
  );
};

export default VehicleStatusList;
