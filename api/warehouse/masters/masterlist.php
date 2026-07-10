<?php


// $users = array("name"=>"John", "age"=>37, "surName"=>"Peter");
// echo json_encode($users);


use App\Helpers\StatusConstant;

include_once APIPATH. "/helper/sessionHelper.php";

include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
include_once APIPATH."/helper/queryHelper.php";
//echo "127";
//exit();
date_default_timezone_set("Asia/Calcutta");

$record = json_decode(file_get_contents("php://input"));
// var_dump($record);

$formType = isset($_GET["formType"])?$_GET["formType"]:"" ;
$session = session();
$SessionUser=$_SESSION["USERID"];
$SessionUserRole=$_SESSION["USERROLE"];

  
if(isset($record->formType)){
  $formType=$record->formType;
}
// echo "<Br>".$formType;
// echo "TEST";exit();
switch ($formType) {
        
  case "GetMaster_ngw_state_districtlist":
    echo GetMaster_ngw_state_districtlist($connect,$record);
    break;   
    case "GetMaster_ngw_banklist":
      echo GetMaster_ngw_banklist($connect,$record);
      break;   
  case "GetMaster_ngw_contract_typelist":
        echo GetMaster_ngw_contract_typelist($connect,$record);
        break;   
  case "GetMaster_ngw_reasondeviationlist":
  echo GetMaster_ngw_reasondeviationlist($connect,$record);
  break;   
  case "GetMaster_ngw_reasondelaylist":
  echo GetMaster_ngw_reasondelaylist($connect,$record);
  break;   
  case "GetMaster_ngw_fumigation_statuslist":
  echo GetMaster_ngw_fumigation_statuslist($connect,$record);
  break;   
  case "GetMaster_ngw_divisionlist":
  echo GetMaster_ngw_divisionlist($connect,$record);
  break;   
                                       
  case "GetMaster_ngw_fumigation_typelist":
  echo GetMaster_ngw_fumigation_typelist($connect,$record);
  break; 
  
  /*** Added By prakash on 06-01-2022 ***/
  case "GetWarehouseRetalCalList":
    echo GetWarehouseRetalCalList($connect,$record);
    break;       
  /*** Added By Mohan on 06-01-2022 ***/
  case "WarehouseCreationBHList":
  case "WarehouseCreationWMList":
  case "WarehouseCreationWMMgrList":
  case "WarehouseCreationQCList":
    
  case "WarehouseCreationQCMgrList":
  case "WarehouseCreationWMLotcreationList":
  case "WarehouseCreationCommMgrList":
  case "WarehouseCreationCommercialList":    
    echo WarehouseCreationList($connect,$record);
    break; 
  case "getWarehouseList":
    echo getWarehouseList($connect,$record);
    break; 
    //Lijesh  
  case "GetMaster_ngw_Relotreasonlist":
    echo GetMaster_ngw_Relotreasonlist($connect,$record);
    break; 
  case "Getmaster_baglist":
    echo GetMaster_baglist($connect,$record);
    break; 

case "GetMaster_rndlotconversionlist":
  echo GetMaster_rndlotconversionlist($connect,$record);
  break; 

 }
$connect->close();
function GetMaster_rndlotconversionlist($connect,$record){
  //echo "test";exit();
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.parametername like '%" . $record->searchTxt . "%'
    or a.sortorderno like '%" . $record->searchTxt . "%'
    or b.ParameterType like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT a.rnd_lot_parametermasterid,a.parametername,a.sortorderno,
  b.ParameterType,if(validationrequired='1','YES','NO') as ValReq,
  IF(a.attachmentrequired='1','YES','NO') as AttReq,if(a.attachmentmandatory='1','YES','NO') as AttMan
  FROM `ngw_rnd_lot_parametermaster` a 
  JOIN ngw_rnd_lot_parametertype b ON a.`parametertype`=b.Id
  WHERE ". join(" AND ", $filters). "ORDER by a.rnd_lot_parametermasterid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_rnd_lot_parametermaster` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function GetMaster_ngw_state_districtlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(districtname like '%" . $record->searchTxt . "%'
    or statename like '%" . $record->searchTxt . "%'
    or id like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `id`,  `statename`, `districtname`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_state_district` WHERE ". join(" AND ", $filters). "ORDER by id DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_state_district` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
function GetMaster_ngw_banklist($connect,$record){
  $filters=array("1");
  if (isset($record->searchTxt)) {
    array_push($filters, "(bankname like '%" . $record->searchTxt . "%'  
    or bankcode like '%" . $record->searchTxt . "%'
    
    )");
  }
  $fetchsql = "SELECT `bankid`, `bankname`, `bankcode` FROM `ngw_bankmaster` 
  WHERE  ". join(" AND ", $filters). " 
  ORDER by bankid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  // echo $fetchsql;
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_bankmaster` WHERE 1"; 
  $total = getFieldValue($connect, $countsql,0);
 // echo $fetchsql;exit();
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
//ngw_contract_type GetMaster_ngw_contract_typelist
function GetMaster_ngw_contract_typelist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(contracttype like '%" . $record->searchTxt . "%'  
    or contracttypeid like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `contracttypeid`,  `contracttype`,  `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_contract_type` WHERE ". join(" AND ", $filters). " ORDER by contracttypeid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_contract_type` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function getWarehouseList($connect,$record){
  $filters=array("a.RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.WH_NAME like '%" . $record->searchTxt . "%'  
    or a.wh_code like '%" . $record->searchTxt . "%'
    )");
  }
  if(isset($record->warehouseid->value)){
    array_push($filters," a.wh_code='".$record->warehouseid->value."'");
  }
  if(isset($record->warehouse_status)){
    array_push($filters," a.approval_status='".$record->warehouse_status."'");
  }
  array_push($filters," a.approval_status > 5 and a.approval_status < 100 ");

  $WHButtonRights = getWHButtonRights();
  //echo "SAMPLE  ".$WHButtonRights['WhRenewButton']; exit();

  $fetchsql = "SELECT a.*,date_format(contractstartdate,'%d-%m-%y') as Cstartdate,
  date_format(a.VacateEndDate,'%d-%m-%Y') as VEDate,
  date_format(contractenddate,'%d-%m-%y') as Cenddate,
  date_format(insurance_start_date,'%d-%m-%Y') as ins_start_date,
  date_format(insurance_end_date,'%d-%m-%Y') as ins_end_date,
  date_format(wb1_stamping_start_date,'%d-%m-%Y') as wb1_stamp_start_date,
  date_format(wb1_stamping_expiry_date,'%d-%m-%Y') as wb1_stamp_expiry_date,
  date_format(wb2_stamping_start_date,'%d-%m-%Y') as wb2_stamp_start_date,
  date_format(wb2_stamping_expiry_date,'%d-%m-%Y') as wb2_stamp_expiry_date,
  DATEDIFF(contractenddate, CURRENT_DATE) as ContractElapseDays,
  DATEDIFF(insurance_end_date, CURRENT_DATE) as InsuranceElapseDays,
  IF(approval_status='-2',concat('Reject',rejectreason),
  IF(approval_status='-1',concat('Reject',rejectreason),
  IF(approval_status='1','WM Manager Approval',
  IF(approval_status='2','QC Entry',IF(approval_status='3','QC Manager Approval',
  IF(approval_status='4','BH Approval',IF(approval_status='5','Lot Creation',
  IF(approval_status='6','Lot Manager Approval',IF(approval_status='7','Commercial Entry',
  IF(approval_status='8','Comercial Manager Approval',IF(approval_status='9','Completed','Completed'))))))))))) as approval_statusName,
  b.districtname district,a.district as districtid,
  if(approval_status = 11,'Vacate', 
  if(current_timestamp >= contractstartdate and current_timestamp <= contractenddate, 'Live','Lapsed')) as contract_status,
  0 as TestF1,cast(".$WHButtonRights['WhRenewButton']." as unsigned) as RenewBtn, 
  cast(".$WHButtonRights['WhVacateButton']." as unsigned) as VacateBtn
  
  FROM `warehouse_master`  a left join ngw_state_district b on a.district=b.id
   WHERE ". join(" AND ", $filters). " ORDER by a.wh_refid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  
  //$record->startCount . ",".$record->pageSize;
  // echo $fetchsql;exit();
  
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);

 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `warehouse_master` a WHERE ". join(" AND ", $filters); 
  $total = getFieldValue($connect, $countsql,0);

  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total, "BtnRights"=> $WHButtonRights]);
}

function getWHButtonRights(){
  $session = session();
  $SessionUserRole=$_SESSION["USERROLE"];

  //global $SessionUserRole;
  //echo "ROLE 1", $SessionUserRole;
  $res=array();
  if ($SessionUserRole === "Admin"){
    $res["WhRenewButton"]=intval(1);
    $res["WhVacateButton"]=intval(1);
  }else{
    if($SessionUserRole === "Warehouse Creator SDT" || $SessionUserRole === "Warehouse Creator SDO" ){
      $res["WhRenewButton"]=intval(1);
      $res["WhVacateButton"]=intval(1);
    }else{
      $res["WhRenewButton"]=intval(0);
      $res["WhVacateButton"]=intval(0);
    }
  }
  // var_dump($res);exit();
  return $res;
}

//ngw_division GetMaster_ngw_divisionlist
function GetMaster_ngw_divisionlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(divisionname like '%" . $record->searchTxt . "%'  
    or sapdivisioncode like '%" . $record->searchTxt . "%'  
    or divisionid like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `divisionid`,  `divisionname`,  `sapdivisioncode`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_division` WHERE ". join(" AND ", $filters). "ORDER by divisionid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_division` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//ngw_fumigation_status GetMaster_ngw_fumigation_statuslist
function GetMaster_ngw_fumigation_statuslist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(Fumigation_Status like '%" . $record->searchTxt . "%'  
    or Fumigation_StatusId like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `Fumigation_StatusId`,  `Fumigation_Status`,  `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_fumigation_status` WHERE ". join(" AND ", $filters). "ORDER by SortOrder DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_fumigation_status` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//ngw_reason_for_delay GetMaster_ngw_reasondelaylist
function GetMaster_ngw_reasondelaylist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(ReasonDelayStatus like '%" . $record->searchTxt . "%'  
    or ReasonDelayId like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `ReasonDelayId`,  `ReasonDelayStatus`,  `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_reason_for_delay` WHERE ". join(" AND ", $filters). "ORDER by SortOrder DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_reason_for_delay` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

//ngw_reason_for_deviation GetMaster_ngw_reasondeviationlist
function GetMaster_ngw_reasondeviationlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(ReasonDeviation like '%" . $record->searchTxt . "%'  
    or ReasonDeviationId like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `ReasonDeviationId`,  `ReasonDeviation`,  `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_reason_for_deviation` WHERE ". join(" AND ", $filters). "ORDER by SortOrder DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_reason_for_deviation` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}


function GetMaster_ngw_fumigation_typelist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(Fumigation_Type like '%" . $record->searchTxt . "%'  
    or Fumigation_TypeId like '%" . $record->searchTxt . "%'
    )");
  }
  $fetchsql = "SELECT `Fumigation_TypeId`,  `Fumigation_Type`,  `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
   FROM `ngw_fumigation_type` WHERE ". join(" AND ", $filters). "ORDER by Fumigation_TypeId DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  $countsql = "SELECT count(1) as total FROM `ngw_fumigation_type` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}


/**** Added By Prakash On 06-01-2022 ****/

function GetWarehouseRetalCalList($connect,$record){
  $filters=array("RecStatus='1'");
  $fetchsql = "SELECT `wh_refid`,`wh_code`,  `WH_NAME`,  `cost_centre`, `usedDays`, `rentPerDay`, `totalRemtAmt`, `glAccount`, `Verification`
  FROM `warehouse_master` WHERE ". join(" AND ", $filters). "AND Verification != 'VERIFIED' ORDER by wh_refid DESC";
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  $countsql = "SELECT count(1) as total FROM `warehouse_master` WHERE RecStatus='1'"; 
  $total = getFieldValue($connect, $countsql,0);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function WarehouseCreationList($connect,$record){
  global $SessionUser;
   //echo "TEST";
   //exit(); 
  // var_dump($record);
  $OriginCnd = "";

  if(isset($record->formType) && $record->formType=="WarehouseCreationBHList")
  {
    //$statuslist = "'4'";
    $statuslist = "'4','104'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationQCList"){
    $OriginCnd = getOrginPrivillegeCnd($SessionUser);

    //$statuslist = "'2','-2'";
    $statuslist = "'2','-2','102'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationQCMgrList"){
    $OriginCnd = getOrginPrivillegeCnd($SessionUser);

    //$statuslist = "'3'";
    $statuslist = "'3','103'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationWMList" ){
    $OriginCnd = getOrginPrivillegeCnd($SessionUser);

    //$statuslist = "'-1','5'";
    $statuslist = "'-1','5','105'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationWMMgrList" ){
    $OriginCnd = getOrginPrivillegeCnd($SessionUser);

    //$statuslist = "'1','6'";
    $statuslist = "'1','101','6','106'";
  }
  
  else if(isset($record->formType) && $record->formType=="WarehouseCreationWMLotcreationList"){
    $OriginCnd = getOrginPrivillegeCnd($SessionUser);

  // $statuslist = "'6'";
  $statuslist = "'6','106'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationCommercialList"){
    //$statuslist = "'7'";
    $statuslist = "'7','107'";
  }
  else if(isset($record->formType) && $record->formType=="WarehouseCreationCommMgrList"){
    //$statuslist = "'8'";
    $statuslist = "'8','108'";
  }

  
  
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
    array_push($filters, "(WH_NAME like '%" . $record->searchTxt . "%'  
    or whcity like '%" . $record->searchTxt . "%'
    )");
  }
  
  $fetchsql = "SELECT `wh_refid`,`wh_code`, `WH_NAME`, whcity, state, godown_type, 
  @diff:=TIMESTAMPDIFF(SECOND, insdt, current_timestamp ), 
    CONCAT(CAST(@days := IF(@diff/86400 >= 1, floor(@diff / 86400 ),0) AS SIGNED) , 'd ',
    CAST(@hours := IF(@diff/3600 >= 1, floor((@diff:=@diff-@days*86400) / 3600),0) AS SIGNED) , 'h ',
    CAST(@minutes := IF(@diff/60 >= 1, floor((@diff:=@diff-@hours*3600) / 60),0) AS SIGNED), 'm ' )
    as OverallDuration, 
  current_timestamp - moddt as ScreenDurationDiff,
  @diff1:=TIMESTAMPDIFF(SECOND, moddt, current_timestamp ), 
    CONCAT(CAST(@days1 := IF(@diff1/86400 >= 1, floor(@diff1 / 86400 ),0) AS SIGNED) , 'd ', 
    CAST(@hours := IF(@diff/3600 >= 1, floor((@diff:=@diff-@days*86400) / 3600),0) AS SIGNED) , 'h ', 
    CAST(@minutes := IF(@diff/60 >= 1, floor((@diff:=@diff-@hours*3600) / 60),0) AS SIGNED), 'm ' ) 
    as ScreenDuration, 
  approval_status as approval_status, case
  when approval_status = -1 then 'Rejected' 
  when approval_status = -2 then 'Rejected to QC' 
when approval_status = 1 then 'WM Manager Approval' 
when approval_status = 2 then 'QC Entry' 
when approval_status = 3 then 'QC Manager Approval' 
when approval_status = 4 then 'BH Approval' 
when approval_status = 5 then 'LOT Creation' 
when approval_status = 6 then 'LOT Manager Approval' 
when approval_status = 7 then 'Commercial Entry'  
when approval_status = 8 then 'Commercial Manager Approval' 

when approval_status = 101 then 'WM Manager Approval' 
when approval_status = 102 then 'QC Entry' 
when approval_status = 103 then 'QC Manager Approval' 
when approval_status = 104 then 'BH Approval' 
when approval_status = 105 then 'LOT Creation' 
when approval_status = 106 then 'LOT Manager Approval' 
when approval_status = 107 then 'Commercial Entry'  
when approval_status = 108 then 'Commercial Manager Approval' 

when approval_status = 9 then 'Completed'  
when approval_status = 10 then 'Renewed'  
when approval_status = 11 then 'Vacate'  
end as approval_status_name
  FROM `warehouse_master` WHERE ".join(" AND ", $filters)." and approval_status in ($statuslist) 
  $OriginCnd
  ORDER by wh_refid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  
//echo $fetchsql;
//exit();
  //$record->startCount . ",".$record->pageSize;
    
    
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);

  $countsql = "SELECT count(1) as total FROM `warehouse_master` WHERE RecStatus='1' 
  and approval_status in (1,2,3)"; 
    $countsql = "SELECT  count(1) as total
    FROM `warehouse_master` WHERE ".join(" AND ", $filters)." and approval_status in ($statuslist) 
    $OriginCnd
    ORDER by wh_refid DESC";
  // echo $countsql;
  $total = getFieldValue($connect, $countsql,0);
  // echo "AA";
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function getOrginPrivillegeCnd($UserId)
{
  //WAREHOUSE ORIGIN / LOCAL PRIVILLAGE checking
   $OriginRightsCount = CheckOrginUser($UserId);
   $OriginCnd = "";

   if($OriginRightsCount>0)
   {
     $OriginCnd = " and insby in (select user_id from view_user_privilege priv where priv.PRIVILEGE_NAME in ('WHORIGIN'))";
   }
   //END PRIVILEGE
  
return $OriginCnd;
}

function CheckOrginUser($UserId)
{
  global $connect;
$countsql = "SELECT count(1) as OriginRightsCount FROM `view_user_privilege` a WHERE a.PRIVILEGE_NAME in('WHORIGIN') and a.user_id = '$UserId'"; 
  
return $OriginRightsCount = getFieldValue($connect, $countsql,0);
}
  
  //ngw_relotreason GetMaster_ngw_Relotreasonlist
  function GetMaster_ngw_Relotreasonlist($connect,$record){
  $filters=array("RecStatus='1'");
  if (isset($record->searchTxt)) {
  array_push($filters, "(Relotreason like '%" . $record->searchTxt . "%' 
  or Relotreasonid like '%" . $record->searchTxt . "%'
  )");
  }
  $fetchsql = "SELECT `Relotreasonid`, `Relotreason`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus`
  FROM `ngw_relotreason` WHERE ". join(" AND ", $filters). "ORDER by Relotreasonid DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
  //$record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  // return json_encode(["success" => 1, "results" => $tableRecords]);
  $countsql = "SELECT count(1) as total FROM `ngw_relotreason` WHERE RecStatus='1'"; 
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
    `RecStatus` FROM master_bag WHERE  ". join(" AND ", $filters). "ORDER BY BAG_REFID DESC LIMIT ".$record->startCount . ",".$record->pageSize."";
    //$record->startCount . ",".$record->pageSize;
    $tableRecords = getResultAsObjectArray($connect, $fetchsql);
   // return json_encode(["success" => 1, "results" => $tableRecords]);
    $countsql = "SELECT count(1) as total FROM `master_bag` WHERE RecStatus='1'"; 
    $total = getFieldValue($connect, $countsql,0);
    return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
  }
  

?>
