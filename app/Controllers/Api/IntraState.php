<?php namespace App\Controllers\Api;
use App\Models\IntraStateReceivingGateOutModel;

class IntraState extends BaseApiController
{
    public function addOrUpdateReceivingGateOut(){
      $req = $this->request->getJSON();
      $model = new IntraStateReceivingGateOutModel();

      //var_dump($req);exit(); 

      $res = $model->addOrUpdate($req);
      return  $this->respond(["success" => 1, "results" => $res]);
    } 
}