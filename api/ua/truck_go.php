<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set("Asia/Calcutta");
$entityGOContent = json_decode(file_get_contents("php://input"));

if ($entityGOContent->formType === "PO") {
  echo fetchPODetailsById($connect, $entityGOContent);
} elseif ($entityGOContent->formType === "U_OY") {
  echo updateOyGateOutdetails($connect, $entityGOContent);
} elseif ($entityGOContent->formType === "OY_PO") {
  echo fetchOyPoDetailsById($connect, $entityGOContent);
} elseif ($entityGOContent->formType === "UAOY_GET_DEST") {
  echo fetchInterStateFromTo($connect, $entityGOContent);
}
else if($entityGOContent->formType === "AddWhDispatch"){
  echo addWarehouseDispatchDetails($connect, $entityGOContent);
}
else {
  echo updateGateOutInfo($connect, $entityGOContent);
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
    "pi.WERKS",
    "ZVA_NUMBER"
  ];
  $gofields = [
    "TRUCK_NO",
    "ZSUPPLIER_NAME",
    "ZSUPPLIER_CODE",
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
    "invoice_date",
    "invoice_no",
    "invoice_qty",
    "invoice_bag_count",
    "supp_inv_copy",
    "supp_wb_copy",
    "bag_type",
    "bag_type2",
    "bag_type3",
    "PO_LINE_ITEM"
  ];

 /* $fetchsql =
    "select bm.BAG_NAME as BAG_NAME, bm.WEIGHT as WEIGHT, pbm.BAG_NAME as POBAG_NAME, " .
    join(",", $pofields) .
    "," .
    join(",", $gofields) .
    " from purchase_info pi
    LEFT Join master_storage msi ON msi.LGORT = pi.LGORT LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS LEFT Join master_inco ON INCO1 = INCO_TERMS , gateout_info, master_bag bm,  master_bag pbm where PI_REFID ='"  .
    $record->id .
    "' and purchase_info_id = PI_REFID and bag_type = bm.BAG_CODE and PO_BAG_TYPE = pbm.BAG_CODE LIMIT 1";
  //echo $fetchsql;
*/ //Brindha commented 932021
  $fetchsql =
  "select  pbm.BAG_NAME as POBAG_NAME, " .
  join(",", $pofields) .
  "," .
  join(",", $gofields) .
  " from purchase_info pi
  LEFT Join master_storage msi ON msi.LGORT = pi.LGORT 
  LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS 
  LEFT Join master_inco ON INCO1 = INCO_TERMS , gateout_info, master_bag bm,  master_bag pbm where PI_REFID ='"  .
  $record->id .
  "' and purchase_info_id = PI_REFID 
   and PO_BAG_TYPE = pbm.BAG_CODE LIMIT 1";
   //echo $fetchsql;
  // exit();

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

      
      $ExpBagtype=explode(",",$Bagtype);
      $BagNames="";
      $BagWeights="";
      
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
      $poData[$i]["WEIGHT3"] = $BagWeights3;
      $poData[$i]["WEIGHT2"] = $BagWeights2;
      foreach ($gofields as $gfield) {
        $formData[$i][$gfield] = $row[$gfield];
      }
      //$formData[$i]["BAG_NAME"] = $row["BAG_NAME"]; //brindha Edited
      $formData[$i]["BAG_NAME"] = $BagNames;

      $formData[$i]["BAG_NAME2"] = $BagNames2;
    

      $formData[$i]["BAG_NAME3"] = $BagNames3;
      
      
      $WERKS=$row['WERKS'];
      $ZVA_NUMBER=$row['ZVA_NUMBER'];

      $Qry="SELECT ID FROM `wb_master` where Receving_plant='$WERKS' and VA_number='$ZVA_NUMBER'";
     $WBSelect=mysqli_query($connect, $Qry);
      $WBFetch=mysqli_fetch_assoc($WBSelect);
      $WBID=$WBFetch['ID'];

     /* $Qry="SELECT Ticket_no as label,Ticket_no as value,First_weight as First_Weight,Netweight as Net_Weight,Second_weight as Second_Weight FROM `wb_rm` where VA_no='$ZVA_NUMBER'";
      $TicketDetails = getResultAsObjectArray($connect, $Qry);*/
      $Qry="SELECT Id as label,Id as value,FirstWeight as First_Weight,NetWeight as Net_Weight,
      SecondWeight as Second_Weight FROM `pp_silotomillweights_unload` where VANumber='$ZVA_NUMBER'";
      $TicketDetails = getResultAsObjectArray($connect, $Qry);
      if(sizeof($TicketDetails)>0){
        $WBID=sizeof($TicketDetails);
      }


      $i++;
    }
    return json_encode(["success" => 1, "results" => $poData, "fresults" => $formData,"OwnWBID"=>$WBID,"TicketDetails"=>$TicketDetails]);
  } else {
    return json_encode(["success" => 0]);
  }
}

function fetchOyPoDetailsById($connect, $record)
{
  $id = mysqli_real_escape_string($connect, trim($record->id));
  $fetchsql =
    "select TRAILER_NO as trailerNo,CONTAINER_NO  as containerNo,CONTAINER_TYPE as containerType,DRIVER_NO as driverNo,WB_NAME as wbName,WB_SERIAL_NO as wbSerialNo,WB_EMPTY_WT as wbEmptyWt,SCREEN_TYPE as screenType,PLANT_ID as plantId from empty_vehicle_arrival where id =" .
    $id .
    " LIMIT 1 ";
  //echo $fetchsql;
  $poData = getSingleAsObject($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $poData]);
}

function addWarehouseDispatchDetails($connect, $record){  
  try{
   // var_dump($record);exit();
    mysqli_begin_transaction($connect);
    if($record->vehicleStatus==11){
      $vehicleStatus=$record->vehicleStatus;
      $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");
      $arrivalId=$record->id;
      $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS='$vehicleStatus',GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser' where Id = $arrivalId";
      //echo ($sql);exit();
      updateData($connect, $sql );
      mysqli_commit($connect);
      return json_encode(["success" =>1]);
    }else{

   
  if(isset($record->dispatchInfo)){
    $fieldsToAdd = $record->dispatchInfo;
    $fields = [];
    $values = [];
    $UpdateArray=[];
    foreach ($fieldsToAdd as $key => $value) {
      $key = mysqli_real_escape_string($connect, $key);
      array_push($fields,$key);
      $fld = mysqli_real_escape_string($connect, $value);
      array_push($values,$fld);

      array_push($UpdateArray,$key."='".$fld."'");
    }
$Qry="SELECT ID FROM `interstate_warehouse_dispatch_info`  where ArrivalId='".$record->id."'";
$SelectIR=mysqli_query($connect,$Qry);
$FetchIR=mysqli_fetch_assoc($SelectIR);

if($FetchIR['ID']!=""){
  $dispatchId=$FetchIR['ID'];
  $sql = "Update interstate_warehouse_dispatch_info SET " . join(", ", $UpdateArray) . " Where ID='".$dispatchId."'";

  mysqli_query($connect, $sql); 
  
}else{
    $sql = "insert into interstate_warehouse_dispatch_info(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
    $dispatchId = insertData($connect, $sql);  
}
    // $id = mysqli_real_escape_string($connect, trim($record->id));
    if(isset($record->lineItems)){
      $lineItems = $record->lineItems;
      foreach ($lineItems as $po) {
        $keysToTake =["PoNumber","LineItem", "MaterialNo","WheatVariety","DeliveryNo","DeliveryQty","SalesInvoice","SisterConcernFrom","SisterConcernTo","SendingStorageLocation","ReceivingStorageLocation","PackedType","BagType","NoOfBags","GunnyWt"];
        $fields = ["DispatchInfoId"];
        $values = [$dispatchId];
        $UpdateLI=[];
        foreach ( $keysToTake as $key) {
          array_push($fields,$key);
          $fld = mysqli_real_escape_string($connect,$po->{$key});
          array_push($values,$fld);
          array_push($UpdateLI,$key."='".$fld."'");
        }    
        $LineItemName=$po->LineItem;   
        $QryLI="SELECT Id FROM `interstate_warehouse_dispatch_lineitem` where DispatchInfoId='$dispatchId' and LineItem='$LineItemName'";
        $SelectLI=mysqli_query($connect,$QryLI);
        $FetchLI=mysqli_fetch_assoc($SelectLI);
        
        if($FetchLI['Id']!=""){
          $sql = "Update interstate_warehouse_dispatch_lineitem set " . join(", ", $UpdateLI) . " where Id='".$FetchLI['Id']."' ";
          mysqli_query($connect, $sql);
        }else{
          $sql = "insert into interstate_warehouse_dispatch_lineitem(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
          insertData($connect, $sql);
        }
      
      

        
      }
    }
  //  echo $sql;exit();
    $Del="DELETE FROM `interstate_warehouse_dispatch_vehicle_info` where DispatchInfoId='$dispatchId'";
    mysqli_query($connect,$Del);
    if(isset($record->truckList)){
      $truckList = $record->truckList;
      foreach ($truckList as $po) {
        $keysToTake =["TruckNumber", "WarehouseName", "LotNumber", "NoOfBags"];
        $fields = ["DispatchInfoId"];
        $values = [$dispatchId];
        foreach ( $keysToTake as $key) {
          if(isset($po->{$key})){
            array_push($fields,$key);
            $fld = mysqli_real_escape_string($connect,$po->{$key});
            array_push($values,$fld);
          }
        }    
        
        
        $sql = "insert into interstate_warehouse_dispatch_vehicle_info(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
        insertData($connect, $sql);
      }
    }

    
    $vehicleStatus =mysqli_real_escape_string($connect, $record->vehicleStatus);
    $arrivalId = $record->dispatchInfo->ArrivalId;
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS='$vehicleStatus',YardDispatchByName='$SessionUserName',YardDispatchDt='$CurrentDateTime',YardDispatchBy='$SessionUser' where Id = $arrivalId";

    updateData($connect, $sql );
    mysqli_commit($connect);
    return json_encode(["success" =>1]);
  }
  }
}catch(Exception $ex){
  mysqli_rollback($connect);
//  echo $ex;exit();
  return json_encode(["success" => 0, "er" => $ex]);
}
}

function updateOyGateOutdetails($connect, $record)
{
  $fieldsToUpdate = $record->fieldsToUpdate;

  $id = mysqli_real_escape_string($connect, trim($record->id));
  if(isset($record->pos)){
    $pos = $record->pos;

    foreach ($pos as $po) {
      $keysToTake =["DispatchInfoId","MaterialNo","WheatVariety","DeliveryNo","DeliveryQty","SalesInvoice","SisterConcernFrom","SisterConcernTo","SendingStorageLocation","ReceivingStorageLocation","PackedType","BagType","NoOfBags","GunnyWt","SaleInvoiceCopy"];
      $poNo = mysqli_real_escape_string($connect, $po->PoNumber);
      $liItem = mysqli_real_escape_string($connect, $po->LineItem);

      $sql = "insert into empty_vehicle_po(" . join(", ", $keysToTake) . ") values('" . $poNo . "','" . $liItem . "'," . $id . ")";
      insertData($connect, $sql);
    }
  }
  if(isset($record->containerDetails)){
    $con = $record->containerDetails;
    $fields = [];
    $values = [];
    foreach ($con as $co) {
      foreach ($co as $key => $value) {
        $key = mysqli_real_escape_string($connect, $key);
        array_push($fields,$key);
        $fld = mysqli_real_escape_string($connect, $value);
        array_push($values,$fld);
      }
      $sql = "insert into interstate_container_details(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
      insertData($connect, $sql);  
    }  
  }


  $fields = [];

  foreach ($fieldsToUpdate as $key => $value) {
    $key = mysqli_real_escape_string($connect, $key);
    $fld = mysqli_real_escape_string($connect, $value);
    array_push($fields, $key . "='" . $fld . "'");
  }
  $sql = "UPDATE empty_vehicle_arrival set " . join(",", $fields) . " where Id = " . $id;

  //echo $upsql;
  if (mysqli_query($connect, $sql) == true) {
    return json_encode(["success" => 1, "result" => "both"]);
  }
  return json_encode(["success" => 0]);
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
    "naga_os_wb_copy",
    "wb_name",
    "wb_serial_no",
    "wb_load_wt",
    "is_own_wb",
    "wb_ticket_no",
    "supp_wb_copy"
  ];
  $pFields = ["TRUCK_NO", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "PO_LINE_ITEM"];
  try{
    mysqli_begin_transaction($connect);
  $sqlFields = [];
  foreach ($gFields as $gfield) {
    if (isset($record->{$gfield})) {
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

    $todayDt = date("Y-m-d");
    $zdate = mysqli_real_escape_string($connect, trim($todayDt));
    $todaytm = date("H:i:s");
    $ztime = mysqli_real_escape_string($connect, trim($todaytm));
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    $GateOutBy=$SessionUser;
    $GateOutDt=$CurrentDateTime;

    $upsql1 =
      "UPDATE purchase_info SET ZQTY = " .
      $record->gunny_less_wt .
      ", VECHICAL_STATUS = '6',GateOutByName='$SessionUserName',GateOutBy='$GateOutBy',GateOutDt='$GateOutDt', ZDATE ='" .
      $zdate .
      "', ZTIME='" .
      $ztime .
      "'," .
      join(",", $sqlPFields) .
      " WHERE PI_REFID = " .
      $record->id;
    //echo $upsql1;
    if (mysqli_query($connect, $upsql1) == true) {
      if(isset($record->wb_ticket_no)){
        $upTsql =
        "UPDATE silo_wb SET Is_Used = 1 WHERE Voucher_No = '" .
        $record->wb_ticket_no."'";
        mysqli_query($connect, $upTsql);
      }
      mysqli_commit($connect);
      return json_encode(["success" => 1, "result" => "both"]);
    }
  }
  mysqli_rollback($connect);
  return json_encode(["success" => 0]);
  }
  catch(Exception $ex){
    mysqli_rollback($connect);
    return json_encode(["success" => 0]);
  }
}

function fetchInterStateFromTo($connect, $record)
{
  $po = mysqli_real_escape_string($connect, trim($record->po));
  $lineItem = mysqli_real_escape_string($connect, trim($record->lineItem));
  $fetchsql =
    "select `sisterConcernFrom`, wheatVariety,materialNo, deliveryQuantity as deliveryQty, deliveryDate, deliveryNo,`sendingStorageLocation`, `sisterConcernTo`, `receivingStorageLocation`  from interstate_sap_to_pp where  PoNumber='" .
    $po .
    "' and PoLineItem='" .
    $lineItem .
    "' LIMIT 1 ";
  //echo $fetchsql;
  $poData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => count($poData) > 0 ? $poData[0] : $poData]);
}
?>
