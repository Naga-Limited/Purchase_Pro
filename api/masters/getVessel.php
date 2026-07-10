<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
echo fetchAllVessels($connect);
$connect->close();
function fetchAllVessels($connect)
{
  $fetchsql = "select VESSEL_REFID as value, VESSEL_NAME as label from master_vessel";
  $vsData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $vsData]);
}
?>
