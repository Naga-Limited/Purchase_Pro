<?php
//exit();
error_reporting(1);
require_once(APIPATH . "/db_connection.php");
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
$URL="E:\\Foresight\\PurchasePro\\api\\cron_job\\Foresight\\Purchase\\";



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
              $Ash = mysqli_real_escape_string($connect, trim($data[10]));
              $Wetgludten = mysqli_real_escape_string($connect, trim($data[11]));
              $Drygluten = mysqli_real_escape_string($connect, trim($data[12]));
            
            

              $SV = mysqli_real_escape_string($connect, trim($data[13]));
              $VANumber = mysqli_real_escape_string($connect, trim($data[14]));

              $Infestation = mysqli_real_escape_string($connect, trim($data[15]));
              $fungus = mysqli_real_escape_string($connect, trim($data[16]));
              $RainDamage = mysqli_real_escape_string($connect, trim($data[17]));
              $MixedWheat = mysqli_real_escape_string($connect, trim($data[18]));
              $ProteinType = mysqli_real_escape_string($connect, trim($data[19]));
              $HLWeight = mysqli_real_escape_string($connect, trim($data[20]));
              $Kernal1000 = mysqli_real_escape_string($connect, trim($data[21]));
              $FN = mysqli_real_escape_string($connect, trim($data[22]));
              $MM2_3 = mysqli_real_escape_string($connect, trim($data[23]));
              $ForeignMatter = mysqli_real_escape_string($connect, trim($data[24]));
              $Mudballs = mysqli_real_escape_string($connect, trim($data[25]));
              $BrokenWheat = mysqli_real_escape_string($connect, trim($data[26]));
              $BlackWheat = mysqli_real_escape_string($connect, trim($data[27]));
              $SoftWheat = mysqli_real_escape_string($connect, trim($data[28]));
              $ShriveledWheat = mysqli_real_escape_string($connect, trim($data[29]));
            
              $ImmatureWheat = mysqli_real_escape_string($connect, trim($data[30]));
              $InsectDamageWheat = mysqli_real_escape_string($connect, trim($data[31]));
              $KernelBunt = mysqli_real_escape_string($connect, trim($data[32]));
              $RedGrain = mysqli_real_escape_string($connect, trim($data[33]));

             $OFG = mysqli_real_escape_string($connect, trim($data[34]));
 $insert_query = "INSERT INTO `stm_silotomillqcdet`( `AnalysisTime`,
               `ProductName`,`ProductCode`, `SampleType`, `SampleNumber`, `SampleComment`, `InstrumentName`,
                `InstrumentSerialNumber`,
               `Protein`, `Moisture`,  `Ash`,`Wetgluten`, `Drygluten`,`SV`,`VANumber`,`Infestation`,`fungus`, 
               `RainDamage`, `MixedWheat`, `ProteinType`, 
                `HLWeight`,`1000Kernel`, `FN`, `2_3_MM`, `ForeignMatter`, 
               `MudBalls`, `BrokenWheat`, `BlackWheat`, `SoftWheat`, 
               `ShriveledWheat`, `ImmatureWheat`, `InsectDamageWheat`, `KernalBunt`, `RainGrain`, `OFG`
                 ) VALUES ('$AnalysisTime','$ProductName','$ProductCode','$SampleType','$SampleNumber','$SampleComment',
                 '$InstrumentName','$InstrumentSerialNumber','$Protein','$Moisture','$Ash','$Wetgludten',
                 '$Drygluten','$SV','$VANumber','$Infestation','$fungus','$RainDamage','$MixedWheat','$ProteinType',
                 '$HLWeight','$Kernal1000','$FN','$MM2_3','$ForeignMatter','$Mudballs','$BrokenWheat','$BlackWheat',
                 '$SoftWheat','$ShriveledWheat','$ImmatureWheat','$InsectDamageWheat','$KernelBunt','$RedGrain','$OFG')";
              mysqli_query($connect, $insert_query);
              echo $insert_query;
            }
            $skip++;
          }
        }
        //var_dump(rename($target_file, $new_target_location));
       
        if (rename($target_file, $new_target_location))
          echo 'done';
       // unlink($target_file);
        else
          echo 'not done';
        //rename();
        
      }
    }
  }
  closedir($handle);
  
  $CurrentDateTime=date("Y-m-d H:i:s");
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='QCDetails'";
  mysqli_query($connect, $Qry);

}
