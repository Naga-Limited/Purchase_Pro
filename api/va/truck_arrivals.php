<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
date_default_timezone_set("Asia/Calcutta");
if ($entityVAContent->formType === "A") {
  echo addTruckArrival($connect, $entityVAContent);
} elseif ($entityVAContent->formType === "U") {
  echo updateTruckStatus($connect, $entityVAContent);
} elseif ($entityVAContent->formType === "PO") {
  echo fetchWVBroker($connect, $entityVAContent);
} 
elseif ($entityVAContent->formType === "STM_ARRIVAL") {
  echo addTruckArrival_STM($connect, $entityVAContent);
} 
$connect->close();
function addTruckArrival_STM($connect, $record)
{
  mysqli_begin_transaction($connect);
  try{
  $TRUCK_NO = mysqli_real_escape_string($connect, trim($record->TRUCK_NO));
  $EMPTY_VEHICLE_ID = mysqli_real_escape_string($connect, trim($record->EMPTY_VEHICLE_ARRIVAL_ID));
  $VANUMBER = mysqli_real_escape_string($connect, trim($record->ZVA_NUMBER));
   $sql = "select TRUCK_NO from purchase_info where TRUCK_NO='$TRUCK_NO' and VECHICAL_STATUS not in (6,7,11,12,34,26,27,28,29,30,31,34,0) and SCREEN_TYPE in('SILOTOMILL')";

 $res = getResultAsObjectArray($connect, $sql);
  if(count($res)>0){
   return  json_encode(["success" => 0, "error"=> "Vehicle already in"]);
   }

  if($VANUMBER == ''){
   return  json_encode(["success" => 0, "error"=> "Please Check VA Details"]);
  }
  $sql_data = "select TRUCK_NO from empty_vehicle_arrival where TRUCK_NO='$TRUCK_NO' and ID ='$EMPTY_VEHICLE_ID' and ZVA_NUMBER = '$VANUMBER' and VEHICLE_STATUS=15";
     //print_r($sql_data);exit;
   $response = getResultAsObjectArray($connect, $sql_data);
  if(count($response) > 0) {
  $varCuurentDate = date('Y-m-d H:i:s'); 
  $EndDate = date('Y-m-d 23:59:59', strtotime($varCuurentDate));
  // $StartDate  = date('Y-m-d', strtotime('-7 day', strtotime($EndDate)));    

  $sdt = "select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 3 order by id";
  $res = getResultAsObjectArray($connect, $sdt);
  $temp_extended_days = $res[0]["temp_extended_days"];
  $days_sdi = -7 - $temp_extended_days ;
  $date_sdi  = date('Y-m-d', strtotime("$days_sdi day", strtotime($EndDate)));
  // print_r($date_sdi);exit();

  $sql = "select WERKS from purchase_info where WERKS IN ('1010','FM01') and DateAdded <= '".$date_sdi."'
  and VECHICAL_STATUS not in (6,7,11,12,34,26,27,28,29,30,31,34) and SCREEN_TYPE in ('SILOTOMILL')";
  $res = getResultAsObjectArray($connect, $sql);

  // print_r(count($res));exit();
  
  if(count($res)>0){
    return  json_encode(["success" => 0, "error"=> "Clear Old Entries"]);
  }
  


  $fields = ["ZVA_NUMBER","EMPTY_VEHICLE_ARRIVAL_ID","VEHICLE_TYPE","TRUCK_NO","DRIVER_NO","WERKS","VECHICAL_STATUS"];
 
  $ifields = [];
  $values = [];
  foreach ($fields as $field) {
    if (isset($record->{$field}) && $field!="VECHICAL_STATUS") {
      array_push($ifields, $field);
      array_push($values, mysqli_real_escape_string($connect, trim($record->{$field})));
    }
  }
  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");
  if($record->VECHICAL_STATUS==1){
    array_push($ifields, 'WaitOutsideDt');
    array_push($ifields, 'WaitOutsideBy');
    array_push($ifields, 'WaitOutsideByName');
    array_push($values,$CurrentDateTime);
    array_push($values,$SessionUser);
    array_push($values,$SessionUserName);

  }
  if($record->VECHICAL_STATUS==4){
    array_push($ifields, 'GateInDt');
    array_push($ifields, 'GateInBy');
    array_push($ifields, 'GateInByName');
    array_push($values,$CurrentDateTime);
    array_push($values,$SessionUser);
    array_push($values,$SessionUserName);
  }
  $screenType = 'SILOTOMILL';
  array_push($ifields, "SCREEN_TYPE");
  array_push($values, $screenType);

  $Plant=isOwnWB($connect,$record->WERKS);
  
  if($Plant==1){
    $record->VECHICAL_STATUS=23;
    array_push($ifields, "VECHICAL_STATUS");
    array_push($values, 23);
  }else{
    array_push($ifields, "VECHICAL_STATUS");
    array_push($values, $record->VECHICAL_STATUS);
  }
 // var_dump($ifields);
 // var_dump($values);
 // exit();
  
  $sql1 = "UPDATE `empty_vehicle_arrival` set VEHICLE_STATUS='16' where ID='".$record->EMPTY_VEHICLE_ARRIVAL_ID."'";
  $Updt = mysqli_query($connect, $sql1);
 
  $sql = "INSERT INTO purchase_info (" . join(", ", $ifields) . ") VALUES ( '" . join("','", $values) . "')";
 //echo $sql;exit();
  $last_id = insertData($connect, $sql);
  }else if(count($response) == 0) {
  return  json_encode(["success" => 0, "error" => "please check vehicle details"]);
  }
  if ($last_id && mysqli_commit($connect)) {
    return json_encode(["success" => 1]);
  } else {
    return json_encode(["success" => 0]);
  }
}catch(Exception $ex){
  mysqli_rollback($connect);
  return json_encode(["success" => 0, "ex"=> $ex]);
}
}
function addTruckArrival($connect, $record)
{  
 //var_dump($record); exit();
  mysqli_begin_transaction($connect);
  try{
  $TRUCK_NO = mysqli_real_escape_string($connect, trim($record->TRUCK_NO));
  $sql = "select TRUCK_NO from purchase_info where TRUCK_NO='$TRUCK_NO' 
  and VECHICAL_STATUS not in (6,7,11,12,18,25,26,27,28,29,30,31,34,2,0) and SCREEN_TYPE<> 'IAS'";
  $res = getResultAsObjectArray($connect, $sql);

 $sql1 = "
    SELECT g.vehicleNo,
           g.masterPlantId,
           m.PLANT_NAME,
           m.WERKS
    FROM gate_in_out_info g
    INNER JOIN master_plant m 
           ON g.masterPlantId = m.ID
    WHERE g.vehicleNo = '$TRUCK_NO'
      AND g.moduleStatusId IN (0,1,2,3,4)
";
$res1 = getResultAsObjectArray($connect, $sql1);

  if(count($res)>0){
    return  json_encode(["success" => 0, "error"=> "Vehicle already in"]);
  }
  if (!empty($res1[0]['WERKS'])) {

            $message = 'VehicleAlready in - ' . 
                       $res1[0]['PLANT_NAME'] . 
                       ' (' . $res1[0]['WERKS'] . ')';
    return  json_encode(["success" => 0, "error"=> $message]);
  }
  if($TRUCK_NO == ''){
    return  json_encode(["success" => 0, "error"=> "Please check Trailer No"]);
  }
  
  $fields = ["ZPO_NUMBER", "PO_LINE_ITEM", "TRUCK_NO", "DRIVER_NO", "IDNLF", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "ZQTY"];
 // $fields = ["ZPO_NUMBER", "PO_LINE_ITEM", "TRUCK_NO", "DRIVER_NO", "IDNLF", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "ZQTY","PlantDescription","StorageLocation"];
  $PO_number = mysqli_real_escape_string($connect, trim($record->ZPO_NUMBER));
  $PO_LINE_ITEM = mysqli_real_escape_string($connect, trim($record->PO_LINE_ITEM));
  $ZSUPPLIER_CODE = mysqli_real_escape_string($connect, trim($record->ZSUPPLIER_CODE));
  $Container_No = (isset($record->CONT_NO))? mysqli_real_escape_string($connect, trim($record->CONT_NO)):'';
  
  
  $ifields = [];
  $values = [];
  foreach ($fields as $field) {
    if (isset($record->{$field})) {
      array_push($ifields, $field);
      array_push($values, mysqli_real_escape_string($connect, trim($record->{$field})));
    }
  }
  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");
  if($record->VECHICAL_STATUS==1){
    array_push($ifields, 'WaitOutsideDt');
    array_push($ifields, 'WaitOutsideBy');
    array_push($ifields, 'WaitOutsideByName');
    array_push($values,$CurrentDateTime);
    array_push($values,$SessionUser);
    array_push($values,$SessionUserName);

  }
  if($record->VECHICAL_STATUS==2){
    array_push($ifields, 'GateInDt');
    array_push($ifields, 'GateInBy');
    array_push($ifields, 'GateInByName');
    array_push($values,$CurrentDateTime);
    array_push($values,$SessionUser);
    array_push($values,$SessionUserName);
  }
  
  
  $sfields = ["WERKS", "LGORT", "INCO1", "NETPR", "MATNR", "PO_BAG_TYPE"];
  $fetchsql1 =
    "SELECT " .
    join(",", $sfields) .
    ", PURCHASE_ORG_DESC as VEHICLE_TYPE, BROCKER_CODE as ZVENDOR_CODE, BROCKER_NAME as ZVENDOR_NAME 
    from sap_to_pp where EBELN ='" .
    $PO_number .
    "' AND EBELP= '" .
    $PO_LINE_ITEM .
    "' AND SUPPLIER_CODE = '" .
    $ZSUPPLIER_CODE .
    "' LIMIT 1";
  $sapResult = mysqli_query($connect, $fetchsql1);
  $sapData = $sapResult->fetch_assoc();

  $plant = mysqli_real_escape_string($connect, trim($sapData["WERKS"]));
  $varCuurentDate = date('Y-m-d H:i:s'); 
  $EndDate = date('Y-m-d 23:59:59', strtotime($varCuurentDate));
  // $StartDate  = date('Y-m-d', strtotime('-7 day', strtotime($EndDate)));    

  if($plant != ''){
  $sdt = "select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 1 order by id";
  $res = getResultAsObjectArray($connect, $sdt);
  $temp_extended_days = $res[0]["temp_extended_days"];
  $days_sdi = -7 - $temp_extended_days ;
  $date_sdi  = date('Y-m-d', strtotime("$days_sdi day", strtotime($EndDate)));
  // print_r($date_sdi);exit();

  $sql = "select WERKS from purchase_info where WERKS='$plant' and DateAdded <= '".$date_sdi."'
  and VECHICAL_STATUS not in (6,7,11,12,18,25,26,27,28,29,30,31,34,2,0,21) and SCREEN_TYPE<> 'IAS'";
  $res = getResultAsObjectArray($connect, $sql);

  if(count($res)>0){
    return  json_encode(["success" => 0, "error"=> "Clear Old Entries"]);
  }
  }
  // print_r($plant);exit();

  array_push($sfields, "VEHICLE_TYPE");
  array_push($sfields, "ZVENDOR_CODE");
  array_push($sfields, "ZVENDOR_NAME");
  foreach ($sfields as $field) {
    if ($sapData[$field]) {
      array_push($ifields, $field);
      array_push($values, mysqli_real_escape_string($connect, trim($sapData[$field])));
    }
  }
  $todayDt = date("Y-m-d H:i:s");
  
 //exit();
 // echo $record->VECHICAL_STATUS."<br>";
 // echo $sapData['WERKS'];
 // exit();
  array_push($ifields, "VECHICAL_STATUS");
  $status = $record->VECHICAL_STATUS;
  if ($record->VECHICAL_STATUS == 1) {
    array_push($ifields, "WAIT_IN_TM");
  } else {
    array_push($ifields, "GAT_IN_TM");
    $POD = trim($sapData["VEHICLE_TYPE"]);
    if (in_array($POD, ["Rake", "CM Rake"])) {
      $status = "4";
    }
  }
  if($record->screenType=="SDI" && $record->VECHICAL_STATUS==2){
    $Plant=isOwnWB($connect,$sapData['WERKS']);
  
    if($Plant==1){
      $status=23;
    }
  }
  array_push($values, $status);
  array_push($values, mysqli_real_escape_string($connect, trim($todayDt)));
  $screenType = $record->screenType;
  // if($screenType==="SDI" && $record->VECHICAL_STATUS != 1){
  //   $TRUCK_NO = mysqli_real_escape_string($connect, trim($record->TRUCK_NO));
  //   // $vehicalNo = $TRUCK_NO;
  //   $vehicalNo = ($Container_No)?$Container_No:$TRUCK_NO;
  //   $sql = "update supplier_vehical_info set VEHICLE_ARRIVED=1 where VEHICAL_NO='$vehicalNo' and VEHICLE_ARRIVED=0 and LINE_ITEM='$PO_LINE_ITEM' and  SUPPLIER_ID in (select SD_REFID from supplier_dispatch_info where ZPO_NUMBER='$PO_number')";

  //   if(!updateData($connect,$sql)){
  //     return json_encode(["success" => 0]);
  //   }
  // }
  // print_r($screenType);exit;
    $TRUCK_NO = mysqli_real_escape_string($connect, trim($record->TRUCK_NO));
    $vehicalNo = ($Container_No)?$Container_No:$TRUCK_NO;

  $fetchsql3 = "select WH_CODE from master_plant where WERKS = '" . mysqli_real_escape_string($connect, trim($sapData["WERKS"])) . "'";
  $whResult = mysqli_query($connect, $fetchsql3);
  $whRecord = $whResult->fetch_assoc();
  $whcode = mysqli_real_escape_string($connect, trim($whRecord["WH_CODE"]));
  $uniqScreenNum = getAutoValue($connect, $screenType, $whcode, "purchase_info");
  array_push($ifields, "ZVA_NUMBER");
  array_push($values, $record->VECHICAL_STATUS == 1 ? '' : $uniqScreenNum);
  array_push($ifields, "SCREEN_TYPE");
  array_push($values, $screenType);
  array_push($ifields, "CONTAINER_NO");
  array_push($values, $Container_No);
  

  $sql = "INSERT INTO purchase_info (" . join(", ", $ifields) . ") VALUES ( '" . join("','", $values) . "')";
  
  $last_id = insertData($connect, $sql);
  if($screenType==="SDI"){
    $TRUCK_NO = mysqli_real_escape_string($connect, trim($record->TRUCK_NO));
    $vehicalNo = ($Container_No)?$Container_No:$TRUCK_NO;
    $VEHICLE_STATUS=$record->VECHICAL_STATUS != 1 ? ',VEHICLE_ARRIVED=1' : '';
    $sql = "update supplier_vehical_info set purchase_info_id=$last_id $VEHICLE_STATUS where VEHICAL_NO='$vehicalNo' and VEHICLE_ARRIVED=0 and LINE_ITEM='$PO_LINE_ITEM' and  SUPPLIER_ID in (select SD_REFID from supplier_dispatch_info where ZPO_NUMBER='$PO_number')";
    updateData($connect,$sql);
    //   return json_encode(["success" => 0]);
    // }
  }
  if ($last_id && mysqli_commit($connect)) {
    return json_encode(["success" => 1 , "results"=>$last_id]);
  } else {
    return json_encode(["success" => 0]);
  }
}catch(Exception $ex){
  mysqli_rollback($connect);
  return json_encode(["success" => 0, "ex"=> $ex]);
}
}
function updateTruckStatus($connect, $record)
{
  //print_r($record);exit;

  $status = mysqli_real_escape_string($connect, trim($record->status));
  if (isset($record->pod) && $record->pod === "RDG") {
   // $status = "4"; Commented by brindha 4-10-2021 for Rake Redirect Moves to unload error in 1st Phase correction 30 point
  }
$Qry="SELECT SCREEN_TYPE,VEHICLE_TYPE,PO_LINE_ITEM,WERKS,LGORT,TRUCK_NO,CONTAINER_NO,ZPO_NUMBER,ZVA_NUMBER,VECHICAL_STATUS FROM `purchase_info` where PI_REFID='".$record->id."'";
$SelectSType=mysqli_query($connect, $Qry);
$FetchStype=mysqli_fetch_assoc($SelectSType);
$ScreenType=$FetchStype['SCREEN_TYPE'];

  $isOwnWB=CheckisOwnWBFromPOID($connect,$record->id);
//echo $ScreenType;
  if($isOwnWB==1 && ($record->status==4 || $record->status==2) && $ScreenType=="SDI"){
      $status=23;
  }else if($isOwnWB==1 && ($ScreenType=="IAS" || $ScreenType=="SILOTOMILL") && $record->val == 1){
      $status=23;
  }else if($record->val == 1 && $ScreenType=="IAS"){
      $status=$record->status;
  }else if($isOwnWB==0 && ($record->status==4 || $record->status==2) && $ScreenType=="SDI"){
    $status=2;
  }

 

  $todayDt = date("Y-m-d H:i:s");
  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");

if($status == 35 && isset($record->REDIRECT_PO_LINE_ITEM)) {
    $usql = "UPDATE purchase_info SET VECHICAL_STATUS =" . $status . ", GAT_IN_TM = '" . $todayDt . "',PO_LINE_ITEM = '" . $record->REDIRECT_PO_LINE_ITEM . "',WERKS = '" . $record->REDIRECT_WERKS. "',LGORT = '" . $record->REDIRECT_LGORT . "',REDIRECT_PO_LINE_ITEM = '" . $FetchStype['PO_LINE_ITEM'] . "',REDIRECT_WERKS = '" . $FetchStype['WERKS'] . "',REDIRECT_LGORT = '" . $FetchStype['LGORT'] . "',GateInDt='$CurrentDateTime',GateInBy='$SessionUser' WHERE PI_REFID = " . $record->id;
 //$usql = "UPDATE purchase_info SET VECHICAL_STATUS =" . $status . ", GAT_IN_TM = '" . $todayDt . "',PO_LINE_ITEM = '" . $FetchStype['PO_LINE_ITEM'] . "',WERKS = '" . $FetchStype['WERKS']. "',LGORT = '" . $FetchStype['LGORT'] . "',REDIRECT_PO_LINE_ITEM = '" . $record->REDIRECT_PO_LINE_ITEM . "',REDIRECT_WERKS = '" . $record->REDIRECT_WERKS . "',REDIRECT_LGORT = '" . $record->REDIRECT_LGORT . "',GateInDt='$CurrentDateTime',GateInBy='$SessionUser' WHERE PI_REFID = " . $record->id;
    if($FetchStype['VEHICLE_TYPE'] == 'Rake') {
      //$usqls =  "UPDATE rake_loading SET po_line_item =" . $record->REDIRECT_PO_LINE_ITEM . ", plant_id = '" . $record->REDIRECT_WERKS . "', storage_location_id = '" . $record->REDIRECT_LGORT . "',updated_by='$SessionUser',updated_at='$CurrentDateTime' WHERE purchase_info_id = " .$record->id;
      $usqls =  "UPDATE rake_loading SET po_line_item =" . $FetchStype['PO_LINE_ITEM'] . ", plant_id = '" . $FetchStype['WERKS'] . "', storage_location_id = '" . $FetchStype['LGORT'] . "',updated_by='$SessionUser',updated_at='$CurrentDateTime' WHERE purchase_info_id = " .$record->id;

        mysqli_query($connect, $usqls);
    }
 }else if($record->val == 1) {
  $usql = "UPDATE purchase_info SET VECHICAL_STATUS =" . $status . ", GAT_IN_TM = '" . $todayDt . "',GateInDt='$CurrentDateTime',GateInBy='$SessionUser' WHERE PI_REFID = " . $record->id;
}else if($ScreenType==="SDI" && $FetchStype['VECHICAL_STATUS'] == 1){

  $fetchsql3 = "select WH_CODE from master_plant where WERKS = '" . mysqli_real_escape_string($connect, trim($FetchStype["WERKS"])) . "'";
  $whResult = mysqli_query($connect, $fetchsql3);
  $whRecord = $whResult->fetch_assoc();
  $whcode = mysqli_real_escape_string($connect, trim($whRecord["WH_CODE"]));
  $uniqScreenNum = getAutoValue($connect, $ScreenType, $whcode, "purchase_info");

  $PO_LINE_ITEM = $FetchStype['PO_LINE_ITEM'];
  $PO_number = $FetchStype['ZPO_NUMBER'];
  $vehicalNo = ($FetchStype['CONTAINER_NO'])?$FetchStype['CONTAINER_NO']:$FetchStype['TRUCK_NO'];
  $sql = "update supplier_vehical_info set VEHICLE_ARRIVED=1 where VEHICAL_NO='$vehicalNo' and VEHICLE_ARRIVED=0 and LINE_ITEM='$PO_LINE_ITEM' and  SUPPLIER_ID in (select SD_REFID from supplier_dispatch_info where ZPO_NUMBER='$PO_number')";

  updateData($connect,$sql);
   
  $usql = "UPDATE purchase_info SET VECHICAL_STATUS =" . $status . ", GAT_IN_TM = '" . $todayDt . "',GateInDt='$CurrentDateTime',GateInBy='$SessionUser',ZVA_NUMBER = '$uniqScreenNum'  WHERE PI_REFID = " . $record->id;
}else {
    $usql = "UPDATE purchase_info SET VECHICAL_STATUS =" . $record->status . ", GAT_IN_TM = '" . $todayDt . "',GateInDt='$CurrentDateTime',GateInBy='$SessionUser' WHERE PI_REFID = " . $record->id;
}
//  echo $usql;
  //var_dump($record);exit;
  if (mysqli_query($connect, $usql) == true) {
    return json_encode(["success" => 1]);
  } else {
    return json_encode(["success" => 0]);
  }
}

function fetchWVBroker($connect, $record)
{
  $PO_number = mysqli_real_escape_string($connect, trim($record->PO_number));
  $PO_line = mysqli_real_escape_string($connect, trim($record->lineItem));
/*  $fetchsql =
    "select BROCKER_NAME, IDNLF, MENGE, MEINS from sap_to_pp 
    where EBELN ='" . $PO_number . "' AND EBELP = '" . $PO_line . "' LIMIT 1";*/
    $fetchsql =
    "select a.BROCKER_NAME, a.IDNLF, a.MENGE, a.MEINS ,
    concat(a.WERKS,'-',b.PLANT_NAME) as PlantDescription,
    concat(a.LGORT,'-',c.STORAGE_LOCATION) as StorageLocation
    from sap_to_pp a
    LEFT JOIN master_plant b ON a.WERKS=b.WERKS 
    LEFT JOIN master_storage c ON a.LGORT=c.LGORT 
    where a.EBELN ='" . $PO_number . "' AND a.EBELP = '" . $PO_line . "' LIMIT 1";
  $tabledata = mysqli_query($connect, $fetchsql);
  if (mysqli_num_rows($tabledata) > 0) {
    //output data of each row
    $row = $tabledata->fetch_assoc();
    $records["BROCKER_NAME"] = $row["BROCKER_NAME"];
    $records["IDNLF"] = $row["IDNLF"];
    $records["PlantDescription"] = $row["PlantDescription"];
    $records["StorageLocation"] = $row["StorageLocation"];
    return json_encode(["success" => 1, "results" => $records]);
  } else {
    return json_encode(["success" => 0]);
  }
}
?>
