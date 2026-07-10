<?php

use App\Helpers\StatusConstant;

include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
include_once APIPATH."/helper/queryHelper.php";

$entityVAContent = json_decode(file_get_contents("php://input"));
date_default_timezone_set("Asia/Calcutta");

if ($entityVAContent->formType === "A") {
  echo addTruckArrival($connect, $entityVAContent, $loggedUserName);
} elseif ($entityVAContent->formType === "U") {
  echo updateTruckStatus($connect, $entityVAContent);
} elseif ($entityVAContent->formType === "PO") {
  echo fetchWVBroker($connect, $entityVAContent);
} elseif ($entityVAContent->formType === "SLIPGENERATION") {
  echo SlipGenerationDet($connect, $entityVAContent);
}elseif ($entityVAContent->formType === "Completed") {
  echo fetchAllTruckCompleted($connect, $entityVAContent);
} elseif ($entityVAContent->formType === "Process") {
  echo fetchAllTruckProcess($connect, $entityVAContent);
}else {
  echo fetchAllTruckArrival($connect, $entityVAContent);
}

$connect->close();

function updateTruckStatus($connect, $record)
{
  $status = mysqli_real_escape_string($connect,  trim($record->VEHICLE_STATUS));
  $id = mysqli_real_escape_string($connect, trim($record->ID));
  $todayDt = date("Y-m-d H:i:s");
 
  //echo $status; exit();
 // $inTrans = $status == StatusConstant::$INTRANSIT || StatusConstant::$PICKSLIP;
  $inTrans = ($status == StatusConstant::$INTRANSIT) || ($status == StatusConstant::$PICKSLIP);
  

  //echo "INTRANSIT :",$inTrans, " PICKSLIP:,$status"; exit();

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");

  $isOwnWB=CheckisOwnWBFromEMPTYVA($connect,$record->ID);
  //echo $ScreenType;
  //echo "status:".$status."<br>";
  if($isOwnWB == 1 && $status==13){
      $status=23;
  }
  //echo "status:".$status."<br>";
  //exit();

  $usql = "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS =" . $status . ", GAT_IN_TM = '" . $todayDt . "',GateInDt='$CurrentDateTime',GateInByName='$SessionUserName', GateInBy='$SessionUser' WHERE ID = " . $id;
  
  if($inTrans){    
    $usql = "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS =" . $status . ", GATE_OUT_TM = '" . $todayDt . "',GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser' WHERE ID = " . $id;
  }
  
  $UpdateWeeklyPlan="INSERT INTO `ngw_weeklyplan_actual`( `VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`, 
  `WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
  VALUES (
    (SELECT IFNULL(ZVA_NUMBER,0) FROM `empty_vehicle_arrival` a where a.ID='" . $id."' limit 1),
    (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b, empty_vehicle_arrival c where a.WH_CODE=b.wh_code and a.WERKS= c.PLANT_ID and c.ID='$id'),
    (SELECT IFNULL(a.ID,0) FROM `master_plant` a, empty_vehicle_arrival b where a.werks=b.PLANT_ID AND b.ID='$id'),
    (SELECT IFNULL(a.STORAGE_REFID,0) FROM `master_storage` a  where a.plantid = (SELECT IFNULL(a.ID,0) FROM master_plant a, empty_vehicle_arrival b where a.werks=b.PLANT_ID AND b.ID='$id')LIMIT 1),
    (SELECT IFNULL(Id,0)  FROM `master_mrc_wheat_variety` where Id = (SELECT IFNULL(wheatvarietyid,0) FROM `ngw_sublot` where lotid =
    (SELECT IFNULL(lotid,0) FROM `ngw_lot` WHERE lotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` 
    where VehicleArrivalId='$id')LIMIT 1)LIMIT 1)),
    (SELECT IFNULL(lotid,0) FROM `ngw_lot` WHERE lotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` where VehicleArrivalId='$id')LIMIT 1), 
    '$CurrentDateTime',
    (SELECT IFNULL(NetWeight,0) FROM pp_silotomillweights where VANumber = (SELECT IFNULL(ZVA_NUMBER,0) FROM `empty_vehicle_arrival` a where a.ID='" . $id."' limit 1)))";

  if (mysqli_query($connect, $usql) == true && mysqli_query($connect, $UpdateWeeklyPlan) == true) { // Added the UpdateWeeklyPlan condition on 09-06-2022
    return json_encode(["success" => 1]);
  } else {
    return json_encode(["success" => 0]);
  }
}

//////////////////////

function getFieldList($screenType,$isTruck)
{
 $common = ["DRIVER_NO", "SCREEN_TYPE", "VEHICLE_STATUS", "PLANT_ID"];
  if ($screenType == "EVAOY") {
    $fields = array_merge($common,[
      "TRAILER_NO",
      "CONTAINER_NO",
      "CONTAINER_TYPE",
      "WB_NAME",
      "WB_SERIAL_NO",
      "WB_EMPTY_WT",
    ]);
  } elseif ($screenType == "EVAWH") {
    $fields = array_merge($common,[
      "TRUCK_NO",
      "WB_TICKET_NO",
      "WB_NAME",
      "WB_CHARGES",
      "WB_EMPTY_WT"
    ]);
  }
  else{
    if($isTruck){
      return array_merge($common, ["TRUCK_NO"]);
    }
    else{
      return array_merge($common, ["TRAILER_NO"]);
    }
  }
  return $fields;
}
function addTruckArrival($connect, $record,$loggedUserName)
{
  //var_dump($record);exit();
  $screenType = $record->SCREEN_TYPE;
  $isTruck = false;
  $filter = ["SCREEN_TYPE='$screenType'"];
  if($screenType==="EVAWH" || $screenType==="EVAOY"){
    array_push($filter,"CONTAINER_NO='$record->CONTAINER_NO'","TRAILER_NO='$record->TRAILER_NO'");
  }
  else if($screenType==="EVADP"){
    if(isset($record->isTruck) && $record->isTruck){
      $isTruck  = true;
      array_push($filter,"TRUCK_NO='$record->TRUCK_NO'");
    }
    else{
      array_push($filter,"TRAILER_NO='$record->TRAILER_NO'");
    }
  }
  $sql = "select TRAILER_NO from empty_vehicle_arrival where ".join(" and ", $filter);
  // echo  $sql ;
  $res=  getResultAsObjectArray($connect,  $sql);

  $sql1 = "
    SELECT g.vehicleNo,
           g.masterPlantId,
           m.PLANT_NAME,
           m.WERKS
    FROM gate_in_out_info g
    INNER JOIN master_plant m 
           ON g.masterPlantId = m.ID
    WHERE g.vehicleNo = '$record->TRUCK_NO'
      AND g.moduleStatusId IN (0,1,2,3,4)
";
$res1 = getResultAsObjectArray($connect, $sql1);

  if(count($res)>0){
    return json_encode(["success" => 0, "error"=>"Vehicle already in"]);
  }

  if (!empty($res1[0]['WERKS'])) {

            $message = 'VehicleAlready in - ' . 
                       $res1[0]['PLANT_NAME'] . 
                       ' (' . $res1[0]['WERKS'] . ')';
    return  json_encode(["success" => 0, "error"=> $message]);
  }

  $values = [];
  $fields = getFieldList($record->SCREEN_TYPE,$isTruck);
  foreach ($fields as $field) {
    array_push($values, $record->{$field});
  }  
  array_push($fields, "AddedBy");
  array_push($values, $loggedUserName);

  $sql = "INSERT INTO empty_vehicle_arrival(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  if (insertData($connect, $sql) > 0) {
    return json_encode(["success" => 1]);
  } else {
    return json_encode(["success" => 0]);
  }
}

function fetchAllTruckArrival($connect, $record){ 
  
  //var_dump($record); exit();
  $screenType = mysqli_real_escape_string($connect, $record->SCREEN_TYPE);
  $ScreenName=$record->ScreenName;

  if (!empty($record->plantIds)){
    $conditions = count($record->plantIds) <= 0 ? [] : ["PLANT_ID in ('" . join("','", $record->plantIds) . "')"];
  }else{
    $conditions =[];
  }

  if(isset($record->status) && $record->status){
     array_push($conditions, "VEHICLE_STATUS IN ($record->status)");
  }
  $st = "";
  
  if (isset($record->searchTxt)) {
    $st = "'%" . mysqli_real_escape_string($connect, trim($record->searchTxt)) . "%'";
    if ($screenType == "EVAOY" || $screenType == "SILOTOMILL") {
      
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    } elseif ($screenType == "EVADP") {
      array_push($conditions, "(ZVA_NUMBER like " .
      $st .
      " or TRAILER_NO like " . $st . "   or TRUCK_NO like " .$st ." or DRIVER_NO like " . $st . " or PLANT_ID like " . $st . ")");
    } elseif ($screenType == "EVAWH") {
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st." 
          or TRUCK_NO like ".$st." 
          or DRIVER_NO like ".$st." 
          or WB_TICKET_NO like ".$st." 
          or WB_NAME like ".$st." 
          or PLANT_ID like ".$st.")"
      );
    }else{
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    }
  }
  
  //array_push($conditions, "SCREEN_TYPE='$screenType'");
  if($screenType==="EVADP"){
    if(isset($record->VStausChange)){
      if($record->VStausChange=="IAS"){
        array_push($conditions, "(SCREEN_TYPE='EVADP')");
      }else{
        array_push($conditions, "(SCREEN_TYPE='".$record->VStausChange."')");
      }
      
    }else{
      array_push($conditions, "(SCREEN_TYPE='$screenType' OR SCREEN_TYPE='SILOTOMILL')");

      //Added by Arularasu 31-07-2022 for Delivery No Skip Flag
//       array_push($conditions, "(CASE WHEN SCREEN_TYPE = 'EVADP'and VEHICLE_STATUS = 5 AND (SELECT ias_DeliveryNo_Bypass_Flag FROM pp_setting limit 1) = 'NO' THEN 
//       (SELECT EwayBillNo FROM intrastate_warhouse_dispatch_info WHERE VehicleArrivalId = empty_vehicle_arrival.id limit 1) != ''
//  ELSE 1 END) ");
    }
    
  }
  if($screenType==="EVAOY"){
    array_push($conditions, "(SCREEN_TYPE='$screenType')");
  }
  
  
  if($screenType==="EVADP" && isset($record->isTruck) ){
    if($record->isTruck){
      array_push($conditions, "(TRUCK_NO<>'' or TRUCK_NO is not null)");
    }
    else{
      array_push($conditions, "(TRAILER_NO<>'' or TRAILER_NO is not null)");
    }
  }

  if(isset($record->otherfilter)){
    $PlantId="";
    $FromDt=$record->otherfilter->from;
    $ToDt=$record->otherfilter->to;
   //  $PlantId=$record->otherfilter->otherfilter->PlantId;
   // echo $FromDt;
   if($FromDt!="" && $ToDt!=""){
    array_push($conditions,"DATE(DateAdded) >= '".$FromDt."'");
    array_push($conditions,"DATE(DateAdded) <= '".$ToDt."'");
   }
    if($PlantId!=""){
    array_push($conditions,"PLANT_ID = '".$PlantId."'");
    }
    //var_dump($filter);

    if($record->otherfilter->PlantIdArr!=null && sizeof($record->otherfilter->PlantIdArr)>0){
      $PlantIdArray=$record->otherfilter->PlantIdArr;
     
     $PlantIdArrFilter=" (";
     for($i=0;$i<sizeof($PlantIdArray);$i++){
        $PlantIdArrFilter.=" PLANT_ID = '".$PlantIdArray[$i]->value."' OR ";
     }
 
     $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
    
     $PlantIdArrFilter.=")";
     //var_dump($conditions);
    // var_dump($PlantIdArrFilter);
    
     array_push($conditions,$PlantIdArrFilter);
    
    }
 
  }
 
  if($record->ID){
    array_push($conditions,"ID = '".$record->ID."'");
  }
  
  array_push($conditions,"recstatus = '1'");//Changed from where condition to array push

  $countsql = "select count(ID) as total from empty_vehicle_arrival where ".join(" and ", $conditions);
  //$total = getFieldValue($connect, $countsql, 0);

  $countData = mysqli_query($connect, $countsql);
  $total = $countData->num_rows;

  //echo $total; exit();
  $pageSize =50;
  if(isset($record->pageSize)){
    $pageSize =$record->pageSize;
  }
 
  $fetchsql ="SELECT a.*,'$ScreenName' AS ScreenName,StatusName,
              CONCAT(
                  TIMESTAMPDIFF(DAY, DateAdded, NOW()), ' Days ',
                  TIMESTAMPDIFF(HOUR, DateAdded, NOW()) % 24, ' Hrs ',
                  TIMESTAMPDIFF(MINUTE, DateAdded, NOW()) % 60, ' Mins'
              ) AS OverallDuration,CONCAT(
                TIMESTAMPDIFF(DAY, DateModified, NOW()), ' Days ',
                TIMESTAMPDIFF(HOUR, DateModified, NOW()) % 24, ' Hrs ',
                TIMESTAMPDIFF(MINUTE, DateModified, NOW()) % 60, ' Mins'
              ) AS ScreenDuration
              FROM empty_vehicle_arrival a
              LEFT JOIN  pp_status d ON a.VEHICLE_STATUS=d.Id 
              WHERE ". join(" and ", $conditions) . " ORDER BY ID desc limit " . $record->startCount . ",$pageSize";


  // var_dump($fetchsql );
  // echo  $fetchsql; exit();

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  
  //var_dump($tableRecords); exit();

  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function fetchAllTruckCompleted($connect, $record){ 
  
  //var_dump($record); exit();
  $screenType = mysqli_real_escape_string($connect, $record->SCREEN_TYPE);
  $ScreenName=$record->ScreenName;

  if (!empty($record->plantIds)){
    $conditions = count($record->plantIds) <= 0 ? [] : ["PLANT_ID in ('" . join("','", $record->plantIds) . "')"];
  }else{
    $conditions =[];
  }

  
  if(isset($record->status) && $record->status){
     array_push($conditions, "VEHICLE_STATUS IN ($record->status)");
  }
  $st = "";
  
  if (isset($record->searchTxt)) {
    $st = "'%" . mysqli_real_escape_string($connect, trim($record->searchTxt)) . "%'";
    if ($screenType == "EVAOY" || $screenType == "SILOTOMILL") {
      
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    } elseif ($screenType == "EVADP") {
      array_push($conditions, "(ZVA_NUMBER like " .
      $st .
      " or TRAILER_NO like " . $st . "   or TRUCK_NO like " .$st ." or DRIVER_NO like " . $st . " or PLANT_ID like " . $st . ")");
    } elseif ($screenType == "EVAWH") {
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st." 
          or TRUCK_NO like ".$st." 
          or DRIVER_NO like ".$st." 
          or WB_TICKET_NO like ".$st." 
          or WB_NAME like ".$st." 
          or PLANT_ID like ".$st.")"
      );
    }else{
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    }
  }
  
  //array_push($conditions, "SCREEN_TYPE='$screenType'");
  if($screenType==="EVADP"){
    if(isset($record->VStausChange)){
      if($record->VStausChange=="IAS"){
        array_push($conditions, "(SCREEN_TYPE='EVADP')");
      }else{
        array_push($conditions, "(SCREEN_TYPE='".$record->VStausChange."')");
      }
      
    }else{
      array_push($conditions, "(SCREEN_TYPE='$screenType' OR SCREEN_TYPE='SILOTOMILL')");

      //Added by Arularasu 31-07-2022 for Delivery No Skip Flag
//       array_push($conditions, "(CASE WHEN SCREEN_TYPE = 'EVADP'and VEHICLE_STATUS = 5 AND (SELECT ias_DeliveryNo_Bypass_Flag FROM pp_setting limit 1) = 'NO' THEN 
//       (SELECT EwayBillNo FROM intrastate_warhouse_dispatch_info WHERE VehicleArrivalId = empty_vehicle_arrival.id limit 1) != ''
//  ELSE 1 END) ");
    }
    
  }
  if($screenType==="EVAOY"){
    array_push($conditions, "(SCREEN_TYPE='$screenType')");
  }
  
  
  if($screenType==="EVADP" && isset($record->isTruck) ){
    if($record->isTruck){
      array_push($conditions, "(TRUCK_NO<>'' or TRUCK_NO is not null)");
    }
    else{
      array_push($conditions, "(TRAILER_NO<>'' or TRAILER_NO is not null)");
    }
  }

  if(isset($record->otherfilter)){
    // print_r('adsad');exit();
    $PlantId="";
    $FromDt=$record->otherfilter->from;
    $ToDt=$record->otherfilter->to;
   //  $PlantId=$record->otherfilter->otherfilter->PlantId;
   // echo $FromDt;
   if($FromDt!="" && $ToDt!=""){
    array_push($conditions,"DATE(DateAdded) >= '".$FromDt."'");
    array_push($conditions,"DATE(DateAdded) <= '".$ToDt."'");
   }else{
    array_push($conditions,"DateAdded >= curdate()
    AND DateAdded < curdate() + INTERVAL '1' DAY");
   }
    if($PlantId!=""){
    array_push($conditions,"PLANT_ID = '".$PlantId."'");
    }
    //var_dump($filter);

    if($record->otherfilter->PlantIdArr!=null && sizeof($record->otherfilter->PlantIdArr)>0){
      $PlantIdArray=$record->otherfilter->PlantIdArr;
     
     $PlantIdArrFilter=" (";
     for($i=0;$i<sizeof($PlantIdArray);$i++){
        $PlantIdArrFilter.=" PLANT_ID = '".$PlantIdArray[$i]->value."' OR ";
     }
 
     $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
    
     $PlantIdArrFilter.=")";
     //var_dump($conditions);
    // var_dump($PlantIdArrFilter);
    
     array_push($conditions,$PlantIdArrFilter);
    
    }
 
  }
 
  if($record->ID){
    array_push($conditions,"ID = '".$record->ID."'");
  }
  
  array_push($conditions,"recstatus = '1'");//Changed from where condition to array push

  $countsql = "select count(ID) as total from empty_vehicle_arrival where ".join(" and ", $conditions);
  //$total = getFieldValue($connect, $countsql, 0);

  $countData = mysqli_query($connect, $countsql);
  $total = $countData->num_rows;

  //echo $total; exit();
  $pageSize =50;
  if(isset($record->pageSize)){
    $pageSize =$record->pageSize;
  }
 
  $fetchsql ="SELECT *,'$ScreenName' AS ScreenName FROM empty_vehicle_arrival 
              WHERE ". join(" and ", $conditions) . " ORDER BY ID desc limit " . $record->startCount . ",$pageSize";


  // var_dump($fetchsql );
  // echo  $fetchsql; exit();

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  
  //var_dump($tableRecords); exit();

  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function fetchAllTruckProcess($connect, $record){ 
  
  //var_dump($record); exit();
  $screenType = mysqli_real_escape_string($connect, $record->SCREEN_TYPE);
  $ScreenName=$record->ScreenName;

  if (!empty($record->plantIds)){
    $conditions = count($record->plantIds) <= 0 ? [] : ["PLANT_ID in ('" . join("','", $record->plantIds) . "')"];
  }else{
    $conditions =[];
  }

  
  if(isset($record->status) && $record->status){
     array_push($conditions, "VEHICLE_STATUS IN ($record->status) AND VEHICLE_STATUS NOT IN (11,12)");
  }
  $st = "";
  
  if (isset($record->searchTxt)) {
    $st = "'%" . mysqli_real_escape_string($connect, trim($record->searchTxt)) . "%'";
    if ($screenType == "EVAOY" || $screenType == "SILOTOMILL") {
      
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    } elseif ($screenType == "EVADP") {
      array_push($conditions, "(ZVA_NUMBER like " .
      $st .
      " or TRAILER_NO like " . $st . "   or TRUCK_NO like " .$st ." or DRIVER_NO like " . $st . " or PLANT_ID like " . $st . ")");
    } elseif ($screenType == "EVAWH") {
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st." 
          or TRUCK_NO like ".$st." 
          or DRIVER_NO like ".$st." 
          or WB_TICKET_NO like ".$st." 
          or WB_NAME like ".$st." 
          or PLANT_ID like ".$st.")"
      );
    }else{
      array_push(
        $conditions,
        "(ZVA_NUMBER like ".$st."
         or TRAILER_NO like ".$st." 
         or TRUCK_NO like ".$st." 
         or CONTAINER_NO like ".$st." 
         or DRIVER_NO like ".$st." 
         or WB_NAME like ".$st." 
         or PLANT_ID like ".$st.")"
      );
    }
  }
  
  //array_push($conditions, "SCREEN_TYPE='$screenType'");
  if($screenType==="EVADP"){
    if(isset($record->VStausChange)){
      if($record->VStausChange=="IAS"){
        array_push($conditions, "(SCREEN_TYPE='EVADP')");
      }else{
        array_push($conditions, "(SCREEN_TYPE='".$record->VStausChange."')");
      }
      
    }else{
      array_push($conditions, "(SCREEN_TYPE='$screenType' OR SCREEN_TYPE='SILOTOMILL')");

      //Added by Arularasu 31-07-2022 for Delivery No Skip Flag
//       array_push($conditions, "(CASE WHEN SCREEN_TYPE = 'EVADP'and VEHICLE_STATUS = 5 AND (SELECT ias_DeliveryNo_Bypass_Flag FROM pp_setting limit 1) = 'NO' THEN 
//       (SELECT EwayBillNo FROM intrastate_warhouse_dispatch_info WHERE VehicleArrivalId = empty_vehicle_arrival.id limit 1) != ''
//  ELSE 1 END) ");
    }
    
  }
  if($screenType==="EVAOY"){
    array_push($conditions, "(SCREEN_TYPE='$screenType')");
  }
  
  
  if($screenType==="EVADP" && isset($record->isTruck) ){
    if($record->isTruck){
      array_push($conditions, "(TRUCK_NO<>'' or TRUCK_NO is not null)");
    }
    else{
      array_push($conditions, "(TRAILER_NO<>'' or TRAILER_NO is not null)");
    }
  }

  if(isset($record->otherfilter)){
    // print_r('adsad');exit();
    $PlantId="";
    $FromDt=$record->otherfilter->from;
    $ToDt=$record->otherfilter->to;
   //  $PlantId=$record->otherfilter->otherfilter->PlantId;
   // echo $FromDt;
   if($FromDt!="" && $ToDt!=""){
    array_push($conditions,"DATE(DateAdded) >= '".$FromDt."'");
    array_push($conditions,"DATE(DateAdded) <= '".$ToDt."'");
   }
    if($PlantId!=""){
    array_push($conditions,"PLANT_ID = '".$PlantId."'");
    }
    //var_dump($filter);

    if($record->otherfilter->PlantIdArr!=null && sizeof($record->otherfilter->PlantIdArr)>0){
      $PlantIdArray=$record->otherfilter->PlantIdArr;
     
     $PlantIdArrFilter=" (";
     for($i=0;$i<sizeof($PlantIdArray);$i++){
        $PlantIdArrFilter.=" PLANT_ID = '".$PlantIdArray[$i]->value."' OR ";
     }
 
     $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
    
     $PlantIdArrFilter.=")";
     //var_dump($conditions);
    // var_dump($PlantIdArrFilter);
    
     array_push($conditions,$PlantIdArrFilter);
    
    }
 
  }
 
  if($record->ID){
    array_push($conditions,"ID = '".$record->ID."'");
  }
  
  array_push($conditions,"recstatus = '1'");//Changed from where condition to array push

  $countsql = "select count(ID) as total from empty_vehicle_arrival where ".join(" and ", $conditions);
  //$total = getFieldValue($connect, $countsql, 0);

  $countData = mysqli_query($connect, $countsql);
  $total = $countData->num_rows;

  //echo $total; exit();
  $pageSize =50;
  if(isset($record->pageSize)){
    $pageSize =$record->pageSize;
  }
 
  $fetchsql ="SELECT *,'$ScreenName' AS ScreenName FROM empty_vehicle_arrival 
              WHERE ". join(" and ", $conditions) . " ORDER BY ID desc limit " . $record->startCount . ",$pageSize";


  // var_dump($fetchsql );
  // echo  $fetchsql; exit();

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  
  //var_dump($tableRecords); exit();

  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function SlipGenerationDet($connect, $record)
{
  $screenType = mysqli_real_escape_string($connect, $record->SCREEN_TYPE);
  $ScreenName=$record->ScreenName;

  $conditions = count($record->plantIds)<=0? []: ["PLANT_ID in ('" . join("','", $record->plantIds) . "')"];
   
  if(isset($record->status) && $record->status){
     array_push($conditions, "VEHICLE_STATUS IN ($record->status)");
  }
  $st = "";
  
  if (isset($record->searchTxt)) {
    $st = "'%" . mysqli_real_escape_string($connect, trim($record->searchTxt)) . "%'";
    if ($screenType == "EVAOY") {
      
      array_push(
        $conditions,
        "(ZVA_NUMBER like " . $st ."
         or TRAILER_NO like " .$st ." 
         or TRUCK_NO like " .$st ." 
         or CONTAINER_NO like " .
          $st .
          " or DRIVER_NO like " .
          $st .
          " or WB_NAME like " .
          $st .
          " or PLANT_ID like " .
          $st .
          ")"
      );
    } elseif ($screenType == "EVADP") {
      array_push($conditions, "(ZVA_NUMBER like " .
      $st .
      " or TRAILER_NO like " . $st . "   or TRUCK_NO like " .$st ." or DRIVER_NO like " . $st . " or PLANT_ID like " . $st . ")");
    } elseif ($screenType == "EVAWH") {
      array_push(
        $conditions,
        "(ZVA_NUMBER like " .
        $st .
        " or TRUCK_NO like " .
          $st .
          " or DRIVER_NO like " .
          $st .
          " or WB_TICKET_NO like " .
          $st .
          " or WB_NAME like " .
          $st .
          " or PLANT_ID like " .
          $st .
          ")"
      );
    }
  }
  
  array_push($conditions, "SCREEN_TYPE='$screenType'");
  
  if($screenType==="EVADP" && isset($record->isTruck) ){
    if($record->isTruck){
      array_push($conditions, "(TRUCK_NO<>'' or TRUCK_NO is not null)");
    }
    else{
      array_push($conditions, "(TRAILER_NO<>'' or TRAILER_NO is not null)");
    }
  }

  if(isset($record->otherfilter)){
    $FromDt=$record->otherfilter->otherfilter->from;
    $ToDt=$record->otherfilter->otherfilter->to;
    $PlantId=$record->otherfilter->otherfilter->PlantId;
    // echo $FromDt;
    array_push($conditions,"DATE(DateAdded) >= '".$FromDt."'");
    array_push($conditions,"DATE(DateAdded) <= '".$ToDt."'");
    if($PlantId!=""){
    array_push($conditions,"PLANT_ID = '".$PlantId."'");
    }
    //var_dump($filter);
  }
  
  if($record->ID){
    array_push($conditions,"ID = '".$record->ID."'");
  }
  
  $countsql = "select count(ID) as total from empty_vehicle_arrival where ".join(" and ", $conditions);
  // echo $countsql;

  $total = getFieldValue($connect, $countsql, 0);

  $pageSize =50;
  if(isset($record->pageSize)){
    $pageSize =$record->pageSize;
  }

  $fetchsql = "select *,
              '$ScreenName' as ScreenName,
              date_format(DateAdded,'%d-%m-%Y %h:%i %p') as VADate,
              date_format(GateInDt,'%d-%m-%Y %H:%i') as GateInDateTime,
              date_format(DateModified,'%d-%m-%Y %H:%i') as dispPrintedOn,
              if(TRAILER_NO!='',date_format(UpdateLotDt,'%d-%m-%Y %H:%i'),date_format(GateOutDt,'%d-%m-%Y %H:%i')) as GateOutDateTime,
              if(TRAILER_NO!='',date_format(UpdateLotDt,'%d-%m-%Y %h:%i %p'),date_format(PODt,'%d-%m-%Y %h:%i %p')) as PickslipDateTime
              from empty_vehicle_arrival where ". join(" and ", $conditions) . " order by ID desc limit " . $record->startCount . ",$pageSize";
  //echo $fetchsql;exit();
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);

  
  // PICK SLIP Details
  $fetchsql ="SELECT *, if(IsTruck=1,'Truck','') as Transporter FROM `intrastate_warhouse_dispatch_info` where VehicleArrivalId='".$record->ID."'";
 //echo $fetchsql;exit();
  $intra_state_warehouse_dispatch_info = getResultAsObjectArray($connect, $fetchsql);
 // var_dump($intra_state_warehouse_dispatch_info);
  $PickslipNo=$intra_state_warehouse_dispatch_info[0]['PickslipNo'];
  $Po_No=$intra_state_warehouse_dispatch_info[0]['StoPoNo'];

  if($intra_state_warehouse_dispatch_info[0]['IsTruck']=="1")//Mohan Added 08092022 for truck for others else part
  {
  $fetchsql ="SELECT a.*,
            (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType limit 1) as BagTypeName,
            (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType2 limit 1) as BagTypeName2,
            (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType3 limit 1) as BagTypeName3,
            b.PLANT_NAME as SendingPlantName,c.STORAGE_LOCATION as SendingStorageLocationName,
            d.PLANT_NAME as ReceivingPlantName,e.STORAGE_LOCATION as ReceivingStorageLocationName
            FROM `intrastate_sap_to_pp` a 
            LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
            LEFT JOIN master_storage c ON a.SendingStorageLocation=c.LGORT
            LEFT JOIN master_plant d ON a.ReceivingPlant=d.WERKS
            LEFT JOIN master_storage e ON a.ReceivingStorageLoc=e.LGORT
            where PoNumber='$Po_No'";
  }
  else{
    $fetchsql ="SELECT a.*,
    (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType limit 1) as BagTypeName,
    (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType2 limit 1) as BagTypeName2,
    (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.BagType3 limit 1) as BagTypeName3,
    b.PLANT_NAME as SendingPlantName,c.STORAGE_LOCATION as SendingStorageLocationName,
    d.PLANT_NAME as ReceivingPlantName,e.STORAGE_LOCATION as ReceivingStorageLocationName
    FROM `intrastate_sap_to_pp` a 
    LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
    LEFT JOIN master_storage c ON a.SendingStorageLocation=c.LGORT
    LEFT JOIN master_plant d ON a.ReceivingPlant=d.WERKS
    LEFT JOIN master_storage e ON a.ReceivingStorageLoc=e.LGORT
    where PickSlipNo='$PickslipNo'";
  }  

  //  echo $fetchsql; exit();

  $PickSlipDetails = getResultAsObjectArray($connect, $fetchsql);
  //var_dump($PickSlipDetails);
  $cnd2 = "";
  if($intra_state_warehouse_dispatch_info[0]['IsTruck']=="1")//Mohan Added 08092022 for truck for others else part
  {
    $cnd2=" AND a.ReceivingArrivalId is not null";
  }

  $fetchsql = "
    SELECT 
        a.*,
        mb1.BAG_NAME AS BagTypeName,
        mb2.BAG_NAME AS BagTypeName2,
        mb3.BAG_NAME AS BagTypeName3,
        DATE_FORMAT(pi.GateInDt,'%d-%m-%Y %H:%i') AS InsDt,
        DATE_FORMAT(pi.GateOutDt,'%d-%m-%Y %H:%i') AS ModDt
    FROM intrastate_gateout_info a
    LEFT JOIN master_bag mb1 ON mb1.BAG_CODE = a.BagType
    LEFT JOIN master_bag mb2 ON mb2.BAG_CODE = a.BagType2
    LEFT JOIN master_bag mb3 ON mb3.BAG_CODE = a.BagType3
    LEFT JOIN purchase_info pi ON pi.PI_REFID = a.ReceivingArrivalId
    WHERE a.EmptyVehicleArrivalId = '".$record->ID."' $cnd2
    ";

 
  // echo $fetchsql;exit();
  $intrastate_gateout_info = getResultAsObjectArray($connect, $fetchsql);

 
  return json_encode(["success" => 1, "results" => $tableRecords,
                                      "intra_state_warehouse_dispatch_info"=>$intra_state_warehouse_dispatch_info, 
                                      "PickSlipDetails"=>$PickSlipDetails,
                                      "intrastate_gateout_info"=>$intrastate_gateout_info,
                                      "count" => $total]);

}
