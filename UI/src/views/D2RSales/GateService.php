<?php

namespace App\Models\GatePro;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;

class GateService extends Model
{ 
	//Add Gate In Info
	public function addGateInInfo($postData) {  
		$dataStatus = false;
		$data = $message = $sapMessage = $vehicleNo = null;	
		$checkUserPlant = 0;	
		//print_r($postData);exit;
		$sql = "CALL spSelUserPlantId(?)";		
		$builder = $this->db->query($sql, [$postData->userInfoId]);
		$getUserPlantIdResult = $builder->getResultArray();
		$masterPlantId = $getUserPlantIdResult[0]['userPlantId'];
		$userGateId = $getUserPlantIdResult[0]['userGateId'];
		$OwnWB = $getUserPlantIdResult[0]['OwnWB'];
		$plantName = $getUserPlantIdResult[0]['plantName'];
		$salesInvoiceNo=$postData->salesInvoiceNo;			

		$sql = "CALL spSelPurchaseOrderDetails(?, ?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, 0]);
		$getPurchaseOrderDetails = $builder->getResultArray();

		$sql = "CALL spSelLoadingAndUnloadingInfo(?,?,?,?)";		
		$builder = $this->db->query($sql, [0, $postData->loadingUnloadingInfoId, $postData->userInfoId,$postData->movementType == 'LOADING' ? 1 : 2]);
		$getLoadingUnloadingDetails = $builder->getResultArray();		

		if($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Capex' || $postData->moduleType == 'Late Purchase'){

			$builder = $this->db->table("master_plant");
            $builder =  $builder->select("ID");
            $builder =  $builder->where("WERKS",$postData->masterPlantId);
            $getMasterPlant = $builder->get()->getResultArray();			
			$purchaseMasterPlantId = $getMasterPlant[0]['ID'];
			$werks = $postData->masterPlantId;

			if(strlen($werks) == 0 || $werks == 0){
			  $message = "Something went to wrong,please try another one time";
			}
		}else if($getLoadingUnloadingDetails[0]['werks'] != ''){
			$werks = $getLoadingUnloadingDetails[0]['werks'];
		}else{
			$werks = $getUserPlantIdResult[0]['werks'];
		}

		if(($getUserPlantIdResult[0]['isMovement'] == 1) || ($postData->loadingUnloadingInfoId > 0) || ($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Capex' || $postData->subModuleTypeId == 1 || $postData->subModuleTypeId == 3 || $postData->subModuleTypeId == 5 || $postData->subModuleTypeId == 25 || $postData->moduleType == 'Gate pass - Receipt')){

			$sql = "CALL spGenerateVaNumber(?, ?)";		
			$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType]);
			$getVaNumberResult = $builder->getResultArray();
			$getVaNumber = $getVaNumberResult[0]['vaNumber'];						
			$getVaNumber = $postData->vaNumber ? $postData->vaNumber : $getVaNumber;
			$currentDateTime = date("Y-m-d H:i:s");

			if($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Late Purchase' || $postData->moduleType == 'Capex'){
				$masterPlantId = $purchaseMasterPlantId;
			}else if($postData->masterPlantId){
				$masterPlantId = $postData->masterPlantId;
			}else{
				$masterPlantId = $masterPlantId;
			}

			$masterPlantId = $masterPlantId;

			$sql1 = "CALL spGenerateCashNumber(?, ?, ?)";		
			$builder1 = $this->db->query($sql1, [$postData->userInfoId, '', 'handCarry']);
			$getHandCarryNumberResult = $builder1->getResultArray();
			$getHandCarryNumber = $getHandCarryNumberResult[0]['cashNumber'];				
			$vehicleNo=0;
			$vehicle= $postData->vehicleNo == 'BYHAND' ? $getHandCarryNumber : $postData->vehicleNo;
			if($postData->vehicleNo == 'BYHAND'){
			$vehicle= $vehicle == '' ? 'BYHAND' : $getHandCarryNumber ;
			}
			if($postData->vehicleNo == 'TN69BC6166' || $postData->vehicleNo == 'TN69BC6160' || $postData->vehicleNo == 'TN57BM0921'){
				$vehicleNo = 0;
			}else{
				$vehicleNo = 1;
			}
			$postData->moduleType = $postData->moduleType == '' ? $moduleType : $postData->moduleType;
			// print_r($postData);exit;
			$sql = "CALL spCheckVehicleStatus(?, ?, ?, ?)";
			$builder = $this->db->query($sql, [$postData->vehicleNo, $postData->masterPlantId, $postData->movementType, $postData->moduleType]);
			$result = $builder->getResultArray();
			$getExistCount = $result[0]['getExistCount'];
			$getExistplantName = $result[0]['plantName'];			

			if(isset($postData->vehicleNo) && $getExistCount == 0){
				$movementTypeID = $postData->movementType == 'LOADING' ? 1 : 2 ;
				$builder = $this->db->table("gate_in_out_info");
				$builder = $builder->select("CONCAT(master_plant.PLANT_NAME, ' - ', master_plant.WERKS) as WERKS");
				$builder =  $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
				if($movementTypeID == 1){
				$builder->groupStart()
				->where("gate_in_out_info.vehicleNo", $postData->vehicleNo)
				->where("gate_in_out_info.moduleStatusId NOT IN (5, 10, 7)", null, false)
				->groupEnd();
				}else{
				$builder->orGroupStart()
				->where("gate_in_out_info.vehicleNo", $postData->vehicleNo)
				->where("gate_in_out_info.moduleStatusId NOT IN (5, 10, 7)", null, false)
				->where("gate_in_out_info.masterPlantId", $masterPlantId)
				->groupEnd();
				}
				$VehicleAlreadyIn = $builder->get()->getResultArray();	
				$VehicleAlreadyIn = $VehicleAlreadyIn[0]['WERKS'];
				if(!empty($VehicleAlreadyIn)){
					$dataStatus = false;
					$message = "Vehicle Already In - ( $VehicleAlreadyIn )";
					$data = [];
					$vehicle = $postData->vehicleNo;
					return array($dataStatus, $message, $data, $postData->vehicleNo);
				}
				
			}
			
			if($getExistCount == 0){
				//if(($OwnWB == 0 && $postData->movementType == 'Loading') || ($userGateId == 6 && $vehicleNo == 0 && $postData->movementType == 'Loading') && ($postData->vehicleType == 'BULKER' || $postData->vehicleType == 'TRAILER')){
				if($postData->moduleStatusId == 1 || $postData->subModuleTypeId == 1 || $postData->subModuleTypeId == 22 || $postData->subModuleTypeId == 7 || ($postData->moduleStatusId == 6 && ($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Late Purchase' || $postData->moduleType == 'Capex'))){	
					if($getLoadingUnloadingDetails[0]['moduleTypeId'] == 31 && ($getLoadingUnloadingDetails[0]['subModuleTypeId'] == 30 || $getLoadingUnloadingDetails[0]['subModuleTypeId'] == 31)){
						
						if ($postData->vehicleNo && $getLoadingUnloadingDetails[0]['subModuleTypeId'] == 31) {
							$builders = $this->db->table("gate_in_out_info");
            						$builders =  $builders->select("createdOn");
           						$builders =  $builders->where("vehicleNo",$postData->vehicleNo);
            						$last_entry_timestamp = $builders->orderBy('id', 'DESC')
							->limit(1)->get()->getResultArray();			
							$last_entry_timestamp = strtotime($last_entry_timestamp[0]['createdOn']);
							
							if ($last_entry_timestamp && time() - $last_entry_timestamp < 30 * 60) {
								return array($dataStatus = false, $message = 'Vehicle Already Gate in', $data = $last_entry_timestamp);
							}
						}
						
						$data = array(
							'loadingUnloadingInfoId'=>$postData->loadingUnloadingInfoId,
							'userGateId'=>$userGateId,
							'movementType'=>2,
							'moduleType'=>31,
							'vehicleNo'=>$postData->vehicleNo,
							'vaNumber'=>$getVaNumber,
							'driverMobileNumber'=>$postData->driverMobileNumber,
							'route'=>$postData->vanRoute,
							'noOfTarpaulin'=>$postData->labourCount,
							'subModuleTypeId'=>$getLoadingUnloadingDetails[0]['subModuleTypeId'],
							'moduleStatusId'=>$getLoadingUnloadingDetails[0]['subModuleTypeId'] == 30 ? 4 : 5,
							'waitingAt'=>$getLoadingUnloadingDetails[0]['subModuleTypeId'] == 30 ? 5 : 8,
							'createdOn'=>$currentDateTime,
							'createdBy'=>$postData->userInfoId,
							'gateInDateStamp'=>$currentDateTime,
							'gateOutDateStamp'=>$currentDateTime,
							'masterPlantId'=>$postData->masterPlantId,
							'fgSalesReturnInfoId'=>NULL,
							'masterColorTokenId'=>NULL,
							'tripSheetNumber'=>NULL,
							'truckType'=>NULL,
							'clean'=>NULL,
							'oder'=>NULL,
							'tarpaulin'=>NULL,
							'platformCondition'=>NULL,
							'isVehicleFit'=>NULL,
							'previousLoadData'=>NULL,
							'truckCapacity'=>NULL,
							'isWeight'=>NULL,
							);
							$data1 = array(
							 'isGateIn'=>1,
							 'statusId'=>$getLoadingUnloadingDetails[0]['subModuleTypeId'] == 30 ? 1 : 0
							);
							// print_r($data);exit;
							$this->db->table('gate_in_out_info')->set($data)->insert();
							$InsId=$this->insertID();
							$dataStatus = true;	
							$message = "Gate In Success";
							$builder = $this->db->table("loading_unloading_info");
							$builder =  $builder->set($data1);
							$builder =  $builder->where("id",$postData->loadingUnloadingInfoId);
							$builder->update();

							
							$data = $InsId;
						return array($dataStatus, $message, $data);				
				}else if(($OwnWB == 0 && $postData->movementType == 'LOADING' && $postData->moduleType != 'Gate pass') || (($userGateId == 3 || $userGateId == 12) && $postData->vehicleNo == 'TN57BD9879') || ($userGateId == 18 && $postData->vehicleNo == 'TN57AF3136') || $postData->subModuleTypeId == 22){

						$urlPath ="zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";					
						$sap_data = array (
							"ZZTRANSATION_TYPE" => $postData->subModuleTypeId == 22 ? 'Other-Sales' : 'FG-STO',
							"ZZTRUCK_NO" => $postData->subModuleTypeId == 22 ? $getHandCarryNumber : $postData->vehicleNo,
							"ZZVA_NO" => $getVaNumber,
							"ZZDRIVER_PH" => $postData->driverMobileNumber,
							"ZZROUTE" => $postData->route,
							"ZZPLANT" => $postData->subModuleTypeId == 22 ? $postData->werks : $werks,
							"ZZCOLOR" => $postData->masterColorTokenId,
							"ZZREASON" => "",
							"ZZREMARKS" => $postData->remarks,
							"ZZTRIPSHEET_NO" => $postData->subModuleTypeId == 22 ? 'No Tripsheet' : $postData->tripSheetNumber,
							"ZZFirstWeight" => "0",
							"ZZSecondWeight " => "",
							"ZZNetweight" => "",
							"ZZSHIPMENT_NO" => $postData->shipmentOrderNo,
							"ZZGATEIN_TIME" => $currentDateTime,					
							"ZZPO_NO" => "",
							"ZZDELIVERY_NO1" => "",
							"ZZDELIVERY_NO2" => "",
							"ZZREC_PLANT" => "",
							"ZZREC_STORAGE_LOC" => "",
							"ZZLINE"=>1,
						);				
						// print_r($sap_data);exit;
						$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
						
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->subModuleTypeId == 22 ? $getHandCarryNumber : $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);
						}	
					}
					else if(($OwnWB == 0 && $postData->moduleType == 'FG-SALES RETURN') || (($postData->movementType == 'LOADING') && ($postData->moduleType == 'S&S - Return' || $postData->moduleType == 'PM - Return'))){						

						$urlPath ="ZGP_FG_RET/FG_Return?sap-client=900";
						$sap_data = array (        
							"VA_NUMBER" => $getVaNumber,    
							"SCREEN_TYPE" => $postData->moduleType,
							"RETURN_REFERENCE" => $postData->returnRefNo,
							"SALES_INVOICE" => $postData->salesInvoiceNo,
							"CUSTOMER_NAME" => $postData->customerName,
							"TRUCK_NUMBER" => $postData->vehicleNo,
							"PLANT" => $werks,
							"DRIVER_PH" => $postData->driverMobileNumber,
							"WAIT_OUTSIDE" => '',
							"GATE_IN" => $currentDateTime,
							"REMARKS" => $postData->remarks,
							"GATE_OUT" => ""
						);	
						$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
					
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);	
						}	
					}
					else if($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Capex' || $postData->moduleType == 'Late Purchase'){

						$urlPath ="zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";

						if($postData->moduleType == 'S&S Purchase'){
							$moduleType = 'S&S-Purchase';
						}else if($postData->moduleType == 'Sooji Purchase'){
							$moduleType = 'Sooji-Purchase';
						}else if($postData->moduleType == 'RM Purchase'){
							$moduleType = 'RM-Purchase';
						}else if($postData->moduleType == 'Late Purchase'){
							$moduleType = 'Late-Purchase';
						}else if($postData->moduleType == 'Capex'){
							$moduleType = 'Capex';
						}else{
							$moduleType = 'PM-Purchase';
						}
						$sap_data = array (
							"ZZVA_NO" => $getVaNumber,
							"ZZTRUCK_NO" => $vehicle,
							"ZZPLANT" => $werks,
							"ZZTRANSACTION_TYPE" => $moduleType,
							"ZZLOADING_WGT" => "",
							"ZZEMPTY_WGT" => "",
							"ZZNET_WEIGHT" => "",
							"ZZGATEIN_TIME" => $currentDateTime,
							"ZZGATEOUT_TIME" => "",
							"METHOD" => "POST",
							"ZZLINE" => $postData->purchaseOrderDetails ? $postData->purchaseOrderDetails : $getPurchaseOrderDetails
						);					

						$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
				
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $vehicle, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);
						}
					}
					else if($postData->moduleType == 'Scrap / Dust / Gunny / PP - Sales' || $postData->moduleType == 'SCRP & Dust & Gunny'){

						$urlPath ="zgatepro/zgp_scrap_det/Gatepro?sap-client=900";
						$sap_data = array (        
							"va_number" => $getVaNumber,    
							"truck_number" => $postData->vehicleNo,
							"driver_phone" => $postData->driverMobileNumber,
							"plant" => $werks,
							"first_weight" => "",
							"second_weight" => "",
							"net_weight" => "",
							"sales_invoice" => "",
							"customer" => "",
							"gatein_time" => $currentDateTime,
							"remarks" => $postData->remarks,
							"type" => $postData->moduleType == 'Scrap / Dust / Gunny / PP - Sales' ? 'SCRAP' : 'SCRAP-STO',
							"gateout_time" => "",
							"METHOD" => "POST",
							"po_no" => $getPurchaseOrderDetails[0]['ZZPO_NO'],
							"delivery_no" => "",
							"rec_plant" => $getPurchaseOrderDetails[0]['ZZREC_PLANT'],
							"rec_sto" => $getPurchaseOrderDetails[0]['ZZREC_STORAGE_LOC']
						);
						$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
					
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);		
						}	
					}
					else if(($postData->movementType == 'LOADING') && ($postData->moduleType == 'S&S - STO' || $postData->moduleType == 'PM - STO')){
						// print_r('FDBB');exit;
						$purchaseOrderData = [];
						$purchaseOrderArray = $postData->purchaseOrderDetails;
						$j = 1;
						//print_r($purchaseOrderArray);exit;
						if($postData->purchaseOrderDetails != ''){
						foreach($purchaseOrderArray as $resultRow){ 
							$resultRow->line = $j;
							$purchaseOrderData[] = array(
								'ZZLINE' => $resultRow->line,
								'ZZPO_NO' => $resultRow->poNumber,
								'ZZDELIVERY_NO' => '',
								'ZZREC_PLANT' => $resultRow->plantCode,
								'ZZREC_STORAGE_LOC' => $resultRow->storageLocation
							);
							$j++;
						}
					  }
						$urlPath ="zgatepro/zgp_sp_pm/Gatepro?sap-client=900";
						$sap_data = array (        
							"va_number" => $getVaNumber,            
							"type" => $postData->moduleType,            
							"truck_number" => $postData->subModuleTypeId == 7 ? $getHandCarryNumber : $postData->vehicleNo,             
							"driver_phone" => $postData->driverMobileNumber,
							"from_plant" => $werks,
							"Empty_Weight" => "",   
							"Load_Weight" => "",
							"Net_Weight" => "",
							"gatein_time"=>$currentDateTime,
							"METHOD" => "POST",
							"Line_item" => $postData->purchaseOrderDetails ? $purchaseOrderData : $getPurchaseOrderDetails
						);
						//print_r($sap_data);exit;
						$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
					
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->subModuleTypeId == 7 ? $getHandCarryNumber : $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);			
						}	
					}
					else if((($postData->movementType == 'LOADING') && ($postData->moduleType == 'Gate pass' && $postData->subModuleTypeId == 4) || ($postData->moduleType == 'Gate pass - Receipt')) || ($postData->subModuleTypeId == 1) || ($postData->moduleType == 'Diesel')){
						
						if($postData->subModuleTypeId == 1){
							$getModuleType = 'Gatepass_Receipt_HandCarry';
						}else if($postData->moduleType == 'Gate pass - Receipt'){
							$getModuleType = 'Gatepass_Receipt';
						}else if($postData->moduleType == 'Diesel'){
							$getModuleType = 'Diesel';
						}else{
							$getModuleType = 'GATEPASS';
						}

						$urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";
						$sap_data = array (        
							"va_number" => $getVaNumber,            
							"truck_number" => $postData->subModuleTypeId == 1 ? $getHandCarryNumber : $postData->vehicleNo,             
							"driver_phone" => $postData->driverMobileNumber,
							"plant" => $werks,
							"type" => $getModuleType,
							"gp_no" => "",
							"first_weight" => "",
							"second_weight" => "",
							"net_weight" => "",
							"gatein_time" =>$currentDateTime,
							"gateout_time" => "",
							"remarks" => $postData->remarks,
							"METHOD" => "POST",
						);
									//print_r('$sap_data1');exit;
      					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
					
						if(($res[0]->STATUS) == 0){
							$dataStatus = false;
							$message = $res[0]->MESSAGE;

							return array($dataStatus, "$message, Please Contact SAP Team");
						}
						else if(($res[0]->STATUS) > 0){
							$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
							$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->subModuleTypeId == 1 ? $getHandCarryNumber : $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);			
						}	
					}			
					else{
						$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
						$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);
					}
				}
				else{


					$handCarryVehicle = $postData->subModuleTypeId == 5 || $postData->subModuleTypeId == 25 || $postData->subModuleTypeId == 3 || $postData->subModuleTypeId == 7 || $postData->subModuleTypeId == 11 || $postData->subModuleTypeId == 13 || $postData->subModuleTypeId == 15 || $postData->subModuleTypeId == 23 || $postData->subModuleTypeId == 26 || $postData->subModuleTypeId == 27 || $postData->subModuleTypeId == 28 || $postData->subModuleTypeId == 29 || $postData->subModuleTypeId == 17 || $postData->subModuleTypeId == 23;

					$sql = "CALL spInsGateInInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
					$builder = $this->db->query($sql, [$postData->userInfoId, $postData->movementType, $postData->moduleType, $postData->subModuleTypeId, $handCarryVehicle ? $getHandCarryNumber : $postData->vehicleNo, $getVaNumber, $postData->shipmentOrderNo, $postData->driverMobileNumber, $postData->route, $masterPlantId,$postData->masterColorTokenId, $postData->tripSheetNumber, $postData->truckType, $postData->clean, $postData->oder, $postData->tarpaulin , $postData->noOfTarpaulin, $postData->platformCondition, $postData->isVehicleFit, $postData->previousLoadData, $postData->truckCapacity, $postData->vehicleType, $postData->stoPoNo, $postData->deliveryOrderNumber, $postData->returnRefNo, $postData->salesInvoiceNo, $postData->customerName, $postData->moduleStatusId, $postData->remarks, $postData->loadingUnloadingInfoId, $postData->fgSalesReturnInfoId, $postData->isWeight, $postData->isRedirect, $postData->redirectedGateInOutInfoId]);
				}
			}
			$queryResult = $builder->getResultArray();
			$countRow = (int)$queryResult[0]['countRow'];
			$data = (int)$queryResult[0]['lastInsertId'];
			$getExistCount = (int)$queryResult[0]['getExistCount'];
			$vehicle = $vehicle ;
			if($data && ($postData->moduleType == 'S&S Purchase' || $postData->moduleType == 'Sooji Purchase' || $postData->moduleType == 'PM - Purchase' || $postData->moduleType == 'RM Purchase' || $postData->moduleType == 'Capex' || $postData->moduleType == 'Late Purchase' || $postData->moduleType == 'Canteen Material') && $postData->invoiceCopy && $postData->gate_id == 19){
				$this->db->table('gate_in_out_info')->set('invoiceCopy',$postData->invoiceCopy)->where('id ',$data)->update();
			}else if($data && $postData->subModuleTypeId == 1 && $postData->gatePassDocument && ($postData->gate_id == 17 || $postData->gate_id == 18 || $postData->gate_id == 19)){
				$this->db->table('gate_in_out_info')->set('gatePassDocument',$postData->gatePassDocument)->where('id ',$data)->update();
			}
			if($countRow > 0 && $data > 0){
				$dataStatus = true;
				$message = "Gate In Success - VA NO : $getVaNumber";
			}
			else if($getExistCount > 0){
				$message = "Vehicle Already In - $getExistplantName";
			}					
			else{
				$message = "Please contact Admin.";
			}		

		}else{
			$message = "Plant Not Assigned For User. Please Assign Plant";
		}	
					// print_r($data);exit;
				
		return array($dataStatus, $message, $data, $vehicle);
	}

	//Get Gate In Info
	public function getGateInInfo($vehicleNo, $moduleStatusId, $moduleTypeId, $gateInOutInfoId, $userInfoId) {  
		$builder = $this->db->query("CALL spSelGateInInfo('$vehicleNo', '$moduleStatusId', '$moduleTypeId', '$gateInOutInfoId', '$userInfoId')");	
		$result = $builder->getResultArray();	
		return $result;
	}
	// Get Weighment Images
	public function getWeighmentImages($weighmentInfoId) { 
		$builder = $this->db->query("CALL spSelWeighmentImages('$weighmentInfoId')");
		$result = $builder->getResultArray();
		return $result; 
  	} 

	// Get Gate In Out Info Details
	public function getGateInOutInfoDetails($gateInOutInfoId) { 
		$builder = $this->db->query("CALL spSelGateInOutInfoDetails('$gateInOutInfoId')");
		$result = $builder->getResultArray();
		return $result;
  	}

	// Get Gate In Out Info Details
	public function getSapDeliveryDetails($gateInOutInfoId) { 
		$builder = $this->db->query("CALL spSelSapDeliveryDetails('$gateInOutInfoId')");
		$result = $builder->getResultArray();
		return $result;
  	} 

	// Update Vehicle Status
	public function updateVehicleStatus($postData) {  
		$dataStatus = false;
		$data = $message = null;
		$studentDetailsArray = array();

		$sql = "CALL spSelGateInInfo(?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [0, 0, 0, $postData->gateInOutInfoId, $postData->userInfoId]);
		$getData = $builder->getResultArray();
		$moduleTypeId = (int)$getData[0]['moduleTypeId'];
		$subModuleTypeId = (int)$getData[0]['subModuleTypeId'];
		$movementTypeId = (int)$getData[0]['movementTypeId'];
		$moduleStatusId = (int)$getData[0]['moduleStatusId'];
		$isRedirect = (int)$getData[0]['isRedirect'];
		$currentDateTime = date("Y-m-d H:i:s");		
		$stoPoNo = (int)$getData[0]['stoPoNo'];
		
		if(isset($getData[0]['vehicleNo']) && $getData[0]['movementTypeId'] == 2){
			$gate_ID=$getData[0]['gateInOutInfoId'];
			$builder = $this->db->table("gate_in_out_info");
			$builder = $builder->select("CONCAT(master_plant.PLANT_NAME, ' - ', master_plant.WERKS) as WERKS");
			$builder =  $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
			$builder->where("gate_in_out_info.vehicleNo", $getData[0]['vehicleNo'])
			->where("gate_in_out_info.moduleStatusId NOT IN (0 , 5, 10, 7)")
			->where("gate_in_out_info.id NOT IN ('$gate_ID')");
			$VehicleAlreadyIn = $builder->get()->getResultArray();	
			$VehicleAlreadyIn = $VehicleAlreadyIn[0]['WERKS'];

			if(!empty($VehicleAlreadyIn)){
				$dataStatus = false;
				$message = "Vehicle Already In - ( $VehicleAlreadyIn )";
				$data = [];
				return array($dataStatus, $message, $data, $moduleTypeId, $movementTypeId, $subModuleTypeId, $isRedirect,$stoPoNo);			
			}	
		}

		$sql = "CALL spSelSapDeliveryDetails(?)";		
		$builder = $this->db->query($sql, [$postData->gateInOutInfoId]);
		$getDeliveryDetailsData = $builder->getResultArray();
		
		$sql = "CALL spSelPurchaseOrderDetails(?, ?)";		
		$builder = $this->db->query($sql, [$getData[0]['loadingUnloadingInfoId'], $getData[0]['gateInOutInfoId']]);
		$getPurchaseOrderDetails = $builder->getResultArray();

		$getModuleStatusId = $moduleStatusId == 5 ? 5 : $postData->moduleStatusId;		
		$vehicleNo=0;

		if($postData->vehicleNo == 'TN69BC6166' || $postData->vehicleNo == 'TN69BC6160' || $postData->vehicleNo == 'TN57BM0921'){
			$vehicleNo = 0;
		}else{
			$vehicleNo = 1;
		}
		   
		// print_r($getData);exit;
		if(isset($postData->purchaseOrderDetails)){
			$purchaseOrderArray = $postData->purchaseOrderDetails; 
			if(count($purchaseOrderArray) > 0){
			foreach($purchaseOrderArray as $resultRow){ 
			$resultRow->line = $i;
				$poData[] = array(
				'ZZLINE' => $resultRow->line,
				'ZZPO_NO' => $resultRow->poNumber,
				'ZZREC_PLANT' => $resultRow->plantCode,
				'ZZREC_STORAGE_LOC' => $resultRow->storageLocation
				);
			$i++;
			}
		
		
			$arrayData = $poData;  
			$duplicateArray = array();
			foreach($arrayData as $key=>$value){
				if(!empty($duplicateArray) && in_array($value['ZZPO_NO'],$duplicateArray)) unset($arrayData[$key]);
				$duplicateArray[] = $value['ZZPO_NO'];
			}    
		
			$j = 2;
		
			foreach($arrayData as $resultRow){ 
			$resultRow['ZZLINE'] = $j;
			$purchaseOrderFinalData[] = array(
				'ZZLINE' => $resultRow['ZZLINE'],
				'ZZPO_NO' => $resultRow['ZZPO_NO'],
				'ZZREC_PLANT' => $resultRow['ZZREC_PLANT'],
				'ZZREC_STORAGE_LOC' => $resultRow['ZZREC_STORAGE_LOC']
			);
			$j++;
			}
		}}

		$OwnWB = 1;
		if(($getData[0]['waitingAt'] == 1 || $getData[0]['waitingAt'] == 5) && $getData[0]['moduleType'] == 'FG-STO' && $getData[0]['redirectedGateInOutInfoId'] != ''){
		$OwnWB = $this->db->table("master_plant");
		$OwnWB = $OwnWB->select("OwnWB");
		$OwnWB = $OwnWB->where("ID", $getData[0]['masterPlantId']);
		$OwnWB = $OwnWB->get()->getResultArray();
		$OwnWB = $OwnWB[0]['OwnWB'];
		}
		
		if($postData->moduleStatusId == 1){ 

			//if(($getData[0]['OwnWB'] == 0 && $movementTypeId == 1) || ($getData[0]['userGateId'] == 6 && $getData[0]['werks'] == 'FM02' && $movementTypeId == 1 && $postData->vehicleType == 'BULKER' || $postData->vehicleType == 'TRAILER')){
			if((($getData[0]['OwnWB'] == 0 || $OwnWB == 0) && $movementTypeId == 1) || ($getData[0]['userGateId'] == 6 && $vehicleNo == 1 && ($getData[0]['vehicleType'] == 'BULKER' || $getData[0]['vehicleType'] == 'TRAILER'))){	
			
				$urlPath ="zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
				
				$sap_data = array (
					"ZZTRANSATION_TYPE" => $getData[0]['moduleType'],
					"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
					"ZZVA_NO" => $getData[0]['vaNumber'],
					"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
					"ZZROUTE" => $getData[0]['route'],
					"ZZPLANT" => $getData[0]['werks'],
					"ZZCOLOR" => $getData[0]['colorToken'],
					"ZZREASON" => "",
					"ZZREMARKS" => $getData[0]['remarks'],
					"ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'], 
					"ZZFirstWeight" => "",
					"ZZSecondWeight " => "",
					"ZZNetweight" => "",
					"ZZSHIPMENT_NO" => $getData[0]['shipmentOrderNo'],
					"ZZGATEIN_TIME" => $currentDateTime,				
					"ZZPO_NO" => "",
					"ZZDELIVERY_NO1" => "",
					"ZZDELIVERY_NO2" => "",
					"ZZREC_PLANT" => "",
					"ZZREC_STORAGE_LOC" => "",
				);  
			
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);		
				}									
			}
			else if(($getData[0]['OwnWB'] == 0 && $getData[0]['moduleTypeId'] == 3) || ($getData[0]['movementTypeId'] == 1 && $getData[0]['moduleTypeId'] == 4 || $getData[0]['moduleTypeId'] == 19)){	

				$urlPath ="ZGP_FG_RET/FG_Return?sap-client=900";

                $sap_data = array (        
                    "VA_NUMBER" => $getData[0]['vaNumber'],  
                    "SCREEN_TYPE" => $getData[0]['moduleType'],
                    "RETURN_REFERENCE" => $getData[0]['returnRefNo'],
                    "SALES_INVOICE" => $getData[0]['salesInvoiceNo'],
                    "CUSTOMER_NAME" => $getData[0]['customerName'],
                    "TRUCK_NUMBER" => $getData[0]['vehicleNo'],
                    "PLANT" => $getData[0]['werks'],
                    "DRIVER_PH" => $getData[0]['driverMobileNumber'],
                    "WAIT_OUTSIDE" => '',
                    "GATE_IN" => $currentDateTime,
                    "REMARKS" => $getData[0]['remarks'],
                    "GATE_OUT" => ""
                );
                $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));  
				
				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument,$postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
				}	
			}	
			else if(($movementTypeId == 1) && ($getData[0]['moduleTypeId'] == 7 || $getData[0]['moduleTypeId'] == 13)){

				$urlPath ="zgatepro/zgp_scrap_det/Gatepro?sap-client=900";

				$sap_data = array (        
					"va_number" => $getData[0]['vaNumber'], 
					"truck_number" => $getData[0]['vehicleNo'], 
					"driver_phone" => $getData[0]['driverMobileNumber'], 
					"plant" => $getData[0]['werks'], 
					"first_weight" => "",
					"second_weight" => "",
					"net_weight" => "",
					"sales_invoice" => "",
					"customer" => "",
					"gatein_time" => $currentDateTime,
					"remarks" => $getData[0]['remarks'],
					"type" => $getData[0]['moduleTypeId'] == 7 ? 'SCRAP' : 'SCRAP-STO', 
					"gateout_time" => "",
					"METHOD" => "POST",
					"po_no" => $getPurchaseOrderDetails[0]['ZZPO_NO'],
					"delivery_no" => "",
					"rec_plant" => $getPurchaseOrderDetails[0]['ZZREC_PLANT'],
					"rec_sto" => $getPurchaseOrderDetails[0]['ZZREC_STORAGE_LOC']
				);
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
			
				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE; 

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
				}	
			}	
			else if(($movementTypeId == 1) && ($getData[0]['moduleTypeId'] == 6 || $getData[0]['moduleTypeId'] == 20)){	

				$urlPath ="zgatepro/zgp_sp_pm/Gatepro?sap-client=900";
				$sap_data = array (        
					"va_number" => $getData[0]['vaNumber'],    
					"type" => $getData[0]['moduleType'],           
					"truck_number" => $getData[0]['vehicleNo'],      
					"driver_phone" => $getData[0]['driverMobileNumber'],     
					"from_plant" => $getData[0]['werks'], 
					"Empty_Weight" => "",   
					"Load_Weight" => "",
					"Net_Weight" => "",
					"METHOD" => "POST",
					"Line_item" => $getPurchaseOrderDetails
				);
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
			
				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);		
				}	
			}		
			else if((($getData[0]['moduleTypeId'] == 15 || $getData[0]['moduleTypeId'] == 21 || $getData[0]['moduleTypeId'] == 33 || $getData[0]['moduleTypeId'] == 34) && ($getData[0]['secondWeight'] != '')) || $getData[0]['moduleTypeId'] == 12 ||(($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2) && $purchaseOrderFinalData != '')){

				$urlPath ="zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";

				$sap_data = array (
					"ZZVA_NO" => $getData[0]['vaNumber'],
					"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
					"ZZPLANT" => $getData[0]['werks'],
					"ZZTRANSACTION_TYPE" => ($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2) ? 'S&S-Purchase' : $getData[0]['moduleType'],
					"ZZLOADING_WGT" => $getData[0]['firstWeight'],
					"ZZEMPTY_WGT" => $getData[0]['secondWeight'],
					"ZZNET_WEIGHT" => $getData[0]['netWeight'],
					"ZZGATEIN_TIME" => $getData[0]['moduleTypeId'] == 1 ? $currentDateTime : $getData[0]['gateInDateStamp'],
					"ZZGATEOUT_TIME" => $getData[0]['moduleTypeId'] == 1 ? '' : $currentDateTime,
					"METHOD" => "POST",
					// "ZZLINE" => $getDeliveryDetailsData
					"ZZLINE" => ($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2) ? $purchaseOrderFinalData : $getDeliveryDetailsData
				);
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	

				if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
				}
			}	
			else if(($movementTypeId == 1 && $getData[0]['moduleTypeId'] == 5) || ($getData[0]['moduleTypeId'] == 22) || ($getData[0]['moduleTypeId'] == 38 && $getData[0]['firstWeight'] == null)){	

				if($getData[0]['moduleTypeId'] == 22){
					$getModuleType = 'Gatepass_Receipt';
				}else if($getData[0]['moduleTypeId'] == 38){
					$getModuleType = 'Diesel';
				}else{
					$getModuleType = 'GATEPASS';
				}

				$urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";
				$sap_data = array (        
					"va_number" => $getData[0]['vaNumber'], 
					"truck_number" => $getData[0]['vehicleNo'],            
					"driver_phone" => $getData[0]['driverMobileNumber'],
					"plant" => $getData[0]['werks'],
					"type" => $getModuleType,
					"gp_no" => "",
					"first_weight" => "",
					"second_weight" => "",
					"net_weight" => "",
					"gatein_time"=> $currentDateTime,
					"gateout_time" => "",
					"remarks" => $getData[0]['remarks'],
					"METHOD" => "POST",
				);							
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
			
				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);			
				}	
			}							
			else{
				$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
				$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
			}
		}  
		else{	
			if($getData[0]['subModuleTypeId'] == 3 || $getData[0]['moduleTypeId'] == 36){				

				$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
				$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);			
			}	
			else if(($postData->moduleStatusId == 5 && $movementTypeId == 1 && $getData[0]['moduleTypeId'] != 38) || ($getData[0]['moduleTypeId'] == 22) || ($getData[0]['moduleTypeId'] == 19) || ($getData[0]['moduleTypeId'] == 4)){
			
				if($getData[0]['moduleTypeId'] == 6 || $getData[0]['moduleTypeId'] == 20){
					$urlPath ="zgatepro/zgp_sp_pm/Gatepro?sap-client=900";
	
					$sap_data = array (        
						"va_number" => $getData[0]['vaNumber'],            
						"type" => $getData[0]['moduleType'],            
						"truck_number" => $getData[0]['vehicleNo'],             
						"driver_phone" => $getData[0]['driverMobileNumber'],
						"from_plant" => $getData[0]['werks'],
						"Empty_Weight" => $getData[0]['firstWeight'],   
						"Load_Weight" => $getData[0]['secondWeight'],
						"Net_Weight" => $getData[0]['netWeight'],
						"gateout_time" => $currentDateTime,
						"METHOD" => "PUT",
						"Line_item" => $getDeliveryDetailsData
					);		
				}
				else if($getData[0]['moduleTypeId'] == 7 || $getData[0]['moduleTypeId'] == 13){
					$urlPath ="zgatepro/zgp_scrap_det/Gatepro?sap-client=900";
	
					$sap_data = array (        
						"va_number" => $getData[0]['vaNumber'], 
						"truck_number" => $getData[0]['vehicleNo'], 
						"driver_phone" => $getData[0]['driverMobileNumber'], 
						"plant" => $getData[0]['werks'], 
						"first_weight" => $getData[0]['firstWeight'], 
						"second_weight" => $getData[0]['secondWeight'], 
						"net_weight" => $getData[0]['netWeight'], 
						"sales_invoice" => "", 
						"customer" => "", 
						"gatein_time" => $getData[0]['gateInDateStamp'], 
						"remarks" => $getData[0]['remarks'],
						"type" => $getData[0]['moduleTypeId'] == 7 ? 'SCRAP' : 'SCRAP-STO', 
						"gateout_time" => $currentDateTime,
						"METHOD" => "PUT",
						"po_no" => $getDeliveryDetailsData[0]['ZZPO_NO'],
						"delivery_no" =>$getDeliveryDetailsData[0]['ZZDELIVERY_NO'],
						"rec_plant" => $getDeliveryDetailsData[0]['ZZREC_PLANT'],
						"rec_sto" => $getDeliveryDetailsData[0]['ZZREC_STORAGE_LOC']
					);		
				}
				else if(($getData[0]['moduleTypeId'] == 5 && $getData[0]['vehicleNo'] != '') || ($getData[0]['moduleTypeId'] == 22 && $getData[0]['vehicleNo'] != '')){		
					
					$urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";
					$sap_data = array (        
						"va_number" => $getData[0]['vaNumber'],
						"truck_number" => $getData[0]['vehicleNo'],
						"driver_phone" => $getData[0]['driverMobileNumber'],
						"plant" => $getData[0]['werks'],
						"type" => $getData[0]['moduleTypeId'] == 22 ? 'Gatepass_Receipt' : 'GATEPASS',
						"gp_no" => $postData->gatePassNo,
						"first_weight" => $getData[0]['firstWeight'],
						"second_weight" => $getData[0]['secondWeight'],
						"net_weight" => $getData[0]['netWeight'],
						"gatein_time"=> $getData[0]['gateInDateStamp'],
						"gateout_time" => $currentDateTime,
						"remarks" => $getData[0]['remarks'],
						"zzrec_plant" => $postData->toPlant,
						"METHOD" => "PUT"
					);
				}
				else if($getData[0]['moduleTypeId'] == 19 || $getData[0]['moduleTypeId'] == 4){	

					$urlPath ="ZGP_FG_RET/FG_Return?sap-client=900";
					$sap_data = array (        
						"va_number" => $getData[0]['vaNumber'], 
						"truck_number" => $getData[0]['vehicleNo'],            
						"driver_phone" => $getData[0]['driverMobileNumber'],
						"plant" => $getData[0]['werks'],
						"first_weight" => $getData[0]['firstWeight'],
						"second_weight" => $getData[0]['secondWeight'],
						"net_weight" => $getData[0]['netWeight'],
						"gate_out" => $currentDateTime,
						"METHOD" => "PUT",
					);		
				}
				else{
					$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900";	
					if(($getData[0]['moduleTypeId'] == 2 && $getData[0]['movementTypeId'] == 1 && ((($getData[0]['redirectedGateInOutInfoId'] != '' || $getData[0]['isRedirect'] == 1) && $getData[0]['redirectMasterPlantId'] == '' && $getData[0]['secondWeight'] != '') || ($getData[0]['redirectedGateInOutInfoId'] == '') && ($getData[0]['secondWeight'] != '' || $getData[0]['OwnWB'] == 0 || ($postData->moduleStatusId == 5 && $getData[0]['isRedirect'] != 1)))) || ($getData[0]['stoPoNo'] != '' && $getData[0]['moduleTypeId'] == 1)|| ($getData[0]['moduleTypeId'] == 2 && $getData[0]['movementTypeId'] == 1 && $OwnWB == 0 && $getData[0]['redirectedGateInOutInfoId'] != '')){
//print_r($getData[0]);exit;
						$urlPath1 ="zgatepro/zfg_sto_rec/GP_SAP_REC_GATE?sap-client=900";	
						$sap_data1 = array (
							"ZZTRANSATION_TYPE" => $getData[0]['moduleType'],
							"ZZVA_NO" => $getData[0]['vaNumber'],
							"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
							"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
							"ZZPLANT" => $getData[0]['werks'],
							"ZZFirstWeight"=> $getData[0]['firstWeight'],
							"ZZSecondWeight"=> $getData[0]['secondWeight'],
							"ZZNetweight"=> $getData[0]['netWeight'],
							"ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'],
							"ZZGATEIN_TIME" => $getData[0]['gateInDateStamp'],
							"sap_pr_info" => $getDeliveryDetailsData,
							"METHOD" => "PUT"
						);
						//print_r($sap_data1);exit;
						$res1 = SapUrlHelper::PushToSap($urlPath1,json_encode([$sap_data1]));	
						$message = $res1[0]->MESSAGE;		
						//print_r($res1);exit;
						if(($res1[0]->STATUS) > 0){
							$sap_data = array (
								"transaction_type" => $getData[0]['moduleType'],
								"Va_No" => $getData[0]['vaNumber'],
								"Vehicle_No" => $getData[0]['vehicleNo'],
								"Gateout_Time" => $currentDateTime,
								"Plant" => $getData[0]['werks']
							);
						}
					}else if(($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2) && $getData[0]['isRedirect'] == 1 && $getData[0]['secondWeight'] == ''){
						$sap_data = array (
							"transaction_type" => $getData[0]['moduleType'],
							"Va_No" => $getData[0]['vaNumber'],
							"Vehicle_No" => $getData[0]['vehicleNo'],
							"Gateout_Time" => '',
							"Plant" => $getData[0]['werks'],
							"redirect_flag" => "X"
						);						
					}			
					else{
						$sap_data = array (
							"transaction_type" => $getData[0]['moduleTypeId'] == 5 ? 'GATEPASS' : $getData[0]['moduleType'],
							"Va_No" => $getData[0]['vaNumber'],
							"Vehicle_No" => $getData[0]['vehicleNo'],
							"Gateout_Time" => $currentDateTime,
							"Plant" => $getData[0]['werks']
						);
					}			
				}
				// print_r($getData[0]);exit;

				// print_r($sap_data);exit;
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

				if(($res[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;
	
					return array($dataStatus, "$message, Please Contact SAP Team");
				}
				else if(($res[0]->STATUS) > 0){
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);			
				}
			}			
			else if(($postData->moduleStatusId == 5 && $movementTypeId == 2)||($getData[0]['moduleTypeId'] == 38 && $getData[0]['secondWeight'] != null)){	

				if(($getData[0]['moduleTypeId'] == 3 || $getData[0]['moduleTypeId'] == 9 )){

					$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900";
					
					$sap_data = array (
						"transaction_type" => $getData[0]['moduleTypeId'] == 3 ? 'FG-RETURN' : 'RM-RETURN',
						"Va_No" => $getData[0]['vaNumber'],
						"Vehicle_No" => $getData[0]['vehicleNo'],
						"Gateout_Time" => $currentDateTime,
						"Plant" => $getData[0]['werks']
					);
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	

					if(($res[0]->STATUS) == 0){
						$dataStatus = false;
						$message = $res[0]->MESSAGE;
		
						return array($dataStatus, "$message, Please Contact SAP Team");
					}
					if(($res[0]->STATUS) > 0){
						$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
						$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
					}
				}
				else if($getData[0]['moduleTypeId'] == 6 || $getData[0]['moduleTypeId'] == 20 || $getData[0]['moduleTypeId'] == 13) {

					$urlPath ="zgatepro/zgp_ss_rec_gout/Gatepro?sap-client=900";
					
					$sap_data = array (
						"ZZTRANSACTION_TYPE" => $getData[0]['moduleType'],
						"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
						"ZZPLANT" => $getData[0]['fromPlantWerks'],
						"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
						"ZZVA_NO" => $getData[0]['vaNumber'],
						"ZZREC_PLANT" => $getData[0]['werks'],
						"ZZREC_GATEIN" => $getData[0]['gateInDateStamp'],
						"ZZREC_GATEOUT" => $currentDateTime,
						"ZZREC_FIRST_WEIGHT" => $getData[0]['firstWeight'],
						"ZZREC_SECOND_WEIGHT" => $getData[0]['secondWeight'],
						"ZZREC_NET_WEIGHT" => $getData[0]['netWeight'],
						"ZZMIGO_NO" => $getData[0]['migoNumber']
					);	
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	

					if(($res[0]->STATUS) == 0){
						$dataStatus = false;
						$message = $res[0]->MESSAGE;
		
						return array($dataStatus, "$message, Please Contact SAP Team");
					}
					if(($res[0]->STATUS) > 0){
						$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
						$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
					}				
				}					
				else if(($getData[0]['moduleTypeId'] == 15 || $getData[0]['moduleTypeId'] == 21 || $getData[0]['moduleTypeId'] == 33 || $getData[0]['moduleTypeId'] == 34 || $getData[0]['moduleTypeId'] == 12 || $getData[0]['moduleTypeId'] == 35) || $getData[0]['subModuleTypeId'] == 5 || $getData[0]['subModuleTypeId'] == 25 || ($getData[0]['moduleTypeId'] == 1 && count($getPurchaseOrderDetails) > 0) || $getData[0]['moduleTypeId'] == 38){					
					if($getData[0]['moduleTypeId'] == 38){

						$urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";

						$sap_data = array (        
							"va_number" => $getData[0]['vaNumber'],
							"truck_number" => $getData[0]['vehicleNo'],
							"driver_phone" => $getData[0]['driverMobileNumber'],
							"plant" => $getData[0]['werks'],
							"type" => $getData[0]['moduleType'],
							"gp_no" => $postData->gatePassNo,
							"first_weight" => $getData[0]['firstWeight'],
							"second_weight" => $getData[0]['secondWeight'],
							"net_weight" => $getData[0]['netWeight'],
							"gatein_time"=> $getData[0]['gateInDateStamp'],
							"gateout_time" => $currentDateTime,
							"remarks" => $getData[0]['remarks'],
							"zzrec_plant" => $postData->toPlant,
							"METHOD" => "PUT"
						);
						$gatepassRes = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
						$gatepassRes1 = $gatepassRes[0]->STATUS;
						//print_r($gatepassRes1);exit;
						if($gatepassRes1 == 0){
							$dataStatus = false;
							$message = $gatepassRes1[0]->MESSAGE;
							return array($dataStatus, "$message, Please Contact SAP Team");
						}
					}	
					//print_r($gatepassRes1);exit;
					if($getData[0]['moduleTypeId'] != 38 || $gatepassRes1 > 0){	
						$urlPath ="zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";

					$sap_data = array (
						"ZZVA_NO" => $getData[0]['vaNumber'],
						"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
						"ZZPLANT" => $getData[0]['werks'],
						"ZZTRANSACTION_TYPE" => $getData[0]['moduleType'],
						"ZZLOADING_WGT" => $getData[0]['firstWeight'],
						"ZZEMPTY_WGT" => $getData[0]['secondWeight'],
						"ZZNET_WEIGHT" => $getData[0]['netWeight'],
						"ZZGATEIN_TIME" => $getData[0]['gateInDateStamp'],
						"METHOD" => ($getData[0]['subModuleTypeId'] == 5 && $getData[0]['moduleTypeId'] == 16) || $getData[0]['subModuleTypeId'] == 25 || $getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 35 || $getData[0]['moduleTypeId'] == 38 ? "POST" : "PUT",
						"ZZGATEOUT_TIME" => $currentDateTime,
						"ZZLINE" => $getPurchaseOrderDetails
					);	
					//print_r($sap_data);exit;									
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
				    	
					if(($res[0]->STATUS) == 0){
						$dataStatus = false;
						$message = $res[0]->MESSAGE;
		
						return array($dataStatus, "$message, Please Contact SAP Team");
					}
				 
					if(($res[0]->STATUS) > 0){
						$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
						$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
					}
				}
				}
				else if(($getData[0]['moduleTypeId'] == 5 && $getData[0]['subModuleTypeId'] == 4) || ($getData[0]['subModuleTypeId'] == 1)){
					
					$gatePassType = $postData->gatePassNo." - ".$getData[0]['subModuleType'];

					$urlPath ="zgatepro/zgp_rec_gatepas/Gatepro?sap-client=900";
					

					$sap_data = array (        
						"va_number" => $getData[0]['vaNumber'], 
						"truck_number" => $getData[0]['subModuleTypeId'] == 1 ? $gatePassType : $getData[0]['vehicleNo'],
						"type" => 'GATEPASS',
						"gp_no" => $postData->gatePassNo,
						"receiving_plant" => $getData[0]['werks'],
						"receiving_sloc" => "",
						"receiving_gatein" => $getData[0]['gateInDateStamp'],						
						"receiving_gateout"=> $currentDateTime,
						"rec_first_wt" => $getData[0]['firstWeight'],
						"rec_second_wt" => $getData[0]['secondWeight'],
						"rec_net_wt" => $getData[0]['netWeight'],				
						"METHOD" => "POST"
					);
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	

					if(($res[0]->STATUS) == 0){
						$dataStatus = false;
						$message = $res[0]->MESSAGE;
		
						return array($dataStatus, "$message, Please Contact SAP Team");
					}
					if(($res[0]->STATUS) > 0){
						$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
						$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
					}						
				}else if (($getData[0]['moduleTypeId'] == 1 && $getData[0]['isRedirect'] == 1 && $getData[0]['secondWeight'] > 0 && $getData[0]['redirectMasterPlantId'] > 0) || (($getData[0]['userGateId'] == 17 || $getData[0]['userGateId'] == 18) && $getData[0]['movementTypeId'] == 2 && $getData[0]['moduleTypeId'] == 2 && $getData[0]['isRedirect'] == '')){
					//print_r($getData);exit;
					$urlPath2 ="zgatepro/zgp_ss_rec_gout/Gatepro?sap-client=900";
					
					$sap_data2 = array (
						"ZZTRANSACTION_TYPE" => $getData[0]['moduleType'],
						"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
						"ZZPLANT" => $getData[0]['fromPlantWerks'],
						"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
						"ZZVA_NO" => $getData[0]['vaNumber'],
						"ZZREC_PLANT" => $getData[0]['werks'],
						"ZZREC_GATEIN" => $getData[0]['secondWeightDateStamp'],
						"ZZREC_GATEOUT" => $currentDateTime,
						"ZZREC_FIRST_WEIGHT" => $getData[0]['firstWeight'],
						"ZZREC_SECOND_WEIGHT" => $getData[0]['secondWeight'],
						"ZZREC_NET_WEIGHT" => $getData[0]['netWeight'],
						"ZZMIGO_NO" => $getData[0]['migoNumber']
					);	
					$res2 = SapUrlHelper::PushToSap($urlPath2,json_encode([$sap_data2]));	
					$message = $res2[0]->MESSAGE;		
					if(($res2[0]->STATUS) > 0){
						$sap_data = array (
							"transaction_type" => $getData[0]['moduleTypeId'] == 5 ? 'GATEPASS' : $getData[0]['moduleType'],
							"Va_No" => $getData[0]['vaNumber'],
							"Vehicle_No" => $getData[0]['vehicleNo'],
							"Gateout_Time" => $currentDateTime,
							"Plant" => $getData[0]['fromPlantWerks'] ? $getData[0]['fromPlantWerks'] : $getData[0]['werks']
						);
					$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900";	
					$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
					if(($res[0]->STATUS) == 0){
						$dataStatus = false;
						$message = $res[0]->MESSAGE;
		
						return array($dataStatus, "$message, Please Contact SAP Team");
					}
					if($res[0]->STATUS > 0 || ($getData[0]['getIsIFoodSales'] == 1 && $getData[0]['movementTypeId'] == 2 && $getData[0]['moduleTypeId'] == 2 && $getData[0]['isRedirect'] == '')){
						$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
						$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
					}	
					}
					}
				else {
					$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
					$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
				}		
			}
			else{
				$sql = "CALL spUpdVehicleStatus(?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?, ?, ?, ?)";
				$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $getModuleStatusId, $postData->remarks, $moduleStatusId == 5 ? null : $postData->rejectReasonId, $postData->shipmentCopy, $postData->coaCopy, $postData->pickSlipCopy, $postData->sendingWBSlip, $postData->invoiceCopy, $postData->returnDocument, $postData->rejectionDeclarationForm, $postData->gatePassDocument, $postData->userInfoId, $postData->weighmentInfoId, $postData->isFirstWeightApproved]);	
			}			
		}		
		$queryResult = $builder->getResultArray();
		$data = (int)$queryResult[0]['countRow'];
		$dataCount = (int)$queryResult[0]['dataCount'];
		if($subModuleTypeId == 30){
			$builder = $this->db->table("loading_unloading_info");
			$builder =  $builder->set('statusId',0);
			$builder =  $builder->where("id",$getData[0]['loadingUnloadingInfoId']);
			$builder->update();
		}else if($getData[0]['moduleTypeId'] == 39 && $postData->moduleStatusId == 5){
			$this->db->table('gate_in_out_info')->set(['moduleStatusId'=>5,'waitingAt'=> 15])->where('id ',$postData->gateInOutInfoId)->update();
		}else if($getData[0]['moduleTypeId'] == 40 && $postData->moduleStatusId == 5){
			$this->db->table('gate_in_out_info')->set(['moduleStatusId'=>5,'waitingAt'=> 16])->where('id ',$postData->gateInOutInfoId)->update();
		}else if($getData[0]['moduleTypeId'] == 41 && $postData->moduleStatusId == 5){
			$this->db->table('gate_in_out_info')->set(['moduleStatusId'=>5,'waitingAt'=> 8])->where('id ',$postData->gateInOutInfoId)->update();
		}
		if($movementTypeId == 1 && $moduleStatusId == 5){
			$message = 'Status Already Updated';
		}
		else if($data > 0 && $dataCount == 0){
			$dataStatus = true;
			$message = "Updated Successfully...";
		}	
		else if($data == 0 && $dataCount > 0){
			$message = "Vehicle Already In.";
		}				
		else{
			$message = "Please contact Admin.";
		}		

		return array($dataStatus, $message, $data, $moduleTypeId, $movementTypeId, $subModuleTypeId, $isRedirect,$stoPoNo);
	}		

	// Get Empty Vehicle Arraival
	public function getEmptyVehicleArraival($vehicleNo, $userInfoId) {  	   
		$builder = $this->db->query("CALL spSelEmptyVehicleArraival('$vehicleNo', '$userInfoId')");
		$result = $builder->getResultArray();
		return $result;
  	}

	// Get Purchase Info
	public function getPurchaseInfo($vehicleNo, $userInfoId) {  	   
		$builder = $this->db->query("CALL spSelPurchaseInfo('$vehicleNo', '$userInfoId')");
		$result = $builder->getResultArray();
		return $result;
  	}

	// Gate In Out Report
	public function getRmWaterDetails($fromDate, $toDate, $vendorName, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelRmWaterDetails(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $vendorName, $userInfoId]);	
        $result = $builder->getResultArray();
        return $result;
  	}
	//pp_setting_data
	public function PP_Setting_Data(){
		// print_r('sdfds');exit;
		$builders = $this->db->table("pp_setting");
        $builders = $builders->select("vehicleMinWeight");
        $builders =  $builders->where("id",1);
	}

	public function getAllGateInOutInfo ($moduleStatusId,$userInfoId,$isHandCarry=null) {
		$builder =  $this->db->query("CALL spSelAllGateInOutInfo('$moduleStatusId','$userInfoId','$isHandCarry')");
		return  $builder->getResultArray();
	} 

	// Approve Or Reject Vehicle
	public function approveOrRejectVehicle($postData){
        $dataStatus = false;
        $data = $message = null;
		$currentDateTime = date("Y-m-d H:i:s");

		$sql = "CALL spSelGateInInfo(?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [0, 0, 0, $postData->gateInOutInfoId, $postData->userInfoId]);
		$getData = $builder->getResultArray();
		$getModuleStatusId = $getData[0]['getPreviousModuleStatus'];
		$OwnWB=$getData[0]['OwnWB'];
		//if(($getData[0]['moduleTypeId'] < 3 && $getModuleStatusId > 1 && $getData[0]['moduleStatusId'] == 12) || ($getData[0]['moduleTypeId'] == 3 && $getModuleStatusId > 2 && $getData[0]['moduleStatusId'] == 12)){
		if(($getData[0]['moduleTypeId'] < 3 && $getModuleStatusId > 1 && $getData[0]['moduleStatusId'] == 12 && $postData->moduleStatusId == 7) || ($getData[0]['moduleTypeId'] == 3 && $getModuleStatusId > 2 && $getData[0]['moduleStatusId'] == 12 && $postData->moduleStatusId == 7) || ($getData[0]['moduleTypeId'] > 3 && $getData[0]['moduleStatusId'] == 12 && $postData->moduleStatusId == 7) || ($OwnWB == 0 && $getData[0]['moduleStatusId'] == 12 && $postData->moduleStatusId == 7)){
			$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900";

			$sap_data = array (
				"Va_No" => $getData[0]['vaNumber'],
				"Reject_flag"=> "X",
				"Gateout_Time" => $currentDateTime,
				"Reject_Reason" => $postData->storeInchargeRejectRemarks,
				"METHOD" => "PUT"
			);
			$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	
			$message = $res[0]->MESSAGE;			

			if(($res[0]->STATUS) > 0){
				$sql = "CALL spApproveOrRejectVehicle(?, ?, ?, ?, ?)";     
				$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $postData->moduleStatusId, $postData->securityRejectRemarks, $postData->storeInchargeRejectRemarks, $postData->userInfoId]);	
			}
		} 
		else{
					//print_r($postData);exit;

			$sql = "CALL spApproveOrRejectVehicle(?, ?, ?, ?, ?)";     
			$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $postData->moduleStatusId, $postData->securityRejectRemarks, $postData->storeInchargeRejectRemarks, $postData->userInfoId]);
		}        
    
        $queryResult = $builder->getResultArray();
        $countRow = (int)$queryResult[0]['countRow'];
    
        if(($countRow > 0) && ($postData->moduleStatusId == 0 || $postData->moduleStatusId == 12)){
            $dataStatus = true;
            $message = "Rejected Successfully";        
        }		
        else if($countRow > 0 && $postData->moduleStatusId == 7){
            $dataStatus = true;
            $message = "Approved Successfully";
        }
        else{
            $message = "Please contact Admin.";
        }
        return array($dataStatus, $message);
    }

	// Redirect Vehicle
    public function redirectVehicle($postData){
        $dataStatus = false;
        $data = $message = null;
		
		$sql = "CALL spUpdRedirectVehicle(?, ?, ?, ?)";     
		$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $postData->isRedirect, $postData->redirectMasterPlantId, $postData->userInfoId]);
		
        $queryResult = $builder->getResultArray();
        $countRow = (int)$queryResult[0]['countRow'];

        if($countRow > 0){
            $dataStatus = true;
            $message = "Redirect Successfully";        
        }       
        else{
            $message = "Please contact Admin.";
        }
        return array($dataStatus, $message);
    }

	// Get Redirect Vehicle 
	public function getRedirectVehicle ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelRedirectVehice('$gateInOutInfoId')");
		return  $builder->getResultArray();
	}

	// Get Gatepass Delivery Info
	public function getGatepassDeliveryInfo ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelGatepassDeliveryInfo('$gateInOutInfoId')");
		$dataValue = $builder->getResultArray();

		if(count($dataValue) > 0) {	
			
			foreach($dataValue as $resultRow){

				$gatepassDeliveryInfoArray[$resultRow['gatepassDeliveryInfoId']]=array(
					'gatepassDeliveryInfoId' => (int)$resultRow['gatepassDeliveryInfoId'],
					'gateInOutInfoId' => (int)$resultRow['gateInOutInfoId'],
					'gatePassNo' => $resultRow['gatePassNo'],
					'gatePassType' => $resultRow['gatePassType'],
					'masterPlantId' => (int)$resultRow['masterPlantId'],
					'fromPlantName' => $resultRow['fromPlantName'],
					'receiptNumber' => $resultRow['receiptNumber']
				);	
				$sapLineArray[$resultRow['gatepassDeliveryInfoId']][]=array(						
					'gatepassDeliveryInfoDetailsId' => (int)$resultRow['gatepassDeliveryInfoDetailsId'],
					'lineItem' => $resultRow['lineItem'],
					'material' => $resultRow['material'],
					'uom' => $resultRow['uom'],
					'quantity' => $resultRow['quantity'],
					'toMasterPlantId' => (int)$resultRow['toMasterPlantId'],
					'toPlantName' => $resultRow['toPlantName'],
					'toPlantWerks' => $resultRow['toPlantWerks'],
					'hsnCode' => $resultRow['hsnCode'],
					'value' => $resultRow['value']
				);		
							
				foreach($gatepassDeliveryInfoArray as $gatepassDeliveryInfoArrayValue){
		
					foreach($sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']] as $certificateArrayValue){
						 $sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']] = $sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']];
					}	
					 $sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']] = array_values($sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']]);
					$gatepassDeliveryInfoArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']]['sapLine'] = $sapLineArray[$gatepassDeliveryInfoArrayValue['gatepassDeliveryInfoId']];
				}
			}
			$data = array_values($gatepassDeliveryInfoArray);
			$dataStatus = true;
			$message = 'data found';
		}
		else{
			$dataStatus = false;
			$message = 'No data found';
		}
		return array($dataStatus, $message, $data);
	}

	// Get Gatepass Delivery Info Details 
	public function getGatepassDeliveryInfoDetails ($gatepassDeliveryInfoId) {
		$builder =  $this->db->query("CALL spSelGatepaassDeliveryInfoDetails('$gatepassDeliveryInfoId')");
		return  $builder->getResultArray();
	}

	// Get Gatepass Delivery Info Details 
	public function getPurchaseReturnDeliveryDetails ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelPurchaseReturnDeliveryDetails('$gateInOutInfoId')");
		return  $builder->getResultArray();
	}

	// Get Migo Confirmation Vehicle Details
	public function getMigoConfirmationVehicleDetails () {
		$builder =  $this->db->query("CALL spSelMigoConfirmationVehicleDetails()");
		return  $builder->getResultArray();
	}
	 // Get Migo Confirmation Vehicle Details List
        public function getMigoConfirmationVehicleDetailSTO () {
	$builder = $this->db->table("gate_in_out_info");
	$builder = $builder->select("vaNumber");
	$builder = $builder->where("waitingAt",10);
	$builder = $builder->where("moduleType",2);
	return  $builder->get()->getResultArray();
        }
	// Add General Visitor Info
	public function addGeneralVisitorInfo($postData) {  
		
		$dataStatus = false;
		$data = $countRow = $message = null;

		$sql = "CALL spGenerateCashNumber(?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->userInfoId, '', 'generalVisiter']);
		$getHandCarryNumberResult = $builder->getResultArray();
		$getHandCarryNumber = $getHandCarryNumberResult[0]['cashNumber'];		
		
		$sql1 = "CALL spInsGeneralVisitorInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder1 = $this->db->query($sql1, [$getHandCarryNumber, $postData->employeeMasterId, $postData->meetingTypeId, $postData->companyName, $postData->collegeName, $postData->address, $postData->visitorPhoneNo, $postData->noOfVisitors, $postData->idProof, $postData->imagePath, $postData->moduleStatusId, $postData->remarks, $postData->userInfoId]);
		$queryResult = $builder1->getResultArray();		
	
		$data = (int)$queryResult[0]['lastInsertId'];
		$countRow = (int)$queryResult[0]['countRow'];
		$getExistCount = (int)$queryResult[0]['getExistCount'];
	
		if($getExistCount == 0 && $data > 0 &&  $countRow > 0){
		  $dataStatus = true;
		  $message = "Gate In Successfully";        
		}
		else if($getExistCount > 0 && $data == 0 && $countRow == 0){
		  $message = "Visitor Already In";
		}
		else{
		  $message = "Please contact Admin.";
		}
		return array($dataStatus, $message, $data);
	}

	// Add General Visitor Details
	public function addGeneralVisitorDetails($postData){     

		foreach($postData->generalVisitorDetails as $resultRow){ 
			
			$sql = "CALL spInsGeneralVisitorDetails(?, ?)";		
			$builder = $this->db->query($sql, [$postData->generalVisitorId, $resultRow->visitorName]);
			$queryResult = $builder->getResultArray();
		} 		
	}

	// Get General Visitor Info
	public function getGeneralVisitorInfo ($userInfoId) {
		$builder =  $this->db->query("CALL spSelGeneralVisitorInfo('$userInfoId')");
		$dataValue = $builder->getResultArray();

		if(count($dataValue) > 0) {	
			
			foreach($dataValue as $resultRow){
				
				$generalVisitorArray[$resultRow['generalVisitorId']]=array(
					'generalVisitorId' => (int)$resultRow['generalVisitorId'],
					'vaNumber' => $resultRow['vaNumber'],
					'employeeMasterId' => (int)$resultRow['employeeMasterId'],
					'employeeName' => $resultRow['employeeName'],
					'meetingTypeId' => (int)$resultRow['meetingTypeId'],
					'meetingType' => $resultRow['meetingType'],
					'companyName' => $resultRow['companyName'],
					'collegeName' => $resultRow['collegeName'],
					'address' => $resultRow['address'],
					'visitorPhoneNo' => $resultRow['visitorPhoneNo'],
					'masterPlantId' => (int)$resultRow['masterPlantId'],
					'werks' => $resultRow['werks'],
					'plantName' => $resultRow['plantName'],
					'moduleStatusId' => (int)$resultRow['moduleStatusId'],
					'statusName' => $resultRow['statusName'],
					'idProof' => $resultRow['idProof'],
					'imagePath' => $resultRow['imagePath'],
					'gateInBy' => (int)$resultRow['gateInBy'],
					'gateInDateStamp' => $resultRow['gateInDateStamp'],	
					'noOfVisitors' => $resultRow['noOfVisitors']					
				);	
				$generalVisitorDetailsArray[$resultRow['generalVisitorId']][]=array(						
					'generalVisitorDetailsId' => (int)$resultRow['generalVisitorDetailsId'],
					'visitorName' => $resultRow['visitorName']
				);					
							
				foreach($generalVisitorArray as $generalVisitorArrayValue){
		
					foreach($generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']] as $certificateArrayValue){
						 $generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']] = $generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']];
					}	
					 $generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']] = array_values($generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']]);
					$generalVisitorArray[$generalVisitorArrayValue['generalVisitorId']]['generalVisitors'] = $generalVisitorDetailsArray[$generalVisitorArrayValue['generalVisitorId']];
				}
			}
			$data = array_values($generalVisitorArray);
			$dataStatus = true;
			$message = 'data found';
		}
		else{
			$dataStatus = false;
			$message = 'No data found';
			$data = [];
		}
		return array($dataStatus, $message, $data);
	}

	// Update General Visitor Info
	public function updateGeneralVisitorInfo($postData){
		$dataStatus = false;
		$message = null;
		
		$sql = "CALL spUpdGeneralVisitorInfo(?, ?, ?)";     
		$builder = $this->db->query($sql, [$postData->generalVisitorInfoId, $postData->moduleStatusId, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$countRow = (int)$queryResult[0]['countRow'];
		$dataCount = (int)$queryResult[0]['dataCount'];

		if($countRow > 0 && $dataCount > 0){
			$dataStatus = true;
			$message = "Updated Successfully";        
		}       
		else{
			$message = "Please contact Admin.";
		}
		return array($dataStatus, $message);
	}

	// Add Work Permit
	public function addWorkPermit($postData) {  
		$dataStatus = false;
		$message = null;
		
		$sql = "CALL spInsWorkPermit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->workNatureId, $postData->servicePoNo, $postData->startDate, $postData->endDate, $postData->totalDays, $postData->prefferedShiftId, $postData->masterPlantId, $postData->contractorName, $postData->supervisorId, $postData->highGradePersonId, $postData->mediumGradePrersonId, $postData->lowGradePersonId, $postData->totalNoOfPersons, $postData->remarks, $postData->userInfoId ]);
	
		$queryResult = $builder->getResultArray();	
		$lastInsertId = (int)$queryResult[0]['lastInsertId'];
		$countRow = (int)$queryResult[0]['countRow'];	
		$getExistCount = (int)$queryResult[0]['getExistCount'];
	
		if($getExistCount == 0 && $lastInsertId > 0 &&  $countRow > 0){
			$dataStatus = true;
			$message = "Work Permit Form Added";
		}
		else if($getExistCount > 0 && $lastInsertId == 0 && $countRow == 0){
			$message = "Work Permit Form Already Added";
		}
		else{
			$message = "Please contact Admin.";
		}
		return array($dataStatus, $message, $lastInsertId);
	}

	// Get Work Permit Details
	public function getWorkPermit ($workPermitId, $userInfoId) {
		$builder =  $this->db->query("CALL spSelWorkPermit('$workPermitId', '$userInfoId')");
		return  $builder->getResultArray();
	}

	// Add Loading & Unloading Info
	public function addContractorDetails($postData) {  
		$dataStatus = false;
		$data = $message = null;

		$sql1 = "CALL spGenerateCashNumber(?, ?, ?)";		
		$builder1 = $this->db->query($sql1, [$postData->userInfoId, '', 'contractor']);
		$getVaNumberResult = $builder1->getResultArray();
		$getVaNumber = $getVaNumberResult[0]['cashNumber'];
		
		$sql = "CALL spInsContractDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->workPermitId, $getVaNumber, $postData->servicePoNo, $postData->contractorName, $postData->incharge, $postData->noOfPersons, $postData->supervisorPhoneNo, $postData->remarks, $postData->idProof, $postData->userInfoId]);
		$queryResult = $builder->getResultArray();

		$countRow = (int)$queryResult[0]['countRow'];
		$data = (int)$queryResult[0]['lastInsertId'];

		if($data > 0){
			$dataStatus = true;
			$message = "Gate In Successfully";
		}else{
			$message = "Please contact Admin.";
		}
		return array($dataStatus, $message, $data);
	}
	
	// Add Contract Persons
	public function addContractPersons($postData){     

		foreach($postData->contractorPersonDetails as $resultRow){ 
			
			$sql = "CALL spInsContractPersons(?, ?)";		
			$builder = $this->db->query($sql, [$postData->contractorDetailsId, $resultRow->personName]);
			$queryResult = $builder->getResultArray();
			$getContractPersonsId = (int)$queryResult[0]['contractPersonsId'];

			$runQuery.= "('$getContractPersonsId', '".$resultRow->moduleStatusId."', '".$resultRow->userInfoId."', NOW()),";
		} 
		$sql = "INSERT INTO contract_persons_activity(contractPersonsId, moduleStatusId, gateInBy, gateInDateStamp) VALUES ".rtrim($runQuery, ",").""; 
		$query2 = $this->db->query($sql);
		return  $query2->getResultArray();
	}

	// Add Contract Material Details
	public function addContractMaterialDetails($postData){     

		foreach($postData->contractorMaterialDetails as $resultRow){ 
			
			$sql = "CALL spInsContractMaterialDetails(?, ?, ?)";		
			$builder = $this->db->query($sql, [$postData->contractorDetailsId, $resultRow->material, $resultRow->noOfMaterial]);
			$queryResult = $builder->getResultArray();			
		} 		
	}

	// Add Contract Persons Activity
	public function addContractPersonsActivity($postData){     

		$gateInDateStamp = $gateOutDateStamp = null;
		$contractPersonActivityArray = array();
		$contractPersonActivityArray = $postData->contractPersonActivity;

		if(count($contractPersonActivityArray) > 0){ 
			foreach($contractPersonActivityArray as $resultRow){

				if($resultRow->moduleStatusId == 1){
					$isGateInOrOut = 0;
					$gateInDateStamp = date("Y-m-d H:i:s");
				}else if($resultRow->moduleStatusId == 5){
					$isGateInOrOut = 1;
					$gateOutDateStamp = date("Y-m-d H:i:s");
				}

				$sql1 = "UPDATE contract_persons SET isStatusUpdated = $isGateInOrOut WHERE id = '$resultRow->contractPersonsId'";
				$query2 = $this->db->query($sql1);

				$runQuery.= "('".$resultRow->contractPersonsId."', '$resultRow->grade', '$resultRow->workUpdate', '$resultRow->dayType', '".$resultRow->reason."', '".$resultRow->moduleStatusId."', '".$resultRow->gateInBy."', '".$gateInDateStamp."', '".$resultRow->approvedForGateOut."', '".$gateOutDateStamp."'),";
			} 
			$sql = "INSERT INTO contract_persons_activity(contractPersonsId, grade, workUpdate, dayType, reason, moduleStatusId, gateInBy, gateInDateStamp, approvedForGateOut, gateOutDateStamp) VALUES ".rtrim($runQuery, ",").""; 
			$query2 = $this->db->query($sql);
			
			$sql = "CALL spUpdContractWorkStatus(?)";		
			$builder = $this->db->query($sql, [$postData->contractorDetailsId]);			
			$queryResult = $builder->getResultArray();

			$dataStatus = true;
      		$message = "Updated Successfully";
		}
		else{
			$dataStatus = false;
			$message = "Please select contract person";
		}
		return array($dataStatus, $message);
	}

	// Get Contractor Details	
	public function getContractorDetails ($workPermitId, $contractorDetailsId, $userInfoId, $isReport=null) {
		$builder =  $this->db->query("CALL spSelContractorDetails('$workPermitId,', '$contractorDetailsId', '$userInfoId', $isReport)");
		$dataValue = $builder->getResultArray();

		if(count($dataValue) > 0) {	
			
			foreach($dataValue as $resultRow){

				$contractorDetailsArray[$resultRow['contractorDetailsId']]=array(
					'contractorDetailsId' => (int)$resultRow['contractorDetailsId'],
					'vaNumber' => $resultRow['vaNumber'],
					'workPermitId' => (int)$resultRow['workPermitId'],
					'workNatureId' => (int)$resultRow['workNatureId'],
					'workNature' => $resultRow['workNature'],
					'startDate' => $resultRow['startDate'],
					'endDate' => $resultRow['endDate'],
					'totalDays' => $resultRow['totalDays'],
					'prefferedShiftId' => (int)$resultRow['prefferedShiftId'],
					'shift' => $resultRow['shift'],
					'masterPlantId' => (int)$resultRow['masterPlantId'],
					'werks' => $resultRow['werks'],
					'plantName' => $resultRow['plantName'],
					'supervisorId' => (int)$resultRow['supervisorId'],
					'supervisorName' => $resultRow['supervisorName'],
					'highGradePersonId' => (int)$resultRow['highGradePersonId'],
					'highGradePerson' => $resultRow['highGradePerson'],
					'mediumGradePrersonId' => (int)$resultRow['mediumGradePrersonId'],
					'mediumGradePrerson' => $resultRow['mediumGradePrerson'],
					'lowGradePersonId' => (int)$resultRow['lowGradePersonId'],
					'lowGradePerson' => $resultRow['lowGradePerson'],
					'totalNoOfPersons' => $resultRow['totalNoOfPersons'],
					'statusId' => (int)$resultRow['statusId'],
					'servicePoNo' => $resultRow['servicePoNo'],
					'contractorName' => $resultRow['contractorName'],
					'incharge' => $resultRow['incharge'],
					'noOfPersons' => $resultRow['noOfPersons'],
					'supervisorPhoneNo' => $resultRow['supervisorPhoneNo'],
					'noOfPersons' => $resultRow['noOfPersons'],
					'remarks' => $resultRow['remarks']
				);	
				
				$contractPersons[$resultRow['contractorDetailsId']][]=array(						
					'contractPersonsId' => (int)$resultRow['contractPersonsId'],
					'personName' => $resultRow['personName'],
					'isStatusUpdated' => (int)$resultRow['isStatusUpdated'],
					'grade' => '',
					'workUpdate' => '',
					'dayType' => '',
					'reason' => '',
					'isGateOut' => true,
				);		
							
				foreach($contractorDetailsArray as $contractorDetailsArrayValue){
		
					foreach($contractPersons[$contractorDetailsArrayValue['contractorDetailsId']] as $certificateArrayValue){
						 $contractPersons[$contractorDetailsArrayValue['contractorDetailsId']] = $contractPersons[$contractorDetailsArrayValue['contractorDetailsId']];
					}	
					 $contractPersons[$contractorDetailsArrayValue['contractorDetailsId']] = array_values($contractPersons[$contractorDetailsArrayValue['contractorDetailsId']]);
					$contractorDetailsArray[$contractorDetailsArrayValue['contractorDetailsId']]['contractPersons'] = $contractPersons[$contractorDetailsArrayValue['contractorDetailsId']];
				}
			}
			$data = array_values($contractorDetailsArray);
			$dataStatus = true;
			$message = 'data found';
		}
		else{
			$dataStatus = false;
			$message = 'No data found';
			$data = [];
		}
		return array($dataStatus, $message, $data);
	}

	// Get Contract Material Details
	public function getContractMaterialDetails ($contractorDetailsId) {
		$builder =  $this->db->query("CALL spSelContractMaterialDetails('$contractorDetailsId)')");
		return  $builder->getResultArray();
	}

	public function getRakeData($id){
		$builders = $this->db->table("rake_loading");
		$builders = $builders->select("id");
		$builders =  $builders->where("id",$id);
		$builders =  $builders->where("status !=",3);
		$gateId = $builders->countAllResults();
		return  $gateId;
       }
       
        public function getSupplierVehicleData($id){
		$builders = $this->db->table("supplier_vehical_info");
		$builders = $builders->select("SUP_VE_REFID");
		$builders =  $builders->where("SUP_VE_REFID",$id);
		$builders =  $builders->where("VEHICLE_ARRIVED",0);
		//$builders =  $builders->where("SEAL_NO",'');
		$builders =  $builders->where("NO_OF_WAGON",'');
		$gateId = $builders->countAllResults();
		return  $gateId;
 	}

	public function getPurchaseData($id){
		$builders = $this->db->table("purchase_info");
		$builders = $builders->select("PI_REFID");
		$builders =  $builders->where("PI_REFID = $id AND VECHICAL_STATUS = 35 ");
		$gateId = $builders->countAllResults();
		return  $gateId;
 	}

	// Update General Visitor Info
	public function updateContractPersonsActivity($postData){
		$dataStatus = false;
		$message = null;

		$contractPersonActivityArray = array();
		$contractPersonActivityArray = $postData->contractPersonActivity;

		if(count($contractPersonActivityArray) > 0){ 

			foreach($contractPersonActivityArray as $resultRow){ 
				
				$sql = "CALL spUpdContractPersonsActivity(?, ?, ?, ?, ?, ?)";     
				$builder = $this->db->query($sql, [$resultRow->contractPersonsId, $resultRow->grade, $resultRow->workUpdate, $resultRow->dayType, $resultRow->reason, $postData->userInfoId]);
				$queryResult = $builder->getResultArray();

				$sql = "CALL spUpdContractWorkStatus(?)";		
				$builder = $this->db->query($sql, [$postData->contractorDetailsId]);			
				$queryResult = $builder->getResultArray();
				
				$dataStatus = true;
				$message = "Updated Successfully";
			}
			
		} 
		else{
			$message = "Please select contract person";
		}
	 	return array($dataStatus, $message);
	}

	//Get Delivery Details
	public function getGateInOutDeliveryDetails ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelGateInOutDeliveryDetails('$gateInOutInfoId')");
		return  $builder->getResultArray();
	}

	//Get Delivery Details
	public function getStoDeliveryDetails ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelStoDeliveryDetails('$gateInOutInfoId')");
		return  $builder->getResultArray();
	}

	public function getMigoConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
	$toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond) : 0;
        $sql = "CALL spSelMigoConfirmationList(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
       }
	public function getSaleConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
		$toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond) : 0;
        $sql = "CALL spSelSalesConfirmation(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

	public function getCanteenConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
		$toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond) : 0;
        $sql = "CALL spSelCanteenConfirmation(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

	public function getCanteenMaterialDetails($Movement,$subModuleTypeId) {
		// $builder1 = $this->db->table("gate_in_out_info");
		// $builder1 = $builder1->select("gate_in_out_info.id");
		// $builder1 =  $builder1->where("gate_in_out_info.subModuleTypeId",$subModuleTypeId);
		// $builder1 =  $builder1->where("gate_in_out_info.waitingAt",8);

		// $builder1->orderBy("gate_in_out_info.id", "DESC");
		// $builder1->limit(1);
        // $result1 = $builder1->get()->getResultArray();
		// $gateid = $result1[0]['id'];
		$subQuery = $this->db->table('canteen_material_details')
					->select('definition_list_id, MAX(canteen_material_details.id) as latest_id')  // Get the maximum (latest) id for each definition_list_id
					->join('canteen_payment', 'canteen_payment.id = canteen_material_details.canteen_payment_id', 'left')  // Correctly join on the canteen_payment_id
					->where('canteen_payment.status', 1)  // Filter where status is 1
					->groupBy('canteen_material_details.definition_list_id')
					->get()
					->getResultArray();
		$canteen_material_id_map = [];
		foreach ($subQuery as $row) {
			$canteen_material_id_map[$row['definition_list_id']] = $row['latest_id'];
		}

        $builder = $this->db->table("definitions");
		$builder = $builder->join('definitions_list', 'definitions_list.definitionsId = definitions.id', 'inner');
		// $builder = $builder->join('canteen_material_details', 'canteen_material_details.canteen_payment_id = canteen_payment.id and canteen_material_details.definition_list_id = definitions_list.id', 'left');
		// $builder = $builder->join('canteen_material_details', 'canteen_material_details.definition_list_id in definitions_list.id and canteen_material_details.id in ('.$canteen_material_id.')', 'left');
		//$builder->join('canteen_material_details','canteen_material_details.definition_list_id = definitions_list.id AND canteen_material_details.id IN (' . implode(',', array_values($canteen_material_id_map)) . ')', 'left');
		// $builder = $builder->join('canteen_payment', "canteen_payment.id = canteen_material_details.canteen_payment_id", 'left');
		// $builder->join('canteen_material_details', 'canteen_material_details.definition_list_id = (' . $subQuery->getCompiledSelect() . ' AND canteen_material_details.definition_list_id = definitions_list.id)', 'left'); 

		//$builder = $builder->select("definitions_list.definitionsName,definitions.id,definitions_list.id,canteen_material_details.material_qty as OldQty,canteen_material_details.material_rate as OldRate");
		$builder = $builder->select("definitions_list.definitionsName,definitions.id,definitions_list.id");
		$builder =  $builder->where("definitions.definitions","$Movement");
		$builder =  $builder->where("definitions.isActive",1);
		$builder =  $builder->where("definitions_list.isActive",1);
	    // $builder =  $builder->where("canteen_payment.status in (1,2)");
		$builder =  $builder->groupBy("definitions_list.id");
		//print_r($builder);exit;
        $result = $builder->get()->getResultArray();
        return $result;
    }

	public function AddCanteenMaterialDetails($Data){
		$currentDateTime = date("Y-m-d H:i:s");
	
		// Check if the payment already exists
		$count = $this->db->table("canteen_payment")
						  ->where('gate_id', $Data->gateInOutInfoId)
						  ->countAllResults();
		
		// If record does not exist, insert new record
		if ($count == 0) {
			$invoiceDate = $Data->invoice_date;  // Assuming this is in a string format
			$formattedDate = date('Y-m-d', strtotime($invoiceDate));  // Format the date
	
			$payment = array(
				'gate_id' => $Data->gateInOutInfoId,
				'invoice_no' => $Data->invoice_no,
				'invoice_date' => $formattedDate,
				'vendor_id' => $Data->confirm_vendor,
				'total_amount' => $Data->TotalAmount,
				'total_qty' => $Data->TotalQty,
				'total_rate' => $Data->TotalRate,
				'created_by' => $Data->UserId,
				'remark'=> $Data->remarks
			);
	
			// Insert new payment record
			$this->db->table('canteen_payment')->insert($payment);
			$canteenPaymentId = $this->db->insertID();  // Get last inserted ID
	
		} else if ($count > 0) {
			// Update existing record
			$invoiceDate = $Data->invoice_date;
			$formattedDate = date('Y-m-d', strtotime($invoiceDate));  // Format the date
	
			$payment = array(
				'invoice_no' => $Data->invoice_no,
				'invoice_date' => $formattedDate,
				'total_amount' => $Data->TotalAmount,
				'total_qty' => $Data->TotalQty,
				'total_rate' => $Data->TotalRate,
				'vendor_id' => $Data->confirm_vendor,
				'updated_by' => $Data->UserId,
				'remark'=> $Data->remarks
			);
	
			// Update payment record
			$this->db->table('canteen_payment')
					 ->where('gate_id', $Data->gateInOutInfoId)
					 ->update($payment);
	
			// Get the ID of the updated record
			$canteenPaymentId = $this->db->table('canteen_payment')
										 ->select('id')
										 ->where('gate_id', $Data->gateInOutInfoId)
										 ->get()
										 ->getRow()->id;
		}
	
		// If canteen payment record was inserted or updated successfully
		if (isset($canteenPaymentId)) {
			$Material_Data = $Data->MaterialDetails;
			$sap_line = [];
			$created_by = ($count == 0) ? 'created_by' : 'updated_by';
	
			// Prepare material details data for insertion or update
			foreach ($Material_Data as $key => $sap) {
				$sap_line[] = array(
					"canteen_payment_id" => $canteenPaymentId,
					"definition_list_id" => $sap->id,
					"material_name" => $sap->definitionsName,
					"material_qty" => $sap->Qty,
					"material_rate" => $sap->Rate,
					"material_old_rate" => $sap->OldRate,
					"material_old_qty" => $sap->OldQty,
					"rate_diff" => $sap->DiffQty,
					"material_amount" => $sap->TotalCost,
					$created_by => $Data->UserId,
				);
			}
			//print_r($sap_line);exit;
			// Check if material details already exist
			$count1 = $this->db->table("canteen_material_details")
							   ->where('canteen_payment_id', $canteenPaymentId)
							   ->countAllResults();
	
			// Insert new material details
			if ($count1 == 0) {
				$this->db->table('canteen_material_details')->insertBatch($sap_line);
				$this->db->table('canteen_payment')
						 ->set('status', 1)
						 ->where('id', $canteenPaymentId)
						 ->update();
	
				$this->db->table('gate_in_out_info')
						 ->set('waitingAt', 8)
						 ->where('id', $Data->gateInOutInfoId)
						 ->update();
	
			} else if ($count > 0 && $count1 > 0) {
				// Update existing material details
				foreach ($sap_line as $item) {
					$this->db->table('canteen_material_details')
							 ->where('canteen_payment_id', $canteenPaymentId)
							 ->where('definition_list_id', $item['definition_list_id'])  // Corrected array access
							 ->update($item);
				}
	
				$this->db->table('canteen_payment')
						 ->set('status', 1)
						 ->where('id', $canteenPaymentId)
						 ->update();
	
				$this->db->table('gate_in_out_info')
						 ->set('waitingAt', 8)
						 ->where('id', $Data->gateInOutInfoId)
						 ->update();
			}
		}
		return $canteenPaymentId;
	}

	public function PaymentDetailsList() {
		$result = $this->db->table('canteen_payment')
		->select("canteen_payment.*, gate_in_out_info.id as gateinout_id, gate_in_out_info.vaNumber,DATE_FORMAT(canteen_payment.created_at, '%d-%m-%Y')as created_at,,DATE_FORMAT(canteen_payment.invoice_date, '%d-%m-%Y')as invoice_date,gate_in_out_info.id as GateId,master_sub_module.subModuleType,CONCAT(master_vendor.Name, '-', master_vendor.Code) as master_vendor
		") 
		->join('gate_in_out_info', 'canteen_payment.gate_id = gate_in_out_info.id', 'inner') 
		->join('master_sub_module', 'gate_in_out_info.subModuleTypeId = master_sub_module.id', 'inner') 
		->join('master_vendor', 'master_vendor.Id = canteen_payment.vendor_id', 'inner') 
		->where('canteen_payment.status', 1) 
		->groupBy('canteen_payment.id')
		->get()
		->getResultArray();  
		return $result;
    }

	public function CanteenPaymentMaterialsList($id) {
	  $result = $this->db->table('canteen_material_details')
        ->select("
            canteen_payment.*, 
            canteen_material_details.*, 
            gate_in_out_info.id as gateinout_id, 
            gate_in_out_info.vaNumber, 
            DATE_FORMAT(canteen_payment.created_at, '%d-%m-%Y') as createdAt, 
            DATE_FORMAT(canteen_payment.invoice_date, '%d-%m-%Y') as invoiceDate, 
            master_sub_module.subModuleType,
			CONCAT(master_vendor.Name, '-', master_vendor.Code) as master_vendor,
			canteen_payment.id as PaymentId
			
        ")
        ->join('canteen_payment', 'canteen_payment.id = canteen_material_details.canteen_payment_id', 'inner')  
        ->join('gate_in_out_info', 'canteen_payment.gate_id = gate_in_out_info.id', 'inner') 
        ->join('master_sub_module', 'gate_in_out_info.subModuleTypeId = master_sub_module.id', 'inner') 
		->join('master_vendor', 'master_vendor.Id = canteen_payment.vendor_id', 'inner') 
        ->where('canteen_payment.id', $id) 
        // ->where('canteen_payment.status', 1)
        ->get()
        ->getResultArray(); 

      return $result;
    }

	public function UpdateCanteenMaterial($Data){
		// print_r($Data);exit;
			$currentDateTime = date("Y-m-d H:i:s");
			// $currentDate = date("Ymd");
			$currentDate = $Data->sap_posting_date ? date("Ymd",strtotime($Data->sap_posting_date)) :  date("Ymd");
			$rejected_by = $Data->status == 0 ? 'rejected_by' : 'updated_at' ;
			$remark = $Data->status == 0 ? 'rejected_remark' : 'remark' ;
			if($Data->status == 3){
				$urlPath ="zgatepro/zgp_unloading/Gatepro_Fg_Uloading?sap-client=900";
				$sap_data = array (
					"reference_No" => $Data->ref_no,
					"posting_date"=> $currentDate,
					"doc_date"=> date('Ymd', strtotime($Data->doc_date)),
					"item_text" => $Data->remarks,
					"vendor_code" => $Data->vendor_code,
					"amount" => $Data->amount,
					"gl_account" => "416054",
					"costcenter" => "DV-G-MEC",
				);
				$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));	

				$message = $res[0]->MESSAGE;			
	
				if($res[0]->STATUS == 0 && strlen($res[0]->DOC) == 0){
					$dataStatus = false ;
					$message = $res[0]->MESSAGE;
				    return array($dataStatus, "$message, Please Contact SAP Team");
				}
			}
			if($Data->status >= 0 ){
			$payment = array(
				'status' => $Data->status,
				$remark => $Data->remarks,
				$rejected_by =>$Data->UserId,
				'document_no' => $res[0]->DOC,
				'sap_posting_date'=> $Data->sap_posting_date ? $Data->sap_posting_date : $currentDateTime,
				'invoice_posting_date'=>$Data->doc_date,
				'sap_posting_amount'=>$Data->amount,
			);
			if($Data->status != 3){
				$payment = array(
					'status' => $Data->status,
					$remark => $Data->remarks,
					$rejected_by =>$Data->UserId,
				);
			$this->db->table('canteen_payment')
					 ->set($payment)
					 ->where('id', $Data->ID)
					 ->update();
			}else if($Data->status == 3 && $res[0]->STATUS > 0){
				$payment = array(
					'status' => $Data->status,
					$remark => $Data->remarks,
					'updated_by' =>$Data->UserId,
					'document_no' => $res[0]->DOC,
					'sap_posting_date'=> $Data->sap_posting_date ? $Data->sap_posting_date : $currentDateTime,
					'invoice_posting_date'=>$Data->doc_date,
					'sap_posting_amount'=>$Data->amount,
				);
				$this->db->table('canteen_payment')
					 ->set($payment)
					 ->whereIn('id', $Data->ID)
					 ->update();
			}
			if($Data->status == 0){
				$this->db->table('gate_in_out_info')
					 ->set('waitingAt',16)
					 ->where('id', $Data->gate_id)
					 ->update();
			}
		  
		    $dataStatus = true ;
		    $message = 'Updated Sucessfully';
		    $result = $res[0]->DOC;
			return array($dataStatus, $message, $result);
		  }
			
	}
	public function getVendor()
	{
		$builder = $this->db->table("master_vendor");
		$builder = $builder->select("Id as value, CONCAT(Name, '-', Code) as label");
		$builder = $builder->Where("Category", 'CANTEEN');
		return  $builder->get()->getResultArray();
	}

	public function getCanteenReport($fromDate, $toDate, $moduleTypeId, $userInfoId) {
		// Convert timestamps to dates
		$fromDateMilliSecond = $fromDate / 1000;
		$toDateMilliSecond = $toDate / 1000;
		$fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
		$toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond) : 0;
	
		// Build the condition for date range and moduleTypeId
		if ($moduleTypeId == '' || $moduleTypeId == 0) {
			// Condition for date range only
			$cnd = "canteen_payment.created_at BETWEEN '$fromDate' AND '$toDate'";
		} else {
			// Condition for date range and moduleTypeId
			$cnd = "canteen_payment.created_at BETWEEN '$fromDate' AND '$toDate' AND gate_in_out_info.subModuleTypeId = $moduleTypeId";
		}
		
		// print_r($cnd);exit;
		// Execute the query
		$result = $this->db->table('canteen_payment')
			->select("
				canteen_payment.*, 
				gate_in_out_info.id AS gateinout_id, 
				gate_in_out_info.vaNumber, 
				DATE_FORMAT(canteen_payment.created_at, '%d-%m-%Y') AS created_at, 
				DATE_FORMAT(canteen_payment.invoice_date, '%d-%m-%Y') AS invoice_date, 
				gate_in_out_info.id AS GateId, 
				master_sub_module.subModuleType, 
				CONCAT(master_vendor.Name, '-', master_vendor.Code) AS master_vendor,
				IF(canteen_payment.status = 1, 'MG Approve', 
				IF(canteen_payment.status = 2, 'ACC Approve', 
				IF(canteen_payment.status = 3, 'Completed', 'Reject')
				)) AS status,
				canteen_payment.status as completed_status,
				DATE_FORMAT(canteen_payment.invoice_posting_date, '%d-%m-%Y') AS invoice_posting_date,
				DATE_FORMAT(canteen_payment.sap_posting_date, '%d-%m-%Y') AS sap_posting_date,	
				")

				
			->join('gate_in_out_info', 'canteen_payment.gate_id = gate_in_out_info.id', 'inner')
			->join('master_sub_module', 'gate_in_out_info.subModuleTypeId = master_sub_module.id', 'inner')
			->join('master_vendor', 'master_vendor.Id = canteen_payment.vendor_id', 'inner')
			->where($cnd) 
			->groupBy('canteen_payment.id')
			->get()
			->getResultArray();
	
		return $result;
	}
	 // Get Sales Confirmation Vehicle Details List
	public function getSalesConfirmationList () {
		$builder = $this->db->table("gate_in_out_info_details");
		$builder = $builder->select("gate_in_out_info_details.gateInOutInfoId,gate_in_out_info_details.id,gate_in_out_info_details.invoiceNumber");
		$builder = $builder->join('gate_in_out_info', 'gate_in_out_info.id = gate_in_out_info_details.gateInOutInfoId', 'inner');
		$builder = $builder->where("gate_in_out_info_details.status",0);
		$builder = $builder->where("gate_in_out_info.waitingAt",15);
		return  $builder->get()->getResultArray();
	}

	public function getTrailMaterialDetails($fromDate, $toDate,$userInfoId) {
		// Convert timestamps to dates
		$fromDateMilliSecond = $fromDate / 1000;
		$toDateMilliSecond = $toDate / 1000;
		$fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
		$toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond) : 0;
	
		$cnd = "gate_in_out_info.createdOn BETWEEN '$fromDate' AND '$toDate' AND gate_in_out_info.waitingAt in (10,8) AND gate_in_out_info.moduleType = 41";

		$result = $this->db->table('gate_in_out_info')
			->select("
			gate_in_out_info.*,
			master_plant.PLANT_NAME,
			master_module.moduleType
			")
			->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
			->join('master_module', 'master_module.Id = gate_in_out_info.moduleType', 'inner')
			->where($cnd) 
			->groupBy('gate_in_out_info.id')
			->get()
			->getResultArray();
	
		return $result;
	}
	
	public function getCanteenAccConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
		// Convert timestamps to dates
		$fromDateMilliSecond = $fromDate / 1000;
		$toDateMilliSecond = $toDate / 1000;
		$fromDate = $fromDate > 0 ? date("Y-m-d", $fromDateMilliSecond) : 0;
		// $toDate = $toDate > 0 ? date("Y-m-d", $toDateMilliSecond)+1 : 0;
		$toDate = $toDate > 0 ? date("Y-m-d", strtotime("+1 day", $toDateMilliSecond)) : 0;
		
		
		// Execute the query
		$result = $this->db->table('canteen_payment')
			->select("
				canteen_payment.*, 
				gate_in_out_info.id AS gateinout_id, 
				gate_in_out_info.vaNumber, 
				DATE_FORMAT(canteen_payment.created_at, '%d-%m-%Y') AS created_at, 
				DATE_FORMAT(canteen_payment.invoice_date, '%d-%m-%Y') AS invoice_date, 
				gate_in_out_info.id AS GateId, 
				master_sub_module.subModuleType, 
				CONCAT(master_vendor.Name, '-', master_vendor.Code) AS master_vendor,
				master_vendor.Code as vendor_code,
				IF(canteen_payment.status = 1, 'Payment Approve', 
				IF(canteen_payment.status = 2, 'Completed', 'Reject')
			) AS status,
			canteen_payment.status as completed_status
			")
			->join('gate_in_out_info', 'canteen_payment.gate_id = gate_in_out_info.id', 'inner')
			->join('master_sub_module', 'gate_in_out_info.subModuleTypeId = master_sub_module.id', 'inner')
			->join('master_vendor', 'master_vendor.Id = canteen_payment.vendor_id', 'inner')
			->where('canteen_payment.created_at >=', $fromDate)
			->where('canteen_payment.created_at <=', $toDate)
			->where('gate_in_out_info.subModuleTypeId', $moduleTypeId)
			->where('canteen_payment.status', 2)
			->groupBy('canteen_payment.id')
			// print_r($result);exit;

			->get()
			->getResultArray();
	
		return $result;
	}

	public function isVehicleAlreadyIn ($user_id) {

		$builder = $this->db->table("user_info");
		$builder = $builder->select("UI_ID,masterGateId");
		$builder = $builder->where("UI_ID",$user_id);
		$builder = $builder->where("USER_STATUS",1);
		$user_details = $builder->get()->getResultArray();

		$Sql = "SELECT definitionsName FROM definitions_list  WHERE definitionsName = '" . $user_details[0]['masterGateId'] . "' AND definitionsId = 19 AND isActive = 1";
		$builder2 = $this->db->query($Sql);	    
		$result =  $builder2->getResultArray();

		$Sql1 = "SELECT PLANT_ID FROM master_user_plant  WHERE USER_ID = '" . $user_id . "' AND RecStatus = 1";
		$builder3 = $this->db->query($Sql1);	    
		$result1 =  $builder3->getResultArray();
		$plantIds = array_column($result1, 'PLANT_ID');


		$builder1 = $this->db->table("delivery_control_panel");
		$builder1 = $builder1->select("id,temp_extended_days,gate_id");
		$builder1 = $builder1->where("status",2);
		$builder1 = $builder1->where("delivery_control_id",7);
		$res = $builder1->orderBy('id','desc')->get()->getResultArray();
		$temp_extended_days = $res[0]["temp_extended_days"];

		$varCuurentDate = date('Y-m-d H:i:s'); 
		$EndDate = date('Y-m-d 23:59:59', strtotime($varCuurentDate));
		$days_sdi = -7 - $temp_extended_days ;
  		$date_sdi  = date('Y-m-d', strtotime("$days_sdi day", strtotime($EndDate)));
		$count = $this->db->table("gate_in_out_info")->where('waitingAt NOT IN(7,8,10,13,11,14,16,13)')->whereIn("masterPlantId", $plantIds)->where("createdOn<= '$date_sdi'")->countAllResults();

		if($count > 0 && ($result)) {
			return $count;
		}
		
		return  0;
	}

	public function CheckVendorInvoice($invoiceNo, $vendorCode,$poNumber) {
		$count = $this->db->table("purchase_order")->join('gate_in_out_info', 'purchase_order.loadingUnloadingInfoId = gate_in_out_info.loadingUnloadingInfoId', 'inner')->where(['purchase_order.invoiceNo =' => $invoiceNo , 'purchase_order.vendorCode =' => $vendorCode, 'purchase_order.poNumber'=>$poNumber])->where('gate_in_out_info.waitingAt !=', 7)->countAllResults();
		return $count;
	}

	public function ExtraAttachmentCopyInsert($Data){
			$insert = array(
				'gate_id' => $Data->gateInOutInfoId,
				'attachment_copy' => $Data->pickSlipCopy,
				'created_by' => $Data->userInfoId,
			);
			$this->db->table('gate_extra_attachments')->insert($insert);
			$insert = $this->db->insertID();  // Get last inserted ID
		return $insert;
	}

	public function ExtraAttachmentCopyGet($GateId) {
		
		$result = $this->db->table('gate_extra_attachments')
			->select("gate_extra_attachments.*")
			->where('gate_extra_attachments.gate_id', $GateId)
			->groupBy('gate_extra_attachments.id')
			->get()
			->getResultArray();
	
		return $result;
	}
	
}
