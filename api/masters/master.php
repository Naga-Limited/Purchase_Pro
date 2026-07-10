<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$postData = json_decode(file_get_contents("php://input"));
$formType = $_GET["formType"];
switch ($formType) {
  case "PortOfLoading":
    echo fetchPortOfLoading($connect);
    break;
  case "PortOfDischarge":
    echo fetchPortOfDischarge($connect);
    break;
  case "BagTypes":
    echo fetchAllBagTypes($connect);
    break;
  case "StuffingVendor":
    echo fetchStuffingVendor($connect);
    break;
  case "PortFrtVendor":
    echo fetchPortFrtVendor($connect);
    break;
  case "LinerName":
    echo fetchLinerName($connect);
    break;
  case "FumigationVendor":
      echo fetchFumigationVendor($connect);
      break;
  case "VesselName":
      echo fetchVesselName($connect);
      break;    
  case "InterComPo":
      echo fetchInterComPoList($connect);
      break;      
  case "GetFromLocation":
      echo fetchFromLocation($connect);
    break;    
  case "AllPlant":
      echo fetchAllPlant($connect);
    break;
  case "GetSalesInvoiceNo":
    echo GetSalesInvoiceNo($connect);
    break;  
  case "GetVendors":
    $category = $_GET["category"];
    echo GetVendors($connect,$category);
    break;  
    
  case "GetDeliveryNo":
    $po = $_GET["po"];
    $lineItem = $_GET["lineItem"];
    echo GetDeliveryNo($connect,$po,  $lineItem);
    break;  
    
    
}
$connect->close();
 
function GetVendors($connect,$category){  
  $category= mysqli_real_escape_string($connect, trim($category));
  $sql = "select distinct Name as label,  Code as value from master_vendor pp where Category= '$category'";
  $res = getResultAsObjectArray($connect, $sql);
  return json_encode(["success" => 1, "results" =>$res]);
}
function GetSalesInvoiceNo($connect){  
  $sql = "select distinct pp.SaleInvoiceNumber as label,  pp.SaleInvoiceNumber as value from interstate_sap_to_pp pp
  left join 
  interstate_warehouse_dispatch_info di 
  ON di.SaleInvoiceNumber = pp.SaleInvoiceNumber
  WHERE di.SaleInvoiceNumber IS NULL
  ";
  $res = getResultAsObjectArray($connect, $sql);
  return json_encode(["success" => 1, "results" =>$res]);
}
function GetDeliveryNo($connect,$po,  $lineItem){  
  $po= mysqli_real_escape_string($connect, trim($po));
  $sql = "select distinct DeliveryNo as label,  DeliveryNo as value from interstate_sap_to_pp pp where PoNumber= '$po' and PoLineItem='$lineItem'";
  $res = getResultAsObjectArray($connect, $sql);
  return json_encode(["success" => 1, "results" =>$res]);
}

function fetchAllPlant($connect){
  $plantSql = "select distinct PLANT_CODE as label, PLANT_CODE as value  from view_user_plant order by PLANT_CODE";
  $res = getResultAsObjectArray($connect, $plantSql);
  return json_encode(["success" => 1, "results" => $res]);
}

function fetchFromLocation($connect){
  $fetchsql = "select description as label, description as value from master_from_location order by state,description";

  $poRecords = getResultAsObjectArray($connect, $fetchsql);

  return json_encode(["success" => 1, "results" => $poRecords]);
}
function fetchInterComPoList($connect)
{
  try {
    // $filter = [];
    // $plantFilter = [];
    // if (isset($record->plantIds)) {
    //   $plantIds = $record->plantIds;
    //   foreach ($plantIds as $plantid) {
    //     array_push($plantFilter, "WERKS = '" . $plantid . "'");
    //   }
    //   array_push($filter, "(" . join(" OR ", $plantFilter) . ")");
    // }
    $fetchsql = "select DISTINCT PoNumber as value, PoNumber as label from interstate_sap_to_pp order by PoNumber desc ";

    $poRecords = getResultAsObjectArray($connect, $fetchsql);

    return json_encode(["success" => 1, "results" => $poRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}

function fetchVesselName($connect)
{
  $fetchsql = "select VESSEL_REFID as value, VESSEL_NAME as label from master_vessel";
  $vsData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $vsData]);
}
function fetchFumigationVendor($connect)
{
  $fetchsql = "select distinct Name as label, Code as value from master_vendor pp where Category= 'Fumigation Vendor'";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchLinerName($connect)
{
  $fetchsql = "select name as label, name as value from master_liner_name";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchPortFrtVendor($connect)
{
  $fetchsql = "select distinct Name as label, Code as value from master_vendor pp where Category= 'Yard to Port Vendor'";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchStuffingVendor($connect)
{ 
  $fetchsql = "select distinct Name as label, Code as value from master_vendor pp where Category= 'Stuffing Vendor'";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchPortOfLoading($connect)
{
  $fetchsql = "select name as label, name as value from master_port_of_loading";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchPortOfDischarge($connect)
{
  $fetchsql = "select name as label, name as value from master_port_of_discharge";
  $wrecords = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $wrecords]);
}
function fetchAllBagTypes($connect)
{
  $fetchsql = "select BAG_CODE as value, BAG_NAME as label, WEIGHT as weight from master_bag";
  $bagData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $bagData]);
}

?>
