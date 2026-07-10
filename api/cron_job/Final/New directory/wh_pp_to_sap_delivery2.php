<?php

$SAP_HOSTNAME = "103.249.96.242";//SAP HOST NAME nfapplqua1.nagaltd.com
// $SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";

$gCSRF_TOKEN = GetSAP_CSRF_Token();

//TestSAPAPI();
//exit();
const APIPATH = ".";
include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
$cnd ="";
$cnd = " and eva.VEHICLE_STATUS=5 ";
// if(isset($_REQUEST['APPROVED']) and $_REQUEST['APPROVED']='1')
// {
//   $cnd = " and RelotStatus=2 ";
// }
// else
// {
//   $cnd = " and RelotStatus=1 ";
// }
$query = "select 
    intrad.Id , intrad.VehicleArrivalId, intrad.IntraStateSapId, intrad.DateAdded, intrad.DateModified, intrad.AddedBy, 
    intrad.ModifiedBy, intrad.IsRedirected, intrad.IsSendingRedirected , 

    intrad.LoadedLotNo, intrad.LoadedLotNo2, intrad.LoadedLotNo3, 
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo limit 1) as LoadedLotId,
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo2 limit 1) as LoadedLotId2,
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo3 limit 1) as LoadedLotId3,

    intrad.LastMileTransporterId, intrad.LastMileTransporter, intrad.LoadingVendorId, intrad.LoadingVendor, intrad.LoadingChargesPerTon, 
    intrad.FreightChargesPerTon, intrad.PickslipNo, intrad.SendingPlant, intrad.WheatVariety, intrad.MaterialNo, 
    intrad.ReceivingPlant, intrad.ReceivingStorageLocation, intrad.SendingStorageLocation, intrad.StoPoNo, 
    intrad.PO_Number, 
    intrad.PO_LineItem, intrad.PO_LineItem2, intrad.PO_LineItem3, 
    intrad.Segment, intrad.Segment2, intrad.Segment3, 
    intrad.WheatVariety2, intrad.WheatVariety3, 
    intrad.MaterialNo2, intrad.MaterialNo3, intrad.EwayBillNo, intrad.DeliveryDate, 
    intrad.PO_Qty, intrad.PO_Qty2, intrad.PO_Qty3, intrad.DeliveryNo, intrad.WbType, intrad.WbName, intrad.WbSerialNumber, 
    intrad.WbTicketNumber, intrad.WbEmptyWt, intrad.WbNetWt, intrad.WbLoadWt, intrad.GunnyWt, intrad.GunnyLessNetWt, 

    intrad.BagType, intrad.L1_BagType2, intrad.L1_BagType3, 
    intrad.L2_BagType, intrad.L2_BagType2, intrad.L2_BagType3, 
    intrad.L3_BagType, intrad.L3_BagType2, intrad.L3_BagType3, 
    intrad.L1_NoofBags, intrad.L1_NoofBags2, intrad.L1_NoofBags3, 
    intrad.L2_NoofBags, intrad.L2_NoofBags2, intrad.L2_NoofBags3, 
    intrad.L3_NoofBags, intrad.L3_NoofBags2, intrad.L3_NoofBags3, 
    intrad.L1_CuttingBagType, intrad.L1_CuttingBagType2, intrad.L1_CuttingBagType3, 
    intrad.L2_CuttingBagType, intrad.L2_CuttingBagType2, intrad.L2_CuttingBagType3, 
    intrad.L3_CuttingBagType, intrad.L3_CuttingBagType2, intrad.L3_CuttingBagType3, 
    intrad.L1_CuttingVendor, intrad.L1_CuttingVendor2, intrad.L1_CuttingVendor3, 
    intrad.L2_CuttingVendor, intrad.L2_CuttingVendor2, intrad.L2_CuttingVendor3, 
    intrad.L3_CuttingVendor, intrad.L3_CuttingVendor2, intrad.L3_CuttingVendor3, 
    intrad.L1_CuttingCharges, intrad.L1_CuttingCharges2, intrad.L1_CuttingCharges3, 
    intrad.L2_CuttingCharges, intrad.L2_CuttingCharges2, intrad.L2_CuttingCharges3, 
    intrad.L3_CuttingCharges, intrad.L3_CuttingCharges2, intrad.L3_CuttingCharges3, 
    
    intrad.IsTruck, intrad.TrailerNo, intrad.TruckNo, intrad.ContainerNo, intrad.IrsContainerDetailsId, 
    intrad.PickslipQty, intrad.SalesInvoiceNo, intrad.SealNumber, intrad.PickSlipCopy, intrad.WbSlipCopy, 
    intrad.WbSlipCopy2, intrad.EwayBillCopy, intrad.IsUpdated, intrad.Rec_LotId, intrad.Rec_LotNo,
    eva.DateAdded, eva.DateModified, 
    eva.ZVA_NUMBER, eva.TRAILER_NO, eva.CONTAINER_NO, eva.CONTAINER_TYPE, eva.DRIVER_NO, eva.WB_NAME, 
    eva.WB_SERIAL_NO, eva.WB_EMPTY_WT, eva.TRUCK_NO, eva.WB_TICKET_NO, eva.WB_CHARGES, eva.SCREEN_TYPE, eva.VEHICLE_STATUS,
     eva.PLANT_ID, eva.PLANT_NAME, eva.GAT_IN_TM, eva.GATE_OUT_TM, eva.IsUpdated, eva.WaitOutsideDt, eva.WaitOutsideBy, 
     eva.WaitOutsideByName, eva.GateInDt, eva.GateInBy, eva.PortDispatchDt, eva.PortDispatchBy, eva.PortDispatchByName, 
     eva.PortReceiptDt, eva.PortReceiptBy, eva.PortReceiptByName, eva.YardDispatchDt, eva.YardDispatchBy, eva.YardDispatchByName, 
     eva.UpdateLotDt, eva.UpdateLotBy, eva.UpdateLotByName, eva.PickSlipDt, eva.PickSlipBy, eva.PickSlipByName, eva.RedirectDt, 
     eva.RedirectBy, eva.RedirectByName, eva.GateOutDt, eva.GateOutBy, eva.GateOutByName, eva.LastStatusChangedBy, eva.LastStatusChangedOn, 
     eva.stm_LoadDt, eva.stm_LoadBy, eva.stm_LoadByName, eva.stm_QCDt, eva.stm_QCBy, eva.stm_QCByName, eva.stm_QCRemarks, 
     eva.GateInByName, eva.First_WB_Attachment, eva.FirstWeightEntryDt, eva.FirstWeightEntryBy, eva.FirstWeightEntryByName, 
     eva.Second_WB_Attachment, eva.SecondWeightEntryDt, eva.SecondWeightEntryBy, eva.SecondWeightEntryByName, eva.RejectionStatus, 
     eva.PONumber, eva.PODt, eva.POBy, eva.POByName, 

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.bagType LIMIT 1) as L1_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType2 LIMIT 1) as L1_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType3 LIMIT 1) as L1_bagType3Name,

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType LIMIT 1) as L2_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType2 LIMIT 1) as L2_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType3 LIMIT 1) as L2_bagType3Name,

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType LIMIT 1) as L3_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType2 LIMIT 1) as L3_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType3 LIMIT 1) as L3_bagType3Name,

      (SELECT wpa1.MovementQty from ngw_weeklyplan_actual wpa1 WHERE wpa1.VANumber = eva.ZVA_NUMBER 
      and wpa1.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo limit 1) limit 1)as MovementQty1,
      (SELECT wpa2.MovementQty from ngw_weeklyplan_actual wpa2 WHERE wpa2.VANumber = eva.ZVA_NUMBER 
      and wpa2.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo2 limit 1) limit 1)as MovementQty2,
      (SELECT wpa3.MovementQty from ngw_weeklyplan_actual wpa3 WHERE wpa3.VANumber = eva.ZVA_NUMBER 
      and wpa3.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo3 limit 1) limit 1)as MovementQty3,

     intrad.ReceivingBin_id,intrad.ReceivingBin_Name
     
        
     FROM

     intrastate_warhouse_dispatch_info intrad 
     JOIN empty_vehicle_arrival eva ON intrad.VehicleArrivalId = eva.ID
     LEFT JOIN master_plant b ON intrad.SendingPlant=b.WERKS
     LEFT JOIN master_plant c ON intrad.ReceivingPlant=c.WERKS
     where eva.IsUpdated = 0 $cnd";
 echo $query."<br><br>";

/*
LEFT JOIN ngw_weeklyplan_actual wpa1 ON wpa1.VANumber = eva.ZVA_NUMBER and wpa1.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo)
     LEFT JOIN ngw_weeklyplan_actual wpa2 ON wpa2.VANumber = eva.ZVA_NUMBER and wpa2.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo2)
     LEFT JOIN ngw_weeklyplan_actual wpa3 ON wpa3.VANumber = eva.ZVA_NUMBER and wpa3.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo3)
*/

$response="RESPONSE";
$result = mysqli_query($connect, $query);

//var_dump(this->db->query($query)->getResultArray());
//  var_dump(mysqli_fetch_assoc($result));
// var_dump($result);
//echo mysqli_num_rows($result)."<br/><br/>"; 

if (mysqli_num_rows($result) > 0) {

    //$output = array('Physical_Inventory_Id', 'Posting_Date', 'wh_code', 'werks', 'LGORT','lotno','WheatSegment','WheatVariety','warehouseid', 'PlantId', 'StorageLocationId', 'Wheat_Variety_Id', 'MaterialCode', 'Physical_Qty', 'SAP_Qty', 'UP_Down_Qty', 'Screentype');
    $rowArr=array();
    // $rowArr[]=$output;
     while ($row = mysqli_fetch_assoc($result)) {
            /*$test = array(
            "BAG_CODE"=>trim($row['BAG_CODE']),
            "BAG_NAME"=>trim($row['BAG_NAME']),
            "BagType"=>trim($row['BagType']),
            "NoOfBags"=>trim($row['NoOfBags']),

            "BAG_CODE2"=>trim($row['BAG_CODE2']),
            "BAG_NAME2"=>trim($row['BAG_NAME2']),
            "BagType2"=>trim($row['BagType2']),
            "NoOfBags2"=>trim($row['NoOfBags2']),

            "BAG_CODE3"=>trim($row['BAG_CODE3']),
            "BAG_NAME3"=>trim($row['BAG_NAME3']),
            "BagType3"=>trim($row['BagType3']),
            "NoOfBags3"=>trim($row['NoOfBags3']),),
          );*/
        $rowArr[]=$row;
          // var_dump($rowArr);
        $update = "UPDATE empty_vehicle_arrival SET isUpdated = '1' WHERE Id = ".$row['VehicleArrivalId'];
        echo $update;
        mysqli_query($connect, $update);
        // break;
     }
     
     $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='pp_to_sap_ias_loading_lastsyncdate'";
  mysqli_query($connect, $Qry);
  SendToSap($rowArr);
  echo json_encode(array($response=>'success',"pp_to_sap_ias_loading"=>$rowArr));
  
}
else
{
    echo json_encode(array($response=>'ERROR',"Message"=>"NO RECORDS FOUND", "pp_to_sap_ias_loading"=>[]));
}

function SendToSap($rowArr)
{
  global $gCSRF_TOKEN, $SAP_HOSTNAME, $gCSRF_COOKIE, $gCSRF_COOKIE_SESSION;

  $jsonarray = json_encode($rowArr);
  //echo "<Br>".$jsonarray ;
  // exit();
$curl = curl_init();
curl_setopt_array($curl, array(
  //CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  //CURLOPT_URL => 'http://10.10.63.134:8001/zcomplaint/webcomplaint?sap-client=900', 
 
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/zwh_pp_sap/ias_data?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_HEADER=>1,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  //CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  CURLOPT_POSTFIELDS => $jsonarray,
  CURLOPT_HTTPHEADER => array(
    'x-csrf-token: '.$gCSRF_TOKEN,
    'Authorization: Basic bmFnYWFiYXA6UHVzdG5ld0AyMQ==',
    'Content-Type: application/json',
    'cookie: '.$gCSRF_COOKIE,
    'Content-Length:'.strlen($jsonarray)
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));
//echo "<Br>***".$gCSRF_TOKEN."*** Cookie=>". $gCSRF_COOKIE."***";
//echo "<br>BEGIN REQ";
// var_dump($curl);
//echo "<Br>END REQ";
$response = curl_exec($curl);
curl_close($curl);
// echo "<Br>".$response;
if($response=="SUCCESS")
{
  return true;
}
else
{
  return false;
}
}

function GetSAP_CSRF_Token()
{
  global $SAP_HOSTNAME, $gCSRF_COOKIE, $gCSRF_COOKIE_SESSION;
  $gCSRF_COOKIE="";
  //echo"S1";
  //exit();
  // exit();
  $TmpUrl = 'http://'.$SAP_HOSTNAME.':50000/zwh_pp_sap/ias_data?sap-client=900';
  //echo "<br>".$TmpUrl."<br>";
$curl = curl_init();
curl_setopt_array($curl, array(
  //CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_URL => $TmpUrl,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  //CURLOPT_POSTFIELDS => $jsonarray,
  CURLOPT_HEADER=>1,
  //CURLOPT_NOBODY=>0,
  CURLOPT_HTTPHEADER => array(
    'x-csrf-token: fetch',
    'Authorization: Basic bmFnYWFiYXA6UHVzdG5ld0AyMQ==',
    'Content-Type: application/json',
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));

$response = curl_exec($curl);
$header_size=curl_getinfo($curl, CURLINFO_HEADER_SIZE);
curl_close($curl);

$header = substr($response,0,$header_size);
$body = substr($response,$header_size);
// echo "<Br>".$header;
$token="";
$headerarr = explode("\n", $header);
for($i=0;$i<count($headerarr);$i++)
{
  $headnamearr = explode(":",$headerarr[$i]);
  // var_dump($headnamearr);
  if($headnamearr[0]=="x-csrf-token" || $headnamearr[0]=="X-CSRF-TOKEN")
  {
    $token =trim($headnamearr[1]);
    //echo "<br><Br>TOKEN=".$token;
  }
  else if($headnamearr[0]=="set-cookie" || $headnamearr[0]=="SET-COOKIE"){
    $gCSRF_COOKIE.=trim($headnamearr[1]).";";
  }
}
// echo "<Br>CCC".$gCSRF_COOKIE."END<BR>";
//$gCSRF_COOKIE=str_replace("path=/;","",$gCSRF_COOKIE);
echo "<Br>CCC".$gCSRF_COOKIE."END<BR>";
//  var_dump($headerarr);


// var_dump($body);
return $token;
}

function TestSAPAPI()
{
global $SAP_HOSTNAME;
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_POSTFIELDS =>'[
    {
            "Physical_Inventory_Id" : "300",
            "Posting_Date" : "400",
            "lotno" : "100",
            "werks" : "100",
            "warehouseid" : "100",
            "StorageLocationId" : "100",
            "Wheat_Variety_Id" : "100",
            "MaterialCode" : "100",
            "Physical_Qty" : "100",
            "SAP_Qty" : "100",
            "UP_Down_Qty" : "100",
            "Screentype" : "100"
             },
              {
            "Physical_Inventory_Id" : "301",
            "Posting_Date" : "400",
            "lotno" : "100",
            "werks" : "100",
            "warehouseid" : "100",
            "StorageLocationId" : "100",
            "Wheat_Variety_Id" : "100",
            "MaterialCode" : "100",
            "Physical_Qty" : "100",
            "SAP_Qty" : "100",
            "UP_Down_Qty" : "100",
            "Screentype" : "100"
             }
]',
  CURLOPT_HTTPHEADER => array(
    'x-csrf-token: CRBegFEdJ00mUDSL8kLIPw==',
    'Authorization: Basic bmFnYWFiYXA6TmFnYTk4Nw==',
    'Content-Type: application/json',
    'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;

}
?>
