<?php
require_once(APIPATH . "/db_connection.php");
if ($handle = opendir("/var/www/purchasepro/sapfileshare/openpos")) {
  while (false !== ($SAP_DATA = readdir($handle))) {
    if ($SAP_DATA != "." && $SAP_DATA != "..") {
      if ($SAP_DATA != "archive") {
        $target_file = "/var/www/purchasepro/sapfileshare/openpos/" . $SAP_DATA;
        $new_target_location = "/var/www/purchasepro/sapfileshare/openpos/archive/" . $SAP_DATA;
        //echo $target_file;exit;
        $fileexists = 0;
        if (file_exists($target_file)) {
          $fileexists = 1;
        }
        if ($fileexists == 1) {

          // Reading file
          $file = fopen($target_file, "r");
          //echo $file;
          $i = 0;

          $importData_arr = array();

          while (($data = fgetcsv($file, 1000, ",")) !== FALSE) {
            $num = count($data);

            for ($c = 0; $c < $num; $c++) {
              $importData_arr[$i][] = mysqli_real_escape_string($connect, $data[$c]);
            }
            $i++;
          }


          $skip = 0;
          // insert import data
          foreach ($importData_arr as $data) {
            if ($skip != 0) {
              $po_number = mysqli_real_escape_string($connect, trim($data[0]));
              $po_line = mysqli_real_escape_string($connect, trim($data[1]));
              $vendor_code = mysqli_real_escape_string($connect, trim($data[2]));
              $vendor_name = mysqli_real_escape_string($connect, trim($data[3]));
              $sup_code = mysqli_real_escape_string($connect, trim($data[4]));
              $sup_name = mysqli_real_escape_string($connect, trim($data[5]));
              $sup_qty = mysqli_real_escape_string($connect, trim($data[6]));
              $unit_measu = mysqli_real_escape_string($connect, trim($data[7]));
              $wheat_varty = mysqli_real_escape_string($connect, trim($data[8]));
              $material_code = mysqli_real_escape_string($connect, trim($data[9]));
              $stock_seg = mysqli_real_escape_string($connect, trim($data[10]));
              $po_rate = mysqli_real_escape_string($connect, trim($data[11]));
              $plant = mysqli_real_escape_string($connect, trim($data[12]));
              $storage_loc = mysqli_real_escape_string($connect, trim($data[13]));
              $po_del_flag = mysqli_real_escape_string($connect, trim($data[14]));
              $pp_update = mysqli_real_escape_string($connect, trim($data[15]));
              $ico_terms = mysqli_real_escape_string($connect, trim($data[16]));
              $po_type = mysqli_real_escape_string($connect, trim($data[17]));
              //$po_landing_date = date('Y-m-d',strtotime($data[18]));
              $po_landing_date = mysqli_real_escape_string($connect, trim($data[18]));
              $noof_vehicle = mysqli_real_escape_string($connect, trim($data[19]));
              $pur_group = mysqli_real_escape_string($connect, trim($data[20]));
              $pur_group_desc = mysqli_real_escape_string($connect, trim($data[21]));
              $po_bag_type = mysqli_real_escape_string($connect, trim($data[22]));

              if ($pp_update != 'N') {
                $sqlInsert = "UPDATE sap_to_pp 
            SET `BROCKER_CODE` =  '$vendor_code',
             `BROCKER_NAME` =  '$vendor_name', 
             `MENGE` =  '$sup_qty',
             `MEINS` =  '$unit_measu',
             `IDNLF` =  '$wheat_varty',
             `MATNR` =  '$material_code',
             `SGT_SCAT` =  '$stock_seg',
             `NETPR` = '$po_rate',
             `WERKS` =  '$plant',
             `LGORT` =  '$storage_loc',
             `LOEKZ` =  '$po_del_flag',
             `ZUPDATE` =  '$pp_update',
             `INCO1` =  '$ico_terms',
             `BSART` =  '$po_type',
             `PO_Loading_Date` =  '$po_landing_date',
             `Number_of_vehicles` =  '$noof_vehicle',
             `PURCHASE_ORG` =  '$pur_group',
             `PURCHASE_ORG_DESC` =  '$pur_group_desc',
             `PO_Bag_Type` =  '$po_bag_type'";



                echo $sqlInsert .= " WHERE `EBELN` = '$po_number' AND `EBELP` = '$po_line' AND `SUPPLIER_CODE` = '$sup_code'";
                $result = mysqli_query($connect, $sqlInsert);
                echo $sqlInsert;
              } elseif ($po_del_flag != 'N') {
                $delete_sql = "DELETE FROM sap_to_pp WHERE `EBELN` = '$po_number' AND `EBELP` = '$po_line' AND `SUPPLIER_CODE` = '$sup_code'";
                $result = mysqli_query($connect, $delete_sql);
                echo $delete_sql;
              } else {
                $sqlInsert = "INSERT INTO sap_to_pp (`EBELN`, `EBELP`, `BROCKER_CODE`, `BROCKER_NAME`, `SUPPLIER_CODE`, `SUPPLIER_NAME`, `MENGE`, `MEINS`, `IDNLF`, `MATNR`, `SGT_SCAT`, `NETPR`, `WERKS`, `LGORT`, `LOEKZ`, `ZUPDATE`, `INCO1`, `BSART`,`PO_Loading_Date`,`Number_of_vehicles`,`PURCHASE_ORG`,`PURCHASE_ORG_DESC`,`PO_Bag_Type`) VALUES ('$po_number','$po_line','$vendor_code','$vendor_name','$sup_code','$sup_name','$sup_qty','$unit_measu','$wheat_varty','$material_code','$stock_seg','$po_rate','$plant','$storage_loc','$po_del_flag','$pp_update','$ico_terms','$po_type','$po_landing_date','$noof_vehicle','$pur_group','$pur_group_desc','$po_bag_type')";
                $result = mysqli_query($connect, $sqlInsert);
                echo $sqlInsert;
                if (!$result) {
                  $result = mysqli_error($connect);
                }
              }
            }
            $skip++;
          }
          rename($target_file, $new_target_location);
          fclose($file);
        }
      }
    }
  }
  closedir($handle);
}
