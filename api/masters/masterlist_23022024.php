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
//echo "sdfasdfsadfasdfasdfsdfasdfsdf", $formType;
switch ($formType) {
        
  case "GetEadList":
    echo GetEadList($connect,$record);
    break;   
    case "Getmaster_baglist":
      echo GetMaster_baglist($connect,$record);
      break;          
    case "Getmaster_locationlist":
       // $List= Getmaster_locationlist($connect,$record);
        echo Getmaster_locationlist($connect,$record);
     break;    
     case "GetMaster_plantlist":
      echo GetMaster_plantlist($connect,$record);      
      break;    

      case "GetMaster_plantlist":
        echo GetMaster_plantlist($connect,$record);      
        break;    
      case "GetMaster_incolist":
        echo GetMaster_incolist($connect,$record);      
        break;      
      case "GetMaster_port_of_dischargelist":
        echo GetMaster_port_of_dischargelist($connect,$record);
        break;    
      case "GetMaster_port_of_loadinglist":
        echo GetMaster_port_of_loadinglist($connect,$record);
        break;    
      case "GetMaster_privilegelist":
        echo GetMaster_privilegelist($connect,$record);
        break;    
      case "GetMaster_quality_checklist":
        echo GetMaster_quality_checklist($connect,$record);
        break; 
      case "GetMaster_QC_WheatVariety":
        echo GetMaster_QC_WheatVariety($connect,$record);
        break;    

        
  case "GetMaster_quality_perferredlist":
  echo GetMaster_quality_perferredlist($connect,$record);
        break;    
  case "GetMaster_rolelist":
  echo GetMaster_rolelist($connect,$record);
        break;    
  case "GetMaster_screenlist":
  echo GetMaster_screenlist($connect,$record);
        break;    
  case "GetMaster_storagelist":
  echo GetMaster_storagelist($connect,$record);
        break;    
  case "GetMaster_to_locationlist":
  echo GetMaster_to_locationlist($connect,$record);
        break;    
  case "GetMaster_user_plantlist":
  echo GetMaster_user_plantlist($connect,$record);
        break;    
  case "GetMaster_user_privilegelist":
  echo GetMaster_user_privilegelist($connect,$record);
        break;    
  case "GetMaster_user_screenlist":
  echo GetMaster_user_screenlist($connect,$record);
        break;    
  case "GetMaster_vendorlist":
  echo GetMaster_vendorlist($connect,$record);
        break;    
  case "GetMaster_vessellist":
  echo GetMaster_vessellist($connect,$record);
        break;    
  case "GetMaster_wheat_varietylist":
  echo GetMaster_wheat_varietylist($connect,$record);
        break;    
  case "GetModule_masterlist":
  echo GetModule_masterlist($connect,$record);
        break;    
  case "GetUser_infolist":
  echo GetUser_infolist($connect,$record);
        break;    
  case "GetWarehouse_masterlist":
  echo GetWarehouse_masterlist($connect,$record);
        break;    
  case "GetUser_infostatuslist":
  echo GetUser_infostatuslist($connect,$record);
        break;  
  case "Get_Control_list":
  echo Get_Control_list($connect,$record);
        break; 
  case "Get_Control_list_IAS_STM":
  echo Get_Control_list_IAS_STM($connect,$record);
        break; 
          
  }
$connect->close();

function GetEadList($connect,$record){
  // echo "S1";
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(date like '%" . $record->searchTxt . "%'  
    or From_Location like '%" . $record->searchTxt . "%'
    or To_Location like '%" . $record->searchTxt . "%'
    or Mode_Of_Transport like '%" . $record->searchTxt . "%'
    or EAD like '%" . $record->searchTxt . "%'
    )");
  }
  // echo "S2";
  $fetchsql = "SELECT id, date, From_Location, To_Location, Mode_Of_Transport, EAD, InsBy, InsDt, ModBy, ModDt, RecStatus FROM ead 
  WHERE ". join(" AND ", $filters). "  ORDER BY id DESC";
 $record->startCount . ",".$record->pageSize;

//  echo $fetchsql;
  $tableRecords = getResultAsObjectArray1($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ead` WHERE ". join(" AND ", $filters). " "; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function GetMaster_baglist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(BAG_CODE like '%" . $record->searchTxt . "%'  
    or BAG_NAME like '%" . $record->searchTxt . "%'
    or UOM like '%" . $record->searchTxt . "%'
    or WEIGHT like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `BAG_REFID`, `BAG_CODE`, `BAG_NAME`, `UOM`, `WEIGHT`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, 
  `RecStatus` FROM master_bag WHERE  ". join(" AND ", $filters). "ORDER BY BAG_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_bag` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
function Getmaster_locationlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(city like '%" . $record->searchTxt . "%'  
    or state like '%" . $record->searchTxt . "%'
    or description like '%" . $record->searchTxt . "%'
    
    )");
  }
  $fetchsql = "SELECT `id`, `city`, `state`, `description`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` 
  FROM `master_from_location` WHERE  ". join(" AND ", $filters). " ORDER by id DESC ";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_from_location` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  //var_dump(["success" => 1, "results" => $tableRecords, "count" => $total]);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
//Plant Master
function GetMaster_plantlist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.WERKS like '%" . $record->searchTxt . "%'  
    or a.PLANT_NAME like '%" . $record->searchTxt . "%'
    or a.WH_CODE like '%" . $record->searchTxt . "%'
    or b.WH_NAME like '%" . $record->searchTxt . "%'
    or concat(a.`WH_CODE`,'-',b.`WH_NAME` ) like '%" . $record->searchTxt . "%'
   
    )");
  }
  $fetchsql = "SELECT a.`ID`, a.`WERKS`, a.`PLANT_NAME`, concat(a.`WH_CODE`,'-',b.`WH_NAME` )as WH_CODE, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_plant` a, warehouse_master b WHERE a.WH_CODE=b.WH_CODE and ". join(" AND ", $filters). "ORDER by a.ID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_plant` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
//INCO Master
function GetMaster_incolist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(INCO_TERMS like '%" . $record->searchTxt . "%'  
    or INCO_DESC like '%" . $record->searchTxt . "%'
   
   
    )");
  }
  $fetchsql = "SELECT `INCO_REFID`, `INCO_TERMS`, `INCO_DESC`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` 
   FROM `master_inco` WHERE ". join(" AND ", $filters). "ORDER by INCO_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_inco` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);

}

//warehouse_master GetWarehouse_masterlist

function GetWarehouse_masterlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(WH_REFID like '%" . $record->searchTxt . "%'  
    or WH_CODE like '%" . $record->searchTxt . "%'
    or WH_NAME like '%" . $record->searchTxt . "%'

    )");
  }
  $fetchsql = "SELECT `WH_REFID`, `WH_CODE`, `WH_NAME`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `warehouse_master` WHERE ". join(" AND ", $filters). "ORDER by WH_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `warehouse_master` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//user_info GetUser_infolist

function GetUser_infolist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.FIRST_NAME like '%" . $record->searchTxt . "%'  
    or a.LOGIN_ID like '%" . $record->searchTxt . "%'
    or a.SI_NO like '%" . $record->searchTxt . "%'
    or a.DESIGNATION like '%" . $record->searchTxt . "%'
    or a.DEPARTMENT like '%" . $record->searchTxt . "%'
    or a.CITY like '%" . $record->searchTxt . "%'
    or a.STATE like '%" . $record->searchTxt . "%'
    or a.USER_ROLE_ID like '%" . $record->searchTxt . "%'
    or a.USER_STATUS like '%" . $record->searchTxt . "%'
    or a.LoginStatus like '%" . $record->searchTxt . "%'
    or a.LoginTime like '%" . $record->searchTxt . "%'
    or a.LogoutTime like '%" . $record->searchTxt . "%'
    )");
  }
 
  $fetchsql = "SELECT a.`UI_ID`, a.`FIRST_NAME`, a.`LOGIN_ID`, a.`SI_NO`, a.`DESIGNATION`,c.ROLE_NAME, a.`DEPARTMENT`, a.`CITY`, a.`STATE`, a.`USER_ROLE_ID`, a.`USER_STATUS`,b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`,a.`LoginStatus`,a.`LoginTime`,a.`LogoutTime`
   FROM `user_info` a, master_role c, activestatus b WHERE c.RM_REFID=a.USER_ROLE_ID and b.ListGroup='G2' and a.USER_STATUS=b.id and ". join(" AND ", $filters). "ORDER by a.UI_ID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `user_info` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}


function GetUser_infostatuslist($connect,$record){
  $filters=array("a.USER_STATUS='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.FIRST_NAME like '%" . $record->searchTxt . "%'  
    or a.LOGIN_ID like '%" . $record->searchTxt . "%'
    or a.SI_NO like '%" . $record->searchTxt . "%'
    or a.DESIGNATION like '%" . $record->searchTxt . "%'
    or a.DEPARTMENT like '%" . $record->searchTxt . "%'
    or a.CITY like '%" . $record->searchTxt . "%'
    or a.STATE like '%" . $record->searchTxt . "%'
    or a.USER_ROLE_ID like '%" . $record->searchTxt . "%'
    or a.USER_STATUS like '%" . $record->searchTxt . "%'
    or a.LoginStatus like '%" . $record->searchTxt . "%'
    or a.LoginTime like '%" . $record->searchTxt . "%'
    or a.LogoutTime like '%" . $record->searchTxt . "%'
    )");
  }
 
  $fetchsql = "SELECT a.`UI_ID`, a.`FIRST_NAME`, a.`LOGIN_ID`, a.`SI_NO`, a.`DESIGNATION`,c.ROLE_NAME, a.`DEPARTMENT`, a.`CITY`, a.`STATE`, a.`USER_ROLE_ID`, a.`USER_STATUS`,b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`,a.`LoginStatus`,a.`LoginTime`,a.`LogoutTime`
   FROM `user_info` a, master_role c, activestatus b WHERE c.RM_REFID=a.USER_ROLE_ID and b.ListGroup='G2' and a.USER_STATUS=b.id and ". join(" AND ", $filters). "ORDER by a.UI_ID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `user_info` WHERE RecStatus='1'";
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//module_master GetModule_masterlist

function GetModule_masterlist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.MODULE_ID like '%" . $record->searchTxt . "%'  
    or a.SCREEN_NAME like '%" . $record->searchTxt . "%'


    )");
  }
  $fetchsql = "SELECT a.`MODULE_REFID`, a.`MODULE_ID`, a.`SCREEN_NAME`, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `module_master` a WHERE ". join(" AND ", $filters). "ORDER by a.MODULE_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `module_master` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_wheat_variety GetMaster_wheat_varietylist

function GetMaster_wheat_varietylist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(name like '%" . $record->searchTxt . "%'  



    )");
  }
  $fetchsql = "SELECT `id`, `name`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_wheat_variety` WHERE ". join(" AND ", $filters). "ORDER by id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_wheat_variety` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_vessel GetMaster_vessellist

function GetMaster_vessellist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.VESSEL_NAME like '%" . $record->searchTxt . "%'  
    or a.VESSES_STATUS like '%" . $record->searchTxt . "%'


    )");
  }
  $fetchsql = "SELECT a.`VESSEL_REFID`, a.`VESSEL_NAME`, a.`VESSES_STATUS`,b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_vessel` a, activestatus b WHERE b.ListGroup='G2' and a.VESSES_STATUS=b.id and ". join(" AND ", $filters). "ORDER by a.VESSEL_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_vessel` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_vendor GetMaster_vendorlist

function GetMaster_vendorlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(Code like '%" . $record->searchTxt . "%'  
    or Name like '%" . $record->searchTxt . "%'
    or Category like '%" . $record->searchTxt . "%'

    )");
  }
  $fetchsql = "SELECT `Id`, `Code`, `Name`, `Category`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_vendor` WHERE ". join(" AND ", $filters). "ORDER by Id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_vendor` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_user_screen GetMaster_user_screenlist

function GetMaster_user_screenlist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.USER_ID like '%" . $record->searchTxt . "%'  
    or a.SCREEN_ID like '%" . $record->searchTxt . "%'
    or c.LOGIN_ID like '%" . $record->searchTxt . "%'
    or d.SCREEN_NAME like '%" . $record->searchTxt . "%'


    )");
  }
 
  $fetchsql = "SELECT a.`ID`, a.`USER_ID`, a.`SCREEN_ID`, c.LOGIN_ID,  d.SCREEN_NAME,d.SCREEN_DESC, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_user_screen` a, user_info c, master_screen d WHERE a.SCREEN_ID = d.ID and a.USER_ID=c.UI_ID and ". join(" AND ", $filters). "ORDER by a.ID DESC";
  $record->startCount . ",".$record->pageSize;
 //echo $fetchsql;
 //exit();
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
 
  $countsql = "SELECT count(1) as total FROM `master_user_screen` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_user_privilege GetMaster_user_privilegelist

function GetMaster_user_privilegelist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.USER_ID like '%" . $record->searchTxt . "%'  
    or a.ID like '%" . $record->searchTxt . "%'
    or a.PRIVILEGE_ID like '%" . $record->searchTxt . "%'
    or e.label like '%" . $record->searchTxt . "%'
    or c.LOGIN_ID like '%" . $record->searchTxt . "%'
    or b.PRIVILEGE_NAME like '%" . $record->searchTxt . "%'
    or a.ACTIVE like '%" . $record->searchTxt . "%'

    )");
  }
  $fetchsql = "SELECT a.`ID`,a.`USER_ID`, a.`PRIVILEGE_ID`, a.`ACTIVE`, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, 
  a.`RecStatus`".
  ", c.LOGIN_ID, e.label ACTIVELABEL,  ".
   " b.PRIVILEGE_NAME FROM `master_user_privilege` a, master_privilege b, user_info c, activestatus e WHERE e.ListGroup = 'G1' and a.PRIVILEGE_ID = b.ID and a.ACTIVE=e.id and a.USER_ID=c.UI_ID and ". join(" AND ", $filters). "ORDER by a.ID DESC";
  $record->startCount . ",".$record->pageSize;
 // echo $fetchsql;exit();
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_user_privilege` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
//  return json_encode(["success" => 1, "results" => $fetchsql , "count" => $total]);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_user_plant GetMaster_user_plantlist

function GetMaster_user_plantlist($connect,$record){
  $filters=array("a.RecStatus >= '0'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.USER_ID like '%" . $record->searchTxt . "%'  
    or a.PLANT_ID like '%" . $record->searchTxt . "%'
    or b.PLANT_NAME like '%" . $record->searchTxt . "%'
    or b.WERKS like '%" . $record->searchTxt . "%'
    or c.LOGIN_ID like '%" . $record->searchTxt . "%'
    or concat(b.WERKS,'-', b.PLANT_NAME) like '%" . $record->searchTxt . "%'


    )");
  }
  $fetchsql = "SELECT a.`ID`, a.`USER_ID`, a.`PLANT_ID`,c.LOGIN_ID, concat(b.WERKS,'-', b.PLANT_NAME) PLANT_NAME,
   a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_user_plant` a, master_plant b, user_info c WHERE c.UI_ID=a.USER_ID and a.PLANT_ID=b.ID and ". join(" AND ", $filters). "ORDER by a.ID DESC";
  $record->startCount . ",".$record->pageSize;
 
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);

 // return json_encode(["success" => 1, "results" => $tableRecords]);
  // $countsql = "SELECT count(1) as total FROM `master_user_plant` WHERE RecStatus='1'"; 
  $countsql = "SELECT count(1) as total FROM `master_user_plant`"; 

  $total = getFieldValue($connect, $countsql,0);
  //echo $countsql;exit();
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_to_location GetMaster_to_locationlist

function GetMaster_to_locationlist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.location like '%" . $record->searchTxt . "%'  
    or a.plantId like '%" . $record->searchTxt . "%'
    or concat(a.plantId,'-', b.PLANT_NAME) like '%" . $record->searchTxt . "%'

    )");
  }
  $fetchsql = "SELECT a.`id`, a.`location`, a.`plantId`, concat(a.plantId,'-', b.PLANT_NAME) PLANT_NAME, a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, 
  a.`RecStatus` FROM `master_to_location` a, master_plant b WHERE a.plantId=b.WERKS and ". join(" AND ", $filters). "ORDER by a.id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_to_location` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_storage GetMaster_storagelist

function GetMaster_storagelist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(LGORT like '%" . $record->searchTxt . "%'  
    or STORAGE_LOCATION like '%" . $record->searchTxt . "%'


    )");
  }
  $fetchsql = "SELECT `STORAGE_REFID`, `LGORT`, `STORAGE_LOCATION`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_storage` WHERE ". join(" AND ", $filters). "ORDER by STORAGE_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_storage` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_screen GetMaster_screenlist

function GetMaster_screenlist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.SCREEN_NAME like '%" . $record->searchTxt . "%'  
    or a.SCREEN_DESC like '%" . $record->searchTxt . "%'
    or a.PRIORITY like '%" . $record->searchTxt . "%'
    or a.DISABLED like '%" . $record->searchTxt . "%'
    or b.label like '%" . $record->searchTxt . "%'
    
    )");
  }
  $fetchsql = "SELECT a.`ID`, a.`SCREEN_NAME`, a.`SCREEN_DESC`, a.`PRIORITY`, a.`DISABLED`, b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_screen` a, activestatus b WHERE b.ListGroup = 'G2' and a.DISABLED = b.id and ". join(" AND ", $filters). "ORDER by a.ID DESC";
  $record->startCount . ",".$record->pageSize;
 // echo $fetchsql;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_screen` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_role GetMaster_rolelist

function GetMaster_rolelist($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.ROLE_NAME like '%" . $record->searchTxt . "%'  
    or a.ROLE_STATUS like '%" . $record->searchTxt . "%'


    )");
  }
  $fetchsql = "SELECT a.`RM_REFID`, a.`ROLE_NAME`, a.`ROLE_STATUS`,b.label ACTIVELABEL,  a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus`
   FROM `master_role` a, activestatus b WHERE b.ListGroup='G1' and a.ROLE_STATUS=b.id and ". join(" AND ", $filters). "ORDER by a.RM_REFID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_role` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_quality_preferred GetMaster_quality_perferredlist

function GetMaster_quality_perferredlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(FieldMap like '%" . $record->searchTxt . "%'  
    or PreferredMin like '%" . $record->searchTxt . "%'
    or PreferredMax like '%" . $record->searchTxt . "%'
    or FieldOrder like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `Id`, `FieldMap`, `PreferredMin`, `PreferredMax`, `FieldOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_quality_preferred` WHERE ". join(" AND ", $filters). "ORDER by Id DESC";
  $record->startCount . ",".$record->pageSize;

  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_quality_preferred` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_quality_check GetMaster_quality_checklist

function GetMaster_quality_checklist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(MIC like '%" . $record->searchTxt . "%'  
    or MIC_DESC like '%" . $record->searchTxt . "%'
    or UOM like '%" . $record->searchTxt . "%'
    or MIN_VALUE like '%" . $record->searchTxt . "%'
    or MAX_VALUE like '%" . $record->searchTxt . "%'
    or nir_yes like '%" . $record->searchTxt . "%'
    or nir_no like '%" . $record->searchTxt . "%'
    or nir_foss like '%" . $record->searchTxt . "%'
    or surveyor like '%" . $record->searchTxt . "%'
    or IDNLF like '%" . $record->searchTxt . "%'
    or FIELD_MAP like '%" . $record->searchTxt . "%'
    or input_type like '%" . $record->searchTxt . "%'
    )");
  }
 $fetchsql = "SELECT `QCM_REFID`, `MIC`, `MIC_DESC`, `UOM`, `MIN_VALUE`, `MAX_VALUE`, `nir_yes`, `nir_no`, `nir_foss`, `surveyor`, `IDNLF`, `FIELD_MAP`, `input_type`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` 
 FROM `master_quality_check` WHERE ". join(" AND ", $filters). "ORDER by QCM_REFID DESC limit 50";

  $record->startCount . ",".$record->pageSize;

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_quality_check` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}


function GetMaster_QC_WheatVariety($connect,$record){
  $filters=array("1");
  if (isset($record->searchTxt)) {
    array_push($filters, "(WheatVariety like '%" . $record->searchTxt . "%')");
  }
/* $fetchsql = "SELECT `QCM_REFID`, `MIC`, `MIC_DESC`, `UOM`, `MIN_VALUE`, `MAX_VALUE`, `nir_yes`, `nir_no`, `nir_foss`, `surveyor`, `IDNLF`, `FIELD_MAP`, `input_type`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` 
 FROM `master_quality_check` WHERE ". join(" AND ", $filters). "ORDER by QCM_REFID DESC limit 50";
*/
$fetchsql = "SELECT WheatVariety,Id FROM `master_mrc_wheat_variety` where  ". join(" AND ", $filters). "";
//echo $fetchsql;
//exit();
  $record->startCount . ",".$record->pageSize;

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_mrc_wheat_variety`"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}


//GetMaster_privilegelist

function GetMaster_privilegelist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(PRIVILEGE_NAME like '%" . $record->searchTxt . "%'  
    or PRIVILEGE_DESC like '%" . $record->searchTxt . "%'

   
    )");
  }
  $fetchsql = "SELECT `ID`, `PRIVILEGE_NAME`, `PRIVILEGE_DESC`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_privilege` WHERE ". join(" AND ", $filters). "ORDER by ID DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_privilege` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//GetMaster_port_of_loadinglist
function GetMaster_port_of_loadinglist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(Name like '%" . $record->searchTxt . "%'  
    or Id like '%" . $record->searchTxt . "%'

   
    )");
  }
  $fetchsql = "SELECT `Id` ,  `Name`,  `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_port_of_loading` WHERE ". join(" AND ", $filters). "ORDER by Id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_port_of_loading` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//master_port_of_discharge GetMaster_port_of_dischargelist
function GetMaster_port_of_dischargelist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(Name like '%" . $record->searchTxt . "%'  
    or Id like '%" . $record->searchTxt . "%'

   
    )");
  }
  $fetchsql = "SELECT `Id` ,  `Name`,  `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `master_port_of_discharge` WHERE ". join(" AND ", $filters). "ORDER by Id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `master_port_of_discharge` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function Get_Control_list($connect,$record){
  
  $fetchsql = "SELECT a.`id`, a.`delivery_control_id`, a.`temp_extended_days`, a.`remarks`, a.`mobile_numbers`, a.`otp`, a.`status`, date_format(a.created_at,'%d-%m-%Y') as created_at ,a.`updated_at`
   FROM `delivery_control_panel` a ORDER by a.id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `delivery_control_panel`"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function Get_Control_list_IAS_STM($connect,$record){
  
  $fetchsql = "SELECT a.*
   FROM `ias_stm_control_panel` a ORDER by a.id DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ias_stm_control_panel`"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

?>
