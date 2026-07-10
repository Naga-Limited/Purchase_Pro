<?php 
namespace App\Helpers;

class AppHelperFn
{
  public static function isOwnWb($Werks)
  {
    include_once APIPATH . "/db_connection.php";
    $Qry = "SELECT OwnWB FROM `master_plant` where WERKS='$Werks' and RecStatus='1' limit 1";
    $Select = mysqli_query($connect, $Qry);
    $Fetch = mysqli_fetch_assoc($Select);
    // var_dump($Fetch);
    return $Fetch['OwnWB'];
  }


    public static function isOwnWbFromVehArriv($connect,$Id){
        // include_once APIPATH. "/db_connection.php";      
           $usql = "SELECT WERKS FROM `purchase_info` where PI_REFID='".$Id."'";
       // var_dump($connect);
       // exit();
        $selPlant=mysqli_query($connect, $usql);
      
         $FetchPlant=mysqli_fetch_assoc($selPlant);
      $exp=explode("-",$FetchPlant['WERKS']);
         
         $Qry="SELECT OwnWB FROM `master_plant` where WERKS='".$exp[0]."' and RecStatus='1' limit 1";
         $Select = mysqli_query($connect, $Qry);
         $Fetch=mysqli_fetch_assoc($Select);
       //  var_dump($Fetch);
         return $Fetch['OwnWB']; 
 
     }

    public static function isOwnWbFromEVA($connect,$Id){
       // include_once APIPATH. "/db_connection.php";      
          $usql = "SELECT PLANT_ID FROM `empty_vehicle_arrival` where ID='".$Id."'";
      // var_dump($connect);
      // exit();
       $selPlant=mysqli_query($connect, $usql);
     
        $FetchPlant=mysqli_fetch_assoc($selPlant);
     
        
        $Qry="SELECT OwnWB FROM `master_plant` where WERKS='".$FetchPlant['PLANT_ID']."' and RecStatus='1' limit 1";
        $Select = mysqli_query($connect, $Qry);
        $Fetch=mysqli_fetch_assoc($Select);
      //  var_dump($Fetch);
        return $Fetch['OwnWB']; 

    }
   
}
