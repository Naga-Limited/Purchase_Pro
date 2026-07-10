<?php

use App\Helpers\StatusConstant;

include_once APIPATH. "/helper/sessionHelper.php";
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set("Asia/Calcutta");
$record = json_decode(file_get_contents("php://input"));
$formType = isset($_GET["formType"])?$_GET["formType"]:"" ;

if(isset($record->formType)){
  $formType=$record->formType;
}
switch ($formType) {
  case "GetContainer":    
    $status = isset($_GET["status"])?$_GET["status"]:"9" ;
    echo fetchContainer($connect);
    break;   
  case "GetDetailsByContainerId":
    echo GetDetailsByContainerId($connect,$record);
    break;       
  case "AddPortDispatchInfo":
      echo AddPortDispatchInfo($connect,$record);
    break;  
  case "UpdatePortDispatchInfo":
    echo UpdatePortDispatchInfo($connect,$record);
    break;       
  case "GetEntriesAtPort":
    echo GetEntriesAtPort($connect,$record);
    break;   
  case "GetEntriesAtPortById":
    echo GetEntriesAtPortById($connect,$record);
    break;    
  case "UpdateDispatchStatus":
    echo UpdateDispatchStatus($connect,$record);
    break;      
  case "GetPoDetailsBySaleInvoiceNo":
    echo GetPoDetailsBySaleInvoiceNo($connect,$record);
    break; 
  case "getIRSDetailsForView";
    echo getIRSDetailsForView($connect,$record);    
    break; 
}
$connect->close();

function getIRSDetailsForView($connect,$record)
{
  
 
  $id=$record->id;

  $fetchsql = "SELECT a.* FROM `empty_vehicle_arrival` a  where a.ID='$id'";
  $VehDetails = getResultAsObjectArray($connect, $fetchsql);
 
  $fetchsql = "SELECT a.* FROM `interstate_warehouse_dispatch_info` a  where a.ArrivalId='$id'";
 $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 $DispatchInfoId=$tableRecords[0]['ID'];

  $fetchsql = "SELECT a.*,date_format(a.LoadingDate,'%d/%m/%Y') as LDate FROM `interstate_warehouse_dispatch_info` a  where a.ArrivalId='$id'";
 $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 //echo $fetchsql;
 $DispatchInfoId=$tableRecords[0]['ID'];
 //echo "ID".$ID;

 
 $fetchsql = "SELECT * FROM `interstate_warehouse_dispatch_lineitem` where DispatchInfoId='$DispatchInfoId'";
 $DispatchLineItems = getResultAsObjectArray($connect, $fetchsql);

 $fetchsql = "SELECT * FROM `interstate_warehouse_dispatch_vehicle_info` where DispatchInfoId='$DispatchInfoId'";
 $TruckList = getResultAsObjectArray($connect, $fetchsql);

 
 return json_encode(["success" => 1, "results" => $tableRecords,"DispatchLineItems"=>$DispatchLineItems,"TruckList"=>$TruckList,"VehDetails"=>$VehDetails]);
}    
function GetPoDetailsBySaleInvoiceNo($connect,$record){
  $id= $record->id;
  /*$fetchsql = "select id, poNumber, poLineItem, deliveryNo, deliveryDate, deliveryQuantity, uom, movementType, materialDocumentNumber,
   materialDocumentDate, saleInvoiceNumber, saleInvoiceDate, sisterConcernFrom, sendingStorageLocation, sisterConcernTo, 
   receivingStorageLocation, materialNo, wheatVariety, stockSegment from interstate_sap_to_pp where SaleInvoiceNumber='$id'";*/
   $fetchsql = "select a.id, poNumber, poLineItem, deliveryNo, deliveryDate, deliveryQuantity, uom, movementType, materialDocumentNumber,
   materialDocumentDate, saleInvoiceNumber, saleInvoiceDate, 
   sisterConcernFrom, concat(sisterConcernFrom,'-',b.PLANT_NAME) as sisterConcernFromDesc,
    sendingStorageLocation,  concat(sendingStorageLocation,'-',d.STORAGE_LOCATION) as sendingStorageLocationDesc,
    sisterConcernTo, concat(sisterConcernTo,'-',c.PLANT_NAME) as sisterConcernToDesc,
   receivingStorageLocation,   concat(receivingStorageLocation,'-',e.STORAGE_LOCATION) as receivingStorageLocationDesc,
   materialNo, wheatVariety, stockSegment 
   from interstate_sap_to_pp a
   LEFT JOIN master_plant b ON a.sisterConcernFrom=b.WERKS
   LEFT JOIN master_plant c ON a.sisterConcernTo=c.WERKS
   LEFT JOIN master_storage d ON a.sendingStorageLocation=d.LGORT
   LEFT JOIN master_storage e ON a.receivingStorageLocation=e.LGORT
   where SaleInvoiceNumber='$id'";
   
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $tableRecords,]);
}

function UpdateDispatchStatus($connect,$record){
  
  $id= mysqli_real_escape_string($connect, trim($record->id));

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");

  $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS=".StatusConstant::$COMPLETED.",PortReceiptDt='$CurrentDateTime',PortReceiptByName='$SessionUserName',PortReceiptBy='$SessionUser' where id = (select VehicleArrivalId from interstate_container_details where PortDispatchId=$id limit 1)";
  mysqli_query($connect, $sql);
  $sql = "UPDATE interstate_port_dispatch_info set IsApproved=1 where Id = " . $id;
  mysqli_query($connect, $sql);
  return json_encode(["success" => 1, "results" => ""]);
}
function fetchContainer($connect){
  $fetchsql = "select distinct CONTAINER_NO as value, CONTAINER_NO as label, id  as vehilceArraivalId from empty_vehicle_arrival where VEHICLE_STATUS=9";
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $tableRecords,]);
}
function GetEntriesAtPort($connect,$record){
  $searchTxt=$record->searchTxt;
  $ScreenName=$record->ScreenName;
  $SearchCondition="";
  if($searchTxt!=""){
$SearchCondition="AND (
  vesselName like '%$searchTxt%'
  OR vesselNo like '%$searchTxt%'
  OR date_format(VesselDispatchDate,'%d-%m-%Y') like '%$searchTxt%'
  OR portOfLoading like '%$searchTxt%'
  OR portOfDischarge like '%$searchTxt%'
  OR TIMESTAMPDIFF(DAY,VesselDispatchDate,Eda) like '%$searchTxt%'
)";
  }
  $fetchsql = "select '".$ScreenName."' as ScreenName,null as Endtime,DateAdded,DateModified,id,vesselName,vesselNo,isApproved,portOfLoading,portOfDischarge,
  date_format(VesselDispatchDate,'%d/%m/%Y') as VDispatchDate,date_format(Eda,'%d/%m/%Y') as Eda,
  (SELECT count(DISTINCT ContainerNo) FROM `interstate_container_details`  where PortDispatchId=a.Id) as NoOfContainer,
  TIMESTAMPDIFF(DAY,VesselDispatchDate,Eda) as Duration
  from interstate_port_dispatch_info a where isApproved<>1 or isApproved is null ".$SearchCondition." order by id desc limit " .
  $record->startCount . ",".$record->pageSize;
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
 // return json_encode(["success" => 1, "results" => $tableRecords]);

  $countsql = "select count(id) as total from interstate_port_dispatch_info where isApproved<>1 or isApproved is null "; 
  $total = getFieldValue($connect, $countsql,0);


  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
}

function getFields(){
  return "di.arrivalId, di. truckNo, di.portOfLoading, di.portOfDischarge, di.eda,di. wbLoadWt,di. wbNetWt, di.gunnyLessNetWt, di.stuffingVendor, di.yarToPortFrtVendor, di.linerName, di.fumigation, di.fumigationVendorName, di.fumigationRatePerC, di.stuffingRate, di.yardToPortRate, di.linerOceanFrt, di.serialNo as sealNumber, di.customDocumentCopy, di.eWayBillCopy, di.nagaWbCopy, di.saleInvoiceCopy, di.loadingDate, di.supplierName, di.loadingType, di.totalBags, 

  va.PLANT_ID as plantId,  va.id as vehilceArraivalId, va.Container_no as containerNo, va.container_type as containerType , sap.DeliveryQuantity as invoiceQuantity, sap.poNumber, sap.wheatVariety,sap.deliveryNo, sap.saleInvoiceNumber,  portOfLoading, portOfDischarge, 
  
po.sisterConcernFrom, po.receivingStorageLocation,po.materialNo,po.lineItem,po.packedType,po.bagType,po.noOfBags,po.gunnyWt,po.sendingStorageLocation,po.salesInvoice, po.sisterConcernTo,linerName, eda,
  di.arrivalid,
  loadingDate";
}

function GetEntriesAtPortById($connect,$record){
  $id= $record->id;
  $fetchsql = "select id,eda,vesselDispatchDate,customDocumentCopy,vesselName,vesselNo,portOfLoading,portOfDischarge,isApproved from interstate_port_dispatch_info where id=".$id;
  $tableRecords = getSingleAsObject($connect, $fetchsql);

 $fetchsql = "select ".getFields() ." from empty_vehicle_arrival va
 join interstate_warehouse_dispatch_info di on di.arrivalid=va.id
 join interstate_warehouse_dispatch_lineitem po on di.id=po.DispatchInfoId 
 join interstate_sap_to_pp sap on po.PoNumber = sap.PoNumber and sap.deliveryNo=po.deliveryNo  and po.materialNo=sap.MaterialNo
 where va.VEHICLE_STATUS in (10,12) and va.Container_No in (
select distinct containerNo from  interstate_container_details cd join 
interstate_port_dispatch_info pi on pi.id=cd.portDispatchId where cd.PortDispatchId=$id
 )";

  $container = getResultAsObjectArray($connect, $fetchsql );

  return json_encode(["success" => 1, "results" => ["details" => $tableRecords, "container" => $container]]);
}
function UpdatePortDispatchInfo($connect,$record)
{  
 
  try{
   
    $id = $record->id;
    $sql = "select id from interstate_port_dispatch_info where id=$id and IsApproved=1";
    if(isExist($connect,$sql)){
      return json_encode(["success" => 0, "error"=> "Already approved!! Container details can't be updated" ]);
    }

    mysqli_begin_transaction($connect);
    $sql = "select distinct ContainerNo from interstate_container_details where PortDispatchId =".$id."";

    $containerNos = getResultAsArray($connect,$sql);

    $sql = "delete from interstate_container_details where PortDispatchId =".$id."";
    updateData($connect, $sql);  

    $newContainers = [];
    if(isset($record->containerDetails)){
      $con = $record->containerDetails;   
      foreach ($con as $co) {
        array_push($newContainers,$co->ContainerNo);
        $fields = ["PortDispatchId"];
        $values = [$id];
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
    $newContainers = array_unique($newContainers);

    //container to release
    $containerToUpdate = [];
    foreach($containerNos as $cno){
      if( !in_array($cno, $newContainers)){
        array_push($containerToUpdate,$cno);
      }
    }
    // echo var_dump($containerToUpdate );
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    foreach ($containerToUpdate as $con) {
     
      $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS=9,PortDispatchByName='$SessionUserName',PortDispatchDt='$CurrentDateTime',PortDispatchBy='$SessionUser' where CONTAINER_NO = '" . $con . "' and VEHICLE_STATUS=10";
      updateData($connect, $sql);
    }

    //container to add
    $containerToUpdate = [];
    foreach($newContainers as $cno){
      if( !in_array($cno, $containerNos)){
        array_push($containerToUpdate,$cno);
      }
    }
    // echo var_dump($containerToUpdate );
    foreach ($containerToUpdate as $con) {
     
      $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS=10,PortDispatchDt='$CurrentDateTime',PortDispatchBy='$SessionUser' where CONTAINER_NO = '" . $con . "' and VEHICLE_STATUS=9";
      updateData($connect, $sql);
    }


    if (mysqli_commit($connect)) { 
      return json_encode(["success" => 1, "result" => true]);    
    }
    else{
      return json_encode(["success" => 0]);
    }
  }
  catch(Exception $exception) {
    if(mysqli_rollback($connect)){
      return json_encode(["success" => 0, "rollback"=> true, "ex"=>$exception]);
    }
    return json_encode(["success" => 0]);
  }
}
function AddPortDispatchInfo($connect,$record)
{ 
  $fieldsToAdd = $record->fieldsToAdd;
  $fields = [];
  $values = [];
  foreach ($fieldsToAdd as $key => $value) {
    $key = mysqli_real_escape_string($connect, $key);
    array_push($fields,$key);
    $fld = mysqli_real_escape_string($connect, $value);
    array_push($values,$fld);
  }
  
  try{
    mysqli_begin_transaction($connect);
    $sql = "insert into interstate_port_dispatch_info(" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
    $newId = insertData($connect, $sql);  

    $containerNos = [];
    if(isset($record->containerDetails)){
      $con = $record->containerDetails;   
      
      foreach ($con as $co) {
        array_push($containerNos,$co->ContainerNo );
        $fields = ["PortDispatchId"];
        $values = [$newId];
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

    $uniqContainerNos = array_unique($containerNos);
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    foreach ($uniqContainerNos as $con) {
      $sql = "UPDATE empty_vehicle_arrival set VEHICLE_STATUS=10,PortDispatchByName='$SessionUserName',PortDispatchDt='$CurrentDateTime',PortDispatchBy='$SessionUser' where CONTAINER_NO = '" . $con . "' and VEHICLE_STATUS=9";
      updateData($connect, $sql);
    }
    if (mysqli_commit($connect)) { 
      return json_encode(["success" => 1, "result" => true]);    
    }
    else{
      return json_encode(["success" => 0]);
    }
  }
  catch(Exception $exception) {
    if(mysqli_rollback($connect)){
      return json_encode(["success" => 0, "rollback"=> true]);
    }
    return json_encode(["success" => 0]);
  }
}


function GetDetailsByPo($connect,$record){
  $id= mysqli_real_escape_string($connect, trim($record->poNumber));
  $sql = "select * from interstate_sap_to_pp where ponumber ='".$id."' limit 1";
  $tableRecords = getSingleAsObject($connect, $sql);
  return json_encode(["success" => 1, "results" => $tableRecords]);
}
function GetDetailsByContainerId($connect,$record){
  $id= $record->containerId;
  $status = ["9"];
  if(isset($record->status)){
    $status=$record->status;
  }
  $sql = "select ".getFields() ." from empty_vehicle_arrival va
  join interstate_warehouse_dispatch_info di on di.arrivalid=va.id
  join interstate_warehouse_dispatch_lineitem po on di.id=po.DispatchInfoId 
  join interstate_sap_to_pp sap on po.PoNumber = sap.PoNumber and sap.deliveryNo=po.deliveryNo and po.materialNo=sap.MaterialNo
  where va.Container_no in ('".join("','", $id) ."') and va.VEHICLE_STATUS in (".join(",", $status).")";
  // echo  $sql;
  $tableRecords = getResultAsObjectArray($connect, $sql);
  return json_encode(["success" => 1, "results" => $tableRecords]);
}
?>
