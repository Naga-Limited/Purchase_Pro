<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
class SilotoMillReceivingGateOutModel extends Model
{ 
  //SELECT "Id", "DateAdded", "DateModified", "AddedBy", "ModifiedBy", "EmptyVehicleArrivalId", "IasDispatchId", "UnloadedLotNo", "UnLoadingVendorId", "UnLoadingVendor", "VehicleStatus" FROM "intrastate_gateout_info" WHERE 1
  protected $table = 'silotomill_gateout_info';
  protected $primaryKey = 'Id';
  protected $allowedFields = [
    "addedBy","ReceivingBin","FirstWeight","SecondWeight","NetWeight", "modifiedBy", "receivingArrivalId", "emptyVehicleArrivalId", "stmDispatchId", "vehicleStatus"  
  ];

  public function addOrUpdate($req){
   // var_dump($req);exit();
    $this->db->transStart(); 
    $qry = $this->db->query("select id from $this->table where receivingArrivalId=$req->receivingArrivalId");
    $res = $qry->getFirstRow();
    $mdl = new VehicleArrivalModel();
    
    if($res){   
      unset($req->ReceivingBin);
      $res = $this->update($res->id, $req);
    }
    else{



      $res = $this->insert($req);
    }
    $mdl->updateStatus($req->receivingArrivalId,$req->vehicleStatus);
    $eMdl = new EmptyVehicleArrivalModel();
    $eMdl->updateStatus($req->emptyVehicleArrivalId, StatusConstant::$COMPLETED);

    /*if(isset($req->wbTicketNumber)){
      $mdl = new SiloWbModel();
     $mdl->updateUsedTicket($req->wbTicketNumber);
    }*/
    $this->db->transComplete();
    if ($this->db->transStatus() === FALSE)
    {
        return false;
    }
  }
}