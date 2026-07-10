import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "./columnSpec";
 
import { useHistory } from "react-router";
 import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import TabControl from "../../../../@core/components/tab/TabControl";
import { evaUrl } from "../../../../urlConstants";
import IasEmptyVehicleArrivalForm from "./ias-empty-vehicle-arrival-form";
import IasEmptyVehicleArrivalForm_STM from "./ias-empty-vehicle-arrival-form_stm";
import TableComponent from "../../../common/TableComponent";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useAuth } from "../../../../utility/hooks/useAuth";
import { statusCode } from "../../../../helper/appHelper";

const IasEmptyVehicleArrival = ({ isTruck, title, actionColumn,FirstWeight, gateInStatus,ScreenName,ShowStmNon }) => {
  const { showLoader, hideLoader } = useLoader();
  const { plantIds } = useAuth();
  console.log("Plants");
  console.log(JSON.stringify(plantIds));

  let SiloExist=plantIds.length==0 || plantIds.includes("1111") || plantIds.includes("FR01");
  if(ShowStmNon==1){
    SiloExist=false;
  }
  console.log("SiloExist"+SiloExist);

  const [screenType] = useState("EVADP");
  const history = useHistory();
  const [filter, setFilter] = useState({
    plantIds: plantIds,
    formType: "Process",
    SCREEN_TYPE: screenType,
    isTruck: isTruck,
    // status: "16,15,14,13,5,1,23,24",
    status: "5,15",
  });
  
  const tabs = [
    {
      id: "ias",
      title: "IAS",
      renderTab: () =>  <IasEmptyVehicleArrivalForm onAdded={refreshTable} isTruck={isTruck} FirstWeight={FirstWeight}  gateInStatus={gateInStatus} />,
    },
    {
      id: "stm",
      title: "SILO TO MILL",
      ShowTab:SiloExist,
      renderTab: () =>  <IasEmptyVehicleArrivalForm_STM onAdded={refreshTable} isTruck={isTruck} FirstWeight={FirstWeight} gateInStatus={gateInStatus} />,
    },
    
  ];

  const onUpdateStatus = (status, id) => {
    console.log("onUpdateStatus",status,id);
    if(statusCode.INTRANSIT==status)//Mohan 23-09-2022 added for Waitout gatein status 
    {
    history.push(`/warehouse/IAS/GateOut:`+ id);
    }
    else{
    let fdata = { ID: id, VEHICLE_STATUS: status, formType: "U" };
    showLoader();
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          //refreshTable();

          
          
          //history.push(`/Slip:${id}`);
          
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
    }
  };

  const onUpdateGateOut = (id) => {

    //alert("ID", id); 
    history.push(`/STM_Gateout:${id}/EVADPTruck`);

   /* let fdata = { ID: id, VEHICLE_STATUS: status, formType: "U" };
    showLoader();
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          refreshTable();
        }
      })
      .catch(() => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());*/
  };

  const refreshTable = () => {
    setFilter((p) => ({ ...p }));
  };

  const columns = [...evaColumns(isTruck), actionColumn(onUpdateStatus,onUpdateGateOut)];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}test</CardTitle>
        </CardHeader>
      
        <CardBody>
          <TabControl tabList={tabs} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{"Vehicle Details"}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent postData={filter} ScreenName={ScreenName} columns={columns} url={evaUrl} formType="Process" />
        </CardBody>
      </Card>
    </div>
  );
};

export default IasEmptyVehicleArrival;
