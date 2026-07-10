<?php

include_once APIPATH . "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
//$enclosure = '"';
$output_csv = "SELECT * FROM view_ias_vehicles WHERE IsUpdated = 0";
//echo $output_csv;
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
    $fp = fopen('/home/nlsdp73/SAP/PP/quality/ias_vehicles/' . $date . 'ias_vehicles.csv', 'w');
    $output = array('ZvaNumber',    'ReceivingPlantId',    'VehicleNo',    'SendingPlant',    'WheatVariety',    'SupplierName');
    fputcsv($fp, $output);
    while ($row = mysqli_fetch_array($result)) {
        $test = array(trim($row['ZvaNumber']),    trim($row['ReceivingPlantId']),    trim($row['VehicleNo']),    trim($row['SendingPlant']),    trim($row['WheatVariety']),    trim($row['SupplierName']));
        fputcsv($fp, $test, ",", " ");
        $REF_ID = $row['IdToUpdate'];
        if ($row['FromTable'] == "pi") {
            $update = "UPDATE purchase_info SET IsUpdated = '1' WHERE PI_REFID = $REF_ID";
            echo $update;
            mysqli_query($connect, $update);
        } elseif ($row['FromTable'] == "eva") {
            $update = "UPDATE empty_vehicle_arrival SET IsUpdated = '1' WHERE ID = $REF_ID";
            echo $update;
            mysqli_query($connect, $update);
        }
    }
    fclose($fp);

    $CurrentDateTime=date("Y-m-d H:i:s");


  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='ias_report_vehicle_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
