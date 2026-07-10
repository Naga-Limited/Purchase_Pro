import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "./empty-vehicle-arrival/columnSpec";
import { useHistory } from "react-router-dom";
import { evaUrl } from "../../../urlConstants";
import TableComponent from "../../common/TableComponent";
import { useAuth } from "../../../utility/hooks/useAuth";
import { statusCode } from "../../../helper/appHelper";
import { RefreshBlock } from "../../common/RefreshBlock";

const IasWarehouseInchargePage = () => {
  const { plantIds } = useAuth();
  const history = useHistory();
  const [screenType] = useState("EVADP");
  const [filter] = useState({
    plantIds: plantIds,
    formType: "Process",
    SCREEN_TYPE: screenType,
    status: '13',
  });

  const addButton = (btnTxt, actionTxt, id) => {
   
    return (
      <Button.Ripple
        color="primary"
        onClick={(e) => {
        if(actionTxt!='Loadingsilo'){
          //New Page Should Push instead of Existing Page
          //history.push(`/ias/${actionTxt}/sending/truck/${id}/IASSWI`); :` + row.bankid
          
          history.push(`/warehouse/IAS/WhLoadingUpdateLot:`+ id);

        }else{
          history.push(`/silotomill/${actionTxt}/sending/truck/${id}/IASSWI`);
        }
        }}
      >
        {btnTxt} 
      </Button.Ripple> 
    );
  };

  const actionColumn = () => {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "230px",
      cell: (row) => {
        let status = Number(row.VEHICLE_STATUS);
        let isTruck = row.TRUCK_NO ? true : false;
        let id = row.ID;
        if (isTruck) {
          switch (status) {
            case statusCode.INTRANSIT:
              return addButton("Redirect", "redirect", id);

            case statusCode.LOADING :
              if(row.SCREEN_TYPE=='SILOTOMILL'){
                return addButton("Loading", "Loadingsilo", id);
              }else{
                return addButton("Update lot", "updatelot", id);
              }

            case statusCode.PICKSLIP:
              return addButton("Add PickSlip", "addpickslip", id);
               
            default:
              return "";
          }
        }
        return "";
      },
    };
    return actionsCol;
  };

  const columns = [...evaColumns(), actionColumn()];
  return (
    <div>
      <RefreshBlock />
      <Card>
        <CardHeader>
          <CardTitle>Loading - WH Incharge</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent postData={filter} ScreenName={"Loading - WH Incharge"} columns={columns} url={evaUrl} formType="F" />
        </CardBody>
      </Card>
    </div>
  );
};

export default IasWarehouseInchargePage;
