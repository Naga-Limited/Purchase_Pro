<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
echo fetchAllBagTypes($connect);
$connect->close();
function fetchAllBagTypes($connect)
{
  $fetchsql = "SELECT id as value,Name as label,BagCuttingCharge as Charges FROM `master_vendor` WHERE RecStatus='1'";
  $bagData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $bagData]);
}
?>
