<?php
include_once APIPATH . "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
if ($handle = opendir("/home/nlsdp73/SAP/PP/quality/weighbridge_to_pp")) {

    while (false !== ($SAP_DATA = readdir($handle))) {
        if ($SAP_DATA != "." && $SAP_DATA != "..") {
            if ($SAP_DATA != "archive") {
                $target_file = '/home/nlsdp73/SAP/PP/quality/weighbridge_to_pp/' . $SAP_DATA;
                $new_target_location = "/home/nlsdp73/SAP/PP/quality/weighbridge_to_pp/archive/" . $SAP_DATA;
                //echo $new_target_location;
                $File_Name = substr_replace($SAP_DATA, "", -4);
                $fileexists = 0;
                if (file_exists($target_file)) {
                    $fileexists = 1;
                }
                if ($fileexists == 1) {

                    // Reading file
                    $file = fopen($target_file, "r");
                    $i = 0;

                    $importData_arr = array();

                    while (($data = fgetcsv($file, 1000, ",")) !== FALSE) {
                        $num = count($data);

                        for ($c = 0; $c < $num; $c++) {
                            $importData_arr[$i][] = mysqli_real_escape_string($connect, $data[$c]);
                        }
                        $i++;
                    }
                    fclose($file);

                    $skip = 0;
                    // insert import data

                    foreach ($importData_arr as $data) {
                        if ($skip != 0) {
                            $SVoucher_No = $data[0];
                            $First_Weight = $data[1];
                            $second_Weight = $data[2];
                            $net_Weight = $data[3];
                            $insert_query = "insert into silo_wb(SVoucher_No ,First_Weight,Second_Weight,Net_Weight) values('" . $SVoucher_No . "','" . $First_Weight . "','" . $second_Weight . "','" . $net_Weight . "')";
                            mysqli_query($connect, $insert_query);
                            //echo $insert_query;
                        }
                        $skip++;
                    }
                }
                if (rename($target_file, $new_target_location))
                    echo 'File Move done';
                //unlink($target_file);
                else
                    echo 'File Move not done';
                //unlink($target_file);
                //rename();
            }
        }
    }
    closedir($handle);
    $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='get_wb_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
