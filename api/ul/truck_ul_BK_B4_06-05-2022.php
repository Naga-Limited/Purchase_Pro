<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
include_once APIPATH."/helper/appHelper.php";
date_default_timezone_set("Asia/Calcutta");
$entityULContent = json_decode(file_get_contents("php://input"));

if ($entityULContent->formType === "PO") {
  echo fetchPODetailsById($connect, $entityULContent);
} else {
  echo addUnloadingdetails($connect, $entityULContent);
}

$connect->close();
function fetchPODetailsById($connect, $record)
{
  $fields =
    "PI_REFID,InvoiceQty as invoice_qty,InvoiceRate as invoice_rate,InvoiceCopy as INV_COPY,WBCopy as WB_COPY, ZPO_NUMBER,ZVA_NUMBER, PO_LINE_ITEM, TRUCK_NO, CONTAINER_NO, DRIVER_NO, ZVENDOR_NAME, IDNLF, SCREEN_TYPE, VEHICLE_TYPE, NETPR, PLANT_NAME, STORAGE_LOCATION, MATNR, INCO_DESC, ZSUPPLIER_NAME, ZSUPPLIER_CODE, BAG_NAME,pi.WERKS as FromWERKS";
  $fetchsql =
    "select " .
    $fields .
    " from purchase_info pi LEFT Join master_storage msi ON msi.LGORT = pi.LGORT LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS LEFT Join master_inco ON INCO1 = INCO_TERMS LEFT Join master_bag ON PO_BAG_TYPE = BAG_CODE where PI_REFID ='" .
    $record->id .
    "'LIMIT 1 ";
  ///echo $fetchsql;
 // exit();
  $poData = getResultAsObjectArray($connect, $fetchsql);

  if(count($poData)>0){

    $poData[0]["invoice_rate"] = $poData[0]['invoice_rate'];
    $poData[0]["invoice_qty"] = $poData[0]['invoice_qty'];

    $FromPlant=$poData[0]['FromWERKS'];
     $Qry="SELECT ToPlant FROM `pp_plantchildmapping` where FromPlant='$FromPlant'  and RecStatus='1'";
    $ToPlant = getResultAsObjectArray($connect, $Qry);
     $poData[0]["MappedPlant"] = $ToPlant[0]['ToPlant'];  

    $sql = "select recommended_lot from quality_info where purchase_info_id='". $record->id."'";
    $poData[0]["RECOMMENDED_LOT"] = getFieldValue($connect,$sql,"");
    $poNumber = $poData[0]["ZPO_NUMBER"];
    $vheNumber = ($poData[0]["CONTAINER_NO"])?$poData[0]["CONTAINER_NO"]:$poData[0]["TRUCK_NO"];
    $lineItem = $poData[0]["PO_LINE_ITEM"];
    $supplierCode = $poData[0]["ZSUPPLIER_CODE"];
   $sql2 = "SELECT WB_QTY, WB_DT, ZSUPPLIER_INV_RATE, ZSUPPLIER_INV_NO, ZSUPPLIER_INV_DT, ZSUPPLIER_INV_QTY, INV_COPY, WB_COPY FROM supplier_vehical_info JOIN supplier_dispatch_info ON SUPPLIER_ID = SD_REFID WHERE (VEHICAL_NO = '".$vheNumber."' AND ZPO_NUMBER = '".$poNumber."' AND 	ZSUPPLIER_CODE = '".$supplierCode."' AND LINE_ITEM = '".$lineItem."') LIMIT 1";
    $formData = getResultAsObjectArray($connect, $sql2);
    //echo var_dump($formData);
    if(count($formData)>0){
      $poData[0]["supplier_wb_qty"] = $formData[0]['WB_QTY'];
     // $poData[0]["invoice_rate"] = $formData[0]['ZSUPPLIER_INV_RATE'];
      $poData[0]["invoice_date"] = $formData[0]['ZSUPPLIER_INV_DT'];
      $poData[0]["invoice_no"] = $formData[0]['ZSUPPLIER_INV_NO'];
     // $poData[0]["invoice_qty"] = $formData[0]['ZSUPPLIER_INV_QTY'];
      $poData[0]["supplier_wb_dt"] = $formData[0]['ZSUPPLIER_INV_DT'];
      $poData[0]["INV_COPY"] = $formData[0]['INV_COPY'];
      $poData[0]["WB_COPY"] = $formData[0]['WB_COPY'];      
    }
  } 
 
   return json_encode(["success" => 1, "results" => $poData]);
}
function addUnloadingdetails($connect, $record)
{
 // var_dump($record);exit();
  $gFields = ["bag_type","bag_type2","bag_type3", "no_bags","no_bags2","no_bags3", "gunny_wt", "unload_lot","invoice_date","invoice_no","invoice_qty","invoice_bag_count","invoice_rate","supp_inv_copy","supp_wb_copy","supplier_wb_dt","supplier_wb_qty"];

  $id = mysqli_real_escape_string($connect, trim($record->id));
  $fields = [];
  $values = [];
  $sqlFields = [];
  foreach ($gFields as $gfield) {
    if (isset($record->{$gfield})) {
      array_push($fields, $gfield);
      array_push($values, mysqli_real_escape_string($connect, trim($record->{$gfield})));
      array_push($sqlFields, $gfield . "= '" . mysqli_real_escape_string($connect, trim($record->{$gfield})) . "'");
    }
  }
  $fetchG = "SELECT purchase_info_id FROM gateout_info WHERE purchase_info_id =".$id;
  $resG = getResultAsObjectArray($connect, $fetchG);
  $last_id = "";
  $gupdate = false;
  if(count($resG)>0){
    
    $updateBag = "UPDATE gateout_info SET bag_type=NULL,bag_type2=NULL,bag_type3=NULL,no_bags=0,no_bags2=0,no_bags3=0 WHERE purchase_info_id = " . $id;
    $bagUpdated = mysqli_query($connect, $updateBag);
    
    $usql = "UPDATE gateout_info SET " . join(",", $sqlFields) . " WHERE purchase_info_id = " . $id;
  $gupdate = mysqli_query($connect, $usql);
  
  }
  else{
    $sql = "INSERT INTO gateout_info (purchase_info_id, " . join(", ", $fields) . ")  VALUES('" . $id . "','" . join("', '", $values) . "')";
   // echo $sql;
   
    mysqli_query($connect, $sql);
    $last_id = $connect->insert_id;
  }
 
  if ($last_id || $gupdate ) {
  
    $ufields = [];
    $pFields = ["TRUCK_NO", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "PO_LINE_ITEM"];
    foreach ($pFields as $pfield) {
      if (isset($record->{$pfield})) {
        array_push($ufields, $pfield . "='" . mysqli_real_escape_string($connect, trim($record->{$pfield})) . "'");
      }
    }

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    
    $VehicleStatus=5; 
    //
    $ScreenType=getScreenTypeOfPO($connect,$id);
    $isOwnWb=CheckisOwnWBFromPOID($connect,$id);
    if($isOwnWb==1 && $ScreenType!="SDO"){
      $VehicleStatus=24; 
    }
    
    //
   // echo "VehicleStatus:".$VehicleStatus;
   // exit();
    
    
    $upsql = "UPDATE purchase_info SET VECHICAL_STATUS = '$VehicleStatus',UnloadWHSubmitDt='$CurrentDateTime',UnloadWHSubmitByName='$SessionUserName',UnloadWHSubmitBy='$SessionUser'," . join(",", $ufields) . " WHERE PI_REFID = " . $record->id;
   
    if (mysqli_query($connect, $upsql) == true) {
      return json_encode(["success" => 1, "result" => "both"]);
    }
    return json_encode(["success" => 0]);
  }
  return json_encode(["success" => 0]);
}
?>
