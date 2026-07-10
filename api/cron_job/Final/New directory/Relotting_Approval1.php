<?php
$SAP_HOSTNAME = "103.249.96.242";//SAP HOST NAME nfapplqua1.nagaltd.com
//$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";

$gCSRF_TOKEN = GetSAP_CSRF_Token();
//TestSAPAPI();
//exit();
const APIPATH = ".";
include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
$output_csv = "SELECT * FROM ngw_relot WHERE SAPStatus = 0";
// echo $output_csv;
$response="RESPONSE";
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
// $output = array('wirqstdate', 'RelotDate', 'WheatVarietyId', 'ngw_materialcode.materialcode', 'wh_refid', 'WERKS', 'LGORT', 'lotno', 'lotno', 'bag_type', 'NoOfBags', 'VERME', 'Code', 'RelottingCharges', 'Relotreason', 'RelotStatus');
    $rowArr=array();
    // $rowArr[]=$output;
     while ($row = mysqli_fetch_array($result)) {
            $test = array("RelotId"=>trim($row['RelotId']), 
            "RelotDate" =>trim($row['RelotDate']),
            "WheatVarietyId" =>trim($row['WheatVarietyId']),
            "ngw_materialcode.materialcode" =>trim($row['ngw_materialcode.materialcode']),
            "fromwarehouseid" =>trim($row['fromwarehouseid']),
            "fromplantid" =>trim($row['fromplantid']),
            "fromlocationid" =>trim($row['fromlocationid']),
            "fromlotid" =>trim($row['fromlotid']),
            "tolotid" =>trim($row['fromlotid']),
            "BagType" =>trim($row['BagType']),
            "NoOfBags" =>trim($row['NoOfBags']),
            "QtyInMTS" =>trim($row['QtyInMTS']),
            "RelottingVendorId" =>trim($row['RelottingVendorId']),
            "RelottingCharges" =>trim($row['RelottingCharges']),
            "RelottingReasonId" =>trim($row['RelottingReasonId']),
            "RelotStatus" =>trim($row['RelotStatus']));
        $rowArr[]=$test;
          $update = "UPDATE ngw_relot SET SAPStatus = '1' WHERE RelotId = ".$row['RelotId'];
        ////mysqli_query($connect, $update);
        break;
     }
     $CurrentDateTime=date("Y-m-d H:i:s");
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='pp_to_sap_Relotapprovallastsyncdate";
  mysqli_query($connect, $Qry);
  SendToSap($rowArr);
  //echo json_encode(array($response=>'success',"Relot_Approval"=>$rowArr));
}
else
{
    echo json_encode(array($response=>'ERROR',"Message"=>"NO RECORDS FOUND"));
}
function SendToSap($rowArr)
{
  global $gCSRF_TOKEN, $SAP_HOSTNAME, $gCSRF_COOKIE, $gCSRF_COOKIE_SESSION;
  $jsonarray = json_encode($rowArr);
  echo "<Br>".$jsonarray ;
  // exit();
$curl = curl_init();
curl_setopt_array($curl, array(
  //CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  //CURLOPT_URL => 'http://10.10.63.134:8001/zcomplaint/webcomplaint?sap-client=900', 
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':8001/wh/relot?sap-client=900',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_HEADER=>1,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'PUT',
  //CURLOPT_POSTFIELDS => array('sap-client' => '900'),
  CURLOPT_POSTFIELDS => $jsonarray,
  CURLOPT_HTTPHEADER => array(
    'x-csrf-token: '.$gCSRF_TOKEN,
    'Authorization: Basic c3JkZ2l0bTE6c3BvcnRvbjAwNw==',
    'Content-Type: application/json',
    'Content-Length:'.strlen($jsonarray),
    'cookie: '.$gCSRF_COOKIE,
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));
echo "<Br>***".$gCSRF_TOKEN."***";
var_dump($curl);
$response = curl_exec($curl);
curl_close($curl);
echo "<Br>".$response;
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
  global $SAP_HOSTNAME, $gCSRF_COOKIE;
  //echo"S1";
  //exit();
  // exit();
$curl = curl_init();
curl_setopt_array($curl, array(
  //CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  CURLOPT_URL => 'http://'.$SAP_HOSTNAME.':8001/wh/relot?sap-client=900',
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
    'Authorization: Basic c3JkZ2l0bTE6c3BvcnRvbjAwNw==',
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
echo "<Br>".$header;
$token="";
$headerarr = explode("\n", $header);
for($i=0;$i<count($headerarr);$i++)
{
  $headnamearr = explode(":",$headerarr[$i]);
  if($headnamearr[0]=="x-csrf-token" || $headnamearr[0]=="X-CSRF-TOKEN")
  {
    $token =trim($headnamearr[1]);
    //echo "<br><Br>TOKEN=".$token;
  }
  else if($headnamearr[0]=="set-cookie" || $headnamearr[0]=="SET-COOKIE"){
    $gCSRF_COOKIE.=trim($headnamearr[1]).";";
  }
}
// var_dump($headerarr);
// var_dump($body);
return $token;
}
?>
