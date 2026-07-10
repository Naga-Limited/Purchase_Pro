<?php
require_once(APIPATH . "/db_connection.php");
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
if ($handle = opendir("/home/purpro/SAP/PP/silo_to_mill/sap_pp_deliveryno")) {

  while (false !== ($SAP_DATA = readdir($handle))) {
    if ($SAP_DATA != "." && $SAP_DATA != "..") {
      if ($SAP_DATA != "archive") {
        $target_file = "/home/purpro/SAP/PP/silo_to_mill/sap_pp_deliveryno/" . $SAP_DATA;
        $new_target_location = "/home/purpro/SAP/PP/silo_to_mill/sap_pp_deliveryno/archive/" . $SAP_DATA;
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
              $VaNumber = mysqli_real_escape_string($connect, trim($data[0]));
	      $Q1 = mysqli_real_escape_string($connect, trim($data[1]));
 		$Q2 = mysqli_real_escape_string($connect, trim($data[2]));
            
              $DeliveryNo = mysqli_real_escape_string($connect, trim($data[3]));
              $DeliveryDate = mysqli_real_escape_string($connect, trim($data[4]));
              $Eway = substr($DeliveryDate,8,20);
              
              //$DeliveryDate=date(strtotime($DeliveryDate,));
          
              $a = date("Y-m-d h:i:s");
              $insert_query = "UPDATE `silotomill_dispatch_info` set `DeliveryNo`='$DeliveryNo' where VANumber='$VaNumber'";

// and  
              mysqli_query($connect, $insert_query);
              echo $insert_query;
            }
            $skip++;
          }
        }
        if (rename($target_file, $new_target_location))
          echo 'done';
        //unlink($target_file);
        else
          echo 'not done';
        //rename();
      }
    }
  }
  closedir($handle);
  
  $CurrentDateTime=date("Y-m-d H:i:s");
 // $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='get_irs_LastSyncDate'";
  //mysqli_query($connect, $Qry);

}
