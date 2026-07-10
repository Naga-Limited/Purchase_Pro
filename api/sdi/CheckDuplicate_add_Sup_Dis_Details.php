<?php
include_once APIPATH. "/db_connection.php";
include_once APIPATH. "/helper/fileHelper.php";
date_default_timezone_set("Asia/Calcutta");

$sdi_vehical_info = json_decode($_POST["sdinfo"]);

 foreach ($sdi_vehical_info as $row3) {
    $vehical_no = $row3->vehical_no;
  
$sql1="SELECT count(1) as Cnt FROM `supplier_vehical_info` WHERE NO_OF_WAGON='' and VEHICAL_NO='$vehical_no' and VEHICLE_ARRIVED='0'";

    $Select=mysqli_query($connect, $sql1);
    $Fetch=mysqli_fetch_assoc($Select);
    if($Fetch['Cnt']>0){
     
      echo json_encode(["success" => 0,"VehicleNo"=>$vehical_no]);
      exit();
    }
    

    
  }
  
  echo json_encode(["success" => 1]);


?>
