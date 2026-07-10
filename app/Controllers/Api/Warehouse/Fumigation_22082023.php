<?php

namespace App\Controllers\Api\Warehouse;
use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\FumigationModel;

/*
1	Fumigation Due - change next fumigation date
2	Under Fumigation
3	Fumigation Lapsed
4	Degassing Due -  change degassing date(next degassing date)
5	Under Degassing
6	Degassing Lapsed
7	FUMIGATION FAILED
8	FORCE FUMIGATE
9	FUMIGATED
*/
include_once APIPATH. "/helper/sessionHelper.php";
class Fumigation extends BaseApiController
{
  public function updatefumigation(){
    // var_dump($this->request->getJSON());
     
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new FumigationModel();
    
    if($postData->ScreenType == "UPDATEFUMIGATION_QC"){
    
      if($postData->Data->Status=="7"){
        
        $nData=array(
          'lastfumigationdate'=>$CurrentDateTime,
          'nextfumigationdate'=>$CurrentDateTime,
          'fumigationstatus'=>$postData->Data->Status,
        );  
        
      }else{
        $nData=array(
          
          'fumigationstatus'=>$postData->Data->Status,
        );
      }
    }else{
      $nData=array(
        'Lastdegassingdate'=>$CurrentDateTime,
        'fumigationstatus'=>$postData->Data->Status,
      );
    }
    // var_dump($nData);
   

       $res = $model->updatesublot($postData->sub_lot_id,$nData);

       $res = $model->UpdateNextDueDate_Degass($postData->sub_lot_id);//uncomment

    $Data=$postData->Data;
    
    if($postData->ScreenType=="UPDATEFUMIGATION"){
      $Data->Last_Degassed_date=$CurrentDateTime;
    }
   
   $res = $model->updatefumigation($postData->id,$Data);
  //  var_dump($postData->Data);
  //  echo "End 001";exit();
   return  $this->sendSuccessResult($res);
  }

  public function Edit_UpdateFumigation(){
    $postData = $this->request->getJSON();
    // var_dump($postData);exit();
     $session = session();
     $SessionUser=$_SESSION["USERID"];
     $CurrentDateTime=date("Y-m-d H:i:s");
 
     $model = new FumigationModel();
     $Data=$postData->Data;
     
    $fumigation=array(
     'Amount'=>$postData->FumigtnData->Amount,
     'Bag_Type'=>$postData->FumigtnData->Bag_Type,
     'Fumigation_Agency'=>$postData->FumigtnData->Fumigation_Agency,
     'Fumigation_Type'=>$postData->FumigtnData->Fumigation_Type,
     'Fumigator_Name'=>$postData->FumigtnData->Fumigator_Name,
     'Reason_for_Delay'=>$postData->FumigtnData->Reason_for_Delay,
    
     'Vendor_Name'=>$postData->FumigtnData->Vendor_Name

   );
   $nData=array(
     'fumigationtypeid'=>$postData->FumigtnData->Fumigation_Type,
   );

   $res = $model->updateSublot($postData->id,$nData);
   $res = $model->updatefumigation($postData->EditFumigationId,$fumigation);
   return  $this->sendSuccessResult($res);
  }

  public function updatesublot(){
    $postData = $this->request->getJSON();
   //var_dump($postData);exit();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new FumigationModel();
    $Data=$postData->Data;

    //echo $postData->id;

    
    if (isset($postData->ClearFlag) && $postData->ClearFlag == "1"){
          $Data->fumigationtypeid=''; 
          $Data->degassingdate='NULL';
          $Data->Lastdegassingdate='NULL';
          $Data->fumigationstatus='';
          $Data->nextfumigationdate='NULL';
          $Data->rndlotconversiondate='NULL';
          $Data->rndstatus='PENDING';
          $Data->nextrnddate='';
          $Data->qano='';
          $Data->last_fumigation_id='';
    }

      if($postData->ScreenType=="FUMIGATIONTEAM"){
        //$Data->qcrelotby=$SessionUser;
        if($postData->ScreenType=="FUMIGATIONTEAM"){
          $Data->lastfumigationdate=$CurrentDateTime;
          $Data->bagtypeid=$postData->FumigtnData->Bag_Type;
          
          
          //$Data->nextfumigationdate=$CurrentDateTime;
        }
      

      if($postData->ScreenType=="FORCEFUMIGATIONTEAM"){
        $Data->nextfumigationdate=$CurrentDateTime;
        //$Data->nextfumigationdate=$CurrentDateTime;
      }
      }
    
    $res = $model->updatesublot($postData->id,$Data);//uncomment

    

    if ($postData->ClearFlag == "0" || $postData->ScreenType=="FUMIGATIONTEAM"){
      
      if($postData->ScreenType!="UNLOADINGCOMPLETION" && $postData->ScreenType!="FORCEFUMIGATIONTEAM"){
      $res = $model->UpdateNextDueDate_Fumigation($postData->id);//uncomment

      //echo "asdfasdfsdf12";
      $GetSublotDet = array("sub_lot_id"=>$postData->id);
      $SublotDet = $model->getSublotlist_fumAdd($GetSublotDet);
      //var_dump($SublotDet[0]);exit();
 
      $fumigation=array(
        'SublotId'=>$postData->id,
        'lotid'=>$SublotDet[0]['lotid'],
        'warehouseid'=>$SublotDet[0]['warehouseid'],
        'plantid'=>$SublotDet[0]['plantid'],
        'locationid'=>$SublotDet[0]['StorageLocationId'],
        'lotno'=>$SublotDet[0]['lotno'],
        'wheatvarietyid'=>$SublotDet[0]['wheatvarietyid'],
        // 'FumigationNo'=>$SublotDet[0][''],
        'Fumigation_date'=>$SublotDet[0]['lastfumigationdate'],
        'Last_Fumigation_Type'=>$SublotDet[0]['fumigationtypeid'],
        'Last_Fumigated_date'=>$SublotDet[0]['lastfumigationdate'],
        'Last_Degassed_date'=>$SublotDet[0]['Lastdegassingdate'],
        'Next_Due_Date'=>$SublotDet[0]['nextfumigationdate'],
        'Lead_Days'=>$SublotDet[0]['FumigationLapsed'],
        'Fumigation_Status'=>$SublotDet[0]['fumigationstatus'],
        'Amount'=>$postData->FumigtnData->Amount,
        'Bag_Type'=>$postData->FumigtnData->Bag_Type,
        'Fumigation_Agency'=>$postData->FumigtnData->Fumigation_Agency,
        'Fumigation_Type'=>$postData->FumigtnData->Fumigation_Type,
        'Fumigator_Name'=>$postData->FumigtnData->Fumigator_Name,
        'Reason_for_Delay'=>$postData->FumigtnData->Reason_for_Delay,
        'Status'=>$postData->FumigtnData->Status,
        'Vendor_Name'=>$postData->FumigtnData->Vendor_Name
      );

      $res = $model->insertFumigation($fumigation);
      //$Data=$postData->Data;
      //  echo "asdfasdfsdf 0002";
      $nData=$postData->Data;
      $nData->last_fumigation_id=$res;
      $nData->fumigationtypeid=$postData->FumigtnData->Fumigation_Type;
      $res = $model->updatesublot($postData->id,$nData);
      }
    }
    return  $this->respond(["results" => $res,"success"=>1]);
    //return  $this->sendSuccessResult($res);
  }

  public function getphysicalstocklist(){
    $postData = $this->request->getJSON();
    $model = new FumigationModel();

    $locationid= $postData->locationid;
    $lotid= $postData->lotid;
    $warehouseid= $postData->warehouseid;

    $res = $model->getStockDetails($locationid,$lotid,$warehouseid);

  


    return  $this->respond(["results" => $res,
      "success"=>1]);
  }
  public function getfumigationlist(){
    $postData = $this->request->getJSON();
   
    $model = new FumigationModel();
 $res = $model->getfumigationlist($postData);

    return  $this->respond(["results" => $res,
   
   
    "success"=>1]);
  }

  public function getSublotlist(){
    //001
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $SessionRole = $_SESSION['USERROLE'];
    $model = new FumigationModel();

    //Update Next Fumigation Date
    // Changed the Logic - 04-06-2022// $res = $model->updateSublotDet(); 
    //var_dump($postData);exit();

    $res = $model->getSublotlist($postData);
    
    // var_dump($res); exit();
    
    
    if($res[0]['fumigationstatus']==2){
      $EditFumigation = $model->getFumigationEditList($res[0]['last_fumigation_id']);
    }
   
    $FumigationButtonRights = $model->getFumigationButtonRights($SessionRole);
    
    return  $this->respond(["results" => $res,   
                            "EditFumigation"=>$EditFumigation,
                            "FumigationButtonRights"=>$FumigationButtonRights,
                            "success"=>1]);
  }

  public function FumigationSkip(){

    $postData = $this->request->getJSON();
    // echo "test";exit();
    //var_dump($postData);exit();
    $model = new FumigationModel();
    $res = $model->FumigationSkip($postData);
    return  $this->respond(["results" => $res,"success"=>1]);
  }

  public function getSublotFumgtnDetail(){
    $postData = $this->request->getJSON();
    //var_dump($postData);exit();
    $model = new FumigationModel();
    $res = $model->getSublotFumgtn($postData);
  
    return  $this->respond(["results" => $res,
    "success"=>1]);
  }  
    
}
