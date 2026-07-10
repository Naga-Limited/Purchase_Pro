<?php 
namespace App\Models;
use CodeIgniter\Model;

class PlantModel extends Model
{
  public function getPlantIdsByUserId($userId){
    $builder =  $this->db->query("select PLANT_CODE from view_user_plant where USER_ID =$userId");
    $res = $builder->getResultArray();
    return array_column($res, "PLANT_CODE");
  }
  public function hasPlant($userId){
    $builder = $this->db->table("view_user_plant")->selectCount("PLANT_CODE", "totalCount");
    $builder =   $builder->where("USER_ID", $userId);    ;
    return  $builder->get()->getFirstRow()->totalCount>0;
  }
  public function getAllPlants($userId=null){
    $builder = $this->db->table("view_user_plant");
    $builder = $builder->select("PLANT_CODE as value, PLANT_NAME as label, PLANT_ID as id");
    if(isset($userId)){
      $builder =  $builder->where("USER_ID", $userId);
    }
    return  $builder->distinct()->orderBy("PLANT_NAME")->get()->getResultArray();
  }

  public function getAllPlants_SILO($userId=null){
  
    $builder = $this->db->table("view_user_plant");
    $builder = $builder->select("PLANT_CODE as value, PLANT_NAME as label, PLANT_ID as id");
    $builder =  $builder->where("PLANT_CODE", "1111");
    if(isset($userId)){
     
      $builder =  $builder->where("USER_ID", $userId);
    }
    return  $builder->distinct()->orderBy("PLANT_NAME")->get()->getResultArray();
  }
}