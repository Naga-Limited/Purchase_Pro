<?php 
namespace App\Models;
use CodeIgniter\Model;

class SiloWbModel extends Model
{
   protected $table = 'silo_wb';    
   protected $primaryKey = 'SVoucher_No';
   protected $allowedFields = [ "Is_Used"];
 
  public function updateUsedTicket($ticketNumber){
    $uData = ["Is_Used"=>"1"];
    return $this->db->table($this->table)->where("Voucher_No",$ticketNumber)->update($uData);
  }
  public function getTicketNo() {
    $fetchsql = "select Voucher_No as value, Voucher_No as label, First_Weight as firstWeight, Second_Weight as secondWeight, Net_Weight as netWeight from $this->table where Is_Used=0 and Voucher_No is not null order by Voucher_No";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  //SELECT Voucher_No as value, Voucher_No as label, First_Weight, Second_Weight, Net_Weight FROM silo_wb WHERE
}