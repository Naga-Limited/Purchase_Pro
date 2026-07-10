<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";

$entityPO = json_decode(file_get_contents("php://input"));
echo fetchPOList($connect, $entityPO);
$connect->close();
function fetchPOList($connect, $record)
{
  try {
    $filter = [];
    $plantFilter = [];
    if (isset($record->plantIds)) {
      $plantIds = $record->plantIds;
      foreach ($plantIds as $plantid) {
        array_push($plantFilter, "WERKS = '" . $plantid . "'");
      }
      if(count($plantFilter)>0){
        array_push($filter, "(" . join(" OR ", $plantFilter) . ")");
      }
    }
    $cond = [];
    array_push($cond, "INCO1 = 'SDG' OR INCO1 = 'SAK' OR INCO1 = 'RDG'");
    array_push($filter, "(" . join(" OR ", $cond) . ")");

    $fetchsql =
      "select DISTINCT EBELN as value, EBELN as label, 'SDI' as mkey, PURCHASE_ORG_DESC as vehicleType from sap_to_pp where " .
      join(" AND ", $filter) .
      "  AND PURCHASE_ORG IN (12,13,14) order by EBELN desc ";
    //echo $fetchsql;
    $poRecords = getResultAsObjectArray($connect, $fetchsql);

    return json_encode(["success" => 1, "poresults" => $poRecords]);
  } catch (Throwable $th) {
    return json_encode(["success" => 0]);
  }
}

?>
