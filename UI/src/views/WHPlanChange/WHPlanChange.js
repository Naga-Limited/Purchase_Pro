import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import { useLoader } from "../../utility/hooks/useLoader";
import TabControl from "../../@core/components/tab/TabControl";

import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl, vaUrl } from "../../urlConstants";
import TruckListTable from "../common/TruckListTable";
import IASListTable from "../common/IASListTable";
import { ShowToast, statusCode } from "../../helper/appHelper";
import { useAuth } from "../../utility/hooks/useAuth";
import { RefreshBlock } from "../common/RefreshBlock";
import TruckListPlanChange from "../common/TruckListPlanChange";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { evaColumnIAS } from "./columnSpec";
import IASListPlanChange from "../common/IASListPlanChange";
import RelottView from "./RelottView";

const WHPlanChange = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    includeIas: false,
    vehicleStatus: "1,2,3,4,5,21,23,24,22,19",
    cfilter: "IsFromSDT = 0",
    VStausChange:"'SDI','SDO','IAS','SILOTOMILL'"
  });
  const [screenType] = useState("EVADP");
  const { plantIds } = useAuth();
  const [iasfilter] = useState({
    plantIds: plantIds,
    formType: "Process",
    SCREEN_TYPE: screenType,
    isTruck: true,
    status: "16,15,14,13,5,1,23,24",
    VStausChange:"IAS"
  });
  const [stmfilter] = useState({
    plantIds: plantIds,
    formType: "Process",
    SCREEN_TYPE: screenType,
    isTruck: true,
    status: "23,13,2,24,5,15,16,4",
    VStausChange:"SILOTOMILL"
  });

  const [sType] = useState("EVAOY");
  
  const [irsfilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    SCREEN_TYPE: sType,
    status: "1,8,9,10",
  });

  const tabs = [
    {
      id: "sdo_sdi",
      title: "SDO/SDI",
      renderTab: () => <TruckListPlanChange postData={filter} hideFilter actionCell={actionsCol} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "ias",
      title: "IAS",
      renderTab: () => <IASListPlanChange postData={iasfilter} columns={evaColumnIAS} hideFilter actionCell={actionsCol_ias} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "stm",
      title: "SILO TO MILL",
      renderTab: () => <IASListPlanChange postData={stmfilter} columns={evaColumnIAS} hideFilter actionCell={actionsCol_stm} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "irs",
      title: "IRS",
      renderTab: () => <IASListPlanChange postData={irsfilter} columns={evaColumnIAS} hideFilter actionCell={actionsCol_irs} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "relotting",
      title: "RELOTTING",
      renderTab: () => <RelottView  formTypes = {"getRelottingProcessChange"}/>,
    },
  ];
  const actionsCol = (row) => {
    return (
      <Button.Ripple color="danger"  onClick={(e) => {
        history.push(`PlanChange/${row.PI_REFID}/SDO_SDI`);
      }} >
        Reject
      </Button.Ripple>
    );
  };
  
  const actionsCol_ias = (row) => {
    return (
      <Button.Ripple color="danger"  onClick={(e) => {
        history.push(`PlanChange/${row.ID}/IAS`);
      }} >
        Reject
      </Button.Ripple>
    );
  };
  const actionsCol_stm = (row) => {
    return (
      <Button.Ripple color="danger"  onClick={(e) => {
        history.push(`PlanChange/${row.ID}/STM`);
      }} >
        Reject
      </Button.Ripple>
    );
  };
   const actionsCol_irs = (row) => {
    return (
      <Button.Ripple color="danger"  onClick={(e) => {
        history.push(`PlanChange/${row.ID}/IRS`);
      }} >
        Reject
      </Button.Ripple>
    );
  };

 

  return (
    
    <div>
      <RefreshBlock />   
      <Card>
        <CardHeader>
          <CardTitle>Entry Rejected WH Incharge </CardTitle>
          {/* <NavItem>
            <NavLink onClick={() => history.push("/marketrate/entry")}>Testing entry</NavLink>
          </NavItem>
          <NavItem>
            <NavLink onClick={() => history.push("/marketrate/filter")}>Testing view</NavLink>
          </NavItem> */}
        </CardHeader>
        <CardBody>
          <TabControl tabList={tabs} />
        </CardBody>
      </Card>
      
    </div>
  );
};

export default WHPlanChange;
