<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\BagcuttingModel;
use App\Models\Warehouse\MasterModel;

class Bagcutting extends BaseApiController
{
  
  public function updateBagcut(){
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new BagcuttingModel();
    $Data=$postData->Data;
  
    if($postData->ScreenType=="BAGCUTTINGAPPROVAL"){
//$Data->qcrelotby=$SessionUser;
$Data->wmApproveDate=$CurrentDateTime;
    }
    if($postData->ScreenType=="BAGCUTTINGCONFIRMATION"){
      //$Data->qcrelotby=$SessionUser;
      $Data->ACApproveDate=$CurrentDateTime;
          }
         // var_dump($Data);exit();

    $res = $model->updateBagcut($postData->id,$Data);
    
    return  $this->sendSuccessResult($res);
  }

  public function getphysicalstocklist(){
    $postData = $this->request->getJSON();
    
    $model = new BagcuttingModel();

    $locationid= $postData->locationid;
    $lotid= $postData->lotid;
    $warehouseid= $postData->warehouseid;

    $res = $model->getStockDetails($locationid,$lotid,$warehouseid);

    return  $this->respond(["results" => $res,"success"=>1]);
  }

  public function getbagcuttinglist(){
    $postData = $this->request->getJSON();
   
    $model = new BagcuttingModel();
    $res = $model->getbagcuttinglist($postData);
    return  $this->respond(["results" => $res,"success"=>1]);
  }
    
}
