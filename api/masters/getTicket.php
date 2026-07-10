<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entityPO = json_decode(file_get_contents("php://input"));
echo fetchAllBagTypes($connect,$entityPO);
$connect->close();


function fetchAllBagTypes($connect)
{
  $VA_Number=$entityPO->Vanumber;
  $fetchsql = "SELECT Voucher_No as value, Voucher_No as label, First_Weight, Second_Weight, Net_Weight FROM silo_wb WHERE Is_Used = 0";
  $ticketData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $ticketData]);
}
?>
