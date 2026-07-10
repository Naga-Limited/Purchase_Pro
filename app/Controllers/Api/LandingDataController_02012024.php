<?php

namespace App\Controllers\Api;

use App\Helpers\SapUrlHelper;
use App\Models\LandingDataModel;
use App\Models\GatePro\GateService;

class LandingDataController extends BaseApiController
{
	public function Loading_Data()
	{
	    $json = $this->request->getJSON();
		// $SessionUser=$_SESSION;
		// print_r($SessionUser);exit;
		$VEHICLE_STATUS = '5,15';
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
		$VEHICLE_STATUS = '5,15';
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
		//print_r($WB_Weight_Reverse);exit;
		$fg_detail = "/zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";
		$fg_details = SapUrlHelper::getWhDatas($fg_detail);
		$fg_details_data = json_decode($fg_details);
		
		if(count($fg_details_data) > 0 && $fg_details_data[0]->FROM_PLANT != '') {
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
			"ZZPO_NO" => $getData[0]['stoPoNo'],
			"ZZREC_GATEIN" => $getData[0]['gateInDateStamp'],
			"ZZREC_FIRST_WEIGHT" => $getData[0]['firstWeight'],
			"ZZREC_SECOND_WEIGHT" => $getData[0]['secondWeight'],
			"ZZREC_NET_WEIGHT" => $getData[0]['netWeight'],
			"ZZREC_GATEOUT"=>$getData[0]['gateOutDateStamp'],
			"ZZMIGODATE" => $currentDateTime,
			"sap_pr_info" => $getInvoiceData
		);	

		$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

		$message = $res[0]->MESSAGE;

		if($res[0]->STATUS == 0){			
			return $this->sendErrorResult("$message Please Contact SAP Team");

		}else if(($res[0]->STATUS) > 0 && strlen($res[0]->MIGO_NO) > 0){
			$data = array(
				"migoNumber" => $res[0]->MIGO_NO,
				"moduleStatusId" => 10,
				"migoDate"=>$currentDateTime,
				"waitingAt" => 8
			);
			$landingDataModel->updateMigoNumber($gateInOutInfoId, $data);

			$success = true;
			$message = 'Completed Successfully';
		}
		return $this->respond(["success" => $success,"message" => $message, "migoNumber" => $res[0]->MIGO_NO]);
	}

	// FG Sales Return Document Verify		
	public function FGReturn_DocumentVerify(){
		$json = $this->request->getJSON(); 
		// $Va_no = "RMSDTR312300001402";
		$Tripsheet_no = $json->tripSheetNumber;
		$Va_no = $json->vaNumber;
		$urlPath ="zgatepro/zfg_sale_return/GP_SAP_FG_RETURN?sap-client=900&Tripsheet_no=$Tripsheet_no&Va_no=$Va_no";		
		$data = SapUrlHelper::getWhDatas($urlPath);
		$res = json_decode($data, true);

     	if(isset($res[0]['TYPE'])){
			$result =  $res;
		}	

		$dataStatus = $result != [] ? true : false;
		$message = $result != [] ? 'Invoice Completed Successfully' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result]);
	}	
}
