import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "../../IRS/columnSpec";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { evaUrl } from "../../../urlConstants";
import VehicleArrivalForm from "./vehicle-arrival-form";
import TableComponent from "../../common/TableComponent";
import { useLoader } from "../../../utility/hooks/useLoader";

const VehicleArrival = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  let { showLoader, hideLoader } = useLoader();
  const history = useHistory();
  const [screenType] = useState("EVAOY");
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    SCREEN_TYPE: screenType,
  });

  const onUpdateStatus = (val, id) => {
    if (val == 1) {
      let fdata = { ID: id, VEHICLE_STATUS: 8, formType: "U" };
      showLoader();
      apiPostMethod(evaUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            refreshTable();
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    } else if (val == 8) {
      history.push(`/UAOY:${id}`);
    }
  };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };

  const columns = [...evaColumns, actionColumn(onUpdateStatus)];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Arrival</CardTitle>
        </CardHeader>
        <CardBody>
          <VehicleArrivalForm onAdded={refreshTable} />
        </CardBody>
      </Card>
      <TableComponent postData={filter} columns={columns} url={evaUrl} formType="F" />
    </div>
  );
};

export default VehicleArrival;

export const actionColumn = (onUpdateStatus) => {
  const actionsCol = {
    name: "Actions",
    selector: "status",
    minWidth: "150px",
    cell: (row) => {
      return row.VEHICLE_STATUS == 1 || row.VEHICLE_STATUS == 8 ? (
        <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(row.VEHICLE_STATUS, row.ID)}>{`${
          row.VEHICLE_STATUS == 1 ? "Gate In" : row.VEHICLE_STATUS == 8 ? "Yard/WH Dispatch info" : ""
        }`}</Button.Ripple>
      ) : (
        ""
      );
    },
  };
  return actionsCol;
};
