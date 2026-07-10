<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";

include_once APIPATH."/helper/appHelper.php";
$entitysupBody = json_decode(file_get_contents("php://input"));
if (isset($entitysupBody->type) && $entitysupBody->type === "UAOY") {
  echo fetchInterComPoLine($connect, $entitysupBody);

}else if(isset($entitysupBody->type) && $entitysupBody->type === "SILOTOMILL") {
  echo fetchAllPo_silotomill_LineByPO($connect, $entitysupBody);
} 
else if(isset($entitysupBody->type) && $entitysupBody->type === "SILOTOMILL_LINEDET") {
  echo fetchAllPo_silotomill_LineDetByPO($connect, $entitysupBody);
} 
else {
  echo fetchAllPoLineByPO($connect, $entitysupBody);
}

$connect->close();
function fetchAllPo_silotomill_LineDetByPO($connect, $content)
{
 
  $PO_NUMBER = $content->PO_number;
  $lineItem = $content->lineItem;
  
  $fetchsql="SELECT *,WheatVariety as WheatVariety,StorageLocation as StorageLocation,
  ReceivingPlant as ReceivingPlant
   FROM pp_silotomillpoline WHERE PONumber = '". $PO_NUMBER."' AND LineItem='$lineItem'";
  
  $lineItems = getResultAsObjectArray($connect, $fetchsql);

  
  return json_encode(["success" => 1, "results" => $lineItems]);
}
function fetchAllPo_silotomill_LineByPO($connect, $content)
{
//  echo "ff";
  $PO_NUMBER = $content->PO_NUMBER;
  
  $fetchsql="SELECT DISTINCT LineItem as label, LineItem as value 
  FROM pp_silotomillpoline WHERE PONumber = '". $PO_NUMBER."'";
  
  $lineItems = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $lineItems]);
}
function fetchAllPoLineByPO($connect, $content)
{
  $PO_NUMBER = $content->PO_NUMBER;
  if (isset($content->screenType) && $content->screenType === "SDO") {
    $fetchsql = "SELECT DISTINCT EBELP as label, EBELP as value from sap_to_pp where LOEKZ != 'D' and EBELN = '" . $PO_NUMBER . "'";
  } else {
    // $fetchsql="select distinct ts.lineItem as label, ts.lineItem as value 
    // from (
    //   select     
    // CASE
    //     WHEN vi.LINE_ITEM IS NULL or vi.LINE_ITEM  = '' THEN di.ZPO_LINE_ITEM
    //     ELSE vi.LINE_ITEM
    // END as lineItem
    
    // from supplier_dispatch_info di join supplier_vehical_info vi on vi.SUPPLIER_ID=di.SD_REFID where vi.VEHICLE_ARRIVED=0 and di.ZPO_NUMBER = '" . $PO_NUMBER . "' AND di.QA_APPROVER_STATUS = 'A' ) ts where ts.lineItem IS NOT NULL and  ts.lineItem<>''";
    // echo $fetchsql;
    //$fetchsql = "SELECT DISTINCT ZPO_LINE_ITEM as label, ZPO_LINE_ITEM as value from supplier_dispatch_info where ZPO_NUMBER = '" . $PO_NUMBER . "' AND QA_APPROVER_STATUS = 'A'";
    $fetchsql="SELECT DISTINCT LINE_ITEM as label, LINE_ITEM as value 
    FROM supplier_vehical_info 
    JOIN supplier_dispatch_info ON SUPPLIER_ID = SD_REFID WHERE ZPO_NUMBER = '". $PO_NUMBER."'";
  }
  $lineItems = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $lineItems]);
}

function fetchInterComPoLine($connect, $record)
{
  try {
    $po = mysqli_real_escape_string($connect, trim($record->id));

    $fetchsql =
      "select DISTINCT PoLineItem as value, PoLineItem as label, materialNo, wheatVariety from interstate_sap_to_pp where PoNumber='" .
      $po .
      "' order by PoLineItem desc ";

    $poRecords = getResultAsObjectArray($connect, $fetchsql);

    return json_encode(["success" => 1, "results" => $poRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}

?>
