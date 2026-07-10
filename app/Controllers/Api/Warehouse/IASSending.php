<?php

namespace App\Controllers\Api\Warehouse;
use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\IASSendingModel;

class IASSending extends BaseApiController{

    public function getSegmentDet(){
        $postData = $this->request->getJSON();

        // var_dump($postData); exit();
        $PO_Line_Item="";
        if(isset($postData->PO_Line_Item))
        {
            $PO_Line_Item=$postData->PO_Line_Item;
        }
        else if(isset($postData->PO_Line)){
            $PO_Line_Item=$postData->PO_Line;
        }
        $model = new IASSendingModel();
        $res = $model->getSegmentDet($postData->PO_No, $PO_Line_Item);
        return  $this->sendSuccessResult($res);
    }

    public function getLotBySegment_1(){
        $postData = $this->request->getJSON();
        //var_dump($postData); exit();

        $model = new IASSendingModel();
        $res = $model->getLotBySegment_1($postData);
        return  $this->sendSuccessResult($res);
    }

    public function getLotBySegment(){
        $postData = $this->request->getJSON();
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->getLotBySegment($postData->SegmentId, $postData->PlantId);
        return  $this->sendSuccessResult($res);
    }

    public function getPlanninglotDet_1(){
        $postData = $this->request->getJSON();
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->getPlanninglotDet_1($postData->PlanningLot_Id, $postData->Wheat_Id1, $postData->Wheat_Id2, $postData->Wheat_Id3);
        return  $this->sendSuccessResult($res);
    }

    public function getPlanninglotDet(){
        $postData = $this->request->getJSON();
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->getPlanninglotDet($postData->PlanningLot_Id, $postData->Wheat_Id);
        return  $this->sendSuccessResult($res);
    }

    public function getVADetails(){
        $postData = $this->request->getJSON();
        $model = new IASSendingModel();
        $res = $model->getVADetails($postData->ID);
        return  $this->sendSuccessResult($res);
    }

    public function getPODetails(){
        $postData = $this->request->getJSON();
  
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->getPODetails($postData->PO_Id);
        return  $this->sendSuccessResult($res);
    }

    public function getLotNumberBySegment(){
        $postData = $this->request->getJSON();
  
        //var_dump($postData);exit();
  
        $model = new IASSendingModel();
        $res = $model->getLotNumberBySegment($postData->S1,$postData->S2,$postData->S3);
        return  $this->sendSuccessResult($res);
    }

    public function getWeight(){
        $postData = $this->request->getJSON();
        
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->getWeight($postData->VANO);
        return  $this->sendSuccessResult($res);
    }

    public function SavePO_Submit(){
        $postData = $this->request->getJSON();
        $model = new IASSendingModel();
        $res = $model->SavePO_Submit($postData);
        return  $this->sendSuccessResult($res);
    }

    public function SavePO_Reject(){
        $postData = $this->request->getJSON();
  
        //var_dump($postData); exit();
  
        $model = new IASSendingModel();
        $res = $model->SavePO_Reject(
                            $postData->VA_No,
                            $postData->VehicleStatus,
                            $postData->RejectReason
                          );
        return  $this->sendSuccessResult($res);
    }

    public function getPONumber(){
        $postData = $this->request->getJSON();
        $model = new IASSendingModel();
        $res = $model->getPONumber($postData->werks);
        return  $this->sendSuccessResult($res);
    }

    public function getIASPOEditDet(){
        $postData = $this->request->getJSON();
        
        if(isset($postData->PO_No)) $PONo  = $postData->PO_No;
        if(isset($postData->VA_No)) $VA_No = $postData->VA_No;
  
        $model = new IASSendingModel();
        $res = $model->getIASPOEditDet($PONo,$VA_No);

         //var_dump($res); exit();
        $res_POLineItem = $model->getPODetails($PONo);
        $res_LotDet1 =[];
        if (!empty($res[0]['Segment'])){
            $res_LotDet1 = $model->getLotBySegmentCode($res[0]['SendingPlant'],$res[0]['Segment']);
        }
        $res_LotDet2=[];
        if (!empty($res[0]['Segment2'])){
            $res_LotDet2 = $model->getLotBySegmentCode($res[0]['SendingPlant'],$res[0]['Segment2']);
        }
        $res_LotDet3=[];
        if (!empty($res[0]['Segment3'])){
            $res_LotDet3 = $model->getLotBySegmentCode($res[0]['SendingPlant'],$res[0]['Segment3']);
        }
        $res_PlanDet1 =[];
        if (!empty($res[0]['WheatvarietyId'])){
            $res_PlanDet1 = $model->getPlanninglotDet($res[0]['LoadedLotNoid'],$res[0]['WheatvarietyId1']);
        }
        $res_PlanDet2 =[];
        if (!empty($res[0]['WheatvarietyId2'])){
            $res_PlanDet2 = $model->getPlanninglotDet($res[0]['LoadedLotNo2id'],$res[0]['WheatvarietyId2']);
        }
        $res_PlanDet3 =[];
        if (!empty($res[0]['WheatvarietyId3'])){
            $res_PlanDet3 = $model->getPlanninglotDet($res[0]['LoadedLotNo3id'],$res[0]['WheatvarietyId3']);
        }
        $res_RecLot = [];
        if(!empty($res[0]['ReceivingPlant'])){
            $res_RecLot = $model->getLotByPlant($res[0]['ReceivingPlant']);
        }
        
        return  $this->sendSuccessResult(array('IASDet'=>$res,'PoLineItemList'=>$res_POLineItem,
                'LotDet1'=>$res_LotDet1,'LotDet2'=>$res_LotDet2,'LotDet3'=>$res_LotDet3,
                'PlanDet1'=>$res_PlanDet1, 'PlanDet2'=>$res_PlanDet2, 'PlanDet3'=>$res_PlanDet3,
                'RecLot'=>$res_RecLot
              ));
    }

    public function getReportList(){
        $model = new IASSendingModel();
        $res = $model->getReportList();
        return  $this->sendSuccessResult($res);
    }

    public function getReportDetails(){
        $postData = $this->request->getJSON();
        $model = new IASSendingModel();
        $res = $model->getReportDetails($postData);
        return  $this->sendSuccessResult($res);
    }

    public function getGateOutInfo(){
        $postData = $this->request->getJSON();
        $model = new IASSendingModel();
        $res = $model->getGateOutInfo($postData);
        return  $this->sendSuccessResult($res);

    }

    public function saveGateOutInfo(){
        $postData = $this->request->getJSON();

        // var_dump($postData); exit();

        $model = new IASSendingModel();
        $res = $model->saveGateOutInfo($postData);
        return  $this->sendSuccessResult($res);
    }

}