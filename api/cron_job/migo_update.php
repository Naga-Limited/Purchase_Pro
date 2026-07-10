<?php
include_once APIPATH. "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
if ($handle = opendir("/home/nlsdp73/SAP/PP/migo")) {
  while (false !== ($SAP_DATA = readdir($handle))) {
    if ($SAP_DATA != "." && $SAP_DATA != "..") {
      $target_file = "/home/nlsdp73/SAP/PP/migo/" . $SAP_DATA;
      $new_target_location = "/home/nlsdp73/SAP/PP/migo/archive/" . $SAP_DATA;
      echo $target_file;
      $fileexists = 0;
      if (file_exists($target_file)) {
        $fileexists = 1;
      }
      if ($fileexists == 1) {
        // Reading file
        $file = fopen($target_file, "r");
        echo $file;
        $i = 0;

        $importData_arr = [];

        while (($data = fgetcsv($file, 1000, ",")) !== false) {
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
            $ZVA_NUMBER = trim(str_replace("\\0", "", $data[0]));
            $MIGO_NUM = trim(str_replace("\\0", "", $data[4]));
            echo $ZVA_NUMBER;
            //echo trim($data[0]);
            //$new = trim(str_replace("\\0", "", $data[0]));
            //$new1=str_replace("\", "", $new);
            //echo $new;
            $update_migo = "UPDATE purchase_info SET MIGO_NUM = '$MIGO_NUM' WHERE ZVA_NUMBER = '$ZVA_NUMBER'";
            $result = mysqli_query($connect, $update_migo);
            echo $update_migo;
          }
          $skip++;
        }
        rename($target_file, $new_target_location);
      }
    }
  }
  closedir($handle);

  $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='migo_update_LastSyncDate'";
  mysqli_query($connect, $Qry);
}
