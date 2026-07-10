import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import { useLoader } from "../../utility/hooks/useLoader";
import TabControl from "../../@core/components/tab/TabControl";
import TruckArrival from "./TruckArrival";

import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { vaUrl } from "../../urlConstants";
import TruckListTable from "../common/TruckListTable";
import IASListTable from "../common/IASListTable";
//import STMWeightEntryForm from "../IAS/receiving/vehicle-arrival/vehicle-arrival-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { statusCode } from "../../helper/appHelper";
import { evaColumns } from "./columnSpec";
import { useAuth } from "../../utility/hooks/useAuth";
import { RefreshBlock } from "../common/RefreshBlock";

const STMWeightEntry = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  const [screenType] = useState("SILOTOMILL");
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    includeIas: true,
    PurchaseQC:true,
    vehicleStatus: "23,24",
    cfilter: "IsFromSDT = 0",
 //   SCREEN_TYPE: screenType,
  });

  

  const [ias_sto_filter] = useState({
    plantIds: UserDetails.plantids,
    formType: "Process",
    includeIas: true,
    vehicleStatus: "23,24",
    SCREEN_TYPE:'IAS',
    cfilter: "IsFromSDT = 0",
  });
  
  const { plantIds } = useAuth();
  const [stmfilter] = useState({
    plantIds: plantIds,
    formType: "F",
   // SCREEN_TYPE: screenType,
    isTruck: true,
    status: "23,24",
  });

  const [sType] = useState("EVAOY");
  
  const [irsfilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    SCREEN_TYPE: sType,
    status: "1,8,9,10",
  });
  const onUpdateStatus = (val, id, INCO1, status) => {
    //if (val === statusCode.IN || status === statusCode.REJECTED_GATE_OUT)
    if (val === statusCode.IN || status === statusCode.REDIRECT_GATEOUT) {
      let fdata = { id: id, status: status, formType: "U", pod: INCO1 };
      showLoader();
      apiPostMethod(vaUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setFilter((p) => ({ ...p }));
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else if (val === statusCode.GATEOUT) {
      history.push(`/UP:${id}`);
    }
  };
  // const onUpdateIrsStatus = (val, row) => {
  //   let { ID: id, PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
  //   if (val == statusCode.IN) {
  //     let fdata = { ID: id, VEHICLE_STATUS: 4, formType: "U" };
  //     showLoader();
  //     apiPostMethod(evaUrl, fdata)
  //       .then((response) => {
  //         const { data } = response;
  //         if (data.success) {
  //           refreshTable();
  //         }
  //       })
  //       .catch((error) => {
  //         errorToast("Something went wrong, please try again after sometime");
  //       })
  //       .finally(() => hideLoader());
  //   } else if (val == statusCode.GATEOUT) {
  //     // history.push(`/IASRGO/${type}/${emtArrivalId}/${arrivalId}`);
  //     history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
  //   }
  // };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };
  const actionColumn = (onUpdateStatus) => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "230px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        switch (status) {
          case statusCode.IN:
            return (
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.LOADING, row.ID)}>
                {"Gate In"}
              </Button.Ripple>
            );
          case statusCode.GATEOUT:
            return (
              <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.PICKSLIP, row.ID)}>
                Gate Out
              </Button.Ripple>
            );
          default:
            return "";
        }
      },
    };
    return actionsCol;
  };

  const tabs = [
    {
      id: "Loading",
      title: "Load",
      renderTab: () => <IASListTable postData={stmfilter} columns={evaColumns} hideFilter actionCell={actionsCol_ias} ScreenName={"Weight Entry"}  />,
    },
    {
      id: "Unloading",
      title: "Unload",
      renderTab: () => <TruckListTable postData={filter} hideFilter actionCell={actionsCol} ScreenName={"Weight Entry"}  />,
    },
    {
      id: "ias_sto",
      title: "STO - Unload",
      ShowTab:false,
      renderTab: () => <TruckListTable postData={ias_sto_filter} hideFilter actionCell={actionsCol} ScreenName={"Weight Entry"}  />,
    },
    
  ];
  
  const actionsCol = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`STMWeightEntryDetails/${row.EMPTY_VEHICLE_ARRIVAL_ID}/${row.PI_REFID}/Unload`);
      }} >
        Update
      </Button.Ripple>
    );
  };
  const actionsCol_ias = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`STMWeightEntryDetails/${row.ID}/0/STM`);
      }} >
        Update
      </Button.Ripple>
    );
  };
   const actionsCol_irs = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`STMWeightEntryDetails/${row.ID}/IRS`);
      }} >
        Change
      </Button.Ripple>
    );
  };
  return (
    
    <div>
      <RefreshBlock />   
      <Card>
        <CardHeader>
          <CardTitle>Weight Entry</CardTitle>
          {/* <NavItem>
            <NavLink onClick={() => history.push("/marketrate/entry")}>Testing entry</NavLink>
          </NavItem>
          <NavItem>
            <NavLink onClick={() => history.push("/marketrate/filter")}>Testing view</NavLink>
          </NavItem> */}
        </CardHeader>
        <CardBody>
         { <TabControl tabList={tabs} />}
         
        </CardBody>
      </Card>
      
    </div>
  );
};

export default STMWeightEntry;
