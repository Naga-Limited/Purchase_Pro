<?php

use App\Helpers\StatusConstant;

include_once APIPATH. "/helper/sessionHelper.php";
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set("Asia/Calcutta");
$record = json_decode(file_get_contents("php://input"));
$formType = isset($_GET["formType"])?$_GET["formType"]:"" ;

if(isset($record->formType)){
  $formType=$record->formType;
}
switch ($formType) {
        
  case "GetBagCuttingList":
    echo GetMaster_ngw_state_districtlist($connect,$record);
    break;   
  }
$connect->close();
function GetMaster_ngw_state_districtlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(districtname like '%" . $record->searchTxt . "%'  
    or id like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `id`,  `statename`, `districtname`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_state_district` WHERE ". join(" AND ", $filters). "ORDER by id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_state_district` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

?>
