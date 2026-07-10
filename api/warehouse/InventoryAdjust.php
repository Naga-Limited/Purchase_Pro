<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
//var_dump($entityQCContent);exit();
$session = session();
$SessionUser=$_SESSION["USERID"];
$allowed_diff_in_percent=2;

if ($entityVAContent->formType == "getInventory" || $entityVAContent->formType == "getInventoryReport" ) {
 
  echo getInventory($connect, $entityVAContent);
}else if ($entityVAContent->formType == "getInventoryACApproval") {
  echo getInventory($connect, $entityVAContent);
}else if ($entityVAContent->formType == "updateInventory"||$entityVAContent->formType == "updateInventoryWMApprove"||$entityVAContent->formType == "updateInventoryWMACApprove") {
 
  echo updateInventory($connect, $entityVAContent);
}else{
 
// echo keyLoanLedgerEntry($connect, $entityVAContent);
}


function updateInventory($connect, $record){
 global $SessionUser;
  $setcols = "";
  // echo "X".$record->formType."Y";
  if($record->formType=="updateInventory")
  {
    $setcols=", apiaapprvby='".$SessionUser."' ";
    $setcols.=", apiaapprvdate=Current_Timestamp ";

  }
  if($record->formType=="updateInventoryWMApprove")
  {
    $setcols=", wmpiaapprvby='".$SessionUser."' ";
    $setcols.=", wmpiaapprvdate=Current_Timestamp ";
    //24-03-2022 As Requested by client WMAdjustment Accounts Approval not required so WMManageApproval directly move to Accounts approved status
    $setcols.=", acwmpiaapprvby='".$SessionUser."' ";
    $setcols.=", acwmpiaapprvdate=Current_Timestamp ";
    ////24-03-2022 End 
  }
  if($record->formType=="updateInventoryWMACApprove")
  {
    $setcols=", acwmpiaapprvby='".$SessionUser."' ";
    $setcols.=", acwmpiaapprvdate=Current_Timestamp ";
  }

 $sql = "UPDATE `ngw_physicalinventory`  SET Status='".$record->Data->Status."' ".$setcols."
 where Physical_Inventory_Id='".$record->Data->Id."'";
  //echo $sql;exit();
  mysqli_query($connect, $sql);

  return json_encode(["success" => 1]);
}

function getInventory($connect, $record){
  global $allowed_diff_in_percent;
$CurrentTime=date("d-m-Y H:i:s")."\n";
$keytoexclude = ["formType"];
$filters = [1];

if (isset($record->Data->Fromdate)) {
  
    array_push($filters, "Posting_Date >= '" . $record->Data->Fromdate . "'");
}
if (isset($record->Data->Todate)) {
  
  array_push($filters, "Posting_Date <= date_add('" . $record->Data->Todate . "', INTERVAL 1 DAY)");
}
if (isset($record->Data->ScreenType)) {
    array_push($filters, "Screentype = '" . $record->Data->ScreenType->value . "'");
}

if (isset($record->screentype)) {
  
  array_push($filters, "Screentype = '" . $record->screentype . "'");
}
if (isset($record->Data->warehouseid->value)) {
  
  array_push($filters, "c.wh_code = '" . $record->Data->warehouseid->value . "'");
}
if (isset($record->Data->lotid->value)) {
  
  array_push($filters, "a.lotid = '" . $record->Data->lotid->value . "'");
}
if($record->formType == "getInventory" )
{
  array_push($filters, "Status = '1'");
}
if($record->formType == "getInventoryACApproval" )
{
  array_push($filters, "Status = '2'");
}
if($record->formType == "getInventoryReport" )
{
  array_push($filters, " Status in (-2,-1,1,2,3) ");
}

//var_dump($filters);
$fetchsql =
"SELECT a.*,date_format(Posting_Date,'%d-%m-%Y') as PostDate,b.PLANT_NAME as PlantName,
concat(c.wh_code,'-',c.WH_NAME) as warehousename,d.WheatVariety,
if(a.Status='1','Approval Pending',if(a.Status='2','Approved','')) as Status,
sec_to_time(TIMESTAMPDIFF(second,a.InsDt,CURRENT_TIMESTAMP)) as Duration,e.STORAGE_LOCATION ,
lot.totalcapacity, slot.init_lot_qty, slot.wheatqty, '".$allowed_diff_in_percent."' allowed_diff_in_percent,
(slot.wheatqty+if(lot.totalcapacity>slot.wheatqty,(slot.wheatqty*".$allowed_diff_in_percent."/100),(lot.totalcapacity*".$allowed_diff_in_percent."/100))) as allowed_diff_qty
FROM `ngw_physicalinventory` a
JOIN master_plant b ON a.plantid=b.ID
JOIN warehouse_master c ON a.warehouseid=c.wh_refid
JOIN master_storage e ON a.locationid=e.STORAGE_REFID
JOIN master_mrc_wheat_variety d ON a.Wheat_Variety_Id=d.Id
JOIN ngw_lot lot on lot.lotid=a.lotid
JOIN ngw_sublot slot on lot.lotid=slot.lotid  and slot.wheatvarietyid=a.Wheat_Variety_Id
where  ".join(' AND ', $filters)." order by Physical_Inventory_Id ";
  //echo $fetchsql;exit();
$tableRecords = getResultAsObjectArray($connect, $fetchsql);
$total = count($tableRecords);
return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

/*function getInventoryACApprove($connect, $record){
  
  $CurrentTime=date("d-m-Y H:i:s")."\n";
  $keytoexclude = ["formType"];
  $filters = [1];
  
  if (isset($record->Data->Fromdate)) {
    
      array_push($filters, "Posting_Date >= '" . $record->Data->Fromdate . "'");
  }
  if (isset($record->Data->Todate)) {
    
    array_push($filters, "Posting_Date <= date_add('" . $record->Data->Todate . "', INTERVAL 1 DAY)");
  }
  if (isset($record->Data->ScreenType)) {
  
    array_push($filters, "Screentype = '" . $record->Data->ScreenType . "'");
  }
  
  if (isset($record->screentype)) {
  
    array_push($filters, "Screentype = '" . $record->screentype. "'");
  }
  
  if (isset($record->Data->warehouseid->value)) {
    
    array_push($filters, "warehouseid <= '" . $record->Data->warehouseid->value . "'");
  }
  if (isset($record->Data->lotid->value)) {
    
    array_push($filters, "lotid <= '" . $record->Data->lotid->value . "'");
  }
  
  
  $fetchsql =
  "SELECT *,date_format(Posting_Date,'%d-%m-%Y') as PostDate,b.PLANT_NAME as PlantName,
  concat(c.wh_code,'-',c.WH_NAME) as warehousename,d.WheatVariety,
  if(a.Status='1','Approval Pending','') as Status,
  sec_to_time(TIMESTAMPDIFF(second,a.InsDt,CURRENT_TIMESTAMP)) as Duration
  FROM `ngw_physicalinventory` a
  JOIN master_plant b ON a.plantid=b.ID
  JOIN warehouse_master c ON a.warehouseid=c.wh_refid
  JOIN master_mrc_wheat_variety d ON a.Wheat_Variety_Id=d.Id
  where  ".join(' AND ', $filters)." and Status='2' order by Physical_Inventory_Id ";
  //echo $fetchsql;
  //exit();
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
  }
  */
?>
