<?php
include_once APIPATH . "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
if ($handle = opendir("/home/purpro/SAP/PP/ias/pickslip_details")) {

    while (false !== ($SAP_DATA = readdir($handle))) {
        if ($SAP_DATA != "." && $SAP_DATA != "..") {
            if ($SAP_DATA != "archive") {
                $target_file = '/home/purpro/SAP/PP/ias/pickslip_details/' . $SAP_DATA;
                $new_target_location = "/home/purpro/SAP/PP/ias/pickslip_details/archive/" . $SAP_DATA;
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
                            $PickSlipNo = mysqli_real_escape_string($connect, trim($data[0]));
                            $PickSlipQty = mysqli_real_escape_string($connect, trim($data[1]));
                            $SendingPlant = mysqli_real_escape_string($connect, trim($data[2]));
                            $SendingStorageLocation = mysqli_real_escape_string($connect, trim($data[3]));
                            $MaterialNo = mysqli_real_escape_string($connect, trim($data[4]));
                            $Segment = mysqli_real_escape_string($connect, trim($data[5]));
                            $WheatVariety = mysqli_real_escape_string($connect, trim($data[6]));
                            $ReceivingPlant = mysqli_real_escape_string($connect, trim($data[7]));
                            $ReceivingStorageLoc = mysqli_real_escape_string($connect, trim($data[8]));
                            $StoPoNo = mysqli_real_escape_string($connect, trim($data[9]));
                            $DeliveryNo = mysqli_real_escape_string($connect, trim($data[10]));
                            $DeliveryDate = mysqli_real_escape_string($connect, trim($data[11]));
                            $WbEmptyWt = mysqli_real_escape_string($connect, trim($data[12]));
                            $WbLoadWt = mysqli_real_escape_string($connect, trim($data[13]));
                            $WbNetWt = mysqli_real_escape_string($connect, trim($data[14]));
                            $GunnyWt = mysqli_real_escape_string($connect, trim($data[15]));
                            $GunnyLessNetWt = mysqli_real_escape_string($connect, trim($data[16]));
                            //$BagType = mysqli_real_escape_string($connect, trim($data[17]));
                           // $BagTypes=trim($data[18]).','.trim($data[20]).','.trim($data[22]);
                             $no_bags = mysqli_real_escape_string($connect, trim($data[17]));
                            $BagType = mysqli_real_escape_string($connect, trim($data[18]));
                            $no_bags2 = mysqli_real_escape_string($connect, trim($data[19]));
                            $BagType2 = mysqli_real_escape_string($connect,trim($data[20]));
                            $no_bags3 = mysqli_real_escape_string($connect, trim($data[21]));
                            $BagType3 = mysqli_real_escape_string($connect, trim($data[22]));

                            
                            
                            

                            //$po_landing_date = date('Y-m-d',strtotime($data[18]));

                            $insert_query = "insert into intrastate_sap_to_pp(PickSlipNo,	PickSlipQty,	SendingPlant,	SendingStorageLocation,	MaterialNo,	Segment,	WheatVariety,	ReceivingPlant,	ReceivingStorageLoc,	StoPoNo,	DeliveryNo,	DeliveryDate,	WbEmptyWt,	WbLoadWt,	WbNetWt,	GunnyWt,	GunnyLessNetWt,	BagType,BagType2,BagType3,no_bags,no_bags2,no_bags3) values('" . $PickSlipNo . "',	'" . $PickSlipQty . "',	'" . $SendingPlant . "',	'" . $SendingStorageLocation . "',	'" . $MaterialNo . "',	'" . $Segment . "',	'" . $WheatVariety . "',	'" . $ReceivingPlant . "',	'" . $ReceivingStorageLoc . "',	'" . $StoPoNo . "',	'" . $DeliveryNo . "',	'" . $DeliveryDate . "',	'" . $WbEmptyWt . "',	'" . $WbLoadWt . "',	'" . $WbNetWt . "',	'" . $GunnyWt . "',	'" . $GunnyLessNetWt . "',	'" . $BagType . "','".$BagType2."','".$BagType3."','".$no_bags."','".$no_bags2."','".$no_bags3."')";
                            mysqli_query($connect, $insert_query);
                            echo $insert_query;
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
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='pickslip_details_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
