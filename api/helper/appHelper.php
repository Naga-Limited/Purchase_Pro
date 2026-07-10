<?php
include_once "queryHelper.php";
function getAutoValue($connect, $moduleId, $whcode, $vaTbl)
{
  $screenType = $moduleId;
  if($moduleId === "SDI"){
    $screenType = "SDT";
  }
  $today = getdate(date("U"));
  $code = "RM".$screenType . $whcode . substr($today["year"], 2, 2);
  // $zanumsql3 = "select ZVA_NUMBER from " . $vaTbl . " where ZVA_NUMBER like '" . $code . "%' ORDER BY PI_REFID AND ZVA_NUMBER DESC LIMIT 1";
  $zanumsql3 = "select ZVA_NUMBER from " . $vaTbl . " where ZVA_NUMBER like '" . $code . "%' AND LENGTH(ZVA_NUMBER)!= '20' AND ZVA_NUMBER != '' ORDER BY PI_REFID DESC LIMIT 1";
  // print_r($zanumsql3);
  $zanumresult = mysqli_query($connect, $zanumsql3);
  if (mysqli_num_rows($zanumresult) > 0) {
    $zanumdata = $zanumresult->fetch_assoc();
    $zancode = mysqli_real_escape_string($connect, trim($zanumdata["ZVA_NUMBER"]));
    $newzancode = str_replace($code, "", $zancode);
    (int) $newzancode++;
    $gentrate_code = $code.sprintf("%08d", $newzancode);
    $zanumsql4 = "select ZVA_NUMBER from " . $vaTbl . " where ZVA_NUMBER='$gentrate_code'";
    $zanumresult1 = mysqli_query($connect, $zanumsql4);
    if(mysqli_num_rows($zanumresult1) > 0){
    $zanumsql3 = "select ZVA_NUMBER from " . $vaTbl . " where ZVA_NUMBER like '" . $code . "%' AND LENGTH(ZVA_NUMBER)!= '20' AND ZVA_NUMBER != '' ORDER BY ZVA_NUMBER DESC LIMIT 1";
    $zanumresult = mysqli_query($connect, $zanumsql3);
    $zanumdata = $zanumresult->fetch_assoc();
    $zancode = mysqli_real_escape_string($connect, trim($zanumdata["ZVA_NUMBER"]));
    $newzancode = str_replace($code, "", $zancode);
    (int) $newzancode++;
    $gentrate_code = $code.sprintf("%08d", $newzancode);
    return $gentrate_code;
    }
    return $gentrate_code;
  } else {
    return $code . sprintf("%08d", 1);
  }
}

function getPrivilegeByUser($connect, $userid)
{
  $pfields = "PRIVILEGE_NAME";
  $plantSql = "select " . $pfields . " from view_user_privilege where USER_ID = '" . $userid."'";
  //echo $plantSql;exit();
  return getResultAsObject($connect, $plantSql, $pfields);
}

function isOwnWB($connect,$Plant){
  $Qry="SELECT OwnWB FROM `master_plant` where WERKS='$Plant' and RecStatus='1' limit 1";
  $Select = mysqli_query($connect, $Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['OwnWB']; 

}
function CheckisOwnWBFromPOID($connect,$POId){
  $Qry="SELECT WERKS FROM `purchase_info`  where PI_REFID='$POId'";
  //echo $Qry;
  $Select = mysqli_query($connect, $Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  $exp=explode("-",$Fetch['WERKS']);
  return isOwnWB($connect,$exp[0]); 

}
function CheckisOwnWBFromEMPTYVA($connect,$Id){
  $Qry="SELECT PLANT_ID FROM `empty_vehicle_arrival`  where ID='$Id'";
  //echo $Qry;
  $Select = mysqli_query($connect, $Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  $exp=explode("-",$Fetch['PLANT_ID']);
  return isOwnWB($connect,$exp[0]); 

}
function getScreenTypeOfPO($connect,$POId){
  $Qry="SELECT SCREEN_TYPE FROM `purchase_info`  where PI_REFID='$POId'";

  $Select = mysqli_query($connect, $Qry);
  $Fetch=mysqli_fetch_assoc($Select);
 
  return $Fetch['SCREEN_TYPE']; 

}

?>
