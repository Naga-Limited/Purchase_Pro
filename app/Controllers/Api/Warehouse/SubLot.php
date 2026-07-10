<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\STOPODeliveryPlanModel;

class SubLot extends BaseApiController
{
  
  public function getWarehouseDetails(){
    $postData = $this->request->getJSON();
    include_once APIPATH. "/db_connection.php";  
    $totalWheatVarietyInLot=5;
    $Qry="SELECT Color FROM `ngw_lotwheatstatus` where  WheatStatusName='EMPTY LOT'";
    $SelectRow=mysqli_query($connect,$Qry);
    $FetchCol=mysqli_fetch_assoc($SelectRow);
    $EmptyLotColor=$FetchCol['Color'];

   
   
   $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];

    $WareHouseId=$postData->id;
    
    $Qry="SELECT DISTINCT RowNo FROM `ngw_lot` where warehouseid='$WareHouseId'";
    $SelectRow=mysqli_query($connect,$Qry);
    $RowArray=array();
    
    while($FetchRow=mysqli_fetch_array($SelectRow)){
      $RowNo=$FetchRow['RowNo'];
      $ColArray=array();
  
      $Qry1="SELECT lotno FROM `ngw_lot` where RowNo='$RowNo' and warehouseid='$WareHouseId'";
      $SelectCol=mysqli_query($connect,$Qry1);
      while($FetchCol=mysqli_fetch_array($SelectCol)){
       
          $lotno=$FetchCol['lotno'];
          $LotArray=array();
          $Det="".$lotno.'';
          $LotArray=array($Det);
          $Qry2="SELECT a.lotno ,b.WheatVariety,a.wheatqty,c.Color
          FROM `ngw_sublot` a
          JOIN master_mrc_wheat_variety b ON a.wheatvarietyid=b.Id
          LEFT JOIN ngw_lotwheatstatus c ON a.Status=c.Id
          where a.lotno='$lotno' and a.warehouseid='$WareHouseId'";
          $SelectLot=mysqli_query($connect,$Qry2);
          $LotDetArray=array();
          $TotalStock=0;
          $Count=mysqli_num_rows($SelectLot);
          while($FetchLot=mysqli_fetch_array($SelectLot)){
            $Det=$FetchLot['WheatVariety']."-".$FetchLot['wheatqty'].'~'.$FetchLot['Color'];
            $TotalStock=$TotalStock+$FetchLot['wheatqty'];
            array_push($LotArray,$Det);
          }
          if($Count<$totalWheatVarietyInLot){
            $NewRow=$totalWheatVarietyInLot-$Count;
            for($i=0;$i<$NewRow;$i++){
              $Det="-~".$EmptyLotColor;
              array_push($LotArray,$Det);
            }
          }
          $Det="Total Stock:".$TotalStock."~#E69A8DFF";
          array_push($LotArray,$Det);
         
       //   array_push($LotArray,"LotDet"=>$LotDetArray);
          array_push($ColArray,$LotArray);
      }
      array_push($RowArray,$ColArray);

    }
    

   

    return  $this->respond(["success" => 1,"RowArray"=>$RowArray]);
    
  
}


  
 
  
}
