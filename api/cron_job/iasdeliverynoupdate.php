<?php

$SAP_HOSTNAME = "10.10.63.139";//SAP HOST NAME nfapplqua1.nagaltd.com
//$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";
$PageName=basename($_SERVER['PHP_SELF']);
//http://10.10.63.139:50000/warehouse/warehouse?sap-client=900
//http://nfapplqua.nagaltd.com:50000/zwh_iaspo/iaspo?sap-client=900

include_once APIPATH. "/db_connection.php";
date_default_timezone_set("Asia/Calcutta");

$curl = curl_init();
curl_setopt_array($curl, array(
  // CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/zwh_iasdelivery/iaspo?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  CURLOPT_HTTPHEADER => array(
  'Authorization: Basic bmFnYWFiYXA6TmFnYTk4Nw=='
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));
$response = curl_exec($curl); //UNCOMMENT
curl_close($curl);
//echo $response;

// var_dump(sizeof($Data));
// exit();
// $response = '[{"VA_NO":"RMIASR152200000001","DELIVERY_NO":"0350103357","DELIVERY_DATE":"2022-01-01","EWAYBILL":"765443322"},{"VA_NO":"RMIASR152200000002","DELIVERY_NO":"0350103363","DELIVERY_DATE":"2022-01-01","EWAYBILL":"788888822"}]';
$sql = "INSERT INTO `ngw_sap_to_pp_api_log`(`saptopp_api_name`, `api_response`, `insdt`, `process_status`) 
VALUES ('$PageName','$response',current_timestamp, 'RECEIVED')";
$Insert=mysqli_query($connect,$sql);
$InsertId = mysqli_insert_id($connect);

$Data=json_decode($response);
$process_status='INPROGRESS';
$sql = "update ngw_sap_to_pp_api_log set numrec_received=".sizeof((array)$Data). ", process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);

for($i=0;$i<sizeof((array)$Data);$i++){
  if($Data[$i]->ZIAS_NO=="$ZIAS_NO")
  {
  var_dump($Data[$i]);
  }
  
$VA_NO=$Data[$i]-> VA_NO;
$DeliveryNo=$Data[$i]-> DELIVERY_NO;
$DeliveryDate=$Data[$i]-> DELIVERY_DATE;
$EwayBillNo=$Data[$i]-> EWAYBILL;


$Qry="update `intrastate_warhouse_dispatch_info` set  
`DeliveryNo`='$DeliveryNo', `DeliveryDate` ='$DeliveryDate', `EwayBillNo`='$EwayBillNo', 
`DateModified`=current_timestamp where VehicleArrivalId = (Select Id from empty_vehicle_arrival where ZVA_NUMBER='".$VA_NO."')";

 echo "<Br>".$Qry;
  $Insert=mysqli_query($connect,$Qry);

  if(($i+1)==sizeof((array)$Data))
  {
  $process_status='COMPLETED';
  }

$sql = "update ngw_sap_to_pp_api_log set numrec_completed='".($i+1). "', process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);

}