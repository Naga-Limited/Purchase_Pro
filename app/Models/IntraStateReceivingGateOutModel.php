<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
use App\Helpers\AppHelperFn;
class IntraStateReceivingGateOutModel extends Model
{ 
  //SELECT "Id", "DateAdded", "DateModified", "AddedBy", "ModifiedBy", "EmptyVehicleArrivalId", "IasDispatchId", "UnloadedLotNo", "UnLoadingVendorId", "UnLoadingVendor", "VehicleStatus" FROM "intrastate_gateout_info" WHERE 1
  protected $table = 'intrastate_gateout_info';
  protected $primaryKey = 'Id';
  protected $allowedFields = [
    "addedBy", "modifiedBy", "receivingArrivalId", "emptyVehicleArrivalId", "iasDispatchId", "unloadedLotNo", "unLoadingVendorId", "unLoadingVendor", "unloadingChargePerTon", "wbType", "wbName", "wbSerialNumber", "wbTicketNumber", "wbEmptyWt", "wbNetWt","wbLoadWt", "gunnyWt", "gunnyLessNetWt", "BagType","BagType2","BagType3","no_bags","no_bags2","no_bags3", "nagaOutsideWBCopy","WBCopy", "vehicleStatus"  
  ];

  public function addOrUpdate($req){

    $this->db->transStart(); 
    $qry = $this->db->query("select id from $this->table where receivingArrivalId=$req->receivingArrivalId");
    $res = $qry->getFirstRow();

    include_once APIPATH. "/db_connection.php";  
    $isOwn =AppHelperFn::isOwnWbFromVehArriv($connect,$req->receivingArrivalId);
   
  //  echo "isOwn:".$isOwn;
  //  echo $req->vehicleStatus; exit();

    if($isOwn==1 && $req->vehicleStatus==5){
          $req->vehicleStatus=24;
    }
   
    $mdl = new VehicleArrivalModel();
    if($res){      
      $res = $this->update($res->id, $req);
    }else{ 
      $res = $this->insert($req);
    }
    
    //var_dump($req); exit();

    $mdl->updateStatus($req->receivingArrivalId,$req->vehicleStatus);
    if($req->vehicleStatus == 12){
    $eMdl = new EmptyVehicleArrivalModel();
    $eMdl->updateStatus($req->emptyVehicleArrivalId, StatusConstant::$COMPLETED);
    }
    if(isset($req->wbTicketNumber)){
      $mdl = new SiloWbModel();
     $mdl->updateUsedTicket($req->wbTicketNumber);
    }
    $this->db->transComplete();
    if ($this->db->transStatus() === FALSE)
    {
        return false;
    }
  }
}
