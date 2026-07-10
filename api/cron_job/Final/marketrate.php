<?php

include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");

//$enclosure = '"';
//$output_csv = "SELECT * FROM view_mrc_wheat_price_entry WHERE 'Update' = 0";
$output_csv = "SELECT * FROM `view_mrc_wheat_price_entry` WHERE `Update`=0";

$result = mysqli_query($connect, $output_csv);
if($result) {
	
}
else {
	echo "<br>";
	$test = mysqli_error($connect);
	echo $test;
}

if (mysqli_num_rows($result) > 0) {
   
   $fp = fopen('/var/www/purchaseprouat/sapfileshare/m2m/' . $date . 'pp_marketrate.csv', 'w');


   $output = array('Id',	'WheatVariety',    'RatePerTon',    'DateAdded',    'DateModified',    'SupplierName',    '	SupplierCategory',    'LoadingDescription',    'DeliveryAt',    'ModeOfTransfer',    'State',    'Zone',    'City',    'SeedVariety','Segment','BagName','BagCode');
    fputcsv($fp, $output);
    while ($row = mysqli_fetch_array($result)) {
        $PI_REFID = $row['Id'];
       $test = array(trim($row['Id']),	trim($row['WheatVariety']),    trim($row['RatePerTon']),    trim($row['DateAdded']),    trim($row['DateModified']),    trim($row['SupplierName']),    trim($row['SupplierCategory']),    trim($row['LoadingDescription']),    trim($row['DeliveryAt']),    trim($row['ModeOfTransfer']),    trim($row['State']),    trim($row['Zone']),    trim($row['City']),trim($row['SeedVariety']),trim($row['Segment']),trim($row['BagName']), trim($row['BagCode']));
       echo "<pre>";   
       print_r($row);
    // echo "22";
        fputcsv($fp, $test, ",", " ");
         $update_qry = "UPDATE mrc_wheat_price_entry SET `Update` = '1' WHERE `Id` = $PI_REFID";
        mysqli_query($connect, $update_qry);
            // echo "$Id<br>";
            // file_put_contents('error2.txt',var_export(mysqli_error($connect),true));
            // // echo "22<br>";
    //         // $test = mysqli_error($connect);
	// echo $test."<br>";
    //     } else {
    //         file_put_contents('error1.txt',var_export('test',true));
    //     }
    }
    fclose($fp);
    
    echo $fname;
    $CurrentDateTime=date("Y-m-d H:i:s");

}
else
{
	echo "<br>...NO RECORDS FOUND...";
}
