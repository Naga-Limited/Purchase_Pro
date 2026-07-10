<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\FumigationModel;
use App\Models\Warehouse\RndlotconversionModel;

class RndlotConversion extends BaseApiController
{
  
 
  public function saveendConversion(){
    $postData = $this->request->getJSON();
    //var_dump($postData);exit();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new RndlotConversionModel();
    $Data=$postData->Data;
  
    
    $SublotDet = $model->getSublotlist_withPlant($Data);
    $SubLotId=$SublotDet[0]['sub_lot_id'];
    $Fummodel = new FumigationModel();
    $nextrnddate=  date('Y-m-d', strtotime("+3 months", strtotime($CurrentDateTime)));

    $InsData=array(
      "SublotId"=>$SubLotId,
      'qano'=>$Data->CheckList->CheckList[0]->QaNo,
      'warehouseid'=>$Data->CheckList->warehouseid->value,
      'plantid'=>$Data->CheckList->plantid->value,
      'lotid'=>$Data->CheckList->lotid->value,
      'locationid'=>$Data->CheckList->locationid->value,
      'lotno'=>$Data->CheckList->lotid->label,
      'Wheatvarietyid'=>$Data->CheckList->wheatvarietyid->value,
      'rnddate'=>date("Y-m-d"),
      'rndconfirmqty'=>$Data->CheckList->currentstock,
      'fumigationclearedqty'=>$SublotDet[0]['Fumigationlockqty'],
      'keyloandoqty'=>$SublotDet[0]['Unpledgeqty'],
      );
    
  
   $InsId = $model->saverndConversion($InsData);//uncomment
 //exit();
   $nData=array(
    "rndlotconversiondate"=>$CurrentDateTime,
    "rndstatus"=>"COMPLETED",
    "last_rnd_lot_conversion_id"=>$InsId,
    "qano"=>$Data->CheckList->CheckList[0]->QaNo,
    "nextrnddate"=>$nextrnddate
  );

  $res = $Fummodel->updateSublot($SubLotId,$nData);

   $List=$Data->CheckList->CheckList;
   
for($i=0;$i<sizeof($List);$i++){
  $ParamValue=0;
  if($List[$i]->ParamValue!=null){
    $ParamValue=$List[$i]->ParamValue;
  }
  $InsDet=array(
    'rnd_lot_conversion_id'=>$InsId,
    'ParamName'=>$List[$i]->parametername,
    'ParamValue'=>$ParamValue,
    'Attachment'=>$List[$i]->Attachment,
    'ParamId'=>$List[$i]->rnd_lot_parametermasterid,
     );
    // var_dump($InsDet);
     $res = $model->saverndConversion_det($InsDet);
     //echo $res."<br>";
  }
  return  $this->sendSuccessResult($res);
}

public function RndSkip(){
  $postData = $this->request->getJSON();
  // echo "test";exit();
  $model = new RndlotconversionModel();
  $res = $model->RndSkip($postData);
  return  $this->respond(["results" => $res,"success"=>1]);
}

public function getLotConvertionDetails(){
  $postData = $this->request->getJSON();
   // echo "test";exit();
    $model = new RndlotconversionModel();
 $res = $model->getLotConvertionDetails($postData);
 return  $this->respond(["results" => $res, "success"=>1]);
}

public function getRndLotParameterDet(){

  $postData = $this->request->getJSON();
  $model = new RndlotconversionModel();
  $res = $model->getRndLotParameterDet($postData);
  $Params = $model->getParameters();
  $ParameterDetails = $model->getRndLotParameterDetails($postData);
  
  return  $this->respond(["results" => $res,
    "Params"=>$Params,
    "ParameterDetails"=>$ParameterDetails,
    "success"=>1]);
}

public function getRndLotconversionDet(){
  $postData = $this->request->getJSON();
  // echo "test";exit();
   $model = new RndlotconversionModel();
  $res = $model->getRndLotconversionDet($postData);
  return  $this->respond(["results" => $res,"success"=>1]);
}

public function getSublotRndDetail(){
  $postData = $this->request->getJSON();
  //var_dump($postData);exit();
  $model = new RndlotconversionModel();
  $res = $model->getSublotRnd($postData);

  return  $this->respond(["results" => $res, "success"=>1]);
}   

public function getRndDetail(){
    $postData = $this->request->getJSON();
    //echo "test";exit();
    $model = new RndlotconversionModel();
    $res = $model->getRndDetail($postData->Data->QaNo);

    $PvsRndID = $model->getPvsRndId($postData);
    $count=Count($PvsRndID);
    $RndDet=$model->getPvsRndDet($PvsRndID);
    $RndLot = $model->getPvsRndDet($PvsRndID);
    $stockarr = $model->getCurrentStockRnd($postData->Data);
    // print_r($stockarr[0]["wheatqty"]);
    return  $this->respond(["results" => $res,
      "PvsRndCount"=>$count,
      "PvsRndID"=>$PvsRndID,
      "RndDet"=>$RndDet,
      "wheatqty"=>$stockarr[0]["wheatqty"],
      "success"=>1]);
  }

}
