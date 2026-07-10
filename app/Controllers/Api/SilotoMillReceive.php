<?php namespace App\Controllers\Api;
use App\Models\SilotoMillReceivingGateOutModel;
use App\Helpers\AppHelperFn;
class SilotoMillReceive extends BaseApiController
{
    public function addOrUpdateReceivingGateOut(){
      $req = $this->request->getJSON();
      //var_dump($req);
      $isOwn =AppHelperFn::isOwnWb($req->plantId);
     // echo $isOwn;
      if($isOwn==1 && $req->vehicleStatus==5){
        $req->vehicleStatus=24;
      }
      //var_dump($req);exit();
      $model = new SilotoMillReceivingGateOutModel();
//var_dump($req);
//exit();

      $res = $model->addOrUpdate($req);
      return  $this->respond(["success" => 1, "results" => $res]);
    } 
}