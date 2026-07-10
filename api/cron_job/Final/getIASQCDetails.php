<?php
//exit();
error_reporting(1);
require_once(APIPATH . "/db_connection.php");
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
$URL="/var/www/purchasepro/foss/foss/";



if ($handle = opendir($URL)) {
  
  while (false !== ($SAP_DATA = readdir($handle))) {
    if ($SAP_DATA != "." && $SAP_DATA != "..") {
      if ($SAP_DATA != "archive") {
        $target_file = $URL . $SAP_DATA;
     
         $new_target_location = $URL."archive/" . $SAP_DATA;
      
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
              $AnalysisTime = mysqli_real_escape_string($connect, trim($data[0]));
              $ProductName = mysqli_real_escape_string($connect, trim($data[1]));
              $ProductCode = mysqli_real_escape_string($connect, trim($data[2]));
              $SampleType = mysqli_real_escape_string($connect, trim($data[3]));
              $SampleNumber = mysqli_real_escape_string($connect, trim($data[4]));
              $SampleComment = mysqli_real_escape_string($connect, trim($data[5]));
              $InstrumentName = mysqli_real_escape_string($connect, trim($data[6]));
              $InstrumentSerialNumber = mysqli_real_escape_string($connect, trim($data[7]));
              $Protein = mysqli_real_escape_string($connect, trim($data[8]));
              $Moisture = mysqli_real_escape_string($connect, trim($data[9]));
              //$Ash = mysqli_real_escape_string($connect, trim($data[10]));
              $TW = mysqli_real_escape_string($connect, trim($data[10]));
              //$wetgluten = mysqli_real_escape_string($connect, trim($data[12]));
              //$Drygluten = mysqli_real_escape_string($connect, trim($data[13]));
              //$SV = mysqli_real_escape_string($connect, trim($data[14]));
	           $VANumber = mysqli_real_escape_string($connect, trim($data[11]));
              $HL = mysqli_real_escape_string($connect, trim($data[12]));
              $InsertDamageWheat = mysqli_real_escape_string($connect, trim($data[13]));
              if ($ProductName == 'IAS _Wheat I') {
              $insert_query = "INSERT INTO `ias_qcdetails`(`AnalysisTime`, `ProductName`, `ProductCode`, 
              `SampleType`, `SampleNumber`, `SampleComment`, `InstrumentName`, `InstrumentSerialNumber`, `Protein`,`Moisture`,`HL`, `InsertDamageWheat`,`VANumber`) VALUES ('$AnalysisTime','$ProductName','$ProductCode','$SampleType','$SampleNumber',
               '$SampleComment','$InstrumentName','$InstrumentSerialNumber','$Protein','$Moisture','$TW','$InsertDamageWheat','$VANumber')";
              mysqli_query($connect, $insert_query);
              echo $insert_query;
              }
            }
            $skip++;
          }
        }
        //var_dump(rename($target_file, $new_target_location));
        if ($ProductName == 'IAS _Wheat I') {
        if (rename($target_file, $new_target_location))
          echo 'done';
       // unlink($target_file);
        else
          echo 'not done';
        //rename();
        }
      }
    }
  }
  closedir($handle);
  
  $CurrentDateTime=date("Y-m-d H:i:s");
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='sto_ias_QCDetails'";
  mysqli_query($connect, $Qry);

}
