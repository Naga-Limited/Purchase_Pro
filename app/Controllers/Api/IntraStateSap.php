<?php namespace App\Controllers\Api;
use App\Models\IntraStateSapModel;

class IntraStateSap extends BaseApiController
{    
    public function getById(){
      $id = $this->request->getGet("id");
      $emptyArrivalId = $this->request->getGet("emptyArrivalId");
      $isTruck = $this->request->getGet("isTruck");

      $model = new IntraStateSapModel();
      $res = $model->getById($id, $emptyArrivalId, $isTruck);
      return  $this->respond(["success" => 1, "results" => $res]);
    } 

    public function getPickSlipByReceivingPlantId($plantId){
      $model = new IntraStateSapModel();
      $res = $model->getPickSlipByReceivingPlantId($plantId);
      return  $this->respond(["success" => 1, "results" => $res]);
    }
}