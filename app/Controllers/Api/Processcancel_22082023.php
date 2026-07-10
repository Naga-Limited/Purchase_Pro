<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ProcesscancelModel;

class Processcancel extends BaseApiController
{
	public function WHPlanChange(){

		$PI_REFID = $this->request->getJSON();

		$formats = date('Y-m-d H:i:s');

			$id = $PI_REFID->id;
			if($PI_REFID->VECHICAL_STATUS == '33'){
				$data = array(
					'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}else if($PI_REFID->VECHICAL_STATUS == '34'){
				$data = array(
					'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}else{
				$data = array(
					'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'CHANGE_VECHICAL_STATUS' =>$PI_REFID->OLD_VECHICAL_STATUS,
					'PlanRejectedBy' =>$PI_REFID->PlanRejectedBy,
					'PlanRejectedDt' =>$formats,
					'PlanRejectedByName'=>$PI_REFID->PlanRejectedByName,
					'WHInchargeRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
            }
			

		$process_cancel = new ProcesscancelModel();
		
		$res = $process_cancel->updateVehicleReject($id, $data);

		return  $this->respond(["success" => 1, "results" => $res]);      

	}

	public function WHPlanChangeEmpty(){

		$PI_REFID = $this->request->getJSON();

		$formats = date('Y-m-d H:i:s');

			$id = $PI_REFID->id;
			if($PI_REFID->VECHICAL_STATUS == '33'){
				$data = array(
					'VEHICLE_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}else if($PI_REFID->VECHICAL_STATUS == '34'){
				$data = array(
					'VEHICLE_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}else{
				$data = array(
					'VEHICLE_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'CHANGE_VECHICAL_STATUS' =>$PI_REFID->OLD_VECHICAL_STATUS,
					'PlanRejectedBy' =>$PI_REFID->PlanRejectedBy,
					'PlanRejectedDt' =>$formats,
					'PlanRejectedByName'=>$PI_REFID->PlanRejectedByName,
					'WHInchargeRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}

		$process_cancel = new ProcesscancelModel();
		
		$res = $process_cancel->updateVehicleRejectEmpty($id, $data);

		return  $this->respond(["success" => 1, "results" => $res]);      

	}

	public function WHRejectEmpty(){

		$PI_REFID = $this->request->getJSON();

		$formats = date('Y-m-d H:i:s');

			$id = $PI_REFID->id;
			
			if($PI_REFID->VECHICAL_STATUS == '32') {
				$data = array(
					'VEHICLE_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}else{
				$data = array(
					'VEHICLE_STATUS' =>$PI_REFID->VECHICAL_STATUS,
					'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
				);
			}

		$process_cancel = new ProcesscancelModel();
		
		$res = $process_cancel->updateVehicleRejectEmpty($id, $data);

		return  $this->respond(["success" => 1, "results" => $res]);      

	}
	public function WHReject(){

    $PI_REFID = $this->request->getJSON();

    $formats = date('Y-m-d H:i:s');

    $id = $PI_REFID->id;
		if($PI_REFID->VECHICAL_STATUS == '32') {
			$data = array(
				'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
				'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
			);
		}else{
			$data = array(
				'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
				'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
			);
		}

		$process_cancel = new ProcesscancelModel();
		
		$res = $process_cancel->updateVehicleReject($id, $data);

		return  $this->respond(["success" => 1, "results" => $res]);      

	}

	public function Control_panel_insert(){

		$PI_REFID = $this->request->getJSON();
	
		// print_r($PI_REFID);exit();
		$formats = date('Y-m-d H:i:s');
		
		$otp = rand(1000,9999);
		$usermobile = $PI_REFID->Mobile;
		$userName = 'Sir/Mam';
		$TEMP_EXTEND = $PI_REFID->TEMP_EXTEND;

		if($PI_REFID->control_list == '1'){
			$control_list_id = "SDI";
		}else if($PI_REFID->control_list == '2'){
			$control_list_id = "IAS";
		}else if($PI_REFID->control_list == '3'){
			$control_list_id = "STM";
		}else if($PI_REFID->control_list == '4'){
			$control_list_id = "IRS";
		}else if($PI_REFID->control_list == '5'){
			$control_list_id = "RELOTTING";
		}

		$model = new ProcesscancelModel();
		if($PI_REFID->control_list && $model->isVehicleClearOldEntries($PI_REFID->control_list)){
			return $this->sendErrorResult("Dupligate Entry...");
		}

		if($usermobile) {

			// $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
			$message="Dear ".$userName.", ".$otp." is OTP for ".$control_list_id." Entry ".$TEMP_EXTEND." day OTP valid for 10 Mins. Do not share this OTP with anyone Naga Limited";
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
					'delivery_control_id' =>$PI_REFID->control_list,
					'temp_extended_days'=>$PI_REFID->TEMP_EXTEND,
					'remarks'=>$PI_REFID->Remarks,
					'mobile_numbers'=>$PI_REFID->Mobile,
					'status'=>'1',
					'created_by'=>$PI_REFID->created_by,
					'created_at'=>$formats,
					'otp'=>$otp,
				);
			// }else if($PI_REFID->id == '2'){
			// 	$data = array(
			// 		'delivery_control_id' =>$PI_REFID->control_list,
			// 		'otp'=>$otp,
			// 	);
			// }
		}
			// print_r($curlresponse);exit();
			// print_r($data);exit();
		$id =	$PI_REFID->id;
		$process_cancel = new ProcesscancelModel();
			
		$res = $process_cancel->Control_panel_insert($data,$id);
	
		return  $this->respond(["success" => 1, "results" => $res , "OTP" => $curlresponse]);      
	
	}

	public function OTP_Verify(){
		
	$PI_REFID = $this->request->getJSON();

	$formats = date('Y-m-d H:i:s');

	

			$veify = array(
				'delivery_control_id' =>$PI_REFID->control_list,
				'mobile_numbers'=>$PI_REFID->Mobile,
				'OTP'=>$PI_REFID->OTP,
			);
			$data = array(
				'status'=>'2',
				'updated_by'=>$PI_REFID->updated_by,
				'updated_at'=>$formats,
			);
		$process_cancel = new ProcesscancelModel();
	
		$res = $process_cancel->Wrong_OTP($veify,$data);
	
		return  $this->respond(["success" => 1, "results" => $res]);      
	
	}

	public function Delivery_Panel_Cron_Job(){
		
	
		$formats = date('Y-m-d H:i:s');
				$data = array(
					'status'=>'3',
				);
			$process_cancel = new ProcesscancelModel();
		
			$res = $process_cancel->Delivery_Panel_Cron_Job($data);
		
			return  $this->respond(["success" => 1, "results" => $res]);      
		
		}
    
		public function WHPlanChangeRelotting(){

			$PI_REFID = $this->request->getJSON();
	
			$formats = date('Y-m-d H:i:s');
	
				$id = $PI_REFID->id;
				if($PI_REFID->VECHICAL_STATUS == '6'){
					$data = array(
						'RelotStatus' =>$PI_REFID->VECHICAL_STATUS,
						'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
						'ModDt'=>$formats
					);
				}else if($PI_REFID->VECHICAL_STATUS == '7'){
					$data = array(
						'RelotStatus' =>$PI_REFID->VECHICAL_STATUS,
						'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
						'ModDt'=>$formats
					);
				}else{
					$data = array(
						'RelotStatus' =>$PI_REFID->VECHICAL_STATUS,
						'Change_Status' =>$PI_REFID->OLD_VECHICAL_STATUS,
						'PlanRejectedBy' =>$PI_REFID->PlanRejectedBy,
						'PlanRejectedDt' =>$formats,
						'WHInchargeRemarks'=>$PI_REFID->WHInchargeRemarks,
						'ModDt'=>$formats
					);
				}
	
			$process_cancel = new ProcesscancelModel();
			
			$res = $process_cancel->updateVehicleRejectRelotting($id, $data);
	
			return  $this->respond(["success" => 1, "results" => $res]);      
	
		}
		public function WHRejectRelotting(){

			$PI_REFID = $this->request->getJSON();
		
			$formats = date('Y-m-d H:i:s');
		
			$id = $PI_REFID->id;
				if($PI_REFID->VECHICAL_STATUS == '6') {
					$data = array(
						'RelotStatus' =>$PI_REFID->VECHICAL_STATUS,
						'AccManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
						'ModDt'=>$formats
					);
				}else{
					$data = array(
						'RelotStatus' =>$PI_REFID->VECHICAL_STATUS,
						'WHManagerRemarks'=>$PI_REFID->WHInchargeRemarks,
						'ModDt'=>$formats
					);
				}
		
				$process_cancel = new ProcesscancelModel();
				
				$res = $process_cancel->updateVehicleRejectRelotting($id, $data);
		
				return  $this->respond(["success" => 1, "results" => $res]);      
		
			}
}
