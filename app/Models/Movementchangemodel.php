<?php

namespace App\Models;

use App\Helpers\SapUrlHelper;
use CodeIgniter\Model;

$db = \Config\Database::connect();
class Movementchangemodel extends Model
{
  public function getallgateinandoutdetail($filters)
  {
    $user_plantid= $filters->user_plantid;
    //print_r($user_plantid);exit;

    if (!empty($user_plantid)) {
        // Convert comma-separated string to array and quote the values
        $user_plantid = explode(",", $user_plantid);
        $user_plantid = array_map(fn($id) => trim($id), $user_plantid); // Trim whitespace
    } else {
        $user_plantid = [];
    }
    
     $movementType = strlen($filters->movementType) > 2 ? [1, 2] : [$filters->movementType];

      
    $builder = $this->db->table("gate_in_out_info");
    // Select fields from gate_in_out_info and master_module
    $builder->select("
          gate_in_out_info.*, 
          master_module.moduleType, master_module.id AS module_id,master_module.sap_call,module_status.statusName,
          waitingAtStatus.statusName as waitingAtStatusName,
          CONCAT(master_plant.WERKS, '-', master_plant.PLANT_NAME) AS PLANT_NAME,
          DATE_FORMAT(gate_in_out_info.createdOn, '%d-%m-%Y') AS createdOn,
          IF(gate_in_out_info.movementType = 1, 'Loading', 
              IF(gate_in_out_info.movementType = 2, 'Unloading', 'Unknown')) AS movementName
      ");

    // Join with the master_module table
    $builder->join("master_module", "master_module.id = gate_in_out_info.moduleType", "inner"); // Adjust join condition as needed
    $builder->join("module_status", "module_status.id = gate_in_out_info.moduleStatusId", "left"); // Adjust join condition as needed
    $builder->join("master_plant", "master_plant.ID = gate_in_out_info.masterPlantId", "inner"); // Adjust join condition as needed
    $builder->join("module_status AS waitingAtStatus", "waitingAtStatus.id = gate_in_out_info.waitingAt", "inner");

    // Apply where conditions
    // $builder->whereIn("gate_in_out_info.moduleStatusId", [1, 2, 3, 6]);
    $builder->whereIn("gate_in_out_info.waitingAt", [1, 2, 3, 4, 5, 15]);
     if (!empty($user_plantid)) {
        $builder->whereIn("master_plant.WERKS", $user_plantid);
    }
    $builder->whereIn("gate_in_out_info.movementType", $movementType);
    $builder->orderBy('gate_in_out_info.id', 'ASC');


    return $builder->distinct()->get()->getResultArray();
  }



  public function movementtype()
  {
    $builder = $this->db->query(" SELECT  id as value,movementType as label  FROM movement_type WHERE isActive =1");
    return $builder->getResultArray();
  }
  public function moduletype($type)
  {
    // print_r($type);exit;
    $builder = $this->db->query(" SELECT  id as value,moduleType as label  FROM master_module WHERE   isActive =1 and movementTypeId = $type");
    return $builder->getResultArray();
  }

  public function saveMovementChange($postdata)
  {
    
    $builder = $this->db->table("gate_in_out_info");
    $builder->select("
    gate_in_out_info.*,master_module.id  AS module_id ,master_module.sap_call,weighment_info.firstWeight,weighment_info.secondWeight,master_plant.WERKS");
    $builder->join("master_module", "master_module.id = gate_in_out_info.moduleType", "inner");
    $builder->join("weighment_info", "weighment_info.gateInOutInfoId =  gate_in_out_info.id", "left");
    $builder->join("master_plant", "master_plant.ID =  gate_in_out_info.masterPlantId", "inner");
    $builder->where("gate_in_out_info.id", $postdata->rowid);
    $getdata = $builder->distinct()->get()->getResultArray();

    $builder = $this->db->table("master_module");
    $builder->select("master_module.id ,master_module.sap_call,master_module.sap_call_name");
    $builder->where("master_module.id", $postdata->moduleType);
    $getmodulesapcall = $builder->distinct()->get()->getResultArray();
    //  print_r($getmodulesapcall);exit;
    $moduleIdsGroup3 = [4, 5, 6, 7, 8, 9, 12, 13, 15, 19, 20, 21, 22, 25, 26,33,34,35,38,43,44];
    $currentDateTime = date("Y-m-d H:i:s");
    $message='';

      if (($getdata[0]['sap_call'] == $getmodulesapcall[0]['sap_call'] ) && ($postdata->waitingId != 7) && ($getdata[0]['waitingAt'] > 2 && ($getdata[0]['module_id'] == 1 || $getdata[0]['module_id'] == 2 || $getdata[0]['module_id'] == 43) || ($getdata[0]['waitingAt'] > 3 && ($getdata[0]['module_id'] == 3 )) || (in_array($getdata[0]['module_id'], $moduleIdsGroup3)))) {
        $sap_data = array(
          "Va_No" => $postdata->vaNumber,
          "transaction_type" => $getmodulesapcall[0]['sap_call_name'],
          "METHOD" => "PUT",
        );


        $urlPath = "zgatepro/zgp_unloading/Gatepro_Fg_Uloading?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));
        if (($res[0]->STATUS) == 0) {
          $dataStatus = false;
          $message = $res[0]->MESSAGE;

          return array($dataStatus, "$message, Please Contact SAP Team");
        } else if (($res[0]->STATUS) > 0) {
          $valuearray = array(
            "va_number" => $postdata->vaNumber,
            "movement_type" => $postdata->movementType,
            'module_type' => $postdata->moduleType,
            'remarks' => $postdata->remarks,
            'updated_by' => $postdata->updated_by,
          );
          // print_r($valuearray);exit;
          $this->db->table('movement_change_details')->set($valuearray)->insert();
          $InsID = $this->insertID();

          $updated_array = array(
            'moduleType' => $postdata->moduleType,
            'vehicleNo' => $postdata->truckno,
            'moduleStatusId' => $postdata->moduleStatusId,
            'waitingAt' => $postdata->waitingId,
            'modifiedBy' => $postdata->updated_by,
          );
          $this->db->table('gate_in_out_info')->set($updated_array)->where('id', $postdata->rowid)->update();
        }
      }
      elseif($getdata[0]['sap_call']==1 && $getmodulesapcall[0]['sap_call']==0 && $postdata->waitingId != 7){
					$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900";
					
					$sap_data = array (
						"transaction_type" =>$getmodulesapcall[0]['sap_call_name'],
						"Va_No" => $postdata->vaNumber,
						"Vehicle_No" => $getdata[0]['vehicleNo'],
						"Gateout_Time" => $currentDateTime,
						"Plant" => $getdata[0]['WERKS']
					);
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
        //   print_r($res);
        // exit;
          if (($res[0]->STATUS) == 0) {
            $dataStatus = false;
            $message = $res[0]->MESSAGE;
  
            return array($dataStatus, "$message, Please Contact SAP Team");
          } else if (($res[0]->STATUS) > 0) {
          $valuearray = array(
            "va_number" => $postdata->vaNumber,
            "movement_type" => $postdata->moduleTypeName,
            'module_type' => $postdata->moduleType,
            'remarks' => $postdata->remarks,
            'updated_by' => $postdata->updated_by,
          );
          // print_r($valuearray);exit;
          $this->db->table('movement_change_details')->set($valuearray)->insert();
          $InsID = $this->insertID();

          $updated_array = array(
            'moduleType' => $postdata->moduleType,
            'vehicleNo' => $postdata->truckno,
            'modifiedBy' => $postdata->updated_by,
            'moduleStatusId' => $postdata->moduleStatusId,
            'waitingAt' => $postdata->waitingId,
          );
          $this->db->table('gate_in_out_info')->set($updated_array)->where('id', $postdata->rowid)->update();
        }

      } elseif($getdata[0]['sap_call']==0 && $getmodulesapcall[0]['sap_call']==1 && $postdata->waitingId != 7){
        $urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";
				$sap_data = array (        
					"va_number" => $getdata[0]['vaNumber'], 
					"truck_number" => $getdata[0]['vehicleNo'],            
					"driver_phone" => $getdata[0]['driverMobileNumber'],
					"plant" => $getdata[0]['WERKS'],
					"type" => $getmodulesapcall[0]['sap_call_name'],
					"gp_no" => "",
					"first_weight" => "",
					"second_weight" => "",
					"net_weight" => "",
					"gatein_time"=> $currentDateTime,
					"gateout_time" => "",
					"remarks" => $postdata->remarks,
					"METHOD" => "POST",
				);							
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
        // print_r($res);
        // exit;
			
        if (($res[0]->STATUS) == 0) {
          $dataStatus = false;
          $message = $res[0]->MESSAGE;

          return array($dataStatus, "$message, Please Contact SAP Team");
        } else if (($res[0]->STATUS) > 0) {
          $valuearray = array(
            "va_number" => $postdata->vaNumber,
            "movement_type" => $postdata->movementType,
            'module_type' => $postdata->moduleType,
            'remarks' => $postdata->remarks,
            'updated_by' => $postdata->updated_by,
          );
          // print_r($valuearray);exit;
          $this->db->table('movement_change_details')->set($valuearray)->insert();
          $InsID = $this->insertID();

          $updated_array = array(
            'moduleType' => $postdata->moduleType,
            'vehicleNo' => $postdata->truckno,
            'modifiedBy' => $postdata->updated_by,
            'moduleStatusId' => $postdata->moduleStatusId,
            'waitingAt' => $postdata->waitingId,
          );
          $this->db->table('gate_in_out_info')->set($updated_array)->where('id', $postdata->rowid)->update();

        }
      }elseif($getdata[0]['sap_call']==0 && $getmodulesapcall[0]['sap_call']==0){
          $valuearray = array(
            "va_number" => $postdata->vaNumber,
            "movement_type" => $postdata->movementType,
            'module_type' => $postdata->moduleType,
            'remarks' => $postdata->remarks,
            'updated_by' => $postdata->updated_by,
          );
          $this->db->table('movement_change_details')->set($valuearray)->insert();
          $InsID = $this->insertID();

          $updated_array = array(
            'moduleType' => $postdata->moduleType,
            'vehicleNo' => $postdata->truckno,
            'modifiedBy' => $postdata->updated_by,
            'moduleStatusId' => $postdata->moduleStatusId,
            'waitingAt' => $postdata->waitingId,
            'securityRejectRemarks' => $postdata->remarks,
          );
          $this->db->table('gate_in_out_info')->set($updated_array)->where('id', $postdata->rowid)->update();
      }else{
        $valuearray = array(
            "va_number" => $postdata->vaNumber,
            "movement_type" => $postdata->movementType,
            'module_type' => $postdata->moduleType,
            'remarks' => $postdata->remarks,
            'updated_by' => $postdata->updated_by,
          );
          $this->db->table('movement_change_details')->set($valuearray)->insert();
          $InsID = $this->insertID();

          $updated_array = array(
            'moduleType' => $postdata->moduleType,
            'vehicleNo' => $postdata->truckno,
            'modifiedBy' => $postdata->updated_by,
            'moduleStatusId' => $postdata->moduleStatusId,
            'waitingAt' => $postdata->waitingId,
            'securityRejectRemarks' => $postdata->remarks,
          );
          $this->db->table('gate_in_out_info')->set($updated_array)->where('id', $postdata->rowid)->update();
        }
      if($message!=''){
        return array($InsID,$message);
      }
      else{
        return $InsID;
      }
  }

  public function getVehicleDetails($filters)
  {
    $vehicleNo= $filters->vehicleNo;
    $userId= $filters->userId;

    $builder = $this->db->table("gate_in_out_info");
    $builder->select("
          gate_in_out_info.*, 
          master_module.moduleType, master_module.id AS module_id,master_module.sap_call,module_status.statusName,
          waitingAtStatus.statusName as waitingAtStatusName,
          CONCAT(master_plant.WERKS, '-', master_plant.PLANT_NAME) AS PLANT_NAME,
          DATE_FORMAT(gate_in_out_info.createdOn, '%d-%m-%Y') AS createdOn,
          IF(gate_in_out_info.movementType = 1, 'Loading', 
              IF(gate_in_out_info.movementType = 2, 'Unloading', 'Unknown')) AS movementName,
              ui.FIRST_NAME,
              lui.FIRST_NAME as Person,
              wui.FIRST_NAME as Weighment,
              ui.MOBILE_NUMBER,
              lui.MOBILE_NUMBER as LIMOBILE_NUMBER,
              wui.MOBILE_NUMBER as WIMOBILE_NUMBER
      ");

    $builder->join("master_module", "master_module.id = gate_in_out_info.moduleType", "inner"); // Adjust join condition as needed
    $builder->join("module_status", "module_status.id = gate_in_out_info.moduleStatusId", "inner"); // Adjust join condition as needed
    $builder->join("master_plant", "master_plant.ID = gate_in_out_info.masterPlantId", "inner"); // Adjust join condition as needed
    $builder->join("module_status AS waitingAtStatus", "waitingAtStatus.id = gate_in_out_info.waitingAt", "inner");
    $builder->join("user_info AS ui", "ui.UI_ID = gate_in_out_info.createdBy", "inner");
    $builder->join("loading_unloading_info AS li", "gate_in_out_info.loadingUnloadingInfoId = li.id", "left");
    $builder->join("user_info AS lui", "li.createdBy = lui.UI_ID", "left");
    $builder->join("weighment_info AS wi", "gate_in_out_info.id = wi.gateInOutInfoId", "left");
    $builder->join("user_info AS wui", "wi.createdBy = wui.UI_ID", "left");

    if ($userId > 1) {
      $builder->whereIn("gate_in_out_info.waitingAt", [1, 2, 3, 4, 5, 6, 12]);
    }
    $builder->where("gate_in_out_info.vehicleNo", $vehicleNo);
    $builder->orderBy('gate_in_out_info.id', 'DESC');
    $builder->limit(1);

    return $builder->distinct()->get()->getResultArray();
  }

  public function getVehicleDetailsLoadUnload($filters)
{
    $vehicleNo = $filters->vehicleNo;
    $userId = $filters->userId;
    
    $builder = $this->db->table("loading_unloading_info");
    $builder->select("
        loading_unloading_info.*, 
        IF(loading_unloading_info.movementTypeId = 1, 'Loading', 
            IF(loading_unloading_info.movementTypeId = 2, 'Unloading', 'Unknown')) AS movementName,
        ui.FIRST_NAME AS contact_person,
        ui.MOBILE_NUMBER AS contact_person_no,
        CONCAT(master_plant.WERKS, '-', master_plant.PLANT_NAME) AS PLANT_NAME,
        IF(loading_unloading_info.statusId = 0, 'Gate In', 'Unknown') AS waitingAtStatusName,
        master_module.moduleType
    ");

    $builder->join("master_module", "master_module.id = loading_unloading_info.moduleTypeId", "inner"); 
    $builder->join("master_plant", "master_plant.ID = loading_unloading_info.masterPlantId", "inner");
    $builder->join("user_info AS ui", "ui.UI_ID = loading_unloading_info.createdBy", "inner");

    $builder->whereIn("loading_unloading_info.statusId", [0]);
    $builder->where("loading_unloading_info.truckNo", $vehicleNo);
    $builder->orderBy('loading_unloading_info.id', 'DESC');
    $builder->limit(1);
    return $builder->distinct()->get()->getResultArray();
}
  public function GetPurchaseInfoData($filters)
  {
    $user_plantid= $filters->user_plantid;
      
      $builder = $this->db->table("purchase_info");
      $builder->select("
        purchase_info.TRUCK_NO AS vehicleNo,
        purchase_info.ZVA_NUMBER AS vaNumber,
        DATE_FORMAT(purchase_info.DateAdded, '%d-%m-%Y') AS createdOn,
        CONCAT(master_plant.WERKS, '-', master_plant.PLANT_NAME) AS PLANT_NAME,
        purchase_info.VEHICLE_TYPE AS moduleType,
        pp_status.StatusName AS waitingAtStatusName,
        CASE 
            WHEN purchase_info.ZPO_NUMBER = 1 THEN 'Loading' 
            ELSE 'Unloading' 
        END AS movementName
    ");
    $builder->join("master_plant", "master_plant.WERKS = purchase_info.WERKS", "inner");
    $builder->join("pp_status", "pp_status.Id = purchase_info.VECHICAL_STATUS", "inner");
    $builder->whereIn("purchase_info.VECHICAL_STATUS", [1, 23]);
    $builder->where("purchase_info.VEHICLE_TYPE", 'Container');

    if (!empty($user_plantid) && is_array($user_plantid)) {
        $builder->whereIn("master_plant.WERKS", $user_plantid);
    }

    $builder->orderBy('purchase_info.PI_REFID', 'DESC');

    return $builder->get()->getResultArray();

  }
}
