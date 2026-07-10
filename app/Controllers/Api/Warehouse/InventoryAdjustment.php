<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\warehouse\InventoryAdjustmentModel;

class InventoryAdjustment extends BaseApiController
{
  
  public function getInventoryAdjustment(){
    $postData = $this->request->getJSON();
    
    $model = new InventoryAdjustmentModel();
    $res = $model->getInventoryAdjustment($postData->lotid,$postData->WheatVarietyId,$postData->whId,$postData->plantid);
    return  $this->sendSuccessResult($res);
  }

  public function SaveInventoryAdjustment(){
    
    $postData = $this->request->getJSON();
    //var_dump($postData); exit();
    
    $model = new InventoryAdjustmentModel();
    $res = $model->SaveInventoryAdjustment($postData);
    echo $res;
    return  $this->sendSuccessResult($res);
  }
}
