<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";

$entityPO = json_decode(file_get_contents("php://input"));
if (isset($entityPO->type) && $entityPO->type === "UAOY") {
  echo fetchInterComPoList($connect, $entityPO);
} 
else if (isset($entityPO->type) && $entityPO->type === "SILOTOMILL") {
  echo fetchPOListSTM($connect, $entityPO);
}
else if (isset($entityPO->type) && $entityPO->type === "SILOTOMILLTRUCK") {
  echo fetchPOListSTMTruck($connect, $entityPO);
} else {
  echo fetchPOList($connect, $entityPO);
}
$connect->close();
function fetchPOListSTM($connect, $record)
{
  try {
     $fetchsql = "SELECT DISTINCT PONumber as label,PONumber as value FROM `pp_silotomillpoline` where flag = '0'";
    //echo $fetchsql;
    //exit();
     $posRecords = getResultAsObjectArray($connect, $fetchsql);
    

    return json_encode(["success" => 1, "poresults" => $posRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}

function fetchPOListSTMTruck($connect, $record)
{
   $fetchsql = "SELECT TRUCK_NO as label,TRUCK_NO as value FROM `empty_vehicle_arrival` 
   WHERE SCREEN_TYPE='SILOTOMILL' and VEHICLE_STATUS='15'";
  // echo $fetchsql;exit();
   $posRecords = getResultAsObjectArray($connect, $fetchsql);
   return json_encode(["success" => 1, "STMTruckList" => $posRecords]);
}
function fetchPOList($connect, $record)
{
  try {
    $filter = [];

    $plantFilter = [];
    $SDTPlantFilter = [];

    $poRecords = [];

    if (isset($record->plantIds)) {
      $plantIds = $record->plantIds;

      foreach ($plantIds as $plantid) {
        array_push($plantFilter, "WERKS = '" . $plantid . "'");
        array_push($SDTPlantFilter, "PLANT_ID = '" . $plantid . "'");      
      }

      if (count($plantFilter) > 0) {
        array_push($filter, "(" . join(" OR ", $plantFilter) . ")");
      }
    }

    $cond = [];

    $privieges = getPrivilegeByUser($connect, $_SESSION["USERID"]);

    if (array_key_exists("SDO", $privieges)) {
      array_push($cond, "INCO1 = 'OW1' OR INCO1 = 'OW2' OR INCO1 = 'OY1'");

      array_push($filter, "(" . join(" OR ", $cond) . ")");

      $fetchsql =
        "select DISTINCT EBELN as value, EBELN as label, 'SDO' as mkey, PURCHASE_ORG_DESC as vehicleType from sap_to_pp where " .
        join(" AND ", $filter) .
        " order by EBELN desc ";
      $sdoRecords = getResultAsObjectArray($connect, $fetchsql);
    //  $sdoRecords=array();

      $poRecords = array_merge($poRecords, $sdoRecords);
      //$poRecords=array()
    }

    if (array_key_exists("SDI", $privieges)) {
      $sdtplantFilterTxt = "";

      if (count($SDTPlantFilter) > 0) {
        $sdtplantFilterTxt = "(" . join(" OR ", $SDTPlantFilter) . ") AND ";
      }
      $fetchsql = "SELECT DISTINCT ZPO_NUMBER as value, ZPO_NUMBER as label, 'SDI' as mkey, VEHICLE_TYPE as vehicleType FROM supplier_dispatch_info WHERE EXISTS (SELECT SUPPLIER_ID FROM supplier_vehical_info  WHERE SUPPLIER_ID = SD_REFID AND $sdtplantFilterTxt VEHICLE_ARRIVED = 0)";
     //echo $fetchsql;
      $posRecords = getResultAsObjectArray($connect, $fetchsql);
      $poRecords = array_merge($poRecords, $posRecords);
    }

    return json_encode(["success" => 1, "poresults" => $poRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}
function fetchInterComPoList($connect, $record)
{
  try {
    $filter = [];
    $plantFilter = [];
    if (isset($record->plantIds)) {
      $plantIds = $record->plantIds;
      foreach ($plantIds as $plantid) {
        array_push($plantFilter, "WERKS = '" . $plantid . "'");
      }
      array_push($filter, "(" . join(" OR ", $plantFilter) . ")");
    }
    $fetchsql = "select DISTINCT PoNumber as value, PoNumber as label from interstate_sap_to_pp order by PoNumber desc ";

    $poRecords = getResultAsObjectArray($connect, $fetchsql);

    return json_encode(["success" => 1, "poresults" => $poRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}

?>
