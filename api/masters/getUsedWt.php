<?php
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entitysupBody = json_decode(file_get_contents("php://input"));
echo getUsedWt($connect, $entitysupBody->po, $entitysupBody->supplierId);
$connect->close();
function getUsedWt($connect, $id, $supplierId)
{
  $fetchsql = "select MENGE, MEINS from sap_to_pp where EBELN = '" . $id . "' and SUPPLIER_CODE='" . $supplierId . "'";
  $tabledata = mysqli_query($connect, $fetchsql);
  $i = 0;
  $records = [];
  if (mysqli_num_rows($tabledata) > 0) {
    // output data of each row
    while ($row = mysqli_fetch_assoc($tabledata)) {
      $records[0]["SUP_QTY"] = $row["MENGE"];
      $records[0]["SUP_QTY_UOM"] = $row["MEINS"];

      $zqtySql =
        "select sum(ZQTY) as ZQTY from purchase_info where ZPO_NUMBER ='" . $id . "' and ZSUPPLIER_CODE='" . $supplierId . "' LIMIT 1";
      $records[0]["NET_WT"] = getFieldValue($connect, $zqtySql, 0);
    }
    return json_encode(["success" => 1, "results" => $records[0]]);
  } else {
    return json_encode(["success" => 0]);
  }
}
?>
