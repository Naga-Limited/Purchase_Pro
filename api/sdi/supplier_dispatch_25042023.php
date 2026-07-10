<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
date_default_timezone_set("Asia/Calcutta");
$entityPOContent = json_decode(file_get_contents("php://input"));
echo fetchPODetailsById($connect, $entityPOContent);
$connect->close();

function fetchPODetailsById($connect, $record)
{
  $PO_NUMBER = $record->PO_NUMBER;
  $ZPO_LINE_ITEM = $record->ZPO_LINE_ITEM;
  $ZSUPPLIER_CODE = $record->ZSUPPLIER_CODE;
  $fetchsql =
    "SELECT stp.refid, EBELN, EBELP, BROCKER_CODE, BROCKER_NAME, MENGE, MEINS, IDNLF, MATNR, SGT_SCAT, NETPR, PLANT_NAME, STORAGE_LOCATION, LOEKZ, INCO1, INCO_DESC, BSART, DATE_FORMAT(PO_LOADING_DATE,'%d-%m-%Y') as POLOADINGDATE, NUMBER_OF_VEHICLES, PURCHASE_ORG, PURCHASE_ORG_DESC as VEHICLETYPE, BAG_NAME as PO_Bag_Type, mpi.WERKS as plant_id 
    FROM
    sap_to_pp stp 
    LEFT JOIN master_storage msi ON stp.LGORT = msi.LGORT
    LEFT JOIN master_plant mpi ON stp.WERKS = mpi.WERKS
    LEFT JOIN master_bag ON PO_BAG_TYPE = BAG_CODE
    LEFT JOIN master_inco ON INCO1 = INCO_TERMS
    WHERE stp.EBELN ='" .
    $PO_NUMBER .
    "' and EBELP = '" .
    $ZPO_LINE_ITEM .
    "' and SUPPLIER_CODE = '" .
    $ZSUPPLIER_CODE .
    "' LIMIT 1";
  $poData = getResultAsObjectArray($connect, $fetchsql);
  return json_encode(["success" => 1, "results" => $poData]);
}
