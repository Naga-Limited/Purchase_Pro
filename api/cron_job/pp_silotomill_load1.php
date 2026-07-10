<?php

include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
//$enclosure = '"';
$output_csv = "SELECT * FROM pp_silotomill_load WHERE IsUpdated = 0";
echo $output_csv;
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
    $fp = fopen('/home/nlfd/SAP/silo_to_mill/1/' . $date . 'pp_sap_delivery_data.csv', 'w');
//$fp = fopen('E:\\Foresight\\PurchasePro\\api\\cron_job\\Foresight\\' . $date . 'silo_to_mill_load.csv', 'w');
//$fname = getcwd().'/CSV/' . $date . 'pp_to_sap_silotomill_load.csv';
//$fp = fopen($fname, 'w');

   $output = array('ZVA_NUMBER', 'DRIVER_NO',    'TRUCK_NO',    'PLANT_NAME', 'STORAGE LOCATION',   'ZPO_NUMBER',    'PO_LINE_ITEM','WheatVariety','ReceivingBin','BulkSiloNo','Moisture','HLWeight','FM','Dust','BadSmell','Infestation','SeiveSize','Wetgluten','Drygluten','Protein','FirstWeight','SecondWeight','NetWeight','GateIN','GateOut', 'tripsheet_no', 'driver_name');
    fputcsv($fp, $output);
    while ($row = mysqli_fetch_array($result)) {
        $ID = $row['ID'];
      $test = array(trim($row['ZVA_NUMBER']),    trim($row['DRIVER_NO']),    trim($row['TRUCK_NO']),    trim($row['PLANT_NAME']),  trim($row['StorageLocation']),    trim($row['ZPO_NUMBER']),    trim($row['PO_LINE_ITEM']),    trim($row['WheatVariety']),    trim($row['ReceivingBin']),    trim($row['BulkSiloNo']),    trim($row['Moisture']),    trim($row['HLWeight']),    trim($row['FM']),    trim($row['Dust']),    trim($row['BadSmell']),    trim($row['Infestation']),    trim($row['SeiveSize']),    trim($row['Wetgluten']),    trim($row['Drygluten']),    trim($row['Protein']),    trim($row['FirstWeight']),    trim($row['SecondWeight']),    trim($row['NetWeight']),trim($row['GateIn']),trim($row['GateOutDt'],trim($row['tripsheet_no']),trim($row['driver_name']));
     
        fputcsv($fp, $test, ",", " ");1

        $update = "UPDATE empty_vehicle_arrival SET IsUpdated = '1' WHERE ID = $ID";
        mysqli_query($connect, $update);
    }
    fclose($fp);
    echo $fname;
    $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='silotomill_load_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
else
{
	echo "<br>...NO RECORDS FOUND...";
}
