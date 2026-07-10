<?php
$SAP_HOSTNAME = "10.10.63.139";//SAP HOST NAME nfapplqua1.nagaltd.com
//$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";

//http://10.10.63.139:50000/warehouse/warehouse?sap-client=900

include_once APIPATH. "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");
$curl = curl_init();
curl_setopt_array($curl, array(
  // CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/warehouse/warehouse?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  CURLOPT_HTTPHEADER => array(
    'Authorization: Basic c3JkZ2l0bTE6Q2hhbmdlQDE='
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
//echo $response;
$Data=json_decode($response);
//var_dump($Data);
//exit();
for($i=0;$i<sizeof($Data);$i++){
  if($Data[$i]->LGPLA=="AR02C05")
  {
  var_dump($Data[$i]);
  }
 $WarehouseCode=$Data[$i]->LGNUM;
 $WarehouseName=$Data[$i]->LNUMT;
 $PlantWerks=$Data[$i]->WERKS;
 $StorageLocation=$Data[$i]->LGORT;
 $LotNumber=$Data[$i]->LGPLA;
 $WheatVariety=$Data[$i]->IDNLF;
 $WheatVarietySegment=$Data[$i]->SGT_SCAT;
 $Qty=$Data[$i]->VERME;
 $MaterialCode=$Data[$i]->MATNR;

$WarehouseId=getWarehouseId($connect,$WarehouseCode);
$PlantId=getPlantId($connect,$PlantWerks, $WarehouseCode);
$StorageLocationId=getStorageLocationId($connect,$StorageLocation, $PlantId, $WarehouseId);
$LotId=getLotId($connect,$LotNumber, $StorageLocationId, $PlantId, $WarehouseId);
$WheatVarietyId=getWheatVarietyId($connect,$WheatVarietySegment);
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

if($WheatVarietyId==""){
  $Qry="INSERT INTO `master_mrc_wheat_variety`( `Segment`, `WheatVariety`, `State`, `Zone`, `City`, 
`SeedVariety`, `MaterialCode`) 
  VALUES ('".$WheatVarietySegment."','".$WheatVariety."','0','0','0','0', '$MaterialCode')";
 echo "<Br>".$Qry;
  $Insert=mysqli_query($connect,$Qry);
  $WheatVarietyId=mysqli_insert_id($connect);
  if($Data[$i]->LGPLA=="AR02C05")
  echo $Qry."-".$WheatVarietyId."<br>";
}
else
{
  $Qry="update `master_mrc_wheat_variety` set `MaterialCode`='$MaterialCode' where id = '".$WheatVarietyId."'";
  echo "<Br>".$Qry;
  $Insert=mysqli_query($connect,$Qry);
}

$SublotRec = getSublotId($connect,$LotId,$WarehouseId,$PlantId,$WheatVarietyId);

$SublotId= $SublotRec['sub_lot_id'];
$WheatQty = $SublotRec['wheatqty'];
$last_fumigation_id = $SublotRec['last_fumigation_id'];


if($SublotId=="" && !($LotId=="" || $LotId==0)){
$Qry="INSERT INTO `ngw_sublot`(`lotid`, `lotno`, `warehouseid`, `plantid`, `wheatvarietyid`, `wheatqty`,StorageLocationId,
                                SAP_Qty,Keyloan_Release_Qty,Last_Keyloan_Pledge_Id,bagtypeid,lastfumigationdate,fumigationtypeid,
                                degassingdate,nextfumigationdate,rndlotconversiondate,nextrnddate,qano,InsDt,InsBy,ModDt,
                                last_fumigation_id,last_rnd_lot_conversion_id,init_lot_qty,Last_RelotId,Last_Physical_Stock_Id,
                                Last_WM_Physical_Inventory_Id,Last_Physical_Inventory_Id,Last_weekly_planid,`last_bagcuttingid`,
                                `Infestation`,`CompletionStatus`) 
                    VALUES ('".$LotId."','".$LotNumber."','".$WarehouseId."','".$PlantId."','".$WheatVarietyId."','".$Qty."',
                            '".$StorageLocationId."','0','0','0','1','1970-01-01','0','1970-01-01','1970-01-01','1970-01-01',
                            '1970-01-01','0',CURRENT_TIMESTAMP,'0',CURRENT_TIMESTAMP,'0','0','0','0','0','0','0','0','0','0','0')";
  // if($Data[$i]->LGPLA=="AR02C05")
  // echo $Qry."<br><br>";
  $Insert=mysqli_query($connect,$Qry);
}else if(!($LotId=="" || $LotId==0)) {
  if (floatval($Qty) <= floatval($WheatQty) || $last_fumigation_id == "0" ){
    $Qry="UPDATE `ngw_sublot` SET wheatqty='$Qty', SAP_Qty='$Qty' where sub_lot_id='$SublotId'";
  }else{
    $Qry="UPDATE `ngw_sublot` SET wheatqty='$Qty', SAP_Qty='".$Qty."', 

                                  /*lastfumigationdate = 'NULL', 
                                  fumigationtypeid='', 
                                  degassingdate='NULL', 
                                  Lastdegassingdate='NULL', 
                                  fumigationstatus ='', 
                                  nextfumigationdate='NULL', 
                                  rndlotconversiondate='NULL', 
                                  rndstatus='PENDING', 
                                  nextrnddate='', 
                                  qano='', 
                                  last_fumigation_id='', */
                                  
                                  CompletionStatus = '2' 
          WHERE sub_lot_id='$SublotId'";
    }
  
  // if($Data[$i]->LGPLA=="KSL2L07")
  // echo $Qry."<br><br>";
  $Insert=mysqli_query($connect,$Qry);
  
}
  
}
function getSublotId($connect,$LotId,$WarehouseId,$PlantId,$WheatVarietyId){
  $Qry="SELECT sub_lot_id, wheatqty, last_fumigation_id FROM `ngw_sublot` WHERE lotid='$LotId' and warehouseid='$WarehouseId' and 
  plantid='$PlantId' and wheatvarietyid='$WheatVarietyId'";
  
  // echo "<Br>".$Qry;
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
