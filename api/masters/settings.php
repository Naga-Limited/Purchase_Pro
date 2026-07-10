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
        
  case "GetLastSyncList":
    echo GetLastSyncList($connect,$record);
    break;   
             
  
  }
$connect->close();
function GetLastSyncList($connect,$record){
 
  $fetchsql = "SELECT `Id`, `Name` as Job, `UniqueName`, `Url`, `LastRunDate` as Date FROM `pp_lastsynclog` WHERE 1 Order BY Sort ASC";
 

 // echo $fetchsql;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 //exit();
  $total =8;
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
function GetLastSyncList_OLD($connect,$record){
 
  $fetchsql = "SELECT 'Get IRS' as Job,date_format(`get_irs_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'Get SDI PO' as Job,date_format(`get_sdi_po_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'Get WB' as Job,date_format(`get_wb_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'IAS REPORT' as Job,date_format(`ias_report_vehicle_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'MIGO RES' as Job,date_format(`migo_res_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'MIGO UPDATE' as Job,date_format(`migo_update_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'PICKSLIP DETAILS' as Job,date_format(`pickslip_details_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1 UNION ALL
  SELECT 'PP to SAP' as Job,date_format(`pp_to_sap_LastSyncDate`,'%d-%m-%Y %h:%i %p') as Date FROM `pp_setting` WHERE 1";
 

 // echo $fetchsql;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 //exit();
  $total =8;
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

?>
