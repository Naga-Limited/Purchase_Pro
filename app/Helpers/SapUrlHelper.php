<?php 
namespace App\Helpers;

use DOMDocument;
use DOMXPath;

class SapUrlHelper
{
 
  public function getWhDatas($urlPath)
  {
     $ip_address=IP_ADDRESS;
     $url = $ip_address.$urlPath;
     $userName = USER_NAME; $password = PASS_WORD;
     //$url = 'http://103.249.96.242:50000/'.$urlPath;
     //$userName = 'srdgitm1'; $password = 'App@IT$2kh2';
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
      $METHOD = json_decode($data);
      //$url = 'http://103.249.96.242:50000/'.$urlPath;
      //$userName = 'srdgitm1'; $password = 'App@IT$2kh2';
     $ip_address=IP_ADDRESS;
     $url = $ip_address.$urlPath;
     $userName = USER_NAME; $password = PASS_WORD;
      $sap_client = array('sap-client' => '900');
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
        CURLOPT_CUSTOMREQUEST => $METHOD[0]->METHOD == 'PUT' ? 'PUT' : 'POST',
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

  public function CCTV($dataValue)
  {
    //print_r($dataValue);exit;
    //  $url = 'http://192.168.26.64/'.$urlPath;
    //  $userName = 'admin'; $password = 'Admin@123';
    $url = $dataValue['apiUrl'];
    $userName = $dataValue['username']; 
    $password = $dataValue['password'];

    //  $headers = array('Authorization: Digest '. base64_encode($userName.':'.$password));
     $ch = curl_init();
     curl_setopt($ch, CURLOPT_URL, $url);
    //  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    //curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
    curl_setopt($ch, CURLOPT_USERPWD, "$userName:$password");
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    header("Content-Type: $contentType");   
    $response = curl_exec($ch);
    //print_r($response);exit;
    $result = '';
    if (curl_errno($ch)) {
      echo 'CURL Error: ' . curl_error($ch);
    } else {

      $imageFilename = $dataValue['cameraName'].'_'.date('Ymdhis').'.jpg'; // Example: CM01_20230825153045.jpg
      $imagePath = $dataValue['imageStoragePath']."/".$imageFilename;
      $result = $imagePath;    
          //print_r($result);return;
      if (curl_errno($ch)) {
          echo 'Curl error: ' . curl_error($ch);
      } else {
          // Save the image data to the specified path
          file_put_contents($imagePath, $response);
          // echo 'Image saved at: ' . $imagePath;
          // $result = $imagePath;
          // 
          
          
      }
      
    }   
    
    curl_close($ch);
    //print_r($result);return;
    return $result;
    
  }
  
  public function CCTVS($dataValue)
  {
    // print_r($dataValue);exit;
    //  $url = 'http://192.168.26.64/'.$urlPath;
    //  $userName = 'admin'; $password = 'Admin@123';
    $url = $dataValue['apiUrl'];
    $userName = $dataValue['username']; 
    $password = $dataValue['password'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
    curl_setopt($ch, CURLOPT_USERPWD, "$userName:$password");
    $response = curl_exec($ch);
    $result = '';
    if (curl_errno($ch)) {
      echo 'CURL Error: ' . curl_error($ch);
    } else {

      $imageFilename = $dataValue['cameraName'].'_'.date('Ymdhis').'.jpg'; // Example: CM01_20230825153045.jpg
      $imagePath = $dataValue['imageStoragePath']."/".$imageFilename;
      $result = $imagePath;    
      
      if (curl_errno($ch)) {
          echo 'Curl error: ' . curl_error($ch);
      } else {
          // Save the image data to the specified path
          file_put_contents($imagePath, $response);
          // echo 'Image saved at: ' . $imagePath;
          // $result = $imagePath;
          // 
          
          
      }
      
    } 

    curl_close($ch);
    return $result;
  }
}
