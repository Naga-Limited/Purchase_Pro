<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entitySDContent = json_decode(file_get_contents("php://input"));
echo fetchVH($connect, $entitySDContent);
$connect->close();

function fetchVH($connect, $content)
{
  $PO_NUMBER = $content->PO_NUMBER;
  $lineItem = $content->lineItem;
  $SearchCondition="";
  if($content->searchTxt!=""){
    $SearchCondition="AND (
      VEHICAL_NO like '%$content->searchTxt%'
    )";
  }
  $sql =
    "SELECT DISTINCT VEHICAL_NO as label, VEHICAL_NO as value, WB_QTY as weight,SUP_VE_REFID From supplier_vehical_info 
    JOIN supplier_dispatch_info ON SUPPLIER_ID = SD_REFID where ZPO_NUMBER = '" .
    $PO_NUMBER .
    "' AND LINE_ITEM = '" .
    $lineItem .
    "' AND VEHICLE_ARRIVED = 0   order by SUP_VE_REFID desc";
  
  $vehicleDatas = getResultAsObjectArray($connect, $sql);
  return json_encode(["success" => 1, "results" => $vehicleDatas]);
}
?>
