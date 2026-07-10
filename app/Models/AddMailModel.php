<?php 
namespace App\Models;
use CodeIgniter\Model;

class AddMailModel extends Model
{
  public function getMailDetails(){
    $builder =  $this->db->query("select * from gate_entry_pending_automail");
    $res = $builder->getResultArray();
    return $res;
  }
  public function insertAutoMail($Data) {
    $builder = $this->db->table("gate_entry_pending_automail");
    $builder->set($Data);
    $builder->insert();
    return $this->db->insertID();
  }
  public function updateMailDetails($Data, $id) {
    $builder = $this->db->table('gate_entry_pending_automail');
    $builder->set($Data)->where('id', $id);
    $updated = $builder->update();

    return $updated; // Returns true on success or false on failure
  }

  public function DeactivateUserScreenAccess($id, $status) {
    $builder = $this->db->table('master_user_screen');
    $builder->set('RecStatus',$status)->where('ID', $id);
    $updated = $builder->update();
    return $updated; // Returns true on success or false on failure
  }

  public function getUnmanWBMasterDetails(){
    $builder =  $this->db->query("select * from unmanwb_master");
    $res = $builder->getResultArray();
    return $res;
  }
  public function insertUnmanWBMaster($Data) {
    $builder = $this->db->table("unmanwb_master");
    $builder->set($Data);
    $builder->insert();
    return $this->db->insertID();
  }
  public function updateUnmanWBMaster($Data, $id) {
    $builder = $this->db->table('unmanwb_master');
    $builder->set($Data)->where('id', $id);
    $updated = $builder->update();

    return $updated; // Returns true on success or false on failure
  }

}