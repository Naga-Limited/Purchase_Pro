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
		// print_r($json);exit;
		$gate_in_info_id = $json->gateInInfoId;
		$Shipment_No = $json->shipmentOrderNo;
		$Tripsheet_no=$json->tripSheetNumber;
		$Va_no=$json->vaNumber;
		$Type = $json->Type;
		$CurrentDateTime=date("Y-m-d H:i:s");

		$gateService = new GateService();
		$gateInData = $gateService->getGateInInfo(0, 0, 0, $gate_in_info_id, 0); 		

		$model = new LandingDataModel;
		$urlPath = "zgatepro/zwb_reject/sap_GP_WB_Reject?sap-client=900&va_no=$Va_no";
		$res = SapUrlHelper::getWhDatas($urlPath);
		$WB_Weight_Reverse = json_decode($res);

		$fg_detail = "/zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";
		$fg_details = SapUrlHelper::getWhDatas($fg_detail);
		$fg_details_data = json_decode($fg_details);
		
		if(count($fg_details_data) > 0 && $fg_details_data[0]->FROM_PLANT) {
			if($fg_details_data[0]->TYPE == 'FG-Sales'){
				$sapDocument = 'shipmentOrderNo';
			}else {
				$sapDocument = 'stoPoNo';
			}
			$plant_id=$model->PlantByID($fg_details_data[0]->FROM_PLANT);
				$data = array(
					"moduleType" => $fg_details_data[0]->TYPE == 'FG-Sales'? 1 : 2,
					"masterPlantId" => $plant_id[0]['ID'],
					$sapDocument => $fg_details_data[0]->SAP_DOCUMENT
				);
			$model->Gate_info_Status_Change($gate_in_info_id, $data);
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
			
			if(count($SAP_Sales_Invoice) > 0 && $fg_details_data[0]->TYPE == 'FG-Sales') {
					if($Type == 'POST') {
						$data = array(
							"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
					        "waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
							"overAllDeliveryQuantity" => $fg_details_data[0]->OVERALL_DELIVERY_WT,
							"modifiedOn" => $CurrentDateTime,
						);
						$model->Gate_info_Status_Change($gate_in_info_id, $data);
						foreach ($SAP_Line as $delivery_info) {
							$gate_in_info_details = array(
							"gateInOutInfoId" => $gate_in_info_id,
							"invoiceNumber" => $delivery_info->INVOICE_NO,
							"deliveryNumber" => $delivery_info->DELIVERY_NO,
							"deliveryQty" => $delivery_info->DELIVERY_WT,
							// "DELIVERY_WT"=> $delivery_info->DELIVERY_WT,
							"PgiCompletion"=> $delivery_info->PGI_COMPLETION,
							// "INVOICE_QTY"=> $delivery_info->INVOICE_QTY,
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
					
				}else if($fg_details_data[0]->TYPE == 'FG-STO'){
					if($Type == 'POST'){
						$SAP_Line_Sto = $fg_details_data[0]->SAP_LINE;

						$data = array(
							"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
					        "waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
							"stoPoNo" => $fg_details_data[0]->SAP_DOCUMENT,
							"overAllDeliveryQuantity" => $fg_details_data[0]->OVERALL_DELIVERY_WT,
							"modifiedOn" => $CurrentDateTime,
						);
					$model->Gate_info_Status_Change($gate_in_info_id, $data);
					foreach ($SAP_Line_Sto as $fg_details_data) {
						$to_plant_id=$model->PlantByID($fg_details_data->TO_PLANT);

							$sto_loading_info = array(
							"lineItem" => $fg_details_data->LINE_ITEM,
							"gateInOutInfoId" => $gate_in_info_id,
							"deliveryNumber" => $fg_details_data->DELIVERY_NO,
							"deliveryQty" => $fg_details_data->DELIVERY_WT,
							"toMasterPlantId" => $to_plant_id[0]['ID'],
							"toStorageLocation"=> $fg_details_data->TO_STORAGE_LOC,
							"PgiCompletion"=> $fg_details_data->PGI_COMPLETION,
							"poNumber" => $fg_details_data->SAP_DOCUMENT_ITEM,
							"moduleStatusId" => 0
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
				else{
					$success = false;
					$message = 'No Data Found';
				}
		}
		return $this->respond(["success" => $success,"message" => $message, "sap_data" => $result,"gate_info"=>$gate_info,"fg_details_data"=>$fg_details_data]);
    }

	public function WB_Details_Check()
	{
	    $json = $this->request->getJSON();
		$model = new LandingDataModel;
		$result = $model->WB_Details_Check($json->plant_id);
		return  $this->respond(["success" => 1, "results" => $result]);      
	}

	// FG STO Document Verify
    public function FGSto_DocumentVerify() {
		$success = true;
		$message='Please Contact Admin';
        $postData = $this->request->getJSON();    
        $landingDataModel = new LandingDataModel();
        $gateService = new GateService();
		$currentDateTime=date("Y-m-d H:i:s");		
		
        $getData = $gateService->getGateInInfo(0, 0, 0, $postData->gateInOutInfoId, $postData->userInfoId);
		$getInvoiceData = $gateService->getSapDeliveryDetails($postData->gateInOutInfoId);

		$gateInOutInfoId = $getData[0]['gateInOutInfoId'];

		$urlPath ="zgatepro/zfg_sto_rec/GP_SAP_REC_GATE?sap-client=900";

		$sap_data = array (
			"ZZTRANSACTION_TYPE" => $getData[0]['moduleType'],
			"ZZTRUCK_NO" => $getData[0]['vehicleNo'],
			"ZZVA_NO" => $getData[0]['vaNumber'],
			"ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
			"ZZPLANT" => $getData[0]['werks'],
			"ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'],
			"ZZPO_NO" => $getInvoiceData[0]['ZZPO_NO'],
			"ZZREC_GATEIN" => $getData[0]['gateInDateStamp'],
			"ZZREC_FIRST_WEIGHT" => $getData[0]['firstWeight'],
			"ZZREC_SECOND_WEIGHT" => $getData[0]['secondWeight'],
			"ZZREC_NET_WEIGHT" => $getData[0]['netWeight'],
			"ZZREC_GATEOUT"=>$getData[0]['gateOutDateStamp'],
			"ZZMIGODATE" => $currentDateTime,
			"sap_pr_info" => $getInvoiceData
		);

		$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));		

		foreach($res as $resultRow){
			if($resultRow->STATUS == 0){
						// print_r($resultRow->MESSAGE);exit;	
				$message = $resultRow->MESSAGE;
				$success = false;	
				return $success;				
			}			
		}


		if($success == true){
	
			foreach($res as $resultRow){			
				$landingDataModel->updateMigoNumberByDelivery($resultRow);		
			}
			$data = array(
				"migoNumber" => $res[0]->MIGO_NO,
				"migoDate" => $currentDateTime,
				"moduleStatusId" => 10,
				"waitingAt" => 8,
				"shipmentCopy" => $postData->shipmentCopy
			);
			$landingDataModel->updateMigoNumber($gateInOutInfoId, $data);

			$message = "Completed Successfully";
		}
		else{
			$message = $message;
			return $this->sendErrorResult("$message");
		}	
		return $this->respond(["success" => $success,"message" => $message, "migoNumber" => $res[0]->MIGO_NO]);
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
					"moduleStatusId" => 4,
					"waitingAt" => 5,
					"remarks" => $json->remarks,
					"modifiedBy" => $json->userInfoId,
				);
				$landingDataModel->updateMigoNumber($json->gateInOutInfoId, $data);

				$sapLine = $res[0]['SAP_LINE'];

				foreach ($sapLine as $resultRow) {

					$return_delivery_info = array(
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
						"moduleStatusId" => 0							
					);							
					$landingDataModel->Gate_info_sto_details_insert($sto_loading_info);
				}
				$dataStatus = true;
				$message = 'Delivery Completed Successfully';
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

				foreach ($SAP_Line as $deliveryInfo) {
					$gateInOutInfoDetails = array(
						"gateInOutInfoId" => $gateInOutInfoId,
						"invoiceNumber" => $deliveryInfo->INVOICE_NO,
						"deliveryNumber" => $deliveryInfo->DELIVERY_NO,
						"deliveryQty" => $deliveryInfo->DELIVERY_WT,
						"PgiCompletion"=> $deliveryInfo->PGI_FLAG,
						"customerCode"=> $Rm_Sales_Invoice[0]->CUSTOMER_CODE,
						"customerName"=> $Rm_Sales_Invoice[0]->CUSTOMER_NAME,
					);

					$landingDataModel->Gate_info_details_insert($gateInOutInfoId, $gateInOutInfoDetails);
					$result = $Rm_Sales_Invoice;
					$dataStatus = true;
					$message = 'Invoice Completed Successfully';
				}						
			}else{				
				$result = $Rm_Sales_Invoice;
				$dataStatus = count($result) > 0 ? true : false;
				$message = count($result) > 0 ? 'Shipment Created Successfully' : 'No data found';								
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

		if($type == 'POST') {
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);	
			
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
		$loadingUnloadingInfoId = $gateInData[0]['loadingUnloadingInfoId'];
		$urlPath ="zgatepro/zsap_pp_gate_re/gatepass_rep?sap-client=900&va_no=$Va_no";  
		$res = SapUrlHelper::getWhDatas($urlPath);
		$GatepassDeliveryDetails = json_decode($res);		

		if($type == 'POST') {
			$data = array(
				"moduleStatusId" => $gateInData[0]['moduleStatusId'] == 5 ? 5 : '4',
				"waitingAt" => $gateInData[0]['moduleStatusId'] == 5 ? 8 : '5',
				"modifiedOn" => $currentDateTime
			);
			$landingDataModel->Gate_info_Status_Change($gateInOutInfoId, $data);	
			
			//$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails); 
			$result = $landingDataModel->gatepass_delivery_info($gateInOutInfoId, $GatepassDeliveryDetails, $loadingUnloadingInfoId );
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
				);
				$landingDataModel->Gate_info_details_insert($gateInOutInfoId, $gateInOutInfoDetails);
				$dataStatus = true;
            	$message = "Delivery Completed Successfully";
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
						"moduleStatusId" => 0							
					);
				$landingDataModel->Gate_info_sto_details_insert($stoLoadingInfo);
				$dataStatus = true;
            	$message = "Delivery Completed Successfully";
			}			
		}
		else{
			$result = $res;
			$dataStatus = count($result) > 0 ? true : false;
			$message = count($result) > 0 ? 'Delivery Created Successfully' : 'No data found';
		}

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }
     public function migoConfirmationDetails(){
		//print_r('hgj');exit;
		include_once APIPATH . "/db_connection.php";

		$gateService = new GateService();
		$gateInData = $gateService->getMigoConfirmationVehicleDetails();		

		foreach ($gateInData as $resultRow) {

			$vaNumber = $resultRow['vaNumber'];				
			$id= $resultRow['id'];			
			$load_id = $resultRow['loadingUnloadingInfoId'];
			$urlPath ="zgatepro/zgp_pm_migo_det/Gatepro?sap-client=900&&VA_NO=$vaNumber";
			$sapResult = SapUrlHelper::getWhDatas($urlPath);
			$array = json_decode($sapResult);

			foreach ($array as $resultRow) {

				foreach ($resultRow->LINE_ITEM as $lineItem) {
				
					$usqls1 = "SELECT id FROM gate_in_out_info WHERE vaNumber = '$vaNumber' AND movementType = 1";
					$result = mysqli_query($connect, $usqls1);
					$Fetch = mysqli_fetch_assoc($result);
					$gateInOutInfoId = $Fetch['id'];
					//print_r($gateInOutInfoId);exit;
					$usqls2 = "SELECT moduleType,loadingUnloadingInfoId FROM gate_in_out_info WHERE vaNumber = '$vaNumber' AND moduleType in (12,15,21,16)";
					$result = mysqli_query($connect, $usqls2);
					$Fetch = mysqli_fetch_assoc($result);

					//$gateInOutInfoId = $Fetch['id'];
					$moduleTypeId = $Fetch['moduleType'];
					$loadingUnloadingInfoId = $Fetch['loadingUnloadingInfoId'];
					//$currentDate=date("Y-m-d");
		                        $currentDate=date("Y-m-d H:i:s");
		                       // print_r($gateInOutInfoId);exit;
					if($gateInOutInfoId > 0 || $loadingUnloadingInfoId > 0) {				
						if($moduleTypeId == 12 || $moduleTypeId == 15 || $moduleTypeId == 21 || $moduleTypeId == 16){
							$usql = "UPDATE purchase_order SET migoNumber='$lineItem->MIGO_NO', migoDate='$currentDate' WHERE poNumber='$lineItem->PO' and loadingUnloadingInfoId = '$loadingUnloadingInfoId' and migoNumber IS NULL";
						}else{
							$usql = "UPDATE sto_loading_info SET migoNumber='$lineItem->MIGO_NO', migoDate ='$currentDate' WHERE deliveryNumber='$lineItem->DELIVERY' and migoNumber = 0 and gateInOutInfoId ='$gateInOutInfoId' ";														
						}
						//print_r($usql);exit;
						$res = mysqli_query($connect, $usql);

						if($moduleTypeId == 12 || $moduleTypeId == 15 || $moduleTypeId == 21 || $moduleTypeId == 16){
							$usqls = "SELECT COUNT(*) AS getExistCount FROM purchase_order WHERE loadingUnloadingInfoId=$loadingUnloadingInfoId and migoNumber IS NULL";
						}else{
							$usqls = "SELECT COUNT(*) AS getExistCount FROM sto_loading_info WHERE gateInOutInfoId='$gateInOutInfoId' and migoNumber = 0";
						}
						//print_r($usqls);exit;
						$result = mysqli_query($connect, $usqls);
						$Fetch = mysqli_fetch_assoc($result);
						$getExistCount = $Fetch['getExistCount'];
						
						if($getExistCount == 0){
							$usql = "UPDATE gate_in_out_info SET moduleStatusId=10, waitingAt = 8 WHERE  vaNumber = '$vaNumber' AND movementType = 2";
							//print_r($usql);exit;
							$res = mysqli_query($connect, $usql);
						}
					}
					 else{
						$res = false;
					}
				}
			}
		}			
		return json_encode(["success" => 1, "results" =>  $res]);
	}
}
