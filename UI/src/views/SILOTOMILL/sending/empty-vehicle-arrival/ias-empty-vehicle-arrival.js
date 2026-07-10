import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "./columnSpec";
// import { useHistory } from "react-router-dom";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { evaUrl } from "../../../../urlConstants";
import IasEmptyVehicleArrivalForm from "./ias-empty-vehicle-arrival-form";
import TableComponent from "../../../common/TableComponent";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useAuth } from "../../../../utility/hooks/useAuth";

const IasEmptyVehicleArrival = ({ isTruck, title, actionColumn, gateInStatus,ScreenName }) => {
  const { showLoader, hideLoader } = useLoader();
  const { plantIds } = useAuth();
  const [screenType] = useState("EVADP");
  const [filter, setFilter] = useState({
    plantIds: plantIds,
    formType: "F",
    SCREEN_TYPE: screenType,
    isTruck: isTruck,
    status: "16,15,14,13,5,1",
  });
  
  const onUpdateStatus = (status, id) => {
    let fdata = { ID: id, VEHICLE_STATUS: status, formType: "U" };
    showLoader();
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          refreshTable();
        }
      })
      .catch(() => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };

  const columns = [...evaColumns(isTruck), actionColumn(onUpdateStatus)];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <IasEmptyVehicleArrivalForm onAdded={refreshTable} isTruck={isTruck} gateInStatus={gateInStatus} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{"Vehicle Details"}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent postData={filter} ScreenName={ScreenName} columns={columns} url={evaUrl} formType="F" />
        </CardBody>
      </Card>
    </div>
  );
};

export default IasEmptyVehicleArrival;
