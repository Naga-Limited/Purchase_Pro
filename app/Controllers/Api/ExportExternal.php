<?php namespace App\Controllers\Api;
use App\Models\ExportExternalModel;

class ExportExternal extends BaseApiController
{
    public function getVehicle(){
      $va = $this->request->getGet("locations");
      $model = new ExportExternalModel();
      $res = $model->getVehicle($va);
      return  $this->respond($res);
    } 
}