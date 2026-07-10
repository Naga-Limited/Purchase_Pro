<?php
require_once(APIPATH . "/db_connection.php");
date_default_timezone_set("Asia/Calcutta");
//$date = date("YmdHis");
if ($handle = opendir("/home/nlsdp73/SAP/PP/quality/irs")) {

  while (false !== ($SAP_DATA = readdir($handle))) {
    if ($SAP_DATA != "." && $SAP_DATA != "..") {
      if ($SAP_DATA != "archive") {
        $target_file = "/home/nlsdp73/SAP/PP/quality/irs/" . $SAP_DATA;
        $new_target_location = "/home/nlsdp73/SAP/PP/quality/irs/archive/" . $SAP_DATA;
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
              $PoNumber = mysqli_real_escape_string($connect, trim($data[0]));
              $PoLineItem = mysqli_real_escape_string($connect, trim($data[1]));
              $DeliveryNo = mysqli_real_escape_string($connect, trim($data[2]));
              $DeliveryDate = mysqli_real_escape_string($connect, trim($data[3]));
              $DeliveryQuantity = mysqli_real_escape_string($connect, trim($data[4]));
              $UOM = mysqli_real_escape_string($connect, trim($data[5]));
              $MovementType = mysqli_real_escape_string($connect, trim($data[6]));
              $MaterialDocumentNumber = mysqli_real_escape_string($connect, trim($data[7]));
              $MaterialDocumentDate = mysqli_real_escape_string($connect, trim($data[8]));
              $SaleInvoiceNumber = mysqli_real_escape_string($connect, trim($data[9]));
              $SaleInvoiceDate = mysqli_real_escape_string($connect, trim($data[10]));
              $SisterConcernFrom = mysqli_real_escape_string($connect, trim($data[11]));
              $SendingStorageLocation = mysqli_real_escape_string($connect, trim($data[12]));
              $SisterConcernTo = mysqli_real_escape_string($connect, trim($data[13]));
              $ReceivingStorageLocation = mysqli_real_escape_string($connect, trim($data[14]));
              $MaterialNo = mysqli_real_escape_string($connect, trim($data[15]));
              $WheatVariety = mysqli_real_escape_string($connect, trim($data[16]));
              $StockSegment = mysqli_real_escape_string($connect, trim($data[17]));
              $insert_query = "insert into interstate_sap_to_pp(PoNumber,	PoLineItem,	DeliveryNo,	DeliveryDate,	DeliveryQuantity,	UOM,	MovementType,	MaterialDocumentNumber,	MaterialDocumentDate,	SaleInvoiceNumber,	SaleInvoiceDate,	SisterConcernFrom,	SendingStorageLocation,	SisterConcernTo,	ReceivingStorageLocation,	MaterialNo,	WheatVariety,	StockSegment) values('" . $PoNumber . "','" . $PoLineItem . "','" . $DeliveryNo . "','" . $DeliveryDate . "','" . $DeliveryQuantity . "','" . $UOM . "','" . $MovementType . "','" . $MaterialDocumentNumber . "','" . $MaterialDocumentDate . "','" . $SaleInvoiceNumber . "','" . $SaleInvoiceDate . "','" . $SisterConcernFrom . "','" . $SendingStorageLocation . "','" . $SisterConcernTo . "','" . $ReceivingStorageLocation . "','" . $MaterialNo . "','" . $WheatVariety . "','" . $StockSegment . "')";
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
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='get_irs_LastSyncDate'";
  mysqli_query($connect, $Qry);

}
