<?php

namespace App\Controllers\Api;

use App\Helpers\SapUrlHelper;
use App\Models\LandingDataModel;
use App\Models\GatePro\GateService;
use App\Models\GatePro\MasterService;

class LandingDataController extends BaseApiController
{
	public function Loading_Data()
	{
	    $json = $this->request->getJSON();
		// $SessionUser=$_SESSION;
		// print_r($SessionUser);exit;
		$VEHICLE_STATUS = '1,5,15';
		$moduleStatusId = '4,6';
		$plant_id = $json->werks;
		$userGateId = $json->userGateId;
		$model = new LandingDataModel;
		$ias_stm = $model->Loading_IAS_STM_Data($VEHICLE_STATUS,$plant_id);
		$gate_pro = $model->Loading_Gate_info($moduleStatusId,$userGateId);
		return  $this->respond(["success" => 1, "ias_stm" => $ias_stm ,"gate_pro"=> $gate_pro ]);      
	}

	public function UnloadingData()
	{
	    $json = $this->request->getJSON();
		// $SessionUser=$_SESSION;
		// print_r($SessionUser);exit;
		$VEHICLE_STATUS = '1,5,15';
		$moduleStatusId = '4,6';
		$plant_id = $json->werks;
		$userGateId = $json->userGateId;
		$model = new LandingDataModel;
		$ias_stm = $model->UnloadingPurchase($VEHICLE_STATUS,$plant_id);
		$gate_pro = $model->Unloading_Gate_info($moduleStatusId,$userGateId);

		return  $this->respond(["success" => 1, "purchase" => $ias_stm ,"gate_pro"=> $gate_pro ]);      
	}

	public function FGSales_DocumentVerify()
	{
		$json = $this->request->getJSON();
		// $ZZVEHICLE_NO = $json->Vehicle_Number ;
		// $gate_in_info_id = '1';
		// $Shipment_No = '10042694';
		$gate_in_info_id = $json->gateInInfoId;
		$Shipment_No = $json->shipmentOrderNo;
		$Tripsheet_no=$json->tripSheetNumber;
		$Va_no=$json->vaNumber;
		$Type = $json->Type;
		$CurrentDateTime=date("Y-m-d H:i:s");

		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gate_in_info_id, 0); 		
		$Truck_No = $gateInData[0]['vehicleNo']; 
		$model = new LandingDataModel;

		if( ($gateInData[0]['moduleTypeId'] == 1 || $gateInData[0]['moduleTypeId'] == 2) && ($gateInData[0]['subModuleTypeId'] == '' || $gateInData[0]['subModuleTypeId'] == 19)){
			$vehicleNo = $gateInData[0]['vehicleNo'] ;
			$urlPath ="zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$vehicleNo";
                        $data = SapUrlHelper::getWhDatas($urlPath);
			$res = json_decode($data, true);
			$TRIPSHEET_NO = $res[0]['TRIPSHEET_NO'];
			$SHIPMENTORDERNO = $res[0]['SAP_LINE'][0]['SHIPMENTORDERNO'];
			$model->updateTripsheetOrShipment($gate_in_info_id, $TRIPSHEET_NO, $SHIPMENTORDERNO);
		}		

		$urlPath = "zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900&Shipment_No=$Shipment_No";
		$res = SapUrlHelper::getWhDatas($urlPath);
		$WB_Weight_Reverse = json_decode($res);

		$fg_detail = "/zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";
		$fg_details = SapUrlHelper::getWhDatas($fg_detail);
		$fg_details_data_array = json_decode($fg_details);

		$fg_detail_shipment = "zgatepro/zfg_shipment/zsap_gp_shipment_md?sap-client=900&Shipment_no=$Shipment_No&Truck=$Truck_No";
		$fg_detail_shipment = SapUrlHelper::getWhDatas($fg_detail_shipment);
		$fg_detail_shipment = json_decode($fg_detail_shipment);
		
		// print_r($fg_detail_shipment);exit;
		//if(count($fg_details_data_array) > 0 && $fg_details_data_array[0]->FROM_PLANT) {
		//	if($fg_details_data_array[0]->TYPE == 'FG-Sales'){
		//		$sapDocument = 'shipmentOrderNo';
		//	}else {
		//		$sapDocument = 'stoPoNo';
		//	}
		//	$plant_id=$model->PlantByID($fg_details_data_array[0]->FROM_PLANT);
		//		$data = array(
		//			"moduleType" => $fg_details_data_array[0]->TYPE == 'FG-Sales'? 1 : 2,
		//			"masterPlantId" => $plant_id[0]['ID'],
		//			$sapDocument => $fg_details_data_array[0]->SAP_DOCUMENT
		//		);
		//	$model->Gate_info_Status_Change($gate_in_info_id, $data);			
		//}
		if($gateInData[0]['moduleTypeId'] != 43){
			foreach($fg_details_data_array as $fg_details_data){
				if(count($fg_details_data_array) > 0 && $fg_details_data->FROM_PLANT) {
					if($fg_details_data->TYPE == 'FG-Sales'){
						$sapDocument = 'shipmentOrderNo';
					}else {
						$sapDocument = 'stoPoNo';
					}
					$plant_id=$model->PlantByID($fg_details_data->FROM_PLANT);
						$data = array(
							"moduleType" => $fg_details_data->TYPE == 'FG-Sales'? 1 : 2,
							"masterPlantId" => $plant_id[0]['ID'],
							$sapDocument => $fg_details_data->SAP_DOCUMENT
						);
					$model->Gate_info_Status_Change($gate_in_info_id, $data);			
				}
			}
		}
		if(count($WB_Weight_Reverse) > 0){
			// if($Type == 'POST') {
				$data = array(
					"moduleStatusId" => '2',
					"waitingAt" => '3',
					"modifiedOn" => $CurrentDateTime,
				);
				$model->Gate_info_Status_Change($gate_in_info_id, $data);				
			// }
			$gate_info=$model->Gate_info_ByID($gate_in_info_id);
			$result = $WB_Weight_Reverse;
			$success = true;
			$message = 'Second Weight Rejected in SAP';
		   }else if(count($WB_Weight_Reverse) == 0){
			// $urlPath = "zgatepro/zfgsale_invoice/SAP_GP_Invoice?sap-client=900&Shipment_No=$Shipment_No";
			$urlPath =  "/zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";
		    $res = SapUrlHelper::getWhDatas($urlPath);
			$SAP_Sales_Invoice = json_decode($res);
			// print_r($SAP_Sales_Invoice);exit;
			$SAP_Line = $SAP_Sales_Invoice[0]->SAP_LINE;
			
			foreach($fg_details_data_array as $fg_details_data){
			
				if(count($SAP_Sales_Invoice) > 0 && $fg_details_data->TYPE == 'FG-Sales') {
					if($Type == 'POST') {
					$SAP_Line_Sales = $fg_details_data->SAP_LINE;
						$data = array(
							"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
					       	"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
							"overAllDeliveryQuantity" => $fg_details_data->OVERALL_DELIVERY_WT,
							"modifiedOn" => $CurrentDateTime,
							"delay_reason_id" => $json->delayreason,
						);
						$model->Gate_info_Status_Change($gate_in_info_id, $data);
						$model->addGateInOutHistory($json);
						$shipmentDate = $fg_details_data->SHIPMENT_CREATION_DATE . ' ' . $fg_details_data->SHIPMENT_CREATION_TIME;
						foreach ($SAP_Line_Sales as $delivery_info) {
							$gate_in_info_details = array(
							"gateInOutInfoId" => $gate_in_info_id,
							"invoiceNumber" => $delivery_info->INVOICE_NO,
							"deliveryNumber" => $delivery_info->DELIVERY_NO,
							"deliveryQty" => $delivery_info->DELIVERY_WT,
							"customerCode"=> $delivery_info->CUSTOMER_ID,
							"PgiCompletion"=> $delivery_info->PGI_COMPLETION,
							"moduleTypeId"=> 1,
							"customerName"=> $delivery_info->CUSTOMER_NAME,
							"created_at"=>$CurrentDateTime,
							"created_by"=>$json->userInfoId,
							"shipmentDate" => $shipmentDate ? date("Y-m-d H:i:s", strtotime($shipmentDate)) : null,
							);
							$model->Gate_info_details_insert($gate_in_info_id, $gate_in_info_details);
						}						
					}
					if($gateInData[0]['moduleStatusId'] == 5){
						$success = false;
						$message = 'Status Already Updated';
					}else{
						$gate_info=$model->Gate_info_ByID($gate_in_info_id);
						$result = $SAP_Sales_Invoice;
						$success = true;
						$message = 'Shipment Created Successfully';
					}					
				}else if($fg_details_data->TYPE == 'FG-STO'){
					if($Type == 'POST'){
						$SAP_Line_Sto = $fg_details_data->SAP_LINE;
						$data = array(
							"moduleStatusId" => $gateInData['moduleStatusId'] == 5 ? 5 : '4',
							"waitingAt" => $gateInData['moduleStatusId'] == 5 ? 8 : '5',
							"stoPoNo" => $fg_details_data->SAP_DOCUMENT,
							"overAllDeliveryQuantity" => $fg_details_data->OVERALL_DELIVERY_WT,
							"modifiedOn" => $CurrentDateTime,
							"delay_reason_id" => $json->delayreason,
						);
						$model->Gate_info_Status_Change($gate_in_info_id, $data);
						$model->addGateInOutHistory($json);
						foreach ($SAP_Line_Sto as $fg_details_data) {
							$to_plant_id=$model->PlantByID($fg_details_data->TO_PLANT);
								$sto_loading_info = array(
									"lineItem" => $fg_details_data->LINE_ITEM,
									"gateInOutInfoId" => $gate_in_info_id,
									"deliveryNumber" => $fg_details_data->DELIVERY_NO,
									"deliveryQty" => $fg_details_data->DELIVERY_QTY,
									"toMasterPlantId" => $to_plant_id[0]['ID'],
									"toStorageLocation"=> $fg_details_data->TO_STORAGE_LOC,
									"PgiCompletion"=> $fg_details_data->PGI_COMPLETION,
									"poNumber"=> $fg_details_data->SAP_DOCUMENT_ITEM,
									"moduleTypeId"=> 2,
									"moduleStatusId" => 0,
									"created_at"=>$CurrentDateTime,
									"created_by"=>$json->userInfoId,
								);							
							$model->Gate_info_sto_details_insert($sto_loading_info);
						}
					}
					if($gateInData[0]['moduleStatusId'] == 5){
						$success = false;
						$message = 'Status Already Updated';
					}else{
						$gate_info=$model->Gate_info_ByID($gate_in_info_id);
						$result = $SAP_Sales_Invoice;
						$success = true;
						$message = 'Delivery Created Successfully';
					}
				}				
			}
			if(count($SAP_Sales_Invoice) == 0 && $gateInData[0]['moduleTypeId'] != 43 && $gateInData[0]['moduleTypeId'] != 39){
				$success = false;
				$message = 'No Data Found';
			}else if($fg_detail_shipment && ($gateInData[0]['moduleTypeId'] == 43 || $gateInData[0]['moduleTypeId'] == 39)){
				if($Type == 'POST'){
					$data = array(
						"moduleStatusId" => 4,
						"waitingAt" => 5,
						"overAllDeliveryQuantity" => $fg_detail_shipment[0]->OVERALL_DELIVERY_WT,
						"modifiedOn" => $CurrentDateTime,
						"delay_reason_id" => $json->delayreason,
						"bagCount" => $json->bagcount,

					);
					$model->Gate_info_Status_Change($gate_in_info_id, $data);
					$model->addGateInOutHistory($json);
					$SAP_LINE = $fg_detail_shipment[0]->SAP_LINE;
					$shipmentDate = $fg_detail_shipment[0]->SHIPMENT_CREATION_DATE . ' ' . $fg_detail_shipment[0]->SHIPMENT_CREATION_TIME;
					foreach ($SAP_LINE as $delivery_info) {
						$gate_in_info_details = array(
						"gateInOutInfoId" => $gate_in_info_id,
						"invoiceNumber" => $delivery_info->INVOICE_NO,
						"deliveryNumber" => $delivery_info->DELIVERY_NO,
						"deliveryQty" => $delivery_info->DELIVERY_WT,
						"customerCode"=> $delivery_info->CUSTOMER_ID,
						"PgiCompletion"=> $delivery_info->PGI_COMPLETION,
						"moduleTypeId"=> 43,
						"customerName"=> $delivery_info->CUSTOMER_NAME,
						"created_at"=>$CurrentDateTime,
						"created_by"=>$json->userInfoId,
						"shipmentDate" => $shipmentDate ? date("Y-m-d H:i:s", strtotime($shipmentDate)) : null,
						);
						$model->Gate_info_details_insert($gate_in_info_id, $gate_in_info_details);
					}
					foreach ($json->MaterialDetails as $material_detail) {
					foreach ($material_detail->materials as $material_info) {
						$material_details = array(
						"gateInOutInfoId" => $gate_in_info_id,
						"material" => $material_info->material,
						"material_description" => $material_info->material_description,
						"materialQty" => $material_info->materialQty,
						"bagCount"=> $material_info->bagCount,
						"bagType"=> $material_info->bagType,
						"materialUOM"=> $material_info->materialUOM,
						"deliveryNo"=> $material_info->deliveryNo,
						"invoiceNo"=> $material_info->invoiceNo,
						"deliveryQty"=> $material_info->deliveryQty,
						"created_by"=>$json->userInfoId,
						'lineItem'=>$material_info->lineItem,
						'status'=>1
						);
						$model->salesMaterialDetailsInsert($gate_in_info_id, $material_details);
					}
					}						
				}else{
					$gate_info=$model->Gate_info_ByID($gate_in_info_id);
					$message = 'Shipment Created Successfully';
					$success = true;
					$fg_details_data_array = $fg_detail_shipment;
				}
				
			}
		}
		return $this->respond(["success" => $success,"message" => $message, "sap_data" => $result,"gate_info"=>$gate_info,"fg_details_data"=> $fg_details_data_array]);
    }

	public function WB_Details_Check()
	{
	    $json = $this->request->getJSON();
		$model = new LandingDataModel;
		$result = $model->WB_Details_Check($json->plant_id);
		return  $this->respond(["success" => 1, "results" => $result]);      
	}

	// FG STO Document Verify
    public function FGSto_DocumentVerify()
	{
		$postData = $this->request->getJSON();
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$currentDateTime = date("Y-m-d H:i:s");

		$getData = $gateService->getGateInInfo(0, 0, 0, $postData->gateInOutInfoId, $postData->userInfoId);
		$getInvoiceData = $gateService->getSapDeliveryDetails($postData->gateInOutInfoId);

		if (empty($getData)) {
			return $this->respond([
				"success" => false,
				"message" => "Gate In data not found"
			]);
		}

		$gateInOutInfoId = $getData[0]['gateInOutInfoId'];

		$urlPath = "zgatepro/zfg_sto_rec/GP_SAP_REC_GATE?sap-client=900";

		$sap_data = [
			"ZZTRANSACTION_TYPE" => $getData[0]['moduleType'],
			"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
			"ZZVA_NO" => $getData[0]['vaNumber'],
			"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
			"ZZPLANT" => $getData[0]['werks'],
			"ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'],
			"ZZPO_NO" => $getInvoiceData[0]['ZZPO_NO'] ?? '',
			"ZZREC_GATEIN" => $getData[0]['gateInDateStamp'],
			"ZZREC_FIRST_WEIGHT" => $getData[0]['firstWeight'],
			"ZZREC_SECOND_WEIGHT" => $getData[0]['secondWeight'],
			"ZZREC_NET_WEIGHT" => $getData[0]['netWeight'],
			"ZZREC_GATEOUT" => $getData[0]['gateOutDateStamp'],
			"ZZMIGODATE" => $currentDateTime,
			"sap_pr_info" => $getInvoiceData
		];

		$res = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));

		// ---------- SAP CONDITION CHECK ----------
		$success = true;
		$message = '';
		$migoNo  = null;

		if (empty($res) || !is_array($res)) {
			return $this->respond([
				"success" => false,
				"message" => "No response received from SAP. Please contact SAP Team"
			]);
		}

		foreach ($res as $row) {
			if (!isset($row->STATUS) || $row->STATUS == 0) {
				$success = false;
				$message = $row->MESSAGE ?? "SAP processing failed";
				break;
			}

			if (!empty($row->MIGO_NO)) {
				$migoNo = $row->MIGO_NO;
			}
		}

		// ---------- UPDATE DB ONLY ON SUCCESS ----------
		if ($success && $migoNo) {

			foreach ($res as $row) {
				$landingDataModel->updateMigoNumberByDelivery($row);
			}

			$landingDataModel->updateMigoNumber($gateInOutInfoId, [
				"migoNumber"    => $migoNo,
				"migoDate"      => $currentDateTime,
				"moduleStatusId"=> 10,
				"waitingAt"     => 8,
				"shipmentCopy"  => $postData->shipmentCopy
			]);

			return $this->respond([
				"success" => true,
				"message" => "Completed Successfully",
				"migoNumber" => $migoNo
			]);
		}

		// ---------- FAILURE RESPONSE ----------
		return $this->respond([
			"success" => false,
			"message" => $message . " Please contact SAP Team"
		]);
	}


	// FG Sales Return Document Verify		
	public function FGReturn_DocumentVerify(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$landingDataModel = new LandingDataModel();
		$masterService = new MasterService();
		$currentDateTime=date("Y-m-d H:i:s");		
		$Tripsheet_no = $json->tripSheetNumber;
		$Va_no = $json->vaNumber;
		$Type = $json->type;
		$moduleTypeId = $json->moduleTypeId;
		$confirmationStatus = $json->confirmationStatus;
		$urlPath ="zgatepro/zfg_sale_return/GP_SAP_FG_RETURN?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";		
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data, true);

		if($Type == 'GET'){				
			$result =  $res;
			$dataStatus = $result != [] ? true : false;
			$message = $result != [] ?  'Invoice Completed Successfully' : 'No data found';
		}
		else if($Type == 'POST'){
     	    if(isset($res[0]['TYPE'])){
				$data = array(
					"overAllDeliveryQuantity" => $res[0]['OVERALL_DELIVERY_QTY'],
					"salesReturnInvoiceNo" => $res[0]['SAP_LINE'][0]['INVOICE_NO'],
					"moduleStatusId" => $confirmationStatus == 1 ? 11 : 4,
					"waitingAt" => $confirmationStatus == 1 ? 8 : 5,
					"remarks" => $json->remarks,
					"modifiedBy" => $json->userInfoId,
				);
				$landingDataModel->updateMigoNumber($json->gateInOutInfoId, $data);

				if($confirmationStatus == 1){							
					$landingDataModel->updateFgSalesReturnDetails($json->fgSalesReturnInfoId);
				}				

				$sapLine = $res[0]['SAP_LINE'];

				foreach ($sapLine as $resultRow) {

					$return_delivery_info = array(
						"gateInOutInfoId" => $json->gateInOutInfoId,
						"moduleTypeId" => $moduleTypeId,
						"lineItem" => $resultRow['LINE_ITEM'],
						"invoiceNumber" => $resultRow['INVOICE_NO'],
						"invoiceQty" => $resultRow['INVOICE_QTY'],
						"deliveryNumber" => $resultRow['DELIVERY_NO'],
						"deliveryQty"=> $resultRow['DELIVERY_QTY'],
						"deliveryWeight"=> $resultRow['DELIVERY_WT'],
						"pgiCompletion"=> $resultRow['PGI_COMPLETION'],
						"itemDetails"=> json_encode($resultRow['ITEM']),
						"dateStamp"=> $currentDateTime,
					);					
					$landingDataModel->return_delivery_details($return_delivery_info);
				}
				$dataStatus = true;
				$message = 'Invoice Completed Successfully';

				if($dataStatus){
					$masterService->addGateInOutHistory($json->gateInOutInfoId, 4, $json->remarks, $json->userInfoId);
				}
			}			
		}	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result]);
	}	

	// Purchase Document Verify		
	public function Purchase_DocumentVerify(){
		$json = $this->request->getJSON(); 
		$documentDate = date("Y-m-d");
		$migoNo = $json->migoNo;
		$landingDataModel = new LandingDataModel();
		$urlPath ="ZMIGO_REV_GP/GatePro_MIGO_Reversal?sap-client=900&&Doc_Date=$documentDate";		
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data, true);

     	if(isset($res[0]['LINE_ITEM'])){
			$result =  $res;
			$dataStatus = $result != [] ? true : false;
			$message = $result != [] ? 'data found' : 'No data found';
					
		}	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// S&S PM Document Verify		
	public function SsAndPm_DocumentVerify(){
		$success = true;
		$json = $this->request->getJSON(); 
		$Va_no = $json->vaNumber;
		$Type = $json->type;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$movementTypeId = $json->movementTypeId;
		$userInfoId = $json->userInfoId;
		$CurrentDateTime=date("Y-m-d H:i:s");
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$urlPath ="zgatepro/zss_pm_del/Gatepro?sap-client=900&&VA_NO=$Va_no";
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data, true);

		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);
		$CurrentDateTime=date("Y-m-d H:i:s");		

		if(isset($res[0]['LINE'])){
			if($Type == 'GET'){
				$result =  $res;
				$dataStatus =  true;
				$message = 'Delivery Created Successfully';
			}
			else if($Type == 'POST'){	
				$data = array(
					"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : 4,
					"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : 5,
					"modifiedOn" => $CurrentDateTime,
				);
				$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);	
				$landingDataModel->addGateInOutHistory($json);			

				foreach ($res as $resultRow) {
					$toPlantId=$landingDataModel->PlantByID($resultRow['TO_PLANT']);

					$sto_loading_info = array(
						"lineItem" => $resultRow['LINE'],
						"gateInOutInfoId" => $gateInOutInfoId,
						"deliveryNumber" => $resultRow['DELIVERY_NO'],
						"deliveryQty" => $resultRow['DELIVERY_QTY'],
						"toMasterPlantId" => $toPlantId[0]['ID'],
						"toStorageLocation"=> $resultRow['TO_STO_LOCATION'],
						"PgiCompletion"=> $resultRow['PGI_FLAG'],
						"poNumber"=> $resultRow['PO_NUMBER'],
						"moduleTypeId"=> $resultRow['TYPE'] == 'SS-STO' ? 6 : 20,
						"moduleStatusId" => 0,
						"created_at"=>$CurrentDateTime,
						"created_by"=>$json->userInfoId,
					);							
					$landingDataModel->Gate_info_sto_details_insert($sto_loading_info);
					$landingDataModel->addGateInOutHistory($json);
				}
				$dataStatus = true;
				$message = 'Delivery Created Successfully';
			}			
		}
		else{
			$dataStatus = false;
			$message = 'No data found';
		}			
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// RM Sales Document Verify		
	public function RmSales_DocumentVerify(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$currentDateTime=date("Y-m-d H:i:s");
		$Va_no = $json->vaNumber;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$type = $json->type;

		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0); 	

		$urlPath ="zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900&va_no=$Va_no";
		$res = SapUrlHelper::getWhDatas($urlPath);
		$WB_Weight_Reverse = json_decode($res);
		
		if(count($WB_Weight_Reverse) > 0){
			$data = array(
				"moduleStatusId" => '2',
				"waitingAt" => '3',
				"modifiedOn" => $currentDateTime,
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$gate_info=$landingDataModel->Gate_info_ByID($gateInOutInfoId);
			$landingDataModel->addGateInOutHistory($json);
			$dataStatus = false;
			$message = 'Second Weight Rejected in SAP';
		}
		else if(count($WB_Weight_Reverse) == 0){
			$urlPath =  "zgatepro/zgp_rm_sal_inv/Gatepro?sap-client=900&&VA_NUMBER=$Va_no";
		    $res = SapUrlHelper::getWhDatas($urlPath);
			$Rm_Sales_Invoice = json_decode($res);
			$SAP_Line = $Rm_Sales_Invoice[0]->LINE_ITEM;
			
			if($type == 'POST') {
				$data = array(
					"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
					"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
					"modifiedOn" => $currentDateTime,
				);
				$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
				$landingDataModel->addGateInOutHistory($json);

				foreach ($SAP_Line as $deliveryInfo) {
					$gateInOutInfoDetails = array(
						"gateInOutInfoId" => $gateInOutInfoId,
						"invoiceNumber" => $deliveryInfo->INVOICE_NO,
						"deliveryNumber" => $deliveryInfo->DELIVERY_NO,
						"deliveryQty" => $deliveryInfo->DELIVERY_WT,
						"PgiCompletion"=> $deliveryInfo->PGI_FLAG,
						"customerCode"=> $Rm_Sales_Invoice[0]->CUSTOMER_CODE,
						"customerName"=> $Rm_Sales_Invoice[0]->CUSTOMER_NAME,
						"created_at"=>$currentDateTime,
						"created_by"=>$json->userInfoId,
					);
					$landingDataModel->Gate_info_details_insert($gateInOutInfoId, $gateInOutInfoDetails);
					$result = $Rm_Sales_Invoice;
					$dataStatus = true;
					$message = 'Invoice Completed Successfully';
				}						
			}else{				
				$result = $Rm_Sales_Invoice;
				$dataStatus = count($result) > 0 ? true : false;
				$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';								
			}			
		}		
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// Purchase Redirect Document Verify		
	public function redirectPurchaseDetails(){
		$json = $this->request->getJSON(); 
		$Va_no = $json->vaNumber;
		$landingDataModel = new LandingDataModel();
		$urlPath ="zgatepro/zsap_pp_gatepas/gatepass?sap-client=900&va_no=$Va_no&gatepass_no=";
		//http://10.10.63.139:50000/zgatepro/zsap_pp_gatepas/gatepass?sap-client=900&va_no=UG00124B09004&gatepass_no=	
		//print_r($urlPath);exit;
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data, true);

     	if(isset($res[0]['TYPE'])){
			$result =  $res;
			$dataStatus = $result != [] ? true : false;
			$message = $result != [] ? 'data found' : 'No data found';					
		}	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// Purchase Return Document Verify		
	public function PurchaseReturn_DocumentVerify(){
		$json = $this->request->getJSON(); 
		$Va_no = $json->vaNumber;
		$currentDateTime=date("Y-m-d H:i:s");
		$gateInOutInfoId = $json->gateInOutInfoId;
		$type = $json->type;
		$landingDataModel = new LandingDataModel();		
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);

		$urlPath ="zgatepro/zgp_puret/Gatepro?sap-client=900&&VA_NO=$Va_no";		
		$data = SapUrlHelper::getWhDatas($urlPath);
		$purchaseReturnDetails = json_decode($data);

		if($type == 'POST') {
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json);
			
			$result = $landingDataModel->PurchaseReturn_DocumentVerify($gateInOutInfoId, $purchaseReturnDetails); 

			$dataStatus = $result[0];
			$message = $result[1];			
		}
		else{
			$result =  $purchaseReturnDetails;
			$dataStatus = $result != [] ? true : false;
			$message = $result != [] ? 'Delivery Created Successfully' : 'No data found';
		}     		
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// GatePass Document Verify	
	public function GatePass_DocumentVerify(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$currentDateTime=date("Y-m-d H:i:s");
		$Va_no = $json->vaNumber;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$type = $json->type;
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);
		
		$urlPath ="zgatepro/zsap_pp_gatepas/gatepass?sap-client=900&va_no=$Va_no";
		$res = SapUrlHelper::getWhDatas($urlPath);
		$GatepassDeliveryDetails = json_decode($res);

		if($type == 'POST' && $gateInData[0]['moduleTypeId'] != 12 && $gateInData[0]['moduleTypeId'] != 15 && $gateInData[0]['moduleTypeId'] != 21 && $gateInData[0]['moduleTypeId'] != 25 && $gateInData[0]['moduleTypeId'] != 33 && $gateInData[0]['moduleTypeId'] != 34) {
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json); 
			
			$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails); 
			

			$dataStatus = $result[0];
			$message = $result[1];
		}
		else{
			$result = $GatepassDeliveryDetails;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}
		
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// GatePass Receipt Document Verify	
	public function GatePassReceipt_DocumentVeriyfy(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$currentDateTime=date("Y-m-d H:i:s");
		$Va_no = $json->vaNumber;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$type = $json->type;
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);
		
		$urlPath ="zgatepro/zsap_pp_gate_re/gatepass_rep?sap-client=900&va_no=$Va_no";  
		$res = SapUrlHelper::getWhDatas($urlPath);
		$GatepassDeliveryDetails = json_decode($res);	
		$loadingUnloadingInfoId = $gateInData[0]['loadingUnloadingInfoId'];

		if($type == 'POST') {
			if($gateInData[0]['moduleTypeId'] == 22 && $gateInData[0]['subModuleTypeId'] == 1 && ($gateInData[0]['userGateId'] == 19 || $gateInData[0]['userGateId'] == 17 || $gateInData[0]['userGateId'] == 18)){
				$urlPath ="zgatepro/zgp_gatepass/Gatepro?sap-client=900";
					$sap_data = array (        
						"va_number" => $gateInData[0]['vaNumber'],
						"truck_number" => $gateInData[0]['vehicleNo'],
						"driver_phone" => $gateInData[0]['driverMobileNumber'],
						"plant" => $gateInData[0]['werks'],
						"type" => 'Gatepass_Receipt',
						"gp_no" => $GatepassDeliveryDetails[0]->GATEPASS_NO,
						"first_weight" => $gateInData[0]['firstWeight'],
						"second_weight" => $gateInData[0]['secondWeight'],
						"net_weight" => $gateInData[0]['netWeight'],
						"gatein_time"=> $gateInData[0]['gateInDateStamp'],
						"gateout_time" => $currentDateTime,
						"remarks" => $gateInData[0]['remarks'],
						"zzrec_plant" => '',
						"METHOD" => "PUT"
				);
				$res1 = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
				if(($res1[0]->STATUS) == 0){
					$dataStatus = false;
					$message = $res[0]->MESSAGE;
	
					// return array($dataStatus, "$message, Please Contact SAP Team");
					return  $this->respond(["success" => $dataStatus, "message" => "$message, Please Contact SAP Team", "results" => '']);

				}else{
				$data = array(
					"moduleStatusId" => '5',
					"waitingAt" => '8',
					"modifiedOn" => $currentDateTime,
					"gateOutDateStamp" => $currentDateTime,
					"gateInDateStamp" => $gateInData[0]['createdOn'],
			 	);
			}
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json);
			
			$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails, $loadingUnloadingInfoId ); 

			$dataStatus = $result[0];
			$message = $result[1];
		}else{
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json);
			
			$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails, $loadingUnloadingInfoId ); 

			$dataStatus = $result[0];
			$message = $result[1];
		    }
		}
		else{
			$result = $GatepassDeliveryDetails;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}
		
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// Scrap Sales DocumentVerify       
    public function ScrapSales_DocumentVerify(){
        $json = $this->request->getJSON(); 
        $Va_no = $json->vaNumber;
		$type = $json->type;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$currentDateTime=date("Y-m-d H:i:s");
        $landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);

        $urlPath ="zgatepro/zgp_rm_sal_inv/Gatepro?sap-client=900&&VA_NUMBER=$Va_no";       
        $data = SapUrlHelper::getWhDatas($urlPath);
        $res = json_decode($data);            
     
		if($type == 'POST') {
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);	
			$landingDataModel->addGateInOutHistory($json);		

			$sapLine = $res[0]->LINE_ITEM;		
			
			foreach ($sapLine as $deliveryInfo) {

				$gateInOutInfoDetails = array(
				"gateInOutInfoId" => $gateInOutInfoId,
				"invoiceNumber" => $deliveryInfo->INVOICE_NO,
				"deliveryNumber" => $deliveryInfo->DELIVERY_NO,
				"deliveryQty" => $deliveryInfo->DELIVERY_WT,
				"PgiCompletion"=> $deliveryInfo->PGI_FLAG,
				"customerCode"=> $res[0]->CUSTOMER_CODE,
				"customerName"=> $res[0]->CUSTOMER_NAME,
				"created_at"=>$currentDateTime,
				"created_by"=>$json->userInfoId,
				);
				$landingDataModel->Gate_info_details_insert($gateInOutInfoId, $gateInOutInfoDetails);
				$dataStatus = true;
            	$message = "Delivery Created Successfully";
			}			
		}
		else{
			$result = $res;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }

	// Scrap Sto Document Verify       
    public function ScrapSto_DocumentVerify(){
        $json = $this->request->getJSON(); 
        $Va_no = $json->vaNumber;
		$type = $json->type;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$currentDateTime=date("Y-m-d H:i:s");
        $landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);

        $urlPath ="zgatepro/zss_pm_del/Gatepro?sap-client=900&&VA_NO=$Va_no";       
        $data = SapUrlHelper::getWhDatas($urlPath);
        $res = json_decode($data);

		if($type == 'POST') {

			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"stoPoNo" => $res[0]->PO_NUMBER,
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json);
			
			foreach ($res as $stoDetailsData) {

				$toPlantId=$landingDataModel->PlantByID($stoDetailsData->TO_PLANT);

					$stoLoadingInfo = array(
						"lineItem" => $stoDetailsData->LINE,
						"gateInOutInfoId" => $gateInOutInfoId,
						"poNumber" => $stoDetailsData->PO_NUMBER,
						"deliveryNumber" => $stoDetailsData->DELIVERY_NO,
						"deliveryQty" => $stoDetailsData->DELIVERY_QTY,
						"toStorageLocation"=> $stoDetailsData->TO_STO_LOCATION,
						"toMasterPlantId" => $toPlantId[0]['ID'],
						"PgiCompletion"=> $stoDetailsData->PGI_FLAG,
						"moduleStatusId" => 0,
						"created_at"=>$currentDateTime,
						"created_by"=>$json->userInfoId,							
					);
					
				$landingDataModel->Gate_info_sto_details_insert($stoLoadingInfo);
				$dataStatus = true;
            	$message = "Delivery Created Successfully";
			}			
		}
		else{
			$result = $res;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }	

	// GoodsMovement Document Verify       
	public function GoodsMovement_DocumentVerify(){
		$json = $this->request->getJSON(); 
		$Va_no = $json->vaNumber;
		$type = $json->type;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$currentDateTime=date("Y-m-d H:i:s");
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);

		$urlPath ="zgatepro/zgp_pm_migo_det/Gatepro?sap-client=900&&VA_NO=$Va_no";       
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data);

		if($type == 'POST') {

			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"stoPoNo" => $res[0]->MIGO_NO,
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			$landingDataModel->addGateInOutHistory($json);

			$lineItem = $res[0]->LINE_ITEM;
			
			foreach ($lineItem as $stoDetailsData) {

				$toPlantId=$landingDataModel->PlantByID($stoDetailsData->PLANT);

					$stoLoadingInfo = array(
						"lineItem" => $stoDetailsData->LINE,
						"gateInOutInfoId" => $gateInOutInfoId,
						"poNumber" => $stoDetailsData->MIGO_NO,
						"deliveryNumber" => $stoDetailsData->MIGO_NO,
						"deliveryQty" => $stoDetailsData->QUANTITY,
						"toStorageLocation"=> '',
						"toMasterPlantId" => $toPlantId[0]['ID'],
						"PgiCompletion"=> 'C',
						"migoNumber"=> $stoDetailsData->MIGO_NO,
						"migoDate"=> $currentDateTime,
						"moduleStatusId" => 0,	
						"moduleTypeId" => 26,
						"created_at"=>$currentDateTime,
						"created_by"=>$json->userInfoId,							
					);
					
				$landingDataModel->Gate_info_sto_details_insert($stoLoadingInfo);
				$dataStatus = true;
				$message = "Delivery Created Successfully";					
			}
		}
		else{
			$result = $res;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	// FG Document Verify       
	public function FGInvoice_DocumentVerify(){
		$json = $this->request->getJSON(); 
		$invoiceDetails = $json->invoiceList;
		$type = $json->type;
		$gateInOutInfoId = $json->gateInOutInfoId;
		$currentDateTime=date("Y-m-d H:i:s");
		$landingDataModel = new LandingDataModel();
		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, 0);

		if($type == 'POST') {

			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);
			
			foreach ($invoiceDetails as $delivery_info) {
				$gate_in_out_info_details = array(
				"gateInOutInfoId" => $gateInOutInfoId,
				"invoiceNumber" => $delivery_info->INVOICE_NO,
				"deliveryNumber" => $delivery_info->DELIVERY_NO,
				"deliveryQty" => $delivery_info->DELIVERY_QTY,							
				"PgiCompletion"=> $delivery_info->PGI_COMPLETION,
				"moduleTypeId"=> $json->moduleTypeId ?? 1,
				"customerCode"=> $delivery_info->CUSTOMER_ID,
				"customerName"=> $delivery_info->CUSTOMER_NAME,
				"isManual" => $delivery_info->isManual ?? 0,
				"created_at"=>$currentDateTime,
				"created_by"=>$json->userInfoId,
				);
				$result = $landingDataModel->Gate_info_details_insert($gateInOutInfoId, $gate_in_out_info_details);
				$dataStatus = true;
				$message = "Delivery Created Successfully";		
			}
		}		

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	// GatePass Details Add Verify	
	public function GatePass_Add(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$gateInOutInfoId = $json->gateInOutInfoId;
		$GatepassDeliveryDetails  = $json->GatepassDeliveryDetails;		
		$landingDataModel = new LandingDataModel();
			$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails); 
			

			$dataStatus = 1;
			$message = 'Added Successfully';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function FGSalesNLDV_DocumentVerify()
	{
		$json = $this->request->getJSON();
		$gate_in_info_id = $json->gateInOutInfoId;
		$CurrentDateTime=date("Y-m-d H:i:s");
		$model = new LandingDataModel;
		foreach ($json->contractorPersonDetails as $delivery_info) {
			// print_r($delivery_info);exit;
			$gate_in_info_details = array(
			"gateInOutInfoId" => $gate_in_info_id,
			"invoiceNumber" => $delivery_info->personName,
			"deliveryNumber" => 0,
			"deliveryQty" => 0,
			"customerCode"=> '',
			"PgiCompletion"=> '',
			"moduleTypeId"=> $delivery_info->moduleTypeId,
			"customerName"=> '',
			"status"=> 0,
			"created_by"=> $delivery_info->userInfoId,
			"created_at"=> $CurrentDateTime,
			);
			$result = $model->Gate_info_insert($gate_in_info_details);
		}
		$data = array(
			"moduleStatusId" => '4',
			"waitingAt" => '5',
			"modifiedOn" => $CurrentDateTime,
		);
		$model->addGateInOutHistory($json);
		$model->Gate_info_Status($gate_in_info_id,$data,$json->contractorPersonDetails[0]->personName);
		$success = true;
		$message = 'Added Successfully';
		return $this->respond(["success" => $success,"message" => $message, "sap_data" => $result]);
    }

	public function FGSaleMaterialDetailsGet($id){
        $model = new LandingDataModel();
        $res = $model->FGSaleMaterialDetailsGet($id);
        return  $this->sendSuccessResult($res);
    }
	public function FGSaleMaterialDelete($id,$user_id){
        $model = new LandingDataModel();
        $res = $model->FGSaleMaterialDelete($id,$user_id);
        return  $this->sendSuccessResult($res);
    }

	public function PoDetailsFetch($loadingUnloadingInfoId)
	{
		$gateService = new LandingDataModel();
		$results = $gateService->PoDetailsFetch($loadingUnloadingInfoId);

		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function DeliveryGenerate()
	{
		$gateService = new LandingDataModel();
		$json = $this->request->getJSON();
		$results = $gateService->DeliveryGenerate($json);
		$dataStatus = $results[0] > 0 ? true : false;
		$message = $results[1];

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	public function UpdateMigo()
	{
		$gateService = new LandingDataModel();
		$json = $this->request->getJSON();
		$results = $gateService->UpdateMigo($json);
		$dataStatus = $results[0] > 0 ? true : false;
		$message = $results[1];

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
}
