<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
class SilotoMillModel  extends Model
{  
    protected $table = 'silotomill_dispatch_info';
    protected $primaryKey = 'Id';
    protected $allowedFields = [ "VehicleArrivalId", "truckNo","Plant","driverNo","VANumber","ZPO_NUMBER","PO_LINE_ITEM","WheatVariety","StorageLocation","ReceivingPlant","ReceivingBin","BulkSiloNo","Ewaybillcopy","vehicleStatus"
];
//protected $allowedFields = ["VehicleArrivalId", "truckNo","Plant","driverNo","VANumber","ZPO_NUMBER","PO_LINE_ITEM","WheatVariety","StorageLocation","ReceivingPlant","ReceivingBin","BulkSiloNo","Ewaybillcopy","vehicleStatus"];
    
    
    public function add($postData){
        $this->db->transStart();
        $this->insert($postData);  
        if($postData->VehicleArrivalId!=""){
        $this->updateEmptyArrivalStatus($postData->VehicleArrivalId,$postData->vehicleStatus );
        }
        
        $this->db->transComplete();
        if ($this->db->transStatus() === FALSE)
        { 
            return false;
        }
        return $postData;
    }
    public function updateDisp($id,$postData){
   // var_dump($postData);exit();
         $this->db->transStart();
         $this->update($id,$postData);   
        $this->updateEmptyArrivalStatus($postData->VehicleArrivalId,$postData->vehicleStatus );
         $this->db->transComplete();
             if ($this->db->transStatus() === FALSE)
             { 
                 return false;
             }
             return $postData;
     }
       
    public function updateEmptyArrivalStatus($arrivalId, $status)
    {  
        //echo "A :", $arrivalId, " B :", $status; exit();

        $vaModel= new EmptyVehicleArrivalModel();
        $upda =array("VEHICLE_STATUS"=>$status);
        $vaModel->update($arrivalId,$upda);
    }

    public function updateInfo($id,$postData){
        $this->db->transStart();
        $this->update($id,$postData);   
        // $vaModel= new EmptyVehicleArrivalModel();

        if(isset($postData->receivingArrivalId) ){
            if(isset($postData->vehicleStatus)){
                $vModel = new VehicleArrivalModel();
                $vModel->rejectAndGateOut($postData->receivingArrivalId);
                $this->updateEmptyArrivalStatus($postData->vehicleArrivalId,$postData->vehicleStatus);
                // $vaModel->update($postData->vehicleArrivalId,$upda);
                // $vaModel->updateStatus($postData->vehicleArrivalId,$postData->vehicleStatus);
            }
        }
        else{            
            $this->updateEmptyArrivalStatus($postData->vehicleArrivalId,$postData->vehicleStatus);
            // $vaModel->updateStatus($postData->vehicleArrivalId,$postData->vehicleStatus);
        }
        $this->db->transComplete();
        if ($this->db->transStatus() === FALSE)
        {
            return false;
        }
        return $postData;
    }

    public function getByArrivalId ($vehicleArrivalId){
        $builder =  $this->db->query("select ZVA_NUMBER,va.DRIVER_NO as driverNo,  va.TRUCK_NO truckNo, va.TRAILER_NO trailerNo,di.intraStateSapId, di.id,". join(",di.",$this->allowedFields)." from $this->table di
        join empty_vehicle_arrival va on va.id = di.VehicleArrivalId
        where va.Id=$vehicleArrivalId");
        $res =  $builder->getFirstRow();
        if(isset($res) && isset($res->intraStateSapId)){
            $sapModel = new IntraStateSapModel();        
            $res->pickSlipDetails = $sapModel->getById($res->intraStateSapId);
        }
        return $res;
    }
    public function getDisptachedPickslipNoByUser ($userId){
        $plantModel = new PlantModel();
        $plantIdCount =  $plantModel->hasPlant($userId)? 1: 0 ;
        $sql = "SELECT di.pickSlipNo as label, vehicleArrivalId as value,di.id as dispatchId, ev.ZVA_NUMBER as  zvaNumber FROM `silotomill_dispatch_info` di JOIN empty_vehicle_arrival ev on di.vehicleArrivalId = ev.ID
        JOIN intrastate_sap_to_pp sap on sap.Id = di.IntraStateSapId
        WHERE ($plantIdCount=0 or Exists (select PLANT_CODE from  view_user_plant where user_id=$userId and PLANT_CODE =sap.ReceivingPlant)) and ev.VEHICLE_STATUS =".StatusConstant::$INTRANSIT ." and ev.SCREEN_TYPE='EVADP'";
        //   echo $sql;
        $builder =  $this->db->query($sql);
        return $builder->getResultArray();
    }
}