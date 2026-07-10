<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$postData = json_decode(file_get_contents("php://input"));
$formType = isset($_GET["formType"])? $_GET["formType"]: $postData->formType;
switch ($formType) {     
  case "GetAllSdiVehicle":
      echo GetAllSdiVehicle($connect);
    break;          
  case "GetAllSdiPo":
      echo GetAllSdiPo($connect);
    break;         
  case "GetAllLineItem":
      echo GetAllLineItem($connect);
    break;           
  case "GetStorageLocation":
      echo GetStorageLocation($connect,$postData);
    break;             
  case "UpdateLineItemInVehicle":
    echo UpdateLineItemInVehicle($connect,$postData);
  break;
}
$connect->close();

function UpdateLineItemInVehicle($connect,$postData){
  $id = mysqli_real_escape_string($connect, trim($postData->id));
  $lineItem = mysqli_real_escape_string($connect, trim($postData->lineItem));
  $sql = "update supplier_vehical_info set LINE_ITEM='$lineItem' where SUP_VE_REFID=$id";
  $res = updateData($connect, $sql);
  return json_encode(["success" => 1, "results" => $res]);
}

function GetStorageLocation($connect,$postData){
  $po = mysqli_real_escape_string($connect, trim($postData->po));
  $lineItem = mysqli_real_escape_string($connect, trim($postData->lineItem));
  $plantSql = "select distinct LGORT as location, WERKS as plant, IDNLF as wheatVariety from sap_to_pp where EBELN='$po' and EBELP='$lineItem'";
  $res = getSingleAsObject($connect, $plantSql);
  return json_encode(["success" => 1, "results" => $res]);
}
function GetAllLineItem($connect){
  $plantSql = "select distinct ZPO_NUMBER as label, ZPO_NUMBER as value  from supplier_dispatch_info di join supplier_vehical_info vi on vi.SUPPLIER_ID=di.SD_REFID where vi.VEHICLE_ARRIVED=0";
  $res = getResultAsObjectArray($connect, $plantSql);
  return json_encode(["success" => 1, "results" => $res]);
}

// function GetAllSdiPo($connect){
//   $plantSql = "select distinct ZPO_NUMBER as label, ZPO_NUMBER as value  from supplier_dispatch_info di join supplier_vehical_info vi on vi.SUPPLIER_ID=di.SD_REFID where vi.VEHICLE_ARRIVED=0";
//   $res = getResultAsObjectArray($connect, $plantSql);
//   return json_encode(["success" => 1, "results" => $res]);
// }

function GetAllSdiVehicle($connect){
  // $plantSql = "select distinct PLANT_CODE as label, PLANT_CODE as value  from supplier_vehical_info where";
  // $po = $_GET["po"];
  $plantSql = "select distinct vi.VEHICAL_NO as label, vi.VEHICAL_NO as value ,di.ZPO_NUMBER as po, di.ZSUPPLIER_NAME, vi.SUP_VE_REFID as id from supplier_dispatch_info di join supplier_vehical_info vi on vi.SUPPLIER_ID=di.SD_REFID where vi.VEHICLE_ARRIVED=0";
  $res = getResultAsObjectArray($connect, $plantSql);
  return json_encode(["success" => 1, "results" => $res]);
}
?>
