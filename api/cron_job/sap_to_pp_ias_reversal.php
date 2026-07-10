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
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':50000/zwh_iasmigo_rev/migorev?sap-client=900',
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
////$response = curl_exec($curl);   //UNCOMMENT
curl_close($curl);
//echo $response;
//COMMENT FOLLOWING LINE
////$response = '[{"ZIASNO":"RMIASW022200000138","ZSAP_STOPONO":"1700029554","ZDATEADDED1":"0000-00-00","ZMIGO_NUMBER":"5000407504","ZMIGO_FLAG":"5","ZMIGO_PP_FLAG":"0","ZMIGO_REV":"X","ZMIGO_REV_YEAR":0,"ZMIGO_REV_FLAG":""},{"ZIASNO":"RMIASW022200000136","ZSAP_STOPONO":"1700029673","ZDATEADDED1":"0000-00-00","ZMIGO_NUMBER":"5000407482","ZMIGO_FLAG":"5","ZMIGO_PP_FLAG":"0","ZMIGO_REV":"X","ZMIGO_REV_YEAR":0,"ZMIGO_REV_FLAG":""}]';
$response ='[{"ZIASNO":"RMIASW022200000138","ZSAP_STOPONO":"1700029554","ZDATEADDED1":"0000-00-00","ZMIGO_NUMBER":"5000407504","ZMIGO_FLAG":"5","ZMIGO_PP_FLAG":"0","ZMIGO_REV":"X","ZMIGO_REV_YEAR":0,"ZMIGO_REV_FLAG":""},{"ZIASNO":"RMIASSIL2200000059","ZSAP_STOPONO":"1700029673","ZDATEADDED1":"0000-00-00","ZMIGO_NUMBER":"5000407482","ZMIGO_FLAG":"5","ZMIGO_PP_FLAG":"0","ZMIGO_REV":"X","ZMIGO_REV_YEAR":0,"ZMIGO_REV_FLAG":""}]';
$sql = "INSERT INTO `ngw_sap_to_pp_api_log`(`saptopp_api_name`, `api_response`, `insdt`, `process_status`) 
VALUES ('$PageName','$response',current_timestamp, 'RECEIVED')";
    $Insert=mysqli_query($connect,$sql);
$InsertId = mysqli_insert_id($connect);
//, `numrec_received`, `numrec_completed`
$Data=json_decode($response);
// var_dump(sizeof($Data));
// exit();
$process_status='INPROGRESS';
$sql = "update ngw_sap_to_pp_api_log set numrec_received=".sizeof($Data). ", process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);

for($i=0;$i<sizeof($Data);$i++){
  if($Data[$i]->Update_Flag=="I")
  {
  var_dump($Data[$i]);
  }
$VA_NUMBER=$Data[$i]-> ZIASNO;
$PONO=$Data[$i]-> ZSAP_STOPONO;
$REVERSAL_DT=$Data[$i]-> ZDATEADDED1;
$MIGO_NUMBER=$Data[$i]-> ZMIGO_NUMBER;
$MIGO_FLAG=$Data[$i]-> ZMIGO_FLAG;
$MIGO_PP_FLAG=$Data[$i]-> ZMIGO_PP_FLAG;
$MIGO_REV=$Data[$i]-> ZMIGO_REV;
$MIGO_REV_YEAR=$Data[$i]-> ZMIGO_REV_YEAR;
$MIGO_REV_FLAG=$Data[$i]-> ZMIGO_REV_FLAG;
echo "A".$MIGO_REV."B";
if($MIGO_REV=="X"){
  //`ModDt`=current_timestamp 
    $Qry="UPDATE `intrastate_warhouse_dispatch_info` SET `ZIASNO`='$VA_NUMBER', `ZSAP_STOPONO`='$PONO', 
    `ZDATEADDED1`='$REVERSAL_DT', `ZMIGO_NUMBER`='$MIGO_NUMBER', `ZMIGO_FLAG`='$MIGO_FLAG', `ZMIGO_PP_FLAG`='$MIGO_PP_FLAG',
     `ZMIGO_REV`='$MIGO_REV', `ZMIGO_REV_YEAR`='$MIGO_REV_YEAR', `ZMIGO_REV_FLAG`='$MIGO_REV_FLAG'
     WHERE 	VehicleArrivalId = (Select Id from empty_vehicle_arrival where ZVA_NUMBER='$VA_NUMBER')";
     echo "<Br>".$Qry;
     $Insert=mysqli_query($connect,$Qry);

     $Qry="UPDATE `empty_vehicle_arrival` SET `Reversal_Flag`='YES' WHERE ZVA_NUMBER='$VA_NUMBER'";
      echo "<Br>".$Qry;
      $Insert=mysqli_query($connect,$Qry);
    }

    if(($i+1)==sizeof($Data))
    {
    $process_status='COMPLETED';
    }

$sql = "update ngw_sap_to_pp_api_log set numrec_completed='".($i+1). "', process_status='$process_status' where logid = '$InsertId'";
$Insert=mysqli_query($connect,$sql);
}
// }
