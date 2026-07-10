<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
date_default_timezone_set("Asia/Calcutta");
if  ($entityVAContent->formType === "SDO_SDI") {
  echo fetchSDO_SDIDetails($connect, $entityVAContent);
} 
else if  ($entityVAContent->formType === "STM" || $entityVAContent->formType === "IAS" || $entityVAContent->formType === "IRS") {
  echo fetch_IASDetails($connect, $entityVAContent);
} 
$connect->close();

function fetch_IASDetails($connect, $record)
{
  
  $Id=$record->id;
  
    $fetchsql =
    "SELECT a.ID as PI_REFID,a.VEHICLE_STATUS as VECHICAL_STATUS,a.ZVA_NUMBER,b.StatusName
    FROM `empty_vehicle_arrival` a
    JOIN pp_status b ON a.VEHICLE_STATUS=b.Id 
    where a.ID='$Id'";
   // echo $fetchsql;
  $tabledata = mysqli_query($connect, $fetchsql);
  if (mysqli_num_rows($tabledata) > 0) {
    //output data of each row
    $row = $tabledata->fetch_assoc();
    $VECHICAL_STATUS=$row['VECHICAL_STATUS'];

    if($record->formType === "IAS"){
    $fetchsql = "select StatusName as label, Id as value from pp_status where ias='1' 
    and ias_order<=(SELECT ias_order FROM `pp_status` where Id='".$VECHICAL_STATUS."') order by ias_order";
    }
    if($record->formType === "STM"){
      $fetchsql = "select StatusName as label, Id as value from pp_status where stm='1' 
      and stm_order<=(SELECT stm_order FROM `pp_status` where Id='".$VECHICAL_STATUS."') order by stm_order";
      }
    if($record->formType === "IRS"){
      $fetchsql = "select StatusName as label, Id as value from pp_status where irs='1' and irs_order<=(SELECT irs_order FROM `pp_status` where Id='".$VECHICAL_STATUS."') order by irs_order";
    }
//echo $fetchsql;
//exit();
  $Status = getResultAsObjectArray($connect, $fetchsql);
  
    return json_encode(["success" => 1, "results" => $row,"VehStatus"=>$Status]);
  } else {
    return json_encode(["success" => 0]);
  }
}
function fetchSDO_SDIDetails($connect, $record)
{
  
  
  $Id=$record->id;
  
    $fetchsql =
    "SELECT a.PI_REFID,a.VECHICAL_STATUS,a.ZVA_NUMBER,b.StatusName
    FROM `purchase_info` a
    JOIN pp_status b ON a.VECHICAL_STATUS=b.Id 
    where a.PI_REFID='$Id'";
   // echo $fetchsql;
  $tabledata = mysqli_query($connect, $fetchsql);
  if (mysqli_num_rows($tabledata) > 0) {
    //output data of each row
    $row = $tabledata->fetch_assoc();
    $VECHICAL_STATUS=$row['VECHICAL_STATUS'];

    /*$fetchsql = "select StatusName as label, Id as value from pp_status where sdo_sdi='1' 
    and Id<='$VECHICAL_STATUS' order by Id";
*/
    $fetchsql = "select StatusName as label, Id as value from pp_status where sdo_sdi='1' 
    and sdo_sdi_order<=(SELECT sdo_sdi_order FROM `pp_status` where Id='".$VECHICAL_STATUS."') order by sdo_sdi_order";

  $Status = getResultAsObjectArray($connect, $fetchsql);
  
    return json_encode(["success" => 1, "results" => $row,"VehStatus"=>$Status]);
  } else {
    return json_encode(["success" => 0]);
  }
}
?>
