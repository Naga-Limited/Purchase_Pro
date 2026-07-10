<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\RndConfirmationPlanModel;

class RndConfirmationPlan extends BaseApiController{
    
    public function getsublotDetByLotId(){
        $rndConfirmationPlan = new RndConfirmationPlanModel();
        $postData = $this->request->getJSON();
        return  $this->sendSuccessResult($rndConfirmationPlan->getsublotDetByLotId($postData->search_Id));
    }

    public function getStorageLocationByLotId(){
        $rndConfirmationPlan = new RndConfirmationPlanModel();
        $postData = $this->request->getJSON();
        return  $this->sendSuccessResult($rndConfirmationPlan->getStorageLocationByLotId($postData->search_Id));
    }

    public function getPlantByLocationId(){
        $rndConfirmationPlan = new RndConfirmationPlanModel();
        $postData = $this->request->getJSON();
        return  $this->sendSuccessResult($rndConfirmationPlan->getPlantByLocationId($postData->search_Id));
    }

    public function getWHByPlantId(){
        $rndConfirmationPlan = new RndConfirmationPlanModel();
        $postData = $this->request->getJSON();
        return  $this->sendSuccessResult($rndConfirmationPlan->getWHByPlantId($postData->search_Id));
    }

    public function getWheatVariety(){
        $rndConfirmationPlan = new RndConfirmationPlanModel();
        $postData = $this->request->getJSON();

        return  $this->sendSuccessResult($rndConfirmationPlan->
                getWheatVariety(
                    $postData->lot_id,
                    $postData->sl_id,
                    $postData->plant_id,
                    $postData->wh_id
                )
        );
    }

    public function getWarehousePlanUnPlanList(){
        $postData = $this->request->getJSON();
        $model = new RndConfirmationPlanModel();
  
        //var_dump($postData); exit();
        
        $res = $model->getWarehousePlanUnPlanList(
          $postData->screenType,
          $postData->MonthYear,
          $postData->Lotid,
          $postData->StorageLocationid,
          $postData->Plantid,
          $postData->Warehouseid,
          $postData->Wheatvarietyid,
          $postData->Division,
        );
        return  $this->sendSuccessResult($res);
    }

    public function getWarehouseUnPlanList(){
        $postData = $this->request->getJSON();
        $model = new RndConfirmationPlanModel();
  
        //var_dump($postData); exit();
        
        $res = $model->getWarehouseUnPlanList(
          $postData->screenType,
          $postData->MonthYear,
          $postData->Lotid,
          $postData->StorageLocationid,
          $postData->Plantid,
          $postData->Warehouseid,
          $postData->Wheatvarietyid,
          $postData->Division,
        );
        return  $this->sendSuccessResult($res);
    }

    public function getWarehousePlanList(){
        $session = session();
        $SessionUser=$_SESSION["USERID"];
        $SessionUserName=$_SESSION["FIRSTNAME"];
          
        $postData = $this->request->getJSON();
        
  
        //var_dump($postData); exit();
        // echo "1 ",$postData->screenType;
        // echo "2 ",$postData->FilterData->screenType;
        // print_r($postData); exit();
        
        $model = new RndConfirmationPlanModel();
        $res = $model->getWarehousePlanList(
                          $postData->screenType,
                          $postData->MonthYear,
                          $postData->Lotid,
                          $postData->StorageLocationid,
                          $postData->Plantid,
                          $postData->Warehouseid,
                          $postData->Wheatvarietyid,
                          $postData->Division,
                        );
        
        //var_dump($res ); exit();
        // $total =  sizeof($res);
        // return json_encode(["success" => 1, "results" => $res, "count" => $total]);
        return  $this->sendSuccessResult($res);
    }

    //Mohan 26072022 Get Plant List Based on Lotno & locationcode (LGORT) for plant list edit in Movement Plan
    public function getLotnoLocPlanList(){
        $session = session();
        $SessionUser=$_SESSION["USERID"];
        $SessionUserName=$_SESSION["FIRSTNAME"];
          
        $postData = $this->request->getJSON();
        
  
        //var_dump($postData); exit();
        
        $model = new RndConfirmationPlanModel();
        $res = $model->getLotnoLocPlanList(
                          $postData->warehouseid,
                          $postData->plantid,
                          $postData->locationid,
                          $postData->lotid,
                          $postData->wheatvarityid
                        );
  
        //var_dump($res ); exit();
        // $total =  sizeof($res);
        // return json_encode(["success" => 1, "results" => $res, "count" => $total]);
        return  $this->sendSuccessResult($res);
      }

  

}
