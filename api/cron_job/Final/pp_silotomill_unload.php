<?php

include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
//$enclosure = '"';
$output_csv = "SELECT * FROM pp_silotomill_unload WHERE IsUpdated = 0";

$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
   $fp = fopen('/var/www/purchasepro/sapfileshare/silo_to_mill/pp_sap_migo_data/' . $date . 'pp_sap_migo_data.csv', 'w');

  //$fname = getcwd().'/CSV/' . $date . 'pp_to_sap_silotomill_unload.csv';
    //$fp = fopen($fname, 'w');

   $output = array('ZVA_NUMBER',    'TRUCK_NO',    'DRIVER_NO',    'ZPO_NUMBER',    'PO_LINE_ITEM',    'WheatVariety',    'StorageLocation',    'ReceivingPlant',    'ReceivingBin',    'BulkSiloNo',    'FirstWeight',    'SecondWeight',    'NetWeight','Rec GateIn','Rec Gateout','sendGateOut');
    fputcsv($fp, $output);
    while ($row = mysqli_fetch_array($result)) {
        $PI_REFID = $row['PI_REFID'];
       $test = array(trim($row['ZVA_NUMBER']),    trim($row['TRUCK_NO']),    trim($row['DRIVER_NO']),    trim($row['ZPO_NUMBER']),    trim($row['PO_LINE_ITEM']),    trim($row['WheatVariety']),    trim($row['StorageLocation']),    trim($row['ReceivingPlant']),    trim($row['ReceivingBin']),    trim($row['BulkSiloNo']),    trim($row['FirstWeight']),    trim($row['SecondWeight']),trim($row['NetWeight']),trim($row['recvGateIn']),trim($row['recvGateOut']), trim($row['sendGateOut']));
          print_r($row);
//var_dump($test);
        fputcsv($fp, $test, ",", " ");

        $update = "UPDATE purchase_info SET IsUpdated = '1' WHERE PI_REFID = $PI_REFID";
        mysqli_query($connect, $update);
    }
    fclose($fp);
    echo $fname;
    $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='silotomill_unload_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
else
{
	echo "<br>...NO RECORDS FOUND...";
}
