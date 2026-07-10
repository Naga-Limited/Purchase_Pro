import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "../columnSpec";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector, useDispatch } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { evaUrl } from "../../../urlConstants";
import SHOW_LOADER from "@store/actions/busyloader";
import YardEmptyTruckArrivalForm from "./yard-empty-truck-arrival-form";
import TableComponent from "../../common/TableComponent";
import { statusCode } from "../../../helper/appHelper";
import { addOption, toCamelCaseObject } from "../../common/Utils";
import { RefreshBlock } from "../../common/RefreshBlock";

const YardEmptyTruckArrival = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  const dispatch = useDispatch();
  const [screenType] = useState("EVAOY");
  const [selectedRow, setSelectedRow] = useState();
  const [filter, setFilter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    SCREEN_TYPE: screenType,
    status: "1,8,9,10",
  });

  const onUpdateStatus = (val, id) => {
    if (val == 1) {
      let fdata = { ID: id, VEHICLE_STATUS: 8, formType: "U" };
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
    } else if (val == 8) {
      history.push(`/UAOY:${id}`);
      //history.push(`/IASPDI:${id}`);
    }
  };

  const onEdit = (row) => {
    let newRow = toCamelCaseObject(row);
    let data = {
      ...newRow,
      containerType: addOption(newRow.containerType),
      plant: addOption(newRow.plantName, newRow.plantId),
    };
    setSelectedRow(data);
    window.scrollTo(0, 0);
  };

  const refreshTable = (isCancel) => {
    setSelectedRow(undefined);
    if (!isCancel) {
      setFilter((p) => ({ ...p }));
    }
  };
  const renderActionButton = (btnTxt, onClick) => {
    return (
      <Button.Ripple color="primary" onClick={onClick}>
        {btnTxt}
      </Button.Ripple>
    );
  };
  const actionColumn = () => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "250px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        switch (status) {
          case statusCode.IN:
            return renderActionButton("Gate In", () => onUpdateStatus(status, row.ID));
          case statusCode.YARD_DISPTACH_INFO:
          case statusCode.PORT_DISPTACH_INFO:
            return (
              <>
                {renderActionButton("Edit", () => onEdit(row))} &nbsp;
                {status == statusCode.YARD_DISPTACH_INFO
                  ? renderActionButton("Yard/WH Dispatch", () => onUpdateStatus(status, row.ID))
                  : ""}
              </>
            );
          default:
            return "";
        }
      },
    };
    return actionsCol;
  };

  const columns = [...evaColumns, actionColumn()];
  return (
    <div>
       <RefreshBlock />
      <Card>
        <CardHeader>
          <CardTitle>Loading - Container Origin</CardTitle>
        </CardHeader>
        <CardBody>
          <YardEmptyTruckArrivalForm onAdded={refreshTable} initialValues={selectedRow} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{"Vehicle Details"}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent postData={filter} columns={columns} url={evaUrl} formType="F" ScreenName="Loading - Container Origin" />
        </CardBody>
      </Card>
    </div>
  );
};

export default YardEmptyTruckArrival;
