<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
date_default_timezone_set("Asia/Calcutta");
class VehicleArrivalModel extends Model
{ 
   protected $table = 'purchase_info';
   protected $primaryKey = 'PI_REFID';
   protected $allowedFields = ["SecondWeightEntryDt","SecondWeightEntryBy","SecondWeightEntryByName","FirstWeightEntryDt","FirstWeightEntryBy","FirstWeightEntryByName","LastStatusChangedBy","LastStatusChangedOn","UnloadingRedirectGateoutDt","UnloadingRedirectGateoutBy","UnloadingRedirectDt","UnloadingRedirectBy","QualityDeductionRejectDt","QualityDeductionRejectBy","QualityDeductionSubmitDt","QualityDeductionSubmitBy","UnloadWHSubmitDt","UnloadWHSubmitBy","MIGOApprovalDt","MIGOApprovalBy","GateOutDt","GateOutByName","GateOutBy","QualityCheckSubmitDt","QualityCheckSubmitBy","GateInDt","GateInBy","WaitOutsideDt","WaitOutsideBy", "AddedBy","ModifiedBy", "WERKS","ZVA_NUMBER", "TRUCK_NO", "DRIVER_NO", "VECHICAL_STATUS",  "SCREEN_TYPE", "VEHICLE_TYPE", "QA_STATUS", "PICK_SLIP_NO", "EMPTY_VEHICLE_ARRIVAL_ID"];
  
   public function isPickSlipExist($pickSlipNo){
     $builder =  $this->db->table($this->table);
     $builder->selectCount('PI_REFID',"totalCount");
     $builder->where("PICK_SLIP_NO='$pickSlipNo' and (QA_STATUS is null or QA_STATUS<>'R') and VECHICAL_STATUS<>".StatusConstant::$COMPLETED);
     $total = $builder->get()->getFirstRow()->totalCount;
     return $total>0;   
    }

    public function isVehicleNoExist($vehicleNo){
      $builder =  $this->db->table($this->table);
      $builder->selectCount('PI_REFID',"totalCount");
      $builder->where("TRUCK_NO='$vehicleNo' and (QA_STATUS is null or QA_STATUS<>'R') and VECHICAL_STATUS<>".StatusConstant::$COMPLETED);
      $total = $builder->get()->getFirstRow()->totalCount;
      if ($total == 0){
        return true;   
      }else{
        return false;   
      }
      
     }

     public function isVehicleNoExistAllCloseStatus($vehicleNo){
      $builder =  $this->db->table($this->table);
      $builder->selectCount('PI_REFID',"totalCount");
      $builder->where("TRUCK_NO='$vehicleNo' 
      and VECHICAL_STATUS not in ( ".StatusConstant::$COMPLETED.",".StatusConstant::$MIGOCOMPLETED.",".StatusConstant::$REJECT_GATEOUT.",".StatusConstant::$REDIRECT.",".StatusConstant::$MIGOAPPROVAL.")");
      $total = $builder->get()->getFirstRow()->totalCount;
      if ($total == 0){
        return true;   
      }else{
        return false;   
      }
      
     }

   public function  add($postData){
      $res = $this->getNextZvaNumber("RMIAS",$postData->WERKS);
      //var_dump($postData) ;exit();
      $ret = $this->insert($postData);
      //echo $this->db->getLastQuery();
      return $ret;

   }

   public function UpdateWeight($id,$WeightEntry,$Status){
   
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $upda =array();    
      
        if($WeightEntry==1){
          $upda['FirstWeightEntryDt']=$CurrentDateTime;
          $upda['VECHICAL_STATUS']=$Status;
          $upda['FirstWeightEntryBy']=$SessionUser;
          $upda['FirstWeightEntryByName']=$SessionUserName;
          
        }
        
        if($WeightEntry==2){
          $upda['SecondWeightEntryDt']=$CurrentDateTime;
          $upda['VECHICAL_STATUS']=5;
          $upda['SecondWeightEntryBy']=$SessionUser;
          $upda['SecondWeightEntryByName']=$SessionUserName;
          
        }
    return $this->update($id,$upda);   
   }

   public function updateStatus($id, $status){

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $upda =array("VECHICAL_STATUS"=>$status);    
      
        if($status==5){
          $upda['UnloadWHSubmitDt']=$CurrentDateTime;
          $upda['UnloadWHSubmitBy']=$SessionUser;
          $upda['UnloadWHSubmitByName']=$SessionUserName;
          
        }
        if($status==12){
          $upda['GateOutDt']=$CurrentDateTime;
          $upda['GateOutBy']=$SessionUser;
          $upda['GateOutByName']=$SessionUserName;
        }

        //var_dump($upda); exit();
    return $this->update($id,$upda);   
   }
   public function rejectAndGateOut($id){
    return $this->update($id,["VECHICAL_STATUS"=>StatusConstant::$GATEOUT, "QA_STATUS"=>'R']);   
   }

   public function getNextZvaNumber($moduleId, $plantId,$table="purchase_info",$orderBy="PI_REFID") {
      $sql = "select WH_CODE from master_plant where WERKS = '$plantId'";
      $qry = $this->db->query($sql);
      $whcode = "";
      $rs = $qry->getFirstRow();
      if(isset($rs))   {
        // echo "Enter", $rs->WH_CODE;
        $whcode = $rs->WH_CODE;   
      }
  
      $today = getdate(date("U"));
      $code = $moduleId . $whcode . substr($today["year"], 2, 2);
      $sql = "select ZVA_NUMBER from $table where ZVA_NUMBER like '" . $code . "%' ORDER BY $orderBy DESC LIMIT 1";
      //  echo  $sql ;
      $qry = $this->db->query($sql);
      $res = $qry->getFirstRow();
      if ($res) {
        $newzancode = str_replace($code, "", $res->ZVA_NUMBER);
        (int) $newzancode++;
        return $code . sprintf("%08d", $newzancode);
      } else {
        // echo $code;
        return $code . sprintf("%08d", 1);
      }
    }
}