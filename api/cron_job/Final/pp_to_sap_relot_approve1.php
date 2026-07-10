<?php

//$SAP_HOSTNAME = "103.249.96.242";//SAP HOST NAME nfapplqua1.nagaltd.com
$SAP_HOSTNAME = IP_ADDRESS;//SAP HOST NAME nfapplqua1.nagaltd.com
//d$SAP_HOSTNAME = "nfapplqua1.nagaltd.com";
$gCSRF_COOKIE="";
$BASIC_AUTH = BASIC_AUTH;//SAP HOST NAME nfapplqua1.nagaltd.com

$gCSRF_TOKEN = GetSAP_CSRF_Token();

//TestSAPAPI();
//exit();
const APIPATH = ".";
include_once APIPATH. "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
$cnd ="";
if(true)//Default Approved records
{
  $cnd = " and RelotStatus in (4) ";
}
else
{
  //$cnd = " and RelotStatus in (0,1,3) ";
}

$output_csv = "SELECT * FROM view_ngw_relot WHERE SAPStatus = 1 and RelotStatus = 4 and isSAPUpdated = 0 $cnd";
//echo $output_csv;
$response="RESPONSE";
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {

    //$output = array('Physical_Inventory_Id', 'Posting_Date', 'wh_code', 'werks', 'LGORT','lotno','WheatSegment','WheatVariety','warehouseid', 'PlantId', 'StorageLocationId', 'Wheat_Variety_Id', 'MaterialCode', 'Physical_Qty', 'SAP_Qty', 'UP_Down_Qty', 'Screentype');
    $rowArr=array();
    // $rowArr[]=$output;
     while ($row = mysqli_fetch_array($result)) {
            $test = array("RelotId"=>trim($row['RelotId']), 
            //"RelotDate"=>trim($row['RelotDate']), 
            "wh_code"=>trim($row['wh_code']), "werks"=>trim($row['werks']),
           // "LGORT"=>trim($row['FROM_LGORT']), "fromlotno"=>trim($row['fromlotno']), 
           // "tolotno"=>trim($row['tolotno']), 
          //  "WheatSegment"=>trim($row['WheatSegment']), 
         //   "WheatVariety"=>trim($row['WheatVariety']), 
         //   "warehouseid"=>trim($row['fromwarehouseid']), 
         //   "plantid"=>trim($row['fromplantid']), 
         //   "StorageLocationId"=>trim($row['fromlocationid']), 
          //  "Wheat_Variety_Id"=>trim($row['WheatVarietyId']), 
          //  "MaterialCode"=>trim($row['MaterialCode']), 
          //  "BAG_CODE"=>trim($row['BAG_CODE']),
          //  "BAG_NAME"=>trim($row['BAG_NAME']),
          //  "BagType"=>trim($row['BagType']),
          //  "NoOfBags"=>trim($row['NoOfBags']),

           // "BAG_CODE2"=>trim($row['BAG_CODE2']),
          //  "BAG_NAME2"=>trim($row['BAG_NAME2']),
           // "BagType2"=>trim($row['BagType2']),
           // "NoOfBags2"=>trim($row['NoOfBags2']),

          //  "BAG_CODE3"=>trim($row['BAG_CODE3']),
           // "BAG_NAME3"=>trim($row['BAG_NAME3']),
            //"BagType3"=>trim($row['BagType3']),
           // "NoOfBags3"=>trim($row['NoOfBags3']),

           // "QtyInMTS"=>trim($row['QtyInMTS']),
            "RelottingVendorCode" =>trim($row['VendorCode']),
            "RelottingVendorName" =>trim($row['VendorName']),
            "RelottingVendorId" =>trim($row['RelottingVendorId']),
            "RelottingCharges" =>trim($row['RelottingCharges']),
            "RelottingReasonId" =>trim($row['RelottingReasonId']),
            "RelotStatus" =>trim($row['RelotStatus']),
            "FreightVendorCode" =>($row['FreightVendorCode']),
            "FreightVendorName" =>trim($row['FreightVendorName']),
            "FreightCharges" =>trim($row['FreightCharges']),
          );
        $rowArr[]=$test;
        SendToSap($rowArr);
        $update = "UPDATE ngw_relot SET isSAPUpdated = '1' WHERE RelotId = ".$row['RelotId'];
        mysqli_query($connect, $update);
         
       // break;
     }
     
     $CurrentDateTime=date("Y-m-d H:i:s");
  
  $Qry="UPDATE `pp_lastsynclog` SET  LastRunDate='$CurrentDateTime' where UniqueName='pp_to_sap_wm_phystock_LastSyncDate'";
  mysqli_query($connect, $Qry);
 
 
  echo json_encode(array($response=>'success',"Physical_Inventory_WM_Approve"=>$rowArr));
  //SendToSap($rowArr);
}
else
{
    echo json_encode(array($response=>'ERROR',"Message"=>"NO RECORDS FOUND"));
}

function SendToSap($rowArr)
{
  global $gCSRF_TOKEN, $SAP_HOSTNAME, $gCSRF_COOKIE, $gCSRF_COOKIE_SESSION,$BASIC_AUTH;

  $jsonarray = json_encode($rowArr);
  //echo "<Br>".$jsonarray ;
  // exit();
$curl = curl_init();
curl_setopt_array($curl, array(
  //CURLOPT_URL => 'http://nfapplqua1.nagaltd.com:8001/zcomplaint/webcomplaint?sap-client=900',
  //CURLOPT_URL => 'http://10.10.63.134:8001/zcomplaint/webcomplaint?sap-client=900', 
  CURLOPT_URL => ''.$SAP_HOSTNAME.'zwh_relot/relot?sap-client=900',
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
   // 'Authorization: Basic c3JkZ2l0bTE6QXBwQElUJDJraDI=',
    'Authorization: Basic '.$BASIC_AUTH,
    'Content-Type: application/json',
    'cookie: '.$gCSRF_COOKIE,
    'Content-Length:'.strlen($jsonarray),
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
    //'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMAA3ADAANgAwADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIwNzA2MDkxN1owIwYJKoZIhvcNAQkEMRYEFLE%21ln6BWYC6ELoxuKtar3D%2frUeIMAkGByqGSM44BAMELjAsAhQ5IbAn7oQgZodeaorrjxHKQRjrHwIUKchoD8ZMh%2faMimuhNPGhfrO17Sw%3d; SAP_SESSIONID_NSY_900=zMiYcKJtwCp6i3Hw8eYB83tCmrSH3BHsisYAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));
echo "<Br>***".$gCSRF_TOKEN."*** Cookie=>". $gCSRF_COOKIE."***";
echo "<br>BEGIN REQ";
var_dump($curl);
echo "<Br>END REQ";
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
  global $SAP_HOSTNAME, $gCSRF_COOKIE, $gCSRF_COOKIE_SESSION,$BASIC_AUTH;
  $gCSRF_COOKIE="";
  //echo"S1";
  //exit();
  // exit();
  $TmpUrl = ''.$SAP_HOSTNAME.'zwh_relot/relot?sap-client=900';
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
    //'Authorization: Basic c3JkZ2l0bTE6QXBwQElUJDJraDI=',
    'Authorization: Basic '.$BASIC_AUTH,
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
echo "<Br>CCC".$gCSRF_COOKIE."END<BR>";
//$gCSRF_COOKIE=str_replace("path=/;","",$gCSRF_COOKIE);
//echo "<Br>CCC".$gCSRF_COOKIE."END<BR>";
// var_dump($headerarr);


// var_dump($body);
return $token;
}

function TestSAPAPI()
{
global $SAP_HOSTNAME;
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => ''.$SAP_HOSTNAME.':8001/wh/relot?sap-client=900',
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
    'Authorization: Basic c3JkZ2l0bTE6QXBwQElUJDJraDI=',
    'Content-Type: application/json',
    'Cookie: MYSAPSSO2=AjQxMDMBABhTAFIARABHAEkAVABNADEAIAAgACAAIAACAAY5ADAAMAADABBOAFMAWQAgACAAIAAgACAABAAYMgAwADIAMgAwADIAMgA1ADAANAA1ADkABQAEAAAACAYAAlgACQACRQD%2fAVYwggFSBgkqhkiG9w0BBwKgggFDMIIBPwIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBHjCCARoCAQEwcDBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjEwMjU4MjYxDDAKBgNVBAMTA05TWQIICiAgBhMGNAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMDIyNTA0NTkwNVowIwYJKoZIhvcNAQkEMRYEFG%21tHYPs4MJ3GHH45cXScOGbdhA0MAkGByqGSM44BAMELjAsAhQYBBj9vJlK3z%210ou2UeyT7ny6%2fUgIUc2TXJaJWW%21mlQGyCwighRlWbkrs%3d; SAP_SESSIONID_NSY_100=_LM7AN07KNmvdqDphKBDOGjdEKSVZRHskTkAUFa533M%3d; SAP_SESSIONID_NSY_900=5gvBUuZOgb-5jYegn-WUh6gcnS2V9xHsrhkAUFa533M%3d; sap-usercontext=sap-client=900'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;

}
?>
