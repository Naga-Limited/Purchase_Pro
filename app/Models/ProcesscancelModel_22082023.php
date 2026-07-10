<?php

namespace App\Models;

use CodeIgniter\Model;

class ProcesscancelModel extends Model
{
	public $purchase_info;
	public $empty_vehicle_arrival;
	public $control_panel;
	public $ngw_relot;


    public function __construct() {
	   	$db      = \Config\Database::connect();
		$this->purchase_info = $db->table('purchase_info'); 
		$this->empty_vehicle_arrival = $db->table('empty_vehicle_arrival'); 
		$this->control_panel = $db->table('delivery_control_panel'); 
		$this->ngw_relot = $db->table('ngw_relot'); 
    }

	public function updateVehicleReject(int $id,$data ) {
		$result = $this->purchase_info->set($data)
						  ->where('PI_REFID', $id)
						  ->update();
		return $result;
    }

	public function updateVehicleRejectEmpty(int $id,$data ) {
		$result=$this->empty_vehicle_arrival->set($data)
						->where('ID', $id)
						->update();
	    return $result;
	}
	public function updateVehicleRejectRelotting(int $id,$data ) {
		$result=$this->ngw_relot->set($data)
						->where('RelotId', $id)
						->update();
	    return $result;
	}
	public function Control_panel_insert($data,$id ) {
		//  print_r($data["delivery_control_id"]);exit();
		$delivery_control_id = $data["delivery_control_id"];
		$otp = $data["otp"];
		$mobile_number = $data["mobile_number"];
		$remarks = $data["remarks"];
		$temp_extended_days = $data["temp_extended_days"];


		$array = array(
			'delivery_control_id' => $delivery_control_id,
			'status' => 1,
		);
		
		// print_r($array);exit();
		if($delivery_control_id) {
			$result=$this->control_panel
						->where($array)
						->orderBy('id','DESC')
						->get();
		}

		$delivery_control = $result->getResultArray();

		$delivery_controls = ($delivery_control[0]['id']);

		// print_r($delivery_controls);exit();
		if($delivery_controls != ''){
			$res=$this->control_panel->set($data)
						->where('id',$delivery_controls)
						->update();
		}else{
          $res=$this->control_panel->insert($data);
        }

	    return $res;
	}

	public function Wrong_OTP($veify,$data) {		
		$res = $this->control_panel->where($veify)->get();
		$result = $res->getResultArray();
		$id = $result[0]['id'];

		$TEMP_EXTEND= $result[0]['temp_extended_days'];
		$StartDate  = date('Y-m-d H:i:s', strtotime("$TEMP_EXTEND days"));

		$datas = array(
			'updated_at' =>$StartDate,
			'status'=>'2',
		);
		if($id != ''){
			$res = $this->control_panel->set($datas)->where('id',$id)->update();
		}else{
			$res = "false";
		}
	    return $res;
	}

	public function Delivery_Panel_Cron_Job($data) {
			
		// $veify = sda
		$formats = date('Y-m-d H:i:s');

		$res = $this->control_panel->where("status='2' and updated_at <= '".$formats."'")->get();
		$result = $res->getResultArray();
		
		// print_r($result);exit();
		
		$id = $result[0]['id'];

			$res = $this->control_panel->set('status','3')->where('id',$id)->update();
		
	    return $res;
	}

	function isVehicleClearOldEntries ($record){
		$result = $this->control_panel->where('delivery_control_id',$record)->where('status','2')->get();
        $res = $result->getResultArray();
		return count($res)>0;
	  }
}
