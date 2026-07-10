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
import ChangeVehicleStatusForm from "../IAS/receiving/vehicle-arrival/vehicle-arrival-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { statusCode } from "../../helper/appHelper";
import { evaColumns } from "./columnSpec";
import { useAuth } from "../../utility/hooks/useAuth";
import { RefreshBlock } from "../common/RefreshBlock";
const ChangeVehicleStatus = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  let { showLoader, hideLoader } = useLoader();
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    includeIas: false,
    vehicleStatus: "1,2,3,4,5,6,21,23,24,22,19",
    cfilter: "IsFromSDT = 0",
    VStausChange:"'SDI','SDO'"
  });
  const [screenType] = useState("EVADP");
  const { plantIds } = useAuth();
  const [iasfilter] = useState({
    plantIds: plantIds,
    formType: "F",
    SCREEN_TYPE: screenType,
    isTruck: true,
    status: "16,15,14,13,5,1,23,24",
    VStausChange:"IAS"
  });
  const [stmfilter] = useState({
    plantIds: plantIds,
    formType: "F",
    SCREEN_TYPE: screenType,
    isTruck: true,
    status: "23,13,2,24,5,15,16,4",
    VStausChange:"SILOTOMILL"
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
      id: "sdo_sdi",
      title: "SDO/SDI",
      renderTab: () => <TruckListTable postData={filter} hideFilter actionCell={actionsCol} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "ias",
      title: "IAS",
      renderTab: () => <IASListTable postData={iasfilter} columns={evaColumns} hideFilter actionCell={actionsCol_ias} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "stm",
      title: "SILO TO MILL",
      renderTab: () => <IASListTable postData={stmfilter} columns={evaColumns} hideFilter actionCell={actionsCol_stm} ScreenName={"Change Vehicle Status"}  />,
    },
    {
      id: "irs",
      title: "IRS",
      renderTab: () => <IASListTable postData={irsfilter} columns={evaColumns} hideFilter actionCell={actionsCol_irs} ScreenName={"Change Vehicle Status"}  />,
    },
  ];
  const actionsCol = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`ChangeVehicleStatusDetails/${row.PI_REFID}/SDO_SDI`);
      }} >
        Change
      </Button.Ripple>
    );
  };
  const actionsCol_ias = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`ChangeVehicleStatusDetails/${row.ID}/IAS`);
      }} >
        Change
      </Button.Ripple>
    );
  };
  const actionsCol_stm = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`ChangeVehicleStatusDetails/${row.ID}/STM`);
      }} >
        Change
      </Button.Ripple>
    );
  };
   const actionsCol_irs = (row) => {
    return (
      <Button.Ripple color="primary"  onClick={(e) => {
        history.push(`ChangeVehicleStatusDetails/${row.ID}/IRS`);
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
          <CardTitle>Change Vehicle Status </CardTitle>
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

export default ChangeVehicleStatus;
