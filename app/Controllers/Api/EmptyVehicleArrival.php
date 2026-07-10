<?php

namespace App\Controllers\Api;

use App\Helpers\SapUrlHelper;
use App\Models\EmptyVehicleArrivalModel;
use App\Models\GatePro\MasterService;
use App\Models\PortDispatchModel;

date_default_timezone_set("Asia/Calcutta");
class EmptyVehicleArrival extends BaseApiController
{
  public function getDestPortTruckList()
  {
    $qs = $this->request->getGet();
    $model = new EmptyVehicleArrivalModel();
    $res = $model->getDestPortTruckList("8");
    return  $this->sendSuccessResult($res);
  }

  public function getReceivedContainerList()
  {
    $qs = $this->request->getGet();
    $model = new PortDispatchModel();
    $res = $model->getReceivedContainerList();
    return  $this->sendSuccessResult($res);
  }

  public function getById()
  {
    $id = $this->request->getGet("id");
    $model = new EmptyVehicleArrivalModel();
    $res = $model->getById($id);
    return $this->sendSuccessResult($res);
  }

  public function addOrUpdateVehicleArrival()
  {

    $json = $this->request->getJSON();
    $model = new EmptyVehicleArrivalModel();
    $masterService = new MasterService();	

    if (!isset($json->ID) && $model->isVehicleAlreadyIn($json)) {
      return $this->sendErrorResult("Vehicle already in");
    }else if(!isset($json->ID) && $model->isVehicleClearOldEntries($json)){
      return $this->sendErrorResult("Clear Old Entries");
    }

    if (!empty($json->TRUCK_NO)) {

        $already_in_Check = $masterService->VehicleAlreadyInCheck($json->TRUCK_NO);

        if (!empty($already_in_Check[0]['WERKS'])) {

            $message = 'VehicleAlready in - ' . 
                       $already_in_Check[0]['PLANT_NAME'] . 
                       ' (' . $already_in_Check[0]['WERKS'] . ')';

            return $this->sendErrorResult($message);
        }
    }

    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];
    $CurrentDateTime = date("Y-m-d H:i:s");
//var_dump($json);exit();
    //echo "VEHICLE_STATUS : ", $json->VEHICLE_STATUS;

    if ($json->SCREEN_TYPE == "EVADP") {
      // ** vahicle status added in or condition for New Update Lot Page 
      if ($json->VEHICLE_STATUS == 13 || $json->VEHICLE_STATUS == 23) {
        $json->GateInDt = $CurrentDateTime;
        $json->GateInBy = $SessionUser;
        $json->GateInByName = $SessionUserName;
      }
    } else {
      if ($json->VEHICLE_STATUS == 8 || $json->VEHICLE_STATUS == 13) {
        $json->GateInDt = $CurrentDateTime;
        $json->GateInBy = $SessionUser;
        $json->GateInByName = $SessionUserName;
      }
    }

    if ($json->VEHICLE_STATUS == 1) {
      $json->WaitOutsideDt = $CurrentDateTime;
      $json->WaitOutsideBy = $SessionUser;
      $json->WaitOutsideByName = $SessionUserName;
    }

    // var_dump($json);exit();
    $res = $model->addOrUpdateVehicleArrival($json);

    if ($res) {
      return $this->sendSuccessResult($res);
    } else {
      return $this->sendErrorResult();
    }
  }

  //Loading Truck / STM Vehicle No 
  public function getTripsheetVehicleDD()
  {
    $id = $this->request->getGet("id");
    $model = new EmptyVehicleArrivalModel();
    $res = $model->getTripsheetVehicleDD();
    return $this->sendSuccessResult($res);
  }
  public function getDriverNameDD()
  {
    $id = $this->request->getGet("id");
    $model = new EmptyVehicleArrivalModel();
    $res = $model->getDriverNameDD();
    return $this->sendSuccessResult($res);
  }
  public function getTripsheetDetails(){
    $json = $this->request->getJSON();
    // print_r($json->Vehicle_Number);exit();
    // $ZZVEHICLE_NO = 'TN5820524';
    $ZZVEHICLE_NO = $json->Vehicle_Number ;
    $urlPath ="zwh_tripsheet/tripsheet?sap-client=900&ZZVEHICLE_NO=$ZZVEHICLE_NO";
    // print_r($urlPath);exit();
    $res = SapUrlHelper::getWhDatas($urlPath);
    // print_r($res);exit();
    return $this->sendSuccessResult($res);
   }
}
