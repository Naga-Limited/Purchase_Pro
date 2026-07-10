<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\PhysicalstocktakingModel;
use App\Models\Warehouse\MasterModel;

class Physicalstocktaking extends BaseApiController
{
  
  public function updatephysicalstock(){
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new PhysicalstocktakingModel();
    $Data=$postData->Data;
  
    /*if($postData->ScreenType=="QCVALIDATION"){
$Data->qcrelotby=$SessionUser;
$Data->qcrelotdate=$CurrentDateTime;
    }*/

           //  var_dump($Data);exit();
            for($i=0;$i<sizeof($Data);$i++){
              if($Data[$i]->Selected==1){
                $New=array("Status"=>2);
                if(isset($Data[$i]->Verification_Remarks)){
                  $New["Verification_Remarks"]=$Data[$i]->Verification_Remarks;
                }
               // var_dump($New);
                $res = $model->updatephysicalstock($Data[$i]->Physical_Stock_Id,$New);
              }
              
            }
    
    return  $this->sendSuccessResult($res);
  }

  public function getphysicalstocklist(){
    $postData = $this->request->getJSON();
    
    $model = new PhysicalstocktakingModel();

    $locationid= $postData->locationid;
    $storagelocationid= $postData->storagelocationid;
    $lotid= $postData->lotid;
    $warehouseid= $postData->warehouseid;

    $res = $model->getStockDetails($locationid,$lotid,$warehouseid,$storagelocationid);

  


    return  $this->respond(["results" => $res,
   
   
    "success"=>1]);
  }
  public function getphysicalstocEntryklist(){
    $postData = $this->request->getJSON();
    
    $model = new PhysicalstocktakingModel();
    $res = $model->getPhysicalStockDetails($postData);
    return  $this->respond(["results" => $res, "success"=>1]);

  }
    
}
