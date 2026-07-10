<?php

include_once APIPATH . "/db_connection.php";
include_once APIPATH . '/helper/fileHelper.php';

$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("dmY");

$output_csv = "SELECT 
                    mr.marketrate_id AS Id,
                    mr.SupplierId AS SupplierId,
                    mr.WheatVarietyId AS WheatVarietyId,
                    mr.ModeOfTransportId AS ModeOfTransportId,
                    mr.DeliveryAtId AS DeliveryAtId,
                    mr.RatePerTon AS RatePerTon,
                    mr.Is_Deleted AS IsDeleted,
                    mr.DateAdded AS DateAdded,
                    mr.updated_at AS DateModified,
                    mr.created_by AS AddedBy,
                    mr.updated_by AS ModifiedBy,
                    wv.Segment AS Segment,
                    wv.WheatVariety AS WheatVariety,
                    wv.State AS State,
                    wv.Zone AS Zone,
                    wv.City AS City,
                    wv.loading_location AS LoadingDescription,
                    wv.SeedVariety AS SeedVariety,
                    s.Category AS SupplierCategory,
                    s.Name AS SupplierName,
                    mot.Name AS ModeOfTransfer,
                    da.Name AS DeliveryAt
                FROM market_rate_details mr
                LEFT JOIN wheat_variety_master wv ON wv.wheat_variety_Id = mr.WheatVarietyId
                LEFT JOIN master_mrc_supplier s ON s.Id = mr.SupplierId
                LEFT JOIN master_mrc_mode_of_transport mot ON mot.Id = mr.ModeOfTransportId
                LEFT JOIN master_mrc_delivery_at da ON da.Id = mr.DeliveryAtId

                WHERE mr.Is_Deleted = 0 AND mr.Is_Update = 0";
//print_r($output_csv);exit;
$result = mysqli_query($connect, $output_csv);

if ($result) {
    // Success
} else {
    echo "<br>";
    $test = mysqli_error($connect);
    echo $test;
}

//if (mysqli_num_rows($result) > 0) {

    $server_path = '/var/www/purchasepro/pms/Marketrate/' . $date . '_pp_marketrate.csv';
    $fp = fopen($server_path, 'w');
    //print_r($server_path);exit;
    $output = array(
        'Id', 'WheatVariety', 'RatePerTon', 'DateAdded', 'DateModified', 'SupplierName', 'SupplierCategory',
        'LoadingDescription', 'DeliveryAt', 'ModeOfTransfer', 'State', 'Zone', 'City', 'SeedVariety', 'Segment'
    );
    fputcsv($fp, $output);

    while ($row = mysqli_fetch_array($result)) {
        $PI_REFID = $row['Id'];
        $test = array(
            trim($row['Id']), trim($row['WheatVariety']), trim($row['RatePerTon']), trim($row['DateAdded']),
            trim($row['DateModified']), trim($row['SupplierName']), trim($row['SupplierCategory']),
            trim($row['LoadingDescription']), trim($row['DeliveryAt']), trim($row['ModeOfTransfer']),
            trim($row['State']), trim($row['Zone']), trim($row['City']), trim($row['SeedVariety']),
            trim($row['Segment'])
        );

        echo "<pre>";
        print_r($row);

        fputcsv($fp, $test, ",", " ");
        
        $update_qry = "UPDATE market_rate_details SET Is_Update = '1' WHERE marketrate_id = $PI_REFID";
        mysqli_query($connect, $update_qry);
    }
    fclose($fp);

    $CurrentDateTime = date("Y-m-d H:i:s");

//} else {
   // echo "<br>...NO RECORDS FOUND...";
//}
