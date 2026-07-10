<?php

namespace App\Controllers\Api\Warehouse;
use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
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
     
    if($postData->Screen = "FUMIGATIONENTRYSAP") {
        $fumigation=array(
        'Amount'=>$postData->FumigtnData->Amount,
        'Bag_Type'=>$postData->FumigtnData->Bag_Type,
        'Fumigation_Agency'=>$postData->FumigtnData->Fumigation_Agency,
        'Fumigation_Type'=>$postData->FumigtnData->Fumigation_Type,
        'Fumigator_Name'=>$postData->FumigtnData->Fumigator_Name,
        'Reason_for_Delay'=>$postData->FumigtnData->Reason_for_Delay,
        'Vendor_Name'=>$postData->FumigtnData->Vendor_Name,
        // 'SAPStatus_Flag'=>2,
      );
    }else{
      $fumigation=array(
        'Amount'=>$postData->FumigtnData->Amount,
        'Bag_Type'=>$postData->FumigtnData->Bag_Type,
        'Fumigation_Agency'=>$postData->FumigtnData->Fumigation_Agency,
        'Fumigation_Type'=>$postData->FumigtnData->Fumigation_Type,
        'Fumigator_Name'=>$postData->FumigtnData->Fumigator_Name,
        'Reason_for_Delay'=>$postData->FumigtnData->Reason_for_Delay,
        'Vendor_Name'=>$postData->FumigtnData->Vendor_Name,
      );
    }

    $nData=array(
      'fumigationtypeid'=>$postData->FumigtnData->Fumigation_Type,
    );
   
   $res = $model->updateSublot($postData->id,$nData);
   $res = $model->updatefumigation($postData->EditFumigationId,$fumigation);
   return  $this->sendSuccessResult($res);
  }

  public function updatesublot(){
    $postData = $this->request->getJSON();
  //  print_r($postData);exit();
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
          // $Data->lastfumigationdate=$CurrentDateTime;
          $Data->bagtypeid=$postData->FumigtnData->Bag_Type;
          
          
          //$Data->nextfumigationdate=$CurrentDateTime;
        }
      

      if($postData->ScreenType=="FORCEFUMIGATIONTEAM"){
        $Data->nextfumigationdate=$CurrentDateTime;
        //$Data->nextfumigationdate=$CurrentDateTime;
      }
      }
    // print_r($Data);exit();
    $res = $model->updatesublot($postData->id,$Data);//uncomment

    // print_r($res);exit();


    if ($postData->ClearFlag == "0" || $postData->ScreenType=="FUMIGATIONTEAM"){
      
      if($postData->ScreenType!="UNLOADINGCOMPLETION" && $postData->ScreenType!="FORCEFUMIGATIONTEAM"){
      $res = $model->UpdateNextDueDate_Fumigation($postData->id,$postData->FumigtnData->Fumigation_Type);//uncomment
      // echo "asdfasdfsdf12";exit;
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
        'Vendor_Name'=>$postData->FumigtnData->Vendor_Name,
        'Stock_MTS'=>$postData->FumigtnData->Stock,
        'Rate'=>$postData->FumigtnData->Rate,
        'Area'=>$postData->FumigtnData->Area,
        'MBRCan'=>$postData->FumigtnData->MBRCan == "NAN" ? 0 : $postData->FumigtnData->MBRCan,
        'WithoutTaxAmount'=>$postData->FumigtnData->WithoutTaxAmount,
        'Gst'=>$postData->FumigtnData->Gst,
        'SAPStatus_Flag'=> $postData->FumigtnData->Fumigation_Agency == '2' ? 1 : 0,
      );

      // print_r($postData->Data);exit();
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

  public function getSublotApprovallist(){
    $postData = $this->request->getJSON();
   
    $model = new FumigationModel();

    $res = $model->getSublotApprovallist($postData->fromdate,$postData->todate,$postData->Vendor_Name);
    
    return  $this->respond(["results" => $res,"from_date" => $postData->fromdate,"to_date" => $postData->todate,"success"=>1]);
  }
  public function Fumigation_Approval_View(){
    $postData = $this->request->getJSON();

    $data = explode(",", $postData->warehouseid);

    $warehouseid=$data[0];
    $Fumigation_Status=$data[1];
    $Vendor_Code=$data[2];
    $From_date=$data[3] == 'NULL' ? '' : $data[3];
    $To_Date=$data[4] == 'NULL' ? '' : $data[4];

    $model = new FumigationModel();

    $res = $model->Fumigation_Approval_View($warehouseid,$Fumigation_Status,$Vendor_Code,$From_date,$To_Date);
    
    return  $this->respond(["results" => $res,
                            "success"=>1]);
  }
  public function getFumigationApprovalByID(){
    //001
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $SessionRole = $_SESSION['USERROLE'];
    $model = new FumigationModel();

    
    $EditFumigation = $model->getFumigationEditList($postData->sub_lot_id);
    
    $res = $model->getSublotlistID($EditFumigation[0]['SublotId']);

    return  $this->respond([
                            "EditFumigation"=>$EditFumigation,
                            "results" => $res,
                            "success"=>1]);
  }

  public function FumigationSkip(){

    $postData = $this->request->getJSON();
    // echo "test";exit();
    // var_dump($postData);exit();
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
    
  public function other_Fumigation_insert(){
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new FumigationModel();

if($postData->ID == '') {
    $fumigation=array(
      'Fumigation_type'=>$postData->Fumigation_type,
      'area'=>$postData->area,
      'rate'=>$postData->rate,
      'total_amount'=>$postData->total_amount,
      'gst_amount'=>$postData->gst_amount,
      'overall_amount'=>$postData->overall_amount,
      'wharehouse_id'=>$postData->wharehouse_id,
      'vendor_id'=>$postData->vendor_id,
      'status'=>'1',
      'created_by'=>$SessionUser,
      'created_at'=>$CurrentDateTime,
    );
    $res = $model->insertOtherFumigation($fumigation, $postData->ID);
    return  $this->respond(["results" => $res,"success"=>1]);
}else if ($postData->status == 2){

  $result = $model->getOtherFumigationByID($postData->ID);

  $sap_data = array (
      'ID'=>$postData->ID,
      'Date'=>$CurrentDateTime,
      'warehouseid' => $result[0]['WH_REFID'],
      'fumigation_type'=>$result[0]['Fumigation_Type'],
      'vendor_name'=>$result[0]['Name'],
      'totalarea'=>$postData->area,
      'totalrate'=>$postData->rate,
      'totalwithouttaxamount'=>$postData->total_amount,
      'totalgst'=>$postData->gst_amount,
      'totalamount'=>$postData->overall_amount,
      'wharehouse_code'=>$postData->wharehouse_id,
      "wharehouse_name" => $result[0]['WH_NAME'],
      'vendor_code'=>$postData->vendor_id,
  );
  $urlPath ="zwh_otfumig/otfumigation?sap-client=900";
  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

  // print_r($res);exit;
  $message = $res[0]->MESSAGE;
  
  if(strlen($res[0]->PR_NO) == 0){
    return $this->sendErrorResult("$message,Please Contact SAP Team");
  }else if(strlen($res[0]->PR_NO) > 0) {
    $fumigation=array(
      'Fumigation_type'=>$postData->Fumigation_type,
      'area'=>$postData->area,
      'rate'=>$postData->rate,
      'total_amount'=>$postData->total_amount,
      'gst_amount'=>$postData->gst_amount,
      'overall_amount'=>$postData->overall_amount,
      'wharehouse_id'=>$postData->wharehouse_id,
      'vendor_id'=>$postData->vendor_id,
      'status'=>$postData->status,
      'sap_pr_no'=>$res[0]->PR_NO,
      'updated_by'=>$SessionUser,
      'updated_at'=>$CurrentDateTime,
    );
  $res = $model->insertOtherFumigation($fumigation,$postData->ID);
  return  $this->respond(["results" => $res,"success"=>1,"sap_pr_no"=>$res[0]->PR_NO]);
}
}else if ($postData->status == 3){
    $fumigation=array(
      'Fumigation_type'=>$postData->Fumigation_type,
      'area'=>$postData->area,
      'rate'=>$postData->rate,
      'total_amount'=>$postData->total_amount,
      'gst_amount'=>$postData->gst_amount,
      'overall_amount'=>$postData->overall_amount,
      'wharehouse_id'=>$postData->wharehouse_id,
      'vendor_id'=>$postData->vendor_id,
      'status'=>$postData->status,
      'reject_reason'=>$postData->reject_reason,
      'updated_by'=>$SessionUser,
      'updated_at'=>$CurrentDateTime,
    );
    $res = $model->insertOtherFumigation($fumigation,$postData->ID);
    return  $this->respond(["results" => $res,"success"=>1]);
}
      
  }

  public function other_Fumigation_get_overall(){
    $postData = $this->request->getJSON();
      $model = new FumigationModel();
      return  $this->sendSuccessResult($model->OtherFumigationGet($postData->formType)); 
  }

  public function getOtherFumigationByID(){
    $postData = $this->request->getJSON();
    $model = new FumigationModel();
    $res = $model->getOtherFumigationByID($postData->id);
    return  $this->respond(["results" => $res,
      "success"=>1]);
  }

  public function getSublotFumgtnSkipDetail(){
    $postData = $this->request->getJSON();
    // var_dump($postData);exit();
    $model = new FumigationModel();
    $res = $model->getSublotFumgtnSkipDetails($postData);
  
    return  $this->respond(["results" => $res,
    "success"=>1]);
  }  

  public function getWarehouseWiseDataget(){
    $postData = $this->request->getJSON();
    // print_r($postData->warehouseid);exit;
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new FumigationModel();
    $res = $model->getWarehouseWiseDataget($postData->warehouseid,$postData->Fumigation_Type);
    $FumigationId=implode(',',array_column($res, 'FumigationId'));

    $ngw_fumigation_pr_info_data = array(
      'fumigation_id'=>$FumigationId,
      'warehouse_name'=>$postData->WH_NAME,
      'sap_pr_info'=>json_encode($postData->data),
      'total_amount'=>$postData->total_amount,
      'non_tax_amount'=>$postData->non_tax_amount,
      'gst'=>$postData->gst,
      'status'=>1,
      'created_at'=>$CurrentDateTime,
      'created_by'=>$SessionUser,
      );

     if(isset($FumigationId)) {
       $result = $model->Update_Fumigation_SAP_Status($FumigationId,$ngw_fumigation_pr_info_data);
      }
    return  $this->respond(["results" => $result,
     "success"=>1]);  
  }

  public function getFumigatiomPRData(){
    $postData = $this->request->getJSON();
    // var_dump($postData);exit();
    $model = new FumigationModel();
    $res = $model->getFumigatiomPRData();
  
    return  $this->respond(["results" => $res,
    "success"=>1]);
  } 

  public function getFumigatiomPRDetails(){
    $postData = $this->request->getJSON();
    $model = new FumigationModel();
    $res = $model->getFumigatiomPRDetails($postData->warehouseid);
    $result = $res->sap_pr_info;
    return  $this->respond(["results" => json_decode($result),
    "success"=>1]);
  } 
  
  public function getFumigatiomPRUpdate(){
    $postData = $this->request->getJSON();
    // var_dump($postData);exit();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    if($postData->status == 0) {
      $ngw_fumigation_pr_info_data = array(
        'status'=>$postData->status,
        'reject_reason'=>$postData->Reject_Reason,
        'updated_at'=>$CurrentDateTime,
        'updated_by'=>$SessionUser,
        );
      $ngw_fumigation_data = array(
        'status'=>1,
    );
    }else if ($postData->status == 2) {

      $sap_data = array (
        "ID"=>$postData->id,
        "FUMIGATION_Date"=>$CurrentDateTime,
        "sap_pr_info"=>json_decode($postData->sap_pr_info),
      );
      $urlPath ="zwh_fumigation/fumigation?sap-client=900";
      $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

      // $message = $res[0]->MESSAGE;
      // print_r($res);exit;
      $message = $res[0]->MESSAGE;
  
      if(strlen($res[0]->PR_NO) == 0){
        return $this->sendErrorResult("$message,Please Contact SAP Team");
      }else if(strlen($res[0]->PR_NO) > 0) {
      $ngw_fumigation_pr_info_data = array(
          'status'=>$postData->status,
          'sap_pr_no'=>$res[0]->PR_NO,
          'updated_at'=>$CurrentDateTime,
          'updated_by'=>$SessionUser,
          );
      $ngw_fumigation_data = array(
          'status'=>3,
      );
      }
    }
    $model = new FumigationModel();
    $res = $model->getFumigatiomPRUpdate($postData->id,$postData->fumigation_id,$ngw_fumigation_pr_info_data,$ngw_fumigation_data);
    $result = $res;
    return  $this->respond(["results" => $result,
    "success"=>1]);
  } 

  public function FumigationPRReport(){
    $postData = $this->request->getJSON();
    $model = new FumigationModel();
    return  $this->sendSuccessResult($model->FumigationPRReport($postData->formType,$postData->Data->fromdate,$postData->Data->todate)); 
  }

  public function FumigationOtherPRReport(){
    $postData = $this->request->getJSON();
    $model = new FumigationModel();
    return  $this->sendSuccessResult($model->FumigationOtherPRReport($postData->formType,$postData->Data->fromdate,$postData->Data->todate)); 
  }
}

