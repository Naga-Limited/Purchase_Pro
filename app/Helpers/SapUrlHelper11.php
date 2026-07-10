<?php 
namespace App\Helpers;

use DOMDocument;
use DOMXPath;

class SapUrlHelper
{
 
  public function getWhDatas($urlPath)
  {
    $url = 'http://103.249.96.242:50000/'.$urlPath;
      // $url = 'http://10.10.63.139:50000/'.$urlPath;
    // $url = 'http://10.10.63.140:8001/'.$urlPath;
    // $userName = 'nagaabap'; $password = 'App@IT$2k23';
     $userName = 'nagaabap'; $password = 'App@IT$2k23';
     //$headers = array('Content-Type: application/json', 'Authorization: Basic bmFnYWFiYXA6QXBwQElUJDJrMjM');
     $headers = array('Content-Type: application/json', 'Authorization: Basic '. base64_encode($userName.':'.$password));
     $ch = curl_init();
     curl_setopt($ch, CURLOPT_URL, $url);
     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
     $result = curl_exec($ch);
     curl_close($ch);
     return $result;
  }


function PushToSap($urlPath, $data)
  {
    $url = 'http://103.249.96.242:50000/'.$urlPath;
      // $url = 'http://10.10.63.140:8001/'.$urlPath;
      // $url = 'http://10.10.63.139:50000/'.$urlPath;
      // $userName = 'nagakarthick'; $password = 'Karthiksiva@1';
      // $userName = 'nagaabap'; $password = 'Naga987';
      $userName = 'nagaabap'; $password = 'App@IT$2k23';


      $sap_client = array('sap-client' => '900');

      // print_r($data);exit;
      $headers = array('x-csrf-token: fetch','Content-Type: application/json', 'Authorization: Basic '. base64_encode($userName.':'.$password));

      $curl = curl_init();
      curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_POSTFIELDS => $sap_client,
        // CURLOPT_POSTFIELDS => $jsonarray,
        CURLOPT_HEADER=>1,
        //CURLOPT_NOBODY=>0,
        CURLOPT_HTTPHEADER => $headers
      ));

      $response = curl_exec($curl);
      $header_size=curl_getinfo($curl, CURLINFO_HEADER_SIZE);
      curl_close($curl);

      $header = substr($response,0,$header_size);

      $token="";
      $gCSRF_COOKIE="";

      $headerarr = explode("\n", $header);
      for($i=0;$i<count($headerarr);$i++)
      {
        $headnamearr = explode(":",$headerarr[$i]);
        if($headnamearr[0]=="x-csrf-token" || $headnamearr[0]=="X-CSRF-TOKEN")
        {
          $token =trim($headnamearr[1]);
        }
        else if($headnamearr[0]=="set-cookie" || $headnamearr[0]=="SET-COOKIE"){
          $gCSRF_COOKIE.=trim($headnamearr[1]).";";
        }
      }
      // print_r($gCSRF_COOKIE);exit;
      $curls = curl_init();
      curl_setopt_array($curls, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        // CURLOPT_HEADER=>1,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        //CURLOPT_POSTFIELDS => array('sap-client' => '900'),
        // CURLOPT_POSTFIELDS => json_encode([$data]),
        CURLOPT_POSTFIELDS => $data,
        CURLOPT_HTTPHEADER => array(
          'x-csrf-token: '.$token,
          // 'Authorization: Basic bmFnYWFiYXA6QXBwQElUJDJrMjM=',
          'Content-Type: application/json',
          'cookie: '.$gCSRF_COOKIE,
          'Content-Length:'.strlen($data) 
        ),
      ));

      $response = curl_exec($curls);
      curl_close($curls);

      return json_decode($response);
  }
}
