<?php
include_once APIPATH . "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
if ($handle = opendir("/var/www/purchasepro/sapfileshare/silo_to_mill/openstopo")) {

    while (false !== ($SAP_DATA = readdir($handle))) {
        if ($SAP_DATA != "." && $SAP_DATA != "..") {
            if ($SAP_DATA != "archive") {
                $target_file = '/var/www/purchasepro/sapfileshare/silo_to_mill/openstopo/' . $SAP_DATA;
                $new_target_location = "/var/www/purchasepro/sapfileshare/silo_to_mill/openstopo/archive/" . $SAP_DATA;
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
echo "1";
                    foreach ($importData_arr as $data) {
                        echo "2";
                        if ($skip != 0) {
                            echo "3";
                            $Po_Number = $data[0];
                            $Po_Line_Item = $data[1];
                            $wheat_variety = $data[2];
                            $plant = $data[3];
                            $storage_location = $data[4];
                            $po_quantity = $data[5];
                            $order_unit = $data[6];
                            $Material_code = $data[7];
                            $supplying_unit = $data[8];
                            $Update_flag = $data[9];
                            if ($plant == "1010" && $supplying_unit == "1111"){
                                                   $insert_query = "insert into pp_silotomillpoline(PONumber,LineItem,WheatVariety,StorageLocation,ReceivingPlant,SendingPlant,SendingLocation,Segment) values('" . $Po_Number . "','" . $Po_Line_Item . "','" . $wheat_variety . "','" . $storage_location . "','" . $plant . "','" . $supplying_unit . "','" . $storage_location . "','" . $Material_code . "')";
                            mysqli_query($connect, $insert_query);
                            //echo $insert_query;
                            echo "4";
                        }
                        }
                        else

                        {
                            echo "5";
                                // file_put_contents('error.txt',var_export(mysqli_error($connect),true));
                        
                                // file_put_contents('error1.txt',var_export('test',true));
                            
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
