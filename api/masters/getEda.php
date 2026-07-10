
<?php

include_once APIPATH. "/helper/sessionHelper.php";
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set('Asia/Calcutta');
$date = date("Y-m-d H:i:s");
$From_Location =$_GET["from"];
$To_Location = $_GET["to"];
$Mode_Of_Transport =  $_GET["type"];
$sql = "SELECT EAD FROM ead WHERE From_Location='$From_Location' AND To_Location=(select Location from master_to_location where plantId='$To_Location' limit 1) AND Mode_Of_Transport='$Mode_Of_Transport'";
//echo $eda;
$days =getFieldValue($connect,$sql,"");
// echo "Current Date:" . $date . "</br>";
$date2 = date("Y-m-d", strtotime($days . " days", strtotime($date)));

$connect->close();
// echo "EDA Date:" . $date2;
echo json_encode(["success" => 1, "results" =>  $days]);
?>