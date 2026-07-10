<?php

namespace App\Models;

use CodeIgniter\Model;

class StmiascontrolpanelModel extends Model
{
	public $empty_vehicle_arrival;
	public $control_panel;
	public $pp_setting;


    public function __construct() {
	   	$db      = \Config\Database::connect();
		$this->empty_vehicle_arrival = $db->table('empty_vehicle_arrival'); 
		$this->control_panel = $db->table('ias_stm_control_panel'); 
		$this->pp_setting = $db->table('pp_setting'); 

    }

	public function updateVehicleReject(int $id,$data ) {
		$result=$this->empty_vehicle_arrival->set($data)
						->where('ID', $id)
						->update();
	    return $result;
	}

	public function Control_panel_insert($data,$id ) {

		$array = array(
			'status' => 0,
			'control_id'=>$data['control_id'],
		);

		// print_r($data['control_id']);exit();
		$res=$this->control_panel->where($array)->orderBy('id','DESC')->get();
		$delivery_control = $res->getResultArray();
		$delivery_controls = ($delivery_control[0]['id']);
		$status = ($delivery_control[0]['status']);
		$control_id = ($delivery_control[0]['control_id']);

		$otp = $data['otp'];
		// print_r($control_id);exit();
		if($delivery_controls != '' && $control_id == '1' && $status == '0'){
			$result=$this->control_panel->set('otp',$otp)
						->where('id',$delivery_controls)
						->update();
		}else if($delivery_controls != ''  && $control_id == '2' && $status == '0'){
			$result=$this->control_panel->set('otp',$otp)
						->where('id',$delivery_controls)
						->update();
		}else{
			$arrays = array(
				'status' => 1,
				'control_id'=>$data['control_id'],
			);

			$resu=$this->control_panel->where($arrays)->get();
		     $list = $resu->getResultArray();
			 $delivery_id = ($list[0]['id']);
			 $control = ($list[0]['control_id']);
			// print_r($control);exit();
			if($control == '1') {
				$result=$this->control_panel->set('otp',$otp)
							->where('id', $delivery_id)
							->update();
			}else if($control == '2'){
				$result=$this->control_panel->set('otp',$otp)
							->where('id', $delivery_id)
							->update();
			}else{
				$result=$this->control_panel->insert($data);
			}
		}
	    return $result;
	}
	
	public function Wrong_OTP($veify,$ids,$data) {		
		$resu = $this->control_panel->where($veify)->get();
		$result = $resu->getResultArray();
		// print_r($result);exit();
		$id = $result[0]['id'];
		$control_id = $result[0]['control_id'];
		
		if($id != ''){
		$this->control_panel->set($ids == '2' ? $data : 'status','1')->where('id',$id)->update();
		if($control_id == "1") {
			$res =	$this->pp_setting->set('ias_DeliveryNo_Bypass_Flag', $ids == '1' ? 'YES' : 'NO')->where('id', '1')->update();
		}else if($control_id == "2"){
			$res = $this->pp_setting->set('stm_DeliveryNO_ByPass_Flag', $ids == '1' ? 'YES' : 'NO')->where('id', '1')->update();
		}
		$res = "true";
		}else{
			$res = "false";
		}
	    return $res;
	}

	public function Control_data_get() {
		$res=$this->control_panel->where('status','2')->orderBy('id','DESC')->get();
			$result = $res->getResultArray([0]);
			return $result;
    }

	public function ppsetting_data_get() {
		$res=$this->pp_setting->where('id','1')->get();
			$result = $res->getResultArray();
			return $result;
    }
}
