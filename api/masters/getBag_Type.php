<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
echo fetchAllBagTypes($connect);
$connect->close();
function fetchAllBagTypes($connect)
{
  $fetchsql = "select BAG_CODE as value, BAG_NAME as label, WEIGHT as weight,WheatWeight from master_bag";
  $bagData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $bagData]);
}
?>
