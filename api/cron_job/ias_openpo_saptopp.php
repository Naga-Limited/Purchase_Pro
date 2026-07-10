<?php
$PageName=basename($_SERVER['PHP_SELF']);

$SAP_HOSTNAME = "10.10.63.139";//SAP HOST NAME nfapplqua1.nagaltd.com
//$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";
//http://10.10.63.139:50000/warehouse/warehouse?sap-client=900
//http://nfapplqua.nagaltd.com:50000/zwh_iaspo/iaspo?sap-client=900

include_once APIPATH. "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");

$curl = curl_init();
curl_setopt_array($curl, array(
  // CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/zwh_iaspo/iaspo?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  CURLOPT_HTTPHEADER => array(
  'Authorization: Basic bmFnYWFiYXA6TmFnYUAxMjM0NQ=='
                        
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));
$response = curl_exec($curl);//UNCOMMENT
curl_close($curl);
// echo $response;
//COMMENT FOLLOWING LINE
// $response = '[{"PO":"1700029743","PO_LINE":10,"MATERIAL_CODE":"WHR-E","WHEAT_VARIETY":"RAJASTHAN-BIKANER-1482","REC_PLANT":"1114","REC_STO_LOC":"K001","PO_QTY":1000.000,"UOM":"KG","SECMENT":"RRJBIBISE01","SENDING_PLANT":"1119","UPDATE":"I"}]';
$sql = "INSERT INTO `ngw_sap_to_pp_api_log`(`saptopp_api_name`, `api_response`, `insdt`, `process_status`) 
VALUES ('$PageName','$response',current_timestamp, 'RECEIVED')";
    $Insert=mysqli_query($connect,$sql);
$InsertId = mysqli_insert_id($connect);
//, `numrec_received`, `numrec_completed`
 //var_dump($response);exit();
$Data=json_decode($response);
 var_dump($Data);
// exit();
$process_status='INPROGRESS';
$sql = "update ngw_sap_to_pp_api_log set numrec_received=".sizeof($Data). ", process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);


for($i=0;$i<sizeof($Data);$i++){
  if($Data[$i]->Update_Flag=="I")
  {
  var_dump($Data[$i]);
  }
$PoNumber=$Data[$i]-> PO;
$PoLineItem=$Data[$i]-> PO_LINE;
$materialno=$Data[$i]-> MATERIAL_CODE;
$WheatVariety=$Data[$i]-> WHEAT_VARIETY;
$ReceivingPlant=$Data[$i]-> REC_PLANT;
$ReceivingStorageLoc=$Data[$i]-> REC_STO_LOC;
$PO_Quantity=$Data[$i]-> PO_QTY;
$UOM=$Data[$i]-> UOM;
$Segment=$Data[$i]-> SECMENT;
$SendingPlant=$Data[$i]-> SENDING_PLANT;
$Update_Flag=$Data[$i]-> UPDATE;

$Freight_Charges=$Data[$i]->FREIGHT;
$Loading_Charges=$Data[$i]->LOADING;
$Unloading_Charges=$Data[$i]->UNLOADING;

if(empty($Freight_Charges)){$Freight_Charges='0';}
if(empty($Loading_Charges)){$Loading_Charges='0';}
if(empty($Unloading_Charges)){$Unloading_Charges='0';}

$PlantId=getPlantId($connect,$PlantWerks, $WarehouseCode);
$WheatVarietyId=getWheatVarietyId($connect,$WheatVarietySegment);
$StorageLocationId=getStorageLocationId($connect,$StorageLocation, $PlantId, $WarehouseId);
$WarehouseId=getWarehouseId($connect,$WarehouseCode);


if($Update_Flag=="D" || $Update_Flag=="U"){
  if($Data[$i]->LGPLA=="AR02C05")
  echo $Qry."-".$Update_Flag."<br>";
}

if($Update_Flag=="I"){
 $Qry="INSERT INTO `intrastate_sap_to_pp` (`SendingPlant`, `materialno`, `Segment`, `WheatVariety`, `ReceivingPlant`, `ReceivingStorageLoc`, `StoPoNo`, `PoNumber`, `PoLineItem`, `PO_Quantity`, `UOM`, `Update_Flag`, `InsDt`,`PODt` `recstatus`,
 Freight_Charges,Loading_Charges,Unloading_Charges
        ) 
        VALUES ('$SendingPlant', '$materialno', '$Segment', '$WheatVariety', '$ReceivingPlant', '$ReceivingStorageLoc', '$StoPoNo', '$PoNumber', '$PoLineItem', '$PO_Quantity', '$UOM', '$Update_Flag',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP, '1',
        '$Freight_Charges','$Loading_Charges','$Unloading_Charges'
        )";
  echo "<Br>".$Qry;
}

else if($Update_Flag=="U"){
 $Qry="UPDATE `intrastate_sap_to_pp` SET `SendingPlant`='$SendingPlant', `materialno`='$materialno', `Segment`='$Segment', `WheatVariety`='$WheatVariety', `ReceivingPlant`='$ReceivingPlant', `ReceivingStorageLoc`='$ReceivingStorageLoc', `StoPoNo`='$StoPoNo', `PoNumber`='$PoNumber', `PoLineItem`='$PoLineItem', `PO_Quantity`='$PO_Quantity', `UOM`='$UOM', `Update_Flag`='$Update_Flag',`recstatus`='$recstatus', `ModDt`=current_timestamp, `PODt`=CURRENT_TIMESTAMP WHERE PoNumber='$PoNumber'";
  echo "<Br>".$Qry;
}
else
{
 $Qry="UPDATE `intrastate_sap_to_pp` SET `SendingPlant`='$SendingPlant', `materialno`='$materialno', `Segment`='$Segment', `WheatVariety`='$WheatVariety', `ReceivingPlant`='$ReceivingPlant', `ReceivingStorageLoc`='$ReceivingStorageLoc', `StoPoNo`='$StoPoNo', `PoNumber`='$PoNumber', `PoLineItem`='$PoLineItem', `PO_Quantity`='$PO_Quantity', `UOM`='$UOM', `Update_Flag`='$Update_Flag', `recstatus`='0',`ModDt`=current_timestamp, `PODt`=CURRENT_TIMESTAMP WHERE PoNumber='$PoNumber'";
  echo "<Br>".$Qry;
}
$Insert=mysqli_query($connect,$Qry);

if(($i+1)==sizeof($Data))
{
$process_status='COMPLETED';
}

$sql = "update ngw_sap_to_pp_api_log set numrec_completed='".($i+1). "', process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);


}
// }

function getPlantId($connect,$WarehouseId,$PlantId){
  // $Qry="SELECT id, werks, PLANT_NAME FROM `master_plant` WHERE werks='$ReceivingPlant' ";
  // $Qry="SELECT id, werks, PLANT_NAME FROM `master_plant` WHERE werks='$SendingPlant' ";
  $Qry="SELECT ID, werks, PLANT_NAME FROM `master_plant` WHERE werks='$PlantId' ";
  
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);

  return $Fetch;
}

function getStorageLocationId($connect,$Code, $PlantId, $WarehouseId){
  // $Qry="SELECT STORAGE_REFID FROM `master_storage` where WERKS='$Code' and plantid =  '$ReceivingPlant'";
  $Qry="SELECT STORAGE_REFID FROM `master_storage` where `LGORT`='$Code' AND `plantid`='$PlantId'";
  
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['STORAGE_REFID'];
}
function getWheatVarietyId($connect,$Code){
  $Qry="SELECT Id FROM `master_mrc_wheat_variety` WHERE upper(Segment)='$Code'";
  
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['Id'];
}

function getWarehouseId($connect,$Code){
  $Qry="SELECT wh_refid FROM `warehouse_master` WHERE wh_code='$Code'";
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['wh_refid'];
}