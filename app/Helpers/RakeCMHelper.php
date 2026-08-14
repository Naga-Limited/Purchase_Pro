<?php
namespace App\Helpers;

class RakeCMHelper
{
  public static function getRakeCMTripsheetInfo($fnrNo, $vehicleNo)
  {
     $url = RAKECM_TRIPSHEET_URL.'?'.http_build_query(['fnr_no' => $fnrNo, 'vehicle_no' => $vehicleNo]);
     $headers = array('X-API-KEY: '.RAKECM_API_KEY);
     $ch = curl_init();
     curl_setopt($ch, CURLOPT_URL, $url);
     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
     $result = curl_exec($ch);
     curl_close($ch);
     return $result;
  }
}
