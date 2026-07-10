<?php

use function PHPUnit\Framework\isEmpty;

include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
//var_dump($entityQCContent);exit();
$session = session();
$SessionUser=$_SESSION["USERID"];

//echo "XX ".$entityVAContent->formType. "YY"; exit();

if ($entityVAContent->formType == "getRelottingforApproval" || $entityVAContent->formType == "getRelotting" || $entityVAContent->formType == "getRelottingforEntry" ) 
{
  echo getRelotting($connect, $entityVAContent);
}
else if ($entityVAContent->formType == "getInventoryACApproval") 
{
  echo getInventoryACApprove($connect, $entityVAContent);
}
else if ($entityVAContent->formType == "updateInventory"||$entityVAContent->formType == "updateInventoryWMApprove"||$entityVAContent->formType == "updateInventoryWMACApprove") 
{
  echo updateInventory($connect, $entityVAContent);
}
else
{ 
  if ($entityVAContent <> "" ){
    echo RelotEntry($connect, $entityVAContent);
  }
  
}

function RelotEntry($connect,$record){
    //Check Duplicate
   /* $sql = "SELECT * FROM `ngw_keyloan_pledge` where lotid='".$record->lotid."' 
    and warehouseid='".$record->warehouseid."' and plantid='".$record->plantid."' 
    and Wheat_Variety_Id='".$record->Wheat_Variety_Id."' and balance_qty>0";
  $Select=mysqli_query($connect, $sql);
  $Count=mysqli_num_rows($Select);
  if($Count>0){
    return json_encode(["success" => 0]);
    exit();
  }*/

  // if(isEmpty($record))
  // {
  //   return json_encode(["success" => 0]);
  // }

  $CurrentTime=date("d-m-Y H:i:s")."\n";
  $fields = [];
   $values = [];
   $UpdateArray=[];
  foreach ($record as $key => $value) {
    if ($key== "FreightVendor" and $value == ""){
      $value =0;
    }
   
      array_push($fields, $key);
      array_push($values, mysqli_real_escape_string($connect, trim($value)));
      array_push($UpdateArray,$key."='".mysqli_real_escape_string($connect, trim($value))."'");
  }

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");
  array_push($fields, 'InsBy');
  array_push($values, mysqli_real_escape_string($connect, trim($SessionUser)));
  array_push($fields, 'wirqstby');
  array_push($values, mysqli_real_escape_string($connect, trim($SessionUser)));
  array_push($fields, 'wirqstdate');
  array_push($values, $CurrentDateTime);


  $sql = "INSERT INTO ngw_relot (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  //echo $sql;exit();
  mysqli_query($connect, $sql);
  $last_id = $connect->insert_id;
  // Just Create a record in sublot table with wheatvariety stock as zero for joining purpose 
  $countsql = "Select count(1) as total from ngw_sublot where (lotid, lotno, plantid, StorageLocationId,wheatvarietyid) = 
  ('".$record->tolotid."', '".$record->tolotno."','".$record->toplantid."','".$record->tolocationid."','".$record->WheatVarietyId."' )";
  //echo $countsql;
  $total = getFieldValue($connect, $countsql,0);

  if($total==0)
  {
    $sql = "Insert into ngw_sublot(lotid, lotno, warehouseid, plantid, StorageLocationId, wheatvarietyid, wheatqty, SAP_Qty) 
    select lotid, lotno, warehouseid, plantid, '".$record->tolocationid."','".$record->WheatVarietyId."', 0, 0 from ngw_lot
    where (lotid, lotno, plantid, locationid) = 
    ('".$record->tolotid."', '".$record->tolotno."','".$record->toplantid."','".$record->tolocationid."' )";
    //echo $sql;
    mysqli_query($connect, $sql);
  }
  return json_encode(["success" => 1]);
}


function updateInvegetRelottingntory($connect, $record){
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
  }
  if($record->formType=="updateInventoryWMACApprove")
  {
    $setcols=", acwmpiaapprvby='".$SessionUser."' ";
    $setcols.=", acwmpiaapprvdate=Current_Timestamp ";
  }

 $sql = "UPDATE `ngw_physicalinventory`  SET Status='".$record->Data->Status."' ".$setcols."
 where Physical_Inventory_Id='".$record->Data->Id."'";
  //  echo $sql;exit();
  mysqli_query($connect, $sql);

  return json_encode(["success" => 1]);
}


function getRelotting($connect, $record){
  
$CurrentTime=date("d-m-Y H:i:s")."\n";
$keytoexclude = ["formType"];
$filters = [1];
$filtersOr=array();
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
  
  array_push($filters, "Screentype = '" . $record->screentype . "'");
}
if (isset($record->Data->warehouseid->value)) {
  
  array_push($filters, "warehouseid <= '" . $record->Data->warehouseid->value . "'");
}
if (isset($record->Data->lotid->value)) {
  
  array_push($filters, "lotid <= '" . $record->Data->lotid->value . "'");
}
if($record->formType == "getRelotting" )
{
  array_push($filters, "RelotStatus = '1'");
}
//echo "test:".$record->formType;
if($record->formType == "getRelottingforEntry" )
{
  array_push($filters, " RelotStatus IN('2','-1') ");
}
if($record->formType == "getRelottingforApproval" )
{
  array_push($filters, " RelotStatus IN('3') ");
}


if($record->searchTxt && $record->searchTxt!= "" )
{
  array_push($filtersOr, " b.WH_NAME like '".$record->searchTxt."%' ");
  array_push($filtersOr, " c.PLANT_NAME like '".$record->searchTxt."%' ");
  array_push($filtersOr, " f.WheatVariety like '".$record->searchTxt."%' ");
  array_push($filtersOr, " a.fromlotno like '".$record->searchTxt."%' ");
  array_push($filtersOr, " a.tolotno like '".$record->searchTxt."%' ");
  
}
else{
  array_push($filtersOr, " 1 ");
}


//var_dump($filters);

$fetchsql =
"SELECT a.*,b.WH_NAME,c.PLANT_NAME,d.WH_NAME as Towarehouse,e.PLANT_NAME as toPlant,
f.WheatVariety as WheatvarietyName,
sec_to_time(TIMESTAMPDIFF(second,a.wirqstdate,IF(a.qcrelotdate>0,a.qcrelotdate,CURRENT_TIMESTAMP))) as Qcduration,
sec_to_time(TIMESTAMPDIFF(second,a.qcrelotdate,IF(a.wirelotdate>0,a.wirelotdate,CURRENT_TIMESTAMP))) as Entryduration,
sec_to_time(TIMESTAMPDIFF(second,a.wirelotdate,IF(a.wmrelotdate>0,a.wmrelotdate,CURRENT_TIMESTAMP))) as Approvalduration,
sec_to_time(TIMESTAMPDIFF(second,a.InsDt,IF(a.wmrelotdate>0,a.wmrelotdate,CURRENT_TIMESTAMP))) as overallduration,
if(a.RelotStatus='1','QC Approval',IF(a.RelotStatus='2','Relot Entry',
IF(a.RelotStatus='-1','QC Rejected',
IF(a.RelotStatus='3','Relot Approval','')))
) as StatusName,g.STORAGE_LOCATION
FROM `ngw_relot` a
JOIN warehouse_master b ON a.fromwarehouseid=b.wh_code
JOIN master_plant c ON a.fromplantid=c.ID
JOIN master_storage g ON a.fromlocationid=g.STORAGE_REFID

JOIN warehouse_master d ON a.fromwarehouseid=d.wh_code
JOIN master_plant e ON a.fromplantid=e.ID
JOIN master_mrc_wheat_variety f ON a.WheatVarietyId=f.Id
where  ".join(' AND ', $filters)." and ( ".join(' Or ', $filtersOr).") order by RelotId LIMIT ".$record->startCount . ",".$record->pageSize."";
// echo $fetchsql;
$tableRecords = getResultAsObjectArray($connect, $fetchsql);


$countsql =
"SELECT count(1) as total
FROM `ngw_relot` a
JOIN warehouse_master b ON a.fromwarehouseid=b.wh_code
JOIN master_plant c ON a.fromplantid=c.ID
JOIN master_storage g ON a.fromlocationid=g.STORAGE_REFID
JOIN warehouse_master d ON a.fromwarehouseid=d.wh_code
JOIN master_plant e ON a.fromplantid=e.ID
JOIN master_mrc_wheat_variety f ON a.WheatVarietyId=f.Id
where  ".join(' AND ', $filters)." and ( ".join(' Or ', $filtersOr).") order by RelotId 
";

// echo $countsql;
$total = getFieldValue($connect, $countsql,0);
return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function getInventoryACApprove($connect, $record){
  
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
  $total = count($tableRecords);
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
  }
?>
