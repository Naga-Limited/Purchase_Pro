<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\StmiascontrolpanelModel;

class Stmiascontrolpanel extends BaseApiController
{
	public function index()
	{
		//
	}

	public function STMGateOutReject(){

		$PI_REFID = $this->request->getJSON();

		// print_r($this->request->getJSON());exit();
		$format = date('Y-m-d H:i:s');
		$id = trim($PI_REFID->id);
		// print_r($id);exit();
		if($PI_REFID->VEHICLE_STATUS == '5'){
			$data = array(
				'VEHICLE_STATUS' =>$PI_REFID->VEHICLE_STATUS,
				);
		}else{
           $data = array(
			'VEHICLE_STATUS' =>$PI_REFID->VEHICLE_STATUS,
			'STMRejectedByName' =>$PI_REFID->STMRejectedByName,
			'STMRejectedBy' =>$PI_REFID->STMRejectedBy,
			'STMRejectedDt'=>$format,
			'RejectionStatus' =>$PI_REFID->RejectionStatus,
			'IsUpdated' =>'0',
			);
	    }
		$wrong_entry_model = new StmiascontrolpanelModel();
		
		$wrong_entry_model->updateVehicleReject($id, $data);
    }

	public function Control_panel_insert(){

		$PI_REFID = $this->request->getJSON();
	
		$formats = date('Y-m-d H:i:s');
		
		$otp = rand(1000,9999);
		$usermobile = $PI_REFID->Mobile;
		$userName = 'Sir/Mam';

		if($PI_REFID->control_list == '1'){
			$control_list_id = "IAS";
		}else if($PI_REFID->control_list == '2'){
			$control_list_id = "STM";
		}

		if($PI_REFID->status_list == '1'){
			$status_list = "Active";
		}else if($PI_REFID->status_list == '2'){
			$status_list = "In Active";
		}

		// $model = new StmiascontrolpanelModel();
		// if($PI_REFID->control_list && $model->isVehicleClearOldEntries($PI_REFID->control_list)){
		// 	return $this->sendErrorResult("Dupligate Entry...");
		// }

	if($usermobile) {

		// $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
		$message="Dear ".$userName.", ".$otp." is OTP for ".$control_list_id." Delivery No - ".$status_list."  OTP valid for 10 Mins. Do not share this OTP with anyone Naga Limited";
		$msg=urlencode($message);
		// print_r($msg);exit();
		$sender='NAGACO';

		$headers = array('Content-Type: application/json; charset=utf-8');
		$url =("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=".$msg."&senderid=".$sender."&accusage=1&entityid=1201159186592875505&tempid=1207168318998965850&unicode=1&mobile=".$usermobile);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$curlresponse=curl_exec($ch);
		// print_r(curl_setopt($ch, CURLOPT_RETURNTRANSFER, true));exit();
		// curl_close($ch);

		// if($PI_REFID->id == '1') {
		$data = array(
			'control_id' =>$PI_REFID->control_list,
			'mobile_numbers'=>$PI_REFID->Mobile,
			'created_by'=>$PI_REFID->created_by,
			'created_at'=>$formats,
			'otp'=>$otp,
		);
	}

		$id =	$PI_REFID->status_list;

		$process_cancel = new StmiascontrolpanelModel();
			
		$res = $process_cancel->Control_panel_insert($data,$id);
	
		return  $this->respond(["success" => 1, "results" => $res , "OTP" => $curlresponse]);      
	
	}
	public function OTP_Verify(){
		
		$PI_REFID = $this->request->getJSON();
		$formats = date('Y-m-d H:i:s');
				$veify = array(
					'control_id' =>$PI_REFID->control_list,
					'mobile_numbers'=>$PI_REFID->Mobile,
					'OTP'=>$PI_REFID->OTP,
				);
				$data = array(
					'updated_by' =>$PI_REFID->created_by,
					'updated_at'=>$formats,
					'status'=>2,
				);
			$id =	$PI_REFID->status_list;
		
			$process_cancel = new StmiascontrolpanelModel();
			$res = $process_cancel->Wrong_OTP($veify,$id,$data);
		
			return  $this->respond(["success" => 1, "results" => $res]);      
		
	}
	public function Control_data_get() {
    $model = new StmiascontrolpanelModel();
	$res = $model->Control_data_get();
	$setting = $model->ppsetting_data_get();
	return  $this->respond(["success" => 1, "results" => $res,"setting" => $setting ]);      
    }
}
