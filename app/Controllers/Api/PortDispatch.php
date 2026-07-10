<?php namespace App\Controllers\Api;
use App\Models\EmptyVehicleArrivalModel;
use App\Models\PortDispatchModel;

class PortDispatch extends BaseApiController
{    
    public function getContainerDetailById(){
      $qs = $this->request->getGet();
      $model = new PortDispatchModel();
      $res = $model->getContainerDetailById($qs["id"]);
      return $this->sendSuccessResult( $res) ;
    }
    public function getContainersBySendingPort(){
      $json = $this->request->getJSON();      
      $model = new PortDispatchModel();
      $res = $model->getContainersBySendingPort($json->portOfLoading); 
      return $this->sendSuccessResult( $res) ;
    }
}