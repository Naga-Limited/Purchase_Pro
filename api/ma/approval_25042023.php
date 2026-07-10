<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set("Asia/Calcutta");
$entityMAContent = json_decode(file_get_contents("php://input"));
$formType = isset($entityMAContent->formType) ? $entityMAContent->formType : "";
if ($formType === "PO") {
  echo fetchPODetailsById($connect, $entityMAContent);
} elseif ($formType === "U") {
  echo updateGateOutInfo($connect, $entityMAContent);
} elseif ($formType === "A") {
  echo approvePo($connect, $entityMAContent);
}
$connect->close();

function fetchPODetailsById($connect, $record)
{
  $pofields = [
    "PI_REFID",
    "ZPO_NUMBER",
    "ZVENDOR_NAME",
    "IDNLF",
    "NETPR",
    "PLANT_NAME",
    "STORAGE_LOCATION",
    "MATNR",
    "INCO_DESC",
    "SCREEN_TYPE",
    "VEHICLE_TYPE",
    "CONTAINER_NO"
  ];
  $gofields = [
    "TRUCK_NO",
    "ZSUPPLIER_NAME",
    "ZSUPPLIER_CODE",
    "VECHICAL_STATUS",
    "ZVA_NUMBER",
    "wb_name",
    "wb_serial_no",
    "wb_load_wt",
    "is_own_wb",
    "wb_ticket_no",
    "no_bags",
    "no_bags2",
    "no_bags3",
    "wb_empty_wt",
    "wb_net_wt",
    "gunny_wt",
    "gunny_less_wt",
    "supplier_wb_dt",
    "supplier_wb_qty",
    "invoice_rate",
    "invoice_no",
    "invoice_qty",
    "supp_inv_copy",
    "supp_wb_copy",
    "naga_os_wb_copy",
    "bag_type",
    "bag_type2",
    "bag_type3",
    "PO_LINE_ITEM",
  ];

  /*$fetchsql =
    "select bm.BAG_NAME as BAG_NAME, bm.WEIGHT as WEIGHT, pbm.BAG_NAME as POBAG_NAME, " .
    join(",", $pofields) .
    "," .
    join(",", $gofields) .
    " from purchase_info pi
    LEFT Join master_storage msi ON msi.LGORT = pi.LGORT LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS LEFT Join master_inco ON INCO1 = INCO_TERMS , gateout_info, master_bag bm,  master_bag pbm where PI_REFID ='"  .
    $record->id .
    "' and purchase_info_id = PI_REFID and bag_type = bm.BAG_CODE and PO_BAG_TYPE = pbm.BAG_CODE LIMIT 1";*/
    //Brindha Commented

    $fetchsql =
    "select  pbm.BAG_NAME as POBAG_NAME, " .
    join(",", $pofields) .
    "," .
    join(",", $gofields) .
    " from purchase_info pi
    LEFT Join master_storage msi ON msi.LGORT = pi.LGORT LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS LEFT Join master_inco ON INCO1 = INCO_TERMS , gateout_info, master_bag bm,  master_bag pbm where PI_REFID ='"  .
    $record->id .
    "' and purchase_info_id = PI_REFID and PO_BAG_TYPE = pbm.BAG_CODE LIMIT 1";
  //echo $fetchsql;
  //exit();
  $poDatas = mysqli_query($connect, $fetchsql);
  if (mysqli_num_rows($poDatas) > 0) {
    $i = 0;
    $poData = [];
    $formData = [];
    while ($row = mysqli_fetch_assoc($poDatas)) {
      foreach ($pofields as $pfield) {
        $poData[$i][$pfield] = $row[$pfield];
      }
      //Brindha added -END
      $Bagtype=$row["bag_type"];
      $Bagtype2=$row["bag_type2"];
      $Bagtype3=$row["bag_type3"];
      
     
          $Qry="SELECT BAG_NAME,WEIGHT FROM `master_bag` where BAG_CODE='$Bagtype'";
          $SBtype=mysqli_query($connect, $Qry);
          $FBtype=mysqli_fetch_assoc($SBtype);
          $BagNames=$FBtype['BAG_NAME'];
          $BagWeights=$FBtype['WEIGHT'];

          $Qry="SELECT BAG_NAME,WEIGHT FROM `master_bag` where BAG_CODE='$Bagtype2'";
          $SBtype=mysqli_query($connect, $Qry);
          $FBtype=mysqli_fetch_assoc($SBtype);
          $BagNames2=$FBtype['BAG_NAME'];
          $BagWeights2=$FBtype['WEIGHT'];

          $Qry="SELECT BAG_NAME,WEIGHT FROM `master_bag` where BAG_CODE='$Bagtype3'";
          $SBtype=mysqli_query($connect, $Qry);
          $FBtype=mysqli_fetch_assoc($SBtype);
          $BagNames3=$FBtype['BAG_NAME'];
          $BagWeights3=$FBtype['WEIGHT'];
       
    
      //Brindha added -END
      $poData[$i]["POBAG_NAME"] = $row["POBAG_NAME"];
     // $poData[$i]["WEIGHT"] = $row["WEIGHT"];
     $poData[$i]["WEIGHT"] =$BagWeights;
     $poData[$i]["WEIGHT2"] =$BagWeights2;
     $poData[$i]["WEIGHT3"] =$BagWeights3;

      foreach ($gofields as $gfield) {
        $formData[$i][$gfield] = $row[$gfield];
      }
     // $formData[$i]["BAG_NAME"] = $row["BAG_NAME"];
     $formData[$i]["BAG_NAME"] = $BagNames;
     $formData[$i]["BAG_NAME2"] = $BagNames2;
     $formData[$i]["BAG_NAME3"] = $BagNames3;
      $i++;
    }
    return json_encode(["success" => 1, "results" => $poData, "fresults" => $formData]);
  } else {
    return json_encode(["success" => 0]);
  }
}
function updateGateOutInfo($connect, $record)
{
  $gFields = [
    "bag_type",
    "no_bags",
    "wb_empty_wt",
    "wb_net_wt",
    "gunny_wt",
    "gunny_less_wt",
    "supplier_wb_dt",
    "supplier_wb_qty",
    "invoice_rate",
    "invoice_no",
    "invoice_qty",
    "wb_name",
    "wb_serial_no",
    "wb_load_wt",
    "supp_inv_copy",
    "supp_wb_copy",
    "naga_os_wb_copy"
  ];
  $pFields = ["TRUCK_NO", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "PO_LINE_ITEM"];

  $sqlFields = [];
  foreach ($gFields as $gfield) {
    if(isset($record->{$gfield})){
      array_push($sqlFields, $gfield . "= '" . mysqli_real_escape_string($connect, trim($record->{$gfield})) . "'");
    }
  }
  $usql = "UPDATE gateout_info SET " . join(",", $sqlFields) . " WHERE purchase_info_id = " . $record->id;
  //echo $usql;
  if (mysqli_query($connect, $usql) == true) {
    $sqlPFields = [];
    foreach ($pFields as $pfield) {
      array_push($sqlPFields, $pfield . "= '" . mysqli_real_escape_string($connect, trim($record->{$pfield})) . "'");
    }
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $upsql1 =
      "UPDATE purchase_info SET ZQTY = " .
      $record->gunny_less_wt .
      ", VECHICAL_STATUS = '7',MIGOApprovalDt='$CurrentDateTime',MIGOApprovalByName='$SessionUserName',MIGOApprovalBy='$SessionUser'," .
      join(",", $sqlPFields) .
      " WHERE PI_REFID = " .
      $record->id;
    //echo $upsql1;
    if (mysqli_query($connect, $upsql1) == true) {
      return json_encode(["success" => 1, "result" => "both"]);
    }
    return json_encode(["success" => 0]);
  }
  return json_encode(["success" => 0]);
}
function approvePo($connect, $record)
{
  $id = $record->id;
  $pifields = [
    "ZVA_NUMBER",
    "ZPO_NUMBER",
    "ZDATE",
    "ZTIME",
    "ZVENDOR_CODE",
    "ZVENDOR_NAME",
    "ZSUPPLIER_CODE",
    "ZSUPPLIER_NAME",
    "ZQTY",
    "MEINS",
    "IDNLF",
    "MATNR",
    "SGT_SCAT",
    "NETPR",
    "WERKS",
    "LGORT",
  ];
  $fetchsql = "SELECT " . join(", ", $pifields) . ", PO_LINE_ITEM as ZPO_LINE_ITEM, TRUCK_NO as ZTRUCK_CONTAINER_NUMBER, deduction_amount as ZDEDUCTION_AMOUNT, invoice_no as ZVENDOR_INVOICE from purchase_info LEFT JOIN quality_info qi ON qi.purchase_info_id = PI_REFID LEFT JOIN gateout_info gi ON gi.purchase_info_id = PI_REFID WHERE PI_REFID = " . $id;
  array_push($pifields, "ZPO_LINE_ITEM");
  array_push($pifields, "ZTRUCK_CONTAINER_NUMBER");
  array_push($pifields, "ZDEDUCTION_AMOUNT");
  array_push($pifields, "ZVENDOR_INVOICE");

  $result = mysqli_query($connect, $fetchsql);
  $valueArr = [];
  if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
      foreach ($pifields as $pifield) {
        if($pifield==="ZQTY"){
          array_push($valueArr, round(intval($row[$pifield])/1000,3));
        }
        else{
          array_push($valueArr, $row[$pifield]);
        }
      }
    }
    $asql = "INSERT INTO pp_to_sap (" . join(", ", $pifields) . ") VALUES ( '" . join("',' ", $valueArr) . "')";
    mysqli_query($connect, $asql);
    return json_encode(["success" => 1]);
  }
  return json_encode(["success" => 0]);
}
?>
