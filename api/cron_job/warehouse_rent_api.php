<?php
const APIPATH = ".";
include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
$output_csv = "SELECT a.wh_code as WarehouseNo,b.id as WRId ,a.WH_NAME as WarehouseName, a.rentpermonth as RentPerMonth, b.postdate as PostingDate
                FROM warehouse_master a
                JOIN ngw_warehouse_rental b ON a.wh_refid = b.wh_refid
                WHERE a.RecStatus='1' AND b.isupdate ='0'";
// echo $output_csv;
$response="RESPONSE";
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
    $output = array('WarehouseNo','WarehouseName','RentPerMonth','PostingDate');
    $rowArr=array();
    $rowArr[]=$output;
     while ($row = mysqli_fetch_array($result)) {
            $test = array(trim($row['WarehouseNo']), trim($row['WarehouseName']), trim($row['RentPerMonth']), trim($row['PostingDate']));
        $rowArr[]=$test;
          $update = "UPDATE ngw_warehouse_rental SET isupdate = '1' WHERE id = ".$row['WRId'];
        mysqli_query($connect, $update);
     }
     $CurrentDateTime=date("Y-m-d H:i:s");
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='WarehouseRentalCalc'";
  mysqli_query($connect, $Qry);
  echo json_encode(array($response=>'success',"WarehouseRentalCalc"=>$rowArr));
}
else
{
    echo json_encode(array($response=>'ERROR',"Message"=>"NO RECORDS FOUND"));
}
?>
