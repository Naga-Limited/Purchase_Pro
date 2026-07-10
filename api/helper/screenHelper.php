<?php

function getTblNameByModuleId($connect, $moduleId)
{
  $fetchTblSql = "select SCREEN_NAME from module_master where MODULE_ID ='" . $moduleId . "' LIMIT 1";
  $tresult = mysqli_query($connect, $fetchTblSql);
  $tblInfo = $tresult->fetch_assoc();
  return mysqli_real_escape_string($connect, trim($tblInfo["SCREEN_NAME"]));
}

?>
