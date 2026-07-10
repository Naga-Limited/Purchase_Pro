<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\KeyloanModel;

class Keyloan extends BaseApiController
{
  
  public function getKeyloanData(){
    $postData = $this->request->getJSON();
    
    $model = new KeyloanModel();
    $res = $model->getKeyloanData($postData->lotid,$postData->WheatVarietyId,$postData->whId,$postData->plantid,$postData->storagelocationid);
    return  $this->sendSuccessResult($res);
  }
  
  public function getkeyloanReportlist(){
    $postData = $this->request->getJSON();
   
    $model = new KeyloanModel();
    $res = $model->getkeyloanReportlist($postData);
    return  $this->sendSuccessResult($res);
    // return  $this->respond(["results" => $res, "success"=>1]);
  }
    
}
