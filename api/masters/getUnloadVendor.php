<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
echo fetchAllBagTypes($connect);
$connect->close();
function fetchAllBagTypes($connect)
{
  $fetchsql = "SELECT  Name as label,Name as value FROM `master_vendor` where Category = 'Unloading Vendor' AND RecStatus = 1 ORDER by Id";

  $posRecords = getResultAsObjectArray($connect, $fetchsql);
  //print_r($posRecords);exit('aaa');
  return json_encode(["success" => 1, "poresults" => $posRecords]);
}
?>

