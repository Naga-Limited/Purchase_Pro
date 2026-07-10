import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector, useDispatch } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { evaUrl } from "../../../../urlConstants";
import SHOW_LOADER from "@store/actions/busyloader";
import VehicleArrivalForm from "./vehicle-arrival-form";
import TruckListTable from "../../../common/TruckListTable";

const VehicleArrival = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  const dispatch = useDispatch();
  const [screenType] = useState("IAS");
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    SCREEN_TYPE: screenType,
    vehicleStatus: "1,4,5",
  });

  const onUpdateStatus = (val, row) => {
    let { ID: id, PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
    if (val == 1) {
      let fdata = { ID: id, VEHICLE_STATUS: 4, formType: "U" };
      dispatch(SHOW_LOADER(true));
      apiPostMethod(evaUrl, fdata)
        .then((response) => {
          dispatch(SHOW_LOADER(false));
          const { data } = response;
          if (data.success) {
            refreshTable();
          }
        })
        .catch((error) => {
          dispatch(SHOW_LOADER(false));
          errorToast("Something went wrong, please try again after sometime");
        });
    } else if (val == 5) {
      history.push(`/IASRGO/${type}/${emtArrivalId}/${arrivalId}`);
    }
  };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };
  const actionColumn = (row) => {
    let status = row.VECHICAL_STATUS;
    return status == 1 || status == 5 ? (
      <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(status, row)}>{`${
        status == 1 ? "Gate In" : "Gate Out"
      }`}</Button.Ripple>
    ) : (
      ""
    );
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>IAS Vehicle Arrival</CardTitle>
        </CardHeader>
        <CardBody>
          <VehicleArrivalForm onAdded={refreshTable} />
        </CardBody>
      </Card>
      <TruckListTable postData={filter} actionCell={actionColumn} title={"Vehicle List"} />
    </div>
  );
};

export default VehicleArrival;
