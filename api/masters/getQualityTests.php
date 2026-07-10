<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entityQCBody = json_decode(file_get_contents("php://input"));
if($entityQCBody->formType=="IAS"){
  echo fetchDeviceTypeQC_IAS($connect, $entityQCBody);
}
else if($entityQCBody->formType=="STM"){
  echo fetchDeviceTypeQC_STM($connect, $entityQCBody);
}
else{
  echo fetchDeviceTypeQC($connect, $entityQCBody);
}

$connect->close();
function fetchDeviceTypeQC_STM($connect, $record)
{
  $wvcode = mysqli_real_escape_string($connect, trim($record->wvcode));
  $qt = $record->qctest . " = 'Yes'";
  $fields = "QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax";
  $fetchsql1 =
    "select " .
    $fields .
    ", '' as qvalue from master_quality_check_stm qc
    left join master_quality_preferred qp on qc.field_map = qp.fieldMap
    where IDNLF = '" .
    $wvcode .
    "' and " .
    $qt .
    " ORDER BY qp.FieldOrder";
  $qmResults = getResultAsObjectArray($connect, $fetchsql1);
  return json_encode(["success" => 1, "results" => $qmResults]);
}
function fetchDeviceTypeQC_IAS($connect, $record)
{
  $wvcode = mysqli_real_escape_string($connect, trim($record->wvcode));
  $qt = $record->qctest . " = 'Yes'";
  $fields = "QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax";
  $fetchsql1 =
    "select " .
    $fields .
    ", '' as qvalue from master_quality_check_ias qc
    left join master_quality_preferred qp on qc.field_map = qp.fieldMap
    where IDNLF = '" .
    $wvcode .
    "' and " .
    $qt .
    " ORDER BY qp.FieldOrder";
  $qmResults = getResultAsObjectArray($connect, $fetchsql1);
  return json_encode(["success" => 1, "results" => $qmResults]);
}

function fetchDeviceTypeQC($connect, $record)
{
  $wvcode = mysqli_real_escape_string($connect, trim($record->wvcode));
  $qt = $record->qctest . " = 'Yes'";
  $fields = "QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax";
  $fetchsql1 =
    "select " .
    $fields .
    ", '' as qvalue from master_quality_check qc
    left join master_quality_preferred qp on qc.field_map = qp.fieldMap
    where IDNLF = '" .
    $wvcode .
    "' and " .
    $qt .
    " ORDER BY qp.FieldOrder";
  $qmResults = getResultAsObjectArray($connect, $fetchsql1);
  return json_encode(["success" => 1, "results" => $qmResults]);
}
?>
