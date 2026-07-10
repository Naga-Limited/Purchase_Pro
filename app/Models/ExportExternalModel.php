<?php 
namespace App\Models;
use CodeIgniter\Model;

class ExportExternalModel extends Model
{
  public function getVehicle($va){
    $allowed = [1121,8003,8103,1111,8001,8101,1120,8002,8102,1115,8008,8108,1135,8119];
    $builder =  $this->db->query("SELECT
    ZVA_NUMBER as ZvaNumber, WERKS as PlantId, TRUCK_NO as VehicleNo
    FROM purchase_info
    WHERE  ZVA_NUMBER LIKE '%$va%' AND  SCREEN_TYPE = 'IAS' AND VECHICAL_STATUS = '4' AND WERKS IN(".join(",",$allowed).")

    UNION select ZVA_NUMBER as ZvaNumber, PLANT_ID as PlantId, 
    TRUCK_NO as VehicleNo from empty_vehicle_arrival 
    WHERE  ZVA_NUMBER LIKE '%$va%' AND   VEHICLE_STATUS<>12 and SCREEN_TYPE='EVADP' and TRAILER_NO is null or TRAILER_NO=''

    UNION select ZVA_NUMBER as ZvaNumber, PLANT_ID as PlantId, 
    TRAILER_NO as VehicleNo from empty_vehicle_arrival 
    WHERE  ZVA_NUMBER LIKE '%$va%' AND   VEHICLE_STATUS<>12 and SCREEN_TYPE='EVADP' and TRUCK_NO is null or TRUCK_NO=''
    ");
    return  $builder->getResultArray();
  }
}