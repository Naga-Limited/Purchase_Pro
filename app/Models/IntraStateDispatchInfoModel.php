<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
class IntraStateDispatchInfoModel  extends Model
{  
    protected $table = 'intrastate_warhouse_dispatch_info';
    protected $primaryKey = 'Id';
    protected $allowedFields = ["intraStateSapId",
    "isSendingRedirected","isRedirected","irsContainerDetailsId", 
    "vehicleArrivalId", "loadedLotNo", "lastMileTransporterId", "lastMileTransporter", "loadingVendorId", "loadingVendor", "loadingChargesPerTon", "freightChargesPerTon", "pickSlipNo", 
    "isTruck", "wbType", "wbName", "wbSerialNumber", 
    "trailerNo","truckNo", "containerNo","pickSlipCopy","wbSlipCopy",
    "ewayBillCopy","ReceivingBin_id","ReceivingBin_Name"    ];

    //"sendingPlant", "wheatVariety", "materialNo", "receivingPlant", "receivingStorageLocation","sendingStorageLocation",
    // "stoPoNo", "deliveryNo",     "wbEmptyWt", "wbNetWt", "gunnyWt","wbLoadWt", "gunnyLessNetWt", "bagType", "pickSlipQty",  "salesInvoiceNo", "sealNumber",

public function updateDisp($id,$postData){
   // var_dump($postData);exit();
    $this->db->transStart();
    $this->update($id,$postData);   
    $this->updateEmptyArrivalStatus($postData->vehicleArrivalId,$postData->vehicleStatus );
    $this->db->transComplete();
        if ($this->db->transStatus() === FALSE)
        { 
            return false;
        }
        return $postData;
}
    public function add($postData){
        $this->db->transStart();
        $this->insert($postData);  
        $this->updateEmptyArrivalStatus($postData->vehicleArrivalId,$postData->vehicleStatus );
        // $vaModel= new EmptyVehicleArrivalModel();
        // $upda =array("VEHICLE_STATUS"=>$postData->vehicleStatus);
        // if($postData->vehicleStatus==StatusConstant::$INTRANSIT){
        //     $upda["GATE_OUT_TM"]= date("Y-m-d H:i:s");
        // }
        // $vaModel->update($postData->vehicleArrivalId,$upda);//($postData->VehicleArrivalId,["VEHICLE_STATUS"=>"9"]);
        $this->db->transComplete();
        if ($this->db->transStatus() === FALSE)
        { 
            return false;
        }
        return $postData;
    }
    public function updateEmptyArrivalStatus($arrivalId, $status)
    {  $vaModel= new EmptyVehicleArrivalModel();
        $upda =array("VEHICLE_STATUS"=>$status);
        if($status==StatusConstant::$INTRANSIT || $status==StatusConstant::$PICKSLIP){
            $upda =array("VEHICLE_STATUS"=>$status,"GATE_OUT_TM"=>date("Y-m-d H:i:s"));
        }
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

    public function getByArrivalId($vehicleArrivalId){

        // $sql = "select ZVA_NUMBER,va.DRIVER_NO as driverNo,  va.TRUCK_NO truckNo, va.TRAILER_NO trailerNo,di.intraStateSapId, di.id,". join(",di.",$this->allowedFields)." from $this->table di
        // join empty_vehicle_arrival va on va.id = di.VehicleArrivalId
        // where va.Id=$vehicleArrivalId";

        $sql = "select di.PO_Number, di.PO_LineItem, va.ZVA_NUMBER, va.DRIVER_NO as driverNo,  va.TRUCK_NO truckNo, di.DeliveryNo,
        va.TRAILER_NO trailerNo, di.intraStateSapId, di.id,". join(",di.",$this->allowedFields)." from $this->table di
        join empty_vehicle_arrival va on va.id = di.VehicleArrivalId
        where va.Id=$vehicleArrivalId";
        
        // echo $sql; exit();
        $builder =  $this->db->query($sql);
        $res =  $builder->getFirstRow();

        // if(isset($res) && isset($res->intraStateSapId)){
        //     $sapModel = new IntraStateSapModel();        
        //     $res->pickSlipDetails = $sapModel->getById($res->intraStateSapId);
        // }

        if(isset($res) && isset($res->PO_Number) && isset($res->PO_LineItem)){
            $sapModel = new IntraStateSapModel();        
            $res->pickSlipDetails = $sapModel->getByPOLineItem($res->PO_Number, $res->PO_LineItem, $vehicleArrivalId);
        }
        return $res;
    }

    public function getDisptachedPickslipNoByUser ($userId){ 
        $plantModel = new PlantModel();
        $plantIdCount =  $plantModel->hasPlant($userId)? 1: 0 ;

            // Commented by Arul For PO number instead of Pick Slip 31-07-2022
            // $sql = "SELECT di.pickSlipNo as label, 
            //                di.vehicleArrivalId as value,
            //                di.id as dispatchId, 
            //                ev.ZVA_NUMBER as zvaNumber 
            // FROM `intrastate_warhouse_dispatch_info` di 
            // JOIN empty_vehicle_arrival ev on di.vehicleArrivalId = ev.ID
            // JOIN intrastate_sap_to_pp sap on sap.Id = di.IntraStateSapId
            // WHERE ($plantIdCount=0 or Exists 
            //       (select PLANT_CODE from  view_user_plant where user_id=$userId and PLANT_CODE =sap.ReceivingPlant)) 
            //       and ev.VEHICLE_STATUS ='".StatusConstant::$INTRANSIT ."' 
            //       and ev.SCREEN_TYPE='EVADP'";

                  $sql = "SELECT di.PO_Number as label, 
                  di.vehicleArrivalId as value,
                  di.id as dispatchId, 
                  ev.ZVA_NUMBER as zvaNumber 
   FROM `intrastate_warhouse_dispatch_info` di 
   JOIN empty_vehicle_arrival ev on di.vehicleArrivalId = ev.ID
   JOIN intrastate_sap_to_pp sap on sap.PoNumber = di.PO_Number AND sap.PoLineItem = di.PO_LineItem
   WHERE ($plantIdCount=0 or Exists 
         (select PLANT_CODE from  view_user_plant where user_id=$userId and PLANT_CODE =sap.ReceivingPlant)) 
         and ev.VEHICLE_STATUS ='".StatusConstant::$INTRANSIT ."' 
         and ev.SCREEN_TYPE='EVADP'";
        
       
        //echo $sql;
        $builder =  $this->db->query($sql);
        return $builder->getResultArray();
    }


    public function getDispatchedVehicleNoByUser($userId){

        $plantModel = new PlantModel();
        $plantIdCount = 0;  // $plantModel->hasPlant($userId)? 1: 0 ;

        // $sql = "SELECT a.TRUCK_NO AS label, a.ID as value, a.ZVA_NUMBER, b.Id as VehicleArrivalID 
        //         FROM empty_vehicle_arrival a 
        //         JOIN intrastate_warhouse_dispatch_info b ON b.Id = a.ID
        //         WHERE ($plantIdCount = 0 or Exists 
        //         (select PLANT_CODE from  view_user_plant where `USER_ID` ='$userId' and PLANT_CODE =b.ReceivingPlant)) 
        //         and a.VEHICLE_STATUS ='".StatusConstant::$INTRANSIT ."' 
        //         and a.SCREEN_TYPE='EVADP'"; 
        
        $sql = "SELECT ifnull(a.TRUCK_NO, a.TRAILER_NO) AS label, a.ID as value, a.ZVA_NUMBER, b.Id as VehicleArrivalID 
                FROM empty_vehicle_arrival a 
                JOIN intrastate_warhouse_dispatch_info b ON b.VehicleArrivalID = a.ID
                WHERE ($plantIdCount = 0 or Exists 
                (select PLANT_CODE from  view_user_plant where `USER_ID` ='$userId' and PLANT_CODE =b.ReceivingPlant)) 
                and a.VEHICLE_STATUS ='".StatusConstant::$INTRANSIT ."' 
                and a.SCREEN_TYPE='EVADP'"; 
//var_dump($sql);
  //        echo $sql; exit();
        $builder =  $this->db->query($sql);
        return $builder->getResultArray();

    }
}