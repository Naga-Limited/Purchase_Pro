<?php

namespace App\Models;

use CodeIgniter\Model;

$db = \Config\Database::connect();
class canteentokeenmodel extends Model
{
  public function getshifts()
  {
    $builder = $this->db->query(" SELECT  id as value,definitionsName as label  FROM definitions_list WHERE definitionsId =7");
    return $builder->getResultArray();
  }

  public function getcanteentookenById($id)
  {
    $fetchsql = "SELECT ct.*, d_l.definitionsName 
                     FROM `canteen_token` ct
                     JOIN `definitions_list` d_l ON ct.shift =  d_l.id
                     WHERE ct.`status` = '1' AND ct.ct_id = '$id'";

    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }
  public function insertCanteenToken($postData, $unique_no)
  {
    $value = array(
      "ct_unique_number" => $unique_no,
      "shift" => $postData->Shift,
      "token_count" => $postData->canteentokencount,
      "remarks" => $postData->remarks,
      "created_by" => $postData->created_by,
      "status" => 1,

    );
    // print_r($value);
    // exit;

    $this->db->table('canteen_token')->set($value)->insert();
    $InsID = $this->insertID();
    return $InsID;
  }
  public function getLastCourierTicNo()
  {
    $builder = $this->db->table("canteen_token");
    $builder = $builder->select("canteen_token.ct_id,canteen_token.ct_unique_number");
    $builder = $builder->orderBy('canteen_token.ct_id', 'DESC')
      ->limit(1)
      ->get()
      ->getResultArray();

    return $builder;
  }
  public function getGateid($id)
  {
    $builder =  $this->db->table("user_info");
    $builder = $builder->select("master_gate.gateCode");
    $builder = $builder->join('master_gate', 'user_info.masterGateId = master_gate.id', 'inner');
    $builder = $builder->where("user_info.UI_ID", $id);
    return  $builder->distinct()->get()->getResultArray();
  }
  public function getcantentokendetail($date = null)
  {
    $builder = $this->db->table("canteen_token");
    $builder->select("canteen_token.ct_id, canteen_token.ct_unique_number, canteen_token.shift, canteen_token.token_count, canteen_token.remarks");
    $builder->where("canteen_token.status = 1");

    if ($date) {
      $builder->where("DATE(canteen_token.created_at) =", $date);
    }

    return $builder->distinct()->get()->getResultArray();
  }

  public function updateCanteenToken($postData)
  {
    $value = array(
      "shift" => $postData->Shift,
      "token_count" => $postData->canteentokencount,
      "remarks" => $postData->remarks,
      "updated_by" => $postData->updated_by,
    );
    $this->db->table('canteen_token')->set($value)->where('ct_id', $postData->Id)->update();
    $InsID = $postData->Id;
    return $InsID;
  }
  public function getcantentokendetailbydata($fromDate, $shift)
  {
    $fDate = date("Y-m-d", strtotime($fromDate));
    $fetchsql = "SELECT ct.*, d_l.definitionsName 
                   FROM `canteen_token` ct
                   JOIN `definitions_list` d_l ON ct.shift = d_l.id
                   WHERE ct.`status` = '1' 
                     AND DATE(ct.`created_at`) = '$fDate'
                     AND ct.`shift` = '$shift'";
    $builder = $this->db->query($fetchsql);
    return $builder->getResultArray();
  }

  public function updatestatus($postData)
  {
    $status = 2;
    $status_info = array(
      "status" => $status,
      "approved_by" => $postData->approved_by,
    );

    $this->db->table('canteen_token')->set($status_info)->where('ct_id', $postData->id)->update();
    return $res = 1;
  }
  public function updaterejectstatus($postData)
  {
    $status = 3;
    $status_info = array(
      "status" => $status,
      "rejection_by" => $postData->rejected_by,
      "rejection_remarks" => $postData->remarks,
    );

    $this->db->table('canteen_token')->set($status_info)->where('ct_id', $postData->id)->update();
    return $res = 1;
  }
  public function getTokenByDateAndShift($date, $shift)
  {
      $fDate = date("Y-m-d", strtotime($date));
      
      $builder = $this->db->table('canteen_token');
      $builder->where("DATE_FORMAT(canteen_token.created_at, '%Y-%m-%d') >=", $fDate)
              ->where('canteen_token.shift', $shift);
  
      // Get the count of matching records
      $count = $builder->countAllResults();
  
      return $count; // Return the count of records
  }
  public function getcantentokendetailforreport($postData)
  {
    $fDate = date("Y-m-d", strtotime($postData->fromDate));
    $tDate = date("Y-m-d", strtotime($postData->toDate));
     $fetchsql = "SELECT ct.*, 
                         d_l.definitionsName, 
                         DATE_FORMAT(ct.created_at, '%d-%m-%Y') AS created_at,
                         CASE 
                             WHEN ct.status = 1 THEN 'waiting for approval '
                             WHEN ct.status = 2 THEN 'Approved'
                             WHEN ct.status = 3 THEN 'Rejected'
                         END AS status
                  FROM canteen_token ct
                  JOIN definitions_list d_l ON ct.shift = d_l.id
                  WHERE DATE_FORMAT(ct.created_at, '%Y-%m-%d') >= '$fDate'
                  AND DATE_FORMAT(ct.created_at, '%Y-%m-%d') <= '$tDate' 
                  ORDER BY ct.ct_id";

    $builder = $this->db->query($fetchsql);
    return $builder->getResultArray();
  }
  
}
