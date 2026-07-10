<?php

namespace App\Controllers\Api;

use App\Models\IntraStateDispatchInfoModel;
use App\Helpers\AppHelperFn;

date_default_timezone_set("Asia/Calcutta");
class IntraStateDispatchInfo extends BaseApiController{
  
  public function addInfo(){
    $postData = $this->request->getJSON();

    $model = new IntraStateDispatchInfoModel();

    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];
    $CurrentDateTime = date("Y-m-d H:i:s");
    include_once APIPATH . "/db_connection.php";
    //var_dump($postData);
    $isOwn = AppHelperFn::isOwnWbFromEVA($connect, $postData->vehicleArrivalId);
    if ($isOwn == 1) {
      $postData->vehicleStatus = 24;
    }
    //var_dump($postData);exit();

    $usql = "UPDATE empty_vehicle_arrival SET UpdateLotDt='$CurrentDateTime',UpdateLotByName='$SessionUserName',UpdateLotBy='$SessionUser' WHERE ID = " . $postData->vehicleArrivalId;
    mysqli_query($connect, $usql);

    $Qry = "SELECT Id FROM `intrastate_warhouse_dispatch_info` where VehicleArrivalId='" . $postData->vehicleArrivalId . "'";
    $SelectDispDet = mysqli_query($connect, $Qry);
    $FetchDispDet = mysqli_fetch_assoc($SelectDispDet);
    if ($FetchDispDet['Id'] != "") {
      $res = $model->updateDisp($FetchDispDet['Id'], $postData);
    } else {
      $res = $model->add($postData);
    }

    if ($res)
      return  $this->respond(["success" => 1, "results" => $res]);
    else {
      return  $this->respond(["success" => 0]);
    }
  }


  public function RejectInfo($id){
    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];
    $CurrentDateTime = date("Y-m-d H:i:s");
    include_once APIPATH . "/db_connection.php";
    //$usql = "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS='11',GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser' WHERE ID = " . $id;
    $usql = "UPDATE empty_vehicle_arrival SET RejectionStatus='R', VEHICLE_STATUS='5' WHERE ID = " . $id;
    mysqli_query($connect, $usql);
    return  $this->respond(["success" => 1]);
  }


  public function updateInfo(){
    $id = $this->request->getGet("id");
    if ($id) {
      $postData = $this->request->getJSON();
      //  var_dump($postData);exit();
      $model = new IntraStateDispatchInfoModel();
      $session = session();
      $SessionUser = $_SESSION["USERID"];
      $SessionUserName = $_SESSION["FIRSTNAME"];
      $CurrentDateTime = date("Y-m-d H:i:s");
      include_once APIPATH . "/db_connection.php";
      if ($postData->isSendingRedirected == 0) {
        $usql = "UPDATE empty_vehicle_arrival SET PickSlipDt='$CurrentDateTime',PickSlipByName='$SessionUserName',PickSlipBy='$SessionUser' WHERE ID = " . $postData->vehicleArrivalId;
      }
      if ($postData->isSendingRedirected == 1) {
        $usql = "UPDATE empty_vehicle_arrival SET RedirectDt='$CurrentDateTime',RedirectByName='$SessionUserName',RedirectBy='$SessionUser' WHERE ID = " . $postData->vehicleArrivalId;
      }
      mysqli_query($connect, $usql); //uncomm

      //Update Bag type cutting-START
      $pickSlipNo = $postData->pickSlipNo;
      
      $Qry = "SELECT SendingPlant,ReceivingPlant,SendingStorageLocation,ReceivingStorageLoc,WheatVariety,WbNetWt FROM `intrastate_sap_to_pp` 
              WHERE PickSlipNo='" . $postData->pickSlipNo . "'";

      $Sel = mysqli_query($connect, $Qry);
      $FetchInt = mysqli_fetch_assoc($Sel);
      $SendingPlant = $FetchInt['SendingPlant'];
      $ReceivingPlant = $FetchInt['ReceivingPlant'];
      $SendingStorageLocation = $FetchInt['SendingStorageLocation'];
      $ReceivingStorageLoc = $FetchInt['ReceivingStorageLoc'];
      $WheatVariety = $FetchInt['WheatVariety'];
      $WbNetWt = $FetchInt['WbNetWt'];

      /*$UpdateWeeklyPlan = "UPDATE `ngw_weeklyplan` set ActualMovedQty='$WbNetWt' where 
      fromlotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` 
      where VehicleArrivalId='" . $postData->vehicleArrivalId."')
      and RecStatus='1' ";*/

      //Weekly Plan' Actual Movement Quantity will be updated here
      $UpdateWeeklyPlan = "INSERT INTO `ngw_weeklyplan_actual`( `VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`, 
      `WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
      VALUES (
        (SELECT IFNULL(ZVA_NUMBER,0) FROM `empty_vehicle_arrival` where ID='" . $postData->vehicleArrivalId . "' limit 1),
        (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b where a.WH_CODE=b.wh_code and a.werks='$SendingPlant'),
        (SELECT IFNULL(ID,0) FROM `master_plant` where werks='$SendingPlant'),
        (SELECT IFNULL(STORAGE_REFID,0) FROM `master_storage` where LGORT='$SendingStorageLocation'),
        (SELECT if(count(1)=0,0,id)  FROM `master_mrc_wheat_variety` where WheatVariety='$WheatVariety'),
        (SELECT IFNULL(lotid,0) FROM `ngw_lot` WHERE lotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` 
        where VehicleArrivalId='" . $postData->vehicleArrivalId . "')),'$CurrentDateTime','$WbNetWt'
        )";
      //echo $UpdateWeeklyPlan;exit();
      mysqli_query($connect, $UpdateWeeklyPlan);


      $Qry = "SELECT * FROM `empty_vehicle_arrival` where ID='" . $postData->vehicleArrivalId . "'";
      $SelectE = mysqli_query($connect, $Qry);
      $FetchE = mysqli_fetch_assoc($SelectE);
      $ZVA_NUMBER = $FetchE['ZVA_NUMBER'];
      $PLANT_ID = $FetchE['PLANT_ID'];
      if ($postData->BagCuttingdet->BgType != "") {
        $Qry1 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
       `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
        `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,
         `approvestatus`) 
         VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0','" . $postData->BagCuttingdet->BgType . "',
         '" . $postData->BagCuttingdet->NoofBags . "','$SendingPlant','$SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
         '" . $postData->BagCuttingdet->BgCutingVendor . "', '" . $postData->BagCuttingdet->BgCutingCharges . "','1'
         )";
        // echo $Qry1;
        mysqli_query($connect, $Qry1);
      }
      if ($postData->BagCuttingdet->BgType2 != "") {
        $Qry2 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
       `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
        `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,
         `approvestatus`) 
         VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0','" . $postData->BagCuttingdet->BgType2 . "',
         '" . $postData->BagCuttingdet->NoofBags2 . "','$SendingPlant','$SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
         '" . $postData->BagCuttingdet->BgCutingVendor2 . "', '" . $postData->BagCuttingdet->BgCutingCharges2 . "','1'
         )";
        mysqli_query($connect, $Qry2);
      }
      if ($postData->BagCuttingdet->BgType3 != "") {
        $Qry3 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
       `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
        `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,
         `approvestatus`) 
         VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0','" . $postData->BagCuttingdet->BgType3 . "',
         '" . $postData->BagCuttingdet->NoofBags3 . "','$SendingPlant','$SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
         '" . $postData->BagCuttingdet->BgCutingVendor3 . "', '" . $postData->BagCuttingdet->BgCutingCharges3 . "','1'
         )";
        mysqli_query($connect, $Qry3);
      }
      // exit();
      //Update Bag type cutting-END

      //Update WB Weight 
      if ($postData->isSendingRedirected == 0) {
        $usql = "UPDATE wb_rm SET Status='1' WHERE VA_no IN(SELECT ZVA_NUMBER FROM `empty_vehicle_arrival` where  ID = " . $postData->vehicleArrivalId . ")";
        mysqli_query($connect, $usql);
      }

      $res = $model->updateInfo($id, $postData);
      if ($res)
        return  $this->respond(["success" => 1, "results" => $res]);
      else {
        return  $this->respond(["success" => 0]);
      }
    } else {
      return  $this->respond(["success" => 0, "error" => "Please provide id"]);
    }
  }


  public function getByArrivalId($id){
    $model = new IntraStateDispatchInfoModel();
    $res = $model->getByArrivalId($id);

    // var_dump($res);
    //FST ADDED START
    include_once APIPATH . "/db_connection.php";
    include_once APIPATH . "/helper/queryHelper.php";
    $ReceivingPlant = $res->pickSlipDetails->receivingPlant;
    $expReceivingPlant = explode("-", $ReceivingPlant);
    $ActReceivingPlant = $expReceivingPlant[0];

    $Qry = "SELECT ID FROM `wb_master` where Receving_plant='" . $ActReceivingPlant . "' and VA_number='" . $res->ZVA_NUMBER . "'";
    $WBSelect = mysqli_query($connect, $Qry);
    $WBFetch = mysqli_fetch_assoc($WBSelect);
    $WBID = $WBFetch['ID'];
    $Qry = "SELECT Ticket_no as label,Ticket_no as value,First_weight as First_Weight,
        Netweight as Net_Weight,Second_weight as Second_Weight FROM `wb_rm` where VA_no='" . $res->ZVA_NUMBER . "'";
    $TicketDetails = getResultAsObjectArray($connect, $Qry);

    $Qry = "SELECT Id as label,Id as value,FirstWeight as First_Weight,NetWeight as Net_Weight,
      SecondWeight as Second_Weight FROM `pp_silotomillweights` where VANumber='$res->ZVA_NUMBER'";
    $TicketDetails = getResultAsObjectArray($connect, $Qry);
    if (sizeof($TicketDetails) > 0) {
      $WBID = sizeof($TicketDetails);
    }

    $Qry = "SELECT Id as label,Id as value,FirstWeight as firstWeight,NetWeight as netWeight,
      SecondWeight as secondWeight FROM `pp_silotomillweights_unload` where VANumber='$res->ZVA_NUMBER'";
    $ReceivingTicketDetails = getResultAsObjectArray($connect, $Qry);
    if (sizeof($ReceivingTicketDetails) > 0) {
      $ReceivingWBID = sizeof($ReceivingTicketDetails);
    }


    $Qry = "SELECT BagType,BagType2,BagType3,no_bags,no_bags2,no_bags3,GunnyWt,GunnyLessNetWt,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType LIMIT 1) as bagTypeName,
         (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType2 LIMIT 1) as bagType2Name,
         (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType3 LIMIT 1) as bagType3Name
     FROM `intrastate_gateout_info` a
     where EmptyVehicleArrivalId='$id' and ReceivingArrivalId is not null";
    $RecGateOut = getResultAsObjectArray($connect, $Qry);

    $VehicleStatus = "SELECT VECHICAL_STATUS
     FROM `purchase_info`
     where EMPTY_VEHICLE_ARRIVAL_ID='$id'";
    $VehicleStatus = getResultAsObjectArray($connect, $VehicleStatus);

    //FST ADDED END
    return  $this->respond(["success" => 1, 
          "RecGateOut" => $RecGateOut, 
          "results" => $res, 
          "ReceivingTicketDetails" => $ReceivingTicketDetails, 
          "ReceivingWBID" => $ReceivingWBID, 
          "OwnWBID" => $WBID, 
          "TicketDetails" => $TicketDetails,
          "VehicleStatus" => $VehicleStatus[0]['VECHICAL_STATUS']]
        );
  }


  public function getDisptachedPickslipNoByUser(){
    $userId = session()->get("USERID");
    $model = new IntraStateDispatchInfoModel();
    $res = $model->getDisptachedPickslipNoByUser($userId);
    return  $this->respond(["success" => 1, "results" => $res]);
  }

  public function getDispatchedVehicleNoByUser(){
    //$userId = session()->get("USERID");
    $session = session();
    $userId=$_SESSION["USERID"];
    //echo "USER".$userId."TEST";
    $model = new IntraStateDispatchInfoModel();
    $res = $model->getDispatchedVehicleNoByUser($userId);
    return  $this->respond(["success" => 1, "results" => $res]);

  }

}
