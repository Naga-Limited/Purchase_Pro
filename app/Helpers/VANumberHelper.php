<?php 
namespace App\Helpers;

use DOMDocument;
use DOMXPath;
class VANumberHelper
{
  public function VANumberHelper($type,$gatecode,$lastid)
  {

    date_default_timezone_set('Asia/Kolkata');
    $date = date( 'd', time () );
    $Currentmonth = date( 'm', time () );
    $Currentyear = date( 'y', time () );

    $alfamonth = '';
        if ($Currentmonth == '01') {
            $alfamonth = 'A';
        }else if($Currentmonth == '02') {
           $alfamonth = 'B';
        }else if($Currentmonth == '03') {
           $alfamonth='C';
        }else if($Currentmonth == '04') {
           $alfamonth='D';
        }else if($Currentmonth == '05') {
           $alfamonth='E';
        }else if($Currentmonth == '06') {
           $alfamonth='F';
        }else if($Currentmonth == '07') {
           $alfamonth='G';
        }else if($Currentmonth == '08') {
           $alfamonth='H';
        }else if($Currentmonth == '09') {
           $alfamonth='I';
        }else if($Currentmonth == '10') {
           $alfamonth='J';
        }else if($Currentmonth == '11') {
           $alfamonth='L';
        }else {
           $alfamonth='M';
        }
        
        $year=substr($Currentyear, 0, 2);
        $today=$type.$gatecode.$year.$alfamonth.$date;
        if(strlen($lastid)>0){
        $currentno=(substr($lastid,0,11));
        if($currentno == $today){
        $unique_no = ++$lastid;
        }else{
          $unique_no = $today.'001';
        }
        }else{
          $unique_no = $today.'001';
        }
        return $unique_no;     
  }

}
