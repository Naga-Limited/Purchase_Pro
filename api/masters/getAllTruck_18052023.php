<?php
include_once APIPATH . "/helper/sessionHelper.php";
//include DB File
include_once APIPATH . "/db_connection.php";
include_once APIPATH . "/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));

if ($entityVAContent->formType == "PRINTDET") {
  echo fetchAllTruckArrivalPrint($connect, $entityVAContent);
} else {
  echo fetchAllTruckArrival($connect, $entityVAContent);
}
$connect->close();


function fetchAllTruckArrivalPrint($connect, $record)
{
  $vehicleStatus = $record->vehicleStatus;
  $ScreenName = "";
  if (isset($record->ScreenName)) {
    $ScreenName = $record->ScreenName;
  }
  $filters = [];
  if (isset($record->vehicleStatus)) {
    $vstatus = "VECHICAL_STATUS IN (" . $vehicleStatus . ")";
    $filters = [$vstatus];
  }



  if (isset($record->cfilter)) {
    array_push($filters, $record->cfilter);
  }

  // $includeStatus = false;
  if (isset($record->searchTxt)) {
    array_push($filters, "(DRIVER_NO like '%" . $record->searchTxt . "%' or a.WERKS like '%" . $record->searchTxt . "%'  
    OR  b.PLANT_NAME like '%" . $record->searchTxt . "%' 
    OR  a.LGORT like '%" . $record->searchTxt . "%' 
    OR  c.STORAGE_LOCATION like '%" . $record->searchTxt . "%'
    OR  ZPO_NUMBER like '%" . $record->searchTxt . "%'
    OR  PICK_SLIP_NO like '%" . $record->searchTxt . "%'
    or ZVA_NUMBER like '%" . $record->searchTxt . "%' or ZPO_NUMBER like '%" . $record->searchTxt . "%'  or TRUCK_NO like '%" . $record->searchTxt . "%')");
    // $includeStatus =true;
  }

  $plantFilter = [];
  if (isset($record->plantIds)) {
    $plantIds = $record->plantIds;
    foreach ($plantIds as $plantid) {
      array_push($plantFilter, "WERKS = '" . $plantid . "'");
    }
  }


  if (count($plantFilter) > 0) {
    array_push($filters, "(" . join(" OR ", $plantFilter) . ")");
    // $includeStatus =true;
  }

  // if ($includeStatus) {
  //   array_push($filters, $vstatus);
  // }
  if (isset($record->SCREEN_TYPE) && $record->SCREEN_TYPE === "IAS") {
    array_push($filters, "SCREEN_TYPE ='IAS'");
  } else {
    $privieges = getPrivilegeByUser($connect, $_SESSION["USERID"]);
    $priviegesKey = array_keys($privieges);
    if (isset($record->includeIas)) {
      array_push($priviegesKey, "IAS");
    }
    array_push($filters, "SCREEN_TYPE IN ( '" . join("','", $priviegesKey) . "')");
  }

  if ($record->otherfilter) {
    $FromDt = $record->otherfilter->otherfilter->from;
    $ToDt = $record->otherfilter->otherfilter->to;
    //  $PlantId=$record->otherfilter->otherfilter->PlantId;

    // echo $FromDt;
    array_push($filters, "DATE(DateAdded) >= '" . $FromDt . "'");
    array_push($filters, "DATE(DateAdded) <= '" . $ToDt . "'");
    if (isset($PlantId) && $PlantId != "") {
      array_push($filters, "WERKS = '" . $PlantId . "'");
    }



    if ($record->otherfilter->otherfilter->PlantIdArr != null && sizeof($record->otherfilter->otherfilter->PlantIdArr) > 0) {
      $PlantIdArray = $record->otherfilter->otherfilter->PlantIdArr;
      $PlantIdArrFilter = " (";
      for ($i = 0; $i < sizeof($PlantIdArray); $i++) {
        $PlantIdArrFilter .= "a.WERKS = '" . $PlantIdArray[$i]->value . "' OR ";
      }
      $PlantIdArrFilter = rtrim($PlantIdArrFilter, "OR ");
      $PlantIdArrFilter .= ")";
      array_push($filters, $PlantIdArrFilter);
    }
    //var_dump($filter);
  }

  //var_dump($record);
  if ($record->rake == "YES") {
    array_push($filters, "VEHICLE_TYPE = 'Rake'");
  }
  if ($record->rake == "NO") {
    array_push($filters, "VEHICLE_TYPE != 'Rake'");
  }

  if (isset($record->ID)) {
    array_push($filters, "PI_REFID = '" . $record->ID . "'");
  }

  $countsql =  "select count(PI_REFID) as total from purchase_info a 
  LEFT JOIN  master_plant b ON a.WERKS=b.WERKS
  LEFT JOIN  master_storage c ON a.LGORT=c.LGORT
  where " . join(" AND ", $filters);
  //echo $countsql;
  ///exit();
  //exit();
  $countData = mysqli_query($connect, $countsql);

  $total = 0;

  while ($crow = mysqli_fetch_assoc($countData)) {
    $total = $crow["total"];
  }

  $pageSize = 50;

  if (isset($record->pageSize)) {
    $pageSize = $record->pageSize;
  }

  $fields = "date_format(a.DateAdded,'%d-%m-%Y %h:%i %p') as VaDate,date_format(a.GateOutDt,'%d-%m-%Y %h:%i %p')as GateOutDateTime,PI_REFID,CONTAINER_NO,PO_LINE_ITEM,ZVA_NUMBER,PICK_SLIP_NO, EMPTY_VEHICLE_ARRIVAL_ID, ZPO_NUMBER,QA_STATUS, DateAdded,DateModified, 
  TRUCK_NO,SCREEN_TYPE, DRIVER_NO,VECHICAL_STATUS,remarks,ZSUPPLIER_NAME,VEHICLE_TYPE, a.WERKS,
  concat(a.WERKS,'-',b.PLANT_NAME) as PlantName,
  concat(a.LGORT,'-',c.STORAGE_LOCATION) as StorageLocation,
  IDNLF, INCO1,WaitOutsideDt,GateInDt,
  QualityCheckSubmitDt,UnloadWHSubmitDt,GateOutDt,MIGOApprovalDt,MIGOApprovalDt,QualityDeductionSubmitDt,InvoiceQty,InvoiceRate ";
  $fetchsql =
    "select '$ScreenName' as ScreenName," .
    $fields .
    ",(SELECT qc_work_doc FROM `quality_info` where purchase_info_id=a.PI_REFID LIMIT 1) as quality_info,
    (SELECT supp_inv_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as supp_inv_copy,
    (SELECT supp_wb_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as supp_wb_copy,
    (SELECT naga_os_wb_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as naga_os_wb_copy
    from purchase_info a 
    LEFT JOIN  master_plant b ON a.WERKS=b.WERKS
    LEFT JOIN  master_storage c ON a.LGORT=c.LGORT
    where "
    . join(" AND ", $filters) . " order by DateAdded,VECHICAL_STATUS limit " .
    $record->startCount .
    ",$pageSize";
  // echo $fetchsql;
  // exit();

  $tableRecords = getResultAsObjectArray($connect, $fetchsql);


  //PO Details
  //var_dump($tableRecords);exit();
  $PONumber = $tableRecords[0]['ZPO_NUMBER'];
  $PO_LINE_ITEM = $tableRecords[0]['PO_LINE_ITEM'];
  $PI_REFID = $tableRecords[0]['PI_REFID'];

  $Qry = "SELECT * FROM `sap_to_pp` where EBELN='$PONumber' and EBELP='$PO_LINE_ITEM'";
  $PODetails = getResultAsObjectArray($connect, $Qry);

  $Qry = "SELECT SUP_VE_REFID,ZSUPPLIER_INV_QTY,WB_QTY,ZSUPPLIER_INV_NO,VEHICAL_NO,ZSUPPLIER_INV_RATE,date_format(ZSUPPLIER_INV_DT,'%d-%m-%Y') as ZSUPPLIER_INV_DT FROM `supplier_vehical_info` 
  where SUPPLIER_ID  IN(SELECT SD_REFID  FROM `supplier_dispatch_info` 
  where ZPO_NUMBER='$PONumber' and ZPO_LINE_ITEM='$PO_LINE_ITEM') and VEHICLE_ARRIVED=0";
  //echo $Qry;
  $SDIInfo = getResultAsObjectArray($connect, $Qry);

  $Qry = " SELECT *,(no_bags+no_bags2+no_bags3) as TotalNoOfBags,
   (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bag_type limit 1) as BagTypeName,
  (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bag_type2 limit 1) as BagTypeName2,
  (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bag_type3 limit 1) as BagTypeName3,
  date_format(CURRENT_TIMESTAMP,'%d-%m-%Y %h:%i %p') as CurrentTime,date_format(a.invoice_date,'%d-%m-%Y') as InvoiceDate
  FROM `gateout_info`  a
  
  where purchase_info_id='$PI_REFID'";
  //echo $Qry;exit();
  $GateoutInfo = getResultAsObjectArray($connect, $Qry);

  $Qry = " SELECT *,if(overall_result='A','Accepted',if(overall_result='AD','Accepted With Deduction','Rejected')) as Result,
  if(degrade=1,'Yes','No') as degrade
   FROM `quality_info` a 
    
   where purchase_info_id='$PI_REFID'";
  $QualityInfo = getResultAsObjectArray($connect, $Qry);

  $Qry = " SELECT *,if(overall_result='A','Accepted',if(overall_result='AD','Accepted With Deduction','Rejected')) as Result,
  if(degrade=1,'Yes','No') as degrade
   FROM `quality_info_afterunload` a 
    
   where purchase_info_id='$PI_REFID'";
  //echo $Qry;exit
  $QualityInfo2 = getResultAsObjectArray($connect, $Qry);



  // echo "hello";
  return json_encode(["success" => 1, "QualityInfo2" => $QualityInfo2, "QualityInfo" => $QualityInfo, "SDIInfo" => $SDIInfo, "GateoutInfo" => $GateoutInfo, "results" => $tableRecords, "PODetails" => $PODetails, "count" => $total]);
}


function fetchAllTruckArrival($connect, $record)
{
  $CurrentTime = date("d-m-Y H:i:s") . "\n";
  $Debug = 0;

  if ($Debug == 1) {
    echo $CurrentTime;
  }

  $vehicleStatus = $record->vehicleStatus;
  $ScreenName = "";
  if (isset($record->ScreenName)) {
    $ScreenName = $record->ScreenName;
  }
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $vstatus = "VECHICAL_STATUS IN (" . $vehicleStatus . ")";
  $filters = [$vstatus];

  if (isset($record->cfilter)) {
    array_push($filters, $record->cfilter);
  }
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  // $includeStatus = false;
  if (isset($record->searchTxt)) {
    array_push($filters, "(DRIVER_NO like '%" . $record->searchTxt . "%' or a.WERKS like '%" . $record->searchTxt . "%'  
    OR  b.PLANT_NAME like '%" . $record->searchTxt . "%' 
    OR  a.LGORT like '%" . $record->searchTxt . "%' 
    OR  c.STORAGE_LOCATION like '%" . $record->searchTxt . "%'
    OR  ZPO_NUMBER like '%" . $record->searchTxt . "%'
    OR  PICK_SLIP_NO like '%" . $record->searchTxt . "%'
    or ZVA_NUMBER like '%" . $record->searchTxt . "%' or ZPO_NUMBER like '%" . $record->searchTxt . "%'  or TRUCK_NO like '%" . $record->searchTxt . "%')");
    // $includeStatus =true;
  }

  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $plantFilter = [];
  if (isset($record->plantIds)) {
    $plantIds = $record->plantIds;
    foreach ($plantIds as $plantid) {
      array_push($plantFilter, "a.WERKS = '" . $plantid . "'");
    }
  }


  if (count($plantFilter) > 0) {
    array_push($filters, "(" . join(" OR ", $plantFilter) . ")");
    // $includeStatus =true;
  }
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  // if ($includeStatus) {
  //   array_push($filters, $vstatus);
  // }

  //echo $record->SCREEN_TYPE; exit();

  if (isset($record->SCREEN_TYPE) && $record->SCREEN_TYPE === "IAS") {
    array_push($filters, "SCREEN_TYPE ='IAS'");
  } else {
    $privieges = getPrivilegeByUser($connect, $_SESSION["USERID"]);
    $priviegesKey = array_keys($privieges);
    if (isset($record->includeIas)) {
      array_push($priviegesKey, "IAS");
    }
    if ($record->VStausChange) {
      array_push($filters, "SCREEN_TYPE IN (" . $record->VStausChange . ")");
    } else {
      array_push($filters, "SCREEN_TYPE IN ( '" . join("','", $priviegesKey) . "')");
    }
  }
  if (isset($record->PurchaseQC)) {
    if ($record->PurchaseQC) {
      //array_push($filters,"SCREEN_TYPE <>'IAS'"); ///Merged
    }
  }
  if ($Debug == 1) {
    echo "AAAA ", $CurrentTime;
  }
  //var_dump($record->otherfilter);
  if ($record->otherfilter) {
    $FromDt = $record->otherfilter->from;
    $ToDt = $record->otherfilter->to;
    //  $PlantId=$record->otherfilter->otherfilter->PlantId;

    //echo $FromDt;

    if ($FromDt != "" && $ToDt != "") {
      array_push($filters, "DATE(DateAdded) >= '" . $FromDt . "'");
      array_push($filters, "DATE(DateAdded) <= '" . $ToDt . "'");
    }
    if ($Debug == 1) {
      echo "YYYY ", $CurrentTime;
    }
    if (isset($PlantId) && $PlantId != "") {
      array_push($filters, "a.WERKS = '" . $PlantId . "'");
    }

    if ($Debug == 1) {echo "XXXX ", $CurrentTime;}

    if ($record->otherfilter->PlantIdArr != null && sizeof($record->otherfilter->PlantIdArr) > 0) {
      $PlantIdArray = $record->otherfilter->PlantIdArr;
      $PlantIdArrFilter = " (";
      for ($i = 0; $i < sizeof($PlantIdArray); $i++) {
        $PlantIdArrFilter .= "a.WERKS = '" . $PlantIdArray[$i]->value . "' OR ";
      }
      $PlantIdArrFilter = rtrim($PlantIdArrFilter, "OR ");
      $PlantIdArrFilter .= ")";
      array_push($filters, $PlantIdArrFilter);
    }
    //var_dump($filter);
  }

  //var_dump($record); exit();

  if ($Debug == 1) {
    echo $CurrentTime;
  }
  //var_dump($record);
  if ($record->rake == "YES") {
    array_push($filters, "VEHICLE_TYPE = 'Rake'");
  }
  if ($record->rake == "NO") {
    array_push($filters, "VEHICLE_TYPE != 'Rake'");
  }
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $countsql =  "select count(PI_REFID) as total from purchase_info a 
  LEFT JOIN  master_plant b ON a.WERKS=b.WERKS
  LEFT JOIN  master_storage c ON a.LGORT=c.LGORT
  where " . join(" AND ", $filters);


  //echo $countsql;exit();

  $countData = mysqli_query($connect, $countsql);
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $total = 0;
  //echo mysqli_error($connect);
  //exit();
  while ($crow = mysqli_fetch_assoc($countData)) {

    $total = $crow["total"];
  }
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $pageSize = 50;
  if (isset($record->pageSize)) {
    $pageSize = $record->pageSize;
  }

  $fields = "PI_REFID,ZVA_NUMBER,UnloadingRedirectGateoutBy,PICK_SLIP_NO, EMPTY_VEHICLE_ARRIVAL_ID, ZPO_NUMBER,QA_STATUS, DateAdded,DateModified, 
  TRUCK_NO,SCREEN_TYPE, DRIVER_NO,VECHICAL_STATUS,remarks,replace(ZSUPPLIER_NAME,' - ','') as ZSUPPLIER_NAME,VEHICLE_TYPE, a.WERKS,
  concat(a.WERKS,'-',b.PLANT_NAME) as PlantName,
  concat(a.LGORT,'-',c.STORAGE_LOCATION) as StorageLocation,
  IDNLF, INCO1,WaitOutsideDt,GateInDt,
  QualityCheckSubmitDt,UnloadWHSubmitDt,GateOutDt,MIGOApprovalDt,MIGOApprovalDt,MigoRejectedDt,QualityDeductionSubmitDt,
  `FirstWeightEntryDt`, `FirstWeightEntryBy`, `FirstWeightEntryByName`, `SecondWeightEntryDt`, `SecondWeightEntryBy`, `SecondWeightEntryByName`";
  $fetchsql =
    "select '$ScreenName' as ScreenName," .$fields .",
    (SELECT qc_work_doc FROM `quality_info` where purchase_info_id=a.PI_REFID LIMIT 1) as quality_info,
    (SELECT supp_inv_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as supp_inv_copy,
    (SELECT supp_wb_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as supp_wb_copy,
    (SELECT naga_os_wb_copy FROM `gateout_info` where purchase_info_id=a.PI_REFID) as naga_os_wb_copy
    from purchase_info a 
    LEFT JOIN  master_plant b ON a.WERKS=b.WERKS
    LEFT JOIN  master_storage c ON a.LGORT=c.LGORT and b.id = c.plantid
    where "
    . join(" AND ", $filters) . " order by DateAdded,VECHICAL_STATUS limit " .
    $record->startCount .
    ",$pageSize";

  /*" .
    $record->startCount .
    ",$pageSize";*/

  //echo $fetchsql; exit();

  if ($Debug == 1) {
    echo $CurrentTime;
  }
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  if ($Debug == 1) {
    echo $CurrentTime;
  }
  //var_dump($tableRecords);
  // echo "hello";
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}
