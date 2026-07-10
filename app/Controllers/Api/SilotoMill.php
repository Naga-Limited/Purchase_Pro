<?php namespace App\Controllers\Api;
use App\Models\SilotoMillModel;

date_default_timezone_set("Asia/Calcutta");
class SilotoMill extends BaseApiController
{    
    public function addInfo(){
      $postData = $this->request->getJSON();

      // var_dump($postData);exit();
      
     $model = new SilotoMillModel();  

      $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");
      include_once APIPATH. "/db_connection.php";       
      $usql = "UPDATE empty_vehicle_arrival SET stm_LoadDt='$CurrentDateTime',stm_LoadByName='$SessionUserName',stm_LoadBy='$SessionUser' WHERE ID = " . $postData->VehicleArrivalId;
      // echo $usql; exit();
      mysqli_query($connect, $usql);

      $Qry="SELECT Id FROM `silotomill_dispatch_info` where VehicleArrivalId='".$postData->VehicleArrivalId."'";
      // echo $Qry; exit();
      $SelectDispDet=mysqli_query($connect,$Qry);
      $FetchDispDet=mysqli_fetch_assoc($SelectDispDet);

      if($FetchDispDet['Id']!=""){
        $res = $model->updateDisp($FetchDispDet['Id'],$postData);
      }else{
        $res = $model->add($postData);
      }



     // $res = $model->add($postData);
      if($res)
        return  $this->respond(["success" => 1, "results" => $res]);
      else{        
        return  $this->respond(["success" => 0]);
      }
    }
    public function RejectInfo($id){
     
      $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");
      include_once APIPATH. "/db_connection.php"; 
      $usql = "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS='11',GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser' WHERE ID = " . $id;

  mysqli_query($connect, $usql);
  return  $this->respond(["success" => 1]);
    }
    public function updateInfo(){
      $id = $this->request->getGet("id");
      if($id){
        $postData = $this->request->getJSON();
        $model = new IntraStateDispatchInfoModel();
        $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");
      include_once APIPATH. "/db_connection.php";      
      if($postData->isSendingRedirected==0){
      $usql = "UPDATE empty_vehicle_arrival SET PickSlipDt='$CurrentDateTime',PickSlipByName='$SessionUserName',PickSlipBy='$SessionUser' WHERE ID = " . $postData->vehicleArrivalId;
      }
      if($postData->isSendingRedirected==1){
        $usql = "UPDATE empty_vehicle_arrival SET RedirectDt='$CurrentDateTime',RedirectByName='$SessionUserName',RedirectBy='$SessionUser' WHERE ID = " . $postData->vehicleArrivalId;
        }
      mysqli_query($connect, $usql);

      //Update WB Weight 
      if($postData->isSendingRedirected==0){
      $usql = "UPDATE wb_rm SET Status='1' WHERE VA_no IN(SELECT ZVA_NUMBER FROM `empty_vehicle_arrival` where  ID = " . $postData->vehicleArrivalId.")";
      mysqli_query($connect, $usql);
      }

        $res = $model->updateInfo($id,$postData);
        if($res)
          return  $this->respond(["success" => 1, "results" => $res]);
        else{        
          return  $this->respond(["success" => 0]);
        }
      }else{        
        return  $this->respond(["success" => 0, "error"=>"Please provide id"]);
      }
    }
    public function getByArrivalId($id){
      $model = new IntraStateDispatchInfoModel();
      $res = $model->getByArrivalId($id);

      //FST ADDED START
      include_once APIPATH. "/db_connection.php";      
      include_once APIPATH."/helper/queryHelper.php";
      $ReceivingPlant=$res->pickSlipDetails->receivingPlant;
      $expReceivingPlant=explode("-",$ReceivingPlant);
      $ActReceivingPlant=$expReceivingPlant[0];
      $Qry="SELECT ID FROM `wb_master` where Receving_plant='".$ActReceivingPlant."' and VA_number='".$res->ZVA_NUMBER."'";

      $WBSelect=mysqli_query($connect, $Qry);
       $WBFetch=mysqli_fetch_assoc($WBSelect);
       $WBID=$WBFetch['ID'];
 
     
        $Qry="SELECT Ticket_no as label,Ticket_no as value,First_weight as First_Weight,Netweight as Net_Weight,Second_weight as Second_Weight FROM `wb_rm` where VA_no='".$res->ZVA_NUMBER."'";
      
       $TicketDetails = getResultAsObjectArray($connect, $Qry);
       
       //FST ADDED END
      return  $this->respond(["success" => 1, "results" => $res,"OwnWBID"=>$WBID,"TicketDetails"=>$TicketDetails]);
    }
    
    
    public function getDisptachedPickslipNoByUser(){
      $userId = session()->get("USERID");
      $model = new IntraStateDispatchInfoModel();
      $res = $model->getDisptachedPickslipNoByUser($userId);
      return  $this->respond(["success" => 1, "results" => $res]);
    }
}