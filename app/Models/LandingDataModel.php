<?php

namespace App\Models;

use App\Helpers\SapUrlHelper;
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
		$builder = $builder->select("gate_in_out_info.id as ID,gate_in_out_info.vehicleNo as TRUCK_NO, gate_in_out_info.moduleType as moduleTypeId,  master_module.moduleType AS SCREEN_TYPE, gate_in_out_info.createdOn as DateAdded,gate_in_out_info.modifiedOn as stm_LoadDt,gate_in_out_info.modifiedOn as stm_QCDt,gate_in_out_info.modifiedOn as FirstWeightEntryDt,gate_in_out_info.modifiedOn as SecondWeightEntryDt,gate_in_out_info.modifiedOn as GATE_OUT_TM,gate_in_out_info.vaNumber as ZVA_NUMBER,gate_in_out_info.masterPlantId as PLANT_ID,master_plant.PLANT_NAME, 0 as RejectionStatus, gate_in_out_info.moduleStatusId as VEHICLE_STATUS, gate_in_out_info.waitingAt, module_status.statusName as StatusName,gate_in_out_info.movementType, gate_in_out_info.isRedirect, gate_in_out_info.redirectMasterPlantId, weighment_info.secondWeight");
		$builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('module_status', 'module_status.id = gate_in_out_info.waitingAt', 'inner');
            $builder = $builder->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner');
            $builder = $builder->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left');
		$builder =  $builder->where("gate_in_out_info.moduleStatusId in($moduleStatusId) AND (gate_in_out_info.subModuleTypeId NOT IN (11,15,28,29) OR gate_in_out_info.subModuleTypeId IS NULL) AND gate_in_out_info.moduleType IN (SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userGateId) AND (gate_in_out_info.movementType = 1 OR gate_in_out_info.moduleType = 1)
            AND gate_in_out_info.masterPlantId IN (SELECT m.PLANT_ID FROM master_user_plant m WHERE m.USER_ID = $userGateId)");
		//$builder =  $builder->where("userGateId",$gateId[0]['masterGateId']);

		return $builder->distinct()->groupBy("gate_in_out_info.id")->get()->getResultArray();
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
		$builder = $builder->select("gate_in_out_info.id as ID,gate_in_out_info.vehicleNo as TRUCK_NO,gate_in_out_info.moduleType as moduleTypeId,master_module.moduleType as SCREEN_TYPE, gate_in_out_info.createdOn as DateAdded,gate_in_out_info.modifiedOn as SecondWeightEntryDt,gate_in_out_info.modifiedOn as UnloadWHSubmitDt,gate_in_out_info.masterPlantId as PLANT_ID,master_plant.PLANT_NAME,gate_in_out_info.moduleStatusId as VEHICLE_STATUS,gate_in_out_info.waitingAt, module_status.statusName as StatusName,gate_in_out_info.returnRefNo,gate_in_out_info.movementType, gate_in_out_info.isRedirect, gate_in_out_info.redirectMasterPlantId, weighment_info.secondWeight");
		$builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left');
            $builder = $builder->join('module_status', 'module_status.id = gate_in_out_info.waitingAt', 'inner');
            $builder = $builder->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner');
		$builder =  $builder->where("gate_in_out_info.moduleStatusId in($moduleStatusId) AND gate_in_out_info.movementType = 2 AND gate_in_out_info.moduleType != 16 AND gate_in_out_info.moduleType IN (SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userGateId) AND gate_in_out_info.moduleType != 1 AND gate_in_out_info.masterPlantId IN (SELECT m.PLANT_ID FROM master_user_plant m WHERE m.USER_ID = $userGateId) OR (gate_in_out_info.subModuleTypeId IN (2,4,8,14,18) and gate_in_out_info.moduleStatusId in($moduleStatusId) AND gate_in_out_info.masterPlantId IN (SELECT m.PLANT_ID FROM master_user_plant m WHERE m.USER_ID = $userGateId))");
            
		return  $builder->distinct()->groupBy("gate_in_out_info.id")->get()->getResultArray();
      }

      public function Gate_info_Status_Change($id,$Data){
		
            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->set($Data);
            $builder =  $builder->where("id",$id);
            return  $builder->update();
      }
       public function Gate_info_Status($id,$Data,$invoiceNumber){
		

            $builder1 = $this->db->table("gate_in_out_info");
            $builder1 =  $builder1->set("salesInvoiceNo",$invoiceNumber);
            $builder1 =  $builder1->where("id",$id);
            $builder1 =  $builder1->where("waitingAt in (15)");
            $builder1->update();
            
            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->set($Data);
            $builder =  $builder->where("id",$id);
            $builder =  $builder->where("waitingAt in (4,5)");
            return  $builder->update();   
      }
      public function Gate_info_details_insert($gate_in_out_info_id,$Data){
	
            $count = $this->db->table("gate_in_out_info_details d")
            ->join('gate_in_out_info g', 'g.id = d.gateInOutInfoId', 'inner')
            ->where('d.deliveryNumber', $Data['deliveryNumber'])
            ->where('d.isManual !=', 2)
            ->where('g.moduleStatusId !=', 7)
            ->countAllResults();
            
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
            $builder =  $builder->select("gate_in_out_info.*,master_gate.OwnWB,master_plant.PLANT_NAME as plantName,weighment_info.*,gate_in_out_info.masterColorTokenId, master_color_token.colorToken, master_reject_reason.rejectReason, weighment_info.id as weighmentInfoId,delay_reason.delay_reason,gate_in_out_info.id as gateInOutInfoId");
            $builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
            $builder = $builder->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left');
            $builder = $builder->join('master_color_token', 'master_color_token.id = gate_in_out_info.masterColorTokenId', 'left');
            $builder = $builder->join('master_gate', 'master_gate.id = gate_in_out_info.userGateId', 'inner');
            $builder = $builder->join('master_reject_reason', 'master_reject_reason.id = gate_in_out_info.rejectReasonId', 'left');
            $builder = $builder->join('delay_reason', 'delay_reason.id = gate_in_out_info.delay_reason_id', 'left');
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

      public function updateFgSalesReturnDetails($fgSalesReturnInfoId){
            $builder = $this->db->table("fg_sales_return_info");
            $builder =  $builder->set(["moduleStatusId" => 1]);
            $builder =  $builder->where("id",$fgSalesReturnInfoId);
            return  $builder->update();
      }

      public function updateMigoNumberByDelivery($resultRow) {             
            $sql = "CALL spUpdMigoNumber(?, ?)";		
            $builder = $this->db->query($sql, [$resultRow->DELIVERY_NO, $resultRow->MIGO_NO]);
            $queryResult = $builder->getResultArray();
      }

      public function return_delivery_details($Data){

            $count = $this->db->table("return_delivery_details")->where(['deliveryNumber =' => $Data['deliveryNumber']])->countAllResults();
            if($count == 0) {
                  $builder = $this->db->table("return_delivery_details");
                  $builder =  $builder->set($Data);
                  return  $builder->insert();
            }else if($count > 0){
                  $datas = array (
                    "deliveryQty"=> $Data['deliveryQty'],
                    "PgiCompletion"=> $Data['PgiCompletion'],
                  );
                  $builder = $this->db->table("return_delivery_details");
                  $builder =  $builder->set($datas);
                  $builder =  $builder->where("deliveryNumber",$Data['deliveryNumber']);
                  return  $builder->update();  
            }
      }      

      public function gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails, $loadingUnloadingInfoId=null){            
    
            foreach($GatepassDeliveryDetails as $resultRow){ 

                  $sql = "CALL spInsGatePassDeliveryInfo(?, ?, ?, ?, ?, ?, ?, ?)";		
                  $builder = $this->db->query($sql, [$gateInOutInfoId, $loadingUnloadingInfoId, $resultRow->GATEPASS_NO, $resultRow->GATEPASS_TYPE, $resultRow->FROM_PLANT, $resultRow->VENDOR_PLANT, $resultRow->VENDOR_PLANT_NAME, $resultRow->RECEIPT_NO ]);
                  $queryResult = $builder->getResultArray();
                  $gatepassDeliveryInfoId = (int)$queryResult[0]['lastInsertId'];

                  if($gatepassDeliveryInfoId > 0){

                        foreach($resultRow->SAP_LINE as $sapLine){

                              $Sql1 = "SELECT vendorCode, werks FROM vendor_plant  WHERE vendorCode = '$resultRow->VENDOR_PLANT'";
                              $builder1 = $this->db->query($Sql1);	    
                              $result1 =  $builder1->getResultArray();
                              
                              if(count($result1) > 0){
                                    $plantCode = $result1[0]['werks'];
                              }else{
                                    $plantCode = $sapLine->REC_PLANT;
                              }

                              $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = '$plantCode'";
                              
                              $builder =  $this->db->query($fetchsql);
                              $queryResult1 = $builder->getResultArray();
                              $masterPlantId = (int)$queryResult1[0]['ID'];	
      
                              $runQuery.= "('$gatepassDeliveryInfoId', '".$sapLine->LINE_ITEM."', '".addslashes($sapLine->MATERIAL)."', '".$sapLine->UOM."', '".$sapLine->QTY."', '".$masterPlantId."', '".$sapLine->HSNCODE."', '".$sapLine->VALUE."', 0, NOW()),";
                        } 
                  }                                 
            }  
            $sql = "INSERT INTO gatepass_delivery_info_details(gatepassDeliveryInfoId, lineItem, material, uom, quantity, toMasterPlantId, hsnCode, value, moduleStatusId, dateStamp) VALUES ".rtrim($runQuery, ",")."";

            $query2 = $this->db->query($sql);
            
            $dataStatus = true;
            $message = "Delivery Completed Successfully";

            return array($dataStatus, $message);
      }

      public function PurchaseReturn_DocumentVerify($gateInOutInfoId, $purchaseReturnDetails){
            
            foreach($purchaseReturnDetails as $resultRow){

                  $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = '$resultRow->PLANT';";
                  $builder =  $this->db->query($fetchsql);
                  $plantId = $builder->getResultArray();
                  $masterPlantId = $plantId[0]['ID'];	

                  $runQuery.= "('$gateInOutInfoId', '".$resultRow->MIGO_NO."', '$masterPlantId', '".$resultRow->VENDOR_NO."', '".$resultRow->VENDOR_NAME."', '".json_encode($resultRow->LINE_ITEM)."', NOW()),";
            }           
            $sql = "INSERT INTO purchase_return_delivery_details(gateInOutInfoId, migoNo, masterPlantId, vendorNumber, vendorName, lineItem, dateStamp) VALUES ".rtrim($runQuery, ",")."";

            $query = $this->db->query($sql);
            
            $dataStatus = true;
            $message = "Delivery Completed Successfully";

            return array($dataStatus, $message);
      }    
      
      public function addGateInOutHistory($json){ 

            $sql = "CALL spInsGateInOutHistory(?, ?, ?, ?)";		
            $builder = $this->db->query($sql, [$json->gateInOutInfoId ? $json->gateInOutInfoId : $json->gateInInfoId, 4, null, $json->userInfoId ? $json->userInfoId : '']);
            $queryResult = $builder->getResultArray();
      }

      public function updateTripsheetOrShipment($gateInOutInfoId, $tripsheetNo, $shipmentNo){
            $builder = $this->db->table("gate_in_out_info");
            $builder =  $builder->set(["tripSheetNumber" => $tripsheetNo, "shipmentOrderNo" => $shipmentNo]);
            $builder =  $builder->where("id",$gateInOutInfoId);
            return  $builder->update();
      }

      public function Gate_info_insert($Data){
	
            $count = $this->db->table("gate_in_out_info_details")->where(['invoiceNumber =' => $Data['invoiceNumber']])->countAllResults();
            if($count == 0) {
                  $builder = $this->db->table("gate_in_out_info_details");
                  $builder =  $builder->set($Data);
                  return  $builder->insert();
            }else if($count > 0){
                  $datas = array (
                    "invoiceNumber"=> $Data['invoiceNumber'],
                    "PgiCompletion"=> $Data['PgiCompletion'],
                  );
                  $builder = $this->db->table("gate_in_out_info");
                  $builder =  $builder->set($datas);
                  $builder =  $builder->where("invoiceNumber",$Data['invoiceNumber']);
                  return  $builder->update();  
            }
      }

      public function UserPlantCheck($plant_code, $user_id) {
            $builder = $this->db->table("master_user_plant");
            $builder->select("master_user_plant.ID");
            $builder->join('master_plant', "master_plant.ID = master_user_plant.PLANT_ID", 'inner');
            $builder->where("master_user_plant.USER_ID", $user_id);
            $builder->where("master_plant.WERKS", $plant_code);
            
            return $builder->countAllResults();
      }

      public function salesMaterialDetailsInsert($gate_in_out_info_id,$Data){
	
            $count = $this->db->table("sales_material_info")->where(['deliveryNo =' => $Data['deliveryNo'],'lineItem'=>$Data['lineItem']])->countAllResults();
            if($count == 0) {
                  $builder = $this->db->table("sales_material_info");
                  $builder =  $builder->set($Data);
                  return  $builder->insert();
            }else if($count > 0){
                  $datas = array (
                        "deliveryQty"=> $Data['deliveryQty'],
                        "materialQty"=> $Data['materialQty'],
                        "material" => $Data['material'],
				"material_description" => $Data['material_description'],
                        "materialUOM"=>$Data['materialUOM'],
                        "bagCount"=> $Data['bagCount'],
                        'updated_by'=> $Data['created_by'],
                        'bagType'=>$Data['bagType']
                  );
                  $builder = $this->db->table("sales_material_info");
                  $builder =  $builder->set($datas);
                  $builder =  $builder->where("deliveryNo",$Data['deliveryNo']);
                  // $builder =  $builder->where("material",$Data['material']);
                  $builder =  $builder->where("lineItem",$Data['lineItem']);

                  return  $builder->update();  
            }
      }

      public function FGSaleMaterialDetailsGet($id) {
            $builder = $this->db->table("sales_material_info");
            $builder->select("sales_material_info.*");
            $builder->join('gate_in_out_info_details', "gate_in_out_info_details.deliveryNumber = sales_material_info.deliveryNo", 'inner');
            $builder->where("sales_material_info.gateInOutInfoId", $id);
            $builder->where("sales_material_info.status", 1);
            $builder->where("gate_in_out_info_details.isManual", 0);
            $builder->groupBy("sales_material_info.id")->distinct();
            return $builder->get()->getResultArray();
      }

      public function FGSaleMaterialDelete($id, $user_id) {
            $builder = $this->db->table('sales_material_info');
            return $builder->where('id', $id)
                           ->update(['status' => 0, 'updated_by' => $user_id]);
      }
      public function PoDetailsFetch($loadingUnloadingInfoId){
            $builder = $this->db->table("purchase_order");
            $builder->select("purchase_order.poNumber");
            $builder->where("purchase_order.isDelete", 0);
            $builder->where("purchase_order.loadingUnloadingInfoId", $loadingUnloadingInfoId);
            $builder->groupBy("purchase_order.id")->distinct();
            $builder = $builder->get()->getResultArray();
            $PO_NO = $builder[0]['poNumber'];
            $urlPath ="zgatepro/zss_po_detail/Gatepro?sap-client=900&&PO_Number=$PO_NO";
            $data = SapUrlHelper::getWhDatas($urlPath);
            $result = json_decode($data, true); 
            return $result;
      }
      public function DeliveryGenerate($data){
            $CurrentDateTime=date("Ymd");
            $sap_data_array = [];  
            foreach ($data->purchaseOrderDetails[0]->LINE_ITEM as $resultRow) {
                  $sap_data_array[] = [
                      "line_item"         => "1", 
                      "purchase_order_no" => $data->purchaseOrderDetails[0]->PO_NUMBER ?? '',
                      "item_no"           => $resultRow->ITEM_NO ?? '',
                      "material"          => $resultRow->MATERIAL ?? '',
                      "plant"             => $resultRow->PLANT ?? '',
                      "stge_loc"          => $resultRow->STO_LOCATION ?? '',
                      "quantity"          => $data->deliveryWeight ?? '',
                      "unit_of_measure"   => $resultRow->UOM ?? 0,  
                  ]; 
            }
            $sap_data = [
                  "due_date"=>$CurrentDateTime,
                  "va_number"=>$data->vaNumber,
                  "item"=>$sap_data_array,
                  "shiping_point"=>$data->purchaseOrderDetails[0]->FROMPLANT,
                  "shiping_stge_loc"=>'HO01'
            ]; 
            $urlPath ="zgatepro/zzgp_delivery/delivery?sap-client=900";

            $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
            $message = $res[0]->MESSAGE;
            $STATUS = $res[0]->STATUS;
            $DOCUMENT_NO = $res[0]->DELIVERY ?? '';
            if (!isset($STATUS)) {
              return [0, "$message, Please contact the SAP Team."];
            }elseif ($STATUS > 0) {
                        $this->db->transBegin();
                        $poUpdate = $this->db->table("purchase_order")
                        ->set([
                              'deliverNo'      => $DOCUMENT_NO,
                              'deliveryQty' => $data->deliveryWeight
                          ])
                        ->where('loadingUnloadingInfoId', $data->loadingUnloadingInfoId)
                        ->update();
                  // If gate_in_out_info update was successful, update purchase_order
                  if ($poUpdate) {
                        $gateUpdate = $this->db->table("gate_in_out_info")
                        ->set([
                            'moduleStatusId' => 4,
                            'waitingAt'      => 5
                        ])
                        ->where('loadingUnloadingInfoId', $data->loadingUnloadingInfoId)
                        ->update();
          
                      if ($gateUpdate) {
                          $this->db->transCommit();
                          return [1, "Delivery successfully generated. Document No: $DOCUMENT_NO"];
                      } else {
                          $this->db->transRollback();
                          return [0, "Failed to update purchase_order table."];
                      }
          
                  } else {
                      $this->db->transRollback();
                      return [0, "Failed to update gate_in_out_info table."];
                  }
          
              } else {
                  return [0, "SAP Error: $message"];
              }
      }

      public function UpdateMigo($data){
            $CurrentDateTime=date("Ymd");
            $CurrentDateTime1=date("Y-m-d H:i:s");

            $loadingUnloadingInfoId = $data->loadingUnloadingInfoId;
            $builder = $this->db->table("purchase_order");
            $builder->select("purchase_order.deliverNo,purchase_order.poNumber,gate_in_out_info.vaNumber,gate_in_out_info.vehicleNo");
            $builder->join('gate_in_out_info', "gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId", 'inner');
            $builder->where("purchase_order.isDelete", 0);
            $builder->where("purchase_order.loadingUnloadingInfoId", $loadingUnloadingInfoId);
            $builder->groupBy("purchase_order.id")->distinct();
            $builder = $builder->get()->getResultArray();
            $deliverNo = $builder[0]['deliverNo'];
            $vaNumber = $builder[0]['vaNumber'];
            $vehicleNo = $builder[0]['vehicleNo'];
            $poNumber = $builder[0]['poNumber'];
            
            $sap_data = [
                  "va_number"=>$vaNumber,
                  "delivery"=>$deliverNo,
                  "Truck"=>$vehicleNo,
                  "po_no"=>$poNumber,
                  "METHOD"=>'PUT',
            ]; 

            $urlPath ="zgatepro/zzgp_delivery/delivery?sap-client=900";
            $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
            $message = $res[0]->MESSAGE;
            $STATUS = $res[0]->STATUS;
            $DOCUMENT_NO = $res[0]->MIGO ?? '';
            if (!isset($STATUS)) {
              return [0, "$message, Please contact the SAP Team."];
            }elseif ($STATUS > 0) {
                  $this->db->transBegin();
                  $poUpdate = $this->db->table("purchase_order")
                      ->set('migoNumber', $DOCUMENT_NO)
                      ->where('loadingUnloadingInfoId', $loadingUnloadingInfoId)
                      ->update();
                  // If gate_in_out_info update was successful, update purchase_order
                  if ($poUpdate) {
                        $gateUpdate = $this->db->table("gate_in_out_info")
                        ->set([
                            'moduleStatusId' => 5,
                            'waitingAt'      => 8,
                            'recGateOutDateStamp'=>$CurrentDateTime1,
                            'pickSlipCopy'=>$data->pickSlipCopy	
                        ])
                        ->where('loadingUnloadingInfoId', $data->loadingUnloadingInfoId)
                        ->update();
          
                      if ($gateUpdate) {
                          $this->db->transCommit();
                          return [1, "MIGO successfully generated. MIGO No: $DOCUMENT_NO"];
                      } else {
                          $this->db->transRollback();
                          return [0, "Failed to update."];
                      }
          
                  } else {
                      $this->db->transRollback();
                      return [0, "Failed to update."];
                  }
          
              } else {
                  return [0, "SAP Error: $message"];
              }
      }
}
