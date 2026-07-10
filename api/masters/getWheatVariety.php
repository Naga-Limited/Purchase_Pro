<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
echo fetchAllWheatVareity($connect);
$connect->close();
function fetchAllWheatVareity($connect)
{
  $fetchsql = "select name as label, name as value from master_wheat_variety";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
?>
