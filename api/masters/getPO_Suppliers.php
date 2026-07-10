<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entitysupBody = json_decode(file_get_contents("php://input"));
echo fetchAllSupplierByPO($connect, $entitysupBody);
$connect->close();
function fetchAllSupplierByPO($connect, $content)
{
  $PO_NUMBER = $content->PO_NUMBER;
  $lineItem = $content->lineItem;
  if (isset($content->screenType) && $content->screenType === "SDO") {
    $fetchsql =
      "SELECT DISTINCT SUPPLIER_CODE as value, SUPPLIER_NAME as label from sap_to_pp WHERE LOEKZ != 'D' and EBELN = '" .
      $PO_NUMBER .
      "' and EBELP = '" .
      $lineItem .
      "'";
  } else {
    $fetchsql="SELECT DISTINCT ZSUPPLIER_NAME as label, ZSUPPLIER_CODE as value FROM supplier_dispatch_info JOIN supplier_vehical_info ON SUPPLIER_ID = SD_REFID WHERE    ZPO_NUMBER = '". $PO_NUMBER."' AND LINE_ITEM = '".$lineItem."'";
  }
  $supplierDatas = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $supplierDatas]);
}
?>
