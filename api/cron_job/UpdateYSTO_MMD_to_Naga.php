<?php
$PageName=basename($_SERVER['PHP_SELF']);
$SAP_HOSTNAME = "10.10.63.139";//SAP HOST NAME nfapplqua1.nagaltd.com
//$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";

//http://10.10.63.139:50000/warehouse/warehouse?sap-client=900

include_once APIPATH. "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
$curl = curl_init();
curl_setopt_array($curl, array(
  // CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/zwh_ysto/ysto?sap-client=900',
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

$response = curl_exec($curl);
curl_close($curl);
/*$response = '[{"PO": "1100005065","DELIVERY": "0008611490","WAREHOUSE": "117",
"MATERIAL_CODE": "WHR-M","SEGMENT": "RGURKJUSD01","WHEAT_VARIETY": "PUNJAB-ALL LOCATION-MQ4","REC_PLANT": "150",
"REC_STO_LOC": "AL01","PO_QTY": 0,"UOM": "KG","SENDING_PLANT": "150","LOT": "C1S1A2"}]';*/

$sql = "INSERT INTO `ngw_sap_to_pp_api_log`(`saptopp_api_name`, `api_response`, `insdt`, `process_status`) 
VALUES ('$PageName','$response',current_timestamp, 'RECEIVED')";
//echo $sql ;
    $Insert=mysqli_query($connect,$sql);
$InsertId = mysqli_insert_id($connect);

//echo $response;
$Data=json_decode($response);
//var_dump($Data);
//exit();

for($i=0;$i<sizeof($Data);$i++){
  if($Data[$i]->LGPLA=="AR02C05")
  {
  var_dump($Data[$i]);
  }
  
  //MOHAN 26082022 NEED TO CHANGE MMD LOT / NAGA LOT
 $WarehouseCode=$Data[$i]->WAREHOUSE;
 $Naga_PlantWerks=$Data[$i]->REC_PLANT;
 $Naga_StorageLocation=$Data[$i]->REC_STO_LOC;
 $Naga_LotNumber=$Data[$i]->LOT;
 $WheatVarietySegment=$Data[$i]->SEGMENT;
  
 $MMD_PlantWerks=$Data[$i]->SENDING_PLANT;
 $MMD_StorageLocation=$Data[$i]->REC_STO_LOC; //Mohan 27082022 Both Storage location no will be same 
 $MMD_LotNumber=$Data[$i]->LOT; //Mohan 27082022 Both Lot no will be same 

 $Qty=$Data[$i]->PO_QTY;
 $MaterialCode=$Data[$i]->MATERIAL_CODE;
 $WheatVariety=$Data[$i]->WHEAT_VARIETY;

 
$WarehouseId=getWarehouseId($connect,$WarehouseCode);
//MMD Plant
$MMD_PlantId=getPlantId($connect,$MMD_PlantWerks, $WarehouseCode);
$MMD_StorageLocationId=getStorageLocationId($connect,$MMD_StorageLocation, $MMD_PlantId, $WarehouseId);
$MMD_LotId=getLotId($connect,$MMD_LotNumber, $MMD_StorageLocationId, $MMD_PlantId, $WarehouseId);
$MMD_WheatVarietyId=getWheatVarietyId($connect,$WheatVarietySegment);

//NAGA Plant
$Naga_PlantId=getPlantId($connect,$Naga_PlantWerks, $WarehouseCode);
$Naga_StorageLocationId=getStorageLocationId($connect,$Naga_StorageLocation, $Naga_PlantId, $WarehouseId);
$Naga_LotId=getLotId($connect,$Naga_LotNumber, $Naga_StorageLocationId, $Naga_PlantId, $WarehouseId);
$Naga_WheatVarietyId=getWheatVarietyId($connect,$WheatVarietySegment);  //Both Segment will be same 
echo "<Br>NAGA==>",$WarehouseCode, " ",$Naga_PlantWerks, " ", $Naga_PlantId," ", $Naga_StorageLocation, " ",$Naga_LotNumber, " " , $Naga_LotId;
echo "<Br>MMD==>",$WarehouseCode, " ",$MMD_PlantWerks," " , $MMD_PlantId," ", $MMD_StorageLocation, " ",$MMD_LotNumber, " ", $MMD_LotId;
//exit();

//exit();
//echo $WarehouseId."&".$LotId."&".$PlantId."&".$PlantId."&".$WheatVarietyId."<br>";

if($LotId=="" || $LotId==0){
  /*Commented for test purpose
  $Qry="INSERT INTO `ngw_lot`(`warehouseid`, `plantid`, `locationid`, `lotno`,maxcapacity,totalcapacity,
  length,
  breadth,height,totalsqft,InsBy,ModBy) VALUES ('".$WarehouseId."','".$PlantId."',
  '".$StorageLocationId."','".$LotNumber."',0,0,0,0,0,0,0,0)";
 
  $Insert=mysqli_query($connect,$Qry);
  $LotId=mysqli_insert_id($connect);*/
  if($Data[$i]->LGPLA=="AR02C05")
  echo $Qry."-".$LotId."<br>";
}

$MMD_SublotRec = getSublotId($connect,$MMD_LotId,$WarehouseId,$MMD_PlantId,$MMD_WheatVarietyId);
$MMD_SublotId= $MMD_SublotRec['sub_lot_id'];
$MMD_WheatQty = $MMD_SublotRec['wheatqty'];
$MMD_last_fumigation_id = $MMD_SublotRec['last_fumigation_id'];
$MMD_Last_Keyloan_Pledge_Id = $MMD_SublotRec['Last_Keyloan_Pledge_Id'];
$MMD_last_rnd_lot_conversion_id = $MMD_SublotRec['last_rnd_lot_conversion_id'];

$MMD_fumigationstatus = $MMD_SublotRec['fumigationstatus'];
$MMD_lastfumigationdate = $MMD_SublotRec['lastfumigationdate'];
$MMD_nextfumigationdate = $MMD_SublotRec['nextfumigationdate'];
$MMD_rndstatus = $MMD_SublotRec['rndstatus'];
$MMD_rndlotconversiondate = $MMD_SublotRec['rndlotconversiondate'];
$MMD_nextrnddate = $MMD_SublotRec['nextrnddate'];
$MMD_Last_Keyloan_Pledge_Id = $MMD_SublotRec['Last_Keyloan_Pledge_Id'];
$MMD_Keyloan_Pledge_Status = $MMD_SublotRec['Keyloan_Pledge_Status'];
$MMD_Keyloan_Pledge_Date = $MMD_SublotRec['Keyloan_Pledge_Date'];
$MMD_Keyloan_Release_Qty = $MMD_SublotRec['Keyloan_Release_Qty'];

$Naga_SublotRec = getSublotId($connect,$Naga_LotId,$WarehouseId,$Naga_PlantId,$Naga_WheatVarietyId);
$Naga_SublotId= $Naga_SublotRec['sub_lot_id'];
$Naga_WheatQty = $Naga_SublotRec['wheatqty'];
/*$Naga_last_fumigation_id = $Naga_SublotRec['last_fumigation_id'];
$Naga_Last_Keyloan_Pledge_Id = $Naga_SublotRec['Last_Keyloan_Pledge_Id'];
$Naga_last_rnd_lot_conversion_id = $Naga_SublotRec['last_rnd_lot_conversion_id'];*/
echo "<Br>NAGA=> ", $Naga_SublotId;
echo "<Br>MMD=> ", $MMD_SublotId;
if(empty($MMD_WheatQty)) $MMD_WheatQty='0';
//exit();
if(empty($MMD_Keyloan_Release_Qty)) $MMD_Keyloan_Release_Qty='0';
if(empty($MMD_lastfumigationdate)) {$MMD_lastfumigationdate='null';}else{$MMD_lastfumigationdate="'".$MMD_lastfumigationdate."'";}
if(empty($MMD_nextrnddate)) {$MMD_nextrnddate='null';}else{$MMD_nextrnddate="'".$MMD_nextrnddate."'";}
if(empty($MMD_Keyloan_Pledge_Date)) {$MMD_Keyloan_Pledge_Date='null';}else{$MMD_Keyloan_Pledge_Date="'".$MMD_Keyloan_Pledge_Date."'";}
if(empty($MMD_rndlotconversiondate)) {$MMD_rndlotconversiondate='null';}else{$MMD_rndlotconversiondate="'".$MMD_rndlotconversiondate."'";}
if(empty($MMD_nextfumigationdate)) {$MMD_nextfumigationdate='null';}else{$MMD_nextfumigationdate="'".$MMD_nextfumigationdate."'";}

$Qry="UPDATE `ngw_sublot` SET wheatqty=wheatqty + '$MMD_WheatQty', SAP_Qty=SAP_Qty + '$MMD_WheatQty',
last_fumigation_id='$MMD_last_fumigation_id', 
fumigationstatus='$MMD_fumigationstatus', lastfumigationdate=$MMD_lastfumigationdate, nextfumigationdate=$MMD_nextfumigationdate, 
last_rnd_lot_conversion_id='$MMD_last_rnd_lot_conversion_id',rndstatus='$MMD_rndstatus' ,rndlotconversiondate=$MMD_rndlotconversiondate,nextrnddate=$MMD_nextrnddate,
Keyloan_Pledge_Status='$MMD_Keyloan_Pledge_Status',Last_Keyloan_Pledge_Id='$MMD_Last_Keyloan_Pledge_Id',
Keyloan_Pledge_Date=$MMD_Keyloan_Pledge_Date, Keyloan_Release_Qty=Keyloan_Release_Qty + '$MMD_Keyloan_Release_Qty',
ModDt=current_timestamp
where sub_lot_id='$Naga_SublotId'";
echo "<Br><Br>$Qry";
$Insert=mysqli_query($connect,$Qry);
  
}
function getSublotId($connect,$LotId,$WarehouseId,$PlantId,$WheatVarietyId){
  $Qry="SELECT sub_lot_id, wheatqty, last_fumigation_id, Last_Keyloan_Pledge_Id,last_rnd_lot_conversion_id 
  , fumigationstatus, lastfumigationdate, nextfumigationdate, rndstatus,rndlotconversiondate,nextrnddate,
  Keyloan_Pledge_Status, Last_Keyloan_Pledge_Id, Keyloan_Pledge_Date, Keyloan_Release_Qty
  FROM `ngw_sublot` WHERE lotid='$LotId' and warehouseid='$WarehouseId' and 
  plantid='$PlantId' and wheatvarietyid='$WheatVarietyId'";
  
  echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);

  return $Fetch;
}

function getStorageLocationId($connect,$Code, $PlantId, $WarehouseId){
  $Qry="SELECT STORAGE_REFID FROM `master_storage` where LGORT='$Code' and plantid = '$PlantId'";
  
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['STORAGE_REFID'];
}
function getWheatVarietyId($connect,$Code){
  $Qry="SELECT Id FROM `master_mrc_wheat_variety` where upper(Segment)='$Code'";
  
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['Id'];
}
function getPlantId($connect,$Code,$WarehouseCode){
  $Qry="SELECT ID FROM `master_plant` where WERKS='$Code' and WH_CODE = '$WarehouseCode'";

   echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['ID'];

}
function getLotId($connect,$Code, $StorageLocation, $PlantId, $WarehouseId){
  $Qry="SELECT lotid FROM `ngw_lot` WHERE lotno='$Code' and PlantId = '$PlantId' and locationid = '$StorageLocation' and warehouseid = '$WarehouseId'";
  echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['lotid'];
}
function getWarehouseId($connect,$Code){
  $Qry="SELECT wh_refid FROM `warehouse_master` where wh_code='$Code'";
  // echo "<Br>".$Qry;
  $Select=mysqli_query($connect,$Qry);
  $Fetch=mysqli_fetch_assoc($Select);
  return $Fetch['wh_refid'];
}
