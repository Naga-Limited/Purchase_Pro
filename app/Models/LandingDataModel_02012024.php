<?php

namespace App\Models;

use CodeIgniter\Model;

class LandingDataModel extends Model
{

	public function Loading_IAS_STM_Data($VEHICLE_STATUS,$plant_id){

		if($plant_id != '') {
            $splitnumber = $plant_id;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) ."'";
            $plants = "empty_vehicle_arrival.PLANT_ID IN ($numbers)";
            }else{
            $plants = 'empty_vehicle_arrival.PLANT_ID NOT IN ("0")';
            }
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("empty_vehicle_arrival.ID,empty_vehicle_arrival.TRUCK_NO,empty_vehicle_arrival.SCREEN_TYPE,empty_vehicle_arrival.DateAdded,empty_vehicle_arrival.stm_LoadDt,empty_vehicle_arrival.stm_QCDt,empty_vehicle_arrival.FirstWeightEntryDt,empty_vehicle_arrival.SecondWeightEntryDt,empty_vehicle_arrival.GATE_OUT_TM,empty_vehicle_arrival.ZVA_NUMBER,empty_vehicle_arrival.PLANT_ID,master_plant.PLANT_NAME,pp_status.StatusName,empty_vehicle_arrival.RejectionStatus, empty_vehicle_arrival.VEHICLE_STATUS");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = empty_vehicle_arrival.PLANT_ID', 'inner');
            $builder = $builder->join('pp_status', 'pp_status.Id = empty_vehicle_arrival.VEHICLE_STATUS', 'inner');
		$builder =  $builder->where("empty_vehicle_arrival.VEHICLE_STATUS in($VEHICLE_STATUS)");
		$builder =  $builder->where($plants);

		return  $builder->get()->getResultArray();
      }

	public function Loading_Gate_info($moduleStatusId,$userGateId){
		

            $builders = $this->db->table("user_info");
            $builders = $builders->select("user_info.masterGateId");
            $builders =  $builders->where("UI_ID",$userGateId);

		$gateId = $builders->get()->getResultArray();

		$builder = $this->db->table("gate_in_out_info");
		$builder = $builder->select("gate_in_out_info.id as ID,gate_in_out_info.vehicleNo as TRUCK_NO, gate_in_out_info.moduleType as moduleTypeId,  master_module.moduleType AS SCREEN_TYPE, gate_in_out_info.createdOn as DateAdded,gate_in_out_info.modifiedOn as stm_LoadDt,gate_in_out_info.modifiedOn as stm_QCDt,gate_in_out_info.modifiedOn as FirstWeightEntryDt,gate_in_out_info.modifiedOn as SecondWeightEntryDt,gate_in_out_info.modifiedOn as GATE_OUT_TM,gate_in_out_info.vaNumber as ZVA_NUMBER,gate_in_out_info.masterPlantId as PLANT_ID,master_plant.PLANT_NAME, 0 as RejectionStatus, gate_in_out_info.moduleStatusId as VEHICLE_STATUS, gate_in_out_info.waitingAt, module_status.statusName as StatusName,gate_in_out_info.movementType");
		$builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('module_status', 'module_status.id = gate_in_out_info.waitingAt', 'inner');
            $builder = $builder->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner');
		$builder =  $builder->where("gate_in_out_info.moduleStatusId in($moduleStatusId) and gate_in_out_info.movementType = 1");
		$builder =  $builder->where("userGateId",$gateId[0]['masterGateId']);

		return  $builder->get()->getResultArray();
      }

      public function UnloadingPurchase($VEHICLE_STATUS,$plant_id){

		if($plant_id != '') {
            $splitnumber = $plant_id;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) ."'";
            $plants = "purchase_info.WERKS IN ($numbers)";
            }else{
            $plants = 'purchase_info.WERKS NOT IN ("0")';
            }
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.TRUCK_NO,purchase_info.SCREEN_TYPE,master_plant.PLANT_NAME,purchase_info.SecondWeightEntryDt,purchase_info.UnloadWHSubmitDt,pp_status.StatusName,purchase_info.VECHICAL_STATUS,purchase_info.PI_REFID,purchase_info.EMPTY_VEHICLE_ARRIVAL_ID,purchase_info.VEHICLE_TYPE,purchase_info.QA_STATUS,purchase_info.INCO1,purchase_info.REDIRECT_LGORT,purchase_info.REDIRECT_WERKS,purchase_info.REDIRECT_PO_LINE_ITEM,purchase_info.PICK_SLIP_NO,purchase_info.UnloadingRedirectGateoutBy");
            $builder = $builder->join('master_plant', 'master_plant.WERKS = purchase_info.WERKS', 'inner');
            $builder = $builder->join('pp_status', 'pp_status.Id = purchase_info.VECHICAL_STATUS', 'inner');
            $builder =  $builder->where("purchase_info.VECHICAL_STATUS in($VEHICLE_STATUS)");
	    $builder =  $builder->where($plants);
	    return  $builder->get()->getResultArray();
      }

      public function Unloading_Gate_info($moduleStatusId,$userGateId){

		$builders = $this->db->table("user_info");
            $builders = $builders->select("user_info.masterGateId");
            $builders =  $builders->where("UI_ID",$userGateId);

		$gateId = $builders->get()->getResultArray();

		$builder = $this->db->table("gate_in_out_info");
		$builder = $builder->select("gate_in_out_info.id as ID,gate_in_out_info.vehicleNo as TRUCK_NO,gate_in_out_info.moduleType as moduleTypeId,master_module.moduleType as SCREEN_TYPE, gate_in_out_info.createdOn as DateAdded,gate_in_out_info.modifiedOn as SecondWeightEntryDt,gate_in_out_info.modifiedOn as UnloadWHSubmitDt,gate_in_out_info.masterPlantId as PLANT_ID,master_plant.PLANT_NAME,gate_in_out_info.moduleStatusId as VEHICLE_STATUS,gate_in_out_info.waitingAt, module_status.statusName as StatusName,gate_in_out_info.returnRefNo,gate_in_out_info.movementType");
		$builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('module_status', 'module_status.id = gate_in_out_info.waitingAt', 'inner');
            $builder = $builder->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner');
		$builder =  $builder->where("gate_in_out_info.moduleStatusId in($moduleStatusId) and gate_in_out_info.movementType = 2");
		$builder =  $builder->where("userGateId",$gateId[0]['masterGateId']);

		return  $builder->get()->getResultArray();
      }

      public function Gate_info_Status_Change($id,$Data){

            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->set($Data);
            $builder =  $builder->where("id",$id);
            return  $builder->update();
      }

      public function Gate_info_details_insert($gate_in_out_info_id,$Data){

            $count = $this->db->table("gate_in_out_info_details")->where(['deliveryNumber =' => $Data['deliveryNumber']])->countAllResults();
            if($count == 0) {
                  $builder = $this->db->table("gate_in_out_info_details");
                  $builder =  $builder->set($Data);
                  return  $builder->insert();
            }else if($count > 0){
                  $datas = array (
                    "deliveryQty"=> $Data['deliveryQty'],
                    "invoiceNumber"=> $Data['invoiceNumber'],
                    "PgiCompletion"=> $Data['PgiCompletion'],
                  );
                  $builder = $this->db->table("gate_in_out_info");
                  $builder =  $builder->set($datas);
                  $builder =  $builder->where("deliveryNumber",$Data['deliveryNumber']);
                  return  $builder->update();  
            }
      }

      public function Gate_info_ByID($id){
            // print_r($id);return;
            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->select("gate_in_out_info.*,master_gate.OwnWB,master_plant.PLANT_NAME as plantName,weighment_info.*,gate_in_out_info.masterColorTokenId, master_color_token.colorToken, master_reject_reason.rejectReason, weighment_info.id as weighmentInfoId");
            $builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left');
            $builder = $builder->join('master_color_token', 'master_color_token.id = gate_in_out_info.masterColorTokenId', 'left');
            $builder = $builder->join('master_gate', 'master_gate.id = gate_in_out_info.userGateId', 'inner');
            $builder = $builder->join('master_reject_reason', 'master_reject_reason.id = gate_in_out_info.rejectReasonId', 'left');
            $builder =  $builder->where("gate_in_out_info.id",$id);
            return  $builder->get()->getResultArray();
      }

      public function WB_Details_Check($plant_code){

            $builder = $this->db->table("master_plant");
            $builder =  $builder->select("ID");
            $builder =  $builder->where("WERKS",$plant_code);
            $builder =  $builder->where("OwnWB",1);
            return  $builder->countAllResults();
      }

      public function PlantByID($plant_code){

            $builder = $this->db->table("master_plant");
            $builder =  $builder->select("ID");
            $builder =  $builder->where("WERKS",$plant_code);
            return  $builder->get()->getResultArray();
      }

      public function Gate_info_sto_details_insert($Data){

            $count = $this->db->table("sto_loading_info")->where(['deliveryNumber =' => $Data['deliveryNumber']])->countAllResults();
            if($count == 0) {
                  $builder = $this->db->table("sto_loading_info");
                  $builder =  $builder->set($Data);
                  return  $builder->insert();
            }else if($count > 0){
                  $datas = array (
                    "deliveryQty"=> $Data['deliveryQty'],
                    "PgiCompletion"=> $Data['PgiCompletion'],
                  );
                  $builder = $this->db->table("sto_loading_info");
                  $builder =  $builder->set($datas);
                  $builder =  $builder->where("deliveryNumber",$Data['deliveryNumber']);
                  return  $builder->update();  
            }
      }

      public function updateMigoNumber($id,$Data){
            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->set($Data);
            $builder =  $builder->where("id",$id);
            return  $builder->update();
      }
}
