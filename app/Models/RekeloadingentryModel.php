<?php

namespace App\Models;

use CodeIgniter\Model;

$db      = \Config\Database::connect();
class RekeloadingentryModel extends Model
{
  public function getstatelist()
  { {
      $sql = "SELECT id as value, state_name as label FROM states_master";
      $builder = $this->db->query($sql);
    }
    return $builder->getResultArray();
  }

  public function getraketypelist()
  {
    $builder = $this->db->query(" SELECT  id as value,definitionsName as label  FROM definitions_list WHERE definitionsId =20");
    return $builder->getResultArray();
  }
  public function getunloadingloclist()
  {
    $builder = $this->db->query(" SELECT  id as value,definitionsName as label  FROM definitions_list WHERE definitionsId =21");
    return $builder->getResultArray();
  }

  public function getcountfnrnumber($fnrNumber)
  {

    $builder = $this->db->table('rake_loading_entry_');
    $builder->where("rake_loading_entry_.fnr_number =", $fnrNumber);

    // Get the count of matching records
    $count = $builder->countAllResults();

    return $count; // Return the count of records
  }
 public function getcountstate_name($state_name)
  {

    $builder = $this->db->table('states_master');
    $builder->where("states_master.state_name =", $state_name);  
    $builder->where("states_master.is_active =", 1);

    // Get the count of matching records
    $count = $builder->countAllResults();

    return $count; // Return the count of records
  }

  public function getcountvehicletype($VehicleType,$plantcode)
  {

    $builder = $this->db->table('delay_reason_master_fg');
    $builder->where("delay_reason_master_fg.vehicle_type =", $VehicleType);
    $builder->where("delay_reason_master_fg.plantcode =", $plantcode);
    $builder->where("delay_reason_master_fg.is_active =", 1);

    // Get the count of matching records
    $count = $builder->countAllResults();

    return $count; // Return the count of records
  }

  public function submitLoadingDetails($postData)
  {
    // print_r($postData);exit;
    $value = array(
      "loading_date" => $postData->loadingDate,
      "eda_date" => $postData->expectedArrivalDate,
      "rr_number" => $postData->rrNumber,
      "po_number" => $postData->ponumber,
      "fnr_number" => $postData->fnrNumber,
      "rake_type" => $postData->vehicleType,
      "loading_location" => $postData->loadingLocation,
      "status" => 1,
      "loading_state" => $postData->loadingState,
      "unloading_location" => $postData->unloadingLocation,
      "created_by" => $postData->created_by,

    );
    // print_r($value);exit;
    $this->db->table('rake_loading_entry_')->set($value)->insert();
    $InsID = $this->insertID();
    return $InsID;
  }

  public function getrakeentrydetails($fromDate, $toDate)
  {
    $fDate = date("Y-m-d", strtotime($fromDate));
    $tDate = date("Y-m-d", strtotime($toDate));

    // Get the current date
    $currentDate = date("Y-m-d");

    // Build the query
    $builder = $this->db->table("rake_loading_entry_ rle");

    // Select all columns and calculate is_today
    $builder->select("
        rle.*, 
        d1.definitionsName as vehicleTypeName, 
        states_master.state_name ,  
        d3.definitionsName as unloadinglocation, 
        DATE_FORMAT(rle.loading_date,'%d-%m-%Y') as loading_dates, 
        DATE_FORMAT(rle.eda_date,'%d-%m-%Y') as edadates, 
        CASE 
            WHEN DATE_FORMAT(rle.created_at, '%Y-%m-%d') = '$currentDate' THEN 1 
            ELSE 0 
        END as is_today
    ");

    // Join with the definitions_list table
    $builder->join('definitions_list d1', 'd1.id = rle.rake_type', 'inner');
    $builder->join('states_master ', 'states_master.id = rle.loading_state', 'inner');
    $builder->join('definitions_list d3', 'd3.id = rle.unloading_location', 'inner');
    $builder->where("rle.status", 1);
    // Add date filters
    $builder->where("DATE_FORMAT(rle.created_at,'%Y-%m-%d') >=", $fDate);
    $builder->where("DATE_FORMAT(rle.created_at,'%Y-%m-%d') <=", $tDate);

    // Execute and return results
    $result = $builder->distinct()->get()->getResultArray();
    // print_r($result);exit;
    return $result;
  }

  public function updatestautsforloadingsate($postData)
  {
    $status = 2;
    $status_info = array(
      "is_active" => $status,
      "updated_by" => $postData->created_by,
    );
    // print_r($status_info);exit;
    $this->db->table('states_master')->set($status_info)->where('id', $postData->Id)->update();
    $res = 1;
    return $res;
  }
  public function rejectEntry($postData)
  {
    $status = 2;
    $status_info = array(
      "status" => $status,
      "updated_by" => $postData->created_by,
    );
    // print_r($status_info);exit;
    $this->db->table('rake_loading_entry_')->set($status_info)->where('id', $postData->id)->update();
    $res = 1;
    return $res;
  }
  public function recivieddateupdate($postData)
  {
    $currentDate = date('Y.m.d');
    //print_r($currentDate);exit;
    $status_info = array(
      "received_date" => $currentDate,
      "updated_by" => $postData->created_by,
    );
    // print_r($status_info);exit;
    $this->db->table('rake_loading_entry_')->set($status_info)->where('id', $postData->id)->update();
    $res = 1;
    return $res;
  }

  public function getloadingstatedetails()
  {
    $builder = $this->db->table("states_master");
    $builder = $builder->select("states_master.*");
    $builder = $builder->where("states_master.is_active", 1);
    return  $builder->distinct()->get()->getResultArray();
  }
  public function Insertstatedetails($postData)
  {
    $value = array(
      "country" => $postData->country_name,
      "state_name" => $postData->state_name,
      "is_active" => 1,
      "created_by" => $postData->created_by,

    );
    // print_r($value);exit;

    $this->db->table('states_master')->set($value)->insert();
    $InsID = $this->insertID();
    return $InsID;
  }

  public function getvehicletypelist()
  {
    $builder = $this->db->query(" SELECT  id as value,definitionsName as label  FROM definitions_list WHERE definitionsId =22");
    return $builder->getResultArray();
  }

  public function Insertdelayreasontimedetails($postData, $VehicleType)
  {
    $value = array(
      "vehicle_type" => $VehicleType,
      "gate_out_hour" => $postData->gateout_time,
      "delay_reason_time" => $postData->delay_reason_time,
      "is_active" => 1,
      "plantcode" => $postData->plantcode,
      "created_by" => $postData->created_by,

    );
    // print_r($value);exit;

    $this->db->table('delay_reason_master_fg')->set($value)->insert();
    $InsID = $this->insertID();
    return $InsID;
  }
  public function getdelayreasontimedetails()
  {
    $builder = $this->db->table("delay_reason_master_fg");
    $builder = $builder->select("delay_reason_master_fg.*,master_plant.WERKS");
    $builder = $builder->join('master_plant', 'delay_reason_master_fg.plantcode = master_plant.ID', 'inner');
    $builder = $builder->where("delay_reason_master_fg.is_active", 1);
    return  $builder->distinct()->get()->getResultArray();
  }

  public function updatestautsfordelayreasontime($postData)
  {
    $status = 2;
    $status_info = array(
      "is_active" => $status,
      "updated_by" => $postData->created_by,
    );
    // print_r($status_info);exit;
    $this->db->table('delay_reason_master_fg')->set($status_info)->where('id', $postData->Id)->update();
    $res = 1;
    return $res;
  }

  public function getDelayReasons()
  {
    $builder = $this->db->query(" SELECT  id as value,delay_reason as label  FROM delay_reason WHERE is_active =1");
    return $builder->getResultArray();
  }

  public function getplantcode()
  {

    $builder = $this->db->table("master_plant");
    $builder = $builder->select("ID as value,concat(WERKS,'-',PLANT_NAME) as label");
    $builder = $builder->where("master_plant.plant_subdivision", 0);
    $builder = $builder->where("master_plant.RecStatus", 1);
    return  $builder->distinct()->get()->getResultArray();
  }
}
