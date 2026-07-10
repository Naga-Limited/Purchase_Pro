<?php

namespace App\Models\MarketData;

use CodeIgniter\Model;

class MasterModel extends Model
{
  public function getDeliveryAt()
  {
    $builder = $this->db->query("select id as value, Name as label from master_mrc_delivery_at order by name");
    return  $builder->getResultArray();
  }

  public function getLoadingLocation()
  {
    $builder = $this->db->query("select id as value, Description as label, state, city from master_mrc_loading_location order by Description");
    return  $builder->getResultArray();
  }

  public function getFromLocation()
  {
    $builder = $this->db->query("SELECT id as value,city, state, description as label,description, InsBy, InsDt, ModBy, ModDt, RecStatus FROM master_from_location WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getToLocation()
  {
    $builder = $this->db->query("SELECT id as value, location,concat(location,' - ',plantId) as label,location, plantId, InsBy, InsDt, ModBy, ModDt, RecStatus FROM master_to_location WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }


  public function getModeOfTransport()
  {
    $builder = $this->db->query("select id as value, Name as label from master_mrc_mode_of_transport  order by name");
    return  $builder->getResultArray();
  }

  public function getSuppliers()
  {
    $builder = $this->db->query("select id as value, Name as label, category from master_mrc_supplier order by name");
    return  $builder->getResultArray();
  }

  public function getSupplierCategory()
  {
    $builder = $this->db->query("select distinct category as value, category as label from master_mrc_supplier order by category");
    return  $builder->getResultArray();
  }

  public function getWheatVariety()
  {
    //$builder = $this->db->query("select distinct id as value, WheatVariety as label from master_mrc_wheat_variety order by WheatVariety");
    $builder = $this->db->query("select wheat_variety_Id as value, WheatVariety as label from wheat_variety_master order by WheatVariety");
    return  $builder->getResultArray();
  }
  public function getPlants()
  {
    $builder = $this->db->query("SELECT `ID`, WERKS as value,PLANT_NAME as label,`WERKS`, `PLANT_NAME`, `WH_CODE`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `master_plant` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }

  public function getWheatVarietyState()
  {
    $builder = $this->db->query("select distinct State as value, State as label from master_mrc_wheat_variety order by State");
    return  $builder->getResultArray();
  }

  public function getWheatVarietyZone()
  {
    $builder = $this->db->query("select distinct Zone as value, Zone as label from master_mrc_wheat_variety order by zone");
    return  $builder->getResultArray();
  }
  public function getWheatVarietyCity()
  {
    $builder = $this->db->query("select distinct City as value, City as label from master_mrc_wheat_variety order by city");
    return  $builder->getResultArray();
  }
  public function getWheatVarietySeed()
  {
    $builder = $this->db->query("select distinct SeedVariety as value, SeedVariety as label from master_mrc_wheat_variety order by SeedVariety");
    return  $builder->getResultArray();
  }
  public function getwarehouses()
  {
    $builder = $this->db->query("select WH_CODE as value, concat(WH_CODE,'-', WH_NAME) as label from warehouse_master order by WH_NAME");
    return  $builder->getResultArray();
  }
  public function getmasterplant()
  {
    $builder = $this->db->query("select ID as PLANT_ID, WERKS as value, concat(WERKS,'-',PLANT_NAME) as label from master_plant order by WERKS, PLANT_NAME");
    return  $builder->getResultArray();
  }

  public function getmasterplantvalueId()
  {
    $builder = $this->db->query("select ID as value, concat(WERKS,'-',PLANT_NAME) as label, WERKS, PLANT_NAME from master_plant order by WERKS, PLANT_NAME");
    return  $builder->getResultArray();
  }

  public function getuserinfo()
  {
    $builder = $this->db->query("select UI_ID as value, LOGIN_ID as label from user_info order by LOGIN_ID");
    return  $builder->getResultArray();
  }

  public function getprivilege()
  {
    $builder = $this->db->query("select ID as value, PRIVILEGE_NAME as label from master_privilege order by PRIVILEGE_NAME");
    return  $builder->getResultArray();
  }

  public function getscreenname()
  {
    $builder = $this->db->query("select ID as value, SCREEN_NAME as label from master_screen order by SCREEN_NAME");
    return  $builder->getResultArray();
  }
  public function getscreenname_DESC()
  {
    $builder = $this->db->query("select ID as value, SCREEN_DESC as label from master_screen order by SCREEN_NAME");
    return  $builder->getResultArray();
  }

  public function getrolename()
  {
    $builder = $this->db->query("select RM_REFID as value, ROLE_NAME as label from master_role order by ROLE_NAME");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG1()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G1' order by label");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG2()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G2' order by label");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG3()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G3' order by label");
    return  $builder->getResultArray();
  }
}
