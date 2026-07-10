<?php

namespace App\Controllers\Api;

use App\Models\EmptyVehicleArrivalModel;
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
    if (!isset($json->ID) && $model->isVehicleAlreadyIn($json)) {
      return $this->sendErrorResult("Vehicle already in");
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
}
