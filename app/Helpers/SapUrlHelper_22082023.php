<?php 
namespace App\Helpers;

class SapUrlHelper
{
 
  public function getWhDatas($urlPath)
  {
     $url = 'http://103.249.96.242:50000/'.$urlPath;
     // $url = 'http://10.10.63.139:50000/'.$urlPath;
    // $url = 'http://10.10.63.140:8001/'.$urlPath;
    $userName = 'nagaabap'; $password = 'App@IT$2k23';
     // $userName = 'nagaabap'; $password = 'Naga@54321';
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
   
}
